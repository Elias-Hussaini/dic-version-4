/* ================================================================
   dict-auto-fullscreen.js — ورود خودکار به حالت تمام‌صفحه
   ----------------------------------------------------------------
   • مرورگرها فقط در پاسخ به یک user gesture اجازه می‌دهند
     requestFullscreen() صدا زده شود.
   • این ماژول روی اولین تعامل کاربر (click/touch/keydown) وارد
     حالت تمام‌صفحه می‌شود و یک دکمه شناور برای خروج/ورود دوباره
     اضافه می‌کند.
   • اگر کاربر قبلاً از حالت تمام‌صفحه خارج شده باشد، دیگر به‌صورت
     خودکار وارد نمی‌شود (احترام به انتخاب کاربر).
   ================================================================ */

(function () {
    'use strict';

    var STATE_KEY = 'dict-fullscreen-pref';
    var hasEnteredOnce = false;
    var userExitedManually = false;
    var fsBtn = null;

    // خواندن ترجیح کاربر از localStorage
    function readPref() {
        try {
            var v = localStorage.getItem(STATE_KEY);
            return v === null ? 'auto' : v; // auto | on | off
        } catch (e) { return 'auto'; }
    }
    function writePref(v) {
        try { localStorage.setItem(STATE_KEY, v); } catch (e) {}
    }

    // آیا الان در حالت تمام‌صفحه هستیم؟
    function isFullscreen() {
        return !!(document.fullscreenElement ||
                  document.webkitFullscreenElement ||
                  document.mozFullScreenElement ||
                  document.msFullscreenElement);
    }

    // درخواست حالت تمام‌صفحه
    function requestFs() {
        var el = document.documentElement;
        var fn = el.requestFullscreen ||
                 el.webkitRequestFullscreen ||
                 el.mozRequestFullScreen ||
                 el.msRequestFullscreen;
        if (fn) {
            try {
                var p = fn.call(el);
                if (p && typeof p.then === 'function') {
                    p.then(function () {
                        console.log('[fullscreen] ✅ وارد حالت تمام‌صفحه شد');
                        hasEnteredOnce = true;
                    }).catch(function (e) {
                        console.warn('[fullscreen] خطا:', e.message);
                    });
                } else {
                    hasEnteredOnce = true;
                }
            } catch (e) {
                console.warn('[fullscreen] خطا:', e.message);
            }
        } else {
            console.warn('[fullscreen] مرورگر از Fullscreen API پشتیبانی نمی‌کند');
        }
    }

    // خروج از حالت تمام‌صفحه
    function exitFs() {
        var fn = document.exitFullscreen ||
                 document.webkitExitFullscreen ||
                 document.mozCancelFullScreen ||
                 document.msExitFullscreen;
        if (fn) {
            try { fn.call(document); } catch (e) {}
        }
    }

    function toggleFs() {
        if (isFullscreen()) {
            userExitedManually = true;
            writePref('off');
            exitFs();
        } else {
            userExitedManually = false;
            writePref('on');
            requestFs();
        }
    }

    // ایجاد دکمه شناور برای تغییر حالت
    function injectButton() {
        if (fsBtn) return;
        fsBtn = document.createElement('button');
        fsBtn.id = 'dict-fs-toggle';
        fsBtn.setAttribute('aria-label', 'حالت تمام‌صفحه');
        fsBtn.setAttribute('title', 'حالت تمام‌صفحه');
        fsBtn.type = 'button';
        fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fsBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleFs();
        });
        document.body.appendChild(fsBtn);
    }

    function updateButtonIcon() {
        if (!fsBtn) return;
        var icon = fsBtn.querySelector('i');
        if (!icon) return;
        if (isFullscreen()) {
            icon.className = 'fas fa-compress';
            fsBtn.classList.add('is-fullscreen');
        } else {
            icon.className = 'fas fa-expand';
            fsBtn.classList.remove('is-fullscreen');
        }
    }

    // تزریق استایل دکمه
    function injectStyles() {
        if (document.getElementById('dict-fs-styles')) return;
        var s = document.createElement('style');
        s.id = 'dict-fs-styles';
        s.textContent = [
            '#dict-fs-toggle {',
            '  position: fixed; bottom: 20px; right: 20px;',
            '  z-index: 99998;',
            '  width: 48px; height: 48px; border-radius: 50%;',
            '  border: none; cursor: pointer;',
            '  background: linear-gradient(135deg, #4361ee, #3a0ca3);',
            '  color: #fff; font-size: 18px;',
            '  display: flex; align-items: center; justify-content: center;',
            '  box-shadow: 0 6px 20px rgba(67,97,238,.35);',
            '  transition: transform .2s, box-shadow .2s, opacity .2s;',
            '  opacity: .9;',
            '}',
            '#dict-fs-toggle:hover { transform: scale(1.08); opacity: 1; box-shadow: 0 8px 24px rgba(67,97,238,.5); }',
            '#dict-fs-toggle:active { transform: scale(.95); }',
            '#dict-fs-toggle.is-fullscreen { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 6px 20px rgba(16,185,129,.35); }',
            '@media (max-width: 640px) {',
            '  #dict-fs-toggle { width: 40px; height: 40px; font-size: 14px; bottom: 28px; right: 28px; border-radius: 12px; }',
            '}',
            '/* در حالت تمام‌صفحه دکمه نیمه‌شفاف می‌شود */',
            ':fullscreen #dict-fs-toggle, :-webkit-full-screen #dict-fs-toggle { opacity: .55; }',
            ':fullscreen #dict-fs-toggle:hover, :-webkit-full-screen #dict-fs-toggle:hover { opacity: 1; }'
        ].join('\n');
        document.head.appendChild(s);
    }

    // گوش دادن به تغییرات حالت تمام‌صفحه (خروج دستی با Esc)
    function listenFsChange() {
        var handler = function () {
            if (!isFullscreen() && hasEnteredOnce && !userExitedManually) {
                // کاربر با Esc خارج شده — دیگر خودکار وارد نکن
                userExitedManually = true;
                writePref('off');
                console.log('[fullscreen] کاربر با Esc خارج شد — دیگر خودکار وارد نمی‌شود');
            }
            updateButtonIcon();
        };
        document.addEventListener('fullscreenchange', handler);
        document.addEventListener('webkitfullscreenchange', handler);
        document.addEventListener('mozfullscreenchange', handler);
        document.addEventListener('MSFullscreenChange', handler);
    }

    // اولین تعامل کاربر — وارد کردن به حالت تمام‌صفحه
    function attachGestureListener() {
        var pref = readPref();
        // اگر کاربر قبلاً گفت "خاموش"، دیگر خودکار وارد نکن
        if (pref === 'off') {
            console.log('[fullscreen] ترجیح کاربر: خاموش. دکمه شناور فعال است.');
            return;
        }

        var gestureHandler = function (e) {
            // فقط اولین تعامل
            if (hasEnteredOnce) return;
            // اگر از قبل تمام‌صفحه هستیم، کاری نکن
            if (isFullscreen()) { hasEnteredOnce = true; return; }
            // روی کلیک دکمه‌های خاص (مانند باز کردن فایل) نادیده بگیر
            if (e && e.target && e.target.tagName === 'INPUT' && e.target.type === 'file') return;

            console.log('[fullscreen] اولین تعامل کاربر — وارد حالت تمام‌صفحه');
            requestFs();
            // حذف گوش‌دهنده‌ها بعد از اولین فعال‌سازی
            cleanup();
        };

        function cleanup() {
            document.removeEventListener('click', gestureHandler);
            document.removeEventListener('touchend', gestureHandler);
            document.removeEventListener('keydown', gestureHandler);
        }

        // اولویت با touchend در موبایل، click در دسکتاپ
        document.addEventListener('touchend', gestureHandler, { once: false, passive: true });
        document.addEventListener('click', gestureHandler, { once: false });
        document.addEventListener('keydown', gestureHandler, { once: false });

        // بعد از ۳۰ ثانیه اگر کاربر تعامل نکرد، دیگر تلاش نکن
        setTimeout(function () {
            if (!hasEnteredOnce) cleanup();
        }, 30000);
    }

    function init() {
        injectStyles();
        injectButton();
        listenFsChange();
        attachGestureListener();
        console.log('[fullscreen] ✅ ماژول ورود خودکار به تمام‌صفحه فعال شد');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 600); });
    } else {
        setTimeout(init, 600);
    }
})();
