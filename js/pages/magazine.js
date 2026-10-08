/* ============================================
   MAGAZINE PAGE
   ============================================ */

import { initLayout } from '../components/layout.js';
import { magazineArticles, magazineCategories } from '../data/magazine-articles.js';
import { toast } from '../components/toast.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   STATE
   ============================================ */

const state = {
  category: 'all',
  sort: 'newest',
  query: '',
  visibleCount: 6,
};

const PER_PAGE = 6;

/* ============================================
   ICONS
   ============================================ */

const ICONS = {
  guide: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  compare: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>`,
  news: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="18" y1="14" x2="12" y2="14"/><line x1="18" y1="18" x2="12" y2="18"/><line x1="18" y1="10" x2="12" y2="10"/></svg>`,
  tips: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2z"/></svg>`,
  review: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  deal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
};

/* ============================================
   NORMALIZE
   ============================================ */

function normalize(str) {
  return (str || '').toLowerCase().replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').trim();
}

/* ============================================
   FILTER + SORT
   ============================================ */

function getFiltered() {
  let list = [...magazineArticles];

  // Category
  if (state.category !== 'all') {
    list = list.filter((a) => a.category === state.category);
  }

  // Search
  if (state.query) {
    const q = normalize(state.query);
    list = list.filter((a) =>
      normalize(`${a.title} ${a.desc} ${a.tag}`).includes(q)
    );
  }

  // Sort
  switch (state.sort) {
    case 'oldest':
      list.sort((a, b) => new Date(a.dateRaw) - new Date(b.dateRaw));
      break;
    case 'popular':
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
    case 'newest':
    default:
      list.sort((a, b) => new Date(b.dateRaw) - new Date(a.dateRaw));
  }

  return list;
}

/* ============================================
   RENDER — CATEGORIES
   ============================================ */

function renderCategories() {
  const wrap = document.getElementById('mag-categories');
  if (!wrap) return;

  const counts = {};
  magazineArticles.forEach((a) => {
    counts[a.category] = (counts[a.category] || 0) + 1;
  });

  const allActive = state.category === 'all' ? 'is-active' : '';

  let html = `
    <button class="mag-cat ${allActive}" data-cat="all">
      <span class="mag-cat__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      </span>
      <span class="mag-cat__title">همه مقالات</span>
      <span class="mag-cat__count">${magazineArticles.length.toLocaleString('fa-IR')} مقاله</span>
    </button>
  `;

  magazineCategories.forEach((cat) => {
    const active = state.category === cat.id ? 'is-active' : '';
    html += `
      <button class="mag-cat ${active}" data-cat="${cat.id}" style="--cat-color:${cat.color}; --cat-bg:${cat.bg};">
        <span class="mag-cat__icon">${ICONS[cat.icon] || ICONS.guide}</span>
        <span class="mag-cat__title">${cat.label}</span>
        <span class="mag-cat__count">${(counts[cat.id] || 0).toLocaleString('fa-IR')} مقاله</span>
      </button>
    `;
  });

  wrap.innerHTML = html;
}

/* ============================================
   RENDER — FEATURED
   ============================================ */

function renderFeatured() {
  const wrap = document.getElementById('mag-featured');
  if (!wrap) return;

  const featured = magazineArticles.find((a) => a.featured);
  if (!featured) {
    wrap.hidden = true;
    return;
  }

  wrap.hidden = false;

  const tagColor = featured.variant === 'teal' ? '#005B59'
    : featured.variant === 'orange' ? '#EF6C1F'
    : '#2386D7';

  const gradient = featured.variant === 'teal'
    ? 'linear-gradient(135deg, #E5F4F2, #D0EAE5)'
    : featured.variant === 'orange'
    ? 'linear-gradient(135deg, #FFF3E6, #FFE4C7)'
    : 'linear-gradient(135deg, #EAF4FD, #D6E8FA)';

  wrap.innerHTML = `
    <a href="article.html?id=${featured.id}" class="mag-featured__card" style="--feat-accent:${tagColor}; --feat-gradient:${gradient};">
      <div class="mag-featured__media">
        <div class="ph">تصویر مقاله ویژه</div>
        <span class="mag-featured__tag">
          <span class="mag-featured__tag-dot"></span>
          ${featured.tag}
        </span>
      </div>

      <div class="mag-featured__content">
        <div class="mag-featured__meta">
          <span class="mag-featured__meta-item">
            ${ICONS.calendar}
            ${featured.date}
          </span>
          <span class="mag-featured__meta-item">
            ${ICONS.clock}
            ${featured.readTime}
          </span>
          <span class="mag-featured__meta-item">
            ${ICONS.eye}
            ${(featured.views || 0).toLocaleString('fa-IR')} بازدید
          </span>
        </div>

        <h2 class="mag-featured__title">${featured.title}</h2>
        <p class="mag-featured__desc">${featured.desc}</p>

        <span class="mag-featured__cta">
          ادامه مطلب
          ${ICONS.arrow}
        </span>
      </div>
    </a>
  `;
}

/* ============================================
   RENDER — ARTICLE CARD
   ============================================ */

function renderCard(a) {
  const tagColor = a.variant === 'teal' ? '#005B59'
    : a.variant === 'orange' ? '#EF6C1F'
    : '#2386D7';

  const gradient = a.variant === 'teal'
    ? 'linear-gradient(135deg, #E5F4F2, #D0EAE5)'
    : a.variant === 'orange'
    ? 'linear-gradient(135deg, #FFF3E6, #FFE4C7)'
    : 'linear-gradient(135deg, #EAF4FD, #D6E8FA)';

  return `
    <a href="article.html?id=${a.id}" class="mag-card" style="--art-accent:${tagColor}; --art-gradient:${gradient};">
      <div class="mag-card__media">
        <div class="ph">تصویر مقاله</div>
        <span class="mag-card__tag">
          <span class="mag-card__tag-dot"></span>
          ${a.tag}
        </span>
      </div>

      <div class="mag-card__body">
        <h3 class="mag-card__title">${a.title}</h3>
        <p class="mag-card__desc">${a.desc}</p>

        <div class="mag-card__meta">
          <span class="mag-card__meta-item">
            ${ICONS.calendar}
            ${a.date}
          </span>
          <span class="mag-card__read">
            ${a.readTime}
            ${ICONS.arrow}
          </span>
        </div>
      </div>
    </a>
  `;
}

/* ============================================
   RENDER — GRID
   ============================================ */

function renderGrid() {
  const grid = document.getElementById('mag-articles-grid');
  const empty = document.getElementById('mag-empty');
  const countEl = document.getElementById('mag-articles-count');
  const titleEl = document.getElementById('mag-articles-title');
  const loadMoreWrap = document.getElementById('mag-load-more');
  if (!grid) return;

  const filtered = getFiltered();

  if (countEl) countEl.textContent = filtered.length.toLocaleString('fa-IR');

  if (titleEl) {
    if (state.category === 'all' && !state.query) {
      titleEl.textContent = 'آخرین مقالات';
    } else if (state.query) {
      titleEl.textContent = `نتایج جستجو: ${state.query}`;
    } else {
      const cat = magazineCategories.find((c) => c.id === state.category);
      titleEl.textContent = cat ? cat.label : 'مقالات';
    }
  }

  if (!filtered.length) {
    grid.innerHTML = '';
    grid.hidden = true;
    if (empty) empty.hidden = false;
    if (loadMoreWrap) loadMoreWrap.hidden = true;
    return;
  }

  grid.hidden = false;
  if (empty) empty.hidden = true;

  const visible = filtered.slice(0, state.visibleCount);
  grid.innerHTML = visible.map(renderCard).join('');

  if (loadMoreWrap) {
    loadMoreWrap.hidden = filtered.length <= state.visibleCount;
  }
}

/* ============================================
   RENDER — FULL
   ============================================ */

function render() {
  renderCategories();
  renderFeatured();
  renderGrid();
}

/* ============================================
   BIND — CATEGORIES
   ============================================ */

function bindCategories() {
  const wrap = document.getElementById('mag-categories');
  if (!wrap) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;

    state.category = btn.dataset.cat;
    state.visibleCount = PER_PAGE;
    render();
  });
}

/* ============================================
   BIND — TABS
   ============================================ */

function bindTabs() {
  const wrap = document.getElementById('mag-tabs');
  if (!wrap) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;

    wrap.querySelectorAll('.mag-tab').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    state.category = btn.dataset.cat;
    state.visibleCount = PER_PAGE;
    render();
  });
}

/* ============================================
   BIND — SEARCH
   ============================================ */

function bindSearch() {
  const input = document.getElementById('mag-search');
  if (!input) return;

  let timer;
  input.addEventListener('input', (e) => {
    clearTimeout(timer);
    const val = e.target.value;
    timer = setTimeout(() => {
      state.query = val.trim();
      state.visibleCount = PER_PAGE;
      renderGrid();
    }, 250);
  });
}

/* ============================================
   BIND — SORT
   ============================================ */

function bindSort() {
  const select = document.getElementById('mag-sort-select');
  if (!select) return;

  select.addEventListener('change', () => {
    state.sort = select.value;
    state.visibleCount = PER_PAGE;
    renderGrid();
  });
}

/* ============================================
   BIND — LOAD MORE
   ============================================ */

function bindLoadMore() {
  const btn = document.getElementById('load-more-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    state.visibleCount += PER_PAGE;
    renderGrid();
  });
}

/* ============================================
   BIND — RESET
   ============================================ */

function bindReset() {
  const btn = document.getElementById('mag-reset');
  if (!btn) return;

  btn.addEventListener('click', () => {
    state.category = 'all';
    state.query = '';
    state.visibleCount = PER_PAGE;

    const search = document.getElementById('mag-search');
    if (search) search.value = '';

    document.querySelectorAll('.mag-tab').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.cat === 'all');
    });

    render();
  });
}

/* ============================================
   BIND — NEWSLETTER
   ============================================ */

function bindNewsletter() {
  const form = document.getElementById('mag-newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const input = document.getElementById('mag-newsletter-email');
    const email = input?.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        type: 'error',
        title: 'ایمیل معتبر نیست',
        duration: 2500,
      });
      return;
    }

    input.value = '';

    toast({
      type: 'success',
      title: 'عضویت موفق',
      message: 'از این پس مقالات جدید را دریافت می‌کنید',
      duration: 3000,
    });
  });
}

/* ============================================
   INIT
   ============================================ */

function init() {
  // Read from URL if category filter
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  if (cat && magazineCategories.some((c) => c.id === cat)) {
    state.category = cat;
    document.querySelectorAll('.mag-tab').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.cat === cat);
    });
  }

  render();
  bindCategories();
  bindTabs();
  bindSearch();
  bindSort();
  bindLoadMore();
  bindReset();
  bindNewsletter();

  console.log('%c✓ Magazine page loaded', 'color:#18B981;font-weight:bold;');
}

init();