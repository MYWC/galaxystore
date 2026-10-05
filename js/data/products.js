/* ============================================
   MAIN PRODUCTS — ترکیب همه برندها
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
   FLASH SALE
   ============================================ */

export const flashSaleProducts = [
  {
    id: 'fs-iphone-16',
    brand: 'Apple',
    name: 'آیفون 16',
    ram: '8GB',
    storage: '128GB',
    price: 264682000,
    oldPrice: 299000000,
    discount: 11,
    totalStock: 30,
    sold: 23,
    image: null,
  },
  {
    id: 'fs-galaxy-s25-ultra',
    brand: 'Samsung',
    name: 'گلکسی S25 اولترا',
    ram: '12GB',
    storage: '256GB',
    price: 292760086,
    oldPrice: 340000000,
    discount: 14,
    totalStock: 25,
    sold: 18,
    image: null,
  },
  {
    id: 'fs-xiaomi-14',
    brand: 'Xiaomi',
    name: 'شیائومی 14',
    ram: '12GB',
    storage: '256GB',
    price: 201270696,
    oldPrice: 250000000,
    discount: 19,
    totalStock: 40,
    sold: 33,
    image: null,
  },
  {
    id: 'fs-pixel-9',
    brand: 'Google',
    name: 'گوگل پیکسل 9',
    ram: '12GB',
    storage: '128GB',
    price: 164015013,
    oldPrice: 200000000,
    discount: 18,
    totalStock: 50,
    sold: 43,
    image: null,
  },
];

/* ============================================
   TRENDING TABS
   ============================================ */

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

/* ============================================
   FORMAT PRICE
   ============================================ */

export function formatPrice(n) {
  return n.toLocaleString('fa-IR');
}