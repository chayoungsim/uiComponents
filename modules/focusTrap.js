/**
 * Focus Trap Module (ES6)
 * 특정 요소 내부에 키보드 포커스를 가두는 기능을 제공합니다.
 */

// 포커스 가능한 표준 요소 선택자
const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const createFocusTrap = (container) => {
  if (!container) return null;

  let firstFocusable = null;
  let lastFocusable = null;

  // 1. 포커스 요소 최신화
  const updateElements = () => {
    const focusables = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
    firstFocusable = focusables[0];
    lastFocusable = focusables[focusables.length - 1];
  };

  // 2. 키보드 이벤트 핸들러
  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;

    const { activeElement } = document;

    if (e.shiftKey) { // Shift + Tab (역방향)
      if (activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else { // Tab (정방향)
      if (activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  // 3. API 반환
  return {
    activate() {
      updateElements();
      if (firstFocusable) {
        firstFocusable.focus();
        container.addEventListener('keydown', handleKeyDown);
      }
    },
    deactivate() {
      container.removeEventListener('keydown', handleKeyDown);
    },
    update() {
      updateElements();
    }
  };
};