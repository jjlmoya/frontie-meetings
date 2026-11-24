export const tailCopterPlate = 'actions/tail-copter-roofs.webp';
export const tailCopterCel = 'actions/tail-copter-frontie.webp';

type Context = CanvasRenderingContext2D;
const duration = 3.19;
const smooth = (progress: number) => {
  const p = Math.min(1, Math.max(0, progress));
  return p * p * (3 - 2 * p);
};

// The rotor spins in a shallow plane and stays attached to the painted spindle.
function rotor(ctx: Context, local: number, energy: number) {
  const phase = 6 * local + 14.7 * local ** 1.32;
  ctx.save();
  ctx.scale(.67, .19);
  ctx.strokeStyle = '#ffe983';
  ctx.globalAlpha = .21 + energy * .23;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 43, 39, 0, phase - 1.8, phase + 1.4);
  ctx.ellipse(0, 0, 43, 39, 0, phase + 2.1, phase + 3.7);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.rotate(phase);
  ctx.fillStyle = '#f5d268';
  ctx.strokeStyle = '#62422d';
  ctx.lineWidth = 2.3;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.quadraticCurveTo(28, -13, 43, -4);
    ctx.quadraticCurveTo(34, 8, 0, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.rotate(Math.PI);
  }
  ctx.restore();
}

export function drawTailCopter(
  ctx: Context,
  local: number,
  energy: number,
  roofs?: HTMLImageElement,
  cat?: HTMLImageElement,
) {
  if (!roofs?.complete || !roofs.naturalWidth || !cat?.complete || !cat.naturalWidth) return;
  ctx.save();
  ctx.scale(4 / 3, 4 / 3);
  const lift = smooth((local - .26) / 2.2);
  const flyAway = smooth((local - 2.48) / (duration - 2.48));
  const wobble = Math.sin(local * 11) * Math.exp(-local * .48);
  ctx.drawImage(roofs, -38 - 22 * lift, -32 + 30 * lift, 1050, 590);

  const width = 436;
  const height = width * cat.naturalHeight / cat.naturalWidth;
  ctx.translate(427 + lift * 105 + flyAway * 62, 278 - lift * 173 - flyAway * 94);
  ctx.rotate(-.13 * lift + wobble * (.063 + energy * .012));
  rotor(ctx, local, energy);
  ctx.drawImage(cat, -width * (487 / 960), -height * (15 / 688), width, height);
  ctx.restore();
}
