# FRONT-LINE Meeting Pages

Dynamic "Starting Soon" pages for meetings with synchronized multimedia featuring WebGL effects, audio-reactive animations, and live messaging.

## Features

- 🎵 **Audio-Reactive Effects** - WebGL shaders respond to music frequency data
- 🎬 **Synchronized Video/Audio** - Background videos with matching audio tracks
- 🌈 **Custom Animations** - Unique text animations for each theme
- ⚡ **Hardware Acceleration** - WebGL-powered visual effects
- 💬 **Live Messaging** - Real-time messages with fantasy animations
- 📊 **Performance Monitor** - FPS and memory usage tracking
- 🎨 **Theme System** - Easy configuration for different meeting styles

## Usage

```bash
npm install
npm run dev
```

## Available Themes

Control style and content using URL parameters:

- `?config=beach` - Beach/Wave Style (Chill cyan waves)
- `?config=funky` - Funky Chaos Style (Colorful glitch effects)
- `?config=groovie` - Groovie Psychedelic Style (Smooth rainbow vibes)
- `?config=metal` - Metal Destruction Style (Intense red explosions)
- `?config=reggaeton` - Reggaeton Fiesta Style (Latino bouncing rhythms)

### Examples

```
https://frontie-meetings.vercel.app/?config=beach
https://frontie-meetings.vercel.app/?config=funky
https://frontie-meetings.vercel.app/?config=groovie
https://frontie-meetings.vercel.app/?config=metal
https://frontie-meetings.vercel.app/?config=reggaeton
```

## How to Add a New Meeting Type

### Step 1: Add Media Assets

Place your files in `public/assets/`:
- `videos/your-theme.mp4` - Background video
- `audio/your-theme.mp3` - Audio track

### Step 2: Update Type Definitions

In `src/types/index.ts`, add your animation to the textAnimation union:

```typescript
readonly textAnimation: 'wave-beach' | 'funky-chaos' | 'your-new-animation';
```

### Step 3: Create CSS Animation

In `src/app/globals.css`, add your keyframe animation:

```css
@keyframes your-new-animation {
  0% { 
    transform: translateY(0px) scale(1);
    text-shadow: 0 0 25px #yourcolor;
    filter: saturate(1.2) brightness(1);
  }
  50% { 
    transform: translateY(-10px) scale(1.05);
    text-shadow: 0 0 40px #yourcolor;
    filter: saturate(1.5) brightness(1.2);
  }
  100% { 
    transform: translateY(0px) scale(1);
    text-shadow: 0 0 25px #yourcolor;
    filter: saturate(1.2) brightness(1);
  }
}
```

### Step 4: Add Meeting Configuration

In `src/config/meetings.ts`, add your theme:

```typescript
{
  id: 'your-theme',
  name: 'Your Theme Name',
  type: 'creative', // 'daily' | 'catch-up' | 'creative' | 'default'
  schedule: [], // Time slots when this theme is active
  assets: {
    video: '/assets/videos/your-theme.mp4',
    audio: '/assets/audio/your-theme.mp3',
  },
  style: {
    fontFamily: 'var(--font-righteous)', // Available fonts in layout.tsx
    fallbackFont: 'Arial Black, sans-serif',
    primaryColor: '#FF6B35', // Main text color
    backgroundColor: '#1A1A2E', // Background overlay color
    textAnimation: 'your-new-animation',
  },
}
```

### Step 5: Add Font Support (Optional)

If using a new font, add it to `src/app/layout.tsx`:

```typescript
import { Your_New_Font } from "next/font/google";

const yourNewFont = Your_New_Font({
  variable: "--font-your-new",
  subsets: ["latin"],
  weight: "400"
});

// Add to className in body tag
className={`${existingFonts.variable} ${yourNewFont.variable} ...`}
```

### Step 6: Add Text Animation Handler

In `src/components/StartingSoonText.tsx`, add your case:

```typescript
case 'your-new-animation':
  return `${baseClasses}`;
```

### Step 7: Add WebGL Effect (Optional)

In `src/components/WebGLEffects.tsx`:

1. Add shader function before main():
```glsl
vec3 yourThemeEffect(vec2 uv, float time) {
  // Your WebGL effect code
  return color * (0.4 + u_volume * 0.8) * u_intensity;
}
```

2. Update theme index detection:
```typescript
const getThemeIndex = (theme: string): number => {
  // ... existing themes
  if (theme.includes('your-theme')) return 4; // Next available index
  return 1;
};
```

3. Add to main shader function:
```glsl
} else if (u_theme == 4) {
  // Your theme
  color = yourThemeEffect(uv, u_time);
```

### Step 8: Test Your Theme

1. Start the dev server: `npm run dev`
2. Visit: `http://localhost:3000/?config=your-theme`
3. Check that video, audio, animations, and effects work correctly

## Live Messaging

Press any key to start typing, then **Enter** to display the message with fantasy effects. Messages auto-hide after 6 seconds.

## Performance Features

- **Particle Pooling**: Memory-efficient particle system prevents leaks
- **WebGL Acceleration**: Hardware-accelerated visual effects
- **Audio Throttling**: 30fps audio analysis prevents infinite loops  
- **Performance Monitor**: Real-time FPS and memory tracking (dev mode)
- **Canvas Optimization**: Cached contexts and frame rate limiting

## Available Fonts

- Geist Sans/Mono (default)
- Righteous, Creepster, Orbitron
- Dancing Script, Bungee, Monoton  
- Audiowide, Black Ops One

## File Structure

```
src/
├── components/
│   ├── WebGLEffects.tsx      # Hardware-accelerated visual effects
│   ├── LiveMessenger.tsx     # Live messaging with fantasy animations
│   ├── StartingSoonText.tsx  # Main text with theme animations
│   ├── AudioVideoOverlay.tsx # Video/audio background
│   └── PerformanceMonitor.tsx # Performance tracking
├── config/
│   └── meetings.ts           # Theme configurations
├── utils/
│   └── ParticlePool.ts       # Memory-efficient particles
├── hooks/
│   └── useAudioAnalyzer.ts   # Audio frequency analysis
├── types/
│   └── index.ts              # TypeScript definitions
└── app/
    ├── globals.css           # CSS animations
    └── layout.tsx            # Font imports
```