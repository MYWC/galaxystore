/* ============================================
   CHECKOUT PAGE — with Supabase Orders
   ============================================ */

import { initLayout } from '../components/layout.js';
import { cart, onChange, KEYS } from '../store/state.js';
import { formatPrice } from '../data/products.js';
import { toast } from '../components/toast.js';
import { createOrder } from '../services/orders.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   CONSTANTS
   ============================================ */

const FREE_SHIPPING_THRESHOLD = 5000000;

const PROVINCES = [
  'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی',
  'آذربایجان غربی', 'البرز', 'گیلان', 'مازندران', 'خوزستان',
  'کرمان', 'یزد', 'قزوین', 'مرکزی', 'همدان',
  'کرمانشاه', 'گلستان', 'سیستان و بلوچستان', 'هرمزگان', 'بوشهر',
  'اردبیل', 'زنجان', 'قم', 'لرستان', 'کردستان',
  'چهارمحال و بختیاری', 'کهگیلویه و بویراحمد', 'سمنان',
  'خراسان شمالی', 'خراسان جنوبی', 'ایلام',
];

/* ============================================
   STATE
   ============================================ */

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

let isSubmitting = false;

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
   RENDER ITEMS
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
   RENDER SUMMARY
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
   RENDER
   ============================================ */

function render() {
  const items = cart.get();
  const empty = document.getElementById('checkout-empty');
  const layout = document.getElementById('checkout-layout');

  if (!items.length) {
    if (empty) empty.hidden = false;
    if (layout) layout.hidden = true;
    return;
  }

  if (empty) empty.hidden = true;
  if (layout) layout.hidden = false;

  renderItems();
  renderSummary();
}

/* ============================================
   FORM VALIDATION
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

function validateForm() {
  let valid = true;

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
   SUBMIT ORDER
   ============================================ */

async function submitOrder() {
  if (isSubmitting) return;

  if (!cart.get().length) {
    toast({
      type: 'warning',
      title: 'سبد خرید خالی است',
      duration: 2500,
    });
    return;
  }

  if (!validateForm()) {
    const firstError = document.querySelector('.form-field.has-error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    toast({
      type: 'error',
      title: 'اطلاعات ناقص است',
      message: 'لطفاً فیلدهای الزامی را تکمیل کنید',
      duration: 3000,
    });
    return;
  }

  const btn = document.getElementById('checkout-submit');
  const originalHTML = btn.innerHTML;

  isSubmitting = true;
  btn.disabled = true;
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;animation:rotateSlow 0.8s linear infinite;">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    در حال ثبت سفارش...
  `;

  const { subtotal, discount, shipping, total } = calcTotal();

  // ساخت اطلاعات سفارش
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

  try {
    const { order, saved } = await createOrder(orderData);

    toast({
      type: 'success',
      title: 'سفارش ثبت شد',
      message: `شماره سفارش: ${order.orderNumber}`,
      duration: 3500,
    });

    // پاک کردن سبد
    cart.clear();

    // هدایت به صفحه موفقیت
    setTimeout(() => {
      window.location.href = `success.html?order=${order.orderNumber}`;
    }, 1000);

  } catch (err) {
    console.error('Submit order error:', err);

    isSubmitting = false;
    btn.disabled = false;
    btn.innerHTML = originalHTML;

    toast({
      type: 'error',
      title: 'خطا در ثبت سفارش',
      message: 'لطفاً دوباره تلاش کنید',
      duration: 3500,
    });
  }
}

/* ============================================
   BIND SUBMIT
   ============================================ */

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
  bindSubmit();

  onChange(KEYS.cart, render);

  console.log('%c✓ Checkout page loaded', 'color:#18B981;font-weight:bold;');
}

init();