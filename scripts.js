// Fallback for LanguageSystem in case language-config.js is missing
if (typeof LanguageSystem === 'undefined') {
    window.LanguageSystem = {
        currentLang: 'de',
        isGerman: function() { return true; },
        isEnglish: function() { return false; },
        t: function(key) { return key; }
    };
    var LanguageSystem = window.LanguageSystem;
}

class APIKeyManager {
    constructor() {
        this.keys = [];
        this.currentIndex = 0;
        this.failedKeys = new Set();
        this.failedUntil = new Map();
    }

    addKey(apiKey, name = null) {
        if (!apiKey || !apiKey.trim()) return false;
        const trimmedKey = apiKey.trim();
        const exists = this.keys.some(k => k.key === trimmedKey);
        if (exists) return false;
        
        this.keys.push({
            key: trimmedKey,
            name: name || `کلید ${this.keys.length + 1}`,
            addedAt: Date.now(),
            isActive: true,
            remainingQuota: null
        });
        return true;
    }

    getCurrentKey() {
        if (this.keys.length === 0) return null;
        if (this.currentIndex >= this.keys.length) this.currentIndex = 0;
        return this.keys[this.currentIndex];
    }

    moveToNextKey() {
        if (this.keys.length === 0) return false;
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        return true;
    }

    getKeyForRequest() {
        let attempts = 0;
        const maxAttempts = this.keys.filter(k => k.isActive).length || 1;
        
        while (attempts < maxAttempts) {
            const current = this.getCurrentKey();
            if (!current) return null;
            
            const idx = this.keys.findIndex(k => k.key === current.key);
            const isFailed = this.failedKeys.has(idx);
            const failedExpired = this.failedUntil.has(idx) && this.failedUntil.get(idx) < Date.now();
            
            if (current.isActive && (!isFailed || failedExpired)) {
                if (isFailed && failedExpired) {
                    this.failedKeys.delete(idx);
                    this.failedUntil.delete(idx);
                }
                return current.key;
            }
            
            this.moveToNextKey();
            attempts++;
        }
        
        return null;
    }

    reportError(errorType) {
        const currentKey = this.getCurrentKey();
        if (!currentKey) return false;
        
        const currentIdx = this.keys.findIndex(k => k.key === currentKey.key);
        
        if (errorType === 429 || (errorType.message && errorType.message.includes('rate_limit'))) {
            this.failedKeys.add(currentIdx);
            this.failedUntil.set(currentIdx, Date.now() + 60000);
            console.log(`⏳ کلید ${currentKey.name} به دلیل Rate Limit برای 60 ثانیه غیرفعال شد`);
            return true;
        }
        
        if (errorType === 401 || (errorType.message && errorType.message.includes('invalid'))) {
            this.disableKey(currentIdx);
            console.log(`❌ کلید ${currentKey.name} نامعتبر است و غیرفعال شد`);
            return true;
        }
        
        this.failedKeys.add(currentIdx);
        this.failedUntil.set(currentIdx, Date.now() + 30000);
        return true;
    }

    disableKey(index) {
        if (this.keys[index]) {
            this.keys[index].isActive = false;
            return true;
        }
        return false;
    }

    getAllKeys() {
        return this.keys;
    }
}


class GermanDictionary {
    constructor() {
     
this.uploadedImageUrl = null;
       
        this.dbName = 'GermanPersianDictionary';
        this.dbVersion = 5;
        this.db = null;
        this.currentWord = null;
        this.favorites = new Set();
        this.chatMemory = []; 
        this.isGeneratingImage = false;
        this.lastWordId = null;
        this.answerLocked = false;
        this.lastPracticeWords = []; 
        this.lastPracticeTime = 0;
        this.srsData = {}; 
        this.tags = new Map();           
this.currentTagFilter = null;    
this.selectedPracticeTag = null; 
this.exportTagFilter = null;     
this.bulkSelectedWordIds = new Set();
this.bulkCurrentPage = 1;        
this.bulkWordsPerPage = 20;      
this.bulkAllWords = [];          
this.bulkFilteredWords = [];     
this.currentWordList = [];
// بارگذاری تگ‌ها
this.loadTags();
        this.reviewWords = []; 
        this.lastSrsUpdate = null; 
        this.translateDirection = 'de-fa';
        this.isVoiceActive = false;
        this.showMeaningInGenderPractice = false;
        this.voiceRecognition = null;
        this.voiceTimerInterval = null;
        this.customStatsInitialized = false;
        this.voiceStartTime = null;
        this.currentChatId = 'current_chat_' + Date.now();
        this.voiceSynthesis = window.speechSynthesis;
        this.currentVoiceSettings = {
        speed: 1,
        pitch: 1,
        volume: 1,
        voice: null
    };
          this.floatingMenuSearchHandler = null;
    this.menuObserver = null;
        // ========== جلسات تمرین ==========
        this.practiceSession = null;
        this.quizSession = null;
        this.listeningSession = null;
        this.writingSession = null;
        this.speakingSession = null;
        
        // ========== پلیر موسیقی ==========
        this.audioPlayer = null;
        this.currentMusic = null;
        
        // ========== مدیریت اسکرول ==========
        this.scrollState = {
            isAtBottom: true,
            isUserScrolling: false,
            lastScrollTop: 0,
            scrollTimeout: null
        };
        
        // ========== وضعیت AI ==========
        this.isAITyping = false;
        this.aiModel = 'elias-mini';
        // دیتابیس کامل حروف اضافه آلمانی - در constructor اضافه کن
this.prepositionsDB = [
    // ========== Akkusativ (15 عدد) ==========
    { preposition: "bis", meaning: "تا", example: "Bis morgen!", exampleTrans: "تا فردا!", case: "Akkusativ", level: "A1" },
    { preposition: "durch", meaning: "از طریق / توسط", example: "Wir gehen durch den Park.", exampleTrans: "ما از طریق پارک می‌رویم.", case: "Akkusativ", level: "A1" },
    { preposition: "für", meaning: "برای", example: "Das Geschenk ist für dich.", exampleTrans: "هدیه برای توست.", case: "Akkusativ", level: "A1" },
    { preposition: "gegen", meaning: "علیه / مقابل / حدود", example: "Ich bin gegen den Plan.", exampleTrans: "من مخالف این نقشه هستم.", case: "Akkusativ", level: "A1" },
    { preposition: "ohne", meaning: "بدون", example: "Ich gehe ohne dich.", exampleTrans: "من بدون تو می‌روم.", case: "Akkusativ", level: "A1" },
    { preposition: "um", meaning: "در ساعت / اطراف / به خاطر", example: "Wir treffen uns um 8 Uhr.", exampleTrans: "ساعت ۸ همدیگر را می‌بینیم.", case: "Akkusativ", level: "A1" },
    { preposition: "entlang", meaning: "در امتداد", example: "Gehen Sie die Straße entlang.", exampleTrans: "در امتداد خیابان بروید.", case: "Akkusativ", level: "A2" },
    { preposition: "wider", meaning: "بر خلاف / علیه", example: "Wider meinen Willen.", exampleTrans: "بر خلاف میل من.", case: "Akkusativ", level: "B1" },
    { preposition: "kontra", meaning: "علیه", example: "Mannschaft A kontra Mannschaft B.", exampleTrans: "تیم A علیه تیم B.", case: "Akkusativ", level: "B2" },
    { preposition: "per", meaning: "با / از طریق", example: "Per E-Mail senden.", exampleTrans: "ارسال از طریق ایمیل.", case: "Akkusativ", level: "B1" },
    { preposition: "pro", meaning: "در هر", example: "10 Euro pro Stunde.", exampleTrans: "۱۰ یورو در هر ساعت.", case: "Akkusativ", level: "B1" },
    { preposition: "via", meaning: "از طریق", example: "Wir reisen via Berlin.", exampleTrans: "ما از طریق برلین سفر می‌کنیم.", case: "Akkusativ", level: "B1" },
    
    // ========== Dativ (18 عدد) ==========
    { preposition: "aus", meaning: "از (داخل)", example: "Ich komme aus dem Iran.", exampleTrans: "من از ایران می‌آیم.", case: "Dativ", level: "A1" },
    { preposition: "außer", meaning: "به جز / غیر از", example: "Außer mir kommt niemand.", exampleTrans: "به جز من هیچکس نمی‌آید.", case: "Dativ", level: "A2" },
    { preposition: "bei", meaning: "نزد / در کنار / هنگام", example: "Ich wohne bei meinen Eltern.", exampleTrans: "نزد والدینم زندگی می‌کنم.", case: "Dativ", level: "A1" },
    { preposition: "entgegen", meaning: "بر خلاف", example: "Entgegen meiner Erwartung.", exampleTrans: "بر خلاف انتظار من.", case: "Dativ", level: "B1" },
    { preposition: "entsprechend", meaning: "مطابق با", example: "Entsprechend der Vereinbarung.", exampleTrans: "مطابق با توافقنامه.", case: "Dativ", level: "B2" },
    { preposition: "gegenüber", meaning: "روبروی / نسبت به", example: "Das Hotel ist dem Bahnhof gegenüber.", exampleTrans: "هتل روبروی ایستگاه قطار است.", case: "Dativ", level: "A2" },
    { preposition: "gemäß", meaning: "طبق / بر اساس", example: "Gemäß dem Gesetz.", exampleTrans: "طبق قانون.", case: "Dativ", level: "B1" },
    { preposition: "mit", meaning: "با / همراه با", example: "Ich fahre mit dem Zug.", exampleTrans: "من با قطار می‌روم.", case: "Dativ", level: "A1" },
    { preposition: "nach", meaning: "به سمت / بعد از / طبق", example: "Nach der Arbeit gehe ich nach Hause.", exampleTrans: "بعد از کار به خانه می‌روم.", case: "Dativ", level: "A1" },
    { preposition: "nahe", meaning: "نزدیک", example: "Das Haus nahe dem Bahnhof.", exampleTrans: "خانه نزدیک ایستگاه قطار.", case: "Dativ", level: "B1" },
    { preposition: "nebst", meaning: "همراه با", example: "Nebst seiner Familie.", exampleTrans: "همراه با خانواده‌اش.", case: "Dativ", level: "B2" },
    { preposition: "samt", meaning: "همراه با", example: "Samt seinem Gepäck.", exampleTrans: "همراه با بارش.", case: "Dativ", level: "B2" },
    { preposition: "seit", meaning: "از زمان / از وقتی که", example: "Ich lerne seit einem Jahr Deutsch.", exampleTrans: "از یک سال پیش آلمانی یاد می‌گیرم.", case: "Dativ", level: "A1" },
    { preposition: "von", meaning: "از (مالکیت) / توسط", example: "Das Geschenk ist von mir.", exampleTrans: "هدیه از من است.", case: "Dativ", level: "A1" },
    { preposition: "zu", meaning: "به سوی / به منظور", example: "Ich gehe zu meinem Freund.", exampleTrans: "به سمت دوستم می‌روم.", case: "Dativ", level: "A1" },
    { preposition: "zufolge", meaning: "بر اساس / طبق", example: "Zufolge des Berichts.", exampleTrans: "بر اساس گزارش.", case: "Dativ", level: "B2" },
    
    // ========== Wechselpräpositionen (9 عدد) ==========
    { preposition: "an", meaning: "کنار / به / روی (عمودی)", example: "Das Bild hängt an der Wand.", exampleTrans: "تصویر به دیوار آویزان است.", case: "Wechsel", level: "A1" },
    { preposition: "auf", meaning: "بر روی (افقی)", example: "Das Buch liegt auf dem Tisch.", exampleTrans: "کتاب روی میز است.", case: "Wechsel", level: "A1" },
    { preposition: "hinter", meaning: "پشت / عقب", example: "Das Auto steht hinter dem Haus.", exampleTrans: "ماشین پشت خانه است.", case: "Wechsel", level: "A1" },
    { preposition: "in", meaning: "در داخل", example: "Ich bin in der Stadt.", exampleTrans: "من در شهر هستم.", case: "Wechsel", level: "A1" },
    { preposition: "neben", meaning: "کنار / مجاور", example: "Ich sitze neben dir.", exampleTrans: "کنار تو می‌نشینم.", case: "Wechsel", level: "A1" },
    { preposition: "über", meaning: "روی / بالای / درباره", example: "Wir sprechen über das Thema.", exampleTrans: "درباره موضوع صحبت می‌کنیم.", case: "Wechsel", level: "A1" },
    { preposition: "unter", meaning: "زیر / بین", example: "Das Buch ist unter dem Tisch.", exampleTrans: "کتاب زیر میز است.", case: "Wechsel", level: "A1" },
    { preposition: "vor", meaning: "جلوی / قبل از", example: "Ich stehe vor dem Kino.", exampleTrans: "جلوی سینما ایستاده‌ام.", case: "Wechsel", level: "A1" },
    { preposition: "zwischen", meaning: "بین (دو چیز)", example: "Das Bild hängt zwischen den Fenstern.", exampleTrans: "تصویر بین پنجره‌ها آویزان است.", case: "Wechsel", level: "A1" },
    
    // ========== Genitiv (22 عدد) ==========
    { preposition: "anstatt", meaning: "به جای", example: "Anstatt eines Buches kaufe ich eine CD.", exampleTrans: "به جای کتاب یک سی‌دی می‌خرم.", case: "Genitiv", level: "B1" },
    { preposition: "außerhalb", meaning: "خارج از", example: "Außerhalb der Stadt ist es ruhig.", exampleTrans: "خارج از شهر آرام است.", case: "Genitiv", level: "B1" },
    { preposition: "innerhalb", meaning: "داخل / در عرض", example: "Innerhalb einer Woche bin ich fertig.", exampleTrans: "ظرف یک هفته تمام می‌کنم.", case: "Genitiv", level: "B1" },
    { preposition: "trotz", meaning: "با وجود / علی‌رغم", example: "Trotz des Regens gehe ich spazieren.", exampleTrans: "با وجود باران به پیاده‌روی می‌روم.", case: "Genitiv", level: "B1" },
    { preposition: "während", meaning: "در طول / حین", example: "Während des Films war es still.", exampleTrans: "در طول فیلم ساکت بود.", case: "Genitiv", level: "B1" },
    { preposition: "wegen", meaning: "به دلیل / به خاطر", example: "Wegen des Wetters bleiben wir zu Hause.", exampleTrans: "به دلیل آب و هوا در خانه می‌مانیم.", case: "Genitiv", level: "B1" },
    { preposition: "abseits", meaning: "دور از", example: "Abseits der Stadt.", exampleTrans: "دور از شهر.", case: "Genitiv", level: "B2" },
    { preposition: "bezüglich", meaning: "مربوط به / در مورد", example: "Bezüglich Ihrer Anfrage.", exampleTrans: "در مورد سوال شما.", case: "Genitiv", level: "B2" },
    { preposition: "diesseits", meaning: "این طرف", example: "Diesseits des Flusses.", exampleTrans: "این طرف رودخانه.", case: "Genitiv", level: "B2" },
    { preposition: "einschließlich", meaning: "شامل", example: "Einschließlich der Mehrwertsteuer.", exampleTrans: "شامل مالیات بر ارزش افزوده.", case: "Genitiv", level: "B2" },
    { preposition: "exklusive", meaning: "به استثنای", example: "Exklusive der Versandkosten.", exampleTrans: "به استثنای هزینه ارسال.", case: "Genitiv", level: "B2" },
    { preposition: "halber", meaning: "به خاطر", example: "Sicherheit halber.", exampleTrans: "به خاطر امنیت.", case: "Genitiv", level: "B2" },
    { preposition: "infolge", meaning: "در نتیجه", example: "Infolge des Unfalls.", exampleTrans: "در نتیجه تصادف.", case: "Genitiv", level: "B2" },
    { preposition: "jenseits", meaning: "آن طرف", example: "Jenseits der Grenze.", exampleTrans: "آن طرف مرز.", case: "Genitiv", level: "B2" },
    { preposition: "kraft", meaning: "به واسطه / با قدرت", example: "Kraft seines Amtes.", exampleTrans: "به واسطه مقامش.", case: "Genitiv", level: "C1" },
    { preposition: "laut", meaning: "طبق / بر اساس", example: "Laut des Berichtes.", exampleTrans: "طبق گزارش.", case: "Genitiv", level: "B2" },
    { preposition: "mangels", meaning: "به دلیل کمبود", example: "Mangels Beweisen.", exampleTrans: "به دلیل کمبود شواهد.", case: "Genitiv", level: "C1" },
    { preposition: "mittels", meaning: "با استفاده از", example: "Mittels eines Werkzeugs.", exampleTrans: "با استفاده از یک ابزار.", case: "Genitiv", level: "B2" },
    { preposition: "oberhalb", meaning: "بالای", example: "Oberhalb der Baumgrenze.", exampleTrans: "بالای خط درختان.", case: "Genitiv", level: "B2" },
    { preposition: "seitens", meaning: "از طرف", example: "Seitens der Regierung.", exampleTrans: "از طرف دولت.", case: "Genitiv", level: "B2" },
    { preposition: "statt", meaning: "به جای", example: "Statt eines Autos nehme ich den Bus.", exampleTrans: "به جای ماشین از اتوبوس استفاده می‌کنم.", case: "Genitiv", level: "B1" },
    { preposition: "unterhalb", meaning: "زیر", example: "Unterhalb der Brücke.", exampleTrans: "زیر پل.", case: "Genitiv", level: "B2" },
    { preposition: "unweit", meaning: "نزدیک", example: "Unweit des Bahnhofs.", exampleTrans: "نزدیک ایستگاه قطار.", case: "Genitiv", level: "B2" },
    { preposition: "vermittels", meaning: "به واسطه", example: "Vermittels eines Anwalts.", exampleTrans: "به واسطه یک وکیل.", case: "Genitiv", level: "C1" }
];
        // ========== رنگ سفارشی ==========
        this.customColor = { r: 67, g: 97, b: 238 };
        this.renderInitialSections();
        // ========== مقداردهی اولیه ==========
        this.init();
    }

async init() {
    console.log('🚀 راه‌اندازی Elias.Dictionary...');
    
    this._updateLoadingProgress(5, 'در حال راه‌اندازی...');
    
    const forceHide = setTimeout(() => {
        console.log('⏰ حذف اجباری صفحه لودینگ');
        this.hideLoadingScreen();
    }, 8000);

    setTimeout(() => {
        if (window.VerbsDatabase) {
            const countSpan = document.getElementById('tools-verbs-count');
            if (countSpan) {
                countSpan.textContent = `${window.VerbsDatabase.totalCount}+ فعل`;
                console.log(`✅ تعداد افعال به‌روز شد: ${window.VerbsDatabase.totalCount}+ فعل`);
            }
        }
    }, 500);
   
    try {
        this._updateLoadingProgress(15, 'اتصال به دیتابیس...');
        await this.initDB();
        this._updateLoadingProgress(30, 'بارگذاری علاقه‌مندی‌ها...');
        await this.loadFavorites();
        this._updateLoadingProgress(40, 'راه‌اندازی سیستم یادگیری...');
        await this.initSRS();
        
        // ========== راه‌اندازی سیستم تگ ==========
        this.loadTags();
        this.addTagButtonToWordList();
        this.renderTagFilterBar();
        this.updatePracticeTagFilter();
        this.addTagFilterToExportModal();
        
        this._updateLoadingProgress(55, 'اتصال رویدادها...');
        this.setupEventListeners();
        this.loadCustomization();
        this.updateOnlineStatus();
        this.setupOnlineStatusListener();
        if (typeof this.setupFloatingMenuQuickSearch === "function") { this.setupFloatingMenuQuickSearch?.(); }
        this.setupPasswordLock();
        this.checkAndLock();
        this.loadChatMemory?.();
        this._updateLoadingProgress(65, 'راه‌اندازی هوش مصنوعی...');
        this.renderAIChat();
        
        // ========== مقداردهی اولیه حافظه چت ==========
        this.currentChatId = localStorage.getItem('current_chat_id') || 'chat_' + Date.now();
        this.currentChatHistory = [];
        this.permanentMemory = {};
        this.loadPermanentMemory?.();
        this.loadCurrentChatMemory?.();
        
        // ========== رندر اولیه بخش‌ها ==========
        this.renderSearchSection();
        this.renderAddWordSection();
        this.renderTranslate();
        this.renderPracticeOptions();
        this.renderSettings();
        this.renderFavorites();
        this.updateStats();
        
        // ========== ✅ راه‌اندازی مجدد با تاخیر ==========
        // این مهم‌ترین بخشه - اطمینان از اینکه همه چیز بعد از رندر کامل دوباره راه‌اندازی بشه
        
        setTimeout(() => {
            console.log('🔄 مرحله 1: راه‌اندازی اولیه...');
            this.setupLexiCard();
            this.setupFloatingSortButton();
            this.setupSortButtonScroll();
            this.initVerbConjugationTool();
            this.setupLibrary();
            // راه‌اندازی سیستم کشیدن (swipe) برای موبایل
            if (typeof this._setupSwipeGestures === 'function') {
                this._setupSwipeGestures();
            }
        }, 300);
        
        setTimeout(() => {
            console.log('🔄 مرحله 2: رندر لیست لغات و آمار...');
            this._updateLoadingProgress(80, 'بارگذاری لغات...');
            this.renderWordList('all');
            this.setupWordListEventListeners();
            this._updateLoadingProgress(90, 'آماده‌سازی نهایی...');
            this.updateStats();
            this.setupFilterButtons();
        }, 600);
        
        setTimeout(() => {
            console.log('🔄 مرحله 3: راه‌اندازی مجدد بخش‌های وابسته...');
            // راه‌اندازی مجدد برای اطمینان
            if (this.setupLexiCard) this.setupLexiCard();
            if (this.setupFloatingSortButton) this.setupFloatingSortButton();
            if (this.initVerbConjugationTool) this.initVerbConjugationTool();
            if (this.setupLibrary) this.setupLibrary();
            if (this.renderTagFilterBar) this.renderTagFilterBar();
            if (this.updatePracticeTagFilter) this.updatePracticeTagFilter();
            if (this.addTagFilterToExportModal) this.addTagFilterToExportModal();
            console.log('✅ همه بخش‌ها راه‌اندازی شدند');
        }, 1000);
        
        console.log('✅ راه‌اندازی کامل شد');
        
        clearTimeout(forceHide);
        this.hideLoadingScreen();
        
    } catch (error) {
        console.error('❌ خطا:', error);
        clearTimeout(forceHide);
        this.hideLoadingScreen();
    }
}

hideLoadingScreen() {
    if (this._loadingHidden) return;
    
    const loadingScreen = document.getElementById('loading-screen');
    const barFill = document.getElementById('loading-bar-fill');
    const percentEl = document.getElementById('loading-percent');
    const statusEl = document.getElementById('loading-status');
    
    // کامل کردن نوار پیشرفت
    if (barFill) barFill.style.width = '100%';
    if (percentEl) percentEl.textContent = '۱۰۰٪';
    if (statusEl) statusEl.textContent = '✅ آماده!';
    
    // تزریق استایل‌های لودینگ (یک بار)
    if (!document.getElementById('ls-pro-styles')) {
        const style = document.createElement('style');
        style.id = 'ls-pro-styles';
        style.textContent = `
            #loading-screen {
                position: fixed; inset: 0; z-index: 99999;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #134e4a 100%);
                display: flex; align-items: center; justify-content: center;
                transition: opacity .5s ease;
            }
            #loading-screen.fade-out { opacity: 0; pointer-events: none; }
            .loading-content { text-align: center; max-width: 360px; padding: 20px; }
            .loading-logo {
                width: 80px; height: 80px; margin: 0 auto 20px;
                border-radius: 24px;
                background: linear-gradient(135deg, #4361ee, #3a0ca3);
                display: flex; align-items: center; justify-content: center;
                font-size: 36px; color: #fff;
                box-shadow: 0 10px 30px rgba(67,97,238,.4);
                animation: ls-pulse 2s ease-in-out infinite;
            }
            @keyframes ls-pulse {
                0%,100% { transform: scale(1); box-shadow: 0 10px 30px rgba(67,97,238,.4); }
                50% { transform: scale(1.05); box-shadow: 0 15px 40px rgba(67,97,238,.6); }
            }
            .loading-title {
                font-size: 28px; font-weight: 800; color: #f8fafc;
                margin: 0 0 6px; letter-spacing: -0.5px;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            .loading-subtitle {
                font-size: 14px; color: rgba(248,250,252,.6);
                margin: 0 0 28px; font-weight: 500;
            }
            .loading-bar-wrap {
                display: flex; align-items: center; gap: 12px;
                margin-bottom: 12px;
            }
            .loading-bar-track {
                flex: 1; height: 6px;
                background: rgba(255,255,255,.1);
                border-radius: 999px; overflow: hidden;
            }
            .loading-bar-fill {
                height: 100%; width: 0%;
                background: linear-gradient(90deg, #4361ee, #06b6d4, #10b981);
                background-size: 200% 100%;
                border-radius: 999px;
                transition: width .4s cubic-bezier(.22,1,.36,1);
                animation: ls-shimmer 2s linear infinite;
            }
            @keyframes ls-shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            .loading-percent {
                font-size: 13px; font-weight: 800; color: #4361ee;
                min-width: 40px; text-align: left;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            .loading-status {
                font-size: 12px; color: rgba(248,250,252,.5);
                font-weight: 500; margin: 0;
            }
            @media (max-width: 480px) {
                .loading-title { font-size: 24px; }
                .loading-logo { width: 64px; height: 64px; font-size: 28px; }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        this._loadingHidden = true;
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 400);
}

_updateLoadingProgress(percent, status) {
    const barFill = document.getElementById('loading-bar-fill');
    const percentEl = document.getElementById('loading-percent');
    const statusEl = document.getElementById('loading-status');
    
    if (barFill) barFill.style.width = percent + '%';
    if (percentEl) {
        const faNum = String(percent).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        percentEl.textContent = faNum + '٪';
    }
    if (statusEl && status) statusEl.textContent = status;
}

renderInitialSections() {
    console.log('🎨 رندر اولیه بخش‌ها...');
    
    // رندر بخش جستجو
    this.renderSearchSection();
    
    // رندر بخش افزودن لغت
    this.renderAddWordSection();
    
    // رندر بخش مترجم
    this.renderTranslate();
    
    // رندر بخش تمرین
    this.renderPracticeOptions();
    
    // رندر بخش تنظیمات
    this.renderSettings();
    
    // رندر لیست لغات
   
    
    // رندر علاقه‌مندی‌ها
    this.renderFavorites();
    
    // رندر آمار
    this.updateStats();
    
    // رندر AI چت
    this.renderAIChat();
    
    console.log('✅ رندر اولیه کامل شد');
}

} // end of GermanDictionary class

let dictionaryApp;
document.addEventListener('DOMContentLoaded', () => {
    dictionaryApp = new GermanDictionary();
    window.dictionaryApp = dictionaryApp;
});
