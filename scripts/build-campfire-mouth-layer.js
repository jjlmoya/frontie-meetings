#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const path = require('node:path');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const source = path.join(__dirname, 'assets', 'campfire-frontie-mouth-open-v9-source.png');
const output = path.join(root, 'public', 'assets', 'campfire', 'layers', 'characters', 'frontie-mouth-open-v10.png');
const canvasSize = 443;
// This layer shares the head canvas. Move its original crop left so the mouth
// center sits beneath the nose instead of drifting toward the right cheek.
const horizontalShift = 11;

async function main() {
  const resized = await sharp(source)
    .resize(canvasSize, canvasSize, { fit: 'fill', kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const aligned = await sharp(resized)
    .extract({ left: horizontalShift, top: 0, width: canvasSize - horizontalShift, height: canvasSize })
    .extend({ top: 0, bottom: 0, left: 0, right: horizontalShift, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const { size } = await sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: aligned, left: 0, top: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(output);
  const width = canvasSize;
  const height = canvasSize;
  process.stdout.write(`Wrote ${output} (${width}x${height}, ${size} bytes)\n`);
}

main().catch((error) => {
  process.stderr.write(`${error}\n`);
  process.exitCode = 1;
});
