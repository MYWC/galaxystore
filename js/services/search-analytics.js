/* ============================================
   SEARCH ANALYTICS SERVICE — C.5
   Track & read popular search terms
   ============================================ */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { withRetry } from '../utils/errors.js';

/* ============================================
   CONSTANTS
   ============================================ */

const LOCAL_KEY = 'ms_search_terms';         // { [term]: count }
const SESSION_KEY = 'ms_searched_session';   // [term, ...]
const MAX_SESSION_ITEMS = 100;
const MIN_TERM_LENGTH = 2;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 دقیقه

/* ============================================
   NORMALIZE
   ============================================ */

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ============================================
   SESSION DEDUPE
   ============================================ */

function getSessionList() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function markInSession(term) {
  try {
    const list = getSessionList();
    if (list.includes(term)) return;
    list.push(term);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(list.slice(-MAX_SESSION_ITEMS)));
  } catch {}
}

function hasInSession(term) {
  return getSessionList().includes(term);
}

/* ============================================
   LOCAL MAP
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

function bumpLocal(term) {
  const map = getLocalMap();
  map[term] = (Number(map[term]) || 0) + 1;
  saveLocalMap(map);
  return map[term];
}

/* ============================================
   CACHE
   ============================================ */

let topCache = {
  data: null,
  timestamp: 0,
};

function isCacheValid() {
  return topCache.data && Date.now() - topCache.timestamp < CACHE_TTL_MS;
}

export function invalidateSearchAnalytics() {
  topCache = { data: null, timestamp: 0 };
}

/* ============================================
   TRACK
   ============================================ */

/**
 * ثبت یک عبارت جستجو
 * @param {string} rawTerm
 * @returns {Promise<number>} — تعداد جدید
 */
export async function trackSearchTerm(rawTerm) {
  const term = normalize(rawTerm);

  if (!term || term.length < MIN_TERM_LENGTH) return 0;

  // ضد-اسپم در همین session
  if (hasInSession(term)) {
    return 0;
  }
  markInSession(term);

  // Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await withRetry(
        () => supabase.rpc('increment_search_term', { p_term: term }),
        {
          maxAttempts: 2,
          showToast: false,
          context: 'trackSearchTerm',
        }
      );

      if (!error && typeof data === 'number') {
        // کش رو invalidate کن
        invalidateSearchAnalytics();
        return data;
      }

      if (error) {
        console.warn('[SearchAnalytics] Supabase failed, using local:', error.message);
      }
    } catch (err) {
      console.warn('[SearchAnalytics] exception:', err);
    }
  }

  // Local fallback
  const localCount = bumpLocal(term);
  invalidateSearchAnalytics();
  return localCount;
}

/* ============================================
   GET TOP
   ============================================ */

/**
 * گرفتن پرجستجوترین کلمات
 * @param {Object} opts
 * @param {number} [opts.limit=10]
 * @param {boolean} [opts.useCache=true]
 * @returns {Promise<Array<{ term: string, count: number }>>}
 */
export async function getTopSearchTerms({ limit = 10, useCache = true } = {}) {
  if (useCache && isCacheValid()) {
    return topCache.data.slice(0, limit);
  }

  // Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await withRetry(
        () => supabase
          .from('search_terms')
          .select('term, search_count')
          .order('search_count', { ascending: false })
          .limit(limit * 2), // با buffer
        {
          maxAttempts: 2,
          showToast: false,
          context: 'getTopSearchTerms',
        }
      );

      if (!error && Array.isArray(data) && data.length) {
        const mapped = data.map((row) => ({
          term: row.term,
          count: Number(row.search_count) || 0,
        }));

        topCache = { data: mapped, timestamp: Date.now() };
        return mapped.slice(0, limit);
      }
    } catch (err) {
      console.warn('[SearchAnalytics] top exception:', err);
    }
  }

  // Local fallback
  const map = getLocalMap();
  const sorted = Object.entries(map)
    .map(([term, count]) => ({ term, count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  topCache = { data: sorted, timestamp: Date.now() };
  return sorted;
}

/* ============================================
   FALLBACK POPULAR (اگه داده کافی نبود)
   ============================================ */

export const DEFAULT_POPULAR_TERMS = [
  'iPhone 16 Pro',
  'Galaxy S25 Ultra',
  'Xiaomi 14T',
  'Pixel 9',
  'گوشی اقتصادی',
  'آیپد',
  'تبلت سامسونگ',
  'OnePlus 13',
  'Redmi Note',
  'هواوی',
];

/**
 * گرفتن popular — با fallback خودکار
 */
export async function getPopularTerms({ limit = 10 } = {}) {
  const top = await getTopSearchTerms({ limit });

  // اگه کمتر از ۵ نتیجه داشتیم، با default پر کن
  if (top.length < 5) {
    const existing = new Set(top.map((x) => normalize(x.term)));
    const fillers = DEFAULT_POPULAR_TERMS
      .filter((t) => !existing.has(normalize(t)))
      .slice(0, limit - top.length)
      .map((term) => ({ term, count: 0 }));

    return [...top, ...fillers];
  }

  return top;
}

/* ============================================
   CLEAR (debug)
   ============================================ */

export function clearSearchAnalyticsCache() {
  try {
    localStorage.removeItem(LOCAL_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    invalidateSearchAnalytics();
  } catch {}
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ Search Analytics ready (C.5)', 'color:#18B981;font-weight:bold;');