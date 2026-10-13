/* ============================================
   COPY TO CLIPBOARD — Phase B.8
   With fallback for older browsers + animation
   ============================================ */

/* ============================================
   ICONS
   ============================================ */

const COPY_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

/* ============================================
   LOW-LEVEL COPY
   ============================================ */

/**
 * کپی کردن متن در clipboard با fallback
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyText(text) {
  if (!text) return false;

  const str = String(text);

  // Modern API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(str);
      return true;
    } catch (err) {
      // Fall through to fallback
    }
  }

  // Fallback: textarea + execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = str;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);

    return ok;
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
}

/* ============================================
   TOOLTIP
   ============================================ */

let tooltipEl = null;
let tooltipTimer = null;

function showTooltip(anchorEl, text = 'کپی شد!') {
  if (!anchorEl) return;

  hideTooltip();

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'copy-tooltip';
    document.body.appendChild(tooltipEl);
  }

  tooltipEl.textContent = text;

  const rect = anchorEl.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const left = rect.left + rect.width / 2 + window.scrollX;

  tooltipEl.style.top = `${top}px`;
  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.transform = 'translate3d(-50%, -100%, 0)';

  requestAnimationFrame(() => {
    tooltipEl.classList.add('is-visible');
  });

  clearTimeout(tooltipTimer);
  tooltipTimer = setTimeout(() => {
    tooltipEl.classList.remove('is-visible');
    setTimeout(() => {
      if (tooltipEl && !tooltipEl.classList.contains('is-visible')) {
        tooltipEl.remove();
        tooltipEl = null;
      }
    }, 250);
  }, 1600);
}

function hideTooltip() {
  if (tooltipEl) {
    tooltipEl.remove();
    tooltipEl = null;
  }
  clearTimeout(tooltipTimer);
}

/* ============================================
   ANIMATED BUTTON
   ============================================ */

/**
 * روی یه دکمه‌ی copy انیمیشن اعمال می‌کنه
 * @param {HTMLElement} btn
 */
export function flashCopied(btn) {
  if (!btn) return;

  const originalHTML = btn.innerHTML;
  const hasText = btn.textContent.trim().length > 1;

  btn.classList.add('is-copied');

  // Replace icon with check
  if (hasText) {
    // Keep text, swap icon
    const svg = btn.querySelector('svg');
    if (svg) {
      svg.outerHTML = CHECK_ICON;
    }
  } else {
    // Icon-only — replace all
    btn.innerHTML = CHECK_ICON;
  }

  setTimeout(() => {
    btn.classList.remove('is-copied');
    btn.innerHTML = originalHTML;
  }, 1600);
}

/* ============================================
   MAIN API
   ============================================ */

/**
 * کپی + انیمیشن + (اختیاری) toast
 * @param {Object} opts
 * @param {string} opts.text — متن برای کپی
 * @param {HTMLElement} [opts.btn] — دکمه‌ای که فیدبک روش بدیم
 * @param {string} [opts.tooltipText] — متن tooltip (پیش‌فرض: «کپی شد!»)
 * @param {boolean} [opts.showTooltip=true]
 * @param {boolean} [opts.showToast=false]
 * @param {string} [opts.toastTitle]
 * @param {string} [opts.toastMessage]
 * @returns {Promise<boolean>}
 */
export async function copyWithFeedback(opts = {}) {
  const {
    text,
    btn,
    tooltipText = 'کپی شد!',
    showTooltip = true,
    showToast = false,
    toastTitle = 'کپی شد',
    toastMessage = '',
  } = opts;

  const ok = await copyText(text);

  if (!ok) {
    // Error feedback
    if (btn) {
      btn.classList.add('is-copied');
      setTimeout(() => btn.classList.remove('is-copied'), 800);
    }

    if (showToast) {
      const { toast } = await import('../components/toast.js');
      toast({
        type: 'error',
        title: 'کپی ناموفق بود',
        message: 'لطفاً دستی متن را انتخاب کنید',
        duration: 3000,
      });
    }

    return false;
  }

  // Success
  if (btn) {
    flashCopied(btn);
    if (showTooltip) showTooltip(btn, tooltipText);
  }

  if (showToast) {
    const { toast } = await import('../components/toast.js');
    toast({
      type: 'success',
      title: toastTitle,
      message: toastMessage,
      duration: 2000,
      position: 'top-left',
    });
  }

  return true;
}

/* ============================================
   AUTO-WIRE — [data-copy]
   ============================================ */

/**
 * هر عنصری که `data-copy="متن"` داره، به‌طور خودکار copy می‌کنه
 * اگر `data-copy-target="#selector"` باشه، از اون عنصر متن می‌خونه
 */
export function initCopyButtons() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy], [data-copy-target]');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    let text = '';

    if (btn.dataset.copyTarget) {
      const target = document.querySelector(btn.dataset.copyTarget);
      text = (target?.textContent || '').trim();
    } else if (btn.dataset.copy) {
      text = btn.dataset.copy;
    }

    if (!text) return;

    await copyWithFeedback({
      text,
      btn,
      tooltipText: btn.dataset.copyTooltip || 'کپی شد!',
      showTooltip: btn.dataset.copyNoTooltip !== 'true',
      showToast: btn.dataset.copyToast === 'true',
      toastMessage: text.length > 30 ? text.slice(0, 30) + '…' : text,
    });
  });
}