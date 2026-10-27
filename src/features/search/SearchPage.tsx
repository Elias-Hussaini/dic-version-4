import { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, X, BookOpen, Sparkles } from 'lucide-react';
import { GlassCard, GlassInput, EmptyState, Badge, Skeleton, IconTile } from '@/design-system/Glass';
import { useWords } from '@/hooks/useData';
import { useTranslate } from '@/hooks/useTranslate';
import type { Word } from '@/types';

export default function SearchPage() {
  const t = useTranslate();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const { data: words, isLoading } = useWords();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    if (!words) return [];
    const q = query.trim().toLowerCase();
    if (!q) return words.slice(0, 50);
    return words
      .filter(
        (w) =>
          w.german.toLowerCase().includes(q) ||
          w.persian.toLowerCase().includes(q) ||
          (w.notes ?? '').toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const aStarts = a.german.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.german.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts || a.german.localeCompare(b.german);
      });
  }, [words, query]);

  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 76,
    overscan: 8,
  });

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      {/* Gradient page header */}
      <div className="hero-panel p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center size-11 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
            <Search className="size-5.5 text-white" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-white">{t('common.search')}</h1>
            <p className="text-xs text-white/65">{t('app.tagline')}</p>
          </div>
          <Sparkles className="ms-auto size-5 text-white/40" />
        </div>
      </div>

      <GlassCard className="sticky top-2 z-10">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 size-5 text-[var(--color-accent)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setParams(e.target.value ? { q: e.target.value } : {}, { replace: true });
            }}
            placeholder={t('search.placeholder')}
            dir="auto"
            className="glass-input w-full h-13 ps-12 pe-12 rounded-2xl text-base font-medium placeholder:text-[var(--color-ink-faint)]"
            aria-label={t('common.search')}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setParams({}, { replace: true });
              }}
              aria-label={t('common.close')}
              className="absolute end-4 top-1/2 -translate-y-1/2 grid place-items-center size-7 rounded-full hover:bg-[var(--color-glass-secondary)]"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {query && (
          <div className="mt-2 px-1">
            <Badge tone="accent" filled>{results.length} {t('search.results')}</Badge>
          </div>
        )}
      </GlassCard>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon={<BookOpen />} title={t('search.noResults')} tone="violet" />
      ) : (
        <div ref={listRef} className="virtual-list h-[calc(100dvh-320px)] min-h-72">
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((vItem) => {
              const w = results[vItem.index] as Word;
              return (
                <div
                  key={w.id}
                  ref={virtualizer.measureElement}
                  data-index={vItem.index}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${vItem.start}px)` }}
                >
                  <WordRow word={w} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function WordRow({ word }: { word: Word }) {
  const gender = word.gender;
  const genderCls =
    gender === 'der' ? 'gender-der' : gender === 'die' ? 'gender-die' : gender === 'das' ? 'gender-das' : '';
  return (
    <Link to={`/word/${word.id}`} className="block mb-2">
      <GlassCard level="subtle" pad="sm" className="flex items-center justify-between gap-3 hover:brightness-105 transition-[filter]">
        <div className="min-w-0 flex items-center gap-2.5">
          {genderCls ? (
            <span className={`gender-chip ${genderCls} shrink-0`}>{gender}</span>
          ) : (
            <span className="icon-tile icon-tile--violet size-8 rounded-lg shrink-0">
              <span className="text-[13px] font-latin font-extrabold uppercase">{word.type?.[0] ?? '•'}</span>
            </span>
          )}
          <div className="min-w-0">
            <div className="font-latin font-bold text-[var(--color-ink)] truncate" dir="ltr">
              {word.german}
            </div>
            <div className="mt-0.5 text-sm text-[var(--color-ink-soft)] truncate">{word.persian}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {word.type && word.type !== 'other' && (
            <Badge tone="violet">{word.type}</Badge>
          )}
          {word.plural && (
            <span className="text-[11px] text-[var(--color-ink-faint)] font-latin" dir="ltr">
              Pl. {word.plural}
            </span>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}
