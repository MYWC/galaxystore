/* ============================================
   FOOTER — Newsletter + Year
   ============================================ */

export function initFooter() {
  // سال جاری در کپی‌رایت
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().toLocaleDateString('fa-IR', { year: 'numeric' }).replace(/\D/g, '') || '۱۴۰۴';
  }

  // فرم خبرنامه
  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const btn = form.querySelector('button');
      if (!input || !input.value.trim()) return;

      const originalHTML = btn.innerHTML;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;
      btn.style.background = 'var(--success)';
      input.value = '';

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
      }, 1800);
    });
  }
}