/* ============================================
   BEST DEALS — محصولات دارای تخفیف واقعی
   ============================================ */

import { products } from '../data/products.js';
import { renderProductList } from '../components/product-card.js';

function maxDiscountPercent(p) {
  if (!p.variants?.length) return 0;
  let max = 0;
  p.variants.forEach((v) => {
    if (v.oldPrice && v.oldPrice > v.price) {
      const d = Math.round(((v.oldPrice - v.price) / v.oldPrice) * 100);
      if (d > max) max = d;
    }
  });
  return max;
}

export function initBestDeals() {
  const grid = document.getElementById('best-deals-grid');
  if (!grid) return;

  // محصولات دارای تخفیف را بر اساس بیشترین درصد تخفیف مرتب کن
  const withDiscount = products
    .map((p) => ({ product: p, discount: maxDiscountPercent(p) }))
    .filter((x) => x.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 5)
    .map((x) => x.product);

  renderProductList(grid, withDiscount);
}