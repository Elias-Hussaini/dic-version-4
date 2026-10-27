import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Plus, BookOpen, CheckSquare, Square, Trash2, Folder, Sparkles, Flame } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput, EmptyState, Badge } from '@/design-system/Glass';
import { PageHero } from '@/design-system/PageHero';
import { GlassDialog } from '@/design-system/GlassDialog';
import { WordRow } from '@/features/search/SearchPage';
import { useWords, useSrs, useInvalidate } from '@/hooks/useData';
import { useTranslate } from '@/hooks/useTranslate';
import { wordsRepo } from '@/db/repositories';
import { useToast } from '@/design-system/Toast';
import type { Word, WordType } from '@/types';

type SortMode = 'alphabetical' | 'recent' | 'srs';
type SmartFolder = 'all' | 'new' | 'difficult' | 'noun' | 'verb' | 'adjective';

export default function LibraryPage() {
  const t = useTranslate();
  const { data: words, isLoading } = useWords();
  const { data: srs } = useSrs();
  const invalidate = useInvalidate();
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<SortMode>('recent');
  const [folder, setFolder] = useState<SmartFolder>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!words) return [];
    let out = words;
    if (folder === 'new') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      out = out.filter((w) => w.createdAt >= cutoff.toISOString());
    } else if (folder === 'difficult') {
      out = out.filter((w) => {
        const e = srs?.[String(w.id)];
        return e ? e.level <= 1 && e.totalCorrect + e.totalWrong >= 3 : false;
      });
    } else if (folder === 'noun' || folder === 'verb' || folder === 'adjective') {
      out = out.filter((w) => w.type === (folder as WordType));
    }
    const q = filter.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (w) => w.german.toLowerCase().includes(q) || w.persian.toLowerCase().includes(q),
      );
    }
    const sorted = [...out];
    if (sort === 'alphabetical') sorted.sort((a, b) => a.german.localeCompare(b.german));
    else if (sort === 'recent') sorted.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    else if (sort === 'srs')
      sorted.sort((a, b) => (srs?.[b.id]?.level ?? 0) - (srs?.[a.id]?.level ?? 0));
    return sorted;
  }, [words, filter, sort, folder, srs]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 78,
    overscan: 10,
  });

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    for (const id of selected) {
      await wordsRepo.remove(id);
    }
    toast(`${selected.size} لغت حذف شد`, 'success');
    setSelected(new Set());
    setConfirmDelete(false);
    invalidate.words();
    invalidate.srs();
  };

  const folders: Array<{ id: SmartFolder; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: t('library.allWords'), icon: <BookOpen className="size-4" /> },
    { id: 'new', label: t('library.smart.new'), icon: <Sparkles className="size-4" /> },
    { id: 'difficult', label: t('library.smart.difficult'), icon: <Flame className="size-4" /> },
    { id: 'noun', label: 'Nomen', icon: <Folder className="size-4" /> },
    { id: 'verb', label: 'Verben', icon: <Folder className="size-4" /> },
    { id: 'adjective', label: 'Adjektive', icon: <Folder className="size-4" /> },
  ];

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <PageHero
        icon={<BookOpen />}
        title={t('library.title')}
        subtitle="مجموعه لغات شما"
        action={
          <Link to="/add">
            <GlassButton size="sm" className="!bg-white/15 !border !border-white/25 !text-white hover:!bg-white/25 !shadow-none backdrop-blur-sm">
              <Plus className="size-4" /> {t('dashboard.quickAdd')}
            </GlassButton>
          </Link>
        }
      />
      {/* Folders */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label={t('library.folders')}>
        {folders.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={folder === f.id}
            onClick={() => setFolder(f.id)}
            className={`flex items-center gap-1.5 px-3.5 h-9 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              folder === f.id
                ? 'bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-white shadow-[0_4px_16px_color-mix(in_srgb,var(--color-accent)_35%,transparent)]'
                : 'glass-subtle text-[var(--color-ink-soft)]'
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Filter & sort */}
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <GlassInput
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t('library.searchPlaceholder')}
            dir="auto"
            aria-label={t('library.searchPlaceholder')}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="glass-input h-11 px-3 rounded-2xl text-xs font-semibold cursor-pointer bg-[var(--color-glass-strong)]"
          aria-label="sort"
        >
          <option value="recent">{t('library.sort.recent')}</option>
          <option value="alphabetical">{t('library.sort.alphabetical')}</option>
          <option value="srs">{t('library.sort.srs')}</option>
        </select>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <GlassCard level="strong" className="flex items-center justify-between gap-3 py-3 animate-[var(--animate-pop-in)]">
          <span className="text-sm font-bold">
            {selected.size} {t('library.selected')}
          </span>
          <div className="flex gap-2">
            <GlassButton size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              {t('common.cancel')}
            </GlassButton>
            <GlassButton size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" /> {t('common.delete')}
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* List */}
      {!isLoading && filtered.length === 0 ? (
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
      ) : (
        <div ref={listRef} className="virtual-list h-[calc(100dvh-380px)] min-h-72">
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((vItem) => {
              const w = filtered[vItem.index] as Word;
              const isSel = selected.has(w.id);
              return (
                <div
                  key={w.id}
                  ref={virtualizer.measureElement}
                  data-index={vItem.index}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${vItem.start}px)` }}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={() => toggleSelect(w.id)}
                    aria-label={`select ${w.german}`}
                    className="shrink-0 grid place-items-center size-9 rounded-xl text-[var(--color-accent)] hover:bg-[var(--color-glass-secondary)]"
                  >
                    {isSel ? <CheckSquare className="size-5" /> : <Square className="size-5 text-[var(--color-ink-faint)]" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <WordRow word={w} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <GlassDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('library.deleteSelected')}
        footer={
          <div className="flex gap-2 justify-end">
            <GlassButton variant="ghost" onClick={() => setConfirmDelete(false)}>
              {t('common.cancel')}
            </GlassButton>
            <GlassButton variant="destructive" onClick={deleteSelected}>
              <Trash2 className="size-4" /> {t('common.delete')}
            </GlassButton>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-ink-soft)]">
          {selected.size} لغت و تاریخچه تمرین آن‌ها به‌طور کامل حذف می‌شوند. این عمل قابل بازگشت نیست.
        </p>
      </GlassDialog>
    </div>
  );
}
