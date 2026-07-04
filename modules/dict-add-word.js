/* ================================================================
   dict-add-word.js — فرم افزودن لغت (نسخه مدرن ۲۰۲۵)
   ----------------------------------------------------------------
   این فایل شامل:
   • renderAddWordSection (بازنویسی کامل با استایل inline مدرن)
   • addWord (ثبت لغت در دیتابیس)
   • clearAddWordForm (پاک کردن فرم)
   • toggleTypeFields (تعویض پنل نوع کلمه)
   • updateFieldCount (شمارش فیلدهای تکمیل‌شده)
   • setupQuickSearch (جستجوی سریع)
   • دکمه "پر کردن با هوش مصنوعی" هنگام blur از فیلد آلمانی
   ================================================================ */

/* ============================================================
   تزریق استایل‌ها (یک بار)
   ============================================================ */
function _awInjectStyles() {
    if (document.getElementById('aw-pro-styles')) return;
    const style = document.createElement('style');
    style.id = 'aw-pro-styles';
    style.textContent = `
        .aw-wrap {
            --aw-primary: #4361ee; --aw-primary-d: #3a56d4;
            --aw-emerald: #10b981; --aw-emerald-d: #059669;
            --aw-violet: #8b5cf6; --aw-violet-d: #6d28d9;
            --aw-amber: #f59e0b; --aw-amber-d: #d97706;
            --aw-rose: #f43f5e; --aw-rose-d: #e11d48;
            --aw-cyan: #06b6d4; --aw-slate: #64748b;
            --aw-ink: #0f172a; --aw-ink-2: #1e293b; --aw-slate-600: #475569;
            --aw-muted: #64748b; --aw-line: #e2e8f0; --aw-line-2: #f1f5f9;
            --aw-card: #ffffff; --aw-card-2: #f8fafc;
            --aw-error: #ef4444; --aw-success: #10b981;
            --aw-shadow-sm: 0 1px 2px rgba(15,23,42,.04);
            --aw-shadow: 0 4px 12px rgba(15,23,42,.06);
            --aw-shadow-lg: 0 12px 40px rgba(15,23,42,.10);
            --aw-radius: 20px; --aw-radius-s: 14px; --aw-radius-xs: 10px;
            font-family: 'Vazirmatn', Tahoma, sans-serif;
            color: var(--aw-ink); line-height: 1.6;
        }
        body.dark-mode .aw-wrap {
            --aw-ink: #f1f5f9; --aw-ink-2: #e2e8f0; --aw-slate-600: #cbd5e1;
            --aw-muted: #94a3b8; --aw-line: #1e293b; --aw-line-2: #1e293b;
            --aw-card: #1e293b; --aw-card-2: #0f172a;
        }
        .aw-wrap i, .aw-wrap i::before, .aw-wrap [class^="fa-"]::before, .aw-wrap [class*=" fa-"]::before {
            font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
        }
        .aw-wrap i.fas, .aw-wrap i.fa-solid { font-weight: 900 !important; }
        .aw-wrap i.far, .aw-wrap i.fa-regular { font-weight: 400 !important; }

        .aw-card { background: var(--aw-card); border: 1px solid var(--aw-line); border-radius: var(--aw-radius); box-shadow: var(--aw-shadow); overflow: hidden; }
        .aw-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #134e4a 100%); color: #f8fafc; padding: 24px 26px; position: relative; overflow: hidden; }
        .aw-header::before, .aw-header::after { content: ""; position: absolute; border-radius: 50%; filter: blur(50px); pointer-events: none; animation: aw-float 10s ease-in-out infinite; }
        .aw-header::before { width: 240px; height: 240px; background: radial-gradient(circle, rgba(16,185,129,.4), transparent 70%); top: -100px; right: -60px; }
        .aw-header::after { width: 200px; height: 200px; background: radial-gradient(circle, rgba(139,92,246,.35), transparent 70%); bottom: -80px; left: -40px; animation-delay: -5s; }
        @keyframes aw-float { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(15px,-15px) scale(1.1); } }
        .aw-header-inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
        .aw-header h2 { margin: 0; font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 12px; letter-spacing: -0.3px; }
        .aw-header h2 .aw-h-ic { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(255,255,255,.15); backdrop-filter: blur(10px); font-size: 17px; box-shadow: 0 4px 12px rgba(0,0,0,.15); }
        .aw-header .aw-sub { margin: 6px 0 0; font-size: 12px; opacity: .8; font-weight: 500; }
        .aw-badges { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .aw-badge { padding: 6px 13px; border-radius: 999px; font-size: 12px; font-weight: 700; color: #fff; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.12); }
        .aw-badge.type { background: linear-gradient(135deg, var(--aw-violet), var(--aw-violet-d)); border-color: transparent; }
        .aw-badge.count { background: rgba(255,255,255,.1); }
        .aw-ai-btn { padding: 7px 14px; border: 1px solid rgba(16,185,129,.4); border-radius: 999px; background: linear-gradient(135deg, rgba(16,185,129,.25), rgba(6,182,212,.2)); color: #fff; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; display: none; align-items: center; gap: 6px; transition: all .2s ease; backdrop-filter: blur(10px); }
        .aw-ai-btn:hover { transform: translateY(-1px); background: linear-gradient(135deg, rgba(16,185,129,.35), rgba(6,182,212,.3)); box-shadow: 0 4px 12px rgba(16,185,129,.3); }
        .aw-ai-btn.loading { pointer-events: none; opacity: .8; }
        .aw-ai-btn .aw-spinner { display: inline-block; animation: aw-spin 1s linear infinite; }
        @keyframes aw-spin { to { transform: rotate(360deg); } }

        .aw-body { padding: 24px 26px; }
        .aw-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
        @media (max-width: 640px) { .aw-form-row { grid-template-columns: 1fr; gap: 14px; } }
        .aw-field { display: flex; flex-direction: column; gap: 6px; }
        .aw-label { font-size: 13px; font-weight: 700; color: var(--aw-slate-600); display: flex; align-items: center; gap: 6px; }
        .aw-label i { color: var(--aw-primary); font-size: 12px; }
        .aw-label .aw-required { color: var(--aw-rose); }
        .aw-label .aw-hint-inline { margin-inline-start: auto; font-size: 10px; font-weight: 600; color: var(--aw-muted); background: var(--aw-line-2); padding: 2px 8px; border-radius: 999px; }
        .aw-input, .aw-textarea { width: 100%; padding: 12px 15px; border: 1.5px solid var(--aw-line); border-radius: var(--aw-radius-s); background: var(--aw-card-2); color: var(--aw-ink); font-family: inherit; font-size: 14px; font-weight: 500; transition: all .25s ease; outline: none; }
        .aw-input::placeholder, .aw-textarea::placeholder { color: var(--aw-muted); font-weight: 400; }
        .aw-input:focus, .aw-textarea:focus { border-color: var(--aw-primary); background: var(--aw-card); box-shadow: 0 0 0 4px rgba(67,97,238,.12); }
        .aw-input.error, .aw-textarea.error { border-color: var(--aw-error); box-shadow: 0 0 0 4px rgba(239,68,68,.12); }
        .aw-input.success, .aw-textarea.success { border-color: var(--aw-success); }
        .aw-input.ltr, .aw-textarea.ltr { direction: ltr; text-align: left; font-family: 'Segoe UI', system-ui, sans-serif; }
        .aw-textarea { resize: vertical; min-height: 60px; }
        .aw-hint { font-size: 11px; color: var(--aw-muted); display: flex; align-items: center; gap: 5px; font-weight: 500; }
        .aw-hint i { font-size: 10px; }
        .aw-error-msg { font-size: 11px; color: var(--aw-error); font-weight: 600; display: none; align-items: center; gap: 4px; }
        .aw-error-msg.visible { display: flex; }

        .aw-type-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
        @media (max-width: 768px) { .aw-type-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 420px) { .aw-type-grid { grid-template-columns: repeat(2, 1fr); } }
        .aw-type-card { padding: 14px 10px; border: 1.5px solid var(--aw-line); border-radius: var(--aw-radius-s); background: var(--aw-card-2); cursor: pointer; text-align: center; transition: all .25s ease; display: flex; flex-direction: column; align-items: center; gap: 5px; position: relative; overflow: hidden; }
        .aw-type-card::before { content: ""; position: absolute; inset: 0; background: linear-gradient(135deg, var(--aw-type-color, var(--aw-primary)), transparent); opacity: 0; transition: opacity .3s ease; }
        .aw-type-card > * { position: relative; z-index: 1; }
        .aw-type-card:hover { border-color: var(--aw-type-color, var(--aw-primary)); transform: translateY(-2px); box-shadow: 0 6px 16px color-mix(in srgb, var(--aw-type-color, #4361ee) 20%, transparent); }
        .aw-type-card.active { border-color: transparent; color: #fff; }
        .aw-type-card.active::before { opacity: 1; }
        .aw-type-card.active .aw-type-ic, .aw-type-card.active .aw-type-name, .aw-type-card.active .aw-type-sub { color: #fff; }
        .aw-type-ic { font-size: 20px; color: var(--aw-type-color, var(--aw-primary)); transition: color .25s ease; }
        .aw-type-name { font-size: 13px; font-weight: 700; color: var(--aw-ink); }
        .aw-type-sub { font-size: 10px; color: var(--aw-muted); font-weight: 500; }

        .aw-fields-panel { background: var(--aw-card-2); border: 1px solid var(--aw-line); border-radius: var(--aw-radius-s); padding: 18px; margin-bottom: 18px; animation: aw-slide-down .3s ease; }
        @keyframes aw-slide-down { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .aw-fields-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px dashed var(--aw-line); }
        .aw-fields-head .aw-fh-ic { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: linear-gradient(135deg, var(--aw-primary), var(--aw-violet-d)); color: #fff; font-size: 14px; }
        .aw-fields-head .aw-fh-title { font-size: 14px; font-weight: 700; color: var(--aw-ink); }
        .aw-fields-head .aw-fh-sub { font-size: 11px; color: var(--aw-muted); }

        .aw-gender-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .aw-gender-btn { padding: 10px 8px; border: 1.5px solid var(--aw-line); border-radius: var(--aw-radius-xs); background: var(--aw-card); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 700; color: var(--aw-slate-600); transition: all .2s ease; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .aw-gender-btn:hover { border-color: var(--aw-g-color, var(--aw-primary)); transform: translateY(-1px); }
        .aw-gender-btn.active { background: var(--aw-g-color, var(--aw-primary)); color: #fff; border-color: transparent; box-shadow: 0 4px 10px color-mix(in srgb, var(--aw-g-color, #4361ee) 30%, transparent); }
        .aw-gender-btn.active .aw-g-de { opacity: 1; }
        .aw-gender-btn .aw-g-de { font-weight: 800; opacity: .7; }
        .aw-gender-btn .aw-g-label { font-size: 11px; font-weight: 500; }

        .aw-radio-grid { display: flex; gap: 8px; flex-wrap: wrap; }
        .aw-radio-btn { flex: 1; min-width: 80px; padding: 10px 14px; border: 1.5px solid var(--aw-line); border-radius: var(--aw-radius-xs); background: var(--aw-card); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; color: var(--aw-slate-600); text-align: center; transition: all .2s ease; }
        .aw-radio-btn:hover { border-color: var(--aw-cyan); }
        .aw-radio-btn.active { background: linear-gradient(135deg, var(--aw-cyan), #0891b2); color: #fff; border-color: transparent; }

        .aw-switch-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--aw-card); border: 1px solid var(--aw-line); border-radius: var(--aw-radius-xs); }
        .aw-switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
        .aw-switch input { opacity: 0; width: 0; height: 0; }
        .aw-switch .aw-slider { position: absolute; inset: 0; background: var(--aw-line); border-radius: 999px; cursor: pointer; transition: background .3s ease; }
        .aw-switch .aw-slider::before { content: ""; position: absolute; width: 18px; height: 18px; top: 3px; right: 3px; background: #fff; border-radius: 50%; transition: transform .3s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 2px 4px rgba(0,0,0,.2); }
        .aw-switch input:checked + .aw-slider { background: linear-gradient(135deg, var(--aw-emerald), var(--aw-emerald-d)); }
        .aw-switch input:checked + .aw-slider::before { transform: translateX(-20px); }
        .aw-switch-label { font-size: 13px; font-weight: 600; color: var(--aw-slate-600); }

        .aw-select { width: 100%; padding: 12px 15px; border: 1.5px solid var(--aw-line); border-radius: var(--aw-radius-s); background: var(--aw-card-2); color: var(--aw-ink); font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; outline: none; transition: all .25s ease; appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: left 12px center; background-size: 16px; padding-left: 38px; }
        .aw-select:focus { border-color: var(--aw-primary); background-color: var(--aw-card); box-shadow: 0 0 0 4px rgba(67,97,238,.12); }

        .aw-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 22px; padding-top: 20px; border-top: 1px solid var(--aw-line); }
        .aw-btn { padding: 13px 26px; border: none; border-radius: var(--aw-radius-s); font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .25s ease; display: inline-flex; align-items: center; gap: 8px; flex: 1; min-width: 140px; justify-content: center; }
        .aw-btn-primary { background: linear-gradient(135deg, var(--aw-emerald), var(--aw-emerald-d)); color: #fff; box-shadow: 0 6px 16px rgba(16,185,129,.3); }
        .aw-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(16,185,129,.4); filter: brightness(1.05); }
        .aw-btn-ghost { background: var(--aw-card); color: var(--aw-slate-600); border: 1.5px solid var(--aw-line); }
        .aw-btn-ghost:hover { border-color: var(--aw-rose); color: var(--aw-rose); background: rgba(239,68,68,.05); }
        .aw-kbd-hint { margin-top: 14px; padding: 10px 14px; background: var(--aw-card-2); border: 1px dashed var(--aw-line); border-radius: var(--aw-radius-xs); font-size: 11px; color: var(--aw-muted); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-weight: 500; }
        .aw-kbd-hint kbd { background: var(--aw-card); border: 1px solid var(--aw-line); border-radius: 5px; padding: 1px 6px; font-family: inherit; font-size: 10px; font-weight: 700; color: var(--aw-slate-600); }
    `;
    document.head.appendChild(style);
}

/* ============================================================
   رندر فرم (بازنویسی کامل)
   ============================================================ */
GermanDictionary.prototype.renderAddWordSection = function() {
    _awInjectStyles();
    const section = document.getElementById('add-word-section');
    if (!section) return;

    const types = [
        { type: 'noun',        icon: 'fa-book',             name: 'اسم',         sub: 'Nomen',       color: '#8b5cf6' },
        { type: 'verb',        icon: 'fa-person-running',   name: 'فعل',         sub: 'Verb',        color: '#f59e0b' },
        { type: 'adjective',   icon: 'fa-palette',          name: 'صفت',         sub: 'Adjektiv',    color: '#06b6d4' },
        { type: 'adverb',      icon: 'fa-clock',            name: 'قید',         sub: 'Adverb',      color: '#84cc16' },
        { type: 'preposition', icon: 'fa-link',             name: 'حرف اضافه',   sub: 'Präposition', color: '#f97316' },
        { type: 'other',       icon: 'fa-ellipsis',         name: 'سایر',        sub: 'Andere',      color: '#64748b' }
    ];

    section.innerHTML = `
    <div class="aw-wrap">
        <div class="aw-card">
            <div class="aw-header">
                <div class="aw-header-inner">
                    <div>
                        <h2><span class="aw-h-ic"><i class="fas fa-circle-plus"></i></span> افزودن لغت جدید</h2>
                        <p class="aw-sub">لغت آلمانی را با تمام جزئیات ثبت کنید</p>
                    </div>
                    <div class="aw-badges">
                        <span class="aw-badge type" id="word-type-badge">📘 اسم</span>
                        <span class="aw-badge count" id="field-count-badge">۰ فیلد تکمیل شده</span>
                        <button id="ai-fill-all-btn" class="aw-ai-btn" type="button">
                            <i class="fas fa-robot"></i> پر کردن با هوش مصنوعی
                        </button>
                    </div>
                </div>
            </div>
            <div class="aw-body">
                <div class="aw-form-row">
                    <div class="aw-field">
                        <label class="aw-label" for="german-word">
                            <i class="fas fa-language"></i> لغت آلمانی
                            <span class="aw-required">*</span>
                            <span class="aw-hint-inline" id="german-word-counter">۰</span>
                        </label>
                        <input type="text" id="german-word" class="aw-input modern-input ltr" placeholder="مثال: der Hund, lernen, schön" autocomplete="off" maxlength="100">
                        <div class="aw-hint"><i class="fas fa-info-circle"></i> با حرف بزرگ برای اسم، کوچک برای فعل/صفت</div>
                        <div class="aw-error-msg" id="german-word-error"><i class="fas fa-exclamation-circle"></i> لغت آلمانی الزامی است</div>
                    </div>
                    <div class="aw-field">
                        <label class="aw-label" for="persian-meaning">
                            <i class="fas fa-pencil"></i> معنی فارسی
                            <span class="aw-required">*</span>
                            <span class="aw-hint-inline" id="persian-meaning-counter">۰</span>
                        </label>
                        <input type="text" id="persian-meaning" class="aw-input modern-input" placeholder="مثال: سگ، یاد گرفتن، زیبا" autocomplete="off" maxlength="100">
                        <div class="aw-error-msg" id="persian-meaning-error"><i class="fas fa-exclamation-circle"></i> معنی فارسی الزامی است</div>
                    </div>
                </div>

                <div class="aw-field" style="margin-bottom:18px;">
                    <label class="aw-label"><i class="fas fa-tag"></i> نوع کلمه</label>
                    <div class="aw-type-grid type-cards">
                        ${types.map(t => `
                            <div class="aw-type-card type-card ${t.type === 'noun' ? 'active' : ''}" data-type="${t.type}" style="--aw-type-color:${t.color}">
                                <i class="fas ${t.icon} aw-type-ic"></i>
                                <span class="aw-type-name">${t.name}</span>
                                <small class="aw-type-sub">${t.sub}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div id="noun-fields" class="aw-fields-panel type-fields-card" style="--aw-type-color:#8b5cf6">
                    <div class="aw-fields-head">
                        <div class="aw-fh-ic"><i class="fas fa-venus-mars"></i></div>
                        <div><div class="aw-fh-title">اطلاعات اسم</div><div class="aw-fh-sub">Nomen Details</div></div>
                    </div>
                    <div class="aw-form-row">
                        <div class="aw-field">
                            <label class="aw-label">جنسیت</label>
                            <div class="aw-gender-grid">
                                <button type="button" class="aw-gender-btn gender-option masculine active" data-gender="masculine" style="--aw-g-color:#3b82f6"><span class="aw-g-de">der</span><span class="aw-g-label">مذکر</span></button>
                                <button type="button" class="aw-gender-btn gender-option feminine" data-gender="feminine" style="--aw-g-color:#ec4899"><span class="aw-g-de">die</span><span class="aw-g-label">مونث</span></button>
                                <button type="button" class="aw-gender-btn gender-option neuter" data-gender="neuter" style="--aw-g-color:#10b981"><span class="aw-g-de">das</span><span class="aw-g-label">خنثی</span></button>
                            </div>
                        </div>
                        <div class="aw-field">
                            <label class="aw-label" for="noun-plural"><i class="fas fa-copy"></i> جمع (Plural)</label>
                            <input type="text" id="noun-plural" class="aw-input modern-input ltr" placeholder="مثال: Hunde, Häuser, Autos" maxlength="100">
                            <div class="aw-hint"><i class="fas fa-info-circle"></i> پسوندهای رایج: -e, -er, -n, -s, -̈e</div>
                        </div>
                    </div>
                </div>

                <div id="verb-fields" class="aw-fields-panel type-fields-card" style="display:none; --aw-type-color:#f59e0b">
                    <div class="aw-fields-head">
                        <div class="aw-fh-ic" style="background:linear-gradient(135deg,#f59e0b,#d97706)"><i class="fas fa-table"></i></div>
                        <div><div class="aw-fh-title">صرف فعل</div><div class="aw-fh-sub">Konjugation</div></div>
                    </div>
                    <div class="aw-form-row">
                        <div class="aw-field"><label class="aw-label" for="verb-present">Präsens (حال ساده)</label><input type="text" id="verb-present" class="aw-input modern-input ltr" placeholder="ich lerne, du lernst, er lernt..." maxlength="200"></div>
                    </div>
                    <div class="aw-form-row">
                        <div class="aw-field"><label class="aw-label" for="verb-past">Präteritum (گذشته ساده)</label><input type="text" id="verb-past" class="aw-input modern-input ltr" placeholder="ich lernte, du lerntest..." maxlength="200"></div>
                        <div class="aw-field"><label class="aw-label" for="verb-perfect">Perfekt (گذشته کامل)</label><input type="text" id="verb-perfect" class="aw-input modern-input ltr" placeholder="habe gelernt, bin gegangen" maxlength="200"></div>
                    </div>
                    <div class="aw-form-row">
                        <div class="aw-field"><label class="aw-label" for="verb-future">Futur I (آینده)</label><input type="text" id="verb-future" class="aw-input modern-input ltr" placeholder="ich werde lernen" maxlength="200"></div>
                        <div class="aw-field"><label class="aw-label" for="verb-konjunktiv">Konjunktiv II (التزامی)</label><input type="text" id="verb-konjunktiv" class="aw-input modern-input ltr" placeholder="würde lernen, hätte" maxlength="200"></div>
                    </div>
                    <div class="aw-form-row">
                        <div class="aw-field">
                            <label class="aw-label">فعل کمکی (Hilfsverb)</label>
                            <div class="aw-radio-grid helper-selector">
                                <button type="button" class="aw-radio-btn helper-option active" data-helper="haben">haben</button>
                                <button type="button" class="aw-radio-btn helper-option" data-helper="sein">sein</button>
                                <button type="button" class="aw-radio-btn helper-option" data-helper="both">both</button>
                            </div>
                        </div>
                        <div class="aw-field">
                            <label class="aw-label"><i class="fas fa-link"></i> جداشدنی (trennbar)</label>
                            <div class="aw-switch-row">
                                <label class="aw-switch"><input type="checkbox" id="verb-separable"><span class="aw-slider"></span></label>
                                <span class="aw-switch-label">بله، این فعل جداشدنی است</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="adjective-fields" class="aw-fields-panel type-fields-card" style="display:none; --aw-type-color:#06b6d4">
                    <div class="aw-fields-head">
                        <div class="aw-fh-ic" style="background:linear-gradient(135deg,#06b6d4,#0891b2)"><i class="fas fa-chart-line"></i></div>
                        <div><div class="aw-fh-title">حالت‌های صفت</div><div class="aw-fh-sub">Adjektivformen</div></div>
                    </div>
                    <div class="aw-form-row">
                        <div class="aw-field"><label class="aw-label" for="adj-komparativ"><i class="fas fa-arrow-up"></i> Komparativ (برتر)</label><input type="text" id="adj-komparativ" class="aw-input modern-input ltr" placeholder="مثال: schöner, größer, besser" maxlength="100"></div>
                        <div class="aw-field"><label class="aw-label" for="adj-superlativ"><i class="fas fa-crown"></i> Superlativ (برترین)</label><input type="text" id="adj-superlativ" class="aw-input modern-input ltr" placeholder="مثال: am schönsten, größte, beste" maxlength="100"></div>
                    </div>
                    <div class="aw-form-row">
                        <div class="aw-field"><label class="aw-label" for="adj-antonym"><i class="fas fa-exchange-alt"></i> متضاد (Antonym)</label><input type="text" id="adj-antonym" class="aw-input modern-input ltr" placeholder="مثال: groß → klein, schön → hässlich" maxlength="100"></div>
                    </div>
                </div>

                <div id="preposition-fields" class="aw-fields-panel type-fields-card" style="display:none; --aw-type-color:#f97316">
                    <div class="aw-fields-head">
                        <div class="aw-fh-ic" style="background:linear-gradient(135deg,#f97316,#ea580c)"><i class="fas fa-map-marker-alt"></i></div>
                        <div><div class="aw-fh-title">حالت حرف اضافه</div><div class="aw-fh-sub">Präposition Kasus</div></div>
                    </div>
                    <div class="aw-form-row">
                        <div class="aw-field"><label class="aw-label" for="prep-case">حالت (Kasus)</label><select id="prep-case" class="aw-select"><option value="Akkusativ">Akkusativ (مفعولی)</option><option value="Dativ">Dativ (ملکی/مکانی)</option><option value="Genitiv">Genitiv (اضافی)</option><option value="Wechsel">Wechsel (دو حالته)</option></select></div>
                        <div class="aw-field"><label class="aw-label" for="prep-meanings">معانی مختلف</label><input type="text" id="prep-meanings" class="aw-input modern-input" placeholder="مثال: برای، به خاطر، از طریق" maxlength="200"></div>
                    </div>
                </div>

                <!-- بخش قید (Adverb) -->
                <div id="adverb-fields" class="aw-fields-panel type-fields-card" style="display:none; --aw-type-color:#84cc16">
                    <div class="aw-fields-head">
                        <div class="aw-fh-ic" style="background:linear-gradient(135deg,#84cc16,#65a30d)"><i class="fas fa-clock"></i></div>
                        <div><div class="aw-fh-title">اطلاعات قید</div><div class="aw-fh-sub">Adverb Information</div></div>
                    </div>
                    <div class="aw-form-row">
                        <div class="aw-field"><label class="aw-label" for="adverb-type">نوع قید</label><select id="adverb-type" class="aw-select"><option value="">انتخاب کنید...</option><option value="temporal">زمانی (Temporal)</option><option value="lokal">مکانی (Lokal)</option><option value="modal">نحوه (Modal)</option><option value="kausal">علتی (Kausal)</option></select></div>
                        <div class="aw-field"><label class="aw-label" for="adverb-meanings">معانی مختلف</label><input type="text" id="adverb-meanings" class="aw-input modern-input" placeholder="مثال: سریع، به سرعت، تند" maxlength="200"></div>
                    </div>
                </div>

                <div class="aw-fields-panel" style="--aw-type-color:#4361ee">
                    <div class="aw-fields-head">
                        <div class="aw-fh-ic"><i class="fas fa-quote-right"></i></div>
                        <div><div class="aw-fh-title">مثال و تلفظ</div><div class="aw-fh-sub">Example & Pronunciation</div></div>
                    </div>
                    <div class="aw-form-row">
                        <div class="aw-field">
                            <label class="aw-label" for="example">
                                <i class="fas fa-comment"></i> مثال (آلمانی)
                                <span class="aw-hint-inline" id="example-counter">۰</span>
                            </label>
                            <textarea id="example" class="aw-textarea modern-input ltr" placeholder="مثال آلمانی..." rows="2" maxlength="300"></textarea>
                        </div>
                        <div class="aw-field">
                            <label class="aw-label" for="example-translation">
                                <i class="fas fa-language"></i> ترجمه مثال
                                <span class="aw-hint-inline" id="example-translation-counter">۰</span>
                            </label>
                            <textarea id="example-translation" class="aw-textarea modern-input" placeholder="ترجمه فارسی..." rows="2" maxlength="300"></textarea>
                        </div>
                    </div>
                    <div class="aw-form-row">
                        <div class="aw-field"><label class="aw-label" for="pronunciation"><i class="fas fa-volume-up"></i> تلفظ (راهنما)</label><input type="text" id="pronunciation" class="aw-input modern-input ltr" placeholder="مثال: [aʊs] برای Haus" maxlength="100"></div>
                        <div class="aw-field"><label class="aw-label" for="word-tags"><i class="fas fa-tags"></i> برچسب‌ها (Tags)</label><input type="text" id="word-tags" class="aw-input modern-input" placeholder="مثال: A1, Haushalt, Alltag (با کاما جدا کن)" maxlength="200"><div class="aw-hint"><i class="fas fa-info-circle"></i> برای فیلتر کردن لغات مفید است</div></div>
                    </div>
                </div>

                <div class="aw-field" style="margin-bottom:18px;">
                    <label class="aw-label" for="word-notes"><i class="fas fa-align-left"></i> توضیحات (Notes) <span class="aw-hint-inline" id="word-notes-counter">۰</span></label>
                    <textarea id="word-notes" class="aw-textarea modern-input" placeholder="توضیحات اضافه، نکات گرامری، موارد استفاده..." maxlength="500"></textarea>
                </div>

                <div class="aw-actions">
                    <button id="save-word-btn" class="aw-btn aw-btn-primary" type="button"><i class="fas fa-save"></i> ذخیره لغت</button>
                    <button id="clear-form-btn" class="aw-btn aw-btn-ghost" type="button"><i class="fas fa-eraser"></i> پاک کردن فرم</button>
                </div>
                <div class="aw-kbd-hint">
                    <i class="fas fa-keyboard"></i><span>میانبر:</span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> <span>→ ذخیره</span>&nbsp;•&nbsp;<kbd>Esc</kbd> <span>→ پاک کردن</span>
                </div>
            </div>
        </div>
    </div>`;

    this._awSetupFormEvents();
};

/* ============================================================
   رویدادهای فرم
   ============================================================ */
GermanDictionary.prototype._awSetupFormEvents = function() {
    const section = document.getElementById('add-word-section');
    if (!section) return;

    // کارت‌های نوع
    section.querySelectorAll('.aw-type-card').forEach(card => {
        card.addEventListener('click', () => {
            section.querySelectorAll('.aw-type-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const type = card.dataset.type;
            this.toggleTypeFields(type);
            const typeBadge = document.getElementById('word-type-badge');
            const labels = { noun: '📘 اسم', verb: '⚡ فعل', adjective: '✨ صفت', adverb: '📌 قید', preposition: '🔗 حرف اضافه', other: '📎 سایر' };
            if (typeBadge && labels[type]) typeBadge.textContent = labels[type];
            // اگر لغت آلمانی پر شده، دکمه AI را نشان بده
            const word = document.getElementById('german-word')?.value.trim();
            if (word && word.length >= 2) this._awShowAIFillButton(word);
        });
    });

    // جنسیت
    section.querySelectorAll('.aw-gender-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            section.querySelectorAll('.aw-gender-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // کمکی (haben/sein)
    section.querySelectorAll('.aw-radio-btn[data-helper]').forEach(btn => {
        btn.addEventListener('click', () => {
            section.querySelectorAll('.aw-radio-btn[data-helper]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // شمارنده + اعتبارسنجی + دکمه AI هنگام blur
    const germanInput = document.getElementById('german-word');
    const persianInput = document.getElementById('persian-meaning');
    const notesInput = document.getElementById('word-notes');

    const updateCounter = (input, counterId) => {
        const cnt = document.getElementById(counterId);
        if (cnt && input) cnt.textContent = input.value.length.toLocaleString('fa-IR');
    };

    if (germanInput) {
        germanInput.addEventListener('input', () => {
            updateCounter(germanInput, 'german-word-counter');
            const err = document.getElementById('german-word-error');
            if (germanInput.value.trim()) {
                germanInput.classList.remove('error'); germanInput.classList.add('success');
                if (err) err.classList.remove('visible');
            } else {
                germanInput.classList.remove('success', 'error');
            }
            // به‌روزرسانی dataset دکمه AI با مقدار جدید
            const aiBtn = document.getElementById('ai-fill-all-btn');
            if (aiBtn && aiBtn.style.display !== 'none') {
                aiBtn.dataset.word = germanInput.value.trim();
            }
            this.updateFieldCount();
        });
        // هنگام blur: نمایش دکمه AI + پیشنهاد مثال + صرف فعل
        germanInput.addEventListener('blur', () => {
            const value = germanInput.value.trim();
            if (value && value.length >= 2) {
                this._awShowAIFillButton(value);
                // پیشنهاد مثال با AI (اگر تابع وجود دارد)
                if (typeof this.fetchAIExampleSuggestion === 'function') {
                    this.fetchAIExampleSuggestion(value);
                }
                // صرف فعل اگر نوع فعله
                const activeType = section.querySelector('.aw-type-card.active')?.dataset.type;
                if (activeType === 'verb' && typeof this.fetchAIVerbConjugation === 'function') {
                    this.fetchAIVerbConjugation(value);
                }
            } else {
                this._awHideAIFillButton();
            }
        });
    }

    if (persianInput) {
        persianInput.addEventListener('input', () => {
            updateCounter(persianInput, 'persian-meaning-counter');
            const err = document.getElementById('persian-meaning-error');
            if (persianInput.value.trim()) {
                persianInput.classList.remove('error'); persianInput.classList.add('success');
                if (err) err.classList.remove('visible');
            } else {
                persianInput.classList.remove('success', 'error');
            }
            this.updateFieldCount();
        });
    }

    if (notesInput) {
        notesInput.addEventListener('input', () => {
            updateCounter(notesInput, 'word-notes-counter');
            this.updateFieldCount();
        });
    }

    // شمارنده برای فیلدهای مثال
    const exampleInput = document.getElementById('example');
    const exampleTransInput = document.getElementById('example-translation');
    if (exampleInput) {
        exampleInput.addEventListener('input', () => {
            updateCounter(exampleInput, 'example-counter');
            this.updateFieldCount();
        });
    }
    if (exampleTransInput) {
        exampleTransInput.addEventListener('input', () => {
            updateCounter(exampleTransInput, 'example-translation-counter');
            this.updateFieldCount();
        });
    }

    // دکمه ذخیره: onclick را تنظیم نمی‌کنیم چون setupEventListeners (در dict-utils-events.js)
    // بعد از این تابع اجرا می‌شود و onclick را بازنویسی می‌کند.
    // اعتبارسنجی در saveWord (بازنویسی‌شده در پایین همین فایل) انجام می‌شود.

    // دکمه پاک کردن (با onclick — اگر setupEventListeners بعداً اجرا شد، بازنویسی می‌شود
    // که اشکالی ندارد چون clearAddWordForm همان کار را می‌کند)
    const clearBtn = document.getElementById('clear-form-btn');
    if (clearBtn) {
        clearBtn.onclick = () => {
            this.clearAddWordForm();
            ['german-word-counter', 'persian-meaning-counter', 'word-notes-counter', 'example-counter', 'example-translation-counter'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = '۰';
            });
            section.querySelectorAll('.aw-input, .aw-textarea').forEach(i => i.classList.remove('error', 'success'));
            section.querySelectorAll('.aw-error-msg').forEach(e => e.classList.remove('visible'));
            this._awHideAIFillButton();
            this.showToast('🧹 فرم پاک شد', 'info');
        };
    }

    // دکمه ذخیره: onclick را تنظیم نمی‌کنیم چون setupEventListeners (در dict-utils-events.js)
    // بعد از این تابع اجرا می‌شود و onclick را بازنویسی می‌کند.
    // اعتبارسنجی در saveWord (بازنویسی‌شده در پایین همین فایل) انجام می‌شود.

    // دکمه AI Fill
    const aiBtn = document.getElementById('ai-fill-all-btn');
    if (aiBtn) {
        aiBtn.addEventListener('click', () => {
            // استفاده از تابع کامل aiSmartFillAll که تمام فیلدها را پر می‌کند
            if (typeof this.aiSmartFillAll === 'function') {
                this.aiSmartFillAll();
            } else {
                this._awAISmartFillAll();
            }
        });
    }

    // میانبر کیبورد
    section.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            saveBtn?.click();
        } else if (e.key === 'Escape' && document.activeElement.tagName !== 'TEXTAREA') {
            clearBtn?.click();
        }
    });

    this.updateFieldCount();
};

/* ============================================================
   نمایش/مخفی دکمه AI
   ============================================================ */
GermanDictionary.prototype._awShowAIFillButton = function(word) {
    const btn = document.getElementById('ai-fill-all-btn');
    if (!btn || !word) return;
    btn.dataset.word = word;
    btn.style.display = 'flex';
    btn.innerHTML = '<i class="fas fa-robot"></i> پر کردن با هوش مصنوعی';
    btn.classList.remove('loading');
    window.dict = this;
};

GermanDictionary.prototype._awHideAIFillButton = function() {
    const btn = document.getElementById('ai-fill-all-btn');
    if (btn) btn.style.display = 'none';
};

/* ============================================================
   پر کردن هوشمند با AI (با استفاده از Worker)
   ============================================================ */
GermanDictionary.prototype._awAISmartFillAll = async function() {
    const btn = document.getElementById('ai-fill-all-btn');
    // همیشه مقدار فعلی فیلد را بخوان (نه dataset.word که ممکن است قدیمی باشد)
    const word = document.getElementById('german-word')?.value.trim();
    if (!word) {
        this.showToast('ابتدا یک لغت آلمانی وارد کنید', 'info');
        return;
    }

    // به‌روزرسانی dataset برای سازگاری
    if (btn) btn.dataset.word = word;

    // حالت loading
    if (btn) {
        btn.classList.add('loading');
        btn.innerHTML = '<span class="aw-spinner">⏳</span> در حال تحلیل...';
    }
    this.showToast('🤖 در حال تحلیل لغت "' + word + '" با هوش مصنوعی...', 'info');

    try {
        // استفاده از _puterChat (همان Worker که در کل برنامه استفاده می‌شود)
        const chatFn = (typeof this._puterChat === 'function') ? this._puterChat : null;
        if (!chatFn) {
            this.showToast('هوش مصنوعی در دسترس نیست', 'error');
            return;
        }

        const prompt = `تو یک متخصص زبان آلمانی هستی. لغت آلمانی "${word}" را تحلیل کن و اطلاعات زیر را به صورت JSON دقیق برگردان:

{
  "german": "شکل صحیح لغت",
  "persian": "معنی فارسی",
  "type": "noun یا verb یا adjective یا adverb یا preposition یا other",
  "gender": "masculine یا feminine یا neuter (فقط برای اسم)",
  "plural": "شکل جمع (فقط برای اسم)",
  "pronunciation": "تلفظ IPA",
  "example": "یک مثال آلمانی",
  "exampleTranslation": "ترجمه فارسی مثال",
  "tags": ["A1", "A2", "B1", "B2"] (سطح مناسب)
}

⚠️ فقط JSON برگردان، بدون متن اضافه. اگر اطلاعاتی نامشخص است، null بگذار.`;

        // صدا زدن Worker
        const result = await chatFn.call(this, prompt, { model: 'gpt-oss-120b', temperature: 0.3, max_tokens: 1000 });

        // استخراج متن از نتیجه
        let responseText = '';
        if (result?.message?.content) {
            if (Array.isArray(result.message.content)) {
                responseText = result.message.content.map(c => c.text || '').join('');
            } else if (typeof result.message.content === 'string') {
                responseText = result.message.content;
            }
        } else if (typeof result === 'string') {
            responseText = result;
        }

        if (!responseText) {
            this.showToast('پاسخی از هوش مصنوعی دریافت نشد', 'warning');
            return;
        }

        // استخراج JSON از پاسخ
        let info = null;
        try {
            // تلاش برای پیدا کردن JSON در متن
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                info = JSON.parse(jsonMatch[0]);
            } else {
                info = JSON.parse(responseText);
            }
        } catch (e) {
            console.error('خطا در parse JSON:', e, responseText);
            this.showToast('خطا در پردازش پاسخ AI', 'error');
            return;
        }

        if (!info) {
            this.showToast('اطلاعاتی از AI دریافت نشد', 'warning');
            return;
        }

        // پر کردن فیلدها
        let filledCount = 0;

        // لغت آلمانی (اگر فیلد خالی بود یا با حرف بزرگ/کوچک فرق داشت)
        if (info.german) {
            const gw = document.getElementById('german-word');
            if (gw && !gw.value.trim()) {
                gw.value = info.german;
                gw.dispatchEvent(new Event('input'));
                filledCount++;
            }
        }

        // معنی فارسی
        if (info.persian) {
            const p = document.getElementById('persian-meaning');
            if (p && !p.value.trim()) {
                p.value = info.persian;
                p.dispatchEvent(new Event('input'));
                filledCount++;
            }
        }

        // نوع کلمه
        if (info.type) {
            const card = document.querySelector(`.aw-type-card[data-type="${info.type}"]`);
            if (card && !card.classList.contains('active')) {
                card.click();
                filledCount++;
            }
        }

        // جنسیت (فقط برای اسم)
        if (info.gender) {
            const g = document.querySelector(`.aw-gender-btn[data-gender="${info.gender}"]`);
            if (g) {
                g.click();
                filledCount++;
            }
        }

        // جمع (فقط برای اسم)
        if (info.plural) {
            const pl = document.getElementById('noun-plural');
            if (pl && !pl.value.trim()) {
                pl.value = info.plural;
                filledCount++;
            }
        }

        // تلفظ
        if (info.pronunciation) {
            const pr = document.getElementById('pronunciation');
            if (pr && !pr.value.trim()) {
                pr.value = info.pronunciation;
                filledCount++;
            }
        }

        // مثال (در فیلدهای مثال)
        if (info.example) {
            const ex = document.getElementById('example');
            if (ex && !ex.value.trim()) {
                ex.value = info.example;
                ex.dispatchEvent(new Event('input'));
                filledCount++;
            }
        }
        if (info.exampleTranslation) {
            const exTr = document.getElementById('example-translation');
            if (exTr && !exTr.value.trim()) {
                exTr.value = info.exampleTranslation;
                exTr.dispatchEvent(new Event('input'));
                filledCount++;
            }
        }

        // تگ‌ها
        if (info.tags && Array.isArray(info.tags) && info.tags.length > 0) {
            const tags = document.getElementById('word-tags');
            if (tags && !tags.value.trim()) {
                tags.value = info.tags.join(', ');
                filledCount++;
            }
        }

        // به‌روزرسانی شمارنده
        this.updateFieldCount();

        if (filledCount > 0) {
            this.showToast(`✅ ${filledCount.toLocaleString('fa-IR')} فیلد با هوش مصنوعی پر شد`, 'success');
        } else {
            this.showToast('همه فیلدها از قبل پر شده بودند', 'info');
        }

    } catch (err) {
        console.error('خطا در AI fill:', err);
        const msg = err.message || 'خطای ناشناخته';
        if (msg.includes('rate') || msg.includes('429')) {
            this.showToast('⏳ سرور اشغال است، چند ثانیه بعد تلاش کنید', 'warning');
        } else if (msg.includes('network') || msg.includes('fetch')) {
            this.showToast('🌐 خطای شبکه - اتصال اینترنت را بررسی کنید', 'error');
        } else {
            this.showToast('خطا در پر کردن با AI: ' + msg, 'error');
        }
    } finally {
        if (btn) {
            btn.classList.remove('loading');
            btn.innerHTML = '<i class="fas fa-robot"></i> پر کردن با هوش مصنوعی';
        }
    }
};

/* ============================================================
   پاک کردن فرم
   ============================================================ */
GermanDictionary.prototype.clearAddWordForm = function() {
    const fields = ['german-word', 'persian-meaning', 'noun-plural', 'verb-present', 'verb-past',
                    'verb-perfect', 'verb-future', 'verb-konjunktiv', 'adj-komparativ',
                    'adj-superlativ', 'adj-antonym', 'prep-meanings', 'adverb-meanings',
                    'pronunciation', 'word-tags', 'word-notes', 'example', 'example-translation'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    // ریست adverb-type و prep-case selects
    const adverbType = document.getElementById('adverb-type');
    if (adverbType) adverbType.selectedIndex = 0;
    // ریست جنسیت
    document.querySelectorAll('.aw-gender-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
    // ریست کمکی
    document.querySelectorAll('.aw-radio-btn[data-helper]').forEach((b, i) => b.classList.toggle('active', i === 0));
    // ریست سوییچ
    const sep = document.getElementById('verb-separable');
    if (sep) sep.checked = false;
    // ریست نوع به اسم
    document.querySelectorAll('.aw-type-card').forEach(c => c.classList.remove('active'));
    const nounCard = document.querySelector('.aw-type-card[data-type="noun"]');
    if (nounCard) nounCard.classList.add('active');
    this.toggleTypeFields('noun');
    this.updateFieldCount();
};

/* ============================================================
   تعویض پنل نوع کلمه
   ============================================================ */
GermanDictionary.prototype.toggleTypeFields = function(type) {
    const panels = {
        noun: 'noun-fields', verb: 'verb-fields',
        adjective: 'adjective-fields', preposition: 'preposition-fields',
        adverb: 'adverb-fields'
    };
    Object.values(panels).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const target = panels[type];
    if (target) {
        const el = document.getElementById(target);
        if (el) el.style.display = 'block';
    }
    this.updateFieldCount();
};

/* ============================================================
   شمارش فیلدهای تکمیل‌شده
   ============================================================ */
GermanDictionary.prototype.updateFieldCount = function() {
    const inputs = document.querySelectorAll('#add-word-section .modern-input, #add-word-section textarea');
    let count = 0;
    inputs.forEach(input => {
        if (input.value && input.value.trim() !== '') count++;
    });
    const countBadge = document.getElementById('field-count-badge');
    if (countBadge) {
        countBadge.textContent = count.toLocaleString('fa-IR') + ' فیلد تکمیل شده';
    }
};

/* ============================================================
   ثبت لغت (addWord)
   ============================================================ */
GermanDictionary.prototype.addWord = async function(wordData) {
    return new Promise((resolve, reject) => {
        if (!this.db) {
            reject(new Error('دیتابیس آماده نیست'));
            return;
        }
        try {
            // نرمال‌سازی لغت آلمانی
            const normalizedGerman = (wordData.german || '').trim().replace(/\s+/g, ' ');

            const transaction = this.db.transaction(['words'], 'readwrite');
            const store = transaction.objectStore('words');

            const finalWord = {
                german: normalizedGerman,
                persian: wordData.persian,
                type: wordData.type || 'other',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (wordData.notes) finalWord.notes = wordData.notes;
            if (wordData.tags) finalWord.tags = wordData.tags;
            if (wordData.pronunciation) finalWord.pronunciation = wordData.pronunciation;
            // فیلدهای مثال (از saveWord: example و exampleTranslation به صورت جداگانه)
            if (wordData.example || wordData.exampleTranslation) {
                finalWord.examples = [{
                    german: wordData.example || '',
                    persian: wordData.exampleTranslation || ''
                }];
            } else if (wordData.examples) {
                finalWord.examples = wordData.examples;
            }

            if (wordData.type === 'noun') {
                if (wordData.gender) finalWord.gender = wordData.gender;
                if (wordData.plural) finalWord.plural = wordData.plural;
            }

            if (wordData.type === 'verb') {
                finalWord.verbForms = {
                    present: wordData.verbPresent || null,
                    past: wordData.verbPast || null,
                    perfect: wordData.verbPerfect || null,
                    future: wordData.verbFuture || null,
                    konjunktiv: wordData.verbKonjunktiv || null,
                    helper: wordData.verbHelper || 'haben',
                    separable: wordData.verbSeparable || false
                };
            }

            if (wordData.type === 'adjective') {
                if (wordData.comparative) finalWord.comparative = wordData.comparative;
                if (wordData.superlative) finalWord.superlative = wordData.superlative;
                if (wordData.antonym) finalWord.antonym = wordData.antonym;
            }

            if (wordData.type === 'preposition') {
                if (wordData.case) finalWord.case = wordData.case;
                if (wordData.meanings) finalWord.meanings = wordData.meanings;
            }

            const request = store.add(finalWord);

            request.onsuccess = () => {
                console.log('✅ لغت ذخیره شد:', finalWord.german);
                resolve(finalWord);
            };

            request.onerror = (event) => {
                const error = event.target.error;
                console.error('❌ خطا در ذخیره لغت:', error);
                // جلوگیری از propagate خطای پیش‌فرض
                event.preventDefault();
                // خطای unique constraint → لغت تکراری
                if (error && (error.name === 'ConstraintError' || error.message.includes('uniqueness'))) {
                    reject(new Error('duplicate'));
                } else {
                    reject(error);
                }
            };
        } catch (error) {
            console.error('❌ خطا در addWord:', error);
            reject(error);
        }
    });
};

/* ============================================================
   جستجوی سریع (setupQuickSearch)
   ============================================================ */
GermanDictionary.prototype.setupQuickSearch = function() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    let searchTimeout;
    if (this.quickSearchHandler) {
        searchInput.removeEventListener('input', this.quickSearchHandler);
    }
    this.quickSearchHandler = (e) => {
        const query = e.target.value.trim();
        clearTimeout(searchTimeout);
        if (query.length < 2) return;
        searchTimeout = setTimeout(() => {
            if (typeof this.QuickSearch === 'function') {
                this.QuickSearch(query);
            } else if (typeof this.normalSearch === 'function') {
                this.normalSearch(query);
            }
        }, 800);
    };
    searchInput.addEventListener('input', this.quickSearchHandler);
};

/* ============================================================
   مرتب‌سازی پیشرفته (sortWordListAdvanced)
   ============================================================
   این تابع حالا فقط نوع مرتب‌سازی را در localStorage ذخیره می‌کند
   و سپس renderWordList را صدا می‌زند تا لیست با UI کامل (شامل
   SRS، تگ‌ها، دکمه‌ها و...) رندر شود. این کار از نمایش لیست
   ساده‌شده و ناقص جلوگیری می‌کند.
   ============================================================ */
GermanDictionary.prototype.sortWordListAdvanced = async function(filter, sortType) {
    // ذخیره نوع مرتب‌سازی
    if (sortType) {
        localStorage.setItem('wordListSort', sortType);
    }

    // ریست صفحه فعلی هنگام تغییر مرتب‌سازی
    this._wlCurrentPage = 1;

    // تعیین فیلتر فعلی
    let activeFilter = filter;
    if (!activeFilter) {
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
    }

    // همچنین فیلتر تگ را بررسی کن
    if (this.currentTagFilter && this.currentTagFilter !== 'all') {
        // اگر فیلتر تگ فعال است، renderWordList خودش مدیریت می‌کند
        await this.renderWordList('all');
    } else {
        await this.renderWordList(activeFilter || 'all');
    }
};

/* ============================================================
   رندر نوار فیلتر تگ‌ها (renderTagFilterBar)
   ============================================================ */
GermanDictionary.prototype.renderTagFilterBar = function() {
    const bar = document.getElementById('tag-filter-bar');
    if (!bar) return;
    const tags = this.getAllTags ? this.getAllTags() : [];
    if (tags.length === 0) { bar.innerHTML = ''; return; }
    bar.innerHTML = tags.map(t => `<button class="tag-filter-btn" data-tag="${t.id}">${this.escapeHtml(t.name)}</button>`).join('');
};

/* ============================================================
   بازنویسی saveWord — جلوگیری از صدا زده شدن دوگانه
   ============================================================
   مشکل: در setupEventListeners (dict-utils-events.js)، onclick روی
   save-word-btn تنظیم می‌شود. این تابع ممکن است دو بار صدا زده شود
   (از onclick و از addEventListener). با flag جلوگیری می‌کنیم.
   ============================================================ */
GermanDictionary.prototype._awOriginalSaveWord = GermanDictionary.prototype.saveWord;
GermanDictionary.prototype.saveWord = async function() {
    // اگر در حال ذخیره است، دوباره صدا نزن
    if (this._awSaving) {
        console.log('⚠️ saveWord در حال اجراست، نادیده گرفته شد');
        return false;
    }
    this._awSaving = true;

    try {
        // اعتبارسنجی قبل از ذخیره
        const germanInput = document.getElementById('german-word');
        const persianInput = document.getElementById('persian-meaning');
        let valid = true;
        if (germanInput && !germanInput.value.trim()) {
            germanInput.classList.add('error');
            const err = document.getElementById('german-word-error');
            if (err) err.classList.add('visible');
            valid = false;
        }
        if (persianInput && !persianInput.value.trim()) {
            persianInput.classList.add('error');
            const err = document.getElementById('persian-meaning-error');
            if (err) err.classList.add('visible');
        }
        if (!valid) {
            this.showToast('لطفاً فیلدهای الزامی را پر کنید', 'warning');
            return false;
        }

        // فراخوانی saveWord اصلی
        if (this._awOriginalSaveWord) {
            return await this._awOriginalSaveWord.call(this);
        }
        return false;
    } finally {
        // ریست flag بعد از اتمام
        setTimeout(() => { this._awSaving = false; }, 500);
    }
};

console.log('✅ فرم افزودن لغت مدرن + addWord + AI fill فعال شد.');
