type Context = CanvasRenderingContext2D;
type Point = readonly [x: number, y: number];

export const titanGatePlate = 'actions/titan-gate.webp';
export const scoutSheet = 'actions/titan-scouts.webp';
const impactTime = .83;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const noise = (seed: number) => {
  const value = Math.sin(seed * 78.233 + .146) * 43758.5453;
  return value - Math.floor(value);
};

function dust(ctx: Context, x: number, y: number, radius: number, opacity: number) {
  const light = ctx.createRadialGradient(x, y, radius * .12, x, y, radius);
  light.addColorStop(0, '#ffe2bc');
  light.addColorStop(.38, '#db9a70b0');
  light.addColorStop(1, '#9a654900');
  ctx.fillStyle = light;
  ctx.globalAlpha = opacity;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function masonry(ctx: Context, wall: HTMLImageElement, age: number, origin: Point) {
  if (age < 0) return;
  for (let i = 0; i < 25; i++) {
    const t = age - i % 4 * .028;
    if (t < 0 || t > 2.35) continue;
    const size = 7 + noise(i + 4) * 31;
    const side = i % 2 === 0 ? -1 : 1;
    const x = origin[0] + side * (20 + noise(i + 53) * 51 + t * (64 + noise(i + 13) * 209));
    const y = origin[1] - t * (98 + noise(i + 23) * 261) + t ** 2 * 196;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(side * (i * 1.81 + t * (2 + noise(i + 33) * 4)));
    ctx.scale(1 + t * .51, 1 + t * .51);
    ctx.beginPath();
    ctx.moveTo(-size * .55, -size * .33);
    ctx.lineTo(size * .21, -size * .52);
    ctx.lineTo(size * .53, -size * .13);
    ctx.lineTo(size * .32, size * .43);
    ctx.lineTo(-size * .39, size * .36);
    ctx.closePath();
    ctx.clip();
    const sx = wall.naturalWidth / 960;
    const sy = wall.naturalHeight / 540;
    ctx.drawImage(wall, (234 + noise(i + 39) * 103) * sx, (328 + noise(i + 83) * 60) * sy,
      29 * sx, 29 * sy, -size * .6, -size * .6, size * 1.2, size * 1.2);
    ctx.restore();
  }
}

type Launch = {
  at: number;
  start: Point;
  anchor: Point;
  curve: Point;
  end: Point;
  duration: number;
  size: number;
  mirror?: boolean;
};

const launches: readonly Launch[] = [
  { at: 1.15, start: [108, 474], anchor: [377, 284], curve: [66, 174], end: [484, 151], duration: 1.91, size: 162 },
  { at: 1.35, start: [909, 455], anchor: [633, 284], curve: [913, 161], end: [586, 121], duration: 1.87, size: 153, mirror: true },
  { at: 1.64, start: [-47, 525], anchor: [426, 281], curve: [431, 387], end: [466, 68], duration: 1.81, size: 208 },
  { at: 1.77, start: [1013, 509], anchor: [503, 284], curve: [552, 366], end: [421, 126], duration: 1.68, size: 194, mirror: true },
  { at: 2.05, start: [926, 566], anchor: [566, 281], curve: [833, 401], end: [538, 112], duration: 1.81, size: 184 },
];

function drawCable(ctx: Context, from: Point, to: Point, slack: number) {
  ctx.beginPath();
  ctx.moveTo(...from);
  ctx.quadraticCurveTo((from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + slack, ...to);
  ctx.lineWidth = 2.1;
  ctx.strokeStyle = '#30201c';
  ctx.stroke();
  ctx.lineWidth = .85;
  ctx.strokeStyle = '#ffe4b9';
  ctx.stroke();
}

function drawScouts(ctx: Context, sheet: HTMLImageElement, local: number) {
  const cell = sheet.naturalWidth / launches.length;
  for (const [i, launch] of launches.entries()) {
    const { at, start, anchor, curve, end, duration, size, mirror } = launch;
    const age = local - at;
    if (age < -.19 || age >= duration) continue;
    const p = clamp(age / duration);
    const t = p < .38 ? .6 * p + 2.6 * p ** 2 : .60344 + .39656 * ((p - .38) / .62);
    const u = 1 - t;
    const x = u ** 2 * start[0] + 2 * u * t * curve[0] + t ** 2 * end[0];
    const y = u ** 2 * start[1] + 2 * u * t * curve[1] + t ** 2 * end[1];
    const height = size * (1.04 - p * .50);
    const width = height * cell / sheet.naturalHeight;
    const pelvis: Point = [x, y + height * .11];
    const alpha = 1 - clamp((p - .90) / .1);

    ctx.save();
    if (age < 0) {
      const flight = clamp((age + .19) / .16);
      const hook: Point = [pelvis[0] + (anchor[0] - pelvis[0]) * flight, pelvis[1] + (anchor[1] - pelvis[1]) * flight];
      drawCable(ctx, pelvis, hook, 5 * (1 - flight));
    } else {
      ctx.globalAlpha = alpha * (1 - clamp((p - .63) / .26));
      drawCable(ctx, anchor, pelvis, Math.sin(age * 25) * 6 * Math.exp(-age * 4));
      ctx.globalAlpha = 1;
      if (age < .16) {
        const recoil = age / .16;
        ctx.fillStyle = '#fff0be';
        ctx.globalAlpha = (1 - recoil) * .85;
        ctx.beginPath();
        ctx.moveTo(anchor[0] - 5, anchor[1] + 3);
        ctx.lineTo(anchor[0] + 1, anchor[1] - 9);
        ctx.lineTo(anchor[0] + 5, anchor[1] + 3);
        ctx.fill();
      }
      if (age < .47) {
        const thrust = 1 - age / .47;
        for (let puff = 0; puff < 4; puff++) {
          const trail = puff / 4;
          dust(ctx, x + (start[0] - x) * trail * .6, y + height * .16 + 32 * trail,
            7 + 17 * trail, thrust * (1 - trail * .75) * .64);
        }
      }
    }

    ctx.translate(x, y);
    const direction = mirror ? -1 : 1;
    ctx.rotate(direction * (-.39 + .64 * Math.sin(p * Math.PI)));
    if (mirror) ctx.scale(-1, 1);
    ctx.globalAlpha = alpha;
    ctx.drawImage(sheet, i * cell, 0, cell, sheet.naturalHeight, -width * .5, -height * .5, width, height);
    ctx.restore();
  }
}

function thrustPaw(ctx: Context, wall: HTMLImageElement, age: number) {
  if (age < 0) return;
  const extend = 1 - (1 - clamp(age / .26)) ** 3;
  const settle = clamp((age - .28) / 1.42);
  const size = .39 + .26 * extend - .035 * settle;
  ctx.save();
  // The toes push through the gate; the stone surround hides the wrist.
  ctx.beginPath();
  ctx.moveTo(404, 435);
  ctx.quadraticCurveTo(415, 367, 474, 347);
  ctx.quadraticCurveTo(547, 348, 568, 426);
  ctx.lineTo(572, 471);
  ctx.quadraticCurveTo(576, 510, 550, 526);
  ctx.lineTo(396, 530);
  ctx.lineTo(385, 488);
  ctx.closePath();
  ctx.clip();
  ctx.translate(478 - 9 * extend, 357 + 95 * extend - 7 * settle);
  ctx.rotate(.25 - extend * .48 + settle * .06);
  ctx.scale(-size, size);
  ctx.translate(-823, -248);
  ctx.clip(new Path2D('M694 263 Q696 226 723 191 Q747 170 776 169 Q804 154 831 164 Q867 173 884 188 Q912 183 935 202 L959 224 L960 272 Q948 283 925 279 Q916 298 892 289 Q880 300 857 288 Q843 305 818 292 Q805 300 783 285 Q763 292 746 274 Q724 286 702 271Z'));
  ctx.drawImage(wall, 0, 0, 960, 540);
  ctx.restore();
}

function breakGate(ctx: Context, gate: HTMLImageElement, age: number) {
  if (age < 0) {
    ctx.drawImage(gate, 381, 337, 198, 188);
    return;
  }
  const fall = clamp(age / .44);
  if (fall === 1) return;
  const half = gate.naturalWidth / 2;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(480 + side * fall * (28 + 61 * fall), 426 + fall ** 2 * 104);
    ctx.rotate(side * fall * (1.1 + .28 * side));
    ctx.globalAlpha = 1 - fall ** 3;
    ctx.drawImage(gate, side < 0 ? 0 : half, 0, half, gate.naturalHeight, side < 0 ? -99 : 0, -89, 99, 188);
    ctx.restore();
  }
}

export function drawTitanBreach(ctx: Context, local: number, energy: number, wall?: HTMLImageElement, scouts?: HTMLImageElement, gate?: HTMLImageElement) {
  if (!wall?.complete || !wall.naturalWidth) return;
  const age = local - impactTime;
  const tremor = age > 0 ? Math.sin(age * 51) * Math.exp(-age * 5.4) : 0;
  const origin: Point = [478, 411];
  ctx.save();
  ctx.scale(4 / 3, 4 / 3);
  ctx.translate(480 + tremor * 12, 270 + tremor * 9);
  const zoom = 1.09 - clamp(local / 3.63) * .048;
  ctx.scale(zoom, zoom);
  ctx.translate(-480, -270);
  ctx.drawImage(wall, 0, 0, 960, 540);
  thrustPaw(ctx, wall, age);
  if (gate?.complete && gate.naturalWidth) breakGate(ctx, gate, age);

  for (let i = 0; i < 9; i++) {
    const phase = (local * (.32 + noise(i + 6) * .15) + i * .23) % 1;
    const x = (i % 2 ? 730 : 213) + (noise(i + 78) - .5) * 214;
    dust(ctx, x, 289 - 239 * phase, 23 + phase * 82, Math.sin(phase * Math.PI) * .23);
  }
  ctx.globalAlpha = 1;

  if (age >= 0) {
    const spread = 1 - Math.exp(-age * 1.8);
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? 1 : -1;
      const x = origin[0] + side * (19 + noise(i + 27) * 199) * spread;
      const y = origin[1] + noise(i + 34) * 106 - spread * (30 + noise(i + 52) * 66);
      dust(ctx, x, y, 20 + spread * (66 + noise(i + 3) * 91), .24 * (1 - clamp((age - .9) / 2)));
    }
    ctx.globalAlpha = 1;
    masonry(ctx, wall, age, origin);
    ctx.globalCompositeOperation = 'screen';
    dust(ctx, origin[0], origin[1], 126 + age * 119, Math.exp(-age * 8) * (.24 + energy * .36));
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  if (scouts?.complete && scouts.naturalWidth) drawScouts(ctx, scouts, local);
  ctx.restore();
}
