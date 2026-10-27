import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Home, GraduationCap, Library, Settings2, Star, Plus, BarChart3, MessageCircle, Command } from 'lucide-react';
import { useUiStore } from '@/hooks/useUi';
import { useRouter } from '@/hooks/useRouterSafe';
import { useTranslate } from '@/hooks/useTranslate';
import { wordsRepo } from '@/db/repositories';

/* ════════════════════════════════════════════════════════════════
   Command palette (Ctrl/Cmd+K) — jump to pages, search words, actions.
   ════════════════════════════════════════════════════════════════ */

interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
}

export function CommandPalette() {
  const open = useUiStore((s) => s.paletteOpen);
  const setOpen = useUiStore((s) => s.setPaletteOpen);
  const { navigate } = useRouter();
  const t = useTranslate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [wordResults, setWordResults] = useState<Array<{ id: number; german: string; persian: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // global shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setWordResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // debounce word search
  useEffect(() => {
    if (!query.trim()) {
      setWordResults([]);
      return;
    }
    const timer = setTimeout(() => {
      void wordsRepo.search(query).then((r) =>
        setWordResults(r.slice(0, 5).map((w) => ({ id: w.id, german: w.german, persian: w.persian }))),
      );
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  const commands: PaletteItem[] = useMemo(
    () => [
      { id: 'home', label: t('nav.home'), icon: <Home className="size-4" />, run: () => navigate('/') },
      { id: 'search', label: t('common.search'), icon: <Search className="size-4" />, run: () => navigate('/search') },
      { id: 'library', label: t('library.title'), icon: <Library className="size-4" />, run: () => navigate('/library') },
      { id: 'add', label: t('dashboard.quickAdd'), icon: <Plus className="size-4" />, run: () => navigate('/add') },
      { id: 'favorites', label: t('favorites.title'), icon: <Star className="size-4" />, run: () => navigate('/favorites') },
      { id: 'learn', label: t('nav.learn'), icon: <GraduationCap className="size-4" />, run: () => navigate('/learn') },
      { id: 'srs', label: t('learn.srs'), icon: <GraduationCap className="size-4" />, run: () => navigate('/learn/srs') },
      { id: 'tutor', label: t('tutor.title'), icon: <MessageCircle className="size-4" />, run: () => navigate('/tutor') },
      { id: 'stats', label: t('stats.title'), icon: <BarChart3 className="size-4" />, run: () => navigate('/stats') },
      { id: 'settings', label: t('settings.title'), icon: <Settings2 className="size-4" />, run: () => navigate('/settings') },
    ],
    [navigate, t],
  );

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  const items: PaletteItem[] = useMemo(
    () => [
      ...filteredCommands,
      ...wordResults.map((w) => ({
        id: `word-${w.id}`,
        label: w.german,
        hint: w.persian,
        icon: <Search className="size-4" />,
        run: () => navigate(`/word/${w.id}`),
      })),
    ],
    [filteredCommands, wordResults, navigate],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[active]?.run();
      setOpen(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-[3px]"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 top-[12vh] z-[61] mx-auto w-[92%] max-w-lg pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -12 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              role="dialog"
              aria-label={t('palette.open')}
              className="glass-strong glass-hi rounded-3xl overflow-hidden pointer-events-auto shadow-[var(--shadow-glass-lg)]"
              onKeyDown={onKeyDown}
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-glass-border)]">
                <Search className="size-5 text-[var(--color-ink-faint)] shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  placeholder={t('palette.placeholder')}
                  dir="auto"
                  className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-[var(--color-ink-faint)]"
                  aria-label={t('palette.placeholder')}
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg glass-subtle text-[10px] font-mono text-[var(--color-ink-faint)]">
                  <Command className="size-3" />K
                </kbd>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {items.length === 0 ? (
                  <p className="text-center text-sm text-[var(--color-ink-faint)] py-6">{t('search.noResults')}</p>
                ) : (
                  items.map((item, i) => (
                    <button
                      key={item.id}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => {
                        item.run();
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-start transition-colors ${
                        i === active ? 'bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]' : ''
                      }`}
                    >
                      <span className="text-[var(--color-accent)] shrink-0">{item.icon}</span>
                      <span className="text-sm font-semibold text-[var(--color-ink)] font-latin" dir="auto">
                        {item.label}
                      </span>
                      {item.hint && (
                        <span className="ms-auto text-xs text-[var(--color-ink-faint)] truncate">{item.hint}</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
