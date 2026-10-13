/* ============================================
   CINEMA — Phase 3
   Product Page Cinematic Experience
   ============================================ */

/* ============================================
   1. AMBIENT LIGHT
   ============================================ */

const COLOR_HEX = {
  'natural titanium': '#B8B5AE',
  'black titanium': '#2C2C2E',
  'white titanium': '#EDEDED',
  'desert titanium': '#C7B5A0',
  'titanium blue': '#4A6578',
  'titanium silverblue': '#7DA0BD',
  'titanium silver': '#B0B8BD',
  'titanium black': '#2A2A2E',
  'titanium gray': '#5A6067',
  'titanium whitesilver': '#DDE2E6',
  'titanium jetblack': '#1A1A1C',
  'titanium violet': '#7B6B94',
  'titanium yellow': '#D9C97C',
  'cosmic orange': '#D97E42',
  'deep blue': '#1B2D52',
  'silver': '#C0C0C0',
  'black': '#1A1A1A',
  'white': '#FAFAFA',
  'blue': '#3B5BA5',
  'navy': '#1E2A47',
  'green': '#3E5F3E',
  'mint': '#B8D9C9',
  'yellow': '#F4D35E',
  'pink': '#F4A9B5',
  'orange': '#E89B5C',
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
  'black eclipse': '#1E1E22',
  'arctic dawn': '#B8C5D0',
  'midnight ocean': '#1A2D42',
  'emerald dusk': '#2C4A45',
  'voyager black': '#1A1A1E',
  'titanium icyblue': '#A8C4DD',
  'black olive': '#3A3F35',
  'awesome graphite': '#4A4A4A',
  'awesome light gray': '#C8C8CC',
  'awesome olive': '#7B8062',
  'awesome pink': '#F0B8C4',
  'awesome black': '#1A1A1A',
  'awesome white': '#F5F5F5',
  'awesome lavender': '#C8B8E0',
  'awesome navy': '#1E2A47',
  'awesome mint': '#B8D9C9',
  'awesome blue': '#5B7DB5',
  'awesome gold': '#D4AF37',
  'titan silver': '#B0B8BD',
  'pink gold': '#E8C4B8',
  'sage green': '#A8BDA5',
  'moonlight white': '#EDEDED',
  'lunar gray': '#5A6067',
  'starlight': '#E8E2D5',
  'midnight': '#1A1A2E',
  'purple jade': '#9B7DB5',
  'vitamin c': '#F0A050',
};

function colorToHex(colorName) {
  if (!colorName) return '#2386D7';
  const key = colorName.toLowerCase().trim();
  return COLOR_HEX[key] || '#2386D7';
}

export function initAmbientLight() {
  const productPage = document.getElementById('product-page');
  if (!productPage) return;

  // ساخت DOM
  const ambient = document.createElement('div');
  ambient.className = 'ambient-light';
  ambient.innerHTML = `
    <span class="ambient-light__orb"></span>
    <span class="ambient-light__orb ambient-light__orb--2"></span>
  `;
  document.body.appendChild(ambient);

  // فعال شدن بعد از یه تأخیر
  setTimeout(() => ambient.classList.add('is-active'), 300);

  // گوش دادن به تغییر رنگ
  document.addEventListener('colorchange', (e) => {
    const hex = colorToHex(e.detail?.color);
    const hex2 = shiftHue(hex, 30);

    ambient.style.setProperty('--ambient-color', hex);
    ambient.style.setProperty('--ambient-color-2', hex2);
  });
}

function shiftHue(hex, degrees) {
  // تبدیل به HSL برای shift
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = (h + degrees / 360) % 1;
  return hslToHex(h, s, l);
}

function hslToHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;
  let r, g, b;

  if (h < 1/6) [r, g, b] = [c, x, 0];
  else if (h < 2/6) [r, g, b] = [x, c, 0];
  else if (h < 3/6) [r, g, b] = [0, c, x];
  else if (h < 4/6) [r, g, b] = [0, x, c];
  else if (h < 5/6) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v) => {
    const hex = Math.round((v + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/* ============================================
   2. CINEMA MODE TOGGLE
   ============================================ */

export function initCinemaMode() {
  const gallery = document.querySelector('.product-gallery');
  if (!gallery) return;

  // دکمه toggle
  const toggle = document.createElement('button');
  toggle.className = 'cinema-toggle';
  toggle.setAttribute('aria-label', 'حالت سینما');
  toggle.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
    <span>حالت سینما</span>
  `;

  gallery.style.position = 'relative';
  gallery.appendChild(toggle);

  toggle.addEventListener('click', () => {
    const isActive = document.body.classList.toggle('cinema-mode');
    toggle.classList.toggle('is-active', isActive);

    const label = toggle.querySelector('span');
    if (label) {
      label.textContent = isActive ? 'خروج از سینما' : 'حالت سینما';
    }
  });

  // خروج با ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('cinema-mode')) {
      document.body.classList.remove('cinema-mode');
      toggle.classList.remove('is-active');
      const label = toggle.querySelector('span');
      if (label) label.textContent = 'حالت سینما';
    }
  });
}

/* ============================================
   3. 360° GALLERY
   ============================================ */

export function init360Gallery() {
  const mainEl = document.getElementById('gallery-main');
  if (!mainEl) return;

  // پیدا کردن img فعلی
  const img = mainEl.querySelector('img');
  if (!img) return;

  const imgSrc = img.src;
  const imgAlt = img.alt;

  // تبدیل به ساختار 360
  mainEl.innerHTML = `
    <div class="gallery-360" id="gallery-360">
      <div class="gallery-360__stage">
        <div class="gallery-360__frame" id="gallery-360-frame">
          <img src="${imgSrc}" alt="${imgAlt}" />
        </div>
        <div class="gallery-360__hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          برای چرخش ۳۶۰ درجه بکشید
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
        <div class="gallery-360__indicator">
          <div class="gallery-360__indicator-fill" id="gallery-360-progress"></div>
        </div>
      </div>
    </div>
  `;

  const wrap = document.getElementById('gallery-360');
  const frame = document.getElementById('gallery-360-frame');
  const progress = document.getElementById('gallery-360-progress');

  let isDown = false;
  let startX = 0;
  let currentX = 0;
  let hasMoved = false;

  const update = () => {
    // تبدیل به زاویه بین 0 تا 360
    const delta = (currentX - startX);
    const percent = Math.min(Math.abs(delta) / 300, 1);
    const rotation = (delta / 3) % 360;

    frame.style.transform = `rotateY(${rotation}deg) scale(${1 - percent * 0.03})`;
    progress.style.width = `${percent * 100}%`;
  };

  const start = (x) => {
    isDown = true;
    startX = x;
    currentX = x;
    if (!hasMoved) {
      hasMoved = true;
      wrap.classList.add('is-used');
    }
  };

  const move = (x) => {
    if (!isDown) return;
    currentX = x;
    requestAnimationFrame(update);
  };

  const end = () => {
    if (!isDown) return;
    isDown = false;

    // برگردون به حالت اولیه نرم
    frame.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    frame.style.transform = 'rotateY(0deg) scale(1)';
    progress.style.width = '0%';

    setTimeout(() => {
      frame.style.transition = 'transform 0.05s linear';
    }, 600);
  };

  // Mouse
  wrap.addEventListener('mousedown', (e) => {
    e.preventDefault();
    start(e.clientX);
  });

  document.addEventListener('mousemove', (e) => {
    move(e.clientX);
  });

  document.addEventListener('mouseup', end);

  // Touch
  wrap.addEventListener('touchstart', (e) => {
    start(e.touches[0].clientX);
  }, { passive: true });

  wrap.addEventListener('touchmove', (e) => {
    move(e.touches[0].clientX);
  }, { passive: true });

  wrap.addEventListener('touchend', end);
}

/* ============================================
   4. STICKY GALLERY
   ============================================ */

export function initStickyGallery() {
  const gallery = document.querySelector('.product-gallery');
  if (!gallery) return;

  // فقط دسکتاپ
  if (window.matchMedia('(max-width: 1024px)').matches) return;

  gallery.classList.add('product-gallery--sticky');
}

/* ============================================
   5. COLOR MORPH
   ============================================ */

export function initColorMorph() {
  document.addEventListener('click', (e) => {
    const colorBtn = e.target.closest('.product-color-btn');
    if (!colorBtn) return;

    const color = colorBtn.dataset.color;
    if (!color) return;

    // Morph effect روی گالری
    const gallery = document.getElementById('gallery-main');
    const frame = document.getElementById('gallery-360-frame');

    const target = frame || gallery?.querySelector('.product-gallery__img');
    if (target) {
      target.classList.add('is-morphing');

      setTimeout(() => {
        target.classList.remove('is-morphing');
      }, 400);
    }

    // Dispatch event برای ambient light
    document.dispatchEvent(new CustomEvent('colorchange', {
      detail: { color },
    }));
  });
}

/* ============================================
   6. FLOATING SPECS
   ============================================ */

export function initFloatingSpecs() {
  const info = document.getElementById('product-info');
  if (!info) return;

  if (window.matchMedia('(max-width: 768px)').matches) return;

  const specs = [
    { icon: '<path d="M12 2 4 5v8c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V5l-8-3z"/>', label: 'ضمانت اصالت' },
    { icon: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>', label: 'ارسال سریع' },
    { icon: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>', label: '۷ روز بازگشت' },
  ];

  const wrap = document.createElement('div');
  wrap.className = 'product-info__floating-specs';
  wrap.innerHTML = specs.map((s) => `
    <span class="floating-spec">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
      ${s.label}
    </span>
  `).join('');

  // اضافه به gallery
  const gallery = document.querySelector('.product-gallery');
  if (gallery) {
    gallery.style.position = 'relative';
    gallery.appendChild(wrap);
  }
}

/* ============================================
   7. PAGE ENTRY
   ============================================ */

export function initPageEntry() {
  const page = document.getElementById('product-page');
  if (!page) return;

  setTimeout(() => {
    page.classList.add('is-loaded');
  }, 100);
}

/* ============================================
   8. INIT ALL
   ============================================ */

export function initCinema() {
  const page = document.getElementById('product-page');
  if (!page) return;

  initAmbientLight();
  initCinemaMode();
  initStickyGallery();
  initColorMorph();
  initPageEntry();

  // با تأخیر (بعد از رندر product-detail)
  setTimeout(() => {
    init360Gallery();
    initFloatingSpecs();
  }, 300);

  console.log('%c✓ Cinema initialized (Phase 3)', 'color:#18B981;font-weight:bold;');
}