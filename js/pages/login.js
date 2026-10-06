/* ============================================
   LOGIN PAGE
   ============================================ */

import { initLayout } from '../components/layout.js';
import { toast } from '../components/toast.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   CONSTANTS
   ============================================ */

const USERS_KEY = 'ms_users';
const SESSION_KEY = 'ms_session';

/* ============================================
   STATE
   ============================================ */

const state = {
  tab: 'password', // 'password' | 'otp'
  otpPhone: '',
  otpTimer: null,
  otpRemaining: 0,
};

/* ============================================
   STORAGE HELPERS
   ============================================ */

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSession(user) {
  try {
    const session = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
      },
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Session save error', e);
  }
}

function findUser(identifier) {
  const cleaned = (identifier || '').trim();
  const cleanedLower = cleaned.toLowerCase();
  const cleanedDigits = cleaned.replace(/\D/g, '');

  return getUsers().find((u) => {
    const emailMatch = u.email && u.email.toLowerCase() === cleanedLower;
    const phoneMatch = u.phone && u.phone.replace(/\D/g, '') === cleanedDigits;
    return emailMatch || phoneMatch;
  });
}

/* ============================================
   VALIDATORS
   ============================================ */

function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function isPhone(str) {
  return /^09\d{9}$/.test(str.replace(/\D/g, ''));
}

/* ============================================
   FORM VALIDATION
   ============================================ */

function setError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errEl = document.querySelector(`[data-error="${fieldId}"]`);
  if (field) field.classList.add('has-error');
  if (errEl) errEl.textContent = message;
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const errEl = document.querySelector(`[data-error="${fieldId}"]`);
  if (field) field.classList.remove('has-error');
  if (errEl) errEl.textContent = '';
}

/* ============================================
   RENDER — PASSWORD LOGIN
   ============================================ */

function handlePasswordLogin(e) {
  e.preventDefault();

  const identifierEl = document.getElementById('login-identifier');
  const passwordEl = document.getElementById('login-password');
  const submitBtn = document.getElementById('submit-password');

  const identifier = identifierEl.value.trim();
  const password = passwordEl.value;

  // Reset errors
  clearError('identifier');
  clearError('password');

  let valid = true;

  if (!identifier) {
    setError('identifier', 'ایمیل یا شماره موبایل را وارد کنید');
    valid = false;
  } else if (!isEmail(identifier) && !isPhone(identifier)) {
    setError('identifier', 'فرمت ایمیل یا شماره موبایل صحیح نیست');
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

  // Show loading
  submitBtn.classList.add('is-loading');
  submitBtn.disabled = true;

  // Simulate server request
  setTimeout(() => {
    const user = findUser(identifier);

    submitBtn.classList.remove('is-loading');
    submitBtn.disabled = false;

    if (!user) {
      setError('identifier', 'کاربری با این مشخصات یافت نشد');
      toast({
        type: 'error',
        title: 'ورود ناموفق',
        message: 'لطفاً ابتدا ثبت‌نام کنید',
        duration: 3000,
      });
      return;
    }

    // For demo — any password with length >= 6 works
    saveSession(user);

    toast({
      type: 'success',
      title: 'خوش آمدید!',
      message: `${user.firstName} عزیز، ورود شما موفق بود`,
      duration: 2500,
    });

    // Redirect
    setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '../account/index.html';
      window.location.href = redirect;
    }, 1000);
  }, 800);
}

/* ============================================
   RENDER — OTP
   ============================================ */

function handleOtpSend(e) {
  e.preventDefault();

  const phoneEl = document.getElementById('otp-phone');
  const submitBtn = document.getElementById('submit-otp');
  const phone = phoneEl.value.trim();

  clearError('phone');

  if (!phone) {
    setError('phone', 'شماره موبایل را وارد کنید');
    return;
  }

  if (!isPhone(phone)) {
    setError('phone', 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
    return;
  }

  submitBtn.classList.add('is-loading');
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.classList.remove('is-loading');
    submitBtn.disabled = false;

    state.otpPhone = phone;

    // Show OTP code section
    const otpWrap = document.getElementById('otp-code-wrap');
    if (otpWrap) otpWrap.hidden = false;

    // Hide the send button (form will still be there)
    submitBtn.parentElement.style.display = 'none';

    // Start timer
    startOtpTimer();

    // Focus first OTP input
    const firstInput = document.querySelector('[data-otp-index="0"]');
    if (firstInput) firstInput.focus();

    toast({
      type: 'success',
      title: 'کد تأیید ارسال شد',
      message: `کد ۵ رقمی به شماره ${phone} ارسال شد`,
      duration: 3000,
    });

    // For demo: log the code
    console.log('%c🔐 Demo OTP Code: 12345', 'color:#2386D7; font-size:16px; font-weight:bold;');
  }, 800);
}

function handleOtpVerify() {
  const inputs = document.querySelectorAll('.otp-code__input');
  const code = Array.from(inputs).map((i) => i.value).join('');

  if (code.length !== 5) {
    toast({
      type: 'warning',
      title: 'کد ناقص است',
      message: 'لطفاً کد ۵ رقمی را کامل وارد کنید',
      duration: 2500,
    });
    return;
  }

  // Demo: any 5-digit code works
  // In real: check against server

  // Find or create user with this phone
  let user = findUser(state.otpPhone);

  if (!user) {
    // For demo: create a new user
    user = {
      id: 'user-' + Date.now(),
      firstName: 'کاربر',
      lastName: 'جدید',
      phone: state.otpPhone,
      email: '',
      createdAt: new Date().toISOString(),
    };

    // Save
    try {
      const users = getUsers();
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {}
  }

  saveSession(user);

  toast({
    type: 'success',
    title: 'ورود موفق',
    message: 'خوش آمدید!',
    duration: 2500,
  });

  setTimeout(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '../account/index.html';
    window.location.href = redirect;
  }, 1000);
}

/* ============================================
   OTP INPUT BEHAVIOR
   ============================================ */

function initOtpInputs() {
  const inputs = document.querySelectorAll('.otp-code__input');

  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val.slice(0, 1);

      if (val) {
        e.target.classList.add('is-filled');

        // Auto-focus next
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        } else {
          // Last input — auto-verify
          setTimeout(handleOtpVerify, 200);
        }
      } else {
        e.target.classList.remove('is-filled');
      }
    });

    input.addEventListener('keydown', (e) => {
      // Backspace: clear current or move back
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
        inputs[index - 1].value = '';
        inputs[index - 1].classList.remove('is-filled');
      }

      // Arrow keys
      if (e.key === 'ArrowLeft' && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
      if (e.key === 'ArrowRight' && index > 0) {
        inputs[index - 1].focus();
      }
    });

    // Paste support
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      const digits = text.replace(/\D/g, '').slice(0, 5);

      if (!digits) return;

      digits.split('').forEach((d, i) => {
        if (inputs[i]) {
          inputs[i].value = d;
          inputs[i].classList.add('is-filled');
        }
      });

      const nextIndex = Math.min(digits.length, inputs.length - 1);
      inputs[nextIndex].focus();

      if (digits.length === 5) {
        setTimeout(handleOtpVerify, 200);
      }
    });
  });
}

/* ============================================
   OTP TIMER
   ============================================ */

function startOtpTimer() {
  state.otpRemaining = 120; // 2 minutes
  updateTimerText();

  const resendBtn = document.getElementById('otp-resend');
  if (resendBtn) resendBtn.disabled = true;

  if (state.otpTimer) clearInterval(state.otpTimer);

  state.otpTimer = setInterval(() => {
    state.otpRemaining--;
    updateTimerText();

    if (state.otpRemaining <= 0) {
      clearInterval(state.otpTimer);
      state.otpTimer = null;

      const timerEl = document.getElementById('otp-timer-text');
      if (timerEl) timerEl.textContent = 'کد منقضی شد';

      if (resendBtn) resendBtn.disabled = false;
    }
  }, 1000);
}

function updateTimerText() {
  const el = document.getElementById('otp-timer-text');
  if (!el) return;

  const m = Math.floor(state.otpRemaining / 60);
  const s = state.otpRemaining % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');

  // Persian digits
  const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

  el.textContent = `تا دریافت مجدد کد: ${fa(mm)}:${fa(ss)}`;
}

/* ============================================
   BIND TABS
   ============================================ */

function bindTabs() {
  const wrap = document.getElementById('auth-tabs');
  const passwordForm = document.getElementById('password-form');
  const otpForm = document.getElementById('otp-form');

  if (!wrap) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-auth-tab]');
    if (!btn) return;

    wrap.querySelectorAll('.auth-tab').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    state.tab = btn.dataset.authTab;

    if (state.tab === 'password') {
      if (passwordForm) passwordForm.hidden = false;
      if (otpForm) otpForm.hidden = true;
    } else {
      if (passwordForm) passwordForm.hidden = true;
      if (otpForm) otpForm.hidden = false;
    }
  });
}

/* ============================================
   BIND PASSWORD TOGGLE
   ============================================ */

function bindPasswordToggle() {
  const btn = document.getElementById('toggle-password');
  const input = document.getElementById('login-password');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    const eyeIcon = btn.querySelector('.icon-eye');
    const eyeOffIcon = btn.querySelector('.icon-eye-off');

    if (eyeIcon && eyeOffIcon) {
      eyeIcon.style.display = isPassword ? 'none' : '';
      eyeOffIcon.style.display = isPassword ? '' : 'none';
    }

    btn.setAttribute('aria-label', isPassword ? 'پنهان کردن رمز' : 'نمایش رمز');
  });
}

/* ============================================
   BIND INPUTS
   ============================================ */

function bindInputs() {
  // Clear errors on input
  const identifier = document.getElementById('login-identifier');
  const password = document.getElementById('login-password');
  const phone = document.getElementById('otp-phone');

  if (identifier) {
    identifier.addEventListener('input', () => clearError('identifier'));
  }

  if (password) {
    password.addEventListener('input', () => clearError('password'));
  }

  if (phone) {
    phone.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
      clearError('phone');
    });
  }
}

/* ============================================
   SOCIAL LOGIN (Demo)
   ============================================ */

function bindSocial() {
  document.querySelectorAll('[data-social]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const provider = btn.dataset.social;

      toast({
        type: 'info',
        title: 'ورود با ' + (provider === 'google' ? 'Google' : 'Apple'),
        message: 'این ویژگی به‌زودی فعال می‌شود',
        duration: 3000,
      });
    });
  });
}

/* ============================================
   OTP RESEND
   ============================================ */

function bindOtpResend() {
  const btn = document.getElementById('otp-resend');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (btn.disabled) return;

    // Reset inputs
    document.querySelectorAll('.otp-code__input').forEach((i) => {
      i.value = '';
      i.classList.remove('is-filled');
    });

    // Focus first
    const firstInput = document.querySelector('[data-otp-index="0"]');
    if (firstInput) firstInput.focus();

    startOtpTimer();

    toast({
      type: 'success',
      title: 'کد جدید ارسال شد',
      message: `کد تأیید به شماره ${state.otpPhone} ارسال شد`,
      duration: 2500,
    });

    console.log('%c🔐 Demo OTP Code: 12345', 'color:#2386D7; font-size:16px; font-weight:bold;');
  });
}

/* ============================================
   INIT
   ============================================ */

function init() {
  // If already logged in, redirect
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (session?.user) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '../account/index.html';

      toast({
        type: 'info',
        title: 'قبلاً وارد شده‌اید',
        message: 'در حال انتقال...',
        duration: 1500,
      });

      setTimeout(() => {
        window.location.href = redirect;
      }, 800);
      return;
    }
  } catch {}

  bindTabs();
  bindPasswordToggle();
  bindInputs();
  bindSocial();
  bindOtpResend();
  initOtpInputs();

  // Forms
  const passwordForm = document.getElementById('password-form');
  const otpForm = document.getElementById('otp-form');

  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordLogin);
  }

  if (otpForm) {
    otpForm.addEventListener('submit', handleOtpSend);
  }

  const verifyBtn = document.getElementById('submit-otp-verify');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', handleOtpVerify);
  }

  console.log('%c✓ Login page loaded', 'color:#18B981;font-weight:bold;');
}

init();