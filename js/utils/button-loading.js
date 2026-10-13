/* ============================================
   BUTTON LOADING STATE — Phase A.6
   Universal loading states for any button
   ============================================ */

const originalStates = new WeakMap();

/**
 * فعال/غیرفعال کردن حالت loading روی یک دکمه
 * @param {HTMLElement} btn
 * @param {boolean} loading
 */
export function setButtonLoading(btn, loading) {
  if (!btn || !(btn instanceof HTMLElement)) return;

  if (loading) {
    if (originalStates.has(btn)) return; // already loading

    originalStates.set(btn, {
      disabled: btn.disabled,
      ariaBusy: btn.getAttribute('aria-busy'),
    });

    btn.disabled = true;
    btn.classList.add('is-loading');
    btn.setAttribute('aria-busy', 'true');
  } else {
    const state = originalStates.get(btn);
    if (!state) return;

    originalStates.delete(btn);

    btn.disabled = state.disabled;
    btn.classList.remove('is-loading');

    if (state.ariaBusy != null) {
      btn.setAttribute('aria-busy', state.ariaBusy);
    } else {
      btn.removeAttribute('aria-busy');
    }
  }
}

/**
 * اجرای تابع async همراه با نمایش loading روی دکمه
 *
 * @example
 *   await withButtonLoading(btn, async () => {
 *     await createOrder(data);
 *   });
 */
export async function withButtonLoading(btn, fn) {
  setButtonLoading(btn, true);
  try {
    return await fn();
  } finally {
    setButtonLoading(btn, false);
  }
}

/**
 * چک کردن وضعیت loading
 */
export function isButtonLoading(btn) {
  return originalStates.has(btn);
}

/**
 * اجرای موازی روی چند دکمه
 */
export async function withButtonsLoading(btns, fn) {
  const list = Array.isArray(btns) ? btns : [btns];
  list.forEach((b) => setButtonLoading(b, true));
  try {
    return await fn();
  } finally {
    list.forEach((b) => setButtonLoading(b, false));
  }
}