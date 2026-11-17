#!/usr/bin/env python3
"""Build compact, time-aligned motion envelopes from the Campfire stems."""

import json
import math
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_CAMP = ROOT / "public/assets/campfire"
STEMS = ROOT / "scripts/assets/campfire-stems"
MASTER_AUDIO = PUBLIC_CAMP / "audio/Escalofríos en Producción.mp3"
SAMPLE_RATE = 16000
WINDOW_SECONDS = 0.02


def envelope(path: Path) -> list[float]:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "s16le", "-ac", "1", "-ar", str(SAMPLE_RATE), "pipe:1"],
        check=True,
        capture_output=True,
    ).stdout
    samples = memoryview(raw).cast("h")
    window = int(SAMPLE_RATE * WINDOW_SECONDS)
    result = []
    for offset in range(0, len(samples), window):
        block = samples[offset : offset + window]
        if not block:
            break
        rms = math.sqrt(sum(sample * sample for sample in block) / len(block)) / 32768
        result.append(round(min(1.0, rms * 6.5), 4))
    return result


TRACK_FILES = {
    "vocal": "0 Lead Vocals.mp3",
    "drums": "2 Drums.mp3",
    "guitar": "4 Guitar.mp3",
}

tracks = {name: envelope(STEMS / filename) for name, filename in TRACK_FILES.items()}
lengths = {len(values) for values in tracks.values()}
if len(lengths) != 1:
    raise SystemExit(f"Stem frame counts do not align: { {key: len(value) for key, value in tracks.items()} }")

master_pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", str(MASTER_AUDIO), "-map", "0:a:0", "-f", "s16le", "-ac", "1", "-ar", str(SAMPLE_RATE), "pipe:1"],
    check=True,
    capture_output=True,
).stdout
window_samples = int(SAMPLE_RATE * WINDOW_SECONDS)
master_frame_count = math.ceil((len(master_pcm) // 2) / window_samples)
if next(iter(lengths)) < master_frame_count:
    raise SystemExit(f"Stems are shorter than the master audio: {next(iter(lengths))} < {master_frame_count} frames")
tracks = {name: values[:master_frame_count] for name, values in tracks.items()}
duration = master_frame_count * WINDOW_SECONDS
output = {"duration": round(duration, 2), "sampleRateHz": round(1 / WINDOW_SECONDS), "tracks": tracks}
(PUBLIC_CAMP / "animation-cues.json").write_text(json.dumps(output, separators=(",", ":")) + "\n")
print(f"Wrote {PUBLIC_CAMP / 'animation-cues.json'} ({duration:.2f}s, {len(next(iter(tracks.values())))} samples per stem)")
