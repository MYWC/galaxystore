/* ============================================
   SEO UTILITIES
   Meta Tags + JSON-LD + Canonical
   ============================================ */

/* ============================================
   CONSTANTS
   ============================================ */

export const SITE_URL = 'https://mywc.github.io/galaxystore';

export const SITE_INFO = {
  name: 'موبایل استور',
  nameEn: 'Mobile Store',
  description: 'فروشگاه تخصصی موبایل و تبلت با ۱۰ برند معتبر جهانی، ضمانت اصالت کالا و ارسال سریع به سراسر کشور.',
  phone: '+989362582236',
  email: 'info@mobilestore.ir',
  logo: `${SITE_URL}/assets/images/logo.png`,
  defaultImage: `${SITE_URL}/assets/images/og-default.jpg`,
  address: {
    country: 'IR',
    region: 'تهران',
    city: 'تهران',
    street: 'خیابان ولیعصر، پلاک ۱۲۳۴',
    postalCode: '1234567890',
  },
};

/* ============================================
   META TAG HELPERS
   ============================================ */

function upsertMeta(attr, key, value) {
  if (!value) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

/**
 * تنظیم meta name
 */
export function setMeta(name, content) {
  upsertMeta('name', name, content);
}

/**
 * تنظیم meta property (Open Graph)
 */
export function setProperty(property, content) {
  upsertMeta('property', property, content);
}

/**
 * تنظیم canonical link
 */
export function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

/* ============================================
   PAGE META — برای هر صفحه
   ============================================ */

/**
 * تنظیم meta کامل یک صفحه
 */
export function setPageMeta({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
} = {}) {
  if (title) {
    document.title = title;
    setProperty('og:title', title);
    setMeta('twitter:title', title);
  }

  if (description) {
    setMeta('description', description);
    setProperty('og:description', description);
    setMeta('twitter:description', description);
  }

  const finalImage = image || SITE_INFO.defaultImage;
  setProperty('og:image', finalImage);
  setMeta('twitter:image', finalImage);
  setMeta('twitter:card', 'summary_large_image');

  const finalUrl = url || (SITE_URL + window.location.pathname);
  setProperty('og:url', finalUrl);
  setCanonical(finalUrl);

  setProperty('og:type', type);
  setProperty('og:site_name', SITE_INFO.name);
  setProperty('og:locale', 'fa_IR');

  if (publishedTime) setProperty('article:published_time', publishedTime);
  if (modifiedTime) setProperty('article:modified_time', modifiedTime);
  if (author) setProperty('article:author', author);
}

/* ============================================
   JSON-LD — Structured Data
   ============================================ */

/**
 * تزریق JSON-LD
 */
export function injectJSONLD(id, data) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/* ============================================
   ORGANIZATION + WEBSITE SCHEMA
   ============================================ */

export function injectSiteSchema() {
  // Organization
  injectJSONLD('ld-organization', {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_INFO.name,
    alternateName: SITE_INFO.nameEn,
    url: SITE_URL,
    logo: SITE_INFO.logo,
    description: SITE_INFO.description,
    telephone: SITE_INFO.phone,
    email: SITE_INFO.email,
    address: {
      '@type': 'PostalAddress',
      addressCountry: SITE_INFO.address.country,
      addressRegion: SITE_INFO.address.region,
      addressLocality: SITE_INFO.address.city,
      streetAddress: SITE_INFO.address.street,
      postalCode: SITE_INFO.address.postalCode,
    },
    sameAs: [
      'https://instagram.com/mobilestore',
      'https://t.me/mobilestore',
    ],
  });

  // WebSite + SearchAction
  injectJSONLD('ld-website', {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_INFO.name,
    url: SITE_URL,
    inLanguage: 'fa-IR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search.html?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  });
}

/* ============================================
   PRODUCT SCHEMA
   ============================================ */

export function injectProductSchema(product, price) {
  const url = `${SITE_URL}/product.html?id=${product.id}`;

  injectJSONLD('ld-product', {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `خرید ${product.name} با ضمانت اصالت و ارسال سریع`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    category: product.category,
    image: product.image || `${SITE_URL}/assets/images/products/${product.id}.jpg`,
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'IRR',
      price: price,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_INFO.name,
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    aggregateRating: product.reviews > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviews,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  });
}

/* ============================================
   ARTICLE SCHEMA
   ============================================ */

export function injectArticleSchema(article) {
  const url = `${SITE_URL}/magazine/article.html?id=${article.id}`;

  injectJSONLD('ld-article', {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.desc,
    image: article.image || SITE_INFO.defaultImage,
    datePublished: article.dateRaw,
    dateModified: article.dateRaw,
    author: {
      '@type': 'Organization',
      name: 'تیم موبایل استور',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_INFO.name,
      logo: {
        '@type': 'ImageObject',
        url: SITE_INFO.logo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: article.tag,
    inLanguage: 'fa-IR',
  });

  // Breadcrumb
  injectJSONLD('ld-breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'خانه', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'مجله', item: `${SITE_URL}/magazine/index.html` },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  });
}

/* ============================================
   BREADCRUMB SCHEMA
   ============================================ */

export function injectBreadcrumbSchema(items) {
  injectJSONLD('ld-breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}