import { drawTeamPrank } from './animeTeamPrank';
import type { PrankLayers } from './animeTeamPrank';
import { drawSpiritBomb } from './animeSpiritBomb';
import { drawAnimeCutAction } from './animeCutActions';
import { drawAnimeLateBeat } from './animeLateBeats';
import { drawOpeningEyes } from './animeOpeningEyes';
import { drawKiraWriting } from './animeCharacterActing';
import { drawAnimeDrawnAction } from './animeDrawnActions';
import type { AnimeEffect } from '@/data/animeOpening';

const TAU = Math.PI * 2;
const random = (index: number) => ((Math.sin(index * 78.233 + 24.19) * 43758.5453) % 1 + 1) % 1;

function drawGearColorBurst(ctx: CanvasRenderingContext2D, local: number) {
  if (local >= 0.72) return;
  const x = 421;
  const y = 225;
  const phase = local / 0.72;
  const force = 1 - phase;
  const palette = ['#ff54aa', '#ffbc61', '#fff191', '#83fae2', '#4adcff', '#a27bff'];
  ctx.save();
  ctx.translate(x, y);
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 290 + phase * 420);
  core.addColorStop(0, '#fff5db');
  core.addColorStop(0.18, '#ffca98');
  core.addColorStop(0.57, '#ff66a884');
  core.addColorStop(1, '#9d5aff00');
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = force ** 2 * 0.88;
  ctx.fillStyle = core;
  ctx.fillRect(-x, -y, 1280, 720);

  for (let i = 0; i < 37; i++) {
    const angle = (i + random(i + 138)) / 37 * TAU;
    const reach = 200 + random(i + 39) * 690;
    const inner = 27 + phase * reach;
    const outer = inner + (45 + random(i + 65) * 240) * force;
    const edge = (0.013 + random(i + 175) * 0.052) * force;
    ctx.fillStyle = palette[i % palette.length];
    ctx.globalAlpha = force * (0.45 + random(i + 47) * 0.46);
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle - edge) * outer, Math.sin(angle - edge) * outer);
    ctx.lineTo(Math.cos(angle + edge) * outer, Math.sin(angle + edge) * outer);
    ctx.closePath();
    ctx.fill();
  }

  for (let i = 0; i < palette.length; i++) {
    const radius = 38 + phase * 710 + i * (10 + phase * 14);
    ctx.globalAlpha = force * (0.61 - i * 0.061);
    ctx.lineWidth = 2 + force * 8;
    ctx.strokeStyle = palette[i];
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 0.8, -0.35, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCardHandoff(ctx: CanvasRenderingContext2D, elapsed: number) {
  const fromCard = elapsed < 0;
  const phase = fromCard ? 1 + elapsed / 1.15 : elapsed / 0.38;
  if (phase < 0 || phase >= 1) return;
  const travel = fromCard ? phase * phase : 1 + phase;
  const x = 1060 - 420 * Math.min(1, travel);
  const y = 138 + 215 * Math.min(1, travel);
  const size = 0.53 + 5.5 * travel ** 2;
  const visibility = fromCard ? Math.min(1, phase * 10) : Math.max(0, 1 - phase * 1.2);

  ctx.save();
  const glow = ctx.createRadialGradient(x, y, 0, x, y, 110 * size + 55);
  glow.addColorStop(0, '#fff6c4ed');
  glow.addColorStop(0.38, '#ffce67c4');
  glow.addColorStop(1, '#ffae3700');
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = visibility * 0.9;
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1280, 720);
  ctx.globalCompositeOperation = 'source-over';

  ctx.translate(x, y);
  ctx.rotate(-0.34 + travel * 0.62);
  ctx.scale(size * (0.77 + Math.cos(travel * 5.4) ** 2 * 0.23), size);
  ctx.globalAlpha = visibility;
  const enamel = ctx.createLinearGradient(-62, -97, 62, 97);
  enamel.addColorStop(0, '#de6660');
  enamel.addColorStop(0.46, '#a7374d');
  enamel.addColorStop(1, '#4f203b');
  ctx.shadowBlur = 22;
  ctx.shadowColor = '#ffbc54';
  ctx.fillStyle = enamel;
  ctx.strokeStyle = '#fff1bd';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-61, -94, 122, 188, 10);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#efba70';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(-53, -86, 106, 172, 7);
  ctx.ellipse(0, 0, 40, 64, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = '#f8d08c';
  ctx.fillStyle = '#fff0ab';
  ctx.beginPath();
  for (let i = 0; i <= 16; i++) {
    const angle = i / 16 * TAU - Math.PI / 2;
    const reach = i % 2 === 0 ? 1 : 0.24;
    const sx = Math.cos(angle) * 29 * reach;
    const sy = Math.sin(angle) * 48 * reach;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

type Frame = {
  effect: AnimeEffect;
  image: string;
  time: number;
  local: number;
  remaining: number;
  progress: number;
  energy: number;
  camera?: { x: number; y: number; scale: number };
  art?: HTMLImageElement;
  kiraPlate?: HTMLImageElement;
  monitorOpen?: HTMLImageElement;
  lateBeatPlate?: HTMLImageElement;
  cutActionPlate?: HTMLImageElement;
  katanaArt?: HTMLImageElement;
  prankLayers?: PrankLayers;
};

export function drawAnimeOpeningEffects(ctx: CanvasRenderingContext2D, { effect, image, time, local, remaining, progress, energy, camera, art, kiraPlate, monitorOpen, lateBeatPlate, cutActionPlate, katanaArt, prankLayers }: Frame) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.scale(width / 1280, height / 720);

  if (image === 'sailor-moon' || image === 'rain-blade' || image === 'combat-land' || image === 'cable-touch') {
    drawAnimeDrawnAction(ctx, image, local, energy, camera, art);
    ctx.restore();
    return;
  }

  if (image === 'team-prank') {
    drawTeamPrank(ctx, local, camera, prankLayers);
    ctx.restore();
    return;
  }

  if (image === 'spirit-bomb') {
    drawSpiritBomb(ctx, local, progress, energy, camera);
    ctx.restore();
    return;
  }

  if (drawAnimeCutAction(ctx, image, local, energy, camera, art, cutActionPlate, katanaArt)) {
    ctx.restore();
    return;
  }

  if (drawAnimeLateBeat(ctx, image, local, energy, camera, art, lateBeatPlate)) {
    ctx.restore();
    return;
  }

  if (image === 'monitor' && monitorOpen) drawOpeningEyes(ctx, monitorOpen, local, camera);
  if (image === 'kira') drawKiraWriting(ctx, local, art, kiraPlate, camera);

  if (effect === 'shoujo') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 34; i++) {
      const seed = random(i + 80);
      const phase = (random(i) + local * (0.24 + seed * 0.25)) % 1;
      const x = (random(i + 170) * 1410 + local * (52 + seed * 166)) % 1410 - 65;
      const y = phase * 735 - 22;
      const size = (1.4 + seed * 6.5) * (1 + energy * 0.5);
      ctx.globalAlpha = Math.sin(Math.PI * phase) * (0.32 + seed * 0.43);
      ctx.fillStyle = i % 3 === 0 ? '#fff9e4' : '#ff97b1';
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.5, local * (1.6 + seed) + i, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  if (effect === 'rain' || effect === 'still') {
    ctx.strokeStyle = effect === 'rain' ? '#8cd6ff' : '#8a9cb9';
    for (let i = 0; i < 90; i++) {
      const rate = 0.65 + random(i + 150);
      const speed = effect === 'still' ? 0.34 : 1.35;
      const x = (random(i + 60) * 1440 + time * speed * rate * 170) % 1440 - 80;
      const y = (random(i) * 800 + time * speed * rate * 500) % 800 - 40;
      const length = (15 + random(i + 20) * 26) * (effect === 'still' ? 0.62 : 1);
      ctx.globalAlpha = 0.08 + random(i + 420) * 0.24;
      ctx.lineWidth = 0.75 + rate * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length * 0.31, y + length);
      ctx.stroke();
    }
  }

  if (effect === 'run' || effect === 'release') {
    const angle = effect === 'run' ? -0.12 : 0;
    const cx = 640;
    const cy = 340;
    for (let i = 0; i < 42; i++) {
      const direction = i / 42 * TAU + angle;
      const phase = (random(i) + time * (0.9 + random(i + 21) * 0.54)) % 1;
      const from = 210 + phase * 600;
      const to = from + 28 + phase * (78 + energy * 95);
      ctx.globalAlpha = Math.sin(Math.PI * phase) * (0.16 + energy * 0.45);
      ctx.strokeStyle = i % 7 === 0 ? '#ff61c0' : '#b7fbff';
      ctx.lineWidth = i % 8 === 0 ? 2.6 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(direction) * from, cy + Math.sin(direction) * from * 0.56);
      ctx.lineTo(cx + Math.cos(direction) * to, cy + Math.sin(direction) * to * 0.56);
      ctx.stroke();
    }
  }

  if (effect === 'slash') {
    const start = Math.min(1, local * 5);
    const opacity = Math.max(0, 1 - local * 1.38);
    ctx.translate(650, 360);
    ctx.rotate(-0.47);
    ctx.globalAlpha = opacity;
    ctx.shadowBlur = 29;
    ctx.shadowColor = '#00deff';
    ctx.strokeStyle = '#77eaff';
    ctx.lineWidth = 18 * opacity + 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 870, 184, 0, 0.66, 0.66 + start * 2.57);
    ctx.stroke();
    ctx.lineWidth = 3.6;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  }

  if (effect === 'manga') {
    ctx.save();
    // Sparse ink scratches bring the still manga pose into the moving edit.
    ctx.lineCap = 'round';
    for (let i = 0; i < 24; i++) {
      const life = (local * 0.5 + random(i + 51)) % 1;
      const spread = 75 + random(i) * 405;
      const x = (i % 2 === 0 ? 0 : 1280) + (i % 2 === 0 ? spread : -spread);
      const y = 36 + random(i + 80) * 635 + life * 64;
      ctx.globalAlpha = 0.1 + (1 - life) * 0.17;
      ctx.strokeStyle = i % 9 === 0 ? '#891006' : '#252025';
      ctx.lineWidth = 0.8 + random(i + 40) * 1.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2.7 - life * 7, y + 5.3 + life * 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (effect === 'kira') {
    // The last stroke lands at 52.74, just before the cut to Nimbus.
    const stop = 2.11;
    const surge = Math.max(0, 1 - Math.abs(local - stop) * 16);
    ctx.save();
    if (camera) {
      ctx.translate(640 + camera.x * 12.8, 360 + camera.y * 7.2);
      ctx.scale(camera.scale, camera.scale);
      ctx.translate(-640, -360);
    }
    const monitor = ctx.createLinearGradient(810, 0, 1240, 0);
    monitor.addColorStop(0, '#130d0d00');
    monitor.addColorStop(0.12, '#15120f');
    monitor.addColorStop(0.94, '#0e130e');
    monitor.addColorStop(1, '#0e130e00');
    ctx.fillStyle = monitor;
    ctx.fillRect(810, 220, 430, 110);
    ctx.globalAlpha = 0.55 + surge * 0.2;
    ctx.strokeStyle = local < stop ? '#a5f4ad' : '#fa6470';
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 11;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let x = 0; x <= 362; x += 2) {
      const point = (x - local * 124 + 528) % 176;
      const pulse = point > 32 && point < 44 ? Math.min(point - 32, 44 - point) * 6.2
        : point >= 44 && point < 54 ? -Math.min(point - 44, 54 - point) * 1.8 : 0;
      const y = 284 - (local < stop ? pulse : 0);
      if (x === 0) ctx.moveTo(855, y);
      else ctx.lineTo(855 + x, y);
    }
    ctx.stroke();
    if (surge > 0) {
      const light = ctx.createRadialGradient(920, 218, 0, 920, 218, 465);
      light.addColorStop(0, '#fb464b');
      light.addColorStop(1, '#fb464b00');
      ctx.globalAlpha = surge * 0.2;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, 1280, 720);
    }
    ctx.restore();
  }

  if (effect === 'orb' || effect === 'cables') {
    const radius = (88 + progress * 115) * (1 + energy * 0.26);
    const cx = effect === 'orb' ? 670 : 570;
    const cy = effect === 'orb' ? 189 : 335;
    const color = effect === 'orb' ? '#66dfff' : '#ed70ce';
    for (let i = 0; i < 48; i++) {
      const phase = (random(i) + local * (0.3 + random(i + 4) * 0.45)) % 1;
      const angle = random(i + 38) * TAU + time * 0.93;
      const distance = radius + (1 - phase) ** 2 * (170 + random(i + 12) * 410);
      const x = cx + Math.cos(angle) * distance;
      const y = cy + Math.sin(angle) * distance * 0.7;
      ctx.globalAlpha = Math.sin(phase * Math.PI) * 0.6;
      ctx.strokeStyle = i % 4 === 0 ? '#fff' : color;
      ctx.lineWidth = 1.4 + random(i + 83) * 2.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - Math.cos(angle) * 14, y - Math.sin(angle) * 10);
      ctx.stroke();
    }
    if (effect === 'orb') {
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.28 + energy * 0.18;
        ctx.lineWidth = 2.3 + energy;
        ctx.strokeStyle = i === 0 ? '#fff' : '#74fff2';
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * (1.08 + i * .23), radius * (.54 + i * .1),
          -0.37 + i * .16, local * (2.8 + i * .7) + i * 2.3, local * (2.8 + i * .7) + i * 2.3 + 1.65);
        ctx.stroke();
      }
      ctx.globalAlpha = (0.27 + energy * 0.18) * Math.min(1, local * 2);
      const aura = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.7);
      aura.addColorStop(0, '#d2f9ff');
      aura.addColorStop(0.42, '#1dbaf47a');
      aura.addColorStop(1, '#1dbaf400');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = aura;
      ctx.fillRect(cx - radius * 1.7, cy - radius * 1.7, radius * 3.4, radius * 3.4);
    }
  }

  if (effect === 'train') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 24; i++) {
      const lane = random(i + 46);
      const x = (random(i) * 1700 + (1.1 + lane) * local * 1420) % 1700 - 210;
      const y = 128 + lane ** 2 * 560;
      ctx.globalAlpha = (0.08 + energy * 0.24) * (0.45 + lane);
      const tail = 18 + lane * 158;
      const light = ctx.createLinearGradient(x, y, x + tail, y);
      light.addColorStop(0, '#35f2ff00');
      light.addColorStop(0.85, i % 3 === 0 ? '#fe8de6d4' : '#b8fbffb8');
      light.addColorStop(1, '#f3fcff0f');
      ctx.fillStyle = light;
      ctx.fillRect(x, y, tail, 1.4 + lane * 3);
    }
    ctx.restore();
  }

  if (effect === 'splash') {
    ctx.save();
    ctx.strokeStyle = '#b2efff';
    for (let i = 0; i < 68; i++) {
      const flight = local * (0.86 + random(i + 260) * 0.57);
      const vx = (random(i + 31) - 0.48) * 760;
      const vy = -220 - random(i + 17) * 550;
      const x = 627 + (random(i + 20) - 0.5) * 190 + vx * flight;
      const y = 440 + vy * flight + 790 * (flight ** 2);
      ctx.globalAlpha = Math.max(0, 0.8 - flight * 0.72);
      ctx.lineCap = 'round';
      ctx.lineWidth = 1 + random(i + 1) * 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + vx * 0.026, y + (vy + 1580 * flight) * 0.026);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (effect === 'gate') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const x = image === 'cast-gate' ? 333 : 680;
    const y = 350;
    const opening = 74 + progress * 263;
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = (0.16 + Math.sin(local * 9 - i) * 0.09) * (1 - progress * 0.58);
      ctx.strokeStyle = i === 0 ? '#fff4aa' : '#56f1ef';
      ctx.lineWidth = 2.7;
      ctx.beginPath();
      ctx.ellipse(x, y, opening * (0.76 + i * 0.29), opening * (1.24 + i * 0.22),
        -0.08, local * 1.9 + i * 2.1, local * 1.9 + i * 2.1 + 4.1);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (effect === 'origami') {
    const x = 926 - progress * 845;
    const y = 290 - Math.sin(progress * Math.PI) * 155;
    const fold = 27 + Math.cos(local * 14) * 23;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.17 + progress * 0.44);
    ctx.globalAlpha = Math.min(1, progress * 5, (1 - progress) * 6);
    ctx.strokeStyle = '#fff4c2';
    ctx.fillStyle = '#ffb94c';
    ctx.shadowColor = '#ffb24d';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(-34, -2);
    ctx.lineTo(-12, -9);
    ctx.lineTo(6, -fold);
    ctx.lineTo(28, -12);
    ctx.lineTo(11, 0);
    ctx.lineTo(32, 25 + fold / 5);
    ctx.lineTo(-5, 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  if (effect === 'gear') {
    drawGearColorBurst(ctx, local);
    ctx.save();
    const spring = 1 + Math.sin(local * 15) * Math.exp(-local * 2.5) * 0.14;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const phase = (local * 1.1 + i * 0.22) % 1;
      const radius = (185 + phase * 360) * spring;
      ctx.globalAlpha = Math.sin(Math.PI * phase) * 0.58;
      ctx.strokeStyle = i % 2 ? '#86f7ff' : '#fff8ed';
      ctx.lineWidth = 2 + (1 - phase) * 10;
      ctx.beginPath();
      ctx.ellipse(620, 328, radius, radius * 0.51, -0.44,
        phase * TAU + i * 1.42, phase * TAU + i * 1.42 + 1.18);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (effect === 'release') {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 5; i++) {
      const reach = Math.min(1.15, progress * 1.4 + i * 0.09);
      const wave = Math.sin(local * 1.8 + i * 0.9) * 32;
      ctx.globalAlpha = Math.sin(Math.min(1, progress * 1.3) * Math.PI) * 0.56;
      ctx.strokeStyle = ['#62eeff', '#8787ff', '#f969e1', '#9df378', '#ffca6e'][i];
      ctx.lineWidth = 1.4 + i * 0.5;
      ctx.beginPath();
      ctx.moveTo(650, 200);
      ctx.bezierCurveTo(560 - i * 27, 264 + i * 38, 785 + wave, 402 - i * 15,
        650 + (i - 2) * 480 * reach, 260 + (i + 1) * 95 * reach);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (effect === 'spark' || effect === 'sun' || effect === 'monitor') {
    const rise = effect === 'sun' ? 1 : 2.6;
    for (let i = 0; i < 48; i++) {
      const phase = (random(i + 15) + local * (0.2 + random(i) * 0.5) * rise) % 1;
      const x = random(i + 21) * 1280 + Math.sin(local * 1.7 + i) * 23;
      const y = 750 - phase * 720;
      ctx.globalAlpha = Math.sin(phase * Math.PI) * (effect === 'monitor' ? 0.22 : 0.62);
      ctx.fillStyle = i % 4 === 0 ? '#fff7bd' : effect === 'monitor' ? '#ff447c' : '#ff9e59';
      const size = 0.7 + random(i + 36) * (effect === 'spark' ? 3.2 : 1.7);
      ctx.fillRect(x, y, size * 1.1, size);
    }
  }

  ctx.restore();
  if (image === 'cardcaptor-sakura' || image === 'sunrise-city') {
    ctx.save();
    ctx.scale(width / 1280, height / 720);
    drawCardHandoff(ctx, image === 'cardcaptor-sakura' ? -remaining : local);
    ctx.restore();
  }
}
