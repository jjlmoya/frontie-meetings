const clamp = (value) => Math.max(0, Math.min(1, value));
const ease = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;
const shotSeconds = (shot) => Math.max(0, shot.end - shot.start);

const xSlots = [145, 305, 480, 655, 815];
const ySlots = [399, 411, 436, 411, 399];
const sizes = [1.43, 1.45, 1.47, 1.44, 1.42];

// Each persona has four broad, readable dance poses; the sequence runs on the
// 8-count and changes its spacing/energy with the shot type.
const arms = [
  [ [[82,20],[-25,36]], [[35,66],[-72,-25]], [[-20,-35],[82,24]], [[48,58],[-35,-42]] ],
  [ [[18,58],[-55,24]], [[72,18],[-22,-54]], [[-18,-28],[77,34]], [[38,68],[-62,-18]] ],
  [ [[72,34],[-28,46]], [[82,12],[-48,-42]], [[-20,-30],[89,35]], [[48,61],[-24,-47]] ],
  [ [[88,20],[-58,22]], [[64,40],[-28,-63]], [[-16,-33],[76,45]], [[35,73],[-65,-20]] ],
  [ [[48,50],[-18,18]], [[79,22],[-32,-38]], [[-20,-24],[71,15]], [[28,64],[-55,-38]] ],
];

const eightCountShapes = [
  [0, 1, 2, 3, 2, 0, 3, 1], // diagonal points, turn, hit
  [1, 3, 0, 2, 3, 1, 2, 0], // cross-step and alternating reach
  [2, 0, 3, 1, 0, 2, 1, 3], // high-low, hip accent, high-low
  [3, 2, 1, 0, 1, 3, 0, 2], // sharp chorus punches into open pose
];

// Keep the choreography readable and relaxed; the old full-strength arm and
// foot hits made every eight-count feel like a constant pose change.
const movementScale = [.72, .68, .78, .70, .62];

function dancingPose(index, beat, action, lead, partner) {
  // The song has a steady four-beat pulse. Choreography changes on each
  // eight-count phrase, while small personal offsets keep the group alive.
  const offset = action === 'relay' ? index * .23 : [0, .035, -.025, .045, -.04][index];
  const clock = beat + offset;
  const count = Math.floor(clock);
  const fraction = clock - count;
  const phrase = Math.floor(beat / 8);
  // Keep choreography on the song's musical phrase rather than resetting the
  // dance whenever the edit changes scenes.
  const pattern = phrase % eightCountShapes.length;
  const shapes = eightCountShapes[pattern];
  const shapeIndex = shapes[((count % 8) + 8) % 8];
  const nextShapeIndex = shapes[(count + 1) % 8];
  const poseFrom = arms[index][shapeIndex];
  const poseTo = arms[index][nextShapeIndex];
  // Let each gesture travel across the whole beat instead of snapping at
  // the front edge and holding a stiff pose until the next count.
  const snap = ease(fraction);
  const emphasis = action === 'solo' && index === lead ? 1.08
    : action === 'duet' && (index === lead || index === partner) ? 1.03
      : action === 'chase' ? 1.02 : .96;
  const armMotion = action === 'solo' || action === 'duet' ? .22 : .14;
  const joints = poseFrom.map((pair, side) => pair.map((angle, joint) => {
    const next = mix(angle, poseTo[side][joint], snap);
    return Math.max(-40, Math.min(40, next * emphasis * armMotion));
  }));

  const beatPhase = clamp(fraction * 2);
  const landing = ease(beatPhase);
  const foot = ((count % 2) + 2) % 2;
  const side = count % 2 ? -1 : 1;
  const amp = movementScale[index] * (pattern === 1 ? 24 : pattern === 3 ? 26 : 21);
  const feet = [[0, 0], [0, 0]];
  let footX = side * amp * landing;
  let footLift = -Math.sin(Math.PI * beatPhase) * (pattern === 2 ? 17 : 11) * movementScale[index];

  // Give each eight-count a different, readable foot pattern instead of
  // replaying the same small side sway in every shot.
  if (pattern === 1 && foot === 1) footX *= -1.24; // cross-behind
  if (pattern === 2 && count % 4 === 2) footLift -= 10 * Math.sin(Math.PI * beatPhase); // knee accent
  if (pattern === 3) footX *= 1.18; // wide chorus step
  if (action === 'chase') footLift *= 1.22;
  if (action === 'solo' && index === lead) { footX *= 1.22; footLift *= 1.12; }
  if (action === 'solo' && index !== lead) { footX *= .62; footLift *= .72; }
  feet[foot] = [footX, footLift];
  const transfer = footX * .36;
  const sway = Math.sin(clock * Math.PI / 2 + index * .62);
  const accent = Math.sin(Math.PI * beatPhase);
  const bodyBob = pattern === 2 && count % 4 === 2 ? -5 * accent : 0;
  const tilt = (sway * (pattern === 3 ? 7 : 5.5) + (index - 2) * 1.2 + side * accent * (pattern === 1 ? 5 : 2.5)) * .82;

  return {
    dx: transfer + sway * 5.5,
    dy: 2 + Math.abs(Math.sin(clock * Math.PI)) * (index === 1 ? 8 : 5) + bodyBob,
    tilt,
    feet: feet.map(([x, y]) => [x - transfer, y]),
    arms: joints,
    phase: clock * Math.PI,
  };
}

function positionsFor(shot, progress, beat) {
  const { action, lead, partner } = shot;
  const line = xSlots.map((x) => x);
  const countInPhrase = ((beat % 8) + 8) % 8;
  const formationShift = ease((countInPhrase - 3.25) / 1.1);
  if (action === 'formation') {
    // Stable marks keep the cast the same apparent size and position across cuts.
  } else if (action === 'line') {
    // The formation reads through individual movement, not lateral jumping.
  }
  if (action === 'solo' && Number.isInteger(lead)) {
    line[lead] = mix(xSlots[lead], 480, ease(progress * shotSeconds(shot) / .75));
  } else if (action === 'duet' && Number.isInteger(lead) && Number.isInteger(partner)) {
    const approach = ease(progress * shotSeconds(shot) / .75);
    line[lead] = mix(xSlots[lead], 408 + Math.sin(beat * Math.PI / 2) * 30, approach);
    line[partner] = mix(xSlots[partner], 552 - Math.sin(beat * Math.PI / 2) * 30, approach);
  } else if (action === 'chase') {
    line.forEach((x, i) => {
      const lane = Math.sin(beat * Math.PI / 2 + i * .48);
      line[i] = x + lane * 62;
    });
  } else if (action === 'mirrors') {
    const drift = Math.sin(beat * Math.PI / 2) * 34;
    line[0] += drift;
    line[1] += drift * .45;
    line[3] -= drift * .45;
    line[4] -= drift;
  } else if (action === 'entrance' && Number.isInteger(lead) && Number.isInteger(partner)) {
    const enter = ease(progress / .6);
    line[lead] = mix(418, 425, enter);
    line[partner] = mix(480, 535, enter);
  }
  return line;
}

export function fullSceneActors(shot, time, vocal, mouth) {
  const progress = clamp((time - shot.start) / (shot.end - shot.start));
  const beat = (time - 5.06) / .5455;
  const action = shot.action;
  const x = positionsFor(shot, progress, beat);
  let cast = [0, 4, 1, 3, 2].map((index) => {
    const dance = dancingPose(index, beat, action, shot.lead, shot.partner);
    let scale = sizes[index];
    let direction = 1;
    let pose = dance;
    let y = ySlots[index];

    if (action === 'solo' && index === shot.lead) {
      const approach = ease(progress * shotSeconds(shot) / .75);
      scale = mix(sizes[index], 1.52, approach);
      y = mix(ySlots[index], 456, approach);
      pose = { ...dance, dx: dance.dx * .45, dy: dance.dy * .55, tilt: dance.tilt * .75 };
    } else if (action === 'duet' && (index === shot.lead || index === shot.partner)) {
      scale = 1.48;
      y += 4;
      direction = index === shot.lead ? 1 : -1;
    } else if (action === 'chase') {
      pose = { ...dance, tilt: mix(dance.tilt, index % 2 ? -14 : 14, .48), phase: beat * Math.PI * 2 + index * .4 };
    } else if (action === 'mirrors') {
      direction = index % 2 ? -1 : 1;
      pose = { ...dance, tilt: dance.tilt + (direction < 0 ? -4 : 4) };
    } else if (action === 'entrance' && (index === shot.lead || index === shot.partner)) {
      const emerge = ease(progress / .58);
      const from = index === shot.lead ? 395 : 475;
      const to = x[index];
      x[index] = mix(from, to, emerge);
      pose = { ...dance, dx: dance.dx * emerge, dy: dance.dy + (1 - emerge) * 8, tilt: mix(-11, dance.tilt, emerge) };
    }

    if (action === 'finale') {
      const freeze = ease((time - (shot.end - 1.15)) / .45);
      const finaleArms = [
        [[82, 12], [-22, 54]],
        [[68, 18], [-68, 18]],
        [[86, 18], [-78, 18]],
        [[82, 24], [-12, 52]],
        [[38, 58], [-72, -8]],
      ][index];
      pose = {
        ...pose,
        dx: mix(pose.dx, 0, freeze), dy: mix(pose.dy, 0, freeze),
        tilt: mix(pose.tilt, [-8, 5, 0, -10, 9][index], freeze),
        arms: pose.arms.map((pair, side) => pair.map((angle, joint) => mix(angle, finaleArms[side][joint], freeze))),
      };
    }

    const isSinging = action === 'solo'
      ? index === shot.lead
      : action === 'duet'
        ? index === shot.lead || index === shot.partner
        : true;
    const featured = action === 'solo'
      ? index === shot.lead
      : action === 'duet'
        ? index === shot.lead || index === shot.partner
        : true;
    const opacity = featured ? 1 : 1 - ease(progress * shotSeconds(shot) / .25);
    return {
      index, x: x[index] + pose.dx, y: y + pose.dy, scale, direction,
      phase: pose.phase, tilt: pose.tilt, arms: pose.arms, feet: pose.feet,
      opacity,
      lead: isSinging, vocal: isSinging ? vocal : 0, mouth: isSinging ? mouth : 0,
      gesture: 88 + Math.abs(Math.sin(beat * Math.PI + index)) * 36,
    };
  });
  cast.sort((a, b) => a.y - b.y);
  const finale = action === 'finale' ? Array.from({ length: 12 }, (_, i) => {
    const seed = (i * 37 + 11) % 97 / 97;
    const age = time - (shot.end - 3.1 + seed * .75);
    if (age < 0 || age > 3.1) return '';
    const px = 35 + ((i * 173) % 890) + Math.sin(age * 2.4 + i) * 42;
    const py = -90 + seed * 140 + age * (54 + seed * 46);
    const colors = ['#ff5c75', '#ffd34e', '#42cee1', '#b56eff', '#72e39c'];
    const width = 9 + (i % 3) * 2;
    const height = 16 + (i % 3) * 4;
    return `<path d="M${px} ${py}l${width} 4l-3 ${height}l-${width - 2} -5Z" fill="${colors[i % colors.length]}" opacity="${Math.min(.7, .3 + age * .16)}" transform="rotate(${i * 31 + age * 60} ${px} ${py})"/>`;
  }).join('') : '';
  return { actors: cast, overlay: finale, foreground: '' };
}
