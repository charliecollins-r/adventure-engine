// Browser test: noise and tension (brute-force guard, noise thresholds, hiding, the Curator catching you).
const L = require('./lib.cjs');
let failures = 0; const fail = (m) => { failures++; console.log('  FAIL', m); }; const ok = (m) => console.log('ok   ' + m);
const WRONG = ['spiral', 'trident', 'eyehook', 'twinbranch'];
(async () => {
  const g = await L.start(); await g.p.click('button:text-is("Debug ON")');
  const visible = (id) => g.p.evaluate((id) => !!document.querySelector(`[data-object-id="${id}"]`), id);
  const page = () => g.p.evaluate(() => document.body.innerText);
  const view = () => g.p.evaluate(() => document.body.innerText.match(/act1_[a-z0-9_]+/g) || []);
  const plays = () => g.p.evaluate(() => window.__plays.map((p) => p.src));
  await g.p.evaluate(() => { window.__plays = []; const orig = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { window.__plays.push({ src: this.src.split('/').pop() }); return orig.call(this).catch(() => {}); }; });

  const bruteForce = async () => {
    await L.go(g, 'act1_lab_terminal_closeup'); await L.dismiss(g);
    await L.A(g, 'hand', 'lab_terminal_keypad'); await g.p.waitForTimeout(300);
    for (let a = 0; a < 6; a++) {
      for (const k of WRONG) { const b = await g.p.$(`button[data-key="${k}"]`); if (!b) return false; await b.click(); await g.p.waitForTimeout(60); }
      await g.p.waitForTimeout(900);
    }
    return true;
  };

  // 1. Six wrong codes summon the hunter drone and throw you out of the close-up
  if (!(await bruteForce())) fail('keypad did not stay open for six attempts');
  const alarm = await L.msg(g);
  if (!/hunter drone unfolds/.test(alarm || '')) fail(`no alarm message: ${alarm}`); else ok('6 wrong codes: alarm + hunter drone');
  if (!(await plays()).includes('alarm.mp3')) fail('alarm sound not played'); else ok('alarm sound plays');
  if (!(await plays()).includes('noise_clang.mp3')) fail('noise clang not played on the noise jump'); else ok('noise clang plays');
  await L.dismiss(g);
  if (!(await visible('lab_hunter_drone'))) fail('drone not visible in the lab'); else ok('drone guards the lab');
  if (await g.p.$('button[data-key="fern"]')) fail('keypad still open after the alarm');
  const look = await L.A(g, 'look', 'lab_startup_display'); await L.dismiss(g);
  if (!/Not with the hunter drone/.test(look || '')) fail(`terminal look while guarded: ${look}`); else ok('terminal is off-limits while the drone watches');
  const h = await L.hint(g, 'lab guarded'); await L.dismiss(g);
  if (!/hunter drone is guarding/.test(h || '')) fail(`hint: ${h}`); else ok('hint explains the guard');

  // 2. Leaving makes it give up
  const leave = await L.A(g, 'move', 'nav_act1_processing_lab_to_act1_containment_corridor');
  if (!/gives up/.test((leave || '') + (await page()))) fail('no give-up message'); else ok('leaving the lab: the drone gives up');
  await L.dismiss(g);
  await L.A(g, 'move', 'nav_act1_containment_corridor_to_act1_processing_lab'); await L.dismiss(g);
  if (await visible('lab_hunter_drone')) fail('drone still there after leaving'); else ok('back in the lab: the drone is gone');

  // 3. A second brute force pushes the noise over the thresholds: the Curator listens, then hunts
  await g.p.evaluate(() => { window.__plays = []; });
  await bruteForce();
  const second = await page();
  if (!/Something is listening|hunting the noise/.test(second)) fail('no Curator warning after a second brute force'); else ok('the Curator hears the noise');
  if (!(await plays()).includes('curator_steps.mp3')) fail('Curator footsteps not played'); else ok('Curator footsteps play');
  await L.dismiss(g);

  // 4. Hiding resets the noise
  await L.A(g, 'move', 'nav_act1_processing_lab_to_act1_containment_corridor'); await L.dismiss(g);
  await L.A(g, 'move', 'nav_act1_containment_corridor_to_act1_stasis_hold'); await L.dismiss(g);
  const hide = await L.A(g, 'hand', 'broken_pod'); await L.dismiss(g);
  if (!/curl up in the drained fluid/.test(hide || '')) fail(`hiding in the pod: ${hide}`); else ok('hide in the pod: the Curator passes');
  const again = await L.A(g, 'hand', 'broken_pod'); await L.dismiss(g);
  if (/curl up/.test(again || '')) fail('hiding offered with no noise'); else ok('once quiet, the pod is just a pod again');

  // 5. Touching the terminal while the drone watches gets you caught
  await bruteForce(); await L.dismiss(g);
  await L.A(g, 'hand', 'lab_startup_display'); await g.p.waitForTimeout(800);
  const end = await page();
  if (!/caught/i.test(end) || !/pins you against the terminal/.test(end)) { fail('no "Caught" game over'); console.log(end.slice(0, 900)); await L.shot(g, '/tmp/claude-0/-home-user-kings-quest-multiplayer/4cc8d1db-35ac-56b1-ae6a-78ba5f499869/scratchpad/caught'); } else ok('touching the guarded terminal: caught');

  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL NOISE TESTS PASSED');
  await g.b.close(); process.exit(failures ? 1 : 0);
})();
