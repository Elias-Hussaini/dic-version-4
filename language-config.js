// start language-config=.js
// تنظیمات زبان آموزشی - آلمانی/انگلیسی
// ================================================

const LanguageSystem = {
    currentLang: localStorage.getItem('learningLang') || 'de', // 'de' یا 'en'
    
    // ========== همه متن‌های برنامه ==========
    translations: {
        de: {
            
            // === منوی اصلی ===
            menu: {
                 installButton: 'نصب برنامه',
                search: 'جستجو',
                addWord: 'اضافه کردن لغت',
                translate: 'ترجمه',
                aiChat: 'AI',
                favorites: 'علاقه‌مندی‌ها',
                practice: 'تمرین',
                flashcards: 'فلش کارت‌ها',
                quiz: 'آزمون واژگان',
                wordList: 'لیست لغات',
                progress: 'پیشرفت',
                settings: 'تنظیمات'
            },
            
            // === بخش جستجو ===
            search: {
                title: 'جستجوی پیشرفته لغات',
                placeholder: 'لغت آلمانی یا فارسی را جستجو کنید...',
                results: 'نتایج جستجو برای',
                noResults: 'هیچ نتیجه‌ای یافت نشد',
                welcome: 'به Elias.Dictionary خوش آمدید!'
            },
            
            // === بخش اضافه کردن لغت ===
            addWord: {
                title: 'افزودن لغت جدید',
                wordLabel: 'لغت آلمانی:',
                meaningLabel: 'معنی فارسی:',
                genderLabel: 'جنسیت:',
                masculine: 'مذکر (der)',
                feminine: 'مونث (die)',
                neuter: 'خنثی (das)',
                noGender: 'بدون جنسیت',
                typeLabel: 'نوع کلمه:',
                noun: 'اسم',
                verb: 'فعل',
                adjective: 'صفت',
                adverb: 'قید',
                other: 'سایر',
                conjugation: 'صرف فعل',
                present: 'حال ساده',
                past: 'گذشته ساده',
                perfect: 'گذشته کامل',
                example: 'مثال:',
                exampleTrans: 'ترجمه مثال:',
                save: 'ذخیره لغت',
                clear: 'پاک کردن فرم'
            },
            
            // === بخش مترجم ===
            translate: {
                title: 'مترجم آنلاین',
                deToFa: 'آلمانی به فارسی',
                faToDe: 'فارسی به آلمانی',
                sourceText: 'متن آلمانی:',
                targetText: 'ترجمه فارسی:',
                speak: 'تلفظ',
                copy: 'کپی',
                smartSave: 'ذخیره هوشمند'
                
            },
            
            // === بخش هوش مصنوعی ===
            ai: {
                title: 'دستیار هوش مصنوعی',
                subtitle: 'با حافظه کامل',
                placeholder: 'سوال خود را بپرسید...',
                send: 'ارسال',
                voice: 'ورودی صوتی'
            },
            
            // === بخش تمرین ===
            practice: {
                title: 'مرکز تمرین هوشمند',
                flashcards: 'فلش کارت',
                listening: 'تمرین شنیداری',
                writing: 'تمرین نوشتاری',
                speaking: 'تمرین جمله‌سازی',
                start: 'شروع',
                check: 'بررسی',
                skip: 'رد کردن',
                hint: 'راهنمایی',
                correct: '✅ آفرین!',
                incorrect: '❌ اشتباه',
                results: 'نتایج تمرین'
            },
            
            // === بخش لیست لغات ===
            wordList: {
                title: 'دیکشنری کامل آلمانی-فارسی',
                all: 'همه لغات',
                favorites: 'علاقه‌مندی‌ها',
                nouns: 'اسم‌ها',
                verbs: 'فعل‌ها',
                adjectives: 'صفت‌ها',
                adverbs: 'قیدها'
                
            },
            
            // === بخش آمار ===
            stats: {
                accuracy: 'میزان دقت',
                total: 'کل لغات',
                today: 'تمرین امروز',
                weekly: 'پیشرفت هفتگی',
                achievements: 'دستاوردها',
                recent: 'فعالیت اخیر'
            },
            
            // === بخش تنظیمات ===
            settings: {
                title: 'تنظیمات برنامه',
                appearance: 'ظاهر برنامه',
                darkMode: 'حالت تاریک',
                fontSize: 'اندازه فونت',
                small: 'کوچک',
                medium: 'متوسط',
                large: 'بزرگ',
                themes: 'پوسته‌های رنگی',
                default: 'پیش‌فرض',
                blue: 'آبی',
                green: 'سبز',
                purple: 'بنفش',
                orange: 'نارنجی',
                pink: 'صورتی',
                language: 'زبان برنامه ',
                german: 'فارسی',
                english: 'انگلیسی',
                about: 'درباره برنامه'
            },
            
            // === روزهای هفته ===
            weekdays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
        },
        
        en: {
            // === منوی اصلی ===
            menu: {
                installButton: 'Install App',
                search: 'Search',
                addWord: 'Add Word',
                translate: 'Translate',
                aiChat: 'AI',
                favorites: 'Favorites',
                practice: 'Practice',
                flashcards: 'Flashcards',
                quiz: 'Quiz',
                wordList: 'Word List',
                progress: 'Progress',
                settings: 'Settings'
            },
            
            // === بخش جستجو ===
            search: {
                title: 'Advanced Word Search',
                placeholder: 'Search English or Persian...',
                results: 'Search results for',
                noResults: 'No results found',
                welcome: 'Welcome to Elias.Dictionary!'
            },
            
            // === بخش اضافه کردن لغت ===
            addWord: {
                title: 'Add New Word',
                wordLabel: 'English Word:',
                meaningLabel: 'Persian Meaning:',
                genderLabel: 'Gender:',
                masculine: 'Masculine',
                feminine: 'Feminine',
                neuter: 'Neuter',
                noGender: 'No Gender',
                typeLabel: 'Word Type:',
                noun: 'Noun',
                verb: 'Verb',
                adjective: 'Adjective',
                adverb: 'Adverb',
                other: 'Other',
                conjugation: 'Verb Conjugation',
                present: 'Present',
                past: 'Past',
                perfect: 'Perfect',
                example: 'Example:',
                exampleTrans: 'Translation:',
                save: 'Save Word',
                clear: 'Clear Form'
            },
            
            // === بخش مترجم ===
            translate: {
                title: 'Online Translator',
                deToFa: 'English → Persian',
                faToDe: 'Persian → English',
                sourceText: 'English Text:',
                targetText: 'Persian Translation:',
                speak: 'Speak',
                copy: 'Copy',
                smartSave: 'Smart Save'
            },
            
            // === بخش هوش مصنوعی ===
            ai: {
                title: 'Elias AI Assistant',
                subtitle: 'With Full Memory',
                placeholder: 'Ask a question...',
                send: 'Send',
                voice: 'Voice Input'
            },
            
            // === بخش تمرین ===
            practice: {
                title: 'Practice Center',
                flashcards: 'Flashcards',
                listening: 'Listening Practice',
                writing: 'Writing Practice',
                speaking: 'Speaking Practice',
                start: 'Start',
                check: 'Check',
                skip: 'Skip',
                hint: 'Hint',
                correct: '✅ Correct!',
                incorrect: '❌ Incorrect',
                results: 'Practice Results'
            },
            
            // === بخش لیست لغات ===
            wordList: {
                title: 'Complete English-Persian Dictionary',
                all: 'All Words',
                favorites: 'Favorites',
                nouns: 'Nouns',
                verbs: 'Verbs',
                adjectives: 'Adjectives',
                adverbs: 'Adverbs'
            },
            
            // === بخش آمار ===
            stats: {
                accuracy: 'Accuracy',
                total: 'Total Words',
                today: 'Today\'s Practice',
                weekly: 'Weekly Progress',
                achievements: 'Achievements',
                recent: 'Recent Activity'
            },
            
            // === بخش تنظیمات ===
            settings: {
                title: 'Settings',
                appearance: 'Appearance',
                darkMode: 'Dark Mode',
                fontSize: 'Font Size',
                small: 'Small',
                medium: 'Medium',
                large: 'Large',
                themes: 'Color Themes',
                default: 'Default',
                blue: 'Blue',
                green: 'Green',
                purple: 'Purple',
                orange: 'Orange',
                pink: 'Pink',
                language: 'Aplication Language',
                german: 'Persian',
                english: 'English',
                about: 'About'
            },
            
            // === روزهای هفته ===
            weekdays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
    },
    
    // ========== دریافت متن ==========
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                console.warn(`⚠️ کلید "${key}" یافت نشد`);
                return key;
            }
        }
        
        return value;
    },
    
    // ========== تغییر زبان ==========
    setLang(lang) {
        if (lang === this.currentLang) return;
        
        this.currentLang = lang;
        localStorage.setItem('learningLang', lang);
        
        // آپدیت کلاس body
        document.body.classList.remove('lang-de', 'lang-en');
        document.body.classList.add(`lang-${lang}`);
        
        // ریفرش صفحه
        location.reload();
    },
    
    // ========== وضعیت زبان ==========
    isGerman() {
        return this.currentLang === 'de';
    },
    
    isEnglish() {
        return this.currentLang === 'en';
    },
    
    // ========== نمایش جنسیت (فقط برای آلمانی) ==========
    showGender() {
        return this.isGerman();
    }
};

// ========== اضافه کردن به window ==========
window.LanguageSystem = LanguageSystem;
// end language-config=.js