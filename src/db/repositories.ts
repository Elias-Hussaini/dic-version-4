import { db, loadSrsData, saveSrsData, type ExampleRecord } from './schema';
import type { LegacyExport, PracticeRecord, SrsData, Tag, Word } from '@/types';

/* ════════════════════════════════════════════════════════════════
   Repositories — the ONLY layer that touches Dexie.
   ════════════════════════════════════════════════════════════════ */

/* ── Words ──────────────────────────────────────────────────────── */

export const wordsRepo = {
  async getAll(): Promise<Word[]> {
    return db.words.orderBy('createdAt').reverse().toArray();
  },

  async count(): Promise<number> {
    return db.words.count();
  },

  async get(id: number): Promise<Word | undefined> {
    return db.words.get(id);
  },

  async getByGerman(german: string): Promise<Word | undefined> {
    const norm = german.trim().replace(/\s+/g, ' ').toLowerCase();
    const all = await db.words.toArray();
    return all.find((w) => (w.german ?? '').toLowerCase() === norm);
  },

  async add(word: Omit<Word, 'id'>): Promise<number> {
    const now = new Date().toISOString();
    const w: Omit<Word, 'id'> = { ...word, createdAt: word.createdAt ?? now, updatedAt: now };
    const id = await db.words.add(w as Word);
    // legacy-compatible: store inline examples also in the examples store
    if (w.examples?.length) {
      for (const ex of w.examples) {
        await db.examples.add({ wordId: id, german: ex.german, persian: ex.persian });
      }
    }
    return id;
  },

  async update(word: Word): Promise<void> {
    await db.words.put({ ...word, updatedAt: new Date().toISOString() });
  },

  async remove(id: number): Promise<void> {
    await db.transaction('rw', db.words, db.favorites, db.examples, db.practiceHistory, async () => {
      await db.words.delete(id);
      await db.favorites.delete(id).catch(() => undefined);
      await db.examples.where('wordId').equals(id).delete();
      await db.practiceHistory.where('wordId').equals(id).delete();
    });
  },

  async search(query: string, fields: Array<'german' | 'persian' | 'notes'> = ['german', 'persian']): Promise<Word[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = await db.words.toArray();
    return all
      .filter((w) => fields.some((f) => (w[f] ?? '').toLowerCase().includes(q)))
      .sort((a, b) => {
        const ag = (a.german ?? '').toLowerCase();
        const bg = (b.german ?? '').toLowerCase();
        const aStarts = ag.startsWith(q) ? 0 : 1;
        const bStarts = bg.startsWith(q) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return ag.localeCompare(bg);
      });
  },

  async getByTag(tag: string): Promise<Word[]> {
    const all = await db.words.toArray();
    return all.filter((w) => w.tags?.includes(tag));
  },

  async recent(limit: number): Promise<Word[]> {
    return db.words.orderBy('createdAt').reverse().limit(limit).toArray();
  },
};

/* ── Favorites ──────────────────────────────────────────────────── */

export const favoritesRepo = {
  async all(): Promise<number[]> {
    const rows = await db.favorites.toArray();
    return rows.map((r) => r.wordId);
  },

  async has(wordId: number): Promise<boolean> {
    return (await db.favorites.get(wordId)) !== undefined;
  },

  async toggle(wordId: number): Promise<boolean> {
    const exists = await db.favorites.get(wordId);
    if (exists) {
      await db.favorites.delete(wordId);
      return false;
    }
    await db.favorites.put({ wordId, addedAt: new Date().toISOString() });
    return true;
  },
};

/* ── Examples ───────────────────────────────────────────────────── */

export const examplesRepo = {
  async forWord(wordId: number): Promise<ExampleRecord[]> {
    return db.examples.where('wordId').equals(wordId).toArray();
  },

  async add(wordId: number, ex: { german: string; persian: string }): Promise<void> {
    await db.examples.add({ wordId, ...ex });
  },

  async removeForWord(wordId: number): Promise<void> {
    await db.examples.where('wordId').equals(wordId).delete();
  },
};

/* ── Practice history ───────────────────────────────────────────── */

export const practiceRepo = {
  async record(rec: PracticeRecord): Promise<void> {
    await db.practiceHistory.add(rec);
  },

  async all(): Promise<PracticeRecord[]> {
    return db.practiceHistory.orderBy('date').toArray();
  },

  async count(): Promise<number> {
    return db.practiceHistory.count();
  },

  async since(date: string): Promise<PracticeRecord[]> {
    return db.practiceHistory.where('date').aboveOrEqual(date).toArray();
  },

  async forWord(wordId: number): Promise<PracticeRecord[]> {
    return db.practiceHistory.where('wordId').equals(wordId).toArray();
  },
};

/* ── SRS (localStorage — legacy-compatible) ─────────────────────── */

export const srsRepo = {
  load: loadSrsData,
  save: saveSrsData,

  get(wordId: number | string): SrsData[string] | undefined {
    return loadSrsData()[String(wordId)];
  },

  /** Legacy Leitner intervals, in days, by level 0..5 */
  intervals: [1, 2, 4, 7, 14, 30] as const,

  updateOnAnswer(
    data: SrsData,
    wordId: number,
    correct: boolean,
    answeredAt = new Date(),
  ): SrsData {
    const key = String(wordId);
    const entry = data[key] ?? {
      level: 0,
      correctCount: 0,
      wrongCount: 0,
      lastPractice: answeredAt.toISOString(),
      nextReviewDate: answeredAt.toISOString(),
      totalCorrect: 0,
      totalWrong: 0,
    };
    const e = { ...entry };

    if (correct) {
      e.correctCount += 1;
      e.totalCorrect += 1;
      e.wrongCount = 0;
      if (e.correctCount >= 5 && e.level < 5) e.level = 5;
      else if (e.correctCount >= 4 && e.level < 4) e.level = 4;
      else if (e.correctCount >= 3 && e.level < 3) e.level = 3;
      else if (e.correctCount >= 2 && e.level < 2) e.level = 2;
      else if (e.correctCount >= 1 && e.level < 1) e.level = 1;
    } else {
      e.wrongCount += 1;
      e.totalWrong += 1;
      e.correctCount = 0;
      if (e.wrongCount >= 2) {
        e.level = Math.max(0, e.level - 1);
        e.correctCount = 0;
      }
    }

    e.lastPractice = answeredAt.toISOString();
    const intervals = srsRepo.intervals;
    const days = intervals[e.level] ?? 1;
    const next = new Date(answeredAt);
    next.setDate(next.getDate() + days);
    e.nextReviewDate = next.toISOString();

    data[key] = e;
    return data;
  },

  dueWordIds(data: SrsData, now = new Date()): number[] {
    const iso = now.toISOString();
    return Object.entries(data)
      .filter(([, e]) => e.nextReviewDate <= iso)
      .map(([k]) => Number(k))
      .filter((n) => Number.isFinite(n));
  },

  forecast(data: SrsData, days = 14, now = new Date()): Array<{ day: string; count: number }> {
    const out: Array<{ day: string; count: number }> = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
      const count = Object.values(data).filter((e) => e.nextReviewDate >= dayStart && e.nextReviewDate < dayEnd).length;
      out.push({ day: dayStart.slice(0, 10), count });
    }
    return out;
  },

  retention(data: SrsData): number {
    const entries = Object.values(data);
    if (!entries.length) return 0;
    const totalC = entries.reduce((s, e) => s + e.totalCorrect, 0);
    const totalW = entries.reduce((s, e) => s + e.totalWrong, 0);
    const total = totalC + totalW;
    return total === 0 ? 0 : Math.round((totalC / total) * 100);
  },

  leeches(data: SrsData, minAttempts = 8): Array<{ wordId: number; entry: SrsData[string] }> {
    return Object.entries(data)
      .filter(([, e]) => e.totalCorrect + e.totalWrong >= minAttempts && e.level <= 1)
      .map(([k, e]) => ({ wordId: Number(k), entry: e }));
  },
};

/* ── Tags (localStorage — legacy-compatible `dictionary_tags`) ──── */

const TAGS_KEY = 'dictionary_tags';

export const tagsRepo = {
  load(): Tag[] {
    try {
      const raw = localStorage.getItem(TAGS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw) as Array<[string, { name?: string; color?: string }]>;
      return arr.map(([id, v]) => ({
        id,
        name: v.name ?? id,
        color: v.color ?? '#635BFF',
      }));
    } catch {
      return [];
    }
  },

  save(tags: Tag[]): void {
    const legacy = tags.map((t) => [t.id, { name: t.name, color: t.color }]);
    localStorage.setItem(TAGS_KEY, JSON.stringify(legacy));
  },
};

/* ── Export / Import (legacy-compatible) ────────────────────────── */

export const backupRepo = {
  async export(): Promise<LegacyExport & { totalWords: number; totalPractice: number }> {
    const words = await db.words.toArray();
    const favorites = await db.favorites.toArray();
    const examples = await db.examples.toArray();
    const practiceHistory = await db.practiceHistory.toArray();
    const srsData = loadSrsData();
    const tagsData = tagsRepo.load().map((t) => [t.id, { name: t.name, color: t.color }]);

    const settings: Record<string, unknown> = {};
    for (const key of [
      'darkMode',
      'fontSize',
      'theme',
      'wordListSort',
      'learningLang',
      'lexiCardStyle',
    ]) {
      const v = localStorage.getItem(key);
      if (v !== null) settings[key] = v;
    }

    return {
      version: 5,
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      words,
      favorites: favorites.map((f) => f.wordId),
      examples,
      practiceHistory,
      tags: tagsData as unknown as LegacyExport['tags'],
      srsData,
      settings,
      totalWords: words.length,
      totalPractice: practiceHistory.length,
    };
  },

  /** Snapshot the DB *before* any destructive operation. */
  async createRestorePoint(reason: 'pre-import' | 'manual' | 'auto' = 'manual'): Promise<void> {
    const snapshot = await backupRepo.export();
    await db.restorePoints.add({
      createdAt: new Date().toISOString(),
      reason,
      data: JSON.stringify(snapshot),
      counts: { words: snapshot.words.length, practice: snapshot.practiceHistory.length },
    });
    // rolling window of 5
    const all = await db.restorePoints.orderBy('createdAt').toArray();
    if (all.length > 5) {
      for (const old of all.slice(0, all.length - 5)) {
        if (old.id !== undefined) await db.restorePoints.delete(old.id);
      }
    }
  },

  async listRestorePoints() {
    return db.restorePoints.orderBy('createdAt').reverse().toArray();
  },

  async restore(id: number): Promise<void> {
    const rp = await db.restorePoints.get(id);
    if (!rp) throw new Error('Restore point not found');
    const parsed = JSON.parse(rp.data) as LegacyExport;
    await backupRepo.import(parsed, { wipe: true, restorePoint: false });
  },

  /**
   * Import a legacy export. Creates a restore point first (unless disabled).
   * Keeps record ids so SRS data / favorites stay linked.
   */
  async import(
    data: LegacyExport,
    opts: { wipe?: boolean; restorePoint?: boolean } = {},
  ): Promise<{ words: number; practice: number }> {
    if (opts.restorePoint !== false) {
      await backupRepo.createRestorePoint('pre-import');
    }

    if (opts.wipe) {
      await db.transaction(
        'rw',
        db.words,
        db.favorites,
        db.examples,
        db.practiceHistory,
        async () => {
          await db.words.clear();
          await db.favorites.clear();
          await db.examples.clear();
          await db.practiceHistory.clear();
        },
      );
    }

    await db.transaction('rw', db.words, db.favorites, db.examples, db.practiceHistory, async () => {
      for (const w of data.words) {
        if (w.id !== undefined) await db.words.put(w as Word);
        else await db.words.add(w as Word);
      }
      for (const ex of data.examples) {
        if (ex.id !== undefined) await db.examples.put(ex as ExampleRecord);
      }
      for (const ph of data.practiceHistory) {
        if (ph.id !== undefined) await db.practiceHistory.put(ph);
        else await db.practiceHistory.add(ph);
      }
      if (data.favorites.length) {
        for (const f of data.favorites) {
          const wordId = typeof f === 'number' ? f : f.wordId;
          await db.favorites.put({ wordId });
        }
      }
    });

    if (data.srsData) saveSrsData(data.srsData);

    return { words: data.words.length, practice: data.practiceHistory.length };
  },
};
