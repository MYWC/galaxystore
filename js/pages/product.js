/* ============================================
   PRODUCT PAGE — Entry Point
   ============================================ */

import { initLayout } from '../components/layout.js';
import { initProductDetail } from '../sections/product-detail.js';

/* ---------- Init Layout (Header, Nav, Footer, Drawer, Cart, ...) ---------- */
initLayout();

/* ---------- Init Page ---------- */
initProductDetail();

console.log('%c✓ Product page loaded', 'color:#18B981;font-weight:bold;');