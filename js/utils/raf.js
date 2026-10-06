/* ============================================
   RAF — Unified Animation Frame Loop
   یک حلقه واحد برای همهی انیمیشنها
   ============================================ */

const callbacks = new Set();
let rafId = null;
let lastTime = 0;
let isRunning = false;

function loop(time) {
  // Delta time برای انیمیشنهای مبتنی بر زمان
  const delta = lastTime ? time - lastTime : 16;
  lastTime = time;

  // اجرای همه callbacks
  callbacks.forEach((cb) => {
    try {
      cb(time, delta);
    } catch (e) {
      console.error('RAF callback error:', e);
    }
  });

  if (callbacks.size > 0) {
    rafId = requestAnimationFrame(loop);
  } else {
    isRunning = false;
    lastTime = 0;
  }
}

/**
 * اضافه کردن یک callback به حلقه RAF
 * @param {Function} cb - callback با امضای (time, delta)
 * @returns {Function} - تابع برای حذف
 */
export function onFrame(cb) {
  callbacks.add(cb);
  if (!isRunning) {
    isRunning = true;
    lastTime = 0;
    rafId = requestAnimationFrame(loop);
  }

  return () => callbacks.delete(cb);
}

/**
 * اجرای یک callback فقط یکبار در فریم بعد
 */
export function nextFrame(cb) {
  return requestAnimationFrame(cb);
}

/**
 * اجرای callback پس از دو فریم (برای انیمیشن initial state)
 */
export function doubleFrame(cb) {
  return requestAnimationFrame(() => requestAnimationFrame(cb));
}

/**
 * تشخیص نرخ فریم دستگاه
 */
export function detectFPS() {
  return new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();
    const duration = 500;

    const check = (time) => {
      frames++;
      if (time - start < duration) {
        requestAnimationFrame(check);
      } else {
        const fps = Math.round((frames / (time - start)) * 1000);
        resolve(fps);
      }
    };

    requestAnimationFrame(check);
  });
}

/**
 * اجرای throttled callback در scroll (بهینه برای 120fps)
 */
export function onScroll(cb) {
  let ticking = false;
  let lastY = 0;

  const handler = () => {
    lastY = window.scrollY;

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        cb(lastY);
        ticking = false;
      });
    }
  };

  window.addEventListener('scroll', handler, { passive: true });

  // اجرای اولیه
  cb(window.scrollY);

  return () => window.removeEventListener('scroll', handler);
}