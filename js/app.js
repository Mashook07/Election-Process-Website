// VoteGuide AI — Main App Controller (Security Enhanced)
import { Router } from './router.js';
import { initThreeBackground } from './three-bg.js';
import { initScrollReveal } from './utils.js';

// Dynamic imports to avoid Firebase blocking the entire app
let authModule = null;
let badgesModule = null;

async function loadModules() {
  try {
    authModule = await import('./auth.js');
    authModule.initAuth();
  } catch (e) { console.warn('Auth module load failed:', e); }
  try {
    badgesModule = await import('./badges.js');
    badgesModule.initBadges();
  } catch (e) { console.warn('Badges module load failed:', e); }
}

let threeCleanup = null;
const appEl = document.getElementById('app');
const router = new Router();

function setPage(renderFn, initFn, useThree) {
  // Clean up three.js
  if (threeCleanup) { threeCleanup(); threeCleanup = null; }
  
  appEl.style.opacity = '0';
  appEl.style.transform = 'translateY(10px)';
  
  setTimeout(() => {
    try {
      appEl.innerHTML = renderFn();
    } catch (e) {
      console.error('Page render error:', e);
      appEl.innerHTML = `<div style="padding:100px 20px;text-align:center"><h2>Something went wrong</h2><p>${e.message}</p></div>`;
    }
    
    if (initFn) {
      try { initFn(); } catch (e) { console.error('Page init error:', e); }
    }
    
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    requestAnimationFrame(() => {
      appEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      appEl.style.opacity = '1';
      appEl.style.transform = 'translateY(0)';
    });
    
    setTimeout(() => initScrollReveal(), 100);
    
    if (useThree && window.THREE) {
      const canvas = document.getElementById('three-canvas');
      if (canvas) {
        try { threeCleanup = initThreeBackground(canvas); }
        catch (e) { console.warn('Three.js error:', e); }
      }
    }
  }, 100);
}

// Lazy-load page modules
async function loadPage(modulePath, renderName, initName, useThree) {
  try {
    const mod = await import(modulePath);
    setPage(() => mod[renderName](), initName ? mod[initName] : null, useThree);
  } catch (e) {
    console.error(`Failed to load ${modulePath}:`, e);
    appEl.innerHTML = `<div style="padding:100px 20px;text-align:center"><h2>Page Load Error</h2><p>${e.message}</p></div>`;
    appEl.style.opacity = '1';
  }
}

// Register routes
router.register('/', () => loadPage('./pages-home.js', 'renderHome', null, true));
router.register('/how-to-vote', () => loadPage('./pages-home.js', 'renderHowToVote'));
router.register('/registration', () => loadPage('./pages-home.js', 'renderRegistration', 'initOCR'));
router.register('/quiz', () => loadPage('./pages-home.js', 'renderQuiz', 'initQuiz'));
router.register('/eci-map', () => loadPage('./pages-home.js', 'renderECIMap', 'initECIMap'));
router.register('/ai-assistant', () => loadPage('./pages-features.js', 'renderAIAssistant', 'initChat'));
router.register('/election-dates', () => loadPage('./pages-features.js', 'renderElectionDates'));
router.register('/parliament', () => loadPage('./pages-info.js', 'renderParliament'));
router.register('/states', () => loadPage('./pages-info.js', 'renderStates', 'initStatesTable'));
router.register('/president', () => loadPage('./pages-info.js', 'renderPresident'));
router.register('/translate', () => loadPage('./pages-features.js', 'renderTranslate', 'initTranslate'));
router.register('/updates', () => loadPage('./pages-info.js', 'renderUpdates'));
router.register('/first-time-voter', () => loadPage('./pages-info.js', 'renderFirstTimeVoter'));
router.register('/myths', () => loadPage('./pages-info.js', 'renderMyths'));
router.register('/official-links', () => loadPage('./pages-info.js', 'renderOfficialLinks'));
router.register('/text-analyzer', () => loadPage('./pages-features.js', 'renderTextAnalyzer', 'initTextAnalyzer'));
router.register('/booth-finder', () => loadPage('./pages-info.js', 'renderBoothFinder', 'initBoothFinder'));
router.register('/evm-demo', () => loadPage('./pages-info.js', 'renderEVMDemo', 'initEVMDemo'));
router.register('/badges', () => loadPage('./pages-info.js', 'renderBadgesPage'));
router.register('/profile', () => loadPage('./auth.js', 'renderProfile', 'initProfile'));

// ── Security & Voting Routes ──
router.register('/vote', () => loadPage('./voting.js', 'renderVotingBooth', 'initVotingBooth'));
router.register('/verify-identity', () => loadPage('./voter-verification.js', 'renderVerificationPage', 'initVerificationPage'));
router.register('/mfa-setup', () => loadPage('./security-pages.js', 'renderMFASetup', 'initMFASetup'));
router.register('/security-dashboard', () => loadPage('./security-pages.js', 'renderSecurityDashboard', 'initSecurityDashboard'));
router.register('/admin', () => loadPage('./security-pages.js', 'renderAdminPanel', 'initAdminPanel'));
router.register('/vote-receipt', () => loadPage('./voting.js', 'renderVoteReceipt', 'initVoteReceipt'));

// Mobile drawer helpers
function closeDrawer() {
  document.querySelector('.nav-toggle')?.classList.remove('open');
  document.querySelector('.nav-links-wrapper')?.classList.remove('open');
  document.getElementById('drawer-backdrop')?.classList.remove('open');
}

// Mobile nav toggle
document.querySelector('.nav-toggle')?.addEventListener('click', function () {
  const isOpen = this.classList.contains('open');
  if (isOpen) {
    closeDrawer();
  } else {
    this.classList.add('open');
    document.querySelector('.nav-links-wrapper')?.classList.add('open');
    document.getElementById('drawer-backdrop')?.classList.add('open');
  }
});

// Close drawer on backdrop click
document.getElementById('drawer-backdrop')?.addEventListener('click', closeDrawer);

// Close drawer on close button click
document.getElementById('drawer-close-btn')?.addEventListener('click', closeDrawer);

// Close drawer when any nav link inside the drawer is clicked
document.querySelectorAll('.nav-links-wrapper .nav-link').forEach(link => {
  link.addEventListener('click', closeDrawer);
});

// Dropdown toggle logic
document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = trigger.closest('.nav-dropdown');
    const isOpen = dropdown.classList.contains('open');

    // Close all other dropdowns
    document.querySelectorAll('.nav-dropdown.open').forEach(d => {
      if (d !== dropdown) d.classList.remove('open');
    });

    dropdown.classList.toggle('open', !isOpen);
    trigger.setAttribute('aria-expanded', !isOpen);
  });
});

// Close dropdowns on click outside (but NOT when inside the drawer)
document.addEventListener('click', (e) => {
  const wrapper = document.querySelector('.nav-links-wrapper');
  const isDrawerOpen = wrapper?.classList.contains('open');

  // If drawer is open, only close dropdowns if click is OUTSIDE the drawer
  if (isDrawerOpen && wrapper?.contains(e.target)) return;

  if (!e.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    });
  }
});

// Close dropdowns on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDrawer();
    document.querySelectorAll('.nav-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    });
  }
});

// Close drawer (and dropdown) when a dropdown item is clicked (navigating)
document.querySelectorAll('.nav-dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    });
    closeDrawer();
  });
});

// Nav scroll effect
window.addEventListener('scroll', () => {
  document.querySelector('.top-nav')?.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Translate Website Toggle ──
document.getElementById('translate-site-btn')?.addEventListener('click', () => {
  const el = document.getElementById('google_translate_element');
  if (el) {
    const isVisible = el.style.display !== 'none';
    el.style.display = isVisible ? 'none' : 'block';
  }
});

// Close translate widget on click outside
document.addEventListener('click', (e) => {
  const el = document.getElementById('google_translate_element');
  if (el && el.style.display === 'block' && !e.target.closest('#google_translate_element') && !e.target.closest('#translate-site-btn')) {
    el.style.display = 'none';
  }
});

// ── Dark/Light Mode Toggle ──
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('vg-theme', theme);
}

const savedTheme = localStorage.getItem('vg-theme') || 'light';
applyTheme(savedTheme);

document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Initialize
loadModules();
router.init();
console.log('VoteGuide AI initialized');
