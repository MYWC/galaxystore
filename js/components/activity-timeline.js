/* ============================================
   ACTIVITY TIMELINE COMPONENT — C.6
   ============================================ */

import { getUserActivity, ACTIVITY_PRESETS, formatRelativeTime } from '../services/user-activity.js';

const BASE_ICON_CLOCK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

const BASE_ICON_EMPTY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

/* ============================================
   HELPERS
   ============================================ */

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getBasePath() {
  return window.MS_BASE_PATH || './';
}

/**
 * لینک مقصد برای هر activity
 */
function getActivityLink(entry) {
  const base = getBasePath();

  if (entry.action === 'view' || entry.action === 'add_to_cart' || entry.action === 'wishlist' || entry.action === 'review') {
    if (entry.targetId) return `${base}product.html?id=${entry.targetId}`;
  }

  if (entry.action === 'order' && entry.targetId) {
    return `${base}support/track.html?order=${entry.targetId}`;
  }

  if (entry.action === 'address') {
    return `${base}account/addresses.html`;
  }

  return null;
}

function renderItem(entry) {
  const preset = ACTIVITY_PRESETS[entry.action] || ACTIVITY_PRESETS.view;
  const title = typeof preset.getTitle === 'function'
    ? preset.getTitle(entry)
    : entry.action;

  const text = typeof preset.text === 'function'
    ? preset.text(escapeHtml(entry.targetName), entry)
    : preset.text;

  const timeAgo = formatRelativeTime(entry.createdAt);
  const href = getActivityLink(entry);
  const colorClass = `activity-item__icon--${preset.color || 'blue'}`;

  const inner = `
    <div class="activity-item__icon ${colorClass}">
      ${preset.icon}
    </div>
    <div class="activity-item__body">
      <span class="activity-item__title">${title}</span>
      <span class="activity-item__text">${text}</span>
      <span class="activity-item__time">
        ${BASE_ICON_CLOCK}
        ${timeAgo}
      </span>
    </div>
  `;

  if (href) {
    return `
      <a href="${href}" class="activity-item activity-item--link">
        ${inner}
      </a>
    `;
  }

  return `
    <div class="activity-item">
      ${inner}
    </div>
  `;
}

function renderEmpty() {
  return `
    <div class="activity-empty">
      <div class="activity-empty__icon">
        ${BASE_ICON_EMPTY}
      </div>
      <p class="activity-empty__text">
        هنوز فعالیتی ثبت نشده. با گشتن در فروشگاه، اینجا خلاصه‌ی فعالیت‌هات رو می‌بینی.
      </p>
    </div>
  `;
}

function renderSkeleton(count = 4) {
  return `
    <div class="activity-skeleton">
      ${Array.from({ length: count }).map(() => `
        <div class="activity-skeleton__item">
          <div class="skeleton activity-skeleton__icon"></div>
          <div class="activity-skeleton__info">
            <div class="skeleton activity-skeleton__title"></div>
            <div class="skeleton activity-skeleton__text"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ============================================
   MOUNT
   ============================================ */

/**
 * رندر timeline توی یه container
 * @param {HTMLElement|string} container
 * @param {Object} opts
 * @param {number} [opts.limit=10]
 */
export async function mountActivityTimeline(container, { limit = 10 } = {}) {
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!el) return;

  // Skeleton
  el.innerHTML = renderSkeleton(4);

  try {
    const items = await getUserActivity({ limit });

    if (!items.length) {
      el.innerHTML = renderEmpty();
      return;
    }

    el.innerHTML = `
      <div class="activity-timeline">
        ${items.map(renderItem).join('')}
      </div>
    `;
  } catch (err) {
    console.error('[ActivityTimeline] error:', err);
    el.innerHTML = renderEmpty();
  }
}

/* ============================================
   LOG
   ============================================ */

console.log('%c✓ Activity Timeline ready (C.6)', 'color:#18B981;font-weight:bold;');