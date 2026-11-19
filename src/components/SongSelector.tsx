import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { MEETINGS_CONFIG } from '@/config/meetings';
import styles from './SongSelector.module.css';

const titleFontById: Record<string, string> = {
  jazz: 'Didot, Bodoni MT, Georgia, serif',
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
        <Link className={styles.brand} href="/" aria-label="Front-Line home">FRONT-LINE</Link>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heading} data-text="Choose a song">Choose a song</h1>
        <Image
          className={styles.heroArtwork}
          src="/assets/covers-art/frontie-creepypasta.webp"
          alt=""
          fill
          sizes="(max-width: 720px) 100vw, min(100vw, 1380px)"
          priority
          aria-hidden="true"
        />
      </section>

      <section className={styles.grid} aria-label="Songs">
        {MEETINGS_CONFIG.map((song, index) => (
          <Link
            className={`${styles.card} ${song.id === 'wannabe' ? styles.wannabeCard : ''} ${song.id === 'jazz' ? styles.jazzCard : ''}`}
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
                src={song.id === 'jazz' ? '/assets/jazz/layers/jazz-banner.webp' : `/assets/covers-art/${song.id}.webp`}
                alt=""
                fill
                sizes="(max-width: 720px) 94vw, (max-width: 1200px) 46vw, 44vw"
                priority={index < 4}
              />
              <span className={styles.artShade} />
              <span className={styles.songName}>{song.name.trim()}</span>
            </div>
          </Link>
        ))}
      </section>

      <footer className={styles.footer} aria-hidden="true">
        <span className={styles.footerTrace} />
        <span className={styles.footerBurn} />
      </footer>
    </main>
  );
}
