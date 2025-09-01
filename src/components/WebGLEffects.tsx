'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ThemeConfig, AudioAnalyzerData } from '@/types';

interface WebGLEffectsProps {
  style: ThemeConfig;
  audioData?: AudioAnalyzerData;
  isEnabled?: boolean;
  intensity?: number;
}

export const WebGLEffects = ({ 
  style, 
  audioData, 
  isEnabled = true, 
  intensity = 1.0 
}: WebGLEffectsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number>(0);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  // Vertex shader for audio-reactive effects
  const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    
    void main() {
      v_uv = (a_position + 1.0) / 2.0;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment shader with audio-reactive patterns
  const fragmentShaderSource = `
    precision mediump float;
    
    varying vec2 v_uv;
    uniform float u_time;
    uniform float u_bass;
    uniform float u_mid;
    uniform float u_treble;
    uniform float u_volume;
    uniform float u_intensity;
    uniform vec2 u_resolution;
    uniform int u_theme;
    
    // Noise function
    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    // Fractal noise
    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    // Beach theme effect - FULL SCREEN
    vec3 beachEffect(vec2 uv, float time) {
      // NORMALIZE UV TO FULL SCREEN
      vec2 wave = uv + vec2(sin(uv.y * 3.0 + time * 2.0 + u_bass * 5.0) * 0.2 * u_intensity, 0.0);
      float pattern = fbm(wave * 2.0 + time * 0.5);
      
      vec3 color1 = vec3(0.0, 1.0, 1.0); // Cyan
      vec3 color2 = vec3(0.0, 0.5, 1.0); // Blue
      vec3 color3 = vec3(1.0, 1.0, 1.0); // White
      
      vec3 color = mix(color1, color2, pattern);
      color = mix(color, color3, u_bass * 0.5);
      
      // FORCE FULL COVERAGE
      return color * (0.3 + u_volume * 0.7) * u_intensity;
    }
    
    // Groovie psychedelic effect - FULL SCREEN FORCE
    vec3 groovieEffect(vec2 uv, float time) {
      vec2 center = vec2(0.5);
      vec2 pos = uv - center;
      float angle = atan(pos.y, pos.x) + time * 1.0 + u_bass * 6.28;
      float radius = length(pos);
      
      // MULTIPLE LAYERS FOR MORE VISIBLE EFFECTS
      float spiral1 = sin(radius * 15.0 - time * 4.0 + u_mid * 15.0) * 0.5 + 0.5;
      float spiral2 = cos(radius * 8.0 + time * 2.0 + u_bass * 10.0) * 0.5 + 0.5;
      float rings = sin(angle * 4.0 + u_treble * 20.0) * 0.5 + 0.5;
      
      // MORE INTENSE COLORS
      float hue1 = mod(time * 0.3 + radius * 3.0 + u_volume * 6.28, 6.28);
      float hue2 = mod(time * 0.2 + angle + u_bass * 3.14, 6.28);
      
      vec3 color1 = vec3(
        sin(hue1) * 0.5 + 0.5,
        sin(hue1 + 2.094) * 0.5 + 0.5,
        sin(hue1 + 4.188) * 0.5 + 0.5
      );
      
      vec3 color2 = vec3(
        cos(hue2) * 0.5 + 0.5,
        cos(hue2 + 2.094) * 0.5 + 0.5,
        cos(hue2 + 4.188) * 0.5 + 0.5
      );
      
      vec3 finalColor = mix(color1, color2, spiral2);
      finalColor *= spiral1 * rings;
      
      // MUCH MORE INTENSE AND VISIBLE
      return finalColor * (0.6 + u_volume * 0.8) * u_intensity * 1.5;
    }
    
    // Metal destruction effect - FULL SCREEN FORCE
    vec3 metalEffect(vec2 uv, float time) {
      vec2 center = vec2(0.5);
      float dist = distance(uv, center) * 1.5; // AMPLIFY DISTANCE
      
      // Explosion effect - FULL COVERAGE
      float explosion = 1.0 - smoothstep(0.0, 1.2, dist - u_bass * 0.4);
      
      // Lightning-like patterns - FULL SCREEN
      float lightning = fbm(uv * 8.0 + time * 2.0 + u_treble * 5.0);
      lightning = pow(lightning, 2.0 - u_intensity * 1.5);
      
      vec3 red = vec3(1.0, 0.0, 0.0);
      vec3 orange = vec3(1.0, 0.4, 0.0);
      vec3 yellow = vec3(1.0, 1.0, 0.0);
      
      vec3 color = mix(red, orange, explosion);
      color = mix(color, yellow, lightning * u_treble);
      
      // FORCE COVERAGE
      float coverage = min(1.0, dist * 0.6 + 0.4);
      return color * coverage * (0.2 + u_volume * 0.8) * u_intensity;
    }
    
    // Reggaeton effect - FULL SCREEN FORCE
    vec3 reggaetonEffect(vec2 uv, float time) {
      vec2 center = vec2(0.5);
      float dist = distance(uv, center);
      
      // Bouncing rhythm patterns - FULL COVERAGE
      float bounce = sin(time * 4.0 + u_bass * 15.0) * 0.3 + 0.7;
      float pulse = cos(time * 6.0 + u_mid * 10.0) * 0.2 + 0.8;
      
      // Tropical wave patterns - FULL SCREEN
      vec2 wave = uv + vec2(sin(uv.y * 6.0 + time * 3.0 + u_treble * 8.0) * 0.1, cos(uv.x * 4.0 + time * 2.0) * 0.1);
      float pattern = fbm(wave * 3.0 + time * 0.8);
      
      // Reggaeton colors: orange, yellow, red
      vec3 orange = vec3(1.0, 0.42, 0.21); // #FF6B35
      vec3 yellow = vec3(1.0, 0.82, 0.25); // #FFD23F  
      vec3 red = vec3(0.91, 0.3, 0.24);    // #E74C3C
      
      vec3 color = mix(orange, yellow, pattern * bounce);
      color = mix(color, red, u_bass * pulse * 0.6);
      
      // Add rhythmic intensity - FORCE COVERAGE
      float rhythmIntensity = (sin(time * 8.0 + u_volume * 12.0) * 0.2 + 0.8) * bounce;
      color *= rhythmIntensity;
      
      // FORCE FULL SCREEN COVERAGE
      return color * (0.4 + u_volume * 0.8) * u_intensity * 1.2;
    }
    
    void main() {
      vec2 uv = v_uv;
      vec3 color = vec3(0.0);
      
      if (u_theme == 0) {
        // Beach theme
        color = beachEffect(uv, u_time);
      } else if (u_theme == 1) {
        // Groovie theme  
        color = groovieEffect(uv, u_time);
      } else if (u_theme == 2) {
        // Metal theme
        color = metalEffect(uv, u_time);
      } else if (u_theme == 3) {
        // Reggaeton theme
        color = reggaetonEffect(uv, u_time);
      } else {
        // Default groovie
        color = groovieEffect(uv, u_time);
      }
      
      gl_FragColor = vec4(color, 0.8 * u_intensity);
    }
  `;

  const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  };

  const createProgram = (gl: WebGLRenderingContext): WebGLProgram | null => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return null;
    
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  };

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGLSupported(false);
        return false;
      }

      glRef.current = gl as WebGLRenderingContext;
      programRef.current = createProgram(gl as WebGLRenderingContext);
      
      if (!programRef.current) {
        setIsWebGLSupported(false);
        return false;
      }

      // Create quad vertices
      const vertices = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
      ]);

      const webgl = gl as WebGLRenderingContext;
      const buffer = webgl.createBuffer();
      webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
      webgl.bufferData(webgl.ARRAY_BUFFER, vertices, webgl.STATIC_DRAW);

      const positionAttribute = webgl.getAttribLocation(programRef.current, 'a_position');
      webgl.enableVertexAttribArray(positionAttribute);
      webgl.vertexAttribPointer(positionAttribute, 2, webgl.FLOAT, false, 0, 0);

      return true;
    } catch (error) {
      console.error('WebGL initialization failed:', error);
      setIsWebGLSupported(false);
      return false;
    }
  }, []);

  const getThemeIndex = (theme: string): number => {
    if (theme.includes('beach') || theme.includes('wave')) return 0;
    if (theme.includes('groovie') || theme.includes('psychedelic')) return 1;
    if (theme.includes('metal') || theme.includes('destruction')) return 2;
    if (theme.includes('reggaeton') || theme.includes('bounce')) return 3;
    return 1; // Default to groovie
  };

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    
    if (!gl || !program || !canvas || !isEnabled) return;

    // Resize canvas to full window
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    // Extract frequency data
    const bass = audioData?.frequencyData ? 
      Array.from(audioData.frequencyData.slice(0, 10)).reduce((sum, val) => sum + val, 0) / 10 / 255 : 0.3;
    const mid = audioData?.frequencyData ? 
      Array.from(audioData.frequencyData.slice(10, 60)).reduce((sum, val) => sum + val, 0) / 50 / 255 : 0.3;
    const treble = audioData?.frequencyData ? 
      Array.from(audioData.frequencyData.slice(60)).reduce((sum, val) => sum + val, 0) / (audioData.frequencyData.length - 60) / 255 : 0.3;
    const volume = audioData?.volume || 0.3;

    // Set uniforms
    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), Date.now() * 0.001);
    gl.uniform1f(gl.getUniformLocation(program, 'u_bass'), Math.min(1.0, bass * 1.5));
    gl.uniform1f(gl.getUniformLocation(program, 'u_mid'), Math.min(1.0, mid * 1.3));
    gl.uniform1f(gl.getUniformLocation(program, 'u_treble'), Math.min(1.0, treble * 1.2));
    gl.uniform1f(gl.getUniformLocation(program, 'u_volume'), Math.min(1.0, volume * 2));
    gl.uniform1f(gl.getUniformLocation(program, 'u_intensity'), intensity);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
    gl.uniform1i(gl.getUniformLocation(program, 'u_theme'), getThemeIndex(style.textAnimation));

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationRef.current = requestAnimationFrame(render);
  }, [isEnabled, style.textAnimation, audioData, intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // FORCE FULL SCREEN DIMENSIONS IMMEDIATELY
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resizeCanvas = () => {
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Force viewport update
      const gl = glRef.current;
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    if (initWebGL()) {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      const gl = glRef.current;
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        animationRef.current = requestAnimationFrame(render);
      }
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initWebGL, render]);

  // Fallback to canvas if WebGL not supported
  if (!isWebGLSupported || !isEnabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        width: '100vw',
        height: '100vh',
        mixBlendMode: 'screen',
        opacity: intensity * 0.8,
        willChange: 'transform',
        display: 'block',
      }}
    />
  );
};