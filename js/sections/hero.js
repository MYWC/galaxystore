/* ============================================
   HERO — Cinematic Animations
   Mouse Parallax + Magnetic CTA + Entrance
   ============================================ */

import { onFrame, onScroll, doubleFrame } from '../utils/raf.js';

export function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

  /* ---------- Elements ---------- */
  const phones = hero.querySelector('.hero__phones');
  const tags = hero.querySelectorAll('.hero__tag');
  const orbs = hero.querySelectorAll('.hero__orb');
  const content = hero.querySelector('.hero__content');

  /* ============================================
     1. MOUSE PARALLAX (Phones + Tags)
     ============================================ */

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isAnimating = false;

  const animateLoop = () => {
    // Smooth interpolation (linear easing)
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    // Phones container
    if (phones) {
      phones.style.transform = `translate3d(${currentX * 8}px, ${currentY * 8}px, 0)`;
    }

    // Tags with different depths
    tags.forEach((tag, i) => {
      const depth = (i + 1) * 5;
      tag.style.transform = `translate3d(${currentX * depth}px, ${currentY * depth}px, 0)`;
    });

    // Orbs slower
    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 12;
      orb.style.transform = `translate3d(${currentX * depth}px, ${currentY * depth}px, 0)`;
    });

    // Content subtle
    if (content) {
      content.style.transform = `translate3d(${currentX * -4}px, ${currentY * -4}px, 0)`;
    }

    // Continue if still moving
    const diff = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);
    if (diff > 0.001) {
      requestAnimationFrame(animateLoop);
    } else {
      isAnimating = false;
    }
  };

  const onMouseMove = (e) => {
    if (!isDesktop()) return;

    const rect = hero.getBoundingClientRect();
    targetX = (e.clientX - rect.left) / rect.width - 0.5;
    targetY = (e.clientY - rect.top) / rect.height - 0.5;

    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(animateLoop);
    }
  };

  const onMouseLeave = () => {
    targetX = 0;
    targetY = 0;
    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(animateLoop);
    }
  };

  hero.addEventListener('mousemove', onMouseMove);
  hero.addEventListener('mouseleave', onMouseLeave);

  /* ============================================
     2. MAGNETIC CTA BUTTONS
     ============================================ */

  const ctas = hero.querySelectorAll('.hero__cta .btn');
  ctas.forEach((btn) => {
    let rafId = null;

    const onMove = (e) => {
      if (!isDesktop()) return;
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate3d(${x * 0.15}px, ${y * 0.20}px, 0)`;
        rafId = null;
      });
    };

    const onLeave = () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
    };

    btn.addEventListener('mousemove', onMove);
    btn.addEventListener('mouseleave', onLeave);
  });

  /* ============================================
     3. ENTRANCE ANIMATION
     ============================================ */

  const eyebrow = hero.querySelector('.hero__eyebrow');
  const title = hero.querySelector('.hero__title');
  const desc = hero.querySelector('.hero__desc');
  const cta = hero.querySelector('.hero__cta');
  const trust = hero.querySelector('.hero__trust');
  const visual = hero.querySelector('.hero__visual');

  const entranceItems = [
    { el: eyebrow, delay: 0 },
    { el: title, delay: 100 },
    { el: desc, delay: 200 },
    { el: cta, delay: 300 },
    { el: trust, delay: 400 },
    { el: visual, delay: 250 },
  ];

  entranceItems.forEach(({ el, delay }) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform += ' translate3d(0, 30px, 0)';
    el.style.transition = `opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`;
  });

  doubleFrame(() => {
    entranceItems.forEach(({ el }) => {
      if (!el) return;
      el.style.opacity = '1';
      el.style.transform = el.style.transform.replace(' translate3d(0, 30px, 0)', '');
    });
  });

  /* ============================================
     4. SCROLL FADE (Hero leaves smoothly)
     ============================================ */

  onScroll((scrollY) => {
    if (!hero) return;
    const heroHeight = hero.offsetHeight;
    const progress = Math.min(scrollY / heroHeight, 1);

    // Fade & scale slightly on scroll
    if (visual) {
      visual.style.opacity = String(Math.max(1 - progress * 0.8, 0.3));
    }
  });
}