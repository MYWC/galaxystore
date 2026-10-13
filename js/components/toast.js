/* ============================================
   TOAST NOTIFICATION SYSTEM — Phase A.1
   Enhanced with positions, actions, promises, stacking
   ============================================ */

/* ============================================
   ICONS
   ============================================ */

const ICONS = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  close:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

/* ============================================
   CONSTANTS
   ============================================ */

const DEFAULT_POSITION = 'top-left';
const DEFAULT_DURATION = 3500;
const MAX_TOASTS = 5;

/* ============================================
   STATE
   ============================================ */

const containers = new Map(); // position -> element
const activeToasts = new Map(); // id -> { el, timer, remaining, createdAt }
let toastId = 0;

/* ============================================
   CONTAINER
   ============================================ */

function getContainer(position = DEFAULT_POSITION) {
  if (containers.has(position)) return containers.get(position);

  const container = document.createElement('div');
  container.className = 'toast-container';
  container.dataset.position = position;
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', 'اعلان‌ها');
  container.setAttribute('aria-live', 'polite');

  document.body.appendChild(container);
  containers.set(position, container);

  return container;
}

/* ============================================
   UTILITIES
   ============================================ */

function generateId() {
  return `toast-${++toastId}-${Date.now()}`;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* Allow links in messages — escape everything except <a> tags and <strong> */
function sanitizeMessage(message) {
  if (!message) return '';
  const str = String(message);
  // If message contains HTML tags we trust (a, strong, br), keep them
  if (/<a\s|<strong|<br/i.test(str)) {
    return str;
  }
  return escapeHtml(str);
}

function enforceStackLimit(container) {
  const allToasts = Array.from(container.querySelectorAll('.toast'));
  if (allToasts.length <= MAX_TOASTS) return;

  const toRemove = allToasts.slice(0, allToasts.length - MAX_TOASTS);
  toRemove.forEach((el) => {
    const id = el.dataset.toastId;
    if (id) removeToast(id);
  });
}

/* ============================================
   CREATE TOAST
   ============================================ */

function createToastElement({
  id,
  type = 'info',
  title = '',
  message = '',
  action = null,
  showClose = true,
  showProgress = true,
  duration = DEFAULT_DURATION,
  html = null,
}) {
  const el = document.createElement('div');
  el.className = `toast toast--${type} is-entering`;
  el.dataset.toastId = id;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

  /* -------- Icon -------- */
  let iconHTML = '';
  if (type === 'loading') {
    iconHTML = `<div class="toast__spinner"></div>`;
  } else {
    const iconKey = ICONS[type] ? type : 'info';
    iconHTML = ICONS[iconKey];
  }

  /* -------- Custom HTML or default content -------- */
  let bodyHTML = '';
  if (html) {
    bodyHTML = html;
  } else {
    bodyHTML = `
      ${title ? `<span class="toast__title">${sanitizeMessage(title)}</span>` : ''}
      ${message ? `<span class="toast__message">${sanitizeMessage(message)}</span>` : ''}
    `;
  }

  /* -------- Action button -------- */
  let actionHTML = '';
  if (action && action.label) {
    actionHTML = `
      <button type="button" class="toast__action" data-toast-action>
        ${action.icon || ''}
        <span>${escapeHtml(action.label)}</span>
      </button>
    `;
  }

  /* -------- Close button -------- */
  const closeHTML = showClose
    ? `<button type="button" class="toast__close" data-toast-close aria-label="بستن">${ICONS.close}</button>`
    : '';

  /* -------- Progress bar -------- */
  const progressHTML = showProgress && duration > 0 && type !== 'loading'
    ? `<div class="toast__progress"><div class="toast__progress-bar"></div></div>`
    : '';

  el.innerHTML = `
    <div class="toast__icon">${iconHTML}</div>
    <div class="toast__body">${bodyHTML}</div>
    ${actionHTML}
    ${closeHTML}
    ${progressHTML}
  `;

  return el;
}

/* ============================================
   MAIN TOAST FUNCTION
   ============================================ */

/**
 * نمایش یک Toast
 * @param {Object} options
 * @param {'success'|'error'|'warning'|'info'|'loading'} [options.type='info']
 * @param {string} [options.title]
 * @param {string} [options.message]
 * @param {number} [options.duration=3500]
 * @param {'top-left'|'top-right'|'top-center'|'bottom-left'|'bottom-right'|'bottom-center'} [options.position='top-left']
 * @param {Object} [options.action] - { label, onClick, icon }
 * @param {boolean} [options.showClose=true]
 * @param {boolean} [options.showProgress=true]
 * @param {string} [options.html] - custom HTML (overrides title/message)
 * @returns {string} toastId
 */
export function toast(options = {}) {
  // Backward compatibility: allow `toast({ type, title, message, duration })`
  const {
    type = 'info',
    title = '',
    message = '',
    duration = DEFAULT_DURATION,
    position = DEFAULT_POSITION,
    action = null,
    showClose = true,
    showProgress = true,
    html = null,
    pauseOnHover = true,
    onClick = null,
  } = options;

  const id = generateId();
  const container = getContainer(position);

  const el = createToastElement({
    id,
    type,
    title,
    message,
    action,
    showClose,
    showProgress,
    duration,
    html,
  });

  container.appendChild(el);

  // Force reflow then animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.remove('is-entering');
      el.classList.add('is-visible');
    });
  });

  // Stack limit
  enforceStackLimit(container);

  // Setup progress bar
  const progressBar = el.querySelector('.toast__progress-bar');
  if (progressBar && duration > 0) {
    progressBar.style.transition = `transform ${duration}ms linear`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressBar.style.transform = 'scaleX(0)';
      });
    });
  }

  // Setup dismiss timer
  let timer = null;
  let remaining = duration;
  let startTime = Date.now();

  const startTimer = (time) => {
    if (time <= 0) return;
    startTime = Date.now();
    remaining = time;
    timer = setTimeout(() => removeToast(id), time);
  };

  const pauseTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      remaining -= Date.now() - startTime;
      if (progressBar) {
        const computed = getComputedStyle(progressBar).transform;
        progressBar.style.transition = 'none';
        progressBar.style.transform = computed;
      }
    }
  };

  const resumeTimer = () => {
    if (remaining > 0 && !timer) {
      if (progressBar) {
        progressBar.style.transition = `transform ${remaining}ms linear`;
        requestAnimationFrame(() => {
          progressBar.style.transform = 'scaleX(0)';
        });
      }
      startTimer(remaining);
    }
  };

  if (duration > 0 && type !== 'loading') {
    startTimer(duration);
  }

  // Store
  activeToasts.set(id, { el, timer, remaining, container, pauseTimer, resumeTimer });

  /* -------- Hover pause -------- */
  if (pauseOnHover && duration > 0) {
    el.addEventListener('mouseenter', pauseTimer);
    el.addEventListener('mouseleave', resumeTimer);
  }

  /* -------- Close button -------- */
  const closeBtn = el.querySelector('[data-toast-close]');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeToast(id);
    });
  }

  /* -------- Action button -------- */
  const actionBtn = el.querySelector('[data-toast-action]');
  if (actionBtn && action) {
    actionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof action.onClick === 'function') {
        action.onClick();
      }
      if (action.closeOnClick !== false) {
        removeToast(id);
      }
    });
  }

  /* -------- Click on toast -------- */
  if (typeof onClick === 'function') {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => onClick());
  }

  return id;
}

/* ============================================
   REMOVE
   ============================================ */

export function removeToast(id) {
  const entry = activeToasts.get(id);
  if (!entry) return;

  const { el, timer, container } = entry;

  if (timer) clearTimeout(timer);

  el.classList.remove('is-visible');
  el.classList.add('is-leaving');

  setTimeout(() => {
    el.remove();
    activeToasts.delete(id);

    // Remove empty container
    if (container && !container.querySelector('.toast')) {
      containers.delete(container.dataset.position);
      container.remove();
    }
  }, 350);
}

/* ============================================
   UPDATE (for loading toasts)
   ============================================ */

export function updateToast(id, options = {}) {
  const entry = activeToasts.get(id);
  if (!entry) return null;

  const { el, container } = entry;

  const {
    type = 'success',
    title = '',
    message = '',
    duration = DEFAULT_DURATION,
    action = null,
    showClose = true,
    showProgress = true,
    html = null,
  } = options;

  // Remove old
  el.classList.add('is-leaving');
  setTimeout(() => {
    el.remove();
    activeToasts.delete(id);

    // Create new with same id? No — just create new
    toast({
      type,
      title,
      message,
      duration,
      position: container?.dataset.position || DEFAULT_POSITION,
      action,
      showClose,
      showProgress,
      html,
    });
  }, 200);

  return id;
}

/* ============================================
   DISMISS ALL
   ============================================ */

export function dismissAllToasts() {
  Array.from(activeToasts.keys()).forEach((id) => removeToast(id));
}

/* ============================================
   SHORTCUTS
   ============================================ */

toast.success = (title, options = {}) =>
  toast({ type: 'success', title, ...options });

toast.error = (title, options = {}) =>
  toast({ type: 'error', title, ...options });

toast.warning = (title, options = {}) =>
  toast({ type: 'warning', title, ...options });

toast.info = (title, options = {}) =>
  toast({ type: 'info', title, ...options });

toast.loading = (title, options = {}) =>
  toast({ type: 'loading', title, duration: 0, showClose: false, showProgress: false, ...options });

toast.update = updateToast;
toast.dismiss = removeToast;
toast.dismissAll = dismissAllToasts;

/* ============================================
   PROMISE API
   ============================================ */

/**
 * نمایش loading تا resolve شدن promise
 * @param {Promise} promise
 * @param {Object} messages - { loading, success, error }
 * @returns {Promise}
 */
toast.promise = function (promise, messages = {}) {
  const {
    loading = 'در حال انجام...',
    success = 'با موفقیت انجام شد',
    error = 'خطایی رخ داد',
  } = messages;

  const loadingId = toast.loading(loading);

  promise
    .then((data) => {
      removeToast(loadingId);

      const successMsg = typeof success === 'function' ? success(data) : success;
      const msg = typeof successMsg === 'string'
        ? { title: successMsg }
        : successMsg;

      toast({ type: 'success', ...msg });
    })
    .catch((err) => {
      removeToast(loadingId);

      const errorMsg = typeof error === 'function' ? error(err) : error;
      const msg = typeof errorMsg === 'string'
        ? { title: errorMsg }
        : errorMsg;

      toast({ type: 'error', ...msg });
    });

  return promise;
};

/* ============================================
   AUTO INIT
   ============================================ */

// Close all on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && activeToasts.size) {
    dismissAllToasts();
  }
});

console.log('%c✓ Toast system ready (Phase A.1)', 'color:#18B981;font-weight:bold;');