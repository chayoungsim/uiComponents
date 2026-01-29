// accordion.js
export function createAccordion({
  containerSelector = '.accordions',
  itemSelector = '.accordions-item',
  triggerSelector = '.accordions-trigger',
  panelSelector = '.accordions-panel',
  activeClass = 'show'
} = {}) {
  const accordionGroups = document.querySelectorAll(containerSelector);
  if (!accordionGroups.length) return;

  accordionGroups.forEach(accordion => {
    const items = accordion.querySelectorAll(itemSelector);
    if (!items.length) return;

    items.forEach(item => {
      const trigger = item.querySelector(triggerSelector);
      const panel = item.querySelector(panelSelector);
      if (!trigger || !panel) return;

      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        // 모든 아이템 닫기
        items.forEach(otherItem => {
          const otherTrigger = otherItem.querySelector(triggerSelector);
          const otherPanel = otherItem.querySelector(panelSelector);

          if (otherTrigger) {
            otherTrigger.setAttribute('aria-expanded', 'false');
          }
          if (otherPanel) {
            otherPanel.setAttribute('hidden', '');
          }
          otherItem.classList.remove(activeClass);
        });

        // 현재 아이템 열기
        if (!isExpanded) {
          trigger.setAttribute('aria-expanded', 'true');
          panel.removeAttribute('hidden');
          item.classList.add(activeClass);
        }
      });
    });
  });
}
