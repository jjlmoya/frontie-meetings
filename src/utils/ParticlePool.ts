// High-performance particle pooling system to prevent memory leaks and improve performance

export interface PooledParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: 'spark' | 'glow' | 'trail' | 'explosion' | 'ripple';
  isActive: boolean;
}

export class ParticlePool {
  private pool: PooledParticle[] = [];
  private activeParticles: PooledParticle[] = [];
  private maxPoolSize: number;
  private initialPoolSize: number;

  constructor(initialPoolSize: number = 100, maxPoolSize: number = 500) {
    this.initialPoolSize = initialPoolSize;
    this.maxPoolSize = maxPoolSize;
    this.initializePool();
  }

  private initializePool(): void {
    // Pre-allocate particle objects to avoid GC pressure
    for (let i = 0; i < this.initialPoolSize; i++) {
      this.pool.push(this.createParticle());
    }
  }

  private createParticle(): PooledParticle {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 100,
      size: 1,
      color: '#ffffff',
      alpha: 1,
      type: 'glow',
      isActive: false
    };
  }

  public acquire(config: Partial<PooledParticle>): PooledParticle | null {
    let particle: PooledParticle;

    // Try to get a particle from the pool
    if (this.pool.length > 0) {
      particle = this.pool.pop()!;
    } else if (this.activeParticles.length < this.maxPoolSize) {
      // Create new particle if we haven't reached max capacity
      particle = this.createParticle();
    } else {
      // Pool is full, can't create more particles
      return null;
    }

    // Reset and configure the particle
    particle.x = config.x || 0;
    particle.y = config.y || 0;
    particle.vx = config.vx || 0;
    particle.vy = config.vy || 0;
    particle.life = 0;
    particle.maxLife = config.maxLife || 100;
    particle.size = config.size || 1;
    particle.color = config.color || '#ffffff';
    particle.alpha = config.alpha || 1;
    particle.type = config.type || 'glow';
    particle.isActive = true;

    this.activeParticles.push(particle);
    return particle;
  }

  public release(particle: PooledParticle): void {
    const index = this.activeParticles.indexOf(particle);
    if (index > -1) {
      particle.isActive = false;
      this.activeParticles.splice(index, 1);
      
      // Return to pool if we're not over capacity
      if (this.pool.length < this.maxPoolSize) {
        this.pool.push(particle);
      }
      // Otherwise let it be garbage collected
    }
  }

  public update(): void {
    // Update all active particles and automatically release dead ones
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i];
      
      // Update particle life
      particle.life++;
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Update alpha based on life
      particle.alpha = Math.max(0, 1 - (particle.life / particle.maxLife));
      
      // Apply physics based on type
      this.applyPhysics(particle);
      
      // Release dead particles
      if (particle.life >= particle.maxLife || particle.alpha <= 0) {
        this.release(particle);
      }
    }
  }

  private applyPhysics(particle: PooledParticle): void {
    switch (particle.type) {
      case 'spark':
        // Gravity and air resistance
        particle.vy += 0.1;
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        break;
        
      case 'glow':
        // Slow down over time
        particle.vx *= 0.95;
        particle.vy *= 0.95;
        break;
        
      case 'explosion':
        // Accelerate outward
        particle.vx *= 1.01;
        particle.vy *= 1.01;
        break;
        
      case 'ripple':
        // No movement, just fade
        particle.vx = 0;
        particle.vy = 0;
        break;
        
      case 'trail':
        // Maintain momentum
        break;
    }
  }

  public getActiveParticles(): readonly PooledParticle[] {
    return this.activeParticles;
  }

  public getPoolStats(): { active: number; pooled: number; total: number } {
    return {
      active: this.activeParticles.length,
      pooled: this.pool.length,
      total: this.activeParticles.length + this.pool.length
    };
  }

  public clear(): void {
    // Move all active particles back to pool
    while (this.activeParticles.length > 0) {
      const particle = this.activeParticles.pop()!;
      particle.isActive = false;
      if (this.pool.length < this.maxPoolSize) {
        this.pool.push(particle);
      }
    }
  }

  public resize(newMaxSize: number): void {
    this.maxPoolSize = newMaxSize;
    
    // If we're over the new limit, remove excess particles
    while (this.pool.length + this.activeParticles.length > newMaxSize) {
      if (this.pool.length > 0) {
        this.pool.pop();
      } else if (this.activeParticles.length > 0) {
        this.release(this.activeParticles[this.activeParticles.length - 1]);
      }
    }
  }
}