export type LyricSection = {
  id: string;
  title: string;
  start: number;
  end: number;
  stage: 'intro' | 'verse' | 'chorus' | 'interlude' | 'bridge' | 'outro';
  lines: { text: string; start: number }[];
};

export const MEDIEVAL_LYRIC_SECTIONS: LyricSection[] = [
  {
    id: 'verse-1', title: 'Verse I · The tavern tale', start: 17, end: 33.3, stage: 'verse', lines: [
      { text: 'Gather ‘round the tavern table, shield your glowing screen,', start: 17 },
      { text: 'Hear the tale of Frontie, king of every feline queen.', start: 21.2 },
      { text: 'He stalks across the keyboard where the pull requests are laid,', start: 25.2 },
      { text: 'Guardian of the codebase, in ancient fur arrayed.', start: 29.5 },
    ],
  },
  {
    id: 'chorus-1', title: 'Chorus · Front-line!', start: 33.3, end: 50.5, stage: 'chorus', lines: [
      { text: 'Oh, Front-line! We wait for the stand-up call to start,', start: 33.3 },
      { text: 'While Frontie naps upon the keys and steals the team’s cold heart.', start: 37.2 },
      { text: 'Merge the branch! Resolve the conflict! Hear the sacred bell!', start: 41 },
      { text: 'Trapped inside the lobby, we weave a modern spell.', start: 44.85 },
    ],
  },
  { id: 'interlude-1', title: 'The tale turns…', start: 50.5, end: 58.5, stage: 'interlude', lines: [] },
  {
    id: 'verse-2', title: 'Verse II · The build breaks', start: 58.5, end: 74.8, stage: 'verse', lines: [
      { text: 'We split the giant bundle, micro-frontends in our wake,', start: 58.5 },
      { text: 'Ten thousand npm packages for the deployment’s sake.', start: 62.6 },
      { text: 'But Frontie paws the router, causing CORS errors deep,', start: 66.8 },
      { text: 'And hydration mismatches while the developers weep.', start: 71 },
    ],
  },
  {
    id: 'chorus-2', title: 'Chorus · Front-line!', start: 74.8, end: 91.2, stage: 'chorus', lines: [
      { text: 'Oh, Front-line! We wait for the stand-up call to start,', start: 74.8 },
      { text: 'While Frontie naps upon the keys and steals the team’s cold heart.', start: 79.5 },
      { text: 'Merge the branch! Resolve the conflict! Hear the sacred bell!', start: 83.7 },
      { text: 'Trapped inside the lobby, we weave a modern spell.', start: 87.3 },
    ],
  },
  {
    id: 'bridge', title: 'Bridge · Tribute to the king', start: 91.2, end: 108.3, stage: 'bridge', lines: [
      { text: 'He approves no pull request without a sacrifice of mice,', start: 91.2 },
      { text: 'A belly rub for tribute, paid precisely twice!', start: 95.3 },
      { text: 'Git push origin main, let the tavern ale flow free,', start: 100.2 },
      { text: 'While we wait for product owners across the stormy sea!', start: 104.3 },
    ],
  },
  { id: 'interlude-2', title: 'The king waits…', start: 108.3, end: 109, stage: 'interlude', lines: [] },
  {
    id: 'outro-main', title: 'Outro · Still waiting', start: 109, end: 124.6, stage: 'outro', lines: [
      { text: 'Waiting... waiting for the Meet to start...', start: 109 },
      { text: 'Frontie judges every commit with a cold and feline heart.', start: 112.2 },
      { text: 'Huzzah for Front-line! Huzzah for the beast!', start: 116.2 },
      { text: 'The meeting hasn’t started, but the legend has increased.', start: 119.2 },
    ],
  },
  { id: 'interlude-3', title: 'Instrumental', start: 124.6, end: 133.6, stage: 'interlude', lines: [] },
  { id: 'outro-finale', title: 'Final chorus', start: 133.6, end: 142.032, stage: 'outro', lines: [] },
];

export const MEDIEVAL_DURATION = 142.032;

export function getLyricSection(time: number): LyricSection | null {
  return MEDIEVAL_LYRIC_SECTIONS.find((section) => time >= section.start && time < section.end) ?? null;
}

export function getCurrentLyricIndex(section: LyricSection, time: number): number {
  if (!section.lines.length) return -1;
  let current = 0;
  for (let index = 1; index < section.lines.length; index += 1) {
    if (time >= section.lines[index].start) current = index;
    else break;
  }
  return current;
}
