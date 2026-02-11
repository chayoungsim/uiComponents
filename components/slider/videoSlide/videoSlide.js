import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

const progressBar = document.querySelector('.custom-progress-bar');
const playPauseBtn = document.querySelector('.btn-play-pause');

let progressAnimation;
let startTime;
let isPaused = false;
let pausedTime = 0;
let pauseStartTime = 0;
let currentVideoPlayPromise = null; // 현재 재생 중인 비디오 Promise 추적

const swiper = new Swiper('.swiper', {
  loop: true,
  autoplay: false,
  on: {
    init: function () {
      updateSlide(this);
    },
    slideChange: function () {
      updateSlide(this);
    }
  }
});

async function updateSlide(swiperInstance) {
  const activeSlide = swiperInstance.slides[swiperInstance.activeIndex];
  const type = activeSlide.getAttribute('data-type');
  const video = activeSlide.querySelector('video');

  animateText(activeSlide);
  
  // 모든 비디오 안전하게 초기화
  await stopAllVideos();

  // 상태 초기화
  cancelAnimationFrame(progressAnimation);
  progressBar.style.transform = 'scaleX(0)';
  startTime = performance.now();
  isPaused = false;
  pausedTime = 0;
  pauseStartTime = 0;
  playPauseBtn.textContent = '정지';

  if (type === 'video' && video) {
    // 비디오 슬라이드 제어
    try {
      currentVideoPlayPromise = video.play();
      await currentVideoPlayPromise;
      animateVideoProgress(video, swiperInstance);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('비디오 재생 실패:', err);
      }
      // 재생 실패 시 이미지처럼 5초 대기 후 넘어가기
      animateImageProgress(5000, swiperInstance);
    } finally {
      currentVideoPlayPromise = null;
    }
    
    // 비디오 종료 시 다음 슬라이드로
    video.addEventListener('ended', () => {
      swiperInstance.slideNext();
    }, { once: true });

  } else {
    // 이미지 슬라이드 제어
    const duration = parseInt(activeSlide.getAttribute('data-duration')) || 5000;
    animateImageProgress(duration, swiperInstance);
  }
}

/**
 * 모든 비디오를 안전하게 정지
 */
async function stopAllVideos() {
  const videos = document.querySelectorAll('video');
  
  for (const v of videos) {
    // play() promise가 진행 중이면 완료될 때까지 대기
    if (currentVideoPlayPromise && v.paused === false) {
      try {
        await currentVideoPlayPromise;
      } catch (err) {
        // AbortError는 무시
      }
    }
    
    // 안전하게 pause 호출
    try {
      v.pause();
    } catch (err) {
      // pause 에러 무시
    }
    
    v.currentTime = 0;
  }
}

/**
 * 이미지 프로그래스 애니메이션
 */
function animateImageProgress(duration, swiperInstance) {
  function frame(now) {
    if (isPaused) {
      if (!pauseStartTime) {
        pauseStartTime = now;
      }
      progressAnimation = requestAnimationFrame(frame);
      return;
    }

    if (pauseStartTime) {
      pausedTime += (now - pauseStartTime);
      pauseStartTime = 0;
    }

    const elapsed = now - startTime - pausedTime;
    const progress = Math.min(elapsed / duration, 1);
    
    progressBar.style.transform = `scaleX(${progress})`;

    if (progress < 1) {
      progressAnimation = requestAnimationFrame(frame);
    } else {
      swiperInstance.slideNext();
    }
  }
  progressAnimation = requestAnimationFrame(frame);
}

/**
 * 비디오 프로그래스 애니메이션
 */
function animateVideoProgress(video, swiperInstance) {
  function frame() {
    if (isPaused) {
      progressAnimation = requestAnimationFrame(frame);
      return;
    }

    const duration = video.duration;
    if (!duration || !isFinite(duration)) {
      progressAnimation = requestAnimationFrame(frame);
      return;
    }

    const progress = Math.min(video.currentTime / duration, 1);
    progressBar.style.transform = `scaleX(${progress})`;

    if (!video.ended && !video.paused) {
      progressAnimation = requestAnimationFrame(frame);
    }
  }
  progressAnimation = requestAnimationFrame(frame);
}

/**
 * 재생/정지 버튼 연동
 */
playPauseBtn.addEventListener('click', async () => {
  const activeSlide = swiper.slides[swiper.activeIndex];
  const video = activeSlide.querySelector('video');

  isPaused = !isPaused;

  if (isPaused) {
    if (video) {
      try {
        await video.pause();
      } catch (err) {
        // pause 에러 무시
      }
    }
    playPauseBtn.textContent = '재생';
  } else {
    if (video) {
      try {
        await video.play();
      } catch (err) {
        console.error('비디오 재생 재개 실패:', err);
      }
    }
    playPauseBtn.textContent = '정지';
  }
});


function animateText(activeSlide) {
  const textElements = activeSlide.querySelectorAll('.swiper-text p');
  
  textElements.forEach((el, index) => {
    // 1. 기존 애니메이션 제거 및 초기화
    el.style.opacity = '0';
    
    // 2. Web Animations API 실행
    el.animate([
      { opacity: 0, transform: 'translateY(30px)' }, // 시작 상태
      { opacity: 1, transform: 'translateY(0)' }     // 종료 상태
    ], {
      duration: 500,           // 0.8초 동안 실행
      delay: index * 200,      // 요소별 0.2초씩 시차 부여 (Stagger)
      fill: 'forwards',        // 애니메이션 종료 후 상태 유지
      easing: 'ease-out'       // 부드러운 감속
    });
  });
}



/**
 * Cleanup
 */
function cleanup() {
  cancelAnimationFrame(progressAnimation);
  stopAllVideos();
}

window.addEventListener('beforeunload', cleanup);