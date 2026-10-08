/* ============================================
   RETURNS PAGE
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

const RETURNS_KEY = 'ms_returns';

/* ============================================
   HELPERS
   ============================================ */

function isPhone(str) {
  return /^09\d{9}$/.test((str || '').replace(/\D/g, ''));
}

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

function clearAllErrors() {
  ['orderNumber', 'phone', 'fullName', 'reason', 'description'].forEach(clearError);
}

function saveReturn(data) {
  try {
    const list = JSON.parse(localStorage.getItem(RETURNS_KEY) || '[]');
    list.unshift(data);
    localStorage.setItem(RETURNS_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    console.error('Save return error:', e);
  }
}

function generateReturnId() {
  return 'RET-' + Date.now().toString().slice(-8);
}

/* ============================================
   VALIDATE
   ============================================ */

function validateForm() {
  clearAllErrors();

  const orderNumber = document.getElementById('r-orderNumber').value.trim();
  const phone = document.getElementById('r-phone').value.trim();
  const fullName = document.getElementById('r-fullName').value.trim();
  const reason = document.getElementById('r-reason').value;
  const description = document.getElementById('r-description').value.trim();

  let valid = true;

  if (!orderNumber || orderNumber.length < 6) {
    setError('orderNumber', 'شماره سفارش را وارد کنید');
    valid = false;
  }

  if (!isPhone(phone)) {
    setError('phone', 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
    valid = false;
  }

  if (!fullName || fullName.length < 3) {
    setError('fullName', 'نام و نام خانوادگی را کامل وارد کنید');
    valid = false;
  }

  if (!reason) {
    setError('reason', 'دلیل بازگشت را انتخاب کنید');
    valid = false;
  }

  if (!description || description.length < 10) {
    setError('description', 'توضیحات باید حداقل ۱۰ کاراکتر باشد');
    valid = false;
  }

  return valid;
}

/* ============================================
   SUBMIT
   ============================================ */

function handleSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    const firstErr = document.querySelector('.form-field.has-error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });

    toast({
      type: 'error',
      title: 'اطلاعات ناقص',
      message: 'لطفاً خطاهای مشخص‌شده را برطرف کنید',
      duration: 3000,
    });
    return;
  }

  const btn = document.getElementById('return-submit');
  btn.disabled = true;
  btn.style.opacity = '0.7';

  setTimeout(() => {
    const data = {
      id: generateReturnId(),
      orderNumber: document.getElementById('r-orderNumber').value.trim(),
      phone: document.getElementById('r-phone').value.trim(),
      fullName: document.getElementById('r-fullName').value.trim(),
      reason: document.getElementById('r-reason').value,
      description: document.getElementById('r-description').value.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    saveReturn(data);
    showSuccess(data);

    toast({
      type: 'success',
      title: 'درخواست ثبت شد',
      message: `کد پیگیری: ${data.id}`,
      duration: 4000,
    });
  }, 800);
}

/* ============================================
   SUCCESS STATE
   ============================================ */

function showSuccess(data) {
  const wrap = document.getElementById('return-form-wrap');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="return-success">
      <div class="return-success__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h2 class="return-success__title">درخواست شما ثبت شد! 🎉</h2>

      <p class="return-success__text">
        درخواست بازگشت کالا با کد پیگیری زیر ثبت شد.
        تیم پشتیبانی طی ۲۴ ساعت آینده با شما تماس خواهد گرفت.
      </p>

      <div style="display:inline-flex; align-items:center; gap:10px; padding:12px 20px; background:#EAF4FD; border-radius:12px; margin-bottom:24px;">
        <span style="font-size:12px; color:var(--text-muted); font-weight:500;">کد پیگیری:</span>
        <span style="font-size:16px; font-weight:800; color:var(--primary); direction:ltr; font-family:monospace;">${data.id}</span>
      </div>

      <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
        <a href="contact.html" class="btn btn--primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          تماس با پشتیبانی
        </a>
        <a href="../index.html" class="btn btn--outline">
          بازگشت به خانه
        </a>
      </div>
    </div>
  `;

  window.scrollTo({ top: 200, behavior: 'smooth' });
}

/* ============================================
   BIND INPUTS
   ============================================ */

function bindInputs() {
  const phone = document.getElementById('r-phone');
  if (phone) {
    phone.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
      clearError('phone');
    });
  }

  ['orderNumber', 'fullName', 'description'].forEach((id) => {
    const el = document.getElementById(`r-${id}`);
    if (el) el.addEventListener('input', () => clearError(id));
  });

  const reason = document.getElementById('r-reason');
  if (reason) reason.addEventListener('change', () => clearError('reason'));
}

/* ============================================
   INIT
   ============================================ */

function init() {
  const form = document.getElementById('return-form');
  if (form) form.addEventListener('submit', handleSubmit);

  bindInputs();

  console.log('%c✓ Returns page loaded', 'color:#18B981;font-weight:bold;');
}

init();