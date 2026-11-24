export const mentorWinkPlate = 'actions/mentor-wink.webp';

const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function drawMentorPrism(
  ctx: CanvasRenderingContext2D,
  local: number,
  energy: number,
  camera?: { x: number; y: number; scale: number },
  logo?: HTMLImageElement,
  wink?: HTMLImageElement,
  art?: HTMLImageElement,
) {
  ctx.save();
  if (camera) {
    ctx.translate(640 + camera.x * 12.8, 360 + camera.y * 7.2);
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-640, -360);
  }
  ctx.scale(4 / 3, 4 / 3);

  const close = smooth((local - 1.12) / .085) * (1 - smooth((local - 1.35) / .12));
  if (close > 0 && wink?.complete && wink.naturalWidth) {
    ctx.filter = 'saturate(1.07) contrast(1.04)';
    ctx.globalAlpha = close;
    ctx.drawImage(wink, 496, 112);
    ctx.filter = 'none';
  }

  if (logo?.complete && logo.naturalWidth) {
    const pulse = Math.exp(-Math.abs(local - 1.21) * 9);
    const cx = 358;
    const cy = 184;
    const radius = 42;
    const halo = ctx.createRadialGradient(cx, cy, radius * .65, cx, cy, 72);
    halo.addColorStop(0, '#fff8cd');
    halo.addColorStop(.55, '#5bdbf07a');
    halo.addColorStop(1, '#32b8e700');
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = .52 + pulse * .26 + energy * .10;
    ctx.fillStyle = halo;
    ctx.fillRect(cx - 72, cy - 72, 144, 144);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();

    const glass = ctx.createRadialGradient(-12, -18, 0, 2, 4, radius + 5);
    glass.addColorStop(0, '#99f0f5');
    glass.addColorStop(.54, '#155b8a');
    glass.addColorStop(.87, '#072a4c');
    glass.addColorStop(1, '#78dcf4');
    ctx.fillStyle = glass;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.save();
    ctx.rotate(Math.sin(local * 2.15) * .065);
    const size = 70 + 1.5 * pulse;
    ctx.drawImage(logo, -size / 2, -size / 2, size, size);
    ctx.restore();

    // Small reflections stay on the rim so the real emblem reads inside the glass.
    ctx.strokeStyle = '#fff4cb';
    ctx.globalAlpha = .77 + pulse * .23;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 2, 3.45, 5.48);
    ctx.stroke();
    ctx.strokeStyle = '#a9f5ff';
    ctx.globalAlpha = .55;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 2, .06, 1.87);
    ctx.stroke();
    ctx.restore();

    if (art?.complete && art.naturalWidth) {
      ctx.save();
      // Trace the two fingertips from the original hand. The sphere sits behind them.
      ctx.beginPath();
      ctx.moveTo(279, 187);
      ctx.bezierCurveTo(282, 176, 281, 169, 286, 165);
      ctx.bezierCurveTo(295, 159, 301, 158, 307, 155);
      ctx.bezierCurveTo(314, 153, 322, 157, 330, 156);
      ctx.bezierCurveTo(338, 154, 338, 160, 335, 166);
      ctx.bezierCurveTo(332, 172, 323, 175, 313, 172);
      ctx.bezierCurveTo(309, 177, 305, 179, 301, 180);
      ctx.lineTo(299, 191);
      ctx.closePath();
      ctx.moveTo(337, 244);
      ctx.bezierCurveTo(339, 232, 343, 226, 350, 222);
      ctx.bezierCurveTo(361, 218, 367, 214, 371, 216);
      ctx.bezierCurveTo(380, 219, 377, 228, 372, 231);
      ctx.quadraticCurveTo(363, 237, 361, 244);
      ctx.closePath();
      ctx.clip();
      ctx.globalAlpha = 1;
      ctx.filter = 'saturate(1.07) contrast(1.04)';
      ctx.drawImage(art, 0, 0, 960, 540);
      ctx.restore();
    }
  }
  ctx.restore();
}
