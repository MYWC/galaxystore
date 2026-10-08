/* ============================================
   ARTICLE PAGE
   ============================================ */

import { initLayout } from '../components/layout.js';
import { magazineArticles, magazineCategories } from '../data/magazine-articles.js';
import { articleContents, getDefaultContent } from '../data/article-content.js';
import { toast } from '../components/toast.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   GET ARTICLE
   ============================================ */

function getArticleIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || 'art-1';
}

function getArticle(id) {
  return magazineArticles.find((a) => a.id === id);
}

/* ============================================
   RENDER — HERO
   ============================================ */

function renderHero(article) {
  document.title = `${article.title} | مجله موبایل استور`;

  const catEl = document.getElementById('breadcrumb-cat');
  if (catEl) {
    const cat = magazineCategories.find((c) => c.id === article.category);
    catEl.textContent = cat ? cat.label : 'مقاله';
  }

  const tagEl = document.getElementById('article-tag');
  if (tagEl) tagEl.textContent = article.tag;

  const readEl = document.getElementById('article-read-time');
  if (readEl) readEl.textContent = article.readTime;

  const titleEl = document.getElementById('article-title');
  if (titleEl) titleEl.textContent = article.title;

  const descEl = document.getElementById('article-desc');
  if (descEl) descEl.textContent = article.desc;

  const dateEl = document.getElementById('article-date');
  if (dateEl) dateEl.textContent = article.date;

  const viewsEl = document.getElementById('article-views');
  if (viewsEl) viewsEl.textContent = (article.views || 0).toLocaleString('fa-IR');
}

/* ============================================
   RENDER — BODY
   ============================================ */

function renderBody(article) {
  const body = document.getElementById('article-body');
  if (!body) return;

  const content = articleContents[article.id]?.body
    || getDefaultContent(article.title);

  body.innerHTML = content;
}

/* ============================================
   RENDER — TOC
   ============================================ */

function renderTOC() {
  const nav = document.getElementById('article-toc-nav');
  const body = document.getElementById('article-body');
  if (!nav || !body) return;

  // پیدا کردن همه h2 داخل بدنه
  const headings = body.querySelectorAll('h2[id]');

  if (!headings.length) {
    nav.innerHTML = '<span style="font-size:12px;color:var(--text-muted);">فهرستی موجود نیست</span>';
    return;
  }

  nav.innerHTML = Array.from(headings).map((h) => `
    <a href="#${h.id}" class="article-toc__link" data-toc-target="${h.id}">
      ${h.textContent}
    </a>
  `).join('');

  // Smooth scroll
  nav.addEventListener('click', (e) => {
    const link = e.target.closest('[data-toc-target]');
    if (!link) return;

    e.preventDefault();
    const target = document.getElementById(link.dataset.tocTarget);
    if (!target) return;

    const offset = 100;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });

    setTimeout(() => updateActiveTOC(), 400);
  });

  // Active state on scroll
  const links = nav.querySelectorAll('.article-toc__link');
  const updateActiveTOC = () => {
    let current = '';
    headings.forEach((h) => {
      const rect = h.getBoundingClientRect();
      if (rect.top <= 120) current = h.id;
    });

    links.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.tocTarget === current);
    });
  };

  window.addEventListener('scroll', updateActiveTOC, { passive: true });
  updateActiveTOC();
}

/* ============================================
   RENDER — RELATED
   ============================================ */

function renderRelated(article) {
  const wrap = document.getElementById('article-related');
  const grid = document.getElementById('article-related-grid');
  if (!wrap || !grid) return;

  const related = magazineArticles
    .filter((a) => a.id !== article.id)
    .filter((a) => a.category === article.category || Math.random() > 0.5)
    .slice(0, 3);

  if (related.length < 1) {
    wrap.hidden = true;
    return;
  }

  wrap.hidden = false;

  grid.innerHTML = related.map((a) => {
    const tagColor = a.variant === 'teal' ? '#005B59'
      : a.variant === 'orange' ? '#EF6C1F'
      : '#2386D7';

    const gradient = a.variant === 'teal'
      ? 'linear-gradient(135deg, #E5F4F2, #D0EAE5)'
      : a.variant === 'orange'
      ? 'linear-gradient(135deg, #FFF3E6, #FFE4C7)'
      : 'linear-gradient(135deg, #EAF4FD, #D6E8FA)';

    return `
      <a href="article.html?id=${a.id}" class="rel-card" style="--rc-accent:${tagColor}; --rc-gradient:${gradient};">
        <div class="rel-card__media">
          <div class="ph">تصویر</div>
          <span class="rel-card__tag">
            ${a.tag}
          </span>
        </div>
        <div class="rel-card__body">
          <h3 class="rel-card__title">${a.title}</h3>
          <div class="rel-card__meta">
            <span class="rel-card__meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${a.readTime}
            </span>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

/* ============================================
   RENDER — SHARE
   ============================================ */

function bindShare(article) {
  document.querySelectorAll('[data-share]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const type = btn.dataset.share;
      const url = window.location.href;
      const title = article.title;

      if (type === 'copy') {
        try {
          await navigator.clipboard.writeText(url);
          btn.classList.add('is-copied');
          toast({
            type: 'success',
            title: 'لینک کپی شد!',
            duration: 2000,
          });
          setTimeout(() => btn.classList.remove('is-copied'), 2000);
        } catch {
          toast({
            type: 'info',
            title: 'لینک مقاله',
            message: url,
            duration: 4000,
          });
        }
        return;
      }

      const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      };

      if (shareUrls[type]) {
        window.open(shareUrls[type], '_blank', 'noopener');
      }
    });
  });
}

/* ============================================
   READING PROGRESS
   ============================================ */

function initProgress() {
  const bar = document.getElementById('article-progress-bar');
  if (!bar) return;

  let ticking = false;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(progress, 100)}%`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}

/* ============================================
   NOT FOUND
   ============================================ */

function renderNotFound() {
  const page = document.getElementById('article-page');
  if (!page) return;

  page.innerHTML = `
    <div class="container">
      <div class="article-notfound" style="margin-top:60px;">
        <div class="article-notfound__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="8" x2="14" y2="14"/><line x1="14" y1="8" x2="8" y2="14"/></svg>
        </div>
        <h2 class="article-notfound__title">مقاله پیدا نشد</h2>
        <p class="article-notfound__text">
          متأسفانه مقاله‌ای با این مشخصات پیدا نکردیم.
        </p>
        <a href="index.html" class="btn btn--primary">بازگشت به مجله</a>
      </div>
    </div>
  `;
}

/* ============================================
   INIT
   ============================================ */

function init() {
  const id = getArticleIdFromUrl();
  const article = getArticle(id);

  if (!article) {
    renderNotFound();
    return;
  }

  renderHero(article);
  renderBody(article);
  renderTOC();
  renderRelated(article);
  bindShare(article);
  initProgress();

  console.log(`%c✓ Article loaded — ${article.id}`, 'color:#18B981;font-weight:bold;');
}

init();