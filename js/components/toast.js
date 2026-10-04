/* ============================================
   TOAST NOTIFICATIONS
   ============================================ */

const ICONS = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  close:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

let container = null;

function ensureContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

/**
 * نمایش یک Toast
 * @param {Object} opts
 * @param {'success'|'error'|'warning'|'info'} opts.type
 * @param {string} opts.title
 * @param {string} [opts.message]
 * @param {number} [opts.duration=3500]
 */
export function toast({ type = 'info', title, message = '', duration = 3500 }) {
  const root = ensureContainer();

  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `
    <span class="toast__icon">${ICONS[type] || ICONS.info}</span>
    <div class="toast__body">
      <span class="toast__title">${title}</span>
      ${message ? `<span class="toast__message">${message}</span>` : ''}
    </div>
    <button class="toast__close" aria-label="بستن">${ICONS.close}</button>
    <div class="toast__progress">
      <div class="toast__progress-bar" style="animation-duration:${duration}ms"></div>
    </div>
  `;

  root.appendChild(el);

  const remove = () => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 260);
  };

  el.querySelector('.toast__close').addEventListener('click', remove);

  const timer = setTimeout(remove, duration);

  // توقف انیمیشن Progress در Hover
  el.addEventListener('mouseenter', () => {
    clearTimeout(timer);
    el.querySelector('.toast__progress-bar').style.animationPlayState = 'paused';
  });

  el.addEventListener('mouseleave', () => {
    el.querySelector('.toast__progress-bar').style.animationPlayState = 'running';
    setTimeout(remove, 800);
  });

  return el;
}