// Word onsets aligned against both the supplied stereo recording and its vocal stem.
// Where alignment placed two short words at the same timestamp, split that interval.
export const openingCues = [
  { start: 4.46, end: 7.16, singer: 2, lines: [
    [['Yo,', 4.46], ['I’ll', 5.14], ['tell', 5.22], ['you', 5.30], ['what', 5.46], ['I', 5.56], ['want,', 5.73]],
    [['what', 6.10], ['I', 6.19], ['really,', 6.28], ['really', 6.55], ['want', 6.83]],
  ] },
  { start: 7.16, end: 9.34, singer: 3, lines: [
    [['So', 7.16], ['tell', 7.42], ['me', 7.50], ['what', 7.60], ['you', 7.74], ['want,', 7.94]],
    [['what', 8.23], ['you', 8.33], ['really,', 8.48], ['really', 8.75], ['want', 9.02]],
  ] },
  { start: 9.34, end: 11.54, singer: 2, lines: [
    [['I’ll', 9.34], ['tell', 9.56], ['you', 9.70], ['what', 9.86], ['I', 9.99], ['want,', 10.24]],
    [['what', 10.44], ['I', 10.53], ['really,', 10.62], ['really', 10.91], ['want', 11.12]],
  ] },
  { start: 11.54, end: 13.78, singer: 3, lines: [
    [['So', 11.54], ['tell', 11.74], ['me', 11.84], ['what', 11.96], ['you', 12.12], ['want,', 12.31]],
    [['what', 12.57], ['you', 12.73], ['really,', 12.87], ['really', 13.16], ['want', 13.48]],
  ] },
  { start: 13.78, end: 18.2, singer: 3, lines: [
    [['I', 13.78], ['wanna', 13.92], ['(ha)', 14.34], ['I', 14.56], ['wanna', 14.68], ['(ha)', 15.10], ['I', 15.32], ['wanna', 15.44], ['(ha)', 15.87], ['I', 16.09], ['wanna', 16.21], ['(ha)', 16.64]],
    [['I', 16.94], ['wanna', 17.06], ['really,', 17.34], ['really', 17.66], ['really', 17.98]],
  ] },
];

export function openingCueAt(time) {
  return openingCues.find(({ start, end }) => time >= start && time < end);
}

export function openingMouthFrames(vocals, sampleRate, fps, count) {
  let activeCue;
  let open = false;
  let lastChange = -2;
  return Array.from({ length: count }, (_, frame) => {
    const time = frame / fps;
    const cue = openingCueAt(time);
    if (cue !== activeCue) {
      open = false;
      lastChange = frame - 2;
      activeCue = cue;
    }
    if (!cue) return 0;
    const at = Math.floor(time * sampleRate);
    const recentPeak = Math.max(...vocals.slice(Math.max(0, at - 8), at + 7));
    const energy = (vocals[at - 1] + vocals[at] * 2 + vocals[at + 1]) / 4;
    const threshold = Math.max(.14, recentPeak * (open ? .62 : .71));
    const desired = energy > threshold;
    if (desired !== open && frame - lastChange >= 2) {
      open = desired;
      lastChange = frame;
    }
    return open ? Math.min(1, .34 + energy) : 0;
  });
}

export function fullSongMouthFrames(vocals, sampleRate, fps, count) {
  let open = false;
  let lastChange = -2;
  return Array.from({ length: count }, (_, frame) => {
    const time = frame / fps;
    const at = Math.floor(time * sampleRate);
    const recent = vocals.slice(Math.max(0, at - 12), Math.min(vocals.length, at + 3));
    const recentPeak = recent.length ? Math.max(...recent) : 0;
    const energy = ((vocals[at - 1] ?? 0) + (vocals[at] ?? 0) * 2 + (vocals[at + 1] ?? 0)) / 4;
    const threshold = Math.max(.13, recentPeak * (open ? .58 : .7));
    const desired = energy > threshold;
    if (desired !== open && frame - lastChange >= 2) {
      open = desired;
      lastChange = frame;
    }
    return open ? Math.min(1, .34 + energy) : 0;
  });
}

export function openingCaptions(cue, time) {
  if (!cue) return '';
  const active = cue.lines.flat().findLast(([, at]) => at <= time);
  const accent = cue.singer === 2 ? '#ffe37b' : '#ffad94';
  const cards = cue.lines.map((line, row) => {
    const words = line.map(([word, at], index) => (
      `<tspan fill="${at === active?.[1] ? accent : '#fffdf4'}">${index ? ' ' : ''}${word}</tspan>`
    )).join('');
    return `<text x="480" y="${48 + row * 38}">${words}</text>`;
  }).join('');
  return `<g xml:space="preserve" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="33" text-anchor="middle" paint-order="stroke" stroke-linejoin="round" stroke="#170e26" stroke-width="5">${cards}</g>`;
}
