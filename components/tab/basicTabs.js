// basicTabs.js
export function createBasicTabs({
  containerSelector = '.tabs',
  activeClass = 'is-active'
} = {}) {
  const containers = document.querySelectorAll(containerSelector);
  if (!containers.length) return;

  containers.forEach(container => {
    const tabList = container.querySelector('.tab-list');
    const tabItems = container.querySelectorAll('.tab-item');
    const tabPanels = container.querySelectorAll('.tab-panel');
    const indicator = container.querySelector('.tab-indicator');

    if (!tabList || !tabItems.length || !tabPanels.length || !indicator) return;

    const moveIndicator = target => {
      const listRect = tabList.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      indicator.style.left = `${targetRect.left - listRect.left}px`;
      indicator.style.width = `${targetRect.width}px`;
    };

    const setActiveTab = index => {
      tabItems.forEach((tab, i) => {
        tab.classList.toggle(activeClass, i === index);
      });

      tabPanels.forEach((panel, i) => {
        panel.classList.toggle(activeClass, i === index);
      });

      moveIndicator(tabItems[index]);
    };

    // 초기 활성 탭 (마크업에 active 없으면 0번)
    const initialIndex = [...tabItems].findIndex(tab =>
      tab.classList.contains(activeClass)
    );
    setActiveTab(initialIndex > -1 ? initialIndex : 0);

    tabItems.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        setActiveTab(index);
      });
    });

    // 리사이즈 시 인디케이터 보정
    window.addEventListener('resize', () => {
      const activeTab = container.querySelector(`.tab-item.${activeClass}`);
      if (activeTab) moveIndicator(activeTab);
    });
  });
}
