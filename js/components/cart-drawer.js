/* ============================================
   CART DRAWER
   رندر + تعاملات
   ============================================ */

import { cart, onChange, KEYS } from '../store/state.js';
import { formatPrice } from '../data/products.js';
import { toast } from './toast.js';

const ICONS = {
  cart:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  close:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  trash:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  plus:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  minus:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  phone:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  checkout:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  empty:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
};

/* ---------- Render Card ---------- */
function renderItem(item) {
  const specs = [item.storage, item.ram ? `${item.ram} RAM` : null]
    .filter(Boolean)
    .join(' • ');

  const oldHTML = item.oldPrice
    ? `<span class="cart-item__old">${formatPrice(item.oldPrice)}</span>`
    : '';

  return `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item__img">${ICONS.phone}</div>

      <div class="cart-item__info">
        <span class="cart-item__brand">${item.brand}</span>
        <span class="cart-item__name">${item.name}</span>
        ${specs ? `<span class="cart-item__specs">${specs}</span>` : ''}

        <div class="cart-item__price-row">
          <span class="cart-item__price">
            ${formatPrice(item.price * item.qty)}
            <span>تومان</span>
          </span>
          ${oldHTML}
        </div>

        <div class="cart-item__qty">
          <button class="cart-item__qty-btn" data-action="dec" aria-label="کاهش">${ICONS.minus}</button>
          <span class="cart-item__qty-value">${item.qty}</span>
          <button class="cart-item__qty-btn" data-action="inc" aria-label="افزایش">${ICONS.plus}</button>
        </div>
      </div>

      <button class="cart-item__remove" data-action="remove" aria-label="حذف">${ICONS.trash}</button>
    </div>
  `;
}

/* ---------- Render Drawer Body ---------- */
function renderCart() {
  const body   = document.getElementById('cart-drawer-body');
  const foot   = document.getElementById('cart-drawer-foot');
  const countEl = document.querySelectorAll('.cart-drawer__count');
  const badge  = document.querySelector('.header__action-badge--cart');

  const items = cart.get();
  const count = cart.count();

  // Badge ها
  countEl.forEach((el) => (el.textContent = count.toLocaleString('fa-IR')));
  if (badge) {
    badge.textContent = count.toLocaleString('fa-IR');
    badge.style.display = count > 0 ? '' : 'none';
  }

  // Empty
  if (!items.length) {
    body.innerHTML = `
      <div class="cart-drawer__empty">
        <div class="cart-drawer__empty-icon">${ICONS.empty}</div>
        <h3 class="cart-drawer__empty-title">سبد خرید شما خالی است</h3>
        <p class="cart-drawer__empty-text">
          برای شروع خرید، محصولات مورد علاقه خود را به سبد اضافه کنید.
        </p>
      </div>
    `;
    foot.innerHTML = '';
    foot.style.display = 'none';
    return;
  }

  body.innerHTML = `
    <div class="cart-drawer__list">
      ${items.map(renderItem).join('')}
    </div>
  `;

  // Foot
  const total = cart.total();
  const totalOld = cart.totalOld();
  const discount = cart.discount();

  foot.style.display = '';
  foot.innerHTML = `
    <div class="cart-drawer__summary">
      <div class="cart-drawer__row">
        <span class="cart-drawer__row-label">جمع کل</span>
        <span class="cart-drawer__row-value">${formatPrice(totalOld)} تومان</span>
      </div>

      ${discount > 0 ? `
        <div class="cart-drawer__row cart-drawer__row--discount">
          <span class="cart-drawer__row-label">تخفیف</span>
          <span class="cart-drawer__row-value">${formatPrice(discount)}− تومان</span>
        </div>
      ` : ''}

      <div class="cart-drawer__row cart-drawer__row--total">
        <span class="cart-drawer__row-label">مبلغ قابل پرداخت</span>
        <span class="cart-drawer__row-value">
          ${formatPrice(total)}
          <span>تومان</span>
        </span>
      </div>
    </div>

    <button class="cart-drawer__checkout" id="cart-checkout">
      ${ICONS.checkout}
      ادامه فرآیند خرید
    </button>
  `;

  // CTA
  document.getElementById('cart-checkout')?.addEventListener('click', () => {
    toast({
      type: 'info',
      title: 'در حال انتقال به تسویه...',
      message: 'این بخش در فاز ۱۲ ساخته می‌شود',
    });
  });
}

/* ---------- Open / Close ---------- */
export function openCart() {
  document.body.classList.add('cart-open');
}

export function closeCart() {
  document.body.classList.remove('cart-open');
}

/* ---------- Init ---------- */
export function initCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const closeBtn = document.getElementById('cart-close');
  const openBtns = document.querySelectorAll('[data-cart-toggle]');

  // Open
  openBtns.forEach((b) => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  });

  // Close
  closeBtn?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);

  // ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('cart-open')) {
      closeCart();
    }
  });

  // Click delegation داخل بدنه
  drawer?.addEventListener('click', (e) => {
    const item = e.target.closest('.cart-item');
    if (!item) return;

    const id = item.dataset.id;
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;

    const current = cart.get().find((i) => i.id === id);
    if (!current) return;

    if (action === 'inc') {
      cart.updateQty(id, current.qty + 1);
    } else if (action === 'dec') {
      cart.updateQty(id, current.qty - 1);
    } else if (action === 'remove') {
      cart.remove(id);
      toast({
        type: 'info',
        title: 'محصول حذف شد',
        message: current.name,
        duration: 2500,
      });
    }
  });

  // Listen برای همگام‌سازی
  onChange(KEYS.cart, renderCart);

  // Render اولیه
  renderCart();
}