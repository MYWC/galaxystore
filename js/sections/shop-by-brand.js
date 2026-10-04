/* ============================================
   SHOP BY BRAND SECTION
   ============================================ */

import { brands } from '../data/brands.js';

function renderBrandCard(b) {
  return `
    <a href="${b.href}" class="brand-card brand-card--${b.id}">
      <span class="brand-card__logo">
        ${b.svg}
        <span class="brand-card__name">${b.name}</span>
      </span>
      <span class="brand-card__count">${b.count.toLocaleString('fa-IR')} کالا</span>
    </a>
  `;
}

export function initShopByBrand() {
  const grid = document.getElementById('shop-by-brand-grid');
  if (!grid) return;
  grid.innerHTML = brands.map(renderBrandCard).join('');
}