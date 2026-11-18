const clamp = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const mix = (from, to, p) => from + (to - from) * p;

// Right step, gather, left step, gather, then a small pose on the next drum hit.
const steps = [
  { hit: 9.44, side: 1, position: 20 },
  { hit: 9.98, side: 0, position: 17 },
  { hit: 10.52, side: 0, position: 0 },
  { hit: 11.06, side: 1, position: 0 },
];
const gestures = [
  { first: [[19, 44], [-27, -49]], back: [[36, 41], [-13, -31]], end: [[41, 41], [-21, -6]] },
  { first: [[10, 18], [-39, -43]], back: [[32, 19], [-15, -25]], end: [[8, 12], [-63, -55]] },
  { first: [[27, 33], [-12, -22]], back: [[20, 39], [-36, -35]], end: [[60, 34], [-20, -20]] },
  { first: [[37, 22], [-38, -23]], back: [[8, 19], [-26, -53]], end: [[28, 52], [-48, -19]] },
  { first: [[19, 41], [-10, -19]], back: [[32, 19], [-25, -29]], end: [[22, 57], [-6, -6]] },
];
const phraseMoves = [
  [ [[82, 20], [-25, 36]], [[35, 66], [-72, -25]], [[-20, -35], [82, 24]], [[48, 58], [-35, -42]] ],
  [ [[18, 58], [-55, 24]], [[72, 18], [-22, -54]], [[-18, -28], [77, 34]], [[38, 68], [-62, -18]] ],
  [ [[72, 34], [-28, 46]], [[82, 12], [-48, -42]], [[-20, -30], [89, 35]], [[48, 61], [-24, -47]] ],
  [ [[88, 20], [-58, 22]], [[64, 40], [-28, -63]], [[-16, -33], [76, 45]], [[35, 73], [-65, -20]] ],
  [ [[48, 50], [-18, 18]], [[79, 22], [-32, -38]], [[-20, -24], [71, 15]], [[28, 64], [-55, -38]] ],
];

export function openingDance(index, time) {
  const delay = [0, .025, 0, -.02, .035][index];
  const t = time - delay;
  if (t >= 13.78) {
    const beat = (t - 13.78) / .5455;
    const count = Math.floor(beat);
    const fraction = ease(beat - count);
    const poses = phraseMoves[index];
    const from = poses[count % poses.length];
    const to = poses[(count + 1) % poses.length];
    const arms = from.map((pair, side) => pair.map((angle, joint) => mix(angle, to[side][joint], fraction)));
    const swing = Math.sin(Math.PI * (beat % 1));
    const stepSide = count % 2;
    const step = [0, 0];
    const lift = [0, 0];
    step[stepSide] = (stepSide ? -1 : 1) * (22 + index % 2 * 3) * swing;
    lift[stepSide] = -17 * swing;
    const transfer = step[stepSide] * .42;
    const sway = Math.sin(beat * Math.PI / 2 + index * .62);
    return {
      x: transfer + sway * 7,
      y: 2 + Math.abs(Math.sin(beat * Math.PI)) * 5,
      tilt: sway * 12 + (index - 2) * 2,
      feet: [[step[0] - transfer, lift[0]], [step[1] - transfer, lift[1]]],
      arms,
    };
  }
  const left = [0, 0];
  const right = [0, 0];
  const feet = [left, right];
  const range = [1.0, .82, 1, .9, .65][index];
  for (const step of steps) {
    const age = clamp((t - step.hit + .26) / .26);
    if (age === 0) continue;
    const foot = feet[step.side];
    foot[0] = mix(foot[0], step.position * range, ease(age));
    foot[1] = -Math.sin(Math.PI * age) * (step.side ? 15 : 12) * range;
  }
  const transfer = (left[0] + right[0]) * .52;
  const end = ease((t - 11.16) / .43);
  const turn = ease((t - 10.02) / .42);
  const crouch = (2.5 + Math.abs(Math.sin((t - 9.44) / .5455 * Math.PI)) * 4) * (1 - end);
  const { first, back, end: finish } = gestures[index];
  return {
    x: transfer,
    y: crouch,
    tilt: (1 - end) * mix(7, -6, turn) + (index - 2) * end * 2.1,
    feet: feet.map(([x, y]) => [x - transfer, y - crouch]),
    arms: first.map((angles, side) => angles.map((angle, joint) => mix(mix(angle, back[side][joint], turn), finish[side][joint], end))),
  };
}
