/* ============================================
   STORY — Phase 4
   Storytelling Pages Enhancement
   ============================================ */

/* ============================================
   1. TIMELINE REVEAL (About)
   ============================================ */

export function initTimelineReveal() {
  const timelines = document.querySelectorAll('.timeline-roadmap');
  if (!timelines.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  timelines.forEach((t) => observer.observe(t));
}

/* ============================================
   2. TEAM CARD HOVER (About)
   ============================================ */

export function initTeamCards() {
  const cards = document.querySelectorAll('.team-card');
  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      const avatar = card.querySelector('.team-card__avatar');
      if (!avatar) return;

      avatar.animate(
        [
          { transform: 'scale(1.1) rotate(-5deg)' },
          { transform: 'scale(1.15) rotate(5deg)' },
          { transform: 'scale(1.1) rotate(-5deg)' },
        ],
        { duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
      );
    });
  });
}

/* ============================================
   3. ARTICLE SCROLL-SYNC
   ============================================ */

export function initArticleScrollSync() {
  const body = document.querySelector('.article-body');
  const toc = document.querySelector('.article-toc__nav');
  if (!body || !toc) return;

  const headings = body.querySelectorAll('h2[id]');
  if (!headings.length) return;

  const links = toc.querySelectorAll('.article-toc__link');

  const updateActive = () => {
    let current = '';
    headings.forEach((h) => {
      const rect = h.getBoundingClientRect();
      if (rect.top <= 140) current = h.id;
    });

    headings.forEach((h) => {
      h.classList.toggle('is-active', h.id === current);
    });

    links.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.tocTarget === current);
    });
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
    }
  }, { passive: true });

  updateActive();
}

/* ============================================
   4. FLOATING LABELS FORM
   ============================================ */

export function initFloatingLabels() {
  const fields = document.querySelectorAll('.contact-form .form-field');
  fields.forEach((field) => {
    if (field.classList.contains('form-field--float')) return;

    const input = field.querySelector('.form-field__input, .form-field__textarea, .form-field__select');
    if (!input) return;

    // Skip select (has default value)
    if (input.tagName === 'SELECT') return;

    field.classList.add('form-field--float');

    // Make sure placeholder is set (even to space)
    if (!input.hasAttribute('placeholder') || input.placeholder === '') {
      input.setAttribute('placeholder', ' ');
    }
  });
}

/* ============================================
   5. 404 PARTICLES
   ============================================ */

export function init404Particles() {
  const page = document.querySelector('.err-page');
  if (!page) return;

  // Already initialized?
  if (page.querySelector('.err-particles')) return;

  const wrap = document.createElement('div');
  wrap.className = 'err-particles';
  wrap.setAttribute('aria-hidden', 'true');

  const colors = ['#2386D7', '#16B5A5', '#7C5CFF', '#F59E0B'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'err-particle';
    p.style.left = `${Math.random() * 100}%`;
    p.style.bottom = `${-50 - Math.random() * 200}px`;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = `${8 + Math.random() * 8}s`;
    p.style.animationDelay = `${Math.random() * 6}s`;
    p.style.setProperty('--drift', `${(Math.random() - 0.5) * 100}px`);
    p.style.width = p.style.height = `${4 + Math.random() * 8}px`;

    wrap.appendChild(p);
  }

  page.insertBefore(wrap, page.firstChild);

  // Interactive parallax
  const errCode = document.querySelector('.err-code');
  if (errCode) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      errCode.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }
}

/* ============================================
   6. SUCCESS TIMELINE REVEAL
   ============================================ */

export function initSuccessTimeline() {
  const timeline = document.querySelector('.success-timeline');
  if (!timeline) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(timeline);
}

/* ============================================
   7. STORY IMAGE FADE
   ============================================ */

export function initStoryImageFade() {
  const images = document.querySelectorAll('.story-img-fade');
  if (!images.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  images.forEach((img) => observer.observe(img));
}

/* ============================================
   8. STORY HERO PARALLAX
   ============================================ */

export function initStoryHeroParallax() {
  const heroes = document.querySelectorAll('.story-hero');
  if (!heroes.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;

    heroes.forEach((hero) => {
      const rect = hero.getBoundingClientRect();
      const viewportH = window.innerHeight;

      // Only when in viewport
      if (rect.bottom < 0 || rect.top > viewportH) return;

      const progress = -rect.top / viewportH;
      const bg = hero.querySelector('.story-hero__bg');

      if (bg) {
        bg.style.transform = `translate3d(0, ${progress * 80}px, 0)`;
      }
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}

/* ============================================
   9. ABOUT PAGE HERO COUNTERS
   ============================================ */

export function initAboutCounters() {
  const counters = document.querySelectorAll('.about-hero__stat-value .counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = Number(el.dataset.count) || 0;
        const duration = 1800;
        const start = performance.now();
        const suffix = el.parentElement?.querySelector('span:last-child')?.textContent || '';

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          const value = Math.floor(target * eased);
          el.textContent = value.toLocaleString('fa-IR');

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = target.toLocaleString('fa-IR');
          }
        };

        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((c) => observer.observe(c));
}

/* ============================================
   10. BRAND PAGE HERO ANIMATION
   ============================================ */

export function initBrandHero() {
  const hero = document.querySelector('.brand-hero');
  if (!hero) return;

  const logo = hero.querySelector('.brand-hero__logo');
  const name = hero.querySelector('.brand-hero__name');
  const tagline = hero.querySelector('.brand-hero__tagline');

  // Entrance animation
  const timeline = [
    { el: logo, delay: 0 },
    { el: name, delay: 150 },
    { el: tagline, delay: 300 },
  ];

  timeline.forEach(({ el, delay }) => {
    if (!el) return;

    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 30px, 0)';

    setTimeout(() => {
      el.style.transition = 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.opacity = '1';
      el.style.transform = 'translate3d(0, 0, 0)';
    }, delay);
  });

  // Mouse-follow glow
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    hero.style.setProperty('--mouse-x', `${x}%`);
    hero.style.setProperty('--mouse-y', `${y}%`);
  });
}

/* ============================================
   11. INIT ALL
   ============================================ */

export function initStory() {
  initTimelineReveal();
  initTeamCards();
  initArticleScrollSync();
  initFloatingLabels();
  init404Particles();
  initSuccessTimeline();
  initStoryImageFade();
  initStoryHeroParallax();
  initAboutCounters();
  initBrandHero();

  console.log('%c✓ Story initialized (Phase 4)', 'color:#18B981;font-weight:bold;');
}