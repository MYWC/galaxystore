/* ============================================
   CATEGORY PAGE — Filters + Sort + Pagination
   ============================================ */

import { initLayout } from '../components/layout.js';
import { products, formatPrice } from '../data/products.js';
import { renderProductCard } from '../components/product-card.js';
import { cart, wishlist, compare, onChange, KEYS } from '../store/state.js';
import { toast } from '../components/toast.js';
import { openCart } from '../components/cart-drawer.js';
import { flyToCart } from '../utils/micro.js';

/* ============================================
   INIT LAYOUT
   ============================================ */
initLayout();

/* ============================================
   CONSTANTS
   ============================================ */

const BRANDS = [
  { id: 'apple', name: 'Apple' },
  { id: 'samsung', name: 'Samsung' },
  { id: 'xiaomi', name: 'Xiaomi' },
  { id: 'google', name: 'Google' },
  { id: 'oneplus', name: 'OnePlus' },
  { id: 'honor', name: 'Honor' },
  { id: 'huawei', name: 'Huawei' },
  { id: 'oppo', name: 'OPPO' },
  { id: 'vivo', name: 'vivo' },
  { id: 'transsion', name: 'Transsion' },
];

const STORAGES = ['128GB', '256GB', '512GB', '1TB', '2TB'];

const PER_PAGE = 9;

/* ============================================
   STATE
   ============================================ */

const state = {
  type: [],
  brand: [],
  storage: [],
  status: [],
  priceMin: null,
  priceMax: null,
  sort: 'popular',
  page: 1,
};

/* ============================================
   HELPERS
   ============================================ */

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);

  const type = params.get('type');
  const brand = params.get('brand');
  const filter = params.get('filter');

  if (type) state.type = [type];
  if (brand) state.brand = [brand];
  if (filter === 'discount') state.status = ['discount'];
  if (filter === 'flagship') state.status = ['flagship'];
  if (filter === 'budget') state.status = ['budget'];
}

function minPrice(p) {
  if (!p.variants?.length) return Infinity;
  return Math.min(...p.variants.map((v) => v.price));
}

function maxDiscount(p) {
  if (!p.variants?.length) return 0;
  let max = 0;
  p.variants.forEach((v) => {
    if (v.oldPrice && v.oldPrice > v.price) {
      const d = Math.round(((v.oldPrice - v.price) / v.oldPrice) * 100);
      if (d > max) max = d;
    }
  });
  return max;
}

function hasStock(p) {
  return p.variants?.some((v) => v.stock > 0);
}

/* ============================================
   FILTER
   ============================================ */

function filterProducts() {
  let list = [...products];

  /* ---------- Type ---------- */
  if (state.type.length) {
    list = list.filter((p) => state.type.includes(p.type));
  }

  /* ---------- Brand ---------- */
  if (state.brand.length) {
    list = list.filter((p) => state.brand.includes(p.category));
  }

  /* ---------- Storage ---------- */
  if (state.storage.length) {
    list = list.filter((p) =>
      p.variants?.some((v) => state.storage.includes(v.storage))
    );
  }

  /* ---------- Status ---------- */
  if (state.status.includes('discount')) {
    list = list.filter((p) => maxDiscount(p) > 0);
  }
  if (state.status.includes('instock')) {
    list = list.filter((p) => hasStock(p));
  }
  if (state.status.includes('flagship')) {
    list = list.filter((p) => minPrice(p) >= 150000000);
  }
  if (state.status.includes('budget')) {
    list = list.filter((p) => minPrice(p) <= 50000000);
  }

  /* ---------- Price ---------- */
  if (state.priceMin != null) {
    list = list.filter((p) => minPrice(p) >= state.priceMin);
  }
  if (state.priceMax != null) {
    list = list.filter((p) => minPrice(p) <= state.priceMax);
  }

  return list;
}

/* ============================================
   SORT
   ============================================ */

function sortProducts(list) {
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
    case 'discount':
      sorted.sort((a, b) => maxDiscount(b) - maxDiscount(a));
      break;
    case 'popular':
    default:
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return sorted;
}

/* ============================================
   RENDER GRID
   ============================================ */

function renderGrid() {
  const grid = document.getElementById('category-grid');
  const empty = document.getElementById('category-empty');
  const count = document.getElementById('category-count');
  const pagination = document.getElementById('category-pagination');

  if (!grid) return;

  const filtered = filterProducts();
  const sorted = sortProducts(filtered);

  // Update count
  if (count) {
    count.textContent = `${sorted.length.toLocaleString('fa-IR')} محصول`;
  }

  // Empty state
  if (!sorted.length) {
    grid.innerHTML = '';
    grid.hidden = true;
    empty.hidden = false;
    pagination.innerHTML = '';
    return;
  }

  grid.hidden = false;
  empty.hidden = true;

  // Pagination
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  if (state.page > totalPages) state.page = 1;
  const start = (state.page - 1) * PER_PAGE;
  const paged = sorted.slice(start, start + PER_PAGE);

  // Render
  grid.innerHTML = paged.map(renderProductCard).join('');

  // Pagination
  renderPagination(pagination, totalPages);

  // Scroll to top on page change
  window.scrollTo({ top: 200, behavior: 'smooth' });
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

  // Events
  container.onclick = (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;

    const val = btn.dataset.page;
    if (val === 'prev') state.page = Math.max(1, state.page - 1);
    else if (val === 'next') state.page = Math.min(totalPages, state.page + 1);
    else state.page = Number(val);

    renderGrid();
  };
}

/* ============================================
   FILTER UI
   ============================================ */

function renderBrandFilters() {
  const wrap = document.getElementById('brand-filters');
  if (!wrap) return;

  wrap.innerHTML = BRANDS.map((b) => {
    const count = products.filter((p) => p.category === b.id).length;
    const checked = state.brand.includes(b.id) ? 'checked' : '';
    return `
      <label class="filter-checkbox">
        <input type="checkbox" data-filter="brand" value="${b.id}" ${checked} />
        <span class="filter-checkbox__box"></span>
        <span class="filter-checkbox__label">${b.name}</span>
        <span class="filter-checkbox__count">${count.toLocaleString('fa-IR')}</span>
      </label>
    `;
  }).join('');
}

function renderStorageFilters() {
  const wrap = document.getElementById('storage-filters');
  if (!wrap) return;

  wrap.innerHTML = STORAGES.map((s) => {
    const count = products.filter((p) =>
      p.variants?.some((v) => v.storage === s)
    ).length;

    if (!count) return '';

    const checked = state.storage.includes(s) ? 'checked' : '';
    return `
      <label class="filter-checkbox">
        <input type="checkbox" data-filter="storage" value="${s}" ${checked} />
        <span class="filter-checkbox__box"></span>
        <span class="filter-checkbox__label">${s}</span>
        <span class="filter-checkbox__count">${count.toLocaleString('fa-IR')}</span>
      </label>
    `;
  }).join('');
}

function updateTypeCounts() {
  const phoneCount = products.filter((p) => p.type === 'phone').length;
  const tabletCount = products.filter((p) => p.type === 'tablet').length;

  const phoneEl = document.querySelector('[data-count="type-phone"]');
  const tabletEl = document.querySelector('[data-count="type-tablet"]');

  if (phoneEl) phoneEl.textContent = phoneCount.toLocaleString('fa-IR');
  if (tabletEl) tabletEl.textContent = tabletCount.toLocaleString('fa-IR');
}

/* ============================================
   ACTIVE FILTERS CHIPS
   ============================================ */

function renderActiveFilters() {
  const wrap = document.getElementById('active-filters');
  if (!wrap) return;

  const chips = [];

  state.type.forEach((t) => {
    chips.push({
      label: t === 'phone' ? 'گوشی موبایل' : 'تبلت',
      key: 'type',
      value: t,
    });
  });

  state.brand.forEach((b) => {
    const brand = BRANDS.find((x) => x.id === b);
    if (brand) chips.push({ label: brand.name, key: 'brand', value: b });
  });

  state.storage.forEach((s) => {
    chips.push({ label: s, key: 'storage', value: s });
  });

  state.status.forEach((s) => {
    const labels = {
      discount: 'تخفیف‌دار',
      instock: 'موجود',
      flagship: 'پرچمدار',
      budget: 'اقتصادی',
    };
    chips.push({ label: labels[s] || s, key: 'status', value: s });
  });

  if (state.priceMin != null) {
    chips.push({
      label: `از ${formatPrice(state.priceMin)}`,
      key: 'priceMin',
      value: null,
    });
  }
  if (state.priceMax != null) {
    chips.push({
      label: `تا ${formatPrice(state.priceMax)}`,
      key: 'priceMax',
      value: null,
    });
  }

  if (!chips.length) {
    wrap.hidden = true;
    wrap.innerHTML = '';
    updateFilterBadge(0);
    return;
  }

  wrap.hidden = false;
  wrap.innerHTML = chips.map((c) => `
    <span class="active-filter">
      ${c.label}
      <button class="active-filter__remove" data-remove-key="${c.key}" data-remove-value="${c.value ?? ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </span>
  `).join('');

  updateFilterBadge(chips.length);
}

function updateFilterBadge(count) {
  const badge = document.getElementById('filter-count-badge');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count.toLocaleString('fa-IR');
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

/* ============================================
   BIND FILTERS
   ============================================ */

function bindFilters() {
  const sidebar = document.getElementById('category-sidebar');
  if (!sidebar) return;

  /* ---------- Checkboxes ---------- */
  sidebar.addEventListener('change', (e) => {
    const input = e.target.closest('[data-filter]');
    if (!input) return;

    const key = input.dataset.filter;
    const value = input.value;

    if (input.checked) {
      if (!state[key].includes(value)) state[key].push(value);
    } else {
      state[key] = state[key].filter((v) => v !== value);
    }

    state.page = 1;
    renderActiveFilters();
    renderGrid();
  });

  /* ---------- Collapsible groups ---------- */
  sidebar.querySelectorAll('.filter-group__head').forEach((head) => {
    head.addEventListener('click', () => {
      const expanded = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', !expanded);
    });
  });

  /* ---------- Clear all ---------- */
  const clearBtn = document.getElementById('clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      resetFilters();
    });
  }

  /* ---------- Active filter chips remove ---------- */
  const activeWrap = document.getElementById('active-filters');
  if (activeWrap) {
    activeWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-key]');
      if (!btn) return;

      const key = btn.dataset.removeKey;
      const value = btn.dataset.removeValue;

      if (key === 'priceMin' || key === 'priceMax') {
        state[key] = null;
        const input = document.getElementById(key === 'priceMin' ? 'price-min' : 'price-max');
        if (input) input.value = '';
      } else if (Array.isArray(state[key])) {
        state[key] = state[key].filter((v) => v !== value);
        // Uncheck input
        sidebar.querySelectorAll(`input[data-filter="${key}"][value="${value}"]`).forEach((i) => {
          i.checked = false;
        });
      }

      state.page = 1;
      renderActiveFilters();
      renderGrid();
    });
  }

  /* ---------- Price apply ---------- */
  const applyPrice = document.getElementById('apply-price');
  if (applyPrice) {
    applyPrice.addEventListener('click', () => {
      const minVal = document.getElementById('price-min')?.value;
      const maxVal = document.getElementById('price-max')?.value;

      state.priceMin = minVal ? Number(minVal) : null;
      state.priceMax = maxVal ? Number(maxVal) : null;

      state.page = 1;
      renderActiveFilters();
      renderGrid();
    });
  }

  /* ---------- Mobile filter toggle ---------- */
  const toggle = document.getElementById('filter-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      sidebar.classList.add('is-open');
      document.body.classList.add('filter-open');
    });
  }

  /* ---------- Mobile apply ---------- */
  const mobileApply = document.getElementById('apply-filters-mobile');
  if (mobileApply) {
    mobileApply.addEventListener('click', () => {
      sidebar.classList.remove('is-open');
      document.body.classList.remove('filter-open');
    });
  }

  /* ---------- Close on overlay click ---------- */
  document.body.addEventListener('click', (e) => {
    if (
      document.body.classList.contains('filter-open') &&
      !sidebar.contains(e.target) &&
      e.target.id !== 'filter-toggle'
    ) {
      sidebar.classList.remove('is-open');
      document.body.classList.remove('filter-open');
    }
  });

  /* ---------- Sort ---------- */
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value;
      state.page = 1;
      renderGrid();
    });
  }

  /* ---------- Empty clear ---------- */
  const emptyClear = document.getElementById('empty-clear');
  if (emptyClear) {
    emptyClear.addEventListener('click', resetFilters);
  }
}

/* ============================================
   RESET
   ============================================ */

function resetFilters() {
  state.type = [];
  state.brand = [];
  state.storage = [];
  state.status = [];
  state.priceMin = null;
  state.priceMax = null;
  state.page = 1;

  // Uncheck all
  document.querySelectorAll('[data-filter]').forEach((i) => (i.checked = false));

  const minInput = document.getElementById('price-min');
  const maxInput = document.getElementById('price-max');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';

  renderActiveFilters();
  renderGrid();
}

/* ============================================
   TITLE
   ============================================ */

function updateTitle() {
  const params = new URLSearchParams(window.location.search);
  const titleEl = document.getElementById('category-title');
  const bcEl = document.getElementById('breadcrumb-current');

  let title = 'همه محصولات';

  if (params.get('type') === 'phone') title = 'گوشی موبایل';
  else if (params.get('type') === 'tablet') title = 'تبلت';
  else if (params.get('filter') === 'discount') title = 'تخفیف‌دار';
  else if (params.get('filter') === 'flagship') title = 'پرچمدار';
  else if (params.get('filter') === 'budget') title = 'اقتصادی';
  else if (params.get('brand')) {
    const b = BRANDS.find((x) => x.id === params.get('brand'));
    if (b) title = b.name;
  }

  if (titleEl) titleEl.textContent = title;
  if (bcEl) bcEl.textContent = title;
  document.title = `${title} | موبایل استور`;
}

/* ============================================
   GLOBAL CLICK HANDLER (Product actions)
   ============================================ */

document.addEventListener('click', (e) => {
  // Storage pill
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

  // Wishlist
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

  // Compare
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

  // Add to cart
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
  getQueryParams();
  updateTitle();
  renderBrandFilters();
  renderStorageFilters();
  updateTypeCounts();
  bindFilters();
  renderActiveFilters();
  renderGrid();

  // Restore checked state for checkboxes
  document.querySelectorAll('[data-filter="type"]').forEach((i) => {
    i.checked = state.type.includes(i.value);
  });
  document.querySelectorAll('[data-filter="brand"]').forEach((i) => {
    i.checked = state.brand.includes(i.value);
  });
  document.querySelectorAll('[data-filter="storage"]').forEach((i) => {
    i.checked = state.storage.includes(i.value);
  });
  document.querySelectorAll('[data-filter="status"]').forEach((i) => {
    i.checked = state.status.includes(i.value);
  });

  console.log('%c✓ Category page loaded', 'color:#18B981;font-weight:bold;');
}

init();