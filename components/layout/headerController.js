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

    if (gnbEl) {
      gnbEl.addEventListener('mouseenter', () => {
        headerEl.classList.add('show-gnb');
      });

      gnbEl.addEventListener('mouseleave', () => {
        headerEl.classList.remove('show-gnb');
      });
    }
  }

  /* ---------------------------------
   * Navbar toggle
   * --------------------------------- */
  if (navbarBtn) {
    const btn =
      typeof navbarBtn === 'string'
        ? headerEl.querySelector(navbarBtn)
        : navbarBtn;

    if (btn) {
      btn.addEventListener('click', () => {
        headerEl.classList.toggle('show-sitemap');
        document.documentElement.classList.toggle('not-scroll');
      });
    }
  }

  /* ---------------------------------
   * Close sitemap
   * --------------------------------- */
  if (closeBtn) {
    const closeBtns =
      typeof closeBtn === 'string'
        ? headerEl.querySelectorAll(closeBtn)
        : closeBtn;

    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        headerEl.classList.remove('show-sitemap');
        document.documentElement.classList.remove('not-scroll');
      });
    });
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
