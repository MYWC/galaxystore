/* ============================================
   REGISTER PAGE — Fixed Redirect
   ============================================ */

import { initLayout } from '../components/layout.js';
import { toast } from '../components/toast.js';
import { signUp, isSupabaseConfigured } from '../services/auth.js';

initLayout();

/* ============================================
   REDIRECT RESOLVER
   ============================================ */

function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search);
  let redirect = params.get('redirect');

  if (!redirect) {
    redirect = 'account/index.html';
  }

  if (redirect.startsWith('/') || redirect.startsWith('http')) {
    return redirect;
  }

  const base = window.MS_BASE_PATH || '../';
  return base + redirect;
}

/* ============================================
   VALIDATORS
   ============================================ */

function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function isPhone(str) {
  return /^09\d{9}$/.test((str || '').replace(/\D/g, ''));
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
   ERRORS
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
   PASSWORD STRENGTH
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
   INPUTS
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
      if (key === 'phone') {
        el.value = el.value.replace(/\D/g, '').slice(0, 11);
      }
    });
  });

  const terms = document.getElementById('agree-terms');
  if (terms) terms.addEventListener('change', () => clearError('terms'));
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
   VALIDATE
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

  if (!firstName || firstName.length < 2) {
    setError('firstName', 'نام باید حداقل ۲ کاراکتر باشد');
    valid = false;
  }
  if (!lastName || lastName.length < 2) {
    setError('lastName', 'نام خانوادگی باید حداقل ۲ کاراکتر باشد');
    valid = false;
  }
  if (!isPhone(phone)) {
    setError('phone', 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
    valid = false;
  }
  if (!isEmail(email)) {
    setError('email', 'فرمت ایمیل صحیح نیست');
    valid = false;
  }
  if (!password || password.length < 8) {
    setError('password', 'رمز عبور باید حداقل ۸ کاراکتر باشد');
    valid = false;
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    setError('password', 'رمز عبور باید شامل حرف و عدد باشد');
    valid = false;
  }
  if (password !== confirmPassword) {
    setError('confirmPassword', 'رمز و تکرار آن یکسان نیستند');
    valid = false;
  }
  if (!termsChecked) {
    setError('terms', 'برای ثبت‌نام باید قوانین را بپذیرید');
    valid = false;
  }

  return valid;
}

/* ============================================
   SUBMIT
   ============================================ */

async function handleSubmit(e) {
  e.preventDefault();

  if (!validate()) {
    const firstError = document.querySelector('.form-field.has-error, .auth-form__row--terms.has-error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const result = await signUp({
    email: document.getElementById('reg-email').value.trim(),
    password: document.getElementById('reg-password').value,
    firstName: document.getElementById('reg-firstName').value.trim(),
    lastName: document.getElementById('reg-lastName').value.trim(),
    phone: document.getElementById('reg-phone').value.trim(),
    subscribeNews: document.getElementById('subscribe-news')?.checked || false,
  });

  btn.classList.remove('is-loading');
  btn.disabled = false;

  if (result.error) {
    const msg = result.error.message;
    if (msg.includes('ایمیل')) setError('email', msg);
    else if (msg.includes('موبایل') || msg.includes('شماره')) setError('phone', msg);

    toast({
      type: 'error',
      title: 'ثبت‌نام ناموفق',
      message: msg,
      duration: 3500,
    });
    return;
  }

  if (result.needsEmailConfirmation) {
    showEmailConfirmation(result.user);
    return;
  }

  showSuccess(result.user);

  toast({
    type: 'success',
    title: 'ثبت‌نام موفق!',
    message: `خوش آمدید ${result.user?.firstName || ''} عزیز`,
    duration: 3000,
  });

  setTimeout(() => {
    window.location.href = getRedirectUrl();
  }, 2000);
}

/* ============================================
   SUCCESS
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
          <strong>${user?.firstName || ''} ${user?.lastName || ''}</strong> عزیز،
          حساب شما با موفقیت ایجاد شد.<br>
          در حال انتقال به پنل کاربری...
        </p>
        <div class="auth-success__actions">
          <a href="${(window.MS_BASE_PATH || '../')}account/index.html" class="btn btn--primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            رفتن به پنل کاربری
          </a>
          <a href="${(window.MS_BASE_PATH || '../')}index.html" class="btn btn--outline">
            صفحه اصلی
          </a>
        </div>
      </div>
    </div>
  `;

  launchConfetti();
}

function showEmailConfirmation(user) {
  const formSide = document.querySelector('.auth-form-wrap');
  if (!formSide) return;

  formSide.innerHTML = `
    <div class="auth-form">
      <div class="auth-success">
        <div class="auth-success__icon" style="background: linear-gradient(135deg, #2386D7, #1B6FB5);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="width:38px;height:38px;stroke-width:2.4;">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <polyline points="22 6 12 13 2 6"/>
          </svg>
        </div>
        <h1 class="auth-success__title">ایمیل خود را تأیید کنید</h1>
        <p class="auth-success__text">
          یک ایمیل تأیید به <strong>${user?.email || ''}</strong> ارسال شد.
          لطفاً روی لینک داخل ایمیل کلیک کنید.
        </p>
        <div class="auth-success__actions">
          <a href="login.html" class="btn btn--primary">بازگشت به ورود</a>
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   CONFETTI
   ============================================ */

function launchConfetti() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const colors = ['#18B981', '#2386D7', '#16B5A5', '#F59E0B', '#7C5CFF'];
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:9999; overflow:hidden;';
  document.body.appendChild(wrap);

  for (let i = 0; i < 30; i++) {
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

  bindInputs();
  bindPasswordStrength();
  bindPasswordToggle('toggle-reg-password', 'reg-password');
  bindPasswordToggle('toggle-reg-confirm', 'reg-confirmPassword');
  bindSocial();

  const form = document.getElementById('register-form');
  if (form) form.addEventListener('submit', handleSubmit);

  if (!isSupabaseConfigured()) {
    console.log(
      '%c⚠️  Supabase not configured — Register در حالت Local Fallback',
      'color:#F59E0B;font-weight:bold;'
    );
  }

  console.log('%c✓ Register page loaded', 'color:#18B981;font-weight:bold;');
}

init();