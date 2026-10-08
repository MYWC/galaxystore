/* ============================================
   MY ORDERS PAGE — with Supabase Orders
   ============================================ */

import { initLayout } from '../components/layout.js';
import { formatPrice } from '../data/products.js';
import { toast } from '../components/toast.js';
import {
  getCurrentUser,
  signOut,
  isSupabaseConfigured,
} from '../services/auth.js';
import { getUserOrders } from '../services/orders.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   STATE
   ============================================ */

const state = {
  status: 'all',
  query: '',
  expanded: new Set(),
  orders: [], // cache
};

/* ============================================
   AUTH
   ============================================ */

async function checkAuth() {
  const user = await getCurrentUser();
  if (!user) {
    const redirect = encodeURIComponent('account/orders.html');
    window.location.href = `../auth/login.html?redirect=${redirect}`;
    return null;
  }
  return user;
}

/* ============================================
   HELPERS
   ============================================ */

function getOrderStatus(order) {
  if (order.status === 'canceled') return 'canceled';

  const createdAt = new Date(order.createdAt).getTime();
  const diffMinutes = (Date.now() - createdAt) / 60000;

  if (diffMinutes < 120) return 'processing';
  if (diffMinutes < 1440) return 'shipped';
  return 'delivered';
}

function getOrderStatusLabel(status) {
  const map = {
    processing: { label: 'در حال پردازش', class: 'processing' },
    shipped:    { label: 'ارسال شده',      class: 'shipped' },
    delivered:  { label: 'تحویل شده',      class: 'delivered' },
    canceled:   { label: 'لغو شده',        class: 'canceled' },
  };
  return map[status] || map.processing;
}

function formatDate(dateString, includeTime = false) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return date.toLocaleDateString('fa-IR', options);
  } catch {
    return '—';
  }
}

function fa(number) {
  return Number(number).toLocaleString('fa-IR');
}

function getShippingLabel(method) {
  const map = {
    express: 'ارسال سریع',
    normal: 'ارسال عادی',
    sameDay: 'ارسال همان روز',
  };
  return map[method] || '—';
}

function getPaymentLabel(method) {
  const map = {
    online: 'پرداخت آنلاین',
    cod: 'پرداخت در محل',
    wallet: 'کیف پول',
  };
  return map[method] || '—';
}

/* ============================================
   FILTER
   ============================================ */

function filterOrders() {
  let orders = state.orders;

  if (state.status !== 'all') {
    orders = orders.filter((o) => getOrderStatus(o) === state.status);
  }

  if (state.query) {
    const q = state.query.trim().toUpperCase();
    orders = orders.filter((o) =>
      o.orderNumber?.toUpperCase().includes(q)
    );
  }

  return orders;
}

/* ============================================
   TAB COUNTS
   ============================================ */

function updateTabCounts() {
  const orders = state.orders;

  const counts = {
    all: orders.length,
    processing: 0,
    shipped: 0,
    delivered: 0,
    canceled: 0,
  };

  orders.forEach((o) => {
    const s = getOrderStatus(o);
    if (counts[s] !== undefined) counts[s]++;
  });

  document.querySelectorAll('[data-count]').forEach((el) => {
    const key = el.dataset.count;
    if (counts[key] !== undefined) {
      el.textContent = fa(counts[key]);
    }
  });

  const totalEl = document.getElementById('orders-count');
  if (totalEl) {
    totalEl.textContent = `${fa(orders.length)} سفارش`;
  }
}

/* ============================================
   RENDER — ORDER CARD
   ============================================ */

function renderOrderCard(order) {
  const statusId = getOrderStatus(order);
  const status = getOrderStatusLabel(statusId);
  const isExpanded = state.expanded.has(order.orderNumber);

  const items = order.items || [];
  const firstItem = items[0];
  const itemsCount = items.length;
  const totalQty = items.reduce((sum, i) => sum + (i.qty || 1), 0);

  const thumbsHTML = items.slice(0, 3).map((item) => {
    const productId = item.id.split('-').slice(0, -1).join('-');
    const imgSrc = item.image || `../assets/images/products/${productId}.jpg`;

    return `
      <div class="order-thumb">
        <img src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'ph ph--square\\'>کالا</div>';" />
      </div>
    `;
  }).join('');

  const moreHTML = itemsCount > 3
    ? `<div class="order-thumb order-thumb--more">+${fa(itemsCount - 3)}</div>`
    : '';

  const detailsItemsHTML = items.map((item) => {
    const productId = item.id.split('-').slice(0, -1).join('-');
    const imgSrc = item.image || `../assets/images/products/${productId}.jpg`;
    const specs = [item.storage, item.ram, item.color].filter(Boolean).join(' • ');

    return `
      <div class="order-details-item">
        <div class="order-details-item__img">
          <img src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'ph ph--square\\'>کالا</div>';" />
          <span class="order-details-item__qty">${fa(item.qty)}</span>
        </div>
        <div class="order-details-item__info">
          <span class="order-details-item__brand">${item.brand || ''}</span>
          <span class="order-details-item__name">${item.name}</span>
          ${specs ? `<span class="order-details-item__specs">${specs}</span>` : ''}
        </div>
        <span class="order-details-item__price">
          ${formatPrice(item.price * item.qty)}
          <span>تومان</span>
        </span>
      </div>
    `;
  }).join('');

  const subtotal = order.subtotal || items.reduce((sum, i) => sum + (i.oldPrice || i.price) * i.qty, 0);
  const discount = order.discount || 0;
  const total = order.total || (subtotal - discount);

  const addressParts = [
    order.shipping?.province,
    order.shipping?.city,
    order.shipping?.address,
  ].filter(Boolean);

  return `
    <div class="order-card ${isExpanded ? 'is-expanded' : ''}" data-order="${order.orderNumber}">

      <div class="order-card__head">
        <div class="order-card__head-left">
          <span class="order-card__num">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7h-9M14 17H5M5 7l2-2M5 7l2 2M19 17l-2-2M19 17l-2 2"/></svg>
            ${order.orderNumber}
          </span>

          <span class="order-card__date">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${formatDate(order.createdAt, true)}
          </span>
        </div>

        <span class="order-status order-status--${status.class}">
          ${status.label}
        </span>
      </div>

      <div class="order-card__body">
        <div class="order-items-preview">
          <div class="order-items-preview__thumbs">
            ${thumbsHTML}
            ${moreHTML}
          </div>

          <div class="order-items-preview__info">
            <span class="order-items-preview__name">
              ${firstItem?.name || 'سفارش'}${itemsCount > 1 ? ' و ' + fa(itemsCount - 1) + ' محصول دیگر' : ''}
            </span>
            <span class="order-items-preview__count">
              ${fa(totalQty)} کالا در این سفارش
            </span>
          </div>
        </div>

        <div class="order-card__meta">
          <div class="order-meta-item">
            <span class="order-meta-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </span>
            <div class="order-meta-item__content">
              <span class="order-meta-item__label">روش ارسال</span>
              <span class="order-meta-item__value">${getShippingLabel(order.shipping?.method)}</span>
            </div>
          </div>

          <div class="order-meta-item">
            <span class="order-meta-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </span>
            <div class="order-meta-item__content">
              <span class="order-meta-item__label">روش پرداخت</span>
              <span class="order-meta-item__value">${getPaymentLabel(order.payment)}</span>
            </div>
          </div>

          <div class="order-meta-item">
            <span class="order-meta-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </span>
            <div class="order-meta-item__content">
              <span class="order-meta-item__label">تعداد</span>
              <span class="order-meta-item__value">${fa(totalQty)} کالا</span>
            </div>
          </div>
        </div>
      </div>

      <div class="order-card__details">
        <div class="order-details-list">
          ${detailsItemsHTML}
        </div>

        <div class="order-details-summary">
          <div class="order-details-summary__row">
            <span class="order-details-summary__row-label">جمع کالاها</span>
            <span class="order-details-summary__row-value">${formatPrice(subtotal)} تومان</span>
          </div>

          ${discount > 0 ? `
            <div class="order-details-summary__row order-details-summary__row--discount">
              <span class="order-details-summary__row-label">تخفیف</span>
              <span class="order-details-summary__row-value">${formatPrice(discount)}− تومان</span>
            </div>
          ` : ''}

          <div class="order-details-summary__row order-details-summary__row--total">
            <span class="order-details-summary__row-label">مبلغ پرداخت شده</span>
            <span class="order-details-summary__row-value">${formatPrice(total)} تومان</span>
          </div>
        </div>

        ${addressParts.length ? `
          <div class="order-details-address">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <div>
              <strong>آدرس تحویل:</strong>
              ${addressParts.join('، ')}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="order-card__foot">
        <div class="order-card__total">
          <span class="order-card__total-label">مبلغ کل:</span>
          <span class="order-card__total-value">
            ${formatPrice(total)}
            <span>تومان</span>
          </span>
        </div>

        <div class="order-card__actions">
          <button class="order-card__btn" data-toggle-order="${order.orderNumber}">
            <svg class="order-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            ${isExpanded ? 'بستن جزئیات' : 'مشاهده جزئیات'}
          </button>

          <a href="../support/track.html?order=${order.orderNumber}" class="order-card__btn order-card__btn--primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            پیگیری
          </a>
        </div>
      </div>

    </div>
  `;
}

/* ============================================
   RENDER — LIST
   ============================================ */

function renderList() {
  const list = document.getElementById('orders-list');
  const empty = document.getElementById('orders-empty');
  const noResult = document.getElementById('orders-no-result');
  if (!list) return;

  const filtered = filterOrders();

  if (!state.orders.length) {
    list.innerHTML = '';
    list.hidden = true;
    if (empty) empty.hidden = false;
    if (noResult) noResult.hidden = true;
    return;
  }

  if (!filtered.length) {
    list.innerHTML = '';
    list.hidden = true;
    if (empty) empty.hidden = true;
    if (noResult) noResult.hidden = false;
    return;
  }

  list.hidden = false;
  if (empty) empty.hidden = true;
  if (noResult) noResult.hidden = true;

  list.innerHTML = filtered.map(renderOrderCard).join('');
}

function render() {
  updateTabCounts();
  renderList();
}

/* ============================================
   BIND
   ============================================ */

function bindTabs() {
  const wrap = document.getElementById('orders-tabs');
  if (!wrap) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-status]');
    if (!btn) return;

    wrap.querySelectorAll('.orders-tab').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    state.status = btn.dataset.status;
    renderList();
  });
}

function bindSearch() {
  const input = document.getElementById('orders-search');
  if (!input) return;

  let timer;
  input.addEventListener('input', (e) => {
    clearTimeout(timer);
    const val = e.target.value;

    timer = setTimeout(() => {
      state.query = val;
      renderList();
    }, 250);
  });
}

function bindExpand() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-toggle-order]');
    if (!btn) return;

    const orderNumber = btn.dataset.toggleOrder;
    const card = document.querySelector(`[data-order="${orderNumber}"]`);
    if (!card) return;

    const isExpanded = state.expanded.has(orderNumber);

    if (isExpanded) {
      state.expanded.delete(orderNumber);
      card.classList.remove('is-expanded');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        مشاهده جزئیات
      `;
    } else {
      state.expanded.add(orderNumber);
      card.classList.add('is-expanded');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
        بستن جزئیات
      `;
    }
  });
}

function bindReset() {
  const btn = document.getElementById('orders-reset');
  if (!btn) return;

  btn.addEventListener('click', () => {
    state.status = 'all';
    state.query = '';

    const search = document.getElementById('orders-search');
    if (search) search.value = '';

    document.querySelectorAll('.orders-tab').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.status === 'all');
    });

    renderList();
  });
}

function bindLogout() {
  const btn = document.getElementById('logout-btn-sidebar');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (!confirm('آیا از خروج از حساب کاربری مطمئن هستید؟')) return;

    await signOut();

    toast({
      type: 'success',
      title: 'خروج موفق',
      message: 'به امید دیدار!',
      duration: 2500,
    });

    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1200);
  });
}

/* ============================================
   INIT
   ============================================ */

async function init() {
  const user = await checkAuth();
  if (!user) return;

  // لود سفارش‌ها
  state.orders = await getUserOrders();

  bindTabs();
  bindSearch();
  bindExpand();
  bindReset();
  bindLogout();

  render();

  if (!isSupabaseConfigured()) {
    console.log('%c⚠️  Orders — Local Fallback mode', 'color:#F59E0B;font-weight:bold;');
  }

  console.log(
    `%c✓ Orders page loaded — ${state.orders.length} orders`,
    'color:#18B981;font-weight:bold;'
  );
}

init();