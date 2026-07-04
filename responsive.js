// start responsive.js
/* ================================================
   ELIAS.DICTIONARY - ریسپانسیو کامل
   نسخه 3.0.0 - تمام بخش‌ها - فقط منوی شناور
   ================================================ */
/* ================================================
   ELIAS.DICTIONARY - ریسپانسیو کامل
   ================================================ */

(function() {
    'use strict';
    
    // انتقال toast به گوشه بالا راست
    function moveToastToTopRight() {
        const toastContainer = document.getElementById('toast-container');
        if (toastContainer) {
            toastContainer.style.top = '20px';
            toastContainer.style.bottom = 'auto';
            toastContainer.style.left = 'auto';
            toastContainer.style.right = '20px';
        }
    }
    
    function handleResponsive() {
        const width = window.innerWidth;
        const mainContent = document.querySelector('.main-content');
        
        if (!mainContent) return;
        
        if (width <= 768) {
            mainContent.style.padding = '12px';
            
            // کارت‌ها
            document.querySelectorAll('.word-card').forEach(card => {
                card.style.padding = '16px';
            });
            
            // دکمه‌های جنسیت
            document.querySelectorAll('.gender-options').forEach(opt => {
                opt.style.display = 'grid';
                opt.style.gridTemplateColumns = 'repeat(2, 1fr)';
                opt.style.gap = '8px';
            });
            
            // فلش کارت
            document.querySelectorAll('.flashcard').forEach(card => {
                card.style.height = '250px';
                card.style.maxWidth = '100%';
            });
            
            // تمرین نوشتاری
            document.querySelectorAll('.writing-exercise .word-to-translate h3').forEach(el => {
                el.style.fontSize = '24px';
            });
            
            // دایره نتایج
            document.querySelectorAll('.result-circle').forEach(circle => {
                circle.style.width = '100px';
                circle.style.height = '100px';
            });
            
        } else if (width <= 992) {
            mainContent.style.padding = '20px';
            
            document.querySelectorAll('.gender-options').forEach(opt => {
                opt.style.gridTemplateColumns = 'repeat(2, 1fr)';
            });
            
        } else {
            mainContent.style.padding = '24px';
            
            document.querySelectorAll('.gender-options').forEach(opt => {
                opt.style.display = 'flex';
                opt.style.flexWrap = 'wrap';
                opt.style.gap = '12px';
            });
            
            document.querySelectorAll('.flashcard').forEach(card => {
                card.style.height = '300px';
                card.style.maxWidth = '500px';
            });
        }
    }
    
    // نمایش شماره لغت در فلش کارت
    function addWordNumbers() {
        const flashcardsSection = document.getElementById('flashcards-section');
        if (flashcardsSection) {
            const badge = flashcardsSection.querySelector('.badge');
            if (badge) {
                badge.style.fontSize = '16px';
                badge.style.padding = '8px 16px';
            }
        }
        
        const practiceSection = document.getElementById('practice-section');
        if (practiceSection) {
            const badges = practiceSection.querySelectorAll('.badge');
            badges.forEach(badge => {
                badge.style.fontSize = '16px';
                badge.style.padding = '8px 16px';
            });
        }
    }
    
    // نرمالایز کردن پاسخ‌ها (حذف فاصله و کوچک کردن حروف)
    function normalizeString(str) {
        if (!str) return '';
        return str.toString().trim().toLowerCase().replace(/\s+/g, ' ');
    }
    
    // ذخیره در localStorage برای حافظه AI
    function saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }
    
    function getFromLocalStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    }
    
    window.addEventListener('resize', debounce(() => {
        handleResponsive();
        moveToastToTopRight();
        addWordNumbers();
    }, 250));
    
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            handleResponsive();
            moveToastToTopRight();
            addWordNumbers();
        }, 100);
    });
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // اضافه کردن متدهای کمکی به window
    window.StringUtils = {
        normalize: normalizeString,
        saveToStorage: saveToLocalStorage,
        getFromStorage: getFromLocalStorage
    };
    
})();
(function() {
    'use strict';
    
    function handleResponsive() {
        const width = window.innerWidth;
        const mainContent = document.querySelector('.main-content');
        
        if (!mainContent) return;
        
        // ========== تنظیمات برای موبایل (عرض کمتر از 768px) ==========
        if (width <= 768) {
            mainContent.style.padding = '12px';
            
            // کارت‌ها
            document.querySelectorAll('.word-card').forEach(card => {
                card.style.padding = '16px';
                card.style.marginBottom = '16px';
            });
            
            // دکمه‌های جنسیت
            document.querySelectorAll('.gender-options').forEach(opt => {
                opt.style.display = 'grid';
                opt.style.gridTemplateColumns = 'repeat(2, 1fr)';
                opt.style.gap = '8px';
            });
            
            document.querySelectorAll('.gender-btn').forEach(btn => {
                btn.style.padding = '10px';
                btn.style.fontSize = '13px';
            });
            
            // جعبه جستجو
            document.querySelectorAll('.search-box').forEach(box => {
                box.style.flexDirection = 'column';
                box.style.gap = '10px';
            });
            
            document.querySelectorAll('.search-box .btn').forEach(btn => {
                btn.style.width = '100%';
            });
            
            // دکمه‌های فیلتر
            document.querySelectorAll('.filter-buttons').forEach(btns => {
                btns.style.setProperty('display', 'flex', 'important');
                btns.style.setProperty('flex-direction', 'row', 'important');
                btns.style.setProperty('flex-wrap', 'nowrap', 'important');
                btns.style.setProperty('overflow-x', 'auto', 'important');
                btns.style.setProperty('gap', '8px', 'important');
                btns.style.setProperty('padding', '6px', 'important');
            });
            
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.style.setProperty('width', 'auto', 'important');
                btn.style.setProperty('flex-shrink', '0', 'important');
                btn.style.setProperty('white-space', 'nowrap', 'important');
                btn.style.setProperty('justify-content', 'center', 'important');
            });
            
            // اکشن بوتن‌ها
            document.querySelectorAll('.action-buttons').forEach(btns => {
                btns.style.display = 'flex';
                btns.style.flexDirection = 'column';
                btns.style.gap = '10px';
            });
            
            document.querySelectorAll('.action-buttons .btn').forEach(btn => {
                btn.style.width = '100%';
            });
            
            // تب‌ها
            document.querySelectorAll('.tab-container').forEach(tabs => {
                tabs.style.overflowX = 'auto';
                tabs.style.flexWrap = 'nowrap';
                tabs.style.paddingBottom = '8px';
                tabs.style.gap = '4px';
            });
            
            document.querySelectorAll('.tab').forEach(tab => {
                tab.style.whiteSpace = 'nowrap';
                tab.style.padding = '10px 16px';
                tab.style.fontSize = '14px';
            });
            
            // فرم صرف فعل
            document.querySelectorAll('.verb-form-row').forEach(row => {
                row.style.display = 'flex';
                row.style.flexDirection = 'column';
                row.style.gap = '12px';
            });
            
            document.querySelectorAll('.verb-form-item').forEach(item => {
                item.style.width = '100%';
            });
            
            // گرید آمار
            document.querySelectorAll('.stats-grid').forEach(grid => {
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                grid.style.gap = '12px';
            });
            
            document.querySelectorAll('.stat-card').forEach(card => {
                card.style.padding = '16px';
            });
            
            // لیست لغات
            document.querySelectorAll('.word-list').forEach(list => {
                list.style.display = 'grid';
                list.style.gridTemplateColumns = '1fr';
                list.style.gap = '12px';
            });
            
            // جهت‌یاب مترجم
            document.querySelectorAll('.direction-selector').forEach(sel => {
                sel.style.display = 'grid';
                sel.style.gridTemplateColumns = '1fr';
                sel.style.gap = '10px';
            });
            
            document.querySelectorAll('.direction-option').forEach(opt => {
                opt.style.padding = '12px';
            });
            
            // دکمه‌های اکشن مترجم
            document.querySelectorAll('.action-group').forEach(group => {
                group.style.display = 'flex';
                group.style.flexDirection = 'column';
                group.style.gap = '8px';
            });
            
            document.querySelectorAll('.action-btn').forEach(btn => {
                btn.style.width = '100%';
                btn.style.justifyContent = 'center';
            });
            
            // پوسته‌های رنگی
            document.querySelectorAll('.theme-selector').forEach(sel => {
                sel.style.display = 'grid';
                sel.style.gridTemplateColumns = 'repeat(3, 1fr)';
                sel.style.gap = '8px';
            });
            
            // سبک آیکون
            document.querySelectorAll('.icon-style-selector').forEach(sel => {
                sel.style.display = 'grid';
                sel.style.gridTemplateColumns = 'repeat(3, 1fr)';
                sel.style.gap = '8px';
            });
            
            // رنگ‌های سفارشی
            document.querySelectorAll('.color-presets').forEach(presets => {
                presets.style.display = 'grid';
                presets.style.gridTemplateColumns = 'repeat(4, 1fr)';
                presets.style.gap = '6px';
            });
            
            // کنترل RGB
            document.querySelectorAll('.rgb-controls').forEach(control => {
                control.style.flexDirection = 'column';
                control.style.alignItems = 'flex-start';
                control.style.gap = '6px';
            });
            
            document.querySelectorAll('.rgb-slider-container').forEach(container => {
                container.style.width = '100%';
            });
            
            // لیست موسیقی
            document.querySelectorAll('.music-item').forEach(item => {
                item.style.flexDirection = 'column';
                item.style.alignItems = 'flex-start';
                item.style.gap = '12px';
            });
            
            document.querySelectorAll('.music-actions').forEach(actions => {
                actions.style.width = '100%';
                actions.style.justifyContent = 'flex-end';
            });
            
            // مودال
            document.querySelectorAll('.modal-content').forEach(modal => {
                modal.style.width = '95%';
                modal.style.maxHeight = '90vh';
            });
            
            // فلش کارت
            document.querySelectorAll('.flashcard').forEach(card => {
                card.style.height = '250px';
            });
            
            // پیشنهادات
            document.querySelectorAll('.suggestions-list').forEach(list => {
                list.style.gridTemplateColumns = '1fr';
            });
            
            // وضعیت خالی
            document.querySelectorAll('.empty-state-features').forEach(features => {
                features.style.flexDirection = 'column';
                features.style.gap = '8px';
            });
            
            document.querySelectorAll('.empty-state-features span').forEach(span => {
                span.style.width = '100%';
            });
            
            // دستاوردها
            document.querySelectorAll('.achievements-list').forEach(list => {
                list.style.gridTemplateColumns = 'repeat(2, 1fr)';
                list.style.gap = '10px';
            });
            
            // فعالیت‌ها
            document.querySelectorAll('.activity-item').forEach(item => {
                item.style.padding = '10px';
            });
        }
        
        // ========== تنظیمات برای تبلت (عرض بین 769px تا 992px) ==========
        else if (width <= 992) {
            mainContent.style.padding = '20px';
            
            // گرید آمار
            document.querySelectorAll('.stats-grid').forEach(grid => {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            });
            
            // لیست لغات
            document.querySelectorAll('.word-list').forEach(list => {
                list.style.gridTemplateColumns = 'repeat(2, 1fr)';
            });
            
            // دکمه‌های جنسیت
            document.querySelectorAll('.gender-options').forEach(opt => {
                opt.style.gridTemplateColumns = 'repeat(2, 1fr)';
            });
            
            // پوسته‌های رنگی
            document.querySelectorAll('.theme-selector').forEach(sel => {
                sel.style.gridTemplateColumns = 'repeat(4, 1fr)';
            });
            
            // فرم صرف فعل
            document.querySelectorAll('.verb-form-row').forEach(row => {
                row.style.flexDirection = 'row';
                row.style.gap = '8px';
            });
        }
        
        // ========== تنظیمات برای دسکتاپ (عرض بیشتر از 992px) ==========
        else {
            mainContent.style.padding = '24px';
            
            // گرید آمار
            document.querySelectorAll('.stats-grid').forEach(grid => {
                grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            });
            
            // لیست لغات
            document.querySelectorAll('.word-list').forEach(list => {
                list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
            });
            
            // دکمه‌های جنسیت
            document.querySelectorAll('.gender-options').forEach(opt => {
                opt.style.display = 'flex';
                opt.style.flexDirection = 'row';
                opt.style.gap = '12px';
            });
            
            // پوسته‌های رنگی
            document.querySelectorAll('.theme-selector').forEach(sel => {
                sel.style.display = 'grid';
                sel.style.gridTemplateColumns = 'repeat(6, 1fr)';
                sel.style.gap = '12px';
            });
            
            // فرم صرف فعل
            document.querySelectorAll('.verb-form-row').forEach(row => {
                row.style.display = 'grid';
                row.style.gridTemplateColumns = 'repeat(3, 1fr)';
                row.style.gap = '16px';
            });
            
            // دکمه‌های اکشن
            document.querySelectorAll('.action-group').forEach(group => {
                group.style.display = 'flex';
                group.style.flexDirection = 'row';
                group.style.gap = '12px';
            });
            
            document.querySelectorAll('.action-btn').forEach(btn => {
                btn.style.width = 'auto';
            });
        }
    }

    // ========== تنظیمات خاص برای AI چت ==========
    function handleAIChatResponsive() {
        const width = window.innerWidth;
        const chatContainer = document.querySelector('.ai-chat-container');
        const chatHeader = document.querySelector('.ai-chat-header');
        const headerActions = document.querySelector('.header-actions');
        const quickActions = document.querySelector('.quick-actions-section');
        const modelRow = document.querySelector('.model-selection-row');
        const inputWrapper = document.querySelector('.input-wrapper');
        
        if (!chatContainer) return;
        
        if (width <= 768) {
            // هدر
            if (chatHeader) {
                chatHeader.style.flexDirection = 'column';
                chatHeader.style.alignItems = 'flex-start';
                chatHeader.style.gap = '12px';
                chatHeader.style.padding = '16px';
            }
            
            // دکمه‌های هدر
            if (headerActions) {
                headerActions.style.width = '100%';
                headerActions.style.justifyContent = 'space-between';
            }
            
            document.querySelectorAll('.header-btn').forEach(btn => {
                btn.style.width = '38px';
                btn.style.height = '38px';
                btn.style.fontSize = '16px';
            });
            
            // پیشنهادات سریع
            if (quickActions) {
                quickActions.style.padding = '12px 16px';
            }
            
            document.querySelectorAll('.quick-action-btn').forEach(btn => {
                btn.style.padding = '10px 12px';
                btn.style.fontSize = '13px';
            });
            
            // ردیف مدل
            if (modelRow) {
                modelRow.style.flexDirection = 'column';
                modelRow.style.alignItems = 'flex-start';
                modelRow.style.gap = '10px';
                modelRow.style.padding = '12px';
            }
            
            document.querySelectorAll('.model-select').forEach(select => {
                select.style.width = '100%';
                select.style.padding = '10px 35px 10px 12px';
                select.style.fontSize = '13px';
            });
            
            // ورودی
            if (inputWrapper) {
                inputWrapper.style.flexDirection = 'column';
                inputWrapper.style.alignItems = 'stretch';
                inputWrapper.style.padding = '12px';
                inputWrapper.style.gap = '10px';
            }
            
            document.querySelectorAll('.input-actions-left, .input-actions-right').forEach(actions => {
                actions.style.justifyContent = 'center';
                actions.style.padding = '0';
            });
            
            document.querySelectorAll('.chat-input-textarea').forEach(textarea => {
                textarea.style.minHeight = '60px';
                textarea.style.padding = '10px 12px';
                textarea.style.fontSize = '14px';
            });
            
            document.querySelectorAll('.send-message-btn').forEach(btn => {
                btn.style.width = '100%';
                btn.style.height = '42px';
            });
            
            document.querySelectorAll('.input-action-btn').forEach(btn => {
                btn.style.width = '38px';
                btn.style.height = '38px';
                btn.style.fontSize = '16px';
            });
            
            // پیام‌ها
            document.querySelectorAll('.message').forEach(msg => {
                msg.style.maxWidth = '90%';
            });
            
            document.querySelectorAll('.message-avatar').forEach(avatar => {
                avatar.style.width = '35px';
                avatar.style.height = '35px';
                avatar.style.fontSize = '16px';
            });
            
            document.querySelectorAll('.message-content').forEach(content => {
                content.style.padding = '12px';
            });
            
            document.querySelectorAll('.message-text').forEach(text => {
                text.style.fontSize = '14px';
            });
            
            // راهنما
            document.querySelectorAll('.input-hints').forEach(hints => {
                hints.style.flexWrap = 'wrap';
                hints.style.gap = '8px';
            });
            
            document.querySelectorAll('.hint-item').forEach(item => {
                item.style.fontSize = '11px';
            });
        }
        
        else if (width <= 992) {
            if (chatHeader) {
                chatHeader.style.padding = '16px 20px';
            }
            
            document.querySelectorAll('.quick-action-btn').forEach(btn => {
                btn.style.padding = '12px 15px';
            });
            
            if (modelRow) {
                modelRow.style.flexWrap = 'wrap';
            }
        }
        
        else {
            if (chatHeader) {
                chatHeader.style.flexDirection = 'row';
                chatHeader.style.alignItems = 'center';
                chatHeader.style.padding = '20px 25px';
            }
            
            if (inputWrapper) {
                inputWrapper.style.flexDirection = 'row';
                inputWrapper.style.alignItems = 'flex-end';
            }
            
            document.querySelectorAll('.send-message-btn').forEach(btn => {
                btn.style.width = 'auto';
                btn.style.height = '40px';
            });
        }
    }

    // ========== تنظیمات خاص برای تمرین‌ها ==========
    function handlePracticeResponsive() {
        const width = window.innerWidth;
        
        if (width <= 768) {
            // گرید تمرین‌ها
            document.querySelectorAll('.practice-options-grid').forEach(grid => {
                grid.style.gridTemplateColumns = '1fr';
                grid.style.gap = '12px';
            });
            
            document.querySelectorAll('.practice-option-card').forEach(card => {
                card.style.padding = '20px';
            });
            
            // کنترل صدا
            document.querySelectorAll('.voice-controls').forEach(controls => {
                controls.style.flexDirection = 'column';
                controls.style.gap = '8px';
            });
            
            document.querySelectorAll('.voice-btn').forEach(btn => {
                btn.style.width = '100%';
            });
            
            // فیلد پاسخ
            document.querySelectorAll('.answer-input').forEach(input => {
                input.style.padding = '12px';
                input.style.fontSize = '16px';
            });
            
            // دایره نتایج
            document.querySelectorAll('.result-circle').forEach(circle => {
                circle.style.width = '100px';
                circle.style.height = '100px';
            });
            
            document.querySelectorAll('.result-circle-inner').forEach(inner => {
                inner.style.fontSize = '20px';
            });
            
            // نمودار پیشرفت هفتگی
            document.querySelectorAll('.weekly-progress').forEach(progress => {
                progress.style.gap = '4px';
            });
            
            document.querySelectorAll('.day-bar').forEach(bar => {
                bar.style.height = '80px';
            });
        }
    }

    // ========== تنظیمات خاص برای مترجم ==========
    function handleTranslateResponsive() {
        const width = window.innerWidth;
        
        if (width <= 768) {
            document.querySelectorAll('.translate-result').forEach(result => {
                result.style.minHeight = '120px';
                result.style.padding = '16px';
                result.style.fontSize = '15px';
            });
            
            document.querySelectorAll('.direction-icon').forEach(icon => {
                icon.style.width = '40px';
                icon.style.height = '40px';
                icon.style.fontSize = '18px';
            });
            
            document.querySelectorAll('.direction-title').forEach(title => {
                title.style.fontSize = '14px';
            });
            
            document.querySelectorAll('.direction-subtitle').forEach(sub => {
                sub.style.fontSize = '12px';
            });
        }
    }

    // ========== تنظیمات خاص برای مودال‌ها ==========
    function handleModalResponsive() {
        const width = window.innerWidth;
        
        if (width <= 768) {
            document.querySelectorAll('.modal-header').forEach(header => {
                header.style.padding = '16px';
            });
            
            document.querySelectorAll('.modal-body').forEach(body => {
                body.style.padding = '16px';
            });
            
            document.querySelectorAll('.modal-footer').forEach(footer => {
                footer.style.padding = '16px';
                footer.style.flexDirection = 'column';
            });
            
            document.querySelectorAll('.modal-footer .btn').forEach(btn => {
                btn.style.width = '100%';
            });
            
            document.querySelectorAll('.chat-session-item').forEach(item => {
                item.style.flexDirection = 'column';
                item.style.alignItems = 'flex-start';
                item.style.gap = '12px';
            });
            
            document.querySelectorAll('.chat-session-actions').forEach(actions => {
                actions.style.width = '100%';
                actions.style.justifyContent = 'flex-end';
            });
        }
    }

    // ========== تنظیمات خاص برای نوتیفیکیشن ==========
    function handleToastResponsive() {
        const width = window.innerWidth;
        const container = document.querySelector('.toast-container');
        
        if (!container) return;
        
        if (width <= 768) {
            container.style.left = '16px';
            container.style.right = '16px';
            container.style.bottom = '90px';
            
            document.querySelectorAll('.toast').forEach(toast => {
                toast.style.width = '100%';
                toast.style.minWidth = 'auto';
                toast.style.padding = '12px 16px';
                toast.style.fontSize = '13px';
            });
        } else {
            container.style.left = '30px';
            container.style.right = 'auto';
            container.style.bottom = '100px';
        }
    }

    // ========== رفع مشکل ارتفاع در مرورگرهای موبایل ==========
    function fixMobileViewport() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.minHeight = `calc(var(--vh, 1vh) * 100)`;
        }
    }

    // ========== تنظیم فاصله از دکمه شناور ==========
    function adjustForFloatingMenu() {
        const width = window.innerWidth;
        const mainContent = document.querySelector('.main-content');
        const toastContainer = document.querySelector('.toast-container');
        
        if (width <= 992) {
            if (mainContent) {
                mainContent.style.paddingBottom = '100px';
            }
            if (toastContainer) {
                toastContainer.style.bottom = '100px';
            }
        } else {
            if (mainContent) {
                mainContent.style.paddingBottom = '24px';
            }
            if (toastContainer) {
                toastContainer.style.bottom = '30px';
            }
        }
    }

    // ========== دبدounce برای بهینه‌سازی ==========
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ========== رویداد تغییر اندازه پنجره ==========
    window.addEventListener('resize', debounce(() => {
        handleResponsive();
        handleAIChatResponsive();
        handlePracticeResponsive();
        handleTranslateResponsive();
        handleModalResponsive();
        handleToastResponsive();
        fixMobileViewport();
        adjustForFloatingMenu();
    }, 250));

    // ========== اجرای اولیه ==========
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            handleResponsive();
            handleAIChatResponsive();
            handlePracticeResponsive();
            handleTranslateResponsive();
            handleModalResponsive();
            handleToastResponsive();
            fixMobileViewport();
            adjustForFloatingMenu();
        }, 100);
    });

    // ========== رفع مشکل کیبورد در موبایل ==========
    window.addEventListener('focusin', (e) => {
        if (window.innerWidth <= 768 && 
            (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    });

    // ========== چرخش صفحه ==========
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            handleResponsive();
            handleAIChatResponsive();
            fixMobileViewport();
            adjustForFloatingMenu();
        }, 200);
    });

})();
// end responsive .js 
