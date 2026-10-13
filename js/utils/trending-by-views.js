/* ============================================
   TRENDING BY VIEWS — C.2
   Map top-viewed product IDs to full products
   ============================================ */

import { allProducts } from '../data/products.js';
import { getTopViewedProducts } from '../services/views.js';

const MIN_VIEWS = 3; // حداقل بازدید برای اینکه «پربازدید» معنی داشته باشه
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 دقیقه

/* ============================================
   CACHE
   ============================================ */

let cache = {
  data: null,
  timestamp: 0,
};

function isCacheValid() {
  if (!cache.data) return false;
  return Date.now() - cache.timestamp < CACHE_TTL_MS;
}

export function invalidateTrendingCache() {
  cache = { data: null, timestamp: 0 };
}

/* ============================================
   FETCH
   ============================================ */

/**
 * دریافت محصولات پربازدید
 * @param {Object} opts
 * @param {number} [opts.limit=8]
 * @param {number} [opts.minViews=3]
 * @param {string} [opts.type] — 'phone' | 'tablet' | null
 * @param {boolean} [opts.useCache=true]
 * @returns {Promise<Array<{product: Object, views: number}>>}
 */
export async function getTrendingByViews({
  limit = 8,
  minViews = MIN_VIEWS,
  type = null,
  useCache = true,
} = {}) {
  // کش
  if (useCache && isCacheValid()) {
    return filterAndLimit(cache.data, { limit, minViews, type });
  }

  try {
    // از سرویس views می‌گیریم (خودش fallback داره)
    const top = await getTopViewedProducts({ limit: limit * 4 });

    if (!top || !top.length) {
      return [];
    }

    // Map به محصولات کامل
    const mapped = top
      .filter((item) => item.view_count >= minViews)
      .map((item) => {
        const product = allProducts.find((p) => p.id === item.product_id);
        return product ? { product, views: item.view_count } : null;
      })
      .filter(Boolean);

    // ذخیره در کش
    cache = {
      data: mapped,
      timestamp: Date.now(),
    };

    return filterAndLimit(mapped, { limit, minViews, type });
  } catch (err) {
    console.error('[TrendingByViews] error:', err);
    return [];
  }
}

/* ============================================
   FILTER + LIMIT
   ============================================ */

function filterAndLimit(list, { limit = 8, minViews = MIN_VIEWS, type = null } = {}) {
  if (!Array.isArray(list)) return [];

  let result = list.filter((x) => x.views >= minViews);

  if (type === 'phone' || type === 'tablet') {
    result = result.filter((x) => x.product.type === type);
  }

  return result.slice(0, limit);
}

/* ============================================
   HELPERS
   ============================================ */

/**
 * آیا اصلاً داده‌ی کافی برای «پربازدید» داریم؟
 */
export async function hasEnoughViewData({ minCount = 3 } = {}) {
  try {
    const top = await getTopViewedProducts({ limit: 20 });
    const valid = top.filter((x) => x.view_count >= MIN_VIEWS);
    return valid.length >= minCount;
  } catch {
    return false;
  }
}

/**
 * تعداد کل بازدیدهای یه لیست
 */
export function sumViews(list) {
  if (!Array.isArray(list)) return 0;
  return list.reduce((sum, x) => sum + (x.views || 0), 0);
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ Trending by views ready (C.2)', 'color:#18B981;font-weight:bold;');