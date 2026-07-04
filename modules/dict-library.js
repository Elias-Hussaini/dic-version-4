/* ================================================================
   dict-library.js — کتابخانه شخصی (نسخه پریمیوم ۲۰۲۵)
   ----------------------------------------------------------------
   • طراحی مدرن با استایل‌های inline (CSS-in-JS)
   • نمایشگر PDF پیشرفته با PDF.js
   • حالت تمام‌صفحه (fullscreen)
   • کنترل‌ها: صفحه‌بندی، زوم، چرخش، دانلود
   • ریسپانسیو کامل برای موبایل و دسکتاپ
   • پشتیبانی کامل از Dark Mode
   ================================================================ */

/* ============================================================
   تزریق استایل‌های پریمیوم کتابخانه (یک‌بار)
   ============================================================ */
GermanDictionary.prototype._injectLibraryProStyles = function() {
    if (document.getElementById('lb-pro-styles')) return;
    const style = document.createElement('style');
    style.id = 'lb-pro-styles';
    style.textContent = `
        /* ===== متغیرهای پریمیوم (هماهنگ با سایر بخش‌ها) ===== */
        .lb-wrap {
            --lb-primary: #4361ee;
            --lb-primary-d: #3a56d4;
            --lb-primary-l: #eef2ff;
            --lb-emerald: #10b981;
            --lb-violet: #8b5cf6;
            --lb-amber: #f59e0b;
            --lb-rose: #f43f5e;
            --lb-cyan: #06b6d4;
            --lb-ink: #0f172a;
            --lb-ink-2: #1e293b;
            --lb-slate-600: #475569;
            --lb-muted: #64748b;
            --lb-muted-2: #94a3b8;
            --lb-line: #e2e8f0;
            --lb-line-2: #f1f5f9;
            --lb-card: #ffffff;
            --lb-card-2: #f8fafc;
            --lb-radius: 20px;
            --lb-radius-m: 16px;
            --lb-radius-s: 12px;
            --lb-radius-xs: 8px;
            --lb-shadow-sm: 0 1px 2px rgba(15,23,42,.04);
            --lb-shadow: 0 4px 12px rgba(15,23,42,.06);
            --lb-shadow-md: 0 8px 24px rgba(15,23,42,.08);
            --lb-shadow-lg: 0 20px 50px rgba(15,23,42,.15);
            font-family: 'Vazirmatn', Tahoma, sans-serif;
            color: var(--lb-ink);
            line-height: 1.6;
        }
        body.dark-mode .lb-wrap {
            --lb-ink: #f1f5f9;
            --lb-ink-2: #e2e8f0;
            --lb-slate-600: #cbd5e1;
            --lb-muted: #94a3b8;
            --lb-muted-2: #64748b;
            --lb-line: #1e293b;
            --lb-line-2: #1e293b;
            --lb-card: #1e293b;
            --lb-card-2: #0f172a;
            --lb-primary-l: rgba(67,97,238,.15);
            --lb-shadow-sm: 0 1px 2px rgba(0,0,0,.3);
            --lb-shadow: 0 4px 12px rgba(0,0,0,.3);
            --lb-shadow-md: 0 8px 24px rgba(0,0,0,.35);
            --lb-shadow-lg: 0 20px 50px rgba(0,0,0,.5);
        }
        .lb-wrap i, .lb-wrap i::before,
        .lb-wrap [class^="fa-"]::before, .lb-wrap [class*=" fa-"]::before {
            font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
        }
        .lb-wrap i.fas, .lb-wrap i.fa-solid { font-weight: 900 !important; }
        .lb-wrap i.far, .lb-wrap i.fa-regular { font-weight: 400 !important; }

        /* ===== گرید کتاب‌ها (ریسپانسیو) ===== */
        .lb-books-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 20px;
        }
        @media (max-width: 640px) {
            .lb-books-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }
        }

        /* ===== کارت کتاب ===== */
        .lb-book-card {
            position: relative;
            background: var(--lb-card);
            border: 1px solid var(--lb-line);
            border-radius: var(--lb-radius);
            overflow: hidden;
            box-shadow: var(--lb-shadow);
            cursor: pointer;
            transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease, border-color .3s ease;
            display: flex;
            flex-direction: column;
        }
        .lb-book-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--lb-shadow-lg);
            border-color: var(--lb-primary);
        }
        .lb-book-cover {
            position: relative;
            aspect-ratio: 3/4;
            background: linear-gradient(135deg, #4361ee, #3a0ca3);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .lb-book-cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .lb-book-cover-placeholder {
            font-size: 56px;
            color: rgba(255,255,255,.35);
            transition: transform .3s ease;
        }
        .lb-book-card:hover .lb-book-cover-placeholder {
            transform: scale(1.1);
        }
        .lb-book-cover-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.7) 100%);
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding: 12px;
            opacity: 0;
            transition: opacity .3s ease;
        }
        .lb-book-card:hover .lb-book-cover-overlay { opacity: 1; }
        .lb-book-cover-overlay-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: rgba(255,255,255,.95);
            color: #0f172a;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
            font-family: inherit;
            border: none;
            cursor: pointer;
            transition: transform .2s ease;
        }
        .lb-book-cover-overlay-btn:hover { transform: scale(1.05); }

        .lb-book-info {
            padding: 14px 16px 16px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
        }
        .lb-book-title {
            font-size: 15px;
            font-weight: 800;
            color: var(--lb-ink);
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            min-height: 42px;
        }
        .lb-book-author {
            font-size: 12px;
            color: var(--lb-muted);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .lb-book-author i { font-size: 10px; }
        .lb-book-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-top: 8px;
            padding-top: 10px;
            border-top: 1px dashed var(--lb-line);
        }
        .lb-book-date {
            font-size: 11px;
            color: var(--lb-muted-2);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .lb-book-actions {
            display: flex;
            gap: 4px;
        }
        .lb-book-act-btn {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            border: 1px solid var(--lb-line);
            background: var(--lb-card-2);
            color: var(--lb-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            transition: all .2s ease;
        }
        .lb-book-act-btn:hover {
            transform: translateY(-1px);
        }
        .lb-book-act-btn.act-download:hover {
            background: rgba(16,185,129,.1);
            border-color: var(--lb-emerald);
            color: #059669;
        }
        .lb-book-act-btn.act-delete:hover {
            background: rgba(244,63,94,.1);
            border-color: var(--lb-rose);
            color: #e11d48;
        }

        /* ===== حالت خالی ===== */
        .lb-empty {
            text-align: center;
            padding: 60px 20px;
            background: var(--lb-card);
            border: 1px dashed var(--lb-line);
            border-radius: var(--lb-radius);
        }
        .lb-empty-ic {
            width: 90px; height: 90px;
            margin: 0 auto 18px;
            border-radius: 50%;
            background: var(--lb-card-2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            color: var(--lb-muted-2);
        }
        .lb-empty h3 { margin: 0 0 8px; font-size: 18px; font-weight: 800; color: var(--lb-ink); }
        .lb-empty p { margin: 0; font-size: 14px; color: var(--lb-muted); }

        /* ===== مودال PDF Reader (تمام‌صفحه) ===== */
        #lb-pdf-modal {
            position: fixed;
            inset: 0;
            z-index: 100000;
            background: rgba(15,23,42,.92);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: none;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity .3s ease;
        }
        #lb-pdf-modal.visible {
            display: flex;
            opacity: 1;
        }
        #lb-pdf-modal.lb-fullscreen .lb-reader-container {
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            border-radius: 0 !important;
        }

        .lb-reader-container {
            background: var(--lb-card);
            border-radius: var(--lb-radius);
            width: 95vw;
            max-width: 1200px;
            height: 92vh;
            max-height: 900px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 30px 80px rgba(0,0,0,.4);
            transform: scale(.95);
            transition: transform .3s cubic-bezier(.22,1,.36,1);
        }
        #lb-pdf-modal.visible .lb-reader-container { transform: scale(1); }

        /* هدر نمایشگر */
        .lb-reader-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 20px;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #134e4a 100%);
            color: #f8fafc;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
        }
        .lb-reader-header::before {
            content: "";
            position: absolute;
            top: -60px; right: -30px;
            width: 180px; height: 180px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(16,185,129,.3), transparent 70%);
            filter: blur(40px);
            pointer-events: none;
        }
        .lb-reader-title {
            position: relative;
            z-index: 1;
            font-size: 15px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
            flex: 1;
        }
        .lb-reader-title i {
            width: 32px; height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: rgba(255,255,255,.15);
            font-size: 14px;
            flex-shrink: 0;
        }
        .lb-reader-title-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .lb-reader-close {
            position: relative;
            z-index: 1;
            width: 36px; height: 36px;
            border-radius: 10px;
            border: none;
            background: rgba(255,255,255,.15);
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all .2s ease;
            flex-shrink: 0;
        }
        .lb-reader-close:hover {
            background: rgba(244,63,94,.5);
            transform: rotate(90deg);
        }

        /* نوار ابزار */
        .lb-reader-toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: var(--lb-card-2);
            border-bottom: 1px solid var(--lb-line);
            flex-shrink: 0;
            flex-wrap: wrap;
        }
        .lb-tool-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            min-width: 38px;
            height: 38px;
            padding: 0 10px;
            border-radius: 10px;
            border: 1px solid var(--lb-line);
            background: var(--lb-card);
            color: var(--lb-slate-600);
            font-family: inherit;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all .2s ease;
        }
        .lb-tool-btn:hover:not(:disabled) {
            border-color: var(--lb-primary);
            color: var(--lb-primary);
            background: var(--lb-primary-l);
            transform: translateY(-1px);
        }
        .lb-tool-btn:disabled {
            opacity: .4;
            cursor: not-allowed;
        }
        .lb-tool-btn i { font-size: 13px; }
        .lb-tool-btn.primary {
            background: linear-gradient(135deg, var(--lb-primary), var(--lb-primary-d));
            border-color: transparent;
            color: #fff;
            box-shadow: 0 3px 10px rgba(67,97,238,.25);
        }
        .lb-tool-btn.primary:hover {
            box-shadow: 0 5px 14px rgba(67,97,238,.35);
            color: #fff;
        }
        .lb-tool-btn.active {
            background: linear-gradient(135deg, var(--lb-primary), var(--lb-primary-d));
            border-color: transparent;
            color: #fff;
        }

        .lb-tool-divider {
            width: 1px;
            height: 24px;
            background: var(--lb-line);
            margin: 0 4px;
        }

        .lb-page-nav {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--lb-card);
            border: 1px solid var(--lb-line);
            border-radius: 10px;
            padding: 4px 8px;
        }
        .lb-page-input {
            width: 50px;
            height: 30px;
            border: 1px solid var(--lb-line);
            border-radius: 6px;
            background: var(--lb-card-2);
            color: var(--lb-ink);
            font-family: inherit;
            font-size: 12px;
            font-weight: 700;
            text-align: center;
            outline: none;
        }
        .lb-page-input:focus {
            border-color: var(--lb-primary);
            box-shadow: 0 0 0 3px rgba(67,97,238,.12);
        }
        .lb-page-info {
            font-size: 12px;
            font-weight: 700;
            color: var(--lb-muted);
            white-space: nowrap;
        }
        .lb-page-info b { color: var(--lb-ink); }

        .lb-zoom-display {
            font-size: 12px;
            font-weight: 700;
            color: var(--lb-muted);
            min-width: 48px;
            text-align: center;
        }

        .lb-toolbar-spacer { flex: 1; }

        /* محتوای PDF */
        .lb-reader-body {
            flex: 1;
            overflow: auto;
            background: #525659;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 20px;
            position: relative;
        }
        body.dark-mode .lb-reader-body { background: #1a1a1a; }

        .lb-canvas-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0;
        }
        #lb-pdf-canvas {
            display: block;
            box-shadow: 0 10px 40px rgba(0,0,0,.4);
            background: #fff;
            border-radius: 4px;
        }
        .lb-pdf-loading {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: #fff;
            background: rgba(0,0,0,.5);
            backdrop-filter: blur(4px);
            z-index: 10;
        }
        .lb-pdf-loading-spinner {
            width: 48px; height: 48px;
            border: 4px solid rgba(255,255,255,.2);
            border-top-color: #fff;
            border-radius: 50%;
            animation: lb-spin 1s linear infinite;
        }
        @keyframes lb-spin { to { transform: rotate(360deg); } }
        .lb-pdf-loading-text {
            font-size: 14px;
            font-weight: 700;
            font-family: 'Vazirmatn', sans-serif;
        }

        /* فوتر */
        .lb-reader-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 16px;
            background: var(--lb-card-2);
            border-top: 1px solid var(--lb-line);
            flex-shrink: 0;
        }
        .lb-reader-progress {
            flex: 1;
            height: 6px;
            background: var(--lb-line);
            border-radius: 3px;
            overflow: hidden;
            max-width: 400px;
        }
        .lb-reader-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--lb-primary), var(--lb-emerald));
            border-radius: 3px;
            transition: width .3s ease;
            width: 0%;
        }
        .lb-reader-footer-info {
            font-size: 11px;
            font-weight: 600;
            color: var(--lb-muted);
            white-space: nowrap;
        }

        /* ===== ریسپانسیو موبایل ===== */
        @media (max-width: 768px) {
            .lb-reader-container {
                width: 100vw !important;
                max-width: 100vw !important;
                height: 100vh !important;
                max-height: 100vh !important;
                border-radius: 0 !important;
            }
            .lb-reader-header { padding: 10px 14px; }
            .lb-reader-title { font-size: 13px; }
            .lb-reader-title i { width: 28px; height: 28px; font-size: 12px; }
            .lb-reader-toolbar {
                padding: 8px 10px;
                gap: 5px;
            }
            .lb-tool-btn {
                min-width: 34px;
                height: 34px;
                padding: 0 8px;
                font-size: 12px;
            }
            .lb-tool-btn .lb-tool-label { display: none; }
            .lb-tool-divider { display: none; }
            .lb-page-input { width: 42px; height: 28px; font-size: 11px; }
            .lb-page-info { font-size: 11px; }
            .lb-zoom-display { font-size: 11px; min-width: 40px; }
            .lb-reader-body { padding: 10px; }
            .lb-reader-footer { padding: 8px 12px; }
            .lb-reader-footer-info { font-size: 10px; }
        }

        @media (max-width: 480px) {
            .lb-books-grid {
                grid-template-columns: 1fr;
                gap: 14px;
            }
            .lb-book-cover-placeholder { font-size: 44px; }
        }

        /* ===== استایل فرم افزودن کتاب (بهبود) ===== */
        #library-section .lb-wrap .lb-add-form {
            background: var(--lb-card-2);
            border: 1px solid var(--lb-line);
            border-radius: var(--lb-radius);
            padding: 22px;
            margin-bottom: 24px;
        }
    `;
    document.head.appendChild(style);
};

/* ============================================================
   ذخیره کتاب در IndexedDB
   ============================================================ */
GermanDictionary.prototype.saveBookToIndexedDB = async function(bookData) {
    return new Promise((resolve, reject) => {
        if (!this.db) {
            reject(new Error('دیتابیس در دسترس نیست'));
            return;
        }

        const transaction = this.db.transaction(['books'], 'readwrite');
        const store = transaction.objectStore('books');
        const request = store.add(bookData);

        request.onsuccess = () => {
            console.log('✅ کتاب در دیتابیس ذخیره شد');
            resolve(request.result);
        };

        request.onerror = (event) => {
            console.error('❌ خطا در ذخیره کتاب:', event.target.error);
            reject(event.target.error);
        };
    });
};

/* ============================================================
   دریافت همه کتاب‌ها از IndexedDB
   ============================================================ */
GermanDictionary.prototype.getAllBooksFromIndexedDB = async function() {
    return new Promise((resolve, reject) => {
        if (!this.db) {
            resolve([]);
            return;
        }

        const transaction = this.db.transaction(['books'], 'readonly');
        const store = transaction.objectStore('books');
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result || []);
        };

        request.onerror = (event) => {
            console.error('خطا در دریافت کتاب‌ها:', event.target.error);
            resolve([]);
        };
    });
};

/* ============================================================
   حذف کتاب از IndexedDB
   ============================================================ */
GermanDictionary.prototype.deleteBookFromIndexedDB = async function(bookId) {
    return new Promise((resolve, reject) => {
        if (!this.db) {
            reject(new Error('دیتابیس در دسترس نیست'));
            return;
        }

        const transaction = this.db.transaction(['books'], 'readwrite');
        const store = transaction.objectStore('books');
        const request = store.delete(bookId);

        request.onsuccess = () => {
            console.log('✅ کتاب حذف شد');
            resolve();
        };

        request.onerror = (event) => {
            console.error('❌ خطا در حذف کتاب:', event.target.error);
            reject(event.target.error);
        };
    });
};

/* ============================================================
   راه‌اندازی کتابخانه
   ============================================================ */
GermanDictionary.prototype.setupLibrary = async function() {
    console.log('📚 راه‌اندازی کتابخانه...');

    // تزریق استایل‌ها
    this._injectLibraryProStyles();

    // بارگذاری PDF.js از CDN (اگر هنوز بارگذاری نشده)
    this._ensurePDFJSLoaded();

    setTimeout(async () => {
        const addBookBtn = document.getElementById('add-book-btn');
        const addBookForm = document.getElementById('add-book-form');
        const cancelBtn = document.getElementById('cancel-book-btn');
        const saveBtn = document.getElementById('save-book-btn');

        if (!addBookBtn) {
            console.error('❌ دکمه add-book-btn پیدا نشد');
            return;
        }

        // باز کردن فرم
        addBookBtn.onclick = (e) => {
            e.preventDefault();
            addBookForm.style.display = 'block';
            addBookBtn.style.display = 'none';
        };

        // انصراف
        if (cancelBtn) {
            cancelBtn.onclick = (e) => {
                e.preventDefault();
                addBookForm.style.display = 'none';
                addBookBtn.style.display = 'flex';
                this.clearBookForm();
            };
        }

        // ذخیره کتاب
        if (saveBtn) {
            saveBtn.onclick = (e) => {
                e.preventDefault();
                this.saveNewBookToIndexedDB();
            };
        }

        // بارگذاری کتاب‌ها
        await this.renderBooksListFromIndexedDB();

        console.log('✅ کتابخانه راه‌اندازی شد');
    }, 500);
};

/* ============================================================
   بارگذاری PDF.js از CDN
   ============================================================ */
GermanDictionary.prototype._ensurePDFJSLoaded = function() {
    if (window.pdfjsLib) {
        // تنظیم worker اگر هنوز تنظیم نشده
        if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        return Promise.resolve();
    }

    if (this._pdfjsLoading) return this._pdfjsLoading;

    this._pdfjsLoading = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            if (window.pdfjsLib) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                console.log('✅ PDF.js بارگذاری شد');
                resolve();
            } else {
                reject(new Error('PDF.js بارگذاری نشد'));
            }
        };
        script.onerror = () => {
            console.error('❌ خطا در بارگذاری PDF.js');
            reject(new Error('خطا در بارگذاری PDF.js'));
        };
        document.head.appendChild(script);
    });

    return this._pdfjsLoading;
};

/* ============================================================
   ذخیره کتاب جدید
   ============================================================ */
GermanDictionary.prototype.saveNewBookToIndexedDB = async function() {
    const title = document.getElementById('book-title')?.value.trim();
    const author = document.getElementById('book-author')?.value.trim();
    const pdfFile = document.getElementById('book-pdf')?.files[0];
    const coverFile = document.getElementById('book-cover')?.files[0];

    if (!title || !author) {
        this.showToast('❌ لطفاً نام کتاب و نویسنده را وارد کنید', 'error');
        return;
    }

    if (!pdfFile) {
        this.showToast('❌ لطفاً فایل PDF کتاب را انتخاب کنید', 'error');
        return;
    }

    if (pdfFile.size > 50 * 1024 * 1024) {
        this.showToast('❌ حجم فایل PDF نباید بیشتر از 50 مگابایت باشد', 'error');
        return;
    }

    this.showToast('📥 در حال ذخیره کتاب... لطفاً صبر کنید', 'info');

    const pdfReader = new FileReader();
    pdfReader.onload = async (e) => {
        const pdfData = e.target.result;

        if (coverFile) {
            if (coverFile.size > 5 * 1024 * 1024) {
                this.showToast('❌ حجم تصویر جلد نباید بیشتر از 5 مگابایت باشد', 'error');
                return;
            }

            const coverReader = new FileReader();
            coverReader.onload = async (e2) => {
                await this.saveBookToStorage(title, author, pdfData, e2.target.result);
            };
            coverReader.readAsDataURL(coverFile);
        } else {
            await this.saveBookToStorage(title, author, pdfData, null);
        }
    };
    pdfReader.onerror = () => {
        this.showToast('❌ خطا در خواندن فایل PDF', 'error');
    };
    pdfReader.readAsDataURL(pdfFile);
};

/* ============================================================
   ذخیره کتاب در storage
   ============================================================ */
GermanDictionary.prototype.saveBookToStorage = async function(title, author, pdfData, coverData) {
    const newBook = {
        id: Date.now(),
        title: title,
        author: author,
        pdfData: pdfData,
        coverData: coverData,
        createdAt: new Date().toISOString()
    };

    try {
        await this.saveBookToIndexedDB(newBook);
        this.showToast(`✅ کتاب "${title}" با موفقیت اضافه شد`, 'success');
        this.clearBookForm();

        const addBookForm = document.getElementById('add-book-form');
        const addBookBtn = document.getElementById('add-book-btn');

        if (addBookForm) addBookForm.style.display = 'none';
        if (addBookBtn) addBookBtn.style.display = 'flex';

        await this.renderBooksListFromIndexedDB();
    } catch (error) {
        console.error('خطا در ذخیره کتاب:', error);
        this.showToast('❌ خطا در ذخیره کتاب. فضای کافی وجود ندارد', 'error');
    }
};

/* ============================================================
   رندر لیست کتاب‌ها (نسخه پریمیوم)
   ============================================================ */
GermanDictionary.prototype.renderBooksListFromIndexedDB = async function() {
    const books = await this.getAllBooksFromIndexedDB();
    const container = document.getElementById('books-list');
    const emptyState = document.getElementById('empty-library');

    if (!container) {
        console.error('❌ کانتینر books-list پیدا نشد');
        return;
    }

    console.log('📚 رندر کتاب‌ها، تعداد:', books.length);

    if (books.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        container.innerHTML = '';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // مرتب‌سازی بر اساس جدیدترین
    books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = `
        <div class="lb-wrap">
            <div class="lb-books-grid">
                ${books.map(book => this._renderBookCard(book)).join('')}
            </div>
        </div>
    `;

    // رویدادها
    this._setupBookCardEvents();
};

/* ============================================================
   رندر یک کارت کتاب
   ============================================================ */
GermanDictionary.prototype._renderBookCard = function(book) {
    const coverHTML = book.coverData
        ? `<img src="${book.coverData}" alt="${this.escapeHtml(book.title)}" />`
        : `<i class="fas fa-book lb-book-cover-placeholder"></i>`;

    const dateStr = this._lbFaDate(book.createdAt);

    return `
        <div class="lb-book-card" data-id="${book.id}">
            <div class="lb-book-cover">
                ${coverHTML}
                <div class="lb-book-cover-overlay">
                    <button class="lb-book-cover-overlay-btn" data-action="view" data-id="${book.id}">
                        <i class="fas fa-book-open"></i> مطالعه
                    </button>
                </div>
            </div>
            <div class="lb-book-info">
                <div class="lb-book-title">${this.escapeHtml(book.title)}</div>
                <div class="lb-book-author">
                    <i class="fas fa-user"></i> ${this.escapeHtml(book.author)}
                </div>
                <div class="lb-book-meta">
                    <span class="lb-book-date">
                        <i class="fas fa-calendar-alt"></i> ${dateStr}
                    </span>
                    <div class="lb-book-actions">
                        <button class="lb-book-act-btn act-download" data-action="download" data-id="${book.id}" title="دانلود" aria-label="دانلود">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="lb-book-act-btn act-delete" data-action="delete" data-id="${book.id}" title="حذف" aria-label="حذف">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/* ============================================================
   تبدیل تاریخ به فارسی
   ============================================================ */
GermanDictionary.prototype._lbFaDate = function(dateStr) {
    try {
        return new Date(dateStr).toLocaleDateString('fa-IR');
    } catch(e) {
        return '';
    }
};

/* ============================================================
   راه‌اندازی رویدادهای کارت‌های کتاب (event delegation)
   ============================================================ */
GermanDictionary.prototype._setupBookCardEvents = function() {
    const container = document.getElementById('books-list');
    if (!container) return;

    // حذف handler قبلی
    if (this._lbBookClickHandler) {
        container.removeEventListener('click', this._lbBookClickHandler);
    }

    this._lbBookClickHandler = (e) => {
        const actionEl = e.target.closest('[data-action]');
        const cardEl = e.target.closest('.lb-book-card');

        if (actionEl) {
            e.stopPropagation();
            const action = actionEl.dataset.action;
            const id = parseInt(actionEl.dataset.id);
            if (!id) return;

            if (action === 'view') {
                this.viewBookFromIndexedDB(id);
            } else if (action === 'download') {
                this._downloadBook(id);
            } else if (action === 'delete') {
                this._deleteBookWithConfirm(id);
            }
            return;
        }

        // کلیک روی کل کارت → مشاهده
        if (cardEl) {
            const id = parseInt(cardEl.dataset.id);
            if (id) this.viewBookFromIndexedDB(id);
        }
    };

    container.addEventListener('click', this._lbBookClickHandler);
};

/* ============================================================
   دانلود کتاب
   ============================================================ */
GermanDictionary.prototype._downloadBook = async function(bookId) {
    const books = await this.getAllBooksFromIndexedDB();
    const book = books.find(b => b.id === bookId);
    if (!book) {
        this.showToast('❌ کتاب یافت نشد', 'error');
        return;
    }

    try {
        const blob = this.dataURLToBlob(book.pdfData);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${book.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.showToast('📥 دانلود کتاب شروع شد', 'success');
    } catch (err) {
        console.error('خطا در دانلود:', err);
        this.showToast('❌ خطا در دانلود کتاب', 'error');
    }
};

/* ============================================================
   حذف کتاب با تأیید
   ============================================================ */
GermanDictionary.prototype._deleteBookWithConfirm = async function(bookId) {
    const books = await this.getAllBooksFromIndexedDB();
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    if (confirm(`آیا از حذف کتاب "${book.title}" مطمئن هستید؟`)) {
        await this.deleteBookFromIndexedDB(bookId);
        await this.renderBooksListFromIndexedDB();
        this.showToast('🗑️ کتاب حذف شد', 'info');
    }
};

/* ============================================================
   نمایش کتاب (PDF Reader پیشرفته)
   ============================================================ */
GermanDictionary.prototype.viewBookFromIndexedDB = async function(bookId) {
    const books = await this.getAllBooksFromIndexedDB();
    const book = books.find(b => b.id === bookId);

    if (!book) {
        this.showToast('❌ کتاب یافت نشد', 'error');
        return;
    }

    // اطمینان از بارگذاری PDF.js
    try {
        await this._ensurePDFJSLoaded();
    } catch (err) {
        this.showToast('❌ بارگذاری نمایشگر PDF ناموفق بود. اتصال اینترنت را بررسی کنید', 'error');
        return;
    }

    // ایجاد مودال (اگر وجود ندارد)
    let modal = document.getElementById('lb-pdf-modal');
    if (!modal) {
        this._createPDFReaderModal();
        modal = document.getElementById('lb-pdf-modal');
    }

    // تنظیم عنوان
    const titleEl = modal.querySelector('.lb-reader-title-text');
    if (titleEl) titleEl.textContent = book.title;

    // نمایش مودال
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';

    // راه‌اندازی نمایشگر PDF
    await this._renderPDF(book);
};

/* ============================================================
   ایجاد مودال PDF Reader
   ============================================================ */
GermanDictionary.prototype._createPDFReaderModal = function() {
    if (document.getElementById('lb-pdf-modal')) return;

    const modalHTML = `
        <div id="lb-pdf-modal">
            <div class="lb-reader-container">
                <!-- هدر -->
                <div class="lb-reader-header">
                    <div class="lb-reader-title">
                        <i class="fas fa-book-open"></i>
                        <span class="lb-reader-title-text">عنوان کتاب</span>
                    </div>
                    <button class="lb-reader-close" id="lb-pdf-close" title="بستن" aria-label="بستن">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- نوار ابزار -->
                <div class="lb-reader-toolbar">
                    <!-- ناوبری صفحات -->
                    <button class="lb-tool-btn" id="lb-first-page" title="اولین صفحه" aria-label="اولین صفحه">
                        <i class="fas fa-step-backward"></i>
                    </button>
                    <button class="lb-tool-btn" id="lb-prev-page" title="صفحه قبل" aria-label="صفحه قبل">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="lb-page-nav">
                        <input type="number" class="lb-page-input" id="lb-page-input" min="1" value="1" />
                        <span class="lb-page-info">/ <b id="lb-total-pages">--</b></span>
                    </div>
                    <button class="lb-tool-btn" id="lb-next-page" title="صفحه بعد" aria-label="صفحه بعد">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="lb-tool-btn" id="lb-last-page" title="آخرین صفحه" aria-label="آخرین صفحه">
                        <i class="fas fa-step-forward"></i>
                    </button>

                    <div class="lb-tool-divider"></div>

                    <!-- زوم -->
                    <button class="lb-tool-btn" id="lb-zoom-out" title="کوچک‌نمایی" aria-label="کوچک‌نمایی">
                        <i class="fas fa-search-minus"></i>
                    </button>
                    <span class="lb-zoom-display" id="lb-zoom-display">100%</span>
                    <button class="lb-tool-btn" id="lb-zoom-in" title="بزرگ‌نمایی" aria-label="بزرگ‌نمایی">
                        <i class="fas fa-search-plus"></i>
                    </button>
                    <button class="lb-tool-btn" id="lb-zoom-fit" title="تناسب با عرض" aria-label="تناسب با عرض">
                        <i class="fas fa-expand-arrows-alt"></i>
                    </button>

                    <div class="lb-tool-divider"></div>

                    <!-- چرخش -->
                    <button class="lb-tool-btn" id="lb-rotate-left" title="چرخش به چپ" aria-label="چرخش به چپ">
                        <i class="fas fa-rotate-left"></i>
                    </button>
                    <button class="lb-tool-btn" id="lb-rotate-right" title="چرخش به راست" aria-label="چرخش به راست">
                        <i class="fas fa-rotate-right"></i>
                    </button>

                    <div class="lb-tool-divider"></div>

                    <!-- دانلود و تمام‌صفحه -->
                    <button class="lb-tool-btn" id="lb-download" title="دانلود PDF" aria-label="دانلود">
                        <i class="fas fa-download"></i>
                        <span class="lb-tool-label">دانلود</span>
                    </button>
                    <button class="lb-tool-btn primary" id="lb-fullscreen" title="تمام‌صفحه" aria-label="تمام‌صفحه">
                        <i class="fas fa-expand"></i>
                        <span class="lb-tool-label">تمام‌صفحه</span>
                    </button>
                </div>

                <!-- محتوای PDF -->
                <div class="lb-reader-body" id="lb-reader-body">
                    <div class="lb-canvas-wrap">
                        <canvas id="lb-pdf-canvas"></canvas>
                    </div>
                    <div class="lb-pdf-loading" id="lb-pdf-loading" style="display: none;">
                        <div class="lb-pdf-loading-spinner"></div>
                        <div class="lb-pdf-loading-text">در حال بارگذاری PDF...</div>
                    </div>
                </div>

                <!-- فوتر -->
                <div class="lb-reader-footer">
                    <span class="lb-reader-footer-info" id="lb-footer-info">صفحه 1 از --</span>
                    <div class="lb-reader-progress">
                        <div class="lb-reader-progress-fill" id="lb-progress-fill"></div>
                    </div>
                    <span class="lb-reader-footer-info" id="lb-footer-author">--</span>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this._setupPDFReaderEvents();
    console.log('✅ مودال PDF Reader ساخته شد');
};

/* ============================================================
   نمایش PDF با PDF.js
   ============================================================ */
GermanDictionary.prototype._renderPDF = async function(book) {
    const self = this;
    const canvas = document.getElementById('lb-pdf-canvas');
    const loading = document.getElementById('lb-pdf-loading');
    const body = document.getElementById('lb-reader-body');

    if (!canvas) {
        console.error('Canvas پیدا نشد');
        return;
    }

    // ذخیره کتاب فعلی
    this._lbCurrentBook = book;
    this._lbCurrentPage = 1;
    this._lbTotalPages = 0;
    this._lbZoom = 1.2; // زوم اولیه
    this._lbRotation = 0;
    this._lbPdfDoc = null;

    // نمایش لودینگ
    if (loading) loading.style.display = 'flex';
    if (canvas) canvas.style.display = 'none';

    try {
        // تبدیل dataURL به typed array برای PDF.js
        const typedArray = this._dataURLToUint8Array(book.pdfData);

        // بارگذاری PDF
        const loadingTask = window.pdfjsLib.getDocument({ data: typedArray });
        this._lbPdfDoc = await loadingTask.promise;
        this._lbTotalPages = this._lbPdfDoc.numPages;

        // به‌روزرسانی UI
        const totalEl = document.getElementById('lb-total-pages');
        if (totalEl) totalEl.textContent = this._lbTotalPages;

        const pageInput = document.getElementById('lb-page-input');
        if (pageInput) {
            pageInput.max = this._lbTotalPages;
            pageInput.value = 1;
        }

        // فوتر
        const footerInfo = document.getElementById('lb-footer-info');
        if (footerInfo) footerInfo.textContent = `صفحه ۱ از ${this._lbFaNum(this._lbTotalPages)}`;

        const footerAuthor = document.getElementById('lb-footer-author');
        if (footerAuthor) footerAuthor.textContent = book.author;

        // رندر صفحه اول
        await this._renderPDFPage(1);

        if (loading) loading.style.display = 'none';
        if (canvas) canvas.style.display = 'block';

    } catch (err) {
        console.error('خطا در بارگذاری PDF:', err);
        if (loading) {
            loading.innerHTML = `
                <div style="font-size: 48px; color: #f43f5e;"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="lb-pdf-loading-text">خطا در بارگذاری PDF</div>
                <div style="font-size: 12px; opacity: .7; max-width: 400px; text-align: center;">${this.escapeHtml(err.message || 'خطای ناشناخته')}</div>
            `;
        }
    }
};

/* ============================================================
   رندر یک صفحه PDF
   ============================================================ */
GermanDictionary.prototype._renderPDFPage = async function(pageNum) {
    if (!this._lbPdfDoc) return;

    const canvas = document.getElementById('lb-pdf-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    try {
        const page = await this._lbPdfDoc.getPage(pageNum);

        // محاسبه viewport با زوم و چرخش
        const viewport = page.getViewport({ scale: this._lbZoom, rotation: this._lbRotation });

        // تنظیم ابعاد canvas (با devicePixelRatio برای وضوح بهتر)
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        // رندر صفحه
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
            transform: transform
        };

        const renderTask = page.render(renderContext);
        await renderTask.promise;

        // به‌روزرسانی UI
        this._lbCurrentPage = pageNum;
        const pageInput = document.getElementById('lb-page-input');
        if (pageInput) pageInput.value = pageNum;

        const zoomDisplay = document.getElementById('lb-zoom-display');
        if (zoomDisplay) zoomDisplay.textContent = Math.round(this._lbZoom * 100) + '%';

        const footerInfo = document.getElementById('lb-footer-info');
        if (footerInfo) footerInfo.textContent = `صفحه ${this._lbFaNum(pageNum)} از ${this._lbFaNum(this._lbTotalPages)}`;

        // به‌روزرسانی progress bar
        const progressFill = document.getElementById('lb-progress-fill');
        if (progressFill) {
            const progress = (pageNum / this._lbTotalPages) * 100;
            progressFill.style.width = progress + '%';
        }

        // فعال/غیرفعال کردن دکمه‌های ناوبری
        const prevBtn = document.getElementById('lb-prev-page');
        const nextBtn = document.getElementById('lb-next-page');
        const firstBtn = document.getElementById('lb-first-page');
        const lastBtn = document.getElementById('lb-last-page');
        if (prevBtn) prevBtn.disabled = pageNum <= 1;
        if (firstBtn) firstBtn.disabled = pageNum <= 1;
        if (nextBtn) nextBtn.disabled = pageNum >= this._lbTotalPages;
        if (lastBtn) lastBtn.disabled = pageNum >= this._lbTotalPages;

        // اسکرول به بالا
        const body = document.getElementById('lb-reader-body');
        if (body) body.scrollTop = 0;

    } catch (err) {
        console.error('خطا در رندر صفحه:', err);
    }
};

/* ============================================================
   راه‌اندازی رویدادهای PDF Reader
   ============================================================ */
GermanDictionary.prototype._setupPDFReaderEvents = function() {
    const self = this;
    const modal = document.getElementById('lb-pdf-modal');

    // بستن
    const closeBtn = document.getElementById('lb-pdf-close');
    if (closeBtn) {
        closeBtn.onclick = () => self._closePDFReader();
    }

    // ناوبری صفحات
    document.getElementById('lb-first-page')?.addEventListener('click', () => {
        if (self._lbCurrentPage > 1) self._renderPDFPage(1);
    });

    document.getElementById('lb-prev-page')?.addEventListener('click', () => {
        if (self._lbCurrentPage > 1) self._renderPDFPage(self._lbCurrentPage - 1);
    });

    document.getElementById('lb-next-page')?.addEventListener('click', () => {
        if (self._lbCurrentPage < self._lbTotalPages) self._renderPDFPage(self._lbCurrentPage + 1);
    });

    document.getElementById('lb-last-page')?.addEventListener('click', () => {
        if (self._lbCurrentPage < self._lbTotalPages) self._renderPDFPage(self._lbTotalPages);
    });

    // ورودی صفحه
    const pageInput = document.getElementById('lb-page-input');
    if (pageInput) {
        pageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const page = parseInt(pageInput.value);
                if (!isNaN(page) && page >= 1 && page <= self._lbTotalPages) {
                    self._renderPDFPage(page);
                } else {
                    self.showToast('شماره صفحه نامعتبر است', 'warning');
                    pageInput.value = self._lbCurrentPage;
                }
            }
        });
    }

    // زوم
    document.getElementById('lb-zoom-in')?.addEventListener('click', () => {
        self._lbZoom = Math.min(self._lbZoom + 0.25, 4);
        self._renderPDFPage(self._lbCurrentPage);
    });

    document.getElementById('lb-zoom-out')?.addEventListener('click', () => {
        self._lbZoom = Math.max(self._lbZoom - 0.25, 0.4);
        self._renderPDFPage(self._lbCurrentPage);
    });

    document.getElementById('lb-zoom-fit')?.addEventListener('click', async () => {
        if (!self._lbPdfDoc) return;
        const page = await self._lbPdfDoc.getPage(self._lbCurrentPage);
        const body = document.getElementById('lb-reader-body');
        if (!body) return;
        const availableWidth = body.clientWidth - 40;
        const viewport = page.getViewport({ scale: 1, rotation: self._lbRotation });
        self._lbZoom = availableWidth / viewport.width;
        self._renderPDFPage(self._lbCurrentPage);
    });

    // چرخش
    document.getElementById('lb-rotate-left')?.addEventListener('click', () => {
        self._lbRotation = (self._lbRotation - 90 + 360) % 360;
        self._renderPDFPage(self._lbCurrentPage);
    });

    document.getElementById('lb-rotate-right')?.addEventListener('click', () => {
        self._lbRotation = (self._lbRotation + 90) % 360;
        self._renderPDFPage(self._lbCurrentPage);
    });

    // دانلود
    document.getElementById('lb-download')?.addEventListener('click', () => {
        if (self._lbCurrentBook) {
            self._downloadBook(self._lbCurrentBook.id);
        }
    });

    // تمام‌صفحه
    const fullscreenBtn = document.getElementById('lb-fullscreen');
    if (fullscreenBtn) {
        fullscreenBtn.onclick = () => {
            modal.classList.toggle('lb-fullscreen');
            const icon = fullscreenBtn.querySelector('i');
            if (modal.classList.contains('lb-fullscreen')) {
                icon.className = 'fas fa-compress';
                fullscreenBtn.querySelector('.lb-tool-label').textContent = 'خروج از تمام‌صفحه';
            } else {
                icon.className = 'fas fa-expand';
                fullscreenBtn.querySelector('.lb-tool-label').textContent = 'تمام‌صفحه';
            }
            // رندر مجدد برای تطبیق اندازه
            setTimeout(() => {
                if (self._lbPdfDoc) self._renderPDFPage(self._lbCurrentPage);
            }, 300);
        };
    }

    // کلیدهای میانبر (فقط وقتی مودال باز است)
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('visible')) return;
        // اگر روی اینپوت هستیم، نادیده بگیر
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'Escape') {
            self._closePDFReader();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (self._lbCurrentPage < self._lbTotalPages) self._renderPDFPage(self._lbCurrentPage + 1);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (self._lbCurrentPage > 1) self._renderPDFPage(self._lbCurrentPage - 1);
        } else if (e.key === ' ') {
            e.preventDefault();
            if (self._lbCurrentPage < self._lbTotalPages) self._renderPDFPage(self._lbCurrentPage + 1);
        } else if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            self._lbZoom = Math.min(self._lbZoom + 0.25, 4);
            self._renderPDFPage(self._lbCurrentPage);
        } else if (e.key === '-') {
            e.preventDefault();
            self._lbZoom = Math.max(self._lbZoom - 0.25, 0.4);
            self._renderPDFPage(self._lbCurrentPage);
        } else if (e.key === 'Home') {
            e.preventDefault();
            if (self._lbCurrentPage > 1) self._renderPDFPage(1);
        } else if (e.key === 'End') {
            e.preventDefault();
            if (self._lbCurrentPage < self._lbTotalPages) self._renderPDFPage(self._lbTotalPages);
        }
    });

    // بستن با کلیک روی پس‌زمینه (خارج از container)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            self._closePDFReader();
        }
    });
};

/* ============================================================
   بستن PDF Reader
   ============================================================ */
GermanDictionary.prototype._closePDFReader = function() {
    const modal = document.getElementById('lb-pdf-modal');
    if (!modal) return;

    modal.classList.remove('visible');
    document.body.style.overflow = '';

    // پاکسازی منابع
    setTimeout(() => {
        const canvas = document.getElementById('lb-pdf-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        this._lbPdfDoc = null;
        this._lbCurrentBook = null;
    }, 300);
};

/* ============================================================
   تبدیل dataURL به Uint8Array (برای PDF.js)
   ============================================================ */
GermanDictionary.prototype._dataURLToUint8Array = function(dataURL) {
    const arr = dataURL.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return u8arr;
};

/* ============================================================
   تبدیل عدد به فارسی
   ============================================================ */
GermanDictionary.prototype._lbFaNum = function(n) {
    return String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
};

/* ============================================================
   تبدیل dataURL به Blob
   ============================================================ */
GermanDictionary.prototype.dataURLToBlob = function(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

/* ============================================================
   پاک کردن فرم کتاب
   ============================================================ */
GermanDictionary.prototype.clearBookForm = function() {
    const titleInput = document.getElementById('book-title');
    const authorInput = document.getElementById('book-author');
    const pdfInput = document.getElementById('book-pdf');
    const coverInput = document.getElementById('book-cover');

    if (titleInput) titleInput.value = '';
    if (authorInput) authorInput.value = '';
    if (pdfInput) pdfInput.value = '';
    if (coverInput) coverInput.value = '';
};

/* ============================================================
   جستجوی سریع (حفظ تابع قدیمی)
   ============================================================ */
GermanDictionary.prototype.QuickSearch = async function(query) {
    console.log('⚡ جستجوی سریع:', query);

    const results = await this.searchWords(query);

    if (results.length === 0) {
        const container = document.getElementById('search-results-container');
        if (container) {
            container.innerHTML = `
                <div class="word-card">
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h3>نتیجه‌ای یافت نشد</h3>
                        <p>برای "${query}" هیچ لغتی پیدا نشد</p>
                    </div>
                </div>
            `;
        }
        return;
    }

    this.renderWordDetails(results[0]);
};
