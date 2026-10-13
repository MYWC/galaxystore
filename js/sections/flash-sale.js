/* ============================================
   FLASH SALE — محصولات واقعی + Countdown زنده
   با اصلاح منطق قیمت و استفاده از allProducts
   ============================================ */

import { allProducts, flashSaleProducts, formatPrice } from '../data/products.js';

const ICONS = {
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
};

/* ---------- ساخت کارت با محصول واقعی ---------- */
function renderFlashCard(saleItem) {
  // از allProducts استفاده می‌کنیم (حتی اگه عکس نداشته باشه)
  const product = allProducts.find((p) => p.id === saleItem.id);

  if (!product || !product.variants?.length) {
    console.warn(`[FlashSale] محصول ${saleItem.id} پیدا نشد یا variant ندارد`);
    return '';
  }

  // ارزان‌ترین واریانت
  const variant = [...product.variants].sort((a, b) => a.price - b.price)[0];

  // قیمت Flash Sale = قیمت فروش ویژه از saleItem
  // قیمت قبل = قیمت اصلی محصول
  const flashPrice = saleItem.price;
  const oldPrice = saleItem.oldPrice || variant.price;

  // درصد تخفیف کل
  const totalDiscountPercent = saleItem.discount
    || Math.round(((oldPrice - flashPrice) / oldPrice) * 100);

  const totalStock = saleItem.totalStock || 0;
  const sold = saleItem.sold || 0;
  const remaining = Math.max(totalStock - sold, 0);
  const percentSold = totalStock > 0
    ? Math.min(100, Math.round((sold / totalStock) * 100))
    : 0;

  const imgSrc = product.image || `assets/images/products/${product.id}.jpg`;

  return `
    <article class="f-card" data-product-id="${product.id}">

      <div class="f-card__media">
        <span class="f-card__discount">
          <span>٪${totalDiscountPercent}</span>
          <span>تخفیف</span>
        </span>

        <button class="f-card__wish" aria-label="افزودن به علاقه‌مندی" data-wishlist="${product.id}">
          ${ICONS.heart}
        </button>

        <div class="f-card__img">
          <img src="${imgSrc}" alt="${product.name}" loading="lazy" />
        </div>
      </div>

      <div class="f-card__body">
        <span class="f-card__brand">${product.brand}</span>
        <h3 class="f-card__title">${product.name}</h3>

        <div class="f-card__price">
          <span class="f-card__price-current">
            ${formatPrice(flashPrice)}
            <span>تومان</span>
          </span>
          <span class="f-card__price-old">${formatPrice(oldPrice)}</span>
        </div>

        <div class="f-card__progress">
          <div class="f-card__progress-bar">
            <div class="f-card__progress-fill" style="width:${percentSold}%"></div>
          </div>
          <div class="f-card__progress-meta">
            <span class="f-card__progress-remaining">فقط ${remaining} عدد باقی مانده</span>
            <span class="f-card__progress-sold">${sold} نفر خریدند</span>
          </div>
        </div>

        <button
          class="f-card__cta"
          data-flash-add="${product.id}"
          data-flash-price="${flashPrice}"
          data-flash-storage="${variant.storage}"
          data-flash-ram="${variant.ram}"
        >
          ${ICONS.cart}
          افزودن به سبد
        </button>
      </div>
    </article>
  `;
}

/* ============================================
   COUNTDOWN — پایان نیمه‌شب امروز
   ============================================ */

function pad2(n) {
  return String(n).padStart(2, '0');
}

function getEndOfDay() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

function initCountdown() {
  const el = document.getElementById('flash-countdown');
  if (!el) return;

  const hoursEl   = el.querySelector('[data-cd="hours"]');
  const minutesEl = el.querySelector('[data-cd="minutes"]');
  const secondsEl = el.querySelector('[data-cd="seconds"]');

  if (!hoursEl || !minutesEl || !secondsEl) return;

  const endAt = getEndOfDay();

  const tick = () => {
    const remaining = Math.max(0, endAt - Date.now());
    const totalSec = Math.floor(remaining / 1000);
    const hours   = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    hoursEl.textContent   = pad2(hours);
    minutesEl.textContent = pad2(minutes);
    secondsEl.textContent = pad2(seconds);
  };

  tick();
  setInterval(tick, 1000);
}

export function initFlashSale() {
  const grid = document.getElementById('flash-sale-grid');
  if (!grid) return;

  grid.innerHTML = flashSaleProducts.map(renderFlashCard).join('');
  initCountdown();
}