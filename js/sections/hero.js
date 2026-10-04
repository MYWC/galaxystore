/* ============================================
   HERO — Parallax سبک روی Floating Tags (Desktop only)
   ============================================ */

export function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  // اگر کاربر انیمیشن کمتر خواسته، کاری نکن
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // فقط دسکتاپ
  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;
  if (!isDesktop()) return;

  const tags = hero.querySelectorAll('.hero__tag');
  const phones = hero.querySelector('.hero__phones');
  if (!phones) return;

  let raf = null;

  hero.addEventListener('mousemove', (e) => {
    if (!isDesktop()) return;
    if (raf) cancelAnimationFrame(raf);

    raf = requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 .. 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      tags.forEach((tag, i) => {
        const depth = (i + 1) * 3;
        tag.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });

      phones.style.transform = `translate(${x * -6}px, ${y * -6}px)`;
    });
  });

  hero.addEventListener('mouseleave', () => {
    tags.forEach((tag) => { tag.style.transform = ''; });
    phones.style.transform = '';
  });
}