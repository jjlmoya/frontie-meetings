import sharp from 'sharp';

const directory = 'public/assets/medieval/details';
const source = `${directory}/waldo.png`;
const { width, height } = await sharp(source).metadata();

// Keep both PNGs on the same transparent canvas so their animation stays aligned.
const mask = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <path fill="white" d="M 114 802 C 205 780 377 783 439 839 L 471 944 L 449 1012 L 118 1012 L 81 950 Z"/>
  <path fill="white" d="M 947 839 C 1010 783 1180 780 1271 802 L 1304 950 L 1268 1012 L 937 1012 L 915 944 Z"/>
</svg>`);
await sharp(source).composite([{ input: mask, blend: 'dest-out' }]).png().toFile(`${directory}/waldo-body.png`);
await sharp(source).composite([{ input: mask, blend: 'dest-in' }]).png().toFile(`${directory}/waldo-hands.png`);
