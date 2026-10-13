/* ============================================
   RECOMMENDATIONS — C.3
   "Because you viewed X..."
   Client-side algorithm based on user history
   ============================================ */

import { allProducts, products } from '../data/products.js';
import { getRecentlyViewed } from './recently-viewed.js';
import { cart, wishlist } from '../store/state.js';
import { getProductViewCount } from '../services/views.js';

/* ============================================
   CONSTANTS
   ============================================ */

const DEFAULT_LIMIT = 4;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 min

const WEIGHTS = {
  cart: 4,
  wishlist: 3,
  recent: 1,
  seed: 5, // وقتی روی صفحه محصول هستیم
};

/* ============================================
   CACHE
   ============================================ */

let cache = {
  key: null,
  result: null,
  timestamp: 0,
};

function cacheKey(seedId, limit, excludeIds) {
  const exc = [...excludeIds].sort().join(',');
  return `${seedId || 'none'}|${limit}|${exc}`;
}

function isCacheValid(key) {
  if (!cache.result) return false;
  if (cache.key !== key) return false;
  return Date.now() - cache.timestamp < CACHE_TTL_MS;
}

export function invalidateRecommendations() {
  cache = { key: null, result: null, timestamp: 0 };
}

/* ============================================
   HELPERS
   ============================================ */

function getProductMinPrice(p) {
  if (!p?.variants?.length) return 0;
  return Math.min(...p.variants.map((v) => v.price));
}

function getProductIdFromCartItem(item) {
  return item.id.split('-').slice(0, -1).join('-');
}

/* ============================================
   INTERESTS
   ============================================ */

/**
 * جمع‌آوری علایق کاربر با وزن
 * @returns {Array<{ product: Object, weight: number, source: string }>}
 */
function buildInterests() {
  const interests = [];
  const seenIds = new Set();

  // 1. Cart (بالاترین وزن)
  cart.get().forEach((item) => {
    const productId = getProductIdFromCartItem(item);
    const product = allProducts.find((p) => p.id === productId);
    if (product && !seenIds.has(product.id)) {
      interests.push({ product, weight: WEIGHTS.cart, source: 'cart' });
      seenIds.add(product.id);
    }
  });

  // 2. Wishlist
  wishlist.get().forEach((item) => {
    const product = allProducts.find((p) => p.id === item.id);
    if (product && !seenIds.has(product.id)) {
      interests.push({ product, weight: WEIGHTS.wishlist, source: 'wishlist' });
      seenIds.add(product.id);
    }
  });

  // 3. Recently viewed
  getRecentlyViewed({ limit: 8 }).forEach((product) => {
    if (!seenIds.has(product.id)) {
      interests.push({ product, weight: WEIGHTS.recent, source: 'recent' });
      seenIds.add(product.id);
    }
  });

  return interests;
}

/* ============================================
   SCORING
   ============================================ */

/**
 * امتیاز شباهت بین دو محصول
 * @returns {number} امتیاز بین 0 و ~13
 */
function scoreSimilarity(target, candidate) {
  if (!target || !candidate || target.id === candidate.id) return 0;

  let score = 0;

  // برند یکسان
  if (target.brand && target.brand === candidate.brand) {
    score += 3;
  }

  // دسته یکسان
  if (target.category && target.category === candidate.category) {
    score += 2;
  }

  // نوع یکسان (phone / tablet)
  if (target.type && target.type === candidate.type) {
    score += 2;
  }

  // شباهت قیمت (نسبت لگاریتمی)
  const targetPrice = getProductMinPrice(target);
  const candidatePrice = getProductMinPrice(candidate);

  if (targetPrice > 0 && candidatePrice > 0) {
    const ratio = Math.max(targetPrice, candidatePrice) / Math.min(targetPrice, candidatePrice);
    // ratio = 1 → +3 | ratio = 1.5 → +1.5 | ratio = 2 → 0
    const priceScore = Math.max(0, 3 - (ratio - 1) * 3);
    score += priceScore;
  }

  // شباهت سال معرفی
  if (target.year && candidate.year) {
    const yearDiff = Math.abs(target.year - candidate.year);
    const yearScore = Math.max(0, 2 - yearDiff * 0.7);
    score += yearScore;
  }

  // Boost بر اساس محبوبیت (view count)
  const views = getProductViewCount(candidate.id);
  if (views > 0) {
    score += Math.min(views / 50, 1);
  }

  return score;
}

/* ============================================
   COLD START
   ============================================ */

/**
 * کاربر جدید — پیشنهاد بر اساس امتیاز و محبوبیت
 */
function getColdStartRecommendations({ limit, excludeSet }) {
  const sorted = products
    .filter((p) => !excludeSet.has(p.id))
    .sort((a, b) => {
      // اول rating
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (Math.abs(ratingDiff) > 0.15) return ratingDiff;

      // بعد تعداد نظرات
      const reviewDiff = (b.reviews || 0) - (a.reviews || 0);
      if (Math.abs(reviewDiff) > 10) return reviewDiff;

      // بعد تعداد بازدید
      const viewsA = getProductViewCount(a.id);
      const viewsB = getProductViewCount(b.id);
      return viewsB - viewsA;
    })
    .slice(0, limit);

  return {
    items: sorted,
    seedProduct: null,
    reason: 'popular',
    source: 'cold-start',
  };
}

/* ============================================
   MAIN API
   ============================================ */

/**
 * دریافت پیشنهادات
 * @param {Object} opts
 * @param {number} [opts.limit=4]
 * @param {string} [opts.seedProductId] — محصول مرجع (معمولاً صفحه فعلی)
 * @param {string[]} [opts.excludeIds=[]] — محصولاتی که نباید نمایش داده بشن
 * @param {boolean} [opts.useCache=true]
 * @returns {{ items: Array<Object>, seedProduct: Object|null, reason: string, source: string }}
 */
export function getRecommendations({
  limit = DEFAULT_LIMIT,
  seedProductId = null,
  excludeIds = [],
  useCache = true,
} = {}) {
  const excludeSet = new Set(excludeIds);

  // حذف محصولات داخل سبد و علاقه‌مندی (چون کاربر قبلاً دیده)
  cart.get().forEach((i) => excludeSet.add(getProductIdFromCartItem(i)));
  wishlist.get().forEach((i) => excludeSet.add(i.id));

  if (seedProductId) excludeSet.add(seedProductId);

  // کش
  const key = cacheKey(seedProductId, limit, excludeSet);
  if (useCache && isCacheValid(key)) {
    return cache.result;
  }

  // جمع‌آوری علاقه‌ها
  const interests = buildInterests();

  // اگه seed داده شده، پررنگ‌تر اضافه کن
  let seedProduct = null;
  if (seedProductId) {
    const found = allProducts.find((p) => p.id === seedProductId);
    if (found) {
      seedProduct = found;
      interests.unshift({
        product: found,
        weight: WEIGHTS.seed,
        source: 'seed',
      });
    }
  }

  let result;

  // Cold start
  if (!interests.length) {
    result = getColdStartRecommendations({ limit, excludeSet });
  } else {
    // محاسبه امتیاز برای همه کاندیدها
    const totalWeight = interests.reduce((s, x) => s + x.weight, 0);
    const scored = [];

    products.forEach((candidate) => {
      if (excludeSet.has(candidate.id)) return;

      let rawScore = 0;
      interests.forEach(({ product, weight }) => {
        rawScore += scoreSimilarity(product, candidate) * weight;
      });

      // Normalize
      const normalizedScore = totalWeight > 0 ? rawScore / totalWeight : 0;

      if (normalizedScore > 0) {
        scored.push({ product: candidate, score: normalizedScore });
      }
    });

    // Sort
    scored.sort((a, b) => b.score - a.score);

    result = {
      items: scored.slice(0, limit).map((x) => x.product),
      seedProduct,
      reason: seedProduct ? 'because-viewed' : 'history',
      source: 'personalized',
    };
  }

  // ذخیره در کش
  cache = {
    key,
    result,
    timestamp: Date.now(),
  };

  return result;
}

/* ============================================
   RENDER HELPERS
   ============================================ */

/**
 * متن مناسب برای عنوان بخش
 */
export function getRecommendationsCopy(result) {
  if (!result) {
    return {
      title: 'پیشنهاد ویژه',
      subtitle: 'محصولات منتخب برای شما',
    };
  }

  if (result.reason === 'cold-start' || result.reason === 'popular') {
    return {
      title: 'محبوب‌ترین‌های این ماه',
      subtitle: 'انتخاب کاربران بر اساس امتیاز و نظرات',
    };
  }

  if (result.reason === 'because-viewed' && result.seedProduct) {
    return {
      title: 'چون این رو دیدی...',
      subtitle: `محصولات مشابه ${result.seedProduct.name}`,
      highlight: result.seedProduct.name,
    };
  }

  // history
  return {
    title: 'پیشنهاد ویژه برای تو',
    subtitle: 'بر اساس بازدیدها و علاقه‌مندی‌هایت',
  };
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ Recommendations ready (C.3)', 'color:#18B981;font-weight:bold;');