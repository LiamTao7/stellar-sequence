/**
 * Stellar Sequence - Common Interactions
 */
(function() {
  // Mobile nav
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // Nav scroll
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });

  // Active nav
  function updateActive() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 120;
    sections.forEach(s => {
      if (scrollY >= s.offsetTop && scrollY < s.offsetTop + s.offsetHeight) {
        document.querySelectorAll('.nav-links a').forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + s.id) a.classList.add('active');
        });
      }
    });
  }
  window.addEventListener('scroll', updateActive);

  // Reveal
  function reveal() {
    document.querySelectorAll('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 80) el.classList.add('visible');
    });
  }
  window.addEventListener('scroll', reveal);
  window.addEventListener('load', reveal);

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const t = document.querySelector(this.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Counter animation
  function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
      const target = parseInt(el.getAttribute('data-target') || el.textContent);
      if (!target) return;
      const dur = 2000;
      const step = target / (dur / 16);
      let cur = 0;

      const go = () => {
        cur += step;
        if (cur < target) { el.textContent = Math.floor(cur) + '+'; requestAnimationFrame(go); }
        else { el.textContent = target + '+'; }
      };

      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { go(); obs.unobserve(e.target); } });
      }, { threshold: 0.5 });
      obs.observe(el);
    });
  }
  window.addEventListener('load', animateCounters);

  // Contact form
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = this.querySelector('[name="name"]')?.value.trim();
      const email = this.querySelector('[name="email"]')?.value.trim();
      const msg = this.querySelector('[name="message"]')?.value.trim();
      if (!name || !email || !msg) return toast('Please fill all required fields.', 'error');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Please enter a valid email.', 'error');

      const btn = this.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        toast('Message sent. We\'ll respond within 24 hours.', 'success');
        btn.textContent = orig;
        btn.disabled = false;
        this.reset();
      }, 1500);
    });
  }

  function toast(msg, type) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
})();
