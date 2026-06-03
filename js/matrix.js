/**
 * Stellar Sequence Matrix - Interactive Constellation
 * A web of connected nodes forming a cosmic network
 */
(function() {
  const canvas = document.getElementById('stellarMatrix');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let nodes = [];
  let mouseX = -1000;
  let mouseY = -1000;
  let animationId;

  const NODE_COUNT = 60;
  const CONNECTION_DIST = 150;
  const MOUSE_DIST = 200;
  const NODE_RADIUS = 2.5;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = 400;
    initNodes();
  }

  class Node {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.radius = Math.random() * NODE_RADIUS + 1;
      this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
      // Mouse repulsion
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_DIST && dist > 0) {
        const force = (MOUSE_DIST - dist) / MOUSE_DIST * 0.8;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      // Damping
      this.vx *= 0.98;
      this.vy *= 0.98;

      this.x += this.vx;
      this.y += this.vy;

      // Bounds
      if (this.x < 0) { this.x = 0; this.vx *= -1; }
      if (this.x > width) { this.x = width; this.vx *= -1; }
      if (this.y < 0) { this.y = 0; this.vy *= -1; }
      if (this.y > height) { this.y = height; this.vy *= -1; }
    }
  }

  function initNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push(new Node());
    }
  }

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(168, 130, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function drawNodes() {
    for (const node of nodes) {
      // Glow
      const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 4);
      glow.addColorStop(0, `rgba(200, 180, 255, ${node.opacity * 0.3})`);
      glow.addColorStop(1, 'rgba(200, 180, 255, 0)');
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 210, 255, ${node.opacity})`;
      ctx.fill();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (const node of nodes) {
      node.update();
    }

    drawConnections();
    drawNodes();

    animationId = requestAnimationFrame(animate);
  }

  // Mouse tracking
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  // Touch
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
    mouseY = e.touches[0].clientY - rect.top;
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  resize();
  window.addEventListener('resize', resize);
  animationId = requestAnimationFrame(animate);
})();
