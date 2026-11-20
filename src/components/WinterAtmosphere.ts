import { freezeAt, rigPoint, winterRigAt, type RigPart } from './WinterRig';

const fraction = (value: number) => value - Math.floor(value);
const noise = (seed: number) => fraction(Math.sin(seed * 127.1 + 311.7) * 43758.5453);

const icePoints = [
  ['whiskerLeft', -.224, -.033, -1.13], ['whiskerRight', .301, -.027, 1.17],
  ['head', -.095, -.159, -.23], ['head', .118, -.179, .45],
  ['body', -.162, .129, -.66], ['body', .163, .123, .75],
] as const;

// Coordinates relative to the mouth, following the plane of the frozen lake.
const cracks = [
  [[-.12,.319],[-.21,.303],[-.32,.313],[-.48,.284],[-.55,.304],[-.72,.285],[-.87,.311],[-1.02,.289]],
  [[-.48,.284],[-.55,.248],[-.68,.232],[-.71,.204],[-.86,.194]],
  [[.12,.327],[.23,.316],[.33,.331],[.43,.301],[.54,.317],[.72,.292],[.86,.299]],
  [[.43,.301],[.51,.267],[.64,.255],[.78,.257]],
];
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const fade = (from: number, to: number, time: number) => {
  const amount = clamp((time - from) / (to - from));
  return amount * amount * (3 - 2 * amount);
};

const snowSources: readonly [RigPart, number, number][] = [
  ['hair', -.10, -.415], ['hair', .24, -.318],
  ['whiskerLeft', -.25, -.067], ['whiskerRight', .31, -.042],
  ['body', -.16, .065], ['body', .16, .096],
  ['pawLeft', -.125, .292], ['pawRight', .14, .286],
];

function shedSnow(ctx: CanvasRenderingContext2D, time: number, x: number, y: number, scale: number, freeze: number) {
  // Evaluate past releases from the song clock, so moving the seek control
  // restores the same flakes and their paths at the chosen instant.
  const interval = .10;
  const latest = Math.floor(time / interval);
  for (let release = Math.max(0, latest - 16); release <= latest; release++) {
    const birth = release * interval;
    const pose = winterRigAt(birth, true);
    if (pose.force < .56 || freeze < .12) continue;
    const previous = winterRigAt(birth - .02, true);
    const age = time - birth;
    for (let part = 0; part < snowSources.length; part++) {
      const seed = release * 29 + part * 13;
      if (noise(seed) > pose.force * (.45 + freeze * .26)) continue;
      const [source, dx, dy] = snowSources[part];
      const [releaseX, releaseY] = rigPoint(source, dx, dy, scale, pose);
      const [previousX] = rigPoint(source, dx, dy, scale, previous);
      const momentum = Math.max(-30, Math.min(30, (releaseX - previousX) * 8));
      const offset = (noise(seed + 1) - .5) * scale * .09;
      const startY = y + releaseY;
      const floor = y + scale * (.34 + noise(seed + 2) * .033);
      const gravity = scale * .57;
      const impact = Math.sqrt(Math.max(0, (floor - startY) / gravity));
      const bounceAge = Math.max(0, age - impact);
      const fall = age < impact ? startY + gravity * age ** 2 :
        floor - Math.max(0, bounceAge * (.12 - bounceAge * .46)) * scale;
      const drift = age * ((noise(seed + 3) - .64) * scale * .23 + momentum) + Math.sin(age * 8 + seed) * age * 4;
      const alpha = Math.min(1, age * 23) * Math.max(0, 1 - bounceAge * 2.6) * (.37 + noise(seed + 4) * .48);
      if (alpha <= 0) continue;
      const radius = Math.max(.7, scale * (.0016 + noise(seed + 5) ** 2 * .009));
      ctx.fillStyle = `rgba(229,246,255,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(x + releaseX + offset + drift, fall, radius, radius * .68, seed + age * 5, 0, Math.PI * 2);
      ctx.fill();
      if (radius > 2.5 && age < impact) {
        ctx.fillStyle = `rgba(147,196,228,${alpha * .66})`;
        ctx.beginPath();
        ctx.ellipse(x + releaseX + offset + drift, fall + radius * .38,
          radius * .68, radius * .38, seed + age * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

export function winterLight(time: number, kick: number) {
  // Each chorus raises the storm. It recedes for the bridge and the last voice.
  const first = fade(37, 46, time) * (1 - fade(70, 77, time));
  const second = fade(99, 108, time) * (1 - fade(131, 137, time));
  const final = fade(151, 163, time) * (1 - fade(187, 196, time));
  const wind = Math.max(first * .57, second * .72, final);
  return { storm: .13 + wind * .66 + kick * .23, freeze: freezeAt(time) };
}

function crystal(ctx: CanvasRenderingContext2D, length: number, depth: number, seed: number) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -length);
  ctx.stroke();
  if (depth === 0) return;
  for (let branch = 1; branch <= 4; branch++) {
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(0, -length * (branch * .19));
      ctx.rotate(side * (.6 + noise(seed + branch * side) * .4));
      crystal(ctx, length * (.37 - branch * .045), depth - 1, seed + side * branch);
      ctx.restore();
    }
  }
}

export function prepareFrost(width: number, height: number) {
  const layer = document.createElement('canvas');
  layer.width = Math.ceil(width);
  layer.height = Math.ceil(height);
  const ctx = layer.getContext('2d');
  if (!ctx) return layer;
  const scale = Math.min(width, height);
  for (let i = 0; i < 60; i++) {
    const edge = i % 4;
    const along = noise(i + 19);
    const inset = noise(i + 34) * scale * .033;
    const x = edge === 0 ? inset : edge === 1 ? width - inset : width * along;
    const y = edge === 2 ? inset : edge === 3 ? height - inset : height * along;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate([Math.PI / 2, -Math.PI / 2, Math.PI, 0][edge] + (noise(i) - .5) * 2.3);
    ctx.lineWidth = .45 + noise(i + 4) * .9;
    ctx.strokeStyle = `rgba(202,231,255,${.09 + noise(i + 38) * .38})`;
    crystal(ctx, scale * (.018 + .16 * noise(4 * i + 1) ** 2), 2, i);
    ctx.restore();
  }
  return layer;
}

export function paintWinter(
  ctx: CanvasRenderingContext2D,
  frost: HTMLCanvasElement,
  time: number,
  storm: number,
  freeze: number,
  breath: number,
  mouthX: number,
  mouthY: number,
  characterWidth: number,
  still: boolean,
  moving: boolean,
) {
  const { width, height } = frost;
  ctx.clearRect(0, 0, width, height);
  if (!still) {
    for (let i = 0; i < 152; i++) {
      const depth = .18 + noise(i + 200) ** 2;
      const wind = time * (25 + 87 * depth) + Math.sin(time * .6 + i) * 22 * depth;
      const x = fraction(noise(i) - wind / width) * width;
      const y = fraction(noise(i + 400) + time * (9 + 34 * depth) / height) * height;
      const length = depth * (2 + 11 * storm);
      ctx.strokeStyle = `rgba(225,242,255,${depth * (.22 + storm * .27)})`;
      ctx.lineWidth = .55 + depth * 1.45;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length, y - length * .33);
      ctx.stroke();
    }
  }
  const pose = winterRigAt(time, moving);
  const [breathX, breathY] = rigPoint('head', 0, 0, characterWidth, pose);
  if (breath > .025 && !still) {
    for (let i = 0; i < 8; i++) {
      const age = fraction(time * 1.2 + i / 8);
      const radius = (4 + age * 29) * Math.min(1.4, .6 + characterWidth / 800);
      const x = mouthX + breathX - age * (36 + characterWidth * (.12 + storm * .11));
      const y = mouthY + breathY + age * 7 - age ** 2 * 31 + Math.sin(i * 3 + time * 1.7) * age * 12;
      const mist = ctx.createRadialGradient(x, y, 0, x, y, radius);
      mist.addColorStop(0, `rgba(214,238,255,${breath * Math.sin(age * Math.PI) * .40})`);
      mist.addColorStop(1, 'rgba(214,238,255,0)');
      ctx.fillStyle = mist;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  }
  if (!still) shedSnow(ctx, time, mouthX, mouthY, characterWidth, freeze);

  const crackGrowth = fade(.32, .93, freeze);
  if (crackGrowth > 0) {
    ctx.save();
    ctx.translate(mouthX, mouthY);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const [index, points] of cracks.entries()) {
      const extent = clamp(crackGrowth * 1.26 - index * .08) * (points.length - 1);
      ctx.beginPath();
      ctx.moveTo(points[0][0] * characterWidth, points[0][1] * characterWidth);
      for (let i = 0; i < extent; i++) {
        const [x, y] = points[i];
        const [nextX, nextY] = points[i + 1];
        const width = Math.min(1, extent - i);
        ctx.lineTo((x + (nextX - x) * width) * characterWidth, (y + (nextY - y) * width) * characterWidth);
      }
      ctx.strokeStyle = `rgba(185,222,252,${crackGrowth * .36})`;
      ctx.lineWidth = Math.max(.65, characterWidth * .0026);
      ctx.shadowColor = '#c2e8ff';
      ctx.shadowBlur = 3 + storm * 5;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Ice gathers along the existing whiskers, brows, and shoulder frost.
  for (const [index, [part, dx, dy, angle]] of icePoints.entries()) {
    const growth = Math.max(0, Math.min(1, (freeze - index * .065 - .17) * 2.6));
    if (growth === 0) continue;
    ctx.save();
    const [x, y] = rigPoint(part, dx, dy, characterWidth, pose);
    ctx.translate(mouthX + x, mouthY + y);
    ctx.rotate(angle);
    ctx.lineWidth = Math.max(.45, characterWidth * .0015);
    ctx.strokeStyle = `rgba(219,245,255,${growth * .48})`;
    crystal(ctx, characterWidth * .041 * growth, 1, index + 7);
    ctx.restore();
  }
  ctx.globalAlpha = .10 + freeze * .84;
  ctx.drawImage(frost, 0, 0);
  ctx.globalAlpha = 1;
}
