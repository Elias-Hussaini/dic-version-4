import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Volume2, ChevronRight, Trophy } from 'lucide-react';
import { GlassCard, GlassButton, Badge, ProgressRing, EmptyState } from '@/design-system/Glass';
import { useWords, useSrs, useInvalidate } from '@/hooks/useData';
import { srsRepo, practiceRepo } from '@/db/repositories';
import { useTranslate } from '@/hooks/useTranslate';
import { speak } from '@/services/tts';
import { useProgress } from '@/hooks/useProgress';
import type { Word } from '@/types';

/* SRS review session — Leitner intervals identical to legacy. */
export default function SrsPage() {
  const t = useTranslate();
  const { data: words } = useWords();
  const { data: srs, refetch: refetchSrs } = useSrs();
  const invalidate = useInvalidate();
  const progress = useProgress();

  const queue = useMemo(() => {
    if (!words || !srs) return [] as Word[];
    const dueIds = new Set(srsRepo.dueWordIds(srs).map(String));
    return words.filter((w) => dueIds.has(String(w.id)));
  }, [words, srs]);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ correct: 0, wrong: 0 });

  const current = queue[index];

  const answer = async (correct: boolean) => {
    if (!current) return;
    await practiceRepo.record({
      wordId: current.id,
      correct,
      mode: 'srs',
      date: new Date().toISOString(),
    });
    const data = srsRepo.load();
    srsRepo.updateOnAnswer(data, current.id, correct);
    srsRepo.save(data);
    progress.bumpToday();
    setSession((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
    }));
    setRevealed(false);
    setIndex((i) => i + 1);
    void refetchSrs();
    invalidate.practice();
  };

  if (!words || !srs) return null;

  if (queue.length === 0) {
    return (
      <EmptyState
        icon={<Trophy className="size-8 text-[var(--color-success)]" />}
        title="آماده! همه لغات امروز مرور شده‌اند"
        description="لغات جدید اضافه کنید یا در جلسات تمرین شرکت کنید."
        action={
          <Link to="/learn">
            <GlassButton variant="primary">{t('learn.practice')}</GlassButton>
          </Link>
        }
      />
    );
  }

  if (!current) {
    const total = session.correct + session.wrong;
    const acc = total ? Math.round((session.correct / total) * 100) : 0;
    return (
      <GlassCard level="strong" className="text-center py-10 animate-[var(--animate-pop-in)]">
        <ProgressRing value={session.correct} max={total} size={110} stroke={10} label={<span className="text-xl font-extrabold">{acc}%</span>} />
        <h1 className="mt-4 text-lg font-extrabold">{t('practice.result')}</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          {session.correct} درست · {session.wrong} نادرست
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <Link to="/learn">
            <GlassButton variant="primary">{t('practice.finish')}</GlassButton>
          </Link>
          <Link to="/stats">
            <GlassButton variant="secondary">{t('stats.title')}</GlassButton>
          </Link>
        </div>
      </GlassCard>
    );
  }

  const pct = ((index + 1) / queue.length) * 100;

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      {/* progress */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <h1 className="text-lg font-extrabold">{t('learn.srs')}</h1>
        <Badge tone="accent">
          {index + 1} / {queue.length}
        </Badge>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-glass-secondary)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-accent-2))] transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        >
          <GlassCard level="strong" className="text-center py-10 min-h-64 flex flex-col justify-center">
            <div className="flex justify-center gap-2 mb-3">
              {current.gender && <Badge tone="accent">{current.gender}</Badge>}
              {current.type && current.type !== 'other' && (
                <Badge tone="neutral" className="uppercase">
                  {current.type}
                </Badge>
              )}
            </div>
            <button
              onClick={() => speak(current.german)}
              className="mx-auto group"
              aria-label={t('word.speak')}
            >
              <h2 className="text-3xl font-extrabold font-latin text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors" dir="ltr">
                {current.german}
              </h2>
            </button>
            <AnimatePresence>
              {revealed ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-2"
                >
                  <p className="text-xl font-bold text-[var(--color-accent)]">{current.persian}</p>
                  {current.examples?.[0] && (
                    <p className="text-sm font-latin text-[var(--color-ink-soft)]" dir="ltr">
                      {current.examples[0]?.german}
                    </p>
                  )}
                </motion.div>
              ) : (
                <button onClick={() => setRevealed(true)} className="mt-6">
                  <GlassButton variant="secondary">
                    <ChevronRight className="size-4 flip-rtl" /> {t('practice.showAnswer')}
                  </GlassButton>
                </button>
              )}
            </AnimatePresence>
            <GlassButton variant="ghost" size="icon" className="mx-auto mt-4" onClick={() => speak(current.german)} aria-label={t('word.speak')}>
              <Volume2 className="size-5" />
            </GlassButton>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* grading */}
      {revealed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
          <GlassButton variant="primary" size="lg" onClick={() => answer(true)}>
            <Check className="size-5" /> {t('practice.correct')}
          </GlassButton>
          <GlassButton variant="destructive" size="lg" onClick={() => answer(false)}>
            <X className="size-5" /> {t('practice.wrong')}
          </GlassButton>
        </motion.div>
      )}
    </div>
  );
}
