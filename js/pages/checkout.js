/* ============================================
   CHECKOUT PAGE — Multi-step Wizard (B.7)
   with Supabase Orders + Button Loading (A.6)
   ============================================ */

import { initLayout } from '../components/layout.js';
import { cart, onChange, KEYS } from '../store/state.js';
import { formatPrice } from '../data/products.js';
import { toast } from '../components/toast.js';
import { createOrder } from '../services/orders.js';
import { withButtonLoading } from '../utils/button-loading.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   CONSTANTS
   ============================================ */

const FREE_SHIPPING_THRESHOLD = 5000000;
const TOTAL_STEPS = 3;

const PROVINCES = [
  'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی',
  'آذربایجان غربی', 'البرز', 'گیلان', 'مازندران', 'خوزستان',
  'کرمان', 'یزد', 'قزوین', 'مرکزی', 'همدان',
  'کرمانشاه', 'گلستان', 'سیستان و بلوچستان', 'هرمزگان', 'بوشهر',
  'اردبیل', 'زنجان', 'قم', 'لرستان', 'کردستان',
  'چهارمحال و بختیاری', 'کهگیلویه و بویراحمد', 'سمنان',
  'خراسان شمالی', 'خراسان جنوبی', 'ایلام',
];

const SHIPPING_LABELS = {
  express: 'ارسال سریع (پست پیشتاز)',
  normal: 'ارسال عادی (پست سفارشی)',
  sameDay: 'ارسال همان روز (تهران)',
};

const PAYMENT_LABELS = {
  online: 'پرداخت آنلاین (زرین‌پال)',
  cod: 'پرداخت در محل',
  wallet: 'کیف پول موبایل استور',
};

/* ============================================
   STATE
   ============================================ */

const state = {
  currentStep: 1,
  submitting: false,
};

const formData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  province: '',
  city: '',
  address: '',
  postalCode: '',
  plateNumber: '',
  shipping: 'express',
  payment: 'online',
  note: '',
};

/* ============================================
   HELPERS
   ============================================ */

function calcSubtotal(items) {
  return items.reduce((sum, i) => sum + (i.oldPrice || i.price) * i.qty, 0);
}

function calcDiscount(items) {
  return items.reduce((sum, i) => {
    if (i.oldPrice && i.oldPrice > i.price) {
      return sum + (i.oldPrice - i.price) * i.qty;
    }
    return sum;
  }, 0);
}

function getShippingPrice() {
  const input = document.querySelector('input[name="shipping"]:checked');
  if (!input) return 0;

  const items = cart.get();
  const subtotal = calcSubtotal(items) - calcDiscount(items);

  if (input.value === 'express' && subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return Number(input.dataset.price) || 0;
}

function calcTotal() {
  const items = cart.get();
  const subtotal = calcSubtotal(items);
  const discount = calcDiscount(items);
  const shipping = getShippingPrice();
  const total = subtotal - discount + shipping;

  return { subtotal, discount, shipping, total };
}

/* ============================================
   RENDER — ITEMS
   ============================================ */

function renderItems() {
  const wrap = document.getElementById('checkout-items');
  const count = document.getElementById('summary-count');
  if (!wrap) return;

  const items = cart.get();

  if (count) {
    const qty = items.reduce((sum, i) => sum + i.qty, 0);
    count.textContent = qty.toLocaleString('fa-IR');
  }

  wrap.innerHTML = items.map((item) => {
    const productId = item.id.split('-').slice(0, -1).join('-');
    const imgSrc = item.image || `assets/images/products/${productId}.jpg`;

    const specs = [item.storage, item.ram, item.color].filter(Boolean).join(' • ');

    return `
      <div class="checkout-item">
        <div class="checkout-item__img">
          <img src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'ph ph--square\\'>تصویر</div>';" />
          <span class="checkout-item__qty">${item.qty}</span>
        </div>
        <div class="checkout-item__info">
          <span class="checkout-item__name">${item.name}</span>
          ${specs ? `<span class="checkout-item__specs">${specs}</span>` : ''}
        </div>
        <span class="checkout-item__price">
          ${formatPrice(item.price * item.qty)} تومان
        </span>
      </div>
    `;
  }).join('');
}

/* ============================================
   RENDER — SUMMARY
   ============================================ */

function renderSummary() {
  const { subtotal, discount, shipping, total } = calcTotal();

  const subEl = document.getElementById('co-subtotal');
  if (subEl) subEl.textContent = `${formatPrice(subtotal)} تومان`;

  const disRow = document.getElementById('co-row-discount');
  const disEl = document.getElementById('co-discount');
  if (discount > 0) {
    if (disRow) disRow.hidden = false;
    if (disEl) disEl.textContent = `${formatPrice(discount)}− تومان`;
  } else {
    if (disRow) disRow.hidden = true;
  }

  const shipEl = document.getElementById('co-shipping');
  if (shipEl) {
    if (shipping === 0) {
      shipEl.innerHTML = `<span style="color:var(--success);font-weight:var(--fw-bold);">رایگان</span>`;
    } else {
      shipEl.textContent = `${formatPrice(shipping)} تومان`;
    }
  }

  const totalEl = document.getElementById('co-total');
  if (totalEl) totalEl.textContent = formatPrice(total);

  const savingsWrap = document.getElementById('co-savings');
  const savingsEl = document.getElementById('co-savings-value');
  const totalSavings = discount + (shipping === 0 ? 250000 : 0);
  if (totalSavings > 0) {
    if (savingsWrap) savingsWrap.hidden = false;
    if (savingsEl) savingsEl.textContent = formatPrice(totalSavings);
  } else {
    if (savingsWrap) savingsWrap.hidden = true;
  }
}

/* ============================================
   RENDER — REVIEW (Step 3)
   ============================================ */

function renderReview() {
  const wrap = document.getElementById('checkout-review');
  if (!wrap) return;

  const addressParts = [
    formData.province,
    formData.city,
    formData.address,
    formData.plateNumber,
  ].filter(Boolean);

  wrap.innerHTML = `
    <div class="review-block">
      <div class="review-block__head">
        <span class="review-block__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          اطلاعات تماس
        </span>
        <button type="button" class="review-block__edit" data-goto-step="1">ویرایش</button>
      </div>
      <div class="review-block__body">
        <p><strong>${formData.firstName} ${formData.lastName}</strong></p>
        <p dir="ltr" style="text-align: right;">${formData.phone}</p>
        ${formData.email ? `<p dir="ltr" style="text-align: right;">${formData.email}</p>` : ''}
      </div>
    </div>

    <div class="review-block">
      <div class="review-block__head">
        <span class="review-block__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          آدرس ارسال
        </span>
        <button type="button" class="review-block__edit" data-goto-step="1">ویرایش</button>
      </div>
      <div class="review-block__body">
        <p>${addressParts.join('، ')}</p>
        <p>کد پستی: <span dir="ltr">${formData.postalCode}</span></p>
      </div>
    </div>

    <div class="review-block">
      <div class="review-block__head">
        <span class="review-block__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          روش ارسال
        </span>
        <button type="button" class="review-block__edit" data-goto-step="2">ویرایش</button>
      </div>
      <div class="review-block__body">
        <p>${SHIPPING_LABELS[formData.shipping] || '—'}</p>
      </div>
    </div>

    <div class="review-block">
      <div class="review-block__head">
        <span class="review-block__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          روش پرداخت
        </span>
        <button type="button" class="review-block__edit" data-goto-step="3">ویرایش</button>
      </div>
      <div class="review-block__body">
        <p>${PAYMENT_LABELS[formData.payment] || '—'}</p>
      </div>
    </div>

    ${formData.note ? `
      <div class="review-block">
        <div class="review-block__head">
          <span class="review-block__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            یادداشت
          </span>
        </div>
        <div class="review-block__body">
          <p>${formData.note}</p>
        </div>
      </div>
    ` : ''}
  `;

  // Edit buttons
  wrap.querySelectorAll('[data-goto-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = Number(btn.dataset.gotoStep);
      goToStep(step);
    });
  });
}

/* ============================================
   RENDER — FULL
   ============================================ */

function render() {
  const items = cart.get();
  const empty = document.getElementById('checkout-empty');
  const layout = document.getElementById('checkout-layout');
  const stepsEl = document.getElementById('checkout-steps');

  if (!items.length) {
    if (empty) empty.hidden = false;
    if (layout) layout.hidden = true;
    if (stepsEl) stepsEl.hidden = true;
    return;
  }

  if (empty) empty.hidden = true;
  if (layout) layout.hidden = false;
  if (stepsEl) stepsEl.hidden = false;

  renderItems();
  renderSummary();
  renderReview();
}

/* ============================================
   WIZARD — NAVIGATION
   ============================================ */

function updateStepUI() {
  // Indicators
  document.querySelectorAll('[data-step-indicator]').forEach((el) => {
    const stepNum = Number(el.dataset.stepIndicator);
    el.classList.toggle('is-active', stepNum === state.currentStep);
    el.classList.toggle('is-done', stepNum < state.currentStep);
  });

  // Step lines
  const lines = document.querySelectorAll('.checkout-step__line');
  lines.forEach((line, i) => {
    line.classList.toggle('is-done', i + 1 < state.currentStep);
  });

  // Panels
  document.querySelectorAll('.checkout-wizard-step').forEach((panel) => {
    panel.classList.toggle('is-active', Number(panel.dataset.step) === state.currentStep);
  });

  // Buttons
  const backBtn = document.getElementById('wizard-back');
  const nextBtn = document.getElementById('wizard-next');
  const submitBtn = document.getElementById('checkout-submit');

  if (backBtn) backBtn.hidden = state.currentStep === 1;

  if (nextBtn) {
    if (state.currentStep === TOTAL_STEPS) {
      nextBtn.hidden = true;
    } else {
      nextBtn.hidden = false;
      const label = nextBtn.querySelector('span');
      if (label) label.textContent = 'مرحله بعد';
    }
  }

  if (submitBtn) {
    submitBtn.hidden = state.currentStep !== TOTAL_STEPS;
  }

  // Scroll to top of wizard
  const wizardTop = document.getElementById('checkout-steps');
  if (wizardTop) {
    const offset = 100;
    const top = wizardTop.getBoundingClientRect().top + window.scrollY - offset;
    if (Math.abs(window.scrollY - top) > 50) {
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}

function goToStep(step) {
  if (step < 1 || step > TOTAL_STEPS) return;

  // اگه جلو می‌ریم، ولیدیت کن
  if (step > state.currentStep) {
    for (let s = state.currentStep; s < step; s++) {
      if (!validateStep(s)) {
        toast({
          type: 'error',
          title: 'اطلاعات ناقص',
          message: 'لطفاً خطاهای این مرحله را برطرف کنید',
          duration: 3000,
        });
        return;
      }
    }
  }

  state.currentStep = step;
  updateStepUI();

  // پاک کردن خطاهای مرحله بعد
  if (step === 3) {
    renderReview();
  }
}

function goNext() {
  if (state.currentStep >= TOTAL_STEPS) return;
  goToStep(state.currentStep + 1);
}

function goBack() {
  if (state.currentStep <= 1) return;
  state.currentStep -= 1;
  updateStepUI();
}

/* ============================================
   VALIDATION
   ============================================ */

function setError(fieldName, message) {
  const field = document.getElementById(fieldName)?.closest('.form-field');
  const errEl = document.querySelector(`[data-error="${fieldName}"]`);
  if (field) field.classList.add('has-error');
  if (errEl) errEl.textContent = message;
}

function clearError(fieldName) {
  const field = document.getElementById(fieldName)?.closest('.form-field');
  const errEl = document.querySelector(`[data-error="${fieldName}"]`);
  if (field) field.classList.remove('has-error');
  if (errEl) errEl.textContent = '';
}

function validateStep(step) {
  let valid = true;

  if (step === 1) {
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      setError('firstName', 'نام را وارد کنید (حداقل ۲ کاراکتر)');
      valid = false;
    } else clearError('firstName');

    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      setError('lastName', 'نام خانوادگی را وارد کنید');
      valid = false;
    } else clearError('lastName');

    if (!/^09\d{9}$/.test(formData.phone)) {
      setError('phone', 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد');
      valid = false;
    } else clearError('phone');

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('email', 'ایمیل معتبر نیست');
      valid = false;
    } else clearError('email');

    if (!formData.province) {
      setError('province', 'استان را انتخاب کنید');
      valid = false;
    } else clearError('province');

    if (!formData.city.trim() || formData.city.trim().length < 2) {
      setError('city', 'شهر را وارد کنید');
      valid = false;
    } else clearError('city');

    if (!formData.address.trim() || formData.address.trim().length < 10) {
      setError('address', 'آدرس کامل را وارد کنید (حداقل ۱۰ کاراکتر)');
      valid = false;
    } else clearError('address');

    if (!/^\d{10}$/.test(formData.postalCode)) {
      setError('postalCode', 'کد پستی باید ۱۰ رقم باشد');
      valid = false;
    } else clearError('postalCode');
  }

  // Step 2 و Step 3 نیازی به validation جداگانه ندارن
  // (shipping و payment همیشه یه گزینه انتخاب شده دارن)

  if (!valid) {
    // Scroll to first error
    const firstError = document.querySelector('.form-field.has-error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return valid;
}

/* ============================================
   BIND FORM
   ============================================ */

function bindForm() {
  const inputs = [
    'firstName', 'lastName', 'phone', 'email', 'city', 'postalCode', 'plateNumber',
  ];

  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('input', (e) => {
      formData[id] = e.target.value;

      if (id === 'phone' || id === 'postalCode') {
        e.target.value = e.target.value.replace(/\D/g, '');
        formData[id] = e.target.value;
      }

      clearError(id);
    });
  });

  const addressEl = document.getElementById('address');
  if (addressEl) {
    addressEl.addEventListener('input', (e) => {
      formData.address = e.target.value;
      clearError('address');
    });
  }

  const noteEl = document.getElementById('orderNote');
  if (noteEl) {
    noteEl.addEventListener('input', (e) => {
      formData.note = e.target.value;
    });
  }

  const provEl = document.getElementById('province');
  if (provEl) {
    provEl.innerHTML = '<option value="">انتخاب استان</option>' +
      PROVINCES.map((p) => `<option value="${p}">${p}</option>`).join('');

    provEl.addEventListener('change', (e) => {
      formData.province = e.target.value;
      clearError('province');
    });
  }

  const shippingWrap = document.getElementById('shipping-options');
  if (shippingWrap) {
    shippingWrap.addEventListener('change', (e) => {
      const input = e.target.closest('input[name="shipping"]');
      if (!input) return;

      shippingWrap.querySelectorAll('.shipping-option').forEach((o) => o.classList.remove('is-selected'));
      input.closest('.shipping-option').classList.add('is-selected');

      formData.shipping = input.value;
      renderSummary();
    });
  }

  const payWrap = document.getElementById('payment-options');
  if (payWrap) {
    payWrap.addEventListener('change', (e) => {
      const input = e.target.closest('input[name="payment"]');
      if (!input) return;

      payWrap.querySelectorAll('.payment-option').forEach((o) => o.classList.remove('is-selected'));
      input.closest('.payment-option').classList.add('is-selected');

      formData.payment = input.value;
    });
  }
}

/* ============================================
   BIND WIZARD
   ============================================ */

function bindWizard() {
  const nextBtn = document.getElementById('wizard-next');
  const backBtn = document.getElementById('wizard-back');

  if (nextBtn) nextBtn.addEventListener('click', goNext);
  if (backBtn) backBtn.addEventListener('click', goBack);

  // Enter key در input ها → مرحله بعد
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (state.currentStep >= TOTAL_STEPS) return;

    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT')) {
      e.preventDefault();
      goNext();
    }
  });
}

/* ============================================
   SUBMIT ORDER
   ============================================ */

async function submitOrder() {
  if (state.submitting) return;

  if (!cart.get().length) {
    toast({
      type: 'warning',
      title: 'سبد خرید خالی است',
      duration: 2500,
    });
    return;
  }

  // Validate all steps
  for (let s = 1; s <= TOTAL_STEPS; s++) {
    if (!validateStep(s)) {
      goToStep(s);
      toast({
        type: 'error',
        title: 'اطلاعات ناقص',
        message: 'لطفاً خطاهای مشخص‌شده را برطرف کنید',
        duration: 3000,
      });
      return;
    }
  }

  const btn = document.getElementById('checkout-submit');
  if (!btn) return;

  state.submitting = true;

  const { subtotal, discount, shipping, total } = calcTotal();

  const orderData = {
    customer: {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
    },
    shipping: {
      province: formData.province,
      city: formData.city.trim(),
      address: formData.address.trim(),
      postalCode: formData.postalCode.trim(),
      plateNumber: formData.plateNumber.trim(),
      method: formData.shipping,
    },
    items: cart.get(),
    payment: formData.payment,
    note: formData.note.trim(),
    subtotal,
    discount,
    shippingFee: shipping,
    total,
  };

  await withButtonLoading(btn, async () => {
    try {
      const { order } = await createOrder(orderData);

      toast({
        type: 'success',
        title: 'سفارش ثبت شد',
        message: `شماره سفارش: ${order.orderNumber}`,
        duration: 3500,
      });

      cart.clear();

      setTimeout(() => {
        window.location.href = `success.html?order=${order.orderNumber}`;
      }, 1000);

    } catch (err) {
      console.error('Submit order error:', err);

      state.submitting = false;

      toast({
        type: 'error',
        title: 'خطا در ثبت سفارش',
        message: 'لطفاً دوباره تلاش کنید',
        duration: 3500,
      });
    }
  });
}

function bindSubmit() {
  const btn = document.getElementById('checkout-submit');
  if (!btn) return;

  btn.addEventListener('click', submitOrder);
}

/* ============================================
   INIT
   ============================================ */

function init() {
  render();
  bindForm();
  bindWizard();
  bindSubmit();
  updateStepUI();

  onChange(KEYS.cart, render);

  console.log('%c✓ Checkout page loaded (B.7 — Multi-step)', 'color:#18B981;font-weight:bold;');
}

init();