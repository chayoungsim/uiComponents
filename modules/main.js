import { createFocusTrap } from './focusTrap.js';

// 1. Focus Trap 인스턴스 생성
const modalTrap = createFocusTrap(modalEl);

// 모달 열기 함수
// 2. 트랩 활성화 (포커스가 모달 내부 첫 요소로 자동 이동)
  modalTrap.activate();

// 모달 닫기 함수
// 3. 트랩 비활성화
  modalTrap.deactivate();


// 5. 이전 버튼으로 포커스 복원 (UX 필수 사항)
openBtn.focus();