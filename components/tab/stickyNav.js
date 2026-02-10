// stickyNav.js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function initStickyNav({
  sectionSelector = ".section__cont",
  containerSelector = ".sticky-title-bar",
  linkSelector = ".sticky-title-bar a",
  highlightSelector = ".highlight-box",
  stickyWrapSelector = ".sticky-tab-wrap",
  resizeDelay = 200,
} = {}) {
  const sections = document.querySelectorAll(sectionSelector);
  const container = document.querySelector(containerSelector);
  const navLinks = document.querySelectorAll(linkSelector);
  const highlightBox = document.querySelector(highlightSelector);

  if (!container || !navLinks.length || !highlightBox) return;

  function getScrollOffset() {
    const header = document.querySelector(stickyWrapSelector);
    if (!header) return 0;
    return header.getBoundingClientRect().height;
  }

  /* 하이라이트 이동 */
  function moveHighlight(index) {
    const target = navLinks[index];
    if (!target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    // target의 중앙 좌표 (container 기준)
    const leftPos =
      targetRect.left - containerRect.left + targetRect.width / 2;

    const boxWidth = targetRect.width;

    // 하이라이트 왼쪽 좌표
    const highlightLeft = leftPos - boxWidth / 2;

    highlightBox.style.width = `${boxWidth}px`;
    highlightBox.style.left = `${highlightLeft}px`;
  }

  /* 활성 상태 + ARIA 동기화 */
  function setActiveNav(activeIndex) {
    navLinks.forEach((link, i) => {
      const isActive = i === activeIndex;
      link.classList.toggle("on", isActive);
      link.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  /* 현재 활성 항목 기준 하이라이트 갱신 */
  function updateHighlightByActive() {
    const activeIndex = [...navLinks].findIndex((link) =>
      link.classList.contains("on"),
    );
    if (activeIndex !== -1) {
      moveHighlight(activeIndex);
    }
  }

  /* ScrollTrigger 설정 */
  sections.forEach((section, idx) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 30%",
      end: "bottom center",
      onEnter: () => {
        setActiveNav(idx);
        moveHighlight(idx);
      },
      onEnterBack: () => {
        setActiveNav(idx);
        moveHighlight(idx);
      },
    });
  });

  /* 네비게이션 이벤트 */
  navLinks.forEach((link, idx) => {
    // 키보드 포커스 대응
    link.addEventListener("focus", () => {
      setActiveNav(idx);
      moveHighlight(idx);
    });

    // 클릭 시 섹션으로 스크롤
    link.addEventListener("click", (e) => {
      e.preventDefault();
      gsap.to(window, {
        scrollTo: {
          y: sections[idx],
          offsetY: getScrollOffset(),
        },
      });
    });
  });

  /* 초기 로딩 보정 */
  window.addEventListener("load", () => {
    highlightBox.style.transition = "none";
    updateHighlightByActive();
    requestAnimationFrame(() => {
      highlightBox.style.transition = "";
    });
  });

  /* 리사이즈 대응 */
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      requestAnimationFrame(updateHighlightByActive);
    }, resizeDelay);
  });
}



// 엔트리 파일에서 호출
import { initStickyNav } from "./stickyNav.js";

initStickyNav({
  scrollOffset: 100, // sticky 헤더 높이에 맞게 조정
});