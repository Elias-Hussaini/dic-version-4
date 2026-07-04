/* dict-practice-modes.js — تمرین‌های واحد پریمیوم v3
 * شامل: فلش‌کارت، تطابق، جنسیت، حروف اضافه، شنیداری، نوشتاری
 * تغییرات v3:
 *   - فلش‌کارت: طراحی وسط‌چین، خلاقانه، با gradient و glassmorphism
 *   - فلش‌کارت: جدول ضمایر برای افعال (ich/du/er/wir/ihr/sie)
 *   - فلش‌کارت: جلوگیری از اسکرول با max-height
 *   - دکمه‌های بلدم/نبلدم: کار می‌کنند با event delegation
 *   - نوشتاری: progress bar فشرده به جای dots
 *   - شنیداری: showListeningExercise اضافه شد (گم‌شده بود)
 *   - نوشتاری: showWritingResults اضافه شد (گم‌شده بود)
 *   - استایل مدرن، ریسپانسیو، dark mode
 */

/* ============================================================
   تزریق استایل‌ها (یک بار)
   ============================================================ */
GermanDictionary.prototype._pmInjectStyles = function() {
    if (document.getElementById('pm-pro-styles')) return;
    const style = document.createElement('style');
    style.id = 'pm-pro-styles';
    style.textContent = `
      :root{
        --pm-bg:#f7f8fa;--pm-card:#fff;--pm-text:#1a1a2e;--pm-muted:#64748b;
        --pm-border:#e2e8f0;--pm-primary:#6C5CE7;--pm-success:#10b981;
        --pm-danger:#f43f5e;--pm-warning:#f59e0b;--pm-cyan:#06b6d4;
        --pm-violet:#8b5cf6;
      }
      body.dark-mode{
        --pm-bg:#0f1115;--pm-card:#1a1d24;--pm-text:#e4e6eb;--pm-muted:#9ca3af;
        --pm-border:#2a2e38;
      }

      .pm-root{font-family:'Vazirmatn',Tahoma,sans-serif;direction:rtl;color:var(--pm-text);max-width:760px;margin:0 auto;padding:8px 0;}

      /* هدر مشترک */
      .pm-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap;}
      .pm-head h2{font-size:18px;font-weight:800;margin:0;display:flex;align-items:center;gap:8px;}
      .pm-head h2 i{color:var(--pm-primary);}
      .pm-badge{font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;color:#fff;}

      /* کارت مشترک */
      .pm-card{background:var(--pm-card);border:1.5px solid var(--pm-border);border-radius:20px;padding:22px;
        box-shadow:0 8px 24px rgba(0,0,0,.06);position:relative;overflow:hidden;}
      body.dark-mode .pm-card{box-shadow:0 8px 24px rgba(0,0,0,.3);}
      .pm-card::before{content:"";position:absolute;top:-30px;left:-30px;width:140px;height:140px;border-radius:50%;
        background:radial-gradient(circle,rgba(108,92,231,.08) 0%,transparent 70%);pointer-events:none;}

      /* دکمه‌ها */
      .pm-btn{font-family:inherit;font-size:13px;font-weight:700;padding:11px 18px;border-radius:11px;border:none;
        cursor:pointer;color:#fff;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:1;}
      .pm-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
      .pm-btn:active{transform:scale(.97);}
      .pm-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
      .pm-btn-primary{background:linear-gradient(135deg,#6C5CE7,#5b4bd6);}
      .pm-btn-success{background:linear-gradient(135deg,#10b981,#059669);}
      .pm-btn-danger{background:linear-gradient(135deg,#f43f5e,#e11d48);}
      .pm-btn-warning{background:linear-gradient(135deg,#f59e0b,#d97706);}
      .pm-btn-outline{background:transparent;color:var(--pm-text);border:1.5px solid var(--pm-border);flex:0 0 auto;min-width:110px;}
      .pm-btn-slate{background:linear-gradient(135deg,#64748b,#475569);flex:0 0 auto;min-width:110px;}

      /* input */
      .pm-input{width:100%;font-family:inherit;font-size:16px;padding:14px 16px;border:2px solid var(--pm-border);
        border-radius:12px;background:var(--pm-bg);color:var(--pm-text);direction:ltr;text-align:center;
        transition:all .2s;box-sizing:border-box;}
      .pm-input:focus{outline:none;border-color:var(--pm-primary);box-shadow:0 0 0 3px rgba(108,92,231,.15);}
      .pm-input.correct{border-color:#10b981;background:rgba(16,185,129,.08);}
      .pm-input.incorrect{border-color:#f43f5e;background:rgba(244,63,94,.08);}

      /* feedback */
      .pm-feedback{padding:12px 14px;border-radius:12px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;margin-top:12px;}
      .pm-feedback.correct{background:rgba(16,185,129,.1);color:#059669;border:1px solid rgba(16,185,129,.2);}
      .pm-feedback.incorrect{background:rgba(244,63,94,.1);color:#e11d48;border:1px solid rgba(244,63,94,.2);}
      body.dark-mode .pm-feedback.correct{background:rgba(16,185,129,.15);color:#34d399;}
      body.dark-mode .pm-feedback.incorrect{background:rgba(244,63,94,.15);color:#fb7185;}

      /* meta badges */
      .pm-meta{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;}
      .pm-gender{font-size:13px;font-weight:700;padding:4px 12px;border-radius:8px;}
      .pm-gender.masculine{background:#dbeafe;color:#1e40af;}
      .pm-gender.feminine{background:#fce7f3;color:#9d174d;}
      .pm-gender.neuter{background:#d1fae5;color:#065f46;}
      body.dark-mode .pm-gender.masculine{background:rgba(59,130,246,.15);color:#60a5fa;}
      body.dark-mode .pm-gender.feminine{background:rgba(236,72,153,.15);color:#f472b6;}
      body.dark-mode .pm-gender.neuter{background:rgba(16,185,129,.15);color:#34d399;}
      .pm-type{font-size:12px;font-weight:600;padding:4px 12px;border-radius:8px;background:rgba(108,92,231,.1);color:#6C5CE7;}
      body.dark-mode .pm-type{background:rgba(108,92,231,.18);color:#a78bfa;}

      /* ===== فلش‌کارت - طراحی خلاقانه با فونت وزیر ===== */
      .pm-fc-scene{perspective:1600px;width:100%;max-width:560px;margin:0 auto;}
      .pm-fc-card{background:var(--pm-card);border:1.5px solid var(--pm-border);border-radius:24px;padding:24px 20px;
        box-shadow:0 12px 32px rgba(0,0,0,.08);position:relative;overflow:hidden;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
        min-height:300px;
        transform-style:preserve-3d;transition:transform .7s cubic-bezier(.4,.2,.2,1);
        backface-visibility:hidden;}
      body.dark-mode .pm-fc-card{box-shadow:0 12px 32px rgba(0,0,0,.4);}
      .pm-fc-card.flipped{transform:rotateY(180deg);}
      .pm-fc-card::before{content:"";position:absolute;top:-50px;right:-50px;width:180px;height:180px;border-radius:50%;
        background:radial-gradient(circle,rgba(108,92,231,.12) 0%,transparent 70%);pointer-events:none;}
      .pm-fc-card::after{content:"";position:absolute;bottom:-60px;left:-60px;width:200px;height:200px;border-radius:50%;
        background:radial-gradient(circle,rgba(20,184,166,.1) 0%,transparent 70%);pointer-events:none;}

      .pm-fc-icon-wrap{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#6C5CE7,#14b8a6);
        display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;box-shadow:0 6px 16px rgba(108,92,231,.3);
        position:relative;z-index:1;flex-shrink:0;}
      .pm-fc-word{font-family:'Vazirmatn',Tahoma,sans-serif !important;font-size:32px;font-weight:800;color:var(--pm-text);
        text-align:center;line-height:1.4;direction:ltr;position:relative;z-index:1;word-break:break-word;}
      .pm-fc-word.fa-side{direction:rtl;font-size:28px;}
      .pm-fc-meta{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;position:relative;z-index:1;}
      .pm-fc-actions{display:flex;gap:10px;width:100%;margin-top:8px;flex-wrap:wrap;position:relative;z-index:1;}
      .pm-fc-flip{background:linear-gradient(135deg,#64748b,#475569);flex:0 0 auto;min-width:140px;}

      /* دکمه‌های tense برای صرف فعل */
      .pm-tense-tabs{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:8px 0 4px;position:relative;z-index:1;}
      .pm-tense-tab{font-family:'Vazirmatn',Tahoma,sans-serif;font-size:11px;font-weight:700;padding:6px 12px;
        border-radius:8px;border:1.5px solid var(--pm-border);background:var(--pm-bg);color:var(--pm-muted);
        cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:4px;}
      .pm-tense-tab:hover{border-color:var(--pm-primary);color:var(--pm-primary);}
      .pm-tense-tab.active{background:linear-gradient(135deg,#6C5CE7,#5b4bd6);color:#fff;border-color:transparent;
        box-shadow:0 3px 8px rgba(108,92,231,.3);}

      /* جدول صرف افعال - طراحی زیبا و فیت */
      .pm-verb-table{width:100%;max-width:420px;background:var(--pm-bg);border:1px solid var(--pm-border);
        border-radius:14px;overflow:hidden;margin:8px auto;position:relative;z-index:1;}
      .pm-verb-row{display:flex;align-items:center;border-bottom:1px solid var(--pm-border);transition:background .15s;}
      .pm-verb-row:last-child{border-bottom:none;}
      .pm-verb-row:hover{background:rgba(108,92,231,.04);}
      .pm-verb-pronoun{width:70px;padding:7px 10px;font-size:11px;font-weight:700;color:var(--pm-muted);
        background:var(--pm-card);border-left:1px solid var(--pm-border);flex-shrink:0;direction:ltr;}
      .pm-verb-form{flex:1;padding:7px 10px;font-size:13px;font-weight:600;color:var(--pm-text);
        direction:ltr;text-align:left;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      body.dark-mode .pm-verb-pronoun{background:rgba(255,255,255,.03);}
      .pm-verb-labels{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;position:relative;z-index:1;}
      .pm-verb-label{font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;
        background:var(--pm-bg);color:var(--pm-muted);border:1px solid var(--pm-border);}

      /* progress bar مشترک */
      .pm-progress-wrap{margin-top:18px;display:flex;flex-direction:column;gap:6px;}
      .pm-progress-bar{height:8px;background:var(--pm-bg);border-radius:999px;overflow:hidden;border:1px solid var(--pm-border);}
      .pm-progress-fill{height:100%;background:linear-gradient(90deg,#6C5CE7,#14b8a6);transition:width .3s ease;border-radius:999px;}
      .pm-progress-info{display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:var(--pm-muted);}
      .pm-progress-stats{display:flex;gap:8px;}
      .pm-progress-stat{display:flex;align-items:center;gap:4px;}
      .pm-progress-dot{width:8px;height:8px;border-radius:50%;}
      .pm-progress-dot.correct{background:#10b981;}
      .pm-progress-dot.incorrect{background:#f43f5e;}

      /* ===== شنیداری ===== */
      .pm-ls-play-row{display:flex;gap:10px;justify-content:center;margin-bottom:20px;flex-wrap:wrap;}
      .pm-ls-play-btn{font-family:inherit;font-size:14px;font-weight:700;padding:14px 24px;border-radius:14px;border:none;
        cursor:pointer;color:#fff;transition:all .2s;display:inline-flex;align-items:center;gap:8px;
        box-shadow:0 4px 14px rgba(6,182,212,.3);}
      .pm-ls-play-btn:hover{transform:translateY(-2px);filter:brightness(1.08);}
      .pm-ls-play-btn:active{transform:scale(.97);}
      .pm-ls-play-start{background:linear-gradient(135deg,#06b6d4,#0891b2);min-width:160px;justify-content:center;}
      .pm-ls-play-replay{background:linear-gradient(135deg,#64748b,#475569);min-width:120px;justify-content:center;}
      .pm-ls-play-icon{font-size:18px;}

      /* ===== نوشتاری ===== */
      .pm-wr-question{text-align:center;margin-bottom:20px;}
      .pm-wr-question-label{font-size:11px;font-weight:600;color:var(--pm-muted);margin-bottom:6px;}
      .pm-wr-question-text{font-size:26px;font-weight:800;color:var(--pm-text);}
      .pm-wr-gender-row{display:flex;justify-content:center;gap:8px;margin-top:8px;}

      /* ===== نتایج ===== */
      .pm-rs-card{background:var(--pm-card);border:1.5px solid var(--pm-border);border-radius:20px;padding:28px;
        box-shadow:0 8px 24px rgba(0,0,0,.06);text-align:center;}
      body.dark-mode .pm-rs-card{box-shadow:0 8px 24px rgba(0,0,0,.3);}
      .pm-rs-title{font-size:20px;font-weight:800;margin:0 0 20px;display:flex;align-items:center;justify-content:center;gap:8px;}
      .pm-rs-title i{color:#f59e0b;}
      .pm-rs-circle{width:140px;height:140px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;position:relative;}
      .pm-rs-circle-inner{width:110px;height:110px;border-radius:50%;background:var(--pm-card);display:flex;align-items:center;justify-content:center;}
      .pm-rs-circle-num{font-size:32px;font-weight:800;color:var(--pm-text);}
      .pm-rs-stats{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;}
      .pm-rs-stat{background:var(--pm-bg);border:1px solid var(--pm-border);border-radius:12px;padding:12px 18px;min-width:110px;}
      .pm-rs-stat-lbl{font-size:11px;font-weight:600;color:var(--pm-muted);margin-bottom:4px;}
      .pm-rs-stat-val{font-size:20px;font-weight:800;color:var(--pm-text);}
      .pm-rs-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}

      /* ===== حالت مطالعه - ریسپانسیو ===== */
      .pm-study-card{background:var(--pm-card);border:1.5px solid var(--pm-border);border-radius:20px;padding:24px;
        box-shadow:0 8px 24px rgba(0,0,0,.06);text-align:center;max-width:640px;margin:0 auto;}
      body.dark-mode .pm-study-card{box-shadow:0 8px 24px rgba(0,0,0,.3);}
      .pm-study-word{font-size:42px;font-weight:800;color:var(--pm-primary);margin-bottom:16px;word-break:break-word;direction:ltr;}
      .pm-study-meta{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;}
      .pm-study-meaning{background:var(--pm-bg);border:1px solid var(--pm-border);border-radius:16px;padding:18px;margin:16px 0;}
      .pm-study-meaning-lbl{font-size:11px;color:var(--pm-muted);margin-bottom:6px;}
      .pm-study-meaning-text{font-size:22px;font-weight:700;}
      .pm-study-verb{background:var(--pm-bg);border:1px solid var(--pm-border);border-radius:16px;padding:16px;margin:12px 0;}
      .pm-study-verb-lbl{font-size:11px;color:var(--pm-muted);margin-bottom:10px;}
      .pm-study-verb-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:6px;}
      .pm-study-verb-item{background:var(--pm-card);border:1px solid var(--pm-border);border-radius:10px;padding:8px 14px;min-width:100px;}
      .pm-study-verb-tense{font-size:10px;color:var(--pm-muted);margin-bottom:2px;}
      .pm-study-verb-form{font-size:13px;font-weight:700;direction:ltr;}
      .pm-study-countdown{margin-top:16px;font-size:13px;color:var(--pm-muted);}
      .pm-study-countdown-num{font-weight:800;color:var(--pm-primary);font-size:16px;}

      @media(max-width:768px){
        .pm-fc-card{padding:20px 16px;min-height:280px;}
        .pm-fc-word{font-size:26px;}
        .pm-fc-word.fa-side{font-size:22px;}
        .pm-fc-icon-wrap{width:44px;height:44px;font-size:18px;}
        .pm-btn{font-size:12px;padding:10px 14px;}
        .pm-wr-question-text{font-size:22px;}
        .pm-rs-circle{width:120px;height:120px;}
        .pm-rs-circle-inner{width:96px;height:96px;}
        .pm-rs-circle-num{font-size:26px;}
        .pm-study-word{font-size:32px;}
        .pm-study-meaning-text{font-size:18px;}
        .pm-verb-pronoun{width:60px;padding:6px 8px;font-size:10px;}
        .pm-verb-form{padding:6px 8px;font-size:12px;}
      }
      @media(max-width:480px){
        .pm-root{padding:4px 0;}
        .pm-fc-card{padding:16px 12px;min-height:260px;}
        .pm-fc-word{font-size:22px;}
        .pm-fc-word.fa-side{font-size:18px;}
        .pm-fc-icon-wrap{width:40px;height:40px;font-size:16px;}
        .pm-fc-actions,.pm-ls-play-row{flex-direction:column;}
        .pm-btn,.pm-ls-play-btn{width:100%;}
        .pm-btn-outline,.pm-btn-slate,.pm-fc-flip{min-width:0;}
        .pm-verb-table{max-width:100%;font-size:11px;}
        .pm-verb-pronoun{width:50px;padding:5px 6px;font-size:10px;}
        .pm-verb-form{padding:5px 6px;font-size:11px;}
        .pm-verb-row{flex-wrap:nowrap;}
        .pm-rs-stats{flex-direction:column;align-items:stretch;}
        .pm-rs-stat{min-width:0;}
        .pm-rs-actions{flex-direction:column;}
        .pm-btn{width:100%;}
        .pm-study-word{font-size:26px;}
        .pm-study-card{padding:18px 14px;}
      }
    `;
    document.head.appendChild(style);
};

/* ============================================================
   helper: escape HTML
   ============================================================ */
GermanDictionary.prototype._pmEsc = function(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
};

/* ============================================================
   helper: parse رشته صرف فعل به آرایه {pronoun, form}
   پشتیبانی از جداکننده‌های: , ، / |
   مثال: "ich lerne / du lernst / er lernt" → [{pronoun:"ich", form:"lerne"}, ...]
   ============================================================ */
GermanDictionary.prototype._pmParseVerbConjugation = function(str) {
    if (!str || typeof str !== 'string') return [];
    const result = [];
    const pronouns = ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'Sie', 'man'];
    // split با کاما، ویرگول فارسی، اسلش، یا |
    const parts = str.split(/[,،/|]\s*/);
    parts.forEach(part => {
        part = part.trim();
        if (!part) return;
        let matched = null;
        for (const p of pronouns) {
            if (part.toLowerCase().startsWith(p.toLowerCase() + ' ')) {
                matched = { pronoun: p, form: part.substring(p.length).trim() };
                break;
            }
        }
        if (matched) {
            result.push(matched);
        } else if (part.length > 0) {
            result.push({ pronoun: '', form: part });
        }
    });
    return result;
};

/* ============================================================
   helper: parse کامل صرف فعل (برای تمرین صرف)
   از verbForms استخراج می‌کند: present, past, perfect
   ============================================================ */
GermanDictionary.prototype._pmParseVerbForms = function(verbForms) {
    if (!verbForms) return null;
    const result = { present: [], past: [], perfect: [] };
    if (verbForms.present) result.present = this._pmParseVerbConjugation(verbForms.present);
    if (verbForms.past) result.past = this._pmParseVerbConjugation(verbForms.past);
    if (verbForms.perfect) result.perfect = this._pmParseVerbConjugation(verbForms.perfect);
    return result;
};

/* ============================================================
   helper: نرمال‌سازی پاسخ کاربر برای مقایسه
   ============================================================ */
GermanDictionary.prototype._pmNormalizeConjugation = function(str) {
    if (!str) return '';
    return String(str).toLowerCase().trim()
        .replace(/\s+/g, ' ')           // چند فاصله → یکی
        .replace(/[،,]/g, ',')          // ویرگول فارسی → انگلیسی
        .replace(/\s*,\s*/g, ', ')      // فاصله‌های اطراف کاما
        .replace(/\s*\/\s*/g, ', ')     // اسلش → کاما
        .replace(/\s*\|\s*/g, ', ')     // pipe → کاما
        .replace(/[äå]/g, 'ae')
        .replace(/[ö]/g, 'oe')
        .replace(/[ü]/g, 'ue')
        .replace(/[ß]/g, 'ss');
};

/* ============================================================
   helper: ساخت progress info (جایگزین dots)
   ============================================================ */
GermanDictionary.prototype._pmBuildProgress = function(session, color) {
    const total = session.words.length;
    const current = session.currentIndex;
    let correct = 0, incorrect = 0;
    for (let i = 0; i < current; i++) {
        if (session.words[i].userCorrect === true) correct++;
        else if (session.words[i].userCorrect === false) incorrect++;
    }
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    return '<div class="pm-progress-wrap">' +
        '<div class="pm-progress-bar"><div class="pm-progress-fill" style="width:' + pct + '%;background:linear-gradient(90deg,' + color + ',#14b8a6);"></div></div>' +
        '<div class="pm-progress-info">' +
            '<span>' + (current + 1) + ' / ' + total + '</span>' +
            '<div class="pm-progress-stats">' +
                '<div class="pm-progress-stat"><div class="pm-progress-dot correct"></div>' + correct + '</div>' +
                '<div class="pm-progress-stat"><div class="pm-progress-dot incorrect"></div>' + incorrect + '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
};

/* ============================================================
   فلش‌کارت — طراحی خلاقانه وسط‌چین
   ============================================================ */
GermanDictionary.prototype.showNextFlashcard = function() {
    if (this.practiceSession.currentIndex >= this.practiceSession.words.length) {
        this.showPracticeResults();
        return;
    }

    this._pmInjectStyles();
    const word = this.practiceSession.words[this.practiceSession.currentIndex];
    const showGermanFirst = Math.random() > 0.5;
    const container = document.getElementById('flashcards-section');
    const self = this;

    // meta badges
    let metaHtml = '';
    if (word.gender) {
        metaHtml += '<span class="pm-gender ' + word.gender + '">' + this.getGenderSymbol(word.gender) + '</span>';
    }
    if (word.type) {
        metaHtml += '<span class="pm-type">' + this.getTypeLabel(word.type) + '</span>';
    }

    // ===== جدول صرف فعل با دکمه‌های tense (فقط برای افعال) =====
    let verbSectionHtml = '';
    if (word.type === 'verb' && word.verbForms) {
        // ساخت لیست tense های موجود
        const tenses = [];
        if (word.verbForms.present) tenses.push({ key: 'present', label: 'Präsens', icon: 'fa-clock' });
        if (word.verbForms.past) tenses.push({ key: 'past', label: 'Präteritum', icon: 'fa-clock-rotate-left' });
        if (word.verbForms.perfect) tenses.push({ key: 'perfect', label: 'Perfekt', icon: 'fa-circle-check' });
        if (word.verbForms.future) tenses.push({ key: 'future', label: 'Futur I', icon: 'fa-arrow-trend-up' });
        if (word.verbForms.konjunktiv) tenses.push({ key: 'konjunktiv', label: 'Konjunktiv II', icon: 'fa-circle-question' });

        if (tenses.length > 0) {
            // دکمه‌های tense
            let tabsHtml = '<div class="pm-tense-tabs">';
            tenses.forEach((t, idx) => {
                tabsHtml += '<button class="pm-tense-tab' + (idx === 0 ? ' active' : '') + '" data-tense="' + t.key + '"><i class="fas ' + t.icon + '"></i> ' + t.label + '</button>';
            });
            tabsHtml += '</div>';

            // جدول برای هر tense (اولین فعال است)
            let tablesHtml = '';
            tenses.forEach((t, idx) => {
                const forms = self._pmParseVerbConjugation(word.verbForms[t.key]);
                if (forms.length > 0) {
                    let rowsHtml = '';
                    forms.forEach(item => {
                        rowsHtml += '<div class="pm-verb-row">' +
                            '<div class="pm-verb-pronoun">' + self._pmEsc(item.pronoun) + '</div>' +
                            '<div class="pm-verb-form">' + self._pmEsc(item.form) + '</div>' +
                        '</div>';
                    });
                    tablesHtml += '<div class="pm-verb-table pm-tense-table" data-tense="' + t.key + '" style="' + (idx === 0 ? '' : 'display:none;') + '">' + rowsHtml + '</div>';
                }
            });

            // label برای helper
            let helperHtml = '';
            if (word.verbForms.helper) {
                helperHtml = '<div class="pm-verb-labels"><span class="pm-verb-label">Aux: ' + self._pmEsc(word.verbForms.helper) + '</span></div>';
            }

            verbSectionHtml = tabsHtml + tablesHtml + helperHtml;
        }
    }

    const frontWord = showGermanFirst ? this._pmEsc(word.german) : this._pmEsc(word.persian);
    const frontClass = showGermanFirst ? '' : 'fa-side';
    const backWord = showGermanFirst ? this._pmEsc(word.persian) : this._pmEsc(word.german);
    const backClass = showGermanFirst ? 'fa-side' : '';
    const pct = (this.practiceSession.currentIndex / this.practiceSession.words.length) * 100;

    container.innerHTML = '<div class="pm-root">' +
        '<div class="pm-head">' +
            '<h2><i class="fas fa-layer-group"></i> فلش‌کارت</h2>' +
            '<span class="pm-badge" style="background:linear-gradient(135deg,#6C5CE7,#5b4bd6);">' + (this.practiceSession.currentIndex + 1) + ' / ' + this.practiceSession.words.length + '</span>' +
        '</div>' +
        '<div class="pm-fc-scene">' +
            '<div class="pm-fc-card" id="pm-fc-card">' +
                '<div class="pm-fc-icon-wrap"><i class="fas fa-book-open"></i></div>' +
                '<div class="pm-fc-word ' + frontClass + '">' + frontWord + '</div>' +
                (showGermanFirst ? '<div class="pm-fc-meta">' + metaHtml + '</div>' : '') +
                '<div class="pm-fc-actions">' +
                    '<button class="pm-btn pm-fc-flip" id="flip-card-btn"><i class="fas fa-redo-alt"></i> نمایش پاسخ</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="pm-fc-scene" id="pm-fc-back-scene" style="display:none;">' +
            '<div class="pm-fc-card" id="pm-fc-back">' +
                '<div class="pm-fc-icon-wrap" style="background:linear-gradient(135deg,#10b981,#14b8a6);"><i class="fas fa-check"></i></div>' +
                '<div class="pm-fc-word ' + backClass + '">' + backWord + '</div>' +
                (!showGermanFirst ? '<div class="pm-fc-meta">' + metaHtml + '</div>' : '') +
                verbSectionHtml +
                '<div class="pm-fc-actions">' +
                    '<button class="pm-btn pm-btn-success" id="correct-btn"><i class="fas fa-check"></i> بلدم</button>' +
                    '<button class="pm-btn pm-btn-danger" id="incorrect-btn"><i class="fas fa-times"></i> نبلدم</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="pm-progress-wrap" style="margin-top:14px;">' +
            '<div class="pm-progress-bar"><div class="pm-progress-fill" style="width:' + pct + '%"></div></div>' +
            '<div class="pm-progress-info">' +
                '<span>' + (this.practiceSession.currentIndex + 1) + ' / ' + this.practiceSession.words.length + '</span>' +
                '<div class="pm-progress-stats">' +
                    '<div class="pm-progress-stat"><div class="pm-progress-dot correct"></div>' + (this.practiceSession.correct || 0) + '</div>' +
                    '<div class="pm-progress-stat"><div class="pm-progress-dot incorrect"></div>' + (this.practiceSession.incorrect || 0) + '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';

    this.setupFlashcardEventListeners();
};

GermanDictionary.prototype.setupFlashcardEventListeners = function() {
    const self = this;
    const flipBtn = document.getElementById('flip-card-btn');
    const frontScene = document.querySelector('.pm-fc-scene:not(#pm-fc-back-scene)');
    const backScene = document.getElementById('pm-fc-back-scene');
    const backCard = document.getElementById('pm-fc-back');

    if (flipBtn && frontScene && backScene) {
        flipBtn.addEventListener('click', function() {
            // ابتدا کارت جلو را با انیمیشن بچرخان
            const frontCard = document.getElementById('pm-fc-card');
            if (frontCard) {
                frontCard.style.transform = 'rotateY(180deg)';
            }
            // بعد از نیمی از انیمیشن، کارت پشت را نمایش بده
            setTimeout(function() {
                if (frontScene) frontScene.style.display = 'none';
                if (backScene) {
                    backScene.style.display = 'block';
                    if (backCard) {
                        backCard.style.transform = 'rotateY(0deg)';
                        // انیمیشن ورود
                        backCard.style.opacity = '0';
                        requestAnimationFrame(function() {
                            backCard.style.transition = 'transform .7s cubic-bezier(.4,.2,.2,1), opacity .4s ease';
                            backCard.style.opacity = '1';
                        });
                    }
                }
            }, 350);
        });
    }

    // دکمه‌های بلدم/نبلدم
    const correctBtn = document.getElementById('correct-btn');
    const incorrectBtn = document.getElementById('incorrect-btn');

    if (correctBtn) {
        correctBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.handleFlashcardAnswer(true);
        });
    }
    if (incorrectBtn) {
        incorrectBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.handleFlashcardAnswer(false);
        });
    }

    // دکمه‌های tense (تب‌های صرف فعل)
    document.querySelectorAll('.pm-tense-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tense = tab.dataset.tense;
            // پاک کردن active از همه
            document.querySelectorAll('.pm-tense-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // مخفی کردن همه جدول‌ها
            document.querySelectorAll('.pm-tense-table').forEach(t => t.style.display = 'none');
            // نمایش جدول انتخاب شده
            const targetTable = document.querySelector('.pm-tense-table[data-tense="' + tense + '"]');
            if (targetTable) {
                targetTable.style.display = 'block';
                // انیمیشن ورود
                targetTable.style.opacity = '0';
                targetTable.style.transform = 'translateY(8px)';
                requestAnimationFrame(function() {
                    targetTable.style.transition = 'opacity .3s ease, transform .3s ease';
                    targetTable.style.opacity = '1';
                    targetTable.style.transform = 'translateY(0)';
                });
            }
        });
    });
};

GermanDictionary.prototype.handleFlashcardAnswer = async function(isCorrect) {
    const currentIndex = this.practiceSession.currentIndex;
    const word = this.practiceSession.words[currentIndex];

    await this.recordPractice(word.id, isCorrect);

    // ست کردن userCorrect برای progress bar
    this.practiceSession.words[currentIndex].userCorrect = isCorrect;

    if (isCorrect) {
        this.practiceSession.correct++;
    } else {
        this.practiceSession.incorrect++;
    }

    this.practiceSession.currentIndex++;
    this.showNextFlashcard();
};

GermanDictionary.prototype.showPracticeResults = function() {
    this._pmInjectStyles();
    const totalWords = this.practiceSession.words.length;
    const correctAnswers = this.practiceSession.correct;
    const incorrect = this.practiceSession.incorrect || 0;
    const accuracy = totalWords > 0 ? Math.round((correctAnswers / totalWords) * 100) : 0;
    const container = document.getElementById('flashcards-section');
    const self = this;

    container.innerHTML = '<div class="pm-root">' +
        '<div class="pm-rs-card">' +
            '<div class="pm-rs-title"><i class="fas fa-trophy"></i> نتایج تمرین</div>' +
            '<div class="pm-rs-circle" style="background: conic-gradient(#10b981 0% ' + accuracy + '%, var(--pm-bg) ' + accuracy + '% 100%);">' +
                '<div class="pm-rs-circle-inner"><span class="pm-rs-circle-num">' + accuracy + '%</span></div>' +
            '</div>' +
            '<div class="pm-rs-stats">' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">تعداد لغات</div><div class="pm-rs-stat-val">' + totalWords + '</div></div>' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">پاسخ صحیح</div><div class="pm-rs-stat-val" style="color:#10b981;">' + correctAnswers + '</div></div>' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">پاسخ نادرست</div><div class="pm-rs-stat-val" style="color:#f43f5e;">' + incorrect + '</div></div>' +
            '</div>' +
            '<div class="pm-rs-actions">' +
                '<button class="pm-btn pm-btn-primary" id="restart-practice-btn"><i class="fas fa-redo-alt"></i> تمرین مجدد</button>' +
                '<button class="pm-btn pm-btn-outline" id="back-to-practice-menu-btn"><i class="fas fa-arrow-right"></i> بازگشت</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.getElementById('restart-practice-btn').addEventListener('click', () => self.startPracticeSession());
    document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
        self.renderPracticeOptions();
        self.showSection('practice-section');
    });
};

/* ============================================================
   تمرین تطابق (Matching)
   ============================================================ */
GermanDictionary.prototype.startMatchingPractice = async function() {
    const wordsToPractice = await this.getFilteredWordsForPractice();

    if (wordsToPractice.length < 4) {
        this.showToast('حداقل به ۴ لغت برای تمرین تطابق نیاز دارید', 'warning');
        return;
    }

    this.matchingSession = {
        words: wordsToPractice.slice(0, 6),
        selectedLeft: null,
        selectedRight: null,
        matched: [],
        mistakes: 0
    };

    this.renderMatchingGame();
};

GermanDictionary.prototype.renderMatchingGame = function() {
    this._pmInjectStyles();
    const session = this.matchingSession;
    const shuffledGerman = this.shuffleArray([...session.words]);
    const shuffledPersian = this.shuffleArray([...session.words]);
    const container = document.getElementById('practice-section');
    const self = this;

    let germanHtml = '';
    shuffledGerman.forEach((word) => {
        const isMatched = session.matched.includes(word.id);
        germanHtml += '<button class="pm-match-item pm-match-left ' + (isMatched ? 'matched' : '') + '" data-id="' + word.id + '" data-side="left" ' + (isMatched ? 'disabled' : '') + '>' +
            '<span class="pm-match-de">' + self._pmEsc(word.german) + '</span>' +
            (word.gender ? '<span class="pm-gender ' + word.gender + '" style="font-size:10px;padding:2px 6px;">' + self.getGenderSymbol(word.gender) + '</span>' : '') +
        '</button>';
    });

    let persianHtml = '';
    shuffledPersian.forEach((word) => {
        const isMatched = session.matched.includes(word.id);
        persianHtml += '<button class="pm-match-item pm-match-right ' + (isMatched ? 'matched' : '') + '" data-id="' + word.id + '" data-side="right" ' + (isMatched ? 'disabled' : '') + '>' +
            '<span class="pm-match-fa">' + self._pmEsc(word.persian) + '</span>' +
        '</button>';
    });

    const progress = this._pmBuildProgress({words: session.words, currentIndex: session.matched.length}, '#ef4444');
    // wrap progress با class برای آپدیت
    const progressWrapped = '<div class="pm-match-progress">' + progress + '</div>';

    container.innerHTML = '<div class="pm-root">' +
        '<div class="pm-head">' +
            '<h2><i class="fas fa-hand-peace"></i> تمرین تطابق</h2>' +
            '<span class="pm-badge" style="background:linear-gradient(135deg,#ef4444,#dc2626);">' + session.matched.length + ' / ' + session.words.length + '</span>' +
        '</div>' +
        '<div class="pm-card">' +
            '<p style="text-align:center;color:var(--pm-muted);font-size:13px;margin:0 0 16px;">کلمات آلمانی را به معنی فارسی وصل کنید</p>' +
            '<div class="pm-match-grid">' +
                '<div class="pm-match-col">' + germanHtml + '</div>' +
                '<div class="pm-match-col">' + persianHtml + '</div>' +
            '</div>' +
            progressWrapped +
        '</div>' +
    '</div>';

    // اضافه کردن استایل مخصوص matching اگر هنوز نبود
    if (!document.getElementById('pm-match-styles')) {
        const ms = document.createElement('style');
        ms.id = 'pm-match-styles';
        ms.textContent = `
          .pm-match-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
          .pm-match-col{display:flex;flex-direction:column;gap:8px;}
          .pm-match-item{font-family:inherit;font-size:13px;font-weight:600;padding:12px 14px;border-radius:11px;
            border:2px solid var(--pm-border);background:var(--pm-bg);color:var(--pm-text);cursor:pointer;
            transition:all .18s;display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:right;}
          .pm-match-item:hover:not(.matched):not(:disabled){border-color:var(--pm-primary);transform:translateY(-1px);}
          .pm-match-item.selected{border-color:var(--pm-primary);background:rgba(108,92,231,.1);}
          .pm-match-item.matched{opacity:.4;cursor:default;border-color:#10b981;background:rgba(16,185,129,.1);}
          .pm-match-item.wrong{animation:pm-shake .4s;border-color:#f43f5e;}
          @keyframes pm-shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-4px);}75%{transform:translateX(4px);}}
          .pm-match-de{direction:ltr;font-weight:700;}
          .pm-match-fa{flex:1;}
          @media(max-width:480px){.pm-match-grid{gap:8px;}.pm-match-item{font-size:11px;padding:10px 8px;}}
        `;
        document.head.appendChild(ms);
    }

    this.setupMatchingEvents();
};

GermanDictionary.prototype.setupMatchingEvents = function() {
    const self = this;
    document.querySelectorAll('.pm-match-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('matched') || item.disabled) return;
            const side = item.dataset.side;
            const id = item.dataset.id;

            // پاک کردن selected های قبلی در همان ستون
            document.querySelectorAll('.pm-match-' + side + '.selected').forEach(s => s.classList.remove('selected'));
            item.classList.add('selected');

            self.matchingSession['selected' + (side === 'left' ? 'Left' : 'Right')] = { id: parseInt(id), element: item };

            // اگر هر دو انتخاب شده‌اند، بررسی کن
            if (self.matchingSession.selectedLeft && self.matchingSession.selectedRight) {
                setTimeout(() => self.checkMatch(), 300);
            }
        });
    });
};

GermanDictionary.prototype.checkMatch = async function() {
    const session = this.matchingSession;
    const left = session.selectedLeft;
    const right = session.selectedRight;

    if (left.id === right.id) {
        // درست
        left.element.classList.add('matched');
        right.element.classList.add('matched');
        left.element.disabled = true;
        right.element.disabled = true;
        session.matched.push(left.id);

        // ست کردن userCorrect برای progress bar
        const matchedWord = session.words.find(w => w.id === left.id);
        if (matchedWord) matchedWord.userCorrect = true;

        await this.recordPractice(left.id, true);

        if (session.matched.length === session.words.length) {
            setTimeout(() => this.showMatchingFinalResult(), 500);
        }
        // به‌روزرسانی progress bar
        this._pmUpdateMatchingProgress();
    } else {
        // اشتباه
        left.element.classList.add('wrong');
        right.element.classList.add('wrong');
        session.mistakes++;
        await this.recordPractice(left.id, false);

        // به‌روزرسانی progress bar
        this._pmUpdateMatchingProgress();

        setTimeout(() => {
            left.element.classList.remove('wrong', 'selected');
            right.element.classList.remove('wrong', 'selected');
        }, 500);
    }

    session.selectedLeft = null;
    session.selectedRight = null;
};

GermanDictionary.prototype._pmUpdateMatchingProgress = function() {
    const session = this.matchingSession;
    const total = session.words.length;
    const current = session.matched.length;
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    const correct = current;
    const incorrect = session.mistakes || 0;

    const fill = document.querySelector('.pm-match-progress .pm-progress-fill');
    if (fill) fill.style.width = pct + '%';

    const info = document.querySelector('.pm-match-progress .pm-progress-info');
    if (info) {
        info.innerHTML = '<span>' + (current + 1 > total ? total : current) + ' / ' + total + '</span>' +
            '<div class="pm-progress-stats">' +
                '<div class="pm-progress-stat"><div class="pm-progress-dot correct"></div>' + correct + '</div>' +
                '<div class="pm-progress-stat"><div class="pm-progress-dot incorrect"></div>' + incorrect + '</div>' +
            '</div>';
    }
};

GermanDictionary.prototype.showMatchingFinalResult = function() {
    this._pmInjectStyles();
    const session = this.matchingSession;
    const accuracy = session.words.length > 0
        ? Math.round(((session.words.length - session.mistakes) / session.words.length) * 100) : 0;
    const container = document.getElementById('practice-section');
    const self = this;

    container.innerHTML = '<div class="pm-root">' +
        '<div class="pm-rs-card">' +
            '<div class="pm-rs-title"><i class="fas fa-hand-peace"></i> نتایج تمرین تطابق</div>' +
            '<div class="pm-rs-circle" style="background: conic-gradient(#ef4444 0% ' + accuracy + '%, var(--pm-bg) ' + accuracy + '% 100%);">' +
                '<div class="pm-rs-circle-inner"><span class="pm-rs-circle-num">' + accuracy + '%</span></div>' +
            '</div>' +
            '<div class="pm-rs-stats">' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">جفت‌های درست</div><div class="pm-rs-stat-val" style="color:#10b981;">' + session.words.length + '</div></div>' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">اشتباهات</div><div class="pm-rs-stat-val" style="color:#f43f5e;">' + session.mistakes + '</div></div>' +
            '</div>' +
            '<div class="pm-rs-actions">' +
                '<button class="pm-btn pm-btn-danger" id="restart-matching-btn"><i class="fas fa-redo-alt"></i> تمرین مجدد</button>' +
                '<button class="pm-btn pm-btn-outline" id="back-to-practice-menu-btn"><i class="fas fa-arrow-right"></i> بازگشت</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.getElementById('restart-matching-btn').addEventListener('click', () => self.startMatchingPractice());
    document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
        self.renderPracticeOptions();
        self.showSection('practice-section');
    });
};

/* ============================================================
   تمرین جنسیت (Gender)
   ============================================================ */
GermanDictionary.prototype.startGenderPractice = async function() {
    const allWords = await this.getFilteredWordsForPractice();
    const nounWords = allWords.filter(w => w.type === 'noun' && w.gender);

    if (nounWords.length === 0) {
        this.showToast('هیچ اسمی با جنسیت مشخص برای تمرین وجود ندارد', 'warning');
        return;
    }

    this.genderSession = {
        words: nounWords,
        currentIndex: 0,
        score: 0,
        mistakes: 0
    };

    this.showGenderQuestion();
};

GermanDictionary.prototype.showGenderQuestion = function() {
    this._pmInjectStyles();
    if (this.genderSession.currentIndex >= this.genderSession.words.length) {
        this.showGenderFinalResult();
        return;
    }

    const word = this.genderSession.words[this.genderSession.currentIndex];
    const container = document.getElementById('practice-section');
    const self = this;

    const progress = this._pmBuildProgress(this.genderSession, '#3b82f6');

    container.innerHTML = '<div class="pm-root">' +
        '<div class="pm-head">' +
            '<h2><i class="fas fa-venus-mars"></i> تشخیص جنسیت</h2>' +
            '<span class="pm-badge" style="background:linear-gradient(135deg,#3b82f6,#2563eb);">' + (this.genderSession.currentIndex + 1) + ' / ' + this.genderSession.words.length + '</span>' +
        '</div>' +
        '<div class="pm-card">' +
            '<p style="text-align:center;color:var(--pm-muted);font-size:12px;margin:0 0 8px;">جنسیت این کلمه چیست؟</p>' +
            '<div style="text-align:center;font-size:32px;font-weight:800;color:var(--pm-text);margin-bottom:20px;direction:ltr;">' + this._pmEsc(word.german) + '</div>' +
            (word.persian ? '<div style="text-align:center;color:var(--pm-muted);font-size:14px;margin-bottom:20px;">' + this._pmEsc(word.persian) + '</div>' : '') +
            '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
                '<button class="pm-btn pm-gender-btn" data-gender="masculine" style="background:linear-gradient(135deg,#3b82f6,#2563eb);min-width:110px;"><span style="font-size:18px;font-weight:800;">der</span></button>' +
                '<button class="pm-btn pm-gender-btn" data-gender="feminine" style="background:linear-gradient(135deg,#ec4899,#db2777);min-width:110px;"><span style="font-size:18px;font-weight:800;">die</span></button>' +
                '<button class="pm-btn pm-gender-btn" data-gender="neuter" style="background:linear-gradient(135deg,#10b981,#059669);min-width:110px;"><span style="font-size:18px;font-weight:800;">das</span></button>' +
            '</div>' +
            progress +
        '</div>' +
    '</div>';

    document.querySelectorAll('.pm-gender-btn').forEach(btn => {
        btn.addEventListener('click', () => self.checkGenderAnswer(btn.dataset.gender));
    });
};

GermanDictionary.prototype.checkGenderAnswer = async function(selected) {
    const word = this.genderSession.words[this.genderSession.currentIndex];
    const isCorrect = word.gender === selected;

    await this.recordPractice(word.id, isCorrect);

    // ست کردن userCorrect برای progress bar
    this.genderSession.words[this.genderSession.currentIndex].userCorrect = isCorrect;

    if (isCorrect) {
        this.genderSession.score++;
    } else {
        this.genderSession.mistakes++;
        const sym = word.gender === 'masculine' ? 'der' : word.gender === 'feminine' ? 'die' : 'das';
        this.showToast('پاسخ صحیح: ' + sym + ' ' + word.german, 'error');
    }

    this.genderSession.currentIndex++;
    this.showGenderQuestion();
};

GermanDictionary.prototype.showGenderFinalResult = function() {
    this._pmInjectStyles();
    const accuracy = this.genderSession.words.length > 0
        ? Math.round((this.genderSession.score / this.genderSession.words.length) * 100) : 0;
    const container = document.getElementById('practice-section');
    const self = this;

    container.innerHTML = '<div class="pm-root">' +
        '<div class="pm-rs-card">' +
            '<div class="pm-rs-title"><i class="fas fa-venus-mars"></i> نتایج تشخیص جنسیت</div>' +
            '<div class="pm-rs-circle" style="background: conic-gradient(#3b82f6 0% ' + accuracy + '%, var(--pm-bg) ' + accuracy + '% 100%);">' +
                '<div class="pm-rs-circle-inner"><span class="pm-rs-circle-num">' + accuracy + '%</span></div>' +
            '</div>' +
            '<div class="pm-rs-stats">' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">تعداد لغات</div><div class="pm-rs-stat-val">' + this.genderSession.words.length + '</div></div>' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">پاسخ صحیح</div><div class="pm-rs-stat-val" style="color:#10b981;">' + this.genderSession.score + '</div></div>' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">اشتباهات</div><div class="pm-rs-stat-val" style="color:#f43f5e;">' + this.genderSession.mistakes + '</div></div>' +
            '</div>' +
            '<div class="pm-rs-actions">' +
                '<button class="pm-btn" style="background:linear-gradient(135deg,#3b82f6,#2563eb);" id="restart-gender-btn"><i class="fas fa-redo-alt"></i> تمرین مجدد</button>' +
                '<button class="pm-btn pm-btn-outline" id="back-to-practice-menu-btn"><i class="fas fa-arrow-right"></i> بازگشت</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.getElementById('restart-gender-btn').addEventListener('click', () => self.startGenderPractice());
    document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
        self.renderPracticeOptions();
        self.showSection('practice-section');
    });
};

/* ============================================================
   تمرین حروف اضافه (Prepositions)
   ============================================================ */
GermanDictionary.prototype.startPrepositionsPractice = async function() {
    const allWords = await this.getFilteredWordsForPractice();
    const prepWords = allWords.filter(w => w.type === 'preposition' || (w.examples && w.examples.length > 0));

    if (prepWords.length === 0) {
        this.showToast('هیچ حرف اضافه‌ای برای تمرین وجود ندارد', 'warning');
        return;
    }

    this.prepositionSession = {
        words: prepWords.slice(0, 10),
        currentIndex: 0,
        score: 0,
        mistakes: 0,
        questions: []
    };

    // ساخت سوالات
    const prepositions = ['in', 'auf', 'an', 'mit', 'für', 'zu', 'von', 'bei', 'nach', 'aus', 'über', 'unter', 'vor', 'hinter', 'neben'];
    this.prepositionSession.words.forEach(word => {
        const correctPrep = word.german.split(' ')[0] || prepositions[Math.floor(Math.random() * prepositions.length)];
        const options = [correctPrep];
        while (options.length < 4) {
            const rand = prepositions[Math.floor(Math.random() * prepositions.length)];
            if (!options.includes(rand)) options.push(rand);
        }
        this.prepositionSession.questions.push({
            word: word,
            correct: correctPrep,
            options: this.shuffleArray(options)
        });
    });

    this.showPrepositionQuestion();
};

GermanDictionary.prototype.showPrepositionQuestion = function() {
    this._pmInjectStyles();
    if (this.prepositionSession.currentIndex >= this.prepositionSession.questions.length) {
        this.showPrepositionResults();
        return;
    }

    const q = this.prepositionSession.questions[this.prepositionSession.currentIndex];
    const container = document.getElementById('practice-section');
    const self = this;

    const progress = this._pmBuildProgress({
        words: this.prepositionSession.questions,
        currentIndex: this.prepositionSession.currentIndex
    }, '#a855f7');

    let optionsHtml = '';
    q.options.forEach(opt => {
        optionsHtml += '<button class="pm-btn pm-prep-opt" data-prep="' + opt + '" style="background:linear-gradient(135deg,#a855f7,#9333ea);min-width:100px;">' + opt + '</button>';
    });

    container.innerHTML = '<div class="pm-root">' +
        '<div class="pm-head">' +
            '<h2><i class="fas fa-location-dot"></i> حروف اضافه</h2>' +
            '<span class="pm-badge" style="background:linear-gradient(135deg,#a855f7,#9333ea);">' + (this.prepositionSession.currentIndex + 1) + ' / ' + this.prepositionSession.questions.length + '</span>' +
        '</div>' +
        '<div class="pm-card">' +
            '<p style="text-align:center;color:var(--pm-muted);font-size:12px;margin:0 0 8px;">حرف اضافه صحیح را انتخاب کنید</p>' +
            '<div style="text-align:center;font-size:24px;font-weight:700;color:var(--pm-text);margin-bottom:20px;direction:ltr;">___ ' + this._pmEsc(q.word.german.replace(/^(in|auf|an|mit|für|zu|von|bei|nach|aus|über|unter|vor|hinter|neben)\s+/i, '')) + '</div>' +
            (q.word.persian ? '<div style="text-align:center;color:var(--pm-muted);font-size:14px;margin-bottom:20px;">' + this._pmEsc(q.word.persian) + '</div>' : '') +
            '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' + optionsHtml + '</div>' +
            progress +
        '</div>' +
    '</div>';

    document.querySelectorAll('.pm-prep-opt').forEach(btn => {
        btn.addEventListener('click', () => self.checkPrepositionAnswer(btn.dataset.prep));
    });
};

GermanDictionary.prototype.checkPrepositionAnswer = async function(selected) {
    const q = this.prepositionSession.questions[this.prepositionSession.currentIndex];
    const isCorrect = selected === q.correct;

    await this.recordPractice(`prep_${q.correct}`, isCorrect);

    // ست کردن userCorrect برای progress bar
    this.prepositionSession.questions[this.prepositionSession.currentIndex].userCorrect = isCorrect;

    if (isCorrect) {
        this.prepositionSession.score++;
    } else {
        this.prepositionSession.mistakes++;
        this.showToast('پاسخ صحیح: ' + q.correct, 'error');
    }

    this.prepositionSession.currentIndex++;
    this.showPrepositionQuestion();
};

GermanDictionary.prototype.showPrepositionResults = function() {
    this._pmInjectStyles();
    const accuracy = this.prepositionSession.questions.length > 0
        ? Math.round((this.prepositionSession.score / this.prepositionSession.questions.length) * 100) : 0;
    const container = document.getElementById('practice-section');
    const self = this;

    container.innerHTML = '<div class="pm-root">' +
        '<div class="pm-rs-card">' +
            '<div class="pm-rs-title"><i class="fas fa-location-dot"></i> نتایج حروف اضافه</div>' +
            '<div class="pm-rs-circle" style="background: conic-gradient(#a855f7 0% ' + accuracy + '%, var(--pm-bg) ' + accuracy + '% 100%);">' +
                '<div class="pm-rs-circle-inner"><span class="pm-rs-circle-num">' + accuracy + '%</span></div>' +
            '</div>' +
            '<div class="pm-rs-stats">' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">تعداد سوالات</div><div class="pm-rs-stat-val">' + this.prepositionSession.questions.length + '</div></div>' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">پاسخ صحیح</div><div class="pm-rs-stat-val" style="color:#10b981;">' + this.prepositionSession.score + '</div></div>' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">اشتباهات</div><div class="pm-rs-stat-val" style="color:#f43f5e;">' + this.prepositionSession.mistakes + '</div></div>' +
            '</div>' +
            '<div class="pm-rs-actions">' +
                '<button class="pm-btn" style="background:linear-gradient(135deg,#a855f7,#9333ea);" id="restart-prep-btn"><i class="fas fa-redo-alt"></i> تمرین مجدد</button>' +
                '<button class="pm-btn pm-btn-outline" id="back-to-practice-menu-btn"><i class="fas fa-arrow-right"></i> بازگشت</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.getElementById('restart-prep-btn').addEventListener('click', () => self.startPrepositionsPractice());
    document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
        self.renderPracticeOptions();
        self.showSection('practice-section');
    });
};

/* ============================================================
   تمرین شنیداری (Listening) — showListeningExercise اضافه شد!
   ============================================================ */
GermanDictionary.prototype.startListeningPractice = async function() {
    const wordsToPractice = await this.getWordsForPractice();

    if (wordsToPractice.length === 0) return;

    this.listeningSession = {
        words: wordsToPractice,
        currentIndex: 0,
        score: 0,
        attempts: 0
    };

    this.showListeningExercise();
};

// ★ این متد قبلاً گم شده بود — حالا اضافه شد
GermanDictionary.prototype.showListeningExercise = function() {
    this._pmInjectStyles();
    if (this.listeningSession.currentIndex >= this.listeningSession.words.length) {
        this.showListeningResults();
        return;
    }

    const word = this.listeningSession.words[this.listeningSession.currentIndex];
    const container = document.getElementById('practice-section');
    const self = this;

    const currentWordData = this.listeningSession.words[this.listeningSession.currentIndex];
    const isAnswered = currentWordData.userCorrect === true || currentWordData.userCorrect === false;

    const progress = this._pmBuildProgress(this.listeningSession, '#06b6d4');

    container.innerHTML = '<div class="pm-root">' +
        '<div class="pm-head">' +
            '<h2><i class="fas fa-headphones"></i> تمرین شنیداری</h2>' +
            '<span class="pm-badge" style="background:linear-gradient(135deg,#06b6d4,#0891b2);">' + (this.listeningSession.currentIndex + 1) + ' / ' + this.listeningSession.words.length + '</span>' +
        '</div>' +
        '<div class="pm-card">' +
            '<div class="pm-ls-play-row">' +
                '<button class="pm-ls-play-btn pm-ls-play-start" id="play-pronunciation-btn"><i class="fas fa-volume-high pm-ls-play-icon"></i> گوش دادن</button>' +
                '<button class="pm-ls-play-btn pm-ls-play-replay" id="replay-pronunciation-btn"><i class="fas fa-rotate-right"></i> تکرار</button>' +
            '</div>' +
            '<input type="text" class="pm-input" id="listening-answer" placeholder="لغت آلمانی را تایپ کنید..." autocomplete="off" ' + (isAnswered ? 'disabled' : '') + '>' +
            '<div class="pm-fc-actions" style="margin-top:16px;">' +
                '<button class="pm-btn pm-btn-success" id="check-listening-answer-btn" ' + (isAnswered ? 'disabled' : '') + '><i class="fas fa-check"></i> بررسی</button>' +
                '<button class="pm-btn pm-btn-slate" id="skip-listening-btn"><i class="fas fa-forward"></i> رد شدن</button>' +
            '</div>' +
            progress +
        '</div>' +
    '</div>';

    // پخش خودکار اولین بار
    setTimeout(() => {
        try { self.playPronunciation(word.german); } catch(e) {}
    }, 300);

    this.setupListeningExerciseEventListeners(word);
};

GermanDictionary.prototype.setupListeningExerciseEventListeners = function(word) {
    const self = this;
    document.getElementById('play-pronunciation-btn')?.addEventListener('click', () => self.playPronunciation(word.german));
    document.getElementById('replay-pronunciation-btn')?.addEventListener('click', () => self.playPronunciation(word.german));
    document.getElementById('check-listening-answer-btn')?.addEventListener('click', () => self.checkListeningAnswer());
    document.getElementById('skip-listening-btn')?.addEventListener('click', () => self.skipListeningExercise());
    document.getElementById('listening-answer')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') self.checkListeningAnswer();
    });
    setTimeout(() => { document.getElementById('listening-answer')?.focus(); }, 400);
};

GermanDictionary.prototype.checkListeningAnswer = async function() {
    const answerInput = document.getElementById('listening-answer');
    const userAnswer = answerInput.value.trim();
    const currentWord = this.listeningSession.words[this.listeningSession.currentIndex];

    if (!userAnswer) {
        this.showToast('لطفاً پاسخ را وارد کنید', 'warning');
        return;
    }

    const normalizedUser = this.normalizeAnswer(userAnswer);
    const normalizedCorrect = this.normalizeAnswer(currentWord.german);
    const isCorrect = normalizedUser === normalizedCorrect;

    this.listeningSession.attempts++;
    await this.recordPractice(currentWord.id, isCorrect);
    this.listeningSession.words[this.listeningSession.currentIndex].userCorrect = isCorrect;

    // حذف feedback قبلی
    const oldFeedback = document.querySelector('.pm-feedback');
    if (oldFeedback) oldFeedback.remove();

    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'pm-feedback ' + (isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
        this.listeningSession.score++;
        answerInput.classList.add('correct');
        answerInput.disabled = true;
        document.getElementById('check-listening-answer-btn').disabled = true;
        feedbackDiv.innerHTML = '<i class="fas fa-check-circle"></i> پاسخ صحیح! آفرین!';
    } else {
        answerInput.classList.add('incorrect');
        answerInput.disabled = true;
        document.getElementById('check-listening-answer-btn').disabled = true;
        feedbackDiv.innerHTML = '<i class="fas fa-times-circle"></i> پاسخ صحیح: <strong>' + this._pmEsc(currentWord.german) + '</strong>';
    }

    answerInput.parentNode.appendChild(feedbackDiv);

    const self = this;
    setTimeout(() => {
        self.listeningSession.currentIndex++;
        self.showListeningExercise();
    }, 2000);
};

GermanDictionary.prototype.skipListeningExercise = function() {
    this.listeningSession.currentIndex++;
    this.showListeningExercise();
};

GermanDictionary.prototype.showListeningResults = function() {
    this._pmInjectStyles();
    const accuracy = this.listeningSession.words.length > 0
        ? Math.round((this.listeningSession.score / this.listeningSession.words.length) * 100) : 0;
    const container = document.getElementById('practice-section');
    const self = this;

    container.innerHTML = '<div class="pm-root">' +
        '<div class="pm-rs-card">' +
            '<div class="pm-rs-title"><i class="fas fa-headphones"></i> نتایج تمرین شنیداری</div>' +
            '<div class="pm-rs-circle" style="background: conic-gradient(#06b6d4 0% ' + accuracy + '%, var(--pm-bg) ' + accuracy + '% 100%);">' +
                '<div class="pm-rs-circle-inner"><span class="pm-rs-circle-num">' + accuracy + '%</span></div>' +
            '</div>' +
            '<div class="pm-rs-stats">' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">تعداد لغات</div><div class="pm-rs-stat-val">' + this.listeningSession.words.length + '</div></div>' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">پاسخ صحیح</div><div class="pm-rs-stat-val" style="color:#10b981;">' + this.listeningSession.score + '</div></div>' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">تعداد تلاش</div><div class="pm-rs-stat-val">' + this.listeningSession.attempts + '</div></div>' +
            '</div>' +
            '<div class="pm-rs-actions">' +
                '<button class="pm-btn" style="background:linear-gradient(135deg,#06b6d4,#0891b2);" id="restart-listening-btn"><i class="fas fa-redo-alt"></i> تمرین مجدد</button>' +
                '<button class="pm-btn pm-btn-outline" id="back-to-practice-menu-btn"><i class="fas fa-arrow-right"></i> بازگشت</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.getElementById('restart-listening-btn').addEventListener('click', () => self.startListeningPractice());
    document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
        self.renderPracticeOptions();
        self.showSection('practice-section');
    });
};

/* ============================================================
   تمرین نوشتاری (Writing) — progress bar + showWritingResults
   ============================================================ */
GermanDictionary.prototype.startWritingPractice = async function() {
    const wordsToPractice = await this.getWordsForPractice();
    if (wordsToPractice.length === 0) return;
    this.writingSession = {
        words: wordsToPractice,
        currentIndex: 0,
        score: 0
    };
    this.showWritingExercise();
};

GermanDictionary.prototype.showWritingExercise = function() {
    this._pmInjectStyles();
    if (this.writingSession.currentIndex >= this.writingSession.words.length) {
        this.showWritingResults();
        return;
    }

    const word = this.writingSession.words[this.writingSession.currentIndex];
    const container = document.getElementById('practice-section');
    const self = this;

    let genderHtml = '';
    if (word.gender) {
        genderHtml = '<span class="pm-gender ' + word.gender + '">' + this.getGenderSymbol(word.gender) + '</span>';
    }

    const progress = this._pmBuildProgress(this.writingSession, '#8b5cf6');

    container.innerHTML = '<div class="pm-root">' +
        '<div class="pm-head">' +
            '<h2><i class="fas fa-keyboard"></i> تمرین نوشتاری</h2>' +
            '<span class="pm-badge" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);">' + (this.writingSession.currentIndex + 1) + ' / ' + this.writingSession.words.length + '</span>' +
        '</div>' +
        '<div class="pm-card">' +
            '<div class="pm-wr-question">' +
                '<div class="pm-wr-question-label">ترجمه فارسی</div>' +
                '<div class="pm-wr-question-text">' + this._pmEsc(word.persian) + '</div>' +
                (genderHtml ? '<div class="pm-wr-gender-row">' + genderHtml + '</div>' : '') +
            '</div>' +
            '<input type="text" class="pm-input" id="writing-answer" placeholder="ترجمه آلمانی را تایپ کنید..." autocomplete="off" style="direction:ltr;">' +
            '<div class="pm-fc-actions" style="margin-top:16px;">' +
                '<button class="pm-btn pm-btn-success" id="check-writing-answer-btn"><i class="fas fa-check"></i> بررسی</button>' +
                '<button class="pm-btn pm-btn-warning" id="show-hint-btn"><i class="fas fa-lightbulb"></i> راهنما</button>' +
            '</div>' +
            progress +
        '</div>' +
    '</div>';

    this.setupWritingExerciseEventListeners(word);
};

GermanDictionary.prototype.setupWritingExerciseEventListeners = function(word) {
    const self = this;
    const checkBtn = document.getElementById('check-writing-answer-btn');
    const hintBtn = document.getElementById('show-hint-btn');
    const answerInput = document.getElementById('writing-answer');
    if (checkBtn) checkBtn.addEventListener('click', () => self.checkWritingAnswer());
    if (hintBtn) hintBtn.addEventListener('click', () => {
        const hint = word.german.substring(0, Math.min(3, word.german.length)) + '...';
        self.showToast('💡 راهنما: ' + hint, 'info');
    });
    if (answerInput) {
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); self.checkWritingAnswer(); }
        });
        setTimeout(() => answerInput.focus(), 300);
    }
};

GermanDictionary.prototype.checkWritingAnswer = async function() {
    const answerInput = document.getElementById('writing-answer');
    const userAnswer = answerInput.value.trim();
    const currentWord = this.writingSession.words[this.writingSession.currentIndex];

    if (!userAnswer) {
        this.showToast('لطفاً پاسخ را وارد کنید', 'warning');
        return;
    }

    const normalizedUser = this.normalizeAnswer(userAnswer);
    const normalizedCorrect = this.normalizeAnswer(currentWord.german);
    const isCorrect = normalizedUser === normalizedCorrect;

    await this.recordPractice(currentWord.id, isCorrect);
    this.writingSession.words[this.writingSession.currentIndex].userCorrect = isCorrect;

    // حذف feedback قبلی
    const oldFeedback = document.querySelector('.pm-feedback');
    if (oldFeedback) oldFeedback.remove();

    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'pm-feedback ' + (isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
        this.writingSession.score++;
        answerInput.classList.add('correct');
        answerInput.disabled = true;
        document.getElementById('check-writing-answer-btn').disabled = true;
        feedbackDiv.innerHTML = '<i class="fas fa-check-circle"></i> پاسخ صحیح! آفرین!';
    } else {
        answerInput.classList.add('incorrect');
        answerInput.disabled = true;
        document.getElementById('check-writing-answer-btn').disabled = true;
        feedbackDiv.innerHTML = '<i class="fas fa-times-circle"></i> پاسخ صحیح: <strong>' + this._pmEsc(currentWord.german) + '</strong>';
    }

    answerInput.parentNode.appendChild(feedbackDiv);

    const self = this;
    setTimeout(() => {
        self.writingSession.currentIndex++;
        self.showWritingExercise();
    }, 2000);
};

// ★ این متد قبلاً گم شده بود — حالا اضافه شد
GermanDictionary.prototype.showWritingResults = function() {
    this._pmInjectStyles();
    const accuracy = this.writingSession.words.length > 0
        ? Math.round((this.writingSession.score / this.writingSession.words.length) * 100) : 0;
    const container = document.getElementById('practice-section');
    const self = this;

    container.innerHTML = '<div class="pm-root">' +
        '<div class="pm-rs-card">' +
            '<div class="pm-rs-title"><i class="fas fa-keyboard"></i> نتایج تمرین نوشتاری</div>' +
            '<div class="pm-rs-circle" style="background: conic-gradient(#8b5cf6 0% ' + accuracy + '%, var(--pm-bg) ' + accuracy + '% 100%);">' +
                '<div class="pm-rs-circle-inner"><span class="pm-rs-circle-num">' + accuracy + '%</span></div>' +
            '</div>' +
            '<div class="pm-rs-stats">' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">تعداد لغات</div><div class="pm-rs-stat-val">' + this.writingSession.words.length + '</div></div>' +
                '<div class="pm-rs-stat"><div class="pm-rs-stat-lbl">پاسخ صحیح</div><div class="pm-rs-stat-val" style="color:#10b981;">' + this.writingSession.score + '</div></div>' +
            '</div>' +
            '<div class="pm-rs-actions">' +
                '<button class="pm-btn" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);" id="restart-writing-btn"><i class="fas fa-redo-alt"></i> تمرین مجدد</button>' +
                '<button class="pm-btn pm-btn-outline" id="back-to-practice-menu-btn"><i class="fas fa-arrow-right"></i> بازگشت</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.getElementById('restart-writing-btn').addEventListener('click', () => self.startWritingPractice());
    document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
        self.renderPracticeOptions();
        self.showSection('practice-section');
    });
};
