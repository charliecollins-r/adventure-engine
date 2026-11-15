#!/usr/bin/env node
/**
 * Fill in arrival spots for doors in walking views (docs/WALKABLE_AREAS.md).
 *
 * For every Move interaction whose `set_view` leads into a view with a `walk_area`, this finds the
 * exit in the target view that leads back, and sets `at` to where the character would stand to use
 * that exit (the engine's own stand-point rule), facing into the room. So walking out of the Lab
 * puts him by the Lab door in the corridor. Hand-written `at` values are kept unless --overwrite.
 *
 * Usage:
 *   node tools/arrival-spots.mjs scenarios/<id>/scenario.json [--views act1] [--into <view_id>] [--write] [--overwrite]
 *   --into only fills doors that lead into that view (the editor's Save uses this after a floor change).
 * Without --write it only prints what it would change.
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join, resolve } from 'path';
import { tmpdir } from 'os';

const args = process.argv.slice(2);
const file = args[0];
if (!file) { console.log('Usage: node tools/arrival-spots.mjs <scenario.json> [--views prefix] [--write] [--overwrite]'); process.exit(1); }
const prefix = args.includes('--views') ? args[args.indexOf('--views') + 1] : '';
const into = args.includes('--into') ? args[args.indexOf('--into') + 1] : '';
const write = args.includes('--write');
const overwrite = args.includes('--overwrite');

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const req = createRequire(join(root, 'client', 'package.json'));
const out = join(mkdtempSync(join(tmpdir(), 'arrival-')), 'walk.cjs');
req('esbuild').buildSync({
  stdin: { contents: "export * from './walkable'; export { ScenarioEngine } from './ScenarioEngine';", resolveDir: join(root, 'client/src/engine'), loader: 'ts' },
  bundle: true, platform: 'node', format: 'cjs', outfile: out, logLevel: 'error',
});
const W = createRequire(out)(out);

const s = JSON.parse(readFileSync(file, 'utf8'));
const views = Object.fromEntries(s.views.map((v) => [v.id, v]));
const objs = Object.fromEntries(s.objects.map((o) => [o.id, o]));
const ownerView = {};
for (const v of s.views) for (const id of v.objects) ownerView[id] ??= v.id;

/** set_view effects (including inside conditional_effect) of an object's Move interactions. */
function* moveSetViews(o) {
  const walk = function* (es) { for (const e of es || []) { if (e.type === 'set_view') yield e; yield* walk(e.then); yield* walk(e.else); } };
  for (const it of o.interactions || []) if (it.verb === 'move') yield* walk(it.then);
}

const engine = new W.ScenarioEngine(s);
let changed = 0, missing = 0;
for (const o of s.objects) {
  const from = ownerView[o.id];
  if (!from || !from.startsWith(prefix)) continue;
  for (const e of moveSetViews(o)) {
    if (into && e.view !== into) continue;
    const target = views[e.view];
    if (!target?.walk_area || !target.character) continue;
    if (e.at && !overwrite) continue;
    // the exit in the target view that leads back where we came from
    const back = target.objects.map((id) => objs[id]).find((b) => b && [...moveSetViews(b)].some((x) => x.view === from));
    if (!back) { missing++; console.log(`  no way back from ${e.view} to ${from}: ${o.id} keeps the default spot`); continue; }
    engine.navigateToView(e.view);
    const ap = engine.getApproach(back.id);
    if (!ap) continue;
    // Face into the room: toward the middle of the floor if he arrives at its left or right, else toward the camera.
    const fl = target.walk_area.floor, cx = fl.reduce((t, p) => t + p[0], 0) / fl.length;
    const facing = ap.x < cx - 120 ? 'right' : ap.x > cx + 120 ? 'left' : 'down';
    const at = { x: Math.round(ap.x), y: Math.round(ap.y), facing };
    if (!W.isOnFloor(target.walk_area, at)) {
      // nearest whole-number point that is on the floor (search outward from the exact stand point)
      let best = null;
      for (let r = 0; r <= 4 && !best; r++) for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) {
        const q = { x: Math.round(ap.x) + dx, y: Math.round(ap.y) + dy };
        if (W.isOnFloor(target.walk_area, q) && (!best || Math.hypot(q.x - ap.x, q.y - ap.y) < Math.hypot(best.x - ap.x, best.y - ap.y))) best = q;
      }
      if (best) { at.x = best.x; at.y = best.y; }
    }
    console.log(`  ${o.id} -> ${e.view}: at (${at.x}, ${at.y}) facing ${at.facing}  [by ${back.id}]`);
    e.at = at; changed++;
  }
}
console.log(`${changed} arrival spot(s) ${write ? 'written' : 'would be written'}${missing ? `, ${missing} exit(s) with no way back` : ''}`);
if (write && changed) {
  const text = JSON.stringify(s, null, 2).replace(/\[\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*\]/g, '[$1, $2]');
  writeFileSync(file, text + '\n');
}
