import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, GraduationCap, Library, Settings2, LayoutGrid, X } from 'lucide-react';
import { useUiStore } from '@/hooks/useUi';
import { cn } from '@/lib/utils';

/* ════════════════════════════════════════════════════════════════
   FloatingNav — the ONLY navigation. No sidebar, ever.
   Mobile & desktop: floating capsule glass bar at the bottom.
   ════════════════════════════════════════════════════════════════ */

export interface NavItem {
  to: string;
  labelKey: string;
  label: string;
  icon: typeof Home;
  match?: (pathname: string) => boolean;
}

export function FloatingNav({ items, moreLabel }: { items: NavItem[]; moreLabel: string }) {
  const location = useLocation();
  const toolsOpen = useUiStore((s) => s.toolsOpen);
  const setToolsOpen = useUiStore((s) => s.setToolsOpen);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Hide when virtual keyboard is open (visualViewport heuristics)
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onChange = () => setKeyboardOpen(vv.height < window.innerHeight * 0.8);
    vv.addEventListener('resize', onChange);
    return () => vv.removeEventListener('resize', onChange);
  }, []);

  // Lower the bar when any dialog/sheet is open
  useEffect(() => {
    const onToggle = (e: Event) => setDialogOpen((e as CustomEvent<boolean>).detail);
    window.addEventListener('lingo:dialog', onToggle);
    return () => window.removeEventListener('lingo:dialog', onToggle);
  }, []);

  const hidden = keyboardOpen;
  const lowered = dialogOpen;

  return (
    <>
      <AnimatePresence>
        {!hidden && (
          <motion.nav
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              'fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(env(safe-area-inset-bottom),12px)] pointer-events-none',
              lowered && 'translate-y-24 opacity-0 transition-all duration-300',
            )}
            aria-label="ناوبری اصلی"
          >
            <div className="glass-strong glass-hi rounded-full flex items-center gap-1 px-2 py-1.5 pointer-events-auto shadow-[var(--shadow-nav)]">
              {items.map((item) => {
                const active =
                  item.match?.(location.pathname) ?? location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative flex flex-col items-center justify-center min-w-16 h-14 px-2 rounded-full text-[11px] font-semibold transition-colors duration-200',
                      active ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-soft)]',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon className="relative size-[22px] mb-0.5" strokeWidth={active ? 2.4 : 2} />
                    <span className="relative">{item.label}</span>
                  </NavLink>
                );
              })}
              <button
                type="button"
                onClick={() => setToolsOpen(true)}
                aria-label={moreLabel}
                aria-haspopup="dialog"
                className="flex flex-col items-center justify-center min-w-16 h-14 px-2 rounded-full text-[11px] font-semibold text-[var(--color-ink-faint)] hover:text-[var(--color-ink-soft)] transition-colors"
              >
                <LayoutGrid className="size-[22px] mb-0.5" />
                <span>{moreLabel}</span>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <ToolsSheet open={toolsOpen} onClose={() => setToolsOpen(false)} />
    </>
  );
}

import { useRouter } from '@/hooks/useRouterSafe';
import { useTranslate } from '@/hooks/useTranslate';
import { BookOpenText, MessageCircle, ImageIcon, Music4, BarChart3, Scale, Mic, Sparkles, FileJson, BookMarked } from 'lucide-react';

function ToolsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslate();
  const { navigate } = useRouter();

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('lingo:dialog', { detail: open }));
    if (open) {
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [open, onClose]);

  const tools = [
    { to: '/tutor', icon: MessageCircle, label: t('tutor.title') },
    { to: '/studio', icon: ImageIcon, label: t('studio.title') },
    { to: '/music', icon: Music4, label: t('music.title') },
    { to: '/stats', icon: BarChart3, label: t('stats.title') },
    { to: '/learn/verbs', icon: BookOpenText, label: t('learn.verbs') },
    { to: '/learn/prepositions', icon: Scale, label: t('learn.prepositions') },
    { to: '/learn/speaking', icon: Mic, label: t('learn.speaking') },
    { to: '/favorites', icon: BookMarked, label: t('favorites.title') },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.tools')}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-xl p-3 pb-[max(env(safe-area-inset-bottom),16px)]"
          >
            <div className="glass-strong glass-hi rounded-3xl p-4">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold text-[var(--color-ink)]">{t('nav.tools')}</h2>
                <button
                  onClick={onClose}
                  aria-label={t('common.close')}
                  className="grid place-items-center size-9 rounded-full hover:bg-[var(--color-glass-secondary)]"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.to}
                      onClick={() => {
                        onClose();
                        navigate(tool.to);
                      }}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl glass-subtle hover:brightness-105 active:scale-[0.97] transition-[transform,filter]"
                    >
                      <Icon className="size-6 text-[var(--color-accent)]" />
                      <span className="text-xs font-semibold text-[var(--color-ink-soft)] text-center leading-4">
                        {tool.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
