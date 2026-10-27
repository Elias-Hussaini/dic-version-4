import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Layers, Play, BookOpenText, Scale, Mic, GraduationCap, Flame } from 'lucide-react';
import { GlassCard, Badge, ProgressRing } from '@/design-system/Glass';
import { useSrs } from '@/hooks/useData';
import { srsRepo } from '@/db/repositories';
import { useTranslate } from '@/hooks/useTranslate';

export default function LearnHub() {
  const t = useTranslate();
  const { data: srs } = useSrs();
  const due = srs ? srsRepo.dueWordIds(srs).length : 0;
  const total = srs ? Object.keys(srs).length : 0;
  const mastered = srs
    ? Object.values(srs).filter((e) => e.level >= 4).length
    : 0;

  const modes = [
    { to: '/learn/srs', icon: Layers, title: t('learn.srs'), desc: t('learn.srsDesc'), badge: due > 0 ? `${due}` : undefined },
    { to: '/learn/practice/gender', icon: Scale, title: t('practice.gender'), desc: 'der / die / das' },
    { to: '/learn/practice/writing', icon: GraduationCap, title: t('practice.writing'), desc: 'Deutsch → Persisch' },
    { to: '/learn/practice/listening', icon: Play, title: t('practice.listening'), desc: 'Audio → Wort' },
    { to: '/learn/practice/flashcard', icon: BookOpenText, title: t('practice.flashcard'), desc: 'Karteikarten' },
    { to: '/learn/practice/translation', icon: Flame, title: t('practice.translation'), desc: 'Persisch → Deutsch' },
    { to: '/learn/verbs', icon: BookOpenText, title: t('learn.verbs'), desc: 'Konjugation' },
    { to: '/learn/prepositions', icon: Scale, title: t('learn.prepositions'), desc: 'Akkusativ · Dativ · Wechsel · Genitiv' },
    { to: '/learn/speaking', icon: Mic, title: t('learn.speaking'), desc: 'Aussprache' },
  ];

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <div className="flex items-center justify-between gap-4 pt-1">
        <h1 className="text-xl font-extrabold">{t('learn.title')}</h1>
        {total > 0 && (
          <GlassCard level="subtle" pad="sm" className="flex items-center gap-3">
            <ProgressRing value={mastered} max={total} size={48} stroke={5} label={<span className="text-[10px]">{Math.round((mastered / total) * 100)}%</span>} />
            <div className="text-start">
              <div className="text-xs font-bold">{mastered}/{total}</div>
              <div className="text-[10px] text-[var(--color-ink-faint)]">تسلط یافته</div>
            </div>
          </GlassCard>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {modes.map((mode, i) => (
          <motion.div key={mode.to} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to={mode.to}>
              <GlassCard className="flex items-center gap-4 h-full hover:brightness-105 transition-[filter] group">
                <span className="grid place-items-center size-12 rounded-2xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent)_16%,transparent),color-mix(in_srgb,var(--color-accent-2)_16%,transparent))] text-[var(--color-accent)] shrink-0">
                  <mode.icon className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[var(--color-ink)]">{mode.title}</h2>
                    {mode.badge && <Badge tone="accent">{mode.badge}</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-faint)] truncate">{mode.desc}</p>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
