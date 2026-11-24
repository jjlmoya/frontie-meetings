export const railLookPlate = 'actions/rail-look.webp';

export function drawRailLook(
  ctx: CanvasRenderingContext2D,
  local: number,
  camera?: { x: number; y: number; scale: number },
  portrait?: HTMLImageElement,
) {
  if (local < .24 || !portrait?.complete || !portrait.naturalWidth) return;
  const turn = Math.min(1, (local - .24) / .09);
  ctx.save();
  if (camera) {
    ctx.translate(640 + camera.x * 12.8, 360 + camera.y * 7.2);
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-640, -360);
  }
  ctx.scale(4 / 3, 4 / 3);
  ctx.filter = 'saturate(1.07) contrast(1.04)';
  ctx.globalAlpha = turn * turn * (3 - 2 * turn);
  ctx.drawImage(portrait, 393, 49);
  ctx.restore();
}
