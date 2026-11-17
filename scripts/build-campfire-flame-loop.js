#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const sharp = require('sharp');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const path = require('path');

const sheetPath = path.join(__dirname, 'assets/campfire-flame-loop-sheet-v1.png');
const outputDir = path.join(__dirname, '../public/assets/campfire/layers/scene');
const canvas = { width: 1024, height: 520 };
const flameWidth = 760;
const baseline = 500;

async function main() {
  const { data, info } = await sharp(sheetPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let frame = 0; frame < 8; frame += 1) {
    const column = frame % 4;
    const row = Math.floor(frame / 4);
    const left = Math.round(column * info.width / 4);
    const top = Math.round(row * info.height / 2);
    const right = Math.round((column + 1) * info.width / 4);
    const bottom = Math.round((row + 1) * info.height / 2);
    const width = right - left;
    const height = bottom - top;
    const labels = new Int32Array(width * height);
    let largestId = 0;
    let largestSize = 0;
    let componentId = 0;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = ((top + y) * info.width + left + x) * info.channels;
        const index = y * width + x;
        if (data[offset + 3] < 24 || labels[index]) continue;
        componentId += 1;
        const queue = [index];
        labels[index] = componentId;
        let size = 0;
        for (let cursor = 0; cursor < queue.length; cursor += 1) {
          const point = queue[cursor];
          const px = point % width;
          const py = Math.floor(point / width);
          size += 1;
          for (const neighbor of [px > 0 ? point - 1 : -1, px + 1 < width ? point + 1 : -1, py > 0 ? point - width : -1, py + 1 < height ? point + width : -1]) {
            if (neighbor < 0 || labels[neighbor]) continue;
            const nx = neighbor % width;
            const ny = Math.floor(neighbor / width);
            const alphaOffset = ((top + ny) * info.width + left + nx) * info.channels + 3;
            if (data[alphaOffset] < 24) continue;
            labels[neighbor] = componentId;
            queue.push(neighbor);
          }
        }
        if (size > largestSize) {
          largestId = componentId;
          largestSize = size;
        }
      }
    }

    let minX = width; let minY = height; let maxX = -1; let maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (labels[y * width + x] !== largestId) continue;
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
    }

    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;
    const cleaned = Buffer.alloc(cropWidth * cropHeight * 4);
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (labels[y * width + x] !== largestId) continue;
        const source = ((top + y) * info.width + left + x) * info.channels;
        const target = ((y - minY) * cropWidth + x - minX) * 4;
        data.copy(cleaned, target, source, source + 4);
      }
    }

    const outputWidth = Math.min(flameWidth, Math.floor(baseline * cropWidth / cropHeight));
    const scaledHeight = Math.round(cropHeight * outputWidth / cropWidth);
    const sprite = await sharp(cleaned, { raw: { width: cropWidth, height: cropHeight, channels: 4 } })
      .resize(outputWidth, scaledHeight)
      .png()
      .toBuffer();
    const frameCanvas = await sharp({
      create: { ...canvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    }).composite([{ input: sprite, left: Math.round((canvas.width - outputWidth) / 2), top: baseline - scaledHeight }])
      .webp({ quality: 91, alphaQuality: 100, effort: 5 })
      .toBuffer();
    const output = path.join(outputDir, `flame-loop-v2-frame-${frame + 1}.webp`);
    await sharp(frameCanvas).resize(512, 260).webp({ quality: 89, alphaQuality: 100, effort: 5 }).toFile(output);
    console.log(`${output} ${cropWidth}x${cropHeight} -> ${outputWidth}x${scaledHeight}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
