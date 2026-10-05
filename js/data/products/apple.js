/* ============================================
   APPLE — 37 مدل
   ============================================ */

export const appleProducts = [
  /* ===== iPhone 16 ===== */
  { id: 'iphone-16', brand: 'Apple', name: 'آیفون 16', model: 'iPhone 16', category: 'apple', type: 'phone', year: 2024, rating: 4.7, reviews: 156, badges: ['discount'], colors: ['Black','White','Pink','Teal','Ultramarine'], variants: [
    { ram:'8GB', storage:'128GB', price:264682000, stock:20 },
    { ram:'8GB', storage:'256GB', price:291482000, stock:15 },
    { ram:'8GB', storage:'512GB', price:345082000, stock:8 },
  ], image: null },
  { id: 'iphone-16-plus', brand: 'Apple', name: 'آیفون 16 پلاس', model: 'iPhone 16 Plus', category: 'apple', type: 'phone', year: 2024, rating: 4.7, reviews: 98, badges: [], colors: ['Black','White','Pink','Teal','Ultramarine'], variants: [
    { ram:'8GB', storage:'128GB', price:302832000, stock:12 },
    { ram:'8GB', storage:'256GB', price:329632000, stock:10 },
    { ram:'8GB', storage:'512GB', price:383232000, stock:6 },
  ], image: null },
  { id: 'iphone-16-pro', brand: 'Apple', name: 'آیفون 16 پرو', model: 'iPhone 16 Pro', category: 'apple', type: 'phone', year: 2024, rating: 4.8, reviews: 187, badges: ['hot'], colors: ['Natural Titanium','Black Titanium','White Titanium','Desert Titanium'], variants: [
    { ram:'8GB', storage:'128GB', price:325932000, stock:10 },
    { ram:'8GB', storage:'256GB', price:352732000, stock:8 },
    { ram:'8GB', storage:'512GB', price:406332000, stock:5 },
    { ram:'8GB', storage:'1TB',   price:459932000, stock:3 },
  ], image: null },
  { id: 'iphone-16-pro-max', brand: 'Apple', name: 'آیفون 16 پرو مکس', model: 'iPhone 16 Pro Max', category: 'apple', type: 'phone', year: 2024, rating: 4.9, reviews: 142, badges: ['hot'], colors: ['Natural Titanium','Black Titanium','White Titanium','Desert Titanium'], variants: [
    { ram:'8GB', storage:'256GB', price:384482000, stock:7 },
    { ram:'8GB', storage:'512GB', price:438082000, stock:5 },
    { ram:'8GB', storage:'1TB',   price:491682000, stock:3 },
  ], image: null },
  { id: 'iphone-16e', brand: 'Apple', name: 'آیفون 16e', model: 'iPhone 16e', category: 'apple', type: 'phone', year: 2025, rating: 4.5, reviews: 78, badges: ['discount'], colors: ['Black','White'], variants: [
    { ram:'8GB', storage:'128GB', price:204132000, stock:22 },
    { ram:'8GB', storage:'256GB', price:230932000, stock:18 },
    { ram:'8GB', storage:'512GB', price:284532000, stock:10 },
  ], image: null },

  /* ===== iPhone 17 ===== */
  { id: 'iphone-17', brand: 'Apple', name: 'آیفون 17', model: 'iPhone 17', category: 'apple', type: 'phone', year: 2025, rating: 4.8, reviews: 92, badges: ['new'], colors: ['Black','White','Lavender','Sage','Mist Blue'], variants: [
    { ram:'8GB', storage:'256GB', price:305132000, stock:15 },
    { ram:'8GB', storage:'512GB', price:358732000, stock:8 },
  ], image: null },
  { id: 'iphone-17-pro', brand: 'Apple', name: 'آیفون 17 پرو', model: 'iPhone 17 Pro', category: 'apple', type: 'phone', year: 2025, rating: 4.9, reviews: 124, badges: ['new','hot'], colors: ['Cosmic Orange','Deep Blue','Silver'], variants: [
    { ram:'12GB', storage:'256GB', price:393582000, stock:12 },
    { ram:'12GB', storage:'512GB', price:447182000, stock:8 },
    { ram:'12GB', storage:'1TB',   price:500782000, stock:4 },
  ], image: null },
  { id: 'iphone-17-pro-max', brand: 'Apple', name: 'آیفون 17 پرو مکس', model: 'iPhone 17 Pro Max', category: 'apple', type: 'phone', year: 2025, rating: 4.9, reviews: 98, badges: ['new'], colors: ['Cosmic Orange','Deep Blue','Silver'], variants: [
    { ram:'12GB', storage:'256GB', price:420932000, stock:10 },
    { ram:'12GB', storage:'512GB', price:474532000, stock:6 },
    { ram:'12GB', storage:'1TB',   price:528132000, stock:4 },
    { ram:'12GB', storage:'2TB',   price:635332000, stock:2 },
  ], image: null },
  { id: 'iphone-air', brand: 'Apple', name: 'آیفون ایر', model: 'iPhone Air', category: 'apple', type: 'phone', year: 2025, rating: 4.7, reviews: 62, badges: ['new'], colors: ['Space Black','Cloud White','Light Gold','Sky Blue'], variants: [
    { ram:'8GB', storage:'256GB', price:348182000, stock:10 },
    { ram:'8GB', storage:'512GB', price:401782000, stock:6 },
    { ram:'8GB', storage:'1TB',   price:455382000, stock:3 },
  ], image: null },
  { id: 'iphone-17e', brand: 'Apple', name: 'آیفون 17e', model: 'iPhone 17e', category: 'apple', type: 'phone', year: 2026, rating: 4.5, reviews: 32, badges: ['discount'], colors: ['Black','White'], variants: [
    { ram:'8GB', storage:'256GB', price:204132000, stock:20 },
    { ram:'8GB', storage:'512GB', price:258000000, stock:12 },
  ], image: null },

  /* ===== iPhone 18 ===== */
  { id: 'iphone-18-pro', brand: 'Apple', name: 'آیفون 18 پرو', model: 'iPhone 18 Pro', category: 'apple', type: 'phone', year: 2026, rating: 4.9, reviews: 18, badges: ['new'], colors: ['Black','Silver','Blue'], variants: [
    { ram:'12GB', storage:'256GB', price:438332000, stock:8 },
    { ram:'12GB', storage:'512GB', price:491932000, stock:5 },
    { ram:'12GB', storage:'1TB',   price:599132000, stock:3 },
  ], image: null },
  { id: 'iphone-18-pro-max', brand: 'Apple', name: 'آیفون 18 پرو مکس', model: 'iPhone 18 Pro Max', category: 'apple', type: 'phone', year: 2026, rating: 4.9, reviews: 12, badges: ['new'], colors: ['Black','Silver','Blue'], variants: [
    { ram:'12GB', storage:'256GB', price:468132000, stock:6 },
    { ram:'12GB', storage:'512GB', price:521732000, stock:4 },
    { ram:'12GB', storage:'1TB',   price:628932000, stock:2 },
    { ram:'12GB', storage:'2TB',   price:789732000, stock:1 },
  ], image: null },
  { id: 'iphone-duo', brand: 'Apple', name: 'آیفون دو', model: 'iPhone Duo', category: 'apple', type: 'phone', year: 2026, rating: 4.8, reviews: 8, badges: ['new'], colors: ['Black','Silver'], variants: [
    { ram:'12GB', storage:'256GB', price:685732000, stock:4 },
    { ram:'12GB', storage:'512GB', price:739332000, stock:3 },
    { ram:'12GB', storage:'1TB',   price:846532000, stock:2 },
  ], image: null },
];