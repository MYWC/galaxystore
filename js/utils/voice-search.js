/* ============================================
   VOICE SEARCH — Phase B.4
   Web Speech API wrapper (Chrome/Edge only)
   ============================================ */

const MIC_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
`;

const STOP_ICON = `
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
`;

/* ============================================
   SUPPORT DETECTION
   ============================================ */

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * آیا مرورگر از Voice Search پشتیبانی می‌کند؟
 */
export function isVoiceSearchSupported() {
  return Boolean(getSpeechRecognition());
}

/* ============================================
   OVERLAY
   ============================================ */

let overlayEl = null;
let overlayCallbacks = null;

function createOverlay() {
  const el = document.createElement('div');
  el.className = 'voice-overlay';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'جستجوی صوتی');
  el.innerHTML = `
    <div class="voice-overlay__inner">
      <div class="voice-overlay__icon">
        ${MIC_ICON}
      </div>

      <h3 class="voice-overlay__title">صحبت کنید</h3>
      <p class="voice-overlay__hint">مثلاً بگید: «آیفون ۱۶ پرو»</p>

      <div class="voice-overlay__transcript" id="voice-transcript">
        <span class="voice-overlay__cursor"></span>
      </div>

      <div class="voice-overlay__actions">
        <button type="button" class="voice-overlay__cancel" id="voice-cancel">
          انصراف
        </button>
        <button type="button" class="voice-overlay__apply" id="voice-apply" disabled>
          جستجو
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(el);
  return el;
}

function openOverlay(callbacks) {
  if (!overlayEl) {
    overlayEl = createOverlay();
  }
  overlayCallbacks = callbacks;

  const transcriptEl = overlayEl.querySelector('#voice-transcript');
  const applyBtn = overlayEl.querySelector('#voice-apply');
  const cancelBtn = overlayEl.querySelector('#voice-cancel');

  // Reset
  transcriptEl.className = 'voice-overlay__transcript';
  transcriptEl.innerHTML = `<span class="voice-overlay__cursor"></span>`;
  applyBtn.disabled = true;

  // Bind (once per open — replace handlers)
  cancelBtn.onclick = () => {
    closeOverlay();
    callbacks.onCancel?.();
  };

  applyBtn.onclick = () => {
    const text = transcriptEl.textContent.trim();
    if (text) {
      closeOverlay();
      callbacks.onApply?.(text);
    }
  };

  document.body.style.overflow = 'hidden';
  overlayEl.classList.add('is-open');

  // Focus apply button
  setTimeout(() => applyBtn.focus(), 100);
}

function closeOverlay() {
  if (!overlayEl) return;
  overlayEl.classList.remove('is-open');
  document.body.style.overflow = '';
  overlayCallbacks = null;
}

function updateTranscript(text, isFinal) {
  if (!overlayEl) return;
  const el = overlayEl.querySelector('#voice-transcript');
  const applyBtn = overlayEl.querySelector('#voice-apply');

  if (!text) {
    el.className = 'voice-overlay__transcript';
    el.innerHTML = `<span class="voice-overlay__cursor"></span>`;
    applyBtn.disabled = true;
    return;
  }

  if (isFinal) {
    el.className = 'voice-overlay__transcript is-final';
    el.textContent = text;
    applyBtn.disabled = false;
  } else {
    el.className = 'voice-overlay__transcript is-active';
    el.innerHTML = `${text}<span class="voice-overlay__cursor"></span>`;
    applyBtn.disabled = false;
  }
}

/* ============================================
   RECOGNITION
   ============================================ */

let activeRecognition = null;

/**
 * شروع جستجوی صوتی
 * @param {Object} opts
 * @param {string} [opts.lang='fa-IR']
 * @param {Function} [opts.onApply] — (text) => void — وقتی کاربر روی «جستجو» کلیک کرد
 * @param {Function} [opts.onCancel] — () => void
 * @param {Function} [opts.onError] — (errorCode) => void
 */
export function startVoiceSearch(opts = {}) {
  const SpeechRecognition = getSpeechRecognition();

  if (!SpeechRecognition) {
    opts.onError?.('unsupported');
    return { stop: () => {} };
  }

  // اگه قبلاً فعاله، متوقف کن
  if (activeRecognition) {
    try { activeRecognition.stop(); } catch {}
    activeRecognition = null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = opts.lang || 'fa-IR';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  activeRecognition = recognition;

  let finalText = '';

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }

    if (final) {
      finalText = final;
      updateTranscript(final, true);
    } else if (interim) {
      updateTranscript(interim, false);
    }
  };

  recognition.onerror = (event) => {
    activeRecognition = null;

    const code = event.error;

    // این‌ها خطای کاربرن، نه خطای سیستم
    const silentErrors = ['no-speech', 'aborted'];
    if (!silentErrors.includes(code)) {
      opts.onError?.(code);
    }

    closeOverlay();
  };

  recognition.onend = () => {
    activeRecognition = null;

    // اگه متن نهایی داریم، overlay باز بمونه تا کاربر تأیید کنه
    // اگه نداریم، ببندش
    if (!finalText) {
      setTimeout(() => {
        // فقط اگه کاربر خودش نبسته
        if (overlayEl?.classList.contains('is-open')) {
          closeOverlay();
        }
      }, 500);
    }
  };

  // باز کردن overlay + شروع ضبط
  openOverlay({
    onApply: (text) => {
      opts.onApply?.(text);
    },
    onCancel: () => {
      try { recognition.stop(); } catch {}
      opts.onCancel?.();
    },
  });

  try {
    recognition.start();
  } catch (err) {
    console.error('Voice search start failed:', err);
    closeOverlay();
    opts.onError?.('start-failed');
  }

  return {
    stop: () => {
      try { recognition.stop(); } catch {}
      closeOverlay();
    },
  };
}

/* ============================================
   AUTO-ATTACH MIC BUTTON
   ============================================ */

/**
 * اضافه کردن دکمه میکروفون به یک search box
 * @param {Object} opts
 * @param {HTMLInputElement} opts.input — input عنصر
 * @param {HTMLElement} opts.container — والد (search-box یا header__search)
 * @param {HTMLElement} [opts.insertBefore] — قبل از این عنصر insert کن (default: آخر)
 * @param {Function} opts.onResult — (text) => void
 */
export function attachVoiceButton(opts = {}) {
  const { input, container, insertBefore, onResult } = opts;

  if (!input || !container) return null;

  // اگه دکمه قبلاً اضافه شده
  if (container.querySelector('.voice-btn')) {
    return container.querySelector('.voice-btn');
  }

  // اگه پشتیبانی نمی‌شه، اصلاً نساز
  if (!isVoiceSearchSupported()) {
    return null;
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'voice-btn';
  btn.setAttribute('aria-label', 'جستجوی صوتی');
  btn.setAttribute('title', 'جستجوی صوتی');
  btn.innerHTML = MIC_ICON;

  let activeSession = null;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeSession) {
      activeSession.stop();
      activeSession = null;
      btn.classList.remove('is-listening');
      return;
    }

    btn.classList.add('is-listening');

    activeSession = startVoiceSearch({
      lang: 'fa-IR',
      onApply: (text) => {
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
        onResult?.(text);
      },
      onCancel: () => {
        activeSession = null;
        btn.classList.remove('is-listening');
      },
      onError: (code) => {
        activeSession = null;
        btn.classList.remove('is-listening');
        console.warn('[VoiceSearch] error:', code);
      },
    });
  });

  // Insert
  if (insertBefore) {
    container.insertBefore(btn, insertBefore);
  } else {
    container.appendChild(btn);
  }

  return btn;
}