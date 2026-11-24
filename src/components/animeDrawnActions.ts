// The paths and pivots below are traced against the original artwork at 960 × 540.
type Context = CanvasRenderingContext2D;
type Point = readonly [number, number];

const fullTurn = Math.PI * 2;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const p = clamp(value);
  return p * p * (3 - 2 * p);
};
const texture = (index: number) => (Math.sin(81.33 * index + 27) * 9257.658 % 1 + 1) % 1;

function glow(ctx: Context, x: number, y: number, radius: number, color: string, opacity: number) {
  const light = ctx.createRadialGradient(x, y, 0, x, y, radius);
  light.addColorStop(0, '#fffbe8');
  light.addColorStop(.15, color + 'e8');
  light.addColorStop(.52, color + '64');
  light.addColorStop(1, color + '00');
  ctx.globalAlpha = opacity;
  ctx.fillStyle = light;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function traceRibbon(ctx: Context) {
  ctx.moveTo(367, 278);
  ctx.bezierCurveTo(487, 206, 548, 292, 610, 263);
  ctx.bezierCurveTo(674, 218, 715, 86, 807, 63);
  ctx.bezierCurveTo(863, 45, 923, 44, 960, 79);
  ctx.lineTo(960, 186);
  ctx.bezierCurveTo(917, 91, 838, 120, 779, 137);
  ctx.bezierCurveTo(720, 158, 707, 229, 640, 261);
  ctx.bezierCurveTo(565, 318, 527, 258, 491, 266);
  ctx.bezierCurveTo(445, 261, 406, 282, 362, 296);
  ctx.closePath();
}

function highlightedRibbon(ctx: Context, time: number, energy: number) {
  ctx.save();
  ctx.beginPath();
  traceRibbon(ctx);
  ctx.clip();
  const head = 270 + ease((time - .47) / .83) * 850;
  const sheen = ctx.createLinearGradient(head - 280, 0, head + 60, 0);
  sheen.addColorStop(0, '#f0398900');
  sheen.addColorStop(.36, '#ff61cd45');
  sheen.addColorStop(.73, '#ffb3ec95');
  sheen.addColorStop(.87, '#fff6cae0');
  sheen.addColorStop(1, '#fff2b000');
  ctx.globalAlpha = ease((time - .35) / .26) * (.72 + .28 * energy);
  ctx.fillStyle = sheen;
  ctx.fillRect(350, 40, 610, 275);
  ctx.restore();
}

function drawMoonTransformation(ctx: Context, local: number, band: number, art?: HTMLImageElement) {
  const [gemX, gemY] = [238, 273];
  // A brief hold on the locket, then the strike at 9.08 resolves the charge.
  const charge = ease(local / 1.23);
  const hit = Math.max(0, local - 1.23);
  const release = ease(hit / .46);
  const pressure = local < 1.23 ? charge * .74 : (1 - release) * (.8 + band * .2);

  ctx.globalAlpha = (.54 + charge * .15) * (1 - release);
  const shade = ctx.createRadialGradient(gemX, gemY, 25, gemX, gemY, 805);
  shade.addColorStop(0, '#170c4100');
  shade.addColorStop(.48, '#20104268');
  shade.addColorStop(1, '#151640ea');
  ctx.fillStyle = shade;
  ctx.fillRect(-100, -100, 1160, 740);

  ctx.globalCompositeOperation = 'screen';
  glow(ctx, gemX, gemY, 34 + charge * 114, '#ff81b7', pressure);
  highlightedRibbon(ctx, local, band);

  // The moon throws back the light as a sweep along its painted crescent.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(366, 3);
  ctx.bezierCurveTo(534, -15, 640, 155, 528, 312);
  ctx.bezierCurveTo(432, 447, 220, 489, 102, 369);
  ctx.bezierCurveTo(80, 338, 62, 278, 65, 222);
  ctx.bezierCurveTo(74, 322, 144, 398, 272, 388);
  ctx.bezierCurveTo(516, 399, 596, 100, 366, 3);
  ctx.clip();
  const trail = release ** .74;
  glow(ctx, 523 - 289 * trail, 97 + 266 * trail, 27 + trail * 168, '#ffb96d',
    (.18 + charge * .48) * (1 - trail * .37));
  ctx.restore();

  if (hit <= 0) return;
  const push = clamp(hit / .47);
  const x = gemX + 180 * push ** 1.7;
  const y = gemY + 163 * push ** 1.7;
  const ringSize = 32 + 440 * push ** 2.1;
  const visibility = ease(hit / .075);
  const transfer = ease((hit - .32) / .15);
  glow(ctx, x, y, ringSize * 2.1, '#fa80b6', visibility * (1 - transfer) * .56);

  if (art?.complete && art.naturalWidth) {
    // The projected seal is the locket from the drawing, with its original filigree.
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(push * .65);
    ctx.scale(.85 + .15 * Math.cos(push * 3), 1);
    ctx.beginPath();
    ctx.arc(0, 0, ringSize, 0, fullTurn);
    ctx.clip();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = visibility * (1 - transfer) * .84;
    const sx = art.naturalWidth / 960;
    const sy = art.naturalHeight / 540;
    ctx.drawImage(art, 221 * sx, 258 * sy, 35 * sx, 35 * sy, -ringSize, -ringSize, ringSize * 2, ringSize * 2);
    ctx.restore();
  }

  ctx.globalAlpha = visibility * (1 - transfer);
  ctx.lineWidth = 1.5 + push * 4;
  ctx.strokeStyle = '#ffeeb6';
  ctx.beginPath();
  ctx.arc(x, y, ringSize, 0, fullTurn);
  ctx.stroke();
  glow(ctx, x, y, 120 + transfer ** 2 * 840, '#78ebff', transfer * .84);
}

function drawCableContact(ctx: Context, local: number, band: number) {
  const [x, y] = [417, 436];
  const arrival = Math.exp(-local * 12);
  ctx.globalCompositeOperation = 'screen';
  glow(ctx, x, y, 64 + arrival * 700, '#78ebff', arrival * .84);
  const travel = ease(local / .84);
  // The same contact point sends the pulse down both sides of the braided cable.
  const branches = [
    [[417, 436], [531, 483], [760, 394], [964, 291]],
    [[417, 436], [345, 441], [258, 547], [200, 508]],
  ] as const;
  for (const [start, a, b, end] of branches) {
    const u = 1 - travel;
    const px = u ** 3 * start[0] + 3 * u * u * travel * a[0] + 3 * u * travel ** 2 * b[0] + travel ** 3 * end[0];
    const py = u ** 3 * start[1] + 3 * u * u * travel * a[1] + 3 * u * travel ** 2 * b[1] + travel ** 3 * end[1];
    glow(ctx, px, py, 49 + band * 24, '#4affee', (1 - travel ** 4) * (.56 + band * .31));
  }
}

const steelEdge: readonly Point[] = [[39, 510], [131, 442], [246, 365], [366, 313], [490, 281], [619, 250], [751, 224], [882, 206], [966, 194]];

function waterBead(ctx: Context, x: number, y: number, size: number, angle: number, opacity: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(1, .47);
  const water = ctx.createLinearGradient(0, -size, 0, size);
  water.addColorStop(0, '#f5fffd');
  water.addColorStop(.26, '#a6fffc');
  water.addColorStop(.43, '#14485a');
  water.addColorStop(.62, '#0d314f');
  water.addColorStop(.82, '#27bccc');
  water.addColorStop(1, '#f2fffe');
  ctx.fillStyle = water;
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, fullTurn);
  ctx.fill();
  ctx.restore();
}

function drawBlade(ctx: Context, local: number, band: number) {
  const hit = ease((local - .3) / .71);
  const sweep = -160 + hit * 1300;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(12, 538);
  ctx.bezierCurveTo(253, 254, 630, 146, 960, 47);
  for (const [x, y] of [...steelEdge].reverse()) ctx.lineTo(x, y);
  ctx.closePath();
  ctx.clip();
  ctx.globalCompositeOperation = 'screen';
  const shine = ctx.createLinearGradient(sweep - 170, 0, sweep + 52, 0);
  shine.addColorStop(0, '#1ac5e300');
  shine.addColorStop(.49, '#25c8ff78');
  shine.addColorStop(.66, '#a5ffffc2');
  shine.addColorStop(.77, '#ffffe6df');
  shine.addColorStop(.84, '#fffbe4a0');
  shine.addColorStop(1, '#88feff00');
  ctx.globalAlpha = .82 + band * .18;
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, 960, 540);
  ctx.restore();

  for (let i = 1; i < steelEdge.length; i++) {
    const [x, y] = steelEdge[i];
    const age = local - .45 - i * .059;
    if (age <= 0 || age >= .62) continue;
    const dx = 42 + texture(i) * 79;
    const by = y + age ** 2 * 510;
    waterBead(ctx, x + age * dx, by, 4 + texture(i + 8) * 10, -.74 + age * 2.9, 1 - (age / .62) ** 4);
    waterBead(ctx, x + age * dx * 1.42, by - age * 26, 2 + texture(i + 17) * 4, -.87, 1 - age / .62);
  }
}

function drawLanding(ctx: Context, local: number, band: number, art?: HTMLImageElement) {
  // Keep the paw in front of the water, with the waves mapped to the paving.
  const phase = clamp((local - .085) / .99);
  if (phase === 0) return;
  if (art?.complete && art.naturalWidth) {
    // Reproject the painted spray either side of the paw and fan it out from the point of impact.
    const rise = Math.sin(Math.PI * phase) * 78;
    ctx.save();
    ctx.globalAlpha = Math.sin(Math.PI * phase) * (.55 + band * .35);
    ctx.globalCompositeOperation = 'screen';
    const sx = art.naturalWidth / 960;
    const sy = art.naturalHeight / 540;
    for (const [left, top, width, foot, side] of [[4, 292, 182, 481, -1], [469, 338, 151, 483, 1]]) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(side === -1 ? 174 : 467, foot);
      ctx.quadraticCurveTo(left + width / 2, top + 100 - rise * .37, left + (side === -1 ? 14 : width), top - rise);
      ctx.quadraticCurveTo(left + width * .46, top + 142 - rise, left + width * .55, foot + 10);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(art, left * sx, top * sy, width * sx, (foot - top) * sy,
        left + phase * side * 34, top - rise, width, foot - top + rise);
      ctx.restore();
    }
    ctx.restore();
  }
  for (let i = 0; i < 3; i++) {
    const wave = clamp(phase * 1.4 - i * .17);
    if (wave <= 0 || wave >= 1) continue;
    const radius = 100 + 620 * wave ** .7;
    const left = 325 - radius;
    const right = 325 + radius;
    const crest = 482 + wave * 85;
    const reflection = ctx.createLinearGradient(left, 0, right, 0);
    reflection.addColorStop(0, '#05a59f00');
    reflection.addColorStop(.22, '#33ffe496');
    reflection.addColorStop(.51, '#e1fff7');
    reflection.addColorStop(.81, '#62fff886');
    reflection.addColorStop(1, '#16c3ba00');
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = reflection;
    ctx.globalAlpha = (1 - wave) * (.58 + band * .32);
    ctx.lineWidth = 1 + 5 * (1 - wave);
    ctx.beginPath();
    ctx.moveTo(left, crest - 28);
    ctx.bezierCurveTo(325 - radius * .66, crest + 28, 325 + radius * .59, crest + 41, right, crest - 12);
    ctx.stroke();
  }

  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 16; i++) {
    const age = clamp((local - .105 - texture(i + 12) * .07) / (.52 + texture(i + 48) * .4));
    if (age <= 0 || age >= 1) continue;
    const side = i % 2 ? 1 : -1;
    const rise = 61 + texture(i + 41) * 143;
    const x = 324 + side * (128 + age * (48 + texture(i + 98) * 258));
    const y = 479 - Math.sin(age * Math.PI) * rise + age * 28;
    waterBead(ctx, x, y, 2.6 + texture(i) * 8.3, side * (.68 - age * 1.45), 1 - age ** 4);
  }
}

type Camera = { x: number; y: number; scale: number };

export function drawAnimeDrawnAction(ctx: Context, image: string, local: number, band: number, camera?: Camera, art?: HTMLImageElement) {
  const draw = image === 'sailor-moon' ? drawMoonTransformation
    : image === 'cable-touch' ? drawCableContact
    : image === 'rain-blade' ? drawBlade
    : image === 'combat-land' ? drawLanding : undefined;
  if (!draw) return;
  ctx.save();
  if (camera) {
    ctx.translate(640 + camera.x * 12.8, 360 + camera.y * 7.2);
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-640, -360);
  }
  ctx.scale(4 / 3, 4 / 3);
  draw(ctx, local, band, art);
  ctx.restore();
}
