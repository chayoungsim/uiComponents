export function createHeaderController({
  header,
  headerNav,
  hamburger,
  globalPanel,
  options = {}
}) {
  const headerEl =
    typeof header === 'string' ? document.querySelector(header) : header;

  const hamburgerEl =
    typeof hamburger === 'string'
      ? document.querySelector(hamburger)
      : hamburger;

  const globalPanelEl =
    typeof globalPanel === 'string'
      ? document.querySelector(globalPanel)
      : globalPanel;

  const headerNavEl =
    typeof headerNav === 'string'
        ? document.querySelector(headerNav)
        : headerNav;

  if (!headerEl || !headerNavEl) return;  
 

    let ticking = false;
    let navTriggerY = 0;

    const updateNavTrigger = () => {
        navTriggerY = headerNavEl.getBoundingClientRect().top + window.scrollY;
    };

    updateNavTrigger();
    window.addEventListener('resize', updateNavTrigger);




    navTriggerY = headerNavEl.getBoundingClientRect().top + window.scrollY;

    headerEl.style.setProperty(
  '--nav-height',
  `${headerNavEl.offsetHeight}px`
);

  /* -----------------------------
   * Scroll behavior
   * ----------------------------- */
const onScroll = () => {
  const scrollY = window.scrollY;

  if (scrollY >= navTriggerY) {
    headerEl.classList.add('is-fixed');
  } else {
    headerEl.classList.remove('is-fixed');
  }

  ticking = false;
};

  const onScrollHandler = () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScrollHandler, { passive: true });

  /* -----------------------------
   * Dim helpers
   * ----------------------------- */
  let dimEl = null;

  const createDim = () => {
    if (dimEl) return;

    dimEl = document.createElement('div');
    dimEl.className = 'global-dim';
    dimEl.setAttribute('aria-hidden', 'true');

    dimEl.addEventListener('click', closeGlobalPanel);
    headerEl.appendChild(dimEl);
  };

  const removeDim = () => {
    if (!dimEl) return;
    dimEl.remove();
    dimEl = null;
  };

  /* -----------------------------
   * Global panel control
   * ----------------------------- */
  const openGlobalPanel = () => {
    hamburgerEl.classList.add('active');
    globalPanelEl.classList.add('is-open');

    document.documentElement.classList.add('not-scroll');
    hamburgerEl.setAttribute('aria-expanded', 'true');

    createDim();
  };

  const closeGlobalPanel = () => {
    hamburgerEl.classList.remove('active');
    globalPanelEl.classList.remove('is-open');

    document.documentElement.classList.remove('not-scroll');
    hamburgerEl.setAttribute('aria-expanded', 'false');

    removeDim();
  };

  const toggleGlobalPanel = () => {
    const isOpen = globalPanelEl.classList.contains('is-open');
    isOpen ? closeGlobalPanel() : openGlobalPanel();
  };

  if (hamburgerEl && globalPanelEl) {
    hamburgerEl.addEventListener('click', toggleGlobalPanel);
  }
}
