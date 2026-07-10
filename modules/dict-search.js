/* ================================================================
   dict-search.js — سیستم جستجوی پیشرفته (نسخه حرفه‌ای)
   ----------------------------------------------------------------
   • تمام استایل‌ها inline (CSS-in-JS) — بدون وابستگی به فایل CSS خارجی
   • جستجوی فازی (fuzzy) + فیلتر + مرتب‌سازی + دسته‌بندی
   • نمایش نتایج با کارت‌های زیبا و انیمیشن
   • نوار جستجوی شیک با آیکون‌ها و دکمه پاک کردن
   • فیلترهای پیشرفته: نوع، جنسیت، سطح SRS، علاقه‌مندی
   • مرتب‌سازی: الفبایی، تاریخ، دقت، SRS
   • شمارش نتایج و هایلایت کلمه جستجو شده
   • حالت خالی و حالت "نتیجه یافت نشد" جذاب
   ================================================================ */

(function () {
    'use strict';

    if (typeof GermanDictionary === 'undefined') return;

    /* ============================================================
       ۱) تزریق استایل‌ها (یک بار)
       ============================================================ */
    function _injectStyles() {
        if (document.getElementById('dict-search-pro-styles')) return;
        const style = document.createElement('style');
        style.id = 'dict-search-pro-styles';
        style.textContent = `
            /* ===== متغیرها ===== */
            .sp-wrap {
                --sp-primary: #4361ee;
                --sp-primary-d: #3a56d4;
                --sp-primary-l: #eef2ff;
                --sp-emerald: #10b981;
                --sp-emerald-d: #059669;
                --sp-violet: #8b5cf6;
                --sp-violet-d: #6d28d9;
                --sp-amber: #f59e0b;
                --sp-amber-d: #d97706;
                --sp-rose: #f43f5e;
                --sp-rose-d: #e11d48;
                --sp-cyan: #06b6d4;
                --sp-cyan-d: #0891b2;
                --sp-slate: #64748b;

                --sp-ink: #0f172a;
                --sp-ink-2: #1e293b;
                --sp-slate-600: #475569;
                --sp-muted: #64748b;
                --sp-line: #e2e8f0;
                --sp-line-2: #f1f5f9;
                --sp-card: #ffffff;
                --sp-card-2: #f8fafc;

                --sp-shadow-sm: 0 1px 2px rgba(15,23,42,.04);
                --sp-shadow: 0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06);
                --sp-shadow-lg: 0 12px 40px rgba(15,23,42,.10);

                --sp-radius: 20px;
                --sp-radius-s: 14px;
                --sp-radius-xs: 10px;

                font-family: 'Vazirmatn', Tahoma, sans-serif;
                color: var(--sp-ink);
                line-height: 1.6;
            }
            body.dark-mode .sp-wrap {
                --sp-ink: #f1f5f9;
                --sp-ink-2: #e2e8f0;
                --sp-slate-600: #cbd5e1;
                --sp-muted: #94a3b8;
                --sp-line: #1e293b;
                --sp-line-2: #1e293b;
                --sp-card: #1e293b;
                --sp-card-2: #0f172a;
                --sp-shadow-sm: 0 1px 2px rgba(0,0,0,.3);
                --sp-shadow: 0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.25);
                --sp-shadow-lg: 0 12px 40px rgba(0,0,0,.4);
            }

            /* ===== فونت آیکون‌ها را حفظ کن ===== */
            .sp-wrap i,
            .sp-wrap i::before,
            .sp-wrap [class^="fa-"]::before,
            .sp-wrap [class*=" fa-"]::before {
                font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
            }
            .sp-wrap i.fas, .sp-wrap i.fa-solid { font-weight: 900 !important; }
            .sp-wrap i.far, .sp-wrap i.fa-regular { font-weight: 400 !important; }

            /* ===== هدر بخش جستجو ===== */
            .sp-header {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #134e4a 100%);
                border-radius: var(--sp-radius);
                padding: 28px 26px;
                margin-bottom: 18px;
                color: #f8fafc;
                position: relative;
                overflow: hidden;
                box-shadow: var(--sp-shadow-lg);
            }
            .sp-header::before, .sp-header::after {
                content: "";
                position: absolute;
                border-radius: 50%;
                filter: blur(60px);
                opacity: .5;
                pointer-events: none;
            }
            .sp-header::before {
                width: 280px; height: 280px;
                background: radial-gradient(circle, #10b981, transparent 70%);
                top: -100px; right: -70px;
                animation: sp-float 9s ease-in-out infinite;
            }
            .sp-header::after {
                width: 240px; height: 240px;
                background: radial-gradient(circle, #8b5cf6, transparent 70%);
                bottom: -100px; left: -50px;
                animation: sp-float 11s ease-in-out infinite reverse;
            }
            @keyframes sp-float {
                0%,100% { transform: translate(0,0) scale(1); }
                50%     { transform: translate(20px,-20px) scale(1.08); }
            }
            .sp-header h2 {
                position: relative; z-index: 1;
                margin: 0 0 6px;
                font-size: 22px; font-weight: 800;
                display: flex; align-items: center; gap: 10px;
            }
            .sp-header h2 .sp-h-ic {
                width: 36px; height: 36px;
                display: flex; align-items: center; justify-content: center;
                border-radius: 10px;
                background: rgba(255,255,255,.12);
                backdrop-filter: blur(8px);
                font-size: 16px;
            }
            .sp-header .sp-sub {
                position: relative; z-index: 1;
                margin: 0;
                font-size: 13px;
                opacity: .75;
            }

            /* ===== نوار جستجو ===== */
            .sp-search-box {
                position: relative; z-index: 1;
                margin-top: 18px;
                display: flex;
                gap: 10px;
                align-items: center;
                background: rgba(255,255,255,.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,.18);
                border-radius: 16px;
                padding: 6px 6px 6px 18px;
                transition: all .25s ease;
            }
            .sp-search-box:focus-within {
                background: rgba(255,255,255,.15);
                border-color: rgba(16,185,129,.5);
                box-shadow: 0 0 0 4px rgba(16,185,129,.15);
            }
            .sp-search-box .sp-search-ic {
                color: rgba(255,255,255,.6);
                font-size: 18px;
                flex-shrink: 0;
            }
            .sp-search-box input.sp-input {
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                color: #fff;
                font-family: inherit;
                font-size: 16px;
                font-weight: 500;
                padding: 12px 0;
                direction: ltr;
                text-align: right;
            }
            .sp-search-box input.sp-input::placeholder {
                color: rgba(255,255,255,.5);
                text-align: right;
                direction: rtl;
            }
            .sp-search-box .sp-clear-btn {
                width: 32px; height: 32px;
                display: none;
                align-items: center; justify-content: center;
                border: none;
                background: rgba(255,255,255,.1);
                color: rgba(255,255,255,.7);
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
                transition: all .15s ease;
            }
            .sp-search-box .sp-clear-btn:hover {
                background: rgba(244,63,94,.3);
                color: #fff;
            }
            .sp-search-box .sp-clear-btn.visible { display: flex; }
            .sp-search-box .sp-search-btn {
                padding: 12px 22px;
                border: none;
                background: linear-gradient(135deg, #10b981, #059669);
                color: #fff;
                border-radius: 12px;
                font-family: inherit;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                transition: all .2s ease;
                box-shadow: 0 4px 12px rgba(16,185,129,.3);
                display: flex; align-items: center; gap: 7px;
            }
            .sp-search-box .sp-search-btn:hover {
                transform: translateY(-1px);
                filter: brightness(1.05);
                box-shadow: 0 6px 16px rgba(16,185,129,.4);
            }
            .sp-search-box .sp-search-btn:active { transform: translateY(0); }

            /* ===== نوار ابزار فیلتر/مرتب‌سازی ===== */
            .sp-toolbar {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                align-items: center;
                margin-bottom: 16px;
            }
            .sp-tool-btn {
                padding: 8px 14px;
                border: 1px solid var(--sp-line);
                background: var(--sp-card);
                color: var(--sp-slate-600);
                border-radius: 999px;
                font-family: inherit;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all .2s ease;
                display: inline-flex; align-items: center; gap: 6px;
                box-shadow: var(--sp-shadow-sm);
            }
            .sp-tool-btn:hover {
                border-color: var(--sp-primary);
                color: var(--sp-primary);
                transform: translateY(-1px);
            }
            .sp-tool-btn.active {
                background: linear-gradient(135deg, var(--sp-primary), var(--sp-primary-d));
                color: #fff;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(67,97,238,.25);
            }
            .sp-tool-btn .sp-count {
                background: rgba(255,255,255,.2);
                padding: 1px 7px;
                border-radius: 999px;
                font-size: 10px;
            }
            .sp-tool-btn:not(.active) .sp-count {
                background: var(--sp-line-2);
                color: var(--sp-muted);
            }
            .sp-toolbar .sp-sort-select {
                margin-inline-start: auto;
                padding: 8px 14px;
                border: 1px solid var(--sp-line);
                background: var(--sp-card);
                color: var(--sp-ink);
                border-radius: 999px;
                font-family: inherit;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                outline: none;
            }
            .sp-toolbar .sp-sort-select:focus { border-color: var(--sp-primary); }

            /* ===== پنل فیلتر پیشرفته ===== */
            .sp-filter-panel {
                display: none;
                background: var(--sp-card);
                border: 1px solid var(--sp-line);
                border-radius: var(--sp-radius-s);
                padding: 18px;
                margin-bottom: 16px;
                box-shadow: var(--sp-shadow);
                animation: sp-slide-down .3s ease;
            }
            .sp-filter-panel.open { display: block; }
            @keyframes sp-slide-down {
                from { opacity: 0; transform: translateY(-8px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .sp-filter-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }
            .sp-filter-group h4 {
                margin: 0 0 10px;
                font-size: 12px;
                font-weight: 700;
                color: var(--sp-muted);
                text-transform: uppercase;
                letter-spacing: .5px;
            }
            .sp-filter-chips {
                display: flex; flex-wrap: wrap; gap: 6px;
            }
            .sp-chip {
                padding: 6px 12px;
                border: 1px solid var(--sp-line);
                background: var(--sp-card-2);
                color: var(--sp-slate-600);
                border-radius: 999px;
                font-family: inherit;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: all .15s ease;
            }
            .sp-chip:hover { border-color: var(--sp-primary); }
            .sp-chip.active {
                background: var(--sp-primary);
                color: #fff;
                border-color: transparent;
            }
            .sp-chip.active.masc { background: #3b82f6; }
            .sp-chip.active.fem  { background: #ec4899; }
            .sp-chip.active.neut { background: #10b981; }
            .sp-chip.active.noun { background: #8b5cf6; }
            .sp-chip.active.verb { background: #f59e0b; }
            .sp-chip.active.adj  { background: #06b6d4; }
            .sp-chip.active.adv  { background: #84cc16; }
            .sp-chip.active.prep { background: #f97316; }

            /* ===== خلاصه نتایج ===== */
            .sp-results-summary {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                flex-wrap: wrap;
                margin-bottom: 14px;
                padding: 12px 16px;
                background: var(--sp-card);
                border: 1px solid var(--sp-line);
                border-radius: var(--sp-radius-s);
                box-shadow: var(--sp-shadow-sm);
            }
            .sp-results-summary .sp-count-text {
                font-size: 13px;
                color: var(--sp-slate-600);
                font-weight: 600;
            }
            .sp-results-summary .sp-count-text b {
                color: var(--sp-primary);
                font-size: 16px;
            }
            .sp-results-summary .sp-query-text {
                font-size: 12px;
                color: var(--sp-muted);
            }
            .sp-results-summary .sp-query-text code {
                background: var(--sp-primary-l);
                color: var(--sp-primary-d);
                padding: 2px 8px;
                border-radius: 6px;
                font-family: 'Segoe UI', monospace;
                font-weight: 700;
            }

            /* ===== لیست نتایج ===== */
            .sp-results {
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-height: 70vh;
                overflow-y: auto;
                padding-inline-start: 4px;
            }
            .sp-results::-webkit-scrollbar { width: 8px; }
            .sp-results::-webkit-scrollbar-thumb { background: var(--sp-line); border-radius: 8px; }
            .sp-results::-webkit-scrollbar-thumb:hover { background: var(--sp-muted); }

            .sp-item {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 14px 16px;
                background: var(--sp-card);
                border: 1px solid var(--sp-line);
                border-radius: var(--sp-radius-s);
                transition: all .2s ease;
                cursor: pointer;
                animation: sp-item-in .4s ease both;
            }
            @keyframes sp-item-in {
                from { opacity: 0; transform: translateY(8px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .sp-item:hover {
                border-color: var(--sp-primary);
                box-shadow: var(--sp-shadow);
                transform: translateX(-3px);
            }
            .sp-item .sp-num {
                width: 32px; height: 32px;
                display: flex; align-items: center; justify-content: center;
                background: var(--sp-line-2);
                color: var(--sp-muted);
                border-radius: 8px;
                font-size: 12px;
                font-weight: 700;
                flex-shrink: 0;
            }
            .sp-item .sp-fav {
                width: 34px; height: 34px;
                display: flex; align-items: center; justify-content: center;
                border: none;
                background: transparent;
                color: var(--sp-line);
                cursor: pointer;
                font-size: 16px;
                flex-shrink: 0;
                transition: all .15s ease;
            }
            .sp-item .sp-fav:hover { color: var(--sp-amber); transform: scale(1.15); }
            .sp-item .sp-fav.active { color: var(--sp-amber); }
            .sp-item .sp-body { flex: 1; min-width: 0; }
            .sp-item .sp-top {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 3px;
            }
            .sp-item .sp-word {
                font-size: 17px;
                font-weight: 800;
                color: var(--sp-ink);
                direction: ltr;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            .sp-item .sp-word mark {
                background: rgba(245,158,11,.25);
                color: inherit;
                padding: 0 2px;
                border-radius: 3px;
            }
            .sp-item .sp-badge {
                padding: 2px 9px;
                border-radius: 999px;
                font-size: 10px;
                font-weight: 700;
                color: #fff;
            }
            .sp-item .sp-badge.masc { background: #3b82f6; }
            .sp-item .sp-badge.fem  { background: #ec4899; }
            .sp-item .sp-badge.neut { background: #10b981; }
            .sp-item .sp-badge.noun { background: #8b5cf6; }
            .sp-item .sp-badge.verb { background: #f59e0b; }
            .sp-item .sp-badge.adj  { background: #06b6d4; }
            .sp-item .sp-badge.adv  { background: #84cc16; }
            .sp-item .sp-badge.prep { background: #f97316; }
            .sp-item .sp-badge.srs  { background: var(--sp-slate); }
            .sp-item .sp-meaning {
                font-size: 13px;
                color: var(--sp-muted);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .sp-item .sp-meaning mark {
                background: rgba(245,158,11,.25);
                color: inherit;
                padding: 0 2px;
                border-radius: 3px;
            }
            .sp-item .sp-actions {
                display: flex;
                gap: 6px;
                flex-shrink: 0;
            }
            .sp-item .sp-act {
                width: 34px; height: 34px;
                display: flex; align-items: center; justify-content: center;
                border: 1px solid var(--sp-line);
                background: var(--sp-card);
                color: var(--sp-slate-600);
                border-radius: 9px;
                cursor: pointer;
                font-size: 13px;
                transition: all .15s ease;
            }
            .sp-item .sp-act.view:hover  { background: var(--sp-primary); color: #fff; border-color: var(--sp-primary); }
            .sp-item .sp-act.speak:hover { background: var(--sp-cyan); color: #fff; border-color: var(--sp-cyan); }
            .sp-item .sp-act.prac:hover  { background: var(--sp-emerald); color: #fff; border-color: var(--sp-emerald); }

            /* ===== صفحه‌بندی ===== */
            .sp-pagination {
                display: flex;
                justify-content: center;
                gap: 6px;
                margin-top: 16px;
                flex-wrap: wrap;
            }
            .sp-page-btn {
                min-width: 36px; height: 36px;
                padding: 0 10px;
                border: 1px solid var(--sp-line);
                background: var(--sp-card);
                color: var(--sp-slate-600);
                border-radius: 9px;
                font-family: inherit;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                transition: all .15s ease;
            }
            .sp-page-btn:hover { border-color: var(--sp-primary); color: var(--sp-primary); }
            .sp-page-btn.active {
                background: var(--sp-primary);
                color: #fff;
                border-color: transparent;
            }
            .sp-page-btn:disabled { opacity: .4; cursor: not-allowed; }

            /* ===== حالت خالی / بدون نتیجه ===== */
            .sp-empty {
                text-align: center;
                padding: 50px 24px;
                background: var(--sp-card);
                border: 1px dashed var(--sp-line);
                border-radius: var(--sp-radius);
            }
            .sp-empty .sp-empty-ic {
                width: 80px; height: 80px;
                margin: 0 auto 16px;
                display: flex; align-items: center; justify-content: center;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--sp-primary-l), var(--sp-card-2));
                color: var(--sp-primary);
                font-size: 32px;
            }
            .sp-empty h3 {
                margin: 0 0 8px;
                font-size: 18px;
                font-weight: 800;
                color: var(--sp-ink);
            }
            .sp-empty p {
                margin: 0 0 16px;
                font-size: 13px;
                color: var(--sp-muted);
            }
            .sp-empty .sp-suggest {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 18px;
                background: var(--sp-card-2);
                border: 1px solid var(--sp-line);
                border-radius: 999px;
                font-size: 12px;
                color: var(--sp-slate-600);
            }
            .sp-empty .sp-suggest i { color: var(--sp-amber); }

            /* ===== اسکلتون لودینگ ===== */
            .sp-skeleton {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .sp-skel-item {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 14px 16px;
                background: var(--sp-card);
                border: 1px solid var(--sp-line);
                border-radius: var(--sp-radius-s);
            }
            .sp-skel-bar {
                height: 14px;
                background: linear-gradient(90deg, var(--sp-line-2) 25%, var(--sp-line) 50%, var(--sp-line-2) 75%);
                background-size: 200% 100%;
                animation: sp-shimmer 1.5s infinite;
                border-radius: 6px;
            }
            @keyframes sp-shimmer {
                0%   { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            .sp-skel-circle {
                width: 32px; height: 32px;
                border-radius: 50%;
                background: var(--sp-line-2);
                animation: sp-shimmer 1.5s infinite;
                flex-shrink: 0;
            }
            .sp-skel-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }

            /* ===== ریسپانسیو ===== */
            @media (max-width: 640px) {
                .sp-header { padding: 14px 12px; border-radius: 14px; margin-bottom: 10px; }
                .sp-header::before { width: 140px; height: 140px; top: -60px; right: -40px; }
                .sp-header::after { width: 120px; height: 120px; bottom: -60px; left: -30px; }
                .sp-header h2 { font-size: 14px; gap: 6px; }
                .sp-header h2 .sp-h-ic { width: 26px; height: 26px; font-size: 12px; border-radius: 7px; }
                .sp-header .sp-sub { font-size: 10px; line-height: 1.4; }
                .sp-search-box {
                    width: 100%;
                    margin-top: 10px;
                    padding: 3px 3px 3px 10px;
                    gap: 4px;
                    border-radius: 10px;
                    flex-wrap: nowrap;
                    align-items: center;
                }
                .sp-search-box .sp-search-ic { font-size: 13px; }
                .sp-search-box input.sp-input {
                    font-size: 13px;
                    padding: 7px 0;
                    min-width: 0;
                    font-weight: 500;
                }
                .sp-search-box input.sp-input::placeholder { font-size: 12px; }
                .sp-search-box .sp-clear-btn { width: 24px; height: 24px; font-size: 10px; border-radius: 6px; }
                /* ✔️ دکمه جستجو: فقط آیکن، مربع کوچک */
                .sp-search-box .sp-search-btn {
                    width: 34px;
                    height: 34px;
                    min-width: 34px;
                    padding: 0 !important;
                    font-size: 0;
                    flex-shrink: 0;
                    border-radius: 8px;
                    gap: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(16,185,129,.25);
                }
                .sp-search-box .sp-search-btn i { font-size: 13px; }
                .sp-search-box .sp-search-btn span { display: none; }
                .sp-item { padding: 12px; gap: 10px; }
                .sp-item .sp-num { display: none; }
                .sp-item .sp-word { font-size: 15px; }
                .sp-item .sp-actions .sp-act span { display: none; }
            }
            /* ===== گوشی‌های خیلی کوچک (≤ ۳۸۰px) ===== */
            @media (max-width: 380px) {
                .sp-header { padding: 12px 10px; }
                .sp-header h2 { font-size: 13px; }
                .sp-search-box { padding: 2px 2px 2px 8px; gap: 3px; }
                .sp-search-box input.sp-input { font-size: 12px; padding: 6px 0; }
                .sp-search-box input.sp-input::placeholder { font-size: 11px; }
                .sp-search-box .sp-search-btn { width: 32px; height: 32px; min-width: 32px; }
                .sp-search-box .sp-search-btn i { font-size: 12px; }
            }
        `;
        document.head.appendChild(style);
    }

    /* ============================================================
       ۲) متد اصلی: renderSearchSection (بازنویسی کامل)
       ============================================================ */
    GermanDictionary.prototype.renderSearchSection = function() {
        _injectStyles();
        const section = document.getElementById('search-section');
        if (!section) return;

        section.innerHTML = `
            <div class="sp-wrap">
                <!-- هدر -->
                <div class="sp-header">
                    <h2>
                        <span class="sp-h-ic"><i class="fas fa-search"></i></span>
                        جستجوی پیشرفته لغات
                    </h2>
                    <p class="sp-sub">جستجو در آلمانی و فارسی، با فیلتر و مرتب‌سازی هوشمند</p>

                    <!-- نوار جستجو -->
                    <div class="sp-search-box">
                        <i class="fas fa-search sp-search-ic"></i>
                        <input type="text" id="sp-search-input" class="sp-input"
                               placeholder="لغت آلمانی یا فارسی را تایپ کنید..."
                               autocomplete="off" autofocus>
                        <button class="sp-clear-btn" id="sp-clear-btn" title="پاک کردن">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="sp-search-btn" id="sp-search-btn">
                            <i class="fas fa-bolt"></i>
                            <span>جستجو</span>
                        </button>
                    </div>
                </div>

                <!-- نوار ابزار -->
                <div class="sp-toolbar">
                    <button class="sp-tool-btn" id="sp-filter-toggle">
                        <i class="fas fa-sliders"></i> فیلترها
                    </button>
                    <button class="sp-tool-btn active" data-sp-filter="all">
                        <i class="fas fa-list"></i> همه <span class="sp-count" id="sp-count-all">۰</span>
                    </button>
                    <button class="sp-tool-btn" data-sp-filter="favorites">
                        <i class="fas fa-star"></i> علاقه‌مندی <span class="sp-count" id="sp-count-fav">۰</span>
                    </button>
                    <select class="sp-sort-select" id="sp-sort">
                        <option value="relevance">مرتب‌سازی: مرتبط‌ترین</option>
                        <option value="alpha-de">الفبایی (آلمانی)</option>
                        <option value="alpha-fa">الفبایی (فارسی)</option>
                        <option value="date-desc">جدیدترین</option>
                        <option value="date-asc">قدیمی‌ترین</option>
                        <option value="srs-desc">سطح SRS (بیشترین)</option>
                    </select>
                </div>

                <!-- پنل فیلتر پیشرفته -->
                <div class="sp-filter-panel" id="sp-filter-panel">
                    <div class="sp-filter-grid">
                        <div class="sp-filter-group">
                            <h4>نوع کلمه</h4>
                            <div class="sp-filter-chips" id="sp-type-chips">
                                <button class="sp-chip" data-sp-type="noun">اسم</button>
                                <button class="sp-chip" data-sp-type="verb">فعل</button>
                                <button class="sp-chip" data-sp-type="adjective">صفت</button>
                                <button class="sp-chip" data-sp-type="adverb">قید</button>
                                <button class="sp-chip" data-sp-type="preposition">حرف اضافه</button>
                            </div>
                        </div>
                        <div class="sp-filter-group">
                            <h4>جنسیت</h4>
                            <div class="sp-filter-chips" id="sp-gender-chips">
                                <button class="sp-chip" data-sp-gender="masculine">der (مذکر)</button>
                                <button class="sp-chip" data-sp-gender="feminine">die (مونث)</button>
                                <button class="sp-chip" data-sp-gender="neuter">das (خنثی)</button>
                            </div>
                        </div>
                        <div class="sp-filter-group">
                            <h4>سطح یادگیری (SRS)</h4>
                            <div class="sp-filter-chips" id="sp-srs-chips">
                                <button class="sp-chip" data-sp-srs="0">سطح ۰</button>
                                <button class="sp-chip" data-sp-srs="1">سطح ۱</button>
                                <button class="sp-chip" data-sp-srs="2">سطح ۲</button>
                                <button class="sp-chip" data-sp-srs="3">سطح ۳</button>
                                <button class="sp-chip" data-sp-srs="4">سطح ۴</button>
                                <button class="sp-chip" data-sp-srs="5">سطح ۵</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- خلاصه نتایج -->
                <div class="sp-results-summary" id="sp-summary" style="display:none;">
                    <div class="sp-count-text">
                        <b id="sp-result-count">۰</b> نتیجه یافت شد
                    </div>
                    <div class="sp-query-text" id="sp-query-text"></div>
                </div>

                <!-- نگهدار نتایج -->
                <div id="search-results-container">
                    <!-- حالت اولیه -->
                    <div class="sp-empty" id="sp-initial-state">
                        <div class="sp-empty-ic"><i class="fas fa-book-open"></i></div>
                        <h3>به دیکشنری خوش آمدید!</h3>
                        <p>برای شروع، لغت مورد نظر را در کادر بالا جستجو کنید</p>
                        <div class="sp-suggest">
                            <i class="fas fa-lightbulb"></i>
                            <span>می‌توانید به‌صورت زنده جستجو کنید — همان‌طور که تایپ می‌کنید نتایج نمایش داده می‌شوند</span>
                        </div>
                    </div>
                </div>

                <!-- صفحه‌بندی -->
                <div class="sp-pagination" id="sp-pagination" style="display:none;"></div>
            </div>
        `;

        // ذخیره وضعیت فیلترها
        this._spState = {
            query: '',
            filter: 'all',
            types: new Set(),
            genders: new Set(),
            srsLevels: new Set(),
            sort: 'relevance',
            page: 1,
            perPage: 20,
            allWords: [],
            filtered: [],
        };

        // راه‌اندازی رویدادها
        this._spSetupEvents();

        // بارگذاری اولیه همه لغات (برای شمارش)
        this._spLoadAllWords();
    };

    /* ============================================================
       ۳) بارگذاری همه لغات (برای شمارش و فیلتر سریع)
       ============================================================ */
    GermanDictionary.prototype._spLoadAllWords = async function() {
        try {
            this._spState.allWords = await this.getAllWords();
            this._spUpdateCounts();
        } catch (e) {
            console.error('خطا در بارگذاری لغات:', e);
        }
    };

    /* ============================================================
       ۴) به‌روزرسانی شمارش‌ها
       ============================================================ */
    GermanDictionary.prototype._spUpdateCounts = function() {
        const all = this._spState.allWords.length;
        const fav = this._spState.allWords.filter(w => this.favorites.has(w.id)).length;
        const elAll = document.getElementById('sp-count-all');
        const elFav = document.getElementById('sp-count-fav');
        if (elAll) elAll.textContent = this._spFaNum(all);
        if (elFav) elFav.textContent = this._spFaNum(fav);
    };

    /* ============================================================
       ۵) راه‌اندازی رویدادها
       ============================================================ */
    GermanDictionary.prototype._spSetupEvents = function() {
        const input = document.getElementById('sp-search-input');
        const clearBtn = document.getElementById('sp-clear-btn');
        const searchBtn = document.getElementById('sp-search-btn');
        const filterToggle = document.getElementById('sp-filter-toggle');
        const filterPanel = document.getElementById('sp-filter-panel');
        const sortSelect = document.getElementById('sp-sort');

        if (!input) return;

        // جستجوی زنده (debounce)
        let debounceTimer;
        const onInput = (e) => {
            const val = e.target.value;
            if (clearBtn) clearBtn.classList.toggle('visible', val.length > 0);
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this._spState.query = val.trim();
                this._spState.page = 1;
                this._spPerformSearch();
            }, 350);
        };
        input.addEventListener('input', onInput);

        // Enter
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(debounceTimer);
                this._spState.query = e.target.value.trim();
                this._spState.page = 1;
                this._spPerformSearch();
            }
        });

        // دکمه پاک کردن
        if (clearBtn) {
            clearBtn.onclick = () => {
                input.value = '';
                clearBtn.classList.remove('visible');
                this._spState.query = '';
                this._spState.page = 1;
                this._spShowInitial();
                input.focus();
            };
        }

        // دکمه جستجو
        if (searchBtn) {
            searchBtn.onclick = () => {
                this._spState.query = input.value.trim();
                this._spState.page = 1;
                this._spPerformSearch();
            };
        }

        // تاگل پنل فیلتر
        if (filterToggle && filterPanel) {
            filterToggle.onclick = () => {
                filterPanel.classList.toggle('open');
                filterToggle.classList.toggle('active');
            };
        }

        // دکمه‌های فیلتر سریع (همه/علاقه‌مندی)
        document.querySelectorAll('[data-sp-filter]').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('[data-sp-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._spState.filter = btn.dataset.spFilter;
                this._spState.page = 1;
                if (this._spState.query || this._spState.filter === 'favorites') {
                    this._spPerformSearch();
                }
            };
        });

        // چیپ‌های نوع کلمه
        document.querySelectorAll('[data-sp-type]').forEach(chip => {
            chip.onclick = () => {
                const t = chip.dataset.spType;
                if (this._spState.types.has(t)) {
                    this._spState.types.delete(t);
                    chip.classList.remove('active', t);
                } else {
                    this._spState.types.add(t);
                    chip.classList.add('active', this._spTypeClass(t));
                }
                this._spState.page = 1;
                this._spPerformSearch();
            };
        });

        // چیپ‌های جنسیت
        document.querySelectorAll('[data-sp-gender]').forEach(chip => {
            chip.onclick = () => {
                const g = chip.dataset.spGender;
                if (this._spState.genders.has(g)) {
                    this._spState.genders.delete(g);
                    chip.classList.remove('active', this._spGenderClass(g));
                } else {
                    this._spState.genders.add(g);
                    chip.classList.add('active', this._spGenderClass(g));
                }
                this._spState.page = 1;
                this._spPerformSearch();
            };
        });

        // چیپ‌های SRS
        document.querySelectorAll('[data-sp-srs]').forEach(chip => {
            chip.onclick = () => {
                const s = parseInt(chip.dataset.spSrs);
                if (this._spState.srsLevels.has(s)) {
                    this._spState.srsLevels.delete(s);
                    chip.classList.remove('active');
                } else {
                    this._spState.srsLevels.add(s);
                    chip.classList.add('active');
                }
                this._spState.page = 1;
                this._spPerformSearch();
            };
        });

        // مرتب‌سازی
        if (sortSelect) {
            sortSelect.onchange = () => {
                this._spState.sort = sortSelect.value;
                this._spPerformSearch();
            };
        }
    };

    /* ============================================================
       ۶) کمک‌کننده‌ها: کلاس‌های رنگی
       ============================================================ */
    GermanDictionary.prototype._spTypeClass = function(type) {
        return { noun:'noun', verb:'verb', adjective:'adj', adverb:'adv', preposition:'prep' }[type] || '';
    };
    GermanDictionary.prototype._spGenderClass = function(gender) {
        return { masculine:'masc', feminine:'fem', neuter:'neut' }[gender] || '';
    };

    /* ============================================================
       ۷) تبدیل عدد به فارسی
       ============================================================ */
    GermanDictionary.prototype._spFaNum = function(n) {
        try { return Number(n).toLocaleString('fa-IR'); }
        catch(e) { return String(n); }
    };

    /* ============================================================
       ۸) اجرای جستجو (اصلی)
       ============================================================ */
    GermanDictionary.prototype._spPerformSearch = async function() {
        const state = this._spState;
        const container = document.getElementById('search-results-container');
        const summary = document.getElementById('sp-summary');
        const pagination = document.getElementById('sp-pagination');
        if (!container) return;

        // اگر کوئری خالی و فیلتر علاقه‌مندی هم فعال نیست → حالت اولیه
        if (!state.query && state.filter !== 'favorites') {
            this._spShowInitial();
            if (summary) summary.style.display = 'none';
            if (pagination) pagination.style.display = 'none';
            return;
        }

        // نمایش اسکلتون لودینگ
        this._spShowSkeleton();

        try {
            // اطمینان از بارگذاری همه لغات
            if (state.allWords.length === 0) {
                await this._spLoadAllWords();
            }

            // جستجو + فیلتر
            let results = this._spSearchAndFilter(state.query, state.allWords);

            // مرتب‌سازی
            results = this._spSort(results, state.sort);

            state.filtered = results;

            // نمایش خلاصه
            if (summary) {
                summary.style.display = 'flex';
                document.getElementById('sp-result-count').textContent = this._spFaNum(results.length);
                const queryText = document.getElementById('sp-query-text');
                if (state.query) {
                    queryText.innerHTML = `برای <code>${this.escapeHtml(state.query)}</code>`;
                } else if (state.filter === 'favorites') {
                    queryText.innerHTML = `<i class="fas fa-star" style="color:var(--sp-amber)"></i> علاقه‌مندی‌ها`;
                } else {
                    queryText.innerHTML = '';
                }
            }

            // نمایش نتایج (با صفحه‌بندی)
            this._spRenderResults(results);

        } catch (err) {
            console.error('خطا در جستجو:', err);
            container.innerHTML = `
                <div class="sp-empty">
                    <div class="sp-empty-ic" style="color:var(--sp-rose)"><i class="fas fa-exclamation-triangle"></i></div>
                    <h3>خطا در جستجو</h3>
                    <p>${this.escapeHtml(err.message || 'خطای ناشناخته')}</p>
                </div>`;
        }
    };

    /* ============================================================
       ۹) جستجو و فیلتر (هسته منطقی)
       ============================================================ */
    GermanDictionary.prototype._spSearchAndFilter = function(query, words) {
        const state = this._spState;
        let results = [...words];

        // ۱) فیلتر علاقه‌مندی
        if (state.filter === 'favorites') {
            results = results.filter(w => this.favorites.has(w.id));
        }

        // ۲) جستجوی متنی (اگر کوئری وجود دارد)
        if (query && query.length > 0) {
            const term = query.toLowerCase().trim();
            results = results.filter(w => {
                const de = (w.german || '').toLowerCase();
                const fa = (w.persian || '').toLowerCase();
                // جستجو در ابتدای کلمه، شامل بودن، یا جستجوی فارسی
                return de.startsWith(term) || de.includes(term) || fa.includes(term);
            });
        }

        // ۳) فیلتر نوع
        if (state.types.size > 0) {
            results = results.filter(w => state.types.has(w.type));
        }

        // ۴) فیلتر جنسیت
        if (state.genders.size > 0) {
            results = results.filter(w => w.gender && state.genders.has(w.gender));
        }

        // ۵) فیلتر SRS
        if (state.srsLevels.size > 0) {
            results = results.filter(w => {
                const srs = this.srsData[w.id];
                const level = srs ? (srs.level || 0) : 0;
                return state.srsLevels.has(level);
            });
        }

        return results;
    };

    /* ============================================================
       ۱۰) مرتب‌سازی
       ============================================================ */
    GermanDictionary.prototype._spSort = function(results, sortBy) {
        const arr = [...results];
        switch (sortBy) {
            case 'alpha-de':
                arr.sort((a, b) => (a.german || '').localeCompare(b.german || '', 'de'));
                break;
            case 'alpha-fa':
                arr.sort((a, b) => (a.persian || '').localeCompare(b.persian || '', 'fa'));
                break;
            case 'date-desc':
                arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'date-asc':
                arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'srs-desc':
                arr.sort((a, b) => {
                    const la = this.srsData[a.id]?.level || 0;
                    const lb = this.srsData[b.id]?.level || 0;
                    return lb - la;
                });
                break;
            case 'relevance':
            default:
                // مرتبط‌ترین: ابتدا تطابق دقیق، سپس شروع‌با، سپس شامل‌بودن
                const term = (this._spState.query || '').toLowerCase().trim();
                if (term) {
                    arr.sort((a, b) => {
                        const da = (a.german || '').toLowerCase();
                        const db = (b.german || '').toLowerCase();
                        const fa = (a.persian || '').toLowerCase();
                        const fb = (b.persian || '').toLowerCase();
                        const scoreA = (da === term ? 0 : da.startsWith(term) ? 1 : da.includes(term) ? 2 : fa.includes(term) ? 3 : 4);
                        const scoreB = (db === term ? 0 : db.startsWith(term) ? 1 : db.includes(term) ? 2 : fb.includes(term) ? 3 : 4);
                        return scoreA - scoreB;
                    });
                }
                break;
        }
        return arr;
    };

    /* ============================================================
       ۱۱) نمایش اسکلتون لودینگ
       ============================================================ */
    GermanDictionary.prototype._spShowSkeleton = function() {
        const container = document.getElementById('search-results-container');
        if (!container) return;
        let html = '<div class="sp-skeleton">';
        for (let i = 0; i < 5; i++) {
            html += `<div class="sp-skel-item">
                <div class="sp-skel-circle"></div>
                <div class="sp-skel-lines">
                    <div class="sp-skel-bar" style="width:${50 + Math.random()*40}%;"></div>
                    <div class="sp-skel-bar" style="width:${30 + Math.random()*30}%; height:10px;"></div>
                </div>
            </div>`;
        }
        html += '</div>';
        container.innerHTML = html;
    };

    /* ============================================================
       ۱۲) نمایش حالت اولیه
       ============================================================ */
    GermanDictionary.prototype._spShowInitial = function() {
        const container = document.getElementById('search-results-container');
        if (!container) return;
        container.innerHTML = `
            <div class="sp-empty" id="sp-initial-state">
                <div class="sp-empty-ic"><i class="fas fa-book-open"></i></div>
                <h3>به دیکشنری خوش آمدید!</h3>
                <p>برای شروع، لغت مورد نظر را در کادر بالا جستجو کنید</p>
                <div class="sp-suggest">
                    <i class="fas fa-lightbulb"></i>
                    <span>می‌توانید به‌صورت زنده جستجو کنید — همان‌طور که تایپ می‌کنید نتایج نمایش داده می‌شوند</span>
                </div>
            </div>`;
    };

    /* ============================================================
       ۱۳) رندر نتایج (با صفحه‌بندی)
       ============================================================ */
    GermanDictionary.prototype._spRenderResults = function(results) {
        const container = document.getElementById('search-results-container');
        const pagination = document.getElementById('sp-pagination');
        if (!container) return;

        // حالت بدون نتیجه
        if (results.length === 0) {
            container.innerHTML = `
                <div class="sp-empty">
                    <div class="sp-empty-ic"><i class="fas fa-search"></i></div>
                    <h3>نتیجه‌ای یافت نشد</h3>
                    <p>برای جستجوی شما هیچ لغتی پیدا نشد</p>
                    <div class="sp-suggest">
                        <i class="fas fa-lightbulb"></i>
                        <span>املای کلمه را بررسی کنید یا از فیلترها استفاده کنید</span>
                    </div>
                </div>`;
            if (pagination) pagination.style.display = 'none';
            return;
        }

        const state = this._spState;
        const totalPages = Math.ceil(results.length / state.perPage);
        if (state.page > totalPages) state.page = 1;
        const start = (state.page - 1) * state.perPage;
        const pageResults = results.slice(start, start + state.perPage);

        container.innerHTML = `<div class="sp-results">${pageResults.map((word, i) => this._spRenderItem(word, start + i)).join('')}</div>`;

        // اتصال رویدادها
        this._spSetupItemEvents();

        // صفحه‌بندی
        if (totalPages > 1) {
            if (pagination) {
                pagination.style.display = 'flex';
                let html = '';
                html += `<button class="sp-page-btn" ${state.page === 1 ? 'disabled' : ''} data-sp-page="${state.page - 1}"><i class="fas fa-chevron-right"></i></button>`;
                const maxPages = Math.min(totalPages, 7);
                let startPage = Math.max(1, state.page - 3);
                let endPage = Math.min(totalPages, startPage + maxPages - 1);
                if (endPage - startPage < maxPages - 1) startPage = Math.max(1, endPage - maxPages + 1);
                for (let p = startPage; p <= endPage; p++) {
                    html += `<button class="sp-page-btn ${p === state.page ? 'active' : ''}" data-sp-page="${p}">${this._spFaNum(p)}</button>`;
                }
                html += `<button class="sp-page-btn" ${state.page === totalPages ? 'disabled' : ''} data-sp-page="${state.page + 1}"><i class="fas fa-chevron-left"></i></button>`;
                pagination.innerHTML = html;
                pagination.querySelectorAll('[data-sp-page]').forEach(btn => {
                    btn.onclick = () => {
                        const p = parseInt(btn.dataset.spPage);
                        if (!isNaN(p) && p >= 1 && p <= totalPages) {
                            state.page = p;
                            this._spRenderResults(state.filtered);
                            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    };
                });
            }
        } else {
            if (pagination) pagination.style.display = 'none';
        }
    };

    /* ============================================================
       ۱۴) رندر یک آیتم نتیجه
       ============================================================ */
    GermanDictionary.prototype._spRenderItem = function(word, index) {
        const query = this._spState.query;
        const deHighlighted = query ? this._spHighlight(word.german, query) : this.escapeHtml(word.german);
        const faHighlighted = query ? this._spHighlight(word.persian, query) : this.escapeHtml(word.persian);
        const typeClass = this._spTypeClass(word.type);
        const genderClass = this._spGenderClass(word.gender);
        const srsLevel = this.srsData[word.id]?.level || 0;

        return `
            <div class="sp-item" data-id="${word.id}" style="animation-delay:${Math.min(index * 0.03, 0.5)}s;">
                <div class="sp-num">${this._spFaNum(index + 1)}</div>
                <button class="sp-fav ${this.favorites.has(word.id) ? 'active' : ''}" data-id="${word.id}" title="علاقه‌مندی">
                    <i class="fas fa-star"></i>
                </button>
                <div class="sp-body">
                    <div class="sp-top">
                        <span class="sp-word">${deHighlighted}</span>
                        ${word.gender ? `<span class="sp-badge ${genderClass}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                        ${word.type ? `<span class="sp-badge ${typeClass}">${this.getTypeLabel(word.type)}</span>` : ''}
                        ${srsLevel > 0 ? `<span class="sp-badge srs">SRS ${this._spFaNum(srsLevel)}</span>` : ''}
                    </div>
                    <div class="sp-meaning">${faHighlighted}</div>
                </div>
                <div class="sp-actions">
                    <button class="sp-act view" data-id="${word.id}" title="مشاهده"><i class="fas fa-eye"></i></button>
                    <button class="sp-act speak" data-word="${this.escapeHtml(word.german)}" title="تلفظ"><i class="fas fa-volume-up"></i></button>
                    <button class="sp-act prac" data-id="${word.id}" title="تمرین"><i class="fas fa-brain"></i></button>
                </div>
            </div>`;
    };

    /* ============================================================
       ۱۵) هایلایت کلمه جستجو شده
       ============================================================ */
    GermanDictionary.prototype._spHighlight = function(text, query) {
        if (!text || !query) return this.escapeHtml(text);
        const escaped = this.escapeHtml(text);
        const term = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${term})`, 'gi');
        return escaped.replace(regex, '<mark>$1</mark>');
    };

    /* ============================================================
       ۱۶) رویدادهای آیتم‌های نتیجه (Event Delegation)
       ============================================================
       نکته: از event delegation استفاده می‌کنیم — یک listener روی
       container که همه کلیک‌ها را مدیریت می‌کند. این روش:
       • برای عناصر جدید (بعد از صفحه‌بندی) هم کار می‌کند
       • از تکرار listener جلوگیری می‌کند
       • مطمئن‌تر از forEach با onclick مستقیم است
       ============================================================ */
    GermanDictionary.prototype._spSetupItemEvents = function() {
        const container = document.getElementById('search-results-container');
        if (!container) return;

        // پاک کردن handler قبلی (برای جلوگیری از تکرار)
        if (this._spClickHandler) {
            container.removeEventListener('click', this._spClickHandler);
        }

        this._spClickHandler = (e) => {
            // پیدا کردن آیتم کلیک‌شده
            const item = e.target.closest('.sp-item');
            if (!item) return;

            const wordId = parseInt(item.dataset.id);
            if (isNaN(wordId)) return;

            // ۱) دکمه مشاهده (eye icon)
            const viewBtn = e.target.closest('.sp-act.view');
            if (viewBtn) {
                e.preventDefault();
                e.stopPropagation();
                this._spViewWord(wordId);
                return;
            }

            // ۲) بدنه آیتم (کلیک روی کلمه یا معنی)
            const body = e.target.closest('.sp-body');
            if (body) {
                e.preventDefault();
                e.stopPropagation();
                this._spViewWord(wordId);
                return;
            }

            // ۳) دکمه تلفظ
            const speakBtn = e.target.closest('.sp-act.speak');
            if (speakBtn) {
                e.preventDefault();
                e.stopPropagation();
                const word = speakBtn.dataset.word;
                if (word) this.speakText(word, 'de-DE');
                return;
            }

            // ۴) دکمه تمرین
            const pracBtn = e.target.closest('.sp-act.prac');
            if (pracBtn) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof this.startPracticeSession === 'function') {
                    this.startPracticeSession([wordId]);
                } else {
                    this.showToast('تابع تمرین در دسترس نیست', 'warning');
                }
                return;
            }

            // ۵) دکمه علاقه‌مندی
            const favBtn = e.target.closest('.sp-fav');
            if (favBtn) {
                e.preventDefault();
                e.stopPropagation();
                this._spToggleFav(wordId, favBtn);
                return;
            }

            // ۶) کلیک روی کل آیتم (fallback)
            if (!e.target.closest('.sp-act') && !e.target.closest('.sp-fav')) {
                this._spViewWord(wordId);
            }
        };

        container.addEventListener('click', this._spClickHandler);
    };

    /* ============================================================
       ۱۶-ب) کمک‌کننده: مشاهده جزئیات لغت
       ============================================================
       نکته مهم: renderWordDetails محتوا را در #search-results-container
       قرار می‌دهد. اما این کانتینر فقط در بخش جستجو هست.
       
       راه‌حل:
       • اگر در بخش جستجو هستیم → همان‌جا نمایش بده
       • اگر در بخش لیست لغات هستیم → یک کانتینر موقت در همان بخش
         ایجاد کن، بعد از بازگشت آن را پاک کن
       ============================================================ */
    GermanDictionary.prototype._spViewWord = async function(wordId) {
        try {
            if (typeof this.getWord !== 'function') {
                this.showToast('خطا: تابع getWord یافت نشد', 'error');
                return;
            }

            const word = await this.getWord(wordId);
            if (!word) {
                this.showToast('لغت یافت نشد', 'warning');
                return;
            }

            if (typeof this.renderWordDetails !== 'function') {
                this.showToast('تابع نمایش جزئیات یافت نشد', 'error');
                return;
            }

            // تشخیص بخش فعال فعلی
            const activeSection = document.querySelector('.content-section.active');
            const activeSectionId = activeSection ? activeSection.id : null;

            if (activeSectionId === 'search-section') {
                // حالت ۱: در بخش جستجو هستیم
                const searchSectionEl = document.getElementById('search-section');
                if (searchSectionEl && !this._spSavedSearchUI) {
                    this._spSavedSearchUI = searchSectionEl.innerHTML;
                }

                const container = document.getElementById('search-results-container');
                if (!container) {
                    this.showToast('کانتینر نتایج جستجو یافت نشد', 'error');
                    return;
                }

                this._spContext = 'search';

                try {
                    await this.renderWordDetails(word);
                } catch (renderErr) {
                    console.error('خطا در renderWordDetails:', renderErr);
                    this.showToast('خطا در نمایش جزئیات', 'error');
                    return;
                }

                // دکمه بازگشت در setupDetailEventListeners تنظیم می‌شود
                this._spSetupBackButton();
            } else if (activeSectionId === 'word-list-section') {
                // حالت ۲: در بخش لیست لغات هستیم
                const listSection = document.getElementById('word-list-section');
                const listContainer = document.getElementById('word-list-container');
                if (!listSection || !listContainer) {
                    this.showToast('بخش لیست لغات یافت نشد', 'error');
                    return;
                }

                // پیدا کردن .word-card والد (شامل هدر + فیلترها + لیست)
                const wordCard = listContainer.closest('.word-card');
                if (wordCard && !this._spSavedWordCard) {
                    this._spSavedWordCard = wordCard;
                    this._spSavedWordCardDisplay = wordCard.style.display;
                }

                // مخفی کردن کل word-card (هدر + فیلترها + لیست)
                if (wordCard) {
                    wordCard.style.display = 'none';
                } else {
                    listContainer.style.display = 'none';
                }

                // موقتاً تغییر id کانتینر بخش جستجو
                const existingSearchContainer = document.getElementById('search-results-container');
                if (existingSearchContainer) {
                    existingSearchContainer.id = 'search-results-container-original';
                }

                // ایجاد کانتینر جدید در بخش لیست لغات
                const detailContainer = document.createElement('div');
                detailContainer.id = 'search-results-container';
                listSection.appendChild(detailContainer);

                // ذخیره reference برای استفاده در setupDetailEventListeners
                this._spDetailContainer = detailContainer;
                this._spContext = 'word-list';

                try {
                    await this.renderWordDetails(word);
                } catch (renderErr) {
                    console.error('خطا در renderWordDetails:', renderErr);
                    this.showToast('خطا در نمایش جزئیات', 'error');
                    this._spRestoreList();
                    return;
                }

                // دکمه بازگشت در setupDetailEventListeners تنظیم می‌شود
                // اما برای اطمینان، اینجا هم تنظیم می‌کنیم
                this._spSetupBackButton();
            } else {
                // حالت ۳: در بخش دیگری هستیم → به بخش جستجو برو
                const searchSection = document.getElementById('search-section');
                if (searchSection) {
                    if (typeof this.showSection === 'function') {
                        this.showSection('search-section');
                    } else {
                        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                        searchSection.classList.add('active');
                    }

                    const container = document.getElementById('search-results-container');
                    if (container) {
                        try {
                            await this.renderWordDetails(word);
                        } catch (renderErr) {
                            console.error('خطا در renderWordDetails:', renderErr);
                            this.showToast('خطا در نمایش جزئیات', 'error');
                        }
                    }
                }
            }

            // اسکرول به بالا
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('خطا در مشاهده لغت:', err);
            this.showToast('خطا در نمایش جزئیات', 'error');
        }
    };

    /* ============================================================
       ۱۶-ج) کمک‌کننده: تغییر وضعیت علاقه‌مندی
       ============================================================ */
    GermanDictionary.prototype._spToggleFav = async function(wordId, btn) {
        try {
            if (typeof this.toggleFavorite !== 'function') return;
            await this.toggleFavorite(wordId);
            btn.classList.toggle('active');
            this._spUpdateCounts();
            if (typeof this.updateFavoritesCount === 'function') {
                this.updateFavoritesCount();
            }
        } catch (err) {
            console.error('خطا در تغییر علاقه‌مندی:', err);
        }
    };

    /* ============================================================
       ۱۶-د) بازیابی لیست لغات
       ============================================================ */
    GermanDictionary.prototype._spRestoreList = function() {
        // پاک کردن کانتینر جزئیات
        if (this._spDetailContainer) {
            this._spDetailContainer.remove();
            this._spDetailContainer = null;
        }
        // بازیابی word-card
        if (this._spSavedWordCard) {
            this._spSavedWordCard.style.display = this._spSavedWordCardDisplay || '';
            this._spSavedWordCard = null;
        }
        // بازیابی id کانتینر بخش جستجو
        const originalContainer = document.getElementById('search-results-container-original');
        if (originalContainer) {
            originalContainer.id = 'search-results-container';
        }
        this._spContext = null;
        // راه‌اندازی مجدد رویدادهای لیست لغات
        if (typeof this.setupWordListEventListeners === 'function') {
            this.setupWordListEventListeners();
        }
    };

    /* ============================================================
       ۱۶-هـ) تنظیم دکمه بازگشت
       ============================================================ */
    GermanDictionary.prototype._spSetupBackButton = function() {
        const backBtn = document.getElementById('backFromDetailBtn');
        if (!backBtn) return;
        // cloneNode برای پاک کردن event listeners قبلی
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
        newBackBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this._spContext === 'word-list') {
                this._spRestoreList();
            } else if (this._spContext === 'search') {
                // بازیابی رابط جستجو
                const searchSectionEl = document.getElementById('search-section');
                if (this._spSavedSearchUI && searchSectionEl) {
                    searchSectionEl.innerHTML = this._spSavedSearchUI;
                    this._spSavedSearchUI = null;
                    this._spContext = null;
                    this._spSetupEvents();
                    if (this._spState && this._spState.query) {
                        this._spPerformSearch();
                    } else {
                        this._spShowInitial();
                    }
                }
            }
        };
    };

    /* ============================================================
       ۱۶-و) Event Delegation برای دکمه بازگشت (قطعی!)
       ============================================================
       مشکل: هر بار که کاربر به لغت بعدی/قبلی می‌رود، renderWordDetails
       صدا زده می‌شود که setupDetailEventListeners را صدا می‌زند و دکمه
       بازگشت را با رفتار اصلی (رفتن به بخش جستجو) تنظیم می‌کند.
       بازنویسی goToNextWord/goToPrevWord هم شکننده است چون ممکن است
       فایل‌های دیگر بعد از فایل ما لود شوند و بازنویسی‌ها را از بین
       ببرند.

       راه‌حل قطعی: یک event listener در capture phase روی document
       که قبل از هر چیزی، کلیک روی #backFromDetailBtn را شکار می‌کند
       و با stopPropagation از اجرای onclick اصلی جلوگیری می‌کند.

       مزایا:
       • مستقل از ترتیب لود فایل‌ها
       • مستقل از setupDetailEventListeners
       • همیشه کار می‌کند، حتی بعد از re-render دکمه
       ============================================================ */
    if (!GermanDictionary.prototype._spBackDelegationAdded) {
        GermanDictionary.prototype._spBackDelegationAdded = true;

        document.addEventListener('click', function(e) {
            // آیا کلیک روی دکمه بازگشت یا داخل آن بود؟
            const backBtn = e.target.closest('#backFromDetailBtn');
            if (!backBtn) return;

            // شکار رویداد قبل از رسیدن به onclick اصلی
            e.stopPropagation();
            e.preventDefault();

            // پیدا کردن instance
            const app = window.dictionaryApp || window.dict;
            if (!app) return;

            // اجرای رفتار صحیح بر اساس context
            if (app._spContext === 'word-list') {
                app._spRestoreList();
            } else if (app._spContext === 'search') {
                // بازیابی رابط جستجو
                const searchSectionEl = document.getElementById('search-section');
                if (app._spSavedSearchUI && searchSectionEl) {
                    searchSectionEl.innerHTML = app._spSavedSearchUI;
                    app._spSavedSearchUI = null;
                    app._spContext = null;
                    app._spSetupEvents();
                    if (app._spState && app._spState.query) {
                        app._spPerformSearch();
                    } else {
                        app._spShowInitial();
                    }
                }
            } else {
                // fallback: اگر context مشخص نیست، به لیست لغات برو
                if (typeof app.showSection === 'function') {
                    app.showSection('word-list-section');
                    if (typeof app.renderWordList === 'function') {
                        app.renderWordList();
                    }
                }
            }
        }, true); // capture phase — قبل از onclick اصلی اجرا می‌شود
    }

    /* ============================================================
       ۱۷) بازنویسی normalSearch (برای سازگاری با منوی شناور)
       ============================================================ */
    GermanDictionary.prototype.normalSearch = async function(query) {
        if (!query || query.length < 2) {
            this.showToast('لطفاً حداقل ۲ حرف وارد کنید', 'warning');
            return;
        }

        // مهم: اگر در حال مشاهده جزئیات لغت هستیم، اول آن را ببندیم
        if (this._spContext === 'word-list') {
            this._spRestoreList();
        } else if (this._spContext === 'search' && this._spSavedSearchUI) {
            // بازیابی رابط جستجو
            const searchSectionEl = document.getElementById('search-section');
            if (searchSectionEl) {
                searchSectionEl.innerHTML = this._spSavedSearchUI;
                this._spSavedSearchUI = null;
            }
        }
        this._spContext = null;

        // اطمینان از اینکه بخش جستجو فعال است
        const searchSection = document.getElementById('search-section');
        if (searchSection) {
            const isActive = searchSection.classList.contains('active');
            // اگر رابط جستجو رندر نشده (مثلاً بعد از برگشت از جزئیات)، رندر کن
            const searchInput = document.getElementById('sp-search-input');
            if (!searchInput) {
                this.renderSearchSection();
            }
            if (!isActive) {
                if (typeof this.showSection === 'function') {
                    this.showSection('search-section');
                } else {
                    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                    searchSection.classList.add('active');
                }
            }
        }

        const input = document.getElementById('sp-search-input');
        if (input) {
            input.value = query;
            const clearBtn = document.getElementById('sp-clear-btn');
            if (clearBtn) clearBtn.classList.add('visible');
        }
        this._spState.query = query.trim();
        this._spState.page = 1;
        await this._spPerformSearch();
    };

    /* ============================================================
       ۱۸) سازگاری: showEmptySearchState و showMinCharWarning
       ============================================================ */
    GermanDictionary.prototype.showEmptySearchState = function() {
        this._spShowInitial();
    };

    GermanDictionary.prototype.showMinCharWarning = function() {
        this.showToast('حداقل ۲ حرف وارد کنید', 'warning');
    };

    /* ============================================================
       ۱۹) بازنویسی setupWordListEventListeners
       ============================================================
       نسخه پریمیوم: با استفاده از data-action و event delegation
       برای پشتیبانی از کارت‌های جدید (.wl-card) و همچنین سازگاری
       با ساختار قدیمی (.word-list-item, .favorite-icon, .view-word).
       از یک handler ذخیره‌شده استفاده می‌کند تا از تکرار listener
       جلوگیری شود (بدون نیاز به cloneNode).
       ============================================================ */
    GermanDictionary.prototype.setupWordListEventListeners = function() {
        const container = document.getElementById('word-list-container');
        const favContainer = document.getElementById('favorites-container');

        // حذف handler های قبلی اگر وجود داشتند
        if (this._wlClickHandler) {
            if (container) container.removeEventListener('click', this._wlClickHandler);
            if (favContainer) favContainer.removeEventListener('click', this._wlClickHandler);
        }

        this._wlClickHandler = async (e) => {
            // ۱) دکمه‌های جدید با data-action
            const actionEl = e.target.closest('[data-action]');
            if (actionEl) {
                e.stopPropagation();
                const action = actionEl.dataset.action;
                const wordId = parseInt(actionEl.dataset.id);
                if (!wordId) return;

                switch (action) {
                    case 'view': {
                        const word = await this.getWord(wordId);
                        if (word) {
                            this.lastWordId = wordId;
                            if (typeof this._spViewWord === 'function') {
                                this._spViewWord(wordId);
                            } else {
                                this.renderWordDetails(word);
                                this.showSection('search-section');
                            }
                        }
                        break;
                    }
                    case 'favorite': {
                        await this.toggleFavorite(wordId);
                        actionEl.classList.toggle('active');
                        this.updateFavoritesCount();
                        const activeFilter = document.querySelector('.filter-btn.active');
                        if (activeFilter) {
                            this.renderWordList(activeFilter.dataset.filter);
                        } else {
                            this.renderWordList('all');
                        }
                        break;
                    }
                    case 'practice': {
                        this.startPracticeSession([wordId]);
                        break;
                    }
                    case 'tag': {
                        const wordGerman = actionEl.dataset.word;
                        this.showTagSelectionForWord(wordId, wordGerman);
                        break;
                    }
                }
                return;
            }

            // ۲) سازگاری قدیمی: .favorite-icon
            const oldFavIcon = e.target.closest('.favorite-icon');
            if (oldFavIcon && oldFavIcon.dataset.id) {
                e.stopPropagation();
                const wordId = parseInt(oldFavIcon.dataset.id);
                await this.toggleFavorite(wordId);
                oldFavIcon.classList.toggle('active');
                this.updateFavoritesCount();
                const activeFilter = document.querySelector('.filter-btn.active');
                if (activeFilter) {
                    this.renderWordList(activeFilter.dataset.filter);
                } else {
                    this.renderWordList('all');
                }
                return;
            }

            // ۳) سازگاری قدیمی: .practice-word
            const oldPracticeBtn = e.target.closest('.practice-word');
            if (oldPracticeBtn && oldPracticeBtn.dataset.id) {
                e.stopPropagation();
                const wordId = parseInt(oldPracticeBtn.dataset.id);
                this.startPracticeSession([wordId]);
                return;
            }

            // ۴) سازگاری قدیمی: .view-word
            const oldViewBtn = e.target.closest('.view-word');
            if (oldViewBtn && oldViewBtn.dataset.id) {
                e.stopPropagation();
                const wordId = parseInt(oldViewBtn.dataset.id);
                const word = await this.getWord(wordId);
                if (word) {
                    this.lastWordId = wordId;
                    if (typeof this._spViewWord === 'function') {
                        this._spViewWord(wordId);
                    } else {
                        this.renderWordDetails(word);
                        this.showSection('search-section');
                    }
                }
                return;
            }

            // ۵) کلیک روی کل کارت → مشاهده لغت
            const cardEl = e.target.closest('.wl-card, .word-list-item');
            if (cardEl) {
                const wordId = parseInt(cardEl.dataset.id);
                if (wordId) {
                    const word = await this.getWord(wordId);
                    if (word) {
                        this.lastWordId = wordId;
                        if (typeof this._spViewWord === 'function') {
                            this._spViewWord(wordId);
                        } else {
                            this.renderWordDetails(word);
                            this.showSection('search-section');
                        }
                    }
                }
            }
        };

        if (container) container.addEventListener('click', this._wlClickHandler);
        if (favContainer && favContainer !== container) {
            favContainer.addEventListener('click', this._wlClickHandler);
        }
    };

    console.log('✅ سیستم جستجوی پیشرفته فعال شد.');
})();
