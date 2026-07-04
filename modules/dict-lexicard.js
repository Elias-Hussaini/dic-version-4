/* ================================================================
   dict-lexicard.js — LexiCard (نسخه نهایی تمیز)
   ============================================================ */

(function() {
    'use strict';

    if (typeof GermanDictionary === 'undefined') {
        var waitInterval = setInterval(function() {
            if (typeof GermanDictionary !== 'undefined') {
                clearInterval(waitInterval);
                initLexiCardModule();
            }
        }, 100);
    } else {
        initLexiCardModule();
    }

    function initLexiCardModule() {

    function _lcInjectStyles() {
        if (document.getElementById('lc-pro-styles')) return;
        const style = document.createElement('style');
        style.id = 'lc-pro-styles';
        style.textContent = `
            .lc-wrap{--lc-primary:#4361ee;--lc-primary-d:#3a56d4;--lc-ink:#0f172a;--lc-muted:#64748b;--lc-line:#e2e8f0;--lc-line-2:#f1f5f9;--lc-card:#ffffff;--lc-card-2:#f8fafc;--lc-shadow:0 12px 40px rgba(15,23,42,.12);--lc-shadow-lg:0 20px 60px rgba(15,23,42,.20);--lc-radius:24px;--lc-radius-s:16px;font-family:'Vazirmatn',Tahoma,sans-serif;color:var(--lc-ink);line-height:1.6;}
            body.dark-mode .lc-wrap{--lc-ink:#f1f5f9;--lc-muted:#94a3b8;--lc-line:#1e293b;--lc-line-2:#1e293b;--lc-card:#1e293b;--lc-card-2:#0f172a;}
            .lc-wrap i,.lc-wrap i::before{font-family:"Font Awesome 6 Free","Font Awesome 5 Free","FontAwesome"!important;}
            .lc-wrap i.fas,.lc-wrap i.fa-solid{font-weight:900!important;}

            .lc-header{background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#134e4a 100%);color:#f8fafc;border-radius:var(--lc-radius);padding:24px 26px;margin-bottom:18px;position:relative;overflow:hidden;box-shadow:var(--lc-shadow);}
            .lc-header::before,.lc-header::after{content:"";position:absolute;border-radius:50%;filter:blur(50px);pointer-events:none;animation:lc-float 10s ease-in-out infinite;}
            .lc-header::before{width:240px;height:240px;background:radial-gradient(circle,rgba(16,185,129,.4),transparent 70%);top:-100px;right:-60px;}
            .lc-header::after{width:200px;height:200px;background:radial-gradient(circle,rgba(139,92,246,.35),transparent 70%);bottom:-80px;left:-40px;animation-delay:-5s;}
            @keyframes lc-float{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(15px,-15px) scale(1.1);}}
            .lc-header h2{margin:0;font-size:20px;font-weight:800;display:flex;align-items:center;gap:12px;position:relative;z-index:1;}
            .lc-header h2 .lc-h-ic{width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:rgba(255,255,255,.15);backdrop-filter:blur(10px);font-size:17px;}
            .lc-header .lc-sub{margin:6px 0 0;font-size:12px;opacity:.8;font-weight:500;position:relative;z-index:1;}

            .lc-search-row{display:flex;gap:10px;position:relative;z-index:1;margin-top:16px;}
            .lc-search-input{flex:1;padding:13px 18px;border:1px solid rgba(255,255,255,.18);border-radius:14px;background:rgba(255,255,255,.1);backdrop-filter:blur(10px);color:#fff;font-family:inherit;font-size:15px;font-weight:500;outline:none;transition:all .25s ease;}
            .lc-search-input::placeholder{color:rgba(255,255,255,.5);}
            .lc-search-input:focus{background:rgba(255,255,255,.15);border-color:rgba(16,185,129,.5);box-shadow:0 0 0 4px rgba(16,185,129,.15);}
            .lc-search-btn{padding:13px 22px;border:none;border-radius:14px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s ease;box-shadow:0 4px 12px rgba(16,185,129,.3);display:flex;align-items:center;gap:7px;}
            .lc-search-btn:hover{transform:translateY(-1px);filter:brightness(1.05);}

            /* پیشنهادات — خارج از هدر، z-index بالا */
            .lc-suggestions{background:var(--lc-card);border:1px solid var(--lc-line);border-radius:var(--lc-radius-s);box-shadow:var(--lc-shadow-lg);z-index:99999;display:none;overflow:hidden;max-height:320px;overflow-y:auto;margin-bottom:18px;}
            .lc-suggestion-item{padding:12px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;transition:background .15s ease;border-bottom:1px solid var(--lc-line);}
            .lc-suggestion-item:last-child{border-bottom:none;}
            .lc-suggestion-item:hover{background:var(--lc-card-2);}
            .lc-suggestion-word{font-weight:700;color:var(--lc-ink);direction:ltr;}
            .lc-suggestion-meaning{font-size:12px;color:var(--lc-muted);margin-inline-start:8px;}
            .lc-suggestion-type{padding:3px 10px;border-radius:999px;font-size:10px;font-weight:700;color:#fff;background:#64748b;}
            .lc-suggestion-type.noun{background:#8b5cf6;}.lc-suggestion-type.verb{background:#f59e0b;}.lc-suggestion-type.adjective{background:#06b6d4;}

            .lc-style-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;}
            .lc-style-btn{padding:8px 16px;border:1.5px solid var(--lc-line);border-radius:999px;background:var(--lc-card);color:var(--lc-muted);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s ease;display:inline-flex;align-items:center;gap:6px;}
            .lc-style-btn:hover{border-color:var(--lc-primary);color:var(--lc-primary);}
            .lc-style-btn.active{background:linear-gradient(135deg,var(--lc-primary),var(--lc-primary-d));color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(67,97,238,.25);}

            .lc-preview-header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px;}
            .lc-preview-header h3{margin:0;font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;}
            .lc-action-btn{padding:8px 14px;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s ease;display:inline-flex;align-items:center;gap:6px;}
            .lc-action-btn.download{background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 4px 10px rgba(16,185,129,.25);}
            .lc-action-btn:hover{transform:translateY(-1px);filter:brightness(1.05);}

            /* کارت — بدون ارتفاع ثابت، با flex رشد می‌کند */
            .lc-card-container{perspective:1200px;display:flex;justify-content:center;padding:20px 0;}
            .lc-card-flip{width:380px;max-width:100%;position:relative;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.4,0,.2,1);cursor:pointer;}
            .lc-card-flip.flipped{transform:rotateY(180deg);}
            .lc-card-face{border-radius:var(--lc-radius);box-shadow:var(--lc-shadow-lg);display:flex;flex-direction:column;}
            .lc-card-front{position:relative;}
            .lc-card-back{position:absolute;top:0;left:0;right:0;transform:rotateY(180deg);backface-visibility:hidden;-webkit-backface-visibility:hidden;}
            .lc-card-front{backface-visibility:hidden;-webkit-backface-visibility:hidden;}

            /* استایل پایه مشترک */
            .lc-card-modern,.lc-card-dark,.lc-card-minimal,.lc-card-classic,.lc-card-neon,.lc-card-gradient{color:#fff;}
            .lc-card-modern .lc-card-header,.lc-card-dark .lc-card-header,.lc-card-minimal .lc-card-header,.lc-card-classic .lc-card-header,.lc-card-neon .lc-card-header,.lc-card-gradient .lc-card-header{padding:24px;display:flex;align-items:center;justify-content:space-between;gap:14px;}
            .lc-card-modern .lc-word,.lc-card-dark .lc-word,.lc-card-minimal .lc-word,.lc-card-classic .lc-word,.lc-card-neon .lc-word,.lc-card-gradient .lc-word{font-size:32px;font-weight:800;direction:ltr;text-align:left;letter-spacing:-0.5px;}
            .lc-card-modern .lc-badges,.lc-card-dark .lc-badges,.lc-card-minimal .lc-badges,.lc-card-classic .lc-badges,.lc-card-neon .lc-badges,.lc-card-gradient .lc-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;}
            .lc-card-modern .lc-badge,.lc-card-dark .lc-badge,.lc-card-minimal .lc-badge,.lc-card-classic .lc-badge,.lc-card-neon .lc-badge,.lc-card-gradient .lc-badge{padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;}
            .lc-card-modern .lc-icon-box,.lc-card-dark .lc-icon-box,.lc-card-minimal .lc-icon-box,.lc-card-classic .lc-icon-box,.lc-card-neon .lc-icon-box,.lc-card-gradient .lc-icon-box{width:56px;height:56px;display:flex;align-items:center;justify-content:center;border-radius:16px;font-size:24px;flex-shrink:0;}
            .lc-card-modern .lc-meaning-box,.lc-card-dark .lc-meaning-box,.lc-card-minimal .lc-meaning-box,.lc-card-classic .lc-meaning-box,.lc-card-neon .lc-meaning-box,.lc-card-gradient .lc-meaning-box{padding:0 24px 20px;}
            .lc-card-modern .lc-meaning-label,.lc-card-dark .lc-meaning-label,.lc-card-minimal .lc-meaning-label,.lc-card-classic .lc-meaning-label,.lc-card-neon .lc-meaning-label,.lc-card-gradient .lc-meaning-label{font-size:11px;opacity:.7;font-weight:600;text-transform:uppercase;letter-spacing:.5px;}
            .lc-card-modern .lc-meaning-text,.lc-card-dark .lc-meaning-text,.lc-card-minimal .lc-meaning-text,.lc-card-classic .lc-meaning-text,.lc-card-neon .lc-meaning-text,.lc-card-gradient .lc-meaning-text{font-size:22px;font-weight:700;margin-top:4px;}
            .lc-card-modern .lc-section,.lc-card-dark .lc-section,.lc-card-minimal .lc-section,.lc-card-classic .lc-section,.lc-card-neon .lc-section,.lc-card-gradient .lc-section{padding:12px 24px;}
            .lc-card-modern .lc-section-title,.lc-card-dark .lc-section-title,.lc-card-minimal .lc-section-title,.lc-card-classic .lc-section-title,.lc-card-neon .lc-section-title,.lc-card-gradient .lc-section-title{font-size:12px;opacity:.8;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
            .lc-card-modern .lc-verb-grid,.lc-card-dark .lc-verb-grid,.lc-card-minimal .lc-verb-grid,.lc-card-classic .lc-verb-grid,.lc-card-neon .lc-verb-grid,.lc-card-gradient .lc-verb-grid,.lc-card-modern .lc-adj-grid,.lc-card-dark .lc-adj-grid,.lc-card-minimal .lc-adj-grid,.lc-card-classic .lc-adj-grid,.lc-card-neon .lc-adj-grid,.lc-card-gradient .lc-adj-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
            .lc-card-modern .lc-verb-item,.lc-card-dark .lc-verb-item,.lc-card-minimal .lc-verb-item,.lc-card-classic .lc-verb-item,.lc-card-neon .lc-verb-item,.lc-card-gradient .lc-verb-item,.lc-card-modern .lc-adj-item,.lc-card-dark .lc-adj-item,.lc-card-minimal .lc-adj-item,.lc-card-classic .lc-adj-item,.lc-card-neon .lc-adj-item,.lc-card-gradient .lc-adj-item{border-radius:10px;padding:8px 12px;}
            .lc-card-modern .lc-item-label,.lc-card-dark .lc-item-label,.lc-card-minimal .lc-item-label,.lc-card-classic .lc-item-label,.lc-card-neon .lc-item-label,.lc-card-gradient .lc-item-label{font-size:10px;opacity:.7;}
            .lc-card-modern .lc-item-value,.lc-card-dark .lc-item-value,.lc-card-minimal .lc-item-value,.lc-card-classic .lc-item-value,.lc-card-neon .lc-item-value,.lc-card-gradient .lc-item-value{font-size:13px;font-weight:700;direction:ltr;text-align:left;font-family:'Segoe UI',system-ui,sans-serif;}
            .lc-card-modern .lc-tags,.lc-card-dark .lc-tags,.lc-card-minimal .lc-tags,.lc-card-classic .lc-tags,.lc-card-neon .lc-tags,.lc-card-gradient .lc-tags{display:flex;gap:6px;flex-wrap:wrap;}
            .lc-card-modern .lc-tag,.lc-card-dark .lc-tag,.lc-card-minimal .lc-tag,.lc-card-classic .lc-tag,.lc-card-neon .lc-tag,.lc-card-gradient .lc-tag{padding:3px 10px;border-radius:999px;font-size:10px;font-weight:600;}
            .lc-card-modern .lc-example-item,.lc-card-dark .lc-example-item,.lc-card-minimal .lc-example-item,.lc-card-classic .lc-example-item,.lc-card-neon .lc-example-item,.lc-card-gradient .lc-example-item{border-radius:10px;padding:10px 14px;margin-bottom:6px;}
            .lc-card-modern .lc-example-de,.lc-card-dark .lc-example-de,.lc-card-minimal .lc-example-de,.lc-card-classic .lc-example-de,.lc-card-neon .lc-example-de,.lc-card-gradient .lc-example-de{font-size:13px;font-weight:700;direction:ltr;font-family:'Segoe UI',system-ui,sans-serif;}
            .lc-card-modern .lc-example-fa,.lc-card-dark .lc-example-fa,.lc-card-minimal .lc-example-fa,.lc-card-classic .lc-example-fa,.lc-card-neon .lc-example-fa,.lc-card-gradient .lc-example-fa{font-size:12px;opacity:.85;margin-top:3px;}

            .lc-card-modern{background:linear-gradient(135deg,var(--lc-grad-1,#4361ee),var(--lc-grad-2,#3a0ca3));}
            .lc-card-modern .lc-icon-box{background:rgba(255,255,255,.15);backdrop-filter:blur(10px);}
            .lc-card-modern .lc-badge{background:rgba(255,255,255,.2);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);}
            .lc-card-modern .lc-section{border-top:1px solid rgba(255,255,255,.1);}
            .lc-card-modern .lc-verb-item,.lc-card-modern .lc-adj-item,.lc-card-modern .lc-example-item{background:rgba(255,255,255,.1);}
            .lc-card-modern .lc-tag{background:rgba(255,255,255,.15);}
            .lc-card-modern .lc-word{text-shadow:0 2px 8px rgba(0,0,0,.15);}

            .lc-card-dark{background:linear-gradient(145deg,#0f172a,#1e293b);color:#f1f5f9;border:1px solid rgba(255,255,255,.08);}
            .lc-card-dark .lc-icon-box{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);}
            .lc-card-dark .lc-badge{background:rgba(255,255,255,.1);}
            .lc-card-dark .lc-section{border-top:1px solid rgba(255,255,255,.05);}
            .lc-card-dark .lc-verb-item,.lc-card-dark .lc-adj-item,.lc-card-dark .lc-example-item{background:rgba(255,255,255,.05);}
            .lc-card-dark .lc-tag{background:rgba(255,255,255,.1);}
            .lc-card-dark .lc-word{color:#60a5fa;}

            .lc-card-minimal{background:var(--lc-card);color:var(--lc-ink);border:1px solid var(--lc-line);}
            .lc-card-minimal .lc-word{font-size:28px;color:var(--lc-grad-1,#4361ee);text-shadow:none;}
            .lc-card-minimal .lc-icon-box{background:color-mix(in srgb,var(--lc-grad-1,#4361ee) 12%,transparent);color:var(--lc-grad-1,#4361ee);}
            .lc-card-minimal .lc-badge{background:var(--lc-line-2);color:var(--lc-muted);border:none;}
            .lc-card-minimal .lc-section{border-top:1px solid var(--lc-line);}
            .lc-card-minimal .lc-verb-item,.lc-card-minimal .lc-adj-item,.lc-card-minimal .lc-example-item{background:var(--lc-card-2);}
            .lc-card-minimal .lc-tag{background:var(--lc-line-2);color:var(--lc-muted);}
            .lc-card-minimal .lc-meaning-text{color:var(--lc-ink);}

            .lc-card-classic{background:#fefce8;color:#1c1917;border:2px solid #92400e;}
            .lc-card-classic .lc-word{font-family:'Georgia',serif;color:#92400e;text-shadow:none;}
            .lc-card-classic .lc-icon-box{background:#fef3c7;color:#92400e;border:1px solid #92400e;}
            .lc-card-classic .lc-badge{background:#92400e;color:#fefce8;border:none;}
            .lc-card-classic .lc-section{border-top:1px dashed #92400e;}
            .lc-card-classic .lc-verb-item,.lc-card-classic .lc-adj-item,.lc-card-classic .lc-example-item{background:#fef3c7;border:1px solid #fde68a;}
            .lc-card-classic .lc-tag{background:#92400e;color:#fefce8;}
            .lc-card-classic .lc-section-title{color:#92400e;}
            .lc-card-classic .lc-meaning-text{color:#1c1917;}

            .lc-card-neon{background:#0a0a0a;color:#fff;border:2px solid #00ff88;box-shadow:0 0 30px rgba(0,255,136,.3),inset 0 0 30px rgba(0,255,136,.05);}
            .lc-card-neon .lc-word{color:#00ff88;text-shadow:0 0 20px rgba(0,255,136,.5);}
            .lc-card-neon .lc-icon-box{background:rgba(0,255,136,.1);border:1px solid #00ff88;color:#00ff88;box-shadow:0 0 15px rgba(0,255,136,.3);}
            .lc-card-neon .lc-badge{background:rgba(0,255,136,.15);border:1px solid #00ff88;color:#00ff88;}
            .lc-card-neon .lc-section{border-top:1px solid rgba(0,255,136,.2);}
            .lc-card-neon .lc-verb-item,.lc-card-neon .lc-adj-item,.lc-card-neon .lc-example-item{background:rgba(0,255,136,.05);border:1px solid rgba(0,255,136,.15);}
            .lc-card-neon .lc-tag{background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.3);color:#00ff88;}
            .lc-card-neon .lc-section-title{color:#00ff88;}
            .lc-card-neon .lc-meaning-text{color:#00ff88;}

            .lc-card-gradient{background:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%);color:#fff;}
            .lc-card-gradient .lc-icon-box{background:rgba(255,255,255,.2);}
            .lc-card-gradient .lc-badge{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.15);}
            .lc-card-gradient .lc-section{border-top:1px solid rgba(255,255,255,.15);}
            .lc-card-gradient .lc-verb-item,.lc-card-gradient .lc-adj-item,.lc-card-gradient .lc-example-item{background:rgba(255,255,255,.1);}
            .lc-card-gradient .lc-tag{background:rgba(255,255,255,.15);}
            .lc-card-gradient .lc-word{text-shadow:0 2px 8px rgba(0,0,0,.2);}

            .lc-card-back-content{padding:40px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:280px;gap:16px;}
            .lc-card-back-content .lc-back-label{font-size:11px;opacity:.6;text-transform:uppercase;letter-spacing:1px;font-weight:600;}
            .lc-card-back-content .lc-back-meaning{font-size:36px;font-weight:800;}
            .lc-card-back-content .lc-back-speak{width:56px;height:56px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,.15);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:22px;cursor:pointer;transition:all .25s ease;}
            .lc-card-back-content .lc-back-speak:hover{transform:scale(1.1);background:rgba(255,255,255,.25);}
            .lc-card-back-content .lc-back-hint{font-size:11px;opacity:.5;margin-top:10px;}

            .lc-empty{text-align:center;padding:60px 24px;background:var(--lc-card);border:2px dashed var(--lc-line);border-radius:var(--lc-radius);}
            .lc-empty .lc-empty-ic{width:80px;height:80px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:linear-gradient(135deg,var(--lc-card-2),var(--lc-line-2));color:var(--lc-primary);font-size:32px;}
            .lc-empty h3{margin:0 0 8px;font-size:18px;font-weight:800;}
            .lc-empty p{margin:0;font-size:13px;color:var(--lc-muted);}
        `;
        document.head.appendChild(style);
    }

    GermanDictionary.prototype.setupLexiCard = function() {
        _lcInjectStyles();
        const section = document.getElementById('lexi-card-section');
        if (!section) return;

        // ساختار: suggestions خارج از هدر تا توسط overflow:hidden clip نشود
        section.innerHTML = `
        <div class="lc-wrap">
            <div class="lc-header">
                <h2><span class="lc-h-ic"><i class="fas fa-id-card"></i></span> LexiCard | کارت هوشمند واژگان</h2>
                <p class="lc-sub">کارت‌های زیبا و قابل دانلود از لغات شما</p>
                <div class="lc-search-row">
                    <input type="text" id="lexi-search-input" class="lc-search-input" placeholder="نام لغت آلمانی را وارد کنید..." autocomplete="off">
                    <button id="lexi-search-btn" class="lc-search-btn"><i class="fas fa-bolt"></i> ساخت کارت</button>
                </div>
            </div>
            <div id="lexi-suggestions" class="lc-suggestions"></div>
            <div class="lc-style-bar">
                <button class="lc-style-btn style-btn active" data-style="modern"><i class="fas fa-wand-magic-sparkles"></i> مدرن</button>
                <button class="lc-style-btn style-btn" data-style="classic"><i class="fas fa-feather"></i> کلاسیک</button>
                <button class="lc-style-btn style-btn" data-style="minimal"><i class="fas fa-circle"></i> مینیمال</button>
                <button class="lc-style-btn style-btn" data-style="dark"><i class="fas fa-moon"></i> دارک</button>
                <button class="lc-style-btn style-btn" data-style="neon"><i class="fas fa-bolt"></i> نئون</button>
                <button class="lc-style-btn style-btn" data-style="gradient"><i class="fas fa-palette"></i> گرادیان</button>
            </div>
            <div id="lexi-card-preview" style="display:none;">
                <div class="lc-preview-header">
                    <h3><i class="fas fa-eye"></i> پیش‌نمایش کارت</h3>
                    <button id="download-lexi-card" class="lc-action-btn download" title="دانلود"><i class="fas fa-download"></i> دانلود</button>
                </div>
                <div id="lexi-card-container" class="lc-card-container"></div>
                <div style="text-align:center;margin-top:12px;font-size:12px;color:var(--lc-muted);"><i class="fas fa-hand-pointer"></i> برای چرخش کارت روی آن کلیک کنید</div>
            </div>
            <div id="lexi-empty-state" class="lc-empty">
                <div class="lc-empty-ic"><i class="fas fa-id-card"></i></div>
                <h3>کارت هوشمند واژگان</h3>
                <p>نام یک لغت آلمانی را جستجو کنید تا کارت زیبای آن ساخته شود</p>
            </div>
        </div>`;

        const searchInput = document.getElementById('lexi-search-input');
        const searchBtn = document.getElementById('lexi-search-btn');
        const suggestionsDiv = document.getElementById('lexi-suggestions');

        this.lexiCardStyle = localStorage.getItem('lexiCardStyle') || 'modern';
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === this.lexiCardStyle);
        });

        searchBtn.onclick = () => {
            const query = searchInput.value.trim();
            if (query) { suggestionsDiv.style.display = 'none'; this.generateLexiCard(query); }
            else this.showToast('لطفاً نام لغت را وارد کنید', 'warning');
        };

        searchInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) { suggestionsDiv.style.display = 'none'; this.generateLexiCard(query); }
            }
        };

        let searchTimeout;
        searchInput.oninput = (e) => {
            const query = e.target.value.trim();
            clearTimeout(searchTimeout);
            if (query.length >= 2) searchTimeout = setTimeout(() => this.showLexiSuggestions(query), 400);
            else suggestionsDiv.style.display = 'none';
        };

        document.addEventListener('click', (e) => {
            if (suggestionsDiv && !suggestionsDiv.contains(e.target) && e.target !== searchInput) {
                suggestionsDiv.style.display = 'none';
            }
        });

        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.onclick = () => {
                this.lexiCardStyle = btn.dataset.style;
                localStorage.setItem('lexiCardStyle', this.lexiCardStyle);
                document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (this.currentLexiWord) this.renderLexiCard(this.currentLexiWord);
                // استایل تغییر کرد — نوتیفیکیشن حذف شد
            };
        });

        document.getElementById('download-lexi-card').onclick = () => this.downloadLexiCard();
        console.log('✅ LexiCard مدرن راه‌اندازی شد');
    };

    GermanDictionary.prototype.getStyleName = function(style) {
        return {modern:'مدرن',classic:'کلاسیک',minimal:'مینیمال',dark:'دارک',neon:'نئون',gradient:'گرادیان'}[style] || style;
    };

    GermanDictionary.prototype.generateLexiCard = async function(query) {
        const words = await this.getAllWords();
        const word = words.find(w => w.german.toLowerCase() === query.toLowerCase());
        if (!word) { this.showToast('لغت "' + query + '" یافت نشد', 'error'); return; }
        this.currentLexiWord = word;
        this.renderLexiCard(word);
        this.showToast('کارت "' + word.german + '" ساخته شد', 'success');
    };

    GermanDictionary.prototype.renderLexiCard = async function(word) {
        const examples = await this.getExamplesForWord(word.id);
        document.getElementById('lexi-empty-state').style.display = 'none';
        document.getElementById('lexi-card-preview').style.display = 'block';
        const container = document.getElementById('lexi-card-container');
        container.innerHTML = this.buildLexiCardHTML(word, examples);

        // تنظیم ارتفاع کارت: بزرگتر از دو face
        const flipCard = container.querySelector('.lc-card-flip');
        if (flipCard) {
            const front = flipCard.querySelector('.lc-card-front');
            const back = flipCard.querySelector('.lc-card-back');
            if (front && back) {
                // موقتاً back را visible کن تا ارتفاعش را بگیریم
                back.style.position = 'relative';
                back.style.visibility = 'hidden';
                const frontH = front.offsetHeight;
                const backH = back.offsetHeight;
                back.style.position = 'absolute';
                back.style.visibility = 'visible';
                flipCard.style.height = Math.max(frontH, backH, 280) + 'px';
            }

            flipCard.onclick = (e) => {
                if (e.target.closest('.lc-back-speak')) return;
                flipCard.classList.toggle('flipped');
            };

            let startX = 0;
            flipCard.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
            flipCard.addEventListener('touchend', (e) => {
                if (Math.abs(e.changedTouches[0].clientX - startX) > 50) flipCard.classList.toggle('flipped');
            }, { passive: true });
        }

        const backSpeak = container.querySelector('.lc-back-speak');
        if (backSpeak) {
            backSpeak.onclick = (e) => { e.stopPropagation(); this.speakText(word.german, 'de-DE'); };
        }
    };

    GermanDictionary.prototype.buildLexiCardHTML = function(word, examples) {
        const style = this.lexiCardStyle || 'modern';
        let grad1 = '#4361ee', grad2 = '#3a0ca3';
        if (word.gender === 'masculine') { grad1 = '#3b82f6'; grad2 = '#1e40af'; }
        else if (word.gender === 'feminine') { grad1 = '#ec4899'; grad2 = '#be185d'; }
        else if (word.gender === 'neuter') { grad1 = '#10b981'; grad2 = '#047857'; }

        const typeMap = {noun:{icon:'fa-tag',text:'اسم'},verb:{icon:'fa-person-running',text:'فعل'},adjective:{icon:'fa-palette',text:'صفت'},adverb:{icon:'fa-clock',text:'قید'},preposition:{icon:'fa-link',text:'حرف اضافه'},other:{icon:'fa-ellipsis',text:'سایر'}};
        const typeInfo = typeMap[word.type] || typeMap.other;
        const genderText = word.gender === 'masculine' ? 'der' : word.gender === 'feminine' ? 'die' : word.gender === 'neuter' ? 'das' : '';

        let verbHtml = '';
        if (word.type === 'verb' && word.verbForms) {
            const vf = word.verbForms;
            verbHtml = '<div class="lc-section"><div class="lc-section-title"><i class="fas fa-table"></i> صرف فعل</div><div class="lc-verb-grid">' +
                (vf.present ? '<div class="lc-verb-item"><div class="lc-item-label">Präsens</div><div class="lc-item-value">' + this.escapeHtml(vf.present) + '</div></div>' : '') +
                (vf.past ? '<div class="lc-verb-item"><div class="lc-item-label">Präteritum</div><div class="lc-item-value">' + this.escapeHtml(vf.past) + '</div></div>' : '') +
                (vf.perfect ? '<div class="lc-verb-item"><div class="lc-item-label">Perfekt</div><div class="lc-item-value">' + this.escapeHtml(vf.perfect) + '</div></div>' : '') +
                (vf.future ? '<div class="lc-verb-item"><div class="lc-item-label">Futur</div><div class="lc-item-value">' + this.escapeHtml(vf.future) + '</div></div>' : '') +
                '</div></div>';
        }

        let adjHtml = '';
        if (word.type === 'adjective') {
            adjHtml = '<div class="lc-section"><div class="lc-section-title"><i class="fas fa-chart-line"></i> حالت‌های صفت</div><div class="lc-adj-grid">' +
                (word.comparative ? '<div class="lc-adj-item"><div class="lc-item-label">Komparativ</div><div class="lc-item-value">' + this.escapeHtml(word.comparative) + '</div></div>' : '') +
                (word.superlative ? '<div class="lc-adj-item"><div class="lc-item-label">Superlativ</div><div class="lc-item-value">' + this.escapeHtml(word.superlative) + '</div></div>' : '') +
                '</div></div>';
        }

        let prepHtml = '';
        if (word.type === 'preposition') {
            prepHtml = '<div class="lc-section"><div class="lc-section-title"><i class="fas fa-map-marker-alt"></i> حرف اضافه</div><div style="font-size:13px;font-weight:600;">حالت: ' + (word.case || 'نامشخص') + '</div>' + (word.meanings ? '<div style="font-size:12px;opacity:.8;margin-top:4px;">' + this.escapeHtml(word.meanings) + '</div>' : '') + '</div>';
        }

        let pluralHtml = word.type === 'noun' && word.plural ? '<div class="lc-badge">' + this.escapeHtml(word.plural) + '</div>' : '';
        let tagsHtml = word.tags && word.tags.length > 0 ? '<div class="lc-section"><div class="lc-section-title"><i class="fas fa-tags"></i> برچسب‌ها</div><div class="lc-tags">' + word.tags.map(t => '<span class="lc-tag">#' + this.escapeHtml(t) + '</span>').join('') + '</div></div>' : '';
        let examplesHtml = examples && examples.length > 0 ? '<div class="lc-section"><div class="lc-section-title"><i class="fas fa-quote-right"></i> مثال‌ها</div>' + examples.slice(0, 3).map(ex => '<div class="lc-example-item"><div class="lc-example-de">' + this.escapeHtml(ex.german) + '</div><div class="lc-example-fa">' + this.escapeHtml(ex.persian) + '</div></div>').join('') + '</div>' : '';

        const cardClass = 'lc-card-' + style;
        const styleVar = 'style="--lc-grad-1:' + grad1 + ';--lc-grad-2:' + grad2 + ';"';

        const frontFace = '<div class="lc-card-face lc-card-front ' + cardClass + '" ' + styleVar + '>' +
            '<div class="lc-card-header"><div><div class="lc-word">' + this.escapeHtml(word.german) + '</div><div class="lc-badges">' + (genderText ? '<span class="lc-badge">' + genderText + '</span>' : '') + '<span class="lc-badge">' + typeInfo.text + '</span>' + pluralHtml + '</div></div><div class="lc-icon-box"><i class="fas ' + typeInfo.icon + '"></i></div></div>' +
            '<div class="lc-meaning-box"><div class="lc-meaning-label">معنی</div><div class="lc-meaning-text">' + this.escapeHtml(word.persian) + '</div></div>' +
            verbHtml + adjHtml + prepHtml + tagsHtml + examplesHtml +
            '</div>';

        const backFace = '<div class="lc-card-face lc-card-back ' + cardClass + '" ' + styleVar + '>' +
            '<div class="lc-card-back-content"><div class="lc-back-label">معنی فارسی</div><div class="lc-back-meaning">' + this.escapeHtml(word.persian) + '</div><button class="lc-back-speak" title="تلفظ"><i class="fas fa-volume-up"></i></button><div class="lc-back-hint"><i class="fas fa-hand-pointer"></i> برای بازگشت کلیک کنید</div></div></div>';

        return '<div class="lc-card-flip">' + frontFace + backFace + '</div>';
    };

    GermanDictionary.prototype.downloadLexiCard = function() {
        const card = document.querySelector('#lexi-card-container .lc-card-flip');
        if (!card) { this.showToast('کارتی برای دانلود وجود ندارد', 'error'); return; }
        const wasFlipped = card.classList.contains('flipped');
        if (wasFlipped) card.classList.remove('flipped');
        if (this.showSimpleLoadingSpinner) this.showSimpleLoadingSpinner();
        setTimeout(() => {
            const front = card.querySelector('.lc-card-front');
            if (!front) { if (this.hideSimpleLoadingSpinner) this.hideSimpleLoadingSpinner(); return; }
            if (typeof html2canvas === 'undefined') { if (this.hideSimpleLoadingSpinner) this.hideSimpleLoadingSpinner(); this.showToast('کتابخانه html2canvas لود نشده', 'error'); return; }
            html2canvas(front, { scale: 3, backgroundColor: null, logging: false, useCORS: true, allowTaint: true }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'lexicard-' + (this.currentLexiWord?.german || 'card') + '.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                setTimeout(() => { if (this.hideSimpleLoadingSpinner) this.hideSimpleLoadingSpinner(); this.showToast('کارت دانلود شد', 'success'); if (wasFlipped) card.classList.add('flipped'); }, 500);
            }).catch(error => { console.error('Error:', error); if (this.hideSimpleLoadingSpinner) this.hideSimpleLoadingSpinner(); this.showToast('خطا در دانلود', 'error'); if (wasFlipped) card.classList.add('flipped'); });
        }, wasFlipped ? 700 : 50);
    };

    GermanDictionary.prototype.showLexiSuggestions = async function(query) {
        const words = await this.getAllWords();
        const results = words.filter(w => w.german.toLowerCase().startsWith(query.toLowerCase())).slice(0, 6);
        const suggestionsDiv = document.getElementById('lexi-suggestions');
        if (!suggestionsDiv) return;
        if (results.length === 0) { suggestionsDiv.style.display = 'none'; return; }
        suggestionsDiv.style.display = 'block';
        suggestionsDiv.innerHTML = results.map(word => '<div class="lc-suggestion-item" data-word="' + this.escapeHtml(word.german) + '"><div><span class="lc-suggestion-word">' + this.escapeHtml(word.german) + '</span><span class="lc-suggestion-meaning">' + this.escapeHtml(word.persian.substring(0, 30)) + '</span></div><span class="lc-suggestion-type ' + (word.type || 'other') + '">' + this.getTypeLabel(word.type) + '</span></div>').join('');
        suggestionsDiv.querySelectorAll('.lc-suggestion-item').forEach(item => {
            item.onclick = () => {
                document.getElementById('lexi-search-input').value = item.dataset.word;
                suggestionsDiv.style.display = 'none';
                this.generateLexiCard(item.dataset.word);
            };
        });
    };

    GermanDictionary.prototype.darkenColor = function(color) {
        return {'#3b82f6':'#1e40af','#ec4899':'#be185d','#10b981':'#047857','#667eea':'#5b21b6','#4361ee':'#3a0ca3'}[color] || '#4c1d95';
    };

    console.log('✅ LexiCard فعال شد.');

    function tryAutoSetup() {
        if (typeof dictionaryApp !== 'undefined' && dictionaryApp) {
            try { dictionaryApp.setupLexiCard(); } catch(e) { console.error('LexiCard auto-setup error:', e); }
        } else { setTimeout(tryAutoSetup, 100); }
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => setTimeout(tryAutoSetup, 300)); }
    else { setTimeout(tryAutoSetup, 300); }

    } // end initLexiCardModule
})();
