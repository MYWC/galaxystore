/* ============================================
   EFFECTS — Phase 1
   Dark Mode + Cursor + Gradient Mesh + Noise + Progress
   ============================================ */

/* ============================================
   1. DARK MODE
   ============================================ */

const THEME_KEY = 'ms_theme';

export function initDarkMode() {
  // بارگذاری از localStorage یا سیستم
  let theme = localStorage.getItem(THEME_KEY);

  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  applyTheme(theme, false);
}

function applyTheme(theme, animate = true) {
  const html = document.documentElement;

  if (animate) {
    html.classList.add('theme-transitioning');
    setTimeout(() => html.classList.remove('theme-transitioning'), 400);
  }

  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else {
    html.removeAttribute('data-theme');
  }

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}

  // آپدیت meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'dark' ? '#0A0F15' : '#2386D7');
  }
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next, true);

  // Ripple effect
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(0.9)' },
        { transform: 'scale(1)' },
      ],
      { duration: 300, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
    );
  }
}

/* ============================================
   2. CUSTOM CURSOR
   ============================================ */

export function initCustomCursor() {
  // فقط روی دسکتاپ
  const isDesktop = window.matchMedia('(pointer: fine)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isDesktop || prefersReduced) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  document.documentElement.classList.add('has-custom-cursor');

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  let currentDotX = 0;
  let currentDotY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // RAF loop
  function loop() {
    // Dot follows immediately
    currentDotX += (mouseX - currentDotX) * 0.35;
    currentDotY += (mouseY - currentDotY) * 0.35;

    // Ring follows with lag
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    dot.style.transform = `translate3d(${currentDotX - 3}px, ${currentDotY - 3}px, 0)`;
    ring.style.transform = `translate3d(${ringX - 17}px, ${ringY - 17}px, 0)`;

    requestAnimationFrame(loop);
  }
  loop();

  // Hover state
  const hoverSelector = 'a, button, .p-card, .f-card, .category-card, .brand-card, [data-hover]';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSelector)) {
      document.documentElement.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSelector)) {
      document.documentElement.classList.remove('cursor-hover');
    }
  });

  // Click state
  document.addEventListener('mousedown', () => {
    document.documentElement.classList.add('cursor-click');
  });

  document.addEventListener('mouseup', () => {
    document.documentElement.classList.remove('cursor-click');
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

/* ============================================
   3. GRADIENT MESH BACKGROUND
   ============================================ */

export function initGradientMesh() {
  if (document.querySelector('.gradient-mesh')) return;

  const mesh = document.createElement('div');
  mesh.className = 'gradient-mesh';
  mesh.setAttribute('aria-hidden', 'true');
  mesh.innerHTML = `
    <span class="gradient-mesh__orb gradient-mesh__orb--1"></span>
    <span class="gradient-mesh__orb gradient-mesh__orb--2"></span>
    <span class="gradient-mesh__orb gradient-mesh__orb--3"></span>
  `;

  document.body.insertBefore(mesh, document.body.firstChild);
}

/* ============================================
   4. NOISE TEXTURE
   ============================================ */

export function initNoise() {
  if (document.querySelector('.noise-overlay')) return;

  const noise = document.createElement('div');
  noise.className = 'noise-overlay';
  noise.setAttribute('aria-hidden', 'true');

  document.body.insertBefore(noise, document.body.firstChild);
}

/* ============================================
   5. SCROLL PROGRESS
   ============================================ */

export function initScrollProgress() {
  let bar = document.querySelector('.scroll-progress__bar');

  if (!bar) {
    const wrap = document.createElement('div');
    wrap.className = 'scroll-progress';
    wrap.innerHTML = '<div class="scroll-progress__bar"></div>';
    document.body.appendChild(wrap);
    bar = wrap.querySelector('.scroll-progress__bar');
  }

  let ticking = false;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}

/* ============================================
   6. INIT ALL
   ============================================ */

export function initEffects() {
  initDarkMode();
  initGradientMesh();
  initNoise();
  initCustomCursor();
  initScrollProgress();

  console.log('%c✓ Effects initialized (Phase 1)', 'color:#18B981;font-weight:bold;');
}