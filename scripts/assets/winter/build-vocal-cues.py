#!/usr/bin/env python3
"""Create a compact 20 ms mouth-animation envelope from Frontie's lead vocal."""

import json
import math
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
STEMS = ROOT / "scripts/assets/winter/stems"
MASTER = ROOT / "public/assets/winter/audio/when-the-world-stands-still.mp3"
OUT = ROOT / "public/assets/winter/animation-cues.json"
RATE = 16000
WINDOW = 0.02


def envelope(path: Path, band: str, gain: float) -> list[float]:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-af", band, "-f", "s16le", "-ac", "1", "-ar", str(RATE), "pipe:1"],
        check=True,
        capture_output=True,
    ).stdout
    samples = memoryview(raw).cast("h")
    size = int(RATE * WINDOW)
    values = []
    for start in range(0, len(samples), size):
        block = samples[start : start + size]
        if not block:
            break
        rms = math.sqrt(sum(value * value for value in block) / len(block)) / 32768
        values.append(round(min(1.0, rms * gain), 4))
    return values


lead_candidates = [path for path in STEMS.rglob("*") if path.is_file() and "leadvocal" in "".join(c for c in path.stem.casefold() if c.isalnum())]
if len(lead_candidates) != 1:
    raise SystemExit(f"Expected one Lead Vocal stem, found {len(lead_candidates)}")
if not MASTER.is_file():
    raise SystemExit(f"Missing master MP3: {MASTER}")

lead = lead_candidates[0]
vocal = envelope(lead, "highpass=f=120,lowpass=f=4200", 7.5)
presence = envelope(lead, "highpass=f=1950,lowpass=f=4600", 7.5)
drums = envelope(STEMS / "drums.wav", "lowpass=f=135", 5.0)
master_pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", str(MASTER), "-map", "0:a:0", "-f", "s16le", "-ac", "1", "-ar", str(RATE), "pipe:1"],
    check=True,
    capture_output=True,
).stdout
master_frames = math.ceil((len(master_pcm) // 2) / (RATE * WINDOW))
if len(vocal) + 1 < master_frames:
    raise SystemExit(f"Lead Vocal is shorter than master ({len(vocal)} vs {master_frames} frames)")

vocal = vocal[:master_frames]
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps({"duration": round(len(vocal) * WINDOW, 2), "sampleRateHz": 50, "tracks": {"vocal": vocal, "presence": presence[:master_frames], "drums": drums[:master_frames]}}, separators=(",", ":")) + "\n")
print(f"Wrote {OUT} ({len(vocal)} 20 ms frames, {len(vocal) * WINDOW:.2f}s)")
