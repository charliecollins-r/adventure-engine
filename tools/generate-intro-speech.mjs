#!/usr/bin/env node
/**
 * Voice the intro cinematic's lines (setting.intro_scenes) with ElevenLabs text-to-speech.
 *
 * Finds every intro line that has no "voice" yet (optionally only one style), generates an MP3 for it,
 * saves it in the scenario's intro/audio/ folder as <style>_NN.mp3, and writes the "voice" path back
 * into scenario.json. Lines that already have a voice are left alone (pass --force to redo them).
 * Only text-to-speech is used, so a free account with TTS access is enough.
 *
 * Run it on your own machine; the key is read from the environment and never written anywhere:
 *
 *   export ELEVENLABS_API_KEY=...            # Windows PowerShell: $env:ELEVENLABS_API_KEY="..."
 *   node tools/generate-intro-speech.mjs scenarios/the-harvest --list-voices
 *   node tools/generate-intro-speech.mjs scenarios/the-harvest --style radio --voice <voice_id> --dry-run
 *   node tools/generate-intro-speech.mjs scenarios/the-harvest --style radio --voice <voice_id>
 *
 * Options:
 *   --style <s>        narration | radio | card (default: every unvoiced line)
 *   --voice <id>       ElevenLabs voice ID (required unless --list-voices / --dry-run)
 *   --model <id>       default eleven_multilingual_v2
 *   --stability <n>    0..1, default 0.5 (radio lines that sound urgent: try 0.35)
 *   --similarity <n>   0..1, default 0.8
 *   --style-exaggeration <n>  0..1, default 0.15
 *   --force            also redo lines that already have a voice
 *   --dry-run          print what would be generated (with character counts) and stop
 *   --list-voices      print the voices on your account and stop
 */
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const folder = args[0] && !args[0].startsWith('--') ? args[0] : null;
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const flag = (name) => args.includes(`--${name}`);
const KEY = process.env.ELEVENLABS_API_KEY;
const API = 'https://api.elevenlabs.io/v1';

if (!folder) { console.error('Usage: node tools/generate-intro-speech.mjs <scenario-folder> [--style radio] --voice <id> [--dry-run]'); process.exit(1); }

if (flag('list-voices')) {
  if (!KEY) { console.error('Set ELEVENLABS_API_KEY first.'); process.exit(1); }
  const r = await fetch(`${API}/voices`, { headers: { 'xi-api-key': KEY } });
  if (!r.ok) { console.error(`ElevenLabs said ${r.status}: ${await r.text()}`); process.exit(1); }
  for (const v of (await r.json()).voices) console.log(`${v.voice_id}  ${v.name}${v.labels ? '  ' + Object.values(v.labels).join(', ') : ''}`);
  process.exit(0);
}

const file = path.join(folder, 'scenario.json');
const scenario = JSON.parse(fs.readFileSync(file, 'utf8'));
const scenes = scenario.setting?.intro_scenes || [];
const style = opt('style');
const jobs = [];
const counters = {};
scenes.forEach((scene, si) => (scene.lines || []).forEach((line, li) => {
  const s = line.style || 'narration';
  counters[s] = (counters[s] || 0) + 1;
  if (style && s !== style) return;
  if (line.voice && !flag('force')) return;
  const rel = line.voice || `intro/audio/${s === 'narration' ? 'narr' : s}_${String(counters[s]).padStart(2, '0')}.mp3`;
  jobs.push({ si, li, line, rel, text: line.text.replace(/\n+/g, ' ').trim() });
}));

if (!jobs.length) { console.log('Nothing to generate: every matching line already has a voice (use --force to redo).'); process.exit(0); }
const chars = jobs.reduce((n, j) => n + j.text.length, 0);
for (const j of jobs) console.log(`scene ${j.si + 1} line ${j.li + 1} -> ${j.rel}  (${j.text.length} chars)\n    ${j.text}`);
console.log(`\n${jobs.length} line(s), ${chars} characters.`);
if (flag('dry-run')) process.exit(0);

const voice = opt('voice');
if (!KEY) { console.error('Set ELEVENLABS_API_KEY first.'); process.exit(1); }
if (!voice) { console.error('Pass --voice <id> (see --list-voices).'); process.exit(1); }

const body = (text) => JSON.stringify({
  text,
  model_id: opt('model', 'eleven_multilingual_v2'),
  voice_settings: {
    stability: Number(opt('stability', 0.5)),
    similarity_boost: Number(opt('similarity', 0.8)),
    style: Number(opt('style-exaggeration', 0.15)),
  },
});

for (const j of jobs) {
  const r = await fetch(`${API}/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body: body(j.text),
  });
  if (!r.ok) { console.error(`\n${j.rel}: ElevenLabs said ${r.status}: ${await r.text()}\nStopped; lines saved so far are kept.`); save(); process.exit(1); }
  const out = path.join(folder, j.rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
  scenes[j.si].lines[j.li].voice = j.rel;
  console.log(`saved ${j.rel}`);
}
save();
console.log('\nDone. scenario.json now points each line at its clip.');

function save() {
  // canonical format: 2-space indent with [x, y] pairs on one line (matches the repo's other tools)
  const text = JSON.stringify(scenario, null, 2).replace(/\[\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*\]/g, '[$1, $2]');
  fs.writeFileSync(file, text + '\n');
}
