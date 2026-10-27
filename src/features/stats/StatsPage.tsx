import { useMemo } from 'react';
import { BarChart3, TrendingUp, GraduationCap, Trophy, Flame, Zap, CalendarClock, AlertTriangle } from 'lucide-react';
import { GlassCard, Badge, ProgressRing, EmptyState, IconTile } from '@/design-system/Glass';
import { usePracticeHistory, useSrs, useWords } from '@/hooks/useData';
import { srsRepo } from '@/db/repositories';
import { useProgress } from '@/hooks/useProgress';
import { useTranslate } from '@/hooks/useTranslate';

export default function StatsPage() {
  const t = useTranslate();
  const { data: words } = useWords();
  const { data: practice } = usePracticeHistory();
  const { data: srs } = useSrs();
  const progress = useProgress();

  const byDay = useMemo(() => {
    if (!practice) return [] as Array<{ day: string; total: number; correct: number }>;
    const map = new Map<string, { total: number; correct: number }>();
    for (const p of practice) {
      const d = p.date.slice(0, 10);
      const cur = map.get(d) ?? { total: 0, correct: 0 };
      cur.total++;
      if (p.correct) cur.correct++;
      map.set(d, cur);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([day, v]) => ({ day, ...v }));
  }, [practice]);

  const byMode = useMemo(() => {
    if (!practice) return [] as Array<{ mode: string; count: number; acc: number }>;
    const map = new Map<string, { count: number; correct: number }>();
    for (const p of practice) {
      const cur = map.get(p.mode) ?? { count: 0, correct: 0 };
      cur.count++;
      if (p.correct) cur.correct++;
      map.set(p.mode, cur);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([mode, v]) => ({ mode, count: v.count, acc: Math.round((v.correct / v.count) * 100) }));
  }, [practice]);

  const forecast = useMemo(() => (srs ? srsRepo.forecast(srs, 14) : []), [srs]);
  const retention = useMemo(() => (srs ? srsRepo.retention(srs) : 0), [srs]);
  const leeches = useMemo(() => (srs ? srsRepo.leeches(srs) : []), [srs]);

  const totalAcc = useMemo(() => {
    if (!practice?.length) return 0;
    return Math.round((practice.filter((p) => p.correct).length / practice.length) * 100);
  }, [practice]);

  if (!words?.length) {
    return <EmptyState icon={<BarChart3 />} title={t('stats.title')} description="با افزودن لغت و تمرین، آمار شما اینجا نمایش داده می‌شود." tone="violet" />;
  }

  const maxDay = Math.max(1, ...byDay.map((d) => d.total));
  const maxForecast = Math.max(1, ...forecast.map((f) => f.count));

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      {/* Gradient page header */}
      <div className="hero-panel p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center size-11 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
            <BarChart3 className="size-5.5 text-white" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-white">{t('stats.title')}</h1>
            <p className="text-xs text-white/65">تحلیل پیشرفت یادگیری شما</p>
          </div>
        </div>
      </div>

      {/* KPIs — colorful gradient tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi icon={<GraduationCap className="size-5" />} tone="violet" label={t('common.words')} value={words.length} />
        <Kpi icon={<Zap className="size-5" />} tone="cyan" label={t('practice.result')} value={practice?.length ?? 0} />
        <Kpi icon={<Flame className="size-5" />} tone="sunset" label={t('dashboard.streak')} value={progress.streak} />
        <Kpi icon={<Trophy className="size-5" />} tone="emerald" label={t('practice.accuracy')} value={`${totalAcc}%`} />
      </div>

      {/* Retention + goal — gradient hero strip */}
      <GlassCard className="flex items-center justify-around gap-4 flex-wrap">
        <div className="text-center">
          <ProgressRing value={retention} max={100} size={84} stroke={8} label={<span className="text-sm font-extrabold grad-text">{retention}%</span>} />
          <div className="mt-2 text-xs font-semibold text-[var(--color-ink-soft)]">نرخ ماندگاری</div>
        </div>
        <div className="text-center">
          <ProgressRing value={progress.todayDone} max={10} size={84} stroke={8} label={<span className="text-sm font-extrabold grad-text">{progress.todayDone}</span>} />
          <div className="mt-2 text-xs font-semibold text-[var(--color-ink-soft)]">{t('dashboard.goal')}</div>
        </div>
        <div className="text-center">
          <ProgressRing value={progress.longest} max={Math.max(30, progress.longest)} size={84} stroke={8} label={<span className="text-sm font-extrabold grad-text">{progress.longest}</span>} />
          <div className="mt-2 text-xs font-semibold text-[var(--color-ink-soft)]">بهترین رکورد</div>
        </div>
      </GlassCard>

      {/* Activity bars — indigo→violet gradient columns */}
      {byDay.length > 0 && (
        <GlassCard>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <span className="icon-tile icon-tile--indigo size-7 rounded-lg"><TrendingUp className="size-4" /></span>
            فعالیت ۳۰ روز اخیر
          </h2>
          <div className="flex items-end gap-1 h-32" dir="ltr">
            {byDay.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col justify-end group" title={`${d.day}: ${d.total} تمرین`}>
                <div
                  className="rounded-t-md grad-indigo opacity-85 group-hover:opacity-100 group-hover:scale-x-110 transition-all origin-bottom"
                  style={{ height: `${(d.total / maxDay) * 100}%`, minHeight: 3 }}
                />
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Forecast — warm sunset gradient */}
      {forecast.length > 0 && (
        <GlassCard>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <span className="icon-tile icon-tile--sunset size-7 rounded-lg"><CalendarClock className="size-4" /></span>
            پیش‌بینی مرور ۱۴ روز آینده
          </h2>
          <div className="flex items-end gap-1 h-24" dir="ltr">
            {forecast.map((f) => (
              <div key={f.day} className="flex-1 flex flex-col justify-end" title={`${f.day}: ${f.count} مرور`}>
                <div
                  className="rounded-t-md grad-sunset"
                  style={{ height: `${(f.count / maxForecast) * 100}%`, minHeight: f.count > 0 ? 3 : 1 }}
                />
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* By mode */}
      {byMode.length > 0 && (
        <GlassCard>
          <h2 className="text-sm font-bold mb-3">بر اساس نوع تمرین</h2>
          <div className="space-y-2">
            {byMode.map((m) => (
              <div key={m.mode} className="flex items-center gap-3">
                <Badge tone="neutral" className="w-24 justify-center capitalize">
                  {m.mode}
                </Badge>
                <div className="flex-1 h-2 rounded-full bg-[var(--color-glass-secondary)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-accent-2))]"
                    style={{ width: `${m.acc}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[var(--color-ink-soft)] w-12 text-end">{m.acc}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Leeches */}
      {leeches.length > 0 && (
        <GlassCard>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="icon-tile icon-tile--rose size-7 rounded-lg"><AlertTriangle className="size-4" /></span>
            لغات چسبنده (نیاز به تمرین بیشتر)
          </h2>
          <div className="space-y-2">
            {leeches.slice(0, 8).map((l) => {
              const w = words.find((x) => x.id === l.wordId);
              if (!w) return null;
              return (
                <div key={l.wordId} className="flex items-center justify-between p-3 rounded-xl glass-subtle">
                  <span className="font-latin font-semibold text-sm" dir="ltr">
                    {w.german}
                  </span>
                  <Badge tone="danger" filled>
                    {l.entry.totalWrong} خطا · L{l.entry.level}
                  </Badge>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: 'violet' | 'cyan' | 'sunset' | 'emerald';
}) {
  const colorVar =
    tone === 'violet' ? 'var(--color-accent-2)' : tone === 'cyan' ? 'var(--color-info)' : tone === 'emerald' ? 'var(--color-success)' : 'var(--color-warning)';
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
