import {
    normalizeEl,
    createRafThrottle,
    toggleScrollLock,
    createDimHandler,
} from "./header.common.js";

export function initHeaderMO({ header, hamburger, globalPanel }) {
    const headerEl = normalizeEl(header);
    const hamburgerEl = normalizeEl(hamburger);
    const panelEl = normalizeEl(globalPanel);

    if (!headerEl) return;

    /* Scroll (MO) */
    const onScroll = createRafThrottle(() => {
        headerEl.classList.toggle("is-fixed", window.scrollY > 0);
    });

    window.addEventListener("scroll", onScroll, { passive: true });

    /* Hamburger / Panel */
    if (!hamburgerEl || !panelEl) return;

    const dimHandler = createDimHandler(headerEl, () => close());

    const open = () => {
        hamburgerEl.classList.add("active");
        panelEl.classList.add("is-open");
        toggleScrollLock(true);
        dimHandler.create();
    };

    const close = () => {
        hamburgerEl.classList.remove("active");
        panelEl.classList.remove("is-open");
        toggleScrollLock(false);
        dimHandler.remove();
    };

    hamburgerEl.addEventListener("click", () => {
        panelEl.classList.contains("is-open") ? close() : open();
    });
}
