/* ============================================
   MOTION — Phase 2
   Text Reveal + Parallax + Magnetic + Tilt + View Transitions
   ============================================ */

/* ============================================
   1. TEXT REVEAL
   ============================================ */

export function initTextReveal() {
  const elements = document.querySelectorAll(
    '.reveal-text, [data-text-reveal]'
  );

  if (!elements.length) return;

  elements.forEach((el) => {
    if (el.dataset.revealReady) return;
    el.dataset.revealReady = 'true';

    const text = el.textContent.trim();
    const words = text.split(/\s+/);

    el.innerHTML = words
      .map((word) => `
        <span class="reveal-text__word">
          <span class="reveal-text__word-inner">${word}</span>
        </span>
      `)
      .join(' ');

    el.classList.add('reveal-text');
  });

  // Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ============================================
   2. PARALLAX LAYERS
   ============================================ */

export function initParallaxAdvanced() {
  const elements = document.querySelectorAll('[data-parallax]');
  if (!elements.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  let ticking = false;
  const items = Array.from(elements).map((el) => ({
    el,
    speed: Number(el.dataset.parallax) || 0.15,
    direction: el.dataset.parallaxDirection || 'down',
  }));

  const update = () => {
    const scrollY = window.scrollY;

    items.forEach(({ el, speed, direction }) => {
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;

      // Only animate when in viewport (perf boost)
      if (rect.bottom < -200 || rect.top > viewportH + 200) return;

      const offset = (scrollY - (scrollY + rect.top - viewportH / 2)) * speed;
      const final = direction === 'up' ? -offset : offset;

      el.style.transform = `translate3d(0, ${final}px, 0)`;
    });

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
   3. MAGNETIC BUTTONS
   ============================================ */

export function initMagnetic() {
  const elements = document.querySelectorAll('[data-magnetic]');
  if (!elements.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(pointer: fine)').matches;
  if (reduce || !isDesktop) return;

  elements.forEach((el) => {
    let rafId = null;
    let isInside = false;

    const onMove = (e) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const strength = Number(el.dataset.magnetic) || 0.3;
        const inner = el.querySelector(':scope > *');

        el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;

        // Inner content moves slightly more
        if (inner) {
          inner.style.transform = `translate3d(${x * strength * 0.4}px, ${y * strength * 0.4}px, 0)`;
        }

        rafId = null;
      });
    };

    const onLeave = () => {
      isInside = false;
      el.style.transform = 'translate3d(0, 0, 0)';
      const inner = el.querySelector(':scope > *');
      if (inner) inner.style.transform = 'translate3d(0, 0, 0)';
    };

    const onEnter = () => {
      isInside = true;
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });
}

/* ============================================
   4. 3D TILT CARDS
   ============================================ */

export function initTiltAdvanced() {
  const elements = document.querySelectorAll('[data-tilt]');
  if (!elements.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(pointer: fine)').matches;
  if (reduce || !isDesktop) return;

  const MAX_TILT = 12;

  elements.forEach((el) => {
    let rafId = null;

    const onMove = (e) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const tiltX = (0.5 - y) * MAX_TILT;
        const tiltY = (x - 0.5) * MAX_TILT;

        el.style.transform = `
          perspective(1000px)
          rotateX(${tiltX}deg)
          rotateY(${tiltY}deg)
          translate3d(0, 0, 0)
          scale3d(1.02, 1.02, 1)
        `;

        el.style.setProperty('--tilt-x', `${x * 100}%`);
        el.style.setProperty('--tilt-y', `${y * 100}%`);
        el.classList.add('is-tilting');

        rafId = null;
      });
    };

    const onLeave = () => {
      el.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        translate3d(0, 0, 0)
        scale3d(1, 1, 1)
      `;
      el.classList.remove('is-tilting');
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });
}

/* ============================================
   5. MARQUEE
   ============================================ */

export function initMarquee() {
  const wraps = document.querySelectorAll('.marquee-advanced, [data-marquee]');
  if (!wraps.length) return;

  wraps.forEach((wrap) => {
    if (wrap.dataset.marqueeReady) return;
    wrap.dataset.marqueeReady = 'true';

    const track = wrap.querySelector('.marquee-advanced__track, [data-marquee-track]');
    if (!track) return;

    // Duplicate content for seamless loop
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    wrap.appendChild(clone);
  });
}

/* ============================================
   6. VIEW TRANSITIONS (Page Navigation)
   ============================================ */

export function initViewTransitions() {
  if (!document.startViewTransition) return;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip external, hash, mailto, tel, target="_blank"
    if (
      href.startsWith('http') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      link.target === '_blank' ||
      href.includes('javascript:')
    ) return;

    // Only same-origin
    try {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
    } catch {
      return;
    }

    e.preventDefault();

    document.startViewTransition(() => {
      window.location.href = href;
    });
  });
}

/* ============================================
   7. CLICK RIPPLE
   ============================================ */

export function initClickRipple() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest(
      '.btn, .p-card__cta, .f-card__cta, .auth-submit, .cart-drawer__checkout, .qv-modal__add'
    );
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'click-ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;

    if (getComputedStyle(target).position === 'static') {
      target.style.position = 'relative';
    }
    target.style.overflow = 'hidden';
    target.appendChild(ripple);

    setTimeout(() => ripple.remove(), 750);
  });
}

/* ============================================
   8. AUTO-ENHANCE CARDS (Tilt)
   ============================================ */

export function autoEnhanceCards() {
  const isDesktop = window.matchMedia('(pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isDesktop || reduce) return;

  const observer = new MutationObserver(() => {
    document.querySelectorAll('.p-card:not([data-tilt])').forEach((card) => {
      card.setAttribute('data-tilt', '');
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // First run
  document.querySelectorAll('.p-card:not([data-tilt])').forEach((card) => {
    card.setAttribute('data-tilt', '');
  });
}

/* ============================================
   9. INIT ALL
   ============================================ */

export function initMotion() {
  initTextReveal();
  initParallaxAdvanced();
  initMagnetic();
  initTiltAdvanced();
  initMarquee();
  initViewTransitions();
  initClickRipple();
  autoEnhanceCards();

  console.log('%c✓ Motion initialized (Phase 2)', 'color:#18B981;font-weight:bold;');
}