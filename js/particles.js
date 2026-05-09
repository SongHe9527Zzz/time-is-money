/**
 * Canvas 2D gold particle system.
 * Slow-floating particles create the luxurious background atmosphere.
 */
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this._resizeHandler = this._resize.bind(this);
    window.addEventListener('resize', this._resizeHandler);
    this._resize();
    this._spawnInitial();
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _spawnInitial() {
    const count = Math.floor((this.width * this.height) / 18000);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this._createParticle(true));
    }
  }

  _createParticle(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 10,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -(Math.random() * 0.4 + 0.1),
      opacity: Math.random() * 0.5 + 0.1,
      fadeSpeed: Math.random() * 0.003 + 0.001,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    };
  }

  /** Burst particles for milestone */
  burst(x, y, count = 60) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x,
        y,
        size: Math.random() * 3 + 1.5,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        opacity: 1,
        fadeSpeed: Math.random() * 0.02 + 0.015,
        pulse: 0,
        pulseSpeed: 0,
        life: 1,
        burst: true,
      });
    }
  }

  start() {
    const loop = () => {
      this._update();
      this._draw();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  _update() {
    const maxParticles = Math.floor((this.width * this.height) / 15000);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.burst) {
        p.life -= p.fadeSpeed;
        p.speedY += 0.05; // gravity
        p.speedX *= 0.99;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      } else {
        p.pulse += p.pulseSpeed;
        if (p.y < -10 || p.x < -10 || p.x > this.width + 10) {
          this.particles[i] = this._createParticle();
        }
      }
    }

    // Maintain ambient particle count
    while (this.particles.filter(p => !p.burst).length < maxParticles) {
      this.particles.push(this._createParticle(true));
    }
  }

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    for (const p of this.particles) {
      const alpha = p.burst ? p.life * p.opacity : p.opacity + Math.sin(p.pulse) * 0.15;
      const glowAlpha = alpha * 0.3;

      // Outer glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${glowAlpha})`;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      const brightness = p.burst ? `rgba(255, 215, 0, ${alpha})` : `rgba(212, 175, 55, ${alpha})`;
      ctx.fillStyle = brightness;
      ctx.fill();
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this._resizeHandler);
  }
}
