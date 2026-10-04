/* ============================================
   BRAND STRIP — Active state + Edge fade
   ============================================ */

export function initBrandStrip() {
  const strip = document.getElementById('brand-strip');
  if (!strip) return;

  const scroller = strip.querySelector('.brand-strip__inner');
  const items = strip.querySelectorAll('.brand-strip__item');
  if (!scroller || !items.length) return;

  // --- Active state (کلیک) ---
  items.forEach((item) => {
    item.addEventListener('click', (e) => {
      // اگر لینک واقعی است، بگذار برود (بعداً در React/Next رفتار فرق می‌کند)
      // فعلاً فقط active را جابه‌جا کن
      items.forEach((i) => i.classList.remove('is-active'));
      item.classList.add('is-active');
    });
  });

  // --- Edge fade بر اساس موقعیت اسکرول ---
  const updateEdges = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    const atStart = scrollLeft <= 4;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 4;

    // در RTL: شروع یعنی راست‌ترین
    strip.classList.toggle('has-scroll-end', !atStart);
    strip.classList.toggle('has-scroll-start', !atEnd);
  };

  scroller.addEventListener('scroll', updateEdges, { passive: true });
  window.addEventListener('resize', updateEdges);
  updateEdges();
}