/* ================================================================
   dict-ai-chat.js — بخش هوش مصنوعی (نسخه پریمیوم ۲۰۲۵)
   ----------------------------------------------------------------
   • تمام استایل‌ها inline (CSS-in-JS) — بدون وابستگی CSS خارجی
   • طراحی پریمیوم: گلس‌مورفیسم، سایه‌های لایه‌ای، گوشه‌های گرد
   • پالت بنفش/فیروزه‌ای — بدون آبی ایندیگو
   • پشتیبانی کامل از dark mode (body.dark-mode)
   • کاملاً ریسپانسیو — دکمه شناور (FAB) و ارسال تداخل ندارند
   • حفظ تمام IDها و API قدیمی
   ============================================================ */

(function () {
    'use strict';

    /* الگوی polling — مستقل از ترتیب بارگذاری */
    if (typeof GermanDictionary === 'undefined') {
        var waitInterval = setInterval(function () {
            if (typeof GermanDictionary !== 'undefined') {
                clearInterval(waitInterval);
                initAIChatModule();
            }
        }, 100);
    } else {
        initAIChatModule();
    }

    function initAIChatModule() {

        /* ============================================================
           تزریق استایل‌های پریمیوم (یک‌بار)
           ============================================================ */
        function _acInjectStyles() {
            if (document.getElementById('ac-pro-styles')) return;
            var style = document.createElement('style');
            style.id = 'ac-pro-styles';
            style.textContent = `
            /* ===== متغیرهای پایه (Light) ===== */
            .ac-wrap {
                --ac-primary:#6C5CE7; --ac-primary-d:#5A4BD1; --ac-primary-l:#F1EEFF;
                --ac-secondary:#00D2D3; --ac-secondary-l:#E6FBFB;
                --ac-bg:#F7F8FA; --ac-card:#FFFFFF; --ac-card-2:#FBFBFD; --ac-card-3:#F3F4F8;
                --ac-text:#1A1A2E; --ac-text-2:#2D2D44;
                --ac-muted:#6B7280; --ac-muted-2:#9CA3AF;
                --ac-border:#ECEEF2; --ac-border-2:#F3F4F7;
                --ac-bubble-ai:#FFFFFF;
                --ac-bubble-user-1:#6C5CE7; --ac-bubble-user-2:#5A4BD1;
                --ac-success:#10D98B; --ac-danger:#F43F5E;
                --ac-shadow-sm:0 1px 2px rgba(16,18,26,.04), 0 1px 3px rgba(16,18,26,.05);
                --ac-shadow:0 4px 16px rgba(16,18,26,.06), 0 1px 3px rgba(16,18,26,.04);
                --ac-shadow-lg:0 24px 48px rgba(16,18,26,.10), 0 8px 16px rgba(16,18,26,.05);
                --ac-shadow-primary:0 8px 22px rgba(108,92,231,.28);
                --ac-shadow-user:0 6px 18px rgba(90,75,209,.22);
                --ac-radius:24px; --ac-radius-m:18px; --ac-radius-s:14px; --ac-radius-xs:10px;
                --ac-glass-bg:rgba(255,255,255,.72);
                --ac-glass-border:rgba(255,255,255,.65);
                --ac-glass-blur:blur(20px) saturate(180%);
                font-family:'Vazirmatn',Tahoma,sans-serif;
                color:var(--ac-text); line-height:1.65;
                background:var(--ac-bg);
                display:flex; flex-direction:column;
                height:calc(100vh - 96px); max-height:780px;
                gap:12px; padding:4px;
                direction:rtl;
            }
            /* ===== متغیرهای Dark Mode ===== */
            body.dark-mode .ac-wrap {
                --ac-primary:#8B7CF6; --ac-primary-d:#7C6FF0; --ac-primary-l:rgba(139,124,246,.18);
                --ac-secondary:#00D2D3; --ac-secondary-l:rgba(0,210,211,.12);
                --ac-bg:#0F1115; --ac-card:#1A1D24; --ac-card-2:#14161B; --ac-card-3:#22252E;
                --ac-text:#E4E6EB; --ac-text-2:#C7CBD4;
                --ac-muted:#9CA3AF; --ac-muted-2:#6B7280;
                --ac-border:#2A2E38; --ac-border-2:#22252E;
                --ac-bubble-ai:#1A1D24;
                --ac-glass-bg:rgba(26,29,36,.72);
                --ac-glass-border:rgba(255,255,255,.06);
                --ac-shadow-sm:0 1px 2px rgba(0,0,0,.30), 0 1px 3px rgba(0,0,0,.22);
                --ac-shadow:0 4px 16px rgba(0,0,0,.40), 0 1px 3px rgba(0,0,0,.30);
                --ac-shadow-lg:0 24px 48px rgba(0,0,0,.55), 0 8px 16px rgba(0,0,0,.40);
                --ac-shadow-primary:0 8px 22px rgba(124,111,240,.35);
                --ac-shadow-user:0 6px 18px rgba(90,75,209,.30);
            }
            .ac-wrap *,.ac-wrap *::before,.ac-wrap *::after{box-sizing:border-box;}
            .ac-wrap i,.ac-wrap i::before{font-family:"Font Awesome 6 Free","Font Awesome 5 Free","FontAwesome"!important;}
            .ac-wrap i.fas,.ac-wrap i.fa-solid{font-weight:900!important;}
            .ac-wrap i.far,.ac-wrap i.fa-regular{font-weight:400!important;}

            /* ===== نوار بالا (Slim Glass Topbar ~56px) ===== */
            .ac-topbar {
                display:flex; align-items:center; justify-content:space-between; gap:12px;
                padding:10px 16px; min-height:56px;
                background:var(--ac-glass-bg);
                -webkit-backdrop-filter:var(--ac-glass-blur); backdrop-filter:var(--ac-glass-blur);
                border:1px solid var(--ac-glass-border);
                border-radius:var(--ac-radius-m);
                box-shadow:var(--ac-shadow);
                flex-shrink:0;
            }
            .ac-topbar-left{display:flex; align-items:center; gap:12px; min-width:0;}
            .ac-avatar {
                width:40px; height:40px; flex-shrink:0;
                display:flex; align-items:center; justify-content:center;
                border-radius:50%; font-size:17px; color:#fff;
                background:linear-gradient(135deg,var(--ac-primary),var(--ac-primary-d));
                box-shadow:var(--ac-shadow-primary);
                position:relative; overflow:hidden;
            }
            .ac-avatar::after{
                content:''; position:absolute; inset:0; border-radius:50%;
                background:linear-gradient(135deg,rgba(255,255,255,.32),transparent 60%);
                pointer-events:none;
            }
            .ac-topbar-info{min-width:0;}
            .ac-topbar-title{font-size:15px; font-weight:800; color:var(--ac-text); letter-spacing:-.2px; line-height:1.2;}
            .ac-topbar-sub{font-size:11px; color:var(--ac-muted); display:flex; align-items:center; gap:6px; margin-top:2px; font-weight:500;}
            .ac-status-dot{width:7px; height:7px; border-radius:50%; background:var(--ac-success); box-shadow:0 0 0 3px rgba(16,217,139,.18); animation:ac-pulse 2.2s ease-in-out infinite;}
            @keyframes ac-pulse{0%,100%{box-shadow:0 0 0 3px rgba(16,217,139,.18);}50%{box-shadow:0 0 0 6px rgba(16,217,139,.06);}}
            .ac-topbar-actions{display:flex; gap:6px; flex-shrink:0;}
            .ac-icon-btn {
                width:36px; height:36px;
                display:flex; align-items:center; justify-content:center;
                border:1px solid var(--ac-border); border-radius:var(--ac-radius-xs);
                background:var(--ac-card); color:var(--ac-muted);
                cursor:pointer; font-size:14px;
                transition:all .2s cubic-bezier(.4,0,.2,1);
            }
            .ac-icon-btn:hover{border-color:var(--ac-primary); color:var(--ac-primary); background:var(--ac-primary-l); transform:translateY(-1px); box-shadow:var(--ac-shadow-sm);}
            .ac-icon-btn:active{transform:translateY(0) scale(.96);}
            .ac-icon-btn.danger:hover{border-color:var(--ac-danger); color:var(--ac-danger); background:rgba(244,63,94,.08);}

            /* ===== نوار مدل (Pill) ===== */
            .ac-model-bar {
                display:flex; align-items:center; gap:8px;
                padding:0; flex-shrink:0; max-width:100%;
            }
            .ac-model-btn {
                display:flex; align-items:center; gap:8px;
                padding:8px 16px; border:1px solid var(--ac-border); border-radius:999px;
                background:var(--ac-card); color:var(--ac-text);
                font-family:inherit; font-size:13px; font-weight:700;
                cursor:pointer; outline:none; transition:all .2s ease;
                min-height:40px; width:100%; justify-content:space-between;
            }
            .ac-model-btn:hover{border-color:var(--ac-primary); box-shadow:0 0 0 3px rgba(108,92,231,.12);}
            .ac-model-btn-left{display:flex; align-items:center; gap:8px;}
            .ac-model-btn i.fa-brain{color:var(--ac-primary); font-size:14px;}
            .ac-model-btn .ac-chev{color:var(--ac-muted); font-size:11px; transition:transform .2s ease;}
            .ac-model-btn.open .ac-chev{transform:rotate(180deg);}

            /* popup انتخاب مدل */
            .ac-model-popup {
                position:fixed; inset:0; z-index:100000;
                display:none; align-items:flex-end; justify-content:center;
                background:rgba(0,0,0,.45); backdrop-filter:blur(4px);
            }
            .ac-model-popup.open{display:flex;}
            .ac-model-popup-content {
                background:var(--ac-card); border-radius:20px 20px 0 0;
                width:100%; max-width:500px; padding:16px;
                box-shadow:0 -10px 40px rgba(0,0,0,.2);
                animation:ac-slide-up .3s ease;
            }
            @keyframes ac-slide-up{from{transform:translateY(100%);}to{transform:translateY(0);}}
            .ac-model-popup-title{font-size:15px; font-weight:800; color:var(--ac-text); margin-bottom:12px; display:flex; align-items:center; gap:8px;}
            .ac-model-option {
                padding:14px 16px; border:1px solid var(--ac-border); border-radius:14px;
                margin-bottom:8px; cursor:pointer; transition:all .18s ease;
                display:flex; align-items:center; gap:12px;
            }
            .ac-model-option:hover{border-color:var(--ac-primary); background:var(--ac-primary-l);}
            .ac-model-option.active{border-color:var(--ac-primary); background:var(--ac-primary-l);}
            .ac-model-option-ic{font-size:20px; flex-shrink:0;}
            .ac-model-option-info{flex:1;}
            .ac-model-option-name{font-size:14px; font-weight:700; color:var(--ac-text);}
            .ac-model-option-desc{font-size:11px; color:var(--ac-muted); margin-top:2px;}
            .ac-model-option-check{color:var(--ac-primary); font-size:16px; visibility:hidden;}
            .ac-model-option.active .ac-model-option-check{visibility:visible;}

            /* ===== ناحیه پیام‌ها ===== */
            .ac-messages {
                flex:1; overflow-y:auto; overflow-x:hidden;
                padding:20px 16px;
                background:var(--ac-card-2);
                border:1px solid var(--ac-border);
                border-radius:var(--ac-radius);
                box-shadow:var(--ac-shadow-sm);
                scroll-behavior:smooth;
            }
            .ac-messages::-webkit-scrollbar{width:8px;}
            .ac-messages::-webkit-scrollbar-track{background:transparent;}
            .ac-messages::-webkit-scrollbar-thumb{background:var(--ac-border); border-radius:8px; border:2px solid transparent; background-clip:padding-box;}
            .ac-messages::-webkit-scrollbar-thumb:hover{background:var(--ac-muted-2); background-clip:padding-box;}
            .ac-messages{scrollbar-width:thin; scrollbar-color:var(--ac-border) transparent;}

            /* ===== خوش‌آمدگویی ===== */
            .ac-welcome{text-align:center; padding:36px 16px 24px; max-width:600px; margin:0 auto; animation:ac-fade-up .4s cubic-bezier(.16,1,.3,1);}
            @keyframes ac-fade-up{from{opacity:0; transform:translateY(12px);}to{opacity:1; transform:translateY(0);}}
            .ac-welcome-ic {
                width:72px; height:72px; margin:0 auto 18px;
                display:flex; align-items:center; justify-content:center;
                border-radius:22px; font-size:32px; color:#fff;
                background:linear-gradient(135deg,var(--ac-primary),var(--ac-primary-d));
                box-shadow:var(--ac-shadow-primary);
                position:relative; overflow:hidden;
            }
            .ac-welcome-ic::after{content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.32),transparent 60%);}
            .ac-welcome h3{margin:0 0 8px; font-size:20px; font-weight:800; color:var(--ac-text); letter-spacing:-.3px;}
            .ac-welcome p{margin:0 0 18px; font-size:14px; color:var(--ac-muted); line-height:1.7;}
            .ac-welcome-features{display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-bottom:22px;}
            .ac-welcome-feat{padding:6px 14px; background:var(--ac-card); border:1px solid var(--ac-border); border-radius:999px; font-size:11.5px; font-weight:600; color:var(--ac-muted); display:inline-flex; align-items:center; gap:5px;}

            /* ===== سوالات سریع ===== */
            .ac-quick{display:grid; grid-template-columns:repeat(2,1fr); gap:10px; max-width:580px; margin:0 auto;}
            .ac-quick-btn {
                padding:14px 10px; border:1px solid var(--ac-border);
                border-radius:var(--ac-radius-s); background:var(--ac-card);
                cursor:pointer; transition:all .22s cubic-bezier(.4,0,.2,1);
                display:flex; flex-direction:column; align-items:center; gap:9px;
                font-family:inherit; font-size:12.5px; font-weight:700; color:var(--ac-text);
                text-align:center; box-shadow:var(--ac-shadow-sm);
            }
            .ac-quick-btn:hover{border-color:var(--ac-primary); transform:translateY(-3px); box-shadow:var(--ac-shadow);}
            .ac-quick-btn:hover .ac-quick-ic{background:linear-gradient(135deg,var(--ac-primary),var(--ac-primary-d)); color:#fff; transform:scale(1.08) rotate(-3deg);}
            .ac-quick-ic{
                width:42px; height:42px; display:flex; align-items:center; justify-content:center;
                border-radius:13px; font-size:17px; color:var(--ac-primary); background:var(--ac-primary-l);
                transition:all .22s cubic-bezier(.4,0,.2,1);
            }

            /* ===== حباب پیام ===== */
            .ac-msg{display:flex; gap:11px; margin-bottom:18px; max-width:800px; margin-inline:auto; animation:ac-msg-in .32s cubic-bezier(.16,1,.3,1);}
            .ac-msg.ai{flex-direction:row-reverse;}
            @keyframes ac-msg-in{from{opacity:0; transform:translateY(10px);}to{opacity:1; transform:translateY(0);}}
            .ac-msg-avatar{
                width:34px; height:34px; flex-shrink:0;
                display:flex; align-items:center; justify-content:center;
                border-radius:50%; font-size:14px; color:#fff;
                box-shadow:var(--ac-shadow-sm); overflow:hidden; position:relative;
            }
            .ac-msg-avatar::after{content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.28),transparent 60%);}
            .ac-msg.user .ac-msg-avatar{background:linear-gradient(135deg,#00B4D8,#0077B6);}
            .ac-msg.ai .ac-msg-avatar{background:linear-gradient(135deg,var(--ac-primary),var(--ac-primary-d));}
            .ac-msg-body{flex:1; min-width:0; display:flex; flex-direction:column;}
            .ac-msg.user .ac-msg-body{align-items:flex-start;}
            .ac-msg.ai .ac-msg-body{align-items:flex-end;}
            .ac-msg-bubble{
                display:inline-block; max-width:88%;
                padding:12px 16px; border-radius:18px;
                font-size:14px; line-height:1.75;
                word-wrap:break-word; overflow-wrap:break-word;
                position:relative;
            }
            .ac-msg.user .ac-msg-bubble{
                background:linear-gradient(135deg,var(--ac-bubble-user-1),var(--ac-bubble-user-2));
                color:#fff; border-bottom-right-radius:6px;
                box-shadow:var(--ac-shadow-user);
            }
            .ac-msg.ai .ac-msg-bubble{
                background:var(--ac-bubble-ai); color:var(--ac-text);
                border:1px solid var(--ac-border); border-bottom-left-radius:6px;
                box-shadow:var(--ac-shadow-sm);
            }
            body.dark-mode .ac-msg.ai .ac-msg-bubble{border-color:var(--ac-border);}
            .ac-msg-time{font-size:10px; color:var(--ac-muted-2); margin-top:5px; padding:0 4px; font-weight:500;}

            /* ===== دکمه‌های زیر پیام (کپی / باز تولید) ===== */
            .ac-msg-actions{display:flex; gap:6px; margin-top:6px; padding:0 4px; opacity:0; transition:opacity .2s ease;}
            .ac-msg:hover .ac-msg-actions{opacity:1;}
            .ac-msg-action-btn{
                display:inline-flex; align-items:center; gap:4px;
                padding:4px 10px; border:1px solid var(--ac-border); border-radius:8px;
                background:var(--ac-card); color:var(--ac-muted);
                font-family:inherit; font-size:11px; font-weight:600;
                cursor:pointer; transition:all .18s ease;
            }
            .ac-msg-action-btn:hover{border-color:var(--ac-primary); color:var(--ac-primary); background:var(--ac-primary-l);}
            .ac-msg-action-btn i{font-size:10px;}
            @media(max-width:768px){.ac-msg-actions{opacity:1;}}

            /* محتوای مارک‌داون داخل حباب */
            .ac-msg-bubble h1,.ac-msg-bubble h2,.ac-msg-bubble h3{margin:10px 0 6px; font-weight:800; line-height:1.4;}
            .ac-msg-bubble h1:first-child,.ac-msg-bubble h2:first-child,.ac-msg-bubble h3:first-child{margin-top:0;}
            .ac-msg-bubble h1{font-size:18px;}
            .ac-msg-bubble h2{font-size:16px;}
            .ac-msg-bubble h3{font-size:14.5px;}
            .ac-msg-bubble p{margin:6px 0;}
            .ac-msg-bubble ul,.ac-msg-bubble ol{margin:8px 0; padding-inline-start:20px;}
            .ac-msg-bubble li{margin:4px 0;}
            .ac-msg-bubble strong{font-weight:800;}
            .ac-msg-bubble em{font-style:italic;}
            .ac-msg-bubble a{color:inherit; text-decoration:underline; opacity:.9;}
            .ac-msg-bubble code{background:rgba(108,92,231,.12); color:var(--ac-primary); padding:2px 7px; border-radius:6px; font-family:'Fira Code',monospace; font-size:12.5px; font-weight:600;}
            .ac-msg.user .ac-msg-bubble code{background:rgba(255,255,255,.22); color:#fff;}
            .ac-msg-bubble blockquote{border-inline-start:3px solid var(--ac-primary); padding:4px 14px; margin:8px 0; background:var(--ac-primary-l); border-radius:8px; color:var(--ac-text-2); font-style:italic;}
            .ac-msg-bubble table{border-collapse:collapse; width:100%; margin:10px 0; font-size:12.5px; border-radius:10px; overflow:hidden;}
            .ac-msg-bubble th,.ac-msg-bubble td{border:1px solid var(--ac-border); padding:7px 10px; text-align:right;}
            .ac-msg-bubble th{background:var(--ac-primary-l); color:var(--ac-primary); font-weight:800;}
            .ac-msg-bubble tr:nth-child(even) td{background:var(--ac-card-3);}
            /* جدول‌ها: اسکرول افقی روی موبایل — اعمال روی هر دو کلاس محتوای پیام */
            .ac-msg-bubble table,.ac-msg-content table{
                display:block; overflow-x:auto; -webkit-overflow-scrolling:touch; max-width:100%;
                scrollbar-width:thin; border-collapse:collapse; font-size:12px;
            }
            .ac-msg-bubble th,.ac-msg-content th{background:var(--ac-primary-l,#eef2ff);padding:6px 10px;text-align:right;font-weight:700;white-space:nowrap;border:1px solid rgba(0,0,0,.08);}
            .ac-msg-bubble td,.ac-msg-content td{padding:6px 10px;text-align:right;white-space:nowrap;border:1px solid rgba(0,0,0,.06);}
            body.dark-mode .ac-msg-bubble th,body.dark-mode .ac-msg-content th{background:rgba(108,92,231,.15);border-color:rgba(255,255,255,.08);}
            body.dark-mode .ac-msg-bubble td,body.dark-mode .ac-msg-content td{border-color:rgba(255,255,255,.06);}
            .ac-msg-bubble table::-webkit-scrollbar,.ac-msg-content table::-webkit-scrollbar{height:6px;}
            .ac-msg-bubble table::-webkit-scrollbar-thumb,.ac-msg-content table::-webkit-scrollbar-thumb{background:var(--ac-border); border-radius:3px;}

            /* ===== ایندیکاتور تایپ ===== */
            .ac-typing{display:flex; gap:5px; padding:4px 2px; align-items:center;}
            .ac-typing span{width:8px; height:8px; border-radius:50%; background:var(--ac-muted-2); animation:ac-typing-bounce 1.4s ease-in-out infinite;}
            .ac-typing span:nth-child(2){animation-delay:.18s;}
            .ac-typing span:nth-child(3){animation-delay:.36s;}
            @keyframes ac-typing-bounce{0%,60%,100%{transform:translateY(0); opacity:.4;}30%{transform:translateY(-7px); opacity:1; background:var(--ac-primary);}}

            /* ===== ایندیکاتور «در حال فکر کردن» ===== */
            .ac-thinking{display:flex; align-items:center; gap:8px; padding:2px 2px; font-size:13.5px; font-weight:600; color:var(--ac-muted); line-height:1.6;}
            .ac-thinking-emoji{font-size:16px; flex-shrink:0;} .ac-thinking-ic{width:20px;height:20px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--ac-primary);font-size:14px;}
            .ac-thinking-dots{display:inline-flex; gap:3px; align-items:center;}
            .ac-thinking-dots span{width:5px; height:5px; border-radius:50%; background:var(--ac-primary); animation:ac-thinking-pulse 1.2s ease-in-out infinite;}
            .ac-thinking-dots span:nth-child(2){animation-delay:.18s;}
            .ac-thinking-dots span:nth-child(3){animation-delay:.36s;}
            @keyframes ac-thinking-pulse{0%,60%,100%{transform:scale(.7); opacity:.4;}30%{transform:scale(1.15); opacity:1;}}

            /* ===== پیش‌نمایش تصویر ===== */
            .ac-img-preview{
                display:flex; align-items:center; gap:10px;
                padding:8px 12px; margin-bottom:8px; max-width:560px; margin-inline:auto;
                background:var(--ac-card); border:1px solid var(--ac-border);
                border-radius:var(--ac-radius-s); box-shadow:var(--ac-shadow-sm);
                animation:ac-fade-up .25s ease; flex-shrink:0;
            }
            .ac-img-preview img{width:38px; height:38px; border-radius:9px; object-fit:cover; flex-shrink:0; box-shadow:var(--ac-shadow-sm);}
            .ac-img-preview .ac-img-name{flex:1; min-width:0; font-size:12.5px; font-weight:600; color:var(--ac-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
            .ac-img-preview .ac-img-close{width:26px; height:26px; flex-shrink:0; display:flex; align-items:center; justify-content:center; border:none; border-radius:8px; background:rgba(244,63,94,.10); color:var(--ac-danger); cursor:pointer; font-size:12px; transition:all .15s ease;}
            .ac-img-preview .ac-img-close:hover{background:var(--ac-danger); color:#fff;}

            /* ===== نوار ورودی (Glass Input Bar) ===== */
            .ac-input-bar {
                display:flex; align-items:flex-end; gap:8px;
                padding:10px 12px;
                background:var(--ac-glass-bg);
                -webkit-backdrop-filter:var(--ac-glass-blur); backdrop-filter:var(--ac-glass-blur);
                border:1px solid var(--ac-glass-border);
                border-radius:var(--ac-radius);
                box-shadow:var(--ac-shadow);
                flex-shrink:0;
                flex-direction:row-reverse;
            }
            .ac-input-actions-left{display:flex; gap:6px; flex-shrink:0;}
            .ac-input-action{
                width:38px; height:38px; flex-shrink:0;
                display:flex; align-items:center; justify-content:center;
                border:1px solid var(--ac-border); border-radius:var(--ac-radius-xs);
                background:var(--ac-card); color:var(--ac-muted);
                cursor:pointer; font-size:14px;
                transition:all .2s cubic-bezier(.4,0,.2,1);
            }
            .ac-input-action:hover{border-color:var(--ac-primary); color:var(--ac-primary); background:var(--ac-primary-l); transform:translateY(-1px);}
            .ac-input-action:active{transform:scale(.95);}
            .ac-input-action.recording{background:var(--ac-danger); border-color:var(--ac-danger); color:#fff; animation:ac-rec 1s ease-in-out infinite;}
            @keyframes ac-rec{0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,.4);}50%{box-shadow:0 0 0 8px rgba(244,63,94,0);}}
            .ac-textarea{
                flex:1; min-width:0; min-height:40px; max-height:128px;
                padding:10px 14px; border:1px solid var(--ac-border); border-radius:var(--ac-radius-xs);
                background:var(--ac-card); color:var(--ac-text);
                font-family:inherit; font-size:14px; font-weight:500; line-height:1.55;
                outline:none; resize:none;
                transition:all .2s ease;
            }
            .ac-textarea::placeholder{color:var(--ac-muted-2);}
            .ac-textarea:focus{border-color:var(--ac-primary); box-shadow:0 0 0 3px rgba(108,92,231,.16);}
            .ac-send-btn{
                width:44px; height:44px; flex-shrink:0;
                display:flex; align-items:center; justify-content:center;
                border:none; border-radius:var(--ac-radius-s);
                background:linear-gradient(135deg,var(--ac-primary),var(--ac-primary-d));
                color:#fff; font-size:16px; cursor:pointer;
                transition:all .2s cubic-bezier(.4,0,.2,1);
                box-shadow:var(--ac-shadow-primary);
            }
            .ac-send-btn:hover{transform:translateY(-2px) scale(1.04); filter:brightness(1.08); box-shadow:0 10px 26px rgba(108,92,231,.38);}
            .ac-send-btn:active{transform:scale(.95);}
            .ac-send-btn:disabled{opacity:.5; cursor:not-allowed; transform:none; box-shadow:var(--ac-shadow-sm);}

            /* ===== ریسپانسیو ===== */
            @media(max-width:768px){
                .ac-wrap{height:calc(100vh - 92px); max-height:none; gap:10px; padding:2px;}
                .ac-topbar{padding:8px 12px; min-height:50px;}
                .ac-avatar{width:36px; height:36px; font-size:15px;}
                .ac-topbar-title{font-size:14px;}
                .ac-topbar-sub{font-size:10.5px;}
                .ac-icon-btn{width:34px; height:34px; font-size:13px;}
                .ac-model-bar{padding:4px 5px 4px 12px;}
                .ac-model-label{font-size:11px;}
                .ac-model-select{font-size:11px; padding:6px 26px 6px 12px; max-width:180px;}
                .ac-messages{padding:14px 10px; border-radius:var(--ac-radius-m);}
                .ac-welcome{padding:24px 12px 16px;}
                .ac-welcome-ic{width:60px; height:60px; font-size:26px; border-radius:18px;}
                .ac-welcome h3{font-size:17px;}
                .ac-welcome p{font-size:13px;}
                .ac-quick{gap:8px;}
                .ac-quick-btn{padding:11px 8px; font-size:11.5px;}
                .ac-quick-ic{width:36px; height:36px; font-size:15px;}
                .ac-msg{gap:9px; margin-bottom:14px;}
                .ac-msg-avatar{width:30px; height:30px; font-size:12px;}
                .ac-msg-bubble{font-size:13px; padding:10px 14px; max-width:90%;}
                /* نوار ورودی: عرض کامل و فاصله‌گذاری مناسب در موبایل */
                .ac-input-bar{
                    width:100%;
                    padding:10px 10px;
                    gap:8px;
                    padding-left:10px;
                    border-radius:var(--ac-radius-m);
                    flex-wrap:nowrap;
                }
                .ac-input-actions-left{gap:5px;}
                .ac-input-action{width:38px; height:42px; font-size:14px;}
                .ac-textarea{
                    flex:1;
                    min-width:0;
                    font-size:15px;
                    padding:12px 14px;
                    min-height:48px;
                    max-height:140px;
                    border-radius:var(--ac-radius-xs);
                    line-height:1.6;
                }
                .ac-textarea::placeholder{font-size:13px;}
                .ac-send-btn{width:46px; height:46px; font-size:15px;}
            }
            @media(max-width:768px){
                .ac-model-bar{width:100%; padding:8px 12px; border-radius:14px; gap:6px;}
                .ac-model-label{font-size:11px;}
                .ac-model-label span{display:none;}
                .ac-model-select{flex:1; max-width:none; width:100%; font-size:13px; padding:10px 32px 10px 14px; min-height:42px; border-radius:12px;}
            }
            @media(max-width:480px){
                /* دکمه تاریخچه چت روی موبایل باید مرئی باشد — مخفی نکردن دکمه‌ها */
                .ac-topbar-actions{gap:5px;}
                .ac-topbar-actions .ac-icon-btn{width:34px; height:34px; font-size:13px; flex-shrink:0;}
                #chat-history-btn{display:inline-flex !important; visibility:visible !important; opacity:1 !important;}
                .ac-model-bar{width:100%; padding:6px 10px; border-radius:12px;}
                .ac-model-label span{display:none;}
                .ac-model-select{flex:1; width:100%; max-width:none; font-size:13px; padding:10px 32px 10px 14px; min-height:42px; border-radius:10px;}
                .ac-welcome-features{display:none;}
                .ac-input-bar{padding:8px 8px; gap:6px;}
                .ac-input-action{width:36px; height:40px; font-size:13px;}
                .ac-textarea{font-size:14px; padding:11px 12px; min-height:44px;}
                .ac-send-btn{width:44px; height:44px; font-size:14px;}
            }
            @media(max-width:380px){
                .ac-quick{grid-template-columns:1fr;}
                .ac-topbar-actions .ac-icon-btn{width:32px; height:32px; font-size:12px;}
            }
            @media(min-width:769px){
                .ac-quick{grid-template-columns:repeat(4,1fr);}
            }
            `;
            document.head.appendChild(style);
        }

        /* ============================================================
           رندر بخش چت AI
           ============================================================ */
        GermanDictionary.prototype.renderAIChat = function () {
            _acInjectStyles();
            var container = document.getElementById('ai-chat-section');
            if (!container) return;

            this.chatMemory = this.chatMemory || [];
            this.isGeneratingImage = false;
            if (typeof this.loadChatMemory === 'function') {
                try { this.loadChatMemory(); } catch (e) {}
            }

            var models = [
                { id: 'llama-4-scout-17b-16e-instruct', name: '🦙 Llama 4 Scout 17B', desc: 'پیشرفته‌ترین + تصویر' },
                { id: 'groq/compound', name: '⚡ Groq Compound', desc: 'ترکیبی هوشمند' },
                { id: 'gpt-oss-120b', name: '🤖 GPT OSS 120B', desc: 'فوق سنگین + تصویر' },
                { id: 'llama-3.1-8b', name: '🦙 Llama 3.1 8B', desc: 'سریع' }
            ];
            this._acModels = models; // ذخیره برای استفاده در _acSetupEvents

            var savedModel = 'llama-4-scout-17b-16e-instruct';
            try { savedModel = localStorage.getItem('aiModel') || 'llama-4-scout-17b-16e-instruct'; } catch (e) {}
            this.aiModel = savedModel;

            var modelOptions = models.map(function (m) {
                return '<option value="' + m.id + '"' + (savedModel === m.id ? ' selected' : '') + '>' + m.name + ' — ' + m.desc + '</option>';
            }).join('');

            container.innerHTML =
                '<div class="ac-wrap">' +
                    '<div class="ac-topbar">' +
                        '<div class="ac-topbar-left">' +
                            '<div class="ac-avatar"><i class="fas fa-wand-magic-sparkles"></i></div>' +
                            '<div class="ac-topbar-info">' +
                                '<div class="ac-topbar-title">دستیار هوش مصنوعی</div>' +
                                '<div class="ac-topbar-sub"><span class="ac-status-dot"></span> آنلاین • آماده پاسخگویی</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="ac-topbar-actions">' +
                            '<button class="ac-icon-btn" id="new-chat-btn" title="چت جدید" aria-label="چت جدید"><i class="fas fa-plus"></i></button>' +
                            '<button class="ac-icon-btn" id="chat-history-btn" title="تاریخچه چت‌ها" aria-label="تاریخچه"><i class="fas fa-history"></i></button>' +
                            '<button class="ac-icon-btn danger" id="clear-chat-history" title="پاک کردن چت" aria-label="پاک کردن"><i class="fas fa-trash-alt"></i></button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="ac-model-bar">' +
                        '<button class="ac-model-btn" id="ai-model-btn" aria-label="انتخاب مدل">' +
                            '<span class="ac-model-btn-left"><i class="fas fa-brain"></i> <span id="ai-model-name">' + (models.find(function(m){return m.id===savedModel;})||models[0]).name + '</span></span>' +
                            '<i class="fas fa-chevron-down ac-chev"></i>' +
                        '</button>' +
                    '</div>' +
                    '<div class="ac-messages" id="chat-history">' + this._acWelcomeHTML() + '</div>' +
                    '<div class="ac-input-bar">' +
                        '<div class="ac-input-actions-left">' +
                            '<button class="ac-input-action" id="upload-image-btn" title="آپلود تصویر" aria-label="آپلود تصویر"><i class="fas fa-image"></i></button>' +
                            '<button class="ac-input-action" id="voice-input-toggle" title="ورودی صوتی" aria-label="ورودی صوتی"><i class="fas fa-microphone"></i></button>' +
                        '</div>' +
                        '<textarea id="ai-chat-input" class="ac-textarea" placeholder="سوال خود را بپرسید..." rows="1" aria-label="متن پیام"></textarea>' +
                        '<button class="ac-send-btn" id="send-ai-message" title="ارسال" aria-label="ارسال پیام"><i class="fas fa-paper-plane"></i></button>' +
                    '</div>' +
                '</div>' +
                '<input type="file" id="file-upload-input" style="display:none;" multiple>' +
                '<input type="file" id="image-upload-input" style="display:none;" accept="image/*">';

            this._acSetupEvents();
        };

        /* ============================================================
           HTML پیام خوش‌آمد + سوالات سریع
           ============================================================ */
        GermanDictionary.prototype._acWelcomeHTML = function () {
            var self = this;
            var quickQ = [
                { icon: 'fa-language', text: 'صرف فعل', q: 'چگونه افعال آلمانی را صرف کنم؟' },
                { icon: 'fa-venus-mars', text: 'جنسیت اسم‌ها', q: 'تفاوت der, die, das چیست؟' },
                { icon: 'fa-comment-dots', text: 'جمله‌سازی', q: 'جمله‌سازی آلمانی آموزش بده' },
                { icon: 'fa-volume-high', text: 'تلفظ', q: 'تلفظ صحیح کلمات آلمانی' }
            ];
            var quickHTML = quickQ.map(function (q) {
                return '<button class="ac-quick-btn" data-question="' + self._acAttr(q.q) + '">' +
                    '<div class="ac-quick-ic"><i class="fas ' + q.icon + '"></i></div>' +
                    '<span>' + self._acText(q.text) + '</span>' +
                '</button>';
            }).join('');

            return '<div class="ac-welcome">' +
                '<div class="ac-welcome-ic"><i class="fas fa-wand-magic-sparkles"></i></div>' +
                '<h3>🤖 سلام! خوش آمدید</h3>' +
                '<p>من دستیار تو هستم میخواهی لغاتی که اضافه کردی رو با هم تمرین کنیم؟</p>' +
                
                '<div class="ac-quick">' + quickHTML + '</div>' +
            '</div>';
        };

        GermanDictionary.prototype.renderWelcomeMessage = function () {
            return this._acWelcomeHTML();
        };

        GermanDictionary.prototype.renderQuickQuestions = function () {
            return '';
        };

        /* ============================================================
           popup انتخاب مدل
           ============================================================ */
        GermanDictionary.prototype._acShowModelPopup = function(models) {
            var self = this;
            // حذف popup قبلی
            var old = document.getElementById('ac-model-popup');
            if (old) old.remove();

            var popup = document.createElement('div');
            popup.id = 'ac-model-popup';
            popup.className = 'ac-model-popup';

            var content = document.createElement('div');
            content.className = 'ac-model-popup-content';

            var title = document.createElement('div');
            title.className = 'ac-model-popup-title';
            title.innerHTML = '<i class="fas fa-brain" style="color:var(--ac-primary);"></i> انتخاب مدل هوش مصنوعی';
            content.appendChild(title);

            models.forEach(function(m) {
                var opt = document.createElement('div');
                opt.className = 'ac-model-option' + (m.id === self.aiModel ? ' active' : '');
                opt.innerHTML =
                    '<div class="ac-model-option-info">' +
                        '<div class="ac-model-option-name">' + m.name + '</div>' +
                        '<div class="ac-model-option-desc">' + m.desc + '</div>' +
                    '</div>' +
                    '<i class="fas fa-check-circle ac-model-option-check"></i>';

                opt.addEventListener('click', function() {
                    self.aiModel = m.id;
                    try { localStorage.setItem('aiModel', m.id); } catch(e) {}
                    // به‌روزرسانی نام مدل روی دکمه
                    var nameEl = document.getElementById('ai-model-name');
                    if (nameEl) nameEl.textContent = m.name;
                    // بستن popup
                    popup.classList.remove('open');
                    setTimeout(function() { popup.remove(); }, 300);
                    self.showToast('مدل به ' + m.name + ' تغییر کرد', 'success');
                });

                content.appendChild(opt);
            });

            popup.appendChild(content);

            // بستن با کلیک روی backdrop
            popup.addEventListener('click', function(e) {
                if (e.target === popup) {
                    popup.classList.remove('open');
                    setTimeout(function() { popup.remove(); }, 300);
                }
            });

            document.body.appendChild(popup);
            // trigger animation
            setTimeout(function() { popup.classList.add('open'); }, 10);
        };

        /* ============================================================
           راه‌اندازی رویدادها
           ============================================================ */
        GermanDictionary.prototype._acSetupEvents = function () {
            var self = this;
            var input = document.getElementById('ai-chat-input');
            var sendBtn = document.getElementById('send-ai-message');
            var modelSelect = document.getElementById('ai-model-select');
            var modelBtn = document.getElementById('ai-model-btn');

            if (sendBtn) {
                sendBtn.addEventListener('click', function () { self.sendAIMessage(); });
            }

            if (input) {
                input.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        self.sendAIMessage();
                    }
                });
                input.addEventListener('input', function () {
                    this.style.height = 'auto';
                    this.style.height = Math.min(this.scrollHeight, 128) + 'px';
                });
                input.addEventListener('paste', function (e) {
                    var items = e.clipboardData && e.clipboardData.items;
                    if (!items) return;
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].type && items[i].type.indexOf('image/') === 0) {
                            e.preventDefault();
                            var file = items[i].getAsFile();
                            var reader = new FileReader();
                            reader.onload = function (ev) {
                                self.uploadedImage = file;
                                self.uploadedImageUrl = ev.target.result;
                                self._acShowImagePreview(ev.target.result, file.name);
                            };
                            reader.readAsDataURL(file);
                            return;
                        }
                    }
                });
            }

            if (modelSelect) {
                modelSelect.addEventListener('change', function (e) {
                    self.aiModel = e.target.value;
                    try { localStorage.setItem('aiModel', self.aiModel); } catch (err) {}
                    // به‌روزرسانی نام مدل در هدر
                    var nameEl = document.getElementById('ai-model-name');
                    if (nameEl && self._acModels) {
                        var found = self._acModels.find(function(m) { return m.id === self.aiModel; });
                        if (found) nameEl.textContent = found.name;
                    }
                });
            }

            // دکمه انتخاب مدل (custom button + popup)
            // به‌روزرسانی نام مدل در دکمه هدر
            var modelNameEl = document.getElementById('ai-model-name');
            if (modelNameEl && this._acModels) {
                var found = this._acModels.find(function(m) { return m.id === this.aiModel; }.bind(this));
                if (found) modelNameEl.textContent = found.name;
            }
            if (modelBtn) {
                modelBtn.addEventListener('click', function() {
                    self._acShowModelPopup(self._acModels || []);
                });
            }

            document.querySelectorAll('.ac-quick-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var q = btn.dataset.question;
                    if (q && input) {
                        input.value = q;
                        self.sendAIMessage();
                    }
                });
            });

            var newChatBtn = document.getElementById('new-chat-btn');
            if (newChatBtn) {
                newChatBtn.addEventListener('click', function () {
                    if (typeof self.newChat === 'function') self.newChat();
                    else {
                        var ch = document.getElementById('chat-history');
                        if (ch) ch.innerHTML = self._acWelcomeHTML();
                        self.chatMemory = [];
                        self._acSetupEvents();
                    }
                });
            }

            var clearBtn = document.getElementById('clear-chat-history');
            if (clearBtn) {
                clearBtn.addEventListener('click', function () {
                    if (confirm('آیا از پاک کردن کل چت مطمئن هستید؟')) {
                        var ch = document.getElementById('chat-history');
                        if (ch) ch.innerHTML = self._acWelcomeHTML();
                        self.chatMemory = [];
                        self.currentChatId = 'chat_' + Date.now();
                        self._acSetupEvents();
                        if (typeof self.showToast === 'function') self.showToast('چت پاک شد', 'info');
                    }
                });
            }

            var historyBtn = document.getElementById('chat-history-btn');
            if (historyBtn) {
                historyBtn.addEventListener('click', function () {
                    if (typeof self.showChatHistoryModal === 'function') self.showChatHistoryModal();
                    else if (typeof self.showToast === 'function') self.showToast('تاریخچه در دسترس نیست', 'info');
                });
            }

            var voiceBtn = document.getElementById('voice-input-toggle');
            if (voiceBtn) {
                voiceBtn.addEventListener('click', function () {
                    if (typeof self.toggleVoiceInput === 'function') self.toggleVoiceInput();
                    else if (typeof self.showToast === 'function') self.showToast('ورودی صوتی در دسترس نیست', 'info');
                });
            }

            // دکمه آپلود تصویر
            var imageBtn = document.getElementById('upload-image-btn');
            var imageInput = document.getElementById('image-upload-input');
            if (imageBtn && imageInput) {
                imageBtn.addEventListener('click', function () {
                    imageInput.click();
                });
                imageInput.addEventListener('change', function () {
                    if (this.files && this.files[0]) {
                        var file = this.files[0];
                        if (!file.type.startsWith('image/')) {
                            if (typeof self.showToast === 'function') self.showToast('فقط فایل تصویری', 'warning');
                            return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                            if (typeof self.showToast === 'function') self.showToast('حداکثر حجم تصویر ۵ مگابایت', 'warning');
                            return;
                        }
                        var reader = new FileReader();
                        reader.onload = function (ev) {
                            self.uploadedImage = file;
                            self.uploadedImageUrl = ev.target.result;
                            self._acShowImagePreview(ev.target.result, file.name);
                            if (typeof self.showToast === 'function') self.showToast('📷 تصویر بارگذاری شد', 'success');
                        };
                        reader.readAsDataURL(file);
                        this.value = ''; // reset
                    }
                });
            }
        };

        GermanDictionary.prototype._acShowImagePreview = function (url, name) {
            var existing = document.querySelector('.ac-img-preview');
            if (existing) existing.remove();
            var bar = document.querySelector('.ac-input-bar');
            if (!bar) return;
            var self = this;
            var preview = document.createElement('div');
            preview.className = 'ac-img-preview';
            preview.innerHTML =
                '<img src="' + url + '" alt="پیش‌نمایش تصویر">' +
                '<span class="ac-img-name">تصویر: ' + this._acText(name) + '</span>' +
                '<button class="ac-img-close" aria-label="حذف تصویر"><i class="fas fa-times"></i></button>';
            bar.parentNode.insertBefore(preview, bar);
            var closeBtn = preview.querySelector('.ac-img-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function () {
                    preview.remove();
                    self.uploadedImage = null;
                    self.uploadedImageUrl = null;
                });
            }
        };

        GermanDictionary.prototype.setupAIChatEventListeners = function () {
            this._acSetupEvents();
        };

        /* ============================================================
           ایندیکاتور تایپ
           ============================================================ */
        GermanDictionary.prototype.showTypingIndicator = function () {
            var ch = document.getElementById('chat-history');
            if (!ch) return;
            var welcome = ch.querySelector('.ac-welcome');
            if (welcome) welcome.remove();
            var typing = document.createElement('div');
            typing.className = 'ac-msg ai';
            typing.id = 'typing-indicator';
            // ✔️ NEW: نشانگر تفکر پویا — متن‌های مختلف چرخشی
            typing.innerHTML =
                '<div class="ac-msg-avatar"><i class="fas fa-wand-magic-sparkles"></i></div>' +
                '<div class="ac-msg-body"><div class="ac-msg-bubble"><div class="ac-thinking">' +
                    '<span class="ac-thinking-ic"><i class="fas fa-brain"></i></span>' +
                    '<span id="ac-thinking-text">در حال تفکر...</span>' +
                    '<span class="ac-thinking-dots"><span></span><span></span><span></span></span>' +
                '</div></div></div>';
            ch.appendChild(typing);
            this._acScrollToBottom();
            // ✔️ NEW: چرخش متن‌های تفکر برای تجربه‌ی کاربری بهتر
            this._acThinkingTexts = [
                'در حال تفکر...',
                'Analyzing your question...',
                'در حال بررسی دیکشنری...',
                'Searching vocabulary...',
                'در حال ساخت پاسخ...',
                'Composing response...',
                'Checking grammar rules...',
                'مرور لغات شما...'
            ];
            this._acThinkingIdx = 0;
            var self = this;
            this._acThinkingInterval = setInterval(function () {
                var el = document.getElementById('ac-thinking-text');
                if (!el) { clearInterval(self._acThinkingInterval); return; }
                self._acThinkingIdx = (self._acThinkingIdx + 1) % self._acThinkingTexts.length;
                el.textContent = self._acThinkingTexts[self._acThinkingIdx];
            }, 1800);
        };

        GermanDictionary.prototype.removeTypingIndicator = function () {
            if (this._acThinkingInterval) { clearInterval(this._acThinkingInterval); this._acThinkingInterval = null; }
            var t = document.getElementById('typing-indicator');
            if (t) t.remove();
        };

        /* ============================================================
           ایجاد حباب پیام AI خالی برای استریم (برای تایپ کاراکتر به کاراکتر)
           ============================================================ */
        GermanDictionary.prototype._acCreateStreamingAIMessage = function () {
            var ch = document.getElementById('chat-history');
            if (!ch) return null;
            // حذف ایندیکاتور تایپ اگر وجود دارد
            this.removeTypingIndicator();
            var welcome = ch.querySelector('.ac-welcome');
            if (welcome) welcome.remove();
            var time = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
            var msg = document.createElement('div');
            msg.className = 'ac-msg ai';
            msg.id = 'ac-streaming-msg';
            msg.innerHTML =
                '<div class="ac-msg-avatar"><i class="fas fa-wand-magic-sparkles"></i></div>' +
                '<div class="ac-msg-body">' +
                    '<div class="ac-msg-bubble" id="ac-streaming-bubble"></div>' +
                    '<div class="ac-msg-time">' + time + '</div>' +
                '</div>';
            ch.appendChild(msg);
            this._acScrollToBottom();
            return msg;
        };

        /* ============================================================
           به‌روزرسانی متن حباب پیام در حال استریم
           ============================================================ */
        GermanDictionary.prototype._acUpdateStreamingBubble = function (fullText) {
            var bubble = document.getElementById('ac-streaming-bubble');
            if (!bubble) return;
            // قالب‌بندی مارک‌داون روی متن کامل انباشته‌شده
            bubble.innerHTML = this._formatAIMessage(fullText);
            this._acScrollToBottom();
        };

        /* ============================================================
           نهایی‌سازی پیام استریم‌شده (افزودن دکمه‌های کپی/بازتولید)
           ============================================================ */
        GermanDictionary.prototype._acFinalizeStreamingMessage = async function (fullText) {
            var msg = document.getElementById('ac-streaming-msg');
            if (!msg) {
                // اگر حباب استریم وجود نداشت، پیام را به‌صورت عادی اضافه کن
                this.addMessageToHistory('ai', fullText);
                return;
            }
            // حذف id تا با پیام‌های بعدی تداخل نکند
            msg.removeAttribute('id');
            var bubble = msg.querySelector('.ac-msg-bubble');
            if (bubble) {
                bubble.removeAttribute('id');
                // ✔️ FIX: ابتدا دستورات را پردازش کن (روی متن خام، قبل از escape)
                var processedText = fullText;
                if (typeof this._acProcessCommands === 'function') {
                    try {
                        processedText = await this._acProcessCommands(fullText);
                    } catch (e) { console.warn('[ai-chat] command processing failed:', e); }
                }
                // سپس Markdown formatting را اعمال کن
                bubble.innerHTML = processedText;
            }
            // افزودن دکمه‌های کپی/بازتولید
            var body = msg.querySelector('.ac-msg-body');
            if (body && !body.querySelector('.ac-msg-actions')) {
                var actions = document.createElement('div');
                actions.className = 'ac-msg-actions';
                actions.innerHTML =
                    '<button class="ac-msg-action-btn ac-copy-btn" title="کپی"><i class="fas fa-copy"></i> کپی</button>' +
                    '<button class="ac-msg-action-btn ac-regen-btn" title="باز تولید"><i class="fas fa-rotate-right"></i> باز تولید</button>';
                body.appendChild(actions);
                // رویداد کپی
                var copyBtn = actions.querySelector('.ac-copy-btn');
                if (copyBtn) {
                    copyBtn.addEventListener('click', function() {
                        navigator.clipboard.writeText(fullText).then(function() {
                            copyBtn.innerHTML = '<i class="fas fa-check"></i> کپی شد';
                            setTimeout(function() { copyBtn.innerHTML = '<i class="fas fa-copy"></i> کپی'; }, 2000);
                        }).catch(function() {
                            var ta = document.createElement('textarea');
                            ta.value = fullText;
                            document.body.appendChild(ta);
                            ta.select();
                            document.execCommand('copy');
                            ta.remove();
                            copyBtn.innerHTML = '<i class="fas fa-check"></i> کپی شد';
                            setTimeout(function() { copyBtn.innerHTML = '<i class="fas fa-copy"></i> کپی'; }, 2000);
                        });
                    });
                }
                // رویداد باز تولید
                var regenBtn = actions.querySelector('.ac-regen-btn');
                if (regenBtn) {
                    var self = this;
                    regenBtn.addEventListener('click', function() {
                        var prevMsg = msg.previousElementSibling;
                        var userText = '';
                        while (prevMsg) {
                            if (prevMsg.classList.contains('user')) {
                                var b = prevMsg.querySelector('.ac-msg-bubble');
                                userText = b ? b.textContent : '';
                                break;
                            }
                            prevMsg = prevMsg.previousElementSibling;
                        }
                        if (userText) {
                            msg.remove();
                            var input = document.getElementById('ai-chat-input');
                            if (input) {
                                input.value = userText;
                                self.sendAIMessage();
                            }
                        }
                    });
                }
            }
            this._acScrollToBottom();
        };

        /* ============================================================
           اضافه کردن پیام به تاریخچه
           ============================================================ */
        GermanDictionary.prototype.addMessageToHistory = function (sender, message, scroll) {
            if (scroll === undefined) scroll = true;
            var ch = document.getElementById('chat-history');
            if (!ch) return;
            var welcome = ch.querySelector('.ac-welcome');
            if (welcome) welcome.remove();

            var isUser = sender === 'user';
            var avatar = isUser ? 'fa-user' : 'fa-wand-magic-sparkles';
            var formatted = isUser
                ? this._acEscape(message).replace(/\n/g, '<br>')
                : this._formatAIMessage(message);
            var time = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

            var msg = document.createElement('div');
            msg.className = 'ac-msg ' + (isUser ? 'user' : 'ai');
            msg.innerHTML =
                '<div class="ac-msg-avatar"><i class="fas ' + avatar + '"></i></div>' +
                '<div class="ac-msg-body">' +
                    '<div class="ac-msg-bubble">' + formatted + '</div>' +
                    '<div class="ac-msg-time">' + time + '</div>' +
                    '<div class="ac-msg-actions">' +
                        '<button class="ac-msg-action-btn ac-copy-btn" title="کپی"><i class="fas fa-copy"></i> کپی</button>' +
                        (isUser ? '' : '<button class="ac-msg-action-btn ac-regen-btn" title="باز تولید"><i class="fas fa-rotate-right"></i> باز تولید</button>') +
                    '</div>' +
                '</div>';
            ch.appendChild(msg);

            // رویداد دکمه کپی
            var copyBtn = msg.querySelector('.ac-copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', function() {
                    navigator.clipboard.writeText(message).then(function() {
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> کپی شد';
                        setTimeout(function() { copyBtn.innerHTML = '<i class="fas fa-copy"></i> کپی'; }, 2000);
                    }).catch(function() {
                        var ta = document.createElement('textarea');
                        ta.value = message;
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        ta.remove();
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> کپی شد';
                        setTimeout(function() { copyBtn.innerHTML = '<i class="fas fa-copy"></i> کپی'; }, 2000);
                    });
                });
            }

            // رویداد دکمه باز تولید
            var regenBtn = msg.querySelector('.ac-regen-btn');
            if (regenBtn) {
                var self = this;
                regenBtn.addEventListener('click', function() {
                    // پیدا کردن پیام کاربر قبل از این پیام AI
                    var prevMsg = msg.previousElementSibling;
                    var userText = '';
                    while (prevMsg) {
                        if (prevMsg.classList.contains('user')) {
                            userText = prevMsg.querySelector('.ac-msg-bubble')?.textContent || '';
                            break;
                        }
                        prevMsg = prevMsg.previousElementSibling;
                    }
                    if (userText) {
                        // حذف پیام AI فعلی
                        msg.remove();
                        // ارسال مجدد پیام کاربر
                        var input = document.getElementById('ai-chat-input');
                        if (input) {
                            input.value = userText;
                            self.sendAIMessage();
                        }
                    }
                });
            }

            if (scroll) this._acScrollToBottom();
        };

        GermanDictionary.prototype.addMessageWithImageToHistory = async function (sender, message, imageUrl) {
            var ch = document.getElementById('chat-history');
            if (!ch) return;
            var welcome = ch.querySelector('.ac-welcome');
            if (welcome) welcome.remove();
            var isUser = sender === 'user';
            var avatar = isUser ? 'fa-user' : 'fa-wand-magic-sparkles';
            var time = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

            var content = '';
            if (imageUrl) {
                content += '<div style="margin-bottom:8px;"><img src="' + imageUrl + '" alt="تصویر ارسالی" style="max-width:220px; max-height:220px; border-radius:12px; display:block; box-shadow:var(--ac-shadow-sm);"></div>';
            }
            if (message) content += this._acEscape(message).replace(/\n/g, '<br>');

            var msg = document.createElement('div');
            msg.className = 'ac-msg ' + (isUser ? 'user' : 'ai');
            msg.innerHTML =
                '<div class="ac-msg-avatar"><i class="fas ' + avatar + '"></i></div>' +
                '<div class="ac-msg-body">' +
                    '<div class="ac-msg-bubble">' + content + '</div>' +
                    '<div class="ac-msg-time">' + time + '</div>' +
                '</div>';
            ch.appendChild(msg);
            this._acScrollToBottom();
        };

        GermanDictionary.prototype._acScrollToBottom = function () {
            var ch = document.getElementById('chat-history');
            if (ch) {
                ch.scrollTop = ch.scrollHeight;
            }
        };

        GermanDictionary.prototype.scrollToBottom = function () {
            this._acScrollToBottom();
        };

        /* ============================================================
           تنظیمات موبایل (compatibility — خالی چون ریسپانسیو CSS است)
           ============================================================ */
        GermanDictionary.prototype.setupMobileView = function () {};
        GermanDictionary.prototype.forceHideFloatingButton = function () {};

        /* ============================================================
           شروع چت جدید
           ============================================================ */
        GermanDictionary.prototype.newChat = function () {
            this.chatMemory = [];
            this.currentChatId = 'chat_' + Date.now();
            this.uploadedImage = null;
            this.uploadedImageUrl = null;
            var preview = document.querySelector('.ac-img-preview');
            if (preview) preview.remove();
            var ch = document.getElementById('chat-history');
            if (ch) ch.innerHTML = this._acWelcomeHTML();
            this._acSetupEvents();
            if (typeof this.showToast === 'function') this.showToast('چت جدید شروع شد ✨', 'info');
        };

        /* ============================================================
           ارسال پیام
           ============================================================ */
        GermanDictionary.prototype.sendAIMessage = async function () {
            var input = document.getElementById('ai-chat-input');
            var sendBtn = document.getElementById('send-ai-message');
            if (!input || !sendBtn) return;

            var message = input.value.trim();
            if (!message && !this.uploadedImage) {
                if (typeof this.showToast === 'function') this.showToast('لطفاً پیام خود را وارد کنید', 'warning');
                return;
            }

            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

            var hasImage = !!this.uploadedImage;
            var imageUrl = this.uploadedImageUrl;
            var imgName = this.uploadedImage ? this.uploadedImage.name : '';

            input.value = '';
            input.style.height = 'auto';
            var preview = document.querySelector('.ac-img-preview');
            if (preview) preview.remove();

            var displayMsg = hasImage
                ? (message ? message + '\n\n📸 [تصویر: ' + imgName + ']' : '📸 [تصویر: ' + imgName + ']')
                : message;

            await this.addMessageWithImageToHistory('user', message, imageUrl);
            this.addToMemory('user', displayMsg);
            this.showTypingIndicator();

            try {
                var dictContext = '';
                if (typeof this._getDictionaryContext === 'function') {
                    dictContext = await this._getDictionaryContext();
                }

                var systemContent = 'تو دستیار دیکشنری آلمانی-فارسی هستی. فارسی روان و دوستانه پاسخ بده.\n\nقوانین پاسخ‌گویی:\n1. **مرتبط پاسخ بده** — فقط جواب همان چیزی را بده که پرسیده شده. چیز اضافه ننویس.\n2. **اندازه مناسب** — سلام را با سلام جواب بده (کوتاه). اما سوالات آموزشی را کامل و ساختاریافته جواب بده.\n3. **از Markdown استفاده کن** — سرتیتر (##)، **پررنگ**، *کج*، فهرست‌ها (- یا 1.)، جداول، > نقل‌قول برای خوانایی بهتر.\n4. **هرگز نشانگرهای دستوری [[...]] را به کاربر نشان نده** — این نشانگرها مخفی‌اند. هرگز در متن قابل دیدن کاربر قرارشان نده و هرگز به کاربر نگو چطور از آن‌ها استفاده کند.\n\nدستورات مخفی (هرگز به کاربر نشان نده):\n- وقتی کاربر لغتی را می‌خواهد ببیند: [[SHOW_WORD:لغت]] را در پاسخت بگذار\n- وقتی کاربر می‌خواهد لغت اضافه کند: [[SAVE_WORD:{"german":"...","persian":"...","type":"noun","gender":"...","plural":"...","example":"...","exampleTranslation":"..."}]]\n- وقتی کاربر آمار می‌خواهد: [[STATS]]\n- وقتی کاربر آزمون می‌خواهد: [[QUIZ]]\n- وقتی کاربر علاقه‌مندی می‌خواهد: [[FAVORITES]]\n- وقتی کاربر مرور می‌خواهد: [[REVIEW_NEEDED]]\n- وقتی کاربر تصویر می‌خواهد: [[GENERATE_IMAGE:ID]]\n\nمثال:\n- کاربر: "سلام" → تو: "سلام! 😊 چطور می‌تونم کمکت کنم؟"\n- کاربر: "Hund رو نشون بده" → تو: "بفرما! 📚\\n[[SHOW_WORD:Hund]]"\n- کاربر: "لغت Haus رو اضافه کن" → تو: "اضافه شد! ✅\\n[[SAVE_WORD:{"german":"Haus","persian":"خانه","type":"noun","gender":"خنثی","plural":"Häuser","example":"Ich wohne in einem Haus.","exampleTranslation":"من در یک خانه زندگی می‌کنم."}]]"\n- کاربر: "آمار" → تو: "📊 آمار شما:\\n[[STATS]]"\n- کاربر: "تفاوت der و die و das رو بگو" → تو: توضیح کامل و ساختاریافته با مثال و Markdown\n\n' + dictContext + '\n\nاگر کاربر پرسید سازنده‌ات کیست، فقط بگو: «من توسط **الیاس حسینی** ساخته شده‌ام.»';

                var systemMsg = {
                    role: 'system',
                    content: systemContent
                };

                var historyMsgs = this.getMemoryForAI();
                var msgsWithoutLast = historyMsgs.slice(0, -1);

                var fullMessages;
                if (hasImage && imageUrl) {
                    fullMessages = [systemMsg].concat(msgsWithoutLast, [{
                        role: 'user',
                        content: [
                            { type: 'image_url', image_url: { url: imageUrl } },
                            { type: 'text', text: message || 'این تصویر را تحلیل کن.' }
                        ]
                    }]);
                } else {
                    fullMessages = [systemMsg].concat(msgsWithoutLast, [{ role: 'user', content: message }]);
                }

                // خواندن مدل انتخاب‌شده از localStorage (تضمین پایداری انتخاب کاربر)
                var currentModel = this.aiModel;
                try { currentModel = localStorage.getItem('aiModel') || currentModel; } catch (e) {}
                if (currentModel) this.aiModel = currentModel;

                // ایندیکاتور «در حال فکر کردن» هم‌اکنون نمایش داده شده (قبل از try)
                var self = this;
                var streamingStarted = false;
                var fullResponse = '';

                // فراخوانی استریمی: تکه‌ها به‌محض دریافت به حباب اضافه می‌شوند (بدون تأخیر)
                var response = await this._puterChat(fullMessages, {
                    model: currentModel,
                    onChunk: function (chunk, accumulated) {
                        // اولین تکه: ایندیکاتور تایپ را با حباب پیام جایگزین کن
                        if (!streamingStarted) {
                            streamingStarted = true;
                            self._acCreateStreamingAIMessage();
                        }
                        fullResponse = accumulated || (fullResponse + chunk);
                        self._acUpdateStreamingBubble(fullResponse);
                    }
                });

                // اگر استریمی شروع نشد (مثلاً fallback غیراستریم)، از پاسخ کامل استفاده کن
                if (!streamingStarted) {
                    this.removeTypingIndicator();
                    if (response && response.message && response.message.content) {
                        var c = response.message.content;
                        if (Array.isArray(c)) {
                            fullResponse = c.map(function (x) { return x.text || ''; }).join('');
                        } else if (typeof c === 'string') {
                            fullResponse = c;
                        } else if (c[0] && c[0].text) {
                            fullResponse = c[0].text;
                        }
                    } else if (typeof response === 'string') {
                        fullResponse = response;
                    }
                    if (!fullResponse) fullResponse = '⚠️ پاسخی از سرور دریافت نشد. لطفاً دوباره تلاش کنید.';
                    this.addMessageToHistory('ai', fullResponse);
                } else {
                    // نهایی‌سازی پیام استریم‌شده: افزودن دکمه‌های کپی/بازتولید
                    if (!fullResponse) fullResponse = '';
                    this._acFinalizeStreamingMessage(fullResponse);
                }

                this.addToMemory('assistant', fullResponse);
                if (typeof this.saveCompleteChat === 'function') this.saveCompleteChat();
                this.uploadedImage = null;
                this.uploadedImageUrl = null;

            } catch (error) {
                console.error('خطا در ارسال پیام AI:', error);
                this.removeTypingIndicator();
                // حذف حباب استریم ناقص در صورت خطا
                var streamMsg = document.getElementById('ac-streaming-msg');
                if (streamMsg) streamMsg.remove();
                this.addMessageToHistory('ai', '⚠️ خطا در ارتباط با سرور. لطفاً اتصال اینترنت را بررسی کرده و دوباره تلاش کنید.\n\n' + (error && error.message ? error.message : ''));
            } finally {
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            }
        };

        /* ============================================================
           فرمت‌بندی پیام AI (Markdown → HTML)
           ============================================================ */
        GermanDictionary.prototype._formatAIMessage = function (text) {
            if (!text) return '';
            var t = this._acEscape(text);

            // جدول‌ها (ابتدا پردازش شوند)
            t = t.replace(/((?:^\|[^\n]*\|\s*\n?)+)/gm, function (block) {
                var lines = block.trim().split('\n');
                var rows = [];
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (!line) continue;
                    var cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); });
                    rows.push(cells);
                }
                if (rows.length < 2) return block;
                var startIdx = 1;
                if (rows[1] && rows[1].every(function (c) { return /^[\s\-:]+$/.test(c); })) startIdx = 2;
                var html = '<table><thead><tr>';
                rows[0].forEach(function (h) { html += '<th>' + h + '</th>'; });
                html += '</tr></thead><tbody>';
                for (var j = startIdx; j < rows.length; j++) {
                    html += '<tr>';
                    rows[j].forEach(function (c) { html += '<td>' + c + '</td>'; });
                    html += '</tr>';
                }
                html += '</tbody></table>';
                return html;
            });

            // سرتیترها
            t = t.replace(/^### (.+)$/gm, '<h3>$1</h3>');
            t = t.replace(/^## (.+)$/gm, '<h2>$1</h2>');
            t = t.replace(/^# (.+)$/gm, '<h1>$1</h1>');

            // نقل‌قول
            t = t.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

            // پررنگ و کج
            t = t.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
            t = t.replace(/(^|[^*])\*([^*]+?)\*(?!\*)/g, '$1<em>$2</em>');

            // کد اینلاین
            t = t.replace(/`([^`]+?)`/g, '<code>$1</code>');

            // فهرست‌های مرتب
            t = t.replace(/(?:^\d+\. .+\n?)+/gm, function (block) {
                var items = block.trim().split('\n').map(function (l) {
                    return '<li>' + l.replace(/^\d+\. /, '') + '</li>';
                }).join('');
                return '<ol>' + items + '</ol>';
            });
            // فهرست‌های نامرتب
            t = t.replace(/(?:^- .+\n?)+/gm, function (block) {
                var items = block.trim().split('\n').map(function (l) {
                    return '<li>' + l.replace(/^- /, '') + '</li>';
                }).join('');
                return '<ul>' + items + '</ul>';
            });

            // خطوط جدید
            t = t.replace(/\n/g, '<br>');
            // پاکسازی <br> اضافی دور عناصر بلاکی
            t = t.replace(/<\/(h1|h2|h3|ul|ol|blockquote|table|thead|tbody|tr)><br>/g, '</$1>');
            t = t.replace(/<br><(h1|h2|h3|ul|ol|blockquote|table)>/g, '<$1>');
            t = t.replace(/<br>(<\/?(?:ul|ol|li|table|thead|tbody|tr|td|th|blockquote|h[1-3])[ >])/g, '$1');

            return t;
        };

        /* ============================================================
           حافظه چت و ذخیره‌سازی
           ============================================================ */
        GermanDictionary.prototype.addToMemory = function (role, content) {
            if (!this.chatMemory) this.chatMemory = [];
            this.chatMemory.push({ role: role === 'user' ? 'user' : 'assistant', content: content });
            if (this.chatMemory.length > 30) this.chatMemory = this.chatMemory.slice(-30);
        };

        GermanDictionary.prototype.getMemoryForAI = function () {
            if (!this.chatMemory) return [];
            return this.chatMemory.slice(-10).map(function (m) {
                return { role: m.role, content: m.content };
            });
        };

        GermanDictionary.prototype.saveCompleteChat = async function () {
            try {
                if (!this.chatMemory || this.chatMemory.length === 0) return;
                var chatId = this.currentChatId || ('chat_' + Date.now());
                var title = (this.chatMemory[0] && this.chatMemory[0].content) ? this.chatMemory[0].content.substring(0, 30) : 'چت';
                var chatData = { id: chatId, title: title, messages: this.chatMemory, createdAt: new Date().toISOString() };
                var saved = JSON.parse(localStorage.getItem('savedChats') || '[]');
                var idx = saved.findIndex(function (c) { return c.id === chatId; });
                if (idx !== -1) saved[idx] = chatData;
                else saved.unshift(chatData);
                if (saved.length > 50) saved = saved.slice(0, 50);
                localStorage.setItem('savedChats', JSON.stringify(saved));
                this.currentChatId = chatId;
            } catch (e) {
                console.error('خطا در ذخیره چت:', e);
            }
        };

                GermanDictionary.prototype._getDictionaryContext = async function () {
            try {
                if (typeof this.getAllWords !== 'function') return '';
                var words = await this.getAllWords();
                var total = words.length;
                var nouns = words.filter(function(w){return w.type==='noun';}).length;
                var verbs = words.filter(function(w){return w.type==='verb';}).length;
                var adjs  = words.filter(function(w){return w.type==='adjective';}).length;
                var srsKeys = Object.keys(this.srsData || {});
                var learned = srsKeys.filter(function(k){return (this.srsData[k]?.level||0)>=3;}, this).length;
                var favCount = this.favorites ? this.favorites.size : 0;
                // ✔️ NEW: دسترسی به همه‌ی لغات (نه فقط ۵ تای اخیر)
                var wordList = words.map(function(w) {
                    var srs = (this.srsData && this.srsData[w.id] && this.srsData[w.id].level) ? this.srsData[w.id].level : 0;
                    return w.german + ' (' + w.persian + ', ' + (w.type||'?') + ', SRS:' + srs + ')';
                }.bind(this)).join('، ');
                if (wordList.length > 6000) {
                    wordList = words.slice(0, 150).map(function(w) {
                        return w.german + ' (' + w.persian + ', ' + (w.type||'?') + ')';
                    }).join('، ') + ' ... و ' + (total - 150) + ' لغت دیگر';
                }
                var reviewNeeded = words.filter(function(w) {
                    var srs = (this.srsData && this.srsData[w.id] && this.srsData[w.id].level) ? this.srsData[w.id].level : 0;
                    return srs < 2;
                }.bind(this)).slice(0, 20).map(function(w){return w.german;}).join('، ');
                return 'اطلاعات کامل دیکشنری کاربر:\n' +
                    '- تعداد کل لغات: ' + total + '\n' +
                    '- اسم: ' + nouns + ' | فعل: ' + verbs + ' | صفت: ' + adjs + '\n' +
                    '- لغات تسلط‌یافته (SRS≥3): ' + learned + '\n' +
                    '- علاقه‌مندی‌ها: ' + favCount + '\n' +
                    '- لغات نیاز به مرور (SRS<2): ' + (reviewNeeded || 'هیچ') + '\n' +
                    '- لیست کامل لغات: ' + wordList;
            } catch (e) {
                return '';
            }
        };

        /* ============================================================
           تاریخچه چت‌ها — نمایش، بارگذاری، حذف
           ============================================================ */
        GermanDictionary.prototype.showChatHistoryModal = function() {
            var saved = [];
            try { saved = JSON.parse(localStorage.getItem('savedChats') || '[]'); } catch(e) {}

            // حذف modal قبلی
            var old = document.getElementById('ac-history-modal');
            if (old) old.remove();

            var modal = document.createElement('div');
            modal.id = 'ac-history-modal';
            modal.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);backdrop-filter:blur(6px);animation:ac-fade-in .2s ease;';

            var content = document.createElement('div');
            content.style.cssText = 'background:var(--ac-card,#fff);border-radius:20px;width:90%;max-width:500px;max-height:70vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.3);';

            var header = document.createElement('div');
            header.style.cssText = 'padding:18px 20px;border-bottom:1px solid var(--ac-border,#e2e8f0);display:flex;align-items:center;justify-content:space-between;';
            header.innerHTML = '<h3 style="margin:0;font-size:16px;font-weight:800;color:var(--ac-text,#1a1a2e);"><i class="fas fa-history" style="color:#6C5CE7;margin-left:8px;"></i> تاریخچه چت‌ها</h3>';
            var closeBtn = document.createElement('button');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.style.cssText = 'width:32px;height:32px;border:none;border-radius:8px;background:var(--ac-card-2,#f8fafc);color:var(--ac-muted,#64748b);cursor:pointer;font-size:14px;';
            closeBtn.onclick = function() { modal.remove(); };
            header.appendChild(closeBtn);
            content.appendChild(header);

            var body = document.createElement('div');
            body.style.cssText = 'flex:1;overflow-y:auto;padding:12px;';

            if (saved.length === 0) {
                body.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--ac-muted,#64748b);"><i class="fas fa-comments" style="font-size:36px;opacity:.3;margin-bottom:12px;"></i><p style="margin:0;font-size:14px;">هنوز چتی ذخیره نشده است</p></div>';
            } else {
                saved.forEach(function(chat) {
                    var item = document.createElement('div');
                    item.style.cssText = 'padding:12px 14px;border-radius:12px;background:var(--ac-card-2,#f8fafc);margin-bottom:8px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;transition:all .2s ease;border:1px solid var(--ac-border,#e2e8f0);';
                    item.onmouseenter = function() { item.style.borderColor = '#6C5CE7'; item.style.transform = 'translateX(-3px)'; };
                    item.onmouseleave = function() { item.style.borderColor = 'var(--ac-border,#e2e8f0)'; item.style.transform = ''; };

                    var info = document.createElement('div');
                    info.style.flex = '1';
                    info.innerHTML = '<div style="font-weight:700;font-size:13px;color:var(--ac-text,#1a1a2e);">' + (chat.title || 'چت') + '</div><div style="font-size:11px;color:var(--ac-muted,#64748b);margin-top:3px;">' + (chat.messages?.length || 0) + ' پیام • ' + new Date(chat.createdAt).toLocaleDateString('fa-IR') + '</div>';
                    item.appendChild(info);

                    var delBtn = document.createElement('button');
                    delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                    delBtn.style.cssText = 'width:30px;height:30px;border:none;border-radius:8px;background:transparent;color:#ef4444;cursor:pointer;font-size:12px;flex-shrink:0;';
                    delBtn.onclick = function(e) {
                        e.stopPropagation();
                        if (confirm('حذف این چت؟')) {
                            if (typeof this.deleteChatFromHistory === 'function') {
                                this.deleteChatFromHistory(chat.id);
                            } else {
                                var s = JSON.parse(localStorage.getItem('savedChats') || '[]');
                                s = s.filter(function(c) { return c.id !== chat.id; });
                                localStorage.setItem('savedChats', JSON.stringify(s));
                            }
                            item.remove();
                        }
                    }.bind(this);
                    item.appendChild(delBtn);

                    item.onclick = function() {
                        modal.remove();
                        if (typeof this.loadChatFromHistory === 'function') {
                            this.loadChatFromHistory(chat);
                        } else {
                            // fallback
                            this.chatMemory = chat.messages || [];
                            this.currentChatId = chat.id;
                            var ch = document.getElementById('chat-history');
                            if (ch) {
                                ch.innerHTML = '';
                                (chat.messages || []).forEach(function(msg) {
                                    this.addMessageToHistory(msg.role === 'user' ? 'user' : 'ai', msg.content, false);
                                }.bind(this));
                                this._acScrollToBottom();
                            }
                        }
                    }.bind(this);

                    body.appendChild(item);
                }.bind(this));
            }
            content.appendChild(body);
            modal.appendChild(content);

            modal.addEventListener('click', function(e) {
                if (e.target === modal) modal.remove();
            });
            document.body.appendChild(modal);
        };

        GermanDictionary.prototype.loadChatFromHistory = function(chat) {
            this.chatMemory = chat.messages || [];
            this.currentChatId = chat.id;
            var ch = document.getElementById('chat-history');
            if (!ch) return;
            ch.innerHTML = '';
            if (!chat.messages || chat.messages.length === 0) {
                ch.innerHTML = this._acWelcomeHTML();
                return;
            }
            chat.messages.forEach(function(msg) {
                this.addMessageToHistory(msg.role === 'user' ? 'user' : 'ai', msg.content, false);
            }.bind(this));
            this._acScrollToBottom();
            this.showToast('چت بارگذاری شد', 'success');
        };

        GermanDictionary.prototype.deleteChatFromHistory = function(chatId) {
            try {
                var saved = JSON.parse(localStorage.getItem('savedChats') || '[]');
                saved = saved.filter(function(c) { return c.id !== chatId; });
                localStorage.setItem('savedChats', JSON.stringify(saved));
            } catch(e) {}
        };

        /* ============================================================
           کمک‌توابع داخلی
           ============================================================ */
        GermanDictionary.prototype._acEscape = function (text) {
            if (text == null) return '';
            var s = String(text);
            if (typeof this.escapeHtml === 'function') return this.escapeHtml(s);
            return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        };
        GermanDictionary.prototype._acAttr = function (text) {
            return this._acEscape(text).replace(/"/g, '&quot;');
        };
        GermanDictionary.prototype._acText = function (text) {
            return this._acEscape(text);
        };

        console.log('✅ بخش هوش مصنوعی پریمیوم فعال شد.');

        /* ============================================================
           راه‌اندازی خودکار
           ============================================================ */
        function tryAutoSetup() {
            if (typeof dictionaryApp !== 'undefined' && dictionaryApp) {
                try { dictionaryApp.renderAIChat(); }
                catch (e) { console.error('AI Chat auto-setup error:', e); }
            } else {
                setTimeout(tryAutoSetup, 100);
            }
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { setTimeout(tryAutoSetup, 300); });
        } else {
            setTimeout(tryAutoSetup, 300);
        }

    } // end initAIChatModule
})();
