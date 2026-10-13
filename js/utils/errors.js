/* ============================================
   ERROR HANDLING SYSTEM — Phase A.3 + A.8
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

export function translateError(err) {
  if (!err) return ERROR_MESSAGES['Unknown error'];

  if (typeof err === 'string') {
    return matchMessage(err);
  }

  if (err.message) {
    return matchMessage(err.message);
  }

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

  if (ERROR_MESSAGES[msg]) return ERROR_MESSAGES[msg];

  const num = parseInt(msg, 10);
  if (!isNaN(num) && ERROR_MESSAGES[num]) return ERROR_MESSAGES[num];

  for (const key in ERROR_MESSAGES) {
    if (typeof key === 'string' && msg.toLowerCase().includes(key.toLowerCase())) {
      return ERROR_MESSAGES[key];
    }
  }

  if (/jwt|token|session/i.test(msg)) {
    return ERROR_MESSAGES['JWT expired'];
  }

  if (/network|fetch|connection/i.test(msg)) {
    return ERROR_MESSAGES['Network request failed'];
  }

  if (/timeout|timed out/i.test(msg)) {
    return ERROR_MESSAGES['timeout'];
  }

  if (msg.length < 100 && !/^[0-9]+$/.test(msg)) {
    return msg;
  }

  return ERROR_MESSAGES['Something went wrong'];
}

/* ============================================
   3. RETRYABILITY — Phase A.8
   تشخیص اینکه خطا قابل retry هست یا نه
   ============================================ */

/**
 * آیا این خطا قابل retry است؟
 * - خطاهای شبکه، timeout، 5xx → بله
 * - خطاهای 4xx (کاربر) → خیر
 */
export function isRetryableError(err) {
  if (!err) return false;

  // اگه خود خطا صراحتاً گفته retryable نیست
  if (err.noRetry === true) return false;

  const msg = String(err?.message || err || '').toLowerCase();

  // خطاهای شبکه — همیشه قابل retry
  if (/network|fetch|failed to fetch|connection|econnrefused|econnreset|etimedout|timeout|timed out|aborted|load failed|net::err/i.test(msg)) {
    return true;
  }

  // HTTP Status Code
  const status = err?.status || err?.statusCode || err?.code;
  if (typeof status === 'number') {
    // 5xx قابل retry
    if (status >= 500 && status <= 599) return true;
    // 408 (timeout) و 429 (too many) قابل retry
    if (status === 408 || status === 429) return true;
    // بقیه (4xx) قابل retry نیستن
    if (status >= 400 && status < 500) return false;
  }

  // Supabase error codes
  const code = err?.code;
  if (typeof code === 'string') {
    // خطاهای RLS/Permission — بی‌فایده‌ست retry
    if (/permission|rls|row-level|violates|duplicate|invalid|not.*found/i.test(code)) {
      return false;
    }
  }

  // پیش‌فرض: اگه پیام فارسی/Supabase خاصی نیست، بذار retry بشه
  // چون احتمالاً موقتیه
  return true;
}

/**
 * آیا خطای Supabase قابل retry است؟
 * برای استفاده در `withRetry` وقتی که `result.error` برمی‌گرده.
 */
export function shouldRetrySupabaseError(supabaseError) {
  if (!supabaseError) return false;

  const code = supabaseError.code || '';
  const message = supabaseError.message || '';

  // خطاهای client-side — نه
  if (/PGRST|23505|23503|23502|42P01|42703|22P02|23514/i.test(code)) {
    return false;
  }

  // خطاهای auth — نه
  if (/jwt|invalid.*token|auth.*required/i.test(message)) {
    return false;
  }

  // خطاهای permission — نه
  if (/permission|row-level|rls/i.test(message)) {
    return false;
  }

  // بقیه (احتمالاً شبکه‌ای) — بله
  return true;
}

/* ============================================
   4. HANDLE ERROR
   ============================================ */

export function handleError(err, options = {}) {
  const {
    title = 'خطا',
    showToast = true,
    context = '',
    onRetry = null,
  } = options;

  if (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production') {
    console.error('[Error]', context, err);
  }

  const message = translateError(err);

  if (showToast) {
    const toastOptions = {
      type: 'error',
      title,
      message,
      duration: onRetry ? 8000 : 5000,
      position: 'top-left',
    };

    if (onRetry && isRetryableError(err)) {
      toastOptions.action = {
        label: 'دوباره تلاش',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
        onClick: onRetry,
      };
    }

    toast(toastOptions);
  }

  return { message, original: err };
}

/* ============================================
   5. SAFE ASYNC WRAPPER
   ============================================ */

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
   6. RETRY WITH EXPONENTIAL BACKOFF — Phase A.8
   ============================================ */

/**
 * تلاش مجدد خودکار با تأخیر تدریجی
 * @param {Function} fn — تابع async
 * @param {Object} options
 * @param {number} [options.maxAttempts=3]
 * @param {number} [options.baseDelay=500]
 * @param {number} [options.maxDelay=5000]
 * @param {Function} [options.onAttempt] — (attempt, maxAttempts) => void
 * @param {Function} [options.beforeRetry] — (err, attempt) => void
 * @param {Function} [options.shouldRetry] — (err, attempt) => boolean
 * @returns {Promise<any>}
 */
export async function retryAsync(fn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 500,
    maxDelay = 5000,
    onAttempt = null,
    beforeRetry = null,
    shouldRetry = (err) => isRetryableError(err),
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

      if (beforeRetry) {
        try { beforeRetry(err, attempt); } catch {}
      }

      // Exponential backoff با jitter
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
   7. NETWORK STATUS
   ============================================ */

let networkListeners = [];

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
   8. GLOBAL ERROR HANDLER
   ============================================ */

export function initGlobalErrorHandler() {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;

    if (reason?.name === 'AbortError') return;
    if (reason?.message?.includes('Auth session missing')) return;

    console.error('[Unhandled Rejection]', reason);

    if (isOnline()) {
      toast({
        type: 'error',
        title: 'خطای غیرمنتظره',
        message: translateError(reason),
        duration: 4000,
      });
    }
  });

  window.addEventListener('error', (event) => {
    if (event.target && event.target !== window) return;
    console.error('[Uncaught Error]', event.error);
  });
}

/* ============================================
   9. INIT ALL
   ============================================ */

export function initErrorSystem() {
  initNetworkDetection();
  initGlobalErrorHandler();

  console.log('%c✓ Error system ready (Phase A.3 + A.8)', 'color:#18B981;font-weight:bold;');
}

/* ============================================
   10. USER-FRIENDLY API WRAPPER — Phase A.8
   ============================================ */

/**
 * Wrapper برای Supabase queries با retry + error handling
 *
 * @param {Function} queryFn — async function که یه query رو اجرا می‌کنه
 * @param {Object} options
 * @param {number} [options.maxAttempts=3]
 * @param {string} [options.title='خطا در دریافت اطلاعات']
 * @param {boolean} [options.showToast=true]
 * @param {string} [options.context='']
 * @returns {Promise<{ data, error, message }>}
 */
export async function withRetry(queryFn, options = {}) {
  const {
    maxAttempts = 3,
    title = 'خطا در دریافت اطلاعات',
    showToast = true,
    context = '',
  } = options;

  const attempt = async () => {
    return await retryAsync(
      async () => {
        const result = await queryFn();

        // Supabase style { data, error }
        if (result && typeof result === 'object' && 'error' in result && result.error) {
          const err = result.error;

          // اگه خطای client-side هست، هیچ‌وقت retry نکن
          if (!shouldRetrySupabaseError(err)) {
            const nonRetryable = new Error(err.message || 'Client error');
            nonRetryable.noRetry = true;
            nonRetryable.code = err.code;
            nonRetryable.status = err.status;
            throw nonRetryable;
          }

          // وگرنه خطا رو پرت کن تا retry بشه
          throw err;
        }

        return result;
      },
      {
        maxAttempts,
        shouldRetry: (err) => !err?.noRetry && isRetryableError(err),
      }
    );
  };

  try {
    const result = await attempt();

    // Supabase style response
    if (result && typeof result === 'object' && 'data' in result) {
      return { data: result.data, error: null, message: null };
    }

    return { data: result, error: null, message: null };
  } catch (err) {
    const message = translateError(err);
    const retryable = isRetryableError(err);

    if (showToast) {
      const toastOptions = {
        type: 'error',
        title,
        message,
        duration: retryable ? 8000 : 5000,
      };

      if (retryable) {
        toastOptions.action = {
          label: 'دوباره تلاش',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
          onClick: () => {
            withRetry(queryFn, { ...options, showToast: false }).then((res) => {
              if (res.data) {
                window.dispatchEvent(new CustomEvent('ms:retry-success', {
                  detail: { context, data: res.data },
                }));
              }
            });
          },
        };
      }

      toast(toastOptions);
    }

    return { data: null, error: err, message, retryable };
  }
}

/* ============================================
   11. LOG
   ============================================ */

console.log('%c✓ Error utilities loaded (Phase A.3 + A.8)', 'color:#18B981;font-weight:bold;');