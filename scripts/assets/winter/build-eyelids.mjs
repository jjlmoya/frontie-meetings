import sharp from 'sharp';

const layers = new URL('../../../public/assets/winter/layers/', import.meta.url).pathname;
const source = `${layers}frontie-frozen-base.webp`;

// Sample from the charcoal crayon immediately above each eye and crop it
// along the actual lid outline. Each patch is in the original art coordinates.
const eyes = [
  { left: 344, top: 532, width: 187, height: 59, textureTop: 482,
    path: 'M1 16 C35 5 99 0 187 14 C160 46 110 60 58 56 C32 51 12 34 1 16Z' },
  { left: 615, top: 521, width: 198, height: 67, textureTop: 461,
    path: 'M0 24 C52 7 129 2 197 8 C180 39 141 61 89 63 C49 66 13 47 0 24Z' },
];

const patches = [];
for (const { left, top, width, height, textureTop, path } of eyes) {
  const texture = await sharp(source).extract({ left, top: textureTop, width, height }).png().toBuffer();
  const mask = await sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path fill="white" d="${path}"/></svg>`,
  )).blur(1.4).png().toBuffer();
  const input = await sharp(texture).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  patches.push({ input, left, top });
}
await sharp({ create: { width: 1226, height: 1120, channels: 4, background: '#0000' } })
  .composite(patches).webp({ quality: 90, alphaQuality: 100 }).toFile(`${layers}frontie-eyelids.webp`);
