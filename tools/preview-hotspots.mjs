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
 * (bottom-center anchor and rendered size), red = character footprint (frame size × scale).
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
const ch = view.character;
if (ch && s.character) {
  const sc = s.character.scale ?? 1, w = s.character.frame_width * sc, h = s.character.frame_height * sc;
  g.strokeStyle = '#f87171'; g.strokeRect(ch.x - w / 2, ch.y * SY - h, w, h);
  label('character', ch.x - w / 2, ch.y * SY - h, '#f87171');
}
writeFileSync(out, c.toBuffer('image/png'));
console.log(`Wrote ${out}`);
