/* ============================================
   PASSWORD STRENGTH — Phase B.9
   Reusable, unified, rich feedback
   ============================================ */

/* ============================================
   ANALYZE
   ============================================ */

/**
 * تحلیل رمز عبور
 * @param {string} password
 * @returns {{
 *   score: number,       // 0-4
 *   level: number,       // 1-4
 *   label: string,
 *   color: string,
 *   rules: {
 *     length: boolean,
 *     lowercase: boolean,
 *     uppercase: boolean,
 *     digit: boolean,
 *     symbol: boolean,
 *     noRepeat: boolean
 *   },
 *   suggestions: string[]
 * }}
 */
export function analyzePassword(password) {
  const pw = String(password || '');
  const len = pw.length;

  const rules = {
    length: len >= 8,
    lowercase: /[a-z]/.test(pw),
    uppercase: /[A-Z]/.test(pw),
    digit: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
    noRepeat: len > 0 && !/(.)\1{2,}/.test(pw),
  };

  let score = 0;
  if (len >= 6) score++;
  if (len >= 8) score++;
  if (len >= 12) score++;

  const varietyCount = [rules.lowercase, rules.uppercase, rules.digit, rules.symbol]
    .filter(Boolean).length;

  if (varietyCount >= 2) score++;
  if (varietyCount >= 3) score++;
  if (varietyCount >= 4) score++;
  if (rules.noRepeat) score++;

  score = Math.min(score, 7);

  // Convert to level 1-4
  let level;
  if (len === 0) level = 0;
  else if (score <= 2) level = 1;
  else if (score <= 4) level = 2;
  else if (score <= 5) level = 3;
  else level = 4;

  const labels = {
    0: '',
    1: 'ضعیف',
    2: 'متوسط',
    3: 'خوب',
    4: 'قوی',
  };

  const colors = {
    1: '#EF5350',
    2: '#F59E0B',
    3: '#2386D7',
    4: '#18B981',
  };

  // Suggestions
  const suggestions = [];
  if (len > 0) {
    if (!rules.length) suggestions.push('حداقل ۸ کاراکتر استفاده کنید');
    if (!rules.uppercase) suggestions.push('حرف بزرگ (A-Z) اضافه کنید');
    if (!rules.lowercase) suggestions.push('حرف کوچک (a-z) اضافه کنید');
    if (!rules.digit) suggestions.push('عدد (0-9) اضافه کنید');
    if (!rules.symbol) suggestions.push('نماد (!@#$) اضافه کنید');
    if (!rules.noRepeat && suggestions.length < 2) {
      suggestions.push('از تکرار پشت‌سرهم کاراکترها خودداری کنید');
    }
    if (len >= 8 && len < 12 && varietyCount >= 3 && suggestions.length < 2) {
      suggestions.push('برای قدرت بیشتر، رمز را طولانی‌تر کنید (۱۲+)');
    }
  }

  return {
    score,
    level,
    label: labels[level],
    color: colors[level] || '',
    rules,
    suggestions,
  };
}

/* ============================================
   ICONS
   ============================================ */

const ICONS = {
  weak: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  fair: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  good: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>`,
  strong: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v8c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V5l-8-3z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  hint: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
};

/* ============================================
   RENDER
   ============================================ */

const RULE_LABELS = {
  length: 'حداقل ۸ کاراکتر',
  uppercase: 'حرف بزرگ (A-Z)',
  lowercase: 'حرف کوچک (a-z)',
  digit: 'عدد (0-9)',
  symbol: 'نماد خاص (!@#)',
  noRepeat: 'بدون تکرار پشت‌سرهم',
};

/**
 * ساخت HTML نوار قدرت رمز
 * @param {Object} analysis — از analyzePassword
 * @returns {string}
 */
export function renderPasswordStrength(analysis) {
  const { level, label, rules, suggestions } = analysis;

  if (level === 0) return '';

  const levelIcons = {
    1: ICONS.weak,
    2: ICONS.fair,
    3: ICONS.good,
    4: ICONS.strong,
  };

  const rulesHTML = Object.keys(RULE_LABELS).map((key) => `
    <span class="pw-strength__rule ${rules[key] ? 'is-met' : ''}">
      <span class="pw-strength__rule-icon"></span>
      ${RULE_LABELS[key]}
    </span>
  `).join('');

  const hintHTML = suggestions.length > 0
    ? `
      <div class="pw-strength__hint">
        ${ICONS.hint}
        <span>${level === 4 && suggestions.length === 0
          ? '<strong>رمز عبور عالی است!</strong>'
          : suggestions[0]
        }</span>
      </div>
    `
    : (level === 4
      ? `
        <div class="pw-strength__hint">
          ${ICONS.check}
          <span><strong>رمز عبور بسیار قوی است</strong> — آفرین!</span>
        </div>
      `
      : '');

  return `
    <div class="pw-strength__head">
      <div class="pw-strength__bars">
        <span class="pw-strength__bar ${level >= 1 ? 'is-filled' : ''}"></span>
        <span class="pw-strength__bar ${level >= 2 ? 'is-filled' : ''}"></span>
        <span class="pw-strength__bar ${level >= 3 ? 'is-filled' : ''}"></span>
        <span class="pw-strength__bar ${level >= 4 ? 'is-filled' : ''}"></span>
      </div>
      <span class="pw-strength__label">
        ${levelIcons[level] || ICONS.weak}
        ${label}
      </span>
    </div>

    <div class="pw-strength__rules">
      ${rulesHTML}
    </div>

    ${hintHTML}
  `;
}

/* ============================================
   ATTACH — Auto-binding to input
   ============================================ */

/**
 * به یک input رمز، نوار قدرت خودکار اضافه کن
 * @param {HTMLInputElement} input
 * @param {Object} [opts]
 * @param {boolean} [opts.showOnFocus=true]
 * @param {Function} [opts.onChange] — (analysis) => void
 * @returns {{ update: Function, destroy: Function }|null}
 */
export function attachPasswordStrength(input, opts = {}) {
  if (!input) return null;

  const {
    showOnFocus = true,
    onChange: onInputChange = null,
  } = opts;

  // ساخت wrap
  let wrap = input.closest('.form-field') || input.parentElement;
  if (!wrap) return null;

  // پیدا کردن یا ساختن نوار قدرت
  let meter = wrap.querySelector('.pw-strength');
  if (!meter) {
    meter = document.createElement('div');
    meter.className = 'pw-strength';
    meter.hidden = true;
    meter.setAttribute('data-level', '0');
    meter.setAttribute('aria-live', 'polite');
    meter.setAttribute('aria-atomic', 'true');

    // اضافه بعد از input-wrap یا بعد از input
    const inputWrap = input.closest('.form-field__input-wrap');
    if (inputWrap) {
      inputWrap.insertAdjacentElement('afterend', meter);
    } else {
      input.insertAdjacentElement('afterend', meter);
    }
  }

  let isVisible = false;

  function update() {
    const value = input.value;
    const analysis = analyzePassword(value);

    if (onInputChange) {
      try { onInputChange(analysis); } catch {}
    }

    // خالی → مخفی
    if (!value) {
      meter.hidden = true;
      meter.setAttribute('data-level', '0');
      isVisible = false;
      return;
    }

    // نمایش
    if (!isVisible) {
      meter.hidden = false;
      isVisible = true;
    }

    meter.setAttribute('data-level', String(analysis.level));
    meter.innerHTML = renderPasswordStrength(analysis);
  }

  input.addEventListener('input', update);

  if (showOnFocus) {
    input.addEventListener('focus', () => {
      if (input.value) update();
    });
  }

  // اگر از قبل مقدار داشت
  if (input.value) update();

  return {
    update,
    destroy() {
      input.removeEventListener('input', update);
      if (meter) meter.remove();
    },
  };
}