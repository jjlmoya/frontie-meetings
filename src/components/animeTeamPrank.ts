type Context = CanvasRenderingContext2D;
type Camera = { x: number; y: number; scale: number };
type SpriteBox = { width: number; height: number; count: number };

export const teamPrankLayers = {
  roof: 'prank-roof.webp',
  frontie: 'prank-frontie.webp',
  partner: 'prank-partner.webp',
  team: 'prank-team.webp',
} as const;

export type PrankLayers = Record<keyof typeof teamPrankLayers, HTMLImageElement>;

const catBox = { width: 420, height: 300, count: 2 };
const partnerBox = { width: 380, height: 540, count: 2 };
const teamBox = { width: 250, height: 400, count: 4 };

const impact = 2.72;
const tick = Math.PI * 2;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const warmed = (layers?: PrankLayers): layers is PrankLayers =>
  Boolean(layers && Object.values(layers).every(({ complete, naturalWidth }) => complete && naturalWidth));

export function teamPrankKick(local: number) {
  const age = local - impact;
  return age >= 0 && age < .27 ? Math.cos(age * 74) * Math.exp(-age * 21) : 0;
}

function sprite(
  ctx: Context, sheet: HTMLImageElement, box: SpriteBox, index: number,
  x: number, foot: number, height: number, angle: number,
) {
  const width = height * box.width / box.height;
  ctx.save();
  ctx.translate(x, foot);
  ctx.rotate(angle);
  ctx.drawImage(sheet, index * sheet.naturalWidth / box.count, 0,
    sheet.naturalWidth / box.count, sheet.naturalHeight, -width / 2, -height, width, height);
  ctx.restore();
}

function groundShadow(ctx: Context, x: number, y: number, width: number, height: number, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(width, height);
  const shadow = ctx.createRadialGradient(0, 0, .1, 0, 0, 1);
  shadow.addColorStop(0, '#0a1127ae');
  shadow.addColorStop(1, '#0a112700');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = shadow;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}

function drawTeam(ctx: Context, sheet: HTMLImageElement, local: number) {
  const cast = [
    [127, 564, 494, .29, 12.6],
    [346, 568, 458, .37, 13.7],
    [568, 579, 503, .45, 12.0],
    [808, 568, 470, .54, 11.3],
  ];
  for (const [i, [x, floor, height, delay, frequency]] of cast.entries()) {
    const elapsed = local - impact - delay;
    const laugh = ease(elapsed / .15);
    const wave = Math.sin(elapsed * frequency + i * .73);
    const lift = laugh * Math.abs(wave) * (4 + i % 3 * 1.4) * 1.9;
    const reaction = laugh * (.035 + wave * .034) * (i % 2 === 0 ? -1 : 1);
    const grin = Math.sin(local * 3 + i) * .009;
    sprite(ctx, sheet, teamBox, i, x + wave * laugh * 2.2, floor - lift, height, reaction + grin);
  }
}

function drawImpact(ctx: Context, x: number, y: number, age: number) {
  if (age < 0 || age > .22) return;
  const phase = age / .22;
  const points = [1.12, .66, .95, .46, 1, .46, .85, .48, 1.05, .55, .94, .58, .95, .48, .85, .56];
  const size = 25 + 77 * (1 - (1 - phase) ** 3);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-.11);
  ctx.globalAlpha = (1 - phase) ** .65;
  ctx.beginPath();
  for (const [i, point] of points.entries()) {
    const angle = i / points.length * tick;
    const rx = Math.cos(angle) * point * size;
    const ry = Math.sin(angle) * point * size * .79;
    if (i === 0) ctx.moveTo(rx, ry);
    else ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.fillStyle = '#fff2ae';
  ctx.strokeStyle = '#473042';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function drawSurprise(ctx: Context, x: number, y: number, phase: number) {
  if (phase <= 0 || phase >= 1) return;
  ctx.save();
  ctx.translate(x, y - 13 * phase);
  ctx.globalAlpha = Math.sin(phase * Math.PI) ** .67;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(i * 10 - 12, (i - 1) ** 2 * 5);
    ctx.rotate((i - 1) * .25);
    ctx.beginPath();
    ctx.moveTo(0, -19);
    ctx.lineTo(0, -5);
    ctx.strokeStyle = '#35152f';
    ctx.stroke();
    ctx.translate(-.8, -1);
    ctx.strokeStyle = '#fff3ba';
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

export function drawTeamPrank(ctx: Context, local: number, camera?: Camera, layers?: PrankLayers, reaction = false) {
  if (!warmed(layers)) return;
  ctx.save();
  if (camera) {
    ctx.translate(640 + camera.x * 12.8, 360 + camera.y * 7.2);
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-640, -360);
  }
  ctx.scale(4 / 3, 4 / 3);
  ctx.filter = 'saturate(1.07) contrast(1.04)';
  ctx.drawImage(layers.roof, 0, 0, 960, 540);
  ctx.filter = 'none';

  if (reaction) {
    drawTeam(ctx, layers.team, local + 4);
    ctx.restore();
    return;
  }

  const age = local - impact;
  const flight = clamp(age / .91);
  const airborne = age >= 0 && flight < 1;
  const lift = airborne ? Math.sin(Math.PI * flight) ** .89 * 133 : 0;
  const recovery = ease((age - .91) / .34);
  const px = 498 + ease(flight) * 125 - recovery * 29;
  const floor = 488;
  const jumpTilt = airborne ? -.16 - Math.sin(flight * Math.PI * 1.38) * .15 : 0;
  groundShadow(ctx, px, floor + 1, 53 - lift * .18, 12, .8 - lift * .0042);
  sprite(ctx, layers.partner, partnerBox, airborne ? 1 : 0, px, floor - lift, airborne ? 276 : 290, jumpTilt);

  const creep = ease((local - .11) / 1.86);
  const sneak = (Math.sin(local * 14.6) ** 2) * 6 * (1 - creep ** 3);
  const windup = ease((local - 2.25) / .23) * (1 - ease((local - 2.53) / .19));
  const dash = ease((local - 2.52) / .20);
  const settle = ease(age / .32);
  const cx = 110 + creep * 237 - windup * 17 + dash * 49 - settle * 23;
  const cy = floor - sneak + windup * 6 - dash * (1 - settle) * 40 - Math.sin(settle * Math.PI) * 19;
  const pose = local >= 2.43 && age < .69 ? 1 : 0;
  groundShadow(ctx, cx, floor + 1, 55, 10, .75);
  sprite(ctx, layers.frontie, catBox, pose, cx, cy, pose === 1 ? 182 : 150, windup * -.10 + dash * .21 * (1 - settle));

  drawImpact(ctx, 486, 402, age);
  drawSurprise(ctx, px + 29, floor - lift - 270, age / .60);
  ctx.restore();
}
