import sharp from 'sharp';

const source = new URL('./art-source/frontie-mouth-poses.png', import.meta.url).pathname;
const output = new URL('../../../public/assets/winter/layers/', import.meta.url).pathname;

// Follow the outer crayon strokes of each drawing. Transparent feathering
// lets the edge pick up the texture of Frontie's existing muzzle.
const poses = {
  open: [86, 168, 456, 358, 'M6 119 Q87 7 223 6 Q379 3 448 117 L410 155 Q381 287 301 338 Q224 376 140 315 Q59 273 54 151 Z'],
  round: [778, 181, 332, 353, 'M10 177 Q5 100 77 34 Q140 -9 218 17 Q321 49 326 149 Q327 246 273 302 Q209 374 115 323 Q20 283 10 177 Z'],
  spread: [90, 850, 448, 168, 'M6 95 Q38 36 129 21 Q242 -8 324 22 Q411 35 443 93 Q418 131 323 148 Q230 177 131 146 Q39 134 6 95 Z'],
  clenched: [726, 870, 424, 115, 'M7 80 Q55 25 149 17 Q249 -3 323 24 Q404 34 415 82 Q392 108 286 104 Q205 90 133 103 Q52 103 7 80 Z'],
};

for (const [name, [left, top, width, height, path]] of Object.entries(poses)) {
  const mask = await sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path d="${path}" fill="white"/></svg>`,
  )).blur(4).png().toBuffer();
  // Apply the alpha before resizing so the black outside the outline cannot bleed.
  const cropped = await sharp(source).extract({ left, top, width, height }).png().toBuffer();
  const transparent = await sharp(cropped).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  await sharp(transparent).resize({ width: 175 }).webp({ quality: 93, alphaQuality: 100 })
    .toFile(`${output}frontie-mouth-${name === 'open' ? 'belt' : name}.webp`);
}
