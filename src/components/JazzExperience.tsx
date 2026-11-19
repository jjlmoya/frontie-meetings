'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { JAZZ_LYRICS } from '@/data/jazzLyrics';
import styles from './JazzExperience.module.css';

type CueFile = { duration: number; sampleRateHz: number; tracks: Record<string, number[]> };
type Motion = { vocal: number; drums: number; bass: number; keys: number; brass: number };
const AUDIO = '/assets/jazz/audio/while-we-wait.mp3';
const CUES = '/assets/jazz/animation-cues.json';

export function JazzExperience() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [cues, setCues] = useState<CueFile | null>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(89);
  const [volume, setVolume] = useState(0.46);
  const [playing, setPlaying] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState<boolean | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [motion, setMotion] = useState<Motion>({ vocal: 0, drums: 0, bass: 0, keys: 0, brass: 0 });

  useEffect(() => {
    let active = true;
    fetch(CUES).then((response) => {
      if (!response.ok) throw new Error('Jazz cue data is not available yet');
      return response.json() as Promise<CueFile>;
    }).then((data) => { if (active) setCues(data); }).catch(() => undefined);
    return () => { active = false; };
  }, []);


  useEffect(() => {
    let active = true;
    fetch(AUDIO, { method: 'HEAD', cache: 'no-store' })
      .then((response) => { if (active) setAudioAvailable(response.ok); })
      .catch(() => { if (active) setAudioAvailable(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audioAvailable !== true) return;
    audio.volume = volume;
  }, [volume, audioAvailable]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audioAvailable !== true) return;
    audio.play().then(() => { setPlaying(true); setAutoplayBlocked(false); })
      .catch(() => { setAutoplayBlocked(true); });
  }, [audioAvailable]);

  useEffect(() => {
    let raf = 0;
    let lastPaint = 0;
    const update = (now: number) => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        const nextTime = audio.currentTime;
        if (now - lastPaint > 1000 / 24) {
          setTime(nextTime);
          if (cues) {
            const i = Math.min(cues.tracks.vocal.length - 1, Math.floor(nextTime * cues.sampleRateHz));
            const at = (name: string) => cues.tracks[name]?.[i] ?? 0;
            setMotion({ vocal: at('vocal'), drums: at('drums'), bass: at('bass'), keys: at('keys'), brass: Math.max(at('brass'), at('woodwinds')) });
          }
          lastPaint = now;
        }
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [cues]);

  const activeLyric = useMemo(() => JAZZ_LYRICS.find((line) => time >= line.start && time < line.end)
    ?? [...JAZZ_LYRICS].reverse().find((line) => time >= line.start)
    ?? JAZZ_LYRICS[0], [time]);
  const progress = duration > 0 ? (time / duration) * 100 : 0;
  const energy = Math.min(1, motion.drums * 0.42 + motion.bass * 0.28 + motion.brass * 0.3);

  const togglePlayback = useCallback(async () => {
    if (audioAvailable !== true) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, [audioAvailable]);

  return (
    <main className={styles.experience} style={{
      '--energy': energy,
      '--vocal': motion.vocal,
      '--zoom': 1.02 + energy * 0.018,
      '--saturation': 1 + energy * 0.12,
      '--warm-opacity': 0.11 + energy * 0.18,
      '--glow-size': `${7 + energy * 13}px`,
      '--vocal-glow': `${4 + motion.vocal * 15}px`,
    } as CSSProperties}>
      {audioAvailable === true && <audio
        ref={audioRef}
        src={AUDIO}
        preload="auto"
        loop
        onPlay={() => { setPlaying(true); setAutoplayBlocked(false); }}
        onPause={() => setPlaying(false)}
        onError={() => { setAudioAvailable(false); setPlaying(false); }}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 89)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
      />}
      <div className={styles.artwork} aria-hidden="true">
        <Image src="/assets/jazz/layers/jazz-lounge.webp" alt="" fill priority sizes="100vw" />
      </div>
      <Image className={styles.performer} src="/assets/jazz/layers/frontie-sax-player.webp" alt="Frontie, a black cat in a tuxedo, playing saxophone" width={1180} height={1060} priority />
      <div className={styles.warmLight} aria-hidden="true" />
      <div className={styles.spotlight} aria-hidden="true" />
      <div className={styles.dust} aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <div className={styles.grain} aria-hidden="true" />

      <header className={styles.header}>
        <span className={styles.brand}>FRONT-LINE</span>
        <span className={styles.live}><i /> FRONTIE AFTER HOURS</span>
      </header>

      <section className={styles.lyricStage} aria-live="polite" aria-atomic="true">
        <p className={styles.eyebrow}>FRONTIE PRESENTS</p>
        <h1 className={styles.title}>JAZZ</h1>
        <p className={styles.trackTitle}>WHILE WE WAIT <span>— A FRONT-LINE SWING</span></p>
        <div className={styles.rule} aria-hidden="true"><i /><i /><i /></div>
        <p key={activeLyric?.text} className={styles.lyric}>{activeLyric?.text}</p>
      </section>

      <footer className={styles.player}>
        <button className={styles.playButton} type="button" onClick={togglePlayback} disabled={audioAvailable !== true} aria-label={playing ? 'Pause song' : 'Play song'}>
          {playing ? 'PAUSE' : 'PLAY'}
        </button>
        {audioAvailable === false ? <span className={styles.hint}>AUDIO UNAVAILABLE</span> : autoplayBlocked && <span className={styles.hint}>PRESS PLAY TO START</span>}
        <span className={styles.clock}>{formatTime(time)}</span>
        <input className={styles.seek} aria-label="Seek in song" type="range" min="0" max={duration || 89} value={Math.min(time, duration || 89)} disabled={audioAvailable !== true} onChange={(event) => {
          const next = Number(event.target.value);
          if (audioRef.current) audioRef.current.currentTime = next;
          setTime(next);
        }} style={{ '--progress': `${progress}%` } as CSSProperties} />
        <span className={styles.clock}>{formatTime(duration)}</span>
        <label className={styles.volumeControl}>
          <span>VOL</span>
          <input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={volume} disabled={audioAvailable !== true} onChange={(event) => setVolume(Number(event.target.value))} />
        </label>
      </footer>
      <div className={styles.status} aria-hidden="true">
        <span>FRONT-LINE</span><b /> <span>IN THE POCKET</span><b /> <span>AFTER HOURS</span>
      </div>
      <div className={styles.equalizer} aria-hidden="true">{Array.from({ length: 29 }, (_, index) => <i key={index} style={{ '--bar': index } as CSSProperties} />)}</div>
    </main>
  );
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}
