import {
    normalizeEl,
    createRafThrottle,
    toggleScrollLock,
    createDimHandler,
} from "./header.common.js";

export function initHeaderPC({
    header,
    headerNav,
    hamburger,
    globalPanel,
    panelSection,
    closeBtn,
}) {
    const headerEl = normalizeEl(header);
    const headerNavEl = normalizeEl(headerNav);
    const hamburgerEl = normalizeEl(hamburger);
    const panelEl = normalizeEl(globalPanel);
    const sectionEl = normalizeEl(panelSection);
    const closeEl = normalizeEl(closeBtn);

    if (!headerEl || !hamburgerEl || !panelEl || !sectionEl) return;

    /* Header Fixed*/
    let navTriggerY = 0;

    const updateTrigger = () => {
        if (!headerNavEl) return;
        navTriggerY = headerNavEl.offsetTop;
        headerEl.style.setProperty("--nav-height", `${headerNavEl.offsetHeight}px`);
    };

    updateTrigger();
    window.addEventListener("resize", updateTrigger);

    const onScroll = createRafThrottle(() => {
        if (!headerNavEl) return;
        headerEl.classList.toggle("is-fixed", window.scrollY >= navTriggerY);
    });

    window.addEventListener("scroll", onScroll, { passive: true });

    /* Global Panel Focus Trap */
    const FOCUSABLE =
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

    let focusableEls = [];
    let firstEl;
    let lastEl;

    const setFocusable = () => {
        focusableEls = [...panelEl.querySelectorAll(FOCUSABLE)];
        firstEl = focusableEls[0];
        lastEl = focusableEls[focusableEls.length - 1];
    };

    const onKeydownTrap = (e) => {
        if (e.key === "Escape") {
            closePanel();
            return;
        }

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

    /* Open / Close */
    const dimHandler = createDimHandler(headerEl, () => closePanel());

    const openPanel = () => {
        hamburgerEl.classList.add("active");
        hamburgerEl.setAttribute("aria-expanded", "true");

        panelEl.classList.add("is-open");
        panelEl.setAttribute("aria-hidden", "false");
        toggleScrollLock(true);
        dimHandler.create();

        setFocusable();
        document.addEventListener("keydown", onKeydownTrap);

        // 다음 포커스 → panel 내부 첫 요소
        requestAnimationFrame(() => {
            firstEl?.focus();
        });
    };

    const closePanel = () => {
        hamburgerEl.classList.remove("active");
        hamburgerEl.setAttribute("aria-expanded", "false");

        panelEl.classList.remove("is-open");
        panelEl.setAttribute("aria-hidden", "true");
        toggleScrollLock(false);
        dimHandler.remove();

        document.removeEventListener("keydown", onKeydownTrap);

        // 포커스 복귀
        requestAnimationFrame(() => {
            hamburgerEl.focus();
        });
    };

    /* Events */
    hamburgerEl.addEventListener("click", () => {
        const isOpen = hamburgerEl.classList.contains("active");
        isOpen ? closePanel() : openPanel();
    });

    closeEl?.addEventListener("click", closePanel);
}
