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
  return new Swiper(selector, {
    slidesPerView: 4,
    spaceBetween: 24,
    speed: 600,
    watchSlidesProgress: true,

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    breakpoints: {
      0: {
        slidesPerView: 1.2,
      },
      640: {
        slidesPerView: 2.2,
      },
      1024: {
        slidesPerView: 4,
      },
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
}