// Browser suite for the vent maze v6: plays the whole route in the real UI (clicking the real exits, waiting for
// breathing ducts' in-breaths), the Audience's rhythm widget with real mouse presses, the Purge Heart, and then
// checks the Warren's sensing Wardens, listening, and "Restart from" checkpoints with patrols on.
// Needs the dev server (cd client && npm run dev). Screenshots in shots/v6_*.png.
const L = require('./lib.cjs');
const fs = require('fs');
const path = require('path');
const grid = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vent_maze_v6_grid.json'), 'utf8'));

const fails = [];
const check = (ok, what) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}`); if (!ok) fails.push(what); };

async function viewOf(g, c) {
  return g.p.evaluate(([x, y]) => window.__engine.getScenario().views.find((v) => v.map_xy && v.map_xy[0] === x && v.map_xy[1] === 14 - y)?.id, c);
}
async function closeups(g) {
  if (await g.p.evaluate(() => !!window.__engine.getCloseupImage())) {
    await g.p.keyboard.press('Escape');
    await g.p.waitForTimeout(300);
  }
}
async function cur(g) { return g.p.evaluate(() => window.__engine.currentViewId); }
async function flag(g, f) { return g.p.evaluate((f) => window.__engine.getFlags()[f], f); }

/** Click the exit in this view that leads to `view`, after its breathing duct's in-breath if it has one. */
async function goTo(g, view) {
  const info = await g.p.evaluate((view) => {
    const e = window.__engine;
    const targets = (effs, out = []) => { for (const x of effs || []) { if (x.type === 'set_view' && x.view) out.push(x.view); targets(x.then, out); targets(x.else, out); targets(x.effects, out); } return out; };
    const o = e.getVisibleObjects().find((o) => o.interactions.some((x) => x.verb === 'move' && targets(x.then).includes(view)));
    if (!o) return null;
    const cyc = o.interactions.flatMap((x) => x.when || []).find((c) => c.type === 'cycle_is');
    return { id: o.id, cycle: cyc ? cyc.cycle : null };
  }, view);
  await closeups(g);
  if (!info) { check(false, `an exit from ${await cur(g)} to ${view}`); return false; }
  if (info.cycle) await g.p.waitForFunction((c) => window.__engine.getCyclePhase(c) === 'in' && window.__engine.getCycleProgress(c) < 0.4, info.cycle, { timeout: 20000 });
  await L.A(g, 'move', info.id);
  await L.settle(g);
  await g.p.waitForTimeout(150);
  return (await cur(g)) === view;
}

/** Answer the Queen: real mouse presses in time with her phrases. */
async function answerQueen(g) {
  const setup = await g.p.evaluate(() => window.__engine.getRhythmSetup());
  const panel = await g.p.$('[data-rhythm-widget] > div');
  const b = await panel.boundingBox();
  await g.p.click('[data-rhythm-start]');
  for (const pattern of setup.phrases) {
    await g.p.waitForSelector('[data-rhythm-stage="answer"]', { timeout: 20000 });
    const t0 = Date.now();
    let due = 0;
    for (const beat of pattern) {
      const wait = due - (Date.now() - t0);
      if (wait > 0) await g.p.waitForTimeout(wait);
      await g.p.mouse.move(b.x + b.width / 2, b.y + b.height - 30);
      await g.p.mouse.down();
      await g.p.waitForTimeout(beat === 'L' ? 480 : 110);
      await g.p.mouse.up();
      due += setup.beatMs * (beat === 'L' ? 2 : 1);
    }
    await g.p.waitForTimeout(400);
  }
  await g.p.waitForSelector('[data-rhythm-widget]', { state: 'detached', timeout: 8000 });
}

async function choose(g, text) {
  await g.p.click(`text=${text}`);
  await g.p.waitForTimeout(400);
}

(async () => {
  // VENTS_PART=warren runs only the Warren and checkpoint checks
  if (process.env.VENTS_PART !== 'warren') await routePart();
  await warrenPart();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

async function routePart() {
  const g = await L.start();
  await g.p.click('[data-dev-skip]');
  await g.p.waitForTimeout(800);
  await closeups(g);
  check(true, 'the Choir eye close-up shows on dropping into the vent');
  await L.A(g, 'move', 'nav_act1_vent_entry_to_act1_vent_junction');
  check((await cur(g)) === 'act1_vent_junction', 'into the junction');
  check((await g.p.evaluate(() => window.__engine.getCheckpoint()?.id)) === 'outer', 'Outer Ducts checkpoint set');
  const route = grid.route;
  let lowest = 99;
  const shots = { '14,1': 'lever', '1,2': 'gas_chamber', '0,3': 'warren_ledge', '1,3': 'warren_bridge', '5,8': 'gut_fold', '9,8': 'court_eggs', '9,9': 'court_brood', '9,10': 'court_queen', '8,12': 'core_grate', '1,14': 'purge_heart' };
  for (let i = 1; i < route.length; i++) {
    const c = route[i];
    const view = await viewOf(g, c);
    if (view === (await cur(g))) continue;
    if (c[0] === 9 && c[1] === 10) {
      await g.p.evaluate(() => window.__engine.runEffects([{ type: 'set_flag', flag: 'vesk_greeting_known', value: 'true' }]));
      await L.A(g, 'talk', 'v6_guard');
      await choose(g, 'Breathe long, short, long');
      check((await flag(g, 'guard_greeted')) === 'true', 'the royal guard lets you pass after the greeting');
    }
    if (c[0] === 9 && c[1] === 11) {
      await L.setVerb(g, 'talk');
      await L.A(g, 'talk', 'v6_queen');
      check(!!(await g.p.$('[data-rhythm-widget]')), 'TALK to the Queen opens the rhythm widget');
      await L.shot(g, 'shots/v6_rhythm');
      await answerQueen(g);
      check((await flag(g, 'queen_spoken')) === 'true', 'answered the Queen in breath (real mouse presses)');
      await L.dismiss(g);
      await L.A(g, 'talk', 'v6_queen');
      await choose(g, 'Let them take it');
      check((await g.p.evaluate(() => window.__engine.getInventoryIds())).includes('hollowed_tag'), 'the brood hollow the tag');
      await L.dismiss(g);
      await L.A(g, 'talk', 'v6_queen');
      await choose(g, 'Swear it');
      check((await flag(g, 'vesk_allied')) === 'true', 'sworn: allied');
      await L.dismiss(g);
    }
    const ok = await goTo(g, view);
    // the Curator hums at a grate: hold your breath (Listen) and it loses you
    if (ok && await g.p.evaluate(() => window.__engine.getPursuer('v6_curator')?.humming)) {
      await g.p.click('[data-action="listen"]');
      await g.p.waitForTimeout(300);
      check(!(await g.p.evaluate(() => window.__engine.getPursuer('v6_curator')?.humming)), `holding your breath at ${view} makes the Curator lose you`);
      await L.dismiss(g);
    }
    if (!ok) {
      check(false, `reached ${view} (at ${await cur(g)})`);
      console.log('  last:', g.log.slice(-3).join(' | '));
      console.log('  over:', await g.p.evaluate(() => JSON.stringify(window.__engine.getGameOverResult())), 'curator', await g.p.evaluate(() => JSON.stringify(window.__engine.getPursuer('v6_curator'))));
      break;
    }
    if (c[0] === 14 && c[1] === 1) { await L.A(g, 'hand', 'v6_lever'); check((await flag(g, 'lever_pulled')) === 'true', 'pulled the lever'); }
    const b = await g.p.evaluate(() => window.__engine.getMeterValue('breath'));
    if ((await flag(g, 'in_thin_air')) === 'true') lowest = Math.min(lowest, b);
    if (shots[c.join(',')]) await L.shot(g, `shots/v6_${shots[c.join(',')]}`);
    if (await g.p.evaluate(() => window.__engine.isGameOver())) { check(false, `alive at ${view}`); break; }
  }
  check((await g.p.$('[data-meter="breath"]')) !== null, 'the breath meter is on the HUD in the Core');
  check(lowest > 0, `never ran out of breath on the route (lowest ${lowest})`);
  check((await cur(g)) === 'act1_vent_fan_room', 'reached the Purge Heart');
  await L.dismiss(g); await closeups(g);
  await L.U(g, 'Surgical Probe', 'fan_mechanism');
  check((await flag(g, 'purge_stopped')) === 'true', 'jammed the Purge Heart');
  await L.A(g, 'move', 'vent_fan');
  await L.A(g, 'move', 'exit_hatch');
  check((await cur(g)) === 'act1_airlock_bay', 'out into the Airlock Bay');
  await g.b.close();
}

async function warrenPart() {
  // the Warren's sensing Wardens and the checkpoint restart (patrols on)
  const h = await L.start({ patrols: true });
  await h.p.click('[data-dev-skip]');
  await h.p.waitForTimeout(600);
  await h.p.evaluate(() => {
    const e = window.__engine;
    e.runEffects([{ type: 'set_flag', flag: 'in_thin_air', value: 'true' }, { type: 'set_view', view: 'act1_v6_warren_bridge' },
      { type: 'set_checkpoint', id: 'gut', text: 'the Warren ledge', no_undo: true }]);
    window.__bump();
  });
  await h.p.waitForTimeout(500);
  await closeups(h); await L.dismiss(h);
  await L.shot(h, 'shots/v6_warren_bridge_live');
  // listen
  await h.p.click('[data-action="listen"]');
  const heard = await L.msg(h);
  check(/screens? away|right here|Nothing near/.test(heard || ''), `listening says what is near: "${(heard || '').slice(0, 80)}"`);
  await L.dismiss(h);
  // walk past the Warden during the still air until it notices
  await L.setVerb(h, 'move');
  let seen = false;
  for (let k = 0; k < 40 && !seen; k++) {
    await h.p.waitForFunction(() => window.__engine.getCyclePhase('v6_lung') === 'still', null, { timeout: 15000 });
    const w = await h.p.evaluate(() => window.__engine.getPatrolSightings().find((s) => s.id === 'v6_warren_warden_1'));
    if (w) {
      // walk right past it, from one side to the other
      const me = await h.p.evaluate(() => window.__engine.getCharacterPlacement());
      const far = me.x < w.x ? Math.min(930, w.x + 300) : Math.max(30, w.x - 300);
      const p = L.sp(h, far, 467); await h.p.mouse.click(p.x, p.y);
    }
    await h.p.waitForTimeout(1500);
    seen = await h.p.evaluate(() => window.__engine.isGameOver());
  }
  check(seen, 'a Warden notices you walking near it in the still air');
  const restart = await h.p.$('[data-checkpoint]');
  check(!!restart, 'the death screen offers Restart from the Warren ledge');
  check(!(await h.p.$('[data-undo]')), 'no Undo inside a zone');
  if (restart) await restart.click();
  await h.p.waitForTimeout(500);
  check(!(await h.p.evaluate(() => window.__engine.isGameOver())), 'restarted from the checkpoint');
  await h.b.close();
}
