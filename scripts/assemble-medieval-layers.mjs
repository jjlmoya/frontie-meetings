import sharp from 'sharp';

const dir = 'public/assets/medieval/layers/scene';
const width = 1672;
const height = 941;

// Each master is already a true RGBA cutout. These splits keep independent
// left/right pieces in the original canvas coordinates.
async function split(master, outputs) {
  const source = await sharp(`${dir}/_sources/${master}.png`).ensureAlpha().raw().toBuffer();
  for (const [name, accepts] of outputs) {
    const pixels = Buffer.from(source);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (!accepts(x, y)) pixels[(y * width + x) * 4 + 3] = 0;
      }
    }
    await sharp(pixels, { raw: { width, height, channels: 4 } }).png().toFile(`${dir}/${name}.png`);
  }
}

await sharp(`${dir}/cielo-base-maestro.png`).resize(width, height, { fit: 'fill' }).png().toFile(`${dir}/cielo-base.png`);
await sharp(`${dir}/_sources/muralla.png`).extract({ left: 0, top: 9, width, height: height - 9 })
  .extend({ top: 0, bottom: 9, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png().toFile(`${dir}/muralla.png`);
await split('nubes', [
  ['nube-izquierda', x => x < width / 2],
  ['nube-derecha', x => x >= width / 2],
]);
await split('pilares', [
  ['pilar-izquierdo', x => x < width / 2],
  ['pilar-derecho', x => x >= width / 2],
]);
await split('cortinas', [
  ['cortina-superior', (_x, y) => y < 140],
  ['cortina-izquierda', (x, y) => y >= 140 && x < width / 2],
  ['cortina-derecha', (x, y) => y >= 140 && x >= width / 2],
]);
await split('banderines', [
  ['banderines-izquierda', x => x < width / 2],
  ['banderines-derecha', x => x >= width / 2],
]);

export const order = [
  'cielo-base.png', 'nube-izquierda.png', 'nube-derecha.png', 'castillo-fondo.png',
  'arboleda.png', 'casa-izquierda.png', 'casa-derecha.png', 'muralla.png',
  'suelo-escenario.png', 'hojas-suelo.png', 'pilar-izquierdo.png', 'pilar-derecho.png',
  'cortina-superior.png', 'cortina-izquierda.png', 'cortina-derecha.png',
  'banderines-izquierda.png', 'banderines-derecha.png',
];
await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(await Promise.all(order.map(async file => ({ input: await sharp(`${dir}/${file}`).png().toBuffer(), left: 0, top: 0 }))))
  .png().toFile(`${dir}/escenario-reensamblado.png`);
