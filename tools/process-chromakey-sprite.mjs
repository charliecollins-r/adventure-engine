#!/usr/bin/env node
/**
 * Chroma-key sprite sheet processor.
 *
 * Takes a sprite sheet with a solid blue (#0000FF) background, removes the
 * background, auto-crops to content bounds per frame, and outputs a
 * uniform-sized sprite sheet with transparent background.
 *
 * Usage:
 *   node tools/process-chromakey-sprite.mjs <input.png> --cols N [options]
 *
 * Options:
 *   --cols N         Number of frames in horizontal strip (required)
 *   --rows N         Number of rows (default: 1)
 *   --out <path>     Output file path (default: input_processed.png)
 *   --padding N      Pixels of padding around each frame (default: 2)
 *   --threshold N    Color distance threshold for chroma removal (default: 80)
 *   --color R,G,B    Chroma key color (default: 0,0,255 = blue)
 *   --info           Print frame dimensions and exit (no output file)
 */

import { createCanvas, loadImage } from 'canvas';
import { writeFileSync } from 'fs';
import { basename, extname } from 'path';

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  console.log('Usage: node tools/process-chromakey-sprite.mjs <input.png> --cols N [--out path] [--threshold N]');
  process.exit(0);
}

const inputFile = args[0];
function getArg(name, def) {
  const idx = args.indexOf(name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : def;
}
function hasFlag(name) { return args.includes(name); }

const cols = parseInt(getArg('--cols', '4'), 10);
const rows = parseInt(getArg('--rows', '1'), 10);
const padding = parseInt(getArg('--padding', '2'), 10);
const threshold = parseInt(getArg('--threshold', '80'), 10);
const infoOnly = hasFlag('--info');
const outFile = getArg('--out', inputFile.replace(extname(inputFile), '_processed.png'));

const chromaStr = getArg('--color', '0,0,255');
const [chromaR, chromaG, chromaB] = chromaStr.split(',').map(Number);

async function main() {
  const img = await loadImage(inputFile);
  console.log(`Input: ${img.width}x${img.height}, ${cols}x${rows} grid`);

  const frameW = Math.floor(img.width / cols);
  const frameH = Math.floor(img.height / rows);
  console.log(`Raw frame size: ${frameW}x${frameH}`);

  // Draw to canvas to get pixel data
  const srcCanvas = createCanvas(img.width, img.height);
  const srcCtx = srcCanvas.getContext('2d');
  srcCtx.drawImage(img, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, img.width, img.height);

  function isChroma(r, g, b) {
    const dist = Math.sqrt((r - chromaR) ** 2 + (g - chromaG) ** 2 + (b - chromaB) ** 2);
    return dist < threshold;
  }

  // Find content bounds for each frame
  const frameBounds = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ox = col * frameW;
      const oy = row * frameH;
      let minX = frameW, minY = frameH, maxX = 0, maxY = 0;

      for (let y = 0; y < frameH; y++) {
        for (let x = 0; x < frameW; x++) {
          const idx = ((oy + y) * img.width + (ox + x)) * 4;
          const r = srcData.data[idx];
          const g = srcData.data[idx + 1];
          const b = srcData.data[idx + 2];
          if (!isChroma(r, g, b)) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      frameBounds.push({ col, row, ox, oy, minX, minY, maxX, maxY,
        contentW: maxX - minX + 1, contentH: maxY - minY + 1 });
    }
  }

  // Find the largest content bounds (all frames use same output size)
  let maxContentW = 0, maxContentH = 0;
  for (const fb of frameBounds) {
    maxContentW = Math.max(maxContentW, fb.contentW);
    maxContentH = Math.max(maxContentH, fb.contentH);
  }

  const outFrameW = maxContentW + padding * 2;
  const outFrameH = maxContentH + padding * 2;

  console.log(`Content bounds: ${maxContentW}x${maxContentH}`);
  console.log(`Output frame size: ${outFrameW}x${outFrameH} (with ${padding}px padding)`);
  console.log(`Output sheet: ${outFrameW * cols}x${outFrameH * rows}`);

  if (infoOnly) return;

  // Create output canvas
  const outCanvas = createCanvas(outFrameW * cols, outFrameH * rows);
  const outCtx = outCanvas.getContext('2d');

  for (const fb of frameBounds) {
    // Center the content within the uniform frame
    const destX = fb.col * outFrameW + padding + Math.floor((maxContentW - fb.contentW) / 2);
    const destY = fb.row * outFrameH + padding + Math.floor((maxContentH - fb.contentH) / 2);

    // Copy pixels, replacing chroma with transparency
    const frameCanvas = createCanvas(fb.contentW, fb.contentH);
    const frameCtx = frameCanvas.getContext('2d');
    const frameData = frameCtx.createImageData(fb.contentW, fb.contentH);

    for (let y = 0; y < fb.contentH; y++) {
      for (let x = 0; x < fb.contentW; x++) {
        const srcX = fb.ox + fb.minX + x;
        const srcY = fb.oy + fb.minY + y;
        const srcIdx = (srcY * img.width + srcX) * 4;
        const dstIdx = (y * fb.contentW + x) * 4;

        const r = srcData.data[srcIdx];
        const g = srcData.data[srcIdx + 1];
        const b = srcData.data[srcIdx + 2];

        if (isChroma(r, g, b)) {
          frameData.data[dstIdx + 3] = 0; // transparent
        } else {
          frameData.data[dstIdx] = r;
          frameData.data[dstIdx + 1] = g;
          frameData.data[dstIdx + 2] = b;
          frameData.data[dstIdx + 3] = 255;
        }
      }
    }

    frameCtx.putImageData(frameData, 0, 0);
    outCtx.drawImage(frameCanvas, destX, destY);
  }

  const buf = outCanvas.toBuffer('image/png');
  writeFileSync(outFile, buf);
  console.log(`\nSaved: ${outFile} (${(buf.length / 1024).toFixed(1)} KB)`);
  console.log(`\nSuggested sprite JSON:`);
  console.log(JSON.stringify({
    file: `sprites/${basename(outFile)}`,
    frame_width: outFrameW,
    frame_height: outFrameH,
    columns: cols,
    rows: rows,
    frame_rate: 2,
    scale: 1.0,
  }, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
