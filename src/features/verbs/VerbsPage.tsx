import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpenText, Volume2 } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput, EmptyState, Skeleton } from '@/design-system/Glass';
import { PageHero } from '@/design-system/PageHero';
import { useWords } from '@/hooks/useData';
import { useTranslate } from '@/hooks/useTranslate';
import { speak } from '@/services/tts';
import type { Word } from '@/types';

/* Verb conjugation tool — browses user's verbs + full paradigm view. */
export default function VerbsPage() {
  const t = useTranslate();
  const { data: words, isLoading } = useWords();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Word | null>(null);

  const verbs = useMemo(() => {
    if (!words) return [];
    return words.filter((w) => w.type === 'verb' && w.german.toLowerCase().includes(query.toLowerCase()));
  }, [words, query]);

  if (isLoading) return <div className="space-y-3"><Skeleton className="h-14" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <PageHero icon={<BookOpenText />} title={t('learn.verbs')} subtitle="جدول صرف افعال" />

      <GlassInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Verb suchen…"
        latin
        dir="ltr"
        aria-label={t('common.search')}
      />

      {verbs.length === 0 ? (
        <EmptyState
          icon={<BookOpenText className="size-8" />}
          title="هنوز فعلی ثبت نشده است"
          description="برای استفاده از ابزار صرف، لغت از نوع «Verb» با فرم‌های صرف اضافه کنید."
        />
      ) : (
        <div className="space-y-2">
          {verbs.map((v) => (
            <motion.button
              key={v.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelected(selected?.id === v.id ? null : v)}
              className="w-full text-start"
            >
              <GlassCard level="subtle" pad="sm" className="flex items-center justify-between">
                <span className="font-latin font-bold" dir="ltr">
                  {v.german}
                </span>
                <span className="text-xs text-[var(--color-ink-soft)]">{v.persian}</span>
              </GlassCard>
            </motion.button>
          ))}
        </div>
      )}

      {selected && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard level="strong">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold font-latin" dir="ltr">
                {selected.german}
              </h2>
              <GlassButton variant="ghost" size="icon" onClick={() => speak(selected.german)} aria-label={t('word.speak')}>
                <Volume2 className="size-5" />
              </GlassButton>
            </div>
            {selected.verbForms ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ['Präsens', selected.verbForms.present],
                    ['Präteritum', selected.verbForms.past],
                    ['Perfekt', selected.verbForms.perfect],
                    ['Futur I', selected.verbForms.future],
                    ['Konjunktiv II', selected.verbForms.konjunktiv],
                    ['Hilfsverb', selected.verbForms.helper],
                  ] as const
                ).map(([label, v]) => (
                  <div key={label} className="flex justify-between items-center p-3.5 rounded-2xl glass-subtle">
                    <span className="text-xs text-[var(--color-ink-faint)]">{label}</span>
                    <span className="font-latin font-bold text-sm" dir="ltr">
                      {v ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-ink-soft)]">
                فرم‌های صرف برای این فعل ثبت نشده است. در صفحه ویرایش لغت می‌توانید اضافه کنید.
              </p>
            )}
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
