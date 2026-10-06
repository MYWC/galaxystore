/* ============================================
   SUCCESS PAGE
   ============================================ */

import { initLayout } from '../components/layout.js';
import { products, formatPrice } from '../data/products.js';
import { renderProductCard } from '../components/product-card.js';
import { toast } from '../components/toast.js';

/* ============================================
   INIT LAYOUT
   ============================================ */

initLayout();

/* ============================================
   HELPERS
   ============================================ */

function getOrderFromStorage(orderNumber) {
  try {
    const orders = JSON.parse(localStorage.getItem('ms_orders') || '[]');
    if (orderNumber) {
      return orders.find((o) => o.orderNumber === orderNumber) || orders[0];
    }
    return orders[0];
  } catch {
    return null;
  }
}

function getOrderNumberFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('order');
}

/* ============================================
   ORDER ITEMS
   ============================================ */

function renderItems(order) {
  const wrap = document.getElementById('success-items');
  if (!wrap || !order?.items?.length) return;

  wrap.innerHTML = order.items.map((item) => {
    const productId = item.id.split('-').slice(0, -1).join('-');
    const imgSrc = item.image || `assets/images/products/${productId}.jpg`;

    const specs = [item.storage, item.ram, item.color].filter(Boolean).join(' • ');

    return `
      <div class="success-item">
        <div class="success-item__img">
          <img src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'ph ph--square\\'>تصویر</div>';" />
          <span class="success-item__qty">${item.qty}</span>
        </div>
        <div class="success-item__info">
          <span class="success-item__brand">${item.brand || ''}</span>
          <span class="success-item__name">${item.name}</span>
          ${specs ? `<span class="success-item__specs">${specs}</span>` : ''}
        </div>
        <span class="success-item__price">
          ${formatPrice(item.price * item.qty)} تومان
        </span>
      </div>
    `;
  }).join('');
}

/* ============================================
   ORDER INFO
   ============================================ */

function renderInfo(order) {
  if (!order) return;

  // Receiver
  const receiver = document.getElementById('info-receiver');
  if (receiver) {
    receiver.textContent = `${order.customer.firstName} ${order.customer.lastName}`;
  }

  // Phone
  const phone = document.getElementById('info-phone');
  if (phone) {
    phone.textContent = order.customer.phone || '—';
  }

  const phoneShort = document.getElementById('info-phone-short');
  if (phoneShort) {
    phoneShort.textContent = order.customer.phone || 'شما';
  }

  // Address
  const address = document.getElementById('info-address');
  if (address) {
    const parts = [
      order.shipping.province,
      order.shipping.city,
      order.shipping.address,
      order.shipping.plateNumber,
    ].filter(Boolean);

    address.textContent = parts.join('، ');
  }

  // Shipping method
  const shippingLabels = {
    express: 'ارسال سریع (پست پیشتاز)',
    normal: 'ارسال عادی (پست سفارشی)',
    sameDay: 'ارسال همان روز',
  };
  const shippingEl = document.getElementById('info-shipping');
  if (shippingEl) {
    shippingEl.textContent = shippingLabels[order.shipping.method] || '—';
  }

  // Payment method
  const paymentLabels = {
    online: 'پرداخت آنلاین',
    cod: 'پرداخت در محل',
    wallet: 'کیف پول موبایل استور',
  };
  const paymentEl = document.getElementById('info-payment');
  if (paymentEl) {
    paymentEl.textContent = paymentLabels[order.payment] || '—';
  }

  // Total
  const totalEl = document.getElementById('info-total');
  if (totalEl) {
    totalEl.textContent = formatPrice(order.total);
  }
}

/* ============================================
   ORDER CODE
   ============================================ */

function renderOrderCode(order) {
  const codeEl = document.getElementById('order-code-text');
  const codeBtn = document.getElementById('order-code');
  if (!codeEl || !order) return;

  codeEl.textContent = order.orderNumber;

  // Copy on click
  if (codeBtn) {
    codeBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(order.orderNumber);
        codeBtn.classList.add('is-copied');
        toast({
          type: 'success',
          title: 'کپی شد!',
          message: `شماره سفارش: ${order.orderNumber}`,
          duration: 2000,
        });
        setTimeout(() => codeBtn.classList.remove('is-copied'), 2000);
      } catch {
        toast({
          type: 'info',
          title: 'شماره سفارش',
          message: order.orderNumber,
          duration: 3000,
        });
      }
    });
  }
}

/* ============================================
   RECOMMENDED
   ============================================ */

function renderRecommended(order) {
  const wrap = document.getElementById('success-recommended');
  const grid = document.getElementById('recommended-grid');
  if (!wrap || !grid) return;

  const orderProductIds = (order?.items || []).map((i) =>
    i.id.split('-').slice(0, -1).join('-')
  );

  const recommended = products
    .filter((p) => !orderProductIds.includes(p.id))
    .filter((p) => p.rating >= 4.6)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  if (recommended.length < 2) {
    wrap.hidden = true;
    return;
  }

  wrap.hidden = false;
  grid.innerHTML = recommended.map(renderProductCard).join('');
}

/* ============================================
   CONFETTI ANIMATION
   ============================================ */

function launchConfetti() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const wrap = document.getElementById('confetti');
  if (!wrap) return;

  const colors = ['#18B981', '#2386D7', '#16B5A5', '#F59E0B', '#7C5CFF', '#EF5350'];
  const count = 40;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 1.5}s`;
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${6 + Math.random() * 8}px`;

    wrap.appendChild(piece);

    setTimeout(() => piece.remove(), 5000);
  }
}

/* ============================================
   GLOBAL CLICK (Recommended cards)
   ============================================ */

document.addEventListener('click', (e) => {
  const wish = e.target.closest('.p-card [data-wishlist]');
  if (wish) {
    e.preventDefault();
    // Wishlist از layout.js مدیریت میشود
    return;
  }

  const add = e.target.closest('.p-card [data-add-to-cart]');
  if (add) {
    // از layout.js مدیریت میشود
    return;
  }
});

/* ============================================
   INIT
   ============================================ */

function init() {
  const orderNumber = getOrderNumberFromUrl();
  const order = getOrderFromStorage(orderNumber);

  if (!order) {
    // هیچ سفارشی پیدا نشد
    const main = document.getElementById('success-page');
    if (main) {
      main.innerHTML = `
        <div class="container" style="padding: 80px 20px; text-align: center;">
          <div style="width:96px; height:96px; border-radius:28px; background:var(--bg-soft); display:flex; align-items:center; justify-content:center; margin: 0 auto 24px; color: var(--text-muted);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:44px; height:44px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 style="font-size:24px; margin-bottom:12px; font-weight:700;">سفارشی یافت نشد</h2>
          <p style="color:var(--text-muted); margin-bottom:24px; max-width: 400px; margin-inline: auto; line-height:1.8;">
            متأسفانه اطلاعاتی از سفارش شما پیدا نکردیم. لطفاً با پشتیبانی تماس بگیرید.
          </p>
          <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
            <a href="index.html" class="btn btn--primary">بازگشت به خانه</a>
            <a href="support/contact.html" class="btn btn--outline">تماس با پشتیبانی</a>
          </div>
        </div>
      `;
    }
    return;
  }

  // Update page title
  document.title = `سفارش ${order.orderNumber} ثبت شد | موبایل استور`;

  // Render
  renderOrderCode(order);
  renderItems(order);
  renderInfo(order);
  renderRecommended(order);

  // Confetti
  setTimeout(launchConfetti, 300);

  console.log(
    `%c✓ Order ${order.orderNumber} confirmed`,
    'color:#18B981;font-weight:bold;'
  );
}

init();