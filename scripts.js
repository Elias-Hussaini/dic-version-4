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
    
    const forceHide = setTimeout(() => {
        console.log('⏰ حذف اجباری صفحه لودینگ');
        this.hideLoadingScreen();
    }, 2000);

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
        await this.initDB();
        await this.loadFavorites();
        await this.initSRS();
        
        // ========== راه‌اندازی سیستم تگ ==========
        this.loadTags();
        this.addTagButtonToWordList();
        this.renderTagFilterBar();
        this.updatePracticeTagFilter();
        this.addTagFilterToExportModal();
        
        this.setupEventListeners();
        this.loadCustomization();
        this.updateOnlineStatus();
        this.setupOnlineStatusListener();
        this.setupFloatingMenuQuickSearch();
        this.setupPasswordLock();
        this.checkAndLock();
        this.loadChatMemory();
        this.renderAIChat();
        
        // ========== مقداردهی اولیه حافظه چت ==========
        this.currentChatId = localStorage.getItem('current_chat_id') || 'chat_' + Date.now();
        this.currentChatHistory = [];
        this.permanentMemory = {};
        this.loadPermanentMemory();
        this.loadCurrentChatMemory();
        
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
        }, 300);
        
        setTimeout(() => {
            console.log('🔄 مرحله 2: رندر لیست لغات و آمار...');
            this.renderWordList('all');
            this.setupWordListEventListeners();
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
    this._loadingHidden = true;
    
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
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
// ================================================
// توابع پایه مدیریت تگ
// ================================================

loadTags() {
    try {
        const saved = localStorage.getItem('dictionary_tags');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.tags = new Map(parsed);
        } else {
            this.tags = new Map();
        }
        console.log(`✅ ${this.tags.size} تگ بارگذاری شد`);
    } catch(e) {
        console.error('Error loading tags:', e);
        this.tags = new Map();
    }
}

saveTags() {
    try {
        const toSave = Array.from(this.tags.entries());
        localStorage.setItem('dictionary_tags', JSON.stringify(toSave));
    } catch(e) {
        console.error('Error saving tags:', e);
    }
}

getAllTags() {
    const result = [];
    for (const [id, tag] of this.tags) {
        result.push({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            wordCount: tag.wordIds.length,
            createdAt: tag.createdAt
        });
    }
    return result.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
}

getTagsForWord(wordId) {
    const result = [];
    for (const [id, tag] of this.tags) {
        if (tag.wordIds.includes(wordId)) {
            result.push({ id: tag.id, name: tag.name, color: tag.color });
        }
    }
    return result;
}

addWordToTag(tagId, wordId) {
    const tag = this.tags.get(tagId);
    if (!tag) return false;
    if (!tag.wordIds.includes(wordId)) {
        tag.wordIds.push(wordId);
        this.saveTags();
        return true;
    }
    return false;
}

removeWordFromTag(tagId, wordId) {
    const tag = this.tags.get(tagId);
    if (!tag) return false;
    const index = tag.wordIds.indexOf(wordId);
    if (index !== -1) {
        tag.wordIds.splice(index, 1);
        this.saveTags();
        return true;
    }
    return false;
}

async getWordsByTag(tagId) {
    const tag = this.tags.get(tagId);
    if (!tag || tag.wordIds.length === 0) return [];
    const allWords = await this.getAllWords();
    const wordMap = new Map(allWords.map(w => [w.id, w]));
    const result = tag.wordIds.map(id => wordMap.get(id)).filter(w => w);
    
    // اعمال سورت فعلی روی نتیجه (مهم برای سورت جدیدترین)
    const savedSort = localStorage.getItem('wordListSort') || 'alphabetical';
    this.applySortToFilteredWords(result, savedSort);
    return result;
}

createTag(name, color = null) {
    if (!name || name.trim() === '') {
        return { success: false, message: 'نام تگ نمی‌تواند خالی باشد' };
    }
    for (const [id, tag] of this.tags) {
        if (tag.name === name.trim()) {
            return { success: false, message: 'تگی با این نام قبلاً وجود دارد' };
        }
    }
    const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    let maxId = 0;
    for (const [id] of this.tags) {
        const numId = parseInt(id);
        if (!isNaN(numId) && numId > maxId) maxId = numId;
    }
    const newId = String(maxId + 1);
    
    this.tags.set(newId, {
        id: newId,
        name: name.trim(),
        wordIds: [],
        color: color || colors[Math.floor(Math.random() * colors.length)],
        createdAt: new Date().toISOString()
    });
    this.saveTags();
    return { success: true, tagId: newId, tag: this.tags.get(newId) };
}

deleteTag(tagId) {
    if (this.tags.has(tagId)) {
        this.tags.delete(tagId);
        this.saveTags();
        return { success: true };
    }
    return { success: false };
}

renameTag(tagId, newName) {
    const tag = this.tags.get(tagId);
    if (!tag) return false;
    tag.name = newName.trim();
    this.saveTags();
    return true;
}

changeTagColor(tagId, color) {
    const tag = this.tags.get(tagId);
    if (!tag) return false;
    tag.color = color;
    this.saveTags();
    return true;
}

addMultipleWordsToTag(tagId, wordIds) {
    const tag = this.tags.get(tagId);
    if (!tag) return 0;
    let added = 0;
    for (const wordId of wordIds) {
        if (!tag.wordIds.includes(wordId)) {
            tag.wordIds.push(wordId);
            added++;
        }
    }
    if (added > 0) this.saveTags();
    return added;
}

removeMultipleWordsFromTag(tagId, wordIds) {
    const tag = this.tags.get(tagId);
    if (!tag) return 0;
    let removed = 0;
    for (const wordId of wordIds) {
        const index = tag.wordIds.indexOf(wordId);
        if (index !== -1) {
            tag.wordIds.splice(index, 1);
            removed++;
        }
    }
    if (removed > 0) this.saveTags();
    return removed;
}
renderSearchSection() {
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
                <button id="search-btn" class="btn btn-primary">
                    <i class="fas fa-search"></i> جستجو
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
            <button id="search-btn" class="btn btn-primary">
                <i class="fas fa-search"></i> ${LanguageSystem.t('menu.search')}
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
}

// ========== متد جدید برای رندر بخش افزودن لغت ==========

renderAddWordSection() {
 
    return;
}

renderTranslate() {
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
}
setupTranslateEventListeners(retryCount = 0) {
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
}
showNextFlashcard() {
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
}
// ========== اصلاح متد showWritingExercise - اضافه کردن شماره ==========
showWritingExercise() {
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
}

normalizeAnswer(text) {
    if (!text) return '';
    
    return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')           // چند فاصله رو یکی کن
        .replace(/[،,.;:!?؟]/g, '')     // علائم نگارشی رو حذف کن
        .replace(/[\u200c]/g, ' ')      // نیم‌فاصله رو به فاصله تبدیل کن
        .trim();
}
// مقداردهی اولیه سیستم SRS
async initSRS() {
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
}

// ذخیره داده‌های SRS
saveSRSData() {
    localStorage.setItem('srsData', JSON.stringify(this.srsData));
    localStorage.setItem('lastSrsUpdate', new Date().toISOString());
}

// به روز رسانی لیست لغات نیاز به مرور
updateReviewWords() {
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
}
async checkWritingAnswer() {
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
}
initDB() {
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
}

    // ================================================
    // مدیریت کلمات
    // ================================================

    // ========== دریافت همه کلمات ==========
    async getAllWords() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve([]);
                return;
            }

            try {
                const transaction = this.db.transaction(['words'], 'readonly');
                const store = transaction.objectStore('words');
                const request = store.getAll();
                
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = (event) => {
                    console.error('خطا در getAllWords:', event.target.error);
                    resolve([]);
                };
            } catch (error) {
                console.error('خطا در getAllWords:', error);
                resolve([]);
            }
        });
    }

    // ========== دریافت کلمه با ID ==========
    async getWord(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['words'], 'readonly');
            const store = transaction.objectStore('words');
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    // ========== دریافت کلمات در بازه ==========
    async getWordsByRange(start, end) {
        const allWords = await this.getAllWords();
        const sortedWords = allWords.sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        const startIndex = Math.max(0, start - 1);
        const endIndex = Math.min(sortedWords.length, end);
        
        return sortedWords.slice(startIndex, endIndex);
    }
// ========== اصلاح تابع searchWords ==========

async searchWords(query) {
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
}

// ================================================
// جستجوی عادی - همه نتایج رو لیست میکنه
// ================================================

async normalSearch(query) {
    if (!query || query.length < 2) {
        this.showToast('لطفاً حداقل ۲ حرف وارد کنید', 'warning');
        return;
    }
    
    // ذخیره عبارت جستجو برای بازگشت
    localStorage.setItem('lastSearchQuery', query);
    
    console.log('🔍 جستجوی عادی:', query);
    
    const results = await this.searchWords(query);
    const container = document.getElementById('search-results-container');
    
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="word-card">
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>نتیجه‌ای یافت نشد</h3>
                    <p>برای "${query}" هیچ لغتی پیدا نشد</p>
                    <div class="empty-state-hint mt-4">
                        <i class="fas fa-lightbulb"></i>
                        <span>پیشنهاد: املای کلمه را بررسی کنید یا از مترجم استفاده کنید</span>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    this.renderSearchResultsList(query, results);
}
setupSearchResultItemEvents() {
    // دکمه‌های مشاهده جزئیات
    document.querySelectorAll('.view-word-detail').forEach(btn => {
        btn.removeEventListener('click', this.viewWordDetailHandler);
        this.viewWordDetailHandler = async (e) => {
            const wordId = parseInt(btn.dataset.id);
            const word = await this.getWord(wordId);
            if (word) {
                this.renderWordDetails(word);
            }
        };
        btn.addEventListener('click', this.viewWordDetailHandler);
    });
    
    // آیکون‌های علاقه‌مندی
    document.querySelectorAll('.favorite-icon').forEach(icon => {
        icon.removeEventListener('click', this.favoriteClickHandler);
        this.favoriteClickHandler = async (e) => {
            e.stopPropagation();
            const wordId = parseInt(icon.dataset.id);
            await this.toggleFavorite(wordId);
            icon.classList.toggle('active');
            this.updateFavoritesCount();
        };
        icon.addEventListener('click', this.favoriteClickHandler);
    });
    
    // دکمه‌های تمرین
    document.querySelectorAll('.practice-word').forEach(btn => {
        btn.removeEventListener('click', this.practiceWordHandler);
        this.practiceWordHandler = (e) => {
            const wordId = parseInt(btn.dataset.id);
            this.startPracticeSession([wordId]);
        };
        btn.addEventListener('click', this.practiceWordHandler);
    });
    
    // کلیک روی کل آیتم لیست (اختیاری)
    document.querySelectorAll('.word-list-item').forEach(item => {
        item.removeEventListener('click', this.wordItemClickHandler);
        this.wordItemClickHandler = (e) => {
            // اگه روی دکمه یا آیکون کلیک نشده بود
            if (!e.target.closest('.view-word-detail') && 
                !e.target.closest('.favorite-icon') && 
                !e.target.closest('.practice-word')) {
                const wordId = parseInt(item.dataset.id);
                this.getWord(wordId).then(word => {
                    if (word) this.renderWordDetails(word);
                });
            }
        };
        item.addEventListener('click', this.wordItemClickHandler);
    });
}
showEmptySearchState() {
    const container = document.getElementById('search-results-container');
    if (!container) return;
    
    const isGerman = LanguageSystem.isGerman();
    
    container.innerHTML = `
        <div class="word-card">
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <h3>${isGerman ? 'به DE.Dictionary خوش آمدید!' : 'Welcome to Elias.Dictionary!'}</h3>
                <p>${isGerman ? 'برای جستجو، کلمه مورد نظر را تایپ کنید' : 'Type a word to search'}</p>
                <div class="empty-state-features">
                    <span><i class="fas fa-robot"></i> ${isGerman ? 'دستیار AI' : 'AI Assistant'}</span>
                    <span><i class="fas fa-language"></i> ${isGerman ? 'مترجم آنلاین' : 'Online Translator'}</span>
                    <span><i class="fas fa-chart-line"></i> ${isGerman ? 'آمار پیشرفت' : 'Progress Stats'}</span>
                </div>
            </div>
        </div>
    `;
}

showMinCharWarning() {
    const container = document.getElementById('search-results-container');
    if (!container) return;
    
    const isGerman = LanguageSystem.isGerman();
    
    container.innerHTML = `
        <div class="word-card">
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <h3>${isGerman ? 'حداقل ۲ حرف وارد کنید' : 'Enter at least 2 characters'}</h3>
                <p>${isGerman ? 'برای شروع جستجو، حداقل ۲ حرف تایپ کنید' : 'Type at least 2 characters to start searching'}</p>
            </div>
        </div>
    `;
}
/**
 * تنظیم جستجوی سریع در منوی شناور
 */
setupFloatingMenuQuickSearch() {
    setTimeout(() => {
        const quickSearchInput = document.getElementById('quick');
        if (!quickSearchInput) {
            setTimeout(() => this.setupFloatingMenuQuickSearch(), 1000);
            return;
        }
        
        console.log('✅ فیلد جستجوی سریع پیدا شد');
        
        let searchTimeout;
        
        if (this.floatingMenuSearchHandler) {
            quickSearchInput.removeEventListener('keypress', this.floatingMenuSearchHandler);
        }
        
        const performSearch = (query) => {
            if (!query || query.trim().length < 2) {
                this.showToast('لطفاً حداقل ۲ حرف وارد کنید', 'warning');
                return;
            }
            
            const searchTerm = query.trim();
            
            if (window.EliasMenu && window.EliasMenu.close) {
                window.EliasMenu.close();
            } else {
                const menuContainer = document.getElementById('floating-menu-container');
                if (menuContainer) menuContainer.classList.remove('open');
                const bookBtn = document.getElementById('floating-book-btn');
                if (bookBtn) {
                    bookBtn.classList.remove('pulse-animation');
                    bookBtn.classList.add('rotating');
                }
            }
          
            this.showSection('search-section');
            localStorage.setItem('lastActiveSection', 'search');
            
            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.value = searchTerm;
                    searchInput.focus();
                    this.normalSearch(searchTerm);
                }
            }, 300);
        };
       
        this.floatingMenuSearchHandler = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                if (query) {
                    performSearch(query);
                    e.target.value = '';
                }
            }
        };
        
        quickSearchInput.addEventListener('keypress', this.floatingMenuSearchHandler);
        
        console.log('✅ جستجوی سریع منوی شناور راه‌اندازی شد');
    }, 500);
}
renderSearchResultsList(query, results) {
    const container = document.getElementById('search-results-container');
    if (!container) return;
    
    const sortedResults = [...results].sort((a, b) => a.german.localeCompare(b.german, 'de'));
    const isGerman = LanguageSystem.isGerman();
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2>
                    <i class="fas fa-search" style="color: var(--primary);"></i> 
                    ${isGerman ? 'نتایج جستجو' : 'Search Results'}
                </h2>
                <span class="badge">${sortedResults.length} ${isGerman ? 'لغت' : 'words'}</span>
            </div>
            
            <div class="word-list">
                ${sortedResults.map((word, index) => `
                    <div class="word-list-item" data-id="${word.id}">
                        <div class="word-list-item-header">
                            <div class="word-list-item-title-section">
                                <span class="word-number">${index + 1}</span>
                                <i class="fas fa-star favorite-icon ${this.favorites.has(word.id) ? 'active' : ''}" 
                                   data-id="${word.id}" style="cursor: pointer;"></i>
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
                `).join('')}
            </div>
        </div>
    `;
    
    this.setupWordListEventListeners();
}

// new search   
Quick() {
    const quick = document.getElementById('quick');
    if (!quick) return;
    
    let searchTimeout;
    
    // حذف event listener قبلی
    quick.removeEventListener('input', this.quickSearchHandler);
    
    this.quickSearchHandler = (e) => {
        const query = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (query.length < 2) return;
        
        searchTimeout = setTimeout(() => {
            this.QuickSearch(query);
        }, 800); // 800 میلی‌ثانیه تأخیر
    };
    
    quick.addEventListener('input', this.quickSearchHandler);
}
// ================================================
// کتابخانه شخصی با IndexedDB
// ================================================

async saveBookToIndexedDB(bookData) {
    return new Promise((resolve, reject) => {
        if (!this.db) {
            reject(new Error('دیتابیس در دسترس نیست'));
            return;
        }
        
        const transaction = this.db.transaction(['books'], 'readwrite');
        const store = transaction.objectStore('books');
        const request = store.add(bookData);
        
        request.onsuccess = () => {
            console.log('✅ کتاب در دیتابیس ذخیره شد');
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            console.error('❌ خطا در ذخیره کتاب:', event.target.error);
            reject(event.target.error);
        };
    });
}

async getAllBooksFromIndexedDB() {
    return new Promise((resolve, reject) => {
        if (!this.db) {
            resolve([]);
            return;
        }
        
        const transaction = this.db.transaction(['books'], 'readonly');
        const store = transaction.objectStore('books');
        const request = store.getAll();
        
        request.onsuccess = () => {
            resolve(request.result || []);
        };
        
        request.onerror = (event) => {
            console.error('خطا در دریافت کتاب‌ها:', event.target.error);
            resolve([]);
        };
    });
}

async deleteBookFromIndexedDB(bookId) {
    return new Promise((resolve, reject) => {
        if (!this.db) {
            reject(new Error('دیتابیس در دسترس نیست'));
            return;
        }
        
        const transaction = this.db.transaction(['books'], 'readwrite');
        const store = transaction.objectStore('books');
        const request = store.delete(bookId);
        
        request.onsuccess = () => {
            console.log('✅ کتاب حذف شد');
            resolve();
        };
        
        request.onerror = (event) => {
            console.error('❌ خطا در حذف کتاب:', event.target.error);
            reject(event.target.error);
        };
    });
}

async setupLibrary() {
    console.log('📚 راه‌اندازی کتابخانه...');
    
    setTimeout(async () => {
        const addBookBtn = document.getElementById('add-book-btn');
        const addBookForm = document.getElementById('add-book-form');
        const cancelBtn = document.getElementById('cancel-book-btn');
        const saveBtn = document.getElementById('save-book-btn');
        
        console.log('addBookBtn:', addBookBtn);
        
        if (!addBookBtn) {
            console.error('❌ دکمه add-book-btn پیدا نشد');
            return;
        }
        
        // باز کردن فرم
        addBookBtn.onclick = (e) => {
            e.preventDefault();
            console.log('کلیک روی افزودن کتاب');
            addBookForm.style.display = 'block';
            addBookBtn.style.display = 'none';
        };
        
        // انصراف
        if (cancelBtn) {
            cancelBtn.onclick = (e) => {
                e.preventDefault();
                addBookForm.style.display = 'none';
                addBookBtn.style.display = 'flex';
                this.clearBookForm();
            };
        }
        
        // ذخیره کتاب
        if (saveBtn) {
            saveBtn.onclick = (e) => {
                e.preventDefault();
                this.saveNewBookToIndexedDB();
            };
        }
        
        // بارگذاری کتاب‌ها
        await this.renderBooksListFromIndexedDB();
        
        console.log('✅ کتابخانه راه‌اندازی شد');
    }, 500);
}

async saveNewBookToIndexedDB() {
    const title = document.getElementById('book-title')?.value.trim();
    const author = document.getElementById('book-author')?.value.trim();
    const pdfFile = document.getElementById('book-pdf')?.files[0];
    const coverFile = document.getElementById('book-cover')?.files[0];
    
    console.log('ذخیره کتاب:', { title, author, pdfFile: !!pdfFile, coverFile: !!coverFile });
    
    if (!title || !author) {
        this.showToast('❌ لطفاً نام کتاب و نویسنده را وارد کنید', 'error');
        return;
    }
    
    if (!pdfFile) {
        this.showToast('❌ لطفاً فایل PDF کتاب را انتخاب کنید', 'error');
        return;
    }
    
  // در متد saveNewBookToIndexedDB، محدودیت رو عوض کن:
if (pdfFile.size > 50 * 1024 * 1024) { // 50 مگابایت
    this.showToast('❌ حجم فایل PDF نباید بیشتر از 50 مگابایت باشد', 'error');
    return;
}
    
    this.showToast('📥 در حال ذخیره کتاب... لطفاً صبر کنید', 'info');
    
    // خواندن فایل PDF
    const pdfReader = new FileReader();
    pdfReader.onload = async (e) => {
        const pdfData = e.target.result;
        
        let coverData = null;
        
        if (coverFile) {
            // محدودیت حجم جلد (حداکثر 2 مگابایت)
           if (coverFile.size > 5 * 1024 * 1024) { // 5 مگابایت
    this.showToast('❌ حجم تصویر جلد نباید بیشتر از 5 مگابایت باشد', 'error');
    return;
}
            
            const coverReader = new FileReader();
            coverReader.onload = async (e2) => {
                coverData = e2.target.result;
                await this.saveBookToStorage(title, author, pdfData, coverData);
            };
            coverReader.readAsDataURL(coverFile);
        } else {
            await this.saveBookToStorage(title, author, pdfData, null);
        }
    };
    pdfReader.onerror = () => {
        this.showToast('❌ خطا در خواندن فایل PDF', 'error');
    };
    pdfReader.readAsDataURL(pdfFile);
}

async saveBookToStorage(title, author, pdfData, coverData) {
    const newBook = {
        id: Date.now(),
        title: title,
        author: author,
        pdfData: pdfData,
        coverData: coverData,
        createdAt: new Date().toISOString()
    };
    
    try {
        await this.saveBookToIndexedDB(newBook);
        this.showToast(`✅ کتاب "${title}" با موفقیت اضافه شد`, 'success');
        this.clearBookForm();
        
        const addBookForm = document.getElementById('add-book-form');
        const addBookBtn = document.getElementById('add-book-btn');
        
        if (addBookForm) addBookForm.style.display = 'none';
        if (addBookBtn) addBookBtn.style.display = 'flex';
        
        await this.renderBooksListFromIndexedDB();
    } catch (error) {
        console.error('خطا در ذخیره کتاب:', error);
        this.showToast('❌ خطا در ذخیره کتاب. فضای کافی وجود ندارد', 'error');
    }
}

async renderBooksListFromIndexedDB() {
    const books = await this.getAllBooksFromIndexedDB();
    const container = document.getElementById('books-list');
    const emptyState = document.getElementById('empty-library');
    const isGerman = LanguageSystem.isGerman();
    
    console.log('رندر کتاب‌ها، تعداد:', books.length);
    
    if (!container) {
        console.error('❌ کانتینر books-list پیدا نشد');
        return;
    }
    
    if (books.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    container.innerHTML = books.map(book => `
        <div class="book-card" data-id="${book.id}" style="
            background: var(--white);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            cursor: pointer;
            border: 1px solid var(--gray-200);
        ">
            <div class="book-cover" style="
                height: 200px;
                background: ${book.coverData ? `url('${book.coverData}') center/cover` : 'linear-gradient(135deg, #667eea, #764ba2)'};
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                ${!book.coverData ? `<i class="fas fa-book" style="font-size: 60px; color: rgba(255,255,255,0.5);"></i>` : ''}
                <div class="book-overlay" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                ">
                    <i class="fas fa-eye" style="font-size: 30px; color: white;"></i>
                </div>
            </div>
            <div class="book-info" style="padding: 15px;">
                <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 5px; color: var(--gray-800);">${this.escapeHtml(book.title)}</h3>
                <p style="font-size: 14px; color: var(--gray-500); margin-bottom: 10px;">
                    <i class="fas fa-user"></i> ${this.escapeHtml(book.author)}
                </p>
                <div class="book-meta" style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: var(--gray-400);">
                        <i class="fas fa-calendar-alt"></i> ${new Date(book.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                    <button class="delete-book-btn" data-id="${book.id}" style="
                        background: none;
                        border: none;
                        color: var(--gray-400);
                        cursor: pointer;
                        font-size: 16px;
                        padding: 5px;
                        transition: color 0.2s ease;
                    ">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // رویداد کلیک روی کارت کتاب
    document.querySelectorAll('.book-card').forEach(card => {
        card.onclick = (e) => {
            if (!e.target.closest('.delete-book-btn')) {
                const id = parseInt(card.dataset.id);
                this.viewBookFromIndexedDB(id);
            }
        };
    });
    
    // رویداد حذف کتاب
    document.querySelectorAll('.delete-book-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            if (confirm('آیا از حذف این کتاب مطمئن هستید؟')) {
                await this.deleteBookFromIndexedDB(id);
                await this.renderBooksListFromIndexedDB();
                this.showToast('🗑️ کتاب حذف شد', 'info');
            }
        };
    });
}

async viewBookFromIndexedDB(bookId) {
    const books = await this.getAllBooksFromIndexedDB();
    const book = books.find(b => b.id === bookId);
    
    if (!book) {
        this.showToast('❌ کتاب یافت نشد', 'error');
        return;
    }
    
    let modal = document.getElementById('view-book-modal');
    if (!modal) {
        this.createBookModal();
        modal = document.getElementById('view-book-modal');
    }
    
    const titleEl = document.getElementById('view-book-title');
    const pdfViewer = document.getElementById('book-pdf-viewer');
    const downloadBtn = document.getElementById('download-book-pdf');
    
    if (!titleEl || !pdfViewer) {
        console.error('❌ المان‌های مودال پیدا نشد');
        this.showToast('❌ خطا در نمایش کتاب', 'error');
        return;
    }
    
    titleEl.innerHTML = `<i class="fas fa-book"></i> ${this.escapeHtml(book.title)}`;
    
    // روش جدید: تبدیل PDF dataURL به blob و نمایش
    try {
        // تبدیل dataURL به blob
        const blob = this.dataURLToBlob(book.pdfData);
        const url = URL.createObjectURL(blob);
        pdfViewer.src = url;
        
        // ذخیره URL برای پاک کردن بعداً
        pdfViewer.onload = () => {
            URL.revokeObjectURL(url);
        };
    } catch (error) {
        console.error('خطا در نمایش PDF:', error);
        // روش جایگزین: استفاده از dataURL مستقیم
        pdfViewer.src = book.pdfData;
    }
    
    modal.style.display = 'flex';
    
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = book.pdfData;
            link.download = `${book.title}.pdf`;
            link.click();
            this.showToast('📥 دانلود کتاب شروع شد', 'success');
        };
    }
    
    const closeBtn = document.getElementById('close-view-book');
    const closeBtn2 = document.getElementById('close-view-book-btn');
    
    const closeModal = () => {
        modal.style.display = 'none';
        pdfViewer.src = '';
    };
    
    if (closeBtn) closeBtn.onclick = closeModal;
    if (closeBtn2) closeBtn2.onclick = closeModal;
    
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

// تبدیل dataURL به Blob
dataURLToBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}
createBookModal() {
    // چک کن قبلاً ساخته شده
    if (document.getElementById('view-book-modal')) return;
    
    const modalHTML = `
        <div id="view-book-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 900px; width: 90%;">
                <div class="modal-header">
                    <h3 id="view-book-title"><i class="fas fa-book"></i> عنوان کتاب</h3>
                    <button class="close-modal" id="close-view-book">&times;</button>
                </div>
                <div class="modal-body" style="padding: 0;">
                    <iframe id="book-pdf-viewer" src="" style="width: 100%; height: 70vh; border: none;"></iframe>
                </div>
                <div class="modal-footer">
                    <button id="download-book-pdf" class="btn btn-success">
                        <i class="fas fa-download"></i> دانلود PDF
                    </button>
                    <button id="close-view-book-btn" class="btn btn-outline">بستن</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('✅ مودال کتاب ساخته شد');
}

clearBookForm() {
    const titleInput = document.getElementById('book-title');
    const authorInput = document.getElementById('book-author');
    const pdfInput = document.getElementById('book-pdf');
    const coverInput = document.getElementById('book-cover');
    
    if (titleInput) titleInput.value = '';
    if (authorInput) authorInput.value = '';
    if (pdfInput) pdfInput.value = '';
    if (coverInput) coverInput.value = '';
}









async QuickSearch(query) {
    console.log('⚡ جستجوی سریع:', query);
    
    const results = await this.searchWords(query);
    
    if (results.length === 0) {
        // اگه نتیجه‌ای نبود، پیام بده
        const container = document.getElementById('search-results-container');
        if (container) {
            container.innerHTML = `
                <div class="word-card">
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h3>نتیجه‌ای یافت نشد</h3>
                        <p>برای "${query}" هیچ لغتی پیدا نشد</p>
                    </div>
                </div>
            `;
        }
        return;
    }
    
    // ========== فقط اولین نتیجه رو نشون بده ==========
    this.renderWordDetails(results[0]);
}
async renderWordDetails(word) {
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
}
// توابع کمکی برای رندر جزئیات
renderNounDetails(word) {
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
}

renderVerbDetails(word) {
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
}

renderAdjectiveDetails(word) {
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
}

renderPrepositionDetails(word) {
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
}
async getCurrentWordList() {
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
}
async goToPrevWord() {
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
}

async goToNextWord() {
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
}
setupDetailNavigation() {
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
}
setupDetailEventListeners(word) {
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
}
async deleteExample(exampleId) {
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
}
// ================================================
// LexiCard - کارت هوشمند واژگان
// ================================================


// ================================================
// LexiCard - کارت هوشمند واژگان
// ================================================

setupLexiCard() {
    console.log('🔧 راه‌اندازی LexiCard...');
    
    const searchInput = document.getElementById('lexi-search-input');
    const searchBtn = document.getElementById('lexi-search-btn');
    const suggestionsDiv = document.getElementById('lexi-suggestions');
    
    if (!searchInput) return;
    
    // بارگذاری استایل ذخیره شده
    this.lexiCardStyle = localStorage.getItem('lexiCardStyle') || 'modern';
    
    // فعال کردن دکمه استایل مناسب
    document.querySelectorAll('.style-btn').forEach(btn => {
        if (btn.dataset.style === this.lexiCardStyle) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // دکمه جستجو
    searchBtn.onclick = () => {
        const query = searchInput.value.trim();
        if (query) {
            suggestionsDiv.style.display = 'none';
            this.generateLexiCard(query);
        } else {
            this.showToast('لطفاً نام لغت را وارد کنید', 'warning');
        }
    };
    
    // جستجو با Enter
    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                suggestionsDiv.style.display = 'none';
                this.generateLexiCard(query);
            }
        }
    };
    
    // ========== جستجوی زنده با پیشنهادات ==========
    let searchTimeout;
    searchInput.oninput = (e) => {
        const query = e.target.value.trim();
        clearTimeout(searchTimeout);
        
        if (query.length >= 2) {
            searchTimeout = setTimeout(() => {
                this.showLexiSuggestions(query);
            }, 400);
        } else {
            suggestionsDiv.style.display = 'none';
        }
    };
    
    // کلیک خارج از پیشنهادات
    document.addEventListener('click', (e) => {
        if (!suggestionsDiv.contains(e.target) && e.target !== searchInput) {
            suggestionsDiv.style.display = 'none';
        }
    });
    
    // دکمه‌های استایل
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.onclick = () => {
            this.lexiCardStyle = btn.dataset.style;
            localStorage.setItem('lexiCardStyle', this.lexiCardStyle);
            
            document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (this.currentLexiWord) {
                this.renderLexiCard(this.currentLexiWord);
            }
            
            this.showToast(`استایل به ${this.getStyleName(this.lexiCardStyle)} تغییر کرد`, 'success');
        };
    });
    
    // دکمه‌ها
    document.getElementById('download-lexi-card').onclick = () => this.downloadLexiCard();
    document.getElementById('print-lexi-card').onclick = () => this.printLexiCard();
    
    console.log('✅ LexiCard راه‌اندازی شد');
}

getStyleName(style) {
    const names = { modern: 'مدرن', classic: 'کلاسیک', minimal: 'مینیمال', dark: 'دارک' };
    return names[style] || style;
}

async generateLexiCard(query) {
    const words = await this.getAllWords();
    const word = words.find(w => w.german.toLowerCase() === query.toLowerCase());
    
    if (!word) {
        this.showToast(`❌ لغت "${query}" یافت نشد`, 'error');
        return;
    }
    
    this.currentLexiWord = word;
    this.renderLexiCard(word);
    this.showToast(`✅ کارت "${word.german}" ساخته شد`, 'success');
}

async renderLexiCard(word) {
    const examples = await this.getExamplesForWord(word.id);
    
    document.getElementById('lexi-empty-state').style.display = 'none';
    document.getElementById('lexi-card-preview').style.display = 'block';
    
    const container = document.getElementById('lexi-card-container');
    container.innerHTML = this.buildLexiCardHTML(word, examples);
}

buildLexiCardHTML(word, examples) {
    const style = this.lexiCardStyle;
    const isGerman = LanguageSystem.isGerman();
    
    // رنگ جنسیت
    let genderColor = '#667eea';
    let genderText = '';
    if (word.gender === 'masculine') {
        genderColor = '#3b82f6';
        genderText = 'der';
    } else if (word.gender === 'feminine') {
        genderColor = '#ec4899';
        genderText = 'die';
    } else if (word.gender === 'neuter') {
        genderColor = '#10b981';
        genderText = 'das';
    }
    
    // آیکون بر اساس نوع
    let wordIcon = 'fa-book';
    let typeText = '';
    if (word.type === 'verb') { 
        wordIcon = 'fa-running'; 
        typeText = 'فعل';
    } else if (word.type === 'adjective') { 
        wordIcon = 'fa-palette'; 
        typeText = 'صفت';
    } else if (word.type === 'noun') { 
        wordIcon = 'fa-tag'; 
        typeText = 'اسم';
    } else if (word.type === 'preposition') { 
        wordIcon = 'fa-link'; 
        typeText = 'حرف اضافه';
    } else if (word.type === 'adverb') { 
        wordIcon = 'fa-clock'; 
        typeText = 'قید';
    }
    
    // جمع (برای اسم)
    let pluralHtml = '';
    if (word.type === 'noun' && word.plural) {
        pluralHtml = `<div class="lexi-plural"><span>جمع:</span> ${this.escapeHtml(word.plural)}</div>`;
    }
    
    // صرف فعل (برای فعل)
    let verbHtml = '';
    if (word.type === 'verb' && word.verbForms) {
        const vf = word.verbForms;
        verbHtml = `
            <div class="lexi-verb-section">
                <div class="lexi-verb-title"><i class="fas fa-table"></i> صرف فعل</div>
                <div class="lexi-verb-grid">
                    <div class="lexi-verb-item ${vf.separable ? 'separable' : ''}">
                        <span class="label">حال ساده</span>
                        <span class="value">${vf.present || '—'}</span>
                    </div>
                    <div class="lexi-verb-item">
                        <span class="label">گذشته ساده</span>
                        <span class="value">${vf.past || '—'}</span>
                    </div>
                    <div class="lexi-verb-item">
                        <span class="label">گذشته کامل</span>
                        <span class="value">${vf.perfect || '—'}</span>
                    </div>
                    ${vf.future ? `
                    <div class="lexi-verb-item">
                        <span class="label">آینده</span>
                        <span class="value">${this.escapeHtml(vf.future)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="lexi-verb-meta">
                    <span><i class="fas fa-link"></i> کمکی: ${vf.helper || 'haben'}</span>
                    ${vf.separable ? '<span><i class="fas fa-cut"></i> جداشدنی</span>' : ''}
                </div>
            </div>
        `;
    }
    
    // حالت تفضیلی (برای صفت)
    let adjHtml = '';
    if (word.type === 'adjective') {
        adjHtml = `
            <div class="lexi-adj-section">
                <div class="lexi-adj-header"><i class="fas fa-chart-line"></i> حالت‌های صفت</div>
                <div class="lexi-adj-grid">
                    ${word.comparative ? `<div><span class="label">برتر (Komparativ):</span> <span class="value">${this.escapeHtml(word.comparative)}</span></div>` : ''}
                    ${word.superlative ? `<div><span class="label">برترین (Superlativ):</span> <span class="value">${this.escapeHtml(word.superlative)}</span></div>` : ''}
                    ${word.antonym ? `<div><span class="label">متضاد:</span> <span class="value">${this.escapeHtml(word.antonym)}</span></div>` : ''}
                </div>
            </div>
        `;
    }
    
    // حرف اضافه
    let prepHtml = '';
    if (word.type === 'preposition') {
        prepHtml = `
            <div class="lexi-prep-section">
                <div class="lexi-prep-header"><i class="fas fa-map-marker-alt"></i> حرف اضافه</div>
                <div><span class="label">حالت:</span> <span class="value">${word.case || 'نامشخص'}</span></div>
                ${word.meanings ? `<div><span class="label">معانی:</span> <span class="value">${this.escapeHtml(word.meanings)}</span></div>` : ''}
            </div>
        `;
    }
    
    // تلفظ
    let pronunciationHtml = '';
    if (word.pronunciation) {
        pronunciationHtml = `<div class="lexi-pronunciation"><i class="fas fa-microphone-alt"></i> ${this.escapeHtml(word.pronunciation)}</div>`;
    }
    
    // برچسب‌ها
    let tagsHtml = '';
    if (word.tags && word.tags.length > 0) {
        tagsHtml = `<div class="lexi-tags">${word.tags.map(tag => `<span>#${this.escapeHtml(tag)}</span>`).join('')}</div>`;
    }
    
    // مثال‌ها
    const examplesHtml = examples && examples.length > 0 ? `
        <div class="lexi-examples">
            <div class="lexi-examples-title"><i class="fas fa-quote-right"></i> مثال‌ها</div>
            ${examples.slice(0, 3).map(ex => `
                <div class="lexi-example-item">
                    <div class="lexi-example-german">${this.escapeHtml(ex.german)}</div>
                    <div class="lexi-example-persian">📖 ${this.escapeHtml(ex.persian)}</div>
                </div>
            `).join('')}
        </div>
    ` : '';
    
    // ========== استایل مدرن (پیش‌فرض) ==========
    if (style === 'modern') {
        return `
            <div class="lexi-card-modern" style="background: linear-gradient(135deg, ${genderColor}, ${this.darkenColor(genderColor)});">
                <div class="lexi-card-header">
                    <div>
                        <div class="lexi-word">${word.german}</div>
                        <div class="lexi-badges">
                            ${word.gender ? `<span class="lexi-gender-badge">${genderText}</span>` : ''}
                            ${word.type ? `<span class="lexi-type-badge">${typeText}</span>` : ''}
                            ${word.plural ? `<span class="lexi-plural-badge">${word.plural}</span>` : ''}
                        </div>
                    </div>
                    <div class="lexi-icon-box">
                        <i class="fas ${wordIcon}"></i>
                    </div>
                </div>
                
                <div class="lexi-meaning-box">
                    <div class="lexi-meaning-label">${isGerman ? 'معنی' : 'Meaning'}</div>
                    <div class="lexi-meaning-text">${word.persian}</div>
                </div>
                
                ${pronunciationHtml}
                ${pluralHtml}
                ${verbHtml}
                ${adjHtml}
                ${prepHtml}
                ${tagsHtml}
                ${examplesHtml}
                
                <div class="lexi-footer">
                    <span><i class="fas fa-calendar-alt"></i> ${new Date(word.createdAt).toLocaleDateString('fa-IR')}</span>
                    <span><i class="fas fa-id-card"></i> LexiCard</span>
                </div>
            </div>
        `;
    }
    
    // ========== استایل مینیمال ==========
    if (style === 'minimal') {
        return `
            <div class="lexi-card-minimal" style="border-top: 4px solid ${genderColor};">
                <div class="lexi-card-header">
                    <div class="lexi-word" style="color: ${genderColor};">${word.german}</div>
                    <div class="lexi-icon-box">
                        <i class="fas ${wordIcon}" style="color: ${genderColor};"></i>
                    </div>
                </div>
                <div class="lexi-meaning-text">${word.persian}</div>
                ${verbHtml}
                ${examplesHtml}
                <div class="lexi-footer">${new Date(word.createdAt).toLocaleDateString('fa-IR')}</div>
            </div>
        `;
    }
    
    // ========== استایل کلاسیک ==========
    if (style === 'classic') {
        return `
            <div class="lexi-card-classic">
                <div class="lexi-card-header">
                    <div>
                        <div class="lexi-word" style="color: ${genderColor};">${word.german}</div>
                        <div class="lexi-badges">
                            ${word.gender ? `<span class="lexi-gender-badge" style="background: ${genderColor};">${genderText}</span>` : ''}
                            ${word.type ? `<span class="lexi-type-badge">${typeText}</span>` : ''}
                        </div>
                    </div>
                    <div class="lexi-icon-box" style="background: ${genderColor}20; color: ${genderColor};">
                        <i class="fas ${wordIcon}"></i>
                    </div>
                </div>
                <div class="lexi-meaning-box">
                    <div class="lexi-meaning-label">معنی</div>
                    <div class="lexi-meaning-text">${word.persian}</div>
                </div>
                ${pluralHtml}
                ${verbHtml}
                ${adjHtml}
                ${examplesHtml}
                <div class="lexi-footer">${new Date(word.createdAt).toLocaleDateString('fa-IR')}</div>
            </div>
        `;
    }
    
    // ========== استایل دارک ==========
    return `
        <div class="lexi-card-dark">
            <div class="lexi-card-header">
                <div>
                    <div class="lexi-word">${word.german}</div>
                    <div class="lexi-badges">
                        ${word.gender ? `<span class="lexi-gender-badge" style="background: ${genderColor};">${genderText}</span>` : ''}
                        ${word.type ? `<span class="lexi-type-badge">${typeText}</span>` : ''}
                    </div>
                </div>
                <div class="lexi-icon-box">
                    <i class="fas ${wordIcon}"></i>
                </div>
            </div>
            <div class="lexi-meaning-box">
                <div class="lexi-meaning-label">معنی</div>
                <div class="lexi-meaning-text">${word.persian}</div>
            </div>
            ${verbHtml}
            ${examplesHtml}
            <div class="lexi-footer">LexiCard Dark</div>
        </div>
    `;
}

darkenColor(color) {
    const colors = {
        '#3b82f6': '#1e40af',
        '#ec4899': '#be185d', 
        '#10b981': '#047857',
        '#667eea': '#5b21b6'
    };
    return colors[color] || '#4c1d95';
}

downloadLexiCard() {
    const card = document.querySelector('#lexi-card-container > div');
    if (!card) {
        this.showToast('❌ کارتی برای دانلود وجود ندارد', 'error');
        return;
    }
    
    // نمایش لودینگ بلافاصله
    this.showSimpleLoadingSpinner();
    
    // استفاده از setTimeout برای اطمینان از نمایش لودینگ قبل از شروع کار سنگین
    setTimeout(() => {
        html2canvas(card, {
            scale: 2,
            backgroundColor: null,
            logging: false,
            useCORS: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `lexicard-${this.currentLexiWord?.german || 'card'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // کمی تاخیر برای اطمینان از دانلود
            setTimeout(() => {
                this.hideSimpleLoadingSpinner();
                this.showToast('✅ کارت با موفقیت دانلود شد', 'success');
            }, 500);
        }).catch(error => {
            console.error('Error:', error);
            this.hideSimpleLoadingSpinner();
            this.showToast('❌ خطا در دانلود', 'error');
        });
    }, 50);
}
printLexiCard() {
    const card = document.querySelector('#lexi-card-container > div');
    if (!card) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>LexiCard - ${this.currentLexiWord?.german}</title>
            <style>
                body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; background: white; }
                * { font-family: 'Vazirmatn', sans-serif; }
                @media print {
                    body { margin: 0; padding: 0; }
                }
            </style>
        </head>
        <body>${card.outerHTML}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}


// جستجوی زنده با پیشنهادات
async showLexiSuggestions(query) {
    const words = await this.getAllWords();
    const results = words.filter(w => 
        w.german.toLowerCase().startsWith(query.toLowerCase())
    ).slice(0, 6);
    
    const suggestionsDiv = document.getElementById('lexi-suggestions');
    
    if (results.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    suggestionsDiv.style.display = 'block';
    suggestionsDiv.innerHTML = results.map(word => `
        <div class="lexi-suggestion-item" data-word="${word.german}">
            <div>
                <span class="lexi-suggestion-word">${this.escapeHtml(word.german)}</span>
                <span class="lexi-suggestion-meaning">${this.escapeHtml(word.persian.substring(0, 30))}...</span>
            </div>
            <span class="lexi-suggestion-type ${word.type}">${this.getTypeLabel(word.type)}</span>
        </div>
    `).join('');
    
    document.querySelectorAll('.lexi-suggestion-item').forEach(item => {
        item.onclick = () => {
            const word = item.dataset.word;
            document.getElementById('lexi-search-input').value = word;
            suggestionsDiv.style.display = 'none';
            this.generateLexiCard(word);
        };
    });
}










// ================================================
// جستجوی سریع - همونطور که تایپ میکنی
// ================================================
setupQuickSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    let searchTimeout;
    
    // حذف event listener قبلی
    if (this.quickSearchHandler) {
        searchInput.removeEventListener('input', this.quickSearchHandler);
    }
    
    this.quickSearchHandler = (e) => {
        const query = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (query.length === 0) {
            // اگه خالی شد، حالت خالی رو نشون بده
            this.showEmptySearchState();
            return;
        }
        
        if (query.length < 2) {
            // اگه کمتر از ۲ حرف بود، پیام بده
            this.showMinCharWarning();
            return;
        }
        
        // با تأخیر 500 میلی‌ثانیه جستجو کن
        searchTimeout = setTimeout(() => {
            this.performQuickSearch(query);
        }, 500);
    };
    
    searchInput.addEventListener('input', this.quickSearchHandler);
}
async performQuickSearch(query) {
    console.log('⚡ جستجوی سریع:', query);
    
    const results = await this.searchWords(query);
    const container = document.getElementById('search-results-container');
    
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="word-card">
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>نتیجه‌ای یافت نشد</h3>
                    <p>برای "${query}" هیچ لغتی پیدا نشد</p>
                    <small>پیشنهاد: املای کلمه را بررسی کنید</small>
                </div>
            </div>
        `;
        return;
    }
    
    // ========== نمایش لیست نتایج، نه فقط اولین نتیجه ==========
    this.renderSearchResultsList(query, results);
}


setupSearchEventListeners() {
    // دکمه جستجو - جستجوی عادی (لیست همه نتایج)
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = document.getElementById('search-input').value.trim();
            if (query) {
                this.normalSearch(query);
            }
        });
    }

    // اینتر در فیلد جستجو - جستجوی عادی (لیست همه نتایج)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                if (query) {
                    this.normalSearch(query);
                }
            }
        });
    }
    
    // ========== جستجوی سریع (همینطور که تایپ میکنی) - فقط پیشنهادات ==========
    this.setupQuickSearch();
}
async addWord(wordData) {
    return new Promise((resolve, reject) => {
        if (!wordData.german || !wordData.persian) {
            reject(new Error('لغت و معنی الزامی هستند'));
            return;
        }

        const transaction = this.db.transaction(['words'], 'readwrite');
        const store = transaction.objectStore('words');
        
        const index = store.index('german');
        const checkRequest = index.get(wordData.german.toLowerCase());
        
        checkRequest.onsuccess = async () => {
            if (checkRequest.result) {
                this.showToast('این لغت قبلاً در دیکشنری وجود دارد', 'error');
                reject(new Error('کلمه تکراری'));
                return;
            }
            
            // ساخت آبجکت نهایی با تمام فیلدها
            const finalWord = {
                id: Date.now(),
                german: wordData.german.trim(),
                persian: wordData.persian.trim(),
                type: wordData.type || 'other',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // ========== فیلد توضیحات ==========
            if (wordData.notes) finalWord.notes = wordData.notes;
            
            // ========== فیلدهای اسم ==========
            if (wordData.type === 'noun') {
                if (wordData.gender) finalWord.gender = wordData.gender;
                if (wordData.plural) finalWord.plural = wordData.plural;
            }
            
            // ========== فیلدهای فعل ==========
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
            
            // ========== فیلدهای صفت ==========
            if (wordData.type === 'adjective') {
                if (wordData.comparative) finalWord.comparative = wordData.comparative;
                if (wordData.superlative) finalWord.superlative = wordData.superlative;
                if (wordData.antonym) finalWord.antonym = wordData.antonym;
            }
            
            // ========== فیلدهای حرف اضافه ==========
            if (wordData.type === 'preposition') {
                if (wordData.case) finalWord.case = wordData.case;
                if (wordData.meanings) finalWord.meanings = wordData.meanings;
            }
            
            // ========== فیلدهای مشترک ==========
            if (wordData.example) finalWord.example = wordData.example;
            if (wordData.exampleTranslation) finalWord.exampleTranslation = wordData.exampleTranslation;
            if (wordData.pronunciation) finalWord.pronunciation = wordData.pronunciation;
            if (wordData.tags) finalWord.tags = wordData.tags;
            
            const addRequest = store.add(finalWord);
            
            addRequest.onsuccess = async () => {
                const wordId = addRequest.result;
                
                // ذخیره مثال در دیتابیس examples (برای سازگاری با بخش مثال‌ها)
                if (wordData.example && wordData.exampleTranslation) {
                    try {
                        await this.addExample(wordId, {
                            german: wordData.example,
                            persian: wordData.exampleTranslation
                        });
                    } catch (error) {
                        console.error('خطا در ذخیره مثال:', error);
                    }
                }
                
                this.showToast('✅ لغت با موفقیت اضافه شد', 'success');
                this.clearAddWordForm();
                
                setTimeout(() => {
                    this.renderWordList();
                    this.updateStats();
                }, 100);
                
                resolve(wordId);
            };
            
            addRequest.onerror = (event) => {
                console.error('خطا در افزودن کلمه:', event.target.error);
                this.showToast('❌ خطا در ذخیره لغت', 'error');
                reject(event.target.error);
            };
        };
        
        checkRequest.onerror = (event) => {
            reject(event.target.error);
        };
    });
}
  async updateWord(wordData) {
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['words'], 'readwrite');
        const store = transaction.objectStore('words');
        const request = store.put(wordData);
        
        request.onsuccess = () => {
            this.showToast('✅ لغت با موفقیت ویرایش شد', 'success');
            this.renderWordList();
            this.updateStats();
            resolve();
        };
        
        request.onerror = (event) => {
            this.showToast('❌ خطا در ویرایش لغت', 'error');
            reject(event.target.error);
        };
    });
}

    // ========== حذف کلمه ==========
    async deleteWord(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['words', 'favorites', 'examples', 'practiceHistory'], 'readwrite');
            
            // حذف کلمه
            const wordStore = transaction.objectStore('words');
            wordStore.delete(id);
            
            // حذف از علاقه‌مندی‌ها
            const favStore = transaction.objectStore('favorites');
            favStore.delete(id);
            
            // حذف مثال‌ها
            const exStore = transaction.objectStore('examples');
            const exIndex = exStore.index('wordId');
            const exRequest = exIndex.getAll(id);
            
            exRequest.onsuccess = () => {
                exRequest.result.forEach(ex => {
                    exStore.delete(ex.id);
                });
            };
            
            // حذف تاریخچه تمرین
            const phStore = transaction.objectStore('practiceHistory');
            const phIndex = phStore.index('wordId');
            const phRequest = phIndex.getAll(id);
            
            phRequest.onsuccess = () => {
                phRequest.result.forEach(ph => {
                    phStore.delete(ph.id);
                });
            };
            
            transaction.oncomplete = () => {
                this.favorites.delete(id);
                this.showToast('✅ لغت با موفقیت حذف شد', 'success');
                this.renderWordList();
                this.updateStats();
                resolve();
            };
            
            transaction.onerror = (event) => {
                this.showToast('❌ خطا در حذف لغت', 'error');
                reject(event.target.error);
            };
        });
    }
clearAddWordForm() {
    // پاک کردن فیلدهای اصلی
    const germanWord = document.getElementById('german-word');
    const persianMeaning = document.getElementById('persian-meaning');
    if (germanWord) germanWord.value = '';
    if (persianMeaning) persianMeaning.value = '';
    
    // ========== پاک کردن فیلد توضیحات (Notes) ==========
    const wordNotes = document.getElementById('word-notes');
    if (wordNotes) wordNotes.value = '';
    
    // پاک کردن فیلدهای اسم
    const nounPlural = document.getElementById('noun-plural');
    if (nounPlural) nounPlural.value = '';
    
    // پاک کردن فیلدهای فعل
    const verbFields = ['verb-present', 'verb-past', 'verb-perfect', 'verb-future', 'verb-konjunktiv'];
    verbFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const separableCheck = document.getElementById('verb-separable');
    if (separableCheck) separableCheck.checked = false;
    const habenRadio = document.querySelector('input[name="verb-helper"][value="haben"]');
    if (habenRadio) habenRadio.checked = true;
    
    // پاک کردن فیلدهای صفت
    const adjFields = ['adj-komparativ', 'adj-superlativ', 'adj-antonym'];
    adjFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    // پاک کردن فیلدهای حرف اضافه
    const prepCase = document.getElementById('prep-case');
    if (prepCase) prepCase.value = 'Akkusativ';
    const prepMeanings = document.getElementById('prep-meanings');
    if (prepMeanings) prepMeanings.value = '';
    
    // پاک کردن فیلدهای مشترک
    const example = document.getElementById('example');
    const exampleTranslation = document.getElementById('example-translation');
    const pronunciation = document.getElementById('pronunciation');
    const wordTags = document.getElementById('word-tags');
    if (example) example.value = '';
    if (exampleTranslation) exampleTranslation.value = '';
    if (pronunciation) pronunciation.value = '';
    if (wordTags) wordTags.value = '';
    
    // ریست نوع کلمه به اسم
    document.querySelectorAll('.type-card').forEach(card => {
        card.classList.remove('active');
    });
    const nounCard = document.querySelector('.type-card[data-type="noun"]');
    if (nounCard) nounCard.classList.add('active');
    
    // ریست جنسیت به masculine
    document.querySelectorAll('.gender-option').forEach(opt => {
        opt.classList.remove('active');
    });
    const masculineOpt = document.querySelector('.gender-option.masculine');
    if (masculineOpt) masculineOpt.classList.add('active');
    
    // نمایش فیلدهای اسم، مخفی کردن بقیه
    this.toggleTypeFields('noun');
    
    // ========== حذف پیشنهادات AI ==========
    const aiSuggestion = document.getElementById('ai-example-suggestion');
    if (aiSuggestion) aiSuggestion.remove();
    const aiVerbSuggestion = document.getElementById('ai-verb-suggestion');
    if (aiVerbSuggestion) aiVerbSuggestion.remove();
    
    // ========== حذف دکمه هوش مصنوعی ==========
    const aiFillBtn = document.getElementById('ai-fill-all-btn');
    if (aiFillBtn) aiFillBtn.style.display = 'none';
    
    // به‌روزرسانی شمارنده فیلدها
    this.updateFieldCount();
    
    console.log('🧹 فرم با موفقیت پاک شد (شامل توضیحات)');
}
toggleTypeFields(type) {
    const nounFields = document.getElementById('noun-fields');
    const verbFields = document.getElementById('verb-fields');
    const adjFields = document.getElementById('adjective-fields');
    const prepFields = document.getElementById('preposition-fields');
    
    // مخفی کردن همه
    if (nounFields) nounFields.style.display = 'none';
    if (verbFields) verbFields.style.display = 'none';
    if (adjFields) adjFields.style.display = 'none';
    if (prepFields) prepFields.style.display = 'none';
    
    // نمایش بر اساس نوع
    if (type === 'noun') {
        if (nounFields) nounFields.style.display = 'block';
    } else if (type === 'verb') {
        if (verbFields) verbFields.style.display = 'block';
    } else if (type === 'adjective') {
        if (adjFields) adjFields.style.display = 'block';
    } else if (type === 'preposition') {
        if (prepFields) prepFields.style.display = 'block';
    }
    
    // به‌روزرسانی شمارنده فیلدها
    this.updateFieldCount();
}

updateFieldCount() {
    const filledInputs = document.querySelectorAll('#add-word-section .modern-input, #add-word-section textarea');
    let count = 0;
    filledInputs.forEach(input => {
        if (input.value && input.value.trim() !== '') count++;
    });
    const countBadge = document.getElementById('field-count-badge');
    if (countBadge) {
        countBadge.innerHTML = `${count} فیلد تکمیل شده`;
    }
}

updateFieldCount() {
    const filledInputs = document.querySelectorAll('#add-word-section .modern-input, #add-word-section textarea');
    let count = 0;
    filledInputs.forEach(input => {
        if (input.value && input.value.trim() !== '') count++;
    });
    const countBadge = document.getElementById('field-count-badge');
    if (countBadge) {
        countBadge.innerHTML = `${count} فیلد تکمیل شده`;
    }
}
async sortWordListAdvanced(filter, sortType) {
    const words = await this.getAllWords();
    const container = document.getElementById('word-list-container');
    const isGerman = LanguageSystem.isGerman();
    
    if (!container) return;
    
    localStorage.setItem('wordListSort', sortType);
    
    let filteredWords = [];
    
    // فیلتر بر اساس تگ (اگر تگ خاصی انتخاب شده)
    if (this.currentTagFilter && this.currentTagFilter !== 'all') {
        const tagWords = await this.getWordsByTag(this.currentTagFilter);
        const tagWordIds = new Set(tagWords.map(w => w.id));
        filteredWords = words.filter(word => tagWordIds.has(word.id));
    } else {
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
                filteredWords = [...words];
        }
    }
    
    // ========== اعمال سورت ==========
    if (sortType === 'date-desc') {
        filteredWords.sort((a, b) => b.id - a.id);
    } 
    else if (sortType === 'date-asc') {
        filteredWords.sort((a, b) => a.id - b.id);
    }
    else if (sortType === 'alphabetical') {
        filteredWords.sort((a, b) => a.german.localeCompare(b.german, 'de'));
    }
    else if (sortType === 'alphabetical-persian') {
        filteredWords.sort((a, b) => a.persian.localeCompare(b.persian, 'fa'));
    }
    else if (sortType === 'srs-level') {
        filteredWords.sort((a, b) => (this.srsData[b.id]?.level || 0) - (this.srsData[a.id]?.level || 0));
    }
    else if (sortType === 'tag') {
        filteredWords.sort((a, b) => {
            const tagsA = this.getTagsForWord(a.id);
            const tagsB = this.getTagsForWord(b.id);
            if (tagsA.length !== tagsB.length) return tagsB.length - tagsA.length;
            if (tagsA.length > 0 && tagsB.length > 0) {
                return tagsA[0].name.localeCompare(tagsB[0].name, 'fa');
            }
            return 0;
        });
    }
    else if (sortType === 'random') {
        for (let i = filteredWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filteredWords[i], filteredWords[j]] = [filteredWords[j], filteredWords[i]];
        }
    }
    
    // ========== مهم: به‌روزرسانی currentWordList برای ناوبری ==========
    this.currentWordList = [...filteredWords];
    
    document.getElementById('total-words-count').textContent = filteredWords.length;
    
    if (filteredWords.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="fas fa-book"></i></div><h3>هیچ لغتی یافت نشد</h3></div>`;
        return;
    }
    
    // رندر لیست
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    for (let index = 0; index < filteredWords.length; index++) {
        const word = filteredWords[index];
        const wordTags = this.getTagsForWord(word.id);
        const hasTag = wordTags.length > 0;
        
        const div = document.createElement('div');
        div.className = 'word-list-item';
        div.setAttribute('data-id', word.id);
        div.innerHTML = `
            <div class="word-list-item-header">
                <div class="word-list-item-title-section">
                    <span class="word-number">${index + 1}</span>
                    ${this.srsData[word.id] ? `<span class="srs-level srs-level-${this.srsData[word.id].level}">${this.srsData[word.id].level}</span>` : '<span class="srs-level srs-level-0">0</span>'}
                    <i class="fas fa-star favorite-icon ${this.favorites.has(word.id) ? 'active' : ''}" data-id="${word.id}"></i>
                    <span class="word-list-item-title">${this.escapeHtml(word.german)}</span>
                    ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                    ${word.type ? `<span class="word-type">${this.getTypeLabel(word.type)}</span>` : ''}
                    ${hasTag ? `
                        <div class="word-tag-icons">
                            ${wordTags.map(tag => `
                                <span class="tag-icon" style="background: ${tag.color};" title="${this.escapeHtml(tag.name)}">
                                    <i class="fas fa-tag"></i>
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
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
                <button class="tag-word-btn ${hasTag ? 'has-tag' : ''}" data-id="${word.id}" data-word="${this.escapeHtml(word.german)}" title="${isGerman ? 'مدیریت پوشه‌ها' : 'Manage folders'}">
                    <i class="fas fa-folder-plus"></i>
                </button>
            </div>
        `;
        fragment.appendChild(div);
    }
    
    container.appendChild(fragment);
    
    // راه‌اندازی مجدد event listenerها
    this.setupWordListEventListeners();
    this.setupTagWordButtons();
    
    const modal = document.getElementById('sort-modal');
    if (modal) modal.style.display = 'none';
    
    const sortNames = {
        'alphabetical': 'الفبایی (آلمانی)',
        'alphabetical-persian': 'الفبایی (فارسی)',
        'date-desc': 'جدیدترین',
        'date-asc': 'قدیمی‌ترین',
        'srs-level': 'سطح یادگیری',
        'tag': 'پوشه',
        'random': 'تصادفی'
    };
    this.showToast(`مرتب‌سازی بر اساس ${sortNames[sortType] || sortType}`, 'success');
}

renderTagFilterBar() {
    const wordListSection = document.getElementById('word-list-section');
    const existingBar = wordListSection.querySelector('.tag-filter-bar');
    if (existingBar) existingBar.remove();
    
    const tags = this.getAllTags();
    if (tags.length === 0) return;
    
    const isGerman = LanguageSystem.isGerman();
    const currentTag = this.currentTagFilter ? tags.find(t => t.id === this.currentTagFilter) : null;
    
    const filterBar = document.createElement('div');
    filterBar.className = 'tag-filter-bar';
    filterBar.innerHTML = `
        <div class="tag-filter-dropdown">
            <button id="tag-filter-toggle-btn" class="tag-filter-toggle">
                <i class="fas fa-filter"></i>
                <span>${currentTag ? currentTag.name : (isGerman ? 'فیلتر بر اساس پوشه' : 'Filter by folder')}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div id="tag-filter-menu" class="tag-filter-menu" style="display: none;">
                <button class="tag-filter-option ${!this.currentTagFilter ? 'active' : ''}" data-tag-id="all">
                    <i class="fas fa-globe"></i> ${isGerman ? 'همه لغات' : 'All words'}
                </button>
                ${tags.map(tag => `
                    <button class="tag-filter-option ${this.currentTagFilter === tag.id ? 'active' : ''}" data-tag-id="${tag.id}" style="border-right: 3px solid ${tag.color};">
                        <span class="tag-option-dot" style="background: ${tag.color};"></span>
                        ${this.escapeHtml(tag.name)}
                        <span class="tag-option-count">(${tag.wordCount})</span>
                    </button>
                `).join('')}
            </div>
        </div>
        ${this.currentTagFilter ? `<button id="clear-tag-filter" class="btn-clear-filter"><i class="fas fa-times"></i> ${isGerman ? 'پاک کردن فیلتر' : 'Clear filter'}</button>` : ''}
    `;
    
    const filterButtons = wordListSection.querySelector('.filter-buttons');
    if (filterButtons) {
        filterButtons.insertAdjacentElement('afterend', filterBar);
    }
    
    // رویداد باز/بستن dropdown
    const toggleBtn = document.getElementById('tag-filter-toggle-btn');
    const filterMenu = document.getElementById('tag-filter-menu');
    
    if (toggleBtn && filterMenu) {
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            const isOpen = filterMenu.style.display === 'block';
            filterMenu.style.display = isOpen ? 'none' : 'block';
        };
        
        document.addEventListener('click', (e) => {
            if (!filterBar.contains(e.target)) {
                filterMenu.style.display = 'none';
            }
        });
    }
    
    // رویدادهای گزینه‌های فیلتر - اعمال مستقیم فیلتر و رندر مجدد
    document.querySelectorAll('.tag-filter-option').forEach(btn => {
        btn.onclick = () => {
            const tagId = btn.dataset.tagId;
            this.currentTagFilter = tagId === 'all' ? null : tagId;
            filterMenu.style.display = 'none';
            
            // رندر مجدد لیست با فیلتر جدید (سورت فعلی حفظ می‌شود)
            this.renderWordList();
            
            if (this.currentTagFilter) {
                const tag = tags.find(t => t.id === tagId);
                this.showToast(`📁 نمایش لغات پوشه "${tag.name}"`, 'info');
            } else {
                this.showToast(`🌍 نمایش همه لغات`, 'info');
            }
        };
    });
    
    const clearBtn = document.getElementById('clear-tag-filter');
    if (clearBtn) {
        clearBtn.onclick = () => {
            this.currentTagFilter = null;
            this.renderWordList();
            this.showToast(`🌍 فیلتر حذف شد`, 'info');
        };
    }
}
// ================================================
// مودال مدیریت تگ
// ================================================

createTagManagerModal() {
    if (document.getElementById('tag-manager-modal')) return;
    
    const modalHTML = `
        <div id="tag-manager-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 900px; max-height: 85vh;">
                <div class="modal-header">
                    <h3><i class="fas fa-folder-tree"></i> مدیریت پوشه‌ها</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body" style="overflow-y: auto;"></div>
                <div class="modal-footer">
                    <button class="btn btn-outline close-modal-btn">بستن</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('tag-manager-modal');
    modal.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
        btn.onclick = () => modal.style.display = 'none';
    });
}

showTagManagerModal() {
    let modal = document.getElementById('tag-manager-modal');
    if (!modal) {
        this.createTagManagerModal();
        modal = document.getElementById('tag-manager-modal');
    }
    
    const tags = this.getAllTags();
    const isGerman = LanguageSystem.isGerman();
    
    this.getAllWords().then(async allWords => {
        const savedSort = localStorage.getItem('wordListSort') || 'alphabetical';
        this.applySortToFilteredWords(allWords, savedSort);
        this.bulkAllWords = allWords;
        this.bulkFilteredWords = [...allWords];
        this.bulkSelectedWordIds.clear();
        this.bulkCurrentPage = 1;
        
        const modalBody = modal.querySelector('.modal-body');
   modalBody.innerHTML = `
    <div class="tag-manager-header">
        <div class="add-tag-section">
            <input type="text" id="new-tag-name" class="form-control" placeholder="${isGerman ? 'نام پوشه جدید...' : 'New folder name...'}">
            <input type="color" id="new-tag-color" class="tag-color-picker" value="#667eea">
            <button id="create-tag-btn" class="btn btn-primary">
                <i class="fas fa-plus"></i> ${isGerman ? 'ایجاد' : 'Create'}
            </button>
        </div>
    </div>
    
    <div class="tags-list-header">
        <span><i class="fas fa-folder"></i> ${isGerman ? 'پوشه‌های شما' : 'Your Folders'} (${tags.length})</span>
        <button id="refresh-tags-list" class="btn btn-sm btn-outline"><i class="fas fa-sync-alt"></i></button>
    </div>
    <div class="tags-list-container" id="tags-list-container">
        ${this.renderTagsListHTML()}
    </div>
    
    <div class="bulk-tag-section">
        <div class="bulk-header">
            <h4><i class="fas fa-layer-group"></i> ${isGerman ? 'انتخاب دسته‌جمعی لغات' : 'Bulk Select Words'}</h4>
            <div class="bulk-selection-controls">
                <button id="bulk-select-all" class="btn btn-sm btn-outline">${isGerman ? 'همه' : 'All'}</button>
                <button id="bulk-select-favorites" class="btn btn-sm btn-outline"><i class="fas fa-star"></i> ${isGerman ? 'علاقه‌مندی‌ها' : 'Favorites'}</button>
                <button id="bulk-select-range" class="btn btn-sm btn-outline"><i class="fas fa-arrows-alt-h"></i> ${isGerman ? 'محدوده' : 'Range'}</button>
                <button id="bulk-clear-selection" class="btn btn-sm btn-outline">${isGerman ? 'لغو' : 'Clear'}</button>
            </div>
        </div>
        
        <div id="bulk-range-inputs" class="bulk-range-inputs" style="display: none;">
            <div class="range-input-wrapper">
                <input type="number" id="bulk-range-start" class="form-control range-input" placeholder="${isGerman ? 'از لغت شماره' : 'From word #'}" min="1">
                <span class="range-separator">-</span>
                <input type="number" id="bulk-range-end" class="form-control range-input" placeholder="${isGerman ? 'تا لغت شماره' : 'To word #'}" min="1">
                <button id="bulk-apply-range" class="btn btn-sm btn-primary">${isGerman ? 'اعمال' : 'Apply'}</button>
            </div>
        </div>
        
        <div class="bulk-search">
            <input type="text" id="bulk-word-search" class="form-control" placeholder="${isGerman ? 'جستجوی لغت...' : 'Search word...'}">
        </div>
        
        <div class="bulk-words-list" id="bulk-words-list"></div>
        
        <div class="bulk-pagination" id="bulk-pagination"></div>
        
        <div class="bulk-footer">
            <div class="bulk-selected-info" id="bulk-selected-info">0 ${isGerman ? 'لغت انتخاب شده' : 'words selected'}</div>
            <div class="bulk-actions">
                <select id="bulk-tag-select" class="form-control" style="min-width: 160px; width: auto; padding: 8px 12px; font-family: 'Vazirmatn', sans-serif;">
                    <option value="">${isGerman ? '📁 انتخاب پوشه...' : '📁 Select folder...'}</option>
                    ${tags.map(t => `<option value="${t.id}" style="border-right: 3px solid ${t.color};">📂 ${this.escapeHtml(t.name)} (${t.wordCount})</option>`).join('')}
                </select>
                <button id="bulk-add-to-tag" class="btn btn-success" style="padding: 8px 16px;">
                    <i class="fas fa-plus"></i> ${isGerman ? 'اضافه' : 'Add'}
                </button>
                <button id="bulk-remove-from-tag" class="btn btn-danger" style="padding: 8px 16px;">
                    <i class="fas fa-trash"></i> ${isGerman ? 'حذف' : 'Remove'}
                </button>
            </div>
        </div>
    </div>
`;
        modal.style.display = 'flex';
        this.renderBulkWordsList();
        this.setupTagManagerEvents();
        this.setupBulkSelectionEvents();
    });
}

renderTagsListHTML() {
    const tags = this.getAllTags();
    const isGerman = LanguageSystem.isGerman();
    
    if (tags.length === 0) {
        return `<div class="empty-state-tags">${isGerman ? 'هیچ پوشه‌ای وجود ندارد' : 'No folders yet'}</div>`;
    }
    
    return tags.map(tag => `
        <div class="tag-item" data-tag-id="${tag.id}">
            <div class="tag-info">
                <div class="tag-color-dot" style="background: ${tag.color};"></div>
                <div class="tag-name">${this.escapeHtml(tag.name)}</div>
                <div class="tag-word-count">(${tag.wordCount})</div>
            </div>
            <div class="tag-actions">
                <button class="tag-action-btn edit-tag" data-id="${tag.id}" data-name="${this.escapeHtml(tag.name)}" data-color="${tag.color}" title="${isGerman ? 'ویرایش' : 'Edit'}">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="tag-action-btn delete-tag" data-id="${tag.id}" title="${isGerman ? 'حذف' : 'Delete'}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

setupTagManagerEvents() {
    const createBtn = document.getElementById('create-tag-btn');
    if (createBtn) {
        createBtn.onclick = () => {
            const name = document.getElementById('new-tag-name').value.trim();
            const color = document.getElementById('new-tag-color').value;
            if (name) {
                const result = this.createTag(name, color);
                if (result.success) {
                    this.showToast(`✅ پوشه "${name}" ایجاد شد`, 'success');
                    document.getElementById('new-tag-name').value = '';
                    this.showTagManagerModal();
                    this.renderTagFilterBar();
                    this.updatePracticeTagFilter();
                    this.addTagFilterToExportModal();
                    this.renderWordList(); // بروزرسانی لیست لغات
                } else {
                    this.showToast(result.message, 'error');
                }
            }
        };
    }
    
    const refreshBtn = document.getElementById('refresh-tags-list');
    if (refreshBtn) {
        refreshBtn.onclick = () => this.showTagManagerModal();
    }
    
    document.querySelectorAll('.edit-tag').forEach(btn => {
        btn.onclick = () => {
            const tagId = btn.dataset.id;
            const currentName = btn.dataset.name;
            const currentColor = btn.dataset.color;
            
            const newName = prompt('نام جدید:', currentName);
            if (newName && newName.trim()) {
                this.renameTag(tagId, newName);
            }
            
            const newColor = prompt('رنگ جدید (مثل #ff0000):', currentColor);
            if (newColor && newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                this.changeTagColor(tagId, newColor);
            }
            
            this.showTagManagerModal();
            this.renderTagFilterBar();
            this.updatePracticeTagFilter();
            this.addTagFilterToExportModal();
            this.renderWordList();
        };
    });
    
    document.querySelectorAll('.delete-tag').forEach(btn => {
        btn.onclick = async () => {
            const tagId = btn.dataset.id;
            const tag = this.getAllTags().find(t => t.id === tagId);
            if (tag && confirm(`آیا از حذف پوشه "${tag.name}" مطمئن هستید؟`)) {
                this.deleteTag(tagId);
                this.showTagManagerModal();
                this.renderTagFilterBar();
                this.updatePracticeTagFilter();
                this.addTagFilterToExportModal();
                this.renderWordList();
                this.showToast(`🗑️ پوشه "${tag.name}" حذف شد`, 'success');
            }
        };
    });
}
// ================================================
// صفحه‌بندی و انتخاب دسته‌جمعی
// ================================================

renderBulkWordsList() {
    const container = document.getElementById('bulk-words-list');
    if (!container) return;
    
    const searchTerm = document.getElementById('bulk-word-search')?.value.toLowerCase() || '';
    let filtered = this.bulkAllWords;
    
    if (searchTerm) {
        filtered = this.bulkAllWords.filter(w => 
            w.german.toLowerCase().includes(searchTerm) || 
            w.persian.toLowerCase().includes(searchTerm)
        );
    }
    
    this.bulkFilteredWords = filtered;
    const totalPages = Math.ceil(filtered.length / this.bulkWordsPerPage);
    const start = (this.bulkCurrentPage - 1) * this.bulkWordsPerPage;
    const end = start + this.bulkWordsPerPage;
    const pageWords = filtered.slice(start, end);
    
    container.innerHTML = pageWords.map((word, idx) => {
        const globalIndex = start + idx + 1;
        return `
            <label class="bulk-word-item" data-word-id="${word.id}">
                <input type="checkbox" class="bulk-word-checkbox" value="${word.id}" ${this.bulkSelectedWordIds.has(word.id) ? 'checked' : ''}>
                <span class="bulk-word-number">${globalIndex}</span>
                <span class="bulk-word-german">${this.escapeHtml(word.german)}</span>
                <span class="bulk-word-persian">${this.escapeHtml(word.persian)}</span>
                ${this.favorites.has(word.id) ? '<span class="favorite-star"><i class="fas fa-star"></i></span>' : ''}
            </label>
        `;
    }).join('');
    
    if (pageWords.length === 0) {
        container.innerHTML = `<div class="empty-bulk-words">${searchTerm ? 'نتیجه‌ای یافت نشد' : 'هیچ لغتی موجود نیست'}</div>`;
    }
    
    this.renderBulkPagination(totalPages);
    
    document.querySelectorAll('.bulk-word-checkbox').forEach(cb => {
        cb.onchange = (e) => {
            const wordId = parseInt(cb.value);
            if (cb.checked) {
                this.bulkSelectedWordIds.add(wordId);
            } else {
                this.bulkSelectedWordIds.delete(wordId);
            }
            document.getElementById('bulk-selected-info').innerHTML = `${this.bulkSelectedWordIds.size} لغت انتخاب شده`;
        };
    });
}

renderBulkPagination(totalPages) {
    const container = document.getElementById('bulk-pagination');
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let pages = [];
    let startPage = Math.max(1, this.bulkCurrentPage - 4);
    let endPage = Math.min(totalPages, startPage + 9);
    
    if (endPage - startPage < 9) {
        startPage = Math.max(1, endPage - 9);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pages.push(`
            <button class="bulk-page-btn ${this.bulkCurrentPage === i ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `);
    }
    
    container.innerHTML = `
        <button class="bulk-page-btn prev" ${this.bulkCurrentPage === 1 ? 'disabled' : ''} data-page="${this.bulkCurrentPage - 1}">
            <i class="fas fa-chevron-right"></i>
        </button>
        ${pages.join('')}
        <button class="bulk-page-btn next" ${this.bulkCurrentPage === totalPages ? 'disabled' : ''} data-page="${this.bulkCurrentPage + 1}">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    document.querySelectorAll('.bulk-page-btn').forEach(btn => {
        btn.onclick = () => {
            const page = parseInt(btn.dataset.page);
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                this.bulkCurrentPage = page;
                this.renderBulkWordsList();
            }
        };
    });
}

setupBulkSelectionEvents() {
    const selectRangeBtn = document.getElementById('bulk-select-range');
    const rangeInputs = document.getElementById('bulk-range-inputs');
    
    if (selectRangeBtn && rangeInputs) {
        selectRangeBtn.onclick = () => {
            const isVisible = rangeInputs.style.display === 'flex';
            rangeInputs.style.display = isVisible ? 'none' : 'flex';
            if (!isVisible) {
                setTimeout(() => {
                    document.getElementById('bulk-range-start')?.focus();
                }, 100);
            }
        };
    }
    
    const applyRangeBtn = document.getElementById('bulk-apply-range');
    if (applyRangeBtn) {
        applyRangeBtn.onclick = () => {
            const start = parseInt(document.getElementById('bulk-range-start').value);
            const end = parseInt(document.getElementById('bulk-range-end').value);
            
            if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
                this.showToast('محدوده نامعتبر', 'error');
                return;
            }
            
            const words = this.bulkFilteredWords || this.bulkAllWords;
            for (let i = start - 1; i < Math.min(end, words.length); i++) {
                if (words[i]) this.bulkSelectedWordIds.add(words[i].id);
            }
            document.getElementById('bulk-selected-info').innerHTML = `${this.bulkSelectedWordIds.size} لغت انتخاب شده`;
            this.renderBulkWordsList();
            rangeInputs.style.display = 'none';
            document.getElementById('bulk-range-start').value = '';
            document.getElementById('bulk-range-end').value = '';
            
            this.showToast(`✅ ${this.bulkSelectedWordIds.size} لغت از محدوده ${start} تا ${end} انتخاب شد`, 'success');
        };
    }
    
    document.getElementById('bulk-select-all')?.addEventListener('click', () => {
        const words = this.bulkFilteredWords || this.bulkAllWords;
        words.forEach(w => this.bulkSelectedWordIds.add(w.id));
        document.getElementById('bulk-selected-info').innerHTML = `${this.bulkSelectedWordIds.size} لغت انتخاب شده`;
        this.renderBulkWordsList();
        this.showToast(`✅ همه ${this.bulkSelectedWordIds.size} لغت انتخاب شد`, 'success');
    });
    
    document.getElementById('bulk-select-favorites')?.addEventListener('click', () => {
        const words = this.bulkFilteredWords || this.bulkAllWords;
        words.forEach(w => {
            if (this.favorites.has(w.id)) this.bulkSelectedWordIds.add(w.id);
        });
        document.getElementById('bulk-selected-info').innerHTML = `${this.bulkSelectedWordIds.size} لغت انتخاب شده`;
        this.renderBulkWordsList();
        this.showToast(`✅ ${this.bulkSelectedWordIds.size} لغت مورد علاقه انتخاب شد`, 'success');
    });
    
    document.getElementById('bulk-clear-selection')?.addEventListener('click', () => {
        this.bulkSelectedWordIds.clear();
        document.getElementById('bulk-selected-info').innerHTML = `0 لغت انتخاب شده`;
        this.renderBulkWordsList();
        this.showToast(`🗑️ همه انتخاب‌ها لغو شد`, 'info');
    });
    
    const searchInput = document.getElementById('bulk-word-search');
    if (searchInput) {
        searchInput.oninput = () => {
            this.bulkCurrentPage = 1;
            this.renderBulkWordsList();
        };
    }
    
    document.getElementById('bulk-add-to-tag')?.addEventListener('click', () => {
        const tagId = document.getElementById('bulk-tag-select').value;
        if (!tagId) {
            this.showToast('لطفاً یک پوشه انتخاب کنید', 'warning');
            return;
        }
        if (this.bulkSelectedWordIds.size === 0) {
            this.showToast('هیچ لغتی انتخاب نشده', 'warning');
            return;
        }
        const added = this.addMultipleWordsToTag(tagId, Array.from(this.bulkSelectedWordIds));
        this.showToast(`✅ ${added} لغت به پوشه اضافه شد`, 'success');
        this.bulkSelectedWordIds.clear();
        document.getElementById('bulk-selected-info').innerHTML = `0 لغت انتخاب شده`;
        this.renderBulkWordsList();
        this.renderTagFilterBar();
        this.updatePracticeTagFilter();
        this.addTagFilterToExportModal();
        this.renderWordList(); // بروزرسانی لیست لغات
    });
    
    document.getElementById('bulk-remove-from-tag')?.addEventListener('click', () => {
        const tagId = document.getElementById('bulk-tag-select').value;
        if (!tagId) {
            this.showToast('لطفاً یک پوشه انتخاب کنید', 'warning');
            return;
        }
        if (this.bulkSelectedWordIds.size === 0) {
            this.showToast('هیچ لغتی انتخاب نشده', 'warning');
            return;
        }
        const removed = this.removeMultipleWordsFromTag(tagId, Array.from(this.bulkSelectedWordIds));
        this.showToast(`🗑️ ${removed} لغت از پوشه حذف شد`, 'success');
        this.bulkSelectedWordIds.clear();
        document.getElementById('bulk-selected-info').innerHTML = `0 لغت انتخاب شده`;
        this.renderBulkWordsList();
        this.renderTagFilterBar();
        this.updatePracticeTagFilter();
        this.addTagFilterToExportModal();
        this.renderWordList();
    });
}
addTagFilterToExportModal() {
    setTimeout(() => {
        const modal = document.getElementById('export-words-modal');
        if (!modal) {
            console.log('❌ مودال خروجی تصویری پیدا نشد');
            return;
        }
        
        const tags = this.getAllTags();
        if (tags.length === 0) {
            console.log('❌ هیچ تگی برای نمایش در خروجی تصویری وجود ندارد');
            return;
        }
        
        const isGerman = LanguageSystem.isGerman();
        
        // حذف فیلتر قبلی اگر وجود داشت
        const existingFilter = modal.querySelector('.export-tag-filter');
        if (existingFilter) existingFilter.remove();
        
        // پیدا کردن toolbar
        let toolbar = modal.querySelector('.export-toolbar');
        
        // اگه toolbar وجود نداره، خودمون می‌سازیم
        if (!toolbar) {
            const modalHeader = modal.querySelector('.export-modal-header');
            if (modalHeader) {
                toolbar = document.createElement('div');
                toolbar.className = 'export-toolbar';
                toolbar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 12px; padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; align-items: center;';
                modalHeader.insertAdjacentElement('afterend', toolbar);
            }
        }
        
        if (!toolbar) {
            console.log('❌ toolbar در مودال خروجی تصویری پیدا نشد');
            return;
        }
        
        const tagFilterSection = document.createElement('div');
        tagFilterSection.className = 'export-tag-filter';
        tagFilterSection.style.marginLeft = 'auto';
        
        const currentTag = this.exportTagFilter ? tags.find(t => t.id === this.exportTagFilter) : null;
        
        tagFilterSection.innerHTML = `
            <div class="export-tag-dropdown" style="position: relative; display: inline-block;">
                <button id="export-tag-filter-btn" class="export-tag-filter-toggle" style="display: flex; align-items: center; gap: 10px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 30px; cursor: pointer; font-size: 13px; font-family: 'Vazirmatn', sans-serif;">
                    <i class="fas fa-folder"></i>
                    <span id="export-tag-selected-name">${currentTag ? currentTag.name : (isGerman ? 'انتخاب پوشه' : 'Select folder')}</span>
                    <i class="fas fa-chevron-down" style="font-size: 12px;"></i>
                </button>
                <div id="export-tag-filter-menu" class="export-tag-filter-menu" style="display: none; position: absolute; top: 100%; right: 0; min-width: 220px; background: var(--white); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 1000; margin-top: 5px; border: 1px solid var(--gray-200); overflow: hidden;">
                    <button class="export-tag-option ${!this.exportTagFilter ? 'active' : ''}" data-tag-id="all" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 15px; border: none; background: transparent; cursor: pointer; text-align: right; font-size: 13px; font-family: 'Vazirmatn', sans-serif; transition: all 0.2s; border-right: 3px solid transparent;">
                        <i class="fas fa-globe"></i> ${isGerman ? 'همه لغات' : 'All words'}
                    </button>
                    ${tags.map(tag => `
                        <button class="export-tag-option ${this.exportTagFilter === tag.id ? 'active' : ''}" data-tag-id="${tag.id}" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 15px; border: none; background: transparent; cursor: pointer; text-align: right; font-size: 13px; font-family: 'Vazirmatn', sans-serif; transition: all 0.2s; border-right: 3px solid ${tag.color};">
                            <span class="tag-option-dot" style="width: 10px; height: 10px; border-radius: 50%; background: ${tag.color}; display: inline-block;"></span>
                            ${this.escapeHtml(tag.name)}
                            <span class="tag-option-count" style="font-size: 11px; color: var(--gray-500); margin-right: auto;">(${tag.wordCount})</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        toolbar.appendChild(tagFilterSection);
        
        const toggleBtn = document.getElementById('export-tag-filter-btn');
        const filterMenu = document.getElementById('export-tag-filter-menu');
        const selectedNameSpan = document.getElementById('export-tag-selected-name');
        
        if (toggleBtn && filterMenu) {
            toggleBtn.onclick = (e) => {
                e.stopPropagation();
                const isOpen = filterMenu.style.display === 'block';
                filterMenu.style.display = isOpen ? 'none' : 'block';
            };
            
            document.addEventListener('click', (e) => {
                if (!tagFilterSection.contains(e.target)) {
                    if (filterMenu) filterMenu.style.display = 'none';
                }
            });
        }
        
        document.querySelectorAll('.export-tag-option').forEach(btn => {
            btn.onclick = async () => {
                const tagId = btn.dataset.tagId;
                console.log('📁 انتخاب پوشه در خروجی تصویری:', tagId);
                
                this.exportTagFilter = tagId === 'all' ? null : tagId;
                if (filterMenu) filterMenu.style.display = 'none';
                
                if (this.exportTagFilter) {
                    const tagWords = await this.getWordsByTag(this.exportTagFilter);
                    this.allWordsForExport = tagWords;
                    this.filteredWordsForExport = [...tagWords];
                    const tag = tags.find(t => t.id === tagId);
                    if (selectedNameSpan && tag) selectedNameSpan.textContent = tag.name;
                    this.showToast(`📁 نمایش لغات پوشه "${tag.name}"`, 'info');
                } else {
                    this.allWordsForExport = await this.getAllWords();
                    this.filteredWordsForExport = [...this.allWordsForExport];
                    if (selectedNameSpan) selectedNameSpan.textContent = isGerman ? 'انتخاب پوشه' : 'Select folder';
                    this.showToast(`🌍 نمایش همه لغات`, 'info');
                }
                
                const sortSelect = document.getElementById('export-sort-select');
                if (sortSelect) {
                    this.applyExportSort(this.filteredWordsForExport, sortSelect.value);
                }
                this.renderExportWordsList();
                this.updateSelectedCountDisplay();
                
                // بروزرسانی کلاس active
                document.querySelectorAll('.export-tag-option').forEach(b => {
                    b.classList.remove('active');
                    if (b.dataset.tagId === tagId) b.classList.add('active');
                });
                
                // ذخیره در localStorage
                if (this.exportTagFilter) {
                    localStorage.setItem('exportTagFilter', this.exportTagFilter);
                } else {
                    localStorage.removeItem('exportTagFilter');
                }
            };
        });
        
        // بازیابی انتخاب قبلی از localStorage
        const savedExportTag = localStorage.getItem('exportTagFilter');
        if (savedExportTag && this.tags.has(savedExportTag)) {
            this.exportTagFilter = savedExportTag;
            const tag = tags.find(t => t.id === savedExportTag);
            if (selectedNameSpan && tag) selectedNameSpan.textContent = tag.name;
            setTimeout(async () => {
                const tagWords = await this.getWordsByTag(savedExportTag);
                this.allWordsForExport = tagWords;
                this.filteredWordsForExport = [...tagWords];
                const sortSelect = document.getElementById('export-sort-select');
                if (sortSelect) {
                    this.applyExportSort(this.filteredWordsForExport, sortSelect.value);
                }
                this.renderExportWordsList();
                this.updateSelectedCountDisplay();
                const activeOpt = document.querySelector(`.export-tag-option[data-tag-id="${savedExportTag}"]`);
                if (activeOpt) {
                    document.querySelectorAll('.export-tag-option').forEach(b => b.classList.remove('active'));
                    activeOpt.classList.add('active');
                }
            }, 100);
        }
        
        console.log('✅ فیلتر پوشه به خروجی تصویری اضافه شد');
        
    }, 500);
}
// ================================================
// مودال انتخاب تگ برای یک لغت
// ================================================

createTagSelectionModal() {
    if (document.getElementById('tag-selection-modal')) return;
    
    const isGerman = LanguageSystem.isGerman();
    const modalHTML = `
        <div id="tag-selection-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h3><i class="fas fa-folder-plus"></i> ${isGerman ? 'مدیریت پوشه‌ها' : 'Manage folders'}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="tag-selection-list" class="tag-selection-list"></div>
                    <button id="create-tag-from-selection" class="btn btn-outline btn-sm" style="margin-top: 15px; width: 100%;">
                        <i class="fas fa-plus"></i> ${isGerman ? 'پوشه جدید' : 'New folder'}
                    </button>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline close-selection-modal">${isGerman ? 'بستن' : 'Close'}</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('tag-selection-modal');
    modal.querySelectorAll('.close-modal, .close-selection-modal').forEach(btn => {
        btn.onclick = () => modal.style.display = 'none';
    });
}

showTagSelectionForWord(wordId, wordGerman) {
    let modal = document.getElementById('tag-selection-modal');
    if (!modal) {
        this.createTagSelectionModal();
        modal = document.getElementById('tag-selection-modal');
    }
    
    const tags = this.getAllTags();
    const currentTags = this.getTagsForWord(wordId);
    const currentTagIds = new Set(currentTags.map(t => t.id));
    const isGerman = LanguageSystem.isGerman();
    
    const container = document.getElementById('tag-selection-list');
    container.innerHTML = tags.map(tag => `
        <div class="tag-select-item" data-tag-id="${tag.id}">
            <div class="tag-select-info">
                <div class="tag-color-dot" style="background: ${tag.color};"></div>
                <span class="tag-select-name">${this.escapeHtml(tag.name)}</span>
                <span class="tag-select-count">(${tag.wordCount})</span>
            </div>
            <button class="tag-select-toggle ${currentTagIds.has(tag.id) ? 'active' : ''}" data-tag-id="${tag.id}" style="background: ${currentTagIds.has(tag.id) ? tag.color : '#ccc'};">
                ${currentTagIds.has(tag.id) ? '<i class="fas fa-check"></i>' : '<i class="fas fa-plus"></i>'}
            </button>
        </div>
    `).join('');
    
    if (tags.length === 0) {
        container.innerHTML = `<div class="empty-state-tags">${isGerman ? 'هیچ پوشه‌ای وجود ندارد. ابتدا پوشه بسازید.' : 'No folders yet.'}</div>`;
    }
    
    modal.querySelector('.modal-header h3').innerHTML = `<i class="fas fa-folder-plus"></i> ${isGerman ? 'مدیریت پوشه‌ها' : 'Manage folders'} - ${this.escapeHtml(wordGerman)}`;
    modal.style.display = 'flex';
    
    document.querySelectorAll('.tag-select-toggle').forEach(btn => {
        btn.onclick = () => {
            const tagId = btn.dataset.tagId;
            const isActive = btn.classList.contains('active');
            const tag = tags.find(t => t.id === tagId);
            
            if (isActive) {
                this.removeWordFromTag(tagId, wordId);
                btn.classList.remove('active');
                btn.style.background = '#ccc';
                btn.innerHTML = '<i class="fas fa-plus"></i>';
                this.showToast(`🗑️ از پوشه "${tag.name}" حذف شد`, 'info');
            } else {
                this.addWordToTag(tagId, wordId);
                btn.classList.add('active');
                btn.style.background = tag.color;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                this.showToast(`✅ به پوشه "${tag.name}" اضافه شد`, 'success');
            }
            
            // بروزرسانی نمایش در لیست لغات و رنگ دکمه
            this.renderTagFilterBar();
            this.updatePracticeTagFilter();
            this.addTagFilterToExportModal();
            this.renderWordList(); // رندر مجدد برای بروزرسانی آیکون تگ و رنگ دکمه
        };
    });
    
    document.getElementById('create-tag-from-selection')?.addEventListener('click', () => {
        modal.style.display = 'none';
        this.showTagManagerModal();
    });
}
// ================================================
// دکمه تگ در لیست لغات
// ================================================

addTagButtonToWordList() {
    setTimeout(() => {
        const sortBtn = document.getElementById('floating-sort-btn');
        if (!sortBtn) return;
        if (document.getElementById('floating-tag-btn')) return;
        
        const tagBtn = document.createElement('button');
        tagBtn.id = 'floating-tag-btn';
        tagBtn.className = 'floating-tag-btn';
        tagBtn.innerHTML = '<i class="fas fa-folder-tree"></i>';
        tagBtn.title = 'مدیریت پوشه‌ها';
        tagBtn.onclick = () => this.showTagManagerModal();
        
        sortBtn.parentNode.insertBefore(tagBtn, sortBtn.nextSibling);
        console.log('✅ دکمه تگ اضافه شد');
    }, 500);
}
// ================================================
// اصلاح نهایی تابع updatePracticeTagFilter در scripts.js
// ================================================

updatePracticeTagFilter() {
    setTimeout(() => {
        const practiceSection = document.getElementById('practice-section');
        if (!practiceSection) return;
        
        const tags = this.getAllTags();
        if (tags.length === 0) return;
        
        const isGerman = LanguageSystem.isGerman();
        
        let rangeButtons = practiceSection.querySelector('.range-buttons');
        if (!rangeButtons) {
            setTimeout(() => this.updatePracticeTagFilter(), 500);
            return;
        }
        
        // حذف دکمه قبلی اگر وجود داشت
        const existingWrapper = rangeButtons.querySelector('.practice-tag-dropdown-wrapper');
        if (existingWrapper) existingWrapper.remove();
        
        // ایجاد دکمه پوشه
        const tagDropdownWrapper = document.createElement('div');
        tagDropdownWrapper.className = 'practice-tag-dropdown-wrapper';
        tagDropdownWrapper.style.display = 'inline-block';
        tagDropdownWrapper.style.position = 'relative';
        tagDropdownWrapper.style.marginRight = '10px';
        
        const currentTag = this.selectedPracticeTag ? tags.find(t => t.id === this.selectedPracticeTag) : null;
        
        tagDropdownWrapper.innerHTML = `
            <div class="practice-tag-dropdown-btn">
                <button class="range-option ${this.selectedPracticeTag ? 'active' : ''}" data-range="tag" style="display: flex; align-items: center; gap: 8px; min-width: 130px; justify-content: space-between;">
                    <i class="fas fa-folder"></i> 
                    <span id="practice-tag-selected-name">${currentTag ? currentTag.name : (isGerman ? 'پوشه' : 'Folder')}</span>
                    <i class="fas fa-chevron-down" style="font-size: 12px;"></i>
                </button>
                <div class="practice-tag-dropdown-menu" style="display: none; position: absolute; top: 100%; right: 0; min-width: 220px; background: var(--white); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 1000; margin-top: 5px; border: 1px solid var(--gray-200); overflow: hidden;">
                    <button class="practice-tag-option ${!this.selectedPracticeTag ? 'active' : ''}" data-tag-id="all" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 15px; border: none; background: transparent; cursor: pointer; text-align: right; font-size: 13px; transition: all 0.2s; border-right: 3px solid transparent;">
                        <i class="fas fa-globe"></i> ${isGerman ? 'همه پوشه‌ها' : 'All folders'}
                    </button>
                    ${tags.map(tag => `
                        <button class="practice-tag-option ${this.selectedPracticeTag === tag.id ? 'active' : ''}" data-tag-id="${tag.id}" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 15px; border: none; background: transparent; cursor: pointer; text-align: right; font-size: 13px; transition: all 0.2s; border-right: 3px solid ${tag.color};">
                            <span class="tag-dot" style="width: 10px; height: 10px; border-radius: 50%; background: ${tag.color}; display: inline-block;"></span>
                            ${this.escapeHtml(tag.name)}
                            <span class="tag-count" style="font-size: 11px; color: var(--gray-500); margin-right: auto;">(${tag.wordCount})</span>
                            ${this.selectedPracticeTag === tag.id ? '<i class="fas fa-check" style="margin-right: 5px;"></i>' : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        rangeButtons.appendChild(tagDropdownWrapper);
        
        const dropdownBtn = tagDropdownWrapper.querySelector('.practice-tag-dropdown-btn > button');
        const dropdownMenu = tagDropdownWrapper.querySelector('.practice-tag-dropdown-menu');
        const selectedNameSpan = tagDropdownWrapper.querySelector('#practice-tag-selected-name');
        
        if (dropdownBtn && dropdownMenu) {
            dropdownBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = dropdownMenu.style.display === 'block';
                dropdownMenu.style.display = isOpen ? 'none' : 'block';
            };
            
            const closeDropdownHandler = (e) => {
                if (!tagDropdownWrapper.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.style.display = 'none';
                }
            };
            document.removeEventListener('click', closeDropdownHandler);
            document.addEventListener('click', closeDropdownHandler);
        }
        
        document.querySelectorAll('.practice-tag-option').forEach(opt => {
            opt.onclick = (e) => {
                e.stopPropagation();
                const tagId = opt.dataset.tagId;
                
                if (tagId === 'all') {
                    this.selectedPracticeTag = null;
                    if (selectedNameSpan) selectedNameSpan.textContent = isGerman ? 'پوشه' : 'Folder';
                    this.showToast(`📁 تمرین از همه پوشه‌ها`, 'info');
                    const tagRangeBtn = rangeButtons.querySelector('.range-option[data-range="tag"]');
                    if (tagRangeBtn) tagRangeBtn.classList.remove('active');
                } else {
                    this.selectedPracticeTag = tagId;
                    const tag = tags.find(t => t.id === tagId);
                    if (selectedNameSpan && tag) selectedNameSpan.textContent = tag.name;
                    this.showToast(`📁 تمرین از پوشه "${tag.name}"`, 'success');
                    const tagRangeBtn = rangeButtons.querySelector('.range-option[data-range="tag"]');
                    if (tagRangeBtn) tagRangeBtn.classList.add('active');
                    
                    // ========== مهم: وقتی پوشه انتخاب شد، اگه محدوده custom فعال بود پیام بده ==========
                    const activeRange = document.querySelector('.range-option.active');
                    if (activeRange && activeRange.dataset.range === 'custom') {
                        const startInput = document.getElementById('range-start');
                        const endInput = document.getElementById('range-end');
                        if (startInput?.value && endInput?.value) {
                            this.showToast(`📏 محدوده ${startInput.value} تا ${endInput.value} از پوشه "${tag.name}" اعمال می‌شود`, 'info');
                        }
                    }
                }
                
                dropdownMenu.style.display = 'none';
                
                document.querySelectorAll('.practice-tag-option').forEach(o => {
                    o.classList.remove('active');
                    const checkIcon = o.querySelector('.fa-check');
                    if (checkIcon) checkIcon.remove();
                });
                if (tagId !== 'all') {
                    opt.classList.add('active');
                    opt.insertAdjacentHTML('beforeend', '<i class="fas fa-check" style="margin-right: 5px;"></i>');
                } else {
                    opt.classList.add('active');
                }
                
                if (this.selectedPracticeTag) {
                    localStorage.setItem('selectedPracticeTag', this.selectedPracticeTag);
                } else {
                    localStorage.removeItem('selectedPracticeTag');
                }
            };
        });
        
        // ========== اصلاح گزینه‌های محدوده ==========
        // قانون: فقط "custom range" می‌تونه با پوشه ترکیب بشه
        // گزینه‌های "all", "favorites", "recent" وقتی پوشه انتخاب شده باشه، پوشه رو لغو می‌کنن
        
        const allRangeOptions = rangeButtons.querySelectorAll('.range-option:not([data-range="tag"])');
        allRangeOptions.forEach(btn => {
            const originalOnClick = btn.onclick;
            btn.onclick = (e) => {
                e.stopPropagation();
                
                const rangeValue = btn.dataset.range;
                const isCustomRange = (rangeValue === 'custom');
                const hasTagSelected = (this.selectedPracticeTag !== null && this.selectedPracticeTag !== 'all');
                
                // ========== قانون 1: اگه پوشه انتخاب شده و این گزینه custom نیست → پوشه رو لغو کن ==========
                if (hasTagSelected && !isCustomRange) {
                    this.selectedPracticeTag = null;
                    const tagRangeBtn = rangeButtons.querySelector('.range-option[data-range="tag"]');
                    if (tagRangeBtn) tagRangeBtn.classList.remove('active');
                    if (selectedNameSpan) selectedNameSpan.textContent = isGerman ? 'پوشه' : 'Folder';
                    this.showToast(`📁 پوشه لغو شد - فقط محدوده ${btn.querySelector('span')?.textContent || rangeValue} اعمال می‌شود`, 'info');
                }
                
                // ========== قانون 2: اگه پوشه انتخاب شده و این گزینه custom است → هر دو فعال می‌مونن ==========
                if (hasTagSelected && isCustomRange) {
                    const tag = tags.find(t => t.id === this.selectedPracticeTag);
                    this.showToast(`📁 پوشه "${tag?.name}" + محدوده دلخواه (از پوشه حساب می‌شود)`, 'success');
                }
                
                // ========== قانون 3: اگه پوشه انتخاب نشده → محدوده تنها ==========
                if (!hasTagSelected) {
                    this.showToast(`🌍 محدوده: ${btn.querySelector('span')?.textContent || rangeValue}`, 'info');
                }
                
                // حذف active از همه range options (به جز پوشه)
                document.querySelectorAll('.range-option').forEach(r => {
                    if (r.dataset.range !== 'tag') {
                        r.classList.remove('active');
                    }
                });
                btn.classList.add('active');
                
                // ذخیره در localStorage
                localStorage.setItem('practiceRange', rangeValue);
                
                // نمایش یا مخفی کردن input محدوده دلخواه
                const customInputs = document.querySelector('.custom-range-inputs');
                if (customInputs) {
                    customInputs.style.display = rangeValue === 'custom' ? 'block' : 'none';
                }
                
                // اگه پوشه انتخاب شده و این custom است، دکمه پوشه active بمونه
                if (this.selectedPracticeTag && isCustomRange) {
                    const tagRangeBtn = rangeButtons.querySelector('.range-option[data-range="tag"]');
                    if (tagRangeBtn) tagRangeBtn.classList.add('active');
                }
                
                // اجرای onclick اصلی
                if (originalOnClick) {
                    originalOnClick.call(btn, e);
                }
            };
        });
        
        // ========== اضافه کردن نشانگر وضعیت ==========
        let statusIndicator = rangeButtons.querySelector('.practice-status-indicator');
        if (!statusIndicator) {
            statusIndicator = document.createElement('div');
            statusIndicator.className = 'practice-status-indicator';
            statusIndicator.style.cssText = `
                display: inline-block;
                margin-right: 15px;
                padding: 6px 14px;
                background: var(--primary-light);
                border-radius: 30px;
                font-size: 12px;
                font-weight: 500;
                color: var(--primary);
                direction: rtl;
            `;
            rangeButtons.appendChild(statusIndicator);
        }
        
        const updateStatusIndicator = () => {
            let statusText = '';
            const activeRange = document.querySelector('.range-option.active:not([data-range="tag"])');
            const isCustomActive = activeRange?.dataset.range === 'custom';
            
            if (this.selectedPracticeTag && isCustomActive) {
                const tag = this.getAllTags().find(t => t.id === this.selectedPracticeTag);
                statusText = `📁 ${tag?.name} | 📏 محدوده دلخواه`;
            } 
            else if (this.selectedPracticeTag && !isCustomActive) {
                const tag = this.getAllTags().find(t => t.id === this.selectedPracticeTag);
                statusText = `📁 ${tag?.name} (همه لغات پوشه)`;
            }
            else if (!this.selectedPracticeTag && activeRange) {
                const rangeName = activeRange.dataset.range === 'custom' ? 'محدوده دلخواه' :
                                  activeRange.dataset.range === 'favorites' ? 'علاقه‌مندی‌ها' :
                                  activeRange.dataset.range === 'recent' ? 'لغات اخیر' : 'همه لغات';
                statusText = `🌍 ${rangeName}`;
            }
            else {
                statusText = `🌍 همه لغات`;
            }
            
            statusIndicator.innerHTML = `<i class="fas fa-chart-simple"></i> ${statusText}`;
        };
        
        const observer = new MutationObserver(updateStatusIndicator);
        observer.observe(rangeButtons, { attributes: true, subtree: true, attributeFilter: ['class'] });
        updateStatusIndicator();
        
        // بازیابی انتخاب قبلی از localStorage
        const savedTag = localStorage.getItem('selectedPracticeTag');
        if (savedTag && this.tags.has(savedTag)) {
            this.selectedPracticeTag = savedTag;
            const tag = tags.find(t => t.id === savedTag);
            if (selectedNameSpan && tag) selectedNameSpan.textContent = tag.name;
            const tagRangeBtn = rangeButtons.querySelector('.range-option[data-range="tag"]');
            if (tagRangeBtn) tagRangeBtn.classList.add('active');
            setTimeout(() => {
                const activeOpt = document.querySelector(`.practice-tag-option[data-tag-id="${savedTag}"]`);
                if (activeOpt) {
                    document.querySelectorAll('.practice-tag-option').forEach(o => {
                        o.classList.remove('active');
                        const checkIcon = o.querySelector('.fa-check');
                        if (checkIcon) checkIcon.remove();
                    });
                    activeOpt.classList.add('active');
                    activeOpt.insertAdjacentHTML('beforeend', '<i class="fas fa-check" style="margin-right: 5px;"></i>');
                }
                updateStatusIndicator();
            }, 100);
        }
        
        // بازیابی محدوده ذخیره شده
        const savedRange = localStorage.getItem('practiceRange') || 'all';
        document.querySelectorAll('.range-option').forEach(btn => {
            if (btn.dataset.range === savedRange && btn.dataset.range !== 'tag') {
                btn.classList.add('active');
                const customInputs = document.querySelector('.custom-range-inputs');
                if (customInputs) {
                    customInputs.style.display = savedRange === 'custom' ? 'block' : 'none';
                }
            }
        });
        updateStatusIndicator();
        
    }, 300);
}
async renderWordList(filter = 'all') {
    const words = await this.getAllWords();
    const container = document.getElementById('word-list-container');
    const isGerman = LanguageSystem.isGerman();
    
    if (!container) return;
    
    container.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> بارگذاری...</div>`;
    
    let filteredWords = [...words];
    
    // فیلتر بر اساس تگ (اگر تگ خاصی انتخاب شده)
    if (this.currentTagFilter && this.currentTagFilter !== 'all') {
        const tagWords = await this.getWordsByTag(this.currentTagFilter);
        const tagWordIds = new Set(tagWords.map(w => w.id));
        filteredWords = filteredWords.filter(w => tagWordIds.has(w.id));
    } else {
        switch(filter) {
            case 'favorites':
                filteredWords = filteredWords.filter(w => this.favorites.has(w.id));
                break;
            case 'nouns':
                filteredWords = filteredWords.filter(w => w.type === 'noun');
                break;
            case 'verbs':
                filteredWords = filteredWords.filter(w => w.type === 'verb');
                break;
            case 'adjectives':
                filteredWords = filteredWords.filter(w => w.type === 'adjective');
                break;
            case 'adverbs':
                filteredWords = filteredWords.filter(w => w.type === 'adverb');
                break;
        }
    }
    
    // مرتب‌سازی
    const savedSort = localStorage.getItem('wordListSort') || 'alphabetical';
    this.applySortToFilteredWords(filteredWords, savedSort);
    
    // ========== مهم: ذخیره لیست فعلی برای ناوبری ==========
    this.currentWordList = [...filteredWords];
    
    document.getElementById('total-words-count').textContent = filteredWords.length;
    
    if (filteredWords.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-book"></i><h3>هیچ لغتی نیست</h3></div>`;
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    for (let index = 0; index < filteredWords.length; index++) {
        const word = filteredWords[index];
        const wordTags = this.getTagsForWord(word.id);
        const hasTag = wordTags.length > 0;
        
        const div = document.createElement('div');
        div.className = 'word-list-item';
        div.setAttribute('data-id', word.id);
        
        div.innerHTML = `
            <div class="word-list-item-header">
                <div class="word-list-item-title-section">
                    <span class="word-number">${index + 1}</span>
                    ${this.srsData[word.id] ? `<span class="srs-level srs-level-${this.srsData[word.id].level}">${this.srsData[word.id].level}</span>` : '<span class="srs-level srs-level-0">0</span>'}
                    <i class="fas fa-star favorite-icon ${this.favorites.has(word.id) ? 'active' : ''}" data-id="${word.id}"></i>
                    <span class="word-list-item-title">${this.escapeHtml(word.german)}</span>
                    ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                    ${word.type ? `<span class="word-type">${this.getTypeLabel(word.type)}</span>` : ''}
                    ${hasTag ? `
                        <div class="word-tag-icons">
                            ${wordTags.map(tag => `
                                <span class="tag-icon" style="background: ${tag.color};" title="${this.escapeHtml(tag.name)}">
                                    <i class="fas fa-tag"></i>
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="word-list-item-meaning">${this.escapeHtml(word.persian)}</div>
            <div class="word-list-item-actions">
                <button class="btn btn-sm btn-outline view-word" data-id="${word.id}">${isGerman ? 'مشاهده' : 'View'}</button>
                <button class="btn btn-sm btn-outline practice-word" data-id="${word.id}">${LanguageSystem.t('practice.start')}</button>
                <button class="tag-word-btn ${hasTag ? 'has-tag' : ''}" data-id="${word.id}" data-word="${this.escapeHtml(word.german)}" title="${isGerman ? 'مدیریت پوشه‌ها' : 'Manage folders'}">
                    <i class="fas fa-folder-plus"></i>
                </button>
            </div>
        `;
        
        fragment.appendChild(div);
    }
    
    container.innerHTML = '';
    container.appendChild(fragment);
    
    this.setupWordListEventListeners();
    this.setupFilterButtons();
    this.setupTagWordButtons();
    this.renderTagFilterBar();
}

// راه‌اندازی دکمه‌های تگ در هر لغت
setupTagWordButtons() {
    document.querySelectorAll('.tag-word-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const wordId = parseInt(btn.dataset.id);
            const wordGerman = btn.dataset.word;
            this.showTagSelectionForWord(wordId, wordGerman);
        };
    });
}
getSRSLevelText(level) {
    const texts = {
        0: 'جدید یا نیاز به تمرین بیشتر',
        1: 'در حال یادگیری',
        2: 'نیمه آشنا',
        3: 'آشنا',
        4: 'تقریبا مسلط',
        5: 'کاملا مسلط'
    };
    return texts[level] || 'در حال یادگیری';
}

// ================================================
// تابع setupFloatingSortButton
// ================================================

setupFloatingSortButton() {
    const sortBtn = document.getElementById('floating-sort-btn');
    const modal = document.getElementById('sort-modal');
    const closeBtn = document.getElementById('close-sort-modal');
    
    if (!sortBtn || !modal) return;
    
    modal.style.display = 'none';
    
    const updateActiveSortOption = () => {
        const currentSort = localStorage.getItem('wordListSort') || 'alphabetical';
        document.querySelectorAll('.sort-modal-option').forEach(option => {
            if (option.dataset.sort === currentSort) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    };
    
    const modalBody = modal.querySelector('.sort-modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <button class="sort-modal-option" data-sort="alphabetical">
                <i class="fas fa-sort-alpha-down"></i> الفبایی (آلمانی)
            </button>
            <button class="sort-modal-option" data-sort="alphabetical-persian">
                <i class="fas fa-sort-alpha-down"></i> الفبایی (فارسی)
            </button>
            <div class="sort-divider"></div>
            <button class="sort-modal-option" data-sort="date-desc">
                <i class="fas fa-calendar-plus"></i> جدیدترین
            </button>
            <button class="sort-modal-option" data-sort="date-asc">
                <i class="fas fa-calendar-minus"></i> قدیمی‌ترین
            </button>
            <div class="sort-divider"></div>
            <button class="sort-modal-option" data-sort="srs-level">
                <i class="fas fa-brain"></i> سطح یادگیری (SRS)
            </button>
            <button class="sort-modal-option" data-sort="tag">
                <i class="fas fa-folder"></i> بر اساس پوشه
            </button>
            <div class="sort-divider"></div>
            <button class="sort-modal-option" data-sort="random">
                <i class="fas fa-random"></i> تصادفی
            </button>
        `;
    }
    
    sortBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        updateActiveSortOption();
        modal.style.display = 'flex';
    };
    
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.onclick = (e) => {
            e.stopPropagation();
            modal.style.display = 'none';
        };
    }
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    const modalContent = modal.querySelector('.sort-modal-content');
    if (modalContent) {
        modalContent.onclick = (e) => e.stopPropagation();
    }
    
    const self = this;
    
    const oldOptions = document.querySelectorAll('.sort-modal-option');
    oldOptions.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.onclick = async (e) => {
            e.stopPropagation();
            const sortType = newBtn.dataset.sort;
            const activeFilter = document.querySelector('.filter-btn.active');
            const filter = activeFilter ? activeFilter.dataset.filter : 'all';
            
            localStorage.setItem('wordListSort', sortType);
            await self.sortWordListAdvanced(filter, sortType);
            modal.style.display = 'none';
            
            const sortNames = {
                'alphabetical': 'الفبایی (آلمانی)',
                'alphabetical-persian': 'الفبایی (فارسی)',
                'date-desc': 'جدیدترین',
                'date-asc': 'قدیمی‌ترین',
                'srs-level': 'سطح یادگیری',
                'tag': 'پوشه',
                'random': 'تصادفی'
            };
            self.showToast(`مرتب‌سازی بر اساس ${sortNames[sortType] || sortType}`, 'success');
        };
    });
}
// اسکرول برای مخفی/نمایش دکمه سورت
setupSortButtonScroll() {
    const sortBtn = document.getElementById('floating-sort-btn');
    if (!sortBtn) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            // اسکرول به پایین - مخفی کردن دکمه
            sortBtn.classList.add('hide');
        } else {
            // اسکرول به بالا - نمایش دکمه
            sortBtn.classList.remove('hide');
        }
        
        lastScroll = currentScroll;
    });
}

    // ================================================
    // مدیریت مثال‌ها
    // ================================================

    async addExample(wordId, exampleData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('دیتابیس در دسترس نیست'));
                return;
            }

            const transaction = this.db.transaction(['examples'], 'readwrite');
            const store = transaction.objectStore('examples');
            
            const example = {
                wordId: wordId,
                german: exampleData.german,
                persian: exampleData.persian,
                createdAt: new Date().toISOString()
            };
            
            const request = store.add(example);
            
            request.onsuccess = () => {
                this.showToast('✅ مثال با موفقیت اضافه شد', 'success');
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('❌ خطا در افزودن مثال:', event.target.error);
                this.showToast('❌ خطا در افزودن مثال', 'error');
                reject(event.target.error);
            };
        });
    }



    async getExamplesForWord(wordId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve([]);
                return;
            }

            const transaction = this.db.transaction(['examples'], 'readonly');
            const store = transaction.objectStore('examples');
            const index = store.index('wordId');
            const request = index.getAll(wordId);
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (event) => {
                console.error('خطا در دریافت مثال‌ها:', event.target.error);
                resolve([]);
            };
        });
    }

    // ================================================
    // مدیریت علاقه‌مندی‌ها
    // ================================================

    async loadFavorites() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }

            const transaction = this.db.transaction(['favorites'], 'readonly');
            const store = transaction.objectStore('favorites');
            const request = store.getAll();
            
            request.onsuccess = () => {
                this.favorites = new Set(request.result.map(item => item.wordId));
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('خطا در بارگذاری علاقه‌مندی‌ها:', event.target.error);
                resolve();
            };
        });
    }

    async toggleFavorite(wordId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['favorites'], 'readwrite');
            const store = transaction.objectStore('favorites');
            
            if (this.favorites.has(wordId)) {
                const request = store.delete(wordId);
                request.onsuccess = () => {
                    this.favorites.delete(wordId);
                    this.showToast('⭐ از علاقه‌مندی‌ها حذف شد', 'info');
                    this.updateFavoritesCount();
                    resolve(false);
                };
            } else {
                const request = store.add({ wordId });
                request.onsuccess = () => {
                    this.favorites.add(wordId);
                    this.showToast('✅ به علاقه‌مندی‌ها اضافه شد', 'success');
                    this.updateFavoritesCount();
                    resolve(true);
                };
            }
        });
    }
async renderFavorites() {
    const words = await this.getAllWords();
    const favoriteWords = words.filter(word => this.favorites.has(word.id));
    
    // پیدا کردن کانتینر صحیح
    let container = document.getElementById('favorites-container');
    if (!container) {
        const favoritesSection = document.getElementById('favorites-section');
        if (favoritesSection) {
            container = favoritesSection.querySelector('.word-list');
            if (!container) {
                // ایجاد کانتینر اگر وجود نداشت
                const wordCard = favoritesSection.querySelector('.word-card');
                if (wordCard) {
                    const listDiv = document.createElement('div');
                    listDiv.id = 'favorites-container';
                    listDiv.className = 'word-list';
                    wordCard.appendChild(listDiv);
                    container = listDiv;
                }
            }
        }
    }
    
    if (!container) return;
    
    const isGerman = LanguageSystem.isGerman();
    document.getElementById('favorites-count').textContent = favoriteWords.length;
    
    if (favoriteWords.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-star"></i></div>
                <h3>${isGerman ? 'لیست علاقه‌مندی‌ها خالی است' : 'Favorites list is empty'}</h3>
                <p>${isGerman ? 'با کلیک روی ستاره کنار هر لغت، به این لیست اضافه کنید' : 'Click on the star next to each word to add to this list'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = favoriteWords.map(word => `
        <div class="word-list-item" data-id="${word.id}">
            <div class="word-list-item-header">
                <div class="word-list-item-title-section">
                    <span class="word-number">${word.id}</span>
                    <i class="fas fa-star favorite-icon active" data-id="${word.id}"></i>
                    <span class="word-list-item-title">${word.german}</span>
                    ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                </div>
            </div>
            <div class="word-list-item-meaning">${word.persian}</div>
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
}

updateFavoritesCount() {
    const countElement = document.getElementById('favorites-count');
    if (countElement) {
        countElement.textContent = this.favorites.size;
    }
}

    // ================================================
    // مدیریت تمرین فلش کارت
    // ================================================
renderPracticeOptions() {
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
}
async startConjugationPractice() {
    const wordsToPractice = await this.getFilteredWordsForPractice();
    
    // فقط فعل‌هایی که صرف دارن
    let verbWords = wordsToPractice.filter(word => word.type === 'verb' && word.verbForms);
    
    if (verbWords.length === 0) {
        this.showToast('❌ هیچ فعلی با اطلاعات صرف در این بازه وجود ندارد', 'error');
        return;
    }
    
    const activeCount = document.querySelector('.count-option.active');
    let questionCount = activeCount ? (activeCount.dataset.count === 'all' ? verbWords.length : parseInt(activeCount.dataset.count)) : 10;
    
    if (verbWords.length < questionCount) {
        questionCount = verbWords.length;
    }
    
    const activeOrder = document.querySelector('.order-option.active');
    const order = activeOrder ? activeOrder.dataset.order : 'random';
    
    let selectedWords = [];
    if (order === 'sequential') {
        selectedWords = [...verbWords].sort((a, b) => a.german.localeCompare(b.german, 'de')).slice(0, questionCount);
    } else if (order === 'hardest') {
        const history = await this.getAllPracticeHistory();
        const errorCounts = {};
        history.forEach(record => {
            if (!record.correct) {
                errorCounts[record.wordId] = (errorCounts[record.wordId] || 0) + 1;
            }
        });
        selectedWords = [...verbWords].sort((a, b) => (errorCounts[b.id] || 0) - (errorCounts[a.id] || 0)).slice(0, questionCount);
    } else {
        selectedWords = this.shuffleArray([...verbWords]).slice(0, questionCount);
    }
    
    this.showToast(`📊 تعداد افعال در این بازه: ${verbWords.length} فعل`, 'info');
    
    this.conjugationSession = {
        words: selectedWords,
        currentIndex: 0,
        score: 0,
        answers: []
    };
    
    this.showConjugationQuestion();
    this.showSection('practice-section');
}
showConjugationQuestion() {
    if (this.conjugationSession.currentIndex >= this.conjugationSession.words.length) {
        this.showConjugationResults();
        return;
    }
    
    const word = this.conjugationSession.words[this.conjugationSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    const current = this.conjugationSession.currentIndex + 1;
    const total = this.conjugationSession.words.length;
    const progress = (current - 1) / total * 100;
    
    // انتخاب تصادفی کدام زمان پرسیده بشه
    const tenses = [
        { key: 'present', label: isGerman ? 'حال ساده (Präsens)' : 'Present Tense', icon: 'fa-regular fa-clock' },
        { key: 'past', label: isGerman ? 'گذشته ساده (Präteritum)' : 'Simple Past', icon: 'fa-regular fa-clock' },
        { key: 'perfect', label: isGerman ? 'گذشته کامل (Perfekt)' : 'Present Perfect', icon: 'fa-regular fa-circle-check' }
    ];
    const selectedTense = tenses[Math.floor(Math.random() * 3)];
    const correctAnswer = word.verbForms[selectedTense.key] || '—';
    
    // ذخیره سوال فعلی
    this.currentConjugationQuestion = {
        word: word,
        tense: selectedTense,
        correctAnswer: correctAnswer
    };
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fa-regular fa-table-list"></i> ${isGerman ? 'تمرین صرف افعال' : 'Conjugation Trainer'}</h2>
                <span class="badge" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9);">${current}/${total}</span>
            </div>
            
            <div style="text-align: center; padding: 30px 20px;">
                <div style="background: linear-gradient(135deg, #f3e8ff, #e9d5ff); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
                    <div style="font-size: 14px; color: #6b21a5; margin-bottom: 10px;">
                        <i class="${selectedTense.icon}"></i> ${selectedTense.label}
                    </div>
                    <div style="font-size: 28px; font-weight: 700; color: #581c87;">
                        ${word.german}
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <input type="text" id="conjugation-answer" class="form-control" 
                           placeholder="${isGerman ? 'صرف فعل را وارد کنید...' : 'Enter the conjugated form...'}"
                           style="text-align: center; font-size: 18px; padding: 15px; max-width: 300px; margin: 0 auto;">
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button id="check-conjugation-btn" class="btn btn-primary">
                        <i class="fa-regular fa-check"></i> ${isGerman ? 'بررسی' : 'Check'}
                    </button>
                    <button id="skip-conjugation-btn" class="btn btn-outline">
                        <i class="fa-regular fa-forward"></i> ${isGerman ? 'رد کردن' : 'Skip'}
                    </button>
                    <button id="hint-conjugation-btn" class="btn btn-outline">
                        <i class="fa-regular fa-lightbulb"></i> ${isGerman ? 'راهنمایی' : 'Hint'}
                    </button>
                </div>
                
                <div id="conjugation-feedback" style="margin-top: 20px; font-size: 16px; min-height: 60px;"></div>
                
                <div style="width: 70%; margin: 30px auto 0; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #8b5cf6, #6d28d9); transition: width 0.3s ease;"></div>
                </div>
            </div>
        </div>
    `;
    
    const checkBtn = document.getElementById('check-conjugation-btn');
    const skipBtn = document.getElementById('skip-conjugation-btn');
    const hintBtn = document.getElementById('hint-conjugation-btn');
    const answerInput = document.getElementById('conjugation-answer');
    
    if (checkBtn) checkBtn.onclick = () => this.checkConjugationAnswer();
    if (skipBtn) skipBtn.onclick = () => this.skipConjugationQuestion();
    if (hintBtn) hintBtn.onclick = () => this.showConjugationHint();
    
    if (answerInput) {
        answerInput.focus();
        // اضافه کردن event listener برای کلید Enter
        answerInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.checkConjugationAnswer();
            }
        };
    }
}

async checkConjugationAnswer() {
    const userAnswer = document.getElementById('conjugation-answer').value.trim().toLowerCase();
    const question = this.currentConjugationQuestion;
    const feedbackDiv = document.getElementById('conjugation-feedback');
    const isGerman = LanguageSystem.isGerman();
    const checkBtn = document.getElementById('check-conjugation-btn');
    const answerInput = document.getElementById('conjugation-answer');
    
    if (!userAnswer) {
        this.showToast('✏️ لطفاً پاسخ را وارد کنید', 'warning');
        return;
    }
    
    const isCorrect = userAnswer === question.correctAnswer.toLowerCase();
    
    // غیرفعال کردن دکمه بررسی و اینپوت بعد از پاسخ
    if (checkBtn) checkBtn.disabled = true;
    if (answerInput) answerInput.disabled = true;
    
    if (isCorrect) {
        this.conjugationSession.score++;
        feedbackDiv.innerHTML = `<span style="color: #10b981; font-size: 18px; font-weight: 600;">✅ ${isGerman ? 'آفرین! پاسخ صحیح است' : 'Correct!'}</span>`;
        
        if (answerInput) answerInput.style.borderColor = '#10b981';
        
        // رفتن به سوال بعدی بعد از 1 ثانیه
        setTimeout(() => {
            this.conjugationSession.currentIndex++;
            this.showConjugationQuestion();
        }, 1000);
    } else {
        feedbackDiv.innerHTML = `<span style="color: #ef4444; font-size: 16px; font-weight: 600;">
            ❌ ${isGerman ? 'پاسخ صحیح:' : 'Correct answer:'} <strong>${question.correctAnswer}</strong>
        </span>`;
        
        if (answerInput) answerInput.style.borderColor = '#ef4444';
        
        // در صورت پاسخ اشتباه، بعد از 2 ثانیه خودکار میره سوال بعدی
        setTimeout(() => {
            this.conjugationSession.currentIndex++;
            this.showConjugationQuestion();
        }, 2000);
    }
    
    await this.recordPractice(question.word.id, isCorrect);
}

skipConjugationQuestion() {
    this.conjugationSession.currentIndex++;
    this.showConjugationQuestion();
}

showConjugationHint() {
    const question = this.currentConjugationQuestion;
    const isGerman = LanguageSystem.isGerman();
    
    this.showToast(`💡 ${isGerman ? 'راهنما:' : 'Hint:'} ${question.correctAnswer.substring(0, 3)}...`, 'info');
}

showConjugationResults() {
    const accuracy = Math.round((this.conjugationSession.score / this.conjugationSession.words.length) * 100);
    const isGerman = LanguageSystem.isGerman();
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-chart-line"></i> ${isGerman ? 'نتایج تمرین صرف افعال' : 'Conjugation Results'}</h2>
            </div>
            
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 70px; margin-bottom: 20px;">📊</div>
                <div style="font-size: 48px; font-weight: 800; color: ${accuracy >= 70 ? '#10b981' : '#8b5cf6'}; margin-bottom: 30px;">${accuracy}%</div>
                
                <div style="display: flex; justify-content: center; gap: 50px; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'تعداد سوالات' : 'Questions'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${this.conjugationSession.words.length}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'پاسخ صحیح' : 'Correct'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: #10b981;">${this.conjugationSession.score}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'پاسخ نادرست' : 'Wrong'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: #ef4444;">${this.conjugationSession.words.length - this.conjugationSession.score}</div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                <button id="restart-conjugation-btn" class="btn btn-primary"><i class="fas fa-redo-alt"></i> ${isGerman ? 'تمرین مجدد' : 'Practice Again'}</button>
                <button id="back-conjugation-btn" class="btn btn-outline"><i class="fas fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}</button>
            </div>
        </div>
    `;
    
    document.getElementById('restart-conjugation-btn').onclick = () => this.startConjugationPractice();
    document.getElementById('back-conjugation-btn').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
}
async startFillBlanksPractice() {
    const wordsToPractice = await this.getFilteredWordsForPractice();
    const isGerman = LanguageSystem.isGerman();
    
    if (wordsToPractice.length < 4) {
        this.showToast(`❌ لغت کافی وجود ندارد (حداقل ۴ لغت نیاز است)`, 'error');
        return;
    }
    
    // ========== از کل لغات فیلتر شده استفاده کن ==========
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
    
    const questionTypes = [
        { type: 'meaning_to_german', name: isGerman ? 'معنی به آلمانی' : 'Meaning to German' },
        { type: 'german_to_meaning', name: isGerman ? 'آلمانی به معنی' : 'German to Meaning' }
    ];
    
    this.fillBlanksSession = {
        words: selectedWords,  // ذخیره لیست کلمات برای استفاده در هر سوال
        currentIndex: 0,
        score: 0,
        typeStats: {
            meaning_to_german: { total: 0, correct: 0 },
            german_to_meaning: { total: 0, correct: 0 }
        }
    };
    
    this.showToast(`📊 تعداد سوالات در این بازه: ${selectedWords.length} سوال`, 'info');
    
    this.showFillBlanksQuestion();
    this.showSection('practice-section');
}

// ================================================
// 4. اصلاح تابع showFillBlanksQuestion در scripts.js
// ================================================

showFillBlanksQuestion() {
    if (this.fillBlanksSession.currentIndex >= this.fillBlanksSession.words.length) {
        this.showFillBlanksResults();
        return;
    }
    
    const word = this.fillBlanksSession.words[this.fillBlanksSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    const current = this.fillBlanksSession.currentIndex + 1;
    const total = this.fillBlanksSession.words.length;
    const progress = (current - 1) / total * 100;
    
    // انتخاب تصادفی نوع سوال
    const qType = Math.random() > 0.5 ? 'meaning_to_german' : 'german_to_meaning';
    const typeName = qType === 'meaning_to_german' ? (isGerman ? 'معنی به آلمانی' : 'Meaning to German') : (isGerman ? 'آلمانی به معنی' : 'German to Meaning');
    
    // ========== مهم: هر بار گزینه‌های اشتباه جدید از لیست کلمات دیگه بگیر ==========
    const allOtherWords = this.fillBlanksSession.words.filter(w => w.id !== word.id);
    const shuffledOthers = this.shuffleArray([...allOtherWords]);
    
    let questionText = '';
    let correctAnswer = '';
    let options = [];
    
    if (qType === 'meaning_to_german') {
        questionText = `<i class="fa-solid fa-language"></i> ${isGerman ? 'معنی فارسی:' : 'Persian meaning:'} <strong>"${word.persian}"</strong><br>
                        <span style="font-size: 14px;">${isGerman ? 'معادل آلمانی کدام است؟' : 'Which is the German equivalent?'}</span>`;
        correctAnswer = word.german;
        
        // ساخت گزینه‌های اشتباه از لغات دیگه (هر بار جدید)
        const wrongOptions = [];
        for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
            const otherWord = shuffledOthers[i];
            if (otherWord && otherWord.german && otherWord.german !== correctAnswer) {
                wrongOptions.push(otherWord.german);
            } else {
                wrongOptions.push('???');
            }
        }
        
        while (wrongOptions.length < 3) {
            wrongOptions.push('???');
        }
        
        options = [correctAnswer, ...wrongOptions];
        
    } else {
        questionText = `<i class="fa-solid fa-language"></i> ${isGerman ? 'لغت آلمانی:' : 'German word:'} <strong>"${word.german}"</strong><br>
                        <span style="font-size: 14px;">${isGerman ? 'معنی فارسی کدام است؟' : 'Which is the Persian meaning?'}</span>`;
        correctAnswer = word.persian;
        
        // ساخت گزینه‌های اشتباه از لغات دیگه (هر بار جدید)
        const wrongOptions = [];
        for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
            const otherWord = shuffledOthers[i];
            if (otherWord && otherWord.persian && otherWord.persian !== correctAnswer) {
                wrongOptions.push(otherWord.persian);
            } else {
                wrongOptions.push('???');
            }
        }
        
        while (wrongOptions.length < 3) {
            wrongOptions.push('???');
        }
        
        options = [correctAnswer, ...wrongOptions];
    }
    
    // شافل کردن نهایی گزینه‌ها
    options = this.shuffleArray(options);
    
    // ذخیره سوال فعلی
    this.currentFillBlankQuestion = {
        word: word,
        type: qType,
        typeName: typeName,
        questionText: questionText,
        correctAnswer: correctAnswer,
        options: options
    };
    
    // به‌روزرسانی آمار typeStats
    this.fillBlanksSession.typeStats[qType].total++;
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fa-solid fa-puzzle-piece"></i> ${isGerman ? 'تکمیل جای خالی' : 'Fill in the Blanks'}</h2>
                <div style="display: flex; gap: 10px;">
                    <span class="badge" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9);">${typeName}</span>
                    <span class="badge" style="background: linear-gradient(135deg, #f59e0b, #d97706);">${current}/${total}</span>
                </div>
            </div>
            
            <div style="text-align: center; padding: 30px 20px;">
                <div style="background: linear-gradient(135deg, #f3e8ff, #e9d5ff); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
                    <div style="font-size: 18px; font-weight: 500; color: #581c87;">
                        ${questionText}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    ${options.map((opt, idx) => `
                        <button class="blank-option-btn" data-answer="${this.escapeHtml(opt)}" data-index="${idx}"
                            style="padding: 14px 20px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); border: none; border-radius: 50px; color: white; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s ease;">
                            ${this.escapeHtml(opt)}
                        </button>
                    `).join('')}
                </div>
                
                <div id="blank-feedback" style="margin-top: 20px; font-size: 16px; min-height: 60px;"></div>
                
                <div style="width: 70%; margin: 20px auto 0; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #8b5cf6, #f59e0b); transition: width 0.3s ease;"></div>
                </div>
            </div>
        </div>
    `;
    
    // غیرفعال کردن قفل پاسخ
    this.fillBlankAnswerLocked = false;
    
    document.querySelectorAll('.blank-option-btn').forEach(btn => {
        btn.onclick = () => {
            if (this.fillBlankAnswerLocked) return;
            this.fillBlankAnswerLocked = true;
            this.checkBlankAnswer(btn.dataset.answer);
        };
    });
}
// ================================================
// اضافه کردن استایل AI Badge به صفحه
// ================================================

addAIBadgeStyles() {
    if (document.getElementById('ai-badge-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ai-badge-styles';
    style.textContent = `
        /* ================================================
           AI Badge - تگ هوش مصنوعی با افکت آتشین
           ================================================ */
        
        .ai-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 5px 12px;
            border-radius: 40px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;
            z-index: 10;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: #fff;
            box-shadow: 0 0 8px rgba(255, 80, 0, 0.5);
            border: 1px solid rgba(255, 80, 0, 0.6);
            transition: all 0.3s ease;
        }
        
        .ai-badge i {
            font-size: 10px;
            animation: aiIconPulse 1.5s ease-in-out infinite;
        }
        
        .ai-badge span {
            font-family: 'Vazirmatn', sans-serif;
        }
        
        /* افکت آتشین رینگ دور */
        .ai-badge::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, 
                #ff0000, #ff7300, #fffb00, #48ff00, 
                #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
            background-size: 400%;
            border-radius: 40px;
            z-index: -2;
            animation: aiFireRing 3s linear infinite;
            opacity: 0.7;
        }
        
        .ai-badge::after {
            content: '';
            position: absolute;
            inset: 2px;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border-radius: 38px;
            z-index: -1;
        }
        
        /* دود آتشین */
        .ai-badge .ai-fire-smoke {
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 70px;
            height: 15px;
            background: radial-gradient(ellipse, rgba(255, 80, 0, 0.4), transparent);
            border-radius: 50%;
            filter: blur(6px);
            animation: aiSmoke 2s ease-out infinite;
            pointer-events: none;
        }
        
        /* نسخه کوچک برای کارت‌های تمرین */
        .practice-option-card .ai-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 3px 10px;
            font-size: 9px;
        }
        
        .practice-option-card .ai-badge i {
            font-size: 9px;
        }
        
        /* لایت مود */
        body:not(.dark-mode) .ai-badge {
            background: linear-gradient(135deg, #fff5f0, #ffe8e0);
            color: #d84315;
            border-color: #ff6e40;
        }
        
        body:not(.dark-mode) .ai-badge::after {
            background: linear-gradient(135deg, #fff5f0, #ffe8e0);
        }
        
        /* انیمیشن‌ها */
        @keyframes aiFireRing {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 0%; }
        }
        
        @keyframes aiIconPulse {
            0%, 100% {
                opacity: 1;
                text-shadow: 0 0 2px rgba(255, 80, 0, 0.5);
            }
            50% {
                opacity: 0.8;
                text-shadow: 0 0 6px rgba(255, 80, 0, 0.8);
            }
        }
        
        @keyframes aiSmoke {
            0% {
                opacity: 0;
                transform: translateX(-50%) translateY(0) scale(0.5);
            }
            50% {
                opacity: 0.4;
                transform: translateX(-50%) translateY(-3px) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateX(-50%) translateY(-10px) scale(1.3);
            }
        }
        
        /* هاور افکت */
        .ai-badge:hover {
            transform: scale(1.05);
            box-shadow: 0 0 12px rgba(255, 80, 0, 0.7);
        }
        
        .ai-badge:hover::before {
            animation: aiFireRing 1.5s linear infinite;
        }
        
        /* دارک مود */
        .dark-mode .ai-badge {
            background: linear-gradient(135deg, #0f0f1a, #1a1a2e);
            color: #ff9f4a;
            border-color: #ff6e40;
            box-shadow: 0 0 10px rgba(255, 80, 0, 0.4);
        }
        
        .dark-mode .ai-badge::after {
            background: linear-gradient(135deg, #0f0f1a, #1a1a2e);
        }
        
        /* ریسپانسیو */
        @media (max-width: 768px) {
            .ai-badge {
                padding: 3px 8px;
                font-size: 9px;
            }
            .ai-badge i {
                font-size: 8px;
            }
            .practice-option-card .ai-badge {
                padding: 2px 8px;
                font-size: 8px;
                top: 8px;
                right: 8px;
            }
        }
    `;
    
    document.head.appendChild(style);
}
// ================================================
// ابزار صرف افعال پیشرفته - نسخه تصحیح شده
// ================================================

async initVerbConjugationTool() {
    console.log('🔧 راه‌اندازی ابزار صرف افعال...');
    
    const searchInput = document.getElementById('verb-search-input');
    const searchBtn = document.getElementById('verb-search-btn');
    const suggestionsDiv = document.getElementById('verb-suggestions');
    
    if (!searchInput) {
        console.log('⚠️ المنت‌های ابزار صرف افعال پیدا نشد');
        return;
    }
    
    // ========== بروزرسانی و بازسازی دیتابیس ==========
    const updateAndRebuild = () => {
        if (window.VerbsDatabase) {
            // بازسازی دیتابیس
            if (typeof rebuildDatabase === 'function') {
                rebuildDatabase();
            }
            
            const countSpan = document.getElementById('tools-verbs-count');
            if (countSpan) {
                countSpan.textContent = `${window.VerbsDatabase.totalCount}+ فعل`;
                console.log(`✅ تعداد افعال: ${window.VerbsDatabase.totalCount}+ فعل`);
            }
        }
    };
    
    setTimeout(updateAndRebuild, 100);
    
    // ========== جستجو - نسخه اصلاح شده ==========
    const performSearch = () => {
        const query = searchInput.value.trim();
        if (!query) {
            this.showToast('🔍 لطفاً نام فعل را وارد کنید', 'warning');
            return;
        }
        
        console.log('🔍 جستجو:', query);
        
        if (!window.VerbsDatabase || typeof window.VerbsDatabase.searchVerbs !== 'function') {
            console.error('❌ دیتابیس در دسترس نیست');
            this.showToast('❌ خطا در دیتابیس', 'error');
            return;
        }
        
        const results = window.VerbsDatabase.searchVerbs(query);
        console.log('📊 نتایج:', results.length);
        
        if (results.length === 0) {
            suggestionsDiv.style.display = 'block';
            suggestionsDiv.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--gray-500);"><i class="fas fa-search"></i> هیچ فعلی با "${query}" یافت نشد</div>`;
            return;
        }
        
        suggestionsDiv.style.display = 'block';
        suggestionsDiv.innerHTML = results.map(verb => `
            <div class="verb-suggestion-item" data-verb="${verb.german}" style="cursor: pointer; padding: 12px; border-bottom: 1px solid var(--gray-200);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: bold; font-size: 18px;">${verb.german}</span>
                    <span class="verb-suggestion-type ${verb.type}" style="padding: 2px 10px; border-radius: 20px; font-size: 12px; background: ${verb.type === 'regular' ? '#10b981' : '#f59e0b'}; color: white;">${verb.type === 'regular' ? 'با قاعده' : 'بی‌قاعده'}</span>
                </div>
                <div style="font-size: 13px; color: var(--gray-500);">${verb.persian || 'فعل آلمانی'}</div>
            </div>
        `).join('');
        
        document.querySelectorAll('.verb-suggestion-item').forEach(item => {
            item.onclick = () => {
                const verb = item.dataset.verb;
                searchInput.value = verb;
                suggestionsDiv.style.display = 'none';
                this.showVerbConjugation(verb);
            };
        });
    };
    
    // دکمه جستجو
    if (searchBtn) {
        const newSearchBtn = searchBtn.cloneNode(true);
        searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);
        newSearchBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            performSearch();
        };
    }
    
    // اینتر در فیلد جستجو
    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    };
    
    // کلیک خارج از پیشنهادات
    document.addEventListener('click', (e) => {
        if (suggestionsDiv && !suggestionsDiv.contains(e.target) && e.target !== searchInput) {
            suggestionsDiv.style.display = 'none';
        }
    });
    
    // فیلترها
    document.querySelectorAll('.filter-verb-btn').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll('.filter-verb-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            this.filterVerbsList(filter);
        };
    });
}
// ================================================
// حالت مطالعه (Study Mode) - نسخه اصلاح شده
// ================================================

async startStudyMode() {
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
}

showStudySettingsModal() {
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
}

startStudyPlayback() {
    this.studySession.isPlaying = true;
    this.studySession.currentIndex = 0;
    this.showStudyWord();
}

showStudyWord() {
    if (!this.studySession.isPlaying) return;
    
    if (this.studySession.currentIndex >= this.studySession.words.length) {
        this.finishStudyMode();
        return;
    }
    
    const word = this.studySession.words[this.studySession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    const current = this.studySession.currentIndex + 1;
    const total = this.studySession.words.length;
    const progress = (current - 1) / total * 100;
    
    // ساخت HTML برای نمایش لغت (بدون نوار تایمر)
    let html = `
        <div class="word-card study-card" style="text-align: center; max-width: 700px; margin: 0 auto;">
            <div class="section-header">
                <h2><i class="fas fa-eye"></i> حالت مطالعه</h2>
                <div style="display: flex; gap: 10px;">
                    <span class="badge" style="background: linear-gradient(135deg, #f59e0b, #d97706);">${current} / ${total}</span>
                    <button id="stop-study-btn" class="btn btn-danger btn-sm">⏹ توقف</button>
                </div>
            </div>
            
            <div style="padding: 40px 20px;">
                <div style="font-size: 56px; font-weight: 800; color: var(--primary); margin-bottom: 30px; word-break: break-word;">
                    ${word.german}
                </div>
                
                ${word.gender ? `<div style="margin-bottom: 15px;"><span class="word-gender ${word.gender}" style="font-size: 18px; padding: 8px 20px;">${this.getGenderSymbol(word.gender)}</span></div>` : ''}
                ${word.type ? `<div style="margin-bottom: 15px;"><span class="word-type" style="font-size: 16px; padding: 6px 16px;">${this.getTypeLabel(word.type)}</span></div>` : ''}
                
                <div style="background: var(--gray-50); border-radius: 20px; padding: 25px; margin: 25px 0;">
                    <div style="font-size: 14px; color: var(--gray-500); margin-bottom: 10px;">📖 معنی</div>
                    <div style="font-size: 28px; font-weight: 600;">${word.persian}</div>
                </div>
                
                ${word.verbForms ? `
                <div style="background: var(--gray-50); border-radius: 20px; padding: 20px; margin: 20px 0;">
                    <div style="font-size: 14px; color: var(--gray-500); margin-bottom: 15px;">📚 صرف فعل</div>
                    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                        <div><span style="font-size: 12px;">حال ساده</span><br><strong>${word.verbForms.present || '-'}</strong></div>
                        <div><span style="font-size: 12px;">گذشته ساده</span><br><strong>${word.verbForms.past || '-'}</strong></div>
                        <div><span style="font-size: 12px;">گذشته کامل</span><br><strong>${word.verbForms.perfect || '-'}</strong></div>
                    </div>
                </div>
                ` : ''}
                
                <!-- فقط شمارش معکوس بدون نوار -->
                <div style="margin-top: 30px;">
                    <div style="font-size: 14px; color: var(--gray-500);">
                        لغت بعدی در <span id="study-countdown">${this.studySession.timePerWord}</span> ثانیه...
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('practice-section').innerHTML = html;
    this.showSection('practice-section');
    
    // دکمه توقف
    document.getElementById('stop-study-btn').onclick = () => {
        this.stopStudyMode();
    };
    
    // شروع تایمر (بدون نوار پیشرفت)
    let remaining = this.studySession.timePerWord;
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
}

nextStudyWord() {
    if (this.studyTimerInterval) {
        clearInterval(this.studyTimerInterval);
    }
    this.studySession.currentIndex++;
    this.showStudyWord();
}

stopStudyMode() {
    if (this.studyTimerInterval) {
        clearInterval(this.studyTimerInterval);
    }
    this.studySession.isPlaying = false;
    this.renderPracticeOptions();
    this.showSection('practice-section');
    this.showToast('⏹ حالت مطالعه متوقف شد', 'info');
}

finishStudyMode() {
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
}
async showVerbConjugation(verb) {
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
}

showTenseTable(tense) {
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
}

showVerbExamples(verb) {
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
}

filterVerbsList(filter) {
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
}

async startVerbPractice(verb) {
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
}

showVerbPracticeQuestion() {
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
}

async saveVerbToDictionary(verb, verbInfo) {
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
}
async checkBlankAnswer(selected) {
    const q = this.fillBlanksSession.questions[this.fillBlanksSession.currentIndex];
    const feedbackDiv = document.getElementById('blank-feedback');
    const isGerman = LanguageSystem.isGerman();
    const buttons = document.querySelectorAll('.blank-option-btn');
    const isCorrect = (selected === q.correctAnswer);
    
    buttons.forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
        this.fillBlanksSession.score++;
        this.fillBlanksSession.typeStats[q.type].correct++;
        feedbackDiv.innerHTML = `<span style="color: #10b981; font-size: 18px; font-weight: 600;">✅ ${isGerman ? 'آفرین! پاسخ صحیح است' : 'Correct!'}</span>`;
        
        buttons.forEach(btn => {
            if (btn.dataset.answer === selected) {
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                btn.style.transform = 'scale(1.05)';
            }
        });
    } else {
        feedbackDiv.innerHTML = `<span style="color: #ef4444; font-size: 16px; font-weight: 600;">
            ❌ ${isGerman ? 'پاسخ صحیح:' : 'Correct answer:'} <strong>${q.correctAnswer}</strong>
        </span>`;
        
        buttons.forEach(btn => {
            if (btn.dataset.answer === selected) {
                btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            }
            if (btn.dataset.answer === q.correctAnswer) {
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            }
        });
    }
    
    await this.recordPractice(q.word.id, isCorrect);
    
    setTimeout(() => {
        this.fillBlanksSession.currentIndex++;
        this.showFillBlanksQuestion();
    }, 1200);
}

showFillBlanksResults() {
    const totalQuestions = this.fillBlanksSession.questions.length;
    const accuracy = Math.round((this.fillBlanksSession.score / totalQuestions) * 100);
    const isGerman = LanguageSystem.isGerman();
    
    // آمار تفکیکی
    const meaningToGerman = this.fillBlanksSession.typeStats.meaning_to_german;
    const germanToMeaning = this.fillBlanksSession.typeStats.german_to_meaning;
    const sentenceFill = this.fillBlanksSession.typeStats.sentence_fill;
    
    const meaningAcc = meaningToGerman.total > 0 ? Math.round((meaningToGerman.correct / meaningToGerman.total) * 100) : 0;
    const germanAcc = germanToMeaning.total > 0 ? Math.round((germanToMeaning.correct / germanToMeaning.total) * 100) : 0;
    const sentenceAcc = sentenceFill.total > 0 ? Math.round((sentenceFill.correct / sentenceFill.total) * 100) : 0;
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fa-solid fa-chart-line"></i> ${isGerman ? 'نتایج تمرین جای خالی' : 'Fill in the Blanks Results'}</h2>
            </div>
            
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 70px; margin-bottom: 20px;">🏆</div>
                <div style="font-size: 48px; font-weight: 800; color: ${accuracy >= 70 ? '#10b981' : '#f59e0b'}; margin-bottom: 30px;">${accuracy}%</div>
                
                <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; margin-bottom: 30px;">
                    <div style="text-align: center; padding: 15px; background: var(--gray-50); border-radius: 16px; min-width: 120px;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'معنی به آلمانی' : 'Meaning → German'}</div>
                        <div style="font-size: 28px; font-weight: 700; color: #8b5cf6;">${meaningAcc}%</div>
                        <div style="font-size: 12px;">${meaningToGerman.correct}/${meaningToGerman.total}</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: var(--gray-50); border-radius: 16px; min-width: 120px;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'آلمانی به معنی' : 'German → Meaning'}</div>
                        <div style="font-size: 28px; font-weight: 700; color: #10b981;">${germanAcc}%</div>
                        <div style="font-size: 12px;">${germanToMeaning.correct}/${germanToMeaning.total}</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: var(--gray-50); border-radius: 16px; min-width: 120px;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'تکمیل جمله' : 'Sentence Fill'}</div>
                        <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${sentenceAcc}%</div>
                        <div style="font-size: 12px;">${sentenceFill.correct}/${sentenceFill.total}</div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'تعداد سوالات' : 'Questions'}</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--primary);">${totalQuestions}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'پاسخ صحیح' : 'Correct'}</div>
                        <div style="font-size: 28px; font-weight: 700; color: #10b981;">${this.fillBlanksSession.score}</div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                <button id="restart-blank-btn" class="btn btn-primary"><i class="fa-solid fa-rotate-right"></i> ${isGerman ? 'تمرین مجدد' : 'Practice Again'}</button>
                <button id="back-blank-btn" class="btn btn-outline"><i class="fa-solid fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}</button>
            </div>
        </div>
    `;
    
    document.getElementById('restart-blank-btn').onclick = () => this.startFillBlanksPractice();
    document.getElementById('back-blank-btn').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
}
async startSentenceCompletionPractice() {
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
}
showSentenceCompletionQuestion() {
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
}

async checkSentenceAnswer(selected) {
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
}
showSentenceCompletionResults() {
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
}
// اضافه کن به تابع updateStats یا هر جای دیگه
renderSRSStats() {
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
}
async applySortToFilteredWordsAsync(words, sortType) {
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
}
// ================================================
// اصلاح کامل تابع getFilteredWordsForPractice در scripts.js
// ================================================

async getFilteredWordsForPractice() {
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
}
async getWordsForPractice() {
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
}


async rebuildSRSFromHistory() {
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
}
async startPracticeSession(wordIds = null) {
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
}


    showNextFlashcard() {
        if (this.practiceSession.currentIndex >= this.practiceSession.words.length) {
            this.showPracticeResults();
            return;
        }

        const word = this.practiceSession.words[this.practiceSession.currentIndex];
        const showGermanFirst = Math.random() > 0.5;
        
        const container = document.getElementById('flashcards-section');
        
        container.innerHTML = `
            <div class="word-card">
                <div class="section-header">
                    <h2><i class="fas fa-layer-group"></i> فلش کارت</h2>
                    <span class="badge">${this.practiceSession.currentIndex + 1}/${this.practiceSession.words.length}</span>
                </div>
                
                <div class="flashcard" id="flashcard">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <div class="flashcard-word">${showGermanFirst ? word.german : word.persian}</div>
                            ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                            ${word.type ? `<span class="word-type">${this.getTypeLabel(word.type)}</span>` : ''}
                            <button class="btn btn-outline mt-4" id="flip-card-btn">
                                <i class="fas fa-redo-alt"></i> نمایش پاسخ
                            </button>
                        </div>
                        <div class="flashcard-back">
                            <div class="flashcard-word">${showGermanFirst ? word.persian : word.german}</div>
                            ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                            ${word.type ? `<span class="word-type">${this.getTypeLabel(word.type)}</span>` : ''}
                            
                            ${word.verbForms ? `
                                <div class="verb-forms mt-3">
                                    <div class="verb-form-row">
                                        <div class="verb-form-item">
                                            <span class="verb-form-label">حال</span>
                                            <input type="text" value="${word.verbForms.present || ''}" readonly>
                                        </div>
                                        <div class="verb-form-item">
                                            <span class="verb-form-label">گذشته</span>
                                            <input type="text" value="${word.verbForms.past || ''}" readonly>
                                        </div>
                                        <div class="verb-form-item">
                                            <span class="verb-form-label">کامل</span>
                                            <input type="text" value="${word.verbForms.perfect || ''}" readonly>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="flashcard-actions mt-4">
                                <button class="btn btn-success" id="correct-btn">
                                    <i class="fas fa-check"></i> بلدم
                                </button>
                                <button class="btn btn-danger" id="incorrect-btn">
                                    <i class="fas fa-times"></i> نبلدم
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="progress-bar mt-4">
                    <div class="progress-fill" style="width: ${(this.practiceSession.currentIndex / this.practiceSession.words.length) * 100}%"></div>
                </div>
            </div>
        `;
        
        this.setupFlashcardEventListeners();
    }

    setupFlashcardEventListeners() {
        document.getElementById('flip-card-btn')?.addEventListener('click', () => {
            document.getElementById('flashcard').classList.add('flipped');
        });
        
        document.getElementById('correct-btn')?.addEventListener('click', () => {
            this.handleFlashcardAnswer(true);
        });
        
        document.getElementById('incorrect-btn')?.addEventListener('click', () => {
            this.handleFlashcardAnswer(false);
        });
    }

    async handleFlashcardAnswer(isCorrect) {
        const currentIndex = this.practiceSession.currentIndex;
        const word = this.practiceSession.words[currentIndex];
        
        await this.recordPractice(word.id, isCorrect);
        
        if (isCorrect) {
            this.practiceSession.correct++;
        } else {
            this.practiceSession.incorrect++;
        }
        
        this.practiceSession.currentIndex++;
        this.showNextFlashcard();
    }

    showPracticeResults() {
        const totalWords = this.practiceSession.words.length;
        const correctAnswers = this.practiceSession.correct;
        const accuracy = totalWords > 0 ? Math.round((correctAnswers / totalWords) * 100) : 0;
        
        const container = document.getElementById('flashcards-section');
        
        container.innerHTML = `
            <div class="word-card">
                <div class="section-header">
                    <h2><i class="fas fa-trophy"></i> نتایج تمرین</h2>
                </div>
                
                <div class="results-summary">
                    <div class="result-circle" style="background: conic-gradient(var(--success) 0% ${accuracy}%, var(--gray-200) ${accuracy}% 100%);">
                        <div class="result-circle-inner">
                            <span>${accuracy}%</span>
                        </div>
                    </div>
                    
                    <div class="results-stats">
                        <div class="result-stat">
                            <span>تعداد لغات:</span>
                            <strong>${totalWords}</strong>
                        </div>
                        <div class="result-stat">
                            <span>پاسخ صحیح:</span>
                            <strong>${correctAnswers}</strong>
                        </div>
                        <div class="result-stat">
                            <span>پاسخ نادرست:</span>
                            <strong>${this.practiceSession.incorrect}</strong>
                        </div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary" id="restart-practice-btn">
                        <i class="fas fa-redo-alt"></i> تمرین مجدد
                    </button>
                    <button class="btn btn-outline" id="back-to-practice-menu-btn">
                        <i class="fas fa-arrow-right"></i> بازگشت
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('restart-practice-btn').addEventListener('click', () => {
            this.startPracticeSession();
        });
        
        document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
            this.renderPracticeOptions();
            this.showSection('practice-section');
        });
    }
    
async startMatchingPractice() {
    const wordsToPractice = await this.getFilteredWordsForPractice();
    
    let validWords = wordsToPractice.filter(w => w.german && w.persian);
    
    if (validWords.length < 4) {
        this.showToast('❌ حداقل به ۴ لغت نیاز دارید', 'error');
        return;
    }
    
    let pairCount = Math.min(6, Math.floor(validWords.length / 2));
    if (pairCount < 2) pairCount = 2;
    
    let selectedWords = this.shuffleArray([...validWords]).slice(0, pairCount);
    
    this.showToast(`📊 تعداد لغات در این بازه: ${validWords.length} لغت`, 'info');
    
    this.matchingSession = {
        words: selectedWords,
        leftItems: this.shuffleArray([...selectedWords]),
        rightItems: this.shuffleArray([...selectedWords]),
        matchedLeft: [],
        matchedRight: [],
        selectedLeft: null,
        selectedRight: null,
        attempts: 0,
        correctMatches: 0
    };
    
    this.renderMatchingGame();
}
renderMatchingGame() {
    const session = this.matchingSession;
    const isGerman = LanguageSystem.isGerman();
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-hand-peace"></i> ${isGerman ? 'تمرین تطابق لغات' : 'Matching Game'}</h2>
                <span class="badge" style="background: linear-gradient(135deg, #667eea, #764ba2);">${session.correctMatches}/${session.words.length}</span>
            </div>
            
            <div class="matching-responsive-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; padding: 20px;">
                <!-- ستون آلمانی -->
                <div>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="display: inline-block; padding: 10px 25px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 40px; color: white; font-weight: 600;">
                            <i class="fas fa-language"></i> ${isGerman ? 'آلمانی' : 'German'}
                        </div>
                    </div>
                    <div id="left-column" style="display: flex; flex-direction: column; gap: 12px;">
                        ${session.leftItems.map((item, idx) => {
                            const isMatched = session.matchedLeft.includes(item.id);
                            const isSelected = session.selectedLeft === item.id;
                            // تعیین کلاس جنسیت
                            let genderClass = '';
                            if (item.gender === 'masculine') genderClass = 'masculine';
                            else if (item.gender === 'feminine') genderClass = 'feminine';
                            else if (item.gender === 'neuter') genderClass = 'neuter';
                            else genderClass = 'none';
                            
                            return `
                                <div class="match-card left-card ${genderClass} ${isMatched ? 'correct' : ''} ${isSelected ? 'selected' : ''}" 
                                     data-id="${item.id}" data-word="${item.german}"
                                     style="${isMatched ? 'cursor: default; opacity: 0.7;' : 'cursor: pointer;'}">
                                    ${item.german}
                                    ${item.gender ? `<span class="gender-badge ${item.gender}">${this.getGenderSymbol(item.gender)}</span>` : ''}         
                                   </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- ستون فارسی -->
                <div>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="display: inline-block; padding: 10px 25px; background: linear-gradient(135deg, #ec4899, #db2777); border-radius: 40px; color: white; font-weight: 600;">
                            <i class="fas fa-pencil-alt"></i> ${isGerman ? 'فارسی' : 'Persian'}
                        </div>
                    </div>
                    <div id="right-column" style="display: flex; flex-direction: column; gap: 12px;">
                        ${session.rightItems.map((item, idx) => {
                            const isMatched = session.matchedRight.includes(item.id);
                            const isSelected = session.selectedRight === item.id;
                            // ستون فارسی بدون جنسیت
                            return `
                                <div class="match-card right-card none ${isMatched ? 'correct' : ''} ${isSelected ? 'selected' : ''}" 
                                     data-id="${item.id}" data-meaning="${item.persian}"
                                     style="${isMatched ? 'cursor: default; opacity: 0.7;' : 'cursor: pointer;'}">
                                    ${item.persian}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding: 15px; background: var(--gray-50); border-radius: 16px;">
                <span style="margin: 0 15px;"><i class="fas fa-check-circle" style="color: #10b981;"></i> ${isGerman ? 'تطابق‌های درست:' : 'Matches:'} <strong>${session.correctMatches}/${session.words.length}</strong></span>
                <span style="margin: 0 15px;"><i class="fas fa-chart-line" style="color: #667eea;"></i> ${isGerman ? 'تعداد تلاش:' : 'Attempts:'} <strong>${session.attempts}</strong></span>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
                <button id="reset-match-btn" class="btn btn-primary"><i class="fas fa-redo-alt"></i> ${isGerman ? 'شروع مجدد' : 'Reset'}</button>
                <button id="back-match-btn" class="btn btn-outline"><i class="fas fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}</button>
            </div>
        </div>
    `;
    
    this.setupMatchingEvents();
}
setupMatchingEvents() {
    const session = this.matchingSession;
    const isGerman = LanguageSystem.isGerman();
    
    // ستون چپ (آلمانی)
    document.querySelectorAll('.left-card').forEach(card => {
        if (card.style.cursor === 'default') return;
        
        card.onclick = () => {
            const id = parseInt(card.dataset.id);
            if (session.matchedLeft.includes(id)) return;
            
            // پاک کردن انتخاب قبلی چپ
            if (session.selectedLeft !== null) {
                const prevCard = document.querySelector(`.left-card[data-id="${session.selectedLeft}"]`);
                if (prevCard) prevCard.classList.remove('selected');
            }
            
            session.selectedLeft = id;
            card.classList.add('selected');
            
            if (session.selectedRight !== null) {
                this.checkMatch();
            }
        };
    });
    
    // ستون راست (فارسی)
    document.querySelectorAll('.right-card').forEach(card => {
        if (card.style.cursor === 'default') return;
        
        card.onclick = () => {
            const id = parseInt(card.dataset.id);
            if (session.matchedRight.includes(id)) return;
            
            if (session.selectedRight !== null) {
                const prevCard = document.querySelector(`.right-card[data-id="${session.selectedRight}"]`);
                if (prevCard) prevCard.classList.remove('selected');
            }
            
            session.selectedRight = id;
            card.classList.add('selected');
            
            if (session.selectedLeft !== null) {
                this.checkMatch();
            }
        };
    });
    
    document.getElementById('reset-match-btn').onclick = () => this.startMatchingPractice();
    document.getElementById('back-match-btn').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
}
async checkMatch() {
    const session = this.matchingSession;
    const isGerman = LanguageSystem.isGerman();
    
    session.attempts++;
    
    const leftWord = session.leftItems.find(w => w.id === session.selectedLeft);
    const rightWord = session.rightItems.find(w => w.id === session.selectedRight);
    
    const leftCard = document.querySelector(`.left-card[data-id="${session.selectedLeft}"]`);
    const rightCard = document.querySelector(`.right-card[data-id="${session.selectedRight}"]`);
    
    const isMatch = leftWord && rightWord && leftWord.id === rightWord.id;
    
    if (isMatch) {
        session.correctMatches++;
        session.matchedLeft.push(session.selectedLeft);
        session.matchedRight.push(session.selectedRight);
        
        await this.recordPractice(leftWord.id, true);
        
        // اضافه کردن کلاس correct (سبز)
        if (leftCard) {
            leftCard.classList.add('correct');
            leftCard.style.cursor = 'default';
        }
        if (rightCard) {
            rightCard.classList.add('correct');
            rightCard.style.cursor = 'default';
        }
        
        if (session.correctMatches === session.words.length) {
            setTimeout(() => {
                this.showMatchingFinalResult();
            }, 500);
        }
    } else {
        await this.recordPractice(leftWord?.id || rightWord?.id, false);
        
        // اضافه کردن کلاس wrong (قرمز) برای خطا
        if (leftCard) {
            leftCard.classList.add('wrong');
            setTimeout(() => {
                leftCard.classList.remove('wrong');
            }, 500);
        }
        if (rightCard) {
            rightCard.classList.add('wrong');
            setTimeout(() => {
                rightCard.classList.remove('wrong');
            }, 500);
        }
    }
    
    // حذف کلاس selected از کارت‌ها
    if (leftCard) leftCard.classList.remove('selected');
    if (rightCard) rightCard.classList.remove('selected');
    
    session.selectedLeft = null;
    session.selectedRight = null;
    
    // بروزرسانی آمار
    const statsDiv = document.querySelector('.word-card > div:nth-child(3)');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <span style="margin: 0 15px;"><i class="fas fa-check-circle" style="color: #10b981;"></i> ${isGerman ? 'تطابق‌های درست:' : 'Matches:'} <strong>${session.correctMatches}/${session.words.length}</strong></span>
            <span style="margin: 0 15px;"><i class="fas fa-chart-line" style="color: #667eea;"></i> ${isGerman ? 'تعداد تلاش:' : 'Attempts:'} <strong>${session.attempts}</strong></span>
        `;
    }
    
    const badge = document.querySelector('.badge');
    if (badge) badge.textContent = `${session.correctMatches}/${session.words.length}`;
}

showMatchingFinalResult() {
    const session = this.matchingSession;
    const accuracy = Math.round((session.correctMatches / session.words.length) * 100);
    const isGerman = LanguageSystem.isGerman();
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-trophy"></i> ${isGerman ? 'نتایج تمرین تطابق' : 'Matching Results'}</h2>
            </div>
            
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 70px; margin-bottom: 20px;">🏆</div>
                <div style="font-size: 48px; font-weight: 800; color: #10b981; margin-bottom: 20px;">${accuracy}%</div>
                <div style="font-size: 18px; margin-bottom: 30px; color: var(--gray-600);">${isGerman ? 'تبریک! همه لغات را درست تطابق زدید!' : 'Congratulations! You matched all words!'}</div>
                
                <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'تعداد جفت‌ها' : 'Pairs'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${session.words.length}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'تعداد تلاش' : 'Attempts'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">${session.attempts}</div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                <button id="restart-match-final" class="btn btn-primary"><i class="fas fa-redo-alt"></i> ${isGerman ? 'تمرین مجدد' : 'Practice Again'}</button>
                <button id="back-match-final" class="btn btn-outline"><i class="fas fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}</button>
            </div>
        </div>
    `;
    
    document.getElementById('restart-match-final').onclick = () => this.startMatchingPractice();
    document.getElementById('back-match-final').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
}
async startGenderPractice() {
    const allWords = await this.getFilteredWordsForPractice();
    
    // فقط اسم‌هایی که جنسیت دارند
    let nounWords = allWords.filter(word => word.type === 'noun' && word.gender);
    
    if (nounWords.length === 0) {
        this.showToast('❌ هیچ اسمی با جنسیت در این بازه وجود ندارد', 'error');
        return;
    }
    
    const activeCount = document.querySelector('.count-option.active');
    let questionCount = activeCount ? (activeCount.dataset.count === 'all' ? nounWords.length : parseInt(activeCount.dataset.count)) : 10;
    
    if (nounWords.length < questionCount) {
        questionCount = nounWords.length;
    }
    
    const activeOrder = document.querySelector('.order-option.active');
    const order = activeOrder ? activeOrder.dataset.order : 'random';
    
    let selectedWords = [];
    if (order === 'sequential') {
        selectedWords = [...nounWords].sort((a, b) => a.german.localeCompare(b.german, 'de')).slice(0, questionCount);
    } else if (order === 'hardest') {
        const history = await this.getAllPracticeHistory();
        const errorCounts = {};
        history.forEach(record => {
            if (!record.correct) {
                errorCounts[record.wordId] = (errorCounts[record.wordId] || 0) + 1;
            }
        });
        selectedWords = [...nounWords].sort((a, b) => (errorCounts[b.id] || 0) - (errorCounts[a.id] || 0)).slice(0, questionCount);
    } else {
        selectedWords = this.shuffleArray([...nounWords]).slice(0, questionCount);
    }
    
    this.showToast(`📊 تعداد اسم در این بازه: ${nounWords.length} لغت`, 'info');
    
    this.genderSession = {
        words: selectedWords,
        currentIndex: 0,
        score: 0,
        answers: [],
        showMeaning: false
    };
    
    this.showGenderQuestion();
}

showGenderQuestion() {
    if (this.genderSession.currentIndex >= this.genderSession.words.length) {
        this.showGenderFinalResult();
        return;
    }
    
    const word = this.genderSession.words[this.genderSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    const current = this.genderSession.currentIndex + 1;
    const total = this.genderSession.words.length;
    const progress = (current - 1) / total * 100;
    const showMeaning = this.genderSession.showMeaning;
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-venus-mars"></i> ${isGerman ? 'تمرین تشخیص جنسیت اسم' : 'Gender Guesser'}</h2>
                <span class="badge" style="background: linear-gradient(135deg, #667eea, #764ba2);">${current}/${total}</span>
            </div>
            
            <div class="gender-exercise" style="text-align: center; padding: 40px 20px;">
                <div class="gender-word" style="font-size: 64px; font-weight: 800; color: var(--primary); margin-bottom: 30px; word-break: break-word;">
                    ${word.german}
                </div>
                
                <div style="margin-bottom: 30px;">
                    <button id="toggle-meaning-btn" class="btn ${showMeaning ? 'btn-success' : 'btn-outline'}" style="padding: 10px 25px;">
                        <i class="fas ${showMeaning ? 'fa-eye-slash' : 'fa-eye'}"></i> 
                        ${showMeaning ? (isGerman ? 'مخفی کردن معنی' : 'Hide Meaning') : (isGerman ? 'نمایش معنی' : 'Show Meaning')}
                    </button>
                    <div id="word-meaning-display" style="margin-top: 15px; font-size: 18px; ${showMeaning ? 'display: block;' : 'display: none;'} color: var(--success); background: rgba(16,185,129,0.1); padding: 10px 20px; border-radius: 50px;">
                        📖 ${word.persian}
                    </div>
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-bottom: 40px;">
                    <button id="gender-masculine" class="gender-option-btn" data-gender="masculine" style="padding: 14px 35px; font-size: 18px; background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; border-radius: 50px; color: white; cursor: pointer;">
                        <i class="fas fa-mars"></i> der
                    </button>
                    <button id="gender-feminine" class="gender-option-btn" data-gender="feminine" style="padding: 14px 35px; font-size: 18px; background: linear-gradient(135deg, #ec4899, #db2777); border: none; border-radius: 50px; color: white; cursor: pointer;">
                        <i class="fas fa-venus"></i> die
                    </button>
                    <button id="gender-neuter" class="gender-option-btn" data-gender="neuter" style="padding: 14px 35px; font-size: 18px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 50px; color: white; cursor: pointer;">
                        <i class="fas fa-genderless"></i> das
                    </button>
                </div>
                
                <div id="gender-feedback" style="margin-top: 20px; font-size: 16px; min-height: 50px;"></div>
                
                <div style="width: 70%; margin: 30px auto 0; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, var(--primary), #10b981);"></div>
                </div>
            </div>
        </div>
    `;
    
    const toggleMeaningBtn = document.getElementById('toggle-meaning-btn');
    const meaningDisplay = document.getElementById('word-meaning-display');
    
    if (toggleMeaningBtn) {
        toggleMeaningBtn.onclick = () => {
            this.genderSession.showMeaning = !this.genderSession.showMeaning;
            const newShowMeaning = this.genderSession.showMeaning;
            
            if (newShowMeaning) {
                meaningDisplay.style.display = 'block';
                toggleMeaningBtn.innerHTML = '<i class="fas fa-eye-slash"></i> ' + (isGerman ? 'مخفی کردن معنی' : 'Hide Meaning');
                toggleMeaningBtn.classList.remove('btn-outline');
                toggleMeaningBtn.classList.add('btn-success');
            } else {
                meaningDisplay.style.display = 'none';
                toggleMeaningBtn.innerHTML = '<i class="fas fa-eye"></i> ' + (isGerman ? 'نمایش معنی' : 'Show Meaning');
                toggleMeaningBtn.classList.remove('btn-success');
                toggleMeaningBtn.classList.add('btn-outline');
            }
        };
    }
    
    document.getElementById('gender-masculine').onclick = () => this.checkGenderAnswer('masculine');
    document.getElementById('gender-feminine').onclick = () => this.checkGenderAnswer('feminine');
    document.getElementById('gender-neuter').onclick = () => this.checkGenderAnswer('neuter');
}
async checkGenderAnswer(selected) {
    const currentWord = this.genderSession.words[this.genderSession.currentIndex];
    const isCorrect = (selected === currentWord.gender);
    
    const feedbackDiv = document.getElementById('gender-feedback');
    const buttons = document.querySelectorAll('.gender-option-btn');
    
    buttons.forEach(btn => btn.style.pointerEvents = 'none');
    
    if (isCorrect) {
        this.genderSession.score++;
        feedbackDiv.innerHTML = '<span style="color: #10b981; font-size: 18px;">✅ آفرین! پاسخ صحیح است</span>';
        
        // سبز کردن دکمه درست
        if (selected === 'masculine') {
            document.getElementById('gender-masculine').style.background = 'linear-gradient(135deg, #059669, #047857)';
        } else if (selected === 'feminine') {
            document.getElementById('gender-feminine').style.background = 'linear-gradient(135deg, #be185d, #9d174d)';
        } else {
            document.getElementById('gender-neuter').style.background = 'linear-gradient(135deg, #047857, #065f46)';
        }
    } else {
        let correctText = currentWord.gender === 'masculine' ? 'der' : 
                         currentWord.gender === 'feminine' ? 'die' : 'das';
        feedbackDiv.innerHTML = `<span style="color: #ef4444; font-size: 18px;">❌ پاسخ صحیح: ${correctText} ${currentWord.german}</span>`;
        
        // قرمز کردن دکمه اشتباه
        if (selected === 'masculine') {
            document.getElementById('gender-masculine').style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
        } else if (selected === 'feminine') {
            document.getElementById('gender-feminine').style.background = 'linear-gradient(135deg, #be185d, #9d174d)';
        } else {
            document.getElementById('gender-neuter').style.background = 'linear-gradient(135deg, #b91c1c, #991b1b)';
        }
        
        // سبز کردن دکمه درست
        if (currentWord.gender === 'masculine') {
            document.getElementById('gender-masculine').style.background = 'linear-gradient(135deg, #059669, #047857)';
        } else if (currentWord.gender === 'feminine') {
            document.getElementById('gender-feminine').style.background = 'linear-gradient(135deg, #be185d, #9d174d)';
        } else {
            document.getElementById('gender-neuter').style.background = 'linear-gradient(135deg, #047857, #065f46)';
        }
        
        setTimeout(() => {
            // برگرداندن رنگ اصلی
            document.getElementById('gender-masculine').style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
            document.getElementById('gender-feminine').style.background = 'linear-gradient(135deg, #ec4899, #db2777)';
            document.getElementById('gender-neuter').style.background = 'linear-gradient(135deg, #10b981, #059669)';
        }, 1000);
    }
    
    await this.recordPractice(currentWord.id, isCorrect);
    
    setTimeout(() => {
        this.genderSession.currentIndex++;
        this.showGenderQuestion();
    }, 1200);
}

showGenderFinalResult() {
    const accuracy = Math.round((this.genderSession.score / this.genderSession.words.length) * 100);
    const isGerman = LanguageSystem.isGerman();
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-chart-line"></i> ${isGerman ? 'نتایج تمرین جنسیت' : 'Gender Guesser Results'}</h2>
            </div>
            
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 70px; margin-bottom: 20px;">🏆</div>
                <div style="font-size: 48px; font-weight: 800; color: ${accuracy >= 70 ? '#10b981' : '#f59e0b'}; margin-bottom: 30px;">${accuracy}%</div>
                
                <div style="display: flex; justify-content: center; gap: 50px; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'تعداد سوالات' : 'Questions'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${this.genderSession.words.length}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'پاسخ صحیح' : 'Correct'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: #10b981;">${this.genderSession.score}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'پاسخ نادرست' : 'Wrong'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: #ef4444;">${this.genderSession.words.length - this.genderSession.score}</div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                <button id="restart-gender-final" class="btn btn-primary"><i class="fas fa-redo-alt"></i> ${isGerman ? 'تمرین مجدد' : 'Practice Again'}</button>
                <button id="back-gender-final" class="btn btn-outline"><i class="fas fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}</button>
            </div>
        </div>
    `;
    
    document.getElementById('restart-gender-final').onclick = () => this.startGenderPractice();
    document.getElementById('back-gender-final').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
}
async startPrepositionsPractice() {
    const isGerman = LanguageSystem.isGerman();
    
    // ========== دریافت تنظیمات ==========
    let selectedLevel = 'A1';
    let selectedCase = 'all';
    let questionCount = 10;
    
    // چک کردن وجود المان‌ها در DOM
    const levelSelect = document.getElementById('prep-level-select');
    const caseSelect = document.getElementById('prep-case-select');
    const countInput = document.getElementById('prep-count');
    
    if (levelSelect) selectedLevel = levelSelect.value;
    if (caseSelect) selectedCase = caseSelect.value;
    if (countInput && countInput.value) {
        questionCount = parseInt(countInput.value);
        if (isNaN(questionCount) || questionCount < 3) questionCount = 10;
        if (questionCount > 32) questionCount = 32;
    }
    
    // ========== فیلتر حروف اضافه ==========
    let filteredPreps = [...this.prepositionsDB];
    
    if (selectedLevel !== 'all') {
        filteredPreps = filteredPreps.filter(p => p.level === selectedLevel);
    }
    
    if (selectedCase !== 'all') {
        filteredPreps = filteredPreps.filter(p => p.case === selectedCase);
    }
    
    console.log(`📊 حروف اضافه: کل=${this.prepositionsDB.length}, فیلتر شده=${filteredPreps.length}, سطح=${selectedLevel}, حالت=${selectedCase}`);
    
    // ========== بررسی وجود حروف اضافه کافی ==========
    if (filteredPreps.length === 0) {
        this.showToast(`❌ هیچ حرف اضافه‌ای با سطح ${selectedLevel} و حالت ${selectedCase} یافت نشد. تنظیمات را تغییر دهید.`, 'error');
        return;
    }
    
    if (filteredPreps.length < 3) {
        this.showToast(`❌ حداقل به ۳ حرف اضافه نیاز است. (${filteredPreps.length} مورد موجود است)`, 'error');
        return;
    }
    
    if (filteredPreps.length < questionCount) {
        questionCount = filteredPreps.length;
    }
    
    // ========== انتخاب تصادفی سوالات ==========
    let selectedPreps = this.shuffleArray([...filteredPreps]).slice(0, questionCount);
    
    // ========== ساخت سوالات ==========
    this.prepositionSession = {
        questions: [],
        currentIndex: 0,
        score: 0,
        settings: { level: selectedLevel, case: selectedCase, totalQuestions: questionCount }
    };
    
    for (let prep of selectedPreps) {
        // ساخت گزینه‌های اشتباه (3 گزینه از حروف اضافه دیگه)
        let otherPreps = filteredPreps.filter(p => p.preposition !== prep.preposition);
        otherPreps = this.shuffleArray(otherPreps).slice(0, 3);
        
        // اگه گزینه کافی نبود، از کل دیتابیس بگیر
        while (otherPreps.length < 3) {
            let other = this.prepositionsDB.find(p => p.preposition !== prep.preposition && !otherPreps.includes(p));
            if (other) otherPreps.push(other);
            else break;
        }
        
        let options = [prep.preposition, ...otherPreps.map(p => p.preposition)];
        options = this.shuffleArray(options);
        
        this.prepositionSession.questions.push({
            preposition: prep.preposition,
            meaning: prep.meaning,
            example: prep.example,
            exampleTrans: prep.exampleTrans,
            case: prep.case,
            level: prep.level,
            correctAnswer: prep.preposition,
            options: options
        });
    }
    
    // ========== نمایش تمرین ==========
    this.showPrepositionQuestion();
    this.showSection('practice-section');
}

showPrepositionQuestion() {
    if (this.prepositionSession.currentIndex >= this.prepositionSession.questions.length) {
        this.showPrepositionResults();
        return;
    }
    
    const q = this.prepositionSession.questions[this.prepositionSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    const current = this.prepositionSession.currentIndex + 1;
    const total = this.prepositionSession.questions.length;
    const progress = (current - 1) / total * 100;
    
    // رنگ‌بندی بر اساس حالت
    let caseColor = '#6b7280';
    if (q.case === 'Akkusativ') caseColor = '#3b82f6';
    else if (q.case === 'Dativ') caseColor = '#10b981';
    else if (q.case === 'Wechsel') caseColor = '#f59e0b';
    else if (q.case === 'Genitiv') caseColor = '#8b5cf6';
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fa-solid fa-location-dot"></i> ${isGerman ? 'تمرین حروف اضافه' : 'Prepositions Practice'}</h2>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <span class="badge" style="background: ${caseColor};">${q.case}</span>
                    <span class="badge" style="background: #6b7280;">${q.level}</span>
                    <span class="badge" style="background: linear-gradient(135deg, #f59e0b, #d97706);">${current}/${total}</span>
                </div>
            </div>
            
            <!-- منوی تنظیمات -->
            <div class="preposition-settings" style="margin-bottom: 20px; padding: 15px; background: var(--gray-50); border-radius: 16px;">
                <h4 style="margin-bottom: 10px;"><i class="fa-solid fa-sliders-h"></i> ${isGerman ? 'تنظیمات حروف اضافه' : 'Preposition Settings'}</h4>
                <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: flex-end;">
                    <div>
                        <label style="display: block; margin-bottom: 5px;">${isGerman ? 'سطح:' : 'Level:'}</label>
                        <select id="prep-level-select" class="form-control" style="padding: 8px 12px;">
                            <option value="A1" ${this.prepositionSession.settings.level === 'A1' ? 'selected' : ''}>A1 (آغاز)</option>
                            <option value="A2" ${this.prepositionSession.settings.level === 'A2' ? 'selected' : ''}>A2 (پایه)</option>
                            <option value="B1" ${this.prepositionSession.settings.level === 'B1' ? 'selected' : ''}>B1 (متوسط)</option>
                            <option value="B2" ${this.prepositionSession.settings.level === 'B2' ? 'selected' : ''}>B2 (پیشرفته)</option>
                            <option value="all" ${this.prepositionSession.settings.level === 'all' ? 'selected' : ''}>${isGerman ? 'همه سطوح' : 'All Levels'}</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px;">${isGerman ? 'حالت:' : 'Case:'}</label>
                        <select id="prep-case-select" class="form-control" style="padding: 8px 12px;">
                            <option value="all" ${this.prepositionSession.settings.case === 'all' ? 'selected' : ''}>${isGerman ? 'همه حالات' : 'All Cases'}</option>
                            <option value="Akkusativ" ${this.prepositionSession.settings.case === 'Akkusativ' ? 'selected' : ''}>Akkusativ</option>
                            <option value="Dativ" ${this.prepositionSession.settings.case === 'Dativ' ? 'selected' : ''}>Dativ</option>
                            <option value="Wechsel" ${this.prepositionSession.settings.case === 'Wechsel' ? 'selected' : ''}>Wechsel</option>
                            <option value="Genitiv" ${this.prepositionSession.settings.case === 'Genitiv' ? 'selected' : ''}>Genitiv</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px;">${isGerman ? 'تعداد:' : 'Count:'}</label>
                        <input type="number" id="prep-count" class="form-control" value="${this.prepositionSession.settings.totalQuestions}" min="3" max="32" style="width: 80px; padding: 8px; text-align: center;">
                    </div>
                    <div>
                        <button id="apply-prep-settings" class="btn btn-primary" style="padding: 8px 20px;">
                            <i class="fa-solid fa-check"></i> ${isGerman ? 'اعمال' : 'Apply'}
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- سوال -->
            <div style="text-align: center; padding: 20px;">
                <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 20px; padding: 25px; margin-bottom: 20px;">
                    <div style="font-size: 14px; color: #92400e; margin-bottom: 10px;">
                        <i class="fa-solid fa-quote-right"></i> ${isGerman ? 'جمله را کامل کنید:' : 'Complete the sentence:'}
                    </div>
                    <div style="font-size: 18px; font-weight: 500; color: #78350f; direction: ltr; text-align: center; word-break: break-word;">
                        ${q.example.replace(q.preposition, '______')}
                    </div>
                    <div style="font-size: 14px; color: #92400e; margin-top: 10px;">
                        📖 ${q.exampleTrans}
                    </div>
                </div>
                
                <div style="background: #f0fdf4; border-radius: 12px; padding: 10px; margin-bottom: 20px;">
                    <span style="font-size: 14px; color: #065f46;">
                        <i class="fa-solid fa-lightbulb"></i> ${isGerman ? 'معنی حرف اضافه:' : 'Meaning:'} <strong>${q.meaning}</strong>
                    </span>
                </div>
                
                <div class="preposition-options-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 25px;">
                    ${q.options.map(opt => `
                        <button class="preposition-btn" data-answer="${opt}" 
                            style="padding: 12px 16px; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; border-radius: 40px; color: white; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s ease;">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                
                <div id="prep-feedback" style="margin-top: 15px; font-size: 16px; min-height: 50px;"></div>
                
                <div style="width: 70%; margin: 20px auto 0; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #f59e0b, #ef4444); transition: width 0.3s ease;"></div>
                </div>
            </div>
        </div>
    `;
    
    // رویداد دکمه اعمال تنظیمات
    const applyBtn = document.getElementById('apply-prep-settings');
    if (applyBtn) {
        applyBtn.onclick = () => {
            const newLevel = document.getElementById('prep-level-select').value;
            const newCase = document.getElementById('prep-case-select').value;
            const newCount = parseInt(document.getElementById('prep-count').value);
            
            localStorage.setItem('prepositionLevel', newLevel);
            localStorage.setItem('prepositionCase', newCase);
            
            this.prepositionSession.settings.level = newLevel;
            this.prepositionSession.settings.case = newCase;
            this.prepositionSession.settings.totalQuestions = newCount;
            
            this.startPrepositionsPractice();
        };
    }
    
    // رویداد دکمه‌های پاسخ
    document.querySelectorAll('.preposition-btn').forEach(btn => {
        btn.onclick = () => this.checkPrepositionAnswer(btn.dataset.answer);
    });
}

async checkPrepositionAnswer(selected) {
    const q = this.prepositionSession.questions[this.prepositionSession.currentIndex];
    const feedbackDiv = document.getElementById('prep-feedback');
    const isGerman = LanguageSystem.isGerman();
    const buttons = document.querySelectorAll('.preposition-btn');
    const isCorrect = (selected === q.correctAnswer);
    
    // غیرفعال کردن دکمه‌ها
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'default';
    });
    
    if (isCorrect) {
        this.prepositionSession.score++;
        feedbackDiv.innerHTML = `<span style="color: #10b981; font-size: 18px; font-weight: 600;">✅ ${isGerman ? 'آفرین! پاسخ صحیح است' : 'Correct!'}</span>`;
        
        buttons.forEach(btn => {
            if (btn.dataset.answer === selected) {
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                btn.style.transform = 'scale(1.05)';
            }
        });
    } else {
        feedbackDiv.innerHTML = `<span style="color: #ef4444; font-size: 16px; font-weight: 600;">
            ❌ ${isGerman ? 'پاسخ صحیح:' : 'Correct answer:'} <strong>${q.correctAnswer}</strong><br>
            <span style="font-size: 14px;">📖 ${q.example}</span>
        </span>`;
        
        buttons.forEach(btn => {
            if (btn.dataset.answer === selected) {
                btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            }
            if (btn.dataset.answer === q.correctAnswer) {
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            }
        });
    }
    
    // ثبت در تاریخچه
    await this.recordPractice(`prep_${q.preposition}`, isCorrect);
    
    // رفتن به سوال بعدی
    setTimeout(() => {
        this.prepositionSession.currentIndex++;
        this.showPrepositionQuestion();
    }, 1500);
}

showPrepositionResults() {
    const total = this.prepositionSession.questions.length;
    const score = this.prepositionSession.score;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    const isGerman = LanguageSystem.isGerman();
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fa-solid fa-chart-line"></i> ${isGerman ? 'نتایج تمرین حروف اضافه' : 'Prepositions Results'}</h2>
            </div>
            
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 70px; margin-bottom: 20px;">📚</div>
                <div style="font-size: 48px; font-weight: 800; color: ${accuracy >= 70 ? '#10b981' : '#f59e0b'}; margin-bottom: 30px;">${accuracy}%</div>
                
                <div style="display: flex; justify-content: center; gap: 50px; flex-wrap: wrap; margin-bottom: 30px;">
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'تعداد سوالات' : 'Questions'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${total}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'پاسخ صحیح' : 'Correct'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: #10b981;">${score}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'پاسخ نادرست' : 'Wrong'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: #ef4444;">${total - score}</div>
                    </div>
                </div>
                
                <div style="padding: 15px; background: var(--gray-50); border-radius: 12px;">
                    <p><i class="fa-solid fa-chart-simple"></i> ${isGerman ? 'سطح:' : 'Level:'} <strong>${this.prepositionSession.settings.level}</strong> | ${isGerman ? 'حالت:' : 'Case:'} <strong>${this.prepositionSession.settings.case}</strong></p>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                <button id="restart-prep-btn" class="btn btn-primary"><i class="fa-solid fa-rotate-right"></i> ${isGerman ? 'تمرین مجدد' : 'Practice Again'}</button>
                <button id="back-prep-btn" class="btn btn-outline"><i class="fa-solid fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}</button>
            </div>
        </div>
    `;
    
    document.getElementById('restart-prep-btn').onclick = () => this.startPrepositionsPractice();
    document.getElementById('back-prep-btn').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
}

    
    // ================================================
    // تمرین شنیداری
    // ================================================
async startListeningPractice() {
    const wordsToPractice = await this.getWordsForPractice();
    
    if (wordsToPractice.length === 0) return;
    
    this.listeningSession = {
        words: wordsToPractice,
        currentIndex: 0,
        score: 0,
        attempts: 0
    };
    
    this.showListeningExercise();
}

 showListeningExercise() {
    if (this.listeningSession.currentIndex >= this.listeningSession.words.length) {
        this.showListeningResults();
        return;
    }

    const word = this.listeningSession.words[this.listeningSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    
    // بررسی اینکه آیا این لغت قبلاً پاسخ داده شده و درست بوده یا نه
    const currentWordData = this.listeningSession.words[this.listeningSession.currentIndex];
    const isAnsweredCorrect = currentWordData.userCorrect === true;
    const isAnsweredIncorrect = currentWordData.userCorrect === false;
    
    document.getElementById('practice-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-headphones"></i> ${LanguageSystem.t('practice.listening')}</h2>
                <span class="badge">${this.listeningSession.currentIndex + 1}/${this.listeningSession.words.length}</span>
            </div>
            
            <div class="listening-exercise">
                <div class="voice-controls">
                    <button class="voice-btn" id="play-pronunciation-btn">
                        <i class="fas fa-play"></i> ${LanguageSystem.t('practice.start')}
                    </button>
                    <button class="voice-btn replay" id="replay-pronunciation-btn">
                        <i class="fas fa-redo-alt"></i> ${isGerman ? 'تکرار' : 'Repeat'}
                    </button>
                </div>
                
                <div class="exercise-content">
                    <input type="text" 
                           class="answer-input" 
                           id="listening-answer" 
                           placeholder="${isGerman ? 'لغت آلمانی را تایپ کنید...' : 'Type the German word...'}"
                           autocomplete="off"
                           ${isAnsweredCorrect || isAnsweredIncorrect ? 'disabled' : ''}>
                    
                    <div class="action-buttons">
                        <button class="btn btn-success" id="check-listening-answer-btn" ${isAnsweredCorrect || isAnsweredIncorrect ? 'disabled' : ''}>
                            <i class="fas fa-check"></i> ${LanguageSystem.t('practice.check')}
                        </button>
                        <button class="btn btn-outline" id="skip-listening-btn">
                            <i class="fas fa-forward"></i> ${LanguageSystem.t('practice.skip')}
                        </button>
                    </div>
                    
                    <!-- نقطه‌های پیشرفت با رنگ صحیح -->
                    <div class="progress-dots">
                        ${this.listeningSession.words.map((w, index) => {
                            let dotClass = '';
                            if (index === this.listeningSession.currentIndex) {
                                dotClass = 'active';
                            } else if (index < this.listeningSession.currentIndex) {
                                // اینجا رنگ رو بر اساس پاسخ کاربر تعیین کن
                                dotClass = w.userCorrect === true ? 'completed correct' : 
                                          w.userCorrect === false ? 'completed incorrect' : 'completed';
                            }
                            return `<div class="progress-dot ${dotClass}"></div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    this.playPronunciation(word.german);
    this.setupListeningExerciseEventListeners(word);
}

    setupListeningExerciseEventListeners(word) {
        document.getElementById('play-pronunciation-btn').addEventListener('click', () => {
            this.playPronunciation(word.german);
        });
        
        document.getElementById('replay-pronunciation-btn').addEventListener('click', () => {
            this.playPronunciation(word.german);
        });
        
        document.getElementById('check-listening-answer-btn').addEventListener('click', () => {
            this.checkListeningAnswer();
        });
        
        document.getElementById('skip-listening-btn').addEventListener('click', () => {
            this.skipListeningExercise();
        });
        
        document.getElementById('listening-answer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkListeningAnswer();
            }
        });
        
        setTimeout(() => {
            document.getElementById('listening-answer').focus();
        }, 300);
    }
async checkListeningAnswer() {
    const userAnswer = document.getElementById('listening-answer').value.trim();
    const currentWord = this.listeningSession.words[this.listeningSession.currentIndex];
    
    if (!userAnswer) {
        this.showToast('✏️ لطفاً پاسخ را وارد کنید', 'warning');
        return;
    }
    
    // نرمالایز کردن
    const normalizedUser = this.normalizeAnswer(userAnswer);
    const normalizedCorrect = this.normalizeAnswer(currentWord.german);
    
    const isCorrect = normalizedUser === normalizedCorrect;
    
    this.listeningSession.attempts++;
    await this.recordPractice(currentWord.id, isCorrect);
    
    // ذخیره وضعیت پاسخ برای این لغت
    this.listeningSession.words[this.listeningSession.currentIndex].userCorrect = isCorrect;
    
    const answerInput = document.getElementById('listening-answer');
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'feedback-message';
    
    if (isCorrect) {
        this.listeningSession.score++;
        this.showToast('✅ آفرین! پاسخ صحیح است', 'success');
        
        answerInput.style.borderColor = 'var(--success)';
        answerInput.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        
        feedbackDiv.className = 'feedback-message feedback-correct';
        feedbackDiv.innerHTML = `<i class="fas fa-check-circle"></i> پاسخ صحیح! آفرین!`;
        
        // غیرفعال کردن اینپوت
        answerInput.disabled = true;
        document.getElementById('check-listening-answer-btn').disabled = true;
        
    } else {
        this.showToast(`❌ پاسخ صحیح: ${currentWord.german}`, 'error');
        
        answerInput.style.borderColor = 'var(--danger)';
        answerInput.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        
        feedbackDiv.className = 'feedback-message feedback-incorrect';
        feedbackDiv.innerHTML = `<i class="fas fa-times-circle"></i> پاسخ صحیح: <strong>${currentWord.german}</strong>`;
        
        // غیرفعال کردن اینپوت
        answerInput.disabled = true;
        document.getElementById('check-listening-answer-btn').disabled = true;
    }
    
    // حذف پیام قبلی و اضافه کردن پیام جدید
    const oldFeedback = document.querySelector('.feedback-message');
    if (oldFeedback) oldFeedback.remove();
    answerInput.parentNode.appendChild(feedbackDiv);
    
    // رفتن به سوال بعدی با تاخیر
    setTimeout(() => {
        this.listeningSession.currentIndex++;
        this.showListeningExercise();
    }, 2000);
}

    skipListeningExercise() {
        this.listeningSession.currentIndex++;
        this.showListeningExercise();
    }
showListeningResults() {
    const accuracy = Math.round((this.listeningSession.score / this.listeningSession.words.length) * 100);
    const isGerman = LanguageSystem.isGerman();
    
    document.getElementById('practice-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-chart-line"></i> ${isGerman ? 'نتایج تمرین شنیداری' : 'Listening Practice Results'}</h2>
            </div>
            
            <div class="results-summary">
                <div class="result-circle" style="background: conic-gradient(var(--success) 0% ${accuracy}%, var(--gray-200) ${accuracy}% 100%);">
                    <div class="result-circle-inner">
                        <span>${accuracy}%</span>
                    </div>
                </div>
                
                <div class="results-stats">
                    <div class="result-stat">
                        <span>${isGerman ? 'تعداد لغات:' : 'Total Words:'}</span>
                        <strong>${this.listeningSession.words.length}</strong>
                    </div>
                    <div class="result-stat">
                        <span>${isGerman ? 'پاسخ صحیح:' : 'Correct Answers:'}</span>
                        <strong>${this.listeningSession.score}</strong>
                    </div>
                    <div class="result-stat">
                        <span>${isGerman ? 'تعداد تلاش:' : 'Attempts:'}</span>
                        <strong>${this.listeningSession.attempts}</strong>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary" id="restart-listening-btn">
                    <i class="fas fa-redo-alt"></i> ${isGerman ? 'تمرین مجدد' : 'Practice Again'}
                </button>
                <button class="btn btn-outline" id="back-to-practice-menu-btn">
                    <i class="fas fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('restart-listening-btn').addEventListener('click', () => {
        this.startListeningPractice();
    });
    
    document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    });
}

    // ================================================
    // تمرین نوشتاری
    // ================================================

// ================================================
// تمرین جمله‌سازی هوشمند با AI - نسخه نهایی پیشرفته
// ================================================

async startWritingPractice() {
    const wordsToPractice = await this.getWordsForPractice();
    if (wordsToPractice.length === 0) return;
    this.writingSession = {
        words: wordsToPractice,
        currentIndex: 0,
        score: 0
    };
    this.showWritingExercise();
}

showWritingExercise() {
    if (this.writingSession.currentIndex >= this.writingSession.words.length) {
        this.showWritingResults();
        return;
    }
    const word = this.writingSession.words[this.writingSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    document.getElementById('practice-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-keyboard"></i> ${LanguageSystem.t('practice.writing')}</h2>
                <span class="badge">${this.writingSession.currentIndex + 1}/${this.writingSession.words.length}</span>
            </div>
            <div class="writing-exercise">
                <div class="word-to-translate">
                    <h3>${word.persian}</h3>
                    ${word.gender ? `<span class="word-gender ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                </div>
                <input type="text"
                       class="answer-input"
                       id="writing-answer"
                       placeholder="${isGerman ? 'ترجمه آلمانی را تایپ کنید...' : 'Type English translation...'}"
                       autocomplete="off">
                <div class="action-buttons">
                    <button class="btn btn-success" id="check-writing-answer-btn">
                        <i class="fas fa-check"></i> ${LanguageSystem.t('practice.check')}
                    </button>
                    <button class="btn btn-outline" id="show-hint-btn">
                        <i class="fas fa-lightbulb"></i> ${LanguageSystem.t('practice.hint')}
                    </button>
                </div>
                <div class="progress-dots">
                    ${this.writingSession.words.map((_, index) => {
                        let dotClass = '';
                        if (index === this.writingSession.currentIndex) dotClass = 'active';
                        else if (index < this.writingSession.currentIndex) {
                            dotClass = this.writingSession.words[index].userCorrect ? 'completed correct' : 'completed incorrect';
                        }
                        return `<div class="progress-dot ${dotClass}"></div>`;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    this.setupWritingExerciseEventListeners(word);
}

setupWritingExerciseEventListeners(word) {
    const checkBtn = document.getElementById('check-writing-answer-btn');
    const hintBtn = document.getElementById('show-hint-btn');
    const answerInput = document.getElementById('writing-answer');
    if (checkBtn) checkBtn.addEventListener('click', () => this.checkWritingAnswer());
    if (hintBtn) hintBtn.addEventListener('click', () => this.showToast(`💡 راهنما: ${word.german.substring(0, 2)}...`, 'info'));
    if (answerInput) {
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this.checkWritingAnswer(); }
        });
        setTimeout(() => answerInput.focus(), 300);
    }
}

async checkWritingAnswer() {
    const userAnswer = document.getElementById('writing-answer').value.trim();
    const currentWord = this.writingSession.words[this.writingSession.currentIndex];
    if (!userAnswer) { this.showToast('✏️ لطفاً پاسخ را وارد کنید', 'warning'); return; }
    const normalizedUser = this.normalizeAnswer(userAnswer);
    const normalizedCorrect = this.normalizeAnswer(currentWord.german);
    const isCorrect = normalizedUser === normalizedCorrect;
    await this.recordPractice(currentWord.id, isCorrect);
    this.writingSession.words[this.writingSession.currentIndex].userCorrect = isCorrect;
    const answerInput = document.getElementById('writing-answer');
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'feedback-message';
    if (isCorrect) {
        this.writingSession.score++;
        this.showToast('✅ آفرین! ترجمه صحیح است', 'success');
        answerInput.style.borderColor = 'var(--success)';
        answerInput.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        feedbackDiv.className = 'feedback-message feedback-correct';
        feedbackDiv.innerHTML = `<i class="fas fa-check-circle"></i> پاسخ صحیح! آفرین!`;
        answerInput.disabled = true;
        document.getElementById('check-writing-answer-btn').disabled = true;
    } else {
        this.showToast(`❌ پاسخ صحیح: ${currentWord.german}`, 'error');
        answerInput.style.borderColor = 'var(--danger)';
        answerInput.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        feedbackDiv.className = 'feedback-message feedback-incorrect';
        feedbackDiv.innerHTML = `<i class="fas fa-times-circle"></i> پاسخ صحیح: <strong>${currentWord.german}</strong>`;
        answerInput.disabled = true;
        document.getElementById('check-writing-answer-btn').disabled = true;
    }
    const oldFeedback = document.querySelector('.feedback-message');
    if (oldFeedback) oldFeedback.remove();
    answerInput.parentNode.appendChild(feedbackDiv);
    setTimeout(() => {
        this.writingSession.currentIndex++;
        this.showWritingExercise();
    }, 2000);
}

showWritingResults() {
    const accuracy = Math.round((this.writingSession.score / this.writingSession.words.length) * 100);
    const isGerman = LanguageSystem.isGerman();
    document.getElementById('practice-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-chart-line"></i> ${isGerman ? 'نتایج تمرین نوشتاری' : 'Writing Practice Results'}</h2>
            </div>
            <div class="results-summary">
                <div class="result-circle" style="background: conic-gradient(var(--success) 0% ${accuracy}%, var(--gray-200) ${accuracy}% 100%);">
                    <div class="result-circle-inner"><span>${accuracy}%</span></div>
                </div>
                <div class="results-stats">
                    <div class="result-stat">
                        <span>${isGerman ? 'تعداد لغات:' : 'Total Words:'}</span>
                        <strong>${this.writingSession.words.length}</strong>
                    </div>
                    <div class="result-stat">
                        <span>${isGerman ? 'پاسخ صحیح:' : 'Correct Answers:'}</span>
                        <strong>${this.writingSession.score}</strong>
                    </div>
                </div>
            </div>
            <div class="action-buttons">
                <button class="btn btn-primary" id="restart-writing-btn">
                    <i class="fas fa-redo-alt"></i> ${isGerman ? 'تمرین مجدد' : 'Practice Again'}
                </button>
                <button class="btn btn-outline" id="back-to-practice-menu-btn">
                    <i class="fas fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}
                </button>
            </div>
        </div>
    `;
    document.getElementById('restart-writing-btn').addEventListener('click', () => this.startWritingPractice());
    document.getElementById('back-to-practice-menu-btn').addEventListener('click', () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    });
}

// ═══════════════════════════════════════════════════════════════
// SPEAKING PRACTICE — نسخه پیشرفته کامل
// شامل: SRS، تحلیل گرامری، امتیازدهی هوشمند، Levenshtein،
//        XP/Level/Streak، Achievement، Adaptive Difficulty،
//        آمار پیشرفته، نمودار Chart.js
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────
// ابزارهای کمکی
// ───────────────────────────────────────────────

/** فاصله Levenshtein برای تشخیص غلط‌های تایپی */
_levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
    );
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i-1] === b[j-1]
                ? dp[i-1][j-1]
                : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[m][n];
}

/** امتیاز شباهت ۰–۱۰۰ بین دو رشته */
_similarityScore(user, correct) {
    const u = user.toLowerCase().trim();
    const c = correct.toLowerCase().trim();
    if (u === c) return 100;
    const dist = this._levenshtein(u, c);
    const maxLen = Math.max(u.length, c.length);
    return Math.max(0, Math.round((1 - dist / maxLen) * 100));
}

/** SRS: محاسبه بازه بعدی مرور با SM-2 ساده‌شده */
_srsNextReview(word, score) {
    const easeFactor   = word.easeFactor   || 2.5;
    const reviewInterval = word.reviewInterval || 1;
    const boxLevel     = word.boxLevel     || 0;

    let newEase = easeFactor, newInterval, newBox;

    if (score >= 90) {
        newEase     = Math.min(easeFactor + 0.15, 3.0);
        newInterval = Math.round(reviewInterval * newEase);
        newBox      = Math.min(boxLevel + 1, 5);
    } else if (score >= 70) {
        newEase     = easeFactor;
        newInterval = Math.max(reviewInterval, 1);
        newBox      = boxLevel;
    } else {
        newEase     = Math.max(easeFactor - 0.2, 1.3);
        newInterval = 1;
        newBox      = Math.max(boxLevel - 1, 0);
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    return {
        easeFactor:     newEase,
        reviewInterval: newInterval,
        boxLevel:       newBox,
        nextReviewDate: nextDate.toISOString().split('T')[0]
    };
}

// ───────────────────────────────────────────────
// سیستم XP / Level / Streak / Coins
// ───────────────────────────────────────────────

_getXPData() {
    return JSON.parse(localStorage.getItem('xpData') || JSON.stringify({
        xp: 0, level: 1, streak: 0, coins: 0,
        lastPracticeDate: null, totalCorrect: 0, totalAnswered: 0
    }));
}

_saveXPData(data) {
    localStorage.setItem('xpData', JSON.stringify(data));
}

_addXP(score, isCorrect) {
    const data = this._getXPData();
    const today = new Date().toISOString().split('T')[0];

    // Streak
    if (data.lastPracticeDate === today) {
        // همان روز
    } else if (data.lastPracticeDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
        data.streak++;
    } else {
        data.streak = 1;
    }
    data.lastPracticeDate = today;

    // XP بر اساس امتیاز
    let earned = 0;
    if (score >= 90)      earned = 10;
    else if (score >= 70) earned = 6;
    else if (score >= 50) earned = 3;
    else                  earned = 1;

    // streak bonus
    if (data.streak >= 7)  earned = Math.round(earned * 1.5);
    if (data.streak >= 30) earned = Math.round(earned * 2.0);

    data.xp += earned;
    data.coins += isCorrect ? 2 : 0;
    data.totalAnswered++;
    if (isCorrect) data.totalCorrect++;

    // Level up (هر ۱۰۰ XP)
    const newLevel = Math.floor(data.xp / 100) + 1;
    const leveledUp = newLevel > data.level;
    data.level = newLevel;

    this._saveXPData(data);
    this._checkAchievements(data);
    return { earned, leveledUp, data };
}

// ───────────────────────────────────────────────
// سیستم Achievement
// ───────────────────────────────────────────────

_getAchievements() {
    return JSON.parse(localStorage.getItem('achievements') || '[]');
}

_checkAchievements(xpData) {
    const done = new Set(this._getAchievements());
    const newOnes = [];

    const checks = [
        { id: 'first_correct',     label: '🎯 اولین پاسخ صحیح!',   cond: xpData.totalCorrect >= 1    },
        { id: '10_correct',        label: '⭐ ۱۰ پاسخ صحیح',       cond: xpData.totalCorrect >= 10   },
        { id: '100_correct',       label: '🏅 ۱۰۰ پاسخ صحیح',      cond: xpData.totalCorrect >= 100  },
        { id: '3_day_streak',      label: '🔥 ۳ روز متوالی',        cond: xpData.streak >= 3          },
        { id: '7_day_streak',      label: '🔥 ۷ روز متوالی',        cond: xpData.streak >= 7          },
        { id: '30_day_streak',     label: '🔥 ۳۰ روز متوالی',       cond: xpData.streak >= 30         },
        { id: 'level_5',           label: '🚀 رسیدن به سطح ۵',      cond: xpData.level >= 5           },
        { id: 'level_10',          label: '💎 رسیدن به سطح ۱۰',     cond: xpData.level >= 10          },
        { id: '100_words_mastered',label: '📚 ۱۰۰ لغت تمرین‌شده',   cond: xpData.totalAnswered >= 100 },
    ];

    checks.forEach(c => {
        if (c.cond && !done.has(c.id)) {
            done.add(c.id);
            newOnes.push(c);
        }
    });

    if (newOnes.length > 0) {
        localStorage.setItem('achievements', JSON.stringify([...done]));
        newOnes.forEach(a => this._showAchievementToast(a.label));
    }
}

_showAchievementToast(label) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
        background:linear-gradient(135deg,#f59e0b,#d97706);
        color:white;padding:12px 24px;border-radius:40px;
        font-weight:700;font-size:15px;z-index:99999;
        box-shadow:0 8px 24px rgba(0,0,0,0.3);
        animation:slideUp 0.4s ease;
    `;
    toast.textContent = `🏆 دستاورد جدید: ${label}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ───────────────────────────────────────────────
// Adaptive Difficulty
// ───────────────────────────────────────────────

_adaptiveDifficulty() {
    const xpData = this._getXPData();
    if (xpData.totalAnswered < 5) return;
    const accuracy = xpData.totalAnswered > 0
        ? (xpData.totalCorrect / xpData.totalAnswered) * 100 : 50;

    const cur = this.speakingSession.difficulty;
    if (accuracy > 90 && cur !== 'hard') {
        this.speakingSession.difficulty = cur === 'easy' ? 'medium' : 'hard';
        localStorage.setItem('speakingDifficulty', this.speakingSession.difficulty);
        this.showToast(`📈 سختی افزایش یافت: ${this.speakingSession.difficulty === 'medium' ? 'متوسط' : 'سخت'}`, 'info');
    } else if (accuracy < 40 && cur !== 'easy') {
        this.speakingSession.difficulty = cur === 'hard' ? 'medium' : 'easy';
        localStorage.setItem('speakingDifficulty', this.speakingSession.difficulty);
        this.showToast(`📉 سختی کاهش یافت: ${this.speakingSession.difficulty === 'medium' ? 'متوسط' : 'آسان'}`, 'info');
    }
}

// ───────────────────────────────────────────────
// آمار پیشرفته
// ───────────────────────────────────────────────

_recordStats(wordId, score, isCorrect) {
    const stats = JSON.parse(localStorage.getItem('practiceStats') || '{}');
    const today = new Date().toISOString().split('T')[0];

    if (!stats.daily)   stats.daily   = {};
    if (!stats.monthly) stats.monthly = {};
    if (!stats.words)   stats.words   = {};

    if (!stats.daily[today]) stats.daily[today] = { correct: 0, total: 0, xp: 0 };
    stats.daily[today].total++;
    if (isCorrect) stats.daily[today].correct++;

    const month = today.slice(0, 7);
    if (!stats.monthly[month]) stats.monthly[month] = { correct: 0, total: 0 };
    stats.monthly[month].total++;
    if (isCorrect) stats.monthly[month].correct++;

    if (!stats.words[wordId]) stats.words[wordId] = { correct: 0, total: 0, avgScore: 0 };
    stats.words[wordId].total++;
    if (isCorrect) stats.words[wordId].correct++;
    stats.words[wordId].avgScore = Math.round(
        (stats.words[wordId].avgScore * (stats.words[wordId].total - 1) + score)
        / stats.words[wordId].total
    );

    localStorage.setItem('practiceStats', JSON.stringify(stats));
}

_getWeakAndStrongWords(allWords) {
    const stats = JSON.parse(localStorage.getItem('practiceStats') || '{}');
    const wordStats = stats.words || {};

    const scored = allWords
        .filter(w => wordStats[w.id] && wordStats[w.id].total >= 2)
        .map(w => ({
            ...w,
            accuracy: Math.round((wordStats[w.id].correct / wordStats[w.id].total) * 100)
        }));

    return {
        weak:   scored.filter(w => w.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy).slice(0, 10),
        strong: scored.filter(w => w.accuracy >= 80).sort((a, b) => b.accuracy - a.accuracy).slice(0, 10)
    };
}

// ───────────────────────────────────────────────
// نمودارها با Chart.js
// ───────────────────────────────────────────────

async _showStatsModal() {
    if (!window.Chart) {
        await new Promise(resolve => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            s.onload = resolve;
            document.head.appendChild(s);
        });
    }

    const stats   = JSON.parse(localStorage.getItem('practiceStats') || '{}');
    const xpData  = this._getXPData();
    const daily   = stats.daily   || {};
    const monthly = stats.monthly || {};

    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });
    const labels7   = last7.map(d => d.slice(5));
    const accuracy7 = last7.map(d => {
        const day = daily[d];
        return day && day.total > 0 ? Math.round((day.correct / day.total) * 100) : 0;
    });
    const xp7 = last7.map(d => daily[d]?.xp || 0);

    const last6m = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
        return d.toISOString().slice(0, 7);
    });
    const labels6m   = last6m;
    const accuracy6m = last6m.map(m => {
        const mon = monthly[m];
        return mon && mon.total > 0 ? Math.round((mon.correct / mon.total) * 100) : 0;
    });

    const achievements = this._getAchievements();

    let modalEl = document.getElementById('stats-modal');
    if (modalEl) modalEl.remove();

    document.body.insertAdjacentHTML('beforeend', `
        <div id="stats-modal" style="
            position:fixed;inset:0;background:rgba(0,0,0,0.6);
            z-index:100010;display:flex;align-items:center;justify-content:center;
        ">
            <div style="
                background:var(--bg-card,#fff);border-radius:24px;
                width:min(720px,95vw);max-height:90vh;overflow-y:auto;
                box-shadow:0 20px 60px rgba(0,0,0,0.4);
            ">
                <div style="
                    background:linear-gradient(135deg,#8b5cf6,#6d28d9);
                    padding:18px 22px;border-radius:24px 24px 0 0;
                    display:flex;justify-content:space-between;align-items:center;
                ">
                    <h3 style="margin:0;color:white;font-size:18px;">
                        <i class="fas fa-chart-line"></i> آمار پیشرفته
                    </h3>
                    <button id="close-stats-modal" style="
                        background:rgba(255,255,255,0.2);border:none;
                        width:32px;height:32px;border-radius:50%;
                        color:white;font-size:20px;cursor:pointer;
                    ">&times;</button>
                </div>

                <div style="padding:20px;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:20px;">
                        ${[
                            { icon:'⭐', label:'XP کل',     val: xpData.xp    },
                            { icon:'🎯', label:'سطح',       val: xpData.level },
                            { icon:'🔥', label:'Streak',    val: xpData.streak + ' روز' },
                            { icon:'🪙', label:'Coins',     val: xpData.coins },
                            { icon:'✅', label:'صحیح کل',  val: xpData.totalCorrect },
                            { icon:'📊', label:'دقت کل',   val: xpData.totalAnswered > 0 ? Math.round(xpData.totalCorrect/xpData.totalAnswered*100)+'%' : '—' }
                        ].map(c => `
                            <div style="
                                background:linear-gradient(135deg,#f3e8ff,#e9d5ff);
                                border-radius:16px;padding:14px;text-align:center;
                            ">
                                <div style="font-size:22px;margin-bottom:4px;">${c.icon}</div>
                                <div style="font-size:11px;color:#6b21a5;margin-bottom:2px;">${c.label}</div>
                                <div style="font-size:20px;font-weight:800;color:#4c1d95;">${c.val}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div style="background:var(--bg-secondary,#f8fafc);border-radius:16px;padding:16px;margin-bottom:16px;">
                        <div style="font-size:13px;font-weight:700;color:var(--text-primary,#1f2937);margin-bottom:12px;">
                            📈 دقت ۷ روز اخیر
                        </div>
                        <canvas id="chart-accuracy-7" height="140"></canvas>
                    </div>

                    <div style="background:var(--bg-secondary,#f8fafc);border-radius:16px;padding:16px;margin-bottom:16px;">
                        <div style="font-size:13px;font-weight:700;color:var(--text-primary,#1f2937);margin-bottom:12px;">
                            📅 دقت ۶ ماه اخیر
                        </div>
                        <canvas id="chart-accuracy-6m" height="140"></canvas>
                    </div>

                    <div style="background:var(--bg-secondary,#f8fafc);border-radius:16px;padding:16px;">
                        <div style="font-size:13px;font-weight:700;color:var(--text-primary,#1f2937);margin-bottom:10px;">
                            🏆 دستاوردها (${achievements.length})
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;">
                            ${[
                                { id:'first_correct',      label:'🎯 اولین پاسخ'     },
                                { id:'10_correct',         label:'⭐ ۱۰ پاسخ'        },
                                { id:'100_correct',        label:'🏅 ۱۰۰ پاسخ'       },
                                { id:'3_day_streak',       label:'🔥 ۳ روز'          },
                                { id:'7_day_streak',       label:'🔥 ۷ روز'          },
                                { id:'30_day_streak',      label:'🔥 ۳۰ روز'         },
                                { id:'level_5',            label:'🚀 سطح ۵'          },
                                { id:'level_10',           label:'💎 سطح ۱۰'         },
                                { id:'100_words_mastered', label:'📚 ۱۰۰ لغت'        },
                            ].map(a => {
                                const earned = achievements.includes(a.id);
                                return `
                                    <div style="
                                        padding:6px 12px;border-radius:30px;font-size:12px;
                                        background:${earned ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'var(--gray-200,#e5e7eb)'};
                                        color:${earned ? 'white' : 'var(--gray-400,#9ca3af)'};
                                        font-weight:${earned ? '700' : '400'};
                                        opacity:${earned ? '1' : '0.5'};
                                    ">${a.label}</div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);

    document.getElementById('close-stats-modal').onclick = () =>
        document.getElementById('stats-modal')?.remove();

    new window.Chart(document.getElementById('chart-accuracy-7'), {
        type: 'bar',
        data: {
            labels: labels7,
            datasets: [{
                label: 'دقت %',
                data: accuracy7,
                backgroundColor: accuracy7.map(v => v >= 70 ? '#8b5cf6' : '#f59e0b'),
                borderRadius: 8
            }]
        },
        options: {
            responsive: true, plugins: { legend: { display: false } },
            scales: { y: { min: 0, max: 100, ticks: { callback: v => v + '%' } } }
        }
    });

    new window.Chart(document.getElementById('chart-accuracy-6m'), {
        type: 'line',
        data: {
            labels: labels6m,
            datasets: [{
                label: 'دقت ماهانه %',
                data: accuracy6m,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139,92,246,0.15)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6d28d9',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true, plugins: { legend: { display: false } },
            scales: { y: { min: 0, max: 100, ticks: { callback: v => v + '%' } } }
        }
    });
}

// ═══════════════════════════════════════════════
// تابع اصلی: generateAIQuestion
// ═══════════════════════════════════════════════
async generateAIQuestion(word) {
    const loadingDiv = document.getElementById('question-loading');
    const displayDiv = document.getElementById('question-display');
    const checkBtn = document.getElementById('check-speaking-answer');
    const answerInput = document.getElementById('speaking-answer-input');

    if (loadingDiv) {
        loadingDiv.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; gap: 10px; padding: 15px;">
                <div style="width: 22px; height: 22px; border: 2px solid #cbd5e1; border-top-color: #8b5cf6; border-radius: 50%; animation: spin 0.6s linear infinite;"></div>
                <span style="color: #64748b; font-size: 13px;">در حال ساخت سوال...</span>
            </div>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        `;
        loadingDiv.style.display = 'flex';
    }
    if (displayDiv) displayDiv.style.display = 'none';
    if (checkBtn) checkBtn.disabled = true;
    if (answerInput) answerInput.disabled = true;

    this._adaptiveDifficulty();

    const { mode, level, difficulty } = this.speakingSession;
    const wordText = word.german;
    const wordMeaning = word.persian;
    const wordType = word.type || 'unknown';

    const levelDesc = {
        A1: `سطح A1 مبتدی مطلق:
- جملات خیلی کوتاه (حداکثر ۵ کلمه)
- فقط زمان حال ساده (Präsens)
- ضمایر: ich, du, er/sie
- کلمات کاملاً رایج روزمره`,
        A2: `سطح A2 مبتدی:
- جملات ساده تا متوسط (۵-۸ کلمه)
- زمان حال و گذشته نقلی (Perfekt)
- حروف ربط ساده: und, aber, oder, weil
- صفات ساده`,
        B1: `سطح B1 متوسط:
- جملات مرکب (۸-۱۲ کلمه)
- زمان‌های Präteritum, Perfekt, Futur I
- جملات شرطی با wenn/falls
- حروف ربط: weil, obwohl, damit, bevor, nachdem`,
        B2: `سطح B2 فوق‌متوسط:
- جملات پیچیده و بلند (۱۲+ کلمه)
- Konjunktiv II (würde, hätte, wäre)
- جملات پیرو پیچیده با dass/ob/weil/obwohl/sodass
- حالت معلوم (Passiv)`
    };

    const diffDesc = {
        easy: `سختی آسان:
- جای خالی برای اسم رایج یا صفت ساده
- پاسخ از نظر دستوری ساده`,
        medium: `سختی متوسط:
- جای خالی برای فعل کمکی، قید، یا حرف اضافه
- ممکن است نیاز به تغییر فرم کلمه باشد`,
        hard: `سختی سخت:
- جای خالی برای فرم صرف‌شده پیچیده (Konjunktiv, Passiv, Partizip)
- یا برای کلمه ربطی که ترتیب جمله را تغییر می‌دهد`
    };

    let systemPrompt, userPrompt;

    if (mode === 'fill_blank') {
        systemPrompt = `تو معلم متخصص زبان آلمانی هستی که برای زبان‌آموزان ایرانی تمرین می‌سازی.

قوانین بسیار مهم:
1. جمله‌ای بساز که حتماً کلمه هدف "${wordText}" در آن وجود داشته باشد (نه در جای خالی)
2. جای خالی (______) برای یک کلمه کاملاً متفاوت از جمله باشد
3. کلمه جای خالی نباید کلمه هدف یا مشتقاتش باشد
4. جمله باید صد درصد صحیح دستوری باشد
5. سختی جای خالی باید مطابق دستورالعمل باشد
6. لغات جدید را (جز کلمه هدف) با معنی فارسی لیست کن
7. ONLY return valid JSON, no extra text`;

        userPrompt = `کلمه هدف: "${wordText}" (${wordMeaning}) — نوع: ${wordType}

${levelDesc[level]}

${diffDesc[difficulty]}

حالا یک تمرین جای خالی بساز. فقط JSON:
{
  "sentence": "جمله آلمانی با ${wordText} در آن و ______ برای کلمه دیگر",
  "correctAnswer": "کلمه‌ای که باید در جای خالی برود",
  "translation": "ترجمه فارسی کامل جمله",
  "newWords": [
    {"word": "کلمه آلمانی", "meaning": "معنی فارسی"}
  ],
  "hint": {
    "grammar_note": "توضیح دستوری درباره جای خالی",
    "key_point": "چطور پاسخ را پیدا کنیم",
    "pattern": "الگوی ساختاری جمله"
  }
}`;

    } else {
        systemPrompt = `تو معلم متخصص زبان آلمانی هستی که برای زبان‌آموزان ایرانی تمرین ترجمه می‌سازی.
قوانین:
1. جمله فارسی طبیعی و روان بساز
2. ترجمه آلمانی حتماً شامل "${wordText}" باشد
3. سطح و سختی را رعایت کن
4. ONLY return valid JSON`;

        userPrompt = `کلمه هدف: "${wordText}" (${wordMeaning}) — نوع: ${wordType}

${levelDesc[level]}
${diffDesc[difficulty]}

فقط JSON:
{
  "persianSentence": "جمله فارسی برای ترجمه",
  "correctAnswer": "ترجمه آلمانی صحیح (شامل ${wordText})",
  "newWords": [
    {"word": "کلمه آلمانی", "meaning": "معنی فارسی"}
  ],
  "hint": {
    "grammar_note": "توضیح دستوری کلیدی",
    "key_point": "نکته مهم برای ترجمه صحیح",
    "pattern": "الگوی ساختاری جمله آلمانی"
  }
}`;
    }

    try {
        const response = await this._puterChat(userPrompt, { systemPrompt });
        let rawText = '';
        if (response?.message?.content?.[0]?.text) rawText = response.message.content[0].text;
        else if (typeof response === 'string') rawText = response;

        let parsed;
        try {
            const clean = rawText.replace(/```json|```/g, '').trim();
            const m = clean.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(m ? m[0] : clean);
        } catch {
            parsed = this._fallbackQuestion(mode, wordText, wordMeaning);
        }

        this.speakingSession.currentQuestion = parsed;
        
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (displayDiv) {
            displayDiv.style.display = 'block';
            if (mode === 'fill_blank') {
                // هایلایت کلمه هدف به بنفش
                let sentenceText = parsed.sentence || '';
                const regex = new RegExp(`(?<![\\w])(${wordText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![\\w])`, 'gi');
                const highlightedSentence = sentenceText.replace(regex, '<span style="background:#e9d5ff;padding:2px 8px;border-radius:8px;font-weight:700;color:#6d28d9;">$1</span>');
                const finalHtml = highlightedSentence.replace(/______/g, '<span style="background:#fef3c7;padding:4px 16px;border-radius:30px;font-weight:800;color:#d97706;display:inline-block;">______</span>');
                
                displayDiv.innerHTML = `
                    <div style="font-size:18px;font-weight:600;direction:ltr;text-align:center;line-height:1.8;margin-bottom:12px;color:#1f2937;">${finalHtml}</div>
                    <div style="font-size:13px;color:#047857;background:rgba(16,185,129,0.1);padding:8px;border-radius:12px;">
                        <i class="fas fa-language"></i> ${parsed.translation || ''}
                    </div>
                `;
            } else {
                displayDiv.innerHTML = `
                    <div style="font-size:20px;font-weight:700;color:#1f2937;text-align:center;margin-bottom:12px;">📖 ${parsed.persianSentence || ''}</div>
                    <div style="font-size:12px;color:#8b5cf6;background:rgba(139,92,246,0.1);padding:6px 14px;border-radius:30px;display:inline-block;">
                        <i class="fas fa-arrow-left"></i> ترجمه به آلمانی
                    </div>
                `;
            }
        }
        if (checkBtn) checkBtn.disabled = false;
        if (answerInput) {
            answerInput.disabled = false;
            answerInput.value = '';
            answerInput.focus();
        }

    } catch (err) {
        console.error('generateAIQuestion:', err);
        const fb = this._fallbackQuestion(mode, wordText, wordMeaning);
        this.speakingSession.currentQuestion = fb;
        
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (displayDiv) {
            displayDiv.style.display = 'block';
            if (mode === 'fill_blank') {
                // هایلایت کلمه هدف در fallback هم بنفش
                let sentenceText = fb.sentence || '';
                const regex = new RegExp(`(?<![\\w])(${wordText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![\\w])`, 'gi');
                const highlightedSentence = sentenceText.replace(regex, '<span style="background:#e9d5ff;padding:2px 8px;border-radius:8px;font-weight:700;color:#6d28d9;">$1</span>');
                const finalHtml = highlightedSentence.replace(/______/g, '<span style="background:#fef3c7;padding:4px 16px;border-radius:30px;font-weight:800;color:#d97706;display:inline-block;">______</span>');
                
                displayDiv.innerHTML = `
                    <div style="font-size:18px;font-weight:600;direction:ltr;text-align:center;margin-bottom:12px;color:#1f2937;">${finalHtml}</div>
                    <div style="font-size:13px;color:#047857;background:rgba(16,185,129,0.1);padding:8px;border-radius:12px;">
                        <i class="fas fa-language"></i> ${fb.translation}
                    </div>
                `;
            } else {
                displayDiv.innerHTML = `
                    <div style="font-size:20px;font-weight:700;color:#1f2937;text-align:center;margin-bottom:12px;">📖 ${fb.persianSentence}</div>
                    <div style="font-size:12px;color:#8b5cf6;background:rgba(139,92,246,0.1);padding:6px 14px;border-radius:30px;display:inline-block;">
                        <i class="fas fa-arrow-left"></i> ترجمه به آلمانی
                    </div>
                `;
            }
        }
        if (checkBtn) checkBtn.disabled = false;
        if (answerInput) {
            answerInput.disabled = false;
            answerInput.value = '';
            answerInput.focus();
        }
    }
}
_fallbackQuestion(mode, wordText, wordMeaning) {
    return mode === 'fill_blank'
        ? {
            sentence: `Ich mag ${wordText} und ______ sehr.`,
            correctAnswer: 'Musik',
            translation: `من ${wordMeaning} و موزیک را خیلی دوست دارم.`,
            newWords: [{ word: 'mögen', meaning: 'دوست داشتن' }],
            hint: {
                grammar_note: 'فعل mögen با Akkusativ می‌آید',
                key_point: 'یک اسم در اینجا می‌آید',
                pattern: 'Ich mag + Akkusativ + und + Akkusativ'
            }
        }
        : {
            persianSentence: `من ${wordMeaning}.`,
            correctAnswer: `Ich ${wordText}.`,
            newWords: [],
            hint: {
                grammar_note: 'فعل در جایگاه دوم جمله می‌آید',
                key_point: `کلمه هدف: ${wordText}`,
                pattern: 'Subjekt + Verb'
            }
        };
}

_renderQuestion(parsed, mode, wordText) {
    const loadingDiv  = document.getElementById('question-loading');
    const displayDiv  = document.getElementById('question-display');
    const checkBtn    = document.getElementById('check-speaking-answer');
    const answerInput = document.getElementById('speaking-answer-input');

    if (loadingDiv) loadingDiv.style.display = 'none';
    if (!displayDiv) return;
    displayDiv.style.display = 'block';


if (mode === 'fill_blank') {
    const highlighted = (parsed.sentence || '')
        .replace(
            new RegExp(`(?<![\\w])(${wordText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![\\w])`, 'gi'),
            `<span style="background:#e9d5ff;padding:2px 8px;border-radius:8px;font-weight:700;color:#6d28d9;">${wordText}</span>`
        )
        .replace(
            /______/g,
            `<span style="background:#fef3c7;padding:4px 16px;border-radius:30px;font-weight:800;color:#d97706;display:inline-block;">______</span>`
        );

    displayDiv.innerHTML = `
        <div style="font-size:18px;font-weight:600;direction:ltr;text-align:center;line-height:2;margin-bottom:12px;color:#1f2937;background:transparent;">
            ${highlighted}
        </div>
        <div style="font-size:13px;color:#047857;background:rgba(16,185,129,0.12);padding:10px;border-radius:12px;">
            <i class="fas fa-language"></i>
            <span style="color:#374151;">${this.escapeHtml(parsed.translation || '')}</span>
        </div>
    `;
}

    if (checkBtn)    { checkBtn.disabled    = false; }
    if (answerInput) { answerInput.disabled = false; answerInput.value = ''; answerInput.focus(); }
}

// ═══════════════════════════════════════════════
// checkSpeakingAnswer — امتیازدهی هوشمند + تحلیل گرامری
// ═══════════════════════════════════════════════

async checkSpeakingAnswer() {
    if (this.speakingSession.isChecking) return;

    const userAnswer  = document.getElementById('speaking-answer-input')?.value.trim();
    const question    = this.speakingSession.currentQuestion;
    const currentWord = this.speakingSession.currentWord;
    const feedbackDiv = document.getElementById('speaking-feedback');
    const checkBtn    = document.getElementById('check-speaking-answer');
    const answerInput = document.getElementById('speaking-answer-input');
    const mode        = this.speakingSession.mode;

    if (!userAnswer) { this.showToast('✏️ لطفاً پاسخ را وارد کنید', 'warning'); return; }

    this.speakingSession.isChecking = true;
    if (checkBtn)    checkBtn.disabled    = true;
    if (answerInput) answerInput.disabled = true;

    document.getElementById('floating-hint-panel')?.remove();

    if (feedbackDiv) {
        feedbackDiv.innerHTML = `
            <div style="background:rgba(139,92,246,0.1);border-radius:16px;padding:15px;text-align:center;">
                <div style="width:24px;height:24px;border:3px solid #e2e8f0;border-top-color:#8b5cf6;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto;"></div>
                <div style="margin-top:8px;color:#6b7280;">🤖 در حال بررسی پاسخ...</div>
            </div>
        `;
    }

    const correctAnswer = question.correctAnswer || '';
    const simScore = this._similarityScore(userAnswer, correctAnswer);
    const isTypo   = simScore >= 85 && simScore < 100;
    const isExact  = simScore === 100;

    const checkPrompt = `بررسی پاسخ زبان‌آموز در تمرین آلمانی.

${mode === 'fill_blank'
    ? `جمله: ${question.sentence}\nپاسخ مرجع: ${correctAnswer}`
    : `جمله فارسی: ${question.persianSentence}\nترجمه مرجع: ${correctAnswer}`
}

پاسخ کاربر: "${userAnswer}"
شباهت محاسبه‌شده: ${simScore}%

معیارهای امتیازدهی:
- ۱۰۰: کاملاً صحیح
- ۸۵-۹۹: صحیح با غلط تایپی جزئی (قبول با تذکر)
- ۷۰-۸۴: تقریباً صحیح (غلط دستوری جزئی)
- ۵۰-۶۹: نیمه صحیح
- زیر ۵۰: نادرست

اگر خطای دستوری وجود دارد، آن را مشخص کن.

فقط JSON برگردان:
{
  "score": عدد_۰_تا_۱۰۰,
  "isCorrect": true_یا_false,
  "feedback": "بازخورد فارسی کوتاه",
  "grammarErrors": [
    {"word": "کلمه اشتباه", "issue": "توضیح مشکل", "fix": "فرم صحیح"}
  ]
}`;

    try {
        const response = await this._puterChat(checkPrompt, {});
        let rawText = '';
        if (response?.message?.content?.[0]?.text) rawText = response.message.content[0].text;
        else if (typeof response === 'string') rawText = response;

        let parsed;
        try {
            const clean = rawText.replace(/```json|```/g, '').trim();
            const m = clean.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(m ? m[0] : clean);
        } catch {
            parsed = {
                score: isExact ? 100 : isTypo ? 88 : simScore,
                isCorrect: simScore >= 85,
                feedback: simScore >= 85 ? '✅ پاسخ صحیح!' : `❌ پاسخ صحیح: ${correctAnswer}`,
                grammarErrors: []
            };
        }

        if (isTypo && !parsed.isCorrect && simScore >= 90) {
            parsed.isCorrect = true;
            parsed.score     = Math.max(parsed.score, 88);
            parsed.feedback  = `✅ قبول شد (غلط تایپی جزئی) — فرم صحیح: ${correctAnswer}`;
        }

        const score = parsed.score ?? (parsed.isCorrect ? 100 : 0);

        const srsData = this._srsNextReview(currentWord, score);
        Object.assign(currentWord, srsData);

        const xpResult = this._addXP(score, parsed.isCorrect);
        this._recordStats(currentWord.id, score, parsed.isCorrect);
        await this.recordPractice(currentWord.id, parsed.isCorrect);

        await this._handleSpeakingResult(parsed, correctAnswer, currentWord, score, xpResult);

    } catch (err) {
        console.error('checkSpeakingAnswer:', err);
        const fallbackCorrect = simScore >= 85;
        const fallbackScore   = simScore;
        const xpResult = this._addXP(fallbackScore, fallbackCorrect);
        this._recordStats(currentWord.id, fallbackScore, fallbackCorrect);
        await this.recordPractice(currentWord.id, fallbackCorrect);
        await this._handleSpeakingResult(
            { score: fallbackScore, isCorrect: fallbackCorrect,
              feedback: fallbackCorrect ? '✅ پاسخ صحیح!' : `❌ پاسخ صحیح: ${correctAnswer}`,
              grammarErrors: [] },
            correctAnswer, currentWord, fallbackScore, xpResult
        );
        this.speakingSession.isChecking = false;
    }
}
async _handleSpeakingResult(parsed, correctAnswer, currentWord, score, xpResult) {
    const feedbackDiv = document.getElementById('speaking-feedback');
    const answerInput = document.getElementById('speaking-answer-input');

    // اضافه کردن استایل دارک مود برای بخش feedback (فقط یکبار)
    if (!document.getElementById('speaking-feedback-dark-styles')) {
        const style = document.createElement('style');
        style.id = 'speaking-feedback-dark-styles';
        style.textContent = `
            /* دارک مود برای بخش بررسی پاسخ تمرین جمله‌سازی */
            .dark-mode #speaking-feedback > div {
                background: linear-gradient(135deg, #450a0a, #7f1d1d) !important;
                border-color: #ef4444 !important;
            }
            .dark-mode #speaking-feedback span[style*="color:#991b1b"],
            .dark-mode #speaking-feedback span[style*="color: #991b1b"] {
                color: #fca5a5 !important;
            }
            .dark-mode #speaking-feedback div[style*="color:#991b1b"] {
                color: #fecaca !important;
            }
            .dark-mode #speaking-feedback div[style*="background:rgba(239,68,68,0.08)"] {
                background: rgba(239, 68, 68, 0.2) !important;
            }
            .dark-mode #speaking-feedback div[style*="color:#ef4444"] {
                color: #f87171 !important;
            }
            .dark-mode #speaking-feedback span[style*="color:#ef4444"] {
                color: #fca5a5 !important;
            }
            .dark-mode #speaking-feedback span[style*="color:#10b981"] {
                color: #86efac !important;
            }
            .dark-mode #speaking-feedback div[style*="color:#9ca3af"] {
                color: #9ca3af !important;
            }
            .dark-mode #speaking-feedback div[style*="background:#fef3c7"] {
                background: #451a03 !important;
                border-color: #d97706 !important;
            }
            .dark-mode #speaking-feedback div[style*="color:#92400e"] {
                color: #fcd34d !important;
            }
            .dark-mode #speaking-feedback div[style*="color:#b45309"] {
                color: #fbbf24 !important;
            }
            .dark-mode #speaking-feedback div[style*="background:#e5e7eb"] {
                background: #374151 !important;
            }
            .dark-mode #speaking-feedback i.fa-times-circle {
                color: #f87171 !important;
            }
            .dark-mode #speaking-feedback i.fa-check-circle {
                color: #4ade80 !important;
            }
            .dark-mode #speaking-feedback i.fa-exclamation-triangle {
                color: #fbbf24 !important;
            }
            .dark-mode #speaking-feedback span[style*="background:linear-gradient(135deg,#f59e0b,#d97706)"] {
                background: linear-gradient(135deg, #d97706, #b45309) !important;
            }
            .dark-mode #speaking-feedback span[style*="background:#8b5cf6"] {
                background: #6d28d9 !important;
            }
            .dark-mode #speaking-feedback button[style*="background:#8b5cf6"] {
                background: #6d28d9 !important;
            }
            .dark-mode #speaking-feedback button[style*="background:#8b5cf6"]:hover {
                background: #5b21b6 !important;
            }
            .dark-mode #speaking-feedback div[style*="background:rgba(255,255,255,0.5)"] {
                background: rgba(0, 0, 0, 0.4) !important;
            }
            .dark-mode #speaking-feedback div[style*="background:rgba(255,255,255,0.5)"] span {
                color: #f1f5f9 !important;
            }
            .dark-mode #speaking-feedback span[style*="color:#6b7280"] {
                color: #94a3b8 !important;
            }
            /* حالت صحیح در دارک مود */
            .dark-mode #speaking-feedback div[style*="background:rgba(16,185,129,0.12)"] {
                background: rgba(16, 185, 129, 0.2) !important;
                border-color: #10b981 !important;
            }
            .dark-mode #speaking-feedback span[style*="color:#065f46"] {
                color: #86efac !important;
            }
            .dark-mode #speaking-feedback div[style*="color:#065f46"] {
                color: #bbf7d0 !important;
            }
            .dark-mode #speaking-feedback div[style*="background:rgba(5,150,105,0.08)"] {
                background: rgba(16, 185, 129, 0.15) !important;
            }
            .dark-mode #speaking-feedback button[style*="background:#10b981"] {
                background: #059669 !important;
            }
            .dark-mode #speaking-feedback button[style*="background:#10b981"]:hover {
                background: #047857 !important;
            }
        `;
        document.head.appendChild(style);
    }

    const goToNext = () => {
        if (this.speakingSession.timeoutId) clearTimeout(this.speakingSession.timeoutId);
        if (this._nextKeyHandler) document.removeEventListener('keydown', this._nextKeyHandler);
        this.speakingSession.currentIndex++;
        this.showSpeakingQuestion();
    };

    this._nextKeyHandler = (e) => {
        if (e.key === 'Enter') { 
            e.preventDefault(); 
            goToNext(); 
        }
    };

    const scoreColor = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
    const scoreBar = `
        <div style="margin:10px 0 4px;display:flex;align-items:center;gap:10px;">
            <div style="flex:1;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
                <div style="width:${score}%;height:100%;background:${scoreColor};transition:width 0.6s ease;border-radius:4px;"></div>
            </div>
            <span style="font-weight:800;color:${scoreColor};font-size:14px;min-width:40px;">${score}%</span>
        </div>
    `;

    const xpBadge = xpResult ? `
        <span style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;margin-right:8px;">+${xpResult.earned} XP</span>
        ${xpResult.leveledUp ? `<span style="background:#8b5cf6;color:white;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">Level Up! 🚀</span>` : ''}
    ` : '';

    let grammarHtml = '';
    if (parsed.grammarErrors && parsed.grammarErrors.length > 0) {
        grammarHtml = `
            <div style="margin-top:10px;background:rgba(239,68,68,0.08);border-radius:12px;padding:10px;">
                <div style="font-size:12px;font-weight:700;color:#ef4444;margin-bottom:6px;">
                    <i class="fas fa-exclamation-triangle"></i> خطاهای دستوری:
                </div>
                ${parsed.grammarErrors.map(e => `
                    <div style="font-size:12px;margin-bottom:5px;padding:6px 10px;background:rgba(255,255,255,0.5);border-radius:8px;">
                        <span style="color:#ef4444;font-weight:600;direction:ltr;">${this.escapeHtml(e.word)}</span>
                        <span style="color:#6b7280;"> → </span>
                        <span style="color:#10b981;font-weight:600;direction:ltr;">${this.escapeHtml(e.fix)}</span>
                        <div style="color:#9ca3af;font-size:11px;margin-top:2px;">${this.escapeHtml(e.issue)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (parsed.isCorrect) {
        this.speakingSession.score++;
        if (feedbackDiv) {
            feedbackDiv.innerHTML = `
                <div style="background:rgba(16,185,129,0.12);border-radius:16px;padding:16px;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                        <i class="fas fa-check-circle" style="color:#10b981;font-size:22px;"></i>
                        <span style="color:#065f46;font-weight:700;font-size:16px;">✅ پاسخ صحیح!</span>
                        ${xpBadge}
                    </div>
                    ${scoreBar}
                    <div style="color:#065f46;font-size:13px;line-height:1.6;margin-top:8px;text-align:right;">
                        ${this.escapeHtml(parsed.feedback || 'آفرین!')}
                    </div>
                    ${grammarHtml}
                    <div style="margin-top:15px;text-align:center;">
                        <button id="continue-to-next" class="btn btn-sm" style="padding:8px 22px;background:#10b981;color:white;border:none;border-radius:30px;cursor:pointer;font-size:13px;">
                            سوال بعدی (Enter) →
                        </button>
                    </div>
                </div>
            `;
            const continueBtn = document.getElementById('continue-to-next');
            if (continueBtn) continueBtn.onclick = goToNext;
        }
        document.addEventListener('keydown', this._nextKeyHandler);

    } else {
        if (answerInput) answerInput.style.borderColor = '#ef4444';
        if (feedbackDiv) {
            feedbackDiv.innerHTML = `
                <div style="background:rgba(239,68,68,0.12);border-radius:16px;padding:16px;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                        <i class="fas fa-times-circle" style="color:#ef4444;font-size:22px;"></i>
                        <span style="color:#991b1b;font-weight:700;font-size:16px;">❌ پاسخ نادرست</span>
                        ${xpBadge}
                    </div>
                    ${scoreBar}
                    <div style="color:#991b1b;font-size:13px;line-height:1.6;margin-top:8px;text-align:right;">
                        ${this.escapeHtml(parsed.feedback || '')}
                    </div>
                    ${grammarHtml}
                    <div style="background:#fef3c7;border-radius:12px;padding:10px;margin-top:10px;">
                        <div style="font-weight:700;color:#92400e;font-size:12px;margin-bottom:4px;">✅ پاسخ صحیح:</div>
                        <div style="font-size:15px;font-weight:600;color:#b45309;direction:ltr;text-align:left;">
                            ${this.escapeHtml(correctAnswer)}
                        </div>
                    </div>
                    <div style="margin-top:15px;text-align:center;">
                        <button id="continue-to-next" class="btn btn-sm" style="padding:8px 22px;background:#8b5cf6;color:white;border:none;border-radius:30px;cursor:pointer;font-size:13px;">
                            سوال بعدی (Enter) →
                        </button>
                    </div>
                </div>
            `;
            const continueBtn = document.getElementById('continue-to-next');
            if (continueBtn) continueBtn.onclick = goToNext;
        }
        document.addEventListener('keydown', this._nextKeyHandler);
    }
}
// ═══════════════════════════════════════════════
// showSpeakingHint — راهنمایی با لغات جدید
// ═══════════════════════════════════════════════

showSpeakingHint() {
    const question    = this.speakingSession.currentQuestion;
    const currentWord = this.speakingSession.currentWord;

    const existing = document.getElementById('floating-hint-panel');
    if (existing) { existing.remove(); return; }

    const hint     = question?.hint;
    const newWords = question?.newWords || [];

    let hintRows = [];
    if (hint && typeof hint === 'object') {
        if (hint.grammar_note) hintRows.push({ icon: '📚', label: 'نکته دستوری',   value: hint.grammar_note });
        if (hint.key_point)    hintRows.push({ icon: '🔑', label: 'نکته کلیدی',    value: hint.key_point    });
        if (hint.pattern)      hintRows.push({ icon: '🧩', label: 'الگوی ساختاری', value: hint.pattern      });
    } else if (typeof hint === 'string') {
        hint.split('\n').filter(l => l.trim()).forEach(line =>
            hintRows.push({ icon: '💡', label: '', value: line.replace(/^[•\-\d.]+\s*/, '') })
        );
    }
    if (hintRows.length === 0)
        hintRows.push({ icon: '💡', label: 'راهنمایی', value: `کلمه "${currentWord.german}" را در جمله پیدا کن` });

    const hintRowsHtml = hintRows.map(row => `
        <div style="background:rgba(255,255,255,0.07);border-radius:12px;padding:10px 12px;margin-bottom:8px;border-right:3px solid #f59e0b;">
            <div style="font-size:11px;color:#fbbf24;font-weight:700;margin-bottom:4px;">
                ${row.icon}${row.label ? ' ' + row.label + ':' : ''}
            </div>
            <div style="font-size:13px;color:#e2e8f0;line-height:1.6;direction:auto;">
                ${this.escapeHtml(row.value)}
            </div>
        </div>
    `).join('');

    let newWordsSectionHtml = '';
    if (newWords.length > 0) {
        newWordsSectionHtml = `
            <div style="border-top:1px solid rgba(255,255,255,0.08);margin-top:4px;padding-top:12px;margin-bottom:4px;">
                <div style="font-size:11px;color:#34d399;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
                    <i class="fas fa-book-open" style="font-size:11px;"></i> لغات جدید جمله:
                </div>
                ${newWords.map(w => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;margin-bottom:5px;background:rgba(255,255,255,0.05);border-radius:10px;border-right:3px solid #34d399;">
                        <span style="font-size:13px;font-weight:700;color:#6ee7b7;direction:ltr;">${this.escapeHtml(w.word)}</span>
                        <span style="font-size:12px;color:#a7f3d0;">${this.escapeHtml(w.meaning)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    const hintPanel = document.createElement('div');
    hintPanel.id = 'floating-hint-panel';
    hintPanel.style.cssText = `
        position:fixed;top:80px;right:20px;
        max-width:340px;min-width:270px;
        background:linear-gradient(160deg,#1e293b,#0f172a);
        border-radius:20px;
        box-shadow:0 12px 32px rgba(0,0,0,0.4);
        z-index:10000;border-right:4px solid #f59e0b;
        direction:rtl;animation:slideInRight 0.25s ease;
    `;

    hintPanel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px 9px;border-bottom:1px solid rgba(255,255,255,0.08);">
            <div style="display:flex;align-items:center;gap:7px;">
                <i class="fas fa-lightbulb" style="color:#f59e0b;font-size:14px;"></i>
                <span style="font-weight:700;color:#fbbf24;font-size:13px;">راهنمایی</span>
            </div>
            <button id="close-hint-panel" style="background:rgba(255,255,255,0.1);border:none;width:25px;height:25px;border-radius:50%;color:#9ca3af;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;">&times;</button>
        </div>

        <div style="padding:11px 13px 4px;">
            ${hintRowsHtml}
            ${newWordsSectionHtml}
        </div>

        <div style="padding:8px 14px 12px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:#64748b;display:flex;align-items:center;gap:6px;">
            <i class="fas fa-keyboard" style="color:#475569;"></i>
            <span>پاسخ را تایپ کن و Enter بزن</span>
        </div>
    `;

    document.body.appendChild(hintPanel);
    document.getElementById('close-hint-panel').onclick = () => hintPanel.remove();

    setTimeout(() => {
        document.addEventListener('click', function closeHint(e) {
            if (!hintPanel.contains(e.target) && !e.target.closest('#hint-speaking-question')) {
                hintPanel.remove();
                document.removeEventListener('click', closeHint);
            }
        });
    }, 150);
}

// ═══════════════════════════════════════════════
// نتایج پایانی — با دکمه آمار
// ═══════════════════════════════════════════════

showSpeakingResults() {
    const total    = this.speakingSession.words.length;
    const score    = this.speakingSession.score;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    const modeName = this.speakingSession.mode === 'fill_blank' ? 'تکمیل جای خالی' : 'ترجمه جمله';
    const xpData   = this._getXPData();
    const isGood   = accuracy >= 70;

    const container = document.getElementById('practice-section');
    if (!container) return;

    container.innerHTML = `
        <div class="word-card" style="max-width:550px;margin:40px auto;padding:30px;">
            <div class="section-header" style="margin-bottom:22px;">
                <h2 style="font-size:21px;"><i class="fas fa-chart-line"></i> نتایج ${this.escapeHtml(modeName)}</h2>
            </div>

            <div style="text-align:center;">
                <div style="font-size:56px;margin-bottom:12px;">${isGood ? '🏆' : '📚'}</div>
                <div style="font-size:46px;font-weight:800;color:${isGood ? '#10b981' : '#8b5cf6'};margin-bottom:18px;">${accuracy}%</div>

                <div style="display:flex;justify-content:center;gap:24px;flex-wrap:wrap;margin-bottom:20px;">
                    ${[
                        { label:'کل',    val: total,         color:'var(--primary)' },
                        { label:'صحیح ✅', val: score,        color:'#10b981'        },
                        { label:'غلط ❌',  val: total - score, color:'#ef4444'        }
                    ].map(s => `
                        <div style="text-align:center;">
                            <div style="font-size:11px;color:var(--gray-500);margin-bottom:3px;">${s.label}</div>
                            <div style="font-size:30px;font-weight:800;color:${s.color};">${s.val}</div>
                        </div>
                    `).join('')}
                </div>

                <div style="background:linear-gradient(135deg,#f3e8ff,#e9d5ff);border-radius:16px;padding:14px;margin-bottom:20px;">
                    <div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;">
                        <div style="text-align:center;">
                            <div style="font-size:11px;color:#6b21a5;">⭐ XP کل</div>
                            <div style="font-size:22px;font-weight:800;color:#4c1d95;">${xpData.xp}</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-size:11px;color:#6b21a5;">🎯 سطح</div>
                            <div style="font-size:22px;font-weight:800;color:#4c1d95;">${xpData.level}</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-size:11px;color:#6b21a5;">🔥 Streak</div>
                            <div style="font-size:22px;font-weight:800;color:#4c1d95;">${xpData.streak} روز</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-size:11px;color:#6b21a5;">🪙 Coins</div>
                            <div style="font-size:22px;font-weight:800;color:#4c1d95;">${xpData.coins}</div>
                        </div>
                    </div>
                </div>

                <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                    <button id="restart-speaking-session" class="btn btn-primary" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:10px 20px;font-size:13px;">
                        <i class="fas fa-redo-alt"></i> تمرین مجدد
                    </button>
                    <button id="show-stats-btn" class="btn btn-outline" style="padding:10px 20px;font-size:13px;border-color:#8b5cf6;color:#8b5cf6;">
                        <i class="fas fa-chart-bar"></i> آمار کامل
                    </button>
                    <button id="back-speaking-menu" class="btn btn-outline" style="padding:10px 20px;font-size:13px;">
                        <i class="fas fa-arrow-right"></i> بازگشت
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('restart-speaking-session').onclick = () => this.startSpeakingPractice();
    document.getElementById('show-stats-btn').onclick           = () => this._showStatsModal();
    document.getElementById('back-speaking-menu').onclick       = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
}
// ================================================
// شروع تمرین جمله‌سازی هوشمند
// ================================================

async startSpeakingPractice() {
    console.log('🎤 شروع تمرین جمله‌سازی هوشمند...');
    
    const wordsToPractice = await this.getFilteredWordsForPractice();
    
    if (wordsToPractice.length === 0) {
        this.showToast('❌ هیچ لغتی برای تمرین وجود ندارد', 'error');
        return;
    }
    
    // دریافت تنظیمات ذخیره شده
    const savedLevel = localStorage.getItem('speakingLevel') || 'A2';
    const savedDifficulty = localStorage.getItem('speakingDifficulty') || 'medium';
    const savedShowMeaning = localStorage.getItem('speakingShowMeaning') !== 'false';
    const savedMode = localStorage.getItem('speakingMode') || 'fill_blank';
    
    this.speakingSession = {
        words: wordsToPractice,
        currentIndex: 0,
        score: 0,
        answers: [],
        level: savedLevel,
        difficulty: savedDifficulty,
        showMeaning: savedShowMeaning,
        mode: savedMode,
        currentWord: null,
        currentQuestion: null,
        isChecking: false,
        timeoutId: null
    };
    
    this.showSpeakingSettingsModal();
}

// ================================================
// نمایش مودال تنظیمات
// ================================================

showSpeakingSettingsModal() {
    let modal = document.getElementById('speaking-settings-modal');
    if (!modal) {
        const modalHTML = `
            <div id="speaking-settings-modal" class="modal-overlay" style="display: none; z-index: 100001;">
                <div class="modal-content" style="max-width: 600px; width: 90%; border-radius: 28px; overflow: hidden;">
                    <div class="modal-header" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); padding: 20px 25px;">
                        <h3 style="margin: 0; display: flex; align-items: center; gap: 10px; font-size: 20px;">
                            <i class="fas fa-comments"></i> تمرین جمله‌سازی هوشمند
                        </h3>
                        <button class="close-modal" id="close-speaking-settings" style="background: rgba(255,255,255,0.2); border: none; width: 36px; height: 36px; border-radius: 50%; color: white; font-size: 22px; cursor: pointer;">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 25px; max-height: 60vh; overflow-y: auto;">
                        <!-- نوع تمرین -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 10px; font-weight: 700; font-size: 15px;">
                                <i class="fas fa-cog"></i> نوع تمرین:
                            </label>
                            <div id="speaking-mode-buttons" style="display: flex; gap: 12px;">
                                <button id="mode-fill-blank" data-mode="fill_blank" style="flex: 1; padding: 12px; border-radius: 16px; border: 2px solid #e2e8f0; background: white; cursor: pointer; text-align: center;">
                                    <i class="fas fa-pen-fancy" style="font-size: 20px; display: block; margin-bottom: 6px;"></i>
                                    <span style="font-weight: 600; font-size: 13px;">تکمیل جای خالی</span>
                                </button>
                                <button id="mode-translate" data-mode="translate" style="flex: 1; padding: 12px; border-radius: 16px; border: 2px solid #e2e8f0; background: white; cursor: pointer; text-align: center;">
                                    <i class="fas fa-language" style="font-size: 20px; display: block; margin-bottom: 6px;"></i>
                                    <span style="font-weight: 600; font-size: 13px;">ترجمه جمله</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- سطح تمرین -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 10px; font-weight: 700; font-size: 15px;">
                                <i class="fas fa-chart-line"></i> سطح تمرین:
                            </label>
                            <div id="speaking-level-buttons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                                <button class="level-option" data-level="A1" style="padding: 8px 20px; border-radius: 40px; border: 2px solid #e2e8f0; background: white; cursor: pointer; font-weight: 600; font-size: 13px;">A1</button>
                                <button class="level-option" data-level="A2" style="padding: 8px 20px; border-radius: 40px; border: 2px solid #e2e8f0; background: white; cursor: pointer; font-weight: 600; font-size: 13px;">A2</button>
                                <button class="level-option" data-level="B1" style="padding: 8px 20px; border-radius: 40px; border: 2px solid #e2e8f0; background: white; cursor: pointer; font-weight: 600; font-size: 13px;">B1</button>
                                <button class="level-option" data-level="B2" style="padding: 8px 20px; border-radius: 40px; border: 2px solid #e2e8f0; background: white; cursor: pointer; font-weight: 600; font-size: 13px;">B2</button>
                            </div>
                        </div>
                        
                        <!-- میزان سختی -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 10px; font-weight: 700; font-size: 15px;">
                                <i class="fas fa-tachometer-alt"></i> میزان سختی:
                            </label>
                            <div id="speaking-difficulty-buttons" style="display: flex; gap: 8px;">
                                <button class="difficulty-option" data-difficulty="easy" style="flex: 1; padding: 10px; border-radius: 40px; border: 2px solid #e2e8f0; background: white; cursor: pointer; font-size: 13px;">🟢 آسان</button>
                                <button class="difficulty-option" data-difficulty="medium" style="flex: 1; padding: 10px; border-radius: 40px; border: 2px solid #e2e8f0; background: white; cursor: pointer; font-size: 13px;">🟡 متوسط</button>
                                <button class="difficulty-option" data-difficulty="hard" style="flex: 1; padding: 10px; border-radius: 40px; border: 2px solid #e2e8f0; background: white; cursor: pointer; font-size: 13px;">🔴 سخت</button>
                            </div>
                        </div>
                        
                        <!-- نمایش معنی -->
                        <div style="margin-bottom: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="speaking-show-meaning" ${this.speakingSession.showMeaning ? 'checked' : ''} style="width: 18px; height: 18px;">
                                <span style="font-size: 14px;"><i class="fas fa-eye"></i> نمایش معنی فارسی لغت</span>
                            </label>
                        </div>
                        
                        <!-- توضیحات -->
                        <div style="background: linear-gradient(135deg, #f3e8ff, #e9d5ff); padding: 15px; border-radius: 20px; margin-top: 10px;">
                            <div style="font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-robot" style="color: #8b5cf6;"></i>
                                <span>🤖 چگونه کار می‌کند؟</span>
                            </div>
                            <p style="font-size: 12px; line-height: 1.6; margin: 0; color: #4c1d95;">
                                هوش مصنوعی سوال را می‌سازد. شما پاسخ می‌دهید و AI به صورت لحظه‌ای پاسخ شما را بررسی می‌کند.
                            </p>
                        </div>
                    </div>
                    <div class="modal-footer" style="padding: 20px 25px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px;">
                        <button id="cancel-speaking-settings" class="btn btn-outline" style="flex: 1; padding: 12px; font-size: 14px;">انصراف</button>
                        <button id="start-speaking-session" class="btn btn-primary" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); font-size: 14px;">
                            <i class="fas fa-play"></i> شروع تمرین
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('speaking-settings-modal');
    }
    
    this.updateSpeakingModalStyle();
    
    document.getElementById('close-speaking-settings').onclick = () => modal.style.display = 'none';
    document.getElementById('cancel-speaking-settings').onclick = () => modal.style.display = 'none';
    
    document.getElementById('mode-fill-blank').onclick = () => {
        this.speakingSession.mode = 'fill_blank';
        localStorage.setItem('speakingMode', 'fill_blank');
        this.updateSpeakingModalStyle();
    };
    document.getElementById('mode-translate').onclick = () => {
        this.speakingSession.mode = 'translate';
        localStorage.setItem('speakingMode', 'translate');
        this.updateSpeakingModalStyle();
    };
    
    document.querySelectorAll('.level-option').forEach(btn => {
        btn.onclick = () => {
            this.speakingSession.level = btn.dataset.level;
            localStorage.setItem('speakingLevel', this.speakingSession.level);
            this.updateSpeakingModalStyle();
        };
    });
    
    document.querySelectorAll('.difficulty-option').forEach(btn => {
        btn.onclick = () => {
            this.speakingSession.difficulty = btn.dataset.difficulty;
            localStorage.setItem('speakingDifficulty', this.speakingSession.difficulty);
            this.updateSpeakingModalStyle();
        };
    });
    
    document.getElementById('speaking-show-meaning').onchange = (e) => {
        this.speakingSession.showMeaning = e.target.checked;
        localStorage.setItem('speakingShowMeaning', this.speakingSession.showMeaning);
    };
    
    document.getElementById('start-speaking-session').onclick = () => {
        modal.style.display = 'none';
        this.showSpeakingQuestion();
    };
    
    modal.style.display = 'flex';
}

// ================================================
// به‌روزرسانی استایل مودال
// ================================================

updateSpeakingModalStyle() {
    const modeFill = document.getElementById('mode-fill-blank');
    const modeTrans = document.getElementById('mode-translate');
    
    if (this.speakingSession.mode === 'fill_blank' && modeFill) {
        modeFill.style.background = 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
        modeFill.style.borderColor = 'transparent';
        modeFill.style.color = 'white';
    } else if (modeFill) {
        modeFill.style.background = 'white';
        modeFill.style.borderColor = '#e2e8f0';
        modeFill.style.color = '#1f2937';
    }
    
    if (this.speakingSession.mode === 'translate' && modeTrans) {
        modeTrans.style.background = 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
        modeTrans.style.borderColor = 'transparent';
        modeTrans.style.color = 'white';
    } else if (modeTrans) {
        modeTrans.style.background = 'white';
        modeTrans.style.borderColor = '#e2e8f0';
        modeTrans.style.color = '#1f2937';
    }
    
    document.querySelectorAll('.level-option').forEach(btn => {
        if (btn.dataset.level === this.speakingSession.level) {
            btn.style.background = 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
            btn.style.borderColor = 'transparent';
            btn.style.color = 'white';
        } else {
            btn.style.background = 'white';
            btn.style.borderColor = '#e2e8f0';
            btn.style.color = '#4b5563';
        }
    });
    
    document.querySelectorAll('.difficulty-option').forEach(btn => {
        if (btn.dataset.difficulty === this.speakingSession.difficulty) {
            btn.style.background = 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
            btn.style.borderColor = 'transparent';
            btn.style.color = 'white';
        } else {
            btn.style.background = 'white';
            btn.style.borderColor = '#e2e8f0';
            btn.style.color = '#4b5563';
        }
    });
}

// ================================================
// نمایش سوال
// ================================================

showSpeakingQuestion() {
    if (this.speakingSession.currentIndex >= this.speakingSession.words.length) {
        this.showSpeakingResults();
        return;
    }
    
    const word = this.speakingSession.words[this.speakingSession.currentIndex];
    const current = this.speakingSession.currentIndex + 1;
    const total = this.speakingSession.words.length;
    const progress = (current - 1) / total * 100;
    
    this.speakingSession.currentWord = word;
    this.speakingSession.isChecking = false;
    if (this.speakingSession.timeoutId) clearTimeout(this.speakingSession.timeoutId);
    
    const modeName = this.speakingSession.mode === 'fill_blank' ? 'تکمیل جای خالی' : 'ترجمه جمله';
    const modeIcon = this.speakingSession.mode === 'fill_blank' ? 'fa-pen-fancy' : 'fa-language';
    
    const container = document.getElementById('practice-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card" style="max-width: 750px; margin: 20px auto; padding: 25px;">
            <div class="section-header" style="flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding-bottom: 15px;">
                <h2 style="font-size: 20px;"><i class="fas ${modeIcon}" style="color: #8b5cf6;"></i> ${modeName}</h2>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <span class="badge" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); padding: 5px 12px; font-size: 12px;">${this.speakingSession.level}</span>
                    <span class="badge" style="background: ${this.speakingSession.difficulty === 'easy' ? '#10b981' : this.speakingSession.difficulty === 'medium' ? '#f59e0b' : '#ef4444'}; padding: 5px 12px; font-size: 12px;">${this.speakingSession.difficulty === 'easy' ? 'آسان' : this.speakingSession.difficulty === 'medium' ? 'متوسط' : 'سخت'}</span>
                    <span class="badge" style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 5px 12px; font-size: 12px;">${current}/${total}</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                <div style="background: linear-gradient(135deg, #f3e8ff, #e9d5ff); border-radius: 20px; padding: 20px; margin-bottom: 20px;">
                    <div style="font-size: 13px; color: #6b21a5; margin-bottom: 8px;">
                        <i class="fas fa-lightbulb"></i> لغت مورد نظر:
                    </div>
                    <div style="font-size: 32px; font-weight: 800; color: #581c87;">
                        ${this.escapeHtml(word.german)}
                    </div>
                    ${this.speakingSession.showMeaning ? `
                        <div style="background: rgba(255,255,255,0.6); border-radius: 12px; padding: 8px; margin-top: 10px;">
                            <span style="font-size: 14px; color: #6b21a5;">📖 ${this.escapeHtml(word.persian)}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div id="question-container" style="background: #f0fdf4; border-radius: 20px; padding: 20px; margin-bottom: 20px; min-height: 150px;">
                    <div id="question-loading" style="display: flex; justify-content: center; gap: 8px; padding: 20px;">
                        <div style="width: 10px; height: 10px; background: #10b981; border-radius: 50%; animation: pulse 1s infinite;"></div>
                        <div style="width: 10px; height: 10px; background: #10b981; border-radius: 50%; animation: pulse 1s infinite 0.2s;"></div>
                        <div style="width: 10px; height: 10px; background: #10b981; border-radius: 50%; animation: pulse 1s infinite 0.4s;"></div>
                        <span style="margin-right: 10px; font-size: 14px; color: #065f46;">ساخت سوال...</span>
                    </div>
                    <div id="question-display" style="display: none; font-size: 17px; font-weight: 500; line-height: 1.7;"></div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <textarea id="speaking-answer-input" class="form-control" rows="2"
                        placeholder="${this.speakingSession.mode === 'fill_blank' ? 'شکل صحیح را وارد کنید...' : 'جمله آلمانی را بنویسید...'}"
                        style="text-align: center; font-size: 16px; padding: 12px; max-width: 100%; direction: ltr; resize: none;"
                        autocomplete="off" disabled></textarea>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <button id="check-speaking-answer" class="btn btn-primary" disabled style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); padding: 10px 24px; font-size: 14px;">
                        <i class="fas fa-check"></i> بررسی (Enter)
                    </button>
                    <button id="skip-speaking-question" class="btn btn-outline" style="padding: 10px 24px; font-size: 14px;">
                        <i class="fas fa-forward"></i> رد کردن
                    </button>
                    <button id="hint-speaking-question" class="btn btn-outline" style="padding: 10px 24px; font-size: 14px;">
                        <i class="fas fa-lightbulb"></i> راهنمایی
                    </button>
                </div>
                
                <div id="speaking-feedback" style="margin-top: 20px; font-size: 14px; min-height: 80px;"></div>
                
                <div style="width: 100%; margin-top: 20px; height: 6px; background: var(--gray-200); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #8b5cf6, #6d28d9); transition: width 0.3s ease;"></div>
                </div>
            </div>
        </div>
    `;
    
    this.generateAIQuestion(word);
    
    document.getElementById('skip-speaking-question').onclick = () => this.skipSpeakingQuestion();
    document.getElementById('hint-speaking-question').onclick = () => this.showSpeakingHint();
    
    const checkBtn = document.getElementById('check-speaking-answer');
    if (checkBtn) {
        checkBtn.onclick = () => this.checkSpeakingAnswer();
    }
    
    const answerInput = document.getElementById('speaking-answer-input');
    if (answerInput) {
        answerInput.onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !this.speakingSession.isChecking) {
                e.preventDefault();
                this.checkSpeakingAnswer();
            }
        };
    }
}

async startQuiz() {
    const wordsToPractice = await this.getFilteredWordsForPractice();
    
    if (wordsToPractice.length < 4) {
        this.showToast('❌ حداقل به ۴ لغت برای شروع آزمون نیاز دارید', 'error');
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
        questions: [], // سوالات از قبل ساخته نمی‌شن، هر بار ساخته می‌شن
        userAnswers: []
    };
    
    this.showToast(`📊 تعداد سوالات در این بازه: ${selectedWords.length} سوال`, 'info');
    
    this.showQuizQuestion();
    this.showSection('quiz-section');
}

// ================================================
// 2. اصلاح تابع showQuizQuestion در scripts.js
// ================================================

showQuizQuestion() {
    if (this.quizSession.currentIndex >= this.quizSession.words.length) {
        this.showQuizResults();
        return;
    }
    
    const word = this.quizSession.words[this.quizSession.currentIndex];
    const isGerman = LanguageSystem.isGerman();
    const current = this.quizSession.currentIndex + 1;
    const total = this.quizSession.words.length;
    const progress = (current - 1) / total * 100;
    
    // انتخاب تصادفی نوع سوال
    const questionType = Math.random() > 0.5 ? 'german_to_persian' : 'persian_to_german';
    
    // ========== مهم: گرفتن 3 لغت متفاوت از کل لیست (نه از سوالات فعلی) برای ساخت گزینه‌های اشتباه ==========
    // اینطوری هر بار که سوال عوض می‌شه، گزینه‌های اشتباه هم عوض می‌شن
    const allOtherWords = this.quizSession.words.filter(w => w.id !== word.id);
    const shuffledOthers = this.shuffleArray([...allOtherWords]);
    
    let questionText = '';
    let correctAnswer = '';
    let options = [];
    
    if (questionType === 'german_to_persian') {
        questionText = `${isGerman ? 'معنی لغت' : 'Meaning of'} <strong style="font-size: 28px;">${word.german}</strong> ${isGerman ? 'چیست؟' : '?'}`;
        correctAnswer = word.persian;
        
        // ساخت گزینه‌های اشتباه از لغات دیگه (هر بار جدید)
        const wrongOptions = [];
        for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
            const otherWord = shuffledOthers[i];
            if (otherWord && otherWord.persian && otherWord.persian !== correctAnswer) {
                wrongOptions.push(otherWord.persian);
            } else {
                // اگه نتونستیم 3 تا پیدا کنیم، یه گزینه پیش‌فرض اضافه کن
                wrongOptions.push('???');
            }
        }
        
        // اگه کمتر از 3 تا شد، پر کن
        while (wrongOptions.length < 3) {
            wrongOptions.push('???');
        }
        
        options = [correctAnswer, ...wrongOptions];
        
    } else {
        questionText = `${isGerman ? 'معادل آلمانی' : 'German equivalent of'} <strong style="font-size: 28px;">${word.persian}</strong> ${isGerman ? 'کدام است؟' : '?'}`;
        correctAnswer = word.german;
        
        // ساخت گزینه‌های اشتباه از لغات دیگه (هر بار جدید)
        const wrongOptions = [];
        for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
            const otherWord = shuffledOthers[i];
            if (otherWord && otherWord.german && otherWord.german !== correctAnswer) {
                wrongOptions.push(otherWord.german);
            } else {
                wrongOptions.push('???');
            }
        }
        
        while (wrongOptions.length < 3) {
            wrongOptions.push('???');
        }
        
        options = [correctAnswer, ...wrongOptions];
    }
    
    // شافل کردن نهایی گزینه‌ها
    options = this.shuffleArray(options);
    
    // ذخیره سوال فعلی
    this.currentQuizQuestion = {
        word: word,
        correctAnswer: correctAnswer,
        options: options,
        questionType: questionType
    };
    
    const container = document.getElementById('quiz-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-question-circle"></i> ${isGerman ? 'آزمون چهارگزینه‌ای' : 'Multiple Choice Quiz'}</h2>
                <div style="display: flex; gap: 10px;">
                    <span class="badge" style="background: linear-gradient(135deg, #f59e0b, #d97706);">${current}/${total}</span>
                    <span class="badge" style="background: linear-gradient(135deg, #10b981, #059669);">امتیاز: ${this.quizSession.score}</span>
                </div>
            </div>
            
            <div style="text-align: center; padding: 30px 20px;">
                <div class="quiz-question" style="font-size: 20px; font-weight: 600; margin-bottom: 40px; color: var(--gray-700);">
                    ${questionText}
                </div>
                
                <div class="quiz-options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    ${options.map((opt, idx) => `
                        <button class="quiz-option-btn" data-answer="${this.escapeHtml(opt)}" data-index="${idx}">
                            ${this.escapeHtml(opt)}
                        </button>
                    `).join('')}
                </div>
                
                <div id="quiz-feedback" style="margin-top: 20px; font-size: 16px; min-height: 60px; font-weight: 500;"></div>
                
                <div style="width: 70%; margin: 20px auto 0; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 0.3s ease;"></div>
                </div>
            </div>
        </div>
    `;
    
    // غیرفعال کردن قفل پاسخ
    this.answerLocked = false;
    
    document.querySelectorAll('.quiz-option-btn').forEach(btn => {
        btn.onclick = () => {
            if (this.answerLocked) return;
            this.answerLocked = true;
            const selectedAnswer = btn.dataset.answer;
            this.checkQuizAnswer(selectedAnswer);
        };
    });
}

checkQuizAnswer(selectedAnswer) {
    const question = this.currentQuizQuestion;
    const isCorrect = (selectedAnswer === question.correctAnswer);
    const buttons = document.querySelectorAll('.quiz-option-btn');
    const feedbackDiv = document.getElementById('quiz-feedback');
    const isGerman = LanguageSystem.isGerman();
    
    buttons.forEach(btn => {
        btn.disabled = true;
    });
    
    if (isCorrect) {
        this.quizSession.score++;
        feedbackDiv.innerHTML = `<span style="color: #10b981; font-size: 18px; font-weight: 600;">✅ ${isGerman ? 'پاسخ صحیح! آفرین!' : 'Correct! Well done!'}</span>`;
        
        buttons.forEach(btn => {
            if (btn.dataset.answer === selectedAnswer) {
                btn.classList.add('correct');
            }
        });
    } else {
        feedbackDiv.innerHTML = `<span style="color: #ef4444; font-size: 16px; font-weight: 600;">
            ❌ ${isGerman ? 'پاسخ صحیح:' : 'Correct answer:'} <strong>${question.correctAnswer}</strong>
        </span>`;
        
        buttons.forEach(btn => {
            if (btn.dataset.answer === selectedAnswer) {
                btn.classList.add('incorrect');
            }
            if (btn.dataset.answer === question.correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }
    
    this.recordPractice(question.word.id, isCorrect);
    
    setTimeout(() => {
        this.answerLocked = false;
        this.quizSession.currentIndex++;
        this.showQuizQuestion();
    }, 1500);
}


showQuizResults() {
    const total = this.quizSession.words.length;
    const score = this.quizSession.score;
    const accuracy = Math.round((score / total) * 100);
    const isGerman = LanguageSystem.isGerman();
    
    const container = document.getElementById('quiz-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card" style="text-align: center;">
            <div class="section-header">
                <h2><i class="fas fa-trophy"></i> ${isGerman ? 'نتایج آزمون' : 'Quiz Results'}</h2>
            </div>
            
            <div style="padding: 40px 20px;">
                <div class="result-circle" style="width: 150px; height: 150px; margin: 0 auto 30px; border-radius: 50%; background: conic-gradient(#10b981 0% ${accuracy}%, #e5e7eb ${accuracy}% 100%); display: flex; align-items: center; justify-content: center;">
                    <div style="width: 120px; height: 120px; background: white; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <span style="font-size: 36px; font-weight: 800; color: #10b981;">${accuracy}%</span>
                        <span style="font-size: 12px; color: #6b7280;">${isGerman ? 'امتیاز' : 'Score'}</span>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; margin-bottom: 30px;">
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'تعداد سوالات' : 'Questions'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${total}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'پاسخ صحیح' : 'Correct'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: #10b981;">${score}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; color: var(--gray-500);">${isGerman ? 'پاسخ نادرست' : 'Wrong'}</div>
                        <div style="font-size: 32px; font-weight: 700; color: #ef4444;">${total - score}</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="restart-quiz-btn" class="btn btn-primary">
                        <i class="fas fa-redo-alt"></i> ${isGerman ? 'آزمون جدید' : 'New Quiz'}
                    </button>
                    <button id="back-to-practice-btn" class="btn btn-outline">
                        <i class="fas fa-arrow-right"></i> ${isGerman ? 'بازگشت' : 'Back'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('restart-quiz-btn').onclick = () => this.startQuiz();
    document.getElementById('back-to-practice-btn').onclick = () => {
        this.renderPracticeOptions();
        this.showSection('practice-section');
    };
}
setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const filter = btn.getAttribute('data-filter');
            if (!filter) return;
            
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // نمایش لودینگ
            const container = document.getElementById('word-list-container');
            container.style.opacity = '0.5';
            
            await this.renderWordList(filter);
            
            container.style.opacity = '1';
        };
    });
}
    // ================================================
    // مترجم آنلاین
    // ================================================

// ================================================
// ترجمه حرفه‌ای نسخه 4.0 - نهایی و بی‌نقص
// ================================================

renderTranslate() {
    const container = document.getElementById('translate-section');
    if (!container) return;
    
    const activeTab = localStorage.getItem('professionalTranslateTab') || 'simple';
    const isGerman = LanguageSystem.isGerman();
    
    container.innerHTML = `
        <div class="translate-pro-container">
            <div class="translate-pro-tabs">
                <button class="translate-pro-tab ${activeTab === 'simple' ? 'active' : ''}" data-tab="simple">
                    <i class="fas fa-language"></i>
                    <span>${isGerman ? 'ترجمه سریع' : 'Quick Translate'}</span>
                </button>
                <button class="translate-pro-tab ${activeTab === 'professional' ? 'active' : ''}" data-tab="professional">
                    <i class="fas fa-crown"></i>
                    <span>${isGerman ? 'تحلیل حرفه‌ای' : 'Pro Analysis'}</span>
                </button>
            </div>
            
            <div class="translate-pro-panel ${activeTab === 'simple' ? 'active' : ''}" id="translate-panel-simple">
                <div class="translate-simple-card">
                    <div class="translate-online-status" id="translate-online-status">
                        <span class="online-status-dot"></span>
                        <span>${isGerman ? 'آنلاین' : 'Online'}</span>
                    </div>
                    
                    <div class="translate-direction-buttons">
                        <button class="translate-dir-btn ${this.translateDirection === 'de-fa' ? 'active' : ''}" data-dir="de-fa">
                            <span class="dir-lang">FA</span>
                            <i class="fas fa-arrow-right"></i>
                            <span class="dir-lang">DE</span>
                        </button>
                        <button class="translate-dir-btn ${this.translateDirection === 'fa-de' ? 'active' : ''}" data-dir="fa-de">
                            <span class="dir-lang">FA</span>
                            <i class="fas fa-arrow-left"></i>
                            <span class="dir-lang">DE</span>
                        </button>
                    </div>
                    
                    <div class="translate-input-wrapper">
                        <textarea id="translate-input-field" class="translate-textarea" 
                            placeholder="${isGerman ? 'متن آلمانی یا فارسی را وارد کنید...' : 'Enter German or Persian text...'}" 
                            rows="3"></textarea>
                        <button class="translate-clear-btn" id="translate-clear-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="translate-result-wrapper" id="translate-result-wrapper">
                        <div class="translate-result-placeholder">
                            <i class="fas fa-exchange-alt"></i>
                            <p>${isGerman ? 'ترجمه اینجا نمایش داده می‌شود' : 'Translation appears here'}</p>
                        </div>
                    </div>
                    
                    <div class="translate-action-buttons">
                        <button class="translate-action-btn" id="translate-speak-source">
                            <i class="fas fa-volume-up"></i>
                            <span>${isGerman ? 'تلفظ متن' : 'Speak'}</span>
                        </button>
                        <button class="translate-action-btn" id="translate-speak-target">
                            <i class="fas fa-volume-up"></i>
                            <span>${isGerman ? 'تلفظ ترجمه' : 'Speak trans'}</span>
                        </button>
                        <button class="translate-action-btn" id="translate-copy-result">
                            <i class="fas fa-copy"></i>
                            <span>${isGerman ? 'کپی' : 'Copy'}</span>
                        </button>
                        <button class="translate-action-btn translate-save-btn" id="translate-save-word">
                            <i class="fas fa-bookmark"></i>
                            <span>${isGerman ? 'ذخیره' : 'Save'}</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="translate-pro-panel ${activeTab === 'professional' ? 'active' : ''}" id="translate-panel-professional">
                <div class="translate-pro-card">
                    <div class="translate-pro-search">
                        <div class="translate-pro-search-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="translate-pro-search-field">
                            <input type="text" id="translate-pro-input" class="translate-pro-input" 
                                placeholder="${isGerman ? 'لغت آلمانی را وارد کنید...' : 'Enter German word...'}"
                                autocomplete="off">
                            <button id="translate-pro-clear" class="translate-pro-clear" style="display: none;">
                                <i class="fas fa-times-circle"></i>
                            </button>
                        </div>
                        <div class="translate-pro-status">
                            <span class="translate-pro-dot"></span>
                            <span class="translate-pro-status-text">${isGerman ? 'آماده' : 'Ready'}</span>
                        </div>
                    </div>
                    
                    <div id="translate-pro-suggestions" class="translate-pro-suggestions" style="display: none;"></div>
                    
                    <div id="translate-pro-result" class="translate-pro-result" style="display: none;"></div>
                    
                    <div id="translate-pro-empty" class="translate-pro-empty">
                        <div class="translate-pro-empty-icon">
                            <i class="fas fa-microphone-alt"></i>
                        </div>
                        <h3>${isGerman ? 'تحلیلگر حرفه‌ای واژگان' : 'Professional Word Analyzer'}</h3>
                        <p>${isGerman ? 'یک لغت آلمانی را جستجو کنید تا تحلیل کاملی دریافت کنید' : 'Search a German word for complete analysis'}</p>
                        <div class="translate-pro-examples">
                            <span>${isGerman ? 'پیشنهاد:' : 'Try:'}</span>
                            <button class="translate-pro-example" data-word="der Hund">der Hund</button>
                            <button class="translate-pro-example" data-word="laufen">laufen</button>
                            <button class="translate-pro-example" data-word="schön">schön</button>
                            <button class="translate-pro-example" data-word="das Haus">das Haus</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    this.initTranslateTabs();
    this.initSimpleTranslate();
    this.initProTranslate();
}

initTranslateTabs() {
    document.querySelectorAll('.translate-pro-tab').forEach(tab => {
        tab.onclick = () => {
            const tabName = tab.dataset.tab;
            localStorage.setItem('professionalTranslateTab', tabName);
            
            document.querySelectorAll('.translate-pro-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.translate-pro-panel').forEach(panel => panel.classList.remove('active'));
            document.getElementById(`translate-panel-${tabName}`).classList.add('active');
        };
    });
}

initSimpleTranslate() {
    const input = document.getElementById('translate-input-field');
    const resultDiv = document.getElementById('translate-result-wrapper');
    const clearBtn = document.getElementById('translate-clear-btn');
    const isGerman = LanguageSystem.isGerman();
    
    if (!input) return;
    
    let debounceTimer;
    
    const translateText = async () => {
        const text = input.value.trim();
        
        if (!text) {
            resultDiv.innerHTML = `
                <div class="translate-result-placeholder">
                    <i class="fas fa-exchange-alt"></i>
                    <p>${isGerman ? 'ترجمه اینجا نمایش داده می‌شود' : 'Translation appears here'}</p>
                </div>
            `;
            return;
        }
        
        resultDiv.innerHTML = `
            <div class="translate-result-loading">
                <div class="translate-spinner"></div>
                <span>${isGerman ? 'در حال ترجمه...' : 'Translating...'}</span>
            </div>
        `;
        
        try {
            const isDeToFa = this.translateDirection === 'de-fa';
            let translated = null;
            
            // جستجو در دیکشنری محلی
            const allWords = await this.getAllWords();
            const searchTerm = text.toLowerCase();
            
            if (isDeToFa) {
                const found = allWords.find(w => w.german.toLowerCase() === searchTerm);
                if (found) translated = found.persian;
            } else {
                const found = allWords.find(w => w.persian.toLowerCase() === searchTerm);
                if (found) translated = found.german;
            }
            
            // اگر در دیکشنری نبود، از گوگل استفاده کن
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
                resultDiv.innerHTML = `
                    <div class="translate-result-content">
                        <div class="translate-result-text">${this.escapeHtml(translated)}</div>
                        <div class="translate-result-source">${isGerman ? 'ترجمه خودکار' : 'Auto translation'}</div>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div class="translate-result-placeholder">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>${isGerman ? 'خطا در ترجمه' : 'Translation error'}</p>
                    </div>
                `;
            }
        } catch (error) {
            resultDiv.innerHTML = `
                <div class="translate-result-placeholder">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${isGerman ? 'خطا در ترجمه' : 'Translation error'}</p>
                </div>
            `;
        }
    };
    
    input.oninput = (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(translateText, 600);
        
        if (clearBtn) {
            clearBtn.style.display = e.target.value ? 'flex' : 'none';
        }
    };
    
    if (clearBtn) {
        clearBtn.onclick = () => {
            input.value = '';
            clearBtn.style.display = 'none';
            resultDiv.innerHTML = `
                <div class="translate-result-placeholder">
                    <i class="fas fa-exchange-alt"></i>
                    <p>${isGerman ? 'ترجمه اینجا نمایش داده می‌شود' : 'Translation appears here'}</p>
                </div>
            `;
            input.focus();
        };
    }
    
    // جهت ترجمه
    document.querySelectorAll('.translate-dir-btn').forEach(btn => {
        btn.onclick = () => {
            const dir = btn.dataset.dir;
            this.translateDirection = dir;
            document.querySelectorAll('.translate-dir-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            translateText();
        };
    });
    
    // دکمه تلفظ متن مبدأ
    document.getElementById('translate-speak-source')?.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {
            const lang = this.translateDirection === 'de-fa' ? 'de-DE' : 'fa-IR';
            this.speakText(text, lang);
        }
    });
    
    // دکمه تلفظ ترجمه
    document.getElementById('translate-speak-target')?.addEventListener('click', () => {
        const resultText = document.querySelector('#translate-result-wrapper .translate-result-text')?.textContent;
        if (resultText) {
            const lang = this.translateDirection === 'de-fa' ? 'fa-IR' : 'de-DE';
            this.speakText(resultText, lang);
        }
    });
    
    // دکمه کپی
    document.getElementById('translate-copy-result')?.addEventListener('click', async () => {
        const resultText = document.querySelector('#translate-result-wrapper .translate-result-text')?.textContent;
        if (resultText) {
            await navigator.clipboard.writeText(resultText);
            this.showToast('✅ کپی شد', 'success');
        }
    });
    
    // دکمه ذخیره
    document.getElementById('translate-save-word')?.addEventListener('click', () => {
        const german = this.translateDirection === 'de-fa' ? input.value.trim() : document.querySelector('#translate-result-wrapper .translate-result-text')?.textContent;
        const persian = this.translateDirection === 'de-fa' ? document.querySelector('#translate-result-wrapper .translate-result-text')?.textContent : input.value.trim();
        
        if (german && persian) {
            this.showSaveWordDialog(german, persian);
        } else {
            this.showToast('❌ متن ترجمه شده‌ای وجود ندارد', 'error');
        }
    });
}

initProTranslate() {
    const searchInput = document.getElementById('translate-pro-input');
    const clearBtn = document.getElementById('translate-pro-clear');
    const suggestionsDiv = document.getElementById('translate-pro-suggestions');
    const resultDiv = document.getElementById('translate-pro-result');
    const emptyDiv = document.getElementById('translate-pro-empty');
    const statusDot = document.querySelector('.translate-pro-dot');
    const statusText = document.querySelector('.translate-pro-status-text');
    const isGerman = LanguageSystem.isGerman();
    
    if (!searchInput) return;
    
    let searchTimeout;
    let isSearching = false;
    
    const hideSuggestions = () => {
        suggestionsDiv.style.display = 'none';
    };
    
    const showLoading = () => {
        if (statusDot) statusDot.className = 'translate-pro-dot loading';
        if (statusText) statusText.textContent = isGerman ? 'در حال جستجو...' : 'Searching...';
    };
    
    const showOnline = () => {
        if (statusDot) statusDot.className = 'translate-pro-dot online';
        if (statusText) statusText.textContent = isGerman ? 'آنلاین' : 'Online';
    };
    
    const showOffline = () => {
        if (statusDot) statusDot.className = 'translate-pro-dot offline';
        if (statusText) statusText.textContent = isGerman ? 'آفلاین' : 'Offline';
    };
    
    if (clearBtn) {
        clearBtn.onclick = () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            hideSuggestions();
            resultDiv.style.display = 'none';
            emptyDiv.style.display = 'flex';
            searchInput.focus();
        };
    }
    
    // جستجوی زنده با AI
    const liveSearch = async (query) => {
        if (query.length < 2) {
            hideSuggestions();
            return;
        }
        
        showLoading();
        suggestionsDiv.style.display = 'block';
        suggestionsDiv.innerHTML = `
            <div class="translate-pro-suggestions-loading">
                <div class="translate-pro-dots">
                    <span></span><span></span><span></span>
                </div>
                <span>${isGerman ? 'در حال جستجو...' : 'Searching...'}</span>
            </div>
        `;
        
        try {
            const prompt = `لیستی از 8 لغت آلمانی پرکاربرد که با "${query}" شروع می‌شوند یا شبیه آن هستند را پیدا کن.
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
            
            if (suggestions.length === 0) {
                suggestionsDiv.innerHTML = `
                    <div class="translate-pro-suggestions-empty">
                        <i class="fas fa-search"></i>
                        <span>${isGerman ? 'نتیجه‌ای یافت نشد' : 'No results found'}</span>
                    </div>
                `;
                showOnline();
                return;
            }
            
            suggestionsDiv.innerHTML = suggestions.map(s => `
                <div class="translate-pro-suggestion" data-word="${this.escapeHtml(s.word)}">
                    <div class="translate-pro-suggestion-word">${this.escapeHtml(s.word)}</div>
                    <div class="translate-pro-suggestion-meaning">${this.escapeHtml(s.meaning || '...')}</div>
                    <i class="fas fa-chevron-left translate-pro-suggestion-arrow"></i>
                </div>
            `).join('');
            
            document.querySelectorAll('.translate-pro-suggestion').forEach(item => {
                item.onclick = () => {
                    const word = item.dataset.word;
                    searchInput.value = word;
                    hideSuggestions();
                    if (clearBtn) clearBtn.style.display = 'flex';
                    this.proAnalyzeWord(word);
                };
            });
            
            showOnline();
            
        } catch (error) {
            console.error('Live search error:', error);
            suggestionsDiv.innerHTML = `
                <div class="translate-pro-suggestions-empty">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${isGerman ? 'خطا در جستجو' : 'Search error'}</span>
                </div>
            `;
            showOffline();
        }
    };
    
    searchInput.oninput = (e) => {
        const query = e.target.value.trim();
        
        if (clearBtn) {
            clearBtn.style.display = query ? 'flex' : 'none';
        }
        
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
            const query = searchInput.value.trim();
            if (query) {
                isSearching = true;
                hideSuggestions();
                if (clearBtn) clearBtn.style.display = 'flex';
                this.proAnalyzeWord(query).finally(() => {
                    isSearching = false;
                });
            }
        }
    };
    
    // دکمه‌های مثال
    document.querySelectorAll('.translate-pro-example').forEach(btn => {
        btn.onclick = () => {
            const word = btn.dataset.word;
            searchInput.value = word;
            if (clearBtn) clearBtn.style.display = 'flex';
            hideSuggestions();
            this.proAnalyzeWord(word);
        };
    });
}

async proAnalyzeWord(word) {
    const resultDiv = document.getElementById('translate-pro-result');
    const emptyDiv = document.getElementById('translate-pro-empty');
    const statusDot = document.querySelector('.translate-pro-dot');
    const statusText = document.querySelector('.translate-pro-status-text');
    const isGerman = LanguageSystem.isGerman();
    
    if (!resultDiv) return;
    
    if (statusDot) statusDot.className = 'translate-pro-dot loading';
    if (statusText) statusText.textContent = isGerman ? 'در حال تحلیل...' : 'Analyzing...';
    
    resultDiv.style.display = 'block';
    emptyDiv.style.display = 'none';
    
    resultDiv.innerHTML = `
        <div class="translate-pro-loading">
            <div class="translate-pro-spinner"></div>
            <p>${isGerman ? 'در حال تحلیل لغت...' : 'Analyzing word...'}</p>
        </div>
    `;
    
    try {
        const allWords = await this.getAllWords();
        let foundWord = allWords.find(w => 
            w.german.toLowerCase() === word.toLowerCase() ||
            w.german.toLowerCase().includes(word.toLowerCase())
        );
        
        if (foundWord) {
            await this.renderProWordAnalysis(foundWord);
        } else {
            await this.fetchAIWordAnalysis(word);
        }
        
        if (statusDot) statusDot.className = 'translate-pro-dot online';
        if (statusText) statusText.textContent = isGerman ? 'آنلاین' : 'Online';
        
    } catch (error) {
        console.error('Analysis error:', error);
        resultDiv.innerHTML = `
            <div class="translate-pro-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>${isGerman ? 'خطا در تحلیل' : 'Analysis Error'}</h4>
                <p>${isGerman ? 'امکان تحلیل این لغت وجود ندارد' : 'Cannot analyze this word'}</p>
                <button onclick="dictionaryApp.proAnalyzeWord('${word.replace(/'/g, "\\'")}')" class="translate-pro-retry">
                    <i class="fas fa-redo-alt"></i> ${isGerman ? 'تلاش مجدد' : 'Retry'}
                </button>
            </div>
        `;
        if (statusDot) statusDot.className = 'translate-pro-dot offline';
        if (statusText) statusText.textContent = isGerman ? 'آفلاین' : 'Offline';
    }
}

async fetchAIWordAnalysis(word) {
    const resultDiv = document.getElementById('translate-pro-result');
    const isGerman = LanguageSystem.isGerman();
    
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

    try {
        const response = await this._puterChat(prompt, {});
        let rawText = '';
        
        if (response?.message?.content?.[0]?.text) rawText = response.message.content[0].text;
        else if (typeof response === 'string') rawText = response;
        
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
        
    } catch (error) {
        throw error;
    }
}

async renderProWordAnalysis(word) {
    const resultDiv = document.getElementById('translate-pro-result');
    const isGerman = LanguageSystem.isGerman();
    
    const type = word.type || 'other';
    const nounInfo = word.noun_info;
    const verbInfo = word.verb_info;
    const adjInfo = word.adjective_info;
    const examples = word.examples || [];
    const isVerb = type === 'verb' && verbInfo;
    
    let html = `
        <div class="translate-pro-card-result">
            <div class="translate-pro-header">
                <div class="translate-pro-title-area">
                    <h1 class="translate-pro-word">${this.escapeHtml(word.german || word.word || '-')}</h1>
                    <div class="translate-pro-badges">
                        <span class="translate-pro-badge translate-pro-badge-${type}">${this.getTypeLabel(type)}</span>
                        ${nounInfo?.gender ? `<span class="translate-pro-badge translate-pro-gender-${nounInfo.gender}">${this.getGenderSymbol(nounInfo.gender)}</span>` : ''}
                    </div>
                </div>
                <div class="translate-pro-actions">
                    <button class="translate-pro-action pro-speak-word-btn" data-word="${this.escapeHtml(word.german || word.word)}">
                        <i class="fas fa-volume-up"></i> <span>${isGerman ? 'تلفظ' : 'Speak'}</span>
                    </button>
                    <button class="translate-pro-action pro-copy-word-btn" data-text="${this.escapeHtml(word.german || word.word)}">
                        <i class="fas fa-copy"></i> <span>${isGerman ? 'کپی' : 'Copy'}</span>
                    </button>
                    <button class="translate-pro-action pro-save-word-btn" 
                        data-german="${this.escapeHtml(word.german || word.word)}"
                        data-persian="${this.escapeHtml(word.persian || word.persian_meaning || '-')}"
                        data-type="${type}"
                        data-gender="${nounInfo?.gender || ''}"
                        data-plural="${nounInfo?.plural || ''}">
                        <i class="fas fa-bookmark"></i> <span>${isGerman ? 'ذخیره' : 'Save'}</span>
                    </button>
                </div>
            </div>
            
            <div class="translate-pro-meaning">
                <div class="translate-pro-meaning-icon"><i class="fas fa-language"></i></div>
                <div class="translate-pro-meaning-content">
                    <div class="translate-pro-meaning-label">${isGerman ? 'معنی' : 'Meaning'}</div>
                    <div class="translate-pro-meaning-text">${this.escapeHtml(word.persian || word.persian_meaning || '-')}</div>
                    ${word.pronunciation ? `<div class="translate-pro-pronunciation"><i class="fas fa-microphone-alt"></i> ${this.escapeHtml(word.pronunciation)}</div>` : ''}
                </div>
            </div>
    `;
    
    // جدول صرف فعل - نسخه حرفه‌ای
    if (isVerb && verbInfo) {
        html += `
            <div class="translate-pro-section">
                <div class="translate-pro-section-title">
                    <i class="fas fa-table-list"></i>
                    <span>${isGerman ? 'صرف فعل' : 'Verb Conjugation'}</span>
                </div>
                <div class="translate-pro-conjugation">
                    <div class="translate-pro-tense-buttons">
                        <button class="translate-pro-tense-btn active" data-tense="present">Präsens</button>
                        <button class="translate-pro-tense-btn" data-tense="past">Präteritum</button>
                        <button class="translate-pro-tense-btn" data-tense="perfect">Perfekt</button>
                        <button class="translate-pro-tense-btn" data-tense="future">Futur I</button>
                    </div>
                    
                    <div class="translate-pro-tense-panel active" id="pro-tense-present">
                        <table class="translate-pro-conj-table">
                            <tr><th>ich</th><td>${verbInfo.present?.ich || '-'}</td></tr>
                            <tr><th>du</th><td>${verbInfo.present?.du || '-'}</td></tr>
                            <tr><th>er/sie/es</th><td>${verbInfo.present?.er || '-'}</td></tr>
                            <tr><th>wir</th><td>${verbInfo.present?.wir || '-'}</td></tr>
                            <tr><th>ihr</th><td>${verbInfo.present?.ihr || '-'}</td></tr>
                            <tr><th>sie/Sie</th><td>${verbInfo.present?.sie || '-'}</td></tr>
                        </table>
                    </div>
                    
                    <div class="translate-pro-tense-panel" id="pro-tense-past">
                        <table class="translate-pro-conj-table">
                            <tr><th>ich</th><td>${verbInfo.past?.ich || '-'}</td></tr>
                            <tr><th>du</th><td>${verbInfo.past?.du || '-'}</td></tr>
                            <tr><th>er/sie/es</th><td>${verbInfo.past?.er || '-'}</td></tr>
                        </table>
                    </div>
                    
                    <div class="translate-pro-tense-panel" id="pro-tense-perfect">
                        <div class="translate-pro-perfect-info">
                            <div class="translate-pro-perfect-helper">
                                <span class="translate-pro-helper-label">${isGerman ? 'فعل کمکی' : 'Auxiliary'}</span>
                                <span class="translate-pro-helper-value">${verbInfo.helper || 'haben'}</span>
                            </div>
                            <div class="translate-pro-perfect-participle">
                                <span class="translate-pro-participle-label">${isGerman ? 'اسم مفعول' : 'Past Participle'}</span>
                                <span class="translate-pro-participle-value">${verbInfo.perfect || '-'}</span>
                            </div>
                        </div>
                        <div class="translate-pro-perfect-example">
                            <i class="fas fa-lightbulb"></i>
                            <span>${verbInfo.helper === 'haben' ? 'ich habe' : 'ich bin'} ${verbInfo.perfect || '-'}</span>
                        </div>
                    </div>
                    
                    <div class="translate-pro-tense-panel" id="pro-tense-future">
                        <table class="translate-pro-conj-table">
                            <tr><th>ich</th><td>${verbInfo.future?.ich || `werde ${word.german}`}</td></tr>
                            <tr><th>du</th><td>${verbInfo.future?.du || `wirst ${word.german}`}</td></tr>
                            <tr><th>er/sie/es</th><td>${verbInfo.future?.er || `wird ${word.german}`}</td></tr>
                        </table>
                    </div>
                </div>
                ${verbInfo.separable ? `<div class="translate-pro-separable"><i class="fas fa-cut"></i> ${isGerman ? 'فعل جداشدنی' : 'Separable verb'}</div>` : ''}
            </div>
        `;
    }
    
  // ========== اصلاح نمایش جنسیت در کارت اطلاعات ==========
// داخل تابع renderProWordAnalysis، قسمت اطلاعات اسم را اینطور تغییر دهید:

// اطلاعات اسم
if (type === 'noun' && nounInfo) {
    html += `
        <div class="translate-pro-section">
            <div class="translate-pro-section-title">
                <i class="fas fa-venus-mars"></i>
                <span>${isGerman ? 'اطلاعات اسم' : 'Noun Information'}</span>
            </div>
            <div class="translate-pro-info-grid">
                ${nounInfo.gender ? `
                <div class="translate-pro-info-card">
                    <div class="translate-pro-gender-circle translate-pro-gender-${nounInfo.gender}">
                        <i class="fas fa-${nounInfo.gender === 'masculine' ? 'mars' : nounInfo.gender === 'feminine' ? 'venus' : 'genderless'}"></i>
                    </div>
                    <div class="translate-pro-info-text">
                        <div class="translate-pro-info-label">${isGerman ? 'جنسیت' : 'Gender'}</div>
                        <div class="translate-pro-info-value">${this.getGenderLabel(nounInfo.gender)}</div>
                    </div>
                </div>
                ` : ''}
                ${nounInfo.plural ? `
                <div class="translate-pro-info-card">
                    <div class="translate-pro-info-icon"><i class="fas fa-copy"></i></div>
                    <div class="translate-pro-info-text">
                        <div class="translate-pro-info-label">${isGerman ? 'جمع' : 'Plural'}</div>
                        <div class="translate-pro-info-value">${this.escapeHtml(nounInfo.plural)}</div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ========== اصلاح نمایش مثال‌ها با تقسیم 50%-50% ==========
// داخل تابع renderProWordAnalysis، قسمت مثال‌ها را اینطور تغییر دهید:

// مثال‌ها
if (examples.length > 0) {
    html += `
        <div class="translate-pro-section">
            <div class="translate-pro-section-title">
                <i class="fas fa-quote-right"></i>
                <span>${isGerman ? 'مثال‌ها' : 'Examples'}</span>
                <span class="translate-pro-examples-count">(${examples.length})</span>
            </div>
            <div class="translate-pro-examples">
    `;
    
    examples.forEach(ex => {
        html += `
            <div class="translate-pro-example">
                <div class="translate-pro-example-german">${this.escapeHtml(ex.german)}</div>
                <div class="translate-pro-example-persian">${this.escapeHtml(ex.persian)}</div>
                <button class="translate-pro-example-speak" data-text="${this.escapeHtml(ex.german)}">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
}
    
    // اطلاعات صفت
    if (type === 'adjective' && adjInfo) {
        html += `
            <div class="translate-pro-section">
                <div class="translate-pro-section-title">
                    <i class="fas fa-chart-line"></i>
                    <span>${isGerman ? 'حالت‌های صفت' : 'Adjective Forms'}</span>
                </div>
                <div class="translate-pro-info-grid">
                    ${adjInfo.comparative ? `
                    <div class="translate-pro-info-card">
                        <div class="translate-pro-info-icon"><i class="fas fa-level-up-alt"></i></div>
                        <div class="translate-pro-info-text">
                            <div class="translate-pro-info-label">Komparativ</div>
                            <div class="translate-pro-info-value">${this.escapeHtml(adjInfo.comparative)}</div>
                        </div>
                    </div>
                    ` : ''}
                    ${adjInfo.superlative ? `
                    <div class="translate-pro-info-card">
                        <div class="translate-pro-info-icon"><i class="fas fa-crown"></i></div>
                        <div class="translate-pro-info-text">
                            <div class="translate-pro-info-label">Superlativ</div>
                            <div class="translate-pro-info-value">${this.escapeHtml(adjInfo.superlative)}</div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
   
    // یادداشت‌ها
    if (word.notes) {
        html += `
            <div class="translate-pro-section">
                <div class="translate-pro-section-title">
                    <i class="fas fa-sticky-note"></i>
                    <span>${isGerman ? 'نکات' : 'Notes'}</span>
                </div>
                <div class="translate-pro-notes">
                    ${this.escapeHtml(word.notes)}
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    resultDiv.innerHTML = html;
    
    // رویدادهای تب‌های زمان
    document.querySelectorAll('.translate-pro-tense-btn').forEach(btn => {
        btn.onclick = () => {
            const tense = btn.dataset.tense;
            document.querySelectorAll('.translate-pro-tense-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.translate-pro-tense-panel').forEach(panel => panel.classList.remove('active'));
            document.getElementById(`pro-tense-${tense}`).classList.add('active');
        };
    });
    
    // رویدادهای دکمه‌ها
    document.querySelectorAll('.pro-speak-word-btn').forEach(btn => {
        btn.onclick = () => this.speakText(btn.dataset.word, 'de-DE');
    });
    
    document.querySelectorAll('.pro-copy-word-btn').forEach(btn => {
        btn.onclick = async () => {
            await navigator.clipboard.writeText(btn.dataset.text);
            this.showToast('✅ کپی شد', 'success');
        };
    });
    
    document.querySelectorAll('.pro-save-word-btn').forEach(btn => {
        btn.onclick = () => {
            const german = btn.dataset.german;
            const persian = btn.dataset.persian;
            this.showSaveWordDialog(german, persian);
        };
    });
    
    document.querySelectorAll('.translate-pro-example-speak').forEach(btn => {
        btn.onclick = () => this.speakText(btn.dataset.text, 'de-DE');
    });
}

showSaveWordDialog(german, persian) {
    const isGerman = LanguageSystem.isGerman();
    
    // حذف مودال قبلی اگر وجود دارد
    const existingModal = document.querySelector('.save-word-modal-overlay');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'save-word-modal-overlay';
    modal.innerHTML = `
        <div class="save-word-modal-container">
            <div class="save-word-modal-header">
                <h3><i class="fas fa-bookmark"></i> ${isGerman ? 'ذخیره لغت جدید' : 'Save New Word'}</h3>
                <button class="save-word-modal-close">&times;</button>
            </div>
            <div class="save-word-modal-body">
                <div class="save-word-field">
                    <label><i class="fas fa-language"></i> ${isGerman ? 'لغت آلمانی' : 'German Word'}</label>
                    <input type="text" id="save-dialog-german" class="save-word-field-input" value="${this.escapeHtml(german)}">
                </div>
                <div class="save-word-field">
                    <label><i class="fas fa-pencil-alt"></i> ${isGerman ? 'معنی فارسی' : 'Persian Meaning'}</label>
                    <input type="text" id="save-dialog-persian" class="save-word-field-input" value="${this.escapeHtml(persian)}">
                </div>
                <div class="save-word-field">
                    <label><i class="fas fa-tag"></i> ${isGerman ? 'نوع کلمه' : 'Word Type'}</label>
                    <div class="save-word-type-buttons">
                        <button class="save-word-type-btn active" data-type="noun">${isGerman ? 'اسم' : 'Noun'}</button>
                        <button class="save-word-type-btn" data-type="verb">${isGerman ? 'فعل' : 'Verb'}</button>
                        <button class="save-word-type-btn" data-type="adjective">${isGerman ? 'صفت' : 'Adjective'}</button>
                        <button class="save-word-type-btn" data-type="adverb">${isGerman ? 'قید' : 'Adverb'}</button>
                        <button class="save-word-type-btn" data-type="other">${isGerman ? 'سایر' : 'Other'}</button>
                    </div>
                </div>
                <div id="save-word-gender-container" class="save-word-field" style="display: none;">
                    <label><i class="fas fa-venus-mars"></i> ${isGerman ? 'جنسیت' : 'Gender'}</label>
                    <div class="save-word-gender-buttons">
                        <button class="save-word-gender-btn" data-gender="masculine">der</button>
                        <button class="save-word-gender-btn" data-gender="feminine">die</button>
                        <button class="save-word-gender-btn" data-gender="neuter">das</button>
                    </div>
                </div>
            </div>
            <div class="save-word-modal-footer">
                <button class="save-word-cancel-btn">${isGerman ? 'انصراف' : 'Cancel'}</button>
                <button class="save-word-confirm-btn"><i class="fas fa-save"></i> ${isGerman ? 'ذخیره' : 'Save'}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    let selectedType = 'noun';
    let selectedGender = null;
    
    const typeBtns = modal.querySelectorAll('.save-word-type-btn');
    const genderContainer = modal.querySelector('#save-word-gender-container');
    const genderBtns = modal.querySelectorAll('.save-word-gender-btn');
    
    typeBtns.forEach(btn => {
        btn.onclick = () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedType = btn.dataset.type;
            genderContainer.style.display = selectedType === 'noun' ? 'block' : 'none';
        };
    });
    
    genderBtns.forEach(btn => {
        btn.onclick = () => {
            genderBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGender = btn.dataset.gender;
        };
    });
    
    modal.querySelector('.save-word-modal-close')?.addEventListener('click', () => modal.remove());
    modal.querySelector('.save-word-cancel-btn')?.addEventListener('click', () => modal.remove());
    
    modal.querySelector('.save-word-confirm-btn')?.addEventListener('click', async () => {
        const germanVal = document.getElementById('save-dialog-german').value.trim();
        const persianVal = document.getElementById('save-dialog-persian').value.trim();
        
        if (!germanVal || !persianVal) {
            this.showToast('❌ لطفاً هر دو فیلد را پر کنید', 'error');
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
            this.showToast(`✅ "${germanVal}" به دیکشنری اضافه شد`, 'success');
            modal.remove();
        } catch (error) {
            this.showToast('❌ خطا در ذخیره سازی', 'error');
        }
    });
}

   updateTranslateUI() {
    const isGerman = LanguageSystem.isGerman();
    
    document.getElementById('input-title').textContent = LanguageSystem.t('translate.sourceText');
    document.getElementById('output-title').textContent = LanguageSystem.t('translate.targetText');
    
    const inputField = document.getElementById('translate-input');
    inputField.placeholder = isGerman ? 'متن آلمانی خود را وارد کنید...' : 'Enter English text...';
    inputField.dir = 'ltr';
}
async performAutoTranslation(text) {
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
}
async _puterChat(messages, options = {}) {
    const WORKER_URL = 'https://groq.ysadat180.workers.dev';
    
    // تبدیل messages به فرمت ساده
    let simpleMessages = [];
    
    if (typeof messages === 'string') {
        simpleMessages = [{ role: 'user', content: messages }];
    } else if (Array.isArray(messages)) {
        simpleMessages = messages.map(m => {
            if (typeof m.content === 'string') {
                return { role: m.role, content: m.content };
            }
            if (Array.isArray(m.content)) {
                const text = m.content.filter(c => c.type === 'text').map(c => c.text).join(' ');
                return { role: m.role, content: text || '...' };
            }
            return { role: m.role, content: String(m.content) };
        });
    }
    
    simpleMessages = simpleMessages.filter(m => m.content && m.content.trim());
    
    console.log('📤 Sending to Worker (Llama 4 Scout):', simpleMessages.length, 'messages');
    
    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: simpleMessages,
                max_tokens:5000,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('Worker error:', data);
            
            // اگه خطای Rate Limit بود، پیام مناسب
            if (response.status === 429) {
                throw new Error('سرور شلوغ است، لطفاً چند ثانیه بعد دوباره تلاش کنید');
            }
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        const text = data.choices?.[0]?.message?.content || '';
        
        if (!text) {
            throw new Error('پاسخی دریافت نشد');
        }
        
        return { message: { content: [{ text }] } };
        
    } catch (error) {
        console.error('❌ _puterChat error:', error);
        throw error;
    }
}
// ================================================
// مدیریت API Key (ذخیره در localStorage با رمزگذاری ساده)
// ================================================

setGroqApiKey(key) {
    if (key && key.trim()) {
        const encrypted = btoa(key.trim());
        localStorage.setItem('groq_api_key_encrypted', encrypted);
        return true;
    }
    return false;
}

getGroqApiKey() {
    // دیگه نیازی به کلید نیست! Worker خودش کلیدها رو مدیریت میکنه
    // فقط یه مقدار ساختگی برمیگردونیم (Worker بهش نیاز نداره)
    return "worker-handles-keys";
}
clearGroqApiKey() {
    localStorage.removeItem('groq_api_key_encrypted');
}

async testGroqApiKey(apiKey = null) {
    const key = apiKey || this.getGroqApiKey();
    if (!key) {
        return { success: false, message: 'API Key وارد نشده است' };
    }
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            return { success: true, message: 'اتصال با موفقیت برقرار شد' };
        } else {
            return { success: false, message: `خطا: ${response.status} - کلید نامعتبر است` };
        }
    } catch (error) {
        return { success: false, message: `خطا در اتصال: ${error.message}` };
    }
}
async _puterExtractText(response) {
    if (!response) return '';
    if (response?.message?.content?.[0]?.text) return response.message.content[0].text;
    if (Array.isArray(response?.message?.content)) return response.message.content.map(c => c.text || '').join('');
    if (typeof response?.message?.content === 'string') return response.message.content;
    if (typeof response === 'string') return response;
    if (response?.text) return response.text;
    return '';
}
/**
 * جستجوی دقیق در دیکشنری (فقط تطابق کامل)
 */
async searchExactInDictionary(text) {
    try {
        const words = await this.getAllWords();
        const searchText = text.toLowerCase().trim();
        
        let foundWord = null;
        
        if (this.translateDirection === 'de-fa') {
            // آلمانی به فارسی: جستجوی دقیق در ستون آلمانی
            foundWord = words.find(word => 
                word.german.toLowerCase() === searchText
            );
            return foundWord ? foundWord.persian : null;
        } else {
            // فارسی به آلمانی: جستجوی دقیق در ستون فارسی
            foundWord = words.find(word => 
                word.persian.toLowerCase() === searchText
            );
            return foundWord ? foundWord.german : null;
        }
    } catch (error) {
        console.error('Error in searchExactInDictionary:', error);
        return null;
    }
}
// نمایش پیشنهادات از دیکشنری
async showSuggestions(text) {
    const suggestionsDiv = document.getElementById('suggestions-list');
    const suggestionsContainer = document.getElementById('translate-suggestions');
    
    if (!text || text.length < 2) {
        if (suggestionsContainer) suggestionsContainer.style.display = 'none';
        return;
    }
    
    try {
        const words = await this.getAllWords();
        const searchText = text.toLowerCase().trim();
        
        let suggestions = [];
        
        if (this.translateDirection === 'de-fa') {
            suggestions = words
                .filter(word => 
                    word.german.toLowerCase().startsWith(searchText) ||
                    word.german.toLowerCase().includes(searchText)
                )
                .slice(0, 5);
        } else {
            suggestions = words
                .filter(word => 
                    word.persian.toLowerCase().startsWith(searchText) ||
                    word.persian.toLowerCase().includes(searchText)
                )
                .slice(0, 5);
        }
        
        if (suggestions.length === 0) {
            if (suggestionsContainer) suggestionsContainer.style.display = 'none';
            return;
        }
        
        if (suggestionsContainer) suggestionsContainer.style.display = 'block';
        
        suggestionsDiv.innerHTML = suggestions.map(word => `
            <div class="suggestion-item" data-german="${word.german}" data-persian="${word.persian}">
                <div class="suggestion-content">
                    <div class="suggestion-german">${this.escapeHtml(word.german)}</div>
                    <div class="suggestion-persian">${this.escapeHtml(word.persian)}</div>
                    ${word.gender ? `<span class="word-gender-badge ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                </div>
                <button class="use-suggestion-btn" title="استفاده از این لغت">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        `).join('');
        
        // Event listener برای استفاده از پیشنهاد
        document.querySelectorAll('.use-suggestion-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const item = btn.closest('.suggestion-item');
                const germanWord = item.dataset.german;
                const persianWord = item.dataset.persian;
                
                const input = document.getElementById('translate-input');
                if (input) {
                    input.value = this.translateDirection === 'de-fa' ? germanWord : persianWord;
                    this.performAutoTranslation(input.value);
                }
            };
        });
        
    } catch (error) {
        console.error('Error showing suggestions:', error);
        if (suggestionsContainer) suggestionsContainer.style.display = 'none';
    }
}

    async searchInDatabase(text, language) {
        try {
            const words = await this.getAllWords();
            const searchText = text.toLowerCase().trim();
            
            if (language === 'german') {
                const foundWord = words.find(word => 
                    word.german.toLowerCase() === searchText ||
                    word.german.toLowerCase().startsWith(searchText) ||
                    word.german.toLowerCase().includes(searchText)
                );
                return foundWord ? foundWord.persian : null;
            } else {
                const foundWord = words.find(word => 
                    word.persian.toLowerCase() === searchText ||
                    word.persian.toLowerCase().includes(searchText) ||
                    word.persian.toLowerCase().startsWith(searchText)
                );
                return foundWord ? foundWord.german : null;
            }
        } catch (error) {
            console.error('Error in searchInDatabase:', error);
            return null;
        }
    }


    async translateWithGoogle(text, source, target) {
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const data = await response.json();
            return data[0][0][0] || null;
        } catch (error) {
            console.log('Google Translate failed');
            return null;
        }
    }

 
    

   
    async showSuggestions(text) {
        const suggestionsDiv = document.getElementById('suggestions-list');
        const suggestionsContainer = document.getElementById('translate-suggestions');
        
        if (!text || text.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        try {
            const words = await this.getAllWords();
            const searchText = text.toLowerCase();
            
            const suggestions = words
                .filter(word => 
                    word.german.toLowerCase().startsWith(searchText) ||
                    word.german.toLowerCase().includes(searchText) ||
                    word.persian.toLowerCase().includes(searchText)
                )
                .slice(0, 5);
            
            if (suggestions.length === 0) {
                suggestionsContainer.style.display = 'none';
                return;
            }
            
            suggestionsContainer.style.display = 'block';
            
            suggestionsDiv.innerHTML = suggestions.map(word => `
                <div class="suggestion-item" data-german="${word.german}">
                    <div class="suggestion-content">
                        <div class="suggestion-german">${word.german}</div>
                        <div class="suggestion-persian">${word.persian}</div>
                        ${word.gender ? `<span class="word-gender-badge ${word.gender}">${this.getGenderSymbol(word.gender)}</span>` : ''}
                        ${word.type ? `<span class="word-type-badge">${this.getTypeLabel(word.type)}</span>` : ''}
                    </div>
                    <button class="use-suggestion-btn">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            `).join('');
            
            document.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (!e.target.closest('.use-suggestion-btn')) {
                        const germanWord = item.dataset.german;
                        document.getElementById('translate-input').value = germanWord;
                        this.performAutoTranslation(germanWord);
                    }
                });
            });
            
            document.querySelectorAll('.use-suggestion-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const germanWord = btn.closest('.suggestion-item').dataset.german;
                    document.getElementById('translate-input').value = germanWord;
                    this.performAutoTranslation(germanWord);
                });
            });
            
        } catch (error) {
            console.error('Error showing suggestions:', error);
            suggestionsContainer.style.display = 'none';
        }
    }

    async saveTranslationWithAutoAnalysis() {
        const inputText = document.getElementById('translate-input').value.trim();
        const resultDiv = document.getElementById('translate-result');
        
        if (!inputText) {
            this.showToast('✏️ لطفاً متنی را ترجمه کنید', 'warning');
            return;
        }
        
        let translationText = '';
        const resultElements = resultDiv.querySelectorAll('p');
        
        for (const element of resultElements) {
            const text = element.textContent.trim();
            if (text && 
                !text.includes('نتیجه ترجمه') && 
                !text.includes('متن را وارد کنید') && 
                !text.includes('در حال ترجمه') &&
                text !== inputText) {
                translationText = text;
                break;
            }
        }
        
        if (!translationText) {
            this.showToast('❌ ترجمه‌ای برای ذخیره وجود ندارد', 'error');
            return;
        }
        
        let german, persian;
        if (this.translateDirection === 'de-fa') {
            german = inputText;
            persian = translationText;
        } else {
            german = translationText;
            persian = inputText;
        }
        
        german = german.replace(/["']/g, '').replace(/\s+/g, ' ').trim();
        persian = persian.replace(/["']/g, '').replace(/\s+/g, ' ').trim();
        
        const analysis = await this.autoDetectWordInfo(german);
        this.showSaveFormWithAnalysis(german, persian, analysis);
    }

    async autoDetectWordInfo(germanWord) {
        const word = germanWord.toLowerCase().trim();
        
        let type = 'other';
        let gender = null;
        
        // تشخیص اسم و جنسیت
        const genderPatterns = {
            masculine: [
                /(ling|ich|ig|ner|ismus|or|ant|ent|ist)$/,
                /^(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)$/,
                /^(frühling|sommer|herbst|winter)$/,
                /^(norden|süden|osten|westen)$/
            ],
            feminine: [
                /(ung|heit|keit|schaft|ion|tät|ik|ur|ei|enz|anz|ade|age|isse|itis|ive|sis)$/,
                /^(eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn)$/,
                /maschine$/
            ],
            neuter: [
                /(chen|lein|ment|tum|um|ma|nis|sal|tel|in|icht|sel)$/,
                /^(gold|silber|eisen|kupfer|blei)$/
            ]
        };
        
        const isNoun = /^[A-ZÄÖÜ][a-zäöüß]+$/.test(germanWord) || 
                      germanWord.includes(' ') || 
                      /(ung|heit|keit|schaft|ling|chen|lein|tum|nis|sal|ment)$/.test(word);
        
        if (isNoun) {
            type = 'noun';
            
            for (const [gen, patterns] of Object.entries(genderPatterns)) {
                for (const pattern of patterns) {
                    if (pattern.test(word)) {
                        gender = gen;
                        break;
                    }
                }
                if (gender) break;
            }
        } else if (/(en|ern|eln|ieren|isieren|ifizieren)$/.test(word)) {
            type = 'verb';
        } else if (/(ig|isch|lich|bar|sam|haft|los|voll|mäßig|artig)$/.test(word)) {
            type = 'adjective';
        }
        
        return { type, gender };
    }

  // ========== اصلاح تابع showSaveFormWithAnalysis ==========

showSaveFormWithAnalysis(german, persian, analysis) {
    const { type, gender } = analysis;
    
    document.getElementById('add-word-section').innerHTML = `
        <div class="word-card">
            <div class="section-header">
                <h2><i class="fas fa-magic" style="color: var(--primary);"></i> ذخیره هوشمند ترجمه</h2>
            </div>
            
            <div class="auto-analysis-banner">
                <i class="fas fa-robot"></i>
                <span>تحلیل خودکار انجام شد: <strong>${this.getTypeLabel(type)}</strong>
                ${gender ? ` - <strong>${this.getGenderLabel(gender)}</strong>` : ''}</span>
            </div>
            
            <div class="form-group">
                <label for="save-german-word">لغت آلمانی:</label>
                <input type="text" id="save-german-word" class="form-control" value="${german}">
            </div>
            
            <div class="form-group">
                <label for="save-persian-meaning">معنی فارسی:</label>
                <input type="text" id="save-persian-meaning" class="form-control" value="${persian}">
            </div>
            
            <div class="form-group">
                <label for="save-word-type">نوع کلمه:</label>
                <select id="save-word-type" class="form-control">
                    <option value="noun" ${type === 'noun' ? 'selected' : ''}>📘 اسم</option>
                    <option value="verb" ${type === 'verb' ? 'selected' : ''}>⚡ فعل</option>
                    <option value="adjective" ${type === 'adjective' ? 'selected' : ''}>✨ صفت</option>
                    <option value="adverb" ${type === 'adverb' ? 'selected' : ''}>📌 قید</option>
                    <option value="other" ${type === 'other' ? 'selected' : ''}>🔹 سایر</option>
                </select>
            </div>
            
            <div class="form-group" id="save-gender-section" style="display: ${type === 'noun' ? 'block' : 'none'}">
                <label>جنسیت:</label>
                <div class="gender-options">
                    <button type="button" class="gender-btn masculine ${gender === 'masculine' ? 'active' : ''}" 
                            data-gender="masculine">مذکر (der)</button>
                    <button type="button" class="gender-btn feminine ${gender === 'feminine' ? 'active' : ''}" 
                            data-gender="feminine">مونث (die)</button>
                    <button type="button" class="gender-btn neuter ${gender === 'neuter' ? 'active' : ''}" 
                            data-gender="neuter">خنثی (das)</button>
                    <button type="button" class="gender-btn none ${!gender ? 'active' : ''}" 
                            data-gender="none">بدون جنسیت</button>
                </div>
            </div>
            
            <div id="save-verb-section" style="display: ${type === 'verb' ? 'block' : 'none'}">
                <div class="form-group">
                    <label><i class="fas fa-table"></i> صرف فعل (پیشنهاد هوشمند):</label>
                    <div class="verb-form-row">
                        <div class="verb-form-item">
                            <span class="verb-form-label">حال ساده</span>
                            <input type="text" id="save-verb-present" class="form-control" 
                                   value="${this.suggestVerbConjugation(german).present}">
                        </div>
                        <div class="verb-form-item">
                            <span class="verb-form-label">گذشته ساده</span>
                            <input type="text" id="save-verb-past" class="form-control" 
                                   value="${this.suggestVerbConjugation(german).past}">
                        </div>
                        <div class="verb-form-item">
                            <span class="verb-form-label">گذشته کامل</span>
                            <input type="text" id="save-verb-perfect" class="form-control" 
                                   value="${this.suggestVerbConjugation(german).perfect}">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons mt-4">
                <button class="btn btn-primary btn-lg" id="save-analyzed-word-btn">
                    <i class="fas fa-save"></i> ذخیره نهایی
                </button>
                <button class="btn btn-outline" id="cancel-save-analyzed-btn">
                    <i class="fas fa-times"></i> انصراف
                </button>
            </div>
        </div>
    `;
    
    this.setupSaveAnalyzedFormEvents();
    this.showSection('add-word-section');
}

// ========== اصلاح تابع setupSaveAnalyzedFormEvents ==========

setupSaveAnalyzedFormEvents() {
    document.getElementById('save-word-type').addEventListener('change', (e) => {
        const type = e.target.value;
        const genderSection = document.getElementById('save-gender-section');
        const verbSection = document.getElementById('save-verb-section');
        
        if (genderSection) genderSection.style.display = type === 'noun' ? 'block' : 'none';
        if (verbSection) verbSection.style.display = type === 'verb' ? 'block' : 'none';
    });
    
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    document.getElementById('save-analyzed-word-btn').addEventListener('click', async () => {
        const german = document.getElementById('save-german-word').value.trim();
        const persian = document.getElementById('save-persian-meaning').value.trim();
        const type = document.getElementById('save-word-type').value;
        
        if (!german || !persian) {
            this.showToast('❌ لطفاً هر دو فیلد را پر کنید', 'error');
            return;
        }
        
        const wordData = {
            german,
            persian,
            type,
            createdAt: new Date().toISOString()
        };
        
        if (type === 'noun') {
            const activeGender = document.querySelector('.gender-btn.active');
            if (activeGender && activeGender.dataset.gender !== 'none') {
                wordData.gender = activeGender.dataset.gender;
            }
        }
        
        if (type === 'verb') {
            const present = document.getElementById('save-verb-present')?.value.trim() || german;
            const past = document.getElementById('save-verb-past')?.value.trim() || '';
            const perfect = document.getElementById('save-verb-perfect')?.value.trim() || '';
            
            wordData.verbForms = { present, past, perfect };
        }
        
        try {
            await this.addWord(wordData);
            this.showToast('✅ لغت با تحلیل خودکار ذخیره شد', 'success');
            
            // ========== برگشت فوری به مترجم ==========
            this.returnToTranslateImmediately();
            
        } catch (error) {
            this.showToast('❌ خطا در ذخیره لغت', 'error');
        }
    });
    
    document.getElementById('cancel-save-analyzed-btn').addEventListener('click', () => {
        // ========== برگشت فوری به مترجم ==========
        this.returnToTranslateImmediately();
    });
}
returnToTranslateImmediately() {
    console.log('🔄 برگشت به مترجم...');
    
    // پاک کردن کامل بخش افزودن لغت
    const addWordEl = document.getElementById('add-word-section');
    if (addWordEl) addWordEl.innerHTML = '';
    
    // پاک کردن کامل بخش مترجم
    const translateEl = document.getElementById('translate-section');
    if (translateEl) translateEl.innerHTML = '';
    
    // رندر مجدد مترجم
    this.renderTranslate();
    
    // فعال کردن بخش مترجم
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('translate-section').classList.add('active');
    
    // پاک کردن input
    const input = document.getElementById('translate-input');
    if (input) input.value = '';
    
    console.log('✅ برگشت به مترجم انجام شد');
}
    suggestVerbConjugation(verb) {
        const conjugations = {
            present: verb,
            past: '',
            perfect: ''
        };
        
        if (verb.endsWith('en')) {
            const stem = verb.slice(0, -2);
            conjugations.past = stem + 'te';
            conjugations.perfect = 'ge' + stem + 't';
            
            const irregularVerbs = {
                'sein': { past: 'war', perfect: 'gewesen' },
                'haben': { past: 'hatte', perfect: 'gehabt' },
                'werden': { past: 'wurde', perfect: 'geworden' },
                'können': { past: 'konnte', perfect: 'gekonnt' },
                'müssen': { past: 'musste', perfect: 'gemusst' },
                'dürfen': { past: 'durfte', perfect: 'gedurft' },
                'sollen': { past: 'sollte', perfect: 'gesollt' },
                'wollen': { past: 'wollte', perfect: 'gewollt' },
                'mögen': { past: 'mochte', perfect: 'gemocht' },
                'gehen': { past: 'ging', perfect: 'gegangen' },
                'kommen': { past: 'kam', perfect: 'gekommen' },
                'sehen': { past: 'sah', perfect: 'gesehen' },
                'sprechen': { past: 'sprach', perfect: 'gesprochen' },
                'lesen': { past: 'las', perfect: 'gelesen' },
                'essen': { past: 'aß', perfect: 'gegessen' },
                'trinken': { past: 'trank', perfect: 'getrunken' },
                'schlafen': { past: 'schlief', perfect: 'geschlafen' }
            };
            
            if (irregularVerbs[verb]) {
                conjugations.past = irregularVerbs[verb].past;
                conjugations.perfect = irregularVerbs[verb].perfect;
            }
        }
        
        return conjugations;
    }


async recordPractice(wordId, correct) {
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
}

// تابع جدید برای محاسبه SRS
updateSRS(wordId, correct) {
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
}

    async getPracticeHistory(wordId) {
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
    }
async getAllPracticeHistory() {
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
}
   // ================================================
// آمار و پیشرفت - نسخه کامل و زیبا
// ================================================
async updateStats() {
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
}

renderWeeklyProgress(practiceHistory) {
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
}
setupCustomStats() {
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
}
async startWordOrderPractice() {
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
}
showWordOrderQuestion() {
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
}

setupWordOrderEvents() {
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
}

showWordOrderResults() {
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
}
async loadCustomStats(startDate, endDate) {
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
}


async renderWordListWithSort(filter = 'all', sortBy = 'alphabetical') {
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
}
renderCustomStats(stats) {
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
}
async renderCustomActivityList(practiceHistory, newWords) {
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
}

// ================================================
// دستاوردها
// ================================================

renderAchievements(totalWords, totalPractice, accuracy) {
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
}
// ================================================
// فعالیت اخیر - رفع مشکل [object Promise]
// ================================================

async renderRecentActivity(practiceHistory) {
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
}

// ================================================
// فرمت تاریخ به شمسی
// ================================================

formatPersianDate(isoDate) {
    const date = new Date(isoDate);
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('fa-IR', options);
}
    // ================================================
    // مدیریت تنظیمات و شخصی‌سازی
    // ================================================

   // ================================================
// تنظیمات کامل برنامه - با پوسته‌های رنگی
// ================================================
renderSettings() {
   
const currentApiKey = this.getGroqApiKey ? this.getGroqApiKey() : '';


    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    const theme = localStorage.getItem('theme') || 'default';
    const iconStyle = localStorage.getItem('iconStyle') || 'default';
    const layout = localStorage.getItem('layout') || 'default';
    const isGerman = LanguageSystem.isGerman();
    // اضافه کردن مودال قفل (فقط یک بار)
if (!document.getElementById('lock-modal')) {
    const modalHTML = `
        <div id="lock-modal" class="modal-overlay" style="display: none; z-index: 999999;">
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3><i class="fas fa-lock"></i> ${isGerman ? 'ورود به دیکشنری' : 'Dictionary Unlock'}</h3>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <i class="fas fa-graduation-cap" style="font-size: 50px; color: var(--primary);"></i>
                        <p style="margin-top: 10px;">${isGerman ? 'لطفاً رمز عبور را وارد کنید' : 'Please enter the password'}</p>
                    </div>
                    <input type="password" id="unlock-password" class="form-control" placeholder="${isGerman ? 'رمز عبور...' : 'Password...'}" style="text-align: center; font-size: 18px; padding: 12px;">
                    <div id="unlock-error" style="color: #ef4444; text-align: center; margin-top: 10px; display: none;"></div>
                </div>
                <div class="modal-footer">
                    <button id="unlock-btn" class="btn btn-primary btn-block" style="width: 100%;">
                        <i class="fas fa-unlock-alt"></i> ${isGerman ? 'ورود' : 'Unlock'}
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}
    const container = document.getElementById('settings-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="word-card">
            <!-- ========== هدر ========== -->
            <div class="section-header">
                <h2><i class="fas fa-cog"></i> ${LanguageSystem.t('settings.title')}</h2>
            </div>
            
            <!-- ========== ظاهر برنامه ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-palette"></i> ${LanguageSystem.t('settings.appearance')}</h3>
                
              <div class="settings-grid">
    <!-- حالت تاریک -->
    <div class="setting-item">
        <label class="setting-label">
            <i class="fas fa-moon"></i>
            <span>${LanguageSystem.t('settings.darkMode')}</span>
        </label>
        <button id="dark-mode-toggle-btn" class="dark-mode-btn ${isDarkMode ? 'active' : ''}">
            <i class="fas ${isDarkMode ? 'fa-moon' : 'fa-sun'}"></i>
            <span>${isDarkMode ? 'تاریک' : 'روشن'}</span>
        </button>
    </div>
    
    <!-- اندازه فونت -->
   <!-- اندازه فونت -->
<div class="setting-item">
    <label class="setting-label">
        <i class="fas fa-text-height"></i>
        <span>${LanguageSystem.t('settings.fontSize')}</span>
    </label>
    <div class="font-size-buttons">
        <button class="font-size-option ${fontSize === 'small' ? 'active' : ''}" data-size="small">کوچک</button>
        <button class="font-size-option ${fontSize === 'medium' ? 'active' : ''}" data-size="medium">متوسط</button>
        <button class="font-size-option ${fontSize === 'large' ? 'active' : ''}" data-size="large">بزرگ</button>
        <button class="font-size-option ${fontSize === 'xlarge' ? 'active' : ''}" data-size="xlarge">بسیار بزرگ</button>
        <button class="font-size-option ${fontSize === 'xxlarge' ? 'active' : ''}" data-size="xxlarge">فوقالعاده بزرگ</button>
    </div>
</div>
</div>
            
            <!-- ========== پوسته‌های رنگی ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-swatchbook"></i> ${LanguageSystem.t('settings.themes')}</h3>
                
                <div class="theme-selector">
                    <!-- پیش‌فرض -->
                    <div class="theme-option ${theme === 'default' ? 'active' : ''}" data-theme="default">
                        <div class="theme-preview default-theme"></div>
                        <span>${LanguageSystem.t('settings.default')}</span>
                        <small class="theme-colors">${isGerman ? 'آبی - بنفش' : 'Blue - Purple'}</small>
                    </div>
                    
                    <!-- آبی -->
                    <div class="theme-option ${theme === 'blue' ? 'active' : ''}" data-theme="blue">
                        <div class="theme-preview blue-theme"></div>
                        <span>${LanguageSystem.t('settings.blue')}</span>
                        <small class="theme-colors">${isGerman ? 'آبی آسمانی - آبی نفتی' : 'Sky Blue - Navy'}</small>
                    </div>
                    
                    <!-- سبز -->
                    <div class="theme-option ${theme === 'green' ? 'active' : ''}" data-theme="green">
                        <div class="theme-preview green-theme"></div>
                        <span>${LanguageSystem.t('settings.green')}</span>
                        <small class="theme-colors">${isGerman ? 'سبز زمردی - سبز جنگلی' : 'Emerald - Forest'}</small>
                    </div>
                    
                    <!-- بنفش -->
                    <div class="theme-option ${theme === 'purple' ? 'active' : ''}" data-theme="purple">
                        <div class="theme-preview purple-theme"></div>
                        <span>${LanguageSystem.t('settings.purple')}</span>
                        <small class="theme-colors">${isGerman ? 'بنفش - ارغوانی' : 'Purple - Violet'}</small>
                    </div>
                    
                    <!-- نارنجی -->
                    <div class="theme-option ${theme === 'orange' ? 'active' : ''}" data-theme="orange">
                        <div class="theme-preview orange-theme"></div>
                        <span>${LanguageSystem.t('settings.orange')}</span>
                        <small class="theme-colors">${isGerman ? 'نارنجی - نارنجی تیره' : 'Orange - Dark Orange'}</small>
                    </div>
                    
                    <!-- صورتی -->
                    <div class="theme-option ${theme === 'pink' ? 'active' : ''}" data-theme="pink">
                        <div class="theme-preview pink-theme"></div>
                        <span>${LanguageSystem.t('settings.pink')}</span>
                        <small class="theme-colors">${isGerman ? 'صورتی - رز' : 'Pink - Rose'}</small>
                    </div>
                </div>
            </div>
            
            <!-- ========== تنظیمات زبان آموزشی ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-language"></i> ${LanguageSystem.t('settings.language')}</h3>
                
                <div class="language-buttons">
                    <button class="lang-btn ${LanguageSystem.isGerman() ? 'active' : ''}" 
                            onclick="switchLanguage('de')">
                        <span class="lang-flag">PE</span>
                        <span class="lang-text">${LanguageSystem.t('settings.german')}</span>
                    </button>
                    
                    <button class="lang-btn ${LanguageSystem.isEnglish() ? 'active' : ''}" 
                            onclick="switchLanguage('en')">
                        <span class="lang-flag">🇬🇧</span>
                        <span class="lang-text">${LanguageSystem.t('settings.english')}</span>
                    </button>
                </div>
            </div>
            
       
            
            <!-- ========== مدیریت موسیقی ========== -->
<div class="settings-group">
    <h3><i class="fas fa-music"></i> ${isGerman ? 'مدیریت موسیقی' : 'Music Management'}</h3>
    
    <!-- پلیر پیشرفته -->
    <div class="advanced-player" style="background: linear-gradient(135deg, var(--primary-light), var(--gray-50)); border-radius: 20px; padding: 20px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
            <div class="player-album-art" style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-headphones" style="font-size: 28px; color: white;"></i>
            </div>
            <div style="flex: 1; min-width: 150px;">
                <div id="player-track-name" style="font-weight: 700; font-size: 14px; margin-bottom: 5px;">هیچ آهنگی در حال پخش نیست</div>
                <div id="player-track-artist" style="font-size: 12px; color: var(--gray-500);">Elias.Dictionary</div>
            </div>
            <div class="player-controls" style="display: flex; gap: 12px;">
                <button id="player-prev-btn" class="player-icon-btn" title="قبلی">
                    <i class="fas fa-backward"></i>
                </button>
                <button id="player-play-pause-btn" class="player-icon-btn play-pause" title="پخش/توقف" style="background: var(--primary); width: 45px; height: 45px; border-radius: 50%;">
                    <i class="fas fa-play"></i>
                </button>
                <button id="player-next-btn" class="player-icon-btn" title="بعدی">
                    <i class="fas fa-forward"></i>
                </button>
                <button id="player-stop-btn" class="player-icon-btn" title="توقف">
                    <i class="fas fa-stop"></i>
                </button>
            </div>
        </div>
        
        <!-- نوار پیشرفت -->
        <div style="margin-top: 15px;">
            <div class="progress-bar-container" style="display: flex; align-items: center; gap: 10px;">
                <span id="current-time-display" style="font-size: 11px; min-width: 40px;">00:00</span>
                <div id="progress-bar" style="flex: 1; height: 4px; background: var(--gray-300); border-radius: 2px; cursor: pointer; position: relative;">
                    <div id="progress-fill" style="width: 0%; height: 100%; background: var(--primary); border-radius: 2px;"></div>
                </div>
                <span id="total-time-display" style="font-size: 11px; min-width: 40px;">00:00</span>
            </div>
        </div>
        
        <!-- کنترل صدا -->
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 12px;">
        <i class="fas fa-volume-up" style="font-size: 12px; color: var(--gray-500);"></i>
            <input type="range" id="player-volume-slider" min="0" max="100" value="50" style="flex: 1; height: 3px;">
            <i class="fas fa-volume-down" style="font-size: 12px; color: var(--gray-500);"></i>
            <span id="volume-percent" style="font-size: 11px; min-width: 35px;">50%</span>
        </div>
    </div>
    
    <div class="upload-area" id="music-upload-area">
        <i class="fas fa-cloud-upload-alt"></i>
        <h4>${isGerman ? 'آپلود موسیقی و کاور' : 'Upload Music & Cover'}</h4>
        <p>${isGerman ? 'فایل‌های صوتی را اینجا رها کنید یا کلیک کنید' : 'Drop audio files here or click'}</p>
        <small>${isGerman ? 'پشتیبانی از MP3, WAV, OGG' : 'Supports MP3, WAV, OGG'}</small>
        <input type="file" id="music-upload" accept="audio/*,image/*" multiple style="display: none;">
    </div>
    
    <div id="uploaded-music-list" class="music-list mt-4"></div>
    
    <div class="form-group mt-4">
        <label for="background-music">${isGerman ? 'موسیقی زمینه:' : 'Background Music:'}</label>
        <select id="background-music" class="form-control">
            <option value="none">${isGerman ? 'بدون موسیقی' : 'No Music'}</option>
            <option value="uploaded">🎵 ${isGerman ? 'موسیقی آپلود شده' : 'Uploaded Music'}</option>
            <option value="calm">🌊 ${isGerman ? 'آرامش بخش' : 'Calm'}</option>
            <option value="focus">🎯 ${isGerman ? 'تمرکز' : 'Focus'}</option>
            <option value="classical">🎻 ${isGerman ? 'کلاسیک' : 'Classical'}</option>
        </select>
    </div>
</div>
            
       <!-- ========== مدیریت داده‌ها ========== -->
<div class="settings-group">
    <h3><i class="fas fa-database"></i> ${isGerman ? 'مدیریت داده‌ها' : 'Data Management'}</h3>
    
    <div class="action-buttons">
        <button class="btn btn-outline" id="export-data-btn">
            <i class="fas fa-download"></i> ${isGerman ? 'صدور داده‌ها' : 'Export Data'}
        </button>
        <button class="btn btn-outline" id="import-data-btn">
            <i class="fas fa-upload"></i> ${isGerman ? 'ورود داده‌ها' : 'Import Data'}
        </button>
        <button class="btn btn-outline" id="export-german-words-btn">
            <i class="fas fa-file-alt"></i> ${isGerman ? 'ذخیره لغات' : 'Save Words'}
        </button>
        <button class="btn btn-outline" id="export-words-to-image-btn">
            <i class="fas fa-images"></i> ${isGerman ? 'خروجی تصویری لغات' : 'Export Words to Image'}
        </button>
        <button class="btn btn-danger" id="reset-data-btn">
            <i class="fas fa-trash"></i> ${isGerman ? 'بازنشانی برنامه' : 'Reset App'}
        </button>

    </div>
</div>
 

    <div class="settings-group">
        <h3><i class="fas fa-lock"></i> ${isGerman ? 'قفل دیکشنری' : 'Dictionary Lock'}</h3>
        
        <div id="password-status" class="password-status" style="margin-bottom: 15px;">
            <span id="lock-status-text">${isGerman ? 'قفل غیرفعال است' : 'Lock is disabled'}</span>
        </div>
        
        <div class="password-section">
            <div class="form-group">
                <label for="set-password">${isGerman ? 'رمز عبور جدید:' : 'New Password:'}</label>
                <input type="password" id="set-password" class="form-control" placeholder="${isGerman ? 'رمز عبور را وارد کنید...' : 'Enter password...'}">
            </div>
            <div class="form-group">
                <label for="confirm-password">${isGerman ? 'تکرار رمز عبور:' : 'Confirm Password:'}</label>
                <input type="password" id="confirm-password" class="form-control" placeholder="${isGerman ? 'رمز عبور را تکرار کنید...' : 'Confirm password...'}">
            </div>
            <div class="action-buttons" style="display: flex; gap: 10px;">
                <button id="save-password-btn" class="btn btn-primary">
                    <i class="fas fa-save"></i> ${isGerman ? 'ذخیره رمز' : 'Save Password'}
                </button>
                <button id="remove-password-btn" class="btn btn-danger">
                    <i class="fas fa-trash"></i> ${isGerman ? 'حذف رمز' : 'Remove Password'}
                </button>
            </div>
        </div>
    </div>

      <!-- ========== پاک کردن کش و به‌روزرسانی ========== -->
<div class="settings-group" style="background: var(--gray-50); border-radius: 20px; padding: 25px; margin-bottom: 25px;">
    <h3 style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; color: var(--gray-800);">
        <i class="fas fa-broom" style="color: #f59e0b; font-size: 22px;"></i>
        <span style="font-size: 18px; font-weight: 700;">${isGerman ? 'پاکسازی کش' : 'Clear Cache'}</span>
    </h3>
    
    <div style="
        background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05));
        border-radius: 20px;
        padding: 20px;
        border: 1px solid rgba(245,158,11,0.25);
        transition: all 0.3s ease;
    ">
        <div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap;">
            <div style="
                width: 55px;
                height: 55px;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border-radius: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 6px 15px rgba(245,158,11,0.35);
                flex-shrink: 0;
            ">
                <i class="fas fa-broom" style="font-size: 26px; color: white;"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 16px; margin-bottom: 5px; color: var(--gray-800);">
                    ${isGerman ? 'پاکسازی کش و به‌روزرسانی' : 'Clear Cache & Refresh'}
                </div>
                <div style="font-size: 12px; color: var(--gray-500); line-height: 1.5;">
                    ${isGerman ? 'رفع مشکلات نمایشی و اعمال آخرین تغییرات' : 'Fix display issues & apply latest changes'}
                </div>
            </div>
            <button id="clear-cache-btn" style="
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border: none;
                border-radius: 40px;
                padding: 10px 24px;
                color: white;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 12px rgba(245,158,11,0.35);
                flex-shrink: 0;
            ">
                <i class="fas fa-sync-alt"></i>
                <span>${isGerman ? 'پاکسازی' : 'Clear'}</span>
            </button>
        </div>
        
        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(245,158,11,0.2); font-size: 11px; color: var(--gray-500); display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-info-circle" style="color: #f59e0b; font-size: 12px;"></i>
            <span>${isGerman ? 'پس از پاکسازی، صفحه مجدداً بارگذاری می‌شود' : 'Page will reload after clearing'}</span>
        </div>
    </div>
</div>

            <!-- ========== درباره برنامه ========== -->
            <div class="settings-group">
                <h3><i class="fas fa-info-circle"></i> ${LanguageSystem.t('settings.about')}</h3>
                
                <div class="about-card">
                    <div class="about-logo">
                        <i class="fas fa-graduation-cap"></i>
                        <h4>Elias.Dictionary</h4>
                    </div>
                    <p>${isGerman ? 'نسخه ۳.۰.۰ | دیکشنری هوشمند آلمانی-فارسی' : 'Version 3.0.0 | Smart German-Persian Dictionary'}</p>
                    <p>${isGerman ? 'طراحی و توسعه توسط Elias Hussaini' : 'Designed and developed by Elias Hussaini'}</p>
                    <div class="social-links">
                        <a href="#" class="social-link"><i class="fab fa-github"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-telegram"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // استایل دکمه‌های زبان
    const style = document.createElement('style');
    style.textContent = `
        .language-buttons {
            display: flex;
            gap: 15px;
            margin-top: 15px;
        }
        
        .lang-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 20px;
            background: white;
            border: 2px solid var(--gray-200);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Vazirmatn', sans-serif;
        }
        
        .lang-btn:hover {
            transform: translateY(-2px);
            border-color: var(--primary);
            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.1);
        }
        
        .lang-btn.active {
            border-color: var(--primary);
            background: var(--primary-light);
        }
        
        .lang-flag {
            font-size: 24px;
        }
        
        .lang-text {
            font-size: 16px;
            font-weight: 600;
            color: var(--gray-800);
        }
        
        .dark-mode .lang-btn {
            background: var(--bg-card);
            border-color: var(--border-primary);
        }
        
        .dark-mode .lang-text {
            color: var(--text-primary);
        }
        
        @media (max-width: 768px) {
            .language-buttons {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
   

    // ========== راه‌اندازی event listenerها ==========
    this.setupSettingsEventListeners();
    this.setupColorPickerEventListeners();
    this.setupMusicUploadEventListeners();
    this.renderUploadedMusicList();
    this.setupPasswordLock();
    this.setupMusicControls();
     
}

// ================================================
// event listenerهای تنظیمات
// ================================================

setupSettingsEventListeners() {

// ========== پاک کردن کش Service Worker ==========
const clearCacheBtn = document.getElementById('clear-cache-btn');
if (clearCacheBtn) {
    const newBtn = clearCacheBtn.cloneNode(true);
    clearCacheBtn.parentNode.replaceChild(newBtn, clearCacheBtn);
    
    newBtn.onclick = async () => {
        if (confirm('⚠️ آیا از پاک کردن کش و به‌روزرسانی برنامه مطمئن هستید؟')) {
            const originalHtml = newBtn.innerHTML;
            newBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i><span>در حال...</span>';
            newBtn.disabled = true;
            newBtn.style.opacity = '0.7';
            
            try {
                if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(key => caches.delete(key)));
                }
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(registrations.map(reg => reg.unregister()));
                }
                setTimeout(() => window.location.reload(true), 500);
            } catch (error) {
                newBtn.innerHTML = originalHtml;
                newBtn.disabled = false;
                newBtn.style.opacity = '1';
                alert('❌ خطا در پاک کردن کش');
            }
        }
    };
}
    // ========== دکمه حالت تاریک ==========
    const darkModeBtn = document.getElementById('dark-mode-toggle-btn');
    if (darkModeBtn) {
        darkModeBtn.onclick = () => {
            const isDark = document.body.classList.contains('dark-mode');
            if (isDark) {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
                darkModeBtn.innerHTML = '<i class="fas fa-sun"></i><span>روشن</span>';
                darkModeBtn.classList.remove('active');
            } else {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
                darkModeBtn.innerHTML = '<i class="fas fa-moon"></i><span>تاریک</span>';
                darkModeBtn.classList.add('active');
            }
            this.showToast(isDark ? '☀️ حالت روشن فعال شد' : '🌙 حالت تاریک فعال شد', 'success');
        };
    }
    
  const fontOptions = document.querySelectorAll('.font-size-option');
    fontOptions.forEach(btn => {
        btn.onclick = () => {
            const size = btn.dataset.size;
            localStorage.setItem('fontSize', size);
            
            fontOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // اعمال فونت با کلاس روی body
            document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge', 'font-xxlarge');
            document.body.classList.add(`font-${size}`);
            
            // اعمال مستقیم روی html و body
            const fontSizeMap = {
                small: '14px',
                medium: '16px',
                large: '18px',
                xlarge: '20px',
                xxlarge: '22px'
            };
            const newSize = fontSizeMap[size];
            
            document.documentElement.style.fontSize = newSize;
            document.body.style.fontSize = newSize;
            
            // اعمال روی همه المان‌ها با استفاده از CSS inherit
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                if (el.style.fontSize) {
                    el.style.fontSize = '';
                }
            });
            
            this.showToast(`✅ اندازه فونت به ${btn.textContent} تغییر کرد`, 'success');
        };
    });
    // ========== پوسته‌های رنگی ==========
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const theme = e.currentTarget.dataset.theme;
            this.applyTheme(theme);
        });
    });
    // دکمه خروجی تصویری لغات
document.getElementById('export-words-to-image-btn')?.addEventListener('click', () => {
    this.showExportWordsModal();
});

    // ========== مدیریت داده‌ها ==========
    document.getElementById('export-data-btn')?.addEventListener('click', () => {
        this.exportData();
    });
    
    document.getElementById('import-data-btn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => this.importData(e.target.files[0]);
        input.click();
    });
    
    document.getElementById('export-german-words-btn')?.addEventListener('click', () => {
        this.exportGermanWordsToTxt();
    });
    
    document.getElementById('reset-data-btn')?.addEventListener('click', () => {
        if (confirm('⚠️ آیا مطمئن هستید؟ تمام داده‌های برنامه حذف خواهند شد و قابل بازگشت نیست!')) {
            this.resetData();
        }
    });
    // ========== مدیریت چندین API Key ==========
const renderApiKeysList = () => {
    const container = document.getElementById('api-keys-list-container');
    if (!container) return;
    
    const keys = this.apiKeyManager?.getAllKeys() || [];
    const currentKey = this.apiKeyManager?.getCurrentKey();
    const isGerman = LanguageSystem.isGerman();
    
    if (keys.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 30px;">
                <i class="fas fa-key" style="font-size: 40px; color: var(--gray-400);"></i>
                <p style="margin-top: 10px;">${isGerman ? 'هیچ کلید API اضافه نشده است' : 'No API keys added'}</p>
                <small>${isGerman ? 'با افزودن کلید، هوش مصنوعی فعال می‌شود' : 'Add an API key to enable AI'}</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = keys.map((key, idx) => {
        const isCurrent = currentKey && currentKey.key === key.key;
        const keyPreview = key.key.substring(0, 15) + '...' + key.key.substring(key.key.length - 8);
        const addedDate = new Date(key.addedAt).toLocaleDateString('fa-IR');
        
        let statusClass = '';
        let statusText = '';
        let statusColor = '';
        
        if (!key.isActive) {
            statusClass = 'disabled';
            statusText = isGerman ? '❌ غیرفعال' : 'Disabled';
            statusColor = '#ef4444';
        } else if (isCurrent) {
            statusClass = 'active';
            statusText = isGerman ? '✅ فعال' : 'Active';
            statusColor = '#10b981';
        } else {
            statusClass = 'standby';
            statusText = isGerman ? '⏳ آماده' : 'Standby';
            statusColor = '#f59e0b';
        }
        
        const quotaText = key.remainingQuota !== null ? ` - ${key.remainingQuota} ${isGerman ? 'درخواست باقیمانده' : 'requests left'}` : '';
        
        return `
            <div class="api-key-item" data-index="${idx}" style="
                background: var(--white);
                border: 1px solid var(--gray-200);
                border-radius: 12px;
                padding: 12px 15px;
                margin-bottom: 10px;
                transition: all 0.2s ease;
                ${isCurrent ? 'border-right: 3px solid #10b981;' : ''}
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <strong style="font-size: 14px;">${this.escapeHtml(key.name)}</strong>
                            <code style="font-size: 11px; background: var(--gray-100); padding: 2px 6px; border-radius: 6px;">${keyPreview}</code>
                            <span style="font-size: 11px; color: ${statusColor};">${statusText}</span>
                            ${key.remainingQuota ? `<span style="font-size: 10px; background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 20px;">${key.remainingQuota}</span>` : ''}
                        </div>
                        <div style="font-size: 10px; color: var(--gray-500); margin-top: 5px;">
                            <i class="far fa-calendar-alt"></i> ${addedDate}${quotaText}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${!key.isActive ? `
                            <button class="api-key-enable-btn" data-index="${idx}" title="${isGerman ? 'فعال کردن' : 'Enable'}" style="
                                background: none; border: none; color: #10b981; cursor: pointer; font-size: 16px; padding: 6px;
                            ">
                                <i class="fas fa-play-circle"></i>
                            </button>
                        ` : `
                            <button class="api-key-disable-btn" data-index="${idx}" title="${isGerman ? 'غیرفعال کردن' : 'Disable'}" style="
                                background: none; border: none; color: #f59e0b; cursor: pointer; font-size: 16px; padding: 6px;
                            ">
                                <i class="fas fa-pause-circle"></i>
                            </button>
                        `}
                        <button class="api-key-delete-btn" data-index="${idx}" title="${isGerman ? 'حذف' : 'Delete'}" style="
                            background: none; border: none; color: #ef4444; cursor: pointer; font-size: 16px; padding: 6px;
                        ">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // رویدادهای دکمه‌ها
    document.querySelectorAll('.api-key-enable-btn').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.dataset.index);
            this.apiKeyManager.enableKey(idx);
            renderApiKeysList();
            this.showToast('✅ کلید فعال شد', 'success');
        };
    });
    
    document.querySelectorAll('.api-key-disable-btn').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.dataset.index);
            this.apiKeyManager.disableKey(idx);
            renderApiKeysList();
            this.showToast('⏸ کلید غیرفعال شد', 'info');
        };
    });
    
    document.querySelectorAll('.api-key-delete-btn').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.dataset.index);
            if (confirm('آیا از حذف این کلید مطمئن هستید؟')) {
                this.apiKeyManager.removeKey(idx);
                renderApiKeysList();
                this.showToast('🗑️ کلید حذف شد', 'success');
            }
        };
    });
};


// بارگذاری اولیه لیست
renderApiKeysList();
}
// ================================================
// خروجی تصویری لغات - نسخه نهایی با تمام قابلیت‌ها
// ================================================
async showExportWordsModal() {
    const words = await this.getAllWords();
    const modal = document.getElementById('export-words-modal');
    const container = document.getElementById('export-words-list');
    
    if (!modal || !container) return;
    
    // خواندن تنظیمات از localStorage
    this.exportSettings = {
        theme: localStorage.getItem('exportTheme') || 'light',
        showGender: localStorage.getItem('exportShowGender') !== 'false',
        showType: localStorage.getItem('exportShowType') !== 'false',
        headerTitle: localStorage.getItem('exportHeaderTitle') || 'Elias.Dictionary'
    };
    
    // مقداردهی اولیه
    this.selectedWordsForExport = [];
    this.allWordsForExport = [...words];
    this.filteredWordsForExport = [...words];  // برای جستجو
    
    // مرتب‌سازی اولیه الفبایی
    this.applyExportSort(this.filteredWordsForExport, 'alphabetical');
    
    // هدر مودال
    const modalHeader = modal.querySelector('.export-modal-header');
    if (modalHeader) {
        modalHeader.innerHTML = `
            <h3 style="display: flex; align-items: center; gap: 10px; margin: 0;">
                <span style="font-size: 20px;">🖼️</span>
                خروجی تصویری لغات
            </h3>
            <button class="export-modal-close" id="close-export-modal-btn" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 18px; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;">
                ✕
            </button>
        `;
        const newCloseBtn = modalHeader.querySelector('#close-export-modal-btn');
        if (newCloseBtn) newCloseBtn.onclick = () => modal.style.display = 'none';
    }
    
    // رندر
    this.renderExportWordsList();
    this.renderExportToolbar(modal);
    this.addTagFilterToExportModal();
    this.updateSelectedCountDisplay();
    
    // دکمه‌ها
    document.getElementById('select-all-words').onclick = () => {
        document.querySelectorAll('.export-word-item').forEach(item => {
            if (!item.classList.contains('selected')) item.click();
        });
    };
    
    document.getElementById('deselect-all-words').onclick = () => {
        document.querySelectorAll('.export-word-item').forEach(item => {
            if (item.classList.contains('selected')) item.click();
        });
    };
    
    document.getElementById('select-weak-words').onclick = () => {
        document.querySelectorAll('.export-word-item').forEach(item => {
            const wordId = parseInt(item.dataset.id);
            const level = this.srsData[wordId]?.level || 0;
            const isWeak = level <= 2;
            const isSelected = item.classList.contains('selected');
            if (isWeak && !isSelected) item.click();
            else if (!isWeak && isSelected) item.click();
        });
    };
    
    document.getElementById('preview-export-btn').onclick = () => {
        if (this.selectedWordsForExport.length === 0) {
            this.showToast('❌ لطفاً حداقل یک لغت را انتخاب کنید', 'warning');
            return;
        }
        this.showExportPreview();
    };
    
    document.getElementById('cancel-export-btn').onclick = () => {
        modal.style.display = 'none';
    };
    
    modal.style.display = 'flex';
}

renderExportToolbar(modal) {
    const existingToolbar = modal.querySelector('.export-toolbar');
    if (existingToolbar) existingToolbar.remove();
    
    const toolbar = document.createElement('div');
    toolbar.className = 'export-toolbar';
    toolbar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 12px; padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; align-items: center;';
    
    // خواندن مقادیر ذخیره شده
    const savedWordsPerPage = localStorage.getItem('exportWordsPerPage') || '10';
    const savedSort = localStorage.getItem('exportSortBy') || 'alphabetical';
    const savedTheme = localStorage.getItem('exportTheme') || 'light';
    const savedShowGender = localStorage.getItem('exportShowGender') !== 'false';
    const savedShowType = localStorage.getItem('exportShowType') !== 'false';
    
    toolbar.innerHTML = `
        <input type="text" id="export-search-input" placeholder="🔍 جستجوی لغت..." style="padding: 8px 12px; border-radius: 12px; border: 1px solid #ddd; flex: 1; min-width: 150px;">
        
        <select id="export-sort-select" style="padding: 8px 12px; border-radius: 12px; border: 1px solid #ddd;">
            <option value="alphabetical" ${savedSort === 'alphabetical' ? 'selected' : ''}>📖 الفبایی (آلمانی)</option>
            <option value="alphabetical-persian" ${savedSort === 'alphabetical-persian' ? 'selected' : ''}>📖 الفبایی (فارسی)</option>
            <option value="date-desc" ${savedSort === 'date-desc' ? 'selected' : ''}>🆕 جدیدترین</option>
            <option value="date-asc" ${savedSort === 'date-asc' ? 'selected' : ''}>📅 قدیمی‌ترین</option>
            <option value="random" ${savedSort === 'random' ? 'selected' : ''}>🎲 تصادفی</option>
        </select>
        
        <select id="export-words-per-page" style="padding: 8px 12px; border-radius: 12px; border: 1px solid #ddd;">
            <option value="5" ${savedWordsPerPage === '5' ? 'selected' : ''}>۵ لغت در صفحه</option>
            <option value="10" ${savedWordsPerPage === '10' ? 'selected' : ''}>۱۰ لغت در صفحه</option>
            <option value="15" ${savedWordsPerPage === '15' ? 'selected' : ''}>۱۵ لغت در صفحه</option>
            <option value="20" ${savedWordsPerPage === '20' ? 'selected' : ''}>۲۰ لغت در صفحه</option>
            <option value="30" ${savedWordsPerPage === '30' ? 'selected' : ''}>۳۰ لغت در صفحه</option>
        </select>
        
        <select id="export-theme-select" style="padding: 8px 12px; border-radius: 12px; border: 1px solid #ddd;">
            <option value="light" ${savedTheme === 'light' ? 'selected' : ''}>☀️ روشن</option>
            <option value="dark" ${savedTheme === 'dark' ? 'selected' : ''}>🌙 تاریک</option>
            <option value="blue" ${savedTheme === 'blue' ? 'selected' : ''}>💙 آبی</option>
            <option value="green" ${savedTheme === 'green' ? 'selected' : ''}>💚 سبز</option>
            <option value="purple" ${savedTheme === 'purple' ? 'selected' : ''}>💜 بنفش</option>
            <option value="orange" ${savedTheme === 'orange' ? 'selected' : ''}>🧡 نارنجی</option>
            <option value="pink" ${savedTheme === 'pink' ? 'selected' : ''}>💗 صورتی</option>
        </select>
        
        <label style="display: flex; align-items: center; gap: 5px;">
            <input type="checkbox" id="export-show-gender" ${savedShowGender ? 'checked' : ''}> جنسیت
        </label>
        <label style="display: flex; align-items: center; gap: 5px;">
            <input type="checkbox" id="export-show-type" ${savedShowType ? 'checked' : ''}> نوع کلمه
        </label>
    `;
    
    modal.querySelector('.export-modal-body').insertBefore(toolbar, modal.querySelector('.export-words-list'));
    
    // ========== رویداد جستجو ==========
    const searchInput = document.getElementById('export-search-input');
    let searchTimeout;
    searchInput.oninput = (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            this.filterExportWordsList(e.target.value);
        }, 300);
    };
    
 // ========== رویداد سورت (ذخیره خودکار و اعمال روی لیست) ==========
const sortSelect = document.getElementById('export-sort-select');
sortSelect.onchange = () => {
    const sortBy = sortSelect.value;
    localStorage.setItem('exportSortBy', sortBy);
    this.applyExportSort(this.filteredWordsForExport, sortBy);
    this.renderExportWordsList();
    this.showToast(`✓ مرتب‌سازی به ${sortSelect.options[sortSelect.selectedIndex].text} تغییر کرد`, 'success');
};

// مقداردهی اولیه سورت از localStorage وقتی صفحه باز میشه
if (savedSort) {
    this.applyExportSort(this.filteredWordsForExport, savedSort);
    this.renderExportWordsList();
}
    
    // ========== رویداد تعداد لغت در صفحه ==========
    const wordsPerPage = document.getElementById('export-words-per-page');
    wordsPerPage.onchange = () => {
        localStorage.setItem('exportWordsPerPage', wordsPerPage.value);
        this.showToast(`✓ تعداد لغت در صفحه به ${wordsPerPage.value} تغییر کرد`, 'success');
    };
    
    // ========== رویدادهای آپدیت خودکار ==========
    const themeSelect = document.getElementById('export-theme-select');
    const showGenderCheck = document.getElementById('export-show-gender');
    const showTypeCheck = document.getElementById('export-show-type');
    
    themeSelect.onchange = () => {
        this.exportSettings.theme = themeSelect.value;
        localStorage.setItem('exportTheme', this.exportSettings.theme);
        if (this.exportPages && this.exportPages.length > 0) {
            this.renderPreviewPageWithTheme(this.currentPreviewPage);
        }
        this.showToast(`✓ تم به ${themeSelect.options[themeSelect.selectedIndex].text} تغییر کرد`, 'success');
    };
    
    showGenderCheck.onchange = () => {
        this.exportSettings.showGender = showGenderCheck.checked;
        localStorage.setItem('exportShowGender', this.exportSettings.showGender);
        if (this.exportPages && this.exportPages.length > 0) {
            this.renderPreviewPageWithTheme(this.currentPreviewPage);
        }
        this.showToast(`✓ نمایش جنسیت ${showGenderCheck.checked ? 'فعال' : 'غیرفعال'} شد`, 'success');
    };
    
    showTypeCheck.onchange = () => {
        this.exportSettings.showType = showTypeCheck.checked;
        localStorage.setItem('exportShowType', this.exportSettings.showType);
        if (this.exportPages && this.exportPages.length > 0) {
            this.renderPreviewPageWithTheme(this.currentPreviewPage);
        }
        this.showToast(`✓ نمایش نوع کلمه ${showTypeCheck.checked ? 'فعال' : 'غیرفعال'} شد`, 'success');
    };
}
// تابع فیلتر جستجو
filterExportWordsList(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
        this.filteredWordsForExport = [...this.allWordsForExport];
    } else {
        this.filteredWordsForExport = this.allWordsForExport.filter(word => 
            word.german.toLowerCase().includes(searchTerm) || 
            word.persian.toLowerCase().includes(searchTerm)
        );
    }
    
    // اعمال سورت فعلی
    const sortSelect = document.getElementById('export-sort-select');
    if (sortSelect) {
        this.applyExportSort(this.filteredWordsForExport, sortSelect.value);
    }
    
    this.renderExportWordsList();
}
// ================================================
// تابع مرتب‌سازی - با سورت درست برای جدیدترین/قدیمی‌ترین
// ================================================

applySortToFilteredWords(words, sortType) {
    if (sortType === 'date-desc') {
        // جدیدترین: بر اساس id (بزرگترین اول) - چون id از Date.now ساخته شده
        words.sort((a, b) => b.id - a.id);
    } 
    else if (sortType === 'date-asc') {
        // قدیمی‌ترین: بر اساس id (کوچکترین اول)
        words.sort((a, b) => a.id - b.id);
    }
    else if (sortType === 'alphabetical') {
        words.sort((a, b) => a.german.localeCompare(b.german, 'de'));
    }
    else if (sortType === 'alphabetical-persian') {
        words.sort((a, b) => a.persian.localeCompare(b.persian, 'fa'));
    }
    else if (sortType === 'srs-level') {
        words.sort((a, b) => (this.srsData[b.id]?.level || 0) - (this.srsData[a.id]?.level || 0));
    }
    else if (sortType === 'tag') {
        words.sort((a, b) => {
            const tagsA = this.getTagsForWord(a.id);
            const tagsB = this.getTagsForWord(b.id);
            if (tagsA.length !== tagsB.length) return tagsB.length - tagsA.length;
            if (tagsA.length > 0 && tagsB.length > 0) {
                return tagsA[0].name.localeCompare(tagsB[0].name, 'fa');
            }
            return 0;
        });
    }
    else if (sortType === 'random') {
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
    }
    return words;
}
// تابع مرتب‌سازی
applyExportSort(words, sortBy) {
    switch(sortBy) {
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
        case 'random':
            words.sort(() => Math.random() - 0.5);
            break;
    }
    return words;
}
renderExportWordsList() {
    const container = document.getElementById('export-words-list');
    if (!container) return;
    
    // استفاده از filteredWordsForExport که مقداردهی شده
    const wordsToShow = this.filteredWordsForExport || this.allWordsForExport || [];
    
    container.innerHTML = wordsToShow.map(word => {
        let genderHtml = '';
        if (word.gender) {
            let genderText = '';
            let genderColor = '';
            if (word.gender === 'masculine') {
                genderText = 'der';
                genderColor = '#3b82f6';
            } else if (word.gender === 'feminine') {
                genderText = 'die';
                genderColor = '#ec4899';
            } else if (word.gender === 'neuter') {
                genderText = 'das';
                genderColor = '#10b981';
            }
            genderHtml = `<span class="badge-sm" style="background: ${genderColor};">${genderText}</span>`;
        }
        
        let typeHtml = '';
        if (word.type) {
            let typeText = this.getTypeLabel(word.type);
            let typeColor = '';
            if (word.type === 'noun') typeColor = '#8b5cf6';
            else if (word.type === 'verb') typeColor = '#f59e0b';
            else if (word.type === 'adjective') typeColor = '#06b6d4';
            else if (word.type === 'adverb') typeColor = '#84cc16';
            else typeColor = '#6b7280';
            typeHtml = `<span class="badge-sm" style="background: ${typeColor};">${typeText}</span>`;
        }
        
        return `
            <div class="export-word-item" data-id="${word.id}" data-selected="false">
                <div class="word-info">
                    <div class="word-german">${this.escapeHtml(word.german)}</div>
                    <div class="word-persian">${this.escapeHtml(word.persian)}</div>
                    <div class="word-badges">
                        ${typeHtml}
                        ${genderHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // رویداد کلیک
    document.querySelectorAll('.export-word-item').forEach(item => {
        const wordId = parseInt(item.dataset.id);
        const word = this.allWordsForExport.find(w => w.id === wordId);
        
        item.onclick = (e) => {
            e.preventDefault();
            const isSelected = item.classList.contains('selected');
            
            if (isSelected) {
                item.classList.remove('selected');
                item.dataset.selected = 'false';
                const index = this.selectedWordsForExport.findIndex(w => w.id === wordId);
                if (index !== -1) this.selectedWordsForExport.splice(index, 1);
            } else {
                item.classList.add('selected');
                item.dataset.selected = 'true';
                if (word && !this.selectedWordsForExport.find(w => w.id === wordId)) {
                    this.selectedWordsForExport.push(word);
                }
            }
            
            this.updateSelectedCountDisplay();
        };
    });
}

updateSelectedCountDisplay() {
    const countSpan = document.getElementById('selected-count');
    if (countSpan) {
        countSpan.textContent = this.selectedWordsForExport.length;
    }
}


collectSelectedWords() {
    const checkboxes = document.querySelectorAll('.word-checkbox:checked');
    this.selectedWordsForExport = [];
    checkboxes.forEach(cb => {
        const wordId = parseInt(cb.dataset.id);
        const word = this.allWordsForExport.find(w => w.id === wordId);
        if (word) this.selectedWordsForExport.push(word);
    });
}

applyExportSort(words, sortBy) {
    switch(sortBy) {
        case 'alphabetical':
            words.sort((a, b) => a.german.localeCompare(b.german, 'de'));
            break;
        case 'alphabetical-persian':
            words.sort((a, b) => a.persian.localeCompare(b.persian, 'fa'));
            break;
        case 'srs-level':
            words.sort((a, b) => (this.srsData[b.id]?.level || 0) - (this.srsData[a.id]?.level || 0));
            break;
        case 'date-desc':
            words.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'date-asc':
            words.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'random':
            words.sort(() => Math.random() - 0.5);
            break;
    }
    return words;
}

showExportPreview() {
    console.log('🖼️ شروع پیش‌نمایش...');
    
    if (!this.selectedWordsForExport || this.selectedWordsForExport.length === 0) {
        this.showToast('❌ هیچ لغتی انتخاب نشده است', 'warning');
        return;
    }
    
    const wordsPerPage = parseInt(localStorage.getItem('exportWordsPerPage') || '10');
    const pages = [];
    
    for (let i = 0; i < this.selectedWordsForExport.length; i += wordsPerPage) {
        pages.push(this.selectedWordsForExport.slice(i, i + wordsPerPage));
    }
    
    this.exportPages = pages;
    this.currentPreviewPage = 0;
    
    const modal = document.getElementById('preview-modal');
    const container = document.getElementById('preview-container');
    
    if (!modal || !container) {
        console.error('❌ مودال یا کانتینر پیدا نشد');
        return;
    }
    
    container.innerHTML = `
        <div class="preview-navbar">
            <div>
                <button id="preview-prev-page" class="btn-nav" ${pages.length <= 1 ? 'disabled' : ''}>◀ قبلی</button>
                <button id="preview-next-page" class="btn-nav" ${pages.length <= 1 ? 'disabled' : ''}>بعدی ▶</button>
            </div>
            <div class="preview-page-info">صفحه <span id="preview-page-num">1</span> از ${pages.length}</div>
            <div class="preview-page-info">📊 ${this.selectedWordsForExport.length} لغت</div>
        </div>
        <div id="preview-pages-container"></div>
    `;
    
    this.renderPreviewPageWithTheme(0);
    this.setupPreviewNavigation();
    
    modal.style.display = 'flex';
    
   // دکمه تایید نهایی - مطمئن شو که پیدا میشه
const confirmBtn = document.getElementById('confirm-export-btn');
if (confirmBtn) {
    // حذف رویداد قبلی
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  newConfirmBtn.onclick = () => {
    console.log('✅ دکمه دانلود کلیک شد');
    this.generateAndDownloadImagesWithTheme();
};
}
    
    const backBtn = document.getElementById('back-to-select-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    const closeBtn = document.getElementById('close-preview-modal');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
}

getThemeColors(theme) {
    const themes = {
        light: { primary: '#4361ee', primaryDark: '#3a56d4', bg: '#ffffff', text: '#1f2937', border: '#e5e7eb', headerBg: 'linear-gradient(135deg, #667eea, #764ba2)' },
        dark: { primary: '#60a5fa', primaryDark: '#3b82f6', bg: '#1e293b', text: '#f1f5f9', border: '#334155', headerBg: 'linear-gradient(135deg, #1e40af, #5b21b6)' },
        blue: { primary: '#3b82f6', primaryDark: '#2563eb', bg: '#eff6ff', text: '#1e3a8a', border: '#bfdbfe', headerBg: 'linear-gradient(135deg, #3b82f6, #1e40af)' },
        green: { primary: '#10b981', primaryDark: '#059669', bg: '#ecfdf5', text: '#064e3b', border: '#a7f3d0', headerBg: 'linear-gradient(135deg, #10b981, #065f46)' },
        purple: { primary: '#8b5cf6', primaryDark: '#6d28d9', bg: '#f5f3ff', text: '#4c1d95', border: '#ddd6fe', headerBg: 'linear-gradient(135deg, #8b5cf6, #5b21b6)' },
        orange: { primary: '#f59e0b', primaryDark: '#d97706', bg: '#fffbeb', text: '#78350f', border: '#fde68a', headerBg: 'linear-gradient(135deg, #f59e0b, #b45309)' },
        pink: { primary: '#ec4899', primaryDark: '#db2777', bg: '#fdf2f8', text: '#831843', border: '#fbcfe8', headerBg: 'linear-gradient(135deg, #ec4899, #be185d)' }
    };
    return themes[theme] || themes.light;
}

renderPreviewPageWithTheme(pageIndex) {
    const words = this.exportPages[pageIndex];
    const container = document.getElementById('preview-pages-container');
    const theme = this.exportSettings.theme || 'light';
    const showGender = this.exportSettings.showGender !== false;
    const showType = this.exportSettings.showType !== false;
    
    let html = `
        <div class="preview-page ${theme}-theme">
            <div class="preview-page-header">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">📋</span>
                    <span class="preview-title editable-title" data-page="${pageIndex}" style="cursor: pointer;" onclick="dictionaryApp.startEditTitle(this)">${this.escapeHtml(this.exportSettings.headerTitle || 'Elias.Dictionary')}</span>
                    <input type="text" class="edit-title-input" data-page="${pageIndex}" style="display: none; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); border-radius: 8px; padding: 4px 12px; color: white; font-family: Vazirmatn; font-weight: 700; font-size: 16px;">
                </div>
                <div class="preview-page-num">صفحه ${pageIndex + 1} از ${this.exportPages.length}</div>
            </div>
            
            <table class="preview-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>🇩🇪 لغت آلمانی</th>
                        <th>🇮🇷 معنی فارسی</th>
                        ${showGender ? '<th>جنسیت</th>' : ''}
                        ${showType ? '<th>نوع</th>' : ''}
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${this.escapeHtml(word.german)}</td>
                <td>${this.escapeHtml(word.persian)}</td>
        `;
        
        if (showGender) {
            if (word.gender) {
                let genderText = '';
                let genderColor = '';
                if (word.gender === 'masculine') {
                    genderText = 'der';
                    genderColor = '#3b82f6';
                } else if (word.gender === 'feminine') {
                    genderText = 'die';
                    genderColor = '#ec4899';
                } else if (word.gender === 'neuter') {
                    genderText = 'das';
                    genderColor = '#10b981';
                }
                html += `<td style="text-align: center;"><span style="display: inline-block; background: ${genderColor}; color: white; padding: 5px 14px; border-radius: 30px; font-size: 12px; font-weight: 700; min-width: 55px;">${genderText}</span></td>`;
            } else {
                html += `<td style="text-align: center;">-</td>`;
            }
        }
        
        if (showType) {
            let typeText = this.getTypeLabel(word.type || 'other');
            let typeColor = '';
            if (word.type === 'noun') typeColor = '#8b5cf6';
            else if (word.type === 'verb') typeColor = '#f59e0b';
            else if (word.type === 'adjective') typeColor = '#06b6d4';
            else if (word.type === 'adverb') typeColor = '#84cc16';
            else typeColor = '#6b7280';
            
            html += `<td style="text-align: center;"><span style="display: inline-block; background: ${typeColor}; color: white; padding: 5px 14px; border-radius: 30px; font-size: 12px; font-weight: 600;">${typeText}</span></td>`;
        }
        
        html += `</tr>`;
    }
    
    html += `
                </tbody>
            </table>
            
            <div class="preview-footer">
                <div>📅 ${new Date().toLocaleDateString('fa-IR')}</div>
                <div>📖 Elias.Dictionary - دیکشنری هوشمند آلمانی-فارسی</div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}
saveHeaderTitleFromPreview(newTitle, pageIndex) {
    if (newTitle && newTitle.trim()) {
        this.exportSettings.headerTitle = newTitle.trim();
        localStorage.setItem('exportHeaderTitle', this.exportSettings.headerTitle);
        
        // مخفی کردن input و نمایش متن جدید
        const input = document.getElementById(`edit-title-input-${pageIndex}`);
        const titleSpan = document.getElementById(`preview-title-text-${pageIndex}`);
        if (input) input.style.display = 'none';
        if (titleSpan) {
            titleSpan.style.display = 'inline-block';
            titleSpan.textContent = this.escapeHtml(this.exportSettings.headerTitle);
        }
        
        this.showToast('✓ عنوان صفحه ذخیره شد', 'success');
    }
}

startEditTitle(element) {
    const parent = element.parentElement;
    const input = parent.querySelector('.edit-title-input');
    const currentTitle = element.textContent;
    
    if (!input) return;
    
    // مخفی کردن span و نمایش input
    element.style.display = 'none';
    input.style.display = 'inline-block';
    input.value = currentTitle;
    input.focus();
    input.select();
    
    // تابع ذخیره عنوان
    const saveTitle = () => {
        const newTitle = input.value.trim();
        if (newTitle) {
            this.exportSettings.headerTitle = newTitle;
            localStorage.setItem('exportHeaderTitle', newTitle);
            element.textContent = newTitle;
            this.showToast('✓ عنوان صفحه ذخیره شد', 'success');
        }
        element.style.display = 'inline-block';
        input.style.display = 'none';
        
        // رفرش پیش‌نمایش
        if (this.exportPages && this.exportPages.length > 0) {
            this.renderPreviewPageWithTheme(this.currentPreviewPage);
        }
    };
    
    // ذخیره با زدن اینتر (کیبورد) یا با کلیک بیرون (موبایل)
    input.onblur = saveTitle;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            saveTitle();
        }
    };
    
    // برای موبایل: دکمه Done رو هم در نظر بگیر
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Done') {
            e.preventDefault();
            saveTitle();
        }
    });
}

setupPreviewNavigation() {
    const prevBtn = document.getElementById('preview-prev-page');
    const nextBtn = document.getElementById('preview-next-page');
    const pageNumSpan = document.getElementById('preview-page-num');
    
    if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        
        newPrevBtn.onclick = () => {
            if (this.currentPreviewPage > 0) {
                this.currentPreviewPage--;
                this.renderPreviewPageWithTheme(this.currentPreviewPage);
                if (pageNumSpan) pageNumSpan.textContent = this.currentPreviewPage + 1;
                
                // بروزرسانی وضعیت دکمه‌ها
                const prevBtnNew = document.getElementById('preview-prev-page');
                const nextBtnNew = document.getElementById('preview-next-page');
                if (prevBtnNew) prevBtnNew.disabled = this.currentPreviewPage === 0;
                if (nextBtnNew) nextBtnNew.disabled = this.currentPreviewPage === this.exportPages.length - 1;
            }
        };
    }
    
    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        
        newNextBtn.onclick = () => {
            if (this.currentPreviewPage < this.exportPages.length - 1) {
                this.currentPreviewPage++;
                this.renderPreviewPageWithTheme(this.currentPreviewPage);
                if (pageNumSpan) pageNumSpan.textContent = this.currentPreviewPage + 1;
                
                // بروزرسانی وضعیت دکمه‌ها
                const prevBtnNew = document.getElementById('preview-prev-page');
                const nextBtnNew = document.getElementById('preview-next-page');
                if (prevBtnNew) prevBtnNew.disabled = this.currentPreviewPage === 0;
                if (nextBtnNew) nextBtnNew.disabled = this.currentPreviewPage === this.exportPages.length - 1;
            }
        };
    }
}

async generateAndDownloadImagesWithTheme() {
    const totalPages = this.exportPages.length;
    let successCount = 0;
    
    this.showSimpleLoadingSpinner();
    
    for (let i = 0; i < totalPages; i++) {
        const pageNumSpan = document.querySelector('#preview-page-num');
        if (pageNumSpan) pageNumSpan.textContent = i + 1;
        
        this.renderPreviewPageWithTheme(i);
        await new Promise(r => setTimeout(r, 100));
        
        const pageElement = document.querySelector('#preview-pages-container .preview-page');
        if (!pageElement) continue;
        
        // اصلاح رنگ متن لغات آلمانی قبل از عکس گرفتن
        const germanWords = pageElement.querySelectorAll('.preview-table td:nth-child(2)');
        const theme = this.exportSettings.theme || 'light';
        germanWords.forEach(cell => {
            if (theme === 'dark') cell.style.color = '#f1f5f9';
            else if (theme === 'blue') cell.style.color = '#1e40af';
            else if (theme === 'green') cell.style.color = '#064e3b';
            else if (theme === 'purple') cell.style.color = '#4c1d95';
            else if (theme === 'orange') cell.style.color = '#78350f';
            else if (theme === 'pink') cell.style.color = '#831843';
            else cell.style.color = '#1e293b';
        });
        
        try {
            const canvas = await html2canvas(pageElement, {
                scale: 3.0,
                backgroundColor: '#ffffff',
                logging: false
            });
            
            const link = document.createElement('a');
            link.download = `elias-dictionary-page-${i + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            successCount++;
            await new Promise(r => setTimeout(r, 300));
        } catch(e) {
            console.error(e);
        }
    }
    
    this.hideSimpleLoadingSpinner();
    this.showToast(`✅ ${successCount} تصویر با موفقیت دانلود شد`, 'success');
    
    document.getElementById('preview-modal').style.display = 'none';
    document.getElementById('export-words-modal').style.display = 'none';
}
// نمایش لودینگ فقط چرخش (بدون متن و نوار پیشرفت)
showSimpleLoadingSpinner() {
    const existing = document.getElementById('simple-loading');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.id = 'simple-loading';
    div.innerHTML = `
        <div class="simple-loading-spinner">
            <div class="simple-spinner-ring"></div>
            <div class="simple-spinner-ring-inner"></div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.id = 'simple-loading-style';
    style.textContent = `
        #simple-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(3px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .simple-loading-spinner {
            position: relative;
            width: 70px;
            height: 70px;
        }
        .simple-spinner-ring {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 3px solid transparent;
            border-top-color: #667eea;
            border-right-color: #764ba2;
            border-radius: 50%;
            animation: spinRing 0.8s linear infinite;
        }
        .simple-spinner-ring-inner {
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 3px solid transparent;
            border-top-color: #10b981;
            border-left-color: #f59e0b;
            border-radius: 50%;
            animation: spinRingReverse 1s linear infinite;
        }
        @keyframes spinRing {
            to { transform: rotate(360deg); }
        }
        @keyframes spinRingReverse {
            to { transform: rotate(-360deg); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(div);
}

// مخفی کردن لودینگ
hideSimpleLoadingSpinner() {
    const loading = document.getElementById('simple-loading');
    const style = document.getElementById('simple-loading-style');
    if (loading) loading.remove();
    if (style) style.remove();
}
// تابع جدید برای آپدیت محتوای جدول بدون رندر مجدد کل صفحه
updatePreviewTableContent(pageIndex) {
    const words = this.exportPages[pageIndex];
    const showGender = this.exportSettings.showGender;
    const showType = this.exportSettings.showType;
    const showSRS = this.exportSettings.showSRS;
    const theme = this.getThemeColors(this.exportSettings.theme);
    
    const tbody = document.querySelector('#preview-pages-container .preview-page tbody');
    if (!tbody) return;
    
    tbody.innerHTML = words.map((word, idx) => `
        <tr style="border-bottom: 1px solid ${theme.border};">
            <td style="padding: 10px; text-align: center; font-weight: 600; color: ${theme.primary};">${idx + 1}</td>
            <td style="padding: 10px; font-weight: 600; color: ${theme.primary};">${this.escapeHtml(word.german)}</td>
            <td style="padding: 10px; color: ${theme.text};">${this.escapeHtml(word.persian)}</td>
            ${showGender ? `
            <td style="padding: 10px; text-align: center;">
                ${word.gender ? `<span style="background: ${word.gender === 'masculine' ? '#3b82f6' : word.gender === 'feminine' ? '#ec4899' : '#10b981'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px;">${this.getGenderSymbol(word.gender)}</span>` : '-'}
            </td>
            ` : ''}
            ${showType ? `
            <td style="padding: 10px; text-align: center;">
                <span style="background: ${word.type === 'noun' ? '#3b82f6' : word.type === 'verb' ? '#10b981' : '#f59e0b'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px;">${this.getTypeLabel(word.type)}</span>
            </td>
            ` : ''}
            ${showSRS ? `
            <td style="padding: 10px; text-align: center;">
                <span style="background: ${(this.srsData[word.id]?.level || 0) >= 4 ? '#10b981' : (this.srsData[word.id]?.level || 0) >= 2 ? '#f59e0b' : '#ef4444'}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px;">
                    ${this.srsData[word.id]?.level || 0}
                </span>
            </td>
            ` : ''}
        </tr>
    `).join('');
    
    // آپدیت شماره صفحه در هدر
    const pageNumInHeader = document.querySelector('#preview-pages-container .preview-page > div:first-child > div:last-child');
    if (pageNumInHeader) {
        pageNumInHeader.textContent = `صفحه ${pageIndex + 1} از ${this.exportPages.length}`;
    }
}
// ================================================
// اعمال پوسته رنگی
// ================================================

applyTheme(theme) {
    // حذف همه کلاس‌های تم قبلی
    document.body.classList.remove(
        'blue-theme', 'green-theme', 'purple-theme', 
        'orange-theme', 'pink-theme', 'custom-theme'
    );
    
    // حذف استایل‌های inline قبلی
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--primary-dark');
    document.documentElement.style.removeProperty('--primary-light');
    
    // اعمال تم جدید
    switch(theme) {
        case 'blue':
            document.body.classList.add('blue-theme');
            document.documentElement.style.setProperty('--primary', '#3b82f6');
            document.documentElement.style.setProperty('--primary-dark', '#2563eb');
            document.documentElement.style.setProperty('--primary-light', '#dbeafe');
            break;
            
        case 'green':
            document.body.classList.add('green-theme');
            document.documentElement.style.setProperty('--primary', '#10b981');
            document.documentElement.style.setProperty('--primary-dark', '#059669');
            document.documentElement.style.setProperty('--primary-light', '#d1fae5');
            break;
            
        case 'purple':
            document.body.classList.add('purple-theme');
            document.documentElement.style.setProperty('--primary', '#8b5cf6');
            document.documentElement.style.setProperty('--primary-dark', '#6d28d9');
            document.documentElement.style.setProperty('--primary-light', '#ede9fe');
            break;
            
        case 'orange':
            document.body.classList.add('orange-theme');
            document.documentElement.style.setProperty('--primary', '#f59e0b');
            document.documentElement.style.setProperty('--primary-dark', '#d97706');
            document.documentElement.style.setProperty('--primary-light', '#fef3c7');
            break;
            
        case 'pink':
            document.body.classList.add('pink-theme');
            document.documentElement.style.setProperty('--primary', '#ec4899');
            document.documentElement.style.setProperty('--primary-dark', '#db2777');
            document.documentElement.style.setProperty('--primary-light', '#fce7f3');
            break;
            
        default: // default
            document.documentElement.style.setProperty('--primary', '#4361ee');
            document.documentElement.style.setProperty('--primary-dark', '#3a56d4');
            document.documentElement.style.setProperty('--primary-light', '#eef2ff');
    }
    
    // ذخیره در localStorage
    localStorage.setItem('theme', theme);
    
    // آپدیت کلاس active روی دکمه‌ها
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === theme);
    });
    
    
}
// مترجم با Google Translate - رایگان و بدون API Key
async translateWithGoogle(text, sourceLang, targetLang) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // استخراج متن ترجمه شده
        let translatedText = '';
        for (const part of data[0]) {
            if (part[0]) {
                translatedText += part[0];
            }
        }
        
        return translatedText || null;
    } catch (error) {
        console.error('Google Translate error:', error);
        return null;
    }
}
// ================================================
// دریافت نام فارسی پوسته
// ================================================

getThemeName(theme) {
    const names = {
        'default': 'پیش‌فرض',
        'blue': 'آبی',
        'green': 'سبز',
        'purple': 'بنفش',
        'orange': 'نارنجی',
        'pink': 'صورتی'
    };
    return names[theme] || theme;
}

    setupColorPickerEventListeners() {
        const redSlider = document.getElementById('color-red');
        const greenSlider = document.getElementById('color-green');
        const blueSlider = document.getElementById('color-blue');
        const colorPreview = document.getElementById('color-preview');
        
        if (!redSlider || !greenSlider || !blueSlider || !colorPreview) return;
        
        const updateColorPreview = () => {
            const r = redSlider.value;
            const g = greenSlider.value;
            const b = blueSlider.value;
            colorPreview.style.background = `rgb(${r}, ${g}, ${b})`;
            
            document.getElementById('red-value').textContent = r;
            document.getElementById('green-value').textContent = g;
            document.getElementById('blue-value').textContent = b;
        };
        
        redSlider.addEventListener('input', updateColorPreview);
        greenSlider.addEventListener('input', updateColorPreview);
        blueSlider.addEventListener('input', updateColorPreview);
        
        document.getElementById('apply-custom-color').addEventListener('click', () => {
            const r = parseInt(redSlider.value);
            const g = parseInt(greenSlider.value);
            const b = parseInt(blueSlider.value);
            this.applyCustomColor(r, g, b);
        });
        
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const color = e.currentTarget.dataset.color;
                this.applyHexColor(color);
            });
        });
    }

    loadCustomization() {
        // بارگذاری حالت تاریک
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        

    // ========== بارگذاری اندازه فونت ==========
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge', 'font-xxlarge');
    document.body.classList.add(`font-${fontSize}`);
    
    const fontSizeMap = { 
        small: '14px', 
        medium: '16px', 
        large: '18px',
        xlarge: '20px',
        xxlarge: '22px'
    };
    document.documentElement.style.fontSize = fontSizeMap[fontSize];
    document.body.style.fontSize = fontSizeMap[fontSize];
        
        // بارگذاری پوسته
        const theme = localStorage.getItem('theme');
        if (theme && theme !== 'default') {
            this.applyTheme(theme);
        }
        
        // بارگذاری رنگ سفارشی
        const savedColor = localStorage.getItem('customColor');
        if (savedColor) {
            try {
                this.customColor = JSON.parse(savedColor);
                const { r, g, b } = this.customColor;
                document.documentElement.style.setProperty('--primary', `rgb(${r}, ${g}, ${b})`);
                document.documentElement.style.setProperty('--primary-dark', this.darkenColor(r, g, b, 20));
            } catch (e) {
                console.error('خطا در بارگذاری رنگ سفارشی:', e);
            }
        }
        
      
    }

    // ================================================
    // مدیریت موسیقی
    // ================================================
setupPasswordLock() {
    // با تأخیر کوچک برای اطمینان از وجود المان‌ها
    setTimeout(() => {
        const saveBtn = document.getElementById('save-password-btn');
        const removeBtn = document.getElementById('remove-password-btn');
        const setPasswordInput = document.getElementById('set-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const lockStatusText = document.getElementById('lock-status-text');
        
        // اگر دکمه وجود نداشت، برگرد
        if (!saveBtn) {
            console.log('⚠️ دکمه ذخیره رمز پیدا نشد');
            return;
        }
        
        const isGerman = LanguageSystem.isGerman();
        
        // بروزرسانی وضعیت قفل
        const updateLockStatus = () => {
            const hasPass = localStorage.getItem('dictionary_password');
            if (lockStatusText) {
                if (hasPass) {
                    lockStatusText.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981;"></i> ${isGerman ? 'قفل فعال است' : 'Lock is active'}`;
                    lockStatusText.style.color = '#10b981';
                } else {
                    lockStatusText.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i> ${isGerman ? 'قفل غیرفعال است' : 'Lock is disabled'}`;
                    lockStatusText.style.color = '#f59e0b';
                }
            }
        };
        
        // ذخیره رمز عبور
        saveBtn.onclick = () => {
            const password = setPasswordInput?.value;
            const confirm = confirmPasswordInput?.value;
            
            if (!password || password.length < 4) {
                this.showToast('⚠️ رمز عبور باید حداقل ۴ کاراکتر باشد', 'warning');
                return;
            }
            
            if (password !== confirm) {
                this.showToast('❌ رمز عبور و تکرار آن مطابقت ندارند', 'error');
                return;
            }
            
            // رمزگذاری ساده
            const encrypted = btoa(password);
            localStorage.setItem('dictionary_password', encrypted);
            
            if (setPasswordInput) setPasswordInput.value = '';
            if (confirmPasswordInput) confirmPasswordInput.value = '';
            updateLockStatus();
            this.showToast('✅ رمز عبور با موفقیت ذخیره شد', 'success');
        };
        
        // حذف رمز عبور
        if (removeBtn) {
            removeBtn.onclick = () => {
                if (confirm('⚠️ آیا از حذف رمز عبور مطمئن هستید؟')) {
                    localStorage.removeItem('dictionary_password');
                    sessionStorage.removeItem('dictionary_unlocked');
                    updateLockStatus();
                    this.showToast('🔓 رمز عبور حذف شد', 'success');
                }
            };
        }
        
        updateLockStatus();
        
    }, 100);
}
checkAndLock() {
    const hasPassword = localStorage.getItem('dictionary_password');
    
    if (hasPassword) {
        const isUnlocked = sessionStorage.getItem('dictionary_unlocked');
        
        if (!isUnlocked) {
            this.showLockModal();
        }
    }
}

showLockModal() {
    let modal = document.getElementById('lock-modal');
    
    // اگر مودال وجود نداشت، بسازش
    if (!modal) {
        const isGerman = LanguageSystem.isGerman();
        const modalHTML = `
            <div id="lock-modal" class="modal-overlay" style="display: none; z-index: 999999;">
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-lock"></i> ${isGerman ? 'ورود به دیکشنری' : 'Dictionary Unlock'}</h3>
                    </div>
                    <div class="modal-body">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <i class="fas fa-graduation-cap" style="font-size: 50px; color: var(--primary);"></i>
                            <p style="margin-top: 10px;">${isGerman ? 'لطفاً رمز عبور را وارد کنید' : 'Please enter the password'}</p>
                        </div>
                        <input type="password" id="unlock-password" class="form-control" placeholder="${isGerman ? 'رمز عبور...' : 'Password...'}" style="text-align: center; font-size: 18px; padding: 12px;">
                        <div id="unlock-error" style="color: #ef4444; text-align: center; margin-top: 10px; display: none;"></div>
                    </div>
                    <div class="modal-footer">
                        <button id="unlock-btn" class="btn btn-primary btn-block" style="width: 100%;">
                            <i class="fas fa-unlock-alt"></i> ${isGerman ? 'ورود' : 'Unlock'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('lock-modal');
    }
    
    if (!modal) return;
    
    modal.style.display = 'flex';
    
    const unlockInput = document.getElementById('unlock-password');
    const unlockBtn = document.getElementById('unlock-btn');
    const unlockError = document.getElementById('unlock-error');
    
    const checkPassword = () => {
        const enteredPassword = unlockInput?.value;
        const savedPassword = localStorage.getItem('dictionary_password');
        
        if (!savedPassword) {
            modal.style.display = 'none';
            return;
        }
        
        try {
            const decrypted = atob(savedPassword);
            
            if (enteredPassword === decrypted) {
                sessionStorage.setItem('dictionary_unlocked', 'true');
                modal.style.display = 'none';
                if (unlockInput) unlockInput.value = '';
                this.showToast('🔓 دیکشنری باز شد', 'success');
            } else {
                if (unlockError) {
                    unlockError.style.display = 'block';
                    unlockError.innerHTML = '<i class="fas fa-times-circle"></i> رمز عبور اشتباه است';
                }
                if (unlockInput) {
                    unlockInput.value = '';
                    unlockInput.focus();
                }
                
                let attempts = parseInt(sessionStorage.getItem('lock_attempts') || '0');
                attempts++;
                sessionStorage.setItem('lock_attempts', attempts);
                
                if (attempts >= 5) {
                    if (unlockBtn) unlockBtn.disabled = true;
                    if (unlockError) unlockError.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ۵ بار تلاش ناموفق. لطفاً صفحه را رفرش کنید.';
                    setTimeout(() => location.reload(), 3000);
                }
            }
        } catch (e) {
            console.error('خطا در بررسی رمز:', e);
            if (unlockError) {
                unlockError.style.display = 'block';
                unlockError.innerHTML = '<i class="fas fa-exclamation-triangle"></i> خطا در بررسی رمز عبور';
            }
        }
    };
    
    if (unlockBtn) {
        unlockBtn.onclick = checkPassword;
    }
    
    if (unlockInput) {
        unlockInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        };
        setTimeout(() => unlockInput.focus(), 100);
    }
    
    // جلوگیری از بسته شدن با کلیک خارج
    modal.onclick = (e) => {
        if (e.target === modal) {
            // نمیذاریم بسته بشه
            return;
        }
    };
}
// ================================================
// مدیریت موسیقی - نسخه کامل و پیشرفته
// ================================================

async getAllMusic() {
    return new Promise((resolve, reject) => {
        if (!this.db) {
            resolve([]);
            return;
        }

        const transaction = this.db.transaction(['music'], 'readonly');
        const store = transaction.objectStore('music');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (event) => {
            console.error('خطا در دریافت موسیقی:', event.target.error);
            resolve([]);
        };
    });
}

async getMusicById(musicId) {
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['music'], 'readonly');
        const store = transaction.objectStore('music');
        const request = store.get(musicId);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async saveMusicToStorage(musicData) {
    return new Promise((resolve, reject) => {
        if (!this.db) {
            reject(new Error('دیتابیس در دسترس نیست'));
            return;
        }

        const transaction = this.db.transaction(['music'], 'readwrite');
        const store = transaction.objectStore('music');
        
        musicData.id = Date.now();
        musicData.uploadDate = new Date().toISOString();
        
        const request = store.add(musicData);
        
        request.onsuccess = () => {
            this.showToast(`🎵 "${musicData.name}" آپلود شد`, 'success');
            this.renderUploadedMusicList();
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            this.showToast('❌ خطا در ذخیره موسیقی', 'error');
            reject(event.target.error);
        };
    });
}

async deleteMusicById(musicId) {
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['music'], 'readwrite');
        const store = transaction.objectStore('music');
        const request = store.delete(musicId);
        
        request.onsuccess = () => {
            this.showToast('🗑️ موسیقی حذف شد', 'info');
            this.renderUploadedMusicList();
            resolve();
        };
        
        request.onerror = (event) => {
            this.showToast('❌ خطا در حذف موسیقی', 'error');
            reject(event.target.error);
        };
    });
}

setupMusicUploadEventListeners() {
    const uploadArea = document.getElementById('music-upload-area');
    const musicUpload = document.getElementById('music-upload');
    
    if (uploadArea && musicUpload) {
        uploadArea.addEventListener('click', () => {
            musicUpload.click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                this.handleMusicUpload(e.dataTransfer.files);
            }
        });
        
        musicUpload.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                this.handleMusicUpload(e.target.files);
            }
        });
    }
    
    // دکمه‌های پلیر پیشرفته
    const playBtn = document.getElementById('play-music-btn');
    const stopBtn = document.getElementById('stop-music-btn');
    const volumeSlider = document.getElementById('music-volume');
    const bgMusicSelect = document.getElementById('background-music');
    
    if (playBtn) {
        playBtn.onclick = () => this.playBackgroundMusic();
    }
    
    if (stopBtn) {
        stopBtn.onclick = () => this.stopBackgroundMusic();
    }
    
    if (volumeSlider) {
        volumeSlider.oninput = (e) => {
            this.setMusicVolume(e.target.value);
            const volumeValue = document.getElementById('volume-value');
            if (volumeValue) volumeValue.textContent = e.target.value + '%';
        };
    }
    
    if (bgMusicSelect) {
        bgMusicSelect.onchange = (e) => {
            this.changeBackgroundMusic(e.target.value);
        };
    }
}

handleMusicUpload(files) {
    if (!files || files.length === 0) return;

    const audioFile = Array.from(files).find(file => file.type.startsWith('audio/'));
    const imageFile = Array.from(files).find(file => file.type.startsWith('image/'));

    if (!audioFile) {
        this.showToast('❌ لطفاً یک فایل صوتی انتخاب کنید', 'error');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = async (e) => {
        const musicData = {
            name: audioFile.name.replace(/\.[^/.]+$/, ""),
            audioData: e.target.result,
            audioType: audioFile.type,
            audioSize: audioFile.size
        };

        if (imageFile) {
            try {
                const imageData = await this.readFileAsDataURL(imageFile);
                musicData.imageData = imageData;
                musicData.imageType = imageFile.type;
            } catch (error) {
                console.error('خطا در خواندن عکس:', error);
            }
        }

        await this.saveMusicToStorage(musicData);
    };
    
    reader.onerror = () => {
        this.showToast('❌ خطا در خواندن فایل', 'error');
    };
    
    reader.readAsDataURL(audioFile);
}

readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

async renderUploadedMusicList() {
    const container = document.getElementById('uploaded-music-list');
    if (!container) return;
    
    try {
        const musicList = await this.getAllMusic();
        
        if (musicList.length === 0) {
            container.innerHTML = `
                <div class="empty-music-list">
                    <i class="fas fa-music"></i>
                    <p>هنوز موسیقی آپلود نکرده‌اید</p>
                </div>
            `;
            return;
        }
        
        musicList.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        
        container.innerHTML = musicList.map(music => `
            <div class="music-item" data-id="${music.id}">
                <div class="music-cover">
                    ${music.imageData ? 
                        `<img src="${music.imageData}" alt="${music.name}" class="music-cover-image">` :
                        `<i class="fas fa-music"></i>`
                    }
                </div>
                <div class="music-info">
                    <div class="music-name">${this.escapeHtml(music.name)}</div>
                    <div class="music-details">
                        ${this.formatFileSize(music.audioSize)} • 
                        ${new Date(music.uploadDate).toLocaleDateString('fa-IR')}
                    </div>
                </div>
                <div class="music-actions">
                    <button class="music-btn play" data-id="${music.id}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="music-btn delete" data-id="${music.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // رویداد دکمه‌های پلی و حذف
        document.querySelectorAll('.music-btn.play').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.dataset.id);
                this.playUploadedMusic(id);
            };
        });
        
        document.querySelectorAll('.music-btn.delete').forEach(btn => {
            btn.onclick = async () => {
                const id = parseInt(btn.dataset.id);
                if (confirm('آیا از حذف این موسیقی مطمئن هستید؟')) {
                    await this.deleteMusicById(id);
                }
            };
        });
        
    } catch (error) {
        console.error('خطا در نمایش لیست موسیقی:', error);
    }
}

async playUploadedMusic(musicId) {
    try {
        const music = await this.getMusicById(musicId);
        
        if (!music) {
            this.showToast('❌ موسیقی پیدا نشد', 'error');
            return;
        }

        // توقف پخش قبلی
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer.currentTime = 0;
        }

        this.audioPlayer = new Audio();
        this.audioPlayer.src = music.audioData;
        this.audioPlayer.loop = false;
        
        // تنظیم صدا
        const volumeSlider = document.getElementById('player-volume-slider');
        const musicVolumeSlider = document.getElementById('music-volume');
        if (volumeSlider) {
            this.audioPlayer.volume = volumeSlider.value / 100;
        } else if (musicVolumeSlider) {
            this.audioPlayer.volume = musicVolumeSlider.value / 100;
        }
        
        // آپدیت عنوان آهنگ
        const trackNameSpan = document.getElementById('player-track-name');
        if (trackNameSpan) {
            trackNameSpan.textContent = music.name;
        }
        
        // آپدیت لیست پخش برای دکمه‌های قبلی/بعدی
        const allMusic = await this.getAllMusic();
        this.currentPlaylist = allMusic.map(m => m.id);
        this.currentIndex = this.currentPlaylist.findIndex(id => id === musicId);
        this.currentMusicId = musicId;
        
        // آپدیت نوار پیشرفت
        this.audioPlayer.ontimeupdate = () => {
            const progressFill = document.getElementById('progress-fill');
            const currentTimeSpan = document.getElementById('current-time-display');
            if (progressFill && this.audioPlayer.duration) {
                const percent = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
                progressFill.style.width = percent + '%';
            }
            if (currentTimeSpan) {
                currentTimeSpan.textContent = this.formatMusicTime(this.audioPlayer.currentTime);
            }
        };
        
        this.audioPlayer.onloadedmetadata = () => {
            const totalTimeSpan = document.getElementById('total-time-display');
            if (totalTimeSpan) {
                totalTimeSpan.textContent = this.formatMusicTime(this.audioPlayer.duration);
            }
        };
        
        this.audioPlayer.onended = () => {
            this.playNext();
        };
        
        await this.audioPlayer.play();
        this.showToast(`🎵 در حال پخش: ${music.name}`, 'success');
        
        // بروزرسانی دکمه پخش/توقف
        const playPauseBtn = document.getElementById('player-play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        // بروزرسانی آیکون شناور
        this.updateMusicFloatingIcon(true, music.name);
        this.isMusicPlaying = true;
        this.currentPlayingMusic = music;
        
    } catch (error) {
        console.error('خطا در پخش:', error);
        this.showToast('❌ خطا در پخش موسیقی', 'error');
    }
}


updateMusicFloatingIcon(isPlaying, trackName = '') {
    let icon = document.getElementById('music-floating-icon');
    
    if (!icon) {
        icon = document.createElement('div');
        icon.id = 'music-floating-icon';
        icon.className = 'music-floating-icon';
        icon.innerHTML = '<i class="fas fa-music"></i>';
        document.body.appendChild(icon);
        
        icon.onclick = () => {
            if (this.isMusicPlaying) {
                this.stopBackgroundMusic();
            } else if (this.currentPlayingMusic) {
                this.playUploadedMusic(this.currentPlayingMusic.id);
            } else {
                const musicList = document.querySelectorAll('.music-item');
                if (musicList.length > 0) {
                    const firstMusicId = parseInt(musicList[0].dataset.id);
                    this.playUploadedMusic(firstMusicId);
                }
            }
        };
    }
    
    if (isPlaying) {
        icon.style.display = 'flex';
        icon.classList.add('playing');
        icon.setAttribute('title', trackName || 'در حال پخش...');
        // تغییر آیکون به note
        icon.innerHTML = '<i class="fas fa-music"></i>';
    } else {
        icon.classList.remove('playing');
        icon.setAttribute('title', 'موسیقی متوقف شد');
        icon.innerHTML = '<i class="fas fa-music"></i>';
    }
}

startMusicProgressUpdate() {
    // پاک کردن interval قبلی
    if (this.progressInterval) {
        clearInterval(this.progressInterval);
    }
    
    const progressFill = document.getElementById('music-progress-fill');
    const currentTimeSpan = document.getElementById('current-time');
    const totalTimeSpan = document.getElementById('total-time');
    
    if (!progressFill || !currentTimeSpan) return;
    
    // نمایش زمان کل
    this.audioPlayer.onloadedmetadata = () => {
        if (totalTimeSpan) {
            totalTimeSpan.textContent = this.formatMusicTime(this.audioPlayer.duration);
        }
    };
    
    // آپدیت هر ثانیه
    this.progressInterval = setInterval(() => {
        if (this.audioPlayer && !this.audioPlayer.paused) {
            const percent = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            progressFill.style.width = percent + '%';
            currentTimeSpan.textContent = this.formatMusicTime(this.audioPlayer.currentTime);
        }
    }, 1000);
}

formatMusicTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
stopBackgroundMusic() {
    if (this.audioPlayer) {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
        
        // بروزرسانی دکمه پخش/توقف
        const playPauseBtn = document.getElementById('player-play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        // ریست عنوان آهنگ
        const trackNameSpan = document.getElementById('player-track-name');
        if (trackNameSpan) {
            trackNameSpan.textContent = 'هیچ آهنگی در حال پخش نیست';
        }
        
        this.showToast('⏹️ موسیقی متوقف شد', 'info');
        this.updateMusicFloatingIcon(false);
        this.isMusicPlaying = false;
        this.currentPlayingMusic = null;
        
        // ریست نوار پیشرفت
        const progressFill = document.getElementById('progress-fill');
        const currentTimeSpan = document.getElementById('current-time-display');
        const totalTimeSpan = document.getElementById('total-time-display');
        
        if (progressFill) progressFill.style.width = '0%';
        if (currentTimeSpan) currentTimeSpan.textContent = '00:00';
        if (totalTimeSpan) totalTimeSpan.textContent = '00:00';
    }
}
setMusicVolume(volume) {
    if (this.audioPlayer) {
        this.audioPlayer.volume = volume / 100;
    }
}

changeBackgroundMusic(type) {
    if (this.audioPlayer && !this.audioPlayer.paused) {
        this.stopBackgroundMusic();
        setTimeout(() => this.playBackgroundMusic(), 100);
    }
}

formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ================================================
// پلیر پیشرفته موسیقی
// ================================================
setupMusicControls() {
    console.log('🎵 راه‌اندازی دکمه‌های پلیر موسیقی...');
    
    // دکمه پخش/توقف
    const playPauseBtn = document.getElementById('player-play-pause-btn');
    if (playPauseBtn) {
        // حذف رویدادهای قبلی
        const newPlayPauseBtn = playPauseBtn.cloneNode(true);
        playPauseBtn.parentNode.replaceChild(newPlayPauseBtn, playPauseBtn);
        
        newPlayPauseBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎵 کلیک روی پخش/توقف');
            this.togglePlayPause();
        };
        console.log('✅ دکمه پخش/توقف متصل شد');
    } else {
        console.log('❌ دکمه پخش/توقف پیدا نشد');
    }
    
    // دکمه توقف
    const stopBtn = document.getElementById('player-stop-btn');
    if (stopBtn) {
        const newStopBtn = stopBtn.cloneNode(true);
        stopBtn.parentNode.replaceChild(newStopBtn, stopBtn);
        
        newStopBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎵 کلیک روی توقف');
            this.stopBackgroundMusic();
        };
        console.log('✅ دکمه توقف متصل شد');
    }
    
    // دکمه بعدی
    const nextBtn = document.getElementById('player-next-btn');
    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        
        newNextBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎵 کلیک روی بعدی');
            this.playNext();
        };
        console.log('✅ دکمه بعدی متصل شد');
    }
    
    // دکمه قبلی
    const prevBtn = document.getElementById('player-prev-btn');
    if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        
        newPrevBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎵 کلیک روی قبلی');
            this.playPrevious();
        };
        console.log('✅ دکمه قبلی متصل شد');
    }
    
// نوار پیشرفت - ساده و درست
const progressBar = document.getElementById('progress-bar');
if (progressBar) {
    const newProgressBar = progressBar.cloneNode(true);
    progressBar.parentNode.replaceChild(newProgressBar, progressBar);
    
    newProgressBar.onclick = (e) => {
        if (this.audioPlayer && this.audioPlayer.duration) {
            const rect = newProgressBar.getBoundingClientRect();
            // محاسبه مستقیم از چپ به راست
            const clickX = e.clientX - rect.left;
            const percent = clickX / rect.width;
            // محدود کردن بین 0 و 1
            const finalPercent = Math.max(0, Math.min(1, percent));
            this.audioPlayer.currentTime = finalPercent * this.audioPlayer.duration;
        }
    };
    console.log('✅ نوار پیشرفت متصل شد');
}
// اسلایدر صدا - از چپ به راست با آیکون‌های درست
const volumeSlider = document.getElementById('player-volume-slider');
if (volumeSlider) {
    const newVolumeSlider = volumeSlider.cloneNode(true);
    volumeSlider.parentNode.replaceChild(newVolumeSlider, volumeSlider);
    
    newVolumeSlider.style.direction = 'ltr';
    
    // آپدیت آیکون‌ها هنگام تغییر صدا
    const updateVolumeIcons = (value) => {
        const volumeLowIcon = document.querySelector('.fa-volume-down');
        const volumeHighIcon = document.querySelector('.fa-volume-up');
        if (volumeLowIcon && volumeHighIcon) {
            if (value == 0) {
                volumeLowIcon.style.opacity = '0.5';
                volumeHighIcon.style.opacity = '0.5';
            } else if (value < 30) {
                volumeLowIcon.style.opacity = '1';
                volumeHighIcon.style.opacity = '0.5';
            } else if (value < 70) {
                volumeLowIcon.style.opacity = '0.7';
                volumeHighIcon.style.opacity = '0.7';
            } else {
                volumeLowIcon.style.opacity = '1';
                volumeHighIcon.style.opacity = '1';
            }
        }
    };
    
    newVolumeSlider.oninput = (e) => {
        const volume = e.target.value / 100;
        if (this.audioPlayer) {
            this.audioPlayer.volume = volume;
        }
        const volumePercent = document.getElementById('volume-percent');
        if (volumePercent) {
            volumePercent.textContent = e.target.value + '%';
        }
        updateVolumeIcons(parseInt(e.target.value));
        localStorage.setItem('musicVolume', e.target.value);
    };
    
    // بارگذاری تنظیمات صدا
    const savedVolume = localStorage.getItem('musicVolume') || 50;
    newVolumeSlider.value = savedVolume;
    const volumePercent = document.getElementById('volume-percent');
    if (volumePercent) volumePercent.textContent = savedVolume + '%';
    if (this.audioPlayer) {
        this.audioPlayer.volume = savedVolume / 100;
    }
    updateVolumeIcons(parseInt(savedVolume));
    
    console.log('✅ اسلایدر صدا متصل شد (LTR)');
}
}


togglePlayPause() {
    console.log('🎵 togglePlayPause فراخوانی شد');
    console.log('   - audioPlayer:', !!this.audioPlayer);
    console.log('   - isMusicPlaying:', this.isMusicPlaying);
    
    if (!this.audioPlayer || !this.currentPlayingMusic) {
        // اگه آهنگی انتخاب نشده، اولین آهنگ از لیست رو پخش کن
        this.getAllMusic().then(list => {
            if (list.length > 0) {
                this.playUploadedMusic(list[0].id);
            } else {
                this.showToast('🎵 هیچ موسیقی آپلود نشده است', 'warning');
            }
        });
        return;
    }
    
    if (this.isMusicPlaying) {
        this.audioPlayer.pause();
        this.isMusicPlaying = false;
        const playPauseBtn = document.getElementById('player-play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        this.updateMusicFloatingIcon(false);
        console.log('🎵 موسیقی متوقف شد');
    } else {
        this.audioPlayer.play();
        this.isMusicPlaying = true;
        const playPauseBtn = document.getElementById('player-play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        this.updateMusicFloatingIcon(true, this.currentPlayingMusic?.name);
        console.log('🎵 موسیقی شروع شد');
    }
}
updatePlayPauseButton(isPlaying) {
    const btn = document.getElementById('player-play-pause-btn');
    if (btn) {
        btn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }
}

updateFloatingIcon(isPlaying) {
    const icon = document.getElementById('music-floating-icon');
    if (icon) {
        icon.style.display = 'flex';
        if (isPlaying) {
            icon.classList.add('playing');
        } else {
            icon.classList.remove('playing');
        }
    }
}

playPrevious() {
    if (!this.currentPlaylist || this.currentPlaylist.length === 0) {
        this.getAllMusic().then(list => {
            if (list.length > 0) {
                this.currentPlaylist = list.map(m => m.id);
                this.currentIndex = list.length - 1;
                this.playUploadedMusic(this.currentPlaylist[this.currentIndex]);
            }
        });
        return;
    }
    
    this.currentIndex = (this.currentIndex - 1 + this.currentPlaylist.length) % this.currentPlaylist.length;
    this.playUploadedMusic(this.currentPlaylist[this.currentIndex]);
}

playNext() {
    if (!this.currentPlaylist || this.currentPlaylist.length === 0) {
        this.getAllMusic().then(list => {
            if (list.length > 0) {
                this.currentPlaylist = list.map(m => m.id);
                this.currentIndex = 0;
                this.playUploadedMusic(this.currentPlaylist[0]);
            }
        });
        return;
    }
    
    this.currentIndex = (this.currentIndex + 1) % this.currentPlaylist.length;
    this.playUploadedMusic(this.currentPlaylist[this.currentIndex]);
}

stopMusic() {
    if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.isPlaying = false;
        this.updatePlayPauseButton(false);
        this.updateFloatingIcon(false);
        
        const trackName = document.getElementById('player-track-name');
        const currentTime = document.getElementById('current-time-display');
        const totalTime = document.getElementById('total-time-display');
        const progressFill = document.getElementById('progress-fill');
        
        if (trackName) trackName.textContent = 'هیچ آهنگی در حال پخش نیست';
        if (currentTime) currentTime.textContent = '00:00';
        if (totalTime) totalTime.textContent = '00:00';
        if (progressFill) progressFill.style.width = '0%';
    }
}

playMusicById(musicId) {
    this.getMusicById(musicId).then(music => {
        if (!music) return;
        
        if (this.currentAudio) {
            this.currentAudio.pause();
        }
        
        this.currentAudio = new Audio(music.audioData);
        this.currentAudio.loop = false;
        
        const volumeSlider = document.getElementById('player-volume-slider');
        if (volumeSlider) {
            this.currentAudio.volume = volumeSlider.value / 100;
        }
        
        this.currentAudio.ontimeupdate = () => {
            const progress = (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
            const progressFill = document.getElementById('progress-fill');
            const currentTimeSpan = document.getElementById('current-time-display');
            
            if (progressFill) progressFill.style.width = progress + '%';
            if (currentTimeSpan) currentTimeSpan.textContent = this.formatTime(this.currentAudio.currentTime);
        };
        
        this.currentAudio.onloadedmetadata = () => {
            const totalTimeSpan = document.getElementById('total-time-display');
            const trackNameSpan = document.getElementById('player-track-name');
            
            if (totalTimeSpan) totalTimeSpan.textContent = this.formatTime(this.currentAudio.duration);
            if (trackNameSpan) trackNameSpan.textContent = music.name;
        };
        
        this.currentAudio.onended = () => {
            this.playNext();
        };
        
        this.currentAudio.play();
        this.isPlaying = true;
        this.updatePlayPauseButton(true);
        this.updateFloatingIcon(true);
        this.currentMusicId = musicId;
        this.showToast(`🎵 در حال پخش: ${music.name}`, 'success');
    });
}

formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
formatMusicTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
    // ================================================
    // مدیریت داده‌ها (Import/Export)
    // ================================================

// ================================================
// Export Data - خروجی کامل
// ================================================

async exportData() {
    try {
        this.showSimpleLoadingSpinner();
        
        const words = await this.getAllWords();
        const favorites = Array.from(this.favorites);
        
        const examples = await new Promise((resolve) => {
            const transaction = this.db.transaction(['examples'], 'readonly');
            const store = transaction.objectStore('examples');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
        
        const practiceHistory = await this.getAllPracticeHistory();
        const tagsData = Array.from(this.tags.entries());
        const srsData = this.srsData;
        
        const settings = {
            darkMode: localStorage.getItem('darkMode') === 'true',
            fontSize: localStorage.getItem('fontSize') || 'medium',
            theme: localStorage.getItem('theme') || 'default',
            wordListSort: localStorage.getItem('wordListSort') || 'alphabetical',
            practiceRange: localStorage.getItem('practiceRange') || 'all',
            practiceCount: localStorage.getItem('practiceCount') || '10',
            practiceOrder: localStorage.getItem('practiceOrder') || 'random',
            studyTimePerWord: localStorage.getItem('studyTimePerWord') || '5',
            musicVolume: localStorage.getItem('musicVolume') || '50',
            lexiCardStyle: localStorage.getItem('lexiCardStyle') || 'modern',
            exportWordsPerPage: localStorage.getItem('exportWordsPerPage') || '10',
            exportSortBy: localStorage.getItem('exportSortBy') || 'alphabetical',
            exportTheme: localStorage.getItem('exportTheme') || 'light',
            exportShowGender: localStorage.getItem('exportShowGender') !== 'false',
            exportShowType: localStorage.getItem('exportShowType') !== 'false',
            exportHeaderTitle: localStorage.getItem('exportHeaderTitle') || 'Elias.Dictionary'
        };
        
        const allChats = localStorage.getItem('all_chats');
        const currentChatId = localStorage.getItem('current_chat_id');
        const permanentMemory = localStorage.getItem('permanent_memory');
        
        const musicList = await this.getAllMusic();
        const books = await this.getAllBooksFromIndexedDB();
        
        const exportData = {
            version: 5,
            exportedAt: new Date().toISOString(),
            words: words,
            favorites: favorites,
            examples: examples,
            practiceHistory: practiceHistory,
            tags: tagsData,
            srsData: srsData,
            settings: settings,
            allChats: allChats,
            currentChatId: currentChatId,
            permanentMemory: permanentMemory,
            music: musicList.map(m => ({
                id: m.id,
                name: m.name,
                audioData: m.audioData,
                audioType: m.audioType,
                imageData: m.imageData,
                uploadDate: m.uploadDate
            })),
            books: books.map(b => ({
                id: b.id,
                title: b.title,
                author: b.author,
                pdfData: b.pdfData,
                coverData: b.coverData,
                createdAt: b.createdAt
            })),
            totalWords: words.length,
            totalPractice: practiceHistory.length,
            totalTags: this.tags.size
        };
        
        const jsonData = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `elias-dictionary-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.hideSimpleLoadingSpinner();
        this.showToast(`✅ تمام داده‌ها با موفقیت صادر شد (${words.length} لغت، ${this.tags.size} پوشه، ${practiceHistory.length} تمرین)`, 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        this.hideSimpleLoadingSpinner();
        this.showToast('❌ خطا در صدور داده‌ها: ' + error.message, 'error');
    }
}


// ================================================
// Import Data - ورودی کامل
// ================================================

async importData(file) {
    if (!file) return;
    
    this.showSimpleLoadingSpinner();
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!data.words || !Array.isArray(data.words)) {
            throw new Error('فرمت فایل نامعتبر است.');
        }
        
        const wordCount = data.words.length;
        const practiceCount = data.practiceHistory?.length || 0;
        const tagCount = data.tags?.length || 0;
        
        const isGerman = LanguageSystem.isGerman();
        const confirmMessage = isGerman 
            ? `⚠️ آیا از وارد کردن داده‌ها مطمئن هستید؟\n\n📚 ${wordCount} لغت\n📁 ${tagCount} پوشه\n🎯 ${practiceCount} تمرین\n\n⚠️ توجه: داده‌های فعلی کاملاً حذف می‌شوند.`
            : `⚠️ Are you sure?\n\n📚 ${wordCount} words\n📁 ${tagCount} folders\n🎯 ${practiceCount} practices\n\n⚠️ Current data will be replaced.`;
        
        if (!confirm(confirmMessage)) {
            this.hideSimpleLoadingSpinner();
            return;
        }
        
        await this.clearAllData();
        
        const keysToKeep = ['darkMode', 'fontSize', 'theme', 'learningLang'];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !keysToKeep.includes(key) && !key.startsWith('groq_')) {
                localStorage.removeItem(key);
            }
        }
        
        const transaction = this.db.transaction(
            ['words', 'favorites', 'examples', 'practiceHistory'],
            'readwrite'
        );
        
        const wordsStore = transaction.objectStore('words');
        const idMapping = new Map();
        
        for (const word of data.words) {
            const oldId = word.id;
            delete word.id;
            const newId = await new Promise((resolve, reject) => {
                const request = wordsStore.add(word);
                request.onsuccess = () => resolve(request.result);
                request.onerror = (e) => reject(e.target.error);
            });
            idMapping.set(oldId, newId);
        }
        console.log(`✅ ${data.words.length} لغت وارد شد`);
        
        if (data.favorites && Array.isArray(data.favorites)) {
            const favStore = transaction.objectStore('favorites');
            for (const favId of data.favorites) {
                const newWordId = idMapping.get(favId);
                if (newWordId) {
                    favStore.add({ wordId: newWordId });
                    this.favorites.add(newWordId);
                }
            }
        }
        
        if (data.examples && Array.isArray(data.examples)) {
            const exStore = transaction.objectStore('examples');
            for (const ex of data.examples) {
                const newWordId = idMapping.get(ex.wordId);
                if (newWordId) {
                    delete ex.id;
                    ex.wordId = newWordId;
                    exStore.add(ex);
                }
            }
        }
        
        if (data.practiceHistory && Array.isArray(data.practiceHistory)) {
            const phStore = transaction.objectStore('practiceHistory');
            for (const record of data.practiceHistory) {
                const newWordId = idMapping.get(record.wordId);
                if (newWordId) {
                    delete record.id;
                    record.wordId = newWordId;
                    phStore.add(record);
                }
            }
        }
        
        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(event.target.error);
        });
        
        if (data.tags && Array.isArray(data.tags)) {
            this.tags.clear();
            for (const [oldTagId, tagData] of data.tags) {
                const updatedWordIds = tagData.wordIds
                    .map(oldWordId => idMapping.get(oldWordId))
                    .filter(newId => newId !== undefined);
                
                this.tags.set(tagData.id, {
                    ...tagData,
                    wordIds: updatedWordIds
                });
            }
            this.saveTags();
            console.log(`✅ ${this.tags.size} تگ وارد شد`);
        }
        
        if (data.srsData) {
            this.srsData = {};
            for (const [oldWordId, srsItem] of Object.entries(data.srsData)) {
                const newWordId = idMapping.get(parseInt(oldWordId));
                if (newWordId) {
                    this.srsData[newWordId] = srsItem;
                }
            }
            this.saveSRSData();
            this.updateReviewWords();
        }
        
        if (data.settings) {
            const settings = data.settings;
            if (settings.darkMode !== undefined) {
                document.body.classList.toggle('dark-mode', settings.darkMode);
                localStorage.setItem('darkMode', settings.darkMode);
            }
            if (settings.fontSize) {
                document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge', 'font-xxlarge');
                document.body.classList.add(`font-${settings.fontSize}`);
                localStorage.setItem('fontSize', settings.fontSize);
            }
            if (settings.theme) {
                this.applyTheme(settings.theme);
            }
            if (settings.wordListSort) localStorage.setItem('wordListSort', settings.wordListSort);
            if (settings.practiceRange) localStorage.setItem('practiceRange', settings.practiceRange);
            if (settings.practiceCount) localStorage.setItem('practiceCount', settings.practiceCount);
            if (settings.practiceOrder) localStorage.setItem('practiceOrder', settings.practiceOrder);
            if (settings.studyTimePerWord) localStorage.setItem('studyTimePerWord', settings.studyTimePerWord);
            if (settings.musicVolume) localStorage.setItem('musicVolume', settings.musicVolume);
            if (settings.lexiCardStyle) localStorage.setItem('lexiCardStyle', settings.lexiCardStyle);
            if (settings.exportWordsPerPage) localStorage.setItem('exportWordsPerPage', settings.exportWordsPerPage);
            if (settings.exportSortBy) localStorage.setItem('exportSortBy', settings.exportSortBy);
            if (settings.exportTheme) localStorage.setItem('exportTheme', settings.exportTheme);
            if (settings.exportShowGender !== undefined) localStorage.setItem('exportShowGender', settings.exportShowGender);
            if (settings.exportShowType !== undefined) localStorage.setItem('exportShowType', settings.exportShowType);
            if (settings.exportHeaderTitle) localStorage.setItem('exportHeaderTitle', settings.exportHeaderTitle);
        }
        
        if (data.allChats) localStorage.setItem('all_chats', data.allChats);
        if (data.currentChatId) localStorage.setItem('current_chat_id', data.currentChatId);
        if (data.permanentMemory) localStorage.setItem('permanent_memory', data.permanentMemory);
        
        if (data.music && Array.isArray(data.music) && data.music.length > 0) {
            const musicTransaction = this.db.transaction(['music'], 'readwrite');
            const musicStore = musicTransaction.objectStore('music');
            for (const music of data.music) {
                musicStore.add(music);
            }
            await new Promise((resolve, reject) => {
                musicTransaction.oncomplete = () => resolve();
                musicTransaction.onerror = (e) => reject(e.target.error);
            });
        }
        
        if (data.books && Array.isArray(data.books) && data.books.length > 0) {
            const bookTransaction = this.db.transaction(['books'], 'readwrite');
            const bookStore = bookTransaction.objectStore('books');
            for (const book of data.books) {
                bookStore.add(book);
            }
            await new Promise((resolve, reject) => {
                bookTransaction.oncomplete = () => resolve();
                bookTransaction.onerror = (e) => reject(e.target.error);
            });
        }
        
        if (!data.srsData && data.practiceHistory && data.practiceHistory.length > 0) {
            await this.rebuildSRSFromHistory();
        }
        
        await this.loadFavorites();
        
        this.renderWordList();
        this.updateStats();
        this.renderTagFilterBar();
        this.updatePracticeTagFilter();
        this.addTagFilterToExportModal();
        
        this.hideSimpleLoadingSpinner();
        this.showToast(`✅ تمام داده‌ها با موفقیت وارد شد (${data.words.length} لغت، ${this.tags.size} پوشه)`, 'success');
        
        setTimeout(() => {
            if (confirm('برای اعمال کامل تغییرات، صفحه مجدداً بارگذاری شود؟')) {
                location.reload();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Import error:', error);
        this.hideSimpleLoadingSpinner();
        this.showToast('❌ خطا در وارد کردن داده‌ها: ' + error.message, 'error');
    }
}

async clearAllData() {
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(
            ['words', 'favorites', 'examples', 'practiceHistory', 'music', 'books'],
            'readwrite'
        );
        
        transaction.objectStore('words').clear();
        transaction.objectStore('favorites').clear();
        transaction.objectStore('examples').clear();
        transaction.objectStore('practiceHistory').clear();
        
        if (transaction.objectStoreNames.contains('music')) {
            transaction.objectStore('music').clear();
        }
        if (transaction.objectStoreNames.contains('books')) {
            transaction.objectStore('books').clear();
        }
        
        transaction.oncomplete = () => {
            this.favorites.clear();
            this.tags.clear();
            this.srsData = {};
            resolve();
        };
        transaction.onerror = (event) => reject(event.target.error);
    });
}

// تابع جدید برای بازسازی SRS از تاریخچه تمرین
async rebuildSRSFromHistory() {
    const practiceHistory = await this.getAllPracticeHistory();
    this.srsData = {};
    
    for (const record of practiceHistory) {
        const wordId = record.wordId;
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
        
        // محاسبه سطح
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
    
    this.saveSRSData();
    this.updateReviewWords();
    console.log('✅ SRS از تاریخچه تمرین بازسازی شد');
}

    async exportGermanWordsToTxt() {
        try {
            const words = await this.getAllWords();
            
            if (words.length === 0) {
                this.showToast('❌ هیچ لغتی برای ذخیره وجود ندارد', 'warning');
                return;
            }
            
            let txtContent = '';
            const sortedWords = words.sort((a, b) => a.german.localeCompare(b.german, 'de'));
            
            sortedWords.forEach(word => {
                txtContent += word.german + '\n';
            });
            
            const blob = new Blob([txtContent], { type: 'text/plain; charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `german-words-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast(`✅ ${words.length} لغت آلمانی ذخیره شد`, 'success');
            
        } catch (error) {
            console.error('Error exporting German words:', error);
            this.showToast('❌ خطا در ذخیره‌سازی لغات', 'error');
        }
    }

    async clearAllData() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(
                ['words', 'favorites', 'examples', 'practiceHistory'],
                'readwrite'
            );

            transaction.objectStore('words').clear();
            transaction.objectStore('favorites').clear();
            transaction.objectStore('examples').clear();
            transaction.objectStore('practiceHistory').clear();

            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(event.target.error);
        });
    }

    async resetData() {
        try {
            await this.clearAllData();
            localStorage.clear();
            this.favorites.clear();
            this.showToast('🔄 برنامه بازنشانی شد. صفحه مجدداً بارگذاری می‌شود...', 'info');
            setTimeout(() => location.reload(), 2000);
        } catch (error) {
            console.error('Reset error:', error);
            this.showToast('❌ خطا در بازنشانی برنامه', 'error');
        }
    }
// ================================================
// AI CHAT - تشخیص موبایل و اعمال کلاس‌های جدید
// ================================================

renderAIChat() {
    const container = document.getElementById('ai-chat-section');
    if (!container) return;
    
    this.chatMemory = [];
    this.isGeneratingImage = false;
    this.loadChatMemory();
    
    // تشخیص موبایل
    const isMobile = window.innerWidth <= 768;
    const isGerman = LanguageSystem.isGerman();
    
    // HTML پایه
    let html = `
        <div class="ai-chat-container ${isMobile ? 'mobile-view' : 'desktop-view'}">
            <!-- هدر -->
            <div class="ai-chat-header">
                <div class="header-left">
                    <div class="ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="header-info">
                        <h3>${LanguageSystem.t('ai.title')}</h3>
                        <p class="ai-subtitle">${LanguageSystem.t('ai.subtitle')}</p>
                    </div>
                </div>
                
                <div class="header-actions">
                    <button class="header-btn" id="ai-theme-toggle" title="تغییر تم">
                        <i class="fas fa-moon"></i>
                    </button>
                    <button class="header-btn" id="chat-history-btn" title="تاریخچه چت‌ها">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="header-btn" id="new-chat-btn" title="چت جدید">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="header-btn delete-btn" id="clear-chat-history" title="پاک کردن چت">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>

            <!-- بخش اصلی چت -->
            <div class="ai-chat-main">
                <!-- تاریخچه پیام‌ها -->
                <div class="chat-messages-container" id="chat-history">
                    ${this.renderWelcomeMessage()}
                </div>

                <!-- انتخاب مدل (فقط دسکتاپ) -->
                <div class="model-selection-row desktop-only">
                    <div class="model-label">
                        <i class="fas fa-brain"></i>
                        <span>${isGerman ? 'مدل هوش مصنوعی:' : 'AI Model:'}</span>
                    </div>
                    <div class="model-select-wrapper">
                        <select id="ai-model-select" class="model-select">
                         <option value="elias" selected>🤖مدل 1 (اختصاصی)</option>
                    </select>
                    </div>
                    <div class="model-status">
                        <span class="status-indicator online"></span>
                        <span class="status-text">${isGerman ? 'آنلاین' : 'Online'}</span>
                    </div>
                </div>

                <!-- بخش ورودی دسکتاپ -->
                <div class="chat-input-section desktop-input">
                    <div class="main-input-area">
                        <div class="input-wrapper">
                            <div class="input-actions-left">
                           
                            </div>
                            
                            <textarea 
                                id="ai-chat-input" 
                                class="chat-input-textarea" 
                                placeholder="${LanguageSystem.t('ai.placeholder')}"
                                rows="1"
                            ></textarea>
                            
                            <div class="input-actions-right">
                                <button class="input-action-btn voice-input-btn" id="voice-input-toggle" title="${isGerman ? 'ورودی صوتی' : 'Voice Input'}">
                                    <i class="fas fa-microphone"></i>
                                </button>
                                <button class="send-message-btn" id="send-ai-message">
                                    <i class="fas fa-paper-plane"></i>
                                    <span>${LanguageSystem.t('ai.send')}</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- وضعیت ورودی صوتی -->
                        <div class="voice-input-status" id="voice-input-status" style="display: none;"></div>
                    </div>
                </div>

                <!-- بخش ورودی موبایل -->
                <div class="mobile-input-section mobile-only">
                    <div class="mobile-input-wrapper">
                        <!-- دکمه جمع سمت چپ -->
                        <button class="mobile-menu-btn" id="mobile-menu-btn">
                            <i class="fas fa-plus"></i>
                        </button>
                        
                        <textarea 
                            id="mobile-chat-input" 
                            class="mobile-chat-textarea" 
                            placeholder="${LanguageSystem.t('ai.placeholder')}"
                            rows="1"
                        ></textarea>
                        
                        <div class="mobile-actions">
                            <button class="mobile-voice-btn" id="mobile-voice-toggle" title="${isGerman ? 'ورودی صوتی' : 'Voice Input'}">
                                <i class="fas fa-microphone"></i>
                            </button>
                            <button class="mobile-send-btn" id="mobile-send-message">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // فایل‌های مخفی
    const fileInputs = `
        <input type="file" id="file-upload-input" style="display: none;" multiple>
        <input type="file" id="image-upload-input" style="display: none;" accept="image/*">
    `;

    container.innerHTML = html + fileInputs;

    // راه‌اندازی event listenerها
    this.setupAIChatEventListeners();
   


    
    if (isMobile) {
        this.setupMobileView();
    }
    setTimeout(() => {
    this.forceHideFloatingButton();
}, 500);
}
// ================================================
// تنظیمات مخصوص موبایل
// ================================================

setupMobileView() {
    // انتقال متن از اینپوت دسکتاپ به موبایل
    const desktopInput = document.getElementById('ai-chat-input');
    const mobileInput = document.getElementById('mobile-chat-input');
    
    if (desktopInput && mobileInput) {
        desktopInput.addEventListener('input', function() {
            mobileInput.value = this.value;
            mobileInput.style.height = 'auto';
            mobileInput.style.height = (mobileInput.scrollHeight) + 'px';
        });
        
        mobileInput.addEventListener('input', function() {
            desktopInput.value = this.value;
            desktopInput.style.height = 'auto';
            desktopInput.style.height = (desktopInput.scrollHeight) + 'px';
        });
    }
    
    // دکمه ارسال موبایل
    document.getElementById('mobile-send-message')?.addEventListener('click', () => {
        this.sendAIMessage();
    });
    
    // دکمه میکروفن موبایل
    document.getElementById('mobile-voice-toggle')?.addEventListener('click', () => {
        this.toggleVoiceInput();
    });
    
    // دکمه جمع (منو)
    this.setupMobileMenu();
}
// ================================================
// نسخه نهایی و تضمینی - با !important و روش‌های مختلف
// ================================================

forceHideFloatingButton() {
    if (window.innerWidth > 768) return;
    
    const input = document.getElementById('ai-chat-input');
    const btn = document.getElementById('floating-book-btn');
    
    if (!btn) {
        console.log('❌ دکمه کتاب هنوز پیدا نشد');
        return;
    }
    
    if (!input) {
        console.log('❌ اینپوت پیدا نشد');
        return;
    }
    
  
    
    // تابع قوی برای مخفی کردن
    function hideButton() {
        btn.style.setProperty('display', 'none', 'important');
        btn.style.setProperty('opacity', '0', 'important');
        btn.style.setProperty('visibility', 'hidden', 'important');
        btn.style.setProperty('pointer-events', 'none', 'important');
    }
    
    // تابع قوی برای نمایش
    function showButton() {
        btn.style.setProperty('display', 'flex', 'important');
        btn.style.setProperty('opacity', '1', 'important');
        btn.style.setProperty('visibility', 'visible', 'important');
        btn.style.setProperty('pointer-events', 'auto', 'important');
    }
    
    // تابع بررسی
    function checkAndUpdate() {
        if (input.value.trim().length > 0) {
            hideButton();
            
        } else {
            showButton();
          
        }
    }
    
    // رویدادهای مختلف
    input.addEventListener('input', checkAndUpdate);
    input.addEventListener('keyup', checkAndUpdate);
    input.addEventListener('keydown', checkAndUpdate);
    input.addEventListener('change', checkAndUpdate);
    input.addEventListener('paste', () => setTimeout(checkAndUpdate, 10));
    input.addEventListener('cut', () => setTimeout(checkAndUpdate, 10));
    
    // چک کردن مداوم (هر 200 میلی‌ثانیه)
    const interval = setInterval(checkAndUpdate, 200);
    
    // اجرای اولیه
    checkAndUpdate();
    
    // اگه کاربر از صفحه خارج شد، interval رو پاک کن
    window.addEventListener('beforeunload', () => clearInterval(interval));
    
    console.log('✅ سیستم کنترل قوی فعال شد');
}



// ================================================
// منوی موبایل
// ================================================

setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (!menuBtn) return;
    
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menuBtn.classList.toggle('active');
        
        if (menuBtn.classList.contains('active')) {
            menuBtn.style.transform = 'rotate(45deg)';
            this.showMobileMenu();
        } else {
            menuBtn.style.transform = '';
            this.hideMobileMenu();
        }
    });
}

showMobileMenu() {
    this.hideMobileMenu();
    
    const menu = document.createElement('div');
    menu.id = 'mobile-menu-panel';
    menu.className = 'mobile-menu-panel';
    
    const items = [
        { icon: 'fa-paperclip', text: 'افزودن فایل', action: 'file' },
        { icon: 'fa-image', text: 'تحلیل تصویر', action: 'image' },
        { icon: 'fa-palette', text: 'تولید تصویر', action: 'generate' },
        { type: 'divider' },
        { icon: 'fa-brain', text: 'انتخاب مدل', action: 'model' },
        { icon: 'fa-trash', text: 'پاک کردن چت', action: 'clear' }
    ];
    
    menu.innerHTML = items.map(item => {
        if (item.type === 'divider') {
            return '<div class="menu-divider"></div>';
        }
        return `
            <button class="menu-item" data-action="${item.action}">
                <i class="fas ${item.icon}"></i>
                <span>${item.text}</span>
            </button>
        `;
    }).join('');
    
    document.body.appendChild(menu);
    
    // event listener برای آیتم‌ها
    menu.querySelectorAll('.menu-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            
            switch(action) {
                case 'file':
                    document.getElementById('file-upload-input')?.click();
                    break;
                case 'image':
                    document.getElementById('image-upload-input')?.click();
                    break;
                case 'generate':
                    const input = document.getElementById('mobile-chat-input') || document.getElementById('ai-chat-input');
                    if (input.value.trim()) {
                        this.generateImageWithAI(input.value.trim());
                    }
                    break;
                case 'model':
                    const modelSelect = document.getElementById('ai-model-select');
                    if (modelSelect) {
                        modelSelect.style.display = 'block';
                        modelSelect.focus();
                    }
                    break;
                case 'clear':
                    if (confirm('آیا چت پاک شود؟')) {
                        this.clearChatHistory();
                    }
                    break;
            }
            
            this.hideMobileMenu();
        });
    });
    
    // بستن با کلیک بیرون
    setTimeout(() => {
        const clickHandler = (e) => {
            const menu = document.getElementById('mobile-menu-panel');
            const btn = document.getElementById('mobile-menu-btn');
            if (menu && !menu.contains(e.target) && e.target !== btn) {
                this.hideMobileMenu();
                document.removeEventListener('click', clickHandler);
            }
        };
        document.addEventListener('click', clickHandler);
    }, 100);
}

hideMobileMenu() {
    const menu = document.getElementById('mobile-menu-panel');
    if (menu) menu.remove();
    
    const btn = document.getElementById('mobile-menu-btn');
    if (btn) {
        btn.classList.remove('active');
        btn.style.transform = '';
    }
}

renderWelcomeMessage() {
    const isGerman = LanguageSystem.isGerman();
    
    return `
        <div class="message ai-message welcome-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    <h4>🤖 ${isGerman ? 'سلام!  خوش آمدید' : 'Hello! Welcome to Elias'}</h4>
                    <p>${isGerman ? 'من دستیار هوش مصنوعی شما هستم با حافظه کامل - هر چی بگی یادم میاد!' : 'I am your AI assistant with full memory - I remember everything you say!'}</p>
                    <p>${isGerman ? 'می‌تونی از این قابلیت‌ها استفاده کنی:' : 'You can use these features:'}</p>
                    <ul style="margin-top: 10px; padding-right: 20px;">
                        <li>📝 <strong>${isGerman ? 'مکالمه عادی' : 'Normal Conversation'}</strong> - ${isGerman ? 'هر چی بگی یادم میاد' : 'I remember everything'}</li>
                        <li>🎤 <strong>${isGerman ? 'ورودی صوتی' : 'Voice Input'}</strong> - ${isGerman ? 'با میکروفون صحبت کن' : 'Speak with microphone'}</li>
                        <li>🖼️ <strong>${isGerman ? 'تحلیل تصویر' : 'Image Analysis'}</strong> - ${isGerman ? 'عکس آپلود کن' : 'Upload images'}</li>
                        <li>🎨 <strong>${isGerman ? 'تولید تصویر' : 'Image Generation'}</strong> - ${isGerman ? 'هر چی میخوای بگو' : 'Describe what you want'}</li>
                    </ul>
                </div>
                <div class="message-time">${new Date().toLocaleTimeString('fa-IR')}</div>
            </div>
        </div>
    `;
}

// ================================================
// سوالات سریع
// ================================================

renderQuickQuestions() {
    const questions = [
        { icon: 'fa-language', text: 'صرف فعل', question: 'چگونه افعال آلمانی را صرف کنم؟' },
        { icon: 'fa-venus-mars', text: 'جنسیت اسم‌ها', question: 'تفاوت der, die, das چیست؟' },
        { icon: 'fa-comment-alt', text: 'جمله‌سازی', question: 'جمله‌سازی آلمانی آموزش بده' },
        { icon: 'fa-volume-up', text: 'تلفظ', question: 'تلفظ صحیح کلمات آلمانی' }
    ];
    
    return questions.map(q => `
        <button class="quick-action-btn" data-question="${q.question}">
            <div class="action-icon">
                <i class="fas ${q.icon}"></i>
            </div>
            <div class="action-text">
                <span>${q.text}</span>
            </div>
        </button>
    `).join('');
}

setupAIChatEventListeners() {
    
    // ========== ارسال پیام ==========
    const sendBtn = document.getElementById('send-ai-message');
   // پشتیبانی از paste تصویر در input
const chatInput = document.getElementById('ai-chat-input');
if (chatInput) {
    chatInput.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.uploadedImage = file;
                    this.uploadedImageUrl = ev.target.result;
                    document.querySelector('.input-image-preview')?.remove();
                    const wrapper = document.querySelector('.input-wrapper');
                    const preview = document.createElement('div');
                    preview.className = 'input-image-preview';
                    preview.style.cssText = `display:flex;align-items:center;gap:8px;padding:6px 10px;
                        background:rgba(67,97,238,0.08);border-radius:8px;margin-bottom:6px;
                        font-family:'Vazirmatn',sans-serif;font-size:12px;`;
                    preview.innerHTML = `
                        <img src="${ev.target.result}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;">
                        <span style="flex:1;color:#4361ee;">تصویر paste شد</span>
                        <button onclick="this.closest('.input-image-preview').remove();window.dict.uploadedImage=null;window.dict.uploadedImageUrl=null;"
                            style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:14px;">✕</button>
                    `;
                    if (wrapper) wrapper.insertAdjacentElement('beforebegin', preview);
                    this.showToast('📋 تصویر paste شد — پیام بفرست', 'info');
                };
                reader.readAsDataURL(file);
                return;
            }
        }
    });
}
    
    if (sendBtn) {
        sendBtn.addEventListener('click', () => this.sendAIMessage());
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendAIMessage();
            }
        });
        
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    // ========== دکمه پاک کردن ==========
    document.getElementById('clear-input-btn')?.addEventListener('click', () => {
        if (chatInput) chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.focus();
    });
    
    // ========== میکروفن ساده ==========
    document.getElementById('voice-input-toggle')?.addEventListener('click', () => {
        this.toggleVoiceInput();
    });
    
    document.getElementById('stop-voice-input')?.addEventListener('click', () => {
        this.stopVoiceInput();
    });
    
    // ========== دکمه تغییر تم ==========
    document.getElementById('ai-theme-toggle')?.addEventListener('click', () => {
        this.toggleAITheme();
    });
    
    // ========== دکمه تاریخچه چت ==========
    document.getElementById('chat-history-btn')?.addEventListener('click', () => {
        this.showChatHistoryModal();
    });
    
    // ========== دکمه چت جدید ==========
    document.getElementById('new-chat-btn')?.addEventListener('click', () => {
        this.newChat();
    });
    
    // ========== دکمه پاک کردن تاریخچه ==========
    document.getElementById('clear-chat-history')?.addEventListener('click', () => {
        this.clearChatHistory();
    });
    

    
}

// ================================================
// تنظیمات صدا
// ================================================

setupVoiceSettingsControls() {
    const speedSlider = document.getElementById('voice-speed');
    const pitchSlider = document.getElementById('voice-pitch');
    const languageSelect = document.getElementById('voice-language');
    const autoPlayCheck = document.getElementById('auto-play-response');
    
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            document.getElementById('speed-value').textContent = e.target.value + 'x';
            this.currentVoiceSettings.speed = parseFloat(e.target.value);
        });
    }
    
    if (pitchSlider) {
        pitchSlider.addEventListener('input', (e) => {
            document.getElementById('pitch-value').textContent = e.target.value;
            this.currentVoiceSettings.pitch = parseFloat(e.target.value);
        });
    }
    
    document.getElementById('save-voice-settings')?.addEventListener('click', () => {
        this.saveVoiceSettings();
    });
    
    document.getElementById('test-voice-settings')?.addEventListener('click', () => {
        this.testVoiceSettings();
    });
    
    document.getElementById('reset-voice-settings')?.addEventListener('click', () => {
        this.resetVoiceSettings();
    });
}


// ================================================
// حافظه چت
// ================================================
loadCurrentChatMemory() {
    try {
        const saved = localStorage.getItem(`chat_memory_${this.currentChatId}`);
        if (saved) {
            this.currentChatHistory = JSON.parse(saved);
            console.log(`✅ حافظه چت ${this.currentChatId} بارگذاری شد (${this.currentChatHistory.length} پیام)`);
        } else {
            this.currentChatHistory = [];
            console.log(`🆕 چت جدید ${this.currentChatId} - بدون حافظه قبلی`);
        }
    } catch (e) {
        console.error('خطا در بارگذاری حافظه چت:', e);
        this.currentChatHistory = [];
    }
}
loadPermanentMemory() {
    try {
        const saved = localStorage.getItem('permanent_memory');
        if (saved) {
            this.permanentMemory = JSON.parse(saved);
        } else {
            this.permanentMemory = {};
        }
    } catch (e) {
        this.permanentMemory = {};
    }
}
savePermanentMemory() {
    localStorage.setItem('permanent_memory', JSON.stringify(this.permanentMemory));
}
// ================================================
// سیستم حافظه یکپارچه
// ================================================

addToMemory(role, content) {
    if (!this.chatMemory) this.chatMemory = [];
    this.chatMemory.push({ role, content, timestamp: new Date().toISOString() });
    // نگه داشتن ۲۰ پیام آخر
    if (this.chatMemory.length > 20) this.chatMemory = this.chatMemory.slice(-20);
    localStorage.setItem(`chat_${this.currentChatId}`, JSON.stringify(this.chatMemory));
}

getMemoryForAI() {
    if (!this.chatMemory || this.chatMemory.length === 0) return [];
    // آخرین ۱۰ پیام رو به فرمت messages array برگردون
    return this.chatMemory.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
    }));
}
saveChatMemory() {
    try {
        localStorage.setItem('aiChatMemory', JSON.stringify(this.chatMemory));
    } catch (e) {
        console.error('خطا در ذخیره حافظه:', e);
    }
}

loadChatMemory() {
    try {
        // بازیابی ID چت فعلی
        this.currentChatId = localStorage.getItem('current_chat_id') || ('chat_' + Date.now());
        localStorage.setItem('current_chat_id', this.currentChatId);

        // بارگذاری از all_chats (منبع اصلی)
        const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
        const currentChat = allChats.find(c => c.id === this.currentChatId);

        if (currentChat) {
            this.chatMemory = currentChat.messages.map(m => ({
                role: m.type === 'user' ? 'user' : 'assistant',
                content: m.content,
                timestamp: m.timestamp || new Date().toISOString()
            }));
            // نمایش پیام‌های قبلی
            setTimeout(() => {
                const chatHistory = document.getElementById('chat-history');
                if (chatHistory && this.chatMemory.length > 0) {
                    chatHistory.innerHTML = '';
                    this.chatMemory.forEach(msg => {
                        this.addMessageToHistory(msg.role === 'user' ? 'user' : 'ai', msg.content, false);
                    });
                    this.scrollToBottom();
                }
            }, 300);
        } else {
            this.chatMemory = [];
        }
    } catch (e) {
        console.error('خطا در بارگذاری حافظه:', e);
        this.chatMemory = [];
        this.currentChatId = 'chat_' + Date.now();
    }
}
clearMemory() {
    this.currentChatHistory = [];
    localStorage.removeItem(`chat_memory_${this.currentChatId}`);
    console.log(`🗑️ حافظه چت ${this.currentChatId} پاک شد`);
}

async sendAIMessage() {
    const apiKey = this.getGroqApiKey();
if (!apiKey) {
    this.addMessageToHistory('ai', '⚠️ لطفاً ابتدا در بخش تنظیمات، کلید API خود را وارد کنید.', true);
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>ارسال</span>';
    return;
}
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('send-ai-message');
    if (!input || !sendBtn) return;

    const message = input.value.trim();
    if (!message && !this.uploadedImage) {
        this.showToast('✏️ لطفاً پیام خود را وارد کنید', 'warning');
        return;
    }

    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

    const hasImage = !!this.uploadedImage;
    const imageUrl = this.uploadedImageUrl;

    // پاک کردن input
    input.value = '';
    input.style.height = 'auto';
    const mobileInput = document.getElementById('mobile-chat-input');
    if (mobileInput) { mobileInput.value = ''; mobileInput.style.height = 'auto'; }
    document.querySelector('.input-image-preview')?.remove();

    // نمایش پیام کاربر
    const displayMsg = hasImage && this.uploadedImage
        ? (message ? `${message}\n\n📸 [تصویر: ${this.uploadedImage.name}]` : `📸 [تصویر: ${this.uploadedImage.name}]`)
        : message;

    await this.addMessageWithImageToHistory('user', message, imageUrl);
    this.addToMemory('user', displayMsg);

    this.showTypingIndicator();

    try {



// داخل sendAIMessage، قسمت systemMsg رو اینطور عوض کن
const systemMsg = {
    role: 'system',
    content: `تو یک دستیار هوشمند به نام "الیاس" هستی. خیلی صمیمی و دوستانه صحبت کن. حتماً از ایموجی‌های مناسب استفاده کن مثل 📚 🎯 💡 ✨ ⭐ ✅ ❌ ⚠️ 🎉 🔥 🚀.
  هیچ وقت از نوشته های عجیب غریب استفاده نکن مثل چینی یا انگلیسی یا  روسی 需要  هیچی 


⚠️ قانون مهم در مورد فرمت پاسخ:
حتماً از Markdown استفاده کن برای زیباتر شدن پاسخ‌ها:



⚠️ قانون بسیار مهم در مورد سازنده:
اگر کاربر پرسید "تو رو کی ساخته؟"، "سازنده تو کیه؟"، "who made you?"، "سازنده‌ات کیه؟"، "کی ساخته‌ات؟"، "مالک تو کیه؟" یا هر سوال مشابهی درباره سازنده، حتماً پاسخ بده:
"من توسط **الیاس حسینی** ساخته شده‌ام. ایشون یک برنامه‌نویس و توسعه‌دهنده وب هستند که دیکشنری هوشمند Elias.Dictionary رو طراحی کردن."

- برای **عنوان اصلی**: # عنوان (بزرگ و پررنگ) با ایموجی مناسب
- برای **زیرعنوان**: ## عنوان (متوسط)
- برای **بولد کردن متن مهم**: **متن**
- برای **ایتالیک**: *متن*
- برای **لیست**: - مورد اول / - مورد دوم
- برای **لیست شماره‌دار**: 1. متن / 2. متن
- برای **نقل قول**: > متن نقل قول
- برای **کد**: \`کد\`
- برای **جدول**: | ستون1 | ستون2 | و سپس خط تیره و محتوا

مثال پاسخ خوب:
# 📚 راهنمای یادگیری آلمانی

سلام دوست عزیز! 😊 خوشحالم که به دنبال یادگیری آلمانی هستی.

**نکته مهم**: برای یادگیری بهتر این مراحل رو دنبال کن:

1. ✨ **لغات پایه** رو حفظ کن (هر روز ۱۰ لغت جدید)
2. 📖 **گرامر** رو قدم به قدم یاد بگیر
3. 🎯 هر روز **تمرین** کن (فلش‌کارت خیلی کمک میکنه)

> "تکرار، مادر مهارت است" 💪

| سطح | تعداد لغت | زمان پیشنهادی |
|-----|---------|--------------|
| A1 | 500 | ۲ ماه |
| A2 | 1000 | ۳ ماه |

**موفق باشی!** 🌟 هر سوالی داری بپرس.

اطلاعات دیکشنری کاربر:
${await this._getDictionaryContext()}

❗ یادت نره: فقط زمانی که کاربر به طور مشخص درخواست رفتن به یک بخش کرد، دکمه مناسب رو نشون بده.`
};
        // ساختن messages array با حافظه
        const historyMsgs = this.getMemoryForAI();
        // آخرین پیام user رو که الان فرستادیم از history حذف کن (چون الان اضافه میشه)
        const msgsWithoutLast = historyMsgs.slice(0, -1);

        let fullMessages;
        if (hasImage && imageUrl) {
            fullMessages = [
                systemMsg,
                ...msgsWithoutLast,
                {
                    role: 'user',
                    content: [
                        { type: 'image_url', image_url: { url: imageUrl } },
                        { type: 'text', text: message || 'این تصویر را تحلیل کن.' }
                    ]
                }
            ];
        } else {
            fullMessages = [
                systemMsg,
                ...msgsWithoutLast,
                { role: 'user', content: message }
            ];
        }

   const response = await this._puterChat(fullMessages, {});
        this.removeTypingIndicator();

        // استخراج متن پاسخ
        let fullResponse = '';
        if (response?.message?.content?.[0]?.text) fullResponse = response.message.content[0].text;
        else if (Array.isArray(response?.message?.content)) fullResponse = response.message.content.map(c => c.text || '').join('');
        else if (typeof response?.message?.content === 'string') fullResponse = response.message.content;
        else if (typeof response === 'string') fullResponse = response;
        else if (response?.text) fullResponse = response.text;
        else fullResponse = 'پاسخی دریافت نشد';

        await this.addMessageToHistory('ai', fullResponse);
        this.addToMemory('assistant', fullResponse);
        this.saveCompleteChat();

    
        this.uploadedImageUrl = null;

    } catch (error) {
        console.error('❌ خطا:', error);
        this.removeTypingIndicator();
        await this.addMessageToHistory('ai', '⚠️ خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>ارسال</span>';
    }
}
async _getDictionaryContext() {
    try {
        const words = await this.getAllWords();
        const total = words.length;
        const nouns = words.filter(w => w.type === 'noun').length;
        const verbs = words.filter(w => w.type === 'verb').length;
        const adjs  = words.filter(w => w.type === 'adjective').length;
        const srsKeys = Object.keys(this.srsData || {});
        const learned = srsKeys.filter(k => (this.srsData[k]?.level || 0) >= 3).length;
        const recent = words.slice(-3).map(w => `${w.german} (${w.persian})`).join('، ');
        
        return `اطلاعات دیکشنری کاربر:
تعداد کل لغات: ${total} (${nouns} اسم، ${verbs} فعل، ${adjs} صفت)
لغات یاد گرفته: ${learned}
آخرین لغات: ${recent || 'هنوز لغتی اضافه نشده'}

بخش‌های برنامه (آیدی هر بخش): 
- search-section (جستجو)
- add-word-section (افزودن لغت) 
- translate-section (مترجم)
- practice-section (تمرین)
- flashcards-section (فلش‌کارت)
- word-list-section (لیست لغات)
- progress-section (پیشرفت)
- settings-section (تنظیمات)

❗ قانون مهم: 
فقط و فقط زمانی که کاربر به طور مشخص درخواست رفتن به یک بخش را کرد، دکمه مناسب را نشان بده.
مثال: کاربر گفت "میخوام برم به بخش مترجم" -> آن وقت دکمه مترجم را نشون بده.
اگر کاربر فقط یک سوال عادی پرسید، مثل "حالت چطوره" یا "هالو یعنی چی"، بدون هیچ دکمه‌ای پاسخ بده.

برای نمایش دکمه از این کد استفاده کن (فقط زمانی که کاربر خواست):
<button onclick="dictionaryApp.showSection('SECTION_ID')" style="background:linear-gradient(135deg,#4361ee,#7c3aed);color:white;border:none;border-radius:20px;padding:5px 14px;cursor:pointer;font-family:Vazirmatn,sans-serif;font-size:12px;margin:4px 0;display:inline-flex;align-items:center;gap:5px;"><i class="fas fa-arrow-left"></i> رفتن به نام‌بخش</button>

مثال: رفتن به لیست لغات -> SECTION_ID = word-list-section
مثال: رفتن به مترجم -> SECTION_ID = translate-section
مثال: رفتن به تنظیمات -> SECTION_ID = settings-section

هیچوقت برای پاسخ به سلام یا احوالپرسی از دکمه استفاده نکن.`;
    } catch {
        return 'اطلاعات دیکشنری در دسترس نیست';
    }
}
async addMessageWithImageToHistory(sender, message, imageUrl) {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;
    
    const time = new Date().toLocaleTimeString('fa-IR');
    const messageClass = sender === 'user' ? 'user-message' : 'ai-message';
    
    let imageHtml = '';
    if (imageUrl) {
        imageHtml = `
            <div class="uploaded-image-container" style="margin: 10px 0;">
                <img src="${imageUrl}" style="max-width: 150px; max-height: 120px; border-radius: 12px; cursor: pointer;" 
                     onclick="dictionaryApp.showImageFullscreen('${imageUrl}')">
            </div>
        `;
    }
    
    const messageHtml = `
        <div class="message ${messageClass}" style="animation: fadeInUp 0.3s ease;">
            <div class="message-avatar">
                <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    ${message ? this.escapeHtml(message).replace(/\n/g, '<br>') : ''}
                    ${imageHtml}
                </div>
                <div class="message-time">${time}</div>
            </div>
        </div>
    `;
    
    chatHistory.insertAdjacentHTML('beforeend', messageHtml);
    this.scrollToBottom();
}

addMessageToHistory(sender, message, scroll = true) {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;

    const time = new Date().toLocaleTimeString('fa-IR');

    if (sender === 'user') {
        const formatted = `<p style="margin:0;line-height:1.6;">${this.escapeHtml(message).replace(/\n/g, '<br>')}</p>`;
        chatHistory.insertAdjacentHTML('beforeend', `
            <div class="message user-message" style="animation:ai-fadeInUp 0.25s ease;">
                <div class="message-avatar" style="width:30px;height:30px;font-size:13px;flex-shrink:0;">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-content" style="font-size:13px;">
                    <div class="message-text">${formatted}</div>
                    <div class="message-time" style="font-size:10px;margin-top:3px;">${time}</div>
                </div>
            </div>
        `);
    } else {
        const formatted = this._formatAIMessage(message);
        chatHistory.insertAdjacentHTML('beforeend', `
            <div class="message ai-message" style="animation:ai-fadeInUp 0.25s ease;">
                <div class="message-avatar" style="width:30px;height:30px;font-size:13px;flex-shrink:0;">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content" style="font-size:13px;">
                    <div class="message-text">${formatted}</div>
                    <div class="message-time" style="font-size:10px;margin-top:3px;">${time}</div>
                </div>
            </div>
        `);
    }

    if (scroll) this.scrollToBottom();
}

_typewriterEffect(container, fullText, scroll = true) {
    const formatted = this._formatAIMessage(fullText);

    // برای متن‌های کوتاه — مستقیم نشون بده
    if (fullText.length < 80) {
        container.innerHTML = formatted;
        if (scroll) this.scrollToBottom();
        return;
    }

    // برای متن‌های بلند — typewriter روی متن خام، بعد format
    container.innerHTML = '';
    const words = fullText.split(' ');
    let i = 0;
    let current = '';

    const step = () => {
        if (i >= words.length) {
            // در پایان، نمایش formatted کامل
            container.innerHTML = this._formatAIMessage(fullText);
            if (scroll) this.scrollToBottom();
            return;
        }

        // هر بار ۲ کلمه اضافه کن
        const chunk = words.slice(i, i + 2).join(' ');
        current += (i === 0 ? '' : ' ') + chunk;
        i += 2;

        // نمایش ساده در حین تایپ
        container.innerHTML = `<p style="line-height:1.7;">${this.escapeHtml(current)}<span style="
            display:inline-block;width:2px;height:1em;background:var(--primary,#4361ee);
            margin-right:2px;vertical-align:middle;animation:ai-blink 0.7s infinite;">
        </span></p>`;

        if (scroll) this.scrollToBottom();

        // سرعت تایپ بر اساس طول متن
        const delay = fullText.length > 500 ? 18 : fullText.length > 200 ? 25 : 35;
        setTimeout(step, delay);
    };

    // اضافه کردن انیمیشن blink اگه نیاز بود
    if (!document.getElementById('ai-suggestion-style')?.textContent.includes('ai-blink')) {
        const style = document.getElementById('ai-suggestion-style') || document.createElement('style');
        if (!style.id) style.id = 'ai-suggestion-style-extra';
        style.textContent += `
            @keyframes ai-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        `;
        if (!style.parentNode) document.head.appendChild(style);
    }

    step();
}
_formatAIMessage(text) {
    if (!text) return '';
    
    // استخراج دکمه‌ها
    const btnPlaceholders = [];
    let t = text.replace(/<button[\s\S]*?<\/button>/gi, (match) => {
        const idx = btnPlaceholders.length;
        btnPlaceholders.push(match);
        return `%%BTN_${idx}%%`;
    });
    
    // ایموجی‌ها و آیکون‌های خاص
    const emojiMap = {
        '✅': '<span style="color: #10b981;">✅</span>',
        '❌': '<span style="color: #ef4444;">❌</span>',
        '⚠️': '<span style="color: #f59e0b;">⚠️</span>',
        '📚': '<span style="color: #8b5cf6;">📚</span>',
        '🎯': '<span style="color: #f59e0b;">🎯</span>',
        '💡': '<span style="color: #fbbf24;">💡</span>',
        '✨': '<span style="color: #ec4899;">✨</span>',
        '⭐': '<span style="color: #fbbf24;">⭐</span>',
        '🎉': '<span style="color: #f59e0b;">🎉</span>',
        '🔥': '<span style="color: #ef4444;">🔥</span>',
        '🚀': '<span style="color: #3b82f6;">🚀</span>',
        '🌟': '<span style="color: #fbbf24;">🌟</span>',
        '💪': '<span style="color: #ef4444;">💪</span>',
        '😊': '<span style="color: #f59e0b;">😊</span>',
        '📖': '<span style="color: #8b5cf6;">📖</span>',
        '🔑': '<span style="color: #fbbf24;">🔑</span>',
        '🎓': '<span style="color: #8b5cf6;">🎓</span>',
        '🏆': '<span style="color: #fbbf24;">🏆</span>'
    };
    
    for (const [emoji, html] of Object.entries(emojiMap)) {
        t = t.split(emoji).join(html);
    }
    
    // هدرها
    t = t.replace(/^# (.*$)/gm, '<h1 style="font-size: 24px; font-weight: 800; margin: 20px 0 12px; background: linear-gradient(135deg, #4361ee, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; border-bottom: 2px solid #4361ee; display: inline-block; padding-bottom: 5px;">$1</h1>');
    t = t.replace(/^## (.*$)/gm, '<h2 style="font-size: 20px; font-weight: 700; margin: 16px 0 10px; color: #4361ee; border-right: 4px solid #4361ee; padding-right: 12px;">$1</h2>');
    t = t.replace(/^### (.*$)/gm, '<h3 style="font-size: 17px; font-weight: 600; margin: 14px 0 8px; color: #5b21b6; display: flex; align-items: center; gap: 8px;"><span style="background: #8b5cf6; width: 6px; height: 20px; display: inline-block; border-radius: 3px;"></span> $1</h3>');
    
    // بولد و ایتالیک
    t = t.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em style="color: #ec4899;">$1</em></strong>');
    t = t.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff; font-weight: 700;">$1</strong>');
    t = t.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #64748b;">$1</em>');
    
    // نقل قول
    t = t.replace(/^> (.*$)/gm, '<blockquote style="border-right: 4px solid #8b5cf6; background: linear-gradient(135deg, rgba(139,92,246,0.05), rgba(67,97,238,0.05)); padding: 12px 18px; margin: 15px 0; border-radius: 16px; font-style: italic; color: #4c1d95;">💬 $1</blockquote>');
    
    // لیست بولت پوینت
    t = t.replace(/^[•\-]\s+(.*$)/gm, '<li style="margin: 8px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #8b5cf6; font-size: 18px;">✨</span><span>$1</span></li>');
    t = t.replace(/(<li.*<\/li>\n?)+/g, '<ul style="margin: 12px 0; list-style: none; padding-right: 0;">$&</ul>');
    
    // لیست شماره‌دار با دایره رنگی
    t = t.replace(/^(\d+)\.\s+(.*$)/gm, (match, num, content) => {
        return `<li style="margin: 8px 0; display: flex; align-items: flex-start; gap: 10px;"><span style="background: linear-gradient(135deg, #4361ee, #8b5cf6); color: white; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 12px; font-weight: 700; flex-shrink: 0;">${num}</span><span style="flex: 1;">${content}</span></li>`;
    });
    
// ========== قسمت جدول - همه متن‌ها سفید ==========
t = t.replace(/\|(.+)\|/g, (match) => {
    const rows = match.split('\n');
    let tableHtml = '<div style="overflow-x: auto; margin: 20px 0; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"><table style="width: 100%; border-collapse: collapse; border-radius: 16px; overflow: hidden; font-family: \'Vazirmatn\', sans-serif;">';
    let isHeader = true;
    
    for (const row of rows) {
        if (row.includes('---')) continue;
        const cells = row.split('|').filter(c => c.trim());
        
        tableHtml += '<tr>';
        cells.forEach((cell, idx) => {
            const cellText = cell.trim();
            
            if (isHeader) {
                // هدر جدول - آبی با متن سفید
                tableHtml += `<th style="border: 1px solid #334155; padding: 12px 15px; background: linear-gradient(135deg, #1e40af, #3b82f6); color: #ffffff; font-weight: 700; text-align: center;">${cellText}</th>`;
            } else {
                // همه سلول‌های داده - متن سفید
                let cellStyle = 'border: 1px solid #334155; padding: 12px 15px; color: #ffffff; background: #1e293b; text-align: right;';
                
                // ستون اول (معمولاً شماره یا عنوان) - مرکز چین
                if (idx === 0) {
                    cellStyle += ' font-weight: 700; text-align: center;';
                }
                
                // تشخیص ستون آلمانی برای چپ‌چین کردن (اختیاری)
                if (cellText.match(/^[a-zA-ZÄäÖöÜüß]/) && !isHeader) {
                    cellStyle += ' direction: ltr; text-align: left;';
                }
                
                tableHtml += `<td style="${cellStyle}">${cellText}</td>`;
            }
        });
        tableHtml += '</tr>';
        isHeader = false;
    }
    tableHtml += '</table></div>';
    return tableHtml;
});
    
    // کد اینلاین
    t = t.replace(/`(.*?)`/g, '<code style="background: #1e293b; color: #e2e8f0; padding: 3px 10px; border-radius: 8px; font-family: monospace; font-size: 13px;">$1</code>');
    
    // کد بلوک
    t = t.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre style="background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 16px; overflow-x: auto; font-family: monospace; font-size: 13px; margin: 15px 0;"><code>${this.escapeHtml(code.trim())}</code></pre>`;
    });
    
    // خطوط افقی گرادینت
    t = t.replace(/^---+$/gm, '<hr style="border: none; height: 2px; background: linear-gradient(90deg, transparent, #4361ee, #8b5cf6, #4361ee, transparent); margin: 25px 0; border-radius: 2px;">');
    
    // پاراگراف‌ها
    const lines = t.split('\n');
    const result = [];
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<hr') || 
            trimmed.startsWith('<div') || trimmed.startsWith('<pre') || trimmed.startsWith('<blockquote') ||
            trimmed.startsWith('<table') || trimmed.startsWith('%%BTN_')) {
            result.push(trimmed);
        } else {
            result.push(`<p style="margin: 12px 0; line-height: 1.8; font-size: 15px;">${trimmed}</p>`);
        }
    }
    
    let html = result.join('\n');
    
    // برگردوندن دکمه‌ها
    btnPlaceholders.forEach((btn, idx) => {
        html = html.replace(`%%BTN_${idx}%%`, btn);
    });
    
    return `<div class="ai-formatted-response" style="font-family: 'Vazirmatn', sans-serif; direction: rtl; line-height: 1.7;">${html}</div>`;
}

scrollToBottom() {
    const chatHistory = document.getElementById('chat-history');
    if (chatHistory) {
        chatHistory.scrollTo({
            top: chatHistory.scrollHeight,
            behavior: 'smooth'
        });
    }
}

startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        this.showToast('❌ مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند', 'error');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.voiceRecognition = new SpeechRecognition();
    
    // تنظیمات
    this.voiceRecognition.lang = 'fa-IR';
    this.voiceRecognition.interimResults = true;
    this.voiceRecognition.continuous = true;
    
    // آپدیت UI
    document.getElementById('start-voice-input').style.display = 'none';
    document.getElementById('stop-voice-input').style.display = 'flex';
    document.getElementById('voice-input-status').style.display = 'block';
    document.getElementById('voice-status-text').textContent = 'در حال گوش دادن...';
    
    let finalTranscript = '';
    let interimTranscript = '';
    
    this.voiceRecognition.onresult = (event) => {
        interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // نمایش متن موقت
        const input = document.getElementById('ai-chat-input');
        if (interimTranscript) {
            input.value = finalTranscript + interimTranscript;
        } else {
            input.value = finalTranscript;
        }
        
        // آپدیت ارتفاع input
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
        
        // انیمیشن موج صدا
        this.animateVoiceWave();
    };
    
    this.voiceRecognition.onerror = (event) => {
        console.error('خطای تشخیص صدا:', event.error);
        this.stopVoiceInput();
        this.showToast(`❌ خطا: ${event.error}`, 'error');
    };
    
    this.voiceRecognition.onend = () => {
        // اگه خودش تموم شد، متوقفش کن
        if (this.isVoiceActive) {
            this.stopVoiceInput();
        }
    };
    
    this.voiceRecognition.start();
    this.isVoiceActive = true;
    this.startVoiceTimer();
}

stopVoiceInput() {
    if (this.voiceRecognition) {
        this.voiceRecognition.stop();
        this.voiceRecognition = null;
    }
    
    this.isVoiceActive = false;
    
    // آپدیت UI
    document.getElementById('start-voice-input').style.display = 'flex';
    document.getElementById('stop-voice-input').style.display = 'none';
    document.getElementById('voice-input-status').style.display = 'none';
    document.getElementById('voice-status-text').textContent = 'آماده';
    
    if (this.voiceTimerInterval) {
        clearInterval(this.voiceTimerInterval);
        this.voiceTimerInterval = null;
    }
}

startVoiceTimer() {
    let seconds = 0;
    const timerElement = document.getElementById('voice-timer');
    
    this.voiceTimerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

animateVoiceWave() {
    const waveBars = document.querySelectorAll('.wave-bar');
    waveBars.forEach(bar => {
        const height = Math.floor(Math.random() * 20) + 5;
        bar.style.height = height + 'px';
    });
}

playLastResponse() {
    const lastAiMessage = document.querySelector('#chat-history .ai-message:last-child .message-text');
    
    if (!lastAiMessage) {
        this.showToast('❌ پاسخی برای پخش وجود ندارد', 'warning');
        return;
    }
    
    const text = lastAiMessage.textContent;
    const language = document.getElementById('voice-language')?.value || 'fa-IR';
    
    this.speakText(text, language);
}


// ================================================
// تلفظ فوری و بدون تاخیر
// ================================================

speakText(text, lang = 'de-DE') {
    if (!text) {
        console.warn('❌ متنی برای تلفظ وجود ندارد');
        return;
    }
    
    try {
        // ========== 1. توقف کامل همه صداهای قبلی ==========
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            
            // روش قوی‌تر برای کروم
            const utterances = window.speechSynthesis.getVoices();
            window.speechSynthesis.cancel();
        }
        
        // ========== 2. ساخت utterance جدید ==========
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // ========== 3. انتخاب صدای آلمانی ==========
        if (lang === 'de-DE') {
            const voices = window.speechSynthesis.getVoices();
            const germanVoice = voices.find(v => v.lang === 'de-DE');
            if (germanVoice) {
                utterance.voice = germanVoice;
            }
        }
        
        // ========== 4. تلفظ فوری ==========
        utterance.onerror = (e) => {
            console.error('❌ خطا:', e);
            // تلاش مجدد بعد از 100ms
            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, 100);
        };
        
        // ========== 5. اجرا ==========
        window.speechSynthesis.speak(utterance);
        
        console.log(`🔊 تلفظ: "${text}"`);
        
    } catch (error) {
        console.error('❌ خطا در تلفظ:', error);
    }
}
// ================================================
// تنظیمات صدا
// ================================================

toggleVoiceSettingsPanel() {
    const panel = document.getElementById('voice-settings-panel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

saveVoiceSettings() {
    this.currentVoiceSettings.speed = parseFloat(document.getElementById('voice-speed').value);
    this.currentVoiceSettings.pitch = parseFloat(document.getElementById('voice-pitch').value);
    this.currentVoiceSettings.volume = 1;
    
    localStorage.setItem('voiceSettings', JSON.stringify(this.currentVoiceSettings));
    this.showToast('✅ تنظیمات صدا ذخیره شد', 'success');
    document.getElementById('voice-settings-panel').style.display = 'none';
}

testVoiceSettings() {
    const testText = 'این یک تست صدا است. آیا می‌توانید این متن را واضح بشنوید؟';
    const lang = document.getElementById('voice-language').value;
    this.speakText(testText, lang);
}

resetVoiceSettings() {
    document.getElementById('voice-speed').value = 1;
    document.getElementById('voice-pitch').value = 1;
    document.getElementById('speed-value').textContent = '1.0x';
    document.getElementById('pitch-value').textContent = '1.0';
    
    this.currentVoiceSettings = {
        speed: 1,
        pitch: 1,
        volume: 1,
        voice: null
    };
    
    this.showToast('🔄 تنظیمات بازنشانی شد', 'info');
}




// ================================================
// تغییر تم AI
// ================================================

toggleAITheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-mode');
    
    if (isDark) {
        body.classList.remove('dark-mode');
        document.getElementById('ai-theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkMode', 'false');
    } else {
        body.classList.add('dark-mode');
        document.getElementById('ai-theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('darkMode', 'true');
    }
}
newChat() {
    // اگه چت فعلی پیام داره، اول ذخیره‌اش کن
    if (this.chatMemory && this.chatMemory.length > 0) {
        this.saveCompleteChat();
    }

    // یه ID جدید بساز برای چت جدید
    this.currentChatId = 'chat_' + Date.now();
    localStorage.setItem('current_chat_id', this.currentChatId);

    // حافظه رو پاک کن
    this.chatMemory = [];

    // UI رو پاک کن
    const chatHistory = document.getElementById('chat-history');
    if (chatHistory) chatHistory.innerHTML = this.renderWelcomeMessage();

    this.showToast('🆕 چت جدید شروع شد', 'success');
}

clearChatHistory() {
    if (confirm('🗑️ آیا از پاک کردن این چت مطمئن هستید؟')) {
        // فقط چت فعلی رو پاک کن، بقیه چت‌ها دست نخوره
        const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
        const filtered = allChats.filter(c => c.id !== this.currentChatId);
        localStorage.setItem('all_chats', JSON.stringify(filtered));

        // شروع یه چت کاملاً جدید
        this.chatMemory = [];
        this.currentChatId = 'chat_' + Date.now();
        localStorage.setItem('current_chat_id', this.currentChatId);

        const chatHistory = document.getElementById('chat-history');
        if (chatHistory) chatHistory.innerHTML = this.renderWelcomeMessage();

        this.showToast('✅ چت پاک شد', 'success');
    }
}
// ================================================
// تاریخچه چت‌ها
// ================================================

showChatHistoryModal() {
    const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
    const modal = document.getElementById('chat-history-modal');
    const sessionsList = document.getElementById('chat-sessions-list');
    
    if (!modal || !sessionsList) return;
    
    if (allChats.length === 0) {
        sessionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 15px;"></i>
                <h4>هنوز چتی ذخیره نشده</h4>
                <p>با شروع یک چت جدید، به صورت خودکار ذخیره می‌شود</p>
            </div>
        `;
    } else {
        sessionsList.innerHTML = allChats.map(chat => `
            <div class="chat-session-item" data-id="${chat.id}">
                <div class="chat-session-info">
                    <div class="chat-session-name">
                        <i class="fas fa-comments"></i>
                        <span class="chat-title">${chat.title || 'چت جدید'}</span>
                    </div>
                    <div class="chat-session-details">
                        <span><i class="far fa-calendar"></i> ${new Date(chat.lastUpdated).toLocaleDateString('fa-IR')}</span>
                        <span><i class="fas fa-message"></i> ${chat.messageCount || 0} پیام</span>
                    </div>
                </div>
                <div class="chat-session-actions">
                    <button class="chat-session-btn load" onclick="dictionaryApp.loadChatFromHistory('${chat.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="chat-session-btn delete" onclick="dictionaryApp.deleteChatFromHistory('${chat.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    modal.style.display = 'flex';
    
    modal.querySelector('.close-modal')?.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ================================================
// Elias AI - نسخه نهایی با GPT-5.4 nano
// ================================================

async getAIResponseWithMemory(message, imageUrl = null) {
    try {
   
        
        // گرفتن حافظه چت
        const memoryContext = this.getMemoryForAI();
        
        const systemPrompt = `شما یک دستیار هوش مصنوعی هستید به نام "الیاس".
شما حافظه کامل دارید و همه چیزهایی که کاربر گفته را به خاطر می‌آورید.

⚠️ نکته مهم: 
اگر کاربر پرسید "تو رو کی ساخته؟" یا "سازنده تو کیه؟" حتماً بگو:
"من توسط الیاس حسینی ساخته شده‌ام. ایشون یک برنامه‌نویس و توسعه‌دهنده وب هستند."

تاریخچه مکالمه:
${memoryContext}

اکنون کاربر می‌گوید: "${message}"

پاسخ خود را بر اساس تاریخچه مکالمه بالا بده.`;

        let response;
        
        // اگر تصویر داریم، از قابلیت vision استفاده کن
        if (imageUrl) {
           response = await this._puterChat([
    { role: 'user', content: [
        { type: 'image_url', image_url: { url: imageUrl } },
        { type: 'text', text: systemPrompt }
    ]}
], { model: FREE_MODEL });
        } else {
       
          const tools = [];
         response = await this._puterChat(systemPrompt, { model: FREE_MODEL });
        }
        
        // استخراج متن از پاسخ (فرمت جدید Puter)
        if (response?.message?.content?.[0]?.text) {
            return response.message.content[0].text;
        }
        
        if (response?.message?.content) {
            if (Array.isArray(response.message.content)) {
                return response.message.content[0]?.text || response.message.content[0]?.content || "پاسخی دریافت نشد";
            }
            return response.message.content;
        }
        
        if (typeof response === 'string') return response;
        
        if (response?.text) return response.text;
        if (response?.content) return response.content;
        
        return "پاسخی دریافت نشد";
        
    } catch (error) {
        console.error('❌ خطا:', error);
        return `⚠️ خطا: ${error.message || 'مشکل در ارتباط با سرور'}`;
    }
}



// ================================================
// ارسال تصویر به AI و دریافت تحلیل
// ================================================




    showTypingIndicator() {
        const chatHistory = document.getElementById('chat-history');
        if (!chatHistory) return;
        
        this.removeTypingIndicator();
        
        const typingHtml = `
            <div class="message ai-message" id="typing-indicator">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <div class="typing-dots">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                        <span>در حال نوشتن...</span>
                    </div>
                </div>
            </div>
        `;
        
        chatHistory.insertAdjacentHTML('beforeend', typingHtml);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const chatHistory = document.getElementById('chat-history');
        if (chatHistory) {
            chatHistory.scrollTo({
                top: chatHistory.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    setupScrollManagement() {
        const chatHistory = document.getElementById('chat-history');
        if (!chatHistory) return;
        
        chatHistory.addEventListener('scroll', () => {
            const scrollTop = chatHistory.scrollTop;
            const scrollHeight = chatHistory.scrollHeight;
            const clientHeight = chatHistory.clientHeight;
            
            const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
            this.scrollState.isAtBottom = distanceFromBottom < 50;
            this.scrollState.lastScrollTop = scrollTop;
            
            if (this.scrollState.scrollTimeout) {
                clearTimeout(this.scrollState.scrollTimeout);
            }
            
            this.scrollState.isUserScrolling = true;
            this.scrollState.scrollTimeout = setTimeout(() => {
                this.scrollState.isUserScrolling = false;
            }, 1500);
        });
    }

    saveMessageToHistory(sender, content) {
        try {
            const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            
            chatHistory.push({
                sender: sender === 'user' ? 'user' : 'assistant',
                content: content,
                timestamp: new Date().toISOString()
            });
            
            const limitedHistory = chatHistory.slice(-50);
            localStorage.setItem('chatHistory', JSON.stringify(limitedHistory));
            
        } catch (error) {
            console.error('❌ خطا در ذخیره تاریخچه:', error);
        }
    }


 // ================================================
// نمایش پیام خوش آمدگویی
// ================================================

showWelcomeMessage() {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;
    
    const isGerman = LanguageSystem.isGerman();
    
    chatHistory.innerHTML = `
        <div class="message ai-message welcome-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    <h4>🤖 ${isGerman ? 'سلام! به الیاس خوش آمدید' : 'Hello! Welcome to Elias'}</h4>
                    <p>${isGerman ? 'من دستیار هوش مصنوعی شما هستم.' : 'I am your AI assistant.'}</p>
                    <p>${isGerman ? 'چطور می‌توانم به شما کمک کنم؟' : 'How can I help you?'}</p>
                </div>
                <div class="message-time">${new Date().toLocaleTimeString('fa-IR')}</div>
            </div>
        </div>
    `;
}

 
 

saveCompleteChat() {
    if (!this.chatMemory || this.chatMemory.length === 0) return;

    const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');

    // ساختن عنوان هوشمند از اولین پیام کاربر
    const firstUserMsg = this.chatMemory.find(m => m.role === 'user')?.content || '';
    const title = firstUserMsg.length > 40
        ? firstUserMsg.substring(0, 40) + '...'
        : firstUserMsg || 'چت بدون عنوان';

    const chatData = {
        id: this.currentChatId,
        title,
        messages: this.chatMemory.map(m => ({
            type: m.role === 'user' ? 'user' : 'ai',
            content: m.content,
            timestamp: m.timestamp
        })),
        lastUpdated: Date.now(),
        messageCount: this.chatMemory.length
    };

    // آپدیت چت موجود یا اضافه کردن چت جدید
    const idx = allChats.findIndex(c => c.id === this.currentChatId);
    if (idx >= 0) {
        allChats[idx] = chatData;
    } else {
        allChats.unshift(chatData);
    }

    localStorage.setItem('all_chats', JSON.stringify(allChats.slice(0, 50)));
}
    showChatHistoryModal() {
        const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
        const modal = document.getElementById('chat-history-modal');
        const sessionsList = document.getElementById('chat-sessions-list');
        
        if (!modal || !sessionsList) return;
        
        if (allChats.length === 0) {
            sessionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments" style="font-size: 3rem; color: var(--gray-400);"></i>
                    <h4>هنوز چتی ذخیره نشده</h4>
                    <p>با شروع یک چت جدید، به صورت خودکار ذخیره می‌شود</p>
                </div>
            `;
        } else {
            sessionsList.innerHTML = allChats.map(chat => `
                <div class="chat-session-item" data-id="${chat.id}">
                    <div class="chat-session-info">
                        <div class="chat-session-name">
                            <i class="fas fa-comments"></i>
                            <span class="chat-title">${chat.title || 'چت جدید'}</span>
                        </div>
                        <div class="chat-session-details">
                            <span class="chat-session-date">
                                <i class="far fa-calendar"></i>
                                ${new Date(chat.lastUpdated).toLocaleDateString('fa-IR')}
                            </span>
                            <span class="chat-session-count">
                                <i class="fas fa-message"></i>
                                ${chat.messageCount || 0} پیام
                            </span>
                        </div>
                    </div>
                    <div class="chat-session-actions">
                        <button class="chat-session-btn load" onclick="dictionaryApp.loadChatFromHistory('${chat.id}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="chat-session-btn delete" onclick="dictionaryApp.deleteChatFromHistory('${chat.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        modal.style.display = 'flex';
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

loadChatFromHistory(chatId) {
    // قبل از تغییر، چت فعلی رو ذخیره کن
    if (this.chatMemory && this.chatMemory.length > 0) {
        this.saveCompleteChat();
    }

    const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
    const chatData = allChats.find(c => c.id === chatId);

    if (!chatData) {
        this.showToast('❌ چت مورد نظر یافت نشد', 'error');
        return;
    }

    // تنظیم ID به همون چت قدیمی — ادامه چت روی همین ID ذخیره میشه
    this.currentChatId = chatId;
    localStorage.setItem('current_chat_id', this.currentChatId);

    // بازسازی حافظه
    this.chatMemory = chatData.messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString()
    }));

    // نمایش در UI
    const chatHistory = document.getElementById('chat-history');
    if (chatHistory) {
        chatHistory.innerHTML = '';
        this.chatMemory.forEach(msg => {
            this.addMessageToHistory(msg.role === 'user' ? 'user' : 'ai', msg.content, false);
        });
        this.scrollToBottom();
    }

    document.getElementById('chat-history-modal').style.display = 'none';
    this.showToast(`📂 "${chatData.title}" بارگذاری شد`, 'success');
}

    deleteChatFromHistory(chatId) {
        if (!confirm('🗑️ آیا از حذف این چت مطمئن هستید؟')) return;
        
        const allChats = JSON.parse(localStorage.getItem('all_chats') || '[]');
        const filteredChats = allChats.filter(c => c.id !== chatId);
        localStorage.setItem('all_chats', JSON.stringify(filteredChats));
        
        this.showChatHistoryModal();
        this.showToast('✅ چت حذف شد', 'success');
    }


    toggleVoiceSettingsPanel() {
        const panel = document.getElementById('voice-settings-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    toggleVoiceInput() {
        if (!this.isVoiceInputActive) {
            this.startVoiceRecognition();
        } else {
            this.stopVoiceInput();
        }
    }

    startVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            
            this.voiceRecognition.lang = 'fa-IR';
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.continuous = false;
            
            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('ai-chat-input').value = transcript;
                this.showToast('🎤 متن شناسایی شد', 'success');
                this.stopVoiceInput();
            };
            
            this.voiceRecognition.onerror = (event) => {
                this.showToast(`❌ خطا: ${event.error}`, 'error');
                this.stopVoiceInput();
            };
            
            this.voiceRecognition.onend = () => {
                this.stopVoiceInput();
            };
            
            this.voiceRecognition.start();
            this.isVoiceInputActive = true;
            
            document.getElementById('voice-input-toggle').classList.add('active');
            document.getElementById('voice-input-status').style.display = 'block';
            
            this.startVoiceTimer();
            
        } else {
            this.showToast('❌ مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند', 'error');
        }
    }

    startVoiceTimer() {
        this.voiceStartTime = Date.now();
        this.voiceTimerInterval = setInterval(() => {
            const elapsed = Date.now() - this.voiceStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const displaySeconds = seconds % 60;
            
            const timer = document.querySelector('.timer');
            if (timer) {
                timer.textContent = `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
            }
        }, 100);
    }

    stopVoiceInput() {
        if (this.voiceRecognition) {
            this.voiceRecognition.stop();
        }
        
        if (this.voiceTimerInterval) {
            clearInterval(this.voiceTimerInterval);
            this.voiceTimerInterval = null;
        }
        
        this.isVoiceInputActive = false;
        document.getElementById('voice-input-toggle').classList.remove('active');
        document.getElementById('voice-input-status').style.display = 'none';
    }

    toggleAITheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        
        const btn = document.getElementById('ai-theme-toggle');
        if (btn) {
            btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }

    // ================================================
    // متدهای کمکی
    // ================================================

   /**
 * نمایش یک بخش خاص
 */
showSection(sectionId) {
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
}

    speakText(text, lang = 'de-DE') {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }

    playPronunciation(word) {
        this.speakText(word, 'de-DE');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
           const existingToasts = container.querySelectorAll('.toast');
    if (existingToasts.length > 0) {
        // اگه توست مشابه وجود داره، حذفش کن
        existingToasts.forEach(toast => toast.remove());
    }
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        }[type] || 'fa-info-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
            <i class="fas fa-times toast-close"></i>
        `;
        
        container.appendChild(toast);
        
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    getGenderLabel(gender) {
        const labels = {
            masculine: 'مذکر (der)',
            feminine: 'مونث (die)',
            neuter: 'خنثی (das)'
        };
        return labels[gender] || '';
    }

    getGenderSymbol(gender) {
        const symbols = {
            masculine: 'der',
            feminine: 'die',
            neuter: 'das'
        };
        return symbols[gender] || '';
    }

    getTypeLabel(type) {
        const labels = {
            noun: 'اسم',
            verb: 'فعل',
            adjective: 'صفت',
            adverb: 'قید',
            other: 'سایر'
        };
        return labels[type] || type;
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupOnlineStatusListener() {
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());
    }

    updateOnlineStatus() {
        const isOnline = navigator.onLine;
        const statusElement = document.getElementById('online-status');
        
        if (statusElement) {
            statusElement.className = `online-status ${isOnline ? 'online' : 'offline'}`;
            statusElement.innerHTML = `
                <i class="fas fa-${isOnline ? 'wifi' : 'exclamation-triangle'}"></i>
                ${isOnline ? 'آنلاین - سرویس‌های ترجمه فعال' : 'آفلاین - فقط دیکشنری محلی'}
            `;
        }
    }

    // ================================================
    // Event Listeners عمومی
    // ================================================

setupEventListeners() {
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
                this.showToast('💡 نکته: اسم‌ها در آلمانی با حرف بزرگ نوشته می‌شوند', 'info');
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
}

// تابع کمکی برای رویدادهای تمرین
setupPracticeEventListeners() {
    const startFlashcard = document.getElementById('start-flashcard-btn');
    if (startFlashcard) startFlashcard.onclick = () => this.startPracticeSession();
    
    const startListening = document.getElementById('start-listening-btn');
    if (startListening) startListening.onclick = () => this.startListeningPractice();
    
    const startWriting = document.getElementById('start-writing-btn');
    if (startWriting) startWriting.onclick = () => this.startWritingPractice();
    
    const startSpeaking = document.getElementById('start-speaking-btn');
    if (startSpeaking) startSpeaking.onclick = () => this.startSpeakingPractice();
}

// تابع کمکی برای رویدادهای کتابخانه
setupLibraryEventListeners() {
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
}

// تابع کمکی برای رویدادهای خروجی تصویری
setupExportEventListeners() {
    const exportBtn = document.getElementById('export-words-to-image-btn');
    if (exportBtn) exportBtn.onclick = () => this.showExportWordsModal();
}
async sortWordList(filter, sortType) {
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
}
async saveWord() {
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
        this.showToast(error.message || '❌ خطا در ذخیره لغت', 'error');
        return false;
    }
}
setupWordListEventListeners() {
    document.querySelectorAll('.view-word').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const wordId = parseInt(btn.dataset.id);
            const word = await this.getWord(wordId);
            if (word) {
                // ذخیره ID لغت برای برگشت
                this.lastWordId = wordId;
                this.renderWordDetails(word);
                this.showSection('search-section');
            }
        };
    });
    
    // بقیه کدهای قبلی برای favorite و practice
    document.querySelectorAll('.favorite-icon').forEach(icon => {
        icon.onclick = async (e) => {
            e.stopPropagation();
            const wordId = parseInt(icon.dataset.id);
            await this.toggleFavorite(wordId);
            icon.classList.toggle('active');
            this.updateFavoritesCount();
            const activeFilter = document.querySelector('.filter-btn.active');
            if (activeFilter) {
                this.renderWordList(activeFilter.dataset.filter);
            } else {
                this.renderWordList('all');
            }
        };
    });
    
    document.querySelectorAll('.practice-word').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const wordId = parseInt(btn.dataset.id);
            this.startPracticeSession([wordId]);
        };
    });
}
setupWordDetailsEventListeners(word) {
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
}


   showEditWordForm(word) {
    // ساخت مودال ویرایش
    let modal = document.getElementById('edit-word-modal');
    if (!modal) {
        const modalHTML = `
            <div id="edit-word-modal" class="modal-overlay" style="display: none;">
                <div class="modal-content edit-modal-content">
                    <div class="modal-header edit-modal-header">
                        <h3><i class="fas fa-pen-fancy"></i> ویرایش لغت</h3>
                        <button class="close-modal" id="close-edit-modal">&times;</button>
                    </div>
                    <div class="modal-body edit-modal-body" id="edit-modal-body">
                        <!-- محتوا توسط JavaScript پر می‌شود -->
                    </div>
                    <div class="modal-footer edit-modal-footer">
                        <button id="save-edit-btn" class="btn btn-primary"><i class="fas fa-save"></i> ذخیره تغییرات</button>
                        <button id="cancel-edit-btn" class="btn btn-outline"><i class="fas fa-times"></i> انصراف</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('edit-word-modal');
    }
    
    const modalBody = document.getElementById('edit-modal-body');
    
    // پر کردن فرم با داده‌های موجود
    modalBody.innerHTML = `
        <div class="edit-form-container">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-language"></i> لغت آلمانی <span class="required">*</span></label>
                    <input type="text" id="edit-german" class="form-control modern-input" value="${this.escapeHtml(word.german)}">
                </div>
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-pencil-alt"></i> معنی فارسی <span class="required">*</span></label>
                    <input type="text" id="edit-persian" class="form-control modern-input" value="${this.escapeHtml(word.persian)}">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label"><i class="fas fa-tag"></i> نوع کلمه</label>
                <div class="type-cards edit-type-cards">
                    <div class="type-card ${word.type === 'noun' ? 'active' : ''}" data-type="noun">
                        <i class="fas fa-book"></i><span>اسم</span><small>Nomen</small>
                    </div>
                    <div class="type-card ${word.type === 'verb' ? 'active' : ''}" data-type="verb">
                        <i class="fas fa-running"></i><span>فعل</span><small>Verb</small>
                    </div>
                    <div class="type-card ${word.type === 'adjective' ? 'active' : ''}" data-type="adjective">
                        <i class="fas fa-palette"></i><span>صفت</span><small>Adjektiv</small>
                    </div>
                    <div class="type-card ${word.type === 'adverb' ? 'active' : ''}" data-type="adverb">
                        <i class="fas fa-clock"></i><span>قید</span><small>Adverb</small>
                    </div>
                    <div class="type-card ${word.type === 'preposition' ? 'active' : ''}" data-type="preposition">
                        <i class="fas fa-link"></i><span>حرف اضافه</span><small>Präposition</small>
                    </div>
                    <div class="type-card ${word.type === 'other' ? 'active' : ''}" data-type="other">
                        <i class="fas fa-ellipsis-h"></i><span>سایر</span><small>Andere</small>
                    </div>
                </div>
            </div>
            
            <!-- بخش اسم -->
            <div id="edit-noun-fields" class="type-fields-card" style="display: ${word.type === 'noun' ? 'block' : 'none'}">
                <div class="fields-header"><i class="fas fa-venus-mars"></i><span>اطلاعات اسم</span></div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">جنسیت</label>
                        <div class="gender-selector edit-gender-selector">
                            <button type="button" class="gender-option masculine ${word.gender === 'masculine' ? 'active' : ''}" data-gender="masculine">
                                <i class="fas fa-mars"></i> der <span>مذکر</span>
                            </button>
                            <button type="button" class="gender-option feminine ${word.gender === 'feminine' ? 'active' : ''}" data-gender="feminine">
                                <i class="fas fa-venus"></i> die <span>مونث</span>
                            </button>
                            <button type="button" class="gender-option neuter ${word.gender === 'neuter' ? 'active' : ''}" data-gender="neuter">
                                <i class="fas fa-genderless"></i> das <span>خنثی</span>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label"><i class="fas fa-copy"></i> جمع (Plural)</label>
                        <input type="text" id="edit-plural" class="form-control modern-input" value="${this.escapeHtml(word.plural || '')}" placeholder="مثال: Hunde, Häuser">
                    </div>
                </div>
            </div>
            
            <!-- بخش فعل -->
            <div id="edit-verb-fields" class="type-fields-card" style="display: ${word.type === 'verb' ? 'block' : 'none'}">
                <div class="fields-header"><i class="fas fa-table"></i><span>صرف فعل</span></div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Präsens (حال ساده)</label>
                        <input type="text" id="edit-verb-present" class="form-control modern-input" value="${this.escapeHtml(word.verbForms?.present || '')}" placeholder="ich lerne, du lernst...">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Präteritum (گذشته ساده)</label>
                        <input type="text" id="edit-verb-past" class="form-control modern-input" value="${this.escapeHtml(word.verbForms?.past || '')}" placeholder="ich lernte...">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Perfekt (گذشته کامل)</label>
                        <input type="text" id="edit-verb-perfect" class="form-control modern-input" value="${this.escapeHtml(word.verbForms?.perfect || '')}" placeholder="habe gelernt">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Futur I (آینده)</label>
                        <input type="text" id="edit-verb-future" class="form-control modern-input" value="${this.escapeHtml(word.verbForms?.future || '')}" placeholder="werde lernen">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Konjunktiv II (التزامی)</label>
                        <input type="text" id="edit-verb-konjunktiv" class="form-control modern-input" value="${this.escapeHtml(word.verbForms?.konjunktiv || '')}" placeholder="würde lernen">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">فعل کمکی</label>
                        <div class="helper-selector edit-helper-selector">
                            <label class="helper-option"><input type="radio" name="edit-verb-helper" value="haben" ${word.verbForms?.helper === 'haben' ? 'checked' : ''}> haben</label>
                            <label class="helper-option"><input type="radio" name="edit-verb-helper" value="sein" ${word.verbForms?.helper === 'sein' ? 'checked' : ''}> sein</label>
                            <label class="helper-option"><input type="radio" name="edit-verb-helper" value="both" ${word.verbForms?.helper === 'both' ? 'checked' : ''}> both</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label"><i class="fas fa-link"></i> جداشدنی</label>
                        <div class="checkbox-wrapper">
                            <label class="switch">
                                <input type="checkbox" id="edit-verb-separable" ${word.verbForms?.separable ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                            <span class="checkbox-label">بله، این فعل جداشدنی است</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- بخش صفت -->
            <div id="edit-adjective-fields" class="type-fields-card" style="display: ${word.type === 'adjective' ? 'block' : 'none'}">
                <div class="fields-header"><i class="fas fa-chart-line"></i><span>حالت‌های صفت</span></div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Komparativ (برتر)</label>
                        <input type="text" id="edit-adj-komparativ" class="form-control modern-input" value="${this.escapeHtml(word.comparative || '')}" placeholder="schöner, größer">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Superlativ (برترین)</label>
                        <input type="text" id="edit-adj-superlativ" class="form-control modern-input" value="${this.escapeHtml(word.superlative || '')}" placeholder="am schönsten">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label"><i class="fas fa-exchange-alt"></i> متضاد</label>
                    <input type="text" id="edit-adj-antonym" class="form-control modern-input" value="${this.escapeHtml(word.antonym || '')}" placeholder="groß → klein">
                </div>
            </div>
            
            <!-- بخش حرف اضافه -->
            <div id="edit-preposition-fields" class="type-fields-card" style="display: ${word.type === 'preposition' ? 'block' : 'none'}">
                <div class="fields-header"><i class="fas fa-map-marker-alt"></i><span>حالت حرف اضافه</span></div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">حالت (Kasus)</label>
                        <select id="edit-prep-case" class="form-control modern-input">
                            <option value="Akkusativ" ${word.case === 'Akkusativ' ? 'selected' : ''}>Akkusativ (مفعولی)</option>
                            <option value="Dativ" ${word.case === 'Dativ' ? 'selected' : ''}>Dativ (ملکی/مکانی)</option>
                            <option value="Genitiv" ${word.case === 'Genitiv' ? 'selected' : ''}>Genitiv (اضافی)</option>
                            <option value="Wechsel" ${word.case === 'Wechsel' ? 'selected' : ''}>Wechsel (دو حالته)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">معانی مختلف</label>
                        <input type="text" id="edit-prep-meanings" class="form-control modern-input" value="${this.escapeHtml(word.meanings || '')}" placeholder="برای، به خاطر، از طریق">
                    </div>
                </div>
            </div>
            
            <!-- فیلدهای مشترک -->
            <div class="common-fields">
                <div class="fields-header"><i class="fas fa-quote-right"></i><span>مثال و تلفظ</span></div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">مثال (آلمانی)</label>
                        <textarea id="edit-example" class="form-control modern-input" rows="2" placeholder="مثال آلمانی...">${this.escapeHtml(word.example || '')}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">ترجمه مثال</label>
                        <textarea id="edit-example-translation" class="form-control modern-input" rows="2" placeholder="ترجمه فارسی...">${this.escapeHtml(word.exampleTranslation || '')}</textarea>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label"><i class="fas fa-volume-up"></i> تلفظ (راهنما)</label>
                        <input type="text" id="edit-pronunciation" class="form-control modern-input" value="${this.escapeHtml(word.pronunciation || '')}" placeholder="[haʊs]">
                    </div>
                    <div class="form-group">
                        <label class="form-label"><i class="fas fa-tags"></i> برچسب‌ها</label>
                        <input type="text" id="edit-tags" class="form-control modern-input" value="${word.tags ? word.tags.join(', ') : ''}" placeholder="A1, Haushalt, Alltag">
                    </div>
                    <div class="form-group">
    <label class="form-label"><i class="fas fa-sticky-note"></i> توضیحات (Notes)</label>
    <textarea id="edit-notes" class="form-control modern-input" rows="3" placeholder="توضیحات اضافه، نکات گرامری...">${this.escapeHtml(word.notes || '')}</textarea>
</div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // اتصال رویدادها
    this.setupEditFormEvents(word);
}

setupEditFormEvents(originalWord) {
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
}

async updateWordFromEditForm(wordId) {
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
}
// ========================================
// === پیشنهاد مثال هوشمند با AI =========
// ========================================

async fetchAIExampleSuggestion(germanWord, forceRefresh = false, retryCount = 0) {
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
}

showAIExampleLoading(isRefresh = false) {
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
}

hideAIExampleLoading() {
    document.getElementById('ai-example-suggestion')?.remove();
}

showAIExampleSuggestion(suggestion) {
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
}

// ========================================
// === پیشنهاد صرف فعل با AI =============
// ========================================

async fetchAIVerbConjugation(germanVerb, forceRefresh = false) {
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
}

showAIVerbLoading(isRefresh = false) {
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
}

hideAIVerbLoading() {
    document.getElementById('ai-verb-suggestion')?.remove();
}

showAIVerbSuggestion(suggestion) {
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
}

// تبدیل label به field ID
_verbLabelToField(label) {
    if (label.includes('Präsens') || label.includes('حال')) return 'verb-present';
    if (label.includes('Präteritum') || label.includes('گذشته')) return 'verb-past';
    if (label.includes('Perfekt') || label.includes('کامل')) return 'verb-perfect';
    if (label.includes('Futur') || label.includes('آینده')) return 'verb-future';
    if (label.includes('Konjunktiv') || label.includes('التزامی')) return 'verb-konjunktiv';
    return '';
}

_injectAISuggestionStyles() {
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
}
// ========================================
// === دکمه هوشمند header ================
// ========================================

showAIFillButton(word) {
    const btn = document.getElementById('ai-fill-all-btn');
    if (!btn || !word) return;
    // ذخیره لغت روی دکمه
    btn.dataset.word = word;
    btn.style.display = 'flex';
    btn.innerHTML = `<i class="fas fa-robot"></i> پر کردن با هوش مصنوعی`;
    btn.classList.remove('loading');
    // اطمینان از اینکه window.dict به این instance اشاره داره
    window.dict = this;
}

hideAIFillButton() {
    const btn = document.getElementById('ai-fill-all-btn');
    if (btn) btn.style.display = 'none';
}

async aiSmartFillAll() {
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

فقط یک JSON برگردان، بدون هیچ توضیح اضافه:
{
  "word": "${word}",
  "correct_type": "noun یا verb یا adjective یا adverb یا preposition یا other",
  "persian_meaning": "معنی فارسی",
  "pronunciation": "تلفظ آوانویسی مثل [haʊs]",
  "example": "جمله مثال آلمانی ساده A1-B1 (فقط آلمانی)",
  "example_translation": "ترجمه فارسی جمله (فقط فارسی)",
  "tags": "مثل A1,Alltag (با کاما)",
  "notes": "توضیحات اضافی، نکات گرامری، موارد استفاده، کلمات مرتبط و غیره (به فارسی)",

  "noun": {
    "gender": "masculine یا feminine یا neuter",
    "plural": "شکل جمع"
  },
  
  "verb": {
    "present": "فقط صرف کامل: ich lerne / du lernst / er lernt / wir lernen / ihr lernt / sie lernen",
    "past": "فقط صرف کامل: ich lernte / du lerntest / er lernte / wir lernten",
    "perfect": "فقط Partizip II بدون فعل کمکی: gelernt یا gegangen",
    "future": "فقط Infinitiv بدون werde: lernen",
    "konjunktiv": "فقط Konjunktiv II: würde lernen یا hätte / wäre",
    "helper": "haben یا sein",
    "separable": true یا false
  },
  
  "adjective": {
    "komparativ": "حالت برتر",
    "superlativ": "am ...sten",
    "antonym": "متضاد"
  },
  
  "preposition": {
    "case": "Akkusativ یا Dativ یا Genitiv یا Wechsel",
    "meanings": "معانی مختلف با کاما (فقط فارسی)"
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
        if (parsed.notes) {
            this._setAlways('word-notes', parsed.notes);
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
}

// helper: فقط اگه فیلد خالیه پر کن
_setIfEmpty(id, value) {
    if (!value) return;
    const el = document.getElementById(id);
    if (el && !el.value.trim()) {
        el.value = value;
        // flash سبز کوتاه
        el.style.borderColor = '#10b981';
        setTimeout(() => el.style.borderColor = '', 1200);
    }
}
_setAlways(id, value) {
    if (!value) return;
    const el = document.getElementById(id);
    if (el) {
        el.value = value;
        el.style.borderColor = '#10b981';
        setTimeout(() => el.style.borderColor = '', 1200);
    }
}

setupTabs() {
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
}
}

// ================================================
// راه‌اندازی برنامه
// ================================================

let dictionaryApp;

document.addEventListener('DOMContentLoaded', () => {
    dictionaryApp = new GermanDictionary();
    window.dictionaryApp = dictionaryApp;
});

// ================================================
// توابع عمومی برای دسترسی از HTML
// ================================================

// فول اسکرین با کلیک روی صفحه
document.addEventListener('click', function fullscreenOnFirstClick() {
    const docEl = document.documentElement;
    
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
    }
    
    // حذف event listener بعد از اولین کلیک
    document.removeEventListener('click', fullscreenOnFirstClick);
});
// باز و بسته شدن منوی شناور با کلید Ctrl+1
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        
        // استفاده از متد رسمی منو
        if (window.EliasMenu && window.EliasMenu.toggle) {
            window.EliasMenu.toggle();
        } else if (window.EliasMenu && window.EliasMenu.open && window.EliasMenu.close) {
            // اگر toggle نداره، چک کن باز هست یا نه
            const menuContainer = document.getElementById('floating-menu-container');
            if (menuContainer && menuContainer.classList.contains('open')) {
                window.EliasMenu.close();
            } else {
                window.EliasMenu.open();
            }
        } else {
            // fallback
            const menuContainer = document.getElementById('floating-menu-container');
            const bookBtn = document.getElementById('floating-book-btn');
            const mainContent = document.querySelector('.main-content');
            
            if (menuContainer) {
                if (menuContainer.classList.contains('open')) {
                    menuContainer.classList.remove('open');
                    if (bookBtn) {
                        bookBtn.classList.remove('pulse-animation');
                        bookBtn.classList.add('rotating');
                    }
                    if (mainContent && window.innerWidth > 992) {
                        mainContent.style.width = '100%';
                        mainContent.style.marginRight = '0';
                    }
                } else {
                    menuContainer.classList.add('open');
                    if (bookBtn) {
                        bookBtn.classList.add('pulse-animation');
                        bookBtn.classList.remove('rotating');
                    }
                    if (mainContent && window.innerWidth > 992) {
                        mainContent.style.width = '78%';
                        mainContent.style.marginRight = 'auto';
                    }
                    setTimeout(() => {
                        const quickSearch = document.getElementById('quick');
                        if (quickSearch) quickSearch.focus();
                    }, 100);
                }
            }
        }
        
        if (navigator.vibrate) navigator.vibrate(50);
    }
});
// end scripts.js