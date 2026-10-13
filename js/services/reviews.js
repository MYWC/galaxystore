/* ============================================
   REVIEWS SERVICE
   Supabase Reviews + Local Fallback + Retry (A.8)
   ============================================ */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { withRetry } from '../utils/errors.js';

/* ============================================
   CONSTANTS
   ============================================ */

const LOCAL_REVIEWS_KEY = 'ms_reviews';

/* ============================================
   LOCAL STORAGE
   ============================================ */

function getLocalReviews() {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReviews(list) {
  try {
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(list.slice(0, 500)));
  } catch (e) {
    console.error('Save reviews error:', e);
  }
}

/* ============================================
   HELPERS
   ============================================ */

function getInitials(firstName, lastName) {
  const f = (firstName || '').trim().charAt(0);
  const l = (lastName || '').trim().charAt(0);
  return ((f + l).toUpperCase() || '؟').replace(/\s/g, '');
}

function getAvatarColor(seed) {
  const colors = ['#2386D7', '#16B5A5', '#F59E0B', '#7C5CFF', '#EF5350', '#005B59'];
  let hash = 0;
  const str = String(seed || '');
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatFaDate(date) {
  try {
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/* ============================================
   MAPPER
   ============================================ */

function mapSupabaseReview(row) {
  if (!row) return null;

  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    userName: row.user_name,
    initials: row.initials || '؟',
    avatarColor: row.avatar_color || '#2386D7',
    rating: row.rating || 5,
    comment: row.comment || '',
    dateFa: row.date_fa || formatFaDate(row.created_at),
    verified: row.verified !== false,
    createdAt: row.created_at,
  };
}

/* ============================================
   GET REVIEWS FOR PRODUCT
   ============================================ */

export async function getProductReviews(productId, limit = 20) {
  if (!productId) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await withRetry(
      () => supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit),
      {
        maxAttempts: 3,
        title: 'خطا در دریافت نظرات',
        showToast: false,
        context: 'getProductReviews',
      }
    );

    if (!error && data) {
      const mapped = data.map(mapSupabaseReview).filter(Boolean);
      if (mapped.length > 0) return mapped;
    }
  }

  return getLocalReviews()
    .filter((r) => r.productId === productId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

/* ============================================
   GET ALL REVIEWS
   ============================================ */

export async function getAllReviews(limit = 100) {
  if (isSupabaseConfigured()) {
    const { data, error } = await withRetry(
      () => supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit),
      {
        maxAttempts: 3,
        title: 'خطا در دریافت نظرات',
        showToast: false,
        context: 'getAllReviews',
      }
    );

    if (!error && data) {
      const mapped = data.map(mapSupabaseReview).filter(Boolean);
      if (mapped.length > 0) return mapped;
    }
  }

  return getLocalReviews().slice(0, limit);
}

/* ============================================
   ADD REVIEW
   ============================================ */

export async function addReview({ productId, rating, comment }) {
  const user = await getCurrentUser();

  if (!user) {
    return { error: { message: 'برای ثبت نظر ابتدا وارد حساب کاربری شوید' } };
  }

  if (!productId) {
    return { error: { message: 'شناسه محصول نامعتبر است' } };
  }

  const ratingNum = Number(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return { error: { message: 'امتیاز باید بین ۱ تا ۵ باشد' } };
  }

  const cleanComment = String(comment || '').trim();
  if (cleanComment.length < 10) {
    return { error: { message: 'متن نظر باید حداقل ۱۰ کاراکتر باشد' } };
  }

  if (cleanComment.length > 500) {
    return { error: { message: 'متن نظر بیش از ۵۰۰ کاراکتر است' } };
  }

  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'کاربر';
  const initials = getInitials(user.firstName, user.lastName);
  const avatarColor = getAvatarColor(user.id || user.email);
  const dateFa = formatFaDate(new Date());
  const now = new Date().toISOString();

  const supabasePayload = {
    product_id: productId,
    user_id: user.id,
    user_name: userName,
    initials,
    avatar_color: avatarColor,
    rating: ratingNum,
    comment: cleanComment,
    date_fa: dateFa,
    verified: true,
  };

  const localReview = {
    id: 'rev-' + Date.now(),
    productId,
    userId: user.id,
    userName,
    initials,
    avatarColor,
    rating: ratingNum,
    comment: cleanComment,
    dateFa,
    verified: true,
    createdAt: now,
  };

  // ذخیره در localStorage
  try {
    const list = getLocalReviews();
    list.unshift(localReview);
    saveLocalReviews(list);
  } catch (e) {
    console.error('Save local review error:', e);
  }

  // ارسال به Supabase با retry
  if (isSupabaseConfigured()) {
    const { data, error } = await withRetry(
      () => supabase.from('reviews').insert(supabasePayload).select().single(),
      {
        maxAttempts: 3,
        title: 'خطا در ثبت نظر',
        context: 'addReview',
      }
    );

    if (error) {
      console.warn('Review save failed after retries — using local');
      return { review: localReview, saved: 'local' };
    }

    console.log(
      `%c✓ Review saved to Supabase for ${productId}`,
      'color:#18B981;font-weight:bold;'
    );

    return {
      review: mapSupabaseReview(data),
      saved: 'supabase',
    };
  }

  console.log(
    `%c✓ Review saved locally (offline) for ${productId}`,
    'color:#F59E0B;font-weight:bold;'
  );

  return { review: localReview, saved: 'local' };
}

/* ============================================
   GET USER REVIEW FOR PRODUCT
   ============================================ */

export async function getUserReviewForProduct(productId) {
  const user = await getCurrentUser();
  if (!user || !productId) return null;

  if (isSupabaseConfigured()) {
    const { data, error } = await withRetry(
      () => supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle(),
      {
        maxAttempts: 2,
        title: 'خطا',
        showToast: false,
        context: 'getUserReviewForProduct',
      }
    );

    if (!error && data) {
      return mapSupabaseReview(data);
    }
  }

  const local = getLocalReviews().find(
    (r) => r.productId === productId && r.userId === user.id
  );
  return local || null;
}

/* ============================================
   REVIEW STATS
   ============================================ */

export async function getReviewStats(productId) {
  const reviews = await getProductReviews(productId, 500);

  if (!reviews.length) {
    return { count: 0, average: 0, distribution: [0, 0, 0, 0, 0] };
  }

  const count = reviews.length;
  const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
  const average = Math.round((sum / count) * 10) / 10;

  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const idx = Math.max(0, Math.min(4, (r.rating || 5) - 1));
    distribution[idx]++;
  });

  return { count, average, distribution };
}