/* ============================================
   PERFORMANCE UTILITIES
   Service Worker + Preload + Prefetch + Idle Work
   ============================================ */

/* ============================================
   SERVICE WORKER
   ============================================ */

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  // فقط روی https یا localhost
  const isHttps = location.protocol === 'https:';
  const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (!isHttps && !isLocalhost) return;

  window.addEventListener('load', () => {
    // مسیر بر اساس base path
    const basePath = window.MS_BASE_PATH || './';
    const swPath = basePath + 'sw.js';

    navigator.serviceWorker
      .register(swPath, { scope: basePath })
      .then((reg) => {
        console.log(
          '%c✓ Service Worker registered',
          'color:#18B981;font-weight:bold;'
        );

        // چک برای update
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('%c↻ New version available', 'color:#F59E0B;font-weight:bold;');
            }
          });
        });
      })
      .catch((err) => {
        console.warn('SW registration failed:', err);
      });
  });
}

/* ============================================
   PRELOAD — dynamically
   ============================================ */

export function preloadCritical() {
  const basePath = window.MS_BASE_PATH || './';

  const preloads = [
    { href: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2', as: 'font', type: 'font/woff2', cross: true },
    { href: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Bold.woff2', as: 'font', type: 'font/woff2', cross: true },
  ];

  preloads.forEach((p) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = p.href;
    if (p.as) link.as = p.as;
    if (p.type) link.type = p.type;
    if (p.cross) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/* ============================================
   PREFETCH ON HOVER
   ============================================ */

const prefetched = new Set();

export function prefetchOnHover() {
  const links = document.querySelectorAll('a[href$=".html"], a[href*=".html?"]');

  links.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      const href = link.getAttribute('href');
      if (!href || prefetched.has(href)) return;

      // فقط لینک‌های داخلی
      if (href.startsWith('http') && !href.includes(location.hostname)) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      prefetched.add(href);

      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = href;
      prefetchLink.as = 'document';
      document.head.appendChild(prefetchLink);

      // پاک کردن بعد از ۵ ثانیه
      setTimeout(() => prefetchLink.remove(), 5000);
    }, { once: true });
  });
}

/* ============================================
   IDLE WORK (کارهای غیرحیاتی)
   ============================================ */

export function runOnIdle(callback) {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, { timeout: 2000 });
  }
  // Fallback
  return setTimeout(callback, 200);
}

export function prefetchOnIdle() {
  runOnIdle(() => {
    const basePath = window.MS_BASE_PATH || './';
    const urls = [
      basePath + 'category.html',
      basePath + 'cart.html',
    ];

    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document';
      document.head.appendChild(link);
    });
  });
}

/* ============================================
   IMAGE LAZY IMPROVEMENTS
   ============================================ */

export function enhanceImages() {
  // بعد از DOM آماده، همه تصاویر اضافه‌شده رو بهبود بده
  document.querySelectorAll('img').forEach((img) => {
    if (!img.loading) img.loading = 'lazy';
    if (!img.decoding) img.decoding = 'async';
  });

  // MutationObserver برای تصاویر جدید (کارت محصولات)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;

        if (node.tagName === 'IMG') {
          if (!node.loading) node.loading = 'lazy';
          if (!node.decoding) node.decoding = 'async';
        }

        node.querySelectorAll?.('img').forEach((img) => {
          if (!img.loading) img.loading = 'lazy';
          if (!img.decoding) img.decoding = 'async';
        });
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

/* ============================================
   PASSIVE EVENTS (اگه جایی مانده)
   ============================================ */

export function applyPassiveScroll() {
  const selectors = ['wheel', 'touchstart', 'touchmove'];
  selectors.forEach((evt) => {
    window.addEventListener(evt, () => {}, { passive: true });
  });
}

/* ============================================
   INIT ALL
   ============================================ */

export function initPerformance() {
  preloadCritical();
  registerServiceWorker();
  enhanceImages();
  prefetchOnIdle();
  // prefetchOnHover رو با تأخیر بزن (تا بعد از رندر)
  runOnIdle(() => prefetchOnHover());
}