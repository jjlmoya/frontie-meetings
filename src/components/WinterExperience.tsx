'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { WINTER_LYRICS } from '@/data/winterLyrics';
import { paintWinter, prepareFrost, winterLight } from './WinterAtmosphere';
import { MOUTH, winterRigAt } from './WinterRig';
import styles from './WinterExperience.module.css';

type CueFile = { duration: number; sampleRateHz: number; tracks: Record<string, number[]> };
type MouthPose = 'rest' | 'soft' | 'round' | 'spread' | 'belt' | 'clenched';
type ArticulationFile = {
  words: (([number, number] | null)[])[];
  poses: [start: number, end: number, pose: MouthPose | 'closed'][];
};
const AUDIO = '/assets/winter/audio/when-the-world-stands-still.mp3';
const DURATION = 223.17;
const LAYERS = '/assets/winter/layers';
const MOUTH_POSES = ['belt', 'round', 'spread', 'clenched'] as const;
const CUES = '/assets/winter/animation-cues.json';
const ARTICULATION = '/assets/winter/articulation.json';

export function WinterExperience() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [cues, setCues] = useState<CueFile | null>(null);
  const [articulation, setArticulation] = useState<ArticulationFile | null>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(DURATION);
  const [volume, setVolume] = useState(0.72);
  const [playing, setPlaying] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState<boolean | null>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const weatherRef = useRef<HTMLCanvasElement>(null);
  const beganPlayback = useRef(false);

  useEffect(() => {
    let active = true;
    fetch(CUES).then((response) => {
      if (!response.ok) throw new Error('Winter vocal cues are unavailable');
      return response.json() as Promise<CueFile>;
    }).then((data) => { if (active) setCues(data); }).catch(() => undefined);
    fetch(ARTICULATION).then((response) => {
      if (!response.ok) throw new Error('Winter articulation is unavailable');
      return response.json() as Promise<ArticulationFile>;
    }).then((data) => { if (active) setArticulation(data); }).catch(() => undefined);
    fetch(AUDIO, { method: 'HEAD', cache: 'no-store' })
      .then((response) => { if (active) setAudioAvailable(response.ok); })
      .catch(() => { if (active) setAudioAvailable(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audioAvailable !== true) return;
    audio.volume = volume;
  }, [audioAvailable, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audioAvailable !== true) return;
    void audio.play().catch(() => undefined);
  }, [audioAvailable]);

  useEffect(() => {
    const scene = sceneRef.current;
    const face = faceRef.current;
    const weather = weatherRef.current;
    const ctx = weather?.getContext('2d');
    if (!scene || !face || !weather || !ctx) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastPaint = 0;
    let lastWeather = 0;
    let previousTime = -1;
    let wasRunning = false;
    let reduced = motion.matches;
    let resized = true;
    let aperture = 0;
    let pose: MouthPose = 'rest';
    let poseChanged = 0;
    let breath = 0;
    let kick = 0;
    let mouthX = 0;
    let mouthY = 0;
    let characterWidth = 0;
    let frost: HTMLCanvasElement;
    const resize = () => {
      weather.width = scene.clientWidth;
      weather.height = scene.clientHeight;
      resized = true;
      frost = prepareFrost(weather.width, weather.height);
      const bounds = scene.getBoundingClientRect();
      const character = face.getBoundingClientRect();
      characterWidth = character.width;
      mouthX = character.left - bounds.left + character.width * MOUTH.x;
      mouthY = character.top - bounds.top + character.width * MOUTH.y;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(scene);
    observer.observe(face);

    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      const elapsed = now - lastPaint;
      if (elapsed < 10) return;
      lastPaint = now;
      const audio = audioRef.current;
      const time = audio?.currentTime ?? 0;
      const running = !!audio && !audio.paused && !audio.seeking;
      if (!running && !wasRunning && time === previousTime && reduced === motion.matches && !resized) return;
      wasRunning = running;
      reduced = motion.matches;
      resized = false;
      const moving = running && !reduced;
      const sample = Math.floor(time * (cues?.sampleRateHz ?? 50));
      const vocal = cues?.tracks.vocal ?? [];
      const level = ((vocal[sample - 1] ?? 0) + 2 * (vocal[sample] ?? 0) + (vocal[sample + 1] ?? 0)) / 4;
      const bright = Math.min(1, (cues?.tracks.presence?.[sample] ?? 0) / Math.max(level, .045));
      const recentPeak = Math.max(.34, ...vocal.slice(Math.max(0, sample - 16), sample + 2));
      const phrase = WINTER_LYRICS.some((line) => time >= line.start - .12 && time < line.end + .12);
      const target = running && phrase ? Math.max(0, Math.min(1, (level - .075) / (recentPeak * .83))) : 0;
      const jumped = Math.abs(time - previousTime) > .25;
      if (!running || jumped) {
        aperture = 0;
        breath = 0;
        kick = 0;
      }
      const speech = running && phrase ? poseAtTime(articulation?.poses, time) : undefined;
      const openness = speech === 'closed' ? 0 : target * (1 - bright * .57);
      const jawSpeed = openness > aperture ? 48 : 30;
      aperture += (openness - aperture) * (1 - Math.exp(-elapsed * jawSpeed / 1000));
      breath = moving ? Math.max(aperture * .84, breath * Math.exp(-elapsed / 235)) : 0;
      kick = moving ? Math.max(cues?.tracks.drums?.[sample] ?? 0, kick * Math.exp(-elapsed / 212)) : 0;
      previousTime = time;

      const { storm, freeze } = winterLight(time, kick);
      const rig = winterRigAt(time, moving);
      const shiver = rig.strength;
      const tremor = shiver * Math.sin(time * 44 + Math.sin(time * 9));
      const blinkClock = time + Math.sin(time * .39) * .74;
      const blinkPhase = ((blinkClock + 1.65) % 6.4) / .24;
      const blink = moving && blinkPhase < 1 ? Math.sin(blinkPhase * Math.PI) : 0;
      const squint = moving ? Math.max(blink, shiver * .42 + kick * .13) : 0;
      const shape = motion.matches ? Math.round(aperture * 3) / 3 : aperture;
      scene.style.setProperty('--drift', `${moving ? Math.sin(time * .083) * 1.1 : 0}%`);
      scene.style.setProperty('--storm', String(storm));
      scene.style.setProperty('--sky-drift', `${moving ? Math.sin(time * .051 + .4) * 1.65 : 0}%`);
      scene.style.setProperty('--freeze', String(freeze));
      scene.style.setProperty('--jaw', String(shape));
      let nextPose: MouthPose = 'rest';
      if (speech === 'closed') {
        nextPose = 'rest';
      } else if (shape > .13) {
        if (speech) nextPose = speech;
        else if (bright > .47) nextPose = 'spread';
        else if (bright < .29 && shape > .24) nextPose = 'round';
        else if (shape > .5) nextPose = 'belt';
        else nextPose = 'soft';
      } else if (shiver > .3) {
        nextPose = 'clenched';
      }
      if (nextPose !== pose && (jumped || !running || speech || now - poseChanged >= 78 || nextPose === 'rest')) {
        pose = nextPose;
        face.dataset.mouth = pose;
        poseChanged = now;
      }
      scene.style.setProperty('--mouth-width', String(.72 + bright * .49 + shape * .19));
      scene.style.setProperty('--tremor', `${tremor * 1.55}px`);
      scene.style.setProperty('--jaw-jitter', `${tremor * 2.15}px`);
      scene.style.setProperty('--lid-depth', `${squint * 7.2}%`);
      scene.style.setProperty('--brow-tremor', `${tremor * .7}px`);
      face.style.setProperty('--head-x', `${rig.headX}px`);
      face.style.setProperty('--head-y', `${rig.headY}px`);
      face.style.setProperty('--head-roll', `${rig.headRoll}deg`);
      face.style.setProperty('--body-y', `${rig.bodyY}px`);
      face.style.setProperty('--hair-roll', `${rig.hairRoll}deg`);
      face.style.setProperty('--whisker-left', `${rig.whiskerLeft}deg`);
      face.style.setProperty('--whisker-right', `${rig.whiskerRight}deg`);
      face.style.setProperty('--paw-left', `${rig.pawLeft}px`);
      face.style.setProperty('--paw-right', `${rig.pawRight}px`);
      if (now - lastWeather >= 30 || jumped || !running) {
        paintWinter(ctx, frost, time, storm, freeze, breath, mouthX, mouthY, characterWidth, reduced, moving);
        lastWeather = now;
        if (running) setTime(time);
      }
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [articulation, cues]);

  const lyricIndex = useMemo(() => WINTER_LYRICS.findIndex((line, index) => {
    const next = WINTER_LYRICS[index + 1];
    const end = next && next.start - line.end < .75 ? next.start : line.end;
    return time >= line.start && time < end;
  }), [time]);
  const activeLyric = WINTER_LYRICS[lyricIndex];
  const wordTimes = articulation?.words[lyricIndex];
  const activeWord = wordTimes?.findIndex((word) => word && time >= word[0] && time < word[1]) ?? -1;
  const currentWord = activeWord >= 0 ? wordTimes?.[activeWord] : null;
  const wordProgress = currentWord ? (time - currentWord[0]) / (currentWord[1] - currentWord[0]) : 0;
  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || audioAvailable !== true) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  }, [audioAvailable]);

  return (
    <main ref={sceneRef} className={styles.experience} onClick={(event) => {
      if (!beganPlayback.current && !event.defaultPrevented && !(event.target instanceof Element && event.target.closest('button, input, a'))) {
        void togglePlayback();
      }
    }}>
      {audioAvailable === true && <audio
        ref={audioRef}
        src={AUDIO}
        preload="auto"
        loop
        onPlay={() => { beganPlayback.current = true; setPlaying(true); }}
        onPause={() => setPlaying(false)}
        onError={() => { setAudioAvailable(false); setPlaying(false); }}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || DURATION)}
        onSeeked={(event) => setTime(event.currentTarget.currentTime)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
      />}

      <Image className={styles.landscape} src="/assets/winter/layers/winter-landscape.webp" alt="" fill priority sizes="100vw" />
      <Image className={styles.sky} src={`${LAYERS}/winter-landscape.webp`} alt="" fill sizes="100vw" aria-hidden="true" />
      <div className={styles.worldShade} aria-hidden="true" />
      <div className={styles.iceVeil} aria-hidden="true" />
      <div className={styles.groundMist} aria-hidden="true" />
      <div ref={faceRef} className={styles.character}>
        <Image className={styles.rigBody} src={`${LAYERS}/frontie-rig-body.webp`} alt="Frontie frozen in a hand-drawn winter landscape" fill unoptimized priority />
        <RigLayer part="paw-left" className={styles.pawLeft} />
        <RigLayer part="paw-right" className={styles.pawRight} />
        <div className={styles.rigHead}>
          <RigLayer part="head" />
          <RigLayer part="hair" className={styles.rigHair} />
          <RigLayer part="whiskers-left" className={styles.whiskersLeft} />
          <RigLayer part="whiskers-right" className={styles.whiskersRight} />
          <Image className={styles.eyes} src={`${LAYERS}/frontie-eyelids.webp`} alt="" fill unoptimized aria-hidden="true" />
          <Image className={styles.mouth} src={`${LAYERS}/frontie-mouth-open.webp`} alt="" fill unoptimized priority aria-hidden="true" />
          {MOUTH_POSES.map((pose) => (
            <div key={pose} className={styles.mouthPose} data-pose={pose} aria-hidden="true">
              <Image src={`${LAYERS}/frontie-mouth-${pose}.webp`} alt="" fill unoptimized priority />
            </div>
          ))}
        </div>
      </div>
      <canvas ref={weatherRef} className={styles.weather} aria-hidden="true" />
      <div className={styles.paperGrain} aria-hidden="true" />

      <header className={styles.header}>
        <span>FRONT-LINE</span>
        <span className={styles.headerTitle}>A WINTER SONG</span>
      </header>

      <section className={styles.titleStage}>
        <h1>When the World Stands <i>Still</i></h1>
      </section>

      <div className={styles.subtitles} aria-live="off">
        {activeLyric && (
          <p
            className={styles.lyric}
            key={activeLyric.start}
            data-refrain={activeLyric.text === 'When the world stands still'}
            style={{ '--sung-progress': `${wordProgress * 100}%` } as CSSProperties}
          >
            {activeLyric.text.split(/(\s+)/).map((part, index) => (
              index % 2 === 0
                ? <span key={index} data-sung={activeWord === index / 2}>{part}</span>
                : part
            ))}
          </p>
        )}
      </div>
      <footer className={styles.player}>
        <button type="button" onClick={togglePlayback} disabled={audioAvailable !== true} aria-label={playing ? 'Pause song' : 'Play song'}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <span className={styles.clock}>{formatTime(time)}</span>
        <div className={styles.iceTimeline} style={{ '--progress': `${progress}%` } as CSSProperties}>
          <div className={styles.crackTrack} aria-hidden="true">
            <span className={styles.crackShape} />
            <span className={`${styles.crackShape} ${styles.crackProgress}`} />
            <span className={styles.faceMarker}>
              <span className={styles.faceCrop}>
                <Image src={`${LAYERS}/winter-frozen-expression.webp`} alt="" width={646} height={364} unoptimized />
              </span>
            </span>
          </div>
          <input
            aria-label="Seek in song"
            aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
            type="range"
            min="0"
            max={duration}
            step=".01"
            value={Math.min(time, duration)}
            disabled={audioAvailable !== true}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (audioRef.current) audioRef.current.currentTime = next;
              setTime(next);
            }}
          />
        </div>
        <span className={styles.clock}>{formatTime(duration)}</span>
        <label className={styles.volume}>
          <span>Vol</span>
          <input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={volume} disabled={audioAvailable !== true} onChange={(event) => setVolume(Number(event.target.value))} />
        </label>
        {audioAvailable === false && <span className={styles.audioError}>AUDIO UNAVAILABLE</span>}
      </footer>
    </main>
  );
}

function RigLayer({ part, className }: { part: string; className?: string }) {
  return (
    <Image className={className} src={`${LAYERS}/frontie-rig-${part}.webp`}
      alt="" fill unoptimized priority aria-hidden="true" />
  );
}

function poseAtTime(poses: ArticulationFile['poses'] | undefined, time: number) {
  if (!poses?.length) return undefined;
  let left = 0;
  let right = poses.length;
  while (left < right) {
    const middle = (left + right) >>> 1;
    if (poses[middle][0] <= time) left = middle + 1;
    else right = middle;
  }
  const pose = poses[left - 1];
  return pose && time < pose[1] ? pose[2] : undefined;
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}
