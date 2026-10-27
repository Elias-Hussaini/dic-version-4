import { describe, it, expect, beforeEach } from 'vitest';
import { legacyExportSchema, type LegacyExport } from '@/types';
import { backupRepo, wordsRepo, favoritesRepo, practiceRepo, srsRepo, tagsRepo } from '@/db/repositories';
import { db } from '@/db/schema';
import legacyExportJson from './fixtures/legacy-export.json';

/* ════════════════════════════════════════════════════════════════
   Hard requirement: a legacy export must import with EVERY record
   surviving — words, favorites, examples, practice history, tags,
   SRS data. This test guards data compatibility forever.
   ════════════════════════════════════════════════════════════════ */

const legacyExport = legacyExportSchema.parse(legacyExportJson) as unknown as LegacyExport;

beforeEach(async () => {
  await db.delete();
  await db.open();
  localStorage.clear();
});

describe('legacy import compatibility', () => {
  it('validates the legacy export fixture with zod', () => {
    expect(legacyExport.words).toHaveLength(3);
    expect(legacyExport.favorites).toHaveLength(2);
    expect(legacyExport.practiceHistory).toHaveLength(4);
    expect(legacyExport.srsData?.['1']?.level).toBe(2);
  });

  it('imports every word with its original id and fields', async () => {
    const result = await backupRepo.import(legacyExport, { restorePoint: false });
    expect(result.words).toBe(3);

    const haus = await wordsRepo.get(1);
    expect(haus).toBeDefined();
    expect(haus?.german).toBe('Haus');
    expect(haus?.gender).toBe('das');
    expect(haus?.plural).toBe('Häuser');
    expect(haus?.tags).toEqual(['A1', 'Alltag']);

    const gehen = await wordsRepo.get(2);
    expect(gehen?.verbForms?.helper).toBe('sein');
    expect(gehen?.verbForms?.perfect).toBe('ich bin gegangen');

    const schnell = await wordsRepo.get(3);
    expect(schnell?.comparative).toBe('schneller');
  });

  it('imports favorites as word ids', async () => {
    await backupRepo.import(legacyExport, { restorePoint: false });
    const favs = await favoritesRepo.all();
    expect(favs).toContain(1);
    expect(favs).toContain(3);
  });

  it('imports practice history with all records', async () => {
    await backupRepo.import(legacyExport, { restorePoint: false });
    const history = await practiceRepo.all();
    expect(history).toHaveLength(4);
    expect(history.filter((h) => h.correct)).toHaveLength(2);
  });

  it('imports SRS data and keeps levels', async () => {
    await backupRepo.import(legacyExport, { restorePoint: false });
    const srs = srsRepo.load();
    expect(srs['1']?.level).toBe(2);
    expect(srs['1']?.totalCorrect).toBe(2);
    expect(srs['2']?.wrongCount).toBe(2);
  });

  it('imports tags in the legacy localStorage format', async () => {
    // simulate what legacy saveTags wrote
    localStorage.setItem(
      'dictionary_tags',
      JSON.stringify([
        ['tag-1', { name: 'درس ۱', color: '#635BFF' }],
        ['tag-2', { name: 'سفر', color: '#8B5CF6' }],
      ]),
    );
    const tags = tagsRepo.load();
    expect(tags).toHaveLength(2);
    expect(tags[0]?.name).toBe('درس ۱');
    expect(tags[1]?.color).toBe('#8B5CF6');
  });
});

describe('export round-trip', () => {
  it('exports in the legacy-readable shape', async () => {
    await backupRepo.import(legacyExport, { restorePoint: false });
    const exported = await backupRepo.export();

    expect(exported.version).toBe(5);
    expect(exported.words).toHaveLength(3);
    expect(exported.favorites).toContain(1);
    expect(exported.practiceHistory).toHaveLength(4);
    expect(exported.srsData?.['1']?.level).toBe(2);
    // legacy export schema must still accept our own export
    expect(() => legacyExportSchema.parse(exported)).not.toThrow();
  });
});

describe('restore points', () => {
  it('creates a restore point before import and can restore it', async () => {
    // seed one word
    await wordsRepo.add({
      german: 'Buch',
      persian: 'کتاب',
      type: 'noun',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await backupRepo.import(legacyExport, { restorePoint: true });
    expect((await wordsRepo.getAll()).length).toBeGreaterThanOrEqual(3);

    const points = await backupRepo.listRestorePoints();
    expect(points.length).toBeGreaterThan(0);

    await backupRepo.restore(points[0]!.id!);
    const words = await wordsRepo.getAll();
    // restore returns us to the single-word state
    expect(words).toHaveLength(1);
    expect(words[0]?.german).toBe('Buch');
  });
});
