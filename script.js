// ==========================================================
//  ADHA RAFI NURFAIZ — Portfolio JS
//  Preloader, animations, custom cursor, counters, reveals
// ==========================================================

(function () {
  'use strict';

  // ===== MINIMALIST NOIR BAT PRELOADER =====
  const canvas = document.getElementById('bat-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const preloader = document.getElementById('preloader');
  const preloaderFill = document.getElementById('preloader-fill');
  const preloaderName = document.getElementById('preloader-name');
  const shineSweep = document.getElementById('bat-shine-sweep');
  const batChars = document.querySelectorAll('.bat-char');

  let preloaderDone = false;
  let startTime = null;
  const PRELOADER_DURATION = 2300; // Cinematic 2.3s duration so bat flock flight is fully seen

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
  }

  if (canvas) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  // Helper: Get name bounding position
  function getNameBounds() {
    if (!preloaderName) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      return { x: cx, y: cy, left: cx - 120, right: cx + 120, top: cy - 25, bottom: cy + 25, width: 240, height: 50 };
    }
    const r = preloaderName.getBoundingClientRect();
    return {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
      left: r.left,
      right: r.right,
      top: r.top,
      bottom: r.bottom,
      width: r.width,
      height: r.height
    };
  }

  // Draw an authentic, sleek silhouette bat with realistic flapping wings
  function drawBat(ctx, x, y, size, angle, flapPhase, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(size, size);
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    const flap = Math.sin(flapPhase);

    // Deep obsidian silhouette with crisp moonlight rim-light for clear visibility
    ctx.fillStyle = '#050608';
    ctx.strokeStyle = 'rgba(225, 235, 255, 0.85)'; // Clean silver moonlight rim
    ctx.lineWidth = 0.85;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    // Head & pointed bat ears
    ctx.moveTo(0, -6);
    ctx.lineTo(-2, -9.5);
    ctx.lineTo(-1, -5.5);
    ctx.lineTo(1, -5.5);
    ctx.lineTo(2, -9.5);
    ctx.lineTo(0, -6);

    // Body / Torso
    ctx.ellipse(0, 0, 2.2, 5.2, 0, 0, Math.PI * 2);

    // Left Wing
    const elbowX = -7.5;
    const elbowY = -4 - flap * 4.5;
    const tipX = -21;
    const tipY = -2 + flap * 11;
    const s1X = -15, s1Y = 3 + flap * 5;
    const s2X = -10, s2Y = 3.8 + flap * 3.5;
    const s3X = -5,  s3Y = 3.2 + flap * 1.5;

    ctx.moveTo(-1.2, -2);
    ctx.quadraticCurveTo(-4.5, -5.5 - flap * 3, elbowX, elbowY);
    ctx.quadraticCurveTo(-13.5, -5.5 - flap * 5.5, tipX, tipY);
    ctx.quadraticCurveTo(-17.5, 0 + flap * 5.5, s1X, s1Y);
    ctx.quadraticCurveTo(-12.5, 2 + flap * 3.8, s2X, s2Y);
    ctx.quadraticCurveTo(-8, 2.5 + flap * 2, s3X, s3Y);
    ctx.quadraticCurveTo(-2.5, 2.8, 0, 5.2);

    // Right Wing (symmetrical)
    ctx.quadraticCurveTo(2.5, 2.8, -s3X, s3Y);
    ctx.quadraticCurveTo(8, 2.5 + flap * 2, -s2X, s2Y);
    ctx.quadraticCurveTo(12.5, 2 + flap * 3.8, -s1X, s1Y);
    ctx.quadraticCurveTo(17.5, 0 + flap * 5.5, -tipX, tipY);
    ctx.quadraticCurveTo(13.5, -5.5 - flap * 5.5, -elbowX, elbowY);
    ctx.quadraticCurveTo(4.5, -5.5 - flap * 3, 1.2, -2);

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Subtle wing structure ribs for larger bats to enhance realism
    if (size > 1.6) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      // Left ribs
      ctx.moveTo(elbowX, elbowY);
      ctx.lineTo(s1X, s1Y);
      ctx.moveTo(elbowX, elbowY);
      ctx.lineTo(s2X, s2Y);
      // Right ribs
      ctx.moveTo(-elbowX, elbowY);
      ctx.lineTo(-s1X, s1Y);
      ctx.moveTo(-elbowX, elbowY);
      ctx.lineTo(-s2X, s2Y);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Generate Bat Swarm Flock
  const bats = [];
  const TOTAL_BATS = 15;

  function initBats() {
    bats.length = 0;
    const nameB = getNameBounds();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < TOTAL_BATS; i++) {
      let delay = 0;
      let duration = 1100;
      let p0, p1, p2, p3;
      let baseSize = 1.8;
      let endSize = 2.0;
      let role = 'swarm';

      if (i < 3) {
        // High scouts cutting rapidly across upper screen
        role = 'scout';
        delay = 100 + i * 150;
        duration = 950 + Math.random() * 200;
        const dir = i % 2 === 0 ? 1 : -1;
        p0 = { x: cx - dir * (cx * 0.9), y: cy * 0.3 + (Math.random() - 0.5) * 80 };
        p1 = { x: cx - dir * 180, y: cy * 0.4 };
        p2 = { x: cx + dir * 180, y: cy * 0.5 };
        p3 = { x: cx + dir * (cx * 0.95), y: cy * 0.35 + (Math.random() - 0.5) * 80 };
        baseSize = 1.5 + Math.random() * 0.4;
        endSize = baseSize;
      } else if (i < 12) {
        // Main flock swooping diagonally slicing directly through "RafiKuy"
        role = 'nameCross';
        const batchIdx = i - 3;
        delay = 350 + batchIdx * 80 + Math.random() * 40;
        duration = 1050 + Math.random() * 200;

        // Originates from upper-left corner
        p0 = {
          x: cx - (cx * 0.8) - Math.random() * 120,
          y: cy * 0.15 + (batchIdx * 25) + (Math.random() - 0.5) * 40
        };

        // Diving path heading into the title
        p1 = {
          x: cx - 180 + (Math.random() - 0.5) * 70,
          y: nameB.top - 50 + (Math.random() - 0.5) * 30
        };

        // Mid flight crossing directly over the letters of "RafiKuy"
        const norm = batchIdx / 9;
        const crossX = nameB.left + norm * nameB.width + (Math.random() - 0.5) * 24;
        const crossY = nameB.y + (Math.random() - 0.5) * 16;
        p2 = { x: crossX, y: crossY };

        // Ascending swoop towards right exit
        p3 = {
          x: cx + (cx * 0.85) + Math.random() * 140,
          y: cy + 120 + batchIdx * 35
        };

        baseSize = 1.7 + Math.random() * 0.6; // Prominent, clearly visible size
        endSize = baseSize * 1.2;
      } else {
        // Foreground cinematic pass (larger, near camera)
        role = 'rush';
        const rushIdx = i - 12;
        delay = 750 + rushIdx * 180;
        duration = 900 + Math.random() * 150;

        const side = rushIdx === 0 ? -1 : 1;
        p0 = { x: cx + side * (cx * 0.65), y: nameB.top - 100 };
        p1 = { x: nameB.x + side * 60, y: nameB.y + 20 };
        p2 = { x: cx + side * 240, y: cy + 180 };
        p3 = { x: cx + side * (cx * 1.15), y: window.innerHeight + 120 };

        baseSize = 2.4;
        endSize = 3.8; // Dramatic cinematic scale
      }

      bats.push({
        p0, p1, p2, p3,
        delay,
        duration,
        baseSize,
        endSize,
        flapSpeed: 0.22 + Math.random() * 0.08,
        flapPhase: Math.random() * Math.PI * 2,
        role
      });
    }
  }

  initBats();

  // Cubic Bezier interpolation
  function bezierPoint(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
    };
  }

  // Trigger silver glint when bats cross the name
  function triggerNameCrossing(batX, batY) {
    const nameB = getNameBounds();
    if (batX >= nameB.left - 25 && batX <= nameB.right + 25 &&
        batY >= nameB.top - 20 && batY <= nameB.bottom + 20) {
      
      // Determine which letter of "RafiKuy" is nearest
      if (batChars.length > 0) {
        const normX = (batX - nameB.left) / nameB.width;
        const charIdx = Math.max(0, Math.min(batChars.length - 1, Math.floor(normX * batChars.length)));
        const charEl = batChars[charIdx];
        if (charEl && !charEl.classList.contains('lit')) {
          charEl.classList.add('lit');
          setTimeout(() => charEl.classList.remove('lit'), 240);
        }
      }

      // Trigger glint sweep
      if (shineSweep && !shineSweep.classList.contains('active')) {
        shineSweep.classList.add('active');
      }
    }
  }

  // Main Minimalist Bat Animation Loop
  function animateBatmanPreloader(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const totalProgress = Math.min(elapsed / PRELOADER_DURATION, 1);

    // Update Minimalist Loading Bar
    if (preloaderFill) {
      preloaderFill.style.width = (totalProgress * 100) + '%';
    }

    if (ctx && canvas) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Render Bats
      for (let i = 0; i < bats.length; i++) {
        const b = bats[i];
        if (elapsed < b.delay) continue;

        const batElapsed = elapsed - b.delay;
        const t = Math.min(batElapsed / b.duration, 1);

        if (t >= 1) continue; // Finished flight

        // Position on Bezier curve
        const pos = bezierPoint(b.p0, b.p1, b.p2, b.p3, t);

        // Velocity / facing angle from slightly ahead on curve
        const nextT = Math.min(t + 0.02, 1);
        const nextPos = bezierPoint(b.p0, b.p1, b.p2, b.p3, nextT);
        const dx = nextPos.x - pos.x;
        const dy = nextPos.y - pos.y;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;

        // Current scale & opacity
        const currentSize = b.baseSize + (b.endSize - b.baseSize) * t;
        let opacity = 1;
        if (t < 0.12) opacity = t / 0.12;
        if (t > 0.88) opacity = (1 - t) / 0.12;

        // Flap animation
        b.flapPhase += b.flapSpeed;

        drawBat(ctx, pos.x, pos.y, currentSize, angle, b.flapPhase, opacity);

        // Trigger interaction when passing the name
        if (b.role === 'nameCross' || b.role === 'rush') {
          triggerNameCrossing(pos.x, pos.y);
        }
      }
    }

    if (totalProgress < 1) {
      requestAnimationFrame(animateBatmanPreloader);
    } else {
      setTimeout(hidePreloader, 180);
    }
  }

  // Start Animation
  if (canvas && ctx) {
    requestAnimationFrame(animateBatmanPreloader);
  } else {
    setTimeout(hidePreloader, 1500);
  }

  function hidePreloader() {
    if (preloaderDone) return;
    preloaderDone = true;

    if (preloader && !preloader.classList.contains('done')) {
      preloader.classList.add('done');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 650);
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

  // Absolute safety timeout: dismiss after 3.0s
  setTimeout(() => {
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

  // ===== DEFAULT DATA FOR PROJECTS & ACHIEVEMENTS =====
  const DEFAULT_PORTFOLIO_PROJECTS = [
    {
      id: "proj_pasarnusa",
      title: "PasarNusa — Marketplace & Digital Payment",
      category: "web",
      categoryBadge: "E-COMMERCE • FULLSTACK & PAYMENT GATEWAY",
      statusPill: "● Open Source • GitHub",
      browserUrl: "github.com/AdhaRafi/pasarnusa",
      image: "assets/images/Pasarnusa.png",
      desc: "Platform e-commerce digitalisasi UMKM pasar tradisional yang dilengkapi integrasi Google OAuth 2.0 (Single Sign-On), Midtrans Payment Gateway untuk pembayaran digital otomatis, manajemen admin toko, dan keranjang belanja dinamis.",
      tags: ["PHP Native", "MySQL Database", "Google OAuth 2.0", "Midtrans Payment API", "Composer", "Multi-Merchant"],
      primaryBtnText: "GitHub Repo",
      primaryBtnUrl: "https://github.com/AdhaRafi/pasarnusa",
      secondaryBtnText: "Lihat Kode ↗",
      secondaryBtnUrl: "https://github.com/AdhaRafi/pasarnusa"
    },
    {
      id: "proj_portal_smk",
      title: "Portal Informasi SMK Telkom",
      category: "web",
      categoryBadge: "WEB DEVELOPMENT • FULLSTACK",
      statusPill: "● Completed",
      browserUrl: "smktelkom-pwt.sch.id",
      image: "",
      desc: "Website portal komprehensif untuk menyajikan profil sekolah, sistem pengumuman agenda, galeri kegiatan siswa jurusan PPLG, serta form pendaftaran online terintegrasi database.",
      tags: ["HTML5 / CSS3", "PHP Native", "MySQL Database", "Responsive UI"],
      primaryBtnText: "Source Code",
      primaryBtnUrl: "https://github.com/AdhaRafi",
      secondaryBtnText: "Live Preview ↗",
      secondaryBtnUrl: "https://github.com/AdhaRafi"
    },
    {
      id: "proj_ff_tournament",
      title: "Free Fire Tournament & Leaderboard Hub",
      category: "esport",
      categoryBadge: "ESPORTS & GAMING • WEB APP",
      statusPill: "● Championship Hub",
      browserUrl: "ff-tournament-hub.dev",
      image: "",
      desc: "Platform pendaftaran tim esport Free Fire dengan kalkulasi poin otomatis, sistem standing leaderboard real-time, jadwal match tournament, dan galeri piala prestasi Juara 1.",
      tags: ["JavaScript ES6", "Interactive DOM", "Local Storage", "Dark Mode UI", "Esport Branding"],
      primaryBtnText: "Source Code",
      primaryBtnUrl: "https://github.com/AdhaRafi",
      secondaryBtnText: "Live Preview ↗",
      secondaryBtnUrl: "https://github.com/AdhaRafi"
    },
    {
      id: "proj_pplg_store",
      title: "Toko Online & Katalog Produk PPLG",
      category: "web",
      categoryBadge: "E-COMMERCE • WEB APPLICATION",
      statusPill: "● Completed",
      browserUrl: "pplg-store.shop",
      image: "",
      desc: "Aplikasi web e-commerce interaktif dengan keranjang belanja dinamis, filter kategori produk, kalkulasi total harga otomatis, dan direct checkout via WhatsApp link order.",
      tags: ["JavaScript", "PHP & MySQL", "Cart State", "WhatsApp API", "Tailwind CSS"],
      primaryBtnText: "Source Code",
      primaryBtnUrl: "https://github.com/AdhaRafi",
      secondaryBtnText: "Live Preview ↗",
      secondaryBtnUrl: "https://github.com/AdhaRafi"
    },
    {
      id: "proj_figma_uiux",
      title: "Desain UI/UX Mobile App & Design System",
      category: "uiux",
      categoryBadge: "UI/UX DESIGN • FIGMA PROTOTYPE",
      statusPill: "● Figma Design",
      browserUrl: "figma.com/@adharafi",
      image: "",
      desc: "Perancangan sistematis UI/UX mencakup user persona, wireframing low-fidelity hingga high-fidelity, interactive clickable prototype, dan atomic design token kit di Figma.",
      tags: ["Figma Pro", "Canva", "Wireframing", "Design Tokens", "Atomic Design"],
      primaryBtnText: "Lihat Desain",
      primaryBtnUrl: "https://www.instagram.com/rafiiwow_",
      secondaryBtnText: "Case Study ↗",
      secondaryBtnUrl: "https://github.com/AdhaRafi"
    }
  ];

  const DEFAULT_PORTFOLIO_ACHIEVEMENTS = [
    {
      id: "achieve_poco_s3",
      title: "Juara 1 POCO Extreme League S3",
      category: "esport",
      badgeType: "gold",
      badgeIcon: "🥇",
      badgeText: "Juara 1 (Champion)",
      year: "2024",
      categoryLabel: "ESPORTS TOURNAMENT • FREE FIRE",
      subtitle: "Regional Banyumas • Diselenggarakan oleh POCO Indonesia",
      desc: "Meraih peringkat pertama dalam kompetisi turnamen Free Fire bergengsi POCO Extreme League Season 3 Regional Banyumas bersama tim esport, membuktikan koordinasi strategi, komunikasi cepat, dan konsistensi gameplay di bawah tekanan.",
      tags: ["🏆 1st Winner", "🎮 Free Fire Battle Royale", "📍 Regional Banyumas", "🤝 Teamwork & Strategy"],
      image: "assets/images/Juara.jpeg",
      previewType: "image"
    },
    {
      id: "achieve_pplg_showcase",
      title: "PPLG Showcase & Web Innovation",
      category: "tech",
      badgeType: "blue",
      badgeIcon: "🚀",
      badgeText: "Project Showcase",
      year: "2025",
      categoryLabel: "ACADEMIC & TECH SHOWCASE",
      subtitle: "SMK Telkom Purwokerto • Jurusan PPLG",
      desc: "Terpilih mempresentasikan karya project website interaktif responsif terintegrasi database real-time dalam ajang showcase kejuruan Pengembangan Perangkat Lunak dan Gim (PPLG).",
      tags: ["💻 Web Development", "🏫 SMK Telkom", "🔥 Realtime Database", "⚡ Clean Architecture"],
      image: "",
      previewType: "tech"
    },
    {
      id: "achieve_frontend_cert",
      title: "Frontend Web & JavaScript Mastery",
      category: "cert",
      badgeType: "emerald",
      badgeIcon: "📜",
      badgeText: "Certified Skill",
      year: "2024 - 2025",
      categoryLabel: "SKILL CERTIFICATION & BOOTCAMP",
      subtitle: "Independent Learning & Online Tech Curriculum",
      desc: "Menyelesaikan modul komprehensif frontend engineering: manipulasi DOM modern, asynchronous JavaScript, Web API integration, serta best practice semantic & accessible code.",
      tags: ["📜 Certified", "🌐 HTML5 / CSS3 Modern", "⚙️ JavaScript ES6+", "📱 Mobile-First Design"],
      image: "",
      previewType: "cert"
    },
    {
      id: "achieve_uiux_concept",
      title: "UI/UX Design & Brand System",
      category: "design",
      badgeType: "purple",
      badgeIcon: "🎨",
      badgeText: "UI/UX Concept",
      year: "2025",
      categoryLabel: "UI/UX & CREATIVE DESIGN",
      subtitle: "Figma Design Exploration & Visual Identity",
      desc: "Perancangan konsep antarmuka digital berbasis user-experience, wireframing, interactive high-fidelity prototyping, dan penyusunan design system dengan token warna Canva palette.",
      tags: ["🎨 Figma UI/UX", "📐 Design Tokens", "✨ Micro-Interactions", "🎯 User-Centered"],
      image: "",
      previewType: "design"
    }
  ];

  // Helper sanitize
  function sanitizeHtml(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  // ===== DYNAMIC PROJECTS RENDERING =====
  const projectsStack = document.getElementById('projects-blueprint-stack');
  let currentActiveProjectFilter = 'all';

  function getProjectMockupHtml(category, title) {
    if (category === 'esport') {
      return `
        <div class="project-mockup-graphic esports-hub">
            <div class="mockup-header-nav">
                <div class="mockup-logo">🏆 FF CHAMPIONSHIP</div>
                <span class="esports-live-tag">● LIVE BRACKET</span>
            </div>
            <div class="mockup-leaderboard">
                <div class="lb-row gold"><span>🥇 #1 Adha Team (Juara 1)</span> <strong>32 Pts</strong></div>
                <div class="lb-row"><span>🥈 #2 Alpha Squad</span> <strong>24 Pts</strong></div>
                <div class="lb-row"><span>🥉 #3 Phoenix Rises</span> <strong>19 Pts</strong></div>
            </div>
        </div>
      `;
    } else if (category === 'uiux') {
      return `
        <div class="project-mockup-graphic figma-prototype">
            <div class="figma-artboard-wrap">
                <div class="figma-phone-screen">
                    <div class="phone-notch"></div>
                    <div class="phone-widget"></div>
                    <div class="phone-list-item"></div>
                    <div class="phone-list-item"></div>
                </div>
                <div class="figma-palette-box">
                    <span style="background:#000000"></span>
                    <span style="background:#4C4A4A"></span>
                    <span style="background:#9F9C9C"></span>
                    <span style="background:#DDDDDD"></span>
                </div>
            </div>
        </div>
      `;
    } else if (title.toLowerCase().includes('toko') || title.toLowerCase().includes('store')) {
      return `
        <div class="project-mockup-graphic ecommerce-store">
            <div class="mockup-header-nav">
                <div class="mockup-logo">🛒 PPLG STORE</div>
                <span class="mockup-cart-badge">🛍️ 3 Items</span>
            </div>
            <div class="mockup-products-grid">
                <div class="m-product-card"><div class="m-product-img"></div><span>Code Hoodie</span></div>
                <div class="m-product-card"><div class="m-product-img"></div><span>Dev Stickers</span></div>
            </div>
        </div>
      `;
    }
    // Default Web Portal mockup
    return `
      <div class="project-mockup-graphic web-portal">
          <div class="mockup-header-nav">
              <div class="mockup-logo">🏫 SMK TELKOM</div>
              <div class="mockup-nav-items"><span></span><span></span><span></span></div>
          </div>
          <div class="mockup-hero-banner">
              <span class="mockup-badge">PPDB & Info Portal</span>
              <h4>Portal Sistem Informasi</h4>
          </div>
          <div class="mockup-grid-preview">
              <div class="mockup-card-item"></div>
              <div class="mockup-card-item"></div>
              <div class="mockup-card-item"></div>
          </div>
      </div>
    `;
  }

  function renderPortfolioProjects(list) {
    if (!projectsStack) return;
    if (!list || list.length === 0) {
      list = DEFAULT_PORTFOLIO_PROJECTS;
    }

    projectsStack.innerHTML = '';

    list.forEach(p => {
      const cardWrap = document.createElement('div');
      cardWrap.className = 'blueprint-card-wrapper anim-fade-up';
      cardWrap.dataset.category = p.category || 'web';

      const title = sanitizeHtml(p.title);
      const catBadge = sanitizeHtml(p.categoryBadge || (p.category ? p.category.toUpperCase() : 'PROJECT'));
      const statusPill = sanitizeHtml(p.statusPill || '● Active');
      const browserUrl = sanitizeHtml(p.browserUrl || 'portfolio-project.dev');
      const desc = sanitizeHtml(p.desc);
      const tagsArr = Array.isArray(p.tags) ? p.tags : [];
      const tagsHtml = tagsArr.map(t => `<span class="p-tech-pill">${sanitizeHtml(t)}</span>`).join('');
      const hasImg = !!p.image;
      const primaryBtnText = sanitizeHtml(p.primaryBtnText || 'Source Code');
      const primaryBtnUrl = p.primaryBtnUrl || 'https://github.com/AdhaRafi';
      const secondaryBtnText = sanitizeHtml(p.secondaryBtnText || '');
      const secondaryBtnUrl = p.secondaryBtnUrl || '';

      const visualPreviewHtml = hasImg
        ? `<div class="project-preview-content project-img-preview"><img src="${p.image}" alt="${title} Preview" class="project-real-img" loading="lazy"></div>`
        : `<div class="project-preview-content">${getProjectMockupHtml(p.category, p.title)}</div>`;

      cardWrap.innerHTML = `
        <div class="blueprint-dashed-frame">
            <div class="blueprint-marker top-left"></div>
            <div class="blueprint-marker top-right"></div>
            <div class="blueprint-marker bottom-left"></div>
            <div class="blueprint-marker bottom-right"></div>
            <div class="blueprint-anchor-pin"></div>
        </div>
        <div class="project-showcase-card">
            <div class="project-visual-box">
                <div class="project-browser-bar">
                    <span class="browser-dot red"></span>
                    <span class="browser-dot yellow"></span>
                    <span class="browser-dot green"></span>
                    <span class="browser-url">${browserUrl}</span>
                </div>
                ${visualPreviewHtml}
                <span class="project-status-pill">${statusPill}</span>
            </div>
            <div class="project-details-box">
                <span class="project-category-badge">${catBadge}</span>
                <h3 class="project-title">${title}</h3>
                <p class="project-desc">${desc}</p>
                <div class="project-tech-tags">
                    ${tagsHtml}
                </div>
                <div class="project-action-row">
                    <a href="${primaryBtnUrl}" target="_blank" rel="noopener noreferrer" class="btn-project-primary">
                        <span>${primaryBtnText}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                    </a>
                    ${secondaryBtnText && secondaryBtnUrl ? `
                    <a href="${secondaryBtnUrl}" target="_blank" rel="noopener noreferrer" class="btn-project-secondary">
                        <span>${secondaryBtnText}</span>
                    </a>` : ''}
                </div>
            </div>
        </div>
      `;

      projectsStack.appendChild(cardWrap);
    });

    applyProjectFilter(currentActiveProjectFilter);
    initTiltEffects();
  }

  function applyProjectFilter(filter) {
    currentActiveProjectFilter = filter;
    const cards = document.querySelectorAll('.blueprint-card-wrapper');
    cards.forEach(card => {
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
  }

  // Filter project buttons
  const projectFilterBtns = document.querySelectorAll('.project-filter-btn');
  projectFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      projectFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyProjectFilter(btn.dataset.filter);
    });
  });

  // ===== DYNAMIC ACHIEVEMENTS RENDERING =====
  const achievementsGrid = document.getElementById('achievements-grid');
  const achieveLightbox = document.getElementById('achieve-lightbox');
  const closeAchieveLightboxBtn = document.getElementById('achieve-lightbox-close');
  let currentActiveAchieveFilter = 'all';

  function getAchievementVisualPreviewHtml(type) {
    if (type === 'tech') {
      return `
        <div class="achievement-visual-preview tech-preview">
            <div class="code-terminal-header">
                <div class="term-dots"><span></span><span></span><span></span></div>
                <span class="term-title">showcase-pplg.dev</span>
            </div>
            <div class="code-terminal-body">
                <div class="term-line"><span class="t-keyword">const</span> <span class="t-var">project</span> = <span class="t-str">"Web Portfolio & Platform"</span>;</div>
                <div class="term-line"><span class="t-keyword">const</span> <span class="t-var">status</span> = <span class="t-str">"Featured in PPLG Expo"</span>;</div>
                <div class="term-line status-badge"><span class="t-check">✓</span> <span>100% Responsive & Realtime Sync</span></div>
            </div>
        </div>
      `;
    } else if (type === 'cert') {
      return `
        <div class="achievement-visual-preview cert-preview">
            <div class="cert-seal-wrap">
                <div class="cert-seal-circle"><span>🏅</span></div>
                <div class="cert-seal-info">
                    <strong>Certificate of Competency</strong>
                    <span>Modern Web Development & Logic</span>
                </div>
            </div>
        </div>
      `;
    } else if (type === 'design') {
      return `
        <div class="achievement-visual-preview design-preview">
            <div class="design-swatches">
                <span class="swatch" style="background: #2F2E2E;"></span>
                <span class="swatch" style="background: #656363;"></span>
                <span class="swatch" style="background: #9F9C9C;"></span>
                <span class="swatch" style="background: #DDDDDD;"></span>
            </div>
            <div class="design-elements-row">
                <span class="ui-mini-btn">Interactive UI</span>
                <span class="ui-mini-chip">Auto-Layout</span>
                <span class="ui-mini-chip">Figma 100%</span>
            </div>
        </div>
      `;
    }
    return '';
  }

  function openAchieveLightboxWithData(imgSrc, title, desc) {
    if (!achieveLightbox) return;
    const imgEl = achieveLightbox.querySelector('.achieve-lightbox-img');
    const capTitle = achieveLightbox.querySelector('.achieve-lightbox-caption h4');
    const capDesc = achieveLightbox.querySelector('.achieve-lightbox-caption p');

    if (imgEl && imgSrc) imgEl.src = imgSrc;
    if (capTitle) capTitle.textContent = title || 'Dokumentasi Prestasi';
    if (capDesc) capDesc.textContent = desc || 'Dokumentasi penyerahan gelar juara & penghargaan.';

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

  function renderPortfolioAchievements(list) {
    if (!achievementsGrid) return;
    if (!list || list.length === 0) {
      list = DEFAULT_PORTFOLIO_ACHIEVEMENTS;
    }

    achievementsGrid.innerHTML = '';

    list.forEach(a => {
      const card = document.createElement('div');
      const isFeatured = !!a.image;
      card.className = `achievement-card ${isFeatured ? 'featured-card' : ''}`;
      card.dataset.category = a.category || 'esport';

      const title = sanitizeHtml(a.title);
      const icon = a.badgeIcon || '🏆';
      const badgeText = sanitizeHtml(a.badgeText || 'Award');
      const badgeType = a.badgeType || 'gold';
      const year = sanitizeHtml(a.year || '2025');
      const catLabel = sanitizeHtml(a.categoryLabel || 'ACHIEVEMENT');
      const subtitle = sanitizeHtml(a.subtitle || '');
      const desc = sanitizeHtml(a.desc);
      const tagsArr = Array.isArray(a.tags) ? a.tags : [];
      const tagsHtml = tagsArr.map(t => `<span class="achieve-tag">${sanitizeHtml(t)}</span>`).join('');
      const hasImg = !!a.image;

      let mediaOrPreviewHtml = '';
      if (hasImg) {
        mediaOrPreviewHtml = `
          <div class="achievement-media-box">
              <img src="${a.image}" alt="${title}" class="achievement-img" loading="lazy">
              <div class="achievement-media-overlay" data-img="${a.image}" data-title="${title}" data-desc="${desc}">
                  <span class="overlay-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                      Lihat Foto Dokumentasi
                  </span>
              </div>
          </div>
        `;
      } else {
        mediaOrPreviewHtml = getAchievementVisualPreviewHtml(a.previewType || a.category);
      }

      card.innerHTML = `
        <div class="achievement-card-top">
            <div class="achievement-badge-pill ${badgeType}">
                <span class="badge-icon">${icon}</span>
                <span>${badgeText}</span>
            </div>
            <span class="achievement-year-tag">${year}</span>
        </div>
        ${mediaOrPreviewHtml}
        <div class="achievement-content">
            <div class="achievement-category-label">${catLabel}</div>
            <h3 class="achievement-title">${title}</h3>
            ${subtitle ? `<p class="achievement-subtitle">${subtitle}</p>` : ''}
            <p class="achievement-desc">${desc}</p>
            <div class="achievement-tags">
                ${tagsHtml}
            </div>
        </div>
      `;

      // Attach lightbox click if image exists
      const mediaBox = card.querySelector('.achievement-media-box');
      if (mediaBox && hasImg) {
        mediaBox.addEventListener('click', () => {
          openAchieveLightboxWithData(a.image, a.title, a.desc);
        });
      }

      achievementsGrid.appendChild(card);
    });

    applyAchievementFilter(currentActiveAchieveFilter);
    initTiltEffects();
  }

  function applyAchievementFilter(filter) {
    currentActiveAchieveFilter = filter;
    const cards = document.querySelectorAll('.achievements-grid .achievement-card');
    cards.forEach(card => {
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
  }

  // Filter achievement buttons
  const achieveFilterBtns = document.querySelectorAll('.achieve-filter-btn');
  achieveFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      achieveFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyAchievementFilter(btn.dataset.filter);
    });
  });

  // ===== TILT EFFECT ON BLUEPRINT PROJECT CARDS & ACHIEVEMENTS =====
  function initTiltEffects() {
    if (window.innerWidth > 768) {
      document.querySelectorAll('.project-showcase-card, .achievement-card').forEach(card => {
        if (card.dataset.tiltBound) return;
        card.dataset.tiltBound = 'true';

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
    }
  }

  // ===== INITIALIZE REALTIME SYNC FOR PROJECTS & ACHIEVEMENTS =====
  function initRealtimePortfolioData() {
    // 1. Initial render from LocalStorage or Defaults
    try {
      const savedProjects = JSON.parse(localStorage.getItem('rafikuy_portfolio_projects') || 'null');
      renderPortfolioProjects(savedProjects || DEFAULT_PORTFOLIO_PROJECTS);
    } catch (e) {
      renderPortfolioProjects(DEFAULT_PORTFOLIO_PROJECTS);
    }

    try {
      const savedAchieve = JSON.parse(localStorage.getItem('rafikuy_portfolio_achievements') || 'null');
      renderPortfolioAchievements(savedAchieve || DEFAULT_PORTFOLIO_ACHIEVEMENTS);
    } catch (e) {
      renderPortfolioAchievements(DEFAULT_PORTFOLIO_ACHIEVEMENTS);
    }

    // 2. Realtime sync with Firebase RTDB
    const db = getFirebaseDb();
    if (db) {
      // Sync Projects
      db.ref('portfolio_projects').on('value', (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list = Object.keys(val).map(key => ({ id: key, ...val[key] }));
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          localStorage.setItem('rafikuy_portfolio_projects', JSON.stringify(list));
          renderPortfolioProjects(list);
        }
      });

      // Sync Achievements
      db.ref('portfolio_achievements').on('value', (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list = Object.keys(val).map(key => ({ id: key, ...val[key] }));
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          localStorage.setItem('rafikuy_portfolio_achievements', JSON.stringify(list));
          renderPortfolioAchievements(list);
        }
      });
    }
  }

  initRealtimePortfolioData();

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

    if (window.innerWidth > 768) {
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
      1: '1.0 (Perlu Ditingkatkan)',
      2: '2.0 (Cukup)',
      3: '3.0 (Baik)',
      4: '4.0 (Sangat Baik)',
      5: '5.0 (Sempurna)'
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
          testiSubmitBtn.innerHTML = 'Mengirim...';
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
