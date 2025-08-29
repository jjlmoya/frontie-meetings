# 🎭 FANTASIA - Meeting Starting Soon Pages

Una colección dinámica de páginas "Starting Soon" para meetings, con video, música y animaciones sincronizadas.

## ✨ Características

- **Selección Dinámica**: Contenido automático basado en día/hora
- **Multimedia Completa**: Video, imagen fallback y audio sincronizado
- **Animaciones Reactivas**: Texto que cambia al ritmo de la música
- **Tipografías Dinámicas**: Fuentes que se adaptan al estilo del video
- **100% TypeScript**: Completamente tipado y type-safe
- **Arquitectura SOLID**: Servicios desacoplados y escalables
- **Optimizado para Vercel**: Deploy rápido y CDN integrado

## 🏗️ Arquitectura

### Servicios (SOLID)
- **TimeService**: Gestión de horarios y selección temporal
- **AssetService**: Optimización y precarga de medios
- **MeetingService**: Orquestador principal

### Hooks Personalizados
- **useAudioAnalyzer**: Análisis de audio en tiempo real
- **useMeetingConfig**: Gestión de configuración dinámica

### Componentes
- **MediaPlayer**: Reproductor con fallbacks automáticos
- **StartingSoonText**: Texto animado sincronizado

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Deploy en Vercel
npm run deploy
```

## 📁 Estructura de Assets

```
public/assets/
├── videos/          # Videos MP4/WebM
├── images/          # Imágenes de fallback
└── audio/           # Archivos MP3 para sincronización
```

## ⚙️ Configuración de Meetings

Editar `src/config/meetings.ts` para personalizar:

- Horarios por día de semana
- Assets multimedia
- Estilos y tipografías
- Animaciones

## 🎨 Estilos Disponibles

- **Morning Energy**: Fuente Inter, animación bounce
- **Afternoon Focus**: Roboto Mono, animación pulse  
- **Friday Vibes**: Dancing Script, animación wave
- **Default Calm**: Poppins, animación glow

## 🔧 Personalización

### Agregar Nuevo Meeting

```typescript
{
  id: 'mi-meeting',
  name: 'Mi Meeting Custom',
  schedule: [
    { dayOfWeek: 1, startHour: 14, endHour: 16 }
  ],
  assets: {
    video: '/assets/videos/mi-video.mp4',
    image: '/assets/images/mi-imagen.jpg',
    audio: '/assets/audio/mi-audio.mp3',
  },
  style: {
    fontFamily: 'Arial',
    fallbackFont: 'sans-serif',
    primaryColor: '#FF0000',
    backgroundColor: '#FFFFFF',
    textAnimation: 'pulse',
  }
}
```

## 🚀 Deploy en Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno (si es necesario)
3. Deploy automático en cada push

## 🎯 Optimizaciones

- **Edge Runtime** para ultra-rapidez
- **Image Optimization** automática
- **Audio Preloading** inteligente
- **Bundle Splitting** por componentes
- **CDN** global de Vercel

---

**FANTASIA** - Where meetings begin with style ✨
