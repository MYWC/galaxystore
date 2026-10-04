/* ============================================
   App Entry — فاز ۱ تا ۱۰
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

/* ---------- فاز ۱۰ ---------- */
import { initCartDrawer, openCart } from './components/cart-drawer.js';
import { initQuickView } from './components/quick-view.js';
import { initSearch } from './components/search.js';
import { toast } from './components/toast.js';

import { cart, wishlist, compare, onChange, KEYS } from './store/state.js';
import { products } from './data/products.js';

/* ---------- Sticky Header Shadow ---------- */
const header = document.getElementById('site-header');
if (header) {
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Sections ---------- */
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

/* ---------- فاز ۱۰ ---------- */
initCartDrawer();
initQuickView();
initSearch();

/* ============================================
   BADGE SYNC
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

function syncCompareBadges() {
  // اگر Badge مخصوص Compare داری، همان‌جا sync کن
  // فعلاً فقط به‌روزرسانی روی کارت محصولات
  document.querySelectorAll('[data-compare]').forEach((btn) => {
    const id = btn.dataset.compare;
    btn.classList.toggle('is-active', compare.has(id));
  });
}

function syncWishlistButtons() {
  document.querySelectorAll('[data-wishlist]').forEach((btn) => {
    const id = btn.dataset.wishlist;
    btn.classList.toggle('is-active', wishlist.has(id));
  });
}

onChange(KEYS.wishlist, () => {
  syncWishlistBadges();
  syncWishlistButtons();
});

onChange(KEYS.compare, () => {
  syncCompareBadges();
});

// اجرای اولیه
syncWishlistBadges();
syncWishlistButtons();
syncCompareBadges();

/* ============================================
   GLOBAL CLICK HANDLER
   ============================================ */

document.addEventListener('click', (e) => {

  /* --- Wishlist --- */
  const wish = e.target.closest('[data-wishlist]');
  if (wish && !wish.closest('[data-qv-wish]')) {
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

  /* --- Compare --- */
  const cmp = e.target.closest('[data-compare]');
  if (cmp && !cmp.closest('[data-qv-compare]')) {
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

  /* --- Add to Cart --- */
  const add = e.target.closest('[data-add-to-cart]');
  if (add) {
    e.preventDefault();
    const id = add.dataset.addToCart;

    // جستجو در دو لیست: products و flashSale
    // (چون flash sale هم data-add-to-cart دارد)
    const product = products.find((p) => p.id === id);
    // اگر در products نبود، از flashSale خوانده می‌شود
    // اما flashSaleProductها ساختار متفاوتی دارند. اینجا فقط products را داریم
    if (!product) return;

    cart.add(product, 1);

    // انیمیشن روی دکمه
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
      message: product.name,
    });

    setTimeout(() => {
      add.classList.remove('is-added');
      add.innerHTML = original;
    }, 1600);

    // باز کردن Cart Drawer
    setTimeout(() => openCart(), 400);
    return;
  }
});

console.log('%c✓ فاز ۱ تا ۱۰ بارگذاری شد — JavaScript پیشرفته', 'color:#18B981;font-weight:bold;');