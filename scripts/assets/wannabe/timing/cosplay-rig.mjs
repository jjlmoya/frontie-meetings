import sharp from 'sharp';

// Locations in the approved 1672 × 941 cast drawing, in choreography order.
const people = [
  { box: [648, 28, 329, 889], hip: [809, 521], neck: [806, 329], face: [862, 236], hair: 'M650 28H975V263L889 300 855 345 784 340 784 280 728 230H650Z', legs: [[741, 683], [856, 686]] },
  { box: [350, 10, 359, 909], hip: [515, 556], neck: [547, 312], face: [519, 247], hair: 'M359 10H691V257L610 286 566 317 514 314 467 271H359Z', legs: [[431, 681], [557, 679]] },
  { box: [0, 19, 370, 901], hip: [164, 540], neck: [227, 353], face: [226, 285], hair: 'M0 19H369V330L281 353 229 372 156 335 109 294 44 337H0Z', legs: [[104, 685], [242, 686]] },
  { box: [961, 30, 348, 888], hip: [1128, 563], neck: [1145, 310], face: [1200, 210], hair: 'M956 30H1309V334L1240 323 1207 295 1146 319 1096 318 1069 342 956 346Z', legs: [[1090, 663], [1220, 671]] },
  { box: [1316, 41, 352, 882], hip: [1491, 568], neck: [1491, 307], face: [1498, 215], hair: 'M1316 41H1668V344L1556 330 1526 307 1463 308 1420 330 1316 326Z', legs: [[1424, 667], [1539, 671]] },
];
const outlines = [
  'M685 28H977V503L946 550 977 890 950 917H648V851L675 728 687 546 686 443 661 370 651 269Z',
  'M362 10H680V322L708 382 702 501 660 566 636 622 653 836 618 918H350L362 849 389 677 419 548 372 478 361 397 366 251Z',
  'M0 19H370V327L318 354 369 450 320 536 294 642 322 821 333 909 305 917H10V856L37 742 53 590 68 480 99 441 0 457Z',
  'M965 30H1308V339L1286 391 1291 473 1244 478 1246 587 1259 706 1284 905 1258 918H1020L1022 786 1044 657 1015 579 1030 514 985 473 967 427 985 389 963 356Z',
  'M1316 41H1668V915H1339L1353 840 1378 752 1377 656 1366 566 1388 494 1348 458 1316 400Z',
];

async function svgMask(art, width, height, viewBox) {
  return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">${art}</svg>`)).ensureAlpha().raw().toBuffer();
}

export async function loadCosplayRig(source) {
  return Promise.all(people.map(async (person, index) => {
    const [left, top, width, height] = person.box;
    const viewBox = person.box.join(' ');
    const rgba = await sharp(source).extract({ left, top, width, height }).ensureAlpha().raw().toBuffer();
    const outline = await svgMask(`<path d="${outlines[index]}" fill="white"/>`, width, height, viewBox);
    const headMask = await svgMask(`<path d="${person.hair}" fill="white"/>`, width, height, viewBox);
    const parts = { head: Buffer.from(rgba), body: Buffer.from(rgba), leftFoot: Buffer.from(rgba), rightFoot: Buffer.from(rgba) };
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 4;
      const [r, g, b] = rgba.subarray(at, at + 3);
      // The warm sheet has a narrow hue range. White clothing, teeth and
      // shoes are substantially less yellow than the backing paper.
      const isPaper = r > 228 && g > 205 && b > 164 && r - g >= 5 && r - b >= 13 && r - b <= 52;
      const isGround = top + y > 891 && r > 105 && r - g < 74 && g - b > 5 && g - b < 37 && g > 89 && b > 70;
      const pixelAlpha = isPaper || isGround ? 0 : outline[at + 3];
      const head = headMask[at + 3] / 255;
      const foot = left + x < person.hip[0] ? 'leftFoot' : 'rightFoot';
      const lowerLeg = top + y > person.legs[foot === 'leftFoot' ? 0 : 1][1];
      parts.head[at + 3] = Math.round(pixelAlpha * head);
      parts.body[at + 3] = lowerLeg ? 0 : Math.round(pixelAlpha * (1 - head));
      parts.leftFoot[at + 3] = foot === 'leftFoot' && lowerLeg ? pixelAlpha : 0;
      parts.rightFoot[at + 3] = foot === 'rightFoot' && lowerLeg ? pixelAlpha : 0;
    }

    const images = await Promise.all(Object.entries(parts).map(async ([name, data]) => {
      const file = await sharp(data, { raw: { width, height, channels: 4 } }).resize({ height: 440 }).png().toBuffer();
      return [name, file.toString('base64')];
    }));
    return { ...person, images: Object.fromEntries(images) };
  }));
}

export function cosplayActor(rig, index, { x, y, direction = 1, scale = 1, tilt = 0, phase = 0, stride = 0, gesture = 0, jump = 0, sing = false }) {
  const person = rig[index];
  const [left, top, width, height] = person.box;
  const unit = scale * 157 / height;
  const hipX = person.hip[0];
  const floorY = top + height - 8;
  const swing = Math.sin(phase);
  const wiggle = Math.sin(phase * .68) * 1.5;
  const headTurn = tilt * -.34 + wiggle - gesture * .025;
  const use = (name) => `<use xlink:href="#cos-${index}-${name}"/>`;
  const foot = (name, i) => {
    const [kneeX, kneeY] = person.legs[i];
    return `<g transform="rotate(${swing * stride * .64 * (i ? -1 : 1)} ${kneeX} ${kneeY})">${use(name)}</g>`;
  };
  return `<ellipse cx="${x}" cy="${y + 2}" rx="${scale * 25}" ry="${scale * 5}" fill="#211329" opacity=".45"/>
  <g transform="translate(${x} ${y - jump}) scale(${unit * direction} ${unit}) translate(${-hipX} ${-floorY})">
    <g transform="rotate(${tilt * .38} ${hipX} ${floorY})">
      ${foot('leftFoot', 0)}${foot('rightFoot', 1)}
      ${use('body')}
      <g transform="rotate(${headTurn} ${person.neck.join(' ')})">
        ${use('head')}
        ${sing && index !== 2 ? `<ellipse cx="${person.face[0]}" cy="${person.face[1] + 3}" rx="14" ry="7" fill="#411d24" stroke="#382226" stroke-width="3"/>` : ''}
      </g>
    </g>
  </g>`;
}

export function cosplayDefinitions(rig, markup) {
  return rig.map(({ box, images }, index) => {
    if (!markup.includes(`#cos-${index}-`)) return '';
    const [x, y, width, height] = box;
    return Object.entries(images).map(([name, data]) =>
      `<image id="cos-${index}-${name}" x="${x}" y="${y}" width="${width}" height="${height}" xlink:href="data:image/png;base64,${data}"/>`
    ).join('');
  }).join('');
}
