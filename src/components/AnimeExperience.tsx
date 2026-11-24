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
import { deathNoteWebcamFrame, webcamViseme } from '@/data/animeWebcam';
import type { FrontieViseme } from '@/data/animeWebcam';
import { kiraCleanPlate } from './animeCharacterActing';
import { teamPrankKick, teamPrankLayers } from './animeTeamPrank';
import { clawPressure, cutActionPlates, hasCutActionPlate, katanaRecoil, katanaSprite } from './animeCutActions';
import { hasLateBeatPlate, isLateBeatShot, keyImpact, lateBeatPlates, perceptionOnset } from './animeLateBeats';
import { closedMonitorShot } from './animeOpeningEyes';
import { drawAnimeOpeningEffects } from './animeOpeningEffects';
import styles from './AnimeExperience.module.css';

const ASSETS = '/assets/anime/';
const shotSource = (image: string) => image === 'monitor'
  ? `${ASSETS}${closedMonitorShot}` : `${ASSETS}shots/${image}.webp`;
const cueTrack = cues.tracks;

// A continuous coil around the beam. The audio position clips the beam and coil together.
const beamSpiral = 'M0 16' + Array.from({ length: 20 }, (_, i) => {
  const x = i * 60;
  return ` C${x + 11},1 ${x + 36},1 ${x + 30},16 S${x + 49},31 ${x + 60},16`;
}).join('');

const timeLabel = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
const shotFor = (time: number) => Math.max(0, animeShots.findLastIndex(([start]) => time >= start));
const lineFor = (time: number) => animeSubtitles.findIndex(([start, end]) => time >= start && time < end);

function cueFor(track: number[], time: number) {
  return track[Math.min(track.length - 1, Math.max(0, Math.floor(time * cues.sampleRateHz)))] ?? 0;
}

export function AnimeExperience() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const shotArt = useRef<HTMLImageElement>(null);
  const redrawEffects = useRef<(() => void) | null>(null);
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
      preload.src = shotSource(image);
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
    const cleanPlate = new window.Image();
    const monitorOpen = new window.Image();
    const katana = new window.Image();
    const prankLayers = { roof: new window.Image(), frontie: new window.Image(), partner: new window.Image(), team: new window.Image() };
    const cutPlates = {
      'dawn-eye': new window.Image(),
      rasengan: new window.Image(),
      'three-crescents': new window.Image(),
      'transit-open': new window.Image(),
      'key-strike': new window.Image(),
    };
    const beatPlates = {
      breaker: new window.Image(),
      tired: new window.Image(),
      paw: new window.Image(),
      'distant-orb': new window.Image(),
    };

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
      const deathNote = deathNoteWebcamFrame(current, reduced);
      const allowed = !audio.paused && !reduced && !deathNote && activeLine >= 0;
      // Hold short dips so the mouth doesn't chatter between adjacent syllables.
      const nextMouth = allowed ? webcamViseme(activeLine, activeSyllable, vocal, lastMouth) : 'rest';
      if (nextMouth !== lastMouth && (!allowed || seek || current - lastMouthChange >= 0.036)) {
        setMouth(nextMouth);
        lastMouth = nextMouth;
        lastMouthChange = current;
      }

      if (camera.current) paintAnimeWebcam(camera.current, current, audio.paused ? 0 : vocal, audio.paused ? 0 : energy, reduced, deathNote);

      const drawInterval = image === 'three-crescents' || image === 'team-prank' ? .012 : .019;
      if (!reduced && (Math.abs(current - lastDrawnTime) >= drawInterval || seek)) {
        const cameraProgress = activeShot === animeShots.length - 1 ? 1 - progress : progress;
        const locked = effect === 'manga' || effect === 'kira' || image === 'red-power';
        const quiet = effect === 'still';
        const flying = effect === 'nimbus';
        const distance = locked ? 0 : quiet ? 0.4 : flying ? 3.8 : effect === 'run' ? 8 : 3;
        const lift = locked ? 0 : quiet ? 0.12 : flying ? -0.7 : effect === 'slash' ? -2.6 : -1.35;
        const impact = effect === 'slash' ? Math.max(0, 0.1 - local * 0.22) : 0;
        const spring = effect === 'gear' ? Math.sin(local * 16) * Math.exp(-local * 2.6) : 0;
        const moonRelease = image === 'sailor-moon' ? Math.max(0, local - 1.23) : 0;
        const moonKick = moonRelease > 0 ? Math.sin(moonRelease * 46) * Math.exp(-moonRelease * 12) : 0;
        const landingBeat = local - .12;
        const landingKick = image === 'combat-land' && landingBeat > 0
          ? Math.sin(landingBeat * 49) * Math.exp(-landingBeat * 10) : 0;
        const writingFocus = image === 'kira' ? Math.max(0, Math.min(1, (local - .16) / .62)) : 0;
        const strikeAge = local - keyImpact;
        const keyKick = image === 'paw' && strikeAge > 0
          ? Math.cos(strikeAge * 51) * Math.exp(-strikeAge * 14) : 0;
        const perceptionAge = local - perceptionOnset;
        const perceptionKick = image === 'crest-ignites' && perceptionAge > 0
          ? Math.cos(perceptionAge * 34) * Math.exp(-perceptionAge * 4.5) : 0;
        const swordKick = image === 'three-crescents' ? katanaRecoil(local) : 0;
        const prankKick = image === 'team-prank' ? teamPrankKick(local) : 0;
        const tapping = image === 'key-strike' ? clawPressure(local) : 0;
        const rasenganDrive = image === 'rasengan' ? Math.max(0, (local - 1.76) / .48) : 0;
        const zoom = image === 'kira' ? 1 + writingFocus * .22
          : image === 'sailor-moon' ? 1.18 - progress * .1 + moonKick * .026
          : image === 'combat-land' ? 1.04 + progress * .032 + landingKick * .02
          : image === 'rain-blade' ? 1.06 + progress * .044
          : image === 'team-prank' ? 1.035 + progress * .048 + prankKick * .031
          : image === 'spirit-bomb' ? 1.075 - progress * .035
          : image === 'rasengan' ? 1.07 + progress * .085 + Math.min(1, rasenganDrive) * .21
          : image === 'three-crescents' ? 1.045 + progress * .04 + swordKick * .037
          : image === 'key-strike' ? 1.075 + progress * .06 + tapping * .016
          : image === 'paw' ? 1.09 + progress * .09 + keyKick * .054
          : image === 'crest-ignites' ? 1.1 + progress * .10 + perceptionKick * .063
          : locked ? 1 : effect === 'gear' ? 1.055 + cameraProgress * 0.05
          : flying ? 1.045 + cameraProgress * 0.038 : quiet ? 1.01 + cameraProgress * 0.02 : 1.10 + cameraProgress * 0.13;
        // Preserve the camera directions of cuts after merged shots.
        const panIndex = activeShot + Number(start >= 7.85) + Number(start >= 23.02) + Number(start >= 37) + Number(start >= 46.68) + Number(start >= 85.64);
        const direction = effect === 'run' || effect === 'train' || flying || panIndex % 2 === 0 ? 1 : -1;
        const bank = flying ? 0.8 + Math.sin(local * 3.5) * 1.05 : 0;
        const pictureMotion = {
          x: (cameraProgress - 0.5) * distance * direction + moonKick * .75 + writingFocus * 3.5 + keyKick * 1.3 + perceptionKick * 2.2 - swordKick * 1.35 - prankKick * .7 - (image === 'team-prank' ? Math.max(0, progress - .61) * 10 : 0),
          y: Math.sin(cameraProgress * Math.PI) * lift - spring * 2 + bank - moonKick * .55 + landingKick * 1.4 - writingFocus * 3.9 + keyKick * 3.2 - perceptionKick * 2.05 + tapping * .85 + swordKick * 1.25 + prankKick * 1.3,
          scale: zoom + (image === 'rain-blade' || image === 'three-crescents' ? 0 : impact) + spring * 0.042,
        };
        stage.style.setProperty('--camera-x', `${pictureMotion.x}%`);
        stage.style.setProperty('--camera-y', `${pictureMotion.y}%`);
        stage.style.setProperty('--camera-scale', String(pictureMotion.scale));
        const remaining = duration - current;
        const outro = Math.max(0, 1 - remaining / 0.74);
        const intro = Math.max(0, 1 - current / 0.52);
        const bridge = Math.max(outro, intro);
        const ledTravel = Math.min(1, Math.max(0, (outro - 0.56) / 0.4));
        const easedTravel = ledTravel * ledTravel * (3 - 2 * ledTravel);
        stage.style.setProperty('--loop-veil', String(audio.paused ? 0 : bridge * 0.96));
        stage.style.setProperty('--loop-led', String(audio.paused ? 0 : Math.min(1, bridge * 1.6)));
        stage.style.setProperty('--loop-led-x', `${intro ? 51.4 : 50 + easedTravel * 1.4}%`);
        stage.style.setProperty('--loop-led-y', `${intro ? 57 : 88.5 - easedTravel * 31.5}%`);
        drawAnimeOpeningEffects(ctx, {
          effect, image, time: current, local, remaining: end - current, progress, energy, camera: pictureMotion,
          art: shotArt.current?.dataset.shot === image ? shotArt.current : undefined,
          kiraPlate: cleanPlate,
          monitorOpen,
          lateBeatPlate: hasLateBeatPlate(image) ? beatPlates[image] : undefined,
          cutActionPlate: hasCutActionPlate(image) ? cutPlates[image] : undefined,
          katanaArt: katana,
          prankLayers,
        });
        lastDrawnTime = current;
      } else if (reduced) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        lastDrawnTime = current;
      }
    };

    const redraw = () => {
      lastDrawnTime = -1;
      renderFrame();
    };
    redrawEffects.current = redraw;
    cleanPlate.onload = redraw;
    cleanPlate.src = `${ASSETS}${kiraCleanPlate}`;
    monitorOpen.onload = redraw;
    monitorOpen.src = `${ASSETS}shots/monitor.webp`;

    for (const name of ['breaker', 'tired', 'paw', 'distant-orb'] as const) {
      beatPlates[name].onload = redraw;
      beatPlates[name].src = `${ASSETS}actions/${lateBeatPlates[name]}`;
    }

    katana.onload = redraw;
    katana.src = `${ASSETS}${katanaSprite}`;
    for (const name of ['dawn-eye', 'rasengan', 'three-crescents', 'transit-open', 'key-strike'] as const) {
      cutPlates[name].onload = redraw;
      cutPlates[name].src = `${ASSETS}actions/${cutActionPlates[name]}`;
    }

    for (const name of ['roof', 'frontie', 'partner', 'team'] as const) {
      prankLayers[name].onload = redraw;
      prankLayers[name].src = `${ASSETS}actions/${teamPrankLayers[name]}`;
    }

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
      stage.style.setProperty('--loop-led', '0');
      setMouth('rest');
    };

    audio.addEventListener('play', startFrames);
    audio.addEventListener('pause', stopFrames);
    audio.addEventListener('seeked', renderFrame);
    motion.addEventListener('change', renderFrame);
    if (!audio.paused) startFrames();
    else renderFrame();

    return () => {
      cleanPlate.onload = null;
      monitorOpen.onload = null;
      katana.onload = null;
      for (const layer of Object.values(prankLayers)) layer.onload = null;
      for (const plate of Object.values(beatPlates)) plate.onload = null;
      for (const plate of Object.values(cutPlates)) plate.onload = null;
      redrawEffects.current = null;
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
        if (!started.current && !(event.target as Element).closest('button, a, input, label')) void play();
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
          <Image key={shot[1]} ref={shotArt} data-shot={shot[1]} alt="" fill sizes="100vw" priority={shotIndex === 0} unoptimized
            className={styles.shot} src={shotSource(shot[1])}
            style={{ objectPosition: `50% ${shot[3] ?? 50}%` }}
            onLoad={() => {
              setLastPaintedShot(shot);
              if (shot[1] === 'kira' || isLateBeatShot(shot[1]) || hasCutActionPlate(shot[1])) redrawEffects.current?.();
            }}
          />
          <canvas ref={canvas} className={styles.effects} width={1280} height={720} aria-hidden="true" />
          <div className={styles.grade} aria-hidden="true" />
          <span className={styles.loopLed} aria-hidden="true" />
        </div>

        <Link href="/" className={styles.home} aria-label="Back to song selector">FRONT-LINE</Link>

        <AnimeWebcam cameraRef={camera} viseme={mouth} />

        {titleVisible && <div className={styles.title}>
          <h1 lang="ja">{ANIME_TITLE}</h1>
          <p>FRONTIE, RACE THROUGH THE NIGHT!</p>
        </div>}

        <AnimeKaraokeLyrics key={lyricIndex} line={lyricIndex} syllable={syllable} />

        <div className={styles.player} aria-label="Frontie’s stream control deck">
          <button type="button" className={styles.transport} aria-label={playing ? 'Pause' : 'Play'} onClick={() => {
            if (audioRef.current?.paused) void play();
            else audioRef.current?.pause();
          }} data-playing={playing}>
            <span className={styles.arcadeKey} aria-hidden="true"><span /></span>
          </button>
          <label className={styles.deckRail} data-playing={playing} style={{ '--beam-level': `${Math.min(time / duration, 1) * 100}%` } as CSSProperties}>
            <input aria-label="Song position" type="range" min={0} max={duration} step={0.01}
              aria-valuetext={`${timeLabel(time)} / ${timeLabel(duration)}`}
              value={Math.min(time, duration)} onChange={(event) => {
                const next = event.currentTarget.valueAsNumber;
                if (audioRef.current) audioRef.current.currentTime = next;
                syncClock(next);
              }}
            />
            <span className={styles.beamTrack} aria-hidden="true">
              <svg className={styles.beamFill} viewBox="0 0 1200 32" preserveAspectRatio="none">
                <path className={styles.beamCore} d="M0 16 H1200" />
                <path className={styles.beamSpiral} d={beamSpiral} />
                <path className={styles.beamFilament} d={beamSpiral} />
              </svg>
              <span className={styles.beamTip} />
            </span>
            <span className={styles.deckTime} aria-hidden="true">{timeLabel(time)}</span>
          </label>
          <label className={styles.deckVolume} style={{ '--dial': `${volume * 270 - 135}deg`, '--level': `${volume * 270}deg` } as CSSProperties}>
            <input aria-label="Volume" type="range" min={0} max={1} step={0.01}
              aria-valuetext={`${Math.round(volume * 100)}%`}
              value={volume} onChange={(event) => setVolume(event.currentTarget.valueAsNumber)}
            />
            <span className={styles.volumeDial} aria-hidden="true"><span /></span>
          </label>
        </div>
        {error && <div className={styles.error} role="alert">{error}</div>}
      </div>
    </main>
  );
}
