(() => {    
  const appRoot = document.querySelector('#wrap');
  const openers = document.querySelectorAll('[data-dialog-target]');
  const focusableSelectors = [
    'a[href]','area[href]','button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])','textarea:not([disabled])',
    'summary','details','iframe',
    '[contenteditable]','[tabindex]:not([tabindex="-1"])'
  ].join(',');

    function lockScroll(lock) {
        document.documentElement.classList.toggle('not-scroll', lock);
    }

    function setBackgroundInert(enable) {
        // inert 지원 시
        if ('inert' in HTMLElement.prototype) {
        appRoot.inert = enable;
        } else {
        // fallback: aria-hidden으로 비활성화(스크린리더 숨김)
        if (enable) appRoot.setAttribute('aria-hidden', 'true');
        else appRoot.removeAttribute('aria-hidden');
        }
    }

    // 가시 요소만 추리기
    function isVisible(el) {
        const style = window.getComputedStyle(el);
        if (style.visibility === 'hidden' || style.display === 'none') return false;
        // layout 없거나 0x0인 경우 방어적으로 제외 (필요 시 조정)
        const rect = el.getBoundingClientRect();
        return !!(rect.width || rect.height || el === document.activeElement);
    }

    function getFocusable(container) {
        return Array.from(container.querySelectorAll(focusableSelectors))
        .filter(isVisible);
    }

    function trapFocus(container, e) {
        if (e.key !== 'Tab') return;
        const focusables = getFocusable(container);
        if (!focusables.length) {
        e.preventDefault();
        const surface = container.querySelector('.modal-surface') || container;
        surface.focus();
        return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
        }
    }

    function focusNextFrame(target) {
        // 표시 직후 안전 포커스: 2중 rAF로 트랜지션/레이아웃 지연 커버
        requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            target?.focus?.({ preventScroll: true });
        });
        });
    }

    function openDialog(dialog, openerBtn) {
        dialog.hidden = false;
        dialog.classList.add('modal-open');

        // 스크롤 잠금 + 배경 비활성화 (주석 해제 권장)
        lockScroll(true);
        setBackgroundInert(true);

        // 최초 포커스 이동
        const surface = dialog.querySelector('.modal-surface') || dialog;
        if (!surface.hasAttribute('tabindex')) surface.setAttribute('tabindex', '-1');
        const firstFocusable = getFocusable(dialog)[0] || surface;
        focusNextFrame(firstFocusable);

        // 키보드 핸들러
        function onKeydown(e) {
        if (e.key === 'Escape') closeDialog(dialog);
        else trapFocus(dialog, e);
        }
        dialog.addEventListener('keydown', onKeydown);
        dialog._onKeydown = onKeydown;

        // 오프너 기억 (포커스 복귀용)
        dialog._opener = openerBtn || document.activeElement;
    }

    function closeDialog(dialog) {
        dialog.hidden = true;
        dialog.classList.remove('modal-open');

        // 스크롤 잠금 해제 + 배경 활성화
        lockScroll(false);
        setBackgroundInert(false);

        // 키보드 핸들러 제거
        if (dialog._onKeydown) dialog.removeEventListener('keydown', dialog._onKeydown);
        dialog._onKeydown = null;

        // 포커스 복귀
        const opener = dialog._opener;
        if (opener && typeof opener.focus === 'function') opener.focus();
        dialog._opener = null;
    }

    // 오픈 버튼
    openers.forEach(btn => {
        btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSel = btn.getAttribute('data-dialog-target');
        const dialog = document.querySelector(targetSel);
        if (dialog) openDialog(dialog, btn);
        });
    });

    // 닫기 버튼
    document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('[data-dialog-close]');
        if (closeBtn) {
        const dialog = closeBtn.closest('.modal');
        if (dialog) closeDialog(dialog);
        }
    });
    // 딤(백드롭) 클릭으로 닫기(원치 않으면 아래 블록 제거)
    document.addEventListener('click', (e) => {
        const backdrop = e.target.closest('[data-backdrop]');
        if (backdrop) {
        const dialog = backdrop.closest('.modal');
        if (dialog) closeDialog(dialog);
        }
    });
})();
