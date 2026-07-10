/* dict-tag-ui-wordlist.js — Tag UI, Bulk Selection, Word List, Sort, Favorites (lines 3814-5251) */

/* ============================================================
   تزریق استایل‌های پریمیوم پوشه‌ها (یک‌بار)
   ============================================================ */
GermanDictionary.prototype._injectTagManagerProStyles = function() {
    if (document.getElementById('tm-pro-styles')) return;
    const style = document.createElement('style');
    style.id = 'tm-pro-styles';
    style.textContent = `
        /* ===== متغیرهای پریمیوم (هماهنگ با لیست لغات) ===== */
        .tm-wrap {
            --tm-primary: #4361ee;
            --tm-primary-d: #3a56d4;
            --tm-primary-l: #eef2ff;
            --tm-emerald: #10b981;
            --tm-violet: #8b5cf6;
            --tm-amber: #f59e0b;
            --tm-rose: #f43f5e;
            --tm-cyan: #06b6d4;
            --tm-ink: #0f172a;
            --tm-ink-2: #1e293b;
            --tm-slate-600: #475569;
            --tm-muted: #64748b;
            --tm-muted-2: #94a3b8;
            --tm-line: #e2e8f0;
            --tm-line-2: #f1f5f9;
            --tm-card: #ffffff;
            --tm-card-2: #f8fafc;
            --tm-radius: 20px;
            --tm-radius-m: 16px;
            --tm-radius-s: 12px;
            --tm-radius-xs: 8px;
            --tm-shadow-sm: 0 1px 2px rgba(15,23,42,.04);
            --tm-shadow: 0 4px 12px rgba(15,23,42,.06);
            --tm-shadow-md: 0 8px 24px rgba(15,23,42,.08);
            --tm-shadow-lg: 0 20px 50px rgba(15,23,42,.15);
            font-family: 'Vazirmatn', Tahoma, sans-serif;
            color: var(--tm-ink);
            line-height: 1.6;
        }
        body.dark-mode .tm-wrap {
            --tm-ink: #f1f5f9;
            --tm-ink-2: #e2e8f0;
            --tm-slate-600: #cbd5e1;
            --tm-muted: #94a3b8;
            --tm-muted-2: #64748b;
            --tm-line: #1e293b;
            --tm-line-2: #1e293b;
            --tm-card: #1e293b;
            --tm-card-2: #0f172a;
            --tm-primary-l: rgba(67,97,238,.15);
            --tm-shadow-sm: 0 1px 2px rgba(0,0,0,.3);
            --tm-shadow: 0 4px 12px rgba(0,0,0,.3);
            --tm-shadow-md: 0 8px 24px rgba(0,0,0,.35);
            --tm-shadow-lg: 0 20px 50px rgba(0,0,0,.5);
        }
        .tm-wrap i, .tm-wrap i::before,
        .tm-wrap [class^="fa-"]::before, .tm-wrap [class*=" fa-"]::before {
            font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
        }
        .tm-wrap i.fas, .tm-wrap i.fa-solid { font-weight: 900 !important; }
        .tm-wrap i.far, .tm-wrap i.fa-regular { font-weight: 400 !important; }

        /* ===== کانتینر مودال بازطراحی‌شده ===== */
        #tag-manager-modal .modal-content,
        #tag-selection-modal .modal-content {
            background: var(--tm-card, #fff);
            border-radius: var(--tm-radius, 20px) !important;
            overflow: hidden;
            border: 1px solid var(--tm-line, #e2e8f0);
            box-shadow: var(--tm-shadow-lg, 0 20px 50px rgba(15,23,42,.15)) !important;
        }
        body.dark-mode #tag-manager-modal .modal-content,
        body.dark-mode #tag-selection-modal .modal-content {
            background: #1e293b;
        }

        #tag-manager-modal .modal-header,
        #tag-selection-modal .modal-header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #134e4a 100%) !important;
            color: #f8fafc !important;
            padding: 22px 26px !important;
            border: none !important;
            position: relative;
            overflow: hidden;
        }
        #tag-manager-modal .modal-header::before,
        #tag-selection-modal .modal-header::before {
            content: "";
            position: absolute;
            top: -80px; right: -50px;
            width: 220px; height: 220px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(16,185,129,.35), transparent 70%);
            filter: blur(50px);
            pointer-events: none;
        }
        #tag-manager-modal .modal-header::after,
        #tag-selection-modal .modal-header::after {
            content: "";
            position: absolute;
            bottom: -80px; left: -40px;
            width: 200px; height: 200px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(139,92,246,.3), transparent 70%);
            filter: blur(50px);
            pointer-events: none;
        }
        #tag-manager-modal .modal-header h3,
        #tag-selection-modal .modal-header h3 {
            position: relative;
            z-index: 1;
            margin: 0 !important;
            font-size: 18px !important;
            font-weight: 800 !important;
            display: flex;
            align-items: center;
            gap: 10px;
            letter-spacing: -0.3px;
        }
        #tag-manager-modal .modal-header h3 i,
        #tag-selection-modal .modal-header h3 i {
            width: 36px; height: 36px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: rgba(255,255,255,.15);
            backdrop-filter: blur(8px);
            font-size: 15px;
        }
        #tag-manager-modal .modal-header .close-modal,
        #tag-selection-modal .modal-header .close-modal {
            position: relative;
            z-index: 1;
            background: rgba(255,255,255,.15) !important;
            border: none !important;
            color: #fff !important;
            width: 34px; height: 34px;
            border-radius: 10px !important;
            font-size: 20px;
            cursor: pointer;
            transition: all .2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #tag-manager-modal .modal-header .close-modal:hover,
        #tag-selection-modal .modal-header .close-modal:hover {
            background: rgba(255,255,255,.28) !important;
            transform: rotate(90deg);
        }

        #tag-manager-modal .modal-body,
        #tag-selection-modal .modal-body {
            padding: 24px 26px !important;
            background: var(--tm-card, #fff);
        }
        body.dark-mode #tag-manager-modal .modal-body,
        body.dark-mode #tag-selection-modal .modal-body {
            background: #1e293b;
        }
        #tag-manager-modal .modal-footer,
        #tag-selection-modal .modal-footer {
            padding: 16px 26px !important;
            background: var(--tm-card-2, #f8fafc);
            border-top: 1px solid var(--tm-line, #e2e8f0);
        }
        body.dark-mode #tag-manager-modal .modal-footer,
        body.dark-mode #tag-selection-modal .modal-footer {
            background: #0f172a;
            border-top-color: #1e293b;
        }

        /* ===== هدر پوشه‌ها: فرم ایجاد ===== */
        .tm-wrap .tag-manager-header {
            background: linear-gradient(135deg, rgba(67,97,238,.06), rgba(139,92,246,.04));
            border: 1px solid var(--tm-line);
            border-radius: var(--tm-radius-m);
            padding: 16px;
            margin-bottom: 22px;
        }
        .tm-wrap .add-tag-section {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }
        .tm-wrap .add-tag-section .form-control {
            flex: 1;
            min-width: 160px;
            padding: 11px 15px;
            border: 1.5px solid var(--tm-line);
            border-radius: var(--tm-radius-s);
            background: var(--tm-card);
            color: var(--tm-ink);
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            outline: none;
            transition: all .25s ease;
        }
        .tm-wrap .add-tag-section .form-control::placeholder { color: var(--tm-muted-2); }
        .tm-wrap .add-tag-section .form-control:focus {
            border-color: var(--tm-primary);
            box-shadow: 0 0 0 4px rgba(67,97,238,.12);
        }
        .tm-wrap .tag-color-picker {
            width: 48px;
            height: 48px;
            padding: 4px;
            border: 1.5px solid var(--tm-line);
            border-radius: var(--tm-radius-s);
            background: var(--tm-card);
            cursor: pointer;
            flex-shrink: 0;
        }
        .tm-wrap .add-tag-section .btn-primary {
            padding: 12px 20px;
            border-radius: var(--tm-radius-s);
            background: linear-gradient(135deg, var(--tm-primary), var(--tm-primary-d));
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
            box-shadow: 0 4px 12px rgba(67,97,238,.25);
            flex-shrink: 0;
        }
        .tm-wrap .add-tag-section .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(67,97,238,.35);
        }

        /* ===== هدر لیست پوشه‌ها ===== */
        .tm-wrap .tags-list-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
            padding: 0 4px;
            font-size: 13px;
            font-weight: 700;
            color: var(--tm-slate-600);
        }
        .tm-wrap .tags-list-header span {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .tm-wrap .tags-list-header span i { color: var(--tm-primary); font-size: 14px; }
        .tm-wrap .tags-list-header .btn-sm {
            padding: 6px 12px;
            border-radius: 8px;
            background: var(--tm-card-2);
            border: 1px solid var(--tm-line);
            color: var(--tm-slate-600);
            cursor: pointer;
            font-family: inherit;
            font-size: 12px;
            font-weight: 600;
            transition: all .2s ease;
        }
        .tm-wrap .tags-list-header .btn-sm:hover {
            border-color: var(--tm-primary);
            color: var(--tm-primary);
            transform: rotate(180deg);
        }

        /* ===== گرید پوشه‌ها (ریسپانسیو) ===== */
        .tm-wrap .tags-list-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
            margin-bottom: 24px;
        }
        @media (min-width: 640px) {
            .tm-wrap .tags-list-container { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 900px) {
            .tm-wrap .tags-list-container { grid-template-columns: repeat(3, 1fr); }
        }

        /* ===== کارت پوشه ===== */
        .tm-wrap .tag-item {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 14px 16px;
            background: var(--tm-card);
            border: 1px solid var(--tm-line);
            border-radius: var(--tm-radius-s);
            box-shadow: var(--tm-shadow-sm);
            transition: all .25s cubic-bezier(.22,1,.36,1);
            overflow: hidden;
        }
        .tm-wrap .tag-item::before {
            content: "";
            position: absolute;
            top: 0; bottom: 0;
            right: 0;
            width: 4px;
            background: var(--tm-tag-color, var(--tm-primary));
        }
        .tm-wrap .tag-item:hover {
            transform: translateY(-2px);
            box-shadow: var(--tm-shadow-md);
            border-color: var(--tm-tag-color, var(--tm-primary));
        }
        .tm-wrap .tag-info {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            min-width: 0;
        }
        .tm-wrap .tag-color-dot {
            width: 26px; height: 26px;
            border-radius: 8px;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,.12);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 11px;
        }
        .tm-wrap .tag-color-dot::after {
            content: "\\f07b"; /* fa-folder */
            font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome";
            font-weight: 900;
        }
        .tm-wrap .tag-name {
            font-size: 14px;
            font-weight: 700;
            color: var(--tm-ink);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .tm-wrap .tag-word-count {
            font-size: 12px;
            color: var(--tm-muted);
            font-weight: 600;
            flex-shrink: 0;
            padding: 2px 8px;
            background: var(--tm-line-2);
            border-radius: 999px;
        }
        .tm-wrap .tag-actions {
            display: flex;
            gap: 6px;
            flex-shrink: 0;
        }
        .tm-wrap .tag-action-btn {
            width: 30px; height: 30px;
            border-radius: 8px;
            border: 1px solid var(--tm-line);
            background: var(--tm-card-2);
            color: var(--tm-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            transition: all .2s ease;
        }
        .tm-wrap .tag-action-btn.edit-tag:hover {
            background: rgba(67,97,238,.1);
            border-color: var(--tm-primary);
            color: var(--tm-primary);
            transform: translateY(-1px);
        }
        .tm-wrap .tag-action-btn.delete-tag:hover {
            background: rgba(244,63,94,.1);
            border-color: var(--tm-rose);
            color: var(--tm-rose);
            transform: translateY(-1px);
        }

        .tm-wrap .empty-state-tags {
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px 20px;
            color: var(--tm-muted);
            font-size: 13px;
            font-weight: 600;
            background: var(--tm-card-2);
            border: 1px dashed var(--tm-line);
            border-radius: var(--tm-radius-s);
        }

        /* ===== بخش انتخاب دسته‌جمعی ===== */
        .tm-wrap .bulk-tag-section {
            background: var(--tm-card-2);
            border: 1px solid var(--tm-line);
            border-radius: var(--tm-radius-m);
            padding: 18px;
            margin-top: 8px;
        }
        .tm-wrap .bulk-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 14px;
            padding-bottom: 14px;
            border-bottom: 1px dashed var(--tm-line);
        }
        .tm-wrap .bulk-header h4 {
            margin: 0;
            font-size: 14px;
            font-weight: 700;
            color: var(--tm-ink);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .tm-wrap .bulk-header h4 i { color: var(--tm-primary); font-size: 13px; }
        .tm-wrap .bulk-selection-controls {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }
        .tm-wrap .bulk-selection-controls .btn-sm {
            padding: 7px 12px;
            border-radius: 8px;
            background: var(--tm-card);
            border: 1px solid var(--tm-line);
            color: var(--tm-slate-600);
            cursor: pointer;
            font-family: inherit;
            font-size: 12px;
            font-weight: 600;
            transition: all .2s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        .tm-wrap .bulk-selection-controls .btn-sm:hover {
            border-color: var(--tm-primary);
            color: var(--tm-primary);
            background: var(--tm-primary-l);
        }
        .tm-wrap .bulk-range-inputs {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 14px;
            flex-wrap: wrap;
        }
        .tm-wrap .range-input-wrapper {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
            width: 100%;
        }
        .tm-wrap .range-input {
            flex: 1;
            min-width: 90px;
            padding: 9px 12px;
            border: 1.5px solid var(--tm-line);
            border-radius: 10px;
            background: var(--tm-card);
            color: var(--tm-ink);
            font-family: inherit;
            font-size: 13px;
            outline: none;
            transition: all .2s ease;
        }
        .tm-wrap .range-input:focus {
            border-color: var(--tm-primary);
            box-shadow: 0 0 0 3px rgba(67,97,238,.12);
        }
        .tm-wrap .range-separator {
            color: var(--tm-muted);
            font-weight: 700;
        }
        .tm-wrap .bulk-search {
            margin-bottom: 14px;
        }
        .tm-wrap .bulk-search .form-control {
            width: 100%;
            padding: 10px 14px;
            border: 1.5px solid var(--tm-line);
            border-radius: 10px;
            background: var(--tm-card);
            color: var(--tm-ink);
            font-family: inherit;
            font-size: 13px;
            outline: none;
            transition: all .2s ease;
        }
        .tm-wrap .bulk-search .form-control:focus {
            border-color: var(--tm-primary);
            box-shadow: 0 0 0 3px rgba(67,97,238,.12);
        }
        .tm-wrap .bulk-words-list {
            max-height: 280px;
            overflow-y: auto;
            border: 1px solid var(--tm-line);
            border-radius: 10px;
            background: var(--tm-card);
            padding: 6px;
        }
        .tm-wrap .bulk-words-list::-webkit-scrollbar { width: 6px; }
        .tm-wrap .bulk-words-list::-webkit-scrollbar-track { background: transparent; }
        .tm-wrap .bulk-words-list::-webkit-scrollbar-thumb { background: var(--tm-line); border-radius: 3px; }
        .tm-wrap .bulk-word-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all .15s ease;
            font-size: 13px;
        }
        .tm-wrap .bulk-word-item:hover { background: var(--tm-line-2); }
        .tm-wrap .bulk-word-checkbox {
            width: 18px; height: 18px;
            cursor: pointer;
            accent-color: var(--tm-primary);
            flex-shrink: 0;
        }
        .tm-wrap .bulk-word-number {
            font-size: 11px;
            color: var(--tm-muted);
            font-weight: 700;
            min-width: 28px;
            text-align: center;
            padding: 2px 6px;
            background: var(--tm-line-2);
            border-radius: 6px;
            flex-shrink: 0;
        }
        .tm-wrap .bulk-word-german {
            font-weight: 700;
            color: var(--tm-ink);
            direction: ltr;
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .tm-wrap .bulk-word-persian {
            color: var(--tm-muted);
            font-size: 12px;
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .tm-wrap .favorite-star {
            color: #f59e0b;
            font-size: 12px;
            flex-shrink: 0;
        }
        .tm-wrap .empty-bulk-words {
            text-align: center;
            padding: 30px;
            color: var(--tm-muted);
            font-size: 13px;
        }
        .tm-wrap .bulk-pagination {
            display: flex;
            justify-content: center;
            gap: 4px;
            margin-top: 12px;
            flex-wrap: wrap;
        }
        .tm-wrap .bulk-page-btn {
            min-width: 32px;
            height: 32px;
            padding: 0 8px;
            border-radius: 7px;
            border: 1px solid var(--tm-line);
            background: var(--tm-card);
            color: var(--tm-slate-600);
            font-family: inherit;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all .2s ease;
        }
        .tm-wrap .bulk-page-btn:hover:not(:disabled):not(.active) {
            border-color: var(--tm-primary);
            color: var(--tm-primary);
        }
        .tm-wrap .bulk-page-btn.active {
            background: linear-gradient(135deg, var(--tm-primary), var(--tm-primary-d));
            border-color: transparent;
            color: #fff;
        }
        .tm-wrap .bulk-page-btn:disabled { opacity: .4; cursor: not-allowed; }
        .tm-wrap .bulk-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-top: 14px;
            padding-top: 14px;
            border-top: 1px dashed var(--tm-line);
            flex-wrap: wrap;
        }
        .tm-wrap .bulk-selected-info {
            font-size: 12px;
            font-weight: 700;
            color: var(--tm-primary);
            padding: 6px 12px;
            background: var(--tm-primary-l);
            border-radius: 999px;
        }
        .tm-wrap .bulk-actions {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
        }
        .tm-wrap .bulk-actions select {
            padding: 8px 12px;
            border: 1.5px solid var(--tm-line);
            border-radius: 8px;
            background: var(--tm-card);
            color: var(--tm-ink);
            font-family: inherit;
            font-size: 13px;
            outline: none;
            cursor: pointer;
        }
        .tm-wrap .bulk-actions .btn-success,
        .tm-wrap .bulk-actions .btn-danger {
            padding: 8px 14px;
            border-radius: 8px;
            border: none;
            color: #fff;
            font-family: inherit;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all .2s ease;
        }
        .tm-wrap .bulk-actions .btn-success {
            background: linear-gradient(135deg, #10b981, #059669);
            box-shadow: 0 3px 10px rgba(16,185,129,.25);
        }
        .tm-wrap .bulk-actions .btn-danger {
            background: linear-gradient(135deg, #f43f5e, #e11d48);
            box-shadow: 0 3px 10px rgba(244,63,94,.25);
        }
        .tm-wrap .bulk-actions .btn-success:hover,
        .tm-wrap .bulk-actions .btn-danger:hover {
            transform: translateY(-1px);
            filter: brightness(1.08);
        }

        /* ===== مودال انتخاب پوشه (برای هر لغت) ===== */
        .tm-wrap .tag-selection-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 400px;
            overflow-y: auto;
            padding: 4px;
        }
        .tm-wrap .tag-select-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 12px 14px;
            background: var(--tm-card);
            border: 1px solid var(--tm-line);
            border-radius: var(--tm-radius-s);
            transition: all .2s ease;
        }
        .tm-wrap .tag-select-item:hover {
            border-color: var(--tm-primary);
            background: var(--tm-primary-l);
        }
        .tm-wrap .tag-select-info {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            min-width: 0;
        }
        .tm-wrap .tag-select-info .tag-color-dot {
            width: 24px; height: 24px;
        }
        .tm-wrap .tag-select-name {
            font-size: 14px;
            font-weight: 700;
            color: var(--tm-ink);
        }
        .tm-wrap .tag-select-count {
            font-size: 12px;
            color: var(--tm-muted);
            font-weight: 600;
        }
        .tm-wrap .tag-select-toggle {
            width: 34px; height: 34px;
            border-radius: 10px;
            border: none;
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            transition: all .2s ease;
            flex-shrink: 0;
        }
        .tm-wrap .tag-select-toggle.active {
            box-shadow: 0 4px 12px rgba(0,0,0,.15);
        }
        .tm-wrap .tag-select-toggle:not(.active) {
            background: var(--tm-line) !important;
        }
        .tm-wrap #create-tag-from-selection {
            margin-top: 16px;
            width: 100%;
            padding: 11px;
            border-radius: 10px;
            background: var(--tm-card-2);
            border: 1.5px dashed var(--tm-line);
            color: var(--tm-slate-600);
            font-family: inherit;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all .2s ease;
        }
        .tm-wrap #create-tag-from-selection:hover {
            border-color: var(--tm-primary);
            color: var(--tm-primary);
            background: var(--tm-primary-l);
        }

        /* ===== ریسپانسیو ===== */
        @media (max-width: 640px) {
            .tm-wrap .add-tag-section { flex-direction: column; align-items: stretch; }
            .tm-wrap .add-tag-section .form-control,
            .tm-wrap .add-tag-section .btn-primary { width: 100%; }
            .tm-wrap .tag-color-picker { align-self: flex-start; }
            .tm-wrap .bulk-header { flex-direction: column; align-items: stretch; }
            .tm-wrap .bulk-footer { flex-direction: column; align-items: stretch; }
            .tm-wrap .bulk-actions { width: 100%; }
            .tm-wrap .bulk-actions select { flex: 1; }
            #tag-manager-modal .modal-content,
            #tag-selection-modal .modal-content { max-width: 95vw !important; }
            #tag-manager-modal .modal-body,
            #tag-selection-modal .modal-body { padding: 18px 16px !important; }
        }
    `;
    document.head.appendChild(style);
};

GermanDictionary.prototype.createTagManagerModal = function() {
    // تزریق استایل‌های پریمیوم
    this._injectTagManagerProStyles();

    if (document.getElementById('tag-manager-modal')) return;

    const modalHTML = `
        <div id="tag-manager-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 920px; max-height: 88vh;">
                <div class="modal-header">
                    <h3><i class="fas fa-folder-tree"></i> مدیریت پوشه‌ها</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body" style="overflow-y: auto;">
                    <div class="tm-wrap" id="tm-wrap-inner"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline close-modal-btn">بستن</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('tag-manager-modal');
    modal.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
        btn.onclick = () => modal.style.display = 'none';
    });
};

GermanDictionary.prototype.showTagManagerModal = function() {
    let modal = document.getElementById('tag-manager-modal');
    if (!modal) {
        this.createTagManagerModal();
        modal = document.getElementById('tag-manager-modal');
    }

    // تزریق استایل‌ها (در صورت نیاز)
    this._injectTagManagerProStyles();

    const tags = this.getAllTags();
    const isGerman = LanguageSystem.isGerman();

    this.getAllWords().then(async allWords => {
        const savedSort = localStorage.getItem('wordListSort') || 'alphabetical';
        this.applySortToFilteredWords(allWords, savedSort);
        this.bulkAllWords = allWords;
        this.bulkFilteredWords = [...allWords];
        this.bulkSelectedWordIds.clear();
        this.bulkCurrentPage = 1;

        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="tm-wrap">
                <div class="tag-manager-header">
                    <div class="add-tag-section">
                        <input type="text" id="new-tag-name" class="form-control" placeholder="${isGerman ? 'نام پوشه جدید...' : 'New folder name...'}">
                        <input type="color" id="new-tag-color" class="tag-color-picker" value="#667eea">
                        <button id="create-tag-btn" class="btn btn-primary">
                            <i class="fas fa-plus"></i> ${isGerman ? 'ایجاد' : 'Create'}
                        </button>
                    </div>
                </div>

                <div class="tags-list-header">
                    <span><i class="fas fa-folder"></i> ${isGerman ? 'پوشه‌های شما' : 'Your Folders'} (${tags.length})</span>
                    <button id="refresh-tags-list" class="btn btn-sm btn-outline"><i class="fas fa-sync-alt"></i></button>
                </div>
                <div class="tags-list-container" id="tags-list-container">
                    ${this.renderTagsListHTML()}
                </div>

                <div class="bulk-tag-section">
                    <div class="bulk-header">
                        <h4><i class="fas fa-layer-group"></i> ${isGerman ? 'انتخاب دسته‌جمعی لغات' : 'Bulk Select Words'}</h4>
                        <div class="bulk-selection-controls">
                            <button id="bulk-select-all" class="btn btn-sm btn-outline">${isGerman ? 'همه' : 'All'}</button>
                            <button id="bulk-select-favorites" class="btn btn-sm btn-outline"><i class="fas fa-star"></i> ${isGerman ? 'علاقه‌مندی‌ها' : 'Favorites'}</button>
                            <button id="bulk-select-range" class="btn btn-sm btn-outline"><i class="fas fa-arrows-alt-h"></i> ${isGerman ? 'محدوده' : 'Range'}</button>
                            <button id="bulk-clear-selection" class="btn btn-sm btn-outline">${isGerman ? 'لغو' : 'Clear'}</button>
                        </div>
                    </div>

                    <div id="bulk-range-inputs" class="bulk-range-inputs" style="display: none;">
                        <div class="range-input-wrapper">
                            <input type="number" id="bulk-range-start" class="form-control range-input" placeholder="${isGerman ? 'از لغت شماره' : 'From word #'}" min="1">
                            <span class="range-separator">-</span>
                            <input type="number" id="bulk-range-end" class="form-control range-input" placeholder="${isGerman ? 'تا لغت شماره' : 'To word #'}" min="1">
                            <button id="bulk-apply-range" class="btn btn-sm btn-primary">${isGerman ? 'اعمال' : 'Apply'}</button>
                        </div>
                    </div>

                    <div class="bulk-search">
                        <input type="text" id="bulk-word-search" class="form-control" placeholder="${isGerman ? 'جستجوی لغت...' : 'Search word...'}">
                    </div>

                    <div class="bulk-words-list" id="bulk-words-list"></div>

                    <div class="bulk-pagination" id="bulk-pagination"></div>

                    <div class="bulk-footer">
                        <div class="bulk-selected-info" id="bulk-selected-info">0 ${isGerman ? 'لغت انتخاب شده' : 'words selected'}</div>
                        <div class="bulk-actions">
                            <select id="bulk-tag-select" class="form-control">
                                <option value="">${isGerman ? '📁 انتخاب پوشه...' : '📁 Select folder...'}</option>
                                ${tags.map(t => `<option value="${t.id}">📂 ${this.escapeHtml(t.name)} (${t.wordCount})</option>`).join('')}
                            </select>
                            <button id="bulk-add-to-tag" class="btn btn-success">
                                <i class="fas fa-plus"></i> ${isGerman ? 'اضافه' : 'Add'}
                            </button>
                            <button id="bulk-remove-from-tag" class="btn btn-danger">
                                <i class="fas fa-trash"></i> ${isGerman ? 'حذف' : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
        this.renderBulkWordsList();
        this.setupTagManagerEvents();
        this.setupBulkSelectionEvents();
    });
};

GermanDictionary.prototype.renderTagsListHTML = function() {
    const tags = this.getAllTags();
    const isGerman = LanguageSystem.isGerman();

    if (tags.length === 0) {
        return `<div class="empty-state-tags"><i class="fas fa-folder-open" style="font-size: 28px; display: block; margin-bottom: 10px; opacity: .5;"></i>${isGerman ? 'هنوز پوشه‌ای نساخته‌اید. از فرم بالا اولین پوشه را بسازید.' : 'No folders yet. Create your first folder above.'}</div>`;
    }

    return tags.map(tag => `
        <div class="tag-item" data-tag-id="${tag.id}" style="--tm-tag-color: ${tag.color};">
            <div class="tag-info">
                <div class="tag-color-dot" style="background: ${tag.color};"></div>
                <div class="tag-name">${this.escapeHtml(tag.name)}</div>
                <div class="tag-word-count">${this._wlFaNum(tag.wordCount)} لغت</div>
            </div>
            <div class="tag-actions">
                <button class="tag-action-btn edit-tag" data-id="${tag.id}" data-name="${this.escapeHtml(tag.name)}" data-color="${tag.color}" title="${isGerman ? 'ویرایش' : 'Edit'}" aria-label="ویرایش">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="tag-action-btn delete-tag" data-id="${tag.id}" title="${isGerman ? 'حذف' : 'Delete'}" aria-label="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
};

GermanDictionary.prototype.setupTagManagerEvents = function() {
    const createBtn = document.getElementById('create-tag-btn');
    if (createBtn) {
        createBtn.onclick = () => {
            const name = document.getElementById('new-tag-name').value.trim();
            const color = document.getElementById('new-tag-color').value;
            if (name) {
                const result = this.createTag(name, color);
                if (result.success) {
                    this.showToast(`✅ پوشه "${name}" ایجاد شد`, 'success');
                    document.getElementById('new-tag-name').value = '';
                    this.showTagManagerModal();
                    this.renderTagFilterBar();
                    this.updatePracticeTagFilter();
                    this.addTagFilterToExportModal();
                    this.renderWordList(); // بروزرسانی لیست لغات
                } else {
                    this.showToast(result.message, 'error');
                }
            }
        };
    }
    
    const refreshBtn = document.getElementById('refresh-tags-list');
    if (refreshBtn) {
        refreshBtn.onclick = () => this.showTagManagerModal();
    }
    
    document.querySelectorAll('.edit-tag').forEach(btn => {
        btn.onclick = () => {
            const tagId = btn.dataset.id;
            const currentName = btn.dataset.name;
            const currentColor = btn.dataset.color;
            
            const newName = prompt('نام جدید:', currentName);
            if (newName && newName.trim()) {
                this.renameTag(tagId, newName);
            }
            
            const newColor = prompt('رنگ جدید (مثل #ff0000):', currentColor);
            if (newColor && newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                this.changeTagColor(tagId, newColor);
            }
            
            this.showTagManagerModal();
            this.renderTagFilterBar();
            this.updatePracticeTagFilter();
            this.addTagFilterToExportModal();
            this.renderWordList();
        };
    });
    
    document.querySelectorAll('.delete-tag').forEach(btn => {
        btn.onclick = async () => {
            const tagId = btn.dataset.id;
            const tag = this.getAllTags().find(t => t.id === tagId);
            if (tag && confirm(`آیا از حذف پوشه "${tag.name}" مطمئن هستید؟`)) {
                this.deleteTag(tagId);
                this.showTagManagerModal();
                this.renderTagFilterBar();
                this.updatePracticeTagFilter();
                this.addTagFilterToExportModal();
                this.renderWordList();
                this.showToast(`🗑️ پوشه "${tag.name}" حذف شد`, 'success');
            }
        };
    });
};

GermanDictionary.prototype.renderBulkWordsList = function() {
    const container = document.getElementById('bulk-words-list');
    if (!container) return;
    
    const searchTerm = document.getElementById('bulk-word-search')?.value.toLowerCase() || '';
    let filtered = this.bulkAllWords;
    
    if (searchTerm) {
        filtered = this.bulkAllWords.filter(w => 
            w.german.toLowerCase().includes(searchTerm) || 
            w.persian.toLowerCase().includes(searchTerm)
        );
    }
    
    this.bulkFilteredWords = filtered;
    const totalPages = Math.ceil(filtered.length / this.bulkWordsPerPage);
    const start = (this.bulkCurrentPage - 1) * this.bulkWordsPerPage;
    const end = start + this.bulkWordsPerPage;
    const pageWords = filtered.slice(start, end);
    
    container.innerHTML = pageWords.map((word, idx) => {
        const globalIndex = start + idx + 1;
        return `
            <label class="bulk-word-item" data-word-id="${word.id}">
                <input type="checkbox" class="bulk-word-checkbox" value="${word.id}" ${this.bulkSelectedWordIds.has(word.id) ? 'checked' : ''}>
                <span class="bulk-word-number">${globalIndex}</span>
                <span class="bulk-word-german">${this.escapeHtml(word.german)}</span>
                <span class="bulk-word-persian">${this.escapeHtml(word.persian)}</span>
                ${this.favorites.has(word.id) ? '<span class="favorite-star"><i class="fas fa-star"></i></span>' : ''}
            </label>
        `;
    }).join('');
    
    if (pageWords.length === 0) {
        container.innerHTML = `<div class="empty-bulk-words">${searchTerm ? 'نتیجه‌ای یافت نشد' : 'هیچ لغتی موجود نیست'}</div>`;
    }
    
    this.renderBulkPagination(totalPages);
    
    document.querySelectorAll('.bulk-word-checkbox').forEach(cb => {
        cb.onchange = (e) => {
            const wordId = parseInt(cb.value);
            if (cb.checked) {
                this.bulkSelectedWordIds.add(wordId);
            } else {
                this.bulkSelectedWordIds.delete(wordId);
            }
            document.getElementById('bulk-selected-info').innerHTML = `${this.bulkSelectedWordIds.size} لغت انتخاب شده`;
        };
    });
};

GermanDictionary.prototype.renderBulkPagination = function(totalPages) {
    const container = document.getElementById('bulk-pagination');
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let pages = [];
    let startPage = Math.max(1, this.bulkCurrentPage - 4);
    let endPage = Math.min(totalPages, startPage + 9);
    
    if (endPage - startPage < 9) {
        startPage = Math.max(1, endPage - 9);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pages.push(`
            <button class="bulk-page-btn ${this.bulkCurrentPage === i ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `);
    }
    
    container.innerHTML = `
        <button class="bulk-page-btn prev" ${this.bulkCurrentPage === 1 ? 'disabled' : ''} data-page="${this.bulkCurrentPage - 1}">
            <i class="fas fa-chevron-right"></i>
        </button>
        ${pages.join('')}
        <button class="bulk-page-btn next" ${this.bulkCurrentPage === totalPages ? 'disabled' : ''} data-page="${this.bulkCurrentPage + 1}">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    document.querySelectorAll('.bulk-page-btn').forEach(btn => {
        btn.onclick = () => {
            const page = parseInt(btn.dataset.page);
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                this.bulkCurrentPage = page;
                this.renderBulkWordsList();
            }
        };
    });
};

GermanDictionary.prototype.setupBulkSelectionEvents = function() {
    const selectRangeBtn = document.getElementById('bulk-select-range');
    const rangeInputs = document.getElementById('bulk-range-inputs');
    
    if (selectRangeBtn && rangeInputs) {
        selectRangeBtn.onclick = () => {
            const isVisible = rangeInputs.style.display === 'flex';
            rangeInputs.style.display = isVisible ? 'none' : 'flex';
            if (!isVisible) {
                setTimeout(() => {
                    document.getElementById('bulk-range-start')?.focus();
                }, 100);
            }
        };
    }
    
    const applyRangeBtn = document.getElementById('bulk-apply-range');
    if (applyRangeBtn) {
        applyRangeBtn.onclick = () => {
            const start = parseInt(document.getElementById('bulk-range-start').value);
            const end = parseInt(document.getElementById('bulk-range-end').value);
            
            if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
                this.showToast('محدوده نامعتبر', 'error');
                return;
            }
            
            const words = this.bulkFilteredWords || this.bulkAllWords;
            for (let i = start - 1; i < Math.min(end, words.length); i++) {
                if (words[i]) this.bulkSelectedWordIds.add(words[i].id);
            }
            document.getElementById('bulk-selected-info').innerHTML = `${this.bulkSelectedWordIds.size} لغت انتخاب شده`;
            this.renderBulkWordsList();
            rangeInputs.style.display = 'none';
            document.getElementById('bulk-range-start').value = '';
            document.getElementById('bulk-range-end').value = '';
            
            this.showToast(`✅ ${this.bulkSelectedWordIds.size} لغت از محدوده ${start} تا ${end} انتخاب شد`, 'success');
        };
    }
    
    document.getElementById('bulk-select-all')?.addEventListener('click', () => {
        const words = this.bulkFilteredWords || this.bulkAllWords;
        words.forEach(w => this.bulkSelectedWordIds.add(w.id));
        document.getElementById('bulk-selected-info').innerHTML = `${this.bulkSelectedWordIds.size} لغت انتخاب شده`;
        this.renderBulkWordsList();
        this.showToast(`✅ همه ${this.bulkSelectedWordIds.size} لغت انتخاب شد`, 'success');
    });
    
    document.getElementById('bulk-select-favorites')?.addEventListener('click', () => {
        const words = this.bulkFilteredWords || this.bulkAllWords;
        words.forEach(w => {
            if (this.favorites.has(w.id)) this.bulkSelectedWordIds.add(w.id);
        });
        document.getElementById('bulk-selected-info').innerHTML = `${this.bulkSelectedWordIds.size} لغت انتخاب شده`;
        this.renderBulkWordsList();
        this.showToast(`✅ ${this.bulkSelectedWordIds.size} لغت مورد علاقه انتخاب شد`, 'success');
    });
    
    document.getElementById('bulk-clear-selection')?.addEventListener('click', () => {
        this.bulkSelectedWordIds.clear();
        document.getElementById('bulk-selected-info').innerHTML = `0 لغت انتخاب شده`;
        this.renderBulkWordsList();
        this.showToast(`🗑️ همه انتخاب‌ها لغو شد`, 'info');
    });
    
    const searchInput = document.getElementById('bulk-word-search');
    if (searchInput) {
        searchInput.oninput = () => {
            this.bulkCurrentPage = 1;
            this.renderBulkWordsList();
        };
    }
    
    document.getElementById('bulk-add-to-tag')?.addEventListener('click', () => {
        const tagId = document.getElementById('bulk-tag-select').value;
        if (!tagId) {
            this.showToast('لطفاً یک پوشه انتخاب کنید', 'warning');
            return;
        }
        if (this.bulkSelectedWordIds.size === 0) {
            this.showToast('هیچ لغتی انتخاب نشده', 'warning');
            return;
        }
        const added = this.addMultipleWordsToTag(tagId, Array.from(this.bulkSelectedWordIds));
        this.showToast(`✅ ${added} لغت به پوشه اضافه شد`, 'success');
        this.bulkSelectedWordIds.clear();
        document.getElementById('bulk-selected-info').innerHTML = `0 لغت انتخاب شده`;
        this.renderBulkWordsList();
        this.renderTagFilterBar();
        this.updatePracticeTagFilter();
        this.addTagFilterToExportModal();
        this.renderWordList(); // بروزرسانی لیست لغات
    });
    
    document.getElementById('bulk-remove-from-tag')?.addEventListener('click', () => {
        const tagId = document.getElementById('bulk-tag-select').value;
        if (!tagId) {
            this.showToast('لطفاً یک پوشه انتخاب کنید', 'warning');
            return;
        }
        if (this.bulkSelectedWordIds.size === 0) {
            this.showToast('هیچ لغتی انتخاب نشده', 'warning');
            return;
        }
        const removed = this.removeMultipleWordsFromTag(tagId, Array.from(this.bulkSelectedWordIds));
        this.showToast(`🗑️ ${removed} لغت از پوشه حذف شد`, 'success');
        this.bulkSelectedWordIds.clear();
        document.getElementById('bulk-selected-info').innerHTML = `0 لغت انتخاب شده`;
        this.renderBulkWordsList();
        this.renderTagFilterBar();
        this.updatePracticeTagFilter();
        this.addTagFilterToExportModal();
        this.renderWordList();
    });
};

GermanDictionary.prototype.addTagFilterToExportModal = function() {
    setTimeout(() => {
        const modal = document.getElementById('export-words-modal');
        if (!modal) {
            console.log('❌ مودال خروجی تصویری پیدا نشد');
            return;
        }
        
        const tags = this.getAllTags();
        if (tags.length === 0) {
            console.log('❌ هیچ تگی برای نمایش در خروجی تصویری وجود ندارد');
            return;
        }
        
        const isGerman = LanguageSystem.isGerman();
        
        // حذف فیلتر قبلی اگر وجود داشت
        const existingFilter = modal.querySelector('.export-tag-filter');
        if (existingFilter) existingFilter.remove();
        
        // پیدا کردن toolbar
        let toolbar = modal.querySelector('.export-toolbar');
        
        // اگه toolbar وجود نداره، خودمون می‌سازیم
        if (!toolbar) {
            const modalHeader = modal.querySelector('.export-modal-header');
            if (modalHeader) {
                toolbar = document.createElement('div');
                toolbar.className = 'export-toolbar';
                toolbar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 12px; padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; align-items: center;';
                modalHeader.insertAdjacentElement('afterend', toolbar);
            }
        }
        
        if (!toolbar) {
            console.log('❌ toolbar در مودال خروجی تصویری پیدا نشد');
            return;
        }
        
        const tagFilterSection = document.createElement('div');
        tagFilterSection.className = 'export-tag-filter';
        tagFilterSection.style.marginLeft = 'auto';
        
        const currentTag = this.exportTagFilter ? tags.find(t => t.id === this.exportTagFilter) : null;
        
        tagFilterSection.innerHTML = `
            <div class="export-tag-dropdown" style="position: relative; display: inline-block;">
                <button id="export-tag-filter-btn" class="export-tag-filter-toggle" style="display: flex; align-items: center; gap: 10px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 30px; cursor: pointer; font-size: 13px; font-family: 'Vazirmatn', sans-serif;">
                    <i class="fas fa-folder"></i>
                    <span id="export-tag-selected-name">${currentTag ? currentTag.name : (isGerman ? 'انتخاب پوشه' : 'Select folder')}</span>
                    <i class="fas fa-chevron-down" style="font-size: 12px;"></i>
                </button>
                <div id="export-tag-filter-menu" class="export-tag-filter-menu" style="display: none; position: absolute; top: 100%; right: 0; min-width: 220px; background: var(--white); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 1000; margin-top: 5px; border: 1px solid var(--gray-200); overflow: hidden;">
                    <button class="export-tag-option ${!this.exportTagFilter ? 'active' : ''}" data-tag-id="all" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 15px; border: none; background: transparent; cursor: pointer; text-align: right; font-size: 13px; font-family: 'Vazirmatn', sans-serif; transition: all 0.2s; border-right: 3px solid transparent;">
                        <i class="fas fa-globe"></i> ${isGerman ? 'همه لغات' : 'All words'}
                    </button>
                    ${tags.map(tag => `
                        <button class="export-tag-option ${this.exportTagFilter === tag.id ? 'active' : ''}" data-tag-id="${tag.id}" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 15px; border: none; background: transparent; cursor: pointer; text-align: right; font-size: 13px; font-family: 'Vazirmatn', sans-serif; transition: all 0.2s; border-right: 3px solid ${tag.color};">
                            <span class="tag-option-dot" style="width: 10px; height: 10px; border-radius: 50%; background: ${tag.color}; display: inline-block;"></span>
                            ${this.escapeHtml(tag.name)}
                            <span class="tag-option-count" style="font-size: 11px; color: var(--gray-500); margin-right: auto;">(${tag.wordCount})</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        toolbar.appendChild(tagFilterSection);
        
        const toggleBtn = document.getElementById('export-tag-filter-btn');
        const filterMenu = document.getElementById('export-tag-filter-menu');
        const selectedNameSpan = document.getElementById('export-tag-selected-name');
        
        if (toggleBtn && filterMenu) {
            toggleBtn.onclick = (e) => {
                e.stopPropagation();
                const isOpen = filterMenu.style.display === 'block';
                filterMenu.style.display = isOpen ? 'none' : 'block';
            };
            
            document.addEventListener('click', (e) => {
                if (!tagFilterSection.contains(e.target)) {
                    if (filterMenu) filterMenu.style.display = 'none';
                }
            });
        }
        
        document.querySelectorAll('.export-tag-option').forEach(btn => {
            btn.onclick = async () => {
                const tagId = btn.dataset.tagId;
                console.log('📁 انتخاب پوشه در خروجی تصویری:', tagId);
                
                this.exportTagFilter = tagId === 'all' ? null : tagId;
                if (filterMenu) filterMenu.style.display = 'none';
                
                if (this.exportTagFilter) {
                    const tagWords = await this.getWordsByTag(this.exportTagFilter);
                    this.allWordsForExport = tagWords;
                    this.filteredWordsForExport = [...tagWords];
                    const tag = tags.find(t => t.id === tagId);
                    if (selectedNameSpan && tag) selectedNameSpan.textContent = tag.name;
                    this.showToast(`📁 نمایش لغات پوشه "${tag.name}"`, 'info');
                } else {
                    this.allWordsForExport = await this.getAllWords();
                    this.filteredWordsForExport = [...this.allWordsForExport];
                    if (selectedNameSpan) selectedNameSpan.textContent = isGerman ? 'انتخاب پوشه' : 'Select folder';
                    this.showToast(`🌍 نمایش همه لغات`, 'info');
                }
                
                const sortSelect = document.getElementById('export-sort-select');
                if (sortSelect) {
                    this.applyExportSort(this.filteredWordsForExport, sortSelect.value);
                }
                this.renderExportWordsList();
                this.updateSelectedCountDisplay();
                
                // بروزرسانی کلاس active
                document.querySelectorAll('.export-tag-option').forEach(b => {
                    b.classList.remove('active');
                    if (b.dataset.tagId === tagId) b.classList.add('active');
                });
                
                // ذخیره در localStorage
                if (this.exportTagFilter) {
                    localStorage.setItem('exportTagFilter', this.exportTagFilter);
                } else {
                    localStorage.removeItem('exportTagFilter');
                }
            };
        });
        
        // بازیابی انتخاب قبلی از localStorage
        const savedExportTag = localStorage.getItem('exportTagFilter');
        if (savedExportTag && this.tags.has(savedExportTag)) {
            this.exportTagFilter = savedExportTag;
            const tag = tags.find(t => t.id === savedExportTag);
            if (selectedNameSpan && tag) selectedNameSpan.textContent = tag.name;
            setTimeout(async () => {
                const tagWords = await this.getWordsByTag(savedExportTag);
                this.allWordsForExport = tagWords;
                this.filteredWordsForExport = [...tagWords];
                const sortSelect = document.getElementById('export-sort-select');
                if (sortSelect) {
                    this.applyExportSort(this.filteredWordsForExport, sortSelect.value);
                }
                this.renderExportWordsList();
                this.updateSelectedCountDisplay();
                const activeOpt = document.querySelector(`.export-tag-option[data-tag-id="${savedExportTag}"]`);
                if (activeOpt) {
                    document.querySelectorAll('.export-tag-option').forEach(b => b.classList.remove('active'));
                    activeOpt.classList.add('active');
                }
            }, 100);
        }
        
        console.log('✅ فیلتر پوشه به خروجی تصویری اضافه شد');
        
    }, 500);
};

GermanDictionary.prototype.createTagSelectionModal = function() {
    if (document.getElementById('tag-selection-modal')) return;

    // تزریق استایل‌ها
    this._injectTagManagerProStyles();

    const isGerman = LanguageSystem.isGerman();
    const modalHTML = `
        <div id="tag-selection-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 480px;">
                <div class="modal-header">
                    <h3><i class="fas fa-folder-plus"></i> ${isGerman ? 'مدیریت پوشه‌ها' : 'Manage folders'}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="tm-wrap">
                        <div id="tag-selection-list" class="tag-selection-list"></div>
                        <button id="create-tag-from-selection">
                            <i class="fas fa-plus"></i> ${isGerman ? 'پوشه جدید' : 'New folder'}
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline close-selection-modal">${isGerman ? 'بستن' : 'Close'}</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('tag-selection-modal');
    modal.querySelectorAll('.close-modal, .close-selection-modal').forEach(btn => {
        btn.onclick = () => modal.style.display = 'none';
    });
};

GermanDictionary.prototype.showTagSelectionForWord = function(wordId, wordGerman) {
    let modal = document.getElementById('tag-selection-modal');
    if (!modal) {
        this.createTagSelectionModal();
        modal = document.getElementById('tag-selection-modal');
    }

    // تزریق استایل‌ها (در صورت نیاز)
    this._injectTagManagerProStyles();

    const tags = this.getAllTags();
    const currentTags = this.getTagsForWord(wordId);
    const currentTagIds = new Set(currentTags.map(t => t.id));
    const isGerman = LanguageSystem.isGerman();

    const container = document.getElementById('tag-selection-list');
    if (!container) return;

    if (tags.length === 0) {
        container.innerHTML = `<div class="empty-state-tags"><i class="fas fa-folder-open" style="font-size: 26px; display: block; margin-bottom: 8px; opacity: .5;"></i>${isGerman ? 'هنوز پوشه‌ای نساخته‌اید. روی دکمه پایین کلیک کنید.' : 'No folders yet. Click the button below to create one.'}</div>`;
    } else {
        container.innerHTML = tags.map(tag => `
            <div class="tag-select-item" data-tag-id="${tag.id}">
                <div class="tag-select-info">
                    <div class="tag-color-dot" style="background: ${tag.color};"></div>
                    <span class="tag-select-name">${this.escapeHtml(tag.name)}</span>
                    <span class="tag-select-count">(${this._wlFaNum(tag.wordCount)})</span>
                </div>
                <button class="tag-select-toggle ${currentTagIds.has(tag.id) ? 'active' : ''}" data-tag-id="${tag.id}" style="background: ${currentTagIds.has(tag.id) ? tag.color : ''};">
                    ${currentTagIds.has(tag.id) ? '<i class="fas fa-check"></i>' : '<i class="fas fa-plus"></i>'}
                </button>
            </div>
        `).join('');
    }

    modal.querySelector('.modal-header h3').innerHTML = `<i class="fas fa-folder-plus"></i> ${isGerman ? 'پوشه‌های لغت' : 'Word folders'} — ${this.escapeHtml(wordGerman)}`;
    modal.style.display = 'flex';

    container.querySelectorAll('.tag-select-toggle').forEach(btn => {
        btn.onclick = () => {
            const tagId = btn.dataset.tagId;
            const isActive = btn.classList.contains('active');
            const tag = tags.find(t => t.id === tagId);

            if (isActive) {
                this.removeWordFromTag(tagId, wordId);
                btn.classList.remove('active');
                btn.style.background = '';
                btn.innerHTML = '<i class="fas fa-plus"></i>';
                this.showToast(`🗑️ از پوشه "${tag.name}" حذف شد`, 'info');
            } else {
                this.addWordToTag(tagId, wordId);
                btn.classList.add('active');
                btn.style.background = tag.color;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                this.showToast(`✅ به پوشه "${tag.name}" اضافه شد`, 'success');
            }

            // بروزرسانی نمایش در لیست لغات و رنگ دکمه
            this.renderTagFilterBar();
            this.updatePracticeTagFilter?.();
            this.addTagFilterToExportModal?.();
            this.renderWordList(); // رندر مجدد برای بروزرسانی آیکون تگ و رنگ دکمه
        };
    });

    document.getElementById('create-tag-from-selection')?.addEventListener('click', () => {
        modal.style.display = 'none';
        this.showTagManagerModal();
    });
};

GermanDictionary.prototype.addTagButtonToWordList = function() {
    setTimeout(() => {
        const sortBtn = document.getElementById('floating-sort-btn');
        if (!sortBtn) return;
        if (document.getElementById('floating-tag-btn')) return;
        
        const tagBtn = document.createElement('button');
        tagBtn.id = 'floating-tag-btn';
        tagBtn.className = 'floating-tag-btn';
        tagBtn.innerHTML = '<i class="fas fa-folder-tree"></i>';
        tagBtn.title = 'مدیریت پوشه‌ها';
        tagBtn.onclick = () => this.showTagManagerModal();
        
        sortBtn.parentNode.insertBefore(tagBtn, sortBtn.nextSibling);
        console.log('✅ دکمه تگ اضافه شد');
    }, 500);
};

GermanDictionary.prototype.updatePracticeTagFilter = function() {
    setTimeout(() => {
        const practiceSection = document.getElementById('practice-section');
        if (!practiceSection) return;
        
        const tags = this.getAllTags();
        if (tags.length === 0) return;
        
        const isGerman = LanguageSystem.isGerman();
        
        let rangeButtons = practiceSection.querySelector('.range-buttons');
        if (!rangeButtons) {
            setTimeout(() => this.updatePracticeTagFilter(), 500);
            return;
        }
        
        // حذف دکمه قبلی اگر وجود داشت
        const existingWrapper = rangeButtons.querySelector('.practice-tag-dropdown-wrapper');
        if (existingWrapper) existingWrapper.remove();
        
        // ایجاد دکمه پوشه
        const tagDropdownWrapper = document.createElement('div');
        tagDropdownWrapper.className = 'practice-tag-dropdown-wrapper';
        tagDropdownWrapper.style.display = 'inline-block';
        tagDropdownWrapper.style.position = 'relative';
        tagDropdownWrapper.style.marginRight = '10px';
        
        const currentTag = this.selectedPracticeTag ? tags.find(t => t.id === this.selectedPracticeTag) : null;
        
        tagDropdownWrapper.innerHTML = `
            <div class="practice-tag-dropdown-btn">
                <button class="range-option ${this.selectedPracticeTag ? 'active' : ''}" data-range="tag" style="display: flex; align-items: center; gap: 8px; min-width: 130px; justify-content: space-between;">
                    <i class="fas fa-folder"></i> 
                    <span id="practice-tag-selected-name">${currentTag ? currentTag.name : (isGerman ? 'پوشه' : 'Folder')}</span>
                    <i class="fas fa-chevron-down" style="font-size: 12px;"></i>
                </button>
                <div class="practice-tag-dropdown-menu" style="display: none; position: absolute; top: 100%; right: 0; min-width: 220px; background: var(--white); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 1000; margin-top: 5px; border: 1px solid var(--gray-200); overflow: hidden;">
                    <button class="practice-tag-option ${!this.selectedPracticeTag ? 'active' : ''}" data-tag-id="all" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 15px; border: none; background: transparent; cursor: pointer; text-align: right; font-size: 13px; transition: all 0.2s; border-right: 3px solid transparent;">
                        <i class="fas fa-globe"></i> ${isGerman ? 'همه پوشه‌ها' : 'All folders'}
                    </button>
                    ${tags.map(tag => `
                        <button class="practice-tag-option ${this.selectedPracticeTag === tag.id ? 'active' : ''}" data-tag-id="${tag.id}" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 15px; border: none; background: transparent; cursor: pointer; text-align: right; font-size: 13px; transition: all 0.2s; border-right: 3px solid ${tag.color};">
                            <span class="tag-dot" style="width: 10px; height: 10px; border-radius: 50%; background: ${tag.color}; display: inline-block;"></span>
                            ${this.escapeHtml(tag.name)}
                            <span class="tag-count" style="font-size: 11px; color: var(--gray-500); margin-right: auto;">(${tag.wordCount})</span>
                            ${this.selectedPracticeTag === tag.id ? '<i class="fas fa-check" style="margin-right: 5px;"></i>' : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        rangeButtons.appendChild(tagDropdownWrapper);
        
        const dropdownBtn = tagDropdownWrapper.querySelector('.practice-tag-dropdown-btn > button');
        const dropdownMenu = tagDropdownWrapper.querySelector('.practice-tag-dropdown-menu');
        const selectedNameSpan = tagDropdownWrapper.querySelector('#practice-tag-selected-name');
        
        if (dropdownBtn && dropdownMenu) {
            dropdownBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = dropdownMenu.style.display === 'block';
                dropdownMenu.style.display = isOpen ? 'none' : 'block';
            };
            
            const closeDropdownHandler = (e) => {
                if (!tagDropdownWrapper.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.style.display = 'none';
                }
            };
            document.removeEventListener('click', closeDropdownHandler);
            document.addEventListener('click', closeDropdownHandler);
        }
        
        document.querySelectorAll('.practice-tag-option').forEach(opt => {
            opt.onclick = (e) => {
                e.stopPropagation();
                const tagId = opt.dataset.tagId;
                
                if (tagId === 'all') {
                    this.selectedPracticeTag = null;
                    if (selectedNameSpan) selectedNameSpan.textContent = isGerman ? 'پوشه' : 'Folder';
                    this.showToast(`📁 تمرین از همه پوشه‌ها`, 'info');
                    const tagRangeBtn = rangeButtons.querySelector('.range-option[data-range="tag"]');
                    if (tagRangeBtn) tagRangeBtn.classList.remove('active');
                } else {
                    this.selectedPracticeTag = tagId;
                    const tag = tags.find(t => t.id === tagId);
                    if (selectedNameSpan && tag) selectedNameSpan.textContent = tag.name;
                    this.showToast(`📁 تمرین از پوشه "${tag.name}"`, 'success');
                    const tagRangeBtn = rangeButtons.querySelector('.range-option[data-range="tag"]');
                    if (tagRangeBtn) tagRangeBtn.classList.add('active');
                    
                    // ========== مهم: وقتی پوشه انتخاب شد، اگه محدوده custom فعال بود پیام بده ==========
                    const activeRange = document.querySelector('.range-option.active');
                    if (activeRange && activeRange.dataset.range === 'custom') {
                        const startInput = document.getElementById('range-start');
                        const endInput = document.getElementById('range-end');
                        if (startInput?.value && endInput?.value) {
                            this.showToast(`📏 محدوده ${startInput.value} تا ${endInput.value} از پوشه "${tag.name}" اعمال می‌شود`, 'info');
                        }
                    }
                }
                
                dropdownMenu.style.display = 'none';
                
                document.querySelectorAll('.practice-tag-option').forEach(o => {
                    o.classList.remove('active');
                    const checkIcon = o.querySelector('.fa-check');
                    if (checkIcon) checkIcon.remove();
                });
                if (tagId !== 'all') {
                    opt.classList.add('active');
                    opt.insertAdjacentHTML('beforeend', '<i class="fas fa-check" style="margin-right: 5px;"></i>');
                } else {
                    opt.classList.add('active');
                }
                
                if (this.selectedPracticeTag) {
                    localStorage.setItem('selectedPracticeTag', this.selectedPracticeTag);
                } else {
                    localStorage.removeItem('selectedPracticeTag');
                }
            };
        });
        
        // ========== اصلاح گزینه‌های محدوده ==========
        // قانون: فقط "custom range" می‌تونه با پوشه ترکیب بشه
        // گزینه‌های "all", "favorites", "recent" وقتی پوشه انتخاب شده باشه، پوشه رو لغو می‌کنن
        
        const allRangeOptions = rangeButtons.querySelectorAll('.range-option:not([data-range="tag"])');
        allRangeOptions.forEach(btn => {
            const originalOnClick = btn.onclick;
            btn.onclick = (e) => {
                e.stopPropagation();
                
                const rangeValue = btn.dataset.range;
                const isCustomRange = (rangeValue === 'custom');
                const hasTagSelected = (this.selectedPracticeTag !== null && this.selectedPracticeTag !== 'all');
                
                // ========== قانون 1: اگه پوشه انتخاب شده و این گزینه custom نیست → پوشه رو لغو کن ==========
                if (hasTagSelected && !isCustomRange) {
                    this.selectedPracticeTag = null;
                    const tagRangeBtn = rangeButtons.querySelector('.range-option[data-range="tag"]');
                    if (tagRangeBtn) tagRangeBtn.classList.remove('active');
                    if (selectedNameSpan) selectedNameSpan.textContent = isGerman ? 'پوشه' : 'Folder';
                    this.showToast(`📁 پوشه لغو شد - فقط محدوده ${btn.querySelector('span')?.textContent || rangeValue} اعمال می‌شود`, 'info');
                }
                
                // ========== قانون 2: اگه پوشه انتخاب شده و این گزینه custom است → هر دو فعال می‌مونن ==========
                if (hasTagSelected && isCustomRange) {
                    const tag = tags.find(t => t.id === this.selectedPracticeTag);
                    this.showToast(`📁 پوشه "${tag?.name}" + محدوده دلخواه (از پوشه حساب می‌شود)`, 'success');
                }
                
                // ========== قانون 3: اگه پوشه انتخاب نشده → محدوده تنها ==========
                if (!hasTagSelected) {
                    this.showToast(`🌍 محدوده: ${btn.querySelector('span')?.textContent || rangeValue}`, 'info');
                }
                
                // حذف active از همه range options (به جز پوشه)
                document.querySelectorAll('.range-option').forEach(r => {
                    if (r.dataset.range !== 'tag') {
                        r.classList.remove('active');
                    }
                });
                btn.classList.add('active');
                
                // ذخیره در localStorage
                localStorage.setItem('practiceRange', rangeValue);
                
                // نمایش یا مخفی کردن input محدوده دلخواه
                const customInputs = document.querySelector('.custom-range-inputs');
                if (customInputs) {
                    customInputs.style.display = rangeValue === 'custom' ? 'block' : 'none';
                }
                
                // اگه پوشه انتخاب شده و این custom است، دکمه پوشه active بمونه
                if (this.selectedPracticeTag && isCustomRange) {
                    const tagRangeBtn = rangeButtons.querySelector('.range-option[data-range="tag"]');
                    if (tagRangeBtn) tagRangeBtn.classList.add('active');
                }
                
                // اجرای onclick اصلی
                if (originalOnClick) {
                    originalOnClick.call(btn, e);
                }
            };
        });
        
        // ========== اضافه کردن نشانگر وضعیت ==========
        let statusIndicator = rangeButtons.querySelector('.practice-status-indicator');
        if (!statusIndicator) {
            statusIndicator = document.createElement('div');
            statusIndicator.className = 'practice-status-indicator';
            statusIndicator.style.cssText = `
                display: inline-block;
                margin-right: 15px;
                padding: 6px 14px;
                background: var(--primary-light);
                border-radius: 30px;
                font-size: 12px;
                font-weight: 500;
                color: var(--primary);
                direction: rtl;
            `;
            rangeButtons.appendChild(statusIndicator);
        }
        
        const updateStatusIndicator = () => {
            let statusText = '';
            const activeRange = document.querySelector('.range-option.active:not([data-range="tag"])');
            const isCustomActive = activeRange?.dataset.range === 'custom';
            
            if (this.selectedPracticeTag && isCustomActive) {
                const tag = this.getAllTags().find(t => t.id === this.selectedPracticeTag);
                statusText = `📁 ${tag?.name} | 📏 محدوده دلخواه`;
            } 
            else if (this.selectedPracticeTag && !isCustomActive) {
                const tag = this.getAllTags().find(t => t.id === this.selectedPracticeTag);
                statusText = `📁 ${tag?.name} (همه لغات پوشه)`;
            }
            else if (!this.selectedPracticeTag && activeRange) {
                const rangeName = activeRange.dataset.range === 'custom' ? 'محدوده دلخواه' :
                                  activeRange.dataset.range === 'favorites' ? 'علاقه‌مندی‌ها' :
                                  activeRange.dataset.range === 'recent' ? 'لغات اخیر' : 'همه لغات';
                statusText = `🌍 ${rangeName}`;
            }
            else {
                statusText = `🌍 همه لغات`;
            }
            
            statusIndicator.innerHTML = `<i class="fas fa-chart-simple"></i> ${statusText}`;
        };
        
        const observer = new MutationObserver(updateStatusIndicator);
        observer.observe(rangeButtons, { attributes: true, subtree: true, attributeFilter: ['class'] });
        updateStatusIndicator();
        
        // بازیابی انتخاب قبلی از localStorage
        const savedTag = localStorage.getItem('selectedPracticeTag');
        if (savedTag && this.tags.has(savedTag)) {
            this.selectedPracticeTag = savedTag;
            const tag = tags.find(t => t.id === savedTag);
            if (selectedNameSpan && tag) selectedNameSpan.textContent = tag.name;
            const tagRangeBtn = rangeButtons.querySelector('.range-option[data-range="tag"]');
            if (tagRangeBtn) tagRangeBtn.classList.add('active');
            setTimeout(() => {
                const activeOpt = document.querySelector(`.practice-tag-option[data-tag-id="${savedTag}"]`);
                if (activeOpt) {
                    document.querySelectorAll('.practice-tag-option').forEach(o => {
                        o.classList.remove('active');
                        const checkIcon = o.querySelector('.fa-check');
                        if (checkIcon) checkIcon.remove();
                    });
                    activeOpt.classList.add('active');
                    activeOpt.insertAdjacentHTML('beforeend', '<i class="fas fa-check" style="margin-right: 5px;"></i>');
                }
                updateStatusIndicator();
            }, 100);
        }
        
        // بازیابی محدوده ذخیره شده
        const savedRange = localStorage.getItem('practiceRange') || 'all';
        document.querySelectorAll('.range-option').forEach(btn => {
            if (btn.dataset.range === savedRange && btn.dataset.range !== 'tag') {
                btn.classList.add('active');
                const customInputs = document.querySelector('.custom-range-inputs');
                if (customInputs) {
                    customInputs.style.display = savedRange === 'custom' ? 'block' : 'none';
                }
            }
        });
        updateStatusIndicator();
        
    }, 300);
};

/* ============================================================
   تزریق استایل‌های پریمیوم لیست لغات (یک‌بار)
   ============================================================ */
GermanDictionary.prototype._injectWordListProStyles = function() {
    // اگر استایل قبلی وجود دارد، محتوا را به‌روزرسانی کن
    let style = document.getElementById('wl-pro-styles');
    if (!style) {
        style = document.createElement('style');
        style.id = 'wl-pro-styles';
        document.head.appendChild(style);
    }
    // همیشه محتوا را به‌روزرسانی کن (برای پشتیبانی از به‌روزرسانی‌های توسعه)
    style.textContent = `
        /* ===== متغیرهای پریمیوم (Light) ===== */
        .wl-wrap {
            --wl-primary: #4361ee;
            --wl-primary-d: #3a56d4;
            --wl-primary-l: #eef2ff;
            --wl-emerald: #10b981;
            --wl-emerald-d: #059669;
            --wl-violet: #8b5cf6;
            --wl-violet-d: #6d28d9;
            --wl-amber: #f59e0b;
            --wl-amber-d: #d97706;
            --wl-rose: #f43f5e;
            --wl-rose-d: #e11d48;
            --wl-cyan: #06b6d4;
            --wl-cyan-d: #0891b2;
            --wl-lime: #84cc16;
            --wl-lime-d: #65a30d;
            --wl-slate: #64748b;

            --wl-ink: #0f172a;
            --wl-ink-2: #1e293b;
            --wl-slate-600: #475569;
            --wl-muted: #64748b;
            --wl-muted-2: #94a3b8;
            --wl-line: #e2e8f0;
            --wl-line-2: #f1f5f9;
            --wl-card: #ffffff;
            --wl-card-2: #f8fafc;
            --wl-card-hover: #ffffff;

            --wl-shadow-sm: 0 1px 2px rgba(15,23,42,.04);
            --wl-shadow: 0 1px 3px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.05);
            --wl-shadow-md: 0 4px 12px rgba(15,23,42,.06), 0 12px 32px rgba(15,23,42,.07);
            --wl-shadow-lg: 0 12px 40px rgba(15,23,42,.10), 0 4px 12px rgba(15,23,42,.05);
            --wl-shadow-hover: 0 8px 24px rgba(15,23,42,.10), 0 20px 48px rgba(15,23,42,.10);

            --wl-radius: 20px;
            --wl-radius-m: 16px;
            --wl-radius-s: 12px;
            --wl-radius-xs: 8px;

            --wl-grad-header: linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #134e4a 100%);

            font-family: 'Vazirmatn', Tahoma, sans-serif;
            color: var(--wl-ink);
            line-height: 1.6;
        }

        /* ===== Dark Mode ===== */
        body.dark-mode .wl-wrap {
            --wl-ink: #f1f5f9;
            --wl-ink-2: #e2e8f0;
            --wl-slate-600: #cbd5e1;
            --wl-muted: #94a3b8;
            --wl-muted-2: #64748b;
            --wl-line: #1e293b;
            --wl-line-2: #1e293b;
            --wl-card: #1e293b;
            --wl-card-2: #0f172a;
            --wl-card-hover: #243044;
            --wl-primary-l: rgba(67,97,238,.15);

            --wl-shadow-sm: 0 1px 2px rgba(0,0,0,.3);
            --wl-shadow: 0 1px 3px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.25);
            --wl-shadow-md: 0 4px 12px rgba(0,0,0,.3), 0 12px 32px rgba(0,0,0,.3);
            --wl-shadow-lg: 0 12px 40px rgba(0,0,0,.4), 0 4px 12px rgba(0,0,0,.2);
            --wl-shadow-hover: 0 8px 24px rgba(0,0,0,.35), 0 20px 48px rgba(0,0,0,.4);
        }

        /* ===== فونت آیکون‌ها ===== */
        .wl-wrap i, .wl-wrap i::before,
        .wl-wrap [class^="fa-"]::before, .wl-wrap [class*=" fa-"]::before {
            font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
        }
        .wl-wrap i.fas, .wl-wrap i.fa-solid { font-weight: 900 !important; }
        .wl-wrap i.far, .wl-wrap i.fa-regular { font-weight: 400 !important; }

        /* ===== کانتینر اصلی ===== */
        .wl-wrap { display: block; }

        /* ===== نوار ابزار بالای لیست ===== */
        .wl-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            margin-bottom: 18px;
            flex-wrap: wrap;
        }
        .wl-toolbar-info {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            font-weight: 600;
            color: var(--wl-muted);
        }
        .wl-toolbar-info .wl-count-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 999px;
            background: var(--wl-card);
            border: 1px solid var(--wl-line);
            box-shadow: var(--wl-shadow-sm);
            color: var(--wl-ink-2);
            font-size: 12px;
            font-weight: 700;
        }
        .wl-toolbar-info .wl-count-pill i { color: var(--wl-primary); font-size: 11px; }
        .wl-toolbar-info .wl-sort-hint {
            font-size: 11px;
            color: var(--wl-muted-2);
            font-weight: 500;
        }

        /* ===== گرید کارت‌ها (ریسپانسیو: ۱ ستون موبایل، ۲ ستون تبلت، ۳ ستون لپتاپ) =====
           نکته: از minmax استفاده شده تا کارت‌ها نه خیلی باریک شوند و نه خیلی کشیده.
           حداکثر ۳ ستون در دسکتاپ — حتی در صفحه‌های بسیار بزرگ. */
        .wl-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 14px;
        }
        @media (min-width: 640px) {
            .wl-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 14px;
            }
        }
        @media (min-width: 1024px) {
            .wl-grid {
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 16px;
            }
        }
        /* در صفحه‌های خیلی بزرگ (1536px+) هم ۳ ستون می‌ماند، فقط gap کمی بیشتر می‌شود */

        /* ===== صفحه‌بندی (Pagination) ===== */
        .wl-pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            flex-wrap: wrap;
            margin-top: 28px;
            padding: 16px;
            background: var(--wl-card);
            border: 1px solid var(--wl-line);
            border-radius: var(--wl-radius-m);
            box-shadow: var(--wl-shadow-sm);
        }
        .wl-page-btn {
            min-width: 38px;
            height: 38px;
            padding: 0 12px;
            border-radius: 10px;
            border: 1px solid var(--wl-line);
            background: var(--wl-card-2);
            color: var(--wl-slate-600);
            font-family: inherit;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all .22s cubic-bezier(.22,1,.36,1);
        }
        .wl-page-btn:hover:not(:disabled):not(.active) {
            border-color: var(--wl-primary);
            color: var(--wl-primary);
            background: var(--wl-primary-l);
            transform: translateY(-1px);
        }
        .wl-page-btn.active {
            background: linear-gradient(135deg, var(--wl-primary), var(--wl-primary-d));
            border-color: transparent;
            color: #fff;
            box-shadow: 0 4px 12px rgba(67,97,238,.3);
            cursor: default;
        }
        .wl-page-btn:disabled {
            opacity: .4;
            cursor: not-allowed;
        }
        .wl-page-btn.wl-page-nav i { font-size: 12px; }
        .wl-page-ellipsis {
            min-width: 32px;
            height: 38px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--wl-muted-2);
            font-weight: 700;
            user-select: none;
        }
        .wl-page-info {
            font-size: 12px;
            color: var(--wl-muted);
            font-weight: 600;
            margin-right: auto;
            padding: 0 8px;
        }
        .wl-page-jumper {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--wl-muted);
            font-weight: 600;
        }
        .wl-page-jumper input {
            width: 54px;
            height: 32px;
            padding: 0 8px;
            border-radius: 8px;
            border: 1px solid var(--wl-line);
            background: var(--wl-card-2);
            color: var(--wl-ink);
            font-family: inherit;
            font-size: 12px;
            font-weight: 700;
            text-align: center;
            outline: none;
            transition: border-color .2s ease;
        }
        .wl-page-jumper input:focus {
            border-color: var(--wl-primary);
            box-shadow: 0 0 0 3px rgba(67,97,238,.12);
        }
        @media (max-width: 640px) {
            .wl-pagination { gap: 4px; padding: 12px; }
            .wl-page-btn { min-width: 34px; height: 34px; padding: 0 8px; font-size: 12px; }
            .wl-page-info { width: 100%; text-align: center; margin-bottom: 4px; }
            .wl-page-jumper { display: none; }
        }

        /* ===== ستون چپ کارت (لهجه کناری) برای گرید چندستونی ===== */
        .wl-card { min-height: 0; min-width: 0; }

        /* ===== کارت لغت ===== */
        .wl-card {
            position: relative;
            background: var(--wl-card);
            border: 1px solid var(--wl-line);
            border-radius: var(--wl-radius);
            padding: 18px 20px 16px 20px;
            box-shadow: var(--wl-shadow);
            transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease, border-color .3s ease;
            cursor: pointer;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-width: 0; /* مهم: اجازه shrink در grid cell */
        }
        /* نوار رنگی کناری حذف شد */
        .wl-card:hover {
            transform: translateY(-3px);
            box-shadow: var(--wl-shadow-hover);
            border-color: var(--wl-accent, var(--wl-primary));
        }

        /* رنگ‌های لهجه بر اساس نوع کلمه */
        .wl-card[data-type="noun"]       { --wl-accent: #8b5cf6; }
        .wl-card[data-type="verb"]       { --wl-accent: #f59e0b; }
        .wl-card[data-type="adjective"]  { --wl-accent: #06b6d4; }
        .wl-card[data-type="adverb"]     { --wl-accent: #84cc16; }
        .wl-card[data-type="preposition"]{ --wl-accent: #ec4899; }
        .wl-card[data-type="other"]      { --wl-accent: #64748b; }
        .wl-card[data-type=""]           { --wl-accent: #4361ee; }

        /* ===== ردیف بالایی: شماره + SRS + ستاره ===== */
        .wl-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .wl-card-top-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .wl-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 30px;
            height: 26px;
            padding: 0 8px;
            border-radius: 8px;
            background: var(--wl-line-2);
            color: var(--wl-muted);
            font-size: 11px;
            font-weight: 700;
            font-family: 'Vazirmatn', sans-serif;
            letter-spacing: -0.2px;
        }
        .wl-srs {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: .2px;
            transition: all .2s ease;
        }
        .wl-srs i { font-size: 9px; }
        .wl-srs-0 { background: rgba(244,63,94,.12);  color: #e11d48; }
        .wl-srs-1 { background: rgba(245,158,11,.14); color: #d97706; }
        .wl-srs-2 { background: rgba(245,158,11,.14); color: #d97706; }
        .wl-srs-3 { background: rgba(6,182,212,.14);  color: #0891b2; }
        .wl-srs-4 { background: rgba(16,185,129,.14); color: #059669; }
        .wl-srs-5 { background: rgba(16,185,129,.18); color: #047857; box-shadow: 0 0 0 1px rgba(16,185,129,.2); }

        .wl-fav-btn {
            width: 34px; height: 34px;
            border-radius: 10px;
            border: 1px solid var(--wl-line);
            background: var(--wl-card-2);
            color: var(--wl-muted-2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all .25s cubic-bezier(.22,1,.36,1);
            flex-shrink: 0;
        }
        .wl-fav-btn:hover {
            border-color: #fbbf24;
            color: #f59e0b;
            background: #fffbeb;
            transform: scale(1.08);
        }
        .wl-fav-btn.active {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            border-color: #d97706;
            color: #fff;
            box-shadow: 0 4px 12px rgba(245,158,11,.35);
        }
        body.dark-mode .wl-fav-btn:hover {
            background: rgba(245,158,11,.15);
            border-color: #fbbf24;
        }

        /* ===== بخش اصلی: کلمه + معنی ===== */
        .wl-card-body {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 0; /* مهم: اجازه shrink در flex column */
        }
        .wl-word-row {
            display: flex;
            align-items: baseline;
            gap: 10px;
            flex-wrap: wrap;
            min-width: 0; /* مهم: اجازه shrink */
        }
        .wl-word {
            font-size: 21px;
            font-weight: 800;
            color: var(--wl-ink);
            letter-spacing: -0.4px;
            line-height: 1.3;
            direction: ltr;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            min-width: 0; /* مهم: اجازه shrink در flex item */
            max-width: 100%; /* جلوگیری از سرریز */
            overflow-wrap: break-word; /* شکستن کلمات طولانی */
            word-break: break-word; /* fallback */
        }
        .wl-gender {
            display: inline-flex;
            align-items: center;
            padding: 3px 10px;
            border-radius: 7px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: .3px;
            font-family: 'Segoe UI', system-ui, sans-serif;
            direction: ltr;
            flex-shrink: 0; /* badge ها نباید کوچک شوند */
        }
        .wl-gender.masculine { background: rgba(59,130,246,.14);  color: #2563eb; }
        .wl-gender.feminine  { background: rgba(236,72,153,.14);  color: #db2777; }
        .wl-gender.neuter    { background: rgba(16,185,129,.14);  color: #059669; }

        .wl-type-pill {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 3px 10px;
            border-radius: 7px;
            font-size: 11px;
            font-weight: 700;
            background: var(--wl-line-2);
            color: var(--wl-slate-600);
            flex-shrink: 0; /* badge ها نباید کوچک شوند */
        }
        .wl-type-pill i { font-size: 9px; }
        .wl-type-pill[data-type="noun"]       { background: rgba(139,92,246,.12);  color: #6d28d9; }
        .wl-type-pill[data-type="verb"]       { background: rgba(245,158,11,.12);  color: #d97706; }
        .wl-type-pill[data-type="adjective"]  { background: rgba(6,182,212,.12);   color: #0891b2; }
        .wl-type-pill[data-type="adverb"]     { background: rgba(132,204,22,.12);  color: #65a30d; }
        .wl-type-pill[data-type="preposition"]{ background: rgba(236,72,153,.12);  color: #db2777; }
        .wl-type-pill[data-type="other"]      { background: rgba(100,116,139,.12); color: #475569; }

        .wl-meaning {
            font-size: 15px;
            font-weight: 600;
            color: var(--wl-slate-600);
            line-height: 1.5;
            overflow-wrap: break-word; /* شکستن کلمات طولانی فارسی */
            word-break: break-word;
        }

        .wl-example {
            font-size: 12px;
            color: var(--wl-muted);
            line-height: 1.5;
            padding: 8px 12px;
            background: var(--wl-line-2);
            border-radius: 10px;
            border-right: none;
            direction: ltr;
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .wl-example .wl-ex-de { font-weight: 600; color: var(--wl-ink-2); }
        .wl-example .wl-ex-fa { font-size: 11px; opacity: .8; direction: rtl; text-align: right; }

        /* ===== تگ‌ها ===== */
        .wl-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        .wl-tag-chip {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 9px;
            border-radius: 999px;
            font-size: 10.5px;
            font-weight: 700;
            color: #fff;
            box-shadow: 0 2px 6px rgba(0,0,0,.08);
            cursor: pointer;
            transition: transform .2s ease;
        }
        .wl-tag-chip:hover { transform: translateY(-1px); }
        .wl-tag-chip i { font-size: 8px; }

        /* ===== اکشن‌ها ===== */
        .wl-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            padding-top: 12px;
            border-top: 1px dashed var(--wl-line);
        }
        .wl-act {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 10px;
            border: 1px solid var(--wl-line);
            background: var(--wl-card-2);
            color: var(--wl-slate-600);
            font-family: inherit;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all .25s cubic-bezier(.22,1,.36,1);
        }
        .wl-act i { font-size: 12px; }
        .wl-act:hover {
            transform: translateY(-1px);
            border-color: var(--wl-primary);
            color: var(--wl-primary);
            background: var(--wl-primary-l);
        }
        .wl-act.wl-act-primary {
            background: linear-gradient(135deg, var(--wl-primary), var(--wl-primary-d));
            border-color: transparent;
            color: #fff;
            box-shadow: 0 4px 12px rgba(67,97,238,.25);
        }
        .wl-act.wl-act-primary:hover {
            box-shadow: 0 6px 18px rgba(67,97,238,.35);
            color: #fff;
            background: linear-gradient(135deg, var(--wl-primary-d), var(--wl-primary));
        }
        .wl-act.wl-act-emerald {
            color: #059669;
            border-color: rgba(16,185,129,.3);
            background: rgba(16,185,129,.08);
        }
        .wl-act.wl-act-emerald:hover {
            background: rgba(16,185,129,.14);
            border-color: #10b981;
            color: #047857;
        }
        .wl-act.wl-act-icon {
            padding: 8px 10px;
            min-width: 36px;
            justify-content: center;
        }
        body.dark-mode .wl-act.wl-act-emerald { background: rgba(16,185,129,.12); }

        /* ===== حالت خالی ===== */
        .wl-empty {
            text-align: center;
            padding: 60px 20px;
            background: var(--wl-card);
            border: 1px dashed var(--wl-line);
            border-radius: var(--wl-radius);
        }
        .wl-empty-ic {
            width: 80px; height: 80px;
            margin: 0 auto 18px;
            border-radius: 50%;
            background: var(--wl-line-2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            color: var(--wl-muted-2);
        }
        .wl-empty h3 { margin: 0 0 8px; font-size: 18px; font-weight: 800; color: var(--wl-ink); }
        .wl-empty p { margin: 0; font-size: 14px; color: var(--wl-muted); }

        /* ===== لودینگ ===== */
        .wl-loading {
            text-align: center;
            padding: 40px;
            color: var(--wl-muted);
            font-size: 14px;
            font-weight: 600;
        }
        .wl-loading i { font-size: 22px; color: var(--wl-primary); margin-left: 8px; }

        /* ===== انیمیشن ورود کارت‌ها ===== */
        .wl-card { animation: wl-fade-in .4s cubic-bezier(.22,1,.36,1) both; }
        @keyframes wl-fade-in {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* ===== ریسپانسیو ===== */
        @media (max-width: 640px) {
            .wl-card { padding: 14px 16px 14px 16px; gap: 10px; }
            .wl-word { font-size: 19px; }
            .wl-meaning { font-size: 14px; }
            .wl-actions { gap: 6px; flex-wrap: wrap; }
            .wl-act { padding: 7px 11px; font-size: 11px; }
            .wl-act .wl-act-label { display: none; }
            .wl-act.wl-act-primary .wl-act-label { display: inline; }
            .wl-toolbar { gap: 8px; }
        }

        /* ===== ریسپانسیو هدر بخش لیست لغات (section-header + filter-buttons) ===== */
        /* این استایل‌ها فقط روی بخش لیست لغات اعمال می‌شوند تا هدر در موبایل فشرده شود */

        /* مهم: بازنشانی استایل‌های قدیمی .word-list که با گرید جدید تداخل داشت */
        #word-list-container.word-list {
            display: block !important;
            grid-template-columns: none !important;
            gap: 0 !important;
            margin-top: 0 !important;
        }

        #word-list-section .section-header {
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 18px !important;
            padding-bottom: 14px !important;
        }
        #word-list-section .section-header h2 {
            font-size: 17px;
            gap: 8px;
        }
        #word-list-section .section-header h2 i {
            font-size: 19px;
        }
        #word-list-section .badge {
            padding: 6px 14px;
            font-size: 12px;
            min-width: 50px;
        }

        /* دکمه سورت: در موبایل کنار badge قرار بگیرد (نه یک ردیف جداگانه) */
        #word-list-section .sort-circle-btn {
            width: 36px;
            height: 36px;
        }
        #word-list-section .sort-circle-btn i {
            font-size: 15px;
        }

        @media (max-width: 640px) {
            #word-list-section .section-header {
                margin-bottom: 14px !important;
                padding-bottom: 10px !important;
                gap: 8px !important;
            }
            #word-list-section .section-header h2 {
                font-size: 15px !important;
                gap: 6px !important;
            }
            #word-list-section .section-header h2 i {
                font-size: 16px !important;
            }
            #word-list-section .badge {
                padding: 5px 10px !important;
                font-size: 11px !important;
                min-width: 40px !important;
            }
            /* دکمه سورت کوچک‌تر در موبایل */
            #word-list-section .sort-circle-btn {
                width: 32px !important;
                height: 32px !important;
            }
            #word-list-section .sort-circle-btn i {
                font-size: 13px !important;
            }
            /* کانتینر دکمه سورت: حذف margin اضافی */
            #word-list-section .sort-circle-btn {
                margin: 0 !important;
            }
            /* فیلترها در موبایل: عرض کامل و اسکرول افقی */
            #word-list-section .filter-buttons {
                flex-direction: row !important;
                overflow-x: auto !important;
                flex-wrap: nowrap !important;
                gap: 8px !important;
                padding: 6px !important;
                width: 100% !important;
                max-width: 100% !important;
                justify-content: flex-start !important;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: thin;
            }
            #word-list-section .filter-buttons::-webkit-scrollbar {
                height: 4px;
            }
            #word-list-section .filter-buttons::-webkit-scrollbar-thumb {
                background: var(--wl-line);
                border-radius: 2px;
            }
            #word-list-section .filter-btn {
                flex-shrink: 0 !important;
                padding: 8px 13px !important;
                font-size: 12px !important;
                gap: 5px !important;
                width: auto !important;
                min-width: auto !important;
                max-width: none !important;
                white-space: nowrap !important;
            }
            #word-list-section .filter-btn i {
                font-size: 12px !important;
            }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
            #word-list-section .section-header h2 {
                font-size: 16px;
            }
            #word-list-section .filter-btn {
                padding: 10px 18px;
                font-size: 14px;
            }
        }
    `;
    // style قبلاً append شده — فقط textContent به‌روزرسانی شد
};
GermanDictionary.prototype._wlFaNum = function(n) {
    return String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
};

/* ============================================================
   رندر لیست لغات (نسخه پریمیوم ۲۰۲۵ — با صفحه‌بندی)
   ============================================================ */
GermanDictionary.prototype.renderWordList = async function(filter = 'all') {
    // تزریق استایل‌ها
    this._injectWordListProStyles();

    const container = document.getElementById('word-list-container');
    const isGerman = LanguageSystem.isGerman();

    if (!container) return;

    container.innerHTML = `<div class="wl-loading"><i class="fas fa-spinner fa-pulse"></i> در حال بارگذاری لغات...</div>`;

    const words = await this.getAllWords();
    let filteredWords = [...words];

    // فیلتر بر اساس تگ (اگر تگ خاصی انتخاب شده)
    if (this.currentTagFilter && this.currentTagFilter !== 'all') {
        const tagWords = await this.getWordsByTag(this.currentTagFilter);
        const tagWordIds = new Set(tagWords.map(w => w.id));
        filteredWords = filteredWords.filter(w => tagWordIds.has(w.id));
    } else {
        switch(filter) {
            case 'favorites':
                filteredWords = filteredWords.filter(w => this.favorites.has(w.id));
                break;
            case 'nouns':
                filteredWords = filteredWords.filter(w => w.type === 'noun');
                break;
            case 'verbs':
                filteredWords = filteredWords.filter(w => w.type === 'verb');
                break;
            case 'adjectives':
                filteredWords = filteredWords.filter(w => w.type === 'adjective');
                break;
            case 'adverbs':
                filteredWords = filteredWords.filter(w => w.type === 'adverb');
                break;
        }
    }

    // مرتب‌سازی
    const savedSort = localStorage.getItem('wordListSort') || 'alphabetical';
    this.applySortToFilteredWords(filteredWords, savedSort);

    // ========== ذخیره لیست فعلی برای ناوبری ==========
    this.currentWordList = [...filteredWords];

    // به‌روزرسانی شمارش
    const totalEl = document.getElementById('total-words-count');
    if (totalEl) totalEl.textContent = this._wlFaNum(filteredWords.length);

    // نام مرتب‌سازی فعلی برای نمایش
    const sortNames = {
        'alphabetical': 'الفبایی (آلمانی)',
        'alphabetical-persian': 'الفبایی (فارسی)',
        'date-desc': 'جدیدترین',
        'date-asc': 'قدیمی‌ترین',
        'srs-level': 'سطح یادگیری',
        'tag': 'بر اساس پوشه',
        'random': 'تصادفی'
    };
    const currentSortName = sortNames[savedSort] || 'الفبایی';

    if (filteredWords.length === 0) {
        container.innerHTML = `
            <div class="wl-wrap">
                <div class="wl-empty">
                    <div class="wl-empty-ic"><i class="fas fa-book-open"></i></div>
                    <h3>${isGerman ? 'هنوز لغتی ثبت نشده' : 'No words yet'}</h3>
                    <p>${isGerman ? 'از بخش «افزودن لغت» اولین لغت خود را اضافه کنید' : 'Add your first word from the Add Word section'}</p>
                </div>
            </div>
        `;
        return;
    }

    // ========== سیستم صفحه‌بندی ==========
    // تعداد لغات در هر صفحه — از localStorage خوانده می‌شود (قابل تنظیم در آینده)
    if (!this._wlWordsPerPage) {
        this._wlWordsPerPage = parseInt(localStorage.getItem('wlWordsPerPage')) || 24;
    }
    const perPage = this._wlWordsPerPage;
    const totalWords = filteredWords.length;
    const totalPages = Math.max(1, Math.ceil(totalWords / perPage));

    // اگر صفحه فعلی ذخیره نشده یا از محدوده خارج شده، آن را ریست کن
    if (!this._wlCurrentPage || this._wlCurrentPage > totalPages) {
        this._wlCurrentPage = 1;
    }

    // محاسبه شروع و پایان صفحه فعلی
    const startIdx = (this._wlCurrentPage - 1) * perPage;
    const endIdx = Math.min(startIdx + perPage, totalWords);
    const pageWords = filteredWords.slice(startIdx, endIdx);

    // ساخت HTML کارت‌ها — فقط لغات صفحه فعلی
    const cardsHTML = pageWords.map((word, idx) => {
        const index = startIdx + idx; // شماره سراسری
        const wordTags = this.getTagsForWord(word.id);
        const hasTag = wordTags.length > 0;
        const isFav = this.favorites.has(word.id);
        const srsLevel = this.srsData[word.id] ? this.srsData[word.id].level : 0;
        const genderSym = word.gender ? this.getGenderSymbol(word.gender) : '';
        const typeLabel = word.type ? this.getTypeLabel(word.type) : '';

        const typeIconMap = {
            noun: 'fa-book',
            verb: 'fa-bolt',
            adjective: 'fa-palette',
            adverb: 'fa-clock',
            preposition: 'fa-link',
            other: 'fa-ellipsis'
        };
        const typeIcon = typeIconMap[word.type] || 'fa-tag';

        // مثال حذف شد — فقط در جزئیات لغت نمایش داده می‌شود

        const tagsHTML = hasTag
            ? `<div class="wl-tags">
                 ${wordTags.map(tag => `
                    <span class="wl-tag-chip" style="background: ${tag.color};" title="${this.escapeHtml(tag.name)}">
                        <i class="fas fa-tag"></i>${this.escapeHtml(tag.name)}
                    </span>
                 `).join('')}
               </div>`
            : '';

        return `
            <div class="wl-card" data-id="${word.id}" data-type="${word.type || ''}">
                <div class="wl-card-top">
                    <div class="wl-card-top-left">
                        <span class="wl-number">${this._wlFaNum(index + 1)}</span>
                        <span class="wl-srs wl-srs-${srsLevel}" title="سطح یادگیری: ${this.getSRSLevelText(srsLevel)}">
                            <i class="fas fa-brain"></i> سطح ${this._wlFaNum(srsLevel)}
                        </span>
                    </div>
                    <button class="wl-fav-btn ${isFav ? 'active' : ''}" data-id="${word.id}" data-action="favorite" title="${isFav ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'}" aria-label="علاقه‌مندی">
                        <i class="fas fa-star"></i>
                    </button>
                </div>

                <div class="wl-card-body">
                    <div class="wl-word-row">
                        <span class="wl-word">${this.escapeHtml(word.german)}</span>
                        ${genderSym ? `<span class="wl-gender ${word.gender}">${genderSym}</span>` : ''}
                        ${typeLabel ? `<span class="wl-type-pill" data-type="${word.type}"><i class="fas ${typeIcon}"></i>${typeLabel}</span>` : ''}
                    </div>
                    <div class="wl-meaning">${this.escapeHtml(word.persian)}</div>
                    ${tagsHTML}
                </div>

                <div class="wl-actions">
                    <button class="wl-act wl-act-primary" data-id="${word.id}" data-action="view">
                        <i class="fas fa-eye"></i><span class="wl-act-label">${isGerman ? 'مشاهده' : 'View'}</span>
                    </button>
                    <button class="wl-act wl-act-emerald" data-id="${word.id}" data-action="practice">
                        <i class="fas fa-graduation-cap"></i><span class="wl-act-label">${LanguageSystem.t('practice.start')}</span>
                    </button>
                    <button class="wl-act wl-act-icon" data-id="${word.id}" data-word="${this.escapeHtml(word.german)}" data-action="tag" title="${isGerman ? 'مدیریت پوشه‌ها' : 'Folders'}" aria-label="پوشه‌ها">
                        <i class="fas fa-folder-plus"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // ساخت HTML صفحه‌بندی
    const paginationHTML = this._renderWordListPagination(this._wlCurrentPage, totalPages, totalWords, startIdx, endIdx);

    container.innerHTML = `
        <div class="wl-wrap">
            <div class="wl-toolbar">
                <div class="wl-toolbar-info">
                    <span class="wl-count-pill">
                        <i class="fas fa-layer-group"></i>
                        ${this._wlFaNum(filteredWords.length)} لغت
                    </span>
                    <span class="wl-sort-hint">مرتب‌سازی: <strong style="color:var(--wl-primary)">${currentSortName}</strong></span>
                </div>
            </div>
            <div class="wl-grid">
                ${cardsHTML}
            </div>
            ${paginationHTML}
        </div>
    `;

    // راه‌اندازی رویدادهای صفحه‌بندی
    this._setupWordListPaginationEvents(totalPages);

    // راه‌اندازی مجدد رویدادها
    this.setupWordListEventListeners();
    this.setupFilterButtons();
    this.setupTagWordButtons();
    this.renderTagFilterBar();
};

/* ============================================================
   رندر صفحه‌بندی لیست لغات
   ============================================================ */
GermanDictionary.prototype._renderWordListPagination = function(currentPage, totalPages, totalWords, startIdx, endIdx) {
    // اگر فقط یک صفحه است و کمتر از perPage لغت داریم، صفحه‌بندی را نمایش نده
    if (totalPages <= 1) {
        return `
            <div class="wl-pagination">
                <span class="wl-page-info">
                    ${this._wlFaNum(startIdx + 1)} تا ${this._wlFaNum(endIdx)} از ${this._wlFaNum(totalWords)} لغت
                </span>
            </div>
        `;
    }

    // ساخت لیست صفحات با ellipsis
    const pages = [];
    const showAround = 1; // تعداد صفحات اطراف صفحه فعلی
    const showEdges = 1;  // تعداد صفحات ابتدا و انتها

    for (let i = 1; i <= totalPages; i++) {
        // نمایش صفحه اول، آخر، صفحات اطراف فعلی
        if (i === 1 || i === totalPages ||
            (i >= currentPage - showAround && i <= currentPage + showAround)) {
            pages.push({ type: 'page', num: i });
        } else if (i === 2 || i === totalPages - 1) {
            // نمایش ellipsis فقط یک بار در هر سمت
            const lastItem = pages[pages.length - 1];
            if (lastItem && lastItem.type !== 'ellipsis') {
                pages.push({ type: 'ellipsis', num: i });
            }
        }
    }

    const pagesHTML = pages.map(p => {
        if (p.type === 'ellipsis') {
            return `<span class="wl-page-ellipsis">…</span>`;
        }
        return `<button class="wl-page-btn ${p.num === currentPage ? 'active' : ''}" data-page="${p.num}">${this._wlFaNum(p.num)}</button>`;
    }).join('');

    const faCurrent = this._wlFaNum(currentPage);
    const faTotal = this._wlFaNum(totalPages);
    const faStart = this._wlFaNum(startIdx + 1);
    const faEnd = this._wlFaNum(endIdx);
    const faTotalWords = this._wlFaNum(totalWords);

    return `
        <div class="wl-pagination">
            <span class="wl-page-info">
                ${faStart}–${faEnd} از ${faTotalWords} لغت
            </span>
            <button class="wl-page-btn wl-page-nav" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} title="صفحه قبل" aria-label="صفحه قبل">
                <i class="fas fa-chevron-right"></i>
            </button>
            ${pagesHTML}
            <button class="wl-page-btn wl-page-nav" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''} title="صفحه بعد" aria-label="صفحه بعد">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="wl-page-jumper">
                <span>صفحه</span>
                <input type="number" id="wl-page-jump-input" min="1" max="${totalPages}" value="${currentPage}" />
                <span>از ${faTotal}</span>
            </div>
        </div>
    `;
};

/* ============================================================
   راه‌اندازی رویدادهای صفحه‌بندی
   ============================================================ */
GermanDictionary.prototype._setupWordListPaginationEvents = function(totalPages) {
    const self = this;
    const container = document.getElementById('word-list-container');
    if (!container) return;

    // کلیک روی دکمه‌های صفحه
    container.querySelectorAll('.wl-page-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (btn.disabled) return;
            const page = parseInt(btn.dataset.page);
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                self._wlCurrentPage = page;
                // رندر مجدد با حفظ فیلتر فعلی
                const activeFilter = document.querySelector('.filter-btn.active');
                self.renderWordList(activeFilter ? activeFilter.dataset.filter : 'all');
                // اسکرول به بالای لیست
                const wlSection = document.getElementById('word-list-section');
                if (wlSection) {
                    wlSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // صفحه‌سنج (page jumper)
    const jumper = container.querySelector('#wl-page-jump-input');
    if (jumper) {
        jumper.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const page = parseInt(jumper.value);
                if (!isNaN(page) && page >= 1 && page <= totalPages) {
                    self._wlCurrentPage = page;
                    const activeFilter = document.querySelector('.filter-btn.active');
                    self.renderWordList(activeFilter ? activeFilter.dataset.filter : 'all');
                    const wlSection = document.getElementById('word-list-section');
                    if (wlSection) {
                        wlSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } else {
                    self.showToast('شماره صفحه نامعتبر است', 'warning');
                    jumper.value = self._wlCurrentPage;
                }
            }
        });
    }
};

GermanDictionary.prototype.setupTagWordButtons = function() {
    document.querySelectorAll('.tag-word-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const wordId = parseInt(btn.dataset.id);
            const wordGerman = btn.dataset.word;
            this.showTagSelectionForWord(wordId, wordGerman);
        };
    });
};

GermanDictionary.prototype.getSRSLevelText = function(level) {
    const texts = {
        0: 'جدید یا نیاز به تمرین بیشتر',
        1: 'در حال یادگیری',
        2: 'نیمه آشنا',
        3: 'آشنا',
        4: 'تقریبا مسلط',
        5: 'کاملا مسلط'
    };
    return texts[level] || 'در حال یادگیری';
};

GermanDictionary.prototype.setupFloatingSortButton = function() {
    const sortBtn = document.getElementById('floating-sort-btn');
    const modal = document.getElementById('sort-modal');
    const closeBtn = document.getElementById('close-sort-modal');

    if (!sortBtn || !modal) return;

    modal.style.display = 'none';

    const updateActiveSortOption = () => {
        const currentSort = localStorage.getItem('wordListSort') || 'alphabetical';
        document.querySelectorAll('.sort-modal-option').forEach(option => {
            if (option.dataset.sort === currentSort) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    };

    const modalBody = modal.querySelector('.sort-modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <button class="sort-modal-option" data-sort="alphabetical">
                <i class="fas fa-sort-alpha-down"></i> الفبایی (آلمانی)
            </button>
            <button class="sort-modal-option" data-sort="alphabetical-persian">
                <i class="fas fa-sort-alpha-down"></i> الفبایی (فارسی)
            </button>
            <div class="sort-divider"></div>
            <button class="sort-modal-option" data-sort="date-desc">
                <i class="fas fa-calendar-plus"></i> جدیدترین
            </button>
            <button class="sort-modal-option" data-sort="date-asc">
                <i class="fas fa-calendar-minus"></i> قدیمی‌ترین
            </button>
            <div class="sort-divider"></div>
            <button class="sort-modal-option" data-sort="srs-level">
                <i class="fas fa-brain"></i> سطح یادگیری (SRS)
            </button>
            <button class="sort-modal-option" data-sort="tag">
                <i class="fas fa-folder"></i> بر اساس پوشه
            </button>
            <div class="sort-divider"></div>
            <button class="sort-modal-option" data-sort="random">
                <i class="fas fa-random"></i> تصادفی
            </button>
        `;
    }

    // دکمه سورت — باز کردن مودال
    sortBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        updateActiveSortOption();
        modal.style.display = 'flex';
    };

    // دکمه بستن
    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            modal.style.display = 'none';
        };
    }

    // بستن با کلیک روی پس‌زمینه
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };

    // جلوگیری از بسته شدن با کلیک داخل محتوا
    const modalContent = modal.querySelector('.sort-modal-content');
    if (modalContent) {
        modalContent.onclick = (e) => e.stopPropagation();
    }

    const self = this;

    // ===== Event Delegation روی بدنه مودال =====
    // این روش مقاوم در براره re-render است: حتی اگر محتوای مودال
    // تغییر کند، listener روی modalBody باقی می‌ماند.
    if (modalBody) {
        // حذف handler قبلی اگر وجود داشت
        if (this._sortModalClickHandler) {
            modalBody.removeEventListener('click', this._sortModalClickHandler);
        }

        this._sortModalClickHandler = async (e) => {
            const option = e.target.closest('.sort-modal-option');
            if (!option) return;

            e.stopPropagation();
            const sortType = option.dataset.sort;
            const activeFilter = document.querySelector('.filter-btn.active');
            const filter = activeFilter ? activeFilter.dataset.filter : 'all';

            localStorage.setItem('wordListSort', sortType);
            await self.sortWordListAdvanced(filter, sortType);
            modal.style.display = 'none';

            const sortNames = {
                'alphabetical': 'الفبایی (آلمانی)',
                'alphabetical-persian': 'الفبایی (فارسی)',
                'date-desc': 'جدیدترین',
                'date-asc': 'قدیمی‌ترین',
                'srs-level': 'سطح یادگیری',
                'tag': 'بر اساس پوشه',
                'random': 'تصادفی'
            };
            self.showToast(`مرتب‌سازی بر اساس ${sortNames[sortType] || sortType}`, 'success');
        };

        modalBody.addEventListener('click', this._sortModalClickHandler);
    }
};

GermanDictionary.prototype.setupSortButtonScroll = function() {
    const sortBtn = document.getElementById('floating-sort-btn');
    if (!sortBtn) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            // اسکرول به پایین - مخفی کردن دکمه
            sortBtn.classList.add('hide');
        } else {
            // اسکرول به بالا - نمایش دکمه
            sortBtn.classList.remove('hide');
        }
        
        lastScroll = currentScroll;
    });
};

GermanDictionary.prototype.addExample = async function(wordId, exampleData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('دیتابیس در دسترس نیست'));
                return;
            }

            const transaction = this.db.transaction(['examples'], 'readwrite');
            const store = transaction.objectStore('examples');
            
            const example = {
                wordId: wordId,
                german: exampleData.german,
                persian: exampleData.persian,
                createdAt: new Date().toISOString()
            };
            
            const request = store.add(example);
            
            request.onsuccess = () => {
                this.showToast('✅ مثال با موفقیت اضافه شد', 'success');
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('❌ خطا در افزودن مثال:', event.target.error);
                this.showToast('❌ خطا در افزودن مثال', 'error');
                reject(event.target.error);
            };
        });
};

GermanDictionary.prototype.getExamplesForWord = async function(wordId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve([]);
                return;
            }

            const transaction = this.db.transaction(['examples'], 'readonly');
            const store = transaction.objectStore('examples');
            const index = store.index('wordId');
            const request = index.getAll(wordId);
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (event) => {
                console.error('خطا در دریافت مثال‌ها:', event.target.error);
                resolve([]);
            };
        });
};

GermanDictionary.prototype.loadFavorites = async function() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }

            const transaction = this.db.transaction(['favorites'], 'readonly');
            const store = transaction.objectStore('favorites');
            const request = store.getAll();
            
            request.onsuccess = () => {
                this.favorites = new Set(request.result.map(item => item.wordId));
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('خطا در بارگذاری علاقه‌مندی‌ها:', event.target.error);
                resolve();
            };
        });
};

GermanDictionary.prototype.toggleFavorite = async function(wordId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['favorites'], 'readwrite');
            const store = transaction.objectStore('favorites');
            
            if (this.favorites.has(wordId)) {
                const request = store.delete(wordId);
                request.onsuccess = () => {
                    this.favorites.delete(wordId);
                    this.showToast('⭐ از علاقه‌مندی‌ها حذف شد', 'info');
                    this.updateFavoritesCount();
                    resolve(false);
                };
            } else {
                const request = store.add({ wordId });
                request.onsuccess = () => {
                    this.favorites.add(wordId);
                    this.showToast('✅ به علاقه‌مندی‌ها اضافه شد', 'success');
                    this.updateFavoritesCount();
                    resolve(true);
                };
            }
        });
};

GermanDictionary.prototype.renderFavorites = async function() {
    const words = await this.getAllWords();
    const favoriteWords = words.filter(word => this.favorites.has(word.id));
    
    // پیدا کردن کانتینر صحیح
    let container = document.getElementById('favorites-container');
    if (!container) {
        const favoritesSection = document.getElementById('favorites-section');
        if (favoritesSection) {
            container = favoritesSection.querySelector('.word-list');
            if (!container) {
                // ایجاد کانتینر اگر وجود نداشت
                const wordCard = favoritesSection.querySelector('.word-card');
                if (wordCard) {
                    const listDiv = document.createElement('div');
                    listDiv.id = 'favorites-container';
                    listDiv.className = 'word-list';
                    wordCard.appendChild(listDiv);
                    container = listDiv;
                }
            }
        }
    }
    
    if (!container) return;
    
    const isGerman = LanguageSystem.isGerman();
    document.getElementById('favorites-count').textContent = favoriteWords.length;
    
    if (favoriteWords.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-star"></i></div>
                <h3>${isGerman ? 'لیست علاقه‌مندی‌ها خالی است' : 'Favorites list is empty'}</h3>
                <p>${isGerman ? 'با کلیک روی ستاره کنار هر لغت، به این لیست اضافه کنید' : 'Click on the star next to each word to add to this list'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = favoriteWords.map(word => `
        <div class="word-list-item" data-id="${word.id}">
            <div class="word-list-item-header">
                <div class="word-list-item-title-section">
                    <span class="word-number">${word.id}</span>
                    <i class="fas fa-star favorite-icon active" data-id="${word.id}"></i>
                    <span class="word-list-item-title">${word.german}</span>
                    ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                </div>
            </div>
            <div class="word-list-item-meaning">${word.persian}</div>
            <div class="word-list-item-actions">
                <button class="btn btn-sm btn-outline view-word" data-id="${word.id}">
                    <i class="fas fa-eye"></i> ${isGerman ? 'مشاهده' : 'View'}
                </button>
                <button class="btn btn-sm btn-outline practice-word" data-id="${word.id}">
                    <i class="fas fa-brain"></i> ${LanguageSystem.t('practice.start')}
                </button>
            </div>
        </div>
    `).join('');
    
    this.setupWordListEventListeners();
};

GermanDictionary.prototype.updateFavoritesCount = function() {
    const countElement = document.getElementById('favorites-count');
    if (countElement) {
        countElement.textContent = this.favorites.size;
    }
};

