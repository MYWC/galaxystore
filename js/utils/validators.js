/* ============================================
   VALIDATORS — Phase A.5
   Field validators with Persian messages
   ============================================ */

/* ============================================
   1. BASIC VALIDATORS
   ============================================ */

export const validators = {
  /* -------- Required -------- */
  required(message = 'این فیلد الزامی است') {
    return (value) => {
      if (value == null) return message;
      const str = String(value).trim();
      if (!str) return message;
      return null;
    };
  },

  /* -------- Min Length -------- */
  minLength(min, message = null) {
    return (value) => {
      if (!value) return null; // Required separate
      const str = String(value).trim();
      if (str.length < min) {
        return message || `حداقل ${min.toLocaleString('fa-IR')} کاراکتر لازم است`;
      }
      return null;
    };
  },

  /* -------- Max Length -------- */
  maxLength(max, message = null) {
    return (value) => {
      if (!value) return null;
      const str = String(value).trim();
      if (str.length > max) {
        return message || `حداکثر ${max.toLocaleString('fa-IR')} کاراکتر مجاز است`;
      }
      return null;
    };
  },

  /* -------- Email -------- */
  email(message = 'ایمیل معتبر نیست') {
    return (value) => {
      if (!value) return null;
      const str = String(value).trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return message;
      return null;
    };
  },

  /* -------- Phone (Iranian) -------- */
  phone(message = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود') {
    return (value) => {
      if (!value) return null;
      const clean = String(value).replace(/\D/g, '');
      if (!/^09\d{9}$/.test(clean)) return message;
      return null;
    };
  },

  /* -------- Postal Code -------- */
  postalCode(message = 'کد پستی باید ۱۰ رقم باشد') {
    return (value) => {
      if (!value) return null;
      const clean = String(value).replace(/\D/g, '');
      if (!/^\d{10}$/.test(clean)) return message;
      return null;
    };
  },

  /* -------- Number -------- */
  number(message = 'فقط عدد وارد کنید') {
    return (value) => {
      if (!value) return null;
      if (isNaN(Number(value))) return message;
      return null;
    };
  },

  /* -------- Min Value -------- */
  min(min, message = null) {
    return (value) => {
      if (value === '' || value == null) return null;
      const num = Number(value);
      if (isNaN(num) || num < min) {
        return message || `مقدار باید حداقل ${min.toLocaleString('fa-IR')} باشد`;
      }
      return null;
    };
  },

  /* -------- Max Value -------- */
  max(max, message = null) {
    return (value) => {
      if (value === '' || value == null) return null;
      const num = Number(value);
      if (isNaN(num) || num > max) {
        return message || `مقدار باید حداکثر ${max.toLocaleString('fa-IR')} باشد`;
      }
      return null;
    };
  },

  /* -------- Match (compare with another field) -------- */
  match(getOtherValue, message = 'مقادیر یکسان نیستند') {
    return (value) => {
      const other = typeof getOtherValue === 'function' ? getOtherValue() : getOtherValue;
      if (value !== other) return message;
      return null;
    };
  },

  /* -------- URL -------- */
  url(message = 'آدرس معتبر نیست') {
    return (value) => {
      if (!value) return null;
      try {
        new URL(value);
        return null;
      } catch {
        return message;
      }
    };
  },

  /* -------- Password Strength -------- */
  strongPassword(message = 'رمز عبور باید شامل حرف و عدد باشد') {
    return (value) => {
      if (!value) return null;
      const str = String(value);
      if (!/[A-Za-z]/.test(str) || !/\d/.test(str)) return message;
      return null;
    };
  },

  /* -------- Persian Text -------- */
  persianText(message = 'لطفاً از حروف فارسی استفاده کنید') {
    return (value) => {
      if (!value) return null;
      const str = String(value).trim();
      if (!/^[\u0600-\u06FF\s]+$/.test(str)) return message;
      return null;
    };
  },

  /* -------- Custom -------- */
  custom(fn, message = 'مقدار نامعتبر است') {
    return (value) => {
      const result = fn(value);
      if (result === true || result == null) return null;
      return typeof result === 'string' ? result : message;
    };
  },

  /* -------- Boolean (checkbox) -------- */
  mustBeTrue(message = 'این گزینه الزامی است') {
    return (value) => {
      if (value !== true) return message;
      return null;
    };
  },
};

/* ============================================
   2. VALIDATE FIELD
   ============================================ */

/**
 * اجرای validator ها روی یک مقدار
 * @param {any} value
 * @param {Function[]} rules
 * @returns {string|null} پیام خطا یا null
 */
export function validateField(value, rules = []) {
  for (const rule of rules) {
    if (typeof rule !== 'function') continue;
    const error = rule(value);
    if (error) return error;
  }
  return null;
}

/* ============================================
   3. VALIDATE FORM
   ============================================ */

/**
 * اعتبارسنجی کامل فرم
 * @param {Object} values
 * @param {Object} schema - { fieldName: [rules] }
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateForm(values, schema) {
  const errors = {};
  let isValid = true;

  for (const field in schema) {
    const rules = schema[field];
    const value = values[field];
    const error = validateField(value, rules);

    if (error) {
      errors[field] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/* ============================================
   4. PASSWORD STRENGTH METER
   ============================================ */

export function calculatePasswordStrength(password) {
  if (!password) {
    return { score: 0, level: 'empty', label: '', color: '' };
  }

  const str = String(password);
  let score = 0;

  // Length
  if (str.length >= 6) score++;
  if (str.length >= 8) score++;
  if (str.length >= 12) score++;

  // Complexity
  if (/[A-Z]/.test(str)) score++;
  if (/[a-z]/.test(str)) score++;
  if (/\d/.test(str)) score++;
  if (/[^A-Za-z0-9]/.test(str)) score++;

  // Cap at 7
  score = Math.min(score, 7);

  // Convert to level 0-4
  let level;
  if (score <= 1) level = 1;
  else if (score <= 3) level = 2;
  else if (score <= 5) level = 3;
  else level = 4;

  const labels = {
    0: '—',
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

  return {
    score,
    level,
    label: labels[level],
    color: colors[level] || '',
  };
}

/* ============================================
   5. AUTO-FORM BINDING
   ============================================ */

/**
 * فرم رو خودکار اعتبارسنجی می‌کنه
 * @param {HTMLFormElement|string} formEl
 * @param {Object} schema - { fieldName: [rules] }
 * @param {Object} options
 * @returns {Object} { getValues, validate, clearErrors, setError }
 */
export function bindForm(formEl, schema, options = {}) {
  const {
    validateOnBlur = true,
    validateOnInput = true,
    showToastOnError = false,
    scrollToError = true,
    onValid = null,
  } = options;

  const form = typeof formEl === 'string' ? document.querySelector(formEl) : formEl;
  if (!form) {
    console.warn('[bindForm] Form not found');
    return null;
  }

  /* -------- Helper: Set Error -------- */
  function setError(fieldName, message) {
    const input = form.querySelector(`[name="${fieldName}"], #${fieldName}, #${form.id}-${fieldName}`);
    const errorEl = form.querySelector(`[data-error="${fieldName}"]`);

    // Try multiple field lookup strategies
    let field = null;
    if (input) {
      field = input.closest('.form-field') || input.parentElement;
    }

    if (field) {
      field.classList.add('has-error');
      field.setAttribute('data-has-error', 'true');
    }

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  /* -------- Helper: Clear Error -------- */
  function clearError(fieldName) {
    const input = form.querySelector(`[name="${fieldName}"], #${fieldName}, #${form.id}-${fieldName}`);
    const errorEl = form.querySelector(`[data-error="${fieldName}"]`);

    let field = null;
    if (input) {
      field = input.closest('.form-field') || input.parentElement;
    }

    if (field) {
      field.classList.remove('has-error');
      field.removeAttribute('data-has-error');
    }

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = '';
    }
  }

  /* -------- Helper: Clear All -------- */
  function clearErrors() {
    Object.keys(schema).forEach(clearError);
  }

  /* -------- Helper: Get Values -------- */
  function getValues() {
    const values = {};

    Object.keys(schema).forEach((fieldName) => {
      const input = form.querySelector(`[name="${fieldName}"], #${fieldName}, #${form.id}-${fieldName}`);

      if (!input) return;

      if (input.type === 'checkbox') {
        values[fieldName] = input.checked;
      } else if (input.type === 'radio') {
        const checked = form.querySelector(`[name="${fieldName}"]:checked`);
        values[fieldName] = checked?.value || '';
      } else {
        values[fieldName] = input.value;
      }
    });

    return values;
  }

  /* -------- Helper: Validate All -------- */
  function validate() {
    const values = getValues();
    const { isValid, errors } = validateForm(values, schema);

    // Clear all first
    clearErrors();

    // Apply errors
    Object.keys(errors).forEach((fieldName) => {
      setError(fieldName, errors[fieldName]);
    });

    // Scroll to first error
    if (!isValid && scrollToError) {
      const firstErrorField = form.querySelector('.form-field.has-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Focus the first input
        const firstInput = firstErrorField.querySelector('input, textarea, select');
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 400);
        }
      }
    }

    if (!isValid && showToastOnError && typeof window !== 'undefined') {
      // Try to use toast if available
      import('../components/toast.js').then(({ toast }) => {
        toast({
          type: 'error',
          title: 'اطلاعات ناقص است',
          message: 'لطفاً خطاهای مشخص‌شده را برطرف کنید',
          duration: 3500,
        });
      }).catch(() => {});
    }

    return { isValid, errors, values };
  }

  /* -------- Bind Field Events -------- */
  Object.keys(schema).forEach((fieldName) => {
    const input = form.querySelector(`[name="${fieldName}"], #${fieldName}, #${form.id}-${fieldName}`);
    if (!input) return;

    const rules = schema[fieldName];

    if (validateOnBlur) {
      input.addEventListener('blur', () => {
        const value = input.type === 'checkbox' ? input.checked : input.value;
        const error = validateField(value, rules);
        if (error) setError(fieldName, error);
        else clearError(fieldName);
      });
    }

    if (validateOnInput) {
      let timer;
      input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          // Only clear error on input, don't re-validate to avoid annoying UX
          if (input.closest('.form-field')?.classList.contains('has-error')) {
            const value = input.type === 'checkbox' ? input.checked : input.value;
            const error = validateField(value, rules);
            if (!error) clearError(fieldName);
          }
        }, 300);
      });

      if (input.type === 'checkbox') {
        input.addEventListener('change', () => {
          const error = validateField(input.checked, rules);
          if (!error) clearError(fieldName);
          else if (input.closest('.form-field')?.classList.contains('has-error')) {
            setError(fieldName, error);
          }
        });
      }
    }
  });

  /* -------- Form Submit -------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const result = validate();

    if (result.isValid && typeof onValid === 'function') {
      onValid(result.values, e);
    }
  });

  /* -------- Return API -------- */
  return {
    form,
    getValues,
    validate,
    clearErrors,
    setError,
    clearError,
  };
}

/* ============================================
   6. REUSABLE SCHEMAS
   ============================================ */

export const commonSchemas = {
  email: [
    validators.required('ایمیل الزامی است'),
    validators.email(),
  ],

  password: [
    validators.required('رمز عبور الزامی است'),
    validators.minLength(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
    validators.strongPassword(),
  ],

  phone: [
    validators.required('شماره موبایل الزامی است'),
    validators.phone(),
  ],

  firstName: [
    validators.required('نام الزامی است'),
    validators.minLength(2, 'نام باید حداقل ۲ کاراکتر باشد'),
    validators.maxLength(30),
  ],

  lastName: [
    validators.required('نام خانوادگی الزامی است'),
    validators.minLength(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
    validators.maxLength(30),
  ],

  postalCode: [
    validators.required('کد پستی الزامی است'),
    validators.postalCode(),
  ],

  address: [
    validators.required('آدرس الزامی است'),
    validators.minLength(10, 'آدرس باید حداقل ۱۰ کاراکتر باشد'),
    validators.maxLength(500),
  ],

  city: [
    validators.required('شهر الزامی است'),
    validators.minLength(2),
  ],

  terms: [
    validators.mustBeTrue('برای ادامه باید قوانین را بپذیرید'),
  ],
};

/* ============================================
   7. LOG
   ============================================ */

console.log('%c✓ Validators ready (Phase A.5)', 'color:#18B981;font-weight:bold;');