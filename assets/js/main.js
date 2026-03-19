// --- SkyVision Drone Services ---
// Partial-Loader + Burger + Auto-Hide Header + Scroll Reveal + FAQ Accordion

function getRootPrefix() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const ghPages = document.documentElement.dataset.repo;
  let after = parts;
  if (ghPages) {
    const idx = parts.indexOf(ghPages);
    if (idx !== -1) after = parts.slice(idx + 1);
  }
  const depth = Math.max(0, after.length - 1);
  return '../'.repeat(depth);
}

function resolveRootToken(s) {
  return (s || '').replace(/\{\{ROOT\}\}/g, getRootPrefix());
}

async function loadIncludes() {
  const targets = document.querySelectorAll('[data-include]');
  for (const el of targets) {
    let url = el.getAttribute('data-include');
    if (!url) continue;
    url = resolveRootToken(url);
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status} für ${url}`);
      el.innerHTML = resolveRootToken(await res.text());
    } catch (e) {
      console.error('Include fehlgeschlagen:', e);
      el.innerHTML = `<div style="padding:12px;border:1px solid rgba(255,0,0,.35);border-radius:12px">
        Partial konnte nicht geladen werden: <code>${url}</code><br>
        Tipp: Seite über einen lokalen Server öffnen (python3 -m http.server 8080)
      </div>`;
    }
  }
}

function initBurger() {
  const btn = document.querySelector('[data-burger]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const isHidden = menu.hasAttribute('hidden');
    if (isHidden) menu.removeAttribute('hidden');
    else menu.setAttribute('hidden', '');
    btn.setAttribute('aria-expanded', String(isHidden));
  });
  menu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      menu.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

function highlightActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, [data-mobile-menu] a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop().split('#')[0];
    if (linkPage === path) {
      a.style.color = 'var(--white)';
      a.style.background = 'rgba(0,212,255,.08)';
    }
  });
}

// Auto-hide header: hides on scroll down, shows on scroll up
function initAutoHideHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  let lastY = 0;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.pageYOffset;
      if (y > 80) {
        header.classList.add('header-scrolled');
        if (y > lastY && y > 200) header.classList.add('header-hidden');
        else header.classList.remove('header-hidden');
      } else {
        header.classList.remove('header-scrolled', 'header-hidden');
      }
      lastY = y;
      ticking = false;
    });
  }, { passive: true });
}

// Scroll reveal animations
function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
}

// FAQ accordion
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = '0';
        }
      });
      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '0';
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

(async () => {
  await loadIncludes();
  initBurger();
  highlightActiveNav();
  initAutoHideHeader();
  initScrollReveal();
  initFAQ();
})();
