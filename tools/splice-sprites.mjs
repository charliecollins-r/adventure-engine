#!/usr/bin/env node
/**
 * Sprite sheet splicer — splits a sprite sheet PNG into individual frame files
 * or generates the character config JSON for a scenario.
 *
 * Usage:
 *   node tools/splice-sprites.mjs <spritesheet.png> --cols N --rows N --fw W --fh H [--out dir] [--config]
 *
 * Options:
 *   --cols     Number of columns (frames per row)
 *   --rows     Number of rows (directions or animation states)
 *   --fw       Frame width in pixels
 *   --fh       Frame height in pixels
 *   --out      Output directory (default: ./frames)
 *   --config   Print a scenario JSON character config block instead of splitting
 *   --name     Sprite set name for config output (default: derived from filename)
 *   --rate     Frame rate for config output (default: 6)
 *
 * Examples:
 *   # Split a 4-direction walk cycle (8 frames × 4 directions, 64×64 per frame)
 *   node tools/splice-sprites.mjs goblin-walk.png --cols 8 --rows 4 --fw 64 --fh 64
 *
 *   # Generate config JSON for a sprite set
 *   node tools/splice-sprites.mjs goblin-walk.png --cols 8 --rows 4 --fw 64 --fh 64 --config --name walk
 */

import { createCanvas, loadImage } from 'canvas';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { basename, join, extname } from 'path';

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  console.log(`Usage: node tools/splice-sprites.mjs <spritesheet.png> --cols N --rows N --fw W --fh H [--out dir] [--config]`);
  process.exit(0);
}

const inputFile = args[0];

function getArg(name) {
  const idx = args.indexOf(name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

function hasFlag(name) {
  return args.includes(name);
}

const cols = parseInt(getArg('--cols') ?? '0', 10);
const rows = parseInt(getArg('--rows') ?? '0', 10);
const fw = parseInt(getArg('--fw') ?? '0', 10);
const fh = parseInt(getArg('--fh') ?? '0', 10);
const outDir = getArg('--out') ?? './frames';
const printConfig = hasFlag('--config');
const setName = getArg('--name') ?? basename(inputFile, extname(inputFile));
const frameRate = parseInt(getArg('--rate') ?? '6', 10);

if (!cols || !rows || !fw || !fh) {
  console.error('Error: --cols, --rows, --fw, and --fh are all required.');
  process.exit(1);
}

if (printConfig) {
  const config = {
    sprite_sets: {
      [setName]: {
        file: `sprites/${basename(inputFile)}`,
        columns: cols,
        rows,
        frame_rate: frameRate,
        directions: rows === 4 ? ['down', 'left', 'right', 'up'] : undefined,
      },
    },
    frame_width: fw,
    frame_height: fh,
    scale: 2,
  };
  console.log(JSON.stringify(config, null, 2));
  process.exit(0);
}

async function splice() {
  const img = await loadImage(inputFile);
  console.log(`Loaded ${inputFile}: ${img.width}x${img.height}`);
  console.log(`Splitting into ${cols}x${rows} grid, frame size ${fw}x${fh}`);

  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  let count = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const canvas = createCanvas(fw, fh);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, col * fw, row * fh, fw, fh, 0, 0, fw, fh);

      const outFile = join(outDir, `${setName}_r${row}_f${col}.png`);
      writeFileSync(outFile, canvas.toBuffer('image/png'));
      count++;
    }
  }
  console.log(`Wrote ${count} frames to ${outDir}/`);
}

splice().catch((err) => {
  console.error('Error:', err.message);
  console.error('\nThis tool requires the "canvas" npm package. Install with:');
  console.error('  npm install canvas');
  process.exit(1);
});
