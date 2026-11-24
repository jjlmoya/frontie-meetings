import { drawRasengan } from './animeRasengan';

type Context = CanvasRenderingContext2D;
type Camera = { x: number; y: number; scale: number };
type Point = readonly [number, number];

export const katanaSprite = 'actions/moonlit-katana.webp';

export const cutActionPlates = {
  'dawn-eye': 'nika-shadow.webp',
  rasengan: 'rasengan-cels.webp',
  'three-crescents': 'katana-plate.webp',
  'transit-open': 'gate-closed.webp',
  'key-strike': 'claw-plate.webp',
} as const;

export function hasCutActionPlate(image: string): image is keyof typeof cutActionPlates {
  return image === 'dawn-eye' || image === 'rasengan' || image === 'three-crescents' || image === 'transit-open' || image === 'key-strike';
}

const turn = Math.PI * 2;
const unit = (p: number) => Math.min(1, Math.max(0, p));
const smooth = (p: number) => {
  const t = unit(p);
  return t * t * (3 - 2 * t);
};
const ready = (art?: HTMLImageElement): art is HTMLImageElement => Boolean(art?.complete && art.naturalWidth);
const photoGrade = 'saturate(1.07) contrast(1.04)';
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

function drawPhoto(ctx: Context, image: HTMLImageElement, height: number) {
  ctx.filter = photoGrade;
  ctx.drawImage(image, 0, 0, 960, height);
  ctx.filter = 'none';
}

function drawSunShadow(ctx: Context, time: number, silhouette?: HTMLImageElement) {
  if (!ready(silhouette) || time < .4) return;
  const entry = smooth((time - .4) / .43);
  const y = 263 - 24 * entry;
  const radius = 27 + 24 * entry;
  ctx.save();
  const halo = ctx.createRadialGradient(442, y, radius * .18, 442, y, radius * 2.55);
  halo.addColorStop(0, '#fff8c3');
  halo.addColorStop(.38, '#fff0a6');
  halo.addColorStop(.64, '#ffa72b68');
  halo.addColorStop(1, '#ff782100');
  ctx.fillStyle = halo;
  ctx.globalAlpha = entry * .93;
  ctx.fillRect(442 - radius * 3, y - radius * 3, radius * 6, radius * 6);
  ctx.beginPath();
  ctx.arc(442, y, radius, 0, turn);
  ctx.clip();
  ctx.globalAlpha = smooth((time - .55) / .22);
  const float = Math.sin((time - .55) * 8) * 4;
  ctx.translate(442, y - 3 + float);
  ctx.rotate(Math.sin(time * 6) * .067);
  const width = 63 + 16 * entry;
  ctx.drawImage(silhouette, -width / 2, -width * .43, width, width * .85);
  ctx.restore();
}

const swordArm = 'M286 307 Q300 300 320 302 L365 305 L408 306 Q420 300 433 303 L431 309 L431 322 Q426 328 419 326 L397 327 Q365 343 349 345 Q330 342 307 332 L287 330 Z';
const shoulder: Point = [299, 315];

const swordKeys: readonly (readonly [time: number, angle: number])[] = [
  [0, -.38], [.30, -.70], [.365, -1.16], [.43, .27],
  [.455, .34], [.49, .46], [.55, -1.07],
  [.58, -1.13], [.643, -1.29], [.71, .43],
  [.76, .51], [.92, .19], [1.26, -.15], [3.67, -.17],
];
const swordHits = [
  { at: .43, from: -1.2, to: .27, color: '#75deff', direction: .08 },
  { at: .55, from: .46, to: -1.07, color: '#aebcff', direction: -.31 },
  { at: .71, from: -1.29, to: .43, color: '#a6f7ff', direction: .14 },
] as const;

export function katanaRecoil(time: number) {
  return swordHits.reduce((force, { at }) => {
    const age = time - at;
    return age >= 0 && age < .13 ? force + Math.cos(age * 57) * Math.exp(-age * 27) : force;
  }, 0);
}

function swingAngle(time: number) {
  const index = swordKeys.findIndex(([at]) => at > time);
  if (index <= 0) return swordKeys[swordKeys.length - 1][1];
  const [start, a] = swordKeys[index - 1];
  const [end, b] = swordKeys[index];
  return mix(a, b, smooth((time - start) / (end - start)));
}

function drawBladeWave(ctx: Context, local: number, hit: typeof swordHits[number]) {
  const time = local - hit.at;
  if (time < 0 || time > .255) return;
  const decay = time / .255;
  const force = (1 - decay) ** 1.5;
  const extension = time * 2540;
  const radius = 350 + time * 220;
  const lead = Math.sign(hit.to - hit.from);
  const arcBegin = hit.from + lead * (.12 + decay * .22);
  const arcEnd = hit.to + lead * .22;
  ctx.save();
  ctx.translate(shoulder[0] + extension, shoulder[1] + extension * hit.direction);
  ctx.globalCompositeOperation = 'screen';

  const paintArc = (offset: number, thickness: number, opacity: number, color: string) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity * force;
    ctx.beginPath();
    for (let i = 0; i <= 26; i++) {
      const step = i / 26;
      const angle = mix(arcBegin, arcEnd, step);
      const reach = radius + offset + Math.sin(step * Math.PI) * thickness * .3;
      const x = reach * Math.cos(angle);
      const y = reach * Math.sin(angle) * .83;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = 26; i >= 0; i--) {
      const step = i / 26;
      const angle = mix(arcBegin, arcEnd, step);
      const cut = Math.sin(step * Math.PI) ** .73;
      const reach = radius + offset - thickness * cut * (.6 + .4 * step);
      ctx.lineTo(reach * Math.cos(angle), reach * Math.sin(angle) * .83);
    }
    ctx.closePath();
    ctx.fill();
  };

  paintArc(2, 33 + decay * 14, .77, hit.color);
  paintArc(0, 16, .97, '#f5ffff');
  paintArc(-42, 8, .52, hit.color);
  paintArc(24, 4, .53, hit.color);
  // Short, uneven ink streaks peel off the cutting edge and leave with the crescent.
  ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const angle = mix(arcBegin, arcEnd, ((i * 17) % 23) / 23);
    const reach = radius + (i % 5 - 2) * (8 + decay * 9);
    const x = reach * Math.cos(angle), y = reach * Math.sin(angle) * .83;
    ctx.globalAlpha = force * (.3 + i % 3 * .15);
    ctx.lineWidth = 1.1 + i % 4 * .66;
    ctx.strokeStyle = i % 4 === 0 ? '#ffffff' : hit.color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - (13 + i * 4.1), y + lead * (4 + i % 7 * 3));
    ctx.stroke();
  }
  ctx.restore();
}

function drawSword(
  ctx: Context, art: HTMLImageElement | undefined, plate: HTMLImageElement | undefined,
  blade: HTMLImageElement | undefined, height: number, local: number,
) {
  if (!ready(art) || !ready(plate) || !ready(blade)) return;
  drawPhoto(ctx, plate, height);
  for (const hit of swordHits) drawBladeWave(ctx, local, hit);

  ctx.save();
  ctx.translate(...shoulder);
  ctx.rotate(swingAngle(local));
  ctx.translate(-shoulder[0], -shoulder[1]);
  ctx.save();
  ctx.translate(429, 313);
  ctx.rotate(-.09);
  const width = 292;
  const scale = width / blade.naturalWidth;
  ctx.drawImage(blade, -width * .23, -blade.naturalHeight * scale * .53, width, blade.naturalHeight * scale);
  ctx.restore();

  // The fingers occlude the handle and move with it.
  ctx.clip(new Path2D(swordArm));
  drawPhoto(ctx, art, height);
  ctx.restore();
}

function drawGate(ctx: Context, open: HTMLImageElement | undefined, plate: HTMLImageElement | undefined, height: number, local: number) {
  if (!ready(open) || !ready(plate)) return;
  const opening = smooth((local - .30) / 1.14);
  if (opening === 1) return;
  if (opening === 0) {
    drawPhoto(ctx, plate, height);
    return;
  }

  // The golden landscape shows through the widening gap before it lights the arch.
  ctx.globalAlpha = 1 - smooth((opening - .25) / .70);
  drawPhoto(ctx, plate, height);
  ctx.globalAlpha = 1;
  const seam = 1 + opening * 83;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(480 - seam, 72);
  ctx.lineTo(480 + seam, 72);
  ctx.lineTo(480 + seam, 460);
  ctx.lineTo(480 - seam, 460);
  ctx.closePath();
  ctx.clip();
  drawPhoto(ctx, open, height);
  ctx.restore();
  const glow = ctx.createRadialGradient(480, 432, 5, 480, 432, 280);
  glow.addColorStop(0, '#fff5bdc7');
  glow.addColorStop(.4, '#ffe98757');
  glow.addColorStop(1, '#ff9a2300');
  ctx.fillStyle = glow;
  ctx.globalAlpha = Math.sin(opening * Math.PI) * .68;
  ctx.globalCompositeOperation = 'screen';
  ctx.fillRect(220, 131, 526, 402);
  ctx.globalCompositeOperation = 'source-over';

  for (const side of [-1, 1]) {
    const hinge = 480 + side * 238;
    ctx.save();
    ctx.translate(hinge, 0);
    ctx.scale(1 - seam / 238, 1);
    ctx.translate(-hinge, 0);
    ctx.beginPath();
    ctx.moveTo(480, 61);
    ctx.bezierCurveTo(480 + side * 133, 66, hinge, 247, hinge, 453);
    ctx.lineTo(480, 460);
    ctx.closePath();
    ctx.clip();
    ctx.globalAlpha = 1 - smooth((opening - .80) / .20);
    drawPhoto(ctx, plate, height);
    ctx.restore();
  }
}

const claw = 'M474 0 H684 Q657 60 652 110 Q647 177 611 214 Q580 242 558 240 Q534 266 498 279 Q480 286 460 282 Q446 330 447 368 Q423 346 413 305 Q374 324 348 290 Q338 310 343 340 Q322 322 317 283 Q315 243 326 205 Q337 149 386 119 Q446 100 474 0Z';
const clawHits = [.21, .37, .55, .69, .88, 1, 1.18, 1.32, 1.48, 1.60, 1.78, 1.94, 2.11, 2.31] as const;

export function clawPressure(time: number) {
  let pressure = 0;
  for (const hit of clawHits) {
    const age = time - hit;
    const contact = age < 0 ? unit(1 + age / .074) ** 2 : (1 - unit(age / .105)) ** 2.2;
    pressure = Math.max(pressure, contact);
  }
  return pressure;
}

function drawClaw(ctx: Context, art: HTMLImageElement | undefined, plate: HTMLImageElement | undefined, height: number, local: number) {
  if (!ready(art) || !ready(plate)) return;
  const hit = clawPressure(local);
  drawPhoto(ctx, plate, height);

  if (hit > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(345, 356);
    ctx.lineTo(552, 356);
    ctx.lineTo(631, 486);
    ctx.lineTo(253, 486);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = '#4c2708';
    ctx.fillRect(248, 353, 389, 143);
    ctx.translate(0, hit * 9);
    drawPhoto(ctx, plate, height);
    ctx.restore();
  }

  ctx.save();
  ctx.translate(Math.sin(local * 39) * 2, -28 + hit * 36);
  ctx.clip(new Path2D(claw));
  drawPhoto(ctx, art, height);
  ctx.restore();

  if (hit < .08) return;
  const spark = ctx.createRadialGradient(447, 384, 2, 447, 384, 115);
  spark.addColorStop(0, '#fff4be');
  spark.addColorStop(.39, '#ffcd57a0');
  spark.addColorStop(1, '#fc662300');
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = hit * .67;
  ctx.fillStyle = spark;
  ctx.fillRect(332, 268, 230, 230);
}

export function drawAnimeCutAction(
  ctx: Context, image: string, local: number, energy: number,
  camera?: Camera, art?: HTMLImageElement, plate?: HTMLImageElement, blade?: HTMLImageElement,
) {
  if (!hasCutActionPlate(image)) return false;
  ctx.save();
  if (camera) {
    ctx.translate(640 + camera.x * 12.8, 360 + camera.y * 7.2);
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-640, -360);
  }
  const height = ready(art) ? 960 * art.naturalHeight / art.naturalWidth : 540;
  ctx.scale(4 / 3, 4 / 3);
  const anchor = image === 'dawn-eye' ? .4 : .5;
  ctx.translate(0, (540 - height) * anchor);
  if (image === 'dawn-eye') drawSunShadow(ctx, local, plate);
  if (image === 'rasengan') drawRasengan(ctx, local, energy, plate);
  if (image === 'three-crescents') drawSword(ctx, art, plate, blade, height, local);
  if (image === 'transit-open') drawGate(ctx, art, plate, height, local);
  if (image === 'key-strike') drawClaw(ctx, art, plate, height, local);
  ctx.restore();
  return true;
}
