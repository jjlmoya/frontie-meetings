# Materiales fuente de la canción medieval

Este directorio guarda los originales de trabajo fuera de `public`. La página solo publica el MP3 de reproducción, `animation-cues.json` y las capas que monta `MedievalExperience`.

- `audio/Frontie the Feline King.mp3`: copia original del máster; la web reproduce `public/assets/medieval/audio/frontie-the-feline-king.mp3`.
- `stems/`: 12 pistas sincronizadas usadas para analizar boca y movimiento. Todas decodifican a **142,032 s (2:22)** y comparten inicio. No se reproducen ni se sirven al navegador.
- `layers/`: atlas, concepto, piezas no usadas por el rig y maestros del escenario. `runtime-pngs/` conserva las capas PNG de origen para el navegador.
- `details/waldo.png`: maestro usado por `scripts/build-waldo-layers.mjs` para generar sus dos capas runtime.
- `details-archive/`: decoración retirada de la página; se conserva como fuente, fuera de `public`.
- `letra.md`: letra recibida para preparar los subtítulos.
- `previews/`: GIF provisional y composición plana del escenario; no se sirven en la página.

Los stems guían el baile y la boca; el MP3 completo es la única pista de reproducción en la web.

Para regenerar las capas transparentes y convertirlas a WebP lossless: `npm run build:medieval-assets`. El navegador carga los WebP publicados en `public/assets/medieval/`.
