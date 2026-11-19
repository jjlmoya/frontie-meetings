#!/usr/bin/env python3
"""Build compact, aligned motion envelopes from Suno's Frontie Jazz stems."""

import json
import math
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_JAZZ = ROOT / "public/assets/jazz"
STEMS = ROOT / "scripts/assets/jazz/stems"
MASTER_AUDIO = PUBLIC_JAZZ / "audio/while-we-wait.mp3"
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
    values = []
    for offset in range(0, len(samples), window):
        block = samples[offset:offset + window]
        if not block:
            break
        rms = math.sqrt(sum(sample * sample for sample in block) / len(block)) / 32768
        values.append(round(min(1.0, rms * 6.5), 4))
    return values


TRACK_ALIASES = {
    "vocal": ("lead vocal", "lead vocals"),
    "backing": ("backing vocal", "backing vocals"),
    "drums": ("drums", "drum"),
    "bass": ("bass",),
    "guitar": ("guitar",),
    "keys": ("keyboards", "keyboard", "keys"),
    "percussion": ("percussion",),
    "brass": ("brass",),
    "woodwinds": ("woodwinds", "woodwind"),
}


def normalize(value: str) -> str:
    return "".join(character for character in value.casefold() if character.isalnum())


stem_files = [path for path in STEMS.rglob("*") if path.is_file()]


def find_stem(aliases: tuple[str, ...]) -> Path:
    normalized_aliases = tuple(normalize(alias) for alias in aliases)
    matches = [path for path in stem_files if any(alias in normalize(path.stem) for alias in normalized_aliases)]
    if len(matches) != 1:
        names = ", ".join(str(path.relative_to(STEMS)) for path in matches) or "none found"
        raise SystemExit(f"Expected one stem matching {aliases}; found {len(matches)}: {names}")
    return matches[0]


tracks = {name: envelope(find_stem(aliases)) for name, aliases in TRACK_ALIASES.items()}
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
stem_frame_count = next(iter(lengths))
if stem_frame_count + 1 < master_frame_count:
    raise SystemExit(f"Stems are shorter than the master audio: {stem_frame_count} < {master_frame_count} frames")
# Encoder padding can add one 20 ms envelope frame to the MP3; keep the cue
# timeline bounded by the shared stem duration instead of inventing that frame.
target_frame_count = min(stem_frame_count, master_frame_count)
tracks = {name: values[:target_frame_count] for name, values in tracks.items()}
duration = target_frame_count * WINDOW_SECONDS
output = {"duration": round(duration, 2), "sampleRateHz": round(1 / WINDOW_SECONDS), "tracks": tracks}
(PUBLIC_JAZZ / "animation-cues.json").write_text(json.dumps(output, separators=(",", ":")) + "\n")
print(f"Wrote {PUBLIC_JAZZ / 'animation-cues.json'} ({duration:.2f}s, {len(next(iter(tracks.values())))} frames per stem)")
