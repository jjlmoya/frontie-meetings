#!/usr/bin/env node
// Build aligned, transparent frames from the four painted campfire studies.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const sharp = require('sharp');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const path = require('node:path');

const root = path.join(__dirname, '..');
const sources = path.join(__dirname, 'assets', 'campfire-scene-iterations');
const outputDir = path.join(root, 'public', 'assets', 'campfire', 'layers', 'scene');
const canvas = { width: 512, height: 260 };
const baseline = 252;
const maxWidth = 438;

async function extractMainFlame(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const labels = new Int32Array(info.width * info.height);
  const queue = new Int32Array(info.width * info.height);
  let largestId = 0;
  let largestSize = 0;
  let nextId = 0;
  const threshold = 24;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const start = y * info.width + x;
      if (labels[start] || data[start * 4 + 3] <= threshold) continue;
      const id = ++nextId;
      let read = 0;
      let write = 0;
      queue[write++] = start;
      labels[start] = id;
      while (read < write) {
        const current = queue[read++];
        const cx = current % info.width;
        const cy = Math.floor(current / info.width);
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || nx >= info.width || ny < 0 || ny >= info.height) continue;
            const index = ny * info.width + nx;
            if (labels[index] || data[index * 4 + 3] <= threshold) continue;
            labels[index] = id;
            queue[write++] = index;
          }
        }
      }
      if (write > largestSize) {
        largestId = id;
        largestSize = write;
      }
    }
  }

  if (largestSize < 10000) throw new Error(`Could not isolate the flame in ${file}`);
  let left = info.width; let top = info.height; let right = -1; let bottom = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (labels[y * info.width + x] !== largestId) continue;
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }

  const edgePadding = 2;
  left = Math.max(0, left - edgePadding); top = Math.max(0, top - edgePadding);
  right = Math.min(info.width - 1, right + edgePadding); bottom = Math.min(info.height - 1, bottom + edgePadding);
  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;
  const rgba = Buffer.alloc(cropWidth * cropHeight * 4);
  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      const index = y * info.width + x;
      let belongsToFlame = labels[index] === largestId;
      for (let dy = -edgePadding; dy <= edgePadding && !belongsToFlame; dy += 1) {
        for (let dx = -edgePadding; dx <= edgePadding; dx += 1) {
          const nx = x + dx; const ny = y + dy;
          if (nx >= 0 && nx < info.width && ny >= 0 && ny < info.height && labels[ny * info.width + nx] === largestId) {
            belongsToFlame = true;
            break;
          }
        }
      }
      if (!belongsToFlame) continue;
      const from = index * 4;
      const to = ((y - top) * cropWidth + x - left) * 4;
      data.copy(rgba, to, from, from + 4);
    }
  }
  return {
    buffer: await sharp(rgba, { raw: { width: cropWidth, height: cropHeight, channels: 4 } }).png().toBuffer(),
    pixels: largestSize,
  };
}

async function build() {
  for (let frame = 1; frame <= 4; frame += 1) {
    const input = path.join(sources, `flame-natural-frame-${frame}.png`);
    const isolated = await extractMainFlame(input);
    const resized = await sharp(isolated.buffer).resize({ width: maxWidth, height: baseline, fit: 'inside' }).png().toBuffer();
    const metadata = await sharp(resized).metadata();
    const top = baseline - metadata.height;
    const left = Math.round((canvas.width - metadata.width) / 2);
    const out = path.join(outputDir, `flame-loop-v3-frame-${frame}.webp`);
    await sharp({ create: { ...canvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: resized, left, top }])
      .webp({ quality: 94, alphaQuality: 100, effort: 6 })
      .toFile(out);
    process.stdout.write(`Built ${out} (${metadata.width}×${metadata.height}; ${isolated.pixels} source pixels)\n`);
  }
}

build().catch((error) => {
  process.stderr.write(`${error}\n`);
  process.exitCode = 1;
});
