#!/usr/bin/env python3
"""Extract 50 Hz phone evidence from the isolated winter vocal for authoring."""

import argparse
from pathlib import Path
import subprocess

import numpy as np
import torch
from transformers import AutoFeatureExtractor, Wav2Vec2ForCTC

RATE = 16000
FRAME = 320
REGION = 8 * RATE
CONTEXT = RATE
VOCAL = Path(__file__).with_name("stems") / "lead-vocal.wav"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("model", type=Path, help="local wav2vec2-lv-60-espeak-cv-ft checkpoint")
    parser.add_argument("output", type=Path, help="numpy file to store phone logits")
    args = parser.parse_args()
    torch.set_num_threads(5)
    extractor = AutoFeatureExtractor.from_pretrained(args.model, local_files_only=True)
    model = Wav2Vec2ForCTC.from_pretrained(args.model, local_files_only=True).eval()
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    model = model.to(device)
    print(f"Model loaded on {device}", flush=True)
    pcm = subprocess.check_output([
        "ffmpeg", "-v", "error", "-i", str(VOCAL),
        "-ac", "1", "-ar", str(RATE), "-f", "f32le", "-",
    ])
    audio = np.frombuffer(pcm, dtype=np.float32)
    chunks = []
    for start in range(0, len(audio), REGION):
        origin = max(0, start - CONTEXT)
        end = min(len(audio), start + REGION + CONTEXT)
        data = extractor(audio[origin:end], sampling_rate=RATE, return_tensors="pt").input_values
        with torch.inference_mode():
            logits = model(data.to(device)).logits[0].float().cpu().numpy()
        offset = (start - origin) // FRAME
        chunks.append(logits[offset:offset + REGION // FRAME])
        print(f"Decoded {start / RATE:g}s to {min(len(audio), start + REGION) / RATE:.1f}s", flush=True)
    np.save(args.output, np.concatenate(chunks))


if __name__ == "__main__":
    main()
