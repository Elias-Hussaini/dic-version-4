import { Link } from 'react-router-dom';
import { Sun, Moon, Monitor, Palette, Languages, Accessibility, Database, ChevronLeft, LanguagesIcon } from 'lucide-react';
import { GlassCard, GlassSelect, Badge } from '@/design-system/Glass';
import { useSettings, type FontSize } from '@/hooks/useSettings';
import { useTranslate } from '@/hooks/useTranslate';
import { uiLangs, type UiLang } from '@/i18n';
import type { LearningLang, ThemeMode } from '@/types';

export default function SettingsPage() {
  const t = useTranslate();
  const s = useSettings();

  const themes: Array<{ id: ThemeMode; label: string; icon: typeof Sun }> = [
    { id: 'light', label: t('settings.themeLight'), icon: Sun },
    { id: 'dark', label: t('settings.themeDark'), icon: Moon },
    { id: 'system', label: t('settings.themeSystem'), icon: Monitor },
  ];

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <h1 className="text-xl font-extrabold pt-1">{t('settings.title')}</h1>

      {/* Theme */}
      <GlassCard>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Palette className="size-4 text-[var(--color-accent)]" /> {t('settings.theme')}
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((th) => (
            <button
              key={th.id}
              onClick={() => s.setTheme(th.id)}
              aria-pressed={s.theme === th.id}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                s.theme === th.id
                  ? 'bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] ring-2 ring-[var(--color-accent)]'
                  : 'glass-subtle hover:brightness-105'
              }`}
            >
              <th.icon className="size-5" />
              <span className="text-xs font-semibold">{th.label}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Languages */}
      <GlassCard>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Languages className="size-4 text-[var(--color-accent)]" /> {t('settings.language')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <GlassSelect
            label={t('settings.uiLang')}
            value={s.uiLang}
            onChange={(e) => s.setUiLang(e.target.value as UiLang)}
          >
            {uiLangs.map((l) => (
              <option key={l} value={l}>
                {l === 'fa' ? 'فارسی' : l === 'de' ? 'Deutsch' : 'English'}
              </option>
            ))}
          </GlassSelect>
          <GlassSelect
            label={t('settings.learningLang')}
            value={s.learningLang}
            onChange={(e) => s.setLearningLang(e.target.value as LearningLang)}
          >
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </GlassSelect>
        </div>
      </GlassCard>

      {/* Font size */}
      <GlassCard>
        <h2 className="text-sm font-bold mb-3">{t('settings.fontSize')}</h2>
        <div className="grid grid-cols-4 gap-2">
          {(['small', 'medium', 'large', 'xlarge'] as FontSize[]).map((f) => (
            <button
              key={f}
              onClick={() => s.setFontSize(f)}
              aria-pressed={s.fontSize === f}
              className={`py-3 rounded-2xl font-semibold transition-all ${
                s.fontSize === f
                  ? 'bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] ring-2 ring-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'glass-subtle'
              }`}
              style={{ fontSize: f === 'small' ? 12 : f === 'medium' ? 14 : f === 'large' ? 16 : 18 }}
            >
              {f === 'small' ? 'کوچک' : f === 'medium' ? 'متن' : f === 'large' ? 'بزرگ' : 'خیلی بزرگ'}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Accessibility */}
      <GlassCard>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Accessibility className="size-4 text-[var(--color-accent)]" /> {t('settings.accessibility')}
        </h2>
        <div className="space-y-1">
          <Toggle label={t('settings.reducedMotion')} checked={s.reducedMotion} onChange={s.setReducedMotion} />
          <Toggle label={t('settings.reducedTransparency')} checked={s.reducedTransparency} onChange={s.setReducedTransparency} />
          <Toggle label={t('settings.highContrast')} checked={s.highContrast} onChange={s.setHighContrast} />
        </div>
      </GlassCard>

      {/* Daily goal */}
      <GlassCard>
        <h2 className="text-sm font-bold mb-3">{t('onboarding.goal')}</h2>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 20, 30].map((n) => (
            <button
              key={n}
              onClick={() => s.setDailyGoal(n)}
              aria-pressed={s.dailyGoal === n}
              className={`py-3 rounded-2xl font-bold transition-all ${
                s.dailyGoal === n
                  ? 'bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-white'
                  : 'glass-subtle'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Data */}
      <Link to="/settings/data">
        <GlassCard className="flex items-center justify-between gap-3 hover:brightness-105 transition-[filter]">
          <div className="flex items-center gap-3">
            <Database className="size-5 text-[var(--color-accent)]" />
            <div>
              <div className="text-sm font-bold">{t('settings.data')}</div>
              <div className="text-xs text-[var(--color-ink-faint)]">{t('settings.export')} · {t('settings.import')} · {t('settings.restorePoints')}</div>
            </div>
          </div>
          <ChevronLeft className="size-5 text-[var(--color-ink-faint)] flip-rtl" />
        </GlassCard>
      </Link>

      {/* About */}
      <GlassCard level="subtle">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold">LINGO v2.0</div>
            <div className="text-xs text-[var(--color-ink-faint)] mt-0.5">{t('settings.offlineDesc')}</div>
          </div>
          <Badge tone="success">{t('settings.offline')}</Badge>
        </div>
      </GlassCard>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2.5 cursor-pointer">
      <span className="text-sm text-[var(--color-ink-soft)]">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
          checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-glass-secondary)] border border-[var(--color-glass-border-strong)]'
        }`}
      >
        <span
          className={`absolute top-0.5 start-0.5 size-6 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-[20px] rtl:-translate-x-[20px]' : ''
          }`}
        />
      </button>
    </label>
  );
}
