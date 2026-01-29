document.addEventListener('DOMContentLoaded', () => {
    const accordionGroups = document.querySelectorAll('.accordions');
  
    accordionGroups.forEach(accordion => {   
        const items = accordion.querySelectorAll('.accordions-item');
       
        items.forEach(item => {
            const trigger = item.querySelector('.accordions-trigger');
            const panel = item.querySelector('.accordions-panel');
            if (!trigger || !panel) return;  
            
            trigger.addEventListener('click', () => {
                const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

                // 모든 아코디언 이이템을 닫음
                items.forEach(otherItem => {
                    const otherTrigger = otherItem.querySelector('.accordions-trigger');
                    const otherPanel = otherItem.querySelector('.accordions-panel');
                    if(otherTrigger) {
                        otherTrigger.setAttribute('aria-expanded', 'false');                       
                    }
                    if(otherPanel) {
                        otherPanel.setAttribute('hidden', '');
                    }
                    otherItem.classList.remove('show');                    
                })
                if(!isExpanded) {                    
                    trigger.setAttribute('aria-expanded', 'true');
                    panel.removeAttribute('hidden');
                    item.classList.add('show');
                }
            });
        })    
    });
})


