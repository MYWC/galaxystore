/* ============================================
   AUTH SERVICE
   Supabase Auth + Local Fallback
   ============================================ */

import { supabase, isSupabaseConfigured } from './supabase.js';

/* ============================================
   KEYS
   ============================================ */

const LOCAL_SESSION_KEY = 'ms_session';
const LOCAL_USERS_KEY = 'ms_users';

/* ============================================
   LOCAL STORAGE — SESSION
   ============================================ */

function getLocalSession() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalSession(user) {
  try {
    localStorage.setItem(
      LOCAL_SESSION_KEY,
      JSON.stringify({
        user,
        loggedInAt: new Date().toISOString(),
      })
    );
  } catch (e) {
    console.error('Save session error:', e);
  }
}

function clearLocalSession() {
  try {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {}
}

/* ============================================
   LOCAL STORAGE — USERS
   ============================================ */

function getLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Save users error:', e);
  }
}

/* ============================================
   MAPPER
   ============================================ */

function mapSupabaseUser(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};

  return {
    id: user.id,
    email: user.email || '',
    firstName: meta.first_name || '',
    lastName: meta.last_name || '',
    phone: meta.phone || '',
    createdAt: user.created_at || new Date().toISOString(),
  };
}

/* ============================================
   SIGN UP
   ============================================ */

export async function signUp({
  email,
  password,
  firstName,
  lastName,
  phone,
  subscribeNews = false,
}) {
  email = String(email || '').trim().toLowerCase();
  firstName = String(firstName || '').trim();
  lastName = String(lastName || '').trim();
  phone = String(phone || '').trim();

  /* ---------- Supabase ---------- */
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
            subscribe_news: subscribeNews,
          },
        },
      });

      if (error) {
        return { error: { message: translateError(error.message) } };
      }

      return {
        user: mapSupabaseUser(data?.user),
        session: data?.session || null,
        needsEmailConfirmation: Boolean(data?.user) && !data?.session,
      };
    } catch (err) {
      console.error('Supabase signUp error:', err);
      return { error: { message: 'ارتباط با سرویس احراز هویت برقرار نشد' } };
    }
  }

  /* ---------- Local Fallback ---------- */
  const users = getLocalUsers();

  if (users.find((u) => u.email?.toLowerCase() === email)) {
    return { error: { message: 'این ایمیل قبلاً ثبت‌نام کرده است' } };
  }

  const phoneExists = users.find(
    (u) => u.phone && u.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')
  );
  if (phoneExists) {
    return { error: { message: 'این شماره موبایل قبلاً ثبت‌نام کرده است' } };
  }

  const user = {
    id: 'user-' + Date.now(),
    firstName,
    lastName,
    phone,
    email,
    subscribeNews,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveLocalUsers(users);
  saveLocalSession(user);

  return {
    user,
    session: { local: true },
    needsEmailConfirmation: false,
  };
}

/* ============================================
   SIGN IN
   ============================================ */

export async function signIn({ email, password, phone = '' }) {
  email = String(email || '').trim().toLowerCase();
  phone = String(phone || '').trim();

  /* ---------- Supabase ---------- */
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: { message: translateError(error.message) } };
      }

      return {
        user: mapSupabaseUser(data?.user),
        session: data?.session || null,
      };
    } catch (err) {
      console.error('Supabase signIn error:', err);
      return { error: { message: 'ارتباط با سرویس احراز هویت برقرار نشد' } };
    }
  }

  /* ---------- Local Fallback ---------- */
  const users = getLocalUsers();
  let user = null;

  if (email) {
    user = users.find((u) => u.email?.toLowerCase() === email);
  }

  if (!user && phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    user = users.find(
      (u) => u.phone?.replace(/\D/g, '') === cleanPhone
    );
  }

  if (!user) {
    return { error: { message: 'کاربری با این مشخصات یافت نشد' } };
  }

  saveLocalSession(user);
  return { user, session: { local: true } };
}

/* ============================================
   PHONE LOGIN (OTP)
   ============================================ */

export async function signInWithPhone(phone) {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'ورود با کد پیامکی نیاز به Supabase دارد' } };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) return { error: { message: translateError(error.message) } };
    return { success: true };
  } catch (err) {
    console.error('Phone login error:', err);
    return { error: { message: 'ارسال کد تأیید انجام نشد' } };
  }
}

export async function verifyPhoneOtp(phone, token) {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'ورود با کد پیامکی نیاز به Supabase دارد' } };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) return { error: { message: translateError(error.message) } };

    return {
      user: mapSupabaseUser(data?.user),
      session: data?.session || null,
    };
  } catch (err) {
    console.error('Verify OTP error:', err);
    return { error: { message: 'کد تأیید صحیح نیست یا منقضی شده است' } };
  }
}

/* ============================================
   SIGN OUT
   ============================================ */

export async function signOut() {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Supabase signOut error:', error);
    } catch (err) {
      console.error('Supabase signOut exception:', err);
    }
  }

  clearLocalSession();
  return { success: true };
}

/* ============================================
   GET CURRENT USER
   ============================================ */

export async function getCurrentUser() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        return mapSupabaseUser(data.user);
      }
    } catch (err) {
      console.error('Get current user error:', err);
    }
  }

  const session = getLocalSession();
  return session?.user || null;
}

/* ============================================
   IS LOGGED IN (sync local check)
   ============================================ */

export function isLoggedInLocal() {
  return Boolean(getLocalSession()?.user);
}

/* ============================================
   ON AUTH CHANGE
   ============================================ */

export function onAuthChange(callback) {
  if (isSupabaseConfigured()) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ? mapSupabaseUser(session.user) : null;
      callback(user);
    });
    return () => data?.subscription?.unsubscribe?.();
  }

  // Local: fire once
  callback(getLocalSession()?.user || null);
  return () => {};
}

/* ============================================
   PASSWORD RESET
   ============================================ */

export async function resetPassword(email) {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'بازیابی رمز عبور نیاز به Supabase دارد' } };
  }

  try {
    const redirectUrl = new URL('auth/reset-password.html', document.baseURI).href;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) return { error: { message: translateError(error.message) } };
    return { success: true };
  } catch (err) {
    console.error('Reset password error:', err);
    return { error: { message: 'ارسال لینک بازیابی انجام نشد' } };
  }
}

/* ============================================
   TRANSLATE ERRORS
   ============================================ */

function translateError(message) {
  const map = {
    'Invalid login credentials': 'ایمیل یا رمز عبور اشتباه است',
    'Email not confirmed': 'ایمیل شما هنوز تأیید نشده است',
    'User already registered': 'این ایمیل قبلاً ثبت‌نام کرده است',
    'Password should be at least 6 characters': 'رمز عبور باید حداقل ۶ کاراکتر باشد',
    'Unable to validate email address': 'ایمیل معتبر نیست',
    'Invalid email': 'ایمیل معتبر نیست',
    'signup is disabled': 'ثبت‌نام در حال حاضر غیرفعال است',
    'Email rate limit exceeded': 'تعداد درخواست‌ها زیاد است، بعداً امتحان کنید',
    'For security purposes, you can only request this once every 60 seconds': 'برای امنیت، هر ۶۰ ثانیه یکبار می‌توانید درخواست دهید',
    'Phone provider is not enabled': 'سرویس پیامکی در Supabase فعال نشده است',
    'New password should be different from the old password': 'رمز جدید باید متفاوت از رمز قبلی باشد',
  };

  return map[message] || message;
}

/* ============================================
   RE-EXPORT
   ============================================ */

export { isSupabaseConfigured };