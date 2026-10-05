/* ============================================
   XIAOMI — 28 مدل (Xiaomi + Redmi + POCO)
   ============================================ */

export const xiaomiProducts = [
  /* ============================================
     XIAOMI FLAGSHIP
     ============================================ */
  { id: 'xiaomi-14', brand: 'Xiaomi', name: 'شیائومی 14', model: 'Xiaomi 14', category: 'xiaomi', type: 'phone', year: 2024, rating: 4.7, reviews: 98, badges: ['discount'], colors: ['Black','White','Jade Green','Titanium'], variants: [
    { ram:'8GB',  storage:'256GB', price:187211421, stock:10 },
    { ram:'12GB', storage:'256GB', price:201270696, stock:8 },
    { ram:'12GB', storage:'512GB', price:229389247, stock:5 },
    { ram:'16GB', storage:'512GB', price:257572172, stock:3 },
    { ram:'16GB', storage:'1TB',   price:280904091, stock:2 },
  ], image: null },

  { id: 'xiaomi-14-ultra', brand: 'Xiaomi', name: 'شیائومی 14 اولترا', model: 'Xiaomi 14 Ultra', category: 'xiaomi', type: 'phone', year: 2024, rating: 4.8, reviews: 62, badges: ['hot'], colors: ['Black','White','Blue'], variants: [
    { ram:'12GB', storage:'256GB', price:280904091, stock:6 },
    { ram:'12GB', storage:'512GB', price:304403953, stock:5 },
    { ram:'16GB', storage:'512GB', price:327772770, stock:3 },
    { ram:'16GB', storage:'1TB',   price:374882526, stock:2 },
  ], image: null },

  { id: 'xiaomi-14t', brand: 'Xiaomi', name: 'شیائومی 14T', model: 'Xiaomi 14T', category: 'xiaomi', type: 'phone', year: 2024, rating: 4.6, reviews: 88, badges: ['discount'], colors: ['Titan Black','Titan Blue','Titan Gray','Lemon Green'], variants: [
    { ram:'12GB', storage:'256GB', price:163765608, stock:15 },
    { ram:'12GB', storage:'512GB', price:187211421, stock:10 },
  ], image: null },

  { id: 'xiaomi-14t-pro', brand: 'Xiaomi', name: 'شیائومی 14T پرو', model: 'Xiaomi 14T Pro', category: 'xiaomi', type: 'phone', year: 2024, rating: 4.7, reviews: 76, badges: ['discount','hot'], colors: ['Titan Black','Titan Blue','Titan Gray'], variants: [
    { ram:'12GB', storage:'256GB', price:210642137, stock:12 },
    { ram:'12GB', storage:'512GB', price:234075571, stock:8 },
    { ram:'16GB', storage:'512GB', price:257572172, stock:5 },
    { ram:'16GB', storage:'1TB',   price:304403953, stock:3 },
  ], image: null },

  { id: 'xiaomi-15', brand: 'Xiaomi', name: 'شیائومی 15', model: 'Xiaomi 15', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.8, reviews: 72, badges: ['new'], colors: ['Black','White','Liquid Silver','Lilac'], variants: [
    { ram:'12GB', storage:'256GB', price:210642137, stock:10 },
    { ram:'12GB', storage:'512GB', price:234075571, stock:7 },
    { ram:'16GB', storage:'512GB', price:257572172, stock:4 },
    { ram:'16GB', storage:'1TB',   price:304403953, stock:2 },
  ], image: null },

  { id: 'xiaomi-15-ultra', brand: 'Xiaomi', name: 'شیائومی 15 اولترا', model: 'Xiaomi 15 Ultra', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.9, reviews: 42, badges: ['new','hot'], colors: ['Black','White','Silver Chrome'], variants: [
    { ram:'12GB', storage:'256GB', price:280904091, stock:5 },
    { ram:'12GB', storage:'512GB', price:304403953, stock:4 },
    { ram:'16GB', storage:'512GB', price:327772770, stock:3 },
    { ram:'16GB', storage:'1TB',   price:374882526, stock:2 },
  ], image: null },

  { id: 'xiaomi-15t', brand: 'Xiaomi', name: 'شیائومی 15T', model: 'Xiaomi 15T', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.6, reviews: 48, badges: ['new'], colors: ['Black','Silver','Blue'], variants: [
    { ram:'12GB', storage:'256GB', price:163765608, stock:14 },
    { ram:'12GB', storage:'512GB', price:187211421, stock:9 },
  ], image: null },

  { id: 'xiaomi-15t-pro', brand: 'Xiaomi', name: 'شیائومی 15T پرو', model: 'Xiaomi 15T Pro', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.7, reviews: 38, badges: ['new'], colors: ['Black','Silver','Blue'], variants: [
    { ram:'12GB', storage:'256GB', price:210642137, stock:10 },
    { ram:'12GB', storage:'512GB', price:234075571, stock:7 },
    { ram:'16GB', storage:'512GB', price:257572172, stock:4 },
    { ram:'16GB', storage:'1TB',   price:304403953, stock:2 },
  ], image: null },

  { id: 'xiaomi-15s-pro', brand: 'Xiaomi', name: 'شیائومی 15S پرو', model: 'Xiaomi 15S Pro', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.7, reviews: 24, badges: ['new'], colors: ['Black','White'], variants: [
    { ram:'12GB', storage:'256GB', price:210642137, stock:8 },
    { ram:'12GB', storage:'512GB', price:234075571, stock:5 },
    { ram:'16GB', storage:'512GB', price:257572172, stock:3 },
  ], image: null },

  { id: 'xiaomi-17', brand: 'Xiaomi', name: 'شیائومی 17', model: 'Xiaomi 17', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.8, reviews: 18, badges: ['new'], colors: ['Black','White','Blue'], variants: [
    { ram:'12GB', storage:'256GB', price:234075571, stock:8 },
    { ram:'12GB', storage:'512GB', price:257572172, stock:6 },
    { ram:'16GB', storage:'512GB', price:280904091, stock:4 },
    { ram:'16GB', storage:'1TB',   price:327772770, stock:2 },
  ], image: null },

  { id: 'xiaomi-17-pro', brand: 'Xiaomi', name: 'شیائومی 17 پرو', model: 'Xiaomi 17 Pro', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.8, reviews: 12, badges: ['new'], colors: ['Black','White','Blue'], variants: [
    { ram:'16GB', storage:'512GB', price:304403953, stock:6 },
    { ram:'16GB', storage:'1TB',   price:351356333, stock:3 },
  ], image: null },

  { id: 'xiaomi-17-pro-max', brand: 'Xiaomi', name: 'شیائومی 17 پرو مکس', model: 'Xiaomi 17 Pro Max', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.9, reviews: 8, badges: ['new'], colors: ['Black','White','Blue'], variants: [
    { ram:'16GB', storage:'512GB', price:327772770, stock:5 },
    { ram:'16GB', storage:'1TB',   price:374882526, stock:3 },
  ], image: null },

  { id: 'xiaomi-17-ultra', brand: 'Xiaomi', name: 'شیائومی 17 اولترا', model: 'Xiaomi 17 Ultra', category: 'xiaomi', type: 'phone', year: 2026, rating: 4.9, reviews: 4, badges: ['new'], colors: ['Black','White','Silver'], variants: [
    { ram:'16GB', storage:'512GB', price:398251462, stock:4 },
    { ram:'16GB', storage:'1TB',   price:445177211, stock:2 },
  ], image: null },

  /* ============================================
     XIAOMI MIX — تاشو
     ============================================ */
  { id: 'xiaomi-mix-flip', brand: 'Xiaomi', name: 'شیائومی MIX فلیپ', model: 'Xiaomi MIX Flip', category: 'xiaomi', type: 'phone', year: 2024, rating: 4.6, reviews: 42, badges: [], colors: ['Black','White','Purple'], variants: [
    { ram:'12GB', storage:'256GB', price:257572172, stock:5 },
    { ram:'12GB', storage:'512GB', price:280904091, stock:4 },
    { ram:'16GB', storage:'512GB', price:304403953, stock:2 },
    { ram:'16GB', storage:'1TB',   price:351356333, stock:1 },
  ], image: null },

  { id: 'xiaomi-mix-flip-2', brand: 'Xiaomi', name: 'شیائومی MIX فلیپ 2', model: 'Xiaomi MIX Flip 2', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.7, reviews: 28, badges: ['new'], colors: ['Black','White','Purple'], variants: [
    { ram:'12GB', storage:'256GB', price:257572172, stock:6 },
    { ram:'12GB', storage:'512GB', price:280904091, stock:4 },
    { ram:'16GB', storage:'512GB', price:304403953, stock:3 },
    { ram:'16GB', storage:'1TB',   price:351356333, stock:1 },
  ], image: null },

  /* ============================================
     REDMI NOTE
     ============================================ */
  { id: 'redmi-note-14-pro', brand: 'Xiaomi', name: 'ردمی نوت 14 پرو', model: 'Redmi Note 14 Pro', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.5, reviews: 210, badges: ['discount','hot'], colors: ['Midnight Black','Ocean Blue','Lavender Haze','Frosted White'], variants: [
    { ram:'8GB',  storage:'128GB', price:70057841, stock:40 },
    { ram:'8GB',  storage:'256GB', price:81767764, stock:32 },
    { ram:'12GB', storage:'256GB', price:93484933, stock:22 },
    { ram:'12GB', storage:'512GB', price:105202104, stock:14 },
  ], image: null },

  { id: 'redmi-note-14-pro-plus', brand: 'Xiaomi', name: 'ردمی نوت 14 پرو پلاس', model: 'Redmi Note 14 Pro+', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.6, reviews: 142, badges: ['discount'], colors: ['Midnight Black','Ocean Blue','Lavender Haze'], variants: [
    { ram:'12GB', storage:'256GB', price:105202104, stock:18 },
    { ram:'12GB', storage:'512GB', price:116919273, stock:12 },
  ], image: null },

  { id: 'redmi-note-15-pro', brand: 'Xiaomi', name: 'ردمی نوت 15 پرو', model: 'Redmi Note 15 Pro', category: 'xiaomi', type: 'phone', year: 2026, rating: 4.6, reviews: 64, badges: ['new'], colors: ['Black','Blue','White'], variants: [
    { ram:'8GB',  storage:'256GB', price:81767764, stock:30 },
    { ram:'12GB', storage:'256GB', price:93484933, stock:22 },
    { ram:'12GB', storage:'512GB', price:105202104, stock:14 },
  ], image: null },

  { id: 'redmi-note-15-pro-plus', brand: 'Xiaomi', name: 'ردمی نوت 15 پرو پلاس', model: 'Redmi Note 15 Pro+', category: 'xiaomi', type: 'phone', year: 2026, rating: 4.7, reviews: 42, badges: ['new','discount'], colors: ['Black','Blue','White'], variants: [
    { ram:'12GB', storage:'256GB', price:116919273, stock:18 },
    { ram:'12GB', storage:'512GB', price:128636443, stock:12 },
  ], image: null },

  { id: 'redmi-note-13-pro', brand: 'Xiaomi', name: 'ردمی نوت 13 پرو', model: 'Redmi Note 13 Pro', category: 'xiaomi', type: 'phone', year: 2024, rating: 4.4, reviews: 312, badges: ['discount','hot'], colors: ['Midnight Black','Ocean Blue','Aurora Purple','Frosted White'], variants: [
    { ram:'8GB',  storage:'256GB', price:65371698, stock:50 },
    { ram:'12GB', storage:'256GB', price:74743984, stock:38 },
    { ram:'12GB', storage:'512GB', price:86454812, stock:22 },
  ], image: null },

  /* ============================================
     REDMI
     ============================================ */
  { id: 'redmi-14c', brand: 'Xiaomi', name: 'ردمی 14C', model: 'Redmi 14C', category: 'xiaomi', type: 'phone', year: 2024, rating: 4.1, reviews: 428, badges: ['discount','hot'], colors: ['Midnight Black','Starlight Blue','Sage Green'], variants: [
    { ram:'4GB', storage:'128GB', price:30225623, stock:80 },
    { ram:'6GB', storage:'128GB', price:34911767, stock:65 },
    { ram:'8GB', storage:'128GB', price:37254839, stock:50 },
    { ram:'8GB', storage:'256GB', price:41940982, stock:35 },
  ], image: null },

  /* ============================================
     POCO F
     ============================================ */
  { id: 'poco-f6', brand: 'Xiaomi', name: 'پوکو F6', model: 'POCO F6', category: 'xiaomi', type: 'phone', year: 2024, rating: 4.5, reviews: 128, badges: ['discount'], colors: ['Black','Titanium','Green'], variants: [
    { ram:'8GB',  storage:'256GB', price:93484933, stock:28 },
    { ram:'12GB', storage:'256GB', price:105202104, stock:20 },
    { ram:'12GB', storage:'512GB', price:116919273, stock:14 },
  ], image: null },

  { id: 'poco-f6-pro', brand: 'Xiaomi', name: 'پوکو F6 پرو', model: 'POCO F6 Pro', category: 'xiaomi', type: 'phone', year: 2024, rating: 4.6, reviews: 92, badges: ['discount'], colors: ['Black','White'], variants: [
    { ram:'12GB', storage:'256GB', price:116919273, stock:18 },
    { ram:'12GB', storage:'512GB', price:128636443, stock:12 },
    { ram:'16GB', storage:'1TB',   price:163765608, stock:6 },
  ], image: null },

  { id: 'poco-f7', brand: 'Xiaomi', name: 'پوکو F7', model: 'POCO F7', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.6, reviews: 62, badges: ['new'], colors: ['Black','White','Green'], variants: [
    { ram:'12GB', storage:'256GB', price:116919273, stock:20 },
    { ram:'12GB', storage:'512GB', price:128636443, stock:14 },
  ], image: null },

  { id: 'poco-f8-pro', brand: 'Xiaomi', name: 'پوکو F8 پرو', model: 'POCO F8 Pro', category: 'xiaomi', type: 'phone', year: 2026, rating: 4.7, reviews: 18, badges: ['new'], colors: ['Black','White','Blue'], variants: [
    { ram:'16GB', storage:'512GB', price:140353612, stock:12 },
    { ram:'16GB', storage:'1TB',   price:175480966, stock:6 },
  ], image: null },

  /* ============================================
     POCO X
     ============================================ */
  { id: 'poco-x6-pro', brand: 'Xiaomi', name: 'پوکو X6 پرو', model: 'POCO X6 Pro', category: 'xiaomi', type: 'phone', year: 2024, rating: 4.5, reviews: 186, badges: ['discount'], colors: ['Black','Yellow','Gray'], variants: [
    { ram:'8GB',  storage:'256GB', price:70057841, stock:35 },
    { ram:'12GB', storage:'256GB', price:81767764, stock:26 },
    { ram:'12GB', storage:'512GB', price:93484933, stock:18 },
  ], image: null },

  { id: 'poco-x7-pro', brand: 'Xiaomi', name: 'پوکو X7 پرو', model: 'POCO X7 Pro', category: 'xiaomi', type: 'phone', year: 2025, rating: 4.6, reviews: 148, badges: ['discount','hot'], colors: ['Black','Yellow','Green'], variants: [
    { ram:'8GB',  storage:'256GB', price:70057841, stock:32 },
    { ram:'12GB', storage:'256GB', price:81767764, stock:24 },
    { ram:'12GB', storage:'512GB', price:93484933, stock:16 },
  ], image: null },

  { id: 'poco-x8-pro', brand: 'Xiaomi', name: 'پوکو X8 پرو', model: 'POCO X8 Pro', category: 'xiaomi', type: 'phone', year: 2026, rating: 4.6, reviews: 42, badges: ['new','discount'], colors: ['Black','Yellow','Blue'], variants: [
    { ram:'12GB', storage:'256GB', price:93484933, stock:26 },
    { ram:'12GB', storage:'512GB', price:105202104, stock:18 },
  ], image: null },
];