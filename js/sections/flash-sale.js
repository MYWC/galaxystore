/* ============================================
   FLASH SALE SECTION + COUNTDOWN
   ============================================ */

import { flashSaleProducts, formatPrice } from '../data/products.js';

const ICONS = {
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
};

function renderFlashCard(p) {
  const {
    id, brand, name, price, oldPrice, discount,
    totalStock, sold, image,
  } = p;

  const remaining = Math.max(totalStock - sold, 0);
  const percentSold = totalStock > 0
    ? Math.min(100, Math.round((sold / totalStock) * 100))
    : 0;

  const imageHTML = image
    ? `<img src="${image}" alt="${name}" loading="lazy" />`
    : `<div class="ph ph--square">تصویر محصول</div>`;

  return `
    <article class="f-card" data-product-id="${id}">
      <div class="f-card__media">
        <span class="f-card__discount">
          <span>٪${discount}</span>
          <span>تخفیف</span>
        </span>

        <button class="f-card__wish" aria-label="افزودن به علاقه‌مندی" data-wishlist="${id}">
          ${ICONS.heart}
        </button>

        <div class="f-card__img">
          ${imageHTML}
        </div>
      </div>

      <div class="f-card__body">
        <span class="f-card__brand">${brand}</span>
        <h3 class="f-card__title">${name}</h3>

        <div class="f-card__price">
          <span class="f-card__price-current">
            ${formatPrice(price)}
            <span>تومان</span>
          </span>
          ${oldPrice ? `<span class="f-card__price-old">${formatPrice(oldPrice)}</span>` : ''}
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

        <button class="f-card__cta" data-add-to-cart="${id}">
          ${ICONS.cart}
          افزودن به سبد
        </button>
      </div>
    </article>
  `;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function initCountdown() {
  const el = document.getElementById('flash-countdown');
  if (!el) return;

  const hoursEl   = el.querySelector('[data-cd="hours"]');
  const minutesEl = el.querySelector('[data-cd="minutes"]');
  const secondsEl = el.querySelector('[data-cd="seconds"]');

  const DURATION_MS = ((12 * 60 + 48) * 60 + 35) * 1000;
  const STORAGE_KEY = 'flashSaleEndAt';

  let endAt = Number(localStorage.getItem(STORAGE_KEY));
  if (!endAt || endAt < Date.now()) {
    endAt = Date.now() + DURATION_MS;
    localStorage.setItem(STORAGE_KEY, String(endAt));
  }

  const tick = () => {
    const remaining = Math.max(0, endAt - Date.now());
    const totalSec = Math.floor(remaining / 1000);
    const hours   = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    hoursEl.textContent   = pad2(hours);
    minutesEl.textContent = pad2(minutes);
    secondsEl.textContent = pad2(seconds);

    if (remaining <= 0) clearInterval(timer);
  };

  tick();
  const timer = setInterval(tick, 1000);
}

export function initFlashSale() {
  const grid = document.getElementById('flash-sale-grid');
  if (!grid) return;
  grid.innerHTML = flashSaleProducts.map(renderFlashCard).join('');
  initCountdown();
}