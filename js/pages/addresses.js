/* ============================================
   ADDRESSES PAGE
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

const SESSION_KEY = 'ms_session';
const ADDRESSES_KEY = 'ms_addresses';

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

const state = {
  editingId: null,
  deletingId: null,
};

/* ============================================
   AUTH
   ============================================ */

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function checkAuth() {
  const session = getSession();
  if (!session?.user) {
    const redirect = encodeURIComponent('account/addresses.html');
    window.location.href = `../auth/login.html?redirect=${redirect}`;
    return null;
  }
  return session.user;
}

/* ============================================
   STORAGE
   ============================================ */

function getAddresses() {
  try {
    const raw = localStorage.getItem(ADDRESSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAddresses(list) {
  try {
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Save error', e);
  }
}

/* ============================================
   HELPERS
   ============================================ */

function uid() {
  return 'addr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

function fa(n) {
  return Number(n).toLocaleString('fa-IR');
}

/* ============================================
   VALIDATORS
   ============================================ */

function isPhone(str) {
  return /^09\d{9}$/.test((str || '').replace(/\D/g, ''));
}

/* ============================================
   ERRORS
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

function clearAllErrors() {
  ['receiverName', 'receiverPhone', 'province', 'city', 'address', 'postalCode']
    .forEach(clearError);
}

/* ============================================
   RENDER
   ============================================ */

function renderAddressCard(addr) {
  const isDefault = addr.isDefault;

  const labelText = addr.label || (isDefault ? 'آدرس پیش‌فرض' : 'آدرس');

  const fullAddress = [
    addr.province,
    addr.city,
    addr.address,
    addr.plateNumber,
  ].filter(Boolean).join('، ');

  return `
    <div class="address-card ${isDefault ? 'is-default' : ''}" data-id="${addr.id}">

      <div class="address-card__head">
        <span class="address-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </span>
        <div class="address-card__titles">
          <span class="address-card__label">
            ${labelText}
            ${isDefault ? `
              <span class="address-card__badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                پیش‌فرض
              </span>
            ` : ''}
          </span>
          <span class="address-card__receiver">
            ${addr.receiverName} • ${addr.receiverPhone}
          </span>
        </div>
      </div>

      <div class="address-card__body">
        <div class="address-card__row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <div>
            <span class="address-card__row-label">آدرس</span>
            <span class="address-card__row-value">${fullAddress}</span>
          </div>
        </div>

        ${addr.postalCode ? `
          <div class="address-card__row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><polyline points="8 10 10 12 16 6"/></svg>
            <div>
              <span class="address-card__row-label">کد پستی</span>
              <span class="address-card__row-value address-card__row-value--ltr">${addr.postalCode}</span>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="address-card__foot">
        <button class="address-card__btn address-card__btn--edit" data-action="edit" data-id="${addr.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          ویرایش
        </button>

        <button
          class="address-card__btn address-card__btn--default ${isDefault ? 'is-active' : ''}"
          data-action="default"
          data-id="${addr.id}"
          ${isDefault ? 'disabled' : ''}
        >
          ${isDefault
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> پیش‌فرض`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg> تنظیم پیش‌فرض`}
        </button>

        <button class="address-card__btn address-card__btn--delete" data-action="delete" data-id="${addr.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          حذف
        </button>
      </div>

    </div>
  `;
}

function render() {
  const grid = document.getElementById('addresses-grid');
  const empty = document.getElementById('addresses-empty');
  const stats = document.getElementById('addresses-stats');

  if (!grid) return;

  const list = getAddresses();

  if (!list.length) {
    grid.innerHTML = '';
    grid.hidden = true;
    if (empty) empty.hidden = false;
    if (stats) stats.hidden = true;
    return;
  }

  grid.hidden = false;
  if (empty) empty.hidden = true;
  if (stats) stats.hidden = false;

  // Sort: default first, then by createdAt desc
  const sorted = [...list].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  grid.innerHTML = sorted.map(renderAddressCard).join('');

  // Stats
  const totalEl = document.getElementById('stat-total');
  const defaultEl = document.getElementById('stat-default');
  if (totalEl) totalEl.textContent = fa(list.length);
  if (defaultEl) {
    const def = list.find((a) => a.isDefault);
    defaultEl.textContent = def ? (def.label || def.city) : 'ندارد';
  }
}

/* ============================================
   MODAL — OPEN / CLOSE
   ============================================ */

function openModal(addressId = null) {
  const modal = document.getElementById('address-modal');
  const title = document.getElementById('modal-title');
  const submitText = document.getElementById('modal-submit-text');

  state.editingId = addressId;
  clearAllErrors();

  if (addressId) {
    const addr = getAddresses().find((a) => a.id === addressId);
    if (!addr) return;

    if (title) title.textContent = 'ویرایش آدرس';
    if (submitText) submitText.textContent = 'ذخیره تغییرات';

    // Fill form
    document.getElementById('address-id').value = addr.id;
    document.getElementById('addr-label').value = addr.label || '';
    document.getElementById('addr-receiverName').value = addr.receiverName || '';
    document.getElementById('addr-receiverPhone').value = addr.receiverPhone || '';
    document.getElementById('addr-province').value = addr.province || '';
    document.getElementById('addr-city').value = addr.city || '';
    document.getElementById('addr-address').value = addr.address || '';
    document.getElementById('addr-postalCode').value = addr.postalCode || '';
    document.getElementById('addr-plateNumber').value = addr.plateNumber || '';
    document.getElementById('addr-isDefault').checked = !!addr.isDefault;
  } else {
    if (title) title.textContent = 'افزودن آدرس جدید';
    if (submitText) submitText.textContent = 'ذخیره آدرس';

    // Reset form
    document.getElementById('address-form').reset();
    document.getElementById('address-id').value = '';

    // If first address, auto-default
    if (!getAddresses().length) {
      document.getElementById('addr-isDefault').checked = true;
    }
  }

  if (modal) modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    const first = document.getElementById('addr-label');
    if (first) first.focus();
  }, 300);
}

function closeModal() {
  const modal = document.getElementById('address-modal');
  if (modal) modal.classList.remove('is-open');
  document.body.style.overflow = '';
  state.editingId = null;
}

/* ============================================
   DELETE MODAL
   ============================================ */

function openDeleteModal(id) {
  const modal = document.getElementById('delete-modal');
  state.deletingId = id;
  if (modal) modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  const modal = document.getElementById('delete-modal');
  if (modal) modal.classList.remove('is-open');
  document.body.style.overflow = '';
  state.deletingId = null;
}

function confirmDelete() {
  if (!state.deletingId) return;

  const list = getAddresses();
  const removed = list.find((a) => a.id === state.deletingId);
  const filtered = list.filter((a) => a.id !== state.deletingId);

  // If removed was default, set first remaining as default
  if (removed?.isDefault && filtered.length) {
    filtered[0].isDefault = true;
  }

  saveAddresses(filtered);
  closeDeleteModal();
  render();

  toast({
    type: 'success',
    title: 'آدرس حذف شد',
    message: removed?.label || 'آدرس مورد نظر حذف شد',
    duration: 2500,
  });
}

/* ============================================
   SET DEFAULT
   ============================================ */

function setDefault(id) {
  const list = getAddresses();
  const updated = list.map((a) => ({
    ...a,
    isDefault: a.id === id,
  }));

  saveAddresses(updated);
  render();

  const addr = updated.find((a) => a.id === id);
  toast({
    type: 'success',
    title: 'آدرس پیش‌فرض تغییر کرد',
    message: addr?.label || 'تنظیم شد',
    duration: 2000,
  });
}

/* ============================================
   FORM SUBMIT
   ============================================ */

function validateForm() {
  clearAllErrors();

  const receiverName = document.getElementById('addr-receiverName').value.trim();
  const receiverPhone = document.getElementById('addr-receiverPhone').value.trim();
  const province = document.getElementById('addr-province').value;
  const city = document.getElementById('addr-city').value.trim();
  const address = document.getElementById('addr-address').value.trim();
  const postalCode = document.getElementById('addr-postalCode').value.trim();

  let valid = true;

  if (!receiverName || receiverName.length < 2) {
    setError('receiverName', 'نام گیرنده را وارد کنید');
    valid = false;
  }

  if (!isPhone(receiverPhone)) {
    setError('receiverPhone', 'شماره موبایل ۱۱ رقمی با ۰۹');
    valid = false;
  }

  if (!province) {
    setError('province', 'استان را انتخاب کنید');
    valid = false;
  }

  if (!city || city.length < 2) {
    setError('city', 'شهر را وارد کنید');
    valid = false;
  }

  if (!address || address.length < 10) {
    setError('address', 'آدرس کامل را وارد کنید (حداقل ۱۰ کاراکتر)');
    valid = false;
  }

  if (!/^\d{10}$/.test(postalCode)) {
    setError('postalCode', 'کد پستی باید ۱۰ رقم باشد');
    valid = false;
  }

  return valid;
}

function handleSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    const firstErr = document.querySelector('.form-field.has-error');
    if (firstErr) {
      firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    toast({
      type: 'error',
      title: 'اطلاعات ناقص',
      message: 'لطفاً خطاهای مشخص‌شده را برطرف کنید',
      duration: 3000,
    });
    return;
  }

  const submitBtn = document.getElementById('modal-submit');
  submitBtn.disabled = true;

  setTimeout(() => {
    const data = {
      id: state.editingId || uid(),
      label: document.getElementById('addr-label').value.trim() || '',
      receiverName: document.getElementById('addr-receiverName').value.trim(),
      receiverPhone: document.getElementById('addr-receiverPhone').value.trim(),
      province: document.getElementById('addr-province').value,
      city: document.getElementById('addr-city').value.trim(),
      address: document.getElementById('addr-address').value.trim(),
      postalCode: document.getElementById('addr-postalCode').value.trim(),
      plateNumber: document.getElementById('addr-plateNumber').value.trim(),
      isDefault: document.getElementById('addr-isDefault').checked,
      createdAt: new Date().toISOString(),
    };

    let list = getAddresses();

    if (state.editingId) {
      // Update
      list = list.map((a) => (a.id === state.editingId ? { ...a, ...data } : a));
    } else {
      // Add
      list.push(data);
    }

    // Handle default
    if (data.isDefault) {
      list = list.map((a) => ({
        ...a,
        isDefault: a.id === data.id,
      }));
    } else if (!list.some((a) => a.isDefault)) {
      list[list.length - 1].isDefault = true;
    }

    saveAddresses(list);
    submitBtn.disabled = false;
    closeModal();
    render();

    toast({
      type: 'success',
      title: state.editingId ? 'آدرس ویرایش شد' : 'آدرس جدید افزوده شد',
      message: data.label || data.city,
      duration: 2500,
    });
  }, 400);
}

/* ============================================
   BIND — PROVINCES
   ============================================ */

function populateProvinces() {
  const select = document.getElementById('addr-province');
  if (!select) return;

  select.innerHTML = '<option value="">انتخاب استان</option>' +
    PROVINCES.map((p) => `<option value="${p}">${p}</option>`).join('');
}

/* ============================================
   BIND — ALL
   ============================================ */

function bindEvents() {
  // Add buttons
  const addBtn = document.getElementById('add-address-btn');
  const addBtnEmpty = document.getElementById('add-address-btn-empty');

  [addBtn, addBtnEmpty].forEach((b) => {
    if (b) b.addEventListener('click', () => openModal());
  });

  // Modal close
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');
  const modal = document.getElementById('address-modal');

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalCancel) modalCancel.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Form submit
  const form = document.getElementById('address-form');
  if (form) form.addEventListener('submit', handleSubmit);

  // Input sanitize
  const phoneInput = document.getElementById('addr-receiverPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
      clearError('receiverPhone');
    });
  }

  const postalInput = document.getElementById('addr-postalCode');
  if (postalInput) {
    postalInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      clearError('postalCode');
    });
  }

  // Clear errors on input
  ['receiverName', 'city', 'address'].forEach((id) => {
    const el = document.getElementById(`addr-${id}`);
    if (el) {
      el.addEventListener('input', () => clearError(id));
    }
  });

  const province = document.getElementById('addr-province');
  if (province) {
    province.addEventListener('change', () => clearError('province'));
  }

  // Card actions (event delegation)
  const grid = document.getElementById('addresses-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === 'edit') openModal(id);
      else if (action === 'delete') openDeleteModal(id);
      else if (action === 'default') setDefault(id);
    });
  }

  // Delete modal
  const deleteCancel = document.getElementById('delete-cancel');
  const deleteConfirm = document.getElementById('delete-confirm');
  const deleteModal = document.getElementById('delete-modal');

  if (deleteCancel) deleteCancel.addEventListener('click', closeDeleteModal);
  if (deleteConfirm) deleteConfirm.addEventListener('click', confirmDelete);

  if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) closeDeleteModal();
    });
  }

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeDeleteModal();
    }
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn-sidebar');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (!confirm('آیا از خروج مطمئن هستید؟')) return;
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {}
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
}

/* ============================================
   INIT
   ============================================ */

function init() {
  const user = checkAuth();
  if (!user) return;

  populateProvinces();
  bindEvents();
  render();

  console.log(
    `%c✓ Addresses page — ${getAddresses().length} addresses`,
    'color:#18B981;font-weight:bold;'
  );
}

init();