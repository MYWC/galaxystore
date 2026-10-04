/* ============================================
   BEST DEALS SECTION
   ============================================ */

import { products } from '../data/products.js';
import { renderProductList } from '../components/product-card.js';

export function initBestDeals() {
  const grid = document.getElementById('best-deals-grid');
  if (!grid) return;

  // فعلاً ۵ محصول اول
  renderProductList(grid, products.slice(0, 5));
}