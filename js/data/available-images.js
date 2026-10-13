/* ============================================
   AVAILABLE IMAGES
   لیست id محصولاتی که عکس دارن
   ============================================ */

export const AVAILABLE_IMAGE_IDS = new Set([
  /* ============ APPLE ============ */
  'iphone-16',
  'iphone-16e',
  'iphone-16-plus',
  'iphone-16-pro',
  'iphone-16-pro-max',
  'iphone-17',
  'iphone-17e',
  'iphone-17-pro',
  'iphone-17-pro-max',
  'iphone-18-pro',
  'iphone-18-pro-max',
  'iphone-air',
  'iphone-duo',

  /* ============ SAMSUNG ============ */
  'galaxy-a17',
  'galaxy-a26',
  'galaxy-a36',
  'galaxy-a56',
  'galaxy-m26',
  'galaxy-m36',
  'galaxy-s24',
  'galaxy-s24-fe',
  'galaxy-s24-plus',
  'galaxy-s24-ultra',
  'galaxy-s25',
  'galaxy-s25-edge',
  'galaxy-s25-fe',
  'galaxy-s25-plus',
  'galaxy-s25-ultra',
  'galaxy-s26-fe',
  'galaxy-s26-plus',
  'galaxy-s26-ultra',
  'galaxy-z-flip6',
  'galaxy-z-flip7',
  'galaxy-z-flip7-fe',
  'galaxy-z-flip8',
  'galaxy-z-fold6',
  'galaxy-z-fold7',
  'galaxy-z-fold7-ultra',
  'galaxy-z-fold8',
  'galaxy-z-fold8-ultra',

  /* ============ GOOGLE PIXEL ============ */
  'pixel-9',
  'pixel-9a',
  'pixel-9-pro',
  'pixel-9-pro-fold',
  'pixel-10',
  'pixel-10a',
  'pixel-10-pro',
  'pixel-10-pro-fold',
  'pixel-11-pro',
  'pixel-11-pro-fold',

  /* ============ XIAOMI ============ */
  'xiaomi-14',
  'xiaomi-14-ultra',
  'xiaomi-14t',
  'xiaomi-14t-pro',
  'xiaomi-15',
  'xiaomi-15-ultra',
  'xiaomi-15t',
  'xiaomi-15t-pro',
  'xiaomi-15s-pro',
  'xiaomi-17',
  'xiaomi-17-pro',
  'xiaomi-17-pro-max',
  'xiaomi-17-ultra',
  'xiaomi-mix-flip',
  'xiaomi-mix-flip-2',

  /* ============ REDMI ============ */
  'redmi-note-13-pro',
  'redmi-note-14-pro',
  'redmi-note-14-pro-plus',
  'redmi-note-15-pro',
  'redmi-note-15-pro-plus',
  'redmi-14c',

  /* ============ POCO ============ */
  'poco-f6',
  'poco-f6-pro',
  'poco-f7',
  'poco-x6-pro',
  'poco-x7-pro',
  'poco-x8-pro',
]);

export function hasImage(id) {
  return AVAILABLE_IMAGE_IDS.has(id);
}