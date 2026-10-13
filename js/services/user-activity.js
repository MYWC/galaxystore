/* ============================================
   USER ACTIVITY SERVICE — C.6
   Track meaningful user actions
   ============================================ */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { withRetry } from '../utils/errors.js';

/* ============================================
   CONSTANTS
   ============================================ */

const LOCAL_KEY = 'ms_user_activity';
const SESSION_KEY = 'ms_activity_session';
const MAX_LOCAL = 100;
const MAX_SESSION = 500;
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 دقیقه

/* ============================================
   ACTION TYPES
   ============================================ */

export const ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  VIEW: 'view',
  ADD_TO_CART: 'add_to_cart',
  WISHLIST: 'wishlist',
  ORDER: 'order',
  REVIEW: 'review',
  ADDRESS: 'address',
};

/* ============================================
   SESSION DEDUPE
   ============================================ */

function getSessionMap() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch {
    return {};
  }
}

function saveSessionMap(map) {
  try {
    // فقط آخرین ۵۰۰ تا
    const keys = Object.keys(map);
    if (keys.length > MAX_SESSION) {
      const trimmed = {};
      keys.slice(-MAX_SESSION).forEach((k) => {
        trimmed[k] = map[k];
      });
      map = trimmed;
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(map));
  } catch {}
}

function dedupKey(action, targetId) {
  return `${action}:${targetId || 'none'}`;
}

function shouldSkip(action, targetId) {
  const key = dedupKey(action, targetId);
  const map = getSessionMap();
  const lastAt = map[key];
  if (!lastAt) return false;
  return (Date.now() - lastAt) < DEDUP_WINDOW_MS;
}

function markSession(action, targetId) {
  const map = getSessionMap();
  map[dedupKey(action, targetId)] = Date.now();
  saveSessionMap(map);
}

/* ============================================
   LOCAL STORAGE
   ============================================ */

function getLocalList() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalList(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, MAX_LOCAL)));
  } catch {}
}

function appendLocal(entry) {
  const list = getLocalList();
  list.unshift(entry);
  saveLocalList(list);
}

/* ============================================
   TRACK
   ============================================ */

/**
 * ثبت یک فعالیت
 * @param {Object} opts
 * @param {string} opts.action — یکی از ACTIONS
 * @param {string} [opts.targetId]
 * @param {string} [opts.targetName]
 * @param {Object} [opts.meta]
 * @returns {Promise<boolean>}
 */
export async function trackActivity({ action, targetId = null, targetName = null, meta = {} }) {
  if (!action) return false;

  // Anti-spam
  if (shouldSkip(action, targetId)) return false;
  markSession(action, targetId);

  const entry = {
    action,
    targetId,
    targetName,
    meta,
    createdAt: new Date().toISOString(),
  };

  // Supabase
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();

    if (user) {
      try {
        const { error } = await withRetry(
          () => supabase
            .from('user_activity')
            .insert({
              user_id: user.id,
              action,
              target_id: targetId,
              target_name: targetName,
              meta,
            }),
          {
            maxAttempts: 2,
            showToast: false,
            context: 'trackActivity',
          }
        );

        if (!error) {
          // local cache هم برای fallback نگه دار
          appendLocal({ ...entry, userId: user.id });
          return true;
        }
      } catch (err) {
        console.warn('[Activity] track exception:', err);
      }
    }
  }

  // Local fallback (کاربر مهمان یا خطا)
  appendLocal(entry);
  return true;
}

/* ============================================
   GET
   ============================================ */

/**
 * گرفتن فعالیت‌های کاربر
 * @param {Object} opts
 * @param {number} [opts.limit=20]
 * @param {string} [opts.action] — فیلتر روی نوع
 * @returns {Promise<Array>}
 */
export async function getUserActivity({ limit = 20, action = null } = {}) {
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();

    if (user) {
      try {
        let query = supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (action) query = query.eq('action', action);

        const { data, error } = await withRetry(
          () => query,
          {
            maxAttempts: 2,
            showToast: false,
            context: 'getUserActivity',
          }
        );

        if (!error && Array.isArray(data) && data.length) {
          return data.map((row) => ({
            id: row.id,
            action: row.action,
            targetId: row.target_id,
            targetName: row.target_name,
            meta: row.meta || {},
            createdAt: row.created_at,
          }));
        }
      } catch (err) {
        console.warn('[Activity] get exception:', err);
      }
    }
  }

  // Local fallback
  let list = getLocalList();
  if (action) list = list.filter((x) => x.action === action);
  return list.slice(0, limit);
}

/* ============================================
   COUNT
   ============================================ */

export async function getActivityCount() {
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (user) {
      try {
        const { count, error } = await supabase
          .from('user_activity')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (!error && typeof count === 'number') {
          return count;
        }
      } catch {}
    }
  }

  return getLocalList().length;
}

/* ============================================
   CLEAR
   ============================================ */

export function clearLocalActivity() {
  try {
    localStorage.removeItem(LOCAL_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

/* ============================================
   PRESENTATION HELPERS
   ============================================ */

/**
 * آیکون + رنگ + متن برای هر نوع فعالیت
 */
export const ACTIVITY_PRESETS = {
  login: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`,
    color: 'blue',
    text: 'وارد حساب کاربری شدید',
    getTitle: () => 'ورود به حساب',
  },
  logout: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    color: 'gray',
    text: 'از حساب خارج شدید',
    getTitle: () => 'خروج از حساب',
  },
  view: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    color: 'blue',
    text: (name) => `از ${name || 'محصول'} دیدن کردید`,
    getTitle: () => 'مشاهده محصول',
  },
  add_to_cart: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
    color: 'green',
    text: (name) => `${name || 'محصولی'} را به سبد اضافه کردید`,
    getTitle: () => 'افزودن به سبد',
  },
  wishlist: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    color: 'red',
    text: (name) => `${name || 'محصولی'} را به علاقه‌مندی‌ها اضافه کردید`,
    getTitle: () => 'افزودن به علاقه‌مندی',
  },
  order: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    color: 'success',
    text: (name) => `سفارش ${name || ''} را ثبت کردید`,
    getTitle: () => 'ثبت سفارش',
  },
  review: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    color: 'orange',
    text: (name) => `برای ${name || 'محصول'} نظر ثبت کردید`,
    getTitle: () => 'ثبت نظر',
  },
  address: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    color: 'purple',
    text: (name) => `آدرس${name ? ` «${name}»` : ' جدیدی'} اضافه کردید`,
    getTitle: () => 'افزودن آدرس',
  },
};

/**
 * زمان نسبی به فارسی
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'همین الان';
    if (diffMin < 60) return `${diffMin.toLocaleString('fa-IR')} دقیقه پیش`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr.toLocaleString('fa-IR')} ساعت پیش`;

    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay.toLocaleString('fa-IR')} روز پیش`;

    if (diffDay < 30) {
      const weeks = Math.floor(diffDay / 7);
      return `${weeks.toLocaleString('fa-IR')} هفته پیش`;
    }

    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ User Activity service ready (C.6)', 'color:#18B981;font-weight:bold;');