/* ============================================
   STOCK ALERT MODAL COMPONENT — C.4
   Opens form, validates, submits, shows success
   ============================================ */

import { toast } from './toast.js';
import { getCurrentUser } from '../services/auth.js';
import {
  createStockAlert,
  hasExistingAlert,
  isValidEmail,
  isValidPhone,
} from '../services/stock-alerts.js';

const ICONS = {
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 6 12 13 2 6"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

let modalEl = null;
let currentProductId = null;
let currentVariantKey = null;
let currentProductName = null;
let isSubmitting = false;

/* ============================================
   BUILD MODAL
   ============================================ */

function ensureModal() {
  if (modalEl) return modalEl;

  modalEl = document.createElement('div');
  modalEl.className = 'stock-alert-modal';
  modalEl.setAttribute('role', 'dialog');
  modalEl.setAttribute('aria-modal', 'true');
  modalEl.setAttribute('aria-label', 'اطلاع از موجود شدن محصول');
  modalEl.setAttribute('aria-hidden', 'true');

  modalEl.innerHTML = `
    <div class="stock-alert-modal__inner" id="stock-alert-inner">
      <!-- content injected dynamically -->
    </div>
  `;

  document.body.appendChild(modalEl);

  // Close by clicking backdrop
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeStockAlertModal();
  });

  // ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl.classList.contains('is-open')) {
      closeStockAlertModal();
    }
  });

  return modalEl;
}

/* ============================================
   RENDER — FORM
   ============================================ */

function renderForm() {
  const inner = document.getElementById('stock-alert-inner');
  if (!inner) return;

  inner.innerHTML = `
    <button class="stock-alert-modal__close" id="stock-alert-close" aria-label="بستن">
      ${ICONS.close}
    </button>

    <div class="stock-alert-modal__head">
      <div class="stock-alert-modal__icon">${ICONS.bell}</div>
      <h3 class="stock-alert-modal__title">خبرم کن وقتی موجود شد</h3>
      <p class="stock-alert-modal__subtitle">
        به‌محض موجود شدن این محصول، از طریق ایمیل یا پیامک به شما اطلاع می‌دهیم.
      </p>
      <span class="stock-alert-modal__product">
        ${currentProductName || 'این محصول'}
        ${currentVariantKey ? ` — ${currentVariantKey}` : ''}
      </span>
    </div>

    <div class="stock-alert-modal__body">
      <form class="stock-alert-form" id="stock-alert-form" novalidate>

        <div class="stock-alert-field" id="sa-field-email">
          <label class="stock-alert-field__label" for="sa-email">
            ایمیل
            <span class="stock-alert-field__optional">اختیاری</span>
          </label>
          <div class="stock-alert-field__wrap">
            <span class="stock-alert-field__icon">${ICONS.mail}</span>
            <input
              type="email"
              id="sa-email"
              class="stock-alert-field__input"
              placeholder="example@email.com"
              autocomplete="email"
              dir="ltr"
            />
          </div>
          <span class="stock-alert-field__error" data-error="email"></span>
        </div>

        <div class="stock-alert-field" id="sa-field-phone">
          <label class="stock-alert-field__label" for="sa-phone">
            شماره موبایل
            <span class="stock-alert-field__optional">اختیاری</span>
          </label>
          <div class="stock-alert-field__wrap">
            <span class="stock-alert-field__icon">${ICONS.phone}</span>
            <input
              type="tel"
              id="sa-phone"
              class="stock-alert-field__input"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              inputmode="numeric"
              maxlength="11"
            />
          </div>
          <span class="stock-alert-field__error" data-error="phone"></span>
        </div>

        <div class="stock-alert-hint">
          ${ICONS.info}
          <span>حداقل یکی از راه‌های ارتباطی بالا را وارد کنید تا بتوانیم اطلاع‌رسانی کنیم.</span>
        </div>

        <button type="submit" class="stock-alert-submit" id="stock-alert-submit">
          ${ICONS.bell}
          <span>ثبت درخواست اطلاع‌رسانی</span>
        </button>
      </form>
    </div>
  `;

  bindForm();
}

/* ============================================
   BIND FORM
   ============================================ */

function bindForm() {
  const form = document.getElementById('stock-alert-form');
  const emailInput = document.getElementById('sa-email');
  const phoneInput = document.getElementById('sa-phone');
  const submitBtn = document.getElementById('stock-alert-submit');

  if (!form || !emailInput || !phoneInput || !submitBtn) return;

  // Auto-fill from logged user
  getCurrentUser().then((user) => {
    if (user) {
      if (user.email && !emailInput.value) emailInput.value = user.email;
      if (user.phone && !phoneInput.value) phoneInput.value = user.phone;
    }
  });

  // Clear errors on input
  emailInput.addEventListener('input', () => clearFieldError('email'));
  phoneInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
    clearFieldError('phone');
  });

  // Close button
  document.getElementById('stock-alert-close')?.addEventListener('click', closeStockAlertModal);

  // Submit
  form.addEventListener('submit', handleSubmit);
}

/* ============================================
   ERRORS
   ============================================ */

function setFieldError(name, message) {
  const field = document.getElementById(`sa-field-${name}`);
  const err = field?.querySelector(`[data-error="${name}"]`);
  if (field) field.classList.add('has-error');
  if (err) err.textContent = message;
}

function clearFieldError(name) {
  const field = document.getElementById(`sa-field-${name}`);
  const err = field?.querySelector(`[data-error="${name}"]`);
  if (field) field.classList.remove('has-error');
  if (err) err.textContent = '';
}

function clearAllErrors() {
  clearFieldError('email');
  clearFieldError('phone');
}

/* ============================================
   SUBMIT
   ============================================ */

async function handleSubmit(e) {
  e.preventDefault();
  if (isSubmitting) return;

  clearAllErrors();

  const emailInput = document.getElementById('sa-email');
  const phoneInput = document.getElementById('sa-phone');
  const submitBtn = document.getElementById('stock-alert-submit');

  const email = emailInput?.value.trim() || '';
  const phone = phoneInput?.value.trim() || '';

  let valid = true;

  // حداقل یکی
  if (!email && !phone) {
    setFieldError('email', 'ایمیل یا شماره موبایل را وارد کنید');
    setFieldError('phone', 'ایمیل یا شماره موبایل را وارد کنید');
    valid = false;
  } else {
    // اگه ایمیل داده شده، معتبر باشه
    if (email && !isValidEmail(email)) {
      setFieldError('email', 'فرمت ایمیل صحیح نیست');
      valid = false;
    }

    // اگه موبایل داده شده، معتبر باشه
    if (phone && !isValidPhone(phone)) {
      setFieldError('phone', 'شماره موبایل ۱۱ رقمی با ۰۹');
      valid = false;
    }
  }

  if (!valid) return;

  isSubmitting = true;
  submitBtn.classList.add('is-loading');
  submitBtn.disabled = true;

  const result = await createStockAlert({
    productId: currentProductId,
    email: email || null,
    phone: phone || null,
    variantKey: currentVariantKey,
  });

  isSubmitting = false;

  if (!result.success) {
    submitBtn.classList.remove('is-loading');
    submitBtn.disabled = false;

    toast({
      type: result.alreadyExists ? 'info' : 'error',
      title: result.alreadyExists ? 'قبلاً ثبت شده' : 'خطا',
      message: result.error?.message || 'لطفاً دوباره تلاش کنید',
      duration: 3500,
    });

    if (result.alreadyExists) {
      showSuccess();
    }
    return;
  }

  // موفق
  toast({
    type: 'success',
    title: 'درخواست ثبت شد',
    message: 'به‌محض موجود شدن، به شما اطلاع می‌دهیم',
    duration: 3000,
  });

  showSuccess();
}

/* ============================================
   SUCCESS STATE
   ============================================ */

function showSuccess() {
  const inner = document.getElementById('stock-alert-inner');
  if (!inner) return;

  inner.innerHTML = `
    <div class="stock-alert-modal__body">
      <div class="stock-alert-success">
        <div class="stock-alert-success__icon">
          ${ICONS.check}
        </div>
        <h3 class="stock-alert-success__title">ثبت شد! 🎉</h3>
        <p class="stock-alert-success__text">
          به‌محض موجود شدن این محصول، از طریق راه ارتباطی که وارد کرده‌اید به شما اطلاع می‌دهیم.
        </p>
        <button type="button" class="stock-alert-success__btn" id="stock-alert-ok">
          ${ICONS.check}
          متوجه شدم
        </button>
      </div>
    </div>
  `;

  document.getElementById('stock-alert-ok')?.addEventListener('click', () => {
    closeStockAlertModal();
  });
}

/* ============================================
   OPEN / CLOSE
   ============================================ */

export async function openStockAlertModal({ productId, productName, variantKey }) {
  if (!productId) return;

  currentProductId = productId;
  currentProductName = productName || null;
  currentVariantKey = variantKey || null;

  ensureModal();

  // چک تکراری
  const exists = await hasExistingAlert(productId);

  if (exists) {
    // اگه قبلاً ثبت شده، مستقیم موفقیت نشون بده
    renderForm();
    showSuccess();
  } else {
    renderForm();
  }

  modalEl.classList.add('is-open');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // فوکوس روی اولین فیلد
  setTimeout(() => {
    const first = document.getElementById('sa-email');
    if (first && !first.value) first.focus();
  }, 300);
}

export function closeStockAlertModal() {
  if (!modalEl) return;
  modalEl.classList.remove('is-open');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  isSubmitting = false;
  currentProductId = null;
  currentVariantKey = null;
  currentProductName = null;
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ Stock Alert modal ready (C.4)', 'color:#18B981;font-weight:bold;');