/* ============================================
   COMPARE PAGE
   ============================================ */

import { initLayout } from '../components/layout.js';
import { products, formatPrice } from '../data/products.js';
import { cart, compare, wishlist, onChange, KEYS } from '../store/state.js';
import { toast } from '../components/toast.js';
import { openCart } from '../components/cart-drawer.js';
import { flyToCart } from '../utils/micro.js';

/* ============================================
   INIT LAYOUT
   ============================================ */
initLayout();

/* ============================================
   ICONS
   ============================================ */

const ICONS = {
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  star: `<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
};

/* ============================================
   HELPERS
   ============================================ */

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
  };
  return colorMap[colorName.toLowerCase().trim()] || '#95A5A6';
}

function renderStars(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 })
    .map((_, i) => (i < full ? ICONS.star : ''))
    .join('');
}

function minPrice(p) {
  if (!p.variants?.length) return Infinity;
  return Math.min(...p.variants.map((v) => v.price));
}

function maxDiscount(p) {
  if (!p.variants?.length) return 0;
  let max = 0;
  p.variants.forEach((v) => {
    if (v.oldPrice && v.oldPrice > v.price) {
      const d = Math.round(((v.oldPrice - v.price) / v.oldPrice) * 100);
      if (d > max) max = d;
    }
  });
  return max;
}

function totalStock(p) {
  if (!p.variants?.length) return 0;
  return p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
}

/* ============================================
   GET COMPARE PRODUCTS
   ============================================ */

function getCompareProducts() {
  const items = compare.get();
  return items
    .map((item) => products.find((p) => p.id === item.id))
    .filter(Boolean);
}

/* ============================================
   CALCULATE BEST (highlight)
   ============================================ */

function getBest(products) {
  if (!products.length) return {};

  return {
    price: products.reduce((best, p) =>
      minPrice(p) < minPrice(best) ? p : best
    ).id,
    rating: products.reduce((best, p) =>
      (p.rating || 0) > (best.rating || 0) ? p : best
    ).id,
    discount: products.reduce((best, p) =>
      maxDiscount(p) > maxDiscount(best) ? p : best
    ).id,
    stock: products.reduce((best, p) =>
      totalStock(p) > totalStock(best) ? p : best
    ).id,
  };
}

/* ============================================
   RENDER EMPTY
   ============================================ */

function renderEmpty() {
  const empty = document.getElementById('compare-empty');
  const wrapper = document.getElementById('compare-wrapper');
  const addMore = document.getElementById('compare-add-more');
  const clearBtn = document.getElementById('clear-compare');
  const subtitle = document.getElementById('compare-subtitle');

  if (empty) empty.hidden = false;
  if (wrapper) wrapper.hidden = true;
  if (addMore) addMore.hidden = true;
  if (clearBtn) clearBtn.hidden = true;
  if (subtitle) subtitle.textContent = 'محصولات انتخابی خود را کنار هم مقایسه کنید';
}

/* ============================================
   RENDER TABLE
   ============================================ */

function renderTable(compareProducts) {
  const table = document.getElementById('compare-table');
  const empty = document.getElementById('compare-empty');
  const wrapper = document.getElementById('compare-wrapper');
  const addMore = document.getElementById('compare-add-more');
  const clearBtn = document.getElementById('clear-compare');
  const subtitle = document.getElementById('compare-subtitle');

  if (!table) return;

  if (!compareProducts.length) {
    renderEmpty();
    return;
  }

  if (empty) empty.hidden = true;
  if (wrapper) wrapper.hidden = false;
  if (addMore) addMore.hidden = compareProducts.length >= 4;
  if (clearBtn) clearBtn.hidden = false;
  if (subtitle) {
    subtitle.textContent = `${compareProducts.length.toLocaleString('fa-IR')} محصول در حال مقایسه`;
  }

  const best = getBest(compareProducts);

  /* ---------- Header ---------- */
  const headerHTML = `
    <thead>
      <tr>
        <th>
          <span class="compare-label">مشخصات</span>
        </th>
        ${compareProducts.map((p) => {
          const imgSrc = p.image || `assets/images/products/${p.id}.jpg`;
          return `
            <th>
              <div class="compare-col">
                <button class="compare-col__remove" data-remove-compare="${p.id}" aria-label="حذف از مقایسه">
                  ${ICONS.close}
                </button>
                <div class="compare-col__img">
                  <img src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'ph ph--square\\'>تصویر</div>';" />
                </div>
                <div class="compare-col__brand">${p.brand}</div>
                <div class="compare-col__name">
                  <a href="product.html?id=${p.id}">${p.name}</a>
                </div>
              </div>
            </th>
          `;
        }).join('')}
      </tr>
    </thead>
  `;

  /* ---------- Row 1: Price ---------- */
  const priceRow = `
    <tr>
      <td>قیمت</td>
      ${compareProducts.map((p) => {
        const v = [...p.variants].sort((a, b) => a.price - b.price)[0];
        const isBest = best.price === p.id;
        return `
          <td>
            <div class="compare-price">
              ${isBest ? '<div class="compare-best">کم‌ترین</div>' : ''}
              <div class="compare-price__current">
                ${formatPrice(v.price)}
                <span>تومان</span>
              </div>
              ${v.oldPrice ? `<div class="compare-price__old">${formatPrice(v.oldPrice)}</div>` : ''}
            </div>
          </td>
        `;
      }).join('')}
    </tr>
  `;

  /* ---------- Row 2: Rating ---------- */
  const ratingRow = `
    <tr>
      <td>امتیاز کاربران</td>
      ${compareProducts.map((p) => {
        const isBest = best.rating === p.id;
        return `
          <td>
            ${isBest ? '<div class="compare-best">بالاترین</div>' : ''}
            <div class="compare-rating">
              ${renderStars(p.rating)}
              <span>${p.rating.toFixed(1)}</span>
            </div>
          </td>
        `;
      }).join('')}
    </tr>
  `;

  /* ---------- Row 3: Discount ---------- */
  const discountRow = `
    <tr>
      <td>تخفیف</td>
      ${compareProducts.map((p) => {
        const d = maxDiscount(p);
        const isBest = best.discount === p.id && d > 0;
        return `
          <td>
            ${isBest ? '<div class="compare-best">بیشترین</div>' : ''}
            ${d > 0
              ? `<span class="badge badge--discount">٪${d} تخفیف</span>`
              : '<span class="compare-badge">بدون تخفیف</span>'}
          </td>
        `;
      }).join('')}
    </tr>
  `;

  /* ---------- Row 4: Stock ---------- */
  const stockRow = `
    <tr>
      <td>موجودی</td>
      ${compareProducts.map((p) => {
        const stock = totalStock(p);
        const isBest = best.stock === p.id && stock > 0;

        let className = 'compare-stock';
        let label = 'موجود';

        if (stock === 0) {
          className += ' compare-stock--out';
          label = 'ناموجود';
        } else if (stock <= 10) {
          className += ' compare-stock--low';
          label = `فقط ${stock} عدد`;
        } else {
          label = `${stock} عدد موجود`;
        }

        return `
          <td>
            ${isBest ? '<div class="compare-best">بیشترین</div>' : ''}
            <span class="${className}">
              ${stock > 0 ? ICONS.check : ''}
              ${label}
            </span>
          </td>
        `;
      }).join('')}
    </tr>
  `;

  /* ---------- Row 5: Storage Variants ---------- */
  const storageRow = `
    <tr>
      <td>حافظه‌ها</td>
      ${compareProducts.map((p) => `
        <td>
          <div class="compare-colors">
            ${p.variants.map((v) => `
              <span class="compare-badge">${v.storage}</span>
            `).join('')}
          </div>
        </td>
      `).join('')}
    </tr>
  `;

  /* ---------- Row 6: RAM ---------- */
  const ramRow = `
    <tr>
      <td>رم</td>
      ${compareProducts.map((p) => {
        const rams = [...new Set(p.variants.map((v) => v.ram))];
        return `
          <td>
            <div class="compare-colors">
              ${rams.map((r) => `<span class="compare-badge">${r}</span>`).join('')}
            </div>
          </td>
        `;
      }).join('')}
    </tr>
  `;

  /* ---------- Row 7: Year ---------- */
  const yearRow = `
    <tr>
      <td>سال معرفی</td>
      ${compareProducts.map((p) => `
        <td>${p.year ? p.year.toLocaleString('fa-IR') : '—'}</td>
      `).join('')}
    </tr>
  `;

  /* ---------- Row 8: Type ---------- */
  const typeRow = `
    <tr>
      <td>نوع</td>
      ${compareProducts.map((p) => `
        <td>${p.type === 'phone' ? 'گوشی موبایل' : 'تبلت'}</td>
      `).join('')}
    </tr>
  `;

  /* ---------- Row 9: Colors ---------- */
  const colorsRow = `
    <tr>
      <td>رنگ‌ها</td>
      ${compareProducts.map((p) => `
        <td>
          <div class="compare-colors">
            ${(p.colors || []).slice(0, 6).map((c) => `
              <span class="compare-color-dot" style="background:${colorToHex(c)};" title="${c}"></span>
            `).join('')}
            ${(p.colors || []).length > 6 ? `<span class="compare-badge">+${p.colors.length - 6}</span>` : ''}
          </div>
        </td>
      `).join('')}
    </tr>
  `;

  /* ---------- Row 10: Actions ---------- */
  const actionsRow = `
    <tr>
      <td>خرید</td>
      ${compareProducts.map((p) => {
        const v = [...p.variants].sort((a, b) => a.price - b.price)[0];
        const inStock = v.stock > 0;
        return `
          <td>
            <div class="compare-actions">
              <button class="compare-actions__cart" data-compare-add="${p.id}" ${!inStock ? 'disabled' : ''}>
                ${ICONS.cart}
                افزودن به سبد
              </button>
            </div>
          </td>
        `;
      }).join('')}
    </tr>
  `;

  /* ---------- Assemble ---------- */
  table.innerHTML = `
    ${headerHTML}
    <tbody>
      ${priceRow}
      ${ratingRow}
      ${discountRow}
      ${stockRow}
      ${storageRow}
      ${ramRow}
      ${yearRow}
      ${typeRow}
      ${colorsRow}
      ${actionsRow}
    </tbody>
  `;
}

/* ============================================
   RENDER
   ============================================ */

function render() {
  const compareProducts = getCompareProducts();
  renderTable(compareProducts);
}

/* ============================================
   BIND EVENTS
   ============================================ */

function bindEvents() {
  /* ---------- Remove from compare ---------- */
  document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-remove-compare]');
    if (removeBtn) {
      const id = removeBtn.dataset.removeCompare;
      const product = products.find((p) => p.id === id);

      compare.toggle(product);

      toast({
        type: 'info',
        title: 'از مقایسه حذف شد',
        message: product?.name,
        duration: 2200,
      });

      render();
      return;
    }

    /* ---------- Add to cart from compare ---------- */
    const addBtn = e.target.closest('[data-compare-add]');
    if (addBtn && !addBtn.disabled) {
      const id = addBtn.dataset.compareAdd;
      const product = products.find((p) => p.id === id);
      if (!product) return;

      const v = [...product.variants].sort((a, b) => a.price - b.price)[0];

      cart.add({
        id: `${product.id}-${v.storage}`,
        brand: product.brand,
        name: product.name,
        ram: v.ram,
        storage: v.storage,
        price: v.price,
        oldPrice: v.oldPrice || null,
        image: product.image,
      }, 1);

      flyToCart(addBtn);

      const original = addBtn.innerHTML;
      addBtn.classList.add('is-added');
      addBtn.innerHTML = `${ICONS.check} اضافه شد`;

      toast({
        type: 'success',
        title: 'به سبد خرید اضافه شد',
        message: `${product.name} — ${v.storage}`,
      });

      setTimeout(() => {
        addBtn.classList.remove('is-added');
        addBtn.innerHTML = original;
      }, 1600);

      setTimeout(() => openCart(), 700);
      return;
    }

    /* ---------- Clear all ---------- */
    const clearBtn = e.target.closest('#clear-compare');
    if (clearBtn) {
      const items = [...compare.get()];
      items.forEach((item) => compare.toggle(item));
      render();

      toast({
        type: 'info',
        title: 'لیست مقایسه پاک شد',
        duration: 2200,
      });
      return;
    }
  });

  /* ---------- Listen to compare changes ---------- */
  onChange(KEYS.compare, render);
}

/* ============================================
   INIT
   ============================================ */

function init() {
  render();
  bindEvents();

  console.log('%c✓ Compare page loaded', 'color:#18B981;font-weight:bold;');
}

init();