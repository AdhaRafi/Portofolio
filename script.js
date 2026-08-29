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
      setTimeout(initHeroAnimations, 500);
    }
  }

  // Hide preloader once everything is ready
  window.addEventListener('load', () => {
    // Wait for web + spider descent to finish, then a brief pause
    const checkReady = setInterval(() => {
      if (webDrawn && spiderDescended) {
        clearInterval(checkReady);
        setTimeout(hidePreloader, 800);
      }
    }, 100);
  });

  // Fallback safety timeout
  setTimeout(hidePreloader, 5000);

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
  function initHeroAnimations() {
    const words = document.querySelectorAll('.hero-title .word');
    words.forEach((w, i) => {
      setTimeout(() => w.classList.add('visible'), i * 200);
    });

    animateHeroBgText();

    const socials = document.querySelectorAll('.hero-social-link');
    socials.forEach((s, i) => {
      s.style.opacity = '0';
      s.style.transform = 'translateX(-20px)';
      s.style.transition = `all 0.6s ease ${0.4 + i * 0.15}s`;
      setTimeout(() => {
        s.style.opacity = '1';
        s.style.transform = 'translateX(0)';
      }, 50);
    });

    const quote = document.getElementById('hero-quote');
    if (quote) {
      quote.style.opacity = '0';
      quote.style.transform = 'translateY(20px)';
      quote.style.transition = 'all 0.8s ease 0.8s';
      setTimeout(() => {
        quote.style.opacity = '1';
        quote.style.transform = 'translateY(0)';
      }, 50);
    }
  }

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

      function type() {
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

        setTimeout(type, speed);
      }

      // Add blink animation style
      const blinkStyle = document.createElement('style');
      blinkStyle.textContent = '@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }';
      document.head.appendChild(blinkStyle);

      setTimeout(type, 1200);
    }
  }
  initTypeEffect();

  // ===== CONTACT FORM SIMULATION =====
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-send');
      const status = document.getElementById('form-status');
      const originalHTML = btn.innerHTML;

      btn.innerHTML = 'Mengirim...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = '✓ Pesan Terkirim!';
        btn.style.background = '#2F2E2E';
        btn.style.color = '#FFFFFF';
        if (status) {
          status.innerHTML = 'Terima kasih! Pesan Anda telah diterima.';
          status.style.color = '#DDDDDD';
        }
        contactForm.reset();

        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
          if (status) status.innerHTML = '';
        }, 3500);
      }, 1000);
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

  // ===== DYNAMIC REAL-TIME TESTIMONIALS WITH FIREBASE =====
  (function initTestimonials() {
    const testiForm = document.getElementById('testi-form');
    const testiNameInput = document.getElementById('testi-name');
    const testiRoleInput = document.getElementById('testi-role');
    const testiMsgInput = document.getElementById('testi-message');
    const testiRatingInput = document.getElementById('testi-rating');
    const testiSubmitBtn = document.getElementById('testi-submit-btn');
    const testiStatus = document.getElementById('testi-status');
    const testimonialsGrid = document.getElementById('testimonials-grid');
    const starRating = document.getElementById('star-rating');
    const ratingText = document.getElementById('rating-text');
    const chips = document.querySelectorAll('.testi-chip');

    if (!testimonialsGrid) return;

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

    const renderedTestiIds = new Set();

    function createTestimonialCard(id, item, isNew = false) {
      const card = document.createElement('div');
      card.className = `testimonial-card ${isNew ? 'new-highlight' : ''}`;
      card.id = `testi-card-${id}`;

      const name = sanitizeHTML(item.name || 'Anonymous');
      const role = sanitizeHTML(item.role || 'Visitor / Teman');
      const text = sanitizeHTML(item.message || '');
      const starsStr = renderStarsString(item.rating || 5);
      const timeStr = formatTimeAgo(item.timestamp || Date.now());

      // Get first letter initial for avatar
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

    function addTestimonialToGrid(id, item, prepend = false, isNew = false) {
      if (renderedTestiIds.has(id)) return;
      renderedTestiIds.add(id);

      const card = createTestimonialCard(id, item, isNew);
      if (prepend && testimonialsGrid.firstChild) {
        testimonialsGrid.insertBefore(card, testimonialsGrid.firstChild);
      } else {
        testimonialsGrid.appendChild(card);
      }

      if (isNew) {
        setTimeout(() => {
          card.classList.remove('new-highlight');
        }, 5000);
      }
    }

    // Periodically update relative timestamps
    setInterval(() => {
      const timeElements = testimonialsGrid.querySelectorAll('.testimonial-time[data-ts]');
      timeElements.forEach(el => {
        const ts = parseInt(el.getAttribute('data-ts'), 10);
        if (ts) el.textContent = formatTimeAgo(ts);
      });
    }, 60000);

    // --- FIREBASE CONFIGURATION ---
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

    let isFirebaseActive = false;
    let dbRef = null;

    // Connect to Firebase Realtime Database
    try {
      if (window.firebase && firebaseConfig.apiKey !== "AIzaSyDemoKeyForAdhaRafiPortfolioGuestbook") {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.database();
        dbRef = db.ref('testimonials_messages');
        isFirebaseActive = true;

        // Listen for new testimonials in realtime
        dbRef.limitToLast(50).on('child_added', (snapshot) => {
          const val = snapshot.val();
          if (val) {
            addTestimonialToGrid(snapshot.key, val, true);
          }
        });

        // Listen for deleted testimonials in realtime across all devices!
        dbRef.on('child_removed', (snapshot) => {
          const id = snapshot.key;
          const card = document.getElementById(`testi-card-${id}`);
          if (card) {
            card.classList.add('deleting');
            setTimeout(() => {
              card.remove();
              renderedTestiIds.delete(id);
            }, 400);
          }
        });
      }
    } catch (err) {
      console.warn("Firebase initialization note (using local storage fallback if needed):", err);
      isFirebaseActive = false;
    }

    // --- INITIAL TESTIMONIALS & LOCAL STORAGE FALLBACK ---
    const STORAGE_KEY = 'rafikuy_testimonials_list';
    let localTestimonials = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) localTestimonials = JSON.parse(stored);
    } catch (e) {}

    // Default mock testimonials if empty
    if (!localTestimonials || localTestimonials.length === 0) {
      localTestimonials = [
        {
          id: 'init-1',
          name: 'Irvan',
          role: 'Teman',
          rating: 5,
          message: 'Jago Nemen fi 🔥 Portonya kece parah, animasi laba-labanya gokil!',
          timestamp: Date.now() - 3600000 * 48
        },
        {
          id: 'init-2',
          name: 'Firman',
          role: 'Teman',
          rating: 5,
          message: 'Jos lah websitee, desain monokromnya clean dan enak dipandang!',
          timestamp: Date.now() - 3600000 * 24
        },
        {
          id: 'init-3',
          name: 'Budi',
          role: 'Teman',
          rating: 5,
          message: 'semangat surr, sukses terus buat project-project berikutnya!',
          timestamp: Date.now() - 3600000 * 6
        }
      ];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localTestimonials));
      } catch (e) {}
    }

    // Render local initial testimonials if Firebase hasn't loaded any yet
    if (!isFirebaseActive) {
      localTestimonials.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      localTestimonials.forEach(item => {
        addTestimonialToGrid(item.id, item, false);
      });
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
          dbRef.push(newTestimonial)
            .then(() => {
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

          const itemWithId = { ...item, id: 'local-' + Date.now() };
          items.unshift(itemWithId);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
          } catch (e) {}

          addTestimonialToGrid(itemWithId.id, itemWithId, true, true);
        }

        // --- CELEBRATORY THANK YOU POPUP WITH CONFETTI ---
        function showThankYouPopup(authorName, starCount) {
          const modalBackdrop = document.getElementById('testi-thankyou-modal');
          const modalIcon = document.getElementById('modal-icon');
          const modalStars = document.getElementById('modal-stars');
          const modalTitle = document.getElementById('modal-title');
          const modalBody = document.getElementById('modal-body');
          const modalCloseBtn = document.getElementById('modal-close-btn');
          const modalXBtn = document.getElementById('modal-x-btn');
          const canvas = document.getElementById('testi-confetti-canvas');

          if (!modalBackdrop) return;

          const safeName = sanitizeHTML(authorName || 'Kawan');
          const r = parseInt(starCount || 5, 10);

          // Star string
          if (modalStars) {
            modalStars.textContent = '★'.repeat(r) + '☆'.repeat(5 - r);
          }

          // Custom heartfelt & natural Indonesian developer messages
          if (r === 5) {
            if (modalIcon) modalIcon.textContent = '🔥';
            if (modalTitle) modalTitle.textContent = 'Waduh Bintang 5! Gokil Banget! 🔥⭐';
            if (modalBody) {
              modalBody.innerHTML = `Makasih buanyaak ya <strong>${safeName}</strong>! Rating bintang 5 & apresiasi dari kamu berharga banget buat portofolio pertamaku ini. Bikin makin termotivasi buat terus ngoding & eksplorasi project-project keren lainnya. Sukses & sehat selalu ya bro/sis! ☘️`;
            }
          } else if (r === 4) {
            if (modalIcon) modalIcon.textContent = '✨';
            if (modalTitle) modalTitle.textContent = 'Mantap Banget, Makasih Ya! 👍✨';
            if (modalBody) {
              modalBody.innerHTML = `Thank you so much <strong>${safeName}</strong> udah sempetin mampir & ngasih 4 bintang! Masukan dan saran kamu bakal aku jadiin catatan penting biar websitenya makin jos lagi. Keep in touch! ☘️`;
            }
          } else if (r === 3) {
            if (modalIcon) modalIcon.textContent = '🤝';
            if (modalTitle) modalTitle.textContent = 'Makasih Masukannya, Respect! 🤝';
            if (modalBody) {
              modalBody.innerHTML = `Thanks ya <strong>${safeName}</strong> buat feedback jujurnya! Setiap saran dari kamu sangat berguna buat bahan belajar & evaluasi skill codingku ke depannya. Salam kenal! ☘️`;
            }
          } else {
            if (modalIcon) modalIcon.textContent = '🛠️';
            if (modalTitle) modalTitle.textContent = 'Siap, Bakal Ditingkatin Lagi! 🛠️';
            if (modalBody) {
              modalBody.innerHTML = `Makasih review dan masukannya <strong>${safeName}</strong>! Kritik yang membangun selalu jadi motivasi terbaik buat belajar lebih giat lagi. Ditunggu mampir lagi nanti pas websitenya udah makin upgrade ya! ☘️`;
            }
          }

          // Show modal
          modalBackdrop.classList.add('show');
          modalBackdrop.setAttribute('aria-hidden', 'false');

          // Launch Confetti Burst
          if (canvas) {
            launchConfetti(canvas);
          }

          function closeModal() {
            modalBackdrop.classList.remove('show');
            modalBackdrop.setAttribute('aria-hidden', 'true');
          }

          if (modalCloseBtn) modalCloseBtn.onclick = closeModal;
          if (modalXBtn) modalXBtn.onclick = closeModal;

          modalBackdrop.onclick = (e) => {
            if (e.target === modalBackdrop) closeModal();
          };

          const onKey = (e) => {
            if (e.key === 'Escape') {
              closeModal();
              document.removeEventListener('keydown', onKey);
            }
          };
          document.addEventListener('keydown', onKey);
        }

        // Lightweight Canvas Confetti Particles
        function launchConfetti(canvas) {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          const particles = [];
          const colors = ['#FFA500', '#FF1744', '#FFFFFF', '#27C93F', '#00D2FF', '#E0E0E0', '#FFD700'];

          const cx = canvas.width / 2;
          const cy = canvas.height / 2;

          for (let i = 0; i < 65; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 9;
            particles.push({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 3,
              size: 5 + Math.random() * 6,
              color: colors[Math.floor(Math.random() * colors.length)],
              alpha: 1,
              rotation: Math.random() * Math.PI * 2,
              rotSpeed: (Math.random() - 0.5) * 0.2,
              gravity: 0.18 + Math.random() * 0.08
            });
          }

          let animId;
          function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;

            particles.forEach(p => {
              p.x += p.vx;
              p.y += p.vy;
              p.vy += p.gravity;
              p.vx *= 0.98;
              p.rotation += p.rotSpeed;
              p.alpha -= 0.012;

              if (p.alpha > 0) {
                alive = true;
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
              }
            });

            if (alive) {
              animId = requestAnimationFrame(render);
            } else {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              cancelAnimationFrame(animId);
            }
          }
          render();
        }

        function onSuccess() {
          localStorage.setItem(LAST_POST_KEY, Date.now().toString());
          if (testiMsgInput) testiMsgInput.value = '';
          
          if (testiStatus) {
            testiStatus.className = 'testi-status success';
            testiStatus.textContent = 'Testimoni kamu berhasil dikirim & tampil live! Makasih banyak ✨';
          }

          if (testiSubmitBtn) {
            testiSubmitBtn.disabled = false;
            testiSubmitBtn.innerHTML = 'Kirim Testimoni <span>✨</span>';
          }

          // Trigger Custom Pop-up with Confetti!
          showThankYouPopup(name, rating);

          // Smooth scroll to testimonials grid so user sees their new card
          if (testimonialsGrid) {
            testimonialsGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }

          setTimeout(() => {
            if (testiStatus) testiStatus.textContent = '';
          }, 5000);
        }
      });
    }

  })();

})();
