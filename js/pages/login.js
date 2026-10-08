/* ============================================
   LOGIN PAGE — Email/Password only (no OTP)
   ============================================ */

import { initLayout } from '../components/layout.js';
import { toast } from '../components/toast.js';
import { signIn, resetPassword, isSupabaseConfigured } from '../services/auth.js';

initLayout();

/* ============================================
   REDIRECT RESOLVER
   ============================================ */

function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search);
  let redirect = params.get('redirect');

  if (!redirect) redirect = 'account/index.html';
  if (redirect.startsWith('/') || redirect.startsWith('http')) return redirect;

  const base = window.MS_BASE_PATH || '../';
  return base + redirect;
}

/* ============================================
   VALIDATORS
   ============================================ */

function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

/* ============================================
   ERRORS
   ============================================ */

function setError(fieldId, message) {
  const field = document.getElementById(`field-${fieldId}`);
  const errEl = document.querySelector(`[data-error="${fieldId}"]`);
  if (field) field.classList.add('has-error');
  if (errEl) errEl.textContent = message;
}

function clearError(fieldId) {
  const field = document.getElementById(`field-${fieldId}`);
  const errEl = document.querySelector(`[data-error="${fieldId}"]`);
  if (field) field.classList.remove('has-error');
  if (errEl) errEl.textContent = '';
}

/* ============================================
   LOGIN
   ============================================ */

async function handleLogin(e) {
  e.preventDefault();

  const emailEl = document.getElementById('login-identifier');
  const passwordEl = document.getElementById('login-password');
  const submitBtn = document.getElementById('submit-password');

  const email = emailEl.value.trim().toLowerCase();
  const password = passwordEl.value;

  clearError('identifier');
  clearError('password');

  let valid = true;

  if (!email) {
    setError('identifier', 'ایمیل را وارد کنید');
    valid = false;
  } else if (!isEmail(email)) {
    setError('identifier', 'فرمت ایمیل صحیح نیست');
    valid = false;
  }

  if (!password) {
    setError('password', 'رمز عبور را وارد کنید');
    valid = false;
  } else if (password.length < 6) {
    setError('password', 'رمز عبور حداقل ۶ کاراکتر است');
    valid = false;
  }

  if (!valid) return;

  submitBtn.classList.add('is-loading');
  submitBtn.disabled = true;

  const result = await signIn({ email, password });

  submitBtn.classList.remove('is-loading');
  submitBtn.disabled = false;

  if (result.error) {
    setError('identifier', result.error.message);
    toast({
      type: 'error',
      title: 'ورود ناموفق',
      message: result.error.message,
      duration: 3500,
    });
    return;
  }

  toast({
    type: 'success',
    title: 'خوش آمدید!',
    message: `${result.user?.firstName || ''} عزیز، ورود شما موفق بود`,
    duration: 2500,
  });

  setTimeout(() => {
    window.location.href = getRedirectUrl();
  }, 800);
}

/* ============================================
   FORGOT PASSWORD
   ============================================ */

async function handleForgotPassword() {
  const emailEl = document.getElementById('login-identifier');
  const email = emailEl.value.trim().toLowerCase();

  if (!isEmail(email)) {
    setError('identifier', 'اول ایمیل خود را وارد کنید');
    emailEl.focus();
    return;
  }

  const result = await resetPassword(email);

  if (result.error) {
    toast({
      type: 'error',
      title: 'خطا',
      message: result.error.message,
      duration: 3500,
    });
    return;
  }

  toast({
    type: 'success',
    title: 'لینک بازیابی ارسال شد',
    message: 'ایمیل خود را چک کنید',
    duration: 4000,
  });
}

/* ============================================
   PASSWORD TOGGLE
   ============================================ */

function bindPasswordToggle() {
  const btn = document.getElementById('toggle-password');
  const input = document.getElementById('login-password');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    const eye = btn.querySelector('.icon-eye');
    const eyeOff = btn.querySelector('.icon-eye-off');
    if (eye && eyeOff) {
      eye.style.display = isPassword ? 'none' : '';
      eyeOff.style.display = isPassword ? '' : 'none';
    }
  });
}

/* ============================================
   INPUTS
   ============================================ */

function bindInputs() {
  const identifier = document.getElementById('login-identifier');
  const password = document.getElementById('login-password');

  if (identifier) identifier.addEventListener('input', () => clearError('identifier'));
  if (password) password.addEventListener('input', () => clearError('password'));
}

/* ============================================
   INIT
   ============================================ */

function init() {
  // اگه قبلاً وارد شده
  try {
    const session = JSON.parse(localStorage.getItem('ms_session') || 'null');
    if (session?.user) {
      toast({
        type: 'info',
        title: 'قبلاً وارد شده‌اید',
        message: 'در حال انتقال...',
        duration: 1200,
      });
      setTimeout(() => {
        window.location.href = getRedirectUrl();
      }, 600);
      return;
    }
  } catch {}

  bindPasswordToggle();
  bindInputs();

  const form = document.getElementById('password-form');
  if (form) form.addEventListener('submit', handleLogin);

  const forgotLink = document.getElementById('forgot-link');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      handleForgotPassword();
    });
  }

  if (!isSupabaseConfigured()) {
    console.log(
      '%c⚠️  Supabase not configured — Login در حالت Local Fallback',
      'color:#F59E0B;font-weight:bold;'
    );
  }

  console.log('%c✓ Login page loaded', 'color:#18B981;font-weight:bold;');
}

init();