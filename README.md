# FRONT-LINE Meeting Pages

Páginas dinámicas "Starting Soon" para meetings con multimedia sincronizada.

## Uso

```bash
npm install
npm run dev
```

## Query Parameters

Controla el estilo y contenido usando parámetros URL:

- `?config=beach` - Estilo Beach/Wave
- `?config=funky` - Estilo Funky Chaos  
- `?config=groovie` - Estilo Groovie Psicodélico
- `?config=metal` - Estilo Metal Destruction

### Ejemplos

```
https://tu-dominio.com/?config=beach
https://tu-dominio.com/?config=funky
https://tu-dominio.com/?config=groovie
https://tu-dominio.com/?config=metal
```

## Configuración

Edita `src/config/meetings.ts` para añadir nuevos estilos:

```typescript
{
  id: 'mi-estilo',
  name: 'Mi Estilo',
  assets: {
    video: '/assets/videos/mi-video.mp4',
    audio: '/assets/audio/mi-audio.mp3',
  },
  style: {
    fontFamily: 'var(--font-dancing)',
    primaryColor: '#FF1493',
    backgroundColor: '#9932CC',
    textAnimation: 'groovie-psychedelic',
  }
}
```

## Assets

Los archivos van en `public/assets/`:
- `videos/` - Videos MP4
- `audio/` - Archivos MP3

Usa los mismos nombres que en la configuración.