/* ============================================
   FLOATING ACTIONS
   Back to Top + Support Chat
   ============================================ */

export function initFloating() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  /* --- نمایش/مخفی بر اساس اسکرول --- */
  const onScroll = () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- کلیک: بازگشت به بالا --- */
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* --- دکمه چت --- */
  const chat = document.getElementById('chat-btn');
  if (chat) {
    chat.addEventListener('click', () => {
      console.log('Chat clicked');
    });
  }
}