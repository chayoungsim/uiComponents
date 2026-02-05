export const initSwiper = () => {
    return new Swiper(".swiper", {
        slidesPerView: "auto",
        spaceBetween: 0,
        pagination: {
            el: ".swiper-pagination",
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });
};


function animateVisibleSlides(swiper) {
  swiper.slides.forEach(slide => {
    slide.classList.remove('is-animated');
    slide.style.transitionDelay = '';
  });

  swiper.visibleSlides.forEach((slide, index) => {
    slide.style.transitionDelay = `${index * 150}ms`;
    slide.classList.add('is-animated');
  });
}

export function initCardSwiper(selector = '.card-swiper') {
  const swiperEl = document.querySelector(selector);
  if (!swiperEl) return;

  let swiperInstance = null;
  let hasAnimated = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;

        swiperInstance = new Swiper(swiperEl, {
          slidesPerView: 4,
          spaceBetween: 24,
          speed: 600,
          watchSlidesProgress: true,

          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },

          breakpoints: {
            0: { slidesPerView: 1.2 },
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 4 },
          },

          on: {
            init(swiper) {
              animateVisibleSlides(swiper);
            },
            slideChangeTransitionStart(swiper) {
              animateVisibleSlides(swiper);
            },
          },
        });

        observer.disconnect();
      }
    },
    {
      threshold: 0.3, // 슬라이더의 30% 이상 보일 때 실행
    }
  );

  observer.observe(swiperEl);

  return swiperInstance;
}


