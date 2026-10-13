/* ============================================
   ORDERS SERVICE
   Supabase Orders + Local Fallback + Retry (A.8)
   ============================================ */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { withRetry } from '../utils/errors.js';

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

export async function createOrder(orderData) {
  const user = await getCurrentUser();
  const orderNumber = orderData.orderNumber || generateOrderNumber();

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

  // ذخیره در local (cache)
  try {
    const localList = getLocalOrders();
    localList.unshift(localOrder);
    saveLocalOrders(localList);
    localStorage.setItem(LOCAL_LAST_KEY, orderNumber);
  } catch (e) {
    console.error('Save local order error:', e);
  }

  // ارسال به Supabase با retry
  if (isSupabaseConfigured() && user) {
    const { data, error } = await withRetry(
      () => supabase.from('orders').insert(supabasePayload).select().single(),
      {
        maxAttempts: 3,
        title: 'خطا در ثبت سفارش',
        context: 'createOrder',
      }
    );

    if (error) {
      console.warn('Order save failed after retries — using local fallback');
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

export async function getUserOrders() {
  const user = await getCurrentUser();

  if (isSupabaseConfigured() && user) {
    const { data, error } = await withRetry(
      () => supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      {
        maxAttempts: 3,
        title: 'خطا در دریافت سفارش‌ها',
        context: 'getUserOrders',
      }
    );

    if (error) {
      console.warn('Fetch orders failed — using local fallback');
      return getLocalOrders();
    }

    return (data || []).map(mapSupabaseOrder);
  }

  return getLocalOrders();
}

/* ============================================
   GET ORDER BY NUMBER
   ============================================ */

export async function getOrderByNumber(orderNumber) {
  const cleaned = String(orderNumber || '').trim().toUpperCase();
  if (!cleaned) return null;

  const user = await getCurrentUser();

  if (isSupabaseConfigured() && user) {
    const { data, error } = await withRetry(
      () => supabase
        .from('orders')
        .select('*')
        .eq('order_number', cleaned)
        .maybeSingle(),
      {
        maxAttempts: 3,
        title: 'خطا در یافتن سفارش',
        context: 'getOrderByNumber',
      }
    );

    if (!error && data) {
      return mapSupabaseOrder(data);
    }
  }

  const local = getLocalOrders();
  return local.find(
    (o) => String(o.orderNumber || '').toUpperCase() === cleaned
  ) || null;
}

/* ============================================
   GET ORDER BY PHONE
   ============================================ */

export async function getOrderByPhone(phone) {
  const cleaned = String(phone || '').replace(/\D/g, '');
  if (!cleaned) return null;

  const user = await getCurrentUser();

  if (isSupabaseConfigured() && user) {
    const { data, error } = await withRetry(
      () => supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      {
        maxAttempts: 3,
        title: 'خطا در جستجو',
        context: 'getOrderByPhone',
      }
    );

    if (!error && data) {
      const found = data.find((o) => {
        const orderPhone = String(o.customer?.phone || '').replace(/\D/g, '');
        return orderPhone === cleaned;
      });
      if (found) return mapSupabaseOrder(found);
    }
  }

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