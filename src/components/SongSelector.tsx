import Image from 'next/image';
import type { CSSProperties } from 'react';
import { MEETINGS_CONFIG } from '@/config/meetings';
import styles from './SongSelector.module.css';

const titleFontById: Record<string, string> = {
  medieval: 'var(--font-righteous)',
  campfire: 'Georgia, serif',
  wannabe: 'var(--font-audiowide)',
  beach: 'var(--font-bungee)',
  synth: 'var(--font-orbitron)',
  autumn: 'var(--font-dancing)',
  flamenco: 'var(--font-black-ops)',
  reggae: 'var(--font-geist-sans)',
  coco: 'var(--font-creepster)',
  australian: 'var(--font-monoton)',
  funky: 'Palatino Linotype, Palatino, serif',
  groovie: 'var(--font-geist-mono)',
  metal: 'Impact, Haettenschweiler, sans-serif',
  reggaeton: 'Copperplate, Papyrus, fantasy',
  xmas: 'var(--font-dancing)',
  'xmas-2': 'Baskerville, Times New Roman, serif',
};

export function SongSelector() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="Front-Line home">FRONT-LINE</a>
        <h1 className={styles.heading}>Choose a song</h1>
      </header>

      <section className={styles.grid} aria-label="Songs">
        {MEETINGS_CONFIG.map((song, index) => (
          <a
            className={`${styles.card} ${song.id === 'wannabe' ? styles.wannabeCard : ''}`}
            href={`/?config=${encodeURIComponent(song.id)}`}
            key={song.id}
            style={{
              '--cover-accent': song.style.primaryColor,
              '--title-font': titleFontById[song.id] ?? song.style.fontFamily,
            } as CSSProperties}
            aria-label={`Play ${song.name.trim()}`}
          >
            <div className={styles.art}>
              <Image
                className={styles.coverImage}
                src={`/assets/covers-art/${song.id}.webp`}
                alt=""
                fill
                sizes="(max-width: 720px) 94vw, (max-width: 1200px) 46vw, 44vw"
                priority={index < 4}
              />
              <span className={styles.artShade} />
              <span className={styles.songName}>{song.name.trim()}</span>
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}
