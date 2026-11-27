// Browser test: the caged prisoner's story (later conversations, promise, escape, route gift).
const L = require('./lib.cjs');
let failures = 0; const fail = (m) => { failures++; console.log('  FAIL', m); }; const ok = (m) => console.log('ok   ' + m);
(async () => {
  const g = await L.start(); await g.p.click('button:text-is("Debug ON")');
  const choices = () => g.p.$$eval('button', (bs) => bs.map((b) => b.innerText.replace(/^›\s*/, '').trim()).filter((t) => /^["\[]/.test(t)));
  const choose = async (txt) => { const b = await g.p.$(`button:has-text(${JSON.stringify(txt)})`); if (!b) { fail(`no choice "${txt}"`); return null; } await b.click(); await g.p.waitForTimeout(500); return L.msg(g); };
  const visible = (id) => g.p.evaluate((id) => !!document.querySelector(`[data-object-id="${id}"]`), id);

  await L.go(g, 'act1_feeding_station'); await L.dismiss(g);
  await L.A(g, 'talk', 'caged_prisoner');
  const first = await choices(); if (first.length !== 4) fail(`first talk shows ${first.length} choices`); else ok('first talk: 4 choices');
  await choose("We're both prisoners here"); await L.dismiss(g);
  await L.A(g, 'talk', 'caged_prisoner');
  const later = await choices();
  if (!later.some((c) => /ducts/.test(c)) || !later.some((c) => /promise/.test(c)) || !later.some((c) => /have to go/.test(c))) fail(`later talk choices: ${JSON.stringify(later)}`); else ok(`later talk offers: ${later.length} choices`);
  if (later.some((c) => /nutrient/.test(c))) fail('paste offer shown without the paste');
  const m = await choose('Do you know the ducts'); if (!/hot wind|Scorched mouths/i.test(m || '')) fail('ducts answer missing'); else ok('asks about the ducts: warns about the purge vents');
  await L.dismiss(g); await L.A(g, 'talk', 'caged_prisoner'); await choose('I\'ll find a way'); await L.dismiss(g);
  await L.A(g, 'talk', 'caged_prisoner'); if ((await choices()).some((c) => /promise/.test(c))) fail('promise offered twice'); else ok('promise made (and not offered again)');
  await choose('I have to go'); await L.dismiss(g);
  if (!(await visible('caged_prisoner'))) fail('prisoner missing before the override');
  if (await visible('prisoner_cage_scratches')) fail('scratches visible before the override');

  // Arm and press the override (code from the cataloguer close-up)
  await L.go(g, 'act1_lab_terminal_closeup'); await L.A(g, 'hand', 'lab_terminal_keypad'); await g.p.waitForTimeout(300);
  for (const k of ['fern', 'curl', 'sprout', 'sprout']) { await g.p.click(`button[data-key="${k}"]`); await g.p.waitForTimeout(80); }
  await g.p.waitForTimeout(600); await L.dismiss(g);
  await g.p.evaluate(() => window.__engine.applyEffects(['surgical_probe', 'emergency_suit_helmet', 'containment_key_card'].map((item) => ({ type: 'add_item', item }))));
  await L.go(g, 'act1_security_closeup'); await L.A(g, 'hand', 'sec_closeup_override_button'); await L.dismiss(g);

  // Walk back into the Feeding Station through the door so the arrival message fires
  await L.go(g, 'act1_containment_corridor'); const arrive = await L.A(g, 'move', 'nav_act1_containment_corridor_to_act1_feeding_station');
  await g.p.waitForTimeout(400); const page = await g.p.evaluate(() => document.body.innerText);
  if (await L.clearCutaways(g)) fail('the Curator glimpse played after the override (it would hide the arrival line)'); else ok('no Curator glimpse after the override');
  if (!/Keth-Vari is gone|middle cage stands open/.test(page + (arrive || ''))) fail('no message about the empty cage'); else ok('arriving: "the middle cage stands open. The Keth-Vari is gone."');
  await L.dismiss(g);
  if (await visible('caged_prisoner')) fail('prisoner still in the cage after the override'); else ok('prisoner gone after the override');
  if (!(await visible('prisoner_cage_scratches'))) fail('no scratches left for a kept promise'); else ok('scratches left in the cage');
  const look = await L.A(g, 'look', 'prisoner_cage_scratches'); await L.dismiss(g); if (!/kept its promise/.test(look || '')) fail('scratches look text');
  const take = await L.A(g, 'hand', 'prisoner_cage_scratches'); await L.dismiss(g); if (!/know the way through the ducts/.test(take || '')) fail('copying the route'); else ok('copied the route onto the map');
  const enc = await L.A(g, 'look', 'energy_barrier_enclosures'); await L.dismiss(g); if (!/barriers are down/.test(enc || '')) fail('enclosure look after escape'); else ok('enclosures describe the escape');

  // Duct hints now give directions
  await L.go(g, 'act1_v6_8_0'); await L.dismiss(g); const h = await L.hint(g, 'v6 8,0');
  if (!/scratched route says: toward the lever, go/.test(h || '')) fail(`duct hint: ${h}`); else ok(`duct hint with the route: "${h}"`);

  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL PRISONER TESTS PASSED');
  await g.b.close(); process.exit(failures ? 1 : 0);
})();
