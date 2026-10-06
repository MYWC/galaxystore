/* ============================================
   BRAND PAGE
   ============================================ */

import { initLayout } from '../components/layout.js';
import { products, formatPrice } from '../data/products.js';
import { renderProductCard } from '../components/product-card.js';
import { cart, wishlist, compare } from '../store/state.js';
import { toast } from '../components/toast.js';
import { openCart } from '../components/cart-drawer.js';
import { flyToCart } from '../utils/micro.js';
import { brands } from '../data/brands.js';

/* ============================================
   INIT LAYOUT
   ============================================ */
initLayout();

/* ============================================
   BRAND DATA — تکمیل اطلاعات برندها
   ============================================ */

const BRAND_DATA = {
  apple: {
    id: 'apple',
    name: 'Apple',
    fa: 'اپل',
    color: '#1A1F28',
    tagline: 'جدیدترین آیفون‌ها و آیپدها با ضمانت اصالت و خدمات پس از فروش',
    category: 'apple',
  },
  samsung: {
    id: 'samsung',
    name: 'Samsung',
    fa: 'سامسونگ',
    color: '#2386D7',
    tagline: 'پرچمداران گلکسی، سری Z تاشو و تبلت‌های قدرتمند سامسونگ',
    category: 'samsung',
  },
  xiaomi: {
    id: 'xiaomi',
    name: 'Xiaomi',
    fa: 'شیائومی',
    color: '#F59E0B',
    tagline: 'گوشی‌ها و تبلت‌های شیائومی، ردمی و پوکو با بهترین قیمت',
    category: 'xiaomi',
  },
  google: {
    id: 'google',
    name: 'Google',
    fa: 'گوگل',
    color: '#4285F4',
    tagline: 'پیکسل‌های گوگل با دوربین حرفه‌ای و اندروید خالص',
    category: 'google',
  },
  oneplus: {
    id: 'oneplus',
    name: 'OnePlus',
    fa: 'وان‌پلاس',
    color: '#16B5A5',
    tagline: 'سرعت، روانی و شارژ سریع — تجربه‌ای متفاوت از وان‌پلاس',
    category: 'oneplus',
  },
  honor: {
    id: 'honor',
    name: 'Honor',
    fa: 'آنر',
    color: '#7C5CFF',
    tagline: 'محصولات قدرتمند آنر با طراحی مدرن و قیمت مناسب',
    category: 'honor',
  },
  huawei: {
    id: 'huawei',
    name: 'Huawei',
    fa: 'هواوی',
    color: '#CF0A2C',
    tagline: 'تکنولوژی پیشرفته هواوی در دوربین، باتری و طراحی',
    category: 'huawei',
  },
  oppo: {
    id: 'oppo',
    name: 'OPPO',
    fa: 'اوپو',
    color: '#1E7A47',
    tagline: 'سری Find و Reno — نوآوری و طراحی زیبا',
    category: 'oppo',
  },
  vivo: {
    id: 'vivo',
    name: 'vivo',
    fa: 'ویوو',
    color: '#415FFF',
    tagline: 'دوربین حرفه‌ای و باتری قدرتمند در گوشی‌های vivo',
    category: 'vivo',
  },
  transsion: {
    id: 'transsion',
    name: 'Transsion',
    fa: 'ترنسیون',
    color: '#E4002B',
    tagline: 'تکنو، اینفینیکس و آی‌تل — انتخاب‌های اقتصادی',
    category: 'transsion',
  },
};

/* ============================================
   STATE
   ============================================ */

const state = {
  brandId: 'apple',
  tab: 'all',
  sort: 'popular',
  page: 1,
};

const PER_PAGE = 8;

/* ============================================
   HELPERS
   ============================================ */

function getBrandFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || 'apple';
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

function getBrandLogo(brandId) {
  const b = brands.find((x) => x.id === brandId);
  return b?.svg || '';
}

/* ============================================
   RENDER BRAND HERO
   ============================================ */

function renderBrandHero() {
  const data = BRAND_DATA[state.brandId];
  if (!data) return;

  const brandProducts = products.filter((p) => p.category === state.brandId);
  const phoneCount = brandProducts.filter((p) => p.type === 'phone').length;
  const tabletCount = brandProducts.filter((p) => p.type === 'tablet').length;

  // Set CSS custom property for brand color
  const hero = document.getElementById('brand-hero');
  if (hero) hero.style.setProperty('--brand-color', data.color);

  const logoEl = document.getElementById('brand-logo');
  if (logoEl) logoEl.innerHTML = getBrandLogo(state.brandId);

  const nameEl = document.getElementById('brand-name');
  if (nameEl) nameEl.textContent = data.name;

  const taglineEl = document.getElementById('brand-tagline');
  if (taglineEl) taglineEl.textContent = data.tagline;

  const phoneEl = document.getElementById('brand-count-phones');
  if (phoneEl) phoneEl.textContent = phoneCount.toLocaleString('fa-IR');

  const tabletEl = document.getElementById('brand-count-tablets');
  if (tabletEl) tabletEl.textContent = tabletCount.toLocaleString('fa-IR');

  // Breadcrumb
  const bcEl = document.getElementById('breadcrumb-current');
  if (bcEl) bcEl.textContent = data.name;

  document.title = `${data.name} | موبایل استور`;
}

/* ============================================
   FILTER + SORT
   ============================================ */

function filterProducts() {
  let list = products.filter((p) => p.category === state.brandId);

  if (state.tab === 'phone') {
    list = list.filter((p) => p.type === 'phone');
  } else if (state.tab === 'tablet') {
    list = list.filter((p) => p.type === 'tablet');
  } else if (state.tab === 'discount') {
    list = list.filter((p) => maxDiscount(p) > 0);
  }

  return list;
}

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
  const grid = document.getElementById('brand-grid');
  const empty = document.getElementById('brand-empty');
  const count = document.getElementById('brand-result-count');
  const pagination = document.getElementById('brand-pagination');

  if (!grid) return;

  const filtered = filterProducts();
  const sorted = sortProducts(filtered);

  if (count) count.textContent = sorted.length.toLocaleString('fa-IR');

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

  grid.innerHTML = paged.map(renderProductCard).join('');

  renderPagination(pagination, totalPages);
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

    renderGrid();
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };
}

/* ============================================
   TABS
   ============================================ */

function bindTabs() {
  const wrap = document.getElementById('brand-tabs');
  if (!wrap) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-brand-tab]');
    if (!btn) return;

    wrap.querySelectorAll('.brand-tab').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    state.tab = btn.dataset.brandTab;
    state.page = 1;
    renderGrid();
  });
}

/* ============================================
   SORT
   ============================================ */

function bindSort() {
  const select = document.getElementById('brand-sort-select');
  if (!select) return;

  select.value = state.sort;
  select.addEventListener('change', () => {
    state.sort = select.value;
    state.page = 1;
    renderGrid();
  });
}

/* ============================================
   RELATED BRANDS
   ============================================ */

function renderRelatedBrands() {
  const grid = document.getElementById('related-brands-grid');
  if (!grid) return;

  const otherBrands = Object.values(BRAND_DATA).filter((b) => b.id !== state.brandId);

  grid.innerHTML = otherBrands.map((b) => `
    <a href="brand.html?id=${b.id}" class="mini-brand" style="--mini-color:${b.color};">
      <span class="mini-brand__logo">${getBrandLogo(b.id)}</span>
      <span class="mini-brand__name">${b.name}</span>
    </a>
  `).join('');
}

/* ============================================
   GLOBAL CLICK HANDLER
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
  state.brandId = getBrandFromUrl();

  // اگر برند وجود نداشت، برگرد به apple
  if (!BRAND_DATA[state.brandId]) {
    state.brandId = 'apple';
  }

  renderBrandHero();
  bindTabs();
  bindSort();
  renderGrid();
  renderRelatedBrands();

  console.log('%c✓ Brand page loaded', 'color:#18B981;font-weight:bold;');
}

init();