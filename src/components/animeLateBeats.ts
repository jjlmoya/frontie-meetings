type Context = CanvasRenderingContext2D;
type Camera = { x: number; y: number; scale: number };

export const lateBeatPlates = {
  breaker: 'breaker-plate.webp',
  tired: 'tired-lids.webp',
  paw: 'paw-before.webp',
  'distant-orb': 'sky-spiral.webp',
} as const;

export type LateBeatPlate = keyof typeof lateBeatPlates;

export function hasLateBeatPlate(image: string): image is LateBeatPlate {
  return image === 'breaker' || image === 'tired' || image === 'paw' || image === 'distant-orb';
}

export function isLateBeatShot(image: string) {
  return hasLateBeatPlate(image) || image === 'grip' || image === 'crest-ignites';
}

const turn = Math.PI * 2;
const clamp = (p: number) => Math.min(1, Math.max(0, p));
const ease = (value: number) => {
  const p = clamp(value);
  return p * p * (3 - 2 * p);
};
const ready = (art?: HTMLImageElement): art is HTMLImageElement => Boolean(art?.complete && art.naturalWidth);
const grade = 'saturate(1.07) contrast(1.04)';
const powerBlack = '#010205';
const gripEyes = [
  'M337 162 Q373 170 412 195 Q464 228 487 302 Q449 320 406 303 Q350 282 333 240 Q317 205 337 162Z',
  'M659 184 Q671 209 661 253 Q654 288 623 306 Q601 319 573 307 Q582 271 602 249 Q623 218 659 184Z',
] as const;

const breakerLever = 'M220 234 L267 195 Q270 193 279 195 L310 203 L326 225 L310 243 L298 244 L268 275 L226 269 Z';
const breakerPaw = 'M276 195 Q293 177 316 173 Q352 169 369 189 Q385 213 405 259 Q428 292 446 328 Q466 365 493 416 Q518 455 551 472 Q598 496 667 511 L697 540 H439 Q431 508 420 480 Q405 439 391 399 Q376 347 357 309 Q344 286 320 277 Q301 269 295 250 Q280 247 279 230 Q275 215 285 209 L275 205Z';

function drawBreaker(ctx: Context, art: HTMLImageElement | undefined, plate: HTMLImageElement | undefined, height: number, local: number) {
  // Preload the lever against its stop, then cut power on the 1:03.76 kick.
  const contact = local - 2.40;
  const pull = .18 * ease((local - 2.06) / .20) + .82 * ease((local - 2.26) / .14);
  if (pull > 0 && ready(art) && ready(plate)) {
    ctx.filter = grade;
    ctx.drawImage(plate, 196, 153);

    const rotation = pull * .94;
    const hingeX = 226;
    const hingeY = 259;
    ctx.save();
    ctx.translate(hingeX, hingeY);
    ctx.rotate(rotation);
    ctx.translate(-hingeX, -hingeY);
    ctx.clip(new Path2D(breakerLever));
    ctx.drawImage(art, 0, 0, 960, height);
    ctx.restore();

    // Keep the fingers on the grip as the lever rotates through its stop.
    const holdX = 291, holdY = 228;
    const dx = holdX - hingeX, dy = holdY - hingeY;
    const x = hingeX + Math.cos(rotation) * dx - Math.sin(rotation) * dy;
    const y = hingeY + Math.sin(rotation) * dx + Math.cos(rotation) * dy;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-.10 * pull);
    ctx.translate(-holdX, -holdY);
    ctx.clip(new Path2D(breakerPaw));
    ctx.drawImage(art, 0, 0, 960, height);
    ctx.restore();
    ctx.filter = 'none';
  }

  if (contact < 0) return;
  ctx.globalAlpha = 1 - Math.exp(-contact * 45);
  ctx.fillStyle = powerBlack;
  ctx.fillRect(-120, -130, 1200, height + 260);
  ctx.globalAlpha = 1;
}

function drawGrip(ctx: Context, art: HTMLImageElement | undefined, height: number, local: number) {
  // Only the near eye is visible before the scene returns on the beat at 1:04.40.
  const switchOn = local - .38;
  const blackout = switchOn < 0 ? .994 : 1 - ease(switchOn / .065);
  if (blackout > 0) {
    ctx.fillStyle = powerBlack;
    ctx.globalAlpha = blackout;
    ctx.fillRect(-110, -130, 1180, height + 260);
    ctx.globalAlpha = 1;

    if (ready(art)) {
      ctx.save();
      ctx.clip(new Path2D(gripEyes[0]));
      ctx.globalAlpha = blackout * .84;
      ctx.filter = 'saturate(1.16) brightness(.72)';
      ctx.drawImage(art, 0, 0, 960, height);
      ctx.restore();
    }
  }

  ctx.filter = 'none';
  if (switchOn >= 0 && switchOn < .15) {
    const light = ctx.createRadialGradient(434, 270, 12, 434, 270, 760);
    light.addColorStop(0, '#a4ffbd57');
    light.addColorStop(.41, '#51ffae2e');
    light.addColorStop(1, '#69ffc100');
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 1 - switchOn / .15;
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, 960, height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  const flame = ease((local - .92) / .16);
  if (flame === 0) return;
  drawEyeFlame(ctx, gripEyes[0], 415, 299, .89, local, flame);
  drawEyeFlame(ctx, gripEyes[1], 624, 307, .63, local + .12, flame);
}

function drawEyeFlame(ctx: Context, eye: string, x: number, y: number, scale: number, local: number, alpha: number) {
  ctx.save();
  ctx.clip(new Path2D(eye));
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const heat = ctx.createRadialGradient(7, -17, 7, 0, -35, 101);
  heat.addColorStop(0, '#fff3ad');
  heat.addColorStop(.42, '#ff745399');
  heat.addColorStop(1, '#d7272700');
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = alpha * .61;
  ctx.fillStyle = heat;
  ctx.fillRect(-103, -139, 206, 174);
  ctx.globalCompositeOperation = 'source-over';

  for (let i = 0; i < 3; i++) {
    const flicker = Math.sin(local * (18 + 3 * i) + i * 3.5);
    const dx = i * 25 - 23;
    const high = 75 + i * 8 + flicker * 15;
    const fill = ctx.createLinearGradient(dx, -high, dx, 3);
    fill.addColorStop(0, '#e5323290');
    fill.addColorStop(.4, '#ff6e23');
    fill.addColorStop(.72, '#ffa33c');
    fill.addColorStop(1, '#fff4bc');
    ctx.globalAlpha = alpha * (.71 + i * .075);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(dx - 22, 4);
    ctx.bezierCurveTo(dx - 52, -31, dx + 10, -48, dx - 5 + flicker * 14, -high);
    ctx.bezierCurveTo(dx + 39, -57, dx + 40, -40, dx + 14, -24);
    ctx.quadraticCurveTo(dx + 39, -31, dx + 30, -51);
    ctx.bezierCurveTo(dx + 57, -29, dx + 32, 7, dx - 22, 4);
    ctx.fill();
  }
  ctx.restore();
}

function drawSadBlink(ctx: Context, plate: HTMLImageElement | undefined, height: number, local: number) {
  if (!ready(plate)) return;
  const moment = local - 1.49;
  const closure = ease(moment / .16) * (1 - ease((moment - .29) / .22));
  if (closure <= 0) return;
  ctx.save();
  ctx.beginPath();
  // The skin moves down across the eye. Only the closed-eye cel is exposed under the lid.
  ctx.rect(348, 305, 88, 19 + closure * 49);
  ctx.rect(452, 328, 58, 14 + closure * 45);
  ctx.clip();
  ctx.filter = grade;
  ctx.drawImage(plate, 0, 0, 960, height);
  ctx.restore();
}

const strikingPaw = 'M0 0 H394 Q432 82 495 140 Q544 156 589 174 Q638 194 657 225 Q683 261 678 306 Q680 360 650 389 Q629 411 604 415 Q573 430 551 425 Q525 420 512 415 Q469 441 430 427 Q394 431 358 398 Q318 366 296 333 Q263 313 251 276 Q225 234 219 186 Q209 159 175 137 Q119 110 81 76 L0 71 Z';

export const keyImpact = .2;

function drawKeyImpact(ctx: Context, art: HTMLImageElement | undefined, plate: HTMLImageElement | undefined, height: number, local: number) {
  if (local < keyImpact && ready(art) && ready(plate)) {
    ctx.filter = grade;
    ctx.drawImage(plate, 0, 0, 960, height);
    const drop = (local / keyImpact) ** 3.1;
    ctx.save();
    ctx.translate(-23 * (1 - drop), -152 * (1 - drop));
    ctx.clip(new Path2D(strikingPaw));
    ctx.drawImage(art, 0, 0, 960, height);
    ctx.restore();
    ctx.filter = 'none';
  }

  const contact = local - keyImpact;
  if (contact < 0 || contact > .53) return;
  ctx.globalCompositeOperation = 'screen';
  const light = ctx.createRadialGradient(536, 432, 16, 536, 432, 357);
  light.addColorStop(0, '#fff7b5');
  light.addColorStop(.17, '#ffc139bf');
  light.addColorStop(.55, '#ff431443');
  light.addColorStop(1, '#ff3c0c00');
  ctx.globalAlpha = Math.exp(-contact * 11) * .77;
  ctx.fillStyle = light;
  ctx.fillRect(157, 79, 748, 579);

  // Fragments leave the face of the key in the same directions as the strokes in the art.
  for (let i = 0; i < 13; i++) {
    const tilt = -Math.PI + i * .226;
    const radius = contact * (480 + (i * 137) % 860);
    const dx = Math.cos(tilt), dy = Math.sin(tilt);
    const tail = 21 + (i * 17) % 67;
    ctx.globalAlpha = Math.exp(-contact * 5) * .85;
    ctx.fillStyle = i % 3 === 0 ? '#fff2ad' : '#ffa12c';
    ctx.beginPath();
    ctx.moveTo(540 + dx * radius, 428 + dy * radius);
    ctx.lineTo(540 + dx * (radius - tail) - dy * 4, 428 + dy * (radius - tail) + dx * 4);
    ctx.lineTo(540 + dx * (radius - tail) + dy * 2, 428 + dy * (radius - tail) - dx * 2);
    ctx.fill();
  }
}

export const perceptionOnset = .61;

function drawPerception(ctx: Context, art: HTMLImageElement | undefined, height: number, local: number) {
  if (!ready(art) || local < perceptionOnset || local > 1.91) return;
  const moment = local - perceptionOnset;
  ctx.globalAlpha = 1 - ease((moment - .94) / .35);
  ctx.filter = moment < .10
    ? 'grayscale(1) contrast(2.7) brightness(.82)'
    : 'hue-rotate(276deg) saturate(1.65) contrast(1.38) brightness(.9)';
  ctx.drawImage(art, 0, 0, 960, height);
  ctx.filter = 'none';

  // The iris stays tied to Frontie's point of focus while the landscape changes palette.
  ctx.save();
  const eye = 'M503 161 Q522 150 537 170 Q552 187 551 209 Q543 222 523 215 Q506 210 501 190 Q498 174 503 161 Z';
  ctx.clip(new Path2D(eye));
  ctx.filter = 'saturate(1.38) contrast(1.2) brightness(1.22)';
  ctx.drawImage(art, 0, 0, 960, height);
  ctx.restore();
  ctx.save();
  ctx.clip(new Path2D(eye));
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = 'none';
  const focus = Math.exp(-Math.abs(moment - .34) * 11);
  const shimmer = ctx.createRadialGradient(530, 178, 1, 530, 178, 25);
  shimmer.addColorStop(0, '#fffce4');
  shimmer.addColorStop(.36, '#ffca70d6');
  shimmer.addColorStop(1, '#ff932800');
  ctx.fillStyle = shimmer;
  ctx.globalAlpha = focus * .91;
  ctx.fillRect(502, 150, 52, 69);
  ctx.restore();
}

function drawSkySpiral(ctx: Context, plate: HTMLImageElement | undefined, local: number, energy: number) {
  if (!ready(plate)) return;
  const angle = .3 * local + .048 * Math.sin(local * 9.82);
  ctx.save();
  // The crop contains only the brush strokes of the sky, above the castle silhouette.
  ctx.translate(484, 151);
  ctx.rotate(angle);
  ctx.filter = grade;
  ctx.drawImage(plate, -173, -151);
  ctx.restore();
  const center = ctx.createRadialGradient(484, 151, 4, 484, 151, 84);
  center.addColorStop(0, '#fffbd9');
  center.addColorStop(.58, '#fff7af37');
  center.addColorStop(1, '#ffca5e00');
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = center;
  ctx.globalAlpha = .17 + energy * .26;
  ctx.beginPath();
  ctx.arc(484, 151, 84, 0, turn);
  ctx.fill();
}

export function drawAnimeLateBeat(
  ctx: Context, image: string, local: number, energy: number,
  camera?: Camera, art?: HTMLImageElement, plate?: HTMLImageElement,
) {
  if (!isLateBeatShot(image)) return false;
  ctx.save();
  if (camera) {
    ctx.translate(640 + camera.x * 12.8, 360 + camera.y * 7.2);
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-640, -360);
  }
  const fallbackHeight = image === 'tired' || image === 'paw' ? 635 : 540;
  const height = ready(art) ? 960 * art.naturalHeight / art.naturalWidth : fallbackHeight;
  ctx.scale(4 / 3, 4 / 3);
  ctx.translate(0, (540 - height) * (image === 'tired' || image === 'grip' ? .4 : image === 'crest-ignites' ? .38 : .5));
  if (image === 'breaker') drawBreaker(ctx, art, plate, height, local);
  if (image === 'grip') drawGrip(ctx, art, height, local);
  if (image === 'tired') drawSadBlink(ctx, plate, height, local);
  if (image === 'paw') drawKeyImpact(ctx, art, plate, height, local);
  if (image === 'crest-ignites') drawPerception(ctx, art, height, local);
  if (image === 'distant-orb') drawSkySpiral(ctx, plate, local, energy);
  ctx.restore();
  return true;
}
