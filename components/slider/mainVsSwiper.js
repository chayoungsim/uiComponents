/* Main Visual Swiper Module (ES6)
 * 비디오와 이미지를 혼용하며, 원형 프로그레스 바를 제어합니다.
 */

const CIRCUMFERENCE = 88; // 2 * π * 14 ≈ 88
const KEYFRAMES_ID = 'progress-animation-style';

// 헬퍼: 애니메이션 키프레임 주입 (한 번만 실행)
const injectStyles = () => {
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `@keyframes progress-animation { to { stroke-dashoffset: 0; } }`;
  document.head.appendChild(style);
};

// 헬퍼: 프로그레스 바 기본 상태 설정
const setProgressBarReady = (bar) => {
  if (!bar) return;
  bar.style.strokeDasharray = String(CIRCUMFERENCE);
  bar.style.strokeDashoffset = String(CIRCUMFERENCE);
};

export function mainVsSwiper(options = {}) {
  const {
    autoplayDelay = 5000,
    selector = '.swiper-visual',
    startPaused = false
  } = options;

  const container = document.querySelector(selector);
  if (!container) return null;

  let swiperInstance = null;
  let unbindPrevVideo = null;

  injectStyles();
  if (startPaused) container.classList.add('is-paused');

  // --- 내부 로직 함수들 ---
  const resetAllBars = (swiper) => {
    const bullets = swiper.pagination?.bullets;
    const bars = bullets?.length
      ? Array.from(bullets).map(b => b.querySelector('.progress-bar')).filter(Boolean)
      : Array.from(container.querySelectorAll('.progress-bar'));

    bars.forEach(bar => {
      bar.style.animation = 'none';
      void bar.offsetWidth; // Restart animation trigger
      setProgressBarReady(bar);
      bar.style.animationPlayState = 'paused';
    });
  };

  const wireVideo = (swiper, video, progressBar, wasPaused) => {
    const onEnded = () => {
      if (!container.classList.contains('is-paused') && swiper.pagination.bullets.length > 1) {
        swiper.slideNext();
      }
    };

    const setupVideo = () => {
      progressBar.style.animation = `progress-animation ${video.duration}s linear forwards`;
      if (wasPaused) {
        progressBar.style.animationPlayState = 'paused';
        video.pause();
      } else {
        progressBar.style.animationPlayState = 'running';
        video.play().catch(() => setTimeout(() => swiper.slideNext(), 200));
      }
    };

    if (video.readyState >= 1) setupVideo();
    else video.addEventListener('loadedmetadata', setupVideo, { once: true });

    video.addEventListener('ended', onEnded);
    return () => video.removeEventListener('ended', onEnded);
  };

  const handleSlideChange = (swiper) => {
    if (!swiper || !swiper.slides) return;

    const wasPaused = container.classList.contains('is-paused');
    resetAllBars(swiper);

    const activeSlide = swiper.slides[swiper.activeIndex];
    const activeBullet = swiper.pagination.bullets[swiper.realIndex];
    if (!activeSlide || !activeBullet) return;

    const progressBar = activeBullet.querySelector('.progress-bar');
    if (!progressBar) return;

    // 이전 비디오 이벤트 해제
    if (unbindPrevVideo) { unbindPrevVideo(); unbindPrevVideo = null; }

    const video = activeSlide.querySelector('video');
    if (video) {
      swiper.autoplay.stop();
      video.currentTime = 0;
      setProgressBarReady(progressBar);
      unbindPrevVideo = wireVideo(swiper, video, progressBar, wasPaused);
    } else {
      const duration = parseInt(activeSlide.getAttribute('data-duration'), 10) || autoplayDelay;
      swiper.params.autoplay.delay = duration;
      setProgressBarReady(progressBar);
      progressBar.style.animation = `progress-animation ${duration / 1000}s linear forwards`;

      if (wasPaused) {
        swiper.autoplay.stop();
        progressBar.style.animationPlayState = 'paused';
      } else {
        swiper.autoplay.stop();
        swiper.autoplay.start();
        progressBar.style.animationPlayState = 'running';
      }
    }
  };

  // --- 스와이퍼 초기화 ---
  swiperInstance = new Swiper(selector, {
    loop: true,
    autoplay: { delay: autoplayDelay, disableOnInteraction: false },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      renderBullet: (index, className) => `
        <button type="button" class="${className}">
          <svg class="progress-circle" viewBox="0 0 30 30">
            <circle class="bg" cx="15" cy="15" r="14"></circle>
            <circle class="progress-bar" cx="15" cy="15" r="14"></circle>
          </svg>
          <span>${index + 1}</span>
        </button>`,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    on: {
      init: function() { handleSlideChange(this); },
      slideChange: function() { handleSlideChange(this); },
    },
  });

  // --- 공통 제어 함수 ---
  const playSlider = () => {
    container.classList.remove('is-paused');
    const video = swiperInstance.slides[swiperInstance.activeIndex]?.querySelector('video');
    const bar = swiperInstance.pagination.bullets[swiperInstance.realIndex]?.querySelector('.progress-bar');

    if (bar) bar.style.animationPlayState = 'running';
    if (video) video.play().catch(() => {});
    else {
      swiperInstance.autoplay.stop();
      swiperInstance.autoplay.start();
    }
    document.querySelector('.swiper-button-play')?.setAttribute('aria-pressed', 'true');
    document.querySelector('.swiper-button-pause')?.setAttribute('aria-pressed', 'false');
  };

  const pauseSlider = () => {
    container.classList.add('is-paused');
    const video = swiperInstance.slides[swiperInstance.activeIndex]?.querySelector('video');
    const bar = swiperInstance.pagination.bullets[swiperInstance.realIndex]?.querySelector('.progress-bar');

    if (bar) bar.style.animationPlayState = 'paused';
    if (video) video.pause();
    else swiperInstance.autoplay.stop();
    document.querySelector('.swiper-button-pause')?.setAttribute('aria-pressed', 'true');
    document.querySelector('.swiper-button-play')?.setAttribute('aria-pressed', 'false');
  };

  // --- 이벤트 바인딩 ---
  document.querySelector('.swiper-button-play')?.addEventListener('click', playSlider);
  document.querySelector('.swiper-button-pause')?.addEventListener('click', pauseSlider);

  document.addEventListener('visibilitychange', () => {
    if (!swiperInstance) return;
    const video = swiperInstance.slides[swiperInstance.activeIndex]?.querySelector('video');
    const bar = swiperInstance.pagination.bullets[swiperInstance.realIndex]?.querySelector('.progress-bar');

    if (document.hidden) {
      swiperInstance.autoplay.stop();
      video?.pause();
      if (bar) bar.style.animationPlayState = 'paused';
    } else if (!container.classList.contains('is-paused')) {
      if (video) video.play().catch(() => {});
      else { swiperInstance.autoplay.stop(); swiperInstance.autoplay.start(); }
      if (bar) bar.style.animationPlayState = 'running';
    }
  });

  return { swiper: swiperInstance, play: playSlider, pause: pauseSlider };
}