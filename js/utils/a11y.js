/* ============================================
   ACCESSIBILITY UTILITIES
   Skip Link + Focus Trap + Announcements
   ============================================ */

/* ============================================
   SKIP TO CONTENT
   ============================================ */

export function initSkipLink() {
  // اگه وجود داره، کاری نکن
  if (document.getElementById('skip-link')) return;

  const link = document.createElement('a');
  link.id = 'skip-link';
  link.className = 'skip-link';
  link.href = '#main-content';
  link.textContent = 'پرش به محتوای اصلی';

  document.body.insertBefore(link, document.body.firstChild);

  // اضافه کردن id به main content (اولین main یا section)
  const main = document.querySelector('main') || document.getElementById('hero');
  if (main && !main.id) {
    main.id = 'main-content';
    main.setAttribute('tabindex', '-1');
  } else if (main) {
    main.setAttribute('tabindex', '-1');
  }
}

/* ============================================
   SCREEN READER ANNOUNCER
   ============================================ */

let announcer = null;

function ensureAnnouncer() {
  if (announcer) return announcer;

  announcer = document.createElement('div');
  announcer.id = 'sr-announcer';
  announcer.className = 'sr-only';
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  document.body.appendChild(announcer);

  return announcer;
}

/**
 * اعلام پیام به screen reader
 */
export function announce(message, priority = 'polite') {
  const el = ensureAnnouncer();
  el.setAttribute('aria-live', priority);

  // پاک کردن و دوباره ست کردن تا SR دوباره بخونه
  el.textContent = '';
  setTimeout(() => {
    el.textContent = message;
  }, 100);
}

/* ============================================
   FOCUS TRAP (برای Modal, Drawer)
   ============================================ */

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

/**
 * فعال‌سازی focus trap داخل یک عنصر
 */
export function trapFocus(container) {
  if (!container) return () => {};

  const previouslyFocused = document.activeElement;

  const getFocusable = () => {
    return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null && !el.hidden
    );
  };

  const handleKeydown = (e) => {
    if (e.key !== 'Tab') return;

    const focusable = getFocusable();
    if (!focusable.length) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab
      if (document.activeElement === first || !container.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab
      if (document.activeElement === last || !container.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeydown);

  // فوکوس روی اولین عنصر
  setTimeout(() => {
    const focusable = getFocusable();
    if (focusable.length) {
      focusable[0].focus();
    } else {
      container.setAttribute('tabindex', '-1');
      container.focus();
    }
  }, 50);

  // cleanup
  return () => {
    container.removeEventListener('keydown', handleKeydown);
    if (previouslyFocused && previouslyFocused.focus) {
      previouslyFocused.focus();
    }
  };
}

/* ============================================
   MODAL A11Y (aria-hidden for background)
   ============================================ */

/**
 * پنهان کردن محتوای پس‌زمینه از screen reader
 */
export function hideBackground() {
  const main = document.querySelector('main');
  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const footer = document.querySelector('.footer');

  [main, header, nav, footer].forEach((el) => {
    if (el) el.setAttribute('aria-hidden', 'true');
  });
}

export function showBackground() {
  const main = document.querySelector('main');
  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const footer = document.querySelector('.footer');

  [main, header, nav, footer].forEach((el) => {
    if (el) el.removeAttribute('aria-hidden');
  });
}

/* ============================================
   KEYBOARD NAVIGATION — CARDS
   ============================================ */

/**
 * کارت‌های محصول رو قابل فوکوس کن
 */
export function makeCardsFocusable() {
  const cards = document.querySelectorAll('.p-card, .f-card, .category-card, .brand-card');

  cards.forEach((card) => {
    if (card.dataset.a11yReady) return;
    card.dataset.a11yReady = 'true';

    // اگه داخلش لینک هست، لازم نیست
    if (card.querySelector('a')) return;

    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const cta = card.querySelector('[data-add-to-cart]') || card.querySelector('a');
        cta?.click();
      }
    });
  });
}

/* ============================================
   ARIA LABELS — Icon Buttons
   ============================================ */

/**
 * همه دکمه‌های بدون label رو aria-label بگیرن
 */
export function ensureAriaLabels() {
  const iconButtons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');

  iconButtons.forEach((btn) => {
    // اگه متن داره، لازم نیست
    const text = btn.textContent.trim();
    if (text.length > 0 && !btn.querySelector('svg:only-child')) return;

    // اگه فقط SVG داره
    if (btn.querySelector('svg')) {
      // از title دکمه یا کلاس استخراج کن
      const cls = btn.className;
      let label = '';

      if (cls.includes('wish') || cls.includes('heart')) label = 'علاقه‌مندی';
      else if (cls.includes('close')) label = 'بستن';
      else if (cls.includes('cart')) label = 'سبد خرید';
      else if (cls.includes('search')) label = 'جستجو';
      else if (cls.includes('compare')) label = 'مقایسه';
      else if (cls.includes('menu')) label = 'منو';
      else if (cls.includes('prev')) label = 'قبلی';
      else if (cls.includes('next')) label = 'بعدی';

      if (label) btn.setAttribute('aria-label', label);
    }
  });
}

/* ============================================
   REDUCED MOTION SUPPORT
   ============================================ */

export function respectReducedMotion() {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (media.matches) {
    document.documentElement.classList.add('reduced-motion');
  }

  media.addEventListener?.('change', (e) => {
    document.documentElement.classList.toggle('reduced-motion', e.matches);
  });
}

/* ============================================
   LIVE REGIONS — Cart Badge Updates
   ============================================ */

export function announceCartUpdate(count) {
  const fa = count.toLocaleString('fa-IR');
  const msg = count > 0
    ? `${fa} کالا در سبد خرید شما`
    : 'سبد خرید شما خالی است';

  announce(msg, 'polite');
}

/* ============================================
   INIT ALL
   ============================================ */

export function initA11y() {
  initSkipLink();
  ensureAriaLabels();
  respectReducedMotion();

  // MutationObserver برای المان‌های جدید
  const observer = new MutationObserver(() => {
    ensureAriaLabels();
    makeCardsFocusable();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // یک‌بار هم اول
  makeCardsFocusable();
}