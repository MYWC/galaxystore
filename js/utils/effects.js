/* ============================================
   EFFECTS — Phase 1
   Gradient Mesh + Noise + Scroll Progress
   (Custom Cursor + Dark Mode حذف شدن)
   ============================================ */

/* ============================================
   1. GRADIENT MESH BACKGROUND
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
   2. NOISE TEXTURE
   ============================================ */

export function initNoise() {
  if (document.querySelector('.noise-overlay')) return;

  const noise = document.createElement('div');
  noise.className = 'noise-overlay';
  noise.setAttribute('aria-hidden', 'true');

  document.body.insertBefore(noise, document.body.firstChild);
}

/* ============================================
   3. SCROLL PROGRESS
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
   4. INIT ALL
   ============================================ */

export function initEffects() {
  initGradientMesh();
  initNoise();
  initScrollProgress();

  console.log('%c✓ Effects initialized (Phase 1)', 'color:#18B981;font-weight:bold;');
}