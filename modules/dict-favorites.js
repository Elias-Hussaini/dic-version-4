/* ================================================================
   dict-favorites.js — بخش علاقه‌مندی‌ها (نسخه مدرن ۲۰۲۵)
   ----------------------------------------------------------------
   • تمام استایل‌ها inline (CSS-in-JS)
   • طراحی مدرن با کارت‌های زیبا
   • کاملاً ریسپانسیو
   • حفظ تمام IDها و API قدیمی
   ============================================================ */

(function() {
    'use strict';

    if (typeof GermanDictionary === 'undefined') {
        var waitInterval = setInterval(function() {
            if (typeof GermanDictionary !== 'undefined') {
                clearInterval(waitInterval);
                initFavModule();
            }
        }, 100);
    } else {
        initFavModule();
    }

    function initFavModule() {

    function _fvInjectStyles() {
        if (document.getElementById('fv-pro-styles')) return;
        var style = document.createElement('style');
        style.id = 'fv-pro-styles';
        style.textContent = `
            .fv-wrap {
                --fv-amber:#f59e0b; --fv-amber-d:#d97706; --fv-amber-l:#fef3c7;
                --fv-violet:#8b5cf6; --fv-emerald:#10b981; --fv-cyan:#06b6d4;
                --fv-rose:#f43f5e;
                --fv-ink:#0f172a; --fv-muted:#64748b; --fv-line:#e2e8f0;
                --fv-line-2:#f1f5f9; --fv-card:#ffffff; --fv-card-2:#f8fafc;
                --fv-shadow:0 4px 20px rgba(15,23,42,.06);
                --fv-shadow-lg:0 12px 40px rgba(15,23,42,.12);
                --fv-radius:20px; --fv-radius-s:14px;
                font-family:'Vazirmatn',Tahoma,sans-serif;color:var(--fv-ink);line-height:1.6;
            }
            body.dark-mode .fv-wrap {
                --fv-ink:#f1f5f9;--fv-muted:#94a3b8;--fv-line:#1e293b;
                --fv-line-2:#1e293b;--fv-card:#1e293b;--fv-card-2:#0f172a;
            }
            .fv-wrap i,.fv-wrap i::before{font-family:"Font Awesome 6 Free","Font Awesome 5 Free","FontAwesome"!important;}
            .fv-wrap i.fas,.fv-wrap i.fa-solid{font-weight:900!important;}

            /* هدر گرادیانی */
            .fv-header{background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#78350f 100%);color:#f8fafc;border-radius:var(--fv-radius);padding:24px 26px;margin-bottom:18px;position:relative;overflow:hidden;box-shadow:var(--fv-shadow-lg);}
            .fv-header::before,.fv-header::after{content:"";position:absolute;border-radius:50%;filter:blur(50px);pointer-events:none;animation:fv-float 10s ease-in-out infinite;}
            .fv-header::before{width:240px;height:240px;background:radial-gradient(circle,rgba(245,158,11,.4),transparent 70%);top:-100px;right:-60px;}
            .fv-header::after{width:200px;height:200px;background:radial-gradient(circle,rgba(139,92,246,.3),transparent 70%);bottom:-80px;left:-40px;animation-delay:-5s;}
            @keyframes fv-float{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(15px,-15px) scale(1.1);}}
            .fv-header h2{margin:0;font-size:20px;font-weight:800;display:flex;align-items:center;gap:12px;position:relative;z-index:1;}
            .fv-header h2 .fv-h-ic{width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:rgba(255,255,255,.15);backdrop-filter:blur(10px);font-size:17px;color:#fbbf24;}
            .fv-header .fv-sub{margin:6px 0 0;font-size:12px;opacity:.8;font-weight:500;position:relative;z-index:1;}
            .fv-header .fv-count-badge{position:absolute;top:20px;left:20px;z-index:1;padding:6px 16px;border-radius:999px;background:rgba(251,191,36,.2);border:1px solid rgba(251,191,36,.3);color:#fbbf24;font-size:13px;font-weight:800;backdrop-filter:blur(8px);}

            /* آمار سریع */
            .fv-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px;}
            .fv-stat{padding:14px 16px;background:var(--fv-card);border:1px solid var(--fv-line);border-radius:var(--fv-radius-s);box-shadow:var(--fv-shadow);display:flex;align-items:center;gap:12px;}
            .fv-stat-ic{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:10px;font-size:16px;color:#fff;flex-shrink:0;}
            .fv-stat-ic.s1{background:linear-gradient(135deg,#f59e0b,#d97706);}
            .fv-stat-ic.s2{background:linear-gradient(135deg,#8b5cf6,#6d28d9);}
            .fv-stat-ic.s3{background:linear-gradient(135deg,#10b981,#059669);}
            .fv-stat-val{font-size:20px;font-weight:800;color:var(--fv-ink);}
            .fv-stat-label{font-size:11px;color:var(--fv-muted);}

            /* کارت‌های لغت */
            .fv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;}
            .fv-card{background:var(--fv-card);border:1px solid var(--fv-line);border-radius:var(--fv-radius-s);padding:16px;box-shadow:var(--fv-shadow);transition:all .25s ease;position:relative;overflow:hidden;}
            .fv-card::before{content:"";position:absolute;top:0;right:0;width:4px;height:100%;background:linear-gradient(180deg,#f59e0b,#fbbf24);opacity:0;transition:opacity .25s ease;}
            .fv-card:hover{transform:translateY(-3px);box-shadow:var(--fv-shadow-lg);}
            .fv-card:hover::before{opacity:1;}
            .fv-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;}
            .fv-card-left{display:flex;align-items:center;gap:10px;flex:1;min-width:0;}
            .fv-star{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(245,158,11,.12);color:#f59e0b;font-size:14px;cursor:pointer;flex-shrink:0;transition:all .2s ease;}
            .fv-star:hover{background:rgba(245,158,11,.2);transform:scale(1.1);}
            .fv-word{font-size:17px;font-weight:800;color:var(--fv-ink);direction:ltr;font-family:'Segoe UI',system-ui,sans-serif;}
            .fv-badges{display:flex;gap:5px;flex-shrink:0;}
            .fv-badge{padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;color:#fff;}
            .fv-badge.masc{background:#3b82f6;}.fv-badge.fem{background:#ec4899;}.fv-badge.neut{background:#10b981;}
            .fv-badge.noun{background:#8b5cf6;}.fv-badge.verb{background:#f59e0b;}.fv-badge.adjective{background:#06b6d4;}.fv-badge.adverb{background:#84cc16;}.fv-badge.preposition{background:#f97316;}
            .fv-meaning{font-size:14px;color:var(--fv-slate,#475569);font-weight:600;margin-bottom:10px;}
            .fv-actions{display:flex;gap:6px;}
            .fv-act{padding:7px 12px;border:1px solid var(--fv-line);border-radius:8px;background:var(--fv-card);color:var(--fv-muted);font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;transition:all .18s ease;display:inline-flex;align-items:center;gap:5px;}
            .fv-act:hover{transform:translateY(-1px);}
            .fv-act.view:hover{border-color:#6C5CE7;color:#6C5CE7;background:rgba(108,92,231,.06);}
            .fv-act.speak:hover{border-color:#06b6d4;color:#06b6d4;background:rgba(6,182,212,.06);}
            .fv-act.prac:hover{border-color:#10b981;color:#10b981;background:rgba(16,185,129,.06);}

            /* حالت خالی */
            .fv-empty{text-align:center;padding:50px 24px;background:var(--fv-card);border:2px dashed var(--fv-line);border-radius:var(--fv-radius);}
            .fv-empty-ic{width:72px;height:72px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:linear-gradient(135deg,var(--fv-card-2),var(--fv-line-2));color:#f59e0b;font-size:28px;}
            .fv-empty h3{margin:0 0 8px;font-size:17px;font-weight:800;color:var(--fv-ink);}
            .fv-empty p{margin:0;font-size:13px;color:var(--fv-muted);}
            .fv-empty-hint{margin-top:14px;padding:10px 16px;background:var(--fv-card-2);border-radius:999px;font-size:12px;color:var(--fv-muted);display:inline-flex;align-items:center;gap:6px;}
            .fv-empty-hint i{color:#f59e0b;}

            @media(max-width:640px){
                .fv-grid{grid-template-columns:1fr;}
                .fv-stats{grid-template-columns:1fr 1fr;}
                .fv-header{padding:20px 18px;}
                .fv-header h2{font-size:18px;}
            }
        `;
        document.head.appendChild(style);
    }

    /* ============================================================
       رندر بخش علاقه‌مندی‌ها
       ============================================================ */
    GermanDictionary.prototype.renderFavorites = async function() {
        _fvInjectStyles();

        var section = document.getElementById('favorites-section');
        if (!section) return;

        var words = await this.getAllWords();
        var favWords = words.filter(function(w) { return this.favorites.has(w.id); }.bind(this));

        // محاسبه آمار
        var nouns = favWords.filter(function(w){return w.type==='noun';}).length;
        var verbs = favWords.filter(function(w){return w.type==='verb';}).length;
        var mastered = favWords.filter(function(w){return (this.srsData[w.id]?.level||0)>=3;}.bind(this)).length;

        var countBadge = document.getElementById('favorites-count');
        if (countBadge) countBadge.textContent = favWords.length.toLocaleString('fa-IR');

        section.innerHTML = '<div class="fv-wrap">' +
            '<div class="fv-header">' +
                '<div class="fv-count-badge">' + favWords.length.toLocaleString('fa-IR') + ' لغت</div>' +
                '<h2><span class="fv-h-ic"><i class="fas fa-star"></i></span> لغات مورد علاقه</h2>' +
                '<p class="fv-sub">لغاتی که با ستاره طلایی مشخص کرده‌اید</p>' +
            '</div>' +
            '<div class="fv-stats">' +
                '<div class="fv-stat"><div class="fv-stat-ic s1"><i class="fas fa-star"></i></div><div><div class="fv-stat-val">' + favWords.length.toLocaleString('fa-IR') + '</div><div class="fv-stat-label">کل علاقه‌مندی</div></div></div>' +
                '<div class="fv-stat"><div class="fv-stat-ic s2"><i class="fas fa-book"></i></div><div><div class="fv-stat-val">' + (nouns + verbs).toLocaleString('fa-IR') + '</div><div class="fv-stat-label">اسم + فعل</div></div></div>' +
                '<div class="fv-stat"><div class="fv-stat-ic s3"><i class="fas fa-graduation-cap"></i></div><div><div class="fv-stat-val">' + mastered.toLocaleString('fa-IR') + '</div><div class="fv-stat-label">تسلط‌یافته</div></div></div>' +
            '</div>' +
            (favWords.length === 0 ?
                '<div class="fv-empty"><div class="fv-empty-ic"><i class="fas fa-star"></i></div><h3>لیست علاقه‌مندی‌ها خالی است</h3><p>با کلیک روی ستاره کنار هر لغت، به این لیست اضافه کنید</p><div class="fv-empty-hint"><i class="fas fa-lightbulb"></i> ستاره طلایی کنار هر لغت را فعال کنید</div></div>'
            :
                '<div class="fv-grid" id="favorites-container">' + favWords.map(function(word) {
                    var genderText = word.gender === 'masculine' ? 'der' : word.gender === 'feminine' ? 'die' : word.gender === 'neuter' ? 'das' : '';
                    var typeLabel = {noun:'اسم',verb:'فعل',adjective:'صفت',adverb:'قید',preposition:'حرف اضافه',other:'سایر'}[word.type] || '';
                    var srsLevel = (this.srsData[word.id]?.level || 0);

                    return '<div class="fv-card" data-id="' + word.id + '">' +
                        '<div class="fv-card-head">' +
                            '<div class="fv-card-left">' +
                                '<div class="fv-star" data-id="' + word.id + '" title="حذف از علاقه‌مندی"><i class="fas fa-star"></i></div>' +
                                '<span class="fv-word">' + this.escapeHtml(word.german) + '</span>' +
                            '</div>' +
                            '<div class="fv-badges">' +
                                (genderText ? '<span class="fv-badge ' + word.gender + '">' + genderText + '</span>' : '') +
                                (typeLabel ? '<span class="fv-badge ' + (word.type||'other') + '">' + typeLabel + '</span>' : '') +
                                (srsLevel > 0 ? '<span class="fv-badge" style="background:#64748b;">SRS ' + srsLevel + '</span>' : '') +
                            '</div>' +
                        '</div>' +
                        '<div class="fv-meaning">' + this.escapeHtml(word.persian) + '</div>' +
                        '<div class="fv-actions">' +
                            '<button class="fv-act view" data-id="' + word.id + '"><i class="fas fa-eye"></i> مشاهده</button>' +
                            '<button class="fv-act speak" data-word="' + this.escapeHtml(word.german) + '"><i class="fas fa-volume-up"></i> تلفظ</button>' +
                            '<button class="fv-act prac" data-id="' + word.id + '"><i class="fas fa-brain"></i> تمرین</button>' +
                        '</div>' +
                    '</div>';
                }.bind(this)).join('') + '</div>'
            ) +
        '</div>';

        // راه‌اندازی رویدادها
        this._fvSetupEvents();
    };

    /* ============================================================
       رویدادها
       ============================================================ */
    GermanDictionary.prototype._fvSetupEvents = function() {
        var self = this;
        var section = document.getElementById('favorites-section');
        if (!section) return;

        // مشاهده
        section.querySelectorAll('.fv-act.view').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var wordId = parseInt(btn.dataset.id);
                if (typeof self._spViewWord === 'function') {
                    self._spViewWord(wordId);
                } else {
                    self.getWord(wordId).then(function(word) {
                        if (word) self.renderWordDetails(word);
                    });
                }
            });
        });

        // تلفظ
        section.querySelectorAll('.fv-act.speak').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var w = btn.dataset.word;
                if (w) self.speakText(w, 'de-DE');
            });
        });

        // تمرین
        section.querySelectorAll('.fv-act.prac').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var wordId = parseInt(btn.dataset.id);
                self.startPracticeSession([wordId]);
            });
        });

        // ستاره (حذف از علاقه‌مندی)
        section.querySelectorAll('.fv-star').forEach(function(star) {
            star.addEventListener('click', async function(e) {
                e.stopPropagation();
                var wordId = parseInt(star.dataset.id);
                await self.toggleFavorite(wordId);
                self.renderFavorites();
                self.updateFavoritesCount();
                self.showToast('از علاقه‌مندی حذف شد', 'info');
            });
        });

        // کلیک روی کارت
        section.querySelectorAll('.fv-card').forEach(function(card) {
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.fv-act') && !e.target.closest('.fv-star')) {
                    var wordId = parseInt(card.dataset.id);
                    if (typeof self._spViewWord === 'function') {
                        self._spViewWord(wordId);
                    } else {
                        self.getWord(wordId).then(function(word) {
                            if (word) self.renderWordDetails(word);
                        });
                    }
                }
            });
        });
    };

    /* ============================================================
       به‌روزرسانی شمارش
       ============================================================ */
    GermanDictionary.prototype.updateFavoritesCount = function() {
        var el = document.getElementById('favorites-count');
        if (el) el.textContent = (this.favorites ? this.favorites.size : 0).toLocaleString('fa-IR');
    };

    console.log('✅ بخش علاقه‌مندی‌ها مدرن فعال شد.');

    // auto-setup
    function tryAutoSetup() {
        if (typeof dictionaryApp !== 'undefined' && dictionaryApp) {
            try { dictionaryApp.renderFavorites(); } catch(e) { console.error('Favorites auto-setup error:', e); }
        } else { setTimeout(tryAutoSetup, 100); }
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function() { setTimeout(tryAutoSetup, 500); }); }
    else { setTimeout(tryAutoSetup, 500); }

    } // end initFavModule
})();
