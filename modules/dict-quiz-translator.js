/* dict-quiz-translator.js — Quiz & Translator v2 (lines 10852-12266) */

GermanDictionary.prototype._qzEsc = function(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
};

GermanDictionary.prototype._qzInjectStyles = function() {
    if (document.getElementById('qz-pro-styles')) return;
    const style = document.createElement('style');
    style.id = 'qz-pro-styles';
    style.textContent = `
      :root{
        --qz-bg:#f7f8fa;--qz-card:#fff;--qz-text:#1a1a2e;--qz-muted:#64748b;
        --qz-border:#e2e8f0;--qz-primary:#10b981;
      }
      body.dark-mode{
        --qz-bg:#0f1115;--qz-card:#1a1d24;--qz-text:#e4e6eb;--qz-muted:#9ca3af;
        --qz-border:#2a2e38;
      }

      .qz-root{font-family:'Vazirmatn',Tahoma,sans-serif;direction:rtl;color:var(--qz-text);max-width:760px;margin:0 auto;padding:8px 0;}
      .qz-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap;}
      .qz-head h2{font-size:18px;font-weight:800;margin:0;display:flex;align-items:center;gap:8px;}
      .qz-head h2 i{color:var(--qz-primary);}
      .qz-badge{font-size:11px;font-weight:700;padding:5px 12px;border-radius:999px;color:#fff;}
      .qz-badges{display:flex;gap:6px;flex-wrap:wrap;}

      .qz-card{background:var(--qz-card);border:1.5px solid var(--qz-border);border-radius:20px;padding:24px;
        box-shadow:0 8px 24px rgba(0,0,0,.06);position:relative;overflow:hidden;}
      body.dark-mode .qz-card{box-shadow:0 8px 24px rgba(0,0,0,.3);}
      .qz-card::before{content:"";position:absolute;top:-30px;left:-30px;width:140px;height:140px;border-radius:50%;
        background:radial-gradient(circle,rgba(16,185,129,.1) 0%,transparent 70%);pointer-events:none;}

      .qz-question{background:linear-gradient(135deg,rgba(16,185,129,.08),rgba(20,184,166,.08));
        border:1px solid rgba(16,185,129,.15);border-radius:16px;padding:20px;margin-bottom:20px;
        text-align:center;font-size:16px;font-weight:600;color:var(--qz-text);position:relative;z-index:1;}
      .qz-question strong{color:#10b981;font-size:20px;}

      .qz-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px;position:relative;z-index:1;}
      .qz-option{font-family:'Vazirmatn',Tahoma,sans-serif;font-size:14px;font-weight:700;padding:14px 18px;
        border-radius:14px;border:2px solid var(--qz-border);background:var(--qz-bg);color:var(--qz-text);
        cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;
        text-align:center;direction:ltr;}
      .qz-option:hover:not(.disabled){border-color:var(--qz-primary);transform:translateY(-2px);
        box-shadow:0 4px 12px rgba(16,185,129,.15);}
      .qz-option:active:not(.disabled){transform:scale(.97);}
      .qz-option.disabled{cursor:not-allowed;opacity:.7;}
      .qz-option.correct{border-color:#10b981;background:rgba(16,185,129,.12);color:#059669;}
      .qz-option.incorrect{border-color:#f43f5e;background:rgba(244,63,94,.12);color:#e11d48;}
      body.dark-mode .qz-option.correct{background:rgba(16,185,129,.18);color:#34d399;}
      body.dark-mode .qz-option.incorrect{background:rgba(244,63,94,.18);color:#fb7185;}

      .qz-feedback{padding:14px;border-radius:12px;font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px;margin-top:12px;position:relative;z-index:1;}
      .qz-feedback.correct{background:rgba(16,185,129,.1);color:#059669;border:1px solid rgba(16,185,129,.2);}
      .qz-feedback.incorrect{background:rgba(244,63,94,.1);color:#e11d48;border:1px solid rgba(244,63,94,.2);}
      body.dark-mode .qz-feedback.correct{background:rgba(16,185,129,.15);color:#34d399;}
      body.dark-mode .qz-feedback.incorrect{background:rgba(244,63,94,.15);color:#fb7185;}

      .qz-progress-wrap{margin-top:18px;display:flex;flex-direction:column;gap:6px;position:relative;z-index:1;}
      .qz-progress-bar{height:8px;background:var(--qz-bg);border-radius:999px;overflow:hidden;border:1px solid var(--qz-border);}
      .qz-progress-fill{height:100%;background:linear-gradient(90deg,#10b981,#14b8a6);transition:width .3s ease;border-radius:999px;}
      .qz-progress-info{display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:var(--qz-muted);}
      .qz-progress-stats{display:flex;gap:8px;}
      .qz-progress-stat{display:flex;align-items:center;gap:4px;}
      .qz-progress-dot{width:8px;height:8px;border-radius:50%;}
      .qz-progress-dot.correct{background:#10b981;}
      .qz-progress-dot.incorrect{background:#f43f5e;}

      .qz-rs-card{background:var(--qz-card);border:1.5px solid var(--qz-border);border-radius:20px;padding:28px;
        box-shadow:0 8px 24px rgba(0,0,0,.06);text-align:center;}
      body.dark-mode .qz-rs-card{box-shadow:0 8px 24px rgba(0,0,0,.3);}
      .qz-rs-title{font-size:20px;font-weight:800;margin:0 0 20px;display:flex;align-items:center;justify-content:center;gap:8px;}
      .qz-rs-title i{color:#f59e0b;}
      .qz-rs-circle{width:140px;height:140px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;}
      .qz-rs-circle-inner{width:110px;height:110px;border-radius:50%;background:var(--qz-card);display:flex;align-items:center;justify-content:center;}
      .qz-rs-circle-num{font-size:32px;font-weight:800;color:var(--qz-text);}
      .qz-rs-stats{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;}
      .qz-rs-stat{background:var(--qz-bg);border:1px solid var(--qz-border);border-radius:12px;padding:12px 18px;min-width:110px;}
      .qz-rs-stat-lbl{font-size:11px;font-weight:600;color:var(--qz-muted);margin-bottom:4px;}
      .qz-rs-stat-val{font-size:20px;font-weight:800;color:var(--qz-text);}
      .qz-rs-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
      .qz-btn{font-family:inherit;font-size:13px;font-weight:700;padding:11px 18px;border-radius:11px;border:none;
        cursor:pointer;color:#fff;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;gap:6px;}
      .qz-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
      .qz-btn-primary{background:linear-gradient(135deg,#10b981,#059669);}
      .qz-btn-outline{background:transparent;color:var(--qz-text);border:1.5px solid var(--qz-border);}

      @media(max-width:768px){
        .qz-card,.qz-rs-card{padding:18px;}
        .qz-question{font-size:14px;padding:16px;}
        .qz-question strong{font-size:18px;}
        .qz-option{font-size:13px;padding:12px 14px;}
        .qz-rs-circle{width:120px;height:120px;}
        .qz-rs-circle-inner{width:96px;height:96px;}
        .qz-rs-circle-num{font-size:26px;}
      }
      @media(max-width:480px){
        .qz-root{padding:4px 0;}
        .qz-card{padding:16px 14px;}
        .qz-options{grid-template-columns:1fr 1fr;gap:8px;}
        .qz-option{font-size:12px;padding:10px 8px;}
        .qz-rs-stats{flex-direction:column;align-items:stretch;}
        .qz-rs-stat{min-width:0;}
        .qz-rs-actions{flex-direction:column;}
        .qz-btn{width:100%;}
      }
    `;
    document.head.appendChild(style);
};

GermanDictionary.prototype.startQuiz = async function() {
    const wordsToPractice = await this.getFilteredWordsForPractice();

    if (wordsToPractice.length < 4) {
        this.showToast('حداقل به ۴ لغت برای شروع آزمون نیاز دارید', 'warning');
        return;
    }

    const activeCount = document.querySelector('.count-option.active');
    let questionCount = activeCount ? (activeCount.dataset.count === 'all' ? wordsToPractice.length : parseInt(activeCount.dataset.count)) : 10;

    if (wordsToPractice.length < questionCount) {
        questionCount = wordsToPractice.length;
    }

    const activeOrder = document.querySelector('.order-option.active');
    const order = activeOrder ? activeOrder.dataset.order : 'random';

    let selectedWords = [];
    if (order === 'sequential') {
        selectedWords = [...wordsToPractice].sort((a, b) => a.german.localeCompare(b.german, 'de')).slice(0, questionCount);
    } else if (order === 'hardest') {
        const history = await this.getAllPracticeHistory();
        const errorCounts = {};
        history.forEach(record => {
            if (!record.correct) {
                errorCounts[record.wordId] = (errorCounts[record.wordId] || 0) + 1;
            }
        });
        selectedWords = [...wordsToPractice].sort((a, b) => (errorCounts[b.id] || 0) - (errorCounts[a.id] || 0)).slice(0, questionCount);
    } else {
        selectedWords = this.shuffleArray([...wordsToPractice]).slice(0, questionCount);
    }

    this.quizSession = {
        words: selectedWords,
        currentIndex: 0,
        score: 0,
        mistakes: 0
    };

    this.showQuizQuestion();
    this.showSection('quiz-section');
};

GermanDictionary.prototype.showQuizQuestion = function() {
    this._qzInjectStyles();
    if (this.quizSession.currentIndex >= this.quizSession.words.length) {
        this.showQuizResults();
        return;
    }

    const word = this.quizSession.words[this.quizSession.currentIndex];
    const current = this.quizSession.currentIndex + 1;
    const total = this.quizSession.words.length;

    const questionType = Math.random() > 0.5 ? 'german_to_persian' : 'persian_to_german';
    const allOtherWords = this.quizSession.words.filter(w => w.id !== word.id);
    const shuffledOthers = this.shuffleArray([...allOtherWords]);

    let questionHtml = '';
    let correctAnswer = '';
    let options = [];

    if (questionType === 'german_to_persian') {
        questionHtml = 'معنی لغت <strong>' + this._qzEsc(word.german) + '</strong> چیست؟';
        correctAnswer = word.persian;
        const wrongOptions = [];
        for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
            const otherWord = shuffledOthers[i];
            if (otherWord && otherWord.persian && otherWord.persian !== correctAnswer) {
                wrongOptions.push(otherWord.persian);
            }
        }
        while (wrongOptions.length < 3) wrongOptions.push('—');
        options = [correctAnswer, ...wrongOptions];
    } else {
        questionHtml = 'معادل آلمانی <strong>' + this._qzEsc(word.persian) + '</strong> کدام است؟';
        correctAnswer = word.german;
        const wrongOptions = [];
        for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
            const otherWord = shuffledOthers[i];
            if (otherWord && otherWord.german && otherWord.german !== correctAnswer) {
                wrongOptions.push(otherWord.german);
            }
        }
        while (wrongOptions.length < 3) wrongOptions.push('—');
        options = [correctAnswer, ...wrongOptions];
    }

    options = this.shuffleArray(options);

    this.currentQuizQuestion = {
        word: word,
        correctAnswer: correctAnswer,
        options: options,
        questionType: questionType
    };

    const progress = (current - 1) / total * 100;
    const container = document.getElementById('quiz-section');
    if (!container) return;

    let optionsHtml = '';
    options.forEach((opt, idx) => {
        optionsHtml += '<button class="qz-option" data-answer="' + this._qzEsc(opt) + '" data-index="' + idx + '">' + this._qzEsc(opt) + '</button>';
    });

    container.innerHTML = '<div class="qz-root">' +
        '<div class="qz-head">' +
            '<h2><i class="fas fa-circle-question"></i> آزمون چهارگزینه‌ای</h2>' +
            '<div class="qz-badges">' +
                '<span class="qz-badge" style="background:linear-gradient(135deg,#f59e0b,#d97706);">' + current + ' / ' + total + '</span>' +
                '<span class="qz-badge" style="background:linear-gradient(135deg,#10b981,#059669);">امتیاز: ' + this.quizSession.score + '</span>' +
            '</div>' +
        '</div>' +
        '<div class="qz-card">' +
            '<div class="qz-question">' + questionHtml + '</div>' +
            '<div class="qz-options">' + optionsHtml + '</div>' +
            '<div id="quiz-feedback"></div>' +
            '<div class="qz-progress-wrap">' +
                '<div class="qz-progress-bar"><div class="qz-progress-fill" style="width:' + progress + '%"></div></div>' +
                '<div class="qz-progress-info">' +
                    '<span>' + current + ' / ' + total + '</span>' +
                    '<div class="qz-progress-stats">' +
                        '<div class="qz-progress-stat"><div class="qz-progress-dot correct"></div>' + this.quizSession.score + '</div>' +
                        '<div class="qz-progress-stat"><div class="qz-progress-dot incorrect"></div>' + this.quizSession.mistakes + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';

    this.answerLocked = false;

    const self = this;
    document.querySelectorAll('.qz-option').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (self.answerLocked) return;
            self.answerLocked = true;
            self.checkQuizAnswer(this.dataset.answer, this);
        });
    });
};

GermanDictionary.prototype.checkQuizAnswer = function(selectedAnswer, clickedBtn) {
    const question = this.currentQuizQuestion;
    const isCorrect = (selectedAnswer === question.correctAnswer);
    const feedbackDiv = document.getElementById('quiz-feedback');

    // غیرفعال کردن همه دکمه‌ها
    document.querySelectorAll('.qz-option').forEach(btn => {
        btn.classList.add('disabled');
        if (btn.dataset.answer === question.correctAnswer) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) {
        this.quizSession.score++;
        feedbackDiv.innerHTML = '<div class="qz-feedback correct"><i class="fas fa-check-circle"></i> پاسخ صحیح! آفرین!</div>';
    } else {
        this.quizSession.mistakes++;
        feedbackDiv.innerHTML = '<div class="qz-feedback incorrect"><i class="fas fa-times-circle"></i> پاسخ صحیح: <strong>' + this._qzEsc(question.correctAnswer) + '</strong></div>';
        if (clickedBtn) clickedBtn.classList.add('incorrect');
    }

    this.recordPractice(question.word.id, isCorrect);

    const self = this;
    setTimeout(function() {
        self.answerLocked = false;
        self.quizSession.currentIndex++;
        self.showQuizQuestion();
    }, 1500);
};

GermanDictionary.prototype.showQuizResults = function() {
    this._qzInjectStyles();
    const total = this.quizSession.words.length;
    const score = this.quizSession.score;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    const container = document.getElementById('quiz-section');
    if (!container) return;

    container.innerHTML = '<div class="qz-root">' +
        '<div class="qz-rs-card">' +
            '<div class="qz-rs-title"><i class="fas fa-trophy"></i> نتایج آزمون</div>' +
            '<div class="qz-rs-circle" style="background: conic-gradient(#10b981 0% ' + accuracy + '%, var(--qz-bg) ' + accuracy + '% 100%);">' +
                '<div class="qz-rs-circle-inner"><span class="qz-rs-circle-num">' + accuracy + '%</span></div>' +
            '</div>' +
            '<div class="qz-rs-stats">' +
                '<div class="qz-rs-stat"><div class="qz-rs-stat-lbl">تعداد سوالات</div><div class="qz-rs-stat-val">' + total + '</div></div>' +
                '<div class="qz-rs-stat"><div class="qz-rs-stat-lbl">پاسخ صحیح</div><div class="qz-rs-stat-val" style="color:#10b981;">' + score + '</div></div>' +
                '<div class="qz-rs-stat"><div class="qz-rs-stat-lbl">پاسخ نادرست</div><div class="qz-rs-stat-val" style="color:#f43f5e;">' + (total - score) + '</div></div>' +
            '</div>' +
            '<div class="qz-rs-actions">' +
                '<button class="qz-btn qz-btn-primary" id="restart-quiz-btn"><i class="fas fa-redo-alt"></i> آزمون جدید</button>' +
                '<button class="qz-btn qz-btn-outline" id="back-to-practice-btn"><i class="fas fa-arrow-right"></i> بازگشت</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.getElementById('restart-quiz-btn').onclick = () => this.startQuiz();
    document.getElementById('back-to-practice-btn').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
};

GermanDictionary.prototype.setupFilterButtons = function() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const filter = btn.getAttribute('data-filter');
            if (!filter) return;

            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // ریست صفحه فعلی هنگام تغییر فیلتر
            this._wlCurrentPage = 1;

            // نمایش لودینگ
            const container = document.getElementById('word-list-container');
            container.style.opacity = '0.5';

            await this.renderWordList(filter);

            container.style.opacity = '1';
        };
    });
};


GermanDictionary.prototype._injectTranslateProStyles = function() {
    if (document.getElementById('tr-pro-styles')) return;
    const style = document.createElement('style');
    style.id = 'tr-pro-styles';
    style.textContent = `
      :root{
        --tr-bg:#f7f8fa;--tr-card:#ffffff;--tr-text:#0f172a;--tr-muted:#64748b;
        --tr-border:#e2e8f0;--tr-primary:#06b6d4;--tr-primary-dark:#0891b2;
        --tr-primary-light:#ecfeff;--tr-success:#10b981;--tr-danger:#f43f5e;
        --tr-warning:#f59e0b;--tr-ink:#0f172a;
        --tr-shadow:0 8px 24px rgba(15,23,42,.06);
        --tr-shadow-lg:0 20px 40px rgba(15,23,42,.1);
      }
      body.dark-mode{
        --tr-bg:#0f1115;--tr-card:#171a21;--tr-text:#e4e6eb;--tr-muted:#9ca3af;
        --tr-border:#2a2e38;--tr-primary-light:#0e2a30;
        --tr-shadow:0 8px 24px rgba(0,0,0,.3);
        --tr-shadow-lg:0 20px 40px rgba(0,0,0,.45);
      }

      /* ===== wrapper ===== */
      .tr-wrap{font-family:'Vazirmatn',Tahoma,sans-serif;direction:rtl;color:var(--tr-text);
        max-width:840px;margin:0 auto;padding:8px 0;}
      .tr-wrap *{box-sizing:border-box;}

      /* ===== gradient hero header ===== */
      .tr-hero{position:relative;overflow:hidden;border-radius:24px;padding:26px 22px 22px;
        background:linear-gradient(135deg,#0f172a 0%,#1e293b 45%,#134e4a 100%);
        box-shadow:0 18px 40px rgba(15,23,42,.25);margin-bottom:18px;}
      .tr-hero::before{content:"";position:absolute;top:-60px;right:-40px;width:220px;height:220px;
        border-radius:50%;background:radial-gradient(circle,rgba(6,182,212,.45) 0%,transparent 70%);
        filter:blur(10px);pointer-events:none;}
      .tr-hero::after{content:"";position:absolute;bottom:-70px;left:-40px;width:200px;height:200px;
        border-radius:50%;background:radial-gradient(circle,rgba(16,185,129,.35) 0%,transparent 70%);
        filter:blur(12px);pointer-events:none;}
      .tr-hero-content{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;
        gap:14px;flex-wrap:wrap;}
      .tr-hero-title{display:flex;align-items:center;gap:12px;color:#fff;}
      .tr-hero-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;
        background:linear-gradient(135deg,rgba(6,182,212,.4),rgba(16,185,129,.3));
        border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px);font-size:22px;color:#fff;
        box-shadow:0 6px 18px rgba(6,182,212,.4);}
      .tr-hero-text h2{margin:0;font-size:20px;font-weight:800;color:#fff;line-height:1.3;}
      .tr-hero-text p{margin:3px 0 0;font-size:12px;color:rgba(226,232,240,.78);font-weight:500;}
      .tr-hero-badge{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#fff;
        padding:6px 12px;border-radius:999px;background:rgba(6,182,212,.22);
        border:1px solid rgba(6,182,212,.45);}

      /* ===== tabs ===== */
      .tr-tabs{display:flex;gap:6px;background:var(--tr-card);border:1.5px solid var(--tr-border);
        border-radius:16px;padding:6px;margin-bottom:16px;box-shadow:var(--tr-shadow);}
      .tr-tab{flex:1;font-family:inherit;font-size:13px;font-weight:700;color:var(--tr-muted);
        padding:11px 14px;border:none;border-radius:11px;background:transparent;cursor:pointer;
        transition:all .25s;display:inline-flex;align-items:center;justify-content:center;gap:7px;}
      .tr-tab i{font-size:13px;}
      .tr-tab:hover{color:var(--tr-primary-dark);background:var(--tr-primary-light);}
      .tr-tab.active{color:#fff;background:linear-gradient(135deg,#06b6d4,#0891b2);
        box-shadow:0 6px 16px rgba(6,182,212,.35);}
      body.dark-mode .tr-tab.active{box-shadow:0 6px 16px rgba(6,182,212,.45);}

      /* ===== panels ===== */
      .tr-panel{display:none;animation:tr-fade .3s ease;}
      .tr-panel.active{display:block;}
      @keyframes tr-fade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

      /* ===== cards ===== */
      .tr-card{background:var(--tr-card);border:1.5px solid var(--tr-border);border-radius:20px;
        padding:22px;box-shadow:var(--tr-shadow);position:relative;overflow:hidden;}
      body.dark-mode .tr-card{box-shadow:var(--tr-shadow);}
      .tr-card::before{content:"";position:absolute;top:-30px;left:-30px;width:140px;height:140px;border-radius:50%;
        background:radial-gradient(circle,rgba(6,182,212,.08) 0%,transparent 70%);pointer-events:none;}

      /* ===== online status ===== */
      .tr-status{position:absolute;top:14px;left:14px;display:inline-flex;align-items:center;gap:6px;
        font-size:11px;font-weight:600;color:var(--tr-muted);background:var(--tr-bg);
        padding:5px 10px;border-radius:999px;border:1px solid var(--tr-border);z-index:2;}
      .tr-status-dot{width:8px;height:8px;border-radius:50%;background:var(--tr-success);
        box-shadow:0 0 0 3px rgba(16,185,129,.2);animation:tr-pulse 2s infinite;}
      @keyframes tr-pulse{0%,100%{opacity:1;}50%{opacity:.5;}}

      /* ===== direction buttons ===== */
      .tr-dir{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;}
      .tr-dir-btn{flex:1;min-width:140px;font-family:inherit;font-size:13px;font-weight:700;color:var(--tr-muted);
        background:var(--tr-bg);border:2px solid var(--tr-border);border-radius:14px;padding:12px 14px;cursor:pointer;
        transition:all .25s;display:inline-flex;align-items:center;justify-content:center;gap:8px;}
      .tr-dir-btn .dir-lang{font-weight:800;}
      .tr-dir-btn i{font-size:11px;color:var(--tr-muted);transition:all .25s;}
      .tr-dir-btn:hover{border-color:var(--tr-primary);color:var(--tr-primary-dark);transform:translateY(-1px);}
      .tr-dir-btn.active{color:#fff;background:linear-gradient(135deg,#06b6d4,#0891b2);border-color:transparent;
        box-shadow:0 6px 16px rgba(6,182,212,.35);}
      .tr-dir-btn.active i{color:#fff;}

      /* ===== textarea input ===== */
      .tr-input-wrap{position:relative;margin-bottom:14px;}
      .tr-textarea{width:100%;font-family:'Vazirmatn',Tahoma,sans-serif;font-size:15px;color:var(--tr-text);
        background:var(--tr-bg);border:2px solid var(--tr-border);border-radius:14px;padding:14px 44px 14px 44px;
        resize:vertical;min-height:90px;line-height:1.7;transition:all .2s;}
      .tr-textarea::placeholder{color:var(--tr-muted);}
      .tr-textarea:focus{outline:none;border-color:var(--tr-primary);background:var(--tr-card);
        box-shadow:0 0 0 4px rgba(6,182,212,.15);}
      .tr-clear{position:absolute;top:10px;left:10px;width:30px;height:30px;border-radius:50%;border:none;
        background:var(--tr-card);border:1px solid var(--tr-border);color:var(--tr-muted);cursor:pointer;
        display:none;align-items:center;justify-content:center;transition:all .2s;}
      .tr-clear:hover{color:var(--tr-danger);border-color:var(--tr-danger);}
      .tr-clear.show{display:flex;}

      /* ===== result ===== */
      .tr-result{background:var(--tr-bg);border:2px dashed var(--tr-border);border-radius:14px;
        padding:18px;min-height:90px;margin-bottom:14px;transition:all .2s;}
      .tr-result.has-content{border-style:solid;border-color:var(--tr-primary);
        background:linear-gradient(135deg,rgba(6,182,212,.04),rgba(16,185,129,.04));}
      .tr-result-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:10px;min-height:60px;color:var(--tr-muted);text-align:center;}
      .tr-result-placeholder i{font-size:26px;opacity:.6;}
      .tr-result-placeholder p{margin:0;font-size:13px;font-weight:600;}
      .tr-result-loading{display:flex;align-items:center;justify-content:center;gap:10px;color:var(--tr-primary-dark);
        font-size:13px;font-weight:600;min-height:60px;}
      .tr-spinner{width:22px;height:22px;border:2.5px solid rgba(6,182,212,.2);border-top-color:var(--tr-primary);
        border-radius:50%;animation:tr-spin .8s linear infinite;}
      @keyframes tr-spin{to{transform:rotate(360deg);}}
      .tr-result-content{display:flex;flex-direction:column;gap:8px;}
      .tr-result-text{font-size:16px;font-weight:700;color:var(--tr-text);line-height:1.7;}
      .tr-result-source{font-size:11px;color:var(--tr-muted);font-weight:600;display:inline-flex;align-items:center;gap:5px;}
      .tr-result-source::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--tr-primary);}

      /* ===== action buttons ===== */
      .tr-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
      .tr-action{font-family:inherit;font-size:12px;font-weight:700;color:var(--tr-text);
        background:var(--tr-bg);border:1.5px solid var(--tr-border);border-radius:12px;padding:10px 8px;
        cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;gap:6px;}
      .tr-action i{font-size:13px;color:var(--tr-primary-dark);}
      .tr-action:hover{border-color:var(--tr-primary);background:var(--tr-primary-light);transform:translateY(-1px);
        box-shadow:0 4px 12px rgba(6,182,212,.18);}
      .tr-action.save{color:#fff;background:linear-gradient(135deg,#06b6d4,#0891b2);border-color:transparent;}
      .tr-action.save i{color:#fff;}
      .tr-action.save:hover{filter:brightness(1.08);box-shadow:0 6px 16px rgba(6,182,212,.4);}

      /* ===== pro search ===== */
      .tr-pro-search{position:relative;margin-bottom:12px;}
      .tr-pro-search-row{display:flex;align-items:center;gap:10px;background:var(--tr-bg);
        border:2px solid var(--tr-border);border-radius:14px;padding:4px 4px 4px 14px;transition:all .2s;}
      .tr-pro-search-row:focus-within{border-color:var(--tr-primary);background:var(--tr-card);
        box-shadow:0 0 0 4px rgba(6,182,212,.15);}
      .tr-pro-search-icon{color:var(--tr-primary-dark);font-size:15px;flex-shrink:0;}
      .tr-pro-input{flex:1;font-family:inherit;font-size:15px;font-weight:600;color:var(--tr-text);
        background:transparent;border:none;outline:none;padding:12px 0;min-width:0;direction:ltr;text-align:left;}
      .tr-pro-input::placeholder{color:var(--tr-muted);font-weight:500;}
      .tr-pro-clear{width:32px;height:32px;border-radius:50%;border:none;background:transparent;
        color:var(--tr-muted);cursor:pointer;display:none;align-items:center;justify-content:center;font-size:14px;
        transition:all .2s;}
      .tr-pro-clear:hover{color:var(--tr-danger);}
      .tr-pro-clear.show{display:flex;}
      .tr-pro-status{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--tr-muted);
        padding:0 10px;white-space:nowrap;}
      .tr-pro-dot{width:8px;height:8px;border-radius:50%;background:var(--tr-muted);}
      .tr-pro-dot.online{background:var(--tr-success);box-shadow:0 0 0 3px rgba(16,185,129,.2);}
      .tr-pro-dot.loading{background:var(--tr-warning);box-shadow:0 0 0 3px rgba(245,158,11,.2);animation:tr-pulse 1s infinite;}
      .tr-pro-dot.offline{background:var(--tr-danger);box-shadow:0 0 0 3px rgba(244,63,94,.2);}

      /* ===== suggestions ===== */
      .tr-suggestions{background:var(--tr-card);border:1.5px solid var(--tr-border);border-radius:14px;
        margin-bottom:12px;overflow:hidden;box-shadow:var(--tr-shadow);}
      .tr-suggestions-loading,.tr-suggestions-empty{display:flex;align-items:center;justify-content:center;gap:8px;
        padding:14px;color:var(--tr-muted);font-size:13px;font-weight:600;}
      .tr-pro-dots{display:inline-flex;gap:4px;}
      .tr-pro-dots span{width:7px;height:7px;border-radius:50%;background:var(--tr-primary);
        animation:tr-bounce 1.2s infinite ease-in-out;}
      .tr-pro-dots span:nth-child(2){animation-delay:.15s;}
      .tr-pro-dots span:nth-child(3){animation-delay:.3s;}
      @keyframes tr-bounce{0%,80%,100%{transform:scale(.6);opacity:.5;}40%{transform:scale(1);opacity:1;}}
      .tr-suggestion{display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;
        border-bottom:1px solid var(--tr-border);transition:all .2s;}
      .tr-suggestion:last-child{border-bottom:none;}
      .tr-suggestion:hover{background:var(--tr-primary-light);}
      .tr-suggestion-word{font-size:14px;font-weight:800;color:var(--tr-text);direction:ltr;}
      .tr-suggestion-meaning{flex:1;font-size:12px;color:var(--tr-muted);font-weight:600;}
      .tr-suggestion-arrow{color:var(--tr-muted);font-size:11px;}

      /* ===== pro result ===== */
      .pro-result-card{background:var(--tr-card);border:1.5px solid var(--tr-border);border-radius:20px;
        padding:22px;box-shadow:var(--tr-shadow);position:relative;overflow:hidden;}
      .pro-result-card::before{content:"";position:absolute;top:-30px;right:-30px;width:140px;height:140px;border-radius:50%;
        background:radial-gradient(circle,rgba(6,182,212,.08) 0%,transparent 70%);pointer-events:none;}

      .pro-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
        padding:40px 20px;color:var(--tr-muted);}
      .pro-loading p{margin:0;font-size:13px;font-weight:600;}

      .pro-error{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
        padding:30px 20px;text-align:center;}
      .pro-error i{font-size:34px;color:var(--tr-danger);}
      .pro-error h4{margin:0;font-size:15px;font-weight:800;color:var(--tr-text);}
      .pro-error p{margin:0;font-size:12px;color:var(--tr-muted);}
      .pro-retry{font-family:inherit;font-size:12px;font-weight:700;color:#fff;
        background:linear-gradient(135deg,#06b6d4,#0891b2);border:none;border-radius:10px;padding:9px 18px;
        cursor:pointer;margin-top:4px;display:inline-flex;align-items:center;gap:6px;transition:all .2s;}
      .pro-retry:hover{filter:brightness(1.1);transform:translateY(-1px);}

      /* ===== pro empty state ===== */
      .pro-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
        padding:40px 20px;text-align:center;}
      .pro-empty-icon{width:70px;height:70px;border-radius:50%;display:flex;align-items:center;justify-content:center;
        background:linear-gradient(135deg,rgba(6,182,212,.12),rgba(16,185,129,.1));color:var(--tr-primary-dark);
        font-size:28px;margin-bottom:4px;}
      .pro-empty h3{margin:0;font-size:16px;font-weight:800;color:var(--tr-text);}
      .pro-empty p{margin:0;font-size:13px;color:var(--tr-muted);max-width:340px;line-height:1.6;}
      .pro-examples{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;}
      .pro-examples>span{font-size:11px;color:var(--tr-muted);font-weight:700;}
      .pro-example{font-family:inherit;font-size:12px;font-weight:700;color:var(--tr-primary-dark);
        background:var(--tr-primary-light);border:1px solid rgba(6,182,212,.25);border-radius:999px;
        padding:6px 12px;cursor:pointer;transition:all .2s;direction:ltr;}
      .pro-example:hover{background:var(--tr-primary);color:#fff;border-color:transparent;transform:translateY(-1px);}

      /* ===== pro word header ===== */
      .pro-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;
        margin-bottom:16px;position:relative;z-index:1;}
      .pro-title-area{flex:1;min-width:200px;}
      .pro-word{font-size:26px;font-weight:800;color:var(--tr-text);margin:0 0 8px;direction:ltr;text-align:left;
        line-height:1.2;}
      .pro-badges{display:flex;gap:6px;flex-wrap:wrap;}
      .pro-badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;color:#fff;}
      .pro-badge-noun{background:linear-gradient(135deg,#3b82f6,#1d4ed8);}
      .pro-badge-verb{background:linear-gradient(135deg,#10b981,#059669);}
      .pro-badge-adjective{background:linear-gradient(135deg,#f59e0b,#d97706);}
      .pro-badge-adverb{background:linear-gradient(135deg,#8b5cf6,#6d28d9);}
      .pro-badge-other{background:linear-gradient(135deg,#64748b,#475569);}
      .pro-badge-gender.masculine{background:linear-gradient(135deg,#3b82f6,#1d4ed8);}
      .pro-badge-gender.feminine{background:linear-gradient(135deg,#ec4899,#be185d);}
      .pro-badge-gender.neuter{background:linear-gradient(135deg,#10b981,#059669);}
      .pro-actions{display:flex;gap:6px;flex-wrap:wrap;}
      .pro-action{font-family:inherit;font-size:11px;font-weight:700;color:var(--tr-text);
        background:var(--tr-bg);border:1.5px solid var(--tr-border);border-radius:10px;padding:8px 10px;cursor:pointer;
        transition:all .2s;display:inline-flex;align-items:center;gap:5px;}
      .pro-action i{font-size:11px;color:var(--tr-primary-dark);}
      .pro-action:hover{border-color:var(--tr-primary);background:var(--tr-primary-light);transform:translateY(-1px);}
      .pro-action.save{color:#fff;background:linear-gradient(135deg,#06b6d4,#0891b2);border-color:transparent;}
      .pro-action.save i{color:#fff;}

      /* ===== pro meaning ===== */
      .pro-meaning{display:flex;align-items:flex-start;gap:12px;background:linear-gradient(135deg,rgba(6,182,212,.06),rgba(16,185,129,.04));
        border:1px solid rgba(6,182,212,.18);border-radius:14px;padding:14px;margin-bottom:16px;position:relative;z-index:1;}
      body.dark-mode .pro-meaning{background:linear-gradient(135deg,rgba(6,182,212,.12),rgba(16,185,129,.08));}
      .pro-meaning-icon{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;
        background:linear-gradient(135deg,#06b6d4,#0891b2);color:#fff;font-size:15px;flex-shrink:0;}
      .pro-meaning-content{flex:1;min-width:0;}
      .pro-meaning-label{font-size:11px;color:var(--tr-muted);font-weight:700;margin-bottom:3px;}
      .pro-meaning-text{font-size:17px;font-weight:800;color:var(--tr-text);line-height:1.5;}
      .pro-pronunciation{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--tr-muted);
        font-weight:600;margin-top:6px;}
      .pro-pronunciation i{font-size:11px;color:var(--tr-primary-dark);}

      /* ===== pro sections ===== */
      .pro-section{margin-bottom:16px;position:relative;z-index:1;}
      .pro-section-title{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;color:var(--tr-text);
        margin-bottom:10px;padding-bottom:8px;border-bottom:1.5px solid var(--tr-border);}
      .pro-section-title i{color:var(--tr-primary-dark);font-size:13px;}
      .pro-section-title .count{font-size:11px;font-weight:700;color:var(--tr-muted);margin-right:auto;}

      /* ===== conjugation ===== */
      .pro-tense-btns{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;}
      .pro-tense-btn{font-family:inherit;font-size:12px;font-weight:700;color:var(--tr-muted);
        background:var(--tr-bg);border:1.5px solid var(--tr-border);border-radius:10px;padding:8px 12px;cursor:pointer;
        transition:all .2s;direction:ltr;}
      .pro-tense-btn:hover{border-color:var(--tr-primary);color:var(--tr-primary-dark);}
      .pro-tense-btn.active{color:#fff;background:linear-gradient(135deg,#06b6d4,#0891b2);border-color:transparent;}
      .pro-tense-panel{display:none;}
      .pro-tense-panel.active{display:block;animation:tr-fade .25s ease;}
      .pro-conj-table{width:100%;border-collapse:collapse;font-size:13px;}
      .pro-conj-table th{font-weight:700;color:var(--tr-muted);text-align:right;padding:9px 12px;width:35%;
        background:var(--tr-bg);border-radius:8px;font-size:12px;direction:ltr;}
      .pro-conj-table td{font-weight:700;color:var(--tr-text);padding:9px 12px;border-bottom:1px solid var(--tr-border);
        direction:ltr;text-align:left;font-family:'Vazirmatn',Tahoma,sans-serif;}
      .pro-conj-table tr:last-child td{border-bottom:none;}
      .pro-perfect-info{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;}
      .pro-perfect-box{background:var(--tr-bg);border:1px solid var(--tr-border);border-radius:11px;padding:11px 13px;}
      .pro-perfect-lbl{font-size:11px;color:var(--tr-muted);font-weight:700;margin-bottom:4px;}
      .pro-perfect-val{font-size:15px;font-weight:800;color:var(--tr-primary-dark);direction:ltr;text-align:left;}
      .pro-perfect-example{display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,rgba(245,158,11,.08),rgba(245,158,11,.04));
        border:1px solid rgba(245,158,11,.2);border-radius:11px;padding:11px 13px;font-size:13px;font-weight:700;color:var(--tr-warning);}
      body.dark-mode .pro-perfect-example{color:#fbbf24;}
      .pro-perfect-example i{font-size:13px;}
      .pro-separable{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:12px;font-weight:700;
        color:#f59e0b;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:10px;padding:7px 12px;}
      body.dark-mode .pro-separable{color:#fbbf24;}

      /* ===== info grid ===== */
      .pro-info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;}
      .pro-info-card{display:flex;align-items:center;gap:12px;background:var(--tr-bg);border:1px solid var(--tr-border);
        border-radius:12px;padding:12px 14px;transition:all .2s;}
      .pro-info-card:hover{border-color:var(--tr-primary);transform:translateY(-1px);}
      .pro-info-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;
        background:linear-gradient(135deg,rgba(6,182,212,.15),rgba(8,145,178,.1));color:var(--tr-primary-dark);font-size:14px;flex-shrink:0;}
      .pro-gender-circle{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;
        color:#fff;font-size:14px;flex-shrink:0;}
      .pro-gender-circle.masculine{background:linear-gradient(135deg,#3b82f6,#1d4ed8);}
      .pro-gender-circle.feminine{background:linear-gradient(135deg,#ec4899,#be185d);}
      .pro-gender-circle.neuter{background:linear-gradient(135deg,#10b981,#059669);}
      .pro-info-text{flex:1;min-width:0;}
      .pro-info-label{font-size:11px;color:var(--tr-muted);font-weight:700;margin-bottom:3px;}
      .pro-info-value{font-size:14px;font-weight:800;color:var(--tr-text);direction:ltr;text-align:left;
        word-break:break-word;}

      /* ===== examples ===== */
      .pro-examples-list{display:flex;flex-direction:column;gap:8px;}
      .pro-example-item{display:flex;align-items:center;gap:10px;background:var(--tr-bg);border:1px solid var(--tr-border);
        border-radius:12px;padding:11px 13px;transition:all .2s;}
      .pro-example-item:hover{border-color:var(--tr-primary);}
      .pro-example-texts{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;}
      .pro-example-german{font-size:13px;font-weight:700;color:var(--tr-text);direction:ltr;text-align:left;}
      .pro-example-persian{font-size:12px;color:var(--tr-muted);font-weight:600;}
      .pro-example-speak{width:32px;height:32px;border-radius:50%;border:1px solid var(--tr-border);
        background:var(--tr-card);color:var(--tr-primary-dark);cursor:pointer;display:flex;align-items:center;
        justify-content:center;font-size:11px;flex-shrink:0;transition:all .2s;}
      .pro-example-speak:hover{background:var(--tr-primary);color:#fff;border-color:transparent;}

      /* ===== notes ===== */
      .pro-notes{background:linear-gradient(135deg,rgba(245,158,11,.06),rgba(245,158,11,.03));
        border:1px solid rgba(245,158,11,.2);border-radius:12px;padding:13px 14px;font-size:13px;font-weight:600;
        color:var(--tr-text);line-height:1.7;}
      body.dark-mode .pro-notes{background:linear-gradient(135deg,rgba(245,158,11,.1),rgba(245,158,11,.05));}

      /* ===== save word modal ===== */
      .tr-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(6px);
        display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px;animation:tr-fade .25s ease;}
      .tr-modal{background:var(--tr-card);border:1.5px solid var(--tr-border);border-radius:20px;width:100%;
        max-width:440px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:var(--tr-shadow-lg);
        animation:tr-pop .3s cubic-bezier(.34,1.56,.64,1);}
      @keyframes tr-pop{from{opacity:0;transform:translateY(20px) scale(.95);}to{opacity:1;transform:translateY(0) scale(1);}}
      .tr-modal-header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:18px 20px;
        background:linear-gradient(135deg,#0f172a 0%,#1e293b 45%,#134e4a 100%);color:#fff;position:relative;overflow:hidden;}
      .tr-modal-header::before{content:"";position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;
        background:radial-gradient(circle,rgba(6,182,212,.35) 0%,transparent 70%);pointer-events:none;}
      .tr-modal-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:800;position:relative;z-index:1;}
      .tr-modal-title i{color:#22d3ee;}
      .tr-modal-close{width:32px;height:32px;border-radius:10px;border:none;background:rgba(255,255,255,.1);
        color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;
        transition:all .2s;position:relative;z-index:1;}
      .tr-modal-close:hover{background:rgba(255,255,255,.2);}
      .tr-modal-body{padding:20px;overflow-y:auto;flex:1;}
      .tr-field{margin-bottom:16px;}
      .tr-field:last-child{margin-bottom:0;}
      .tr-field label{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--tr-muted);
        margin-bottom:7px;}
      .tr-field label i{font-size:11px;color:var(--tr-primary-dark);}
      .tr-field-input{width:100%;font-family:'Vazirmatn',Tahoma,sans-serif;font-size:14px;font-weight:600;
        color:var(--tr-text);background:var(--tr-bg);border:2px solid var(--tr-border);border-radius:11px;
        padding:11px 13px;transition:all .2s;}
      .tr-field-input:focus{outline:none;border-color:var(--tr-primary);background:var(--tr-card);
        box-shadow:0 0 0 4px rgba(6,182,212,.15);}
      .tr-type-buttons,.tr-gender-buttons{display:flex;gap:6px;flex-wrap:wrap;}
      .tr-type-btn,.tr-gender-btn{flex:1;min-width:60px;font-family:inherit;font-size:12px;font-weight:700;
        color:var(--tr-muted);background:var(--tr-bg);border:1.5px solid var(--tr-border);border-radius:10px;
        padding:9px 8px;cursor:pointer;transition:all .2s;}
      .tr-type-btn:hover,.tr-gender-btn:hover{border-color:var(--tr-primary);color:var(--tr-primary-dark);}
      .tr-type-btn.active{color:#fff;background:linear-gradient(135deg,#06b6d4,#0891b2);
        border-color:transparent;}
      .tr-gender-btn.active[data-gender="masculine"]{background:linear-gradient(135deg,#3b82f6,#1d4ed8);}
      .tr-gender-btn.active[data-gender="feminine"]{background:linear-gradient(135deg,#ec4899,#be185d);}
      .tr-gender-btn.active[data-gender="neuter"]{background:linear-gradient(135deg,#10b981,#059669);}
      .tr-modal-footer{display:flex;gap:10px;padding:14px 20px;border-top:1px solid var(--tr-border);background:var(--tr-bg);}
      .tr-btn{flex:1;font-family:inherit;font-size:13px;font-weight:700;padding:11px 16px;border-radius:11px;
        border:none;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;gap:6px;}
      .tr-btn-cancel{background:var(--tr-card);color:var(--tr-text);border:1.5px solid var(--tr-border);}
      .tr-btn-cancel:hover{border-color:var(--tr-danger);color:var(--tr-danger);}
      .tr-btn-save{color:#fff;background:linear-gradient(135deg,#06b6d4,#0891b2);}
      .tr-btn-save:hover{filter:brightness(1.08);transform:translateY(-1px);box-shadow:0 6px 16px rgba(6,182,212,.4);}

      /* ===== responsive ===== */
      @media(max-width:640px){
        .tr-hero{padding:20px 16px 16px;}
        .tr-hero-text h2{font-size:17px;}
        .tr-hero-text p{font-size:11px;}
        .tr-hero-icon{width:42px;height:42px;font-size:19px;}
        .tr-card,.pro-result-card{padding:16px 14px;}
        .tr-textarea{font-size:14px;padding:12px 40px 12px 40px;}
        .tr-actions{grid-template-columns:repeat(2,1fr);}
        .tr-action{padding:11px 8px;font-size:12px;}
        .tr-dir{flex-direction:column;}
        .tr-dir-btn{flex:1;}
        .pro-word{font-size:22px;}
        .pro-head{flex-direction:column;align-items:stretch;}
        .pro-actions{justify-content:flex-start;}
        .pro-perfect-info{grid-template-columns:1fr;}
        .pro-conj-table th{width:30%;}
        .tr-modal-body{padding:16px;}
        .tr-modal-footer{padding:12px 16px;}
      }
      @media(max-width:380px){
        .tr-hero-badge{display:none;}
        .pro-info-grid{grid-template-columns:1fr;}
        .tr-type-buttons .tr-type-btn,.tr-gender-buttons .tr-gender-btn{min-width:0;font-size:11px;padding:8px 4px;}
      }
    `;
    document.head.appendChild(style);
};

GermanDictionary.prototype.renderTranslate = function() {
    this._injectTranslateProStyles();
    const container = document.getElementById('translate-section');
    if (!container) return;

    const activeTab = localStorage.getItem('professionalTranslateTab') || 'simple';
    const isGerman = LanguageSystem.isGerman();
    const dir = this.translateDirection || 'de-fa';

    container.innerHTML = `
        <div class="tr-wrap">
            <div class="tr-hero">
                <div class="tr-hero-content">
                    <div class="tr-hero-title">
                        <div class="tr-hero-icon"><i class="fas fa-language"></i></div>
                        <div class="tr-hero-text">
                            <h2>${isGerman ? 'مترجم هوشمند' : 'Smart Translator'}</h2>
                            <p>${isGerman ? 'ترجمه سریع و تحلیل حرفه‌ای واژگان آلمانی' : 'Quick translate & pro word analysis'}</p>
                        </div>
                    </div>
                    <span class="tr-hero-badge"><i class="fas fa-bolt"></i> AI Powered</span>
                </div>
            </div>

            <div class="tr-tabs">
                <button class="tr-tab ${activeTab === 'simple' ? 'active' : ''}" data-tab="simple">
                    <i class="fas fa-bolt"></i>
                    <span>${isGerman ? 'ترجمه سریع' : 'Quick Translate'}</span>
                </button>
                <button class="tr-tab ${activeTab === 'professional' ? 'active' : ''}" data-tab="professional">
                    <i class="fas fa-crown"></i>
                    <span>${isGerman ? 'تحلیل حرفه‌ای' : 'Pro Analysis'}</span>
                </button>
            </div>

            <div class="tr-panel ${activeTab === 'simple' ? 'active' : ''}" id="translate-panel-simple">
                <div class="tr-card">
                    <div class="tr-status" id="translate-online-status">
                        <span class="tr-status-dot"></span>
                        <span>${isGerman ? 'آنلاین' : 'Online'}</span>
                    </div>

                    <div class="tr-dir">
                        <button class="tr-dir-btn ${dir === 'de-fa' ? 'active' : ''}" data-dir="de-fa">
                            <span class="dir-lang">DE</span>
                            <i class="fas fa-arrow-left"></i>
                            <span class="dir-lang">FA</span>
                        </button>
                        <button class="tr-dir-btn ${dir === 'fa-de' ? 'active' : ''}" data-dir="fa-de">
                            <span class="dir-lang">FA</span>
                            <i class="fas fa-arrow-left"></i>
                            <span class="dir-lang">DE</span>
                        </button>
                    </div>

                    <div class="tr-input-wrap">
                        <textarea id="translate-input-field" class="tr-textarea"
                            placeholder="${isGerman ? 'متن آلمانی یا فارسی را وارد کنید...' : 'Enter German or Persian text...'}"
                            rows="3"></textarea>
                        <button class="tr-clear" id="translate-clear-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="tr-result" id="translate-result-wrapper">
                        <div class="tr-result-placeholder">
                            <i class="fas fa-exchange-alt"></i>
                            <p>${isGerman ? 'ترجمه اینجا نمایش داده می‌شود' : 'Translation appears here'}</p>
                        </div>
                    </div>

                    <div class="tr-actions">
                        <button class="tr-action" id="translate-speak-source">
                            <i class="fas fa-volume-up"></i>
                            <span>${isGerman ? 'تلفظ متن' : 'Speak'}</span>
                        </button>
                        <button class="tr-action" id="translate-speak-target">
                            <i class="fas fa-volume-up"></i>
                            <span>${isGerman ? 'تلفظ ترجمه' : 'Speak trans'}</span>
                        </button>
                        <button class="tr-action" id="translate-copy-result">
                            <i class="fas fa-copy"></i>
                            <span>${isGerman ? 'کپی' : 'Copy'}</span>
                        </button>
                        <button class="tr-action save" id="translate-save-word">
                            <i class="fas fa-bookmark"></i>
                            <span>${isGerman ? 'ذخیره' : 'Save'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="tr-panel ${activeTab === 'professional' ? 'active' : ''}" id="translate-panel-professional">
                <div class="tr-card">
                    <div class="tr-pro-search">
                        <div class="tr-pro-search-row">
                            <i class="fas fa-search tr-pro-search-icon"></i>
                            <input type="text" id="translate-pro-input" class="tr-pro-input"
                                placeholder="${isGerman ? 'لغت آلمانی را وارد کنید...' : 'Enter German word...'}"
                                autocomplete="off">
                            <button id="translate-pro-clear" class="tr-pro-clear">
                                <i class="fas fa-times-circle"></i>
                            </button>
                            <div class="tr-pro-status">
                                <span class="tr-pro-dot online"></span>
                                <span class="tr-pro-status-text">${isGerman ? 'آماده' : 'Ready'}</span>
                            </div>
                        </div>
                    </div>

                    <div id="translate-pro-suggestions" style="display:none;"></div>
                    <div id="translate-pro-result" style="display:none;"></div>

                    <div id="translate-pro-empty" class="pro-empty">
                        <div class="pro-empty-icon"><i class="fas fa-microphone-alt"></i></div>
                        <h3>${isGerman ? 'تحلیلگر حرفه‌ای واژگان' : 'Professional Word Analyzer'}</h3>
                        <p>${isGerman ? 'یک لغت آلمانی را جستجو کنید تا تحلیل کاملی شامل صرف فعل، جمع‌بندی و مثال‌ها دریافت کنید' : 'Search a German word for complete analysis with conjugation, plural & examples'}</p>
                        <div class="pro-examples">
                            <span>${isGerman ? 'پیشنهاد:' : 'Try:'}</span>
                            <button class="pro-example" data-word="der Hund">der Hund</button>
                            <button class="pro-example" data-word="laufen">laufen</button>
                            <button class="pro-example" data-word="schön">schön</button>
                            <button class="pro-example" data-word="das Haus">das Haus</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    this.initTranslateTabs();
    this.initSimpleTranslate();
    this.initProTranslate();
};

GermanDictionary.prototype.initTranslateTabs = function() {
    document.querySelectorAll('.tr-tab').forEach(tab => {
        tab.onclick = () => {
            const tabName = tab.dataset.tab;
            localStorage.setItem('professionalTranslateTab', tabName);

            document.querySelectorAll('.tr-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.tr-panel').forEach(panel => panel.classList.remove('active'));
            const target = document.getElementById('translate-panel-' + tabName);
            if (target) target.classList.add('active');
        };
    });
};

GermanDictionary.prototype.initSimpleTranslate = function() {
    const input = document.getElementById('translate-input-field');
    const resultDiv = document.getElementById('translate-result-wrapper');
    const clearBtn = document.getElementById('translate-clear-btn');
    const isGerman = LanguageSystem.isGerman();

    if (!input) return;

    let debounceTimer;
    let lastTranslatedText = '';
    let lastResult = '';

    const renderPlaceholder = (icon, msg) => {
        resultDiv.classList.remove('has-content');
        resultDiv.innerHTML = `
            <div class="tr-result-placeholder">
                <i class="fas fa-${icon}"></i>
                <p>${msg}</p>
            </div>
        `;
    };

    const renderLoading = () => {
        resultDiv.classList.remove('has-content');
        resultDiv.innerHTML = `
            <div class="tr-result-loading">
                <div class="tr-spinner"></div>
                <span>${isGerman ? 'در حال ترجمه...' : 'Translating...'}</span>
            </div>
        `;
    };

    const renderResult = (translated) => {
        lastResult = translated;
        resultDiv.classList.add('has-content');
        resultDiv.innerHTML = `
            <div class="tr-result-content">
                <div class="tr-result-text">${this.escapeHtml(translated)}</div>
                <div class="tr-result-source">${isGerman ? 'ترجمه خودکار' : 'Auto translation'}</div>
            </div>
        `;
    };

    const translateText = async () => {
        const text = input.value.trim();
        if (!text) {
            renderPlaceholder('exchange-alt', isGerman ? 'ترجمه اینجا نمایش داده می‌شود' : 'Translation appears here');
            lastTranslatedText = '';
            lastResult = '';
            return;
        }
        if (text === lastTranslatedText && lastResult) return;
        lastTranslatedText = text;

        renderLoading();

        try {
            const isDeToFa = this.translateDirection === 'de-fa';
            let translated = null;

            const allWords = await this.getAllWords();
            const searchTerm = text.toLowerCase();

            if (isDeToFa) {
                const found = allWords.find(w => w.german && w.german.toLowerCase() === searchTerm);
                if (found) translated = found.persian;
            } else {
                const found = allWords.find(w => w.persian && w.persian.toLowerCase() === searchTerm);
                if (found) translated = found.german;
            }

            if (!translated) {
                const sl = isDeToFa ? 'de' : 'fa';
                const tl = isDeToFa ? 'fa' : 'de';
                const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    translated = data[0].map(item => item[0]).join('');
                }
            }

            if (translated) {
                renderResult(translated);
            } else {
                renderPlaceholder('exclamation-triangle', isGerman ? 'خطا در ترجمه' : 'Translation error');
            }
        } catch (error) {
            console.error('Translation error:', error);
            renderPlaceholder('exclamation-triangle', isGerman ? 'خطا در ترجمه' : 'Translation error');
        }
    };

    input.oninput = (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(translateText, 600);
        if (clearBtn) {
            clearBtn.classList.toggle('show', !!e.target.value);
        }
    };

    if (clearBtn) {
        clearBtn.onclick = () => {
            input.value = '';
            clearBtn.classList.remove('show');
            lastTranslatedText = '';
            lastResult = '';
            renderPlaceholder('exchange-alt', isGerman ? 'ترجمه اینجا نمایش داده می‌شود' : 'Translation appears here');
            input.focus();
        };
    }

    document.querySelectorAll('.tr-dir-btn').forEach(btn => {
        btn.onclick = () => {
            const dir = btn.dataset.dir;
            this.translateDirection = dir;
            document.querySelectorAll('.tr-dir-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            lastTranslatedText = '';
            translateText();
        };
    });

    document.getElementById('translate-speak-source')?.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {
            const lang = this.translateDirection === 'de-fa' ? 'de-DE' : 'fa-IR';
            this.speakText(text, lang);
        } else {
            this.showToast(isGerman ? 'متن وارد نشده است' : 'No text to speak', 'warning');
        }
    });

    document.getElementById('translate-speak-target')?.addEventListener('click', () => {
        const resultText = document.querySelector('#translate-result-wrapper .tr-result-text')?.textContent;
        if (resultText) {
            const lang = this.translateDirection === 'de-fa' ? 'fa-IR' : 'de-DE';
            this.speakText(resultText, lang);
        } else {
            this.showToast(isGerman ? 'ترجمه‌ای موجود نیست' : 'No translation to speak', 'warning');
        }
    });

    document.getElementById('translate-copy-result')?.addEventListener('click', async () => {
        const resultText = document.querySelector('#translate-result-wrapper .tr-result-text')?.textContent;
        if (resultText) {
            try {
                await navigator.clipboard.writeText(resultText);
                this.showToast('✅ ' + (isGerman ? 'کپی شد' : 'Copied'), 'success');
            } catch {
                this.showToast('❌ ' + (isGerman ? 'کپی ناموفق' : 'Copy failed'), 'error');
            }
        } else {
            this.showToast(isGerman ? 'متن برای کپی وجود ندارد' : 'Nothing to copy', 'warning');
        }
    });

    document.getElementById('translate-save-word')?.addEventListener('click', () => {
        const isDeToFa = this.translateDirection === 'de-fa';
        const german = isDeToFa ? input.value.trim() : (document.querySelector('#translate-result-wrapper .tr-result-text')?.textContent || '').trim();
        const persian = isDeToFa ? (document.querySelector('#translate-result-wrapper .tr-result-text')?.textContent || '').trim() : input.value.trim();

        if (german && persian) {
            this.showSaveWordDialog(german, persian);
        } else {
            this.showToast('❌ ' + (isGerman ? 'متن ترجمه شده‌ای وجود ندارد' : 'No translated text to save'), 'error');
        }
    });
};

GermanDictionary.prototype.initProTranslate = function() {
    const searchInput = document.getElementById('translate-pro-input');
    const clearBtn = document.getElementById('translate-pro-clear');
    const suggestionsDiv = document.getElementById('translate-pro-suggestions');
    const resultDiv = document.getElementById('translate-pro-result');
    const emptyDiv = document.getElementById('translate-pro-empty');
    const statusDot = document.querySelector('.tr-pro-dot');
    const statusText = document.querySelector('.tr-pro-status-text');
    const isGerman = LanguageSystem.isGerman();

    if (!searchInput) return;

    let searchTimeout;
    let isSearching = false;

    const hideSuggestions = () => { if (suggestionsDiv) suggestionsDiv.style.display = 'none'; };

    const showLoading = () => {
        if (statusDot) statusDot.className = 'tr-pro-dot loading';
        if (statusText) statusText.textContent = isGerman ? 'در حال جستجو...' : 'Searching...';
    };
    const showOnline = () => {
        if (statusDot) statusDot.className = 'tr-pro-dot online';
        if (statusText) statusText.textContent = isGerman ? 'آنلاین' : 'Online';
    };
    const showOffline = () => {
        if (statusDot) statusDot.className = 'tr-pro-dot offline';
        if (statusText) statusText.textContent = isGerman ? 'آفلاین' : 'Offline';
    };
    const showReady = () => {
        if (statusDot) statusDot.className = 'tr-pro-dot online';
        if (statusText) statusText.textContent = isGerman ? 'آماده' : 'Ready';
    };

    if (clearBtn) {
        clearBtn.onclick = () => {
            searchInput.value = '';
            clearBtn.classList.remove('show');
            hideSuggestions();
            if (resultDiv) resultDiv.style.display = 'none';
            if (emptyDiv) emptyDiv.style.display = 'flex';
            showReady();
            searchInput.focus();
        };
    }

    const liveSearch = async (query) => {
        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        showLoading();
        suggestionsDiv.style.display = 'block';
        suggestionsDiv.innerHTML = `
            <div class="tr-suggestions-loading">
                <div class="tr-pro-dots"><span></span><span></span><span></span></div>
                <span>${isGerman ? 'در حال جستجو...' : 'Searching...'}</span>
            </div>
        `;

        try {
            const prompt = `لیستی از ۸ لغت آلمانی پرکاربرد که با "${query}" شروع می‌شوند یا شبیه آن هستند را پیدا کن.
فقط یک JSON آرایه برگردان به این فرمت:
[{"word": "Haus", "meaning": "خانه"}, {"word": "Auto", "meaning": "ماشین"}]`;

            const response = await this._puterChat(prompt, {});
            let rawText = '';

            if (response?.message?.content?.[0]?.text) rawText = response.message.content[0].text;
            else if (typeof response === 'string') rawText = response;
            else if (response?.text) rawText = response.text;

            let suggestions = [];
            try {
                const clean = rawText.replace(/```json|```/g, '').trim();
                const jsonMatch = clean.match(/\[[\s\S]*\]/);
                if (jsonMatch) suggestions = JSON.parse(jsonMatch[0]);
            } catch (e) {
                suggestions = [];
            }

            if (!Array.isArray(suggestions) || suggestions.length === 0) {
                suggestionsDiv.innerHTML = `
                    <div class="tr-suggestions-empty">
                        <i class="fas fa-search"></i>
                        <span>${isGerman ? 'نتیجه‌ای یافت نشد' : 'No results found'}</span>
                    </div>
                `;
                showOnline();
                return;
            }

            suggestionsDiv.innerHTML = suggestions.map(s => `
                <div class="tr-suggestion" data-word="${this.escapeHtml(s.word)}">
                    <span class="tr-suggestion-word">${this.escapeHtml(s.word)}</span>
                    <span class="tr-suggestion-meaning">${this.escapeHtml(s.meaning || '...')}</span>
                    <i class="fas fa-chevron-left tr-suggestion-arrow"></i>
                </div>
            `).join('');

            suggestionsDiv.querySelectorAll('.tr-suggestion').forEach(item => {
                item.onclick = () => {
                    const word = item.dataset.word;
                    searchInput.value = word;
                    hideSuggestions();
                    if (clearBtn) clearBtn.classList.add('show');
                    this.proAnalyzeWord(word);
                };
            });

            showOnline();
        } catch (error) {
            console.error('Live search error:', error);
            suggestionsDiv.innerHTML = `
                <div class="tr-suggestions-empty">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${isGerman ? 'خطا در جستجو' : 'Search error'}</span>
                </div>
            `;
            showOffline();
        }
    };

    searchInput.oninput = (e) => {
        const query = e.target.value.trim();
        if (clearBtn) clearBtn.classList.toggle('show', !!query);
        if (isSearching) return;
        clearTimeout(searchTimeout);
        if (query.length < 2) {
            hideSuggestions();
            return;
        }
        searchTimeout = setTimeout(() => liveSearch(query), 400);
    };

    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                isSearching = true;
                hideSuggestions();
                if (clearBtn) clearBtn.classList.add('show');
                this.proAnalyzeWord(query).finally(() => { isSearching = false; });
            }
        }
    };

    document.querySelectorAll('.pro-example').forEach(btn => {
        btn.onclick = () => {
            const word = btn.dataset.word;
            searchInput.value = word;
            if (clearBtn) clearBtn.classList.add('show');
            hideSuggestions();
            this.proAnalyzeWord(word);
        };
    });
};

GermanDictionary.prototype.proAnalyzeWord = async function(word) {
    const resultDiv = document.getElementById('translate-pro-result');
    const emptyDiv = document.getElementById('translate-pro-empty');
    const statusDot = document.querySelector('.tr-pro-dot');
    const statusText = document.querySelector('.tr-pro-status-text');
    const isGerman = LanguageSystem.isGerman();

    if (!resultDiv) return;

    if (statusDot) statusDot.className = 'tr-pro-dot loading';
    if (statusText) statusText.textContent = isGerman ? 'در حال تحلیل...' : 'Analyzing...';

    resultDiv.style.display = 'block';
    if (emptyDiv) emptyDiv.style.display = 'none';

    resultDiv.innerHTML = `
        <div class="pro-result-card">
            <div class="pro-loading">
                <div class="tr-spinner" style="width:32px;height:32px;border-width:3px;"></div>
                <p>${isGerman ? 'در حال تحلیل لغت...' : 'Analyzing word...'}</p>
            </div>
        </div>
    `;

    try {
        const allWords = await this.getAllWords();
        let foundWord = allWords.find(w =>
            (w.german && w.german.toLowerCase() === word.toLowerCase()) ||
            (w.german && w.german.toLowerCase().includes(word.toLowerCase()))
        );

        if (foundWord) {
            await this.renderProWordAnalysis(foundWord);
        } else {
            await this.fetchAIWordAnalysis(word);
        }

        if (statusDot) statusDot.className = 'tr-pro-dot online';
        if (statusText) statusText.textContent = isGerman ? 'آنلاین' : 'Online';
    } catch (error) {
        console.error('Analysis error:', error);
        const safeWord = word.replace(/'/g, "\\'");
        resultDiv.innerHTML = `
            <div class="pro-result-card">
                <div class="pro-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>${isGerman ? 'خطا در تحلیل' : 'Analysis Error'}</h4>
                    <p>${isGerman ? 'امکان تحلیل این لغت وجود ندارد' : 'Cannot analyze this word'}</p>
                    <button onclick="dictionaryApp.proAnalyzeWord('${safeWord}')" class="pro-retry">
                        <i class="fas fa-redo-alt"></i> ${isGerman ? 'تلاش مجدد' : 'Retry'}
                    </button>
                </div>
            </div>
        `;
        if (statusDot) statusDot.className = 'tr-pro-dot offline';
        if (statusText) statusText.textContent = isGerman ? 'آفلاین' : 'Offline';
    }
};

GermanDictionary.prototype.fetchAIWordAnalysis = async function(word) {
    const prompt = `تحلیل کامل و حرفه‌ای لغت آلمانی "${word}" را انجام بده.
⚠️ خیلی مهم: تمام متن‌های فارسی را فقط با حروف فارسی بنویس.

لطفاً اطلاعات زیر را به صورت JSON دقیق برگردان:

{
  "word": "${word}",
  "type": "noun یا verb یا adjective یا adverb",
  "persian_meaning": "معنی فارسی اصلی",
  "pronunciation": "تلفظ آوانویسی (اختیاری)",

  "noun_info": {
    "gender": "masculine یا feminine یا neuter",
    "plural": "شکل جمع"
  },

  "verb_info": {
    "helper": "haben یا sein",
    "separable": true یا false,
    "present": {"ich": "...", "du": "...", "er": "...", "wir": "...", "ihr": "...", "sie": "..."},
    "past": {"ich": "...", "du": "...", "er": "..."},
    "perfect": "اسم مفعول",
    "future": {"ich": "...", "du": "...", "er": "..."}
  },

  "adjective_info": {
    "comparative": "حالت برتر",
    "superlative": "حالت برترین"
  },

  "examples": [
    {"german": "جمله اول آلمانی", "persian": "ترجمه فارسی"},
    {"german": "جمله دوم آلمانی", "persian": "ترجمه فارسی"}
  ],

  "notes": "نکات گرامری (حداکثر یک خط)"
}`;

    const response = await this._puterChat(prompt, {});
    let rawText = '';

    if (response?.message?.content?.[0]?.text) rawText = response.message.content[0].text;
    else if (typeof response === 'string') rawText = response;
    else if (response?.text) rawText = response.text;

    let data;
    try {
        const clean = rawText.replace(/```json|```/g, '').trim();
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        data = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
    } catch {
        throw new Error('Invalid JSON');
    }

    await this.renderProWordAnalysis({
        ...data,
        isVirtual: true,
        id: Date.now(),
        german: data.word,
        persian: data.persian_meaning
    });
};

GermanDictionary.prototype.renderProWordAnalysis = async function(word) {
    const resultDiv = document.getElementById('translate-pro-result');
    const isGerman = LanguageSystem.isGerman();
    if (!resultDiv) return;

    const type = word.type || 'other';
    const nounInfo = word.noun_info;
    const verbInfo = word.verb_info;
    const adjInfo = word.adjective_info;
    const examples = word.examples || [];
    const isVerb = type === 'verb' && verbInfo;
    const wordText = word.german || word.word || '-';

    let html = `
        <div class="pro-result-card">
            <div class="pro-head">
                <div class="pro-title-area">
                    <h1 class="pro-word">${this.escapeHtml(wordText)}</h1>
                    <div class="pro-badges">
                        <span class="pro-badge pro-badge-${type}">${this.getTypeLabel(type)}</span>
                        ${nounInfo?.gender ? `<span class="pro-badge pro-badge-gender ${nounInfo.gender}">${this.getGenderSymbol(nounInfo.gender)}</span>` : ''}
                    </div>
                </div>
                <div class="pro-actions">
                    <button class="pro-action pro-speak-word-btn" data-word="${this.escapeHtml(wordText)}">
                        <i class="fas fa-volume-up"></i> <span>${isGerman ? 'تلفظ' : 'Speak'}</span>
                    </button>
                    <button class="pro-action pro-copy-word-btn" data-text="${this.escapeHtml(wordText)}">
                        <i class="fas fa-copy"></i> <span>${isGerman ? 'کپی' : 'Copy'}</span>
                    </button>
                    <button class="pro-action save pro-save-word-btn"
                        data-german="${this.escapeHtml(wordText)}"
                        data-persian="${this.escapeHtml(word.persian || word.persian_meaning || '-')}"
                        data-type="${type}"
                        data-gender="${nounInfo?.gender || ''}"
                        data-plural="${nounInfo?.plural || ''}">
                        <i class="fas fa-bookmark"></i> <span>${isGerman ? 'ذخیره' : 'Save'}</span>
                    </button>
                </div>
            </div>

            <div class="pro-meaning">
                <div class="pro-meaning-icon"><i class="fas fa-language"></i></div>
                <div class="pro-meaning-content">
                    <div class="pro-meaning-label">${isGerman ? 'معنی' : 'Meaning'}</div>
                    <div class="pro-meaning-text">${this.escapeHtml(word.persian || word.persian_meaning || '-')}</div>
                    ${word.pronunciation ? `<div class="pro-pronunciation"><i class="fas fa-microphone-alt"></i> ${this.escapeHtml(word.pronunciation)}</div>` : ''}
                </div>
            </div>
    `;

    if (isVerb && verbInfo) {
        html += `
            <div class="pro-section">
                <div class="pro-section-title">
                    <i class="fas fa-table-list"></i>
                    <span>${isGerman ? 'صرف فعل' : 'Verb Conjugation'}</span>
                </div>
                <div class="pro-tense-btns">
                    <button class="pro-tense-btn active" data-tense="present">Präsens</button>
                    <button class="pro-tense-btn" data-tense="past">Präteritum</button>
                    <button class="pro-tense-btn" data-tense="perfect">Perfekt</button>
                    <button class="pro-tense-btn" data-tense="future">Futur I</button>
                </div>

                <div class="pro-tense-panel active" id="pro-tense-present">
                    <table class="pro-conj-table">
                        <tr><th>ich</th><td>${this.escapeHtml(verbInfo.present?.ich || '-')}</td></tr>
                        <tr><th>du</th><td>${this.escapeHtml(verbInfo.present?.du || '-')}</td></tr>
                        <tr><th>er/sie/es</th><td>${this.escapeHtml(verbInfo.present?.er || '-')}</td></tr>
                        <tr><th>wir</th><td>${this.escapeHtml(verbInfo.present?.wir || '-')}</td></tr>
                        <tr><th>ihr</th><td>${this.escapeHtml(verbInfo.present?.ihr || '-')}</td></tr>
                        <tr><th>sie/Sie</th><td>${this.escapeHtml(verbInfo.present?.sie || '-')}</td></tr>
                    </table>
                </div>

                <div class="pro-tense-panel" id="pro-tense-past">
                    <table class="pro-conj-table">
                        <tr><th>ich</th><td>${this.escapeHtml(verbInfo.past?.ich || '-')}</td></tr>
                        <tr><th>du</th><td>${this.escapeHtml(verbInfo.past?.du || '-')}</td></tr>
                        <tr><th>er/sie/es</th><td>${this.escapeHtml(verbInfo.past?.er || '-')}</td></tr>
                    </table>
                </div>

                <div class="pro-tense-panel" id="pro-tense-perfect">
                    <div class="pro-perfect-info">
                        <div class="pro-perfect-box">
                            <div class="pro-perfect-lbl">${isGerman ? 'فعل کمکی' : 'Auxiliary'}</div>
                            <div class="pro-perfect-val">${this.escapeHtml(verbInfo.helper || 'haben')}</div>
                        </div>
                        <div class="pro-perfect-box">
                            <div class="pro-perfect-lbl">${isGerman ? 'اسم مفعول' : 'Past Participle'}</div>
                            <div class="pro-perfect-val">${this.escapeHtml(verbInfo.perfect || '-')}</div>
                        </div>
                    </div>
                    <div class="pro-perfect-example">
                        <i class="fas fa-lightbulb"></i>
                        <span>${verbInfo.helper === 'sein' ? 'ich bin' : 'ich habe'} ${this.escapeHtml(verbInfo.perfect || '-')}</span>
                    </div>
                </div>

                <div class="pro-tense-panel" id="pro-tense-future">
                    <table class="pro-conj-table">
                        <tr><th>ich</th><td>${this.escapeHtml(verbInfo.future?.ich || ('werde ' + wordText))}</td></tr>
                        <tr><th>du</th><td>${this.escapeHtml(verbInfo.future?.du || ('wirst ' + wordText))}</td></tr>
                        <tr><th>er/sie/es</th><td>${this.escapeHtml(verbInfo.future?.er || ('wird ' + wordText))}</td></tr>
                    </table>
                </div>

                ${verbInfo.separable ? `<div class="pro-separable"><i class="fas fa-cut"></i> ${isGerman ? 'فعل جداشدنی' : 'Separable verb'}</div>` : ''}
            </div>
        `;
    }

    if (type === 'noun' && nounInfo) {
        html += `
            <div class="pro-section">
                <div class="pro-section-title">
                    <i class="fas fa-venus-mars"></i>
                    <span>${isGerman ? 'اطلاعات اسم' : 'Noun Information'}</span>
                </div>
                <div class="pro-info-grid">
                    ${nounInfo.gender ? `
                    <div class="pro-info-card">
                        <div class="pro-gender-circle ${nounInfo.gender}">
                            <i class="fas fa-${nounInfo.gender === 'masculine' ? 'mars' : nounInfo.gender === 'feminine' ? 'venus' : 'genderless'}"></i>
                        </div>
                        <div class="pro-info-text">
                            <div class="pro-info-label">${isGerman ? 'جنسیت' : 'Gender'}</div>
                            <div class="pro-info-value">${this.getGenderLabel(nounInfo.gender)}</div>
                        </div>
                    </div>
                    ` : ''}
                    ${nounInfo.plural ? `
                    <div class="pro-info-card">
                        <div class="pro-info-icon"><i class="fas fa-copy"></i></div>
                        <div class="pro-info-text">
                            <div class="pro-info-label">${isGerman ? 'جمع' : 'Plural'}</div>
                            <div class="pro-info-value">${this.escapeHtml(nounInfo.plural)}</div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    if (type === 'adjective' && adjInfo) {
        html += `
            <div class="pro-section">
                <div class="pro-section-title">
                    <i class="fas fa-chart-line"></i>
                    <span>${isGerman ? 'حالت‌های صفت' : 'Adjective Forms'}</span>
                </div>
                <div class="pro-info-grid">
                    ${adjInfo.comparative ? `
                    <div class="pro-info-card">
                        <div class="pro-info-icon"><i class="fas fa-level-up-alt"></i></div>
                        <div class="pro-info-text">
                            <div class="pro-info-label">Komparativ</div>
                            <div class="pro-info-value">${this.escapeHtml(adjInfo.comparative)}</div>
                        </div>
                    </div>
                    ` : ''}
                    ${adjInfo.superlative ? `
                    <div class="pro-info-card">
                        <div class="pro-info-icon"><i class="fas fa-crown"></i></div>
                        <div class="pro-info-text">
                            <div class="pro-info-label">Superlativ</div>
                            <div class="pro-info-value">${this.escapeHtml(adjInfo.superlative)}</div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    if (examples.length > 0) {
        html += `
            <div class="pro-section">
                <div class="pro-section-title">
                    <i class="fas fa-quote-right"></i>
                    <span>${isGerman ? 'مثال‌ها' : 'Examples'}</span>
                    <span class="count">(${examples.length})</span>
                </div>
                <div class="pro-examples-list">
                    ${examples.map(ex => `
                        <div class="pro-example-item">
                            <div class="pro-example-texts">
                                <div class="pro-example-german">${this.escapeHtml(ex.german)}</div>
                                <div class="pro-example-persian">${this.escapeHtml(ex.persian)}</div>
                            </div>
                            <button class="pro-example-speak" data-text="${this.escapeHtml(ex.german)}" title="${isGerman ? 'تلفظ' : 'Speak'}">
                                <i class="fas fa-volume-up"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (word.notes) {
        html += `
            <div class="pro-section">
                <div class="pro-section-title">
                    <i class="fas fa-sticky-note"></i>
                    <span>${isGerman ? 'نکات' : 'Notes'}</span>
                </div>
                <div class="pro-notes">${this.escapeHtml(word.notes)}</div>
            </div>
        `;
    }

    html += `</div>`;
    resultDiv.innerHTML = html;

    resultDiv.querySelectorAll('.pro-tense-btn').forEach(btn => {
        btn.onclick = () => {
            const tense = btn.dataset.tense;
            resultDiv.querySelectorAll('.pro-tense-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            resultDiv.querySelectorAll('.pro-tense-panel').forEach(panel => panel.classList.remove('active'));
            const target = resultDiv.querySelector('#pro-tense-' + tense);
            if (target) target.classList.add('active');
        };
    });

    resultDiv.querySelectorAll('.pro-speak-word-btn').forEach(btn => {
        btn.onclick = () => this.speakText(btn.dataset.word, 'de-DE');
    });

    resultDiv.querySelectorAll('.pro-copy-word-btn').forEach(btn => {
        btn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(btn.dataset.text);
                this.showToast('✅ ' + (isGerman ? 'کپی شد' : 'Copied'), 'success');
            } catch {
                this.showToast('❌ ' + (isGerman ? 'کپی ناموفق' : 'Copy failed'), 'error');
            }
        };
    });

    resultDiv.querySelectorAll('.pro-save-word-btn').forEach(btn => {
        btn.onclick = () => {
            const german = btn.dataset.german;
            const persian = btn.dataset.persian;
            this.showSaveWordDialog(german, persian, {
                type: btn.dataset.type,
                gender: btn.dataset.gender,
                plural: btn.dataset.plural
            });
        };
    });

    resultDiv.querySelectorAll('.pro-example-speak').forEach(btn => {
        btn.onclick = () => this.speakText(btn.dataset.text, 'de-DE');
    });
};

GermanDictionary.prototype.showSaveWordDialog = function(german, persian, preselect) {
    const isGerman = LanguageSystem.isGerman();

    const existingModal = document.querySelector('.tr-modal-overlay');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'tr-modal-overlay';
    modal.innerHTML = `
        <div class="tr-modal" role="dialog" aria-modal="true">
            <div class="tr-modal-header">
                <div class="tr-modal-title"><i class="fas fa-bookmark"></i> ${isGerman ? 'ذخیره لغت جدید' : 'Save New Word'}</div>
                <button class="tr-modal-close" aria-label="${isGerman ? 'بستن' : 'Close'}">&times;</button>
            </div>
            <div class="tr-modal-body">
                <div class="tr-field">
                    <label><i class="fas fa-language"></i> ${isGerman ? 'لغت آلمانی' : 'German Word'}</label>
                    <input type="text" id="save-dialog-german" class="tr-field-input" value="${this.escapeHtml(german)}">
                </div>
                <div class="tr-field">
                    <label><i class="fas fa-pencil-alt"></i> ${isGerman ? 'معنی فارسی' : 'Persian Meaning'}</label>
                    <input type="text" id="save-dialog-persian" class="tr-field-input" value="${this.escapeHtml(persian)}">
                </div>
                <div class="tr-field">
                    <label><i class="fas fa-tag"></i> ${isGerman ? 'نوع کلمه' : 'Word Type'}</label>
                    <div class="tr-type-buttons">
                        <button class="tr-type-btn ${(!preselect?.type || preselect.type === 'noun') ? 'active' : ''}" data-type="noun">${isGerman ? 'اسم' : 'Noun'}</button>
                        <button class="tr-type-btn ${preselect?.type === 'verb' ? 'active' : ''}" data-type="verb">${isGerman ? 'فعل' : 'Verb'}</button>
                        <button class="tr-type-btn ${preselect?.type === 'adjective' ? 'active' : ''}" data-type="adjective">${isGerman ? 'صفت' : 'Adj'}</button>
                        <button class="tr-type-btn ${preselect?.type === 'adverb' ? 'active' : ''}" data-type="adverb">${isGerman ? 'قید' : 'Adv'}</button>
                        <button class="tr-type-btn ${preselect?.type === 'other' ? 'active' : ''}" data-type="other">${isGerman ? 'سایر' : 'Other'}</button>
                    </div>
                </div>
                <div class="tr-field" id="save-word-gender-container" style="display:${(!preselect?.type || preselect.type === 'noun') ? 'block' : 'none'};">
                    <label><i class="fas fa-venus-mars"></i> ${isGerman ? 'جنسیت' : 'Gender'}</label>
                    <div class="tr-gender-buttons">
                        <button class="tr-gender-btn ${preselect?.gender === 'masculine' ? 'active' : ''}" data-gender="masculine">der</button>
                        <button class="tr-gender-btn ${preselect?.gender === 'feminine' ? 'active' : ''}" data-gender="feminine">die</button>
                        <button class="tr-gender-btn ${preselect?.gender === 'neuter' ? 'active' : ''}" data-gender="neuter">das</button>
                    </div>
                </div>
            </div>
            <div class="tr-modal-footer">
                <button class="tr-btn tr-btn-cancel">${isGerman ? 'انصراف' : 'Cancel'}</button>
                <button class="tr-btn tr-btn-save"><i class="fas fa-save"></i> ${isGerman ? 'ذخیره' : 'Save'}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    let selectedType = preselect?.type || 'noun';
    let selectedGender = preselect?.gender || null;

    const typeBtns = modal.querySelectorAll('.tr-type-btn');
    const genderContainer = modal.querySelector('#save-word-gender-container');
    const genderBtns = modal.querySelectorAll('.tr-gender-btn');

    typeBtns.forEach(btn => {
        btn.onclick = () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedType = btn.dataset.type;
            if (genderContainer) genderContainer.style.display = selectedType === 'noun' ? 'block' : 'none';
        };
    });

    genderBtns.forEach(btn => {
        btn.onclick = () => {
            genderBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGender = btn.dataset.gender;
        };
    });

    const closeModal = () => modal.remove();
    modal.querySelector('.tr-modal-close')?.addEventListener('click', closeModal);
    modal.querySelector('.tr-btn-cancel')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    modal.querySelector('.tr-btn-save')?.addEventListener('click', async () => {
        const germanVal = document.getElementById('save-dialog-german').value.trim();
        const persianVal = document.getElementById('save-dialog-persian').value.trim();

        if (!germanVal || !persianVal) {
            this.showToast('❌ ' + (isGerman ? 'لطفاً هر دو فیلد را پر کنید' : 'Please fill both fields'), 'error');
            return;
        }

        const wordData = {
            german: germanVal,
            persian: persianVal,
            type: selectedType,
            createdAt: new Date().toISOString()
        };

        if (selectedType === 'noun' && selectedGender) {
            wordData.gender = selectedGender;
        }

        try {
            await this.addWord(wordData);
            this.showToast('✅ "' + germanVal + '" ' + (isGerman ? 'به دیکشنری اضافه شد' : 'added to dictionary'), 'success');
            modal.remove();
        } catch (error) {
            console.error('Save word error:', error);
            this.showToast('❌ ' + (isGerman ? 'خطا در ذخیره‌سازی' : 'Save error'), 'error');
        }
    });

    setTimeout(() => document.getElementById('save-dialog-german')?.focus(), 100);
};


GermanDictionary.prototype.performAutoTranslation = async function(text) {
    const resultDiv = document.getElementById('translate-result');
    if (!text || text.trim().length === 0) {
        resultDiv.innerHTML = `<div class="empty-result" style="text-align:center;padding:20px;color:#9ca3af;">متن را وارد کنید...</div>`;
        return;
    }

    resultDiv.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;padding:16px;
            font-family:'Vazirmatn',sans-serif;color:#4361ee;">
            <span style="animation:ai-spin 1s linear infinite;display:inline-block;font-size:18px;">⏳</span>
            <span>در حال ترجمه...</span>
        </div>`;

    try {
        // اول دیکشنری شخصی رو چک کن
        const localResult = await this.searchExactInDictionary(text.trim());
        if (localResult) {
            resultDiv.innerHTML = `
                <div style="padding:12px;font-family:'Vazirmatn',sans-serif;">
                    <div style="font-size:11px;color:#10b981;margin-bottom:8px;font-weight:600;">
                        ✅ از دیکشنری شخصی شما
                    </div>
                    <div style="font-size:17px;font-weight:700;color:var(--gray-800,#1f2937);">
                        ${this.escapeHtml(localResult)}
                    </div>
                </div>`;
            return;
        }

        const isDeToFa = this.translateDirection === 'de-fa';
        let translated = null;

        // روش ۱: Google Translate (gtx - رایگان)
        try {
            const sl = isDeToFa ? 'de' : 'fa';
            const tl = isDeToFa ? 'fa' : 'de';
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                // جمع کردن همه قطعه‌های ترجمه
                if (Array.isArray(data[0])) {
                    translated = data[0]
                        .filter(chunk => chunk?.[0])
                        .map(chunk => chunk[0])
                        .join('');
                }
            }
        } catch (e) {
            console.log('Google Translate failed, trying fallback...');
        }

        // روش ۲: MyMemory (اگه Google کار نکرد)
        if (!translated) {
            try {
                const sl = isDeToFa ? 'de' : 'fa';
                const tl = isDeToFa ? 'fa' : 'de';
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
                        translated = data.responseData.translatedText;
                    }
                }
            } catch (e) {
                console.log('MyMemory failed, trying AI...');
            }
        }

        // روش ۳: puter.ai (آخرین راه‌حل)
        if (!translated) {
            const fromLang = isDeToFa ? 'آلمانی' : 'فارسی';
            const toLang   = isDeToFa ? 'فارسی'  : 'آلمانی';
            const prompt = `متن زیر را از ${fromLang} به ${toLang} ترجمه کن. فقط ترجمه را بنویس بدون هیچ توضیحی:\n${text}`;
           const response = await this._puterChat(prompt, {});
            let raw = '';
            if (response?.message?.content?.[0]?.text) raw = response.message.content[0].text;
            else if (typeof response?.message?.content === 'string') raw = response.message.content;
            else if (typeof response === 'string') raw = response;
            else if (response?.text) raw = response.text;
            translated = raw.trim().replace(/^["'«»]|["'«»]$/g, '').trim();
        }

        if (!translated) throw new Error('همه روش‌های ترجمه شکست خوردند');

        const isRtlResult = isDeToFa;
        resultDiv.innerHTML = `
            <div style="padding:12px;font-family:'Vazirmatn',sans-serif;">
                <div style="font-size:17px;font-weight:600;
                    color:var(--gray-800,#1f2937);line-height:1.7;
                    ${isRtlResult ? 'direction:rtl;text-align:right;' : 'direction:ltr;text-align:left;'}">
                    ${this.escapeHtml(translated)}
                </div>
                <div style="margin-top:10px;padding-top:8px;
                    border-top:1px solid rgba(0,0,0,0.07);
                    font-size:11px;color:#9ca3af;">
                    ${text.length > 50 ? this.escapeHtml(text.substring(0,50)) + '...' : this.escapeHtml(text)}
                </div>
            </div>`;

    } catch (error) {
        console.error('Translation error:', error);
        resultDiv.innerHTML = `
            <div style="padding:16px;text-align:center;font-family:'Vazirmatn',sans-serif;">
                <div style="color:#ef4444;margin-bottom:10px;">❌ خطا در ترجمه</div>
                <button onclick="window.dictionaryApp?.performAutoTranslation(document.getElementById('translate-input')?.value)"
                    style="background:#4361ee;color:white;border:none;border-radius:10px;
                    padding:6px 16px;cursor:pointer;font-family:'Vazirmatn',sans-serif;font-size:13px;">
                    🔄 تلاش مجدد
                </button>
            </div>`;
    }
};

