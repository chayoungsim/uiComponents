export function normalizeEl(target) {
  return typeof target === 'string'
    ? document.querySelector(target)
    : target;
}

export function createRafThrottle(fn) {
  let ticking = false;
  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        fn();
        ticking = false;
      });
      ticking = true;
    }
  };
}

export function isMobile() {
  return window.matchMedia('(max-width: 1023px)').matches;
}

export function toggleScrollLock(state) {
  document.documentElement.classList.toggle('not-scroll', state);
}

export function createDimHandler(container, onClose) {
  let dimEl = null;

  return {
    create: () => {
      if (dimEl) return;
      dimEl = document.createElement('div');
      dimEl.className = 'global-dim';
      dimEl.setAttribute('aria-hidden', 'true');
      dimEl.addEventListener('click', onClose);
      container.appendChild(dimEl);
    },
    remove: () => {
      if (!dimEl) return;
      dimEl.remove();
      dimEl = null;
    }
  };
}
