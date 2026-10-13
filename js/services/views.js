/* ============================================
   PRODUCT VIEWS SERVICE — C.1
   Track & read product view counts
   ============================================ */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { withRetry } from '../utils/errors.js';

/* ============================================
   CONSTANTS
   ============================================ */

const LOCAL_KEY = 'ms_product_views';       // { [productId]: count }
const SESSION_KEY = 'ms_viewed_session';    // [productId, ...]
const MAX_SESSION_ITEMS = 200;

/* ============================================
   SESSION DEDUPE (anti-spam)
   ============================================ */

function getSessionViewed() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function hasViewedInSession(productId) {
  return getSessionViewed().includes(productId);
}

function markViewedInSession(productId) {
  try {
    const list = getSessionViewed();
    if (list.includes(productId)) return;

    list.push(productId);
    const trimmed = list.slice(-MAX_SESSION_ITEMS);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(trimmed));
  } catch {}
}

/* ============================================
   LOCAL STORAGE
   ============================================ */

function getLocalMap() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch {
    return {};
  }
}

function saveLocalMap(map) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  } catch {}
}

function getLocalCount(productId) {
  const map = getLocalMap();
  return Number(map[productId]) || 0;
}

function setLocalCount(productId, count) {
  const map = getLocalMap();
  map[productId] = Number(count) || 0;
  saveLocalMap(map);
}

function incrementLocal(productId) {
  const next = getLocalCount(productId) + 1;
  setLocalCount(productId, next);
  return next;
}

/* ============================================
   TRACK VIEW
   ============================================ */

/**
 * ثبت بازدید یک محصول
 * @param {string} productId
 * @returns {Promise<number|null>} — تعداد بازدید جدید
 */
export async function trackProductView(productId) {
  if (!productId) return null;

  // ✅ Anti-spam: در این session قبلاً دیده شده
  if (hasViewedInSession(productId)) {
    return getProductViewCount(productId);
  }

  markViewedInSession(productId);

  /* ---------- Supabase ---------- */
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await withRetry(
        () => supabase.rpc('increment_product_view', { p_product_id: productId }),
        {
          maxAttempts: 2,
          showToast: false,
          context: 'trackProductView',
        }
      );

      if (!error && typeof data === 'number') {
        // Cache در localStorage برای نمایش سریع بعدی
        setLocalCount(productId, data);
        return data;
      }

      if (error) {
        console.warn('[Views] Supabase increment failed, using local:', error.message);
      }
    } catch (err) {
      console.warn('[Views] trackProductView exception:', err);
    }
  }

  /* ---------- Local Fallback ---------- */
  return incrementLocal(productId);
}

/* ============================================
   GET COUNT
   ============================================ */

/**
 * خواندن تعداد بازدید یک محصول
 * - در حالت Supabase، از cache می‌خونه (سریع) و در پس‌زمینه آپدیت می‌کنه
 * @param {string} productId
 * @returns {number}
 */
export function getProductViewCount(productId) {
  if (!productId) return 0;
  return getLocalCount(productId);
}

/**
 * خواندن تازه از Supabase (async)
 * @param {string} productId
 * @returns {Promise<number>}
 */
export async function fetchProductViewCount(productId) {
  if (!productId) return 0;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await withRetry(
        () => supabase
          .from('product_views')
          .select('view_count')
          .eq('product_id', productId)
          .maybeSingle(),
        {
          maxAttempts: 2,
          showToast: false,
          context: 'fetchProductViewCount',
        }
      );

      if (!error && data) {
        const count = Number(data.view_count) || 0;
        setLocalCount(productId, count);
        return count;
      }
    } catch (err) {
      console.warn('[Views] fetch exception:', err);
    }
  }

  return getLocalCount(productId);
}

/* ============================================
   TOP / TRENDING (برای C.2 بعداً)
   ============================================ */

/**
 * برترین محصولات بر اساس بازدید
 * @param {Object} opts
 * @param {number} [opts.limit=10]
 * @returns {Promise<Array<{ product_id, view_count }>>}
 */
export async function getTopViewedProducts({ limit = 10 } = {}) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await withRetry(
        () => supabase
          .from('product_views')
          .select('product_id, view_count')
          .order('view_count', { ascending: false })
          .limit(limit),
        {
          maxAttempts: 2,
          showToast: false,
          context: 'getTopViewedProducts',
        }
      );

      if (!error && Array.isArray(data)) {
        return data.map((row) => ({
          product_id: row.product_id,
          view_count: Number(row.view_count) || 0,
        }));
      }
    } catch (err) {
      console.warn('[Views] top exception:', err);
    }
  }

  // Local fallback
  const map = getLocalMap();
  return Object.entries(map)
    .map(([product_id, view_count]) => ({
      product_id,
      view_count: Number(view_count) || 0,
    }))
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, limit);
}

/* ============================================
   CLEAR (debug)
   ============================================ */

export function clearViewCache() {
  try {
    localStorage.removeItem(LOCAL_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ Views service ready (C.1)', 'color:#18B981;font-weight:bold;');