/* ============================================
   PRODUCT PAGE — Entry Point
   + Recommendations (C.3)
   ============================================ */

import { initLayout } from '../components/layout.js';
import { initProductDetail } from '../sections/product-detail.js';
import { mountRecommendations } from '../components/recommendations.js';

/* ---------- Init Layout ---------- */
initLayout();

/* ---------- Init Product ---------- */
initProductDetail();

/* ---------- Recommendations Section (C.3) ---------- */
function initProductRecommendations() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) return;

  const similar = document.getElementById('product-similar');
  if (!similar) return;

  // اگه قبلاً ساخته شده
  if (document.getElementById('product-recommendations')) return;

  const section = document.createElement('section');
  section.id = 'product-recommendations';
  section.hidden = true;

  similar.parentNode.insertBefore(section, similar.nextSibling);

  // رندر
  mountRecommendations(section, {
    limit: 4,
    seedProductId: id,
    showViewAll: true,
    viewAllHref: 'category.html',
  });
}

// با تأخیر کوتاه تا product-detail.js تموم بشه
setTimeout(initProductRecommendations, 400);

console.log('%c✓ Product page loaded (C.3)', 'color:#18B981;font-weight:bold;');