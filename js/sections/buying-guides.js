/* ============================================
   BUYING GUIDES SECTION
   ============================================ */

const ICONS = {
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
};

const guides = [
  {
    id: 'guide-iphone',
    variant: 'apple',
    tag: 'راهنمای خرید',
    title: 'راهنمای خرید آیفون؛ کدام مدل برای شما مناسب است؟',
    desc: 'مقایسه کامل مدل‌های آیفون ۱۵ تا ۱۷ پرو از نظر دوربین، باتری و قیمت — برای انتخابی مطمئن.',
    readTime: '۸ دقیقه',
    href: '/guides/iphone-buying-guide',
    image: null,
  },
  {
    id: 'guide-samsung',
    variant: 'samsung',
    tag: 'مقایسه',
    title: 'بهترین گوشی‌های سامسونگ در سال ۲۰۲۶',
    desc: 'از سری گلکسی S تا Z — بررسی دقیق پرچمداران سامسونگ و انتخاب بهترین گزینه برای شما.',
    readTime: '۱۰ دقیقه',
    href: '/guides/best-samsung-2026',
    image: null,
  },
  {
    id: 'guide-budget',
    variant: 'budget',
    tag: 'اقتصادی',
    title: 'بهترین گوشی‌های اقتصادی زیر بودجه شما',
    desc: 'اگر به‌دنبال گوشی با قیمت مناسب و کیفیت بالا هستید، این ۷ مدل را از دست ندهید.',
    readTime: '۶ دقیقه',
    href: '/guides/best-budget-phones',
    image: null,
  },
];

function renderGuideCard(g) {
  const imageHTML = g.image
    ? `<img src="${g.image}" alt="${g.title}" loading="lazy" />`
    : `<div class="ph">تصویر مقاله</div>`;

  return `
    <a href="${g.href}" class="guide-card guide-card--${g.variant}">
      <div class="guide-card__media">
        ${imageHTML}
        <span class="guide-card__tag">
          <span class="guide-card__tag-dot"></span>
          ${g.tag}
        </span>
      </div>

      <div class="guide-card__body">
        <h3 class="guide-card__title">${g.title}</h3>
        <p class="guide-card__desc">${g.desc}</p>

        <div class="guide-card__meta">
          <span class="guide-card__read">
            ادامه مطلب
            ${ICONS.arrow}
          </span>
          <span class="guide-card__time">
            ${ICONS.clock}
            ${g.readTime}
          </span>
        </div>
      </div>
    </a>
  `;
}

export function initBuyingGuides() {
  const grid = document.getElementById('buying-guides-grid');
  if (!grid) return;
  grid.innerHTML = guides.map(renderGuideCard).join('');
}