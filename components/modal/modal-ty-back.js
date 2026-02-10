export const openModal = (event, type) => {
    const btn = event.currentTarget;
    const modalId = btn.getAttribute("modal-id");
    const target = document.getElementById(modalId);
    if (target) {
        setModal(modalId);
    }
};

export const closeModal = (param) => {
    let target = null;
    if (typeof param === "string") {
        target = document.getElementById(param);
    }
    if (!target && param?.currentTarget) {
        const modalId = param.currentTarget.getAttribute("modal-id");
        if (modalId) {
            target = document.getElementById(modalId);
        }
    }
    if (!target) return;

    target.classList.remove("is-active");
    setTimeout(() => {
        target.style.display = "none";
        document.body.classList.remove("modal-open");
    }, 500);
};

export const setModal = (modalId) => {
    const target = document.getElementById(modalId);
    if (!target) return;

    target.style.display = "flex";

    if (target.classList.contains("type-bottom")) {
        const modalHeadHeight = target.querySelector(".modal-header")
            ? target.querySelector(".modal-header").offsetHeight
            : 0;
        const modalFootHeight = target.querySelector(".modal-footer")
            ? target.querySelector(".modal-footer").offsetHeight
            : 0;
        let modalHeight = modalHeadHeight + modalFootHeight + 50;
        target.querySelector(".modal-cont").style = `--modal-cont-height:${modalHeight}px`;
    }
    setTimeout(() => {
        target.classList.add("is-active");
        document.body.classList.add("modal-open");
    }, 300);
};
