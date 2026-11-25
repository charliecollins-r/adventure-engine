// Browser test: the grappling-line crossing. Rig the line, HAND it to climb across to the cataloguer's ledge
// (a second floor), read the cataloguer from there, and climb back to leave.
// Usage: node rope.cjs [screenshot-dir]   (dev server on :5173)
const L = require('./lib.cjs');
const OUT = process.argv[2];
let failures = 0; const fail = (m) => { failures++; console.log('  FAIL', m); }; const ok = (m) => console.log('ok   ' + m);
(async () => {
  const g = await L.start();
  const flag = (f) => g.p.evaluate((f) => window.__engine.getFlags()[f], f);
  const view = () => g.p.evaluate(() => window.__engine.getCurrentView().id);
  const feet = () => g.p.evaluate(() => { const p = window.__engine.getCharacterPlacement(); return [Math.round(p.x), Math.round(p.y)]; });
  const visible = (id) => g.p.evaluate((id) => !!document.querySelector(`[data-object-id="${id}"]`), id);

  await L.go(g, 'act1_stasis_hold'); await L.dismiss(g);
  await g.p.evaluate(() => window.__engine.applyEffects([{ type: 'add_item', item: 'grappling_line' }]));
  const rig = await L.U(g, 'Grappling Line', 'platform_gap'); await L.dismiss(g);
  if (!/It.ll hold/.test(rig || '')) fail(`rigging: ${rig}`); else ok('using the line on the gap rigs it (no crossing yet)');
  if (await flag('on_far_ledge') === 'true') fail('crossed without HAND'); else ok('still on this side');
  const early = await L.A(g, 'look', 'cataloguer_robot'); await L.dismiss(g);
  if (!/too far to read/.test(early || '')) fail(`robot from this side: ${early}`); else ok('the cataloguer is too far to read from this side');

  // HAND the line: he walks to it, then climbs across
  await L.setVerb(g, 'hand');
  const [lx, ly] = [664, 592 - 40];
  const pt = L.sp(g, lx, ly); await g.p.mouse.click(pt.x, pt.y);
  const samples = [];
  for (let i = 0; i < 16; i++) { await g.p.waitForTimeout(400); samples.push(await feet()); if (OUT && i === 7) await L.shot(g, `${OUT}/rope_mid`); }
  console.log('     feet along the way:', JSON.stringify(samples));
  await g.p.waitForTimeout(800); await L.dismiss(g);
  const [fx, fy] = await feet();
  if (await flag('on_far_ledge') !== 'true' || fx < 690 || fy > 500) fail(`not on the ledge: flag ${await flag('on_far_ledge')} feet ${fx},${fy}`); else ok(`climbed across onto the ledge (${fx},${fy})`);
  if (!(await visible('gap_grappling_line')) || (await visible('gap_line_bounce'))) fail('the resting line did not come back'); else ok('the line settles back after the crossing');
  if (OUT) await L.shot(g, `${OUT}/rope_ledge`);

  // Clicks on the ledge stay on the ledge
  const far = L.sp(g, 300, 690); await L.setVerb(g, 'move'); await g.p.mouse.click(far.x, far.y); await g.p.waitForTimeout(1500);
  const [mx, my] = await feet();
  if (mx < 690) fail(`walked off the ledge to ${mx},${my}`); else ok('clicking the far floor keeps him on the ledge');
  const exit = await L.A(g, 'move', 'nav_act1_stasis_hold_to_act1_containment_corridor'); await L.dismiss(g);
  if (!/climb back across/.test(exit || '') || (await view()) !== 'act1_stasis_hold') fail(`left from the ledge: ${exit}`); else ok("can't leave the room from the ledge");

  // The cataloguer, up close
  await L.A(g, 'hand', 'cataloguer_robot'); await g.p.waitForTimeout(800); await L.dismiss(g);
  if ((await view()) !== 'act1_cataloguer_closeup') fail(`robot from the ledge: ${await view()}`); else ok('from the ledge, the cataloguer close-up opens');
  await g.p.click('text=◀ Stasis Hold').catch(() => {}); await g.p.waitForTimeout(900); await L.dismiss(g);
  const [bx] = await feet(); if (bx < 690) fail('came back from the close-up off the ledge'); else ok('back from the close-up, still on the ledge');

  // And back again
  await L.setVerb(g, 'hand'); const pt2 = L.sp(g, lx, ly); await g.p.mouse.click(pt2.x, pt2.y);
  await g.p.waitForTimeout(6500); await L.dismiss(g);
  const [rx, ry] = await feet();
  if (await flag('on_far_ledge') === 'true' || rx > 520) fail(`not back: flag ${await flag('on_far_ledge')} feet ${rx},${ry}`); else ok(`climbed back (${rx},${ry})`);
  const leave = await L.A(g, 'move', 'nav_act1_stasis_hold_to_act1_containment_corridor'); await g.p.waitForTimeout(600);
  if ((await view()) !== 'act1_containment_corridor') fail(`could not leave: ${leave}`); else ok('and walk out of the room');

  // Jumping the gap without the line: he leaps, falls out of view, and only then does the death screen come up
  // (a fresh game: the line is not rigged)
  await g.b.close();
  const j = await L.start(); g.b = j.b; g.p = j.p; g.vp = j.vp; g.verb = j.verb;
  await L.setVerb(g, 'hand');
  const gap = await g.p.$('[data-object-id="platform_gap"]'); const gb = await gap.boundingBox();
  await g.p.mouse.click(gb.x + gb.width / 2, gb.y + gb.height / 2);
  let sawFall = false, overEarly = false;
  for (let i = 0; i < 40 && !sawFall; i++) {
    await g.p.waitForTimeout(100);
    sawFall = await g.p.evaluate(() => [...document.querySelectorAll('div')].some((d) => /character_rope/.test(d.style.backgroundImage)));
    if (!sawFall && await g.p.evaluate(() => window.__engine.isGameOver())) overEarly = true;
  }
  if (!sawFall) fail('no falling pose after the leap'); else ok('he leaps and falls (arms up)');
  if (overEarly) fail('death screen before the fall');
  await g.p.waitForTimeout(3000);
  const dead = await g.p.evaluate(() => window.__engine.getGameOverResult()?.title);
  if (dead !== 'Look Before You Leap') fail(`after the fall: ${dead}`); else ok('then the death screen');

  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL ROPE TESTS PASSED');
  await g.b.close(); process.exit(failures ? 1 : 0);
})();
