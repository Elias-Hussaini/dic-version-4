/* dict-study-srs.js — Study Mode, Verb Display, Sentence, SRS Engine (lines 6401-7885) */

GermanDictionary.prototype.startStudyMode = async function() {
    const wordsToStudy = await this.getWordsForPractice();
    
    if (wordsToStudy.length === 0) {
        this.showToast('❌ هیچ لغتی برای مطالعه وجود ندارد', 'error');
        return;
    }
    
    // ذخیره لغات برای مطالعه
    this.studySession = {
        words: wordsToStudy,
        currentIndex: 0,
        isPlaying: false,
        timer: null,
        timePerWord: localStorage.getItem('studyTimePerWord') ? parseFloat(localStorage.getItem('studyTimePerWord')) : 5
    };
    
    // نمایش مودال تنظیمات
    this.showStudySettingsModal();
};

GermanDictionary.prototype.showStudySettingsModal = function() {
    // ایجاد مودال
    let modal = document.getElementById('study-settings-modal');
    if (!modal) {
        const modalHTML = `
            <div id="study-settings-modal" class="study-settings-modal" style="display: none;">
                <div class="study-settings-content">
                    <div class="study-settings-header">
                        <h3><i class="fas fa-clock"></i> تنظیمات حالت مطالعه</h3>
                    </div>
                    <div class="study-settings-body">
                        <div class="setting-group">
                            <label>⏱️ زمان نمایش هر لغت (ثانیه)</label>
                            <input type="range" id="study-time-slider" class="time-slider" min="2" max="15" step="0.5" value="${this.studySession.timePerWord}">
                            <div class="time-value">
                                <span id="study-time-value">${this.studySession.timePerWord}</span> ثانیه
                            </div>
                        </div>
                        <div class="setting-group">
                            <label>📊 تعداد لغات برای مطالعه</label>
                            <div style="font-size: 18px; font-weight: 600; color: var(--primary);">
                                ${this.studySession.words.length} لغت
                            </div>
                        </div>
                    </div>
                    <div class="study-settings-footer">
                        <button id="study-start-btn" class="btn btn-primary">▶ شروع مطالعه</button>
                        <button id="study-cancel-btn" class="btn btn-outline">لغو</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('study-settings-modal');
    } else {
        // بروزرسانی تعداد لغات
        const countSpan = modal.querySelector('.setting-group:last-child div');
        if (countSpan) {
            countSpan.innerHTML = `${this.studySession.words.length} لغت`;
        }
        // بروزرسانی مقدار اسلایدر
        const timeSlider = document.getElementById('study-time-slider');
        if (timeSlider) {
            timeSlider.value = this.studySession.timePerWord;
            document.getElementById('study-time-value').textContent = this.studySession.timePerWord;
        }
    }
    
    modal.style.display = 'flex';
    
    // اسلایدر زمان
    const timeSlider = document.getElementById('study-time-slider');
    const timeValue = document.getElementById('study-time-value');
    
    timeSlider.oninput = () => {
        timeValue.textContent = timeSlider.value;
        this.studySession.timePerWord = parseFloat(timeSlider.value);
        localStorage.setItem('studyTimePerWord', this.studySession.timePerWord);
    };
    
    // دکمه شروع
    document.getElementById('study-start-btn').onclick = () => {
        modal.style.display = 'none';
        this.startStudyPlayback();
    };
    
    // دکمه لغو
    document.getElementById('study-cancel-btn').onclick = () => {
        modal.style.display = 'none';
    };
};

GermanDictionary.prototype.startStudyPlayback = function() {
    this.studySession.isPlaying = true;
    this.studySession.currentIndex = 0;
    this.showStudyWord();
};

GermanDictionary.prototype.showStudyWord = function() {
    if (!this.studySession.isPlaying) return;

    if (this.studySession.currentIndex >= this.studySession.words.length) {
        this.finishStudyMode();
        return;
    }

    const word = this.studySession.words[this.studySession.currentIndex];
    const current = this.studySession.currentIndex + 1;
    const total = this.studySession.words.length;
    const progress = (current - 1) / total * 100;

    // تزریق استایل‌های study mode (یک بار)
    if (!document.getElementById('study-pro-styles')) {
        const style = document.createElement('style');
        style.id = 'study-pro-styles';
        style.textContent = `
          :root{
            --st-bg:#f7f8fa;--st-card:#fff;--st-text:#1a1a2e;--st-muted:#64748b;
            --st-border:#e2e8f0;--st-primary:#f59e0b;
          }
          body.dark-mode{
            --st-bg:#0f1115;--st-card:#1a1d24;--st-text:#e4e6eb;--st-muted:#9ca3af;
            --st-border:#2a2e38;
          }
          .st-root{font-family:'Vazirmatn',Tahoma,sans-serif;direction:rtl;color:var(--st-text);max-width:640px;margin:0 auto;padding:8px 0;}
          .st-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
          .st-head h2{font-size:17px;font-weight:800;margin:0;display:flex;align-items:center;gap:8px;}
          .st-head h2 i{color:var(--st-primary);}
          .st-badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;color:#fff;background:linear-gradient(135deg,#f59e0b,#d97706);}
          .st-stop-btn{font-family:inherit;font-size:11px;font-weight:700;padding:6px 12px;border-radius:8px;border:none;
            background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;cursor:pointer;display:inline-flex;align-items:center;gap:4px;}
          .st-stop-btn:hover{filter:brightness(1.1);}
          .st-card{background:var(--st-card);border:1.5px solid var(--st-border);border-radius:20px;padding:24px;
            box-shadow:0 8px 24px rgba(0,0,0,.06);text-align:center;position:relative;overflow:hidden;}
          body.dark-mode .st-card{box-shadow:0 8px 24px rgba(0,0,0,.3);}
          .st-card::before{content:"";position:absolute;top:-30px;left:-30px;width:140px;height:140px;border-radius:50%;
            background:radial-gradient(circle,rgba(245,158,11,.1) 0%,transparent 70%);pointer-events:none;}
          .st-word{font-size:36px;font-weight:800;color:var(--st-primary);margin-bottom:14px;word-break:break-word;
            direction:ltr;position:relative;z-index:1;}
          .st-meta{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:14px;position:relative;z-index:1;}
          .st-meaning{background:var(--st-bg);border:1px solid var(--st-border);border-radius:16px;padding:16px;margin:14px 0;position:relative;z-index:1;}
          .st-meaning-lbl{font-size:11px;color:var(--st-muted);margin-bottom:6px;}
          .st-meaning-text{font-size:20px;font-weight:700;}
          .st-verb{background:var(--st-bg);border:1px solid var(--st-border);border-radius:16px;padding:14px;margin:12px 0;position:relative;z-index:1;}
          .st-verb-lbl{font-size:11px;color:var(--st-muted);margin-bottom:10px;}
          .st-verb-grid{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}
          .st-verb-item{background:var(--st-card);border:1px solid var(--st-border);border-radius:10px;padding:8px 12px;min-width:90px;}
          .st-verb-tense{font-size:10px;color:var(--st-muted);margin-bottom:2px;}
          .st-verb-form{font-size:12px;font-weight:700;direction:ltr;}
          .st-countdown{margin-top:16px;font-size:12px;color:var(--st-muted);position:relative;z-index:1;}
          .st-countdown-num{font-weight:800;color:var(--st-primary);font-size:15px;}
          .st-progress-wrap{margin-top:14px;position:relative;z-index:1;}
          .st-progress-bar{height:6px;background:var(--st-bg);border-radius:999px;overflow:hidden;border:1px solid var(--st-border);}
          .st-progress-fill{height:100%;background:linear-gradient(90deg,#f59e0b,#14b8a6);transition:width .3s ease;border-radius:999px;}
          @media(max-width:768px){
            .st-card{padding:18px 14px;}
            .st-word{font-size:28px;}
            .st-meaning-text{font-size:18px;}
          }
          @media(max-width:480px){
            .st-root{padding:4px 0;}
            .st-card{padding:16px 12px;}
            .st-word{font-size:24px;}
            .st-meaning-text{font-size:16px;}
            .st-head{flex-direction:column;align-items:stretch;gap:8px;}
            .st-stop-btn{width:100%;justify-content:center;}
            .st-verb-item{min-width:70px;padding:6px 8px;}
            .st-verb-form{font-size:11px;}
          }
        `;
        document.head.appendChild(style);
    }

    // parse صرف فعل
    let verbHtml = '';
    if (word.verbForms) {
        const parseVerb = (str) => {
            if (!str) return '';
            return str.split(/[,،/|]\s*/).map(s => s.trim()).filter(s => s).join(' / ');
        };
        verbHtml = '<div class="st-verb">' +
            '<div class="st-verb-lbl">📚 صرف فعل</div>' +
            '<div class="st-verb-grid">' +
                (word.verbForms.present ? '<div class="st-verb-item"><div class="st-verb-tense">حال ساده</div><div class="st-verb-form">' + this._pmEsc(word.verbForms.present) + '</div></div>' : '') +
                (word.verbForms.past ? '<div class="st-verb-item"><div class="st-verb-tense">گذشته ساده</div><div class="st-verb-form">' + this._pmEsc(word.verbForms.past) + '</div></div>' : '') +
                (word.verbForms.perfect ? '<div class="st-verb-item"><div class="st-verb-tense">گذشته کامل</div><div class="st-verb-form">' + this._pmEsc(word.verbForms.perfect) + '</div></div>' : '') +
            '</div>' +
        '</div>';
    }

    // meta badges
    let metaHtml = '';
    if (word.gender) {
        metaHtml += '<span style="font-size:12px;font-weight:700;padding:4px 10px;border-radius:8px;background:' +
            (word.gender==='masculine'?'#dbeafe;color:#1e40af':word.gender==='feminine'?'#fce7f3;color:#9d174d':'#d1fae5;color:#065f46') +
            ';">' + this.getGenderSymbol(word.gender) + '</span>';
    }
    if (word.type) {
        metaHtml += '<span style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:8px;background:rgba(108,92,231,.1);color:#6C5CE7;">' + this.getTypeLabel(word.type) + '</span>';
    }

    let html = '<div class="st-root">' +
        '<div class="st-head">' +
            '<h2><i class="fas fa-eye"></i> حالت مطالعه</h2>' +
            '<div style="display:flex;gap:8px;align-items:center;">' +
                '<span class="st-badge">' + current + ' / ' + total + '</span>' +
                '<button class="st-stop-btn" id="stop-study-btn"><i class="fas fa-stop"></i> توقف</button>' +
            '</div>' +
        '</div>' +
        '<div class="st-card">' +
            '<div class="st-word">' + this._pmEsc(word.german) + '</div>' +
            (metaHtml ? '<div class="st-meta">' + metaHtml + '</div>' : '') +
            '<div class="st-meaning">' +
                '<div class="st-meaning-lbl">📖 معنی</div>' +
                '<div class="st-meaning-text">' + this._pmEsc(word.persian) + '</div>' +
            '</div>' +
            verbHtml +
            '<div class="st-countdown">لغت بعدی در <span class="st-countdown-num" id="study-countdown">' + this.studySession.timePerWord + '</span> ثانیه...</div>' +
            '<div class="st-progress-wrap">' +
                '<div class="st-progress-bar"><div class="st-progress-fill" style="width:' + progress + '%"></div></div>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.getElementById('practice-section').innerHTML = html;
    this.showSection('practice-section');

    // دکمه توقف
    document.getElementById('stop-study-btn').onclick = () => {
        this.stopStudyMode();
    };

    // شروع تایمر
    const countdownSpan = document.getElementById('study-countdown');
    const startTime = Date.now();
    const duration = this.studySession.timePerWord * 1000;

    const updateTimer = () => {
        const elapsed = Date.now() - startTime;
        const remainingSec = Math.max(0, Math.ceil((duration - elapsed) / 1000));

        if (countdownSpan) {
            countdownSpan.textContent = remainingSec;
        }

        if (elapsed >= duration) {
            clearInterval(this.studyTimerInterval);
            this.nextStudyWord();
        }
    };

    if (this.studyTimerInterval) {
        clearInterval(this.studyTimerInterval);
    }
    this.studyTimerInterval = setInterval(updateTimer, 100);
};

GermanDictionary.prototype.nextStudyWord = function() {
    if (this.studyTimerInterval) {
        clearInterval(this.studyTimerInterval);
    }
    this.studySession.currentIndex++;
    this.showStudyWord();
};

GermanDictionary.prototype.stopStudyMode = function() {
    if (this.studyTimerInterval) {
        clearInterval(this.studyTimerInterval);
    }
    this.studySession.isPlaying = false;
    this.renderPracticeOptions();
    this.showSection('practice-section');
    this.showToast('⏹ حالت مطالعه متوقف شد', 'info');
};

GermanDictionary.prototype.finishStudyMode = function() {
    if (this.studyTimerInterval) {
        clearInterval(this.studyTimerInterval);
    }
    this.studySession.isPlaying = false;
    
    const container = document.getElementById('practice-section');
    container.innerHTML = `
        <div class="word-card" style="text-align: center; padding: 60px;">
            <div class="empty-icon">
                <i class="fas fa-check-circle" style="font-size: 70px; color: #10b981;"></i>
            </div>
            <h2>✅ مطالعه کامل شد!</h2>
            <p>${this.studySession.words.length} لغت با موفقیت مرور شد.</p>
            <div class="action-buttons" style="margin-top: 30px;">
                <button id="restart-study-btn" class="btn btn-primary">🔄 مطالعه مجدد</button>
                <button id="back-study-btn" class="btn btn-outline">بازگشت</button>
            </div>
        </div>
    `;
    
    document.getElementById('restart-study-btn').onclick = () => this.startStudyMode();
    document.getElementById('back-study-btn').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
    
    this.showToast('🎉 مطالعه با موفقیت به پایان رسید!', 'success');
};

GermanDictionary.prototype.showVerbConjugation = async function(verb) {
    const conjugation = window.VerbsDatabase.getConjugation(verb);
    const verbInfo = window.VerbsDatabase.detectVerbType(verb);
    
    if (!conjugation) {
        this.showToast('❌ اطلاعاتی برای این فعل یافت نشد', 'error');
        return;
    }
    
    // مخفی کردن حالت خالی و نمایش نتیجه
    const emptyState = document.getElementById('verb-empty-state');
    const resultDiv = document.getElementById('conjugation-result');
    
    if (emptyState) emptyState.style.display = 'none';
    if (resultDiv) resultDiv.style.display = 'block';
    
    // هدر
    const nameEl = document.getElementById('selected-verb-name');
    const typeEl = document.getElementById('selected-verb-type');
    const levelEl = document.getElementById('selected-verb-level');
    
    if (nameEl) nameEl.textContent = verb;
    if (typeEl) {
        typeEl.textContent = verbInfo?.type === 'regular' ? 'با قاعده' : 'بی‌قاعده';
        typeEl.style.background = verbInfo?.type === 'regular' ? '#10b981' : '#f59e0b';
    }
    if (levelEl) levelEl.textContent = verbInfo?.level || 'A1-B2';
    
    // ذخیره فعل جاری
    this.currentVerb = verb;
    this.currentConjugation = conjugation;
    
    // نمایش جدول پیش‌فرض (حال ساده)
    this.showTenseTable('present');
    
    // تنظیم تب‌ها
    document.querySelectorAll('.tense-tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.tense-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.showTenseTable(tab.dataset.tense);
        };
    });
    
    // نمایش مثال‌ها
    this.showVerbExamples(verb);
    
    // دکمه تلفظ
    const speakBtn = document.getElementById('speak-verb-btn');
    if (speakBtn) speakBtn.onclick = () => this.speakText(verb, 'de-DE');
    
    // دکمه تمرین
    const practiceBtn = document.getElementById('practice-verb-btn');
    if (practiceBtn) practiceBtn.onclick = () => this.startVerbPractice(verb);
    
    // دکمه ذخیره
    const saveBtn = document.getElementById('save-conjugation-btn');
    if (saveBtn) saveBtn.onclick = () => this.saveVerbToDictionary(verb, verbInfo);
};

GermanDictionary.prototype.showTenseTable = function(tense) {
    const conjugation = this.currentConjugation;
    const tenseNames = {
        present: { title: '📖 Präsens (حال ساده)', persons: ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'] },
        praeteritum: { title: '⏮️ Präteritum (گذشته ساده)', persons: ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'] },
        perfekt: { title: '✅ Perfekt (گذشته کامل)', persons: ['فعل کمکی', 'اسم مفعول'] },
        futur: { title: '🔮 Futur I (آینده)', persons: ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'] },
        konjunktiv: { title: '🤔 Konjunktiv II (التزامی گذشته)', persons: ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'] }
    };
    
    const tenseData = conjugation[tense];
    const info = tenseNames[tense];
    const tableDiv = document.getElementById('conjugation-table');
    
    if (!tenseData || !tableDiv) return;
    
    let html = `<div style="padding: 15px; background: var(--gray-100); font-weight: 700; border-radius: 16px 16px 0 0;">${info.title}</div>`;
    
    if (tense === 'perfekt') {
        html += `
            <div class="conjugation-row">
                <div class="conjugation-person">${info.persons[0]}</div>
                <div class="conjugation-form">${tenseData.helper}</div>
            </div>
            <div class="conjugation-row">
                <div class="conjugation-person">${info.persons[1]}</div>
                <div class="conjugation-form">${tenseData.pastParticiple}</div>
            </div>
            <div class="conjugation-row" style="background: var(--primary-light);">
                <div class="conjugation-person">مثال کامل</div>
                <div class="conjugation-form">${tenseData.helper === 'haben' ? 'ich habe' : 'ich bin'} ${tenseData.pastParticiple}</div>
            </div>
        `;
    } else {
        for (const person of info.persons) {
            const form = tenseData[person];
            if (form) {
                html += `
                    <div class="conjugation-row">
                        <div class="conjugation-person">${person}</div>
                        <div class="conjugation-form">${form}</div>
                    </div>
                `;
            }
        }
    }
    
    tableDiv.innerHTML = html;
};

GermanDictionary.prototype.showVerbExamples = function(verb) {
    const examplesList = document.getElementById('examples-list');
    if (!examplesList) return;
    
    // مثال‌های پیش‌فرض برای هر فعل
    const defaultExamples = [
        { german: `${verb} ist ein wichtiges Verb im Deutschen.`, persian: `${verb} یک فعل مهم در آلمانی است.` },
        { german: `Ich möchte ${verb} lernen.`, persian: `من می‌خواهم ${verb} را یاد بگیرم.` },
        { german: `Kannst du mir ${verb} erklären?`, persian: `می‌توانی ${verb} را برای من توضیح دهی؟` }
    ];
    
    const examplesHtml = defaultExamples.map((ex, idx) => `
        <div class="example-item">
            <div class="example-german">${this.escapeHtml(ex.german)}</div>
            <div class="example-persian">📖 ${this.escapeHtml(ex.persian)}</div>
            <button class="btn btn-sm btn-outline speak-example-btn" data-example="${idx}" style="margin-top: 8px; padding: 4px 12px;">
                <i class="fas fa-volume-up"></i> تلفظ مثال
            </button>
        </div>
    `).join('');
    
    examplesList.innerHTML = examplesHtml;
    
    // تلفظ مثال‌ها
    document.querySelectorAll('.speak-example-btn').forEach((btn, idx) => {
        btn.onclick = () => {
            const exampleText = defaultExamples[idx].german;
            this.speakText(exampleText, 'de-DE');
        };
    });
};

GermanDictionary.prototype.filterVerbsList = function(filter) {
    if (!window.VerbsDatabase) return;
    
    const allVerbs = window.VerbsDatabase.getAllVerbs();
    let filtered = allVerbs;
    
    if (filter === 'regular') {
        filtered = allVerbs.filter(v => v.type === 'regular');
    } else if (filter === 'irregular') {
        filtered = allVerbs.filter(v => v.type === 'irregular');
    } else if (filter === 'A1' || filter === 'A2' || filter === 'B1' || filter === 'B2') {
        filtered = allVerbs.filter(v => v.level === filter);
    }
    
    const suggestionsDiv = document.getElementById('verb-suggestions');
    if (!suggestionsDiv) return;
    
    suggestionsDiv.style.display = 'block';
    suggestionsDiv.innerHTML = filtered.slice(0, 30).map(verb => `
        <div class="verb-suggestion-item" data-verb="${verb.german}">
            <div>
                <span class="verb-suggestion-word">${this.escapeHtml(verb.german)}</span>
                <span class="verb-suggestion-type ${verb.type}">${verb.type === 'regular' ? 'با قاعده' : 'بی‌قاعده'}</span>
                ${verb.level !== 'A1-B2' ? `<span class="badge" style="background: #6b7280;">${verb.level}</span>` : ''}
            </div>
            <div style="color: var(--gray-500);">${verb.persian || 'فعل آلمانی'}</div>
        </div>
    `).join('');
    
    document.querySelectorAll('.verb-suggestion-item').forEach(item => {
        item.onclick = () => {
            const verb = item.dataset.verb;
            const searchInput = document.getElementById('verb-search-input');
            if (searchInput) {
                searchInput.value = verb;
                suggestionsDiv.style.display = 'none';
                this.showVerbConjugation(verb);
            }
        };
    });
};

GermanDictionary.prototype.startVerbPractice = async function(verb) {
    const conjugation = window.VerbsDatabase.getConjugation(verb);
    if (!conjugation) {
        this.showToast('❌ اطلاعاتی برای این فعل یافت نشد', 'error');
        return;
    }
    
    this.verbPracticeSession = {
        verb: verb,
        tenses: ['present', 'praeteritum', 'perfekt'],
        currentIndex: 0,
        score: 0,
        conjugation: conjugation
    };
    
    this.showVerbPracticeQuestion();
};

GermanDictionary.prototype.showVerbPracticeQuestion = function() {
    const session = this.verbPracticeSession;
    if (!session) return;
    
    if (session.currentIndex >= session.tenses.length) {
        this.showToast(`🎯 تمرین پایان یافت! نمره: ${session.score}/${session.tenses.length}`, 'info');
        this.verbPracticeSession = null;
        return;
    }
    
    const tense = session.tenses[session.currentIndex];
    const conjugation = session.conjugation;
    
    const tenseNames = {
        present: 'Präsens (حال ساده)',
        praeteritum: 'Präteritum (گذشته ساده)',
        perfekt: 'Perfekt (گذشته کامل)'
    };
    
    let question = '';
    let correctAnswer = '';
    
    if (tense === 'perfekt') {
        question = `فعل کمکی برای "${session.verb}" در زمان Perfekt چیست؟`;
        correctAnswer = conjugation.perfekt?.helper || 'haben';
    } else {
        const persons = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
        const randomPerson = persons[Math.floor(Math.random() * persons.length)];
        question = `صرف "${session.verb}" در زمان ${tenseNames[tense]} برای شخص ${randomPerson}:`;
        correctAnswer = conjugation[tense]?.[randomPerson] || session.verb;
    }
    
    const answer = prompt(`${question}\n\nپاسخ خود را وارد کنید:`);
    
    if (answer && answer.toLowerCase().trim() === correctAnswer.toLowerCase()) {
        session.score++;
        this.showToast('✅ پاسخ صحیح!', 'success');
    } else {
        this.showToast(`❌ پاسخ صحیح: ${correctAnswer}`, 'error');
    }
    
    session.currentIndex++;
    setTimeout(() => this.showVerbPracticeQuestion(), 1500);
};

GermanDictionary.prototype.saveVerbToDictionary = async function(verb, verbInfo) {
    const german = verb;
    const persian = verbInfo?.meaning || prompt('معنی فارسی این فعل را وارد کنید:', '');
    
    if (!persian) return;
    
    const conjugation = this.currentConjugation || window.VerbsDatabase.getConjugation(verb);
    
    const wordData = {
        german: german,
        persian: persian,
        type: 'verb',
        createdAt: new Date().toISOString(),
        verbForms: {
            present: conjugation?.present?.ich || german,
            past: conjugation?.praeteritum?.ich || german + 'te',
            perfect: conjugation?.perfekt?.pastParticiple || 'ge' + german + 't'
        }
    };
    
    try {
        await this.addWord(wordData);
        this.showToast(`✅ فعل "${german}" به دیکشنری اضافه شد`, 'success');
    } catch (error) {
        this.showToast(`❌ خطا در ذخیره فعل: ${error.message}`, 'error');
    }
};


GermanDictionary.prototype.startSentenceCompletionPractice = async function() {
    const wordsToPractice = await this.getFilteredWordsForPractice();
    
    let wordsWithExamples = [];
    
    for (let word of wordsToPractice) {
        const examples = await this.getExamplesForWord(word.id);
        if (examples && examples.length > 0) {
            wordsWithExamples.push({
                word: word,
                examples: examples
            });
        }
    }
    
    if (wordsWithExamples.length < 2) {
        this.showToast('❌ برای این تمرین به مثال نیاز دارید. لطفاً برای لغات مثال اضافه کنید.', 'error');
        return;
    }
    
    const activeCount = document.querySelector('.count-option.active');
    let questionCount = activeCount ? (activeCount.dataset.count === 'all' ? wordsWithExamples.length : parseInt(activeCount.dataset.count)) : 10;
    
    if (wordsWithExamples.length < questionCount) {
        questionCount = wordsWithExamples.length;
    }
    
    let selectedWords = this.shuffleArray([...wordsWithExamples]).slice(0, questionCount);
    
    this.sentenceSession = {
        questions: [],
        currentIndex: 0,
        score: 0
    };
    
    for (let item of selectedWords) {
        const word = item.word;
        const example = item.examples[0];
        
        let exampleText = example.german;
        let exampleTrans = example.persian || '';
        let wordsInExample = exampleText.split(' ');
        
        if (wordsInExample.length < 3) {
            wordsInExample = exampleText.split(' ');
        }
        
        let randomIndex = Math.floor(Math.random() * wordsInExample.length);
        let removedWord = wordsInExample[randomIndex];
        wordsInExample[randomIndex] = '______';
        let questionText = wordsInExample.join(' ');
        
        let otherWords = wordsWithExamples.filter(w => w.word.id !== word.id).slice(0, 3);
        let options = [removedWord];
        
        for (let other of otherWords) {
            let otherExample = other.examples[0].german;
            let randomWord = otherExample.split(' ')[Math.floor(Math.random() * otherExample.split(' ').length)];
            options.push(randomWord);
        }
        options = this.shuffleArray(options);
        
        this.sentenceSession.questions.push({
            word: word,
            questionText: questionText,
            exampleTrans: exampleTrans,
            correctAnswer: removedWord,
            options: options,
            persianMeaning: word.persian
        });
    }
    
    this.showToast(`📊 تعداد جملات در این بازه: ${this.sentenceSession.questions.length} جمله`, 'info');
    
    this.showSentenceCompletionQuestion();
    this.showSection('practice-section');
};

GermanDictionary.prototype.showSentenceCompletionQuestion = function() {
    if (this.sentenceSession.currentIndex >= this.sentenceSession.questions.length) {
        this.showSentenceCompletionResults();
        return;
    }
    
    const q = this.sentenceSession.questions[this.sentenceSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    const current = this.sentenceSession.currentIndex + 1;
    const total = this.sentenceSession.questions.length;
    const progress = (current - 1) / total * 100;
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fa-solid fa-file-lines"></i> ${isGerman ? 'تکمیل جمله' : 'Sentence Completion'}</h2>
                <span class="badge" style="background: linear-gradient(135deg, #10b981, #059669);">${current}/${total}</span>
            </div>
            
            <div style="text-align: center; padding: 30px 20px;">
                <div style="background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 20px; padding: 25px; margin-bottom: 20px;">
                    <div style="font-size: 14px; color: #065f46; margin-bottom: 10px;">
                        <i class="fa-solid fa-quote-right"></i> ${isGerman ? 'کلمه مناسب را در جمله پیدا کنید:' : 'Find the right word in the sentence:'}
                    </div>
                    <div style="font-size: 18px; font-weight: 500; color: #064e3b; direction: ltr; text-align: center; line-height: 1.6; word-break: break-word;">
                        ${q.questionText}
                    </div>
                    ${q.exampleTrans ? `<div style="font-size: 14px; color: #047857; margin-top: 15px;">📖 ترجمه: ${q.exampleTrans}</div>` : ''}
                </div>
                
                <div style="background: #f0fdf4; border-radius: 12px; padding: 10px; margin-bottom: 25px;">
                    <span style="font-size: 14px; color: #065f46;">
                        <i class="fa-solid fa-lightbulb"></i> ${isGerman ? 'راهنما:' : 'Hint:'} 
                        ${isGerman ? 'جمله درباره' : 'The sentence is about'} "${q.persianMeaning}"
                    </span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    ${q.options.map((opt, idx) => `
                        <button class="sentence-option-btn" data-answer="${this.escapeHtml(opt)}" data-index="${idx}"
                            style="padding: 14px 20px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 50px; color: white; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s ease;">
                            ${this.escapeHtml(opt)}
                        </button>
                    `).join('')}
                </div>
                
                <div id="sentence-feedback" style="margin-top: 20px; font-size: 16px; min-height: 60px;"></div>
                
                <div style="width: 70%; margin: 20px auto 0; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.3s ease;"></div>
                </div>
            </div>
        </div>
    `;
    
    // ========== راه اندازی رویدادها با استفاده از self ==========
    const self = this;
    const btns = document.querySelectorAll('.sentence-option-btn');
    
    for (let i = 0; i < btns.length; i++) {
        const btn = btns[i];
        const answer = btn.getAttribute('data-answer');
        
        btn.onclick = function(e) {
            e.preventDefault();
            console.log('کلیک شد:', answer);
            
            const currentQ = self.sentenceSession.questions[self.sentenceSession.currentIndex];
            const feedbackDiv = document.getElementById('sentence-feedback');
            const isCorrect = (answer === currentQ.correctAnswer);
            
            if (isCorrect) {
                self.sentenceSession.score++;
                feedbackDiv.innerHTML = `<span style="color: #10b981; font-size: 18px;">✅ ${isGerman ? 'آفرین! پاسخ صحیح است' : 'Correct!'}</span>`;
                btn.style.background = 'linear-gradient(135deg, #059669, #047857)';
                btn.style.transform = 'scale(1.05)';
            } else {
                feedbackDiv.innerHTML = `<span style="color: #ef4444; font-size: 16px;">❌ ${isGerman ? 'پاسخ صحیح:' : 'Correct answer:'} <strong>${currentQ.correctAnswer}</strong></span>`;
                btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                
                for (let j = 0; j < btns.length; j++) {
                    if (btns[j].getAttribute('data-answer') === currentQ.correctAnswer) {
                        btns[j].style.background = 'linear-gradient(135deg, #059669, #047857)';
                    }
                }
            }
            
            for (let j = 0; j < btns.length; j++) {
                btns[j].disabled = true;
                btns[j].style.opacity = '0.6';
            }
            
            self.recordPractice(currentQ.word.id, isCorrect);
            
            setTimeout(() => {
                self.sentenceSession.currentIndex++;
                self.showSentenceCompletionQuestion();
            }, 1500);
        };
    }
};

GermanDictionary.prototype.checkSentenceAnswer = async function(selected) {
    console.log('بررسی پاسخ:', selected);
    
    const q = this.sentenceSession.questions[this.sentenceSession.currentIndex];
    const feedbackDiv = document.getElementById('sentence-feedback');
    const isGerman = LanguageSystem.isGerman();
    const buttons = document.querySelectorAll('.sentence-option-btn');
    const isCorrect = (selected === q.correctAnswer);
    
    console.log('پاسخ صحیح:', q.correctAnswer);
    
    if (!feedbackDiv) return;
    
    // غیرفعال کردن دکمه‌ها
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
        buttons[i].style.opacity = '0.6';
        buttons[i].style.cursor = 'default';
    }
    
    if (isCorrect) {
        this.sentenceSession.score++;
        feedbackDiv.innerHTML = `<span style="color: #10b981; font-size: 18px; font-weight: 600;">✅ ${isGerman ? 'آفرین! پاسخ صحیح است' : 'Correct!'}</span>`;
        
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].getAttribute('data-answer') === selected) {
                buttons[i].style.background = 'linear-gradient(135deg, #059669, #047857)';
                buttons[i].style.transform = 'scale(1.05)';
            }
        }
    } else {
        feedbackDiv.innerHTML = `<span style="color: #ef4444; font-size: 16px; font-weight: 600;">
            ❌ ${isGerman ? 'پاسخ صحیح:' : 'Correct answer:'} <strong>${q.correctAnswer}</strong>
        </span>`;
        
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].getAttribute('data-answer') === selected) {
                buttons[i].style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            }
            if (buttons[i].getAttribute('data-answer') === q.correctAnswer) {
                buttons[i].style.background = 'linear-gradient(135deg, #059669, #047857)';
            }
        }
    }
    
    await this.recordPractice(q.word.id, isCorrect);
    
    setTimeout(() => {
        this.sentenceSession.currentIndex++;
        this.showSentenceCompletionQuestion();
    }, 1500);
};

GermanDictionary.prototype.showSentenceCompletionResults = function() {
    const accuracy = Math.round((this.sentenceSession.score / this.sentenceSession.questions.length) * 100);
    const isGerman = LanguageSystem.isGerman();
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fa-solid fa-chart-line"></i> ${isGerman ? 'نتایج تمرین تکمیل جمله' : 'Sentence Completion Results'}</h2>
            </div>
            
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 70px; margin-bottom: 20px;">📝</div>
                <div style="font-size: 48px; font-weight: 800; color: ${accuracy >= 70 ? '#10b981' : '#f59e0b'}; margin-bottom: 30px;">${accuracy}%</div>
                
                <div style="display: flex; justify-content: center; gap: 50px; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'تعداد جملات' : 'Sentences'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${this.sentenceSession.questions.length}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'پاسخ صحیح' : 'Correct'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: #10b981;">${this.sentenceSession.score}</div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                <button id="restart-sentence-btn" class="btn btn-primary"><i class="fa-solid fa-rotate-right"></i> ${isGerman ? 'تمرین مجدد' : 'Practice Again'}</button>
                <button id="back-sentence-btn" class="btn btn-outline"><i class="fa-solid fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}</button>
            </div>
        </div>
    `;
    
    document.getElementById('restart-sentence-btn').onclick = () => this.startSentenceCompletionPractice();
    document.getElementById('back-sentence-btn').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
};

GermanDictionary.prototype.renderSRSStats = function() {
    const totalWords = Object.keys(this.srsData).length;
    const reviewToday = this.reviewWords.length;
    
    // محاسبه سطح متوسط
    let totalLevel = 0;
    for (const wordId in this.srsData) {
        totalLevel += this.srsData[wordId].level;
    }
    const avgLevel = totalWords > 0 ? (totalLevel / totalWords).toFixed(1) : 0;
    
    // نمایش در stats-grid یا جای دیگه
    const srsStatsHtml = `
        <div class="stat-card srs-stats">
            <div class="stat-icon">🧠</div>
            <div class="stat-title">سیستم تکرار هوشمند</div>
            <div class="stat-value">${reviewToday}</div>
            <div class="stat-change">لغت برای مرور امروز</div>
            <div class="stat-change">سطح متوسط: ${avgLevel}/5</div>
        </div>
    `;
    
    const statsGrid = document.getElementById('stats-grid');
    if (statsGrid && !document.querySelector('.srs-stats')) {
        statsGrid.insertAdjacentHTML('beforeend', srsStatsHtml);
    }
};

GermanDictionary.prototype.applySortToFilteredWordsAsync = async function(words, sortType) {
    switch(sortType) {
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
        case 'srs-level':
            words.sort((a, b) => {
                const levelA = this.srsData[a.id]?.level || 0;
                const levelB = this.srsData[b.id]?.level || 0;
                return levelB - levelA;
            });
            break;
        case 'practice-count':
            const practiceHistory = await this.getAllPracticeHistory();
            const practiceCounts = {};
            practiceHistory.forEach(p => {
                practiceCounts[p.wordId] = (practiceCounts[p.wordId] || 0) + 1;
            });
            words.sort((a, b) => (practiceCounts[b.id] || 0) - (practiceCounts[a.id] || 0));
            break;
        case 'accuracy':
            const history = await this.getAllPracticeHistory();
            const correctMap = {};
            const totalMap = {};
            history.forEach(p => {
                if (p.correct) correctMap[p.wordId] = (correctMap[p.wordId] || 0) + 1;
                totalMap[p.wordId] = (totalMap[p.wordId] || 0) + 1;
            });
            words.sort((a, b) => {
                const accA = (correctMap[a.id] || 0) / (totalMap[a.id] || 1);
                const accB = (correctMap[b.id] || 0) / (totalMap[b.id] || 1);
                return accB - accA;
            });
            break;
        case 'random':
            // تصادفی - هیچ کاری نکن (مرتب‌سازی نمیشه)
            break;
    }
    return words;
};

GermanDictionary.prototype.getFilteredWordsForPractice = async function() {
    const activeRange = document.querySelector('.range-option.active');
    let rangeType = activeRange ? activeRange.dataset.range : 'all';
    
    const activeCount = document.querySelector('.count-option.active');
    let count = activeCount ? (activeCount.dataset.count === 'all' ? 9999 : parseInt(activeCount.dataset.count)) : 20;
    
    let allWords = await this.getAllWords();
    
    if (allWords.length === 0) {
        this.showToast('❌ هیچ لغتی برای تمرین وجود ندارد', 'error');
        return [];
    }
    
    // ========== مرحله 1: مرتب‌سازی بر اساس sortType ذخیره شده ==========
    const savedSort = localStorage.getItem('wordListSort') || 'alphabetical';
    this.applySortToFilteredWords(allWords, savedSort);
    
    // ========== مرحله 2: فیلتر بر اساس پوشه (اگر انتخاب شده) ==========
    let folderFilteredWords = [...allWords];
    let tagName = '';
    let hasTagFilter = false;
    
    if (this.selectedPracticeTag && this.selectedPracticeTag !== 'all') {
        const tagWords = await this.getWordsByTag(this.selectedPracticeTag);
        const tagWordIds = new Set(tagWords.map(w => w.id));
        folderFilteredWords = allWords.filter(w => tagWordIds.has(w.id));
        hasTagFilter = true;
        
        const tag = this.getAllTags().find(t => t.id === this.selectedPracticeTag);
        tagName = tag ? tag.name : '';
        
        if (folderFilteredWords.length === 0) {
            this.showToast(`📁 هیچ لغتی در پوشه "${tagName}" وجود ندارد`, 'warning');
            return [];
        }
        
        console.log(`📁 پوشه "${tagName}" - ${folderFilteredWords.length} لغت (مرتب شده بر اساس ${savedSort})`);
    }
    
    // ========== مرحله 3: فیلتر بر اساس نوع کلمه ==========
    const activeFilter = document.querySelector('.filter-btn.active');
    let filterType = activeFilter ? activeFilter.dataset.filter : 'all';
    
    let typeFilteredWords = [...folderFilteredWords];
    
    switch(filterType) {
        case 'favorites':
            typeFilteredWords = folderFilteredWords.filter(word => this.favorites.has(word.id));
            break;
        case 'nouns':
            typeFilteredWords = folderFilteredWords.filter(word => word.type === 'noun');
            break;
        case 'verbs':
            typeFilteredWords = folderFilteredWords.filter(word => word.type === 'verb');
            break;
        case 'adjectives':
            typeFilteredWords = folderFilteredWords.filter(word => word.type === 'adjective');
            break;
        case 'adverbs':
            typeFilteredWords = folderFilteredWords.filter(word => word.type === 'adverb');
            break;
        default:
            break;
    }
    
    if (typeFilteredWords.length === 0) {
        let msg = hasTagFilter ? `در پوشه "${tagName}"` : '';
        this.showToast(`❌ هیچ لغتی ${msg} با این فیلتر وجود ندارد`, 'error');
        return [];
    }
    
    // ========== مرحله 4: اعمال محدوده (Range) روی لیست مناسب ==========
    // مهم: اگر پوشه انتخاب شده، محدوده از folderFilteredWords گرفته می‌شود
    // اگر پوشه انتخاب نشده، محدوده از typeFilteredWords (همون کل لغات فیلتر شده) گرفته می‌شود
    
    let baseListForRange = hasTagFilter ? folderFilteredWords : typeFilteredWords;
    let rangeFilteredWords = [];
    
    switch(rangeType) {
        case 'favorites':
            rangeFilteredWords = baseListForRange.filter(word => this.favorites.has(word.id));
            if (rangeFilteredWords.length === 0) {
                this.showToast('⭐ هیچ لغت مورد علاقه‌ای در این لیست وجود ندارد', 'warning');
                return [];
            }
            break;
            
        case 'recent':
            // 50 لغت جدید از لیست پایه (که اگر پوشه باشه، از پوشه میگیره)
            rangeFilteredWords = baseListForRange.slice(0, Math.min(50, baseListForRange.length));
            break;
            
        case 'custom':
            const startInput = document.getElementById('range-start');
            const endInput = document.getElementById('range-end');
            let start = parseInt(startInput?.value) || 1;
            let end = parseInt(endInput?.value) || baseListForRange.length;
            
            if (start < 1) start = 1;
            if (end > baseListForRange.length) end = baseListForRange.length;
            if (start > end) {
                this.showToast(`❌ محدوده نامعتبر (از ${start} تا ${end})`, 'error');
                return [];
            }
            
            // ========== کلید اصلی: برش از baseListForRange (که اگر پوشه باشه، همون پوشه است) ==========
            rangeFilteredWords = baseListForRange.slice(start - 1, end);
            
            let rangeMsg = `📏 محدوده ${start} تا ${end} از ${baseListForRange.length} لغت`;
            if (hasTagFilter) {
                rangeMsg += ` در پوشه "${tagName}"`;
                // نمایش سورت فعلی برای شفافیت
                if (savedSort === 'date-desc') rangeMsg += ` (مرتب شده بر اساس جدیدترین)`;
                else if (savedSort === 'date-asc') rangeMsg += ` (مرتب شده بر اساس قدیمی‌ترین)`;
                else if (savedSort === 'alphabetical') rangeMsg += ` (مرتب شده بر اساس الفبای آلمانی)`;
            }
            this.showToast(rangeMsg, 'info');
            break;
            
        default: // 'all'
            rangeFilteredWords = [...baseListForRange];
            break;
    }
    
    if (rangeFilteredWords.length === 0) {
        this.showToast('❌ هیچ لغتی در این محدوده وجود ندارد', 'error');
        return [];
    }
    
    // محدود کردن تعداد بر اساس تنظیمات Count
    let finalCount = count;
    if (finalCount === 9999 || finalCount > rangeFilteredWords.length) {
        finalCount = rangeFilteredWords.length;
    }
    
    // ========== مرحله 5: اولویت با لغات نیاز به مرور (SRS) ==========
    this.updateReviewWords();
    const validWordIds = new Set(allWords.map(w => w.id));
    this.reviewWords = this.reviewWords.filter(id => validWordIds.has(id));
    
    const needReview = rangeFilteredWords.filter(word => this.reviewWords.includes(word.id));
    const otherWords = rangeFilteredWords.filter(word => !this.reviewWords.includes(word.id));
    
    let result = [];
    const usedIds = new Set();
    
    for (const word of needReview) {
        if (result.length >= finalCount) break;
        if (!usedIds.has(word.id)) {
            usedIds.add(word.id);
            result.push(word);
        }
    }
    
    if (result.length < finalCount) {
        const shuffledOther = this.shuffleArray([...otherWords]);
        for (const word of shuffledOther) {
            if (result.length >= finalCount) break;
            if (!usedIds.has(word.id)) {
                usedIds.add(word.id);
                result.push(word);
            }
        }
    }
    
    // ========== مرحله 6: ترتیب نهایی سوالات (Order) ==========
    const activeOrder = document.querySelector('.order-option.active');
    const order = activeOrder ? activeOrder.dataset.order : 'random';
    
    if (order === 'sequential') {
        result.sort((a, b) => a.german.localeCompare(b.german, 'de'));
    } else if (order === 'hardest') {
        const history = await this.getAllPracticeHistory();
        const errorCounts = {};
        history.forEach(record => {
            if (!record.correct) {
                errorCounts[record.wordId] = (errorCounts[record.wordId] || 0) + 1;
            }
        });
        result.sort((a, b) => (errorCounts[b.id] || 0) - (errorCounts[a.id] || 0));
    }
    
    // ========== پیام نهایی ==========
    let summaryMsg = '';
    if (hasTagFilter) summaryMsg += `📁 پوشه "${tagName}" | `;
    if (rangeType === 'custom') summaryMsg += `📏 محدوده دلخواه | `;
    else if (rangeType === 'favorites') summaryMsg += `⭐ علاقه‌مندی‌ها | `;
    else if (rangeType === 'recent') summaryMsg += `🆕 جدیدترین | `;
    else if (rangeType === 'all') summaryMsg += `🌍 همه لغات | `;
    summaryMsg += `📊 ${result.length} لغت`;
    
    const reviewCount = result.filter(w => this.reviewWords.includes(w.id)).length;
    if (reviewCount > 0) summaryMsg += ` (${reviewCount} لغت نیاز به مرور)`;
    this.showToast(summaryMsg, 'info');
    
    return result;
};

GermanDictionary.prototype.getWordsForPractice = async function() {
    const activeRange = document.querySelector('.range-option.active');
    const rangeType = activeRange ? activeRange.dataset.range : 'all';
    
    const activeCount = document.querySelector('.count-option.active');
    let count = activeCount ? (activeCount.dataset.count === 'all' ? 9999 : parseInt(activeCount.dataset.count)) : 20;
    
    let allWords = await this.getAllWords();
    
    if (allWords.length === 0) {
        this.showToast('❌ هیچ لغتی برای تمرین وجود ندارد', 'error');
        return [];
    }
    
    // ========== مهم: اطمینان از صحت SRS و reviewWords ==========
    // بررسی و حذف آیدی‌های نامعتبر از reviewWords
    const validWordIds = new Set(allWords.map(w => w.id));
    this.reviewWords = this.reviewWords.filter(id => validWordIds.has(id));
    
    // دریافت فیلتر فعال (از لیست لغات)
    const activeFilter = document.querySelector('.filter-btn.active');
    const filterType = activeFilter ? activeFilter.dataset.filter : 'all';
    
    // اعمال فیلتر
    let filteredWords = [...allWords];
    
    switch(filterType) {
        case 'favorites':
            filteredWords = filteredWords.filter(word => this.favorites.has(word.id));
            break;
        case 'nouns':
            filteredWords = filteredWords.filter(word => word.type === 'noun');
            break;
        case 'verbs':
            filteredWords = filteredWords.filter(word => word.type === 'verb');
            break;
        case 'adjectives':
            filteredWords = filteredWords.filter(word => word.type === 'adjective');
            break;
        case 'adverbs':
            filteredWords = filteredWords.filter(word => word.type === 'adverb');
            break;
        default:
            filteredWords = [...allWords];
            break;
    }
    
    if (filteredWords.length === 0) {
        this.showToast('❌ هیچ لغتی با این فیلتر وجود ندارد', 'error');
        return [];
    }
    
    // ========== اعمال مرتب‌سازی ==========
    const savedSort = localStorage.getItem('wordListSort') || 'alphabetical';
    if (savedSort !== 'random') {
        this.applySortToFilteredWords(filteredWords, savedSort);
    }
    
    // ========== گرفتن محدوده ==========
    let rangeFilteredWords = [];
    
    switch(rangeType) {
        case 'tag':
    if (this.selectedPracticeTag) {
        const tagWords = await this.getWordsByTag(this.selectedPracticeTag);
        if (tagWords.length === 0) {
            this.showToast('📁 هیچ لغتی در این پوشه وجود ندارد', 'warning');
            return [];
        }
        rangeFilteredWords = tagWords;
    } else {
        rangeFilteredWords = [...allWords];
    }
    break;
        case 'favorites':
            rangeFilteredWords = filteredWords.filter(word => this.favorites.has(word.id));
            if (rangeFilteredWords.length === 0) {
                this.showToast('⭐ ابتدا لغاتی را به علاقه‌مندی‌ها اضافه کنید', 'warning');
                return [];
            }
            break;
            
        case 'recent':
            rangeFilteredWords = filteredWords.slice(0, Math.min(50, filteredWords.length));
            break;
            
        case 'custom':
            const startInput = document.getElementById('range-start');
            const endInput = document.getElementById('range-end');
            let start = parseInt(startInput?.value) || 1;
            let end = parseInt(endInput?.value) || filteredWords.length;
            
            if (start < 1) start = 1;
            if (end > filteredWords.length) end = filteredWords.length;
            if (start > end) {
                this.showToast(`❌ محدوده نامعتبر`, 'error');
                return [];
            }
            
            rangeFilteredWords = filteredWords.slice(start - 1, end);
            break;
            
        default:
            rangeFilteredWords = [...filteredWords];
            break;
    }
    
    if (rangeFilteredWords.length === 0) {
        this.showToast('❌ هیچ لغتی در این محدوده وجود ندارد', 'error');
        return [];
    }
    
    // محدود کردن تعداد
    let finalCount = count;
    if (finalCount === 9999 || finalCount > rangeFilteredWords.length) {
        finalCount = rangeFilteredWords.length;
    }
    
    // ========== اولویت با لغات نیاز به مرور (SRS) ==========
    this.updateReviewWords();
    
    // فقط آیدی‌های معتبر را نگه دار
    this.reviewWords = this.reviewWords.filter(id => validWordIds.has(id));
    
    const needReview = rangeFilteredWords.filter(word => this.reviewWords.includes(word.id));
    const otherWords = rangeFilteredWords.filter(word => !this.reviewWords.includes(word.id));
    
    let result = [];
    const usedIds = new Set();
    
    // اول اضافه کردن لغات نیاز به مرور
    for (const word of needReview) {
        if (result.length >= finalCount) break;
        if (!usedIds.has(word.id)) {
            usedIds.add(word.id);
            result.push(word);
        }
    }
    
    // سپس بقیه لغات (تصادفی)
    if (result.length < finalCount) {
        const shuffledOther = this.shuffleArray([...otherWords]);
        for (const word of shuffledOther) {
            if (result.length >= finalCount) break;
            if (!usedIds.has(word.id)) {
                usedIds.add(word.id);
                result.push(word);
            }
        }
    }
    
    const reviewCount = result.filter(w => this.reviewWords.includes(w.id)).length;
    if (reviewCount > 0 && reviewCount !== this.lastReviewCount) {
        this.showToast(`📚 ${reviewCount} لغت برای مرور امروز دارید!`, 'info');
        this.lastReviewCount = reviewCount;
    }
    
    console.log(`✅ تمرین: ${result.length} لغت انتخاب شد (${reviewCount} لغت نیاز به مرور)`);
    return result;
};

GermanDictionary.prototype.rebuildSRSFromHistory = async function() {
    const practiceHistory = await this.getAllPracticeHistory();
    const allWords = await this.getAllWords();
    const validWordIds = new Set(allWords.map(w => w.id));
    
    // پاک کردن SRS قبلی
    this.srsData = {};
    
    for (const record of practiceHistory) {
        const wordId = record.wordId;
        
        // اگر آیدی لغت معتبر نیست، رد کن
        if (!validWordIds.has(wordId)) continue;
        
        const isCorrect = record.correct;
        
        if (!this.srsData[wordId]) {
            this.srsData[wordId] = {
                level: 0,
                correctCount: 0,
                wrongCount: 0,
                lastPractice: record.date,
                nextReviewDate: record.date,
                totalCorrect: 0,
                totalWrong: 0
            };
        }
        
        if (isCorrect) {
            this.srsData[wordId].correctCount++;
            this.srsData[wordId].totalCorrect++;
            this.srsData[wordId].wrongCount = 0;
        } else {
            this.srsData[wordId].wrongCount++;
            this.srsData[wordId].totalWrong++;
            this.srsData[wordId].correctCount = 0;
        }
        
        // محاسبه سطح SRS
        const correctCount = this.srsData[wordId].correctCount;
        if (isCorrect) {
            if (correctCount >= 5 && this.srsData[wordId].level < 5) this.srsData[wordId].level = 5;
            else if (correctCount >= 4 && this.srsData[wordId].level < 4) this.srsData[wordId].level = 4;
            else if (correctCount >= 3 && this.srsData[wordId].level < 3) this.srsData[wordId].level = 3;
            else if (correctCount >= 2 && this.srsData[wordId].level < 2) this.srsData[wordId].level = 2;
            else if (correctCount >= 1 && this.srsData[wordId].level < 1) this.srsData[wordId].level = 1;
        } else {
            if (this.srsData[wordId].wrongCount >= 2) {
                this.srsData[wordId].level = Math.max(0, this.srsData[wordId].level - 1);
                this.srsData[wordId].correctCount = 0;
            }
        }
        
        this.srsData[wordId].lastPractice = record.date;
        
        // محاسبه تاریخ مرور بعدی
        const intervals = [1, 2, 4, 7, 14, 30];
        const daysToAdd = intervals[this.srsData[wordId].level] || 1;
        const nextReview = new Date(record.date);
        nextReview.setDate(nextReview.getDate() + daysToAdd);
        this.srsData[wordId].nextReviewDate = nextReview.toISOString();
    }
    
    // برای لغاتی که هیچ تمرینی ندارند، مقدار پیش‌فرض بده
    for (const word of allWords) {
        if (!this.srsData[word.id]) {
            this.srsData[word.id] = {
                level: 0,
                correctCount: 0,
                wrongCount: 0,
                lastPractice: new Date().toISOString(),
                nextReviewDate: new Date().toISOString(),
                totalCorrect: 0,
                totalWrong: 0
            };
        }
    }
    
    this.saveSRSData();
    this.updateReviewWords();
    console.log('✅ SRS از تاریخچه تمرین بازسازی شد، تعداد لغات:', Object.keys(this.srsData).length);
};

GermanDictionary.prototype.startPracticeSession = async function(wordIds = null) {
    let wordsToPractice;
    
    if (wordIds && wordIds.length > 0) {
        wordsToPractice = [];
        for (const id of wordIds) {
            const word = await this.getWord(id);
            if (word) wordsToPractice.push(word);
        }
    } else {
        wordsToPractice = await this.getFilteredWordsForPractice();
    }
    
    if (wordsToPractice.length === 0) {
        this.showToast('❌ هیچ لغتی برای تمرین وجود ندارد', 'error');
        return;
    }
    
    const activeOrder = document.querySelector('.order-option.active');
    const order = activeOrder ? activeOrder.dataset.order : 'random';
    
    let wordOrder;
    if (order === 'sequential') {
        wordOrder = [...Array(wordsToPractice.length).keys()];
    } else if (order === 'hardest') {
        const history = await this.getAllPracticeHistory();
        const errorCounts = {};
        history.forEach(record => {
            if (!record.correct) {
                errorCounts[record.wordId] = (errorCounts[record.wordId] || 0) + 1;
            }
        });
        const sortedIndices = [...Array(wordsToPractice.length).keys()];
        sortedIndices.sort((a, b) => (errorCounts[wordsToPractice[b]?.id] || 0) - (errorCounts[wordsToPractice[a]?.id] || 0));
        wordOrder = sortedIndices;
    } else {
        wordOrder = this.shuffleArray([...Array(wordsToPractice.length).keys()]);
    }
    
    this.practiceSession = {
        words: wordsToPractice,
        currentIndex: 0,
        correct: 0,
        incorrect: 0,
        wordOrder: wordOrder
    };
    
    this.showToast(`📊 تعداد لغات در این بازه: ${wordsToPractice.length} لغت`, 'info');
    
    this.showNextFlashcard();
    this.showSection('flashcards-section');
};

