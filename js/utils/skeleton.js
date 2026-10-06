/* ============================================
   SKELETON LOADERS
   نمایش اسکلت تا زمان رندر
   ============================================ */

/* ---------- Product Card Skeleton ---------- */

export function createCardSkeleton() {
  return `
    <div class="skeleton-card">
      <div class="skeleton skeleton-card__media"></div>
      <div class="skeleton skeleton-card__line skeleton-card__line--short"></div>
      <div class="skeleton skeleton-card__line skeleton-card__line--full"></div>
      <div class="skeleton skeleton-card__line skeleton-card__line--medium"></div>
      <div class="skeleton skeleton-card__line skeleton-card__line--full"></div>
      <div class="skeleton skeleton-card__line skeleton-card__line--short"></div>
    </div>
  `;
}

/* ---------- Show Skeleton in Container ---------- */

export function showSkeleton(container, count = 4) {
  if (!container) return;
  container.innerHTML = Array.from({ length: count })
    .map(createCardSkeleton)
    .join('');
}

/* ---------- Init All Skeletons ---------- */

export function initSkeletons() {
  const targets = [
    { id: 'best-deals-grid', count: 5 },
    { id: 'trending-grid', count: 8 },
    { id: 'flash-sale-grid', count: 4 },
  ];

  targets.forEach(({ id, count }) => {
    const el = document.getElementById(id);
    if (el && !el.innerHTML.trim()) {
      showSkeleton(el, count);
    }
  });
}