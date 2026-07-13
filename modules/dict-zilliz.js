/* ================================================================
   dict-zilliz.js — یکپارچه‌سازی Zilliz Cloud برای جستجوی معنایی لغات
   ----------------------------------------------------------------
   این ماژول یک فایل جاوااسکریپت ساده (نه ES Module) است که از طریق
   تگ <script src="modules/dict-zilliz.js"> لود می‌شود و کلاس
   GermanDictionary را با قابلیت‌های بردار/معنایی گسترش می‌دهد.

   معماری و امکانات:
     ۱) سیستم Failover — آرایه‌ای از کلاسترهای Zilliz؛ در صورت خطا
        خودکار به کلاستر بعدی سوییچ می‌کند (مانند ورکرهای تصویر).
     ۲) ایزوله‌سازی کاربر — هر نصب APP یک UUID یکتا در localStorage
        می‌گیرد تا داده‌ها بین کاربران جدا بمانند.
     ۳) تولید Embedding — از Cloudflare Workers AI (مدل bge-base-en-v1.5
        با ۷۶۸ بُعد) استفاده می‌کند. در صورت وجود AI_WORKERS سراسری
        (از ماژول dict-ai-api.js) از همان‌ها استفاده می‌کند.
     ۴) عملیات CRUD — درج، حذف، جستجوی معنایی، واکشی کلمات مرتبط.
     ۵) تشخیص تکراری — اگر کلمه‌ای با شباهت >۸۵٪ وجود داشت، تکراری
        تلقی می‌شود.
     ۶) خوشه‌بندی (Clustering) — گروه‌بندی همه‌ی لغات بر اساس شباهت
        معنایی به‌صورت سمت‌کلاینت (greedy + centroid averaging).
     ۷) آمار — بازگشت تعداد بردارها و توزیع بر اساس نوع لغت.

   کالکشن Zilliz:
     dictionary_words
     فیلدها: id(Int64 auto), user_id(VarChar), word_id(Int64),
              german(VarChar), persian(VarChar), type(VarChar),
              embedding(FloatVector 768-dim, COSINE)

   روش‌های prototype پیاده‌سازی‌شده:
     • _zillizInit()              — راه‌اندازی و بررسی اتصال
     • _zillizGetEmbedding(text)  — تولید بردار ۷۶۸‌بُعدی
     • _zillizInsertWord(data)    — درج لغت با embedding
     • _zillizDeleteWord(wordId)  — حذف لغت
     • _zillizSearch(query, lim)  — جستجوی معنایی
     • _zillizGetRelated(wid, lim)— لغات مرتبط
     • _zillizCheckDuplicate(de,fa) — تشخیص تکراری معنایی
     • _zillizCluster()           — خوشه‌بندی معنایی
     • _zillizGetStats()          — آمار بردارها
   ================================================================ */

(function () {
    'use strict';

    /* ============================================================
       ۱) Boot — صبر می‌کنیم تا GermanDictionary تعریف شود
       (ترتیب لود اسکریپت‌ها ممکن است متفاوت باشد)
       ============================================================ */
    function boot() {
        if (typeof GermanDictionary === 'undefined') {
            // هنوز کلاس اصلی لود نشده — دوباره تلاش کن
            return setTimeout(boot, 100);
        }
        try {
            installZillizModule();
            console.log('✅ ماژول Zilliz فعال شد');
        } catch (err) {
            console.error('❌ خطا در فعال‌سازی ماژول Zilliz:', err);
        }
    }

    /* ============================================================
       ۲) پیکربندی ماژول (Configuration)
       ============================================================ */

    /* لیست کلاسترهای Zilliz — برای Failover استفاده می‌شود.
       در صورت خطا/غیرقابل‌دسترس بودن کلاستر اول، کلاستر بعدی امتحان می‌شود. */
    const ZILLIZ_CLUSTERS = [
        {
            endpoint: 'https://in03-169eed95dd9f1da.serverless.aws-eu-central-1.cloud.zilliz.com',
            apiKey:   'da92449a79f9c5d7ba5640d59c2099326f730ccb832f31e54d7eca43f72ae402edb65ddd7e96fa5e67a0835d9276bf53fc5e2e86',
            collection: 'dictionary_words'
        }
        /* کلاسترهای بیشتر را برای Failover به این آرایه اضافه کنید:
        ,
        { endpoint: 'https://in03-xxx.serverless.aws-...', apiKey: '...', collection: 'dictionary_words' }
        */
    ];

    /* ورکر Cloudflare برای تولید Embedding — به‌عنوان fallback.
       توجه: اگر AI_WORKERS سراسری (از dict-ai-api.js) موجود باشد،
       از همان‌ها استفاده می‌شود. این مقدار فقط زمانی به‌کار می‌آید
       که AI_WORKERS تعریف نشده باشد یا خالی باشد. */
    const CF_WORKER_FALLBACK = {
        url: 'https://ai-multi-mod213.ai-multi-model-4zgxvo.workers.dev',
        key: 'sk-12THlVaO2GNOQapSTg7GWGdDDgvao8JZ'
    };

    /* مدل Embedding (۷۶۸ بُعد) و اندازه‌ی بردار */
    const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
    const EMBEDDING_DIM   = 768;

    /* تایم‌اوت هر درخواست (میلی‌ثانیه) — ۳۰ ثانیه */
    const REQUEST_TIMEOUT_MS = 30000;

    /* آستانه‌ی شباهت برای تشخیص تکراری (۸۵٪) */
    const DUPLICATE_THRESHOLD = 0.85;

    /* آستانه‌ی شباهت برای گروه‌بندی در خوشه‌بندی (۸۰٪) */
    const CLUSTER_SIM_THRESHOLD = 0.80;

    /* تعداد نتایج پیش‌فرض در جستجوی معنایی */
    const DEFAULT_SEARCH_LIMIT = 5;

    /* حداکثر تعداد رکوردهای واکشی‌شده در query (Cluster/Stats) */
    const MAX_QUERY_LIMIT = 5000;

    /* کلید localStorage برای ذخیره‌ی UUID کاربر */
    const USER_ID_KEY = 'dict_user_id';

    /* حداکثر اندازه‌ی کش embedding (تعداد مدخل) */
    const EMBEDDING_CACHE_MAX = 200;

    /* ============================================================
       ۳) نصب ماژول — تعریف متدها روی prototype
       ============================================================ */
    function installZillizModule() {

        /* وضعیت داخلی ماژول (اشتراکی بین همه‌ی instance ها —
           چون user_id باید per-installation باشد نه per-instance) */
        const state = {
            userId: null,           // UUID کاربر
            activeClusterIdx: 0,    // اندیس کلاستر فعال فعلی
            ready: false,           // آیا اتصال برقرار است؟
            lastError: null,        // آخرین خطای رخ‌داده
            initAt: 0               // زمان آخرین init موفق
        };

        /* کش ساده‌ی embedding برای جلوگیری از محاسبه‌ی تکراری
           کلید: متن، مقدار: بردار. با حداکثر EMBEDDING_CACHE_MAX مدخل. */
        const embCache = new Map();

        /* ========================================================
           Helper: به‌دست‌آوردن لیست ورکرهای CF برای embedding
           اگر AI_WORKERS سراسری موجود بود از آن استفاده می‌کنیم،
           در غیر این صورت از CF_WORKER_FALLBACK استفاده می‌کنیم.
           (typeof برای جلوگیری از ReferenceError در صورت نبود متغیر)
           ======================================================== */
        function getCfWorkers() {
            try {
                if (typeof AI_WORKERS !== 'undefined' && Array.isArray(AI_WORKERS) && AI_WORKERS.length > 0) {
                    return AI_WORKERS.map(function (w) {
                        return { url: w.url, key: w.key };
                    });
                }
            } catch (e) {
                /* TDZ یا تعریف‌نشده — به fallback می‌رویم */
            }
            return [CF_WORKER_FALLBACK];
        }

        /* ========================================================
           Helper: به‌دست‌آوردن/ساخت UUID کاربر
           هر نصب APP یک UUID یکتا دارد که در localStorage ذخیره می‌شود.
           ======================================================== */
        function getUserId() {
            if (state.userId) return state.userId;
            try {
                let id = localStorage.getItem(USER_ID_KEY);
                if (!id) {
                    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                        id = crypto.randomUUID();
                    } else {
                        // Fallback برای مرورگرهای قدیمی
                        id = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
                    }
                    localStorage.setItem(USER_ID_KEY, id);
                }
                state.userId = id;
                return id;
            } catch (e) {
                /* localStorage در دسترس نیست (مثلاً حالت private) —
                   یک ID موقت برمی‌گردانیم (در طول session ثابت می‌ماند) */
                if (!state.userId) {
                    state.userId = 'anon_' + Date.now().toString(36);
                }
                return state.userId;
            }
        }

        /* ========================================================
           Helper: کلاستر فعال فعلی
           ======================================================== */
        function activeCluster() {
            return ZILLIZ_CLUSTERS[state.activeClusterIdx] || ZILLIZ_CLUSTERS[0];
        }

        /* ========================================================
           Helper: درج collectionName در بدنه‌ی درخواست
           ======================================================== */
        function withCollection(body) {
            const out = Object.assign({}, body || {});
            if (!out.collectionName) {
                out.collectionName = activeCluster().collection;
            }
            return out;
        }

        /* ========================================================
           Helper: فراخوانی REST API کلاستر Zilliz با Failover
           path:  مسیر API (مثلاً '/v2/vectordb/entities/insert')
           body:  شیء بدنه‌ی درخواست (بدون collectionName — خودمان اضافه می‌کنیم)
           ======================================================== */
        async function zillizRequest(path, body) {
            const payload = withCollection(body);
            const payloadStr = JSON.stringify(payload);
            let lastError = null;
            const total = ZILLIZ_CLUSTERS.length;

            for (let i = 0; i < total; i++) {
                const idx = (state.activeClusterIdx + i) % total;
                const c = ZILLIZ_CLUSTERS[idx];
                try {
                    const controller = new AbortController();
                    const timer = setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS);

                    const res = await fetch(c.endpoint + path, {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + c.apiKey,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: payloadStr,
                        signal: controller.signal
                    });
                    clearTimeout(timer);

                    const txt = await res.text();
                    let data = null;
                    try { data = JSON.parse(txt); } catch (e) { data = { raw: txt }; }

                    if (!res.ok) {
                        const msg = (data && (data.message || data.error)) || ('HTTP ' + res.status);
                        throw new Error('Zilliz ' + path + ' → ' + msg + ' (HTTP ' + res.status + ')');
                    }

                    // موفقیت — کلاستر فعال را به‌روز کن
                    state.activeClusterIdx = idx;
                    state.lastError = null;
                    return data;
                } catch (err) {
                    lastError = err;
                    console.warn('[zilliz] کلاستر #' + (idx + 1) + ' ناموفق (' + path + '):', err.message);
                }
            }
            // همه‌ی کلاسترها ناموفق بودند
            state.lastError = lastError ? lastError.message : 'unknown';
            throw lastError || new Error('تمام کلاسترهای Zilliz ناموفق بودند');
        }

        /* ========================================================
           Helper: تولید Embedding از طریق Cloudflare Workers AI
           متن → بردار ۷۶۸‌بُعدی. با Failover روی ورکرها + کش.
           ======================================================== */
        async function generateEmbedding(text) {
            if (!text || !String(text).trim()) return null;
            const key = String(text).trim();

            // بررسی کش
            if (embCache.has(key)) {
                // بازآوری ترتیب (ساده‌ترین LRU: حذف و دوباره set)
                const cached = embCache.get(key);
                embCache.delete(key);
                embCache.set(key, cached);
                return cached;
            }

            const workers = getCfWorkers();
            let lastError = null;

            for (let i = 0; i < workers.length; i++) {
                const w = workers[i];
                try {
                    const controller = new AbortController();
                    const timer = setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS);

                    const res = await fetch(w.url, {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + w.key,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ model: EMBEDDING_MODEL, text: key }),
                        signal: controller.signal
                    });
                    clearTimeout(timer);

                    if (!res.ok) {
                        const t = await res.text().catch(function () { return ''; });
                        throw new Error('CF Embedding HTTP ' + res.status + ': ' + t.slice(0, 200));
                    }

                    const data = await res.json();
                    // ساختار پاسخ: { result: { data: [ [v0, v1, ...] ] } } یا { data: [ [...] ] }
                    let vec = null;
                    if (data && data.result && Array.isArray(data.result.data) && data.result.data[0]) {
                        vec = data.result.data[0];
                    } else if (data && Array.isArray(data.data) && data.data[0]) {
                        vec = data.data[0];
                    } else if (Array.isArray(data)) {
                        vec = data[0];
                    }

                    if (!Array.isArray(vec) || vec.length !== EMBEDDING_DIM) {
                        throw new Error('بردار embedding نامعتبر (طول: ' + (Array.isArray(vec) ? vec.length : 'N/A') + ')');
                    }

                    // ذخیره در کش (با مدیریت اندازه)
                    if (embCache.size >= EMBEDDING_CACHE_MAX) {
                        // حذف قدیمی‌ترین مدخل (اولین کلید)
                        const oldest = embCache.keys().next().value;
                        embCache.delete(oldest);
                    }
                    embCache.set(key, vec);
                    return vec;
                } catch (err) {
                    lastError = err;
                    console.warn('[zilliz] CF Worker #' + (i + 1) + ' (embedding) ناموفق:', err.message);
                }
            }
            throw lastError || new Error('تولید embedding ناموفق بود');
        }

        /* ========================================================
           Helper: شباهت کسینوسی بین دو بردار
           ======================================================== */
        function cosineSimilarity(a, b) {
            if (!a || !b || a.length !== b.length) return 0;
            let dot = 0, na = 0, nb = 0;
            for (let i = 0; i < a.length; i++) {
                const av = a[i], bv = b[i];
                dot += av * bv;
                na  += av * av;
                nb  += bv * bv;
            }
            if (na === 0 || nb === 0) return 0;
            return dot / (Math.sqrt(na) * Math.sqrt(nb));
        }

        /* ========================================================
           Helper: میانگین گرفتن از چند بردار (برای centroid)
           ======================================================== */
        function averageVectors(vecs) {
            if (!vecs || !vecs.length) return null;
            const dim = vecs[0].length;
            const out = new Array(dim).fill(0);
            for (let i = 0; i < vecs.length; i++) {
                const v = vecs[i];
                for (let j = 0; j < dim; j++) out[j] += v[j];
            }
            for (let j = 0; j < dim; j++) out[j] /= vecs.length;
            return out;
        }

        /* ========================================================
           Helper: استخراج امتیاز شباهت از یک ردیف نتایج جستجو
           در Zilliz با متریک COSINE، فیلد distance همان شباهت کسینوسی
           است (بیشتر = شبیه‌تر). بعضی نسخه‌ها score می‌دهند.
           ======================================================== */
        function extractScore(row) {
            if (!row) return 0;
            if (typeof row.distance === 'number') return row.distance;
            if (typeof row.score === 'number') return row.score;
            if (typeof row.similarity === 'number') return row.similarity;
            return 0;
        }

        /* ========================================================
           Helper: نرمال‌سازی خروجی ردیف جستجو
           ======================================================== */
        function normalizeRow(row) {
            return {
                word_id:   row.word_id,
                german:    row.german,
                persian:   row.persian,
                type:      row.type,
                similarity: extractScore(row)
            };
        }

        /* ========================================================
           متد: _zillizInit
           راه‌اندازی ماژول: ساخت/بازخوانی user_id و بررسی اتصال.
           یک query ساده با limit=1 روی داده‌های این کاربر می‌زند.
           ======================================================== */
        GermanDictionary.prototype._zillizInit = async function () {
            try {
                const uid = getUserId();

                // بررسی اتصال با یک query سبک
                const data = await zillizRequest('/v2/vectordb/entities/query', {
                    filter: "user_id == '" + uid + "'",
                    outputFields: ['word_id'],
                    limit: 1
                });

                state.ready = true;
                state.lastError = null;
                state.initAt = Date.now();

                return {
                    success: true,
                    userId: uid,
                    cluster: activeCluster().endpoint,
                    sampleCount: (data && Array.isArray(data.data)) ? data.data.length : 0
                };
            } catch (err) {
                state.ready = false;
                state.lastError = err.message;
                return { success: false, error: err.message, userId: getUserId() };
            }
        };

        /* ========================================================
           متد: _zillizGetEmbedding(text)
           تولید بردار ۷۶۸‌بُعدی از متن (با کش).
           در صورت خطا null برمی‌گرداند.
           ======================================================== */
        GermanDictionary.prototype._zillizGetEmbedding = async function (text) {
            try {
                return await generateEmbedding(text);
            } catch (err) {
                console.error('[zilliz] _zillizGetEmbedding خطا:', err.message);
                return null;
            }
        };

        /* ========================================================
           متد: _zillizInsertWord(wordData)
           درج یک لغت به‌همراه embedding آن در Zilliz.
           wordData باید حداقل شامل { id, german, persian } باشد.
           type اختیاری است (پیش‌فرض 'other').
           ======================================================== */
        GermanDictionary.prototype._zillizInsertWord = async function (wordData) {
            try {
                if (!wordData || !wordData.german) {
                    return { success: false, error: 'داده‌ی لغت نامعتبر است (german الزامی است)' };
                }

                const wordId = Number(wordData.id);
                if (!wordId || wordId <= 0) {
                    return { success: false, error: 'word_id نامعتبر است (عدد صحیح مثبت لازم است)' };
                }

                const german  = String(wordData.german  || '').trim();
                const persian = String(wordData.persian || '').trim();
                const type    = String(wordData.type    || 'other').trim();

                // تولید embedding از ترکیب آلمانی + فارسی
                const text = german + ' - ' + persian;
                const embedding = await generateEmbedding(text);
                if (!embedding) {
                    return { success: false, error: 'تولید embedding ناموفق بود' };
                }

                const record = {
                    user_id:   getUserId(),
                    word_id:   wordId,
                    german:    german,
                    persian:   persian,
                    type:      type,
                    embedding: embedding
                };

                const resp = await zillizRequest('/v2/vectordb/entities/insert', {
                    data: [record]
                });

                return { success: true, word_id: wordId, response: resp };
            } catch (err) {
                console.error('[zilliz] _zillizInsertWord خطا:', err.message);
                return { success: false, error: err.message };
            }
        };

        /* ========================================================
           متد: _zillizDeleteWord(wordId)
           حذف یک لغت از Zilliz بر اساس word_id + user_id.
           ======================================================== */
        GermanDictionary.prototype._zillizDeleteWord = async function (wordId) {
            try {
                const wid = Number(wordId);
                if (!wid || wid <= 0) {
                    return { success: false, error: 'word_id نامعتبر است' };
                }
                const filter = "word_id == " + wid + " and user_id == '" + getUserId() + "'";
                const resp = await zillizRequest('/v2/vectordb/entities/delete', { filter: filter });
                return { success: true, word_id: wid, response: resp };
            } catch (err) {
                console.error('[zilliz] _zillizDeleteWord خطا:', err.message);
                return { success: false, error: err.message };
            }
        };

        /* ========================================================
           متد: _zillizSearch(query, limit)
           جستجوی معنایی: متن پرس‌وجو → embedding → ANN search
           در میان لغات همین کاربر. آرایه‌ای از نتایج مرتب برمی‌گرداند.
           ======================================================== */
        GermanDictionary.prototype._zillizSearch = async function (query, limit) {
            try {
                if (!query || !String(query).trim()) return [];
                const vec = await generateEmbedding(String(query).trim());
                if (!vec) return [];

                const data = await zillizRequest('/v2/vectordb/entities/search', {
                    data: [vec],
                    filter: "user_id == '" + getUserId() + "'",
                    limit: Math.max(1, Math.min(limit || DEFAULT_SEARCH_LIMIT, 100)),
                    outputFields: ['word_id', 'german', 'persian', 'type']
                });

                const rows = (data && Array.isArray(data.data)) ? data.data : [];
                return rows.map(normalizeRow);
            } catch (err) {
                console.error('[zilliz] _zillizSearch خطا:', err.message);
                return [];
            }
        };

        /* ========================================================
           متد: _zillizGetRelated(wordId, limit)
           یافتن لغات مرتبط با یک لغت مشخص.
           ابتدا embedding آن لغت را واکشی می‌کنیم، سپس جستجوی ANN
           روی بقیه‌ی لغات کاربر (به‌جز خودش) انجام می‌دهیم.
           ======================================================== */
        GermanDictionary.prototype._zillizGetRelated = async function (wordId, limit) {
            try {
                const wid = Number(wordId);
                if (!wid || wid <= 0) return [];

                // واکشی embedding لغت مبدأ
                const q = await zillizRequest('/v2/vectordb/entities/query', {
                    filter: "word_id == " + wid + " and user_id == '" + getUserId() + "'",
                    outputFields: ['word_id', 'german', 'persian', 'type', 'embedding'],
                    limit: 1
                });
                const rows = (q && Array.isArray(q.data)) ? q.data : [];
                if (!rows.length || !Array.isArray(rows[0].embedding)) return [];

                const base = rows[0];

                // جستجوی ANN روی بقیه‌ی لغات (به‌جز خود کلمه‌ی مبدأ)
                const data = await zillizRequest('/v2/vectordb/entities/search', {
                    data: [base.embedding],
                    filter: "user_id == '" + getUserId() + "' and word_id != " + wid,
                    limit: Math.max(1, Math.min(limit || DEFAULT_SEARCH_LIMIT, 100)),
                    outputFields: ['word_id', 'german', 'persian', 'type']
                });

                const result = (data && Array.isArray(data.data)) ? data.data : [];
                return result.map(normalizeRow);
            } catch (err) {
                console.error('[zilliz] _zillizGetRelated خطا:', err.message);
                return [];
            }
        };

        /* ========================================================
           متد: _zillizCheckDuplicate(german, persian)
           تشخیص تکراری بودن معنایی: آیا لغتی با شباهت >۸۵٪ وجود دارد؟
           ======================================================== */
        GermanDictionary.prototype._zillizCheckDuplicate = async function (german, persian) {
            try {
                const text = String(german || '').trim() + ' - ' + String(persian || '').trim();
                if (!text.trim() || text === '-') {
                    return { isDuplicate: false, error: 'متن خالی است' };
                }
                const vec = await generateEmbedding(text);
                if (!vec) {
                    return { isDuplicate: false, error: 'embedding_failed' };
                }

                const data = await zillizRequest('/v2/vectordb/entities/search', {
                    data: [vec],
                    filter: "user_id == '" + getUserId() + "'",
                    limit: 1,
                    outputFields: ['word_id', 'german', 'persian', 'type']
                });

                const rows = (data && Array.isArray(data.data)) ? data.data : [];
                if (!rows.length) {
                    return { isDuplicate: false, similarity: 0 };
                }

                const top = rows[0];
                const score = extractScore(top);
                const isDup = score >= DUPLICATE_THRESHOLD;

                return {
                    isDuplicate: isDup,
                    similarity: score,
                    threshold: DUPLICATE_THRESHOLD,
                    match: isDup ? {
                        word_id: top.word_id,
                        german:  top.german,
                        persian: top.persian,
                        type:    top.type
                    } : null
                };
            } catch (err) {
                console.error('[zilliz] _zillizCheckDuplicate خطا:', err.message);
                return { isDuplicate: false, error: err.message };
            }
        };

        /* ========================================================
           متد: _zillizCluster()
           گروه‌بندی همه‌ی لغات کاربر بر اساس شباهت معنایی.
           الگوریتم: خوشه‌بندی حریصانه (greedy) با به‌روزرسانی centroid.
           - همه‌ی بردارها را query می‌کنیم.
           - هر لغت را به نزدیک‌ترین خوشه‌ی موجود (با شباهت ≥ آستانه)
             اضافه می‌کنیم؛ وگرنه خوشه‌ی جدید می‌سازیم.
           - خوشه‌ها بر اساس اندازه (نزولی) مرتب می‌شوند.
           ======================================================== */
        GermanDictionary.prototype._zillizCluster = async function () {
            try {
                // واکشی همه‌ی لغات به‌همراه embedding
                const q = await zillizRequest('/v2/vectordb/entities/query', {
                    filter: "user_id == '" + getUserId() + "'",
                    outputFields: ['word_id', 'german', 'persian', 'type', 'embedding'],
                    limit: MAX_QUERY_LIMIT
                });

                const rows = ((q && Array.isArray(q.data)) ? q.data : [])
                    .filter(function (r) { return Array.isArray(r.embedding) && r.embedding.length === EMBEDDING_DIM; });

                if (!rows.length) {
                    return { clusters: [], count: 0 };
                }

                const clusters = []; // { centroid:[..], members:[rows] }

                for (let i = 0; i < rows.length; i++) {
                    const r = rows[i];
                    let bestIdx = -1, bestSim = -1;

                    for (let j = 0; j < clusters.length; j++) {
                        const sim = cosineSimilarity(r.embedding, clusters[j].centroid);
                        if (sim > bestSim) { bestSim = sim; bestIdx = j; }
                    }

                    if (bestIdx >= 0 && bestSim >= CLUSTER_SIM_THRESHOLD) {
                        clusters[bestIdx].members.push(r);
                        // به‌روزرسانی centroid با میانگین بردارهای اعضا
                        clusters[bestIdx].centroid =
                            averageVectors(clusters[bestIdx].members.map(function (m) { return m.embedding; }));
                    } else {
                        // خوشه‌ی جدید
                        clusters.push({
                            centroid: r.embedding.slice(),
                            members: [r]
                        });
                    }
                }

                // مرتب‌سازی بر اساس اندازه‌ی خوشه (نزولی)
                clusters.sort(function (a, b) { return b.members.length - a.members.length; });

                return {
                    clusters: clusters.map(function (c, idx) {
                        return {
                            id: idx,
                            size: c.members.length,
                            words: c.members.map(function (m) {
                                return {
                                    word_id: m.word_id,
                                    german:  m.german,
                                    persian: m.persian,
                                    type:    m.type
                                };
                            })
                        };
                    }),
                    count: rows.length,
                    threshold: CLUSTER_SIM_THRESHOLD
                };
            } catch (err) {
                console.error('[zilliz] _zillizCluster خطا:', err.message);
                return { clusters: [], count: 0, error: err.message };
            }
        };

        /* ========================================================
           متد: _zillizGetStats()
           بازگشت آمار بردارهای ذخیره‌شده برای این کاربر:
           تعداد کل + توزیع بر اساس type + کلاستر فعال.
           ======================================================== */
        GermanDictionary.prototype._zillizGetStats = async function () {
            try {
                const q = await zillizRequest('/v2/vectordb/entities/query', {
                    filter: "user_id == '" + getUserId() + "'",
                    outputFields: ['word_id', 'type'],
                    limit: MAX_QUERY_LIMIT
                });

                const rows = (q && Array.isArray(q.data)) ? q.data : [];
                const byType = {};
                let total = 0;

                for (let i = 0; i < rows.length; i++) {
                    total++;
                    const t = rows[i].type || 'other';
                    byType[t] = (byType[t] || 0) + 1;
                }

                return {
                    success: true,
                    userId: getUserId(),
                    totalVectors: total,
                    byType: byType,
                    activeCluster: activeCluster().endpoint,
                    clusterCount: ZILLIZ_CLUSTERS.length,
                    ready: state.ready,
                    lastError: state.lastError,
                    embeddingCacheSize: embCache.size
                };
            } catch (err) {
                console.error('[zilliz] _zillizGetStats خطا:', err.message);
                return {
                    success: false,
                    error: err.message,
                    totalVectors: 0,
                    byType: {},
                    ready: false
                };
            }
        };

        /* ========================================================
           متد (bonus): _zillizState()
           بازگشت وضعیت داخلی ماژول برای دیباگ.
           ======================================================== */
        GermanDictionary.prototype._zillizState = function () {
            return {
                userId: state.userId,
                activeClusterIdx: state.activeClusterIdx,
                activeCluster: activeCluster().endpoint,
                clusterCount: ZILLIZ_CLUSTERS.length,
                ready: state.ready,
                lastError: state.lastError,
                initAt: state.initAt,
                embeddingCacheSize: embCache.size,
                cfWorkersAvailable: getCfWorkers().length
            };
        };

        /* ========================================================
           ✔️ SYNC: همگام‌سازی همه‌ی لغات با Zilliz
           تمام لغات IndexedDB را به Zilliz منتقل می‌کند.
           برای لغاتی که هنوز embedding ندارند.
           ======================================================== */
        GermanDictionary.prototype._zillizSyncAll = async function (onProgress) {
            var self = this;
            var results = { total: 0, synced: 0, failed: 0, skipped: 0, errors: [] };

            try {
                if (typeof this.getAllWords !== 'function') return results;
                var words = await this.getAllWords();
                results.total = words.length;

                if (words.length === 0) return results;

                // بررسی لغاتی که قبلاً در Zilliz هستند
                var existing = new Set();
                if (typeof this._zillizGetAllWordIds === 'function') {
                    try {
                        var existingIds = await this._zillizGetAllWordIds();
                        if (existingIds) {
                            for (var e = 0; e < existingIds.length; e++) {
                                existing.add(existingIds[e]);
                            }
                        }
                    } catch (e2) {}
                }

                for (var i = 0; i < words.length; i++) {
                    var w = words[i];

                    // رد کردن لغاتی که قبلاً در Zilliz هستند
                    if (existing.has(w.id)) {
                        results.skipped++;
                        continue;
                    }

                    try {
                        var r = await this._zillizInsertWord(w);
                        if (r && r.success) {
                            results.synced++;
                        } else {
                            results.failed++;
                            if (results.errors.length < 5) {
                                results.errors.push(w.german + ': ' + (r && r.error ? r.error : 'unknown'));
                            }
                        }
                    } catch (e) {
                        results.failed++;
                        if (results.errors.length < 5) {
                            results.errors.push(w.german + ': ' + e.message);
                        }
                    }

                    // گزارش پیشرفت
                    if (typeof onProgress === 'function') {
                        onProgress(i + 1, results.total, w.german);
                    }

                    // تأخیر کوتاه برای جلوگیری از Rate Limit
                    if (i > 0 && i % 10 === 0) {
                        await new Promise(function(r) { setTimeout(r, 500); });
                    }
                }

                console.log('[zilliz] همگام‌سازی کامل:', results.synced + ' ذخیره شد،', results.skipped + ' رد شد،', results.failed + ' ناموفق');
            } catch (e) {
                console.error('[zilliz] syncAll error:', e);
                results.errors.push('FATAL: ' + e.message);
            }

            return results;
        };

        // دریافت همه‌ی word_id های ذخیره‌شده در Zilliz برای این کاربر
        GermanDictionary.prototype._zillizGetAllWordIds = async function () {
            var userId = getUserId();
            try {
                var resp = await zillizRequest('/v2/vectordb/entities/query', {
                    collectionName: 'dictionary_words',
                    filter: "user_id == '" + userId + "'",
                    outputFields: ['word_id'],
                    limit: 1000
                });
                if (resp && resp.code === 0 && resp.data) {
                    return resp.data.map(function(d) { return d.word_id; });
                }
            } catch (e) {
                console.warn('[zilliz] getAllWordIds error:', e.message);
            }
            return [];
        };

        /* ========================================================
           ✔️ LONG-TERM MEMORY: حافظه بلندمدت برای هر کاربر
           ذخیره و بازیابی خلاصه‌ی چت‌ها و اطلاعات یادگرفته‌شده.
           ======================================================== */

        // ذخیره یک خاطره/خلاصه در Zilliz
        GermanDictionary.prototype._zillizSaveMemory = async function (type, content, metadata) {
            var userId = getUserId();
            try {
                // تولید embedding از محتوا
                var embedding = await generateEmbedding(content);
                if (!embedding) return { success: false, error: 'embedding failed' };

                // ذخیره در کالکشن memories (در صورت وجود) یا استفاده از dictionary_words با type=memory
                // برای سادگی، از یک کالکشن جداگانه استفاده می‌کنیم
                var resp = await zillizRequest('/v2/vectordb/entities/insert', {
                    collectionName: 'user_memories',
                    data: [{
                        user_id: userId,
                        memory_type: type || 'chat_summary',
                        content: content.substring(0, 500),
                        embedding: embedding,
                        created_at: new Date().toISOString(),
                        metadata: JSON.stringify(metadata || {})
                    }]
                });

                if (resp && resp.code === 0) {
                    console.log('[zilliz] memory saved:', type);
                    return { success: true };
                }
                return { success: false, error: resp && resp.message || 'unknown' };
            } catch (e) {
                // اگر کالکشن memories وجود نداشت، آن را بساز
                if (e.message && e.message.indexOf('collection') !== -1) {
                    await this._zillizCreateMemoryCollection();
                    // دوباره تلاش کن
                    return this._zillizSaveMemory(type, content, metadata);
                }
                console.warn('[zilliz] saveMemory error:', e.message);
                return { success: false, error: e.message };
            }
        };

        // جستجوی خاطرات مرتبط (Semantic)
        GermanDictionary.prototype._zillizRecallMemory = async function (query, limit) {
            var userId = getUserId();
            limit = limit || 5;
            try {
                var embedding = await generateEmbedding(query);
                if (!embedding) return [];

                var resp = await zillizRequest('/v2/vectordb/entities/search', {
                    collectionName: 'user_memories',
                    data: [embedding],
                    filter: "user_id == '" + userId + "'",
                    limit: limit,
                    outputFields: ['memory_type', 'content', 'created_at', 'metadata']
                });

                if (resp && resp.code === 0 && resp.data) {
                    return resp.data.map(function(d) {
                        return {
                            type: d.memory_type,
                            content: d.content,
                            similarity: d.distance,
                            createdAt: d.created_at,
                            metadata: d.metadata ? JSON.parse(d.metadata) : {}
                        };
                    });
                }
            } catch (e) {
                console.warn('[zilliz] recallMemory error:', e.message);
            }
            return [];
        };

        // ساخت کالکشن memories
        GermanDictionary.prototype._zillizCreateMemoryCollection = async function () {
            try {
                var resp = await zillizRequest('/v2/vectordb/collections/create', {
                    collectionName: 'user_memories',
                    schema: {
                        autoId: true,
                        fields: [
                            { fieldName: 'id', dataType: 'Int64', isPrimary: true },
                            { fieldName: 'user_id', dataType: 'VarChar', elementTypeParams: { max_length: '100' } },
                            { fieldName: 'memory_type', dataType: 'VarChar', elementTypeParams: { max_length: '50' } },
                            { fieldName: 'content', dataType: 'VarChar', elementTypeParams: { max_length: '500' } },
                            { fieldName: 'created_at', dataType: 'VarChar', elementTypeParams: { max_length: '50' } },
                            { fieldName: 'metadata', dataType: 'VarChar', elementTypeParams: { max_length: '500' } },
                            { fieldName: 'embedding', dataType: 'FloatVector', elementTypeParams: { dim: '768' } }
                        ]
                    },
                    indexParams: [{
                        fieldName: 'embedding',
                        metricType: 'COSINE',
                        indexType: 'AUTOINDEX',
                        params: {}
                    }]
                });
                console.log('[zilliz] memories collection created:', resp.code === 0);
                return resp.code === 0;
            } catch (e) {
                console.warn('[zilliz] createMemoryCollection error:', e.message);
                return false;
            }
        };

        /* ========================================================
           راه‌اندازی اولیه‌ی user_id (غیرمسدودکننده)
           سپس تست اتصال پس از آماده‌شدن dictionaryApp در پس‌زمینه.
           ======================================================== */
        getUserId();

        // تست اتصال در پس‌زمینه (۲.۵ ثانیه بعد، تا app کامل لود شود)
        setTimeout(function () {
            try {
                if (typeof dictionaryApp !== 'undefined' && dictionaryApp &&
                    typeof dictionaryApp._zillizInit === 'function') {
                    dictionaryApp._zillizInit().then(function (r) {
                        if (r && r.success) {
                            console.log('✅ اتصال Zilliz برقرار شد (کاربر: ' + r.userId + ')');
                        } else {
                            console.warn('⚠️ اتصال Zilliz برقرار نشد:', r && r.error);
                        }
                    }).catch(function (e) {
                        console.warn('⚠️ Zilliz init ناموفق:', e && e.message);
                    });
                }
            } catch (e) {
                console.warn('⚠️ Zilliz background-init خطا:', e && e.message);
            }
        }, 2500);
    }

    /* ============================================================
       ۴) شروع Boot
       ============================================================ */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
