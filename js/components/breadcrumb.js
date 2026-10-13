/* ============================================
   BREADCRUMB COMPONENT — Phase B.1
   Unified breadcrumb + auto JSON-LD schema
   ============================================ */

import { SITE_URL } from '../utils/seo.js';

const SEPARATOR_SVG = `<svg class="breadcrumb__sep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function resolveUrl(href, baseUrl) {
  if (!href) return undefined;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  if (href.startsWith('#')) return undefined;

  try {
    if (href.startsWith('/')) return SITE_URL + href;
    return new URL(href, baseUrl).href;
  } catch {
    return undefined;
  }
}

/* ============================================
   RENDER
   ============================================ */

/**
 * ساخت HTML breadcrumb
 * @param {Array<{label: string, href?: string}>} items
 * @returns {string}
 */
export function renderBreadcrumb(items = []) {
  if (!items.length) return '';

  const parts = items.map((item, i) => {
    const isLast = i === items.length - 1;

    if (isLast || !item.href) {
      return `<span class="breadcrumb__current" aria-current="page">${escapeHtml(item.label)}</span>`;
    }

    return `<a href="${escapeHtml(item.href)}" class="breadcrumb__link">${escapeHtml(item.label)}</a>`;
  });

  return `
    <nav class="breadcrumb" aria-label="مسیر صفحه">
      ${parts.join(SEPARATOR_SVG)}
    </nav>
  `;
}

/* ============================================
   JSON-LD SCHEMA
   ============================================ */

/**
 * تزریق JSON-LD breadcrumb به head
 * @param {Array<{label: string, href?: string}>} items
 */
export function injectBreadcrumbSchema(items = []) {
  if (!items || items.length < 2) return;

  const currentUrl = window.location.href;

  const listItem = items.map((item, i) => {
    const isLast = i === items.length - 1;
    const url = isLast
      ? currentUrl
      : resolveUrl(item.href, currentUrl);

    const entry = {
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
    };

    if (url) entry.item = url;

    return entry;
  });

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: listItem,
  };

  // حذف نمونه قبلی
  document.getElementById('ld-breadcrumb-auto')?.remove();

  const script = document.createElement('script');
  script.id = 'ld-breadcrumb-auto';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/* ============================================
   MOUNT
   ============================================ */

/**
 * ساخت + mount + تزریق schema
 * @param {HTMLElement|string} container
 * @param {Array} items
 */
export function mountBreadcrumb(container, items = []) {
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!el) return;

  el.outerHTML = renderBreadcrumb(items);
  injectBreadcrumbSchema(items);
}

/* ============================================
   AUTO — استانداردسازی breadcrumb های موجود
   ============================================ */

/**
 * پیدا کردن همه `nav.breadcrumb` ها:
 * - کلاس‌های استاندارد اضافه می‌کنه
 * - aria درست می‌ذاره
 * - JSON-LD تزریق می‌کنه
 */
export function autoBreadcrumb() {
  const navs = document.querySelectorAll('nav.breadcrumb');

  navs.forEach((nav) => {
    if (nav.dataset.breadcrumbReady === 'true') return;
    nav.dataset.breadcrumbReady = 'true';

    // aria-label
    if (!nav.getAttribute('aria-label')) {
      nav.setAttribute('aria-label', 'مسیر صفحه');
    }

    const links = Array.from(nav.querySelectorAll('a'));
    const currentEl = nav.querySelector('span');

    // استانداردسازی کلاس‌ها
    links.forEach((link) => {
      if (!link.classList.contains('breadcrumb__link')) {
        link.classList.add('breadcrumb__link');
      }
    });

    if (currentEl) {
      if (!currentEl.classList.contains('breadcrumb__current')) {
        currentEl.classList.add('breadcrumb__current');
      }
      if (!currentEl.hasAttribute('aria-current')) {
        currentEl.setAttribute('aria-current', 'page');
      }
    }

    // همه SVG ها رو استاندارد کن
    nav.querySelectorAll('svg').forEach((svg) => {
      if (!svg.classList.contains('breadcrumb__sep')) {
        svg.classList.add('breadcrumb__sep');
      }
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
    });

    // ساخت items برای schema
    const items = [];

    links.forEach((link) => {
      const label = link.textContent.trim();
      if (!label) return;
      items.push({
        label,
        href: link.getAttribute('href') || undefined,
      });
    });

    if (currentEl) {
      const label = currentEl.textContent.trim();
      if (label) items.push({ label });
    }

    if (items.length >= 2) {
      injectBreadcrumbSchema(items);
    }
  });
}