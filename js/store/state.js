/* ============================================
   GLOBAL STATE + LOCALSTORAGE
   یک لایه واحد برای Cart، Wishlist، Compare
   بعداً به‌راحتی به Supabase وصل می‌شود
   ============================================ */

const KEYS = {
  cart: 'ms_cart',
  wishlist: 'ms_wishlist',
  compare: 'ms_compare',
};

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
   CART
   ============================================ */

export const cart = {
  get() {
    return read(KEYS.cart, []);
  },

  add(product, qty = 1) {
    const items = this.get();
    const existing = items.find((i) => i.id === product.id);

    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        brand: product.brand,
        name: product.name,
        ram: product.ram || null,
        storage: product.storage || null,
        price: product.price,
        oldPrice: product.oldPrice || null,
        image: product.image || null,
        qty,
      });
    }

    write(KEYS.cart, items);
    return items;
  },

  remove(id) {
    const items = this.get().filter((i) => i.id !== id);
    write(KEYS.cart, items);
    return items;
  },

  updateQty(id, qty) {
    const items = this.get();
    const item = items.find((i) => i.id === id);
    if (!item) return items;

    if (qty <= 0) {
      return this.remove(id);
    }

    item.qty = qty;
    write(KEYS.cart, items);
    return items;
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