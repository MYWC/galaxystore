/* ============================================
   LIVE SEARCH — با Base Path + Recent Searches (B.3) + Voice (B.4)
   ============================================ */

import { products, formatPrice } from '../data/products.js';
import { attachVoiceButton } from '../utils/voice-search.js';

const MAX_RESULTS = 6;
const RECENT_KEY = 'ms_recent_searches';
const MAX_RECENT_IN_DROPDOWN = 4;
const MAX_RECENT_TOTAL = 10;

const ICONS = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  phone:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  clock:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  close:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  arrow:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
};

/* ============================================
   BASE PATH
   ============================================ */

function getBasePath() {
  if (window.MS_BASE_PATH) return window.MS_BASE_PATH;

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
   RECENT SEARCHES — Shared with search page
   ============================================ */

function getRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return parsed.map((item) => {
      if (typeof item === 'string') {
        return { q: item, ts: Date.now(), type: 'keyword' };
      }
      return item;
    }).filter((item) => item && item.q);
  } catch {
    return [];
  }
}

function removeRecent(query) {
  const list = getRecent();
  const filtered = list.filter((item) => normalize(item.q) !== normalize(query));
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered));
  } catch {}
  return filtered;
}

function clearRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {}
}

function formatRelativeTime(ts) {
  if (!ts) return '';
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'الان';
  if (diffMin < 60) return `${diffMin} دقیقه`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ساعت`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} روز`;
  return '';
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

function renderRecentItem(item) {
  const timeLabel = formatRelativeTime(item.ts);
  return `
    <button type="button" class="search-recent-item" data-recent="${item.q}">
      <span class="search-recent-item__icon">${ICONS.clock}</span>
      <span class="search-recent-item__text">${item.q}</span>
      ${timeLabel ? `<span class="search-recent-item__time">${timeLabel}</span>` : ''}
      <span class="search-recent-item__remove" data-recent-remove="${item.q}" role="button" aria-label="حذف">
        ${ICONS.close}
      </span>
    </button>
  `;
}

/* ============================================
   RENDER DROPDOWN
   ============================================ */

function renderDropdown(dropdown, query, basePath) {
  if (!query) {
    const recent = getRecent().slice(0, MAX_RECENT_IN_DROPDOWN);

    if (!recent.length) {
      dropdown.classList.remove('is-open');
      dropdown.innerHTML = '';
      return;
    }

    dropdown.innerHTML = `
      <div class="search-dropdown__section">
        <div class="search-dropdown__title">
          <span>جستجوهای اخیر</span>
          <button type="button" class="search-dropdown__title-action" data-clear-all-recent>
            پاک کردن
          </button>
        </div>
        <div class="search-dropdown__recent">
          ${recent.map(renderRecentItem).join('')}
        </div>
      </div>

      <div class="search-dropdown__footer">
        <span>${recent.length} مورد اخیر</span>
        <span>
          بستن با
          <kbd>Esc</kbd>
        </span>
      </div>
    `;

    dropdown.classList.add('is-open');
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

    <div class="search-dropdown__section">
      <button type="button" class="search-recent-item" data-show-all="${query}">
        <span class="search-recent-item__icon">${ICONS.search}</span>
        <span class="search-recent-item__text">مشاهده همه نتایج برای «${query}»</span>
        <span class="search-recent-item__icon">${ICONS.arrow}</span>
      </button>
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

  const basePath = getBasePath();

  inputs.forEach((input) => {
    const wrapper = input.closest('.header__search');
    if (!wrapper) return;

    let dropdown = wrapper.querySelector('.search-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'search-dropdown';
      wrapper.appendChild(dropdown);
    }

    // Voice button (Phase B.4)
    attachVoiceButton({
      input,
      container: wrapper,
      insertBefore: dropdown,
      onResult: () => {
        renderDropdown(dropdown, input.value.trim(), basePath);
      },
    });

    let debounceTimer;

    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const val = e.target.value;
      debounceTimer = setTimeout(() => {
        renderDropdown(dropdown, val.trim(), basePath);
      }, 180);
    });

    input.addEventListener('focus', () => {
      const val = input.value.trim();
      renderDropdown(dropdown, val, basePath);
    });

    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.classList.remove('is-open'), 200);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('is-open');
        input.blur();
      }
    });
  });

  /* ---------- Global click delegation ---------- */

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header__search')) {
      document
        .querySelectorAll('.search-dropdown.is-open')
        .forEach((d) => d.classList.remove('is-open'));
      return;
    }

    const removeBtn = e.target.closest('[data-recent-remove]');
    if (removeBtn) {
      e.stopPropagation();
      e.preventDefault();
      const q = removeBtn.dataset.recentRemove;
      removeRecent(q);

      const dd = removeBtn.closest('.search-dropdown');
      const input = removeBtn.closest('.header__search')?.querySelector('.header__search-input');
      if (dd && input) {
        renderDropdown(dd, input.value.trim(), basePath);
      }
      return;
    }

    const clearBtn = e.target.closest('[data-clear-all-recent]');
    if (clearBtn) {
      e.stopPropagation();
      e.preventDefault();
      clearRecent();

      const dd = clearBtn.closest('.search-dropdown');
      if (dd) {
        dd.classList.remove('is-open');
        dd.innerHTML = '';
      }
      return;
    }

    const recentItem = e.target.closest('[data-recent]');
    if (recentItem) {
      e.preventDefault();
      const q = recentItem.dataset.recent;
      const input = recentItem.closest('.header__search')?.querySelector('.header__search-input');
      const dd = recentItem.closest('.search-dropdown');

      if (input) input.value = q;
      if (dd) renderDropdown(dd, q, basePath);
      return;
    }

    const showAll = e.target.closest('[data-show-all]');
    if (showAll) {
      e.preventDefault();
      const q = showAll.dataset.showAll;
      window.location.href = `${basePath}search.html?q=${encodeURIComponent(q)}`;
      return;
    }
  });
}