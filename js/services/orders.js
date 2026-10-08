/* ============================================
   ORDERS SERVICE
   Supabase Orders + Local Fallback
   ============================================ */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { getCurrentUser } from './auth.js';

/* ============================================
   CONSTANTS
   ============================================ */

const LOCAL_ORDERS_KEY = 'ms_orders';
const LOCAL_LAST_KEY = 'ms_last_order';

/* ============================================
   LOCAL STORAGE
   ============================================ */

function getLocalOrders() {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders.slice(0, 100)));
  } catch (e) {
    console.error('Save orders error:', e);
  }
}

/* ============================================
   GENERATOR
   ============================================ */

export function generateOrderNumber() {
  return 'MS-' + Date.now().toString().slice(-8);
}

/* ============================================
   MAPPER
   ============================================ */

function mapSupabaseOrder(row) {
  if (!row) return null;

  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    customer: row.customer || {},
    shipping: row.shipping || {},
    items: row.items || [],
    payment: row.payment,
    note: row.note || '',
    subtotal: row.subtotal || 0,
    discount: row.discount || 0,
    shippingFee: row.shipping_fee || 0,
    total: row.total || 0,
    status: row.status || 'processing',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* ============================================
   CREATE ORDER
   ============================================ */

/**
 * ثبت سفارش جدید
 * @param {Object} orderData - اطلاعات سفارش
 * @returns {Promise<{order: Object, saved: 'supabase' | 'local'}>}
 */
export async function createOrder(orderData) {
  const user = await getCurrentUser();
  const orderNumber = orderData.orderNumber || generateOrderNumber();

  // ---------- Payload برای Supabase ----------
  const supabasePayload = {
    order_number: orderNumber,
    user_id: user?.id || null,
    customer: orderData.customer || {},
    shipping: orderData.shipping || {},
    items: orderData.items || [],
    payment: orderData.payment || 'online',
    note: orderData.note || '',
    subtotal: orderData.subtotal || 0,
    discount: orderData.discount || 0,
    shipping_fee: orderData.shippingFee || 0,
    total: orderData.total || 0,
    status: 'processing',
  };

  // ---------- Local order object ----------
  const localOrder = {
    id: orderNumber,
    orderNumber,
    userId: user?.id || null,
    customer: supabasePayload.customer,
    shipping: supabasePayload.shipping,
    items: supabasePayload.items,
    payment: supabasePayload.payment,
    note: supabasePayload.note,
    subtotal: supabasePayload.subtotal,
    discount: supabasePayload.discount,
    shippingFee: supabasePayload.shipping_fee,
    total: supabasePayload.total,
    status: 'processing',
    createdAt: new Date().toISOString(),
  };

  // ---------- ذخیره در localStorage (cache/fallback) ----------
  try {
    const localList = getLocalOrders();
    localList.unshift(localOrder);
    saveLocalOrders(localList);
    localStorage.setItem(LOCAL_LAST_KEY, orderNumber);
  } catch (e) {
    console.error('Save local order error:', e);
  }

  // ---------- اگه Supabase هست و کاربر لاگین هست ----------
  if (isSupabaseConfigured() && user) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(supabasePayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase order insert error:', error);
        return { order: localOrder, saved: 'local' };
      }

      console.log(
        `%c✓ Order ${orderNumber} saved to Supabase`,
        'color:#18B981;font-weight:bold;'
      );

      return {
        order: mapSupabaseOrder(data),
        saved: 'supabase',
      };
    } catch (err) {
      console.error('Supabase order exception:', err);
      return { order: localOrder, saved: 'local' };
    }
  }

  console.log(
    `%c✓ Order ${orderNumber} saved locally (guest)`,
    'color:#F59E0B;font-weight:bold;'
  );

  return { order: localOrder, saved: 'local' };
}

/* ============================================
   GET USER ORDERS
   ============================================ */

/**
 * دریافت همه سفارش‌های کاربر جاری
 */
export async function getUserOrders() {
  const user = await getCurrentUser();

  // اگه Supabase هست و کاربر لاگین
  if (isSupabaseConfigured() && user) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase orders fetch error:', error);
        return getLocalOrders();
      }

      return (data || []).map(mapSupabaseOrder);
    } catch (err) {
      console.error('Fetch orders exception:', err);
      return getLocalOrders();
    }
  }

  // Fallback: فقط سفارش‌های local
  return getLocalOrders();
}

/* ============================================
   GET ORDER BY NUMBER
   ============================================ */

/**
 * پیدا کردن سفارش با شماره سفارش
 */
export async function getOrderByNumber(orderNumber) {
  const cleaned = String(orderNumber || '').trim().toUpperCase();
  if (!cleaned) return null;

  const user = await getCurrentUser();

  // اول از Supabase (اگه لاگین)
  if (isSupabaseConfigured() && user) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', cleaned)
        .maybeSingle();

      if (!error && data) {
        return mapSupabaseOrder(data);
      }
    } catch (err) {
      console.error('Fetch order exception:', err);
    }
  }

  // Fallback: local
  const local = getLocalOrders();
  return local.find(
    (o) => String(o.orderNumber || '').toUpperCase() === cleaned
  ) || null;
}

/* ============================================
   GET ORDER BY PHONE
   ============================================ */

/**
 * پیدا کردن آخرین سفارش با شماره موبایل
 */
export async function getOrderByPhone(phone) {
  const cleaned = String(phone || '').replace(/\D/g, '');
  if (!cleaned) return null;

  const user = await getCurrentUser();

  // اگه Supabase هست و لاگین — سفارش‌های کاربر رو بگیر و فیلتر کن
  if (isSupabaseConfigured() && user) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const found = data.find((o) => {
          const orderPhone = String(o.customer?.phone || '').replace(/\D/g, '');
          return orderPhone === cleaned;
        });
        if (found) return mapSupabaseOrder(found);
      }
    } catch (err) {
      console.error('Fetch by phone exception:', err);
    }
  }

  // Fallback: local
  const local = getLocalOrders();
  return local.find((o) => {
    const orderPhone = String(o.customer?.phone || '').replace(/\D/g, '');
    return orderPhone === cleaned;
  }) || null;
}

/* ============================================
   GET RECENT ORDERS
   ============================================ */

export async function getRecentOrders(limit = 3) {
  const orders = await getUserOrders();
  return orders.slice(0, limit);
}

/* ============================================
   CLEAR LOCAL CACHE
   ============================================ */

export function clearLocalOrders() {
  try {
    localStorage.removeItem(LOCAL_ORDERS_KEY);
    localStorage.removeItem(LOCAL_LAST_KEY);
  } catch {}
}

/* ============================================
   COUNT
   ============================================ */

export async function getOrdersCount() {
  const orders = await getUserOrders();
  return orders.length;
}