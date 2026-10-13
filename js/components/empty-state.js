/* ============================================
   EMPTY STATE COMPONENT — Phase A.7
   Reusable empty state for all pages
   ============================================ */

const ICONS = {
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  wishlist: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  compare: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>`,
  orders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  addresses: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  notifications: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  inbox: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * ساخت HTML یک Empty State
 * @param {Object} opts
 * @param {string}  [opts.icon='package'] — کلید آیکون یا SVG خام
 * @param {string}  opts.title
 * @param {string}  [opts.text]
 * @param {Array}   [opts.actions] — [{ id?, label, href?, variant?, icon? }]
 * @param {string}  [opts.variant='default'] — default|danger|success|warning|purple|teal
 * @param {boolean} [opts.compact=false]
 * @param {boolean} [opts.plain=false]
 * @param {boolean} [opts.full=false]
 * @param {string}  [opts.className='']
 * @returns {string}
 */
export function renderEmptyState(opts = {}) {
  const {
    icon = 'package',
    title = '',
    text = '',
    actions = [],
    variant = 'default',
    compact = false,
    plain = false,
    full = false,
    className = '',
  } = opts;

  const iconSvg = ICONS[icon] || (typeof icon === 'string' && icon.startsWith('<svg') ? icon : ICONS.package);

  const classes = ['empty-state'];
  if (variant !== 'default') classes.push(`empty-state--${variant}`);
  if (compact) classes.push('empty-state--compact');
  if (plain) classes.push('empty-state--plain');
  if (full) classes.push('empty-state--full');
  if (className) classes.push(className);

  const actionsHTML = actions.length
    ? `
      <div class="empty-state__actions">
        ${actions.map((a) => {
          const btnClass = a.variant === 'primary'
            ? 'btn btn--primary'
            : a.variant === 'ghost'
              ? 'btn btn--ghost'
              : 'btn btn--outline';
          const iconHTML = a.icon ? (ICONS[a.icon] || '') : '';
          if (a.href) {
            return `<a href="${esc(a.href)}" class="${btnClass}">${iconHTML} ${esc(a.label)}</a>`;
          }
          return `<button type="button" class="${btnClass}" data-empty-action="${esc(a.id || '')}">${iconHTML} ${esc(a.label)}</button>`;
        }).join('')}
      </div>
    `
    : '';

  return `
    <div class="${classes.join(' ')}" role="status">
      <div class="empty-state__icon">${iconSvg}</div>
      ${title ? `<h3 class="empty-state__title">${esc(title)}</h3>` : ''}
      ${text ? `<p class="empty-state__text">${text}</p>` : ''}
      ${actionsHTML}
    </div>
  `;
}

/**
 * Mount empty state روی یک container
 */
export function mountEmptyState(container, opts = {}, handlers = {}) {
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!el) return;

  el.innerHTML = renderEmptyState(opts);
  el.hidden = false;
  el.classList.add('is-empty-state');

  Object.entries(handlers).forEach(([actionId, handler]) => {
    const btn = el.querySelector(`[data-empty-action="${actionId}"]`);
    if (btn && typeof handler === 'function') {
      btn.addEventListener('click', handler);
    }
  });
}

/**
 * مخفی کردن empty state
 */
export function hideEmptyState(container) {
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;
  if (!el) return;
  el.hidden = true;
  el.classList.remove('is-empty-state');
}

export { ICONS as EMPTY_ICONS };