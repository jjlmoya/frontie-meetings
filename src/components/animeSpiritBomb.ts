type Context = CanvasRenderingContext2D;
type Point = readonly [x: number, y: number];
type Camera = { x: number; y: number; scale: number };

const turn = 2 * Math.PI;
const limit = (p: number) => Math.min(1, Math.max(0, p));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const rhythm = (index: number) => ((index * 137) % 101) / 101;

const hands: readonly Point[] = [[392, 274], [558, 273]];
const horizons: readonly Point[] = [
  [-38, 193], [104, 341], [207, 436], [347, 469],
  [623, 461], [764, 430], [882, 331], [998, 137],
];

function pointOnFeed(origin: Point, x: number, y: number, lane: number, phase: number): Point {
  const side = Math.sign(origin[0] - x);
  const span = Math.abs(origin[0] - x);
  const bend = Math.sin(phase * Math.PI) * (45 + lane * 7);
  return [
    mix(origin[0], x, phase ** .82) + side * bend * .48,
    mix(origin[1], y, phase) - bend - span * Math.sin(phase * Math.PI) * .17,
  ];
}

function drawFeeds(ctx: Context, time: number, grown: number, x: number, y: number, radius: number) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'screen';
  for (const [i, origin] of horizons.entries()) {
    for (let j = 0; j < 4; j++) {
      const seed = rhythm(i * 4 + j);
      const phase = (time * (.44 + seed * .3) + j / 4 + i * .137) % 1;
      const tail = .024 + grown * .091;
      const head = pointOnFeed(origin, x, y, i, phase);
      if (Math.hypot(head[0] - x, head[1] - y) < radius * .94) continue;
      const trace = (width: number, color: string, opacity: number) => {
        ctx.strokeStyle = color;
        ctx.globalAlpha = Math.sin(phase * Math.PI) ** .43 * opacity * (.26 + grown * .74);
        ctx.lineWidth = width;
        ctx.beginPath();
        for (let k = 0; k <= 7; k++) {
          const step = Math.max(0, phase - tail + k * tail / 7);
          const p = pointOnFeed(origin, x, y, i, step);
          if (k === 0) ctx.moveTo(...p);
          else ctx.lineTo(...p);
        }
        ctx.stroke();
      };
      trace(3 + grown * 7, '#43bbff', .17 + seed * .23);
      trace(1.1 + seed * 1.9, i < 5 ? '#ccf7ff' : '#f4fff9', .71 + seed * .26);
      ctx.fillStyle = '#f9ffff';
      ctx.globalAlpha = Math.sin(phase * Math.PI) * .93;
      ctx.beginPath();
      ctx.arc(head[0], head[1], .9 + seed * 2.25 + grown, 0, turn);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawSpiritSphere(ctx: Context, x: number, y: number, radius: number, local: number, energy: number, grown: number) {
  ctx.save();
  ctx.translate(x, y);
  const aura = ctx.createRadialGradient(0, 0, radius * .55, 0, 0, radius * 2.58);
  aura.addColorStop(0, '#ffffff');
  aura.addColorStop(.24, '#a3edffda');
  aura.addColorStop(.43, '#47b8ff8c');
  aura.addColorStop(.71, '#177ddf30');
  aura.addColorStop(1, '#2359fd00');
  ctx.globalAlpha = .51 + grown * .22 + energy * .13;
  ctx.fillStyle = aura;
  ctx.fillRect(-radius * 2.6, -radius * 2.6, radius * 5.2, radius * 5.2);
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, turn);
  ctx.clip();
  const volume = ctx.createRadialGradient(-radius * .19, -radius * .21, 0, 0, 0, radius);
  volume.addColorStop(0, '#f9ffff');
  volume.addColorStop(.30, '#e3fdff');
  volume.addColorStop(.59, '#caf0fc');
  volume.addColorStop(.84, '#92ccf1');
  volume.addColorStop(.955, '#89d4fe');
  volume.addColorStop(1, '#e3ffff');
  ctx.fillStyle = volume;
  ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

  // Diffuse knots of light circulate beneath the surface.
  for (let i = 0; i < 15; i++) {
    const seed = rhythm(i + 71);
    const angle = i * 2.399 + local * (.72 + seed * .38);
    const drift = radius * (.15 + seed * .74);
    const cx = Math.cos(angle) * drift;
    const cy = Math.sin(angle) * drift;
    const reach = .1 + radius * (.21 + (1 - seed) * .31);
    const mist = ctx.createRadialGradient(cx, cy, .04, cx, cy, reach);
    mist.addColorStop(0, i % 3 === 0 ? '#7bc6ee' : '#faffff');
    mist.addColorStop(.49, i % 3 === 0 ? '#8bceef99' : '#e4ffff86');
    mist.addColorStop(1, '#d4faff00');
    ctx.fillStyle = mist;
    ctx.globalAlpha = .22 + seed * .29;
    ctx.fillRect(cx - reach, cy - reach, reach * 2, reach * 2);
  }
  ctx.restore();

  ctx.globalAlpha = .78 + .14 * energy;
  ctx.strokeStyle = '#e3ffff';
  ctx.lineWidth = Math.min(4.2, 1 + radius * .021);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, turn);
  ctx.stroke();

  // Irregular tongues of light drift along the rim as the sphere gains mass.
  for (let i = 0; i < 9; i++) {
    const seed = rhythm(i + 188);
    const phase = (local * (.89 + seed * .32) + seed) % 1;
    const angle = seed * turn + local * .43;
    const r = radius * (1 + .10 * phase);
    ctx.strokeStyle = i % 3 === 0 ? '#74d9ff' : '#d4fcff';
    ctx.lineWidth = .55 + seed * 1.9;
    ctx.globalAlpha = grown * Math.sin(phase * Math.PI) * (.23 + seed * .5);
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * (.98 + seed * .035), 0, angle, angle + .12 + seed * .66);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSpiritBomb(ctx: Context, local: number, progress: number, energy: number, camera?: Camera) {
  ctx.save();
  if (camera) {
    ctx.translate(640 + camera.x * 12.8, 360 + camera.y * 7.2);
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-640, -360);
  }
  ctx.scale(4 / 3, 4 / 3);
  const charge = limit(progress);
  const grown = charge ** 1.55;
  const radius = 9 + 131 * grown;
  const x = 480;
  const y = 228 - 80 * grown;
  drawFeeds(ctx, local, grown, x, y, radius);
  drawSpiritSphere(ctx, x, y, radius, local, energy, grown);

  // The light from the sphere catches both of Frontie's raised paws.
  for (const [handX, handY] of hands) {
    const reach = 15 + grown * 99;
    const reflected = ctx.createRadialGradient(handX, handY, 2, handX, handY, reach);
    reflected.addColorStop(0, '#f1ffff92');
    reflected.addColorStop(.37, '#63cfef58');
    reflected.addColorStop(1, '#41adfa00');
    ctx.fillStyle = reflected;
    ctx.globalAlpha = grown * (.62 + energy * .25);
    ctx.globalCompositeOperation = 'screen';
    ctx.fillRect(handX - reach, handY - reach, reach * 2, reach * 2);
  }
  ctx.restore();
}

export const spiritBombPaws = 'otaku-spirit-paws.webp';

export function spiritBombGesture(local: number) {
  const raise = limit((local - .12) / .57);
  return 1 - (1 - raise) ** 3;
}

export function drawStreamerOffering(
  ctx: Context, local: number, progress: number, energy: number,
  camera: Camera,
) {
  const charge = limit((local - .58) / .46) * limit((1 - progress) / .065);
  if (charge <= 0) return;
  const grown = progress ** 1.55;
  const lift = spiritBombGesture(local);
  const bottom = 540 * .87;
  // Match the webcam's fixed placement and the raised sprite's two palm centers.
  const camWidth = 960 * .214;
  const camLeft = 960 * .75;
  const rise = (1 - lift) * camWidth * .82;
  const palmHeight = bottom - camWidth * .79 + rise;
  const palms = [camLeft + camWidth * .15, camLeft + camWidth * .85];
  const targetX = 480 + camera.x * 9.6;
  const targetY = 270 + camera.y * 5.4 + (228 - 80 * grown - 270) * camera.scale;

  ctx.save();
  ctx.scale(ctx.canvas.width / 960, ctx.canvas.height / 540);
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'screen';

  for (const [side, x] of palms.entries()) {
    const y = palmHeight;
    const pull = (step: number, wave = 0) => {
      const u = 1 - step;
      const arc = Math.sin(step * Math.PI) * wave;
      const fromX = x + (side ? 16 : -23);
      const fromY = y - 151 - side * 36;
      const toX = targetX + 151 + side * 38;
      const toY = targetY + 86 - side * 17;
      return [
        u ** 3 * x + 3 * u ** 2 * step * fromX + 3 * u * step ** 2 * toX + step ** 3 * targetX,
        u ** 3 * y + 3 * u ** 2 * step * fromY + 3 * u * step ** 2 * toY + step ** 3 * targetY + arc,
      ] as const;
    };

    for (let i = 0; i < 6; i++) {
      const seed = rhythm(i + 2 + side * 9);
      const phase = (local * (1.28 + seed * .52) + i / 6 + side * .17) % 1;
      const tail = .075 + seed * .18;
      const head = pull(phase, Math.sin(local * 9 + i) * 12);
      const glow = Math.sin(phase * Math.PI) ** .5 * charge * (.61 + energy * .39);
      const trail = (width: number, color: string, opacity: number) => {
        ctx.beginPath();
        for (let k = 0; k <= 8; k++) {
          const point = pull(Math.max(0, phase - tail + tail * k / 8), Math.sin(local * 9 + i) * 12);
          if (k === 0) ctx.moveTo(...point);
          else ctx.lineTo(...point);
        }
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.globalAlpha = glow * opacity;
        ctx.stroke();
      };
      trail(8 + seed * 7, '#168ce7', .37);
      trail(2.05 + seed * 1.7, '#9af5ff', .85);
      ctx.globalAlpha = glow;
      ctx.fillStyle = '#f0ffff';
      ctx.beginPath();
      ctx.arc(...head, 1.4 + seed * 2, 0, turn);
      ctx.fill();
    }

    const light = ctx.createRadialGradient(x, y, 1, x, y, 25 + energy * 11);
    light.addColorStop(0, '#f3ffff');
    light.addColorStop(.17, '#86f5ffda');
    light.addColorStop(.57, '#2ca9ff50');
    light.addColorStop(1, '#2277ff00');
    ctx.globalAlpha = charge * (.64 + energy * .3);
    ctx.fillStyle = light;
    ctx.fillRect(x - 36, y - 36, 72, 72);
  }
  ctx.restore();
}
