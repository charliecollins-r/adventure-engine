#!/usr/bin/env node
/**
 * Soft-lock search: exhaustively explores a scenario with the REAL ScenarioEngine
 * and reports every reachable state from which the goal can no longer be reached.
 *
 * Usage:
 *   node tools/softlock-search.mjs scenarios/the-harvest/scenario.json \
 *     --views act1 --goal "state:airlock_override_panel!=locked"
 *
 * Options:
 *   --views <prefix>   Only explore views whose id starts with this (default: all)
 *   --goal <expr>      state:<obj>=<v> | state:<obj>!=<v> | flag:<f>=<v> | item:<id> | view:<prefix>
 *   --max <n>          State cap (default 2,000,000)
 *   --verbose          Print the cone-of-influence variables
 *
 * Soundness: only variables in the goal's "cone of influence" are tracked — flags,
 * object states, item possession and object visibility that (transitively) gate an
 * interaction which writes a cone variable or changes the view. Everything else
 * (lore flags, flavour text, optional side-quests that never feed the goal) cannot
 * change whether the goal is reachable, so it is dropped from the state and those
 * actions are skipped. Deaths (game_over) are terminal and reported separately;
 * they are not soft-locks.
 */
import { readFileSync, mkdtempSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { tmpdir } from 'os';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const scenarioPath = args[0];
if (!scenarioPath || scenarioPath.startsWith('--')) { console.log('Usage: node tools/softlock-search.mjs <scenario.json> [--views prefix] --goal expr'); process.exit(1); }
const viewPrefix = arg('--views', '');
const goalExpr = arg('--goal');
const MAX = +arg('--max', 2000000);
const verbose = args.includes('--verbose');
if (!goalExpr) { console.error('--goal is required'); process.exit(1); }

// ---- bundle the real engine --------------------------------------------
const require = createRequire(join(root, 'client', 'package.json'));
const esbuild = require('esbuild');
const out = join(mkdtempSync(join(tmpdir(), 'softlock-')), 'engine.cjs');
esbuild.buildSync({ entryPoints: [join(root, 'client/src/engine/ScenarioEngine.ts')], bundle: true, platform: 'node', format: 'cjs', outfile: out, logLevel: 'error' });
const { ScenarioEngine } = createRequire(out)(out);

const scenario = JSON.parse(readFileSync(scenarioPath, 'utf8'));
const base0Phase = scenario.phases?.[0]?.id;
const inScope = v => v.startsWith(viewPrefix);
const scopeViews = scenario.views.filter(v => inScope(v.id));
const scopeObjs = new Set(scopeViews.flatMap(v => v.objects));

// ---- goal ---------------------------------------------------------------
const [gKind, gRest] = [goalExpr.slice(0, goalExpr.indexOf(':')), goalExpr.slice(goalExpr.indexOf(':') + 1)];
let goal, goalVars;
if (gKind === 'view') { goal = e => e.currentViewId.startsWith(gRest); goalVars = []; }
else if (gKind === 'item') { goal = e => e.inventory.includes(gRest); goalVars = ['item:' + gRest]; }
else {
  const neg = gRest.includes('!='); const [name, val] = gRest.split(neg ? '!=' : '=');
  const get = gKind === 'flag' ? e => e.flags[name] : e => e.objectStates[name];
  goal = neg ? e => get(e) !== undefined && get(e) !== val : e => get(e) === val;
  goalVars = [(gKind === 'flag' ? 'flag:' : 'state:') + name];
}

// ---- cone of influence ---------------------------------------------------
function condReads(cs, r) {
  for (const c of cs || []) {
    if (c.type === 'flag_is' || c.type === 'flag_not') r.add('flag:' + c.flag);
    else if (c.type === 'object_state') r.add('state:' + c.object);
    else if (c.type === 'has_item' || c.type === 'not_has_item' || c.type === 'item_count') r.add('item:' + c.item);
    condReads(c.conditions, r);
  }
}
function effRW(es, r, w) {
  for (const e of es || []) {
    switch (e.type) {
      case 'set_flag': w.add('flag:' + e.flag); break;
      case 'set_state': w.add('state:' + e.object); break;
      case 'add_item': case 'remove_item': w.add('item:' + e.item); break;
      case 'transform_item': w.add('item:' + e.item); w.add('item:' + e.into); break;
      case 'show_object': case 'hide_object': w.add('vis:' + e.object); break;
      case 'set_view': w.add('view'); break;
      case 'game_over': w.add('gameover'); break;
      case 'show_dialogue': w.add('dialogue'); break;
    }
    condReads(e.when, r); effRW(e.then, r, w); effRW(e.else, r, w); effRW(e.effects, r, w);
    for (const ch of e.choices || []) { condReads(ch.when, r); effRW(ch.then, r, w); }
  }
}
const groups = new Map(); // key -> {reads, writes}
const addGroup = (k, list, extraReads = []) => {
  const r = new Set(extraReads), w = new Set();
  for (const it of list) { condReads(it.when, r); effRW(it.then, r, w); }
  groups.set(k, { r, w });
};
for (const o of scenario.objects) if (scopeObjs.has(o.id)) {
  const byKey = {};
  for (const it of o.interactions || []) { const v = it.verb === 'take' ? 'hand' : it.verb; (byKey[v + '|' + (it.item || '')] ||= []).push(it); }
  for (const [k, list] of Object.entries(byKey)) addGroup(o.id + '|' + k, list, ['vis:' + o.id, ...(list[0].item ? ['item:' + list[0].item] : [])]);
}
for (const it of scenario.items) if (it.examine?.length) addGroup('#' + it.id, it.examine, ['item:' + it.id]);
for (const c of scenario.combinations || []) {
  const w = new Set(['item:' + c.result]); if (c.consumes) c.items.forEach(i => w.add('item:' + i));
  const r = new Set(c.items.map(i => 'item:' + i)); condReads(c.conditions, r);
  groups.set('+' + c.items.join('+'), { r, w });
}
// Items that can actually be obtained within scope; groups that need anything else can never fire.
const obtainable = new Set();
{
  const grants = es => { const out = []; for (const e of es || []) { if (e.type === 'add_item') out.push(e.item); if (e.type === 'transform_item') out.push(e.into); out.push(...grants(e.then), ...grants(e.else), ...grants(e.effects)); for (const ch of e.choices || []) out.push(...grants(ch.then)); } return out; };
  const sources = [];
  for (const o of scenario.objects) if (scopeObjs.has(o.id)) for (const it of o.interactions || []) sources.push([it.item, grants(it.then)]);
  for (const it of scenario.items) for (const x of it.examine || []) sources.push([it.id, grants(x.then)]);
  for (const ph of scenario.phases || []) if (ph.id === base0Phase) sources.push([null, grants(ph.on_enter)]);
  let more = true;
  while (more) {
    more = false;
    for (const [need, out] of sources) if (!need || obtainable.has(need)) for (const i of out) if (!obtainable.has(i)) { obtainable.add(i); more = true; }
    for (const c of scenario.combinations || []) if (c.items.every(i => obtainable.has(i)) && !obtainable.has(c.result)) { obtainable.add(c.result); more = true; }
  }
}
for (const [k] of [...groups]) {
  if (k.startsWith('+')) { if (!k.slice(1).split('+').every(i => obtainable.has(i))) groups.delete(k); continue; }
  const m = k.split('|'); if (m[1] === 'use_item' && !obtainable.has(m[2])) groups.delete(k);
  if (k.startsWith('#') && !obtainable.has(k.slice(1))) groups.delete(k);
}
const cone = new Set(goalVars);
const relevant = new Set();
let grew = true;
while (grew) {
  grew = false;
  for (const [k, g] of groups) {
    if (relevant.has(k)) continue;
    if ([...g.w].some(x => cone.has(x) || x === 'view')) {
      relevant.add(k); grew = true;
      for (const x of g.r) cone.add(x);
    }
  }
}
const coneFlags = [...cone].filter(x => x.startsWith('flag:')).map(x => x.slice(5));
const coneStates = [...cone].filter(x => x.startsWith('state:')).map(x => x.slice(6));
const coneItems = new Set([...cone].filter(x => x.startsWith('item:')).map(x => x.slice(5)));
const coneVis = [...cone].filter(x => x.startsWith('vis:')).map(x => x.slice(4));
if (verbose) console.log('cone:', [...cone].sort().join(' '), '\nobtainable items:', [...obtainable].sort().join(' '));
console.log(`cone of influence: ${coneFlags.length} flags, ${coneStates.length} object states, ${coneItems.size} items, ${coneVis.length} visibilities; ${relevant.size}/${groups.size} interaction groups relevant`);

// ---- compact state <-> engine ------------------------------------------
const base = new ScenarioEngine(scenario);
const baseSnap = JSON.stringify({ flags: base.flags, objectStates: base.objectStates, objectVisibility: base.objectVisibility });
const encode = e => JSON.stringify([
  e._currentViewId, e.viewHistory.at(-1) || '',
  coneFlags.map(f => e.flags[f] ?? ''), coneStates.map(s => e.objectStates[s] ?? ''), coneVis.map(v => (e.objectVisibility[v] === false ? 0 : 1)),
  e.inventory.filter(i => coneItems.has(i)).sort(), e._dialoguePrompt ? [e._dialoguePrompt, e._dialogueChoices] : 0,
]);
function decode(k) {
  const [view, back, f, s, v, inv, dlg] = JSON.parse(k);
  const e = Object.create(ScenarioEngine.prototype);
  Object.assign(e, base);
  const b = JSON.parse(baseSnap);
  e.flags = b.flags; e.objectStates = b.objectStates; e.objectVisibility = b.objectVisibility;
  coneFlags.forEach((n, i) => { e.flags[n] = f[i]; }); coneStates.forEach((n, i) => { e.objectStates[n] = s[i]; }); coneVis.forEach((n, i) => { e.objectVisibility[n] = !!v[i]; });
  Object.assign(e, { _currentViewId: view, viewHistory: back ? [back] : [], inventory: [...inv], objectAnimations: {}, _gameOver: null, _messages: [], _pendingSounds: [], _noiseLevel: 0, _characterOverride: null, equippedItems: new Map() });
  e._dialoguePrompt = dlg ? dlg[0] : null; e._dialogueChoices = dlg ? dlg[1] : [];
  return e;
}
function actions(e) {
  const out = [];
  if (e._dialoguePrompt) {
    e._dialogueChoices.forEach((ch, i) => out.push([`CHOOSE "${ch.label}"`, x => x.selectDialogueChoice(i)]));
    out.push(['DISMISS dialogue', x => x.dismissDialogue()]);
    return out;
  }
  for (const o of e.getVisibleObjects()) {
    for (const v of ['look', 'move', 'hand', 'talk']) if (relevant.has(`${o.id}|${v}|`)) out.push([`${v.toUpperCase()} ${o.id}`, x => x.interact(o.id, v)]);
    for (const it of e.inventory) if (relevant.has(`${o.id}|use_item|${it}`)) out.push([`USE ${it} ON ${o.id}`, x => x.interact(o.id, 'use_item', it)]);
  }
  const inv = e.inventory;
  for (let i = 0; i < inv.length; i++) {
    if (relevant.has('#' + inv[i])) out.push([`EXAMINE ${inv[i]}`, x => x.examineItem(inv[i], 'look')]);
    for (let j = i + 1; j < inv.length; j++) if (relevant.has(`+${inv[i]}+${inv[j]}`) || relevant.has(`+${inv[j]}+${inv[i]}`)) out.push([`COMBINE ${inv[i]} + ${inv[j]}`, x => x.combineItems(inv[i], inv[j])]);
  }
  if (e.canGoBack()) out.push(['BACK', x => x.navigateBack()]);
  return out;
}

// ---- breadth-first search -------------------------------------------------
const keys = [encode(base)], parent = [-1], via = [''], succ = [[]], terminal = [0];
let expanded = 0; // states [0, expanded) have had all their successors generated
const index = new Map([[keys[0], 0]]);
const deaths = new Map(); let capped = false;
for (let qi = 0; qi < keys.length; qi++) {
  if (keys.length > MAX) { capped = true; expanded = qi; break; }
  expanded = qi + 1;
  if (terminal[qi]) continue;
  for (const [label, fn] of actions(decode(keys[qi]))) {
    const c = decode(keys[qi]);
    try { fn(c); } catch (err) { console.log('ENGINE THREW on', label, '-', err.message); continue; }
    if (c._gameOver) { const t = String(c._gameOver.text || c._gameOver.conditionId).replace(/\s+/g, ' '); if (!deaths.has(t)) deaths.set(t, [qi, label]); continue; }
    const k = encode(c);
    let id = index.get(k);
    if (id === undefined) {
      id = keys.length; index.set(k, id); keys.push(k); parent.push(qi); via.push(label); succ.push([]);
      terminal.push(goal(c) || !inScope(c._currentViewId) ? 1 : 0);
    }
    if (id !== qi) succ[qi].push(id);
  }
}
const goals = keys.map((_, i) => i).filter(i => terminal[i]);
const pred = keys.map(() => []); succ.forEach((s, i) => s.forEach(j => pred[j].push(i)));
const win = new Uint8Array(keys.length); const stack = [...goals]; goals.forEach(g => { win[g] = 1; });
while (stack.length) { const n = stack.pop(); for (const p of pred[n]) if (!win[p]) { win[p] = 1; stack.push(p); } }
const path = i => { const p = []; while (i > 0) { p.push(via[i]); i = parent[i]; } return p.reverse(); };
// A state is soft-locked only if it was fully expanded and cannot reach a goal. Unexpanded frontier
// states (when capped) are unknown, and their ancestors may be judged too pessimistically, so a
// capped run reports only states whose entire forward closure was expanded.
let locked = keys.map((_, i) => i).filter(i => i < expanded && !win[i] && !terminal[i]);
if (capped) {
  const touchesFrontier = new Uint8Array(keys.length); const st2 = [];
  for (let i = expanded; i < keys.length; i++) { touchesFrontier[i] = 1; st2.push(i); }
  while (st2.length) { const n = st2.pop(); for (const p of pred[n]) if (!touchesFrontier[p]) { touchesFrontier[p] = 1; st2.push(p); } }
  locked = locked.filter(i => !touchesFrontier[i]);
}

console.log(`\nexplored ${keys.length} states ${capped ? '(CAPPED — results are a lower bound)' : '(exhaustive)'}; ${goals.length} reach the goal`);
console.log(`start state can win: ${!!win[0] ? 'YES' : 'NO'}`);
console.log(`SOFT-LOCKED states: ${locked.length}${capped ? ' (only states whose whole future was explored are counted)' : ''}`);
const doom = new Map();
for (const i of locked) if (parent[i] >= 0 && win[parent[i]] && !doom.has(via[i])) doom.set(via[i], i);
for (const [a, i] of doom) console.log(`\n  ✗ dooming action: ${a}\n    reachable via: ${path(i).join(' → ')}`);
if (goals.length) {
  const best = goals.reduce((a, b) => (path(a).length <= path(b).length ? a : b));
  console.log(`\nshortest win (${path(best).length} goal-relevant actions):\n  ` + path(best).join('\n  '));
}
if (!win[0]) {
  // Diagnose: what never happened anywhere in the explored space?
  const seenItems = new Set(), seenFlags = new Map(), seenViews = new Set();
  for (const k of keys) {
    const [view, , f, , , inv] = JSON.parse(k);
    seenViews.add(view); inv.forEach(i => seenItems.add(i));
    coneFlags.forEach((n, i) => { if (!seenFlags.has(n)) seenFlags.set(n, new Set()); seenFlags.get(n).add(f[i]); });
  }
  console.log('\nGOAL UNREACHABLE — diagnostics:');
  console.log('  views never entered:', scopeViews.map(v => v.id).filter(v => !seenViews.has(v)).join(', ') || '(none)');
  console.log('  cone items never obtained:', [...coneItems].filter(i => !seenItems.has(i)).join(', ') || '(none)');
  console.log('  cone flags never changed:', coneFlags.filter(f => seenFlags.get(f).size < 2).join(', ') || '(none)');
}
console.log(`\ndeaths reachable (${deaths.size}):`);
for (const [t, [, l]] of deaths) console.log(`  ☠ ${l} — ${t.slice(0, 110)}`);
