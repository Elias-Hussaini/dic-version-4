import { z } from 'zod';

/* ════════════════════════════════════════════════════════════════
   Domain types — shared across features. Validated with zod at
   boundaries (import, export, API). Mirrors legacy data shapes.
   ════════════════════════════════════════════════════════════════ */

export type WordType = 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'other';
export type Gender = 'der' | 'die' | 'das';
export type LearningLang = 'de' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';

export const WORD_TYPES: readonly WordType[] = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'other',
] as const;

export const GENDERS: readonly Gender[] = ['der', 'die', 'das'] as const;

export interface VerbForms {
  present?: string | null;
  past?: string | null;
  perfect?: string | null;
  future?: string | null;
  konjunktiv?: string | null;
  helper?: string | null;
  separable?: boolean;
}

export interface WordExample {
  german: string;
  persian: string;
}

export interface Word {
  id: number;
  german: string;
  persian: string;
  type: WordType;
  gender?: Gender;
  plural?: string;
  verbForms?: VerbForms;
  comparative?: string;
  superlative?: string;
  antonym?: string;
  case?: string;
  meanings?: string;
  examples?: WordExample[];
  notes?: string;
  tags?: string[];
  pronunciation?: string;
  cefr?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  wordId: number;
  addedAt?: string;
}

export interface PracticeRecord {
  id?: number;
  wordId: number;
  correct: boolean;
  mode: string;
  date: string;
  timeSpent?: number;
}

export interface SrsEntry {
  level: number;
  correctCount: number;
  wrongCount: number;
  lastPractice: string;
  nextReviewDate: string;
  totalCorrect: number;
  totalWrong: number;
}

export type SrsData = Record<string, SrsEntry>;

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  ts?: number;
}

export interface MusicTrack {
  id?: number;
  name: string;
  audioData?: string;
  audioType?: string;
  imageData?: string;
  uploadDate?: string;
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastActiveDate: string;
  todayGoal: number;
  todayDone: number;
}

/* ── Zod schemas (boundaries) ───────────────────────────────────── */

export const wordSchema = z.object({
  id: z.number().optional(),
  german: z.string().min(1),
  persian: z.string().min(1),
  type: z.enum(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'other']).default('other'),
  gender: z.enum(['der', 'die', 'das']).optional(),
  plural: z.string().optional(),
  verbForms: z
    .object({
      present: z.string().nullable().optional(),
      past: z.string().nullable().optional(),
      perfect: z.string().nullable().optional(),
      future: z.string().nullable().optional(),
      konjunktiv: z.string().nullable().optional(),
      helper: z.string().nullable().optional(),
      separable: z.boolean().optional(),
    })
    .optional(),
  comparative: z.string().optional(),
  superlative: z.string().optional(),
  antonym: z.string().optional(),
  case: z.string().optional(),
  meanings: z.string().optional(),
  examples: z.array(z.object({ german: z.string(), persian: z.string() })).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pronunciation: z.string().optional(),
  cefr: z.string().optional(),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export const practiceRecordSchema = z.object({
  id: z.number().optional(),
  wordId: z.number(),
  correct: z.boolean(),
  mode: z.string().default('unknown'),
  date: z.string(),
  timeSpent: z.number().optional(),
});

export const srsEntrySchema = z.object({
  level: z.number().int().min(0).max(5),
  correctCount: z.number().int().min(0),
  wrongCount: z.number().int().min(0),
  lastPractice: z.string(),
  nextReviewDate: z.string(),
  totalCorrect: z.number().int().min(0),
  totalWrong: z.number().int().min(0),
});

export const legacyTagSchema = z.tuple([z.string(), z.object({ name: z.string().optional(), color: z.string().optional() }).passthrough()]);

/**
 * Legacy export file shape (validated by `legacyExportSchema`, typed here
 * explicitly so repository code works with our domain interfaces).
 */
export interface LegacyExport {
  version?: number;
  schemaVersion?: number;
  exportedAt?: string;
  words: Word[];
  favorites: Array<number | { wordId: number }>;
  examples: Array<{ id?: number; wordId: number; german: string; persian: string }>;
  practiceHistory: PracticeRecord[];
  tags: unknown[];
  srsData?: SrsData;
  settings?: Record<string, unknown>;
  music?: unknown[];
  books?: unknown[];
  totalWords?: number;
  totalPractice?: number;
}

/** Legacy export file: { version, words, favorites, examples, practiceHistory, tags, srsData, ... } */
export const legacyExportSchema = z.object({
  version: z.number().optional(),
  exportedAt: z.string().optional(),
  words: z.array(wordSchema.passthrough()).default([]),
  favorites: z.array(z.union([z.number(), z.object({ wordId: z.number() }).passthrough()])).default([]),
  examples: z
    .array(
      z.object({ id: z.number().optional(), wordId: z.number(), german: z.string(), persian: z.string() }).passthrough(),
    )
    .default([]),
  practiceHistory: z.array(practiceRecordSchema.passthrough()).default([]),
  tags: z.array(z.union([legacyTagSchema, z.any()])).default([]),
  srsData: z.record(z.string(), srsEntrySchema.passthrough()).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  music: z.array(z.any()).optional(),
  books: z.array(z.any()).optional(),
});
