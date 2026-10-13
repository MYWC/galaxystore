/* ============================================
   STOCK ALERTS SERVICE — C.4
   "Notify me when back in stock"
   ============================================ */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { withRetry } from '../utils/errors.js';

const LOCAL_KEY = 'ms_stock_alerts';

/* ============================================
   LOCAL STORAGE
   ============================================ */

function getLocalAlerts() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalAlerts(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 100)));
  } catch (e) {
    console.error('Save stock alerts error:', e);
  }
}

/* ============================================
   VALIDATORS
   ============================================ */

export function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str || '').trim());
}

export function isValidPhone(str) {
  const clean = String(str || '').replace(/\D/g, '');
  return /^09\d{9}$/.test(clean);
}

/* ============================================
   CHECK EXISTING
   ============================================ */

/**
 * آیا کاربر قبلاً برای این محصول alert ثبت کرده؟
 * @param {string} productId
 * @returns {Promise<boolean>}
 */
export async function hasExistingAlert(productId) {
  if (!productId) return false;

  const user = await getCurrentUser();

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('stock_alerts')
        .select('id')
        .eq('product_id', productId)
        .eq('notified', false)
        .limit(1);

      if (user?.id) {
        query = query.eq('user_id', user.id);
      } else if (user?.email) {
        query = query.eq('email', user.email);
      } else {
        // مهمان — از local چک می‌کنیم
        return getLocalAlerts().some(
          (a) => a.productId === productId && !a.notified
        );
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data) return true;
    } catch (err) {
      console.warn('[StockAlerts] hasExisting check failed:', err);
    }
  }

  // Local fallback
  return getLocalAlerts().some(
    (a) => a.productId === productId && !a.notified
  );
}

/* ============================================
   CREATE ALERT
   ============================================ */

/**
 * ثبت alert برای محصول ناموجود
 * @param {Object} data
 * @param {string} data.productId
 * @param {string} [data.email]
 * @param {string} [data.phone]
 * @param {string} [data.variantKey] — مثلاً storage
 * @returns {Promise<{ success: boolean, error?: { message: string }, alreadyExists?: boolean }>}
 */
export async function createStockAlert({ productId, email, phone, variantKey }) {
  if (!productId) {
    return { success: false, error: { message: 'شناسه محصول نامعتبر است' } };
  }

  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').replace(/\D/g, '');

  const hasEmail = isValidEmail(cleanEmail);
  const hasPhone = isValidPhone(cleanPhone);

  if (!hasEmail && !hasPhone) {
    return {
      success: false,
      error: { message: 'حداقل یک راه ارتباطی (ایمیل یا موبایل) وارد کنید' },
    };
  }

  // چک تکراری
  const exists = await hasExistingAlert(productId);
  if (exists) {
    return { success: false, alreadyExists: true, error: { message: 'قبلاً برای این محصول ثبت کرده‌اید' } };
  }

  const user = await getCurrentUser();

  /* ---------- Local save ---------- */
  const localRecord = {
    id: 'alert-' + Date.now(),
    productId,
    userId: user?.id || null,
    email: hasEmail ? cleanEmail : null,
    phone: hasPhone ? cleanPhone : null,
    variantKey: variantKey || null,
    notified: false,
    createdAt: new Date().toISOString(),
  };

  const list = getLocalAlerts();
  list.unshift(localRecord);
  saveLocalAlerts(list);

  /* ---------- Supabase ---------- */
  if (isSupabaseConfigured()) {
    try {
      const payload = {
        product_id: productId,
        user_id: user?.id || null,
        email: hasEmail ? cleanEmail : null,
        phone: hasPhone ? cleanPhone : null,
        variant_key: variantKey || null,
      };

      const { data, error } = await withRetry(
        () => supabase.from('stock_alerts').insert(payload).select().single(),
        {
          maxAttempts: 2,
          showToast: false,
          context: 'createStockAlert',
        }
      );

      if (error) {
        // اگه unique constraint بود → already exists
        if (error.code === '23505') {
          return {
            success: false,
            alreadyExists: true,
            error: { message: 'قبلاً برای این محصول ثبت کرده‌اید' },
          };
        }

        console.warn('[StockAlerts] Supabase insert failed, saved locally');
        return { success: true, saved: 'local', record: localRecord };
      }

      console.log(
        `%c✓ Stock alert saved for ${productId}`,
        'color:#18B981;font-weight:bold;'
      );

      return {
        success: true,
        saved: 'supabase',
        record: {
          id: data.id,
          productId: data.product_id,
          email: data.email,
          phone: data.phone,
          variantKey: data.variant_key,
          createdAt: data.created_at,
        },
      };
    } catch (err) {
      console.warn('[StockAlerts] exception:', err);
      return { success: true, saved: 'local', record: localRecord };
    }
  }

  return { success: true, saved: 'local', record: localRecord };
}

/* ============================================
   LIST (my alerts)
   ============================================ */

export async function getMyStockAlerts() {
  const user = await getCurrentUser();

  if (isSupabaseConfigured() && user?.id) {
    try {
      const { data, error } = await withRetry(
        () => supabase
          .from('stock_alerts')
          .select('*')
          .eq('user_id', user.id)
          .eq('notified', false)
          .order('created_at', { ascending: false }),
        {
          maxAttempts: 2,
          showToast: false,
          context: 'getMyStockAlerts',
        }
      );

      if (!error && data) {
        return data.map((row) => ({
          id: row.id,
          productId: row.product_id,
          variantKey: row.variant_key,
          email: row.email,
          phone: row.phone,
          notified: row.notified,
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.warn('[StockAlerts] list exception:', err);
    }
  }

  return getLocalAlerts().filter((a) => !a.notified);
}

/* ============================================
   REMOVE
   ============================================ */

export async function removeStockAlert(productId) {
  if (!productId) return { success: false };

  // حذف از local
  const list = getLocalAlerts().filter((a) => a.productId !== productId);
  saveLocalAlerts(list);

  // حذف از Supabase (فقط اگه کاربر لاگین باشه)
  const user = await getCurrentUser();
  if (isSupabaseConfigured() && user?.id) {
    try {
      await withRetry(
        () => supabase
          .from('stock_alerts')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id)
          .eq('notified', false),
        {
          maxAttempts: 2,
          showToast: false,
          context: 'removeStockAlert',
        }
      );
    } catch (err) {
      console.warn('[StockAlerts] remove exception:', err);
    }
  }

  return { success: true };
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ Stock Alerts service ready (C.4)', 'color:#18B981;font-weight:bold;');