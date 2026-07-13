/* dict-ai-api.js — AI Client (Cloudflare Workers AI + Failover System) */

/* ✔️ NEW: لیست ورکرهای هوش مصنوعی — با قابلیت Failover خودکار */
const AI_WORKERS = [
    { url: 'https://ai-7wegga.ai-multi-model-4zgxvo.workers.dev', key: 'sk-63C3hGQVXXXA3yGcG3wp3Ay21A79wO2A' },
    { url: 'https://ai-0y6z2u.ai-0y6z2u-ho67pc.workers.dev', key: 'sk-WC9cMgYvCaESvWPhqtt89UmCUmhHwWFe' },
    { url: 'https://ai-u0blil.ai-u0blil-24d298.workers.dev', key: 'sk-SXxAlOgktXjY9xBPaXswgAP1um17OmBZ' },
    // ورکرهای بیشتر بعداً اضافه می‌شوند
];

/* ✔️ مدل‌های موجود برای چت */
const CHAT_MODELS = {
    'llama-4-scout':    { id: '@cf/meta/llama-4-scout-17b-16e-instruct', name: '🦙 Llama 4 Scout 17B', vision: true,  thinking: false },
    'gpt-oss-20b':      { id: '@cf/openai/gpt-oss-20b',                   name: '🤖 GPT OSS 20B',        vision: false, thinking: true  },
    'glm-4.7-flash':    { id: '@cf/zai-org/glm-4.7-flash',               name: '⚡ GLM 4.7 Flash',       vision: false, thinking: true  },
    'gemma-4-26b':      { id: '@cf/google/gemma-4-26b-a4b-it',           name: '💎 Gemma 4 26B',        vision: true,  thinking: true  },
    'gemma-sea-lion':   { id: '@cf/aisingapore/gemma-sea-lion-v4-27b-it', name: '🦁 Gemma SEA-LION',    vision: false, thinking: true  }
};

/* مدل‌های تخصصی */
const SPECIALIZED_MODELS = {
    translation:    '@cf/meta/llama-4-scout-17b-16e-instruct',
    conjugation:    '@cf/meta/llama-4-scout-17b-16e-instruct',
    formFill:       '@cf/meta/llama-4-scout-17b-16e-instruct',
    imagePrompt:    '@cf/meta/llama-3.1-8b-instruct-fast',
    visualConcept:  '@cf/meta/llama-3.1-8b-instruct-fast'
};

/* ✔️ تابع کمکی: تأخیر */
function aiDelay(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

/* تابع کمکی: تجزیه یک رویداد SSE */
GermanDictionary.prototype._parseSSEChunk = function(eventStr) {
    if (!eventStr) return '';
    const lines = eventStr.split('\n');
    let dataStr = '';
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('data:')) {
            dataStr += trimmed.slice(5).trim();
        }
    }
    if (!dataStr) return '';
    if (dataStr === '[DONE]') return '';
    try {
        const json = JSON.parse(dataStr);
        // فرمت Cloudflare Workers AI: result.response یا choices[0].delta.content
        if (json && json.result && json.result.response) {
            // ✔️ FIX: response ممکن است string یا object باشد
            if (typeof json.result.response === 'string') return json.result.response;
            return JSON.stringify(json.result.response);
        }
        if (json && json.choices && json.choices[0]) {
            const delta = json.choices[0].delta || json.choices[0].message || {};
            if (typeof delta.content === 'string') return delta.content;
        }
        if (json && typeof json.response === 'string') return json.response;
        if (json && typeof json.text === 'string') return json.text;
        return '';
    } catch (e) {
        return '';
    }
};

/* ✔️ NEW: فراخوانی ورکر هوش مصنوعی با Failover */
GermanDictionary.prototype._cfChatAPI = async function(payload, onChunk) {
    if (!AI_WORKERS || AI_WORKERS.length === 0) {
        throw new Error('هیچ ورکر هوش مصنوعی پیکربندی نشده است.');
    }
    var lastError = null;
    for (var i = 0; i < AI_WORKERS.length; i++) {
        var worker = AI_WORKERS[i];
        try {
            var controller = new AbortController();
            var timer = setTimeout(function(){ controller.abort(); }, 60000);
            var response = await fetch(worker.url, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + worker.key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timer);
            if (!response.ok) {
                var errTxt = 'HTTP ' + response.status;
                try {
                    var ed = await response.json();
                    if (ed && ed.error) errTxt = ed.error;
                } catch(e){}
                throw new Error(errTxt);
            }
            // بررسی نوع پاسخ
            var ct = response.headers.get('content-type') || '';
            var isStream = response.body && (
                ct.includes('text/event-stream') ||
                ct.includes('application/x-ndjson') ||
                ct.includes('stream')
            );
            if (isStream && onChunk) {
                var fullText = '';
                var reader = response.body.getReader();
                var decoder = new TextDecoder('utf-8');
                var buffer = '';
                while (true) {
                    var result = await reader.read();
                    if (result.done) break;
                    buffer += decoder.decode(result.value, { stream: true });
                    var sepIdx;
                    while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
                        var eventStr = buffer.slice(0, sepIdx);
                        buffer = buffer.slice(sepIdx + 2);
                        var chunk = this._parseSSEChunk(eventStr);
                        if (chunk) {
                            fullText += chunk;
                            onChunk(chunk, fullText);
                        }
                    }
                }
                if (buffer.trim()) {
                    var finalChunk = this._parseSSEChunk(buffer);
                    if (finalChunk) {
                        fullText += finalChunk;
                        onChunk(finalChunk, fullText);
                    }
                }
                if (!fullText) throw new Error('پاسخ خالی از ورکر');
                return { message: { content: [{ text: fullText }] } };
            }
            // حالت غیراستریم
            var data = await response.json();
            // فرمت Cloudflare: { result: { response: "..." یا {...} } }
            var text = '';
            if (data && data.result) {
                if (data.result.response) {
                    // ✔️ FIX: response ممکن است string یا object باشد
                    if (typeof data.result.response === 'string') {
                        text = data.result.response;
                    } else {
                        text = JSON.stringify(data.result.response);
                    }
                } else if (data.result.choices && data.result.choices[0]) {
                    var msg = data.result.choices[0].message || data.result.choices[0].delta || {};
                    text = msg.content || '';
                }
            } else if (data && data.choices && data.choices[0]) {
                var msg2 = data.choices[0].message || data.choices[0].delta || {};
                text = msg2.content || '';
            } else if (data && data.response) {
                if (typeof data.response === 'string') text = data.response;
                else text = JSON.stringify(data.response);
            }
            if (!text) throw new Error('پاسخ خالی از ورکر');
            // ✔️ FIX: onChunk را با کل متن صدا بزن تا streaming bubble آپدیت شود
            if (onChunk) onChunk(text, text);
            return { message: { content: [{ text: text }] } };
        } catch (err) {
            console.warn('[ai-api] Worker ' + (i+1) + ' ناموفق:', err.message);
            lastError = err;
            if (err && err.status === 429) await aiDelay(800);
        }
    }
    throw lastError || new Error('تمام ورکرهای هوش مصنوعی ناموفق بودند.');
};

/* ✔️ NEW: _puterChat بازنویسی شده با Cloudflare Workers AI */
GermanDictionary.prototype._puterChat = async function(messages, options = {}) {
    // تعیین مدل: اگر model داده شد و در CHAT_MODELS بود، آن را استفاده کن
    // در غیر این صورت از مدل تخصصی بر اساس نوع کار استفاده کن
    var modelId = SPECIALIZED_MODELS.formFill; // پیش‌فرض
    if (options.model) {
        // بررسی اینکه آیا model یک کلید در CHAT_MODELS است یا یک ID کامل
        if (CHAT_MODELS[options.model]) {
            modelId = CHAT_MODELS[options.model].id;
        } else if (options.model.indexOf('@cf/') === 0) {
            modelId = options.model;
        } else if (options.model.indexOf('@') === 0) {
            modelId = options.model;
        }
    }
    if (options.taskType && SPECIALIZED_MODELS[options.taskType]) {
        modelId = SPECIALIZED_MODELS[options.taskType];
    }

    // تبدیل messages به فرمت Cloudflare
    var cfMessages = [];
    if (typeof messages === 'string') {
        cfMessages = [{ role: 'user', content: messages }];
    } else if (Array.isArray(messages)) {
        cfMessages = messages.map(function(m) {
            if (typeof m.content === 'string') {
                return { role: m.role, content: m.content };
            }
            if (Array.isArray(m.content)) {
                // محتوای چندبخشی (متن + تصویر)
                return { role: m.role, content: m.content };
            }
            return { role: m.role, content: String(m.content || '') };
        });
    }
    cfMessages = cfMessages.filter(function(m) {
        return m.content && (typeof m.content === 'string' ? m.content.trim() : true);
    });

    // ✔️ max_tokens هوشمند: برای مدل‌های thinking حداقل ۴۰۹۶
    var maxTokens = options.max_tokens || 8192;
    var modelKey = null;
    for (var k in CHAT_MODELS) {
        if (CHAT_MODELS[k].id === modelId) { modelKey = k; break; }
    }
    if (modelKey && CHAT_MODELS[modelKey].thinking && maxTokens < 4096) {
        maxTokens = 4096;
    }

    var payload = {
        model: modelId,
        messages: cfMessages,
        max_tokens: maxTokens,
        temperature: options.temperature || 0.7,
        stream: !!onChunk  // ✔️ فقط اگر onChunk موجود است، استریم درخواست کن
    };

    var onChunk = (typeof options.onChunk === 'function') ? options.onChunk : null;

    try {
        return await this._cfChatAPI(payload, onChunk);
    } catch (error) {
        console.error('❌ _puterChat error:', error);
        throw error;
    }
};

GermanDictionary.prototype.setGroqApiKey = function(key) {
    if (key && key.trim()) {
        const encrypted = btoa(key.trim());
        localStorage.setItem('groq_api_key_encrypted', encrypted);
        return true;
    }
    return false;
};

GermanDictionary.prototype.getGroqApiKey = function() {
    // دیگه نیازی به کلید نیست! Worker خودش کلیدها رو مدیریت میکنه
    // فقط یه مقدار ساختگی برمیگردونیم (Worker بهش نیاز نداره)
    return "worker-handles-keys";
};

GermanDictionary.prototype.clearGroqApiKey = function() {
    localStorage.removeItem('groq_api_key_encrypted');
};

GermanDictionary.prototype.testGroqApiKey = async function(apiKey = null) {
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
};

GermanDictionary.prototype._puterExtractText = async function(response) {
    if (!response) return '';
    if (response?.message?.content?.[0]?.text) return response.message.content[0].text;
    if (Array.isArray(response?.message?.content)) return response.message.content.map(c => c.text || '').join('');
    if (typeof response?.message?.content === 'string') return response.message.content;
    if (typeof response === 'string') return response;
    if (response?.text) return response.text;
    return '';
};

GermanDictionary.prototype.searchExactInDictionary = async function(text) {
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
};

GermanDictionary.prototype.showSuggestions = async function(text) {
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
};

GermanDictionary.prototype.searchInDatabase = async function(text, language) {
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
};

GermanDictionary.prototype.translateWithGoogle = async function(text, source, target) {
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
};

GermanDictionary.prototype.showSuggestions = async function(text) {
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
};

GermanDictionary.prototype.saveTranslationWithAutoAnalysis = async function() {
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
};

GermanDictionary.prototype.autoDetectWordInfo = async function(germanWord) {
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
};

GermanDictionary.prototype.showSaveFormWithAnalysis = function(german, persian, analysis) {
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
};

GermanDictionary.prototype.setupSaveAnalyzedFormEvents = function() {
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
};

GermanDictionary.prototype.returnToTranslateImmediately = function() {
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
};

GermanDictionary.prototype.suggestVerbConjugation = function(verb) {
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
};

