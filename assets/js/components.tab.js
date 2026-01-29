(() => {   
  const containers = document.querySelectorAll('.tab-container');
  containers.forEach(container => {
    const tablist = container.querySelector('[role="tablist"]');
    const allTabs = Array.from(container.querySelectorAll('[role="tab"]'));
    const panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));
    if (!tablist || allTabs.length === 0) return;

    const isVertical = tablist.getAttribute('aria-orientation') === 'vertical';
    const activationMode = container.dataset.tabs === 'manual' ? 'manual' : 'auto';

    // 유틸: 사용가능한 탭만(aria-disabled !== true)
    const enabledTabs = () => allTabs.filter(t => t.getAttribute('aria-disabled') !== 'true');

    // 초기 상태 정리
    (function init() {
      const selected = allTabs.find(t => t.getAttribute('aria-selected') === 'true');
      allTabs.forEach(t => {
        const selectedNow = t === selected || (!selected && t === allTabs[0]);
        t.setAttribute('tabindex', selectedNow ? '0' : '-1');
        t.setAttribute('aria-selected', selectedNow ? 'true' : 'false');
        t.parentElement?.classList.toggle('active', selectedNow);

        const panelId = t.getAttribute('aria-controls');
        const panelEl = panelId && container.querySelector('#' + panelId);
        if (panelEl) {
          panelEl.hidden = !selectedNow;
          panelEl.classList.toggle('active', selectedNow);
          // 접근성 강화 옵션: 필요 시 panel에 tabindex="-1"을 주고 포커스 트랩 시 사용
        }
      });
    })();

    const switchTab = (oldTab, newTab, { focus = true } = {}) => {
      if (!newTab || newTab.getAttribute('aria-disabled') === 'true') return;

      if (oldTab) {
        oldTab.setAttribute('aria-selected', 'false');
        oldTab.setAttribute('tabindex', '-1');
        oldTab.parentElement?.classList.remove('active');
        const oldPanel = container.querySelector('#' + oldTab.getAttribute('aria-controls'));
        if (oldPanel) {
          oldPanel.hidden = true;
          oldPanel.classList.remove('active');
        }
      }

      newTab.setAttribute('aria-selected', 'true');
      newTab.setAttribute('tabindex', '0');
      newTab.parentElement?.classList.add('active');

      const newPanel = container.querySelector('#' + newTab.getAttribute('aria-controls'));
      if (newPanel) {
        newPanel.hidden = false;
        newPanel.classList.add('active');
      }
      if (focus) newTab.focus();
    };

    const moveFocus = (current, dir) => {
      const tabs = enabledTabs();
      const i = Math.max(0, tabs.indexOf(current));
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      if (!next) return;

      // 자동/수동 모드
      if (activationMode === 'auto') {
        switchTab(current, next);
      } else {
        // 수동: 포커스만 이동
        current.setAttribute('tabindex', '-1');
        next.setAttribute('tabindex', '0');
        next.focus();
      }
    };

    // 클릭(마우스/터치) 활성화
    tablist.addEventListener('click', e => {
      const clickedTab = e.target.closest('[role="tab"]');
      if (!clickedTab || clickedTab.getAttribute('aria-disabled') === 'true') return;
      const currentTab = tablist.querySelector('[role="tab"][aria-selected="true"]');
      if (clickedTab !== currentTab) switchTab(currentTab, clickedTab);
    });

    // 키보드 네비게이션
    tablist.addEventListener('keydown', e => {
      const targetTab = e.target.closest?.('[role="tab"]');
      if (!targetTab) return;

      // 방향키 매핑
      const horizNext = e.key === 'ArrowRight';
      const horizPrev = e.key === 'ArrowLeft';
      const vertNext  = e.key === 'ArrowDown';
      const vertPrev  = e.key === 'ArrowUp';

      // 수평/수직에 따라 처리
      if (!isVertical && (horizNext || horizPrev)) {
        e.preventDefault();
        moveFocus(targetTab, horizNext ? +1 : -1);
        return;
      }
      if (isVertical && (vertNext || vertPrev)) {
        e.preventDefault();
        moveFocus(targetTab, vertNext ? +1 : -1);
        return;
      }

      if (e.key === 'Home') {
        e.preventDefault();
        const first = enabledTabs()[0];
        if (!first) return;
        if (activationMode === 'auto') switchTab(targetTab, first);
        else {
          targetTab.setAttribute('tabindex', '-1');
          first.setAttribute('tabindex', '0');
          first.focus();
        }
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        const tabs = enabledTabs();
        const last = tabs[tabs.length - 1];
        if (!last) return;
        if (activationMode === 'auto') switchTab(targetTab, last);
        else {
          targetTab.setAttribute('tabindex', '-1');
          last.setAttribute('tabindex', '0');
          last.focus();
        }
        return;
      }

      // 수동 모드에서 Enter/Space로 활성화
      if (activationMode === 'manual' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const currentTab = tablist.querySelector('[role="tab"][aria-selected="true"]');
        if (targetTab !== currentTab) switchTab(currentTab, targetTab);
      }
    });
  });

})();
