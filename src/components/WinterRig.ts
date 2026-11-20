const ART_ASPECT = 1120 / 1226;
export const MOUTH = { x: .4715, y: .619 * ART_ASPECT };
const RADIANS = Math.PI / 180;

export type RigPart = 'head' | 'hair' | 'whiskerLeft' | 'whiskerRight' | 'body' | 'pawLeft' | 'pawRight';

export function winterEase(from: number, to: number, time: number) {
  const position = Math.max(0, Math.min(1, (time - from) / (to - from)));
  return position * position * (3 - 2 * position);
}

export function freezeAt(time: number) {
  return .09 + winterEase(13, 191, time) * .89;
}

export function bridgeQuiet(time: number) {
  return winterEase(134.5, 137, time) * (1 - winterEase(154.4, 156.8, time));
}

export function finalGust(time: number) {
  return winterEase(155.65, 157.35, time) * (1 - winterEase(158.1, 162.9, time));
}

export function frozenStare(time: number) {
  return winterEase(206.46, 207.55, time);
}

export function winterRigAt(time: number, moving: boolean) {
  const pulse = Math.sin(time * 1.39 + .8 + Math.sin(time * .43) * 1.35);
  const force = moving
    ? Math.max(Math.max(0, pulse) ** 5, finalGust(time) * .92) * (1 - bridgeQuiet(time) * .94) * (1 - frozenStare(time))
    : 0;
  const strength = force * (.45 + freezeAt(time) * .55);
  const shake = (speed: number, phase: number) => strength * Math.sin(time * speed + phase);
  return {
    force, strength,
    headX: shake(36, .2) * 3.65,
    headY: shake(43, .8) * 2.6,
    headRoll: shake(29, 0) * 1.1,
    bodyY: shake(27, .5) * 1.5,
    hairRoll: shake(30, 1.4) * 1.65,
    whiskerLeft: shake(48, .25) * 2.5,
    whiskerRight: shake(42, 1.1) * 2.35,
    pawLeft: shake(33, .65) * 2.05,
    pawRight: shake(35, 2.3) * 2.2,
  };
}

type RigPose = ReturnType<typeof winterRigAt>;

function rotate(x: number, y: number, pivotX: number, pivotY: number, degrees: number) {
  const angle = degrees * RADIANS;
  const dx = x - pivotX;
  const dy = y - pivotY;
  return [pivotX + dx * Math.cos(angle) - dy * Math.sin(angle),
    pivotY + dx * Math.sin(angle) + dy * Math.cos(angle)];
}

// The same pivots are used in WinterExperience.module.css. The canvas can
// reconstruct the angle at the time a flake left the drawing, even after seeking.
export function rigPoint(part: RigPart, dx: number, dy: number, width: number, pose: RigPose) {
  let x = (MOUTH.x + dx) * width;
  let y = (MOUTH.y + dy) * width;
  const height = width * ART_ASPECT;
  if (part === 'hair') [x, y] = rotate(x, y, width * .45, height * .42, pose.hairRoll);
  if (part === 'whiskerLeft') [x, y] = rotate(x, y, width * .29, height * .58, pose.whiskerLeft);
  if (part === 'whiskerRight') [x, y] = rotate(x, y, width * .69, height * .57, pose.whiskerRight);
  if (part === 'body' || part === 'pawLeft' || part === 'pawRight') {
    y += part === 'body' ? pose.bodyY : pose[part];
  } else {
    [x, y] = rotate(x, y, width * .46, height * .69, pose.headRoll);
    x += pose.headX;
    y += pose.headY;
  }
  return [x - MOUTH.x * width, y - MOUTH.y * width];
}
