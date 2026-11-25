// Browser test: the audit's toys and set pieces (orchid, hologram, cat, ring, score, alarm lights, the Keth-Vari in the ducts).
const L = require('./lib.cjs');
let failures = 0; const fail = (m) => { failures++; console.log('  FAIL', m); }; const ok = (m) => console.log('ok   ' + m);
(async () => {
  const g = await L.start();
  const visible = (id) => g.p.evaluate((id) => !!document.querySelector(`[data-object-id="${id}"]`), id);
  const score = () => g.p.evaluate(() => { const m = document.body.innerText.match(/Score: (\d+) of (\d+)/); return m ? [+m[1], +m[2]] : null; });

  const s0 = await score(); if (!s0 || s0[0] !== 0) fail(`score at start: ${JSON.stringify(s0)}`); else ok(`score shown: ${s0[0]} of ${s0[1]}`);

  // The orchid opens over three TALKs and gives you a spore (+2)
  await L.go(g, 'act1_cataloguer_closeup'); await L.dismiss(g);
  let last = '';
  for (let i = 0; i < 3; i++) { last = await L.A(g, 'talk', 'specimen_tank_right'); await L.dismiss(g); }
  if (!/glowing spore/.test(last || '')) fail(`orchid third talk: ${last}`); else ok('the orchid opens and gives you a spore');
  const s1 = await score(); if (!s1 || s1[0] !== 2) fail(`score after spore: ${JSON.stringify(s1)}`); else ok('spore scores 2 points');
  await L.A(g, 'talk', 'specimen_tank_right'); await L.dismiss(g);
  if ((await score())[0] !== 2) fail('spore scored twice'); else ok('points are awarded once');

  // The hologram spins like a slot machine
  await L.go(g, 'act1_specimen_archive'); await L.dismiss(g);
  const spin = await L.A(g, 'hand', 'holographic_display'); await L.dismiss(g);
  if (!/slot machine/.test(spin || '')) fail(`hologram: ${spin}`); else ok('the hologram spins');

  // The cat turns up on the security console after you pet it
  await L.go(g, 'act1_containment_corridor'); await L.dismiss(g);
  // the cat appears on your second return to the corridor
  for (let i = 0; i < 2; i++) {
    await L.A(g, 'move', 'nav_act1_containment_corridor_to_act1_feeding_station'); await L.clearCutaways(g); await L.dismiss(g);
    await L.A(g, 'move', 'nav_act1_feeding_station_to_act1_containment_corridor'); await L.dismiss(g);
  }
  if (!(await visible('black_cat'))) fail('no cat in the corridor on the second visit'); else {
    const items0 = await g.p.evaluate(() => window.__engine.getInventoryIds().length);
    const pet = await L.A(g, 'hand', 'black_cat'); await L.dismiss(g);
    const items1 = await g.p.evaluate(() => window.__engine.getInventoryIds().length);
    const petted = await g.p.evaluate(() => window.__engine.getFlags().cat_petted);
    if (!/purring/.test(pet || '') || petted !== 'true') fail(`petting the cat: ${pet}`); else ok('HAND pets the cat: it purrs, and remembers you');
    if (items1 !== items0) fail('petting the cat still gives an item'); else ok('no cat hair any more');
  }
  await L.go(g, 'act1_security_hub'); await L.dismiss(g);
  if (!(await visible('security_black_cat'))) fail('no cat on the security console'); else {
    const c = await L.A(g, 'hand', 'security_black_cat'); await L.dismiss(g);
    if (!/stylus/.test(c || '')) fail(`security cat: ${c}`); else ok('the cat is on the security console, knocking things off it');
  }

  // A wedding ring in the morgue
  await L.go(g, 'act1_morgue'); await L.dismiss(g);
  await L.A(g, 'hand', 'dead_goblin'); await L.dismiss(g);
  const r = await L.A(g, 'hand', 'dead_goblin'); await L.dismiss(g);
  if (!/gold ring/.test(r || '')) fail(`ring: ${r}`); else ok('the dead man\'s ring');
  await L.openInv(g);
  if (!(await g.p.$('button[title^="Wedding Ring"]'))) fail('ring not in inventory'); else ok('ring in the inventory');

  // Promise the prisoner freedom, press the override: alarm lights and the Keth-Vari waves from the junction
  await L.go(g, 'act1_feeding_station'); await L.dismiss(g);
  await L.A(g, 'talk', 'caged_prisoner'); await g.p.click('button:has-text("We\'re both prisoners here")'); await g.p.waitForTimeout(400); await L.dismiss(g);
  await L.A(g, 'talk', 'caged_prisoner'); await g.p.click('button:has-text("I\'ll find a way")'); await g.p.waitForTimeout(400); await L.dismiss(g);
  await L.go(g, 'act1_lab_terminal_closeup'); await L.A(g, 'hand', 'lab_terminal_keypad'); await g.p.waitForTimeout(300);
  for (const k of ['fern', 'curl', 'sprout', 'sprout']) { await g.p.click(`button[data-key="${k}"]`); await g.p.waitForTimeout(80); }
  await g.p.waitForTimeout(700); await L.dismiss(g);
  // the override waits until you carry what the ducts and the airlock demand
  await g.p.evaluate(() => window.__engine.applyEffects(['surgical_probe', 'emergency_suit_helmet', 'containment_key_card'].map((item) => ({ type: 'add_item', item }))));
  await L.go(g, 'act1_security_closeup'); const press = await L.A(g, 'hand', 'sec_closeup_override_button'); await L.dismiss(g);
  if (!/Four arms\. A blur\. Gone\./.test(press || '')) fail('override: no prisoner on the feed'); else ok('override: the prisoner escapes on the security feed');
  // v6: a kind player's Keth-Vari waits in the Warren's dwellings and scratches the torn half onto the map
  await g.p.evaluate(() => window.__engine.applyEffects([{ type: 'set_flag', flag: 'keth_path', value: 'ally' }, { type: 'set_flag', flag: 'in_thin_air', value: 'true' }]));
  await L.go(g, 'act1_v6_warren_dwellings'); await L.dismiss(g); await L.A(g, 'look', 'v6_workers'); await L.dismiss(g);
  if (!(await visible('v6_keth'))) fail('no Keth-Vari in the Warren dwellings'); else {
    const w = await L.A(g, 'talk', 'v6_keth'); await L.dismiss(g);
    if (!/torn half/.test(w || '') || (await g.p.evaluate(() => window.__engine.getFlags().keth_marks)) !== 'true') fail(`Keth-Vari marks: ${w}`); else ok('the Keth-Vari marks the torn half on your map');
  }
  const sEnd = await score(); ok(`score now ${sEnd[0]} of ${sEnd[1]}`);

  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL FEATURE TESTS PASSED');
  await g.b.close(); process.exit(failures ? 1 : 0);
})();
