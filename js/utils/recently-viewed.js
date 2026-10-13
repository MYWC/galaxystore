/* ============================================
   RECENTLY VIEWED PRODUCTS — B.12
   Track & display products the user has viewed
   ============================================ */

import { allProducts } from '../data/products.js';

const STORAGE_KEY = 'ms_recently_viewed';
const MAX_ITEMS = 10;
const TTL_DAYS = 30;

/* ============================================
   LOW-LEVEL
   ============================================ */

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && x.id);
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    emitChange();
  } catch (e) {
    console.error('RecentlyViewed write error:', e);
  }
}

/* ============================================
   EVENTS
   ============================================ */

const listeners = [];

function emitChange() {
  const items = getRecentlyViewed();
  listeners.forEach((cb) => {
    try { cb(items); } catch {}
  });
}

export function onRecentlyViewedChange(cb) {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

/* ============================================
   TRACK
   ============================================ */

/**
 * ثبت بازدید یک محصول
 * @param {Object|string} productOrId — محصول کامل یا فقط id
 */
export function trackView(productOrId) {
  if (!productOrId) return;

  const id = typeof productOrId === 'string'
    ? productOrId
    : productOrId.id;

  if (!id) return;

  // فقط محصولات معتبر
  const exists = allProducts.some((p) => p.id === id);
  if (!exists) return;

  let list = read();

  // حذف نسخه قبلی (اگه وجود داشت)
  list = list.filter((item) => item.id !== id);

  // اضافه به ابتدای لیست با timestamp جدید
  list.unshift({
    id,
    viewedAt: Date.now(),
  });

  // محدود به MAX_ITEMS
  list = list.slice(0, MAX_ITEMS);

  write(list);
}

/* ============================================
   GET
   ============================================ */

/**
 * دریافت لیست محصولات بازدید شده (با داده کامل)
 * @param {Object} opts
 * @param {number} [opts.limit] — حداکثر تعداد
 * @param {string} [opts.excludeId] — این محصول رو حذف کن (معمولاً صفحه فعلی)
 * @returns {Array<Object>} — محصولات کامل
 */
export function getRecentlyViewed({ limit, excludeId } = {}) {
  const list = read();
  const now = Date.now();
  const ttlMs = TTL_DAYS * 24 * 60 * 60 * 1000;

  let filtered = list.filter((item) => {
    // TTL
    if (now - (item.viewedAt || 0) > ttlMs) return false;
    // exclude
    if (excludeId && item.id === excludeId) return false;
    // product exists
    return allProducts.some((p) => p.id === item.id);
  });

  // Map to full products
  let products = filtered
    .map((item) => allProducts.find((p) => p.id === item.id))
    .filter(Boolean);

  if (limit && limit > 0) {
    products = products.slice(0, limit);
  }

  return products;
}

/**
 * تعداد محصولات اخیر
 */
export function countRecentlyViewed() {
  return getRecentlyViewed().length;
}

/**
 * آیا اصلاً چیزی هست؟
 */
export function hasRecentlyViewed(opts) {
  return getRecentlyViewed(opts).length > 0;
}

/* ============================================
   CLEAR
   ============================================ */

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    emitChange();
  } catch {}
}

/**
 * حذف یه محصول خاص
 */
export function removeFromRecentlyViewed(id) {
  if (!id) return;
  const list = read().filter((item) => item.id !== id);
  write(list);
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ Recently Viewed ready (B.12)', 'color:#18B981;font-weight:bold;');