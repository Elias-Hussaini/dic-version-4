import { describe, it, expect } from 'vitest';
import { srsRepo } from '@/db/repositories';
import type { SrsData } from '@/types';

/* SRS engine must keep the LEGACY Leitner behaviour:
   - 1st correct → level 1; consecutive corrects climb; 5 corrects → level 5
   - 2 wrongs in a row → drop one level, reset streak
   - intervals [1,2,4,7,14,30] days by level
   - due = nextReviewDate <= now */

describe('srsRepo.updateOnAnswer', () => {
  it('promotes level on consecutive corrects (legacy ladder)', () => {
    let data: SrsData = {};
    const now = new Date('2025-06-01T10:00:00Z');
    data = srsRepo.updateOnAnswer(data, 42, true, now);
    expect(data['42']?.level).toBe(1);
    data = srsRepo.updateOnAnswer(data, 42, true, now);
    expect(data['42']?.level).toBe(2);
    data = srsRepo.updateOnAnswer(data, 42, true, now);
    expect(data['42']?.level).toBe(3);
    data = srsRepo.updateOnAnswer(data, 42, true, now);
    expect(data['42']?.level).toBe(4);
    data = srsRepo.updateOnAnswer(data, 42, true, now);
    expect(data['42']?.level).toBe(5);
    expect(data['42']?.totalCorrect).toBe(5);
  });

  it('demotes after two consecutive wrongs', () => {
    let data: SrsData = {};
    const now = new Date('2025-06-01T10:00:00Z');
    for (let i = 0; i < 3; i++) data = srsRepo.updateOnAnswer(data, 7, true, now);
    expect(data['7']?.level).toBe(3);
    data = srsRepo.updateOnAnswer(data, 7, false, now);
    expect(data['7']?.level).toBe(3); // one wrong is not enough
    data = srsRepo.updateOnAnswer(data, 7, false, now);
    expect(data['7']?.level).toBe(2); // second wrong demotes
    expect(data['7']?.correctCount).toBe(0);
  });

  it('schedules next review with the legacy interval table', () => {
    let data: SrsData = {};
    const now = new Date('2025-06-01T10:00:00Z');
    data = srsRepo.updateOnAnswer(data, 1, true, now); // level 1 → +2d
    expect(data['1']?.nextReviewDate).toBe('2025-06-03T10:00:00.000Z');
    data = srsRepo.updateOnAnswer(data, 1, true, now); // level 2 → +4d
    expect(data['1']?.nextReviewDate).toBe('2025-06-05T10:00:00.000Z');
  });

  it('computes due words by nextReviewDate <= now', () => {
    const data: SrsData = {
      '1': {
        level: 3,
        correctCount: 3,
        wrongCount: 0,
        lastPractice: '2025-05-01T00:00:00Z',
        nextReviewDate: '2025-05-02T00:00:00Z',
        totalCorrect: 3,
        totalWrong: 0,
      },
      '2': {
        level: 4,
        correctCount: 4,
        wrongCount: 0,
        lastPractice: '2025-05-01T00:00:00Z',
        nextReviewDate: '2999-01-01T00:00:00Z',
        totalCorrect: 4,
        totalWrong: 0,
      },
    };
    const due = srsRepo.dueWordIds(data, new Date('2025-06-01T00:00:00Z'));
    expect(due).toEqual([1]);
  });

  it('computes retention and finds leeches', () => {
    const data: SrsData = {
      '1': {
        level: 5,
        correctCount: 5,
        wrongCount: 0,
        lastPractice: '',
        nextReviewDate: '',
        totalCorrect: 9,
        totalWrong: 1,
      },
      '2': {
        level: 1,
        correctCount: 0,
        wrongCount: 2,
        lastPractice: '',
        nextReviewDate: '',
        totalCorrect: 2,
        totalWrong: 8,
      },
    };
    expect(srsRepo.retention(data)).toBe(55); // 11 correct / 20 total
    const leeches = srsRepo.leeches(data);
    expect(leeches.map((l) => l.wordId)).toEqual([2]);
  });

  it('forecasts upcoming reviews', () => {
    const data: SrsData = {
      '1': {
        level: 1,
        correctCount: 1,
        wrongCount: 0,
        lastPractice: '',
        nextReviewDate: '2025-06-01T00:00:00Z',
        totalCorrect: 1,
        totalWrong: 0,
      },
      '2': {
        level: 1,
        correctCount: 1,
        wrongCount: 0,
        lastPractice: '',
        nextReviewDate: '2025-06-01T00:00:00Z',
        totalCorrect: 1,
        totalWrong: 0,
      },
    };
    const forecast = srsRepo.forecast(data, 3, new Date('2025-06-01T00:00:00Z'));
    expect(forecast[0]?.count).toBe(2);
    expect(forecast[1]?.count).toBe(0);
  });
});
