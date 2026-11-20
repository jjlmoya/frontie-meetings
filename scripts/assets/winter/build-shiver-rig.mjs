import sharp from 'sharp';

const layers = new URL('../../../public/assets/winter/layers/', import.meta.url).pathname;
const base = `${layers}frontie-frozen-base.webp`;
const width = 1226;
const height = 1120;

// Layer coordinates follow the painted edges. The layer underneath extends
// a few pixels into each seam so the original fur covers the joint as it moves.
const head = 'M0 0H1226V809H744L723 748L669 749L623 763L578 812L537 813L477 769L400 746L320 815H0Z';
const pieces = {
  hair: 'M0 0H1226V502H926L921 425L930 305Q928 265 892 271Q727 335 549 485Q503 414 390 356Q329 315 239 295H0Z',
  'whiskers-left': 'M0 540H298L308 599L331 650L370 692L382 725L363 810H0Z',
  'whiskers-right': 'M901 528H1226V810H811L808 741L838 683L861 627L875 571Z',
  'paw-left': 'M334 1020Q374 971 445 968Q513 963 544 1026L561 1120H301Z',
  'paw-right': 'M606 1051Q618 969 699 970Q771 964 817 1024L854 1120H596Z',
};

function svg(paths, stroke = 0) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    ${paths.map((d) => `<path d="${d}" fill="white" stroke="white" stroke-width="${stroke}"/>`).join('')}
  </svg>`);
}

async function mask(paths, stroke = 0) {
  return sharp(svg(paths, stroke)).blur(1.3).png().toBuffer();
}

async function cut(path, remove = [], name) {
  let pixels = await sharp(base)
    .composite([{input: await mask([path], 3), blend: 'dest-in'}]).png().toBuffer();
  if (remove.length) {
    pixels = await sharp(pixels)
      .composite([{input: await mask(remove, 0), blend: 'dest-out'}]).png().toBuffer();
  }
  await sharp(pixels).webp({quality: 91, alphaQuality: 100}).toFile(`${layers}frontie-rig-${name}.webp`);
}

const full = 'M-10-10H1236V1130H-10Z';
await cut(full, [head, pieces['paw-left'], pieces['paw-right']], 'body');
await cut(head, [pieces.hair, pieces['whiskers-left'], pieces['whiskers-right']], 'head');
for (const [name, path] of Object.entries(pieces)) await cut(path, [], name);
