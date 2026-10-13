/* ============================================
   TRENDING SECTION + TABS
   + Trending by Views tab (C.2)
   ============================================ */

import { products, trendingTabs } from '../data/products.js';
import { renderProductList } from '../components/product-card.js';
import { getTrendingByViews } from '../utils/trending-by-views.js';

const MAX_ITEMS = 8;
const VIEW_TAB_ID = 'hot'; // شناسه تب پربازدید

let currentTabId = 'all';
let viewDataLoaded = false;

/* ============================================
   HELPERS
   ============================================ */

function minPrice(p) {
  if (!p.variants?.length) return Infinity;
  return Math.min(...p.variants.map((v) => v.price));
}

function filterByCategory(catId) {
  if (catId === VIEW_TAB_ID) {
    // برای تب پربازدید، از تابع جداگانه استفاده می‌کنیم
    return [];
  }

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
  if (catId === VIEW_TAB_ID) {
    return '🔥'; // آیکون برای تب پربازدید
  }

  if (catId === 'all') return products.length;
  if (catId === 'phone')    return products.filter((p) => p.type === 'phone').length;
  if (catId === 'tablet')   return products.filter((p) => p.type === 'tablet').length;
  if (catId === 'flagship') return products.filter((p) => minPrice(p) >= 150000000).length;
  if (catId === 'budget')   return products.filter((p) => minPrice(p) <= 50000000).length;
  return products.filter((p) => p.category === catId).length;
}

/* ============================================
   TABS
   ============================================ */

function buildTabsList() {
  // تب پربازدید رو به لیست اضافه می‌کنیم (اگه نبود)
  const hasViewTab = trendingTabs.some((t) => t.id === VIEW_TAB_ID);
  if (hasViewTab) return trendingTabs;

  return [
    ...trendingTabs,
    { id: VIEW_TAB_ID, label: 'پربازدیدترین' },
  ];
}

function renderTabs(activeId) {
  const wrap = document.getElementById('trending-tabs');
  if (!wrap) return;

  const tabs = buildTabsList();

  wrap.innerHTML = tabs.map((t) => {
    const count = countByCategory(t.id);
    const active = t.id === activeId ? ' is-active' : '';
    const isViewTab = t.id === VIEW_TAB_ID;
    const tabClass = isViewTab ? 'trending__tab trending__tab--hot' : 'trending__tab';

    return `
      <button class="${tabClass}${active}" data-tab="${t.id}" type="button">
        ${isViewTab ? `<span class="trending__tab-fire">🔥</span>` : ''}
        ${t.label}
        <span class="trending__tab-count">${typeof count === 'number' ? count : count}</span>
      </button>
    `;
  }).join('');
}

/* ============================================
   GRID — regular
   ============================================ */

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

/* ============================================
   GRID — by views (C.2)
   ============================================ */

async function renderGridByViews() {
  const grid = document.getElementById('trending-grid');
  if (!grid) return;

  // Loading skeleton
  grid.innerHTML = `
    <div class="trending-view-skeleton">
      ${Array.from({ length: 4 }).map(() => `
        <div class="skeleton-product-card">
          <div class="skeleton-product-card__media">
            <div class="skeleton skeleton-product-card__img"></div>
          </div>
          <div class="skeleton-product-card__body">
            <div class="skeleton skeleton-product-card__brand"></div>
            <div class="skeleton skeleton-product-card__title"></div>
            <div class="skeleton skeleton-product-card__title skeleton-product-card__title--short"></div>
            <div class="skeleton skeleton-product-card__price"></div>
            <div class="skeleton skeleton-product-card__cta"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  try {
    const trending = await getTrendingByViews({ limit: MAX_ITEMS });

    if (!trending.length) {
      renderViewsEmpty();
      return;
    }

    // رندر محصولات
    const productsList = trending.map((x) => x.product);
    renderProductList(grid, productsList);

    // اضافه کردن view badge به هر کارت
    requestAnimationFrame(() => {
      trending.forEach(({ product, views }) => {
        const card = grid.querySelector(`[data-product-id="${product.id}"]`);
        if (!card) return;

        const media = card.querySelector('.p-card__media');
        if (!media) return;

        // حذف badge قبلی اگه بود
        media.querySelector('.p-card__views')?.remove();

        const badge = document.createElement('span');
        badge.className = 'p-card__views';
        badge.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          ${views.toLocaleString('fa-IR')}
        `;
        media.appendChild(badge);
      });
    });

    viewDataLoaded = true;
  } catch (err) {
    console.error('[Trending] renderGridByViews error:', err);
    renderViewsEmpty();
  }
}

function renderViewsEmpty() {
  const grid = document.getElementById('trending-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="trending-view-empty">
      <div class="trending-view-empty__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
      <h3 class="trending-view-empty__title">هنوز داده‌ی کافی جمع نشده</h3>
      <p class="trending-view-empty__text">
        به‌زودی پربازدیدترین محصولات اینجا نمایش داده می‌شود.
        فعلاً می‌توانید سایر دسته‌ها را ببینید.
      </p>
      <button class="btn btn--outline btn--sm" data-tab-reset type="button">
        نمایش همه محصولات
      </button>
    </div>
  `;

  // دکمه بازگشت
  grid.querySelector('[data-tab-reset]')?.addEventListener('click', () => {
    activateTab('all');
  });
}

/* ============================================
   ACTIVATE
   ============================================ */

function activateTab(catId) {
  currentTabId = catId;
  renderTabs(catId);

  if (catId === VIEW_TAB_ID) {
    renderGridByViews();
  } else {
    renderGrid(catId);
  }
}

/* ============================================
   INIT
   ============================================ */

export function initTrending() {
  const section = document.getElementById('trending');
  if (!section) return;

  const wrap = document.getElementById('trending-tabs');
  if (!wrap) return;

  activateTab('all');

  // Delegation روی tabs
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    activateTab(btn.dataset.tab);
  });

  // Listen به تغییرات cart/wishlist از session (اگه لازم شد)
  console.log('%c✓ Trending section ready (C.2)', 'color:#18B981;font-weight:bold;');
}