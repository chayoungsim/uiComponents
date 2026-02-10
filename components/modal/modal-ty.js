const FOCUSABLE_SELECTORS = `
  a[href],
  button:not([disabled]),
  textarea:not([disabled]),
  input:not([disabled]),
  select:not([disabled]),
  [tabindex]:not([tabindex="-1"])
`;

let lastFocusedEl = null;

const getFocusableElements = (container) => {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
        (el) => el.offsetParent !== null,
    );
};

export const openModal = (event, type) => {
    lastFocusedEl = event.currentTarget;

    const btn = event.currentTarget;
    const modalId = btn.getAttribute("modal-id");
    const target = document.getElementById(modalId);
    if (target) {
        setModal(modalId);
    }
};

export const closeModal = (param) => {
    let target =
        typeof param === "string"
            ? document.getElementById(param)
            : param?.currentTarget
              ? document.getElementById(param.currentTarget.getAttribute("modal-id"))
              : null;

    if (!target) return;

    target.classList.remove("is-active");

    // 포커스 트랩 제거
    target._removeFocusTrap?.();

    setTimeout(() => {
        target.style.display = "none";
        document.body.classList.remove("modal-open");

        lastFocusedEl?.focus();
        lastFocusedEl = null;
    }, 500);
};

export const setModal = (modalId) => {
    const target = document.getElementById(modalId);
    if (!target) return;

    target.style.display = "flex";

    setTimeout(() => {
        target.classList.add("is-active");
        document.body.classList.add("modal-open");

        const closeBtn =
            target.querySelector(".modal-close") || target.querySelector("[data-modal-close]");

        if (closeBtn) {
            requestAnimationFrame(() => {
                closeBtn.focus();
            });
        }
        
        setFocusTrap(target);
    }, 500); // CSS transition 시간(0.5s)과 일치하도록 수정
};

const setFocusTrap = (modal) => {
    const focusableEls = getFocusableElements(modal);
    if (!focusableEls.length) return;

    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    const handleKeydown = (e) => {
        if (e.key !== "Tab") return;

        if (e.shiftKey) {
            if (document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            }
        } else {
            if (document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        }
    };

    modal.addEventListener("keydown", handleKeydown);

    // 닫힐 때 이벤트 정리
    modal._removeFocusTrap = () => {
        modal.removeEventListener("keydown", handleKeydown);
    };
};
