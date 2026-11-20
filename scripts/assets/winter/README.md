# When the World Stands Still

Song source and working assets for the winter Frontie experience.

- Suno track: `795c2f26-cde3-4a74-8399-6a91dfd4c37c` (selected take 1, 3:43).
- `stems/`: all eleven WAV stems available for this take, ignored by Git and retained locally.
- `art-source/frontie-frozen-base.png`: closed-mouth master frame.
- `art-source/frontie-frozen-open-v2.png`: matched crayon-style singing mouth source; the runtime script masks the mouth only over the unchanged master frame.
- `art-source/winter-landscape.png`: hand-drawn winter environment.
- `build-runtime-assets.mjs`: creates the aligned runtime layers.
- `art-source/frontie-mouth-poses.png` and `build-mouth-poses.mjs`: crayon mouth poses and the script that crops and masks them for playback.
- `public/assets/covers-art/winter.webp`: generated selector artwork with the song title integrated.
- `build-vocal-cues.py`: derives vocal intensity, high-frequency vocal energy, and low-frequency drum energy for the mouth and storm.
- `public/assets/winter/audio/when-the-world-stands-still.mp3`: playback master; the only full-song playback asset.

Rebuild the word and mouth cues with:

```sh
uv run --python 3.11 --with cmudict python scripts/assets/winter/build-articulation.py
```

`vocal-words.json` contains the timestamped words from the isolated lead.
`build-articulation.py` matches them to the displayed lyric and derives mouth
shapes from dictionary pronunciations. Sound level still controls the jaw,
and fills gaps where no reliable word anchor was found.

The eyelid patches are cut from the original crayon texture with
`node scripts/assets/winter/build-eyelids.mjs` after building the base layers.

For acoustic refinement, download the
[Wav2Vec2 phoneme checkpoint](https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft)
to a local model directory outside the project and run:

```sh
uv run --python 3.11 --with 'transformers<5' --with 'torch>=2.6' \
  python scripts/assets/winter/extract-phone-evidence.py /tmp/frontie-phone-model /tmp/frontie-phone-emissions.npy
uv run --python 3.11 --with cmudict --with numpy \
  python scripts/assets/winter/build-articulation.py \
  --emissions /tmp/frontie-phone-emissions.npy --vocabulary /tmp/frontie-phone-model/vocab.json
```

The alignment changes a mouth boundary only when the voice provides a
matching phoneme peak near it. The weights and intermediate logits stay
outside the project.

`node scripts/assets/winter/build-shiver-rig.mjs` separates the front paws,
torso, head, hair and whiskers into aligned layers from the same drawing.
