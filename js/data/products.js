/* ============================================
   PRODUCTS DATA
   با اتصال به Supabase + Fallback محلی
   ============================================ */

import { supabase } from '../services/supabase.js';

/* ============================================
   داده‌های محلی (Fallback)
   اگر Supabase تنظیم نشده باشد یا خطا بدهد،
   از این داده‌ها استفاده می‌شود.
   ============================================ */

const FALLBACK_PRODUCTS = [
  {
    id: 'iphone-16-pro',
    brand: 'Apple',
    name: 'آیفون 16 پرو',
    model: 'iPhone 16 Pro',
    category: 'apple',
    type: 'phone',
    year: 2024,
    rating: 4.8,
    reviews: 187,
    badges: ['hot'],
    colors: ['Natural Titanium', 'Black Titanium', 'White Titanium', 'Desert Titanium'],
    variants: [
      { ram: '8GB', storage: '128GB', price: 325932000, oldPrice: 354273913, stock: 10 },
      { ram: '8GB', storage: '256GB', price: 352732000, oldPrice: 383404347, stock: 8 },
      { ram: '8GB', storage: '512GB', price: 406332000, oldPrice: 441665217, stock: 5 },
      { ram: '8GB', storage: '1TB',   price: 459932000, oldPrice: 499926086, stock: 3 },
    ],
    image: null,
  },
  {
    id: 'iphone-16',
    brand: 'Apple',
    name: 'آیفون 16',
    model: 'iPhone 16',
    category: 'apple',
    type: 'phone',
    year: 2024,
    rating: 4.7,
    reviews: 156,
    badges: ['discount'],
    colors: ['Black', 'White', 'Pink', 'Teal', 'Ultramarine'],
    variants: [
      { ram: '8GB', storage: '128GB', price: 264682000, oldPrice: 300775000, stock: 20 },
      { ram: '8GB', storage: '256GB', price: 291482000, oldPrice: 331229545, stock: 15 },
      { ram: '8GB', storage: '512GB', price: 345082000, oldPrice: 392138636, stock: 8 },
    ],
    image: null,
  },
  {
    id: 'iphone-17-pro',
    brand: 'Apple',
    name: 'آیفون 17 پرو',
    model: 'iPhone 17 Pro',
    category: 'apple',
    type: 'phone',
    year: 2025,
    rating: 4.9,
    reviews: 124,
    badges: ['new', 'hot'],
    colors: ['Cosmic Orange', 'Deep Blue', 'Silver'],
    variants: [
      { ram: '12GB', storage: '256GB', price: 393582000, oldPrice: 427806521, stock: 12 },
      { ram: '12GB', storage: '512GB', price: 447182000, oldPrice: 486067391, stock: 8 },
      { ram: '12GB', storage: '1TB',   price: 500782000, oldPrice: 544328260, stock: 4 },
    ],
    image: null,
  },
  {
    id: 'galaxy-s24-ultra',
    brand: 'Samsung',
    name: 'گلکسی S24 اولترا',
    model: 'Galaxy S24 Ultra',
    category: 'samsung',
    type: 'phone',
    year: 2024,
    rating: 4.8,
    reviews: 178,
    badges: ['hot'],
    colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet', 'Titanium Yellow'],
    variants: [
      { ram: '12GB', storage: '256GB', price: 292760086, oldPrice: 344423630, stock: 8 },
      { ram: '12GB', storage: '512GB', price: 319803064, oldPrice: 376238896, stock: 6 },
      { ram: '12GB', storage: '1TB',   price: 373889018, oldPrice: 439869433, stock: 3 },
    ],
    image: null,
  },
  {
    id: 'galaxy-s25-ultra',
    brand: 'Samsung',
    name: 'گلکسی S25 اولترا',
    model: 'Galaxy S25 Ultra',
    category: 'samsung',
    type: 'phone',
    year: 2025,
    rating: 4.9,
    reviews: 156,
    badges: ['new', 'hot'],
    colors: ['Titanium Silverblue', 'Titanium Black', 'Titanium Whitesilver', 'Titanium Gray', 'Titanium Jetblack'],
    variants: [
      { ram: '12GB', storage: '256GB', price: 292760086, oldPrice: 325288984, stock: 6 },
      { ram: '12GB', storage: '512GB', price: 319803064, oldPrice: 355336737, stock: 5 },
      { ram: '12GB', storage: '1TB',   price: 373889018, oldPrice: 415432242, stock: 3 },
      { ram: '16GB', storage: '512GB', price: 342360813, oldPrice: 380400903, stock: 4 },
      { ram: '16GB', storage: '1TB',   price: 396446767, oldPrice: 440496407, stock: 2 },
    ],
    image: null,
  },
  {
    id: 'galaxy-a56',
    brand: 'Samsung',
    name: 'گلکسی A56 5G',
    model: 'Galaxy A56 5G',
    category: 'samsung',
    type: 'phone',
    year: 2025,
    rating: 4.5,
    reviews: 128,
    badges: ['discount', 'hot'],
    colors: ['Awesome Graphite', 'Awesome Light Gray', 'Awesome Olive', 'Awesome Pink'],
    variants: [
      { ram: '8GB',  storage: '128GB', price: 92368662, oldPrice: 112644710, stock: 25 },
      { ram: '8GB',  storage: '256GB', price: 88160361, oldPrice: 107512635, stock: 20 },
      { ram: '12GB', storage: '256GB', price: 96576965, oldPrice: 117776787, stock: 15 },
    ],
    image: null,
  },
  {
    id: 'xiaomi-14',
    brand: 'Xiaomi',
    name: 'شیائومی 14',
    model: 'Xiaomi 14',
    category: 'xiaomi',
    type: 'phone',
    year: 2024,
    rating: 4.7,
    reviews: 98,
    badges: ['discount'],
    colors: ['Black', 'White', 'Jade Green', 'Titanium'],
    variants: [
      { ram: '8GB',  storage: '256GB', price: 187211421, oldPrice: 215185541, stock: 10 },
      { ram: '12GB', storage: '256GB', price: 201270696, oldPrice: 231345627, stock: 8 },
      { ram: '12GB', storage: '512GB', price: 229389247, oldPrice: 263665801, stock: 5 },
      { ram: '16GB', storage: '512GB', price: 257572172, oldPrice: 296059967, stock: 3 },
      { ram: '16GB', storage: '1TB',   price: 280904091, oldPrice: 322878266, stock: 2 },
    ],
    image: null,
  },
  {
    id: 'redmi-note-14-pro',
    brand: 'Xiaomi',
    name: 'ردمی نوت 14 پرو',
    model: 'Redmi Note 14 Pro',
    category: 'xiaomi',
    type: 'phone',
    year: 2025,
    rating: 4.5,
    reviews: 210,
    badges: ['discount', 'hot'],
    colors: ['Midnight Black', 'Ocean Blue', 'Lavender Haze', 'Frosted White'],
    variants: [
      { ram: '8GB',  storage: '128GB', price: 70057841, oldPrice: 86491162, stock: 40 },
      { ram: '8GB',  storage: '256GB', price: 81767764, oldPrice: 100947857, stock: 32 },
      { ram: '12GB', storage: '256GB', price: 93484933, oldPrice: 115413497, stock: 22 },
      { ram: '12GB', storage: '512GB', price: 105202104, oldPrice: 129879141, stock: 14 },
    ],
    image: null,
  },
  {
    id: 'pixel-9-pro',
    brand: 'Google',
    name: 'گوگل پیکسل 9 پرو',
    model: 'Google Pixel 9 Pro',
    category: 'google',
    type: 'phone',
    year: 2024,
    rating: 4.8,
    reviews: 98,
    badges: ['hot'],
    colors: ['Obsidian', 'Porcelain', 'Hazel', 'Rose Quartz'],
    variants: [
      { ram: '16GB', storage: '128GB', price: 234307161, oldPrice: 260341290, stock: 12 },
      { ram: '16GB', storage: '256GB', price: 257737877, oldPrice: 286375419, stock: 9 },
      { ram: '16GB', storage: '512GB', price: 281168593, oldPrice: 312409548, stock: 6 },
      { ram: '16GB', storage: '1TB',   price: 328030025, oldPrice: 364477805, stock: 3 },
    ],
    image: null,
  },
  {
    id: 'oneplus-13',
    brand: 'OnePlus',
    name: 'وان‌پلاس 13',
    model: 'OnePlus 13',
    category: 'oneplus',
    type: 'phone',
    year: 2024,
    rating: 4.8,
    reviews: 76,
    badges: ['hot'],
    colors: ['Black Eclipse', 'Arctic Dawn', 'Midnight Ocean'],
    variants: [
      { ram: '12GB', storage: '256GB', price: 187445729, oldPrice: 210613178, stock: 12 },
      { ram: '16GB', storage: '512GB', price: 210876445, oldPrice: 236939825, stock: 8 },
      { ram: '24GB', storage: '1TB',   price: 257737877, oldPrice: 289593120, stock: 3 },
    ],
    image: null,
  },
  {
    id: 'honor-magic6-pro',
    brand: 'Honor',
    name: 'آنر مجیک 6 پرو',
    model: 'Honor Magic6 Pro',
    category: 'honor',
    type: 'phone',
    year: 2024,
    rating: 4.7,
    reviews: 68,
    badges: ['discount'],
    colors: ['Epi Green', 'Black', 'Purple'],
    variants: [
      { ram: '12GB', storage: '256GB', price: 175730371, oldPrice: 199693603, stock: 10 },
      { ram: '12GB', storage: '512GB', price: 187445729, oldPrice: 213006510, stock: 7 },
      { ram: '16GB', storage: '512GB', price: 199161087, oldPrice: 226319417, stock: 5 },
      { ram: '16GB', storage: '1TB',   price: 222591804, oldPrice: 252945232, stock: 3 },
    ],
    image: null,
  },
];

/* ============================================
   تبدیل داده‌های Supabase به ساختار موردنیاز
   ============================================ */

function mapSupabaseProduct(row) {
  return {
    id: row.id,
    brand: row.brand,
    name: row.name,
    model: row.model || row.name,
    category: row.category,
    type: row.type,
    year: row.year,
    rating: row.rating || 0,
    reviews: row.reviews || 0,
    badges: row.badges || [],
    colors: row.colors || [],
    variants: row.variants || [],
    image: row.image || null,
  };
}

/* ============================================
   Fetch Products
   ============================================ */

async function fetchProducts() {
  try {
    // اگر Supabase تنظیم نشده باشد، به Fallback برمی‌گردد
    if (!supabase) {
      console.log('%c⚠️  Supabase not configured — using fallback data', 'color:#F59E0B;font-weight:bold;');
      return FALLBACK_PRODUCTS;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.warn('%c⚠️  Supabase error — using fallback data:', 'color:#F59E0B;', error.message);
      return FALLBACK_PRODUCTS;
    }

    if (!data || !data.length) {
      console.log('%c⚠️  No products in Supabase — using fallback data', 'color:#F59E0B;font-weight:bold;');
      return FALLBACK_PRODUCTS;
    }

    console.log(`%c✓ Loaded ${data.length} products from Supabase`, 'color:#18B981;font-weight:bold;');
    return data.map(mapSupabaseProduct);

  } catch (err) {
    console.warn('%c⚠️  Failed to fetch products — using fallback data:', 'color:#F59E0B;', err);
    return FALLBACK_PRODUCTS;
  }
}

/* ============================================
   Products (آماده برای استفاده در همه‌ی صفحه‌ها)
   ============================================ */

export const products = await fetchProducts();

/* ============================================
   FLASH SALE PRODUCTS
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
  return Number(n).toLocaleString('fa-IR');
}