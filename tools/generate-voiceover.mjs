#!/usr/bin/env node

/**
 * ElevenLabs voiceover generator for Adventure Engine scenarios.
 *
 * Extracts all player-facing narrative text from a scenario JSON,
 * calls the ElevenLabs TTS API, and saves MP3 files into the
 * scenario's audio/voice/ folder.
 *
 * Usage:
 *   node tools/generate-voiceover.mjs <scenario-folder> [options]
 *
 * Options:
 *   --dry-run          List all text that would be generated, don't call API
 *   --voice <id>       ElevenLabs voice ID (default: env ELEVENLABS_VOICE_ID)
 *   --model <id>       ElevenLabs model  (default: eleven_monolingual_v1)
 *   --stability <n>    Voice stability 0-1 (default: 0.5)
 *   --similarity <n>   Similarity boost 0-1 (default: 0.75)
 *   --filter <type>    Only generate a specific category: intro, ambient,
 *                      message, dialogue, gameover, hint
 *   --force            Re-generate files that already exist on disk
 *   --list-voices      Fetch and print available voices, then exit
 *
 * Environment:
 *   ELEVENLABS_API_KEY   (required for generation)
 *   ELEVENLABS_VOICE_ID  (fallback when --voice is not passed)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const flags = {};
const positional = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dry-run') { flags.dryRun = true; continue; }
  if (args[i] === '--force')   { flags.force = true; continue; }
  if (args[i] === '--list-voices') { flags.listVoices = true; continue; }
  if (args[i] === '--voice')      { flags.voice = args[++i]; continue; }
  if (args[i] === '--model')      { flags.model = args[++i]; continue; }
  if (args[i] === '--stability')  { flags.stability = parseFloat(args[++i]); continue; }
  if (args[i] === '--similarity') { flags.similarity = parseFloat(args[++i]); continue; }
  if (args[i] === '--filter')     { flags.filter = args[++i]; continue; }
  positional.push(args[i]);
}

const API_KEY  = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = flags.voice || process.env.ELEVENLABS_VOICE_ID;
const MODEL_ID = flags.model || 'eleven_monolingual_v1';
const STABILITY = flags.stability ?? 0.5;
const SIMILARITY = flags.similarity ?? 0.75;

// ---------------------------------------------------------------------------
// ElevenLabs API helpers
// ---------------------------------------------------------------------------

async function listVoices() {
  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': API_KEY },
  });
  if (!res.ok) throw new Error(`ElevenLabs API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.voices.map(v => ({
    id: v.voice_id,
    name: v.name,
    category: v.category,
    labels: v.labels,
  }));
}

async function generateSpeech(text, outputPath) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: STABILITY,
        similarity_boost: SIMILARITY,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs TTS error ${res.status}: ${body}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  return buffer.length;
}

// ---------------------------------------------------------------------------
// Text extraction — walks the scenario JSON and collects every piece of
// player-facing narrative text with a category and a stable filename slug.
// ---------------------------------------------------------------------------

function slugify(text, maxLen = 40) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, maxLen);
}

function extractText(scenario) {
  const entries = [];
  let counter = 0;
  const nextId = () => String(++counter).padStart(3, '0');

  // --- Intro text ---
  if (scenario.setting?.intro_text) {
    scenario.setting.intro_text.forEach((line, i) => {
      entries.push({
        id: `intro_${nextId()}`,
        category: 'intro',
        text: line,
        source: `setting.intro_text[${i}]`,
      });
    });
  }

  // --- Ambient text ---
  if (scenario.setting?.ambient_text) {
    entries.push({
      id: `ambient_${nextId()}`,
      category: 'ambient',
      text: scenario.setting.ambient_text,
      source: 'setting.ambient_text',
    });
  }

  // --- Phase ambient text ---
  if (scenario.phases) {
    for (const phase of scenario.phases) {
      if (phase.ambient_text) {
        entries.push({
          id: `ambient_phase_${slugify(phase.id)}_${nextId()}`,
          category: 'ambient',
          text: phase.ambient_text,
          source: `phases[${phase.id}].ambient_text`,
        });
      }
    }
  }

  // --- Walk all effects trees for message/random_message/game_over ---
  function walkEffects(effects, sourcePrefix) {
    if (!effects) return;
    for (let i = 0; i < effects.length; i++) {
      const e = effects[i];
      const src = `${sourcePrefix}.effects[${i}]`;

      if (e.type === 'message' && e.text) {
        entries.push({
          id: `msg_${nextId()}`,
          category: 'message',
          text: e.text,
          source: src,
        });
      }

      if (e.type === 'random_message' && e.messages) {
        e.messages.forEach((m, j) => {
          entries.push({
            id: `msg_${nextId()}`,
            category: 'message',
            text: m,
            source: `${src}.messages[${j}]`,
          });
        });
      }

      if (e.type === 'game_over' && e.text) {
        entries.push({
          id: `gameover_${nextId()}`,
          category: 'gameover',
          text: e.text,
          source: src,
        });
      }

      if (e.type === 'show_dialogue' && e.choices) {
        for (let c = 0; c < e.choices.length; c++) {
          const choice = e.choices[c];
          if (choice.then) {
            walkEffects(choice.then, `${src}.choices[${c}]`);
          }
        }
      }

      if (e.type === 'delay_then' && e.effects) {
        walkEffects(e.effects, `${src}(delay_then)`);
      }
      if (e.type === 'conditional_effect') {
        if (e.then) walkEffects(e.then, `${src}(then)`);
        if (e.else) walkEffects(e.else, `${src}(else)`);
      }
    }
  }

  // Object interactions
  if (scenario.objects) {
    for (const obj of scenario.objects) {
      for (let ix = 0; ix < obj.interactions.length; ix++) {
        const inter = obj.interactions[ix];
        const prefix = `objects[${obj.id}].interactions[${ix}]`;

        if (inter.response) {
          entries.push({
            id: `msg_${nextId()}`,
            category: 'message',
            text: inter.response,
            source: `${prefix}.response`,
          });
        }
        if (inter.then) {
          walkEffects(inter.then, prefix);
        }
      }
    }
  }

  // Item examine interactions
  if (scenario.items) {
    for (const item of scenario.items) {
      if (item.examine) {
        for (let ix = 0; ix < item.examine.length; ix++) {
          const ex = item.examine[ix];
          walkEffects(ex.then, `items[${item.id}].examine[${ix}]`);
        }
      }
    }
  }

  // Combinations
  if (scenario.combinations) {
    for (let i = 0; i < scenario.combinations.length; i++) {
      const combo = scenario.combinations[i];
      if (combo.message) {
        entries.push({
          id: `msg_${nextId()}`,
          category: 'message',
          text: combo.message,
          source: `combinations[${i}]`,
        });
      }
    }
  }

  // Events
  if (scenario.events) {
    for (const evt of scenario.events) {
      walkEffects(evt.effects, `events[${evt.id}]`);
    }
  }

  // Phase on_enter
  if (scenario.phases) {
    for (const phase of scenario.phases) {
      walkEffects(phase.on_enter, `phases[${phase.id}].on_enter`);
    }
  }

  // Win/lose conditions (text is in the condition itself, not effects)
  if (scenario.win_conditions) {
    for (const wc of scenario.win_conditions) {
      if (wc.description) {
        entries.push({
          id: `gameover_win_${nextId()}`,
          category: 'gameover',
          text: wc.description,
          source: `win_conditions[${wc.id}]`,
        });
      }
    }
  }
  if (scenario.lose_conditions) {
    for (const lc of scenario.lose_conditions) {
      if (lc.description) {
        entries.push({
          id: `gameover_lose_${nextId()}`,
          category: 'gameover',
          text: lc.description,
          source: `lose_conditions[${lc.id}]`,
        });
      }
    }
  }

  // Hints
  if (scenario.hints) {
    for (const hint of scenario.hints) {
      entries.push({
        id: `hint_${nextId()}`,
        category: 'hint',
        text: hint.text,
        source: `hints[${hint.id}]`,
      });
    }
  }

  // View hints
  if (scenario.views) {
    for (const view of scenario.views) {
      if (view.hints) {
        for (let i = 0; i < view.hints.length; i++) {
          entries.push({
            id: `hint_${nextId()}`,
            category: 'hint',
            text: view.hints[i].text,
            source: `views[${view.id}].hints[${i}]`,
          });
        }
      }
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // --list-voices
  if (flags.listVoices) {
    if (!API_KEY) {
      console.error('Error: ELEVENLABS_API_KEY environment variable is required.');
      process.exit(1);
    }
    const voices = await listVoices();
    console.log(`\nAvailable voices (${voices.length}):\n`);
    for (const v of voices) {
      const labels = v.labels ? Object.values(v.labels).join(', ') : '';
      console.log(`  ${v.id}  ${v.name}  [${v.category}]  ${labels}`);
    }
    return;
  }

  // Resolve scenario folder
  const scenarioArg = positional[0];
  if (!scenarioArg) {
    console.error('Usage: node tools/generate-voiceover.mjs <scenario-folder> [options]');
    console.error('       node tools/generate-voiceover.mjs --list-voices');
    console.error('\nRun with --dry-run to preview without calling the API.');
    process.exit(1);
  }

  const scenarioDir = path.resolve(ROOT, 'scenarios', scenarioArg);
  const jsonPath = path.join(scenarioDir, 'scenario.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: scenario.json not found at ${jsonPath}`);
    process.exit(1);
  }

  const scenario = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const scenarioId = scenario.metadata?.id || scenarioArg;
  console.log(`\nScenario: ${scenario.metadata?.title || scenarioId}`);

  // Extract all text
  let entries = extractText(scenario);
  console.log(`Found ${entries.length} text entries total.\n`);

  // Apply category filter
  if (flags.filter) {
    entries = entries.filter(e => e.category === flags.filter);
    console.log(`Filtered to ${entries.length} "${flags.filter}" entries.\n`);
  }

  if (entries.length === 0) {
    console.log('Nothing to generate.');
    return;
  }

  // Output directory
  const voiceDir = path.join(scenarioDir, 'audio', 'voice');

  // Character/size summary
  const totalChars = entries.reduce((sum, e) => sum + e.text.length, 0);
  const categories = {};
  for (const e of entries) {
    categories[e.category] = (categories[e.category] || 0) + 1;
  }

  console.log('Categories:');
  for (const [cat, count] of Object.entries(categories)) {
    console.log(`  ${cat}: ${count} entries`);
  }
  console.log(`\nTotal characters: ${totalChars.toLocaleString()}`);
  console.log(`Estimated ElevenLabs quota usage: ~${totalChars.toLocaleString()} characters`);
  console.log(`Output directory: ${voiceDir}\n`);

  // Dry run — print manifest
  if (flags.dryRun) {
    console.log('--- DRY RUN — text manifest ---\n');
    for (const entry of entries) {
      const filename = `${entry.id}.mp3`;
      const exists = fs.existsSync(path.join(voiceDir, filename));
      const marker = exists ? ' [EXISTS]' : '';
      console.log(`[${entry.category}] ${filename}${marker}`);
      console.log(`  Source: ${entry.source}`);
      console.log(`  Text (${entry.text.length} chars): "${entry.text.slice(0, 80)}${entry.text.length > 80 ? '...' : ''}"`);
      console.log();
    }

    // Write manifest JSON for reference
    const manifestPath = path.join(voiceDir, 'manifest.json');
    fs.mkdirSync(voiceDir, { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(entries, null, 2));
    console.log(`Manifest written to ${manifestPath}`);
    return;
  }

  // --- Actual generation ---
  if (!API_KEY) {
    console.error('Error: ELEVENLABS_API_KEY environment variable is required.');
    console.error('Set it with: export ELEVENLABS_API_KEY=your_key_here');
    process.exit(1);
  }
  if (!VOICE_ID) {
    console.error('Error: No voice ID specified.');
    console.error('Use --voice <id> or set ELEVENLABS_VOICE_ID env var.');
    console.error('Run with --list-voices to see available voices.');
    process.exit(1);
  }

  console.log(`Voice ID: ${VOICE_ID}`);
  console.log(`Model: ${MODEL_ID}`);
  console.log(`Settings: stability=${STABILITY}, similarity=${SIMILARITY}\n`);

  fs.mkdirSync(voiceDir, { recursive: true });
  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let charsUsed = 0;

  for (const entry of entries) {
    const filename = `${entry.id}.mp3`;
    const outputPath = path.join(voiceDir, filename);

    if (fs.existsSync(outputPath) && !flags.force) {
      skipped++;
      continue;
    }

    process.stdout.write(`  Generating ${filename} (${entry.text.length} chars)... `);

    try {
      const bytes = await generateSpeech(entry.text, outputPath);
      charsUsed += entry.text.length;
      generated++;
      console.log(`${(bytes / 1024).toFixed(1)} KB`);

      // Rate limit: ElevenLabs free tier allows ~2-3 requests/second
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      failed++;
      console.log(`FAILED: ${err.message}`);
    }
  }

  // Write manifest
  const manifestPath = path.join(voiceDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(entries, null, 2));

  console.log(`\nDone! Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`);
  console.log(`Characters used this run: ${charsUsed.toLocaleString()}`);
  console.log(`Manifest: ${manifestPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
