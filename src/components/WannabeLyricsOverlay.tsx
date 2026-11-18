'use client';

import { useEffect, useState } from 'react';

type LyricCue = { start: number; end: number; text: string };

function parseTimestamp(value: string) {
  const [hours, minutes, rest] = value.split(':');
  const [seconds, milliseconds = '0'] = rest.split('.');
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds) / 1000;
}

function wrapCaption(text: string, maxLength = 48) {
  const rows: string[] = [];
  let row = '';
  for (const word of text.split(/\s+/)) {
    if (row && `${row} ${word}`.length > maxLength) {
      rows.push(row);
      row = word;
    } else row = row ? `${row} ${word}` : word;
  }
  if (row) rows.push(row);
  return rows;
}

export const WannabeLyricsOverlay = ({ time }: { time: number }) => {
  const [lyrics, setLyrics] = useState<LyricCue[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/assets/wannabe/full-lyrics.vtt?v=28')
      .then((response) => response.text())
      .then((vtt) => {
        const cues = vtt.split(/\n\s*\n/).flatMap((block) => {
          const rows = block.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
          const timingIndex = rows.findIndex((row) => row.includes('-->'));
          if (timingIndex < 0) return [];
          const [start, end] = rows[timingIndex].split('-->').map((part) => part.trim().split(/\s+/)[0]);
          const text = rows.slice(timingIndex + 1).join(' ');
          if (!start || !end || !text) return [];
          return [{ start: parseTimestamp(start), end: parseTimestamp(end), text }];
        });
        if (!cancelled) setLyrics(cues);
      })
      .catch(() => { if (!cancelled) setLyrics([]); });
    return () => { cancelled = true; };
  }, []);

  const activeLyric = lyrics.find(({ start, end }) => time >= start && time < end);

  return (
    <div className="wannabe-lyrics" aria-live="off" aria-label="English lyrics">
      {activeLyric && (
        <div className="wannabe-lyric-card" key={activeLyric.start}>
          <span className="wannabe-lyric-ornament" aria-hidden="true">✧</span>
          <p>{wrapCaption(activeLyric.text).map((row) => <span className="wannabe-lyric-row" key={row}>{row}</span>)}</p>
          <span className="wannabe-lyric-ornament" aria-hidden="true">✦</span>
        </div>
      )}
    </div>
  );
};
