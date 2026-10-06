/* ============================================
   TRACK ORDER PAGE
   ============================================ */

import { initLayout } from '../components/layout.js';
import { formatPrice } from '../data/products.js';
import { toast } from '../components/toast.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   STATE
   ============================================ */

const state = {
  tab: 'order', // 'order' | 'phone'
  query: '',
};

/* ============================================
   STATUS DEFINITIONS
   ============================================ */

const STATUSES = [
  {
    id: 'registered',
    title: 'ثبت سفارش',
    desc: 'سفارش شما با موفقیت دریافت شد',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  },
  {
    id: 'confirmed',
    title: 'تأیید سفارش',
    desc: 'سفارش شما توسط تیم ما تأیید شد',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>`,
  },
  {
    id: 'packed',
    title: 'بسته‌بندی شد',
    desc: 'سفارش شما آماده ارسال شد',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  },
  {
    id: 'shipped',
    title: 'ارسال شد',
    desc: 'سفارش به پست/پیک تحویل داده شد',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  },
  {
    id: 'delivered',
    title: 'تحویل شد',
    desc: 'سفارش به دست شما رسید',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  },
];

const STATUS_LABELS = {
  processing: { label: 'در حال پردازش', class: 'processing' },
  shipped: { label: 'ارسال شده', class: 'shipped' },
  delivered: { label: 'تحویل شده', class: 'delivered' },
  canceled: { label: 'لغو شده', class: 'canceled' },
};

/* ============================================
   HELPERS
   ============================================ */

function getOrders() {
  try {
    const raw = localStorage.getItem('ms_orders');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function findOrderByNumber(orderNumber) {
  const cleaned = (orderNumber || '').trim().toUpperCase();
  return getOrders().find((o) => o.orderNumber.toUpperCase() === cleaned);
}

function findOrderByPhone(phone) {
  const cleaned = (phone || '').trim().replace(/\D/g, '');
  return getOrders().find((o) => {
    const orderPhone = (o.customer?.phone || '').replace(/\D/g, '');
    return orderPhone === cleaned;
  });
}

function getOrderStatus(order) {
  // محاسبه وضعیت بر اساس زمان گذشته از ثبت سفارش
  const createdAt = new Date(order.createdAt).getTime();
  const now = Date.now();
  const diffMinutes = (now - createdAt) / 60000;

  if (diffMinutes < 5) return 'registered';
  if (diffMinutes < 30) return 'confirmed';
  if (diffMinutes < 120) return 'packed';
  if (diffMinutes < 1440) return 'shipped'; // ۱ روز
  return 'delivered';
}

function getStatusLabel(statusId) {
  const map = {
    registered: STATUS_LABELS.processing,
    confirmed: STATUS_LABELS.processing,
    packed: STATUS_LABELS.processing,
    shipped: STATUS_LABELS.shipped,
    delivered: STATUS_LABELS.delivered,
    canceled: STATUS_LABELS.canceled,
  };
  return map[statusId] || STATUS_LABELS.processing;
}

function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('fa-IR', options);
  } catch {
    return '—';
  }
}

function getRelativeTime(minutesAgo) {
  if (minutesAgo < 1) return 'همین الان';
  if (minutesAgo < 60) return `${Math.floor(minutesAgo).toLocaleString('fa-IR')} دقیقه پیش`;
  if (minutesAgo < 1440) {
    const hours = Math.floor(minutesAgo / 60);
    return `${hours.toLocaleString('fa-IR')} ساعت پیش`;
  }
  const days = Math.floor(minutesAgo / 1440);
  return `${days.toLocaleString('fa-IR')} روز پیش`;
}

/* ============================================
   RENDER — TIMELINE
   ============================================ */

function renderTimeline(order) {
  const wrap = document.getElementById('track-timeline');
  if (!wrap) return;

  const currentStatusId = getOrderStatus(order);
  const currentIndex = STATUSES.findIndex((s) => s.id === currentStatusId);

  const createdAt = new Date(order.createdAt).getTime();
  const now = Date.now();

  // محاسبه زمان هر مرحله
  const stepDurations = [0, 5, 30, 120, 1440]; // دقیقه

  wrap.innerHTML = STATUSES.map((status, i) => {
    let stepClass = 'is-pending';
    let timeText = '';

    if (i < currentIndex) {
      stepClass = 'is-done';
      const minutesAgo = (now - createdAt) / 60000 - stepDurations[i];
      timeText = getRelativeTime(Math.max(0, minutesAgo));
    } else if (i === currentIndex) {
      stepClass = 'is-active';
      timeText = 'در حال انجام';
    } else {
      stepClass = 'is-pending';
      timeText = 'در انتظار';
    }

    return `
      <div class="track-timeline__step ${stepClass}">
        <div class="track-timeline__dot">
          ${i <= currentIndex ? status.icon : status.icon}
        </div>
        <div class="track-timeline__content">
          <h4 class="track-timeline__title">${status.title}</h4>
          <p class="track-timeline__desc">${status.desc}</p>
        </div>
        <span class="track-timeline__time">${timeText}</span>
      </div>
    `;
  }).join('');
}

/* ============================================
   RENDER — ITEMS
   ============================================ */

function renderItems(order) {
  const wrap = document.getElementById('track-items');
  if (!wrap) return;

  if (!order.items?.length) {
    wrap.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:20px;">محصولی در این سفارش ثبت نشده.</p>`;
    return;
  }

  wrap.innerHTML = order.items.map((item) => {
    const productId = item.id.split('-').slice(0, -1).join('-');
    const imgSrc = item.image || `assets/images/products/${productId}.jpg`;
    const specs = [item.storage, item.ram, item.color].filter(Boolean).join(' • ');

    return `
      <div class="track-item">
        <div class="track-item__img">
          <img src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'ph ph--square\\'>تصویر</div>';" />
          <span class="track-item__qty">${item.qty}</span>
        </div>
        <div class="track-item__info">
          <span class="track-item__brand">${item.brand || ''}</span>
          <span class="track-item__name">${item.name}</span>
          ${specs ? `<span class="track-item__specs">${specs}</span>` : ''}
        </div>
        <span class="track-item__price">
          ${formatPrice(item.price * item.qty)}
          <span>تومان</span>
        </span>
      </div>
    `;
  }).join('');
}

/* ============================================
   RENDER — RESULT
   ============================================ */

function renderOrder(order) {
  const notFound = document.getElementById('track-notfound');
  const result = document.getElementById('track-result');

  if (notFound) notFound.hidden = true;
  if (result) result.hidden = false;

  // Order number
  const numberEl = document.getElementById('order-number');
  if (numberEl) numberEl.textContent = order.orderNumber;

  // Status badge
  const statusId = getOrderStatus(order);
  const statusLabel = getStatusLabel(statusId);
  const statusBadge = document.getElementById('order-status-badge');
  if (statusBadge) {
    statusBadge.className = `track-status track-status--${statusLabel.class}`;
    statusBadge.textContent = statusLabel.label;
  }

  // Date
  const dateEl = document.getElementById('order-date');
  if (dateEl) dateEl.textContent = formatDate(order.createdAt);

  // Shipping
  const shippingLabels = {
    express: 'ارسال سریع',
    normal: 'ارسال عادی',
    sameDay: 'ارسال همان روز',
  };
  const shippingEl = document.getElementById('order-shipping');
  if (shippingEl) {
    shippingEl.textContent = shippingLabels[order.shipping?.method] || '—';
  }

  // Total
  const totalEl = document.getElementById('order-total');
  if (totalEl) totalEl.textContent = `${formatPrice(order.total)} تومان`;

  // Payment
  const paymentLabels = {
    online: 'پرداخت آنلاین',
    cod: 'پرداخت در محل',
    wallet: 'کیف پول',
  };
  const paymentEl = document.getElementById('order-payment');
  if (paymentEl) {
    paymentEl.textContent = paymentLabels[order.payment] || '—';
  }

  // Address info
  const receiverEl = document.getElementById('track-receiver');
  if (receiverEl) {
    receiverEl.textContent = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || '—';
  }

  const phoneEl = document.getElementById('track-phone');
  if (phoneEl) phoneEl.textContent = order.customer?.phone || '—';

  const addressEl = document.getElementById('track-address');
  if (addressEl) {
    const parts = [
      order.shipping?.province,
      order.shipping?.city,
      order.shipping?.address,
      order.shipping?.plateNumber,
    ].filter(Boolean);
    addressEl.textContent = parts.join('، ') || '—';
  }

  const postalEl = document.getElementById('track-postal');
  if (postalEl) postalEl.textContent = order.shipping?.postalCode || '—';

  // Render sections
  renderTimeline(order);
  renderItems(order);

  // Scroll to result
  setTimeout(() => {
    const page = document.getElementById('track-page');
    if (page) {
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  }, 100);
}

/* ============================================
   RENDER — NOT FOUND
   ============================================ */

function renderNotFound() {
  const result = document.getElementById('track-result');
  const notFound = document.getElementById('track-notfound');

  if (result) result.hidden = true;
  if (notFound) notFound.hidden = false;

  window.scrollTo({ top: 200, behavior: 'smooth' });
}

/* ============================================
   SEARCH
   ============================================ */

function performSearch(query) {
  const cleaned = (query || '').trim();

  if (!cleaned) {
    toast({
      type: 'warning',
      title: 'ورودی خالی است',
      message: state.tab === 'order' ? 'شماره سفارش را وارد کنید' : 'شماره موبایل را وارد کنید',
      duration: 2500,
    });
    return;
  }

  let order = null;

  if (state.tab === 'order') {
    order = findOrderByNumber(cleaned);
  } else {
    order = findOrderByPhone(cleaned);
  }

  if (!order) {
    renderNotFound();
    return;
  }

  renderOrder(order);
}

/* ============================================
   BIND TABS
   ============================================ */

function bindTabs() {
  const wrap = document.querySelector('.track-search__tabs');
  const input = document.getElementById('track-input');
  if (!wrap) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-track-tab]');
    if (!btn) return;

    wrap.querySelectorAll('.track-search__tab').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    state.tab = btn.dataset.trackTab;

    if (input) {
      input.value = '';
      input.placeholder =
        state.tab === 'order' ? 'مثلاً MS-12345678' : 'مثلاً ۰۹۱۲۳۴۵۶۷۸۹';
      input.focus();
    }
  });
}

/* ============================================
   BIND FORM
   ============================================ */

function bindForm() {
  const form = document.getElementById('track-form');
  const input = document.getElementById('track-input');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      performSearch(input.value);
    });
  }

  // Try again
  const tryAgain = document.getElementById('try-again');
  if (tryAgain) {
    tryAgain.addEventListener('click', () => {
      const notFound = document.getElementById('track-notfound');
      if (notFound) notFound.hidden = true;

      if (input) {
        input.value = '';
        input.focus();
      }

      window.scrollTo({ top: 200, behavior: 'smooth' });
    });
  }

  // New search
  const newSearch = document.getElementById('new-search');
  if (newSearch) {
    newSearch.addEventListener('click', () => {
      const result = document.getElementById('track-result');
      if (result) result.hidden = true;

      if (input) {
        input.value = '';
        input.focus();
      }

      window.scrollTo({ top: 200, behavior: 'smooth' });
    });
  }
}

/* ============================================
   AUTO-FILL FROM URL
   ============================================ */

function checkUrlQuery() {
  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get('order');
  const phone = params.get('phone');

  const input = document.getElementById('track-input');

  if (orderNumber) {
    state.tab = 'order';
    if (input) input.value = orderNumber;
    setTimeout(() => performSearch(orderNumber), 200);
  } else if (phone) {
    state.tab = 'phone';
    if (input) input.value = phone;
    setTimeout(() => performSearch(phone), 200);
  }
}

/* ============================================
   INIT
   ============================================ */

function init() {
  bindTabs();
  bindForm();

  // If no orders exist, show hint
  if (!getOrders().length) {
    const hint = document.getElementById('track-hint');
    if (hint) {
      hint.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        هنوز سفارشی ثبت نکرده‌اید. پس از خرید موفق، شماره سفارش برای شما ارسال می‌شود.
      `;
    }
  }

  // Auto-check URL
  checkUrlQuery();

  console.log('%c✓ Track order page loaded', 'color:#18B981;font-weight:bold;');
}

init();