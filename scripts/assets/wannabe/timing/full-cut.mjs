const places = {
  hall: 'hotel-mirror-gallery-v1.png',
  elevator: 'hotel-elevator-foyer-v1.png',
  lobby: 'hotel-grand-lobby-v1.png',
  stage: 'hotel-pop-stage-v2.png',
  roof: 'hotel-rooftop-v2.png',
  conservatory: 'hotel-conservatory-v1.png',
};

// Scene starts follow the 173 s radio edit. Solo hand-offs and ensemble
// entries are aligned to published lyric-onset cues; no words are duplicated.
const sequence = [
  [18.53, 'conservatory', 'solo', 0],
  [22.55, 'elevator', 'solo', 1],
  [26.80, 'roof', 'solo', 2],
  [31.31, 'hall', 'solo', 3],
  [35.45, 'stage', 'duet', 2, 3],
  [44.07, 'stage', 'formation'],
  [61.63, 'roof', 'solo', 0],
  [66.41, 'conservatory', 'solo', 1],
  [70.94, 'elevator', 'solo', 2],
  [74.98, 'hall', 'solo', 3],
  [78.80, 'stage', 'duet', 2, 3],
  [88.04, 'lobby', 'formation'],
  [104.89, 'conservatory', 'duet', 2, 3],
  [118.54, 'elevator', 'formation'],
  [127.34, 'stage', 'line'],
  [135.79, 'lobby', 'formation'],
  [145.53, 'roof', 'formation'],
  [159.00, 'hall', 'formation'],
  [166.20, 'stage', 'finale'],
];

export function fullShots(root, end) {
  return sequence.map(([start, place, action, lead, partner], index) => {
    const nextStart = sequence[index + 1]?.[0];
    const pans = [.31, .69, .43, .57];
    return {
      start,
      end: nextStart === undefined ? end : nextStart,
      source: `${root}/references/${places[place]}`,
      zoom: 1.08,
      x: action === 'entrance' ? .08 : action === 'solo' ? .5 : pans[index % pans.length],
      action, lead, partner, place,
    };
  });
}
