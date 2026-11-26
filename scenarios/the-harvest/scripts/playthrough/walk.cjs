// Browser test for click-to-walk (docs/WALKABLE_AREAS.md) across every walking view of Act 1.
// Needs the dev server (cd client && npm run dev). Exit code 1 on any failure.
const L = require('./lib.cjs');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createRequire } = require('module');

const root = path.join(__dirname, '..', '..', '..', '..');
const esbuild = createRequire(path.join(root, 'client', 'package.json'))('esbuild');
const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'walk-e2e-')), 'walk.cjs');
esbuild.buildSync({ stdin: { contents: "export * from './walkable'; export { ScenarioEngine } from './ScenarioEngine';", resolveDir: path.join(root, 'client/src/engine'), loader: 'ts' }, bundle: true, platform: 'node', format: 'cjs', outfile: out, logLevel: 'error' });
const W = require(out);
const SC = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'scenario.json'), 'utf8'));
// the vent maze's duct screens share a handful of paintings and one floor: walk one screen of each kind
const kinds = new Set();
const views = SC.views.filter((v) => v.id.startsWith('act1') && v.walk_area && v.character).filter((v) => {
  if (!v.id.startsWith('act1_v6_')) return true;
  const k = v.background_file + JSON.stringify(v.walk_area);
  if (kinds.has(k)) return false;
  kinds.add(k); return true;
});
const engine = new W.ScenarioEngine(SC);

let failures = 0;
const fail = (m) => { failures++; console.log('  FAIL', m); };
const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };

(async () => {
  const g = await L.start(); await g.p.click('button:text-is("Debug ON")');
  const feet = () => g.p.evaluate((vp) => { const d = [...document.querySelectorAll('div')].find((d) => /character_/.test(d.style.backgroundImage)); if (!d) return null; const r = d.getBoundingClientRect(); return { x: r.x - vp.x + r.width / 2, y: (r.y - vp.y + r.height) / 0.75, set: (d.style.backgroundImage.match(/character_\w+/) || [''])[0], z: +d.style.zIndex, flip: d.style.transform, h: r.height }; }, g.vp);
  const topIdAt = (x, y) => g.p.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); const h = el && el.closest('[data-object-id]'); return h ? h.getAttribute('data-object-id') : (el && el.closest('[data-object-hotspot]') ? '__hotspot__' : null); }, [g.vp.x + x, g.vp.y + y * 0.75]);
  // Walk until settled; returns all samples.
  const track = async (maxMs = 9000) => { const s = []; const t0 = Date.now(); let still = 0; while (Date.now() - t0 < maxMs) { const f = await feet(); s.push(f); still = f && !/walk/.test(f.set) ? still + 1 : 0; if (still >= 4) break; await g.p.waitForTimeout(30); } return s; };

  let off = null; // measuring offset between DOM feet and engine coordinates
  for (const v of views) {
    const area = v.walk_area; const r = rng(v.id.length * 7919);
    await L.go(g, v.id); await g.p.waitForTimeout(400); await L.dismiss(g);
    const f0 = await feet(); if (!f0) { fail(`${v.id}: no character`); continue; }
    if (!off) off = { x: f0.x - v.character.x, y: f0.y - v.character.y };
    await L.setVerb(g, 'move');
    let ok = 0, tried = 0;
    for (let n = 0; n < 40 && ok < 5; n++) {
      const xs = area.floor.map((p) => p[0]), ys = area.floor.map((p) => p[1]);
      const t = { x: Math.round(Math.min(...xs) + r() * (Math.max(...xs) - Math.min(...xs))), y: Math.round(Math.min(...ys) + r() * (Math.max(...ys) - Math.min(...ys))) };
      if (!W.isOnFloor(area, t) || t.y > 715) continue;
      const hit = await topIdAt(t.x, t.y);
      if (hit === '__hotspot__' || (hit && engine.isExit(hit))) continue; // the back button, or a door: that's a different test
      tried++;
      await g.p.mouse.click(g.vp.x + t.x, g.vp.y + t.y * 0.75);
      const s = await track(); const end = s[s.length - 1];
      const ex = end.x - off.x, ey = end.y - off.y;
      if (Math.hypot(ex - t.x, ey - t.y) > 3) { fail(`${v.id}: walked to (${ex.toFixed(1)}, ${ey.toFixed(1)}) instead of (${t.x}, ${t.y})`); continue; }
      const offFloor = s.filter((q) => q).map((q) => ({ x: q.x - off.x, y: q.y - off.y })).filter((q) => { const nf = W.nearestFloorPoint(area, q); return Math.hypot(nf.x - q.x, nf.y - q.y) > 2.5; });
      if (offFloor.length) { fail(`${v.id}: ${offFloor.length} frames off the floor, e.g. (${offFloor[0].x.toFixed(1)}, ${offFloor[0].y.toFixed(1)})`); continue; }
      if (!s.some((q) => q && /walk/.test(q.set)) && Math.hypot(t.x - (f0.x - off.x), t.y - (f0.y - off.y)) > 40) fail(`${v.id}: never used a walk sprite`);
      ok++;
      await L.dismiss(g);
    }
    console.log(`${ok === tried && ok > 0 ? 'ok  ' : 'FAIL'} ${v.id}: ${ok}/${tried} walks landed, every frame on the floor`);
    if (ok === 0) failures++;
  }

  // Behaviour checks in specific rooms
  const at = async (id) => { const el = await g.p.$(`[data-object-id="${id}"]`); const b = await el.boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
  const engineFeet = async () => { const f = await feet(); return { x: f.x - off.x, y: f.y - off.y, set: f.set, flip: f.flip, z: f.z, h: f.h }; };

  // 1. Hand walks first, message only on arrival
  await L.go(g, 'act1_security_hub'); await L.dismiss(g); await L.setVerb(g, 'hand');
  { const [x, y] = await at('emergency_cabinet'); await g.p.mouse.click(x, y); await g.p.waitForTimeout(150);
    const early = await g.p.evaluate(() => !!document.body.innerText.match(/cabinet|helmet/i) && !!document.body.innerText.includes('click to dismiss'));
    await track(); const m = await L.msg(g); const f = await engineFeet();
    const ap = (engine.navigateToView('act1_security_hub'), engine.getApproach('emergency_cabinet'));
    if (early) fail('Hand: message showed before he arrived');
    if (!m || !/helmet|cabinet/i.test(m)) fail(`Hand: no cabinet message after arriving (${m})`);
    if (Math.hypot(f.x - ap.x, f.y - ap.y) > 3) fail(`Hand: stood at (${f.x.toFixed(0)}, ${f.y.toFixed(0)}), expected the cabinet's stand point (${ap.x.toFixed(0)}, ${ap.y.toFixed(0)})`);
    if (!/helmet/.test(f.set)) fail(`Helmet: idle sprite after taking the helmet is ${f.set}`);
    console.log('ok   Hand walks to the cabinet, then the helmet message; helmet sprite on'); await L.dismiss(g); }

  // 2. Helmet walk cycle
  await L.setVerb(g, 'move'); await g.p.mouse.click(g.vp.x + 800, g.vp.y + 640 * 0.75); await g.p.waitForTimeout(200);
  { const f = await feet(); if (!/walk_helmet/.test(f.set)) fail(`Helmet: walking uses ${f.set}, expected character_walk_helmet`); else console.log('ok   helmeted walk cycle'); await track(); }

  // 3. Look turns in place
  await L.setVerb(g, 'look'); { const b = await engineFeet(); const [x, y] = await at('key_card_drawer'); await g.p.mouse.click(x, y); await g.p.waitForTimeout(400); const a = await engineFeet();
    if (Math.hypot(a.x - b.x, a.y - b.y) > 1) fail('Look: he moved'); else console.log('ok   Look stays put'); await L.dismiss(g); }

  // 4. Close-up keeps his spot: Hand the console (walks, opens close-up), Back returns him to the same spot
  await L.setVerb(g, 'hand'); { const [x, y] = await at('security_console'); await g.p.mouse.click(x, y); await track(); await L.msg(g); await L.dismiss(g);
    const inClose = await g.p.$('text=/^◀/'); const before = (engine.navigateToView('act1_security_hub'), engine.getApproach('security_console'));
    if (!inClose) fail('Close-up: Hand on the console did not open it');
    else { await inClose.click(); await g.p.waitForTimeout(600); const a = await engineFeet(); if (Math.hypot(a.x - before.x, a.y - before.y) > 3) fail(`Close-up: back at (${a.x.toFixed(0)}, ${a.y.toFixed(0)}), expected (${before.x.toFixed(0)}, ${before.y.toFixed(0)})`); else console.log('ok   leaving the close-up puts him back at the console'); } }

  // 5. Redirect mid-walk
  await L.setVerb(g, 'move'); await g.p.mouse.click(g.vp.x + 900, g.vp.y + 600 * 0.75); await g.p.waitForTimeout(250); await g.p.mouse.click(g.vp.x + 100, g.vp.y + 640 * 0.75);
  { await track(); const a = await engineFeet(); if (Math.hypot(a.x - 100, a.y - 640) > 3) fail(`Redirect: ended at (${a.x.toFixed(0)}, ${a.y.toFixed(0)})`); else console.log('ok   a new click redirects mid-walk'); }

  // 6. Doors: walk there, change room, arrive at the `at` spot
  { const navId = 'nav_act1_security_hub_to_act1_containment_corridor'; const [x, y] = await at(navId); await g.p.mouse.click(x, y); await track(); await g.p.waitForTimeout(500); await L.dismiss(g);
    const label = await g.p.evaluate(() => [...document.querySelectorAll('div')].map((d) => d.innerText).find((t) => t === 'Containment Corridor'));
    const sv = SC.objects.find((o) => o.id === navId).interactions.flatMap((i) => i.then || []).find((e) => e.type === 'set_view');
    const a = await engineFeet();
    if (!label) fail('Door: room did not change');
    // character.walk_in: he comes in at the `at` spot by the door and walks a few steps into the room (here: leftward from Security)
    else if (Math.hypot(a.x - sv.at.x, a.y - sv.at.y) > 160 || a.x >= sv.at.x - 20) fail(`Door: ended at (${a.x.toFixed(0)}, ${a.y.toFixed(0)}), expected a few steps in from (${sv.at.x}, ${sv.at.y})`);
    else console.log(`ok   door: walked out, came in by the Security door at (${sv.at.x}, ${sv.at.y}) and walked in to (${a.x.toFixed(0)}, ${a.y.toFixed(0)})`); }

  // 7. Draw order: the character is drawn in front of sprites whose base is above his feet, behind those below
  { const zs = await g.p.evaluate(() => [...document.querySelectorAll('[data-object-id]')].map((d) => ({ id: d.getAttribute('data-object-id'), z: +d.style.zIndex })).filter((x) => x.z >= 10));
    const f = await engineFeet(); const objs = Object.fromEntries(SC.objects.map((o) => [o.id, o]));
    const front = SC.character.draw_order === 'front';
    const wrong = zs.filter((s) => { const o = objs[s.id]; if (o.layer === 'front') return s.z < f.z; if (o.layer === 'floor' || front) return s.z > f.z; const by = o.position.y; return (by < f.y - 2 && s.z > f.z) || (by > f.y + 2 && s.z < f.z); });
    if (wrong.length) fail(`Depth: wrong order for ${wrong.map((w) => w.id).join(', ')}`); else console.log(`ok   depth order (${zs.length} sprites in the layer; character draw_order ${SC.character.draw_order || 'sorted'})`); }

  // 8. The character never swallows clicks (vent cover under him)
  { await L.setVerb(g, 'move'); await g.p.mouse.click(g.vp.x + 480, g.vp.y + 600 * 0.75); await track(); await L.setVerb(g, 'look');
    const [x, y] = await at('vent_cover'); const id = await g.p.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); return el && el.closest('[data-object-id]') && el.closest('[data-object-id]').getAttribute('data-object-id'); }, [x, y]);
    if (id !== 'vent_cover') fail(`Pass-through: clicking the vent cover hits ${id}`); else console.log('ok   standing on the vent cover, clicks still reach it'); }

  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL WALK TESTS PASSED');
  await g.b.close(); process.exit(failures ? 1 : 0);
})();
