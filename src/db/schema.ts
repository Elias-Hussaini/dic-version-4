import Dexie, { type Table } from 'dexie';
import type {
  Favorite,
  MusicTrack,
  PracticeRecord,
  SrsData,
  Word,
  WordExample,
  ChatMessage,
} from '@/types';

/* ════════════════════════════════════════════════════════════════
   Database — 100% compatible with the legacy app.

   Legacy opened `GermanPersianDictionary` at versions 5 and 6 with the
   same stores. Dexie declares the *same* stores; opening the DB with a
   higher version only adds indexes additively — records keep their shape
   and ids, so existing users' data loads untouched.
   ════════════════════════════════════════════════════════════════ */

export interface ExampleRecord extends WordExample {
  id?: number;
  wordId: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  savedAt: string;
}

export interface RestorePoint {
  id?: number;
  createdAt: string;
  reason: 'pre-import' | 'manual' | 'auto';
  data: string; // serialized JSON snapshot
  counts: { words: number; practice: number };
}

class LingoDb extends Dexie {
  words!: Table<Word, number>;
  favorites!: Table<Favorite, number>;
  examples!: Table<ExampleRecord, number>;
  practiceHistory!: Table<PracticeRecord, number>;
  chatHistory!: Table<ChatSession, string>;
  music!: Table<MusicTrack, number>;
  restorePoints!: Table<RestorePoint, number>;

  constructor() {
    super('GermanPersianDictionary');
    // v6 mirrors legacy schema exactly (same stores, same keyPaths).
    this.version(6).stores({
      words: '++id, &german, persian, type, gender, createdAt',
      favorites: 'wordId',
      examples: '++id, wordId',
      practiceHistory: '++id, wordId, date, correct',
      chatHistory: 'id, savedAt',
      music: '++id, name, uploadDate',
      books: 'id, title, author, createdAt',
    });
    // v7 — additive only: index for folder browsing + restore points store.
    this.version(7).stores({
      words: '++id, &german, persian, type, gender, createdAt, updatedAt',
      favorites: 'wordId',
      examples: '++id, wordId',
      practiceHistory: '++id, wordId, date, correct, mode',
      chatHistory: 'id, savedAt',
      music: '++id, name, uploadDate',
      books: 'id, title, author, createdAt',
      restorePoints: '++id, createdAt',
    }).upgrade((tx) => {
      // ensure updatedAt exists on old records
      return tx
        .table('words')
        .toCollection()
        .modify((w) => {
          if (!w.updatedAt) w.updatedAt = w.createdAt ?? new Date().toISOString();
        });
    });
  }
}

export const db = new LingoDb();

/* ── SRS persistence (localStorage, exactly like legacy) ────────── */
const SRS_KEY = 'srsData';
const LAST_SRS_KEY = 'lastSrsUpdate';

export function loadSrsData(): SrsData {
  try {
    const raw = localStorage.getItem(SRS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SrsData;
  } catch {
    return {};
  }
}

export function saveSrsData(data: SrsData): void {
  localStorage.setItem(SRS_KEY, JSON.stringify(data));
  localStorage.setItem(LAST_SRS_KEY, new Date().toISOString());
}
