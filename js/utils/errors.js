/* ============================================
   ERROR HANDLING SYSTEM — Phase A.3
   Central error translation, retry logic, network detection
   ============================================ */

import { toast } from '../components/toast.js';

/* ============================================
   1. ERROR TRANSLATIONS (فارسی)
   ============================================ */

const ERROR_MESSAGES = {
  // Network
  'Failed to fetch': 'اتصال به سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.',
  'NetworkError': 'خطای شبکه — لطفاً اتصال اینترنت خود را بررسی کنید.',
  'Network request failed': 'درخواست شبکه با خطا مواجه شد.',
  'ECONNREFUSED': 'اتصال به سرور رد شد.',
  'ETIMEDOUT': 'زمان اتصال به سرور به پایان رسید.',
  'timeout': 'زمان درخواست به پایان رسید.',
  'The operation was aborted': 'عملیات لغو شد.',
  'AbortError': 'درخواست لغو شد.',
  'Load failed': 'بارگذاری اطلاعات ناموفق بود.',
  'net::ERR_CONNECTION_RESET': 'اتصال اینترنت شما قطع شده است.',

  // Supabase / Postgres
  'JWT expired': 'نشست شما منقضی شده — لطفاً دوباره وارد شوید.',
  'Invalid login credentials': 'ایمیل یا رمز عبور اشتباه است.',
  'Email not confirmed': 'ایمیل شما هنوز تأیید نشده است.',
  'User already registered': 'این ایمیل قبلاً ثبت‌نام کرده است.',
  'Password should be at least 6 characters': 'رمز عبور باید حداقل ۶ کاراکتر باشد.',
  'Unable to validate email address': 'ایمیل معتبر نیست.',
  'Invalid email': 'ایمیل معتبر نیست.',
  'signup is disabled': 'ثبت‌نام در حال حاضر غیرفعال است.',
  'Email rate limit exceeded': 'تعداد درخواست‌ها زیاد است، بعداً امتحان کنید.',
  'For security purposes, you can only request this once every 60 seconds': 'برای امنیت، هر ۶۰ ثانیه یکبار می‌توانید درخواست دهید.',
  'permission denied': 'شما به این اطلاعات دسترسی ندارید.',
  'row-level security policy': 'دسترسی شما به این اطلاعات محدود است.',
  'duplicate key value': 'این اطلاعات قبلاً ثبت شده است.',
  'violates foreign key constraint': 'اطلاعات مرتبط یافت نشد.',
  'relation does not exist': 'ساختار دیتابیس نامعتبر است.',
  'column does not exist': 'ستون موردنظر در دیتابیس پیدا نشد.',
  'value too long': 'مقدار وارد شده بیش از حد طولانی است.',
  'null value in column': 'فیلد الزامی خالی است.',
  'invalid input syntax': 'فرمت داده وارد شده معتبر نیست.',
  'too many requests': 'تعداد درخواست‌ها زیاد است، لطفاً کمی صبر کنید.',

  // HTTP Status
  400: 'درخواست نامعتبر است.',
  401: 'برای انجام این کار باید وارد شوید.',
  403: 'شما به این بخش دسترسی ندارید.',
  404: 'موردی که می‌خواستید پیدا نشد.',
  408: 'زمان درخواست به پایان رسید.',
  409: 'تداخل در اطلاعات — لطفاً دوباره تلاش کنید.',
  422: 'اطلاعات وارد شده صحیح نیست.',
  429: 'تعداد درخواست‌ها زیاد است، کمی صبر کنید.',
  500: 'خطای داخلی سرور — لطفاً بعداً تلاش کنید.',
  502: 'سرویس موقتاً در دسترس نیست.',
  503: 'سرویس در حال تعمیر است.',
  504: 'پاسخی از سرور دریافت نشد.',

  // Generic
  'Something went wrong': 'مشکلی پیش آمد — لطفاً دوباره تلاش کنید.',
  'Unknown error': 'خطای ناشناخته رخ داد.',
  'Unexpected error': 'خطای غیرمنتظره رخ داد.',
};

/* ============================================
   2. TRANSLATE ERROR
   ============================================ */

/**
 * ترجمه پیام خطا به فارسی
 * @param {Error|string|Object} err
 * @returns {string}
 */
export function translateError(err) {
  if (!err) return ERROR_MESSAGES['Unknown error'];

  // If string
  if (typeof err === 'string') {
    return matchMessage(err);
  }

  // If Error object
  if (err.message) {
    return matchMessage(err.message);
  }

  // If Supabase error object
  if (err.error_description) {
    return matchMessage(err.error_description);
  }

  if (err.error) {
    return matchMessage(err.error);
  }

  return ERROR_MESSAGES['Unknown error'];
}

function matchMessage(message) {
  if (!message) return ERROR_MESSAGES['Unknown error'];

  const msg = String(message).trim();

  // Exact match
  if (ERROR_MESSAGES[msg]) return ERROR_MESSAGES[msg];

  // Numeric status
  const num = parseInt(msg, 10);
  if (!isNaN(num) && ERROR_MESSAGES[num]) return ERROR_MESSAGES[num];

  // Partial match
  for (const key in ERROR_MESSAGES) {
    if (typeof key === 'string' && msg.toLowerCase().includes(key.toLowerCase())) {
      return ERROR_MESSAGES[key];
    }
  }

  // JWT-related
  if (/jwt|token|session/i.test(msg)) {
    return ERROR_MESSAGES['JWT expired'];
  }

  // Network-related
  if (/network|fetch|connection/i.test(msg)) {
    return ERROR_MESSAGES['Network request failed'];
  }

  // Timeout
  if (/timeout|timed out/i.test(msg)) {
    return ERROR_MESSAGES['timeout'];
  }

  // Default — return original message if short and readable, otherwise generic
  if (msg.length < 100 && !/^[0-9]+$/.test(msg)) {
    return msg;
  }

  return ERROR_MESSAGES['Something went wrong'];
}

/* ============================================
   3. HANDLE ERROR (with toast)
   ============================================ */

/**
 * مدیریت خطا + نمایش toast
 * @param {Error|string|Object} err
 * @param {Object} options
 * @param {string} [options.title='خطا']
 * @param {boolean} [options.showToast=true]
 * @param {string} [options.context] - توضیح زمینه خطا
 * @param {Function} [options.onRetry] - callback برای retry
 * @returns {{ message: string, original: any }}
 */
export function handleError(err, options = {}) {
  const {
    title = 'خطا',
    showToast = true,
    context = '',
    onRetry = null,
  } = options;

  // Log to console in dev
  if (process?.env?.NODE_ENV !== 'production') {
    console.error('[Error]', context, err);
  }

  const message = translateError(err);

  if (showToast) {
    const toastOptions = {
      type: 'error',
      title,
      message,
      duration: 5000,
      position: 'top-left',
    };

    if (onRetry) {
      toastOptions.action = {
        label: 'تلاش دوباره',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
        onClick: onRetry,
      };
    }

    toast(toastOptions);
  }

  return { message, original: err };
}

/* ============================================
   4. SAFE ASYNC WRAPPER
   ============================================ */

/**
 * اجرای امن یه async function با مدیریت خطا
 * @param {Function} fn
 * @param {Object} options
 * @returns {Promise<{ data?: any, error?: any }>}
 */
export async function safeAsync(fn, options = {}) {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    const { message } = handleError(err, {
      title: options.title || 'خطا',
      showToast: options.showToast !== false,
      context: options.context,
      onRetry: options.onRetry,
    });
    return { data: null, error: { message, original: err } };
  }
}

/* ============================================
   5. RETRY WITH EXPONENTIAL BACKOFF
   ============================================ */

/**
 * تلاش مجدد خودکار با تأخیر تدریجی
 * @param {Function} fn - تابع async
 * @param {Object} options
 * @returns {Promise<any>}
 */
export async function retryAsync(fn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 500,
    maxDelay = 5000,
    onAttempt = null,
    shouldRetry = () => true,
  } = options;

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (onAttempt) onAttempt(attempt, maxAttempts);
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt >= maxAttempts || !shouldRetry(err, attempt)) {
        throw err;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 200,
        maxDelay
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/* ============================================
   6. NETWORK STATUS
   ============================================ */

let networkListeners = [];

/**
 * تشخیص قطع/وصل شدن اینترنت
 */
export function initNetworkDetection() {
  if (!('onLine' in navigator)) return;

  const showOfflineBanner = () => {
    if (document.getElementById('offline-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.className = 'offline-banner';
    banner.innerHTML = `
      <div class="offline-banner__inner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
          <line x1="12" y1="20" x2="12.01" y2="20"/>
        </svg>
        <span>اینترنت شما قطع است — برخی امکانات در دسترس نیست</span>
      </div>
    `;
    document.body.appendChild(banner);

    requestAnimationFrame(() => {
      banner.classList.add('is-visible');
    });
  };

  const hideOfflineBanner = () => {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;

    banner.classList.remove('is-visible');
    setTimeout(() => banner.remove(), 400);
  };

  const handleOnline = () => {
    hideOfflineBanner();
    toast({
      type: 'success',
      title: 'اینترنت شما وصل شد',
      message: 'همه‌چیز به حالت عادی برگشت',
      duration: 2500,
    });
    networkListeners.forEach((cb) => cb(true));
  };

  const handleOffline = () => {
    showOfflineBanner();
    networkListeners.forEach((cb) => cb(false));
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  if (!navigator.onLine) showOfflineBanner();

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export function isOnline() {
  return navigator.onLine !== false;
}

export function onNetworkChange(cb) {
  networkListeners.push(cb);
  return () => {
    networkListeners = networkListeners.filter((fn) => fn !== cb);
  };
}

/* ============================================
   7. OFFLINE BANNER CSS (inline)
   ============================================ */

const OFFLINE_STYLES = `
  .offline-banner {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 99998;
    transform: translate3d(0, -100%, 0);
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
  }

  .offline-banner.is-visible {
    transform: translate3d(0, 0, 0);
  }

  .offline-banner__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #EF5350, #D84343);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    box-shadow: 0 4px 20px -4px rgba(239, 83, 80, 0.5);
  }

  .offline-banner__inner svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    .offline-banner__inner {
      font-size: 11px;
      padding: 8px 14px;
    }

    .offline-banner__inner svg {
      width: 14px;
      height: 14px;
    }
  }
`;

function injectOfflineStyles() {
  if (document.getElementById('offline-banner-styles')) return;

  const style = document.createElement('style');
  style.id = 'offline-banner-styles';
  style.textContent = OFFLINE_STYLES;
  document.head.appendChild(style);
}

/* ============================================
   8. GLOBAL ERROR HANDLER
   ============================================ */

export function initGlobalErrorHandler() {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;

    // Ignore aborted fetches (normal on navigation)
    if (reason?.name === 'AbortError') return;

    // Ignore Supabase auth errors (already handled elsewhere)
    if (reason?.message?.includes('Auth session missing')) return;

    console.error('[Unhandled Rejection]', reason);

    // Show a subtle toast in production only
    if (isOnline()) {
      toast({
        type: 'error',
        title: 'خطای غیرمنتظره',
        message: translateError(reason),
        duration: 4000,
      });
    }

    // Prevent default console error spam
    // event.preventDefault();
  });

  // Uncaught exceptions
  window.addEventListener('error', (event) => {
    // Ignore resource load errors (images, etc.)
    if (event.target && event.target !== window) return;

    console.error('[Uncaught Error]', event.error);
  });
}

/* ============================================
   9. INIT ALL
   ============================================ */

export function initErrorSystem() {
  injectOfflineStyles();
  initNetworkDetection();
  initGlobalErrorHandler();

  console.log('%c✓ Error system ready (Phase A.3)', 'color:#18B981;font-weight:bold;');
}

/* ============================================
   10. USER-FRIENDLY API WRAPPER
   ============================================ */

/**
 * Wrapper برای Supabase queries با retry + error handling
 * @param {Function} queryFn - تابع async که query رو اجرا می‌کنه
 * @param {Object} options
 * @returns {Promise<{ data, error, message }>}
 */
export async function withRetry(queryFn, options = {}) {
  const {
    maxAttempts = 3,
    title = 'خطا در دریافت اطلاعات',
    showToast = true,
    context = '',
  } = options;

  try {
    const result = await retryAsync(queryFn, {
      maxAttempts,
      shouldRetry: (err) => {
        // Retry on network errors only
        const msg = err?.message || '';
        return /network|fetch|timeout|connection/i.test(msg);
      },
    });

    // Supabase returns { data, error } — check error
    if (result?.error) {
      const message = translateError(result.error);
      if (showToast) {
        toast({
          type: 'error',
          title,
          message,
          duration: 4500,
        });
      }
      return { data: null, error: result.error, message };
    }

    return { data: result?.data ?? result, error: null, message: null };
  } catch (err) {
    return handleError(err, { title, showToast, context });
  }
}

/* ============================================
   11. LOG
   ============================================ */

console.log('%c✓ Error utilities loaded (Phase A.3)', 'color:#18B981;font-weight:bold;');