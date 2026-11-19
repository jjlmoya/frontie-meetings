# Frontie Jazz assets

The Jazz page is available at `/?config=jazz` and uses a single master MP3 for playback. Keep Suno's aligned WAV stems in `scripts/assets/jazz/stems/`; they are analysis sources and must not be served to visitors. The empty room and sax-playing Frontie are separate runtime layers; CSS gives Frontie a continuous performance loop, and 50 Hz Suno envelopes will add audio-reactive motion when the stems are available.

- `audio/while-we-wait.mp3`: final playback master.
- `layers/jazz-lounge.webp`: optimized room background, without a baked-in mascot.
- `layers/frontie-sax-player.webp`: optimized transparent Frontie layer, animated in the page.
- `layers/jazz-cover.webp`: static composition of the room and sax-playing Frontie for the song selector.
- `layers/jazz-banner.webp`: panoramic Frontie Jazz selector banner, composed for the horizontal home card.
- `animation-cues.json`: generated with `python3 scripts/build-jazz-cues.py` after all nine stems and the master MP3 have been downloaded.
- `src/data/jazzLyrics.ts`: English on-screen lyric lines with estimated timestamps; align these against the lead vocal stem before release.
