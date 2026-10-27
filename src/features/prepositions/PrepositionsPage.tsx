import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, Search } from 'lucide-react';
import { GlassCard, GlassInput, Badge, GlassButton } from '@/design-system/Glass';
import { PREPOSITIONS_DB, type PrepositionEntry } from '@/lib/prepositionsData';
import { useTranslate } from '@/hooks/useTranslate';
import { speak } from '@/services/tts';

type CaseFilter = 'all' | 'Akkusativ' | 'Dativ' | 'Wechsel' | 'Genitiv';

const CASE_TONE: Record<string, 'accent' | 'danger' | 'success' | 'warning' | 'neutral'> = {
  Akkusativ: 'accent',
  Dativ: 'danger',
  Wechsel: 'warning',
  Genitiv: 'success',
};

export default function PrepositionsPage() {
  const t = useTranslate();
  const [filter, setFilter] = useState<CaseFilter>('all');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    let out: PrepositionEntry[] = PREPOSITIONS_DB;
    if (filter !== 'all') out = out.filter((p) => p.case === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (p) => p.preposition.includes(q) || p.meaning.includes(q),
      );
    }
    return out;
  }, [filter, query]);

  const filters: Array<{ id: CaseFilter; label: string }> = [
    { id: 'all', label: t('common.all') },
    { id: 'Akkusativ', label: 'Akkusativ' },
    { id: 'Dativ', label: 'Dativ' },
    { id: 'Wechsel', label: 'Wechsel' },
    { id: 'Genitiv', label: 'Genitiv' },
  ];

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <h1 className="text-xl font-extrabold pt-1">{t('learn.prepositions')}</h1>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {filters.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 h-9 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-white'
                : 'glass-subtle text-[var(--color-ink-soft)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <GlassInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('common.search')}
        dir="auto"
        aria-label={t('common.search')}
      />

      <div className="space-y-2">
        {list.map((p, i) => (
          <motion.div key={p.preposition} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
            <GlassCard level="subtle" className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg font-extrabold font-latin text-[var(--color-ink)]" dir="ltr">
                    {p.preposition}
                  </span>
                  <Badge tone={CASE_TONE[p.case] ?? 'neutral'}>{p.case}</Badge>
                  <Badge tone="neutral">{p.level}</Badge>
                </div>
                <GlassButton variant="ghost" size="icon" onClick={() => speak(`${p.preposition}. ${p.example}`)} aria-label={t('word.speak')}>
                  <Volume2 className="size-4" />
                </GlassButton>
              </div>
              <p className="text-sm text-[var(--color-ink-soft)]">{p.meaning}</p>
              <div className="pt-1 space-y-1">
                <p className="text-sm font-latin leading-6 text-[var(--color-ink)]" dir="ltr">
                  {p.example}
                </p>
                <p className="text-xs text-[var(--color-ink-faint)]">{p.exampleTrans}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
