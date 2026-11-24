export const closedMonitorShot = 'actions/monitor-closed.webp';

const smooth = (value: number) => {
  const p = Math.min(1, Math.max(0, value));
  return p * p * (3 - 2 * p);
};

export function drawOpeningEyes(
  ctx: CanvasRenderingContext2D,
  art: HTMLImageElement,
  time: number,
  camera?: { x: number; y: number; scale: number },
) {
  if (!art.complete || !art.naturalWidth || time < .64) return;

  ctx.save();
  if (camera) {
    ctx.translate(640 + camera.x * 12.8, 360 + camera.y * 7.2);
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-640, -360);
  }
  const height = 960 * art.naturalHeight / art.naturalWidth;
  ctx.scale(4 / 3, 4 / 3);
  // Match the cover crop and 40% vertical anchor of the opening image.
  ctx.translate(0, (540 - height) * .4);
  ctx.filter = 'saturate(1.07) contrast(1.04)';

  const open = .57 * smooth((time - .64) / .56) + .43 * smooth((time - 1.20) / .12);
  ctx.save();
  if (open < 1) {
    ctx.beginPath();
    ctx.moveTo(408, 325);
    ctx.bezierCurveTo(435, 370 - 174 * open, 497, 389 - 161 * open, 534, 402);
    ctx.bezierCurveTo(497, 389 + 65 * open, 435, 370 + 42 * open, 408, 325);
    ctx.closePath();

    ctx.moveTo(539, 432);
    ctx.bezierCurveTo(550 - 12 * open, 416 - 19 * open, 577 - 20 * open, 377 - 14 * open, 597, 336);
    ctx.bezierCurveTo(577 + 18 * open, 377 + 22 * open, 550 + 15 * open, 416 + 23 * open, 539, 432);
    ctx.closePath();
    ctx.clip();
  }
  ctx.drawImage(art, 0, 0, 960, height);
  ctx.restore();

  if (time >= 1.32) {
    // The red monitor briefly catches the original highlight in each iris.
    ctx.filter = 'none';
    ctx.beginPath();
    ctx.moveTo(499, 293);
    ctx.bezierCurveTo(526, 312, 535, 356, 519, 401);
    ctx.bezierCurveTo(480, 418, 457, 381, 483, 328);
    ctx.closePath();
    ctx.moveTo(549, 430);
    ctx.bezierCurveTo(539, 425, 557, 385, 582, 360);
    ctx.bezierCurveTo(576, 396, 563, 421, 549, 430);
    ctx.closePath();
    ctx.clip();
    const flash = ctx.createRadialGradient(514, 331, 2, 514, 337, 77);
    flash.addColorStop(0, '#fff4c1');
    flash.addColorStop(.17, '#ff9a63d9');
    flash.addColorStop(.59, '#f93c4544');
    flash.addColorStop(1, '#f63c3c00');
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = Math.exp(-(time - 1.32) * 12) * .70;
    ctx.fillStyle = flash;
    ctx.fillRect(465, 275, 127, 155);
  }
  ctx.restore();
}
