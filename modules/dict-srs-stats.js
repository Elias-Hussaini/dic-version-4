/* dict-srs-stats.js — SRS Recording, Stats, Achievements (lines 12939-14020) */

GermanDictionary.prototype.recordPractice = async function(wordId, correct) {
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['practiceHistory'], 'readwrite');
        const store = transaction.objectStore('practiceHistory');
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateOnly = `${year}-${month}-${day}`;
        
        const record = {
            wordId,
            correct,
            date: dateOnly,
            timestamp: now.toISOString()
        };
        
        const request = store.add(record);
        
        request.onsuccess = () => {
            // ========== سیستم SRS ==========
            this.updateSRS(wordId, correct);
            this.updateReviewWords();
            this.updateStats();
            resolve();
        };
        
        request.onerror = (event) => reject(event.target.error);
    });
};

GermanDictionary.prototype.updateSRS = function(wordId, correct) {
    if (!this.srsData[wordId]) {
        // مقداردهی اولیه برای لغت جدید
        this.srsData[wordId] = {
            level: 0,           // سطح SRS (0-5)
            correctCount: 0,    // تعداد پاسخ صحیح متوالی
            wrongCount: 0,      // تعداد پاسخ غلط
            lastPractice: new Date().toISOString(),
            nextReviewDate: new Date().toISOString(),
            totalCorrect: 0,
            totalWrong: 0
        };
    }
    
    const data = this.srsData[wordId];
    const now = new Date();
    
    // بروزرسانی آمار کلی
    if (correct) {
        data.correctCount++;
        data.totalCorrect++;
        data.wrongCount = 0;
    } else {
        data.wrongCount++;
        data.totalWrong++;
        data.correctCount = 0;
    }
    
    // محاسبه سطح جدید بر اساس عملکرد
    if (correct) {
        if (data.correctCount >= 5 && data.level < 5) data.level = 5;
        else if (data.correctCount >= 4 && data.level < 4) data.level = 4;
        else if (data.correctCount >= 3 && data.level < 3) data.level = 3;
        else if (data.correctCount >= 2 && data.level < 2) data.level = 2;
        else if (data.correctCount >= 1 && data.level < 1) data.level = 1;
    } else {
        // اگر غلط زد، سطح کاهش پیدا میکنه
        if (data.wrongCount >= 2) {
            data.level = Math.max(0, data.level - 1);
            data.correctCount = 0;
        }
    }
    
    // محاسبه تاریخ مرور بعدی بر اساس سطح
    const intervals = [1, 2, 4, 7, 14, 30]; // روزهای بین مرورها
    const daysToAdd = intervals[data.level] || 1;
    
    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + daysToAdd);
    data.nextReviewDate = nextReview.toISOString();
    data.lastPractice = now.toISOString();
    
    this.srsData[wordId] = data;
    this.saveSRSData();
};

GermanDictionary.prototype.getPracticeHistory = async function(wordId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['practiceHistory'], 'readonly');
            const store = transaction.objectStore('practiceHistory');
            const index = store.index('wordId');
            const request = index.getAll(wordId);
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (event) => {
                console.error('خطا در دریافت تاریخچه تمرین:', event.target.error);
                resolve([]);
            };
        });
};

GermanDictionary.prototype.getAllPracticeHistory = async function() {
    return new Promise((resolve, reject) => {
        if (!this.db) {
            resolve([]);
            return;
        }

        try {
            const transaction = this.db.transaction(['practiceHistory'], 'readonly');
            const store = transaction.objectStore('practiceHistory');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const history = request.result || [];
                // اطمینان از فرمت صحیح تاریخ‌ها
                history.forEach(record => {
                    if (record.date && record.date.includes('T')) {
                        record.date = record.date.split('T')[0];
                    }
                });
                resolve(history);
            };
            
            request.onerror = (event) => {
                console.error('خطا در دریافت تاریخچه تمرین:', event.target.error);
                resolve([]);
            };
        } catch (error) {
            console.error('خطا در getAllPracticeHistory:', error);
            resolve([]);
        }
    });
};

GermanDictionary.prototype.updateStats = async function() {
    if (!this.db) {
        setTimeout(() => this.updateStats(), 500);
        return;
    }
    
    try {
        const words = await this.getAllWords();
        const practiceHistory = await this.getAllPracticeHistory();
        const isGerman = LanguageSystem.isGerman();
        
        const totalWords = words.length;
        const totalFavorites = this.favorites.size;
        const totalPractice = practiceHistory.length;
        const correctPractice = practiceHistory.filter(h => h.correct).length;
        const accuracy = totalPractice > 0 ? Math.round((correctPractice / totalPractice) * 100) : 0;
        
        const today = new Date().toISOString().split('T')[0];
        const todayPractice = practiceHistory.filter(h => h.date.split('T')[0] === today).length;
        
        // ========== فقط آپدیت stats-grid (بقیه را حذف نکن) ==========
        const statsGrid = document.getElementById('stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-title">${isGerman ? 'میزان دقت' : 'Accuracy'}</div>
                    <div class="stat-value">${accuracy}%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-title">${isGerman ? 'کل لغات' : 'Total Words'}</div>
                    <div class="stat-value">${totalWords}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-title">${isGerman ? 'علاقه‌مندی‌ها' : 'Favorites'}</div>
                    <div class="stat-value">${totalFavorites}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-title">${isGerman ? 'تمرین امروز' : 'Today\'s Practice'}</div>
                    <div class="stat-value">${todayPractice}</div>
                </div>
            `;
        }
        
        // ========== رندر فعالیت هفتگی (بدون بازنویسی کل) ==========
        this.renderWeeklyProgress(practiceHistory);
        
        // ========== رندر دستاوردها ==========
        this.renderAchievements(totalWords, totalPractice, accuracy);
        
        // ========== رندر فعالیت اخیر ==========
        await this.renderRecentActivity(practiceHistory);
        
        // ========== راه‌اندازی آمار سفارشی (فقط یک بار) ==========
        if (!this.customStatsInitialized) {
            this.setupCustomStats();
            this.customStatsInitialized = true;
        }
        
    } catch (error) {
        console.error('❌ خطا در آپدیت آمار:', error);
    }
};

GermanDictionary.prototype.renderWeeklyProgress = function(practiceHistory) {
    const container = document.getElementById('weekly-progress');
    if (!container) return;
    
    const isGerman = LanguageSystem.isGerman();
    const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
    const weekIcons = ['fa-calendar-day', 'fa-sun', 'fa-moon', 'fa-star', 'fa-cloud', 'fa-umbrella', 'fa-heart'];
    
    const today = new Date();
    const jsDay = today.getDay();
    
    let persianTodayIndex;
    switch(jsDay) {
        case 0: persianTodayIndex = 1; break;
        case 1: persianTodayIndex = 2; break;
        case 2: persianTodayIndex = 3; break;
        case 3: persianTodayIndex = 4; break;
        case 4: persianTodayIndex = 5; break;
        case 5: persianTodayIndex = 6; break;
        case 6: persianTodayIndex = 0; break;
        default: persianTodayIndex = 0;
    }
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - persianTodayIndex);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        let practiceCount = 0;
        if (practiceHistory && practiceHistory.length > 0) {
            practiceCount = practiceHistory.filter(record => {
                if (!record.date) return false;
                const recordDate = record.date.split('T')[0];
                return recordDate === dateStr;
            }).length;
        }
        
        const isToday = currentDate.toDateString() === today.toDateString();
        
        // تاریخ شمسی
        const persianDate = currentDate.toLocaleDateString('fa-IR', {
            month: 'numeric',
            day: 'numeric'
        });
        
        weeklyData.push({
            dayName: weekDays[i],
            persianDate: persianDate,
            icon: weekIcons[i],
            count: practiceCount,
            isToday: isToday,
            hasActivity: practiceCount > 0
        });
    }
    
    const maxCount = Math.max(...weeklyData.map(d => d.count), 1);
    
    container.innerHTML = weeklyData.map(day => `
        <div class="day-progress ${day.hasActivity ? 'has-activity' : 'no-activity'} ${day.isToday ? 'today' : ''}">
            <div class="day-icon">
                <i class="fas ${day.icon}"></i>
            </div>
            <div class="day-name">${day.dayName}</div>
            <div class="day-date">${day.persianDate}</div>
            <div class="day-bar">
                <div class="day-fill" style="height: ${(day.count / maxCount) * 100}%"></div>
            </div>
            <div class="day-value">
                ${day.count}
                ${day.hasActivity ? '<i class="fas fa-check-circle"></i>' : ''}
            </div>
            ${day.isToday ? `<span class="today-badge">${isGerman ? 'امروز' : 'Today'}</span>` : ''}
        </div>
    `).join('');
};

GermanDictionary.prototype.setupCustomStats = function() {
    const startInput = document.getElementById('custom-stats-start');
    const endInput = document.getElementById('custom-stats-end');
    const applyBtn = document.getElementById('apply-custom-stats');
    const resetBtn = document.getElementById('reset-custom-stats');
    
    // اگر المنت‌ها وجود ندارند، صبر کن
    if (!startInput || !endInput || !applyBtn) {
        console.log('⏳ منتظر بارگذاری المنت‌های آمار سفارشی...');
        setTimeout(() => this.setupCustomStats(), 500);
        return;
    }
    
    // تنظیم تاریخ پیش‌فرض (آخرین 7 روز)
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    
    startInput.value = weekAgo.toISOString().split('T')[0];
    endInput.value = today.toISOString().split('T')[0];
    
    // دکمه اعمال
    applyBtn.onclick = () => {
        const startDate = startInput.value;
        const endDate = endInput.value;
        
        if (startDate && endDate) {
            this.loadCustomStats(startDate, endDate);
        } else {
            this.showToast('لطفاً هر دو تاریخ را انتخاب کنید', 'warning');
        }
    };
    
    // دکمه reset
    if (resetBtn) {
        resetBtn.onclick = () => {
            startInput.value = '';
            endInput.value = '';
            // پاک کردن نتایج سفارشی
            const customResults = document.getElementById('custom-stats-results');
            if (customResults) customResults.innerHTML = '';
            const customActivity = document.getElementById('custom-activity-list');
            if (customActivity) customActivity.remove();
            this.showToast('آمار به حالت پیش‌فرض برگشت', 'info');
        };
    }
    
    // بارگذاری اولیه
    this.loadCustomStats(startInput.value, endInput.value);
    
    console.log('✅ آمار سفارشی راه‌اندازی شد');
};

GermanDictionary.prototype.startWordOrderPractice = async function() {
    const wordsToPractice = await this.getFilteredWordsForPractice();
    const isGerman = LanguageSystem.isGerman();
    
    // ========== فقط از مثال‌های خود کاربر استفاده کن ==========
    let customSentences = [];
    
    for (let word of wordsToPractice) {
        const examples = await this.getExamplesForWord(word.id);
        
        for (let ex of examples) {
            if (ex.german && ex.german.length > 10) {
                let sentence = ex.german;
                let wordsArray = sentence.split(' ');
                
                if (wordsArray.length >= 3 && wordsArray.length <= 8) {
                    customSentences.push({
                        correct: sentence,
                        words: this.shuffleArray([...wordsArray]),
                        translation: ex.persian || word.persian,
                        wordId: word.id
                    });
                }
            }
        }
    }
    
    if (customSentences.length === 0) {
        this.showToast('❌ برای این تمرین به جملات مثال نیاز دارید. لطفاً برای لغات مثال اضافه کنید.', 'error');
        return;
    }
    
    // ========== از کل جملات فیلتر شده استفاده کن ==========
    this.wordOrderSession = {
        questions: [],
        currentIndex: 0,
        score: 0
    };
    
    for (let sent of customSentences) {
        this.wordOrderSession.questions.push({
            correctOrder: sent.correct,
            shuffledWords: sent.words,
            translation: sent.translation,
            wordId: sent.wordId
        });
    }
    
    if (this.wordOrderSession.questions.length === 0) {
        this.showToast('❌ خطا در ساخت سوالات', 'error');
        return;
    }
    
    this.showToast(`📊 تعداد جملات در این بازه: ${this.wordOrderSession.questions.length} جمله`, 'info');
    
    this.showWordOrderQuestion();
    this.showSection('practice-section');
};

GermanDictionary.prototype.showWordOrderQuestion = function() {
    if (this.wordOrderSession.currentIndex >= this.wordOrderSession.questions.length) {
        this.showWordOrderResults();
        return;
    }
    
    const q = this.wordOrderSession.questions[this.wordOrderSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    const current = this.wordOrderSession.currentIndex + 1;
    const total = this.wordOrderSession.questions.length;
    const progress = (current - 1) / total * 100;
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    // نمایش کلمات به هم ریخته
    const wordsHtml = q.shuffledWords.map((word, idx) => `
        <div class="word-order-item" data-index="${idx}" data-word="${word}" 
             style="display: inline-block; padding: 12px 18px; margin: 5px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
            ${word}
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fa-solid fa-sort-amount-down"></i> ${isGerman ? 'مرتب‌سازی کلمات' : 'Word Order'}</h2>
                <span class="badge" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9);">${current}/${total}</span>
            </div>
            
            <div style="text-align: center; padding: 30px 20px;">
                <div style="background: linear-gradient(135deg, #f3e8ff, #e9d5ff); border-radius: 20px; padding: 25px; margin-bottom: 20px;">
                    <div style="font-size: 14px; color: #6b21a5; margin-bottom: 10px;">
                        <i class="fa-solid fa-arrow-right"></i> ${isGerman ? 'کلمات را به ترتیب درست بچینید:' : 'Arrange the words in correct order:'}
                    </div>
                    <div class="shuffled-words" style="direction: ltr;">
                        ${wordsHtml}
                    </div>
                </div>
                
                <div style="background: #f0fdf4; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                    <div style="font-size: 14px; color: #065f46; margin-bottom: 8px;">
                        <i class="fa-solid fa-lightbulb"></i> ${isGerman ? 'جمله ساخته شده:' : 'Your sentence:'}
                    </div>
                    <div id="user-sentence" style="min-height: 60px; padding: 12px; background: white; border-radius: 12px; direction: ltr; font-size: 16px; font-weight: 500;">
                        <span style="color: #9ca3af;">${isGerman ? 'روی کلمات کلیک کنید تا جمله ساخته شود...' : 'Click on words to build sentence...'}</span>
                    </div>
                </div>
                
                <div style="background: #fef3c7; border-radius: 12px; padding: 10px; margin-bottom: 25px;">
                    <span style="font-size: 14px; color: #92400e;">
                        <i class="fa-solid fa-language"></i> ${isGerman ? 'ترجمه:' : 'Translation:'} ${q.translation}
                    </span>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="check-order-btn" class="btn btn-primary">
                        <i class="fa-solid fa-check"></i> ${isGerman ? 'بررسی' : 'Check'}
                    </button>
                    <button id="reset-order-btn" class="btn btn-outline">
                        <i class="fa-solid fa-undo"></i> ${isGerman ? 'بازنشانی' : 'Reset'}
                    </button>
                    <button id="skip-order-btn" class="btn btn-outline">
                        <i class="fa-solid fa-forward"></i> ${isGerman ? 'رد کردن' : 'Skip'}
                    </button>
                </div>
                
                <div id="order-feedback" style="margin-top: 20px; font-size: 16px; min-height: 60px;"></div>
                
                <div style="width: 70%; margin: 20px auto 0; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #8b5cf6, #6d28d9); transition: width 0.3s ease;"></div>
                </div>
            </div>
        </div>
    `;
    
    // راه‌اندازی رویدادها
    this.setupWordOrderEvents();
};

GermanDictionary.prototype.setupWordOrderEvents = function() {
    const session = this.wordOrderSession;
    const q = session.questions[session.currentIndex];
    const userSentenceDiv = document.getElementById('user-sentence');
    const feedbackDiv = document.getElementById('order-feedback');
    const isGerman = LanguageSystem.isGerman();
    
    let selectedWords = [];
    let wordElements = document.querySelectorAll('.word-order-item');
    
    // کلیک روی کلمات
    wordElements.forEach(wordEl => {
        wordEl.onclick = () => {
            const word = wordEl.dataset.word;
            selectedWords.push(word);
            wordEl.style.display = 'none';
            
            // نمایش جمله ساخته شده
            userSentenceDiv.innerHTML = selectedWords.map(w => 
                `<span style="display: inline-block; background: #8b5cf6; color: white; padding: 5px 12px; border-radius: 20px; margin: 3px;">${w}</span>`
            ).join(' ');
        };
    });
    
    // دکمه بازنشانی
    document.getElementById('reset-order-btn').onclick = () => {
        selectedWords = [];
        userSentenceDiv.innerHTML = `<span style="color: #9ca3af;">${isGerman ? 'روی کلمات کلیک کنید تا جمله ساخته شود...' : 'Click on words to build sentence...'}</span>`;
        wordElements.forEach(el => el.style.display = 'inline-block');
        feedbackDiv.innerHTML = '';
    };
    
    // دکمه بررسی
    document.getElementById('check-order-btn').onclick = async () => {
        const userSentence = selectedWords.join(' ');
        const isCorrect = userSentence === q.correctOrder;
        
        if (selectedWords.length === 0) {
            feedbackDiv.innerHTML = `<span style="color: #f59e0b;">⚠️ ${isGerman ? 'لطفاً ابتدا کلمات را مرتب کنید' : 'Please arrange the words first'}</span>`;
            return;
        }
        
        // غیرفعال کردن دکمه‌ها
        document.querySelectorAll('#check-order-btn, #reset-order-btn, #skip-order-btn').forEach(btn => btn.disabled = true);
        wordElements.forEach(el => el.style.pointerEvents = 'none');
        
        if (isCorrect) {
            session.score++;
            feedbackDiv.innerHTML = `<span style="color: #10b981; font-size: 18px;">✅ ${isGerman ? 'آفرین! ترتیب جمله صحیح است' : 'Correct! The word order is right'}</span>`;
        } else {
            feedbackDiv.innerHTML = `<span style="color: #ef4444; font-size: 16px;">❌ ${isGerman ? 'ترتیب صحیح:' : 'Correct order:'}<br><strong style="direction: ltr;">${q.correctOrder}</strong></span>`;
        }
        
        // ذخیره در تاریخچه
        await this.recordPractice(q.wordId, isCorrect);
        
        setTimeout(() => {
            session.currentIndex++;
            this.showWordOrderQuestion();
        }, 2000);
    };
    // اینتر زدن روی صفحه برای بررسی
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const checkBtn = document.getElementById('check-order-btn');
        if (checkBtn && !checkBtn.disabled) {
            checkBtn.click();
        }
    }
});
    // دکمه رد کردن
    document.getElementById('skip-order-btn').onclick = () => {
        session.currentIndex++;
        this.showWordOrderQuestion();
    };
};

GermanDictionary.prototype.showWordOrderResults = function() {
    const accuracy = Math.round((this.wordOrderSession.score / this.wordOrderSession.questions.length) * 100);
    const isGerman = LanguageSystem.isGerman();
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fa-solid fa-chart-line"></i> ${isGerman ? 'نتایج تمرین مرتب‌سازی کلمات' : 'Word Order Results'}</h2>
            </div>
            
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 70px; margin-bottom: 20px;">🏆</div>
                <div style="font-size: 48px; font-weight: 800; color: ${accuracy >= 70 ? '#10b981' : '#8b5cf6'}; margin-bottom: 30px;">${accuracy}%</div>
                
                <div style="display: flex; justify-content: center; gap: 50px; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'تعداد جملات' : 'Sentences'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${this.wordOrderSession.questions.length}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'پاسخ صحیح' : 'Correct'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: #10b981;">${this.wordOrderSession.score}</div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                <button id="restart-order-btn" class="btn btn-primary"><i class="fa-solid fa-rotate-right"></i> ${isGerman ? 'تمرین مجدد' : 'Practice Again'}</button>
                <button id="back-order-btn" class="btn btn-outline"><i class="fa-solid fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}</button>
            </div>
        </div>
    `;
    
    document.getElementById('restart-order-btn').onclick = () => this.startWordOrderPractice();
    document.getElementById('back-order-btn').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
};

GermanDictionary.prototype.loadCustomStats = async function(startDate, endDate) {
    try {
        const words = await this.getAllWords();
        const practiceHistory = await this.getAllPracticeHistory();
        
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        const filteredWords = words.filter(word => {
            const wordDate = new Date(word.createdAt);
            return wordDate >= start && wordDate <= end;
        });
        
        const filteredPractice = practiceHistory.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= start && recordDate <= end;
        });
        
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const totalNewWords = filteredWords.length;
        const totalPractice = filteredPractice.length;
        const correctPractice = filteredPractice.filter(p => p.correct).length;
        const wrongPractice = totalPractice - correctPractice;
        const accuracy = totalPractice > 0 ? Math.round((correctPractice / totalPractice) * 100) : 0;
        
        const avgDailyPractice = totalPractice > 0 ? (totalPractice / totalDays).toFixed(1) : 0;
        const avgDailyWords = totalNewWords > 0 ? (totalNewWords / totalDays).toFixed(1) : 0;
        
        // بهترین روز
        const dailyStats = {};
        filteredPractice.forEach(record => {
            const day = record.date.split('T')[0];
            if (!dailyStats[day]) {
                dailyStats[day] = { total: 0, correct: 0 };
            }
            dailyStats[day].total++;
            if (record.correct) dailyStats[day].correct++;
        });
        
        let bestDay = { date: '', total: 0, correct: 0 };
        for (const [day, stats] of Object.entries(dailyStats)) {
            if (stats.total > bestDay.total) {
                bestDay = { date: day, total: stats.total, correct: stats.correct };
            }
        }
        
        this.renderCustomStats({
            startDate, endDate, totalDays, totalNewWords, totalPractice,
            correctPractice, wrongPractice, accuracy, avgDailyPractice, avgDailyWords, bestDay
        });
        
        this.renderCustomActivityList(filteredPractice, filteredWords);
        
    } catch (error) {
        console.error('خطا در آمار سفارشی:', error);
    }
};

GermanDictionary.prototype.renderWordListWithSort = async function(filter = 'all', sortBy = 'alphabetical') {
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
    
    // مرتب‌سازی
    switch(sortBy) {
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
            // نیاز به محاسبه تعداد تمرین هر لغت
            const practiceCounts = {};
            const practiceHistory = await this.getAllPracticeHistory();
            practiceHistory.forEach(p => {
                practiceCounts[p.wordId] = (practiceCounts[p.wordId] || 0) + 1;
            });
            filteredWords.sort((a, b) => (practiceCounts[b.id] || 0) - (practiceCounts[a.id] || 0));
            break;
        case 'accuracy':
            // محاسبه دقت هر لغت
            const accuracyMap = {};
            const history = await this.getAllPracticeHistory();
            const correctMap = {};
            history.forEach(p => {
                if (p.correct) correctMap[p.wordId] = (correctMap[p.wordId] || 0) + 1;
                accuracyMap[p.wordId] = (accuracyMap[p.wordId] || 0) + 1;
            });
            filteredWords.sort((a, b) => {
                const accuracyA = (correctMap[a.id] || 0) / (accuracyMap[a.id] || 1);
                const accuracyB = (correctMap[b.id] || 0) / (accuracyMap[b.id] || 1);
                return accuracyB - accuracyA;
            });
            break;
    }
    
    document.getElementById('total-words-count').textContent = filteredWords.length;
    
    if (filteredWords.length === 0) {
        container.innerHTML = `<div class="empty-state">...</div>`;
        return;
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

GermanDictionary.prototype.renderCustomStats = function(stats) {
    const container = document.getElementById('custom-stats-results');
    if (!container) return;
    
    const isGerman = LanguageSystem.isGerman();
    const startDateObj = new Date(stats.startDate);
    const endDateObj = new Date(stats.endDate);
    
    const formatDate = (date) => {
        return date.toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-title">${isGerman ? 'بازه زمانی' : 'Date Range'}</div>
            <div class="stat-value" style="font-size: 14px;">${formatDate(startDateObj)} <br> تا <br> ${formatDate(endDateObj)}</div>
            <div class="stat-change">${stats.totalDays} ${isGerman ? 'روز' : 'days'}</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-title">${isGerman ? 'لغات جدید' : 'New Words'}</div>
            <div class="stat-value">${stats.totalNewWords}</div>
            <div class="stat-change">${isGerman ? 'میانگین روزانه' : 'Daily avg'}: ${stats.avgDailyWords}</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-title">${isGerman ? 'تمرین‌ها' : 'Practices'}</div>
            <div class="stat-value">${stats.totalPractice}</div>
            <div class="stat-change">${isGerman ? 'میانگین روزانه' : 'Daily avg'}: ${stats.avgDailyPractice}</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-title">${isGerman ? 'میزان دقت' : 'Accuracy'}</div>
            <div class="stat-value">${stats.accuracy}%</div>
            <div class="stat-change">${stats.correctPractice} / ${stats.totalPractice}</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-title">${isGerman ? 'پاسخ صحیح' : 'Correct'}</div>
            <div class="stat-value">${stats.correctPractice}</div>
            <div class="stat-change">${isGerman ? 'پاسخ نادرست' : 'Wrong'}: ${stats.wrongPractice}</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-title">${isGerman ? 'بهترین روز' : 'Best Day'}</div>
            <div class="stat-value" style="font-size: 14px;">${stats.bestDay.date ? new Date(stats.bestDay.date).toLocaleDateString('fa-IR') : '-'}</div>
            <div class="stat-change">${stats.bestDay.total} ${isGerman ? 'تمرین' : 'practices'} (${stats.bestDay.correct} ${isGerman ? 'صحیح' : 'correct'})</div>
        </div>
    `;
};

GermanDictionary.prototype.renderCustomActivityList = async function(practiceHistory, newWords) {
    // ایجاد یک بخش جدید برای نمایش فعالیت‌ها
    let activityContainer = document.getElementById('custom-activity-list');
    
    if (!activityContainer) {
        // اگر وجود ندارد، ایجاد کن
        const statsContainer = document.getElementById('custom-stats-results');
        if (statsContainer && statsContainer.parentNode) {
            const newSection = document.createElement('div');
            newSection.id = 'custom-activity-list';
            newSection.style.marginTop = '20px';
            newSection.style.padding = '15px';
            newSection.style.background = 'var(--gray-50)';
            newSection.style.borderRadius = '16px';
            statsContainer.parentNode.insertBefore(newSection, statsContainer.nextSibling);
            activityContainer = newSection;
        }
    }
    
    if (!activityContainer) return;
    
    const isGerman = LanguageSystem.isGerman();
    
    if (practiceHistory.length === 0 && newWords.length === 0) {
        activityContainer.innerHTML = `
            <h4 style="margin-bottom: 15px;"><i class="fas fa-info-circle"></i> ${isGerman ? 'فعالیتی در این بازه یافت نشد' : 'No activity found'}</h4>
        `;
        return;
    }
    
    // گروه‌بندی بر اساس روز
    const activitiesByDay = {};
    
    practiceHistory.forEach(record => {
        const day = record.date.split('T')[0];
        if (!activitiesByDay[day]) {
            activitiesByDay[day] = { practices: [], newWords: [] };
        }
        activitiesByDay[day].practices.push(record);
    });
    
    newWords.forEach(word => {
        const day = word.createdAt.split('T')[0];
        if (!activitiesByDay[day]) {
            activitiesByDay[day] = { practices: [], newWords: [] };
        }
        activitiesByDay[day].newWords.push(word);
    });
    
    // مرتب‌سازی روزها
    const sortedDays = Object.keys(activitiesByDay).sort().reverse();
    
    let html = `<h4 style="margin-bottom: 15px;"><i class="fas fa-list-alt"></i> ${isGerman ? 'فعالیت‌های روزانه' : 'Daily Activities'}</h4>`;
    
    for (const day of sortedDays.slice(0, 14)) { // حداکثر 14 روز
        const activities = activitiesByDay[day];
        const persianDate = new Date(day).toLocaleDateString('fa-IR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const practiceCount = activities.practices.length;
        const correctCount = activities.practices.filter(p => p.correct).length;
        const newWordsCount = activities.newWords.length;
        
        html += `
            <div style="border-bottom: 1px solid var(--gray-200); padding: 12px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div style="font-weight: 700; color: var(--primary);">
                        <i class="fas fa-calendar-day"></i> ${persianDate}
                    </div>
                    <div style="display: flex; gap: 15px;">
                        ${practiceCount > 0 ? `<span style="color: #3b82f6;"><i class="fas fa-brain"></i> ${practiceCount} تمرین</span>` : ''}
                        ${correctCount > 0 ? `<span style="color: #10b981;"><i class="fas fa-check"></i> ${correctCount} صحیح</span>` : ''}
                        ${newWordsCount > 0 ? `<span style="color: #f59e0b;"><i class="fas fa-plus"></i> ${newWordsCount} لغت جدید</span>` : ''}
                    </div>
                </div>
                ${activities.newWords.length > 0 ? `
                    <div style="margin-top: 8px; font-size: 13px; color: var(--gray-600);">
                        <i class="fas fa-book"></i> لغات جدید: ${activities.newWords.map(w => w.german).join(', ')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    activityContainer.innerHTML = html;
};

GermanDictionary.prototype.renderAchievements = function(totalWords, totalPractice, accuracy) {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    
    const isGerman = LanguageSystem.isGerman();
    
    const achievements = [
        {
            id: 'first_word',
            title: isGerman ? 'اولین لغت' : 'First Word',
            desc: isGerman ? 'اولین لغت را اضافه کنید' : 'Add your first word',
            icon: 'fa-plus-circle',
            achieved: totalWords >= 1,
            target: 1,
            current: totalWords
        },
        {
            id: 'ten_words',
            title: isGerman ? '۱۰ لغت' : '10 Words',
            desc: isGerman ? '۱۰ لغت به دیکشنری اضافه کنید' : 'Add 10 words',
            icon: 'fa-book',
            achieved: totalWords >= 10,
            target: 10,
            current: totalWords
        },
        {
            id: 'fifty_words',
            title: isGerman ? '۵۰ لغت' : '50 Words',
            desc: isGerman ? '۵۰ لغت به دیکشنری اضافه کنید' : 'Add 50 words',
            icon: 'fa-layer-group',
            achieved: totalWords >= 50,
            target: 50,
            current: totalWords
        },
        {
            id: 'hundred_words',
            title: isGerman ? '۱۰۰ لغت' : '100 Words',
            desc: isGerman ? '۱۰۰ لغت به دیکشنری اضافه کنید' : 'Add 100 words',
            icon: 'fa-crown',
            achieved: totalWords >= 100,
            target: 100,
            current: totalWords
        },
        {
            id: 'first_practice',
            title: isGerman ? 'اولین تمرین' : 'First Practice',
            desc: isGerman ? 'اولین تمرین را انجام دهید' : 'Do your first practice',
            icon: 'fa-brain',
            achieved: totalPractice >= 1,
            target: 1,
            current: totalPractice
        },
        {
            id: 'perfect_score',
            title: isGerman ? '۱۰۰٪ دقت' : '100% Accuracy',
            desc: isGerman ? '۱۰۰٪ پاسخ صحیح در یک جلسه' : '100% correct in one session',
            icon: 'fa-star',
            achieved: accuracy === 100,
            target: 100,
            current: accuracy
        }
    ];
    
    container.innerHTML = achievements.map(ach => {
        const progress = Math.min(100, Math.round((ach.current / ach.target) * 100));
        
        return `
            <div class="achievement-item ${ach.achieved ? 'unlocked' : 'locked'}">
                <div class="achievement-icon" style="background: ${ach.achieved ? 'var(--gradient-primary)' : 'var(--gray-200)'}; color: ${ach.achieved ? 'white' : 'var(--gray-500)'}">
                    <i class="fas ${ach.icon}"></i>
                </div>
                <div class="achievement-title">${ach.title}</div>
                <div class="achievement-desc">${ach.desc}</div>
                ${!ach.achieved ? `
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${ach.current}/${ach.target}</div>
                    </div>
                ` : `
                    <div class="achievement-badge">
                        <i class="fas fa-check-circle"></i> ${isGerman ? 'تکمیل شده' : 'Completed'}
                    </div>
                `}
            </div>
        `;
    }).join('');
};

GermanDictionary.prototype.renderRecentActivity = async function(practiceHistory) {
    const container = document.getElementById('recent-activity');
    if (!container) return;
    
    const isGerman = LanguageSystem.isGerman();
    
    if (!practiceHistory || practiceHistory.length === 0) {
        container.innerHTML = `<p class="text-center text-muted">${isGerman ? 'هنوز فعالیتی ثبت نشده' : 'No activity yet'}</p>`;
        return;
    }
    
    const recent = practiceHistory.slice(-10).reverse();
    let html = '';
    
    for (const record of recent) {
        try {
            const word = await this.getWord(record.wordId);
            const wordText = word ? word.german : (isGerman ? 'لغت حذف شده' : 'Deleted word');
            const date = new Date(record.date);
            const formattedDate = date.toLocaleDateString('fa-IR', {
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon ${record.correct ? 'success' : 'danger'}">
                        <i class="fas ${record.correct ? 'fa-check' : 'fa-times'}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-text">
                            <span class="activity-word">${wordText}</span>
                            <span class="activity-result ${record.correct ? 'correct' : 'incorrect'}">
                                ${record.correct ? (isGerman ? '✅ صحیح' : '✅ Correct') : (isGerman ? '❌ نادرست' : '❌ Incorrect')}
                            </span>
                        </div>
                        <div class="activity-time">
                            <i class="far fa-clock"></i>
                            ${formattedDate}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('خطا در دریافت لغت:', error);
        }
    }
    
    if (html === '') {
        html = `<p class="text-center text-muted">${isGerman ? 'خطا در نمایش فعالیت‌ها' : 'Error loading activities'}</p>`;
    }
    
    container.innerHTML = html;
};

GermanDictionary.prototype.formatPersianDate = function(isoDate) {
    const date = new Date(isoDate);
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('fa-IR', options);
};

