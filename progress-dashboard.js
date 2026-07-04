
(function () {
    'use strict';

    // منتظر می‌مانیم تا کلاس GermanDictionary تعریف شود
    if (typeof GermanDictionary === 'undefined') {
        console.warn('[داشبورد پیشرفت] کلاس GermanDictionary یافت نشد. این فایل باید بعد از scripts.js لود شود.');
        return;
    }

    /* ---------- پالت رنگ ثابت برای نمودارها ---------- */
    const PD = {
        emerald: '#10b981', emeraldD: '#059669',
        violet:  '#8b5cf6', violetD:  '#6d28d9',
        amber:   '#f59e0b', amberD:   '#d97706',
        rose:    '#f43f5e', roseD:    '#e11d48',
        cyan:    '#06b6d4', cyanD:    '#0891b2',
        slate:   '#64748b', ink:      '#0f172a'
    };
    // رنگ و برچسب فارسی هر نوع کلمه
    const TYPE_META = {
        noun:        { color: PD.emerald, label: 'اسم' },
        verb:        { color: PD.violet,  label: 'فعل' },
        adjective:   { color: PD.amber,   label: 'صفت' },
        adverb:      { color: PD.cyan,    label: 'قید' },
        preposition: { color: PD.rose,    label: 'حرف اضافه' },
        other:       { color: PD.slate,   label: 'سایر' }
    };
    // رنگ هر سطح SRS (۰ تا ۵)
    const SRS_COLORS = ['#94a3b8', '#f43f5e', '#f59e0b', '#eab308', '#10b981', '#059669'];

    /* ============================================================
       متدهای جدید روی prototype
       ============================================================ */
    Object.assign(GermanDictionary.prototype, {

        /* ---------- تزریق فونت وزیر (یک‌بار) ---------- */
        _pdEnsureFont() {
            if (this._pdFontLoaded) return;
            // ۱) لینک فونت وزیرمتن از گوگل‌فونت
            if (!document.getElementById('pd-vazir-link')) {
                const link = document.createElement('link');
                link.id = 'pd-vazir-link';
                link.rel = 'stylesheet';
                link.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap';
                document.head.appendChild(link);
            }
            // ۲) اعمال فونت وزیر روی متن‌ها، حفظ فونت FontAwesome روی آیکون‌ها
            //    مهم: آیکون‌های FA روی تگ <i> هستند. فونت FA را با !important قفل می‌کنیم.
            if (!document.getElementById('pd-vazir-style')) {
                const style = document.createElement('style');
                style.id = 'pd-vazir-style';
                style.textContent = `
                    /* فونت پایه داشبورد: وزیرمتن */
                    .pd-wrap {
                        font-family: 'Vazirmatn', Tahoma, sans-serif;
                    }
                    /* ⚠️ همه‌ی تگ‌های <i> داخل داشبورد = آیکون FontAwesome
                          فونت FA را با !important قفل می‌کنیم تا Vazirmatن نتواند آن را بازنویسی کند. */
                    .pd-wrap i,
                    .pd-wrap i::before,
                    .pd-wrap [class^="fa-"]::before,
                    .pd-wrap [class*=" fa-"]::before,
                    .pd-wrap .fas::before,
                    .pd-wrap .far::before,
                    .pd-wrap .fab::before,
                    .pd-wrap .fa-solid::before,
                    .pd-wrap .fa-regular::before,
                    .pd-wrap .fa-brands::before {
                        font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
                    }
                    .pd-wrap i.fab,
                    .pd-wrap i.fa-brands,
                    .pd-wrap .fab::before,
                    .pd-wrap .fa-brands::before {
                        font-family: "Font Awesome 6 Brands", "Font Awesome 5 Brands", "FontAwesome" !important;
                    }
                    /* وزن فونت صحیح برای رندر شدن آیکون‌ها (Solid = 900, Regular = 400) */
                    .pd-wrap i.fas,
                    .pd-wrap i.fa-solid {
                        font-weight: 900 !important;
                    }
                    .pd-wrap i.far,
                    .pd-wrap i.fa-regular {
                        font-weight: 400 !important;
                    }
                    .pd-wrap i.fab,
                    .pd-wrap i.fa-brands {
                        font-weight: 400 !important;
                    }
                `;
                document.head.appendChild(style);
            }
            this._pdFontLoaded = true;
        },

        /* ---------- اسکلتون داشبورد (یک‌بار ساخته می‌شود) ---------- */
        _pdBuildSkeleton() {
            if (this._pdBuilt) return;
            // ابتدا فونت وزیر را تزریق کن
            this._pdEnsureFont();

            const sec = document.getElementById('progress-section');
            if (!sec) return;

            sec.innerHTML = `
            <div class="pd-wrap">
                <!-- هدر -->
                <div class="section-header">
                    <h2><i class="fas fa-chart-line" style="color:${PD.emeraldD};"></i>
                        داشبورد پیشرفت یادگیری</h2>
                </div>

                <!-- بنر اصلی -->
                <div class="pd-hero" id="pd-hero"></div>

                <!-- کارت‌های KPI -->
                <div class="pd-kpi-grid" id="pd-kpi-grid"></div>

                <!-- نگهدار مخفی برای سازگاری با renderSRSStats قدیمی -->
                <div id="stats-grid" style="display:none"></div>

                <!-- ردیف اول: نمودار فعالیت ۳۰ روز + دونات نوع لغات -->
                <div class="pd-row r-2-1">
                    <div class="pd-card pd-rise pd-rise-1">
                        <div class="pd-card-head">
                            <h3 class="pd-card-title">
                                <span class="pd-ic" style="background:linear-gradient(135deg,${PD.emerald},${PD.emeraldD})"><i class="fas fa-wave-square"></i></span>
                                فعالیت ۳۰ روز اخیر
                            </h3>
                            <div class="pd-legend">
                                <span class="pd-legend-item"><span class="pd-legend-dot" style="background:${PD.emerald}"></span>صحیح</span>
                                <span class="pd-legend-item"><span class="pd-legend-dot" style="background:${PD.rose}"></span>نادرست</span>
                            </div>
                        </div>
                        <div class="pd-area-wrap"><div class="pd-area" id="pd-activity-chart"></div></div>
                    </div>
                    <div class="pd-card pd-rise pd-rise-2">
                        <div class="pd-card-head">
                            <h3 class="pd-card-title">
                                <span class="pd-ic" style="background:linear-gradient(135deg,${PD.violet},${PD.violetD})"><i class="fas fa-chart-pie"></i></span>
                                توزیع نوع لغات
                            </h3>
                        </div>
                        <div id="pd-types-donut"></div>
                    </div>
                </div>

                <!-- ردیف دوم: رادار دقت + توزیع SRS -->
                <div class="pd-row r-1-1">
                    <div class="pd-card pd-rise pd-rise-2">
                        <div class="pd-card-head">
                            <h3 class="pd-card-title">
                                <span class="pd-ic" style="background:linear-gradient(135deg,${PD.violet},${PD.violetD})"><i class="fas fa-bullseye"></i></span>
                                دقت بر اساس نوع لغت
                            </h3>
                            <span class="pd-pill b-violet">نمودار راداری</span>
                        </div>
                        <div id="pd-radar" class="pd-radar"></div>
                    </div>
                    <div class="pd-card pd-rise pd-rise-3">
                        <div class="pd-card-head">
                            <h3 class="pd-card-title">
                                <span class="pd-ic" style="background:linear-gradient(135deg,${PD.emerald},${PD.emeraldD})"><i class="fas fa-layer-group"></i></span>
                                توزیع سطح یادگیری (SRS)
                            </h3>
                            <span class="pd-pill b-emerald">سطح ۰ تا ۵</span>
                        </div>
                        <div id="pd-srs-box"></div>
                    </div>
                </div>

                <!-- نقشه حرارتی فعالیت سالانه -->
                <div class="pd-card pd-rise pd-rise-3" style="margin-bottom:22px;">
                    <div class="pd-card-head">
                        <h3 class="pd-card-title">
                            <span class="pd-ic" style="background:linear-gradient(135deg,${PD.emerald},${PD.cyan})"><i class="fas fa-fire"></i></span>
                            نقشه حرارتی فعالیت
                        </h3>
                        <span class="pd-hm-legend">
                            کمتر
                            <span class="pd-hm-cell"></span>
                            <span class="pd-hm-cell l1"></span>
                            <span class="pd-hm-cell l2"></span>
                            <span class="pd-hm-cell l3"></span>
                            <span class="pd-hm-cell l4"></span>
                            بیشتر
                        </span>
                    </div>
                    <div class="pd-heatmap-wrap">
                        <div class="pd-heatmap" id="pd-heatmap"></div>
                        <div class="pd-hm-months" id="pd-hm-months"></div>
                    </div>
                </div>

                <!-- ردیف سوم: فعالیت هفتگی + حلقه‌های هدف -->
                <div class="pd-row r-1-1">
                    <div class="pd-card pd-rise pd-rise-4">
                        <div class="pd-card-head">
                            <h3 class="pd-card-title">
                                <span class="pd-ic" style="background:linear-gradient(135deg,${PD.amber},${PD.amberD})"><i class="fas fa-calendar-week"></i></span>
                                فعالیت هفتگی
                            </h3>
                        </div>
                        <div id="weekly-progress" class="pd-weekly"></div>
                    </div>
                    <div class="pd-card pd-rise pd-rise-4">
                        <div class="pd-card-head">
                            <h3 class="pd-card-title">
                                <span class="pd-ic" style="background:linear-gradient(135deg,${PD.violet},${PD.violetD})"><i class="fas fa-flag-checkered"></i></span>
                                اهداف یادگیری
                            </h3>
                        </div>
                        <div id="pd-goals" class="pd-goals"></div>
                    </div>
                </div>

                <!-- دستاوردها -->
                <div class="pd-card pd-rise" style="margin-bottom:22px;">
                    <div class="pd-card-head">
                        <h3 class="pd-card-title">
                            <span class="pd-ic" style="background:linear-gradient(135deg,${PD.amber},${PD.rose})"><i class="fas fa-trophy"></i></span>
                            دستاوردها
                        </h3>
                        <span class="pd-pill b-amber" id="pd-ach-summary-pill"></span>
                    </div>
                    <div id="pd-ach-summary" class="pd-ach-summary"></div>
                    <div id="achievements-list" class="pd-ach-grid"></div>
                </div>

                <!-- فعالیت اخیر (تایم‌لاین) -->
                <div class="pd-card pd-rise" style="margin-bottom:22px;">
                    <div class="pd-card-head">
                        <h3 class="pd-card-title">
                            <span class="pd-ic" style="background:linear-gradient(135deg,${PD.cyan},${PD.violetD})"><i class="fas fa-history"></i></span>
                            آخرین فعالیت‌ها
                        </h3>
                    </div>
                    <div id="recent-activity" class="pd-timeline"></div>
                </div>

                <!-- آمار بازه دلخواه -->
                <div class="pd-card pd-rise">
                    <div class="pd-card-head">
                        <h3 class="pd-card-title">
                            <span class="pd-ic" style="background:linear-gradient(135deg,${PD.violet},${PD.cyan})"><i class="fas fa-calendar-alt"></i></span>
                            آمار در بازه دلخواه
                        </h3>
                        <div class="pd-card-tools">
                            <button class="pd-btn pd-btn-quick" data-pd-range="7">۷ روز</button>
                            <button class="pd-btn pd-btn-quick" data-pd-range="30">۳۰ روز</button>
                            <button class="pd-btn pd-btn-quick" data-pd-range="90">۹۰ روز</button>
                        </div>
                    </div>
                    <div class="pd-custom-bar">
                        <div class="pd-cb-field">
                            <label>از تاریخ</label>
                            <input type="date" id="custom-stats-start">
                        </div>
                        <div class="pd-cb-field">
                            <label>تا تاریخ</label>
                            <input type="date" id="custom-stats-end">
                        </div>
                        <div class="pd-cb-actions">
                            <button class="pd-btn pd-btn-primary" id="apply-custom-stats"><i class="fas fa-search"></i> نمایش</button>
                            <button class="pd-btn pd-btn-ghost" id="reset-custom-stats"><i class="fas fa-undo"></i> بازنشانی</button>
                        </div>
                    </div>
                    <div id="custom-stats-results" class="pd-custom-stats"></div>
                </div>

            </div>`;

            this._pdBuilt = true;
        },

        /* ---------- تبدیل عدد به فارسی ---------- */
        _pdFaNum(n) {
            try { return Number(n).toLocaleString('fa-IR'); }
            catch (e) { return String(n); }
        },

        /* ---------- انیمیشن شمارش ---------- */
        _pdAnimateNumber(el, to, dur = 750) {
            if (!el) return;
            const suffix = el.dataset.suffix || '';
            const from = 0;
            const t0 = performance.now();
            const step = (t) => {
                const p = Math.min(1, (t - t0) / dur);
                const eased = 1 - Math.pow(1 - p, 3);
                const val = Math.round(from + (to - from) * eased);
                el.textContent = this._pdFaNum(val) + suffix;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        },

        /* ---------- محاسبه استریک (رشته روزهای متوالی) ---------- */
        _pdComputeStreak(history) {
            const days = new Set();
            (history || []).forEach(r => {
                if (r && r.date) days.add(String(r.date).split('T')[0]);
            });
            // استریک فعلی
            let current = 0;
            const d = new Date(); d.setHours(0, 0, 0, 0);
            // اگر امروز فعالیتی نیست، از دیروز شروع کن (استریک تا دیروز حفظ می‌شود)
            if (!days.has(this._pdDateKey(d))) d.setDate(d.getDate() - 1);
            while (days.has(this._pdDateKey(d))) {
                current++;
                d.setDate(d.getDate() - 1);
            }
            // طولانی‌ترین استریک
            const sorted = [...days].sort();
            let longest = 0, run = 0, prev = null;
            for (const ds of sorted) {
                if (prev) {
                    const diff = Math.round((new Date(ds) - new Date(prev)) / 86400000);
                    run = (diff === 1) ? run + 1 : 1;
                } else { run = 1; }
                if (run > longest) longest = run;
                prev = ds;
            }
            return { current, longest: Math.max(longest, current) };
        },
        _pdDateKey(d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        },

        /* ---------- اسپارک‌لاین ---------- */
        _pdSparkline(values, color) {
            if (!values || values.length === 0) return '';
            const w = 100, h = 28, pad = 3;
            const max = Math.max(...values, 1);
            const min = Math.min(...values, 0);
            const range = (max - min) || 1;
            const n = values.length;
            const pts = values.map((v, i) => {
                const x = pad + (n === 1 ? 0 : (i / (n - 1)) * (w - pad * 2));
                const y = h - pad - ((v - min) / range) * (h - pad * 2);
                return [x, y];
            });
            const line = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
            const area = `${line} L${pts[n - 1][0]},${h} L${pts[0][0]},${h} Z`;
            const gid = 'pdsp' + Math.random().toString(36).slice(2, 8);
            return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
                <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
                </linearGradient></defs>
                <path d="${area}" fill="url(#${gid})"/>
                <path d="${line}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
            </svg>`;
        },

        /* ============================================================
           updateStats — ارکسترتر اصلی (کاملاً جایگزین)
           ============================================================ */
        async updateStats() {
            // ۱) ساخت اسکلتون یک‌بار
            this._pdBuildSkeleton();

            if (!this.db) {
                setTimeout(() => this.updateStats(), 500);
                return;
            }

            // ۲) اگر بخش پیشرفت مخفی است، رندر سنگین را به تعویق بینداز
            const sec = document.getElementById('progress-section');
            if (sec && !sec.classList.contains('active')) {
                this._pdDirty = true;
                return;
            }
            this._pdDirty = false;

            try {
                const words = await this.getAllWords();
                const history = await this.getAllPracticeHistory();
                this._pdLastHistory = history;
                this._pdLastWordsCount = words.length;

                // ---- محاسبات پایه ----
                const totalWords = words.length;
                const totalFavorites = this.favorites ? this.favorites.size : 0;
                const totalPractice = history.length;
                const correctPractice = history.filter(h => h.correct).length;
                const wrongPractice = totalPractice - correctPractice;
                const accuracy = totalPractice > 0 ? Math.round((correctPractice / totalPractice) * 100) : 0;

                const todayKey = this._pdDateKey(new Date());
                const todayPractice = history.filter(h => String(h.date).split('T')[0] === todayKey);
                const todayCorrect = todayPractice.filter(h => h.correct).length;

                // ---- SRS ----
                const srsEntries = Object.values(this.srsData || {});
                const mastered = srsEntries.filter(s => s.level >= 4).length;
                const reviewToday = (this.reviewWords || []).length;
                let totalLevel = 0;
                srsEntries.forEach(s => totalLevel += (s.level || 0));
                const avgLevel = srsEntries.length > 0 ? (totalLevel / srsEntries.length) : 0;
                const masteryPct = Math.round((avgLevel / 5) * 100);

                // ---- استریک ----
                const streak = this._pdComputeStreak(history);

                // ---- امتیاز (XP) و سطح ----
                const xp = correctPractice * 10 + totalWords * 5 + mastered * 25;
                const level = Math.floor(Math.sqrt(xp / 50)) + 1;

                // ---- داده ۱۴ روزه برای اسپارک‌لاین KPI ----
                const last14 = this._pdDailySeries(history, 14);
                const last14NewWords = this._pdDailySeriesWords(words, 14);

                // ---- رندر بخش‌ها ----
                this._pdRenderHero({ masteryPct, streak, level, xp, mastered, totalWords });
                this._pdRenderKPIs({
                    totalWords, accuracy, totalPractice, streak, mastered,
                    reviewToday, todayPractice: todayPractice.length, todayCorrect,
                    favorites: totalFavorites, avgLevel,
                    sparkPractice: last14.map(d => d.total),
                    sparkCorrect: last14.map(d => d.correct),
                    sparkWords: last14NewWords
                });
                this._pdRenderActivityChart(history);
                this._pdRenderTypesDonut(words);
                this._pdRenderAccuracyRadar(words, history);
                this._pdRenderSRSDistribution();
                this._pdRenderHeatmap(history);
                this.renderWeeklyProgress(history);
                this._pdRenderGoals({ todayPractice: todayPractice.length, weekPractice: this._pdWeekTotal(history), mastered });
                this.renderAchievements(totalWords, totalPractice, accuracy);
                this.renderRecentActivity(history);

                // ---- راه‌اندازی آمار سفارشی (یک بار) ----
                if (!this.customStatsInitialized) {
                    this.setupCustomStats();
                    this.customStatsInitialized = true;
                }

            } catch (err) {
                console.error('❌ خطا در آپدیت آمار (داشبورد پیشرفت):', err);
            }
        },

        /* ---------- سری روزانه برای اسپارک‌لاین ---------- */
        _pdDailySeries(history, days) {
            const out = [];
            const today = new Date(); today.setHours(0, 0, 0, 0);
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(today); d.setDate(today.getDate() - i);
                const key = this._pdDateKey(d);
                const dayRecs = history.filter(h => String(h.date).split('T')[0] === key);
                out.push({
                    key, total: dayRecs.length,
                    correct: dayRecs.filter(h => h.correct).length,
                    wrong: dayRecs.length - dayRecs.filter(h => h.correct).length
                });
            }
            return out;
        },
        _pdDailySeriesWords(words, days) {
            const out = [];
            const today = new Date(); today.setHours(0, 0, 0, 0);
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(today); d.setDate(today.getDate() - i);
                const start = new Date(d); start.setHours(0, 0, 0, 0);
                const end = new Date(d); end.setHours(23, 59, 59, 999);
                out.push(words.filter(w => {
                    const wd = new Date(w.createdAt);
                    return wd >= start && wd <= end;
                }).length);
            }
            return out;
        },
        _pdWeekTotal(history) {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const jsDay = today.getDay();
            const map = [6, 0, 1, 2, 3, 4, 5];
            const pIdx = map[jsDay];
            const start = new Date(today); start.setDate(today.getDate() - pIdx);
            let count = 0;
            for (let i = 0; i < 7; i++) {
                const d = new Date(start); d.setDate(start.getDate() + i);
                const key = this._pdDateKey(d);
                count += history.filter(h => String(h.date).split('T')[0] === key).length;
            }
            return count;
        },

        /* ============================================================
           بنر اصلی (Hero)
           ============================================================ */
        _pdRenderHero({ masteryPct, streak, level, xp, mastered, totalWords }) {
            const el = document.getElementById('pd-hero');
            if (!el) return;
            const ringR = 42, ringC = 2 * Math.PI * ringR;
            const offset = ringC * (1 - masteryPct / 100);
            const flame = streak.current > 0 ? '🔥' : '';

            el.innerHTML = `
                <div class="pd-hero-grid">
                    <div class="pd-hero-main">
                        <div class="pd-hero-ring">
                            <svg viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="pd-grad-stroke" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stop-color="#10b981"/>
                                        <stop offset="100%" stop-color="#06b6d4"/>
                                    </linearGradient>
                                </defs>
                                <circle class="pd-ring-bg" cx="50" cy="50" r="${ringR}"/>
                                <circle class="pd-ring-fg" cx="50" cy="50" r="${ringR}"
                                    stroke-dasharray="${ringC}" stroke-dashoffset="${offset}"
                                    stroke="url(#pd-grad-stroke)"/>
                            </svg>
                            <div class="pd-hero-ring-label">
                                <b data-pd-num="${masteryPct}" data-suffix="٪">۰٪</b>
                                <small>تسلط</small>
                            </div>
                        </div>
                        <div class="pd-hero-title">
                            <h2>مسیر یادگیری شما</h2>
                            <p>هر روز یک قدم به تسلط نزدیک‌تر می‌شوید.</p>
                            <span class="pd-hero-level">
                                <i class="fas fa-medal"></i>
                                سطح <b data-pd-num="${level}">۱</b>
                                &nbsp;•&nbsp; <i class="fas fa-bolt"></i> <span data-pd-num="${xp}">۰</span> امتیاز
                            </span>
                        </div>
                    </div>
                    <div class="pd-hero-stat">
                        <div class="pd-hs-val is-streak">${flame}<span data-pd-num="${streak.current}">۰</span></div>
                        <div class="pd-hs-label">استریک روزانه</div>
                        <div class="pd-hs-sub">رکورد: <span data-pd-num="${streak.longest}">۰</span></div>
                    </div>
                    <div class="pd-hero-stat">
                        <div class="pd-hs-val"><span data-pd-num="${mastered}">۰</span></div>
                        <div class="pd-hs-label">لغات تسلط‌یافته</div>
                        <div class="pd-hs-sub">سطح SRS ≥ ۴</div>
                    </div>
                    <div class="pd-hero-stat">
                        <div class="pd-hs-val"><span data-pd-num="${totalWords}">۰</span></div>
                        <div class="pd-hs-label">کل لغات</div>
                        <div class="pd-hs-sub">در دیکشنری</div>
                    </div>
                </div>`;

            // انیمیشن اعداد
            el.querySelectorAll('[data-pd-num]').forEach(node => {
                this._pdAnimateNumber(node, parseInt(node.dataset.pdNum, 10) || 0);
            });
        },

        /* ============================================================
           کارت‌های KPI
           ============================================================ */
        _pdRenderKPIs(d) {
            const el = document.getElementById('pd-kpi-grid');
            if (!el) return;
            // محاسبه روند (مقایسه ۷ روز اخیر با ۷ روز قبل)
            const last7 = d.sparkPractice.slice(-7).reduce((a, b) => a + b, 0);
            const prev7 = d.sparkPractice.slice(-14, -7).reduce((a, b) => a + b, 0);
            const trend = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : (last7 > 0 ? 100 : 0);

            const cards = [
                {
                    accent: PD.violet, icon: 'fa-book', delta: null,
                    label: 'کل لغات',
                    val: d.totalWords, sub: `${this._pdFaNum(d.favorites)} مورد علاقه`,
                    spark: d.sparkWords, sparkColor: PD.violet
                },
                {
                    accent: PD.emerald, icon: 'fa-bullseye',
                    delta: null,
                    label: 'میزان دقت',
                    val: d.accuracy, suffix: '٪', sub: `${this._pdFaNum(d.todayCorrect)} از ${this._pdFaNum(d.todayPractice)} امروز`,
                    spark: d.sparkCorrect, sparkColor: PD.emerald
                },
                {
                    accent: PD.cyan, icon: 'fa-dumbbell',
                    delta: trend === 0 ? { val: 0, dir: 'flat' } : { val: Math.abs(trend), dir: trend >= 0 ? 'up' : 'down' },
                    label: 'تمرین‌ها',
                    val: d.totalPractice, sub: `میانگین ${this._pdFaNum((d.totalPractice / 30).toFixed(1))} در روز`,
                    spark: d.sparkPractice, sparkColor: PD.cyan
                },
                {
                    accent: PD.amber, icon: 'fa-fire',
                    delta: null,
                    label: 'استریک فعلی',
                    val: d.streak.current, sub: `رکورد: ${this._pdFaNum(d.streak.longest)} روز`,
                    spark: d.sparkPractice.map(v => v > 0 ? 1 : 0), sparkColor: PD.amber
                },
                {
                    accent: PD.rose, icon: 'fa-rotate-right',
                    delta: null,
                    label: 'مرور امروز',
                    val: d.reviewToday, sub: 'سیستم تکرار هوشمند',
                    spark: d.sparkPractice, sparkColor: PD.rose
                },
                {
                    accent: '#0ea5e9', icon: 'fa-brain',
                    delta: null,
                    label: 'میانگین SRS',
                    val: parseFloat(d.avgLevel).toFixed(1), sub: `${this._pdFaNum(d.mastered)} تسلط‌یافته`,
                    spark: d.sparkCorrect, sparkColor: '#0ea5e9'
                }
            ];

            el.innerHTML = cards.map((c, i) => {
                const deltaHtml = c.delta ? `<span class="pd-kpi-delta ${c.delta.dir}">
                    <i class="fas fa-arrow-${c.delta.dir === 'up' ? 'up' : c.delta.dir === 'down' ? 'down' : 'right'}"></i>${this._pdFaNum(c.delta.val)}٪</span>` : '';
                const valAttr = c.suffix ? `data-suffix="${c.suffix}"` : '';
                return `<div class="pd-kpi pd-rise pd-rise-${(i % 4) + 1}" style="--pd-accent:${c.accent}">
                    <div class="pd-kpi-head">
                        <div class="pd-kpi-chip"><i class="fas ${c.icon}"></i></div>
                        ${deltaHtml}
                    </div>
                    <div class="pd-kpi-label">${c.label}</div>
                    <div class="pd-kpi-value" ${valAttr}>${this._pdFaNum(c.val)}${c.suffix || ''}</div>
                    <div class="pd-kpi-sub">${c.sub}</div>
                    <div class="pd-kpi-spark">${this._pdSparkline(c.spark, c.sparkColor)}</div>
                </div>`;
            }).join('');

            // انیمیشن مقادیر عددی (فقط اعداد صحیح)
            el.querySelectorAll('.pd-kpi-value').forEach((node, i) => {
                const raw = cards[i].val;
                const num = parseFloat(raw);
                if (!isNaN(num) && Number.isInteger(num)) {
                    this._pdAnimateNumber(node, num);
                } else {
                    node.textContent = raw + (cards[i].suffix || '');
                }
            });
        },

        /* ============================================================
           نمودار فعالیت ۳۰ روزه (Area Chart)
           ============================================================ */
        _pdRenderActivityChart(history) {
            const el = document.getElementById('pd-activity-chart');
            if (!el) return;
            const series = this._pdDailySeries(history, 30);
            const maxVal = Math.max(...series.map(d => d.total), 1);
            const W = 640, H = 240, padL = 34, padR = 12, padT = 12, padB = 26;
            const innerW = W - padL - padR, innerH = H - padT - padB;
            const xStep = innerW / (series.length - 1);
            const y = v => padT + innerH - (v / maxVal) * innerH;
            const x = i => padL + i * xStep;

            const correctPts = series.map((d, i) => [x(i), y(d.correct)]);
            const totalPts   = series.map((d, i) => [x(i), y(d.total)]);

            const lineCorrect = correctPts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
            const lineTotal   = totalPts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
            const areaCorrect = `${lineCorrect} L${x(series.length - 1)},${padT + innerH} L${x(0)},${padT + innerH} Z`;
            const areaWrong   = `${lineTotal} L${x(series.length - 1)},${padT + innerH} L${x(0)},${padT + innerH} Z`;

            // خطوط شبکه
            const gridLines = [0, 0.25, 0.5, 0.75, 1].map(g => {
                const yy = padT + innerH - g * innerH;
                const val = Math.round(g * maxVal);
                return `<line x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}"/>
                        <text class="pd-axis" x="${padL - 6}" y="${yy + 3}" text-anchor="end">${this._pdFaNum(val)}</text>`;
            }).join('');

            // برچسب‌های محور X (هر ۶ روز)
            const xLabels = series.map((d, i) => {
                if (i % 6 !== 0 && i !== series.length - 1) return '';
                const dt = new Date(d.key);
                const lbl = dt.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
                return `<text class="pd-axis" x="${x(i)}" y="${H - 8}" text-anchor="middle">${lbl}</text>`;
            }).join('');

            // نقاط + تولتیپ
            const dots = series.map((d, i) => {
                const dt = new Date(d.key);
                const lbl = dt.toLocaleDateString('fa-IR', { weekday: 'short', month: 'short', day: 'numeric' });
                const title = `${lbl}\nصحیح: ${this._pdFaNum(d.correct)}\nنادرست: ${this._pdFaNum(d.wrong)}\nمجموع: ${this._pdFaNum(d.total)}`;
                return `<g>
                    <rect x="${x(i) - xStep / 2}" y="${padT}" width="${xStep}" height="${innerH}" fill="transparent"/>
                    <circle class="pd-dot" cx="${x(i)}" cy="${y(d.correct)}" r="3" fill="${PD.emerald}" stroke="#fff" stroke-width="1.5">
                        <title>${title}</title>
                    </circle>
                </g>`;
            }).join('');

            el.innerHTML = `<svg viewBox="0 0 ${W} ${H}">
                <defs>
                    <linearGradient id="pd-fill-emerald" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="${PD.emerald}" stop-opacity="0.35"/>
                        <stop offset="100%" stop-color="${PD.emerald}" stop-opacity="0.02"/>
                    </linearGradient>
                    <linearGradient id="pd-fill-rose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="${PD.rose}" stop-opacity="0.18"/>
                        <stop offset="100%" stop-color="${PD.rose}" stop-opacity="0.02"/>
                    </linearGradient>
                </defs>
                <g class="pd-grid">${gridLines}</g>
                <path class="pd-area-wrong" d="${areaWrong}"/>
                <path class="pd-area-correct" d="${areaCorrect}"/>
                <path class="pd-line-wrong" d="${lineTotal}"/>
                <path class="pd-line-correct" d="${lineCorrect}"/>
                ${xLabels}
                ${dots}
            </svg>`;
        },

        /* ============================================================
           دونات توزیع نوع لغات
           ============================================================ */
        _pdRenderTypesDonut(words) {
            const el = document.getElementById('pd-types-donut');
            if (!el) return;
            const counts = {};
            Object.keys(TYPE_META).forEach(k => counts[k] = 0);
            words.forEach(w => { const t = w.type || 'other'; counts[t] = (counts[t] || 0) + 1; });

            const total = Object.values(counts).reduce((a, b) => a + b, 0);
            const size = 170, cx = 85, cy = 85, r = 64, sw = 18;
            const C = 2 * Math.PI * r;

            if (total === 0) {
                el.innerHTML = `<div class="pd-empty"><i class="fas fa-chart-pie"></i><p>هنوز لغتی ثبت نشده</p></div>`;
                return;
            }

            let offset = 0;
            const segs = Object.entries(counts)
                .filter(([k, v]) => v > 0)
                .map(([k, v]) => {
                    const meta = TYPE_META[k] || TYPE_META.other;
                    const frac = v / total;
                    const dash = frac * C;
                    const seg = {
                        key: k, color: meta.color, label: meta.label,
                        count: v, pct: Math.round(frac * 100),
                        dash, gap: C - dash, offset: -offset
                    };
                    offset += dash;
                    return seg;
                });

            const arcs = segs.map(s => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
                stroke="${s.color}" stroke-width="${sw}"
                stroke-dasharray="${s.dash} ${s.gap}"
                stroke-dashoffset="${s.offset}"
                stroke-linecap="butt"/>`).join('');

            const legend = segs.map(s => `
                <div class="pd-donut-row">
                    <span class="pd-dr-dot" style="background:${s.color}"></span>
                    <span class="pd-dr-name">${s.label}</span>
                    <span class="pd-dr-val">${this._pdFaNum(s.count)}</span>
                    <span class="pd-dr-pct">${this._pdFaNum(s.pct)}٪</span>
                </div>`).join('');

            el.innerHTML = `<div class="pd-donut-wrap">
                <div class="pd-donut">
                    <svg viewBox="0 0 ${size} ${size}">${arcs}</svg>
                    <div class="pd-donut-center">
                        <b>${this._pdFaNum(total)}</b>
                        <small>لغت</small>
                    </div>
                </div>
                <div class="pd-donut-legend">${legend}</div>
            </div>`;
        },

        /* ============================================================
           رادار دقت بر اساس نوع لغت
           ============================================================ */
        _pdRenderAccuracyRadar(words, history) {
            const el = document.getElementById('pd-radar');
            if (!el) return;
            const typeByWord = new Map();
            words.forEach(w => typeByWord.set(w.id, w.type || 'other'));

            const types = Object.keys(TYPE_META);
            const stats = {};
            types.forEach(t => stats[t] = { correct: 0, total: 0 });
            history.forEach(h => {
                const t = typeByWord.get(h.wordId) || 'other';
                if (!stats[t]) stats[t] = { correct: 0, total: 0 };
                stats[t].total++;
                if (h.correct) stats[t].correct++;
            });

            const values = types.map(t => stats[t].total > 0 ? (stats[t].correct / stats[t].total) * 100 : 0);
            const size = 280, cx = 140, cy = 140, R = 95;
            const n = types.length;
            const angle = i => (-Math.PI / 2) + (i / n) * 2 * Math.PI;

            const pointAt = (i, radius) => [cx + Math.cos(angle(i)) * radius, cy + Math.sin(angle(i)) * radius];
            // حلقه‌های شبکه
            const rings = [0.25, 0.5, 0.75, 1].map(g => {
                const pts = types.map((_, i) => pointAt(i, R * g).join(',')).join(' ');
                return `<polygon class="pd-r-grid" points="${pts}"/>`;
            }).join('');
            // محورها
            const axes = types.map((_, i) => {
                const [px, py] = pointAt(i, R);
                return `<line class="pd-r-axis" x1="${cx}" y1="${cy}" x2="${px}" y2="${py}"/>`;
            }).join('');
            // شکل داده
            const dataPts = types.map((t, i) => pointAt(i, R * (values[i] / 100)).join(',')).join(' ');
            const dataDots = types.map((t, i) => {
                const [px, py] = pointAt(i, R * (values[i] / 100));
                return `<circle class="pd-r-point" cx="${px}" cy="${py}" r="3.5"/>`;
            }).join('');
            // برچسب‌ها
            const labels = types.map((t, i) => {
                const [lx, ly] = pointAt(i, R + 18);
                const meta = TYPE_META[t];
                const val = stats[t].total > 0 ? Math.round(values[i]) : '–';
                return `<text class="pd-r-label" x="${lx}" y="${ly - 4}" text-anchor="middle">${meta.label}</text>
                        <text class="pd-r-label" x="${lx}" y="${ly + 9}" text-anchor="middle" fill="${meta.color}" style="font-weight:800">${this._pdFaNum(val)}${stats[t].total > 0 ? '٪' : ''}</text>`;
            }).join('');

            el.innerHTML = `<svg viewBox="0 0 ${size} ${size}">
                ${rings}${axes}
                <polygon class="pd-r-shape" points="${dataPts}"/>
                ${dataDots}
                ${labels}
            </svg>`;
        },

        /* ============================================================
           توزیع SRS (نوار انباشته)
           ============================================================ */
        _pdRenderSRSDistribution() {
            const el = document.getElementById('pd-srs-box');
            if (!el) return;
            const counts = [0, 0, 0, 0, 0, 0];
            Object.values(this.srsData || {}).forEach(s => {
                const lv = Math.max(0, Math.min(5, s.level || 0));
                counts[lv]++;
            });
            const totalSRS = counts.reduce((a, b) => a + b, 0);
            const total = Math.max(totalSRS, 1);

            const segs = counts.map((c, lv) => ({
                lv, count: c,
                pct: total > 0 ? (c / total) * 100 : 0,
                color: SRS_COLORS[lv]
            })).filter(s => s.count > 0);

            if (totalSRS === 0) {
                el.innerHTML = `<div class="pd-empty"><i class="fas fa-layer-group"></i><p>هنوز داده SRS ثبت نشده</p></div>`;
                return;
            }

            const stack = segs.map(s => `<div class="pd-srs-seg" style="flex-grow:${s.count};background:${s.color}" title="سطح ${this._pdFaNum(s.lv)}: ${this._pdFaNum(s.count)} لغت">${s.pct >= 8 ? this._pdFaNum(s.count) : ''}</div>`).join('');

            const legend = [0, 1, 2, 3, 4, 5].map(lv => {
                const c = counts[lv];
                return `<div class="pd-srs-leg">
                    <div class="pd-sl-dot" style="background:${SRS_COLORS[lv]}"></div>
                    <b>${this._pdFaNum(c)}</b>
                    <small>سطح ${this._pdFaNum(lv)}</small>
                </div>`;
            }).join('');

            el.innerHTML = `<div class="pd-srs-stack">${stack}</div>
                <div class="pd-srs-legend">${legend}</div>
                <div style="margin-top:12px;font-size:12px;color:var(--pd-muted);text-align:center">
                    <i class="fas fa-info-circle"></i>
                    هرچه سطح بالاتر باشد، تسلط شما بر آن لغت بیشتر است.
                </div>`;
        },

        /* ============================================================
           نقشه حرارتی فعالیت (۲۶ هفته)
           ============================================================ */
        _pdRenderHeatmap(history) {
            const el = document.getElementById('pd-heatmap');
            const monthsEl = document.getElementById('pd-hm-months');
            if (!el) return;
            const dayMap = {};
            history.forEach(h => {
                const k = String(h.date).split('T')[0];
                dayMap[k] = (dayMap[k] || 0) + 1;
            });
            const weeks = 26;
            const today = new Date(); today.setHours(0, 0, 0, 0);
            // شروع از ۲۶ هفته پیش
            const start = new Date(today);
            start.setDate(today.getDate() - (weeks * 7 - 1));

            const cells = [];
            const monthMarkers = [];
            let lastMonth = -1;
            for (let w = 0; w < weeks; w++) {
                for (let d = 0; d < 7; d++) {
                    const cur = new Date(start);
                    cur.setDate(start.getDate() + w * 7 + d);
                    if (cur > today) {
                        cells.push(`<div class="pd-hm-cell" style="visibility:hidden"></div>`);
                        continue;
                    }
                    const key = this._pdDateKey(cur);
                    const cnt = dayMap[key] || 0;
                    let lvl = 0;
                    if (cnt >= 6) lvl = 4;
                    else if (cnt >= 4) lvl = 3;
                    else if (cnt >= 2) lvl = 2;
                    else if (cnt >= 1) lvl = 1;
                    const lbl = cur.toLocaleDateString('fa-IR', { weekday: 'short', month: 'long', day: 'numeric' });
                    cells.push(`<div class="pd-hm-cell ${lvl ? 'l' + lvl : ''}" title="${lbl}: ${this._pdFaNum(cnt)} تمرین"></div>`);
                }
                // نشانگر ماه
                const firstOfWeek = new Date(start);
                firstOfWeek.setDate(start.getDate() + w * 7);
                const m = firstOfWeek.getMonth();
                if (m !== lastMonth) {
                    monthMarkers.push({ idx: w, label: firstOfWeek.toLocaleDateString('fa-IR', { month: 'short' }) });
                    lastMonth = m;
                }
            }
            el.innerHTML = cells.join('');

            // رندر برچسب ماه‌ها
            if (monthsEl) {
                let html = '';
                monthMarkers.forEach((mk, i) => {
                    const next = i < monthMarkers.length - 1 ? monthMarkers[i + 1].idx : weeks;
                    const span = next - mk.idx;
                    html += `<span style="width:${span * 17}px;display:inline-block;text-align:center">${mk.label}</span>`;
                });
                monthsEl.innerHTML = html;
            }
        },

        /* ============================================================
           فعالیت هفتگی (کاملاً جایگزین renderWeeklyProgress)
           ============================================================ */
        renderWeeklyProgress(practiceHistory) {
            const container = document.getElementById('weekly-progress');
            if (!container) return;

            const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

            const today = new Date();
            const jsDay = today.getDay();
            const map = [6, 0, 1, 2, 3, 4, 5];
            const persianTodayIndex = map[jsDay];

            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - persianTodayIndex);
            startOfWeek.setHours(0, 0, 0, 0);

            const weeklyData = [];
            let maxCount = 1;
            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(startOfWeek);
                currentDate.setDate(startOfWeek.getDate() + i);
                const key = this._pdDateKey(currentDate);
                const dayRecs = (practiceHistory || []).filter(r => String(r.date).split('T')[0] === key);
                const correct = dayRecs.filter(r => r.correct).length;
                const wrong = dayRecs.length - correct;
                const isToday = currentDate.toDateString() === today.toDateString();
                weeklyData.push({
                    dayName: weekDays[i],
                    persianDate: currentDate.toLocaleDateString('fa-IR', { month: 'numeric', day: 'numeric' }),
                    total: dayRecs.length, correct, wrong, isToday
                });
                if (dayRecs.length > maxCount) maxCount = dayRecs.length;
            }

            container.innerHTML = weeklyData.map(day => {
                const correctH = maxCount > 0 ? (day.correct / maxCount) * 100 : 0;
                const wrongH = maxCount > 0 ? (day.wrong / maxCount) * 100 : 0;
                return `<div class="pd-wd ${day.isToday ? 'is-today' : ''}">
                    <div class="pd-wd-count">${this._pdFaNum(day.total)}</div>
                    <div class="pd-wd-bars">
                        ${day.total === 0 ? `<div class="pd-wd-empty"></div>` : `
                            ${day.correct > 0 ? `<div class="pd-wd-bar correct" style="height:${correctH}%"></div>` : ''}
                            ${day.wrong > 0 ? `<div class="pd-wd-bar wrong" style="height:${wrongH}%"></div>` : ''}
                        `}
                    </div>
                    <div class="pd-wd-name">${day.dayName}</div>
                    <div class="pd-wd-date">${day.persianDate}</div>
                </div>`;
            }).join('');
        },

        /* ============================================================
           حلقه‌های هدف
           ============================================================ */
        _pdRenderGoals({ todayPractice, weekPractice, mastered }) {
            const el = document.getElementById('pd-goals');
            if (!el) return;
            const DAILY = 20, WEEKLY = 100, MASTER_GOAL = 50;
            const goals = [
                {
                    pct: Math.min(100, (todayPractice / DAILY) * 100),
                    val: todayPractice, target: DAILY,
                    color: PD.emerald,
                    title: 'هدف روزانه',
                    desc: `${this._pdFaNum(DAILY)} تمرین در روز`
                },
                {
                    pct: Math.min(100, (weekPractice / WEEKLY) * 100),
                    val: weekPractice, target: WEEKLY,
                    color: PD.violet,
                    title: 'هدف هفتگی',
                    desc: `${this._pdFaNum(WEEKLY)} تمرین در هفته`
                },
                {
                    pct: Math.min(100, (mastered / MASTER_GOAL) * 100),
                    val: mastered, target: MASTER_GOAL,
                    color: PD.amber,
                    title: 'هدف تسلط',
                    desc: `${this._pdFaNum(MASTER_GOAL)} لغت تسلط‌یافته`
                }
            ];

            el.innerHTML = goals.map(g => {
                const r = 32, C = 2 * Math.PI * r;
                const off = C * (1 - g.pct / 100);
                return `<div class="pd-goal">
                    <div class="pd-goal-ring">
                        <svg viewBox="0 0 78 78">
                            <circle class="pd-gr-bg" cx="39" cy="39" r="${r}"/>
                            <circle class="pd-gr-fg" cx="39" cy="39" r="${r}"
                                stroke="${g.color}" stroke-dasharray="${C}" stroke-dashoffset="${off}"/>
                        </svg>
                        <div class="pd-goal-ring-label">${this._pdFaNum(Math.round(g.pct))}٪</div>
                    </div>
                    <div class="pd-goal-info">
                        <h4>${g.title}</h4>
                        <p>${this._pdFaNum(g.val)} از ${this._pdFaNum(g.target)} — ${g.desc}</p>
                    </div>
                </div>`;
            }).join('');
        },

        /* ============================================================
           دستاوردها (نسخه پیشرفته با تیر و امتیاز)
           ============================================================ */
        renderAchievements(totalWords, totalPractice, accuracy) {
            const container = document.getElementById('achievements-list');
            if (!container) return;
            const mastered = Object.values(this.srsData || {}).filter(s => s.level >= 4).length;
            const streak = this._pdComputeStreak(this._pdLastHistory || []);

            const ACH = [
                { id: 'first_word', tier: 'B', pts: 10, grad: 'linear-gradient(135deg,#94a3b8,#64748b)', glow: 'rgba(148,163,184,.35)', icon: 'fa-seedling',
                  name: 'اولین قدم', desc: 'اولین لغت را اضافه کن',
                  cur: totalWords, tgt: 1 },
                { id: 'ten_words', tier: 'B', pts: 20, grad: 'linear-gradient(135deg,#94a3b8,#64748b)', glow: 'rgba(148,163,184,.35)', icon: 'fa-book',
                  name: 'مجموعه‌ساز', desc: '۱۰ لغت جمع کن',
                  cur: totalWords, tgt: 10 },
                { id: 'fifty_words', tier: 'S', pts: 50, grad: 'linear-gradient(135deg,#06b6d4,#0891b2)', glow: 'rgba(6,182,212,.4)', icon: 'fa-layer-group',
                  name: 'واژه‌پرور', desc: '۵۰ لغت جمع کن',
                  cur: totalWords, tgt: 50 },
                { id: 'hundred_words', tier: 'G', pts: 100, grad: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: 'rgba(245,158,11,.45)', icon: 'fa-crown',
                  name: 'پادشاه واژگان', desc: '۱۰۰ لغت جمع کن',
                  cur: totalWords, tgt: 100 },
                { id: 'first_practice', tier: 'B', pts: 10, grad: 'linear-gradient(135deg,#94a3b8,#64748b)', glow: 'rgba(148,163,184,.35)', icon: 'fa-dumbbell',
                  name: 'اولین تمرین', desc: 'اولین تمرین را انجام بده',
                  cur: totalPractice, tgt: 1 },
                { id: 'fifty_practice', tier: 'S', pts: 40, grad: 'linear-gradient(135deg,#06b6d4,#0891b2)', glow: 'rgba(6,182,212,.4)', icon: 'fa-fire',
                  name: 'پرکار و تلاشگر', desc: '۵۰ تمرین انجام بده',
                  cur: totalPractice, tgt: 50 },
                { id: 'perfect_score', tier: 'G', pts: 60, grad: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: 'rgba(245,158,11,.45)', icon: 'fa-star',
                  name: 'بی‌نقص', desc: 'به ۱۰۰٪ دقت برس',
                  cur: accuracy, tgt: 100 },
                { id: 'streak_3', tier: 'S', pts: 30, grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', glow: 'rgba(139,92,246,.4)', icon: 'fa-bolt',
                  name: 'پیگیر', desc: '۳ روز پیاپی تمرین کن',
                  cur: streak.current, tgt: 3 },
                { id: 'streak_7', tier: 'G', pts: 70, grad: 'linear-gradient(135deg,#f43f5e,#e11d48)', glow: 'rgba(244,63,94,.45)', icon: 'fa-fire-flame-curved',
                  name: 'استوار', desc: '۷ روز پیاپی تمرین کن',
                  cur: streak.current, tgt: 7 },
                { id: 'master_10', tier: 'P', pts: 80, grad: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,.45)', icon: 'fa-graduation-cap',
                  name: 'استاد', desc: '۱۰ لغت را تسلط پیدا کن (SRS≥۴)',
                  cur: mastered, tgt: 10 },
                { id: 'master_50', tier: 'P', pts: 150, grad: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,.5)', icon: 'fa-medal',
                  name: 'استاد بزرگ', desc: '۵۰ لغت را تسلط پیدا کن (SRS≥۴)',
                  cur: mastered, tgt: 50 }
            ];

            const unlocked = ACH.filter(a => a.cur >= a.tgt);
            const totalPts = unlocked.reduce((s, a) => s + a.pts, 0);
            const tierLabel = { B: 'پایه', S: 'نقره', G: 'طلایی', P: 'پلاتین' };

            // خلاصه
            const sumEl = document.getElementById('pd-ach-summary');
            if (sumEl) {
                sumEl.innerHTML = `
                    <div class="pd-as-item"><i class="fas fa-trophy" style="color:${PD.amberD}"></i> ${this._pdFaNum(unlocked.length)}<span>/ ${this._pdFaNum(ACH.length)}</span> کسب‌شده</div>
                    <div class="pd-as-item"><i class="fas fa-bolt" style="color:${PD.violetD}"></i> <b>${this._pdFaNum(totalPts)}</b> امتیاز</div>
                    <div class="pd-as-item"><i class="fas fa-lock" style="color:${PD.slate}"></i> <b>${this._pdFaNum(ACH.length - unlocked.length)}</b> بازمانده</div>
                `;
            }
            const pillEl = document.getElementById('pd-ach-summary-pill');
            if (pillEl) pillEl.textContent = `${this._pdFaNum(unlocked.length)} از ${this._pdFaNum(ACH.length)}`;

            container.innerHTML = ACH.map(a => {
                const done = a.cur >= a.tgt;
                const pct = Math.min(100, Math.round((a.cur / a.tgt) * 100));
                return `<div class="pd-ach ${done ? 'unlocked' : 'locked'}" style="--pd-ach-grad:${a.grad};--pd-ach-glow:${a.glow}">
                    <span class="pd-ach-tier">${tierLabel[a.tier]}</span>
                    <div class="pd-ach-ic"><i class="fas ${a.icon}"></i></div>
                    <div class="pd-ach-name">${a.name}</div>
                    <div class="pd-ach-desc">${a.desc}</div>
                    ${done ? `<div class="pd-ach-done"><i class="fas fa-check-circle"></i> تکمیل شد</div>
                              <div class="pd-ach-pts"><i class="fas fa-bolt"></i> +${this._pdFaNum(a.pts)}</div>`
                          : `<div class="pd-ach-bar"><div class="pd-ach-fill" style="width:${pct}%"></div></div>
                             <div class="pd-ach-foot">${this._pdFaNum(a.cur)} از ${this._pdFaNum(a.tgt)}</div>`}
                </div>`;
            }).join('');
        },

        /* ============================================================
           فعالیت اخیر (تایم‌لاین)
           ============================================================ */
        async renderRecentActivity(practiceHistory) {
            const container = document.getElementById('recent-activity');
            if (!container) return;

            if (!practiceHistory || practiceHistory.length === 0) {
                container.innerHTML = `<div class="pd-empty"><i class="fas fa-history"></i><p>هنوز فعالیتی ثبت نشده</p></div>`;
                return;
            }

            // ۱۵ رکورد آخر، لغات را یکجا لود می‌کنیم
            const recent = practiceHistory.slice(-15).reverse();
            const wordIds = [...new Set(recent.map(r => r.wordId))];
            const wordMap = new Map();
            for (const id of wordIds) {
                try {
                    const w = await this.getWord(id);
                    if (w) wordMap.set(id, w);
                } catch (e) { /* ignore */ }
            }

            let html = '';
            for (const record of recent) {
                const word = wordMap.get(record.wordId);
                const wordText = word ? word.german : 'حذف‌شده';
                const type = word ? (word.type || 'other') : 'other';
                const meta = TYPE_META[type] || TYPE_META.other;
                const color = record.correct ? PD.emerald : PD.rose;
                const date = new Date(record.timestamp || record.date);
                const formatted = date.toLocaleDateString('fa-IR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                html += `<div class="pd-tl-item" style="--pd-tl-color:${color}">
                    <div class="pd-tl-card">
                        <div class="pd-tl-ic"><i class="fas ${record.correct ? 'fa-check' : 'fa-xmark'}"></i></div>
                        <div class="pd-tl-body">
                            <div class="pd-tl-top">
                                <span class="pd-tl-word">${this.escapeHtml(wordText)}</span>
                                <span class="pd-tl-tag" style="background:${meta.color}">${meta.label}</span>
                                <span class="pd-tl-tag" style="background:${color}">${record.correct ? 'صحیح' : 'نادرست'}</span>
                            </div>
                            <div class="pd-tl-time"><i class="far fa-clock"></i> ${formatted}</div>
                        </div>
                    </div>
                </div>`;
            }
            container.innerHTML = html;
        },

        /* ============================================================
           آمار سفارشی — راه‌اندازی (کاملاً جایگزین)
           ============================================================ */
        setupCustomStats() {
            const startInput = document.getElementById('custom-stats-start');
            const endInput = document.getElementById('custom-stats-end');
            const applyBtn = document.getElementById('apply-custom-stats');
            const resetBtn = document.getElementById('reset-custom-stats');

            if (!startInput || !endInput || !applyBtn) {
                setTimeout(() => this.setupCustomStats(), 500);
                return;
            }

            // مقدار پیش‌فرض: ۳۰ روز اخیر
            const today = new Date();
            const ago = new Date(); ago.setDate(today.getDate() - 30);
            startInput.value = this._pdDateKey(ago);
            endInput.value = this._pdDateKey(today);

            applyBtn.onclick = () => {
                if (startInput.value && endInput.value) {
                    this.loadCustomStats(startInput.value, endInput.value);
                } else {
                    this.showToast('لطفاً هر دو تاریخ را انتخاب کنید', 'warning');
                }
            };
            if (resetBtn) {
                resetBtn.onclick = () => {
                    startInput.value = '';
                    endInput.value = '';
                    const r = document.getElementById('custom-stats-results');
                    if (r) r.innerHTML = '';
                    const a = document.getElementById('custom-activity-list');
                    if (a) a.remove();
                    this.showToast('آمار به حالت پیش‌فرض برگشت', 'info');
                };
            }

            // دکمه‌های میانبر بازه
            document.querySelectorAll('[data-pd-range]').forEach(btn => {
                btn.onclick = () => {
                    const days = parseInt(btn.dataset.pdRange, 10);
                    const t = new Date();
                    const g = new Date(); g.setDate(t.getDate() - days);
                    startInput.value = this._pdDateKey(g);
                    endInput.value = this._pdDateKey(t);
                    this.loadCustomStats(startInput.value, endInput.value);
                };
            });

            // بارگذاری اولیه
            this.loadCustomStats(startInput.value, endInput.value);
        },

        /* ============================================================
           محاسبه آمار سفارشی (کاملاً جایگزین)
           ============================================================ */
        async loadCustomStats(startDate, endDate) {
            try {
                const words = await this.getAllWords();
                const practiceHistory = await this.getAllPracticeHistory();
                this._pdLastHistory = practiceHistory;
                this._pdLastWordsCount = words.length;

                const start = new Date(startDate); start.setHours(0, 0, 0, 0);
                const end = new Date(endDate); end.setHours(23, 59, 59, 999);

                const filteredWords = words.filter(w => {
                    const wd = new Date(w.createdAt);
                    return wd >= start && wd <= end;
                });
                const filteredPractice = practiceHistory.filter(r => {
                    const rd = new Date(r.date);
                    return rd >= start && rd <= end;
                });

                const totalDays = Math.max(1, Math.ceil((end - start) / 86400000) + 1);
                const totalNewWords = filteredWords.length;
                const totalPractice = filteredPractice.length;
                const correctPractice = filteredPractice.filter(p => p.correct).length;
                const wrongPractice = totalPractice - correctPractice;
                const accuracy = totalPractice > 0 ? Math.round((correctPractice / totalPractice) * 100) : 0;
                const avgDailyPractice = totalPractice > 0 ? (totalPractice / totalDays).toFixed(1) : '0';
                const avgDailyWords = totalNewWords > 0 ? (totalNewWords / totalDays).toFixed(1) : '0';

                // بهترین روز
                const dailyStats = {};
                filteredPractice.forEach(r => {
                    const day = String(r.date).split('T')[0];
                    if (!dailyStats[day]) dailyStats[day] = { total: 0, correct: 0 };
                    dailyStats[day].total++;
                    if (r.correct) dailyStats[day].correct++;
                });
                let bestDay = { date: '', total: 0, correct: 0 };
                for (const [day, s] of Object.entries(dailyStats)) {
                    if (s.total > bestDay.total) bestDay = { date: day, total: s.total, correct: s.correct };
                }

                // زمان تخمینی یادگیری (هر تمرین ~۳۰ ثانیه)
                const minutes = Math.round(totalPractice * 0.5);

                this.renderCustomStats({
                    startDate, endDate, totalDays, totalNewWords, totalPractice,
                    correctPractice, wrongPractice, accuracy, avgDailyPractice, avgDailyWords,
                    bestDay, minutes
                });
                this.renderCustomActivityList(filteredPractice, filteredWords);
            } catch (err) {
                console.error('خطا در آمار سفارشی:', err);
            }
        },

        /* ============================================================
           رندر آمار سفارشی (کاملاً جایگزین)
           ============================================================ */
        renderCustomStats(stats) {
            const container = document.getElementById('custom-stats-results');
            if (!container) return;

            const fmt = (d) => new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
            const cards = [
                { accent: PD.violet,  ic: 'fa-calendar-days', label: 'بازه زمانی',
                  val: this._pdFaNum(stats.totalDays), sub: `روز • از ${fmt(stats.startDate)} تا ${fmt(stats.endDate)}` },
                { accent: PD.emerald, ic: 'fa-book',          label: 'لغات جدید',
                  val: this._pdFaNum(stats.totalNewWords), sub: `میانگین روزانه: ${this._pdFaNum(stats.avgDailyWords)}` },
                { accent: PD.cyan,    ic: 'fa-dumbbell',      label: 'تمرین‌ها',
                  val: this._pdFaNum(stats.totalPractice), sub: `میانگین روزانه: ${this._pdFaNum(stats.avgDailyPractice)}` },
                { accent: PD.amber,   ic: 'fa-bullseye',      label: 'میزان دقت',
                  val: this._pdFaNum(stats.accuracy) + '٪', sub: `${this._pdFaNum(stats.correctPractice)} از ${this._pdFaNum(stats.totalPractice)}` },
                { accent: '#0ea5e9',  ic: 'fa-check',         label: 'پاسخ صحیح',
                  val: this._pdFaNum(stats.correctPractice), sub: `نادرست: ${this._pdFaNum(stats.wrongPractice)}` },
                { accent: PD.rose,    ic: 'fa-trophy',        label: 'بهترین روز',
                  val: stats.bestDay.date ? new Date(stats.bestDay.date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }) : '–',
                  sub: stats.bestDay.date ? `${this._pdFaNum(stats.bestDay.total)} تمرین (${this._pdFaNum(stats.bestDay.correct)} صحیح)` : '—' },
                { accent: PD.violetD, ic: 'fa-clock',         label: 'زمان یادگیری',
                  val: this._pdFaNum(stats.minutes) + ' دقیقه', sub: 'تخمینی' }
            ];

            container.innerHTML = cards.map(c => `
                <div class="pd-cs" style="--pd-cs-accent:${c.accent}">
                    <div class="pd-cs-ic" style="color:${c.accent}"><i class="fas ${c.ic}"></i></div>
                    <div class="pd-cs-label">${c.label}</div>
                    <div class="pd-cs-val">${c.val}</div>
                    <div class="pd-cs-sub">${c.sub}</div>
                </div>`).join('');
        },

        /* ============================================================
           لیست فعالیت روزانه بازه سفارشی (کاملاً جایگزین)
           ============================================================ */
        async renderCustomActivityList(practiceHistory, newWords) {
            let activityContainer = document.getElementById('custom-activity-list');
            if (!activityContainer) {
                const statsContainer = document.getElementById('custom-stats-results');
                if (statsContainer && statsContainer.parentNode) {
                    const ns = document.createElement('div');
                    ns.id = 'custom-activity-list';
                    ns.className = 'pd-custom-activity';
                    statsContainer.parentNode.insertBefore(ns, statsContainer.nextSibling);
                    activityContainer = ns;
                }
            }
            if (!activityContainer) return;

            if (practiceHistory.length === 0 && newWords.length === 0) {
                activityContainer.innerHTML = `<div class="pd-empty"><i class="fas fa-info-circle"></i><p>فعالیتی در این بازه یافت نشد</p></div>`;
                return;
            }

            const byDay = {};
            practiceHistory.forEach(r => {
                const day = String(r.date).split('T')[0];
                if (!byDay[day]) byDay[day] = { practices: [], newWords: [] };
                byDay[day].practices.push(r);
            });
            newWords.forEach(w => {
                const day = String(w.createdAt).split('T')[0];
                if (!byDay[day]) byDay[day] = { practices: [], newWords: [] };
                byDay[day].newWords.push(w);
            });

            const sortedDays = Object.keys(byDay).sort().reverse();
            let html = `<h4 style="margin:0 0 12px;font-size:14px;color:var(--pd-ink);display:flex;align-items:center;gap:8px;">
                <i class="fas fa-list-ul" style="color:${PD.violetD}"></i> فعالیت‌های روزانه
            </h4>`;

            for (const day of sortedDays.slice(0, 21)) {
                const a = byDay[day];
                const pdate = new Date(day).toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const pc = a.practices.length;
                const cc = a.practices.filter(p => p.correct).length;
                const wc = pc - cc;
                const nw = a.newWords.length;
                html += `<div class="pd-ca-day">
                    <div class="pd-ca-day-head">
                        <div class="pd-ca-day-date"><i class="fas fa-calendar-day" style="color:${PD.violetD}"></i> ${pdate}</div>
                        <div class="pd-ca-stats">
                            ${pc > 0 ? `<span style="color:${PD.cyanD}"><i class="fas fa-dumbbell"></i> ${this._pdFaNum(pc)}</span>` : ''}
                            ${cc > 0 ? `<span style="color:${PD.emeraldD}"><i class="fas fa-check"></i> ${this._pdFaNum(cc)}</span>` : ''}
                            ${wc > 0 ? `<span style="color:${PD.roseD}"><i class="fas fa-xmark"></i> ${this._pdFaNum(wc)}</span>` : ''}
                            ${nw > 0 ? `<span style="color:${PD.amberD}"><i class="fas fa-plus"></i> ${this._pdFaNum(nw)}</span>` : ''}
                        </div>
                    </div>
                    ${a.newWords.length > 0 ? `<div class="pd-ca-words"><i class="fas fa-book"></i> ${a.newWords.map(w => this.escapeHtml(w.german)).join('، ')}</div>` : ''}
                </div>`;
            }
            activityContainer.innerHTML = html;
        },

        /* ============================================================
           showSection — فقط برای رفرش هنگام ورود به تب پیشرفت
           (سایر رفتارها دست‌نخورده)
           ============================================================ */
        showSection(sectionId) {
            const targetSection = document.getElementById(sectionId);
            if (!targetSection) {
                console.error(`❌ بخش ${sectionId} پیدا نشد`);
                return;
            }
            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
            targetSection.classList.add('active');
            localStorage.setItem('lastActiveSection', sectionId.replace('-section', ''));
            // ✨ رفرش داشبورد پیشرفت هنگام ورود
            if (sectionId === 'progress-section' && typeof this.updateStats === 'function') {
                this.updateStats();
            }
            console.log(`📱 رفتن به بخش: ${sectionId}`);
        }
    });

    // ذخیره مرجع رنگ‌ها برای استفاده در متدها (در صورت نیاز)
    GermanDictionary.prototype._pdColors = PD;
    GermanDictionary.prototype._pdTypeMeta = TYPE_META;
    GermanDictionary.prototype._pdSrsColors = SRS_COLORS;

    console.log('✅ داشبورد پیشرفت فعال شد — فونت وزیر و تمام متون فارسی.');
})();
