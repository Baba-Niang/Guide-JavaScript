// ============================================================
// JAVASCRIPT DÉCRYPTÉ — Navigation & interactions
// Même logique générale que le Guide Java (slides horizontales,
// clavier, molette, sidebar active, thème, fiches dépliables).
// ============================================================

// === THEME MANAGEMENT ===
function getStoredTheme() {
  try { return localStorage.getItem('js-decrypte-theme'); } catch (e) { return null; }
}
function setStoredTheme(theme) {
  try { localStorage.setItem('js-decrypte-theme', theme); } catch (e) { /* mode privé */ }
}
function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark'; // le noir & jaune JS est l'identité par défaut
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.setAttribute('aria-label', theme === 'light' ? 'Passer au thème sombre' : 'Passer au thème clair');
    btn.setAttribute('title', theme === 'light' ? 'Passer au thème sombre' : 'Passer au thème clair');
  }
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  setStoredTheme(next);
}

// === Hauteur réelle de la topbar (exposée en variable CSS) ===
function updateTopbarHeight() {
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    document.documentElement.style.setProperty('--topbar-h', topbar.offsetHeight + 'px');
  }
}

// === Masquer/afficher la sidebar des chapitres ===
function applySidebarState(collapsed) {
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  const btn = document.getElementById('sidebarToggleBtn');
  if (btn) {
    btn.setAttribute('aria-label', collapsed ? 'Afficher la liste des chapitres' : 'Masquer la liste des chapitres');
    btn.setAttribute('title', collapsed ? 'Afficher la liste des chapitres' : 'Masquer la liste des chapitres');
  }
}
function toggleSidebar() {
  const collapsed = !document.body.classList.contains('sidebar-collapsed');
  applySidebarState(collapsed);
  try { localStorage.setItem('jsDecrypteSidebarCollapsed', collapsed ? '1' : '0'); } catch (e) { /* ignore */ }
}
function initSidebarStateEarly() {
  let collapsed = false;
  try { collapsed = localStorage.getItem('jsDecrypteSidebarCollapsed') === '1'; } catch (e) { /* ignore */ }
  applySidebarState(collapsed);
}

// === FICHE TOGGLE (déplier / replier) ===
function toggleFiche(btn) {
  const card = btn.closest('.fiche-card');
  const content = card.querySelector('.fiche-content');
  const isOpen = card.classList.contains('open');
  card.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
  if (!isOpen) {
    // Au moment de l'ouverture, force le chargement paresseux de l'image
    const img = content.querySelector('img');
    if (img && img.loading === 'lazy' && !img.src) img.src = img.dataset.src || img.src;
  }
}

// === IMAGE TOGGLE ===
function toggleImage(btn) {
  const scope = btn.closest('.fiche-card');
  const imgWrap = scope ? scope.querySelector('.fiche-image-wrap') : null;
  if (!imgWrap) return;
  const isHidden = getComputedStyle(imgWrap).display === 'none';
  if (isHidden) {
    imgWrap.style.display = 'block';
    btn.innerHTML = '🖼 Masquer l\'image';
  } else {
    imgWrap.style.display = 'none';
    btn.innerHTML = '🖼 Voir l\'image source';
  }
}

// === COPY CODE ===
function copyCode(btn) {
  const code = btn.getAttribute('data-code');
  const txt = document.createElement('textarea');
  txt.innerHTML = code;
  const unescaped = txt.value;
  const done = () => {
    const original = btn.innerHTML;
    btn.innerHTML = '✅ Copié';
    setTimeout(() => { btn.innerHTML = original; }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(unescaped).then(done).catch(() => fallbackCopy(unescaped, done));
  } else {
    fallbackCopy(unescaped, done);
  }
}
function fallbackCopy(text, done) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try { document.execCommand('copy'); } catch (e) { /* ignore */ }
  document.body.removeChild(textarea);
  done();
}

// === SCROLL TO CHAPTER (horizontal) ===
var CHAPTERS = [
  { id: 'decouvrir', number: '01', title: 'Découvrir JavaScript', count: '5 fiches' },
  { id: 'variables', number: '02', title: 'Variables', count: '6 fiches' },
  { id: 'types', number: '03', title: 'Types de données', count: '7 fiches' },
  { id: 'operateurs', number: '04', title: 'Opérateurs', count: '13 fiches' },
  { id: 'conditions', number: '05', title: 'Conditions', count: '2 fiches' },
  { id: 'boucles', number: '06', title: 'Boucles', count: '8 fiches' },
  { id: 'chaines', number: '07', title: 'Chaînes de caractères', count: '12 fiches' },
  { id: 'nombres', number: '08', title: 'Nombres', count: '8 fiches' },
  { id: 'tableaux', number: '09', title: 'Tableaux', count: '12 fiches' },
  { id: 'fonctions', number: '10', title: 'Fonctions', count: '7 fiches' },
  { id: 'objets', number: '11', title: 'Objets', count: '6 fiches' },
  { id: 'poo', number: '12', title: 'Programmation orientée objet', count: '32 fiches' },
  { id: 'collections', number: '13', title: 'Collections et itérateurs', count: '8 fiches' },
  { id: 'generateurs', number: '14', title: 'Générateurs', count: '3 fiches' },
  { id: 'erreurs', number: '15', title: 'Gestion des erreurs', count: '7 fiches' },
  { id: 'json', number: '16', title: 'JSON', count: '6 fiches' },
  { id: 'asynchronisme', number: '17', title: 'Asynchronisme', count: '8 fiches' },
  { id: 'promesses', number: '18', title: 'Promesses', count: '6 fiches' },
  { id: 'async-await', number: '19', title: 'async / await', count: '4 fiches' },
  { id: 'event-loop', number: '20', title: 'Execution JavaScript', count: '7 fiches' },
  { id: 'modules', number: '21', title: 'Modules', count: '11 fiches' },
  { id: 'dom', number: '22', title: 'DOM et navigateur', count: '17 fiches' },
  { id: 'http-api-fetch', number: '23', title: 'HTTP, APIs et Fetch', count: '20 fiches' },
  { id: 'node-intro', number: '24', title: 'Introduction a Node.js', count: '3 fiches' },
  { id: 'node-packages', number: '25', title: 'Packages Node.js', count: '5 fiches' },
  { id: 'node-config', number: '26', title: 'Configuration et modules Node.js', count: '10 fiches' },
  { id: 'backend', number: '27', title: 'Backend Node.js', count: '19 fiches' }
];
var CHAPTERS_IDS = CHAPTERS.map(function (chapter) { return chapter.id; });

function addNewChapterNavigation() {
  var newChapters = CHAPTERS;
  document.querySelectorAll('.sidebar-list').forEach(function (list) {
    if (!list.children.length) {
      var brand = document.querySelector('.sidebar-brand');
      if (brand) list.parentNode.insertBefore(brand.cloneNode(true), list);
    }
    newChapters.forEach(function (chapter) {
      if (list.querySelector('[data-chapter="' + chapter.id + '"]')) return;
      var item = document.createElement('li');
      item.innerHTML = '<a class="sidebar-item" data-chapter="' + chapter.id + '" href="#' + chapter.id + '">' +
        '<span class="sidebar-num">' + chapter.number + '</span>' +
        '<div class="sidebar-text"><div class="sidebar-title">' + chapter.title + '</div><div class="sidebar-count">' + chapter.count + '</div></div>' +
        '<span class="sidebar-chevron" aria-hidden="true">›</span></a>';
      list.appendChild(item);
    });
  });
  var mobileNav = document.getElementById('mobileNav');
  if (mobileNav) {
    newChapters.forEach(function (chapter) {
      if (mobileNav.querySelector('[data-chapter="' + chapter.id + '"]')) return;
      var chip = document.createElement('a');
      chip.className = 'mobile-chip';
      chip.dataset.chapter = chapter.id;
      chip.href = '#' + chapter.id;
      chip.innerHTML = '<span class="chip-num">' + chapter.number + '</span><span class="chip-dot"></span><span class="chip-label">' + chapter.title + '</span>';
      mobileNav.appendChild(chip);
    });
  }
  document.querySelectorAll('.sidebar-brand-sub').forEach(function (el) { el.textContent = '252 · 27 ch.'; });
  document.querySelectorAll('.sidebar-item, .mobile-chip').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href && href.charAt(0) === '#' && href.length > 1) {
        e.preventDefault();
        scrollToChapter(href.slice(1));
      }
    });
  });
}

function scrollToChapter(id) {
  const slide = document.getElementById('slide-' + id);
  if (slide) {
    const container = document.getElementById('slidesContainer');
    if (container) container.scrollTop = 0;
    slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* ignore */ }
  } else {
    const container = document.getElementById('slidesContainer');
    if (container) {
      const idx = CHAPTERS_IDS.indexOf(id);
      if (idx >= 0) container.scrollTo({ left: (idx + 1) * container.offsetWidth, behavior: 'smooth' });
    }
  }
}

// === SCROLL TO TOP (retour au début) ===
function scrollToTop() {
  const container = document.getElementById('slidesContainer');
  if (container) container.scrollTo({ left: 0, behavior: 'smooth' });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

// === HORIZONTAL SLIDE NAVIGATION ===
function navigateSlides(direction) {
  const container = document.getElementById('slidesContainer');
  if (!container) return;
  const slideWidth = container.offsetWidth;
  const currentIdx = Math.round(container.scrollLeft / slideWidth);
  const newIdx = Math.max(0, Math.min(container.children.length - 1, currentIdx + direction));
  container.scrollTop = 0; // sécurité : jamais de décalage vertical résiduel
  container.scrollTo({ left: newIdx * slideWidth, behavior: 'smooth' });
}
function goToSlide(index) {
  const container = document.getElementById('slidesContainer');
  if (!container) return;
  container.scrollTop = 0;
  container.scrollTo({ left: index * container.offsetWidth, behavior: 'smooth' });
}

// === UPDATE SLIDE COUNTER & PROGRESS ===
function updateSlideUI() {
  const container = document.getElementById('slidesContainer');
  if (!container) return;
  const slideWidth = container.offsetWidth || 1;
  const currentIdx = Math.min(
    container.children.length - 1,
    Math.max(0, Math.round(container.scrollLeft / slideWidth))
  );
  const totalSlides = container.children.length;

  const currentEl = document.getElementById('slideCurrent');
  if (currentEl) currentEl.textContent = currentIdx + 1;
  const totalEl = document.getElementById('slideTotal');
  if (totalEl) totalEl.textContent = totalSlides;

  const progressEl = document.getElementById('progressFill');
  if (progressEl) progressEl.style.width = (((currentIdx + 1) / totalSlides) * 100) + '%';

  const prevBtn = document.getElementById('navPrev');
  const nextBtn = document.getElementById('navNext');
  if (prevBtn) prevBtn.disabled = currentIdx === 0;
  if (nextBtn) nextBtn.disabled = currentIdx === totalSlides - 1;

  const hint = document.getElementById('scrollHint');
  if (hint && currentIdx > 0) hint.classList.add('hidden');

  // Sidebar + chips actives
  const currentSlide = container.children[currentIdx];
  if (currentSlide) {
    const chapterId = currentSlide.getAttribute('data-chapter-id');
    if (chapterId) {
      document.querySelectorAll('.sidebar-item').forEach(function (item) {
        item.classList.toggle('active', item.dataset.chapter === chapterId);
      });
      document.querySelectorAll('.mobile-chip').forEach(function (chip) {
        chip.classList.toggle('active', chip.dataset.chapter === chapterId);
      });
      // Fait défiler la sidebar/mobile-nav pour garder l'item visible
      const activeSidebar = document.querySelector('.sidebar-item.active');
      if (activeSidebar && activeSidebar.scrollIntoView) {
        // scrollIntoView horizontal dans le nav sticky uniquement
        const nav = activeSidebar.closest('nav');
        if (nav) {
          const top = activeSidebar.offsetTop - nav.offsetTop;
          if (top < nav.scrollTop || top > nav.scrollTop + nav.clientHeight - 60) {
            nav.scrollTo({ top: Math.max(0, top - 40), behavior: 'smooth' });
          }
        }
      }
      const activeChip = document.querySelector('.mobile-chip.active');
      if (activeChip && activeChip.scrollIntoViewIfNeeded) {
        try { activeChip.scrollIntoViewIfNeeded(false); } catch (e) { /* ignore */ }
      }
    } else {
      document.querySelectorAll('.sidebar-item, .mobile-chip').forEach(function (item) {
        item.classList.remove('active');
      });
    }
  }
}

// === SIDEBAR ACTIVE TRACKING (via scroll horizontal) ===
function setupSidebarTracking() {
  const container = document.getElementById('slidesContainer');
  if (!container) return;
  let scrollTimer;
  container.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateSlideUI, 60);
  }, { passive: true });
  window.addEventListener('resize', updateSlideUI);
  updateSlideUI();
}

// === KEYBOARD NAVIGATION ===
function setupKeyboardNav() {
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); navigateSlides(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); navigateSlides(1); }
    else if (e.key === 'Home') { e.preventDefault(); goToSlide(0); }
    else if (e.key === 'End') {
      e.preventDefault();
      const container = document.getElementById('slidesContainer');
      if (container) goToSlide(container.children.length - 1);
    }
  });
}

// === WHEEL NAVIGATION (vertical -> horizontal, comme le Guide Java) ===
function setupWheelNav() {
  const container = document.getElementById('slidesContainer');
  if (!container) return;
  let isAnimating = false;
  container.addEventListener('wheel', function (e) {
    // Si le contenu de la slide est scrollable verticalement, le laisser défiler
    const currentSlide = container.children[Math.round(container.scrollLeft / container.offsetWidth)];
    if (currentSlide && currentSlide.scrollHeight > currentSlide.clientHeight) {
      const atTop = currentSlide.scrollTop <= 0;
      const atBottom = currentSlide.scrollTop + currentSlide.clientHeight >= currentSlide.scrollHeight - 2;
      if (e.deltaY < 0 && !atTop) return;   // scroll vertical vers le haut
      if (e.deltaY > 0 && !atBottom) return; // scroll vertical vers le bas
    }
    // Sinon : la molette navigue entre les chapitres
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      if (isAnimating) return;
      isAnimating = true;
      navigateSlides(e.deltaY > 0 ? 1 : -1);
      setTimeout(function () { isAnimating = false; }, 420);
    }
  }, { passive: false });
}

// === TOUCH : swipe horizontal natif assuré par scroll-snap ===
// (les slides utilisent overflow-x + scroll-snap, le swipe marche nativement)

// === PARTICLES (carrés jaunes façon JS) ===
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 9; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = 5 + (i % 3) * 3;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = (6 + i * 10.5) + '%';
    particle.style.animationDelay = (i * 1.3) + 's';
    particle.style.animationDuration = (8 + i * 1.7) + 's';
    particle.style.opacity = 0.22;
    container.appendChild(particle);
  }
}

// === SMOOTH SCROLL pour liens sidebar / chips / footer ===
function setupSmoothScroll() {
  document.querySelectorAll('.sidebar-item, .mobile-chip, .footer-links a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        scrollToChapter(href.slice(1));
      }
    });
  });
}

// === HASH : ouvrir directement un chapitre (#boucles, #nombres...) ===
function applyInitialHash() {
  const id = (location.hash || '').slice(1);
  if (!id) return;
  const slide = document.getElementById('slide-' + id);
  const container = document.getElementById('slidesContainer');
  if (slide && container) {
    const idx = Array.prototype.indexOf.call(container.children, slide);
    if (idx > 0) container.scrollTo({ left: idx * container.offsetWidth, behavior: 'auto' });
  }
}

// === INIT ===
document.addEventListener('DOMContentLoaded', function () {
  requestAnimationFrame(function () {
    document.body.classList.add('theme-ready');
  });

  applyTheme(getPreferredTheme());
  initSidebarStateEarly();
  updateTopbarHeight();
  window.addEventListener('resize', updateTopbarHeight);

  createParticles();
  addNewChapterNavigation();
  setupSidebarTracking();
  setupSmoothScroll();
  setupKeyboardNav();
  setupWheelNav();
  applyInitialHash();

  console.log('🟨 JavaScript Décrypté — site chargé');
  console.log('📖 252 fiches · 27 chapitres · Baba Niang');
  console.log('⌨️  Utilise ← → pour naviguer entre les chapitres, Home / End pour les extrémités');
});
