import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, Target, Upload, Sparkles, ArrowRight, BookOpenText } from 'lucide-react';
import { GlassCard, GlassButton } from '@/design-system/Glass';
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
    // Step 0 — welcome
    <div key="welcome" className="text-center py-8">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="mx-auto mb-6 grid place-items-center size-24 rounded-[2rem] bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] shadow-[0_20px_60px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]"
      >
        <BookOpenText className="size-12 text-white" />
      </motion.div>
      <h1 className="text-2xl font-extrabold">{t('onboarding.welcome')}</h1>
      <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{t('onboarding.welcomeDesc')}</p>
    </div>,

    // Step 1 — language
    <div key="lang" className="space-y-4">
      <h1 className="text-xl font-extrabold text-center">{t('onboarding.chooseLang')}</h1>
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            { id: 'de' as LearningLang, name: 'Deutsch', flag: '🇩🇪', desc: 'آلمانی' },
            { id: 'en' as LearningLang, name: 'English', flag: '🇬🇧', desc: 'انگلیسی' },
          ]
        ).map((l) => (
          <button
            key={l.id}
            onClick={() => setLang(l.id)}
            className={`p-6 rounded-3xl text-center transition-all ${
              lang === l.id
                ? 'bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] ring-2 ring-[var(--color-accent)]'
                : 'glass-subtle hover:brightness-105'
            }`}
          >
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
        <h1 className="text-xl font-extrabold">{t('onboarding.goal')}</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{t('onboarding.goalDesc')}</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[5, 10, 20, 30].map((n) => (
          <button
            key={n}
            onClick={() => setGoal(n)}
            className={`py-4 rounded-2xl font-extrabold text-lg transition-all ${
              goal === n
                ? 'bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-white'
                : 'glass-subtle'
            }`}
          >
            {n}
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
    <div className="min-h-dvh grid place-items-center p-4">
      <div className="w-full max-w-md">
        {/* progress dots */}
        <div className="flex justify-center gap-2 mb-6" role="progressbar" aria-valuenow={step + 1} aria-valuemax={3}>
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-[var(--color-accent)]' : i < step ? 'w-3 bg-[var(--color-accent)] opacity-50' : 'w-3 bg-[var(--color-glass-secondary)]'
              }`}
            />
          ))}
        </div>

        <GlassCard level="strong">
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
            <GlassButton variant="primary" onClick={() => (step === 2 ? finish() : setStep((s) => s + 1))}>
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
