/* ============================================
   App Entry — Mobile Store
   ============================================ */

import { initHero } from './sections/hero.js';
import { initBrandStrip } from './sections/brand-strip.js';
import { initBestDeals } from './sections/best-deals.js';
import { initFlashSale } from './sections/flash-sale.js';
import { initTrending } from './sections/trending.js';
import { initBuyingGuides } from './sections/buying-guides.js';
import { initShopByBrand } from './sections/shop-by-brand.js';
import { initReviews } from './sections/reviews.js';
import { initMagazine } from './sections/magazine.js';
import { initFooter } from './sections/footer.js';
import { initDrawer } from './sections/drawer.js';
import { initFloating } from './sections/floating.js';

import { initCartDrawer, openCart } from './components/cart-drawer.js';
import { initQuickView } from './components/quick-view.js';
import { initSearch } from './components/search.js';
import { toast } from './components/toast.js';

import { cart, wishlist, compare, onChange, KEYS } from './store/state.js';
import { products, formatPrice } from './data/products.js';
import { initAnimations } from './utils/animations.js';

/* ============================================
   STICKY HEADER
   ============================================ */

const header = document.getElementById('site-header');
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================
   INIT SECTIONS
   ============================================ */

initHero();
initBrandStrip();
initBestDeals();
initFlashSale();
initTrending();
initBuyingGuides();
initShopByBrand();
initReviews();
initMagazine();
initFooter();
initDrawer();
initFloating();
initCartDrawer();
initQuickView();
initSearch();

/* ============================================
   INIT ANIMATIONS
   ============================================ */

initAnimations();

/* ============================================
   BADGES SYNC
   ============================================ */

function syncWishlistBadges() {
  const count = wishlist.count();
  document
    .querySelectorAll('.header__action-badge:not(.header__action-badge--cart)')
    .forEach((el) => {
      el.textContent = count.toLocaleString('fa-IR');
      el.style.display = count > 0 ? '' : 'none';
    });
}

function syncWishlistButtons() {
  document.querySelectorAll('[data-wishlist]').forEach((btn) => {
    btn.classList.toggle('is-active', wishlist.has(btn.dataset.wishlist));
  });
}

function syncCompareButtons() {
  document.querySelectorAll('[data-compare]').forEach((btn) => {
    btn.classList.toggle('is-active', compare.has(btn.dataset.compare));
  });
}

onChange(KEYS.wishlist, () => {
  syncWishlistBadges();
  syncWishlistButtons();
});

onChange(KEYS.compare, syncCompareButtons);

syncWishlistBadges();
syncWishlistButtons();
syncCompareButtons();

/* ============================================
   GLOBAL CLICK HANDLER
   ============================================ */

document.addEventListener('click', (e) => {

  /* ============================================
     STORAGE PILL CLICK
     ============================================ */
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

    // Active state
    card.querySelectorAll('.p-card__storage').forEach((b) => b.classList.remove('is-active'));
    storageBtn.classList.add('is-active');
    card.dataset.activeVariant = variantIndex;

    // Update Price
    const priceEl = card.querySelector('[data-price]');
    if (priceEl) {
      priceEl.innerHTML = `${formatPrice(variant.price)} <span>تومان</span>`;
    }

    // Update Old Price
    const oldEl = card.querySelector('[data-oldprice]');
    if (oldEl) {
      oldEl.innerHTML = variant.oldPrice
        ? `<span class="p-card__price-old">${formatPrice(variant.oldPrice)}</span>`
        : '';
    }

    // Update Stock
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

  /* ============================================
     FLASH SALE — ADD TO CART
     ============================================ */
  const flashAdd = e.target.closest('[data-flash-add]');
  if (flashAdd) {
    e.preventDefault();
    const id = flashAdd.dataset.flashAdd;
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const flashPrice = Number(flashAdd.dataset.flashPrice);
    const storage = flashAdd.dataset.flashStorage;
    const ram = flashAdd.dataset.flashRam;

    const cartItem = {
      id: `${product.id}-${storage}-flash`,
      brand: product.brand,
      name: product.name,
      ram,
      storage,
      price: flashPrice,
      oldPrice: null,
      image: product.image,
    };

    cart.add(cartItem, 1);

    const original = flashAdd.innerHTML;
    flashAdd.classList.add('is-added');
    flashAdd.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      اضافه شد
    `;

    toast({
      type: 'success',
      title: 'به سبد خرید اضافه شد',
      message: `${product.name} — ${storage}`,
    });

    setTimeout(() => {
      flashAdd.classList.remove('is-added');
      flashAdd.innerHTML = original;
    }, 1600);

    setTimeout(() => openCart(), 400);
    return;
  }

  /* ============================================
     WISHLIST
     ============================================ */
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

  /* ============================================
     COMPARE
     ============================================ */
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

  /* ============================================
     ADD TO CART (Product Card)
     ============================================ */
  const add = e.target.closest('[data-add-to-cart]');
  if (add) {
    e.preventDefault();
    const id = add.dataset.addToCart;
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const card = add.closest('.p-card');
    const variantIndex = card ? Number(card.dataset.activeVariant || 0) : 0;
    const variant = product.variants[variantIndex] || product.variants[0];

    const cartItem = {
      id: `${product.id}-${variant.storage}`,
      brand: product.brand,
      name: product.name,
      ram: variant.ram,
      storage: variant.storage,
      price: variant.price,
      oldPrice: variant.oldPrice || null,
      image: product.image,
    };

    cart.add(cartItem, 1);

    const original = add.innerHTML;
    add.classList.add('is-added');
    add.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      اضافه شد
    `;

    toast({
      type: 'success',
      title: 'به سبد خرید اضافه شد',
      message: `${product.name} — ${variant.storage}`,
    });

    setTimeout(() => {
      add.classList.remove('is-added');
      add.innerHTML = original;
    }, 1600);

    setTimeout(() => openCart(), 400);
    return;
  }
});

console.log(
  '%c✓ Mobile Store loaded — 120fps Ready',
  'color:#18B981;font-weight:bold;'
);