/* ============================================
   FORM DRAFT — Auto-save & Restore (B.11)
   ============================================ */

const PREFIX = 'ms_draft_';
const DEFAULT_DEBOUNCE = 800;
const DEFAULT_TTL_DAYS = 7;

/* ============================================
   LOW-LEVEL API
   ============================================ */

export function saveDraft(key, values) {
  if (!key || !values) return false;
  try {
    const payload = {
      savedAt: Date.now(),
      values,
    };
    localStorage.setItem(PREFIX + key, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.error('saveDraft error:', e);
    return false;
  }
}

export function loadDraft(key, { ttlDays = DEFAULT_TTL_DAYS } = {}) {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.savedAt || !parsed.values) return null;

    // TTL check
    const ageMs = Date.now() - parsed.savedAt;
    const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
    if (ageMs > ttlMs) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearDraft(key) {
  if (!key) return;
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {}
}

export function listDrafts() {
  const result = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        result.push(k.slice(PREFIX.length));
      }
    }
  } catch {}
  return result;
}

export function clearAllDrafts() {
  listDrafts().forEach(clearDraft);
}

/* ============================================
   HELPERS
   ============================================ */

export function debounce(fn, ms = DEFAULT_DEBOUNCE) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function isSkippableField(field) {
  if (!field) return true;
  if (['password', 'file', 'hidden'].includes(field.type)) return true;
  if (field.disabled || field.readOnly) return true;
  if (field.dataset && field.dataset.draftSkip === 'true') return true;
  return false;
}

function getFieldKey(field) {
  return field.name || field.id || '';
}

/* ============================================
   ATTACH — Auto-save / auto-restore on any container
   ============================================ */

/**
 * @param {HTMLElement|string} container — form، یه input، یا هر wrapper
 * @param {Object} options
 * @param {string} options.key — required
 * @param {number} [options.debounceMs=800]
 * @param {boolean} [options.showIndicator=true]
 * @param {boolean} [options.autoRestore=true]
 * @param {number} [options.ttlDays=7]
 * @param {Function} [options.onSave] — (values) => void
 * @param {Function} [options.onRestore] — (values, savedAt) => void
 * @returns {{ save, clear, get, fields } | null}
 */
export function attachFormDraft(container, options = {}) {
  const {
    key,
    debounceMs = DEFAULT_DEBOUNCE,
    showIndicator = true,
    autoRestore = true,
    ttlDays = DEFAULT_TTL_DAYS,
    onSave = null,
    onRestore = null,
  } = options;

  if (!container || !key) return null;

  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!el) return null;

  /* ---------- Field discovery ---------- */

  const getFields = () => {
    // Single input/select/textarea case
    if (el.matches && el.matches('input, select, textarea')) {
      if (isSkippableField(el)) return [];
      return [el];
    }

    return Array.from(el.querySelectorAll('input, select, textarea'))
      .filter((f) => !isSkippableField(f));
  };

  /* ---------- Collect / Apply ---------- */

  const collect = () => {
    const values = {};
    getFields().forEach((field) => {
      const k = getFieldKey(field);
      if (!k) return;

      if (field.type === 'checkbox') {
        values[k] = { __t: 'cb', v: field.checked };
      } else if (field.type === 'radio') {
        if (field.checked) values[k] = { __t: 'r', v: field.value };
      } else {
        values[k] = field.value;
      }
    });
    return values;
  };

  const applyValues = (values) => {
    if (!values) return;
    getFields().forEach((field) => {
      const k = getFieldKey(field);
      if (!k || !(k in values)) return;

      const v = values[k];

      if (field.type === 'checkbox') {
        field.checked = (v && v.__t === 'cb') ? v.v : Boolean(v);
      } else if (field.type === 'radio') {
        const val = (v && v.__t === 'r') ? v.v : v;
        if (field.value === val) field.checked = true;
      } else {
        field.value = (v == null ? '' : v);
      }
    });
  };

  /* ---------- Indicator ---------- */

  let indicator = null;
  let indicatorTimer = null;

  const ensureIndicator = () => {
    if (indicator || !showIndicator) return;

    indicator = document.createElement('div');
    indicator.className = 'form-draft-indicator';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    indicator.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>ذخیره شد</span>
    `;
    document.body.appendChild(indicator);
  };

  const flashSaved = () => {
    if (!showIndicator) return;
    ensureIndicator();
    if (!indicator) return;

    indicator.classList.add('is-visible');
    clearTimeout(indicatorTimer);
    indicatorTimer = setTimeout(() => {
      indicator.classList.remove('is-visible');
    }, 1400);
  };

  /* ---------- Save ---------- */

  const flush = () => {
    const values = collect();
    if (Object.keys(values).length === 0) return;

    const ok = saveDraft(key, values);
    if (ok) {
      flashSaved();
      if (typeof onSave === 'function') onSave(values);
    }
  };

  const scheduledSave = debounce(flush, debounceMs);

  /* ---------- Listen ---------- */

  const handleChange = (e) => {
    if (!e.target) return;
    if (isSkippableField(e.target)) return;
    scheduledSave();
  };

  el.addEventListener('input', handleChange, true);
  el.addEventListener('change', handleChange, true);

  /* ---------- Auto-restore ---------- */

  if (autoRestore) {
    const existing = loadDraft(key, { ttlDays });
    if (existing && existing.values) {
      applyValues(existing.values);
      if (typeof onRestore === 'function') {
        onRestore(existing.values, existing.savedAt);
      }
    }
  }

  /* ---------- Return controller ---------- */

  return {
    save: flush,
    clear: () => {
      clearDraft(key);
      clearTimeout(indicatorTimer);
      if (indicator) indicator.classList.remove('is-visible');
    },
    get: () => loadDraft(key, { ttlDays }),
    fields: getFields,
  };
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ Form Draft ready (B.11)', 'color:#18B981;font-weight:bold;');