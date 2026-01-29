// responsiveTabs.js
export function createResponsiveTabs({
  containerSelector = '.tab-container.rwd',
  breakpoint = 640
} = {}) {
  const tabContainers = document.querySelectorAll(containerSelector);
  if (!tabContainers.length) return;

  const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

  tabContainers.forEach(container => {
    const tabNav = container.querySelector('.tab-nav');
    const tabNavs = container.querySelectorAll('.tab-nav button');
    const tabPanels = container.querySelectorAll('.tab-panel');
    const tabCurrent = container.querySelector('.tab-current');

    if (!tabNav || !tabNavs.length || !tabPanels.length || !tabCurrent) return;

    /** 탭 활성화 */
    const activateTab = (tab, index) => {
      tabNavs.forEach(t => {
        t.parentElement.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });

      tab.parentElement.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.removeAttribute('tabindex');

      tabPanels.forEach(panel => (panel.hidden = true));
      tabPanels[index].hidden = false;

      tabCurrent.textContent = tab.textContent;
    };

    /** 탭 클릭 이벤트 */
    tabNavs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        activateTab(tab, index);

        // 모바일에서 탭 선택 시 목록 닫기
        if (mediaQuery.matches) {
          tabNav.classList.remove('open');
        }
      });
    });

    /** 반응형 처리 */
    const handleResponsive = e => {
      if (e.matches) {
        // 모바일
        tabCurrent.addEventListener('click', onToggleNav);
      } else {
        // 데스크탑
        tabNav.classList.remove('open');
        tabCurrent.removeEventListener('click', onToggleNav);
      }
    };

    const onToggleNav = () => {
      tabNav.classList.toggle('open');
    };

    mediaQuery.addEventListener('change', handleResponsive);
    handleResponsive(mediaQuery);
  });
}
