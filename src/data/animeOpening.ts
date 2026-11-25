export const ANIME_TITLE = 'フロンティ、夜を駆けろ！';
export const ANIME_AUDIO = '/assets/anime/audio/tone-deaf-take-2.mp3';
export const ANIME_DURATION = 114.4;

type Lyric = readonly [japanese: string, english: string, spanish: string];
type Subtitle = readonly [start: number, end: number, ...Lyric];

const chorus: readonly Lyric[] = [
  ['駆けろ、駆けろ、フロンティ！', 'Run, run, Frontie!', '¡Corre, corre, Frontie!'],
  ['火花散らして　夜を裂け', 'Send sparks flying and tear through the night.', 'Haz saltar chispas y rasga la noche.'],
  ['つなげ、つなげ、フロントライン！', 'Link it up, link it up, Front-Line!', '¡Conecta, conecta, Front-Line!'],
  ['肩を並べて　壁を越えろ', 'Over the wall, shoulder to shoulder.', 'Salta el muro, hombro con hombro.'],
  ['君の一歩が　朝を呼ぶ', 'One step from you brings the dawn.', 'Un paso tuyo trae el amanecer.'],
  ['眠った街に　光が走る', 'Light races through the sleeping city.', 'La luz recorre la ciudad dormida.'],
  ['駆けろ、駆けろ、フロンティ！', 'Run, run, Frontie!', '¡Corre, corre, Frontie!'],
];

function timeChorus(timing: readonly (readonly [number, number])[], ending: Lyric): Subtitle[] {
  return timing.map(([start, end], i) => [start, end, ...(chorus[i] ?? ending)]);
}

export const animeSubtitles: readonly Subtitle[] = [
  [0.23, 3.09, '午前零時　赤いモニター', 'Midnight. The monitor glows red.', 'Medianoche. El monitor brilla en rojo.'],
  [3.1, 5.29, '眠れないのは　僕らだけ？', 'Are we the only ones still awake?', '¿Somos los únicos que seguimos despiertos?'],
  [5.35, 7.89, '画面の向こう　返事は来ない', 'No reply from the other side of the screen.', 'Al otro lado de la pantalla no hay respuesta.'],
  [7.89, 11.28, '途切れた線を　つなぎ直す', 'We reconnect the broken line.', 'Volvemos a conectar la línea cortada.'],
  [11.34, 13.7, 'モックが返す　仮の答え', 'The mock sends back a stand-in reply.', 'El mock devuelve una respuesta provisional.'],
  [13.7, 16.11, '止まったテストが　また走る', 'The stalled tests run again.', 'Las pruebas que se habían parado vuelven a correr.'],
  [16.19, 18.88, 'どのチームも　自分で進めるよう', 'So every team can move forward on its own,', 'Para que cada equipo pueda avanzar por su cuenta,'],
  [18.88, 22.98, '見えないところで　橋を架ける', 'we build the bridge behind the scenes.', 'tendemos un puente entre bastidores.'],
  ...timeChorus([[23.04,26.5],[26.5,29.11],[29.12,31.83],[31.83,34.39],[34.45,37.09],[37.09,39.77],[39.82,42.15],[42.15,44.83]], ['この先は　君の番だ！', 'Now it’s your turn!', '¡Ahora te toca a ti!']),
  [45.03, 49.23, '共通ライブラリに　足した一行', 'One line added to a shared library.', 'Una línea más en una librería compartida.'],
  [49.23, 54.96, 'いくつもの画面が　光り出す', 'Screens everywhere light up.', 'Se encienden pantallas por todas partes.'],
  [55.03, 59.33, 'ひとつずつ　画面をエム・エフ・イーへ', 'We migrate screens to M-F-E, one by one.', 'Migramos las pantallas a MFE, una a una.'],
  [59.33, 65.34, 'リリースの夜も　灯りは消さない', 'We keep the lights on through release night.', 'La noche del despliegue seguimos con las luces encendidas.'],
  [65.48, 67.84, 'もうダメだって　うつむいたら', 'Just as I hang my head in defeat,', 'Justo cuando agacho la cabeza y me doy por vencido,'],
  [67.84, 70.38, 'キーボードに　黒い肉球', 'a black paw lands on the keys.', 'una pata negra cae sobre el teclado.'],
  [70.48, 75.43, '「もう一回！」って　君が鳴く', '“One more try!” you meow.', '«¡Una vez más!», maúllas.'],
  [75.43, 80.91, '虹色の毛先が　光り出す', 'Your rainbow crest lights up.', 'Se ilumina tu cresta arcoíris.'],
  ...timeChorus([[80.92,83.42],[83.42,86.13],[86.15,88.69],[88.69,91.34],[91.42,93.86],[93.86,96.35],[96.37,99.13],[99.13,102.35]], ['ここからが　始まりだ！', 'This is where it all begins!', '¡Aquí empieza todo!']),
];

export type AnimeEffect = 'monitor' | 'rain' | 'run' | 'cables' | 'spark' | 'origami' | 'train' | 'gate' | 'splash' | 'slash' | 'still' | 'manga' | 'orb' | 'release' | 'sun' | 'gear' | 'kira' | 'nimbus' | 'shoujo';

type Shot = readonly [start: number, image: string, effect: AnimeEffect, anchor?: number];

export const animeShots: readonly Shot[] = [
  [0, 'monitor', 'monitor', 40],
  [1.66, 'typing', 'monitor'],
  [3.08, 'eyes', 'monitor', 50],
  [5.33, 'train', 'train'],
  [6.77, 'cast-console', 'cables', 35],
  [7.85, 'sailor-moon', 'shoujo'],
  [9.55, 'cable-touch', 'spark'],
  [11.31, 'origami', 'origami', 47],
  [12.62, 'cast-origami', 'origami', 34],
  [13.69, 'rail', 'rain', 43],
  [14.9, 'tracks', 'train'],
  [16.16, 'cast-gate', 'gate', 36],
  [17.65, 'tower', 'cables'],
  [18, 'team-prank', 'still'],
  [22, 'team-prank-reaction', 'still'],
  [23.02, 'splash', 'splash', 42],
  [24.59, 'puddle', 'rain'],
  [26.45, 'sword-draw', 'rain', 43],
  [27.85, 'nani-mo-nakatta', 'manga'],
  [29.54, 'cast-roof', 'rain', 41],
  [30.38, 'crest', 'spark', 40],
  [31.07, 'gear-five-manga', 'manga', 45],
  [31.82, 'gear-five', 'gear', 45],
  [33.7, 'golden-swing', 'cables'],
  [34.42, 'dawn-eye', 'sun', 40],
  [35.98, 'rasengan', 'orb'],
  [38.22, 'first-light', 'sun'],
  [40.24, 'gantry', 'run'],
  [42.15, 'cast-mentor', 'gate'],
  [44.65, 'swordsman', 'rain', 37],
  [45.85, 'three-crescents', 'slash'],
  [49.52, 'silence', 'still', 43],
  [50.63, 'kira', 'kira'],
  [53.04, 'nimbus', 'nimbus'],
  [55.02, 'transit-open', 'gate'],
  [56.74, 'vortex-dive', 'release', 36],
  [58.6, 'intersection', 'train'],
  [59.81, 'arrancar', 'still'],
  [61.36, 'breaker', 'spark', 41],
  [64.02, 'grip', 'still', 40],
  [65.46, 'tired', 'still', 40],
  [67.8, 'paw', 'spark'],
  [70.43, 'worry-profile', 'monitor', 37],
  [72.14, 'key-strike', 'spark'],
  [74.68, 'gold-crane', 'origami', 34],
  [75.43, 'crest-ignites', 'spark', 38],
  [77.7, 'tail-copter', 'run'],
  [80.89, 'distant-orb', 'orb', 38],
  [83.39, 'spirit-bomb', 'orb'],
  [87.5, 'energy-flight', 'run', 47],
  [88.65, 'rain-blade', 'slash', 48],
  [90.16, 'combat-land', 'splash', 39],
  [91.37, 'light-launch', 'release', 45],
  [93.84, 'team-dawn-cel', 'sun', 48],
  [96.34, 'cardcaptor-sakura', 'shoujo'],
  [98.0, 'sunrise-city', 'sun'],
  [99.1, 'gold-roof', 'sun', 48],
  [102.37, 'titan-breach', 'still'],
  [106.0, 'morning-train', 'sun', 41],
  [107.7, 'quiet-desk', 'monitor', 39],
  [110.33, 'red-power', 'monitor', 40],
];
