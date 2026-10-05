/* ============================================
   MAIN PRODUCTS — ترکیب همه برندها
   ============================================ */

import { appleProducts } from './products/apple.js';
import { samsungProducts } from './products/samsung.js';
import { xiaomiProducts } from './products/xiaomi.js';
import { googleProducts } from './products/google.js';
import { oneplusProducts } from './products/oneplus.js';
import { oppoProducts } from './products/oppo.js';
import { vivoProducts } from './products/vivo.js';
import { honorProducts } from './products/honor.js';
import { huaweiProducts } from './products/huawei.js';
import { transsionProducts } from './products/transsion.js';

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

export const flashSaleProducts = [
  { id: 'fs-iphone-16',   brand: 'Apple',   name: 'آیفون 16',         variants: [{ram:'8GB',storage:'128GB',price:264682000,oldPrice:299000000,stock:20}], totalStock:30, sold:23, image: null },
  { id: 'fs-gs25-ultra',  brand: 'Samsung', name: 'گلکسی S25 اولترا', variants: [{ram:'12GB',storage:'256GB',price:292760086,oldPrice:340000000,stock:6}], totalStock:25, sold:18, image: null },
  { id: 'fs-xiaomi-14',   brand: 'Xiaomi',  name: 'شیائومی 14',       variants: [{ram:'12GB',storage:'256GB',price:201270696,oldPrice:250000000,stock:10}], totalStock:40, sold:33, image: null },
  { id: 'fs-pixel-9',     brand: 'Google',  name: 'پیکسل 9',          variants: [{ram:'12GB',storage:'128GB',price:164015013,oldPrice:200000000,stock:12}], totalStock:50, sold:43, image: null },
];

export const trendingTabs = [
  { id: 'all',      label: 'همه' },
  { id: 'phone',    label: 'گوشی' },
  { id: 'tablet',   label: 'تبلت' },
  { id: 'apple',    label: 'Apple' },
  { id: 'samsung',  label: 'Samsung' },
  { id: 'xiaomi',   label: 'Xiaomi' },
  { id: 'flagship', label: 'پرچمدار' },
  { id: 'budget',   label: 'اقتصادی' },
];

export function formatPrice(n) {
  return n.toLocaleString('fa-IR');
}