// motionScrollTrigger.js
// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';



gsap.registerPlugin(ScrollTrigger);

export function createMotionScrollTrigger({
  targetSelector = '.n-motion',
  activeClass = 'n-active',
  start = 'top 80%',
  end = 'bottom 20%',
  once = false
} = {}) {
  const targets = document.querySelectorAll(targetSelector);
  if (!targets.length) return;

  targets.forEach(target => {
    ScrollTrigger.create({
      trigger: target,
      start,
      end,
      toggleClass: {
        targets: target,
        className: activeClass
      },
      once
    });
  });
}
