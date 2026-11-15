const { chromium } = require('playwright');
const VERBS = ['look', 'move', 'hand', 'talk'];
async function start(opts = {}) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERR', m.text()); });
  p.on('pageerror', e => console.log('PAGE ERR', e.message));
  await p.goto('http://localhost:5173/?dev');
  await p.waitForTimeout(2500);
  const vp = await p.evaluate(() => { const d = [...document.querySelectorAll('div')].find(d => { const r = d.getBoundingClientRect(); return Math.round(r.width) === 960 && Math.round(r.height) === 540; }); const r = d.getBoundingClientRect(); return { x: r.x, y: r.y }; });
  const g = { b, p, vp, verb: 'look', log: [] };
  return g;
}
const sp = (g, x, y) => ({ x: g.vp.x + x, y: g.vp.y + y * 0.75 });
async function msg(g) {
  await g.p.waitForTimeout(500);
  return await g.p.evaluate(() => { const h = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && d.textContent.trim() === 'click to dismiss'); return h ? h.parentElement.innerText.replace(/\s*click to dismiss\s*$/, '').trim() : null; });
}
async function dismiss(g) {
  for (let i = 0; i < 6; i++) {
    const ok = await g.p.evaluate(() => { const h = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && d.textContent.trim() === 'click to dismiss'); if (!h) return false; h.parentElement.click(); return true; });
    if (!ok) return;
    await g.p.waitForTimeout(250);
  }
}
async function setVerb(g, v) {
  await dismiss(g);
  while (g.verb !== v) {
    const pt = sp(g, 950, 10);
    await g.p.mouse.click(pt.x, pt.y, { button: 'right' });
    g.verb = VERBS[(VERBS.indexOf(g.verb) + 1) % 4];
    await g.p.waitForTimeout(120);
  }
}
async function act(g, verb, x, y, label) {
  await setVerb(g, verb);
  const pt = sp(g, x, y);
  await g.p.mouse.click(pt.x, pt.y);
  const t = await msg(g);
  g.log.push(`[${verb} ${label}] ${t}`);
  return t;
}
async function openInv(g) {
  const open = await g.p.$('button[title*="right-click to examine"]');
  if (!open) { const t = await g.p.$('button:has-text("Items")'); if (t) await t.click(); await g.p.waitForTimeout(300); }
}
async function selectItem(g, name) {
  await dismiss(g); await openInv(g);
  await g.p.click(`button[title^="${name} —"]`);
  await g.p.waitForTimeout(250);
  // selecting shows the description as a message — dismiss without deselecting
  const t = await msg(g); g.log.push(`[select ${name}] ${t}`);
}
async function useOn(g, name, x, y, label) {
  await selectItem(g, name);
  await dismiss(g);
  const pt = sp(g, x, y);
  await g.p.mouse.click(pt.x, pt.y);
  const t = await msg(g); g.log.push(`[use ${name} on ${label}] ${t}`); return t;
}
async function combine(g, a, b) {
  await selectItem(g, a);
  await dismiss(g); await openInv(g);
  await g.p.click(`button[title^="${b} —"]`);
  const t = await msg(g); g.log.push(`[combine ${a}+${b}] ${t}`); return t;
}
async function go(g, viewId) {
  await dismiss(g);
  await g.p.click(`text=${viewId}`);
  await g.p.waitForTimeout(900);
}
async function shot(g, name) { await g.p.screenshot({ path: name + '.png', clip: { x: g.vp.x, y: g.vp.y, width: 960, height: 540 } }); }
async function shotFull(g, name) { await g.p.screenshot({ path: name + '.png' }); }
module.exports = { start, act, useOn, combine, go, shot, shotFull, dismiss, openInv, setVerb, msg, sp };
module.exports.hint = async (g, label) => {
  await module.exports.dismiss(g);
  await g.p.click('button:text-is("?")');
  const t = await module.exports.msg(g); g.log.push(`[HINT ${label}] ${t}`); return t;
};
let SC = JSON.parse(require("fs").readFileSync(require('path').join(__dirname, '..', '..', 'scenario.json'), "utf8"));
const OBJ = Object.fromEntries(SC.objects.map(o => [o.id, o]));
function pt(id) {
  const o = OBJ[id]; if (!o) throw new Error('no object ' + id);
  if (o.sprite) { const rh = o.sprite.frame_height * o.sprite.scale; return [o.position.x, (o.position.y * 0.75 - rh / 2) / 0.75]; }
  return [o.position.x + o.size.width / 2, o.position.y + o.size.height / 2];
}
module.exports.A = (g, verb, id) => { const [x, y] = pt(id); return module.exports.act(g, verb, x, y, id); };
module.exports.U = (g, item, id) => { const [x, y] = pt(id); return module.exports.useOn(g, item, x, y, id); };
// Click a rendered hotspot by object ID (needs data-object-id in GameView/SpriteObject).
async function clickId(g, id) {
  const el = await g.p.$(`[data-object-id="${id}"]`);
  if (!el) return false;
  const b = await el.boundingBox(); if (!b) return false;
  await g.p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); return true;
}
module.exports.A = async (g, verb, id) => {
  await setVerb(g, verb);
  if (!(await clickId(g, id))) { g.log.push(`[${verb} ${id}] NOT RENDERED`); return null; }
  const t = await msg(g); g.log.push(`[${verb} ${id}] ${t}`); return t;
};
module.exports.U = async (g, item, id) => {
  await selectItem(g, item); await dismiss(g);
  if (!(await clickId(g, id))) { g.log.push(`[use ${item} on ${id}] NOT RENDERED`); return null; }
  const t = await msg(g); g.log.push(`[use ${item} on ${id}] ${t}`); return t;
};
