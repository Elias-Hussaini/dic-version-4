// start floating-menu-system.js — منوی شناور مدرن (نسخه نهایی)
(function() {
    'use strict';

    const FMS = {
        isOpen: false,
        isAnimating: false,
        isMobile: false,
        currentSection: null,
        lastFocused: null,
        elements: {
            trigger: null,
            backdrop: null,
            drawer: null,
            list: null,
            closeBtn: null,
            dragHandle: null
        },
        config: {
            desktopWidth: 340,
            mobileBreakpoint: 992,
            animationDuration: 380
        },
        menuItems: [
            { section: 'search',     icon: 'fa-magnifying-glass',      label: 'جستجو',          color: '#4361ee', desc: 'جستجوی پیشرفته لغات' },
            { section: 'add-word',   icon: 'fa-circle-plus',          label: 'افزودن لغت',      color: '#10b981', desc: 'ثبت لغت جدید' },
            { section: 'lexi-card',  icon: 'fa-id-card',              label: 'کارت هوشمند',    color: '#8b5cf6', desc: 'ساخت کارت واژگان' },
            { section: 'translate',  icon: 'fa-language',             label: 'ترجمه',          color: '#06b6d4', desc: 'ترجمه آنلاین متن' },
            { section: 'ai-chat',    icon: 'fa-microchip',            label: 'هوش مصنوعی',     color: '#f59e0b', desc: 'دستیار هوشمند' },
            { section: 'favorites',  icon: 'fa-star',                 label: 'علاقه‌مندی‌ها',   color: '#ec4899', desc: 'لغات مورد علاقه' },
            { section: 'practice',   icon: 'fa-pen-to-square',        label: 'تمرین',          color: '#ef4444', desc: 'تمرین و آزمون' },
            { section: 'word-list',  icon: 'fa-list-ul',              label: 'لیست لغات',      color: '#3b82f6', desc: 'همه لغات' },
            { section: 'progress',   icon: 'fa-chart-column',         label: 'پیشرفت',         color: '#14b8a6', desc: 'آمار و نمودار' },
            { section: 'library',    icon: 'fa-book-open',            label: 'کتابخانه',        color: '#f97316', desc: 'کتاب‌های PDF' },
            { section: 'tools',      icon: 'fa-screwdriver-wrench',   label: 'ابزارها',        color: '#64748b', desc: 'صرف افعال' },
            { section: 'settings',   icon: 'fa-gear',                 label: 'تنظیمات',        color: '#6b7280', desc: 'تنظیمات برنامه' }
        ]
    };

    function injectStyles() {
        if (document.getElementById('fm-pro-styles')) return;
        const style = document.createElement('style');
        style.id = 'fm-pro-styles';
        style.textContent = `
            /* ===== متغیرهای طراحی ===== */
            :root {
                --fm-grad-1: #4361ee;
                --fm-grad-2: #3a0ca3;
                --fm-grad-accent: #06b6d4;
                --fm-glass-bg: rgba(255, 255, 255, 0.72);
                --fm-glass-border: rgba(255, 255, 255, 0.18);
                --fm-ink: #0f172a;
                --fm-ink-2: #1e293b;
                --fm-slate: #475569;
                --fm-muted: #64748b;
                --fm-line: #e2e8f0;
                --fm-line-2: #f1f5f9;
                --fm-card: #ffffff;
                --fm-card-2: #f8fafc;
                --fm-shadow: 0 12px 40px rgba(15,23,42,.15);
                --fm-shadow-lg: 0 20px 60px rgba(15,23,42,.25);
                --fm-radius: 24px;
                --fm-radius-s: 16px;
                --fm-mobile-h: 82vh;
            }
            body.dark-mode {
                --fm-glass-bg: rgba(15, 23, 42, 0.72);
                --fm-glass-border: rgba(255, 255, 255, 0.08);
                --fm-ink: #f1f5f9;
                --fm-ink-2: #e2e8f0;
                --fm-slate: #cbd5e1;
                --fm-muted: #94a3b8;
                --fm-line: #1e293b;
                --fm-line-2: #1e293b;
                --fm-card: #1e293b;
                --fm-card-2: #0f172a;
                --fm-shadow: 0 12px 40px rgba(0,0,0,.4);
                --fm-shadow-lg: 0 20px 60px rgba(0,0,0,.5);
            }

            /* ===== دکمه شناور (FAB) - مدرن با گلس‌مورفیسم ===== */
            .fm-trigger {
                position: fixed;
                bottom: 28px;
                left: 28px;
                width: 64px;
                height: 64px;
                border: 1px solid var(--fm-glass-border);
                border-radius: 20px;
                background: linear-gradient(135deg, var(--fm-grad-1), var(--fm-grad-2));
                color: #fff;
                font-size: 22px;
                cursor: pointer;
                z-index: 9998;
                box-shadow: 0 10px 30px rgba(67,97,238,.45), 0 4px 10px rgba(15,23,42,.15);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, border-radius .3s ease;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            }
            .fm-trigger:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 15px 40px rgba(67,97,238,.55), 0 6px 15px rgba(15,23,42,.2);
                border-radius: 24px;
            }
            .fm-trigger:active { transform: scale(0.95); }
            .fm-trigger.open {
                background: linear-gradient(135deg, #ef4444, #be123c);
                box-shadow: 0 10px 30px rgba(239,68,68,.45);
                border-radius: 50%;
            }
            .fm-trigger.open i { transform: rotate(135deg); }
            .fm-trigger i { transition: transform .4s cubic-bezier(.34,1.56,.64,1); }

            /* پالس اولیه */
            .fm-trigger:not(.open)::before {
                content: "";
                position: absolute;
                inset: -4px;
                border-radius: inherit;
                background: linear-gradient(135deg, var(--fm-grad-1), var(--fm-grad-2));
                z-index: -1;
                opacity: 0;
                animation: fm-pulse 3s ease-out infinite;
            }
            @keyframes fm-pulse {
                0%   { transform: scale(1); opacity: .5; }
                70%  { transform: scale(1.3); opacity: 0; }
                100% { transform: scale(1.3); opacity: 0; }
            }

            /* ===== پس‌زمینه تیره (با blur مدرن) ===== */
            .fm-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(15,23,42,.55);
                backdrop-filter: blur(8px) saturate(1.2);
                -webkit-backdrop-filter: blur(8px) saturate(1.2);
                z-index: 9999;
                opacity: 0;
                pointer-events: none;
                transition: opacity .35s ease;
            }
            .fm-backdrop.visible { opacity: 1; pointer-events: auto; }

            /* ===== پنل اصلی (Drawer) ===== */
            .fm-drawer {
                position: fixed;
                top: 0;
                bottom: 0;
                left: 0;
                width: var(--fm-w, 340px);
                max-width: 85vw;
                background: var(--fm-card);
                z-index: 10000;
                box-shadow: var(--fm-shadow-lg);
                transform: translateX(-105%);
                transition: transform .45s cubic-bezier(.22,1,.36,1);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                border-radius: 0 28px 28px 0;
            }
            .fm-drawer.open { transform: translateX(0); }

            /* موبایل: Bottom Sheet */
            @media (max-width: 992px) {
                .fm-drawer {
                    top: auto;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100%;
                    max-width: 100%;
                    height: var(--fm-mobile-h);
                    max-height: var(--fm-mobile-h);
                    border-radius: 28px 28px 0 0;
                    transform: translateY(105%);
                }
                .fm-drawer.open { transform: translateY(0); }
            }

            /* ===== هدر پنل ===== */
            .fm-header {
                padding: 22px 22px 18px;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #134e4a 100%);
                color: #f8fafc;
                position: relative;
                overflow: hidden;
                flex-shrink: 0;
            }
            .fm-header::before, .fm-header::after {
                content: "";
                position: absolute;
                border-radius: 50%;
                filter: blur(40px);
                pointer-events: none;
                animation: fm-float 10s ease-in-out infinite;
            }
            .fm-header::before {
                width: 220px; height: 220px;
                background: radial-gradient(circle, rgba(16,185,129,.4), transparent 70%);
                top: -90px; right: -50px;
            }
            .fm-header::after {
                width: 180px; height: 180px;
                background: radial-gradient(circle, rgba(139,92,246,.35), transparent 70%);
                bottom: -70px; left: -40px;
                animation-delay: -5s;
            }
            @keyframes fm-float {
                0%,100% { transform: translate(0,0) scale(1); }
                50%     { transform: translate(15px,-15px) scale(1.1); }
            }
            .fm-header-inner {
                position: relative;
                z-index: 1;
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 12px;
            }
            .fm-header h2 {
                margin: 0;
                font-size: 19px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 12px;
                letter-spacing: -0.3px;
            }
            .fm-header h2 .fm-h-ic {
                width: 40px; height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                background: rgba(255,255,255,.15);
                backdrop-filter: blur(10px);
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,.15);
            }
            .fm-header .fm-sub {
                margin: 6px 0 0;
                font-size: 12px;
                opacity: .8;
                font-weight: 500;
            }
            .fm-close-btn {
                position: relative;
                z-index: 1;
                width: 38px; height: 38px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(255,255,255,.15);
                border-radius: 11px;
                background: rgba(255,255,255,.1);
                color: #fff;
                font-size: 16px;
                cursor: pointer;
                transition: all .25s ease;
                backdrop-filter: blur(10px);
            }
            .fm-close-btn:hover {
                background: rgba(239,68,68,.25);
                border-color: rgba(239,68,68,.4);
                transform: rotate(90deg);
            }

            /* دستگیره کشیدن */
            .fm-drag-handle {
                display: none;
                width: 48px; height: 5px;
                background: rgba(255,255,255,.3);
                border-radius: 999px;
                margin: 0 auto 12px;
                cursor: grab;
                transition: background .2s ease;
            }
            .fm-drag-handle:hover { background: rgba(255,255,255,.5); }
            @media (max-width: 992px) {
                .fm-drag-handle { display: block; }
                .fm-header { padding-top: 16px; }
            }

            /* ===== بدنه پنل ===== */
            .fm-body {
                flex: 1;
                overflow-y: auto;
                padding: 14px;
                background: var(--fm-card-2);
                overscroll-behavior: contain;
            }
            .fm-body::-webkit-scrollbar { width: 6px; }
            .fm-body::-webkit-scrollbar-track { background: transparent; }
            .fm-body::-webkit-scrollbar-thumb { background: var(--fm-line); border-radius: 6px; }
            .fm-body::-webkit-scrollbar-thumb:hover { background: var(--fm-muted); }

            /* ===== آیتم منو (مدرن با گلس‌مورفیسم) ===== */
            .fm-item {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 14px 16px;
                margin-bottom: 8px;
                background: var(--fm-card);
                border: 1px solid var(--fm-line);
                border-radius: var(--fm-radius-s);
                cursor: pointer;
                position: relative;
                overflow: hidden;
                opacity: 0;
                transform: translateX(-16px);
                transition: background .25s ease, border-color .25s ease, transform .25s ease, box-shadow .25s ease;
            }
            .fm-drawer.open .fm-item {
                opacity: 1;
                transform: translateX(0);
                transition: opacity .4s ease, transform .4s cubic-bezier(.22,1,.36,1), background .25s, border-color .25s, box-shadow .25s;
            }
            .fm-drawer.open .fm-item:nth-child(1)  { transition-delay: .04s; }
            .fm-drawer.open .fm-item:nth-child(2)  { transition-delay: .08s; }
            .fm-drawer.open .fm-item:nth-child(3)  { transition-delay: .12s; }
            .fm-drawer.open .fm-item:nth-child(4)  { transition-delay: .16s; }
            .fm-drawer.open .fm-item:nth-child(5)  { transition-delay: .20s; }
            .fm-drawer.open .fm-item:nth-child(6)  { transition-delay: .24s; }
            .fm-drawer.open .fm-item:nth-child(7)  { transition-delay: .28s; }
            .fm-drawer.open .fm-item:nth-child(8)  { transition-delay: .32s; }
            .fm-drawer.open .fm-item:nth-child(9)  { transition-delay: .36s; }
            .fm-drawer.open .fm-item:nth-child(10) { transition-delay: .40s; }
            .fm-drawer.open .fm-item:nth-child(11) { transition-delay: .44s; }
            .fm-drawer.open .fm-item:nth-child(12) { transition-delay: .48s; }

            .fm-item::before {
                content: "";
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, var(--fm-item-color, var(--fm-grad-1)), transparent);
                opacity: 0;
                transition: opacity .3s ease;
                z-index: 0;
            }
            .fm-item > * { position: relative; z-index: 1; }
            .fm-item:hover {
                border-color: transparent;
                transform: translateX(4px) scale(1.01);
                box-shadow: 0 8px 24px color-mix(in srgb, var(--fm-item-color, #4361ee) 25%, transparent);
            }
            .fm-item:hover::before { opacity: .08; }
            .fm-item.active {
                border-color: transparent;
            }
            .fm-item.active::before { opacity: .12; }
            .fm-item.active .fm-item-ic {
                background: var(--fm-item-color, var(--fm-grad-1));
                color: #fff;
                box-shadow: 0 6px 16px color-mix(in srgb, var(--fm-item-color, #4361ee) 40%, transparent);
            }
            .fm-item.active .fm-item-title { color: var(--fm-item-color, var(--fm-grad-1)); }
            .fm-item:focus-visible {
                outline: 2px solid var(--fm-item-color, var(--fm-grad-1));
                outline-offset: 2px;
            }

            .fm-item-ic {
                width: 46px; height: 46px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 13px;
                background: color-mix(in srgb, var(--fm-item-color, #4361ee) 14%, transparent);
                color: var(--fm-item-color, var(--fm-grad-1));
                font-size: 18px;
                flex-shrink: 0;
                transition: all .3s ease;
            }
            .fm-item:hover .fm-item-ic {
                transform: scale(1.08) rotate(-5deg);
            }
            .fm-item-body { flex: 1; min-width: 0; }
            .fm-item-title {
                font-size: 15px;
                font-weight: 700;
                color: var(--fm-ink);
                margin: 0;
                transition: color .25s ease;
            }
            .fm-item-desc {
                font-size: 11px;
                color: var(--fm-muted);
                margin: 3px 0 0;
                font-weight: 500;
            }
            .fm-item-arrow {
                color: var(--fm-muted);
                font-size: 13px;
                opacity: 0;
                transform: translateX(-10px);
                transition: all .25s ease;
            }
            .fm-item:hover .fm-item-arrow,
            .fm-item.active .fm-item-arrow {
                opacity: 1;
                transform: translateX(0);
                color: var(--fm-item-color, var(--fm-grad-1));
            }

            /* فوتر */
            .fm-footer {
                padding: 14px 20px;
                background: var(--fm-card);
                border-top: 1px solid var(--fm-line);
                font-size: 11px;
                color: var(--fm-muted);
                text-align: center;
                flex-shrink: 0;
                font-weight: 500;
            }
            .fm-footer kbd {
                background: var(--fm-line-2);
                border: 1px solid var(--fm-line);
                border-radius: 5px;
                padding: 1px 6px;
                font-family: inherit;
                font-size: 10px;
                font-weight: 700;
                color: var(--fm-slate);
            }

            /* ریسپانسیو موبایل: دکمه کوچک‌تر */
            @media (max-width: 600px) {
                .fm-trigger {
                    width: 56px;
                    height: 56px;
                    bottom: 20px;
                    left: 20px;
                    font-size: 20px;
                    border-radius: 18px;
                }
                .fm-item { padding: 12px 14px; gap: 12px; }
                .fm-item-ic { width: 42px; height: 42px; font-size: 16px; }
                .fm-item-title { font-size: 14px; }
            }
        `;
        document.head.appendChild(style);
    }

    /* ============================================================
       ساختار HTML
       ============================================================ */
    function createMenu() {
        if (document.getElementById('fm-trigger')) return;

        // دکمه شناور
        const trigger = document.createElement('button');
        trigger.id = 'fm-trigger';
        trigger.className = 'fm-trigger';
        trigger.setAttribute('aria-label', 'منوی اصلی');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.innerHTML = '<i class="fas fa-bars-staggered"></i>';
        document.body.appendChild(trigger);

        // پس‌زمینه تیره
        const backdrop = document.createElement('div');
        backdrop.id = 'fm-backdrop';
        backdrop.className = 'fm-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.appendChild(backdrop);

        // پنل اصلی
        const drawer = document.createElement('aside');
        drawer.id = 'fm-drawer';
        drawer.className = 'fm-drawer';
        drawer.setAttribute('role', 'navigation');
        drawer.setAttribute('aria-label', 'منوی ناوبری اصلی');
        drawer.setAttribute('aria-hidden', 'true');

        // هدر
        const header = document.createElement('div');
        header.className = 'fm-header';
        header.innerHTML = `
            <div class="fm-drag-handle" id="fm-drag-handle" aria-hidden="true"></div>
            <div class="fm-header-inner">
                <div>
                    <h2>
                        <span class="fm-h-ic"><i class="fas fa-compass"></i></span>
                        منوی اصلی
                    </h2>
                    <p class="fm-sub">دیکشنری هوشمند آلمانی-فارسی</p>
                </div>
                <button class="fm-close-btn" id="fm-close-btn" aria-label="بستن منو" type="button">
                    <i class="fas fa-xmark"></i>
                </button>
            </div>
        `;
        drawer.appendChild(header);

        // بدنه (لیست)
        const body = document.createElement('div');
        body.className = 'fm-body';

        const list = document.createElement('div');
        list.id = 'fm-list';
        list.className = 'fm-list';
        list.setAttribute('role', 'menu');

        FMS.menuItems.forEach((item, idx) => {
            const el = document.createElement('div');
            el.className = 'fm-item';
            el.setAttribute('data-section', item.section);
            el.setAttribute('data-index', idx);
            el.setAttribute('role', 'menuitem');
            el.setAttribute('tabindex', '0');
            el.style.setProperty('--fm-item-color', item.color);
            el.innerHTML = `
                <div class="fm-item-ic"><i class="fas ${item.icon}"></i></div>
                <div class="fm-item-body">
                    <div class="fm-item-title">${item.label}</div>
                    <div class="fm-item-desc">${item.desc}</div>
                </div>
                <i class="fas fa-chevron-right fm-item-arrow"></i>
            `;
            list.appendChild(el);
        });
        body.appendChild(list);
        drawer.appendChild(body);

        // فوتر
        const footer = document.createElement('div');
        footer.className = 'fm-footer';
        footer.innerHTML = '<kbd>Esc</kbd> برای بستن &nbsp;•&nbsp; <kbd>↑</kbd> <kbd>↓</kbd> برای ناوبری';
        drawer.appendChild(footer);

        document.body.appendChild(drawer);

        // کش کردن عناصر
        FMS.elements = {
            trigger: trigger,
            backdrop: backdrop,
            drawer: drawer,
            list: list,
            closeBtn: document.getElementById('fm-close-btn'),
            dragHandle: document.getElementById('fm-drag-handle')
        };

        updateDesktopWidth();

        // فعال‌سازی آیتم فعلی
        const lastSection = localStorage.getItem('lastActiveSection');
        if (lastSection) {
            const idx = FMS.menuItems.findIndex(i => i.section === lastSection);
            if (idx !== -1) {
                setTimeout(() => setActiveItem(idx), 100);
            }
        }
    }

    function setActiveItem(index) {
        const items = document.querySelectorAll('.fm-item');
        items.forEach((item, i) => {
            if (i === index) item.classList.add('active');
            else item.classList.remove('active');
        });
        const sec = FMS.menuItems[index];
        if (sec) FMS.currentSection = sec.section;
    }

    function checkMobile() {
        FMS.isMobile = window.innerWidth <= FMS.config.mobileBreakpoint;
        return FMS.isMobile;
    }

    function updateDesktopWidth() {
        if (!checkMobile() && FMS.elements.drawer) {
            FMS.elements.drawer.style.setProperty('--fm-w', FMS.config.desktopWidth + 'px');
        }
    }

    /* ============================================================
       باز/بسته کردن
       ============================================================ */
    function openMenu() {
        if (FMS.isOpen || FMS.isAnimating) return;
        FMS.isAnimating = true;
        FMS.isOpen = true;
        FMS.lastFocused = document.activeElement;

        const { trigger, backdrop, drawer } = FMS.elements;
        trigger.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        backdrop.classList.add('visible');
        backdrop.setAttribute('aria-hidden', 'false');
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');

        // جابجایی محتوا (دسکتاپ)
        if (!FMS.isMobile) {
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.transition = 'margin .45s cubic-bezier(.22,1,.36,1)';
                mainContent.style.marginRight = '0';
                mainContent.style.marginLeft = FMS.config.desktopWidth + 'px';
            }
        }

        setTimeout(() => {
            const firstItem = FMS.elements.list.querySelector('.fm-item');
            if (firstItem) firstItem.focus();
            FMS.isAnimating = false;
        }, FMS.config.animationDuration);
    }

    function closeMenu() {
        if (!FMS.isOpen || FMS.isAnimating) return;
        FMS.isAnimating = true;
        FMS.isOpen = false;

        const { trigger, backdrop, drawer } = FMS.elements;
        trigger.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        backdrop.classList.remove('visible');
        backdrop.setAttribute('aria-hidden', 'true');
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');

        if (!FMS.isMobile) {
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.marginLeft = '0';
            }
        }

        setTimeout(() => {
            FMS.isAnimating = false;
            if (FMS.lastFocused) FMS.lastFocused.focus();
        }, FMS.config.animationDuration);
    }

    function toggleMenu() {
        if (FMS.isOpen) closeMenu();
        else openMenu();
    }

    /* ============================================================
       ناوبری
       ============================================================ */
    function navigateToSection(sectionId) {
        const target = document.getElementById(`${sectionId}-section`);
        if (!target) {
            setTimeout(() => closeMenu(), 120);
            return;
        }

        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        target.classList.add('active');
        localStorage.setItem('lastActiveSection', sectionId);

        const idx = FMS.menuItems.findIndex(i => i.section === sectionId);
        if (idx !== -1) setActiveItem(idx);

        if (window.dictionaryApp) {
            try {
                switch (sectionId) {
                    case 'ai-chat':    window.dictionaryApp.renderAIChat(); break;
                    case 'settings':   window.dictionaryApp.renderSettings(); break;
                    case 'practice':   window.dictionaryApp.renderPracticeOptions(); break;
                    case 'favorites':  window.dictionaryApp.renderFavorites(); break;
                    case 'word-list':  window.dictionaryApp.renderWordList(); break;
                    case 'progress':   if (window.dictionaryApp.updateStats) window.dictionaryApp.updateStats(); break;
                    case 'translate':  window.dictionaryApp.renderTranslate(); break;
                }
            } catch (e) {
                console.error('خطا در رندر بخش:', e);
            }
        }

        setTimeout(() => closeMenu(), 120);
    }

    /* ============================================================
       رویدادها
       ============================================================ */
    function attachEvents() {
        const { trigger, backdrop, closeBtn, list } = FMS.elements;
        if (!trigger) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
            });
        }

        // Event delegation برای آیتم‌ها
        list.addEventListener('click', (e) => {
            const item = e.target.closest('.fm-item');
            if (!item) return;
            e.stopPropagation();
            const section = item.getAttribute('data-section');
            if (section) navigateToSection(section);
        });

        list.addEventListener('keydown', (e) => {
            const item = e.target.closest('.fm-item');
            if (!item) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) navigateToSection(section);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = item.nextElementSibling;
                if (next) next.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = item.previousElementSibling;
                if (prev) prev.focus();
            } else if (e.key === 'Home') {
                e.preventDefault();
                const first = list.querySelector('.fm-item');
                if (first) first.focus();
            } else if (e.key === 'End') {
                e.preventDefault();
                const items = list.querySelectorAll('.fm-item');
                if (items.length) items[items.length - 1].focus();
            }
        });

        backdrop.addEventListener('click', () => closeMenu());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && FMS.isOpen) closeMenu();
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                checkMobile();
                updateDesktopWidth();
                if (FMS.isMobile) {
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) mainContent.style.marginLeft = '0';
                }
            }, 200);
        });

        // کشیدن دستی (موبایل)
        const dragHandle = FMS.elements.dragHandle;
        if (dragHandle) {
            let startY = 0, currentY = 0, isDragging = false;

            const onStart = (e) => {
                isDragging = true;
                startY = e.touches ? e.touches[0].clientY : e.clientY;
                dragHandle.style.cursor = 'grabbing';
            };
            const onMove = (e) => {
                if (!isDragging) return;
                currentY = e.touches ? e.touches[0].clientY : e.clientY;
                const diff = currentY - startY;
                if (diff > 0 && FMS.isMobile) {
                    FMS.elements.drawer.style.transition = 'none';
                    FMS.elements.drawer.style.transform = `translateY(${diff}px)`;
                }
            };
            const onEnd = () => {
                if (!isDragging) return;
                isDragging = false;
                dragHandle.style.cursor = 'grab';
                FMS.elements.drawer.style.transition = '';
                const diff = currentY - startY;
                if (diff > 80) {
                    closeMenu();
                }
                FMS.elements.drawer.style.transform = '';
            };

            dragHandle.addEventListener('touchstart', onStart, { passive: true });
            dragHandle.addEventListener('touchmove', onMove, { passive: true });
            dragHandle.addEventListener('touchend', onEnd);
            dragHandle.addEventListener('mousedown', onStart);
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
        }
    }

    /* ============================================================
       API عمومی (سازگار با نسخه قدیمی)
       ============================================================ */
    window.EliasMenu = {
        open: openMenu,
        close: closeMenu,
        toggle: toggleMenu,
        navigate: navigateToSection,
        isOpen: () => FMS.isOpen,
        setActive: setActiveItem
    };

    /* ============================================================
       راه‌اندازی
       ============================================================ */
    function init() {
        console.log('🎨 منوی شناور مدرن - راه‌اندازی...');

        // حذف عناصر قدیمی
        ['floating-menu-btn', 'floating-menu-container', 'floating-book-btn'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
        const oldSidebar = document.querySelector('.sidebar');
        if (oldSidebar) oldSidebar.remove();

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.marginRight = '0';
            mainContent.style.marginLeft = '0';
            mainContent.style.width = '100%';
        }

        injectStyles();
        createMenu();
        attachEvents();
        checkMobile();

        // ناوبری به بخش ذخیره‌شده
        const lastSection = localStorage.getItem('lastActiveSection');
        if (lastSection) {
            setTimeout(() => {
                const target = document.getElementById(`${lastSection}-section`);
                if (target) {
                    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                    target.classList.add('active');
                    const idx = FMS.menuItems.findIndex(i => i.section === lastSection);
                    if (idx !== -1) setActiveItem(idx);
                }
            }, 300);
        }

        console.log('✅ منوی شناور مدرن فعال شد');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
// end floating-menu-system.js
