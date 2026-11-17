// eslint-disable-next-line @typescript-eslint/no-require-imports -- This is a standalone CommonJS Node script.
const sharp = require('sharp');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- This is a standalone CommonJS Node script.
const path = require('path');

const directory = 'public/assets/campfire/layers/scene';
const canvas = { width: 1024, height: 520 };
const baseline = 500;
const flameWidth = 760;

async function buildFrame(number) {
  const source = path.join(directory, `flame-natural-frame-${number}.png`);
  const metadata = await sharp(source).metadata();
  const height = Math.round(metadata.height * flameWidth / metadata.width);
  const flame = await sharp(source).resize({ width: flameWidth }).png().toBuffer();

  await sharp({
    create: {
      ...canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: flame, left: Math.round((canvas.width - flameWidth) / 2), top: baseline - height }])
    .png()
    .toFile(path.join(directory, `flame-frame-${number}.png`));
}

Promise.all([1, 2, 3, 4].map(buildFrame)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
