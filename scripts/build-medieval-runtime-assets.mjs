import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceRoot = 'scripts/assets/medieval/runtime-pngs';
const outputRoot = 'public/assets/medieval';

async function collectPngs(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectPngs(file));
    else if (entry.name.toLowerCase().endsWith('.png')) files.push(file);
  }
  return files;
}

const sources = await collectPngs(sourceRoot);
if (sources.length === 0) throw new Error(`No PNG runtime assets found in ${sourceRoot}`);

for (const source of sources) {
  const relative = path.relative(sourceRoot, source).replace(/\.png$/i, '.webp');
  const output = path.join(outputRoot, relative);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await sharp(source).webp({ lossless: true, effort: 6 }).toFile(output);
  process.stdout.write(`Wrote ${output}\n`);
}
