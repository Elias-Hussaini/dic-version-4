import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ════════════════════════════════════════════════════════════════
   Streaks & daily goals — persisted locally, legacy `xpData`
   and `achievements` keys are left untouched.
   ════════════════════════════════════════════════════════════════ */

interface ProgressState {
  streak: number;
  longest: number;
  lastActiveDate: string; // YYYY-MM-DD
  todayDone: number;
  todayDate: string;
  bumpToday: (n?: number) => void;
  checkIn: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

function dateDiffDays(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      streak: 0,
      longest: 0,
      lastActiveDate: '',
      todayDone: 0,
      todayDate: today(),

      bumpToday: (n = 1) => {
        const s = get();
        const t = today();
        const todayDone = s.todayDate === t ? s.todayDone + n : n;
        set({ todayDone, todayDate: t });
        get().checkIn();
      },

      checkIn: () => {
        const s = get();
        const t = today();
        if (s.lastActiveDate === t) return;
        if (!s.lastActiveDate) {
          set({ streak: 1, longest: Math.max(1, s.longest), lastActiveDate: t, todayDone: 0, todayDate: t });
          return;
        }
        const gap = dateDiffDays(s.lastActiveDate, t);
        if (gap === 1) {
          const streak = s.streak + 1;
          set({ streak, longest: Math.max(streak, s.longest), lastActiveDate: t, todayDone: 0, todayDate: t });
        } else {
          set({ streak: 1, lastActiveDate: t, todayDone: 0, todayDate: t });
        }
      },
    }),
    { name: 'lingo-progress' },
  ),
);
