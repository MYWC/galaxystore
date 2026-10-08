/* ============================================
   LIVE SEARCH — با Base Path
   ============================================ */

import { products, formatPrice } from '../data/products.js';

const MAX_RESULTS = 6;

const ICONS = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  phone:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
};

/* ============================================
   BASE PATH
   ============================================ */

function getBasePath() {
  // از layout.js استفاده کن اگه تنظیم شده
  if (window.MS_BASE_PATH) return window.MS_BASE_PATH;

  // Fallback: تشخیص دستی
  const KNOWN_SUBFOLDERS = ['account', 'auth', 'magazine', 'support', 'legal'];
  const path = window.location.pathname;
  const cleanPath = path.split(/[?#]/)[0];
  const parts = cleanPath.split('/').filter(Boolean);

  if (parts.length && parts[parts.length - 1].includes('.')) {
    parts.pop();
  }

  let depth = 0;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (KNOWN_SUBFOLDERS.includes(parts[i])) {
      depth++;
    } else {
      break;
    }
  }

  return depth > 0 ? '../'.repeat(depth) : './';
}

/* ============================================
   NORMALIZE
   ============================================ */

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .trim();
}

/* ============================================
   SEARCH
   ============================================ */

function search(query) {
  const q = normalize(query);
  if (!q) return [];

  return products
    .filter((p) => {
      const haystack = normalize(
        [p.name, p.brand, p.model, p.storage, p.ram, p.color]
          .filter(Boolean)
          .join(' ')
      );
      return haystack.includes(q);
    })
    .slice(0, MAX_RESULTS);
}

/* ============================================
   RENDER ITEM
   ============================================ */

function renderItem(p) {
  const BASE = getBasePath();
  const url = `${BASE}product.html?id=${p.id}`;

  return `
    <a href="${url}" class="search-item" data-search-item="${p.id}">
      <span class="search-item__img">${ICONS.phone}</span>
      <span class="search-item__info">
        <span class="search-item__name">${p.name}</span>
        <span class="search-item__meta">${p.brand}${p.storage ? ` • ${p.storage}` : ''}</span>
      </span>
      <span class="search-item__price">
        ${formatPrice(p.price)}
        <span>تومان</span>
      </span>
    </a>
  `;
}

/* ============================================
   RENDER DROPDOWN
   ============================================ */

function renderDropdown(dropdown, query) {
  if (!query) {
    dropdown.classList.remove('is-open');
    dropdown.innerHTML = '';
    return;
  }

  const results = search(query);

  if (!results.length) {
    dropdown.innerHTML = `
      <div class="search-dropdown__empty">
        <div class="search-dropdown__empty-icon">${ICONS.search}</div>
        <div class="search-dropdown__empty-title">نتیجه‌ای یافت نشد</div>
        <div class="search-dropdown__empty-text">
          عبارت دیگری را امتحان کنید
        </div>
      </div>
    `;
    dropdown.classList.add('is-open');
    return;
  }

  dropdown.innerHTML = `
    <div class="search-dropdown__section">
      <div class="search-dropdown__title">نتایج جستجو</div>
      ${results.map(renderItem).join('')}
    </div>

    <div class="search-dropdown__footer">
      <span>
        ${results.length} نتیجه
      </span>
      <span>
        بستن با
        <kbd>Esc</kbd>
      </span>
    </div>
  `;

  dropdown.classList.add('is-open');
}

/* ============================================
   INIT
   ============================================ */

export function initSearch() {
  const inputs = document.querySelectorAll('.header__search-input');
  if (!inputs.length) return;

  inputs.forEach((input) => {
    const wrapper = input.closest('.header__search');
    if (!wrapper) return;

    let dropdown = wrapper.querySelector('.search-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'search-dropdown';
      wrapper.appendChild(dropdown);
    }

    let debounceTimer;

    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const val = e.target.value;
      debounceTimer = setTimeout(() => {
        renderDropdown(dropdown, val.trim());
      }, 180);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim()) {
        renderDropdown(dropdown, input.value.trim());
      }
    });

    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.classList.remove('is-open'), 180);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('is-open');
        input.blur();
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header__search')) {
      document
        .querySelectorAll('.search-dropdown.is-open')
        .forEach((d) => d.classList.remove('is-open'));
    }
  });
}