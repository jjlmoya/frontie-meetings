import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { cosplayActor, cosplayDefinitions, loadCosplayRig } from './assets/wannabe/timing/cosplay-rig.mjs';
import { individualActor, individualDefinitions, loadIndividualRig } from './assets/wannabe/timing/individual-rig.mjs';
import { fullSongMouthFrames, openingCueAt, openingCues, openingMouthFrames } from './assets/wannabe/timing/opening-cues.mjs';
import { openingDance } from './assets/wannabe/timing/opening-dance.mjs';
import { fullShots } from './assets/wannabe/timing/full-cut.mjs';
import { fullSceneActors } from './assets/wannabe/timing/full-performance.mjs';

const individual = process.argv.includes('--individual');
const qaSize = process.argv.includes('--qa');
const width = individual && !qaSize ? 1920 : 960;
const height = individual && !qaSize ? 1080 : 540;
const fps = 24;
const root = 'scripts/assets/wannabe';
const audio = 'public/assets/wannabe/wanna-be.mp3';
const exterior = `${root}/references/hotel-exterior-v1.png`;
const hall = `${root}/references/hotel-elevator-foyer-v1.png`;
const stage = `${root}/references/hotel-pop-stage-v2.png`;
const cover = `${root}/references/front-line-cover-landscape-v1.png`;
const cosplay = individual || process.argv.includes('--cosplay');
const fullVideo = individual && process.argv.includes('--full');
const cues = JSON.parse(await readFile(`${root}/timing/animation-cues.json`, 'utf8'));
const durationArg = process.argv.find((arg) => arg.startsWith('--duration='));
const requestedDuration = durationArg ? Number(durationArg.slice('--duration='.length)) : cues.duration;
// Hold the landscape cover silently, then play through the phrase ending.
const coverSeconds = individual ? 2 : 0;
const contentDuration = individual ? fullVideo ? Math.min(cues.duration, requestedDuration) : 18.2 : 10.8;
const duration = coverSeconds + contentDuration;
const output = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
  ?? `${root}/previews/${fullVideo ? 'wannabe-full-v1' : individual ? 'hallway-cosplay-v19' : cosplay ? 'hallway-cosplay-v1' : 'hallway-animatic-v1'}.mp4`;
const autoMouthFrames = fullSongMouthFrames(cues.tracks.vocals, cues.sampleRateHz, fps, Math.ceil(contentDuration * fps));
const openingFrames = openingMouthFrames(cues.tracks.vocals, cues.sampleRateHz, fps, Math.ceil(contentDuration * fps));
const mouthFrames = autoMouthFrames.map((value, frame) => openingCueAt(frame / fps) ? openingFrames[frame] : value);
const rig = individual ? await loadIndividualRig(root)
  : cosplay ? await loadCosplayRig(`${root}/references/cosplay-cast-sketch-v1.png`) : null;

const cast = [
  { suit: '#245fe1', trim: '#ffd85a', crest: 'M-34 -101 Q-54 -133 -16 -148 Q-24 -137 4 -149 Q25 -157 47 -147 Q27 -130 34 -111 L15 -91Z' },
  { suit: '#ed7cb0', trim: '#ffd1e9', crest: 'M-29 -100 Q-62 -112 -51 -134 Q-38 -152 -19 -130 Q-13 -154 7 -151 Q27 -153 29 -125 Q51 -142 57 -123 Q62 -108 30 -96Z' },
  { suit: '#722f86', trim: '#ffae48', crest: 'M-29 -91 L-54 -131 L-30 -121 L-26 -162 L-7 -141 L7 -174 L18 -138 L42 -156 L32 -117 L53 -123 L30 -91Z' },
  { suit: '#da394c', trim: '#ffddaf', crest: 'M-33 -100 Q-54 -124 -28 -145 Q7 -179 39 -155 Q61 -143 35 -127 Q24 -126 28 -144 Q1 -141 7 -124 L32 -104Z' },
  { suit: '#292138', trim: '#f4d9a8', crest: 'M-32 -98 Q-46 -125 -20 -133 Q0 -145 29 -139 Q48 -137 60 -148 Q59 -121 26 -108 L18 -95Z' },
];
const costume = [
  '<path d="M-21 -70 L0 -58 L21 -70 M0 -78 V-50" fill="none" stroke="#ffd85a" stroke-width="4"/>',
  '<path d="M-21 -55 L-30 -44 Q-22 -40 -13 -44 Q0 -39 9 -44 Q21 -39 30 -44 L21 -55Z" fill="#ed7cb0" stroke="#ffd1e9" stroke-width="3"/><path d="M0 -68 L-11 -74 V-63Z M0 -68 L11 -74 V-63Z" fill="#ffd1e9"/>',
  '<path d="M-23 -72 L-12 -78 L-7 -52 L-21 -52Z M23 -72 L12 -78 L7 -52 L21 -52Z" fill="#ffae48"/><path d="M-18 -70l4 3m-2 7l4 3m26 -13l4 3m-6 6l5 3" stroke="#302737" stroke-width="3"/>',
  '<path d="M-20 -65 H20 M-20 -56 H20 M-12 -75 V-50 M12 -75 V-50" stroke="#ffddaf" stroke-width="2"/><circle cx="13" cy="-71" r="3" fill="#ffd85a"/>',
  '<path d="M-15 -75 L0 -60 L15 -75 M0 -60 V-49" fill="none" stroke="#f4d9a8" stroke-width="3"/><circle cx="6" cy="-54" r="2" fill="#f4d9a8"/>',
];

const openingShots = individual ? [
  { start: 0, end: 1.35, source: exterior, zoom: 1, x: .5, action: 'arrival' },
  { start: 1.35, end: openingCues[0].start, source: hall, zoom: 1.25, x: 1, action: 'door' },
  { start: openingCues[0].start, end: openingCues[1].start, source: hall, zoom: 1.25, camera: { x: 555, y: 310, zoom: 1.68 }, action: 'answer' },
  { start: openingCues[1].start, end: openingCues[2].start, source: hall, zoom: 1.25, camera: { x: 646, y: 315, zoom: 1.68 }, action: 'answer' },
  { start: openingCues[2].start, end: contentDuration, source: stage, zoom: 1.04, x: .5, action: 'formation' },
] : [];
const extendedShots = fullVideo ? fullShots(root, contentDuration).filter(({ start }) => start >= 18) : [];
if (fullVideo && extendedShots.length) openingShots[4].end = extendedShots[0].start;
const shots = individual ? [...openingShots, ...extendedShots] : [
  { start: 0, end: 1.98, source: hall, zoom: 1.21, x: 0.1 },
  { start: 1.98, end: 3.73, source: hall, zoom: 1.35, x: 0.59 },
  { start: 3.73, end: 5.62, source: hall, zoom: 1.12, x: 0.55 },
  { start: 5.62, end: 7.80, source: hall, zoom: 1.25, x: 1 },
  { start: 7.80, end: duration, source: stage, zoom: 1.02, x: 0.5 },
];

const lerp = (from, to, mix) => from + (to - from) * mix;
const clamp = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};

const arrivalCut = 1.35;
const arrivingCast = [
  { person: 4, outside: [373, 449, .97, 104], inside: [300, 411, .86, 100], reactionDelay: .16 },
  { person: 1, outside: [459, 455, 1.02, 114], inside: [388, 435, .94, 109], reactionDelay: .12 },
  { person: 0, outside: [554, 444, 1.01, 118], inside: [500, 450, 1.02, 130], reactionDelay: .10 },
  { person: 2, outside: [649, 420, .89, 112], inside: [597, 422, .91, 150], reactionDelay: .07 },
];
const exteriorProgress = (p) => p * (.61 + .39 * p);
const interiorProgress = (t) => 1 - (1 - clamp((t - arrivalCut) / 1.12)) ** 2;
const scaryApproach = (time) => ease((time - 4.03) / .79);
const gingerFinal = { x: 697, y: 459, scale: 1.43, direction: -1 };

function doorBackdrop(open) {
  return `<linearGradient id="door-recess"><stop stop-color="#4b2217"/><stop offset="1" stop-color="#190b17"/></linearGradient>
    <path d="M890 180L947 195L948 401L890 410L889 309Q879 303 889 293Z" fill="url(#door-recess)"/>
    <path d="M893 385L941 389L913 419L845 412Z" fill="#ed972f" opacity="${open * .19}"/>`;
}

function doorPanel(open) {
  return `<clipPath id="door-panel-outline"><path d="M890 180L947 195L948 401L890 410L889 309Q879 303 889 293Z"/></clipPath>
    <g transform="translate(947 0) scale(${1 - open * .84} 1) translate(-947 0)" clip-path="url(#door-panel-outline)">
      <image x="882" y="178" width="69" height="235" xlink:href="data:image/png;base64,${doorArt}"/>
    </g>`;
}

function actor(index, pose) {
  if (individual) return individualActor(rig, index, pose);
  return rig ? cosplayActor(rig, index, pose) : catActor(index, pose);
}

function catActor(index, { x, y, scale = 1, direction = 1, tilt = 0, phase = 0, stride = 0, gesture = 0, jump = 0, sing = false }) {
  const cat = cast[index];
  const swing = Math.sin(phase) * stride;
  const frontFoot = Math.max(0, Math.cos(phase)) * stride * 0.65;
  const backFoot = Math.max(0, -Math.cos(phase)) * stride * 0.65;
  const bounce = Math.abs(Math.sin(phase)) * stride * 0.08;
  const walk = (side, foot, lift) => `<path d="M${side * 13} -45 Q${side * 16 + foot * 0.6} -22 ${side * 16 + foot} ${-7 - lift}" fill="none" stroke="${cat.suit}" stroke-width="19" stroke-linecap="round"/><ellipse cx="${side * 16 + foot + 3}" cy="${-5 - lift}" rx="13" ry="6" fill="${cat.trim}" stroke="#201a2e" stroke-width="2"/>`;
  const arm = (side, rotation) => `<g transform="translate(${side * 20} -71) rotate(${rotation})"><path d="M0 0 Q${side * 10} 6 ${side * 12} 23" fill="none" stroke="${cat.trim}" stroke-width="12" stroke-linecap="round"/><circle cx="${side * 12}" cy="24" r="7" fill="#302737"/></g>`;
  return `<ellipse cx="${x}" cy="${y}" rx="${scale * 34}" ry="${scale * 7}" fill="#211329" opacity=".48"/>
    <g transform="translate(${x} ${y - jump}) scale(${scale * direction} ${scale})" stroke-linejoin="round">
      <path d="M-18 -47 Q-49 -32 -55 -53 Q-59 -67 -64 -63" fill="none" stroke="#302737" stroke-width="9" stroke-linecap="round"/>
      ${walk(-1, -swing, backFoot)}${walk(1, swing, frontFoot)}
      <g transform="translate(0 ${-bounce}) rotate(${tilt} 0 -42)">
        ${arm(-1, -swing * 1.4 + gesture * .4)}
        <path d="M-21 -51 L-24 -70 Q-19 -82 0 -82 Q19 -82 24 -70 L21 -51 Q0 -42 -21 -51Z" fill="${cat.suit}" stroke="#201a2e" stroke-width="3"/>
        ${costume[index]}
        ${arm(1, swing * 1.4 - gesture)}
        <g transform="rotate(${-tilt * .38} 0 -84)">
          <path d="M-33 -107 L-35 -134 L-11 -116 M15 -116 L36 -137 L34 -104" fill="#f68b9c" stroke="#302737" stroke-width="6"/>
          <path d="M-38 -103 Q-38 -123 -4 -124 Q34 -124 38 -103 Q39 -81 6 -77 Q-35 -78 -38 -103Z" fill="#302737" stroke="#211b2b" stroke-width="3"/>
          <path d="${cat.crest}" transform="translate(0 -15)" fill="url(#rainbow)" stroke="#201a2e" stroke-width="3"/>
          <path d="M-28 -101 Q-20 -109 -9 -100 Q-20 -92 -28 -101 M8 -100 Q21 -111 30 -103 Q23 -94 8 -100" fill="#ffdd75"/>
          <circle cx="-17" cy="-101" r="2.6" fill="#201a2e"/><circle cx="20" cy="-103" r="2.6" fill="#201a2e"/>
          <path d="M-2 -96 L6 -96 L2 -92Z" fill="#ff9eb4"/>
          ${sing ? '<ellipse cx="4" cy="-87" rx="6" ry="4" fill="#120d1e"/>' : '<path d="M2 -92 Q5 -85 13 -90" fill="none" stroke="#120d1e" stroke-width="2"/>'}
          <path d="M-23 -94 L-43 -97 M-23 -90 L-42 -88 M23 -95 L45 -100 M24 -91 L46 -91" stroke="#e6c3b0" stroke-width="1.4"/>
        </g>
      </g>
    </g>`;
}

function scene(shot, p, time, frame) {
  const step = time * Math.PI * 4;
  const sample = Math.floor(time * cues.sampleRateHz);
  const vocal = Math.max(...cues.tracks.vocals.slice(Math.max(0, sample - 2), sample + 1));
  const castActor = (index, pose) => actor(index, { time, vocal, mouth: mouthFrames[frame], ...pose });
  const footwork = (progress, distance, pace, direction) => ({
    travel: progress * distance, pace, direction, settle: ease((1 - progress) / .095),
  });
  const action = shots[shot].action;
  if (individual && action === 'arrival') {
    return [...arrivingCast].sort((a, b) => a.outside[1] - b.outside[1]).map(({ person, outside }) => {
      const [x, y, scale, distance] = outside;
      const travel = exteriorProgress(p);
      const walk = { ...footwork(travel, distance, 77, 1), settle: 1 };
      return castActor(person, {
        x: x + walk.travel, y: y - travel * 15, scale: scale - travel * .07, walk,
        phase: walk.travel / walk.pace * Math.PI * 2, stride: 14, tilt: 5 + travel * 4,
        gesture: person === 2 ? 23 : 8, vocal: 0,
      });
    }).join('');
  }
  if (individual && action === 'answer') {
    const cue = openingCueAt(time);
    const lead = cue?.singer ?? 2;
    const bounce = Math.sin((time - 5.06) / .5455 * Math.PI);
    const side = lead === 2 ? -1 : 1;
    const emphasis = cue?.lines.flat().reduce((level, [word, at]) => {
      const move = word === 'I' || word === 'you' || word.startsWith('want');
      const age = (time - at) / .34;
      return move && age >= 0 && age < 1 ? Math.max(level, Math.sin(age * Math.PI)) : level;
    }, 0) ?? 0;
    const advance = scaryApproach(time);
    const staging = arrivingCast.map(({ person, inside: [x, y, scale] }) => ({ person, x, y, scale }))
      .map((actor) => actor.person === 2
        ? { ...actor, y: actor.y + advance * 30, scale: actor.scale + advance * .28 }
        : actor);
    staging.push({ person: 3, ...gingerFinal });
    return doorBackdrop(1) + staging.sort((a, b) => a.y - b.y)
      .map(({ person, ...position }) => {
        const singing = person === lead;
        // Ginger faces left. Keep the hand nearest Scary low and put the
        // accent on the other arm, towards the open side of the frame.
        const arms = person === 3 ? (singing
          ? [[22 + emphasis * 31, 12 + emphasis * 32], [-6, 4 - emphasis * 12]]
          : [[9, 10], [-5, 6]])
          : person === 2 ? (singing
            ? [[14 + emphasis * 20, 11 + emphasis * 24], [-10 - emphasis * 19, -14 - emphasis * 20]]
            : [[8, 12], [-7, -8]])
            : undefined;
        return castActor(person, {
          ...position, arms, lead: singing, vocal: singing ? vocal : 0,
          gesture: singing ? 32 + emphasis * 71 : 11 + emphasis * 12,
          tilt: singing ? bounce * 3 + side * emphasis * 6 : -side * 3,
        });
      }).join('') + doorPanel(1);
  }
  if (!individual && shot === 0) {
    const enter = ease((p - 0.06) / (individual ? .76 : .58));
    const walk = footwork(enter, 490, 126, 1);
    return castActor(0, { x: lerp(100, 590, enter), y: lerp(359, 461, enter), scale: lerp(.64, individual ? 1.66 : 1.38, enter), stride: Math.sin(Math.PI * enter) * 22, phase: individual ? walk.travel / walk.pace * Math.PI * 2 : step * 1.4, tilt: individual ? 17 * Math.sin(enter * Math.PI) : 14, gesture: 35, walk });
  }
  if (!individual && shot === 1) {
    const brake = ease(p / .57);
    const advance = ease(p);
    const sidestep = individual ? Math.sin(Math.PI * ease((p - .34) / .66)) : 0;
    const sportyDistance = individual ? 463 : 405;
    const poshWalk = footwork(p, 376, 84, -1);
    const sportyWalk = footwork(advance, sportyDistance, 114, 1);
    const babyWalk = footwork(brake, 295, 108, -1);
    return castActor(4, { x: lerp(914, 538, p), y: 394, scale: .89, direction: -1, phase: step * .7, stride: 10, gesture: 18, walk: poshWalk })
      + castActor(0, { x: 205 + sportyDistance * advance, y: 449 - sidestep * 47, scale: 1.42 - sidestep * .21, phase: individual ? sportyWalk.travel / sportyWalk.pace * Math.PI * 2 : step * 1.35, stride: 20, tilt: 13 - sidestep * 23, gesture: sidestep * 72, walk: sportyWalk })
      + castActor(1, { x: lerp(845, 550, brake), y: 455, scale: 1.48, direction: -1, phase: individual ? babyWalk.travel / babyWalk.pace * Math.PI * 2 : step * 1.4, stride: Math.sin(brake * Math.PI) * 25, tilt: lerp(17, -12, brake), gesture: brake * 105, walk: babyWalk });
  }
  if (!individual && shot === 2) {
    const rush = ease(p / .78);
    const cover = ease((p - .74) / .25);
    if (cosplay) {
      return castActor(2, { x: lerp(502, 460, rush), y: lerp(458, individual ? 623 : 705, rush), scale: lerp(1.03, 3.48, rush), phase: step, stride: 10 * (1 - rush), tilt: -12, gesture: 125, sing: vocal > .22 })
        + `<circle cx="960" cy="540" r="${cover * 1120}" fill="#321923"/>`;
    }
    return actor(2, { x: lerp(502, 478, rush), y: lerp(458, 762, rush), scale: lerp(1.03, 3.15, rush), phase: step, stride: 10 * (1 - rush), tilt: -12, gesture: 125, sing: vocal > .22 })
      + `<g transform="translate(${lerp(876, 485, cover)} ${lerp(535, 267, cover)}) scale(${lerp(.05, 4.3, cover)}) rotate(-21)" opacity="${cover}"><rect x="-127" y="-28" width="165" height="56" rx="25" fill="#722f86"/><ellipse rx="79" ry="62" fill="#302737"/><ellipse cy="10" rx="37" ry="23" fill="#ed7cb0"/>${[-49, -15, 19, 53].map((x) => `<ellipse cx="${x}" cy="-36" rx="14" ry="20" fill="#ed7cb0"/>`).join('')}</g>`;
  }
  if ((!individual && shot === 3) || action === 'door') {
    if (individual) {
      const hit = 3.10;
      const after = time - hit;
      const windup = ease((after + .38) / .38);
      const kick = windup * (1 - ease(after / .25));
      const open = clamp(ease(after / .16) - .13 * Math.sin(after * 30) * ease(after / .1) * Math.exp(-Math.max(0, after) * 8));
      const run = ease((after - .04) / .86);
      const thresholdX = lerp(887, 610, ease(after / .56));
      const floorX = lerp(thresholdX, 610, ease((after - .10) / .57));
      const reaction = (delay) => {
        const age = after - delay;
        return age < 0 ? 0 : Math.sin(Math.PI * ease(age / .43));
      };
      const startled = [...arrivingCast].sort((a, b) => a.inside[1] - b.inside[1])
        .map(({ person, inside, outside, reactionDelay }) => {
        const [x, baseY, baseScale, distance] = inside;
        const advance = person === 2 ? scaryApproach(time) : 0;
        const y = baseY + advance * 30;
        const scale = baseScale + advance * .28;
        const arrive = interiorProgress(time);
        if (arrive < 1) {
          const phaseTravel = outside[3] + arrive * distance;
          const walk = { ...footwork(arrive, distance, 77, 1), travel: phaseTravel };
          return castActor(person, { x: x - distance + arrive * distance, y, scale, walk,
            phase: walk.travel / walk.pace * Math.PI * 2, stride: 14, tilt: lerp(9, 5, arrive), gesture: person === 2 ? 23 : 8, vocal: 0 });
        }
        const flinch = reaction(reactionDelay);
        const sidestep = (person === 0 ? -8 : 5) * flinch;
        const crouch = (person === 4 ? 4 : 7) * flinch;
        return castActor(person, {
          x: x + sidestep, y: y + crouch, scale, tilt: 5 - 25 * flinch,
          gesture: 22 + 96 * flinch, feet: [[-sidestep, -crouch], [-sidestep, -crouch]], vocal: 0,
        });
      }).join('');
      const ginger = castActor(3, {
        x: lerp(938, gingerFinal.x, run), y: lerp(408, gingerFinal.y, run), scale: lerp(.96, gingerFinal.scale, run),
        direction: -1, tilt: kick * 15, gesture: 18 + 95 * Math.max(kick, reaction(.25)),
        kick, phase: run * 4 * Math.PI,
        walk: footwork(run, 241, 104, -1),
      });
      return `<defs>
        <clipPath id="ginger-door-entrance"><path d="M${thresholdX} 189H947V500H${floorX}V401H${thresholdX}Z"/></clipPath>
      </defs>
      ${doorBackdrop(open)}
      ${startled}<g clip-path="url(#ginger-door-entrance)">${ginger}</g>
      ${doorPanel(open)}`;
    }
    const kick = Math.sin(Math.PI * clamp(p / .43));
    const travel = ease(p);
    return castActor(4, { x: 300, y: 411, scale: .86, tilt: 4, gesture: 39 })
      + castActor(2, { x: 597, y: 422, scale: .91, tilt: -8, gesture: 62 })
      + castActor(1, { x: 388, y: 435, scale: .94, tilt: -8, gesture: 74 })
      + castActor(0, { x: 500, y: 450, scale: 1.02, tilt: 9, gesture: 58 })
      + castActor(3, { x: lerp(875, 688, travel), y: 459, scale: 1.43, direction: -1, phase: kick * Math.PI * .44, stride: 48 * kick, jump: 23 * kick, tilt: -18 * kick, gesture: 72 * kick });
  }
  if (individual && fullVideo && time >= 18.53) {
    const fullShot = shots[shot];
    const performance = fullSceneActors(fullShot, time, vocal, mouthFrames[frame]);
    return `${performance.overlay}${performance.actors.map(({ index, ...pose }) => castActor(index, pose)).join('')}${performance.foreground}`;
  }
  if (individual) {
    const singer = openingCueAt(time)?.singer;
    return [0, 4, 1, 3, 2].map((index) => {
      const dance = openingDance(index, time);
      return castActor(index, {
        ...dance,
        x: [143, 309, 480, 651, 817][index] + dance.x,
        y: [399, 412, 436, 412, 399][index] + dance.y,
        scale: 1.41 + (2 - Math.abs(index - 2)) * .11,
        lead: index === singer, vocal: index === singer ? vocal : 0,
      });
    }).join('');
  }
  return [0, 4, 1, 3, 2].map((index) => {
    const settle = ease(p * 4);
    const pose = ease((p - (individual ? .86 : .79)) * 8);
    const track = individual ? [143, 309, 480, 651, 817][index] : [211, 344, 480, 616, 749][index];
    const beat = (time - (individual ? 5.06 : shots[4].start)) / .5455;
    const phase = beat * Math.PI + (index % 2) * Math.PI;
    const leadIn = individual ? ease(p * 4) : settle;
    const accent = individual ? Math.max(0, 1 - (beat % 1) * 3) : 0;
    return castActor(index, {
      x: track + (index - 2) * (individual ? 6 : 42) * (1 - leadIn) + Math.sin(phase) * (individual ? 8 : 11) * (1 - pose),
      y: [399, 412, 436, 412, 399][index],
      scale: (individual ? 1.41 : 1.08) + (2 - Math.abs(index - 2)) * .11,
      phase, stride: (individual ? 10 : 15) * (1 - pose), lead: individual && index === openingCueAt(time)?.singer,
      tilt: Math.sin(phase) * 11 * (1 - pose) + (index - 2) * 5 * pose,
      gesture: lerp(46 + Math.cos(phase + index * .66) * 38 + accent * 31, [116, 65, 135, 110, 40][index], pose),
    });
  }).join('');
}

await mkdir(`${root}/previews`, { recursive: true });
const coverFrame = individual ? await sharp(cover).resize(width, height, { fit: 'fill' })
  .removeAlpha().raw().toBuffer() : null;
const backgroundCache = new Map();
const backgrounds = await Promise.all(shots.map(({ source, zoom, camera }) => {
  const key = `${source}|${zoom}|${camera?.zoom ?? 1}`;
  if (!backgroundCache.has(key)) {
    const scaledWidth = Math.round(width * zoom * (camera?.zoom ?? 1));
    const scaledHeight = Math.round(height * zoom * (camera?.zoom ?? 1));
    backgroundCache.set(key, sharp(source).resize(scaledWidth, scaledHeight)
      .modulate({ brightness: .75, saturation: .86 })
      .raw().toBuffer({ resolveWithObject: true }));
  }
  return backgroundCache.get(key);
}));
const doorPlate = backgrounds[shots.findIndex(({ action }) => action === 'door')];
const renderScale = width / 960;
const doorArt = individual ? (await sharp(doorPlate.data, { raw: doorPlate.info })
  .extract({
    left: doorPlate.info.width - width + Math.round(882 * renderScale),
    top: Math.round((doorPlate.info.height - height) * .55) + Math.round(178 * renderScale),
    width: Math.round(69 * renderScale),
    height: Math.round(235 * renderScale),
  }).png().toBuffer()).toString('base64') : '';
const definitionsByActor = individual ? rig.map((_, index) => individualDefinitions(rig, `#person-${index}-body`)) : [];

const frameRange = process.argv.find((arg) => arg.startsWith('--frames='))?.slice(9).split(':').map(Number);
const [firstFrame, endFrame] = frameRange ?? [0, Math.ceil(duration * fps)];
const encoder = spawn('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', `${width}x${height}`,
  '-framerate', String(fps), '-i', 'pipe:0',
  ...(frameRange ? ['-an'] : [
    '-i', audio, '-map', '0:v', '-map', '1:a:0',
    ...(coverSeconds ? ['-af', `adelay=${coverSeconds * 1000}|${coverSeconds * 1000}`] : []),
    '-c:a', 'aac', '-b:a', '160k', '-shortest',
  ]),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18',
  ...(frameRange ? ['-threads', '2', '-preset', 'veryfast'] : []),
  '-movflags', '+faststart', output,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const encoderDone = once(encoder, 'close');
let lastPixels = null;
let transitionPixels = null;
let currentShotIndex = -1;
let transitionStartedAt = -1;
// Short background-only dissolves smooth scene changes without ghosting the
// performers or dragging the edit between musical phrases.
const dissolveFrames = 6;

for (let frame = Math.max(0, firstFrame - dissolveFrames - 1); frame < endFrame; frame += 1) {
  const outputTime = frame / fps;
  const time = outputTime - coverSeconds;
  if (coverFrame && time < 0) {
    if (frame >= firstFrame && !encoder.stdin.write(coverFrame)) await once(encoder.stdin, 'drain');
    lastPixels = coverFrame;
    continue;
  }
  const contentFrame = frame - Math.round(coverSeconds * fps);
  const i = shots.findIndex(({ end }) => time < end);
  if (i !== currentShotIndex) {
    // Keep an immutable backdrop snapshot so dancers never double during a
    // scene dissolve. The silent cover cuts cleanly into the first shot.
    transitionPixels = currentShotIndex >= 0 && lastPixels ? Buffer.from(lastPixels) : null;
    transitionStartedAt = frame;
    currentShotIndex = i;
  }
  const shot = shots[i];
  const p = (time - shot.start) / (shot.end - shot.start);
  const markup = scene(i, p, time, contentFrame);
  const camera = shot.camera;
  const picture = camera
    ? `<g transform="translate(480 270) scale(${camera.zoom}) translate(${-camera.x} ${-camera.y})">${markup}</g>`
    : markup;
  const lyricContrast = camera ? `<defs><linearGradient id="lyric-light" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#120b1e" stop-opacity=".57"/><stop offset="1" stop-color="#120b1e" stop-opacity="0"/></linearGradient></defs>
    <rect width="960" height="115" fill="url(#lyric-light)"/>` : '';
  const art = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 960 540">
  ${rig ? `<defs>${individual ? definitionsByActor.filter((_, index) => markup.includes(`#person-${index}-`)).join('') : cosplayDefinitions(rig, markup)}</defs>` : ''}
  <defs><linearGradient id="rainbow" x1="0" y1="0" x2=".64" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#ff5364"/><stop offset=".22" stop-color="#ff9845"/><stop offset=".39" stop-color="#ffda55"/><stop offset=".53" stop-color="#64d384"/><stop offset=".69" stop-color="#42c3ed"/><stop offset=".83" stop-color="#7551d5"/><stop offset="1" stop-color="#e965bd"/></linearGradient></defs>
  ${picture}${lyricContrast}</svg>`;
  const { data, info } = backgrounds[i];
  const cameraDrift = fullVideo && i >= openingShots.length
    ? Math.sin(p * Math.PI * 2 + i * .71) * (shot.action === 'solo' ? .07 : .12)
    : 0;
  const panX = clamp(shot.x + cameraDrift);
  const crop = await sharp(data, { raw: info }).extract({
    left: camera ? Math.round(((shot.zoom - 1) * width + camera.x * width / 960) * camera.zoom - width / 2)
      : Math.round((info.width - width) * (i === 0 ? lerp(shot.x, .45, ease(p)) : panX)),
    top: camera ? Math.round(((shot.zoom - 1) * height * .55 + camera.y * height / 540) * camera.zoom - height / 2)
      : Math.round((info.height - height) * .55),
    width, height,
  }).raw().toBuffer();
  const dissolveAge = frame - transitionStartedAt;
  if (transitionPixels && dissolveAge >= 0 && dissolveAge < dissolveFrames) {
    const t = clamp((dissolveAge + 1) / dissolveFrames);
    const currentWeight = t * t * (3 - 2 * t);
    const mixed = Buffer.allocUnsafe(crop.length);
    for (let channel = 0; channel < crop.length; channel += 1) {
      mixed[channel] = Math.round(
        transitionPixels[channel] * (1 - currentWeight) + crop[channel] * currentWeight,
      );
    }
    crop.set(mixed);
  }
  lastPixels = crop;
  if (frame < firstFrame) continue;
  const pixels = await sharp(crop, { raw: { width, height, channels: info.channels } })
    .composite([{ input: Buffer.from(art) }]).removeAlpha().raw().toBuffer();
  if (!encoder.stdin.write(pixels)) await once(encoder.stdin, 'drain');
}

encoder.stdin.end();
const [exitCode] = await encoderDone;
if (exitCode !== 0) throw new Error(`FFmpeg terminó con código ${exitCode}`);
