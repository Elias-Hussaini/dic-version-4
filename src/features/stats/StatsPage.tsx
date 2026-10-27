import { useMemo } from 'react';
import { BarChart3, TrendingUp, Target } from 'lucide-react';
import { GlassCard, Badge, ProgressRing, EmptyState } from '@/design-system/Glass';
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
    return <EmptyState icon={<BarChart3 className="size-8" />} title={t('stats.title')} description="با افزودن لغت و تمرین، آمار شما اینجا نمایش داده می‌شود." />;
  }

  const maxDay = Math.max(1, ...byDay.map((d) => d.total));
  const maxForecast = Math.max(1, ...forecast.map((f) => f.count));

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <h1 className="text-xl font-extrabold pt-1">{t('stats.title')}</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label={t('common.words')} value={words.length} />
        <Kpi label={t('practice.result')} value={practice?.length ?? 0} />
        <Kpi label={t('dashboard.streak')} value={progress.streak} />
        <Kpi label={t('practice.accuracy')} value={`${totalAcc}%`} />
      </div>

      {/* Retention + goal */}
      <GlassCard className="flex items-center justify-around gap-4 flex-wrap">
        <div className="text-center">
          <ProgressRing value={retention} max={100} size={80} label={<span className="text-sm font-bold">{retention}%</span>} />
          <div className="mt-2 text-xs text-[var(--color-ink-faint)]">نرخ ماندگاری</div>
        </div>
        <div className="text-center">
          <ProgressRing value={progress.todayDone} max={10} size={80} label={<span className="text-sm font-bold">{progress.todayDone}</span>} />
          <div className="mt-2 text-xs text-[var(--color-ink-faint)]">{t('dashboard.goal')}</div>
        </div>
        <div className="text-center">
          <ProgressRing value={progress.longest} max={Math.max(30, progress.longest)} size={80} label={<span className="text-sm font-bold">{progress.longest}</span>} />
          <div className="mt-2 text-xs text-[var(--color-ink-faint)]">بهترین رکورد</div>
        </div>
      </GlassCard>

      {/* Activity bars */}
      {byDay.length > 0 && (
        <GlassCard>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-[var(--color-accent)]" /> فعالیت ۳۰ روز اخیر
          </h2>
          <div className="flex items-end gap-1 h-32" dir="ltr">
            {byDay.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col justify-end group" title={`${d.day}: ${d.total} تمرین`}>
                <div
                  className="rounded-t-md bg-[linear-gradient(180deg,var(--color-accent),var(--color-accent-2))] opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ height: `${(d.total / maxDay) * 100}%`, minHeight: 3 }}
                />
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Forecast */}
      {forecast.length > 0 && (
        <GlassCard>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Target className="size-4 text-[var(--color-accent)]" /> پیش‌بینی مرور ۱۴ روز آینده
          </h2>
          <div className="flex items-end gap-1 h-24" dir="ltr">
            {forecast.map((f) => (
              <div key={f.day} className="flex-1 flex flex-col justify-end" title={`${f.day}: ${f.count} مرور`}>
                <div
                  className="rounded-t-md bg-[color-mix(in_srgb,var(--color-accent)_60%,transparent)]"
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
            <Target className="size-4 text-[var(--color-danger)]" /> لغات چسبنده (نیاز به تمرین بیشتر)
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
                  <Badge tone="danger">
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

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <GlassCard level="subtle" pad="sm" className="text-center">
      <div className="text-2xl font-extrabold text-[var(--color-accent)]">{value}</div>
      <div className="mt-1 text-[11px] text-[var(--color-ink-faint)]">{label}</div>
    </GlassCard>
  );
}
