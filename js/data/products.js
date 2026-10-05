/* ============================================
   PRODUCTS DATA — موبایل + تبلت
   ============================================ */

export const products = [
  /* ============ APPLE ============ */
  {
    id: 'ip17p-256',
    brand: 'Apple',
    name: 'آیفون 17 پرو',
    model: 'iPhone 17 Pro',
    slug: 'iphone-17-pro',
    ram: '8GB', storage: '256GB', color: 'Titanium Blue',
    rating: 4.9, reviews: 124,
    price: 109900000, oldPrice: 119900000, discount: 8,
    stock: 14, badges: ['hot'],
    category: 'apple', type: 'phone',
    image: null,
  },
  {
    id: 'ip16p-128',
    brand: 'Apple',
    name: 'آیفون 16 پرو',
    model: 'iPhone 16 Pro',
    slug: 'iphone-16-pro',
    ram: '8GB', storage: '128GB', color: 'Natural Titanium',
    rating: 4.8, reviews: 187,
    price: 82900000, oldPrice: 92900000, discount: 11,
    stock: 12, badges: ['hot'],
    category: 'apple', type: 'phone',
    image: null,
  },
  {
    id: 'ipad-air-m2',
    brand: 'Apple',
    name: 'آیپد ایر M2',
    model: 'iPad Air M2',
    slug: 'ipad-air-m2',
    ram: '8GB', storage: '128GB', color: 'Space Gray',
    rating: 4.8, reviews: 56,
    price: 42900000, oldPrice: 47900000, discount: 10,
    stock: 18, badges: ['new'],
    category: 'apple', type: 'tablet',
    image: null,
  },

  /* ============ SAMSUNG ============ */
  {
    id: 'gs26u-512',
    brand: 'Samsung',
    name: 'سامسونگ گلکسی S26 اولترا',
    model: 'Galaxy S26 Ultra',
    slug: 'galaxy-s26-ultra',
    ram: '12GB', storage: '512GB', color: 'Phantom Black',
    rating: 4.8, reviews: 98,
    price: 94900000, oldPrice: 105000000, discount: 10,
    stock: 6, badges: ['discount', 'new'],
    category: 'samsung', type: 'phone',
    image: null,
  },
  {
    id: 'gs25-256',
    brand: 'Samsung',
    name: 'گلکسی S25',
    model: 'Galaxy S25',
    slug: 'galaxy-s25',
    ram: '8GB', storage: '256GB', color: 'Icy Blue',
    rating: 4.7, reviews: 132,
    price: 47900000, oldPrice: 55900000, discount: 14,
    stock: 18, badges: ['discount'],
    category: 'samsung', type: 'phone',
    image: null,
  },
  {
    id: 'gtab-s10',
    brand: 'Samsung',
    name: 'گلکسی تب S10',
    model: 'Galaxy Tab S10',
    slug: 'galaxy-tab-s10',
    ram: '12GB', storage: '256GB', color: 'Moonstone Gray',
    rating: 4.7, reviews: 42,
    price: 38900000, oldPrice: 43900000, discount: 11,
    stock: 12, badges: ['new'],
    category: 'samsung', type: 'tablet',
    image: null,
  },

  /* ============ XIAOMI ============ */
  {
    id: 'mi15p-256',
    brand: 'Xiaomi',
    name: 'شیائومی 15 پرو',
    model: 'Xiaomi 15 Pro',
    slug: 'xiaomi-15-pro',
    ram: '12GB', storage: '256GB', color: 'Midnight Green',
    rating: 4.7, reviews: 76,
    price: 58900000, oldPrice: 67900000, discount: 13,
    stock: 22, badges: ['discount'],
    category: 'xiaomi', type: 'phone',
    image: null,
  },
  {
    id: 'redmi-note-14',
    brand: 'Xiaomi',
    name: 'ردمی نوت 14 پرو',
    model: 'Redmi Note 14 Pro',
    slug: 'redmi-note-14-pro',
    ram: '8GB', storage: '256GB', color: 'Ocean Blue',
    rating: 4.5, reviews: 210,
    price: 12900000, oldPrice: 15900000, discount: 19,
    stock: 45, badges: ['discount', 'hot'],
    category: 'xiaomi', type: 'phone',
    image: null,
  },
  {
    id: 'pad-7-pro',
    brand: 'Xiaomi',
    name: 'شیائومی پد 7 پرو',
    model: 'Xiaomi Pad 7 Pro',
    slug: 'xiaomi-pad-7-pro',
    ram: '8GB', storage: '256GB', color: 'Graphite Gray',
    rating: 4.6, reviews: 38,
    price: 18900000, oldPrice: 21900000, discount: 14,
    stock: 20, badges: ['new'],
    category: 'xiaomi', type: 'tablet',
    image: null,
  },

  /* ============ GOOGLE ============ */
  {
    id: 'px9p-128',
    brand: 'Google',
    name: 'گوگل پیکسل 9 پرو',
    model: 'Pixel 9 Pro',
    slug: 'pixel-9-pro',
    ram: '12GB', storage: '128GB', color: 'Obsidian',
    rating: 4.6, reviews: 45,
    price: 71900000, oldPrice: 79900000, discount: 10,
    stock: 9, badges: ['new'],
    category: 'google', type: 'phone',
    image: null,
  },
  {
    id: 'pxtab-128',
    brand: 'Google',
    name: 'پیکسل تبلت',
    model: 'Pixel Tablet',
    slug: 'pixel-tablet',
    ram: '8GB', storage: '128GB', color: 'Porcelain',
    rating: 4.5, reviews: 24,
    price: 33900000, oldPrice: 38900000, discount: 13,
    stock: 7, badges: ['new'],
    category: 'google', type: 'tablet',
    image: null,
  },

  /* ============ ONEPLUS ============ */
  {
    id: 'op13-256',
    brand: 'OnePlus',
    name: 'وان‌پلاس 13',
    model: 'OnePlus 13',
    slug: 'oneplus-13',
    ram: '12GB', storage: '256GB', color: 'Arctic Dawn',
    rating: 4.7, reviews: 62,
    price: 54900000, oldPrice: 61900000, discount: 11,
    stock: 4, badges: ['hot', 'discount'],
    category: 'oneplus', type: 'phone',
    image: null,
  },
  {
    id: 'op-pad-2',
    brand: 'OnePlus',
    name: 'وان‌پلاس پد 2',
    model: 'OnePlus Pad 2',
    slug: 'oneplus-pad-2',
    ram: '12GB', storage: '256GB', color: 'Nimbus Gray',
    rating: 4.6, reviews: 18,
    price: 22900000, oldPrice: 26900000, discount: 15,
    stock: 15, badges: ['discount'],
    category: 'oneplus', type: 'tablet',
    image: null,
  },

  /* ============ HONOR ============ */
  {
    id: 'honor-m6p',
    brand: 'Honor',
    name: 'آنر مجیک 6 پرو',
    model: 'Honor Magic 6 Pro',
    slug: 'honor-magic-6-pro',
    ram: '12GB', storage: '256GB', color: 'Epi Green',
    rating: 4.7, reviews: 51,
    price: 45900000, oldPrice: 51900000, discount: 12,
    stock: 11, badges: ['hot'],
    category: 'honor', type: 'phone',
    image: null,
  },
  {
    id: 'honor-pad-9',
    brand: 'Honor',
    name: 'آنر پد 9',
    model: 'Honor Pad 9',
    slug: 'honor-pad-9',
    ram: '8GB', storage: '256GB', color: 'Space Gray',
    rating: 4.4, reviews: 22,
    price: 14900000, oldPrice: 17900000, discount: 17,
    stock: 28, badges: ['discount'],
    category: 'honor', type: 'tablet',
    image: null,
  },

  /* ============ NOTHING ============ */
  {
    id: 'nothing-3',
    brand: 'Nothing',
    name: 'ناثینگ فون 3',
    model: 'Nothing Phone (3)',
    slug: 'nothing-phone-3',
    ram: '12GB', storage: '256GB', color: 'Black',
    rating: 4.6, reviews: 42,
    price: 39900000, oldPrice: 44900000, discount: 11,
    stock: 9, badges: ['new', 'hot'],
    category: 'nothing', type: 'phone',
    image: null,
  },

  /* ============ MOTOROLA ============ */
  {
    id: 'moto-edge-60',
    brand: 'Motorola',
    name: 'موتو اج 60 پرو',
    model: 'Motorola Edge 60 Pro',
    slug: 'moto-edge-60-pro',
    ram: '12GB', storage: '256GB', color: 'Scarab',
    rating: 4.5, reviews: 34,
    price: 32900000, oldPrice: 37900000, discount: 13,
    stock: 15, badges: ['discount'],
    category: 'motorola', type: 'phone',
    image: null,
  },

  /* ============ REALME ============ */
  {
    id: 'realme-gt7',
    brand: 'Realme',
    name: 'ریلمی GT 7 پرو',
    model: 'Realme GT 7 Pro',
    slug: 'realme-gt-7-pro',
    ram: '12GB', storage: '256GB', color: 'Mars Orange',
    rating: 4.6, reviews: 48,
    price: 38900000, oldPrice: 44900000, discount: 13,
    stock: 12, badges: ['new'],
    category: 'realme', type: 'phone',
    image: null,
  },
  {
    id: 'realme-pad-2',
    brand: 'Realme',
    name: 'ریلمی پد 2',
    model: 'Realme Pad 2',
    slug: 'realme-pad-2',
    ram: '8GB', storage: '128GB', color: 'Impossible Blue',
    rating: 4.4, reviews: 26,
    price: 11900000, oldPrice: 13900000, discount: 14,
    stock: 24, badges: ['discount'],
    category: 'realme', type: 'tablet',
    image: null,
  },

  /* ============ HUAWEI ============ */
  {
    id: 'hw-p70p',
    brand: 'Huawei',
    name: 'هواوی P70 پرو',
    model: 'Huawei P70 Pro',
    slug: 'huawei-p70-pro',
    ram: '12GB', storage: '256GB', color: 'Rococo Pearl',
    rating: 4.7, reviews: 38,
    price: 48900000, oldPrice: 54900000, discount: 11,
    stock: 8, badges: ['hot'],
    category: 'huawei', type: 'phone',
    image: null,
  },
  {
    id: 'hw-matepad-11',
    brand: 'Huawei',
    name: 'هواوی میت‌پد 11',
    model: 'Huawei MatePad 11',
    slug: 'huawei-matepad-11',
    ram: '8GB', storage: '256GB', color: 'Island Blue',
    rating: 4.5, reviews: 31,
    price: 17900000, oldPrice: 20900000, discount: 14,
    stock: 16, badges: ['discount'],
    category: 'huawei', type: 'tablet',
    image: null,
  },
];

/* ============================================
   FLASH SALE PRODUCTS
   ============================================ */

export const flashSaleProducts = [
  {
    id: 'fs-ip16-128',
    brand: 'Apple', name: 'آیفون 16',
    ram: '8GB', storage: '128GB',
    price: 62900000, oldPrice: 79900000, discount: 21,
    totalStock: 30, sold: 23, image: null,
  },
  {
    id: 'fs-gs25-256',
    brand: 'Samsung', name: 'گلکسی S25',
    ram: '8GB', storage: '256GB',
    price: 47900000, oldPrice: 59900000, discount: 20,
    totalStock: 25, sold: 18, image: null,
  },
  {
    id: 'fs-ipad-air',
    brand: 'Apple', name: 'آیپد ایر M2',
    ram: '8GB', storage: '128GB',
    price: 37900000, oldPrice: 47900000, discount: 21,
    totalStock: 20, sold: 14, image: null,
  },
  {
    id: 'fs-mipad7',
    brand: 'Xiaomi', name: 'شیائومی پد 7 پرو',
    ram: '8GB', storage: '256GB',
    price: 15900000, oldPrice: 21900000, discount: 27,
    totalStock: 30, sold: 26, image: null,
  },
];

/* ============================================
   TRENDING TABS
   ============================================ */

export const trendingTabs = [
  { id: 'all',      label: 'همه' },
  { id: 'phone',    label: 'گوشی موبایل' },
  { id: 'tablet',   label: 'تبلت' },
  { id: 'apple',    label: 'آیفون' },
  { id: 'samsung',  label: 'سامسونگ' },
  { id: 'xiaomi',   label: 'شیائومی' },
  { id: 'flagship', label: 'پرچمدار' },
  { id: 'budget',   label: 'اقتصادی' },
];

/* ============================================
   FORMAT PRICE
   ============================================ */

export function formatPrice(n) {
  return n.toLocaleString('fa-IR');
}