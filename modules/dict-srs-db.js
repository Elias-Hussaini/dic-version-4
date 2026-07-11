/* dict-srs-db.js — SRS Stubs & Database/IndexedDB (lines 917-1402) */

GermanDictionary.prototype.showNextFlashcard = function() {
    if (this.practiceSession.currentIndex >= this.practiceSession.words.length) {
        this.showPracticeResults();
        return;
    }

    const wordIndex = this.practiceSession.wordOrder[this.practiceSession.currentIndex];
    const word = this.practiceSession.words[wordIndex];
    const showGermanFirst = Math.random() > 0.5;
    const isGerman = LanguageSystem.isGerman();
    
    const container = document.getElementById('flashcards-section');
    
    const verbFormsHTML = word.verbForms ? `
        <div class="flashcard-verb-forms">
            <div class="flashcard-verb-item present">
                <div class="flashcard-verb-label">
                    <i class="fas fa-clock"></i> ${isGerman ? 'حال ساده' : 'Present'}
                </div>
                <div class="flashcard-verb-value">${word.verbForms.present || '—'}</div>
            </div>
            <div class="flashcard-verb-item past">
                <div class="flashcard-verb-label">
                    <i class="fas fa-history"></i> ${isGerman ? 'گذشته ساده' : 'Past'}
                </div>
                <div class="flashcard-verb-value">${word.verbForms.past || '—'}</div>
            </div>
            <div class="flashcard-verb-item perfect">
                <div class="flashcard-verb-label">
                    <i class="fas fa-check-double"></i> ${isGerman ? 'گذشته کامل' : 'Perfect'}
                </div>
                <div class="flashcard-verb-value">${word.verbForms.perfect || '—'}</div>
            </div>
        </div>
    ` : '';
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-layer-group"></i> ${LanguageSystem.t('practice.flashcards')}</h2>
                <span class="badge" style="font-size: 18px; padding: 10px 20px; background: linear-gradient(135deg, #667eea, #764ba2);">
                    ${this.practiceSession.currentIndex + 1} / ${this.practiceSession.words.length}
                </span>
            </div>
            
            <div class="flashcard" id="flashcard">
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <div class="flashcard-word" style="font-size: 36px; margin-bottom: 20px;">
                            ${showGermanFirst ? this.escapeHtml(word.german) : this.escapeHtml(word.persian)}
                        </div>
                        ${word.gender ? `<span class="word-gender ${word.gender}" style="font-size: 18px; padding: 8px 16px;">${this.getGenderSymbol(word.gender)}</span>` : ''}
                        ${word.type ? `<span class="word-type" style="font-size: 16px; padding: 6px 12px;">${this.getTypeLabel(word.type)}</span>` : ''}
                        <button class="btn btn-outline mt-4" id="flip-card-btn" style="padding: 12px 30px; font-size: 16px;">
                            <i class="fas fa-redo-alt"></i> ${isGerman ? 'نمایش پاسخ' : 'Show Answer'}
                        </button>
                    </div>
                    <div class="flashcard-back">
                        <div class="flashcard-word" style="font-size: 36px; margin-bottom: 20px;">
                            ${showGermanFirst ? this.escapeHtml(word.persian) : this.escapeHtml(word.german)}
                        </div>
                        ${word.gender ? `<span class="word-gender ${word.gender}" style="font-size: 18px; padding: 8px 16px;">${this.getGenderSymbol(word.gender)}</span>` : ''}
                        ${word.type ? `<span class="word-type" style="font-size: 16px; padding: 6px 12px;">${this.getTypeLabel(word.type)}</span>` : ''}
                        ${verbFormsHTML}
                        <div class="flashcard-actions mt-4" style="display: flex; gap: 15px; margin-top: 30px;">
                            <button class="btn btn-success" id="correct-btn" style="padding: 12px 30px; font-size: 16px;">
                                <i class="fas fa-check"></i> ${isGerman ? 'بلدم' : 'Know'}
                            </button>
                            <button class="btn btn-danger" id="incorrect-btn" style="padding: 12px 30px; font-size: 16px;">
                                <i class="fas fa-times"></i> ${isGerman ? 'نبلدم' : 'Don\'t Know'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="progress-bar mt-4" style="height: 10px; border-radius: 5px;">
                <div class="progress-fill" style="width: ${(this.practiceSession.currentIndex / this.practiceSession.words.length) * 100}%; height: 10px; border-radius: 5px;"></div>
            </div>
            
            <div style="text-align: center; margin-top: 15px; color: var(--gray-600);">
                <i class="fas fa-lightbulb"></i> ${isGerman ? 'روی کارت کلیک کن یا دکمه نمایش پاسخ رو بزن' : 'Click on the card or press Show Answer'}
            </div>
        </div>
    `;
    
    this.setupFlashcardEventListeners();
};

GermanDictionary.prototype.showWritingExercise = function() {
    if (this.writingSession.currentIndex >= this.writingSession.words.length) {
        this.showWritingResults();
        return;
    }

    const word = this.writingSession.words[this.writingSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    
    // بررسی وضعیت پاسخ این لغت
    const isAnsweredCorrect = word.userCorrect === true;
    const isAnsweredIncorrect = word.userCorrect === false;
    
    document.getElementById('practice-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-keyboard"></i> ${LanguageSystem.t('practice.writing')}</h2>
                <span class="badge" style="font-size: 18px; padding: 10px 20px; background: linear-gradient(135deg, #10b981, #059669);">
                    ${this.writingSession.currentIndex + 1} / ${this.writingSession.words.length}
                </span>
            </div>
            
            <div class="writing-exercise">
                <div class="word-to-translate" style="text-align: center; margin: 30px 0;">
                    <h3 style="font-size: 36px; color: var(--primary); margin-bottom: 10px;">${word.persian}</h3>
                    ${word.gender ? `<span class="word-gender ${word.gender}" style="font-size: 18px; padding: 8px 16px;">${this.getGenderSymbol(word.gender)}</span>` : ''}
                    ${word.type ? `<span class="word-type" style="font-size: 16px; padding: 6px 12px;">${this.getTypeLabel(word.type)}</span>` : ''}
                </div>
                
                <div style="max-width: 500px; margin: 0 auto;">
                    <input type="text" 
                           class="answer-input" 
                           id="writing-answer" 
                           placeholder="${isGerman ? 'ترجمه آلمانی را تایپ کنید...' : 'Type German translation...'}"
                           style="width: 100%; padding: 15px 20px; font-size: 18px; border: 2px solid var(--gray-200); border-radius: 12px; text-align: center; margin-bottom: 20px;"
                           autocomplete="off"
                           ${isAnsweredCorrect || isAnsweredIncorrect ? 'disabled' : ''}>
                    
                    <div class="action-buttons" style="display: flex; gap: 15px; justify-content: center;">
                        <button class="btn btn-success" id="check-writing-answer-btn" 
                                style="padding: 12px 30px; font-size: 16px;"
                                ${isAnsweredCorrect || isAnsweredIncorrect ? 'disabled' : ''}>
                            <i class="fas fa-check"></i> ${LanguageSystem.t('practice.check')}
                        </button>
                        <button class="btn btn-outline" id="show-hint-btn" style="padding: 12px 30px; font-size: 16px;">
                            <i class="fas fa-lightbulb"></i> ${LanguageSystem.t('practice.hint')}
                        </button>
                    </div>
                    
                    <!-- نمایش پیام فیدبک اگه قبلاً جواب داده شده -->
                    ${isAnsweredCorrect ? `
                        <div class="feedback-message feedback-correct" style="margin-top: 20px;">
                            <i class="fas fa-check-circle"></i> پاسخ صحیح! آفرین!
                        </div>
                    ` : isAnsweredIncorrect ? `
                        <div class="feedback-message feedback-incorrect" style="margin-top: 20px;">
                            <i class="fas fa-times-circle"></i> پاسخ صحیح: <strong>${word.german}</strong>
                        </div>
                    ` : ''}
                </div>
                
                <!-- نقطه‌های پیشرفت با رنگ صحیح -->
                <div class="progress-dots" style="display: flex; justify-content: center; gap: 12px; margin-top: 40px; flex-wrap: wrap;">
                    ${this.writingSession.words.map((w, index) => {
                        let dotClass = '';
                        if (index === this.writingSession.currentIndex) {
                            dotClass = 'active';
                        } else if (index < this.writingSession.currentIndex) {
                            // سبز برای درست، قرمز برای نادرست
                            dotClass = w.userCorrect === true ? 'completed correct' : 
                                      w.userCorrect === false ? 'completed incorrect' : 'completed';
                        }
                        return `<div class="progress-dot ${dotClass}" style="
                            width: 14px; 
                            height: 14px; 
                            border-radius: 50%; 
                            transition: all 0.3s ease;
                        "></div>`;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    // اگر قبلاً جواب داده شده، نیازی به ستاپ event listener نیست
    if (!isAnsweredCorrect && !isAnsweredIncorrect) {
        this.setupWritingExerciseEventListeners(word);
    } else {
        // فقط دکمه راهنمایی رو فعال کن
        document.getElementById('show-hint-btn')?.addEventListener('click', () => {
            this.showToast(`💡 راهنما: ${word.german.substring(0, 2)}...`, 'info');
        });
    }
};

GermanDictionary.prototype.normalizeAnswer = function(text) {
    if (!text) return '';
    
    return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')           // چند فاصله رو یکی کن
        .replace(/[،,.;:!?؟]/g, '')     // علائم نگارشی رو حذف کن
        .replace(/[\u200c]/g, ' ')      // نیم‌فاصله رو به فاصله تبدیل کن
        .trim();
};

GermanDictionary.prototype.initSRS = async function() {
    try {
        const savedSRS = localStorage.getItem('srsData');
        if (savedSRS) {
            this.srsData = JSON.parse(savedSRS);
        } else {
            this.srsData = {};
        }
        
        const savedUpdate = localStorage.getItem('lastSrsUpdate');
        if (savedUpdate) {
            this.lastSrsUpdate = new Date(savedUpdate);
        }
        
        // به روز رسانی لغات نیاز به مرور
        this.updateReviewWords();
        
        console.log('✅ سیستم SRS راه‌اندازی شد');
    } catch(e) {
        console.error('SRS init error:', e);
        this.srsData = {};
    }
};

GermanDictionary.prototype.saveSRSData = function() {
    localStorage.setItem('srsData', JSON.stringify(this.srsData));
    localStorage.setItem('lastSrsUpdate', new Date().toISOString());
};

GermanDictionary.prototype.updateReviewWords = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.reviewWords = [];
    
    for (const [wordId, data] of Object.entries(this.srsData)) {
        const nextReview = new Date(data.nextReviewDate);
        nextReview.setHours(0, 0, 0, 0);
        
        if (nextReview <= today) {
            this.reviewWords.push(parseInt(wordId));
        }
    }
    
    // حذف آیدی‌های تکراری
    this.reviewWords = [...new Set(this.reviewWords)];
    
    localStorage.setItem('srsReviewCount', this.reviewWords.length);
    console.log(`📚 تعداد لغات نیاز به مرور امروز: ${this.reviewWords.length}`);
};

GermanDictionary.prototype.checkWritingAnswer = async function() {
    const userAnswer = document.getElementById('writing-answer').value.trim();
    const currentWord = this.writingSession.words[this.writingSession.currentIndex];
    
    if (!userAnswer) {
        this.showToast('✏️ لطفاً پاسخ را وارد کنید', 'warning');
        return;
    }
    
    // نرمالایز کردن هر دو پاسخ
    const normalizedUser = this.normalizeAnswer(userAnswer);
    const normalizedCorrect = this.normalizeAnswer(currentWord.german);
    
    console.log('📝 مقایسه:', {
        کاربر: userAnswer,
        'کاربر (نرمال)': normalizedUser,
        صحیح: currentWord.german,
        'صحیح (نرمال)': normalizedCorrect
    });
    
    const isCorrect = normalizedUser === normalizedCorrect;
    
    await this.recordPractice(currentWord.id, isCorrect);
    
    const answerInput = document.getElementById('writing-answer');
    
    if (isCorrect) {
        this.writingSession.score++;
        this.showToast('✅ آفرین! ترجمه صحیح است', 'success');
        
        // سبز کردن اینپوت
        answerInput.style.borderColor = 'var(--success)';
        answerInput.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        
        // حذف راهنمای قبلی
        const oldHint = document.querySelector('.correct-answer-hint');
        if (oldHint) oldHint.remove();
        
    } else {
        this.showToast(`❌ پاسخ صحیح: ${currentWord.german}`, 'error');
        
        // قرمز کردن اینپوت
        answerInput.style.borderColor = 'var(--danger)';
        answerInput.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        
        // نمایش پاسخ صحیح
        const hint = document.createElement('div');
        hint.className = 'correct-answer-hint';
        hint.style.marginTop = '10px';
        hint.style.padding = '10px';
        hint.style.background = 'rgba(239, 68, 68, 0.1)';
        hint.style.borderRadius = '8px';
        hint.style.color = 'var(--danger)';
        hint.style.textAlign = 'center';
        hint.innerHTML = `✅ پاسخ صحیح: <strong>${currentWord.german}</strong>`;
        
        const oldHint = document.querySelector('.correct-answer-hint');
        if (oldHint) oldHint.remove();
        
        answerInput.parentNode.appendChild(hint);
    }
    
    // رفتن به سوال بعدی با تاخیر
    setTimeout(() => {
        this.writingSession.currentIndex++;
        this.showWritingExercise();
    }, 2000);
};

GermanDictionary.prototype.initDB = function() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 6);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const oldVersion = event.oldVersion;
            
            console.log(`🔄 ارتقاء دیتابیس از نسخه ${oldVersion} به 6`);
            
            // ========== Object Store کلمات ==========
            if (!db.objectStoreNames.contains('words')) {
                const wordStore = db.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
                wordStore.createIndex('german', 'german', { unique: true });
                wordStore.createIndex('persian', 'persian', { unique: false });
                wordStore.createIndex('type', 'type', { unique: false });
                wordStore.createIndex('gender', 'gender', { unique: false });
                wordStore.createIndex('createdAt', 'createdAt', { unique: false });
                console.log('✅ ObjectStore کلمات ایجاد شد');
            }
            
            // ========== ObjectStore علاقه‌مندی‌ها ==========
            if (!db.objectStoreNames.contains('favorites')) {
                db.createObjectStore('favorites', { keyPath: 'wordId' });
                console.log('✅ ObjectStore علاقه‌مندی‌ها ایجاد شد');
            }
            
            // ========== ObjectStore مثال‌ها ==========
            if (!db.objectStoreNames.contains('examples')) {
                const exStore = db.createObjectStore('examples', { keyPath: 'id', autoIncrement: true });
                exStore.createIndex('wordId', 'wordId', { unique: false });
                console.log('✅ ObjectStore مثال‌ها ایجاد شد');
            }
            
            // ========== ObjectStore تاریخچه تمرین ==========
            if (!db.objectStoreNames.contains('practiceHistory')) {
                const phStore = db.createObjectStore('practiceHistory', { keyPath: 'id', autoIncrement: true });
                phStore.createIndex('wordId', 'wordId', { unique: false });
                phStore.createIndex('date', 'date', { unique: false });
                phStore.createIndex('correct', 'correct', { unique: false });
                console.log('✅ ObjectStore تاریخچه تمرین ایجاد شد');
            }
            
            // ========== ObjectStore تاریخچه چت ==========
            if (!db.objectStoreNames.contains('chatHistory')) {
                const chatStore = db.createObjectStore('chatHistory', { keyPath: 'id' });
                chatStore.createIndex('savedAt', 'savedAt', { unique: false });
                chatStore.createIndex('chatId', 'chatId', { unique: false });
                console.log('✅ ObjectStore تاریخچه چت ایجاد شد');
            }
            
            // ========== ObjectStore موسیقی ==========
            if (!db.objectStoreNames.contains('music')) {
                const musicStore = db.createObjectStore('music', { keyPath: 'id', autoIncrement: true });
                musicStore.createIndex('name', 'name', { unique: false });
                musicStore.createIndex('uploadDate', 'uploadDate', { unique: false });
                console.log('✅ ObjectStore موسیقی ایجاد شد');
            }
            
            // ========== ObjectStore کتاب‌ها (جدید) ==========
            if (!db.objectStoreNames.contains('books')) {
                const bookStore = db.createObjectStore('books', { keyPath: 'id' });
                bookStore.createIndex('title', 'title', { unique: false });
                bookStore.createIndex('author', 'author', { unique: false });
                bookStore.createIndex('createdAt', 'createdAt', { unique: false });
                console.log('✅ ObjectStore کتاب‌ها ایجاد شد');
            }
        };
        
        request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log('✅ دیتابیس متصل شد');
            resolve();
        };
        
        request.onerror = (event) => {
            console.error('❌ خطای دیتابیس:', event.target.error);
            reject(event.target.error);
        };
    });
};

GermanDictionary.prototype.getAllWords = async function() {
        // ✔️ PERF: کش ۳ ثانیه‌ای — جلوگیری از اسکن مکرر DB
        var CACHE_TTL = 3000;
        if (this._allWordsCache && (Date.now() - (this._allWordsCacheAt || 0)) < CACHE_TTL) {
            return this._allWordsCache;
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve([]);
                return;
            }

            try {
                const transaction = this.db.transaction(['words'], 'readonly');
                const store = transaction.objectStore('words');
                const request = store.getAll();
                
                request.onsuccess = () => {
                    var result = request.result || [];
                    this._allWordsCache = result;
                    this._allWordsCacheAt = Date.now();
                    resolve(result);
                };
                request.onerror = (event) => {
                    console.error('خطا در getAllWords:', event.target.error);
                    resolve([]);
                };
            } catch (error) {
                console.error('خطا در getAllWords:', error);
                resolve([]);
            }
        });
};

// ✔️ NEW: پاک کردن کش getAllWords (وقتی کلمه‌ای اضافه/حذف/ویرایش می‌شود)
GermanDictionary.prototype._invalidateAllWordsCache = function() {
    this._allWordsCache = null;
    this._allWordsCacheAt = 0;
};

GermanDictionary.prototype.updateWord = async function(wordData) {
    this._invalidateAllWordsCache && this._invalidateAllWordsCache();
    return new Promise((resolve, reject) => {
        if (!this.db) {
            reject(new Error('دیتابیس در دسترس نیست'));
            return;
        }
        try {
            const transaction = this.db.transaction(['words'], 'readwrite');
            const store = transaction.objectStore('words');
            
            // دریافت کلمه فعلی
            const getRequest = store.get(wordData.id);
            getRequest.onsuccess = () => {
                const existing = getRequest.result;
                if (!existing) {
                    reject(new Error('لغت یافت نشد'));
                    return;
                }
                
                // ادغام داده‌های جدید با داده‌های موجود
                const updated = Object.assign({}, existing, wordData);
                updated.updatedAt = new Date().toISOString();
                
                const putRequest = store.put(updated);
                putRequest.onsuccess = () => {
                    console.log('✅ لغت به‌روزرسانی شد:', updated.german);
                    resolve(updated);
                };
                putRequest.onerror = (e) => reject(e.target.error);
            };
            getRequest.onerror = (e) => reject(e.target.error);
        } catch (error) {
            reject(error);
        }
    });
};

GermanDictionary.prototype.deleteWord = async function(wordId) {
    this._invalidateAllWordsCache && this._invalidateAllWordsCache();
    return new Promise((resolve, reject) => {
        if (!this.db) {
            reject(new Error('دیتابیس در دسترس نیست'));
            return;
        }
        const transaction = this.db.transaction(['words', 'favorites', 'examples', 'practiceHistory'], 'readwrite');
        
        // حذف از words
        transaction.objectStore('words').delete(wordId);
        
        // حذف از favorites
        try { transaction.objectStore('favorites').delete(wordId); } catch(e) {}
        
        // حذف examples مرتبط
        try {
            const exStore = transaction.objectStore('examples');
            const exIndex = exStore.index('wordId');
            const exRequest = exIndex.getAll(wordId);
            exRequest.onsuccess = () => {
                (exRequest.result || []).forEach(ex => exStore.delete(ex.id));
            };
        } catch(e) {}
        
        // حذف practiceHistory مرتبط
        try {
            const phStore = transaction.objectStore('practiceHistory');
            const phIndex = phStore.index('wordId');
            const phRequest = phIndex.getAll(wordId);
            phRequest.onsuccess = () => {
                (phRequest.result || []).forEach(ph => phStore.delete(ph.id));
            };
        } catch(e) {}
        
        transaction.oncomplete = () => {
            console.log('✅ لغت و داده‌های مرتبط حذف شد:', wordId);
            // حذف از SRS و favorites در حافظه
            if (this.favorites) this.favorites.delete(wordId);
            if (this.srsData) delete this.srsData[wordId];
            resolve();
        };
        transaction.onerror = (e) => reject(e.target.error);
    });
};

GermanDictionary.prototype.getWord = async function(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['words'], 'readonly');
            const store = transaction.objectStore('words');
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
};

GermanDictionary.prototype.getWordsByRange = async function(start, end) {
        const allWords = await this.getAllWords();
        const sortedWords = allWords.sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        const startIndex = Math.max(0, start - 1);
        const endIndex = Math.min(sortedWords.length, end);
        
        return sortedWords.slice(startIndex, endIndex);
};

GermanDictionary.prototype.searchWords = async function(query) {
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['words'], 'readonly');
        const store = transaction.objectStore('words');
        const request = store.getAll();
        
        request.onsuccess = () => {
            const searchTerm = query.toLowerCase().trim();
            
            const words = request.result.filter(word => {
                const german = word.german.toLowerCase();
                const persian = word.persian.toLowerCase();
                
                // جستجو در ابتدای کلمه آلمانی
                const germanStarts = german.startsWith(searchTerm);
                // جستجو در هر جای کلمه آلمانی
                const germanIncludes = german.includes(searchTerm);
                // جستجو در معنی فارسی
                const persianIncludes = persian.includes(searchTerm);
                
                return germanStarts || germanIncludes || persianIncludes;
            });
            
            console.log(`🔍 جستجو برای "${query}" - ${words.length} نتیجه پیدا شد`);
            resolve(words);
        };
        
        request.onerror = (event) => reject(event.target.error);
    });
};

