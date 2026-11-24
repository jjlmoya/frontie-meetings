import Image from 'next/image';
import type { CSSProperties, RefObject } from 'react';
import { animeWebcamFrame } from '@/data/animeWebcam';
import type { FrontieViseme } from '@/data/animeWebcam';
import styles from './AnimeWebcam.module.css';

const ASSETS = '/assets/anime/streamer/';
type SingingViseme = Exclude<FrontieViseme, 'rest'>;

const mouths: Record<SingingViseme, {
  rim: string;
  tongue: string;
  teeth?: string;
}> = {
  small: {
    rim: 'M-24 3 Q-12 -11 10 -9 Q26 -9 27 4 Q17 14 4 16 Q-12 16 -24 3Z',
    tongue: 'M-13 11 Q0 5 16 10 Q9 16 2 16 Q-6 16 -13 11Z',
  },
  a: {
    rim: 'M-41 4 Q-31 -16 -2 -17 Q26 -19 42 -2 Q38 32 5 46 Q-24 48 -41 4Z',
    tongue: 'M-25 29 Q-10 16 4 28 Q22 20 30 31 Q17 46 2 46 Q-16 45 -25 29Z',
    teeth: 'M-32 -3 Q-8 -14 28 -8 L24 7 Q12 9 3 8 L1 3 L-2 8 Q-19 8 -30 4Z',
  },
  e: {
    rim: 'M-41 6 Q-29 -11 2 -13 Q26 -13 43 0 Q37 26 3 29 Q-28 26 -41 6Z',
    tongue: 'M-22 21 Q0 13 23 20 Q13 28 2 29 Q-12 27 -22 21Z',
    teeth: 'M-34 2 Q-10 -12 34 -5 L28 8 Q9 11 3 8 L0 3 L-3 8 Q-22 11 -34 6Z',
  },
  i: {
    rim: 'M-42 3 Q-20 -13 8 -10 Q32 -10 42 -1 Q30 19 4 21 Q-24 20 -42 3Z',
    tongue: 'M-16 16 Q6 13 24 13 Q12 21 4 21 Q-7 21 -16 16Z',
    teeth: 'M-34 1 Q-13 -10 33 -5 L27 7 Q4 11 -30 7Z',
  },
  o: {
    rim: 'M-25 0 Q-21 -18 0 -19 Q25 -20 29 2 Q33 34 7 42 Q-24 44 -25 0Z',
    tongue: 'M-17 30 Q0 18 18 29 Q14 42 3 42 Q-8 42 -17 30Z',
    teeth: 'M-17 -9 Q-3 -17 18 -10 L13 -1 Q0 1 -13 -1Z',
  },
  u: {
    rim: 'M-19 1 Q-8 -11 4 -11 Q17 -10 19 4 Q20 17 7 23 Q-12 23 -19 1Z',
    tongue: 'M-8 15 Q4 10 13 15 Q9 22 4 22 Q-4 21 -8 15Z',
  },
};

function SingingMouth({ viseme }: { viseme: FrontieViseme }) {
  if (viseme === 'rest') return null;
  const { rim, tongue, teeth } = mouths[viseme];
  return (
    <g transform="translate(486 572)">
      <rect x="-38" y="-17" width="80" height="44" rx="17" fill="url(#frontie-muzzle)" />
      <path d={rim} fill="#100e15" stroke="#171118" strokeWidth="3.2" strokeLinejoin="round" />
      <path d={tongue} fill="#ba625f" stroke="#6a394b" strokeWidth="1.5" />
      {teeth && <path d={teeth} fill="#ffe6ac" stroke="#9d766c" strokeWidth="1.1" strokeLinejoin="round" />}
      <path d="M-10 34 Q0 37 13 34" className={styles.chinCrease} fill="none" stroke="#1e171d" strokeWidth="2" />
    </g>
  );
}

export function paintAnimeWebcam(element: HTMLDivElement, time: number, vocal: number, band: number, reduced: boolean) {
  const frame = animeWebcamFrame(time, vocal, band, reduced);
  element.dataset.reaction = frame.mood;
  element.dataset.blink = String(frame.blink);
  element.dataset.reflection = frame.reflection;
  element.style.setProperty('--cam-vocal', vocal.toFixed(3));
  element.style.setProperty('--cam-x', `${frame.x.toFixed(2)}%`);
  element.style.setProperty('--cam-y', `${frame.y.toFixed(2)}%`);
  element.style.setProperty('--cam-tilt', `${frame.rotate.toFixed(2)}deg`);
  element.style.setProperty('--cam-zoom', frame.scale.toFixed(3));
  element.style.setProperty('--cam-squish', frame.squish.toFixed(3));
  element.style.setProperty('--cam-glow', frame.glow.toFixed(3));
  element.style.setProperty('--cam-heat', frame.heat.toFixed(3));
  element.style.setProperty('--cam-paws', frame.paws.toFixed(3));
  element.style.setProperty('--cam-look', `${frame.goggleX.toFixed(2)}px`);
  element.style.setProperty('--cam-lens', frame.lens.toFixed(3));
  element.style.setProperty('--cam-lens-sweep', `${frame.lensSweep.toFixed(1)}px`);
  element.style.setProperty('--cam-impact', frame.hit.toFixed(3));
  element.style.setProperty('--cam-kick', frame.cameraKick.toFixed(3));
  element.dataset.eyeBreak = String(frame.eyeStretch > 0.04);
  element.style.setProperty('--eye-stretch', frame.eyeStretch.toFixed(3));
}

function ElasticEye({ x, y, side }: { x: number; y: number; side: 'left' | 'right' }) {
  const direction = side === 'left' ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0.15, 0.29, 0.45, 0.63, 0.81, 1].map((depth) => {
        const front = depth === 1;
        const position = {
          '--eye-x': `${direction * (front ? 124 : 105) * depth}px`,
          '--eye-y': `${-(side === 'left' ? 215 : 179) * depth}px`,
          '--eye-growth': depth * (side === 'left' ? 3.96 : 3.3),
        } as CSSProperties;
        return (
          <g key={depth} className={styles.eyeDepth} style={position}>
            <ellipse rx="37" ry="45" fill={front ? 'url(#frontie-eye-depth)' : '#f9d5bb'} stroke="#472639" strokeWidth={front ? 3 : 2} />
            {front && <>
              <circle cx={direction * -3} cy="-2" r="16" fill="#f9c472" stroke="#a96153" strokeWidth="2.3" />
              <ellipse cx={direction * -3} cy="-2" rx="4" ry="6.5" fill="#3b2032" />
              <circle cx={direction * -3 - 4} cy="-8" r="2.5" fill="#fffcec" />
            </>}
          </g>
        );
      })}
    </g>
  );
}

export function AnimeWebcam({ cameraRef, corner, viseme }: {
  cameraRef: RefObject<HTMLDivElement | null>;
  corner?: 'top-left';
  viseme: FrontieViseme;
}) {
  return (
    <div ref={cameraRef} className={styles.webcam} data-corner={corner} role="img"
      aria-label="Frontie singing karaoke into his webcam">
      <div className={styles.feed}>
        <Image src={`${ASSETS}otaku-room.webp`} alt="" fill unoptimized sizes="22vw" className={styles.room} />
        <div className={styles.roomLight} aria-hidden="true" />
        <div className={styles.actor}>
          <Image src={`${ASSETS}otaku-frontie-upright.webp`} alt="" fill unoptimized priority sizes="22vw" className={styles.portrait} />
          <svg className={styles.face} data-pose={viseme} viewBox="0 0 1000 1000" aria-hidden="true">
            <defs>
              <radialGradient id="frontie-muzzle">
                <stop offset=".63" stopColor="#5b5557" />
                <stop offset="1" stopColor="#5b5557" stopOpacity="0" />
              </radialGradient>
              <clipPath id="frontie-lenses">
                <path d="M321 441 Q367 414 439 430 L449 500 Q423 518 330 517Z M515 432 Q554 409 635 403 L638 488 Q598 506 524 505Z" />
              </clipPath>
              <linearGradient id="frontie-monitor-reflection" x1="0" x2="1" y1="1" y2="0" gradientUnits="objectBoundingBox">
                <stop stopColor="var(--cam-reflection)" stopOpacity="0" />
                <stop offset=".53" stopColor="var(--cam-reflection)" stopOpacity=".17" />
                <stop offset=".65" stopColor="var(--cam-reflection)" stopOpacity=".8" />
                <stop offset=".72" stopColor="var(--cam-reflection)" stopOpacity=".06" />
                <stop offset="1" stopColor="var(--cam-reflection)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <ellipse cx="410" cy="451" rx="15" ry="25" fill="#fccc03" />
            <ellipse cx="551" cy="448" rx="14" ry="23" fill="#fdce04" />
            <g className={styles.pupils}>
              <ellipse className={styles.leftPupil} cx="409" cy="452" rx="11.25" ry="19.5" fill="#15100f" />
              <ellipse className={styles.rightPupil} cx="551" cy="449" rx="10.4" ry="18.7" fill="#15100f" />
              <circle cx="413" cy="440" r="3.25" fill="#fff6d8" />
              <circle cx="553" cy="438" r="3.05" fill="#fff6d8" />
            </g>
            <g className={styles.squint}>
              <path d="M332 456 Q348 420 380 427 L431 447 Q397 447 370 454Z"
                fill="#483334" stroke="#20171f" strokeWidth="3.5" />
              <path d="M520 447 Q569 419 599 427 L619 452 Q574 439 520 455Z"
                fill="#463039" stroke="#20171f" strokeWidth="3.5" />
            </g>
            <g className={styles.lids}>
              <path d="M327 456 Q329 423 356 417 Q393 417 440 451 Q453 491 409 503 Q342 529 327 456Z"
                fill="#53504c" stroke="#29212b" strokeWidth="3" />
              <path d="M515 449 Q564 416 596 420 Q621 426 625 457 Q622 494 581 501 Q523 509 515 449Z"
                fill="#51474e" stroke="#29212b" strokeWidth="3" />
              <path d="M338 466 Q359 493 399 483 Q429 476 439 461 M524 462 Q542 486 575 478 Q605 476 618 454"
                fill="none" stroke="#1d1520" strokeWidth="5.5" strokeLinecap="round" />
            </g>
            <g className={styles.sweat}>
              <path d="M342 348 Q322 377 339 382 Q362 383 352 358Z" fill="#b5e9fb" stroke="#313658" strokeWidth="4" />
              <path d="M609 344 Q595 365 607 372 Q628 371 619 354Z" fill="#b7eefb" stroke="#313658" strokeWidth="4" />
            </g>
            <g className={styles.eyeSpark} fill="#fff8c2" stroke="#ffb53c" strokeWidth="2.5" strokeLinejoin="round">
              <path d="M378 453 L386 445 L389 434 L394 444 L406 450 L395 454 L390 465 L384 456Z" />
              <path d="M570 445 L578 441 L581 430 L585 441 L596 447 L585 451 L581 461 L577 451Z" />
            </g>
            <g className={styles.lensReflection} clipPath="url(#frontie-lenses)">
              <path d="M267 390 H688 V533 H267Z" fill="var(--cam-reflection)" opacity=".12" />
              <g className={styles.lensSweep}>
                <path d="M257 390 H636 V532 H257Z M447 390 H794 V532 H447Z" fill="url(#frontie-monitor-reflection)" />
              </g>
            </g>
            <SingingMouth viseme={viseme} />
          </svg>
        </div>
        <Image src={`${ASSETS}otaku-frontie-upright.webp`} alt="" fill unoptimized sizes="22vw" className={styles.microphone} />
        <div className={styles.paws} aria-hidden="true">
          <Image src={`${ASSETS}otaku-paws.webp`} alt="" fill unoptimized sizes="22vw" />
        </div>
        <svg className={styles.effects} viewBox="0 0 1000 1000" aria-hidden="true">
          <g className={styles.hypeMarks} fill="none" stroke="var(--cam-color)" strokeWidth="15" strokeLinecap="round">
            <path d="M62 237 L116 276 M83 179 L126 236 M921 231 L869 266 M931 326 L876 333" />
          </g>
          <g className={styles.speedMarks} fill="none" stroke="var(--cam-color)" strokeWidth="10" strokeLinecap="round">
            <path d="M21 541 L112 558 M38 610 L93 615 M904 457 L979 438 M926 503 L974 497" />
          </g>
          <path className={styles.impact} d="M719 781 L755 784 L740 745 L768 770 L780 728 L788 771 L826 750 L805 784 L844 798 L803 804"
            fill="none" stroke="#fff2c4" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
      <svg className={styles.eyeBreakout} viewBox="0 0 1000 1000" aria-hidden="true">
        <defs>
          <radialGradient id="frontie-eye-depth" cx=".35" cy=".28" r=".76">
            <stop stopColor="#fffdf4" />
            <stop offset=".76" stopColor="#fff3e4" />
            <stop offset="1" stopColor="#f8c5b8" />
          </radialGradient>
        </defs>
        <ElasticEye x={551} y={448} side="right" />
        <ElasticEye x={410} y={451} side="left" />
      </svg>
      <div className={styles.screen} aria-hidden="true" />
      <span className={styles.live} aria-hidden="true">LIVE</span>
      <div className={styles.meter} aria-hidden="true"><span /><span /><span /><span /></div>
    </div>
  );
}
