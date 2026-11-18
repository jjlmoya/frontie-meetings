import sharp from 'sharp';

const costumes = [
  { name: 'sporty', head: 'M0 0H1024V462H564L535 468H475L444 432H0Z',
    neck: [514, 432], hips: 498, floor: 1516,
    arms: [[402, 519, 301, 701, 'M0 453H415L449 490 403 548 378 610 392 649 349 744 255 1050H0Z'],
      [618, 523, 724, 709, 'M1024 448H632L573 501 570 575 607 654 598 690 686 749 775 1050H1024Z']],
    knees: [[330, 1102], [626, 1104]] },
  { name: 'baby', head: 'M0 0H1024V478H603L588 514 517 514 500 483H0Z',
    neck: [551, 490], hips: 512, floor: 1513,
    arms: [[407, 539, 307, 716, 'M0 496H409L430 546 404 624 416 668 353 762 272 1060H0Z'],
      [665, 561, 722, 752, 'M1024 501H673L642 576 656 650 621 704 687 794 759 1100H1024Z']],
    knees: [[300, 1102], [665, 1112]] },
  { name: 'scary', head: 'M0 0H1024V553H678L624 547 605 528 534 526 488 507 459 514 376 515 346 540H0Z',
    neck: [553, 520], hips: 492, floor: 1522,
    arms: [[363, 585, 285, 715, 'M0 534H366L401 575 409 625 388 649 355 729 248 1000H0Z'],
      [666, 604, 712, 737, 'M1024 542H657L635 585 638 637 618 697 663 793 765 1050H1024Z']],
    knees: [[358, 1083], [667, 1082]] },
  { name: 'ginger', head: 'M0 0H1024V556H704L678 497 643 469 597 452 556 452 549 419H507L490 448 440 450 383 462 329 548H0Z',
    neck: [531, 441], hips: 513, floor: 1511,
    arms: [[414, 480, 317, 634, 'M0 445H414L453 463 451 533 412 591 419 617 367 698 260 1000H0Z'],
      [648, 492, 717, 650, 'M1024 447H657L620 465 635 520 637 590 674 681 767 1000H1024Z']],
    knees: [[364, 1049], [649, 1047]] },
  { name: 'posh', head: 'M0 0H1024V501H682L652 477 607 476 567 458 562 435H509L495 458 448 471 414 460 377 469 347 502H0Z',
    neck: [536, 450], hips: 513, floor: 1515,
    arms: [[411, 492, 318, 679, 'M0 461H411L452 474 466 535 424 571 417 620 360 708 257 1000H0Z'],
      [648, 510, 720, 699, 'M1024 461H650L607 476 625 537 647 571 652 630 686 766 777 1030H1024Z']],
    knees: [[389, 1082], [644, 1082]] },
];

const bounds = { width: 1024, height: 1536, channels: 4 };
const size = 960;
const names = ['body', 'head', 'arm0', 'arm1', 'hand0', 'hand1', 'thigh0', 'thigh1', 'leg0', 'leg1'];
const legs = {
  sporty: [[[414, 871], [260, 1515]], [[565, 872], [746, 1515]]],
  baby: [[[420, 886], [259, 1513]], [[603, 890], [724, 1513]]],
  scary: [[[404, 839], [280, 1522]], [[558, 840], [704, 1522]]],
  ginger: [[[404, 889], [317, 1511]], [[608, 889], [691, 1511]]],
  posh: [[[412, 906], [327, 1515]], [[607, 906], [711, 1515]]],
};

async function mask(path) {
  return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536"><path fill="white" d="${path}"/></svg>`))
    .ensureAlpha().raw().toBuffer();
}

async function loadPerson(root, costume) {
  const raw = await sharp(`${root}/art-source/cosplay/${costume.name}.png`)
    .resize(bounds.width, bounds.height, { fit: 'fill' }).ensureAlpha().raw().toBuffer();
  const [headMask, leftMask, rightMask] = await Promise.all([mask(costume.head), ...costume.arms.map((arm) => mask(arm[4]))]);
  const buffers = Object.fromEntries(names.map((name) => [name, Buffer.from(raw)]));
  for (let y = 0; y < bounds.height; y += 1) for (let x = 0; x < bounds.width; x += 1) {
    const i = (y * bounds.width + x) * 4 + 3;
    const alpha = raw[i];
    const head = headMask[i] / 255;
    const arm0 = leftMask[i] / 255 * (1 - head);
    const arm1 = rightMask[i] / 255 * (1 - head);
    const side = x < costume.hips ? 0 : 1;
    const knee = costume.knees[side][1];
    const hip = legs[costume.name][side][0][1];
    const elbow0 = costume.arms[0][3];
    const elbow1 = costume.arms[1][3];
    buffers.head[i] = Math.round(alpha * head);
    buffers.arm0[i] = y < elbow0 + 22 ? Math.round(alpha * arm0) : 0;
    buffers.arm1[i] = y < elbow1 + 22 ? Math.round(alpha * arm1) : 0;
    buffers.hand0[i] = y >= elbow0 - 28 ? Math.round(alpha * arm0) : 0;
    buffers.hand1[i] = y >= elbow1 - 28 ? Math.round(alpha * arm1) : 0;
    const center = (1 - head) * (1 - leftMask[i] / 255) * (1 - rightMask[i] / 255);
    buffers.body[i] = y < hip + 25 ? Math.round(alpha * center) : 0;
    buffers.thigh0[i] = side === 0 && y >= hip - 17 && y < knee + 15 ? Math.round(alpha * center) : 0;
    buffers.thigh1[i] = side === 1 && y >= hip - 17 && y < knee + 15 ? Math.round(alpha * center) : 0;
    buffers.leg0[i] = side === 0 && y >= knee - 23 ? Math.round(alpha * center) : 0;
    buffers.leg1[i] = side === 1 && y >= knee - 23 ? Math.round(alpha * center) : 0;
  }
  const images = await Promise.all(names.map(async (name) => {
    const { data, info } = await sharp(buffers[name], { raw: bounds })
      .resize({ height: size }).raw().toBuffer({ resolveWithObject: true });
    let left = info.width, top = info.height, right = 0, bottom = 0;
    for (let y = 0; y < info.height; y += 1) for (let x = 0; x < info.width; x += 1) {
      if (!data[(y * info.width + x) * 4 + 3]) continue;
      left = Math.min(x, left);
      top = Math.min(y, top);
      right = Math.max(x, right);
      bottom = Math.max(y, bottom);
    }
    const width = right - left + 1;
    const height = bottom - top + 1;
    const bytes = await sharp(data, { raw: info }).extract({ left, top, width, height }).png().toBuffer();
    const ratio = bounds.height / size;
    return [name, { left: left * ratio, top: top * ratio, width: width * ratio, height: height * ratio, data: bytes.toString('base64') }];
  }));
  return { ...costume, images: Object.fromEntries(images) };
}

export async function loadIndividualRig(root) {
  return Promise.all(costumes.map((costume) => loadPerson(root, costume)));
}

export function individualDefinitions(rig, markup) {
  return rig.map(({ images }, index) => {
    if (!markup.includes(`#person-${index}-`)) return '';
    return names.map((name) => {
      const sprite = images[name];
      return `<image id="person-${index}-${name}" x="${sprite.left}" y="${sprite.top}" width="${sprite.width}" height="${sprite.height}" xlink:href="data:image/png;base64,${sprite.data}"/>`;
    }).join('');
  }).join('');
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const degrees = 180 / Math.PI;
const radiansBetween = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);

function scaryMouth(opening) {
  const jaw = 9 + 78 * opening;
  const teeth = 6 + 13 * opening;
  return `<path d="M507 386Q565 394 628 371L621 426Q618 468 584 482Q549 479 522 432Z" fill="#fa8d45"/>
    <path d="M511 390Q558 408 620 380Q609 ${388 + jaw} 577 ${391 + jaw}Q545 ${391 + jaw} 511 390Z" fill="#30201c" stroke="#39221a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M520 394Q560 407 611 386Q599 ${390 + teeth} 566 ${399 + teeth}Q538 ${398 + teeth} 520 394Z" fill="#fff4df"/>
    ${opening > .27 ? `<path d="M550 ${384 + jaw * .73}Q568 ${375 + jaw * .73} 581 ${389 + jaw * .81}Q595 ${376 + jaw * .79} 600 ${387 + jaw * .9}Q584 ${393 + jaw} 560 ${385 + jaw}Z" fill="#eb786d"/>` : ''}
    <path d="M558 475Q581 488 605 465" fill="none" stroke="#a84929" stroke-width="4" stroke-linecap="round"/>`;
}

// Mouth corners are measured on the individual 1024 × 1536 portraits.
const mouthArt = {
  0: { corners: [489, 336, 596, 307], curve: 20, lip: '#df5545',
    patch: 'M481 328Q535 339 600 299L600 327Q599 389 564 392Q515 387 482 345Z',
    skin: ['#ffab66', '#ffa064'] },
  1: { corners: [451, 391, 562, 343], curve: 25, lip: '#cf6d46',
    patch: 'M447 383Q481 403 560 338Q571 333 564 368Q559 424 525 442Q485 447 457 405L447 397Z',
    skin: ['#ffab68', '#ff9f56'] },
  3: { corners: [505, 316, 628, 269], curve: 25, lip: '#c76c35',
    skin: ['#ffa259', '#ff9e52'] },
  4: { corners: [460, 305, 563, 267], curve: 21, lip: '#cf6462',
    skin: ['#ffab68', '#ffa35e'] },
};

function portraitMouth(index, opening) {
  const { corners: [lx, ly, rx, ry], curve, lip, patch, skin } = mouthArt[index];
  const amount = clamp(opening, 0, 1);
  const middle = (lx + rx) / 2;
  const seam = (ly + ry) / 2 + curve;
  const line = `M${lx} ${ly}Q${middle} ${seam} ${rx} ${ry}`;
  const base = patch ? `<defs><linearGradient id="mouth-skin-${index}" x2="0" y2="1"><stop stop-color="${skin[0]}"/><stop offset="1" stop-color="${skin[1]}"/></linearGradient></defs><path d="${patch}" fill="url(#mouth-skin-${index})"/>` : '';
  if (amount < .08) {
    return patch ? `${base}<path d="${line}" fill="none" stroke="#311b17" stroke-width="5" stroke-linecap="round"/>` : '';
  }
  const drop = 24 + amount * 51;
  const aperture = `${line}Q${rx - 17} ${ry + drop * .52} ${middle + 6} ${seam + drop * .38}Q${lx + 24} ${ly + drop * .48} ${lx} ${ly}Z`;
  return `${base}
    <defs><clipPath id="mouth-opening-${index}"><path d="${aperture}"/></clipPath></defs>
    <path d="${aperture}" fill="#301916" stroke="#321a16" stroke-width="5" stroke-linejoin="round"/>
    <g clip-path="url(#mouth-opening-${index})">
      <path d="M${lx + 8} ${ly + 2}Q${middle} ${seam + 3} ${rx - 7} ${ry + 6}Q${middle + 15} ${seam + drop * .26} ${lx + 8} ${ly + 2}Z" fill="#fff3df"/>
      <ellipse cx="${middle + 5}" cy="${seam + drop * .33}" rx="15" ry="6" fill="${lip}"/>
    </g>`;
}

function solveLeg(hip, knee, sole, target) {
  const distance = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const upper = distance(hip, knee);
  const lower = distance(knee, sole);
  const length = clamp(distance(hip, target), Math.abs(upper - lower) + 1, upper + lower - 1);
  const heading = radiansBetween(hip, target);
  const initialHip = radiansBetween(hip, knee);
  const initialKnee = radiansBetween(knee, sole);
  const bend = Math.sin(initialHip - radiansBetween(hip, sole)) >= 0 ? 1 : -1;
  const nextHip = heading + bend * Math.acos(clamp((upper ** 2 + length ** 2 - lower ** 2) / (2 * upper * length), -1, 1));
  const kneeAt = [hip[0] + Math.cos(nextHip) * upper, hip[1] + Math.sin(nextHip) * upper];
  const endAt = [hip[0] + Math.cos(heading) * length, hip[1] + Math.sin(heading) * length];
  const thigh = (nextHip - initialHip) * degrees;
  return [thigh, (radiansBetween(kneeAt, endAt) - initialKnee) * degrees - thigh];
}

function footTarget(side, travel, pace, localDirection, unit, sole, settle) {
  const cycle = (travel / pace + side * .5) % 1;
  const stance = .58;
  const swing = clamp((cycle - stance) / (1 - stance), 0, 1);
  const reach = (cycle < stance ? stance / 2 - cycle : stance * (swing * swing * (3 - 2 * swing) - .5)) * pace;
  const lift = Math.sin(Math.PI * swing) * pace * .26;
  return [sole[0] + reach * settle * localDirection / unit, sole[1] - lift * settle / unit];
}

export function individualActor(rig, index, { x, y, direction = 1, scale = 1, tilt = 0, phase = 0, stride = 0, gesture = 0, jump = 0, vocal = 0, mouth = 0, time = 0, walk, kick = 0, lead = false, feet, arms, opacity = 1 }) {
  const person = rig[index];
  const unit = scale * 157 / person.floor;
  const swing = Math.sin(phase);
  const energy = clamp(gesture / 135, 0, 1);
  const [neckX, neckY] = person.neck;
  const shoulderSwing = clamp(swing * stride * .65, -18, 18);
  const headTurn = Math.sin(time * 1.55 + index * 1.3) * (1.8 + energy * 1.2) - tilt * .28 + vocal * (index === 2 ? 5 : 1.5);
  const show = (name) => `<use xlink:href="#person-${index}-${name}"/>`;
  const around = (angle, x, y, content) => `<g transform="rotate(${angle} ${x} ${y})">${content}</g>`;
  const arm = (side) => {
    const [sx, sy, ex, ey] = person.arms[side];
    const sign = side === 0 ? 1 : -1;
    const accent = Math.sin(time * (index === 0 ? 3.6 : 3.1) + index * 1.7 + side * 1.9);
    const lead = [0, 1, 0, 1, 0][index] === side;
    const [leadRaise, replyRaise, bend] = [
      [41, 16, 36], [62, 10, 36], [57, 32, 38], [68, 41, 27], [27, 8, 24],
    ][index];
    const raise = (lead ? leadRaise * .68 + accent * 8 : replyRaise * .68 + accent * 6) * energy;
    const elbow = arms?.[side][1] ?? sign * (lead ? bend * .72 + accent * 13 : 3 + accent * 8) * energy;
    const shoulder = arms?.[side][0] ?? sign * raise + sign * shoulderSwing * .78 + accent * 2;
    const shoulderBridge = index === 1
      ? `<circle cx="${sx}" cy="${sy}" r="32" fill="#a51121" stroke="#330f17" stroke-width="6"/>`
      : '';
    return shoulderBridge + around(shoulder, sx, sy,
      show(`arm${side}`) + around(elbow, ex, ey, show(`hand${side}`)));
  };
  const leg = (side) => {
    const sign = side === 0 ? 1 : -1;
    const lifted = Math.max(0, swing * sign);
    const [kx, ky] = person.knees[side];
    const knee = [kx, ky];
    const [hip, sole] = legs[person.name][side];
    const target = kick && side === 0 ? [sole[0] - kick * 350, sole[1] - kick * 405]
      : feet ? [sole[0] + feet[side][0] * direction / unit, sole[1] + feet[side][1] / unit]
      : walk ? footTarget(side, walk.travel, walk.pace, walk.direction * direction, unit, sole, walk.settle)
      : null;
    const [thighAngle, kneeAngle] = target
      ? solveLeg(hip, knee, sole, target)
      : [0, sign * lifted * clamp(stride * .73, 0, 29)];
    return around(thighAngle, ...hip, show(`thigh${side}`) + around(kneeAngle, kx, ky, show(`leg${side}`)));
  };
  const closeUp = index === 2 && scale > 2;
  const voiced = lead ? mouth : 0;
  // Both poses are anchored to the mouth corners from the individual drawings.
  const expression = index === 2 ? scaryMouth(voiced) : portraitMouth(index, voiced);
  const blinkProgress = (time + .34 * index) % (2.27 + .17 * index);
  const blink = closeUp && blinkProgress < .10
    ? '<path d="M475 327 Q499 298 526 319 L526 338 Q502 358 475 345Z M578 307 Q597 283 619 302 L618 319 Q596 333 578 322Z" fill="#ef873e"/><path d="M479 335 Q502 345 523 329 M581 311 Q598 320 615 305" fill="none" stroke="#381c14" stroke-width="6" stroke-linecap="round"/>'
    : '';
  const groundY = feet ? y + Math.max(feet[0][1], feet[1][1]) : y;
  const fixFeet = Boolean(walk || feet);
  return `<g opacity="${opacity}"><ellipse cx="${x}" cy="${groundY+1}" rx="${scale * 28}" ry="${scale * 5}" fill="#211329" opacity="${jump > 0 ? .3 : .48}"/>
  <g transform="translate(${x} ${y - jump}) scale(${unit * direction} ${unit}) translate(${-person.hips} ${-person.floor})">
  ${fixFeet ? leg(0) + leg(1) : ''}
  ${around(tilt * .55, person.hips, fixFeet ? legs[person.name][0][0][1] : person.floor,
    (fixFeet ? '' : leg(0) + leg(1)) + arm(0) + arm(1) + show('body') + around(headTurn, neckX, neckY, show('head') + expression + blink))}
  </g></g>`;
}
