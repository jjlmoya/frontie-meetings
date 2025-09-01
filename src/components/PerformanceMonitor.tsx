'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceStats {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  particleCount: number;
  canvasOperations: number;
}

interface PerformanceMonitorProps {
  isVisible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onPerformanceUpdate?: (stats: PerformanceStats) => void;
}

export const PerformanceMonitor = ({ 
  isVisible = process.env.NODE_ENV === 'development',
  position = 'top-left',
  onPerformanceUpdate 
}: PerformanceMonitorProps) => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    particleCount: 0,
    canvasOperations: 0
  });
  
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const renderStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  
  // FPS calculation - memoized to prevent infinite updates
  const calculateFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    
    if (delta >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / delta);
      
      setStats(prev => {
        if (prev.fps !== fps) {
          const newStats = { ...prev, fps };
          onPerformanceUpdate?.(newStats);
          return newStats;
        }
        return prev;
      });
      
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
    
    frameCountRef.current++;
  }, [onPerformanceUpdate]);

  // Memory usage tracking - memoized to prevent infinite updates
  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
      
      setStats(prev => {
        if (prev.memoryUsage !== memoryUsage) {
          const newStats = { ...prev, memoryUsage };
          onPerformanceUpdate?.(newStats);
          return newStats;
        }
        return prev;
      });
    }
  }, [onPerformanceUpdate]);

  // Render time tracking - memoized to prevent infinite updates
  const trackRenderTime = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);

  // Performance monitoring loop
  useEffect(() => {
    if (!isVisible) return;

    const monitor = () => {
      calculateFPS();
      trackRenderTime();
      animationFrameRef.current = requestAnimationFrame(monitor);
    };

    // Memory tracking interval (less frequent)
    const memoryInterval = setInterval(trackMemoryUsage, 2000);
    
    animationFrameRef.current = requestAnimationFrame(monitor);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(memoryInterval);
    };
  }, [isVisible, calculateFPS, trackRenderTime, trackMemoryUsage]);

  // Particle count tracking (external) - memoized
  useEffect(() => {
    const updateParticleCount = () => {
      const particleCount = (window as any).globalParticleCount || 0;
      setStats(prev => {
        if (prev.particleCount !== particleCount) {
          return { ...prev, particleCount };
        }
        return prev;
      });
    };

    const interval = setInterval(updateParticleCount, 1000);
    return () => clearInterval(interval);
  }, []);

  // Performance status color coding
  const getStatusColor = (): string => {
    if (stats.fps < 30) return 'text-red-400';
    if (stats.fps < 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getMemoryColor = (): string => {
    if (stats.memoryUsage > 100) return 'text-red-400';
    if (stats.memoryUsage > 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 bg-black/80 backdrop-blur-sm text-white text-xs p-3 rounded-lg font-mono border border-white/10 min-w-[180px]`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <span className="font-semibold">Performance</span>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={getStatusColor()}>{stats.fps}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Memory:</span>
          <span className={getMemoryColor()}>{stats.memoryUsage}MB</span>
        </div>
        
        <div className="flex justify-between">
          <span>Render:</span>
          <span className="text-blue-400">{stats.renderTime}ms</span>
        </div>
        
        <div className="flex justify-between">
          <span>Particles:</span>
          <span className="text-purple-400">{stats.particleCount}</span>
        </div>
        
        <div className="mt-2 pt-2 border-t border-white/20">
          <div className="text-[10px] text-gray-400">
            Performance Monitor v1.0
          </div>
        </div>
      </div>
    </div>
  );
};

// Global performance tracking utilities
export const PerformanceUtils = {
  // Mark render start
  startRender: () => {
    (window as any).renderStartTime = performance.now();
  },

  // Mark render end
  endRender: () => {
    if ((window as any).renderStartTime) {
      const renderTime = performance.now() - (window as any).renderStartTime;
      (window as any).lastRenderTime = renderTime;
    }
  },

  // Update particle count
  updateParticleCount: (count: number) => {
    (window as any).globalParticleCount = count;
  },

  // Performance optimization recommendations
  getOptimizationSuggestions: (stats: PerformanceStats): string[] => {
    const suggestions: string[] = [];
    
    if (stats.fps < 30) {
      suggestions.push('Consider reducing particle count or effect complexity');
      suggestions.push('Enable WebGL acceleration if available');
    }
    
    if (stats.memoryUsage > 100) {
      suggestions.push('Memory usage is high - check for memory leaks');
      suggestions.push('Consider implementing object pooling');
    }
    
    if (stats.renderTime > 16.67) {
      suggestions.push('Render time exceeds 60fps target');
      suggestions.push('Optimize canvas operations and reduce redraws');
    }
    
    if (stats.particleCount > 1000) {
      suggestions.push('High particle count - consider culling or LOD system');
    }
    
    return suggestions;
  }
};