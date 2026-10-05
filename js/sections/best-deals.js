/* ============================================
   BEST DEALS
   ============================================ */

import { products } from '../data/products.js';
import { renderProductList } from '../components/product-card.js';

export function initBestDeals() {
  const grid = document.getElementById('best-deals-grid');
  if (!grid) return;

  // محصولاتی که تخفیف دارند
  const withDiscount = products.filter((p) => {
    if (!p.variants?.length) return false;
    return p.variants.some((v) => v.oldPrice && v.oldPrice > v.price);
  });

  // اگر کم بود، پر کن با بقیه
  const list = withDiscount.length >= 5
    ? withDiscount.slice(0, 5)
    : [...withDiscount, ...products.filter((p) => !withDiscount.includes(p))].slice(0, 5);

  renderProductList(grid, list);
}