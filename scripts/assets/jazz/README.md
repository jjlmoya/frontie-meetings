# Frontie Jazz source media

Keep only the master mix and the aligned Suno stems used for the runtime cue build here:

- `art-source/`: source PNGs for the Jazz lounge background, sax-playing Frontie layer, and selector banner.
- `stems/`: the nine WAV auto-split tracks from the selected `While We Wait` version.
- The runtime master belongs at `public/assets/jazz/audio/while-we-wait.mp3`.

After the WAVs are available, normalize their names to the track names in `scripts/build-jazz-cues.py` and build the 50 Hz runtime envelopes. Do not copy the WAVs into `public/`.
