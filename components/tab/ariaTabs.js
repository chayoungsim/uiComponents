// ariaTabs.js
export function createAriaTabs({
  containerSelector = '.tab-container'
} = {}) {
  const containers = document.querySelectorAll(containerSelector);
  if (!containers.length) return;

  containers.forEach(container => {
    const tablist = container.querySelector('[role="tablist"]');
    const allTabs = Array.from(container.querySelectorAll('[role="tab"]'));
    const panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));

    if (!tablist || allTabs.length === 0) return;

    const isVertical =
      tablist.getAttribute('aria-orientation') === 'vertical';

    const activationMode =
      container.dataset.tabs === 'manual' ? 'manual' : 'auto';

    /** 사용 가능한 탭만 반환 */
    const enabledTabs = () =>
      allTabs.filter(tab => tab.getAttribute('aria-disabled') !== 'true');

    /** 초기 상태 정리 */
    const init = () => {
      const selectedTab =
        allTabs.find(t => t.getAttribute('aria-selected') === 'true') ||
        allTabs[0];

      allTabs.forEach(tab => {
        const isSelected = tab === selectedTab;

        tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        tab.setAttribute('tabindex', isSelected ? '0' : '-1');
        tab.parentElement?.classList.toggle('active', isSelected);

        const panelId = tab.getAttribute('aria-controls');
        const panel = panelId && container.querySelector(`#${panelId}`);

        if (panel) {
          panel.hidden = !isSelected;
          panel.classList.toggle('active', isSelected);
        }
      });
    };

    /** 탭 전환 */
    const switchTab = (oldTab, newTab, { focus = true } = {}) => {
      if (!newTab || newTab.getAttribute('aria-disabled') === 'true') return;

      if (oldTab) {
        oldTab.setAttribute('aria-selected', 'false');
        oldTab.setAttribute('tabindex', '-1');
        oldTab.parentElement?.classList.remove('active');

        const oldPanel = container.querySelector(
          `#${oldTab.getAttribute('aria-controls')}`
        );
        if (oldPanel) {
          oldPanel.hidden = true;
          oldPanel.classList.remove('active');
        }
      }

      newTab.setAttribute('aria-selected', 'true');
      newTab.setAttribute('tabindex', '0');
      newTab.parentElement?.classList.add('active');

      const newPanel = container.querySelector(
        `#${newTab.getAttribute('aria-controls')}`
      );
      if (newPanel) {
        newPanel.hidden = false;
        newPanel.classList.add('active');
      }

      if (focus) newTab.focus();
    };

    /** 포커스 이동 */
    const moveFocus = (currentTab, direction) => {
      const tabs = enabledTabs();
      const index = Math.max(0, tabs.indexOf(currentTab));
      const nextTab = tabs[(index + direction + tabs.length) % tabs.length];

      if (!nextTab) return;

      if (activationMode === 'auto') {
        switchTab(currentTab, nextTab);
      } else {
        currentTab.setAttribute('tabindex', '-1');
        nextTab.setAttribute('tabindex', '0');
        nextTab.focus();
      }
    };

    /** 클릭 활성화 */
    tablist.addEventListener('click', e => {
      const clickedTab = e.target.closest('[role="tab"]');
      if (!clickedTab || clickedTab.getAttribute('aria-disabled') === 'true') return;

      const currentTab = tablist.querySelector(
        '[role="tab"][aria-selected="true"]'
      );

      if (clickedTab !== currentTab) {
        switchTab(currentTab, clickedTab);
      }
    });

    /** 키보드 네비게이션 */
    tablist.addEventListener('keydown', e => {
      const targetTab = e.target.closest?.('[role="tab"]');
      if (!targetTab) return;

      const keyMap = {
        next: !isVertical && e.key === 'ArrowRight' || isVertical && e.key === 'ArrowDown',
        prev: !isVertical && e.key === 'ArrowLeft'  || isVertical && e.key === 'ArrowUp'
      };

      if (keyMap.next || keyMap.prev) {
        e.preventDefault();
        moveFocus(targetTab, keyMap.next ? 1 : -1);
        return;
      }

      if (e.key === 'Home') {
        e.preventDefault();
        const first = enabledTabs()[0];
        if (!first) return;

        activationMode === 'auto'
          ? switchTab(targetTab, first)
          : (targetTab.setAttribute('tabindex', '-1'),
             first.setAttribute('tabindex', '0'),
             first.focus());
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        const tabs = enabledTabs();
        const last = tabs[tabs.length - 1];
        if (!last) return;

        activationMode === 'auto'
          ? switchTab(targetTab, last)
          : (targetTab.setAttribute('tabindex', '-1'),
             last.setAttribute('tabindex', '0'),
             last.focus());
        return;
      }

      if (
        activationMode === 'manual' &&
        (e.key === 'Enter' || e.key === ' ')
      ) {
        e.preventDefault();
        const currentTab = tablist.querySelector(
          '[role="tab"][aria-selected="true"]'
        );
        if (targetTab !== currentTab) {
          switchTab(currentTab, targetTab);
        }
      }
    });

    init();
  });
}
