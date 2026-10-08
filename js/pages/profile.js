/* ============================================
   PROFILE PAGE — Refactored with Auth Service
   ============================================ */

import { initLayout } from '../components/layout.js';
import { toast } from '../components/toast.js';
import {
  getCurrentUser,
  signOut,
  isSupabaseConfigured,
} from '../services/auth.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   CONSTANTS
   ============================================ */

const USERS_KEY = 'ms_users';
const PREFS_KEY = 'ms_preferences';
const LAST_LOGIN_KEY = 'ms_last_login';

/* ============================================
   HELPERS
   ============================================ */

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

function getPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {
      orders: true,
      offers: true,
      news: false,
      sms: true,
      theme: 'light',
    };
  } catch {
    return { orders: true, offers: true, news: false, sms: true, theme: 'light' };
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

function getLastLogin() {
  try {
    return localStorage.getItem(LAST_LOGIN_KEY) || null;
  } catch {
    return null;
  }
}

function getInitials(fn, ln) {
  const f = (fn || '').trim().charAt(0);
  const l = (ln || '').trim().charAt(0);
  return (f + l).toUpperCase() || '؟';
}

function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function checkPasswordStrength(pw) {
  let level = 0;
  if (!pw) return { level: 0, label: '—' };
  if (pw.length >= 6) level++;
  if (pw.length >= 8) level++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) level++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) level++;
  level = Math.min(level, 4);
  const labels = ['—', 'ضعیف', 'متوسط', 'خوب', 'قوی'];
  return { level, label: labels[level] };
}

function getCurrentDevice() {
  const ua = navigator.userAgent;
  let browser = 'مرورگر';
  let os = '';

  if (/Chrome/.test(ua) && !/Edge|OPR/.test(ua)) browser = 'Chrome';
  else if (/Firefox/.test(ua)) browser = 'Firefox';
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
  else if (/Edge/.test(ua)) browser = 'Edge';

  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  return `${browser}${os ? ' روی ' + os : ''}`;
}

/* ============================================
   AUTH
   ============================================ */

async function checkAuth() {
  const user = await getCurrentUser();
  if (!user) {
    const redirect = encodeURIComponent('account/profile.html');
    window.location.href = `../auth/login.html?redirect=${redirect}`;
    return null;
  }
  return user;
}

/* ============================================
   RENDER — HERO
   ============================================ */

function renderHero(user) {
  const avatarEl = document.getElementById('avatar-initials');
  const nameEl = document.getElementById('profile-name');
  const memberEl = document.getElementById('member-since');
  const loginEl = document.getElementById('last-login');

  if (avatarEl) avatarEl.textContent = getInitials(user.firstName, user.lastName);
  if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`.trim() || 'کاربر';

  if (memberEl) {
    memberEl.textContent = formatDate(user.createdAt);
  }

  if (loginEl) {
    loginEl.textContent = formatDate(getLastLogin() || new Date().toISOString());
  }
}

/* ============================================
   RENDER — INFO FORM
   ============================================ */

function renderInfoForm(user) {
  const firstName = document.getElementById('info-firstName');
  const lastName = document.getElementById('info-lastName');
  const phone = document.getElementById('info-phone');
  const email = document.getElementById('info-email');
  const birth = document.getElementById('info-birthDate');

  if (firstName) firstName.value = user.firstName || '';
  if (lastName) lastName.value = user.lastName || '';
  if (phone) phone.value = user.phone || '';
  if (email) email.value = user.email || '';

  const emailVerified = document.getElementById('email-verified');
  if (emailVerified) {
    emailVerified.hidden = !user.email;
  }

  const users = getUsers();
  const found = users.find((u) => u.id === user.id);
  if (birth && found?.birthDate) birth.value = found.birthDate;

  const deviceEl = document.getElementById('current-device');
  if (deviceEl) deviceEl.textContent = getCurrentDevice();
}

/* ============================================
   RENDER — PREFERENCES
   ============================================ */

function renderPreferences() {
  const prefs = getPrefs();

  const map = {
    'pref-orders': 'orders',
    'pref-offers': 'offers',
    'pref-news': 'news',
    'pref-sms': 'sms',
  };

  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!prefs[key];
  });

  document.querySelectorAll('.pref-theme__btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.theme === prefs.theme);
  });
}

/* ============================================
   TABS
   ============================================ */

function bindTabs() {
  const wrap = document.querySelector('.profile-tabs');
  if (!wrap) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-profile-tab]');
    if (!btn) return;

    const tab = btn.dataset.profileTab;

    wrap.querySelectorAll('.profile-tab').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    document.querySelectorAll('.profile-panel').forEach((p) => {
      p.classList.toggle('is-active', p.dataset.panel === tab);
    });
  });
}

/* ============================================
   INFO FORM
   ============================================ */

function setError(name, msg) {
  const field = document.getElementById(`field-${name}`);
  const err = document.querySelector(`[data-error="${name}"]`);
  if (field) field.classList.add('has-error');
  if (err) err.textContent = msg;
}

function clearError(name) {
  const field = document.getElementById(`field-${name}`);
  const err = document.querySelector(`[data-error="${name}"]`);
  if (field) field.classList.remove('has-error');
  if (err) err.textContent = '';
}

function bindInfoForm(user) {
  const form = document.getElementById('info-form');
  if (!form) return;

  ['firstName', 'lastName', 'email', 'birthDate'].forEach((id) => {
    const el = document.getElementById(`info-${id}`);
    if (el) el.addEventListener('input', () => clearError(id));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('info-firstName').value.trim();
    const lastName = document.getElementById('info-lastName').value.trim();
    const email = document.getElementById('info-email').value.trim();
    const birthDate = document.getElementById('info-birthDate').value.trim();

    ['firstName', 'lastName', 'email', 'birthDate'].forEach(clearError);

    let valid = true;

    if (!firstName || firstName.length < 2) {
      setError('firstName', 'نام را وارد کنید');
      valid = false;
    }
    if (!lastName || lastName.length < 2) {
      setError('lastName', 'نام خانوادگی را وارد کنید');
      valid = false;
    }
    if (email && !isEmail(email)) {
      setError('email', 'ایمیل معتبر نیست');
      valid = false;
    }

    if (!valid) return;

    const btn = document.getElementById('save-info');
    btn.disabled = true;

    // آپدیت در localStorage
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx].firstName = firstName;
      users[idx].lastName = lastName;
      users[idx].email = email;
      users[idx].birthDate = birthDate;
      saveUsers(users);
    }

    // آپدیت کاربر جاری
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    renderHero(user);

    btn.disabled = false;

    toast({
      type: 'success',
      title: 'اطلاعات ذخیره شد',
      message: 'تغییرات شما با موفقیت ثبت شد',
      duration: 2500,
    });
  });

  const reset = document.getElementById('reset-info');
  if (reset) {
    reset.addEventListener('click', (e) => {
      e.preventDefault();
      renderInfoForm(user);
      ['firstName', 'lastName', 'email', 'birthDate'].forEach(clearError);
    });
  }

  const changePhone = document.getElementById('change-phone');
  if (changePhone) {
    changePhone.addEventListener('click', () => {
      toast({
        type: 'info',
        title: 'تغییر شماره موبایل',
        message: 'برای تغییر با پشتیبانی تماس بگیرید: ۰۲۱-۱۲۳۴۵۶۷۸',
        duration: 4000,
      });
    });
  }
}

/* ============================================
   PASSWORD FORM
   ============================================ */

function bindPasswordForm() {
  const form = document.getElementById('password-form');
  if (!form) return;

  document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const inputId = btn.dataset.togglePassword;
      const input = document.getElementById(inputId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      const eye = btn.querySelector('.icon-eye');
      const eyeOff = btn.querySelector('.icon-eye-off');
      if (eye && eyeOff) {
        eye.style.display = isPassword ? 'none' : '';
        eyeOff.style.display = isPassword ? '' : 'none';
      }
    });
  });

  const newPw = document.getElementById('pw-new');
  const strength = document.getElementById('pw-strength');
  const strengthText = document.getElementById('pw-strength-text');

  if (newPw) {
    newPw.addEventListener('input', () => {
      const { level, label } = checkPasswordStrength(newPw.value);

      if (!newPw.value) {
        if (strength) strength.hidden = true;
        return;
      }

      if (strength) {
        strength.hidden = false;
        strength.setAttribute('data-level', level);
      }
      if (strengthText) strengthText.textContent = label;

      clearError('newPassword');
    });
  }

  ['currentPassword', 'newPassword', 'confirmPassword'].forEach((id) => {
    const map = {
      currentPassword: 'pw-current',
      newPassword: 'pw-new',
      confirmPassword: 'pw-confirm',
    };
    const el = document.getElementById(map[id]);
    if (el) el.addEventListener('input', () => clearError(id));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentPw = document.getElementById('pw-current').value;
    const newPwVal = document.getElementById('pw-new').value;
    const confirmPw = document.getElementById('pw-confirm').value;

    ['currentPassword', 'newPassword', 'confirmPassword'].forEach(clearError);

    let valid = true;

    if (!currentPw) {
      setError('currentPassword', 'رمز عبور فعلی را وارد کنید');
      valid = false;
    }
    if (!newPwVal || newPwVal.length < 8) {
      setError('newPassword', 'رمز جدید باید حداقل ۸ کاراکتر باشد');
      valid = false;
    } else if (!/[A-Za-z]/.test(newPwVal) || !/\d/.test(newPwVal)) {
      setError('newPassword', 'رمز باید شامل حرف و عدد باشد');
      valid = false;
    } else if (newPwVal === currentPw) {
      setError('newPassword', 'رمز جدید نباید با رمز فعلی یکسان باشد');
      valid = false;
    }
    if (!confirmPw) {
      setError('confirmPassword', 'تکرار رمز را وارد کنید');
      valid = false;
    } else if (newPwVal !== confirmPw) {
      setError('confirmPassword', 'رمز و تکرار آن یکسان نیستند');
      valid = false;
    }

    if (!valid) return;

    const btn = document.getElementById('save-password');
    btn.disabled = true;
    btn.style.opacity = '0.7';

    setTimeout(() => {
      form.reset();
      if (strength) strength.hidden = true;
      btn.disabled = false;
      btn.style.opacity = '';

      toast({
        type: 'success',
        title: 'رمز عبور تغییر کرد',
        message: 'از این پس با رمز جدید وارد شوید',
        duration: 3000,
      });
    }, 700);
  });
}

/* ============================================
   PREFERENCES
   ============================================ */

function bindPreferences() {
  const map = {
    'pref-orders': 'orders',
    'pref-offers': 'offers',
    'pref-news': 'news',
    'pref-sms': 'sms',
  };

  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('change', () => {
      const prefs = getPrefs();
      prefs[key] = el.checked;
      savePrefs(prefs);

      toast({
        type: 'success',
        title: 'تنظیمات ذخیره شد',
        duration: 1500,
      });
    });
  });

  document.querySelectorAll('.pref-theme__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;

      document.querySelectorAll('.pref-theme__btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const prefs = getPrefs();
      prefs.theme = theme;
      savePrefs(prefs);

      toast({
        type: 'info',
        title: 'حالت نمایش',
        message: theme === 'dark' ? 'حالت تاریک به‌زودی فعال می‌شود' : 'حالت روشن',
        duration: 2200,
      });
    });
  });
}

/* ============================================
   LOGOUT ALL
   ============================================ */

function bindLogoutAll() {
  const btn = document.getElementById('logout-all');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (!confirm('آیا از خروج از همه دستگاه‌ها مطمئن هستید؟')) return;

    await signOut();

    toast({
      type: 'success',
      title: 'خروج از همه دستگاه‌ها',
      duration: 2000,
    });

    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1200);
  });
}

/* ============================================
   DELETE ACCOUNT
   ============================================ */

function bindDeleteAccount() {
  const btn = document.getElementById('delete-account');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (!confirm('آیا از حذف کامل حساب مطمئن هستید؟ این عمل قابل بازگشت نیست.')) return;
    if (!confirm('آخرین هشدار: تمام اطلاعات شما حذف خواهد شد. مطمئن هستید؟')) return;

    // خروج + پاک کردن دیتای محلی
    await signOut();

    try {
      localStorage.removeItem('ms_cart');
      localStorage.removeItem('ms_wishlist');
      localStorage.removeItem('ms_compare');
      localStorage.removeItem('ms_addresses');
      localStorage.removeItem('ms_preferences');
      localStorage.removeItem('ms_orders');
      localStorage.removeItem('ms_notifications');
      localStorage.removeItem('ms_last_login');
    } catch {}

    toast({
      type: 'success',
      title: 'حساب کاربری حذف شد',
      message: 'به امید دیدار!',
      duration: 2500,
    });

    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1500);
  });
}

/* ============================================
   SIDEBAR LOGOUT
   ============================================ */

function bindSidebarLogout() {
  const btn = document.getElementById('logout-btn-sidebar');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (!confirm('آیا از خروج مطمئن هستید؟')) return;

    await signOut();

    toast({
      type: 'success',
      title: 'خروج موفق',
      duration: 2000,
    });

    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);
  });
}

/* ============================================
   AVATAR EDIT
   ============================================ */

function bindAvatarEdit() {
  const btn = document.getElementById('avatar-edit');
  if (!btn) return;

  btn.addEventListener('click', () => {
    toast({
      type: 'info',
      title: 'تغییر تصویر پروفایل',
      message: 'این ویژگی به‌زودی فعال می‌شود',
      duration: 2500,
    });
  });
}

/* ============================================
   INIT
   ============================================ */

async function init() {
  const user = await checkAuth();
  if (!user) return;

  renderHero(user);
  renderInfoForm(user);
  renderPreferences();

  bindTabs();
  bindInfoForm(user);
  bindPasswordForm();
  bindPreferences();
  bindLogoutAll();
  bindDeleteAccount();
  bindSidebarLogout();
  bindAvatarEdit();

  if (!isSupabaseConfigured()) {
    console.log('%c⚠️  Profile — Local Fallback mode', 'color:#F59E0B;font-weight:bold;');
  }

  console.log(
    `%c✓ Profile loaded — ${user.firstName || 'User'}`,
    'color:#18B981;font-weight:bold;'
  );
}

init();