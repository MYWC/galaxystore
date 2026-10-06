/* ============================================
   CART PAGE — Full Cart with Coupons + Summary
   ============================================ */

import { initLayout } from '../components/layout.js';
import { products, formatPrice } from '../data/products.js';
import { cart, wishlist, onChange, KEYS } from '../store/state.js';
import { renderProductCard } from '../components/product-card.js';
import { toast } from '../components/toast.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   CONSTANTS
   ============================================ */

const FREE_SHIPPING_THRESHOLD = 5000000; // ۵ میلیون تومان
const SHIPPING_FEE = 350000; // ۳۵۰ هزار تومان

const COUPONS = {
  WELCOME10: {
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    max: 5000000, // حداکثر تخفیف ۵ میلیون
    label: '۱۰٪ تخفیف',
  },
  MOBILE20: {
    code: 'MOBILE20',
    type: 'percent',
    value: 20,
    max: 15000000,
    label: '۲۰٪ تخفیف',
  },
  FREESHIP: {
    code: 'FREESHIP',
    type: 'shipping',
    value: 100,
    label: 'ارسال رایگان',
  },
};

/* ============================================
   ICONS
   ============================================ */

const ICONS = {
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
};

/* ============================================
   STATE
   ============================================ */

let appliedCoupon = null;

/* ============================================
   HELPERS
   ============================================ */

function colorToHex(colorName) {
  if (!colorName) return null;
  const colorMap = {
    'titanium blue': '#4A6578',
    'natural titanium': '#B8B5AE',
    'black titanium': '#2C2C2E',
    'white titanium': '#EDEDED',
    'desert titanium': '#C7B5A0',
    'black': '#1A1A1A',
    'white': '#FAFAFA',
    'silver': '#C0C0C0',
    'blue': '#3B5BA5',
    'navy': '#1E2A47',
    'green': '#3E5F3E',
    'mint': '#B8D9C9',
    'yellow': '#F4D35E',
    'pink': '#F4A9B5',
    'orange': '#E89B5C',
    'cosmic orange': '#D97E42',
    'purple': '#7E6BB5',
    'violet': '#7C5CFF',
    'red': '#D43E3E',
    'gold': '#D4AF37',
    'graphite': '#4A4A4A',
  };
  return colorMap[colorName.toLowerCase().trim()] || '#95A5A6';
}

/* ============================================
   CALCULATIONS
   ============================================ */

function calcSubtotal(items) {
  return items.reduce((sum, i) => sum + (i.oldPrice || i.price) * i.qty, 0);
}

function calcDiscount(items) {
  return items.reduce((sum, i) => {
    if (i.oldPrice && i.oldPrice > i.price) {
      return sum + (i.oldPrice - i.price) * i.qty;
    }
    return sum;
  }, 0);
}

function calcCouponDiscount(subtotalAfterDiscount) {
  if (!appliedCoupon) return 0;
  const c = COUPONS[appliedCoupon];
  if (!c) return 0;

  if (c.type === 'percent') {
    const raw = Math.round((subtotalAfterDiscount * c.value) / 100);
    return c.max ? Math.min(raw, c.max) : raw;
  }
  return 0;
}

function calcShipping(subtotalAfterDiscount) {
  if (appliedCoupon === 'FREESHIP') return 0;
  if (subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_FEE;
}

function calcTotal(items) {
  const subtotal = calcSubtotal(items);
  const discount = calcDiscount(items);
  const subtotalAfter = subtotal - discount;
  const couponDiscount = calcCouponDiscount(subtotalAfter);
  const shipping = calcShipping(subtotalAfter - couponDiscount);
  const total = subtotalAfter - couponDiscount + shipping;

  return {
    subtotal,
    discount,
    couponDiscount,
    shipping,
    total,
    savings: discount + couponDiscount + (shipping === 0 ? SHIPPING_FEE : 0),
  };
}

/* ============================================
   RENDER — CART ITEMS
   ============================================ */

function renderCartItem(item) {
  const imgSrc = item.image || `assets/images/products/${item.id.split('-').slice(0, -1).join('-')}.jpg`;
  const colorHex = item.color ? colorToHex(item.color) : null;
  const hasDiscount = item.oldPrice && item.oldPrice > item.price;

  const specs = [];
  if (item.storage) specs.push(`<span class="cart-item__spec">${item.storage}</span>`);
  if (item.ram) specs.push(`<span class="cart-item__spec">${item.ram}</span>`);
  if (item.color) {
    specs.push(`
      <span class="cart-item__spec cart-item__spec--color">
        <span class="cart-item__color-dot" style="background:${colorHex};"></span>
        ${item.color}
      </span>
    `);
  }

  return `
    <div class="cart-item" data-cart-id="${item.id}">
      <div class="cart-item__img">
        <img
          src="${imgSrc}"
          alt="${item.name}"
          loading="lazy"
          onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'ph ph--square\\'>تصویر</div>';"
        />
      </div>

      <div class="cart-item__info">
        <span class="cart-item__brand">${item.brand || ''}</span>
        <a href="product.html?id=${item.id.split('-').slice(0, -1).join('-')}" class="cart-item__name" style="text-decoration:none; color:inherit;">${item.name}</a>

        ${specs.length ? `<div class="cart-item__specs">${specs.join('')}</div>` : ''}

        <div class="cart-item__actions">
          <div class="cart-qty">
            <button class="cart-qty__btn" data-qty-dec="${item.id}" aria-label="کاهش">
              ${ICONS.minus}
            </button>
            <span class="cart-qty__value">${item.qty.toLocaleString('fa-IR')}</span>
            <button class="cart-qty__btn" data-qty-inc="${item.id}" aria-label="افزایش">
              ${ICONS.plus}
            </button>
          </div>

          <button class="cart-item__remove" data-remove="${item.id}">
            ${ICONS.trash}
            حذف
          </button>
        </div>
      </div>

      <div class="cart-item__right">
        <div class="cart-item__price">
          <span class="cart-item__price-current">
            ${formatPrice(item.price * item.qty)}
            <span>تومان</span>
          </span>
          ${hasDiscount ? `
            <span class="cart-item__price-old">${formatPrice(item.oldPrice * item.qty)}</span>
            <span class="cart-item__price-discount">
              ${formatPrice((item.oldPrice - item.price) * item.qty)} تومان تخفیف
            </span>
          ` : ''}
        </div>

        <button
          class="cart-item__wish ${wishlist.has(item.id.split('-').slice(0, -1).join('-')) ? 'is-active' : ''}"
          data-wishlist="${item.id.split('-').slice(0, -1).join('-')}"
          aria-label="علاقه‌مندی"
        >
          ${ICONS.heart}
        </button>
      </div>
    </div>
  `;
}

/* ============================================
   RENDER — SUMMARY
   ============================================ */

function renderSummary() {
  const items = cart.get();
  const calc = calcTotal(items);

  // Subtotal
  const subEl = document.getElementById('sum-subtotal');
  if (subEl) subEl.textContent = `${formatPrice(calc.subtotal)} تومان`;

  // Discount
  const discountRow = document.getElementById('row-discount');
  const discountEl = document.getElementById('sum-discount');
  if (calc.discount > 0) {
    if (discountRow) discountRow.hidden = false;
    if (discountEl) discountEl.textContent = `${formatPrice(calc.discount)}− تومان`;
  } else {
    if (discountRow) discountRow.hidden = true;
  }

  // Coupon
  const couponRow = document.getElementById('row-coupon');
  const couponEl = document.getElementById('sum-coupon');
  const couponCodeEl = document.getElementById('sum-coupon-code');
  if (appliedCoupon && calc.couponDiscount > 0) {
    if (couponRow) couponRow.hidden = false;
    if (couponEl) couponEl.textContent = `${formatPrice(calc.couponDiscount)}− تومان`;
    if (couponCodeEl) couponCodeEl.textContent = appliedCoupon;
  } else if (appliedCoupon === 'FREESHIP') {
    if (couponRow) couponRow.hidden = true;
  } else {
    if (couponRow) couponRow.hidden = true;
  }

  // Shipping
  const shippingEl = document.getElementById('sum-shipping');
  const shippingHint = document.getElementById('shipping-hint');
  if (calc.shipping === 0) {
    if (shippingEl) shippingEl.innerHTML = `<span style="color:var(--success); font-weight:var(--fw-bold);">رایگان</span>`;
    if (shippingHint) shippingHint.textContent = '';
  } else {
    if (shippingEl) shippingEl.textContent = `${formatPrice(calc.shipping)} تومان`;
    if (shippingHint) shippingHint.textContent = '';
  }

  // Total
  const totalEl = document.getElementById('sum-total');
  if (totalEl) totalEl.textContent = formatPrice(calc.total);

  // Savings
  const savingsWrap = document.getElementById('summary-savings');
  const savingsEl = document.getElementById('sum-savings');
  const totalSavings = calc.discount + calc.couponDiscount;
  if (totalSavings > 0) {
    if (savingsWrap) savingsWrap.hidden = false;
    if (savingsEl) savingsEl.textContent = formatPrice(totalSavings);
  } else {
    if (savingsWrap) savingsWrap.hidden = true;
  }
}

/* ============================================
   RENDER — FREE SHIPPING PROGRESS
   ============================================ */

function renderFreeShipping() {
  const items = cart.get();
  const calc = calcTotal(items);
  const textEl = document.getElementById('freeship-text');
  const fillEl = document.getElementById('freeship-fill');

  if (!textEl || !fillEl) return;

  const subtotalAfter = calc.subtotal - calc.discount;
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotalAfter, 0);

  if (remaining <= 0) {
    textEl.innerHTML = `🎉 <strong>ارسال رایگان</strong> برای شما فعال شد!`;
    fillEl.style.width = '100%';
  } else {
    textEl.innerHTML = `با <strong>${formatPrice(remaining)} تومان</strong> خرید بیشتر، ارسال رایگان می‌شود`;
    const percent = Math.min((subtotalAfter / FREE_SHIPPING_THRESHOLD) * 100, 100);
    fillEl.style.width = `${percent}%`;
  }
}

/* ============================================
   RENDER — RECOMMENDED
   ============================================ */

function renderRecommended() {
  const wrap = document.getElementById('cart-recommended');
  const grid = document.getElementById('recommended-grid');
  if (!wrap || !grid) return;

  const cartIds = cart.get().map((i) => i.id.split('-').slice(0, -1).join('-'));

  // محصولات با امتیاز بالا که در سبد نیستند
  const recommended = products
    .filter((p) => !cartIds.includes(p.id))
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
   RENDER — FULL PAGE
   ============================================ */

function render() {
  const items = cart.get();

  const emptyEl = document.getElementById('cart-empty');
  const layoutEl = document.getElementById('cart-layout');
  const recEl = document.getElementById('cart-recommended');
  const clearBtn = document.getElementById('clear-cart');
  const subtitle = document.getElementById('cart-subtitle');
  const countEl = document.getElementById('cart-items-count');
  const itemsEl = document.getElementById('cart-items');

  if (!items.length) {
    if (emptyEl) emptyEl.hidden = false;
    if (layoutEl) layoutEl.hidden = true;
    if (recEl) recEl.hidden = true;
    if (clearBtn) clearBtn.hidden = true;
    if (subtitle) subtitle.textContent = 'محصولات انتخابی شما';
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (layoutEl) layoutEl.hidden = false;
  if (clearBtn) clearBtn.hidden = false;

  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
  if (subtitle) subtitle.textContent = `${totalQty.toLocaleString('fa-IR')} کالا در سبد شما`;
  if (countEl) countEl.textContent = totalQty.toLocaleString('fa-IR');

  if (itemsEl) {
    itemsEl.innerHTML = items.map(renderCartItem).join('');
  }

  renderSummary();
  renderFreeShipping();
  renderRecommended();
}

/* ============================================
   COUPON
   ============================================ */

function applyCoupon(code) {
  const cleaned = (code || '').trim().toUpperCase();
  const resultEl = document.getElementById('coupon-result');

  if (!cleaned) {
    showCouponResult('error', 'لطفاً کد تخفیف را وارد کنید');
    return;
  }

  const coupon = COUPONS[cleaned];

  if (!coupon) {
    showCouponResult('error', 'کد تخفیف نامعتبر یا منقضی شده است');
    return;
  }

  const items = cart.get();
  const calc = calcTotal(items);
  const subtotalAfter = calc.subtotal - calc.discount;

  // حداقل مبلغ برای کد
  if (coupon.type === 'percent' && subtotalAfter < 1000000) {
    showCouponResult('error', 'حداقل مبلغ خرید برای این کد ۱ میلیون تومان است');
    return;
  }

  appliedCoupon = cleaned;
  render();
  showCouponResult('success', `کد ${cleaned} اعمال شد — ${coupon.label}`);

  toast({
    type: 'success',
    title: 'کد تخفیف اعمال شد',
    message: coupon.label,
    duration: 2500,
  });
}

function showCouponResult(type, message) {
  const el = document.getElementById('coupon-result');
  if (!el) return;

  el.hidden = false;
  el.className = `cart-coupon__result is-${type}`;
  el.innerHTML = `
    ${type === 'success' ? ICONS.check : ICONS.close}
    <span>${message}</span>
  `;

  if (type === 'success') {
    setTimeout(() => {
      el.hidden = true;
    }, 4000);
  }
}

/* ============================================
   BIND EVENTS
   ============================================ */

function bindEvents() {
  /* ---------- Quantity / Remove ---------- */
  document.addEventListener('click', (e) => {
    /* Increment */
    const inc = e.target.closest('[data-qty-inc]');
    if (inc) {
      const id = inc.dataset.qtyInc;
      const item = cart.get().find((i) => i.id === id);
      if (item) cart.updateQty(id, item.qty + 1);
      render();
      return;
    }

    /* Decrement */
    const dec = e.target.closest('[data-qty-dec]');
    if (dec) {
      const id = dec.dataset.qtyDec;
      const item = cart.get().find((i) => i.id === id);
      if (item) {
        if (item.qty > 1) cart.updateQty(id, item.qty - 1);
        else cart.remove(id);
      }
      render();
      return;
    }

    /* Remove */
    const remove = e.target.closest('[data-remove]');
    if (remove) {
      const id = remove.dataset.remove;
      const item = cart.get().find((i) => i.id === id);
      cart.remove(id);
      toast({
        type: 'info',
        title: 'محصول حذف شد',
        message: item?.name,
        duration: 2200,
      });
      render();
      return;
    }

    /* Clear cart */
    const clear = e.target.closest('#clear-cart');
    if (clear) {
      if (!confirm('آیا از پاک کردن سبد خرید مطمئن هستید؟')) return;
      cart.clear();
      appliedCoupon = null;
      toast({
        type: 'info',
        title: 'سبد خرید پاک شد',
        duration: 2200,
      });
      render();
      return;
    }

    /* Wishlist */
    const wish = e.target.closest('.cart-item__wish');
    if (wish) {
      const id = wish.dataset.wishlist;
      const product = products.find((p) => p.id === id);
      if (!product) return;
      const { added } = wishlist.toggle(product);
      wish.classList.toggle('is-active', added);
      toast({
        type: added ? 'success' : 'info',
        title: added ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد',
        message: product.name,
        duration: 2000,
      });
      return;
    }

    /* Wishlist in recommended cards */
    const wishRec = e.target.closest('.p-card [data-wishlist]');
    if (wishRec) {
      e.preventDefault();
      const id = wishRec.dataset.wishlist;
      const product = products.find((p) => p.id === id);
      if (!product) return;
      const { added } = wishlist.toggle(product);
      wishRec.classList.toggle('is-active', added);
      toast({
        type: added ? 'success' : 'info',
        title: added ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد',
        message: product.name,
        duration: 2000,
      });
      return;
    }
  });

  /* ---------- Coupon ---------- */
  const couponBtn = document.getElementById('coupon-apply');
  const couponInput = document.getElementById('coupon-input');

  if (couponBtn && couponInput) {
    couponBtn.addEventListener('click', () => {
      applyCoupon(couponInput.value);
    });

    couponInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyCoupon(couponInput.value);
      }
    });
  }

  /* ---------- Coupon samples ---------- */
  document.addEventListener('click', (e) => {
    const sample = e.target.closest('[data-coupon]');
    if (!sample) return;
    const code = sample.dataset.coupon;
    if (couponInput) couponInput.value = code;
    applyCoupon(code);
  });

  /* ---------- Cart changes ---------- */
  onChange(KEYS.cart, render);
}

/* ============================================
   INIT
   ============================================ */

function init() {
  render();
  bindEvents();

  console.log('%c✓ Cart page loaded', 'color:#18B981;font-weight:bold;');
}

init();