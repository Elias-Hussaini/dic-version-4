/* dict-renderers.js — Section Renderers & Translate Listeners (lines 563-917) */

GermanDictionary.prototype.renderSearchSection = function() {
    const container = document.getElementById('search-section');
    if (!container) return;

    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-search" style="color: var(--primary);"></i> جستجوی پیشرفته لغات</h2>
            </div>

            <div class="search-box">
                <input type="text" id="search-input" class="form-control"
                       placeholder="لغت آلمانی یا فارسی را جستجو کنید..." autofocus>
                <button id="search-btn" class="btn btn-primary" aria-label="جستجو">
                    <i class="fas fa-search" aria-hidden="true"></i><span class="btn-text"> جستجو</span>
                </button>
            </div>

            <div id="search-results-container">
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <h3>به DE.Dictionary خوش آمدید!</h3>
                    <p>برای شروع، یک لغت را جستجو کنید یا از منوی شناور استفاده کنید.</p>
                    <div class="empty-state-hint">
                        <i class="fas fa-arrow-circle-left"></i>
                        <span>دکمه کتاب در گوشه سمت چپ پایین</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = `
    <div class="word-card">
        <div class="section-header">
            <h2><i class="fas fa-search" style="color: var(--primary);"></i> ${LanguageSystem.t('search.title')}</h2>
        </div>

        <div class="search-box">
            <input type="text" id="search-input" class="form-control"
                   placeholder="${LanguageSystem.t('search.placeholder')}" autofocus>
            <button id="search-btn" class="btn btn-primary" aria-label="جستجو">
                <i class="fas fa-search" aria-hidden="true"></i><span class="btn-text"> ${LanguageSystem.t('menu.search')}</span>
            </button>
        </div>

        <div id="search-results-container">
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <h3>${LanguageSystem.t('search.welcome')}</h3>
                <p>برای شروع، یک لغت را جستجو کنید یا از منوی شناور استفاده کنید.</p>
                <div class="empty-state-hint">
                    <i class="fas fa-arrow-circle-left"></i>
                    <span>دکمه کتاب در گوشه سمت چپ پایین</span>
                </div>
            </div>
        </div>
    </div>
`;
    // ستاپ event listenerها
    this.setupSearchEventListeners();
};

GermanDictionary.prototype.renderAddWordSection = function() {
 
    return;
};

GermanDictionary.prototype.renderTranslate = function() {
    console.log('🎨 رندر بخش مترجم...');
    
    const container = document.getElementById('translate-section');
    if (!container) {
        console.error('❌ translate-section پیدا نشد');
        return;
    }
    
    const isGerman = LanguageSystem.isGerman();
    
    // مقدار پیش‌فرض برای direction
    const defaultDirection = 'de-fa';
    const secondDirection = 'fa-de';
    
    // ریست کردن فلگ اتصال رویدادها
    this._translateEventsSetup = false;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-language" style="color: var(--primary);"></i> ${LanguageSystem.t('translate.title')}</h2>
            </div>
            
            <div id="online-status" class="online-status online">
                <i class="fas fa-wifi"></i> آنلاین - سرویس‌های ترجمه فعال
            </div>
            
            <div class="direction-selector">
                <div class="direction-option active" data-direction="${defaultDirection}">
                    <div class="direction-icon">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="direction-text">
                        <span class="direction-title">${LanguageSystem.t('translate.deToFa')}</span>
                        <span class="direction-subtitle">Deutsch → فارسی</span>
                    </div>
                    <div class="direction-check">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <div class="direction-option" data-direction="${secondDirection}">
                    <div class="direction-icon">
                        <i class="fas fa-arrow-left"></i>
                    </div>
                    <div class="direction-text">
                        <span class="direction-title">${LanguageSystem.t('translate.faToDe')}</span>
                        <span class="direction-subtitle">فارسی → Deutsch</span>
                    </div>
                    <div class="direction-check">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label id="input-label">
                    <i class="fas fa-keyboard"></i>
                    <span id="input-title">${LanguageSystem.t('translate.sourceText')}</span>
                </label>
                <div class="input-with-clear">
                    <textarea id="translate-input" class="form-control" rows="3" 
                              placeholder="${isGerman ? 'متن آلمانی خود را وارد کنید...' : 'Enter German text...'}" 
                              dir="ltr"></textarea>
                    <button class="clear-input" id="clear-input-btn" title="پاک کردن متن">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <label id="output-label">
                    <i class="fas fa-language"></i>
                    <span id="output-title">${LanguageSystem.t('translate.targetText')}</span>
                </label>
                <div id="translate-result" class="translate-result">
                    <div class="empty-result">
                        <div class="empty-icon">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                        <p>نتیجه ترجمه اینجا نمایش داده می‌شود</p>
                        <small>متن را وارد کنید</small>
                    </div>
                </div>
            </div>
            
            <div class="translate-actions">
                <div class="action-group">
                    <button class="action-btn voice-btn" id="speak-input">
                        <i class="fas fa-volume-up"></i> <span>${LanguageSystem.t('translate.speak')}</span>
                    </button>
                    <button class="action-btn voice-btn" id="speak-output">
                        <i class="fas fa-volume-up"></i> <span>${LanguageSystem.t('translate.speak')}</span>
                    </button>
                </div>
                <div class="action-group">
                    <button class="action-btn copy-btn" id="copy-result">
                        <i class="fas fa-copy"></i> <span>${LanguageSystem.t('translate.copy')}</span>
                    </button>
                    <button class="action-btn save-btn" id="save-translation">
                        <i class="fas fa-magic"></i> <span>${LanguageSystem.t('translate.smartSave')}</span>
                    </button>
                </div>
            </div>
            
            <div id="translate-suggestions" class="translate-suggestions" style="display: none;">
                <div class="suggestions-header">
                    <i class="fas fa-lightbulb"></i>
                    <span>پیشنهادات مشابه</span>
                </div>
                <div class="suggestions-list" id="suggestions-list"></div>
            </div>
        </div>
    `;
    
    // به‌روزرسانی UI
    this.updateTranslateUI();
    
    // ========== راه‌اندازی رویدادها با تاخیر مناسب ==========
    setTimeout(() => {
        this.setupTranslateEventListeners();
    }, 200);
    
    console.log('✅ رندر مترجم کامل شد');
};

GermanDictionary.prototype.setupTranslateEventListeners = function(retryCount = 0) {
    const MAX_RETRIES = 5; // کاهش به 5 بار
    
    // چک کن ببینیم اصلاً المنت translate-section وجود داره یا نه
    const translateSection = document.getElementById('translate-section');
    if (!translateSection) {
        if (retryCount < MAX_RETRIES) {
            setTimeout(() => this.setupTranslateEventListeners(retryCount + 1), 300);
        }
        return;
    }
    
    // اگه المنت‌های مترجم داخل translate-section نیست، صبر کن
    const directionOptions = translateSection.querySelectorAll('.direction-option');
    const translateInput = translateSection.querySelector('#translate-input');
    
    if ((!translateInput || directionOptions.length === 0) && retryCount < MAX_RETRIES) {
        setTimeout(() => this.setupTranslateEventListeners(retryCount + 1), 300);
        return;
    }
    
    // جلوگیری از اتصال مجدد
    if (this._translateEventsSetup) return;
    this._translateEventsSetup = true;
    
    console.log('✅ اتصال رویدادهای مترجم...');
    
    // ========== 1. انتخاب جهت ترجمه ==========
    directionOptions.forEach(option => {
        const newOption = option.cloneNode(true);
        option.parentNode.replaceChild(newOption, option);
        
        newOption.onclick = (e) => {
            e.preventDefault();
            const newDirection = newOption.dataset.direction;
            if (this.translateDirection === newDirection) return;
            
            this.translateDirection = newDirection;
            document.querySelectorAll('.direction-option').forEach(opt => opt.classList.remove('active'));
            newOption.classList.add('active');
            this.updateTranslateUI();
            
            const inputField = document.getElementById('translate-input');
            const resultDiv = document.getElementById('translate-result');
            if (inputField) inputField.value = '';
            if (resultDiv) {
                resultDiv.innerHTML = `<div class="empty-result"><div class="empty-icon"><i class="fas fa-exchange-alt"></i></div><p>نتیجه ترجمه اینجا نمایش داده می‌شود</p><small>متن را وارد کنید</small></div>`;
            }
        };
    });
    
    // ========== 2. ترجمه خودکار ==========
    const currentTranslateInput = document.getElementById('translate-input');
    let debounceTimer;
    
    if (currentTranslateInput) {
        const newInput = currentTranslateInput.cloneNode(true);
        currentTranslateInput.parentNode.replaceChild(newInput, currentTranslateInput);
        
        newInput.oninput = (e) => {
            const text = e.target.value.trim();
            clearTimeout(debounceTimer);
            if (text.length > 2) {
                debounceTimer = setTimeout(() => this.performAutoTranslation(text), 800);
            } else if (text.length === 0) {
                const resultDiv = document.getElementById('translate-result');
                if (resultDiv) {
                    resultDiv.innerHTML = `<div class="empty-result"><div class="empty-icon"><i class="fas fa-exchange-alt"></i></div><p>نتیجه ترجمه اینجا نمایش داده می‌شود</p><small>متن را وارد کنید</small></div>`;
                }
            }
        };
        
        newInput.onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const text = e.target.value.trim();
                if (text) this.performAutoTranslation(text);
            }
        };
    }
    
    // ========== 3. دکمه پاک کردن ==========
    const clearBtn = document.getElementById('clear-input-btn');
    if (clearBtn) {
        const newBtn = clearBtn.cloneNode(true);
        clearBtn.parentNode.replaceChild(newBtn, clearBtn);
        newBtn.onclick = () => {
            const inputField = document.getElementById('translate-input');
            if (inputField) {
                inputField.value = '';
                inputField.focus();
            }
            const resultDiv = document.getElementById('translate-result');
            if (resultDiv) {
                resultDiv.innerHTML = `<div class="empty-result"><div class="empty-icon"><i class="fas fa-exchange-alt"></i></div><p>نتیجه ترجمه اینجا نمایش داده می‌شود</p><small>متن را وارد کنید</small></div>`;
            }
        };
    }
    
    // ========== 4. دکمه تلفظ ==========
    const speakInput = document.getElementById('speak-input');
    if (speakInput) {
        const newBtn = speakInput.cloneNode(true);
        speakInput.parentNode.replaceChild(newBtn, speakInput);
        newBtn.onclick = () => {
            const inputField = document.getElementById('translate-input');
            const text = inputField?.value.trim();
            if (text) {
                const lang = this.translateDirection === 'de-fa' ? 'de-DE' : 'fa-IR';
                this.speakText(text, lang);
            }
        };
    }
    
    const speakOutput = document.getElementById('speak-output');
    if (speakOutput) {
        const newBtn = speakOutput.cloneNode(true);
        speakOutput.parentNode.replaceChild(newBtn, speakOutput);
        newBtn.onclick = () => {
            const resultDiv = document.getElementById('translate-result');
            const text = resultDiv?.querySelector('.result-text p')?.textContent || '';
            if (text) {
                const lang = this.translateDirection === 'de-fa' ? 'fa-IR' : 'de-DE';
                this.speakText(text, lang);
            }
        };
    }
    
    // ========== 5. دکمه کپی ==========
    const copyBtn = document.getElementById('copy-result');
    if (copyBtn) {
        const newBtn = copyBtn.cloneNode(true);
        copyBtn.parentNode.replaceChild(newBtn, copyBtn);
        newBtn.onclick = async () => {
            const resultDiv = document.getElementById('translate-result');
            const text = resultDiv?.querySelector('.result-text p')?.textContent || '';
            if (text) {
                try {
                    await navigator.clipboard.writeText(text);
                    this.showToast('✅ ترجمه کپی شد', 'success');
                } catch (error) {
                    this.showToast('❌ خطا در کپی', 'error');
                }
            }
        };
    }
    
    // ========== 6. دکمه ذخیره ==========
    const saveBtn = document.getElementById('save-translation');
    if (saveBtn) {
        const newBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newBtn, saveBtn);
        newBtn.onclick = () => this.saveTranslationWithAutoAnalysis();
    }
};

