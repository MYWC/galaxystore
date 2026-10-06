/* ============================================
   ANIMATION UTILITIES — 120fps Ready
   Scroll Reveal + Counter + Parallax + Tilt
   ============================================ */

import { onFrame, onScroll } from './raf.js';

/* ============================================
   1. SCROLL REVEAL
   ============================================ */

export function initReveal() {
  const elements = document.querySelectorAll('.reveal, .stagger');
  if (!elements.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ============================================
   2. NUMBER COUNTER
   ============================================ */

export function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animate = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1800;
    const suffix = el.dataset.suffix || '';
    const start = performance.now();

    if (reduce) {
      el.textContent = target.toLocaleString('fa-IR') + suffix;
      return;
    }

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = Math.floor(target * eased);
      el.textContent = value.toLocaleString('fa-IR') + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString('fa-IR') + suffix;
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ============================================
   3. PARALLAX
   ============================================ */

export function initParallax() {
  const elements = document.querySelectorAll('[data-parallax]');
  if (!elements.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const update = (scrollY) => {
    elements.forEach((el) => {
      const speed = Number(el.dataset.parallax) || 0.15;
      const offset = scrollY * speed;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  };

  onScroll(update);
}

/* ============================================
   4. TILT (3D Hover)
   ============================================ */

export function initTilt() {
  const elements = document.querySelectorAll('[data-tilt]');
  if (!elements.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

  elements.forEach((el) => {
    let rafId = null;

    const onMove = (e) => {
      if (!isDesktop()) return;
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const max = Number(el.dataset.tilt) || 8;
        el.style.transform = `
          perspective(1000px)
          rotateX(${-y * max}deg)
          rotateY(${x * max}deg)
          translate3d(0, 0, 0)
        `;

        rafId = null;
      });
    };

    const onLeave = () => {
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translate3d(0, 0, 0)';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });
}

/* ============================================
   5. MAGNETIC BUTTON (Micro-interaction)
   ============================================ */

export function initMagnetic() {
  const elements = document.querySelectorAll('[data-magnetic]');
  if (!elements.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

  elements.forEach((el) => {
    let rafId = null;

    const onMove = (e) => {
      if (!isDesktop()) return;
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const strength = Number(el.dataset.magnetic) || 0.25;

        el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
        rafId = null;
      });
    };

    const onLeave = () => {
      el.style.transform = 'translate3d(0, 0, 0)';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });
}

/* ============================================
   6. INIT ALL
   ============================================ */

export function initAnimations() {
  initReveal();
  initCounters();
  initParallax();
  initTilt();
  initMagnetic();
}