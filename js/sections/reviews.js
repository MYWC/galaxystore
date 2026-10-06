/* ============================================
   CUSTOMER REVIEWS
   ============================================ */

import { reviews } from '../data/reviews.js';

const ICONS = {
  star: `<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>`,
  quote: `<svg viewBox="0 0 24 24"><path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h6.83v-6.83H5.34A1.83 1.83 0 0 1 7.17 9.4V6zm10 0a5.17 5.17 0 0 0-5.17 5.17V18h6.83v-6.83h-3.49A1.83 1.83 0 0 1 17.17 9.4V6z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
};

function renderStars(rating) {
  return Array.from({ length: 5 })
    .map((_, i) => (i < rating ? ICONS.star : ''))
    .join('');
}

function renderReviewCard(r) {
  return `
    <article class="review-card">
      <span class="review-card__quote">${ICONS.quote}</span>

      <div class="review-card__head">
        <span class="review-card__avatar" style="--av-color:${r.avatarColor}">
          ${r.initials}
        </span>
        <div class="review-card__info">
          <span class="review-card__name">${r.name}</span>
          <span class="review-card__date">${r.date}</span>
        </div>
        <span class="review-card__stars">${renderStars(r.rating)}</span>
      </div>

      <p class="review-card__body">${r.comment}</p>

      <div class="review-card__footer">
        <span class="review-card__product-thumb">${ICONS.phone}</span>
        <div class="review-card__product">
          <span class="review-card__product-label">خریداری شده</span>
          <span class="review-card__product-name">${r.product}</span>
        </div>
        ${r.verified ? `<span class="review-card__verified">${ICONS.check} تأیید شده</span>` : ''}
      </div>
    </article>
  `;
}

function renderSummary() {
  const el = document.getElementById('reviews-summary');
  if (!el) return;

  const avg = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
  const count = reviews.length;

  el.innerHTML = `
    <span class="reviews__summary-stars">${renderStars(5)}</span>
    <span class="reviews__summary-text">
      <strong>${avg}</strong> از ۵ — <span>${count.toLocaleString('fa-IR')} نظر</span>
    </span>
  `;
}

export function initReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  // نمایش ۶ نظر اول برای تمیزی
  grid.innerHTML = reviews.slice(0, 6).map(renderReviewCard).join('');
  renderSummary();
}