/* =============================================================
 * 01. Повноекранний перегляд емблеми
 * Клік по емблемі у шапці відкриває зображення; майбутнє відео
 * можна ввімкнути у data/events.js без зміни цього файлу.
 * ============================================================= */
(() => {
  'use strict';
  const config = window.SITE_EVENTS || {};
  const logo = config.logo || {};
  const home = /(?:^|\/)index\.html$|\/$/.test(location.pathname);
  let lastFocus = null;

  const viewer = document.createElement('div');
  viewer.className = 'brand-viewer';
  viewer.hidden = true;
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-label', 'Повноекранний перегляд емблеми');
  viewer.innerHTML = `<div class="brand-viewer-panel">
    <button class="overlay-close" type="button" aria-label="Закрити перегляд">×</button>
    <div class="brand-viewer-media"></div>
  </div>`;
  document.body.appendChild(viewer);
  const viewerMedia = viewer.querySelector('.brand-viewer-media');
  const closeViewerButton = viewer.querySelector('.overlay-close');

  function closeViewer() {
    if (viewer.hidden) return;
    viewer.querySelector('video')?.pause();
    viewer.hidden = true;
    document.body.classList.remove('overlay-open');
    lastFocus?.focus();
  }
  function openViewer() {
    lastFocus = document.activeElement;
    viewerMedia.replaceChildren();
    if (logo.type === 'video') {
      const video = document.createElement('video');
      video.src = logo.src || '';
      video.poster = logo.poster || 'assets/logo.png';
      video.controls = true;
      video.autoplay = true;
      video.loop = Boolean(logo.loop);
      video.playsInline = true;
      video.preload = 'metadata';
      viewerMedia.append(video);
      video.play().catch(() => { /* Браузер може вимагати натискання Play. */ });
    } else {
      const img = document.createElement('img');
      img.src = logo.src || 'assets/logo.png';
      img.alt = 'Емблема 1 ОБМП';
      viewerMedia.append(img);
    }
    viewer.hidden = false;
    document.body.classList.add('overlay-open');
    closeViewerButton.focus();
  }
  document.querySelectorAll('.logo-open').forEach(button => button.addEventListener('click', openViewer));
  closeViewerButton.addEventListener('click', closeViewer);
  viewer.addEventListener('click', e => { if (e.target === viewer) closeViewer(); });
  viewer.addEventListener('keydown', e => {
    if (e.key === 'Tab') { e.preventDefault(); closeViewerButton.focus(); }
  });

  /* =============================================================
   * 02. Святковий режим лише на головній сторінці
   * Прапорець enabled + календар контролюють автоматичний показ.
   * Вікно можна закрити, ефекти не блокують кліки по сайту.
   * ============================================================= */
  const celebration = config.celebration || {};
  const preset = celebration.presets?.[celebration.active];
  const today = new Date();
  const date = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  const inRange = (!celebration.start || date >= celebration.start) && (!celebration.end || date <= celebration.end);
  const active = home && celebration.enabled === true && Boolean(preset) && inRange;
  let celebrationPopup = null;
  let celebrationCloseButton = null;
  let previousFocus = null;

  function closeCelebration() {
    if (!celebrationPopup || celebrationPopup.hidden) return;
    celebrationPopup.hidden = true;
    document.body.classList.remove('celebration-dialog-open');
    if (celebration.dismissForSession) {
      try { sessionStorage.setItem('celebration-dismissed-' + celebration.active + '-' + celebration.start, '1'); } catch (_) {}
    }
    previousFocus?.focus();
  }
  if (active) {
    const layer = document.createElement('div');
    layer.className = 'celebration-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.append(layer);
    if (celebration.showEffect) {
      if (preset.effect === 'snow') {
        layer.classList.add('is-snow');
        for (let i = 0; i < 24; i++) {
          const flake = document.createElement('span');
          flake.className = 'snowflake';
          flake.textContent = '❄';
          flake.style.setProperty('--x', `${(i * 43 + 7) % 100}%`);
          flake.style.setProperty('--delay', `${-((i * 7) % 23)}s`);
          flake.style.setProperty('--duration', `${11 + (i % 7) * 2}s`);
          flake.style.setProperty('--size', `${12 + (i % 5) * 4}px`);
          layer.append(flake);
        }
      } else if (preset.effect === 'waves') {
        layer.classList.add('is-waves');
      }
    }
    if (celebration.showFloatingText) {
      const ribbon = document.createElement('div');
      ribbon.className = 'celebration-ribbon';
      ribbon.textContent = preset.title;
      document.body.append(ribbon);
    }
    if (celebration.showPopup) {
      let dismissed = false;
      if (celebration.dismissForSession) {
        try { dismissed = sessionStorage.getItem('celebration-dismissed-' + celebration.active + '-' + celebration.start) === '1'; } catch (_) {}
      }
      if (!dismissed) {
        celebrationPopup = document.createElement('div');
        celebrationPopup.className = 'celebration-popup';
        celebrationPopup.setAttribute('role', 'dialog');
        celebrationPopup.setAttribute('aria-modal', 'true');
        celebrationPopup.setAttribute('aria-label', 'Святкове привітання');
        const panel = document.createElement('div');
        panel.className = 'celebration-panel';
        celebrationCloseButton = document.createElement('button');
        celebrationCloseButton.type = 'button';
        celebrationCloseButton.className = 'overlay-close';
        celebrationCloseButton.setAttribute('aria-label', 'Закрити привітання');
        celebrationCloseButton.textContent = '×';
        const heading = document.createElement('h2');
        heading.textContent = preset.title;
        const message = document.createElement('p');
        message.textContent = preset.message || '';
        panel.append(celebrationCloseButton, heading, message);
        celebrationPopup.append(panel);
        document.body.append(celebrationPopup);
        previousFocus = document.activeElement;
        document.body.classList.add('celebration-dialog-open');
        celebrationCloseButton.focus();
        celebrationCloseButton.addEventListener('click', closeCelebration);
        celebrationPopup.addEventListener('click', e => { if (e.target === celebrationPopup) closeCelebration(); });
        celebrationPopup.addEventListener('keydown', e => {
          if (e.key === 'Tab') { e.preventDefault(); celebrationCloseButton.focus(); }
        });
      }
    }
  }
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!viewer.hidden) closeViewer();
    else closeCelebration();
  });
})();
