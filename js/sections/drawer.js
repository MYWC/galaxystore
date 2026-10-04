/* ============================================
   MOBILE DRAWER
   ============================================ */

export function initDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const toggle = document.getElementById('menu-toggle');
  const close = document.getElementById('drawer-close');

  if (!drawer || !toggle) return;

  const open = () => {
    document.body.classList.add('drawer-open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    document.body.classList.remove('drawer-open');
    document.body.style.overflow = '';
  };

  /* --- Open --- */
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    if (document.body.classList.contains('drawer-open')) {
      closeDrawer();
    } else {
      open();
    }
  });

  /* --- Close Button --- */
  if (close) {
    close.addEventListener('click', closeDrawer);
  }

  /* --- Overlay --- */
  if (overlay) {
    overlay.addEventListener('click', closeDrawer);
  }

  /* --- ESC Key --- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) {
      closeDrawer();
    }
  });

  /* --- لینک‌های داخل Drawer: بستن خودکار --- */
  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      // اجازه بده ناوبری انجام شود بعد ببند
      setTimeout(closeDrawer, 100);
    });
  });

  /* --- Resize: بستن Drawer در دسکتاپ --- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 1024 && document.body.classList.contains('drawer-open')) {
        closeDrawer();
      }
    }, 150);
  });

  /* --- Swipe to Close (اختیاری) --- */
  let touchStartX = 0;
  let touchCurrentX = 0;

  drawer.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchCurrentX = touchStartX;
  }, { passive: true });

  drawer.addEventListener('touchmove', (e) => {
    touchCurrentX = e.touches[0].clientX;
  }, { passive: true });

  drawer.addEventListener('touchend', () => {
    const diff = touchCurrentX - touchStartX;
    // در RTL، کشیدن به راست بستن است (drawer از راست می‌آید)
    if (diff > 80) {
      closeDrawer();
    }
  });
}