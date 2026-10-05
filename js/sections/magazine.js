/* ============================================
   MAGAZINE SECTION
   ============================================ */

import { articles } from '../data/articles.js';

const ICONS = {
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
};

function renderArticleCard(a) {
  const imageHTML = a.image
    ? `<img src="${a.image}" alt="${a.title}" loading="lazy" />`
    : `<div class="ph">تصویر مقاله</div>`;

  return `
    <a href="${a.href}" class="article-card article-card--${a.variant}">
      <div class="article-card__media">
        ${imageHTML}
        <span class="article-card__tag">
          <span class="article-card__tag-dot"></span>
          ${a.tag}
        </span>
      </div>

      <div class="article-card__body">
        <h3 class="article-card__title">${a.title}</h3>
        <p class="article-card__desc">${a.desc}</p>

        <div class="article-card__meta">
          <span class="article-card__read">
            ادامه مطلب
            ${ICONS.arrow}
          </span>
          <span class="article-card__date">
            ${ICONS.calendar}
            ${a.date}
          </span>
        </div>
      </div>
    </a>
  `;
}

export function initMagazine() {
  const grid = document.getElementById('magazine-grid');
  if (!grid) return;
  grid.innerHTML = articles.map(renderArticleCard).join('');
}