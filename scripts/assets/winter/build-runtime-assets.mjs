import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const root = new URL('../../../', import.meta.url).pathname;
const source = `${root}scripts/assets/winter/art-source`;
const runtime = `${root}public/assets/winter/layers`;
await mkdir(runtime, { recursive: true });

await sharp(`${source}/winter-landscape.png`)
  .resize({ width: 1920, height: 1080, fit: 'cover', position: 'centre' })
  .webp({ quality: 88, effort: 6 })
  .toFile(`${runtime}/winter-landscape.webp`);

await sharp(`${source}/frontie-frozen-base.png`)
  .resize({ height: 1120, withoutEnlargement: true })
  .webp({ quality: 91, effort: 6, alphaQuality: 100 })
  .toFile(`${runtime}/frontie-frozen-base.webp`);

// Keep the alternate frame limited to the singing mouth. The generated frame
// matches the wax-crayon drawing; this small contour preserves every other
// original face pixel so only the mouth changes while singing.
const mouthMask = Buffer.from(`<svg width="1312" height="1199" xmlns="http://www.w3.org/2000/svg"><path d="M568 747 C575 738 587 735 599 738 C611 734 623 737 632 744 C637 749 631 756 622 760 C609 765 591 762 578 758 C570 755 566 751 568 747 Z" fill="white"/></svg>`);
const mask = await sharp(mouthMask).blur(1.2).png().toBuffer();
const transparentLayer = await sharp(`${source}/frontie-frozen-open-v2.png`)
  .composite([{ input: mask, blend: 'dest-in' }])
  .png().toBuffer();
await sharp(transparentLayer)
  .resize({ height: 1120, withoutEnlargement: true })
  .webp({ quality: 94, effort: 6, alphaQuality: 100 })
  .toFile(`${runtime}/frontie-mouth-open.webp`);

console.log(`Built winter runtime layers in ${runtime}`);
