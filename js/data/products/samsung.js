/* ============================================
   SAMSUNG — 34 مدل
   ============================================ */

export const samsungProducts = [
  /* ============================================
     GALAXY S
     ============================================ */
  { id: 'galaxy-s24', brand: 'Samsung', name: 'گلکسی S24', model: 'Galaxy S24', category: 'samsung', type: 'phone', year: 2024, rating: 4.7, reviews: 145, badges: ['discount'], colors: ['Onyx Black','Marble Gray','Cobalt Violet','Amber Yellow'], variants: [
    { ram:'8GB', storage:'128GB', price:152769976, stock:18 },
    { ram:'8GB', storage:'256GB', price:164242753, stock:14 },
    { ram:'8GB', storage:'512GB', price:187188310, stock:8 },
  ], image: null },

  { id: 'galaxy-s24-plus', brand: 'Samsung', name: 'گلکسی S24 پلاس', model: 'Galaxy S24+', category: 'samsung', type: 'phone', year: 2024, rating: 4.7, reviews: 96, badges: [], colors: ['Onyx Black','Marble Gray','Cobalt Violet','Amber Yellow'], variants: [
    { ram:'12GB', storage:'256GB', price:225121861, stock:10 },
    { ram:'12GB', storage:'512GB', price:252164838, stock:7 },
  ], image: null },

  { id: 'galaxy-s24-ultra', brand: 'Samsung', name: 'گلکسی S24 اولترا', model: 'Galaxy S24 Ultra', category: 'samsung', type: 'phone', year: 2024, rating: 4.8, reviews: 178, badges: ['hot'], colors: ['Titanium Gray','Titanium Black','Titanium Violet','Titanium Yellow'], variants: [
    { ram:'12GB', storage:'256GB', price:292760086, stock:8 },
    { ram:'12GB', storage:'512GB', price:319803064, stock:6 },
    { ram:'12GB', storage:'1TB',   price:373889018, stock:3 },
  ], image: null },

  { id: 'galaxy-s24-fe', brand: 'Samsung', name: 'گلکسی S24 FE', model: 'Galaxy S24 FE', category: 'samsung', type: 'phone', year: 2024, rating: 4.5, reviews: 78, badges: ['discount'], colors: ['Blue','Graphite','Mint','Yellow'], variants: [
    { ram:'8GB', storage:'128GB', price:124077435, stock:22 },
    { ram:'8GB', storage:'256GB', price:133637508, stock:18 },
    { ram:'8GB', storage:'512GB', price:152769976, stock:10 },
  ], image: null },

  { id: 'galaxy-s25', brand: 'Samsung', name: 'گلکسی S25', model: 'Galaxy S25', category: 'samsung', type: 'phone', year: 2025, rating: 4.7, reviews: 132, badges: [], colors: ['Icy Blue','Navy','Mint','Silver Shadow'], variants: [
    { ram:'12GB', storage:'128GB', price:180050329, stock:15 },
    { ram:'12GB', storage:'256GB', price:193571817, stock:12 },
    { ram:'12GB', storage:'512GB', price:220614794, stock:7 },
  ], image: null },

  { id: 'galaxy-s25-plus', brand: 'Samsung', name: 'گلکسی S25 پلاس', model: 'Galaxy S25+', category: 'samsung', type: 'phone', year: 2025, rating: 4.7, reviews: 88, badges: [], colors: ['Icy Blue','Navy','Mint','Silver Shadow'], variants: [
    { ram:'12GB', storage:'256GB', price:225121861, stock:10 },
    { ram:'12GB', storage:'512GB', price:252164838, stock:7 },
  ], image: null },

  { id: 'galaxy-s25-ultra', brand: 'Samsung', name: 'گلکسی S25 اولترا', model: 'Galaxy S25 Ultra', category: 'samsung', type: 'phone', year: 2025, rating: 4.9, reviews: 156, badges: ['new','hot'], colors: ['Titanium Silverblue','Titanium Black','Titanium Whitesilver','Titanium Gray','Titanium Jetblack'], variants: [
    { ram:'12GB', storage:'256GB', price:292760086, stock:6 },
    { ram:'12GB', storage:'512GB', price:319803064, stock:5 },
    { ram:'12GB', storage:'1TB',   price:373889018, stock:3 },
    { ram:'16GB', storage:'512GB', price:342360813, stock:4 },
    { ram:'16GB', storage:'1TB',   price:396446767, stock:2 },
  ], image: null },

  { id: 'galaxy-s25-edge', brand: 'Samsung', name: 'گلکسی S25 Edge', model: 'Galaxy S25 Edge', category: 'samsung', type: 'phone', year: 2025, rating: 4.6, reviews: 42, badges: ['new'], colors: ['Titanium Icyblue','Titanium Silver','Titanium Jetblack'], variants: [
    { ram:'12GB', storage:'256GB', price:247720685, stock:8 },
    { ram:'12GB', storage:'512GB', price:274762663, stock:5 },
  ], image: null },

  { id: 'galaxy-s25-fe', brand: 'Samsung', name: 'گلکسی S25 FE', model: 'Galaxy S25 FE', category: 'samsung', type: 'phone', year: 2025, rating: 4.5, reviews: 54, badges: ['discount'], colors: ['Blue','Graphite','Mint','Navy'], variants: [
    { ram:'8GB', storage:'128GB', price:133637508, stock:20 },
    { ram:'8GB', storage:'256GB', price:143197582, stock:16 },
    { ram:'8GB', storage:'512GB', price:162330049, stock:9 },
  ], image: null },

  { id: 'galaxy-s26', brand: 'Samsung', name: 'گلکسی S26', model: 'Galaxy S26', category: 'samsung', type: 'phone', year: 2026, rating: 4.7, reviews: 28, badges: ['new'], colors: ['Black','Silver','Blue','Green'], variants: [
    { ram:'12GB', storage:'256GB', price:180050329, stock:12 },
    { ram:'12GB', storage:'512GB', price:207093306, stock:8 },
  ], image: null },

  { id: 'galaxy-s26-plus', brand: 'Samsung', name: 'گلکسی S26 پلاس', model: 'Galaxy S26+', category: 'samsung', type: 'phone', year: 2026, rating: 4.7, reviews: 18, badges: ['new'], colors: ['Black','Silver','Blue','Green'], variants: [
    { ram:'12GB', storage:'256GB', price:225121861, stock:9 },
    { ram:'12GB', storage:'512GB', price:252164838, stock:6 },
  ], image: null },

  { id: 'galaxy-s26-ultra', brand: 'Samsung', name: 'گلکسی S26 اولترا', model: 'Galaxy S26 Ultra', category: 'samsung', type: 'phone', year: 2026, rating: 4.9, reviews: 42, badges: ['new','hot'], colors: ['Titanium Black','Titanium Silver','Titanium Blue'], variants: [
    { ram:'12GB', storage:'256GB', price:292760086, stock:5 },
    { ram:'12GB', storage:'512GB', price:337916473, stock:4 },
    { ram:'12GB', storage:'1TB',   price:405522291, stock:2 },
    { ram:'16GB', storage:'512GB', price:360542757, stock:3 },
    { ram:'16GB', storage:'1TB',   price:428148574, stock:2 },
  ], image: null },

  { id: 'galaxy-s26-fe', brand: 'Samsung', name: 'گلکسی S26 FE', model: 'Galaxy S26 FE', category: 'samsung', type: 'phone', year: 2026, rating: 4.5, reviews: 12, badges: ['new','discount'], colors: ['Blue','Graphite','Mint'], variants: [
    { ram:'8GB', storage:'128GB', price:143197582, stock:18 },
    { ram:'8GB', storage:'256GB', price:152769976, stock:14 },
  ], image: null },

  /* ============================================
     GALAXY Z — تاشو
     ============================================ */
  { id: 'galaxy-z-fold6', brand: 'Samsung', name: 'گلکسی Z فولد 6', model: 'Galaxy Z Fold6', category: 'samsung', type: 'phone', year: 2024, rating: 4.7, reviews: 84, badges: ['hot'], colors: ['Navy','Silver Shadow','Pink'], variants: [
    { ram:'12GB', storage:'256GB', price:428148574, stock:5 },
    { ram:'12GB', storage:'512GB', price:455191551, stock:4 },
    { ram:'12GB', storage:'1TB',   price:509277506, stock:2 },
  ], image: null },

  { id: 'galaxy-z-flip6', brand: 'Samsung', name: 'گلکسی Z فلیپ 6', model: 'Galaxy Z Flip6', category: 'samsung', type: 'phone', year: 2024, rating: 4.6, reviews: 92, badges: ['discount'], colors: ['Silver Shadow','Yellow','Blue','Mint'], variants: [
    { ram:'12GB', storage:'256GB', price:247720685, stock:7 },
    { ram:'12GB', storage:'512GB', price:274762663, stock:5 },
  ], image: null },

  { id: 'galaxy-z-fold-se', brand: 'Samsung', name: 'گلکسی Z فولد ادیشن', model: 'Galaxy Z Fold Special Edition', category: 'samsung', type: 'phone', year: 2024, rating: 4.7, reviews: 34, badges: [], colors: ['Black'], variants: [
    { ram:'12GB', storage:'256GB', price:450657246, stock:4 },
    { ram:'12GB', storage:'512GB', price:477699223, stock:3 },
    { ram:'12GB', storage:'1TB',   price:531785177, stock:2 },
  ], image: null },

  { id: 'galaxy-z-fold7', brand: 'Samsung', name: 'گلکسی Z فولد 7', model: 'Galaxy Z Fold7', category: 'samsung', type: 'phone', year: 2025, rating: 4.8, reviews: 62, badges: ['new','hot'], colors: ['Blue Shadow','Silver Shadow','Jet Black','Mint'], variants: [
    { ram:'12GB', storage:'256GB', price:450883191, stock:5 },
    { ram:'12GB', storage:'512GB', price:495956901, stock:4 },
    { ram:'12GB', storage:'1TB',   price:563596869, stock:2 },
    { ram:'16GB', storage:'512GB', price:518373879, stock:3 },
    { ram:'16GB', storage:'1TB',   price:586013847, stock:2 },
  ], image: null },

  { id: 'galaxy-z-flip7', brand: 'Samsung', name: 'گلکسی Z فلیپ 7', model: 'Galaxy Z Flip7', category: 'samsung', type: 'phone', year: 2025, rating: 4.7, reviews: 48, badges: ['new'], colors: ['Blue','Jet Black','Coral Red','Mint'], variants: [
    { ram:'12GB', storage:'256GB', price:248007762, stock:6 },
    { ram:'12GB', storage:'512GB', price:304403953, stock:4 },
  ], image: null },

  { id: 'galaxy-z-flip7-fe', brand: 'Samsung', name: 'گلکسی Z فلیپ 7 FE', model: 'Galaxy Z Flip7 FE', category: 'samsung', type: 'phone', year: 2025, rating: 4.5, reviews: 22, badges: ['discount'], colors: ['Black','White'], variants: [
    { ram:'8GB', storage:'256GB', price:189155872, stock:10 },
    { ram:'8GB', storage:'512GB', price:210198011, stock:6 },
  ], image: null },

  { id: 'galaxy-z-trifold', brand: 'Samsung', name: 'گلکسی Z تری‌فولد', model: 'Galaxy Z TriFold', category: 'samsung', type: 'phone', year: 2025, rating: 4.8, reviews: 8, badges: ['new'], colors: ['Black'], variants: [
    { ram:'16GB', storage:'512GB', price:679256459, stock:2 },
    { ram:'16GB', storage:'1TB',   price:749548608, stock:1 },
  ], image: null },

  { id: 'galaxy-z-fold8', brand: 'Samsung', name: 'گلکسی Z فولد 8', model: 'Galaxy Z Fold8', category: 'samsung', type: 'phone', year: 2026, rating: 4.8, reviews: 6, badges: ['new'], colors: ['Black','Blue','Silver'], variants: [
    { ram:'12GB', storage:'256GB', price:444951110, stock:4 },
    { ram:'12GB', storage:'512GB', price:491819789, stock:3 },
    { ram:'12GB', storage:'1TB',   price:585557147, stock:2 },
    { ram:'16GB', storage:'512GB', price:538588468, stock:2 },
    { ram:'16GB', storage:'1TB',   price:632425826, stock:1 },
  ], image: null },

  { id: 'galaxy-z-fold8-ultra', brand: 'Samsung', name: 'گلکسی Z فولد 8 اولترا', model: 'Galaxy Z Fold8 Ultra', category: 'samsung', type: 'phone', year: 2026, rating: 4.9, reviews: 4, badges: ['new'], colors: ['Black','Silver'], variants: [
    { ram:'16GB', storage:'512GB', price:538588468, stock:3 },
    { ram:'16GB', storage:'1TB',   price:632425826, stock:2 },
  ], image: null },

  { id: 'galaxy-z-flip8', brand: 'Samsung', name: 'گلکسی Z فلیپ 8', model: 'Galaxy Z Flip8', category: 'samsung', type: 'phone', year: 2026, rating: 4.7, reviews: 5, badges: ['new'], colors: ['Black','Blue','Pink'], variants: [
    { ram:'12GB', storage:'256GB', price:280904091, stock:5 },
    { ram:'12GB', storage:'512GB', price:327772770, stock:3 },
  ], image: null },

  /* ============================================
     GALAXY A — میان‌رده
     ============================================ */
  { id: 'galaxy-a56', brand: 'Samsung', name: 'گلکسی A56 5G', model: 'Galaxy A56 5G', category: 'samsung', type: 'phone', year: 2025, rating: 4.5, reviews: 128, badges: ['discount','hot'], colors: ['Awesome Graphite','Awesome Light Gray','Awesome Olive','Awesome Pink'], variants: [
    { ram:'8GB',  storage:'128GB', price:92368662, stock:25 },
    { ram:'8GB',  storage:'256GB', price:88160361, stock:20 },
    { ram:'12GB', storage:'256GB', price:96576965, stock:15 },
  ], image: null },

  { id: 'galaxy-a36', brand: 'Samsung', name: 'گلکسی A36 5G', model: 'Galaxy A36 5G', category: 'samsung', type: 'phone', year: 2025, rating: 4.4, reviews: 96, badges: ['discount'], colors: ['Awesome Black','Awesome White','Awesome Lavender','Awesome Navy'], variants: [
    { ram:'6GB', storage:'128GB', price:77636107, stock:30 },
    { ram:'8GB', storage:'128GB', price:83949130, stock:24 },
    { ram:'8GB', storage:'256GB', price:99732907, stock:16 },
  ], image: null },

  { id: 'galaxy-a26', brand: 'Samsung', name: 'گلکسی A26 5G', model: 'Galaxy A26 5G', category: 'samsung', type: 'phone', year: 2025, rating: 4.3, reviews: 72, badges: ['discount'], colors: ['Awesome Black','Awesome White','Awesome Mint'], variants: [
    { ram:'6GB', storage:'128GB', price:56599477, stock:35 },
    { ram:'8GB', storage:'128GB', price:62911686, stock:28 },
    { ram:'8GB', storage:'256GB', price:73427155, stock:20 },
  ], image: null },

  { id: 'galaxy-a17', brand: 'Samsung', name: 'گلکسی A17 5G', model: 'Galaxy A17 5G', category: 'samsung', type: 'phone', year: 2025, rating: 4.2, reviews: 154, badges: ['discount','hot'], colors: ['Awesome Black','Awesome Blue','Awesome Gold'], variants: [
    { ram:'4GB', storage:'128GB', price:46079128, stock:45 },
    { ram:'6GB', storage:'128GB', price:56599477, stock:38 },
    { ram:'8GB', storage:'128GB', price:58703547, stock:30 },
    { ram:'8GB', storage:'256GB', price:67119825, stock:22 },
  ], image: null },

  /* ============================================
     GALAXY M — اقتصادی
     ============================================ */
  { id: 'galaxy-m56', brand: 'Samsung', name: 'گلکسی M56 5G', model: 'Galaxy M56 5G', category: 'samsung', type: 'phone', year: 2025, rating: 4.4, reviews: 68, badges: ['discount'], colors: ['Black','Light Green'], variants: [
    { ram:'8GB', storage:'128GB', price:71538372, stock:30 },
    { ram:'8GB', storage:'256GB', price:79323430, stock:22 },
  ], image: null },

  { id: 'galaxy-m36', brand: 'Samsung', name: 'گلکسی M36 5G', model: 'Galaxy M36 5G', category: 'samsung', type: 'phone', year: 2025, rating: 4.3, reviews: 82, badges: ['discount'], colors: ['Black','Blue','Violet'], variants: [
    { ram:'6GB', storage:'128GB', price:40608547, stock:40 },
    { ram:'8GB', storage:'128GB', price:44606279, stock:32 },
    { ram:'8GB', storage:'256GB', price:51970524, stock:24 },
  ], image: null },

  { id: 'galaxy-m16', brand: 'Samsung', name: 'گلکسی M16 5G', model: 'Galaxy M16 5G', category: 'samsung', type: 'phone', year: 2025, rating: 4.2, reviews: 124, badges: ['discount','hot'], colors: ['Black','Light Green','Blue'], variants: [
    { ram:'4GB', storage:'128GB', price:27352907, stock:55 },
    { ram:'6GB', storage:'128GB', price:31561047, stock:45 },
    { ram:'8GB', storage:'128GB', price:33665117, stock:38 },
    { ram:'8GB', storage:'256GB', price:37873256, stock:28 },
  ], image: null },
];