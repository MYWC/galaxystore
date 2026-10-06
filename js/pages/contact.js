/* ============================================
   CONTACT PAGE
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

const PHONE_NUMBER = '09362582236';
const PHONE_NUMBER_FA = '۰۹۳۶۲۵۸۲۲۳۶';
const MAX_MESSAGE_LENGTH = 1000;

/* ============================================
   MESSENGER HANDLERS
   ============================================ */

async function handleMessenger(type) {
  const messages = {
    rubika: {
      title: 'پشتیبانی در روبیکا',
      text: `لطفاً در اپلیکیشن روبیکا، شماره زیر را جستجو کنید:\n${PHONE_NUMBER_FA}`,
    },
    bale: {
      title: 'پشتیبانی در بله',
      text: `لطفاً در اپلیکیشن بله، شماره زیر را جستجو کنید:\n${PHONE_NUMBER_FA}`,
    },
  };

  const msg = messages[type];
  if (!msg) return;

  // Try to copy the number to clipboard
  let copied = false;
  try {
    await navigator.clipboard.writeText(PHONE_NUMBER);
    copied = true;
  } catch {
    copied = false;
  }

  toast({
    type: 'info',
    title: msg.title,
    message: copied
      ? `شماره ${PHONE_NUMBER_FA} کپی شد — در اپلیکیشن جستجو کنید`
      : msg.text,
    duration: 5000,
  });
}

/* ============================================
   FORM VALIDATION
   ============================================ */

function isPhone(str) {
  return /^09\d{9}$/.test((str || '').replace(/\D/g, ''));
}

function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
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
  ['name', 'phone', 'email', 'subject', 'message'].forEach(clearError);
}

/* ============================================
   FORM SUBMIT
   ============================================ */

function handleSubmit(e) {
  e.preventDefault();
  clearAllErrors();

  const name = document.getElementById('c-name').value.trim();
  const phone = document.getElementById('c-phone').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const subject = document.getElementById('c-subject').value;
  const message = document.getElementById('c-message').value.trim();

  let valid = true;

  if (!name || name.length < 3) {
    setError('name', 'نام و نام خانوادگی را کامل وارد کنید');
    valid = false;
  }

  if (!isPhone(phone)) {
    setError('phone', 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
    valid = false;
  }

  if (email && !isEmail(email)) {
    setError('email', 'ایمیل معتبر نیست');
    valid = false;
  }

  if (!subject) {
    setError('subject', 'موضوع پیام را انتخاب کنید');
    valid = false;
  }

  if (!message || message.length < 10) {
    setError('message', 'متن پیام حداقل ۱۰ کاراکتر باشد');
    valid = false;
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    setError('message', `متن پیام بیش از ${MAX_MESSAGE_LENGTH} کاراکتر است`);
    valid = false;
  }

  if (!valid) {
    const firstError = document.querySelector('.form-field.has-error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    toast({
      type: 'error',
      title: 'اطلاعات ناقص',
      message: 'لطفاً فیلدهای مشخص‌شده را اصلاح کنید',
      duration: 3000,
    });
    return;
  }

  const btn = document.getElementById('contact-submit');
  btn.classList.add('is-loading');
  btn.disabled = true;

  // Simulate server request
  setTimeout(() => {
    // Save message to localStorage (آینده: Supabase)
    try {
      const messages = JSON.parse(localStorage.getItem('ms_contact_messages') || '[]');
      messages.unshift({
        id: 'msg-' + Date.now(),
        name,
        phone,
        email,
        subject,
        message,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('ms_contact_messages', JSON.stringify(messages.slice(0, 50)));
    } catch {}

    showSuccess();
  }, 900);
}

/* ============================================
   SUCCESS STATE
   ============================================ */

function showSuccess() {
  const wrap = document.querySelector('.contact-form-wrap');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="contact-success">
      <div class="contact-success__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 class="contact-success__title">پیام شما ارسال شد! 🎉</h2>
      <p class="contact-success__text">
        از تماس شما سپاسگزاریم. تیم پشتیبانی ما در اولین فرصت با شما تماس خواهد گرفت.
        معمولاً در کمتر از ۲ ساعت پاسخ داده می‌شود.
      </p>
      <a href="contact.html" class="contact-success__btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
        ارسال پیام دیگر
      </a>
    </div>
  `;

  toast({
    type: 'success',
    title: 'پیام ارسال شد',
    message: 'به‌زودی با شما تماس می‌گیریم',
    duration: 3500,
  });
}

/* ============================================
   MESSAGE COUNTER
   ============================================ */

function initMessageCounter() {
  const textarea = document.getElementById('c-message');
  const counter = document.getElementById('message-counter');
  if (!textarea || !counter) return;

  const update = () => {
    const len = textarea.value.length;
    counter.textContent = len.toLocaleString('fa-IR');

    counter.classList.toggle('is-near-limit', len > MAX_MESSAGE_LENGTH * 0.85 && len <= MAX_MESSAGE_LENGTH);
    counter.classList.toggle('is-over-limit', len > MAX_MESSAGE_LENGTH);
  };

  textarea.addEventListener('input', update);
  update();
}

/* ============================================
   BIND INPUTS
   ============================================ */

function bindInputs() {
  // Phone sanitize
  const phone = document.getElementById('c-phone');
  if (phone) {
    phone.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
      clearError('phone');
    });
  }

  // Clear errors on other inputs
  ['name', 'email', 'message'].forEach((id) => {
    const el = document.getElementById(`c-${id}`);
    if (el) {
      el.addEventListener('input', () => clearError(id));
    }
  });

  const subject = document.getElementById('c-subject');
  if (subject) {
    subject.addEventListener('change', () => clearError('subject'));
  }
}

/* ============================================
   BIND MESSENGERS
   ============================================ */

function bindMessengers() {
  document.querySelectorAll('[data-messenger]').forEach((btn) => {
    btn.addEventListener('click', () => {
      handleMessenger(btn.dataset.messenger);
    });
  });
}

/* ============================================
   INIT
   ============================================ */

function init() {
  const form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', handleSubmit);

  initMessageCounter();
  bindInputs();
  bindMessengers();

  console.log('%c✓ Contact page loaded', 'color:#18B981;font-weight:bold;');
}

init();