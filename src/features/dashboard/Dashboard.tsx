import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Play, MessageCircle, Flame, BookOpen, ArrowLeft, Volume2 } from 'lucide-react';
import { GlassCard, GlassButton, Badge, ProgressRing, Skeleton, EmptyState } from '@/design-system/Glass';
import { useWords, useSrs, usePracticeHistory } from '@/hooks/useData';
import { useProgress } from '@/hooks/useProgress';
import { useSettings } from '@/hooks/useSettings';
import { useTranslate } from '@/hooks/useTranslate';
import { srsRepo } from '@/db/repositories';
import { speak } from '@/services/tts';
import type { Word } from '@/types';

export default function Dashboard() {
  const t = useTranslate();
  const { data: words, isLoading } = useWords();
  const { data: srs } = useSrs();
  const { data: practice } = usePracticeHistory();
  const goal = useSettings((s) => s.dailyGoal);
  const progress = useProgress();
  progress.checkIn();

  const due = useMemo(() => (srs ? srsRepo.dueWordIds(srs).length : 0), [srs]);

  const weekWords = useMemo(() => {
    if (!words) return 0;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return words.filter((w) => w.createdAt >= cutoff.toISOString()).length;
  }, [words]);

  const accuracy = useMemo(() => {
    if (!practice?.length) return 0;
    const recent = practice.slice(-200);
    const correct = recent.filter((p) => p.correct).length;
    return Math.round((correct / recent.length) * 100);
  }, [practice]);

  const wordOfDay = useMemo<Word | undefined>(() => {
    if (!words?.length) return undefined;
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    return words[dayIndex % words.length];
  }, [words]);

  const heatmap = useMemo(() => {
    if (!practice?.length) return Array.from({ length: 84 }, () => 0);
    const days = new Map<string, number>();
    for (const p of practice) {
      const d = p.date.slice(0, 10);
      days.set(d, (days.get(d) ?? 0) + 1);
    }
    return Array.from({ length: 84 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (83 - i));
      return days.get(d.toISOString().slice(0, 10)) ?? 0;
    });
  }, [practice]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-36" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!words?.length) {
    return (
      <EmptyState
        icon={<BookOpen className="size-8" />}
        title={t('library.empty.title')}
        description={t('library.empty.desc')}
        action={
          <Link to="/add">
            <GlassButton variant="primary">
              <Plus className="size-4" /> {t('dashboard.quickAdd')}
            </GlassButton>
          </Link>
        }
      />
    );
  }

  const goalPct = Math.min(1, progress.todayDone / goal);

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      {/* Greeting + goal ring */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-ink)]">{t('dashboard.hello')} 👋</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{t('app.tagline')}</p>
        </div>
        <GlassCard level="subtle" pad="sm" className="flex items-center gap-3">
          <ProgressRing
            value={progress.todayDone}
            max={goal}
            size={56}
            label={
              <span className="text-xs">
                {progress.todayDone}/{goal}
              </span>
            }
          />
          <div className="text-start">
            <div className="text-xs text-[var(--color-ink-faint)]">{t('dashboard.goal')}</div>
            <div className="flex items-center gap-1 text-sm font-bold text-[var(--color-ink)]">
              <Flame className="size-4 text-[var(--color-warning)]" />
              {progress.streak} {t('dashboard.streak')}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Due for review */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/learn/srs" aria-label={t('dashboard.startReview')}>
          <GlassCard className="flex items-center justify-between gap-4 group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="grid place-items-center size-14 rounded-2xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent)_18%,transparent),color-mix(in_srgb,var(--color-accent-2)_18%,transparent))]">
                <BookOpen className="size-7 text-[var(--color-accent)]" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-[var(--color-ink)]">
                  {due} <span className="text-sm font-semibold">{t('dashboard.dueForReviewDesc')}</span>
                </div>
                <div className="text-xs text-[var(--color-ink-faint)]">{t('learn.srs')}</div>
              </div>
            </div>
            <GlassButton variant="primary" size="sm" tabIndex={-1}>
              {t('dashboard.startReview')} <ArrowLeft className="size-4 flip-rtl" />
            </GlassButton>
          </GlassCard>
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label={t('dashboard.wordsLearned')} value={weekWords} tone="accent" />
        <StatCard label={t('dashboard.accuracy')} value={`${accuracy}%`} tone="success" />
        <StatCard label={t('common.words')} value={words.length} tone="info" />
        <StatCard label={t('practice.result')} value={practice?.length ?? 0} tone="warning" />
      </div>

      {/* Word of the day */}
      {wordOfDay && (
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <Badge tone="accent">{t('dashboard.wordOfDay')}</Badge>
            <Link to={`/word/${wordOfDay.id}`} className="text-xs text-[var(--color-accent)] hover:underline">
              {t('dashboard.viewAll')}
            </Link>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-2xl font-extrabold font-latin text-[var(--color-ink)]" dir="ltr">
                {wordOfDay.gender ? `${wordOfDay.gender} ` : ''}
                {wordOfDay.german}
              </div>
              <div className="mt-1 text-sm text-[var(--color-ink-soft)]">{wordOfDay.persian}</div>
            </div>
            <GlassButton variant="ghost" size="icon" onClick={() => speak(wordOfDay.german)} aria-label={t('word.speak')}>
              <Volume2 className="size-5" />
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <QuickAction to="/add" icon={<Plus className="size-5" />} label={t('dashboard.quickAdd')} primary />
        <QuickAction to="/learn" icon={<Play className="size-5" />} label={t('dashboard.quickPractice')} />
        <QuickAction to="/tutor" icon={<MessageCircle className="size-5" />} label={t('dashboard.quickTutor')} />
      </div>

      {/* Activity heatmap */}
      <GlassCard>
        <h2 className="text-sm font-bold mb-3 text-[var(--color-ink)]">{t('dashboard.activity')}</h2>
        <div className="flex flex-wrap gap-[3px]" dir="ltr">
          {heatmap.map((count, i) => (
            <div
              key={i}
              title={count > 0 ? `${count} تمرین` : undefined}
              className="size-3 rounded-[3px]"
              style={{
                background:
                  count === 0
                    ? 'var(--color-glass-secondary)'
                    : `color-mix(in srgb, var(--color-accent) ${Math.min(100, 25 + count * 18)}%, var(--color-glass-secondary))`,
              }}
            />
          ))}
        </div>
      </GlassCard>

      {/* Recent words */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[var(--color-ink)]">{t('dashboard.recentWords')}</h2>
          <Link to="/library" className="text-xs text-[var(--color-accent)] hover:underline">
            {t('dashboard.viewAll')}
          </Link>
        </div>
        <div className="space-y-2">
          {words.slice(0, 5).map((w) => (
            <Link
              key={w.id}
              to={`/word/${w.id}`}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl glass-subtle hover:brightness-105 transition-[filter]"
            >
              <span className="font-latin font-bold text-[var(--color-ink)]" dir="ltr">
                {w.gender ? `${w.gender} ` : ''}
                {w.german}
              </span>
              <span className="text-sm text-[var(--color-ink-soft)] truncate">{w.persian}</span>
            </Link>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string | number; tone: 'accent' | 'success' | 'info' | 'warning' }) {
  const colorVar =
    tone === 'accent' ? 'var(--color-accent)' : tone === 'success' ? 'var(--color-success)' : tone === 'info' ? 'var(--color-info)' : 'var(--color-warning)';
  return (
    <GlassCard level="subtle" pad="sm">
      <div className="text-2xl font-extrabold text-[var(--color-ink)]">{value}</div>
      <div className="mt-1 text-[11px] text-[var(--color-ink-faint)]">{label}</div>
      <div className="mt-2 h-1 rounded-full w-2/3" style={{ background: `color-mix(in srgb, ${colorVar} 60%, transparent)` }} />
    </GlassCard>
  );
}

function QuickAction({ to, icon, label, primary }: { to: string; icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <Link to={to} className="group">
      <GlassCard
        level={primary ? 'default' : 'subtle'}
        className="flex flex-col items-center gap-2 py-5 group-active:scale-[0.97] transition-transform"
      >
        <span
          className={
            primary
              ? 'grid place-items-center size-10 rounded-2xl text-white bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))]'
              : 'grid place-items-center size-10 rounded-2xl glass-subtle text-[var(--color-accent)]'
          }
        >
          {icon}
        </span>
        <span className="text-xs font-semibold text-[var(--color-ink-soft)]">{label}</span>
      </GlassCard>
    </Link>
  );
}
