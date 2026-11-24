type Context = CanvasRenderingContext2D;

const turn = Math.PI * 2;
const unit = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = unit(value);
  return t * t * (3 - 2 * t);
};

const clones = [
  { at: .06, x: 26, y: 32, size: 270, smokeX: 155, smokeY: 178, handX: 268, handY: 121 },
  { at: .22, x: 615, y: -2, size: 235, smokeX: 742, smokeY: 126, handX: 632, handY: 74 },
  { at: .38, x: 642, y: 184, size: 367, smokeX: 828, smokeY: 300, handX: 662, handY: 202 },
];
const atlasColumns = clones.length + 1;

function drawSmoke(ctx: Context, x: number, y: number, age: number, size: number) {
  if (age < 0 || age >= .64) return;
  const spread = 1 - (1 - unit(age / .64)) ** 2;
  ctx.save();
  ctx.globalAlpha = smooth(age / .055) * (1 - smooth((age - .12) / .52));
  ctx.translate(x, y);

  // Outlined smoke cels open from the center and break into drifting puffs.
  for (let i = 0; i < 12; i++) {
    const angle = i * 2.399;
    const distance = size * (.20 + .075 * i) * (.28 + spread);
    const radius = size * (.5 + .045 * (i % 5)) * (1 - .65 * spread);
    const px = Math.cos(angle) * distance;
    const py = Math.sin(angle) * distance * .58 - spread * size * .45;
    ctx.fillStyle = i % 4 === 0 ? '#a5bada' : i % 3 === 0 ? '#c6d5eb' : '#edf4fc';
    ctx.strokeStyle = '#7391b5';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(px, py, radius, radius * (.72 + .08 * (i % 4)), angle * .5, 0, turn);
    ctx.fill();
    if (i % 3 === 0) ctx.stroke();
  }
  ctx.restore();
}

function drawConjuring(ctx: Context, local: number, sprite?: HTMLImageElement) {
  for (const [index, clone] of clones.entries()) {
    const age = local - clone.at;
    if (age >= .075 && sprite?.complete && sprite.naturalWidth) {
      const settle = 1 - Math.exp(-(age - .075) * 21);
      const { x, y, size } = clone;
      ctx.filter = 'saturate(1.07) contrast(1.04)';
      const cell = sprite.naturalWidth / atlasColumns;
      ctx.drawImage(sprite, index * cell, 0, cell, sprite.naturalHeight, x, y + 11 * (1 - settle), size, size);
      ctx.filter = 'none';
    }
    drawSmoke(ctx, clone.smokeX, clone.smokeY, age, 73 + index * 8);
  }
}

function drawChakraSphere(ctx: Context, x: number, y: number, radius: number, local: number, atlas?: HTMLImageElement) {
  if (!atlas?.complete || !atlas.naturalWidth) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(radius, radius);
  ctx.rotate(-local * 4.6 - local * local * 1.1);

  const cell = atlas.naturalWidth / atlasColumns;
  ctx.drawImage(atlas, clones.length * cell, 0, cell, atlas.naturalHeight, -1.08, -1.08, 2.16, 2.16);
  ctx.rotate(local * 9.3);
  ctx.shadowColor = '#2eafff';
  ctx.shadowBlur = 4;

  // Tapered ribbons roll around different axes. The flat side of each ellipse
  // turns into its bright face, giving the shell a visible front and back.
  for (let i = 0; i < 5; i++) {
    const phase = local * (i % 2 ? -10.5 : 8.8) + i * 1.73;
    const depth = Math.sin(phase * .61 + i);
    const tilt = i * 2.399 + Math.sin(phase * .36) * .42;
    const span = .60 + i * .13;
    const flatten = .15 + Math.abs(depth) * .78;
    const width = (.027 + (i % 4) * .015) * (.72 + Math.abs(depth) * .38);
    ctx.save();
    ctx.rotate(tilt);
    ctx.translate(Math.sin(phase * .75) * .12, Math.cos(i * 2.1) * .11);
    ctx.fillStyle = ['#efffff', '#c4faff', '#76ecff'][i % 3];
    ctx.globalAlpha *= Math.max(0, .30 + depth * .46);
    ctx.beginPath();
    for (let point = 0; point <= 28; point++) {
      const angle = phase + point / 28 * 4.08;
      ctx.lineTo(Math.cos(angle) * span, Math.sin(angle) * span * flatten);
    }
    for (let point = 28; point >= 0; point--) {
      const along = point / 28;
      const angle = phase + along * 4.08;
      const inner = span - Math.sin(along * Math.PI) * width;
      ctx.lineTo(Math.cos(angle) * inner, Math.sin(angle) * inner * flatten);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

export function drawRasengan(ctx: Context, local: number, band: number, sprite?: HTMLImageElement) {
  ctx.save();
  drawConjuring(ctx, local, sprite);
  const chargeTime = local - .30;
  if (chargeTime <= 0) {
    ctx.restore();
    return;
  }

  const gather = smooth(chargeTime / 1.37);
  const release = smooth((local - 1.90) / .34);
  const radius = 8 + 87 * gather + 32 * release ** 2;
  const x = 480;
  const y = 229;

  ctx.globalCompositeOperation = 'screen';
  const glow = ctx.createRadialGradient(x, y, radius * .48, x, y, radius * 2.36);
  glow.addColorStop(0, '#77fbff');
  glow.addColorStop(.36, '#1bbfff71');
  glow.addColorStop(1, '#0869f800');
  ctx.globalAlpha = (.51 + .23 * band) * smooth(chargeTime / .35);
  ctx.fillStyle = glow;
  ctx.fillRect(x - radius * 2.4, y - radius * 2.4, radius * 4.8, radius * 4.8);

  for (const [i, clone] of clones.entries()) {
    const feed = smooth((local - clone.at - .28) / .28) * (1 - release);
    if (!feed) continue;
    const side = i === 0 ? -1 : 1;
    const stream = ctx.createLinearGradient(clone.handX, clone.handY, x, y);
    stream.addColorStop(0, '#87eeff12');
    stream.addColorStop(.57, '#38cfff');
    stream.addColorStop(1, '#f0ffff');
    ctx.strokeStyle = stream;
    ctx.globalAlpha = feed * .74;
    ctx.lineWidth = (1.6 + gather * 2.7) * feed;
    const drift = Math.sin(local * 25 + i * 2) * 7;
    ctx.beginPath();
    ctx.moveTo(clone.handX, clone.handY);
    ctx.bezierCurveTo(clone.handX + side * -45, clone.handY + drift,
      x + side * radius * 1.5, y + (i - 1) * radius, x, y);
    ctx.stroke();
  }

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = smooth(chargeTime / .19);
  drawChakraSphere(ctx, x, y, radius, local, sprite);

  ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const phase = (local * (2.2 + i % 3 * .24) + i * .618) % 1;
    const angle = i * 2.399 + phase * .88;
    const reach = radius * (1.02 + phase * (.31 + release * .65));
    ctx.strokeStyle = i % 3 === 0 ? '#f3ffff' : '#60ddff';
    ctx.globalAlpha = Math.sin(phase * Math.PI) * (.24 + gather * .7);
    ctx.lineWidth = (.8 + i % 4 * .5) * (1 + release);
    ctx.beginPath();
    ctx.arc(x, y, reach, angle, angle + .025 + (1 - phase) * .14);
    ctx.stroke();
  }
  ctx.restore();
}
