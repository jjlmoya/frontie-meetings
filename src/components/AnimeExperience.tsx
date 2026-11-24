'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ANIME_AUDIO, ANIME_DURATION, ANIME_TITLE, animeShots, animeSubtitles } from '@/data/animeOpening';
import cues from '@/data/animeAnimationCues.json';
import { animeKaraoke } from '@/data/animeKaraoke';
import { AnimeKaraokeLyrics } from './AnimeKaraokeLyrics';
import { AnimeWebcam, paintAnimeWebcam } from './AnimeWebcam';
import { webcamViseme } from '@/data/animeWebcam';
import type { FrontieViseme } from '@/data/animeWebcam';
import { drawAnimeOpeningEffects } from './animeOpeningEffects';
import styles from './AnimeExperience.module.css';

const ASSETS = '/assets/anime/';
const cueTrack = cues.tracks;

const timeLabel = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
const shotFor = (time: number) => Math.max(0, animeShots.findLastIndex(([start]) => time >= start));
const lineFor = (time: number) => animeSubtitles.findIndex(([start, end]) => time >= start && time < end);

function cueFor(track: number[], time: number) {
  return track[Math.min(track.length - 1, Math.max(0, Math.floor(time * cues.sampleRateHz)))] ?? 0;
}

export function AnimeExperience() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const warmShots = useRef(new Set<string>());
  const [duration, setDuration] = useState(ANIME_DURATION);
  const [time, setTime] = useState(0);
  const [shotIndex, setShotIndex] = useState(0);
  const [lastPaintedShot, setLastPaintedShot] = useState(animeShots[0]);
  const [lyricIndex, setLyricIndex] = useState(-1);
  const [syllable, setSyllable] = useState(-1);
  const [volume, setVolume] = useState(0.75);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [mouth, setMouth] = useState<FrontieViseme>('rest');

  const shot = animeShots[shotIndex];
  const titleVisible = time < 2.8 || time > 111.2;

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      started.current = true;
      setError('');
    } catch {
      setError('Could not start playback. Try Play again.');
    }
  }, []);

  const syncClock = useCallback((current: number) => {
    setTime(current);
    setShotIndex(shotFor(current));
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const upcoming = animeShots.slice(shotIndex + 1, shotIndex + 7);
    const paths = [...upcoming.map(([, image]) => image), animeShots[0][1]];
    const warmed = warmShots.current;
    for (const image of paths) {
      if (warmed.has(image)) continue;
      warmed.add(image);
      const preload = new window.Image();
      preload.onerror = () => warmed.delete(image);
      preload.src = `${ASSETS}shots/${image}.webp`;
    }
  }, [shotIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    const stage = backdrop.current;
    const ctx = canvas.current?.getContext('2d');
    if (!audio || !stage || !ctx) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastDrawnTime = -1;
    let lastRenderTime = -1;
    let lastMouthChange = -1;
    let lastMouth: FrontieViseme = 'rest';
    let lastLine = -1;
    let lastSyllable = -1;

    const renderFrame = () => {
      const current = audio.currentTime;
      const seek = Math.abs(current - lastDrawnTime) > 0.25;
      if (seek) lastMouthChange = current - 0.1;
      const activeShot = shotFor(current);
      const [start, image, effect] = animeShots[activeShot];
      const end = animeShots[activeShot + 1]?.[0] ?? duration;
      const local = current - start;
      const progress = Math.min(1, local / Math.max(0.1, end - start));
      const activeLine = lineFor(current);
      const activeSyllable = animeKaraoke[activeLine]?.begins.findLastIndex((onset) => current >= onset) ?? -1;
      if (activeLine !== lastLine) setLyricIndex(activeLine);
      if (activeSyllable !== lastSyllable) setSyllable(activeSyllable);
      lastLine = activeLine;
      lastSyllable = activeSyllable;
      const vocal = cueFor(cueTrack.vocals, current);
      const energy = cueFor(cueTrack.band, current);

      if (Math.abs(current - lastRenderTime) > 0.075 || seek
        || activeShot !== shotFor(lastRenderTime) || activeLine !== lineFor(lastRenderTime)) {
        syncClock(current);
        lastRenderTime = current;
      }

      const reduced = motion.matches;
      const allowed = !audio.paused && !reduced && activeLine >= 0;
      // Hold short dips so the mouth doesn't chatter between adjacent syllables.
      const nextMouth = allowed ? webcamViseme(activeLine, activeSyllable, vocal, lastMouth) : 'rest';
      if (nextMouth !== lastMouth && (!allowed || seek || current - lastMouthChange >= 0.036)) {
        setMouth(nextMouth);
        lastMouth = nextMouth;
        lastMouthChange = current;
      }

      if (camera.current) paintAnimeWebcam(camera.current, current, audio.paused ? 0 : vocal, audio.paused ? 0 : energy, reduced);

      if (!reduced && (Math.abs(current - lastDrawnTime) >= 0.019 || seek)) {
        const cameraProgress = activeShot === animeShots.length - 1 ? 1 - progress : progress;
        const locked = effect === 'manga' || effect === 'kira';
        const quiet = effect === 'still';
        const flying = effect === 'nimbus';
        const distance = locked ? 0 : quiet ? 0.4 : flying ? 3.8 : effect === 'run' ? 8 : 3;
        const lift = locked ? 0 : quiet ? 0.12 : flying ? -0.7 : effect === 'slash' ? -2.6 : -1.35;
        const impact = effect === 'slash' ? Math.max(0, 0.1 - local * 0.22) : 0;
        const spring = effect === 'gear' ? Math.sin(local * 16) * Math.exp(-local * 2.6) : 0;
        const zoom = locked ? 1 : effect === 'gear' ? 1.055 + cameraProgress * 0.05
          : flying ? 1.045 + cameraProgress * 0.038 : quiet ? 1.01 + cameraProgress * 0.02 : 1.10 + cameraProgress * 0.13;
        const direction = effect === 'run' || effect === 'train' || flying || activeShot % 2 === 0 ? 1 : -1;
        stage.style.setProperty('--camera-x', `${(cameraProgress - 0.5) * distance * direction}%`);
        const bank = flying ? 0.8 + Math.sin(local * 3.5) * 1.05 : 0;
        stage.style.setProperty('--camera-y', `${Math.sin(cameraProgress * Math.PI) * lift - spring * 2 + bank}%`);
        stage.style.setProperty('--camera-scale', String(zoom + impact + spring * 0.042));
        const veil = audio.paused ? 0 : Math.max(0, 1 - current / 0.26, 1 - (duration - current) / 0.38) * 0.82;
        stage.style.setProperty('--loop-veil', String(veil));
        drawAnimeOpeningEffects(ctx, { effect, image, time: current, local, progress, energy });
        lastDrawnTime = current;
      } else if (reduced) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        lastDrawnTime = current;
      }
    };

    const tick = () => {
      renderFrame();
      frame = requestAnimationFrame(tick);
    };

    const startFrames = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };

    const stopFrames = () => {
      cancelAnimationFrame(frame);
      renderFrame();
      stage.style.setProperty('--loop-veil', '0');
      setMouth('rest');
    };

    audio.addEventListener('play', startFrames);
    audio.addEventListener('pause', stopFrames);
    audio.addEventListener('seeked', renderFrame);
    motion.addEventListener('change', renderFrame);
    if (!audio.paused) startFrames();
    else renderFrame();

    return () => {
      cancelAnimationFrame(frame);
      audio.removeEventListener('play', startFrames);
      audio.removeEventListener('pause', stopFrames);
      audio.removeEventListener('seeked', renderFrame);
      motion.removeEventListener('change', renderFrame);
    };
  }, [duration, syncClock]);

  return (
    <main className={styles.page} aria-label={ANIME_TITLE}>
      <div className={styles.stage} onClick={(event) => {
        if (!started.current && !(event.target as HTMLElement).closest('button, a, input')) void play();
      }}>
        <audio ref={audioRef} src={ANIME_AUDIO} loop preload="metadata"
          onLoadedMetadata={(event) => {
            const loaded = event.currentTarget.duration;
            if (Number.isFinite(loaded) && loaded > 0) setDuration(loaded);
          }}
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onError={() => setError('The karaoke track could not be loaded.')}
          onTimeUpdate={(event) => {
            if (event.currentTarget.paused) syncClock(event.currentTarget.currentTime);
          }}
        />
        <div className={styles.picture} ref={backdrop} data-effect={shot[2]}>
          {lastPaintedShot !== shot && <div className={`${styles.shot} ${styles.shotFallback}`} aria-hidden="true"
            style={{
              backgroundImage: `url(${ASSETS}shots/${lastPaintedShot[1]}.webp)`,
              backgroundPosition: `50% ${lastPaintedShot[3] ?? 50}%`,
            }}
          />}
          <Image key={shot[1]} alt="" fill sizes="100vw" priority={shotIndex === 0} unoptimized
            className={styles.shot} src={`${ASSETS}shots/${shot[1]}.webp`}
            style={{ objectPosition: `50% ${shot[3] ?? 50}%` }}
            onLoad={() => setLastPaintedShot(shot)}
          />
          <canvas ref={canvas} className={styles.effects} width={1280} height={720} aria-hidden="true" />
          <div className={styles.grade} aria-hidden="true" />
        </div>

        <Link href="/" className={styles.home} aria-label="Back to song selector">FRONT-LINE</Link>

        <AnimeWebcam cameraRef={camera} corner={shot[2] === 'kira' ? 'top-left' : undefined} viseme={mouth} />

        {titleVisible && <div className={styles.title}>
          <h1 lang="ja">{ANIME_TITLE}</h1>
          <p>FRONTIE, RACE THROUGH THE NIGHT!</p>
        </div>}

        <AnimeKaraokeLyrics key={lyricIndex} line={lyricIndex} syllable={syllable} />

        <div className={styles.player} aria-label="Frontie’s stream control deck">
          <button type="button" onClick={() => {
            if (audioRef.current?.paused) void play();
            else audioRef.current?.pause();
          }} data-playing={playing}>{playing ? 'Pause' : 'Play'}</button>
          <span className={styles.deckClock}>{timeLabel(time)}</span>
          <label className={styles.deckRail} style={{ '--led-level': `${Math.min(time / duration, 1) * 100}%` } as CSSProperties}>
            <input aria-label="Song position" type="range" min={0} max={duration} step={0.01}
              value={Math.min(time, duration)} onChange={(event) => {
                const next = event.currentTarget.valueAsNumber;
                if (audioRef.current) audioRef.current.currentTime = next;
                syncClock(next);
              }}
            />
            <span className={styles.ledBar} aria-hidden="true"><span /></span>
          </label>
          <span className={styles.deckClock}>{timeLabel(duration)}</span>
          <label className={styles.deckVolume} style={{ '--led-level': `${volume * 100}%` } as CSSProperties}>
            <span aria-hidden="true">VOL</span>
            <input aria-label="Volume" type="range" min={0} max={1} step={0.01}
              value={volume} onChange={(event) => setVolume(event.currentTarget.valueAsNumber)}
            />
            <span className={styles.ledBar} aria-hidden="true"><span /></span>
          </label>
        </div>
        {error && <div className={styles.error} role="alert">{error}</div>}
      </div>
    </main>
  );
}
