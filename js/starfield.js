/**
 * Stellar Sequence - Refined Starfield
 * Minimal particle field with subtle motion
 */
(function() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 180;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(init) {
      this.x = Math.random() * width;
      this.y = init ? Math.random() * height : -10;
      this.size = Math.random() * 1.2 + 0.3;
      this.speed = Math.random() * 0.12 + 0.03;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.flickerSpeed = Math.random() * 0.015 + 0.005;
      this.flickerOffset = Math.random() * Math.PI * 2;
    }

    update() {
      this.y += this.speed;
      if (this.y > height + 10) {
        this.y = -10;
        this.x = Math.random() * width;
      }
    }

    draw(ctx, time) {
      const flicker = Math.sin(time * this.flickerSpeed + this.flickerOffset) * 0.25 + 0.75;
      const alpha = this.opacity * flicker;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 190, 255, ${alpha})`;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function animate(time) {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.update();
      p.draw(ctx, time);
    }
    requestAnimationFrame(animate);
  }

  resize();
  init();
  window.addEventListener('resize', resize);
  requestAnimationFrame(animate);
})();
