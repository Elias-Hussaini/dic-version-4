/* dict-word-details.js — Word Details & Navigation (lines 2147-2684) */

GermanDictionary.prototype.renderWordDetails = async function(word) {
    if (!word) return;
    
    this.currentWord = word;
    const examples = await this.getExamplesForWord(word.id);
    const practiceHistory = await this.getPracticeHistory(word.id);
    const successRate = practiceHistory.length > 0 
        ? Math.round((practiceHistory.filter(h => h.correct).length / practiceHistory.length) * 100) : 0;
    
    // ========== به‌روزرسانی لیست فعلی برای ناوبری ==========
    await this.getCurrentWordList();
    const currentIndex = this.currentWordList.findIndex(w => w.id === word.id);
    const totalInList = this.currentWordList.length;
    const positionText = (currentIndex !== -1 && totalInList > 0) ? `${currentIndex + 1}/${totalInList}` : '';
    
    const container = document.getElementById('search-results-container');
    if (!container) return;
    
container.innerHTML = `
    <div class="detail-word-card">
        <!-- نوار بالایی - دکمه برگشت و شماره کاملاً کنار هم -->
        <div class="detail-top-bar" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <button id="backFromDetailBtn" class="back-btn-modern" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; margin: 0;">
                    <i class="fas fa-arrow-right"></i> بازگشت به لیست
                </button>
                ${positionText ? `
                <span class="detail-position-badge" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 6px 14px; border-radius: 30px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                    <i class="fas fa-list"></i> ${positionText}
                </span>
                ` : ''}
            </div>
            <div></div>
        </div>

        <!-- دکمه‌های ناوبری - قبلی < سمت چپ، بعدی > سمت راست -->
        <div class="detail-navigation-buttons" style="display: flex; justify-content: flex-start; gap: 12px; margin-bottom: 20px;">
            <button id="prevWordBtn" class="nav-arrow-btn" title="قبلی" style="width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                <i class="fas fa-chevron-right"></i>
            </button>
            <button id="nextWordBtn" class="nav-arrow-btn" title="بعدی" style="width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                <i class="fas fa-chevron-left"></i>
            </button>
        </div>
        
        <!-- هدر اصلی -->
        <div class="detail-header-modern">
            <div class="word-info-modern">
                <h1 class="word-title-modern">${this.escapeHtml(word.german)}</h1>
                <div class="word-badges-modern">
                    ${word.gender ? `<span class="badge-gender ${word.gender}">${this.getGenderLabel(word.gender)}</span>` : ''}
                    ${word.type ? `<span class="badge-type ${word.type}">${this.getTypeLabel(word.type)}</span>` : ''}
                    ${word.plural ? `<span class="badge-plural"><i class="fas fa-copy"></i> ${this.escapeHtml(word.plural)}</span>` : ''}
                </div>
            </div>
            <div class="word-actions-modern">
                <button class="action-icon favorite ${this.favorites.has(word.id) ? 'active' : ''}" data-id="${word.id}" title="علاقه‌مندی">
                    <i class="fas fa-star"></i>
                </button>
                <button class="action-icon speak" data-word="${word.german}" title="تلفظ">
                    <i class="fas fa-volume-up"></i>
                </button>
                <button class="action-icon edit" data-id="${word.id}" title="ویرایش">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="action-icon delete" data-id="${word.id}" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        
        <!-- معنی -->
        <div class="meaning-card-modern">
            <i class="fas fa-language"></i>
            <p>${this.escapeHtml(word.persian)}</p>
        </div>
        
        ${word.pronunciation ? `
        <div class="pronunciation-modern">
            <i class="fas fa-microphone-alt"></i>
            <span>تلفظ: ${this.escapeHtml(word.pronunciation)}</span>
            <button class="listen-btn" onclick="dictionaryApp.speakText('${this.escapeHtml(word.german)}', 'de-DE')">
                <i class="fas fa-play"></i> گوش کن
            </button>
        </div>
        ` : ''}
        
        ${word.tags && word.tags.length > 0 ? `
        <div class="tags-modern">
            ${word.tags.map(tag => `<span class="tag-modern">#${this.escapeHtml(tag)}</span>`).join('')}
        </div>
        ` : ''}
        
        <div class="details-grid-modern">
            ${this.renderNounDetails(word)}
            ${this.renderVerbDetails(word)}
            ${this.renderAdjectiveDetails(word)}
            ${this.renderPrepositionDetails(word)}
        </div>
        
        <div class="tabs-modern">
            <button class="tab-btn active" data-tab="examples">📚 مثال‌ها (${examples.length})</button>
            <button class="tab-btn" data-tab="practice">🎯 تمرین (${practiceHistory.length})</button>
            <button class="tab-btn" data-tab="stats">📊 آمار (${successRate}%)</button>
        </div>
        
        <div class="tab-content-modern active" id="tab-examples">
            <div class="examples-list-modern">
                ${examples.length > 0 ? examples.map(ex => `
                    <div class="example-card-modern" data-example-id="${ex.id}">
                        <div class="example-text-modern">${this.escapeHtml(ex.german)}</div>
                        <div class="example-trans-modern">${this.escapeHtml(ex.persian)}</div>
                        <div class="example-actions">
                            <button class="example-speak" onclick="dictionaryApp.speakText('${this.escapeHtml(ex.german)}', 'de-DE')">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            <button class="example-delete" data-id="${ex.id}" title="حذف مثال">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                `).join('') : '<div class="empty-state-modern">📝 هنوز مثالی ثبت نشده است</div>'}
            </div>
            <div class="add-example-modern">
                <h4><i class="fas fa-plus-circle"></i> افزودن مثال جدید</h4>
                <div class="example-input-group">
                    <textarea id="new-example-german" placeholder="مثال آلمانی..."></textarea>
                    <textarea id="new-example-persian" placeholder="ترجمه فارسی..."></textarea>
                    <button id="add-example-btn" class="btn-add-example">➕ افزودن</button>
                </div>
            </div>
        </div>
        
        <div class="notes-section-modern">
            <div class="notes-header">
                <i class="fas fa-sticky-note"></i>
                <span>توضیحات</span>
            </div>
            <div class="notes-content">${word.notes ? this.escapeHtml(word.notes).replace(/\n/g, '<br>') : '<span style="color: var(--gray-400);">📝 توضیحی ثبت نشده است</span>'}</div>
        </div>
        
        <div class="tab-content-modern" id="tab-practice">
            <div class="practice-stats-modern">
                <div class="practice-circle-modern">
                    <svg viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" stroke-width="3"/>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="${successRate}, 100"/>
                    </svg>
                    <div class="practice-percent-modern">${successRate}%</div>
                </div>
                <div class="practice-info-modern">
                    <div class="practice-stat"><i class="fas fa-brain"></i> تعداد تمرین: ${practiceHistory.length}</div>
                    <div class="practice-stat"><i class="fas fa-check-circle"></i> پاسخ صحیح: ${practiceHistory.filter(h => h.correct).length}</div>
                    <div class="practice-stat"><i class="fas fa-times-circle"></i> پاسخ نادرست: ${practiceHistory.filter(h => !h.correct).length}</div>
                </div>
            </div>
            <button id="practice-now-btn" class="practice-now-btn"><i class="fas fa-play"></i> شروع تمرین این لغت</button>
        </div>
        
        <div class="tab-content-modern" id="tab-stats">
            <div class="stats-grid-modern">
                <div class="stat-card-modern">
                    <i class="fas fa-calendar-alt"></i>
                    <div class="stat-label">تاریخ ثبت</div>
                    <div class="stat-value">${new Date(word.createdAt).toLocaleDateString('fa-IR')}</div>
                </div>
                <div class="stat-card-modern">
                    <i class="fas fa-star"></i>
                    <div class="stat-label">امتیاز SRS</div>
                    <div class="stat-value">${this.srsData[word.id]?.level || 0}/5</div>
                </div>
                <div class="stat-card-modern">
                    <i class="fas fa-chart-line"></i>
                    <div class="stat-label">موفقیت کلی</div>
                    <div class="stat-value">${successRate}%</div>
                </div>
            </div>
        </div>
    </div>
`;
    
    this.setupDetailEventListeners(word);
    this.setupDetailNavigation();
};

GermanDictionary.prototype.renderNounDetails = function(word) {
    if (word.type !== 'noun') return '';
    return `
        <div class="detail-card-modern">
            <div class="detail-icon"><i class="fas fa-venus-mars"></i></div>
            <div class="detail-content">
                <div class="detail-label">جنسیت</div>
                <div class="detail-value">${word.gender ? this.getGenderLabel(word.gender) : 'نامشخص'}</div>
            </div>
            ${word.plural ? `
            <div class="detail-content">
                <div class="detail-label">جمع (Plural)</div>
                <div class="detail-value">${this.escapeHtml(word.plural)}</div>
            </div>
            ` : ''}
        </div>
    `;
};

GermanDictionary.prototype.renderVerbDetails = function(word) {
    if (word.type !== 'verb' || !word.verbForms) return '';
    const vf = word.verbForms;
    return `
        <div class="detail-card-modern wide">
            <div class="detail-icon"><i class="fas fa-table"></i></div>
            <div class="detail-content">
                <div class="detail-label">فعل کمکی</div>
                <div class="detail-value">${vf.helper || 'haben'} ${vf.separable ? '• جداشدنی ✅' : ''}</div>
            </div>
            <div class="conjugation-grid-modern">
                <div class="conj-item"><span class="conj-label">Präsens</span><span class="conj-value">${vf.present || '—'}</span></div>
                <div class="conj-item"><span class="conj-label">Präteritum</span><span class="conj-value">${vf.past || '—'}</span></div>
                <div class="conj-item"><span class="conj-label">Perfekt</span><span class="conj-value">${vf.perfect || '—'}</span></div>
                ${vf.future ? `<div class="conj-item"><span class="conj-label">Futur I</span><span class="conj-value">${this.escapeHtml(vf.future)}</span></div>` : ''}
                ${vf.konjunktiv ? `<div class="conj-item"><span class="conj-label">Konjunktiv II</span><span class="conj-value">${this.escapeHtml(vf.konjunktiv)}</span></div>` : ''}
            </div>
        </div>
    `;
};

GermanDictionary.prototype.renderAdjectiveDetails = function(word) {
    if (word.type !== 'adjective') return '';
    return `
        <div class="detail-card-modern">
            <div class="detail-icon"><i class="fas fa-chart-line"></i></div>
            ${word.comparative ? `
            <div class="detail-content">
                <div class="detail-label">Komparativ</div>
                <div class="detail-value">${this.escapeHtml(word.comparative)}</div>
            </div>
            ` : ''}
            ${word.superlative ? `
            <div class="detail-content">
                <div class="detail-label">Superlativ</div>
                <div class="detail-value">${this.escapeHtml(word.superlative)}</div>
            </div>
            ` : ''}
            ${word.antonym ? `
            <div class="detail-content">
                <div class="detail-label">متضاد</div>
                <div class="detail-value">${this.escapeHtml(word.antonym)}</div>
            </div>
            ` : ''}
        </div>
    `;
};

GermanDictionary.prototype.renderPrepositionDetails = function(word) {
    if (word.type !== 'preposition') return '';
    return `
        <div class="detail-card-modern">
            <div class="detail-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="detail-content">
                <div class="detail-label">حالت (Kasus)</div>
                <div class="detail-value">${word.case || 'نامشخص'}</div>
            </div>
            ${word.meanings ? `
            <div class="detail-content">
                <div class="detail-label">معانی مختلف</div>
                <div class="detail-value">${this.escapeHtml(word.meanings)}</div>
            </div>
            ` : ''}
        </div>
    `;
};

GermanDictionary.prototype.getCurrentWordList = async function() {
    const allWords = await this.getAllWords();
    
    // 1. فیلتر فعال از دکمه‌های بخش word-list
    const activeFilterBtn = document.querySelector('#word-list-section .filter-btn.active');
    const filter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
    
    let filtered = [...allWords];
    
    // ========== اولویت با فیلتر پوشه (Tag) ==========
    if (this.currentTagFilter && this.currentTagFilter !== 'all') {
        const tagWords = await this.getWordsByTag(this.currentTagFilter);
        const tagWordIds = new Set(tagWords.map(w => w.id));
        filtered = filtered.filter(w => tagWordIds.has(w.id));
    } else {
        // اگر فیلتر پوشه فعال نیست، از فیلترهای معمولی استفاده کن
        switch(filter) {
            case 'favorites':
                filtered = filtered.filter(w => this.favorites.has(w.id));
                break;
            case 'nouns':
                filtered = filtered.filter(w => w.type === 'noun');
                break;
            case 'verbs':
                filtered = filtered.filter(w => w.type === 'verb');
                break;
            case 'adjectives':
                filtered = filtered.filter(w => w.type === 'adjective');
                break;
            case 'adverbs':
                filtered = filtered.filter(w => w.type === 'adverb');
                break;
            default:
                // بدون فیلتر اضافه
                break;
        }
    }
    
    // ========== مهم: دریافت sortType از localStorage و اعمال ==========
    const sortType = localStorage.getItem('wordListSort') || 'alphabetical';
    this.applySortToFilteredWords(filtered, sortType);
    
    // ذخیره لیست فعلی برای ناوبری
    this.currentWordList = [...filtered];
    
    return filtered;
};

GermanDictionary.prototype.goToPrevWord = async function() {
    if (!this.currentWordList || this.currentWordList.length === 0) {
        await this.getCurrentWordList();
    }
    
    if (!this.currentWordList || this.currentWordList.length === 0) return;
    
    const currentIndex = this.currentWordList.findIndex(w => w.id === this.currentWord.id);
    
    if (currentIndex > 0) {
        const prevWord = this.currentWordList[currentIndex - 1];
        await this.renderWordDetails(prevWord);
        this.lastWordId = prevWord.id;
    } else {
        // نمایش پیام در اولین لغت
        const isGerman = LanguageSystem.isGerman();
        this.showToast(isGerman ? '📖 اولین لغت در این لیست هستید' : '📖 You are at the first word in this list', 'info');
        if (navigator.vibrate) navigator.vibrate(50);
    }
};

GermanDictionary.prototype.goToNextWord = async function() {
    if (!this.currentWordList || this.currentWordList.length === 0) {
        await this.getCurrentWordList();
    }
    
    if (!this.currentWordList || this.currentWordList.length === 0) return;
    
    const currentIndex = this.currentWordList.findIndex(w => w.id === this.currentWord.id);
    
    if (currentIndex < this.currentWordList.length - 1) {
        const nextWord = this.currentWordList[currentIndex + 1];
        await this.renderWordDetails(nextWord);
        this.lastWordId = nextWord.id;
    } else {
        // نمایش پیام در آخرین لغت
        const isGerman = LanguageSystem.isGerman();
        this.showToast(isGerman ? '🏁 آخرین لغت در این لیست هستید' : '🏁 You are at the last word in this list', 'info');
        if (navigator.vibrate) navigator.vibrate(50);
    }
};

GermanDictionary.prototype.setupDetailNavigation = function() {
    const prevBtn = document.getElementById('prevWordBtn');
    const nextBtn = document.getElementById('nextWordBtn');
    
    if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        
        newPrevBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.goToPrevWord();
        };
    }
    
    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        
        newNextBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.goToNextWord();
        };
    }
    
    // ========== اصلاح arrow key: چپ ← قبلی، راست ← بعدی ==========
    const keyHandler = (e) => {
        const detailCard = document.querySelector('.detail-word-card');
        if (!detailCard) return;
        
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.goToPrevWord();  // چپ ← قبلی
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.goToNextWord();  // راست ← بعدی
        }
    };
    
    if (this.detailKeyHandler) {
        document.removeEventListener('keydown', this.detailKeyHandler);
    }
    this.detailKeyHandler = keyHandler;
    document.addEventListener('keydown', this.detailKeyHandler);
};

GermanDictionary.prototype.setupDetailEventListeners = function(word) {
   // در تابع renderWordDetails، دکمه بازگشت را اینطور اصلاح کن:
const backBtn = document.getElementById('backFromDetailBtn');
if (backBtn) {
    backBtn.onclick = () => {
        // ذخیره ID لغت فعلی و موقعیت اسکرول
        const wordId = word.id;
        localStorage.setItem('returnToWordId', wordId);
        
        this.showSection('word-list-section');
        this.renderWordList();
        
        // بعد از رندر، به همان لغت اسکرول کن
        setTimeout(() => {
            const targetWordId = localStorage.getItem('returnToWordId');
            if (targetWordId) {
                const targetElement = document.querySelector(`.word-list-item[data-id="${targetWordId}"]`);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // هایلایت کردن موقت
                    targetElement.style.transition = 'all 0.3s ease';
                    targetElement.style.background = 'var(--primary-light)';
                    targetElement.style.border = '2px solid var(--primary)';
                    setTimeout(() => {
                        targetElement.style.background = '';
                        targetElement.style.border = '';
                    }, 1500);
                }
                localStorage.removeItem('returnToWordId');
            }
        }, 200);
    };
}
    
    // علاقه‌مندی
    const favBtn = document.querySelector('.action-icon.favorite');
    if (favBtn) {
        favBtn.onclick = async () => {
            await this.toggleFavorite(word.id);
            favBtn.classList.toggle('active');
            this.updateFavoritesCount();
        };
    }
    
    // تلفظ
    const speakBtn = document.querySelector('.action-icon.speak');
    if (speakBtn) speakBtn.onclick = () => this.speakText(word.german, 'de-DE');
    
    // ویرایش
    const editBtn = document.querySelector('.action-icon.edit');
    if (editBtn) editBtn.onclick = () => this.showEditWordForm(word);
    
    // حذف لغت
    const deleteBtn = document.querySelector('.action-icon.delete');
    if (deleteBtn) {
        deleteBtn.onclick = async () => {
            if (confirm(`🗑️ آیا از حذف "${word.german}" مطمئن هستید؟`)) {
                await this.deleteWord(word.id);
                this.showSection('word-list-section');
                this.renderWordList();
            }
        };
    }
    
    // تب‌ها
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content-modern').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        };
    });
    
    // ========== افزودن مثال جدید ==========
    const addExampleBtn = document.getElementById('add-example-btn');
    if (addExampleBtn) {
        addExampleBtn.onclick = async () => {
            const german = document.getElementById('new-example-german')?.value.trim();
            const persian = document.getElementById('new-example-persian')?.value.trim();
            if (german && persian) {
                await this.addExample(word.id, { german, persian });
                this.renderWordDetails(word);
                this.showToast('✅ مثال اضافه شد', 'success');
            } else {
                this.showToast('❌ لطفاً هر دو فیلد را پر کنید', 'error');
            }
        };
    }
    
    // ========== حذف مثال (سطل اشغال) ==========
    // این قسمت را بعد از رندر شدن مثال‌ها صدا بزن
    setTimeout(() => {
        document.querySelectorAll('.example-delete').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const exampleId = parseInt(btn.dataset.id);
                if (confirm('🗑️ آیا از حذف این مثال مطمئن هستید؟')) {
                    await this.deleteExample(exampleId);
                    this.renderWordDetails(word);
                    this.showToast('✅ مثال حذف شد', 'success');
                }
            };
        });
    }, 100);
    
    // تمرین
    const practiceBtn = document.getElementById('practice-now-btn');
    if (practiceBtn) {
        practiceBtn.onclick = () => {
            this.startPracticeSession([word.id]);
            this.showSection('flashcards-section');
        };
    }
    this.setupDetailNavigation();
};

GermanDictionary.prototype.deleteExample = async function(exampleId) {
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['examples'], 'readwrite');
        const store = transaction.objectStore('examples');
        const request = store.delete(exampleId);

        request.onsuccess = () => {
            console.log('✅ مثال حذف شد');
            resolve();
        };

        request.onerror = (event) => {
            console.error('❌ خطا در حذف مثال:', event.target.error);
            reject(event.target.error);
        };
    });
};

/* ================================================================
   سیستم کشیدن (Swipe) برای موبایل
   ----------------------------------------------------------------
   • فقط در موبایل فعال می‌شود (تشخیص با ontouchstart + عرض ≤ 768px)
   • در جزئیات لغت: راست→چپ = بعدی، چپ→راست = قبلی
   • در لیست لغات (با صفحه‌بندی): راست→چپ = صفحه بعدی، چپ→راست = قبلی
   • حرکات عمودی (اسکرول) نادیده گرفته می‌شوند
   • لمس روی دکمه‌ها/لینک‌ها/اینپوت‌ها نادیده گرفته می‌شود
   • از overlay و feedback بصری برای تجربه بهتر استفاده می‌کند
   ================================================================ */

GermanDictionary.prototype._isMobileSwipeDevice = function() {
    // تشخیص موبایل: هم touch پشتیبانی شود هم عرض کوچک
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isSmall = window.innerWidth <= 768;
    return hasTouch && isSmall;
};

/* ----- راه‌اندازی سیستم کشیدن ----- */
GermanDictionary.prototype._setupSwipeGestures = function() {
    // فقط یک بار راه‌اندازی شود
    if (this._swipeInitialized) return;
    this._swipeInitialized = true;

    const self = this;

    // تزریق استایل overlay (یک بار)
    self._injectSwipeStyles();

    // متغیرهای وضعیت tracking
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isTracking = false;
    let activeOverlay = null;

    // آستانه‌ها
    const SWIPE_THRESHOLD = 60;      // حداقل فاصله افقی برای تشخیص swipe
    const VERTICAL_RATIO = 0.6;      // اگر حرکت عمودی بیشتر از این نسبت بود، swipe نیست
    const EDGE_IGNORE = 10;          // نادیده گرفتن لمس در لبه‌ها (برای جلوگیری از تداخل با gesture های سیستم)

    function shouldIgnoreTarget(target) {
        if (!target) return true;
        // نادیده گرفتن دکمه‌ها، لینک‌ها، اینپوت‌ها، textarea، و عناصر قابل کلیک
        const ignoreTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL'];
        if (ignoreTags.includes(target.tagName)) return true;
        // نادیده گرفتن عناصر داخل دکمه‌ها (آیکون‌ها و...)
        if (target.closest('button, a, input, textarea, select, .wl-fav-btn, .wl-act, .action-icon, .tag-select-toggle, .example-delete')) return true;
        // نادیده گرفتن عناصر قابل اسکرول (overflow:auto/scroll)
        const scrollable = target.closest('[style*="overflow"], .bulk-words-list, .chat-messages-container');
        if (scrollable) return true;
        return false;
    }

    function getContext() {
        // تشخیص: آیا در جزئیات لغت هستیم یا لیست لغات؟
        // پشتیبانی از هر دو کلاس: .detail-word-card (قدیمی) و .wd-card (جدید pro)
        const detailCard = document.querySelector('.detail-word-card, .wd-card');
        if (detailCard && detailCard.offsetParent !== null) {
            return 'detail';
        }
        const wordListGrid = document.querySelector('.wl-grid');
        if (wordListGrid && wordListGrid.offsetParent !== null) {
            return 'wordlist';
        }
        return null;
    }

    function showSwipeOverlay(direction, context) {
        // ایجاد overlay برای feedback بصری
        if (activeOverlay) activeOverlay.remove();

        activeOverlay = document.createElement('div');
        activeOverlay.className = 'swipe-overlay swipe-' + direction;
        const icon = direction === 'next' ? 'fa-chevron-left' : 'fa-chevron-right';
        const label = context === 'detail'
            ? (direction === 'next' ? 'لغت بعدی' : 'لغت قبلی')
            : (direction === 'next' ? 'صفحه بعدی' : 'صفحه قبلی');
        activeOverlay.innerHTML = '<div class="swipe-overlay-inner"><i class="fas ' + icon + '"></i><span>' + label + '</span></div>';
        document.body.appendChild(activeOverlay);

        // انیمیشن ورود
        requestAnimationFrame(() => {
            activeOverlay.classList.add('visible');
        });

        // حذف بعد از 600ms
        setTimeout(() => {
            if (activeOverlay) {
                activeOverlay.classList.remove('visible');
                setTimeout(() => {
                    if (activeOverlay) { activeOverlay.remove(); activeOverlay = null; }
                }, 300);
            }
        }, 600);
    }

    function handleSwipe() {
        if (!isTracking) return;
        isTracking = false;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // اگر حرکت عمودی بیشتر بود → swipe نیست (اسکرول عمودی است)
        if (absDeltaY > absDeltaX * (1 / VERTICAL_RATIO)) return;
        // اگر فاصله افقی کم بود → swipe نیست
        if (absDeltaX < SWIPE_THRESHOLD) return;

        const context = getContext();
        if (!context) return;

        // تشخیص جهت:
        // در RTL: deltaX > 0 یعنی انگشت از چپ به راست (قبلی)
        //         deltaX < 0 یعنی انگشت از راست به چپ (بعدی)
        const isNext = deltaX < 0;  // راست → چپ
        const isPrev = deltaX > 0;  // چپ → راست

        if (context === 'detail') {
            // ناوبری بین لغات
            if (isNext) {
                showSwipeOverlay('next', 'detail');
                navigator.vibrate && navigator.vibrate(20);
                self.goToNextWord();
            } else if (isPrev) {
                showSwipeOverlay('prev', 'detail');
                navigator.vibrate && navigator.vibrate(20);
                self.goToPrevWord();
            }
        } else if (context === 'wordlist') {
            // صفحه‌بندی لیست لغات
            const perPage = self._wlWordsPerPage || 24;
            const words = self.currentWordList || [];
            const totalPages = Math.max(1, Math.ceil(words.length / perPage));
            const currentPage = self._wlCurrentPage || 1;

            if (isNext && currentPage < totalPages) {
                showSwipeOverlay('next', 'wordlist');
                navigator.vibrate && navigator.vibrate(20);
                self._wlCurrentPage = currentPage + 1;
                const activeFilter = document.querySelector('.filter-btn.active');
                self.renderWordList(activeFilter ? activeFilter.dataset.filter : 'all');
                const wlSection = document.getElementById('word-list-section');
                if (wlSection) wlSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (isPrev && currentPage > 1) {
                showSwipeOverlay('prev', 'wordlist');
                navigator.vibrate && navigator.vibrate(20);
                self._wlCurrentPage = currentPage - 1;
                const activeFilter = document.querySelector('.filter-btn.active');
                self.renderWordList(activeFilter ? activeFilter.dataset.filter : 'all');
                const wlSection = document.getElementById('word-list-section');
                if (wlSection) wlSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if ((isNext && currentPage >= totalPages) || (isPrev && currentPage <= 1)) {
                // در صفحه اول/آخر — لرزش کوتاه برای feedback
                navigator.vibrate && navigator.vibrate(30);
            }
        }
    }

    // ----- رویدادهای touch -----
    document.addEventListener('touchstart', (e) => {
        if (!self._isMobileSwipeDevice()) return;
        // فقط یک انگشت
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        const target = e.target;

        // نادیده گرفتن دکمه‌ها و اینپوت‌ها
        if (shouldIgnoreTarget(target)) return;

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchEndX = touch.clientX;
        touchEndY = touch.clientY;
        isTracking = true;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isTracking) return;
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        touchEndX = touch.clientX;
        touchEndY = touch.clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (!isTracking) return;
        if (e.changedTouches.length !== 1) { isTracking = false; return; }
        const touch = e.changedTouches[0];
        touchEndX = touch.clientX;
        touchEndY = touch.clientY;
        handleSwipe();
    }, { passive: true });

    document.addEventListener('touchcancel', () => {
        isTracking = false;
    }, { passive: true });

    console.log('✅ سیستم کشیدن (swipe) برای موبایل فعال شد');
};

/* ----- استایل‌های overlay برای feedback بصری ----- */
GermanDictionary.prototype._injectSwipeStyles = function() {
    if (document.getElementById('swipe-gesture-styles')) return;
    const style = document.createElement('style');
    style.id = 'swipe-gesture-styles';
    style.textContent = `
        .swipe-overlay {
            position: fixed;
            top: 0; bottom: 0;
            width: 120px;
            background: linear-gradient(135deg, rgba(67,97,238,.92), rgba(58,92,212,.92));
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            color: #fff;
            z-index: 99990;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            opacity: 0;
            transition: opacity .25s ease;
            box-shadow: 0 0 40px rgba(67,97,238,.4);
        }
        .swipe-overlay.swipe-next {
            left: auto;
            right: 0;
            border-radius: 24px 0 0 24px;
        }
        .swipe-overlay.swipe-prev {
            left: 0;
            right: auto;
            border-radius: 0 24px 24px 0;
        }
        .swipe-overlay.visible {
            opacity: 1;
        }
        .swipe-overlay-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 16px;
        }
        .swipe-overlay-inner i {
            font-size: 36px;
            color: #fff;
            text-shadow: 0 2px 8px rgba(0,0,0,.2);
        }
        .swipe-overlay-inner span {
            font-size: 13px;
            font-weight: 700;
            font-family: 'Vazirmatn', Tahoma, sans-serif;
            text-shadow: 0 2px 8px rgba(0,0,0,.2);
            white-space: nowrap;
        }

        body.dark-mode .swipe-overlay {
            background: linear-gradient(135deg, rgba(67,97,238,.85), rgba(139,92,246,.85));
            box-shadow: 0 0 40px rgba(67,97,238,.5);
        }

        /* انیمیشن ورود */
        .swipe-next.visible { animation: swipe-in-right .3s ease both; }
        .swipe-prev.visible { animation: swipe-in-left .3s ease both; }
        @keyframes swipe-in-right {
            from { transform: translateX(40px); opacity: 0; }
            to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes swipe-in-left {
            from { transform: translateX(-40px); opacity: 0; }
            to   { transform: translateX(0); opacity: 1; }
        }

        /* مخفی کردن دکمه‌های ناوبری در موبایل (چون swipe داریم) */
        @media (max-width: 768px) {
            .detail-navigation-buttons,
            .wd-nav-arrows {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
};

