/* ============================================
   COMPARE FLOATING BAR — Phase B.5
   ============================================ */

import { products } from '../data/products.js';
import { compare, onChange, KEYS } from '../store/state.js';
import { toast } from '../components/toast.js';

const ICONS = {
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
};

let barEl = null;
let thumbsEl = null;
let countEl = null;
let clearBtn = null;
let ctaLink = null;
let isMounted = false;

/* ============================================
   HELPERS
   ============================================ */

function getBasePath() {
  return window.MS_BASE_PATH || './';
}

function getProductById(id) {
  return products.find((p) => p.id === id);
}

function getProductImage(product) {
  if (!product) return '';
  const BASE = getBasePath();
  if (product.image) {
    if (product.image.startsWith('http') || product.image.startsWith('/')) {
      return product.image;
    }
    return BASE + product.image;
  }
  return `${BASE}assets/images/products/${product.id}.jpg`;
}

function fa(n) {
  return Number(n).toLocaleString('fa-IR');
}

/* ============================================
   BUILD
   ============================================ */

function buildBar() {
  const el = document.createElement('div');
  el.className = 'compare-bar';
  el.id = 'compare-bar';
  el.setAttribute('role', 'region');
  el.setAttribute('aria-label', 'نوار مقایسه محصولات');
  el.setAttribute('aria-hidden', 'true');

  const basePath = getBasePath();

  el.innerHTML = `
    <div class="compare-bar__inner">
      <div class="compare-bar__info">
        <div class="compare-bar__thumbs" id="compare-bar-thumbs"></div>
        <div class="compare-bar__text">
          <span class="compare-bar__count" id="compare-bar-count">۰</span>
          <span class="compare-bar__label">محصول برای مقایسه</span>
        </div>
      </div>

      <div class="compare-bar__actions">
        <button
          type="button"
          class="compare-bar__clear"
          id="compare-bar-clear"
          aria-label="پاک کردن لیست مقایسه"
        >
          ${ICONS.trash}
          <span>پاک کردن</span>
        </button>

        <a
          href="${basePath}compare.html"
          class="compare-bar__cta"
          id="compare-bar-cta"
        >
          <span>مقایسه کن</span>
          ${ICONS.arrow}
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(el);
  return el;
}

/* ============================================
   RENDER THUMBS
   ============================================ */

function renderThumbs(items) {
  if (!thumbsEl) return;

  const MAX_VISIBLE = 3;
  const visible = items.slice(0, MAX_VISIBLE);
  const remaining = items.length - MAX_VISIBLE;

  const thumbsHTML = visible.map((item) => {
    const product = getProductById(item.id);
    const imgSrc = getProductImage(product);

    return `
      <div class="compare-bar__thumb" title="${product?.name || item.name}">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${product?.name || ''}" loading="lazy" onerror="this.style.display='none';" />`
          : ''}
      </div>
    `;
  }).join('');

  const moreHTML = remaining > 0
    ? `<div class="compare-bar__thumb compare-bar__thumb--more">+${fa(remaining)}</div>`
    : '';

  thumbsEl.innerHTML = thumbsHTML + moreHTML;
}

/* ============================================
   UPDATE
   ============================================ */

function updateBar(items) {
  if (!barEl) return;

  const list = Array.isArray(items) ? items : compare.get();
  const count = list.length;
  const shouldShow = count >= 2;
  const isVisible = barEl.classList.contains('is-visible');

  // Toggle visibility
  if (shouldShow !== isVisible) {
    barEl.classList.toggle('is-visible', shouldShow);
    barEl.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    document.body.classList.toggle('has-compare-bar', shouldShow);
  }

  // Update content only if visible
  if (shouldShow) {
    if (countEl) countEl.textContent = fa(count);
    renderThumbs(list);
  }
}

/* ============================================
   INIT
   ============================================ */

export function initCompareBar() {
  if (isMounted) return;

  // Skip on compare page itself
  const path = window.location.pathname;
  if (path.includes('compare.html')) {
    return;
  }

  isMounted = true;

  barEl = buildBar();
  thumbsEl = barEl.querySelector('#compare-bar-thumbs');
  countEl = barEl.querySelector('#compare-bar-count');
  clearBtn = barEl.querySelector('#compare-bar-clear');
  ctaLink = barEl.querySelector('#compare-bar-cta');

  // Listen to changes
  onChange(KEYS.compare, (list) => {
    updateBar(list);
  });

  // Initial render
  updateBar(compare.get());

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const items = [...compare.get()];
      if (!items.length) return;

      items.forEach((item) => compare.toggle(item));

      toast({
        type: 'info',
        title: 'لیست مقایسه پاک شد',
        message: `${fa(items.length)} محصول حذف شد`,
        duration: 2200,
      });
    });
  }
}