/* ============================================
   STOCK ALERT MODAL — C.4
   ============================================ */

import { toast } from './toast.js';
import {
  createStockAlert,
  cancelStockAlert,
  hasStockAlert,
  getStockAlert,
} from '../services/stock-alerts.js';
import { getCurrentUser } from '../services/auth.js';
import { withButtonLoading } from '../utils/button-loading.js';

/* ============================================
   ICONS
   ============================================ */

const ICONS = {
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 6 12 13 2 6"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  phone2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12" y2="18"/></svg>`,
};

/* ============================================
   STATE
   ============================================ */

let modalEl = null;
let currentCtx = null;
let onSubmit = null;

/* ============================================
   BUILD
   ============================================ */

function buildModal() {
  const el = document.createElement('div');
  el.className = 'stock-modal';
  el.id = 'stock-modal';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'stock-modal-title');

  el.innerHTML = `
    <div class="stock-modal__inner" id="stock-modal-content">
      <!-- JS content -->
    </div>
  `;

  document.body.appendChild(el);

  // Click overlay to close
  el.addEventListener('click', (e) => {
    if (e.target === el) closeStockModal();
  });

  // ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && el.classList.contains('is-open')) {
      closeStockModal();
    }
  });

  return el;
}

/* ============================================
   RENDER — FORM
   ============================================ */

async function renderForm(ctx) {
  const content = document.getElementById('stock-modal-content');
  if (!content) return;

  const user = await getCurrentUser();
  const prefilledEmail = user?.email || '';
  const prefilledPhone = user?.phone || '';

  const variantLabel = ctx.variant
    ? [ctx.variant.storage, ctx.variant.ram].filter(Boolean).join(' • ')
    : '';

  content.innerHTML = `
    <button type="button" class="stock-modal__close" id="stock-modal-close" aria-label="بستن">
      ${ICONS.close}
    </button>

    <div class="stock-modal__icon">
      ${ICONS.bell}
    </div>

    <h2 class="stock-modal__title" id="stock-modal-title">اطلاع از موجود شدن</h2>
    <p class="stock-modal__subtitle">
      به‌محض موجود شدن این محصول، از طریق ایمیل یا پیامک به شما اطلاع می‌دهیم.
    </p>

    <div class="stock-modal__product">
      <span class="stock-modal__product-icon">
        ${ICONS.phone2}
      </span>
      <div class="stock-modal__product-info">
        <span class="stock-modal__product-name">${ctx.productName || 'محصول'}</span>
        ${variantLabel ? `<span class="stock-modal__product-variant">${variantLabel}</span>` : ''}
      </div>
    </div>

    <form class="stock-modal__form" id="stock-modal-form" novalidate>

      <div class="stock-modal__field" id="stock-field-email">
        <label class="stock-modal__label" for="stock-email">
          ایمیل
          <span class="stock-modal__label-optional">(یکی از این دو کافیست)</span>
        </label>
        <div class="stock-modal__input-wrap">
          <span class="stock-modal__input-icon">${ICONS.mail}</span>
          <input
            type="email"
            id="stock-email"
            class="stock-modal__input"
            placeholder="example@email.com"
            value="${prefilledEmail}"
            dir="ltr"
            autocomplete="email"
          />
        </div>
        <span class="stock-modal__error" data-error="email"></span>
      </div>

      <div class="stock-modal__divider">یا</div>

      <div class="stock-modal__field" id="stock-field-phone">
        <label class="stock-modal__label" for="stock-phone">
          شماره موبایل
          <span class="stock-modal__label-optional">(برای اطلاع پیامکی)</span>
        </label>
        <div class="stock-modal__input-wrap">
          <span class="stock-modal__input-icon">${ICONS.phone}</span>
          <input
            type="tel"
            id="stock-phone"
            class="stock-modal__input"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            value="${prefilledPhone}"
            inputmode="numeric"
            maxlength="11"
            autocomplete="tel"
          />
        </div>
        <span class="stock-modal__error" data-error="phone"></span>
      </div>

      <div class="stock-modal__actions">
        <button type="button" class="btn btn--outline" id="stock-modal-cancel">
          انصراف
        </button>
        <button type="submit" class="btn stock-modal__submit" id="stock-modal-submit">
          ${ICONS.bell}
          ثبت درخواست
        </button>
      </div>
    </form>
  `;

  bindFormEvents(ctx);
}

/* ============================================
   BIND FORM
   ============================================ */

function bindFormEvents(ctx) {
  const closeBtn = document.getElementById('stock-modal-close');
  const cancelBtn = document.getElementById('stock-modal-cancel');
  const form = document.getElementById('stock-modal-form');
  const emailInput = document.getElementById('stock-email');
  const phoneInput = document.getElementById('stock-phone');
  const submitBtn = document.getElementById('stock-modal-submit');

  closeBtn?.addEventListener('click', closeStockModal);
  cancelBtn?.addEventListener('click', closeStockModal);

  // Phone sanitize
  phoneInput?.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 11);
    clearFieldError('phone');
  });

  emailInput?.addEventListener('input', () => clearFieldError('email'));

  // Submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    // Validation
    let valid = true;

    if (!email && !phone) {
      setFieldError('email', 'حداقل یکی از ایمیل یا شماره موبایل را وارد کنید');
      setFieldError('phone', 'حداقل یکی از ایمیل یا شماره موبایل را وارد کنید');
      valid = false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('email', 'ایمیل معتبر نیست');
      valid = false;
    }

    if (phone && !/^09\d{9}$/.test(phone.replace(/\D/g, ''))) {
      setFieldError('phone', 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
      valid = false;
    }

    if (!valid) {
      toast({
        type: 'error',
        title: 'اطلاعات ناقص',
        message: 'لطفاً خطاهای مشخص‌شده را برطرف کنید',
        duration: 3000,
      });
      return;
    }

    // Submit
    await withButtonLoading(submitBtn, async () => {
      const result = await createStockAlert({
        productId: ctx.productId,
        variant: ctx.variant,
        email,
        phone,
      });

      if (!result.success) {
        // خطا رو نشون بده
        if (result.error?.includes('ایمیل')) setFieldError('email', result.error);
        else if (result.error?.includes('موبایل')) setFieldError('phone', result.error);

        toast({
          type: 'error',
          title: 'ثبت ناموفق',
          message: result.error || 'خطایی رخ داد',
          duration: 3500,
        });
        return;
      }

      // موفق
      renderSuccess(ctx);

      toast({
        type: 'success',
        title: 'درخواست ثبت شد',
        message: 'موجود شد، بهت خبر می‌دیم!',
        duration: 3000,
      });
    });
  });
}

/* ============================================
   RENDER — SUCCESS
   ============================================ */

function renderSuccess(ctx) {
  const content = document.getElementById('stock-modal-content');
  if (!content) return;

  content.innerHTML = `
    <div class="stock-modal__success">
      <div class="stock-modal__success-icon">
        ${ICONS.check}
      </div>

      <h2 class="stock-modal__success-title">ثبت شد! 🎉</h2>
      <p class="stock-modal__success-text">
        به‌محض موجود شدن
        <strong>${ctx.productName || 'این محصول'}</strong>
        از طریق ایمیل یا پیامک بهت اطلاع می‌دیم.
      </p>

      <div class="stock-modal__actions">
        <button type="button" class="btn btn--outline" id="stock-modal-done">
          بستن
        </button>
        <button type="button" class="btn btn--primary" id="stock-modal-cancel-alert">
          لغو اطلاع‌رسانی
        </button>
      </div>
    </div>
  `;

  document.getElementById('stock-modal-done')?.addEventListener('click', () => {
    closeStockModal();
    if (typeof onSubmit === 'function') onSubmit({ subscribed: true });
  });

  document.getElementById('stock-modal-cancel-alert')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    await withButtonLoading(btn, async () => {
      await cancelStockAlert(ctx.productId, ctx.variant);
      toast({
        type: 'info',
        title: 'اطلاع‌رسانی لغو شد',
        duration: 2500,
      });
      closeStockModal();
      if (typeof onSubmit === 'function') onSubmit({ subscribed: false });
    });
  });
}

/* ============================================
   FIELD ERRORS
   ============================================ */

function setFieldError(field, message) {
  const fieldEl = document.getElementById(`stock-field-${field}`);
  const errEl = document.querySelector(`[data-error="${field}"]`);
  if (fieldEl) fieldEl.classList.add('has-error');
  if (errEl) errEl.textContent = message;
}

function clearFieldError(field) {
  const fieldEl = document.getElementById(`stock-field-${field}`);
  const errEl = document.querySelector(`[data-error="${field}"]`);
  if (fieldEl) fieldEl.classList.remove('has-error');
  if (errEl) errEl.textContent = '';
}

/* ============================================
   OPEN / CLOSE
   ============================================ */

/**
 * باز کردن modal
 * @param {Object} opts
 * @param {string} opts.productId
 * @param {string} opts.productName
 * @param {Object} [opts.variant]
 * @param {Function} [opts.onSubmit] — callback با { subscribed: boolean }
 */
export async function openStockModal(opts = {}) {
  if (!modalEl) modalEl = buildModal();

  currentCtx = opts;
  onSubmit = opts.onSubmit || null;

  // رندر فرم
  await renderForm(opts);

  modalEl.classList.add('is-open');
  document.body.classList.add('stock-modal-open');

  // Focus اول
  setTimeout(() => {
    const email = document.getElementById('stock-email');
    if (email && !email.value) email.focus();
  }, 250);
}

export function closeStockModal() {
  if (!modalEl) return;
  modalEl.classList.remove('is-open');
  document.body.classList.remove('stock-modal-open');
  currentCtx = null;
  onSubmit = null;
}

/* ============================================
   HELPERS — برای استفاده در product-detail
   ============================================ */

/**
 * آیا کاربر قبلاً alert ثبت کرده؟
 */
export function isSubscribed(productId, variant) {
  const variantKey = variant
    ? `${variant.storage || ''}-${variant.ram || ''}`.replace(/^-|-$/g, '') || 'default'
    : 'default';
  return hasStockAlert(productId, variantKey);
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ Stock Alert modal ready (C.4)', 'color:#18B981;font-weight:bold;');