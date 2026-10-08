/* ============================================
   PRODUCT DETAIL PAGE — با SEO + Reviews
   ============================================ */

import { products, formatPrice } from '../data/products.js';
import { cart, wishlist, compare, onChange, KEYS } from '../store/state.js';
import { toast } from '../components/toast.js';
import { openCart } from '../components/cart-drawer.js';
import { renderProductCard } from '../components/product-card.js';
import { injectProductSchema, setPageMeta, injectBreadcrumbSchema, SITE_URL } from '../utils/seo.js';
import { getProductReviews, addReview, getUserReviewForProduct } from '../services/reviews.js';
import { getCurrentUser } from '../services/auth.js';

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

async function renderTabContent(p, tab) {
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
    content.innerHTML = `
      <div class="product-reviews-loading">
        <div class="skeleton" style="height:60px; border-radius:12px; margin-bottom:12px;"></div>
        <div class="skeleton" style="height:60px; border-radius:12px; margin-bottom:12px;"></div>
        <div class="skeleton" style="height:60px; border-radius:12px;"></div>
      </div>
    `;

    const [reviews, user, existingReview] = await Promise.all([
      getProductReviews(p.id, 20),
      getCurrentUser(),
      getUserReviewForProduct(p.id),
    ]);

    const stats = reviews.length
      ? {
          count: reviews.length,
          average: Math.round(
            (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) * 10
          ) / 10,
        }
      : { count: 0, average: 0 };

    const statsHTML = `
      <div class="product-reviews-stats">
        <div class="product-reviews-stats__score">
          <span class="product-reviews-stats__number">${stats.average.toFixed(1)}</span>
          <div class="product-reviews-stats__stars">
            ${renderStars(stats.average)}
          </div>
          <span class="product-reviews-stats__count">از ${stats.count.toLocaleString('fa-IR')} نظر</span>
        </div>
        ${user && !existingReview ? `
          <button class="product-reviews-stats__add" id="add-review-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            ثبت نظر شما
          </button>
        ` : ''}
      </div>
    `;

    const formHTML = user && !existingReview ? `
      <div class="product-review-form" id="review-form" hidden>
        <h4 class="product-review-form__title">نظر خود را ثبت کنید</h4>

        <div class="product-review-form__rating" id="review-rating">
          <span class="product-review-form__rating-label">امتیاز شما:</span>
          <div class="product-review-form__stars" role="radiogroup">
            ${[5, 4, 3, 2, 1].map((n) => `
              <button type="button" class="product-review-form__star" data-rating="${n}" aria-label="${n} ستاره">
                ${ICONS.star}
              </button>
            `).join('')}
          </div>
          <span class="product-review-form__rating-value" id="rating-value">۵ از ۵</span>
        </div>

        <div class="product-review-form__field">
          <label for="review-comment" class="product-review-form__label">
            متن نظر <span style="color:var(--discount);">*</span>
          </label>
          <textarea
            id="review-comment"
            class="product-review-form__textarea"
            placeholder="تجربه‌ی خود را با دیگران به اشتراک بگذارید... (حداقل ۱۰ کاراکتر)"
            rows="4"
            maxlength="500"
          ></textarea>
          <div class="product-review-form__counter">
            <span id="review-counter">۰</span> / ۵۰۰ کاراکتر
          </div>
        </div>

        <div class="product-review-form__actions">
          <button type="button" class="btn btn--outline" id="review-cancel">انصراف</button>
          <button type="button" class="btn btn--primary" id="review-submit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            ثبت نظر
          </button>
        </div>
      </div>
    ` : '';

    const guestNotice = !user ? `
      <div class="product-review-form__notice">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span>برای ثبت نظر ابتدا <a href="auth/login.html">وارد حساب کاربری</a> شوید.</span>
      </div>
    ` : '';

    const alreadyReviewed = user && existingReview ? `
      <div class="product-review-form__notice product-review-form__notice--success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><polyline points="20 6 9 17 4 12"/></svg>
        <span>شما قبلاً برای این محصول نظر ثبت کرده‌اید.</span>
      </div>
    ` : '';

    let reviewsHTML = '';
    if (!reviews.length) {
      reviewsHTML = `
        <div class="product-reviews-empty">
          <div class="product-reviews-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h4>هنوز نظری ثبت نشده</h4>
          <p>اولین نفری باشید که نظر خود را ثبت می‌کنید.</p>
        </div>
      `;
    } else {
      reviewsHTML = reviews.map((r) => `
        <div class="product-review">
          <div class="product-review__head">
            <span class="product-review__avatar" style="background:${r.avatarColor}">${r.initials}</span>
            <div class="product-review__info">
              <span class="product-review__name">${r.userName}</span>
              <span class="product-review__date">${r.dateFa}</span>
            </div>
            <span class="product-review__stars">
              ${Array.from({ length: 5 }).map((_, i) => (i < r.rating ? ICONS.star : '')).join('')}
            </span>
            ${r.verified ? `<span class="product-review__verified">${ICONS.check} خرید تأیید‌شده</span>` : ''}
          </div>
          <p class="product-review__body">${r.comment}</p>
        </div>
      `).join('');
    }

    content.innerHTML = `
      ${statsHTML}
      ${formHTML}
      ${guestNotice}
      ${alreadyReviewed}
      <div class="product-reviews-list" id="reviews-list">
        ${reviewsHTML}
      </div>
    `;

    bindReviewForm(p, existingReview);
  }
}

/* ============================================
   BIND REVIEW FORM
   ============================================ */

function bindReviewForm(product, existingReview) {
  const addBtn = document.getElementById('add-review-btn');
  const form = document.getElementById('review-form');
  const cancelBtn = document.getElementById('review-cancel');
  const submitBtn = document.getElementById('review-submit');
  const ratingWrap = document.getElementById('review-rating');
  const ratingValue = document.getElementById('rating-value');
  const commentEl = document.getElementById('review-comment');
  const counterEl = document.getElementById('review-counter');

  if (!addBtn || !form) return;

  let selectedRating = 5;

  addBtn.addEventListener('click', () => {
    form.hidden = false;
    addBtn.style.display = 'none';
    commentEl?.focus();
  });

  cancelBtn?.addEventListener('click', () => {
    form.hidden = true;
    addBtn.style.display = '';
    if (commentEl) commentEl.value = '';
    if (counterEl) counterEl.textContent = '۰';
    selectedRating = 5;
    updateStars(5);
  });

  function updateStars(value) {
    ratingWrap?.querySelectorAll('.product-review-form__star').forEach((btn) => {
      const rating = Number(btn.dataset.rating);
      btn.classList.toggle('is-active', rating <= value);
    });
    if (ratingValue) {
      const fa = ['۰', '۱', '۲', '۳', '۴', '۵'];
      ratingValue.textContent = `${fa[value]} از ۵`;
    }
  }

  ratingWrap?.querySelectorAll('.product-review-form__star').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedRating = Number(btn.dataset.rating);
      updateStars(selectedRating);
    });
    btn.addEventListener('mouseenter', () => {
      const hovValue = Number(btn.dataset.rating);
      updateStars(hovValue);
    });
  });

  ratingWrap?.addEventListener('mouseleave', () => {
    updateStars(selectedRating);
  });

  updateStars(5);

  commentEl?.addEventListener('input', () => {
    if (counterEl) {
      counterEl.textContent = commentEl.value.length.toLocaleString('fa-IR');
    }
  });

  submitBtn?.addEventListener('click', async () => {
    const comment = commentEl?.value.trim() || '';

    if (!comment || comment.length < 10) {
      toast({
        type: 'error',
        title: 'متن نظر کوتاه است',
        message: 'حداقل ۱۰ کاراکتر بنویسید',
        duration: 3000,
      });
      commentEl?.focus();
      return;
    }

    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;animation:rotateSlow 0.8s linear infinite;">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      در حال ارسال...
    `;

    const result = await addReview({
      productId: product.id,
      rating: selectedRating,
      comment,
    });

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;

    if (result.error) {
      toast({
        type: 'error',
        title: 'خطا',
        message: result.error.message,
        duration: 3500,
      });
      return;
    }

    toast({
      type: 'success',
      title: 'نظر شما ثبت شد',
      message: 'ممنون از وقتی که گذاشتید ❤️',
      duration: 3000,
    });

    setTimeout(() => {
      renderTabContent(product, 'reviews');
    }, 500);
  });
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

  const v = p.variants[currentVariantIndex] || p.variants[0];

  setPageMeta({
    title: `${p.name} | خرید با بهترین قیمت | موبایل استور`,
    description: `خرید ${p.name} با ضمانت اصالت، گارانتی رسمی و ارسال سریع. قیمت از ${formatPrice(v.price)} تومان.`,
    image: p.image,
    url: `${SITE_URL}/product.html?id=${p.id}`,
    type: 'product',
  });

  injectProductSchema(p, v.price);

  renderBreadcrumb(p);
  renderGallery(p);
  renderInfo(p);
  renderTabs(p);
  renderSimilar(p);
}