/* ============================================
   LAYOUT — Header + Nav + Footer + Common UI
   این فایل، همه چیز مشترک را میسازد
   ============================================ */

import { initDrawer } from '../sections/drawer.js';
import { initFloating } from '../sections/floating.js';
import { initCartDrawer } from './cart-drawer.js';
import { initQuickView } from './quick-view.js';
import { initSearch } from './search.js';
import { initFooter } from '../sections/footer.js';
import { cart, wishlist, compare, onChange, KEYS } from '../store/state.js';
import { initAnimations } from '../utils/animations.js';
import { initMicro, bounceCartBadge } from '../utils/micro.js';

/* ============================================
   ANNOUNCEMENT + HEADER + NAV
   ============================================ */

const ANNOUNCEMENT_HTML = `
<div class="announcement">
  <div class="container">
    <div class="announcement__inner">
      <span class="announcement__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        ارسال سریع به سراسر کشور
      </span>
      <span class="announcement__divider"></span>
      <span class="announcement__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.22.45 4.56 1.24"/></svg>
        ضمانت اصالت کالا
      </span>
      <span class="announcement__divider"></span>
      <span class="announcement__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        پرداخت امن
      </span>
      <span class="announcement__divider"></span>
      <span class="announcement__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        ۷ روز ضمانت بازگشت
      </span>
    </div>
  </div>
</div>
`;

const HEADER_HTML = `
<header class="header" id="site-header">
  <div class="container">
    <div class="header__inner">
      <button class="header__menu-btn" aria-label="منو" id="menu-toggle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <a href="index.html" class="header__logo" aria-label="موبایل استور">
        <span class="header__logo-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
        </span>
        <span class="header__logo-text">
          <span>موبایل استور</span>
          <span>MOBILE & TABLET</span>
        </span>
      </a>
      <div class="header__search">
        <svg class="header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" class="header__search-input" placeholder="جستجوی گوشی، تبلت یا برند..." aria-label="جستجو" autocomplete="off" />
      </div>
      <div class="header__actions">
        <a href="wishlist.html" class="header__action header__action--optional" aria-label="علاقه‌مندی‌ها">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span class="header__action-badge" data-badge="wishlist">0</span>
        </a>
        <a href="compare.html" class="header__action header__action--optional" aria-label="مقایسه">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
        </a>
        <a href="account/index.html" class="header__action header__action--optional" aria-label="حساب کاربری">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </a>
        <a href="cart.html" class="header__action" aria-label="سبد خرید" data-cart-toggle>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span class="header__action-badge header__action-badge--cart">0</span>
        </a>
      </div>
    </div>
    <div class="header__mobile-search">
      <div class="header__search" style="max-width:100%; margin:0;">
        <svg class="header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" class="header__search-input" placeholder="جستجوی محصول..." aria-label="جستجو" autocomplete="off" />
      </div>
    </div>
  </div>
</header>
`;

const NAV_HTML = `
<nav class="nav" id="main-nav" aria-label="منوی اصلی">
  <div class="container">
    <div class="nav__inner">
      <a href="index.html#special" class="nav__link nav__link--accent">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 0.67s0.74 2.65 0.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l0.03-0.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-0.36 3.6-1.21 4.62-2.58 0.39 1.29 0.59 2.65 0.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>
        پیشنهاد ویژه
      </a>
      <span class="nav__sep"></span>
      <a href="category.html?type=phone" class="nav__link">گوشی موبایل</a>
      <a href="category.html?type=tablet" class="nav__link">تبلت</a>
      <span class="nav__sep"></span>
      <a href="brand.html?id=apple" class="nav__link">آیفون</a>
      <a href="brand.html?id=samsung" class="nav__link">سامسونگ</a>
      <a href="brand.html?id=xiaomi" class="nav__link">شیائومی</a>
      <a href="brand.html?id=google" class="nav__link">گوگل پیکسل</a>
      <a href="brand.html?id=oneplus" class="nav__link">وان‌پلاس</a>
      <a href="brand.html?id=honor" class="nav__link">آنر</a>
      <a href="brand.html?id=huawei" class="nav__link">هواوی</a>
      <a href="category.html?filter=discount" class="nav__link">تخفیف‌ها</a>
    </div>
  </div>
</nav>
`;

/* ============================================
   DRAWER
   ============================================ */

const DRAWER_HTML = `
<div class="drawer-overlay" id="drawer-overlay"></div>
<aside class="drawer" id="mobile-drawer" aria-label="منوی موبایل" aria-hidden="true">
  <div class="drawer__head">
    <a href="index.html" class="drawer__logo">
      <span class="drawer__logo-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
      </span>
      <span class="drawer__logo-text"><span>موبایل استور</span><span>MOBILE & TABLET</span></span>
    </a>
    <button class="drawer__close" id="drawer-close" aria-label="بستن منو">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <div class="drawer__body">
    <div class="drawer__section">
      <div class="drawer__section-title">فروشگاه</div>
      <div class="drawer__list">
        <a href="category.html?filter=discount" class="drawer__link drawer__link--accent">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 0.67s0.74 2.65 0.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l0.03-0.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67z"/></svg>
          پیشنهاد ویژه
          <span class="drawer__link-badge drawer__link-badge--discount">۱۲</span>
        </a>
        <a href="category.html?type=phone" class="drawer__link">گوشی موبایل</a>
        <a href="category.html?type=tablet" class="drawer__link">تبلت</a>
        <a href="category.html?filter=flagship" class="drawer__link">پرچمدار</a>
        <a href="category.html?filter=budget" class="drawer__link">اقتصادی</a>
        <a href="category.html?filter=discount" class="drawer__link">تخفیف‌ها</a>
      </div>
    </div>
    <div class="drawer__section">
      <div class="drawer__section-title">برندها</div>
      <div class="drawer__list">
        <a href="brand.html?id=apple" class="drawer__link">Apple</a>
        <a href="brand.html?id=samsung" class="drawer__link">Samsung</a>
        <a href="brand.html?id=xiaomi" class="drawer__link">Xiaomi</a>
        <a href="brand.html?id=google" class="drawer__link">Google</a>
        <a href="brand.html?id=oneplus" class="drawer__link">OnePlus</a>
        <a href="brand.html?id=honor" class="drawer__link">Honor</a>
        <a href="brand.html?id=nothing" class="drawer__link">Nothing</a>
        <a href="brand.html?id=motorola" class="drawer__link">Motorola</a>
        <a href="brand.html?id=realme" class="drawer__link">Realme</a>
        <a href="brand.html?id=huawei" class="drawer__link">Huawei</a>
      </div>
    </div>
    <div class="drawer__section">
      <div class="drawer__section-title">حساب من</div>
      <div class="drawer__list">
        <a href="account/index.html" class="drawer__link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          حساب کاربری
        </a>
        <a href="wishlist.html" class="drawer__link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          علاقه‌مندی‌ها
          <span class="drawer__link-badge" data-badge="wishlist-drawer">0</span>
        </a>
        <a href="compare.html" class="drawer__link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
          مقایسه
        </a>
        <a href="cart.html" class="drawer__link" data-cart-toggle>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          سبد خرید
          <span class="drawer__link-badge" data-badge="cart-drawer">0</span>
        </a>
        <a href="support/track.html" class="drawer__link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          پیگیری سفارش
        </a>
      </div>
    </div>
  </div>
  <div class="drawer__foot">
    <a href="tel:02112345678" class="drawer__contact">
      <span class="drawer__contact-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      </span>
      <span class="drawer__contact-text">
        <span>پشتیبانی ۲۴ ساعته</span>
        <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
      </span>
    </a>
  </div>
</aside>
`;

/* ============================================
   CART DRAWER + QUICK VIEW + FLOATING
   ============================================ */

const CART_DRAWER_HTML = `
<div class="cart-overlay" id="cart-overlay"></div>
<aside class="cart-drawer" id="cart-drawer" aria-label="سبد خرید" aria-hidden="true">
  <div class="cart-drawer__head">
    <div class="cart-drawer__title-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <h2 class="cart-drawer__title">سبد خرید</h2>
      <span class="cart-drawer__count">۰</span>
    </div>
    <button class="cart-drawer__close" id="cart-close" aria-label="بستن">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <div class="cart-drawer__body" id="cart-drawer-body"></div>
  <div class="cart-drawer__foot" id="cart-drawer-foot"></div>
</aside>
`;

const QUICK_VIEW_HTML = `
<div class="qv-overlay" id="qv-overlay" role="dialog" aria-modal="true">
  <div class="qv-modal">
    <button class="qv-modal__close" id="qv-close" aria-label="بستن">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div id="qv-content" style="display: contents;"></div>
  </div>
</div>
`;

const FLOATING_HTML = `
<div class="floating">
  <button class="floating__btn floating__btn--top" id="back-to-top" aria-label="بازگشت به بالا">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
  </button>
  <button class="floating__btn floating__btn--chat" id="chat-btn" aria-label="پشتیبانی">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/></svg>
    <span class="floating__online"></span>
  </button>
</div>
`;

/* ============================================
   FOOTER
   ============================================ */

const FOOTER_HTML = `
<footer class="footer" id="site-footer">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__brand">
        <a href="index.html" class="footer__logo">
          <span class="footer__logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
          </span>
          <span class="footer__logo-text">
            <span>موبایل استور</span>
            <span>MOBILE & TABLET</span>
          </span>
        </a>
        <p class="footer__desc">
          فروشگاه تخصصی موبایل و تبلت با ۱۰ برند معتبر جهانی،
          ضمانت اصالت کالا و خدمات پس از فروش مطمئن.
        </p>
        <div class="footer__social">
          <a href="#" class="footer__social-link" aria-label="اینستاگرام">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="#" class="footer__social-link" aria-label="تلگرام">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 4.5 2.7 11.6c-1 .4-1 1.9.1 2.2l4.6 1.4 1.7 5.3c.3 1 1.6 1.1 2.1.2l2.5-4.3 4.6 3.4c.8.6 2 .1 2.2-.9l3-12c.2-1-.8-1.8-1.7-1.4z"/></svg>
          </a>
          <a href="#" class="footer__social-link" aria-label="توییتر">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 3H22l-7.5 8.6L23.3 21H16l-5.6-7.4L3.9 21H1l8-9.2L1 3h7.4l5 6.7L18.9 3z"/></svg>
          </a>
        </div>
      </div>
      <div class="footer__col">
        <h4 class="footer__col-title">فروشگاه</h4>
        <div class="footer__col-list">
          <a href="category.html?type=phone" class="footer__col-link">گوشی موبایل</a>
          <a href="category.html?type=tablet" class="footer__col-link">تبلت</a>
          <a href="category.html?filter=flagship" class="footer__col-link">پرچمدار</a>
          <a href="category.html?filter=budget" class="footer__col-link">اقتصادی</a>
          <a href="category.html?filter=discount" class="footer__col-link">تخفیف‌ها</a>
        </div>
      </div>
      <div class="footer__col">
        <h4 class="footer__col-title">برندها</h4>
        <div class="footer__col-list">
          <a href="brand.html?id=apple" class="footer__col-link">Apple</a>
          <a href="brand.html?id=samsung" class="footer__col-link">Samsung</a>
          <a href="brand.html?id=xiaomi" class="footer__col-link">Xiaomi</a>
          <a href="brand.html?id=google" class="footer__col-link">Google</a>
          <a href="brand.html?id=huawei" class="footer__col-link">Huawei</a>
        </div>
      </div>
      <div class="footer__col">
        <h4 class="footer__col-title">پشتیبانی</h4>
        <div class="footer__col-list">
          <a href="support/contact.html" class="footer__col-link">تماس با ما</a>
          <a href="support/track.html" class="footer__col-link">پیگیری سفارش</a>
          <a href="support/returns.html" class="footer__col-link">بازگشت کالا</a>
          <a href="legal/terms.html" class="footer__col-link">قوانین و مقررات</a>
        </div>
      </div>
      <div class="footer__newsletter">
        <h4 class="footer__col-title">خبرنامه</h4>
        <p class="footer__newsletter-desc">برای دریافت تخفیف‌ها و اخبار جدید ایمیل خود را وارد کنید.</p>
        <form class="footer__newsletter-form" id="newsletter-form">
          <input type="email" class="footer__newsletter-input" placeholder="ایمیل شما..." aria-label="ایمیل" required />
          <button type="submit" class="footer__newsletter-btn" aria-label="عضویت">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
        </form>
      </div>
    </div>
    <div class="footer__bottom">
      <p class="footer__copyright">© <strong id="footer-year">۱۴۰۴</strong> موبایل استور — تمامی حقوق محفوظ است.</p>
      <div class="footer__payments">
        <span class="footer__payment">زرین‌پال</span>
        <span class="footer__payment">سامان</span>
        <span class="footer__payment">ملت</span>
        <span class="footer__payment">VISA</span>
      </div>
    </div>
  </div>
</footer>
`;

/* ============================================
   INIT
   ============================================ */

function inject(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

export function initLayout() {
  // Inject
  inject('layout-announcement', ANNOUNCEMENT_HTML);
  inject('layout-header', HEADER_HTML);
  inject('layout-nav', NAV_HTML);
  inject('layout-drawer', DRAWER_HTML);
  inject('layout-cart-drawer', CART_DRAWER_HTML);
  inject('layout-quick-view', QUICK_VIEW_HTML);
  inject('layout-floating', FLOATING_HTML);
  inject('layout-footer', FOOTER_HTML);

  // Sticky header
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Init common components
  initDrawer();
  initFloating();
  initCartDrawer();
  initQuickView();
  initSearch();
  initFooter();

  // Init animations
  initAnimations();
  initMicro();

  // Badge sync
  syncBadges();
  onChange(KEYS.wishlist, syncBadges);
  onChange(KEYS.cart, () => {
    syncBadges();
    bounceCartBadge();
  });
  onChange(KEYS.compare, syncBadges);
}

function syncBadges() {
  const wCount = wishlist.count();
  const cCount = cart.count();

  document.querySelectorAll('[data-badge="wishlist"], [data-badge="wishlist-drawer"]').forEach((el) => {
    el.textContent = wCount.toLocaleString('fa-IR');
    el.style.display = wCount > 0 ? '' : 'none';
  });

  document.querySelectorAll('.header__action-badge--cart, [data-badge="cart-drawer"]').forEach((el) => {
    el.textContent = cCount.toLocaleString('fa-IR');
    el.style.display = cCount > 0 ? '' : 'none';
  });
}