import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearningLang, ThemeMode } from '@/types';
import { detectUiLang, type UiLang } from '@/i18n';

/* ════════════════════════════════════════════════════════════════
   Settings store — writes through to legacy-compatible localStorage
   keys (darkMode, fontSize, learningLang, …) so old exports/imports
   of settings keep working.
   ════════════════════════════════════════════════════════════════ */

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface SettingsState {
  theme: ThemeMode;
  uiLang: UiLang;
  learningLang: LearningLang;
  fontSize: FontSize;
  reducedMotion: boolean;
  reducedTransparency: boolean;
  highContrast: boolean;
  dailyGoal: number;
  onboardingDone: boolean;
  setTheme: (t: ThemeMode) => void;
  setUiLang: (l: UiLang) => void;
  setLearningLang: (l: LearningLang) => void;
  setFontSize: (f: FontSize) => void;
  setReducedMotion: (v: boolean) => void;
  setReducedTransparency: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
  setDailyGoal: (n: number) => void;
  setOnboardingDone: (v: boolean) => void;
}

const FONT_SCALE: Record<FontSize, number> = {
  small: 0.9,
  medium: 1,
  large: 1.12,
  xlarge: 1.25,
};

function applyLegacyKeys(s: Partial<SettingsState>) {
  // keep legacy localStorage keys in sync for data-compat
  if (s.theme) localStorage.setItem('darkMode', s.theme === 'dark' ? 'true' : 'false');
  if (s.theme) localStorage.setItem('theme', s.theme);
  if (s.fontSize) localStorage.setItem('fontSize', s.fontSize);
  if (s.learningLang) localStorage.setItem('learningLang', s.learningLang);
}

function applyFontScale(fontSize: FontSize) {
  document.documentElement.style.fontSize = `${16 * FONT_SCALE[fontSize]}px`;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      uiLang: 'fa',
      learningLang: 'de',
      fontSize: 'medium',
      reducedMotion: false,
      reducedTransparency: false,
      highContrast: false,
      dailyGoal: 10,
      onboardingDone: false,

      setTheme: (theme) => {
        set({ theme });
        applyLegacyKeys({ theme });
      },
      setUiLang: (uiLang) => {
        set({ uiLang });
        localStorage.setItem('uiLang', uiLang);
      },
      setLearningLang: (learningLang) => {
        set({ learningLang });
        applyLegacyKeys({ learningLang });
      },
      setFontSize: (fontSize) => {
        set({ fontSize });
        applyLegacyKeys({ fontSize });
        applyFontScale(fontSize);
      },
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setReducedTransparency: (reducedTransparency) => set({ reducedTransparency }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setDailyGoal: (dailyGoal) => set({ dailyGoal }),
      setOnboardingDone: (onboardingDone) => set({ onboardingDone }),
    }),
    {
      name: 'lingo-settings',
      onRehydrateStorage: () => (state) => {
        // migrate legacy localStorage settings on first run
        if (!state) return;
        const legacyDark = localStorage.getItem('darkMode');
        if (legacyDark !== null && localStorage.getItem('lingo-settings') === null) {
          state.theme = legacyDark === 'true' ? 'dark' : 'light';
        }
        const legacyLang = localStorage.getItem('learningLang');
        if (legacyLang === 'de' || legacyLang === 'en') state.learningLang = legacyLang;
        state.uiLang = detectUiLang();
        applyFontScale(state.fontSize);
      },
    },
  ),
);

/* ── Theme application hook helpers ─────────────────────────────── */

export function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolvedTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return mode;
}

export function applyDocumentTheme(dark: boolean, s: SettingsState): void {
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.classList.toggle('reduce-transparency', s.reducedTransparency);
  root.classList.toggle('reduce-motion', s.reducedMotion);
  root.classList.toggle('high-contrast', s.highContrast);
  const lang = s.uiLang;
  root.lang = lang;
  root.dir = lang === 'fa' ? 'rtl' : 'ltr';
}
