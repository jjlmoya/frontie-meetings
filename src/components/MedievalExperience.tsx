'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { getCurrentLyricIndex, getLyricSection } from '@/data/medievalLyrics';

type CueTracks = Record<string, number[]>;
type CueFile = { duration: number; sampleRateHz: number; tracks: CueTracks };
type MotionFrame = {
  time: number;
  drums: number;
  percussion: number;
  bass: number;
  guitar: number;
  backing: number;
  brass: number;
  woodwinds: number;
  speaking: boolean;
};

const AUDIO_URL = '/assets/medieval/audio/frontie-the-feline-king.mp3';
const CUES_URL = '/assets/medieval/animation-cues.json';
const ART = '/assets/medieval/layers/';
const DETAILS = '/assets/medieval/details/';
const SCENE_LAYERS = [
  'cielo-base.png', 'nube-izquierda.png', 'nube-derecha.png', 'castillo-fondo.png',
  'casa-izquierda.png', 'casa-derecha.png', 'arboleda.png', 'muralla.png',
  'suelo-escenario.png', 'hojas-suelo.png', 'banderines-izquierda.png', 'banderines-derecha.png',
  'pilar-izquierdo.png', 'pilar-derecho.png',
  'cortina-superior.png', 'cortina-izquierda.png', 'cortina-derecha.png',
];
const EMPTY_FRAME: MotionFrame = {
  time: 0, drums: 0, percussion: 0, bass: 0, guitar: 0, backing: 0, brass: 0, woodwinds: 0, speaking: false,
};

const ambientEvents = {
  birds: [23.4, 66.1, 101.8, 126.4],
  dragon: [42.7, 112.3],
  rat: [14.2, 52.8, 83.6, 119.7],
  waldo: [31.3, 76.9, 109.4],
  flag: [18.5, 59.7, 95.1, 130.2],
};

const smooth = (value: number) => {
  const x = Math.max(0, Math.min(1, value));
  return x * x * (3 - 2 * x);
};
function eventAt(time: number, starts: number[], duration: number, enter = .7, exit = .8) {
  const start = starts.find((at) => time >= at && time < at + duration);
  if (start === undefined) return null;
  const elapsed = time - start;
  const visibility = smooth(elapsed / enter) * smooth((duration - elapsed) / exit);
  return { elapsed, progress: elapsed / duration, visibility };
}

function layerMotion(layer: string, time: number): CSSProperties {
  if (layer === 'nube-izquierda.png') return { transform: `translate(${Math.sin(time * .15) * 15}px, ${Math.sin(time * .31) * 3}px)` };
  if (layer === 'nube-derecha.png') return { transform: `translate(${Math.sin(time * .12 + 2) * 19}px, ${Math.sin(time * .27 + 1) * 4}px)` };
  if (layer === 'arboleda.png') return { transform: `translateY(5%) translateX(${Math.sin(time * .46) * 2.5}px) rotate(${Math.sin(time * .39) * .08}deg)`, transformOrigin: '50% 72%' };
  if (layer === 'castillo-fondo.png') return { transform: 'translateY(14%)' };
  if (['casa-izquierda.png', 'casa-derecha.png'].includes(layer)) return { transform: 'translateY(4%)' };
  if (layer === 'muralla.png') return { transform: 'translateY(1.6%)' };
  if (layer === 'banderines-izquierda.png' || layer === 'banderines-derecha.png') return { transform: `translateY(${Math.sin(time * .85 + (layer.includes('derecha') ? 1.8 : 0)) * 1.4}px)` };
  return {};
}

function StageLife({ time }: { time: number }) {
  const birds = eventAt(time, ambientEvents.birds, 7.7, .8, 1);
  const dragon = eventAt(time, ambientEvents.dragon, 9.4, 1.2, 1.3);
  const rat = eventAt(time, ambientEvents.rat, 5.4, .3, .6);
  const waldo = eventAt(time, ambientEvents.waldo, 5.8, .7, .8);
  const flag = eventAt(time, ambientEvents.flag, 7.6, .8, 1.2);
  const waldoBodyRise = waldo ? smooth((waldo.elapsed - 1) / 1.4) * smooth((5.1 - waldo.elapsed) / .7) : 0;
  const waldoHandsVisible = waldo ? smooth((waldo.elapsed - .35) / .35) * smooth((5.7 - waldo.elapsed) / .45) : 0;

  return <>
    {birds && [1, 2, 3].map((n) => <img key={n} className="medieval-life-bird" src={`${DETAILS}bird-${n}.png`} alt="" style={{
      zIndex: 5, width: `${4.3 + n * .65}%`, top: `${13 + n * 3}%`,
      left: `${-12 + birds.progress * 130 - n * 7}%`, opacity: birds.visibility * .9,
      transform: `translateY(${Math.sin(time * (8 + n) + n) * (3 + n)}px) rotate(${Math.sin(time * (7 + n) + n) * 5}deg)`,
    }} />)}
    {dragon && <img className="medieval-life-dragon" src={`${DETAILS}paper-dragon.png`} alt="" style={{
      zIndex: 5, width: '24%', top: `${20 + Math.sin(time * .8) * 4}%`, left: `${-28 + dragon.progress * 152}%`,
      opacity: dragon.visibility, transform: `rotate(${Math.sin(time * 3) * 5}deg) scale(${.85 + Math.sin(time * .7) * .05})`,
    }} />}
    {flag && <img className="medieval-life-flag" src={`${DETAILS}front-line-flag.png`} alt="" style={{
      zIndex: 6, width: '12%', left: '78%', bottom: '28%', opacity: flag.visibility,
      transform: `translateY(${(1 - flag.visibility) * 95}%) rotate(${Math.sin(time * 2.2) * 2.2}deg)`,
    }} />}
    {waldo && <>
      <img className="medieval-life-waldo" src={`${DETAILS}waldo-body.png`} alt="" style={{ zIndex: 6, opacity: waldo.visibility, transform: `translateY(${(1 - waldoBodyRise) * 115}%) rotate(${Math.sin(time * 2.7) * .8}deg)` }} />
      <img className="medieval-life-waldo" src={`${DETAILS}waldo-hands.png`} alt="" style={{ zIndex: 8, opacity: waldoHandsVisible, transform: `rotate(${Math.sin(time * 2.7) * .8}deg)` }} />
    </>}
    {rat && <img className="medieval-life-rat" src={`${DETAILS}running-rat.png`} alt="" style={{
      zIndex: 11, width: '9%', left: `${-10 + rat.progress * 123}%`, bottom: `${12 + Math.max(0, Math.sin(time * 16)) * .6}%`,
      opacity: rat.visibility, transform: `rotate(${Math.sin(time * 11) * 3}deg)`,
    }} />}
  </>;
}

function getAct(time: number) {
  if (time < 17) return 'intro';
  if (time < 33.3) return 'verse';
  if (time < 50.5) return 'chorus';
  if (time < 58.5) return 'interlude';
  if (time < 74.8) return 'verse';
  if (time < 91.2) return 'chorus';
  if (time < 108.3) return 'bridge';
  if (time < 109) return 'interlude';
  if (time < 124.6) return 'outro';
  if (time < 133.6) return 'interlude';
  return 'outro';
}

function SceneDetails({ time, energy }: { time: number; energy: number }) {
  return <div className="medieval-scene-details" aria-hidden="true">
    {['♪', '♫', '♬', '✦', '♪'].map((note, index) => {
      const phase = time * (1.3 + index * 0.22) + index * 1.7;
      const lift = Math.sin(phase) * (10 + energy * 28);
      const sway = Math.cos(phase * .7) * (6 + energy * 22);
      return <span key={index} className={`medieval-floating-note note-${index}`} style={{ transform: `translate(${sway}px, ${lift}px) rotate(${Math.sin(phase) * (8 + energy * 18)}deg) scale(${.7 + energy * .65})`, opacity: .32 + energy * .65 }}>{note}</span>;
    })}
    <span className="medieval-stage-mug">🍺</span>
    <span className="medieval-stage-cheese">◒</span>
  </div>;
}

export function MedievalExperience() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const frameRef = useRef(EMPTY_FRAME);
  const mouthRef = useRef({ open: false, changedAt: 0 });
  const lastRenderRef = useRef(0);
  const [cues, setCues] = useState<CueFile | null>(null);
  const [frame, setFrame] = useState(EMPTY_FRAME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.42);
  const [loadError, setLoadError] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(CUES_URL).then((response) => {
      if (!response.ok) throw new Error('Could not load music cues');
      return response.json() as Promise<CueFile>;
    }).then((data) => { if (active) setCues(data); }).catch(() => { if (active) setCues(null); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => {
      setIsPlaying(true);
      setAutoplayBlocked(false);
    }).catch(() => {
      setAutoplayBlocked(true);
    });
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = (now: number) => {
      const audio = audioRef.current;
      if (audio && !audio.paused && cues) {
        const time = audio.currentTime;
        const index = Math.min(cues.tracks.lead.length - 1, Math.floor(time * cues.sampleRateHz));
        const at = (name: string) => cues.tracks[name]?.[index] ?? 0;
        const section = getLyricSection(time);
        const vocalEnergy = at('lead');
        const voiced = Boolean(section?.lines.length) && vocalEnergy > 0.16;
        if (time < mouthRef.current.changedAt || !voiced) {
          mouthRef.current = { open: false, changedAt: time };
        }
        const previous = mouthRef.current.open;
        const syllable = Math.sin(time * Math.PI * (7.2 + vocalEnergy * 2.2));
        const desired = voiced && syllable > -.08 - vocalEnergy * .2;
        if (desired !== previous && time - mouthRef.current.changedAt >= 0.075) {
          mouthRef.current = { open: desired, changedAt: time };
        }
        if (now - lastRenderRef.current > 1000 / 30) {
          const next = {
            time,
            drums: at('drums'), percussion: at('percussion'), bass: at('bass'),
            guitar: Math.max(at('guitar'), at('strings')),
            backing: at('backing'), brass: at('brass'), woodwinds: at('woodwinds'),
            speaking: mouthRef.current.open,
          };
          frameRef.current = next;
          setFrame(next);
          lastRenderRef.current = now;
        }
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [cues]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        if (audio.ended || audio.currentTime >= audio.duration) audio.currentTime = 0;
        await audio.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
        setLoadError(false);
      } catch {
        setLoadError(true);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, value));
    mouthRef.current = { open: false, changedAt: audio.currentTime };
    setFrame((previous) => ({ ...previous, time: audio.currentTime, speaking: false }));
  }, []);

  const section = useMemo(() => getLyricSection(frame.time), [frame.time]);
  const act = getAct(frame.time);
  const activeLine = section ? getCurrentLyricIndex(section, frame.time) : -1;
  const duration = cues?.duration ?? 142.032;
  const progress = duration ? (frame.time / duration) * 100 : 0;
  const beat = Math.sin(frame.time * Math.PI * 4);
  const bounce = isPlaying ? Math.max(0, beat) * (1 + frame.drums * 3) : 0;
  const bodyTilt = isPlaying ? beat * (1.3 + frame.bass * 2.2) : 0;
  const tailSwing = isPlaying ? Math.sin(frame.time * Math.PI * 4 + 0.7) * (4 + frame.percussion * 9) : 2;
  const strum = isPlaying ? Math.sin(frame.time * Math.PI * 7.2) * (3 + frame.guitar * 12) : 0;
  const headNod = isPlaying ? Math.sin(frame.time * Math.PI * 2 + 0.3) * (1.5 + frame.backing * 5) : 0;
  const flare = Math.min(1, Math.max(frame.brass, frame.woodwinds) * 1.4);

  const activeLineText = section && activeLine >= 0 ? section.lines[activeLine].text : '';

  return (
    <main className={`medieval-experience act-${act}`}>
      <audio
        ref={audioRef}
        src={AUDIO_URL}
        preload="auto"
        autoPlay
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => { setIsPlaying(false); mouthRef.current = { open: false, changedAt: audioRef.current?.currentTime ?? 0 }; setFrame((previous) => ({ ...previous, speaking: false })); }}
        onEnded={() => { setIsPlaying(false); mouthRef.current = { open: false, changedAt: 0 }; setFrame((previous) => ({ ...previous, speaking: false })); }}
        onError={() => setLoadError(true)}
      />
      <div className="medieval-scene-layers" aria-hidden="true">
        {SCENE_LAYERS.map((layer, index) => <img key={layer} className="medieval-scene-layer" style={{ zIndex: index, ...layerMotion(layer, frame.time) }} src={`${ART}scene/${layer}`} alt="" />)}
        <StageLife time={frame.time} />
      </div>
      <div className="medieval-vignette" />
      <div className="medieval-back-glow" style={{ opacity: 0.1 + frame.bass * 0.18 + flare * 0.16 }} />

      <SceneDetails time={frame.time} energy={Math.max(frame.guitar, frame.percussion, frame.brass, frame.woodwinds)}/>
      <div className="medieval-cat-shadow" style={{ transform: `translateX(-50%) scaleX(${1.03 - bounce * 0.009})`, opacity: 0.42 - bounce * 0.007 }} />

      <div
        className="medieval-cat-rig"
        style={{
          left: '50%',
          transform: `translateX(-50%) translateY(${-bounce}px)`,
          filter: `drop-shadow(0 14px 18px rgba(24, 10, 8, .38)) drop-shadow(0 0 ${4 + flare * 16}px rgba(255, 198, 73, ${0.12 + flare * 0.28}))`,
        }}
        aria-label={frame.speaking && isPlaying ? 'Frontie está cantando' : 'Frontie'}
      >
        <span className="cat-contact-shadow" aria-hidden="true" />
        <img className="cat-tail" src={`${ART}cola.png`} alt="" style={{ transform: `rotate(${tailSwing}deg)` }} />
        <img className="cat-leg cat-leg-left" src={`${ART}pierna-derecha.png`} alt="" style={{ transform: `scaleX(-1) rotate(${isPlaying ? beat * (2 + frame.drums * 2) : 0}deg)` }} />
        <img className="cat-leg cat-leg-right" src={`${ART}pierna-derecha.png`} alt="" style={{ transform: `rotate(${isPlaying ? -beat * (2 + frame.drums * 2) : 0}deg)` }} />
        <img className="cat-torso" src={`${ART}torso.png`} alt="" style={{ transform: `rotate(${bodyTilt}deg) scale(${1 + frame.bass * 0.012})` }} />
        <img className="cat-arm cat-arm-fret" src={`${ART}brazo-acordes.png`} alt="" style={{ transform: `rotate(${isPlaying ? Math.sin(frame.time * 5.8) * (1 + frame.guitar * 2) : 0}deg)` }} />
        <img className="cat-lute" src={`${ART}laud.png`} alt="" style={{ transform: `rotate(${isPlaying ? beat * (1 + frame.guitar * 2) : 0}deg)` }} />
        <img className="cat-arm cat-arm-strum" src={`${ART}brazo-rasgueo.png`} alt="" style={{ transform: `rotate(${strum}deg)` }} />
        <img
          className={`cat-head ${frame.speaking && isPlaying ? 'is-speaking' : ''}`}
          src={`${ART}${frame.speaking && isPlaying ? 'cabeza-cantando.png' : 'cabeza-cerrada.png'}`}
          alt=""
          style={{ transform: `rotate(${headNod}deg)` }}
        />
        <span className="cat-sound-burst" style={{ opacity: frame.speaking && isPlaying ? 0.9 : 0, transform: `scale(${0.8 + frame.backing * 0.55})` }}>♪</span>
      </div>

      <div className="medieval-side-stage" aria-hidden="true">
        <div className="medieval-candle-eq">
          {[frame.bass, frame.drums, frame.percussion, frame.guitar, frame.brass, frame.woodwinds, frame.backing].map((level, index) =>
            <div key={index} className="stage-candle" style={{ height: `${26 + (index % 3) * 8 + level * 56}px` }}><i /></div>
          )}
        </div>
        {flare > 0.35 && <span className="brass-spark brass-spark-one">✦</span>}
        {flare > 0.55 && <span className="brass-spark brass-spark-two">✧</span>}
      </div>

      {activeLineText && <section className="medieval-lyrics" aria-live="polite" aria-label="Letra de la canción">
        <p key={`${section?.id}-${activeLine}`} className="medieval-lyric-line">{activeLineText}</p>
      </section>}

      <footer className="medieval-player">
        <button className={`medieval-play-button ${autoplayBlocked ? 'needs-start' : ''}`} onClick={togglePlayback} aria-label={isPlaying ? 'Pausar canción' : 'Reproducir canción'}>
          {isPlaying ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.5 18 12 6 19.5Z" /></svg>}
        </button>
        <div className="medieval-track-meta"><span>{formatTime(frame.time)} / {formatTime(duration)}</span></div>
        <input aria-label="Posición de la canción" className="medieval-seek" type="range" min={0} max={duration} step={0.1} value={Math.min(frame.time, duration)} onChange={(event) => seek(Number(event.target.value))} style={{ '--seek-progress': `${progress}%` } as CSSProperties} />
        <label className="medieval-volume" aria-label="Volumen"><span>♫</span><input type="range" min={0} max={1} step={0.01} value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
      </footer>
      {loadError && <div className="medieval-error" role="alert">No se pudo cargar el audio. Revisa que el MP3 esté disponible.</div>}
      {!cues && <div className="medieval-cue-note">Cargando sincronización musical…</div>}
    </main>
  );
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}
