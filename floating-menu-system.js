// start floating-menu-system.js - نسخه منحنی بدون بدنه - نهایی
(function() {
    'use strict';
    
    const FMS = {
        isOpen: false,
        isAnimating: false,
        currentIndex: 0,
        targetIndex: 0,
        raf: null,
        
        elements: {
            menuBtn: null,
            menuContainer: null,
            mainContent: null,
            list: null
        },
        
        config: {
            animationDuration: 400,
            itemStep: 58,
            visibleItems: 12,
            mobileBreakpoint: 992
        },
        
        menuItems: [
            { section: 'search', icon: 'fa-search', label: 'جستجو' },
            { section: 'add-word', icon: 'fa-plus-circle', label: 'افزودن لغت' },
            { section: 'lexi-card', icon: 'fa-id-card', label: 'کارت هوشمند' },
            { section: 'translate', icon: 'fa-language', label: 'ترجمه' },
            { section: 'ai-chat', icon: 'fa-microchip', label: 'هوش مصنوعی' },
            { section: 'favorites', icon: 'fa-star', label: 'علاقه‌مندی‌ها' },
            { section: 'practice', icon: 'fa-pen', label: 'تمرین' },
            { section: 'word-list', icon: 'fa-list', label: 'لیست لغات' },
            { section: 'progress', icon: 'fa-chart-line', label: 'پیشرفت' },
            { section: 'library', icon: 'fa-book-open', label: 'کتابخانه' },
            { section: 'tools', icon: 'fa-tools', label: 'ابزارها' },
            { section: 'settings', icon: 'fa-cog', label: 'تنظیمات' }
        ]
    };
    
    function createFloatingMenu() {
        if (document.getElementById('floating-menu-btn')) return;
        
        const menuBtn = document.createElement('button');
        menuBtn.id = 'floating-menu-btn';
        menuBtn.className = 'floating-menu-btn';
        menuBtn.setAttribute('aria-label', 'منوی اصلی');
        menuBtn.innerHTML = '<i class="fas fa-bars-staggered"></i>';
        
        const menuContainer = document.createElement('div');
        menuContainer.id = 'floating-menu-container';
        menuContainer.className = 'floating-menu-container';
        
        const list = document.createElement('div');
        list.id = 'floating-menu-list';
        list.className = 'floating-menu-list';
        
        FMS.menuItems.forEach((item, idx) => {
            const menuItem = document.createElement('div');
            menuItem.className = 'floating-menu-item';
            menuItem.setAttribute('data-section', item.section);
            menuItem.setAttribute('data-index', idx);
            
            menuItem.innerHTML = `
                <i class="fas ${item.icon} menu-item-icon"></i>
                <div class="menu-item-tooltip">${item.label}</div>
            `;
            
            list.appendChild(menuItem);
        });
        
        menuContainer.appendChild(list);
        document.body.appendChild(menuBtn);
        document.body.appendChild(menuContainer);
        
        FMS.elements.list = list;
        
        const lastSection = localStorage.getItem('lastActiveSection');
        if (lastSection) {
            const lastIndex = FMS.menuItems.findIndex(i => i.section === lastSection);
            if (lastIndex !== -1) {
                FMS.currentIndex = lastIndex;
                FMS.targetIndex = lastIndex;
                setTimeout(() => updateActiveItem(lastIndex), 100);
            }
        }
    }
    
    function updateActiveItem(index) {
        const items = document.querySelectorAll('.floating-menu-item');
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    function scrollToIndex(index, smooth = true) {
        const maxIndex = Math.max(0, FMS.menuItems.length - FMS.config.visibleItems);
        FMS.targetIndex = Math.max(0, Math.min(maxIndex, index));
        
        if (smooth) {
            if (FMS.raf) cancelAnimationFrame(FMS.raf);
            function step() {
                const diff = FMS.targetIndex - FMS.currentIndex;
                if (Math.abs(diff) < 0.003) {
                    FMS.currentIndex = FMS.targetIndex;
                    renderScroll();
                    return;
                }
                FMS.currentIndex += diff * 0.16;
                renderScroll();
                FMS.raf = requestAnimationFrame(step);
            }
            step();
        } else {
            FMS.currentIndex = FMS.targetIndex;
            renderScroll();
        }
    }
    
    function renderScroll() {
        if (!FMS.elements.list) return;
        const offset = -(FMS.currentIndex * FMS.config.itemStep);
        FMS.elements.list.style.transform = `translateY(${offset}px)`;
    }
    
    function cacheElements() {
        FMS.elements = {
            menuBtn: document.getElementById('floating-menu-btn'),
            menuContainer: document.getElementById('floating-menu-container'),
            mainContent: document.querySelector('.main-content'),
            list: document.getElementById('floating-menu-list')
        };
    }
    
    function openMenu() {
        if (FMS.isOpen || FMS.isAnimating) return;
        
        FMS.isAnimating = true;
        const { menuBtn, menuContainer, mainContent } = FMS.elements;
        
        if (menuBtn) menuBtn.classList.add('open');
        menuContainer.classList.add('open');
        
        if (window.innerWidth > FMS.config.mobileBreakpoint && mainContent) {
            mainContent.style.transition = `all ${FMS.config.animationDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
            mainContent.style.width = `78%`;
            mainContent.style.marginRight = 'auto';
            mainContent.style.marginLeft = 'auto';
        }
        
        const items = document.querySelectorAll('.floating-menu-item');
        items.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.02}s`;
            item.classList.add('show');
        });
        
        setTimeout(() => {
            FMS.isOpen = true;
            FMS.isAnimating = false;
        }, FMS.config.animationDuration);
    }
    
    function closeMenu() {
        if (!FMS.isOpen || FMS.isAnimating) return;
        
        FMS.isAnimating = true;
        const { menuBtn, menuContainer, mainContent } = FMS.elements;
        
        if (menuBtn) menuBtn.classList.remove('open');
        menuContainer.classList.remove('open');
        
        const items = document.querySelectorAll('.floating-menu-item');
        items.forEach(item => {
            item.style.transitionDelay = '0s';
            item.classList.remove('show');
        });
        
        if (mainContent) {
            mainContent.style.width = '100%';
            mainContent.style.marginRight = '0';
            mainContent.style.marginLeft = '0';
        }
        
        setTimeout(() => {
            FMS.isOpen = false;
            FMS.isAnimating = false;
        }, FMS.config.animationDuration);
    }
    
    function toggleMenu() {
        if (FMS.isOpen) closeMenu();
        else openMenu();
    }
    
    function navigateToSection(sectionId) {
        const targetSection = document.getElementById(`${sectionId}-section`);
        
        if (targetSection) {
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            targetSection.classList.add('active');
            localStorage.setItem('lastActiveSection', sectionId);
            
            const index = FMS.menuItems.findIndex(i => i.section === sectionId);
            if (index !== -1) {
                updateActiveItem(index);
            }
            
            if (window.dictionaryApp) {
                switch(sectionId) {
                    case 'ai-chat': window.dictionaryApp.renderAIChat(); break;
                    case 'settings': window.dictionaryApp.renderSettings(); break;
                    case 'practice': window.dictionaryApp.renderPracticeOptions(); break;
                    case 'favorites': window.dictionaryApp.renderFavorites(); break;
                    case 'word-list': window.dictionaryApp.renderWordList(); break;
                    case 'progress': window.dictionaryApp.updateStats(); break;
                    case 'translate': window.dictionaryApp.renderTranslate(); break;
                }
            }
        }
        setTimeout(() => closeMenu(), 150);
    }
    
    function attachEvents() {
        const { menuBtn, menuContainer, list } = FMS.elements;
        if (!menuBtn || !menuContainer) return;
        
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
        
        document.querySelectorAll('.floating-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const section = item.getAttribute('data-section');
                if (section) navigateToSection(section);
            });
        });
        
        document.addEventListener('click', (e) => {
            if (FMS.isOpen && menuContainer && menuBtn && 
                !menuContainer.contains(e.target) && !menuBtn.contains(e.target)) {
                closeMenu();
            }
        });
        
        if (menuContainer) {
            menuContainer.addEventListener('click', (e) => e.stopPropagation());
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && FMS.isOpen) closeMenu();
        });
        
        window.addEventListener('resize', debounce(handleResize, 250));
    }
    
    function handleResize() {
        const { mainContent } = FMS.elements;
        if (window.innerWidth <= FMS.config.mobileBreakpoint) {
            if (FMS.isOpen && FMS.elements.menuContainer) {
                FMS.elements.menuContainer.style.left = '16px';
                FMS.elements.menuContainer.style.right = '16px';
            }
            if (mainContent) {
                mainContent.style.width = '100%';
                mainContent.style.marginRight = '0';
                mainContent.style.marginLeft = '0';
            }
        } else {
            if (FMS.elements.menuContainer) {
                FMS.elements.menuContainer.style.left = '20px';
                FMS.elements.menuContainer.style.right = 'auto';
            }
            if (FMS.isOpen && mainContent) {
                mainContent.style.width = '78%';
            }
        }
    }
    
    function checkInitialState() {
        const lastSection = localStorage.getItem('lastActiveSection');
        if (lastSection) {
            setTimeout(() => navigateToSection(lastSection), 300);
        }
    }
    
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
    
    window.EliasMenu = {
        open: openMenu,
        close: closeMenu,
        toggle: toggleMenu,
        navigate: navigateToSection,
        isOpen: () => FMS.isOpen
    };
    
    function init() {
        console.log('🎨 Floating Menu - راه‌اندازی...');
        
        const oldSidebar = document.querySelector('.sidebar');
        if (oldSidebar) oldSidebar.remove();
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.marginRight = '0';
            mainContent.style.width = '100%';
        }
        
        createFloatingMenu();
        cacheElements();
        attachEvents();
        checkInitialState();
        
        console.log('✅ Floating Menu - راه‌اندازی کامل شد');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
// end floating-menu-system.js