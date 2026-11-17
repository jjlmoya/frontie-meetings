#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports -- This is a standalone CommonJS Node script.
const sharp = require('sharp');

const source = 'scripts/assets/campfire-scene-iterations/firepit-base-source.png';
const baseOutput = 'public/assets/campfire/layers/scene/firepit-base.webp';
const frontOutput = 'public/assets/campfire/layers/scene/firepit-front-v4.webp';

(async () => {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const center = (width - 1) / 2;

  // Keep the exact source pixels in front of the flame along a shallow arc.
  // The original full firepit remains behind the flame, so this only changes
  // occlusion and keeps the two painted layers perfectly registered.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const curve = 845 + ((x - center) / width) ** 2 * 80;
      const alpha = Math.max(0, Math.min(1, (y - curve + 2) / 4));
      const alphaIndex = (y * width + x) * channels + 3;
      data[alphaIndex] = Math.round(data[alphaIndex] * alpha);
    }
  }

  const base = sharp(source).resize(1200, 676, { fit: 'fill' });
  await base.webp({ quality: 92, alphaQuality: 100, effort: 5 }).toFile(baseOutput);
  await sharp(data, { raw: { width, height, channels } })
    .resize(1200, 676, { fit: 'fill' })
    .webp({ quality: 92, alphaQuality: 100, effort: 5 })
    .toFile(frontOutput);
  console.log(`Wrote ${baseOutput} and ${frontOutput} from ${width}x${height} source`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
