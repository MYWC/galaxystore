/* ============================================
   FAQ PAGE
   ============================================ */

import { initLayout } from '../components/layout.js';
import { faqCategories, faqItems } from '../data/faq-data.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   STATE
   ============================================ */

const state = {
  category: 'all',
  query: '',
  openIds: new Set(),
};

/* ============================================
   ICONS
   ============================================ */

const ICONS = {
  shipping: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  payment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  warranty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v8c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V5l-8-3z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  return: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
  order: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  account: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

/* ============================================
   NORMALIZE
   ============================================ */

function normalize(str) {
  return (str || '').toLowerCase().replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').trim();
}

/* ============================================
   RENDER — CATEGORIES
   ============================================ */

function renderCategories() {
  const wrap = document.getElementById('faq-categories');
  if (!wrap) return;

  const counts = {};
  faqItems.forEach((item) => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });

  let html = `
    <button class="faq-cat ${state.category === 'all' ? 'is-active' : ''}" data-cat="all" style="--cat-color:#2386D7;--cat-bg:#EAF4FD;">
      <span class="faq-cat__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      </span>
      <span class="faq-cat__title">همه سوالات</span>
      <span class="faq-cat__count">${faqItems.length.toLocaleString('fa-IR')} سوال</span>
    </button>
  `;

  faqCategories.forEach((cat) => {
    html += `
      <button class="faq-cat ${state.category === cat.id ? 'is-active' : ''}" data-cat="${cat.id}" style="--cat-color:${cat.color};--cat-bg:${cat.bg};">
        <span class="faq-cat__icon">${ICONS[cat.icon] || ICONS.order}</span>
        <span class="faq-cat__title">${cat.label}</span>
        <span class="faq-cat__count">${(counts[cat.id] || 0).toLocaleString('fa-IR')} سوال</span>
      </button>
    `;
  });

  wrap.innerHTML = html;
}

/* ============================================
   GET FILTERED
   ============================================ */

function getFiltered() {
  let list = [...faqItems];

  if (state.category !== 'all') {
    list = list.filter((item) => item.category === state.category);
  }

  if (state.query) {
    const q = normalize(state.query);
    list = list.filter((item) => {
      const text = normalize(item.question + ' ' + item.answer.replace(/<[^>]*>/g, ''));
      return text.includes(q);
    });
  }

  return list;
}

/* ============================================
   RENDER — LIST
   ============================================ */

function renderList() {
  const list = document.getElementById('faq-list');
  const empty = document.getElementById('faq-empty');
  const titleEl = document.getElementById('faq-content-title');
  const countEl = document.getElementById('faq-content-count');
  if (!list) return;

  const filtered = getFiltered();

  if (countEl) countEl.textContent = filtered.length.toLocaleString('fa-IR');

  if (titleEl) {
    if (state.query) {
      titleEl.textContent = `نتایج جستجو: ${state.query}`;
    } else if (state.category === 'all') {
      titleEl.textContent = 'همه سوالات';
    } else {
      const cat = faqCategories.find((c) => c.id === state.category);
      titleEl.textContent = cat ? cat.label : 'سوالات';
    }
  }

  if (!filtered.length) {
    list.innerHTML = '';
    list.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }

  list.hidden = false;
  if (empty) empty.hidden = true;

  list.innerHTML = filtered.map((item, index) => {
    const isOpen = state.openIds.has(item.id);
    const num = (index + 1).toLocaleString('fa-IR');

    return `
      <div class="faq-item ${isOpen ? 'is-open' : ''}" data-faq-id="${item.id}">
        <button class="faq-item__question" data-toggle="${item.id}">
          <span class="faq-item__num">${num}</span>
          <span class="faq-item__text">${item.question}</span>
          <span class="faq-item__chev">${ICONS.chevron}</span>
        </button>
        <div class="faq-item__answer">
          <div class="faq-item__answer-inner">
            ${item.answer}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ============================================
   RENDER — FULL
   ============================================ */

function render() {
  renderCategories();
  renderList();
}

/* ============================================
   BIND — CATEGORIES
   ============================================ */

function bindCategories() {
  const wrap = document.getElementById('faq-categories');
  if (!wrap) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;

    state.category = btn.dataset.cat;
    state.query = '';

    const searchInput = document.getElementById('faq-search-input');
    if (searchInput) searchInput.value = '';

    render();
  });
}

/* ============================================
   BIND — SEARCH
   ============================================ */

function bindSearch() {
  const input = document.getElementById('faq-search-input');
  const clearBtn = document.getElementById('faq-search-clear');
  if (!input) return;

  let timer;
  input.addEventListener('input', (e) => {
    const val = e.target.value;

    if (clearBtn) clearBtn.hidden = !val;

    clearTimeout(timer);
    timer = setTimeout(() => {
      state.query = val.trim();
      renderList();
    }, 250);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.hidden = true;
      state.query = '';
      renderList();
      input.focus();
    });
  }
}

/* ============================================
   BIND — TOGGLE
   ============================================ */

function bindToggle() {
  const list = document.getElementById('faq-list');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-toggle]');
    if (!btn) return;

    const id = btn.dataset.toggle;
    const item = btn.closest('.faq-item');
    if (!item) return;

    if (state.openIds.has(id)) {
      state.openIds.delete(id);
      item.classList.remove('is-open');
    } else {
      state.openIds.add(id);
      item.classList.add('is-open');
    }
  });
}

/* ============================================
   BIND — TOGGLE ALL
   ============================================ */

function bindToggleAll() {
  const btn = document.getElementById('faq-toggle-all');
  if (!btn) return;

  const span = btn.querySelector('span');

  btn.addEventListener('click', () => {
    const filtered = getFiltered();
    const allOpen = filtered.every((item) => state.openIds.has(item.id));

    if (allOpen) {
      // بستن همه
      filtered.forEach((item) => state.openIds.delete(item.id));
      btn.classList.remove('is-open');
      if (span) span.textContent = 'باز کردن همه';
    } else {
      // باز کردن همه
      filtered.forEach((item) => state.openIds.add(item.id));
      btn.classList.add('is-open');
      if (span) span.textContent = 'بستن همه';
    }

    // آپدیت UI
    document.querySelectorAll('.faq-item').forEach((el) => {
      const id = el.dataset.faqId;
      el.classList.toggle('is-open', state.openIds.has(id));
    });
  });
}

/* ============================================
   BIND — TAGS
   ============================================ */

function bindTags() {
  document.querySelectorAll('.faq-tag').forEach((tag) => {
    tag.addEventListener('click', () => {
      const text = tag.dataset.tag;
      const input = document.getElementById('faq-search-input');
      if (input) {
        input.value = text;
        state.query = text;
        renderList();

        // اسکرول به محتوا
        const content = document.getElementById('faq-content');
        if (content) {
          const offset = 100;
          const top = content.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });
}

/* ============================================
   BIND — RESET
   ============================================ */

function bindReset() {
  const btn = document.getElementById('faq-reset');
  if (!btn) return;

  btn.addEventListener('click', () => {
    state.category = 'all';
    state.query = '';
    state.openIds.clear();

    const input = document.getElementById('faq-search-input');
    if (input) input.value = '';

    const clearBtn = document.getElementById('faq-search-clear');
    if (clearBtn) clearBtn.hidden = true;

    render();
  });
}

/* ============================================
   INIT
   ============================================ */

function init() {
  render();
  bindCategories();
  bindSearch();
  bindToggle();
  bindToggleAll();
  bindTags();
  bindReset();

  console.log('%c✓ FAQ page loaded', 'color:#18B981;font-weight:bold;');
}

init();