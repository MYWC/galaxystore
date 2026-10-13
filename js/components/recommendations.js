/* ============================================
   RECOMMENDATIONS COMPONENT — C.3
   Reusable section renderer
   ============================================ */

import { renderProductList } from './product-card.js';
import {
  getRecommendations,
  getRecommendationsCopy,
} from '../utils/recommendations.js';

/* ============================================
   ICONS
   ============================================ */

const ICONS = {
  sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
};

/* ============================================
   MOUNT
   ============================================ */

/**
 * رندر بخش پیشنهادات در یک container
 * @param {HTMLElement|string} container
 * @param {Object} opts
 * @param {number} [opts.limit=4]
 * @param {string} [opts.seedProductId] — اگه صفحه محصول هستیم
 * @param {string[]} [opts.excludeIds=[]]
 * @param {string} [opts.className=''] — کلاس اضافه
 * @param {boolean} [opts.showViewAll=true]
 * @param {string} [opts.viewAllHref='category.html']
 * @returns {boolean} — true اگه رندر شد، false اگه نه
 */
export function mountRecommendations(container, opts = {}) {
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!el) return false;

  const {
    limit = 4,
    seedProductId = null,
    excludeIds = [],
    className = '',
    showViewAll = true,
    viewAllHref = 'category.html',
  } = opts;

  try {
    const result = getRecommendations({
      limit,
      seedProductId,
      excludeIds,
    });

    if (!result.items || result.items.length < 2) {
      el.hidden = true;
      el.innerHTML = '';
      return false;
    }

    const copy = getRecommendationsCopy(result);

    // ساختار
    el.hidden = false;
    el.className = `recommendations reveal ${className}`.trim();

    el.innerHTML = `
      <div class="container">
        <div class="recommendations__head">
          <div class="recommendations__title-wrap">
            <span class="recommendations__icon" aria-hidden="true">
              ${ICONS.sparkles}
            </span>
            <div class="recommendations__titles">
              <h2 class="recommendations__title">
                ${copy.title}
                ${copy.highlight ? `<span class="recommendations__highlight">${copy.highlight}</span>` : ''}
              </h2>
              <p class="recommendations__subtitle">${copy.subtitle}</p>
            </div>
          </div>

          ${showViewAll ? `
            <a href="${viewAllHref}" class="recommendations__link">
              مشاهده همه
              ${ICONS.arrow}
            </a>
          ` : ''}
        </div>

        <div class="recommendations__grid" id="recommendations-grid"></div>
      </div>
    `;

    // محصولات
    const grid = el.querySelector('#recommendations-grid');
    renderProductList(grid, result.items);

    // اگه seed هست، یه chip کوچیک «مرجع» رو کارت seed نشون بده (اختیاری)
    if (result.seedProduct && result.reason === 'because-viewed') {
      // فقط روی محصولات مشابه برند، badge بذار
      const seedBrand = result.seedProduct.brand;
      result.items.forEach((p) => {
        if (p.brand === seedBrand) {
          const card = grid.querySelector(`[data-product-id="${p.id}"]`);
          if (!card) return;

          const media = card.querySelector('.p-card__media');
          if (!media) return;

          if (media.querySelector('.recommendations__reason')) return;

          const reason = document.createElement('span');
          reason.className = 'recommendations__reason';
          reason.textContent = `مشابه ${seedBrand}`;
          media.appendChild(reason);
        }
      });
    }

    return true;
  } catch (err) {
    console.error('[Recommendations] mount error:', err);
    el.hidden = true;
    return false;
  }
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ Recommendations component ready (C.3)', 'color:#18B981;font-weight:bold;');