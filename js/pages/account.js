/* ============================================
   ACCOUNT DASHBOARD
   ============================================ */

import { initLayout } from '../components/layout.js';
import { formatPrice } from '../data/products.js';
import { cart, wishlist, compare, onChange, KEYS } from '../store/state.js';
import { toast } from '../components/toast.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   CONSTANTS
   ============================================ */

const SESSION_KEY = 'ms_session';
const ORDERS_KEY = 'ms_orders';
const ADDRESSES_KEY = 'ms_addresses';

/* ============================================
   HELPERS
   ============================================ */

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

function getOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getAddresses() {
  try {
    const raw = localStorage.getItem(ADDRESSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getInitials(firstName, lastName) {
  const f = (firstName || '').trim().charAt(0);
  const l = (lastName || '').trim().charAt(0);
  return (f + l).toUpperCase() || '؟';
}

function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function getOrderStatus(order) {
  const createdAt = new Date(order.createdAt).getTime();
  const diffMinutes = (Date.now() - createdAt) / 60000;

  if (diffMinutes < 120) return 'processing';
  if (diffMinutes < 1440) return 'shipped';
  return 'delivered';
}

function getOrderStatusLabel(status) {
  const map = {
    processing: { label: 'در حال پردازش', class: 'processing' },
    shipped: { label: 'ارسال شده', class: 'shipped' },
    delivered: { label: 'تحویل شده', class: 'delivered' },
  };
  return map[status] || map.processing;
}

function fa(number) {
  return Number(number).toLocaleString('fa-IR');
}

/* ============================================
   AUTH GUARD
   ============================================ */

function checkAuth() {
  const session = getSession();

  if (!session?.user) {
    // Redirect to login
    const redirect = encodeURIComponent('account/index.html');
    window.location.href = `../auth/login.html?redirect=${redirect}`;
    return null;
  }

  return session.user;
}

/* ============================================
   RENDER — HERO
   ============================================ */

function renderHero(user) {
  const initials = getInitials(user.firstName, user.lastName);
  const initialsEl = document.getElementById('user-initials');
  const nameEl = document.getElementById('user-name');
  const phoneEl = document.getElementById('user-phone');
  const joinedEl = document.getElementById('user-joined');

  if (initialsEl) initialsEl.textContent = initials;
  if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
  if (phoneEl) phoneEl.textContent = user.phone || '—';

  if (joinedEl) {
    const session = getSession();
    joinedEl.textContent = formatDate(session?.loggedInAt || new Date().toISOString());
  }
}

/* ============================================
   RENDER — STATS
   ============================================ */

function renderStats() {
  const orders = getOrders();
  const wishlistCount = wishlist.count();
  const addressesCount = getAddresses().length;
  const compareCount = compare.count();

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = fa(val);
  };

  setVal('stat-orders', orders.length);
  setVal('stat-wishlist', wishlistCount);
  setVal('stat-addresses', addressesCount);
  setVal('stat-compare', compareCount);
}

/* ============================================
   RENDER — RECENT ORDERS
   ============================================ */

function renderRecentOrders() {
  const wrap = document.getElementById('recent-orders');
  const empty = document.getElementById('orders-empty');
  if (!wrap || !empty) return;

  const orders = getOrders().slice(0, 3);

  if (!orders.length) {
    wrap.innerHTML = '';
    wrap.hidden = true;
    empty.hidden = false;
    return;
  }

  wrap.hidden = false;
  empty.hidden = true;

  wrap.innerHTML = orders.map((order) => {
    const statusId = getOrderStatus(order);
    const status = getOrderStatusLabel(statusId);

    // اولین محصول
    const firstItem = order.items?.[0];
    const productId = firstItem ? firstItem.id.split('-').slice(0, -1).join('-') : '';
    const imgSrc = firstItem?.image || (productId ? `../assets/images/products/${productId}.jpg` : '');
    const itemsCount = order.items?.length || 0;

    return `
      <a href="../support/track.html?order=${order.orderNumber}" class="account-order">
        <div class="account-order__img">
          ${imgSrc
            ? `<img src="${imgSrc}" alt="${firstItem?.name || ''}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'ph ph--square\\'>کالا</div>';" />`
            : `<div class="ph ph--square">کالا</div>`}
          ${itemsCount > 0 ? `<span class="account-order__count">${fa(itemsCount)}</span>` : ''}
        </div>

        <div class="account-order__info">
          <span class="account-order__number">${order.orderNumber}</span>
          <span class="account-order__date">${formatDate(order.createdAt)}</span>
        </div>

        <div class="account-order__right">
          <span class="account-order__total">
            ${formatPrice(order.total)}
            <span>تومان</span>
          </span>
          <span class="account-order__status account-order__status--${status.class}">
            ${status.label}
          </span>
        </div>
      </a>
    `;
  }).join('');
}

/* ============================================
   RENDER — WISHLIST PREVIEW
   ============================================ */

function renderWishlistPreview() {
  const wrap = document.getElementById('wishlist-preview');
  const empty = document.getElementById('wishlist-empty');
  if (!wrap || !empty) return;

  const items = wishlist.get().slice(0, 3);

  if (!items.length) {
    wrap.innerHTML = '';
    wrap.hidden = true;
    empty.hidden = false;
    return;
  }

  wrap.hidden = false;
  empty.hidden = true;

  wrap.innerHTML = items.map((item) => {
    const imgSrc = item.image || `../assets/images/products/${item.id}.jpg`;

    return `
      <a href="../product.html?id=${item.id}" class="account-wish-item">
        <div class="account-wish-item__img">
          <img src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'ph ph--square\\'>کالا</div>';" />
        </div>
        <div class="account-wish-item__info">
          <span class="account-wish-item__name">${item.name}</span>
        </div>
        <span class="account-wish-item__price">
          ${formatPrice(item.price)}
        </span>
      </a>
    `;
  }).join('');
}

/* ============================================
   RENDER — ADDRESSES PREVIEW
   ============================================ */

function renderAddressesPreview() {
  const wrap = document.getElementById('addresses-preview');
  const empty = document.getElementById('addresses-empty');
  if (!wrap || !empty) return;

  const addresses = getAddresses().slice(0, 2);

  if (!addresses.length) {
    wrap.innerHTML = '';
    wrap.hidden = true;
    empty.hidden = false;
    return;
  }

  wrap.hidden = false;
  empty.hidden = true;

  wrap.innerHTML = addresses.map((addr, i) => {
    const parts = [addr.province, addr.city, addr.address].filter(Boolean);
    return `
      <div class="account-address-item ${addr.isDefault ? 'is-default' : ''}">
        <div class="account-address-item__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="account-address-item__info">
          <span class="account-address-item__title">
            ${addr.label || `آدرس ${fa(i + 1)}`}
            ${addr.isDefault ? '<span class="account-address-item__badge">پیش‌فرض</span>' : ''}
          </span>
          <span class="account-address-item__text">${parts.join('، ')}</span>
        </div>
      </div>
    `;
  }).join('');
}

/* ============================================
   LOGOUT
   ============================================ */

function showLogoutModal() {
  const modal = document.getElementById('logout-modal');
  if (modal) {
    modal.classList.add('is-open');
  }
}

function hideLogoutModal() {
  const modal = document.getElementById('logout-modal');
  if (modal) {
    modal.classList.remove('is-open');
  }
}

function performLogout() {
  clearSession();

  toast({
    type: 'success',
    title: 'خروج موفق',
    message: 'به امید دیدار!',
    duration: 2500,
  });

  setTimeout(() => {
    window.location.href = '../index.html';
  }, 1200);
}

function bindLogout() {
  const btnHero = document.getElementById('logout-btn');
  const btnSidebar = document.getElementById('logout-btn-sidebar');

  [btnHero, btnSidebar].forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showLogoutModal();
      });
    }
  });

  // Create modal if not exists
  if (!document.getElementById('logout-modal')) {
    const modal = document.createElement('div');
    modal.id = 'logout-modal';
    modal.className = 'logout-modal';
    modal.innerHTML = `
      <div class="logout-modal__inner">
        <div class="logout-modal__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <h3 class="logout-modal__title">خروج از حساب کاربری</h3>
        <p class="logout-modal__text">آیا از خروج از حساب کاربری خود مطمئن هستید؟</p>
        <div class="logout-modal__actions">
          <button class="btn btn--outline" id="logout-cancel">انصراف</button>
          <button class="btn logout-modal__confirm" id="logout-confirm">خروج</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Bind modal buttons
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideLogoutModal();
    });

    document.getElementById('logout-cancel')?.addEventListener('click', hideLogoutModal);
    document.getElementById('logout-confirm')?.addEventListener('click', performLogout);
  }

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideLogoutModal();
  });
}

/* ============================================
   INIT
   ============================================ */

function init() {
  const user = checkAuth();
  if (!user) return;

  renderHero(user);
  renderStats();
  renderRecentOrders();
  renderWishlistPreview();
  renderAddressesPreview();
  bindLogout();

  // Update stats on cart changes
  onChange(KEYS.wishlist, () => {
    renderStats();
    renderWishlistPreview();
  });

  onChange(KEYS.compare, renderStats);

  console.log(
    `%c✓ Dashboard loaded — Welcome ${user.firstName}!`,
    'color:#18B981;font-weight:bold;'
  );
}

init();