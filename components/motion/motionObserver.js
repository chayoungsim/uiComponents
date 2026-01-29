// motionObserver.js
export function createMotionObserver({
  targetSelector = '.n-motion',
  activeClass = 'n-active',
  root = null,
  rootMargin = '0px',
  threshold = 0
} = {}) {
  const targets = document.querySelectorAll(targetSelector);
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add(activeClass);
        } else if (entry.boundingClientRect.top > 0) {
            entry.target.classList.remove(activeClass);
        }
    });
    },
    { root, rootMargin, threshold }
  );

  targets.forEach(el => observer.observe(el));
}
