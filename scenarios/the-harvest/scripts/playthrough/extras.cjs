const L = require('./lib.cjs');
const { chromium } = require('playwright');
(async () => {
  // Intro (no dev mode)
  { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
    await p.goto('http://localhost:5173/'); await p.waitForTimeout(3500); await p.screenshot({ path: 'shots/00_intro.png' });
    await p.mouse.click(700, 450); await p.waitForTimeout(2500); await p.screenshot({ path: 'shots/00b_wake.png' }); await b.close(); }
  const g = await L.start(); await g.p.click('button:text-is("Debug ON")');
  const shot = async (n) => { await L.dismiss(g); await g.p.waitForTimeout(300); await g.p.screenshot({ path: `shots/${n}.png`, clip: { x: g.vp.x, y: g.vp.y, width: 960, height: 540 } }); };
  for (const v of ['act1_v6_8_0', 'act1_v6_warren_ledge', 'act1_v6_5_8', 'act1_v6_court_queen', 'act1_v6_8_12', 'act1_v6_cache_vault']) { try { await L.go(g, v); await shot(`maze_${v.slice(8)}`); } catch (e) {} }
  await L.go(g, 'act1_vent_gas_chamber'); const t1 = await L.A(g, 'move', 'nav_act1_vent_gas_to_act1_vent_fan_room'); await g.p.waitForTimeout(1200); await g.p.screenshot({ path: 'shots/death_gas.png' });
  console.log('gas death:', (t1 || '').slice(0, 200));
  await g.b.close();
  const g2 = await L.start(); await g2.p.click('button:text-is("Debug ON")');
  await L.go(g2, 'act1_vent_fan_room'); const t2 = await L.A(g2, 'move', 'vent_fan'); await g2.p.waitForTimeout(1200); await g2.p.screenshot({ path: 'shots/death_fan.png' });
  console.log('fan death:', (t2 || '').slice(0, 200)); await g2.b.close();
})();
