/* ================================================================
   dict-ai-chat-pro.js — قابلیت‌های پیشرفته‌ی چت هوش مصنوعی
   ----------------------------------------------------------------
   • کارت لغت زیبا با تصویر در چت
   • ایجاد/ویرایش/حذف لغت توسط AI
   • تولید تصویر برای لغت
   • آزمون سریع
   • تحلیل پیشرفت
   • دکمه‌های سریع
   ================================================================ */

(function () {
    'use strict';

    function boot() {
        if (typeof GermanDictionary === 'undefined') {
            return setTimeout(boot, 100);
        }
        try {
            installChatProModule();
            console.log('✅ ماژول چت پیشرفته (dict-ai-chat-pro) فعال شد.');
            // ✔️ FIX: Hook showSection to inject quick actions after navigation to chat
            setTimeout(function() {
                if (typeof dictionaryApp !== 'undefined' && dictionaryApp) {
                    try {
                        dictionaryApp._injectChatProStyles();
                        dictionaryApp._injectCardStylesFix();
                        // Hook showSection
                        if (!dictionaryApp._acHookedShowSection) {
                            dictionaryApp._acHookedShowSection = true;
                            var origShow = dictionaryApp.showSection;
                            if (origShow) {
                                dictionaryApp.showSection = function (sectionId) {
                                    var result = origShow.apply(this, arguments);
                                    if (sectionId === 'ai-chat-section') {
                                        setTimeout(function () {
                                            if (typeof dictionaryApp._acInjectQuickActions === 'function') {
                                                // (quick actions removed)
                                            }
                                        }, 800);
                                    }
                                    return result;
                                };
                            }
                        }
                        // Also hook renderAIChat
                        if (!dictionaryApp._acHookedRender2) {
                            dictionaryApp._acHookedRender2 = true;
                            var origRender = dictionaryApp.renderAIChat;
                            if (origRender) {
                                dictionaryApp.renderAIChat = function () {
                                    var result = origRender.apply(this, arguments);
                                    setTimeout(function () {
                                        if (typeof dictionaryApp._acInjectQuickActions === 'function') {
                                            // (quick actions removed)
                                        }
                                    }, 600);
                                    return result;
                                };
                            }
                        }
                    } catch(e) { console.error('[ai-chat-pro] init:', e); }
                }
            }, 1500);
        } catch (err) {
            console.error('❌ خطا در فعال‌سازی ماژول چت پیشرفته:', err);
        }
    }

    // ✔️ FIX: start boot immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 500); });
    } else {
        setTimeout(boot, 500);
    }

    function installChatProModule() {

        /* ============================================================
           CSS برای کارت‌های لغت و قابلیت‌های جدید
           ============================================================ */
        GermanDictionary.prototype._injectChatProStyles = function () {
            if (document.getElementById('ac-pro-styles')) return;
            var style = document.createElement('style');
            style.id = 'ac-pro-styles';
            style.textContent = `
                /* ===== کارت لغت در چت (کوچک و ریسپانسیو) ===== */
                .ac-word-card {
                    background: #fff !important;
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 10px !important;
                    padding: 8px !important;
                    flex-shrink: 0 !important;
                    width: 130px !important;
                    max-width: 130px !important;
                    min-width: 100px !important;
                    cursor: pointer !important;
                    transition: all .15s ease !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 4px !important;
                    align-items: center !important;
                    text-align: center !important;
                    overflow: hidden !important;
                    box-sizing: border-box !important;
                }
                .ac-word-card:hover {
                    border-color: #4361ee;
                    box-shadow: 0 4px 12px rgba(67,97,238,.12);
                }
                /* ✔️ Container for multiple word cards — horizontal scroll */
                .ac-word-cards-row {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding: 4px 0;
                    scrollbar-width: thin;
                    -webkit-overflow-scrolling: touch;
                }
                .ac-word-cards-row::-webkit-scrollbar { height: 5px; }
                .ac-word-cards-row::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
                .ac-word-card-img {
                    width: 80px !important;
                    height: 80px !important;
                    max-width: 80px !important;
                    max-height: 80px !important;
                    border-radius: 8px !important;
                    object-fit: cover !important;
                    flex-shrink: 0 !important;
                    background: #e2e8f0 !important;
                }
                .ac-word-card-img-placeholder {
                    width: 80px !important;
                    height: 80px !important;
                    border-radius: 8px !important;
                    background: linear-gradient(135deg, #4361ee, #3a0ca3) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    color: #fff !important;
                    font-size: 28px !important;
                    flex-shrink: 0 !important;
                }
                .ac-word-card-body {
                    width: 100%;
                    text-align: center;
                }
                .ac-word-card-german {
                    font-size: 13px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .ac-word-card-persian {
                    font-size: 11px;
                    color: #64748b;
                    margin: 2px 0 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .ac-word-card-meta {
                    display: flex;
                    gap: 6px;
                    margin-top: 4px;
                    flex-wrap: wrap;
                }
                .ac-word-card-badge {
                    font-size: 9px;
                    padding: 1px 6px;
                    border-radius: 4px;
                    font-weight: 600;
                    background: #eef2ff;
                    color: #4361ee;
                }
                .ac-word-card-badge.srs-0 { background: #fef3c7; color: #92400e; }
                .ac-word-card-badge.srs-1 { background: #fed7aa; color: #9a3412; }
                .ac-word-card-badge.srs-2 { background: #fde68a; color: #78350f; }
                .ac-word-card-badge.srs-3 { background: #d1fae5; color: #065f46; }
                .ac-word-card-badge.srs-4 { background: #a7f3d0; color: #064e3b; }
                .ac-word-card-badge.srs-5 { background: #6ee7b7; color: #064e3b; }
                /* ✔️ Removed: view/pronounce buttons from chat cards */
                /* ✔️ FIX: هر تصویری در حباب چت کوچک و کنترل‌شده باشد */
                .ac-msg-bubble img {
                    max-width: 100px !important;
                    max-height: 100px !important;
                    border-radius: 8px;
                    object-fit: cover;
                    display: inline-block;
                    margin: 4px;
                }
                /* ✔️ If image is inside word card, it follows card rules */
                .ac-word-card img.ac-word-card-img {
                    max-width: 80px !important;
                    max-height: 80px !important;
                }
                @media (max-width: 640px) {
                    .ac-msg-bubble img { max-width: 80px !important; max-height: 80px !important; }
                    .ac-word-card img.ac-word-card-img { max-width: 64px !important; max-height: 64px !important; }
                }

                /* ===== کارت آمار ===== */
                .ac-stats-card {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    color: #f8fafc;
                    border-radius: 14px;
                    padding: 14px;
                    margin: 8px 0;
                }
                .ac-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                    gap: 10px;
                    margin-top: 8px;
                }
                .ac-stat-item {
                    background: rgba(255,255,255,.08);
                    border-radius: 10px;
                    padding: 8px;
                    text-align: center;
                }
                .ac-stat-value {
                    font-size: 20px;
                    font-weight: 800;
                    color: #fff;
                }
                .ac-stat-label {
                    font-size: 10px;
                    color: rgba(255,255,255,.7);
                    margin-top: 2px;
                }

                /* ===== دکمه‌های سریع پیشرفته ===== */
                .ac-quick-pro {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                    margin: 10px 0;
                }
                .ac-quick-pro-btn {
                    padding: 10px;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    background: #fff;
                    cursor: pointer;
                    transition: all .2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: #475569;
                    text-align: right;
                }
                .ac-quick-pro-btn:hover {
                    border-color: #4361ee;
                    background: #eef2ff;
                    color: #4361ee;
                }
                .ac-quick-pro-ic {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #4361ee, #3a0ca3);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                /* ===== کارت آزمون ===== */
                .ac-quiz-card {
                    background: #fff;
                    border: 2px solid #4361ee;
                    border-radius: 14px;
                    padding: 14px;
                    margin: 8px 0;
                }
                .ac-quiz-question {
                    font-size: 15px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 10px;
                }
                .ac-quiz-options {
                    display: grid;
                    gap: 6px;
                }
                .ac-quiz-opt {
                    padding: 10px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all .15s;
                    font-size: 13px;
                    color: #475569;
                    text-align: right;
                }
                .ac-quiz-opt:hover {
                    border-color: #4361ee;
                    background: #eef2ff;
                }
                .ac-quiz-opt.correct {
                    background: #d1fae5;
                    border-color: #10b981;
                    color: #065f46;
                }
                .ac-quiz-opt.wrong {
                    background: #fee2e2;
                    border-color: #ef4444;
                    color: #991b1b;
                }

                /* ===== کارت تأیید عملیات ===== */
                .ac-action-card {
                    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                    border: 1px solid #10b981;
                    border-radius: 12px;
                    padding: 12px;
                    margin: 8px 0;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                .ac-action-card.error {
                    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                    border-color: #ef4444;
                }
                .ac-action-ic {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #10b981;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }
                .ac-action-card.error .ac-action-ic { background: #ef4444; }
                .ac-action-body {
                    flex: 1;
                    font-size: 13px;
                    color: #064e3b;
                }
                .ac-action-card.error .ac-action-body { color: #991b1b; }

                /* ===== موبایل ===== */
                @media (max-width: 640px) {
                    .ac-word-card { width: 100px !important; max-width: 100px !important; padding: 6px !important; }
                    .ac-word-card-img, .ac-word-card-img-placeholder { width: 64px !important; height: 64px !important; max-width: 64px !important; max-height: 64px !important; }
                    .ac-word-card-img-placeholder { font-size: 22px !important; }
                    .ac-word-card-german { font-size: 12px !important; }
                    .ac-word-card-persian { font-size: 10px !important; }
                    .ac-word-card-badge { font-size: 8px !important; padding: 1px 5px !important; }
                    .ac-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 6px; }
                    .ac-stat-value { font-size: 16px; }
                    .ac-stat-label { font-size: 9px; }
                    .ac-quiz-card { padding: 10px; }
                    .ac-quiz-question { font-size: 13px; }
                    .ac-quiz-opt { padding: 8px 10px; font-size: 12px; }
                }

                /* Dark mode */
                body.dark-mode .ac-word-card {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    border-color: #334155;
                }
                body.dark-mode .ac-word-card-german { color: #f8fafc; }
                body.dark-mode .ac-word-card-persian { color: #cbd5e1; }
                body.dark-mode .ac-quick-pro-btn {
                    background: #1e293b;
                    border-color: #334155;
                    color: #cbd5e1;
                }
                body.dark-mode .ac-quiz-card {
                    background: #1e293b;
                }
                body.dark-mode .ac-quiz-opt {
                    background: #0f172a;
                    border-color: #334155;
                    color: #cbd5e1;
                }
            `;
            document.head.appendChild(style);
        };

        /* ============================================================
           ایجاد کارت لغت HTML (با تصویر اگر دارد)
           ============================================================ */
        GermanDictionary.prototype._acRenderWordCard = function (word) {
            if (!word) return '';
            var srsLevel = (this.srsData && this.srsData[word.id] && this.srsData[word.id].level) ? this.srsData[word.id].level : 0;
            var typeLabel = word.type === 'noun' ? 'اسم' : word.type === 'verb' ? 'فعل' : word.type === 'adjective' ? 'صفت' : word.type === 'adverb' ? 'قید' : 'سایر';

            var imgHTML = '';
            if (word.imageData && typeof word.imageData === 'string' && word.imageData.indexOf('data:') === 0) {
                imgHTML = '<img class="ac-word-card-img" src="' + word.imageData + '" alt="' + this._acAttr(word.german) + '" />';
            } else {
                var icon = word.type === 'verb' ? 'fa-running' : word.type === 'noun' ? 'fa-book' : 'fa-star';
                imgHTML = '<div class="ac-word-card-img-placeholder"><i class="fas ' + icon + '"></i></div>';
            }

            // ✔️ No view/pronounce buttons — just card with click
            return '<div class="ac-word-card" onclick="dictionaryApp._acViewWord(' + word.id + ')" title="' + this._acAttr(word.german) + ' — ' + this._acAttr(word.persian) + '">' +
                imgHTML +
                '<div class="ac-word-card-body">' +
                    '<div class="ac-word-card-german">' + this._acText(word.german) + '</div>' +
                    '<div class="ac-word-card-persian">' + this._acText(word.persian) + '</div>' +
                    '<span class="ac-word-card-badge srs-' + srsLevel + '">' + typeLabel + '</span>' +
                '</div>' +
            '</div>';
        };

        /* ============================================================
           نمایش کارت لغت در چت (با جستجوی لغت)
           ============================================================ */
        GermanDictionary.prototype._acShowWordCards = async function (query, limit) {
            limit = limit || 5;
            try {
                var words = await this.getAllWords();
                var filtered = words;
                if (query) {
                    var q = query.toLowerCase();
                    filtered = words.filter(function (w) {
                        return (w.german || '').toLowerCase().indexOf(q) !== -1 ||
                               (w.persian || '').toLowerCase().indexOf(q) !== -1;
                    });
                }
                filtered = filtered.slice(0, limit);
                if (filtered.length === 0) {
                    this._acAppendActionCard('لغتی پیدا نشد', true);
                    return;
                }
                var html = '<div style="margin:8px 0;">';
                for (var i = 0; i < filtered.length; i++) {
                    html += this._acRenderWordCard(filtered[i]);
                }
                html += '</div>';
                this._acAppendCustomHTML(html);
            } catch (e) {
                console.error('[ai-chat-pro] showWordCards error:', e);
            }
        };

        /* ============================================================
           نمایش کارت آمار
           ============================================================ */
        GermanDictionary.prototype._acShowStatsCard = async function () {
            try {
                var words = await this.getAllWords();
                var total = words.length;
                var nouns = words.filter(function(w){return w.type==='noun';}).length;
                var verbs = words.filter(function(w){return w.type==='verb';}).length;
                var adjs = words.filter(function(w){return w.type==='adjective';}).length;
                var srsKeys = Object.keys(this.srsData || {});
                var learned = srsKeys.filter(function(k){return (this.srsData[k]?.level||0)>=3;}, this).length;
                var reviewNeeded = srsKeys.filter(function(k){return (this.srsData[k]?.level||0)<2;}, this).length;
                var favCount = this.favorites ? this.favorites.size : 0;
                var withImages = words.filter(function(w){return w.imageData;}).length;

                var html = '<div class="ac-stats-card">' +
                    '<div style="font-size:14px;font-weight:700;">📊 آمار دیکشنری شما</div>' +
                    '<div class="ac-stats-grid">' +
                        '<div class="ac-stat-item"><div class="ac-stat-value">' + total + '</div><div class="ac-stat-label">کل لغات</div></div>' +
                        '<div class="ac-stat-item"><div class="ac-stat-value">' + nouns + '</div><div class="ac-stat-label">اسم</div></div>' +
                        '<div class="ac-stat-item"><div class="ac-stat-value">' + verbs + '</div><div class="ac-stat-label">فعل</div></div>' +
                        '<div class="ac-stat-item"><div class="ac-stat-value">' + adjs + '</div><div class="ac-stat-label">صفت</div></div>' +
                        '<div class="ac-stat-item"><div class="ac-stat-value">' + learned + '</div><div class="ac-stat-label">تسلط</div></div>' +
                        '<div class="ac-stat-item"><div class="ac-stat-value">' + reviewNeeded + '</div><div class="ac-stat-label">نیاز مرور</div></div>' +
                        '<div class="ac-stat-item"><div class="ac-stat-value">' + favCount + '</div><div class="ac-stat-label">علاقه‌مندی</div></div>' +
                        '<div class="ac-stat-item"><div class="ac-stat-value">' + withImages + '</div><div class="ac-stat-label">با تصویر</div></div>' +
                    '</div>' +
                '</div>';
                this._acAppendCustomHTML(html);
            } catch (e) {
                console.error('[ai-chat-pro] showStatsCard error:', e);
            }
        };

        /* ============================================================
           آزمون سریع
           ============================================================ */
        GermanDictionary.prototype._acStartQuickQuiz = async function () {
            try {
                var words = await this.getAllWords();
                if (words.length < 4) {
                    this._acAppendActionCard('حداقل ۴ لغت نیاز دارید برای آزمون', true);
                    return;
                }
                // انتخاب ۱ لغت تصادفی
                var shuffled = words.slice().sort(function(){return Math.random()-0.5;});
                var question = shuffled[0];
                var options = shuffled.slice(0, 4).sort(function(){return Math.random()-0.5;});

                var html = '<div class="ac-quiz-card">' +
                    '<div class="ac-quiz-question">معنی «' + this._acText(question.german) + '» چیست؟</div>' +
                    '<div class="ac-quiz-options">';
                for (var i = 0; i < options.length; i++) {
                    var isCorrect = options[i].id === question.id;
                    html += '<div class="ac-quiz-opt" onclick="dictionaryApp._acQuizAnswer(this, ' + isCorrect + ')" data-correct="' + isCorrect + '">' +
                        this._acText(options[i].persian) + '</div>';
                }
                html += '</div></div>';
                this._acAppendCustomHTML(html);
            } catch (e) {
                console.error('[ai-chat-pro] quiz error:', e);
            }
        };

        GermanDictionary.prototype._acQuizAnswer = function (el, isCorrect) {
            var card = el.closest('.ac-quiz-card');
            if (!card) return;
            var opts = card.querySelectorAll('.ac-quiz-opt');
            for (var i = 0; i < opts.length; i++) {
                var correct = opts[i].getAttribute('data-correct') === 'true';
                opts[i].style.pointerEvents = 'none';
                if (correct) {
                    opts[i].classList.add('correct');
                } else if (opts[i] === el && !isCorrect) {
                    opts[i].classList.add('wrong');
                }
            }
            if (isCorrect) {
                this.showToast && this.showToast('✅ درست!', 'success');
            } else {
                this.showToast && this.showToast('❌ نادرست', 'error');
            }
        };

        /* ============================================================
           ایجاد لغت توسط AI
           ============================================================ */
        GermanDictionary.prototype._acCreateWord = async function (wordData) {
            try {
                if (!wordData || !wordData.german || !wordData.persian) {
                    this._acAppendActionCard('داده‌ی لغت ناقص است (نیاز به german و persian)', true);
                    return false;
                }
                var newWord = {
                    id: Date.now(),
                    german: wordData.german,
                    persian: wordData.persian,
                    type: wordData.type || 'noun',
                    gender: wordData.gender || '',
                    plural: wordData.plural || '',
                    example: wordData.example || '',
                    exampleTranslation: wordData.exampleTranslation || '',
                    pronunciation: wordData.pronunciation || '',
                    tags: wordData.tags || [],
                    createdAt: new Date().toISOString()
                };
                await this.addWord(newWord);
                this._acAppendActionCard('✅ لغت «' + newWord.german + '» با موفقیت ذخیره شد', false);
                // نمایش کارت لغت
                this._acAppendCustomHTML(this._acRenderWordCard(newWord));
                return true;
            } catch (e) {
                this._acAppendActionCard('خطا در ذخیره لغت: ' + e.message, true);
                return false;
            }
        };

        /* ============================================================
           تولید تصویر برای لغت
           ============================================================ */
        GermanDictionary.prototype._acGenerateImageForWord = async function (wordId) {
            try {
                if (typeof this._generateWordImage !== 'function') {
                    this._acAppendActionCard('ماژول تولید تصویر در دسترس نیست', true);
                    return;
                }
                this._acAppendActionCard('🎨 در حال تولید تصویر...', false);
                await this._generateWordImage(wordId, true);
                var word = await this.getWord(wordId);
                if (word && word.imageData) {
                    this._acAppendCustomHTML(this._acRenderWordCard(word));
                }
            } catch (e) {
                this._acAppendActionCard('خطا در تولید تصویر: ' + e.message, true);
            }
        };

        /* ============================================================
           ✔️ FUNCTION CALLING SYSTEM — AI می‌تواند توابع را صدا بزند
           ----------------------------------------------------------------
           AI در پاسخ خود نشانگرهای خاصی می‌گذارد که رندرر اجرا می‌کند:
           [[SHOW_WORD:Hund]]         → نمایش کارت لغت
           [[SHOW_WORD_ID:123]]       → نمایش کارت لغت با ID
           [[SEARCH_WORDS:query]]     → جستجو و نمایش کارت‌ها
           [[STATS]]                  → نمایش کارت آمار
           [[QUIZ]]                   → شروع آزمون
           [[SAVE_WORD:json]]         → ذخیره لغت جدید واقعی
           [[GENERATE_IMAGE:123]]     → تولید تصویر برای لغت
           [[FAVORITES]]              → نمایش علاقه‌مندی‌ها
           [[REVIEW_NEEDED]]          → نمایش لغات نیاز به مرور
           ============================================================ */
        GermanDictionary.prototype._acProcessCommands = async function (rawText) {
            // پیدا کردن همه‌ی نشانگرها در متن خام
            var regex = /\[\[([A-Z_]+)(?::([^\]]+))?\]\]/g;
            var match;
            var lastIndex = 0;
            var segments = [];
            
            while ((match = regex.exec(rawText)) !== null) {
                // متن قبل از نشانگر
                if (match.index > lastIndex) {
                    segments.push({ type: 'text', content: rawText.substring(lastIndex, match.index) });
                }
                // خود نشانگر
                segments.push({ type: 'cmd', cmd: match[1], arg: match[2] || '' });
                lastIndex = regex.lastIndex;
            }
            // متن آخر
            if (lastIndex < rawText.length) {
                segments.push({ type: 'text', content: rawText.substring(lastIndex) });
            }
            
            // اگر هیچ دستوری نبود، فقط فرمت‌بندی معمول
            if (segments.length === 1 && segments[0].type === 'text') {
                return this._formatAIMessage(rawText);
            }
            
            // پردازش هر بخش
            var resultHTML = '';
            for (var i = 0; i < segments.length; i++) {
                var seg = segments[i];
                if (seg.type === 'text') {
                    // متن معمولی را با Markdown فرمت کن
                    resultHTML += this._formatAIMessage(seg.content);
                } else {
                    // اجرای دستور و گرفتن HTML
                    var cmdHTML = await this._acExecuteCommand(seg.cmd, seg.arg);
                    resultHTML += cmdHTML;
                }
            }
            return resultHTML;
        };

        GermanDictionary.prototype._acExecuteCommand = async function (cmd, arg) {
            try {
                var self = this;
                switch (cmd) {
                    case 'SHOW_WORDS':
                        // ✔️ NEW: نمایش چند لغت با کاما جدا شده
                        var names = arg.split(',').map(function(s){return s.trim();}).filter(Boolean);
                        var allW2 = await this.getAllWords();
                        var cards2 = [];
                        for (var n = 0; n < names.length; n++) {
                            var found = allW2.find(function(x) { return x.german.toLowerCase() === names[n].toLowerCase(); });
                            if (found) cards2.push(found);
                        }
                        if (cards2.length === 0) return '<div class="ac-action-card error"><div class="ac-action-ic"><i class="fas fa-times"></i></div><div class="ac-action-body">هیچ لغت پیدا نشد</div></div>';
                        var mh = '<div class="ac-word-cards-row">';
                        for (var m = 0; m < cards2.length; m++) { mh += this._acRenderWordCard(cards2[m]); }
                        mh += '</div>';
                        return mh;
                    
                    case 'SHOW_WORD':
                        // جستجوی لغت بر اساس نام
                        var words = await this.getAllWords();
                        var w = words.find(function(x) { return x.german.toLowerCase() === arg.toLowerCase(); });
                        if (w) return '<div class="ac-word-cards-row">' + this._acRenderWordCard(w) + '</div>';
                        return '<div class="ac-action-card error"><div class="ac-action-ic"><i class="fas fa-times"></i></div><div class="ac-action-body">لغت «' + this._acText(arg) + '» پیدا نشد</div></div>';
                    
                    case 'SHOW_WORD_ID':
                        var wid = parseInt(arg, 10);
                        var word = await this.getWord(wid);
                        if (word) return this._acRenderWordCard(word);
                        return '<div class="ac-action-card error"><div class="ac-action-ic"><i class="fas fa-times"></i></div><div class="ac-action-body">لغت پیدا نشد</div></div>';
                    
                    case 'SEMANTIC_SEARCH':
                        // ✔️ ZILLIZ: جستجوی معنایی — پیدا کردن لغات مرتبط از نظر معنی
                        if (typeof this._zillizSearch !== 'function') {
                            return '<div class="ac-action-card error"><div class="ac-action-ic"><i class="fas fa-times"></i></div><div class="ac-action-body">جستجوی معنایی در دسترس نیست</div></div>';
                        }
                        var semResults = await this._zillizSearch(arg, 5);
                        if (!semResults || semResults.length === 0) {
                            return '<div class="ac-action-card error"><div class="ac-action-ic"><i class="fas fa-times"></i></div><div class="ac-action-body">لغت مرتبط پیدا نشد</div></div>';
                        }
                        // تبدیل نتایج Zilliz به کارت‌های لغت
                        var semHTML = '<div style="font-weight:700;margin:4px 0;">🔍 لغات مرتبط معنایی:</div><div class="ac-word-cards-row">';
                        for (var si = 0; si < semResults.length; si++) {
                            var r = semResults[si];
                            // پیدا کردن لغت کامل از IndexedDB
                            var fullWord = null;
                            try {
                                fullWord = await this.getWord(r.word_id);
                            } catch(e) {}
                            if (fullWord) {
                                semHTML += this._acRenderWordCard(fullWord);
                            }
                        }
                        semHTML += '</div>';
                        return semHTML;
                    
                    case 'RELATED_WORDS':
                        // ✔️ ZILLIZ: لغات مرتبط با یک لغت خاص
                        if (typeof this._zillizGetRelated === 'function') {
                            var relResults = await this._zillizGetRelated(parseInt(arg, 10), 5);
                            if (relResults && relResults.length > 0) {
                                var relHTML = '<div style="font-weight:700;margin:4px 0;">🔗 لغات مرتبط:</div><div class="ac-word-cards-row">';
                                for (var ri = 0; ri < relResults.length; ri++) {
                                    var rw = await this.getWord(relResults[ri].word_id);
                                    if (rw) relHTML += this._acRenderWordCard(rw);
                                }
                                relHTML += '</div>';
                                return relHTML;
                            }
                        }
                        return '<div class="ac-action-card error"><div class="ac-action-ic"><i class="fas fa-times"></i></div><div class="ac-action-body">لغت مرتبط پیدا نشد</div></div>';
                    
                    case 'SEARCH_WORDS':
                        var results = await this.getAllWords();
                        var q = arg.toLowerCase();
                        var filtered = results.filter(function(x) {
                            return (x.german||'').toLowerCase().indexOf(q) !== -1 || (x.persian||'').toLowerCase().indexOf(q) !== -1;
                        }).slice(0, 10);
                        if (filtered.length === 0) return '<div class="ac-action-card error"><div class="ac-action-ic"><i class="fas fa-times"></i></div><div class="ac-action-body">لغتی پیدا نشد</div></div>';
                        var h = '<div class="ac-word-cards-row">';
                        for (var i = 0; i < filtered.length; i++) { h += this._acRenderWordCard(filtered[i]); }
                        h += '</div>';
                        return h;
                    
                    case 'STATS':
                        return await this._acBuildStatsHTML();
                    
                    case 'FAVORITES':
                        var allWords = await this.getAllWords();
                        var favs = allWords.filter(function(x) { return self.favorites && self.favorites.has(x.id); });
                        if (favs.length === 0) return '<div class="ac-action-card error"><div class="ac-action-ic"><i class="fas fa-times"></i></div><div class="ac-action-body">هیچ لغت علاقه‌مندی ندارید</div></div>';
                        var fh = '<div style="font-weight:700;margin:4px 0;">⭐ لغات علاقه‌مندی:</div><div class="ac-word-cards-row">';
                        for (var j = 0; j < favs.length; j++) { fh += this._acRenderWordCard(favs[j]); }
                        fh += '</div>';
                        return fh;
                    
                    case 'REVIEW_NEEDED':
                        var allW = await this.getAllWords();
                        var review = allW.filter(function(x) {
                            var srs = (self.srsData && self.srsData[x.id] && self.srsData[x.id].level) ? self.srsData[x.id].level : 0;
                            return srs < 2;
                        }).slice(0, 15);
                        if (review.length === 0) return '<div class="ac-action-card"><div class="ac-action-ic"><i class="fas fa-check"></i></div><div class="ac-action-body">همه‌ی لغات تسلط بالایی دارند! 🎉</div></div>';
                        var rh = '<div style="font-weight:700;margin:4px 0;">📖 لغات نیاز به مرور:</div><div class="ac-word-cards-row">';
                        for (var k = 0; k < review.length; k++) { rh += this._acRenderWordCard(review[k]); }
                        rh += '</div>';
                        return rh;
                    
                    case 'SAVE_WORD':
                        // arg = JSON با تمام فیلدها
                        try {
                            var wd = JSON.parse(arg);
                            var newWord = {
                                id: Date.now(),
                                german: wd.german || '',
                                persian: wd.persian || '',
                                type: wd.type || 'noun',
                                gender: wd.gender || '',
                                plural: wd.plural || '',
                                example: wd.example || '',
                                exampleTranslation: wd.exampleTranslation || '',
                                pronunciation: wd.pronunciation || '',
                                tags: wd.tags || [],
                                createdAt: new Date().toISOString()
                            };
                            await this.addWord(newWord);
                            this._invalidateAllWordsCache && this._invalidateAllWordsCache();
                            var savedH = '<div class="ac-action-card"><div class="ac-action-ic"><i class="fas fa-check"></i></div><div class="ac-action-body">✅ لغت «' + this._acText(newWord.german) + '» با موفقیت ذخیره شد!</div></div>';
                            savedH += '<div class="ac-word-cards-row">' + this._acRenderWordCard(newWord) + '</div>';
                            return savedH;
                        } catch (e) {
                            return '<div class="ac-action-card error"><div class="ac-action-ic"><i class="fas fa-times"></i></div><div class="ac-action-body">خطا در ذخیره: ' + e.message + '</div></div>';
                        }
                    
                    case 'GENERATE_IMAGE':
                        var gwid = parseInt(arg, 10);
                        if (typeof this._generateWordImage !== 'function') {
                            return '<div class="ac-action-card error"><div class="ac-action-ic"><i class="fas fa-times"></i></div><div class="ac-action-body">ماژول تصویر در دسترس نیست</div></div>';
                        }
                        // شروع تولید تصویر در پس‌زمینه
                        this._generateWordImage(gwid, true).then(function() {
                            console.log('[ai-chat-pro] Image generated for wordId=' + gwid);
                        }).catch(function(e) {
                            console.warn('[ai-chat-pro] Image gen failed:', e);
                        });
                        return '<div class="ac-action-card"><div class="ac-action-ic"><i class="fas fa-palette"></i></div><div class="ac-action-body">🎨 در حال تولید تصویر... کمی صبر کنید</div></div>';
                    
                    case 'QUIZ':
                        return await this._acBuildQuizHTML();
                    
                    default:
                        return '<code>[[Unknown command: ' + cmd + ']]</code>';
                }
            } catch (e) {
                return '<div class="ac-action-card error"><div class="ac-action-ic"><i class="fas fa-times"></i></div><div class="ac-action-body">خطا: ' + e.message + '</div></div>';
            }
        };

        // ساخت HTML کارت آمار (بدون append مستقیم)
        GermanDictionary.prototype._acBuildStatsHTML = async function () {
            var words = await this.getAllWords();
            var total = words.length;
            var nouns = words.filter(function(w){return w.type==='noun';}).length;
            var verbs = words.filter(function(w){return w.type==='verb';}).length;
            var adjs = words.filter(function(w){return w.type==='adjective';}).length;
            var srsKeys = Object.keys(this.srsData || {});
            var learned = srsKeys.filter(function(k){return (this.srsData[k]?.level||0)>=3;}, this).length;
            var reviewNeeded = srsKeys.filter(function(k){return (this.srsData[k]?.level||0)<2;}, this).length;
            var favCount = this.favorites ? this.favorites.size : 0;
            var withImages = words.filter(function(w){return w.imageData;}).length;
            return '<div class="ac-stats-card">' +
                '<div style="font-size:14px;font-weight:700;">📊 آمار دیکشنری شما</div>' +
                '<div class="ac-stats-grid">' +
                    '<div class="ac-stat-item"><div class="ac-stat-value">' + total + '</div><div class="ac-stat-label">کل لغات</div></div>' +
                    '<div class="ac-stat-item"><div class="ac-stat-value">' + nouns + '</div><div class="ac-stat-label">اسم</div></div>' +
                    '<div class="ac-stat-item"><div class="ac-stat-value">' + verbs + '</div><div class="ac-stat-label">فعل</div></div>' +
                    '<div class="ac-stat-item"><div class="ac-stat-value">' + adjs + '</div><div class="ac-stat-label">صفت</div></div>' +
                    '<div class="ac-stat-item"><div class="ac-stat-value">' + learned + '</div><div class="ac-stat-label">تسلط</div></div>' +
                    '<div class="ac-stat-item"><div class="ac-stat-value">' + reviewNeeded + '</div><div class="ac-stat-label">نیاز مرور</div></div>' +
                    '<div class="ac-stat-item"><div class="ac-stat-value">' + favCount + '</div><div class="ac-stat-label">علاقه‌مندی</div></div>' +
                    '<div class="ac-stat-item"><div class="ac-stat-value">' + withImages + '</div><div class="ac-stat-label">با تصویر</div></div>' +
                '</div>' +
            '</div>';
        };

        // ساخت HTML آزمون
        GermanDictionary.prototype._acBuildQuizHTML = async function () {
            var words = await this.getAllWords();
            if (words.length < 4) {
                return '<div class="ac-action-card error"><div class="ac-action-ic"><i class="fas fa-times"></i></div><div class="ac-action-body">حداقل ۴ لغت نیاز دارید برای آزمون</div></div>';
            }
            var shuffled = words.slice().sort(function(){return Math.random()-0.5;});
            var question = shuffled[0];
            var options = shuffled.slice(0, 4).sort(function(){return Math.random()-0.5;});
            var html = '<div class="ac-quiz-card">' +
                '<div class="ac-quiz-question">معنی «' + this._acText(question.german) + '» چیست؟</div>' +
                '<div class="ac-quiz-options">';
            for (var i = 0; i < options.length; i++) {
                var isCorrect = options[i].id === question.id;
                html += '<div class="ac-quiz-opt" onclick="dictionaryApp._acQuizAnswer(this, ' + isCorrect + ')" data-correct="' + isCorrect + '">' +
                    this._acText(options[i].persian) + '</div>';
            }
            html += '</div></div>';
            return html;
        };

        /* ============================================================
           ابزارهای کمکی
           ============================================================ */
        GermanDictionary.prototype._acAppendCustomHTML = function (html) {
            var ch = document.getElementById('chat-history');
            if (!ch) return;
            var div = document.createElement('div');
            div.className = 'ac-msg ai';
            div.innerHTML = '<div class="ac-msg-avatar"><i class="fas fa-wand-magic-sparkles"></i></div>' +
                '<div class="ac-msg-body"><div class="ac-msg-bubble">' + html + '</div></div>';
            ch.appendChild(div);
            this._acScrollToBottom();
        };

        GermanDictionary.prototype._acAppendActionCard = function (message, isError) {
            var icon = isError ? 'fa-times' : 'fa-check';
            var html = '<div class="ac-action-card' + (isError ? ' error' : '') + '">' +
                '<div class="ac-action-ic"><i class="fas ' + icon + '"></i></div>' +
                '<div class="ac-action-body">' + this._acText(message) + '</div>' +
                '</div>';
            this._acAppendCustomHTML(html);
        };

        GermanDictionary.prototype._acViewWord = function (wordId) {
            if (typeof this._spViewWord === 'function') {
                this._spViewWord(wordId);
            } else if (typeof this.renderWordDetails === 'function') {
                this.getWord(wordId).then(function(w){ if(w) this.renderWordDetails(w); }.bind(this));
            }
        };

        GermanDictionary.prototype._acSpeakWord = function (wordId) {
            this.getWord(wordId).then(function(w){
                if (w && typeof this.speakText === 'function') {
                    this.speakText(w.german, 'de-DE');
                }
            }.bind(this));
        };

        GermanDictionary.prototype._acAttr = function (s) {
            return String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };
        GermanDictionary.prototype._acText = function (s) {
            return String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };

        /* ============================================================
           افزودن دکمه‌های سریع پیشرفته
           ============================================================ */
        // ✔️ REMOVED: Quick action buttons (user didn't want them)

        GermanDictionary.prototype._acQuickSuggest = async function () {
            var input = document.getElementById('ai-chat-input');
            if (input) {
                input.value = '۵ لغت آلمانی پیشنهاد بده که برای سطح من مناسب باشد';
                input.dispatchEvent(new Event('input'));
            }
        };

        GermanDictionary.prototype._acQuickQuiz = function () {
            this._acStartQuickQuiz();
        };

        GermanDictionary.prototype._acQuickStats = function () {
            this._acShowStatsCard();
        };

        GermanDictionary.prototype._acQuickReview = async function () {
            var input = document.getElementById('ai-chat-input');
            if (input) {
                input.value = 'کدام لغات نیاز به مرور دارند؟';
                input.dispatchEvent(new Event('input'));
            }
        };



        /* ============================================================
           ✔️ SEPARATE CSS INJECTION — always runs, never conflicts
           ============================================================ */
        GermanDictionary.prototype._injectCardStylesFix = function () {
            if (document.getElementById('ac-card-fix-styles')) return;
            var s = document.createElement('style');
            s.id = 'ac-card-fix-styles';
            s.textContent = [
                '.ac-word-cards-row { display:flex !important; gap:8px !important; overflow-x:auto !important; padding:4px 0 !important; scroll-behavior:smooth !important; -webkit-overflow-scrolling:touch !important; max-width:100% !important; }',
                '.ac-word-cards-row::-webkit-scrollbar { height:5px !important; }',
                '.ac-word-cards-row::-webkit-scrollbar-thumb { background:#cbd5e1 !important; border-radius:3px !important; }',
                '.ac-word-card { background:#fff !important; border:1px solid #e2e8f0 !important; border-radius:10px !important; padding:8px !important; flex-shrink:0 !important; width:130px !important; max-width:130px !important; min-width:100px !important; cursor:pointer !important; display:flex !important; flex-direction:column !important; gap:4px !important; align-items:center !important; text-align:center !important; overflow:hidden !important; box-sizing:border-box !important; }',
                '.ac-word-card-img { width:80px !important; height:80px !important; max-width:80px !important; max-height:80px !important; border-radius:8px !important; object-fit:cover !important; flex-shrink:0 !important; }',
                '.ac-word-card-img-placeholder { width:80px !important; height:80px !important; border-radius:8px !important; display:flex !important; align-items:center !important; justify-content:center !important; color:#fff !important; font-size:28px !important; flex-shrink:0 !important; }',
                '.ac-word-card-body { width:100% !important; text-align:center !important; }',
                '.ac-word-card-german { font-size:13px !important; font-weight:700 !important; white-space:nowrap !important; overflow:hidden !important; text-overflow:ellipsis !important; }',
                '.ac-word-card-persian { font-size:11px !important; white-space:nowrap !important; overflow:hidden !important; text-overflow:ellipsis !important; }',
                '.ac-word-card-badge { font-size:9px !important; padding:1px 6px !important; border-radius:4px !important; }',
                '.ac-msg-bubble img { max-width:100px !important; max-height:100px !important; border-radius:8px !important; object-fit:cover !important; }',
                '@media (max-width:640px) {',
                '  .ac-word-card { width:100px !important; max-width:100px !important; padding:6px !important; }',
                '  .ac-word-card-img, .ac-word-card-img-placeholder { width:64px !important; height:64px !important; max-width:64px !important; max-height:64px !important; }',
                '  .ac-word-card-img-placeholder { font-size:22px !important; }',
                '  .ac-word-card-german { font-size:12px !important; }',
                '  .ac-word-card-persian { font-size:10px !important; }',
                '  .ac-msg-bubble img { max-width:80px !important; max-height:80px !important; }',
                '}'
            ].join('\n');
            document.head.appendChild(s);
            console.log('✅ Card fix styles injected (separate)');
        };

        /* ============================================================
           فراخوانی خودکار
           ============================================================ */
    }
})();
