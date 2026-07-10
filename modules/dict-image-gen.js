/* ================================================================
   dict-image-gen.js — سیستم هوشمند تولید تصویر برای لغات آلمانی
   ----------------------------------------------------------------
   این ماژول یک فایل جاوااسکریپت ساده است (نه ES Module) که از طریق
   تگ <script src="modules/dict-image-gen.js"> لود می‌شود و کلاس
   GermanDictionary را با قابلیت تولید تصویر هوشمند گسترش می‌دهد.

   معماری ۱۰ مرحله‌ای:
     1. راهنمای سبک (Style Guide) — "Neo Clay 3D Learning"
     2. قالب پرامپت (Prompt Template) با متغیرها
     3. تولید مفهوم بصری هوشمند با _puterChat
     4. پشتیبانی از کلمات انتزاعی (Liebe, Freiheit, ...)
     5. سیستم دسته‌بندی (Category System)
     6. سازنده پرامپت (Prompt Builder)
     7. کش تصاویر در IndexedDB (فیلد imageData)
     8. اندازه تصویر 512x512 (در صورت پشتیبانی API)
     9. پس‌زمینه تمیز/سفید
    10. آهنگساز پرامپت هوش مصنوعی (AI Prompt Composer)

   ویژگی‌ها:
     • Rate Limiting — حداکثر ۳ تولید همزمان + صف
     • Failover — تعویض خودکار Worker ها هنگام خطا
     • اسپینر زیبا در کارت لغات
     • یکپارچه‌سازی با لیست لغات و صفحه جزئیات
     • تولید انبوه با نوار پیشرفت
     • پشتیبانی کامل از دارک‌مود و ریسپانسیو
   ================================================================ */

(function () {
    'use strict';

    /* ============================================================
       ۱) صبر می‌کنیم تا GermanDictionary تعریف شود
       (چون ترتیب لود اسکریپت‌ها ممکن است متفاوت باشد)
       ============================================================ */
    function boot() {
        if (typeof GermanDictionary === 'undefined') {
            // هنوز کلاس اصلی لود نشده — دوباره تلاش کن
            return setTimeout(boot, 100);
        }
        try {
            installImageGenModule();
            console.log('✅ ماژول تولید تصویر (dict-image-gen) فعال شد.');
        } catch (err) {
            console.error('❌ خطا در فعال‌سازی ماژول تولید تصویر:', err);
        }
    }

    /* ============================================================
       ۲) پیکربندی ماژول (Configuration)
       ============================================================ */

    // لیست Worker های Cloudflare — برای Failover استفاده می‌شود.
    // در صورت خطا/Rate-Limit اولی، دومی امتحان می‌شود و الی آخر.
    const IMAGE_WORKERS = [
    { url: 'https://image-gen-api.ez-3593a5.workers.dev', key: 'sk-kq9fbKQMOOCQOK8b4dx7RBuMuwswoblR' },
    { url: 'https://image-gen-ap4.image-gen-api-2c88mu.workers.dev', key: 'sk-HrjZqchoLTAia41PwlzWoaseIj4T7Auu' },
    { url: 'https://image-gen-ap21.ez-3593a5.workers.dev', key: 'sk-HrjZqchoLTAia41PwlzWoaseIj4T7Auu' },
    { url: 'https://image-gen-api.image-gen-api-sz3qkb.workers.dev', key: 'sk-lO0272becIVIQfBpSjzLvN8dhkK0uMio' },
    { url: 'https://image12.image12-a4f6io.workers.dev', key: 'sk-982GTd5u2inR41JjS8MBD8gL52iEZTh9' },
    { url: 'https://image786.image786-t92w4k.workers.dev', key: 'sk-LGONLhipEWRV8OulH7ITBytEXUhZsFgC' },
    { url: 'https://image-gen-api.image-gen-api-hrhte5.workers.dev', key: 'sk-K8yr2hf92rOSiOW7i3hwvgYBXLwYBrRk' },
    { url: 'https://image1324.image1324-0on168.workers.dev', key: 'sk-KhJBSvsdripnqXHlwEI0crnJpSWbDDTM' }
];

    // حداکثر تعداد تولید تصویر همزمان (Rate Limiting)
    const MAX_CONCURRENT = 10; // حداکثر ۲ تصویر همزمان (برای جلوگیری از محدودیت)

    // تایم‌اوت هر درخواست به Worker (میلی‌ثانیه) — ۶۰ ثانیه
    const WORKER_TIMEOUT_MS = 60000;

    // تاخیر کوتاه بین درخواست‌ها به یک Worker یکسان (جلوگیری از Rate-Limit)
    const INTER_REQUEST_DELAY_MS = 400;

    /* ----- مرحله ۱: راهنمای سبک "Neo Clay 3D Learning" ----- */
    // تمام تصاویر باید این سبک یکپارچه را داشته باشند.
    const STYLE_GUIDE = {
        name: 'Neo Clay 3D Learning',
        keywords: [
            '3D Clay illustration',
            'Pixar inspired',
            'Duolingo style mascot',
            'soft pastel colors',
            'soft studio lighting',
            'ambient occlusion',
            'rounded shapes',
            'cute and friendly',
            'minimal',
            'isometric view',
            'floating object',
            'clean white background',
            'high detail',
            'subsurface scattering',
            'smooth matte clay material'
        ],
        background: 'clean white background, minimal, no shadow on ground',
        // مواردی که باید حذف شوند (Negative)
        negative: [
            'text', 'watermark', 'signature', 'logo',
            'realistic photo', 'photographic', 'dark', 'scary',
            'cluttered', 'busy background', 'multiple unrelated objects',
            'low quality', 'blurry', 'distorted', 'cropped'
        ]
    };

    /* ----- مرحله ۵: سیستم دسته‌بندی و راهنمای رنگ ----- */
    const CATEGORIES = [
        'Animal', 'Food', 'Vehicle', 'Emotion', 'Nature', 'Action',
        'Job', 'Building', 'Electronics', 'Sports', 'Music', 'Travel',
        'Medical', 'House', 'Education', 'Abstract', 'Other'
    ];

    // هر دسته یک هینت رنگی ملایم دارد تا تصاویر هماهنگ‌تر شوند.
    const CATEGORY_COLORS = {
        Animal:      'warm beige and soft brown tones',
        Food:        'warm orange and cream tones',
        Vehicle:     'soft blue and silver tones',
        Emotion:     'soft pink and lavender tones',
        Nature:      'soft green and sky blue tones',
        Action:      'vibrant teal and yellow tones',
        Job:         'soft navy and gold tones',
        Building:    'soft gray and terracotta tones',
        Electronics: 'soft cyan and graphite tones',
        Sports:      'energetic red and white tones',
        Music:       'soft purple and gold tones',
        Travel:      'soft turquoise and sand tones',
        Medical:     'soft mint and white tones',
        House:       'warm terracotta and cream tones',
        Education:   'soft indigo and amber tones',
        Abstract:    'soft gradient pastel rainbow tones',
        Other:       'neutral soft pastel tones'
    };

    /* ----- مرحله ۲: قالب پرامپت با متغیرها ----- */
    // متغیرها: {{WORD}} {{MEANING}} {{TYPE}} {{VISUAL}} {{CATEGORY}} {{CATEGORY_HINT}} {{NEGATIVE}}
    const PROMPT_TEMPLATE =
        '{{VISUAL}}. ' +
        STYLE_GUIDE.keywords.join(', ') + '. ' +
        '{{CATEGORY_HINT}}. ' +
        'The image represents the German {{TYPE}} "{{WORD}}" which means "{{MEANING}}" in Persian. ' +
        'Centered composition, single main subject, ' + STYLE_GUIDE.background + '. ' +
        'Square 1:1 aspect ratio, highly polished render. ' +
        'Avoid: {{NEGATIVE}}.';

    /* ============================================================
       ۳) توابع کمکی داخلی (Helpers)
       ============================================================ */

    // تبدیل Blob به DataURL (base64) برای ذخیره در IndexedDB
    function blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = function () {
                if (typeof reader.result === 'string') resolve(reader.result);
                else reject(new Error('نتیجه FileReader قابل خواندن نیست'));
            };
            reader.onerror = function () { reject(reader.error || new Error('FileReader error')); };
            reader.readAsDataURL(blob);
        });
    }

    // استخراج JSON از متن پاسخ AI (حتی اگر درون ```json ... ``` باشد)
    function extractJSON(text) {
        if (!text || typeof text !== 'string') return null;
        // ۱) ابتدا fences کد را امتحان کن
        const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (fenceMatch) {
            const parsed = tryParse(fenceMatch[1]);
            if (parsed) return parsed;
        }
        // ۲) اولین { ... } را امتحان کن
        const braceStart = text.indexOf('{');
        const braceEnd = text.lastIndexOf('}');
        if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
            const sliced = text.slice(braceStart, braceEnd + 1);
            const parsed = tryParse(sliced);
            if (parsed) return parsed;
        }
        // ۳) کل متن را امتحان کن
        return tryParse(text);
    }

    function tryParse(str) {
        try { return JSON.parse(str); } catch (e) { return null; }
    }

    // تاخیر ساده
    function delay(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    // برش متن امن برای نمایش
    function safeStr(v, max) {
        var s = (v == null ? '' : String(v)).trim();
        if (max && s.length > max) s = s.slice(0, max) + '…';
        return s;
    }

    /* ============================================================
       ۴) نصب ماژول روی GermanDictionary.prototype
       ============================================================ */
    function installImageGenModule() {

        /* ---------- ۴-۱) تزریق استایل‌ها ---------- */
        // مرحله ۷ از ویژگی‌ها: تمام CSS ها به صورت inline در یک تگ <style>
        // با شناسه ig-pro-styles تزریق می‌شوند.
        GermanDictionary.prototype._injectImageGenStyles = function () {
            if (document.getElementById('ig-pro-styles')) return;
            var style = document.createElement('style');
            style.id = 'ig-pro-styles';
            style.textContent = "\n" +
                /* ===== متغیرهای CSS با پیشوند --ig- ===== */
                ":root{" +
                "--ig-primary:#f59e0b;--ig-primary-d:#d97706;--ig-primary-l:#fde68a;" +
                "--ig-accent:#10b981;--ig-ink:#0f172a;--ig-ink-2:#334155;--ig-muted:#64748b;" +
                "--ig-line:#e2e8f0;--ig-line-2:#f1f5f9;--ig-card:#ffffff;--ig-card-2:#f8fafc;" +
                "--ig-shadow:0 8px 24px rgba(15,23,42,.10);--ig-shadow-lg:0 18px 50px rgba(15,23,42,.18);" +
                "--ig-radius:16px;--ig-radius-s:12px;--ig-danger:#ef4444;" +
                "}" +
                "body.dark-mode{" +
                "--ig-primary:#fbbf24;--ig-primary-d:#f59e0b;--ig-primary-l:#78350f;" +
                "--ig-ink:#f1f5f9;--ig-ink-2:#cbd5e1;--ig-muted:#94a3b8;" +
                "--ig-line:#1e293b;--ig-line-2:#0f172a;--ig-card:#1e293b;--ig-card-2:#0f172a;" +
                "--ig-shadow:0 8px 24px rgba(0,0,0,.35);--ig-shadow-lg:0 18px 50px rgba(0,0,0,.45);" +
                "}" +
                "\n" +
                /* ===== بخش تصویر در کارت لیست لغات (.wl-card) ===== */
                ".wl-image-section{" +
                "margin-top:8px;display:flex;align-items:center;justify-content:center;" +
                "border-radius:var(--ig-radius-s);overflow:hidden;" +
                "background:transparent;border:none;min-height:0;transition:all .25s ease;" +
                "position:relative;width:100%;" +
                "}" +
                ".wl-image-section.has-img{background:transparent;border:none;}" +
                ".wl-image-section.loading{border:1.5px dashed var(--ig-primary);background:linear-gradient(135deg,#fffbeb,#fef3c7);border-radius:var(--ig-radius-s);}" +
                "body.dark-mode .wl-image-section.loading{background:linear-gradient(135deg,rgba(245,158,11,.12),rgba(245,158,11,.04));border-color:var(--ig-primary);}" +
                ".wl-image-section.error{border:1.5px dashed var(--ig-danger);background:linear-gradient(135deg,#fef2f2,#fee2e2);border-radius:var(--ig-radius-s);}" +
                "body.dark-mode .wl-image-section.error{background:linear-gradient(135deg,rgba(239,68,68,.12),rgba(239,68,68,.04));}" +
                "\n" +
                ".wl-image-thumb{" +
                "width:100%;display:block;object-fit:contain;" +
                "border-radius:var(--ig-radius-s);box-shadow:0 4px 12px rgba(15,23,42,.08);" +
                "transition:transform .35s cubic-bezier(.22,1,.36,1);" +
                "}" +
                ".wl-image-thumb:hover{transform:scale(1.04);}" +
                "\n" +
                /* ----- دکمه تولید تصویر ----- */
                ".wl-image-gen-btn{" +
                "width:100%;border:none;cursor:pointer;font-family:inherit;" +
                "padding:14px 12px;border-radius:var(--ig-radius-s);" +
                "background:linear-gradient(135deg,var(--ig-primary),var(--ig-primary-d));" +
                "color:#fff;font-size:12px;font-weight:800;letter-spacing:.2px;" +
                "display:flex;align-items:center;justify-content:center;gap:8px;" +
                "box-shadow:0 4px 12px rgba(245,158,11,.25);transition:all .25s ease;" +
                "min-height:70px;" +
                "}" +
                ".wl-image-gen-btn:hover{transform:translateY(-2px);filter:brightness(1.06);box-shadow:0 10px 24px rgba(245,158,11,.40);}" +
                ".wl-image-gen-btn:active{transform:translateY(0);}" +
                ".wl-image-gen-btn i{font-size:18px;}" +
                "\n" +
                /* ----- اسپینر زیبا (مرحله ۳ از ویژگی‌ها) ----- */
                ".ig-spinner-wrap{" +
                "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;" +
                "padding:14px 10px;width:100%;min-height:90px;" +
                "}" +
                ".ig-spinner{" +
                "width:46px;height:46px;border-radius:50%;position:relative;" +
                "background:conic-gradient(from 0deg,#fde68a,#fbbf24,#f59e0b,#fde68a);" +
                "animation:ig-spin 1.1s linear infinite;" +
                "box-shadow:0 6px 18px rgba(245,158,11,.40);" +
                "}" +
                ".ig-spinner::after{" +
                "content:'';position:absolute;inset:6px;border-radius:50%;" +
                "background:var(--ig-card,#fff);" +
                "}" +
                ".ig-spinner-ic{" +
                "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
                "z-index:2;font-size:16px;color:var(--ig-primary,#f59e0b);" +
                "animation:ig-pulse 1.4s ease-in-out infinite;" +
                "}" +
                "@keyframes ig-spin{to{transform:rotate(360deg);}}" +
                "@keyframes ig-pulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.18);opacity:.7;}}" +
                ".ig-spinner-text{" +
                "font-size:11.5px;font-weight:700;color:var(--ig-ink-2);text-align:center;" +
                "line-height:1.6;direction:rtl;" +
                "}" +
                ".ig-spinner-text small{display:block;font-weight:600;color:var(--ig-muted);font-size:10px;margin-top:2px;}" +
                "\n" +
                /* ----- حالت خطا ----- */
                ".wl-image-error-wrap{" +
                "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;" +
                "padding:16px 12px;width:100%;min-height:110px;text-align:center;" +
                "}" +
                ".wl-image-error-wrap .ig-err-ic{font-size:22px;color:var(--ig-danger);}" +
                ".wl-image-error-wrap .ig-err-msg{font-size:11px;color:var(--ig-ink-2);font-weight:600;line-height:1.6;}" +
                ".wl-image-retry{" +
                "border:1px solid var(--ig-danger);background:transparent;color:var(--ig-danger);" +
                "padding:6px 14px;border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;" +
                "cursor:pointer;transition:all .2s ease;display:inline-flex;align-items:center;gap:5px;" +
                "}" +
                ".wl-image-retry:hover{background:var(--ig-danger);color:#fff;}" +
                "\n" +
                /* ===== بخش تصویر در صفحه جزئیات (.wd-card) ===== */
                ".wd-image-block{" +
                "margin:18px 0;border-radius:var(--ig-radius);overflow:hidden;" +
                "background:var(--ig-card-2);border:1px solid var(--ig-line);" +
                "box-shadow:var(--ig-shadow);" +
                "}" +
                ".wd-image-head{" +
                "display:flex;align-items:center;justify-content:space-between;gap:10px;" +
                "padding:12px 16px;border-bottom:1px solid var(--ig-line);" +
                "background:linear-gradient(135deg,var(--ig-card),var(--ig-card-2));" +
                "}" +
                ".wd-image-title{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;color:var(--ig-ink);}" +
                ".wd-image-title i{color:var(--ig-primary);}" +
                ".wd-image-actions{display:flex;gap:6px;}" +
                ".wd-image-btn{" +
                "border:1px solid var(--ig-line);background:var(--ig-card);color:var(--ig-ink-2);" +
                "padding:6px 12px;border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;" +
                "cursor:pointer;transition:all .2s ease;display:inline-flex;align-items:center;gap:5px;" +
                "}" +
                ".wd-image-btn:hover{border-color:var(--ig-primary);color:var(--ig-primary);transform:translateY(-1px);}" +
                ".wd-image-btn.primary{background:linear-gradient(135deg,var(--ig-primary),var(--ig-primary-d));color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(245,158,11,.30);}" +
                ".wd-image-btn.primary:hover{filter:brightness(1.06);}" +
                ".wd-image-body{padding:16px;display:flex;align-items:center;justify-content:center;min-height:200px;}" +
                ".wd-image-body img{max-width:100%;max-height:360px;border-radius:var(--ig-radius-s);box-shadow:var(--ig-shadow);display:block;}" +
                ".wd-image-body .ig-spinner{width:56px;height:56px;}" +
                ".wd-image-body .ig-spinner-ic{font-size:20px;}" +
                "\n" +
                /* ===== دکمه شناور (FAB) برای تولید انبوه ===== */
                "#ig-fab{display:none !important;}" +
                "#ig-fab:hover{transform:translateY(-3px) scale(1.05);box-shadow:0 14px 36px rgba(245,158,11,.55);}" +
                "#ig-fab:active{transform:translateY(0) scale(1);}" +
                "#ig-fab .ig-fab-badge{" +
                "position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;padding:0 5px;" +
                "border-radius:10px;background:#ef4444;color:#fff;font-size:10px;font-weight:800;" +
                "display:flex;align-items:center;justify-content:center;border:2px solid var(--ig-card);" +
                "box-shadow:0 2px 8px rgba(239,68,68,.5);" +
                "}" +
                "\n" +
                /* ===== پنل شناور تولید انبوه ===== */
                "#ig-popover{" +
                "position:fixed;bottom:92px;left:24px;z-index:9999;width:320px;max-width:calc(100vw - 48px);" +
                "background:var(--ig-card);border:1px solid var(--ig-line);border-radius:var(--ig-radius);" +
                "box-shadow:var(--ig-shadow-lg);overflow:hidden;transform:translateY(12px) scale(.96);opacity:0;" +
                "pointer-events:none;transition:all .28s cubic-bezier(.22,1,.36,1);font-family:'Vazirmatn',Tahoma,sans-serif;" +
                "}" +
                "#ig-popover.open{transform:translateY(0) scale(1);opacity:1;pointer-events:auto;}" +
                ".ig-pop-head{padding:14px 16px;background:linear-gradient(135deg,var(--ig-primary),var(--ig-primary-d));color:#fff;display:flex;align-items:center;justify-content:space-between;}" +
                ".ig-pop-head h4{margin:0;font-size:14px;font-weight:800;display:flex;align-items:center;gap:8px;}" +
                ".ig-pop-close{background:rgba(255,255,255,.18);border:none;color:#fff;width:26px;height:26px;border-radius:8px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:background .2s ease;}" +
                ".ig-pop-close:hover{background:rgba(255,255,255,.30);}" +
                ".ig-pop-body{padding:16px;}" +
                ".ig-pop-stat{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:10px;background:var(--ig-card-2);margin-bottom:12px;}" +
                ".ig-pop-stat .ig-stat-num{font-size:22px;font-weight:900;color:var(--ig-primary);}" +
                ".ig-pop-stat .ig-stat-lbl{font-size:11px;font-weight:700;color:var(--ig-muted);}" +
                ".ig-pop-actions{display:flex;flex-direction:column;gap:8px;}" +
                ".ig-pop-btn{" +
                "width:100%;border:none;cursor:pointer;font-family:inherit;padding:11px 14px;border-radius:10px;" +
                "font-size:12.5px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .22s ease;" +
                "}" +
                ".ig-pop-btn.primary{background:linear-gradient(135deg,var(--ig-primary),var(--ig-primary-d));color:#fff;box-shadow:0 4px 12px rgba(245,158,11,.30);}" +
                ".ig-pop-btn.primary:hover{filter:brightness(1.06);transform:translateY(-1px);}" +
                ".ig-pop-btn.primary:disabled{opacity:.55;cursor:not-allowed;transform:none;}" +
                ".ig-pop-btn.ghost{background:var(--ig-card-2);color:var(--ig-ink-2);border:1px solid var(--ig-line);}" +
                ".ig-pop-btn.ghost:hover{border-color:var(--ig-primary);color:var(--ig-primary);}" +
                "\n" +
                /* ----- نوار پیشرفت تولید انبوه ----- */
                ".ig-progress-wrap{margin-top:12px;display:none;}" +
                ".ig-progress-wrap.active{display:block;}" +
                ".ig-progress-head{display:flex;justify-content:space-between;font-size:11px;font-weight:700;color:var(--ig-ink-2);margin-bottom:6px;}" +
                ".ig-progress-track{height:8px;border-radius:999px;background:var(--ig-line);overflow:hidden;}" +
                ".ig-progress-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--ig-primary),var(--ig-accent));transition:width .4s ease;width:0%;}" +
                ".ig-progress-log{margin-top:8px;font-size:10.5px;color:var(--ig-muted);max-height:90px;overflow-y:auto;line-height:1.6;direction:rtl;}" +
                ".ig-progress-log::-webkit-scrollbar{width:5px;}" +
                ".ig-progress-log::-webkit-scrollbar-thumb{background:var(--ig-line);border-radius:999px;}" +
                "\n" +
                /* ===== ریسپانسیو ===== */
                "@media (max-width:640px){" +
                "#ig-fab{width:50px;height:50px;font-size:19px;bottom:18px;left:18px;}" +
                "#ig-popover{left:12px;right:12px;width:auto;bottom:80px;max-width:none;}" +
                ".wl-image-gen-btn{min-height:50px;font-size:11px;padding:10px 8px;}" +
                ".ig-spinner-wrap{min-height:70px;padding:10px 6px;}" +
                ".ig-spinner{width:28px !important;height:28px !important;}" +
                ".ig-spinner-ic{font-size:12px !important;}" +
                ".ig-spinner-txt{font-size:10px !important;}" +
                "}" +
                "@media (max-width:380px){" +
                ".wl-image-gen-btn i{font-size:16px;}" +
                "}" +
                "\n" +
                /* جلوگیری از تداخل با لایت‌باکس‌ها */
                ".wl-image-section img{pointer-events:auto;}" +
                "";
            document.head.appendChild(style);
        };

        /* ---------- ۴-۲) مقداردهی سیستم تصویر ---------- */
        // این متد یک‌بار در لود صدا زده می‌شود: استایل تزریق می‌کند،
        // state اولیه می‌سازد، دکمه شناور را اضافه می‌کند و renderWordList
        // و renderWordDetails را هوک می‌کند تا تصاویر کش‌شده را نمایش دهیم.
        GermanDictionary.prototype._initImageSystem = function () {
            // جلوگیری از مقداردهی مجدد
            if (this._igInitialized) return;
            this._igInitialized = true;

            // تزریق استایل
            this._injectImageGenStyles();

            // state ماژول
            this._igState = {
                queue: [],            // صف job های در انتظار: { wordId, resolve, reject }
                running: new Set(),   // wordId هایی که همین الان در حال اجرا هستند (برای Rate Limit)
                promises: new Map(),  // wordId -> Promise (برای dedup درخواست‌های هم‌زمان یک کلمه)
                busy: new Set(),      // wordId هایی که در صف یا در حال اجرا هستند (جلوگیری از duplicate)
                lastRequestAt: 0,     // زمان آخرین درخواست (برای فاصله‌گذاری)
                bulk: { running: false, total: 0, done: 0, failed: 0, aborted: false }
            };

            // هوک کردن renderWordList برای تزریق تصویر در کارت‌ها
            this._hookRenderFunctions();

            // اضافه کردن دکمه شناور + پنل تولید انبوه
            this._injectFab();

            // بروزرسانی نشان دکمه شناور
            var self = this;
            setTimeout(function () { self._refreshFabBadge(); }, 800);
            // و هر ۵ ثانیه (برای کلمات جدید اضافه‌شده)
            setInterval(function () { self._refreshFabBadge(); }, 5000);
        };

        /* ---------- ۴-۳) هوک کردن توابع رندر موجود ---------- */
        // بدون تغییر فایل‌های موجود، رفتار آن‌ها را گسترش می‌دهیم.
        GermanDictionary.prototype._hookRenderFunctions = function () {
            var self = this;

            // ----- هوک renderWordList -----
            if (typeof this.renderWordList === 'function' && !this._igHooked_renderWordList) {
                this._igHooked_renderWordList = true;
                var origRenderWordList = this.renderWordList;
                this.renderWordList = async function () {
                    var args = arguments;
                    var result;
                    try {
                        result = await origRenderWordList.apply(this, args);
                    } catch (e) {
                        throw e;
                    } finally {
                        // پس از رندر، تصاویر را در کارت‌ها تزریق کن
                        try { this._hydrateWordCardImages(); } catch (err) {
                            console.warn('[img-gen] hydrate word cards error:', err);
                        }
                    }
                    return result;
                };
            }

            // ----- هوک renderWordDetails (غیرفعال - تصویر فقط در لیست لغات) -----
            // تصاویر فقط در کارت‌های لیست لغات نمایش داده می‌شوند
        };

        /* ============================================================
           مرحله ۳ و ۱۰: آهنگساز پرامپت هوش مصنوعی
           با استفاده از _puterChat یک مفهوم بصری برای کلمه تولید می‌کند.
           خروجی: { category, visual_concept, negative_prompt }
           ============================================================ */
        GermanDictionary.prototype._getVisualConcept = async function (word, meaning, type) {
            word = safeStr(word, 80);
            meaning = safeStr(meaning, 120);
            type = safeStr(type, 30) || 'other';

            // اگر _puterChat موجود نبود، از مفهوم پیش‌فرض استفاده کن
            if (typeof this._puterChat !== 'function') {
                return this._fallbackVisualConcept(word, meaning, type);
            }

            var systemPrompt =
                'You are a visual concept designer for a German-Persian language learning app called "Neo Clay 3D Learning". ' +
                'Given a German word, its Persian meaning, and grammatical type, you must design a single, iconic, cute 3D clay visual. ' +
                'Respond with ONLY a JSON object — no markdown, no explanation, no code fences.';

            var userPrompt =
                'German word: "' + word + '"\n' +
                'Persian meaning: "' + meaning + '"\n' +
                'Grammatical type: "' + type + '"\n\n' +
                'Choose the best category from this list: ' + CATEGORIES.join(', ') + '.\n\n' +
                'Design a visual concept following these rules:\n' +
                '1) For CONCRETE nouns (animals, food, objects): show the actual object in a cute clay style.\n' +
                '2) For ABSTRACT words (Liebe=love, Freiheit=freedom, Hoffnung=hope, etc.): create a CREATIVE visual metaphor — NOT just a heart or a smiley face. Think of a small scene/object that symbolizes the concept (e.g. a floating open cage with a glowing bird for freedom).\n' +
                '3) For VERBS: show a cute character performing the action, mid-motion.\n' +
                '4) For ADJECTIVES: show an object that clearly demonstrates the quality (e.g. a tall thin clay tower for "tall").\n' +
                '5) The visual_concept must be a SHORT English phrase (max 20 words) describing ONE clear subject.\n' +
                '6) Keep it simple, iconic, friendly — this is for a learning app.\n\n' +
                'Return ONLY this JSON (no extra text):\n' +
                '{\n' +
                '  "category": "<one of the categories>",\n' +
                '  "visual_concept": "<short English description of the single subject/scene>",\n' +
                '  "negative_prompt": "<comma-separated things to avoid, e.g. text, watermark, realistic, scary, multiple objects>"\n' +
                '}';

            try {
                var result = await this._puterChat([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ], { temperature: 0.6, max_tokens: 400 });

                // _puterChat خروجی را به‌صورت { message: { content: [{ text }] } } برمی‌گرداند.
                // چند مسیر ممکن را امتحان می‌کنیم تا مقاوم باشیم.
                var text = '';
                if (result && typeof result === 'string') {
                    text = result;
                } else if (result && result.message && Array.isArray(result.message.content) &&
                           result.message.content[0] && typeof result.message.content[0].text === 'string') {
                    text = result.message.content[0].text;
                } else if (result && Array.isArray(result.content) &&
                           result.content[0] && typeof result.content[0].text === 'string') {
                    text = result.content[0].text;
                } else if (result && result.message && typeof result.message.content === 'string') {
                    text = result.message.content;
                }

                if (!text) {
                    return this._fallbackVisualConcept(word, meaning, type);
                }

                var parsed = extractJSON(text);
                if (parsed && parsed.visual_concept) {
                    return {
                        category: CATEGORIES.indexOf(parsed.category) !== -1 ? parsed.category : 'Other',
                        visual_concept: safeStr(parsed.visual_concept, 200),
                        negative_prompt: safeStr(parsed.negative_prompt, 200) || STYLE_GUIDE.negative.join(', ')
                    };
                }
                // اگر JSON معتبر نبود، fallback
                return this._fallbackVisualConcept(word, meaning, type);
            } catch (err) {
                console.warn('[img-gen] _getVisualConcept error, using fallback:', err);
                return this._fallbackVisualConcept(word, meaning, type);
            }
        };

        // مفهوم بصری پیش‌فرض (در صورت در دسترس نبودن/خطای AI)
        GermanDictionary.prototype._fallbackVisualConcept = function (word, meaning, type) {
            var category = 'Other';
            var visual = 'a cute clay object representing "' + word + '"';
            // حدس ساده دسته بر اساس نوع کلمه
            if (type === 'verb') {
                category = 'Action';
                visual = 'a cute clay character performing the action of "' + word + '"';
            } else if (type === 'adjective') {
                category = 'Other';
                visual = 'a cute clay object clearly demonstrating the quality of "' + word + '"';
            }
            return {
                category: category,
                visual_concept: visual,
                negative_prompt: STYLE_GUIDE.negative.join(', ')
            };
        };

        /* ============================================================
           مرحله ۶: سازنده پرامپت (Prompt Builder)
           ============================================================ */
        GermanDictionary.prototype._buildImagePrompt = function (word, meaning, type, concept, category) {
            word = safeStr(word, 80);
            meaning = safeStr(meaning, 120);
            type = safeStr(type, 30) || 'word';
            var visual = safeStr(concept, 240) || ('a cute clay object representing ' + word);
            category = safeStr(category, 30) || 'Other';
            var catHint = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
            var negative = (STYLE_GUIDE.negative.join(', ')) +
                           (concept && concept.negative_prompt ? (', ' + concept.negative_prompt) : '');

            return PROMPT_TEMPLATE
                .replace(/\{\{WORD\}\}/g, word)
                .replace(/\{\{MEANING\}\}/g, meaning)
                .replace(/\{\{TYPE\}\}/g, type)
                .replace(/\{\{VISUAL\}\}/g, visual)
                .replace(/\{\{CATEGORY\}\}/g, category)
                .replace(/\{\{CATEGORY_HINT\}\}/g, 'color palette: ' + catHint)
                .replace(/\{\{NEGATIVE\}\}/g, negative);
        };

        /* ============================================================
           مرحله ۴ (API): فراخوانی API تولید تصویر با Failover
           این متد بین Worker ها جابه‌جا می‌شود تا یکی موفق شود.
           خروجی: Blob تصویر
           ============================================================ */
        GermanDictionary.prototype._generateImageAPI = async function (prompt) {
            if (!IMAGE_WORKERS || IMAGE_WORKERS.length === 0) {
                throw new Error('هیچ Worker ای برای تولید تصویر پیکربندی نشده است.');
            }

            var lastError = null;
            var body = JSON.stringify({ prompt: prompt });

            // امتحان کردن Worker ها به ترتیب
            for (var i = 0; i < IMAGE_WORKERS.length; i++) {
                var worker = IMAGE_WORKERS[i];
                try {
                    // فاصله‌گذاری زمانی برای جلوگیری از Rate-Limit
                    var self = this;
                    var now = Date.now();
                    var elapsed = now - (this._igState.lastRequestAt || 0);
                    if (elapsed < INTER_REQUEST_DELAY_MS) {
                        await delay(INTER_REQUEST_DELAY_MS - elapsed);
                    }
                    this._igState.lastRequestAt = Date.now();

                    var blob = await this._fetchImageFromWorker(worker, body);
                    if (blob && blob.size > 0) {
                        return blob;
                    }
                    lastError = new Error('پاسخ Worker خالی بود: ' + worker.url);
                } catch (err) {
                    console.warn('[img-gen] Worker ' + (i + 1) + ' ناموفق (' + worker.url + '):', err.message);
                    lastError = err;
                    // اگر 429 (Rate Limit) بود، کمی صبر کن و سپس Worker بعدی
                    if (err && err.status === 429) {
                        await delay(800);
                    }
                    // در غیر این صورت بلافاصله Worker بعدی
                }
            }

            throw lastError || new Error('تمام Worker های تولید تصویر ناموفق بودند.');
        };

        // فراخوانی یک Worker با تایم‌اوت
        GermanDictionary.prototype._fetchImageFromWorker = function (worker, body) {
            return new Promise(function (resolve, reject) {
                var controller = new AbortController();
                var timer = setTimeout(function () {
                    controller.abort();
                    var e = new Error('تایم‌اوت درخواست به Worker (' + WORKER_TIMEOUT_MS + 'ms)');
                    e.status = 0;
                    reject(e);
                }, WORKER_TIMEOUT_MS);

                fetch(worker.url, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Authorization': 'Bearer ' + worker.key,
                        'Content-Type': 'application/json'
                    },
                    body: body,
                    signal: controller.signal
                }).then(function (response) {
                    clearTimeout(timer);
                    if (!response.ok) {
                        var err = new Error('Worker خطای HTTP ' + response.status + ' برگرداند');
                        err.status = response.status;
                        // تلاش برای خواندن پیام خطا
                        response.text().then(function (txt) {
                            try {
                                var j = JSON.parse(txt);
                                if (j && j.error) err.message = j.error;
                            } catch (e) {}
                            reject(err);
                        }).catch(function () { reject(err); });
                        return;
                    }
                    // بررسی نوع محتوا — باید تصویر باشد
                    var ct = response.headers.get('content-type') || '';
                    if (ct && ct.indexOf('image') === -1 && ct.indexOf('octet-stream') === -1) {
                        // ممکن است JSON خطا باشد
                        response.text().then(function (txt) {
                            var msg = 'پاسخ Worker تصویر نیست (content-type: ' + ct + ')';
                            try {
                                var j = JSON.parse(txt);
                                if (j && j.error) msg = j.error;
                            } catch (e) {}
                            reject(new Error(msg));
                        }).catch(function () {
                            reject(new Error('پاسخ Worker تصویر نیست'));
                        });
                        return;
                    }
                    response.blob().then(function (blob) {
                        if (!blob || blob.size === 0) {
                            reject(new Error('Blob خالی از Worker دریافت شد'));
                            return;
                        }
                        resolve(blob);
                    }).catch(function (e) { reject(e); });
                }).catch(function (err) {
                    clearTimeout(timer);
                    if (err.name === 'AbortError') {
                        var e = new Error('درخواست به Worker قطع شد (تایم‌اوت)');
                        e.status = 0;
                        reject(e);
                    } else {
                        reject(err);
                    }
                });
            });
        };

        /* ============================================================
           مرحله ۷: کش تصاویر در IndexedDB
           فیلد imageData به رکورد کلمه اضافه می‌شود (به صورت dataURL).
           ============================================================ */

        // ذخیره dataURL در فیلد imageData کلمه
        // (اگر dataURL برابر null باشد، کش پاک می‌شود)
        GermanDictionary.prototype._cacheImage = async function (wordId, dataURL) {
            if (!this.db) { console.warn('[img-gen] db آماده نیست'); return; }
            if (wordId === undefined || wordId === null) return;
            return new Promise((function (resolve, reject) {
                try {
                    var tx = this.db.transaction(['words'], 'readwrite');
                    var store = tx.objectStore('words');
                    var getReq = store.get(wordId);
                    getReq.onsuccess = (function () {
                        var word = getReq.result;
                        if (!word) { resolve(false); return; }
                        word.imageData = dataURL;
                        word.imageGeneratedAt = new Date().toISOString();
                        var putReq = store.put(word);
                        putReq.onsuccess = function () { resolve(true); };
                        putReq.onerror = function (e) {
                            console.error('[img-gen] خطا در put تصویر:', e.target.error);
                            resolve(false);
                        };
                    }).bind(this);
                    getReq.onerror = function (e) {
                        console.error('[img-gen] خطا در get برای کش:', e.target.error);
                        resolve(false);
                    };
                } catch (e) {
                    console.error('[img-gen] exception در _cacheImage:', e);
                    resolve(false);
                }
            }).bind(this));
        };

        // دریافت dataURL کش‌شده
        GermanDictionary.prototype._getCachedImage = async function (wordId) {
            if (!this.db) return null;
            if (wordId === undefined || wordId === null) return null;
            try {
                var word = await this.getWord(wordId);
                if (word && word.imageData && typeof word.imageData === 'string' && word.imageData.indexOf('data:') === 0) {
                    return word.imageData;
                }
                return null;
            } catch (e) {
                console.warn('[img-gen] خطا در _getCachedImage:', e);
                return null;
            }
        };

        /* ============================================================
           Rate Limiting + صف (Queue)
           ============================================================ */

        // افزودن یک کلمه به صف تولید (با dedup برای درخواست‌های تکراری)
        // خروجی: Promise که با dataURL یا خطا resolve می‌شود
        GermanDictionary.prototype._enqueueImageGeneration = function (wordId) {
            var state = this._igState;
            // بررسی محدودیت روزانه (۵۰۰ تصویر در روز)
            var today = new Date().toDateString();
            if (!state.dailyCount) state.dailyCount = {};
            if (!state.dailyCount[today]) state.dailyCount[today] = 0;
            if (state.dailyCount[today] >= 500) {
                console.log('[img-gen] محدودیت روزانه (۵۰۰) رسید، تولید متوقف شد');
                return;
            }
            var self = this;

            // اگر همین الان در صف یا در حال اجراست → همان Promise موجود را برگردان (dedup)
            if (state.promises.has(wordId)) {
                return state.promises.get(wordId);
            }

            state.busy.add(wordId);

            var promise = new Promise(function (resolve, reject) {
                state.queue.push({ wordId: wordId, resolve: resolve, reject: reject });
                setTimeout(function(){ self._processImageQueue(); }, 1500);
            });

            state.promises.set(wordId, promise);
            return promise;
        };

        // پردازش صف — تا MAX_CONCURRENT کار همزمان اجرا می‌کند (Rate Limiting)
        GermanDictionary.prototype._processImageQueue = function () {
            var state = this._igState;
            var self = this;

            // تا وقتی تعداد در حال اجرا کمتر از سقف است و صف پر است، کار جدید شروع کن
            while (state.running.size < MAX_CONCURRENT && state.queue.length > 0) {
                var job = state.queue.shift();
                state.running.add(job.wordId); // هم‌زمان اضافه می‌شود تا حلقه درست کار کند
                // اجرای غیرمسدودکننده
                (function (jobRef) {
                    self._runImageGeneration(jobRef.wordId)
                        .then(function (dataURL) { jobRef.resolve(dataURL); })
                        .catch(function (err) { jobRef.reject(err); });
                })(job);
            }

            // اگر صف خالی شد و کاری در حال اجرا نیست، نشان FAB را بروز بزن
            if (state.queue.length === 0 && state.running.size === 0) {
                setTimeout(function () { self._refreshFabBadge(); }, 300);
            }
        };

        // اجرای واقعی تولید تصویر برای یک کلمه
        GermanDictionary.prototype._runImageGeneration = async function (wordId) {
            var self = this;
            var state = this._igState;
            var word = null;
            try {
                // ۱) ابتدا چک کن آیا کش وجود دارد
                var cached = await this._getCachedImage(wordId);
                if (cached) {
                    // نمایش در کارت و جزئیات
                    this._hydrateWordCardImage(wordId, cached);
// تصویر فقط در لیست لغات
                    return cached;
                }

                // ۲) دریافت اطلاعات کلمه
                word = await this.getWord(wordId);
                if (!word) throw new Error('کلمه یافت نشد (id=' + wordId + ')');

                // ۳) نمایش حالت loading در کارت
                this._setCardLoading(wordId);
                if (this.currentWord && this.currentWord.id === wordId) {
                    this._setDetailsLoading(wordId);
                }

                // ۴) مرحله ۳/۱۰: دریافت مفهوم بصری از AI
                var concept = await this._getVisualConcept(word.german, word.persian, word.type);

                // ۵) مرحله ۶: ساخت پرامپت نهایی
                var prompt = this._buildImagePrompt(
                    word.german, word.persian, word.type,
                    concept.visual_concept, concept.category
                );

                // ۶) مرحله ۴ API: فراخوانی با Failover
                var blob = await this._generateImageAPI(prompt);

                // ۷) تبدیل به dataURL
                var dataURL = await blobToDataURL(blob);

                // ۸) مرحله ۷: کش در IndexedDB
                await this._cacheImage(wordId, dataURL);

                // ۹) نمایش در کارت و جزئیات
                this._hydrateWordCardImage(wordId, dataURL);
                this._showImageInDetails(dataURL, wordId);

                return dataURL;
            } catch (err) {
                console.error('[img-gen] تولید تصویر ناموفق برای wordId=' + wordId + ':', err);
                // نمایش حالت خطا در کارت
                var msg = (err && err.message) ? err.message : 'خطای ناشناخته';
                this._setCardError(wordId, msg);
                if (word && this.currentWord && this.currentWord.id === wordId) {
                    this._setDetailsError(msg, wordId);
                }
                throw err;
            } finally {
                // پاک‌سازی از running / busy / promises
                state.running.delete(wordId);
                state.busy.delete(wordId);
                state.promises.delete(wordId);
                // ادامه صف
                var self2 = this;
                setTimeout(function () { self2._processImageQueue(); }, 10);
                // بروزرسانی نشان FAB و پیشرفت انبوه
                this._refreshFabBadge();
                this._tickBulkProgress();
            }
        };

        /* ============================================================
           نقطه ورود عمومی: تولید تصویر یک کلمه
           ============================================================ */
        GermanDictionary.prototype._generateWordImage = async function (wordId) {
            if (wordId === undefined || wordId === null) {
                throw new Error('wordId الزامی است');
            }
            // ابتدا کش را چک کن — اگر هست، فقط UI را بروز کن
            var cached = await this._getCachedImage(wordId);
            if (cached) {
                this._hydrateWordCardImage(wordId, cached);
// تصویر فقط در لیست لغات
                return cached;
            }
            // در غیر این صورت در صف بگذار
            return this._enqueueImageGeneration(wordId);
        };

        /* ============================================================
           هیدراته کردن تصاویر در لیست لغات
           پس از هر بار رندر لیست، روی همه کارت‌ها اجرا می‌شود.
           ============================================================ */
        GermanDictionary.prototype._hydrateWordCardImages = async function () {
            var cards = document.querySelectorAll('.wl-card[data-id]');
            if (!cards || cards.length === 0) return;

            // برای کارایی بالا، همه کلمات را یک‌بار از DB می‌خوانیم و یک map از
            // wordId → imageData می‌سازیم (به‌جای N بار getWord).
            var allWords = [];
            try { allWords = await this.getAllWords(); } catch (e) { allWords = []; }
            var imgMap = {};
            for (var k = 0; k < allWords.length; k++) {
                var w = allWords[k];
                if (w && w.imageData && typeof w.imageData === 'string' &&
                    w.imageData.indexOf('data:') === 0) {
                    imgMap[w.id] = w.imageData;
                }
            }

            var state = this._igState;
            var list = Array.prototype.slice.call(cards);
            for (var i = 0; i < list.length; i++) {
                var card = list[i];
                var wordId = parseInt(card.getAttribute('data-id'), 10);
                if (isNaN(wordId)) continue;
                // اگر کارت قبلاً سکشن تصویر دارد و تصویر آماده دارد، رد شو
                var existingImg = card.querySelector('.wl-image-section.has-img img');
                if (existingImg) continue;

                var dataURL = imgMap[wordId] || null;
                var sec = this._ensureImageSection(card);
                if (!sec) continue;

                if (dataURL) {
                    this._showImageInCard(card, dataURL);
                } else if (state && state.busy.has(wordId)) {
                    this._showImageLoading(card);
                } else {
                    // تولید خودکار تصویر — بدون دکمه
                    this._showImageLoading(card);
                    this._enqueueImageGeneration(wordId);
                }
            }
        };

        // هیدراته کردن یک کارت خاص:
        // - اگر dataURL داده شد → نمایش تصویر
        // - اگر null → ابتدا کش را چک می‌کند؛ بود → تصویر؛ نبود → دکمه تولید
        GermanDictionary.prototype._hydrateWordCardImage = async function (wordId, dataURL) {
            var card = document.querySelector('.wl-card[data-id="' + wordId + '"]');
            if (!card) return;

            // اگر dataURL پاس داده نشد، از کش بخوان
            if (!dataURL) {
                try { dataURL = await this._getCachedImage(wordId); }
                catch (e) { dataURL = null; }
            }

            // اگر در حال تولید است → loading نشان بده (مگر اینکه تصویر آماده باشد)
            var state = this._igState;
            if (dataURL) {
                this._showImageInCard(card, dataURL);
            } else if (state && state.busy.has(wordId)) {
                this._showImageLoading(card);
            } else {
                this._showImageGenButton(card, wordId);
            }
        };

        /* ---------- نمایش حالت‌های مختلف در کارت ---------- */

        // تضمین وجود سکشن تصویر در کارت و برگرداندن آن
        GermanDictionary.prototype._ensureImageSection = function (cardEl) {
            if (!cardEl) return null;
            var sec = cardEl.querySelector('.wl-image-section');
            if (!sec) {
                sec = document.createElement('div');
                sec.className = 'wl-image-section';
                // سکشن را قبل از نوار اکشن‌ها (wl-actions) قرار بده
                var actions = cardEl.querySelector('.wl-actions');
                if (actions) {
                    cardEl.insertBefore(sec, actions);
                } else {
                    cardEl.appendChild(sec);
                }
            }
            return sec;
        };

        // دکمه تولید تصویر
        GermanDictionary.prototype._showImageGenButton = function (cardEl, wordId) {
            var sec = this._ensureImageSection(cardEl);
            if (!sec) return;
            sec.className = 'wl-image-section';
            sec.innerHTML =
                '<button class="wl-image-gen-btn" data-ig-gen="' + wordId + '" type="button">' +
                '<i class="fas fa-wand-magic-sparkles"></i>' +
                '<span>ساخت تصویر هوشمند</span>' +
                '</button>';
            var btn = sec.querySelector('.wl-image-gen-btn');
            if (btn) {
                var self = this;
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self._onGenerateButtonClick(wordId);
                });
            }
        };

        // حالت loading (مرحله ۳ از ویژگی‌ها)
        GermanDictionary.prototype._showImageLoading = function (cardEl) {
            var sec = this._ensureImageSection(cardEl);
            if (!sec) return;
            // اگر همین الان هم loading است، کاری نکن
            if (sec.classList.contains('loading')) return;
            sec.className = 'wl-image-section loading';
            sec.innerHTML =
                '<div class="ig-spinner-wrap">' +
                '<div class="ig-spinner"><div class="ig-spinner-ic"><i class="fas fa-paintbrush"></i></div></div>' +
                '<div class="ig-spinner-text">🎨 در حال ساخت تصویر...<small>کمی صبر کنید</small></div>' +
                '</div>';
        };

        // نمایش تصویر آماده در کارت
        GermanDictionary.prototype._showImageInCard = function (cardEl, dataURL) {
            if (!dataURL) { this._showImageGenButton(cardEl, null); return; }
            var sec = this._ensureImageSection(cardEl);
            if (!sec) return;
            sec.className = 'wl-image-section has-img';
            sec.innerHTML =
                '<img class="wl-image-thumb" src="' + dataURL + '" alt="تصویر کلمه" loading="lazy" />';
            var img = sec.querySelector('img');
            if (img) {
                // در صورت خرابی dataURL، دکمه تولید را نشان بده
                var self = this;
                var wordId = parseInt(cardEl.getAttribute('data-id'), 10);
                img.addEventListener('error', function () {
                    // در صورت خطا در بارگذاری تصویر، حالت خطا را نشان بده
                    self._setCardError(wordId, 'تصویر بارگذاری نشد');
                });
            }
        };

        // حالت خطا
        GermanDictionary.prototype._setCardError = function (wordId, message) {
            var card = document.querySelector('.wl-card[data-id="' + wordId + '"]');
            if (!card) return;
            var sec = this._ensureImageSection(card);
            if (!sec) return;
            sec.className = 'wl-image-section error';
            var safeMsg = safeStr(message, 80);
            sec.innerHTML =
                '<div class="wl-image-error-wrap">' +
                '<i class="fas fa-triangle-exclamation ig-err-ic"></i>' +
                '<div class="ig-err-msg">ساخت تصویر ناموفق بود</div>' +
                '<button class="wl-image-retry" data-ig-retry="' + wordId + '" type="button">' +
                '<i class="fas fa-rotate-right"></i> تلاش مجدد</button>' +
                '</div>';
            var retryBtn = sec.querySelector('.wl-image-retry');
            if (retryBtn) {
                var self = this;
                retryBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self._onGenerateButtonClick(wordId);
                });
            }
        };

        // تنظیم کارت روی loading (با جستجو از روی wordId)
        GermanDictionary.prototype._setCardLoading = function (wordId) {
            var card = document.querySelector('.wl-card[data-id="' + wordId + '"]');
            if (card) this._showImageLoading(card);
        };

        // کلیک روی دکمه تولید (در کارت یا retry)
        GermanDictionary.prototype._onGenerateButtonClick = function (wordId) {
            var self = this;
            // بلافاصله UI را روی loading بگذار
            this._setCardLoading(wordId);
            // شروع تولید (غیرمسدود)
            this._generateWordImage(wordId).then(function () {
                // موفقیت — UI توسط runImageGeneration بروز شده
            }).catch(function (err) {
                // خطا — _setCardError قبلاً صدا زده شده
                var msg = (err && err.message) ? err.message : 'خطا در تولید تصویر';
                self.showToast && self.showToast('ساخت تصویر ناموفق بود', 'error', { desc: msg });
            });
        };

        /* ============================================================
           هیدراته کردن تصویر در صفحه جزئیات (.wd-card)
           ============================================================ */
        GermanDictionary.prototype._hydrateWordDetailsImage = async function (word) {
            var container = document.querySelector('.wd-card, .detail-word-card');
            if (!container) return;
            var wordId = word && word.id;
            if (wordId === undefined || wordId === null) {
                // تلاش برای گرفتن از currentWord
                if (this.currentWord && this.currentWord.id !== undefined) {
                    wordId = this.currentWord.id;
                } else {
                    return;
                }
            }

            var dataURL = null;
            try { dataURL = await this._getCachedImage(wordId); } catch (e) { dataURL = null; }

            // اگر در حال تولید است → loading
            var state = this._igState;
            if (dataURL) {
                this._showImageInDetails(dataURL, wordId);
            } else if (state && state.busy.has(wordId)) {
                this._setDetailsLoading(wordId);
            } else {
                this._setDetailsIdle(wordId);
            }
        };

        // تضمین وجود بلوک تصویر در صفحه جزئیات
        GermanDictionary.prototype._ensureDetailsImageBlock = function (wordId) {
            var container = document.querySelector('.wd-card, .detail-word-card');
            if (!container) return null;
            var block = container.querySelector('.wd-image-block');
            if (!block) {
                block = document.createElement('div');
                block.className = 'wd-image-block';
                block.innerHTML =
                    '<div class="wd-image-head">' +
                    '<span class="wd-image-title"><i class="fas fa-image"></i> تصویر هوشمند کلمه</span>' +
                    '<span class="wd-image-actions"></span>' +
                    '</div>' +
                    '<div class="wd-image-body"></div>';
                // قرار دادن بعد از هدر اصلی (wd-header) یا بعد از معنی (wd-meaning)
                var anchor = container.querySelector('.wd-header') ||
                             container.querySelector('.wd-meaning') ||
                             container.querySelector('.wd-info');
                if (anchor && anchor.nextSibling) {
                    container.insertBefore(block, anchor.nextSibling);
                } else if (anchor) {
                    anchor.parentNode.insertBefore(block, anchor.nextSibling);
                } else {
                    container.insertBefore(block, container.firstChild);
                }
            }
            if (wordId !== undefined && wordId !== null) {
                block.setAttribute('data-word-id', wordId);
            }
            return block;
        };

        // حالت idle (با دکمه تولید) در جزئیات
        GermanDictionary.prototype._setDetailsIdle = function (wordId) {
            var block = this._ensureDetailsImageBlock(wordId);
            if (!block) return;
            var body = block.querySelector('.wd-image-body');
            var actions = block.querySelector('.wd-image-actions');
            if (actions) {
                actions.innerHTML =
                    '<button class="wd-image-btn primary" data-ig-details-gen="' + wordId + '" type="button">' +
                    '<i class="fas fa-wand-magic-sparkles"></i> ساخت تصویر</button>';
                var genBtn = actions.querySelector('[data-ig-details-gen]');
                if (genBtn) {
                    var self = this;
                    genBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        self._setDetailsLoading(wordId);
                        self._generateWordImage(wordId).catch(function (err) {
                            var msg = (err && err.message) ? err.message : 'خطا';
                            self._setDetailsError(msg, wordId);
                        });
                    });
                }
            }
            if (body) {
                body.innerHTML =
                    '<div style="text-align:center;color:var(--ig-muted);font-size:12px;">' +
                    'هنوز تصویری ساخته نشده است. روی «ساخت تصویر» بزنید.</div>';
            }
        };

        // حالت loading در جزئیات
        GermanDictionary.prototype._setDetailsLoading = function (wordId) {
            var block = this._ensureDetailsImageBlock(wordId);
            if (!block) return;
            var body = block.querySelector('.wd-image-body');
            var actions = block.querySelector('.wd-image-actions');
            if (actions) actions.innerHTML = '<span style="font-size:11px;color:var(--ig-muted);">در حال تولید...</span>';
            if (body) {
                body.innerHTML =
                    '<div class="ig-spinner-wrap">' +
                    '<div class="ig-spinner"><div class="ig-spinner-ic"><i class="fas fa-paintbrush"></i></div></div>' +
                    '<div class="ig-spinner-text">🎨 در حال ساخت تصویر...<small>کمی صبر کنید</small></div>' +
                    '</div>';
            }
        };

        // نمایش تصویر در جزئیات
        GermanDictionary.prototype._showImageInDetails = function (dataURL, wordId) {
            if (!dataURL) return;
            // اگر wordId پاس داده نشد، از currentWord بگیر
            if (wordId === undefined || wordId === null) {
                if (this.currentWord && this.currentWord.id !== undefined) {
                    wordId = this.currentWord.id;
                }
            }
            var block = this._ensureDetailsImageBlock(wordId);
            if (!block) return;

            // فقط اگر این بلوک مربوط به همین کلمه است، بروز کن
            var blockWordId = block.getAttribute('data-word-id');
            if (wordId !== undefined && wordId !== null && blockWordId &&
                parseInt(blockWordId, 10) !== parseInt(wordId, 10)) {
                return;
            }

            var body = block.querySelector('.wd-image-body');
            var actions = block.querySelector('.wd-image-actions');
            if (body) {
                body.innerHTML = '<img src="' + dataURL + '" alt="تصویر کلمه" />';
                var img = body.querySelector('img');
                if (img) {
                    var self = this;
                    img.addEventListener('error', function () {
                        body.innerHTML = '<div style="color:var(--ig-danger);font-size:12px;">بارگذاری تصویر ناموفق بود</div>';
                    });
                }
            }
            if (actions) {
                var wid = wordId;
                actions.innerHTML =
                    '<button class="wd-image-btn" data-ig-details-retry="' + wid + '" type="button" title="ساخت مجدد">' +
                    '<i class="fas fa-rotate-right"></i> ساخت مجدد</button>' +
                    '<button class="wd-image-btn" data-ig-details-dl="' + wid + '" type="button" title="دانلود">' +
                    '<i class="fas fa-download"></i></button>';
                var retryBtn = actions.querySelector('[data-ig-details-retry]');
                var dlBtn = actions.querySelector('[data-ig-details-dl]');
                if (retryBtn) {
                    var self2 = this;
                    retryBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        // حذف کش قدیمی و ساخت مجدد
                        self2._cacheImage(wid, null).then(function () {
                            self2._setDetailsLoading(wid);
                            // پاک‌سازی از busy/promises برای اجازه تولید مجدد
                            if (self2._igState) { self2._igState.busy.delete(wid); self2._igState.promises.delete(wid); self2._igState.running.delete(wid); }
                            self2._enqueueImageGeneration(wid).catch(function (err) {
                                var msg = (err && err.message) ? err.message : 'خطا';
                                self2._setDetailsError(msg, wid);
                            });
                        });
                    });
                }
                if (dlBtn) {
                    dlBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        try {
                            var a = document.createElement('a');
                            a.href = dataURL;
                            a.download = 'word-image-' + wid + '.png';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        } catch (err) { console.warn('download err', err); }
                    });
                }
            }
        };

        // حالت خطا در جزئیات
        GermanDictionary.prototype._setDetailsError = function (message, wordId) {
            var block = this._ensureDetailsImageBlock(wordId);
            if (!block) return;
            var body = block.querySelector('.wd-image-body');
            var actions = block.querySelector('.wd-image-actions');
            if (body) {
                body.innerHTML =
                    '<div style="text-align:center;color:var(--ig-danger);font-size:12px;line-height:1.7;">' +
                    '<i class="fas fa-triangle-exclamation" style="font-size:22px;display:block;margin-bottom:8px;"></i>' +
                    'ساخت تصویر ناموفق بود<br><small>' + safeStr(message, 100) + '</small></div>';
            }
            if (actions) {
                var self = this;
                actions.innerHTML =
                    '<button class="wd-image-btn primary" data-ig-details-retry="' + wordId + '" type="button">' +
                    '<i class="fas fa-rotate-right"></i> تلاش مجدد</button>';
                var retryBtn = actions.querySelector('[data-ig-details-retry]');
                if (retryBtn) {
                    retryBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        self._setDetailsLoading(wordId);
                        if (self._igState) { self._igState.busy.delete(wordId); self._igState.promises.delete(wordId); self._igState.running.delete(wordId); }
                        self._generateWordImage(wordId).catch(function (err) {
                            var msg = (err && err.message) ? err.message : 'خطا';
                            self._setDetailsError(msg, wordId);
                        });
                    });
                }
            }
        };

        /* ============================================================
           ویژگی ۶: تولید انبوه (Bulk Generation)
           ============================================================ */
        GermanDictionary.prototype._generateAllImages = async function () {
            var state = this._igState;
            if (state.bulk.running) {
                this.showToast && this.showToast('تولید انبوه از قبل در حال اجراست', 'info');
                return;
            }

            var allWords = [];
            try { allWords = await this.getAllWords(); }
            catch (e) { allWords = []; }

            if (!allWords || allWords.length === 0) {
                this.showToast && this.showToast('هیچ لغتی برای تولید تصویر وجود ندارد', 'warning');
                return;
            }

            // فیلتر کردن کلمات بدون تصویر
            var missing = allWords.filter(function (w) {
                return !w.imageData || typeof w.imageData !== 'string' || w.imageData.indexOf('data:') !== 0;
            });

            if (missing.length === 0) {
                this.showToast && this.showToast('همه لغات تصویر دارند 🎉', 'success');
                this._refreshFabBadge();
                return;
            }

            // شروع حالت انبوه
            state.bulk = { running: true, total: missing.length, done: 0, failed: 0, aborted: false };
            this._setBulkRunningUI(true);
            this._updateBulkProgress();

            var self = this;
            this.showToast && this.showToast(
                'شروع تولید تصویر برای ' + missing.length + ' لغت',
                'info',
                { desc: 'حداکثر ' + MAX_CONCURRENT + ' تصویر همزمان' }
            );

            // صف کردن همه کلمات (rate limit به‌صورت خودکار اعمال می‌شود)
            var promises = missing.map(function (w) {
                return self._enqueueImageGeneration(w.id).then(function () {
                    state.bulk.done++;
                }).catch(function (err) {
                    state.bulk.failed++;
                    state.bulk.done++;
                    console.warn('[img-gen] bulk fail for wordId=' + w.id, err);
                });
            });

            // منتظر مانده تا همه تمام شوند
            await Promise.all(promises);

            // پایان
            state.bulk.running = false;
            this._setBulkRunningUI(false);
            this._updateBulkProgress();
            this._refreshFabBadge();

            var ok = state.bulk.done - state.bulk.failed;
            var fail = state.bulk.failed;
            if (fail === 0) {
                this.showToast && this.showToast('تولید همه تصاویر کامل شد ✅', 'success', { desc: ok + ' تصویر ساخته شد' });
            } else {
                this.showToast && this.showToast(
                    'تولید انبوه پایان یافت',
                    'warning',
                    { desc: 'موفق: ' + ok + ' | ناموفق: ' + fail }
                );
            }
        };

        // تیک پیشرفت انبوه — بعد از هر تولید صدا زده می‌شود
        GermanDictionary.prototype._tickBulkProgress = function () {
            if (this._igState && this._igState.bulk && this._igState.bulk.running) {
                this._updateBulkProgress();
            }
        };

        // بروزرسانی نوار پیشرفت در پنل
        GermanDictionary.prototype._updateBulkProgress = function () {
            var wrap = document.querySelector('#ig-popover .ig-progress-wrap');
            if (!wrap) return;
            var state = this._igState.bulk;
            if (!state || !state.running) {
                // اگر تمام شده، یک لحظه نهایی را نشان بده و سپس مخفی کن
                if (state && state.total > 0) {
                    wrap.classList.add('active');
                    var pct = 100;
                    var head = wrap.querySelector('.ig-progress-head');
                    var fill = wrap.querySelector('.ig-progress-fill');
                    var log = wrap.querySelector('.ig-progress-log');
                    if (head) head.innerHTML =
                        '<span>پایان</span><span>' + (state.done - state.failed) + '/' + state.total + ' موفق</span>';
                    if (fill) fill.style.width = pct + '%';
                    if (log) log.innerHTML = '<div>✅ تولید انبوه پایان یافت (' + state.failed + ' ناموفق)</div>';
                    var self2 = this;
                    setTimeout(function () {
                        if (!self2._igState.bulk.running) wrap.classList.remove('active');
                    }, 2500);
                }
                return;
            }
            wrap.classList.add('active');
            var pct = state.total > 0 ? Math.round((state.done / state.total) * 100) : 0;
            var head = wrap.querySelector('.ig-progress-head');
            var fill = wrap.querySelector('.ig-progress-fill');
            var log = wrap.querySelector('.ig-progress-log');
            if (head) head.innerHTML =
                '<span>در حال تولید...</span>' +
                '<span>' + state.done + '/' + state.total + ' (' + pct + '%)</span>';
            if (fill) fill.style.width = pct + '%';
            if (log) {
                var ok = state.done - state.failed;
                log.innerHTML =
                    '<div>✅ موفق: ' + ok + '</div>' +
                    (state.failed > 0 ? '<div>❌ ناموفق: ' + state.failed + '</div>' : '') +
                    '<div>⏳ در صف/در حال: ' + Math.max(0, state.total - state.done) + '</div>';
            }
        };

        // تغییر وضعیت دکمه‌های پنل هنگام اجرای انبوه
        GermanDictionary.prototype._setBulkRunningUI = function (running) {
            var btn = document.querySelector('#ig-popover .ig-pop-btn.primary');
            if (btn) {
                if (running) {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال تولید...';
                } else {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> ساخت همه تصاویر';
                }
            }
        };

        /* ============================================================
           دکمه شناور (FAB) + پنل تولید انبوه
           ============================================================ */
        GermanDictionary.prototype._injectFab = function () {
            if (document.getElementById('ig-fab')) return;
            var self = this;

            // دکمه شناور
            var fab = document.createElement('button');
            fab.id = 'ig-fab';
            fab.type = 'button';
            fab.title = 'تولید تصویر هوشمند لغات';
            fab.setAttribute('aria-label', 'تولید تصویر هوشمند');
            fab.innerHTML = '<i class="fas fa-image"></i><span class="ig-fab-badge" style="display:none;">0</span>';
            document.body.appendChild(fab);

            // پنل شناور
            var pop = document.createElement('div');
            pop.id = 'ig-popover';
            pop.innerHTML =
                '<div class="ig-pop-head">' +
                '<h4><i class="fas fa-image"></i> تولید تصویر هوشمند</h4>' +
                '<button class="ig-pop-close" type="button" aria-label="بستن"><i class="fas fa-xmark"></i></button>' +
                '</div>' +
                '<div class="ig-pop-body">' +
                '<div class="ig-pop-stat">' +
                '<div><div class="ig-stat-num" id="ig-missing-count">—</div><div class="ig-stat-lbl">لغت بدون تصویر</div></div>' +
                '<div><div class="ig-stat-num" id="ig-total-count" style="color:var(--ig-ink-2);">—</div><div class="ig-stat-lbl">مجموع لغات</div></div>' +
                '</div>' +
                '<div class="ig-pop-actions">' +
                '<button class="ig-pop-btn primary" id="ig-bulk-gen" type="button">' +
                '<i class="fas fa-wand-magic-sparkles"></i> ساخت همه تصاویر</button>' +
                '<button class="ig-pop-btn ghost" id="ig-open-list" type="button">' +
                '<i class="fas fa-list"></i> باز کردن لیست لغات</button>' +
                '</div>' +
                '<div class="ig-progress-wrap">' +
                '<div class="ig-progress-head"><span>در حال تولید...</span><span>0/0</span></div>' +
                '<div class="ig-progress-track"><div class="ig-progress-fill"></div></div>' +
                '<div class="ig-progress-log"></div>' +
                '</div>' +
                '</div>';
            document.body.appendChild(pop);

            // رویدادها
            fab.addEventListener('click', function (e) {
                e.preventDefault();
                self._togglePopover();
                if (pop.classList.contains('open')) self._refreshFabBadge();
            });
            var closeBtn = pop.querySelector('.ig-pop-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function () { pop.classList.remove('open'); });
            }
            var bulkBtn = pop.querySelector('#ig-bulk-gen');
            if (bulkBtn) {
                bulkBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    self._generateAllImages();
                });
            }
            var openListBtn = pop.querySelector('#ig-open-list');
            if (openListBtn) {
                openListBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    pop.classList.remove('open');
                    // نمایش بخش لیست لغات (در صورت وجود متد)
                    var wlSection = document.getElementById('word-list-section');
                    if (wlSection) {
                        wlSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else if (typeof self.showView === 'function') {
                        try { self.showView('words'); } catch (err) {}
                    }
                });
            }

            // بستن پنل با کلیک بیرون
            document.addEventListener('click', function (e) {
                if (!pop.classList.contains('open')) return;
                if (pop.contains(e.target) || fab.contains(e.target)) return;
                pop.classList.remove('open');
            });

            // بستن با Escape
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') pop.classList.remove('open');
            });
        };

        GermanDictionary.prototype._togglePopover = function () {
            var pop = document.getElementById('ig-popover');
            if (!pop) return;
            pop.classList.toggle('open');
        };

        // بروزرسانی نشان FAB (تعداد لغات بدون تصویر)
        GermanDictionary.prototype._refreshFabBadge = async function () {
            var fab = document.getElementById('ig-fab');
            if (!fab) return;
            var badge = fab.querySelector('.ig-fab-badge');
            var missingEl = document.getElementById('ig-missing-count');
            var totalEl = document.getElementById('ig-total-count');

            var allWords = [];
            try { allWords = await this.getAllWords(); } catch (e) { allWords = []; }
            var total = allWords.length;
            var missing = 0;
            for (var i = 0; i < allWords.length; i++) {
                var w = allWords[i];
                if (!w.imageData || typeof w.imageData !== 'string' || w.imageData.indexOf('data:') !== 0) missing++;
            }

            if (badge) {
                if (missing > 0) {
                    badge.textContent = missing > 99 ? '99+' : String(missing);
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
            if (missingEl) missingEl.textContent = String(missing);
            if (totalEl) totalEl.textContent = String(total);

            // اگر پنل باز است و تولید انبوه اجرا نیست، متن دکمه را تنظیم کن
            if (this._igState && this._igState.bulk && this._igState.bulk.running) return;
            var bulkBtn = document.querySelector('#ig-bulk-gen');
            if (bulkBtn) {
                if (missing === 0) {
                    bulkBtn.disabled = true;
                    bulkBtn.innerHTML = '<i class="fas fa-check"></i> همه لغات تصویر دارند';
                } else {
                    bulkBtn.disabled = false;
                    bulkBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> ساخت همه تصاویر (' + missing + ')';
                }
            }
        };

        /* ============================================================
           ۵) فعال‌سازی خودکار
           ============================================================ */
        // _initImageSystem را روی prototype تعریف کردیم؛ حالا آن را
        // به‌صورت خودکار روی نمونه فعال فراخوانی می‌کنیم.
        function tryAutoInit() {
            if (typeof dictionaryApp !== 'undefined' && dictionaryApp) {
                try {
                    if (typeof dictionaryApp._initImageSystem === 'function') {
                        dictionaryApp._initImageSystem();
                    } else {
                        // prototype بعد از تعریف باید دیده شود
                        setTimeout(tryAutoInit, 100);
                    }
                } catch (e) {
                    console.error('[img-gen] auto-init error:', e);
                }
            } else {
                setTimeout(tryAutoInit, 120);
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { setTimeout(tryAutoInit, 400); });
        } else {
            setTimeout(tryAutoInit, 400);
        }

    } // پایان installImageGenModule

    // شروع بوت
    boot();

})();
