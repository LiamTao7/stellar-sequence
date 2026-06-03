/**
 * Stellar Sequence — Dynamic Content Loader
 * Fetches content from API and updates page elements
 */
(function() {
  const API = '/api/content';

  async function loadContent() {
    try {
      const res = await fetch(API);
      if (!res.ok) return;
      const data = await res.json();

      // Site name
      if (data.site) {
        setText('siteName', data.site.name);
        document.title = data.site.name + ' ' + (data.site.nameEn || '') + ' — 创意AI工作室';
      }

      // Hero
      if (data.hero) {
        const h = data.hero;
        const titleEl = document.getElementById('heroTitle');
        if (titleEl && h.title1 && h.titleEm && h.title2 && h.title3) {
          titleEl.innerHTML = h.title1 + '<br><em>' + h.titleEm + '</em>' + h.title2 + '<br>' + h.title3;
        }
        setText('heroTagline', data.site?.tagline);
        setText('heroDesc', data.site?.description);
      }

      // Matrix
      if (data.matrix) {
        setText('matrixLabel', data.matrix.label);
        setText('matrixTitle', data.matrix.title);
        setText('matrixDesc', data.matrix.desc);
      }

      // Services grid
      if (data.services && data.services.length) {
        const grid = document.getElementById('servicesGrid');
        if (grid) {
          grid.innerHTML = data.services.map((s, i) => `
            <div class="service-card">
              <div class="service-index">${String(i + 1).padStart(2, '0')}</div>
              <h3>${s.title}</h3>
              <p>${s.desc}</p>
              <div class="service-tags">
                ${(s.tags || []).map(t => `<span class="service-tag">${t}</span>`).join('')}
              </div>
            </div>
          `).join('');
        }
      }

      // Stats bar
      if (data.stats && data.stats.length) {
        const bar = document.getElementById('statsBar');
        if (bar) {
          bar.innerHTML = data.stats.map(s => `
            <div class="stat-cell">
              <div class="stat-number" data-target="${parseInt(s.number) || s.number}">${s.number}+</div>
              <div class="stat-label">${s.label}</div>
            </div>
          `).join('');
          // Re-trigger counter animation
          setTimeout(() => {
            if (typeof animateCounters === 'function') animateCounters();
          }, 200);
        }
      }

      // Media
      if (data.media) {
        // Video
        if (data.media.video) {
          const videoCard = document.getElementById('featuredVideo');
          if (videoCard) {
            videoCard.querySelector('.media-placeholder').innerHTML = `
              <video src="${data.media.video}" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"></video>
            `;
          }
        }

        // Images
        if (data.media.images) {
          const gallery = document.getElementById('imageGallery');
          if (gallery) {
            const items = gallery.querySelectorAll('.gallery-item');
            items.forEach((item, i) => {
              if (data.media.images[i]) {
                item.innerHTML = `<img src="${data.media.images[i]}" alt="${data.media.imageLabels?.[i] || ''}" style="width:100%;height:100%;object-fit:cover;">`;
              }
            });
          }
        }
      }

      // Favicon
      if (data.favicon) {
        const fav = document.getElementById('favicon');
        if (fav) fav.href = data.favicon;
      }

    } catch (e) {
      console.log('Content API not available, using static content.');
    }
  }

  function setText(id, text) {
    if (!text) return;
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Load on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
