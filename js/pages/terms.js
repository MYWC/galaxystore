/* ============================================
   TERMS PAGE
   ============================================ */

import { initLayout } from '../components/layout.js';

initLayout();

/* ============================================
   TABLE OF CONTENTS
   ============================================ */

function initToc() {
  const nav = document.getElementById('terms-toc');
  const content = document.querySelector('.legal-content');
  if (!nav || !content) return;

  const sections = content.querySelectorAll('.legal-section');

  nav.innerHTML = Array.from(sections).map((s) => {
    const title = s.querySelector('.legal-section__title');
    if (!title) return '';
    // حذف شماره از ابتدای عنوان
    const clone = title.cloneNode(true);
    clone.querySelector('.legal-section__num')?.remove();
    const text = clone.textContent.trim();

    return `
      <a href="#${s.id}" class="legal-toc__link" data-toc-target="${s.id}">
        ${text}
      </a>
    `;
  }).join('');

  // Smooth scroll
  nav.addEventListener('click', (e) => {
    const link = e.target.closest('[data-toc-target]');
    if (!link) return;

    e.preventDefault();
    const target = document.getElementById(link.dataset.tocTarget);
    if (target) {
      const offset = 100;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });

  // Active state on scroll
  const links = nav.querySelectorAll('.legal-toc__link');

  const updateActive = () => {
    let current = '';
    sections.forEach((s) => {
      const rect = s.getBoundingClientRect();
      if (rect.top <= 120) current = s.id;
    });

    links.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.tocTarget === current);
    });
  };

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}

console.log('%c✓ Terms page loaded', 'color:#18B981;font-weight:bold;');

initToc();