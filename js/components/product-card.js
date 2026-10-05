/* ============================================
   PRODUCT CARD RENDERER
   ============================================ */

import { formatPrice } from '../data/products.js';

const ICONS = {
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  compare: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  star: `<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>`,
};

const BADGE_MAP = {
  discount: (p) => `<span class="badge badge--discount">٪${p.discount} تخفیف</span>`,
  new:      () => `<span class="badge badge--new">جدید</span>`,
  hot:      () => `<span class="badge badge--hot">پرفروش</span>`,
  in_stock: () => `<span class="badge badge--in-stock">موجود</span>`,
};

function renderStars(rating) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  let out = '';
  for (let i = 0; i < full; i++) out += ICONS.star;
  if (hasHalf) out += ICONS.star;
  for (let i = out.split('<svg').length - 1; i < 5; i++) out += ICONS.star;
  return out;
}

function renderStock(stock) {
  if (stock === 0) {
    return `<span class="p-card__stock p-card__stock--out">ناموجود</span>`;
  }
  if (stock <= 5) {
    return `<span class="p-card__stock p-card__stock--low">${ICONS.check} فقط ${stock} عدد باقی مانده</span>`;
  }
  return `<span class="p-card__stock">${ICONS.check} موجود در انبار</span>`;
}

export function renderProductCard(product) {
  const {
    id, brand, name, ram, storage,
    rating, reviews, price, oldPrice, discount,
    stock, badges = [], image,
  } = product;

  const badgesHTML = badges
    .map((b) => (BADGE_MAP[b] ? BADGE_MAP[b](product) : ''))
    .join('');

  const oldPriceHTML = oldPrice
    ? `<span class="p-card__price-old">${formatPrice(oldPrice)}</span>`
    : '';

  const imageHTML = image
    ? `<img src="${image}" alt="${name}" loading="lazy" />`
    : `<div class="ph ph--square">تصویر محصول</div>`;

  const ctaDisabled = stock === 0;
  const ctaAttrs = ctaDisabled
    ? 'aria-disabled="true" disabled'
    : `data-add-to-cart="${id}"`;

  return `
    <article class="p-card" data-product-id="${id}">
      <div class="p-card__media">
        ${badgesHTML ? `<div class="p-card__badges">${badgesHTML}</div>` : ''}

        <div class="p-card__actions">
          <button class="p-card__action" aria-label="افزودن به علاقه‌مندی" data-wishlist="${id}">
            ${ICONS.heart}
          </button>
          <button class="p-card__action" aria-label="افزودن به مقایسه" data-compare="${id}">
            ${ICONS.compare}
          </button>
          <button class="p-card__action" aria-label="نمایش سریع" data-quickview="${id}">
            ${ICONS.eye}
          </button>
        </div>

        <div class="p-card__img">
          ${imageHTML}
        </div>
      </div>

      <div class="p-card__body">
        <span class="p-card__brand">
          <span class="p-card__brand-dot"></span>
          ${brand}
        </span>

        <h3 class="p-card__title" title="${name}">${name}</h3>

        <div class="p-card__specs">
          ${storage ? `<span class="p-card__spec">${storage}</span>` : ''}
          ${ram ? `<span class="p-card__spec">${ram} RAM</span>` : ''}
        </div>

        <div class="p-card__rating">
          <span class="p-card__stars">${renderStars(rating)}</span>
          <span class="p-card__rating-value">${rating.toFixed(1)}</span>
          <span>(${reviews})</span>
        </div>

        <div class="p-card__divider"></div>

        ${renderStock(stock)}

        <div class="p-card__price">
          <span class="p-card__price-current">
            ${formatPrice(price)}
            <span>تومان</span>
          </span>
          ${oldPriceHTML}
        </div>

        <button class="p-card__cta" ${ctaAttrs}>
          ${ICONS.cart}
          افزودن به سبد
        </button>
      </div>
    </article>
  `;
}

export function renderProductList(container, items) {
  if (!container) return;
  container.innerHTML = items.map(renderProductCard).join('');
}