import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Layers, Play, BookOpenText, Scale, Mic, GraduationCap, Flame, Sparkles } from 'lucide-react';
import { GlassCard, Badge, ProgressRing, IconTile } from '@/design-system/Glass';
import { useSrs } from '@/hooks/useData';
import { srsRepo } from '@/db/repositories';
import { useTranslate } from '@/hooks/useTranslate';
import type { TileTone } from '@/design-system/Glass';

export default function LearnHub() {
  const t = useTranslate();
  const { data: srs } = useSrs();
  const due = srs ? srsRepo.dueWordIds(srs).length : 0;
  const total = srs ? Object.keys(srs).length : 0;
  const mastered = srs
    ? Object.values(srs).filter((e) => e.level >= 4).length
    : 0;

  const modes: { to: string; icon: typeof Layers; title: string; desc: string; tone: TileTone; badge?: string }[] = [
    { to: '/learn/srs', icon: Layers, title: t('learn.srs'), desc: t('learn.srsDesc'), tone: 'indigo', badge: due > 0 ? `${due}` : undefined },
    { to: '/learn/practice/gender', icon: Scale, title: t('practice.gender'), desc: 'der / die / das', tone: 'blue' },
    { to: '/learn/practice/writing', icon: GraduationCap, title: t('practice.writing'), desc: 'Deutsch → Persisch', tone: 'violet' },
    { to: '/learn/practice/listening', icon: Play, title: t('practice.listening'), desc: 'Audio → Wort', tone: 'cyan' },
    { to: '/learn/practice/flashcard', icon: BookOpenText, title: t('practice.flashcard'), desc: 'Karteikarten', tone: 'pink' },
    { to: '/learn/practice/translation', icon: Flame, title: t('practice.translation'), desc: 'Persisch → Deutsch', tone: 'sunset' },
    { to: '/learn/verbs', icon: BookOpenText, title: t('learn.verbs'), desc: 'Konjugation', tone: 'emerald' },
    { to: '/learn/prepositions', icon: Scale, title: t('learn.prepositions'), desc: 'Akkusativ · Dativ · Wechsel · Genitiv', tone: 'gold' },
    { to: '/learn/speaking', icon: Mic, title: t('learn.speaking'), desc: 'Aussprache', tone: 'rose' },
  ];

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      {/* Gradient page header + mastery ring */}
      <div className="hero-panel p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid place-items-center size-11 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
              <GraduationCap className="size-5.5 text-white" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-white">{t('learn.title')}</h1>
              {total > 0 && (
                <p className="text-xs text-white/65">
                  {mastered}/{total} تسلط یافته
                </p>
              )}
            </div>
          </div>
          {total > 0 && (
            <ProgressRing
              value={mastered}
              max={total}
              size={64}
              stroke={7}
              trackColor="rgba(255,255,255,0.18)"
              label={
                <span className="text-xs font-extrabold text-white">
                  {Math.round((mastered / total) * 100)}%
                </span>
              }
            />
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {modes.map((mode, i) => (
          <motion.div key={mode.to} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to={mode.to} className="group">
              <GlassCard className="flex items-center gap-4 h-full group-hover:-translate-y-0.5 group-hover:brightness-105 transition-[transform,filter]">
                <IconTile tone={mode.tone} size="lg">
                  <mode.icon className="size-6" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[var(--color-ink)]">{mode.title}</h2>
                    {mode.badge && (
                      <Badge tone="accent" filled>
                        {mode.badge}
                      </Badge>
                    )}
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
