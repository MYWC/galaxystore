/* ============================================
   WISHLIST PAGE
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
   STATE
   ============================================ */

const state = {
  filter: 'all',
  sort: 'newest',
};

/* ============================================
   HELPERS
   ============================================ */

function fa(n) {
  return Number(n).toLocaleString('fa-IR');
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
   GET WISHLIST PRODUCTS
   ============================================ */

function getWishlistProducts() {
  const items = wishlist.get();

  return items
    .map((item) => {
      // پیدا کردن محصول کامل از data
      const product = products.find((p) => p.id === item.id);
      if (!product) return null;

      return {
        ...product,
        _addedAt: item.addedAt || null,
      };
    })
    .filter(Boolean);
}

/* ============================================
   FILTER & SORT
   ============================================ */

function filterProducts(list) {
  if (state.filter === 'available') {
    return list.filter((p) => hasStock(p));
  }
  if (state.filter === 'outofstock') {
    return list.filter((p) => !hasStock(p));
  }
  if (state.filter === 'discount') {
    return list.filter((p) => maxDiscount(p) > 0);
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
    case 'discount':
      sorted.sort((a, b) => maxDiscount(b) - maxDiscount(a));
      break;
    case 'newest':
    default:
      sorted.sort((a, b) => {
        const aTime = a._addedAt ? new Date(a._addedAt).getTime() : 0;
        const bTime = b._addedAt ? new Date(b._addedAt).getTime() : 0;
        return bTime - aTime;
      });
  }

  return sorted;
}

/* ============================================
   STATS
   ============================================ */

function renderStats() {
  const list = getWishlistProducts();

  const countEl = document.getElementById('stat-count');
  const totalEl = document.getElementById('stat-total');
  const discountEl = document.getElementById('stat-discount');

  if (countEl) countEl.textContent = fa(list.length);

  const totalValue = list.reduce((sum, p) => sum + minPrice(p), 0);
  if (totalEl) totalEl.textContent = formatPrice(totalValue);

  const discountCount = list.filter((p) => maxDiscount(p) > 0).length;
  if (discountEl) discountEl.textContent = fa(discountCount);
}

/* ============================================
   RENDER — GRID
   ============================================ */

function render() {
  const grid = document.getElementById('wishlist-grid');
  const empty = document.getElementById('wishlist-empty');
  const noResult = document.getElementById('wishlist-no-result');
  const stats = document.getElementById('wishlist-stats');
  const actions = document.getElementById('wishlist-actions');
  const filters = document.getElementById('wishlist-filters');
  const subtitle = document.getElementById('wishlist-subtitle');
  const recommended = document.getElementById('wishlist-recommended');

  if (!grid) return;

  const all = getWishlistProducts();

  // Stats visible if there are items
  if (stats) stats.hidden = all.length === 0;
  if (actions) actions.hidden = all.length === 0;
  if (filters) filters.hidden = all.length === 0;

  if (subtitle) {
    subtitle.textContent = all.length
      ? `${fa(all.length)} محصول در لیست علاقه‌مندی شما`
      : 'محصولات مورد علاقه شما';
  }

  // Empty
  if (!all.length) {
    grid.innerHTML = '';
    grid.hidden = true;
    if (empty) empty.hidden = false;
    if (noResult) noResult.hidden = true;
    if (recommended) recommended.hidden = false;
    renderRecommended([]);
    return;
  }

  if (empty) empty.hidden = true;

  const filtered = filterProducts(all);
  const sorted = sortProducts(filtered);

  // No results after filter
  if (!sorted.length) {
    grid.innerHTML = '';
    grid.hidden = true;
    if (noResult) noResult.hidden = false;
    if (recommended) recommended.hidden = false;
    renderRecommended(all);
    return;
  }

  grid.hidden = false;
  if (noResult) noResult.hidden = true;
  if (recommended) recommended.hidden = false;

  grid.innerHTML = sorted.map(renderProductCard).join('');

  renderStats();
  renderRecommended(sorted);
}

/* ============================================
   RECOMMENDED
   ============================================ */

function renderRecommended(wishlistItems) {
  const wrap = document.getElementById('wishlist-recommended');
  const grid = document.getElementById('recommended-grid');
  if (!wrap || !grid) return;

  const wishIds = wishlistItems.map((p) => p.id);

  const recommended = products
    .filter((p) => !wishIds.includes(p.id))
    .filter((p) => p.rating >= 4.5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  if (recommended.length < 2) {
    wrap.hidden = true;
    return;
  }

  wrap.hidden = false;
  grid.innerHTML = recommended.map(renderProductCard).join('');
}

/* ============================================
   ACTIONS
   ============================================ */

function clearWishlist() {
  const items = wishlist.get();
  if (!items.length) return;

  if (!confirm('آیا از پاک کردن تمام علاقه‌مندی‌ها مطمئن هستید؟')) return;

  items.forEach((item) => wishlist.remove(item.id));

  toast({
    type: 'success',
    title: 'لیست علاقه‌مندی پاک شد',
    duration: 2200,
  });

  render();
}

function addAllToCart() {
  const list = getWishlistProducts();
  if (!list.length) return;

  let addedCount = 0;
  let outOfStockCount = 0;

  list.forEach((p) => {
    const variant = [...(p.variants || [])].sort((a, b) => a.price - b.price)[0];
    if (!variant || variant.stock === 0) {
      outOfStockCount++;
      return;
    }

    cart.add({
      id: `${p.id}-${variant.storage}`,
      brand: p.brand,
      name: p.name,
      ram: variant.ram,
      storage: variant.storage,
      price: variant.price,
      oldPrice: variant.oldPrice || null,
      image: p.image,
    }, 1);

    addedCount++;
  });

  if (addedCount === 0) {
    toast({
      type: 'warning',
      title: 'محصولات ناموجود',
      message: 'هیچ‌کدام از محصولات موجود نیستند',
      duration: 3000,
    });
    return;
  }

  toast({
    type: 'success',
    title: 'به سبد اضافه شد',
    message: `${fa(addedCount)} محصول به سبد خرید اضافه شد${outOfStockCount ? ` — ${fa(outOfStockCount)} ناموجود` : ''}`,
    duration: 3000,
  });

  setTimeout(() => openCart(), 500);
}

/* ============================================
   BIND
   ============================================ */

function bindFilters() {
  const wrap = document.getElementById('wishlist-tabs');
  if (wrap) {
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;

      wrap.querySelectorAll('.wishlist-tab').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      state.filter = btn.dataset.filter;
      render();
    });
  }

  const sortSelect = document.getElementById('wishlist-sort-select');
  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value;
      render();
    });
  }

  const resetBtn = document.getElementById('wishlist-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.filter = 'all';
      document.querySelectorAll('.wishlist-tab').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.filter === 'all');
      });
      render();
    });
  }
}

function bindActions() {
  const clearBtn = document.getElementById('clear-wishlist');
  if (clearBtn) clearBtn.addEventListener('click', clearWishlist);

  const addAllBtn = document.getElementById('add-all-to-cart');
  if (addAllBtn) addAllBtn.addEventListener('click', addAllToCart);
}

/* ============================================
   GLOBAL CLICK (Product card actions)
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

  // Wishlist toggle (removes from list)
  const wish = e.target.closest('[data-wishlist]');
  if (wish) {
    e.preventDefault();
    const id = wish.dataset.wishlist;
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const { added } = wishlist.toggle(product);

    if (!added) {
      toast({
        type: 'info',
        title: 'از علاقه‌مندی‌ها حذف شد',
        message: product.name,
        duration: 2000,
      });
      // Update UI
      setTimeout(render, 100);
    }
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
   LISTEN TO WISHLIST CHANGES
   ============================================ */

onChange(KEYS.wishlist, () => {
  render();
});

/* ============================================
   INIT
   ============================================ */

function init() {
  bindFilters();
  bindActions();
  render();

  console.log(
    `%c✓ Wishlist loaded — ${wishlist.count()} items`,
    'color:#18B981;font-weight:bold;'
  );
}

init();