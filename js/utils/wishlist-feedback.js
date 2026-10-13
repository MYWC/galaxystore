/* ============================================
   WISHLIST FLOATING NOTIFICATION — Phase B.6
   Flying heart + burst + toast + header sync
   ============================================ */

import { toast } from '../components/toast.js';
import { wishlist, onChange, KEYS } from '../store/state.js';

const HEART_SVG = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
`;

/* ============================================
   HELPERS
   ============================================ */

function getTargetHeart() {
  return (
    document.querySelector('.header__action[aria-label*="علاقه"]') ||
    document.querySelector('.header__action[href*="wishlist"]') ||
    document.querySelector('[data-badge="wishlist"]')?.closest('.header__action')
  );
}

function getRect(el) {
  return el.getBoundingClientRect();
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* ============================================
   FLYING HEART
   ============================================ */

function flyHeart(fromEl) {
  if (!fromEl) return;

  const fromRect = getRect(fromEl);
  const target = getTargetHeart();

  const startX = fromRect.left + fromRect.width / 2;
  const startY = fromRect.top + fromRect.height / 2;

  let endX = window.innerWidth - 40;
  let endY = 40;

  if (target) {
    const targetRect = getRect(target);
    endX = targetRect.left + targetRect.width / 2;
    endY = targetRect.top + targetRect.height / 2;
  }

  // Create heart element
  const heart = document.createElement('div');
  heart.className = 'wish-fly-heart';
  heart.innerHTML = HEART_SVG;
  heart.style.left = `${startX}px`;
  heart.style.top = `${startY}px`;

  document.body.appendChild(heart);

  // Animate with Web Animations API
  const duration = 850;
  const start = performance.now();

  // Control point for a nice arc (bends upward)
  const midX = (startX + endX) / 2;
  const midY = Math.min(startY, endY) - 80;

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = easeOutCubic(t);

    // Quadratic Bezier curve
    const oneMinus = 1 - eased;
    const x = oneMinus * oneMinus * startX + 2 * oneMinus * eased * midX + eased * eased * endX;
    const y = oneMinus * oneMinus * startY + 2 * oneMinus * eased * midY + eased * eased * endY;

    const scale = 0.4 + eased * 0.9;
    const opacity = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;

    heart.style.transform = `translate3d(${x - startX}px, ${y - startY}px, 0) translate(-50%, -50%) scale(${scale})`;
    heart.style.opacity = String(opacity);

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      heart.remove();
    }
  }

  requestAnimationFrame(tick);
}

/* ============================================
   BURST RINGS AROUND BUTTON
   ============================================ */

function burstRings(btn) {
  if (!btn) return;

  // Ensure position context
  const computed = getComputedStyle(btn);
  if (computed.position === 'static') {
    btn.style.position = 'relative';
  }

  const existing = btn.querySelector('.wish-burst');
  if (existing) existing.remove();

  const burst = document.createElement('span');
  burst.className = 'wish-burst';
  burst.innerHTML = `
    <span class="wish-burst__ring"></span>
    <span class="wish-burst__ring wish-burst__ring--2"></span>
  `;

  btn.appendChild(burst);

  setTimeout(() => burst.remove(), 800);
}

/* ============================================
   BUTTON PULSE
   ============================================ */

function pulseButton(btn) {
  if (!btn) return;
  btn.classList.remove('wish-pulse');
  void btn.offsetWidth;
  btn.classList.add('wish-pulse');

  setTimeout(() => btn.classList.remove('wish-pulse'), 700);
}

/* ============================================
   HEADER HEART + BADGE
   ============================================ */

function shakeHeaderHeart() {
  const target = getTargetHeart();
  if (!target) return;

  target.classList.remove('header__action--wishlist-shake');
  void target.offsetWidth;
  target.classList.add('header__action--wishlist-shake');

  setTimeout(() => target.classList.remove('header__action--wishlist-shake'), 800);

  // Badge pop
  const badge = target.querySelector('[data-badge="wishlist"], .header__action-badge');
  if (badge) {
    badge.classList.remove('wish-badge-pop');
    void badge.offsetWidth;
    badge.classList.add('wish-badge-pop');
    setTimeout(() => badge.classList.remove('wish-badge-pop'), 700);
  }
}

/* ============================================
   PUBLIC API
   ============================================ */

/**
 * فیدبک بصری کامل وقتی محصولی به علاقه‌مندی اضافه می‌شه
 * @param {Object} opts
 * @param {HTMLElement} opts.btn — دکمه‌ای که کاربر روش کلیک کرده
 * @param {string} opts.productName — نام محصول (برای toast)
 * @param {boolean} [opts.added=true] — آیا اضافه شد یا حذف
 */
export function wishlistFeedback({ btn, productName, added = true } = {}) {
  // Only do the full show if we added (not removed)
  if (added) {
    if (btn) {
      burstRings(btn);
      pulseButton(btn);
      flyHeart(btn);
    }
    shakeHeaderHeart();
  } else {
    // Removing — just subtle pulse
    if (btn) pulseButton(btn);
  }
}

/* ============================================
   TOAST INTEGRATION
   ============================================ */

let lastCount = null;

/**
 * نمایش toast زیبا برای تغییرات wishlist
 * با رعایت نرخ (اگه سریع چند تا اضافه شد، فقط آخرین رو نشون بده)
 */
let toastTimer = null;

export function showWishlistToast({ added, productName }) {
  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast({
      type: 'wishlist',
      icon: 'heart',
      title: added ? 'به علاقه‌مندی‌ها اضافه شد ❤️' : 'از علاقه‌مندی‌ها حذف شد',
      message: productName || '',
      duration: 2200,
      position: 'top-left',
    });
  }, 120);
}

/* ============================================
   GLOBAL LISTENER — Auto-feedback on wishlist toggle
   ============================================ */

let initialized = false;

/**
 * به‌طور خودکار به کلیک‌های `[data-wishlist]` گوش می‌ده و فیدبک می‌ده
 * (اگه قبلاً توی global handler پیاده‌سازی نشده)
 *
 * برای پروژه‌هایی که توی global handler فیدبک اضافه کردن، می‌تونن
 * صراحتاً `wishlistFeedback()` رو صدا بزنن.
 */
export function initWishlistFeedback() {
  if (initialized) return;
  initialized = true;

  // در ابتدا، شماره اولیه wishlist رو ذخیره کن
  lastCount = wishlist.count();

  // اگه تعداد wishlist تغییر کرد و یک toast مناسب نداشتیم،
  // این listener عمومی می‌تونه کمک کنه. اما فعلاً از صدا زدن مستقیم
  // `wishlistFeedback` استفاده می‌کنیم چون دکمه و متن محصول رو داریم.

  console.log('%c✓ Wishlist feedback initialized (B.6)', 'color:#18B981;font-weight:bold;');
}