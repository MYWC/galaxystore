/* ============================================
   FINAL TOUCH — Phase 6
   Loading + Smooth Scroll + Micro + Sound
   ============================================ */

/* ============================================
   1. LOADING SCREEN
   ============================================ */

export function initLoadingScreen() {
  // اگه قبلاً نمایش داده شده توی این session
  if (sessionStorage.getItem('ms_loaded')) {
    document.body.classList.add('loaded');
    return;
  }

  // ساخت DOM
  const screen = document.createElement('div');
  screen.className = 'loading-screen';
  screen.innerHTML = `
    <div class="loading-screen__logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="3"/>
        <line x1="12" y1="18" x2="12" y2="18"/>
      </svg>
    </div>
    <div class="loading-screen__bar">
      <div class="loading-screen__bar-fill"></div>
    </div>
    <div class="loading-screen__text">LOADING</div>
  `;

  document.body.appendChild(screen);

  // مخفی کردن بعد از بارگذاری
  const hideScreen = () => {
    setTimeout(() => {
      screen.classList.add('is-hidden');

      document.body.classList.add('loaded');

      setTimeout(() => {
        screen.remove();
      }, 700);

      try {
        sessionStorage.setItem('ms_loaded', '1');
      } catch {}
    }, 1800);
  };

  if (document.readyState === 'complete') {
    hideScreen();
  } else {
    window.addEventListener('load', hideScreen, { once: true });
    // Fallback در صورتی که load دیر شد
    setTimeout(hideScreen, 4000);
  }
}

/* ============================================
   2. SMOOTH SCROLL (Custom)
   ============================================ */

export function initSmoothScroll() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(pointer: fine)').matches;

  if (reduce || !isDesktop) return;

  document.documentElement.classList.add('has-smooth-scroll');

  // Smooth scroll برای anchor links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (href === '#' || href.length < 2) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const offset = 100;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    smoothScrollTo(top, 900);
  });
}

function smoothScrollTo(targetY, duration = 800) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  const start = performance.now();

  const easeInOutCubic = (t) =>
    t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + diff * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

/* ============================================
   3. SUCCESS MICRO-INTERACTIONS
   ============================================ */

export function triggerPop(el) {
  if (!el) return;
  el.classList.remove('pop-success');
  void el.offsetWidth;
  el.classList.add('pop-success');

  setTimeout(() => el.classList.remove('pop-success'), 600);
}

export function triggerWiggle(el) {
  if (!el) return;
  el.classList.remove('wiggle');
  void el.offsetWidth;
  el.classList.add('wiggle');

  setTimeout(() => el.classList.remove('wiggle'), 600);
}

export function triggerShake(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');

  setTimeout(() => el.classList.remove('shake'), 600);
}

/* ============================================
   4. MORPH ICONS (auto-apply)
   ============================================ */

export function initMorphIcons() {
  // قلب - وقتی فعال میشه پاپ کنه
  document.addEventListener('click', (e) => {
    const wish = e.target.closest('[data-wishlist]');
    if (wish) {
      const svg = wish.querySelector('svg');
      if (svg) {
        svg.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.5)' },
            { transform: 'scale(0.9)' },
            { transform: 'scale(1)' },
          ],
          { duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
        );
      }
    }

    // Add to cart
    const addBtn = e.target.closest('[data-add-to-cart]');
    if (addBtn) {
      const svg = addBtn.querySelector('svg');
      if (svg) {
        svg.animate(
          [
            { transform: 'translateY(0)' },
            { transform: 'translateY(-6px)' },
            { transform: 'translateY(0)' },
          ],
          { duration: 400, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
        );
      }
    }
  });
}

/* ============================================
   5. RIPPLE EFFECT
   ============================================ */

export function initRipple() {
  const selector = 'button, .btn, .p-card__cta, .hero-carousel__btn, .product-info__add-cart';

  document.addEventListener('click', (e) => {
    const target = e.target.closest(selector);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    target.style.setProperty('--ripple-x', `${x}%`);
    target.style.setProperty('--ripple-y', `${y}%`);
    target.classList.add('ripple-enhanced');

    setTimeout(() => {
      target.classList.remove('ripple-enhanced');
    }, 400);
  });
}

/* ============================================
   6. ANIMATED GRADIENT TEXT (auto)
   ============================================ */

export function initAnimatedText() {
  const targets = [
    '.hero-carousel__title-accent',
    '.featured-showcase__title-accent',
    '.why-us__title-accent',
    '.flash-sale__title',
    '.categories__title',
    '.trending__title',
    '.best-deals__title',
  ];

  targets.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (!el.classList.contains('gradient-text-animated')) {
        el.classList.add('gradient-text-animated');
      }
    });
  });
}

/* ============================================
   7. AMBIENT SOUND
   ============================================ */

let audioContext = null;
let ambientNodes = [];

export function initSound() {
  // دکمه ساخته میشه ولی پنهانه
  const btn = document.createElement('button');
  btn.className = 'sound-toggle';
  btn.setAttribute('aria-label', 'صدای محیط');
  btn.innerHTML = `
    <span class="sound-toggle__wave"></span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4V5z"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" opacity="0.4"/>
    </svg>
  `;

  document.body.appendChild(btn);

  // نمایش بعد از 3 ثانیه
  setTimeout(() => btn.classList.add('is-visible'), 3000);

  let isPlaying = false;

  btn.addEventListener('click', () => {
    if (!isPlaying) {
      startAmbient();
      btn.classList.add('is-active');
      isPlaying = true;
    } else {
      stopAmbient();
      btn.classList.remove('is-active');
      isPlaying = false;
    }
  });
}

function startAmbient() {
  if (audioContext) return;

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // یه صدای ملایم از فیلتر سفید noise
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;

    const gain = audioContext.createGain();
    gain.gain.value = 0.04;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    source.start();

    ambientNodes = [source, filter, gain];
  } catch (err) {
    console.warn('Audio failed:', err);
  }
}

function stopAmbient() {
  ambientNodes.forEach((node) => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch {}
  });

  ambientNodes = [];

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

/* ============================================
   7. SKELETON AUTO-APPLY
   ============================================ */

export function initSkeletonPolish() {
  // همه .skeleton رو بهبود بده
  const observe = () => {
    document.querySelectorAll('.skeleton').forEach((el) => {
      if (!el.dataset.shimmer) {
        el.dataset.shimmer = '1';
      }
    });
  };

  observe();
  const observer = new MutationObserver(observe);
  observer.observe(document.body, { childList: true, subtree: true });
}

/* ============================================
   8. SHORTCUTS
   ============================================ */

export function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    // "/" برای جستجو
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      const search = document.querySelector('.header__search-input');
      if (search) search.focus();
    }

    // "Esc" برای بستن‌ها
    if (e.key === 'Escape') {
      document.body.classList.remove('cinema-mode');
    }
  });
}

/* ============================================
   9. INIT ALL
   ============================================ */

export function initFinalTouch() {
  initLoadingScreen();
  initSmoothScroll();
  initMorphIcons();
  initRipple();
  initAnimatedText();
  initSound();
  initSkeletonPolish();
  initShortcuts();

  console.log('%c✓ Final Touch initialized (Phase 6)', 'color:#18B981;font-weight:bold;');
}