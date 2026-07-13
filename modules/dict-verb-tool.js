/* ================================================================
   dict-verb-tool.js — ابزار صرف افعال پیشرفته با هوش مصنوعی
   ----------------------------------------------------------------
   • بدون دیتابیس محلی — تمام صرف‌ها توسط هوش مصنوعی تولید می‌شوند
   • طراحی مدرن با استایل‌های inline (CSS-in-JS)
   • جداول پیشرفته با تب‌های زمان
   • پشتیبانی کامل Dark Mode + Light Mode
   • کاملاً ریسپانسیو (موبایل/تبلت/دسکتاپ)
   ================================================================ */

/* ============================================================
   تزریق استایل‌های پریمیوم ابزار صرف افعال
   ============================================================ */
GermanDictionary.prototype._injectVerbToolProStyles = function() {
    let style = document.getElementById('vt-pro-styles');
    if (!style) {
        style = document.createElement('style');
        style.id = 'vt-pro-styles';
        document.head.appendChild(style);
    }
    style.textContent = `
        /* ===== متغیرهای پریمیوم ===== */
        .vt-wrap {
            --vt-primary: #8b5cf6;
            --vt-primary-d: #6d28d9;
            --vt-primary-l: #f5f3ff;
            --vt-emerald: #10b981;
            --vt-amber: #f59e0b;
            --vt-rose: #f43f5e;
            --vt-cyan: #06b6d4;
            --vt-ink: #0f172a;
            --vt-ink-2: #1e293b;
            --vt-slate-600: #475569;
            --vt-muted: #64748b;
            --vt-muted-2: #94a3b8;
            --vt-line: #e2e8f0;
            --vt-line-2: #f1f5f9;
            --vt-card: #ffffff;
            --vt-card-2: #f8fafc;
            --vt-radius: 20px;
            --vt-radius-m: 16px;
            --vt-radius-s: 12px;
            --vt-radius-xs: 8px;
            --vt-shadow-sm: 0 1px 2px rgba(15,23,42,.04);
            --vt-shadow: 0 4px 12px rgba(15,23,42,.06);
            --vt-shadow-md: 0 8px 24px rgba(15,23,42,.08);
            --vt-shadow-lg: 0 20px 50px rgba(15,23,42,.15);
            font-family: 'Vazirmatn', Tahoma, sans-serif;
            color: var(--vt-ink);
            line-height: 1.6;
        }
        body.dark-mode .vt-wrap {
            --vt-ink: #f1f5f9;
            --vt-ink-2: #e2e8f0;
            --vt-slate-600: #cbd5e1;
            --vt-muted: #94a3b8;
            --vt-muted-2: #64748b;
            --vt-line: #1e293b;
            --vt-line-2: #1e293b;
            --vt-card: #1e293b;
            --vt-card-2: #0f172a;
            --vt-primary-l: rgba(139,92,246,.15);
            --vt-shadow-sm: 0 1px 2px rgba(0,0,0,.3);
            --vt-shadow: 0 4px 12px rgba(0,0,0,.3);
            --vt-shadow-md: 0 8px 24px rgba(0,0,0,.35);
            --vt-shadow-lg: 0 20px 50px rgba(0,0,0,.5);
        }
        .vt-wrap i, .vt-wrap i::before,
        .vt-wrap [class^="fa-"]::before, .vt-wrap [class*=" fa-"]::before {
            font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
        }
        .vt-wrap i.fas, .vt-wrap i.fa-solid { font-weight: 900 !important; }
        .vt-wrap i.far, .vt-wrap i.fa-regular { font-weight: 400 !important; }

        /* ===== هدر ابزار (گرادینتی) ===== */
        .vt-header {
            background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 45%, #1e1b4b 100%);
            color: #f8fafc;
            padding: 28px 26px;
            position: relative;
            overflow: hidden;
        }
        .vt-header::before, .vt-header::after {
            content: "";
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            pointer-events: none;
            animation: vt-float 10s ease-in-out infinite;
        }
        .vt-header::before {
            width: 280px; height: 280px;
            background: radial-gradient(circle, rgba(139,92,246,.5), transparent 70%);
            top: -120px; right: -60px;
        }
        .vt-header::after {
            width: 240px; height: 240px;
            background: radial-gradient(circle, rgba(6,182,212,.35), transparent 70%);
            bottom: -100px; left: -50px;
            animation-delay: -5s;
        }
        @keyframes vt-float {
            0%,100% { transform: translate(0,0) scale(1); }
            50% { transform: translate(20px,-20px) scale(1.1); }
        }
        .vt-header-inner {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .vt-header-icon {
            width: 52px; height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
            background: rgba(255,255,255,.15);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            font-size: 22px;
            flex-shrink: 0;
        }
        .vt-header h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.4px;
        }
        .vt-header p {
            margin: 4px 0 0;
            font-size: 13px;
            opacity: .8;
        }
        .vt-header-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 5px 12px;
            border-radius: 999px;
            background: rgba(255,255,255,.15);
            backdrop-filter: blur(8px);
            font-size: 11px;
            font-weight: 700;
            margin-top: 10px;
        }
        .vt-header-badge i { font-size: 10px; color: #fbbf24; }

        /* ===== بدنه ابزار ===== */
        .vt-body { padding: 24px 26px 28px; }

        /* ===== نوار جستجو ===== */
        .vt-search-box {
            display: flex;
            gap: 10px;
            margin-bottom: 18px;
        }
        .vt-search-input {
            flex: 1;
            min-width: 0;
            padding: 13px 18px;
            border: 1.5px solid var(--vt-line);
            border-radius: var(--vt-radius-s);
            background: var(--vt-card);
            color: var(--vt-ink);
            font-family: inherit;
            font-size: 15px;
            font-weight: 600;
            outline: none;
            transition: all .25s ease;
            direction: ltr;
            text-align: left;
        }
        .vt-search-input::placeholder {
            color: var(--vt-muted-2);
            font-weight: 500;
            text-align: right;
            direction: rtl;
        }
        .vt-search-input:focus {
            border-color: var(--vt-primary);
            box-shadow: 0 0 0 4px rgba(139,92,246,.15);
        }
        .vt-search-btn {
            padding: 13px 22px;
            border-radius: var(--vt-radius-s);
            background: linear-gradient(135deg, var(--vt-primary), var(--vt-primary-d));
            color: #fff;
            border: none;
            font-family: inherit;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all .25s ease;
            box-shadow: 0 4px 12px rgba(139,92,246,.3);
            flex-shrink: 0;
        }
        .vt-search-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(139,92,246,.4);
        }
        .vt-search-btn:active { transform: translateY(0); }
        .vt-search-btn:disabled {
            opacity: .6;
            cursor: not-allowed;
            transform: none;
        }

        /* ===== چیپس پیشنهادی ===== */
        .vt-suggestions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 20px;
            padding: 14px;
            background: var(--vt-card-2);
            border-radius: var(--vt-radius-m);
            border: 1px solid var(--vt-line);
        }
        .vt-suggest-label {
            font-size: 12px;
            font-weight: 700;
            color: var(--vt-muted);
            width: 100%;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .vt-suggest-label i { color: var(--vt-primary); font-size: 11px; }
        .vt-suggest-chip {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 6px 14px;
            border-radius: 999px;
            background: var(--vt-card);
            border: 1px solid var(--vt-line);
            color: var(--vt-slate-600);
            font-family: inherit;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all .2s ease;
            direction: ltr;
        }
        .vt-suggest-chip:hover {
            border-color: var(--vt-primary);
            color: var(--vt-primary);
            background: var(--vt-primary-l);
            transform: translateY(-1px);
        }

        /* ===== لودینگ ===== */
        .vt-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            gap: 16px;
        }
        .vt-loading-spinner {
            width: 56px; height: 56px;
            border: 4px solid var(--vt-line);
            border-top-color: var(--vt-primary);
            border-radius: 50%;
            animation: vt-spin 1s linear infinite;
        }
        @keyframes vt-spin { to { transform: rotate(360deg); } }
        .vt-loading-text {
            font-size: 14px;
            font-weight: 700;
            color: var(--vt-muted);
            text-align: center;
        }
        .vt-loading-sub {
            font-size: 12px;
            color: var(--vt-muted-2);
            text-align: center;
            max-width: 320px;
        }

        /* ===== حالت خالی ===== */
        .vt-empty {
            text-align: center;
            padding: 60px 24px;
        }
        .vt-empty-ic {
            width: 100px; height: 100px;
            margin: 0 auto 20px;
            border-radius: 28px;
            background: linear-gradient(135deg, var(--vt-primary-l), var(--vt-line-2));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: var(--vt-primary);
        }
        .vt-empty h3 {
            margin: 0 0 8px;
            font-size: 19px;
            font-weight: 800;
            color: var(--vt-ink);
        }
        .vt-empty p {
            margin: 0 0 6px;
            font-size: 14px;
            color: var(--vt-muted);
            max-width: 420px;
            margin-left: auto;
            margin-right: auto;
        }
        .vt-empty-hint {
            margin-top: 16px;
            font-size: 12px;
            color: var(--vt-muted-2);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            background: var(--vt-card-2);
            border-radius: 999px;
            border: 1px dashed var(--vt-line);
        }
        .vt-empty-hint i { color: var(--vt-amber); }

        /* ===== نتیجه صرف ===== */
        .vt-result {
            animation: vt-fade-in .4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes vt-fade-in {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* ===== هدر فعل ===== */
        .vt-verb-header {
            background: linear-gradient(135deg, var(--vt-primary-l), var(--vt-card-2));
            border: 1px solid var(--vt-line);
            border-radius: var(--vt-radius-m);
            padding: 20px 22px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            flex-wrap: wrap;
        }
        .vt-verb-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .vt-verb-name {
            font-size: 32px;
            font-weight: 800;
            color: var(--vt-primary);
            direction: ltr;
            font-family: 'Segoe UI', system-ui, sans-serif;
            letter-spacing: -0.5px;
            line-height: 1.2;
        }
        .vt-verb-meaning {
            font-size: 14px;
            color: var(--vt-slate-600);
            font-weight: 600;
        }
        .vt-verb-badges {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }
        .vt-verb-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 11px;
            border-radius: 7px;
            font-size: 11px;
            font-weight: 700;
        }
        .vt-verb-badge.regular { background: rgba(16,185,129,.14); color: #059669; }
        .vt-verb-badge.irregular { background: rgba(245,158,11,.14); color: #d97706; }
        .vt-verb-badge.level { background: rgba(100,116,139,.14); color: #475569; }
        .vt-verb-badge.auxiliary { background: rgba(6,182,212,.14); color: #0891b2; }

        .vt-verb-actions {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
        }
        .vt-act-btn {
            width: 42px; height: 42px;
            border-radius: 12px;
            border: 1px solid var(--vt-line);
            background: var(--vt-card);
            color: var(--vt-slate-600);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            transition: all .25s ease;
        }
        .vt-act-btn:hover {
            transform: translateY(-2px);
        }
        .vt-act-btn.act-speak:hover {
            background: rgba(6,182,212,.1);
            border-color: var(--vt-cyan);
            color: #0891b2;
        }
        .vt-act-btn.act-practice:hover {
            background: rgba(16,185,129,.1);
            border-color: var(--vt-emerald);
            color: #059669;
        }
        .vt-act-btn.act-save:hover {
            background: rgba(139,92,246,.1);
            border-color: var(--vt-primary);
            color: var(--vt-primary);
        }

        /* ===== تب‌های زمان ===== */
        .vt-tense-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 18px;
            overflow-x: auto;
            padding-bottom: 4px;
            scrollbar-width: thin;
        }
        .vt-tense-tabs::-webkit-scrollbar { height: 5px; }
        .vt-tense-tabs::-webkit-scrollbar-thumb { background: var(--vt-line); border-radius: 3px; }

        .vt-tense-tab {
            flex-shrink: 0;
            padding: 12px 18px;
            border-radius: var(--vt-radius-s);
            border: 1.5px solid var(--vt-line);
            background: var(--vt-card);
            color: var(--vt-slate-600);
            font-family: inherit;
            cursor: pointer;
            transition: all .25s cubic-bezier(.22,1,.36,1);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            min-width: 110px;
        }
        .vt-tense-tab:hover {
            border-color: var(--vt-primary);
            color: var(--vt-primary);
            background: var(--vt-primary-l);
            transform: translateY(-1px);
        }
        .vt-tense-tab.active {
            background: linear-gradient(135deg, var(--vt-primary), var(--vt-primary-d));
            border-color: transparent;
            color: #fff;
            box-shadow: 0 4px 12px rgba(139,92,246,.3);
        }
        .vt-tense-tab-title {
            font-size: 13px;
            font-weight: 800;
            direction: ltr;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .vt-tense-tab-sub {
            font-size: 11px;
            font-weight: 600;
            opacity: .8;
        }

        /* ===== جدول صرف پیشرفته ===== */
        .vt-conj-table {
            background: var(--vt-card);
            border: 1px solid var(--vt-line);
            border-radius: var(--vt-radius-m);
            overflow: hidden;
            box-shadow: var(--vt-shadow);
        }
        .vt-conj-header {
            padding: 16px 20px;
            background: linear-gradient(135deg, var(--vt-primary-l), var(--vt-card-2));
            border-bottom: 1px solid var(--vt-line);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
        }
        .vt-conj-header-title {
            font-size: 15px;
            font-weight: 800;
            color: var(--vt-ink);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .vt-conj-header-title i { color: var(--vt-primary); font-size: 14px; }
        .vt-conj-header-hint {
            font-size: 11px;
            color: var(--vt-muted);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .vt-conj-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
        }
        @media (max-width: 640px) {
            .vt-conj-grid { grid-template-columns: 1fr; }
        }

        .vt-conj-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 20px;
            border-bottom: 1px solid var(--vt-line-2);
            transition: background .2s ease;
        }
        .vt-conj-row:hover { background: var(--vt-primary-l); }
        .vt-conj-row:last-child { border-bottom: none; }
        .vt-conj-row:nth-child(odd) {
            border-left: 1px solid var(--vt-line-2);
        }
        @media (max-width: 640px) {
            .vt-conj-row:nth-child(odd) { border-left: none; }
        }

        .vt-conj-person {
            font-size: 13px;
            font-weight: 700;
            color: var(--vt-muted);
            direction: ltr;
            font-family: 'Segoe UI', system-ui, sans-serif;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .vt-conj-person-dot {
            width: 8px; height: 8px;
            border-radius: 50%;
            background: var(--vt-primary);
            opacity: .5;
        }
        .vt-conj-form {
            font-size: 16px;
            font-weight: 800;
            color: var(--vt-ink);
            direction: ltr;
            font-family: 'Segoe UI', system-ui, sans-serif;
            letter-spacing: -0.2px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .vt-conj-form-speak {
            width: 26px; height: 26px;
            border-radius: 6px;
            border: none;
            background: transparent;
            color: var(--vt-muted-2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            transition: all .2s ease;
            opacity: 0;
        }
        .vt-conj-row:hover .vt-conj-form-speak { opacity: 1; }
        .vt-conj-form-speak:hover {
            background: rgba(6,182,212,.1);
            color: var(--vt-cyan);
        }

        /* ===== بخش Perfekt خاص ===== */
        .vt-perfekt-section {
            padding: 16px 20px;
            border-bottom: 1px solid var(--vt-line-2);
        }
        .vt-perfekt-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 0;
        }
        .vt-perfekt-label {
            font-size: 13px;
            color: var(--vt-muted);
            font-weight: 700;
        }
        .vt-perfekt-value {
            font-size: 17px;
            font-weight: 800;
            color: var(--vt-ink);
            direction: ltr;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .vt-perfekt-example {
            margin-top: 10px;
            padding: 10px 14px;
            background: var(--vt-primary-l);
            border-radius: 10px;
            font-size: 13px;
            color: var(--vt-ink-2);
            font-weight: 600;
            direction: ltr;
            text-align: left;
            border-right: 3px solid var(--vt-primary);
        }

        /* ===== مثال‌ها ===== */
        .vt-examples {
            margin-top: 22px;
            padding: 18px 20px;
            background: var(--vt-card);
            border: 1px solid var(--vt-line);
            border-radius: var(--vt-radius-m);
        }
        .vt-examples-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 14px;
            font-size: 14px;
            font-weight: 800;
            color: var(--vt-ink);
        }
        .vt-examples-header i { color: var(--vt-amber); }
        .vt-example-item {
            padding: 12px 14px;
            background: var(--vt-card-2);
            border-radius: 10px;
            margin-bottom: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            border-right: 3px solid var(--vt-primary);
            transition: all .2s ease;
        }
        .vt-example-item:hover {
            transform: translateX(-3px);
            box-shadow: var(--vt-shadow-sm);
        }
        .vt-example-item:last-child { margin-bottom: 0; }
        .vt-example-de {
            font-size: 14px;
            font-weight: 700;
            color: var(--vt-ink);
            direction: ltr;
            text-align: left;
            font-family: 'Segoe UI', system-ui, sans-serif;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .vt-example-fa {
            font-size: 12px;
            color: var(--vt-muted);
            font-weight: 500;
        }
        .vt-example-speak {
            width: 28px; height: 28px;
            border-radius: 7px;
            border: none;
            background: rgba(6,182,212,.1);
            color: var(--vt-cyan);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            transition: all .2s ease;
            flex-shrink: 0;
        }
        .vt-example-speak:hover {
            background: rgba(6,182,212,.2);
            transform: scale(1.1);
        }

        /* ===== نکات گرامری ===== */
        .vt-grammar-tips {
            margin-top: 18px;
            padding: 16px 18px;
            background: linear-gradient(135deg, rgba(245,158,11,.08), rgba(245,158,11,.02));
            border: 1px solid rgba(245,158,11,.2);
            border-radius: var(--vt-radius-m);
        }
        .vt-grammar-tips-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            font-size: 13px;
            font-weight: 800;
            color: #d97706;
        }
        body.dark-mode .vt-grammar-tips-header { color: #fbbf24; }
        .vt-grammar-tips-header i { font-size: 12px; }
        .vt-grammar-tips-content {
            font-size: 13px;
            color: var(--vt-slate-600);
            line-height: 1.7;
        }

        /* ===== ریسپانسیو ===== */
        @media (max-width: 768px) {
            .vt-header { padding: 22px 20px; }
            .vt-header h2 { font-size: 19px; }
            .vt-header-icon { width: 44px; height: 44px; font-size: 18px; }
            .vt-body { padding: 18px 18px 22px; }
            .vt-search-box { flex-direction: column; }
            .vt-search-btn { width: 100%; justify-content: center; }
            .vt-verb-name { font-size: 26px; }
            .vt-verb-header { padding: 16px 16px; }
            .vt-tense-tab { min-width: 95px; padding: 10px 14px; }
            .vt-conj-row { padding: 12px 14px; }
            .vt-conj-person { font-size: 12px; }
            .vt-conj-form { font-size: 15px; }
            .vt-conj-form-speak { opacity: 1; } /* همیشه قابل دیدن در موبایل */
        }
        @media (max-width: 640px) {
            /* هدر کوچک‌تر در موبایل */
            .vt-header { padding: 16px 14px; }
            .vt-header-inner { gap: 10px; }
            .vt-header-icon { width: 38px; height: 38px; font-size: 15px; border-radius: 11px; }
            .vt-header h2 { font-size: 16px; letter-spacing: -0.2px; }
            .vt-header p { font-size: 11px; line-height: 1.5; }
            .vt-header-badge { padding: 4px 10px; font-size: 10px; margin-top: 8px; }
            .vt-body { padding: 14px 12px 18px; }
            /* placeholder و ورودی کوچک‌تر */
            .vt-search-input { padding: 11px 14px; font-size: 14px; }
            .vt-search-input::placeholder { font-size: 12px; }
            .vt-search-btn { padding: 11px 16px; font-size: 13px; }
            /* چیپس پیشنهادی فشرده‌تر */
            .vt-suggestions { padding: 10px; gap: 6px; margin-bottom: 16px; }
            .vt-suggest-label { font-size: 11px; }
            .vt-suggest-chip { padding: 5px 11px; font-size: 12px; gap: 4px; }
            /* سایزهای نتیجه */
            .vt-verb-name { font-size: 22px; }
            .vt-verb-header { padding: 14px 12px; }
            .vt-tense-tabs { gap: 5px; }
            .vt-tense-tab { min-width: 78px; padding: 9px 11px; font-size: 12px; }
            .vt-conj-row { padding: 10px 12px; gap: 8px; }
            .vt-conj-person { font-size: 11px; }
            .vt-conj-form { font-size: 14px; }
        }
        @media (max-width: 480px) {
            .vt-verb-header { flex-direction: column; align-items: flex-start; }
            .vt-verb-actions { width: 100%; justify-content: flex-end; }
            .vt-act-btn { width: 40px; height: 40px; }
            .vt-header-icon { width: 34px; height: 34px; font-size: 14px; }
            .vt-header h2 { font-size: 15px; }
        }
    `;
};

/* ============================================================
   راه‌اندازی ابزار صرف افعال
   ============================================================ */
GermanDictionary.prototype.initVerbConjugationTool = async function() {
    console.log('🔧 راه‌اندازی ابزار صرف افعال (نسخه AI)...');

    // تزریق استایل‌ها
    this._injectVerbToolProStyles();

    // رندر ساختار اولیه
    this._renderVerbToolContainer();

    setTimeout(() => {
        // راه‌اندازی رویدادها
        this._setupVerbToolEvents();

        // به‌روزرسانی badge تعداد (حذف — چون دیگر دیتابیس نداریم)
        const countSpan = document.getElementById('tools-verbs-count');
        if (countSpan) {
            countSpan.innerHTML = '<i class="fas fa-robot"></i> هوش مصنوعی';
            countSpan.style.background = 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
        }

        console.log('✅ ابزار صرف افعال (AI) راه‌اندازی شد');
    }, 300);
};

/* ============================================================
   رندر کانتینر ابزار
   ============================================================ */
GermanDictionary.prototype._renderVerbToolContainer = function() {
    const container = document.getElementById('verb-tool-container');
    if (!container) return;

    // افعال پیشنهادی پرکاربرد
    const popularVerbs = ['sein', 'haben', 'werden', 'machen', 'gehen', 'kommen', 'sagen', 'sehen', 'lernen', 'sprechen', 'essen', 'trinken'];

    container.innerHTML = `
        <div class="vt-wrap">
            <div class="vt-header">
                <div class="vt-header-inner">
                    <div class="vt-header-icon">
                        <i class="fas fa-table-list"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h2>صرف افعال پیشرفته</h2>
                        <p>صرف کامل افعال آلمانی با هوش مصنوعی</p>
                        <div class="vt-header-badge">
                            <i class="fas fa-bolt"></i>
                            <span>پشتیبانی از تمام افعال آلمانی</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="vt-body">
                <!-- نوار جستجو -->
                <div class="vt-search-box">
                    <input type="text" id="verb-search-input" class="vt-search-input"
                           placeholder="نام فعل آلمانی را وارد کنید... (مثال: machen, gehen, sein)"
                           autocomplete="off" />
                    <button id="verb-search-btn" class="vt-search-btn">
                        <i class="fas fa-magic"></i>
                        <span>صرف با AI</span>
                    </button>
                </div>

                <!-- افعال پیشنهادی -->
                <div class="vt-suggestions">
                    <div class="vt-suggest-label">
                        <i class="fas fa-star"></i>
                        <span>افعال پرکاربرد:</span>
                    </div>
                    ${popularVerbs.map(v => `
                        <button class="vt-suggest-chip" data-verb="${v}">${v}</button>
                    `).join('')}
                </div>

                <!-- محل نمایش نتیجه -->
                <div id="verb-tool-content">
                    <div class="vt-empty">
                        <div class="vt-empty-ic">
                            <i class="fas fa-wand-magic-sparkles"></i>
                        </div>
                        <h3>صرف افعال با هوش مصنوعی</h3>
                        <p>هر فعل آلمانی را وارد کنید تا هوش مصنوعی تمام زمان‌های صرف آن را با مثال و نکات گرامری نمایش دهد.</p>
                        <div class="vt-empty-hint">
                            <i class="fas fa-lightbulb"></i>
                            <span>پشتیبانی از تمام افعال: با قاعده، بی‌قاعده، جداشدنی و...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/* ============================================================
   راه‌اندازی رویدادها
   ============================================================ */
GermanDictionary.prototype._setupVerbToolEvents = function() {
    const self = this;
    const searchInput = document.getElementById('verb-search-input');
    const searchBtn = document.getElementById('verb-search-btn');

    if (!searchInput || !searchBtn) return;

    // دکمه جستجو
    searchBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const verb = searchInput.value.trim();
        if (verb) {
            self._conjugateVerbWithAI(verb);
        } else {
            self.showToast('🔍 لطفاً نام فعل را وارد کنید', 'warning');
            searchInput.focus();
        }
    };

    // اینتر در فیلد جستجو
    searchInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchBtn.click();
        }
    };

    // کلیک روی افعال پیشنهادی (event delegation)
    const container = document.getElementById('verb-tool-container');
    if (container) {
        container.addEventListener('click', (e) => {
            const chip = e.target.closest('.vt-suggest-chip');
            if (chip) {
                const verb = chip.dataset.verb;
                searchInput.value = verb;
                self._conjugateVerbWithAI(verb);
            }
        });
    }
};

/* ============================================================
   صرف فعل با هوش مصنوعی
   ============================================================ */
GermanDictionary.prototype._conjugateVerbWithAI = async function(verb) {
    const self = this;
    const contentDiv = document.getElementById('verb-tool-content');
    if (!contentDiv) return;

    // نمایش لودینگ
    contentDiv.innerHTML = `
        <div class="vt-loading">
            <div class="vt-loading-spinner"></div>
            <div class="vt-loading-text">در حال صرف فعل "${this.escapeHtml(verb)}"...</div>
            <div class="vt-loading-sub">هوش مصنوعی در حال تولید تمام زمان‌های صرف است. لطفاً چند ثانیه صبر کنید.</div>
        </div>
    `;

    // اسکرول به نتیجه
    setTimeout(() => {
        contentDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
        // ساخت prompt برای AI
        const prompt = self._buildConjugationPrompt(verb);

        // فراخوانی AI — ✔️ FIX: model و taskType اضافه شد
        const response = await this._puterChat([
            { role: 'system', content: 'You are a German language expert. You conjugate verbs accurately and provide grammar tips in Persian. Always respond in valid JSON format only, no markdown, no extra text.' },
            { role: 'user', content: prompt }
        ], { model: 'llama-4-scout', taskType: 'conjugation', temperature: 0.3, max_tokens: 4000 });

        // ✔️ FIX: استخراج متن مقاوم
        var text = '';
        if (response && response.message && response.message.content) {
            if (Array.isArray(response.message.content)) {
                text = response.message.content.map(function(c){ return c.text || ''; }).join('');
            } else if (typeof response.message.content === 'string') {
                text = response.message.content;
            }
        } else if (typeof response === 'string') {
            text = response;
        }
        if (!text) throw new Error('پاسخ خالی از هوش مصنوعی');
        const conjugation = self._parseAIConjugation(text, verb);

        if (!conjugation) {
            throw new Error('پاسخ هوش مصنوعی قابل پردازش نبود');
        }

        // ذخیره فعل جاری
        self.currentVerb = verb;
        self.currentConjugation = conjugation;

        // رندر نتیجه
        self._renderVerbConjugation(verb, conjugation);

    } catch (err) {
        console.error('❌ خطا در صرف فعل:', err);
        contentDiv.innerHTML = `
            <div class="vt-empty">
                <div class="vt-empty-ic" style="background: linear-gradient(135deg, rgba(244,63,94,.1), rgba(244,63,94,.05)); color: var(--vt-rose);">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>خطا در صرف فعل</h3>
                <p>متأسفانه در حال حاضر امکان صرف این فعل وجود ندارد. لطفاً اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.</p>
                <div class="vt-empty-hint">
                    <i class="fas fa-info-circle"></i>
                    <span>${this.escapeHtml(err.message || 'خطای ناشناخته')}</span>
                </div>
            </div>
        `;
    }
};

/* ============================================================
   ساخت prompt برای AI
   ============================================================ */
GermanDictionary.prototype._buildConjugationPrompt = function(verb) {
    return `Conjugate the German verb "${verb}" in all tenses. Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with this exact structure:

{
  "verb": "${verb}",
  "meaning": "Persian translation of the verb",
  "type": "regular" or "irregular" or "separable" or "reflexive",
  "level": "A1" or "A2" or "B1" or "B2" or "C1",
  "auxiliary": "haben" or "sein" or "haben/sein",
  "present": { "ich": "...", "du": "...", "er/sie/es": "...", "wir": "...", "ihr": "...", "sie/Sie": "..." },
  "praeteritum": { "ich": "...", "du": "...", "er/sie/es": "...", "wir": "...", "ihr": "...", "sie/Sie": "..." },
  "perfekt": { "helper": "haben" or "sein", "pastParticiple": "..." },
  "futur": { "ich": "...", "du": "...", "er/sie/es": "...", "wir": "...", "ihr": "...", "sie/Sie": "..." },
  "konjunktiv": { "ich": "...", "du": "...", "er/sie/es": "...", "wir": "...", "ihr": "...", "sie/Sie": "..." },
  "imperativ": { "du": "...", "ihr": "...", "Sie": "..." },
  "examples": [
    { "german": "...", "persian": "..." },
    { "german": "...", "persian": "..." },
    { "german": "...", "persian": "..." }
  ],
  "grammarTip": "A short grammar tip in Persian about this verb"
}

IMPORTANT:
- Return ONLY the JSON, no other text
- All conjugation forms must be accurate German
- "meaning", "grammarTip", and example "persian" fields must be in Persian
- "type" must be one of: regular, irregular, separable, reflexive
- Include exactly 3 practical examples`;
};

/* ============================================================
   پردازش پاسخ AI
   ============================================================ */
GermanDictionary.prototype._parseAIConjugation = function(text, verb) {
    try {
        // ✔️ FIX: اگر text از قبل object است، مستقیم استفاده کن
        if (typeof text === 'object' && text !== null) {
            if (text.verb && text.present) return text;
            text = JSON.stringify(text);
        }
        // حذف markdown code blocks اگر وجود داشت
        let clean = String(text || '').trim();
        clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
        clean = clean.replace(/\s*```$/i, '');
        // حذف leading/trailing تکراری
        clean = clean.replace(/^[\s\n]+/, '').replace(/[\s\n]+$/, '');

        // پیدا کردن اولین { و آخرین }
        const start = clean.indexOf('{');
        const end = clean.lastIndexOf('}');
        if (start === -1 || end === -1) {
            console.error('JSON markers not found in:', clean.substring(0, 200));
            return null;
        }
        clean = clean.substring(start, end + 1);

        const data = JSON.parse(clean);

        // اعتبارسنجی حداقل
        if (!data.verb || !data.present) {
            console.error('Invalid conjugation data:', data);
            return null;
        }

        return data;
    } catch (err) {
        console.error('خطا در parse پاسخ AI:', err);
        console.error('Raw text:', text);
        return null;
    }
};

/* ============================================================
   رندر نتیجه صرف
   ============================================================ */
GermanDictionary.prototype._renderVerbConjugation = function(verb, data) {
    const contentDiv = document.getElementById('verb-tool-content');
    if (!contentDiv) return;

    const self = this;

    // تعیین برچسب نوع
    const typeLabels = {
        regular: 'با قاعده',
        irregular: 'بی‌قاعده',
        separable: 'جداشدنی',
        reflexive: 'باز reflexive'
    };
    const typeLabel = typeLabels[data.type] || data.type || 'نامشخص';

    // زمان‌های قابل نمایش
    const tenses = [
        { key: 'present', icon: 'fa-book', title: 'Präsens', sub: 'حال ساده' },
        { key: 'praeteritum', icon: 'fa-clock-rotate-left', title: 'Präteritum', sub: 'گذشته ساده' },
        { key: 'perfekt', icon: 'fa-check', title: 'Perfekt', sub: 'گذشته کامل' },
        { key: 'futur', icon: 'fa-forward', title: 'Futur I', sub: 'آینده' },
        { key: 'konjunktiv', icon: 'fa-question', title: 'Konjunktiv II', sub: 'التزامی' }
    ];

    contentDiv.innerHTML = `
        <div class="vt-result">
            <!-- هدر فعل -->
            <div class="vt-verb-header">
                <div class="vt-verb-info">
                    <div class="vt-verb-name">${this.escapeHtml(verb)}</div>
                    ${data.meaning ? `<div class="vt-verb-meaning">${this.escapeHtml(data.meaning)}</div>` : ''}
                    <div class="vt-verb-badges">
                        <span class="vt-verb-badge ${data.type === 'regular' ? 'regular' : 'irregular'}">
                            <i class="fas fa-tag"></i> ${typeLabel}
                        </span>
                        ${data.level ? `<span class="vt-verb-badge level"><i class="fas fa-graduation-cap"></i> ${data.level}</span>` : ''}
                        ${data.auxiliary ? `<span class="vt-verb-badge auxiliary"><i class="fas fa-link"></i> ${data.auxiliary}</span>` : ''}
                    </div>
                </div>
                <div class="vt-verb-actions">
                    <button class="vt-act-btn act-speak" id="vt-speak-verb" title="تلفظ فعل" aria-label="تلفظ">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <button class="vt-act-btn act-save" id="vt-save-verb" title="ذخیره در دیکشنری" aria-label="ذخیره">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>

            <!-- تب‌های زمان -->
            <div class="vt-tense-tabs">
                ${tenses.map((t, idx) => `
                    <button class="vt-tense-tab ${idx === 0 ? 'active' : ''}" data-tense="${t.key}">
                        <span class="vt-tense-tab-title">${t.title}</span>
                        <span class="vt-tense-tab-sub">${t.sub}</span>
                    </button>
                `).join('')}
            </div>

            <!-- جدول صرف -->
            <div class="vt-conj-table" id="vt-conj-table">
                ${self._renderTenseTable('present', data)}
            </div>

            <!-- مثال‌ها -->
            ${data.examples && data.examples.length > 0 ? `
                <div class="vt-examples">
                    <div class="vt-examples-header">
                        <i class="fas fa-quote-right"></i>
                        <span>مثال‌های کاربردی</span>
                    </div>
                    ${data.examples.map((ex, idx) => `
                        <div class="vt-example-item">
                            <div class="vt-example-de">
                                <span>${this.escapeHtml(ex.german)}</span>
                                <button class="vt-example-speak" data-text="${this.escapeHtml(ex.german)}" title="تلفظ" aria-label="تلفظ مثال">
                                    <i class="fas fa-volume-up"></i>
                                </button>
                            </div>
                            ${ex.persian ? `<div class="vt-example-fa">${this.escapeHtml(ex.persian)}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- نکته گرامری -->
            ${data.grammarTip ? `
                <div class="vt-grammar-tips">
                    <div class="vt-grammar-tips-header">
                        <i class="fas fa-lightbulb"></i>
                        <span>نکته گرامری</span>
                    </div>
                    <div class="vt-grammar-tips-content">${this.escapeHtml(data.grammarTip)}</div>
                </div>
            ` : ''}
        </div>
    `;

    // راه‌اندازی رویدادها
    self._setupVerbResultEvents(verb, data);
};

/* ============================================================
   رندر جدول یک زمان خاص
   ============================================================ */
GermanDictionary.prototype._renderTenseTable = function(tense, data) {
    const tenseData = data[tense];
    if (!tenseData) {
        return `
            <div class="vt-conj-header">
                <div class="vt-conj-header-title">
                    <i class="fas fa-info-circle"></i>
                    <span>اطلاعات این زمان موجود نیست</span>
                </div>
            </div>
        `;
    }

    const tenseInfo = {
        present: { title: 'Präsens (حال ساده)', icon: 'fa-book' },
        praeteritum: { title: 'Präteritum (گذشته ساده)', icon: 'fa-clock-rotate-left' },
        perfekt: { title: 'Perfekt (گذشته کامل)', icon: 'fa-check' },
        futur: { title: 'Futur I (آینده)', icon: 'fa-forward' },
        konjunktiv: { title: 'Konjunktiv II (التزامی)', icon: 'fa-question' }
    };

    const info = tenseInfo[tense] || { title: tense, icon: 'fa-table' };

    // Perfekt حالت خاص
    if (tense === 'perfekt') {
        const helper = tenseData.helper || 'haben';
        const pp = tenseData.pastParticiple || '';
        return `
            <div class="vt-conj-header">
                <div class="vt-conj-header-title">
                    <i class="fas ${info.icon}"></i>
                    <span>${info.title}</span>
                </div>
                <div class="vt-conj-header-hint">
                    <i class="fas fa-info-circle"></i>
                    <span>فعل کمکی + اسم مفعول</span>
                </div>
            </div>
            <div class="vt-perfekt-section">
                <div class="vt-perfekt-row">
                    <span class="vt-perfekt-label">فعل کمکی (Hilfsverb)</span>
                    <span class="vt-perfekt-value">${this.escapeHtml(helper)}</span>
                </div>
                <div class="vt-perfekt-row">
                    <span class="vt-perfekt-label">اسم مفعول (Partizip II)</span>
                    <span class="vt-perfekt-value">${this.escapeHtml(pp)}</span>
                </div>
                <div class="vt-perfekt-example">
                    مثال: ich ${this.escapeHtml(helper)} ${this.escapeHtml(pp)}
                </div>
            </div>
        `;
    }

    // سایر زمان‌ها
    const persons = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
    const rows = persons.map(person => {
        const form = tenseData[person];
        if (!form) return '';
        return `
            <div class="vt-conj-row" data-text="${this.escapeHtml(form)}">
                <div class="vt-conj-person">
                    <span class="vt-conj-person-dot"></span>
                    <span>${person}</span>
                </div>
                <div class="vt-conj-form">
                    <span>${this.escapeHtml(form)}</span>
                    <button class="vt-conj-form-speak" data-text="${this.escapeHtml(form)}" title="تلفظ" aria-label="تلفظ">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="vt-conj-header">
            <div class="vt-conj-header-title">
                <i class="fas ${info.icon}"></i>
                <span>${info.title}</span>
            </div>
            <div class="vt-conj-header-hint">
                <i class="fas fa-mouse-pointer"></i>
                <span>برای تلفظ روی هر فرم کلیک کنید</span>
            </div>
        </div>
        <div class="vt-conj-grid">
            ${rows}
        </div>
    `;
};

/* ============================================================
   راه‌اندازی رویدادهای نتیجه صرف
   ============================================================ */
GermanDictionary.prototype._setupVerbResultEvents = function(verb, data) {
    const self = this;

    // تب‌های زمان
    document.querySelectorAll('.vt-tense-tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.vt-tense-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tense = tab.dataset.tense;
            const tableDiv = document.getElementById('vt-conj-table');
            if (tableDiv) {
                tableDiv.innerHTML = self._renderTenseTable(tense, data);
                // انیمیشن ورود
                tableDiv.style.animation = 'none';
                tableDiv.offsetHeight; // trigger reflow
                tableDiv.style.animation = 'vt-fade-in .3s ease both';
            }
        };
    });

    // تلفظ فعل اصلی
    const speakBtn = document.getElementById('vt-speak-verb');
    if (speakBtn) {
        speakBtn.onclick = () => self.speakText(verb, 'de-DE');
    }

    // ذخیره در دیکشنری
    const saveBtn = document.getElementById('vt-save-verb');
    if (saveBtn) {
        saveBtn.onclick = () => self._saveVerbToDict(verb, data);
    }

    // تلفظ فرم‌های صرف (event delegation)
    const tableDiv = document.getElementById('vt-conj-table');
    if (tableDiv) {
        tableDiv.addEventListener('click', (e) => {
            const speakEl = e.target.closest('.vt-conj-form-speak, .vt-conj-row');
            if (speakEl) {
                const text = speakEl.dataset.text;
                if (text) self.speakText(text, 'de-DE');
            }
        });
    }

    // تلفظ مثال‌ها (event delegation)
    const examplesDiv = document.querySelector('.vt-examples');
    if (examplesDiv) {
        examplesDiv.addEventListener('click', (e) => {
            const speakBtn = e.target.closest('.vt-example-speak');
            if (speakBtn) {
                const text = speakBtn.dataset.text;
                if (text) self.speakText(text, 'de-DE');
            }
        });
    }
};

/* ============================================================
   ذخیره فعل در دیکشنری
   ============================================================ */
GermanDictionary.prototype._saveVerbToDict = async function(verb, data) {
    // پر کردن فرم افزودن لغت با اطلاعات فعل
    this.showSection('add-word-section');

    setTimeout(() => {
        const germanInput = document.getElementById('german-word');
        const persianInput = document.getElementById('persian-meaning');
        const typeCard = document.querySelector('.type-card[data-type="verb"]') || document.querySelector('.aw-type-card[data-type="verb"]');

        if (germanInput) germanInput.value = verb;
        if (persianInput && data.meaning) persianInput.value = data.meaning;

        // انتخاب نوع «فعل»
        if (typeCard) typeCard.click();

        // پر کردن فیلدهای صرف فعل اگر وجود دارد
        if (data.present) {
            const verbPresent = document.getElementById('verb-present');
            if (verbPresent) {
                verbPresent.value = `ich ${data.present.ich || ''}, du ${data.present.du || ''}, er ${data.present['er/sie/es'] || ''}...`;
            }
        }
        if (data.praeteritum) {
            const verbPast = document.getElementById('verb-past');
            if (verbPast) {
                verbPast.value = `ich ${data.praeteritum.ich || ''}, du ${data.praeteritum.du || ''}...`;
            }
        }
        if (data.perfekt) {
            const verbPerfect = document.getElementById('verb-perfect');
            if (verbPerfect) {
                verbPerfect.value = `${data.perfekt.helper || 'haben'} ${data.perfekt.pastParticiple || ''}`;
            }
        }

        this.showToast(`✅ اطلاعات فعل "${verb}" در فرم افزودن لغت قرار گرفت`, 'success');
    }, 300);
};

/* ============================================================
   تابع قدیمی showVerbConjugation (برای سازگاری — حالا از AI استفاده می‌کند)
   ============================================================ */
GermanDictionary.prototype.showVerbConjugation = async function(verb) {
    return this._conjugateVerbWithAI(verb);
};

/* ============================================================
   تابع قدیمی filterVerbsList (برای سازگاری — دیگر نیازی نیست)
   ============================================================ */
GermanDictionary.prototype.filterVerbsList = function(filter) {
    // دیگر دیتابیسی وجود ندارد — این تابع فقط یک پیام نمایش می‌دهد
    this.showToast('💡 برای صرف فعل، نام آن را در کادر جستجو وارد کنید', 'info');
};

/* ============================================================
   AI Badge styles (حفظ تابع قدیمی)
   ============================================================ */
GermanDictionary.prototype.addAIBadgeStyles = function() {
    if (document.getElementById('ai-badge-styles')) return;
    const style = document.createElement('style');
    style.id = 'ai-badge-styles';
    style.textContent = `
        .ai-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            background: linear-gradient(135deg, #8b5cf6, #6d28d9);
            color: #fff;
        }
        .ai-badge i { font-size: 10px; }
    `;
    document.head.appendChild(style);
};
