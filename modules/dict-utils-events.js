/* dict-utils-events.js — Utils, Event Listeners, Save Word, Edit, AI Suggestions, Tabs (lines 19209-20919) */

// setupSearchEventListeners — تعریف گم‌شده
GermanDictionary.prototype.setupSearchEventListeners = function() {
    const self = this;
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput ? searchInput.value.trim() : '';
            if (query && typeof self.normalSearch === 'function') {
                self.normalSearch(query);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                if (query && typeof self.normalSearch === 'function') {
                    self.normalSearch(query);
                }
            }
        });
    }

    // جستجوی سریع
    if (typeof self.setupQuickSearch === 'function') {
        self.setupQuickSearch();
    }
};

GermanDictionary.prototype.showSection = function(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
        console.error(`❌ بخش ${sectionId} پیدا نشد`);
        return;
    }
    
    // مخفی کردن همه بخش‌ها
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // نمایش بخش انتخاب شده
    targetSection.classList.add('active');
    
    // ذخیره در localStorage
    localStorage.setItem('lastActiveSection', sectionId.replace('-section', ''));
    
    console.log(`📱 رفتن به بخش: ${sectionId}`);
};

GermanDictionary.prototype.speakText = function(text, lang = 'de-DE') {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
};

GermanDictionary.prototype.playPronunciation = function(word) {
        this.speakText(word, 'de-DE');
};

/* ============================================================
   سیستم نوتیفیکیشن پریمیوم v2 (glassmorphism + dark mode + mobile)
   ============================================================ */
GermanDictionary.prototype._ntEnsureStyles = function() {
    if (document.getElementById('nt-pro-styles')) return;
    var style = document.createElement('style');
    style.id = 'nt-pro-styles';
    style.textContent = `
        #nt-container{position:fixed;top:16px;right:16px;z-index:100000;display:flex;flex-direction:column;gap:8px;max-width:340px;width:auto;pointer-events:none;}
        @media(max-width:520px){#nt-container{top:10px;right:10px;left:10px;max-width:none;width:auto;}}

        .nt-card{position:relative;overflow:hidden;display:flex;align-items:flex-start;gap:10px;padding:12px 14px 12px 16px;border-radius:14px;pointer-events:auto;animation:nt-in .35s cubic-bezier(.22,1,.36,1) both;transition:transform .25s ease,opacity .25s ease;}
        .nt-card.nt-out{animation:nt-out .25s ease both;}
        @keyframes nt-in{from{opacity:0;transform:translateX(110%) scale(.9);}to{opacity:1;transform:translateX(0) scale(1);}}
        @keyframes nt-out{from{opacity:1;transform:translateX(0);}to{opacity:0;transform:translateX(110%);}}

        .nt-card{backdrop-filter:blur(18px) saturate(160%);-webkit-backdrop-filter:blur(18px) saturate(160%);box-shadow:0 6px 24px rgba(0,0,0,.10),0 1px 4px rgba(0,0,0,.05);border:1px solid rgba(255,255,255,.12);}
        .nt-card{background:rgba(255,255,255,.82);color:#1a1a2e;}
        body.dark-mode .nt-card{background:rgba(20,20,35,.78);color:#e4e6eb;border-color:rgba(255,255,255,.05);}

        .nt-card::before{content:"";position:absolute;top:0;bottom:0;right:0;width:3px;border-radius:0 14px 14px 0;}
        .nt-success::before{background:linear-gradient(180deg,#10b981,#059669);}
        .nt-error::before{background:linear-gradient(180deg,#f43f5e,#e11d48);}
        .nt-warning::before{background:linear-gradient(180deg,#f59e0b,#d97706);}
        .nt-info::before{background:linear-gradient(180deg,#3b82f6,#2563eb);}

        body.dark-mode .nt-success{box-shadow:0 6px 24px rgba(16,185,129,.15),0 0 0 1px rgba(16,185,129,.06);}
        body.dark-mode .nt-error{box-shadow:0 6px 24px rgba(244,63,94,.15),0 0 0 1px rgba(244,63,94,.06);}
        body.dark-mode .nt-warning{box-shadow:0 6px 24px rgba(245,158,11,.15),0 0 0 1px rgba(245,158,11,.06);}
        body.dark-mode .nt-info{box-shadow:0 6px 24px rgba(59,130,246,.15),0 0 0 1px rgba(59,130,246,.06);}

        .nt-ic{width:30px;height:30px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:9px;font-size:13px;}
        .nt-success .nt-ic{background:rgba(16,185,129,.14);color:#059669;}
        .nt-error .nt-ic{background:rgba(244,63,94,.14);color:#e11d48;}
        .nt-warning .nt-ic{background:rgba(245,158,11,.14);color:#d97706;}
        .nt-info .nt-ic{background:rgba(59,130,246,.14);color:#2563eb;}
        body.dark-mode .nt-success .nt-ic{background:rgba(16,185,129,.18);color:#34d399;}
        body.dark-mode .nt-error .nt-ic{background:rgba(244,63,94,.18);color:#fb7185;}
        body.dark-mode .nt-warning .nt-ic{background:rgba(245,158,11,.18);color:#fbbf24;}
        body.dark-mode .nt-info .nt-ic{background:rgba(59,130,246,.18);color:#60a5fa;}

        .nt-body{flex:1;min-width:0;padding-top:1px;}
        .nt-title{font-size:13px;font-weight:700;line-height:1.4;margin:0;}
        .nt-desc{font-size:11px;font-weight:500;opacity:.65;margin:1px 0 0;line-height:1.4;}

        .nt-close{width:22px;height:22px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:none;border-radius:6px;background:transparent;color:currentColor;opacity:.35;cursor:pointer;font-size:11px;transition:all .15s ease;}
        .nt-close:hover{opacity:1;background:rgba(128,128,128,.12);}

        .nt-progress{position:absolute;bottom:0;left:0;right:0;height:2px;overflow:hidden;}
        .nt-progress-fill{height:100%;width:100%;transform-origin:right;animation:nt-bar linear forwards;}
        @keyframes nt-bar{from{transform:scaleX(1);}to{transform:scaleX(0);}}
        .nt-success .nt-progress-fill{background:linear-gradient(90deg,#10b981,#34d399);}
        .nt-error .nt-progress-fill{background:linear-gradient(90deg,#f43f5e,#fb7185);}
        .nt-warning .nt-progress-fill{background:linear-gradient(90deg,#f59e0b,#fbbf24);}
        .nt-info .nt-progress-fill{background:linear-gradient(90deg,#3b82f6,#60a5fa);}

        .nt-card:hover .nt-progress-fill{animation-play-state:paused;}

        @media(max-width:520px){
            .nt-card{padding:10px 12px 10px 14px;gap:8px;}
            .nt-ic{width:28px;height:28px;font-size:12px;}
            .nt-title{font-size:12px;}
            .nt-desc{font-size:11px;}
            .nt-close{width:20px;height:20px;font-size:10px;}
        }
    `;
    document.head.appendChild(style);
};

GermanDictionary.prototype._ntMessages = {}; // کش برای جلوگیری از نوتیفیکیشن تکراری

GermanDictionary.prototype.showToast = function(message, type, options) {
    if (!type) type = 'info';
    var duration = (options && options.duration) || 3000;
    var title = (options && options.title) || message;
    var desc = (options && options.desc) || '';
    var silent = (options && options.silent) || false;

    // جلوگیری از نوتیفیکیشن تکراری در ۳ ثانیه اخیر
    var key = title + '|' + type;
    if (this._ntMessages[key] && (Date.now() - this._ntMessages[key]) < 3000) {
        return; // پیام تکراری — نادیده بگیر
    }
    this._ntMessages[key] = Date.now();

    // حداکثر ۳ نوتیفیکیشن هم‌زمان
    var container = document.getElementById('nt-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'nt-container';
        document.body.appendChild(container);
    }
    var existing = container.querySelectorAll('.nt-card:not(.nt-out)');
    if (existing.length >= 3) {
        // قدیمی‌ترین را حذف کن
        existing[0].classList.add('nt-out');
        setTimeout(function() { existing[0].remove(); }, 250);
    }

    this._ntEnsureStyles();

    var icons = {success:'fa-circle-check',error:'fa-circle-xmark',warning:'fa-triangle-exclamation',info:'fa-circle-info'};
    var iconClass = icons[type] || icons.info;

    var card = document.createElement('div');
    card.className = 'nt-card nt-' + type;
    card.innerHTML =
        '<div class="nt-ic"><i class="fas ' + iconClass + '"></i></div>' +
        '<div class="nt-body"><p class="nt-title">' + this.escapeHtml(title) + '</p>' +
        (desc ? '<p class="nt-desc">' + this.escapeHtml(desc) + '</p>' : '') + '</div>' +
        '<button class="nt-close" aria-label="بستن"><i class="fas fa-xmark"></i></button>' +
        '<div class="nt-progress"><div class="nt-progress-fill" style="animation-duration:' + duration + 'ms;"></div></div>';

    container.appendChild(card);

    var closeBtn = card.querySelector('.nt-close');
    var removeTimer = null;

    function removeCard() {
        if (card.classList.contains('nt-out')) return;
        card.classList.add('nt-out');
        setTimeout(function() { card.remove(); }, 250);
    }

    closeBtn.addEventListener('click', removeCard);
    removeTimer = setTimeout(removeCard, duration);

    card.addEventListener('mouseenter', function() { clearTimeout(removeTimer); });
    card.addEventListener('mouseleave', function() { removeTimer = setTimeout(removeCard, 1500); });
};

GermanDictionary.prototype.getGenderLabel = function(gender) {
        const labels = {
            masculine: 'مذکر (der)',
            feminine: 'مونث (die)',
            neuter: 'خنثی (das)'
        };
        return labels[gender] || '';
};

GermanDictionary.prototype.getGenderSymbol = function(gender) {
        const symbols = {
            masculine: 'der',
            feminine: 'die',
            neuter: 'das'
        };
        return symbols[gender] || '';
};

GermanDictionary.prototype.getTypeLabel = function(type) {
        const labels = {
            noun: 'اسم',
            verb: 'فعل',
            adjective: 'صفت',
            adverb: 'قید',
            other: 'سایر'
        };
        return labels[type] || type;
};

GermanDictionary.prototype.shuffleArray = function(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
};

GermanDictionary.prototype.escapeHtml = function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
};

GermanDictionary.prototype.setupOnlineStatusListener = function() {
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());
};

GermanDictionary.prototype.updateOnlineStatus = function() {
        const isOnline = navigator.onLine;
        const statusElement = document.getElementById('online-status');
        
        if (statusElement) {
            statusElement.className = `online-status ${isOnline ? 'online' : 'offline'}`;
            statusElement.innerHTML = `
                <i class="fas fa-${isOnline ? 'wifi' : 'exclamation-triangle'}"></i>
                ${isOnline ? 'آنلاین - سرویس‌های ترجمه فعال' : 'آفلاین - فقط دیکشنری محلی'}
            `;
        }
};

GermanDictionary.prototype.setupEventListeners = function() {
    // ========== جستجو ==========
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    if (searchBtn) {
        searchBtn.onclick = async () => {
            const query = searchInput?.value.trim();
            if (query) {
                const results = await this.searchWords(query);
                if (results.length > 0) {
                    this.normalSearch(query);
                } else {
                    this.showToast('❌ هیچ نتیجه‌ای یافت نشد', 'info');
                }
            }
        };
    }
    
    if (searchInput) {
        searchInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                searchBtn?.click();
            }
        };
    }
    
    // ========== فرم افزودن لغت ==========
    
    // ذخیره لغت
    const saveWordBtn = document.getElementById('save-word-btn');
    if (saveWordBtn) {
        saveWordBtn.onclick = async () => {
            await this.saveWord();
        };
    }
    
    // پاک کردن فرم
    const clearFormBtn = document.getElementById('clear-form-btn');
    if (clearFormBtn) {
        clearFormBtn.onclick = () => {
            this.clearAddWordForm();
            this.showToast('🧹 فرم پاک شد', 'info');
        };
    }
    
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const aiFillBtn = document.getElementById('ai-fill-all-btn');
        if (aiFillBtn && aiFillBtn.style.display !== 'none') {
            this.aiSmartFillAll();
        } else {
            // اگر دکمه مخفی بود، اول بررسی کن آیا فیلد آلمانی پر شده
            const germanWord = document.getElementById('german-word')?.value.trim();
            if (germanWord && germanWord.length >= 2) {
                // نمایش موقت دکمه و اجرا
                const btn = document.getElementById('ai-fill-all-btn');
                if (btn) {
                    btn.style.display = 'flex';
                    this.aiSmartFillAll();
                }
            } else {
                this.showToast('⌨️ ابتدا یک لغت آلمانی وارد کنید', 'info');
            }
        }
    }
});
    // ========== انتخاب نوع کلمه (Type Cards) ==========
    document.querySelectorAll('.type-card').forEach(card => {
        card.onclick = (e) => {
            e.stopPropagation();
            // حذف active از همه کارت‌ها
            document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
            // اضافه active به کارت کلیک شده
            card.classList.add('active');
            // نمایش فیلدهای مربوطه
            const type = card.dataset.type;
            this.toggleTypeFields(type);
 const word = document.getElementById('german-word')?.value.trim();
    if (word && word.length >= 2) {
        // دکمه header رو آپدیت کن با نوع جدید
        this.showAIFillButton(word);
        // صرف فعل فقط برای فعل
        if (type === 'verb') {
            this.fetchAIVerbConjugation(word);
        } else {
            document.getElementById('ai-verb-suggestion')?.remove();
        }
    }
            // به‌روزرسانی بج نوع
            const typeBadge = document.getElementById('word-type-badge');
            if (typeBadge) {
                const typeNames = {
                    noun: '📘 اسم',
                    verb: '⚡ فعل',
                    adjective: '✨ صفت',
                    adverb: '📌 قید',
                    preposition: '🔗 حرف اضافه',
                    other: '📎 سایر'
                };
                typeBadge.innerHTML = typeNames[type] || '📘 اسم';
            }
        };
    });
    
    // ========== انتخاب جنسیت (Gender Options) ==========
    document.querySelectorAll('.gender-option').forEach(option => {
        option.onclick = (e) => {
            e.stopPropagation();
            // حذف active از همه گزینه‌ها
            document.querySelectorAll('.gender-option').forEach(opt => opt.classList.remove('active'));
            // اضافه active به گزینه کلیک شده
            option.classList.add('active');
        };
    });
    
    // ========== میانبرهای کیبورد ==========
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter برای ذخیره
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            const saveBtn = document.getElementById('save-word-btn');
            if (saveBtn && !saveBtn.disabled) {
                this.saveWord();
            }
        }
        // Escape برای پاک کردن فرم
        if (e.key === 'Escape') {
            const clearBtn = document.getElementById('clear-form-btn');
            if (clearBtn && !clearBtn.disabled) {
                this.clearAddWordForm();
                this.showToast('🧹 فرم پاک شد', 'info');
            }
        }
    });
    
    // ========== شمارنده فیلدها (实时更新) ==========
    const inputs = document.querySelectorAll('#add-word-section .modern-input, #add-word-section textarea');
    inputs.forEach(input => {
        input.oninput = () => {
            this.updateFieldCount();
        };
    });
    
    // ========== اعتبارسنجی实时================
    const germanInput = document.getElementById('german-word');
    const persianInput = document.getElementById('persian-meaning');

if (germanInput) {
    germanInput.onblur = () => {
        const value = germanInput.value.trim();
        if (value && /^[a-z]/i.test(value)) {
            if (!value.match(/^[A-ZÄÖÜ]/) && document.querySelector('.type-card.active')?.dataset.type === 'noun') {
                // نکته حرف بزرگ — نوتیفیکیشن حذف شد
            }
        }
        if (value && value.length >= 2) {
            // نمایش دکمه هوش مصنوعی در header
            this.showAIFillButton(value);
            // پیشنهاد مثال
            this.fetchAIExampleSuggestion(value);
            // صرف فعل اگه نوع فعله
            const activeType = document.querySelector('.type-card.active')?.dataset.type;
            if (activeType === 'verb') this.fetchAIVerbConjugation(value);
        }
    };
    // پاک شدن input → پنهان کردن دکمه
    germanInput.addEventListener('input', () => {
        if (!germanInput.value.trim()) this.hideAIFillButton();
    });
}
    
    if (persianInput) {
        persianInput.onblur = () => {
            const value = persianInput.value.trim();
            if (!value) {
                persianInput.style.borderColor = '#ef4444';
            } else {
                persianInput.style.borderColor = '';
            }
        };
        
        persianInput.onfocus = () => {
            persianInput.style.borderColor = '';
        };
    }
    

    
    // ========== رویدادهای AI چت ==========
    this.setupAIChatEventListeners();
    
    // ========== رویدادهای تمرین ==========
    this.setupPracticeEventListeners();
    
    // ========== رویدادهای کتابخانه ==========
    this.setupLibraryEventListeners();
    
    // ========== رویدادهای خروجی تصویری ==========
    this.setupExportEventListeners();
    
    console.log('✅ همه رویدادها متصل شدند');
};

GermanDictionary.prototype.setupPracticeEventListeners = function() {
    const startFlashcard = document.getElementById('start-flashcard-btn');
    if (startFlashcard) startFlashcard.onclick = () => this.startPracticeSession();
    
    const startListening = document.getElementById('start-listening-btn');
    if (startListening) startListening.onclick = () => this.startListeningPractice();
    
    const startWriting = document.getElementById('start-writing-btn');
    if (startWriting) startWriting.onclick = () => this.startWritingPractice();
    
    const startSpeaking = document.getElementById('start-speaking-btn');
    if (startSpeaking) startSpeaking.onclick = () => this.startSpeakingPractice();
};

GermanDictionary.prototype.setupLibraryEventListeners = function() {
    const addBookBtn = document.getElementById('add-book-btn');
    if (addBookBtn) addBookBtn.onclick = () => {
        const form = document.getElementById('add-book-form');
        if (form) form.style.display = 'block';
    };
    
    const cancelBookBtn = document.getElementById('cancel-book-btn');
    if (cancelBookBtn) cancelBookBtn.onclick = () => {
        const form = document.getElementById('add-book-form');
        if (form) form.style.display = 'none';
        this.clearBookForm();
    };
    
    const saveBookBtn = document.getElementById('save-book-btn');
    if (saveBookBtn) saveBookBtn.onclick = () => this.saveNewBookToIndexedDB();
};

GermanDictionary.prototype.setupExportEventListeners = function() {
    const exportBtn = document.getElementById('export-words-to-image-btn');
    if (exportBtn) exportBtn.onclick = () => this.showExportWordsModal();
};

GermanDictionary.prototype.sortWordList = async function(filter, sortType) {
    const words = await this.getAllWords();
    const container = document.getElementById('word-list-container');
    const isGerman = LanguageSystem.isGerman();
    
    if (!container) return;
    
    let filteredWords = words;
    
    switch(filter) {
        case 'favorites':
            filteredWords = words.filter(word => this.favorites.has(word.id));
            break;
        case 'nouns':
            filteredWords = words.filter(word => word.type === 'noun');
            break;
        case 'verbs':
            filteredWords = words.filter(word => word.type === 'verb');
            break;
        case 'adjectives':
            filteredWords = words.filter(word => word.type === 'adjective');
            break;
        case 'adverbs':
            filteredWords = words.filter(word => word.type === 'adverb');
            break;
        default:
            filteredWords = words;
    }
    
    // مرتب‌سازی بر اساس نوع
    switch(sortType) {
        case 'alphabetical':
            filteredWords.sort((a, b) => a.german.localeCompare(b.german, 'de'));
            break;
        case 'date-asc':
            filteredWords.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'date-desc':
            filteredWords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'practice-count':
            const practiceHistory = await this.getAllPracticeHistory();
            const practiceCounts = {};
            practiceHistory.forEach(p => {
                practiceCounts[p.wordId] = (practiceCounts[p.wordId] || 0) + 1;
            });
            filteredWords.sort((a, b) => (practiceCounts[b.id] || 0) - (practiceCounts[a.id] || 0));
            break;
        case 'accuracy':
            const history = await this.getAllPracticeHistory();
            const correctMap = {};
            const totalMap = {};
            history.forEach(p => {
                if (p.correct) correctMap[p.wordId] = (correctMap[p.wordId] || 0) + 1;
                totalMap[p.wordId] = (totalMap[p.wordId] || 0) + 1;
            });
            filteredWords.sort((a, b) => {
                const accA = (correctMap[a.id] || 0) / (totalMap[a.id] || 1);
                const accB = (correctMap[b.id] || 0) / (totalMap[b.id] || 1);
                return accB - accA;
            });
            break;
    }
    
    container.innerHTML = filteredWords.map((word, index) => `
        <div class="word-list-item" data-id="${word.id}">
            <div class="word-list-item-header">
                <div class="word-list-item-title-section">
                    <span class="word-number">${index + 1}</span>
                    <i class="fas fa-star favorite-icon ${this.favorites.has(word.id) ? 'active' : ''}" data-id="${word.id}"></i>
                    <span class="word-list-item-title">${this.escapeHtml(word.german)}</span>
                    ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                    ${word.type ? `<span class="word-type">${this.getTypeLabel(word.type)}</span>` : ''}
                </div>
            </div>
            <div class="word-list-item-meaning">${this.escapeHtml(word.persian)}</div>
            <div class="word-list-item-actions">
                <button class="btn btn-sm btn-outline view-word" data-id="${word.id}">
                    <i class="fas fa-eye"></i> ${isGerman ? 'مشاهده' : 'View'}
                </button>
                <button class="btn btn-sm btn-outline practice-word" data-id="${word.id}">
                    <i class="fas fa-brain"></i> ${LanguageSystem.t('practice.start')}
                </button>
            </div>
        </div>
    `).join('');
    
    this.setupWordListEventListeners();
};

GermanDictionary.prototype.saveWord = async function() {
    try {
        const german = document.getElementById('german-word')?.value.trim();
        const persian = document.getElementById('persian-meaning')?.value.trim();
        
        if (!german || !persian) {
            this.showToast('❌ لطفاً هر دو فیلد لغت آلمانی و معنی فارسی را پر کنید', 'error');
            return false;
        }
        
        const activeTypeCard = document.querySelector('.type-card.active');
        const type = activeTypeCard?.dataset.type || 'other';
        
        const wordData = {
            german: german,
            persian: persian,
            type: type,
            createdAt: new Date().toISOString()
        };
        
        // ========== فیلد توضیحات (Notes) ==========
        const notes = document.getElementById('word-notes')?.value.trim();
        if (notes) wordData.notes = notes;
        
        // ========== جمع‌آوری داده‌های اسم ==========
        if (type === 'noun') {
            const activeGender = document.querySelector('.gender-option.active');
            wordData.gender = activeGender?.dataset.gender || null;
            wordData.plural = document.getElementById('noun-plural')?.value.trim() || null;
        }
        
        // ========== جمع‌آوری داده‌های فعل ==========
        if (type === 'verb') {
            const helperRadio = document.querySelector('input[name="verb-helper"]:checked');
            wordData.verbPresent = document.getElementById('verb-present')?.value.trim() || null;
            wordData.verbPast = document.getElementById('verb-past')?.value.trim() || null;
            wordData.verbPerfect = document.getElementById('verb-perfect')?.value.trim() || null;
            wordData.verbFuture = document.getElementById('verb-future')?.value.trim() || null;
            wordData.verbKonjunktiv = document.getElementById('verb-konjunktiv')?.value.trim() || null;
            wordData.verbHelper = helperRadio?.value || 'haben';
            wordData.verbSeparable = document.getElementById('verb-separable')?.checked || false;
        }
        
        // ========== جمع‌آوری داده‌های صفت ==========
        if (type === 'adjective') {
            wordData.comparative = document.getElementById('adj-komparativ')?.value.trim() || null;
            wordData.superlative = document.getElementById('adj-superlativ')?.value.trim() || null;
            wordData.antonym = document.getElementById('adj-antonym')?.value.trim() || null;
        }
        
        // ========== جمع‌آوری داده‌های حرف اضافه ==========
        if (type === 'preposition') {
            wordData.case = document.getElementById('prep-case')?.value || null;
            wordData.meanings = document.getElementById('prep-meanings')?.value.trim() || null;
        }
        
        // ========== فیلدهای مشترک ==========
        wordData.example = document.getElementById('example')?.value.trim() || null;
        wordData.exampleTranslation = document.getElementById('example-translation')?.value.trim() || null;
        wordData.pronunciation = document.getElementById('pronunciation')?.value.trim() || null;
        
        const tags = document.getElementById('word-tags')?.value.trim();
        wordData.tags = tags ? tags.split(',').map(t => t.trim()) : null;
        
        await this.addWord(wordData);
        
        // پاک کردن فرم فقط بعد از ذخیره موفق
        this.clearAddWordForm();
        this.showToast('✅ لغت با موفقیت ذخیره شد', 'success');
        
        setTimeout(() => {
            this.renderWordList();
            this.updateStats();
        }, 100);
        
        return true;
        
    } catch (error) {
        console.error('Error saving word:', error);
        // مدیریت خطای لغت تکراری
        const msg = error.message || '';
        if (msg === 'duplicate' || msg.includes('uniqueness') || msg.includes('ConstraintError')) {
            this.showToast('⚠️ این لغت قبلاً ثبت شده است', 'warning');
        } else {
            this.showToast(msg || '❌ خطا در ذخیره لغت', 'error');
        }
        return false;
    }
};

GermanDictionary.prototype.setupWordListEventListeners = function() {
    const container = document.getElementById('word-list-container');
    const favContainer = document.getElementById('favorites-container');

    // حذف handler های قبلی اگر وجود داشتند (جلوگیری از تکرار listener)
    if (this._wlClickHandler) {
        if (container) container.removeEventListener('click', this._wlClickHandler);
        if (favContainer) favContainer.removeEventListener('click', this._wlClickHandler);
    }

    // تعریف handler جدید با event delegation
    // از data-action استفاده می‌کند تا با کارت‌های جدید (.wl-card) و
    // همچنین ساختار قدیمی (.word-list-item, .favorite-icon, .view-word) سازگار باشد.
    this._wlClickHandler = async (e) => {
        // ===== ۱) بررسی دکمه‌های جدید با data-action =====
        const actionEl = e.target.closest('[data-action]');
        if (actionEl) {
            e.stopPropagation();
            const action = actionEl.dataset.action;
            const wordId = parseInt(actionEl.dataset.id);
            if (!wordId) return;

            switch (action) {
                case 'view': {
                    const word = await this.getWord(wordId);
                    if (word) {
                        this.lastWordId = wordId;
                        if (typeof this._spViewWord === 'function') {
                            this._spViewWord(wordId);
                        } else {
                            this.renderWordDetails(word);
                            this.showSection('search-section');
                        }
                    }
                    break;
                }
                case 'favorite': {
                    await this.toggleFavorite(wordId);
                    actionEl.classList.toggle('active');
                    this.updateFavoritesCount();
                    const activeFilter = document.querySelector('.filter-btn.active');
                    if (activeFilter) {
                        this.renderWordList(activeFilter.dataset.filter);
                    } else {
                        this.renderWordList('all');
                    }
                    break;
                }
                case 'practice': {
                    this.startPracticeSession([wordId]);
                    break;
                }
                case 'tag': {
                    const wordGerman = actionEl.dataset.word;
                    if (typeof this.showTagSelectionForWord === 'function') {
                        this.showTagSelectionForWord(wordId, wordGerman);
                    }
                    break;
                }
            }
            return;
        }

        // ===== ۲) سازگاری با ساختار قدیمی: .favorite-icon =====
        const oldFavIcon = e.target.closest('.favorite-icon');
        if (oldFavIcon && oldFavIcon.dataset.id) {
            e.stopPropagation();
            const wordId = parseInt(oldFavIcon.dataset.id);
            await this.toggleFavorite(wordId);
            oldFavIcon.classList.toggle('active');
            this.updateFavoritesCount();
            const activeFilter = document.querySelector('.filter-btn.active');
            if (activeFilter) {
                this.renderWordList(activeFilter.dataset.filter);
            } else {
                this.renderWordList('all');
            }
            return;
        }

        // ===== ۳) سازگاری با ساختار قدیمی: .practice-word =====
        const oldPracticeBtn = e.target.closest('.practice-word');
        if (oldPracticeBtn && oldPracticeBtn.dataset.id) {
            e.stopPropagation();
            const wordId = parseInt(oldPracticeBtn.dataset.id);
            this.startPracticeSession([wordId]);
            return;
        }

        // ===== ۴) سازگاری با ساختار قدیمی: .view-word =====
        const oldViewBtn = e.target.closest('.view-word');
        if (oldViewBtn && oldViewBtn.dataset.id) {
            e.stopPropagation();
            const wordId = parseInt(oldViewBtn.dataset.id);
            const word = await this.getWord(wordId);
            if (word) {
                this.lastWordId = wordId;
                if (typeof this._spViewWord === 'function') {
                    this._spViewWord(wordId);
                } else {
                    this.renderWordDetails(word);
                    this.showSection('search-section');
                }
            }
            return;
        }

        // ===== ۵) کلیک روی کل کارت (نه روی دکمه) → مشاهده لغت =====
        const cardEl = e.target.closest('.wl-card, .word-list-item');
        if (cardEl) {
            const wordId = parseInt(cardEl.dataset.id);
            if (wordId) {
                const word = await this.getWord(wordId);
                if (word) {
                    this.lastWordId = wordId;
                    if (typeof this._spViewWord === 'function') {
                        this._spViewWord(wordId);
                    } else {
                        this.renderWordDetails(word);
                        this.showSection('search-section');
                    }
                }
            }
        }
    };

    // اتصال handler به هر دو کانتینر (لیست لغات و علاقه‌مندی‌ها)
    if (container) container.addEventListener('click', this._wlClickHandler);
    if (favContainer && favContainer !== container) {
        favContainer.addEventListener('click', this._wlClickHandler);
    }
};

GermanDictionary.prototype.setupWordDetailsEventListeners = function(word) {
    // تلفظ
    document.querySelectorAll('.pronunciation-icon').forEach(btn => {
        btn.onclick = () => {
            const wordText = btn.dataset.word;
            this.playPronunciation(wordText);
        };
    });
    
    // علاقه‌مندی
    const favIcon = document.querySelector('.favorite-icon');
    if (favIcon) {
        favIcon.onclick = async (e) => {
            e.stopPropagation();
            const wordId = parseInt(favIcon.dataset.id);
            await this.toggleFavorite(wordId);
            favIcon.classList.toggle('active');
            this.updateFavoritesCount();
        };
    }
    
    // افزودن مثال
    const addExampleBtn = document.getElementById('add-example-btn');
    if (addExampleBtn) {
        addExampleBtn.onclick = async () => {
            const german = document.getElementById('new-example-german').value.trim();
            const persian = document.getElementById('new-example-persian').value.trim();
            
            if (german && persian) {
                await this.addExample(word.id, { german, persian });
                this.renderWordDetails(word);
                this.showToast('✅ مثال اضافه شد', 'success');
            } else {
                this.showToast('❌ لطفاً هر دو فیلد را پر کنید', 'error');
            }
        };
    }
    
    // تمرین این لغت
    const practiceBtn = document.getElementById('practice-now-btn');
    if (practiceBtn) {
        practiceBtn.onclick = () => {
            this.startPracticeSession([word.id]);
            this.showSection('flashcards-section');
        };
    }
    
    // ویرایش
    const editIcon = document.querySelector('.edit-word-icon');
    if (editIcon) {
        editIcon.onclick = () => {
            this.showEditWordForm(word);
        };
    }
    
    // حذف
    const deleteIcon = document.querySelector('.delete-word-icon');
    if (deleteIcon) {
        deleteIcon.onclick = async () => {
            if (confirm(`🗑️ آیا از حذف لغت "${word.german}" مطمئن هستید؟`)) {
                await this.deleteWord(word.id);
                this.showSection('word-list-section');
                const activeFilter = document.querySelector('.filter-btn.active');
                this.renderWordList(activeFilter ? activeFilter.dataset.filter : 'all');
            }
        };
    }
};

GermanDictionary.prototype.setupEditFormEvents = function(originalWord) {
    // انتخاب نوع کلمه
    document.querySelectorAll('.edit-type-cards .type-card').forEach(card => {
        card.onclick = () => {
            document.querySelectorAll('.edit-type-cards .type-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const type = card.dataset.type;
            
            // نمایش فیلدهای مربوطه
            document.getElementById('edit-noun-fields').style.display = type === 'noun' ? 'block' : 'none';
            document.getElementById('edit-verb-fields').style.display = type === 'verb' ? 'block' : 'none';
            document.getElementById('edit-adjective-fields').style.display = type === 'adjective' ? 'block' : 'none';
            document.getElementById('edit-preposition-fields').style.display = type === 'preposition' ? 'block' : 'none';
        };
    });
    
    // انتخاب جنسیت
    document.querySelectorAll('.edit-gender-selector .gender-option').forEach(opt => {
        opt.onclick = () => {
            document.querySelectorAll('.edit-gender-selector .gender-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
        };
    });
    
    // دکمه ذخیره
    const saveBtn = document.getElementById('save-edit-btn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            await this.updateWordFromEditForm(originalWord.id);
        };
    }
    
    // دکمه انصراف
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const closeBtn = document.getElementById('close-edit-modal');
    const modal = document.getElementById('edit-word-modal');
    
    const closeModal = () => {
        modal.style.display = 'none';
    };
    
    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;
    if (modal) modal.onclick = (e) => { if (e.target === modal) closeModal(); };
};

GermanDictionary.prototype.updateWordFromEditForm = async function(wordId) {
    const german = document.getElementById('edit-german')?.value.trim();
    const persian = document.getElementById('edit-persian')?.value.trim();
    
    if (!german || !persian) {
        this.showToast('❌ لطفاً هر دو فیلد را پر کنید', 'error');
        return;
    }
    
    const activeTypeCard = document.querySelector('.edit-type-cards .type-card.active');
    const type = activeTypeCard?.dataset.type || 'other';
    
    const updatedWord = {
        id: wordId,
        german: german,
        persian: persian,
        type: type,
        updatedAt: new Date().toISOString()
    };
    
    // ========== فیلد توضیحات ==========
    const notes = document.getElementById('edit-notes')?.value.trim();
    if (notes) updatedWord.notes = notes;
    
    // فیلدهای اسم
    if (type === 'noun') {
        const activeGender = document.querySelector('.edit-gender-selector .gender-option.active');
        updatedWord.gender = activeGender?.dataset.gender || null;
        updatedWord.plural = document.getElementById('edit-plural')?.value.trim() || null;
    }
    
    // فیلدهای فعل
    if (type === 'verb') {
        const helperRadio = document.querySelector('input[name="edit-verb-helper"]:checked');
        updatedWord.verbForms = {
            present: document.getElementById('edit-verb-present')?.value.trim() || null,
            past: document.getElementById('edit-verb-past')?.value.trim() || null,
            perfect: document.getElementById('edit-verb-perfect')?.value.trim() || null,
            future: document.getElementById('edit-verb-future')?.value.trim() || null,
            konjunktiv: document.getElementById('edit-verb-konjunktiv')?.value.trim() || null,
            helper: helperRadio?.value || 'haben',
            separable: document.getElementById('edit-verb-separable')?.checked || false
        };
    }
    
    // فیلدهای صفت
    if (type === 'adjective') {
        updatedWord.comparative = document.getElementById('edit-adj-komparativ')?.value.trim() || null;
        updatedWord.superlative = document.getElementById('edit-adj-superlativ')?.value.trim() || null;
        updatedWord.antonym = document.getElementById('edit-adj-antonym')?.value.trim() || null;
    }
    
    // فیلدهای حرف اضافه
    if (type === 'preposition') {
        updatedWord.case = document.getElementById('edit-prep-case')?.value || null;
        updatedWord.meanings = document.getElementById('edit-prep-meanings')?.value.trim() || null;
    }
    
    // فیلدهای مشترک
    updatedWord.example = document.getElementById('edit-example')?.value.trim() || null;
    updatedWord.exampleTranslation = document.getElementById('edit-example-translation')?.value.trim() || null;
    updatedWord.pronunciation = document.getElementById('edit-pronunciation')?.value.trim() || null;
    
    const tags = document.getElementById('edit-tags')?.value.trim();
    updatedWord.tags = tags ? tags.split(',').map(t => t.trim()) : null;
    
    await this.updateWord(updatedWord);
    
    document.getElementById('edit-word-modal').style.display = 'none';
    this.showToast('✅ لغت با موفقیت ویرایش شد', 'success');
    
    // به‌روزرسانی نمایش
    const updatedWordData = await this.getWord(wordId);
    if (updatedWordData) {
        this.renderWordDetails(updatedWordData);
    }
    this.renderWordList();
};

GermanDictionary.prototype.fetchAIExampleSuggestion = async function(germanWord, forceRefresh = false, retryCount = 0) {
    this._aiExampleSuggestion = null;
    this._aiExampleWord = germanWord;

    this.showAIExampleLoading(forceRefresh);

    const prompt = `یک جمله مثال ساده آلمانی (سطح A1-B1) برای لغت "${germanWord}" بساز.
⚠️ بسیار مهم: ترجمه فارسی جمله را **فقط با حروف فارسی** بنویس. از حروف چینی، روسی، ژاپنی، کره‌ای یا هر زبان دیگر استفاده نکن.
اگر به هر دلیلی نتوانستی ترجمه فارسی خالص تولید کنی، به جای آن بنویس "ترجمه در دسترس نیست".

فقط یک JSON برگردان، هیچ توضیح اضافه‌ای نده:
{"example":"جمله آلمانی","translation":"ترجمه فارسی جمله"}`;

    try {
        const response = await this._puterChat(prompt, {});
        let rawText = '';
        if (response?.message?.content?.[0]?.text) rawText = response.message.content[0].text;
        else if (typeof response === 'string') rawText = response;
        else if (response?.text) rawText = response.text;
        else if (response?.message?.content) {
            rawText = Array.isArray(response.message.content)
                ? (response.message.content[0]?.text || '')
                : response.message.content;
        }

        let parsed;
        try {
            const clean = rawText.replace(/```json|```/g, '').trim();
            const jsonMatch = clean.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
        } catch {
            this.hideAIExampleLoading();
            if (retryCount < 2) {
                console.log(`تلاش مجدد برای مثال (${retryCount + 1})...`);
                setTimeout(() => this.fetchAIExampleSuggestion(germanWord, forceRefresh, retryCount + 1), 500);
            }
            return;
        }

        if (!parsed?.example || !parsed?.translation) {
            this.hideAIExampleLoading();
            if (retryCount < 2) {
                setTimeout(() => this.fetchAIExampleSuggestion(germanWord, forceRefresh, retryCount + 1), 500);
            }
            return;
        }

        // اعتبارسنجی ترجمه فارسی: وجود حداقل یک حرف فارسی
        const hasPersian = /[آ-ی]/g.test(parsed.translation);
        if (!hasPersian && retryCount < 2) {
            console.warn('ترجمه مثال فارسی نیست، تلاش مجدد...');
            this.hideAIExampleLoading();
            setTimeout(() => this.fetchAIExampleSuggestion(germanWord, forceRefresh, retryCount + 1), 500);
            return;
        }

        this._aiExampleSuggestion = parsed;

        const currentVal = document.getElementById('german-word')?.value.trim();
        if (currentVal === germanWord || forceRefresh) {
            this.showAIExampleSuggestion(parsed);
        } else {
            this.hideAIExampleLoading();
        }

    } catch (err) {
        console.warn('AI example fetch failed:', err);
        this.hideAIExampleLoading();
        if (retryCount < 2) {
            setTimeout(() => this.fetchAIExampleSuggestion(germanWord, forceRefresh, retryCount + 1), 1000);
        }
    }
};

GermanDictionary.prototype.showAIExampleLoading = function(isRefresh = false) {
    document.getElementById('ai-example-suggestion')?.remove();
    const exampleField = document.getElementById('example');
    if (!exampleField) return;
    const exampleGroup = exampleField.closest('.form-group') || exampleField.parentElement;
    if (!exampleGroup) return;

    const loadingEl = document.createElement('div');
    loadingEl.id = 'ai-example-suggestion';
    loadingEl.style.cssText = `
        margin-top:8px; padding:10px 14px;
        background:linear-gradient(135deg,rgba(67,97,238,0.06),rgba(76,201,240,0.06));
        border:1.5px dashed var(--primary,#4361ee); border-radius:10px;
        display:flex; align-items:center; gap:8px; opacity:0.8;
    `;
    loadingEl.innerHTML = `
        <span style="font-size:16px;animation:ai-spin 1s linear infinite;display:inline-block;">⏳</span>
        <span style="font-size:12px;color:var(--primary,#4361ee);">
            ${isRefresh ? '🔄 در حال ساخت مثال جدید...' : '🤖 در حال ساخت مثال...'}
        </span>
    `;
    exampleGroup.appendChild(loadingEl);
    this._injectAISuggestionStyles();
};

GermanDictionary.prototype.hideAIExampleLoading = function() {
    document.getElementById('ai-example-suggestion')?.remove();
};

GermanDictionary.prototype.showAIExampleSuggestion = function(suggestion) {
    const exampleField = document.getElementById('example');
    const exampleTransField = document.getElementById('example-translation');
    if (!exampleField || !exampleTransField) return;

    document.getElementById('ai-example-suggestion')?.remove();

    const exampleGroup = exampleField.closest('.form-group') || exampleField.parentElement;
    if (!exampleGroup) return;

    const suggestionEl = document.createElement('div');
    suggestionEl.id = 'ai-example-suggestion';
    suggestionEl.style.cssText = `
        margin-top:8px; padding:10px 14px;
        background:linear-gradient(135deg,rgba(67,97,238,0.08),rgba(76,201,240,0.08));
        border:1.5px dashed var(--primary,#4361ee); border-radius:10px;
        display:flex; align-items:flex-start; gap:10px;
        cursor:pointer; transition:all 0.2s ease; animation:ai-fadeInUp 0.3s ease;
    `;
    suggestionEl.innerHTML = `
        <span style="font-size:18px;flex-shrink:0;">🤖</span>
        <div style="flex:1;min-width:0;">
            <div style="font-size:11px;color:var(--primary,#4361ee);font-weight:600;margin-bottom:4px;">
                <i class="fas fa-lightbulb"></i> پیشنهاد هوش مصنوعی — کلیک کن تا اعمال بشه
            </div>
            <div style="font-size:13px;color:var(--gray-800,#1f2937);font-weight:500;direction:ltr;margin-bottom:3px;">
                ${this.escapeHtml(suggestion.example)}
            </div>
            <div style="font-size:12px;color:var(--gray-500,#6b7280);">
                ${this.escapeHtml(suggestion.translation)}
            </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
            <button id="ai-example-refresh" title="مثال جدید" style="
                background:rgba(67,97,238,0.1);border:1px solid rgba(67,97,238,0.3);
                border-radius:6px;cursor:pointer;color:var(--primary,#4361ee);
                font-size:12px;padding:3px 7px;white-space:nowrap;
            ">🔄 مثال جدید</button>
            <button id="ai-suggestion-close" title="بستن" style="
                background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);
                border-radius:6px;cursor:pointer;color:#ef4444;
                font-size:12px;padding:3px 7px;
            ">✕ بستن</button>
        </div>
    `;

    suggestionEl.addEventListener('click', (e) => {
        const refreshBtn = e.target.closest('#ai-example-refresh');
        const closeBtn = e.target.closest('#ai-suggestion-close');

        if (closeBtn) { suggestionEl.remove(); return; }

        if (refreshBtn) {
            const word = document.getElementById('german-word')?.value.trim();
            if (word) this.fetchAIExampleSuggestion(word, true);
            return;
        }

        // کلیک روی باکس → اعمال
        if (!document.getElementById('example')?.value.trim()) {
            document.getElementById('example').value = suggestion.example;
        }
        if (!document.getElementById('example-translation')?.value.trim()) {
            document.getElementById('example-translation').value = suggestion.translation;
        }
        suggestionEl.style.background = 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.05))';
        suggestionEl.style.borderColor = '#10b981';
        suggestionEl.style.cursor = 'default';
        suggestionEl.innerHTML = `
            <span>✅</span>
            <span style="font-size:13px;color:#10b981;font-weight:600;">مثال اعمال شد!</span>
        `;
        setTimeout(() => suggestionEl.remove(), 1500);
        this.updateFieldCount?.();
    });

    exampleGroup.appendChild(suggestionEl);
};

GermanDictionary.prototype.fetchAIVerbConjugation = async function(germanVerb, forceRefresh = false) {
    this._aiVerbWord = germanVerb;

    this.showAIVerbLoading(forceRefresh);

    const prompt = `صرف کامل فعل آلمانی "${germanVerb}" را بده.
فقط یک JSON برگردان، بدون هیچ توضیح اضافه:
{
  "present": "ich ...  /  du ...  /  er ...",
  "past": "ich ...",
  "perfect": "ich habe/bin ... + Partizip",
  "future": "ich werde ... + Infinitiv",
  "konjunktiv": "ich würde ...",
  "helper": "haben یا sein",
  "separable": true یا false
}`;

    try {
      const response = await this._puterChat(prompt, {});

        let rawText = '';
        if (response?.message?.content?.[0]?.text) rawText = response.message.content[0].text;
        else if (typeof response === 'string') rawText = response;
        else if (response?.text) rawText = response.text;
        else if (response?.message?.content) {
            rawText = Array.isArray(response.message.content)
                ? (response.message.content[0]?.text || '')
                : response.message.content;
        }

        let parsed;
        try {
            const clean = rawText.replace(/```json|```/g, '').trim();
            const jsonMatch = clean.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
        } catch {
            this.hideAIVerbLoading();
            return;
        }

        if (!parsed?.present) { this.hideAIVerbLoading(); return; }

        this._aiVerbSuggestion = parsed;

        const currentVal = document.getElementById('german-word')?.value.trim();
        if (currentVal === germanVerb || forceRefresh) {
            this.showAIVerbSuggestion(parsed);
        } else {
            this.hideAIVerbLoading();
        }

    } catch (err) {
        console.warn('AI verb fetch failed:', err);
        this.hideAIVerbLoading();
    }
};

GermanDictionary.prototype.showAIVerbLoading = function(isRefresh = false) {
    document.getElementById('ai-verb-suggestion')?.remove();
    const verbFields = document.getElementById('verb-fields');
    if (!verbFields || verbFields.style.display === 'none') return;

    const loadingEl = document.createElement('div');
    loadingEl.id = 'ai-verb-suggestion';
    loadingEl.style.cssText = `
        margin-top:10px; padding:10px 14px;
        background:linear-gradient(135deg,rgba(245,158,11,0.06),rgba(251,191,36,0.06));
        border:1.5px dashed #f59e0b; border-radius:10px;
        display:flex; align-items:center; gap:8px; opacity:0.8;
    `;
    loadingEl.innerHTML = `
        <span style="font-size:16px;animation:ai-spin 1s linear infinite;display:inline-block;">⏳</span>
        <span style="font-size:12px;color:#d97706;">
            ${isRefresh ? '🔄 در حال بروزرسانی صرف فعل...' : '🤖 در حال تحلیل صرف فعل...'}
        </span>
    `;
    verbFields.appendChild(loadingEl);
    this._injectAISuggestionStyles();
};

GermanDictionary.prototype.hideAIVerbLoading = function() {
    document.getElementById('ai-verb-suggestion')?.remove();
};

GermanDictionary.prototype.showAIVerbSuggestion = function(suggestion) {
    document.getElementById('ai-verb-suggestion')?.remove();
    const verbFields = document.getElementById('verb-fields');
    if (!verbFields || verbFields.style.display === 'none') return;

    const suggestionEl = document.createElement('div');
    suggestionEl.id = 'ai-verb-suggestion';
    suggestionEl.style.cssText = `
        margin-top:10px; padding:12px 14px;
        background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(251,191,36,0.05));
        border:1.5px dashed #f59e0b; border-radius:10px;
        animation:ai-fadeInUp 0.3s ease;
    `;

    const rows = [
        { label: 'Präsens (حال)', value: suggestion.present, icon: '🟢' },
        { label: 'Präteritum (گذشته)', value: suggestion.past, icon: '🟡' },
        { label: 'Perfekt (کامل)', value: suggestion.perfect, icon: '🔵' },
        { label: 'Futur I (آینده)', value: suggestion.future, icon: '🟣' },
        { label: 'Konjunktiv II (التزامی)', value: suggestion.konjunktiv, icon: '⚪' },
    ].filter(r => r.value);

    const helperText = suggestion.helper
        ? `<span style="background:rgba(245,158,11,0.15);padding:2px 8px;border-radius:5px;font-size:11px;color:#d97706;">
            فعل کمکی: <strong>${suggestion.helper}</strong>
           </span>`
        : '';

    const separableText = suggestion.separable === true
        ? `<span style="background:rgba(239,68,68,0.1);padding:2px 8px;border-radius:5px;font-size:11px;color:#ef4444;">جداشدنی ✓</span>`
        : '';

    suggestionEl.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
            <div style="font-size:11px;color:#d97706;font-weight:600;">
                <i class="fas fa-robot"></i> پیشنهاد صرف فعل — کلیک هر ردیف برای اعمال
            </div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                ${helperText} ${separableText}
                <button id="ai-verb-apply-all" style="
                    background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border:none;
                    border-radius:6px;cursor:pointer;font-size:11px;padding:3px 10px;font-weight:600;
                ">✅ اعمال همه</button>
                <button id="ai-verb-refresh" style="
                    background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.4);
                    border-radius:6px;cursor:pointer;color:#d97706;font-size:11px;padding:3px 8px;
                ">🔄 بروزرسانی</button>
                <button id="ai-verb-close" style="
                    background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);
                    border-radius:6px;cursor:pointer;color:#ef4444;font-size:11px;padding:3px 8px;
                ">✕</button>
            </div>
        </div>
        <div id="ai-verb-rows" style="display:flex;flex-direction:column;gap:4px;">
            ${rows.map(r => `
                <div class="ai-verb-row" data-field="${this._verbLabelToField(r.label)}" style="
                    display:flex;align-items:center;gap:8px;padding:5px 8px;
                    border-radius:7px;cursor:pointer;transition:background 0.15s;
                    border:1px solid transparent;
                " onmouseover="this.style.background='rgba(245,158,11,0.1)';this.style.borderColor='rgba(245,158,11,0.3)'"
                   onmouseout="this.style.background='';this.style.borderColor='transparent'">
                    <span style="font-size:13px;flex-shrink:0;">${r.icon}</span>
                    <span style="font-size:11px;color:#92400e;width:130px;flex-shrink:0;">${r.label}</span>
                    <span style="font-size:12px;color:#1f2937;direction:ltr;font-weight:500;flex:1;">${this.escapeHtml(r.value)}</span>
                    <span style="font-size:10px;color:#d97706;opacity:0.7;">← کلیک</span>
                </div>
            `).join('')}
        </div>
    `;

    // کلیک روی هر ردیف → فقط اون فیلد پر بشه
    suggestionEl.querySelectorAll('.ai-verb-row').forEach(row => {
        row.addEventListener('click', () => {
            const fieldId = row.dataset.field;
            const value = row.querySelector('span:nth-child(3)')?.textContent?.trim();
            if (!fieldId || !value) return;

            const input = document.getElementById(fieldId);
            if (input) {
                input.value = value;
                input.style.borderColor = '#10b981';
                setTimeout(() => input.style.borderColor = '', 1500);
                this.updateFieldCount?.();
            }

            row.style.background = 'rgba(16,185,129,0.1)';
            row.style.borderColor = '#10b981';
            row.querySelector('span:last-child').textContent = '✓';
        });
    });

    // اعمال همه
    suggestionEl.querySelector('#ai-verb-apply-all')?.addEventListener('click', () => {
        const fieldMap = {
            'verb-present': suggestion.present,
            'verb-past': suggestion.past,
            'verb-perfect': suggestion.perfect,
            'verb-future': suggestion.future,
            'verb-konjunktiv': suggestion.konjunktiv,
        };
        Object.entries(fieldMap).forEach(([id, val]) => {
            if (val) {
                const el = document.getElementById(id);
                if (el) { el.value = val; el.style.borderColor = '#10b981'; setTimeout(() => el.style.borderColor = '', 1500); }
            }
        });
        // فعل کمکی
        if (suggestion.helper) {
            const helperVal = suggestion.helper.toLowerCase().includes('sein') ? 'sein' : 'haben';
            const radio = document.querySelector(`input[name="verb-helper"][value="${helperVal}"]`);
            if (radio) radio.checked = true;
        }
        // جداشدنی
        if (suggestion.separable === true) {
            const sep = document.getElementById('verb-separable');
            if (sep) sep.checked = true;
        }
        this.updateFieldCount?.();

        suggestionEl.style.background = 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04))';
        suggestionEl.style.borderColor = '#10b981';
        suggestionEl.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
                <span>✅</span>
                <span style="font-size:13px;color:#10b981;font-weight:600;">همه فیلدهای فعل اعمال شد!</span>
            </div>
        `;
        setTimeout(() => suggestionEl.remove(), 1800);
    });

    // بروزرسانی
    suggestionEl.querySelector('#ai-verb-refresh')?.addEventListener('click', () => {
        const word = document.getElementById('german-word')?.value.trim();
        if (word) this.fetchAIVerbConjugation(word, true);
    });

    // بستن
    suggestionEl.querySelector('#ai-verb-close')?.addEventListener('click', () => suggestionEl.remove());

    verbFields.appendChild(suggestionEl);
};

GermanDictionary.prototype._verbLabelToField = function(label) {
    if (label.includes('Präsens') || label.includes('حال')) return 'verb-present';
    if (label.includes('Präteritum') || label.includes('گذشته')) return 'verb-past';
    if (label.includes('Perfekt') || label.includes('کامل')) return 'verb-perfect';
    if (label.includes('Futur') || label.includes('آینده')) return 'verb-future';
    if (label.includes('Konjunktiv') || label.includes('التزامی')) return 'verb-konjunktiv';
    return '';
};

GermanDictionary.prototype._injectAISuggestionStyles = function() {
    if (document.getElementById('ai-suggestion-style')) return;
    const style = document.createElement('style');
    style.id = 'ai-suggestion-style';
    style.textContent = `
        @keyframes ai-fadeInUp {
            from { opacity:0; transform:translateY(8px); }
            to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ai-spin {
            from { transform:rotate(0deg); }
            to   { transform:rotate(360deg); }
        }
        #ai-example-suggestion:hover {
            background: linear-gradient(135deg,rgba(67,97,238,0.13),rgba(76,201,240,0.13)) !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(67,97,238,0.15);
        }
        #ai-example-suggestion button,
        #ai-verb-suggestion button,
        #ai-verb-suggestion span,
        #ai-verb-suggestion div,
        #ai-example-suggestion span,
        #ai-example-suggestion div {
            font-family: 'Vazirmatn', 'Vazir', sans-serif !important;
        }
    `;
    document.head.appendChild(style);
};

GermanDictionary.prototype.showAIFillButton = function(word) {
    const btn = document.getElementById('ai-fill-all-btn');
    if (!btn || !word) return;
    // ذخیره لغت روی دکمه
    btn.dataset.word = word;
    btn.style.display = 'flex';
    btn.innerHTML = `<i class="fas fa-robot"></i> پر کردن با هوش مصنوعی`;
    btn.classList.remove('loading');
    // اطمینان از اینکه window.dict به این instance اشاره داره
    window.dict = this;
};

GermanDictionary.prototype.hideAIFillButton = function() {
    const btn = document.getElementById('ai-fill-all-btn');
    if (btn) btn.style.display = 'none';
};

GermanDictionary.prototype.aiSmartFillAll = async function() {
    const btn = document.getElementById('ai-fill-all-btn');
    const word = btn?.dataset.word || document.getElementById('german-word')?.value.trim();
    if (!word) return;

    // حالت loading
    btn.classList.add('loading');
    btn.innerHTML = `<span class="btn-spinner">⏳</span> در حال تحلیل...`;

    const activeType = document.querySelector('.type-card.active')?.dataset.type || 'noun';

    const prompt = `تحلیل کامل لغت آلمانی "${word}" را بده.
نوع فعلی که کاربر انتخاب کرده: ${activeType}
اگر نوع اشتباه بود، نوع صحیح را در فیلد "correct_type" بنویس.

⚠️ توجه مهم: تمام ترجمه‌های فارسی باید **فقط به زبان فارسی** باشند. از نوشتن ترجمه به چینی، روسی یا هر زبان دیگر خودداری کن.

⚠️ همه فیلدها را حتماً پر کن. هیچ فیلدی را خالی یا null نگذار مگر اینکه واقعاً وجود نداشته باشد.

فقط یک JSON برگردان، بدون هیچ توضیح اضافه:
{
  "word": "${word}",
  "correct_type": "noun یا verb یا adjective یا adverb یا preposition یا other",
  "persian_meaning": "معنی فارسی (کاملاً فارسی)",
  "pronunciation": "تلفظ آوانویسی مثل [haʊs] یا [ˈlɛʁnən]",
  "example": "جمله مثال آلمانی ساده A1-B1 (فقط آلمانی)",
  "example_translation": "ترجمه فارسی جمله (فقط فارسی)",
  "tags": "مثل A1,Alltag (با کاما)",
  "notes": "توضیحات اضافی، نکات گرامری، موارد استفاده، کلمات مرتبط و غیره (به فارسی - حداقل ۲ جمله)",

  "noun": {
    "gender": "masculine یا feminine یا neuter",
    "plural": "شکل جمع آلمانی مثل Hunde یا Häuser"
  },

  "verb": {
    "present": "صرف کامل حال: ich lerne, du lernst, er lernt, wir lernen, ihr lernt, sie lernen",
    "past": "صرف کامل گذشته: ich lernte, du lerntest, er lernte, wir lernten, ihr lerntet, sie lernten",
    "perfect": "فعل کمکی + Partizip II: ich habe gelernt یا ich bin gegangen",
    "future": "صرف کامل آینده: ich werde lernen, du wirst lernen, er wird lernen",
    "konjunktiv": "Konjunktiv II: ich würde lernen, du würdest lernen",
    "helper": "haben یا sein",
    "separable": true یا false
  },

  "adjective": {
    "komparativ": "حالت برتر مثل schöner",
    "superlativ": "حالت برترین مثل am schönsten",
    "antonym": "متضاد آلمانی مثل klein"
  },

  "adverb": {
    "type": "temporal یا lokal یا modal یا kausal",
    "meanings": "معانی مختلف فارسی با کاما مثل: سریع، به سرعت، تند"
  },

  "preposition": {
    "case": "Akkusativ یا Dativ یا Genitiv یا Wechsel",
    "meanings": "معانی مختلف فارسی با کاما مثل: برای، به خاطر، از طریق"
  }
}`;

    try {
        const response = await this._puterChat(prompt, {});
        let rawText = '';
        if (response?.message?.content?.[0]?.text) rawText = response.message.content[0].text;
        else if (typeof response === 'string') rawText = response;
        else if (response?.text) rawText = response.text;
        else if (response?.message?.content) {
            rawText = Array.isArray(response.message.content)
                ? (response.message.content[0]?.text || '') : response.message.content;
        }

        let parsed;
        try {
            const clean = rawText.replace(/```json|```/g, '').trim();
            const jsonMatch = clean.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
        } catch {
            btn.classList.remove('loading');
            btn.innerHTML = `<i class="fas fa-robot"></i> پر کردن با هوش مصنوعی`;
            this.showToast('❌ خطا در پردازش پاسخ AI', 'error');
            return;
        }

        // تصحیح نوع کلمه اگه لازم بود
        const correctType = parsed.correct_type || activeType;
        if (correctType !== activeType) {
            document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
            const correctCard = document.querySelector(`.type-card[data-type="${correctType}"]`);
            if (correctCard) {
                correctCard.classList.add('active');
                this.toggleTypeFields(correctType);
                const typeNames = { noun:'📘 اسم', verb:'⚡ فعل', adjective:'✨ صفت', adverb:'📌 قید', preposition:'🔗 حرف اضافه', other:'📎 سایر' };
                const typeBadge = document.getElementById('word-type-badge');
                if (typeBadge) typeBadge.innerHTML = typeNames[correctType] || '📘 اسم';
            }
        }

        // پر کردن فیلدهای مشترک (با اعتبارسنجی فارسی برای ترجمه مثال)
        this._setAlways('persian-meaning', parsed.persian_meaning);
        this._setAlways('pronunciation', parsed.pronunciation);
        this._setAlways('example', parsed.example);
        // اطمینان از فارسی بودن ترجمه مثال (در صورت امکان بازنویسی هوشمند)
        let exampleTrans = parsed.example_translation;
        if (exampleTrans && !/[آ-ی]/g.test(exampleTrans)) {
            // اگر ترجمه فارسی نبود، یک بار دیگر از AI بخواهید یا خالی بگذارید
            exampleTrans = '';
            console.warn('ترجمه مثال به فارسی نبود، خالی گذاشته شد');
        }
        this._setAlways('example-translation', exampleTrans);
        this._setAlways('word-tags', parsed.tags);
        
        // ========== پر کردن فیلد توضیحات (Notes) ==========
        // اگر AI توضیحات برگرداند، آن را قرار بده
        // اگر برنگرداند، یک توضیحات پیش‌فرض بساز
        let notesValue = parsed.notes;
        if (!notesValue || !notesValue.trim()) {
            // ساخت توضیحات پیش‌فرض از اطلاعات موجود
            const parts = [];
            if (parsed.persian_meaning) parts.push(`معنی: ${parsed.persian_meaning}`);
            if (parsed.correct_type) {
                const typeNames = {noun: 'اسم', verb: 'فعل', adjective: 'صفت', adverb: 'قید', preposition: 'حرف اضافه', other: 'سایر'};
                parts.push(`نوع: ${typeNames[parsed.correct_type] || parsed.correct_type}`);
            }
            if (parsed.example && parsed.example_translation) {
                parts.push(`مثال: ${parsed.example} — ${parsed.example_translation}`);
            }
            notesValue = parts.join(' • ');
        }
        if (notesValue && notesValue.trim()) {
            this._setAlways('word-notes', notesValue);
        }

        // پر کردن فیلدهای اختصاصی بر اساس نوع صحیح
        if (correctType === 'noun' && parsed.noun) {
            if (parsed.noun.gender) {
                document.querySelectorAll('.gender-option').forEach(opt => opt.classList.remove('active'));
                const gBtn = document.querySelector(`.gender-option[data-gender="${parsed.noun.gender}"]`);
                if (gBtn) gBtn.classList.add('active');
            }
            this._setAlways('noun-plural', parsed.noun.plural);
        }

        if (correctType === 'verb' && parsed.verb) {
            this._setAlways('verb-present', parsed.verb.present);
            this._setAlways('verb-past', parsed.verb.past);
            this._setAlways('verb-perfect', parsed.verb.perfect);
            this._setAlways('verb-future', parsed.verb.future);
            this._setAlways('verb-konjunktiv', parsed.verb.konjunktiv);
            if (parsed.verb.helper) {
                const hVal = parsed.verb.helper.toLowerCase().includes('sein') ? 'sein' : 'haben';
                const radio = document.querySelector(`input[name="verb-helper"][value="${hVal}"]`);
                if (radio) radio.checked = true;
            }
            if (parsed.verb.separable === true) {
                const sep = document.getElementById('verb-separable');
                if (sep) sep.checked = true;
            }
        }

        if (correctType === 'adjective' && parsed.adjective) {
            this._setAlways('adj-komparativ', parsed.adjective.komparativ);
            this._setAlways('adj-superlativ', parsed.adjective.superlativ);
            this._setAlways('adj-antonym', parsed.adjective.antonym);
        }

        if (correctType === 'preposition' && parsed.preposition) {
            if (parsed.preposition.case) {
                const prepCase = document.getElementById('prep-case');
                if (prepCase) prepCase.value = parsed.preposition.case;
            }
            this._setAlways('prep-meanings', parsed.preposition.meanings);
        }

        // پر کردن فیلدهای قید (Adverb)
        if (correctType === 'adverb' && parsed.adverb) {
            if (parsed.adverb.type) {
                const adverbType = document.getElementById('adverb-type');
                if (adverbType) adverbType.value = parsed.adverb.type;
            }
            this._setAlways('adverb-meanings', parsed.adverb.meanings);
        }

        // پاک کردن پیشنهادهای قدیمی inline
        document.getElementById('ai-example-suggestion')?.remove();
        document.getElementById('ai-verb-suggestion')?.remove();

        this.updateFieldCount?.();

        // دکمه → حالت موفق
        btn.classList.remove('loading');
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        btn.innerHTML = `<i class="fas fa-check-circle"></i> فیلدها پر شدند!`;
        setTimeout(() => {
            btn.style.background = '';
            btn.innerHTML = `<i class="fas fa-robot"></i> پر کردن با هوش مصنوعی`;
            btn.classList.remove('loading');
        }, 2500);

        const filledCount = document.querySelectorAll('#add-word-section .modern-input, #add-word-section textarea').length;
        this.showToast(`✅ ${filledCount} فیلد توسط هوش مصنوعی پر شد`, 'success');

    } catch (err) {
        console.warn('AI smart fill failed:', err);
        btn.classList.remove('loading');
        btn.innerHTML = `<i class="fas fa-robot"></i> پر کردن با هوش مصنوعی`;
        this.showToast('❌ خطا در اتصال به هوش مصنوعی', 'error');
    }
};

GermanDictionary.prototype._setIfEmpty = function(id, value) {
    if (!value) return;
    const el = document.getElementById(id);
    if (el && !el.value.trim()) {
        el.value = value;
        // flash سبز کوتاه
        el.style.borderColor = '#10b981';
        setTimeout(() => el.style.borderColor = '', 1200);
    }
};

GermanDictionary.prototype._setAlways = function(id, value) {
    if (!value) return;
    const el = document.getElementById(id);
    if (el) {
        el.value = value;
        el.style.borderColor = '#10b981';
        setTimeout(() => el.style.borderColor = '', 1200);
    }
};

GermanDictionary.prototype.setupTabs = function() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.onclick = (e) => {
            e.preventDefault();
            const tabId = tab.dataset.tab;
            
            // غیرفعال کردن همه تب‌ها
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // مخفی کردن همه محتواها
            contents.forEach(content => content.classList.remove('active'));
            
            // نمایش محتوای انتخاب شده
            const activeContent = document.getElementById(`${tabId}-content`);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        };
    });
};

