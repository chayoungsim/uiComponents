const appRoot = document.querySelector('#wrap');
const focusableSelectors = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'summary',
    'details',
    'iframe',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

function setCookieToday(name, value) {
    const now = new Date();
    // 오늘 23:59:59.999에 만료
    const expire = new Date(
        now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999
    );
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};path=/;expires=${expire.toUTCString()}`;
}
function getCookie(name) {
    const key = encodeURIComponent(name) + '=';
    return document.cookie.split('; ').find(v => v.startsWith(key))
        ?.split('=')[1] ? decodeURIComponent(
        document.cookie.split('; ').find(v => v.startsWith(key)).split('=')[1]
        ) : null;
}

function setBackgroundInert(enable) {
    if (!appRoot) return;
    if ('inert' in HTMLElement.prototype) {
        appRoot.inert = enable;
    } else {
        if (enable) appRoot.setAttribute('aria-hidden', 'true');
        else appRoot.removeAttribute('aria-hidden');
    }
}

function lockScroll(lock) {
    document.documentElement.classList.toggle('not-scroll', lock);
}

function anyModalOpen() {
    return !!document.querySelector('.modal.modal-open:not([hidden])');
}

const trapState = new Map(); 
function activateTrap(modal) {
    const container = modal.querySelector('.modal-surface') || modal;
    const nodes = [...container.querySelectorAll(focusableSelectors)]
      .filter(el => el.offsetParent !== null || el === container);
    const first = nodes[0] || container;
    const last  = nodes[nodes.length - 1] || container;

    trapState.set(modal, {
      first, last, prevFocus: document.activeElement || null
    });

    // 초기 포커스
    (container.hasAttribute('tabindex') ? container : first).focus();

    function onKeydown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal(modal, { byEsc: true });
      } else if (e.key === 'Tab') {
        if (nodes.length === 0) {
          e.preventDefault();
          container.focus();
          return;
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }
    modal.__trapHandler = onKeydown;
    modal.addEventListener('keydown', onKeydown);
}

function deactivateTrap(modal) {
    const state = trapState.get(modal);
    if (modal.__trapHandler) {
      modal.removeEventListener('keydown', modal.__trapHandler);
      modal.__trapHandler = null;
    }
    if (state?.prevFocus && document.body.contains(state.prevFocus)) {
      state.prevFocus.focus();
    }
    trapState.delete(modal);
  }

function openModal(modal) {
    if (!modal || modal.classList.contains('modal-open')) return;

    modal.hidden = false;
    modal.classList.add('modal-open');

    // 배경 비활성 + 스크롤 락
    setBackgroundInert(true);
    lockScroll(true);

    // 포커스 트랩 활성화
    activateTrap(modal);

    // 외부 클릭으로 닫기(필요 시 주석 해제)
    // modal.addEventListener('mousedown', (e) => {
    //   if (e.target === modal) closeModal(modal);
    // });
  }

function closeModal(modal, options = {}) {
    if (!modal || !modal.classList.contains('modal-open')) return;

    // "오늘 하루" 체크 시 쿠키 저장
    const todayCheck = modal.querySelector('.todayCheck');
    if (!options.byEsc && todayCheck?.checked) {
      const key = modal.dataset.popupId || 'main-popup';
      setCookieToday(key, 'done');
    }

    modal.classList.remove('modal-open');
    modal.hidden = true;

    // 포커스 트랩 해제 및 포커스 복귀
    deactivateTrap(modal);

    // 남은 모달이 없으면 배경/스크롤 원복
    if (!anyModalOpen()) {
      setBackgroundInert(false);
      lockScroll(false);
    }
  }

// ===== 대기열(큐) 기반 자동 오픈: 쿠키 없는 팝업만 순차 오픈 =====
function autoOpenQueue() {
    const allMainModals = [...document.querySelectorAll('.modal[data-popup-id]')];

    // 쿠키 있는 것들은 바로 hidden 유지
    allMainModals.forEach(m => {
        const key = m.dataset.popupId;
        if (getCookie(key) === 'done') {
        m.hidden = true;
        m.classList.remove('modal-open');
        }
    });

    // 쿠키 없는 모달만 큐에 넣어 순차 오픈
    const queue = allMainModals.filter(m => getCookie(m.dataset.popupId) !== 'done');

    function next() {
        const modal = queue.shift();
        if (!modal) return;
        openModal(modal);

        // ESC로 닫은 경우에도 다음으로 진행되도록 감지
        const escObserver = new MutationObserver(() => {
            if (modal.hidden) {
                escObserver.disconnect();
                next();
            }
        });
        escObserver.observe(modal, { attributes: true, attributeFilter: ['hidden'] });

        // 닫기 버튼에 다음 연결
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            const handler = () => {
                // Observer의 중복 호출을 막기 위해 먼저 연결을 끊음
                escObserver.disconnect();
                closeModal(modal);
                closeBtn.removeEventListener('click', handler);
                next(); // 다음 팝업 오픈
            };
            closeBtn.addEventListener('click', handler);
        }
    }

    next();
}

// ===== 수동 오픈 트리거 (data-dialog-open="popupId") =====
function bindOpeners() {
document.querySelectorAll('[data-dialog-open]').forEach(btn => {
    btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-dialog-open');
    const modal = document.querySelector(`.modal[data-popup-id="${id}"]`);
    if (modal) {
        // 이미 쿠키가 있더라도 수동 오픈 시엔 열 수 있도록
        openModal(modal);

        // 닫기 버튼 기본 연결 (수동 오픈 시에도 동작)
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn && !closeBtn.__bound) {
        closeBtn.addEventListener('click', () => closeModal(modal));
        closeBtn.__bound = true;
        }
    }
    });
});
}

// ===== 닫기 버튼/기본 이벤트 바인딩 =====
function bindCloserBasics() {
document.querySelectorAll('.c-modal').forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn && !closeBtn.__bound) {
    closeBtn.addEventListener('click', () => closeModal(modal));
    closeBtn.__bound = true;
    }
    // 접근성: 닫기 버튼이 없더라도 ESC로 닫히도록 openModal 내부에서 처리됨
});
}

document.addEventListener('DOMContentLoaded', () => {
    bindOpeners();
    bindCloserBasics();
    autoOpenQueue();
});
