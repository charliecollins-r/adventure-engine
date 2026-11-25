// Browser test: the alarm escape. The override waits until you carry what the ducts need; after it, the corridor
// grate opens, every other room has a hunter (caught, with Undo), and the open vent is the way out.
// Usage: node alarm.cjs [screenshot-dir]   (dev server on :5173)
const L = require('./lib.cjs');
const OUT = process.argv[2];
let failures = 0; const fail = (m) => { failures++; console.log('  FAIL', m); }; const ok = (m) => console.log('ok   ' + m);
(async () => {
  const g = await L.start();
  const visible = (id) => g.p.evaluate((id) => !!document.querySelector(`[data-object-id="${id}"]`), id);
  const view = () => g.p.evaluate(() => window.__engine.getCurrentView().id);
  const give = (items) => g.p.evaluate((items) => { window.__engine.applyEffects(items.map((item) => ({ type: 'add_item', item }))); }, items);

  // arm the override: unlock the lab terminal with the glyph code
  await L.go(g, 'act1_lab_terminal_closeup'); await L.A(g, 'hand', 'lab_terminal_keypad'); await g.p.waitForTimeout(300);
  for (const k of ['fern', 'curl', 'sprout', 'sprout']) { await g.p.click(`button[data-key="${k}"]`); await g.p.waitForTimeout(80); }
  await g.p.waitForTimeout(700); await L.dismiss(g);

  // 1. Not ready: the button refuses
  await L.go(g, 'act1_security_closeup');
  const early = await L.A(g, 'hand', 'sec_closeup_override_button'); await L.dismiss(g);
  if (!/not ready/.test(early || '')) fail(`pressed without the gear: ${early}`); else ok('without probe, helmet and key card the override waits');
  const flag = await g.p.evaluate(() => window.__engine.getFlags().security_locks_overridden);
  if (flag === 'true') fail('override fired anyway'); else ok('no alarm yet');

  // 2. Ready: press it
  await give(['surgical_probe', 'emergency_suit_helmet', 'containment_key_card']);
  const press = await L.A(g, 'hand', 'sec_closeup_override_button'); await L.dismiss(g);
  if (!/every door, grate and seal/.test(press || '')) fail(`override: ${press}`); else ok('with the gear, the override fires');

  // 3. Back through the real doors: the grate opens in the corridor
  await L.go(g, 'act1_security_hub'); await L.dismiss(g);
  if (await visible('alarm_hunter_security_hub')) fail('hunter in security before leaving it'); else ok('security hub is still safe until you leave');
  await L.A(g, 'move', 'nav_act1_security_hub_to_act1_containment_corridor');
  const open = await L.msg(g);
  if (!/The vent, now\./.test(open || '')) fail(`no vent-opening moment: ${open}`); else ok('back in the corridor: the alarm opens the grate');
  await L.dismiss(g);
  if (!(await visible('vent_cover_open')) || (await visible('vent_cover'))) fail('grate sprite did not switch to open'); else ok('the open grate replaces the closed one');
  if (OUT) await L.shot(g, `${OUT}/alarm_corridor`);

  // 4. Any other door: caught, with Undo
  for (const [nav, room] of [['nav_act1_containment_corridor_to_act1_processing_lab', 'processing_lab'], ['nav_act1_containment_corridor_to_act1_security_hub', 'security_hub'],
                             ['nav_act1_containment_corridor_to_act1_stasis_hold', 'stasis_hold']]) {
    await L.A(g, 'move', nav); await g.p.waitForTimeout(2600);
    if (OUT && room === 'processing_lab') await g.p.screenshot({ path: `${OUT}/alarm_caught.png` });
    const body = await g.p.evaluate(() => document.body.innerText);
    if (!/caught/i.test(body)) fail(`${room}: not caught`); else ok(`${room}: a hunter is waiting (caught)`);
    const undo = await g.p.$('[data-undo]');
    if (!undo) { fail(`${room}: no undo`); break; }
    await undo.click(); await g.p.waitForTimeout(900); await L.dismiss(g);
    if ((await view()) !== 'act1_containment_corridor') fail(`${room}: undo did not return to the corridor (${await view()})`); else ok(`${room}: undo puts you back in the corridor`);
  }

  // 5. The Feeding Station stays open (the escaped prisoner's route waits there); the rooms beyond it are guarded
  await L.A(g, 'move', 'nav_act1_containment_corridor_to_act1_feeding_station'); await L.clearCutaways(g); await g.p.waitForTimeout(2600);
  if (/caught/i.test(await g.p.evaluate(() => document.body.innerText)) || (await view()) !== 'act1_feeding_station') fail('feeding station should be safe'); else ok('feeding station: open, no hunter');
  await L.dismiss(g);
  for (const [nav, room] of [['nav_act1_feeding_station_to_act1_morgue', 'morgue'], ['nav_act1_feeding_station_to_act1_specimen_archive', 'specimen_archive']]) {
    await L.A(g, 'move', nav); await g.p.waitForTimeout(2600);
    if (!/caught/i.test(await g.p.evaluate(() => document.body.innerText))) fail(`${room}: not caught`); else ok(`${room}: a hunter is waiting (caught)`);
    const undo = await g.p.$('[data-undo]'); if (!undo) { fail(`${room}: no undo`); break; }
    await undo.click(); await g.p.waitForTimeout(900); await L.dismiss(g);
  }
  await L.A(g, 'move', 'nav_act1_feeding_station_to_act1_containment_corridor'); await g.p.waitForTimeout(600); await L.dismiss(g);

  // 6. The vent is the way out
  await L.A(g, 'move', 'vent_cover_open'); await g.p.waitForTimeout(800); await L.dismiss(g);
  if ((await view()) !== 'act1_ventilation_shaft') fail(`vent: ended in ${await view()}`); else ok('down the open vent into the shaft');

  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL ALARM TESTS PASSED');
  await g.b.close(); process.exit(failures ? 1 : 0);
})();
