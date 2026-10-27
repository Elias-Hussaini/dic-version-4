import { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, X, BookOpen } from 'lucide-react';
import { GlassCard, GlassInput, EmptyState, Badge, Skeleton } from '@/design-system/Glass';
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
      <h1 className="text-xl font-extrabold pt-1">{t('common.search')}</h1>

      <GlassCard className="sticky top-2 z-10">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 size-5 text-[var(--color-ink-faint)]" />
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
          <div className="mt-2 text-xs text-[var(--color-ink-faint)] px-1">
            {results.length} {t('search.results')}
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
        <EmptyState icon={<BookOpen className="size-8" />} title={t('search.noResults')} />
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
  return (
    <Link to={`/word/${word.id}`} className="block mb-2">
      <GlassCard level="subtle" pad="sm" className="flex items-center justify-between gap-3 hover:brightness-105 transition-[filter]">
        <div className="min-w-0">
          <div className="font-latin font-bold text-[var(--color-ink)] truncate" dir="ltr">
            {word.gender ? <span className="text-[var(--color-accent)]">{word.gender} </span> : null}
            {word.german}
          </div>
          <div className="mt-0.5 text-sm text-[var(--color-ink-soft)] truncate">{word.persian}</div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {word.type && word.type !== 'other' && (
            <Badge tone="neutral" className="uppercase">
              {word.type}
            </Badge>
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
