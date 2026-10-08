/* ============================================
   BRANDS DATA — 10 برند تخصصی موبایل و تبلت
   ============================================ */

export const brands = [
  {
    id: 'apple',
    name: 'Apple',
    count: 184,
    href: 'brand.html?id=apple',
    svg: `
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    `,
  },
  {
    id: 'samsung',
    name: 'Samsung',
    count: 247,
    href: 'brand.html?id=samsung',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="12" rx="10" ry="6.2" transform="rotate(-25 12 12)"/>
        <ellipse cx="12" cy="12" rx="10" ry="6.2" transform="rotate(25 12 12)"/>
      </svg>
    `,
  },
  {
    id: 'xiaomi',
    name: 'Xiaomi',
    count: 196,
    href: 'brand.html?id=xiaomi',
    svg: `
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4 6h9a3 3 0 0 1 3 3v9h-3V9.5a.5.5 0 0 0-.5-.5H10v9H7V9.5a.5.5 0 0 0-.5-.5H7v9H4V6zm13 0h3v12h-3V6z"/>
      </svg>
    `,
  },
  {
    id: 'google',
    name: 'Google',
    count: 48,
    href: 'brand.html?id=google',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6c-.2 1.3-1 2.4-2 3.1v2.6h3.3c1.9-1.8 3.1-4.4 3.1-7.5z" fill="#4285F4"/>
        <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.6c-.9.6-2 .9-3.3.9-2.6 0-4.8-1.7-5.6-4.1H3v2.7c1.6 3.3 5 5.5 9 5.5z" fill="#34A853"/>
        <path d="M6.4 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.3.3-1.8V7.5H3A10 10 0 0 0 2 12c0 1.6.4 3.2 1 4.5l3.4-2.7z" fill="#FBBC04"/>
        <path d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8 2 4.6 4.3 3 7.5l3.4 2.7c.8-2.5 3-4.3 5.6-4.3z" fill="#EA4335"/>
      </svg>
    `,
  },
  {
    id: 'oneplus',
    name: 'OnePlus',
    count: 32,
    href: 'brand.html?id=oneplus',
    svg: `
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2 3 12h4v9h4V15h2v6h4v-9h4L12 2zm0 3.7 4.7 5.3H15v9h-.01v-6h-2.5v6h-3.5v-9H6.8L12 5.7z"/>
      </svg>
    `,
  },
  {
    id: 'honor',
    name: 'Honor',
    count: 56,
    href: 'brand.html?id=honor',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2 4 5v8c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V5l-8-3z"/>
        <path d="M9 10v4M15 10v4M9 12h6"/>
      </svg>
    `,
  },
  {
    id: 'nothing',
    name: 'Nothing',
    count: 24,
    href: 'brand.html?id=nothing',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="9" cy="12" r="3.5"/>
        <circle cx="15" cy="12" r="3.5"/>
      </svg>
    `,
  },
  {
    id: 'motorola',
    name: 'Motorola',
    count: 18,
    href: 'brand.html?id=motorola',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M8 6a5 5 0 0 0 0 12h8a5 5 0 0 0 0-12H8z"/>
        <path d="M8 9h8"/>
      </svg>
    `,
  },
  {
    id: 'realme',
    name: 'Realme',
    count: 42,
    href: 'brand.html?id=realme',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 18V6h7a4 4 0 0 1 0 8H4"/>
        <path d="M11 14l6 4"/>
      </svg>
    `,
  },
  {
    id: 'huawei',
    name: 'Huawei',
    count: 36,
    href: 'brand.html?id=huawei',
    svg: `
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2 8 7l4-2 4 2-4-5zm-6 7L2 14l4-2 4 2-4-5zm12 0-4 5 4-2 4 2-4-5zm-6-1-3 5 3-1.5 3 1.5-3-5zm0 7-3 5 3-1.5 3 1.5-3-5z"/>
      </svg>
    `,
  },
];