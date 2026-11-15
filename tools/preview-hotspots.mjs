#!/usr/bin/env node
/**
 * Hotspot preview: renders a view's background at the game's 960x540 viewport with every
 * hotspot box, sprite anchor and the character's footprint drawn on top. Use it to review a
 * newly generated background against the existing hotspots BEFORE wiring it in, and again
 * after refitting.
 *
 * Usage:
 *   node tools/preview-hotspots.mjs <scenario.json> <view_id> [--image path] [--out file.png]
 *
 *   --image   Render this image instead of the view's background_file (e.g. a fresh
 *             Gemini output you haven't installed yet).
 *   --out     Output PNG (default: ./preview_<view_id>.png)
 *
 * Legend: gold = interactive object, blue = navigation, green dot + box = sprite
 * (bottom-center anchor and rendered size), red = character footprint (frame size × scale),
 * cyan = walk_area floor and walk_to stand points, red fill = blocked areas.
 * Options: --grid (label 960x720 coordinates), --floor '[[x,y],...]' (preview a candidate floor).
 */
import { readFileSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { dirname, join } from 'path';
import { createCanvas, loadImage } from 'canvas';

const args = process.argv.slice(2);
const [file, viewId] = args;
if (!file || !viewId) { console.log('Usage: node tools/preview-hotspots.mjs <scenario.json> <view_id> [--image path] [--out file.png]'); process.exit(1); }
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const s = JSON.parse(readFileSync(file, 'utf8'));
const view = s.views.find((v) => v.id === viewId);
if (!view) { console.error(`No view "${viewId}"`); process.exit(1); }
const objs = Object.fromEntries(s.objects.map((o) => [o.id, o]));
const imgPath = opt('--image') || (view.background_file && join(dirname(file), view.background_file));
const out = opt('--out') || `preview_${viewId}.png`;

async function load(p) {
  try { return await loadImage(p); }
  catch { return loadImage(execFileSync('convert', [p, 'png:-'], { maxBuffer: 64 * 1024 * 1024 })); } // WebP etc.
}

const W = 960, H = 540, SY = 0.75;
const c = createCanvas(W, H); const g = c.getContext('2d');
g.fillStyle = '#0a1520'; g.fillRect(0, 0, W, H);
if (imgPath) {
  const im = await load(imgPath);
  const sc = Math.max(W / im.width, H / im.height); // object-fit: cover
  g.drawImage(im, (W - im.width * sc) / 2, (H - im.height * sc) / 2, im.width * sc, im.height * sc);
}
g.font = '11px sans-serif'; g.lineWidth = 2;
const label = (t, x, y, col) => { g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x, y, g.measureText(t).width + 6, 14); g.fillStyle = col; g.fillText(t, x + 3, y + 11); };
// --grid: label 960x720 coordinates every 40 px (for picking floor points)
if (process.argv.includes('--grid')) {
  g.save(); g.lineWidth = 1; g.font = '9px sans-serif';
  for (let x = 0; x <= 960; x += 40) { g.strokeStyle = x % 200 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); if (x % 80 === 0) { g.fillStyle = '#fff'; g.fillText(String(x), x + 2, 10); } }
  for (let y = 0; y <= 720; y += 40) { const sy = y * SY; g.strokeStyle = y % 200 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(0, sy); g.lineTo(W, sy); g.stroke(); if (y % 80 === 0) { g.fillStyle = '#fff'; g.fillText(String(y), 2, sy - 2); } }
  g.restore();
}
// Walk area: floor (cyan), blocked areas (red). --floor '<json>' previews a candidate floor.
const wa = opt('--floor') ? { ...(view.walk_area || {}), floor: JSON.parse(opt('--floor')) } : view.walk_area;
const poly = (pts, fill, stroke) => { if (!pts || pts.length < 2) return; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y * SY) : g.moveTo(x, y * SY))); g.closePath(); g.fillStyle = fill; g.fill(); g.strokeStyle = stroke; g.stroke(); pts.forEach(([x, y]) => { g.fillStyle = stroke; g.fillRect(x - 3, y * SY - 3, 6, 6); }); };
if (wa?.floor) {
  poly(wa.floor, 'rgba(34,211,238,0.16)', '#22d3ee');
  for (const b of wa.blocked || []) poly(b, 'rgba(248,113,113,0.25)', '#f87171');
  label('floor', wa.floor[0][0], wa.floor[0][1] * SY, '#22d3ee');
}
for (const id of view.objects) {
  const o = objs[id]; if (!o) continue;
  const hidden = o.initially_visible === false;
  if (o.sprite) {
    const w = o.sprite.frame_width * o.sprite.scale, h = o.sprite.frame_height * o.sprite.scale;
    const ax = o.position.x, ay = o.position.y * SY;
    g.strokeStyle = '#4ade80'; g.setLineDash(hidden ? [4, 4] : []); g.strokeRect(ax - w / 2, ay - h, w, h);
    g.fillStyle = '#4ade80'; g.beginPath(); g.arc(ax, ay, 4, 0, Math.PI * 2); g.fill();
    label(id + (hidden ? ' (hidden)' : ''), ax - w / 2, ay - h, '#4ade80');
  } else {
    const nav = o.visual?.nav || id.startsWith('nav_');
    const col = nav ? '#60a5fa' : '#facc15';
    g.strokeStyle = col; g.setLineDash(hidden ? [4, 4] : []);
    g.strokeRect(o.position.x, o.position.y * SY, o.size.width, o.size.height * SY);
    label(id + (hidden ? ' (hidden)' : ''), o.position.x, o.position.y * SY, col);
  }
}
g.setLineDash([]);
// explicit stand points (walk_to) as small cyan crosses
for (const id of view.objects) { const o = objs[id]; const w = o?.walk_to; if (!w) continue; g.strokeStyle = '#22d3ee'; g.beginPath(); g.moveTo(w.x - 6, w.y * SY); g.lineTo(w.x + 6, w.y * SY); g.moveTo(w.x, w.y * SY - 6); g.lineTo(w.x, w.y * SY + 6); g.stroke(); }
const ch = view.character;
if (ch && s.character) {
  const sc = s.character.scale ?? 1, w = s.character.frame_width * sc, h = s.character.frame_height * sc;
  g.strokeStyle = '#f87171'; g.strokeRect(ch.x - w / 2, ch.y * SY - h, w, h);
  label('character', ch.x - w / 2, ch.y * SY - h, '#f87171');
}
writeFileSync(out, c.toBuffer('image/png'));
console.log(`Wrote ${out}`);
