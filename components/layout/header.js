function resize() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function initCommonScroll() {
  const header = document.querySelector('#header');
  if (!header) return;
  let lastScrollY = 0;
  let scrollDirection = 0;
  let ticking = false;

  const onScroll = () => {
    const scrollY = window.scrollY;
    scrollDirection =
      scrollY > lastScrollY ? 1 :
      scrollY < lastScrollY ? -1 : 0;

    lastScrollY = scrollY;
    const isHeaderFocused = header.contains(document.activeElement);
    header.classList.toggle('opaque',
      scrollY > window.innerHeight * 0.1
    );
    if (!header.classList.contains('show-sitemap') && !isHeaderFocused) {
      header.classList.toggle('hide',
        scrollDirection === 1 &&
        scrollY > window.innerHeight * 0.4
      );
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
}

function gnbToggle() {
    const gnb = document.querySelector('.gnb');
    if(gnb) {
        gnb.addEventListener('mouseenter', () => {
            header.classList.add('show-gnb');
        })
        gnb.addEventListener('mouseleave', () => {
            header.classList.remove('show-gnb');
        })
    }
}

function navbarToggle() {
    const btnNavbar = document.querySelector('.hamburger-modern');  
    if(btnNavbar) {
        btnNavbar.addEventListener('click', () => {
            header.classList.toggle('show-sitemap');
            document.querySelector('html').classList.toggle('not-scroll');
        })
    }
}

function closeSitemap() {
    const btnCloseList = document.querySelectorAll('.modal-in-header .close');
    btnCloseList.forEach(btnClose => {
        btnClose.addEventListener('click', () => {
            header.classList.remove('show-sitemap');
            document.querySelector('html').classList.remove('not-scroll');
        })  
    })
}

window.addEventListener('resize', resize, {passive: false});
window.addEventListener('orientationchange', resize);
document.addEventListener('DOMContentLoaded', () => {
    initCommonScroll();
    gnbToggle();
    navbarToggle();
    closeSitemap()
})