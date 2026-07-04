/* dict-practice-conj.js — Practice Options, Conjugation, FillBlanks (lines 5251-6101) */

GermanDictionary.prototype.renderPracticeOptions = function() {
      this.addAIBadgeStyles();
    const container = document.getElementById('practice-section');
    const isGerman = LanguageSystem.isGerman();
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-brain" style="color: var(--primary);"></i> ${LanguageSystem.t('practice.title')}</h2>
            </div>
            
            <!-- ========== گزینه‌های شخصی‌سازی تمرین ========== -->
            <div class="practice-customization">
                <h3><i class="fas fa-sliders-h"></i> ${isGerman ? 'تنظیمات تمرین' : 'Practice Settings'}</h3>
                
                <div class="customization-options">
                    <div class="customization-group">
                        <label class="customization-label">
                            <i class="fas fa-filter"></i>
                            <span>${isGerman ? 'محدوده لغات:' : 'Word Range:'}</span>
                        </label>
                        <div class="range-buttons">
                            <button class="range-option active" data-range="all">
                                <i class="fas fa-database"></i> ${isGerman ? 'همه لغات' : 'All Words'}
                            </button>
                            <button class="range-option" data-range="favorites">
                                <i class="fas fa-star"></i> ${isGerman ? 'لغات مورد علاقه' : 'Favorites'}
                            </button>
                            <button class="range-option" data-range="recent">
                                <i class="fas fa-clock"></i> ${isGerman ? 'لغات اخیراً اضافه شده' : 'Recently Added'}
                            </button>
                            <button class="range-option" data-range="custom">
                                <i class="fas fa-arrows-alt-h"></i> ${isGerman ? 'محدوده دلخواه' : 'Custom Range'}
                            </button>
                        </div>
                        
                        <div class="custom-range-inputs" style="display: none; margin-top: 15px;">
                            <div class="range-input-group">
                                <input type="number" id="range-start" class="form-control" 
                                       placeholder="${isGerman ? 'از لغت شماره' : 'From word #'}" min="1">
                                <span class="range-separator">${isGerman ? 'تا' : 'to'}</span>
                                <input type="number" id="range-end" class="form-control" 
                                       placeholder="${isGerman ? 'تا لغت شماره' : 'To word #'}" min="1">
                            </div>
                        </div>
                    </div>
                    
                    <div class="customization-group">
                        <label class="customization-label">
                            <i class="fas fa-question-circle"></i>
                            <span>${isGerman ? 'تعداد سوالات:' : 'Number of Questions:'}</span>
                        </label>
                        <div class="question-count-buttons">
                            <button class="count-option active" data-count="10">10</button>
                            <button class="count-option" data-count="20">20</button>
                            <button class="count-option" data-count="30">30</button>
                            <button class="count-option" data-count="50">50</button>
                            <button class="count-option" data-count="all">${isGerman ? 'همه' : 'All'}</button>
                        </div>
                    </div>
                    
                    <div class="customization-group">
                        <label class="customization-label">
                            <i class="fas fa-sort"></i>
                            <span>${isGerman ? 'ترتیب سوالات:' : 'Question Order:'}</span>
                        </label>
                        <div class="order-buttons">
                            <button class="order-option active" data-order="random">
                                <i class="fas fa-random"></i> ${isGerman ? 'تصادفی' : 'Random'}
                            </button>
                            <button class="order-option" data-order="sequential">
                                <i class="fas fa-sort-numeric-down"></i> ${isGerman ? 'ترتیبی' : 'Sequential'}
                            </button>
                            <button class="order-option" data-order="hardest">
                                <i class="fas fa-chart-line"></i> ${isGerman ? 'مشکل‌ترین' : 'Hardest First'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ========== ردیف اول: تمرین‌های اصلی ========== -->
            <div class="practice-options-grid">
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <h3>${LanguageSystem.t('practice.flashcards')}</h3>
                    <p>${isGerman ? 'مرور لغات با کارت‌های هوشمند' : 'Review words with smart cards'}</p>
                    <button class="btn btn-primary" id="start-flashcard-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
                
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-headphones"></i>
                    </div>
                    <h3>${LanguageSystem.t('practice.listening')}</h3>
                    <p>${isGerman ? 'گوش دادن و تشخیص لغت' : 'Listen and identify words'}</p>
                    <button class="btn btn-primary" id="start-listening-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
                
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-keyboard"></i>
                    </div>
                    <h3>${LanguageSystem.t('practice.writing')}</h3>
                    <p>${isGerman ? 'تایپ کردن لغات آلمانی' : 'Type German words'}</p>
                    <button class="btn btn-primary" id="start-writing-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
                  <div class="practice-option-card">
                         <div class="practice-icon">
                             <i class="fas fa-question-circle"></i>
                            </div>
                            <h3>${isGerman ? 'آزمون چهارگزینه‌ای' : 'Multiple Choice Quiz'}</h3>
                                <p>${isGerman ? 'آزمون لغات با چهار گزینه' : 'Test your vocabulary with multiple choice'}</p>
                             <button class="btn btn-primary" id="start-quiz-btn">
                         <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                          </button>
                      </div>
                <div class="practice-option-card" style="position: relative;">
    <div class="ai-badge" style="padding: 6px 16px; font-size: 13px;">
        <i class="fas fa-microchip" style="font-size: 12px;"></i>
        <span>AI</span>
        <div class="ai-fire-smoke"></div>
    </div>
    <div class="practice-icon">
        <i class="fas fa-comments"></i>
    </div>
    <h3>${LanguageSystem.t('practice.speaking')}</h3>
    <p>${isGerman ? 'ساخت جمله با هوش مصنوعی' : 'Sentence building with AI'}</p>
    <button class="btn btn-primary" id="start-speaking-btn">
        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
    </button>
</div>
            </div>
            
            <!-- ========== ردیف دوم: تمرین‌های پیشرفته ========== -->
            <div class="advanced-practice-title">
                <h3><i class="fas fa-star-of-life"></i> ${isGerman ? 'تمرین‌های پیشرفته' : 'Advanced Exercises'}</h3>
                <p>${isGerman ? 'مهارت‌های خود را با تمرین‌های تخصصی تقویت کنید' : 'Enhance your skills with specialized exercises'}</p>
            </div>
            
            <div class="practice-options-grid advanced">
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-puzzle-piece"></i>
                    </div>
                    <h3>${isGerman ? 'جای خالی' : 'Fill in the Blanks'}</h3>
                    <p>${isGerman ? 'جمله را با کلمه مناسب کامل کن' : 'Complete the sentence with the right word'}</p>
                    <button class="btn btn-primary" id="start-fill-blanks-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
                
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-sort-amount-down"></i>
                    </div>
                    <h3>${isGerman ? 'مرتب‌سازی کلمات' : 'Word Order'}</h3>
                    <p>${isGerman ? 'کلمات را به ترتیب درست جمله بچین' : 'Arrange words in correct order'}</p>
                    <button class="btn btn-primary" id="start-word-order-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
                
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-hand-peace"></i>
                    </div>
                    <h3>${isGerman ? 'تطابق لغات' : 'Matching Game'}</h3>
                    <p>${isGerman ? 'لغت آلمانی را به معنی فارسی وصل کن' : 'Match German words with Persian meanings'}</p>
                    <button class="btn btn-primary" id="start-matching-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
                
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-location-dot"></i>
                    </div>
                    <h3>${isGerman ? 'حروف اضافه' : 'Prepositions'}</h3>
                    <p>${isGerman ? 'تمرین تخصصی حروف اضافه آلمانی' : 'German prepositions practice'}</p>
                    <button class="btn btn-primary" id="start-prepositions-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
                
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-table-list"></i>
                    </div>
                    <h3>${isGerman ? 'صرف افعال' : 'Conjugation Trainer'}</h3>
                    <p>${isGerman ? 'تمرین صرف افعال در زمان‌های مختلف' : 'Practice verb conjugations'}</p>
                    <button class="btn btn-primary" id="start-conjugation-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
               
<div class="practice-option-card">
    <div class="practice-icon">
        <i class="fa-solid fa-file-lines"></i>
    </div>
    <h3>${isGerman ? 'تکمیل جمله' : 'Sentence Completion'}</h3>
    <p>${isGerman ? 'جملات را با کلمه مناسب کامل کن' : 'Complete sentences with the right word'}</p>
    <button class="btn btn-primary" id="start-sentence-completion-btn">
        <i class="fa-solid fa-play"></i> ${LanguageSystem.t('practice.start')}
    </button>
</div>
     <div class="practice-option-card">
    <div class="practice-icon">
        <i class="fas fa-eye"></i>
    </div>
    <h3>حالت مطالعه</h3>
    <p>مرور خودکار لغات با تایمر قابل تنظیم</p>
    <button class="btn btn-primary" id="start-study-mode-btn">
        <i class="fas fa-play"></i> شروع مطالعه
    </button>
</div>
                <div class="practice-option-card">
                    <div class="practice-icon">
                        <i class="fas fa-venus-mars"></i>
                    </div>
                    <h3>${isGerman ? 'تشخیص جنسیت' : 'Gender Guesser'}</h3>
                    <p>${isGerman ? 'der, die یا das؟ کدام درست است؟' : 'der, die or das? Choose correctly'}</p>
                    <button class="btn btn-primary" id="start-gender-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                </div>
            </div>
        </div>
   
    `;
    
   document.querySelectorAll('.range-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.range-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const range = btn.dataset.range;
        const customInputs = document.querySelector('.custom-range-inputs');
        
        // ذخیره در localStorage
        localStorage.setItem('practiceRange', range);
        
        if (customInputs) {
            customInputs.style.display = range === 'custom' ? 'block' : 'none';
        }
    });
});
   
    
    document.querySelectorAll('.count-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.count-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    document.querySelectorAll('.order-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.order-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // تمرین‌های اصلی
    document.getElementById('start-flashcard-btn')?.addEventListener('click', () => {
        this.startPracticeSession();
    });
    document.getElementById('start-quiz-btn')?.addEventListener('click', () => {
    this.startQuiz();
});
    document.getElementById('start-listening-btn')?.addEventListener('click', () => {
        this.startListeningPractice();
    });
    
    document.getElementById('start-writing-btn')?.addEventListener('click', () => {
        this.startWritingPractice();
    });
    
    document.getElementById('start-speaking-btn')?.addEventListener('click', () => {
        this.startSpeakingPractice();
    });
    
    // تمرین‌های پیشرفته
    document.getElementById('start-fill-blanks-btn')?.addEventListener('click', () => {
        this.startFillBlanksPractice();
    });
    
    document.getElementById('start-word-order-btn')?.addEventListener('click', () => {
        this.startWordOrderPractice();
    });
    
    document.getElementById('start-matching-btn')?.addEventListener('click', () => {
        this.startMatchingPractice();
    });
    
    document.getElementById('start-prepositions-btn')?.addEventListener('click', () => {
        this.startPrepositionsPractice();
    });
    document.getElementById('start-quiz-btn')?.addEventListener('click', () => {
    this.startQuiz();
});
    document.getElementById('start-conjugation-btn')?.addEventListener('click', () => {
        this.startConjugationPractice();
    });
    
    document.getElementById('start-gender-btn')?.addEventListener('click', () => {
        this.startGenderPractice();
    });
         document.getElementById('start-fill-blanks-btn')?.addEventListener('click', () => {
        this.startFillBlanksPractice();
        
    });
    document.getElementById('start-sentence-completion-btn')?.addEventListener('click', () => {
    this.startSentenceCompletionPractice();
    });
    document.getElementById('start-word-order-btn')?.addEventListener('click', () => {
    this.startWordOrderPractice();
    });
    document.getElementById('start-study-mode-btn')?.addEventListener('click', () => {
    this.startStudyMode();
});
// بازیابی محدوده ذخیره شده
const savedRange = localStorage.getItem('practiceRange') || 'all';
document.querySelectorAll('.range-option').forEach(btn => {
    if (btn.dataset.range === savedRange) {
        btn.classList.add('active');
        const customInputs = document.querySelector('.custom-range-inputs');
        if (customInputs) {
            customInputs.style.display = savedRange === 'custom' ? 'block' : 'none';
        }
    } else {
        btn.classList.remove('active');
    }
});
const rangeStart = document.getElementById('range-start');
const rangeEnd = document.getElementById('range-end');

if (rangeStart) {
    rangeStart.addEventListener('change', () => {
        localStorage.setItem('practiceRangeStart', rangeStart.value);
    });
}

if (rangeEnd) {
    rangeEnd.addEventListener('change', () => {
        localStorage.setItem('practiceRangeEnd', rangeEnd.value);
    });
}
// بازیابی مقادیر محدوده دلخواه (اگه وجود داشته باشه)
const savedStart = localStorage.getItem('practiceRangeStart');
const savedEnd = localStorage.getItem('practiceRangeEnd');
if (savedStart) document.getElementById('range-start').value = savedStart;
if (savedEnd) document.getElementById('range-end').value = savedEnd;
// بازیابی تعداد سوالات
const savedCount = localStorage.getItem('practiceCount') || '10';
document.querySelectorAll('.count-option').forEach(btn => {
    if (btn.dataset.count === savedCount) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
});

// ذخیره تعداد سوالات هنگام کلیک
document.querySelectorAll('.count-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const count = btn.dataset.count;
        localStorage.setItem('practiceCount', count);
        document.querySelectorAll('.count-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// بازیابی ترتیب سوالات
const savedOrder = localStorage.getItem('practiceOrder') || 'random';
document.querySelectorAll('.order-option').forEach(btn => {
    if (btn.dataset.order === savedOrder) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
});

// ذخیره ترتیب سوالات هنگام کلیک
document.querySelectorAll('.order-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const order = btn.dataset.order;
        localStorage.setItem('practiceOrder', order);
        document.querySelectorAll('.order-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});
this.updatePracticeTagFilter();
};

GermanDictionary.prototype.startConjugationPractice = async function() {
    const wordsToPractice = await this.getFilteredWordsForPractice();

    // فقط فعل‌هایی که صرف دارن
    let verbWords = wordsToPractice.filter(word => word.type === 'verb' && word.verbForms);

    if (verbWords.length === 0) {
        this.showToast('هیچ فعلی با اطلاعات صرف در این بازه وجود ندارد', 'warning');
        return;
    }

    // ذخیره لغات برای استفاده در صفحه فیلتر
    this._cjVerbWords = verbWords;

    // نمایش صفحه فیلتر
    this.showConjugationFilter();
};

GermanDictionary.prototype.showConjugationFilter = function() {
    this._cjInjectStyles();
    const verbWords = this._cjVerbWords || [];
    const container = document.getElementById('practice-section');
    if (!container) return;

    // بررسی کدام tense ها و ضمایر در داده‌ها موجود هستند
    const availableTenses = {};
    const availablePronouns = {};
    const PRONOUN_GROUPS = [
        { key: 'ich', label: 'ich', desc: 'من' },
        { key: 'du', label: 'du', desc: 'تو' },
        { key: 'er_sie_es', label: 'er/sie/es', desc: 'او' },
        { key: 'wir', label: 'wir', desc: 'ما' },
        { key: 'ihr', label: 'ihr', desc: 'شما (جمع)' },
        { key: 'sie_Sie', label: 'sie/Sie', desc: 'آنها/شما (محترمانه)' }
    ];

    const TENSES = [
        { key: 'present', label: 'Präsens', desc: 'حال ساده', icon: 'fa-clock' },
        { key: 'past', label: 'Präteritum', desc: 'گذشته ساده', icon: 'fa-clock-rotate-left' },
        { key: 'perfect', label: 'Perfekt', desc: 'گذشته کامل', icon: 'fa-circle-check' },
        { key: 'future', label: 'Futur I', desc: 'آینده', icon: 'fa-arrow-trend-up' },
        { key: 'konjunktiv', label: 'Konjunktiv II', desc: 'التزامی', icon: 'fa-circle-question' }
    ];

    // بررسی داده‌ها
    verbWords.forEach(word => {
        if (!word.verbForms) return;
        TENSES.forEach(t => {
            if (word.verbForms[t.key]) {
                if (!availableTenses[t.key]) availableTenses[t.key] = { count: 0, info: t };
                availableTenses[t.key].count++;
                // بررسی ضمایر (گروه‌بندی شده)
                const forms = this._cjParseVerbConjugationGrouped(word.verbForms[t.key]);
                forms.forEach(f => {
                    if (!f.group) return;
                    if (!availablePronouns[f.group]) {
                        const info = PRONOUN_GROUPS.find(p => p.key === f.group);
                        availablePronouns[f.group] = { count: 0, info: info };
                    }
                    availablePronouns[f.group].count++;
                });
            }
        });
    });

    // ساخت HTML صفحه فیلتر
    const self = this;

    // tense buttons
    let tenseButtonsHtml = '';
    TENSES.forEach(t => {
        const avail = availableTenses[t.key];
        if (!avail) {
            tenseButtonsHtml += '<button class="cj-filter-btn disabled" data-tense="' + t.key + '" disabled>' +
                '<i class="fas ' + t.icon + '"></i>' +
                '<span class="cj-filter-label">' + t.label + '</span>' +
                '<span class="cj-filter-desc">' + t.desc + '</span>' +
                '<span class="cj-filter-count" style="color:#ef4444;">✗</span>' +
            '</button>';
        } else {
            tenseButtonsHtml += '<button class="cj-filter-btn" data-tense="' + t.key + '">' +
                '<i class="fas ' + t.icon + '"></i>' +
                '<span class="cj-filter-label">' + t.label + '</span>' +
                '<span class="cj-filter-desc">' + t.desc + '</span>' +
                '<span class="cj-filter-count">' + avail.count + ' فعل</span>' +
            '</button>';
        }
    });

    // pronoun buttons
    let pronounButtonsHtml = '';
    PRONOUN_GROUPS.forEach(p => {
        const avail = availablePronouns[p.key];
        if (!avail) {
            pronounButtonsHtml += '<button class="cj-filter-btn cj-pronoun-btn disabled" data-pronoun="' + p.key + '" disabled>' +
                '<span class="cj-filter-label">' + p.label + '</span>' +
                '<span class="cj-filter-desc">' + p.desc + '</span>' +
                '<span class="cj-filter-count" style="color:#ef4444;">✗</span>' +
            '</button>';
        } else {
            pronounButtonsHtml += '<button class="cj-filter-btn cj-pronoun-btn" data-pronoun="' + p.key + '">' +
                '<span class="cj-filter-label">' + p.label + '</span>' +
                '<span class="cj-filter-desc">' + p.desc + '</span>' +
                '<span class="cj-filter-count">' + avail.count + '</span>' +
            '</button>';
        }
    });

    container.innerHTML = '<div class="cj-root">' +
        '<div class="cj-head">' +
            '<h2><i class="fas fa-filter"></i> فیلتر صرف افعال</h2>' +
            '<button class="cj-btn cj-btn-outline" id="cj-filter-back" style="flex:0 0 auto;min-width:auto;padding:8px 14px;"><i class="fas fa-arrow-right"></i> بازگشت</button>' +
        '</div>' +
        '<div class="cj-card">' +
            '<div style="text-align:center;color:var(--cj-muted);font-size:13px;margin-bottom:16px;position:relative;z-index:1;">' + verbWords.length + ' فعل با اطلاعات صرف موجود است. زمان‌ها و ضمایر مورد نظر را انتخاب کنید.</div>' +

            '<div style="position:relative;z-index:1;margin-bottom:18px;">' +
                '<div style="font-size:14px;font-weight:700;margin-bottom:10px;color:var(--cj-text);"><i class="fas fa-clock" style="color:#8b5cf6;"></i> زمان‌ها (Tenses)</div>' +
                '<div class="cj-filter-grid">' + tenseButtonsHtml + '</div>' +
            '</div>' +

            '<div style="position:relative;z-index:1;margin-bottom:18px;">' +
                '<div style="font-size:14px;font-weight:700;margin-bottom:10px;color:var(--cj-text);"><i class="fas fa-user" style="color:#8b5cf6;"></i> ضمایر (Pronouns)</div>' +
                '<div class="cj-filter-grid cj-pronoun-grid">' + pronounButtonsHtml + '</div>' +
            '</div>' +

            '<div id="cj-filter-summary" style="position:relative;z-index:1;background:var(--cj-bg);border:1px solid var(--cj-border);border-radius:12px;padding:12px 14px;margin-bottom:14px;font-size:12px;color:var(--cj-muted);text-align:center;">' +
                'حداقل یک زمان و یک ضمیر انتخاب کنید' +
            '</div>' +

            '<div class="cj-actions" style="position:relative;z-index:1;">' +
                '<button class="cj-btn cj-btn-primary" id="cj-filter-start" disabled><i class="fas fa-play"></i> شروع تمرین</button>' +
                '<button class="cj-btn cj-btn-outline" id="cj-filter-select-all"><i class="fas fa-check-double"></i> انتخاب همه</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    // اضافه کردن استایل‌های فیلتر اگر هنوز نبود
    if (!document.getElementById('cj-filter-styles')) {
        const fs = document.createElement('style');
        fs.id = 'cj-filter-styles';
        fs.textContent = `
          .cj-filter-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;}
          .cj-pronoun-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr));}
          .cj-filter-btn{font-family:'Vazirmatn',Tahoma,sans-serif;display:flex;flex-direction:column;align-items:center;gap:3px;
            padding:12px 8px;border:2px solid var(--cj-border);border-radius:12px;background:var(--cj-bg);
            color:var(--cj-text);cursor:pointer;transition:all .2s;text-align:center;font-size:12px;font-weight:600;}
          .cj-filter-btn:not(.disabled):hover{border-color:var(--cj-primary);transform:translateY(-2px);box-shadow:0 4px 12px rgba(139,92,246,.15);}
          .cj-filter-btn.active{background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(139,92,246,.3);}
          .cj-filter-btn.disabled{opacity:.4;cursor:not-allowed;}
          .cj-filter-btn i{font-size:18px;color:var(--cj-primary);}
          .cj-filter-btn.active i{color:#fff;}
          .cj-filter-label{font-weight:800;font-size:13px;direction:ltr;}
          .cj-filter-desc{font-size:10px;opacity:.7;}
          .cj-filter-count{font-size:10px;font-weight:700;opacity:.6;}
          .cj-filter-btn.active .cj-filter-count{opacity:.9;}
          @media(max-width:480px){
            .cj-filter-grid{grid-template-columns:1fr 1fr;gap:8px;}
            .cj-pronoun-grid{grid-template-columns:1fr 1fr;}
            .cj-filter-btn{padding:10px 6px;font-size:11px;}
            .cj-filter-label{font-size:12px;}
          }
        `;
        document.head.appendChild(fs);
    }

    // رویدادها
    document.getElementById('cj-filter-back').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };

    // انتخاب tense
    document.querySelectorAll('.cj-filter-btn[data-tense]:not(.disabled)').forEach(btn => {
        btn.onclick = () => {
            btn.classList.toggle('active');
            self._cjUpdateFilterSummary();
        };
    });

    // انتخاب pronoun
    document.querySelectorAll('.cj-filter-btn[data-pronoun]:not(.disabled)').forEach(btn => {
        btn.onclick = () => {
            btn.classList.toggle('active');
            self._cjUpdateFilterSummary();
        };
    });

    // انتخاب همه
    document.getElementById('cj-filter-select-all').onclick = () => {
        document.querySelectorAll('.cj-filter-btn:not(.disabled)').forEach(btn => btn.classList.add('active'));
        self._cjUpdateFilterSummary();
    };

    // شروع تمرین
    document.getElementById('cj-filter-start').onclick = () => {
        self._cjStartFilteredConjugation();
    };

    this._cjUpdateFilterSummary = function() {
        const selectedTenses = Array.from(document.querySelectorAll('.cj-filter-btn[data-tense].active')).map(b => b.dataset.tense);
        const selectedPronouns = Array.from(document.querySelectorAll('.cj-filter-btn[data-pronoun].active')).map(b => b.dataset.pronoun);
        const startBtn = document.getElementById('cj-filter-start');
        const summary = document.getElementById('cj-filter-summary');

        if (selectedTenses.length === 0 || selectedPronouns.length === 0) {
            startBtn.disabled = true;
            summary.innerHTML = 'حداقل یک زمان و یک ضمیر انتخاب کنید';
            summary.style.color = 'var(--cj-muted)';
        } else {
            // محاسبه تعداد سوالات ممکن (گروه‌بندی شده)
            let possibleQuestions = 0;
            verbWords.forEach(word => {
                if (!word.verbForms) return;
                selectedTenses.forEach(tenseKey => {
                    if (!word.verbForms[tenseKey]) return;
                    const forms = self._cjParseVerbConjugationGrouped(word.verbForms[tenseKey]);
                    forms.forEach(f => {
                        if (f.group && selectedPronouns.includes(f.group)) possibleQuestions++;
                    });
                });
            });

            startBtn.disabled = possibleQuestions === 0;
            summary.innerHTML = '<strong style="color:var(--cj-text);">' + selectedTenses.length + '</strong> زمان • <strong style="color:var(--cj-text);">' + selectedPronouns.length + '</strong> ضمیر • <strong style="color:#10b981;">' + possibleQuestions + '</strong> سوال ممکن';
            summary.style.color = 'var(--cj-muted)';
        }
    };
};

GermanDictionary.prototype._cjStartFilteredConjugation = function() {
    const verbWords = this._cjVerbWords || [];
    const selectedTenses = Array.from(document.querySelectorAll('.cj-filter-btn[data-tense].active')).map(b => b.dataset.tense);
    const selectedPronouns = Array.from(document.querySelectorAll('.cj-filter-btn[data-pronoun].active')).map(b => b.dataset.pronoun);

    if (selectedTenses.length === 0 || selectedPronouns.length === 0) {
        this.showToast('حداقل یک زمان و یک ضمیر انتخاب کنید', 'warning');
        return;
    }

    const TENSE_INFO = {
        present: { label: 'Präsens (حال ساده)', icon: 'fa-clock' },
        past: { label: 'Präteritum (گذشته ساده)', icon: 'fa-clock-rotate-left' },
        perfect: { label: 'Perfekt (گذشته کامل)', icon: 'fa-circle-check' },
        future: { label: 'Futur I (آینده)', icon: 'fa-arrow-trend-up' },
        konjunktiv: { label: 'Konjunktiv II (التزامی)', icon: 'fa-circle-question' }
    };

    // ساخت سوالات بر اساس فیلتر (گروه‌بندی شده - er/sie/es یک سوال)
    const allQuestions = [];
    verbWords.forEach(word => {
        if (!word.verbForms) return;

        selectedTenses.forEach(tenseKey => {
            if (!word.verbForms[tenseKey]) return;
            const tenseInfo = TENSE_INFO[tenseKey];
            const forms = this._cjParseVerbConjugationGrouped(word.verbForms[tenseKey]);
            forms.forEach(formItem => {
                if (!formItem.group || !formItem.form) return;

                if (selectedPronouns.includes(formItem.group)) {
                    allQuestions.push({
                        word: word,
                        tense: tenseInfo,
                        pronoun: formItem.pronoun, // "er/sie/es" یا "sie/Sie" و غیره
                        correctAnswer: formItem.form
                    });
                }
            });
        });
    });

    if (allQuestions.length === 0) {
        this.showToast('سوالی با این فیلتر وجود ندارد', 'warning');
        return;
    }

    // محدود کردن تعداد سوالات (حداکثر 30)
    let finalQuestions = this.shuffleArray(allQuestions);
    if (finalQuestions.length > 30) {
        finalQuestions = finalQuestions.slice(0, 30);
    }

    this.conjugationSession = {
        questions: finalQuestions,
        currentIndex: 0,
        score: 0,
        mistakes: 0
    };

    this.showConjugationQuestion();
    this.showSection('practice-section');
};

GermanDictionary.prototype._cjNormalizeConjugation = function(str) {
    if (!str) return '';
    return String(str).toLowerCase().trim()
        .replace(/\s+/g, ' ')
        .replace(/[،,]/g, ',')
        .replace(/\s*,\s*/g, ', ')
        .replace(/\s*\/\s*/g, ', ')
        .replace(/\s*\|\s*/g, ', ');
};

GermanDictionary.prototype._cjParseForms = function(str) {
    if (!str) return [];
    const normalized = this._cjNormalizeConjugation(str);
    return normalized.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

GermanDictionary.prototype._cjParseVerbConjugation = function(str) {
    if (!str || typeof str !== 'string') return [];
    const result = [];
    const pronouns = ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'Sie', 'man'];
    const parts = str.split(/[,،/|]\s*/);
    let seenWirOrIhr = false; // برای تشخیص sie مونث vs sie آنها
    parts.forEach(part => {
        part = part.trim();
        if (!part) return;
        let matched = null;
        for (const p of pronouns) {
            if (part.toLowerCase().startsWith(p.toLowerCase() + ' ')) {
                let pronoun = p;
                // تشخیص sie مونث vs sie آنها
                if (p === 'sie') {
                    if (seenWirOrIhr) {
                        // sie بعد از wir/ihr → sie آنها
                        pronoun = 'sie_pl'; // نشانگر sie جمع (آنها)
                    } else {
                        // sie قبل از wir → sie مونث
                        pronoun = 'sie_sg'; // نشانگر sie مفرد (مونث)
                    }
                }
                if (p === 'wir' || p === 'ihr') seenWirOrIhr = true;
                matched = { pronoun: pronoun, form: part.substring(p.length).trim() };
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

// متد جدید: parse با گروه‌بندی er/sie/es → یک فرم
GermanDictionary.prototype._cjParseVerbConjugationGrouped = function(str) {
    if (!str || typeof str !== 'string') return [];
    const parsed = this._cjParseVerbConjugation(str);
    const grouped = [];
    const seenGroups = {};
    parsed.forEach(item => {
        if (!item.pronoun) return;
        // گروه‌بندی
        let group = null;
        let displayPronoun = item.pronoun;
        if (item.pronoun === 'er' || item.pronoun === 'sie_sg' || item.pronoun === 'es') {
            group = 'er_sie_es';
            displayPronoun = 'er/sie/es';
        } else if (item.pronoun === 'ich') {
            group = 'ich';
        } else if (item.pronoun === 'du') {
            group = 'du';
        } else if (item.pronoun === 'wir') {
            group = 'wir';
        } else if (item.pronoun === 'ihr') {
            group = 'ihr';
        } else if (item.pronoun === 'sie_pl' || item.pronoun === 'Sie') {
            group = 'sie_Sie';
            displayPronoun = 'sie/Sie';
        }

        if (group && !seenGroups[group]) {
            seenGroups[group] = true;
            grouped.push({ pronoun: displayPronoun, form: item.form, group: group });
        }
    });
    return grouped;
};

GermanDictionary.prototype._cjCheckSingleForm = function(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return false;
    const normalizeFinal = (s) => String(s).toLowerCase().trim()
        .replace(/[äå]/g, 'ae')
        .replace(/[ö]/g, 'oe')
        .replace(/[ü]/g, 'ue')
        .replace(/[ß]/g, 'ss')
        .replace(/\s+/g, ' ')
        .trim();
    return normalizeFinal(userAnswer) === normalizeFinal(correctAnswer);
};

GermanDictionary.prototype._cjEsc = function(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
};

GermanDictionary.prototype._cjInjectStyles = function() {
    if (document.getElementById('cj-pro-styles')) return;
    const style = document.createElement('style');
    style.id = 'cj-pro-styles';
    style.textContent = `
      :root{
        --cj-bg:#f7f8fa;--cj-card:#fff;--cj-text:#1a1a2e;--cj-muted:#64748b;
        --cj-border:#e2e8f0;--cj-primary:#8b5cf6;
      }
      body.dark-mode{
        --cj-bg:#0f1115;--cj-card:#1a1d24;--cj-text:#e4e6eb;--cj-muted:#9ca3af;
        --cj-border:#2a2e38;
      }

      .cj-root{font-family:'Vazirmatn',Tahoma,sans-serif;direction:rtl;color:var(--cj-text);max-width:760px;margin:0 auto;padding:8px 0;}
      .cj-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap;}
      .cj-head h2{font-size:18px;font-weight:800;margin:0;display:flex;align-items:center;gap:8px;}
      .cj-head h2 i{color:var(--cj-primary);}
      .cj-badge{font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;color:#fff;}

      .cj-card{background:var(--cj-card);border:1.5px solid var(--cj-border);border-radius:20px;padding:24px;
        box-shadow:0 8px 24px rgba(0,0,0,.06);position:relative;overflow:hidden;}
      body.dark-mode .cj-card{box-shadow:0 8px 24px rgba(0,0,0,.3);}
      .cj-card::before{content:"";position:absolute;top:-30px;left:-30px;width:140px;height:140px;border-radius:50%;
        background:radial-gradient(circle,rgba(139,92,246,.1) 0%,transparent 70%);pointer-events:none;}

      .cj-tense-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;
        background:rgba(139,92,246,.1);color:#8b5cf6;font-size:12px;font-weight:700;margin-bottom:14px;position:relative;z-index:1;}

      .cj-verb-row{display:flex;align-items:center;gap:14px;margin-bottom:18px;position:relative;z-index:1;flex-wrap:wrap;}
      .cj-pronoun-badge{background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;font-size:18px;font-weight:800;
        padding:10px 20px;border-radius:12px;direction:ltr;flex-shrink:0;}
      .cj-verb-word{font-size:24px;font-weight:800;color:var(--cj-text);direction:ltr;}

      .cj-input{width:100%;font-family:inherit;font-size:16px;padding:14px 16px;border:2px solid var(--cj-border);
        border-radius:12px;background:var(--cj-bg);color:var(--cj-text);direction:ltr;text-align:center;
        transition:all .2s;box-sizing:border-box;position:relative;z-index:1;}
      .cj-input:focus{outline:none;border-color:var(--cj-primary);box-shadow:0 0 0 3px rgba(139,92,246,.15);}
      .cj-input.correct{border-color:#10b981;background:rgba(16,185,129,.08);}
      .cj-input.incorrect{border-color:#f43f5e;background:rgba(244,63,94,.08);}

      .cj-hint{background:var(--cj-bg);border:1px solid var(--cj-border);border-radius:12px;padding:10px 14px;
        font-size:12px;color:var(--cj-muted);margin-top:12px;text-align:center;position:relative;z-index:1;}
      .cj-hint strong{color:var(--cj-text);}

      .cj-actions{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;position:relative;z-index:1;}
      .cj-btn{font-family:inherit;font-size:13px;font-weight:700;padding:11px 18px;border-radius:11px;border:none;
        cursor:pointer;color:#fff;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:1;}
      .cj-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
      .cj-btn:active{transform:scale(.97);}
      .cj-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
      .cj-btn-primary{background:linear-gradient(135deg,#8b5cf6,#6d28d9);}
      .cj-btn-outline{background:transparent;color:var(--cj-text);border:1.5px solid var(--cj-border);flex:0 0 auto;min-width:110px;}
      .cj-btn-slate{background:linear-gradient(135deg,#64748b,#475569);flex:0 0 auto;min-width:110px;}

      .cj-feedback{padding:12px 14px;border-radius:12px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;margin-top:12px;position:relative;z-index:1;}
      .cj-feedback.correct{background:rgba(16,185,129,.1);color:#059669;border:1px solid rgba(16,185,129,.2);}
      .cj-feedback.incorrect{background:rgba(244,63,94,.1);color:#e11d48;border:1px solid rgba(244,63,94,.2);}
      body.dark-mode .cj-feedback.correct{background:rgba(16,185,129,.15);color:#34d399;}
      body.dark-mode .cj-feedback.incorrect{background:rgba(244,63,94,.15);color:#fb7185;}

      .cj-progress-wrap{margin-top:18px;display:flex;flex-direction:column;gap:6px;position:relative;z-index:1;}
      .cj-progress-bar{height:8px;background:var(--cj-bg);border-radius:999px;overflow:hidden;border:1px solid var(--cj-border);}
      .cj-progress-fill{height:100%;background:linear-gradient(90deg,#8b5cf6,#14b8a6);transition:width .3s ease;border-radius:999px;}
      .cj-progress-info{display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:var(--cj-muted);}

      .cj-rs-card{background:var(--cj-card);border:1.5px solid var(--cj-border);border-radius:20px;padding:28px;
        box-shadow:0 8px 24px rgba(0,0,0,.06);text-align:center;}
      body.dark-mode .cj-rs-card{box-shadow:0 8px 24px rgba(0,0,0,.3);}
      .cj-rs-title{font-size:20px;font-weight:800;margin:0 0 20px;display:flex;align-items:center;justify-content:center;gap:8px;}
      .cj-rs-title i{color:#f59e0b;}
      .cj-rs-circle{width:140px;height:140px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;}
      .cj-rs-circle-inner{width:110px;height:110px;border-radius:50%;background:var(--cj-card);display:flex;align-items:center;justify-content:center;}
      .cj-rs-circle-num{font-size:32px;font-weight:800;color:var(--cj-text);}
      .cj-rs-stats{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;}
      .cj-rs-stat{background:var(--cj-bg);border:1px solid var(--cj-border);border-radius:12px;padding:12px 18px;min-width:110px;}
      .cj-rs-stat-lbl{font-size:11px;font-weight:600;color:var(--cj-muted);margin-bottom:4px;}
      .cj-rs-stat-val{font-size:20px;font-weight:800;color:var(--cj-text);}
      .cj-rs-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}

      @media(max-width:768px){
        .cj-card,.cj-rs-card{padding:18px;}
        .cj-verb-word{font-size:20px;}
        .cj-pronoun-badge{font-size:16px;padding:8px 16px;}
        .cj-btn{font-size:12px;padding:10px 14px;}
        .cj-rs-circle{width:120px;height:120px;}
        .cj-rs-circle-inner{width:96px;height:96px;}
        .cj-rs-circle-num{font-size:26px;}
      }
      @media(max-width:480px){
        .cj-root{padding:4px 0;}
        .cj-card{padding:16px 14px;}
        .cj-verb-word{font-size:18px;}
        .cj-pronoun-badge{font-size:14px;padding:6px 12px;}
        .cj-actions{flex-direction:column;}
        .cj-btn{width:100%;}
        .cj-btn-outline,.cj-btn-slate{min-width:0;}
        .cj-rs-stats{flex-direction:column;align-items:stretch;}
        .cj-rs-stat{min-width:0;}
        .cj-rs-actions{flex-direction:column;}
      }
    `;
    document.head.appendChild(style);
};

GermanDictionary.prototype.showConjugationQuestion = function() {
    this._cjInjectStyles();
    if (this.conjugationSession.currentIndex >= this.conjugationSession.questions.length) {
        this.showConjugationResults();
        return;
    }

    const q = this.conjugationSession.questions[this.conjugationSession.currentIndex];
    const current = this.conjugationSession.currentIndex + 1;
    const total = this.conjugationSession.questions.length;
    const progress = (current - 1) / total * 100;

    const container = document.getElementById('practice-section');
    if (!container) return;

    container.innerHTML = '<div class="cj-root">' +
        '<div class="cj-head">' +
            '<h2><i class="fas fa-table-list"></i> صرف افعال</h2>' +
            '<span class="cj-badge" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);">' + current + ' / ' + total + '</span>' +
        '</div>' +
        '<div class="cj-card">' +
            '<div style="text-align:center;position:relative;z-index:1;">' +
                '<div class="cj-tense-badge"><i class="fas ' + q.tense.icon + '"></i> ' + q.tense.label + '</div>' +
            '</div>' +
            '<div class="cj-verb-row">' +
                '<div class="cj-pronoun-badge">' + this._cjEsc(q.pronoun) + '</div>' +
                '<div class="cj-verb-word">' + this._cjEsc(q.word.german) + '</div>' +
            '</div>' +
            '<input type="text" class="cj-input" id="conjugation-answer" placeholder="صرف فعل برای ' + this._cjEsc(q.pronoun) + '..." autocomplete="off" style="direction:ltr;">' +
            '<div class="cj-hint">💡 فقط فرم فعل برای ضمیر <strong>' + this._cjEsc(q.pronoun) + '</strong> را وارد کنید.</div>' +
            '<div class="cj-actions">' +
                '<button id="check-conjugation-btn" class="cj-btn cj-btn-primary"><i class="fas fa-check"></i> بررسی</button>' +
                '<button id="hint-conjugation-btn" class="cj-btn cj-btn-outline"><i class="fas fa-lightbulb"></i> راهنمایی</button>' +
                '<button id="skip-conjugation-btn" class="cj-btn cj-btn-slate"><i class="fas fa-forward"></i> رد کردن</button>' +
            '</div>' +
            '<div id="conjugation-feedback"></div>' +
            '<div class="cj-progress-wrap">' +
                '<div class="cj-progress-bar"><div class="cj-progress-fill" style="width:' + progress + '%"></div></div>' +
                '<div class="cj-progress-info"><span>' + current + ' / ' + total + '</span><span>' + Math.round(progress) + '%</span></div>' +
            '</div>' +
        '</div>' +
    '</div>';

    const checkBtn = document.getElementById('check-conjugation-btn');
    const skipBtn = document.getElementById('skip-conjugation-btn');
    const hintBtn = document.getElementById('hint-conjugation-btn');
    const answerInput = document.getElementById('conjugation-answer');

    if (checkBtn) checkBtn.onclick = () => this.checkConjugationAnswer();
    if (skipBtn) skipBtn.onclick = () => this.skipConjugationQuestion();
    if (hintBtn) hintBtn.onclick = () => this.showConjugationHint();

    if (answerInput) {
        answerInput.focus();
        answerInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.checkConjugationAnswer();
            }
        };
    }
};

GermanDictionary.prototype.checkConjugationAnswer = async function() {
    const answerInput = document.getElementById('conjugation-answer');
    const userAnswer = answerInput.value.trim();
    const q = this.conjugationSession.questions[this.conjugationSession.currentIndex];
    const feedbackDiv = document.getElementById('conjugation-feedback');
    const checkBtn = document.getElementById('check-conjugation-btn');

    if (!userAnswer) {
        this.showToast('لطفاً پاسخ را وارد کنید', 'warning');
        return;
    }

    const isCorrect = this._cjCheckSingleForm(userAnswer, q.correctAnswer);

    if (checkBtn) checkBtn.disabled = true;
    if (answerInput) answerInput.disabled = true;

    if (isCorrect) {
        this.conjugationSession.score++;
        feedbackDiv.innerHTML = '<div class="cj-feedback correct"><i class="fas fa-check-circle"></i> آفرین! پاسخ صحیح است</div>';
        if (answerInput) answerInput.classList.add('correct');

        setTimeout(() => {
            this.conjugationSession.currentIndex++;
            this.showConjugationQuestion();
        }, 1000);
    } else {
        feedbackDiv.innerHTML = '<div class="cj-feedback incorrect"><i class="fas fa-times-circle"></i> پاسخ صحیح: <strong>' + this._cjEsc(q.correctAnswer) + '</strong></div>';
        if (answerInput) answerInput.classList.add('incorrect');
        this.conjugationSession.mistakes++;

        setTimeout(() => {
            this.conjugationSession.currentIndex++;
            this.showConjugationQuestion();
        }, 2500);
    }

    await this.recordPractice(q.word.id, isCorrect);
};

GermanDictionary.prototype.skipConjugationQuestion = function() {
    this.conjugationSession.currentIndex++;
    this.showConjugationQuestion();
};

GermanDictionary.prototype.showConjugationHint = function() {
    const q = this.conjugationSession.questions[this.conjugationSession.currentIndex];
    if (!q.correctAnswer) return;
    const hint = q.correctAnswer.length < 3 ? q.correctAnswer : q.correctAnswer.substring(0, 2) + '...';
    this.showToast('💡 راهنما: ' + hint, 'info');
};

GermanDictionary.prototype.showConjugationResults = function() {
    this._cjInjectStyles();
    const total = this.conjugationSession.questions.length;
    const score = this.conjugationSession.score;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    const container = document.getElementById('practice-section');
    if (!container) return;

    container.innerHTML = '<div class="cj-root">' +
        '<div class="cj-rs-card">' +
            '<div class="cj-rs-title"><i class="fas fa-table-list"></i> نتایج تمرین صرف افعال</div>' +
            '<div class="cj-rs-circle" style="background: conic-gradient(#8b5cf6 0% ' + accuracy + '%, var(--cj-bg) ' + accuracy + '% 100%);">' +
                '<div class="cj-rs-circle-inner"><span class="cj-rs-circle-num">' + accuracy + '%</span></div>' +
            '</div>' +
            '<div class="cj-rs-stats">' +
                '<div class="cj-rs-stat"><div class="cj-rs-stat-lbl">تعداد سوالات</div><div class="cj-rs-stat-val">' + total + '</div></div>' +
                '<div class="cj-rs-stat"><div class="cj-rs-stat-lbl">پاسخ صحیح</div><div class="cj-rs-stat-val" style="color:#10b981;">' + score + '</div></div>' +
                '<div class="cj-rs-stat"><div class="cj-rs-stat-lbl">پاسخ نادرست</div><div class="cj-rs-stat-val" style="color:#f43f5e;">' + (total - score) + '</div></div>' +
            '</div>' +
            '<div class="cj-rs-actions">' +
                '<button class="cj-btn cj-btn-primary" id="restart-conjugation-btn"><i class="fas fa-redo-alt"></i> تمرین مجدد</button>' +
                '<button class="cj-btn cj-btn-outline" id="back-conjugation-btn"><i class="fas fa-arrow-right"></i> بازگشت</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.getElementById('restart-conjugation-btn').onclick = () => this.startConjugationPractice();
    document.getElementById('back-conjugation-btn').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
};




/* ============================================================
   تمرین جای خالی (Fill in the Blanks) — بازسازی کامل
   ============================================================ */
GermanDictionary.prototype._fbEsc = function(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
};

GermanDictionary.prototype._fbInjectStyles = function() {
    if (document.getElementById('fb-pro-styles')) return;
    const style = document.createElement('style');
    style.id = 'fb-pro-styles';
    style.textContent = `
      :root{
        --fb-bg:#f7f8fa;--fb-card:#fff;--fb-text:#1a1a2e;--fb-muted:#64748b;
        --fb-border:#e2e8f0;--fb-primary:#8b5cf6;
      }
      body.dark-mode{
        --fb-bg:#0f1115;--fb-card:#1a1d24;--fb-text:#e4e6eb;--fb-muted:#9ca3af;
        --fb-border:#2a2e38;
      }

      .fb-root{font-family:'Vazirmatn',Tahoma,sans-serif;direction:rtl;color:var(--fb-text);max-width:760px;margin:0 auto;padding:8px 0;}
      .fb-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap;}
      .fb-head h2{font-size:18px;font-weight:800;margin:0;display:flex;align-items:center;gap:8px;}
      .fb-head h2 i{color:var(--fb-primary);}
      .fb-badge{font-size:11px;font-weight:700;padding:5px 12px;border-radius:999px;color:#fff;}
      .fb-badges{display:flex;gap:6px;flex-wrap:wrap;}

      .fb-card{background:var(--fb-card);border:1.5px solid var(--fb-border);border-radius:20px;padding:24px;
        box-shadow:0 8px 24px rgba(0,0,0,.06);position:relative;overflow:hidden;}
      body.dark-mode .fb-card{box-shadow:0 8px 24px rgba(0,0,0,.3);}
      .fb-card::before{content:"";position:absolute;top:-30px;left:-30px;width:140px;height:140px;border-radius:50%;
        background:radial-gradient(circle,rgba(139,92,246,.1) 0%,transparent 70%);pointer-events:none;}

      .fb-question{background:linear-gradient(135deg,rgba(139,92,246,.08),rgba(20,184,166,.08));
        border:1px solid rgba(139,92,246,.15);border-radius:16px;padding:20px;margin-bottom:20px;
        text-align:center;font-size:16px;font-weight:600;color:var(--fb-text);position:relative;z-index:1;}
      .fb-question strong{color:#8b5cf6;font-size:18px;}

      .fb-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px;position:relative;z-index:1;}
      .fb-option{font-family:'Vazirmatn',Tahoma,sans-serif;font-size:14px;font-weight:700;padding:14px 18px;
        border-radius:14px;border:2px solid var(--fb-border);background:var(--fb-bg);color:var(--fb-text);
        cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;
        text-align:center;direction:ltr;}
      .fb-option:hover:not(.disabled){border-color:var(--fb-primary);transform:translateY(-2px);
        box-shadow:0 4px 12px rgba(139,92,246,.15);}
      .fb-option:active:not(.disabled){transform:scale(.97);}
      .fb-option.disabled{cursor:not-allowed;opacity:.7;}
      .fb-option.correct{border-color:#10b981;background:rgba(16,185,129,.12);color:#059669;}
      .fb-option.incorrect{border-color:#f43f5e;background:rgba(244,63,94,.12);color:#e11d48;}
      body.dark-mode .fb-option.correct{background:rgba(16,185,129,.18);color:#34d399;}
      body.dark-mode .fb-option.incorrect{background:rgba(244,63,94,.18);color:#fb7185;}

      .fb-feedback{padding:14px;border-radius:12px;font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px;margin-top:12px;position:relative;z-index:1;}
      .fb-feedback.correct{background:rgba(16,185,129,.1);color:#059669;border:1px solid rgba(16,185,129,.2);}
      .fb-feedback.incorrect{background:rgba(244,63,94,.1);color:#e11d48;border:1px solid rgba(244,63,94,.2);}
      body.dark-mode .fb-feedback.correct{background:rgba(16,185,129,.15);color:#34d399;}
      body.dark-mode .fb-feedback.incorrect{background:rgba(244,63,94,.15);color:#fb7185;}

      .fb-progress-wrap{margin-top:18px;display:flex;flex-direction:column;gap:6px;position:relative;z-index:1;}
      .fb-progress-bar{height:8px;background:var(--fb-bg);border-radius:999px;overflow:hidden;border:1px solid var(--fb-border);}
      .fb-progress-fill{height:100%;background:linear-gradient(90deg,#8b5cf6,#14b8a6);transition:width .3s ease;border-radius:999px;}
      .fb-progress-info{display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:var(--fb-muted);}
      .fb-progress-stats{display:flex;gap:8px;}
      .fb-progress-stat{display:flex;align-items:center;gap:4px;}
      .fb-progress-dot{width:8px;height:8px;border-radius:50%;}
      .fb-progress-dot.correct{background:#10b981;}
      .fb-progress-dot.incorrect{background:#f43f5e;}

      .fb-rs-card{background:var(--fb-card);border:1.5px solid var(--fb-border);border-radius:20px;padding:28px;
        box-shadow:0 8px 24px rgba(0,0,0,.06);text-align:center;}
      body.dark-mode .fb-rs-card{box-shadow:0 8px 24px rgba(0,0,0,.3);}
      .fb-rs-title{font-size:20px;font-weight:800;margin:0 0 20px;display:flex;align-items:center;justify-content:center;gap:8px;}
      .fb-rs-title i{color:#f59e0b;}
      .fb-rs-circle{width:140px;height:140px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;}
      .fb-rs-circle-inner{width:110px;height:110px;border-radius:50%;background:var(--fb-card);display:flex;align-items:center;justify-content:center;}
      .fb-rs-circle-num{font-size:32px;font-weight:800;color:var(--fb-text);}
      .fb-rs-stats{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;}
      .fb-rs-stat{background:var(--fb-bg);border:1px solid var(--fb-border);border-radius:12px;padding:12px 18px;min-width:110px;}
      .fb-rs-stat-lbl{font-size:11px;font-weight:600;color:var(--fb-muted);margin-bottom:4px;}
      .fb-rs-stat-val{font-size:20px;font-weight:800;color:var(--fb-text);}
      .fb-rs-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
      .fb-btn{font-family:inherit;font-size:13px;font-weight:700;padding:11px 18px;border-radius:11px;border:none;
        cursor:pointer;color:#fff;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;gap:6px;}
      .fb-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
      .fb-btn-primary{background:linear-gradient(135deg,#8b5cf6,#6d28d9);}
      .fb-btn-outline{background:transparent;color:var(--fb-text);border:1.5px solid var(--fb-border);}

      @media(max-width:768px){
        .fb-card,.fb-rs-card{padding:18px;}
        .fb-question{font-size:14px;padding:16px;}
        .fb-question strong{font-size:16px;}
        .fb-option{font-size:13px;padding:12px 14px;}
        .fb-rs-circle{width:120px;height:120px;}
        .fb-rs-circle-inner{width:96px;height:96px;}
        .fb-rs-circle-num{font-size:26px;}
      }
      @media(max-width:480px){
        .fb-root{padding:4px 0;}
        .fb-card{padding:16px 14px;}
        .fb-options{grid-template-columns:1fr 1fr;gap:8px;}
        .fb-option{font-size:12px;padding:10px 8px;}
        .fb-rs-stats{flex-direction:column;align-items:stretch;}
        .fb-rs-stat{min-width:0;}
        .fb-rs-actions{flex-direction:column;}
        .fb-btn{width:100%;}
      }
    `;
    document.head.appendChild(style);
};

GermanDictionary.prototype.startFillBlanksPractice = async function() {
    const wordsToPractice = await this.getFilteredWordsForPractice();

    if (wordsToPractice.length < 4) {
        this.showToast('حداقل به ۴ لغت برای این تمرین نیاز دارید', 'warning');
        return;
    }

    let selectedWords = [...wordsToPractice];

    const activeCount = document.querySelector('.count-option.active');
    let questionCount = activeCount ? (activeCount.dataset.count === 'all' ? selectedWords.length : parseInt(activeCount.dataset.count)) : 10;

    if (selectedWords.length < questionCount) {
        questionCount = selectedWords.length;
    }

    const activeOrder = document.querySelector('.order-option.active');
    const order = activeOrder ? activeOrder.dataset.order : 'random';

    if (order === 'sequential') {
        selectedWords = selectedWords.sort((a, b) => a.german.localeCompare(b.german, 'de')).slice(0, questionCount);
    } else if (order === 'hardest') {
        const history = await this.getAllPracticeHistory();
        const errorCounts = {};
        history.forEach(record => {
            if (!record.correct) {
                errorCounts[record.wordId] = (errorCounts[record.wordId] || 0) + 1;
            }
        });
        selectedWords = selectedWords.sort((a, b) => (errorCounts[b.id] || 0) - (errorCounts[a.id] || 0)).slice(0, questionCount);
    } else {
        selectedWords = this.shuffleArray([...selectedWords]).slice(0, questionCount);
    }

    this.fillBlanksSession = {
        words: selectedWords,
        currentIndex: 0,
        score: 0,
        mistakes: 0
    };

    this.showFillBlanksQuestion();
    this.showSection('practice-section');
};

GermanDictionary.prototype.showFillBlanksQuestion = function() {
    this._fbInjectStyles();
    if (this.fillBlanksSession.currentIndex >= this.fillBlanksSession.words.length) {
        this.showFillBlanksResults();
        return;
    }

    const word = this.fillBlanksSession.words[this.fillBlanksSession.currentIndex];
    const current = this.fillBlanksSession.currentIndex + 1;
    const total = this.fillBlanksSession.words.length;

    // انتخاب تصادفی نوع سوال
    const qType = Math.random() > 0.5 ? 'meaning_to_german' : 'german_to_meaning';

    // ساخت گزینه‌های اشتباه از لغات دیگه
    const allOtherWords = this.fillBlanksSession.words.filter(w => w.id !== word.id);
    const shuffledOthers = this.shuffleArray([...allOtherWords]);

    let questionHtml = '';
    let correctAnswer = '';
    let options = [];

    if (qType === 'meaning_to_german') {
        questionHtml = 'معنی فارسی: <strong>' + this._fbEsc(word.persian) + '</strong><br><span style="font-size:13px;font-weight:500;color:var(--fb-muted);">معادل آلمانی کدام است؟</span>';
        correctAnswer = word.german;

        const wrongOptions = [];
        for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
            const otherWord = shuffledOthers[i];
            if (otherWord && otherWord.german && otherWord.german !== correctAnswer) {
                wrongOptions.push(otherWord.german);
            }
        }
        while (wrongOptions.length < 3) {
            wrongOptions.push('—');
        }
        options = [correctAnswer, ...wrongOptions];
    } else {
        questionHtml = 'لغت آلمانی: <strong>' + this._fbEsc(word.german) + '</strong><br><span style="font-size:13px;font-weight:500;color:var(--fb-muted);">معنی فارسی کدام است؟</span>';
        correctAnswer = word.persian;

        const wrongOptions = [];
        for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
            const otherWord = shuffledOthers[i];
            if (otherWord && otherWord.persian && otherWord.persian !== correctAnswer) {
                wrongOptions.push(otherWord.persian);
            }
        }
        while (wrongOptions.length < 3) {
            wrongOptions.push('—');
        }
        options = [correctAnswer, ...wrongOptions];
    }

    // شافل کردن گزینه‌ها
    options = this.shuffleArray(options);

    // ذخیره سوال فعلی
    this.currentFillBlankQuestion = {
        word: word,
        type: qType,
        correctAnswer: correctAnswer,
        options: options
    };

    const progress = (current - 1) / total * 100;
    const typeName = qType === 'meaning_to_german' ? 'معنی → آلمانی' : 'آلمانی → معنی';

    const container = document.getElementById('practice-section');
    if (!container) return;

    let optionsHtml = '';
    options.forEach((opt, idx) => {
        optionsHtml += '<button class="fb-option" data-answer="' + this._fbEsc(opt) + '" data-index="' + idx + '">' + this._fbEsc(opt) + '</button>';
    });

    container.innerHTML = '<div class="fb-root">' +
        '<div class="fb-head">' +
            '<h2><i class="fas fa-puzzle-piece"></i> تکمیل جای خالی</h2>' +
            '<div class="fb-badges">' +
                '<span class="fb-badge" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);">' + typeName + '</span>' +
                '<span class="fb-badge" style="background:linear-gradient(135deg,#f59e0b,#d97706);">' + current + ' / ' + total + '</span>' +
            '</div>' +
        '</div>' +
        '<div class="fb-card">' +
            '<div class="fb-question">' + questionHtml + '</div>' +
            '<div class="fb-options">' + optionsHtml + '</div>' +
            '<div id="blank-feedback"></div>' +
            '<div class="fb-progress-wrap">' +
                '<div class="fb-progress-bar"><div class="fb-progress-fill" style="width:' + progress + '%"></div></div>' +
                '<div class="fb-progress-info">' +
                    '<span>' + current + ' / ' + total + '</span>' +
                    '<div class="fb-progress-stats">' +
                        '<div class="fb-progress-stat"><div class="fb-progress-dot correct"></div>' + this.fillBlanksSession.score + '</div>' +
                        '<div class="fb-progress-stat"><div class="fb-progress-dot incorrect"></div>' + this.fillBlanksSession.mistakes + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';

    // غیرفعال کردن قفل پاسخ
    this.fillBlankAnswerLocked = false;

    // رویداد دکمه‌های گزینه
    const self = this;
    document.querySelectorAll('.fb-option').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (self.fillBlankAnswerLocked) return;
            self.fillBlankAnswerLocked = true;
            self.checkBlankAnswer(this.dataset.answer, this);
        });
    });
};

GermanDictionary.prototype.checkBlankAnswer = async function(selectedAnswer, clickedBtn) {
    const q = this.currentFillBlankQuestion;
    const isCorrect = selectedAnswer === q.correctAnswer;

    // غیرفعال کردن همه دکمه‌ها
    document.querySelectorAll('.fb-option').forEach(btn => {
        btn.classList.add('disabled');
        if (btn.dataset.answer === q.correctAnswer) {
            btn.classList.add('correct');
        }
    });

    if (!isCorrect) {
        // علامت‌گذاری دکمه اشتباه
        if (clickedBtn) clickedBtn.classList.add('incorrect');
    }

    const feedbackDiv = document.getElementById('blank-feedback');
    if (isCorrect) {
        this.fillBlanksSession.score++;
        feedbackDiv.innerHTML = '<div class="fb-feedback correct"><i class="fas fa-check-circle"></i> پاسخ صحیح! آفرین!</div>';
    } else {
        this.fillBlanksSession.mistakes++;
        feedbackDiv.innerHTML = '<div class="fb-feedback incorrect"><i class="fas fa-times-circle"></i> پاسخ صحیح: <strong>' + this._fbEsc(q.correctAnswer) + '</strong></div>';
    }

    await this.recordPractice(q.word.id, isCorrect);

    const self = this;
    setTimeout(function() {
        self.fillBlanksSession.currentIndex++;
        self.showFillBlanksQuestion();
    }, 1800);
};

GermanDictionary.prototype.showFillBlanksResults = function() {
    this._fbInjectStyles();
    const total = this.fillBlanksSession.words.length;
    const score = this.fillBlanksSession.score;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    const container = document.getElementById('practice-section');
    if (!container) return;

    container.innerHTML = '<div class="fb-root">' +
        '<div class="fb-rs-card">' +
            '<div class="fb-rs-title"><i class="fas fa-puzzle-piece"></i> نتایج تکمیل جای خالی</div>' +
            '<div class="fb-rs-circle" style="background: conic-gradient(#8b5cf6 0% ' + accuracy + '%, var(--fb-bg) ' + accuracy + '% 100%);">' +
                '<div class="fb-rs-circle-inner"><span class="fb-rs-circle-num">' + accuracy + '%</span></div>' +
            '</div>' +
            '<div class="fb-rs-stats">' +
                '<div class="fb-rs-stat"><div class="fb-rs-stat-lbl">تعداد سوالات</div><div class="fb-rs-stat-val">' + total + '</div></div>' +
                '<div class="fb-rs-stat"><div class="fb-rs-stat-lbl">پاسخ صحیح</div><div class="fb-rs-stat-val" style="color:#10b981;">' + score + '</div></div>' +
                '<div class="fb-rs-stat"><div class="fb-rs-stat-lbl">پاسخ نادرست</div><div class="fb-rs-stat-val" style="color:#f43f5e;">' + (total - score) + '</div></div>' +
            '</div>' +
            '<div class="fb-rs-actions">' +
                '<button class="fb-btn fb-btn-primary" id="restart-fill-blanks-btn"><i class="fas fa-redo-alt"></i> تمرین مجدد</button>' +
                '<button class="fb-btn fb-btn-outline" id="back-fill-blanks-btn"><i class="fas fa-arrow-right"></i> بازگشت</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.getElementById('restart-fill-blanks-btn').onclick = () => this.startFillBlanksPractice();
    document.getElementById('back-fill-blanks-btn').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
};
