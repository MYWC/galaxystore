/* ============================================
   GLOBAL STATE + LOCALSTORAGE
   یک لایه واحد برای Cart، Wishlist، Compare
   + Quantity Limits (B.10)
   ============================================ */

const KEYS = {
  cart: 'ms_cart',
  wishlist: 'ms_wishlist',
  compare: 'ms_compare',
};

/* ============================================
   QUANTITY LIMITS (B.10)
   ============================================ */

const MAX_PER_ITEM = 5;    // حداکثر تعداد هر محصول
const MAX_TOTAL_ITEMS = 30; // حداکثر کل اقلام سبد

/* ---------- Helpers ---------- */
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    emitChange(key);
  } catch (e) {
    console.error('Storage error:', e);
  }
}

/* ---------- Events ---------- */
const listeners = {};

function emitChange(key) {
  (listeners[key] || []).forEach((cb) => cb(read(key, null)));
}

export function onChange(key, cb) {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(cb);
}

/* ============================================
   CART — با پشتیبانی Quantity Limits (B.10)
   ============================================ */

export const cart = {
  // Constants برای استفاده در UI
  MAX_PER_ITEM,
  MAX_TOTAL_ITEMS,

  get() {
    return read(KEYS.cart, []);
  },

  /**
   * محاسبه max مجاز برای یک آیتم
   * = کمترینِ (موجودی، سقف کلی)
   */
  getMaxQty(item) {
    if (!item) return MAX_PER_ITEM;
    const stock = Number(item.stock);
    if (!Number.isFinite(stock) || stock <= 0) return MAX_PER_ITEM;
    return Math.min(stock, MAX_PER_ITEM);
  },

  /**
   * افزودن محصول به سبد
   * @param {Object} product — شامل stock (اختیاری)
   * @param {number} qty
   * @returns {{ items, added: number, error?: string, limited?: boolean }}
   */
  add(product, qty = 1) {
    const items = this.get();
    const existing = items.find((i) => i.id === product.id);
    const stock = Number(product.stock) || MAX_PER_ITEM;
    const maxAllowed = Math.min(stock, MAX_PER_ITEM);

    // چک کردن سقف کل سبد
    const currentTotal = items.reduce((sum, i) => sum + i.qty, 0);
    if (currentTotal + qty > MAX_TOTAL_ITEMS) {
      return {
        items,
        added: 0,
        error: `حداکثر ${MAX_TOTAL_ITEMS.toLocaleString('fa-IR')} کالا در سبد خرید مجاز است`,
      };
    }

    if (existing) {
      const newQty = existing.qty + qty;

      if (newQty > maxAllowed) {
        // محدود کن به max
        existing.qty = maxAllowed;
        if (product.stock != null) existing.stock = product.stock;
        write(KEYS.cart, items);

        return {
          items,
          added: Math.max(0, maxAllowed - (newQty - qty)),
          limited: true,
          error: stock <= MAX_PER_ITEM
            ? `فقط ${stock.toLocaleString('fa-IR')} عدد موجود است`
            : `حداکثر ${MAX_PER_ITEM.toLocaleString('fa-IR')} عدد از هر محصول`,
        };
      }

      existing.qty = newQty;
      if (product.stock != null) existing.stock = product.stock;
    } else {
      const addQty = Math.min(qty, maxAllowed);

      items.push({
        id: product.id,
        brand: product.brand,
        name: product.name,
        ram: product.ram || null,
        storage: product.storage || null,
        color: product.color || null,
        price: product.price,
        oldPrice: product.oldPrice || null,
        image: product.image || null,
        stock: Number.isFinite(stock) ? stock : null,
        qty: addQty,
      });

      if (addQty < qty) {
        write(KEYS.cart, items);
        return {
          items,
          added: addQty,
          limited: true,
          error: stock <= MAX_PER_ITEM
            ? `فقط ${stock.toLocaleString('fa-IR')} عدد موجود است`
            : `حداکثر ${MAX_PER_ITEM.toLocaleString('fa-IR')} عدد از هر محصول`,
        };
      }
    }

    write(KEYS.cart, items);
    return { items, added: qty };
  },

  remove(id) {
    const items = this.get().filter((i) => i.id !== id);
    write(KEYS.cart, items);
    return items;
  },

  /**
   * آپدیت تعداد — با clamp خودکار به محدوده مجاز
   * @returns {{ items, clamped?: boolean, max?: number, error?: string }}
   */
  updateQty(id, qty) {
    const items = this.get();
    const item = items.find((i) => i.id === id);
    if (!item) return { items };

    if (qty <= 0) {
      return { items: this.remove(id) };
    }

    const max = this.getMaxQty(item);

    if (qty > max) {
      item.qty = max;
      write(KEYS.cart, items);
      return {
        items,
        clamped: true,
        max,
        error: item.stock && item.stock <= MAX_PER_ITEM
          ? `فقط ${item.stock.toLocaleString('fa-IR')} عدد موجود است`
          : `حداکثر ${MAX_PER_ITEM.toLocaleString('fa-IR')} عدد از هر محصول`,
      };
    }

    item.qty = qty;
    write(KEYS.cart, items);
    return { items };
  },

  count() {
    return this.get().reduce((sum, i) => sum + i.qty, 0);
  },

  total() {
    return this.get().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  totalOld() {
    return this.get().reduce(
      (sum, i) => sum + (i.oldPrice || i.price) * i.qty,
      0
    );
  },

  discount() {
    const diff = this.totalOld() - this.total();
    return diff > 0 ? diff : 0;
  },

  clear() {
    write(KEYS.cart, []);
  },
};

/* ============================================
   WISHLIST
   ============================================ */

export const wishlist = {
  get() {
    return read(KEYS.wishlist, []);
  },

  has(id) {
    return this.get().some((i) => i.id === id);
  },

  toggle(product) {
    const items = this.get();
    const idx = items.findIndex((i) => i.id === product.id);

    if (idx >= 0) {
      items.splice(idx, 1);
      write(KEYS.wishlist, items);
      return { added: false, items };
    }

    items.push({
      id: product.id,
      brand: product.brand,
      name: product.name,
      price: product.price,
      image: product.image || null,
    });
    write(KEYS.wishlist, items);
    return { added: true, items };
  },

  remove(id) {
    const items = this.get().filter((i) => i.id !== id);
    write(KEYS.wishlist, items);
    return items;
  },

  count() {
    return this.get().length;
  },
};

/* ============================================
   COMPARE
   ============================================ */

export const compare = {
  get() {
    return read(KEYS.compare, []);
  },

  has(id) {
    return this.get().some((i) => i.id === id);
  },

  toggle(product) {
    const items = this.get();
    const idx = items.findIndex((i) => i.id === product.id);

    if (idx >= 0) {
      items.splice(idx, 1);
      write(KEYS.compare, items);
      return { added: false, items };
    }

    if (items.length >= 4) {
      return { added: false, items, error: 'حداکثر ۴ محصول قابل مقایسه است' };
    }

    items.push({
      id: product.id,
      brand: product.brand,
      name: product.name,
    });
    write(KEYS.compare, items);
    return { added: true, items };
  },

  count() {
    return this.get().length;
  },
};

/* ============================================
   Keys export
   ============================================ */

export { KEYS };