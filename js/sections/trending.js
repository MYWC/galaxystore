/* ============================================
   TRENDING SECTION + TABS
   ============================================ */

import { products, trendingTabs } from '../data/products.js';
import { renderProductList } from '../components/product-card.js';

const MAX_ITEMS = 8;

function minPrice(p) {
  if (!p.variants?.length) return Infinity;
  return Math.min(...p.variants.map((v) => v.price));
}

function filterByCategory(catId) {
  let list;

  if (catId === 'all') {
    list = products;
  } else if (catId === 'phone') {
    list = products.filter((p) => p.type === 'phone');
  } else if (catId === 'tablet') {
    list = products.filter((p) => p.type === 'tablet');
  } else if (catId === 'flagship') {
    list = products.filter((p) => minPrice(p) >= 150000000);
  } else if (catId === 'budget') {
    list = products.filter((p) => minPrice(p) <= 50000000);
  } else {
    list = products.filter((p) => p.category === catId);
  }

  return list.slice(0, MAX_ITEMS);
}

function countByCategory(catId) {
  if (catId === 'all') return products.length;
  if (catId === 'phone')    return products.filter((p) => p.type === 'phone').length;
  if (catId === 'tablet')   return products.filter((p) => p.type === 'tablet').length;
  if (catId === 'flagship') return products.filter((p) => minPrice(p) >= 150000000).length;
  if (catId === 'budget')   return products.filter((p) => minPrice(p) <= 50000000).length;
  return products.filter((p) => p.category === catId).length;
}

function renderTabs(activeId) {
  const wrap = document.getElementById('trending-tabs');
  if (!wrap) return;

  wrap.innerHTML = trendingTabs.map((t) => {
    const count = countByCategory(t.id);
    const active = t.id === activeId ? ' is-active' : '';
    return `
      <button class="trending__tab${active}" data-tab="${t.id}" type="button">
        ${t.label}
        <span class="trending__tab-count">${count}</span>
      </button>
    `;
  }).join('');
}

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

function activateTab(catId) {
  renderTabs(catId);
  renderGrid(catId);
}

export function initTrending() {
  const section = document.getElementById('trending');
  if (!section) return;

  const wrap = document.getElementById('trending-tabs');
  if (!wrap) return;

  activateTab('all');

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    activateTab(btn.dataset.tab);
  });
}