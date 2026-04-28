// ============================================
// VoteGuide AI — SPA Router
// ============================================

export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = '';
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    this.currentRoute = hash;

    // Update active nav link (primary links)
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${hash}`);
    });

    // Update active state for dropdown items and their triggers
    document.querySelectorAll('.nav-dropdown-item').forEach(item => {
      const isActive = item.getAttribute('href') === `#${hash}`;
      item.classList.toggle('active', isActive);
    });

    // Highlight dropdown trigger if any child is active
    document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
      const hasActiveChild = dropdown.querySelector('.nav-dropdown-item.active');
      dropdown.querySelector('.nav-dropdown-trigger')?.classList.toggle('active', !!hasActiveChild);
    });

    // Close mobile menu
    const wrapper = document.querySelector('.nav-links-wrapper');
    const toggle = document.querySelector('.nav-toggle');
    const backdrop = document.getElementById('drawer-backdrop');
    if (wrapper) wrapper.classList.remove('open');
    if (toggle) toggle.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');

    // Execute route handler
    if (this.routes[hash]) {
      this.routes[hash]();
    } else {
      this.routes['/']?.();
    }
  }

  init() {
    this.handleRoute();
  }
}
