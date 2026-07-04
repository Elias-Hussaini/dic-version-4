
(function () {
    'use strict';

    if (typeof GermanDictionary === 'undefined') {
        console.warn('[کارت جزئیات لغت] GermanDictionary یافت نشد. این فایل باید بعد از scripts.js لود شود.');
        return;
    }

    /* ---------- ضمایر استاندارد آلمانی ---------- */
    const PRONOUNS = ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie/Sie'];

    /* ============================================================
       تابع جدید: تجزیه رشته صرف به ضمایر
       ورودی: "ich lerne, du lernst, er lernt, wir lernen, ihr lernt, sie lernen"
       خروجی: [{ pron:'ich', form:'lerne' }, { pron:'du', form:'lernst' }, ...]
       
       استراتژی:
       - اول با کاما یا / یا ؛ یا خط تیره عمودی جدا می‌کند
       - هر بخش را با اولین فاصله به ضمیر + فرم تقسیم می‌کند
       - اگر تعداد بخش‌ها با تعداد ضمایر برابر بود، مستقیماً نگاشت می‌کند
       ============================================================ */
    Object.assign(GermanDictionary.prototype, {
        _wdParseConjugation(text) {
            if (!text || typeof text !== 'string') return [];
            const cleaned = text.trim();
            if (!cleaned) return [];

            // جدا کردن با کاما، /، ؛، |، یا خط جدید
            let parts = cleaned.split(/[,/;|\n]+/).map(p => p.trim()).filter(Boolean);

            // اگر فقط یک بخش باشد → فرم خلاصه (مثلاً Perfekt: "habe gelernt")
            if (parts.length === 1) {
                return [{ pron: null, form: parts[0], single: true }];
            }

            // الگوی ضمیر آلمانی برای تشخیص
            const pronounPattern = /^(ich|du|er|sie|es|wir|ihr|Sie|männlich|weiblich)(\s|$)/i;

            // آیا همه‌ی بخش‌ها با ضمیر شروع می‌شوند؟
            const allStartWithPronoun = parts.every(p => pronounPattern.test(p));

            // اگر هیچ بخشی با ضمیر شروع نمی‌شود و تعداد کم است → فرم خلاصه
            // (مثلاً "habe gelernt, bin gegangen" که دو فرم کامل بدون ضمیر است)
            if (!allStartWithPronoun && parts.length <= 3 && parts.length !== 6 && parts.length !== PRONOUNS.length) {
                return [{ pron: null, form: cleaned, single: true }];
            }

            // اگر تعداد بخش‌ها با تعداد ضمایر (۸) برابر بود
            if (parts.length === PRONOUNS.length) {
                return parts.map((p, i) => {
                    const m = p.match(/^(\S+)\s+(.+)$/);
                    if (m && /^(ich|du|er|sie|es|wir|ihr|Sie)/i.test(p)) {
                        return { pron: m[1], form: m[2], single: false };
                    }
                    return { pron: PRONOUNS[i], form: p, single: false };
                });
            }

            // حالت ۶‌تایی رایج: ich, du, er/sie/es, wir, ihr, sie/Sie
            if (parts.length === 6) {
                const sixProns = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
                return parts.map((p, i) => {
                    const m = p.match(/^(\S+)\s+(.+)$/);
                    if (m && /^(ich|du|er|sie|es|wir|ihr|Sie)/i.test(p)) {
                        return { pron: m[1], form: m[2], single: false };
                    }
                    return { pron: sixProns[i], form: p, single: false };
                });
            }

            // حالت کلی: هر بخش را با اولین فاصله تقسیم کن
            const result = parts.map(p => {
                const m = p.match(/^(\S+)\s+(.+)$/);
                if (m) {
                    return { pron: m[1], form: m[2], single: false };
                }
                return { pron: null, form: p, single: true };
            });
            return result;
        },

        /* ============================================================
           renderWordDetails — کاملاً بازنویسی
           ============================================================ */
        async renderWordDetails(word) {
            if (!word) return;

            this.currentWord = word;
            const examples = await this.getExamplesForWord(word.id);
            const practiceHistory = await this.getPracticeHistory(word.id);
            const successRate = practiceHistory.length > 0
                ? Math.round((practiceHistory.filter(h => h.correct).length / practiceHistory.length) * 100) : 0;

            // ناوبری
            await this.getCurrentWordList();
            const currentIndex = this.currentWordList.findIndex(w => w.id === word.id);
            const totalInList = this.currentWordList.length;
            const positionText = (currentIndex !== -1 && totalInList > 0) ? `${currentIndex + 1}/${totalInList}` : '';

            const container = document.getElementById('search-results-container');
            if (!container) return;

            // تعیین بج نوع
            const typeBadge = word.type
                ? `<span class="wd-badge type-${word.type}"><i class="fas fa-tag"></i> ${this.getTypeLabel(word.type)}</span>`
                : '';
            const genderBadge = word.gender
                ? `<span class="wd-badge gender-${word.gender}">${this.getGenderLabel(word.gender)}</span>`
                : '';
            const pluralBadge = word.plural
                ? `<span class="wd-badge plural"><i class="fas fa-copy"></i> ${this.escapeHtml(word.plural)}</span>`
                : '';

            container.innerHTML = `
            <div class="wd-card">

                <!-- نوار بالایی -->
                <div class="wd-topbar">
                    <div class="wd-topbar-left">
                        <button id="backFromDetailBtn" class="wd-back-btn">
                            <i class="fas fa-arrow-right"></i> بازگشت به لیست
                        </button>
                        ${positionText ? `
                        <span class="wd-position-badge">
                            <i class="fas fa-list-ol"></i> ${positionText}
                        </span>` : ''}
                    </div>
                    <div class="wd-nav-arrows">
                    <button id="nextWordBtn" class="wd-nav-btn" title="بعدی">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <button id="prevWordBtn" class="wd-nav-btn" title="قبلی">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        
                    </div>
                </div>

                <!-- هدر اصلی -->
                <div class="wd-header">
                    <div class="wd-info">
                        <h1 class="wd-title">${this.escapeHtml(word.german)}</h1>
                        <div class="wd-badges">
                            ${genderBadge}
                            ${typeBadge}
                            ${pluralBadge}
                        </div>
                    </div>
                    <div class="wd-actions">
                        <button class="wd-action action-icon favorite ${this.favorites.has(word.id) ? 'active' : ''}" data-id="${word.id}" title="علاقه‌مندی">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="wd-action action-icon speak" data-word="${this.escapeHtml(word.german)}" title="تلفظ">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        <button class="wd-action action-icon edit" data-id="${word.id}" title="ویرایش">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="wd-action action-icon delete" data-id="${word.id}" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <!-- معنی -->
                <div class="wd-meaning">
                    <div class="wd-meaning-ic"><i class="fas fa-language"></i></div>
                    <p class="wd-meaning-text">${this.escapeHtml(word.persian)}</p>
                </div>

                <!-- تلفظ -->
                ${word.pronunciation ? `
                <div class="wd-pron">
                    <div class="wd-pron-ic"><i class="fas fa-microphone-alt"></i></div>
                    <span class="wd-pron-text">تلفظ: <b>${this.escapeHtml(word.pronunciation)}</b></span>
                    <button class="wd-listen-btn" onclick="dictionaryApp.speakText('${this.escapeHtml(word.german).replace(/'/g, "\\'")}', 'de-DE')">
                        <i class="fas fa-play"></i> گوش کن
                    </button>
                </div>` : ''}

                <!-- برچسب‌ها -->
                ${word.tags && word.tags.length > 0 ? `
                <div class="wd-tags">
                    ${word.tags.map(tag => `<span class="wd-tag">#${this.escapeHtml(tag)}</span>`).join('')}
                </div>` : ''}

                <!-- گرید جزئیات تخصصی -->
                <div class="wd-grid">
                    ${this.renderNounDetails(word)}
                    ${this.renderVerbDetails(word)}
                    ${this.renderAdjectiveDetails(word)}
                    ${this.renderPrepositionDetails(word)}
                </div>

                <!-- تب‌ها -->
                <div class="wd-tabs">
                    <button class="wd-tab tab-btn active" data-tab="examples">
                        <i class="fas fa-book"></i> مثال‌ها (${examples.length})
                    </button>
                    <button class="wd-tab tab-btn" data-tab="practice">
                        <i class="fas fa-dumbbell"></i> تمرین (${practiceHistory.length})
                    </button>
                    <button class="wd-tab tab-btn" data-tab="stats">
                        <i class="fas fa-chart-line"></i> آمار (${successRate}٪)
                    </button>
                </div>

                <!-- محتوای تب مثال‌ها -->
                <div class="wd-tab-content tab-content-modern active" id="tab-examples">
                    <div class="wd-examples">
                        ${examples.length > 0 ? examples.map(ex => `
                            <div class="wd-example" data-example-id="${ex.id}">
                                <div class="wd-example-body">
                                    <div class="wd-example-de">${this.escapeHtml(ex.german)}</div>
                                    <div class="wd-example-fa">${this.escapeHtml(ex.persian)}</div>
                                </div>
                                <div class="wd-example-actions">
                                    <button class="wd-example-btn speak" onclick="dictionaryApp.speakText('${this.escapeHtml(ex.german).replace(/'/g, "\\'")}', 'de-DE')" title="تلفظ">
                                        <i class="fas fa-volume-up"></i>
                                    </button>
                                    <button class="wd-example-btn example-delete delete" data-id="${ex.id}" title="حذف مثال">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('') : '<div class="wd-empty"><i class="fas fa-book"></i> هنوز مثالی ثبت نشده است</div>'}
                    </div>
                    <div class="wd-add-example">
                        <h4><i class="fas fa-plus-circle"></i> افزودن مثال جدید</h4>
                        <div class="wd-add-example-grid">
                            <textarea id="new-example-german" placeholder="مثال آلمانی..."></textarea>
                            <textarea id="new-example-persian" placeholder="ترجمه فارسی..."></textarea>
                            <button id="add-example-btn" class="wd-add-btn"><i class="fas fa-plus"></i> افزودن</button>
                        </div>
                    </div>
                </div>

                <!-- توضیحات -->
                ${word.notes ? `
                <div class="wd-notes">
                    <div class="wd-notes-head">
                        <i class="fas fa-sticky-note"></i>
                        <span>توضیحات</span>
                    </div>
                    <div class="wd-notes-body">${this.escapeHtml(word.notes).replace(/\n/g, '<br>')}</div>
                </div>` : ''}

                <!-- محتوای تب تمرین -->
                <div class="wd-tab-content tab-content-modern" id="tab-practice">
                    <div class="wd-practice">
                        <div class="wd-practice-ring">
                            <svg viewBox="0 0 36 36">
                                <defs>
                                    <linearGradient id="wd-grad-practice" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stop-color="#8b5cf6"/>
                                        <stop offset="100%" stop-color="#06b6d4"/>
                                    </linearGradient>
                                </defs>
                                <circle class="bg" cx="18" cy="18" r="15.9"/>
                                <circle class="fg" cx="18" cy="18" r="15.9"
                                    stroke-dasharray="${successRate}, 100"/>
                            </svg>
                            <div class="wd-practice-ring-label">
                                <b>${successRate}٪</b>
                                <small>دقت</small>
                            </div>
                        </div>
                        <div class="wd-practice-info">
                            <div class="wd-practice-stat"><i class="fas fa-brain blue"></i> تعداد تمرین <b>${practiceHistory.length}</b></div>
                            <div class="wd-practice-stat"><i class="fas fa-check-circle green"></i> پاسخ صحیح <b>${practiceHistory.filter(h => h.correct).length}</b></div>
                            <div class="wd-practice-stat"><i class="fas fa-times-circle red"></i> پاسخ نادرست <b>${practiceHistory.filter(h => !h.correct).length}</b></div>
                        </div>
                        <button id="practice-now-btn" class="wd-practice-cta">
                            <i class="fas fa-play"></i> شروع تمرین این لغت
                        </button>
                    </div>
                </div>

                <!-- محتوای تب آمار -->
                <div class="wd-tab-content tab-content-modern" id="tab-stats">
                    <div class="wd-stats">
                        <div class="wd-stat">
                            <div class="wd-stat-ic c-violet"><i class="fas fa-calendar-alt"></i></div>
                            <div class="wd-stat-label">تاریخ ثبت</div>
                            <div class="wd-stat-value">${new Date(word.createdAt).toLocaleDateString('fa-IR')}</div>
                        </div>
                        <div class="wd-stat">
                            <div class="wd-stat-ic c-amber"><i class="fas fa-star"></i></div>
                            <div class="wd-stat-label">امتیاز SRS</div>
                            <div class="wd-stat-value">${(this.srsData[word.id]?.level || 0)}/۵</div>
                        </div>
                        <div class="wd-stat">
                            <div class="wd-stat-ic c-emerald"><i class="fas fa-chart-line"></i></div>
                            <div class="wd-stat-label">موفقیت کلی</div>
                            <div class="wd-stat-value">${successRate}٪</div>
                        </div>
                    </div>
                </div>

            </div>`;

            // راه‌اندازی رویدادها
            this.setupDetailEventListeners(word);
            this.setupDetailNavigation();
            this._wdSetupTabs();
            this._wdUpdateSticky(word, positionText);
        },

        /* ============================================================
           تب‌های جدید (داخلی) — فقط برای کارت جزئیات
           ============================================================ */
        _wdSetupTabs() {
            // استفاده از منطق تب‌های اصلی (setupDetailEventListeners) — اینجا فقط اطمینان می‌دهیم که کلاس‌ها درست هستند
            // در واقع نیازی به کاری نیست چون setupDetailEventListeners خودش تب‌ها را مدیریت می‌کند.
            // این تابع فقط برای آینده نگه داشته شده است.
        },

        /* ============================================================
           setupDetailNavigation — بازنویسی برای پشتیبانی arrow key
           ----------------------------------------------------------------
           علت بازنویسی: در کد اصلی، keyHandler فقط وقتی اجرا می‌شد که
           عنصری با کلاس .detail-word-card وجود داشت. کارت جدید ما از
           کلاس .wd-card استفاده می‌کند، پس arrow keyها کار نمی‌کردند.
           
           این بازنویسی:
           • هم .wd-card (جدید) و هم .detail-word-card (قدیمی) را می‌پذیرد
           • ArrowRight → goToNextWord (بعدی)
           • ArrowLeft  → goToPrevWord (قبلی)
           • کلیدهای Q/E و PageDown/PageUp را هم اضافه کرده‌ایم برای راحتی
           • در textarea/input فعال نیست (تا تایپ کردن خراب نشود)
           ============================================================ */
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

            // ========== arrow key navigation ==========
            const keyHandler = (e) => {
                // آیا کارت جزئیات باز است؟ (کلاس جدید یا قدیمی)
                const detailCard = document.querySelector('.wd-card, .detail-word-card');
                if (!detailCard) return;

                // اگر کاربر در حال تایپ در input/textarea/contenteditable است، کاری نکن
                const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
                const isEditable = tag === 'input' || tag === 'textarea' ||
                                   (e.target && e.target.isContentEditable);
                if (isEditable) return;

                // نقشه کلیدها:
                //   ArrowRight  → بعدی (next)
                //   ArrowLeft   → قبلی (prev)
                //   e / PageDown → بعدی
                //   q / PageUp   → قبلی
                if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === 'e' || e.key === 'E') {
                    e.preventDefault();
                    this.goToNextWord();
                } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'q' || e.key === 'Q') {
                    e.preventDefault();
                    this.goToPrevWord();
                }
            };

            // پاک‌سازی handler قبلی برای جلوگیری از تداخل
            if (this.detailKeyHandler) {
                document.removeEventListener('keydown', this.detailKeyHandler);
            }
            this.detailKeyHandler = keyHandler;
            document.addEventListener('keydown', this.detailKeyHandler);
        },

        /* ============================================================
           هدر چسبان (Sticky Header) — هنگام اسکرول پایین
           ----------------------------------------------------------------
           نوار اطلاعاتی که وقتی کاربر پایین می‌رود، در بالای صفحه
           ثابت می‌ماند و شامل: لغت + معنی + نوع + شماره موقعیت + دکمه‌های
           تلفظ/قبلی/بعدی/بستن است.
           
           threshold قابل تنظیم: this._wdStickyThreshold (پیش‌فرض ۲۸۰px)
           ============================================================ */
        _wdStickyThreshold: 150,

        _wdEnsureSticky() {
            let sticky = document.getElementById('wd-sticky');
            if (!sticky) {
                sticky = document.createElement('div');
                sticky.id = 'wd-sticky';
                sticky.className = 'wd-sticky';
                sticky.setAttribute('role', 'banner');
                sticky.setAttribute('aria-label', 'نوار اطلاعاتی سریع لغت');
                sticky.setAttribute('tabindex', '-1');
                document.body.appendChild(sticky);
            }

            // scroll listener (یک بار)
            if (!this._wdStickyListenerAdded) {
                this._wdStickyListenerAdded = true;
                this._wdStickyDismissed = false;

                const onScroll = () => {
                    const s = document.getElementById('wd-sticky');
                    if (!s) return;

                    // اگر کارت جزئیات وجود ندارد یا فعال نیست → مخفی کن
                    const card = document.querySelector('.wd-card');
                    if (!card) { s.classList.remove('visible'); return; }
                    const section = card.closest('.content-section');
                    if (section && !section.classList.contains('active')) {
                        s.classList.remove('visible');
                        return;
                    }

                    // اگر کاربر نزدیک بالای صفحه است، حالت dismiss را ریست کن
                    if (window.scrollY < 80) {
                        this._wdStickyDismissed = false;
                    }

                    // منطق نمایش: وقتی هدر لغت (عنوان + بج‌ها) از دید خارج شد → نمایش
                    const header = document.querySelector('.wd-header');
                    let shouldShow = false;
                    if (header) {
                        const rect = header.getBoundingClientRect();
                        // وقتی پایینِ هدر از بالای viewport بالاتر رفت (یعنی اسکرول شد)
                        shouldShow = rect.bottom < 10;
                    } else {
                        // fallback: threshold ثابت
                        shouldShow = window.scrollY > (this._wdStickyThreshold || 280);
                    }

                    if (shouldShow && !this._wdStickyDismissed) {
                        s.classList.add('visible');
                    } else {
                        s.classList.remove('visible');
                    }
                };

                window.addEventListener('scroll', onScroll, { passive: true });
                onScroll();
            }

            // MutationObserver: وقتی section فعال تغییر می‌کند (مثلاً دکمه بازگشت)
            if (!this._wdSectionObserver) {
                this._wdSectionObserver = new MutationObserver(() => {
                    const s = document.getElementById('wd-sticky');
                    if (!s) return;
                    const card = document.querySelector('.wd-card');
                    if (!card) { s.classList.remove('visible'); return; }
                    const section = card.closest('.content-section');
                    if (section && !section.classList.contains('active')) {
                        s.classList.remove('visible');
                    }
                });
                document.querySelectorAll('.content-section').forEach(sec => {
                    this._wdSectionObserver.observe(sec, { attributes: true, attributeFilter: ['class'] });
                });
            }
        },

        _wdUpdateSticky(word, positionText) {
            this._wdEnsureSticky();
            const sticky = document.getElementById('wd-sticky');
            if (!sticky) return;

            const typeLabel = word.type ? this.getTypeLabel(word.type) : '';
            const typeClass = word.type ? `type-${word.type}` : 'type-other';
            // شماره موقعیت: "3/137" → "3"
            const posNum = positionText ? positionText.split('/')[0].trim() : '';

            sticky.innerHTML = `
                <div class="wd-sticky-inner">
                    <div class="wd-sticky-word">${this.escapeHtml(word.german)}</div>
                    <div class="wd-sticky-meaning">${this.escapeHtml(word.persian)}</div>
                    ${typeLabel ? `<span class="wd-sticky-pos ${typeClass}"><i class="fas fa-tag"></i> <span>${typeLabel}</span></span>` : ''}
                    ${posNum ? `<span class="wd-sticky-position" title="موقعیت در لیست: ${positionText}"><i class="fas fa-list-ol"></i> <span>#${posNum}</span></span>` : ''}
                    <div class="wd-sticky-actions">
                        <button class="wd-sticky-btn wd-sticky-speak" title="تلفظ" aria-label="تلفظ لغت" type="button">
                            <i class="fas fa-volume-up"></i>
                        </button>
                         <button class="wd-sticky-btn" id="wd-sticky-next" title="بعدی (E)" aria-label="لغت بعدی" type="button">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <button class="wd-sticky-btn" id="wd-sticky-prev" title="قبلی (Q)" aria-label="لغت قبلی" type="button">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                       
                        <button class="wd-sticky-btn wd-sticky-close" id="wd-sticky-close" title="بستن نوار" aria-label="بستن نوار اطلاعات" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>`;

            // رویدادها
            const speakBtn = sticky.querySelector('.wd-sticky-speak');
            if (speakBtn) speakBtn.onclick = () => this.speakText(word.german, 'de-DE');

            const prevBtn = sticky.querySelector('#wd-sticky-prev');
            if (prevBtn) prevBtn.onclick = (e) => { e.preventDefault(); this.goToPrevWord(); };

            const nextBtn = sticky.querySelector('#wd-sticky-next');
            if (nextBtn) nextBtn.onclick = (e) => { e.preventDefault(); this.goToNextWord(); };

            const closeBtn = sticky.querySelector('#wd-sticky-close');
            if (closeBtn) closeBtn.onclick = () => {
                sticky.classList.remove('visible');
                this._wdStickyDismissed = true;
            };
        },

        _wdHideSticky() {
            const sticky = document.getElementById('wd-sticky');
            if (sticky) sticky.classList.remove('visible');
        },

        /* ============================================================
           renderNounDetails — پنل زیبا برای اسم
           ============================================================ */
        renderNounDetails(word) {
            if (word.type !== 'noun') return '';
            return `
                <div class="wd-panel">
                    <div class="wd-panel-head">
                        <div class="wd-panel-ic ic-noun"><i class="fas fa-venus-mars"></i></div>
                        <div>
                            <h3 class="wd-panel-title">جزئیات اسم</h3>
                            <div class="wd-panel-sub">Substantiv</div>
                        </div>
                    </div>
                    <div class="wd-rows">
                        <div class="wd-row">
                            <div class="wd-row-label"><i class="fas fa-mars"></i> جنسیت</div>
                            <div class="wd-row-value">${word.gender ? this.getGenderLabel(word.gender) : 'نامشخص'}</div>
                        </div>
                        ${word.plural ? `
                        <div class="wd-row">
                            <div class="wd-row-label"><i class="fas fa-copy"></i> جمع (Plural)</div>
                            <div class="wd-row-value de">${this.escapeHtml(word.plural)}</div>
                        </div>` : ''}
                    </div>
                </div>
            `;
        },

        /* ============================================================
           renderVerbDetails — جدول صرف فعل با ضمایر (اصلی‌ترین تغییر)
           ============================================================ */
        renderVerbDetails(word) {
            if (word.type !== 'verb' || !word.verbForms) return '';
            const vf = word.verbForms;

            // پنل کامل (occupies full width)
            const blocks = [];

            // متادیتا: فعل کمکی + جداشدنی
            const metaPills = [];
            if (vf.helper) {
                metaPills.push(`<span class="wd-verb-meta-pill helper"><i class="fas fa-plus-circle"></i> فعل کمکی: ${this.escapeHtml(vf.helper)}</span>`);
            }
            if (vf.separable) {
                metaPills.push(`<span class="wd-verb-meta-pill separable"><i class="fas fa-cut"></i> جداشدنی (trennbar)</span>`);
            } else if (vf.separable === false) {
                metaPills.push(`<span class="wd-verb-meta-pill not-separable"><i class="fas fa-link"></i> جدانشدنی</span>`);
            }

            // هر زمان را به‌صورت بلاک جداگانه رندر کن
            const tenses = [
                { key: 'present',    label: 'Präsens',     sub: 'حال ساده',    icon: 'fa-book-open' },
                { key: 'past',       label: 'Präteritum',  sub: 'گذشته ساده',  icon: 'fa-clock-rotate-left' },
                { key: 'perfect',    label: 'Perfekt',     sub: 'گذشته کامل',  icon: 'fa-check-double' },
                { key: 'future',     label: 'Futur I',     sub: 'آینده',       icon: 'fa-forward' },
                { key: 'konjunktiv', label: 'Konjunktiv II', sub: 'التزامی',   icon: 'fa-question-circle' }
            ];

            for (const t of tenses) {
                const raw = vf[t.key];
                if (!raw || !raw.trim()) continue;

                const parsed = this._wdParseConjugation(raw);
                let body = '';

                if (parsed.length === 1 && parsed[0].single) {
                    // فرم خلاصه (مثل Perfekt: "habe gelernt")
                    body = `<div class="wd-conj-single">${this.escapeHtml(parsed[0].form)}</div>`;
                } else {
                    // جدول ضمایر
                    const rows = parsed.map(p => `
                        <tr>
                            <td class="wd-pron-cell">${this.escapeHtml(p.pron || '—')}</td>
                            <td class="wd-form-cell ${!p.form ? 'empty' : ''}">${p.form ? this.escapeHtml(p.form) : '—'}</td>
                            <td class="wd-speak-cell">
                                ${p.form ? `<button class="wd-conj-speak" onclick="dictionaryApp.speakText('${this.escapeHtml(p.form).replace(/'/g, "\\'")}', 'de-DE')" title="تلفظ"><i class="fas fa-volume-up"></i></button>` : ''}
                            </td>
                        </tr>
                    `).join('');
                    body = `<table class="wd-conj-table">
                        <tbody>${rows}</tbody>
                    </table>`;
                }

                blocks.push(`
                    <div class="wd-conj-block">
                        <div class="wd-conj-block-head">
                            <div class="wd-conj-block-title"><i class="fas ${t.icon}"></i> ${t.label} <span style="color:var(--wd-muted);font-weight:500">• ${t.sub}</span></div>
                        </div>
                        ${body}
                    </div>
                `);
            }

            // اگر هیچ بلاکی نبود، پنل را برنگردان
            if (blocks.length === 0 && metaPills.length === 0) return '';

            return `
                <div class="wd-panel full">
                    <div class="wd-panel-head">
                        <div class="wd-panel-ic ic-verb"><i class="fas fa-table"></i></div>
                        <div>
                            <h3 class="wd-panel-title">صرف فعل</h3>
                            <div class="wd-panel-sub">Konjugation</div>
                        </div>
                    </div>
                    ${metaPills.length ? `<div class="wd-verb-meta">${metaPills.join('')}</div>` : ''}
                    <div class="wd-conj-wrap">
                        ${blocks.length ? blocks.join('') : '<div class="wd-empty"><i class="fas fa-info-circle"></i> هنوز فرم صرف‌شده‌ای ثبت نشده</div>'}
                    </div>
                </div>
            `;
        },

        /* ============================================================
           renderAdjectiveDetails — پنل زیبا برای صفت
           ============================================================ */
        renderAdjectiveDetails(word) {
            if (word.type !== 'adjective') return '';
            const rows = [];
            if (word.comparative) {
                rows.push(`<div class="wd-row"><div class="wd-row-label"><i class="fas fa-level-up-alt"></i> Komparativ (برتر)</div><div class="wd-row-value de">${this.escapeHtml(word.comparative)}</div></div>`);
            }
            if (word.superlative) {
                rows.push(`<div class="wd-row"><div class="wd-row-label"><i class="fas fa-crown"></i> Superlativ (برترین)</div><div class="wd-row-value de">${this.escapeHtml(word.superlative)}</div></div>`);
            }
            if (word.antonym) {
                rows.push(`<div class="wd-row"><div class="wd-row-label"><i class="fas fa-exchange-alt"></i> متضاد (Antonym)</div><div class="wd-row-value de">${this.escapeHtml(word.antonym)}</div></div>`);
            }
            if (rows.length === 0) return '';
            return `
                <div class="wd-panel">
                    <div class="wd-panel-head">
                        <div class="wd-panel-ic ic-adjective"><i class="fas fa-palette"></i></div>
                        <div>
                            <h3 class="wd-panel-title">حالت‌های صفت</h3>
                            <div class="wd-panel-sub">Adjektiv</div>
                        </div>
                    </div>
                    <div class="wd-rows">${rows.join('')}</div>
                </div>
            `;
        },

        /* ============================================================
           renderPrepositionDetails — پنل زیبا برای حرف اضافه
           ============================================================ */
        renderPrepositionDetails(word) {
            if (word.type !== 'preposition') return '';
            const rows = [];
            if (word.case) {
                rows.push(`<div class="wd-row"><div class="wd-row-label"><i class="fas fa-map-marker-alt"></i> حالت (Kasus)</div><div class="wd-row-value">${this.escapeHtml(word.case)}</div></div>`);
            }
            if (word.meanings) {
                rows.push(`<div class="wd-row"><div class="wd-row-label"><i class="fas fa-list"></i> معانی مختلف</div><div class="wd-row-value">${this.escapeHtml(word.meanings)}</div></div>`);
            }
            if (rows.length === 0) return '';
            return `
                <div class="wd-panel">
                    <div class="wd-panel-head">
                        <div class="wd-panel-ic ic-prep"><i class="fas fa-link"></i></div>
                        <div>
                            <h3 class="wd-panel-title">حالت حرف اضافه</h3>
                            <div class="wd-panel-sub">Präposition</div>
                        </div>
                    </div>
                    <div class="wd-rows">${rows.join('')}</div>
                </div>
            `;
        }
    });

    console.log('✅ کارت جزئیات لغت (نسخه حرفه‌ای) فعال شد.');
})();