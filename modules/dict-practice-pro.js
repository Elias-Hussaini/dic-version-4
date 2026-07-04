/* dict-practice-pro.js — بخش تمرین پریمیوم v4
 * تغییرات v4:
 *   - فیلتر پوشه و محدوده کاملاً مستقل
 *   - لغات اشتباه به‌صورت section کامل با دسته‌بندی بر اساس نوع تمرین
 *   - دکمه "شروع دوباره" برای هر دسته
 *   - override کردن همه startXxxPractice برای ست کردن _currentPracticeType
 *   - تشخیص دقیق نوع تمرین در recordPractice (نه از session)
 *   - حذف خودکار لغات درست از لیست اشتباه
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'practiceWrongWords';
  var MAX_WRONG = 20;

  var PRACTICE_CARDS = [
    { section:'main', id:'flashcard', icon:'fa-layer-group', title:'فلش‌کارت', desc:'مرور لغات با کارت‌های هوشمند', color:'blue', btnId:'start-flashcard-btn', method:'startPracticeSession' },
    { section:'main', id:'listening', icon:'fa-headphones', title:'شنیداری', desc:'گوش دادن و تشخیص لغت', color:'cyan', btnId:'start-listening-btn', method:'startListeningPractice' },
    { section:'main', id:'writing', icon:'fa-keyboard', title:'نوشتاری', desc:'تایپ کردن املای آلمانی', color:'violet', btnId:'start-writing-btn', method:'startWritingPractice' },
    { section:'main', id:'quiz', icon:'fa-circle-question', title:'آزمون', desc:'آزمون چهارگزینه‌ای', color:'emerald', btnId:'start-quiz-btn', method:'startQuiz' },
    { section:'main', id:'speaking', icon:'fa-microchip', title:'مکالمه AI', desc:'ساخت جمله با هوش مصنوعی', color:'amber', btnId:'start-speaking-btn', method:'startSpeakingPractice' },
    { section:'advanced', id:'wrong-words', icon:'fa-rotate-right', title:'لغات اشتباه', desc:'تمرین مجدد لغاتی که اشتباه زدید', color:'rose', btnId:'start-wrong-btn', method:'_prOpenWrongWordsSection' },
    { section:'advanced', id:'fill-blanks', icon:'fa-puzzle-piece', title:'جای خالی', desc:'جمله را کامل کنید', color:'orange', btnId:'start-fill-blanks-btn', method:'startFillBlanksPractice' },
    { section:'advanced', id:'word-order', icon:'fa-sort-amount-down', title:'مرتب‌سازی کلمات', desc:'کلمات را درست بچینید', color:'teal', btnId:'start-word-order-btn', method:'startWordOrderPractice' },
    { section:'advanced', id:'matching', icon:'fa-hand-peace', title:'تطابق لغات', desc:'آلمانی را به فارسی وصل کنید', color:'red', btnId:'start-matching-btn', method:'startMatchingPractice' },
    { section:'advanced', id:'prepositions', icon:'fa-location-dot', title:'حروف اضافه', desc:'تمرین حروف اضافه', color:'purple', btnId:'start-prepositions-btn', method:'startPrepositionsPractice' },
    { section:'advanced', id:'conjugation', icon:'fa-table-list', title:'صرف افعال', desc:'صرف در زمان‌های مختلف', color:'indigo', btnId:'start-conjugation-btn', method:'startConjugationPractice' },
    { section:'advanced', id:'sentence-completion', icon:'fa-file-lines', title:'تکمیل جمله', desc:'جملات را کامل کنید', color:'slate', btnId:'start-sentence-completion-btn', method:'startSentenceCompletionPractice' },
    { section:'advanced', id:'study-mode', icon:'fa-eye', title:'حالت مطالعه', desc:'مرور خودکار با تایمر', color:'pink', btnId:'start-study-mode-btn', method:'startStudyMode' },
    { section:'advanced', id:'gender', icon:'fa-venus-mars', title:'تشخیص جنسیت', desc:'der، die یا das؟', color:'blue', btnId:'start-gender-btn', method:'startGenderPractice' }
  ];

  // نگاشت متد شروع تمرین به نوع تمرین
  var METHOD_TO_TYPE = {
    'startPracticeSession':'flashcard',
    'startListeningPractice':'listening',
    'startWritingPractice':'writing',
    'startQuiz':'quiz',
    'startSpeakingPractice':'speaking',
    'startFillBlanksPractice':'fill-blanks',
    'startWordOrderPractice':'word-order',
    'startMatchingPractice':'matching',
    'startPrepositionsPractice':'prepositions',
    'startConjugationPractice':'conjugation',
    'startSentenceCompletionPractice':'sentence-completion',
    'startStudyMode':'study-mode',
    'startGenderPractice':'gender'
  };

  // نگاشت نوع تمرین به متد شروع (برای دکمه شروع دوباره)
  var TYPE_TO_METHOD = {};
  Object.keys(METHOD_TO_TYPE).forEach(function(m){ TYPE_TO_METHOD[METHOD_TO_TYPE[m]] = m; });

  var PRACTICE_TYPE_LABELS = {
    'flashcard':'فلش‌کارت', 'listening':'شنیداری', 'writing':'نوشتاری', 'quiz':'آزمون',
    'speaking':'مکالمه AI', 'fill-blanks':'جای خالی', 'word-order':'مرتب‌سازی',
    'matching':'تطابق', 'prepositions':'حروف اضافه', 'conjugation':'صرف افعال',
    'sentence-completion':'تکمیل جمله', 'study-mode':'حالت مطالعه', 'gender':'جنسیت',
    'general':'عمومی'
  };

  var PRACTICE_TYPE_ICONS = {
    'flashcard':'fa-layer-group', 'listening':'fa-headphones', 'writing':'fa-keyboard',
    'quiz':'fa-circle-question', 'speaking':'fa-microchip', 'fill-blanks':'fa-puzzle-piece',
    'word-order':'fa-sort-amount-down', 'matching':'fa-hand-peace',
    'prepositions':'fa-location-dot', 'conjugation':'fa-table-list',
    'sentence-completion':'fa-file-lines', 'gender':'fa-venus-mars', 'study-mode':'fa-eye',
    'general':'fa-tag'
  };

  var PRACTICE_TYPE_COLORS = {
    'flashcard':'blue', 'listening':'cyan', 'writing':'violet', 'quiz':'emerald',
    'speaking':'amber', 'fill-blanks':'orange', 'word-order':'teal', 'matching':'red',
    'prepositions':'purple', 'conjugation':'indigo', 'sentence-completion':'slate',
    'gender':'blue', 'study-mode':'pink', 'general':'rose'
  };

  function injectStyles() {
    if (document.getElementById('pr-pro-styles')) return;
    var s = document.createElement('style');
    s.id = 'pr-pro-styles';
    s.textContent = `
      .pr-root{font-family:'Vazirmatn',Tahoma,sans-serif;direction:rtl;--pr-bg:#f7f8fa;--pr-card:#fff;--pr-text:#1a1a2e;--pr-muted:#64748b;--pr-border:#e2e8f0;--pr-primary:#6C5CE7;color:var(--pr-text);}
      body.dark-mode .pr-root{--pr-bg:#0f1115;--pr-card:#1a1d24;--pr-text:#e4e6eb;--pr-muted:#9ca3af;--pr-border:#2a2e38;}

      .pr-header{background:linear-gradient(135deg,#0f172a 0%,#134e4a 100%);border-radius:20px;padding:28px 24px;color:#fff;position:relative;overflow:hidden;margin-bottom:18px;}
      .pr-header::before{content:"";position:absolute;top:-40px;left:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(108,92,231,.35) 0%,transparent 70%);pointer-events:none;}
      .pr-header::after{content:"";position:absolute;bottom:-60px;right:-30px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(20,184,166,.3) 0%,transparent 70%);pointer-events:none;}
      .pr-header-ic{width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,.15);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;position:relative;z-index:1;box-shadow:0 8px 24px rgba(0,0,0,.2);}
      .pr-header h2{font-size:24px;font-weight:800;margin:0 0 4px;position:relative;z-index:1;}
      .pr-header p{font-size:13px;opacity:.85;margin:0;position:relative;z-index:1;}

      .pr-settings{background:var(--pr-card);border:1px solid var(--pr-border);border-radius:16px;padding:20px;margin-bottom:18px;box-shadow:0 4px 16px rgba(0,0,0,.04);}
      body.dark-mode .pr-settings{box-shadow:0 4px 16px rgba(0,0,0,.2);}
      .pr-settings-title{font-size:15px;font-weight:700;margin:0 0 14px;display:flex;align-items:center;gap:8px;color:var(--pr-text);}
      .pr-settings-title i{color:var(--pr-primary);}
      .pr-set-group{margin-bottom:14px;}
      .pr-set-group:last-child{margin-bottom:0;}
      .pr-set-label{font-size:12px;font-weight:600;color:var(--pr-muted);margin-bottom:8px;display:flex;align-items:center;gap:5px;}

      .range-buttons{display:flex;flex-wrap:wrap;gap:8px;}
      .pr-pill{font-family:inherit;font-size:12px;font-weight:600;padding:7px 14px;border-radius:999px;border:1.5px solid var(--pr-border);background:transparent;color:var(--pr-text);cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:5px;line-height:1;}
      .pr-pill:hover{border-color:var(--pr-primary);color:var(--pr-primary);transform:translateY(-1px);}
      .pr-pill.active{background:var(--pr-primary);color:#fff;border-color:var(--pr-primary);box-shadow:0 4px 10px rgba(108,92,231,.3);}

      .pr-custom-range{display:none;margin-top:10px;gap:8px;align-items:center;flex-wrap:wrap;background:var(--pr-bg);padding:10px;border-radius:10px;border:1px dashed var(--pr-border);}
      .pr-custom-range.show{display:flex;}
      .pr-custom-range input{font-family:inherit;width:90px;padding:7px 10px;border:1.5px solid var(--pr-border);border-radius:8px;background:var(--pr-card);color:var(--pr-text);font-size:13px;}
      .pr-custom-range input:focus{outline:none;border-color:var(--pr-primary);box-shadow:0 0 0 3px rgba(108,92,231,.15);}
      .pr-custom-range span{color:var(--pr-muted);font-size:12px;}

      /* Dropdown پوشه (مستقل از محدوده) */
      .pr-tag-dropdown{position:relative;display:inline-block;}
      .pr-tag-menu{display:none;position:absolute;top:100%;right:0;min-width:220px;background:var(--pr-card);border:1px solid var(--pr-border);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.15);z-index:1000;margin-top:6px;overflow:hidden;max-height:300px;overflow-y:auto;}
      .pr-tag-menu.open{display:block;}
      .pr-tag-opt{display:flex;align-items:center;gap:8px;width:100%;padding:10px 14px;border:none;background:transparent;cursor:pointer;text-align:right;font-family:inherit;font-size:12px;font-weight:600;color:var(--pr-text);transition:all .15s;border-right:3px solid transparent;}
      .pr-tag-opt:hover{background:var(--pr-bg);}
      .pr-tag-opt.active{background:var(--pr-primary);color:#fff;border-right-color:var(--pr-primary);}
      .pr-tag-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}

      .pr-sec-title{display:flex;align-items:center;gap:8px;margin:20px 0 4px;}
      .pr-sec-title h3{font-size:17px;font-weight:800;margin:0;color:var(--pr-text);}
      .pr-sec-ic{width:30px;height:30px;border-radius:9px;background:var(--pr-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;}
      .pr-sec-sub{font-size:12px;color:var(--pr-muted);margin:0 0 12px;}

      .pr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}
      .pr-card{background:var(--pr-card);border:1.5px solid var(--pr-border);border-radius:14px;padding:16px;display:flex;flex-direction:column;position:relative;transition:all .2s;}
      .pr-card:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(0,0,0,.08);border-color:var(--pr-primary);}
      .pr-card:active{transform:scale(.98);}
      body.dark-mode .pr-card:hover{box-shadow:0 10px 24px rgba(0,0,0,.3);}
      .pr-card-ic{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,.1);}
      .pr-card-title{font-size:15px;font-weight:700;margin:0 0 4px;color:var(--pr-text);}
      .pr-card-desc{font-size:12px;color:var(--pr-muted);margin:0 0 12px;flex:1;line-height:1.5;}
      .pr-card-btn{font-family:inherit;font-size:12px;font-weight:700;padding:8px 14px;border-radius:9px;border:none;cursor:pointer;color:#fff;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;gap:5px;width:100%;}
      .pr-card-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
      .pr-card-btn:active{transform:scale(.96);}
      .pr-card-wrong-badge{position:absolute;top:10px;left:10px;background:#f43f5e;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;display:none;box-shadow:0 2px 8px rgba(244,63,94,.4);}
      .pr-card-wrong-badge.show{display:block;}

      .ic-blue{background:linear-gradient(135deg,#3b82f6,#2563eb);}
      .ic-cyan{background:linear-gradient(135deg,#06b6d4,#0891b2);}
      .ic-violet{background:linear-gradient(135deg,#8b5cf6,#6d28d9);}
      .ic-emerald{background:linear-gradient(135deg,#10b981,#059669);}
      .ic-amber{background:linear-gradient(135deg,#f59e0b,#d97706);}
      .ic-rose{background:linear-gradient(135deg,#f43f5e,#e11d48);}
      .ic-orange{background:linear-gradient(135deg,#f97316,#ea580c);}
      .ic-teal{background:linear-gradient(135deg,#14b8a6,#0d9488);}
      .ic-red{background:linear-gradient(135deg,#ef4444,#dc2626);}
      .ic-purple{background:linear-gradient(135deg,#a855f7,#9333ea);}
      .ic-indigo{background:linear-gradient(135deg,#6366f1,#4f46e5);}
      .ic-slate{background:linear-gradient(135deg,#64748b,#475569);}
      .ic-pink{background:linear-gradient(135deg,#ec4899,#db2777);}
      .btn-blue{background:linear-gradient(135deg,#3b82f6,#2563eb);}
      .btn-cyan{background:linear-gradient(135deg,#06b6d4,#0891b2);}
      .btn-violet{background:linear-gradient(135deg,#8b5cf6,#6d28d9);}
      .btn-emerald{background:linear-gradient(135deg,#10b981,#059669);}
      .btn-amber{background:linear-gradient(135deg,#f59e0b,#d97706);}
      .btn-rose{background:linear-gradient(135deg,#f43f5e,#e11d48);}
      .btn-orange{background:linear-gradient(135deg,#f97316,#ea580c);}
      .btn-teal{background:linear-gradient(135deg,#14b8a6,#0d9488);}
      .btn-red{background:linear-gradient(135deg,#ef4444,#dc2626);}
      .btn-purple{background:linear-gradient(135deg,#a855f7,#9333ea);}
      .btn-indigo{background:linear-gradient(135deg,#6366f1,#4f46e5);}
      .btn-slate{background:linear-gradient(135deg,#64748b,#475569);}
      .btn-pink{background:linear-gradient(135deg,#ec4899,#db2777);}

      /* ===== Section لغات اشتباه (یک view کامل) ===== */
      .pr-wrong-view{font-family:'Vazirmatn',Tahoma,sans-serif;direction:rtl;padding:18px 0;color:var(--pr-text);}
      .pr-wrong-hero{background:linear-gradient(135deg,#9f1239 0%,#c2410c 100%);border-radius:20px;padding:24px;color:#fff;position:relative;overflow:hidden;margin-bottom:18px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
      .pr-wrong-hero::before{content:"";position:absolute;top:-30px;left:-30px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.15) 0%,transparent 70%);pointer-events:none;}
      .pr-wrong-hero-ic{width:54px;height:54px;border-radius:14px;background:rgba(255,255,255,.18);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;}
      .pr-wrong-hero-info{flex:1;min-width:200px;position:relative;z-index:1;}
      .pr-wrong-hero h2{font-size:22px;font-weight:800;margin:0 0 4px;}
      .pr-wrong-hero p{font-size:12px;opacity:.9;margin:0;}
      .pr-wrong-hero-stats{display:flex;gap:10px;flex-shrink:0;position:relative;z-index:1;}
      .pr-wrong-stat{background:rgba(255,255,255,.15);border-radius:12px;padding:8px 14px;text-align:center;min-width:70px;}
      .pr-wrong-stat-num{font-size:20px;font-weight:800;line-height:1;}
      .pr-wrong-stat-lbl{font-size:10px;opacity:.85;margin-top:3px;}

      .pr-wrong-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
      .pr-wrong-back{font-family:inherit;font-size:12px;font-weight:700;padding:8px 14px;border-radius:10px;border:1.5px solid var(--pr-border);background:var(--pr-card);color:var(--pr-text);cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .18s;}
      .pr-wrong-back:hover{border-color:var(--pr-primary);color:var(--pr-primary);transform:translateX(2px);}
      .pr-wrong-actions{display:flex;gap:8px;flex-wrap:wrap;}
      .pr-wrong-action-btn{font-family:inherit;font-size:11px;font-weight:700;padding:7px 12px;border-radius:9px;border:1.5px solid var(--pr-border);background:var(--pr-card);color:var(--pr-muted);cursor:pointer;display:inline-flex;align-items:center;gap:5px;transition:all .18s;}
      .pr-wrong-action-btn:hover{color:#f43f5e;border-color:#f43f5e;}
      .pr-wrong-action-btn.danger:hover{background:#fef2f2;color:#e11d48;border-color:#f43f5e;}
      body.dark-mode .pr-wrong-action-btn.danger:hover{background:rgba(244,63,94,.1);}

      .pr-wrong-group{background:var(--pr-card);border:1.5px solid var(--pr-border);border-radius:16px;margin-bottom:14px;overflow:hidden;transition:all .2s;}
      .pr-wrong-group:hover{box-shadow:0 6px 18px rgba(0,0,0,.06);}
      .pr-wrong-group-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:var(--pr-bg);border-bottom:1px solid var(--pr-border);flex-wrap:wrap;}
      .pr-wrong-group-info{display:flex;align-items:center;gap:10px;flex:1;min-width:180px;}
      .pr-wrong-group-ic{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;flex-shrink:0;box-shadow:0 3px 8px rgba(0,0,0,.1);}
      .pr-wrong-group-title{font-size:14px;font-weight:800;color:var(--pr-text);}
      .pr-wrong-group-meta{font-size:11px;color:var(--pr-muted);margin-top:2px;}
      .pr-wrong-group-count{background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;}
      .pr-wrong-retry-btn{font-family:inherit;font-size:12px;font-weight:700;padding:8px 16px;border-radius:10px;border:none;background:linear-gradient(135deg,#6C5CE7,#5b4bd6);color:#fff;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .18s;box-shadow:0 3px 10px rgba(108,92,231,.3);}
      .pr-wrong-retry-btn:hover{transform:translateY(-1px);filter:brightness(1.08);box-shadow:0 5px 14px rgba(108,92,231,.4);}
      .pr-wrong-retry-btn:active{transform:scale(.97);}
      .pr-wrong-retry-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}

      .pr-wrong-words-list{padding:10px;display:flex;flex-direction:column;gap:6px;}
      .pr-wrong-word-row{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--pr-bg);border:1px solid var(--pr-border);border-radius:10px;transition:all .15s;}
      .pr-wrong-word-row:hover{border-color:var(--pr-primary);transform:translateX(-2px);}
      .pr-wrong-word-num{width:24px;height:24px;border-radius:50%;background:var(--pr-card);border:1px solid var(--pr-border);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--pr-muted);flex-shrink:0;}
      .pr-wrong-word-de{font-weight:700;font-size:14px;color:var(--pr-text);direction:ltr;flex-shrink:0;}
      .pr-wrong-word-fa{font-size:12px;color:var(--pr-muted);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .pr-wrong-word-badges{display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap;}
      .pr-wrong-badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:5px;}
      .pr-wrong-badge.gender{background:#fef3c7;color:#92400e;}
      .pr-wrong-badge.type{background:#ddd6fe;color:#5b21b6;}
      body.dark-mode .pr-wrong-badge.gender{background:rgba(245,158,11,.15);color:#fbbf24;}
      body.dark-mode .pr-wrong-badge.type{background:rgba(139,92,246,.15);color:#c4b5fd;}

      .pr-wrong-empty{text-align:center;padding:60px 20px;color:var(--pr-muted);}
      .pr-wrong-empty-ic{width:80px;height:80px;border-radius:50%;background:var(--pr-bg);display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 16px;color:#10b981;opacity:.6;}
      .pr-wrong-empty h3{font-size:17px;font-weight:800;color:var(--pr-text);margin:0 0 6px;}
      .pr-wrong-empty p{font-size:13px;margin:0;}

      .pr-wrong-hint{background:linear-gradient(135deg,rgba(108,92,231,.08),rgba(20,184,166,.08));border:1px dashed var(--pr-primary);border-radius:12px;padding:12px 14px;font-size:12px;color:var(--pr-text);margin-bottom:14px;display:flex;align-items:flex-start;gap:8px;line-height:1.6;}
      .pr-wrong-hint i{color:var(--pr-primary);font-size:14px;margin-top:2px;flex-shrink:0;}

      @media(max-width:768px){
        .pr-header{padding:20px 16px;}
        .pr-header h2{font-size:20px;}
        .pr-settings{padding:16px;}
        .pr-grid{grid-template-columns:repeat(2,1fr);gap:10px;}
        .pr-card{padding:14px;}
        .pr-card-ic{width:42px;height:42px;font-size:18px;}
        .pr-wrong-hero{padding:18px;}
        .pr-wrong-hero h2{font-size:18px;}
        .pr-wrong-hero-stats{width:100%;justify-content:space-between;}
        .pr-wrong-stat{flex:1;}
        .pr-wrong-group-head{padding:12px 14px;}
        .pr-wrong-group-title{font-size:13px;}
      }
      @media(max-width:480px){
        .pr-grid{grid-template-columns:1fr;}
        .range-buttons{flex-direction:column;align-items:stretch;}
        .pr-pill{justify-content:center;}
        .pr-header h2{font-size:18px;}
        .pr-wrong-toolbar{flex-direction:column;align-items:stretch;}
        .pr-wrong-back{justify-content:center;}
        .pr-wrong-actions{justify-content:space-between;}
        .pr-wrong-word-fa{display:none;}
        .pr-wrong-group-head{flex-direction:column;align-items:stretch;}
        .pr-wrong-retry-btn{width:100%;justify-content:center;}
      }
    `;
    document.head.appendChild(s);
  }

  function renderCard(card, wrongCount) {
    var badge = '';
    if (card.id === 'wrong-words' && wrongCount > 0) {
      badge = '<span class="pr-card-wrong-badge show">' + wrongCount + '</span>';
    }
    return '<div class="pr-card">' + badge +
      '<div class="pr-card-ic ic-' + card.color + '"><i class="fas ' + card.icon + '"></i></div>' +
      '<h3 class="pr-card-title">' + card.title + '</h3>' +
      '<p class="pr-card-desc">' + card.desc + '</p>' +
      '<button class="pr-card-btn btn-' + card.color + '" id="' + card.btnId + '" data-method="' + card.method + '">' +
        '<i class="fas fa-play"></i> شروع</button></div>';
  }

  function defineMethods() {
    /* ============================================================
       رندر منوی تمرین
       ============================================================ */
    GermanDictionary.prototype.renderPracticeOptions = function() {
      injectStyles();
      var container = document.getElementById('practice-section');
      if (!container) return;

      // پاک کردن session type موقت (پس از پایان تمرین)
      this._currentPracticeType = null;
      this._prWrongSessionIds = null;

      var wrongWords = this._prGetWrongWords();
      var wrongCount = wrongWords.length;

      var mainCards = PRACTICE_CARDS.filter(function(c){return c.section==='main';})
        .map(function(c){return renderCard(c, wrongCount);}).join('');
      var advCards = PRACTICE_CARDS.filter(function(c){return c.section==='advanced';})
        .map(function(c){return renderCard(c, wrongCount);}).join('');

      container.innerHTML = '<div class="pr-root">' +
        '<div class="pr-header"><div class="pr-header-ic"><i class="fas fa-brain"></i></div>' +
        '<h2>تمرین و یادگیری</h2><p>مهارت‌های زبانی خود را با تمرین‌های متنوع تقویت کنید</p></div>' +

        '<div class="pr-settings"><div class="pr-settings-title"><i class="fas fa-sliders-h"></i> تنظیمات تمرین</div>' +

        // ===== پوشه (مستقل از محدوده) =====
        '<div class="pr-set-group"><label class="pr-set-label"><i class="fas fa-folder"></i> پوشه (اختیاری)</label>' +
        '<div class="pr-tag-dropdown">' +
          '<button class="pr-pill" id="pr-tag-btn"><i class="fas fa-folder"></i> <span id="pr-tag-name">همه پوشه‌ها</span> <i class="fas fa-chevron-down" style="font-size:10px;opacity:.7;"></i></button>' +
          '<div class="pr-tag-menu" id="pr-tag-menu"></div>' +
        '</div></div>' +

        // ===== محدوده لغات =====
        '<div class="pr-set-group"><label class="pr-set-label"><i class="fas fa-filter"></i> محدوده لغات</label>' +
        '<div class="range-buttons">' +
          '<button class="range-option pr-pill active" data-range="all"><i class="fas fa-database"></i> همه</button>' +
          '<button class="range-option pr-pill" data-range="favorites"><i class="fas fa-star"></i> علاقه‌مندی</button>' +
          '<button class="range-option pr-pill" data-range="recent"><i class="fas fa-clock"></i> اخیر</button>' +
          '<button class="range-option pr-pill" data-range="custom"><i class="fas fa-arrows-alt-h"></i> دلخواه</button>' +
        '</div>' +
        '<div class="custom-range-inputs pr-custom-range"><input type="number" id="range-start" placeholder="از شماره" min="1"><span>تا</span><input type="number" id="range-end" placeholder="تا شماره" min="1"></div>' +
        '</div>' +

        '<div class="pr-set-group"><label class="pr-set-label"><i class="fas fa-question-circle"></i> تعداد سوالات</label>' +
        '<div class="range-buttons"><button class="count-option pr-pill active" data-count="10">۱۰</button><button class="count-option pr-pill" data-count="20">۲۰</button><button class="count-option pr-pill" data-count="30">۳۰</button><button class="count-option pr-pill" data-count="50">۵۰</button><button class="count-option pr-pill" data-count="all">همه</button></div></div>' +

        '<div class="pr-set-group"><label class="pr-set-label"><i class="fas fa-sort"></i> ترتیب سوالات</label>' +
        '<div class="range-buttons"><button class="order-option pr-pill active" data-order="random"><i class="fas fa-random"></i> تصادفی</button><button class="order-option pr-pill" data-order="sequential"><i class="fas fa-sort-numeric-down"></i> ترتیبی</button><button class="order-option pr-pill" data-order="hardest"><i class="fas fa-chart-line"></i> مشکل‌ترین</button></div></div>' +
        '</div>' +

        '<div class="pr-sec-title"><div class="pr-sec-ic"><i class="fas fa-star"></i></div><h3>تمرین‌های اصلی</h3></div>' +
        '<p class="pr-sec-sub">تمرین‌های پایه و پرکاربرد</p>' +
        '<div class="pr-grid">' + mainCards + '</div>' +

        '<div class="pr-sec-title"><div class="pr-sec-ic"><i class="fas fa-medal"></i></div><h3>تمرین‌های پیشرفته</h3></div>' +
        '<p class="pr-sec-sub">مهارت‌های تخصصی</p>' +
        '<div class="pr-grid">' + advCards + '</div>' +

        '</div>';

      this._prSetupEvents();
      this._prSetupTagDropdown();
    };

    /* ============================================================
       تنظیم رویدادها (محدوده مستقل از پوشه)
       ============================================================ */
    GermanDictionary.prototype._prSetupEvents = function() {
      var self = this;
      var customInputs = document.querySelector('.custom-range-inputs');

      document.querySelectorAll('.range-option').forEach(function(btn) {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.range-option').forEach(function(b){b.classList.remove('active');});
          btn.classList.add('active');
          var range = btn.dataset.range;
          localStorage.setItem('practiceRange', range);
          if (customInputs) {
            if (range === 'custom') { customInputs.classList.add('show'); customInputs.style.display='flex'; }
            else { customInputs.classList.remove('show'); customInputs.style.display='none'; }
          }
        });
      });

      document.querySelectorAll('.count-option').forEach(function(btn) {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.count-option').forEach(function(b){b.classList.remove('active');});
          btn.classList.add('active');
          localStorage.setItem('practiceCount', btn.dataset.count);
        });
      });

      document.querySelectorAll('.order-option').forEach(function(btn) {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.order-option').forEach(function(b){b.classList.remove('active');});
          btn.classList.add('active');
          localStorage.setItem('practiceOrder', btn.dataset.order);
        });
      });

      var rs = document.getElementById('range-start');
      var re = document.getElementById('range-end');
      if (rs) rs.addEventListener('change', function(){localStorage.setItem('practiceRangeStart',rs.value);});
      if (re) re.addEventListener('change', function(){localStorage.setItem('practiceRangeEnd',re.value);});

      // رویداد دکمه‌های کارت تمرین
      document.querySelectorAll('.pr-card-btn[data-method]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var method = btn.dataset.method;
          if (typeof self[method] === 'function') {
            self[method]();
          }
        });
      });

      // Restore saved settings
      var savedRange = localStorage.getItem('practiceRange') || 'all';
      document.querySelectorAll('.range-option').forEach(function(btn) {
        if (btn.dataset.range === savedRange) {
          btn.classList.add('active');
          if (customInputs) {
            if (savedRange === 'custom') { customInputs.classList.add('show'); customInputs.style.display='flex'; }
            else { customInputs.classList.remove('show'); customInputs.style.display='none'; }
          }
        } else { btn.classList.remove('active'); }
      });
      var savedCount = localStorage.getItem('practiceCount') || '10';
      document.querySelectorAll('.count-option').forEach(function(btn){btn.classList.toggle('active',btn.dataset.count===savedCount);});
      var savedOrder = localStorage.getItem('practiceOrder') || 'random';
      document.querySelectorAll('.order-option').forEach(function(btn){btn.classList.toggle('active',btn.dataset.order===savedOrder);});
      if (rs && localStorage.getItem('practiceRangeStart')) rs.value = localStorage.getItem('practiceRangeStart');
      if (re && localStorage.getItem('practiceRangeEnd')) re.value = localStorage.getItem('practiceRangeEnd');

      // بستن منوی پوشه با کلیک خارج
      document.addEventListener('click', function(e) {
        var menu = document.getElementById('pr-tag-menu');
        var tagBtn = document.getElementById('pr-tag-btn');
        if (menu && !menu.contains(e.target) && e.target !== tagBtn && !tagBtn.contains(e.target)) {
          menu.classList.remove('open');
        }
      });
    };

    /* ============================================================
       Dropdown پوشه (کاملاً مستقل)
       ============================================================ */
    GermanDictionary.prototype._prSetupTagDropdown = function() {
      var self = this;
      var menu = document.getElementById('pr-tag-menu');
      var nameSpan = document.getElementById('pr-tag-name');
      var tagBtn = document.getElementById('pr-tag-btn');
      if (!menu) return;

      if (tagBtn) {
        tagBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          menu.classList.toggle('open');
        });
      }

      var tags = [];
      try { tags = this.getAllTags() || []; } catch(e) { tags = []; }

      var html = '<button class="pr-tag-opt active" data-tag-id="all"><i class="fas fa-globe" style="font-size:11px;"></i> همه پوشه‌ها</button>';
      tags.forEach(function(tag) {
        html += '<button class="pr-tag-opt" data-tag-id="' + tag.id + '">' +
          '<span class="pr-tag-dot" style="background:' + (tag.color||'#64748b') + ';"></span>' +
          self.escapeHtml(tag.name) +
          '<span style="font-size:10px;opacity:.6;margin-right:auto;">(' + (tag.wordCount||0) + ')</span></button>';
      });
      menu.innerHTML = html;

      var savedTag = localStorage.getItem('selectedPracticeTag');
      if (savedTag && savedTag !== 'all') {
        self.selectedPracticeTag = savedTag;
        var tag = tags.find(function(t){return t.id===savedTag;});
        if (tag && nameSpan) nameSpan.textContent = tag.name;
        if (tagBtn) tagBtn.classList.add('active');
        document.querySelectorAll('.pr-tag-opt').forEach(function(o){o.classList.remove('active');});
        var activeOpt = menu.querySelector('[data-tag-id="' + savedTag + '"]');
        if (activeOpt) activeOpt.classList.add('active');
      } else {
        self.selectedPracticeTag = null;
        if (nameSpan) nameSpan.textContent = 'همه پوشه‌ها';
        if (tagBtn) tagBtn.classList.remove('active');
      }

      menu.querySelectorAll('.pr-tag-opt').forEach(function(opt) {
        opt.addEventListener('click', function(e) {
          e.stopPropagation();
          var tagId = opt.dataset.tagId;
          document.querySelectorAll('.pr-tag-opt').forEach(function(o){o.classList.remove('active');});
          opt.classList.add('active');

          if (tagId === 'all') {
            self.selectedPracticeTag = null;
            localStorage.removeItem('selectedPracticeTag');
            if (nameSpan) nameSpan.textContent = 'همه پوشه‌ها';
            if (tagBtn) tagBtn.classList.remove('active');
          } else {
            self.selectedPracticeTag = tagId;
            localStorage.setItem('selectedPracticeTag', tagId);
            var tag = tags.find(function(t){return t.id===tagId;});
            if (tag && nameSpan) nameSpan.textContent = tag.name;
            if (tagBtn) tagBtn.classList.add('active');
          }
          menu.classList.remove('open');
        });
      });
    };

    /* ============================================================
       ردیابی لغات اشتباه
       ============================================================ */
    GermanDictionary.prototype._prTrackWrongAnswer = function(word, practiceType) {
      if (!word || !word.id) return;
      try {
        var list = this._prGetWrongWords();
        list = list.filter(function(w){return String(w.wordId)!==String(word.id);});
        list.unshift({
          wordId: word.id, german: word.german||'', persian: word.persian||'',
          type: word.type||'', gender: word.gender||'',
          practiceType: practiceType||'general', timestamp: Date.now()
        });
        if (list.length > MAX_WRONG) list = list.slice(0, MAX_WRONG);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch(e) { console.warn('[practice] track error:', e); }
    };

    GermanDictionary.prototype._prRemoveCorrectWord = function(wordId) {
      try {
        var list = this._prGetWrongWords();
        var before = list.length;
        list = list.filter(function(w){return String(w.wordId)!==String(wordId);});
        if (list.length !== before) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }
      } catch(e) {}
    };

    GermanDictionary.prototype._prGetWrongWords = function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        var p = JSON.parse(raw);
        return Array.isArray(p) ? p : [];
      } catch(e) { return []; }
    };

    GermanDictionary.prototype._prClearWrongWords = function() {
      localStorage.removeItem(STORAGE_KEY);
      this.showToast('لیست لغات اشتباه پاک شد', 'success');
      this._prOpenWrongWordsSection();
    };

    /* ============================================================
       باز کردن Section کامل لغات اشتباه
       ============================================================ */
    GermanDictionary.prototype._prOpenWrongWordsSection = function() {
      var section = document.getElementById('wrong-words-section');
      if (!section) {
        section = document.createElement('div');
        section.id = 'wrong-words-section';
        section.className = 'content-section';
        var practiceSection = document.getElementById('practice-section');
        if (practiceSection && practiceSection.parentNode) {
          practiceSection.parentNode.appendChild(section);
        } else {
          document.body.appendChild(section);
        }
      }
      this._prRenderWrongSection();
      this.showSection('wrong-words-section');
    };

    GermanDictionary.prototype._prRenderWrongSection = function() {
      var self = this;
      var section = document.getElementById('wrong-words-section');
      if (!section) return;

      var list = this._prGetWrongWords();
      injectStyles();

      // دسته‌بندی بر اساس نوع تمرین
      var groups = {};
      list.forEach(function(w) {
        var pt = w.practiceType || 'general';
        if (!groups[pt]) groups[pt] = [];
        groups[pt].push(w);
      });

      var groupKeys = Object.keys(groups);
      var groupCount = groupKeys.length;

      var html = '<div class="pr-root"><div class="pr-wrong-view">' +
        '<div class="pr-wrong-toolbar">' +
          '<button class="pr-wrong-back" id="pr-wrong-back"><i class="fas fa-arrow-right"></i> بازگشت به تمرین‌ها</button>' +
          (list.length > 0 ? '<div class="pr-wrong-actions"><button class="pr-wrong-action-btn danger" id="pr-wrong-clear-all"><i class="fas fa-trash"></i> پاک کردن همه</button></div>' : '') +
        '</div>' +

        '<div class="pr-wrong-hero">' +
          '<div class="pr-wrong-hero-ic"><i class="fas fa-rotate-right"></i></div>' +
          '<div class="pr-wrong-hero-info">' +
            '<h2>لغات اشتباه</h2>' +
            '<p>آخرین لغاتی که در تمرین‌ها اشتباه جواب داده‌اید، دسته‌بندی شده بر اساس نوع تمرین</p>' +
          '</div>' +
          '<div class="pr-wrong-hero-stats">' +
            '<div class="pr-wrong-stat"><div class="pr-wrong-stat-num">' + list.length + '</div><div class="pr-wrong-stat-lbl">کل لغات</div></div>' +
            '<div class="pr-wrong-stat"><div class="pr-wrong-stat-num">' + groupCount + '</div><div class="pr-wrong-stat-lbl">دسته تمرین</div></div>' +
          '</div>' +
        '</div>';

      if (list.length === 0) {
        html += '<div class="pr-wrong-empty">' +
          '<div class="pr-wrong-empty-ic"><i class="fas fa-circle-check"></i></div>' +
          '<h3>هیچ لغت اشتباهی ثبت نشده</h3>' +
          '<p>با انجام تمرین‌ها، لغاتی که اشتباه جواب می‌دهید اینجا نمایش داده می‌شوند</p>' +
        '</div>';
      } else {
        html += '<div class="pr-wrong-hint"><i class="fas fa-info-circle"></i>' +
          '<span>برای هر دسته، دکمه «شروع دوباره» همان نوع تمرین را با لغات اشتباه آن دسته شروع می‌کند. لغاتی که درست جواب بدهید به‌صورت خودکار از این لیست حذف می‌شوند.</span>' +
        '</div>';

        groupKeys.sort(function(a,b){ return groups[b].length - groups[a].length; });

        groupKeys.forEach(function(pt) {
          var words = groups[pt];
          var label = PRACTICE_TYPE_LABELS[pt] || pt;
          var icon = PRACTICE_TYPE_ICONS[pt] || 'fa-tag';
          var color = PRACTICE_TYPE_COLORS[pt] || 'rose';
          var method = TYPE_TO_METHOD[pt] || 'startPracticeSession';

          html += '<div class="pr-wrong-group" data-type="' + pt + '">' +
            '<div class="pr-wrong-group-head">' +
              '<div class="pr-wrong-group-info">' +
                '<div class="pr-wrong-group-ic ic-' + color + '"><i class="fas ' + icon + '"></i></div>' +
                '<div>' +
                  '<div class="pr-wrong-group-title">' + label + '</div>' +
                  '<div class="pr-wrong-group-meta">' + words.length + ' لغت اشتباه • آخرین: ' + self._prTimeAgo(words[0].timestamp) + '</div>' +
                '</div>' +
              '</div>' +
              '<span class="pr-wrong-group-count">' + words.length + '</span>' +
              '<button class="pr-wrong-retry-btn" data-method="' + method + '" data-type="' + pt + '">' +
                '<i class="fas fa-play"></i> شروع دوباره' +
              '</button>' +
            '</div>' +
            '<div class="pr-wrong-words-list">';

          words.forEach(function(w, idx) {
            var badges = '';
            if (w.gender) {
              var sym = w.gender==='masculine'?'der':w.gender==='feminine'?'die':w.gender==='neuter'?'das':'';
              if (sym) badges += '<span class="pr-wrong-badge gender">' + sym + '</span>';
            }
            if (w.type) {
              var tl = {noun:'اسم',verb:'فعل',adjective:'صفت',adverb:'قید',preposition:'حرف اضافه'}[w.type]||'';
              if (tl) badges += '<span class="pr-wrong-badge type">' + tl + '</span>';
            }
            html += '<div class="pr-wrong-word-row">' +
              '<div class="pr-wrong-word-num">' + (idx+1) + '</div>' +
              '<span class="pr-wrong-word-de">' + self.escapeHtml(w.german||'') + '</span>' +
              '<span class="pr-wrong-word-fa">' + self.escapeHtml(w.persian||'') + '</span>' +
              '<div class="pr-wrong-word-badges">' + badges + '</div>' +
            '</div>';
          });

          html += '</div></div>';
        });
      }

      html += '</div></div>';
      section.innerHTML = html;

      // رویداد دکمه بازگشت
      var backBtn = document.getElementById('pr-wrong-back');
      if (backBtn) {
        backBtn.addEventListener('click', function() {
          self.showSection('practice-section');
        });
      }

      // رویداد دکمه پاک کردن همه
      var clearAllBtn = document.getElementById('pr-wrong-clear-all');
      if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
          if (confirm('آیا از پاک کردن تمام لغات اشتباه مطمئن هستید؟')) {
            self._prClearWrongWords();
          }
        });
      }

      // رویداد دکمه‌های شروع دوباره
      section.querySelectorAll('.pr-wrong-retry-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var method = btn.dataset.method;
          var pt = btn.dataset.type;
          self._prRetryWrongWords(pt, method);
        });
      });
    };

    /* ============================================================
       شروع تمرین با لغات اشتباه یک دسته خاص
       ============================================================ */
    GermanDictionary.prototype._prRetryWrongWords = async function(practiceType, method) {
      var self = this;
      var list = this._prGetWrongWords();
      var words = list.filter(function(w){return (w.practiceType||'general') === practiceType;});
      if (words.length === 0) {
        this.showToast('لغتی برای این دسته وجود ندارد', 'warning');
        return;
      }
      var wordIds = words.map(function(w){return w.wordId;});

      // ست کردن نوع تمرین فعلی (برای ردیابی در recordPractice)
      self._currentPracticeType = practiceType;
      self._prWrongSessionType = practiceType;
      self._prWrongSessionIds = wordIds;

      // گرفتن لغات از دیتابیس
      var actualWords = [];
      for (var i = 0; i < wordIds.length; i++) {
        try {
          var w = await self.getWord(wordIds[i]);
          if (w) actualWords.push(w);
        } catch(e) {}
      }

      if (actualWords.length === 0) {
        this.showToast('لغات یافت نشدند', 'warning');
        return;
      }

      // فلش‌کارت: از startPracticeSession با wordIds استفاده کن
      if (method === 'startPracticeSession') {
        await self.startPracticeSession(wordIds);
        return;
      }

      // بقیه تمرین‌ها: مستقیماً session را بساز
      // این روش مطمئن‌تر است چون به getFilteredWordsForPractice وابسته نیست
      if (practiceType === 'gender') {
        // برای جنسیت: فقط noun ها با gender
        var nounWords = actualWords.filter(function(w){return w.type === 'noun' && w.gender;});
        if (nounWords.length === 0) {
          self.showToast('لغت جنسیت برای تمرین وجود ندارد', 'warning');
          return;
        }
        self.genderSession = {
          words: nounWords,
          currentIndex: 0,
          score: 0,
          mistakes: 0
        };
        self.showGenderQuestion();
      } else if (practiceType === 'listening') {
        self.listeningSession = {
          words: actualWords,
          currentIndex: 0,
          score: 0,
          attempts: 0
        };
        self.showListeningExercise();
      } else if (practiceType === 'writing') {
        self.writingSession = {
          words: actualWords,
          currentIndex: 0,
          score: 0
        };
        self.showWritingExercise();
      } else if (practiceType === 'matching') {
        self.matchingSession = {
          words: actualWords.slice(0, 6),
          selectedLeft: null,
          selectedRight: null,
          matched: [],
          mistakes: 0
        };
        self.renderMatchingGame();
      } else if (practiceType === 'prepositions') {
        // برای prepositions: ساخت سوالات
        var prepWords = actualWords.filter(function(w){return w.type === 'preposition' || (w.examples && w.examples.length > 0);});
        if (prepWords.length === 0) {
          self.showToast('لغت حروف اضافه برای تمرین وجود ندارد', 'warning');
          return;
        }
        var prepositions = ['in', 'auf', 'an', 'mit', 'für', 'zu', 'von', 'bei', 'nach', 'aus', 'über', 'unter', 'vor', 'hinter', 'neben'];
        var questions = [];
        prepWords.forEach(function(word) {
          var correctPrep = word.german.split(' ')[0] || prepositions[Math.floor(Math.random() * prepositions.length)];
          var options = [correctPrep];
          while (options.length < 4) {
            var rand = prepositions[Math.floor(Math.random() * prepositions.length)];
            if (options.indexOf(rand) === -1) options.push(rand);
          }
          questions.push({
            word: word,
            correct: correctPrep,
            options: self.shuffleArray(options)
          });
        });
        self.prepositionSession = {
          words: prepWords.slice(0, 10),
          currentIndex: 0,
          score: 0,
          mistakes: 0,
          questions: questions
        };
        self.showPrepositionQuestion();
      } else if (practiceType === 'conjugation') {
        // برای صرف افعال: فقط افعال با verbForms
        var verbWords = actualWords.filter(function(w){return w.type === 'verb' && w.verbForms;});
        if (verbWords.length === 0) {
          self.showToast('فعلی با اطلاعات صرف برای تمرین وجود ندارد', 'warning');
          return;
        }
        // ساخت سوالات برای هر فعل، هر tense، هر ضمیر
        var TENSE_INFO = {
          present: { label: 'Präsens (حال ساده)', icon: 'fa-clock' },
          past: { label: 'Präteritum (گذشته ساده)', icon: 'fa-clock-rotate-left' },
          perfect: { label: 'Perfekt (گذشته کامل)', icon: 'fa-circle-check' },
          future: { label: 'Futur I (آینده)', icon: 'fa-arrow-trend-up' },
          konjunktiv: { label: 'Konjunktiv II (التزامی)', icon: 'fa-circle-question' }
        };
        var cjQuestions = [];
        verbWords.forEach(function(word) {
          if (!word.verbForms) return;
          Object.keys(TENSE_INFO).forEach(function(tenseKey) {
            if (!word.verbForms[tenseKey]) return;
            var forms = self._cjParseVerbConjugationGrouped(word.verbForms[tenseKey]);
            forms.forEach(function(formItem) {
              if (formItem.group && formItem.form) {
                cjQuestions.push({
                  word: word,
                  tense: TENSE_INFO[tenseKey],
                  pronoun: formItem.pronoun,
                  correctAnswer: formItem.form
                });
              }
            });
          });
        });
        if (cjQuestions.length === 0) {
          self.showToast('سوالی برای تمرین صرف افعال وجود ندارد', 'warning');
          return;
        }
        // محدود کردن به 30 سوال
        var cjFinal = self.shuffleArray(cjQuestions);
        if (cjFinal.length > 30) cjFinal = cjFinal.slice(0, 30);
        self.conjugationSession = {
          questions: cjFinal,
          currentIndex: 0,
          score: 0,
          mistakes: 0
        };
        self.showConjugationQuestion();
        self.showSection('practice-section');
      } else if (practiceType === 'quiz') {
        // برای quiz: نیاز به حداقل ۴ لغت
        self._prStartQuizWithWords(actualWords, wordIds);
      } else if (practiceType === 'fill-blanks') {
        // برای fill-blanks: نیاز به حداقل ۴ لغت
        self._prStartFillBlanksWithWords(actualWords);
      } else if (practiceType === 'word-order') {
        self._prStartWordOrderWithWords(actualWords);
      } else if (practiceType === 'sentence-completion') {
        self._prStartSentenceCompletionWithWords(actualWords);
      } else if (practiceType === 'speaking') {
        self._prStartSpeakingWithWords(actualWords);
      } else if (practiceType === 'study-mode') {
        self._prStartStudyModeWithWords(actualWords);
      } else {
        // fallback: فلش‌کارت
        await self.startPracticeSession(wordIds);
      }
    };

    // ===== helper methods برای شروع تمرین با لغات مشخص =====

    // quiz با لغات مشخص (حداقل ۴ لغت نیاز است)
    GermanDictionary.prototype._prStartQuizWithWords = function(actualWords, wordIds) {
      var self = this;
      // اگر کمتر از ۴ لغت، لغات اضافی از کل دیتابیس اضافه کن
      var finalWords = actualWords.slice();
      if (finalWords.length < 4) {
        self.getAllWords().then(function(allWords) {
          var existingIds = new Set(wordIds);
          var extraWords = allWords.filter(function(w) { return !existingIds.has(w.id); });
          extraWords = self.shuffleArray(extraWords);
          for (var i = 0; i < extraWords.length && finalWords.length < 4; i++) {
            finalWords.push(extraWords[i]);
          }
          if (finalWords.length < 4) {
            self.showToast('حداقل به ۴ لغت برای آزمون نیاز دارید', 'warning');
            return;
          }
          self._prBuildQuizSession(finalWords);
        }).catch(function() {
          self.showToast('خطا در دریافت لغات', 'error');
        });
      } else {
        self._prBuildQuizSession(finalWords);
      }
    };

    GermanDictionary.prototype._prBuildQuizSession = function(words) {
      this.quizSession = {
        words: words,
        currentIndex: 0,
        score: 0,
        mistakes: 0
      };
      this.showQuizQuestion();
      this.showSection('quiz-section');
    };

    // fill-blanks با لغات مشخص (حداقل ۴ لغت نیاز است)
    GermanDictionary.prototype._prStartFillBlanksWithWords = function(actualWords) {
      var self = this;
      var finalWords = actualWords.slice();
      if (finalWords.length < 4) {
        self.getAllWords().then(function(allWords) {
          var existingIds = new Set(actualWords.map(function(w) { return w.id; }));
          var extraWords = allWords.filter(function(w) { return !existingIds.has(w.id); });
          extraWords = self.shuffleArray(extraWords);
          for (var i = 0; i < extraWords.length && finalWords.length < 4; i++) {
            finalWords.push(extraWords[i]);
          }
          if (finalWords.length < 4) {
            self.showToast('حداقل به ۴ لغت برای این تمرین نیاز دارید', 'warning');
            return;
          }
          self._prBuildFillBlanksSession(finalWords);
        }).catch(function() {
          self.showToast('خطا در دریافت لغات', 'error');
        });
      } else {
        self._prBuildFillBlanksSession(finalWords);
      }
    };

    GermanDictionary.prototype._prBuildFillBlanksSession = function(words) {
      this.fillBlanksSession = {
        words: words,
        currentIndex: 0,
        score: 0,
        mistakes: 0
      };
      this.showFillBlanksQuestion();
      this.showSection('practice-section');
    };

    // word-order با لغات مشخص
    GermanDictionary.prototype._prStartWordOrderWithWords = async function(actualWords) {
      var self = this;
      if (actualWords.length === 0) {
        self.showToast('لغتی برای تمرین مرتب‌سازی وجود ندارد', 'warning');
        return;
      }

      // گرفتن examples برای هر لغت
      var customSentences = [];
      for (var i = 0; i < actualWords.length; i++) {
        var word = actualWords[i];
        try {
          var examples = [];
          if (typeof self.getExamplesForWord === 'function') {
            examples = await self.getExamplesForWord(word.id);
          } else if (word.examples) {
            examples = word.examples;
          }
          for (var j = 0; j < examples.length; j++) {
            var ex = examples[j];
            var sentence = ex.german || ex.sentence || '';
            if (sentence && sentence.length > 10) {
              var wordsArray = sentence.split(' ');
              if (wordsArray.length >= 3 && wordsArray.length <= 8) {
                customSentences.push({
                  correct: sentence,
                  words: self.shuffleArray(wordsArray.slice()),
                  translation: ex.persian || ex.translation || word.persian || '',
                  wordId: word.id
                });
              }
            }
          }
        } catch(e) {}
      }

      if (customSentences.length === 0) {
        self.showToast('لغاتی با مثال برای تمرین مرتب‌سازی وجود ندارد', 'warning');
        return;
      }

      self.wordOrderSession = {
        questions: [],
        currentIndex: 0,
        score: 0
      };

      customSentences.forEach(function(sent) {
        self.wordOrderSession.questions.push({
          correctOrder: sent.correct,
          shuffledWords: sent.words,
          translation: sent.translation,
          wordId: sent.wordId
        });
      });

      if (typeof self.showWordOrderQuestion === 'function') {
        self.showWordOrderQuestion();
        self.showSection('practice-section');
      } else {
        self.showToast('تمرین مرتب‌سازی در دسترس نیست', 'warning');
      }
    };

    // sentence-completion با لغات مشخص
    GermanDictionary.prototype._prStartSentenceCompletionWithWords = async function(actualWords) {
      var self = this;
      if (actualWords.length === 0) {
        self.showToast('لغتی برای تکمیل جمله وجود ندارد', 'warning');
        return;
      }

      // گرفتن examples برای هر لغت
      var wordsWithExamples = [];
      for (var i = 0; i < actualWords.length; i++) {
        var word = actualWords[i];
        try {
          var examples = [];
          if (typeof self.getExamplesForWord === 'function') {
            examples = await self.getExamplesForWord(word.id);
          } else if (word.examples) {
            examples = word.examples;
          }
          if (examples && examples.length > 0) {
            wordsWithExamples.push({ word: word, examples: examples });
          }
        } catch(e) {}
      }

      if (wordsWithExamples.length === 0) {
        self.showToast('لغاتی با مثال برای تکمیل جمله وجود ندارد', 'warning');
        return;
      }

      // ساخت questions
      self.sentenceSession = {
        questions: [],
        currentIndex: 0,
        score: 0
      };

      wordsWithExamples.forEach(function(item) {
        var word = item.word;
        var example = item.examples[0];
        var exampleText = example.german || example.sentence || '';
        var exampleTrans = example.persian || example.translation || '';

        if (!exampleText) return;

        var wordsInExample = exampleText.split(' ');
        if (wordsInExample.length < 3) return;

        var randomIndex = Math.floor(Math.random() * wordsInExample.length);
        var removedWord = wordsInExample[randomIndex];
        wordsInExample[randomIndex] = '______';
        var questionText = wordsInExample.join(' ');

        // ساخت گزینه‌ها
        var otherWords = wordsWithExamples.filter(function(w) { return w.word.id !== word.id; }).slice(0, 3);
        var options = [removedWord];
        otherWords.forEach(function(other) {
          var otherExample = other.examples[0].german || other.examples[0].sentence || '';
          var otherWordsArr = otherExample.split(' ');
          if (otherWordsArr.length > 0) {
            var randomWord = otherWordsArr[Math.floor(Math.random() * otherWordsArr.length)];
            options.push(randomWord);
          }
        });
        options = self.shuffleArray(options);

        self.sentenceSession.questions.push({
          word: word,
          questionText: questionText,
          exampleTrans: exampleTrans,
          correctAnswer: removedWord,
          options: options,
          persianMeaning: word.persian
        });
      });

      if (self.sentenceSession.questions.length === 0) {
        self.showToast('سوالی برای تکمیل جمله وجود ندارد', 'warning');
        return;
      }

      if (typeof self.showSentenceCompletionQuestion === 'function') {
        self.showSentenceCompletionQuestion();
        self.showSection('practice-section');
      } else {
        self.showToast('تمرین تکمیل جمله در دسترس نیست', 'warning');
      }
    };

    // speaking با لغات مشخص
    GermanDictionary.prototype._prStartSpeakingWithWords = function(actualWords) {
      var self = this;
      if (actualWords.length === 0) {
        self.showToast('لغتی برای تمرین مکالمه وجود ندارد', 'warning');
        return;
      }
      // دریافت تنظیمات ذخیره شده
      var savedLevel = localStorage.getItem('speakingLevel') || 'A2';
      var savedDifficulty = localStorage.getItem('speakingDifficulty') || 'medium';
      var savedShowMeaning = localStorage.getItem('speakingShowMeaning') !== 'false';
      var savedMode = localStorage.getItem('speakingMode') || 'fill_blank';

      self.speakingSession = {
        words: actualWords,
        currentIndex: 0,
        score: 0,
        answers: [],
        level: savedLevel,
        difficulty: savedDifficulty,
        showMeaning: savedShowMeaning,
        mode: savedMode
      };
      if (typeof self.showSpeakingQuestion === 'function') {
        self.showSpeakingQuestion();
        self.showSection('practice-section');
      } else {
        self.showToast('تمرین مکالمه در دسترس نیست', 'warning');
      }
    };

    // study-mode با لغات مشخص
    GermanDictionary.prototype._prStartStudyModeWithWords = function(actualWords) {
      var self = this;
      if (actualWords.length === 0) {
        self.showToast('لغتی برای حالت مطالعه وجود ندارد', 'warning');
        return;
      }
      self.studySession = {
        words: actualWords,
        currentIndex: 0,
        isPlaying: false,
        timer: null,
        timePerWord: parseFloat(localStorage.getItem('studyTimePerWord')) || 5
      };
      if (typeof self.showStudySettingsModal === 'function') {
        self.showStudySettingsModal();
      } else {
        self.showToast('حالت مطالعه در دسترس نیست', 'warning');
      }
    };

    // helper: نمایش زمان نسبی
    GermanDictionary.prototype._prTimeAgo = function(ts) {
      if (!ts) return '';
      var diff = Date.now() - ts;
      var min = Math.floor(diff / 60000);
      if (min < 1) return 'همین الان';
      if (min < 60) return min + ' دقیقه پیش';
      var hr = Math.floor(min / 60);
      if (hr < 24) return hr + ' ساعت پیش';
      var day = Math.floor(hr / 24);
      if (day < 30) return day + ' روز پیش';
      return new Date(ts).toLocaleDateString('fa-IR');
    };
  }

  /* ============================================================
     Override همه startXxxPractice: ست کردن _currentPracticeType
     این کلید حل مشکل دسته‌بندی اشتباه است!
     ============================================================ */
  function overrideStartMethods() {
    Object.keys(METHOD_TO_TYPE).forEach(function(methodName) {
      var practiceType = METHOD_TO_TYPE[methodName];
      if (typeof GermanDictionary.prototype[methodName] !== 'function') return;
      if (GermanDictionary.prototype['_prOrig_' + methodName]) return;

      var original = GermanDictionary.prototype[methodName];
      GermanDictionary.prototype['_prOrig_' + methodName] = original;

      GermanDictionary.prototype[methodName] = async function() {
        // ست کردن نوع تمرین فعلی قبل از شروع
        this._currentPracticeType = practiceType;
        // اگر در session اشتباه نیستیم، session type موقت را پاک کن
        if (!this._prWrongSessionIds) {
          this._prWrongSessionType = null;
        }
        return await original.apply(this, arguments);
      };
    });
  }

  /* ============================================================
     Override recordPractice: استفاده از _currentPracticeType
     ============================================================ */
  function overrideRecordPractice() {
    if (typeof GermanDictionary.prototype.recordPractice !== 'function') return;
    if (GermanDictionary.prototype._prOriginalRecordPractice) return;

    var original = GermanDictionary.prototype.recordPractice;
    GermanDictionary.prototype._prOriginalRecordPractice = original;

    GermanDictionary.prototype.recordPractice = async function(wordId, correct) {
      var result = await original.call(this, wordId, correct);
      try {
        if (correct === false) {
          var word = null;
          if (typeof this.getWord === 'function') {
            try { word = await this.getWord(wordId); } catch(e) {}
          }
          if (!word) word = {id:wordId, german:'', persian:'', type:'', gender:''};
          // استفاده از _currentPracticeType (که توسط startXxxPractice ست شده)
          var pt = this._currentPracticeType || 'general';
          this._prTrackWrongAnswer(word, pt);
        } else if (correct === true) {
          // لغت درست جواب داده شد — از لیست اشتباه حذف کن
          this._prRemoveCorrectWord(wordId);
        }
      } catch(e) { console.warn('[practice] recordPractice override error:', e); }
      return result;
    };
  }

  /* ============================================================
     Override getWordsForPractice و getFilteredWordsForPractice:
     مدیریت _prWrongSessionIds (برای شروع دوباره با لغات اشتباه)
     ============================================================ */
  function overrideGetWordsForPractice() {
    if (typeof GermanDictionary.prototype.getWordsForPractice !== 'function') return;
    if (GermanDictionary.prototype._prOriginalGetWordsForPractice) return;

    var original = GermanDictionary.prototype.getWordsForPractice;
    GermanDictionary.prototype._prOriginalGetWordsForPractice = original;

    GermanDictionary.prototype.getWordsForPractice = async function() {
      if (this._prWrongSessionIds && this._prWrongSessionIds.length > 0) {
        var wrongIds = this._prWrongSessionIds;
        this._prWrongSessionIds = null;
        var wrongWords = [];
        for (var i = 0; i < wrongIds.length; i++) {
          try {
            var w = await this.getWord(wrongIds[i]);
            if (w) wrongWords.push(w);
          } catch(e) {}
        }
        return wrongWords;
      }
      return await original.call(this);
    };
  }

  function overrideGetFilteredWordsForPractice() {
    if (typeof GermanDictionary.prototype.getFilteredWordsForPractice !== 'function') return;
    if (GermanDictionary.prototype._prOriginalGetFilteredWordsForPractice) return;

    var original = GermanDictionary.prototype.getFilteredWordsForPractice;
    GermanDictionary.prototype._prOriginalGetFilteredWordsForPractice = original;

    GermanDictionary.prototype.getFilteredWordsForPractice = async function() {
      if (this._prWrongSessionIds && this._prWrongSessionIds.length > 0) {
        var wrongIds = this._prWrongSessionIds;
        this._prWrongSessionIds = null;
        var wrongWords = [];
        for (var i = 0; i < wrongIds.length; i++) {
          try {
            var w = await this.getWord(wrongIds[i]);
            if (w) wrongWords.push(w);
          } catch(e) {}
        }
        var savedSort = localStorage.getItem('wordListSort') || 'alphabetical';
        if (savedSort !== 'random' && typeof this.applySortToFilteredWords === 'function') {
          this.applySortToFilteredWords(wrongWords, savedSort);
        }
        return wrongWords;
      }
      return await original.call(this);
    };
  }

  /* ============================================================
     مقداردهی ماژول
     ============================================================ */
  function initPracticeModule() {
    if (typeof GermanDictionary === 'undefined') return false;
    if (GermanDictionary.prototype._practiceProInitialized) return true;
    injectStyles();
    defineMethods();
    overrideStartMethods();
    overrideRecordPractice();
    overrideGetWordsForPractice();
    overrideGetFilteredWordsForPractice();
    GermanDictionary.prototype._practiceProInitialized = true;
    console.log('[practice-pro] Practice module v4 initialized.');
    if (typeof dictionaryApp !== 'undefined' && dictionaryApp) {
      setTimeout(function() {
        try { dictionaryApp.renderPracticeOptions(); } catch(e) {}
      }, 300);
    }
    return true;
  }

  if (typeof GermanDictionary !== 'undefined') {
    initPracticeModule();
  } else {
    var pc = 0;
    var pi = setInterval(function() {
      pc++;
      if (typeof GermanDictionary !== 'undefined') { clearInterval(pi); initPracticeModule(); }
      else if (pc > 300) { clearInterval(pi); }
    }, 100);
  }
})();
