/* dict-settings-export.js — Settings, Password, Export, Themes (نسخه پریمیوم ۲۰۲۵) */

/* ============================================================
   تزریق استایل‌های پریمیوم تنظیمات
   ============================================================ */
GermanDictionary.prototype._injectSettingsProStyles = function() {
    let style = document.getElementById('st-pro-styles');
    if (!style) {
        style = document.createElement('style');
        style.id = 'st-pro-styles';
        document.head.appendChild(style);
    }
    style.textContent = `
        /* ===== متغیرهای پریمیوم ===== */
        .st-wrap {
            --st-primary: #4361ee;
            --st-primary-d: #3a56d4;
            --st-primary-l: #eef2ff;
            --st-emerald: #10b981;
            --st-violet: #8b5cf6;
            --st-amber: #f59e0b;
            --st-rose: #f43f5e;
            --st-cyan: #06b6d4;
            --st-ink: #0f172a;
            --st-ink-2: #1e293b;
            --st-slate-600: #475569;
            --st-muted: #64748b;
            --st-muted-2: #94a3b8;
            --st-line: #e2e8f0;
            --st-line-2: #f1f5f9;
            --st-card: #ffffff;
            --st-card-2: #f8fafc;
            --st-radius: 20px;
            --st-radius-m: 16px;
            --st-radius-s: 12px;
            --st-radius-xs: 8px;
            --st-shadow-sm: 0 1px 2px rgba(15,23,42,.04);
            --st-shadow: 0 4px 12px rgba(15,23,42,.06);
            --st-shadow-md: 0 8px 24px rgba(15,23,42,.08);
            --st-shadow-lg: 0 20px 50px rgba(15,23,42,.15);
            font-family: 'Vazirmatn', Tahoma, sans-serif;
            color: var(--st-ink);
            line-height: 1.6;
        }
        body.dark-mode .st-wrap {
            --st-ink: #f1f5f9;
            --st-ink-2: #e2e8f0;
            --st-slate-600: #cbd5e1;
            --st-muted: #94a3b8;
            --st-muted-2: #64748b;
            --st-line: #1e293b;
            --st-line-2: #1e293b;
            --st-card: #1e293b;
            --st-card-2: #0f172a;
            --st-primary-l: rgba(67,97,238,.15);
            --st-shadow-sm: 0 1px 2px rgba(0,0,0,.3);
            --st-shadow: 0 4px 12px rgba(0,0,0,.3);
            --st-shadow-md: 0 8px 24px rgba(0,0,0,.35);
            --st-shadow-lg: 0 20px 50px rgba(0,0,0,.5);
        }
        .st-wrap i, .st-wrap i::before,
        .st-wrap [class^="fa-"]::before, .st-wrap [class*=" fa-"]::before {
            font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
        }
        .st-wrap i.fas, .st-wrap i.fa-solid { font-weight: 900 !important; }
        .st-wrap i.far, .st-wrap i.fa-regular { font-weight: 400 !important; }

        /* ===== هدر تنظیمات ===== */
        .st-header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #134e4a 100%);
            color: #f8fafc;
            padding: 28px 26px;
            border-radius: var(--st-radius);
            margin-bottom: 22px;
            position: relative;
            overflow: hidden;
        }
        .st-header::before, .st-header::after {
            content: "";
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            pointer-events: none;
            animation: st-float 10s ease-in-out infinite;
        }
        .st-header::before {
            width: 280px; height: 280px;
            background: radial-gradient(circle, rgba(67,97,238,.4), transparent 70%);
            top: -120px; right: -60px;
        }
        .st-header::after {
            width: 240px; height: 240px;
            background: radial-gradient(circle, rgba(139,92,246,.3), transparent 70%);
            bottom: -100px; left: -50px;
            animation-delay: -5s;
        }
        @keyframes st-float {
            0%,100% { transform: translate(0,0) scale(1); }
            50% { transform: translate(20px,-20px) scale(1.1); }
        }
        .st-header-inner {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .st-header-icon {
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
        .st-header h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.4px;
        }
        .st-header p {
            margin: 4px 0 0;
            font-size: 13px;
            opacity: .8;
        }

        /* ===== کارت گروه تنظیمات ===== */
        .st-group {
            background: var(--st-card);
            border: 1px solid var(--st-line);
            border-radius: var(--st-radius-m);
            padding: 22px 24px;
            margin-bottom: 18px;
            box-shadow: var(--st-shadow-sm);
        }
        .st-group-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 18px;
            padding-bottom: 14px;
            border-bottom: 1px dashed var(--st-line);
        }
        .st-group-icon {
            width: 40px; height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            font-size: 16px;
            flex-shrink: 0;
        }
        .st-group-icon.ic-appearance { background: rgba(139,92,246,.14); color: #6d28d9; }
        .st-group-icon.ic-theme { background: rgba(236,72,153,.14); color: #db2777; }
        .st-group-icon.ic-music { background: rgba(6,182,212,.14); color: #0891b2; }
        .st-group-icon.ic-data { background: rgba(16,185,129,.14); color: #059669; }
        .st-group-icon.ic-security { background: rgba(245,158,11,.14); color: #d97706; }
        .st-group-icon.ic-maintenance { background: rgba(244,63,94,.14); color: #e11d48; }
        .st-group-icon.ic-info { background: rgba(67,97,238,.14); color: #3a56d4; }
        .st-group-icon.ic-practice { background: rgba(132,204,22,.14); color: #65a30d; }
        .st-group-title {
            font-size: 16px;
            font-weight: 800;
            color: var(--st-ink);
        }
        .st-group-desc {
            font-size: 12px;
            color: var(--st-muted);
            margin-top: 2px;
        }

        /* ===== آیتم تنظیمات ===== */
        .st-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 14px 0;
            border-bottom: 1px solid var(--st-line-2);
        }
        .st-item:last-child { border-bottom: none; }
        .st-item-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        }
        .st-item-icon {
            width: 36px; height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: var(--st-card-2);
            color: var(--st-muted);
            font-size: 14px;
            flex-shrink: 0;
        }
        .st-item-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
        }
        .st-item-label {
            font-size: 14px;
            font-weight: 700;
            color: var(--st-ink);
        }
        .st-item-hint {
            font-size: 12px;
            color: var(--st-muted);
            font-weight: 500;
        }

        /* ===== سوییچ toggle ===== */
        .st-switch {
            position: relative;
            width: 50px;
            height: 28px;
            background: var(--st-line);
            border-radius: 999px;
            cursor: pointer;
            transition: background .25s ease;
            flex-shrink: 0;
            border: none;
        }
        .st-switch::after {
            content: "";
            position: absolute;
            top: 3px;
            right: 3px;
            width: 22px;
            height: 22px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,.2);
            transition: transform .25s cubic-bezier(.22,1,.36,1);
        }
        .st-switch.active {
            background: linear-gradient(135deg, var(--st-primary), var(--st-primary-d));
        }
        .st-switch.active::after {
            transform: translateX(-22px);
        }

        /* ===== دکمه‌های اندازه فونت ===== */
        .st-font-grid {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }
        .st-font-btn {
            padding: 8px 14px;
            border-radius: 10px;
            border: 1.5px solid var(--st-line);
            background: var(--st-card);
            color: var(--st-slate-600);
            font-family: inherit;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all .2s ease;
        }
        .st-font-btn:hover {
            border-color: var(--st-primary);
            color: var(--st-primary);
        }
        .st-font-btn.active {
            background: linear-gradient(135deg, var(--st-primary), var(--st-primary-d));
            border-color: transparent;
            color: #fff;
            box-shadow: 0 3px 10px rgba(67,97,238,.25);
        }

        /* ===== تم‌های رنگی ===== */
        .st-theme-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
        }
        .st-theme-card {
            position: relative;
            padding: 14px;
            border: 2px solid var(--st-line);
            border-radius: var(--st-radius-s);
            cursor: pointer;
            transition: all .25s ease;
            background: var(--st-card);
        }
        .st-theme-card:hover {
            transform: translateY(-3px);
            box-shadow: var(--st-shadow-md);
        }
        .st-theme-card.active {
            border-color: var(--st-primary);
            background: var(--st-primary-l);
        }
        .st-theme-card.active::after {
            content: "\\f00c";
            font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome";
            font-weight: 900;
            position: absolute;
            top: 8px;
            left: 8px;
            width: 22px;
            height: 22px;
            background: var(--st-primary);
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
        }
        .st-theme-preview {
            width: 100%;
            height: 50px;
            border-radius: 8px;
            margin-bottom: 8px;
        }
        .st-theme-name {
            font-size: 13px;
            font-weight: 700;
            color: var(--st-ink);
            text-align: center;
        }

        /* ===== دکمه‌های اکشن ===== */
        .st-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .st-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 11px 18px;
            border-radius: var(--st-radius-s);
            border: 1.5px solid var(--st-line);
            background: var(--st-card);
            color: var(--st-slate-600);
            font-family: inherit;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all .25s ease;
        }
        .st-btn i { font-size: 13px; }
        .st-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--st-shadow);
        }
        .st-btn.st-btn-primary {
            background: linear-gradient(135deg, var(--st-primary), var(--st-primary-d));
            border-color: transparent;
            color: #fff;
            box-shadow: 0 4px 12px rgba(67,97,238,.25);
        }
        .st-btn.st-btn-emerald {
            background: linear-gradient(135deg, #10b981, #059669);
            border-color: transparent;
            color: #fff;
            box-shadow: 0 4px 12px rgba(16,185,129,.25);
        }
        .st-btn.st-btn-amber {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border-color: transparent;
            color: #fff;
            box-shadow: 0 4px 12px rgba(245,158,11,.25);
        }
        .st-btn.st-btn-danger {
            background: linear-gradient(135deg, #f43f5e, #e11d48);
            border-color: transparent;
            color: #fff;
            box-shadow: 0 4px 12px rgba(244,63,94,.25);
        }

        /* ===== پلیر موسیقی ===== */
        .st-music-player {
            background: linear-gradient(135deg, var(--st-primary-l), var(--st-card-2));
            border: 1px solid var(--st-line);
            border-radius: var(--st-radius-m);
            padding: 18px;
            margin-bottom: 14px;
        }
        .st-music-top {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .st-music-art {
            width: 56px; height: 56px;
            border-radius: 14px;
            background: linear-gradient(135deg, var(--st-primary), var(--st-primary-d));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #fff;
            flex-shrink: 0;
        }
        .st-music-info {
            flex: 1;
            min-width: 0;
        }
        .st-music-track {
            font-size: 14px;
            font-weight: 700;
            color: var(--st-ink);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .st-music-artist {
            font-size: 12px;
            color: var(--st-muted);
        }
        .st-music-controls {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
        }
        .st-music-btn {
            width: 40px; height: 40px;
            border-radius: 12px;
            border: 1px solid var(--st-line);
            background: var(--st-card);
            color: var(--st-slate-600);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all .2s ease;
        }
        .st-music-btn:hover {
            border-color: var(--st-primary);
            color: var(--st-primary);
        }
        .st-music-btn.play-pause {
            background: linear-gradient(135deg, var(--st-primary), var(--st-primary-d));
            border-color: transparent;
            color: #fff;
            width: 44px; height: 44px;
        }
        .st-music-progress {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 14px;
        }
        .st-music-time {
            font-size: 11px;
            font-weight: 700;
            color: var(--st-muted);
            min-width: 40px;
        }
        .st-music-bar {
            flex: 1;
            height: 5px;
            background: var(--st-line);
            border-radius: 3px;
            cursor: pointer;
            position: relative;
        }
        .st-music-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--st-primary), var(--st-emerald));
            border-radius: 3px;
            width: 0%;
            transition: width .2s ease;
        }
        .st-music-volume {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 12px;
        }
        .st-music-volume i { font-size: 12px; color: var(--st-muted); }
        .st-music-volume input[type="range"] {
            flex: 1;
            height: 4px;
            accent-color: var(--st-primary);
        }

        /* ===== آپلود موسیقی ===== */
        .st-upload-area {
            border: 2px dashed var(--st-line);
            border-radius: var(--st-radius-m);
            padding: 24px;
            text-align: center;
            cursor: pointer;
            transition: all .25s ease;
            background: var(--st-card-2);
        }
        .st-upload-area:hover {
            border-color: var(--st-primary);
            background: var(--st-primary-l);
        }
        .st-upload-area i {
            font-size: 36px;
            color: var(--st-primary);
            margin-bottom: 10px;
            display: block;
        }
        .st-upload-area h4 {
            margin: 0 0 4px;
            font-size: 15px;
            font-weight: 700;
            color: var(--st-ink);
        }
        .st-upload-area p {
            margin: 0 0 4px;
            font-size: 12px;
            color: var(--st-muted);
        }
        .st-upload-area small {
            font-size: 11px;
            color: var(--st-muted-2);
        }

        /* ===== لیست موسیقی ===== */
        .st-music-list {
            margin-top: 14px;
            max-height: 220px;
            overflow-y: auto;
        }
        .st-music-list::-webkit-scrollbar { width: 5px; }
        .st-music-list::-webkit-scrollbar-thumb { background: var(--st-line); border-radius: 3px; }
        .st-music-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 10px;
            background: var(--st-card);
            border: 1px solid var(--st-line);
            margin-bottom: 6px;
            transition: all .2s ease;
        }
        .st-music-item:hover {
            border-color: var(--st-primary);
            background: var(--st-primary-l);
        }
        .st-music-item-icon {
            width: 32px; height: 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, var(--st-cyan), #0891b2);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            flex-shrink: 0;
        }
        .st-music-item-info {
            flex: 1;
            min-width: 0;
        }
        .st-music-item-name {
            font-size: 13px;
            font-weight: 700;
            color: var(--st-ink);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .st-music-item-size {
            font-size: 11px;
            color: var(--st-muted);
        }
        .st-music-item-del {
            width: 30px; height: 30px;
            border-radius: 8px;
            border: none;
            background: transparent;
            color: var(--st-muted-2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: all .2s ease;
        }
        .st-music-item-del:hover {
            background: rgba(244,63,94,.1);
            color: var(--st-rose);
        }

        /* ===== select استایل‌دار ===== */
        .st-select {
            width: 100%;
            padding: 11px 14px;
            border: 1.5px solid var(--st-line);
            border-radius: var(--st-radius-s);
            background: var(--st-card);
            color: var(--st-ink);
            font-family: inherit;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            outline: none;
            transition: all .2s ease;
        }
        .st-select:focus {
            border-color: var(--st-primary);
            box-shadow: 0 0 0 3px rgba(67,97,238,.12);
        }

        /* ===== input استایل‌دار ===== */
        .st-input {
            width: 100%;
            padding: 11px 14px;
            border: 1.5px solid var(--st-line);
            border-radius: var(--st-radius-s);
            background: var(--st-card);
            color: var(--st-ink);
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            outline: none;
            transition: all .2s ease;
        }
        .st-input:focus {
            border-color: var(--st-primary);
            box-shadow: 0 0 0 3px rgba(67,97,238,.12);
        }
        .st-input::placeholder { color: var(--st-muted-2); }

        /* ===== کارت درباره ===== */
        .st-about {
            text-align: center;
            padding: 28px 20px;
            background: linear-gradient(135deg, var(--st-primary-l), var(--st-card-2));
            border-radius: var(--st-radius-m);
            border: 1px solid var(--st-line);
        }
        .st-about-logo {
            width: 72px; height: 72px;
            margin: 0 auto 14px;
            border-radius: 20px;
            background: linear-gradient(135deg, var(--st-primary), var(--st-primary-d));
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            box-shadow: 0 8px 20px rgba(67,97,238,.3);
        }
        .st-about h4 {
            margin: 0 0 6px;
            font-size: 20px;
            font-weight: 800;
            color: var(--st-ink);
        }
        .st-about p {
            margin: 0 0 4px;
            font-size: 13px;
            color: var(--st-slate-600);
        }
        .st-about-version {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 999px;
            background: var(--st-card);
            border: 1px solid var(--st-line);
            font-size: 12px;
            font-weight: 700;
            color: var(--st-primary);
            margin-top: 8px;
        }
        .st-about-social {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 16px;
        }
        .st-social-link {
            width: 38px; height: 38px;
            border-radius: 10px;
            background: var(--st-card);
            border: 1px solid var(--st-line);
            color: var(--st-slate-600);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: all .25s ease;
            text-decoration: none;
        }
        .st-social-link:hover {
            transform: translateY(-2px);
            border-color: var(--st-primary);
            color: var(--st-primary);
        }

        /* ===== آمار برنامه ===== */
        .st-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
        }
        .st-stat {
            padding: 14px;
            background: var(--st-card-2);
            border: 1px solid var(--st-line);
            border-radius: var(--st-radius-s);
            text-align: center;
        }
        .st-stat-icon {
            font-size: 22px;
            margin-bottom: 6px;
        }
        .st-stat-value {
            font-size: 22px;
            font-weight: 800;
            color: var(--st-ink);
        }
        .st-stat-label {
            font-size: 11px;
            color: var(--st-muted);
            font-weight: 600;
            margin-top: 2px;
        }

        /* ===== ریسپانسیو ===== */
        @media (max-width: 768px) {
            .st-header { padding: 22px 20px; }
            .st-header h2 { font-size: 19px; }
            .st-header-icon { width: 44px; height: 44px; font-size: 18px; }
            .st-group { padding: 18px 16px; }
            .st-item { flex-direction: column; align-items: stretch; gap: 10px; }
            .st-item-info { width: 100%; }
            .st-actions { flex-direction: column; }
            .st-btn { width: 100%; justify-content: center; }
            .st-music-top { flex-direction: column; align-items: stretch; }
            .st-music-controls { justify-content: center; }
            /* موسیقی در موبایل کوچک‌تر */
            .st-music-player { padding: 14px; }
            .st-music-art { width: 44px; height: 44px; font-size: 18px; border-radius: 12px; }
            .st-music-track { font-size: 13px; }
            .st-music-artist { font-size: 11px; }
            .st-music-btn { width: 34px; height: 34px; font-size: 12px; border-radius: 10px; }
            .st-music-btn.play-pause { width: 38px; height: 38px; }
            .st-music-progress { margin-top: 10px; }
            .st-music-time { font-size: 10px; }
            .st-music-volume { margin-top: 8px; }
            .st-upload-area { padding: 16px; }
            .st-upload-area i { font-size: 28px; }
            .st-upload-area h4 { font-size: 14px; }
        }
        @media (max-width: 640px) {
            /* آیتم‌های موسیقی آپلود شده — فشرده‌تر در موبایل */
            .st-music-item {
                padding: 8px 10px;
                gap: 8px;
                border-radius: 10px;
                margin-bottom: 5px;
            }
            .st-music-item-icon {
                width: 28px; height: 28px;
                border-radius: 7px;
                font-size: 11px;
            }
            .st-music-item-name { font-size: 12px; }
            .st-music-item-size { font-size: 10px; }
            .st-music-item-del { width: 26px; height: 26px; font-size: 11px; }
            .st-music-list { max-height: 180px; }
        }
        @media (max-width: 480px) {
            .st-theme-grid { grid-template-columns: 1fr; }
            .st-font-grid { flex-direction: column; }
            .st-font-btn { width: 100%; text-align: center; }
        }
    `;
};

/* ============================================================
   رندر تنظیمات (نسخه پریمیوم ۲۰۲۵)
   ============================================================ */
GermanDictionary.prototype.renderSettings = function() {
    // تزریق استایل‌ها
    this._injectSettingsProStyles();

    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    const theme = localStorage.getItem('theme') || 'default';
    const isGerman = LanguageSystem.isGerman();

    // مودال قفل (فقط یک بار)
    if (!document.getElementById('lock-modal')) {
        const modalHTML = `
            <div id="lock-modal" class="modal-overlay" style="display: none; z-index: 999999;">
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-lock"></i> ورود به دیکشنری</h3>
                    </div>
                    <div class="modal-body">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <i class="fas fa-graduation-cap" style="font-size: 50px; color: var(--primary);"></i>
                            <p style="margin-top: 10px;">لطفاً رمز عبور را وارد کنید</p>
                        </div>
                        <input type="password" id="unlock-password" class="form-control" placeholder="رمز عبور..." style="text-align: center; font-size: 18px; padding: 12px;">
                        <div id="unlock-error" style="color: #ef4444; text-align: center; margin-top: 10px; display: none;"></div>
                    </div>
                    <div class="modal-footer">
                        <button id="unlock-btn" class="btn btn-primary btn-block" style="width: 100%;">
                            <i class="fas fa-unlock-alt"></i> ورود
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const container = document.getElementById('settings-section');
    if (!container) return;

    // تم‌های رنگی
    const themes = [
        { id: 'default', name: 'پیش‌فرض', grad: 'linear-gradient(135deg, #4361ee, #3a0ca3)' },
        { id: 'blue', name: 'آبی', grad: 'linear-gradient(135deg, #3b82f6, #1e40af)' },
        { id: 'green', name: 'سبز', grad: 'linear-gradient(135deg, #10b981, #047857)' },
        { id: 'purple', name: 'بنفش', grad: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
        { id: 'orange', name: 'نارنجی', grad: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        { id: 'pink', name: 'صورتی', grad: 'linear-gradient(135deg, #ec4899, #be185d)' }
    ];

    container.innerHTML = `
        <div class="st-wrap">
            <!-- هدر -->
            <div class="st-header">
                <div class="st-header-inner">
                    <div class="st-header-icon">
                        <i class="fas fa-sliders"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h2>تنظیمات برنامه</h2>
                        <p>شخصی‌سازی ظاهر، مدیریت داده‌ها و امنیت</p>
                    </div>
                </div>
            </div>

            <!-- ========== بخش ظاهر برنامه ========== -->
            <div class="st-group">
                <div class="st-group-header">
                    <div class="st-group-icon ic-appearance">
                        <i class="fas fa-palette"></i>
                    </div>
                    <div>
                        <div class="st-group-title">ظاهر برنامه</div>
                        <div class="st-group-desc">حالت نمایش، اندازه فونت و پوسته رنگی</div>
                    </div>
                </div>

                <!-- حالت تاریک -->
                <div class="st-item">
                    <div class="st-item-info">
                        <div class="st-item-icon">
                            <i class="fas ${isDarkMode ? 'fa-moon' : 'fa-sun'}"></i>
                        </div>
                        <div class="st-item-text">
                            <div class="st-item-label">حالت تاریک</div>
                            <div class="st-item-hint">${isDarkMode ? 'فعلاً فعال است' : 'فعلاً غیرفعال است'}</div>
                        </div>
                    </div>
                    <button id="dark-mode-toggle-btn" class="st-switch ${isDarkMode ? 'active' : ''}" aria-label="حالت تاریک"></button>
                </div>
            </div>

            <!-- ========== پوسته‌های رنگی ========== -->
            <div class="st-group">
                <div class="st-group-header">
                    <div class="st-group-icon ic-theme">
                        <i class="fas fa-swatchbook"></i>
                    </div>
                    <div>
                        <div class="st-group-title">پوسته‌های رنگی</div>
                        <div class="st-group-desc">رنگ اصلی برنامه را انتخاب کنید</div>
                    </div>
                </div>
                <div class="st-theme-grid">
                    ${themes.map(t => `
                        <div class="st-theme-card ${theme === t.id ? 'active' : ''}" data-theme="${t.id}">
                            <div class="st-theme-preview" style="background: ${t.grad};"></div>
                            <div class="st-theme-name">${t.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- ========== تنظیمات تمرین ========== -->
            <div class="st-group">
                <div class="st-group-header">
                    <div class="st-group-icon ic-practice">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div>
                        <div class="st-group-title">تنظیمات تمرین</div>
                        <div class="st-group-desc">تعداد لغات و زمان تمرین</div>
                    </div>
                </div>

                <div class="st-item">
                    <div class="st-item-info">
                        <div class="st-item-icon"><i class="fas fa-list-ol"></i></div>
                        <div class="st-item-text">
                            <div class="st-item-label">تعداد لغات در هر تمرین</div>
                            <div class="st-item-hint">چند لغت در هر جلسه تمرین نمایش داده شود</div>
                        </div>
                    </div>
                    <select id="practice-count-setting" class="st-select" style="max-width: 140px;">
                        <option value="10">۱۰ لغت</option>
                        <option value="20">۲۰ لغت</option>
                        <option value="30">۳۰ لغت</option>
                        <option value="50">۵۰ لغت</option>
                    </select>
                </div>

                <div class="st-item">
                    <div class="st-item-info">
                        <div class="st-item-icon"><i class="fas fa-clock"></i></div>
                        <div class="st-item-text">
                            <div class="st-item-label">زمان مطالعه هر لغت</div>
                            <div class="st-item-hint">مدت زمان نمایش هر لغت در حالت مطالعه</div>
                        </div>
                    </div>
                    <select id="study-time-setting" class="st-select" style="max-width: 140px;">
                        <option value="3">۳ ثانیه</option>
                        <option value="5">۵ ثانیه</option>
                        <option value="7">۷ ثانیه</option>
                        <option value="10">۱۰ ثانیه</option>
                        <option value="15">۱۵ ثانیه</option>
                    </select>
                </div>
            </div>

            <!-- ========== مدیریت موسیقی ========== -->
            <div class="st-group">
                <div class="st-group-header">
                    <div class="st-group-icon ic-music">
                        <i class="fas fa-music"></i>
                    </div>
                    <div>
                        <div class="st-group-title">مدیریت موسیقی</div>
                        <div class="st-group-desc">موسیقی زمینه هنگام مطالعه</div>
                    </div>
                </div>

                <!-- پلیر -->
                <div class="st-music-player">
                    <div class="st-music-top">
                        <div class="st-music-art">
                            <i class="fas fa-headphones"></i>
                        </div>
                        <div class="st-music-info">
                            <div class="st-music-track" id="player-track-name">هیچ آهنگی در حال پخش نیست</div>
                            <div class="st-music-artist">LINGO.Dictionary</div>
                        </div>
                        <div class="st-music-controls">
                            <button id="player-prev-btn" class="st-music-btn" title="قبلی"><i class="fas fa-backward"></i></button>
                            <button id="player-play-pause-btn" class="st-music-btn play-pause" title="پخش/توقف"><i class="fas fa-play"></i></button>
                            <button id="player-next-btn" class="st-music-btn" title="بعدی"><i class="fas fa-forward"></i></button>
                            <button id="player-stop-btn" class="st-music-btn" title="توقف"><i class="fas fa-stop"></i></button>
                        </div>
                    </div>
                    <div class="st-music-progress">
                        <span class="st-music-time" id="current-time-display">00:00</span>
                        <div class="st-music-bar" id="progress-bar">
                            <div class="st-music-bar-fill" id="progress-fill"></div>
                        </div>
                        <span class="st-music-time" id="total-time-display">00:00</span>
                    </div>
                    <div class="st-music-volume">
                        <i class="fas fa-volume-down"></i>
                        <input type="range" id="player-volume-slider" min="0" max="100" value="50">
                        <i class="fas fa-volume-up"></i>
                        <span class="st-music-time" id="volume-percent">50%</span>
                    </div>
                </div>

                <!-- آپلود -->
                <div class="st-upload-area" id="music-upload-area">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <h4>آپلود موسیقی</h4>
                    <p>فایل‌های صوتی را اینجا رها کنید یا کلیک کنید</p>
                    <small>پشتیبانی از MP3, WAV, OGG</small>
                    <input type="file" id="music-upload" accept="audio/*,image/*" multiple style="display: none;">
                </div>

                <!-- لیست موسیقی -->
                <div class="st-music-list" id="uploaded-music-list"></div>

                <!-- انتخاب موسیقی زمینه -->
                <div class="st-item" style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--st-line);">
                    <div class="st-item-info">
                        <div class="st-item-icon"><i class="fas fa-volume-up"></i></div>
                        <div class="st-item-text">
                            <div class="st-item-label">موسیقی زمینه</div>
                            <div class="st-item-hint">نوع موسیقی هنگام مطالعه</div>
                        </div>
                    </div>
                    <select id="background-music" class="st-select" style="max-width: 200px;">
                        <option value="none">بدون موسیقی</option>
                        <option value="uploaded">🎵 موسیقی آپلود شده</option>
                        <option value="calm">🌊 آرامش‌بخش</option>
                        <option value="focus">🎯 تمرکز</option>
                        <option value="classical">🎻 کلاسیک</option>
                    </select>
                </div>
            </div>

            <!-- ========== مدیریت داده‌ها ========== -->
            <div class="st-group">
                <div class="st-group-header">
                    <div class="st-group-icon ic-data">
                        <i class="fas fa-database"></i>
                    </div>
                    <div>
                        <div class="st-group-title">مدیریت داده‌ها</div>
                        <div class="st-group-desc">پشتیبان‌گیری، بازیابی و خروجی</div>
                    </div>
                </div>
                <div class="st-actions">
                    <button class="st-btn st-btn-primary" id="export-data-btn">
                        <i class="fas fa-download"></i> صدور داده‌ها (بکاپ)
                    </button>
                    <button class="st-btn" id="import-data-btn">
                        <i class="fas fa-upload"></i> ورود داده‌ها
                    </button>
                    <button class="st-btn" id="export-german-words-btn">
                        <i class="fas fa-file-alt"></i> ذخیره لغات (TXT)
                    </button>
                    <button class="st-btn st-btn-emerald" id="export-words-to-image-btn">
                        <i class="fas fa-images"></i> خروجی تصویری لغات
                    </button>
                    <button class="st-btn st-btn-danger" id="reset-data-btn">
                        <i class="fas fa-trash"></i> بازنشانی برنامه
                    </button>
                </div>
            </div>



            <!-- ========== امنیت ========== -->
            <div class="st-group">
                <div class="st-group-header">
                    <div class="st-group-icon ic-security">
                        <i class="fas fa-shield-halved"></i>
                    </div>
                    <div>
                        <div class="st-group-title">امنیت و قفل</div>
                        <div class="st-group-desc">محافظت از دیکشنری با رمز عبور</div>
                    </div>
                </div>

                <div class="st-item">
                    <div class="st-item-info">
                        <div class="st-item-icon"><i class="fas fa-lock"></i></div>
                        <div class="st-item-text">
                            <div class="st-item-label">وضعیت قفل</div>
                            <div class="st-item-hint" id="lock-status-text">قفل غیرفعال است</div>
                        </div>
                    </div>
                </div>

                <div class="st-item" style="flex-direction: column; align-items: stretch;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;">
                        <div>
                            <label style="font-size: 12px; font-weight: 700; color: var(--st-slate-600); margin-bottom: 6px; display: block;">رمز عبور جدید</label>
                            <input type="password" id="set-password" class="st-input" placeholder="رمز عبور...">
                        </div>
                        <div>
                            <label style="font-size: 12px; font-weight: 700; color: var(--st-slate-600); margin-bottom: 6px; display: block;">تکرار رمز عبور</label>
                            <input type="password" id="confirm-password" class="st-input" placeholder="تکرار رمز...">
                        </div>
                    </div>
                    <div class="st-actions" style="margin-top: 14px;">
                        <button class="st-btn st-btn-primary" id="save-password-btn">
                            <i class="fas fa-save"></i> ذخیره رمز
                        </button>
                        <button class="st-btn st-btn-danger" id="remove-password-btn">
                            <i class="fas fa-trash"></i> حذف رمز
                        </button>
                    </div>
                </div>
            </div>

            <!-- ========== نگهداری ========== -->
            <div class="st-group">
                <div class="st-group-header">
                    <div class="st-group-icon ic-maintenance">
                        <i class="fas fa-broom"></i>
                    </div>
                    <div>
                        <div class="st-group-title">نگهداری برنامه</div>
                        <div class="st-group-desc">پاکسازی کش و رفع مشکلات</div>
                    </div>
                </div>
                <div class="st-item">
                    <div class="st-item-info">
                        <div class="st-item-icon"><i class="fas fa-sync-alt"></i></div>
                        <div class="st-item-text">
                            <div class="st-item-label">پاکسازی کش</div>
                            <div class="st-item-hint">رفع مشکلات نمایشی و اعمال آخرین تغییرات</div>
                        </div>
                    </div>
                    <button class="st-btn st-btn-amber" id="clear-cache-btn">
                        <i class="fas fa-sync-alt"></i> پاکسازی
                    </button>
                </div>
            </div>

            <!-- ========== آمار برنامه ========== -->
            <div class="st-group">
                <div class="st-group-header">
                    <div class="st-group-icon ic-info">
                        <i class="fas fa-chart-pie"></i>
                    </div>
                    <div>
                        <div class="st-group-title">آمار برنامه</div>
                        <div class="st-group-desc">نمای کلی از داده‌های شما</div>
                    </div>
                </div>
                <div class="st-stats" id="st-stats-grid">
                    <div class="st-stat">
                        <div class="st-stat-icon" style="color: var(--st-primary);"><i class="fas fa-book"></i></div>
                        <div class="st-stat-value" id="st-stat-words">--</div>
                        <div class="st-stat-label">لغت</div>
                    </div>
                    <div class="st-stat">
                        <div class="st-stat-icon" style="color: var(--st-amber);"><i class="fas fa-star"></i></div>
                        <div class="st-stat-value" id="st-stat-favs">--</div>
                        <div class="st-stat-label">علاقه‌مندی</div>
                    </div>
                    <div class="st-stat">
                        <div class="st-stat-icon" style="color: var(--st-emerald);"><i class="fas fa-folder"></i></div>
                        <div class="st-stat-value" id="st-stat-tags">--</div>
                        <div class="st-stat-label">پوشه</div>
                    </div>
                    <div class="st-stat">
                        <div class="st-stat-icon" style="color: var(--st-violet);"><i class="fas fa-book-bookmark"></i></div>
                        <div class="st-stat-value" id="st-stat-books">--</div>
                        <div class="st-stat-label">کتاب</div>
                    </div>
                </div>
            </div>

            <!-- ========== درباره برنامه ========== -->
            <div class="st-group">
                <div class="st-group-header">
                    <div class="st-group-icon ic-info">
                        <i class="fas fa-circle-info"></i>
                    </div>
                    <div>
                        <div class="st-group-title">درباره برنامه</div>
                        <div class="st-group-desc">اطلاعات نسخه و توسعه‌دهنده</div>
                    </div>
                </div>
                <div class="st-about">
                    <div class="st-about-logo">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <h4>LINGO.Dictionary</h4>
                    <p>دیکشنری هوشمند آلمانی-فارسی</p>
                    <p>طراحی و توسعه توسط Elias Hussaini</p>
                    <div class="st-about-version">
                        <i class="fas fa-code-branch"></i> نسخه ۳.۰.۰
                    </div>
                    <div class="st-about-social">
                        <a href="#" class="st-social-link" aria-label="GitHub"><i class="fab fa-github"></i></a>
                        <a href="#" class="st-social-link" aria-label="Telegram"><i class="fab fa-telegram"></i></a>
                        <a href="#" class="st-social-link" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // راه‌اندازی event listenerها
    this.setupSettingsEventListeners();
    this.setupMusicUploadEventListeners();
    this.renderUploadedMusicList();
    this.setupPasswordLock();
    this.setupMusicControls();
    this._setupNewSettingsEvents();
    this._loadSettingsStats();
};

/* ============================================================
   راه‌اندازی رویدادهای جدید (تنظیمات تمرین)
   ============================================================ */
GermanDictionary.prototype._setupNewSettingsEvents = function() {
    const self = this;

    // بارگذاری مقادیر ذخیره شده
    const practiceCount = localStorage.getItem('practiceCount') || '10';
    const studyTime = localStorage.getItem('studyTimePerWord') || '5';

    const practiceSelect = document.getElementById('practice-count-setting');
    const studySelect = document.getElementById('study-time-setting');

    if (practiceSelect) {
        practiceSelect.value = practiceCount;
        practiceSelect.onchange = () => {
            localStorage.setItem('practiceCount', practiceSelect.value);
            self.showToast(`✅ تعداد لغات تمرین: ${practiceSelect.options[practiceSelect.selectedIndex].text}`, 'success');
        };
    }

    if (studySelect) {
        studySelect.value = studyTime;
        studySelect.onchange = () => {
            localStorage.setItem('studyTimePerWord', studySelect.value);
            self.showToast(`✅ زمان مطالعه: ${studySelect.options[studySelect.selectedIndex].text}`, 'success');
        };
    }
};

/* ============================================================
   بارگذاری آمار برای بخش تنظیمات
   ============================================================ */
GermanDictionary.prototype._loadSettingsStats = async function() {
    const self = this;
    try {
        const words = await this.getAllWords();
        const favCount = this.favorites ? this.favorites.size : 0;
        const tagCount = this.tags ? this.tags.size : 0;
        let bookCount = 0;
        try { bookCount = (await this.getAllBooksFromIndexedDB()).length; } catch(e) {}

        const faNum = n => String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

        const el = id => document.getElementById(id);
        if (el('st-stat-words')) el('st-stat-words').textContent = faNum(words.length);
        if (el('st-stat-favs')) el('st-stat-favs').textContent = faNum(favCount);
        if (el('st-stat-tags')) el('st-stat-tags').textContent = faNum(tagCount);
        if (el('st-stat-books')) el('st-stat-books').textContent = faNum(bookCount);
    } catch(err) {
        console.error('خطا در بارگذاری آمار:', err);
    }
};

/* ============================================================
   راه‌اندازی event listenerهای تنظیمات
   ============================================================ */
GermanDictionary.prototype.setupSettingsEventListeners = function() {

// ========== پاک کردن کش Service Worker ==========
const clearCacheBtn = document.getElementById('clear-cache-btn');
if (clearCacheBtn) {
    const newBtn = clearCacheBtn.cloneNode(true);
    clearCacheBtn.parentNode.replaceChild(newBtn, clearCacheBtn);
    
    newBtn.onclick = async () => {
        if (confirm('⚠️ آیا از پاک کردن کش و به‌روزرسانی برنامه مطمئن هستید؟')) {
            const originalHtml = newBtn.innerHTML;
            newBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i><span>در حال...</span>';
            newBtn.disabled = true;
            newBtn.style.opacity = '0.7';
            
            try {
                if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(key => caches.delete(key)));
                }
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(registrations.map(reg => reg.unregister()));
                }
                setTimeout(() => window.location.reload(true), 500);
            } catch (error) {
                newBtn.innerHTML = originalHtml;
                newBtn.disabled = false;
                newBtn.style.opacity = '1';
                alert('❌ خطا در پاک کردن کش');
            }
        }
    };
}
    // ========== دکمه حالت تاریک ==========
    const darkModeBtn = document.getElementById('dark-mode-toggle-btn');
    if (darkModeBtn) {
        darkModeBtn.onclick = () => {
            const isDark = document.body.classList.contains('dark-mode');
            if (isDark) {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
                darkModeBtn.innerHTML = '<i class="fas fa-sun"></i><span>روشن</span>';
                darkModeBtn.classList.remove('active');
            } else {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
                darkModeBtn.innerHTML = '<i class="fas fa-moon"></i><span>تاریک</span>';
                darkModeBtn.classList.add('active');
            }
            this.showToast(isDark ? '☀️ حالت روشن فعال شد' : '🌙 حالت تاریک فعال شد', 'success');
        };
    }
    
  const fontOptions = document.querySelectorAll('.font-size-option');
    fontOptions.forEach(btn => {
        btn.onclick = () => {
            const size = btn.dataset.size;
            localStorage.setItem('fontSize', size);
            
            fontOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // اعمال فونت با کلاس روی body
            document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge', 'font-xxlarge');
            document.body.classList.add(`font-${size}`);
            
            // اعمال مستقیم روی html و body
            const fontSizeMap = {
                small: '14px',
                medium: '16px',
                large: '18px',
                xlarge: '20px',
                xxlarge: '22px'
            };
            const newSize = fontSizeMap[size];
            
            document.documentElement.style.fontSize = newSize;
            document.body.style.fontSize = newSize;
            
            // اعمال روی همه المان‌ها با استفاده از CSS inherit
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                if (el.style.fontSize) {
                    el.style.fontSize = '';
                }
            });
            
            this.showToast(`✅ اندازه فونت به ${btn.textContent} تغییر کرد`, 'success');
        };
    });
    // ========== پوسته‌های رنگی ==========
    document.querySelectorAll('.st-theme-card').forEach(option => {
        option.addEventListener('click', (e) => {
            const theme = e.currentTarget.dataset.theme;
            this.applyTheme(theme);
        });
    });
    // دکمه خروجی تصویری لغات
document.getElementById('export-words-to-image-btn')?.addEventListener('click', () => {
    this.showExportWordsModal();
});

    // ========== مدیریت داده‌ها ==========
    document.getElementById('export-data-btn')?.addEventListener('click', () => {
        this.exportData();
    });
    
    document.getElementById('import-data-btn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => this.importData(e.target.files[0]);
        input.click();
    });
    
    document.getElementById('export-german-words-btn')?.addEventListener('click', () => {
        this.exportGermanWordsToTxt();
    });
    
    document.getElementById('reset-data-btn')?.addEventListener('click', () => {
        if (confirm('⚠️ آیا مطمئن هستید؟ تمام داده‌های برنامه حذف خواهند شد و قابل بازگشت نیست!')) {
            this.resetData();
        }
    });


};

GermanDictionary.prototype.showExportWordsModal = async function() {
    const words = await this.getAllWords();
    const modal = document.getElementById('export-words-modal');
    const container = document.getElementById('export-words-list');
    
    if (!modal || !container) return;
    
    // خواندن تنظیمات از localStorage
    this.exportSettings = {
        theme: localStorage.getItem('exportTheme') || 'light',
        showGender: localStorage.getItem('exportShowGender') !== 'false',
        showType: localStorage.getItem('exportShowType') !== 'false',
        headerTitle: localStorage.getItem('exportHeaderTitle') || 'LINGO.Dictionary'
    };
    
    // مقداردهی اولیه
    this.selectedWordsForExport = [];
    this.allWordsForExport = [...words];
    this.filteredWordsForExport = [...words];  // برای جستجو
    
    // مرتب‌سازی اولیه الفبایی
    this.applyExportSort(this.filteredWordsForExport, 'alphabetical');
    
    // هدر مودال
    const modalHeader = modal.querySelector('.export-modal-header');
    if (modalHeader) {
        modalHeader.innerHTML = `
            <h3 style="display: flex; align-items: center; gap: 10px; margin: 0;">
                <span style="font-size: 20px;">🖼️</span>
                خروجی تصویری لغات
            </h3>
            <button class="export-modal-close" id="close-export-modal-btn" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 18px; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;">
                ✕
            </button>
        `;
        const newCloseBtn = modalHeader.querySelector('#close-export-modal-btn');
        if (newCloseBtn) newCloseBtn.onclick = () => modal.style.display = 'none';
    }
    
    // رندر
    this.renderExportWordsList();
    this.renderExportToolbar(modal);
    this.addTagFilterToExportModal();
    this.updateSelectedCountDisplay();
    
    // دکمه‌ها
    document.getElementById('select-all-words').onclick = () => {
        document.querySelectorAll('.export-word-item').forEach(item => {
            if (!item.classList.contains('selected')) item.click();
        });
    };
    
    document.getElementById('deselect-all-words').onclick = () => {
        document.querySelectorAll('.export-word-item').forEach(item => {
            if (item.classList.contains('selected')) item.click();
        });
    };
    
    document.getElementById('select-weak-words').onclick = () => {
        document.querySelectorAll('.export-word-item').forEach(item => {
            const wordId = parseInt(item.dataset.id);
            const level = this.srsData[wordId]?.level || 0;
            const isWeak = level <= 2;
            const isSelected = item.classList.contains('selected');
            if (isWeak && !isSelected) item.click();
            else if (!isWeak && isSelected) item.click();
        });
    };
    
    document.getElementById('preview-export-btn').onclick = () => {
        if (this.selectedWordsForExport.length === 0) {
            this.showToast('❌ لطفاً حداقل یک لغت را انتخاب کنید', 'warning');
            return;
        }
        this.showExportPreview();
    };
    
    document.getElementById('cancel-export-btn').onclick = () => {
        modal.style.display = 'none';
    };
    
    modal.style.display = 'flex';
};

GermanDictionary.prototype.renderExportToolbar = function(modal) {
    const existingToolbar = modal.querySelector('.export-toolbar');
    if (existingToolbar) existingToolbar.remove();
    
    const toolbar = document.createElement('div');
    toolbar.className = 'export-toolbar';
    toolbar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 12px; padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; align-items: center;';
    
    // خواندن مقادیر ذخیره شده
    const savedWordsPerPage = localStorage.getItem('exportWordsPerPage') || '10';
    const savedSort = localStorage.getItem('exportSortBy') || 'alphabetical';
    const savedTheme = localStorage.getItem('exportTheme') || 'light';
    const savedShowGender = localStorage.getItem('exportShowGender') !== 'false';
    const savedShowType = localStorage.getItem('exportShowType') !== 'false';
    
    toolbar.innerHTML = `
        <input type="text" id="export-search-input" placeholder="🔍 جستجوی لغت..." style="padding: 8px 12px; border-radius: 12px; border: 1px solid #ddd; flex: 1; min-width: 150px;">
        
        <select id="export-sort-select" style="padding: 8px 12px; border-radius: 12px; border: 1px solid #ddd;">
            <option value="alphabetical" ${savedSort === 'alphabetical' ? 'selected' : ''}>📖 الفبایی (آلمانی)</option>
            <option value="alphabetical-persian" ${savedSort === 'alphabetical-persian' ? 'selected' : ''}>📖 الفبایی (فارسی)</option>
            <option value="date-desc" ${savedSort === 'date-desc' ? 'selected' : ''}>🆕 جدیدترین</option>
            <option value="date-asc" ${savedSort === 'date-asc' ? 'selected' : ''}>📅 قدیمی‌ترین</option>
            <option value="random" ${savedSort === 'random' ? 'selected' : ''}>🎲 تصادفی</option>
        </select>
        
        <select id="export-words-per-page" style="padding: 8px 12px; border-radius: 12px; border: 1px solid #ddd;">
            <option value="5" ${savedWordsPerPage === '5' ? 'selected' : ''}>۵ لغت در صفحه</option>
            <option value="10" ${savedWordsPerPage === '10' ? 'selected' : ''}>۱۰ لغت در صفحه</option>
            <option value="15" ${savedWordsPerPage === '15' ? 'selected' : ''}>۱۵ لغت در صفحه</option>
            <option value="20" ${savedWordsPerPage === '20' ? 'selected' : ''}>۲۰ لغت در صفحه</option>
            <option value="30" ${savedWordsPerPage === '30' ? 'selected' : ''}>۳۰ لغت در صفحه</option>
        </select>
        
        <select id="export-theme-select" style="padding: 8px 12px; border-radius: 12px; border: 1px solid #ddd;">
            <option value="light" ${savedTheme === 'light' ? 'selected' : ''}>☀️ روشن</option>
            <option value="dark" ${savedTheme === 'dark' ? 'selected' : ''}>🌙 تاریک</option>
            <option value="blue" ${savedTheme === 'blue' ? 'selected' : ''}>💙 آبی</option>
            <option value="green" ${savedTheme === 'green' ? 'selected' : ''}>💚 سبز</option>
            <option value="purple" ${savedTheme === 'purple' ? 'selected' : ''}>💜 بنفش</option>
            <option value="orange" ${savedTheme === 'orange' ? 'selected' : ''}>🧡 نارنجی</option>
            <option value="pink" ${savedTheme === 'pink' ? 'selected' : ''}>💗 صورتی</option>
        </select>
        
        <label style="display: flex; align-items: center; gap: 5px;">
            <input type="checkbox" id="export-show-gender" ${savedShowGender ? 'checked' : ''}> جنسیت
        </label>
        <label style="display: flex; align-items: center; gap: 5px;">
            <input type="checkbox" id="export-show-type" ${savedShowType ? 'checked' : ''}> نوع کلمه
        </label>
    `;
    
    modal.querySelector('.export-modal-body').insertBefore(toolbar, modal.querySelector('.export-words-list'));
    
    // ========== رویداد جستجو ==========
    const searchInput = document.getElementById('export-search-input');
    let searchTimeout;
    searchInput.oninput = (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            this.filterExportWordsList(e.target.value);
        }, 300);
    };
    
 // ========== رویداد سورت (ذخیره خودکار و اعمال روی لیست) ==========
const sortSelect = document.getElementById('export-sort-select');
sortSelect.onchange = () => {
    const sortBy = sortSelect.value;
    localStorage.setItem('exportSortBy', sortBy);
    this.applyExportSort(this.filteredWordsForExport, sortBy);
    this.renderExportWordsList();
    this.showToast(`✓ مرتب‌سازی به ${sortSelect.options[sortSelect.selectedIndex].text} تغییر کرد`, 'success');
};

// مقداردهی اولیه سورت از localStorage وقتی صفحه باز میشه
if (savedSort) {
    this.applyExportSort(this.filteredWordsForExport, savedSort);
    this.renderExportWordsList();
}
    
    // ========== رویداد تعداد لغت در صفحه ==========
    const wordsPerPage = document.getElementById('export-words-per-page');
    wordsPerPage.onchange = () => {
        localStorage.setItem('exportWordsPerPage', wordsPerPage.value);
        this.showToast(`✓ تعداد لغت در صفحه به ${wordsPerPage.value} تغییر کرد`, 'success');
    };
    
    // ========== رویدادهای آپدیت خودکار ==========
    const themeSelect = document.getElementById('export-theme-select');
    const showGenderCheck = document.getElementById('export-show-gender');
    const showTypeCheck = document.getElementById('export-show-type');
    
    themeSelect.onchange = () => {
        this.exportSettings.theme = themeSelect.value;
        localStorage.setItem('exportTheme', this.exportSettings.theme);
        if (this.exportPages && this.exportPages.length > 0) {
            this.renderPreviewPageWithTheme(this.currentPreviewPage);
        }
        this.showToast(`✓ تم به ${themeSelect.options[themeSelect.selectedIndex].text} تغییر کرد`, 'success');
    };
    
    showGenderCheck.onchange = () => {
        this.exportSettings.showGender = showGenderCheck.checked;
        localStorage.setItem('exportShowGender', this.exportSettings.showGender);
        if (this.exportPages && this.exportPages.length > 0) {
            this.renderPreviewPageWithTheme(this.currentPreviewPage);
        }
        this.showToast(`✓ نمایش جنسیت ${showGenderCheck.checked ? 'فعال' : 'غیرفعال'} شد`, 'success');
    };
    
    showTypeCheck.onchange = () => {
        this.exportSettings.showType = showTypeCheck.checked;
        localStorage.setItem('exportShowType', this.exportSettings.showType);
        if (this.exportPages && this.exportPages.length > 0) {
            this.renderPreviewPageWithTheme(this.currentPreviewPage);
        }
        this.showToast(`✓ نمایش نوع کلمه ${showTypeCheck.checked ? 'فعال' : 'غیرفعال'} شد`, 'success');
    };
};

GermanDictionary.prototype.filterExportWordsList = function(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
        this.filteredWordsForExport = [...this.allWordsForExport];
    } else {
        this.filteredWordsForExport = this.allWordsForExport.filter(word => 
            word.german.toLowerCase().includes(searchTerm) || 
            word.persian.toLowerCase().includes(searchTerm)
        );
    }
    
    // اعمال سورت فعلی
    const sortSelect = document.getElementById('export-sort-select');
    if (sortSelect) {
        this.applyExportSort(this.filteredWordsForExport, sortSelect.value);
    }
    
    this.renderExportWordsList();
};

GermanDictionary.prototype.applySortToFilteredWords = function(words, sortType) {
    if (sortType === 'date-desc') {
        // جدیدترین: بر اساس id (بزرگترین اول) - چون id از Date.now ساخته شده
        words.sort((a, b) => b.id - a.id);
    } 
    else if (sortType === 'date-asc') {
        // قدیمی‌ترین: بر اساس id (کوچکترین اول)
        words.sort((a, b) => a.id - b.id);
    }
    else if (sortType === 'alphabetical') {
        words.sort((a, b) => a.german.localeCompare(b.german, 'de'));
    }
    else if (sortType === 'alphabetical-persian') {
        words.sort((a, b) => a.persian.localeCompare(b.persian, 'fa'));
    }
    else if (sortType === 'srs-level') {
        words.sort((a, b) => (this.srsData[b.id]?.level || 0) - (this.srsData[a.id]?.level || 0));
    }
    else if (sortType === 'tag') {
        words.sort((a, b) => {
            const tagsA = this.getTagsForWord(a.id);
            const tagsB = this.getTagsForWord(b.id);
            if (tagsA.length !== tagsB.length) return tagsB.length - tagsA.length;
            if (tagsA.length > 0 && tagsB.length > 0) {
                return tagsA[0].name.localeCompare(tagsB[0].name, 'fa');
            }
            return 0;
        });
    }
    else if (sortType === 'random') {
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
    }
    return words;
};

GermanDictionary.prototype.applyExportSort = function(words, sortBy) {
    switch(sortBy) {
        case 'alphabetical':
            words.sort((a, b) => a.german.localeCompare(b.german, 'de'));
            break;
        case 'alphabetical-persian':
            words.sort((a, b) => a.persian.localeCompare(b.persian, 'fa'));
            break;
        case 'date-desc':
            words.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'date-asc':
            words.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'random':
            words.sort(() => Math.random() - 0.5);
            break;
    }
    return words;
};

GermanDictionary.prototype.renderExportWordsList = function() {
    const container = document.getElementById('export-words-list');
    if (!container) return;
    
    // استفاده از filteredWordsForExport که مقداردهی شده
    const wordsToShow = this.filteredWordsForExport || this.allWordsForExport || [];
    
    container.innerHTML = wordsToShow.map(word => {
        let genderHtml = '';
        if (word.gender) {
            let genderText = '';
            let genderColor = '';
            if (word.gender === 'masculine') {
                genderText = 'der';
                genderColor = '#3b82f6';
            } else if (word.gender === 'feminine') {
                genderText = 'die';
                genderColor = '#ec4899';
            } else if (word.gender === 'neuter') {
                genderText = 'das';
                genderColor = '#10b981';
            }
            genderHtml = `<span class="badge-sm" style="background: ${genderColor};">${genderText}</span>`;
        }
        
        let typeHtml = '';
        if (word.type) {
            let typeText = this.getTypeLabel(word.type);
            let typeColor = '';
            if (word.type === 'noun') typeColor = '#8b5cf6';
            else if (word.type === 'verb') typeColor = '#f59e0b';
            else if (word.type === 'adjective') typeColor = '#06b6d4';
            else if (word.type === 'adverb') typeColor = '#84cc16';
            else typeColor = '#6b7280';
            typeHtml = `<span class="badge-sm" style="background: ${typeColor};">${typeText}</span>`;
        }
        
        return `
            <div class="export-word-item" data-id="${word.id}" data-selected="false">
                <div class="word-info">
                    <div class="word-german">${this.escapeHtml(word.german)}</div>
                    <div class="word-persian">${this.escapeHtml(word.persian)}</div>
                    <div class="word-badges">
                        ${typeHtml}
                        ${genderHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // رویداد کلیک
    document.querySelectorAll('.export-word-item').forEach(item => {
        const wordId = parseInt(item.dataset.id);
        const word = this.allWordsForExport.find(w => w.id === wordId);
        
        item.onclick = (e) => {
            e.preventDefault();
            const isSelected = item.classList.contains('selected');
            
            if (isSelected) {
                item.classList.remove('selected');
                item.dataset.selected = 'false';
                const index = this.selectedWordsForExport.findIndex(w => w.id === wordId);
                if (index !== -1) this.selectedWordsForExport.splice(index, 1);
            } else {
                item.classList.add('selected');
                item.dataset.selected = 'true';
                if (word && !this.selectedWordsForExport.find(w => w.id === wordId)) {
                    this.selectedWordsForExport.push(word);
                }
            }
            
            this.updateSelectedCountDisplay();
        };
    });
};

GermanDictionary.prototype.updateSelectedCountDisplay = function() {
    const countSpan = document.getElementById('selected-count');
    if (countSpan) {
        countSpan.textContent = this.selectedWordsForExport.length;
    }
};

GermanDictionary.prototype.collectSelectedWords = function() {
    const checkboxes = document.querySelectorAll('.word-checkbox:checked');
    this.selectedWordsForExport = [];
    checkboxes.forEach(cb => {
        const wordId = parseInt(cb.dataset.id);
        const word = this.allWordsForExport.find(w => w.id === wordId);
        if (word) this.selectedWordsForExport.push(word);
    });
};

GermanDictionary.prototype.applyExportSort = function(words, sortBy) {
    switch(sortBy) {
        case 'alphabetical':
            words.sort((a, b) => a.german.localeCompare(b.german, 'de'));
            break;
        case 'alphabetical-persian':
            words.sort((a, b) => a.persian.localeCompare(b.persian, 'fa'));
            break;
        case 'srs-level':
            words.sort((a, b) => (this.srsData[b.id]?.level || 0) - (this.srsData[a.id]?.level || 0));
            break;
        case 'date-desc':
            words.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'date-asc':
            words.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'random':
            words.sort(() => Math.random() - 0.5);
            break;
    }
    return words;
};

GermanDictionary.prototype.showExportPreview = function() {
    console.log('🖼️ شروع پیش‌نمایش...');
    
    if (!this.selectedWordsForExport || this.selectedWordsForExport.length === 0) {
        this.showToast('❌ هیچ لغتی انتخاب نشده است', 'warning');
        return;
    }
    
    const wordsPerPage = parseInt(localStorage.getItem('exportWordsPerPage') || '10');
    const pages = [];
    
    for (let i = 0; i < this.selectedWordsForExport.length; i += wordsPerPage) {
        pages.push(this.selectedWordsForExport.slice(i, i + wordsPerPage));
    }
    
    this.exportPages = pages;
    this.currentPreviewPage = 0;
    
    const modal = document.getElementById('preview-modal');
    const container = document.getElementById('preview-container');
    
    if (!modal || !container) {
        console.error('❌ مودال یا کانتینر پیدا نشد');
        return;
    }
    
    // تم‌های رنگی
    const themes = [
        { id: 'default', name: 'پیش‌فرض', grad: 'linear-gradient(135deg, #4361ee, #3a0ca3)' },
        { id: 'blue', name: 'آبی', grad: 'linear-gradient(135deg, #3b82f6, #1e40af)' },
        { id: 'green', name: 'سبز', grad: 'linear-gradient(135deg, #10b981, #047857)' },
        { id: 'purple', name: 'بنفش', grad: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
        { id: 'orange', name: 'نارنجی', grad: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        { id: 'pink', name: 'صورتی', grad: 'linear-gradient(135deg, #ec4899, #be185d)' }
    ];

    container.innerHTML = `
        <div class="preview-navbar">
            <div>
                <button id="preview-prev-page" class="btn-nav" ${pages.length <= 1 ? 'disabled' : ''}>◀ قبلی</button>
                <button id="preview-next-page" class="btn-nav" ${pages.length <= 1 ? 'disabled' : ''}>بعدی ▶</button>
            </div>
            <div class="preview-page-info">صفحه <span id="preview-page-num">1</span> از ${pages.length}</div>
            <div class="preview-page-info">📊 ${this.selectedWordsForExport.length} لغت</div>
        </div>
        <div id="preview-pages-container"></div>
    `;
    
    this.renderPreviewPageWithTheme(0);
    this.setupPreviewNavigation();
    
    modal.style.display = 'flex';
    
   // دکمه تایید نهایی - مطمئن شو که پیدا میشه
const confirmBtn = document.getElementById('confirm-export-btn');
if (confirmBtn) {
    // حذف رویداد قبلی
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  newConfirmBtn.onclick = () => {
    console.log('✅ دکمه دانلود کلیک شد');
    this.generateAndDownloadImagesWithTheme();
};
}
    
    const backBtn = document.getElementById('back-to-select-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    const closeBtn = document.getElementById('close-preview-modal');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
};

GermanDictionary.prototype.getThemeColors = function(theme) {
    const themes = {
        light: { primary: '#4361ee', primaryDark: '#3a56d4', bg: '#ffffff', text: '#1f2937', border: '#e5e7eb', headerBg: 'linear-gradient(135deg, #667eea, #764ba2)' },
        dark: { primary: '#60a5fa', primaryDark: '#3b82f6', bg: '#1e293b', text: '#f1f5f9', border: '#334155', headerBg: 'linear-gradient(135deg, #1e40af, #5b21b6)' },
        blue: { primary: '#3b82f6', primaryDark: '#2563eb', bg: '#eff6ff', text: '#1e3a8a', border: '#bfdbfe', headerBg: 'linear-gradient(135deg, #3b82f6, #1e40af)' },
        green: { primary: '#10b981', primaryDark: '#059669', bg: '#ecfdf5', text: '#064e3b', border: '#a7f3d0', headerBg: 'linear-gradient(135deg, #10b981, #065f46)' },
        purple: { primary: '#8b5cf6', primaryDark: '#6d28d9', bg: '#f5f3ff', text: '#4c1d95', border: '#ddd6fe', headerBg: 'linear-gradient(135deg, #8b5cf6, #5b21b6)' },
        orange: { primary: '#f59e0b', primaryDark: '#d97706', bg: '#fffbeb', text: '#78350f', border: '#fde68a', headerBg: 'linear-gradient(135deg, #f59e0b, #b45309)' },
        pink: { primary: '#ec4899', primaryDark: '#db2777', bg: '#fdf2f8', text: '#831843', border: '#fbcfe8', headerBg: 'linear-gradient(135deg, #ec4899, #be185d)' }
    };
    return themes[theme] || themes.light;
};

GermanDictionary.prototype.renderPreviewPageWithTheme = function(pageIndex) {
    const words = this.exportPages[pageIndex];
    const container = document.getElementById('preview-pages-container');
    const theme = this.exportSettings.theme || 'light';
    const showGender = this.exportSettings.showGender !== false;
    const showType = this.exportSettings.showType !== false;
    
    let html = `
        <div class="preview-page ${theme}-theme">
            <div class="preview-page-header">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">📋</span>
                    <span class="preview-title editable-title" data-page="${pageIndex}" style="cursor: pointer;" onclick="dictionaryApp.startEditTitle(this)">${this.escapeHtml(this.exportSettings.headerTitle || 'LINGO.Dictionary')}</span>
                    <input type="text" class="edit-title-input" data-page="${pageIndex}" style="display: none; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); border-radius: 8px; padding: 4px 12px; color: white; font-family: Vazirmatn; font-weight: 700; font-size: 16px;">
                </div>
                <div class="preview-page-num">صفحه ${pageIndex + 1} از ${this.exportPages.length}</div>
            </div>
            
            <table class="preview-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>🇩🇪 لغت آلمانی</th>
                        <th>🇮🇷 معنی فارسی</th>
                        ${showGender ? '<th>جنسیت</th>' : ''}
                        ${showType ? '<th>نوع</th>' : ''}
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${this.escapeHtml(word.german)}</td>
                <td>${this.escapeHtml(word.persian)}</td>
        `;
        
        if (showGender) {
            if (word.gender) {
                let genderText = '';
                let genderColor = '';
                if (word.gender === 'masculine') {
                    genderText = 'der';
                    genderColor = '#3b82f6';
                } else if (word.gender === 'feminine') {
                    genderText = 'die';
                    genderColor = '#ec4899';
                } else if (word.gender === 'neuter') {
                    genderText = 'das';
                    genderColor = '#10b981';
                }
                html += `<td style="text-align: center;"><span style="display: inline-block; background: ${genderColor}; color: white; padding: 5px 14px; border-radius: 30px; font-size: 12px; font-weight: 700; min-width: 55px;">${genderText}</span></td>`;
            } else {
                html += `<td style="text-align: center;">-</td>`;
            }
        }
        
        if (showType) {
            let typeText = this.getTypeLabel(word.type || 'other');
            let typeColor = '';
            if (word.type === 'noun') typeColor = '#8b5cf6';
            else if (word.type === 'verb') typeColor = '#f59e0b';
            else if (word.type === 'adjective') typeColor = '#06b6d4';
            else if (word.type === 'adverb') typeColor = '#84cc16';
            else typeColor = '#6b7280';
            
            html += `<td style="text-align: center;"><span style="display: inline-block; background: ${typeColor}; color: white; padding: 5px 14px; border-radius: 30px; font-size: 12px; font-weight: 600;">${typeText}</span></td>`;
        }
        
        html += `</tr>`;
    }
    
    html += `
                </tbody>
            </table>
            
            <div class="preview-footer">
                <div>📅 ${new Date().toLocaleDateString('fa-IR')}</div>
                <div>📖 LINGO.Dictionary - دیکشنری هوشمند آلمانی-فارسی</div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
};

GermanDictionary.prototype.saveHeaderTitleFromPreview = function(newTitle, pageIndex) {
    if (newTitle && newTitle.trim()) {
        this.exportSettings.headerTitle = newTitle.trim();
        localStorage.setItem('exportHeaderTitle', this.exportSettings.headerTitle);
        
        // مخفی کردن input و نمایش متن جدید
        const input = document.getElementById(`edit-title-input-${pageIndex}`);
        const titleSpan = document.getElementById(`preview-title-text-${pageIndex}`);
        if (input) input.style.display = 'none';
        if (titleSpan) {
            titleSpan.style.display = 'inline-block';
            titleSpan.textContent = this.escapeHtml(this.exportSettings.headerTitle);
        }
        
        this.showToast('✓ عنوان صفحه ذخیره شد', 'success');
    }
};

GermanDictionary.prototype.startEditTitle = function(element) {
    const parent = element.parentElement;
    const input = parent.querySelector('.edit-title-input');
    const currentTitle = element.textContent;
    
    if (!input) return;
    
    // مخفی کردن span و نمایش input
    element.style.display = 'none';
    input.style.display = 'inline-block';
    input.value = currentTitle;
    input.focus();
    input.select();
    
    // تابع ذخیره عنوان
    const saveTitle = () => {
        const newTitle = input.value.trim();
        if (newTitle) {
            this.exportSettings.headerTitle = newTitle;
            localStorage.setItem('exportHeaderTitle', newTitle);
            element.textContent = newTitle;
            this.showToast('✓ عنوان صفحه ذخیره شد', 'success');
        }
        element.style.display = 'inline-block';
        input.style.display = 'none';
        
        // رفرش پیش‌نمایش
        if (this.exportPages && this.exportPages.length > 0) {
            this.renderPreviewPageWithTheme(this.currentPreviewPage);
        }
    };
    
    // ذخیره با زدن اینتر (کیبورد) یا با کلیک بیرون (موبایل)
    input.onblur = saveTitle;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            saveTitle();
        }
    };
    
    // برای موبایل: دکمه Done رو هم در نظر بگیر
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Done') {
            e.preventDefault();
            saveTitle();
        }
    });
};

GermanDictionary.prototype.setupPreviewNavigation = function() {
    const prevBtn = document.getElementById('preview-prev-page');
    const nextBtn = document.getElementById('preview-next-page');
    const pageNumSpan = document.getElementById('preview-page-num');
    
    if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        
        newPrevBtn.onclick = () => {
            if (this.currentPreviewPage > 0) {
                this.currentPreviewPage--;
                this.renderPreviewPageWithTheme(this.currentPreviewPage);
                if (pageNumSpan) pageNumSpan.textContent = this.currentPreviewPage + 1;
                
                // بروزرسانی وضعیت دکمه‌ها
                const prevBtnNew = document.getElementById('preview-prev-page');
                const nextBtnNew = document.getElementById('preview-next-page');
                if (prevBtnNew) prevBtnNew.disabled = this.currentPreviewPage === 0;
                if (nextBtnNew) nextBtnNew.disabled = this.currentPreviewPage === this.exportPages.length - 1;
            }
        };
    }
    
    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        
        newNextBtn.onclick = () => {
            if (this.currentPreviewPage < this.exportPages.length - 1) {
                this.currentPreviewPage++;
                this.renderPreviewPageWithTheme(this.currentPreviewPage);
                if (pageNumSpan) pageNumSpan.textContent = this.currentPreviewPage + 1;
                
                // بروزرسانی وضعیت دکمه‌ها
                const prevBtnNew = document.getElementById('preview-prev-page');
                const nextBtnNew = document.getElementById('preview-next-page');
                if (prevBtnNew) prevBtnNew.disabled = this.currentPreviewPage === 0;
                if (nextBtnNew) nextBtnNew.disabled = this.currentPreviewPage === this.exportPages.length - 1;
            }
        };
    }
};

GermanDictionary.prototype.generateAndDownloadImagesWithTheme = async function() {
    const totalPages = this.exportPages.length;
    let successCount = 0;
    
    this.showSimpleLoadingSpinner();
    
    for (let i = 0; i < totalPages; i++) {
        const pageNumSpan = document.querySelector('#preview-page-num');
        if (pageNumSpan) pageNumSpan.textContent = i + 1;
        
        this.renderPreviewPageWithTheme(i);
        await new Promise(r => setTimeout(r, 100));
        
        const pageElement = document.querySelector('#preview-pages-container .preview-page');
        if (!pageElement) continue;
        
        // اصلاح رنگ متن لغات آلمانی قبل از عکس گرفتن
        const germanWords = pageElement.querySelectorAll('.preview-table td:nth-child(2)');
        const theme = this.exportSettings.theme || 'light';
        germanWords.forEach(cell => {
            if (theme === 'dark') cell.style.color = '#f1f5f9';
            else if (theme === 'blue') cell.style.color = '#1e40af';
            else if (theme === 'green') cell.style.color = '#064e3b';
            else if (theme === 'purple') cell.style.color = '#4c1d95';
            else if (theme === 'orange') cell.style.color = '#78350f';
            else if (theme === 'pink') cell.style.color = '#831843';
            else cell.style.color = '#1e293b';
        });
        
        try {
            const canvas = await html2canvas(pageElement, {
                scale: 3.0,
                backgroundColor: '#ffffff',
                logging: false
            });
            
            const link = document.createElement('a');
            link.download = `LINGO-dictionary-page-${i + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            successCount++;
            await new Promise(r => setTimeout(r, 300));
        } catch(e) {
            console.error(e);
        }
    }
    
    this.hideSimpleLoadingSpinner();
    this.showToast(`✅ ${successCount} تصویر با موفقیت دانلود شد`, 'success');
    
    document.getElementById('preview-modal').style.display = 'none';
    document.getElementById('export-words-modal').style.display = 'none';
};

GermanDictionary.prototype.showSimpleLoadingSpinner = function() {
    const existing = document.getElementById('simple-loading');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.id = 'simple-loading';
    div.innerHTML = `
        <div class="simple-loading-spinner">
            <div class="simple-spinner-ring"></div>
            <div class="simple-spinner-ring-inner"></div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.id = 'simple-loading-style';
    style.textContent = `
        #simple-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(3px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .simple-loading-spinner {
            position: relative;
            width: 70px;
            height: 70px;
        }
        .simple-spinner-ring {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 3px solid transparent;
            border-top-color: #667eea;
            border-right-color: #764ba2;
            border-radius: 50%;
            animation: spinRing 0.8s linear infinite;
        }
        .simple-spinner-ring-inner {
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 3px solid transparent;
            border-top-color: #10b981;
            border-left-color: #f59e0b;
            border-radius: 50%;
            animation: spinRingReverse 1s linear infinite;
        }
        @keyframes spinRing {
            to { transform: rotate(360deg); }
        }
        @keyframes spinRingReverse {
            to { transform: rotate(-360deg); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(div);
};

GermanDictionary.prototype.hideSimpleLoadingSpinner = function() {
    const loading = document.getElementById('simple-loading');
    const style = document.getElementById('simple-loading-style');
    if (loading) loading.remove();
    if (style) style.remove();
};

GermanDictionary.prototype.updatePreviewTableContent = function(pageIndex) {
    const words = this.exportPages[pageIndex];
    const showGender = this.exportSettings.showGender;
    const showType = this.exportSettings.showType;
    const showSRS = this.exportSettings.showSRS;
    const theme = this.getThemeColors(this.exportSettings.theme);
    
    const tbody = document.querySelector('#preview-pages-container .preview-page tbody');
    if (!tbody) return;
    
    tbody.innerHTML = words.map((word, idx) => `
        <tr style="border-bottom: 1px solid ${theme.border};">
            <td style="padding: 10px; text-align: center; font-weight: 600; color: ${theme.primary};">${idx + 1}</td>
            <td style="padding: 10px; font-weight: 600; color: ${theme.primary};">${this.escapeHtml(word.german)}</td>
            <td style="padding: 10px; color: ${theme.text};">${this.escapeHtml(word.persian)}</td>
            ${showGender ? `
            <td style="padding: 10px; text-align: center;">
                ${word.gender ? `<span style="background: ${word.gender === 'masculine' ? '#3b82f6' : word.gender === 'feminine' ? '#ec4899' : '#10b981'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px;">${this.getGenderSymbol(word.gender)}</span>` : '-'}
            </td>
            ` : ''}
            ${showType ? `
            <td style="padding: 10px; text-align: center;">
                <span style="background: ${word.type === 'noun' ? '#3b82f6' : word.type === 'verb' ? '#10b981' : '#f59e0b'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px;">${this.getTypeLabel(word.type)}</span>
            </td>
            ` : ''}
            ${showSRS ? `
            <td style="padding: 10px; text-align: center;">
                <span style="background: ${(this.srsData[word.id]?.level || 0) >= 4 ? '#10b981' : (this.srsData[word.id]?.level || 0) >= 2 ? '#f59e0b' : '#ef4444'}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px;">
                    ${this.srsData[word.id]?.level || 0}
                </span>
            </td>
            ` : ''}
        </tr>
    `).join('');
    
    // آپدیت شماره صفحه در هدر
    const pageNumInHeader = document.querySelector('#preview-pages-container .preview-page > div:first-child > div:last-child');
    if (pageNumInHeader) {
        pageNumInHeader.textContent = `صفحه ${pageIndex + 1} از ${this.exportPages.length}`;
    }
};

GermanDictionary.prototype.applyTheme = function(theme) {
    // حذف همه کلاس‌های تم قبلی
    document.body.classList.remove(
        'blue-theme', 'green-theme', 'purple-theme', 
        'orange-theme', 'pink-theme', 'custom-theme'
    );
    
    // حذف استایل‌های inline قبلی
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--primary-dark');
    document.documentElement.style.removeProperty('--primary-light');
    
    // اعمال تم جدید
    switch(theme) {
        case 'blue':
            document.body.classList.add('blue-theme');
            document.documentElement.style.setProperty('--primary', '#3b82f6');
            document.documentElement.style.setProperty('--primary-dark', '#2563eb');
            document.documentElement.style.setProperty('--primary-light', '#dbeafe');
            break;
            
        case 'green':
            document.body.classList.add('green-theme');
            document.documentElement.style.setProperty('--primary', '#10b981');
            document.documentElement.style.setProperty('--primary-dark', '#059669');
            document.documentElement.style.setProperty('--primary-light', '#d1fae5');
            break;
            
        case 'purple':
            document.body.classList.add('purple-theme');
            document.documentElement.style.setProperty('--primary', '#8b5cf6');
            document.documentElement.style.setProperty('--primary-dark', '#6d28d9');
            document.documentElement.style.setProperty('--primary-light', '#ede9fe');
            break;
            
        case 'orange':
            document.body.classList.add('orange-theme');
            document.documentElement.style.setProperty('--primary', '#f59e0b');
            document.documentElement.style.setProperty('--primary-dark', '#d97706');
            document.documentElement.style.setProperty('--primary-light', '#fef3c7');
            break;
            
        case 'pink':
            document.body.classList.add('pink-theme');
            document.documentElement.style.setProperty('--primary', '#ec4899');
            document.documentElement.style.setProperty('--primary-dark', '#db2777');
            document.documentElement.style.setProperty('--primary-light', '#fce7f3');
            break;
            
        default: // default
            document.documentElement.style.setProperty('--primary', '#4361ee');
            document.documentElement.style.setProperty('--primary-dark', '#3a56d4');
            document.documentElement.style.setProperty('--primary-light', '#eef2ff');
    }
    
    // ذخیره در localStorage
    localStorage.setItem('theme', theme);
    
    // آپدیت کلاس active روی دکمه‌ها
    document.querySelectorAll('.st-theme-card, .theme-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === theme);
    });
    
    
};

GermanDictionary.prototype.translateWithGoogle = async function(text, sourceLang, targetLang) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // استخراج متن ترجمه شده
        let translatedText = '';
        for (const part of data[0]) {
            if (part[0]) {
                translatedText += part[0];
            }
        }
        
        return translatedText || null;
    } catch (error) {
        console.error('Google Translate error:', error);
        return null;
    }
};

GermanDictionary.prototype.getThemeName = function(theme) {
    const names = {
        'default': 'پیش‌فرض',
        'blue': 'آبی',
        'green': 'سبز',
        'purple': 'بنفش',
        'orange': 'نارنجی',
        'pink': 'صورتی'
    };
    return names[theme] || theme;
};

GermanDictionary.prototype.setupColorPickerEventListeners = function() {
        const redSlider = document.getElementById('color-red');
        const greenSlider = document.getElementById('color-green');
        const blueSlider = document.getElementById('color-blue');
        const colorPreview = document.getElementById('color-preview');
        
        if (!redSlider || !greenSlider || !blueSlider || !colorPreview) return;
        
        const updateColorPreview = () => {
            const r = redSlider.value;
            const g = greenSlider.value;
            const b = blueSlider.value;
            colorPreview.style.background = `rgb(${r}, ${g}, ${b})`;
            
            document.getElementById('red-value').textContent = r;
            document.getElementById('green-value').textContent = g;
            document.getElementById('blue-value').textContent = b;
        };
        
        redSlider.addEventListener('input', updateColorPreview);
        greenSlider.addEventListener('input', updateColorPreview);
        blueSlider.addEventListener('input', updateColorPreview);
        
        document.getElementById('apply-custom-color').addEventListener('click', () => {
            const r = parseInt(redSlider.value);
            const g = parseInt(greenSlider.value);
            const b = parseInt(blueSlider.value);
            this.applyCustomColor(r, g, b);
        });
        
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const color = e.currentTarget.dataset.color;
                this.applyHexColor(color);
            });
        });
};

GermanDictionary.prototype.loadCustomization = function() {
        // بارگذاری حالت تاریک
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        

    // ========== بارگذاری اندازه فونت ==========
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge', 'font-xxlarge');
    document.body.classList.add(`font-${fontSize}`);
    
    const fontSizeMap = { 
        small: '14px', 
        medium: '16px', 
        large: '18px',
        xlarge: '20px',
        xxlarge: '22px'
    };
    document.documentElement.style.fontSize = fontSizeMap[fontSize];
    document.body.style.fontSize = fontSizeMap[fontSize];
        
        // بارگذاری پوسته
        const theme = localStorage.getItem('theme');
        if (theme && theme !== 'default') {
            this.applyTheme(theme);
        }
        
        // بارگذاری رنگ سفارشی
        const savedColor = localStorage.getItem('customColor');
        if (savedColor) {
            try {
                this.customColor = JSON.parse(savedColor);
                const { r, g, b } = this.customColor;
                document.documentElement.style.setProperty('--primary', `rgb(${r}, ${g}, ${b})`);
                document.documentElement.style.setProperty('--primary-dark', this.darkenColor(r, g, b, 20));
            } catch (e) {
                console.error('خطا در بارگذاری رنگ سفارشی:', e);
            }
        }
        
      
};

