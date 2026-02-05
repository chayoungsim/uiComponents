export function createHeaderController({
  header,
  gnb,
  navbarBtn,
  closeBtn,
  options = {}
}) {
  const headerEl = typeof header === 'string' ? document.querySelector(header) : header;

  if (!headerEl) return;

  const {
    opaqueOffset = 0.1,
    hideOffset = 0.4
  } = options;

  let lastScrollY = 0;
  let ticking = false;

  /* ---------------------------------
   * Scroll behavior
   * --------------------------------- */
  const onScroll = () => {
    const scrollY = window.scrollY;
    const scrollDirection =
      scrollY > lastScrollY ? 1 :
      scrollY < lastScrollY ? -1 : 0;

    lastScrollY = scrollY;

    const isHeaderFocused = headerEl.contains(document.activeElement);

    headerEl.classList.toggle(
      'opaque',
      scrollY > window.innerHeight * opaqueOffset
    );

    if (
      !headerEl.classList.contains('show-sitemap') &&
      !isHeaderFocused
    ) {
      headerEl.classList.toggle(
        'hide',
        scrollDirection === 1 &&
        scrollY > window.innerHeight * hideOffset
      );
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

  /* ---------------------------------
   * GNB hover
   * --------------------------------- */
  if (gnb) {
    const gnbEl =
      typeof gnb === 'string'
        ? headerEl.querySelector(gnb)
        : gnb;

    const open = () => headerEl.classList.add('show-gnb');
    const close = () => headerEl.classList.remove('show-gnb');      

    if (gnbEl) {
        const firstLink = gnbEl.querySelector('li:first-child > a');
        const lastLink = gnbEl.querySelector('li.esg .submenu ul li:last-child > a');
        gnbEl.addEventListener('mouseenter', open);
        gnbEl.addEventListener('mouseleave', close);
        firstLink.addEventListener('focusin', open);
        lastLink.addEventListener('focusout', close);
    }
  }

 /* ---------------------------------
 * Navbar toggle + Modal focus trap
 * --------------------------------- */
if (navbarBtn && closeBtn) {
  const btn =
    typeof navbarBtn === 'string'
      ? headerEl.querySelector(navbarBtn)
      : navbarBtn;

  const modal = headerEl.querySelector('.modal-in-header');

  const closeBtns =
    typeof closeBtn === 'string'
      ? modal.querySelectorAll(closeBtn)
      : closeBtn;

  if (!btn || !modal || !closeBtns.length) return;

  let lastFocusedEl = null;

  const focusableSelector = `
    a[href],
    button:not([disabled]),
    input:not([disabled]),
    select:not([disabled]),
    textarea:not([disabled]),
    [tabindex]:not([tabindex="-1"])
  `;

  const getFocusableEls = () => Array.from(modal.querySelectorAll(focusableSelector)).filter(el => el.offsetParent !== null);

  const openModal = () => {
    lastFocusedEl = document.activeElement;

    headerEl.classList.add('show-sitemap');
    document.documentElement.classList.add('not-scroll');
    modal.hidden = false;

    closeBtns[0].focus();
    modal.addEventListener('keydown', trapFocus);
  };

  const closeModal = () => {
    headerEl.classList.remove('show-sitemap');
    document.documentElement.classList.remove('not-scroll');
    modal.hidden = true;

    modal.removeEventListener('keydown', trapFocus);

    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus();
    }
  };

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusableEls = getFocusableEls();
    if (focusableEls.length === 0) return;    
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }

  const handleEscape = (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  };

  btn.addEventListener('click', openModal);
  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
  document.addEventListener('keydown', handleEscape);
}






  /* ---------------------------------
   * Destroy (optional)
   * --------------------------------- */
  return {
    destroy() {
      window.removeEventListener('scroll', onScrollHandler);
    }
  };
}
