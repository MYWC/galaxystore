/* ============================================
   STOCK ALERTS SERVICE — C.4
   ============================================ */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { withRetry } from '../utils/errors.js';

/* ============================================
   CONSTANTS
   ============================================ */

const LOCAL_KEY = 'ms_stock_alerts'; // [{ productId, variantKey, email, phone, createdAt }]
const MAX_LOCAL = 50;

/* ============================================
   HELPERS
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
  } catch (e) {
    console.error('Save stock alerts error:', e);
  }
}

function buildVariantKey(variant) {
  if (!variant) return 'default';
  return `${variant.storage || ''}-${variant.ram || ''}`.replace(/^-|-$/g, '') || 'default';
}

function isEmailValid(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function isPhoneValid(str) {
  return /^09\d{9}$/.test((str || '').replace(/\D/g, ''));
}

/* ============================================
   HAS ALERT (sync — از localStorage)
   ============================================ */

/**
 * آیا کاربر برای این variant alert ثبت کرده؟
 * (فقط از localStorage چک می‌کنه — برای رندر سریع)
 */
export function hasStockAlert(productId, variantKey) {
  if (!productId) return false;
  const list = getLocalList();
  return list.some(
    (a) => a.productId === productId && a.variantKey === variantKey
  );
}

/**
 * گرفتن alert ثبت‌شده (برای نمایش اطلاعات)
 */
export function getStockAlert(productId, variantKey) {
  if (!productId) return null;
  const list = getLocalList();
  return list.find(
    (a) => a.productId === productId && a.variantKey === variantKey
  ) || null;
}

/* ============================================
   CREATE ALERT
   ============================================ */

/**
 * ثبت درخواست اطلاع از موجودی
 * @param {Object} opts
 * @param {string} opts.productId
 * @param {Object} opts.variant
 * @param {string} [opts.email]
 * @param {string} [opts.phone]
 * @returns {Promise<{ success: boolean, error?: string, alert?: Object }>}
 */
export async function createStockAlert({ productId, variant, email, phone }) {
  if (!productId) {
    return { success: false, error: 'شناسه محصول نامعتبر است' };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').trim().replace(/\D/g, '');

  // حداقل یکی
  if (!cleanEmail && !cleanPhone) {
    return { success: false, error: 'لطفاً ایمیل یا شماره موبایل را وارد کنید' };
  }

  if (cleanEmail && !isEmailValid(cleanEmail)) {
    return { success: false, error: 'ایمیل معتبر نیست' };
  }

  if (cleanPhone && !isPhoneValid(cleanPhone)) {
    return { success: false, error: 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود' };
  }

  const variantKey = buildVariantKey(variant);
  const user = await getCurrentUser();
  const now = new Date().toISOString();

  /* ---------- Supabase ---------- */
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await withRetry(
        () => supabase
          .from('stock_alerts')
          .insert({
            product_id: productId,
            variant_key: variantKey,
            email: cleanEmail || null,
            phone: cleanPhone || null,
            user_id: user?.id || null,
          })
          .select()
          .single(),
        {
          maxAttempts: 2,
          showToast: false,
          context: 'createStockAlert',
        }
      );

      if (error) {
        // Duplicate check
        if (error.code === '23505') {
          return { success: false, error: 'قبلاً برای این محصول ثبت کرده‌اید' };
        }
        console.warn('[StockAlert] Supabase insert failed, falling back:', error.message);
      } else if (data) {
        // ذخیره در localStorage هم
        const localAlert = {
          productId,
          variantKey,
          email: cleanEmail || null,
          phone: cleanPhone || null,
          createdAt: now,
          id: data.id,
        };
        const list = getLocalList();
        list.unshift(localAlert);
        saveLocalList(list);

        return { success: true, alert: localAlert };
      }
    } catch (err) {
      console.warn('[StockAlert] exception:', err);
    }
  }

  /* ---------- Local Fallback ---------- */
  const list = getLocalList();

  const exists = list.some(
    (a) => a.productId === productId && a.variantKey === variantKey
  );

  if (exists) {
    return { success: false, error: 'قبلاً برای این محصول ثبت کرده‌اید' };
  }

  const alert = {
    productId,
    variantKey,
    email: cleanEmail || null,
    phone: cleanPhone || null,
    createdAt: now,
    local: true,
  };

  list.unshift(alert);
  saveLocalList(list);

  return { success: true, alert };
}

/* ============================================
   CANCEL ALERT
   ============================================ */

/**
 * لغو alert
 */
export async function cancelStockAlert(productId, variant) {
  if (!productId) return { success: false, error: 'شناسه نامعتبر' };

  const variantKey = buildVariantKey(variant);
  const user = await getCurrentUser();

  // از localStorage حذف کن
  const list = getLocalList();
  const filtered = list.filter(
    (a) => !(a.productId === productId && a.variantKey === variantKey)
  );
  saveLocalList(filtered);

  // از Supabase هم حذف کن (اگه user لاگین بود)
  if (isSupabaseConfigured() && user) {
    try {
      await withRetry(
        () => supabase
          .from('stock_alerts')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .eq('variant_key', variantKey),
        {
          maxAttempts: 2,
          showToast: false,
          context: 'cancelStockAlert',
        }
      );
    } catch (err) {
      console.warn('[StockAlert] cancel exception:', err);
    }
  }

  return { success: true };
}

/* ============================================
   LIST / COUNT
   ============================================ */

export function getLocalAlerts() {
  return getLocalList();
}

export function countLocalAlerts() {
  return getLocalList().length;
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ Stock Alerts ready (C.4)', 'color:#18B981;font-weight:bold;');