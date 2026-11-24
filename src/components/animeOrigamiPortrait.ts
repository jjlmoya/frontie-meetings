export const origamiExpressions = 'actions/origami-expressions.webp';

function smooth(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

export function drawOrigamiPortrait(
  ctx: CanvasRenderingContext2D,
  local: number,
  camera?: { x: number; y: number; scale: number },
  expressions?: HTMLImageElement,
) {
  if (local < .47 || !expressions?.complete || !expressions.naturalWidth) return;

  ctx.save();
  if (camera) {
    ctx.translate(640 + camera.x * 12.8, 360 + camera.y * 7.2);
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-640, -360);
  }
  ctx.scale(4 / 3, 4 / 3);
  ctx.translate(0, (540 - 960 * 500 / 756) * .34);
  ctx.filter = 'saturate(1.07) contrast(1.04)';

  ctx.globalAlpha = smooth((local - .47) / .13);
  ctx.drawImage(expressions, 0, 0, 260, 130, 286, 133, 260, 130);
  ctx.globalAlpha = smooth((local - .59) / .16);
  ctx.drawImage(expressions, 0, 130, 260, 75, 286, 263, 260, 75);
  ctx.restore();
}
