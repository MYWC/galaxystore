/* ============================================
   PRODUCTS DATA
   با اتصال به Supabase + Fallback محلی
   + فیلتر محصولات بدون عکس
   ============================================ */

import { supabase } from '../services/supabase.js';
import { hasImage } from './available-images.js';

/* ============================================
   داده‌های محلی (Fallback)
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
    colors: ['Titanium Silverblue', 'Titanium Black', 'Titanium Whitesilver'],
    variants: [
      { ram: '12GB', storage: '256GB', price: 292760086, oldPrice: 325288984, stock: 6 },
      { ram: '12GB', storage: '512GB', price: 319803064, oldPrice: 355336737, stock: 5 },
      { ram: '12GB', storage: '1TB',   price: 373889018, oldPrice: 415432242, stock: 3 },
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
    colors: ['Black', 'White', 'Jade Green'],
    variants: [
      { ram: '8GB',  storage: '256GB', price: 187211421, oldPrice: 215185541, stock: 10 },
      { ram: '12GB', storage: '256GB', price: 201270696, oldPrice: 231345627, stock: 8 },
      { ram: '12GB', storage: '512GB', price: 229389247, oldPrice: 263665801, stock: 5 },
    ],
    image: null,
  },
];

/* ============================================
   MAPPER
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
   ALL PRODUCTS (برای صفحه محصول تنها)
   ============================================ */

const allLoadedProducts = await fetchProducts();

/* ============================================
   ALL PRODUCTS (همه — حتی بدون عکس)
   ============================================ */

export const allProducts = allLoadedProducts;

/* ============================================
   PRODUCTS (فقط عکس‌دارها — برای نمایش)
   ============================================ */

export const products = allLoadedProducts.filter((p) => hasImage(p.id));

console.log(
  `%c✓ Visible products (with images): ${products.length} از ${allProducts.length}`,
  'color:#2386D7;font-weight:bold;'
);

/* ============================================
   FLASH SALE PRODUCTS
   ============================================ */

export const flashSaleProducts = [
  {
    id: 'iphone-16',
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
    id: 'galaxy-s25-ultra',
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
    id: 'xiaomi-14',
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
    id: 'pixel-9',
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