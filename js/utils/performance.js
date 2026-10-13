/* ============================================
   PERFORMANCE UTILITIES
   ============================================ */

/* ============================================
   SERVICE WORKER
   ============================================ */

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const isHttps = location.protocol === 'https:';
  const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (!isHttps && !isLocalhost) return;

  window.addEventListener('load', () => {
    const basePath = window.MS_BASE_PATH || './';
    const swPath = basePath + 'sw.js';

    navigator.serviceWorker
      .register(swPath, { scope: basePath })
      .then(() => {
        console.log('%c✓ Service Worker registered', 'color:#18B981;font-weight:bold;');
      })
      .catch((err) => {
        console.warn('SW registration failed:', err);
      });
  });
}

/* ============================================
   PRELOAD — حذف شد (font از @import لود میشه)
   ============================================ */

export function preloadCritical() {
  // ⚠️ preload font با @import تداخل داشت، حذف شد
  // font از طریق base.css با @import لود میشه
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
      if (href.startsWith('http') && !href.includes(location.hostname)) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      prefetched.add(href);

      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = href;
      prefetchLink.as = 'document';
      document.head.appendChild(prefetchLink);

      setTimeout(() => prefetchLink.remove(), 5000);
    }, { once: true });
  });
}

/* ============================================
   IDLE WORK
   ============================================ */

export function runOnIdle(callback) {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, { timeout: 2000 });
  }
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
   IMAGES
   ============================================ */

export function enhanceImages() {
  document.querySelectorAll('img').forEach((img) => {
    if (!img.loading) img.loading = 'lazy';
    if (!img.decoding) img.decoding = 'async';
  });

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
   INIT ALL
   ============================================ */

export function initPerformance() {
  registerServiceWorker();
  enhanceImages();
  prefetchOnIdle();
  runOnIdle(() => prefetchOnHover());
}