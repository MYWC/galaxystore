/* ============================================
   STICKY ADD TO CART — Phase B.2
   Floating cart bar for product pages
   ============================================ */

import { formatPrice } from '../data/products.js';

const CART_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;

let stickyEl = null;
let scrollHandler = null;
let isMounted = false;

/* ============================================
   BUILD
   ============================================ */

function buildSticky() {
  const el = document.createElement('div');
  el.className = 'sticky-cart';
  el.id = 'sticky-cart';
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('role', 'region');
  el.setAttribute('aria-label', 'نوار خرید سریع');

  el.innerHTML = `
    <div class="sticky-cart__inner">
      <div class="sticky-cart__product">
        <div class="sticky-cart__img">
          <img id="sticky-cart-img" alt="" loading="lazy" decoding="async" />
        </div>
        <div class="sticky-cart__info">
          <span class="sticky-cart__brand" id="sticky-cart-brand"></span>
          <span class="sticky-cart__name" id="sticky-cart-name"></span>
        </div>
      </div>

      <div class="sticky-cart__price">
        <span class="sticky-cart__price-current" id="sticky-cart-price"></span>
        <span class="sticky-cart__price-old" id="sticky-cart-old"></span>
      </div>

      <button
        class="sticky-cart__cta"
        id="sticky-cart-add"
        type="button"
        aria-label="افزودن به سبد خرید"
      >
        ${CART_ICON}
        <span>افزودن به سبد</span>
      </button>
    </div>
  `;

  document.body.appendChild(el);
  return el;
}

/* ============================================
   INIT
   ============================================ */

/**
 * راه‌اندازی نوار شناور
 * @param {Object} opts
 * @param {Object} opts.product — { id, name, brand }
 * @param {Function} opts.getImageSrc — (product) => string
 * @param {string} [opts.triggerSelector='#add-to-cart-btn'] — وقتی از این عنصر رد شدیم، نوار ظاهر می‌شه
 * @param {Function} opts.onAdd — callback وقتی کاربر روی دکمه کلیک کرد
 * @returns {{ update: Function, destroy: Function }}
 */
export function initStickyAddToCart(opts = {}) {
  if (isMounted) {
    return {
      update: () => {},
      destroy: () => {},
    };
  }

  const {
    product,
    getImageSrc,
    triggerSelector = '#add-to-cart-btn',
    onAdd,
  } = opts;

  if (!product) return { update: () => {}, destroy: () => {} };

  const trigger = document.querySelector(triggerSelector);
  if (!trigger) return { update: () => {}, destroy: () => {} };

  isMounted = true;

  const el = buildSticky();
  stickyEl = el;

  /* ---------- Set product info ---------- */

  const imgEl = el.querySelector('#sticky-cart-img');
  const brandEl = el.querySelector('#sticky-cart-brand');
  const nameEl = el.querySelector('#sticky-cart-name');
  const priceEl = el.querySelector('#sticky-cart-price');
  const oldEl = el.querySelector('#sticky-cart-old');
  const addBtn = el.querySelector('#sticky-cart-add');

  // Image
  if (imgEl) {
    const src = getImageSrc ? getImageSrc(product) : product.image || '';
    if (src) {
      imgEl.src = src;
      imgEl.alt = product.name || '';
      imgEl.onerror = () => {
        imgEl.style.display = 'none';
      };
    } else {
      imgEl.style.display = 'none';
    }
  }

  // Brand + Name
  if (brandEl) brandEl.textContent = product.brand || '';
  if (nameEl) nameEl.textContent = product.name || '';

  /* ---------- Scroll visibility ---------- */

  let ticking = false;

  const updateVisibility = () => {
    if (!trigger.isConnected) return;

    const rect = trigger.getBoundingClientRect();
    // نوار ظاهر می‌شه وقتی دکمه‌ی اصلی از بالای viewport رد شده باشه
    const shouldShow = rect.bottom < -20;

    el.classList.toggle('is-visible', shouldShow);
    el.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    document.body.classList.toggle('has-sticky-cart', shouldShow);

    ticking = false;
  };

  scrollHandler = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateVisibility);
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });
  window.addEventListener('resize', scrollHandler, { passive: true });
  updateVisibility();

  /* ---------- Add to cart ---------- */

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (typeof onAdd === 'function') {
        onAdd();
      } else {
        // Fallback: کلیک روی دکمه‌ی اصلی
        trigger.click();
      }
    });
  }

  /* ---------- API ---------- */

  return {
    /** به‌روزرسانی قیمت / موجودی */
    update(variant) {
      if (!variant) return;

      if (priceEl) {
        priceEl.innerHTML = `${formatPrice(variant.price)} <span>تومان</span>`;
      }

      if (oldEl) {
        if (variant.oldPrice) {
          oldEl.textContent = formatPrice(variant.oldPrice);
          oldEl.style.display = '';
        } else {
          oldEl.textContent = '';
          oldEl.style.display = 'none';
        }
      }

      if (addBtn) {
        addBtn.disabled = variant.stock === 0;
      }
    },

    /** حالت loading (برای هماهنگی با A.6) */
    setLoading(loading) {
      if (!addBtn) return;
      addBtn.classList.toggle('is-loading', loading);
      addBtn.disabled = loading;
    },

    destroy() {
      if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
        window.removeEventListener('resize', scrollHandler);
        scrollHandler = null;
      }
      el.remove();
      document.body.classList.remove('has-sticky-cart');
      stickyEl = null;
      isMounted = false;
    },
  };
}