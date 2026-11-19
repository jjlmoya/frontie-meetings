# Wannabe — videoclip de cinco Fronties

Fuentes y materiales de producción. La página final se servirá con `?config=wannabe` y tendrá varias escenas encadenadas; no será una imagen fija de un gato.

## Audio de referencia para el montaje

- `public/assets/wannabe/wanna-be.mp3`: versión corta aportada por el usuario. Dura 173,035 s (2:53), está en estéreo a 44,1 kHz y se decodifica completa. Usar el inicio de este archivo como `0:00` para todos los cortes y cues.

## Stems y sincronización

Demucs `htdemucs` se usó para analizar voz, batería y bajo. La salida empleada por la web y el montaje está resumida en `timing/animation-cues.json`, con datos a 50 Hz.

`timing/full-lyrics.mjs` contiene la letra aportada por el usuario con las entradas ajustadas sobre el stem de voz. `timing/full-lyrics.vtt` suma los 2 s de portada silenciosa a esas marcas. En `/?config=wannabe`, el MP4 arranca en silencio y en bucle. El primer clic activa el audio del MP4. Los subtítulos usan el tiempo del mismo vídeo y se dibujan en una única capa web.

La voz del MP3 está separada como un stem común, no por integrante. La atribución escénica usa los relevos solistas del verso y el intercambio Brown/Halliwell de la estructura publicada; las cinco articulan juntas en los coros.

## Búsqueda de fuentes (18-11-2026)

- [Wannabe (Single Edit) · marcas LRC](https://www.lyricdown.com/lrc/spice-girls-wannabe-single-edit-13413303): referencia de onsets para el montaje; la letra no se copia al proyecto.
- [Wannabe · estructura vocal](https://en.wikipedia.org/wiki/Wannabe): relevo individual de las cuatro voces principales en los versos, Brown/Halliwell en el intercambio y cinco voces en los coros.
- [Universal Music: página oficial de “Wannabe”](https://www.universal-music.de/spice-girls/videos/wannabe-314625) ofrece opciones de streaming/descarga comercial; no publica stems.
- [SKIO: página del stem pack](https://skiomusic.com/wishlist/spice-girls-wannabe-radio-edit/) indica que no hay máster ni licencia disponibles.
- [Song Galaxy: multitrack de “Wannabe”](https://songgalaxy.com/Multitrack/Spice-Girls/Wannabe/RE11342.html) aclara que sus archivos son covers, no grabaciones originales, y que su uso es para actuación en vivo o personal salvo acuerdo distinto. No sirve como fuente para este videoclip.

No encontré stems oficiales del máster de Spice Girls en las fuentes revisadas. La alternativa técnica es separar localmente un MP3 autorizado y usar ese resultado solo como análisis de movimiento.

## Arte

- `references/hotel-pop-stage-v2.png`: salón de baile del hotel convertido en escenario; sustituye los focos y haces pintados del primer concepto.
- `references/hotel-grand-lobby-v1.png`, `hotel-elevator-foyer-v1.png`, `hotel-mirror-gallery-v1.png`, `hotel-rooftop-v2.png` y `hotel-conservatory-v1.png`: placas raster independientes para alternar espacios a lo largo del videoclip.
- `references/frontie-five-personas-v1.png`: cinco variantes de Frontie (Sporty, Baby, Scary, Ginger y Posh), manteniendo la cara oscura y la cresta arcoíris.
- `storyboard.md`: seis decorados raster, escenas solistas/dúo/grupo y requisitos de capas.

Los PNG son referencias conceptuales. La lámina conjunta documenta el vestuario. Cada una de las cinco Fronties tendrá un peinado arcoíris distinto y sus propias piezas transparentes. Los planos que requieran correr, girar o cambiar de perspectiva tendrán poses específicas.
