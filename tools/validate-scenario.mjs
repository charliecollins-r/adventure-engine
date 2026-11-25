#!/usr/bin/env node
/**
 * Scenario validator: catches the mistakes that parse fine but silently break play.
 *
 * Usage:
 *   node tools/validate-scenario.mjs scenarios/<id>/scenario.json [--views <prefix>]
 *
 * Errors (exit code 1):
 *   - duplicate keys in any JSON object (the LAST one silently wins in browsers)
 *   - use_item interactions without an `item` (the engine can never match them)
 *   - references to unknown item / object / view ids (incl. object ids used as item ids)
 *   - views listing unknown objects; initial_view missing
 *   - ambient lights missing required numeric fields (NaN crashes the lighting canvas)
 *   - referenced asset files (backgrounds, sprites, icons, audio) missing on disk
 * Warnings:
 *   - plain hotspots outside the 960x720 space; sprite anchors outside it
 *   - items that are used/required but never granted by anything
 *   - flags read by conditions but never set and not initialised
 *   - unconditional hints placed after conditional ones (getHint returns the LAST match)
 *
 * --views limits object/interaction checks to views whose id starts with the prefix
 * (useful while later acts are still stubs).
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const args = process.argv.slice(2);
const file = args[0];
if (!file) { console.log('Usage: node tools/validate-scenario.mjs <scenario.json> [--views prefix]'); process.exit(1); }
const vi = args.indexOf('--views');
const prefix = vi >= 0 ? args[vi + 1] : '';
const dir = dirname(file);
const raw = readFileSync(file, 'utf8');
const errors = [], warnings = [];

// ---- duplicate-key scan (JSON.parse drops duplicates silently) ---------------
(function scanDupes(src) {
  let i = 0; const path = [];
  const ws = () => { while (/\s/.test(src[i])) i++; };
  const str = () => { let s = ''; i++; while (src[i] !== '"') { if (src[i] === '\\') { s += src[i] + src[i + 1]; i += 2; } else s += src[i++]; } i++; return s; };
  function val() {
    ws();
    if (src[i] === '{') {
      i++; const seen = new Set(); ws();
      if (src[i] === '}') { i++; return; }
      for (;;) {
        ws(); const k = str();
        if (seen.has(k)) errors.push(`duplicate key "${k}" at ${path.join('.') || '(root)'} (line ${src.slice(0, i).split('\n').length})`);
        seen.add(k); ws(); i++; path.push(k); val(); path.pop(); ws();
        if (src[i] === ',') { i++; continue; } i++; return;
      }
    }
    if (src[i] === '[') {
      i++; ws(); let n = 0;
      if (src[i] === ']') { i++; return; }
      for (;;) { path.push(n++); val(); path.pop(); ws(); if (src[i] === ',') { i++; continue; } i++; return; }
    }
    if (src[i] === '"') { str(); return; }
    while (i < src.length && !/[,\]}\s]/.test(src[i])) i++;
  }
  val();
})(raw);

const s = JSON.parse(raw);
const itemIds = new Set(s.items.map(x => x.id));
const objIds = new Set(s.objects.map(x => x.id));
const viewIds = new Set(s.views.map(x => x.id));
const widgetIds = new Set((s.puzzle_widgets || []).map(w => w.id));
const meterIds = new Set((s.meters || []).map(m => m.id));
const cycleIds = new Set((s.cycles || []).map(c => c.id));
const pursuerIds = new Set((s.pursuers || []).map(p => p.id));
const patrolIds = new Set((s.patrols || []).map(p => p.id));
const scopeViews = s.views.filter(v => v.id.startsWith(prefix));
const scopeObjs = new Set(scopeViews.flatMap(v => v.objects));
const openedWidgets = new Set();
const granted = new Set(), required = new Set(), flagsSet = new Set(Object.keys(s.flags || {})), flagsRead = new Map();
const where = (o, it) => `${o}${it ? ` [${it.verb}${it.item ? ' ' + it.item : ''}]` : ''}`;

function checkItem(id, ctx) {
  if (!id) return;
  if (!itemIds.has(id)) errors.push(`${ctx}: unknown item "${id}"${objIds.has(id) ? ' (that is an OBJECT id; use the item it yields)' : ''}`);
}
function conds(cs, ctx) {
  for (const c of cs || []) {
    if (['has_item', 'not_has_item', 'item_count'].includes(c.type)) { checkItem(c.item, ctx); if (c.type === 'has_item') required.add(c.item); }
    if (c.type === 'object_state' && !objIds.has(c.object)) errors.push(`${ctx}: condition on unknown object "${c.object}"`);
    if (c.type === 'widget_solved' && !widgetIds.has(c.widget)) errors.push(`${ctx}: widget_solved on unknown widget "${c.widget}"`);
    if (c.type === 'view_is' && !viewIds.has(c.view)) errors.push(`${ctx}: condition on unknown view "${c.view}"`);
    if (c.type === 'patrol_near' && !(s.patrols || []).some((p) => p.id === c.patrol)) errors.push(`${ctx}: patrol_near on unknown patrol "${c.patrol}"`);
    if (c.type === 'flag_is' || c.type === 'flag_not') { if (!flagsRead.has(c.flag)) flagsRead.set(c.flag, ctx); }
    if ((c.type === 'meter_below' || c.type === 'meter_above') && !meterIds.has(c.meter)) errors.push(`${ctx}: ${c.type} on unknown meter "${c.meter}"`);
    if (c.type === 'cycle_is') {
      const cy = (s.cycles || []).find((x) => x.id === c.cycle);
      if (!cy) errors.push(`${ctx}: cycle_is on unknown cycle "${c.cycle}"`);
      else if (!cy.phases.some((ph) => ph.id === c.phase)) errors.push(`${ctx}: cycle_is "${c.cycle}" has no phase "${c.phase}"`);
    }
    if (c.type === 'patrol_active' && !patrolIds.has(c.patrol)) errors.push(`${ctx}: patrol_active on unknown patrol "${c.patrol}"`);
    if (c.type === 'pursuer_near' && !pursuerIds.has(c.pursuer)) errors.push(`${ctx}: pursuer_near on unknown pursuer "${c.pursuer}"`);
    conds(c.conditions, ctx);
  }
}
function effs(es, ctx) {
  for (const e of es || []) {
    if (['add_item', 'remove_item', 'transform_item'].includes(e.type)) checkItem(e.item, ctx);
    if (e.type === 'add_item') granted.add(e.item);
    if (e.type === 'transform_item') { checkItem(e.into, ctx); granted.add(e.into); }
    if (['set_state', 'show_object', 'hide_object', 'set_animation'].includes(e.type) && !objIds.has(e.object)) errors.push(`${ctx}: effect "${e.type}" on unknown object "${e.object}"`);
    if (e.type === 'set_view' && !viewIds.has(e.view)) errors.push(`${ctx}: set_view to unknown view "${e.view}"`);
    if (e.type === 'game_over' && !e.reason) errors.push(`${ctx}: game_over has no "reason" (the text shown${e.message || e.text ? `; it has "${e.message ? 'message' : 'text'}", which the engine ignores` : ''})`);
    if (e.type === 'set_flag') flagsSet.add(e.flag);
    if (e.type === 'open_widget') { if (!widgetIds.has(e.widget)) errors.push(`${ctx}: open_widget for unknown widget "${e.widget}"`); else openedWidgets.add(e.widget); }
    if (e.type === 'show_closeup' && e.image && !existsSync(join(dir, e.image))) errors.push(`${ctx}: closeup image missing: ${e.image}`);
    for (const l of e.layers || []) { if (!existsSync(join(dir, l.image || ''))) errors.push(`${ctx}: closeup layer image missing: ${l.image}`); conds(l.when, ctx); }
    if (['meter_add', 'meter_set', 'meter_transfer'].includes(e.type) && !meterIds.has(e.meter)) errors.push(`${ctx}: ${e.type} on unknown meter "${e.meter}"`);
    if (e.type === 'meter_transfer' && !meterIds.has(e.to)) errors.push(`${ctx}: meter_transfer to unknown meter "${e.to}"`);
    if (['pursuer_divert', 'pursuer_reset'].includes(e.type) && !pursuerIds.has(e.pursuer)) errors.push(`${ctx}: ${e.type} on unknown pursuer "${e.pursuer}"`);
    if (e.type === 'set_checkpoint' && !e.id) errors.push(`${ctx}: set_checkpoint has no "id"`);
    if (e.type === 'play_cutscene' && !s.setting?.cutscenes?.[e.cutscene]) errors.push(`${ctx}: play_cutscene for unknown cutscene "${e.cutscene}" (setting.cutscenes)`);
    if (e.type === 'message' && e.style && !['radio', 'comms'].includes(e.style)) errors.push(`${ctx}: message style "${e.style}" must be "radio" or "comms"`);
    if (e.type === 'message' && e.voice) asset(e.voice, `${ctx} message voice`);
    if (e.type === 'game_over' && e.sound && !s.setting?.sounds?.[e.sound]) asset(e.sound, `${ctx} game_over sound`);
    if (e.type === 'sense') for (const k of e.kinds || []) {
      if (k.patrol && !patrolIds.has(k.patrol)) errors.push(`${ctx}: sense kind "${k.label}" on unknown patrol "${k.patrol}"`);
      for (const v of k.views || []) if (!viewIds.has(v)) errors.push(`${ctx}: sense kind "${k.label}" names unknown view "${v}"`);
    }
    if (e.type === 'sense') conds(e.bonus?.when, ctx);
    conds(e.when, ctx); effs(e.then, ctx); effs(e.else, ctx); effs(e.effects, ctx);
    for (const ch of e.choices || []) { conds(ch.when, ctx); effs(ch.then, ctx); }
  }
}
const asset = (p, ctx) => { if (p && !existsSync(join(dir, p))) errors.push(`${ctx}: missing file ${p}`); };

// Meters, cycles, pursuers, player actions (SCENARIO_SCHEMA: Meters ... Rhythm widget)
for (const m of s.meters || []) {
  const ctx = `meter ${m.id}`;
  if (typeof m.max !== 'number' || m.max <= 0) errors.push(`${ctx}: "max" must be a positive number`);
  conds(m.active_when, ctx); conds(m.visible_when, ctx); effs(m.on_empty, ctx + ' on_empty');
  for (const w of m.warnings || []) { if (typeof w.at !== 'number') errors.push(`${ctx}: a warning has no numeric "at"`); if (w.sound && !s.setting.sounds?.[w.sound]) asset(w.sound, ctx); }
  if (m.cost_per_move && !m.on_empty?.length) warnings.push(`${ctx}: costs per move but has no on_empty (running out does nothing)`);
}
for (const c of s.cycles || []) {
  const ctx = `cycle ${c.id}`;
  if (!c.phases?.length) errors.push(`${ctx}: no phases`);
  for (const ph of c.phases || []) if (!(ph.seconds > 0)) errors.push(`${ctx} phase ${ph.id}: "seconds" must be > 0`);
  for (const v of c.views || []) if (!viewIds.has(v)) errors.push(`${ctx}: unknown view "${v}"`);
  conds(c.when, ctx);
}
for (const p of s.pursuers || []) {
  const ctx = `pursuer ${p.id}`;
  for (const v of [...(p.zone || []), ...(p.strike_views || [])]) if (!viewIds.has(v)) errors.push(`${ctx}: unknown view "${v}"`);
  for (const v of p.strike_views || []) if (!(p.zone || []).includes(v)) errors.push(`${ctx}: strike view "${v}" is outside its zone`);
  if (!p.on_strike?.length) errors.push(`${ctx}: no on_strike`);
  if (!p.hum_message && !p.hum_sound) warnings.push(`${ctx}: no hum_message or hum_sound: the player gets no warning before it strikes`);
  conds(p.when, ctx); effs(p.on_strike, ctx + ' on_strike');
}
for (const a of s.setting?.actions || []) { conds(a.when, `action ${a.id}`); effs(a.effects, `action ${a.id}`); }
for (const v of s.views) {
  if (v.on_enter) effs(v.on_enter, `view ${v.id} on_enter`);
  for (const id of v.objects || []) {
    const o = s.objects.find((x) => x.id === id);
    if (o?.sprite?.sync_cycle && !cycleIds.has(o.sprite.sync_cycle)) errors.push(`object ${id}: sprite.sync_cycle on unknown cycle "${o.sprite.sync_cycle}"`);
    for (const f of o?.sprite?.frame_when || []) { conds(f.when, `object ${id} frame_when`); if (f.frame >= (o.sprite.columns || 1)) errors.push(`object ${id}: frame_when frame ${f.frame} is past the sheet's last column`); }
  }
}
for (const w of s.puzzle_widgets || []) if (w.widget_type === 'rhythm') {
  const ph = w.config?.phrases;
  if (!Array.isArray(ph) || !ph.length || ph.some((p) => !/^[LS]+$/.test(p))) errors.push(`widget ${w.id}: rhythm "phrases" must be strings of L and S`);
  for (const x of w.config?.extra_phrases || []) { if (!/^[LS]+$/.test(x.pattern || '')) errors.push(`widget ${w.id}: extra phrase "${x.pattern}" must be L and S`); conds(x.when, `widget ${w.id}`); }
}

// Intro cinematic and cutscenes: every file exists, lights are complete, sprites have frames, lines have text
const cinematics = [['intro', s.setting?.intro_scenes || []], ...Object.entries(s.setting?.cutscenes || {}).map(([id, scs]) => [`cutscene ${id}`, scs])];
for (const [what, scenes] of cinematics) scenes.forEach((sc, i) => {
  const ctx = `${what} scene #${i + 1}`;
  asset(sc.background, ctx); asset(sc.sound, ctx); asset(sc.loop, ctx); if (sc.music) asset(sc.music, ctx);
  const nLines = (sc.lines || []).length;
  const cueOk = (c, where) => {
    if (c == null || c === 'start' || c === 'end') return;
    const m = /^line:(\d+)$/.exec(c);
    if (!m) errors.push(`${ctx} ${where}: cue "${c}" must be "start", "end" or "line:N"`);
    else if (+m[1] < 1 || +m[1] > nLines) errors.push(`${ctx} ${where}: cue "${c}" but the scene has ${nLines} line(s)`);
  };
  (sc.sounds || []).forEach((snd, j) => { asset(snd.file, `${ctx} sound #${j + 1}`); cueOk(snd.cue, `sound #${j + 1}`); });
  (sc.effects || []).forEach((e, j) => cueOk(e.cue, `effect #${j + 1}`));
  (sc.sprites || []).forEach((sp, j) => { cueOk(sp.cue, `sprite #${j + 1}`); cueOk(sp.until_cue, `sprite #${j + 1} until_cue`); });
  (sc.lines || []).forEach((l, j) => {
    if (!l.text) errors.push(`${ctx} line #${j + 1}: no text`);
    asset(l.voice, `${ctx} line #${j + 1}`);
  });
  (sc.sprites || []).forEach((sp, j) => {
    asset(sp.file, `${ctx} sprite #${j + 1}`);
    for (const k of ['frame_width', 'frame_height', 'columns', 'frame_rate', 'scale']) if (typeof sp[k] !== 'number') errors.push(`${ctx} sprite #${j + 1}: missing numeric "${k}"`);
    if (!Array.isArray(sp.at) || sp.at.length !== 2) errors.push(`${ctx} sprite #${j + 1}: "at" must be [x, y]`);
    (sp.frames || []).forEach(f => { if (f >= sp.columns) errors.push(`${ctx} sprite #${j + 1}: frame ${f} is past column ${sp.columns - 1}`); });
  });
  (sc.ambient_lighting?.lights || []).forEach((l, j) => {
    for (const k of ['x', 'y', 'radius', 'pulse_speed', 'pulse_amount', 'alpha']) if (typeof l[k] !== 'number') errors.push(`${ctx}: ambient light #${j + 1} missing numeric "${k}"`);
  });
  if (!sc.background && !(sc.lines || []).length) warnings.push(`${ctx}: no background and no lines (an empty black screen)`);
});

if (!viewIds.has(s.setting?.initial_view)) errors.push(`setting.initial_view "${s.setting?.initial_view}" is not a view`);
// A prologue starts in its own view and must end with a play_cutscene that wakes the player
if (s.setting?.prologue) {
  if (!viewIds.has(s.setting.prologue.view)) errors.push(`setting.prologue.view "${s.setting.prologue.view}" is not a view`);
  if (!JSON.stringify(s).includes('"wake":true')) warnings.push('setting.prologue: no play_cutscene with "wake": true, so the prologue never ends (only Skip intro leaves it)');
}
(s.setting?.tutorial?.steps || []).forEach((st, i) => {
  conds(st.when, `tutorial tip #${i + 1}`);
  if (st.prologue && !['only', 'if_skipped'].includes(st.prologue)) errors.push(`tutorial tip #${i + 1}: prologue must be "only" or "if_skipped"`);
  if (st.prologue && !s.setting?.prologue) warnings.push(`tutorial tip #${i + 1}: marked prologue "${st.prologue}" but the scenario has no setting.prologue`);
});
for (const v of scopeViews) {
  for (const o of v.objects) if (!objIds.has(o)) errors.push(`view ${v.id}: lists unknown object "${o}"`);
  asset(v.background_file, `view ${v.id}`);
  (v.ambient_lighting?.lights || []).forEach((l, i) => {
    for (const k of ['x', 'y', 'radius', 'pulse_speed', 'pulse_amount', 'alpha']) if (typeof l[k] !== 'number') errors.push(`view ${v.id}: ambient light #${i} missing numeric "${k}"`);
  });
  for (const h of v.hints || []) conds(h.when, `view ${v.id} hint`);
  (v.hints || []).forEach((h, i, hs) => {
    const unconditional = !h.when || h.when.length === 0;
    if (unconditional && hs.slice(0, i).some(x => x.when && x.when.length)) warnings.push(`view ${v.id}: unconditional hint #${i} comes after conditional ones; the engine shows the LAST matching hint, so it masks them. Move it first.`);
  });
}
for (const o of s.objects) {
  if (!scopeObjs.has(o.id)) continue;
  const { x, y } = o.position || {}; const { width: w, height: h } = o.size || {};
  if (o.sprite) {
    asset(o.sprite.file, `object ${o.id} sprite`);
    if (x < 0 || x > 960 || y < 0 || y > 720) warnings.push(`object ${o.id}: sprite anchor (${x},${y}) outside 960x720`);
  } else if (x < 0 || y < 0 || x + w > 960 || y + h > 720) warnings.push(`object ${o.id}: hotspot (${x},${y}) ${w}x${h} exceeds 960x720`);
  for (const it of o.interactions || []) {
    const ctx = `object ${where(o.id, it)}`;
    if (it.verb === 'use_item' && !it.item) errors.push(`object ${o.id}: use_item interaction has no "item" — it can never match`);
    if (it.verb === 'use_item') { checkItem(it.item, `object ${o.id} [use_item]`); required.add(it.item); }
    conds(it.when, ctx); effs(it.then, ctx);
  }
}
for (const it of s.items) {
  asset(it.icon_file, `item ${it.id} icon`);
  for (const x of it.examine || []) { conds(x.when, `item ${it.id}`); effs(x.then, `item ${it.id}`); }
}
for (const w of s.puzzle_widgets || []) {
  const ctx = `widget ${w.id}`;
  if (prefix && !openedWidgets.has(w.id) && !(w.view || '').startsWith(prefix)) continue;
  for (const k of ['on_solve', 'on_fail', 'on_max_fail']) effs(w[k], ctx);
  if (w.presentation === 'overlay' && w.widget_type === 'keypad') {
    const keys = (w.config?.keys || []).map(k => (typeof k === 'string' ? { value: k } : k));
    const values = new Set(keys.map(k => k.value));
    const sol = typeof w.config?.solution === 'string' ? w.config.solution.split('') : (w.config?.solution || []).map(String);
    if (!sol.length) errors.push(`${ctx}: keypad has no solution`);
    for (const v of sol) if (!values.has(v)) errors.push(`${ctx}: solution value "${v}" is not one of the keys`);
    if (w.config?.code_length && w.config.code_length !== sol.length) errors.push(`${ctx}: code_length ${w.config.code_length} != solution length ${sol.length}`);
    if (values.size !== keys.length) errors.push(`${ctx}: duplicate key values`);
    for (const k of keys) asset(k.image, `${ctx} key ${k.value}`);
  }
}
for (const c of s.combinations || []) {
  const ctx = `combination ${c.items.join('+')}`;
  c.items.forEach(i => { checkItem(i, ctx); required.add(i); }); checkItem(c.result, ctx); granted.add(c.result); conds(c.conditions, ctx);
}
for (const [k, p] of Object.entries(s.setting?.sounds || {})) asset(p, `setting.sounds.${k}`);
const ambient = s.setting?.ambient_audio; (Array.isArray(ambient) ? ambient : ambient ? [ambient] : []).forEach(p => asset(p, 'setting.ambient_audio'));
if (s.character) for (const [k, ss] of Object.entries(s.character.sprite_sets || {})) asset(ss.file, `character.sprite_sets.${k}`);

const scopedItemRefs = new Set();
for (const o of s.objects) if (scopeObjs.has(o.id)) for (const it of o.interactions || []) if (it.item) scopedItemRefs.add(it.item);
for (const i of required) if (scopedItemRefs.has(i) && !granted.has(i)) warnings.push(`item "${i}" is required somewhere but nothing grants it`);
// events: their effects set flags and show/hide objects; their triggers read flags
for (const ev of s.events || []) { effs(ev.effects, `event ${ev.id}`); if (ev.trigger && ev.trigger.type !== 'timer') conds([ev.trigger], `event ${ev.id}`); }
effs(s.setting?.dev_skip?.effects, 'setting.dev_skip');
// patrols: rooms exist, legs make sense, sounds and sprites exist, and you're warned before each leg
for (const p of s.patrols || []) {
  const ctx = `patrol ${p.id}`;
  if (!(p.period > 0)) errors.push(`${ctx}: "period" must be a positive number of seconds`);
  if (!p.stops?.length) errors.push(`${ctx}: no stops`);
  const snd = (k, f) => { if (k && !(s.setting?.sounds || {})[k]) asset(k, `${ctx} ${f}`); };
  snd(p.warn_sound, 'warn_sound'); snd(p.enter_sound, 'enter_sound');
  if (p.sprite) asset(p.sprite.file, `${ctx} sprite`);
  if (!p.on_caught?.length) warnings.push(`${ctx}: no on_caught effects, so it never catches anyone`);
  effs(p.on_caught, ctx); conds(p.when, ctx);
  (p.stops || []).forEach((st, i) => {
    const sc = `${ctx} stop #${i + 1}`;
    for (const v of st.views || []) if (!viewIds.has(v)) errors.push(`${sc}: unknown view "${v}"`);
    if (!(st.leave > st.enter)) errors.push(`${sc}: "leave" must be after "enter"`);
    if (st.leave > p.period) errors.push(`${sc}: leaves at ${st.leave}s, after the next sweep starts (period ${p.period}s)`);
    if (!st.sense && !st.warn_message && !p.warn_message && !p.warn_sound) warnings.push(`${sc}: no warning (warn_message or warn_sound): the player can't hear it coming`);
    conds(st.safe_when, sc);
    for (const q of st.path || []) if (!Array.isArray(q) || q.length !== 2) errors.push(`${sc}: path points must be [x, y]`);
  });
}
for (const [f, ctx] of flagsRead) if (!flagsSet.has(f)) warnings.push(`flag "${f}" is read (${ctx}) but never set or initialised`);

// ---- walkable areas (docs/WALKABLE_AREAS.md): uses the real engine + geometry, bundled ----
const walkViews = scopeViews.filter((v) => v.walk_area);
if (walkViews.length || s.views.some((v) => v.walk_area)) {
  const { createRequire } = await import('module');
  const { mkdtempSync } = await import('fs');
  const { tmpdir } = await import('os');
  const { join: pj, resolve } = await import('path');
  const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
  const req = createRequire(pj(root, 'client', 'package.json'));
  const esbuild = req('esbuild');
  const outFile = pj(mkdtempSync(pj(tmpdir(), 'validate-')), 'walk.cjs');
  esbuild.buildSync({
    stdin: { contents: "export * from './walkable'; export { ScenarioEngine } from './ScenarioEngine';", resolveDir: pj(root, 'client/src/engine'), loader: 'ts' },
    bundle: true, platform: 'node', format: 'cjs', outfile: outFile, logLevel: 'error',
  });
  const W = createRequire(outFile)(outFile);
  const pt = ([x, y]) => ({ x, y });
  const inCanvas = ([x, y]) => x >= 0 && x <= 960 && y >= 0 && y <= 720;
  const sets = s.character?.sprite_sets || {};
  for (const [k, ss] of Object.entries(sets)) if (ss.walk && !sets[ss.walk]) errors.push(`character.sprite_sets.${k}.walk: no sprite set named "${ss.walk}"`);
  const viewById = Object.fromEntries(s.views.map((v) => [v.id, v]));
  for (const v of walkViews) {
    const ctx = `view ${v.id} walk_area`;
    const wa = v.walk_area;
    if (!Array.isArray(wa.floor)) { errors.push(`${ctx}: floor must be a list of [x, y] points`); continue; }
    for (const pr of W.outlineProblems(wa.floor)) errors.push(`${ctx}.floor: ${pr}`);
    if (wa.floor.some((p) => !inCanvas(p))) errors.push(`${ctx}.floor: points must be inside 960x720`);
    (wa.blocked || []).forEach((b, bi) => {
      for (const pr of W.outlineProblems(b)) errors.push(`${ctx}.blocked[${bi}]: ${pr}`);
      if (b.some((p) => !W.strictlyInsideOutline(pt(p), wa.floor))) errors.push(`${ctx}.blocked[${bi}]: must lie strictly inside the floor (not touching its outline)`);
      (wa.blocked || []).forEach((o, oi) => { if (oi !== bi && b.some((p) => W.strictlyInsideOutline(pt(p), o))) errors.push(`${ctx}.blocked[${bi}] overlaps blocked[${oi}]`); });
    });
    const ds = wa.depth_scale;
    if (ds && (!(ds.far > 0) || !(ds.near > 0) || !(ds.far_y < ds.near_y))) warnings.push(`${ctx}.depth_scale: expects far > 0, near > 0 and far_y < near_y`);
    if (!v.character) { warnings.push(`${ctx}: view has no character placement, so nobody walks here`); continue; }
    if (!s.character) { warnings.push(`${ctx}: scenario has no character config`); continue; }
    const start = { x: v.character.x, y: v.character.y };
    if (!W.isOnFloor(wa, start)) errors.push(`${ctx}: the character's start spot (${start.x}, ${start.y}) is not on the floor`);
    const eng = new W.ScenarioEngine(s);
    eng.navigateToView(v.id);
    for (const id of v.objects) {
      const o = s.objects.find((x) => x.id === id); if (!o) continue;
      if (o.walk_to && !W.isOnFloor(wa, o.walk_to)) errors.push(`object ${id}: walk_to (${o.walk_to.x}, ${o.walk_to.y}) is not on the floor of ${v.id}`);
      const ap = eng.getApproach(id); if (!ap) continue;
      const path = W.findPath(wa, start, ap); const end = path[path.length - 1];
      if (Math.hypot(end.x - ap.x, end.y - ap.y) > 0.5) warnings.push(`object ${id}: its stand point (${Math.round(ap.x)}, ${Math.round(ap.y)}) can't be reached from the start spot in ${v.id}`);
    }
  }
  // set_view `at`: must land on the target view's floor
  const walkEffects = (es, ctx) => { for (const e of es || []) {
    if (e.type === 'set_view' && e.at) {
      const tv = viewById[e.view];
      if (!tv?.walk_area) warnings.push(`${ctx}: set_view "at" is ignored because ${e.view} has no walk_area`);
      else if (!W.isOnFloor(tv.walk_area, e.at)) errors.push(`${ctx}: set_view "at" (${e.at.x}, ${e.at.y}) is not on the floor of ${e.view}`);
    }
    walkEffects(e.then, ctx); walkEffects(e.else, ctx);
  } };
  for (const o of s.objects) if (scopeObjs.has(o.id)) for (const it of o.interactions || []) walkEffects(it.then, where(o.id, it));
}

for (const e of errors) console.log('ERROR   ', e);
for (const w of warnings) console.log('warning ', w);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)${prefix ? ` (objects scoped to views "${prefix}*")` : ''}`);
process.exit(errors.length ? 1 : 0);
