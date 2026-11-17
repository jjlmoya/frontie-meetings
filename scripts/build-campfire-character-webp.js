#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const fs = require('node:fs/promises');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const path = require('node:path');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const sourceDir = path.join(__dirname, 'assets', 'campfire-character-layers');
const outputDir = path.join(root, 'public', 'assets', 'campfire', 'layers', 'characters');

async function main() {
  const names = (await fs.readdir(sourceDir)).filter((name) => name.endsWith('.png'));
  if (names.length === 0) throw new Error(`No character PNG masters found in ${sourceDir}`);

  for (const name of names) {
    const input = path.join(sourceDir, name);
    const output = path.join(outputDir, name.replace(/\.png$/, '.webp'));
    await sharp(input).webp({ lossless: true, effort: 6 }).toFile(output);
    process.stdout.write(`Wrote ${output}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`${error}\n`);
  process.exitCode = 1;
});
