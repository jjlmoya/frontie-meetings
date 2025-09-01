'use client';

import { useState, useEffect, useRef } from 'react';

export const LiveMessenger = () => {
  const [displayedMessage, setDisplayedMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo manejar Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        const input = inputRef.current;
        if (input && input.value.trim()) {
          showMessage(input.value.trim());
        }
        return;
      }
      
      // Si empiezas a escribir, solo borra el mensaje visual
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Space') {
        if (isVisible) {
          setIsVisible(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          // NO limpiar el input, solo ocultar el mensaje
        }
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showMessage = (message: string) => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setDisplayedMessage(message);
    setIsVisible(true);
    
    // NO limpiar el input aquí, mantenerlo para reenvíos

    // Auto-hide después de 6 segundos
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  };

  const handleInputChange = () => {
    // Ya no necesitamos esto aquí, se maneja en keydown
  };

  return (
    <>
      {/* Input invisible para capturar texto */}
      <input
        ref={inputRef}
        type="text"
        onChange={handleInputChange}
        style={{
          position: 'fixed',
          left: '-9999px',
          opacity: 0,
          pointerEvents: 'none'
        }}
        autoFocus
      />

      {/* Mensaje mostrado */}
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
          {/* Background overlay elegante */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
              backdropFilter: 'blur(10px)',
              animation: isVisible ? 'backgroundFade 0.6s ease-out' : ''
            }}
          />
          
          {/* Mensaje principal */}
          <div 
            className="relative max-w-6xl mx-8 text-center"
            style={{
              animation: isVisible ? 'elegantEntry 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : ''
            }}
          >
            {/* Container principal con FANTASÍA */}
            <div className="relative">
              {/* Aura mágica rotante */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-30 blur-2xl"
                style={{
                  background: 'conic-gradient(from 0deg, #ff006e, #fb5607, #ffbe0b, #8338ec, #3a86ff, #ff006e)',
                  transform: 'scale(1.3)',
                  animation: isVisible ? 'magicAura 8s linear infinite' : ''
                }}
              />
              
              {/* Cristales flotantes */}
              <div 
                className="absolute -top-8 left-1/4 w-4 h-4 bg-gradient-to-br from-cyan-300 to-blue-500 transform rotate-45 opacity-70"
                style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  animation: isVisible ? 'crystalFloat 6s ease-in-out infinite' : ''
                }}
              />
              <div 
                className="absolute -top-12 right-1/3 w-3 h-3 bg-gradient-to-br from-purple-300 to-pink-500 transform rotate-12 opacity-80"
                style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  animation: isVisible ? 'crystalFloat 6s ease-in-out 2s infinite' : ''
                }}
              />
              <div 
                className="absolute -bottom-10 left-1/3 w-5 h-5 bg-gradient-to-br from-yellow-300 to-orange-500 transform -rotate-30 opacity-60"
                style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  animation: isVisible ? 'crystalFloat 6s ease-in-out 4s infinite' : ''
                }}
              />
              
              {/* Texto principal con MAGIA */}
              <div 
                className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 py-16 px-12 shadow-2xl overflow-hidden"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                {/* Destellos internos */}
                <div 
                  className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full opacity-60"
                  style={{
                    animation: isVisible ? 'sparkle 3s ease-in-out infinite' : ''
                  }}
                />
                <div 
                  className="absolute bottom-8 right-12 w-1 h-1 bg-cyan-300 rounded-full opacity-80"
                  style={{
                    animation: isVisible ? 'sparkle 3s ease-in-out 1.5s infinite' : ''
                  }}
                />
                
                {/* Texto con efecto holográfico */}
                <h1 
                  className="font-bold leading-tight relative"
                  style={{
                    fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 25%, #c7d2fe 50%, #a5b4fc 75%, #ffffff 100%)',
                    backgroundSize: '400% 400%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(255, 255, 255, 0.3), 0 0 60px rgba(139, 92, 246, 0.2)',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    animation: isVisible ? 'holographicShift 4s ease-in-out infinite' : ''
                  }}
                >
                  {displayedMessage}
                </h1>
                
                {/* Ondas mágicas */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-20 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(139, 92, 246, 0.1) 70%, transparent 100%)',
                    animation: isVisible ? 'magicWave 3s ease-out infinite' : ''
                  }}
                />
                
                {/* Línea decorativa con brillo */}
                <div 
                  className="relative mx-auto mt-8 h-px overflow-hidden"
                  style={{ width: '60%' }}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    style={{
                      animation: isVisible ? 'lineGrow 0.8s ease-out 0.3s both' : ''
                    }}
                  />
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent"
                    style={{
                      animation: isVisible ? 'lineShimmer 2s ease-in-out 1s infinite' : ''
                    }}
                  />
                </div>
              </div>
              
              {/* Orbes mágicos flotantes */}
              <div 
                className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-sm"
                style={{
                  animation: isVisible ? 'orbFloat 8s ease-in-out infinite' : ''
                }}
              />
              <div 
                className="absolute -bottom-8 -right-8 w-8 h-8 bg-gradient-to-br from-cyan-400/40 to-blue-500/40 rounded-full blur-sm"
                style={{
                  animation: isVisible ? 'orbFloat 8s ease-in-out 4s infinite' : ''
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes elegantEntry {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }
        
        @keyframes backgroundFade {
          0% { 
            opacity: 0; 
          }
          100% { 
            opacity: 1; 
          }
        }
        
        @keyframes lineGrow {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-10px);
            opacity: 0.6;
          }
        }
        
        @keyframes magicAura {
          0% {
            transform: scale(1.3) rotate(0deg);
          }
          100% {
            transform: scale(1.3) rotate(360deg);
          }
        }
        
        @keyframes crystalFloat {
          0%, 100% {
            transform: translateY(0px) rotate(45deg) scale(1);
            opacity: 0.7;
          }
          33% {
            transform: translateY(-20px) rotate(135deg) scale(1.1);
            opacity: 1;
          }
          66% {
            transform: translateY(10px) rotate(225deg) scale(0.9);
            opacity: 0.8;
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
        
        @keyframes holographicShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes magicWave {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
          100% {
            transform: scale(1);
            opacity: 0.2;
          }
        }
        
        @keyframes lineShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes orbFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          25% {
            transform: translateY(-15px) translateX(10px) scale(1.1);
          }
          50% {
            transform: translateY(5px) translateX(-5px) scale(0.9);
          }
          75% {
            transform: translateY(-8px) translateX(8px) scale(1.05);
          }
        }
      `}</style>
    </>
  );
};