import { animeShots } from './animeOpening';
import { animeKaraoke } from './animeKaraoke';

export type FrontieViseme = 'rest' | 'small' | 'a' | 'e' | 'i' | 'o' | 'u';

type Reaction = 'focus' | 'eager' | 'stunned' | 'ecstatic' | 'sinister' | 'flight' | 'bracing' | 'unhinged' | 'spent';

const sceneReactions: Record<string, readonly [Reaction, number, number]> = {
  splash: ['eager', 2.2, 0.48],
  'nani-mo-nakatta': ['stunned', 2.42, 0.78],
  'gear-five-manga': ['ecstatic', 2.7, 0.94],
  kira: ['sinister', 2.41, 0.59],
  nimbus: ['flight', 2.95, 0.9],
  'worry-profile': ['bracing', 4.1, 0.68],
  'crest-ignites': ['eager', 4.4, 0.8],
  'distant-orb': ['unhinged', 2.57, 1],
  'spirit-bomb': ['unhinged', 5.18, 1],
  'team-dawn': ['ecstatic', 4.6, 0.94],
  'team-prank': ['ecstatic', 5.02, 0.72],
  'titan-breach': ['stunned', 3.63, 0.76],
};

const events = animeShots.flatMap(([at, image]) => {
  const reaction = sceneReactions[image];
  return reaction ? [{ at, image, mood: reaction[0], duration: reaction[1], strength: reaction[2] }] : [];
});

const vowelFamilies: readonly (readonly [FrontieViseme, string])[] = [
  ['a', 'あかがさざただなはばぱまやゃらわぁ'],
  ['e', 'えけげせぜてでねへべぺめれぇ'],
  ['i', 'いきぎしじちぢにひびぴみりぃ'],
  ['o', 'おこごそぞとどのほぼぽもよょろをぉ'],
  ['u', 'うくぐすずつづぬふぶぷむゆゅるぅ'],
];

const phonemes = animeKaraoke.map(({ groups }) => {
  let previous: FrontieViseme = 'small';
  return groups.flatMap(({ moras }) => moras.map((mora) => {
    const character = mora.at(-1) ?? '';
    const vowel: FrontieViseme = character === 'ー' ? previous
      : vowelFamilies.find(([, family]) => family.includes(character))?.[0] ?? 'small';
    previous = vowel;
    return vowel;
  }));
});

export function webcamViseme(line: number, syllable: number, vocal: number, current: FrontieViseme): FrontieViseme {
  if (vocal < (current === 'rest' ? 0.22 : 0.14)) return 'rest';
  const vowel = phonemes[line]?.[syllable] ?? 'small';
  if (vocal > 0.53 && (vowel === 'small' || vowel === 'u')) return 'o';
  return vowel;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const blinks = [2.5, 6.8, 10.1, 15.7, 20.2, 25.1, 30.02, 38.2, 42.5, 47.43, 50.71,
  52.16, 56.5, 60.13, 64.55, 69.05, 74.4, 79.61, 87.02, 90.35, 97.4, 103.05, 105.72, 109.95];

export function animeWebcamFrame(time: number, vocal: number, band: number, reduced: boolean) {
  const event = events.findLast(({ at, duration }) => time >= at && time < at + duration);
  const elapsed = event ? time - event.at : 0;
  const phase = event ? elapsed / event.duration : 0;
  const buildup = time < 102.4 ? 0.13 + clamp(time / 100) ** 1.32 * 0.7 : 0.72 * clamp(1 - (time - 102.4) / 10) + 0.13;
  const accent = event ? event.strength * (0.35 + Math.sin(Math.PI * phase) * 0.65) : 0;
  const hype = clamp(buildup + accent * 0.5);
  const mood: Reaction = event?.mood ?? (time >= 102.4 ? 'spent' : time > 76 ? 'eager' : 'focus');
  const stunned = mood === 'stunned' || mood === 'sinister';
  const frenzy = mood === 'unhinged';
  const flying = mood === 'flight';
  const bracing = mood === 'bracing';
  const spent = mood === 'spent';
  const frozen = mood === 'stunned' && elapsed < 1.38;
  const spring = event && !frozen ? Math.sin(elapsed * 22) * Math.exp(-elapsed * (stunned ? 3.9 : 2.7)) : 0;
  const bounce = Math.sin(time * (frenzy ? 17 : 9)) * (hype + band * 0.7);
  const raise = mood === 'ecstatic' || frenzy ? clamp(Math.sin(Math.PI * phase) * 1.35) : 0;
  const blink = !frozen && blinks.some((begin) => time >= begin && time < begin + (spent ? 0.24 : frenzy ? 0.078 : 0.123));
  const bank = flying ? Math.sin(phase * Math.PI * 2) * 4.3 : 0;
  const slump = spent ? 2.5 + phase * 2 : bracing ? 2.2 + Math.sin(Math.PI * phase) * 1.8 : 0;
  const isGear = event?.image === 'gear-five-manga';
  const lean = isGear ? clamp((elapsed - 0.22) / 0.47) * clamp((1.1 - elapsed) / 0.35) : 0;
  const hitAge = isGear ? elapsed - 0.67 : -1;
  const hit = hitAge >= 0 ? Math.exp(-hitAge * 10) : 0;
  const eyeAge = isGear ? elapsed - 0.89 : -1;
  const eyeStretch = eyeAge < 0 ? 0 : eyeAge < 0.23
    ? 1.05 * (1 - (1 - eyeAge / 0.23) ** 3)
    : eyeAge < 0.89 ? 1 + 0.07 * Math.cos((eyeAge - 0.23) * 13)
      : Math.max(0, 1 - (eyeAge - 0.89) / 0.4) ** 1.4;
  const reflection = isGear ? 'moon' : mood === 'sinister' ? 'red' : flying ? 'gold' : frenzy ? 'ki' : 'none';
  const lens = reflection === 'none' ? 0 : clamp(Math.sin(Math.PI * phase) * 1.32 + hit * 0.32);

  return {
    mood,
    blink: reduced ? false : blink,
    heat: reduced ? 0 : hype,
    x: reduced || frozen ? 0 : Math.sin(time * 4.9) * hype * (frenzy ? 3.1 : 1.9) + spring * 3.2 + bank + lean * 12,
    y: reduced || frozen ? 0 : (stunned ? -accent * 1.6 : bounce * -1.9) - vocal * 0.8 + slump + lean * 12,
    rotate: reduced || frozen ? 0 : Math.sin(time * 6.7) * hype * (frenzy ? 5.1 : 1.2) + spring * 4.8 + bank * 0.73 + lean * 23,
    scale: reduced ? 1 : frozen ? 1.08 : 1 + accent * (stunned ? 0.13 : 0.16) + hype * 0.028 + spring * (frenzy ? 0.07 : 0.042) + lean * 0.07,
    squish: reduced || frozen ? 1 : 1 + (bounce * 0.011 - spring * 0.038),
    glow: reduced ? 0 : clamp(hype * 0.47 + accent * 0.23 + band * 0.14),
    paws: reduced ? 0 : raise,
    goggleX: reduced || frozen ? 0 : stunned ? Math.sin(time * 12) * 2.8 : Math.sin(time * 3.25) * (2.5 + hype * 5),
    reflection,
    lens: reduced ? lens * 0.35 : lens,
    lensSweep: reduced ? 0 : (phase * 2 - 1) * (flying ? 145 : 58),
    hit: reduced ? 0 : hit,
    cameraKick: reduced ? 0 : Math.cos(hitAge * 36) * hit,
    eyeStretch: reduced ? 0 : eyeStretch,
  };
}

export const KIRA_FINAL_STROKE = 52.74;
const letterStrike = 54.04;
const singingReturns = 54.44;

export function deathNoteWebcamFrame(time: number, reduced: boolean) {
  if (reduced || time < KIRA_FINAL_STROKE || time >= singingReturns) return null;

  const smooth = (value: number) => {
    const p = clamp(value);
    return p * p * (3 - 2 * p);
  };

  // The final pen stroke, knockout and letter strike stay tied to the master clock.
  const elapsed = time - KIRA_FINAL_STROKE;
  const recoil = Math.sin(elapsed * 31) * Math.exp(-elapsed * 9);
  const drop = smooth((elapsed - .18) / .36);
  const rise = smooth((time - 53.76) / .59);
  const down = drop * (1 - rise);
  const strikeAge = time - letterStrike;
  const anticipation = smooth((strikeAge + .28) / .28);
  const hit = strikeAge < 0 ? 0 : Math.exp(-strikeAge * 16);
  const fist = strikeAge < 0 ? anticipation : 1 - smooth(strikeAge / .32);
  const phase = elapsed < .19 ? 'shock' : elapsed < .55 ? 'fall' :
    time < 53.36 ? 'down' : strikeAge < 0 ? 'letter' : 'return';

  return {
    phase,
    x: recoil * 3 - down * 15 + hit * 5,
    y: recoil * -2 + down * 87 - hit * 1.5,
    tilt: recoil * 5 + down * 39 - hit * 13,
    clutch: smooth(elapsed / .075) * (1 - smooth((elapsed - .27) / .21)),
    red: Math.exp(-elapsed * 9.4) * .72,
    ecg: smooth((elapsed - .16) / .12) * (1 - smooth((time - 53.37) / .15)),
    letter: smooth((time - 53.36) / .14) * (1 - smooth(strikeAge / .32)),
    punch: fist,
    fracture: smooth(strikeAge / .30),
    hit,
  };
}
