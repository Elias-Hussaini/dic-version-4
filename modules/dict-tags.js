/* dict-tags.js — Tags & Folders CRUD (lines 394-563) */

GermanDictionary.prototype.loadTags = function() {
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
};

GermanDictionary.prototype.saveTags = function() {
    try {
        const toSave = Array.from(this.tags.entries());
        localStorage.setItem('dictionary_tags', JSON.stringify(toSave));
    } catch(e) {
        console.error('Error saving tags:', e);
    }
};

GermanDictionary.prototype.getAllTags = function() {
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
};

GermanDictionary.prototype.getTagsForWord = function(wordId) {
    const result = [];
    for (const [id, tag] of this.tags) {
        if (tag.wordIds.includes(wordId)) {
            result.push({ id: tag.id, name: tag.name, color: tag.color });
        }
    }
    return result;
};

GermanDictionary.prototype.addWordToTag = function(tagId, wordId) {
    const tag = this.tags.get(tagId);
    if (!tag) return false;
    if (!tag.wordIds.includes(wordId)) {
        tag.wordIds.push(wordId);
        this.saveTags();
        return true;
    }
    return false;
};

GermanDictionary.prototype.removeWordFromTag = function(tagId, wordId) {
    const tag = this.tags.get(tagId);
    if (!tag) return false;
    const index = tag.wordIds.indexOf(wordId);
    if (index !== -1) {
        tag.wordIds.splice(index, 1);
        this.saveTags();
        return true;
    }
    return false;
};

GermanDictionary.prototype.getWordsByTag = async function(tagId) {
    const tag = this.tags.get(tagId);
    if (!tag || tag.wordIds.length === 0) return [];
    const allWords = await this.getAllWords();
    const wordMap = new Map(allWords.map(w => [w.id, w]));
    const result = tag.wordIds.map(id => wordMap.get(id)).filter(w => w);
    
    // اعمال سورت فعلی روی نتیجه (مهم برای سورت جدیدترین)
    const savedSort = localStorage.getItem('wordListSort') || 'alphabetical';
    this.applySortToFilteredWords(result, savedSort);
    return result;
};

GermanDictionary.prototype.createTag = function(name, color = null) {
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
};

GermanDictionary.prototype.deleteTag = function(tagId) {
    if (this.tags.has(tagId)) {
        this.tags.delete(tagId);
        this.saveTags();
        return { success: true };
    }
    return { success: false };
};

GermanDictionary.prototype.renameTag = function(tagId, newName) {
    const tag = this.tags.get(tagId);
    if (!tag) return false;
    tag.name = newName.trim();
    this.saveTags();
    return true;
};

GermanDictionary.prototype.changeTagColor = function(tagId, color) {
    const tag = this.tags.get(tagId);
    if (!tag) return false;
    tag.color = color;
    this.saveTags();
    return true;
};

GermanDictionary.prototype.addMultipleWordsToTag = function(tagId, wordIds) {
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
};

GermanDictionary.prototype.removeMultipleWordsFromTag = function(tagId, wordIds) {
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
};

