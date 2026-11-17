#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const path = require('node:path');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const sources = path.join(__dirname, 'assets');
const output = path.join(root, 'public', 'assets', 'campfire', 'layers', 'scene');

async function alphaBounds(file, threshold = 8) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] <= threshold) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left || bottom < top) throw new Error(`No visible pixels found in ${file}`);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function leafComponents(file, threshold = 8) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const labels = new Int32Array(info.width * info.height);
  const queue = new Int32Array(info.width * info.height);
  const components = [];
  let label = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const start = y * info.width + x;
      if (labels[start] || data[start * 4 + 3] <= threshold) continue;
      label += 1;
      let read = 0;
      let write = 0;
      queue[write++] = start;
      labels[start] = label;
      let left = x;
      let top = y;
      let right = x;
      let bottom = y;
      while (read < write) {
        const current = queue[read++];
        const cx = current % info.width;
        const cy = Math.floor(current / info.width);
        left = Math.min(left, cx);
        top = Math.min(top, cy);
        right = Math.max(right, cx);
        bottom = Math.max(bottom, cy);
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || nx >= info.width || ny < 0 || ny >= info.height) continue;
            const next = ny * info.width + nx;
            if (!labels[next] && data[next * 4 + 3] > threshold) {
              labels[next] = label;
              queue[write++] = next;
            }
          }
        }
      }
      if (write > 1000) components.push({ left, top, width: right - left + 1, height: bottom - top + 1, area: write });
    }
  }
  return components.sort((a, b) => b.area - a.area).slice(0, 3).sort((a, b) => a.left - b.left);
}

async function saveWebpCrop(source, bounds, filename, maxWidth, padding = 6) {
  const metadata = await sharp(source).metadata();
  const left = Math.max(0, bounds.left - padding);
  const top = Math.max(0, bounds.top - padding);
  const width = Math.min(metadata.width - left, bounds.width + padding * 2);
  const height = Math.min(metadata.height - top, bounds.height + padding * 2);
  await sharp(source).extract({ left, top, width, height })
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 100, effort: 5 })
    .toFile(path.join(output, filename));
}

async function main() {
  const forestSource = path.join(sources, 'campfire-scene-iterations', 'campfire-night-forest-clearing-source.png');
  // The original painted export has a corrupted strip along its bottom edge.
  // Crop that strip and restore the aligned scene canvas before deriving the
  // transparent tree cutouts; this keeps every scene layer pixel-aligned.
  await sharp(forestSource)
    .extract({ left: 0, top: 0, width: 1672, height: 870 })
    .resize(1672, 941, { fit: 'fill' })
    .webp({ quality: 91, alphaQuality: 100, effort: 5 })
    .toFile(path.join(output, 'night-forest-clearing.webp'));

  const starSource = path.join(sources, 'campfire-night-stars-source.png');
  await sharp(starSource).resize(1672, 941, { fit: 'fill' }).webp({ quality: 90, alphaQuality: 100, effort: 5 }).toFile(path.join(output, 'night-stars-overlay.webp'));

  const planeSource = path.join(sources, 'campfire-distant-plane-source.png');
  const planeBounds = await alphaBounds(planeSource);
  await saveWebpCrop(planeSource, planeBounds, 'distant-plane.webp', 336, 12);

  const leavesSource = path.join(sources, 'campfire-falling-leaves-source.png');
  const leaves = await leafComponents(leavesSource);
  if (leaves.length !== 3) throw new Error(`Expected 3 distinct leaf sprites, found ${leaves.length}`);
  for (let i = 0; i < leaves.length; i += 1) {
    await saveWebpCrop(leavesSource, leaves[i], `falling-leaf-${i + 1}.webp`, 120, 8);
  }

  const props = ['raven-skull', 'bramble-cluster', 'spent-candle'];
  for (const name of props) {
    const source = path.join(sources, 'campfire-scene-iterations', 'source-scene-details', `${name}.png`);
    await sharp(source).resize({ width: 384, withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 100, effort: 5 })
      .toFile(path.join(output, `${name}.webp`));
  }

  process.stdout.write(`Wrote optimized forest, stars, plane, ${leaves.length} leaves, and ${props.length} transparent ground props to ${output}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error}\n`);
  process.exitCode = 1;
});
