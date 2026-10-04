/* ============================================
   TRENDING SECTION + TABS
   ============================================ */

import { products, trendingTabs } from '../data/products.js';
import { renderProductList } from '../components/product-card.js';

/* ---------- محدودیت تعداد نمایش ---------- */
const MAX_ITEMS = 8;

/* ---------- شمارش هر دسته ---------- */
function countByCategory(catId) {
  if (catId === 'all') return products.length;
  return products.filter((p) => p.category === catId).length;
}

/* ---------- فیلتر بر اساس تب ---------- */
function filterByCategory(catId) {
  const list = catId === 'all'
    ? products
    : products.filter((p) => p.category === catId);
  return list.slice(0, MAX_ITEMS);
}

/* ---------- رندر تب‌ها ---------- */
function renderTabs(activeId) {
  const wrap = document.getElementById('trending-tabs');
  if (!wrap) return;

  wrap.innerHTML = trendingTabs.map((t) => {
    const count = countByCategory(t.id);
    const active = t.id === activeId ? ' is-active' : '';
    return `
      <button
        class="trending__tab${active}"
        data-tab="${t.id}"
        type="button"
      >
        ${t.label}
        <span class="trending__tab-count">${count}</span>
      </button>
    `;
  }).join('');
}

/* ---------- رندر گرید ---------- */
function renderGrid(catId) {
  const grid = document.getElementById('trending-grid');
  if (!grid) return;

  const items = filterByCategory(catId);

  if (!items.length) {
    grid.innerHTML = `<div class="trending__empty">محصولی در این دسته یافت نشد.</div>`;
    return;
  }

  renderProductList(grid, items);
}

/* ---------- فعال‌سازی تب ---------- */
function activateTab(catId) {
  renderTabs(catId);
  renderGrid(catId);
}

/* ============================================
   INIT
   ============================================ */

export function initTrending() {
  const section = document.getElementById('trending');
  if (!section) return;

  const wrap = document.getElementById('trending-tabs');
  if (!wrap) return;

  // رندر اولیه با تب "همه"
  activateTab('all');

  // Event Delegation روی تب‌ها (چون دکمه‌ها داینامیک هستند)
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    const catId = btn.dataset.tab;
    activateTab(catId);
  });
}