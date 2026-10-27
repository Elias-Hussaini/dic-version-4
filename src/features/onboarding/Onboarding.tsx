import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Sparkles, ArrowRight, BookOpenText, Languages, Target, Flame } from 'lucide-react';
import { GlassCard, GlassButton, IconTile } from '@/design-system/Glass';
import { Aurora } from '@/design-system/Aurora';
import { useSettings } from '@/hooks/useSettings';
import { useTranslate } from '@/hooks/useTranslate';
import { backupRepo } from '@/db/repositories';
import { legacyExportSchema, type LegacyExport } from '@/types';
import { useToast } from '@/design-system/Toast';
import { useInvalidate } from '@/hooks/useData';
import type { LearningLang } from '@/types';

export default function Onboarding() {
  const settings = useSettings();
  const t = useTranslate();
  const navigate = useNavigate();
  const { toast } = useToast();
  const invalidate = useInvalidate();
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<LearningLang>('de');
  const [goal, setGoal] = useState(10);

  const finish = () => {
    settings.setLearningLang(lang);
    settings.setDailyGoal(goal);
    settings.setOnboardingDone(true);
    navigate('/');
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = legacyExportSchema.parse(
        JSON.parse(await file.text()) as unknown,
      ) as unknown as LegacyExport;
      await backupRepo.import(parsed);
      invalidate.all();
      toast(`${parsed.words.length} لغت وارد شد`, 'success');
    } catch {
      toast('فایل نامعتبر است', 'error');
    }
  };

  const steps = [
    // Step 0 — welcome (full hero treatment)
    <div key="welcome" className="text-center py-6">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative mx-auto mb-7"
      >
        {/* glow behind the logo */}
        <div aria-hidden className="absolute inset-0 -z-10 grid place-items-center">
          <div className="size-44 rounded-full blur-3xl opacity-50 grad-indigo" />
          <div className="absolute size-28 translate-x-14 translate-y-8 rounded-full blur-2xl opacity-40 grad-pink" />
          <div className="absolute size-24 -translate-x-14 translate-y-10 rounded-full blur-2xl opacity-40 grad-cyan" />
        </div>
        <div className="mx-auto grid place-items-center size-26 rounded-[2.25rem] grad-indigo shadow-[0_24px_64px_rgba(102,126,234,0.5)] animate-float-soft">
          <BookOpenText className="size-13 text-white" strokeWidth={1.8} />
        </div>
      </motion.div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="grad-text text-3xl font-black tracking-tight">LINGO</span>
      </div>
      <h1 className="text-xl font-extrabold text-[var(--color-ink)]">{t('onboarding.welcome')}</h1>
      <p className="mt-2.5 text-sm leading-7 text-[var(--color-ink-soft)]">{t('onboarding.welcomeDesc')}</p>

      {/* feature chips */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-subtle text-xs font-bold text-[var(--color-ink-soft)]">
          <span className="size-2 rounded-full grad-emerald" /> SRS
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-subtle text-xs font-bold text-[var(--color-ink-soft)]">
          <span className="size-2 rounded-full grad-pink" /> AI Tutor
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-subtle text-xs font-bold text-[var(--color-ink-soft)]">
          <span className="size-2 rounded-full grad-cyan" /> Practice
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-subtle text-xs font-bold text-[var(--color-ink-soft)]">
          <span className="size-2 rounded-full grad-gold" /> Offline
        </span>
      </div>
    </div>,

    // Step 1 — language
    <div key="lang" className="space-y-5">
      <div className="text-center">
        <IconTile tone="violet" size="lg" className="mx-auto mb-4">
          <Languages className="size-7" />
        </IconTile>
        <h1 className="text-xl font-extrabold">{t('onboarding.chooseLang')}</h1>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            { id: 'de' as LearningLang, name: 'Deutsch', flag: '🇩🇪', desc: 'آلمانی', tone: 'indigo' },
            { id: 'en' as LearningLang, name: 'English', flag: '🇬🇧', desc: 'انگلیسی', tone: 'cyan' },
          ]
        ).map((l) => (
          <button
            key={l.id}
            onClick={() => setLang(l.id)}
            className={`relative p-6 rounded-3xl text-center transition-all duration-200 ${
              lang === l.id
                ? 'grad-border ring-2 ring-[var(--color-accent)] scale-[1.02]'
                : 'glass-subtle hover:brightness-105'
            }`}
          >
            {lang === l.id && (
              <span className="absolute top-3 end-3 grid place-items-center size-5 rounded-full grad-indigo">
                <Sparkles className="size-3 text-white" />
              </span>
            )}
            <div className="text-4xl mb-2">{l.flag}</div>
            <div className="font-latin font-bold">{l.name}</div>
            <div className="text-xs text-[var(--color-ink-faint)] mt-1">{l.desc}</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 2 — goal + import
    <div key="goal" className="space-y-6">
      <div className="text-center">
        <IconTile tone="sunset" size="lg" className="mx-auto mb-4">
          <Target className="size-7" />
        </IconTile>
        <h1 className="text-xl font-extrabold">{t('onboarding.goal')}</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{t('onboarding.goalDesc')}</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[5, 10, 20, 30].map((n) => (
          <button
            key={n}
            onClick={() => setGoal(n)}
            className={`relative py-4 rounded-2xl font-extrabold text-lg transition-all duration-200 ${
              goal === n
                ? 'btn-grad text-white scale-[1.03]'
                : 'glass-subtle hover:brightness-105'
            }`}
          >
            <span className="relative flex flex-col items-center gap-0.5">
              {n}
              {goal === n && <Flame className="size-3.5 text-amber-200" />}
            </span>
          </button>
        ))}
      </div>
      <label className="block">
        <input type="file" accept="application/json" className="sr-only" onChange={(e) => void importFile(e.target.files?.[0])} />
        <GlassCard level="subtle" className="flex items-center justify-center gap-2 py-4 cursor-pointer hover:brightness-105 transition-[filter]">
          <Upload className="size-4 text-[var(--color-accent)]" />
          <span className="text-sm font-semibold text-[var(--color-ink-soft)]">{t('onboarding.import')} (اختیاری)</span>
        </GlassCard>
      </label>
    </div>,
  ];

  return (
    <div className="relative min-h-dvh grid place-items-center p-4 overflow-hidden">
      <Aurora />
      <div className="w-full max-w-md">
        {/* progress dots — gradient pills */}
        <div className="flex justify-center gap-2 mb-6" role="progressbar" aria-valuenow={step + 1} aria-valuemax={3}>
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-9 grad-indigo shadow-[0_2px_10px_rgba(102,126,234,0.5)]'
                  : i < step
                    ? 'w-3 grad-indigo opacity-50'
                    : 'w-3 bg-[var(--color-glass-secondary)]'
              }`}
            />
          ))}
        </div>

        <GlassCard level="strong" className="glass-hi">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <GlassButton
              variant="ghost"
              onClick={() => (step === 0 ? finish() : setStep((s) => s - 1))}
            >
              {step === 0 ? t('onboarding.skip') : 'قبلی'}
            </GlassButton>
            <GlassButton variant="primary" size="lg" onClick={() => (step === 2 ? finish() : setStep((s) => s + 1))}>
              {step === 2 ? (
                <>
                  <Sparkles className="size-4" /> {t('onboarding.finish')}
                </>
              ) : (
                <>
                  {t('practice.next')} <ArrowRight className="size-4 flip-rtl" />
                </>
              )}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
