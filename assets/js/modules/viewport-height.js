/* viewport-height.js 모바일 브라우저의 viewport height 문제 해결 */
let resizeTimer = null;

const setVh = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

const handleResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(setVh, 100);
};

const handleOrientation = () => {
  setTimeout(setVh, 100);
};

export const init = () => {
  setVh();
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleOrientation);
};

export const destroy = () => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('orientationchange', handleOrientation);
  clearTimeout(resizeTimer);
};

export default { init, destroy };