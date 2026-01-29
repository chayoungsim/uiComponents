document.addEventListener('DOMContentLoaded', () => {
    const tabContainers = document.querySelectorAll('.tab-container');
    tabContainers.forEach(container => {
        const tablist = container.querySelector('[role="tablist"]');
        const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
        const panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));

        if (!tablist || tabs.length === 0) return;        
        const switchTab = (oldTab, newTab) => {            
            if (oldTab) {
                oldTab.setAttribute('aria-selected', 'false');
                oldTab.setAttribute('tabindex', '-1');
                oldTab.parentElement.classList.remove('active');   
                const oldPanel = container.querySelector('#' + oldTab.getAttribute('aria-controls'));
                if (oldPanel) {
                    oldPanel.hidden = true;
                    oldPanel.classList.remove('active');
                }
            }
            newTab.setAttribute('aria-selected', 'true');
            newTab.setAttribute('tabindex', '0');
            newTab.parentElement.classList.add('active');
            newTab.focus();            
            const newPanel = container.querySelector('#' + newTab.getAttribute('aria-controls'));
            if (newPanel) {
                newPanel.hidden = false;
                newPanel.classList.add('active');
            }
        };
        tablist.addEventListener('click', e => {
            const clickedTab = e.target.closest('[role="tab"]');
            if (!clickedTab) return;

            const currentTab = tablist.querySelector('[aria-selected="true"]');
            if (clickedTab !== currentTab) {
                switchTab(currentTab, clickedTab);
            }
        });
        // 키보드 네비게이션 이벤트 리스너
        tablist.addEventListener('keydown', e => {
            const currentTab = e.target;
            let newTab;
            let currentIndex = tabs.indexOf(currentTab);

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    currentIndex = (currentIndex + 1) % tabs.length;
                    newTab = tabs[currentIndex];
                    break;

                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    currentIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                    newTab = tabs[currentIndex];
                    break;

                case 'Home':
                    e.preventDefault();
                    newTab = tabs[0];
                    break;

                case 'End':
                    e.preventDefault();
                    newTab = tabs[tabs.length - 1];
                    break;
                default:
                    return; 
            }
            if (newTab) {
                switchTab(currentTab, newTab);
            }
        });
    });
});
