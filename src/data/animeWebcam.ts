import { animeShots } from './animeOpening';
import { animeKaraoke } from './animeKaraoke';

export type FrontieViseme = 'rest' | 'small' | 'a' | 'e' | 'i' | 'o' | 'u';

type Reaction = 'focus' | 'eager' | 'stunned' | 'ecstatic' | 'sinister' | 'flight' | 'bracing' | 'unhinged' | 'spent';

const sceneReactions: Record<string, readonly [Reaction, number, number]> = {
  splash: ['eager', 2.2, 0.48],
  'nani-mo-nakatta': ['stunned', 2.42, 0.78],
  'gear-five': ['ecstatic', 2.7, 0.94],
  kira: ['sinister', 2.41, 0.59],
  nimbus: ['flight', 2.95, 0.9],
  'worry-profile': ['bracing', 4.1, 0.68],
  'crest-ignites': ['eager', 4.4, 0.8],
  'distant-orb': ['unhinged', 2.57, 1],
  'energy-push': ['unhinged', 5.18, 1],
  'team-dawn': ['ecstatic', 4.6, 0.94],
  'bridge-light': ['eager', 0.8, 0.48],
  'golden-door': ['spent', 9.5, 0.49],
};

const events = animeShots.flatMap(([at, image]) => {
  const reaction = sceneReactions[image];
  return reaction ? [{ at, mood: reaction[0], duration: reaction[1], strength: reaction[2] }] : [];
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
  const spring = event ? Math.sin(elapsed * 22) * Math.exp(-elapsed * (stunned ? 3.9 : 2.7)) : 0;
  const bounce = Math.sin(time * (frenzy ? 17 : 9)) * (hype + band * 0.7);
  const raise = mood === 'ecstatic' || frenzy ? clamp(Math.sin(Math.PI * phase) * 1.35) : 0;
  const blink = blinks.some((begin) => time >= begin && time < begin + (spent ? 0.24 : frenzy ? 0.078 : 0.123));
  const bank = flying ? Math.sin(phase * Math.PI * 2) * 4.3 : 0;
  const slump = spent ? 2.5 + phase * 2 : bracing ? 2.2 + Math.sin(Math.PI * phase) * 1.8 : 0;

  return {
    mood,
    blink: reduced ? false : blink,
    heat: reduced ? 0 : hype,
    x: reduced ? 0 : Math.sin(time * 4.9) * hype * 1.9 + spring * 3.2 + bank,
    y: reduced ? 0 : (stunned ? -accent * 1.6 : bounce * -1.9) - vocal * 0.8 + slump,
    rotate: reduced ? 0 : Math.sin(time * 6.7) * hype * (frenzy ? 3.2 : 1.2) + spring * 4.8 + bank * 0.73,
    scale: reduced ? 1 : 1 + accent * (stunned ? 0.13 : 0.16) + hype * 0.028 + spring * (frenzy ? 0.07 : 0.042),
    squish: reduced ? 1 : 1 + (bounce * 0.011 - spring * 0.038),
    glow: reduced ? 0 : clamp(hype * 0.47 + accent * 0.23 + band * 0.14),
    paws: reduced ? 0 : raise,
    goggleX: reduced ? 0 : stunned ? Math.sin(time * 12) * 2.8 : Math.sin(time * 3.25) * (2.5 + hype * 5),
  };
}
