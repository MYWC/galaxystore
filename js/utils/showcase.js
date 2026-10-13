/* ============================================
   SHOWCASE — Phase 5
   Hero Carousel + Featured + Award + Live Counters + Timeline
   ============================================ */

import { products, allProducts, formatPrice } from '../data/products.js';

/* ============================================
   1. HERO CAROUSEL
   ============================================ */

const CAROUSEL_SLIDES = [
  {
    id: 'iphone-17-pro-max',
    eyebrow: 'جدیدترین محصول اپل',
    title: 'آیفون 17 پرو مکس',
    titleAccent: 'قدرت بی‌نهایت',
    desc: 'تراشه A20، دوربین ۲۰۰ مگاپیکسل و باتری فوق‌العاده — تجربه‌ی نسل بعدی.',
    cta: 'مشاهده محصول',
    link: 'product.html?id=iphone-17-pro-max',
    gradient: 'linear-gradient(135deg, #0A0F15 0%, #1B2733 50%, #0A0F15 100%)',
  },
  {
    id: 'galaxy-s25-ultra',
    eyebrow: 'پرچمدار سامسونگ',
    title: 'گلکسی S25 اولترا',
    titleAccent: 'هوش مصنوعی نسل جدید',
    desc: 'با S Pen، نمایشگر Dynamic AMOLED و قلم هوشمند — انتخاب حرفه‌ای‌ها.',
    cta: 'مشاهده محصول',
    link: 'product.html?id=galaxy-s25-ultra',
    gradient: 'linear-gradient(135deg, #0A1520 0%, #1A2D42 50%, #0A1520 100%)',
  },
  {
    id: 'xiaomi-14',
    eyebrow: 'ارزش خرید بی‌نظیر',
    title: 'شیائومی 14',
    titleAccent: 'دوربین لایکا',
    desc: 'همکاری با Leica، تراشه Snapdragon 8 Gen 3 و شارژ ۹۰ واتی.',
    cta: 'مشاهده محصول',
    link: 'product.html?id=xiaomi-14',
    gradient: 'linear-gradient(135deg, #1A0F05 0%, #4A2D10 50%, #1A0F05 100%)',
  },
];

export function initHeroCarousel() {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;

  const container = heroSection.querySelector('.container');
  if (!container) return;

  // اگر از قبل ساخته شده
  if (container.querySelector('.hero-carousel')) return;

  // پاک کردن بنر ساده قبلی
  const oldBanner = container.querySelector('.hero__banner');
  if (oldBanner) oldBanner.remove();

  // ساخت کاروسل
  const carousel = document.createElement('div');
  carousel.className = 'hero-carousel';
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-label', 'اسلایدر ویژه');

  const basePath = window.MS_BASE_PATH || './';

  carousel.innerHTML = `
    ${CAROUSEL_SLIDES.map((slide, i) => `
      <div class="hero-carousel__slide ${i === 0 ? 'is-active' : ''}" data-slide="${i}">
        <div class="hero-carousel__bg" style="background: ${slide.gradient};"></div>
        <div class="hero-carousel__overlay"></div>
        <div class="hero-carousel__content">
          <span class="hero-carousel__eyebrow">
            <span class="hero-carousel__eyebrow-dot"></span>
            ${slide.eyebrow}
          </span>
          <h2 class="hero-carousel__title">
            ${slide.title}<br>
            <span class="hero-carousel__title-accent">${slide.titleAccent}</span>
          </h2>
          <p class="hero-carousel__desc">${slide.desc}</p>
          <div class="hero-carousel__actions">
            <a href="${basePath}${slide.link}" class="hero-carousel__btn hero-carousel__btn--primary">
              ${slide.cta}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </a>
            <a href="${basePath}category.html?filter=discount" class="hero-carousel__btn hero-carousel__btn--outline">
              مشاهده تخفیف‌ها
            </a>
          </div>
        </div>
      </div>
    `).join('')}

    <button class="hero-carousel__nav hero-carousel__nav--prev" aria-label="اسلاید قبلی">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    <button class="hero-carousel__nav hero-carousel__nav--next" aria-label="اسلاید بعدی">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>

    <div class="hero-carousel__dots" role="tablist">
      ${CAROUSEL_SLIDES.map((_, i) => `
        <button class="hero-carousel__dot ${i === 0 ? 'is-active' : ''}" data-dot="${i}" aria-label="اسلاید ${i + 1}"></button>
      `).join('')}
    </div>

    <div class="hero-carousel__progress">
      <div class="hero-carousel__progress-bar"></div>
    </div>
  `;

  container.appendChild(carousel);

  // State
  let currentIndex = 0;
  let autoTimer = null;
  const AUTO_DURATION = 6000;

  const slides = carousel.querySelectorAll('.hero-carousel__slide');
  const dots = carousel.querySelectorAll('.hero-carousel__dot');
  const progressBar = carousel.querySelector('.hero-carousel__progress-bar');

  const goTo = (index) => {
    currentIndex = (index + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length;

    slides.forEach((s, i) => s.classList.toggle('is-active', i === currentIndex));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === currentIndex));

    // reset progress
    if (progressBar) {
      progressBar.style.animation = 'none';
      // force reflow
      void progressBar.offsetWidth;
      progressBar.style.animation = '';
    }

    resetAuto();
  };

  const next = () => goTo(currentIndex + 1);
  const prev = () => goTo(currentIndex - 1);

  const resetAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, AUTO_DURATION);
  };

  carousel.querySelector('.hero-carousel__nav--next')?.addEventListener('click', next);
  carousel.querySelector('.hero-carousel__nav--prev')?.addEventListener('click', prev);

  dots.forEach((dot) => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.dot)));
  });

  // Pause on hover
  carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carousel.addEventListener('mouseleave', resetAuto);

  // Keyboard
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') prev();
    if (e.key === 'ArrowLeft') next();
  });

  // Touch swipe
  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) prev();
      else next();
    }
  });

  resetAuto();

  console.log('%c✓ Hero Carousel initialized', 'color:#18B981;font-weight:bold;');
}

/* ============================================
   2. AWARD BADGES
   ============================================ */

export function addAwardBadges() {
  // پیدا کردن کارت‌های موجود و اضافه کردن badge
  const awardMap = {
    'iphone-16-pro': { type: 'gold', label: 'بهترین انتخاب' },
    'galaxy-s25-ultra': { type: 'gold', label: 'پرفروش‌ترین' },
    'xiaomi-14': { type: 'silver', label: 'ارزش ویژه' },
    'pixel-9-pro': { type: 'silver', label: 'بهترین دوربین' },
    'iphone-17-pro-max': { type: 'gold', label: 'جدیدترین' },
    'galaxy-s24-ultra': { type: 'bronze', label: 'محبوب' },
  };

  const starIcon = '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>';

  const applyBadges = () => {
    document.querySelectorAll('.p-card').forEach((card) => {
      if (card.querySelector('.p-card__award')) return;

      const id = card.dataset.productId;
      const award = awardMap[id];
      if (!award) return;

      const media = card.querySelector('.p-card__media');
      if (!media) return;

      const badge = document.createElement('span');
      badge.className = `p-card__award${award.type !== 'gold' ? ` p-card__award--${award.type}` : ''}`;
      badge.innerHTML = `${starIcon} ${award.label}`;

      media.appendChild(badge);
    });
  };

  // اول
  setTimeout(applyBadges, 500);

  // MutationObserver
  const observer = new MutationObserver(applyBadges);
  observer.observe(document.body, { childList: true, subtree: true });
}

/* ============================================
   3. LIVE COUNTERS
   ============================================ */

const LIVE_STATS = [
  {
    icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    target: 50000,
    suffix: '+',
    label: 'مشتری راضی',
    live: true,
  },
  {
    icon: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    target: 2500,
    suffix: '+',
    label: 'مدل محصول',
  },
  {
    icon: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    target: 125430,
    suffix: '',
    label: 'سفارش موفق',
    live: true,
  },
  {
    icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    target: 98,
    suffix: '٪',
    label: 'رضایت مشتریان',
  },
];

export function initLiveCounters() {
  // پاک کردن قبلی
  document.querySelectorAll('.live-counters').forEach((el) => el.remove());

  // ساختن بخش
  const section = document.createElement('section');
  section.className = 'section live-counters-section';
  section.style.paddingBlock = '0';

  section.innerHTML = `
    <div class="container">
      <div class="live-counters">
        ${LIVE_STATS.map((s, i) => `
          <div class="live-counter" data-index="${i}">
            <div class="live-counter__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
            </div>
            <div class="live-counter__value">
              <span class="live-counter__number" data-target="${s.target}">۰</span>
              ${s.suffix ? `<span>${s.suffix}</span>` : ''}
            </div>
            <div class="live-counter__label">${s.label}</div>
            ${s.live ? `
              <span class="live-counter__pulse">
                <span class="live-counter__pulse-dot"></span>
                زنده
              </span>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // اضافه بعد از بخش reviews
  const reviews = document.getElementById('reviews');
  if (reviews && reviews.parentNode) {
    reviews.parentNode.insertBefore(section, reviews.nextSibling);
  } else {
    // اگر نبود، قبل از footer
    const footer = document.getElementById('layout-footer');
    if (footer) footer.parentNode.insertBefore(section, footer);
  }

  // انیمیشن اعداد
  const numbers = section.querySelectorAll('.live-counter__number');

  const animateNumber = (el) => {
    const target = Number(el.dataset.target);
    const duration = 2000;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = Math.floor(target * eased);
      el.textContent = value.toLocaleString('fa-IR');

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString('fa-IR');
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          numbers.forEach((n) => animateNumber(n));
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(section);

  // Live updates برای اعداد "زنده"
  setInterval(() => {
    const liveCounters = section.querySelectorAll('.live-counter');
    liveCounters.forEach((counter) => {
      const idx = Number(counter.dataset.index);
      const stat = LIVE_STATS[idx];
      if (!stat?.live) return;

      const numberEl = counter.querySelector('.live-counter__number');
      const current = Number(numberEl.dataset.current || stat.target);
      const increment = Math.floor(Math.random() * 3) + 1;
      const newVal = current + increment;

      numberEl.dataset.current = newVal;
      numberEl.textContent = newVal.toLocaleString('fa-IR');

      // flash effect
      numberEl.animate(
        [
          { color: 'var(--text)' },
          { color: '#6FE0CE' },
          { color: '#fff' },
        ],
        { duration: 700, easing: 'ease-out' }
      );
    });
  }, 4000);

  console.log('%c✓ Live Counters initialized', 'color:#18B981;font-weight:bold;');
}

/* ============================================
   4. FEATURED SHOWCASE
   ============================================ */

export function initFeaturedShowcase() {
  // چک کن اگر قبلاً ساخته شده
  if (document.querySelector('.featured-showcase')) return;

  // پیدا کردن محصولات ویژه
  const featured = products
    .filter((p) => p.rating >= 4.7)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  if (featured.length < 3) return;

  const section = document.createElement('section');
  section.className = 'featured-showcase';
  section.id = 'featured-showcase';

  const basePath = window.MS_BASE_PATH || './';

  section.innerHTML = `
    <div class="container">
      <div class="featured-showcase__head reveal">
        <span class="featured-showcase__eyebrow">
          <span class="featured-showcase__eyebrow-dot"></span>
          انتخاب سردبیر
        </span>
        <h2 class="featured-showcase__title">
          محصولات <span class="featured-showcase__title-accent">ویژه این ماه</span>
        </h2>
        <p class="featured-showcase__desc">
          بهترین انتخاب‌های ماه از نظر کاربران و تیم فنی — با بهترین قیمت و کیفیت.
        </p>
      </div>

      <div class="featured-showcase__grid stagger">
        ${featured.map((p) => {
          const imgSrc = p.image || `${basePath}assets/images/products/${p.id}.jpg`;
          const cheapest = [...(p.variants || [])].sort((a, b) => a.price - b.price)[0];
          if (!cheapest) return '';

          const stars = Array.from({ length: 5 }).map((_, i) =>
            i < Math.round(p.rating)
              ? `<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:#F59E0B;"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>`
              : ''
          ).join('');

          return `
            <a href="${basePath}product.html?id=${p.id}" class="featured-card" style="text-decoration:none;color:inherit;">
              <article class="p-card" data-product-id="${p.id}" data-active-variant="0" style="height:100%;">
                <div class="p-card__media">
                  <span class="p-card__award">
                    <svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>
                    انتخاب سردبیر
                  </span>
                  <div class="p-card__img">
                    <img src="${imgSrc}" alt="${p.name}" loading="lazy"
                         onerror="this.onerror=null;this.style.display='none';this.parentElement.innerHTML='<div class=\\'ph ph--square\\'>${(p.model || p.name).replace(/'/g, '')}</div>';" />
                  </div>
                </div>
                <div class="p-card__body">
                  <span class="p-card__brand">
                    <span class="p-card__brand-dot"></span>
                    ${p.brand}
                  </span>
                  <h3 class="p-card__title">${p.name}</h3>
                  <div class="p-card__rating">
                    <span class="p-card__stars">${stars}</span>
                    <span class="p-card__rating-value">${(p.rating || 0).toFixed(1)}</span>
                    <span>(${p.reviews || 0})</span>
                  </div>
                  <div class="p-card__divider"></div>
                  <div class="p-card__price">
                    <span class="p-card__price-current">
                      ${formatPrice(cheapest.price)}
                      <span>تومان</span>
                    </span>
                    ${cheapest.oldPrice ? `<span class="p-card__price-old">${formatPrice(cheapest.oldPrice)}</span>` : ''}
                  </div>
                  <div style="margin-top:12px;display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:var(--primary);">
                    مشاهده محصول
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  </div>
                </div>
              </article>
            </a>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // اضافه بعد از trending
  const trending = document.getElementById('trending');
  if (trending && trending.parentNode) {
    trending.parentNode.insertBefore(section, trending.nextSibling);
  } else {
    const main = document.querySelector('main');
    if (main) main.appendChild(section);
  }

  console.log('%c✓ Featured Showcase initialized', 'color:#18B981;font-weight:bold;');
}

/* ============================================
   5. INIT ALL
   ============================================ */

export function initShowcase() {
  const isHomePage = document.getElementById('hero') ||
                     document.querySelector('.best-deals') ||
                     document.querySelector('.trending');

  if (!isHomePage) {
    console.log('%c⚠️ Showcase skipped (not home page)', 'color:#F59E0B;font-weight:bold;');
    return;
  }

  initHeroCarousel();
  initLiveCounters();
  initFeaturedShowcase();
  addAwardBadges();

  console.log('%c✓ Showcase initialized (Phase 5)', 'color:#18B981;font-weight:bold;');
}