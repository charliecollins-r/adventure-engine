// Full Act 1 playthrough in human order. Logs every response to full_log.json; screenshots to shots/.
const L = require('./lib.cjs');
const fs = require('fs');
const SC = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', '..', 'scenario.json'), 'utf8'));
const O = Object.fromEntries(SC.objects.map(o => [o.id, o]));
const V = Object.fromEntries(SC.views.map(v => [v.id, v]));
fs.mkdirSync('shots', { recursive: true });
const LOG = [];
const SKIP = new Set(['lab_startup_display', 'security_console', 'cataloguer_robot']);
(async () => { const g = await L.start();
  let view = '';
  const rec = (verb, target, text) => { LOG.push({ view, verb, target, text }); };
  const shot = async (name) => { await L.dismiss(g); await g.p.waitForTimeout(350); await g.p.screenshot({ path: `shots/${name}.png`, clip: { x: g.vp.x, y: g.vp.y, width: 960, height: 540 } }); };
  const A = async (verb, id) => { const t = await L.A(g, verb, id); rec(verb, id, t); await L.dismiss(g); return t; };
  const U = async (itemId, id) => { const name = SC.items.find(i => i.id === itemId).name; const t = await L.U(g, name, id); rec('use:' + itemId, id, t); await L.dismiss(g); return t; };

  // Natural navigation: walk through doors (fires on-enter effects), leave close-ups with the back button.
  const EDGES = {};
  for (const v of SC.views) for (const oid of v.objects) { const o = O[oid]; if (!o) continue;
    for (const it of o.interactions || []) if (it.verb === 'move' && !(it.when || []).length) for (const e of it.then || []) if (e.type === 'set_view') (EDGES[v.id] ||= []).push([oid, e.view]); }
  const back = async () => { await L.dismiss(g); const b = await g.p.$('text=/^◀/'); if (b) { await b.click(); await g.p.waitForTimeout(500); } view = V[view].back_to || null; };
  const go = async (target) => {
    if (view && V[view] && V[view].back_label) { await L.dismiss(g); const b = await g.p.$(`text=${V[view].back_label}`); if (b) { await b.click(); await g.p.waitForTimeout(500); } view = PARENT[view]; }
    if (!view) { view = target; await L.go(g, target); await g.p.waitForTimeout(400); return; }
    if (view === target) return;
    const prev = { [view]: null }; const q = [view];
    while (q.length) { const c = q.shift(); if (c === target) break; for (const [nav, to] of EDGES[c] || []) if (!(to in prev)) { prev[to] = [c, nav]; q.push(to); } }
    if (!(target in prev)) { await L.go(g, target); view = target; return; }
    const path = []; for (let c = target; prev[c]; c = prev[c][0]) path.unshift(prev[c][1]);
    for (const nav of path) { await L.A(g, 'move', nav); await L.dismiss(g); await g.p.waitForTimeout(250); }
    view = target; await g.p.waitForTimeout(300);
  };
  const PARENT = { act1_lab_terminal_closeup: 'act1_processing_lab', act1_security_closeup: 'act1_security_hub', act1_cataloguer_closeup: 'act1_stasis_hold' };

  const lookAll = async (v) => { for (const oid of V[v].objects) { if (oid.startsWith('nav_') || O[oid].initially_visible === false || SKIP.has(oid)) continue; await A('look', oid); } };
  const keypad = async (seq) => { await A('hand', 'lab_terminal_keypad'); await g.p.waitForTimeout(300); for (const k of seq) { await g.p.click(`button[data-key="${k}"]`); await g.p.waitForTimeout(90); } await g.p.waitForTimeout(700); };
  try {
    await g.p.click('button:text-is("Debug ON")');
    // 1. Stasis Hold
    await go('act1_stasis_hold'); await shot('01_stasis_hold'); await lookAll(view);
    await A('hand', 'specimen_tag_hook'); await A('hand', 'broken_pod'); await A('hand', 'pod_drainage_channel'); await A('hand', 'cataloguer_robot');
    await L.hint(g, 'stasis start');
    // 2. Corridor
    await go('act1_containment_corridor'); await shot('02_corridor'); await lookAll(view);
    await A('move', 'vent_cover'); await L.hint(g, 'corridor');
    // 3. Processing Lab
    await go('act1_processing_lab'); await shot('03_processing_lab'); await lookAll(view);
    await A('hand', 'restraint_straps'); await U('pod_glass_shard', 'restraint_straps');
    await A('hand', 'instrument_rack'); await A('hand', 'sample_jars');
    await U('surgical_probe', 'restraint_straps');
    await A('look', 'lab_startup_display'); view = 'act1_lab_terminal_closeup'; await shot('04_lab_terminal'); await lookAll(view);
    await keypad(['spiral', 'trident', 'fern', 'curl']); await g.p.screenshot({ path: 'shots/05_keypad_wrong.png', clip: { x: g.vp.x, y: g.vp.y - 10, width: 960, height: 560 } });
    rec('keypad', 'wrong', await g.p.evaluate(() => [...document.querySelectorAll('div')].map(d => d.innerText).find(t => /buzz|Red again/.test(t || ''))?.split('\n').find(l => /buzz|Red/.test(l))));
    await g.p.keyboard.press('Escape'); await g.p.waitForTimeout(300); await L.hint(g, 'terminal no code');
    // 4. Security Hub
    await go('act1_security_hub'); await shot('06_security_hub'); await lookAll(view);
    await A('hand', 'key_card_drawer'); await A('hand', 'emergency_cabinet'); await shot('07_security_hub_helmet');
    await A('look', 'security_console'); view = 'act1_security_closeup'; await shot('08_security_closeup_dark'); await lookAll(view);
    await A('hand', 'sec_closeup_override_button_dark'); await L.hint(g, 'sec closeup dark');
    await go('act1_containment_corridor'); await shot('09a_corridor_cat'); await A('look', 'black_cat'); await A('hand', 'black_cat');
    // 5. Feeding Station
    await go('act1_feeding_station'); await shot('09_feeding_station'); await lookAll(view);
    await A('hand', 'nutrient_dispenser');
    await L.A(g, 'talk', 'caged_prisoner'); await g.p.waitForTimeout(400);
    const lbl = '"Do you know a way out of here?"';
    const ok = await g.p.$('button:has-text("Do you know a way out")'); if (ok) { await g.p.screenshot({ path: 'shots/10_dialogue.png', clip: { x: g.vp.x, y: g.vp.y, width: 960, height: 540 } }); await ok.click(); await g.p.waitForTimeout(500); rec('dialogue', lbl, await L.msg(g)); }
    await L.dismiss(g); await L.hint(g, 'feeding');
    // 6. Morgue
    await go('act1_morgue'); await shot('11_morgue'); await lookAll(view);
    await A('hand', 'morgue_carcass_hook'); await A('hand', 'neural_tendril_sample');
    // 7. Archive
    await go('act1_specimen_archive'); await shot('12_archive'); await lookAll(view);
    await A('hand', 'personal_log_crystal'); await U('data_crystal_personal_log', 'reading_device'); await U('specimen_tag', 'reading_device');
    // 8. Combine + the gap
    await L.combine(g, 'Restraint Strap', 'Carcass Hook'); rec('combine', 'strap+hook', await L.msg(g)); await L.dismiss(g);
    await L.openInv(g); await g.p.screenshot({ path: 'shots/13_inventory.png', clip: { x: g.vp.x, y: g.vp.y, width: 960, height: 540 } });
    await go('act1_stasis_hold'); await U('empty_sample_jar', 'pod_drainage_channel'); await U('grappling_line', 'platform_gap'); await shot('14_stasis_rigged');
    await A('look', 'cataloguer_robot'); view = 'act1_cataloguer_closeup'; await shot('15_cataloguer_closeup'); await lookAll(view);
    // 9. Terminal + override
    await go('act1_processing_lab'); await shot('15a_lab_drag_marks'); await go('act1_containment_corridor'); await go('act1_processing_lab'); await shot('15b_lab_growth');
    await A('look', 'corridor_drag_marks'); await A('look', 'corridor_organic_growth'); await U('pod_glass_shard', 'corridor_organic_growth'); await U('cat_hair', 'examination_tables');
    await A('look', 'lab_startup_display'); view = 'act1_lab_terminal_closeup'; await keypad(['fern', 'curl', 'sprout', 'thorn']); rec('keypad', 'correct', await L.msg(g)); await L.dismiss(g);
    await A('look', 'lab_terminal_screen');
    await go('act1_security_hub'); await A('look', 'security_console'); view = 'act1_security_closeup'; await shot('16_security_closeup_armed'); await A('look', 'sec_closeup_override_button'); await A('hand', 'sec_closeup_override_button');
    // 10. Vents
    await go('act1_containment_corridor'); await A('move', 'vent_cover'); view = 'act1_ventilation_shaft'; await shot('17_vent_shaft'); await lookAll(view);
    await A('hand', 'wall_scratches'); await L.hint(g, 'shaft');
    await A('move', 'nav_act1_vent_entry_to_act1_vent_junction'); view = 'act1_vent_junction'; await shot('18_vent_junction'); await lookAll(view); await L.hint(g, 'junction');
    // side trip to the skeleton (route computed from vent_maze_grid.json)
    for (const st of L.mazeRoute('J', 'COLL')) { await A('move', st.nav); view = st.view; }
    await shot('19_vent_collapsed'); await lookAll(view); await A('hand', 'collapsed_skeleton'); await A('hand', 'collapsed_skeleton');
    for (const st of L.mazeRoute('COLL', 'J')) { await A('move', st.nav); view = st.view; }
    // main route to the gas chamber (computed; the last step enters the gas)
    { const r = L.mazeRoute('J', 'GAS'); for (const st of r.slice(0, -1)) { await A('move', st.nav); view = st.view; } await L.hint(g, view); globalThis.__lastNav = r[r.length - 1].nav; }
    await A('move', globalThis.__lastNav); view = 'act1_vent_gas_chamber'; await shot('20_vent_gas'); await lookAll(view);
    await A('move', 'nav_act1_vent_gas_to_act1_vent_fan_room'); view = 'act1_vent_fan_room'; await shot('21_vent_fan'); await lookAll(view);
    await U('surgical_probe', 'fan_mechanism'); await shot('22_vent_fan_jammed');
    await A('move', 'vent_fan'); view = 'act1_vent_exit'; await shot('23_vent_exit'); await lookAll(view);
    await A('move', 'exit_hatch'); view = 'act1_airlock_bay'; await shot('24_airlock_bay'); await lookAll(view);
    await U('containment_key_card', 'airlock_override_panel'); await shot('25_airlock_done'); await L.hint(g, 'airlock end');
    await A('look', 'airlock_override_panel'); await A('hand', 'airlock_override_panel'); await A('hand', 'blast_doors');
  } catch (e) { console.log('ERR at', view, e.message.split('\n')[0]); }
  for (const l of g.log) if (l.startsWith('[HINT')) LOG.push({ view: 'hint', verb: 'hint', target: l.slice(6, l.indexOf(']')), text: l.slice(l.indexOf(']') + 2) });
  fs.writeFileSync('full_log.json', JSON.stringify(LOG, null, 1));
  console.log('logged', LOG.length, 'entries; nulls:', LOG.filter(x => !x.text).map(x => x.verb + ' ' + x.target).join(', '));
  await g.b.close(); })();
