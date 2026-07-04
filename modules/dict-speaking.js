/* dict-speaking.js — Speaking Practice (lines 9259-10852) */

GermanDictionary.prototype.showWritingResults = function() {
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
};

GermanDictionary.prototype._levenshtein = function(a, b) {
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
};

GermanDictionary.prototype._similarityScore = function(user, correct) {
    const u = user.toLowerCase().trim();
    const c = correct.toLowerCase().trim();
    if (u === c) return 100;
    const dist = this._levenshtein(u, c);
    const maxLen = Math.max(u.length, c.length);
    return Math.max(0, Math.round((1 - dist / maxLen) * 100));
};

GermanDictionary.prototype._srsNextReview = function(word, score) {
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
};

GermanDictionary.prototype._getXPData = function() {
    return JSON.parse(localStorage.getItem('xpData') || JSON.stringify({
        xp: 0, level: 1, streak: 0, coins: 0,
        lastPracticeDate: null, totalCorrect: 0, totalAnswered: 0
    }));
};

GermanDictionary.prototype._saveXPData = function(data) {
    localStorage.setItem('xpData', JSON.stringify(data));
};

GermanDictionary.prototype._addXP = function(score, isCorrect) {
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
};

GermanDictionary.prototype._getAchievements = function() {
    return JSON.parse(localStorage.getItem('achievements') || '[]');
};

GermanDictionary.prototype._checkAchievements = function(xpData) {
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
};

GermanDictionary.prototype._showAchievementToast = function(label) {
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
};

GermanDictionary.prototype._adaptiveDifficulty = function() {
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
};

GermanDictionary.prototype._recordStats = function(wordId, score, isCorrect) {
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
};

GermanDictionary.prototype._getWeakAndStrongWords = function(allWords) {
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
};

GermanDictionary.prototype._showStatsModal = async function() {
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
};

GermanDictionary.prototype.generateAIQuestion = async function(word) {
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
};

GermanDictionary.prototype._fallbackQuestion = function(mode, wordText, wordMeaning) {
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
};

GermanDictionary.prototype._renderQuestion = function(parsed, mode, wordText) {
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
};

GermanDictionary.prototype.checkSpeakingAnswer = async function() {
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
};

GermanDictionary.prototype._handleSpeakingResult = async function(parsed, correctAnswer, currentWord, score, xpResult) {
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
};

GermanDictionary.prototype.showSpeakingHint = function() {
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
};

GermanDictionary.prototype.showSpeakingResults = function() {
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
};

GermanDictionary.prototype.startSpeakingPractice = async function() {
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
};

GermanDictionary.prototype.showSpeakingSettingsModal = function() {
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
};

GermanDictionary.prototype.updateSpeakingModalStyle = function() {
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
};

GermanDictionary.prototype.showSpeakingQuestion = function() {
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
};

