/* ============================================
   MICRO-INTERACTIONS
   Ripple + Scroll Progress + Cart Fly + Badge Bounce
   ============================================ */

/* ============================================
   1. SCROLL PROGRESS BAR
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
   2. RIPPLE EFFECT
   ============================================ */

export function initRipple() {
  const selectors = [
    '.btn',
    '.p-card__cta',
    '.f-card__cta',
    '.cart-drawer__checkout',
    '.app-banner__btn',
    '.qv-modal__add',
    '.qv-modal__secondary',
    '.p-card__action',
    '.f-card__wish',
    '.floating__btn',
    '.header__action',
    '.drawer__link',
    '.trending__tab',
    '.brand-strip__item',
  ];

  const buttons = document.querySelectorAll(selectors.join(','));

  buttons.forEach((btn) => {
    if (btn.classList.contains('ripple-btn')) return;
    btn.classList.add('ripple-btn');
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('.ripple-btn');
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    target.appendChild(ripple);

    setTimeout(() => ripple.remove(), 650);
  });
}

/* ============================================
   3. CART FLY ANIMATION
   ============================================ */

export function flyToCart(sourceEl) {
  if (!sourceEl) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const cartBtn = document.querySelector('.header__action-badge--cart')?.parentElement;
  if (!cartBtn) return;

  // Find product image inside source
  const card = sourceEl.closest('.p-card, .f-card');
  const img = card?.querySelector('.p-card__img img, .f-card__img img');

  const sourceRect = img
    ? img.getBoundingClientRect()
    : sourceEl.getBoundingClientRect();

  const targetRect = cartBtn.getBoundingClientRect();

  // Clone image
  const clone = document.createElement('div');
  clone.className = 'fly-item';

  if (img && img.src && !img.src.endsWith('/undefined')) {
    clone.style.backgroundImage = `url(${img.src})`;
    clone.style.backgroundSize = 'cover';
    clone.style.backgroundPosition = 'center';
  } else {
    clone.style.background = 'linear-gradient(135deg, #2386D7, #16B5A5)';
  }

  clone.style.left = `${sourceRect.left}px`;
  clone.style.top = `${sourceRect.top}px`;
  clone.style.width = `${sourceRect.width}px`;
  clone.style.height = `${sourceRect.height}px`;

  document.body.appendChild(clone);

  const targetX = targetRect.left + targetRect.width / 2 - sourceRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2 - sourceRect.height / 2;

  requestAnimationFrame(() => {
    clone.style.transition = 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
    clone.style.left = `${targetX}px`;
    clone.style.top = `${targetY}px`;
    clone.style.width = '40px';
    clone.style.height = '40px';
    clone.style.opacity = '0.4';
    clone.style.transform = 'rotate(20deg) scale(0.7)';
  });

  setTimeout(() => {
    clone.remove();
    bounceCartBadge();
  }, 950);
}

/* ============================================
   4. BADGE BOUNCE
   ============================================ */

export function bounceCartBadge() {
  const badge = document.querySelector('.header__action-badge--cart');
  if (!badge) return;

  badge.classList.add('is-bouncing');
  setTimeout(() => badge.classList.remove('is-bouncing'), 650);
}

/* ============================================
   5. INIT
   ============================================ */

export function initMicro() {
  initScrollProgress();
  initRipple();
}