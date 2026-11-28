// Browser test: the game clock and the cataloguer patrol (scenario.patrols).
// A hunter drone sweeps: Stasis Hold 0-5 s, corridor 5-10, feeding station 10-15, archive 15-20 of every 45-second sweep. The search
// starts when the Curator finds the empty pod (curator_glimpsed), the first sweep 20 s later. fresh() starts it at 0:40, so the first
// sweep is at 1:00 and the later ones at 1:45, 2:30, 3:15.
const L = require('./lib.cjs');
let failures = 0; const fail = (m) => { failures++; console.log('  FAIL', m); }; const ok = (m) => console.log('ok   ' + m);
const SHOTS = process.env.SHOTS || null;

async function fresh({ search = true } = {}) {
  const g = await L.start({ patrols: true });
  if (search) await g.p.evaluate(() => { const e = window.__engine; e.advanceClock(40 - e.getClock()); e.runEffects([{ type: 'set_flag', flag: 'curator_glimpsed', value: 'true' }]); e.advanceClock(0.001); window.__bump(); });
  await g.p.evaluate(() => { window.__plays = []; const orig = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { window.__plays.push(this.src.split('/').pop()); return orig.call(this).catch(() => {}); }; });
  return g;
}
const clockText = (g) => g.p.evaluate(() => document.querySelector('[data-clock]')?.textContent || null);
const setClock = (g, t) => g.p.evaluate((t) => { const e = window.__engine; e.advanceClock(t - e.getClock()); window.__bump(); }, t);
const bot = (g) => g.p.evaluate(() => !!document.querySelector('[data-patrol="hunter_patrol"]'));
const over = (g) => g.p.evaluate(() => window.__engine.isGameOver());
const page = (g) => g.p.evaluate(() => document.body.innerText);

(async () => {
  // 1. The clock shows and runs; the first warning comes at 0:55 in the Stasis Hold, the bot at 1:00, then it catches you
  let g = await fresh();
  const t0 = await clockText(g); await g.p.waitForTimeout(2200); const t1 = await clockText(g);
  if (!/^Time \d:\d\d$/.test(t0 || '') || t0 === t1) fail(`clock not running: ${t0} -> ${t1}`); else ok(`clock runs in the title bar (${t0} -> ${t1})`);
  await setClock(g, 54);
  await g.p.waitForTimeout(1500);
  if (!/hunter drone searching/.test(await page(g))) fail('no warning in the Stasis Hold'); else ok('warned 5 s before it comes in');
  if (!(await g.p.evaluate(() => window.__plays)).includes('patrol_skitter.mp3')) fail('no skitter sound'); else ok('the skitter sound plays');
  if ((await g.p.evaluate(() => document.querySelector('[data-screen-cue]')?.dataset.screenCue)) !== 'on') fail('no screen jiggle and red pulse with the warning'); else ok('the picture jiggles and pulses red with the warning');
  if (SHOTS) await L.shot(g, `${SHOTS}/patrol_warning`);
  if (await bot(g)) fail('bot drawn before it arrives');
  await g.p.waitForTimeout(5200); // now ~60.7
  if (!(await bot(g))) fail('bot not drawn in the Stasis Hold'); else ok('the hunter drone walks through the Stasis Hold');
  if (SHOTS) await L.shot(g, `${SHOTS}/patrol_stasis`);
  await g.p.waitForTimeout(700);   // it notices you in half a second
  if (!(await over(g)) || (await g.p.evaluate(() => window.__engine.getGameOverResult()?.title)) !== 'Caught') fail('standing in its way did not get you caught'); else ok('standing in its way: caught');
  if (SHOTS) await L.shotFull(g, `${SHOTS}/patrol_death`);
  await g.b.close();

  // 2. Hiding in the pod: it passes you by
  g = await fresh();
  await setClock(g, 55.5);
  const hide = await L.A(g, 'hand', 'broken_pod');
  if (!/Hold still/.test(hide || '')) fail(`pod hiding: ${hide}`); else ok('HAND the pod while it comes: you hide');
  await L.dismiss(g);
  const hidden = await g.p.evaluate(() => window.__engine.isHiding() && ![...document.querySelectorAll('div')].some((d) => /character_idle/.test(d.style.backgroundImage)));
  if (!hidden) fail('not hidden (or still drawn) after climbing into the pod'); else ok('he is hidden and not drawn');
  await setClock(g, 61);
  await g.p.waitForTimeout(2500);
  if (await over(g)) fail('caught while hiding'); else ok('hidden in the pod: it passes');
  if (SHOTS) await L.shot(g, `${SHOTS}/patrol_stasis_hidden`);
  await g.b.close();

  // 3. Getting out of its way: corridor -> processing lab
  g = await fresh();
  await L.go(g, 'act1_containment_corridor');
  await setClock(g, 59.5);
  await g.p.waitForTimeout(800);
  if (!/ticking up from the Stasis Hold/.test(await page(g))) fail('no corridor warning'); else ok('corridor warning');
  await L.dismiss(g);
  await L.A(g, 'move', 'nav_act1_containment_corridor_to_act1_processing_lab');
  await setClock(g, 71);
  await g.p.waitForTimeout(1500);
  const v = await g.p.evaluate(() => window.__engine.currentViewId);
  if (await over(g) || v !== 'act1_processing_lab') fail(`escape to the lab failed (view ${v})`); else ok('ducking into the lab: it passes the corridor');
  await g.b.close();

  // 3b. Next door you hear it pass, and are told so: from the Processing Lab (and its terminal close-up) while it walks the corridor
  for (const [room, closeup] of [['act1_processing_lab', null], ['act1_processing_lab', 'act1_lab_terminal_closeup'], ['act1_security_hub', null]]) {
    g = await fresh();
    await L.go(g, room); await L.dismiss(g);
    if (closeup) { await g.p.evaluate((v) => window.__engine.navigateToView(v), closeup); }
    await setClock(g, 64.5); await g.p.evaluate(() => { window.__plays = []; });
    await g.p.waitForTimeout(1200); // it comes into the corridor at 65
    const heard = await g.p.evaluate(() => window.__plays);
    const where = closeup || room;
    if (!heard.includes('patrol_skitter_far.mp3')) fail(`not heard from ${where}: ${heard}`);
    else if (!/Out in the corridor, metal legs tick past the door/.test(await page(g))) fail(`no "out in the corridor" line in ${where}`);
    else ok(`heard and told from ${where}`);
    if (await over(g)) fail(`caught in ${where}`);
    await g.b.close();
  }

  // 4. It is drawn on its route in each room (screenshots), and the timer stops on the death screen
  g = await fresh();
  for (const [view, t] of [['act1_containment_corridor', 202.5], ['act1_feeding_station', 207], ['act1_specimen_archive', 213.5]]) {
    await L.go(g, view); await L.dismiss(g);
    await g.p.evaluate(() => window.__engine.restore({ ...window.__engine.snapshot(), clock: 0 }));
    await g.p.evaluate((view) => window.__engine.navigateToView(view), view);
    await setClock(g, t); await g.p.waitForTimeout(300);
    if (!(await bot(g))) fail(`bot not drawn in ${view}`); else ok(`bot drawn in ${view}`);
    if (SHOTS) await L.shot(g, `${SHOTS}/patrol_${view.replace('act1_', '')}`);
    await g.p.waitForTimeout(2000);
    if (!(await over(g))) fail(`not caught in ${view}`);
    const a = await clockText(g); await g.p.waitForTimeout(1500); const b = await clockText(g);
    if (a !== b) fail('clock runs on the death screen');
    await g.b.close(); g = await fresh();
  }
  ok('the clock stops on the death screen');
  await g.b.close();

  // 4b. No search until the Curator has found the empty pod
  g = await fresh({ search: false });
  await setClock(g, 125); await g.p.waitForTimeout(1500);
  if (await bot(g) || await over(g) || /coming this way/.test(await page(g))) fail('the drone patrols before the Curator has found the pod'); else ok('no patrol before the Curator finds the empty pod');
  await g.b.close();

  // 5. After the alarm the hunters take over: no patrol
  g = await fresh();
  await g.p.evaluate(() => { window.__engine.restore({ ...window.__engine.snapshot(), flags: { ...window.__engine.getFlags(), alarm_hunters_out: 'true' } }); });
  await setClock(g, 61); await g.p.waitForTimeout(2500);
  if (await bot(g) || await over(g)) fail('patrol runs during the alarm'); else ok('no patrol once the hunters are out');
  await g.b.close();

  console.log(failures ? `\n${failures} FAILURE(S)` : '\nall patrol checks passed');
  process.exit(failures ? 1 : 0);
})();
