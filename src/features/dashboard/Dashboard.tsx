import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Plus, Play, MessageCircle, Flame, BookOpen, ArrowLeft, Volume2,
  Search, Star, TrendingUp, Target, Sparkles, Zap, GraduationCap, Trophy,
} from 'lucide-react';
import { GlassCard, GlassButton, Badge, ProgressRing, Skeleton, EmptyState, IconTile } from '@/design-system/Glass';
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
        <Skeleton className="h-40 rounded-3xl" />
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
        icon={<BookOpen />}
        title={t('library.empty.title')}
        description={t('library.empty.desc')}
        action={
          <Link to="/add">
            <GlassButton variant="primary" size="lg">
              <Plus className="size-5" /> {t('dashboard.quickAdd')}
            </GlassButton>
          </Link>
        }
      />
    );
  }

  const goalPct = Math.min(1, progress.todayDone / goal);

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      {/* ═══ Hero panel — deep gradient banner ═══ */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="hero-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center size-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
                  <Sparkles className="size-4.5 text-white" />
                </span>
                <span className="text-xs font-semibold text-white/70 tracking-wide">LINGO</span>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold text-white leading-tight">
                {t('dashboard.hello')} 👋
              </h1>
              <p className="mt-1 text-sm text-white/70">{t('app.tagline')}</p>

              {/* streak + due chips */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/12 border border-white/20 backdrop-blur-sm text-xs font-bold text-white">
                  <Flame className="size-3.5 text-amber-300" />
                  {progress.streak} {t('dashboard.streak')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/12 border border-white/20 backdrop-blur-sm text-xs font-bold text-white">
                  <Zap className="size-3.5 text-fuchsia-300" />
                  {due} {t('dashboard.dueForReviewDesc')}
                </span>
              </div>
            </div>

            {/* goal ring on gradient */}
            <div className="shrink-0 flex flex-col items-center gap-1.5">
              <ProgressRing
                value={progress.todayDone}
                max={goal}
                size={84}
                stroke={8}
                bright
                trackColor="rgba(255,255,255,0.18)"
                label={
                  <span className="text-sm font-extrabold text-white">
                    {progress.todayDone}
                    <span className="text-[10px] font-semibold text-white/60">/{goal}</span>
                  </span>
                }
              />
              <span className="text-[10px] font-semibold text-white/60">{t('dashboard.goal')}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ Continue learning — due for review ═══ */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
        <Link to="/learn/srs" aria-label={t('dashboard.startReview')} className="block group">
          <GlassCard className="flex items-center justify-between gap-4 cursor-pointer group-hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-center gap-4 min-w-0">
              <IconTile tone="indigo" size="lg">
                <BookOpen className="size-7" />
              </IconTile>
              <div className="min-w-0">
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

      {/* ═══ Stats grid — colorful gradient tiles ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<TrendingUp className="size-5" />} tone="violet" label={t('dashboard.wordsLearned')} value={weekWords} />
        <StatCard icon={<Target className="size-5" />} tone="emerald" label={t('dashboard.accuracy')} value={`${accuracy}%`} />
        <StatCard icon={<GraduationCap className="size-5" />} tone="cyan" label={t('common.words')} value={words.length} />
        <StatCard icon={<Trophy className="size-5" />} tone="sunset" label={t('practice.result')} value={practice?.length ?? 0} />
      </div>

      {/* ═══ Word of the day — gradient hero card ═══ */}
      {wordOfDay && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="relative rounded-3xl overflow-hidden">
            {/* soft gradient wash behind the card */}
            <div aria-hidden className="absolute inset-0 grad-violet opacity-[0.16]" />
            <div aria-hidden className="absolute inset-0 glass" />
            <div className="relative p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <Badge tone="violet" filled className="gap-1.5">
                  <Sparkles className="size-3" /> {t('dashboard.wordOfDay')}
                </Badge>
                <Link to={`/word/${wordOfDay.id}`} className="text-xs font-bold text-[var(--color-accent)] hover:underline">
                  {t('dashboard.viewAll')}
                </Link>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-2xl font-extrabold font-latin text-[var(--color-ink)] truncate" dir="ltr">
                    {wordOfDay.gender ? (
                      <GenderChip gender={wordOfDay.gender} className="me-2 align-middle" />
                    ) : null}
                    {wordOfDay.german}
                  </div>
                  <div className="mt-1.5 text-sm text-[var(--color-ink-soft)]">{wordOfDay.persian}</div>
                </div>
                <GlassButton variant="ghost" size="icon" onClick={() => speak(wordOfDay.german)} aria-label={t('word.speak')}>
                  <Volume2 className="size-5" />
                </GlassButton>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ Quick actions — six colorful tiles ═══ */}
      <div className="grid grid-cols-3 gap-3">
        <QuickAction to="/add" icon={<Plus />} tone="indigo" label={t('dashboard.quickAdd')} />
        <QuickAction to="/learn" icon={<Play />} tone="violet" label={t('dashboard.quickPractice')} />
        <QuickAction to="/search" icon={<Search />} tone="cyan" label={t('common.search')} />
        <QuickAction to="/tutor" icon={<MessageCircle />} tone="pink" label={t('dashboard.quickTutor')} />
        <QuickAction to="/favorites" icon={<Star />} tone="gold" label={t('favorites.title')} />
        <QuickAction to="/stats" icon={<TrendingUp />} tone="emerald" label={t('stats.title')} />
      </div>

      {/* ═══ Activity heatmap ═══ */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[var(--color-ink)]">{t('dashboard.activity')}</h2>
          <span className="flex items-center gap-1 text-[10px] text-[var(--color-ink-faint)]">
            <span className="size-2.5 rounded-[3px] grad-indigo" /> کم
            <span className="ms-1 size-2.5 rounded-[3px] grad-blue" /> زیاد
          </span>
        </div>
        <div className="flex flex-wrap gap-[3px]" dir="ltr">
          {heatmap.map((count, i) => (
            <div
              key={i}
              title={count > 0 ? `${count} تمرین` : undefined}
              className="size-3 rounded-[3px] transition-transform hover:scale-125"
              style={{
                background:
                  count === 0
                    ? 'var(--color-glass-secondary)'
                    : count <= 2
                      ? 'linear-gradient(135deg,#a5b4fc,#818cf8)'
                      : count <= 5
                        ? 'var(--grad-indigo)'
                        : 'var(--grad-blue)',
              }}
            />
          ))}
        </div>
      </GlassCard>

      {/* ═══ Recent words ═══ */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[var(--color-ink)]">{t('dashboard.recentWords')}</h2>
          <Link to="/library" className="text-xs font-bold text-[var(--color-accent)] hover:underline">
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
              <span className="font-latin font-bold text-[var(--color-ink)] truncate" dir="ltr">
                {w.gender ? <GenderChip gender={w.gender} className="me-2 align-middle" /> : null}
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

function GenderChip({ gender, className }: { gender: string; className?: string }) {
  const cls = gender === 'der' ? 'gender-der' : gender === 'die' ? 'gender-die' : gender === 'das' ? 'gender-das' : '';
  if (!cls) return null;
  return <span className={`gender-chip ${cls} ${className ?? ''}`}>{gender}</span>;
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: 'indigo' | 'violet' | 'emerald' | 'cyan' | 'sunset' | 'pink';
}) {
  const colorVar =
    tone === 'violet'
      ? 'var(--color-accent-2)'
      : tone === 'emerald'
        ? 'var(--color-success)'
        : tone === 'cyan'
          ? 'var(--color-info)'
          : tone === 'sunset'
            ? 'var(--color-warning)'
            : 'var(--color-accent)';
  return (
    <GlassCard level="subtle" pad="sm" className="flex items-center gap-3">
      <IconTile tone={tone} size="sm">
        {icon}
      </IconTile>
      <div className="min-w-0">
        <div className="text-xl font-extrabold" style={{ color: colorVar }}>
          {value}
        </div>
        <div className="text-[10px] text-[var(--color-ink-faint)] truncate">{label}</div>
      </div>
    </GlassCard>
  );
}

function QuickAction({
  to,
  icon,
  label,
  tone,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  tone: 'indigo' | 'violet' | 'cyan' | 'pink' | 'gold' | 'emerald';
}) {
  return (
    <Link to={to} className="group">
      <GlassCard
        level="subtle"
        className="flex flex-col items-center gap-2.5 py-5 group-active:scale-[0.97] group-hover:-translate-y-0.5 transition-[transform,filter] hover:brightness-105"
      >
        <IconTile tone={tone} size="md">
          {icon}
        </IconTile>
        <span className="text-xs font-bold text-[var(--color-ink-soft)]">{label}</span>
      </GlassCard>
    </Link>
  );
}
