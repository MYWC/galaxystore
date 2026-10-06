/* ============================================
   NOTIFICATIONS PAGE
   ============================================ */

import { initLayout } from '../components/layout.js';
import { toast } from '../components/toast.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   CONSTANTS
   ============================================ */

const SESSION_KEY = 'ms_session';
const NOTIFS_KEY = 'ms_notifications';

const ICONS = {
  order: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
  offer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  system: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
};

/* ============================================
   STATE
   ============================================ */

const state = {
  filter: 'all',
};

/* ============================================
   SESSION
   ============================================ */

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function checkAuth() {
  const session = getSession();
  if (!session?.user) {
    const redirect = encodeURIComponent('account/notifications.html');
    window.location.href = `../auth/login.html?redirect=${redirect}`;
    return null;
  }
  return session.user;
}

/* ============================================
   STORAGE
   ============================================ */

function getAllNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFS_KEY);
    let list = raw ? JSON.parse(raw) : [];
    return list;
  } catch {
    return [];
  }
}

function saveNotifications(list) {
  try {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
  } catch {}
}

/* ============================================
   SEED (Generate demo notifications)
   ============================================ */

function seedIfEmpty(user) {
  const list = getAllNotifications();
  if (list.length) return;

  const now = Date.now();

  const demo = [
    {
      id: 'n1',
      type: 'order',
      icon: 'order',
      title: 'سفارش شما ارسال شد 🚚',
      text: 'سفارش <strong>MS-' + (12345000 + Math.floor(Math.random() * 999)) + '</strong> تحویل پست شد. کد رهگیری برای شما پیامک می‌شود.',
      time: new Date(now - 5 * 60 * 1000).toISOString(),
      read: false,
      link: 'account/orders.html',
    },
    {
      id: 'n2',
      type: 'offer',
      icon: 'offer',
      title: 'تخفیف ۲۵٪ روی لوازم جانبی',
      text: 'تا پایان هفته روی تمام لوازم جانبی <strong>۲۵٪ تخفیف</strong> ویژه در نظر گرفته شده. فرصت را از دست ندهید!',
      time: new Date(now - 45 * 60 * 1000).toISOString(),
      read: false,
      link: 'category.html?filter=discount',
    },
    {
      id: 'n3',
      type: 'system',
      icon: 'system',
      title: 'ورود موفق به حساب کاربری',
      text: 'ورود جدیدی به حساب شما انجام شد. اگر شما نبودید، رمز عبور خود را تغییر دهید.',
      time: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: 'account/profile.html',
    },
    {
      id: 'n4',
      type: 'order',
      icon: 'success',
      title: 'سفارش شما تأیید شد ✅',
      text: 'سفارش شما بررسی و تأیید شد. به‌زودی بسته‌بندی و ارسال می‌شود.',
      time: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: 'account/orders.html',
    },
    {
      id: 'n5',
      type: 'offer',
      icon: 'warning',
      title: 'پیشنهاد ویژه Flash Sale',
      text: 'فروش فلش با تخفیف‌های تا <strong>۳۰٪</strong> آغاز شد. فقط تا پایان امروز!',
      time: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: 'index.html#flash-sale',
    },
    {
      id: 'n6',
      type: 'system',
      icon: 'system',
      title: 'به موبایل استور خوش آمدید 🎉',
      text: 'حساب کاربری شما با موفقیت ساخته شد. از خرید با ما لذت ببرید.',
      time: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: 'index.html',
    },
  ];

  saveNotifications(demo);
}

/* ============================================
   HELPERS
   ============================================ */

function formatTime(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'همین الان';
    if (diffMin < 60) return `${diffMin.toLocaleString('fa-IR')} دقیقه پیش`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr.toLocaleString('fa-IR')} ساعت پیش`;

    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay.toLocaleString('fa-IR')} روز پیش`;

    return date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

function fa(n) {
  return Number(n).toLocaleString('fa-IR');
}

/* ============================================
   FILTER
   ============================================ */

function getFiltered() {
  const list = getAllNotifications();

  // Sort: unread first, then by time
  let filtered = [...list].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.time) - new Date(a.time);
  });

  // Apply filter
  if (state.filter === 'unread') {
    filtered = filtered.filter((n) => !n.read);
  } else if (state.filter !== 'all') {
    filtered = filtered.filter((n) => n.type === state.filter);
  }

  return filtered;
}

/* ============================================
   COUNTS
   ============================================ */

function updateCounts() {
  const list = getAllNotifications();

  const counts = {
    all: list.length,
    unread: list.filter((n) => !n.read).length,
    order: list.filter((n) => n.type === 'order').length,
    offer: list.filter((n) => n.type === 'offer').length,
    system: list.filter((n) => n.type === 'system').length,
  };

  document.querySelectorAll('[data-count]').forEach((el) => {
    const key = el.dataset.count;
    if (counts[key] !== undefined) {
      el.textContent = fa(counts[key]);
    }
  });

  // Sidebar badge
  const badge = document.getElementById('notif-badge');
  if (badge) {
    if (counts.unread > 0) {
      badge.textContent = fa(counts.unread);
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  // Subtitle
  const subtitle = document.getElementById('notif-subtitle');
  if (subtitle) {
    subtitle.textContent = counts.unread > 0
      ? `${fa(counts.unread)} اعلان خوانده‌نشده دارید`
      : 'تمام اعلان‌های شما';
  }

  // Mark all button
  const markAllBtn = document.getElementById('mark-all-read');
  if (markAllBtn) {
    markAllBtn.hidden = counts.unread === 0;
  }
}

/* ============================================
   RENDER
   ============================================ */

function renderItem(n) {
  const iconKey = n.icon || n.type || 'system';

  const typeLabels = {
    order: 'سفارش',
    offer: 'تخفیف',
    system: 'سیستم',
  };

  return `
    <div class="notif-item ${n.read ? '' : 'is-unread'}" data-id="${n.id}">

      <div class="notif-icon notif-icon--${iconKey}">
        ${ICONS[iconKey] || ICONS.system}
      </div>

      <div class="notif-content">
        <h4 class="notif-title">${n.title}</h4>
        <p class="notif-text">${n.text}</p>

        <div class="notif-meta">
          <span class="notif-time">
            ${ICONS.clock}
            ${formatTime(n.time)}
          </span>

          <span class="notif-tag notif-tag--${n.type}">
            ${typeLabels[n.type] || 'سیستم'}
          </span>
        </div>
      </div>

      <div class="notif-actions">
        ${!n.read ? `
          <button class="notif-mark" data-mark="${n.id}" aria-label="علامت‌گذاری به‌عنوان خوانده‌شده" title="علامت‌گذاری">
            ${ICONS.check}
          </button>
        ` : ''}
        <svg class="notif-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </div>
    </div>
  `;
}

function render() {
  const list = document.getElementById('notif-list');
  const empty = document.getElementById('notif-empty');
  const noResult = document.getElementById('notif-no-result');

  if (!list) return;

  updateCounts();

  const all = getAllNotifications();
  const filtered = getFiltered();

  // No notifications at all
  if (!all.length) {
    list.innerHTML = '';
    list.hidden = true;
    if (empty) empty.hidden = false;
    if (noResult) noResult.hidden = true;
    return;
  }

  // No results after filter
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

  list.innerHTML = filtered.map(renderItem).join('');
}

/* ============================================
   ACTIONS
   ============================================ */

function markAsRead(id) {
  const list = getAllNotifications();
  const idx = list.findIndex((n) => n.id === id);
  if (idx === -1) return;

  list[idx].read = true;
  saveNotifications(list);
  render();
}

function markAllAsRead() {
  const list = getAllNotifications();
  if (!list.length) return;

  list.forEach((n) => { n.read = true; });
  saveNotifications(list);
  render();

  toast({
    type: 'success',
    title: 'همه اعلان‌ها خوانده شد',
    duration: 2200,
  });
}

function openNotification(id) {
  const list = getAllNotifications();
  const notif = list.find((n) => n.id === id);
  if (!notif) return;

  // Mark as read
  if (!notif.read) markAsRead(id);

  // Navigate
  if (notif.link) {
    setTimeout(() => {
      window.location.href = `../${notif.link}`;
    }, 200);
  }
}

/* ============================================
   BIND
   ============================================ */

function bindTabs() {
  const wrap = document.getElementById('notif-tabs');
  if (!wrap) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-notif-filter]');
    if (!btn) return;

    wrap.querySelectorAll('.notif-tab').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    state.filter = btn.dataset.notifFilter;
    render();
  });
}

function bindList() {
  const list = document.getElementById('notif-list');
  if (!list) return;

  list.addEventListener('click', (e) => {
    // Mark button
    const markBtn = e.target.closest('[data-mark]');
    if (markBtn) {
      e.stopPropagation();
      markAsRead(markBtn.dataset.mark);
      toast({
        type: 'info',
        title: 'خوانده شد',
        duration: 1500,
      });
      return;
    }

    // Click on item
    const item = e.target.closest('.notif-item');
    if (item) {
      openNotification(item.dataset.id);
    }
  });
}

function bindMarkAll() {
  const btn = document.getElementById('mark-all-read');
  if (!btn) return;

  btn.addEventListener('click', markAllAsRead);
}

function bindReset() {
  const btn = document.getElementById('notif-reset');
  if (!btn) return;

  btn.addEventListener('click', () => {
    state.filter = 'all';
    document.querySelectorAll('.notif-tab').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.notifFilter === 'all');
    });
    render();
  });
}

function bindLogout() {
  const btn = document.getElementById('logout-btn-sidebar');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!confirm('آیا از خروج مطمئن هستید؟')) return;
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    toast({
      type: 'success',
      title: 'خروج موفق',
      duration: 2000,
    });
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);
  });
}

/* ============================================
   INIT
   ============================================ */

function init() {
  const user = checkAuth();
  if (!user) return;

  seedIfEmpty(user);

  bindTabs();
  bindList();
  bindMarkAll();
  bindReset();
  bindLogout();

  render();

  console.log(
    `%c✓ Notifications page — ${getAllNotifications().length} items`,
    'color:#18B981;font-weight:bold;'
  );
}

init();