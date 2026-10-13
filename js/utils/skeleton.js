/* ============================================
   SKELETON LOADING SYSTEM — Phase A.2
   Smart contextual skeletons for every page
   ============================================ */

/* ============================================
   1. BASE BUILDERS
   ============================================ */

export function skeletonText(width = 'w-100', extraClass = '') {
  return `<span class="skeleton skeleton--text skeleton--${width} ${extraClass}"></span>`;
}

export function skeletonBox(height, width = 'w-100', extraClass = '') {
  return `<div class="skeleton skeleton--rect skeleton--${width} ${extraClass}" style="height: ${height}px;"></div>`;
}

/* ============================================
   2. PRODUCT CARD
   ============================================ */

export function createProductSkeleton() {
  return `
    <div class="skeleton-product-card">
      <div class="skeleton-product-card__media">
        <div class="skeleton skeleton-product-card__img"></div>
      </div>
      <div class="skeleton-product-card__body">
        <div class="skeleton skeleton-product-card__brand"></div>
        <div class="skeleton skeleton-product-card__title"></div>
        <div class="skeleton skeleton-product-card__title skeleton-product-card__title--short"></div>
        <div class="skeleton-product-card__storages">
          <div class="skeleton skeleton-product-card__storage"></div>
          <div class="skeleton skeleton-product-card__storage"></div>
          <div class="skeleton skeleton-product-card__storage"></div>
        </div>
        <div class="skeleton skeleton-product-card__rating"></div>
        <div class="skeleton-product-card__divider"></div>
        <div class="skeleton skeleton-product-card__price"></div>
        <div class="skeleton skeleton-product-card__cta"></div>
      </div>
    </div>
  `;
}

/* ============================================
   3. FLASH CARD
   ============================================ */

export function createFlashSkeleton() {
  return `
    <div class="skeleton-flash-card">
      <div class="skeleton-flash-card__media">
        <div class="skeleton skeleton-flash-card__badge"></div>
        <div class="skeleton skeleton-flash-card__img"></div>
      </div>
      <div class="skeleton-flash-card__body">
        <div class="skeleton skeleton-flash-card__brand"></div>
        <div class="skeleton skeleton-flash-card__title"></div>
        <div class="skeleton skeleton-flash-card__price"></div>
        <div class="skeleton skeleton-flash-card__progress"></div>
        <div class="skeleton skeleton-flash-card__cta"></div>
      </div>
    </div>
  `;
}

/* ============================================
   4. CATEGORY CARD
   ============================================ */

export function createCategorySkeleton() {
  return `
    <div class="skeleton-category-card">
      <div class="skeleton skeleton-category-card__icon"></div>
      <div class="skeleton skeleton-category-card__title"></div>
      <div class="skeleton skeleton-category-card__count"></div>
    </div>
  `;
}

/* ============================================
   5. ARTICLE CARD
   ============================================ */

export function createArticleSkeleton() {
  return `
    <div class="skeleton-article-card">
      <div class="skeleton skeleton-article-card__media"></div>
      <div class="skeleton-article-card__body">
        <div class="skeleton skeleton-article-card__title"></div>
        <div class="skeleton skeleton-article-card__title skeleton-article-card__title--short"></div>
        <div class="skeleton skeleton-article-card__desc"></div>
        <div class="skeleton skeleton-article-card__desc skeleton-article-card__desc--short"></div>
        <div class="skeleton-article-card__meta">
          <div class="skeleton skeleton-article-card__meta-item"></div>
          <div class="skeleton skeleton-article-card__meta-item"></div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   6. ORDER CARD
   ============================================ */

export function createOrderSkeleton() {
  return `
    <div class="skeleton-order-card">
      <div class="skeleton-order-card__head">
        <div class="skeleton skeleton-order-card__num"></div>
        <div class="skeleton skeleton-order-card__status"></div>
      </div>
      <div class="skeleton-order-card__body">
        <div class="skeleton skeleton-order-card__thumb"></div>
        <div class="skeleton-order-card__info">
          <div class="skeleton skeleton-order-card__name"></div>
          <div class="skeleton skeleton-order-card__meta"></div>
        </div>
      </div>
      <div class="skeleton-order-card__foot">
        <div class="skeleton skeleton-order-card__total"></div>
        <div class="skeleton skeleton-order-card__btn"></div>
      </div>
    </div>
  `;
}

/* ============================================
   7. REVIEW CARD
   ============================================ */

export function createReviewSkeleton() {
  return `
    <div class="skeleton-review">
      <div class="skeleton-review__head">
        <div class="skeleton skeleton-review__avatar"></div>
        <div class="skeleton-review__info">
          <div class="skeleton skeleton-review__name"></div>
          <div class="skeleton skeleton-review__date"></div>
        </div>
        <div class="skeleton skeleton-review__stars"></div>
      </div>
      <div class="skeleton skeleton-review__body"></div>
      <div class="skeleton skeleton-review__body skeleton-review__body--short"></div>
    </div>
  `;
}

/* ============================================
   8. PRODUCT DETAIL SKELETON
   ============================================ */

export function createProductDetailSkeleton() {
  return `
    <div class="skeleton-product-detail">
      <div class="skeleton-product-detail__gallery">
        <div class="skeleton skeleton-product-detail__main-img"></div>
        <div class="skeleton-product-detail__thumbs">
          <div class="skeleton skeleton-product-detail__thumb"></div>
          <div class="skeleton skeleton-product-detail__thumb"></div>
          <div class="skeleton skeleton-product-detail__thumb"></div>
          <div class="skeleton skeleton-product-detail__thumb"></div>
          <div class="skeleton skeleton-product-detail__thumb"></div>
        </div>
      </div>
      <div class="skeleton-product-detail__info">
        <div class="skeleton skeleton-product-detail__brand"></div>
        <div class="skeleton skeleton-product-detail__title"></div>
        <div class="skeleton skeleton-product-detail__model"></div>
        <div class="skeleton-product-detail__colors">
          <div class="skeleton skeleton-product-detail__color"></div>
          <div class="skeleton skeleton-product-detail__color"></div>
          <div class="skeleton skeleton-product-detail__color"></div>
        </div>
        <div class="skeleton-product-detail__storages">
          <div class="skeleton skeleton-product-detail__storage"></div>
          <div class="skeleton skeleton-product-detail__storage"></div>
          <div class="skeleton skeleton-product-detail__storage"></div>
        </div>
        <div class="skeleton skeleton-product-detail__price-box"></div>
        <div class="skeleton skeleton-product-detail__cta"></div>
      </div>
    </div>
  `;
}

/* ============================================
   9. SECTION HEAD SKELETON
   ============================================ */

export function createSectionHeadSkeleton() {
  return `
    <div class="skeleton-section-head">
      <div class="skeleton skeleton-section-head__title"></div>
      <div class="skeleton skeleton-section-head__link"></div>
    </div>
  `;
}

/* ============================================
   10. GENERIC SHOW / HIDE WITH FADE
   ============================================ */

/**
 * نمایش skeleton در container
 */
export function showSkeleton(container, builder, count = 4, wrapperClass = '') {
  if (!container) return;

  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!el) return;

  const html = Array.from({ length: count })
    .map(() => builder())
    .join('');

  if (wrapperClass) {
    el.innerHTML = `<div class="${wrapperClass}">${html}</div>`;
  } else {
    el.innerHTML = html;
  }
}

/**
 * جایگزینی skeleton با محتوای واقعی + انیمیشن fade
 */
export function replaceSkeleton(container, realHTML) {
  if (!container) return;

  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!el) return;

  // Add fade out to skeleton
  el.classList.add('skeleton-fade-out');

  setTimeout(() => {
    el.classList.remove('skeleton-fade-out');
    el.innerHTML = realHTML;
    el.classList.add('fade-in-content');

    setTimeout(() => {
      el.classList.remove('fade-in-content');
    }, 500);
  }, 300);
}

/* ============================================
   11. AUTO-DETECT & SKELETON
   ============================================ */

/**
 * به صورت خودکار container های شناخته‌شده رو قبل از رندر پر می‌کنه
 */
export function autoSkeleton() {
  const targets = [
    // Home page
    { sel: '#best-deals-grid', builder: createProductSkeleton, count: 5, cols: 'repeat(5, 1fr)' },
    { sel: '#flash-sale-grid', builder: createFlashSkeleton, count: 4, cols: 'repeat(4, 1fr)' },
    { sel: '#trending-grid', builder: createProductSkeleton, count: 8, cols: 'repeat(4, 1fr)' },
    { sel: '#buying-guides-grid', builder: createArticleSkeleton, count: 3, cols: 'repeat(3, 1fr)' },
    { sel: '#shop-by-brand-grid', builder: createCategorySkeleton, count: 10, cols: 'repeat(5, 1fr)' },
    { sel: '#magazine-grid', builder: createArticleSkeleton, count: 3, cols: 'repeat(3, 1fr)' },
    { sel: '#reviews-grid', builder: createReviewSkeleton, count: 6, cols: 'repeat(3, 1fr)' },

    // Category / Brand / Search
    { sel: '#category-grid', builder: createProductSkeleton, count: 9, cols: 'repeat(3, 1fr)' },
    { sel: '#brand-grid', builder: createProductSkeleton, count: 8, cols: 'repeat(4, 1fr)' },
    { sel: '#search-grid', builder: createProductSkeleton, count: 12, cols: 'repeat(4, 1fr)' },
    { sel: '#suggested-grid', builder: createProductSkeleton, count: 8, cols: 'repeat(4, 1fr)' },

    // Orders
    { sel: '#orders-list', builder: createOrderSkeleton, count: 4, cols: null },

    // Product detail (special case)
    { sel: '#product-page', builder: createProductDetailSkeleton, count: 1, cols: null, onlyIfEmpty: true },
  ];

  targets.forEach(({ sel, builder, count, cols, onlyIfEmpty }) => {
    const el = document.querySelector(sel);
    if (!el) return;

    // اگه محتوا داره و onlyIfEmpty، کاری نکن
    if (onlyIfEmpty && el.innerHTML.trim()) return;

    // اگه قبلاً skeleton داره
    if (el.querySelector('.skeleton')) return;

    const html = Array.from({ length: count })
      .map(() => builder())
      .join('');

    if (cols) {
      el.innerHTML = `<div style="display:grid; grid-template-columns: ${cols}; gap: 20px; width: 100%;">${html}</div>`;
    } else {
      el.innerHTML = html;
    }
  });
}

/* ============================================
   12. BACKWARD COMPAT
   ============================================ */

// برای سازگاری با کد قبلی
export function createCardSkeleton() {
  return createProductSkeleton();
}

export function initSkeletons() {
  autoSkeleton();
}

/* ============================================
   13. LOG
   ============================================ */

console.log('%c✓ Skeleton system ready (Phase A.2)', 'color:#18B981;font-weight:bold;');