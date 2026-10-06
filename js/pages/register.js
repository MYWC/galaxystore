/* ============================================
   REGISTER PAGE
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

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Save users error', e);
  }
}

function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
      },
      loggedInAt: new Date().toISOString(),
    }));
  } catch {}
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

function checkPasswordStrength(password) {
  let level = 0;
  if (!password) return { level: 0, label: '—' };

  if (password.length >= 6) level++;
  if (password.length >= 8) level++;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) level++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) level++;

  level = Math.min(level, 4);

  const labels = ['—', 'ضعیف', 'متوسط', 'خوب', 'قوی'];
  return { level, label: labels[level] };
}

/* ============================================
   ERROR HELPERS
   ============================================ */

function setError(fieldName, message) {
  const errEl = document.querySelector(`[data-error="${fieldName}"]`);
  const field = document.getElementById(`field-${fieldName}`);
  if (field) field.classList.add('has-error');
  if (errEl) errEl.textContent = message;
}

function clearError(fieldName) {
  const errEl = document.querySelector(`[data-error="${fieldName}"]`);
  const field = document.getElementById(`field-${fieldName}`);
  if (field) field.classList.remove('has-error');
  if (errEl) errEl.textContent = '';
}

function clearAllErrors() {
  ['firstName', 'lastName', 'phone', 'email', 'password', 'confirmPassword', 'terms']
    .forEach(clearError);
}

/* ============================================
   PASSWORD STRENGTH UI
   ============================================ */

function bindPasswordStrength() {
  const input = document.getElementById('reg-password');
  const wrap = document.getElementById('password-strength');
  const text = document.getElementById('password-strength-text');
  if (!input || !wrap || !text) return;

  input.addEventListener('input', () => {
    const { level, label } = checkPasswordStrength(input.value);

    if (!input.value) {
      wrap.hidden = true;
      wrap.removeAttribute('data-level');
      return;
    }

    wrap.hidden = false;
    wrap.setAttribute('data-level', level);
    text.textContent = label;
  });
}

/* ============================================
   BIND INPUT CLEAR ERRORS
   ============================================ */

function bindInputs() {
  const inputs = {
    firstName: document.getElementById('reg-firstName'),
    lastName: document.getElementById('reg-lastName'),
    phone: document.getElementById('reg-phone'),
    email: document.getElementById('reg-email'),
    password: document.getElementById('reg-password'),
    confirmPassword: document.getElementById('reg-confirmPassword'),
  };

  Object.entries(inputs).forEach(([key, el]) => {
    if (!el) return;

    el.addEventListener('input', () => {
      clearError(key);

      // Phone sanitize
      if (key === 'phone') {
        el.value = el.value.replace(/\D/g, '').slice(0, 11);
      }
    });
  });

  // Terms checkbox
  const terms = document.getElementById('agree-terms');
  if (terms) {
    terms.addEventListener('change', () => clearError('terms'));
  }
}

/* ============================================
   PASSWORD TOGGLE
   ============================================ */

function bindPasswordToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
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
   VALIDATION
   ============================================ */

function validate() {
  clearAllErrors();

  const firstName = document.getElementById('reg-firstName').value.trim();
  const lastName = document.getElementById('reg-lastName').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirmPassword').value;
  const termsChecked = document.getElementById('agree-terms').checked;

  let valid = true;

  // First name
  if (!firstName) {
    setError('firstName', 'نام را وارد کنید');
    valid = false;
  } else if (firstName.length < 2) {
    setError('firstName', 'نام باید حداقل ۲ کاراکتر باشد');
    valid = false;
  }

  // Last name
  if (!lastName) {
    setError('lastName', 'نام خانوادگی را وارد کنید');
    valid = false;
  } else if (lastName.length < 2) {
    setError('lastName', 'نام خانوادگی باید حداقل ۲ کاراکتر باشد');
    valid = false;
  }

  // Phone
  if (!phone) {
    setError('phone', 'شماره موبایل را وارد کنید');
    valid = false;
  } else if (!isPhone(phone)) {
    setError('phone', 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
    valid = false;
  } else {
    // Check duplicate phone
    const existing = getUsers().find((u) => u.phone === phone);
    if (existing) {
      setError('phone', 'این شماره موبایل قبلاً ثبت‌نام کرده است');
      valid = false;
    }
  }

  // Email
  if (!email) {
    setError('email', 'ایمیل را وارد کنید');
    valid = false;
  } else if (!isEmail(email)) {
    setError('email', 'فرمت ایمیل صحیح نیست');
    valid = false;
  } else {
    const existing = getUsers().find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      setError('email', 'این ایمیل قبلاً ثبت‌نام کرده است');
      valid = false;
    }
  }

  // Password
  if (!password) {
    setError('password', 'رمز عبور را وارد کنید');
    valid = false;
  } else if (password.length < 8) {
    setError('password', 'رمز عبور باید حداقل ۸ کاراکتر باشد');
    valid = false;
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    setError('password', 'رمز عبور باید شامل حرف و عدد باشد');
    valid = false;
  }

  // Confirm password
  if (!confirmPassword) {
    setError('confirmPassword', 'تکرار رمز عبور را وارد کنید');
    valid = false;
  } else if (password !== confirmPassword) {
    setError('confirmPassword', 'رمز عبور و تکرار آن یکسان نیستند');
    valid = false;
  }

  // Terms
  if (!termsChecked) {
    setError('terms', 'برای ثبت‌نام باید قوانین را بپذیرید');
    valid = false;
  }

  return valid;
}

/* ============================================
   FORM SUBMIT
   ============================================ */

function handleSubmit(e) {
  e.preventDefault();

  if (!validate()) {
    // Scroll to first error
    const firstError = document.querySelector('.form-field.has-error, .auth-form__row--terms.has-error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    toast({
      type: 'error',
      title: 'اطلاعات ناقص است',
      message: 'لطفاً فیلدهای مشخص‌شده را اصلاح کنید',
      duration: 3000,
    });
    return;
  }

  const btn = document.getElementById('submit-register');
  btn.classList.add('is-loading');
  btn.disabled = true;

  // Simulate server
  setTimeout(() => {
    const user = {
      id: 'user-' + Date.now(),
      firstName: document.getElementById('reg-firstName').value.trim(),
      lastName: document.getElementById('reg-lastName').value.trim(),
      phone: document.getElementById('reg-phone').value.trim(),
      email: document.getElementById('reg-email').value.trim().toLowerCase(),
      subscribeNews: document.getElementById('subscribe-news').checked,
      createdAt: new Date().toISOString(),
    };

    // Save
    const users = getUsers();
    users.push(user);
    saveUsers(users);

    // Session
    saveSession(user);

    // Show success
    showSuccess(user);

    toast({
      type: 'success',
      title: 'ثبت‌نام موفق!',
      message: `خوش آمدید ${user.firstName} عزیز`,
      duration: 3000,
    });

    // Redirect after 2.5s
    setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '../account/index.html';
      window.location.href = redirect;
    }, 2500);
  }, 900);
}

/* ============================================
   SUCCESS STATE
   ============================================ */

function showSuccess(user) {
  const formSide = document.querySelector('.auth-form-wrap');
  if (!formSide) return;

  formSide.innerHTML = `
    <div class="auth-form">
      <div class="auth-success">
        <div class="auth-success__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 class="auth-success__title">ثبت‌نام با موفقیت انجام شد! 🎉</h1>

        <p class="auth-success__text">
          <strong>${user.firstName} ${user.lastName}</strong> عزیز،
          حساب شما با موفقیت ایجاد شد.<br>
          در حال انتقال به پنل کاربری...
        </p>

        <div class="auth-success__actions">
          <a href="../account/index.html" class="btn btn--primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            رفتن به پنل کاربری
          </a>
          <a href="../index.html" class="btn btn--outline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            صفحه اصلی
          </a>
        </div>
      </div>
    </div>
  `;

  // Confetti
  launchConfetti();
}

/* ============================================
   CONFETTI
   ============================================ */

function launchConfetti() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const colors = ['#18B981', '#2386D7', '#16B5A5', '#F59E0B', '#7C5CFF'];
  const count = 30;

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:9999; overflow:hidden;';
  document.body.appendChild(wrap);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.style.cssText = `
      position: absolute;
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}%;
      top: -20px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confettiFall ${2 + Math.random() * 2}s ease-in forwards;
      animation-delay: ${Math.random() * 0.6}s;
    `;
    wrap.appendChild(piece);
  }

  setTimeout(() => wrap.remove(), 5000);
}

/* ============================================
   SOCIAL
   ============================================ */

function bindSocial() {
  document.querySelectorAll('[data-social]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const provider = btn.dataset.social;
      toast({
        type: 'info',
        title: 'ثبت‌نام با ' + (provider === 'google' ? 'Google' : 'Apple'),
        message: 'این ویژگی به‌زودی فعال می‌شود',
        duration: 3000,
      });
    });
  });
}

/* ============================================
   INIT
   ============================================ */

function init() {
  // Already logged in?
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

      setTimeout(() => { window.location.href = redirect; }, 800);
      return;
    }
  } catch {}

  bindInputs();
  bindPasswordStrength();
  bindPasswordToggle('toggle-reg-password', 'reg-password');
  bindPasswordToggle('toggle-reg-confirm', 'reg-confirmPassword');
  bindSocial();

  const form = document.getElementById('register-form');
  if (form) form.addEventListener('submit', handleSubmit);

  console.log('%c✓ Register page loaded', 'color:#18B981;font-weight:bold;');
}

init();