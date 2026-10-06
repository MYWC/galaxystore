/* ============================================
   HERO — Simple (بدون انیمیشن پیچیده)
   ============================================ */

import { doubleFrame } from '../utils/raf.js';

export function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const banner = hero.querySelector('.hero__banner');
  if (!banner) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Entrance Animation */
  if (!reduce) {
    banner.style.opacity = '0';
    banner.style.transform = 'translate3d(0, 30px, 0) scale(0.97)';
    banner.style.transition =
      'opacity 1s cubic-bezier(0.22, 1, 0.36, 1), transform 1s cubic-bezier(0.22, 1, 0.36, 1)';

    doubleFrame(() => {
      banner.style.opacity = '1';
      banner.style.transform = 'translate3d(0, 0, 0) scale(1)';
    });
  }
}