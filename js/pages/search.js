/* ============================================
   SEARCH PAGE — with Enhanced Recent Searches (B.3)
   ============================================ */

import { initLayout } from '../components/layout.js';
import { products, formatPrice } from '../data/products.js';
import { renderProductCard } from '../components/product-card.js';
import { cart, wishlist, compare } from '../store/state.js';
import { toast } from '../components/toast.js';
import { openCart } from '../components/cart-drawer.js';
import { flyToCart } from '../utils/micro.js';
import { mountEmptyState, hideEmptyState } from '../components/empty-state.js';

/* ============================================
   INIT LAYOUT
   ============================================ */
initLayout();

/* ============================================
   CONSTANTS
   ============================================ */

const RECENT_KEY = 'ms_recent_searches';
const MAX_RECENT = 10;
const PER_PAGE = 12;

const POPULAR_TERMS = [
  'iPhone 16 Pro',
  'Galaxy S25 Ultra',
  'Xiaomi 14T',
  'Pixel 9',
  'گوشی اقتصادی',
  'آیپد',
  'تبلت سامسونگ',
  'OnePlus 13',
  'Redmi Note',
  'هواوی',
];

const ICONS = {
  clock: `<svg class="recent-chip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  search: `<svg class="recent-chip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

/* ============================================
   STATE
   ============================================ */

const state = {
  query: '',
  tab: 'all',
  sort: 'relevance',
  page: 1,
};

/* ============================================
   HELPERS — Normalize Persian
   ============================================ */

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/‌/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ============================================
   RECENT SEARCHES — with timestamp + type
   ============================================ */

function getRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    // Backward compat: old format was array of strings
    return parsed.map((item) => {
      if (typeof item === 'string') {
        return { q: item, ts: Date.now(), type: 'keyword' };
      }
      return item;
    }).filter((item) => item && item.q);
  } catch {
    return [];
  }
}

function detectType(query) {
  const q = normalize(query);
  if (!q) return 'keyword';

  // Brand?
  const brandMatches = products.some((p) =>
    normalize(p.brand).includes(q) || q.includes(normalize(p.brand))
  );
  if (brandMatches && q.length >= 3) return 'brand';

  // Direct product?
  const productMatch = products.find((p) =>
    normalize(p.name).includes(q) || normalize(p.model).includes(q)
  );
  if (productMatch) return 'product';

  return 'keyword';
}

function saveRecent(query) {
  const q = query.trim();
  if (!q) return;

  const type = detectType(q);

  let list = getRecent();
  // Remove duplicates (by normalized text)
  list = list.filter((item) => normalize(item.q) !== normalize(q));
  // Add to front
  list.unshift({
    q,
    ts: Date.now(),
    type,
  });
  // Limit
  list = list.slice(0, MAX_RECENT);

  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {}
}

function removeRecent(query) {
  const list = getRecent().filter((item) => normalize(item.q) !== normalize(query));
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {}
  return list;
}

function clearRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {}
}

/* ============================================
   TIME GROUPING
   ============================================ */

function getTimeGroup(ts) {
  const now = Date.now();
  const diff = now - ts;
  const day = 24 * 60 * 60 * 1000;

  if (diff < day) return 'today';
  if (diff < 2 * day) return 'yesterday';
  if (diff < 7 * day) return 'week';
  return 'older';
}

const GROUP_LABELS = {
  today: 'امروز',
  yesterday: 'دیروز',
  week: 'این هفته',
  older: 'قدیمی‌تر',
};

function groupRecent(list) {
  const groups = {
    today: [],
    yesterday: [],
    week: [],
    older: [],
  };

  list.forEach((item) => {
    const group = getTimeGroup(item.ts || Date.now());
    groups[group].push(item);
  });

  return Object.keys(groups)
    .filter((key) => groups[key].length > 0)
    .map((key) => ({
      label: GROUP_LABELS[key],
      items: groups[key],
    }));
}

/* ============================================
   RENDER — RECENT CHIP
   ============================================ */

function renderRecentChip(item) {
  const icon = item.type === 'brand' ? ICONS.search : ICONS.clock;

  return `
    <button type="button" class="recent-chip" data-recent="${item.q}">
      ${icon}
      <span class="recent-chip__text">${item.q}</span>
      <span class="recent-chip__remove" data-recent-remove="${item.q}" role="button" aria-label="حذف">
        ${ICONS.close}
      </span>
    </button>
  `;
}

/* ============================================
   RENDER — RECENT SEARCHES
   ============================================ */

function renderRecent() {
  const wrap = document.getElementById('recent-searches');
  const list = document.getElementById('recent-list');
  if (!wrap || !list) return;

  const recent = getRecent();

  if (!recent.length) {
    wrap.hidden = true;
    return;
  }

  wrap.hidden = false;

  const groups = groupRecent(recent);

  list.innerHTML = groups.map((group) => `
    <div class="recent-searches__group">
      <div class="recent-searches__group-title">${group.label}</div>
      <div class="recent-searches__list">
        ${group.items.map(renderRecentChip).join('')}
      </div>
    </div>
  `).join('');
}

/* ============================================
   POPULAR SEARCHES
   ============================================ */

function renderPopular() {
  const list = document.getElementById('popular-list');
  if (!list) return;

  list.innerHTML = POPULAR_TERMS.map((t) => `
    <button class="popular-chip" data-popular="${t}">${t}</button>
  `).join('');
}

/* ============================================
   SEARCH
   ============================================ */

function searchProducts(query) {
  const q = normalize(query);
  if (!q) return [];

  const tokens = q.split(' ').filter(Boolean);

  return products
    .map((p) => {
      const haystack = normalize([
        p.name,
        p.brand,
        p.model,
        p.category,
        ...(p.colors || []),
        ...(p.variants || []).map((v) => v.storage),
        ...(p.variants || []).map((v) => v.ram),
      ].filter(Boolean).join(' '));

      let score = 0;
      let allMatch = true;

      tokens.forEach((t) => {
        if (haystack.includes(t)) {
          score += 1;
          if (normalize(p.name).startsWith(t)) score += 2;
          if (normalize(p.brand).startsWith(t)) score += 1;
        } else {
          allMatch = false;
        }
      });

      return { product: p, score, allMatch };
    })
    .filter((r) => r.allMatch || r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.product);
}

/* ============================================
   FILTER BY TAB
   ============================================ */

function filterByTab(list) {
  if (state.tab === 'phone') return list.filter((p) => p.type === 'phone');
  if (state.tab === 'tablet') return list.filter((p) => p.type === 'tablet');
  if (state.tab === 'discount') {
    return list.filter((p) =>
      p.variants?.some((v) => v.oldPrice && v.oldPrice > v.price)
    );
  }
  return list;
}

/* ============================================
   SORT
   ============================================ */

function minPrice(p) {
  if (!p.variants?.length) return Infinity;
  return Math.min(...p.variants.map((v) => v.price));
}

function sortResults(list) {
  const sorted = [...list];

  switch (state.sort) {
    case 'cheapest':
      sorted.sort((a, b) => minPrice(a) - minPrice(b));
      break;
    case 'expensive':
      sorted.sort((a, b) => minPrice(b) - minPrice(a));
      break;
    case 'newest':
      sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
      break;
    case 'popular':
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
  }

  return sorted;
}

/* ============================================
   RENDER RESULTS
   ============================================ */

function renderResults() {
  const grid = document.getElementById('search-grid');
  const empty = document.getElementById('search-empty');
  const info = document.getElementById('search-info');
  const start = document.getElementById('search-start');
  const pagination = document.getElementById('search-pagination');
  const countEl = document.getElementById('search-count');
  const queryEl = document.getElementById('search-query');

  if (!grid) return;

  if (!state.query) {
    info.hidden = true;
    grid.innerHTML = '';
    grid.hidden = true;
    if (empty) empty.hidden = true;
    start.hidden = false;
    pagination.innerHTML = '';
    renderRecent();
    renderSuggested();
    return;
  }

  info.hidden = false;
  start.hidden = true;
  if (queryEl) queryEl.textContent = state.query;

  const results = searchProducts(state.query);
  const filtered = filterByTab(results);
  const sorted = sortResults(filtered);

  if (countEl) countEl.textContent = sorted.length.toLocaleString('fa-IR');

  if (!sorted.length) {
    grid.innerHTML = '';
    grid.hidden = true;
    pagination.innerHTML = '';

    mountEmptyState(empty, {
      icon: 'search',
      title: 'نتیجه‌ای یافت نشد',
      text: `متأسفانه برای «<strong>${state.query}</strong>» محصولی پیدا نکردیم. لطفاً کلمه دیگری امتحان کنید یا دسته‌بندی‌ها را مرور کنید.`,
      variant: 'warning',
      actions: [
        { label: 'مشاهده همه محصولات', href: 'category.html', variant: 'primary', icon: 'package' },
        { label: 'بازگشت به خانه', href: 'index.html', variant: 'outline' },
      ],
    });
    return;
  }

  hideEmptyState(empty);
  grid.hidden = false;

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  if (state.page > totalPages) state.page = 1;
  const startIdx = (state.page - 1) * PER_PAGE;
  const paged = sorted.slice(startIdx, startIdx + PER_PAGE);

  grid.innerHTML = paged.map(renderProductCard).join('');

  renderPagination(pagination, totalPages);
}

/* ============================================
   SUGGESTED
   ============================================ */

function renderSuggested() {
  const grid = document.getElementById('suggested-grid');
  if (!grid) return;

  const suggested = products
    .filter((p) => p.rating >= 4.5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);

  grid.innerHTML = suggested.map(renderProductCard).join('');
}

/* ============================================
   PAGINATION
   ============================================ */

function renderPagination(container, totalPages) {
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const prev = `
    <button class="page-btn" data-page="prev" ${state.page === 1 ? 'disabled' : ''}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
  `;

  const next = `
    <button class="page-btn" data-page="next" ${state.page === totalPages ? 'disabled' : ''}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  `;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= state.page - 1 && i <= state.page + 1)
    ) {
      pages.push(`
        <button class="page-btn ${i === state.page ? 'is-active' : ''}" data-page="${i}">
          ${i.toLocaleString('fa-IR')}
        </button>
      `);
    } else if (
      (i === state.page - 2 && state.page > 3) ||
      (i === state.page + 2 && state.page < totalPages - 2)
    ) {
      pages.push('<span class="page-btn" style="border:none; background:transparent; cursor:default;">...</span>');
    }
  }

  container.innerHTML = prev + pages.join('') + next;

  container.onclick = (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;

    const val = btn.dataset.page;
    if (val === 'prev') state.page = Math.max(1, state.page - 1);
    else if (val === 'next') state.page = Math.min(totalPages, state.page + 1);
    else state.page = Number(val);

    renderResults();
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };
}

/* ============================================
   QUERY HANDLING
   ============================================ */

function performSearch(query, save = true) {
  state.query = query.trim();
  state.page = 1;

  const url = new URL(window.location);
  if (state.query) {
    url.searchParams.set('q', state.query);
  } else {
    url.searchParams.delete('q');
  }
  window.history.replaceState(null, '', url);

  const input = document.getElementById('search-input');
  if (input && input.value !== state.query) {
    input.value = state.query;
  }

  const clearBtn = document.getElementById('search-clear');
  if (clearBtn) {
    clearBtn.hidden = !state.query;
  }

  if (save && state.query) {
    saveRecent(state.query);
    renderRecent();
  }

  const recent = document.getElementById('recent-searches');
  if (recent && state.query) recent.hidden = true;

  renderResults();
}

/* ============================================
   BIND UI
   ============================================ */

function bindSearchForm() {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      performSearch(input.value);
    });
  }

  if (input) {
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const val = input.value.trim();

      if (clearBtn) clearBtn.hidden = !val;

      if (!val) {
        const recent = document.getElementById('recent-searches');
        if (recent) {
          renderRecent();
        }
      }

      debounceTimer = setTimeout(() => {
        if (val.length >= 2 || val.length === 0) {
          state.query = val;
          state.page = 1;
          renderResults();
        }
      }, 300);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        input.value = '';
        performSearch('');
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (input) input.value = '';
      performSearch('');
      if (input) input.focus();
    });
  }
}

function bindRecentSearches() {
  const list = document.getElementById('recent-list');
  const clearBtn = document.getElementById('clear-recent');

  if (list) {
    list.addEventListener('click', (e) => {
      // Remove individual chip
      const removeBtn = e.target.closest('[data-recent-remove]');
      if (removeBtn) {
        e.stopPropagation();
        e.preventDefault();
        const q = removeBtn.dataset.recentRemove;
        removeRecent(q);
        renderRecent();
        return;
      }

      // Click on chip itself
      const chip = e.target.closest('[data-recent]');
      if (!chip) return;
      performSearch(chip.dataset.recent);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearRecent();
      renderRecent();
      toast({
        type: 'info',
        title: 'جستجوهای اخیر پاک شد',
        duration: 2000,
      });
    });
  }
}

function bindPopularSearches() {
  const list = document.getElementById('popular-list');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-popular]');
    if (!chip) return;
    performSearch(chip.dataset.popular);
  });
}

function bindTabs() {
  const wrap = document.getElementById('search-tabs');
  if (!wrap) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-search-tab]');
    if (!btn) return;

    wrap.querySelectorAll('.search-tab').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    state.tab = btn.dataset.searchTab;
    state.page = 1;
    renderResults();
  });
}

function bindSort() {
  const select = document.getElementById('search-sort-select');
  if (!select) return;

  select.value = state.sort;
  select.addEventListener('change', () => {
    state.sort = select.value;
    state.page = 1;
    renderResults();
  });
}

/* ============================================
   GLOBAL CLICK HANDLER
   ============================================ */

document.addEventListener('click', (e) => {
  const storageBtn = e.target.closest('.p-card__storage');
  if (storageBtn && !storageBtn.disabled) {
    e.preventDefault();
    const card = storageBtn.closest('.p-card');
    const productId = card.dataset.productId;
    const variantIndex = Number(storageBtn.dataset.variantIndex);

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const variant = product.variants[variantIndex];
    if (!variant) return;

    card.querySelectorAll('.p-card__storage').forEach((b) => b.classList.remove('is-active'));
    storageBtn.classList.add('is-active');
    card.dataset.activeVariant = variantIndex;

    const priceEl = card.querySelector('[data-price]');
    if (priceEl) priceEl.innerHTML = `${formatPrice(variant.price)} <span>تومان</span>`;

    const oldEl = card.querySelector('[data-oldprice]');
    if (oldEl) {
      oldEl.innerHTML = variant.oldPrice
        ? `<span class="p-card__price-old">${formatPrice(variant.oldPrice)}</span>`
        : '';
    }

    const stockEl = card.querySelector('[data-stock]');
    if (stockEl) {
      if (variant.stock === 0) {
        stockEl.innerHTML = `<span class="p-card__stock p-card__stock--out">ناموجود</span>`;
      } else if (variant.stock <= 5) {
        stockEl.innerHTML = `<span class="p-card__stock p-card__stock--low">فقط ${variant.stock} عدد باقی مانده</span>`;
      } else {
        stockEl.innerHTML = `<span class="p-card__stock">موجود در انبار</span>`;
      }
    }
    return;
  }

  const wish = e.target.closest('[data-wishlist]');
  if (wish) {
    e.preventDefault();
    const id = wish.dataset.wishlist;
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const { added } = wishlist.toggle(product);
    wish.classList.toggle('is-active', added);

    toast({
      type: added ? 'success' : 'info',
      title: added ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد',
      message: product.name,
      duration: 2200,
    });
    return;
  }

  const cmp = e.target.closest('[data-compare]');
  if (cmp) {
    e.preventDefault();
    const id = cmp.dataset.compare;
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const { added, error } = compare.toggle(product);
    cmp.classList.toggle('is-active', added);

    toast({
      type: error ? 'warning' : added ? 'success' : 'info',
      title: error || (added ? 'به مقایسه اضافه شد' : 'از مقایسه حذف شد'),
      message: product.name,
      duration: 2200,
    });
    return;
  }

  const add = e.target.closest('[data-add-to-cart]');
  if (add) {
    e.preventDefault();
    const id = add.dataset.addToCart;
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const card = add.closest('.p-card');
    const variantIndex = card ? Number(card.dataset.activeVariant || 0) : 0;
    const variant = product.variants[variantIndex] || product.variants[0];

    cart.add({
      id: `${product.id}-${variant.storage}`,
      brand: product.brand,
      name: product.name,
      ram: variant.ram,
      storage: variant.storage,
      price: variant.price,
      oldPrice: variant.oldPrice || null,
      image: product.image,
    }, 1);

    flyToCart(add);

    const original = add.innerHTML;
    add.classList.add('is-added');
    add.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> اضافه شد`;

    toast({ type: 'success', title: 'به سبد خرید اضافه شد', message: `${product.name} — ${variant.storage}` });

    setTimeout(() => {
      add.classList.remove('is-added');
      add.innerHTML = original;
    }, 1600);

    setTimeout(() => openCart(), 700);
    return;
  }
});

/* ============================================
   INIT
   ============================================ */

function init() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';

  renderRecent();
  renderPopular();
  bindSearchForm();
  bindRecentSearches();
  bindPopularSearches();
  bindTabs();
  bindSort();

  if (q) {
    performSearch(q, false);
  } else {
    renderResults();
  }

  console.log('%c✓ Search page loaded (B.3)', 'color:#18B981;font-weight:bold;');
}

init();