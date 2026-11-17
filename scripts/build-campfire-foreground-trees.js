#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const path = require('node:path');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Standalone CommonJS asset builder.
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const source = path.join(root, 'public', 'assets', 'campfire', 'layers', 'scene', 'night-forest-clearing.webp');
const output = path.join(root, 'public', 'assets', 'campfire', 'layers', 'scene', 'foreground-tree-canopies.webp');
const midgroundOutput = path.join(root, 'public', 'assets', 'campfire', 'layers', 'scene', 'midground-treeline.webp');

// The cleaned backdrop is normalized from 1672x870 to 1672x941. These masks use
// the pre-normalized source coordinates and the same non-uniform canvas scale,
// so every selected pixel stays aligned with its tree in the recomposed scene.
const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 870" preserveAspectRatio="none">
  <path fill="#fff" d="M0 0H535 C521 21 516 41 500 58 C480 82 465 95 447 107 C429 122 424 137 412 149 C402 163 401 178 386 188 C365 201 347 212 338 230 C331 247 323 263 306 271 C288 266 271 252 256 240 C238 229 220 216 201 219 C184 232 169 257 154 286 C126 278 98 265 73 254 C46 247 23 238 0 230Z"/>
  <path fill="#fff" d="M0 92 C56 78 111 91 154 129 C136 163 139 203 150 240 C160 280 136 316 148 358 C160 406 151 463 187 541 L0 580Z"/>
  <path fill="#fff" d="M1250 0H1672V260 C1540 240 1360 185 1180 165 C1210 110 1215 55 1250 0Z"/>
  <path fill="#fff" d="M1481 98 C1513 123 1539 151 1555 191 C1576 226 1567 261 1583 302 C1599 340 1579 377 1596 416 C1608 463 1637 511 1672 536 L1460 536 C1490 491 1500 453 1482 412 C1468 371 1490 335 1475 293 C1463 254 1484 216 1467 180 C1458 150 1464 121 1481 98Z"/>
</svg>`);

// Extract the distant tree silhouettes as a second transparent full-canvas
// layer. The gently irregular upper edge follows the painted treeline; the
// lower edge ends at the clearing's horizon. Source pixels stay unchanged.
const midgroundMask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 870" preserveAspectRatio="none">
  <path fill="#fff" d="M205 550 L205 402 L222 388 L232 366 L246 353 L257 328 L270 351 L282 311 L295 342 L307 326 L320 357 L339 376 L356 360 L372 349 L386 310 L400 339 L416 284 L430 344 L445 358 L460 377 L483 388 L502 370 L520 349 L537 336 L551 296 L566 335 L582 354 L601 338 L619 343 L638 365 L657 382 L680 388 L699 374 L718 363 L736 371 L753 352 L771 355 L789 373 L808 379 L829 362 L850 348 L868 355 L887 338 L905 302 L921 328 L941 339 L959 362 L979 372 L998 367 L1017 378 L1035 390 L1054 384 L1074 371 L1093 379 L1110 397 L1127 387 L1146 368 L1164 345 L1182 358 L1200 349 L1217 326 L1235 336 L1252 315 L1270 335 L1287 317 L1305 338 L1323 327 L1341 343 L1358 316 L1376 325 L1394 291 L1410 311 L1426 272 L1443 239 L1458 276 L1473 310 L1490 333 L1508 356 L1528 372 L1544 392 L1544 550Z"/>
</svg>`);

async function main() {
  await sharp(source)
    .composite([{ input: mask, blend: 'dest-in' }])
    .webp({ lossless: true, effort: 6 })
    .toFile(output);
  process.stdout.write(`Wrote aligned transparent tree overlay: ${output}\n`);
  await sharp(source)
    .composite([{ input: midgroundMask, blend: 'dest-in' }])
    .webp({ lossless: true, effort: 6 })
    .toFile(midgroundOutput);
  process.stdout.write(`Wrote aligned transparent midground treeline: ${midgroundOutput}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error}\n`);
  process.exitCode = 1;
});
