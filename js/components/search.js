/* ============================================
   LIVE SEARCH
   جستجوی زنده با Dropdown
   ============================================ */

import { products, formatPrice } from '../data/products.js';

const MAX_RESULTS = 6;

const ICONS = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  phone:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
};

/* ---------- Normalize ---------- */
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .trim();
}

/* ---------- Search ---------- */
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

/* ---------- Render Item ---------- */
function renderItem(p) {
  return `
    <a href="/product/${p.slug || p.id}" class="search-item" data-search-item="${p.id}">
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

/* ---------- Render Dropdown ---------- */
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

/* ---------- Init ---------- */
export function initSearch() {
  const inputs = document.querySelectorAll('.header__search-input');
  if (!inputs.length) return;

  inputs.forEach((input) => {
    const wrapper = input.closest('.header__search');
    if (!wrapper) return;

    // ساخت Dropdown
    let dropdown = wrapper.querySelector('.search-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'search-dropdown';
      wrapper.appendChild(dropdown);
    }

    let debounceTimer;

    // Input event
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const val = e.target.value;
      debounceTimer = setTimeout(() => {
        renderDropdown(dropdown, val.trim());
      }, 180);
    });

    // Focus
    input.addEventListener('focus', () => {
      if (input.value.trim()) {
        renderDropdown(dropdown, input.value.trim());
      }
    });

    // Close on blur (با تأخیر تا کلیک روی آیتم‌ها گرفته شود)
    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.classList.remove('is-open'), 180);
    });

    // ESC
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('is-open');
        input.blur();
      }
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header__search')) {
      document
        .querySelectorAll('.search-dropdown.is-open')
        .forEach((d) => d.classList.remove('is-open'));
    }
  });
}