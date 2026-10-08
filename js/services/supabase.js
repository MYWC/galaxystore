/* ============================================
   SUPABASE CLIENT
   ============================================ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/* ============================================
   CONFIG
   ============================================ */

const SUPABASE_URL = 'https://rogjalyqfpwgdtahfqdn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_U4PidZWEhUqRVsn6x86CrA_LWm9l2sY';

/* ============================================
   CHECK
   ============================================ */

/**
 * آیا Supabase درست تنظیم شده؟
 * اگر URL یا KEY هنوز placeholder باشند، false برمی‌گرداند.
 */
export function isSupabaseConfigured() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  if (!SUPABASE_URL.startsWith('https://')) return false;
  if (SUPABASE_URL.includes('YOUR_')) return false;
  if (SUPABASE_ANON_KEY.includes('YOUR_')) return false;
  return true;
}

/* ============================================
   CLIENT
   ============================================ */

export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/* ============================================
   LOG
   ============================================ */

if (isSupabaseConfigured()) {
  console.log('%c✓ Supabase client initialized', 'color:#18B981;font-weight:bold;');
} else {
  console.log('%c⚠️  Supabase not configured — running in fallback mode', 'color:#F59E0B;font-weight:bold;');
}