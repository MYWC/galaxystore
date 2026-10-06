/* ============================================
   ABOUT PAGE
   ============================================ */

import { initLayout } from '../components/layout.js';
import { brands } from '../data/brands.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   BRANDS
   ============================================ */

const BRAND_COLORS = {
  apple:    '#1A1F28',
  samsung:  '#2386D7',
  xiaomi:   '#F59E0B',
  google:   '#4285F4',
  oneplus:  '#16B5A5',
  honor:    '#7C5CFF',
  nothing:  '#17202A',
  motorola: '#005B59',
  realme:   '#FFC915',
  huawei:   '#CF0A2C',
};

function renderBrands() {
  const grid = document.getElementById('about-brands');
  if (!grid) return;

  // فقط ۱۰ برند اصلی
  const mainBrands = brands.slice(0, 10);

  grid.innerHTML = mainBrands.map((b) => {
    const color = BRAND_COLORS[b.id] || '#2386D7';
    return `
      <a href="brand.html?id=${b.id}" class="about-brand" style="--brand-color: ${color};">
        <span class="about-brand__logo">${b.svg}</span>
        <span class="about-brand__name">${b.name}</span>
      </a>
    `;
  }).join('');
}

/* ============================================
   SMOOTH SCROLL للـ ANCHOR ها (اگر باشد)
   ============================================ */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      const offset = 100;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================
   INIT
   ============================================ */

function init() {
  renderBrands();
  initSmoothScroll();

  console.log('%c✓ About page loaded', 'color:#18B981;font-weight:bold;');
}

init();