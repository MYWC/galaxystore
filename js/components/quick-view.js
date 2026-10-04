/* ============================================
   QUICK VIEW MODAL
   ============================================ */

import { products, formatPrice } from '../data/products.js';
import { cart, wishlist, compare } from '../store/state.js';
import { toast } from './toast.js';
import { openCart } from './cart-drawer.js';

const ICONS = {
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  cart:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  star:  `<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>`,
  compare: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>`,
};

function renderStars(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 })
    .map((_, i) => (i < full ? ICONS.star : ''))
    .join('');
}

function renderStock(stock) {
  if (stock === 0) return `<span class="qv-modal__stock qv-modal__stock--out">ناموجود</span>`;
  if (stock <= 5)  return `<span class="qv-modal__stock qv-modal__stock--low">${ICONS.check} فقط ${stock} عدد باقی مانده</span>`;
  return `<span class="qv-modal__stock">${ICONS.check} موجود در انبار</span>`;
}

/* ---------- Open ---------- */
export function openQuickView(productId) {
  const overlay = document.getElementById('qv-overlay');
  const content = document.getElementById('qv-content');
  if (!overlay || !content) return;

  const p = products.find((x) => x.id === productId);
  if (!p) return;

  const oldHTML = p.oldPrice
    ? `<span class="qv-modal__price-old">${formatPrice(p.oldPrice)}</span>`
    : '';

  const isWished = wishlist.has(p.id);
  const isCompared = compare.has(p.id);

  content.innerHTML = `
    <div class="qv-modal__media">
      <div class="qv-modal__img">تصویر محصول</div>
      <div class="qv-modal__badges">
        ${p.discount ? `<span class="badge badge--discount">٪${p.discount} تخفیف</span>` : ''}
        ${p.badges?.includes('new') ? `<span class="badge badge--new">جدید</span>` : ''}
      </div>
    </div>

    <div class="qv-modal__content">

      <span class="qv-modal__brand">
        <span class="qv-modal__brand-dot"></span>
        ${p.brand}
      </span>

      <h2 class="qv-modal__title">${p.name}</h2>

      <div class="qv-modal__rating">
        <span class="qv-modal__stars">${renderStars(p.rating)}</span>
        <span class="qv-modal__rating-value">${p.rating.toFixed(1)}</span>
        <span>(${p.reviews} نظر)</span>
      </div>

      <p class="qv-modal__desc">
        جدیدترین محصول ${p.brand} با طراحی مدرن، عملکرد بالا و تجربه‌ای
        متفاوت. مناسب برای کاربری روزمره و حرفه‌ای.
      </p>

      <div class="qv-modal__specs">
        ${p.storage ? `
          <div class="qv-modal__spec">
            <span class="qv-modal__spec-label">حافظه</span>
            <span class="qv-modal__spec-value">${p.storage}</span>
          </div>
        ` : ''}
        ${p.ram ? `
          <div class="qv-modal__spec">
            <span class="qv-modal__spec-label">رم</span>
            <span class="qv-modal__spec-value">${p.ram}</span>
          </div>
        ` : ''}
        ${p.color ? `
          <div class="qv-modal__spec">
            <span class="qv-modal__spec-label">رنگ</span>
            <span class="qv-modal__spec-value">${p.color}</span>
          </div>
        ` : ''}
        <div class="qv-modal__spec">
          <span class="qv-modal__spec-label">مدل</span>
          <span class="qv-modal__spec-value">${p.model || p.name}</span>
        </div>
      </div>

      ${renderStock(p.stock)}

      <div class="qv-modal__price">
        <span class="qv-modal__price-current">
          ${formatPrice(p.price)}
          <span>تومان</span>
        </span>
        ${oldHTML}
      </div>

      <div class="qv-modal__cta-row">
        <button
          class="qv-modal__add"
          data-qv-add="${p.id}"
          ${p.stock === 0 ? 'disabled' : ''}
        >
          ${ICONS.cart}
          افزودن به سبد خرید
        </button>

        <button
          class="qv-modal__secondary ${isWished ? 'is-active' : ''}"
          data-qv-wish="${p.id}"
          aria-label="علاقه‌مندی"
        >
          ${ICONS.heart}
        </button>

        <button
          class="qv-modal__secondary ${isCompared ? 'is-active' : ''}"
          data-qv-compare="${p.id}"
          aria-label="مقایسه"
        >
          ${ICONS.compare}
        </button>
      </div>

    </div>
  `;

  document.body.classList.add('qv-open');
}

export function closeQuickView() {
  document.body.classList.remove('qv-open');
}

/* ---------- Init ---------- */
export function initQuickView() {
  const overlay = document.getElementById('qv-overlay');
  const closeBtn = document.getElementById('qv-close');
  if (!overlay) return;

  // Open از طریق Event Delegation روی document
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-quickview]');
    if (trigger) {
      e.preventDefault();
      openQuickView(trigger.dataset.quickview);
      return;
    }

    // Close
    if (e.target === overlay || e.target.closest('#qv-close')) {
      closeQuickView();
      return;
    }

    // Add to cart
    const add = e.target.closest('[data-qv-add]');
    if (add) {
      const p = products.find((x) => x.id === add.dataset.qvAdd);
      if (!p) return;
      cart.add(p, 1);
      add.classList.add('is-added');
      add.innerHTML = `${ICONS.check} اضافه شد`;
      toast({
        type: 'success',
        title: 'به سبد اضافه شد',
        message: p.name,
      });
      setTimeout(() => closeQuickView(), 500);
      setTimeout(() => openCart(), 700);
      return;
    }

    // Wishlist toggle
    const wish = e.target.closest('[data-qv-wish]');
    if (wish) {
      const p = products.find((x) => x.id === wish.dataset.qvWish);
      if (!p) return;
      const { added } = wishlist.toggle(p);
      wish.classList.toggle('is-active', added);
      toast({
        type: added ? 'success' : 'info',
        title: added ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد',
        message: p.name,
        duration: 2200,
      });
      return;
    }

    // Compare toggle
    const cmp = e.target.closest('[data-qv-compare]');
    if (cmp) {
      const p = products.find((x) => x.id === cmp.dataset.qvCompare);
      if (!p) return;
      const { added, error } = compare.toggle(p);
      cmp.classList.toggle('is-active', added);
      toast({
        type: error ? 'warning' : added ? 'success' : 'info',
        title: error || (added ? 'به مقایسه اضافه شد' : 'از مقایسه حذف شد'),
        message: p.name,
        duration: 2200,
      });
      return;
    }
  });

  // ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('qv-open')) {
      closeQuickView();
    }
  });
}