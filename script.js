// ==========================================================
//  ADHA RAFI NURFAIZ — Portfolio JS
//  Preloader, animations, custom cursor, counters, reveals
// ==========================================================

(function () {
  'use strict';

  // ===== SPIDER WEB PRELOADER =====
  const canvas = document.getElementById('spider-web-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const spiderWrapper = document.getElementById('spider-wrapper');
  const spiderSilk = document.getElementById('spider-silk');
  const preloaderName = document.getElementById('preloader-name');
  const preloaderFill = document.getElementById('preloader-fill');

  // Web drawing state
  let webProgress = 0; // 0 to 1
  let spiderDescended = false;
  let webDrawn = false;
  const WEB_DURATION = 1800; // ms to draw web
  const SPIDER_DESCEND_DURATION = 800; // ms for spider to come down
  let webStartTime = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  if (canvas) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  // Draw spider web progressively
  function drawWeb(progress) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    // Make web cover most of the viewport
    const maxRadius = Math.max(canvas.width, canvas.height) * 0.62;
    const numRadials = 20;
    const numSpirals = 13;

    // Phase 1: Draw radial lines (0 → 0.4 of progress)
    const radialProgress = Math.min(progress / 0.4, 1);
    const radialsToShow = Math.floor(numRadials * radialProgress);

    for (let i = 0; i < radialsToShow; i++) {
      const angle = (i / numRadials) * Math.PI * 2 - Math.PI / 2;
      const lineLen = maxRadius * (i === radialsToShow - 1 ? (radialProgress * numRadials - i) : 1);
      const ex = cx + Math.cos(angle) * lineLen;
      const ey = cy + Math.sin(angle) * lineLen;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = `rgba(255, ${190 + 65 * Math.sin(i)}, ${190 + 65 * Math.sin(i)}, ${0.08 + 0.06 * Math.sin(i)})`;
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }

    // Phase 2: Draw spiral threads (0.4 → 1.0 of progress)
    if (progress > 0.4) {
      const spiralProgress = Math.min((progress - 0.4) / 0.6, 1);
      const spiralsToShow = Math.floor(numSpirals * spiralProgress);

      for (let s = 1; s <= spiralsToShow + 1; s++) {
        const radius = (s / numSpirals) * maxRadius * 0.96;
        const currentSpiralFraction = (s <= spiralsToShow) ? 1 : (spiralProgress * numSpirals - spiralsToShow);

        ctx.beginPath();
        for (let i = 0; i <= numRadials * currentSpiralFraction; i++) {
          const angle = (i / numRadials) * Math.PI * 2 - Math.PI / 2;
          // Add slight wobble for natural look
          const wobble = Math.sin(i * 3.7 + s * 2.1) * 3.5;
          const r = radius + wobble;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        const redMix = Math.min(s / numSpirals, 1);
        ctx.strokeStyle = `rgba(255, ${Math.floor(230 - 180 * redMix)}, ${Math.floor(230 - 200 * redMix)}, ${0.06 + 0.035 * s})`;
        ctx.lineWidth = 0.85;
        ctx.stroke();
      }
    }

    // Draw subtle glow at center
    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
    glowGrad.addColorStop(0, `rgba(255, 23, 68, ${0.12 * progress})`);
    glowGrad.addColorStop(0.5, `rgba(255, 23, 68, ${0.04 * progress})`);
    glowGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // Draw small dew drops at intersections
    if (progress > 0.7) {
      const dewOpacity = (progress - 0.7) / 0.3;
      for (let s = 2; s <= numSpirals; s += 2) {
        const radius = (s / numSpirals) * maxRadius * 0.96;
        for (let i = 0; i < numRadials; i += 2) {
          const angle = (i / numRadials) * Math.PI * 2 - Math.PI / 2;
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius;

          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 23, 68, ${0.28 * dewOpacity})`;
          ctx.fill();
        }
      }
    }
  }

  // Spider descent animation
  function descendSpider(timestamp) {
    if (!spiderWrapper || !spiderSilk) return;

    if (!spiderWrapper._startTime) spiderWrapper._startTime = timestamp;
    const elapsed = timestamp - spiderWrapper._startTime;
    const progress = Math.min(elapsed / SPIDER_DESCEND_DURATION, 1);

    // Ease out quad
    const eased = 1 - (1 - progress) * (1 - progress);

    const targetY = (window.innerHeight / 2) - 70; // center-ish
    const currentY = -120 + (targetY + 120) * eased;

    spiderWrapper.style.top = currentY + 'px';
    spiderSilk.style.height = (currentY + 40) + 'px';

    if (progress < 1) {
      requestAnimationFrame(descendSpider);
    } else {
      spiderDescended = true;
      spiderWrapper.classList.add('idle');
      // Show name
      if (preloaderName) preloaderName.classList.add('visible');
    }
  }

  // Main web animation loop
  function animateWeb(timestamp) {
    if (!webStartTime) webStartTime = timestamp;
    const elapsed = timestamp - webStartTime;
    webProgress = Math.min(elapsed / WEB_DURATION, 1);

    drawWeb(webProgress);

    // Update progress bar
    if (preloaderFill) {
      preloaderFill.style.width = (webProgress * 100) + '%';
    }

    // Start spider descent at 60% web progress
    if (webProgress >= 0.6 && !spiderWrapper._startTime) {
      requestAnimationFrame(descendSpider);
    }

    if (webProgress < 1) {
      requestAnimationFrame(animateWeb);
    } else {
      webDrawn = true;
    }
  }

  // Start animation
  if (canvas && ctx) {
    requestAnimationFrame(animateWeb);
  }

  function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('done')) {
      preloader.classList.add('done');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 600);
    }
    if (typeof initHeroAnimations === 'function') {
      initHeroAnimations();
    }
  }

  // Click/Tap anywhere to skip preloader immediately
  const preloaderEl = document.getElementById('preloader');
  if (preloaderEl) {
    preloaderEl.addEventListener('click', hidePreloader);
    preloaderEl.addEventListener('touchstart', hidePreloader, { passive: true });
  }

  // Hide preloader once web and spider finish
  const checkReady = setInterval(() => {
    if (webDrawn && spiderDescended) {
      clearInterval(checkReady);
      setTimeout(hidePreloader, 400);
    }
  }, 100);

  // Absolute safety timeout: allow full spider animation to complete (~2.6s), then dismiss
  setTimeout(() => {
    clearInterval(checkReady);
    hidePreloader();
  }, 3000);

  // ===== CUSTOM CURSOR (Desktop Only) =====
  if (window.innerWidth > 768) {
    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursor-dot');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      if (cursor && dot) {
        cursorX += (mouseX - cursorX) * 0.12;
        cursorY += (mouseY - cursorY) * 0.12;
        dotX += (mouseX - dotX) * 0.25;
        dotY += (mouseY - dotY) * 0.25;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        dot.style.left = dotX + 'px';
        dot.style.top = dotY + 'px';
      }
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverTargets = document.querySelectorAll('a, button, .service-card, .project-card, .skill-icon-box, .hobby-item, .testimonial-card, .skill-tag, .social-circle, .achievement-card');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hover'));
    });
  }

  // ===== NAVBAR & MOBILE MENU =====
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }
  });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    document.querySelectorAll('.nav-links a:not(#lang-btn)').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }
  // ===== LANGUAGE SELECTOR (MULTI-LANGUAGE SWITCHER) =====
  const langWrapper = document.getElementById('lang-wrapper');
  const langBtn = document.getElementById('lang-btn');
  const langCurrent = document.getElementById('lang-current');
  const langSearch = document.getElementById('lang-search');
  const langOptions = document.querySelectorAll('.lang-option');

  if (langBtn && langWrapper) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langWrapper.classList.toggle('open');
      if (langWrapper.classList.contains('open') && langSearch) {
        langSearch.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!langWrapper.contains(e.target)) {
        langWrapper.classList.remove('open');
      }
    });

    if (langSearch) {
      langSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        langOptions.forEach(opt => {
          const text = opt.textContent.toLowerCase();
          opt.style.display = text.includes(query) ? 'flex' : 'none';
        });
      });
    }

    function applyLanguage(langCode, labelText) {
      if (langCurrent) {
        langCurrent.textContent = labelText || langCode.toUpperCase();
      }

      langOptions.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === langCode);
      });

      localStorage.setItem('selected_lang', langCode);

      // Set cookie for Google Translate
      if (langCode === 'id') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=' + window.location.hostname + '; path=/;';
      } else {
        document.cookie = 'googtrans=/id/' + langCode + '; path=/;';
        document.cookie = 'googtrans=/id/' + langCode + '; domain=' + window.location.hostname + '; path=/;';
      }

      // Trigger Google Translate select element
      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
      }
    }

    langOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const code = opt.dataset.lang;
        const codeDisplay = code.split('-')[0].toUpperCase();
        applyLanguage(code, codeDisplay);
        langWrapper.classList.remove('open');
      });
    });

    // Check saved language on load
    const savedLang = localStorage.getItem('selected_lang');
    if (savedLang && savedLang !== 'id') {
      const match = document.querySelector(`.lang-option[data-lang="${savedLang}"]`);
      if (match) {
        const codeDisplay = savedLang.split('-')[0].toUpperCase();
        if (langCurrent) langCurrent.textContent = codeDisplay;
        langOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.lang === savedLang));
      }
    }

    // Keep page body at top 0 and suppress Google Translate banner
    const cleanGoogleBanner = () => {
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
      if (document.body.style.position && document.body.style.position !== 'static') {
        document.body.style.position = 'static';
      }
      const banner = document.querySelector('.goog-te-banner-frame, iframe[id*="container"]');
      if (banner) {
        banner.style.display = 'none';
      }
    };

    setInterval(cleanGoogleBanner, 300);
    const bodyObserver = new MutationObserver(cleanGoogleBanner);
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] });
  }

  // ===== HERO ANIMATIONS =====
  let heroAnimated = false;
  function initHeroAnimations() {
    if (heroAnimated) return;
    heroAnimated = true;

    // Reveal Eyebrow badge
    const eyebrow = document.getElementById('hero-eyebrow');
    if (eyebrow) {
      setTimeout(() => eyebrow.classList.add('visible'), 100);
    }

    // Reveal PORTFOLIO Letters with smooth stagger
    const letters = document.querySelectorAll('.hero-letter');
    if (letters.length > 0) {
      letters.forEach((l, i) => {
        setTimeout(() => l.classList.add('visible'), 200 + i * 65);
      });
    }

    // Fallback for .hero-title .word
    const words = document.querySelectorAll('.hero-title .word');
    words.forEach((w, i) => {
      setTimeout(() => w.classList.add('visible'), i * 150);
    });

    // Reveal typing wrap
    const typingWrap = document.getElementById('hero-typing-wrap');
    if (typingWrap) {
      setTimeout(() => typingWrap.classList.add('visible'), 600);
    }

    // Interactive magnetic wave on hover over PORTFOLIO letters
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle && letters.length > 0) {
      heroTitle.addEventListener('mousemove', (e) => {
        const rect = heroTitle.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        letters.forEach((letter) => {
          const lRect = letter.getBoundingClientRect();
          const letterCenterX = lRect.left + lRect.width / 2 - rect.left;
          const dist = Math.abs(mouseX - letterCenterX);
          const maxDist = 120;
          if (dist < maxDist) {
            const power = (1 - dist / maxDist);
            const offsetY = -10 * power;
            const scale = 1 + 0.12 * power;
            const rot = (mouseX > letterCenterX ? -3 : 3) * power;
            letter.style.transform = `translateY(${offsetY}px) scale(${scale}) rotate(${rot}deg)`;
          } else {
            letter.style.transform = '';
          }
        });
      });

      heroTitle.addEventListener('mouseleave', () => {
        letters.forEach((letter) => {
          letter.style.transform = '';
        });
      });
    }

    animateHeroBgText();

    const socials = document.querySelectorAll('.hero-social-link');
    socials.forEach((s, i) => {
      s.style.opacity = '0';
      s.style.transform = 'translateX(-20px)';
      s.style.transition = `all 0.6s ease ${0.35 + i * 0.12}s`;
      setTimeout(() => {
        s.style.opacity = '1';
        s.style.transform = 'translateX(0)';
      }, 50);
    });

    const quote = document.getElementById('hero-quote');
    if (quote) {
      quote.style.opacity = '0';
      quote.style.transform = 'translateY(20px)';
      quote.style.transition = 'all 0.8s ease 0.5s';
      setTimeout(() => {
        quote.style.opacity = '1';
        quote.style.transform = 'translateY(0)';
      }, 50);
    }
  }

  // Automatic triggers for hero animations
  setTimeout(initHeroAnimations, 1200);
  window.addEventListener('load', () => setTimeout(initHeroAnimations, 300));

  // Hero BG text parallax on scroll
  function animateHeroBgText() {
    const lines = [
      document.getElementById('hero-line-1'),
      document.getElementById('hero-line-2'),
      document.getElementById('hero-line-3'),
      document.getElementById('hero-line-4'),
    ];

    const speeds = [0.3, -0.2, 0.15, -0.1];

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      lines.forEach((line, i) => {
        if (line) {
          const offset = scrollY * speeds[i];
          line.style.transform = `translateX(${offset}px)`;
        }
      });
    });
  }

  // Hero Image Parallax
  window.addEventListener('scroll', () => {
    const heroImg = document.getElementById('hero-img');
    if (heroImg && window.innerWidth > 768) {
      const scrolled = window.scrollY;
      const heroRect = heroImg.getBoundingClientRect();
      if (heroRect.bottom > 0) {
        heroImg.style.transform = `translateY(${scrolled * 0.08}px) scale(${1 + scrolled * 0.0002})`;
      }
    }
  });

  // ===== SCROLL OBSERVERS =====
  function createScrollObserver(selector, options = {}) {
    const threshold = options.threshold || 0.15;
    const rootMargin = options.rootMargin || '0px 0px -50px 0px';

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (!options.repeat) {
            observer.unobserve(entry.target);
          }
        }
      });
    }, { threshold, rootMargin });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
  }

  createScrollObserver('.anim-fade-up');
  createScrollObserver('.anim-fade-left');
  createScrollObserver('.anim-fade-right');
  createScrollObserver('.anim-scale');
  createScrollObserver('.stagger-children');
  createScrollObserver('.timeline-item');

  // ===== STATS COUNTER ANIMATION =====
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(target * eased);

      el.textContent = current + '+';

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + '+';
      }
    }

    requestAnimationFrame(update);
  }

  const statsGrid = document.getElementById('stats-grid');
  if (statsGrid) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('.stat-number');
          counters.forEach((c, i) => {
            setTimeout(() => animateCounter(c), i * 150);
          });
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    counterObserver.observe(statsGrid);
  }

  // ===== CODING SKILL BARS =====
  const codingBars = document.getElementById('coding-bars');
  if (codingBars) {
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fills = entry.target.querySelectorAll('.coding-fill');
          fills.forEach((fill, i) => {
            setTimeout(() => {
              fill.style.width = fill.dataset.width;
            }, i * 120);
          });
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    barObserver.observe(codingBars);
  }

  // ===== PORTFOLIO TITLE LETTER HOVER RIPPLE =====
  const portfolioTitle = document.getElementById('portfolio-title');
  if (portfolioTitle) {
    const chars = portfolioTitle.querySelectorAll('.char');
    chars.forEach((char, index) => {
      char.addEventListener('mouseenter', () => {
        // Ripple adjacent letters
        if (chars[index - 1]) {
          chars[index - 1].style.transform = 'translateY(-6px) scale(1.1)';
          setTimeout(() => { chars[index - 1].style.transform = ''; }, 250);
        }
        if (chars[index + 1]) {
          chars[index + 1].style.transform = 'translateY(-6px) scale(1.1)';
          setTimeout(() => { chars[index + 1].style.transform = ''; }, 250);
        }
      });
    });
  }

  // ===== PROJECT CATEGORY FILTERS =====
  const filterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.blueprint-card-wrapper');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden-filter');
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.classList.add('hidden-filter');
        }
      });
    });
  });

  // ===== ACHIEVEMENTS CATEGORY FILTERS =====
  const achieveFilterBtns = document.querySelectorAll('.achieve-filter-btn');
  const achieveCards = document.querySelectorAll('.achievements-grid .achievement-card');

  achieveFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      achieveFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      achieveCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.transition = 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ===== ACHIEVEMENTS LIGHTBOX MODAL =====
  const achieveLightbox = document.getElementById('achieve-lightbox');
  const openAchieveLightboxBtn = document.getElementById('open-achieve-lightbox');
  const achieveMediaBox = document.getElementById('achieve-media-box');
  const closeAchieveLightboxBtn = document.getElementById('achieve-lightbox-close');

  function openAchieveModal() {
    if (!achieveLightbox) return;
    achieveLightbox.classList.add('show');
    achieveLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeAchieveModal() {
    if (!achieveLightbox) return;
    achieveLightbox.classList.remove('show');
    achieveLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openAchieveLightboxBtn) openAchieveLightboxBtn.addEventListener('click', openAchieveModal);
  if (achieveMediaBox) achieveMediaBox.addEventListener('click', openAchieveModal);
  if (closeAchieveLightboxBtn) closeAchieveLightboxBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAchieveModal();
  });
  if (achieveLightbox) {
    achieveLightbox.addEventListener('click', (e) => {
      if (e.target === achieveLightbox) closeAchieveModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && achieveLightbox && achieveLightbox.classList.contains('show')) {
      closeAchieveModal();
    }
  });

  // ===== TILT EFFECT ON BLUEPRINT PROJECT CARDS =====
  if (window.innerWidth > 768) {
    document.querySelectorAll('.project-showcase-card, .achievement-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -3;
        const rotateY = (x - centerX) / centerX * 3;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        card.style.transition = 'transform 0.5s ease, box-shadow 0.4s ease';
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
      });
    });

    // ===== 3D HOLOGRAM TILT & GLARE FOR HERO & ABOUT PHOTO =====
    const setupPhotoTilt = (wrapperId, cardSelector, glareSelector) => {
      const wrapper = document.getElementById(wrapperId);
      if (!wrapper) return;
      const card = wrapper.querySelector(cardSelector);
      const glare = wrapper.querySelector(glareSelector);
      if (!card) return;

      wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

        if (glare) {
          const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
          glare.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0.4) 0%, transparent 60%)`;
          glare.style.opacity = '0.8';
        }
      });

      wrapper.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        if (glare) {
          glare.style.opacity = '0.4';
          glare.style.transition = 'opacity 0.6s ease';
        }
      });

      wrapper.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
        if (glare) glare.style.transition = 'none';
      });
    };

    setupPhotoTilt('hero-interactive-card', '.hero-card-3d', '.hero-lens-glare');
    setupPhotoTilt('about-interactive-card', '.about-photo-frame', '.about-lens-glare');
  }

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ===== TYPING EFFECT IN HERO =====
  function initTypeEffect() {
    const subtexts = [
      'Siswa SMK Telkom Purwokerto',
      'Jurusan PPLG',
      'Frontend & Web Developer',
      'UI/UX Enthusiast'
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typingTarget = document.getElementById('hero-typing-text');
    if (typingTarget) {
      function type() {
        const currentText = subtexts[textIndex];
        if (isDeleting) {
          charIndex--;
        } else {
          charIndex++;
        }

        typingTarget.textContent = currentText.substring(0, charIndex);

        let speed = isDeleting ? 30 : 65;

        if (!isDeleting && charIndex === currentText.length) {
          speed = 2200;
          isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
          isDeleting = false;
          textIndex = (textIndex + 1) % subtexts.length;
          speed = 400;
        }

        setTimeout(type, speed);
      }

      setTimeout(type, 1000);
      return;
    }

    const heroRight = document.querySelector('.hero-right');
    if (heroRight) {
      const typingEl = document.createElement('div');
      typingEl.style.cssText = `
        font-family: 'JetBrains Mono', monospace;
        font-size: 1rem;
        color: rgba(255,255,255,0.7);
        margin-bottom: 20px;
        min-height: 28px;
      `;
      typingEl.innerHTML = '<span class="typing-cursor" style="border-right: 2px solid #DDDDDD; padding-right: 2px;">‎</span>';
      heroRight.insertBefore(typingEl, document.querySelector('.hero-socials'));

      function typeFallback() {
        const currentText = subtexts[textIndex];
        if (isDeleting) {
          charIndex--;
        } else {
          charIndex++;
        }

        const display = currentText.substring(0, charIndex);
        typingEl.innerHTML = `> ${display}<span style="border-right: 2px solid #DDDDDD; padding-right: 2px; animation: blink 0.7s infinite;">‎</span>`;

        let speed = isDeleting ? 35 : 75;

        if (!isDeleting && charIndex === currentText.length) {
          speed = 2000;
          isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
          isDeleting = false;
          textIndex = (textIndex + 1) % subtexts.length;
          speed = 400;
        }

        setTimeout(typeFallback, speed);
      }

      // Add blink animation style
      const blinkStyle = document.createElement('style');
      blinkStyle.textContent = '@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }';
      document.head.appendChild(blinkStyle);

      setTimeout(typeFallback, 1200);
    }
  }
  initTypeEffect();

  // --- SHARED FIREBASE CONFIGURATION ---
  const firebaseConfig = {
    apiKey: "AIzaSyDgKukalNyaze2DuvseEvdtLssJ26cIXQI",
    authDomain: "portofoliorafi-e36ca.firebaseapp.com",
    databaseURL: "https://portofoliorafi-e36ca-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "portofoliorafi-e36ca",
    storageBucket: "portofoliorafi-e36ca.firebasestorage.app",
    messagingSenderId: "762905359847",
    appId: "1:762905359847:web:d7d65f4ec7a932348bf942",
    measurementId: "G-TKM46KHW3H"
  };

  // Helper to safely get or initialize Firebase Database
  function getFirebaseDb() {
    try {
      if (window.firebase && firebaseConfig.apiKey !== "AIzaSyDemoKeyForAdhaRafiPortfolioGuestbook") {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        return firebase.database();
      }
    } catch (err) {
      console.warn("Firebase connection note:", err);
    }
    return null;
  }

  // ===== CONTACT FORM INTEGRATION (EMAIL, FIREBASE & WHATSAPP) =====
  const WEB3FORMS_ACCESS_KEY = "b703b213-845c-4e02-a2c8-ed5053222bdb";

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-send');
      const status = document.getElementById('form-status');
      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const subjectInput = document.getElementById('form-subject');
      const msgInput = document.getElementById('form-message');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const subject = (subjectInput && subjectInput.value.trim()) ? subjectInput.value.trim() : 'Pesan Baru dari Website Portfolio';
      const message = msgInput ? msgInput.value.trim() : '';

      if (!name || !email || !message) {
        if (status) {
          status.className = 'form-status error';
          status.innerHTML = '⚠️ Mohon lengkapi nama, email, dan pesan Anda.';
        }
        return;
      }

      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<span>Mengirim ke Email...</span>';
      btn.disabled = true;

      // 1. Simpan ke Firebase Realtime Database
      const contactPayload = {
        name: name,
        email: email,
        subject: subject,
        message: message,
        timestamp: Date.now(),
        dateFormatted: new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })
      };

      try {
        const db = getFirebaseDb();
        if (db) {
          await db.ref('contact_messages').push(contactPayload);
        }
      } catch (err) {
        console.warn('Firebase contact save note:', err);
      }

      // 2. Backup ke LocalStorage
      try {
        const localInbox = JSON.parse(localStorage.getItem('rafikuy_contact_inbox') || '[]');
        localInbox.unshift(contactPayload);
        localStorage.setItem('rafikuy_contact_inbox', JSON.stringify(localInbox.slice(0, 50)));
      } catch (e) {}

      // 3. Kirim Otomatis ke Email (Web3Forms API)
      let emailSuccess = false;
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            name: name,
            email: email,
            subject: `[Portfolio] ${subject} - dari ${name}`,
            message: message,
            from_name: `${name} (Portfolio Website)`
          })
        });
        const result = await res.json();
        if (result.success) {
          emailSuccess = true;
        }
      } catch (err) {
        console.warn("Web3Forms email delivery error:", err);
      }

      // 4. Update UI Status & Tombol
      btn.classList.add('btn-success-state');
      btn.innerHTML = '✓ Pesan Terkirim!';
      
      if (status) {
        status.className = 'form-status success';
        if (emailSuccess) {
          status.innerHTML = '✓ Terima kasih! Pesan Anda telah berhasil terkirim langsung ke inbox Email Rafi.';
        } else {
          status.innerHTML = '✓ Pesan Anda telah berhasil dikirim & disimpan!';
        }
      }

      // 5. Reset form
      contactForm.reset();
      showSiteToast('Terima kasih! Pesan Anda telah berhasil terkirim.', 'success');

      // 6. Kembalikan state tombol setelah 6 detik
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('btn-success-state');
        btn.disabled = false;
        if (status) {
          status.innerHTML = '';
          status.className = 'form-status';
        }
      }, 6000);
    });
  }

  // ===== SCROLL PROGRESS BAR =====
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #DDDDDD, #656363, #2F2E2E);
    z-index: 99999;
    transition: width 0.1s linear;
    width: 0%;
    border-radius: 0 2px 2px 0;
  `;
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const progress = (scrollTop / docHeight) * 100;
      progressBar.style.width = progress + '%';
    }
  });

  // ===== GLOBAL TOAST NOTIFICATION HELPER =====
  let siteToastTimer = null;
  function showSiteToast(message, type = 'success', duration = 3500) {
    const toast = document.getElementById('site-toast');
    const toastMsg = document.getElementById('site-toast-message');
    const toastIcon = document.getElementById('site-toast-icon');
    if (!toast) return;

    if (toastMsg) toastMsg.textContent = message;
    if (toastIcon) {
      toastIcon.textContent = type === 'error' ? '✕' : '✓';
    }

    toast.className = `site-toast show ${type}`;

    if (siteToastTimer) clearTimeout(siteToastTimer);
    siteToastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);

    toast.onclick = () => {
      toast.classList.remove('show');
      if (siteToastTimer) clearTimeout(siteToastTimer);
    };
  }

  // ===== DYNAMIC REAL-TIME TESTIMONIALS WITH FIREBASE & DUAL-TRACK MARQUEE =====
  (function initTestimonials() {
    const testiForm = document.getElementById('testi-form');
    const testiNameInput = document.getElementById('testi-name');
    const testiRoleInput = document.getElementById('testi-role');
    const testiMsgInput = document.getElementById('testi-message');
    const testiRatingInput = document.getElementById('testi-rating');
    const testiSubmitBtn = document.getElementById('testi-submit-btn');
    const testiStatus = document.getElementById('testi-status');
    const starRating = document.getElementById('star-rating');
    const ratingText = document.getElementById('rating-text');
    const chips = document.querySelectorAll('.testi-chip');

    // Stats & View Toggle Elements
    const testiAvgRating = document.getElementById('testi-avg-rating');
    const testiTotalCount = document.getElementById('testi-total-count');
    const testiBtnMarquee = document.getElementById('testi-btn-marquee');
    const testiBtnGrid = document.getElementById('testi-btn-grid');

    // Marquee & Grid Containers
    const marqueeWrapper = document.getElementById('testimonials-marquee-wrapper');
    const group1a = document.getElementById('testi-group-1a');
    const group1b = document.getElementById('testi-group-1b');
    const group2a = document.getElementById('testi-group-2a');
    const group2b = document.getElementById('testi-group-2b');
    const testimonialsGrid = document.getElementById('testimonials-grid');

    if (!marqueeWrapper && !testimonialsGrid) return;

    // --- Star Rating Selector Logic ---
    const RATING_LABELS = {
      1: '1.0 (Kurang Memuaskan 🙁)',
      2: '2.0 (Bisa Ditingkatkan 😐)',
      3: '3.0 (Cukup Baik 🙂)',
      4: '4.0 (Bagus Banget! 👍)',
      5: '5.0 (Sempurna! 🌟)'
    };

    if (starRating) {
      const stars = starRating.querySelectorAll('.star');

      function updateStars(val) {
        stars.forEach(star => {
          const starVal = parseInt(star.getAttribute('data-value'), 10);
          if (starVal <= val) {
            star.classList.add('active');
          } else {
            star.classList.remove('active');
          }
        });
        if (testiRatingInput) testiRatingInput.value = val;
        if (ratingText) ratingText.textContent = RATING_LABELS[val] || `${val}.0 ★`;
      }

      stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
          const hoverVal = parseInt(star.getAttribute('data-value'), 10);
          stars.forEach(s => {
            const sVal = parseInt(s.getAttribute('data-value'), 10);
            if (sVal <= hoverVal) s.classList.add('active');
            else s.classList.remove('active');
          });
        });

        star.addEventListener('click', () => {
          const clickVal = parseInt(star.getAttribute('data-value'), 10);
          updateStars(clickVal);
        });
      });

      starRating.addEventListener('mouseleave', () => {
        const currentVal = parseInt(testiRatingInput ? testiRatingInput.value : 5, 10);
        updateStars(currentVal);
      });
    }

    // --- Quick Role Chips ---
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (testiRoleInput) {
          testiRoleInput.value = chip.getAttribute('data-role');
        }
      });
    });

    // --- View Toggle Buttons (Marquee vs Grid) ---
    if (testiBtnMarquee && testiBtnGrid) {
      testiBtnMarquee.addEventListener('click', () => {
        testiBtnMarquee.classList.add('active');
        testiBtnGrid.classList.remove('active');
        if (marqueeWrapper) marqueeWrapper.style.display = 'flex';
        if (testimonialsGrid) testimonialsGrid.style.display = 'none';
      });

      testiBtnGrid.addEventListener('click', () => {
        testiBtnGrid.classList.add('active');
        testiBtnMarquee.classList.remove('active');
        if (marqueeWrapper) marqueeWrapper.style.display = 'none';
        if (testimonialsGrid) testimonialsGrid.style.display = 'grid';
      });
    }

    // --- Color classes for avatar initials ---
    const AVATAR_COLORS = ['bg-green', 'bg-orange', 'bg-yellow', 'bg-slate', 'bg-dark'];

    function getAvatarColorClass(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    }

    function formatTimeAgo(timestamp) {
      if (!timestamp) return 'Baru saja';
      const now = Date.now();
      const diff = Math.floor((now - timestamp) / 1000);

      if (diff < 30) return 'Baru saja';
      if (diff < 60) return `${diff}d lalu`;
      const mins = Math.floor(diff / 60);
      if (mins < 60) return `${mins}m lalu`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} jam lalu`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} hari lalu`;
      const months = Math.floor(days / 30);
      if (months < 12) return `${months} bln lalu`;
      return `${Math.floor(months / 12)} thn lalu`;
    }

    function sanitizeHTML(str) {
      const temp = document.createElement('div');
      temp.textContent = str;
      return temp.innerHTML;
    }

    // --- PROFANITY / TOXIC WORDS SHIELD ---
    const TOXIC_WORDS = [
      'anjing', 'babi', 'kontol', 'memek', 'pantek', 'bangsat', 'goblok', 'tolol',
      'itil', 'ngentot', 'asu', 'bajingan', 'kampret', 'perek', 'lonte', 'jembut',
      'pepek', 'titit', 'bego', 'idiot', 'puki', 'tai', 'fuck', 'shit', 'bitch', 'asshole'
    ];

    function containsProfanity(text) {
      if (!text) return false;
      const lower = text.toLowerCase();
      const clean = lower.replace(/[^a-z0-9]/g, '');
      const words = lower.split(/\s+/);
      return TOXIC_WORDS.some(bad => words.includes(bad) || clean.includes(bad));
    }

    function renderStarsString(count) {
      const num = Math.max(1, Math.min(5, parseInt(count || 5, 10)));
      return '★'.repeat(num) + '☆'.repeat(5 - num);
    }

    // Create a Testimonial DOM Card
    function createTestimonialCard(item, isNew = false, isClone = false) {
      const card = document.createElement('div');
      card.className = `testimonial-card ${isNew ? 'new-highlight' : ''}`;
      if (!isClone) {
        card.id = `testi-card-${item.id}`;
      }
      card.setAttribute('data-testi-id', item.id);

      const name = sanitizeHTML(item.name || 'Anonymous');
      const role = sanitizeHTML(item.role || 'Visitor / Teman');
      const text = sanitizeHTML(item.message || '');
      const starsStr = renderStarsString(item.rating || 5);
      const timeStr = formatTimeAgo(item.timestamp || Date.now());

      const initial = name.trim().charAt(0).toUpperCase() || '★';
      const colorClass = getAvatarColorClass(name);

      card.innerHTML = `
        <div class="testimonial-top">
          <div class="testimonial-stars" aria-label="${item.rating || 5} out of 5 stars">${starsStr}</div>
          <span class="testimonial-time" data-ts="${item.timestamp || Date.now()}">${timeStr}</span>
        </div>
        <p class="testimonial-text">"${text}"</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar ${colorClass}">${initial}</div>
          <div class="testimonial-info">
            <h4>${name}</h4>
            <p>${role}</p>
          </div>
        </div>
      `;

      return card;
    }

    // In-memory testimonials state
    let allTestimonials = [];

    // Helper: Ensure track has at least minCount items to prevent gaps on large screens
    function repeatToMinCount(items, min = 4) {
      if (!items || items.length === 0) return [];
      let res = [...items];
      while (res.length < min) {
        res = res.concat(items);
      }
      return res;
    }

    // Master Render Function: updates stats, grid, and dual-row marquee
    function renderAllTestimonialsViews(newHighlightId = null) {
      // Sort newest first
      allTestimonials.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      const count = allTestimonials.length;
      const sum = allTestimonials.reduce((acc, cur) => acc + (parseInt(cur.rating, 10) || 5), 0);
      const avg = count > 0 ? (sum / count).toFixed(1) : '5.0';

      if (testiAvgRating) testiAvgRating.textContent = avg;
      if (testiTotalCount) testiTotalCount.textContent = `${count} Ulasan`;

      // 1. Render Grid View
      if (testimonialsGrid) {
        testimonialsGrid.innerHTML = '';
        allTestimonials.forEach(item => {
          testimonialsGrid.appendChild(createTestimonialCard(item, item.id === newHighlightId, false));
        });
      }

      // 2. Render Dual-Row Marquee Tracks
      if (marqueeWrapper && group1a && group1b && group2a && group2b) {
        let track1Items = [];
        let track2Items = [];

        if (count >= 4) {
          track1Items = allTestimonials.filter((_, idx) => idx % 2 === 0);
          track2Items = allTestimonials.filter((_, idx) => idx % 2 === 1);
        } else {
          track1Items = [...allTestimonials];
          track2Items = [...allTestimonials].reverse();
        }

        const rep1 = repeatToMinCount(track1Items, 4);
        const rep2 = repeatToMinCount(track2Items, 4);

        group1a.innerHTML = '';
        group1b.innerHTML = '';
        group2a.innerHTML = '';
        group2b.innerHTML = '';

        rep1.forEach(item => {
          group1a.appendChild(createTestimonialCard(item, item.id === newHighlightId, false));
          group1b.appendChild(createTestimonialCard(item, item.id === newHighlightId, true));
        });

        rep2.forEach(item => {
          group2a.appendChild(createTestimonialCard(item, item.id === newHighlightId, false));
          group2b.appendChild(createTestimonialCard(item, item.id === newHighlightId, true));
        });
      }

      // Clear highlight after 6s
      if (newHighlightId) {
        setTimeout(() => {
          document.querySelectorAll('.testimonial-card.new-highlight').forEach(el => {
            el.classList.remove('new-highlight');
          });
        }, 6000);
      }
    }

    // Periodically update relative timestamps across all rendered cards
    setInterval(() => {
      const timeElements = document.querySelectorAll('.testimonial-time[data-ts]');
      timeElements.forEach(el => {
        const ts = parseInt(el.getAttribute('data-ts'), 10);
        if (ts) el.textContent = formatTimeAgo(ts);
      });
    }, 60000);

    let isFirebaseActive = false;
    let dbRef = null;

    // --- INITIAL TESTIMONIALS & LOCAL STORAGE FALLBACK ---
    const STORAGE_KEY = 'rafikuy_testimonials_list';
    let localTestimonials = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) localTestimonials = JSON.parse(stored);
    } catch (e) {}

    // Connect to Firebase Realtime Database with 100% Realtime Value Sync
    try {
      const db = getFirebaseDb();
      if (db) {
        dbRef = db.ref('testimonials_messages');
        isFirebaseActive = true;

        // Full realtime sync matching Admin dashboard 1:1
        dbRef.on('value', (snapshot) => {
          const val = snapshot.val();
          const items = [];
          if (val) {
            Object.keys(val).forEach(key => {
              items.push({ id: key, ...val[key] });
            });
          }
          items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          allTestimonials = items;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
          } catch (e) {}
          renderAllTestimonialsViews();
        });
      }
    } catch (err) {
      console.warn("Firebase initialization note (using local storage fallback if needed):", err);
      isFirebaseActive = false;
    }

    // Fallback if Firebase is unavailable
    if (!isFirebaseActive) {
      allTestimonials = Array.isArray(localTestimonials) ? [...localTestimonials] : [];
      renderAllTestimonialsViews();
    }

    // --- FORM SUBMISSION ---
    if (testiForm) {
      testiForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = (testiNameInput ? testiNameInput.value : '').trim();
        const role = (testiRoleInput ? testiRoleInput.value : '').trim() || 'Teman / Rekan';
        const message = (testiMsgInput ? testiMsgInput.value : '').trim();
        const rating = parseInt(testiRatingInput ? testiRatingInput.value : '5', 10) || 5;

        if (!name || !message) {
          if (testiStatus) {
            testiStatus.className = 'testi-status error';
            testiStatus.textContent = 'Harap isi nama dan testimoni kamu!';
          }
          return;
        }

        // Automatic Profanity / Toxic Words Filter
        if (containsProfanity(name) || containsProfanity(message)) {
          if (testiStatus) {
            testiStatus.className = 'testi-status error';
            testiStatus.textContent = 'Eits! Ulasan kamu mengandung kata yang kurang sopan. Yuk gunakan kata yang positif! 😊';
          }
          return;
        }

        // Rate limit check (max 1 message per 15 seconds)
        const LAST_POST_KEY = 'testi_last_post_time';
        const lastPost = parseInt(localStorage.getItem(LAST_POST_KEY) || '0', 10);
        const now = Date.now();
        if (now - lastPost < 15000) {
          const waitSec = Math.ceil((15000 - (now - lastPost)) / 1000);
          if (testiStatus) {
            testiStatus.className = 'testi-status error';
            testiStatus.textContent = `Tunggu ${waitSec} detik lagi sebelum kirim ulasan baru ya!`;
          }
          return;
        }

        // Button loading state
        if (testiSubmitBtn) {
          testiSubmitBtn.disabled = true;
          testiSubmitBtn.innerHTML = 'Mengirim... ⏳';
        }

        const newTestimonial = {
          name: name,
          role: role,
          rating: rating,
          message: message,
          timestamp: Date.now()
        };

        if (isFirebaseActive && dbRef) {
          // Push to Firebase Realtime Database
          const newRef = dbRef.push();
          newTestimonial.id = newRef.key;
          newRef.set(newTestimonial)
            .then(() => {
              allTestimonials.unshift(newTestimonial);
              renderAllTestimonialsViews(newTestimonial.id);
              onSuccess();
            })
            .catch((err) => {
              console.error("Firebase push error:", err);
              saveLocally(newTestimonial);
              onSuccess();
            });
        } else {
          saveLocally(newTestimonial);
          onSuccess();
        }

        function saveLocally(item) {
          let items = [];
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) items = JSON.parse(stored);
          } catch (e) {}

          const itemWithId = { ...item, id: item.id || ('local-' + Date.now()) };
          items.unshift(itemWithId);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
          } catch (e) {}

          allTestimonials.unshift(itemWithId);
          renderAllTestimonialsViews(itemWithId.id);
        }

        function onSuccess() {
          localStorage.setItem(LAST_POST_KEY, Date.now().toString());
          if (testiMsgInput) testiMsgInput.value = '';
          
          if (testiStatus) {
            testiStatus.className = 'testi-status success';
            testiStatus.textContent = 'Terima kasih! Komentar kamu berhasil dikirim.';
          }

          if (testiSubmitBtn) {
            testiSubmitBtn.disabled = false;
            testiSubmitBtn.innerHTML = 'Kirim Testimoni <span>✨</span>';
          }

          // Clean, natural toast notification
          showSiteToast('Terima kasih sudah berkomentar!', 'success');

          // Smooth scroll to testimonials so user sees their new card
          const targetSection = document.getElementById('testimonials');
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }

          setTimeout(() => {
            if (testiStatus) {
              testiStatus.textContent = '';
              testiStatus.className = 'testi-status';
            }
          }, 4000);
        }
      });
    }

  })();

})();
