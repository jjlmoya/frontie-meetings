import { animeSubtitles } from './animeOpening';
import cues from './animeAnimationCues.json';

const readings: Record<string, string> = {
  '午前零時　赤いモニター': '午前零時:ごぜんれいじ 赤い:あかい モニター:もにたー',
  '眠れないのは　僕らだけ？': '眠れないのは:ねむれないのは 僕ら:ぼくら だけ？:だけ',
  '画面の向こう　返事は来ない': '画面の:がめんの 向こう:むこう 返事は:へんじは 来ない:こない',
  '途切れた線を　つなぎ直す': '途切れた:とぎれた 線を:せんを つなぎ直す:つなぎなおす',
  'モックが返す　仮の答え': 'モックが:もっくが 返す:かえす 仮の:かりの 答え:こたえ',
  '止まったテストが　また走る': '止まった:とまった テストが:てすとが また:また 走る:はしる',
  'どのチームも　自分で進めるよう': 'どの:どの チームも:ちーむも 自分で:じぶんで 進めるよう:すすめるよう',
  '見えないところで　橋を架ける': '見えない:みえない ところで:ところで 橋を:はしを 架ける:かける',
  '駆けろ、駆けろ、フロンティ！': '駆けろ、:かけろ 駆けろ、:かけろ フロンティ！:ふろんてぃ',
  '火花散らして　夜を裂け': '火花:ひばな 散らして:ちらして 夜を:よるを 裂け:さけ',
  'つなげ、つなげ、フロントライン！': 'つなげ、:つなげ つなげ、:つなげ フロントライン！:ふろんとらいん',
  '肩を並べて　壁を越えろ': '肩を:かたを 並べて:ならべて 壁を:かべを 越えろ:こえろ',
  '君の一歩が　朝を呼ぶ': '君の:きみの 一歩が:いっぽが 朝を:あさを 呼ぶ:よぶ',
  '眠った街に　光が走る': '眠った:ねむった 街に:まちに 光が:ひかりが 走る:はしる',
  'この先は　君の番だ！': 'この先は:このさきは 君の:きみの 番だ！:ばんだ',
  '共通ライブラリに　足した一行': '共通:きょうつう ライブラリに:らいぶらりに 足した:たした 一行:いちぎょう',
  'いくつもの画面が　光り出す': 'いくつもの:いくつもの 画面が:がめんが 光り出す:ひかりだす',
  'ひとつずつ　画面をエム・エフ・イーへ': 'ひとつずつ:ひとつずつ 画面を:がめんを エム・エフ・イーへ:えむえふいーへ',
  'リリースの夜も　灯りは消さない': 'リリースの:りりーすの 夜も:よるも 灯りは:あかりは 消さない:けさない',
  'もうダメだって　うつむいたら': 'もう:もう ダメだって:だめだって うつむいたら:うつむいたら',
  'キーボードに　黒い肉球': 'キーボードに:きーぼーどに 黒い:くろい 肉球:にくきゅう',
  '「もう一回！」って　君が鳴く': '「もう一回！」って:もういっかいって 君が:きみが 鳴く:なく',
  '虹色の毛先が　光り出す': '虹色の:にじいろの 毛先が:けさきが 光り出す:ひかりだす',
  'ここからが　始まりだ！': 'ここからが:ここからが 始まりだ！:はじまりだ',
};

const splitMoras = (kana: string) => kana.match(/.[ゃゅょぁぃぅぇぉゎ]?/gu) ?? [];
const vocal = cues.tracks.vocals;

// Word boundaries from the isolated vocal of the selected karaoke take.
const wordStarts: Record<number, readonly number[]> = {
  0.23: [1.76, 2.41],
  3.1: [4.59, 4.95],
  5.35: [5.87, 6.39, 7.25],
  7.89: [9.32, 9.8],
  11.34: [11.74, 12.6, 13.34],
  13.7: [14.54, 15.34, 15.74],
  16.19: [16.58, 17.44, 17.99],
  18.88: [19.93, 20.98, 21.5],
  26.5: [26.82, 27.8, 28.12],
  29.12: [29.57, 30.26],
  31.83: [32.52, 33.03, 33.72],
  34.45: [34.92, 36.13, 36.61],
  37.09: [38.31, 38.79, 39.27],
  42.15: [43.51, 44.19],
  45.03: [45.58, 47.56, 48.55],
  49.23: [51.62, 53.06],
  55.03: [56.56, 57.73],
  59.33: [61.23, 62.06, 63.74],
  65.48: [65.83, 66.74],
  67.84: [69.3, 70.03],
  70.48: [73.14, 73.9],
  75.43: [77.34, 79.25],
  83.42: [83.76, 84.8, 85.14],
  86.15: [86.57, 87.22],
  88.69: [89.34, 89.96, 90.77],
  91.42: [91.86, 92.97, 93.41],
  93.86: [94.97, 95.41, 95.85],
  99.13: [100.47],
};

const hookMoras: Record<number, readonly number[]> = {
  23.04: [23.04, 23.4, 23.58, 23.76, 24.3, 24.48, 24.66, 25.2, 25.38, 26.1],
  39.82: [39.82, 40.17, 40.28, 40.47, 40.72, 40.83, 40.94, 41.28, 41.39, 41.84],
  80.92: [80.92, 81.28, 81.4, 81.55, 81.89, 82, 82.18, 82.49, 82.61, 83.16],
  96.37: [96.37, 96.77, 96.9, 97.03, 97.42, 97.55, 97.68, 98.08, 98.21, 98.75],
};

function alignBoundary(target: number, window: number, minTime: number, maxTime: number) {
  let best = Math.max(minTime, Math.min(maxTime, target));
  let rank = -Infinity;
  const rate = cues.sampleRateHz;
  const from = Math.ceil(Math.max(minTime, target - window) * rate);
  const to = Math.floor(Math.min(maxTime, target + window) * rate);

  for (let i = from; i <= to; i++) {
    const before = (vocal[i - 2] ?? 0) * 0.6 + (vocal[i - 1] ?? 0) * 0.4;
    const after = (vocal[i] ?? 0) * 0.3 + (vocal[i + 1] ?? 0) * 0.7;
    const distance = Math.abs(i / rate - target);
    const score = (after - before) * 0.75 - (distance / window) * 0.24;
    if (score > rank) {
      rank = score;
      best = i / rate;
    }
  }
  return best;
}

export const animeKaraoke = animeSubtitles.map(([start, end, japanese]) => {
  let offset = 0;
  const groups = (readings[japanese] ?? '').split(' ').filter(Boolean).map((entry) => {
    const [text, kana] = entry.split(':');
    const moras = splitMoras(kana);
    const first = offset;
    offset += moras.length;
    return { text, moras, first };
  });

  const hook = hookMoras[start];
  if (hook?.length === offset) return { groups, begins: hook };

  const anchors = [start, ...(wordStarts[start] ?? []), end];
  const timedGroups = anchors.length === groups.length + 1 ? groups : [{ moras: groups.flatMap(({ moras }) => moras) }];
  const begins = timedGroups.flatMap(({ moras }, groupIndex) => {
    const from = anchors[groupIndex];
    const to = timedGroups.length === 1 ? end : anchors[groupIndex + 1];
    const duration = to - from;
    const weights = moras.map((mora, i) => i === moras.length - 1 && groupIndex === timedGroups.length - 1
      ? 1.48 : mora === 'っ' ? 0.68 : 1);
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    const window = Math.min(0.095, duration / moras.length * 0.42);
    const step = Math.min(0.037, duration / moras.length * 0.6);
    const positions = [from];
    let weight = 0;
    for (let i = 1; i < moras.length; i++) {
      weight += weights[i - 1];
      const target = from + duration * (weight / weightSum);
      positions.push(alignBoundary(target, window, positions[i - 1] + step, to - (moras.length - i) * step));
    }
    return positions;
  });

  return { groups, begins };
});
