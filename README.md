# FRONT-LINE Meeting Pages

Dynamic "Starting Soon" pages for meetings with synchronized multimedia.

## Usage

```bash
npm install
npm run dev
```

## Query Parameters

Control style and content using URL parameters:

- `?config=beach` - Beach/Wave Style
- `?config=funky` - Funky Chaos Style  
- `?config=groovie` - Groovie Psychedelic Style
- `?config=metal` - Metal Destruction Style

### Examples

```
https://frontie-meetings.vercel.app/?config=beach
https://frontie-meetings.vercel.app/?config=funky
https://frontie-meetings.vercel.app/?config=groovie
https://frontie-meetings.vercel.app/?config=metal
```

## Configuration

Edit `src/config/meetings.ts` to add new styles:

```typescript
{
  id: 'my-style',
  name: 'My Style',
  assets: {
    video: '/assets/videos/my-video.mp4',
    audio: '/assets/audio/my-audio.mp3',
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

Files go in `public/assets/`:
- `videos/` - MP4 videos
- `audio/` - MP3 audio files

Use the same names as in your configuration.