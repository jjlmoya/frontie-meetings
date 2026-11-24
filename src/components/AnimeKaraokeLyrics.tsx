import type { CSSProperties } from 'react';
import { animeSubtitles } from '@/data/animeOpening';
import { animeKaraoke } from '@/data/animeKaraoke';
import styles from './AnimeExperience.module.css';

const colors = ['#ffdd60', '#5ef2ff', '#ff7eb2', '#9bf998', '#c4a2ff'];

export function AnimeKaraokeLyrics({ line, syllable }: { line: number; syllable: number }) {
  const lyric = animeSubtitles[line];
  if (!lyric) return null;

  const [, , japanese, english, spanish] = lyric;
  const groups = animeKaraoke[line].groups;
  const color = colors[(syllable + colors.length) % colors.length];

  return (
    <div className={styles.subtitles} style={{ '--karaoke-color': color } as CSSProperties}>
      <p lang="ja" className={styles.japanese} aria-label={japanese}>
        {groups.map(({ text, moras, first }) => {
          const active = syllable >= first && syllable < first + moras.length;
          const progress = Math.max(0, Math.min(1, (syllable - first + 1) / moras.length));
          return (
            <span className={styles.karaokeWord} data-active={active} key={first} aria-hidden="true">
              <span className={styles.karaokeReading}>
                {moras.map((mora, i) => {
                  const position = first + i;
                  const status = position === syllable ? 'active' : position < syllable ? 'sung' : 'waiting';
                  return <span key={position} data-status={status} className={styles.karaokeMora}>{mora}</span>;
                })}
              </span>
              <span className={styles.karaokeBase} key={active ? syllable : -1} style={{ '--read': `${progress * 100}%` } as CSSProperties}>
                {text}
              </span>
            </span>
          );
        })}
      </p>
      <p lang="en" className={styles.translation}>{english}</p>
      <p lang="es" className={`${styles.translation} ${styles.spanish}`}>{spanish}</p>
    </div>
  );
}
