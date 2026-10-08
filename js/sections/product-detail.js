/* ============================================
   PRODUCT DETAIL PAGE — با SEO
   ============================================ */

import { products, formatPrice } from '../data/products.js';
import { cart, wishlist, compare, onChange, KEYS } from '../store/state.js';
import { toast } from '../components/toast.js';
import { openCart } from '../components/cart-drawer.js';
import { renderProductCard } from '../components/product-card.js';
import { reviews } from '../data/reviews.js';
import { injectProductSchema, setPageMeta, injectBreadcrumbSchema, SITE_URL } from '../utils/seo.js';

const ICONS = {
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  star: `<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v8c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V5l-8-3z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  return: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
};

/* ============================================
   STATE
   ============================================ */

let currentProduct = null;
let currentColor = null;
let currentVariantIndex = 0;
let currentTab = 'specs';

/* ============================================
   HELPERS
   ============================================ */

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || 'iphone-16-pro';
}

function renderStars(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 })
    .map((_, i) => (i < full ? ICONS.star : ''))
    .join('');
}

function colorToHex(colorName) {
  const colorMap = {
    'titanium blue': '#4A6578',
    'natural titanium': '#B8B5AE',
    'black titanium': '#2C2C2E',
    'white titanium': '#EDEDED',
    'desert titanium': '#C7B5A0',
    'black': '#1A1A1A',
    'white': '#FAFAFA',
    'silver': '#C0C0C0',
    'blue': '#3B5BA5',
    'navy': '#1E2A47',
    'green': '#3E5F3E',
    'mint': '#B8D9C9',
    'yellow': '#F4D35E',
    'pink': '#F4A9B5',
    'orange': '#E89B5C',
    'cosmic orange': '#D97E42',
    'purple': '#7E6BB5',
    'violet': '#7C5CFF',
    'red': '#D43E3E',
    'gold': '#D4AF37',
    'graphite': '#4A4A4A',
    'silver shadow': '#B5B5B5',
    'icy blue': '#B8D4E8',
    'lavender': '#C9B8E0',
    'sage': '#A8BDA5',
    'mist blue': '#B8C9D9',
    'deep blue': '#1B2D52',
    'obsidian': '#1C1C1E',
    'porcelain': '#F4EFE6',
    'hazel': '#8B7D6B',
    'rose quartz': '#E8C4C4',
    'moonstone': '#C9C4B5',
    'jade': '#5C8B7D',
    'indigo': '#3E4A6D',
    'frost': '#E8EDF2',
    'wintergreen': '#A8C9B8',
    'peony': '#E8B8C4',
    'iris': '#8B7DB5',
  };
  const key = colorName.toLowerCase().trim();
  return colorMap[key] || '#95A5A6';
}

function getStockClass(stock) {
  if (stock === 0) return 'product-info__stock--out';
  if (stock <= 5) return 'product-info__stock--low';
  return '';
}

function getStockLabel(stock) {
  if (stock === 0) return 'ناموجود';
  if (stock <= 5) return `فقط ${stock} عدد باقی مانده`;
  return 'موجود در انبار';
}

/* ============================================
   BREADCRUMB
   ============================================ */

function renderBreadcrumb(p) {
  const el = document.getElementById('breadcrumb-current');
  if (el) el.textContent = p.name;

  const parentLink = document.querySelector('.breadcrumb a:nth-child(3)');
  if (parentLink) {
    parentLink.textContent = p.brand;
    parentLink.href = `brand.html?id=${p.category}`;
  }

  // SEO Breadcrumb Schema
  injectBreadcrumbSchema([
    { name: 'خانه', url: SITE_URL + '/' },
    { name: 'گوشی موبایل', url: SITE_URL + '/category.html?type=phone' },
    { name: p.brand, url: `${SITE_URL}/brand.html?id=${p.category}` },
    { name: p.name, url: `${SITE_URL}/product.html?id=${p.id}` },
  ]);
}

/* ============================================
   GALLERY
   ============================================ */

function renderGallery(p) {
  const mainEl = document.getElementById('gallery-main');
  const thumbsEl = document.getElementById('gallery-thumbs');
  const badgeEl = document.getElementById('gallery-badge');

  if (!mainEl || !thumbsEl) return;

  const baseSrc = `assets/images/products/${p.id}.jpg`;

  const images = [
    { src: baseSrc, label: 'اصلی' },
    { src: `assets/images/products/${p.id}-2.jpg`, label: 'پشت' },
    { src: `assets/images/products/${p.id}-3.jpg`, label: 'کنار' },
    { src: `assets/images/products/${p.id}-4.jpg`, label: 'جعبه' },
    { src: `assets/images/products/${p.id}-5.jpg`, label: 'جزئیات' },
  ];

  mainEl.innerHTML = `
    <img src="${images[0].src}" alt="${p.name}" loading="eager" onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<div class=\'ph ph--square\'>تصویر محصول</div>';" />
  `;

  if (badgeEl) {
    const badges = [];
    if (p.badges?.includes('new')) badges.push('<span class="badge badge--new">جدید</span>');
    if (p.badges?.includes('hot')) badges.push('<span class="badge badge--hot">پرفروش</span>');
    if (p.badges?.includes('discount') && p.discount) {
      badges.push(`<span class="badge badge--discount">٪${p.discount} تخفیف</span>`);
    }
    badgeEl.innerHTML = badges.join('');
  }

  thumbsEl.innerHTML = images.map((img, i) => `
    <button class="product-gallery__thumb ${i === 0 ? 'is-active' : ''}" data-thumb-index="${i}">
      <img src="${img.src}" alt="${img.label}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'ph ph--xs\'>${img.label}</div>';" />
    </button>
  `).join('');

  thumbsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-thumb-index]');
    if (!btn) return;

    const idx = Number(btn.dataset.thumbIndex);
    thumbsEl.querySelectorAll('.product-gallery__thumb').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    mainEl.innerHTML = `
      <img src="${images[idx].src}" alt="${p.name}" onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<div class=\'ph ph--square\'>تصویر محصول</div>';" />
    `;
  });
}

/* ============================================
   INFO
   ============================================ */

function renderInfo(p) {
  const el = document.getElementById('product-info');
  if (!el) return;

  currentColor = p.colors?.[0] || null;
  currentVariantIndex = 0;

  const cheapestIndex = p.variants.reduce(
    (minIdx, v, idx, arr) => (v.price < arr[minIdx].price ? idx : minIdx),
    0
  );
  currentVariantIndex = cheapestIndex;

  const v = p.variants[currentVariantIndex];

  const isWished = wishlist.has(p.id);
  const isInStock = v.stock > 0;

  el.innerHTML = `
    <div class="product-info__brand-row">
      <span class="product-info__brand">
        <span class="product-info__brand-dot"></span>
        ${p.brand}
      </span>
      <span class="product-info__rating">
        <span class="product-info__stars">${renderStars(p.rating)}</span>
        <span class="product-info__rating-value">${p.rating.toFixed(1)}</span>
        <span>(${p.reviews} نظر)</span>
      </span>
    </div>

    <h1 class="product-info__title">${p.name}</h1>
    <div class="product-info__model">${p.model || ''}</div>

    ${p.colors?.length ? `
      <div class="product-info__section">
        <div class="product-info__section-head">
          <span class="product-info__label">انتخاب رنگ</span>
          <span class="product-info__selected" data-color-label>${currentColor}</span>
        </div>
        <div class="product-info__colors" id="color-options">
          ${p.colors.map((c, i) => `
            <button class="product-color-btn ${i === 0 ? 'is-active' : ''}" data-color-index="${i}" data-color="${c}">
              <span class="product-color-btn__dot" style="background:${colorToHex(c)}"></span>
              ${c}
            </button>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div class="product-info__section">
      <div class="product-info__section-head">
        <span class="product-info__label">حافظه و رم</span>
        <span class="product-info__selected" data-storage-label>${v.storage}</span>
      </div>
      <div class="product-info__storages" id="storage-options">
        ${p.variants.map((vr, i) => `
          <button class="product-storage-btn ${i === currentVariantIndex ? 'is-active' : ''}" data-variant-index="${i}" ${vr.stock === 0 ? 'disabled' : ''}>
            ${vr.storage}
            <span class="product-storage-btn__ram">${vr.ram}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="product-info__price-box">
      <div class="product-info__stock-row">
        <span class="product-info__stock ${getStockClass(v.stock)}" data-stock>
          ${v.stock > 0 ? ICONS.check : ''}
          ${getStockLabel(v.stock)}
        </span>
      </div>
      <div class="product-info__price-row">
        <span class="product-info__price-current" data-price>
          ${formatPrice(v.price)}
          <span>تومان</span>
        </span>
        <div class="product-info__price-meta" data-price-meta>
          ${v.oldPrice ? `
            <span class="product-info__price-old">${formatPrice(v.oldPrice)}</span>
            <span class="product-info__save">
              ${ICONS.check}
              ${formatPrice(v.oldPrice - v.price)} تومان صرفه‌جویی
            </span>
          ` : ''}
        </div>
      </div>
    </div>

    <div class="product-info__cta">
      <button class="product-info__add-cart" id="add-to-cart-btn" ${!isInStock ? 'disabled' : ''}>
        ${ICONS.cart}
        افزودن به سبد خرید
      </button>
      <button class="product-info__wish ${isWished ? 'is-active' : ''}" id="wish-btn" aria-label="علاقه‌مندی">
        ${ICONS.heart}
      </button>
    </div>

    <div class="product-info__benefits">
      <div class="product-benefit">
        <span class="product-benefit__icon">${ICONS.shield}</span>
        <span class="product-benefit__title">ضمانت اصالت</span>
        <span class="product-benefit__desc">تضمین اورجینال</span>
      </div>
      <div class="product-benefit">
        <span class="product-benefit__icon">${ICONS.truck}</span>
        <span class="product-benefit__title">ارسال سریع</span>
        <span class="product-benefit__desc">۱ روزه</span>
      </div>
      <div class="product-benefit">
        <span class="product-benefit__icon">${ICONS.return}</span>
        <span class="product-benefit__title">۷ روز بازگشت</span>
        <span class="product-benefit__desc">بدون قید و شرط</span>
      </div>
    </div>
  `;

  bindInfoEvents(p);
}

function bindInfoEvents(p) {
  /* ---------- Color ---------- */
  const colorWrap = document.getElementById('color-options');
  if (colorWrap) {
    colorWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-color-index]');
      if (!btn) return;

      colorWrap.querySelectorAll('.product-color-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentColor = btn.dataset.color;

      const label = document.querySelector('[data-color-label]');
      if (label) label.textContent = currentColor;
    });
  }

  /* ---------- Storage ---------- */
  const storageWrap = document.getElementById('storage-options');
  if (storageWrap) {
    storageWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-variant-index]');
      if (!btn || btn.disabled) return;

      storageWrap.querySelectorAll('.product-storage-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      currentVariantIndex = Number(btn.dataset.variantIndex);
      updatePriceAndStock(p);
    });
  }

  /* ---------- Add to Cart ---------- */
  const addBtn = document.getElementById('add-to-cart-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const v = p.variants[currentVariantIndex];
      if (v.stock === 0) return;

      const cartItem = {
        id: `${p.id}-${v.storage}`,
        brand: p.brand,
        name: p.name,
        ram: v.ram,
        storage: v.storage,
        color: currentColor || null,
        price: v.price,
        oldPrice: v.oldPrice || null,
        image: p.image || `assets/images/products/${p.id}.jpg`,
      };

      cart.add(cartItem, 1);

      const original = addBtn.innerHTML;
      addBtn.classList.add('is-added');
      addBtn.innerHTML = `${ICONS.check} اضافه شد`;

      toast({
        type: 'success',
        title: 'به سبد خرید اضافه شد',
        message: `${p.name} — ${v.storage}`,
      });

      setTimeout(() => {
        addBtn.classList.remove('is-added');
        addBtn.innerHTML = original;
      }, 1600);

      setTimeout(() => openCart(), 500);
    });
  }

  /* ---------- Wishlist ---------- */
  const wishBtn = document.getElementById('wish-btn');
  if (wishBtn) {
    wishBtn.addEventListener('click', () => {
      const { added } = wishlist.toggle(p);
      wishBtn.classList.toggle('is-active', added);

      toast({
        type: added ? 'success' : 'info',
        title: added ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد',
        message: p.name,
        duration: 2200,
      });
    });
  }
}

function updatePriceAndStock(p) {
  const v = p.variants[currentVariantIndex];

  const priceEl = document.querySelector('[data-price]');
  if (priceEl) {
    priceEl.innerHTML = `${formatPrice(v.price)} <span>تومان</span>`;
  }

  const metaEl = document.querySelector('[data-price-meta]');
  if (metaEl) {
    metaEl.innerHTML = v.oldPrice
      ? `
        <span class="product-info__price-old">${formatPrice(v.oldPrice)}</span>
        <span class="product-info__save">
          ${ICONS.check}
          ${formatPrice(v.oldPrice - v.price)} تومان صرفه‌جویی
        </span>
      `
      : '';
  }

  const stockEl = document.querySelector('[data-stock]');
  if (stockEl) {
    stockEl.className = `product-info__stock ${getStockClass(v.stock)}`;
    stockEl.innerHTML = `
      ${v.stock > 0 ? ICONS.check : ''}
      ${getStockLabel(v.stock)}
    `;
  }

  const storageLabel = document.querySelector('[data-storage-label]');
  if (storageLabel) {
    storageLabel.textContent = `${v.storage} • ${v.ram}`;
  }

  const addBtn = document.getElementById('add-to-cart-btn');
  if (addBtn) {
    addBtn.disabled = v.stock === 0;
  }

  // Update SEO price dynamically
  if (currentProduct) {
    injectProductSchema(currentProduct, v.price);
  }
}

/* ============================================
   TABS
   ============================================ */

function renderTabs(p) {
  const nav = document.querySelector('.product-tabs__nav');
  if (!nav) return;

  renderTabContent(p, currentTab);

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;

    nav.querySelectorAll('.product-tabs__tab').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    currentTab = btn.dataset.tab;
    renderTabContent(p, currentTab);
  });
}

function renderTabContent(p, tab) {
  const content = document.getElementById('product-tabs-content');
  if (!content) return;

  if (tab === 'specs') {
    const v = p.variants[0];
    const specs = [
      { label: 'برند', value: p.brand },
      { label: 'مدل', value: p.model || p.name },
      { label: 'سال معرفی', value: p.year || '-' },
      { label: 'نوع', value: p.type === 'phone' ? 'گوشی موبایل' : 'تبلت' },
      { label: 'رم', value: v.ram },
      { label: 'حافظه داخلی', value: v.storage },
      { label: 'رنگ‌های موجود', value: (p.colors || []).join(' • ') || '-' },
      { label: 'تعداد واریانت', value: `${p.variants.length} نسخه` },
      { label: 'امتیاز کاربران', value: `${p.rating.toFixed(1)} از ۵` },
      { label: 'تعداد نظرات', value: `${p.reviews} نظر` },
    ];

    content.innerHTML = `
      <div class="specs-table">
        ${specs.map((s) => `
          <div class="spec-row">
            <span class="spec-row__label">${s.label}</span>
            <span class="spec-row__value">${s.value}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else if (tab === 'desc') {
    content.innerHTML = `
      <div class="product-description">
        <h3>درباره ${p.name}</h3>
        <p>
          ${p.name} از جدیدترین محصولات ${p.brand} در سال ${p.year} است که با طراحی مدرن،
          عملکرد بالا و امکانات پیشرفته عرضه شده. این محصول مناسب کاربران حرفه‌ای و
          علاقه‌مندان به تکنولوژی است.
        </p>

        <h3>ویژگی‌های کلیدی</h3>
        <ul>
          <li>طراحی مدرن و باریک با کیفیت ساخت بالا</li>
          <li>نمایشگر با کیفیت و رفرش ریت بالا</li>
          <li>پردازنده قدرتمند برای اجرای روان بازی‌ها</li>
          <li>دوربین حرفه‌ای برای عکاسی و فیلم‌برداری</li>
          <li>باتری با ظرفیت بالا و شارژ سریع</li>
          <li>پشتیبانی از 5G و Wi-Fi نسل جدید</li>
          <li>ضمانت اصالت و خدمات پس از فروش مطمئن</li>
        </ul>

        <h3>مناسب برای چه کسانی؟</h3>
        <p>
          اگر به‌دنبال یک ${p.type === 'phone' ? 'گوشی' : 'تبلت'} قدرتمند، خوش‌ساخت و
          با دوام هستید که نیازهای روزمره و حرفه‌ای شما را پاسخ دهد، ${p.name} یکی از
          بهترین انتخاب‌هاست.
        </p>
      </div>
    `;
  } else if (tab === 'reviews') {
    const productReviews = reviews.slice(0, 5);

    if (!productReviews.length) {
      content.innerHTML = `<div class="product-reviews-empty">هنوز نظری ثبت نشده. اولین نظر را شما بگذارید.</div>`;
      return;
    }

    content.innerHTML = `
      <div class="product-reviews-list">
        ${productReviews.map((r) => `
          <div class="product-review">
            <div class="product-review__head">
              <span class="product-review__avatar" style="background:${r.avatarColor}">${r.initials}</span>
              <div class="product-review__info">
                <span class="product-review__name">${r.name}</span>
                <span class="product-review__date">${r.date}</span>
              </div>
              <span class="product-review__stars">
                ${Array.from({ length: 5 }).map((_, i) => (i < r.rating ? ICONS.star : '')).join('')}
              </span>
            </div>
            <p class="product-review__body">${r.comment}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
}

/* ============================================
   SIMILAR PRODUCTS
   ============================================ */

function renderSimilar(p) {
  const grid = document.getElementById('similar-grid');
  if (!grid) return;

  const similar = products
    .filter((x) => x.id !== p.id)
    .filter((x) => x.category === p.category || x.type === p.type)
    .slice(0, 4);

  grid.innerHTML = similar.map(renderProductCard).join('');
}

/* ============================================
   INIT
   ============================================ */

export function initProductDetail() {
  const page = document.getElementById('product-page');
  if (!page) return;

  const id = getProductIdFromUrl();
  const p = products.find((x) => x.id === id);

  if (!p) {
    page.innerHTML = `
      <div class="container" style="padding: 80px 20px; text-align: center;">
        <h2 style="font-size: 24px; margin-bottom: 12px;">محصول پیدا نشد</h2>
        <p style="color: var(--text-muted); margin-bottom: 24px;">متأسفانه محصول مورد نظر یافت نشد.</p>
        <a href="index.html" class="btn btn--primary">بازگشت به فروشگاه</a>
      </div>
    `;
    return;
  }

  currentProduct = p;

  // ===== SEO — Meta + Schema =====
  const v = p.variants[currentVariantIndex] || p.variants[0];

  setPageMeta({
    title: `${p.name} | خرید با بهترین قیمت | موبایل استور`,
    description: `خرید ${p.name} با ضمانت اصالت، گارانتی رسمی و ارسال سریع. قیمت از ${formatPrice(v.price)} تومان.`,
    image: p.image,
    url: `${SITE_URL}/product.html?id=${p.id}`,
    type: 'product',
  });

  injectProductSchema(p, v.price);

  // ===== Render =====
  renderBreadcrumb(p);
  renderGallery(p);
  renderInfo(p);
  renderTabs(p);
  renderSimilar(p);
}