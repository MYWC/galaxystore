/* ============================================
   MAIN PRODUCTS — اعمال تخفیف واقعی
   ============================================ */

import { appleProducts }     from './products/apple.js';
import { samsungProducts }   from './products/samsung.js';
import { xiaomiProducts }    from './products/xiaomi.js';
import { googleProducts }    from './products/google.js';
import { oneplusProducts }   from './products/oneplus.js';
import { oppoProducts }      from './products/oppo.js';
import { vivoProducts }      from './products/vivo.js';
import { honorProducts }     from './products/honor.js';
import { huaweiProducts }    from './products/huawei.js';
import { transsionProducts } from './products/transsion.js';
import { deals }             from './deals.js';

/* ---------- ترکیب همه محصولات ---------- */
export const products = [
  ...appleProducts,
  ...samsungProducts,
  ...xiaomiProducts,
  ...googleProducts,
  ...oneplusProducts,
  ...oppoProducts,
  ...vivoProducts,
  ...honorProducts,
  ...huaweiProducts,
  ...transsionProducts,
];

/* ============================================
   اعمال تخفیف روی Variants
   oldPrice محاسبه میشود + Badge تخفیف اضافه
   ============================================ */

products.forEach((p) => {
  const discountPercent = deals[p.id];
  if (!discountPercent || !p.variants?.length) return;

  p.variants.forEach((v) => {
    v.oldPrice = Math.round(v.price / (1 - discountPercent / 100));
  });

  p.badges = Array.isArray(p.badges) ? [...p.badges] : [];
  if (!p.badges.includes('discount')) p.badges.push('discount');
  p.discount = discountPercent;
});

/* ============================================
   FLASH SALE — محصولات واقعی از کاتالوگ
   ============================================ */

export const flashSaleProducts = [
  {
    id: 'iphone-16',
    discountExtra: 8,
    totalStock: 30,
    sold: 23,
  },
  {
    id: 'galaxy-s24-ultra',
    discountExtra: 5,
    totalStock: 25,
    sold: 18,
  },
  {
    id: 'xiaomi-14',
    discountExtra: 6,
    totalStock: 40,
    sold: 33,
  },
  {
    id: 'pixel-9',
    discountExtra: 7,
    totalStock: 50,
    sold: 41,
  },
];

/* ============================================
   TRENDING TABS
   ============================================ */

export const trendingTabs = [
  { id: 'all',      label: 'همه' },
  { id: 'phone',    label: 'گوشی' },
  { id: 'apple',    label: 'Apple' },
  { id: 'samsung',  label: 'Samsung' },
  { id: 'xiaomi',   label: 'Xiaomi' },
  { id: 'flagship', label: 'پرچمدار' },
  { id: 'budget',   label: 'اقتصادی' },
];

/* ============================================
   FORMAT PRICE
   ============================================ */

export function formatPrice(n) {
  return n.toLocaleString('fa-IR');
}