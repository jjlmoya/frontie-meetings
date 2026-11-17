'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import styles from './CampfireExperience.module.css';

type LyricLine = { start: number; end: number; text: string; translation?: string; event?: 'maria' | 'xavi'; appearanceAt?: number; appearanceEnd?: number };
type LyricsFile = { lines: LyricLine[] };
type CueFile = { duration: number; sampleRateHz: number; tracks: Record<string, number[]> };
type MouthState = { open: boolean; changedAt: number; belowThresholdSince: number | null; smoothedVocal: number; peakSinceOpen: number; lastUpdateTime: number | null; lastCueIndex: number | null };

const AUDIO = '/assets/campfire/audio/Escalofríos%20en%20Producci%C3%B3n.mp3';
const ART = '/assets/campfire/layers/';
const LYRICS = '/assets/campfire/lyrics.json';
const CUES = '/assets/campfire/animation-cues.json';

function formatTime(value: number) {
  const seconds = Math.max(0, Math.floor(value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function cueAt(cues: CueFile | null, track: string, time: number) {
  if (!cues) return 0;
  return cues.tracks[track]?.[Math.min(cues.tracks[track].length - 1, Math.floor(time * cues.sampleRateHz))] ?? 0;
}

function phraseAccent(time: number, start: number, end: number) {
  if (time < start || time >= end) return 0;
  const edge = 0.32;
  return Math.max(0, Math.min(1, (time - start) / edge, (end - time) / edge));
}

function sectionEnvelope(time: number, start: number, end: number, edge = 0.72) {
  const smooth = (value: number) => {
    const bounded = Math.max(0, Math.min(1, value));
    return bounded * bounded * (3 - 2 * bounded);
  };
  return Math.min(smooth((time - start) / edge), smooth((end - time) / edge));
}

function isWhisperTime(time: number) {
  return (time >= 36.24 && time < 62.32)
    || (time >= 107.26 && time < 126.38)
    || (time >= 165.5 && time < 171.6)
    || (time >= 179.4 && time < 181.46);
}

function isSoftSpeechTime(time: number) {
  return time >= 173.85 && time < 177.68;
}

const hauntedWords = new Set([
  'fuego', 'temor', 'terror', 'inconsciente', 'sin alma', 'sombras', 'jest.mock',
  'sin ningún control', 'no puede ser', 'traición', 'escalofríos', 'producción',
  'front-line', 'request changes', 'oscuridad', 'hostil', 'mal', 'sangre',
  'ci checks rojos', 'breaking change', 'sin avisar', 'build ha muerto', 'revert',
  'a salvo', 'maldita', 'fatal', 'xavi', 'maría', 'release', 'pr',
  'fire', 'afraid', 'fear', 'shadows', 'betrayal', 'chills', 'dark', 'darkness', 'no conscience',
  'souls', 'evil', 'hostile', 'blood', 'no mercy', 'dead', 'cursed', 'omen', 'safe', 'rejected',
]);
const hauntedWordPattern = /((?:sin ningún control|build ha muerto|ci checks rojos|breaking change|request changes|no puede ser|no conscience|no mercy|escalofríos|inconsciente|front-line|jest\.mock|sin alma|sin avisar|producción|oscuridad|traición|sangre|sombras|maldita|hostile|hostil|fatal|temor|terror|revert|release|fuego|a salvo|darkness|betrayal|shadows|rejected|cursed|afraid|chills|souls|blood|evil|dead|omen|safe|dark|fire|fear|xavi|maría|\bpr\b|\bmal\b|a+h{2,}|n[oó]{3,}))/gi;

function renderLyric(text: string, beat: number) {
  let wordIndex = 0;
  return text.split(hauntedWordPattern).flatMap((part, phraseIndex) => {
    const isFearPhrase = hauntedWords.has(part.toLocaleLowerCase()) || /^(?:a+h{2,}|n[oó]{3,})$/i.test(part);
    return part.split(/(\s+)/).map((word, wordIndexInPhrase) => {
      if (!word.trim()) return word;
      const index = wordIndex++;
      const side = index % 2 === 0 ? 1 : -1;
      const lift = beat * (isFearPhrase ? 12 : 6);
      const rotation = beat * side * (isFearPhrase ? 2.6 : 1.1);
      const scale = 1 + beat * (isFearPhrase ? 0.1 : 0.045);
      const style: CSSProperties = {
        transform: `translate3d(0, ${-lift}px, 0) rotate(${rotation}deg) scale(${scale})`,
        transitionDelay: `${(index % 3) * 12}ms`,
      };
      return (
        <span
          className={isFearPhrase ? `${styles.lyricWord} ${styles.lyricFearWord}` : styles.lyricWord}
          key={`${phraseIndex}-${wordIndexInPhrase}-${word}`}
          style={style}
        >
          {word}
        </span>
      );
    });
  });
}

export function CampfireExperience() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const startedRef = useRef(false);
  const intentionalPauseRef = useRef(false);
  const mouthRef = useRef<MouthState>({ open: false, changedAt: 0, belowThresholdSince: null, smoothedVocal: 0, peakSinceOpen: 0, lastUpdateTime: null, lastCueIndex: null });
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(207.24);
  const [volume, setVolume] = useState(0.82);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [cues, setCues] = useState<CueFile | null>(null);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(preference.matches);
    syncPreference();
    preference.addEventListener('change', syncPreference);
    return () => preference.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch(LYRICS).then((response) => response.ok ? response.json() as Promise<LyricsFile> : Promise.reject()),
      fetch(CUES).then((response) => response.ok ? response.json() as Promise<CueFile> : Promise.reject()),
    ]).then(([lyricData, cueData]) => {
      if (!alive) return;
      setLyrics(lyricData.lines);
      setCues(cueData);
      setDuration(cueData.duration);
    }).catch(() => setLoadError(true));
    return () => { alive = false; };
  }, []);

  const activeLine = useMemo(
    () => lyrics.find((line) => time >= line.start && time < line.end),
    [lyrics, time],
  );

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    intentionalPauseRef.current = false;
    try {
      await audio.play();
      startedRef.current = true;
    } catch {
      // The small play button remains available if browser policy blocks playback.
    }
  }, []);

  const handleSceneGesture = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    if (!startedRef.current && !intentionalPauseRef.current) void play();
  }, [play]);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void play();
    else {
      intentionalPauseRef.current = true;
      audio.pause();
    }
  }, [play]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;
    let frame = 0;
    let lastUiUpdate = 0;
    const update = (frameTime: number) => {
      const now = audio.currentTime;
      const currentLyric = lyrics.find((line) => now >= line.start && now < line.end);
      const lyricIsActive = currentLyric !== undefined;
      const mouth = mouthRef.current;
      const cueIndex = cues ? Math.floor(now * cues.sampleRateHz) : null;
      if (now < mouth.changedAt) {
        mouth.open = false;
        // After a timeline seek, sync directly to the vocal energy at the new
        // position instead of carrying the normal debounce into the new cue.
        mouth.changedAt = now - 0.2;
        mouth.belowThresholdSince = null;
        mouth.smoothedVocal = 0;
        mouth.peakSinceOpen = 0;
        mouth.lastUpdateTime = null;
        mouth.lastCueIndex = null;
        setMouthOpen(false);
      }
      if (!lyricIsActive) {
        mouth.smoothedVocal = 0;
        mouth.peakSinceOpen = 0;
        mouth.belowThresholdSince = null;
        mouth.lastUpdateTime = null;
        mouth.lastCueIndex = cueIndex;
        if (mouth.open) {
          mouth.open = false;
          mouth.changedAt = now;
          setMouthOpen(false);
        }
      } else {
        // Advance the lip-sync gate once per source cue (50 Hz), not once per
        // display frame. This makes the same vocal take articulate identically
        // on 60 Hz and 120 Hz screens without skipping short syllable valleys.
        if (cueIndex !== null && mouth.lastCueIndex !== cueIndex) {
          const cueTime = cueIndex / cues!.sampleRateHz;
          const elapsed = mouth.lastUpdateTime === null
            ? 1 / cues!.sampleRateHz
            : Math.max(0, Math.min(cueTime - mouth.lastUpdateTime, 0.1));
          mouth.lastCueIndex = cueIndex;
          mouth.lastUpdateTime = cueTime;
          const vocal = cueAt(cues, 'vocal', cueTime);
          const whispered = isWhisperTime(cueTime);
          const softSpeech = isSoftSpeechTime(cueTime);
          // The 50 Hz stem envelope already smooths the waveform. Keep the
          // release quick enough to show syllable gaps instead of holding a
          // single open pose for an entire sung line.
          const smoothingTime = vocal > mouth.smoothedVocal ? 0.0145 : 0.0205;
          const smoothing = 1 - Math.exp(-elapsed / smoothingTime);
          mouth.smoothedVocal += (vocal - mouth.smoothedVocal) * smoothing;
          // Keep a short rolling peak, rather than the loudest peak since the
          // mouth opened. A phrase-wide peak made quieter syllables stay over
          // the closing gate, leaving the mouth visibly held open.
          if (mouth.open) {
            const peakRelease = Math.exp(-elapsed / 0.18);
            mouth.peakSinceOpen = Math.max(mouth.smoothedVocal, mouth.peakSinceOpen * peakRelease);
          }
          const openThreshold = whispered ? 0.1 : softSpeech ? 0.1 : 0.2;
          // Close on the short energy valleys between syllables, even when the
          // singer sustains a phrase. A lower close threshold made the mouth
          // hang open for whole words whenever the vocal stem stayed loud.
          const closeFloor = whispered ? 0.07 : softSpeech ? 0.075 : 0.12;
          // Use hysteresis against the recent vocal peak so the jaw closes in
          // syllable valleys even when a louder syllable just occurred.
          const closeThreshold = Math.max(closeFloor, mouth.peakSinceOpen * 0.9);
          // A sustained vocal stem can stay loud across several syllables, so
          // energy hysteresis alone may hold one open-mouth pose for a whole
          // word or line. Add a gentle articulation release for ordinary
          // singing, then require a short closed beat before reopening. Long
          // screams keep their sustained open pose.
          const sustainedScream = /a+h{2,}|n[oó]{2,}/i.test(currentLyric?.text ?? '');
          const holdLimit = whispered ? 0.68 : softSpeech ? 0.64 : 0.62;
          const heldTooLong = mouth.open && !sustainedScream && cueTime - mouth.changedAt >= holdLimit;
          const desired = !heldTooLong && mouth.smoothedVocal > (mouth.open ? closeThreshold : openThreshold);
          const minimumOpen = 0.16;
          const minimumClosed = 0.14;
          if (desired) {
            mouth.belowThresholdSince = null;
          }
          if (desired && !mouth.open && cueTime - mouth.changedAt >= minimumClosed) {
            mouth.open = desired;
            mouth.changedAt = cueTime;
            mouth.peakSinceOpen = mouth.smoothedVocal;
            setMouthOpen(desired);
          } else if (heldTooLong && mouth.open) {
            mouth.open = false;
            mouth.changedAt = cueTime;
            mouth.belowThresholdSince = null;
            mouth.peakSinceOpen = 0;
            setMouthOpen(false);
          } else if (!desired && mouth.open) {
            if (mouth.belowThresholdSince === null) mouth.belowThresholdSince = cueTime;
            if (cueTime - mouth.belowThresholdSince >= 0.04 && cueTime - mouth.changedAt >= minimumOpen) {
              mouth.open = false;
              mouth.changedAt = cueTime;
              mouth.belowThresholdSince = null;
              mouth.peakSinceOpen = 0;
              setMouthOpen(false);
            }
          }
        }
      }
      if (frameTime - lastUiUpdate >= 50) {
        setTime(now);
        lastUiUpdate = frameTime;
      }
      frame = window.requestAnimationFrame(update);
    };
    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [cues, isPlaying, lyrics]);

  const guitar = cueAt(cues, 'guitar', time);
  const drums = cueAt(cues, 'drums', time);
  const pulse = Math.max(guitar, drums * 0.72);
  const previousPulse = Math.max(cueAt(cues, 'guitar', time - 0.08), cueAt(cues, 'drums', time - 0.08) * 0.72);
  const lyricBeat = Math.min(1, Math.max(0, pulse * 0.9 + (pulse - previousPulse)));
  const motionScale = prefersReducedMotion ? 0.35 : 1;
  const scenePulse = pulse * motionScale;
  const chorusMotion = Math.max(sectionEnvelope(time, 65.36, 80.46), sectionEnvelope(time, 126.38, 141.8));
  const bridgeMotion = sectionEnvelope(time, 152.72, 173.18);
  const whisper = isWhisperTime(time);
  const outro = time >= 173.18;
  const storyAccent = Math.max(
    phraseAccent(time, 36.24, 39.36),
    phraseAccent(time, 60.2, 62.32),
    phraseAccent(time, 123.5, 126.38),
    phraseAccent(time, 165.5, 171.6),
  );
  const screamJolt = Math.max(phraseAccent(time, 182, 184), phraseAccent(time, 191, 193));
  const hauntingLine = lyrics.find((line) => line.event && line.appearanceAt !== undefined && time >= line.appearanceAt && time < (line.appearanceEnd ?? line.end + (line.event === 'xavi' ? 1.5 : 0.3)));
  const haunting = hauntingLine?.event ?? '';
  const hauntingAge = hauntingLine?.appearanceAt === undefined ? 0 : time - hauntingLine.appearanceAt;
  const hauntingDuration = hauntingLine?.appearanceAt === undefined ? 0 : (hauntingLine.appearanceEnd ?? hauntingLine.end + (hauntingLine.event === 'xavi' ? 1.5 : 0.3)) - hauntingLine.appearanceAt;
  const hauntingOpacity = haunting && hauntingAge > hauntingDuration - 0.18 ? Math.max(0, (hauntingDuration - hauntingAge) / 0.18) : haunting ? 1 : 0;
  const hauntingScale = haunting && !prefersReducedMotion && hauntingAge < 0.12 ? 1.1 - hauntingAge * 0.83 : 1;
  const storytellingMotion = Math.max(
    sectionEnvelope(time, 19.3, 33.9),
    sectionEnvelope(time, 93.1, 107.26),
    sectionEnvelope(time, 152.72, 165.5),
  );
  const whisperMotion = Math.max(
    sectionEnvelope(time, 36.55, 62.32),
    sectionEnvelope(time, 107.26, 126.58),
    sectionEnvelope(time, 165.5, 171.6),
    sectionEnvelope(time, 173.85, 177.68),
  );
  const revealFlinch = haunting && hauntingAge >= 0 && hauntingAge < 0.34
    ? 1 - hauntingAge / 0.34
    : 0;
  const nod = isPlaying
    ? (Math.sin(time * 1.62) * (2.1 + pulse * 1.55 + chorusMotion * 1.2)
      + Math.sin(time * 0.53 + 0.7) * (1 + (whisper ? 0.8 : 0.2))
      + storytellingMotion * (0.8 + Math.sin(time * 0.78) * 1.1)
      + whisperMotion * Math.sin(time * 0.66 + 0.5) * 1.25
      + storyAccent * 2.7 + screamJolt * Math.sin(time * 13) * 1.2 + revealFlinch * 2.2) * motionScale
    : 0;
  const bodyLean = isPlaying
    ? (Math.sin(time * 0.78 + 0.5) * (2.3 + chorusMotion * 1.4 + bridgeMotion * 0.5)
      + storytellingMotion * (1.1 + Math.sin(time * 0.64 + 0.3) * 1.5)
      - whisperMotion * (0.7 + Math.sin(time * 0.48) * 0.9)
      + storyAccent * 3.1 - revealFlinch * 4.2) * motionScale
    : 0;
  const bodySway = isPlaying
    ? (Math.sin(time * 1.08 + 0.3) * (3 + chorusMotion * 3.4 + pulse * 1.3)
      + Math.sin(time * 0.51 + 0.9) * (1.2 + (whisper ? 0.7 : 0))
      + storytellingMotion * Math.sin(time * 0.7 + 0.2) * 2.1
      + whisperMotion * Math.sin(time * 0.52 + 1) * 1.4
      + screamJolt * Math.sin(time * 14) * 1.6 + revealFlinch * Math.sin(hauntingAge * 17) * 1.2) * motionScale
    : 0;
  const upperBodyBob = isPlaying
    ? (Math.sin(time * (1.48 + chorusMotion * 0.58) + 0.4) * (1.2 + pulse * 1.4 + chorusMotion * 1.25)
      + storytellingMotion * Math.sin(time * 0.88 + 0.6) * 1.1
      - whisperMotion * (0.5 + Math.sin(time * 0.58) * 0.6)) * motionScale
    : 0;
  const fireSway = isPlaying
    ? (Math.sin(time * 3.1) * 1.8 + Math.sin(time * 5.3 + 0.8) * 0.9) * motionScale
    : 0;
  const fireFlicker = isPlaying
    ? (Math.sin(time * 8.7) * 0.035 + Math.sin(time * 15.2 + 0.4) * 0.022 + scenePulse * 0.035) * motionScale
    : 0;
  const fireFramePosition = isPlaying && !prefersReducedMotion ? time * 6 : 0;
  const fireFrame = Math.floor(fireFramePosition) % 4;
  const fireFrameMix = isPlaying && !prefersReducedMotion ? fireFramePosition - Math.floor(fireFramePosition) : 0;
  const strum = (isPlaying
    ? (Math.sin(time * Math.PI * (6 + chorusMotion * 1.2 - bridgeMotion * 0.8 + (outro ? 0.2 : 0)))
      * (2.2 + guitar * (6.2 + chorusMotion * 2.8 - bridgeMotion * 1.2)) - storyAccent * 6) * motionScale
    : 0) - 7;
  const fret = (isPlaying ? Math.sin(time * 4.2) * (0.35 + guitar * 0.85) * motionScale : 0) - 52;
  const tail = isPlaying
    ? Math.sin(time * (2.15 + chorusMotion * 0.85 - bridgeMotion * 0.55) + 0.7)
      * (7 + pulse * 3 + chorusMotion * 3 + (whisper ? 1.5 : 0)) * motionScale
    : 0;

  return (
    <main lang="es" className={styles.experience} onPointerDownCapture={handleSceneGesture}>
      <audio
        ref={audioRef}
        src={AUDIO}
        preload="auto"
        autoPlay
        loop
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onPlay={() => { startedRef.current = true; setIsPlaying(true); }}
        onPause={() => { setIsPlaying(false); setMouthOpen(false); mouthRef.current = { open: false, changedAt: audioRef.current?.currentTime ?? 0, belowThresholdSince: null, smoothedVocal: 0, peakSinceOpen: 0, lastUpdateTime: null, lastCueIndex: null }; }}
        onEnded={() => { setIsPlaying(false); setMouthOpen(false); mouthRef.current = { open: false, changedAt: 0, belowThresholdSince: null, smoothedVocal: 0, peakSinceOpen: 0, lastUpdateTime: null, lastCueIndex: null }; }}
        onError={() => setLoadError(true)}
      />

      <Image className={styles.screamerPreload} src={`${ART}characters/xavi-screamer-ponytail.webp`} width={1150} height={1367} sizes="min(70vw, 76vh, 800px)" priority alt="" />
      <Image className={styles.screamerPreload} src={`${ART}characters/maria-screamer.webp`} width={1216} height={1293} sizes="min(70vw, 76vh, 800px)" priority alt="" />

      <Image className={styles.forest} src={`${ART}scene/night-forest-clearing.webp`} width={1672} height={941} sizes="100vw" priority unoptimized alt="" />
      <Image className={styles.stars} src={`${ART}scene/night-stars-overlay.webp`} width={1672} height={941} sizes="100vw" priority unoptimized alt="" />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.embersGlow} style={{ opacity: 0.42 + scenePulse * 0.32 }} aria-hidden="true" />

      <div className={styles.sceneDetails} aria-hidden="true">
        <Image className={styles.moon} src={`${ART}scene/crescent-moon.webp`} width={184} height={184} sizes="min(8vw, 92px)" unoptimized alt="" />
        <Image className={styles.constellation} src={`${ART}scene/constellation.webp`} width={256} height={171} sizes="min(11vw, 128px)" unoptimized alt="" />
        <span className={styles.shootingStar} />
        <Image className={`${styles.airplane} ${styles.airplane1}`} src={`${ART}scene/distant-plane.webp`} width={844} height={276} sizes="112px" style={{ height: 'auto' }} unoptimized alt="" />
        <Image className={`${styles.airplane} ${styles.airplane2}`} src={`${ART}scene/distant-plane.webp`} width={844} height={276} sizes="100px" style={{ height: 'auto' }} unoptimized alt="" />
        <Image className={`${styles.groundProp} ${styles.skull}`} src={`${ART}scene/raven-skull.webp`} width={594} height={351} sizes="min(7vw, 72px)" unoptimized alt="" />
        <Image className={`${styles.groundProp} ${styles.bramble}`} src={`${ART}scene/bramble-cluster.webp`} width={669} height={377} sizes="min(13vw, 125px)" unoptimized alt="" />
        <Image className={`${styles.groundProp} ${styles.spentCandle}`} src={`${ART}scene/spent-candle.webp`} width={642} height={313} sizes="min(5vw, 48px)" unoptimized alt="" />
      </div>

      <Image className={styles.midgroundTrees} src={`${ART}scene/midground-treeline.webp`} width={1672} height={941} sizes="100vw" unoptimized priority alt="" />
      <Image className={styles.foregroundTrees} src={`${ART}scene/foreground-tree-canopies.webp`} width={1672} height={941} sizes="100vw" unoptimized priority alt="" />
      <div className={styles.foregroundLeaves} aria-hidden="true">
        <Image className={`${styles.fallingLeaf} ${styles.fallingLeaf1}`} src={`${ART}scene/falling-leaf-1.webp`} width={374} height={377} sizes="40px" style={{ height: 'auto' }} unoptimized alt="" />
        <Image className={`${styles.fallingLeaf} ${styles.fallingLeaf2}`} src={`${ART}scene/falling-leaf-2.webp`} width={699} height={583} sizes="40px" style={{ height: 'auto' }} unoptimized alt="" />
        <Image className={`${styles.fallingLeaf} ${styles.fallingLeaf3}`} src={`${ART}scene/falling-leaf-3.webp`} width={580} height={327} sizes="35px" style={{ height: 'auto' }} unoptimized alt="" />
      </div>

      {activeLine && <div key={`${activeLine.start}-${activeLine.text}`} className={styles.lyric} aria-live="polite" aria-label="Letra y traducción de la canción">
        <span className={styles.lyricText}>{renderLyric(activeLine.text, lyricBeat)}</span>
        {activeLine.translation && <span lang="en" className={styles.translationText}>{renderLyric(activeLine.translation, lyricBeat * 0.72)}</span>}
      </div>}

      <div className={styles.puppet} role="img" style={{ transform: `translateX(calc(-50% + ${bodySway}px))` }} aria-label="Frontie, juglar anciano cantando junto a la hoguera">
        <Image className={`${styles.part} ${styles.legs}`} src={`${ART}characters/frontie-seated-legs.webp`} width={444} height={443} sizes="min(14vw, 17vh, 180px)" priority alt="" />
        <div className={styles.upperBody} style={{ transform: `translateY(${upperBodyBob}px) rotate(${bodyLean * 0.68 + storyAccent * 2.2}deg)` }}>
          <Image className={`${styles.part} ${styles.tail}`} src={`${ART}characters/frontie-tail.webp`} width={444} height={444} sizes="min(6vw, 7vh, 74px)" alt="" style={{ transform: `rotate(${tail}deg)` }} />
          <Image className={`${styles.part} ${styles.torso}`} src={`${ART}characters/frontie-torso.webp`} width={443} height={443} sizes="min(11vw, 13vh, 145px)" priority alt="" />
          <Image className={`${styles.part} ${styles.head}`} src={`${ART}characters/frontie-head-closed.webp`} width={443} height={443} sizes="min(10vw, 12vh, 126px)" alt="" style={{ transform: `translateY(-2.2%) rotate(${nod}deg)` }} />
          <Image className={`${styles.part} ${styles.head} ${styles.mouth}`} src={`${ART}characters/frontie-mouth-open-v10.png`} width={443} height={443} sizes="min(10vw, 12vh, 126px)" unoptimized alt="" style={{ transform: `translateY(-2.2%) rotate(${nod}deg)`, display: mouthOpen ? 'block' : 'none' }} />
          <div className={styles.frettingArm} style={{ transform: `rotate(${fret}deg)` }}>
            <Image src={`${ART}characters/frontie-arm-fretting.webp`} width={443} height={444} sizes="min(7vw, 8vh, 78px)" alt="" />
          </div>
          <Image className={`${styles.part} ${styles.lute}`} src={`${ART}characters/frontie-lute.webp`} width={443} height={444} sizes="min(11vw, 13vh, 145px)" alt="" style={{ transform: `rotate(${isPlaying ? Math.sin(time * 3) * (0.5 + guitar * 1.3) * motionScale : 0}deg)` }} />
          <div className={styles.frettingPaw} style={{ transform: `rotate(${fret}deg)` }}>
            <Image src={`${ART}characters/frontie-arm-fretting-paw.webp`} width={193} height={260} sizes="min(5vw, 5vh, 50px)" alt="" />
          </div>
          <Image className={`${styles.part} ${styles.strummingArm}`} src={`${ART}characters/frontie-arm-strumming.webp`} width={444} height={444} sizes="min(8vw, 10vh, 100px)" alt="" style={{ transform: `rotate(${strum}deg)` }} />
        </div>
      </div>

      {Array.from({ length: 4 }, (_, index) => index + 1).map((frame) => <Image
        key={frame}
        className={styles.fireFlames}
        src={`${ART}scene/flame-loop-v3-frame-${frame}.webp`}
        width={512}
        height={260}
        sizes="min(22vw, 21vh, 175px)"
        unoptimized
        priority={frame <= 2}
        alt=""
        style={{
          opacity: isPlaying
            ? (fireFrame === frame - 1 ? 1 - fireFrameMix : (fireFrame + 1) % 4 === frame - 1 ? fireFrameMix : 0)
            : frame === 1 ? 1 : 0,
          transform: `translateX(-50%) translateY(${fireSway}px) rotate(${fireSway * 0.08}deg) scaleX(${1 + fireFlicker * 0.32}) scaleY(${1 + fireFlicker * 0.8})`,
          filter: `saturate(.86) brightness(${0.94 + scenePulse * 0.08 + fireFlicker * 0.16}) drop-shadow(0 0 7px rgba(247, 107, 28, .34))`,
        }}
      />)}
      <Image className={styles.firepit} src={`${ART}scene/firepit-base.webp`} width={1200} height={676} sizes="600px" priority unoptimized alt="" />
      <div className={`${styles.firepit} ${styles.firepitFront}`} style={{ backgroundImage: `url('${ART}scene/firepit-front-v4.webp')` }} aria-hidden="true" />

      {haunting && <>
        <div className={styles.screamerFlash} key={`flash-${haunting}`} aria-hidden="true" />
        <div className={styles.haunting} key={haunting} aria-hidden="true" style={{ opacity: hauntingOpacity, transform: `translate(-50%, -50%) scale(${hauntingScale})` }}>
          <Image src={`${ART}characters/${haunting === 'xavi' ? 'xavi-screamer-ponytail' : 'maria-screamer'}.webp`} fill sizes="min(70vw, 76vh, 800px)" alt="" />
        </div>
      </>}

      <footer className={styles.player}>
        <button type="button" className={styles.playButton} onClick={togglePlayback} aria-label={isPlaying ? 'Pausar canción' : 'Reproducir canción'}>
          {isPlaying ? 'Ⅱ' : '▶'}
        </button>
        <span className={styles.time}>{formatTime(time)}</span>
        <input
          className={styles.seek}
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={Math.min(time, duration)}
          onChange={(event) => {
            const next = Number(event.currentTarget.value);
            if (audioRef.current) audioRef.current.currentTime = next;
            setTime(next);
            mouthRef.current = { open: false, changedAt: next - 0.05, belowThresholdSince: null, smoothedVocal: 0, peakSinceOpen: 0, lastUpdateTime: null, lastCueIndex: null };
            setMouthOpen(false);
          }}
          aria-label="Posición de la canción"
        />
        <span className={styles.time}>{formatTime(duration)}</span>
        <label className={styles.volume} aria-label="Volumen">
          <span>♫</span>
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(event) => setVolume(Number(event.currentTarget.value))} />
        </label>
      </footer>
      {loadError && <div className={styles.error} role="alert">No se pudo cargar la canción o sus datos de sincronización.</div>}
    </main>
  );
}
