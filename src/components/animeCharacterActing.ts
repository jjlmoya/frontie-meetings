type Point = readonly [number, number];
type Camera = { x: number; y: number; scale: number };

export const kiraCleanPlate = 'actions/kira-clean.webp';
const kiraNib: Point = [368.5, 370.5];

// The paw, sleeve and front edge of the book are traced over the original still.
const pawAndPen = 'M264 147 Q272 137 280 141 Q286 144 286 151 L284 155 L289 157 L294 164 Q303 158 311 180 L321 211 L318 213 L334 252 Q349 256 354 273 Q358 283 370 295 Q382 303 376 315 Q371 326 370 337 Q369 344 361 343 Q367 356 370 370 L368 371 Q358 363 349 344 Q347 358 337 363 Q325 370 311 365 Q302 376 281 369 L253 368 Q231 381 208 383 Q203 365 211 345 Q220 321 235 316 Q235 304 242 296 Q251 288 251 274 Q251 257 267 253 Q278 249 288 237 Q298 226 313 234 L309 229 L285 180 Q275 158 271 157 L267 158 Q261 155 264 147 Z';
const sleeveEdge = 'M199 319 Q218 317 232 314 Q219 328 210 351 Q203 376 191 395 L163 419 L153 412 L175 359 Z';

const bookForeground = 'M279 391 Q307 387 332 382 Q350 380 370 377 Q395 373 414 371 Q443 368 469 366 L469 434 L279 434 Z';

// The pen ends beneath the near stack of pages, which masks its last few pixels.
function paperRim(x: number) {
  return 380 - (x - 350) * .157;
}
const writing: readonly (readonly [at: number, x: number, offset: number])[] = [
  [0, 360, 0], [.17, 347, 0], [.29, 353, -1.8], [.36, 352, 1.6],
  [.49, 360, .9], [.60, 366, -1.8], [.69, 365, 1.4], [.81, 374, .4],
  [.94, 379, -2.1], [1.04, 377, 1.8], [1.17, 388, .6],
  [1.47, 388, .6], [1.81, 353, -1.4], [2.11, 401, .4],
];

function kiraPenTip(local: number): Point {
  const index = writing.findIndex(([at]) => at > local);
  const [end, endX, endOffset] = writing[index > 0 ? index : writing.length - 1];
  const [start, startX, startOffset] = writing[index > 0 ? index - 1 : writing.length - 1];
  const phase = end > start ? (local - start) / (end - start) : 1;
  const ease = phase * phase * (3 - 2 * phase);
  const x = startX + (endX - startX) * ease;
  const marker = startOffset + (endOffset - startOffset) * ease;
  return [x, paperRim(x) + 4.75 + marker];
}

function paintWrist(ctx: CanvasRenderingContext2D) {
  // The far end stays inside the moving silhouette, behind the fixed cuff.
  const shade = ctx.createLinearGradient(209, 335, 230, 384);
  shade.addColorStop(0, '#3a211e');
  shade.addColorStop(.23, '#1d1517');
  shade.addColorStop(.76, '#131013');
  shade.addColorStop(1, '#0d0b0d');
  ctx.fillStyle = shade;
  const wrist = new Path2D('M192 388 Q204 352 222 334 Q238 329 256 331 L267 353 Q266 365 251 373 Q219 376 197 393 Z');
  ctx.fill(wrist);
}

function paintClipped(ctx: CanvasRenderingContext2D, art: HTMLImageElement, path: string) {
  ctx.save();
  ctx.clip(new Path2D(path));
  ctx.drawImage(art, 0, 0, 960, 540);
  ctx.restore();
}

export function drawKiraWriting(
  ctx: CanvasRenderingContext2D,
  local: number,
  art?: HTMLImageElement,
  clean?: HTMLImageElement,
  camera?: Camera,
) {
  if (!art?.complete || !art.naturalWidth || !clean?.complete || !clean.naturalWidth) return;
  ctx.save();
  if (camera) {
    ctx.translate(640 + camera.x * 12.8, 360 + camera.y * 7.2);
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-640, -360);
  }
  ctx.scale(4 / 3, 4 / 3);
  ctx.filter = 'saturate(1.07) contrast(1.04)';
  ctx.drawImage(clean, 165, 125);
  ctx.filter = 'none';
  paintWrist(ctx);

  const [x, y] = kiraPenTip(local);
  ctx.filter = 'saturate(1.07) contrast(1.04)';
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((x - kiraNib[0]) * .0027);
  ctx.translate(-kiraNib[0], -kiraNib[1]);
  paintClipped(ctx, art, pawAndPen);
  ctx.restore();

  paintClipped(ctx, art, sleeveEdge);
  paintClipped(ctx, art, bookForeground);
  ctx.restore();
}
