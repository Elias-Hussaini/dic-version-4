import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ════════════════════════════════════════════════════════════════
   GlassDialog — accessible modal. Bottom-sheet on mobile.
   Dispatches `lingo:dialog` so FloatingNav lowers itself.
   ════════════════════════════════════════════════════════════════ */

export function GlassDialog({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('lingo:dialog', { detail: open }));
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const focusables = ref.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label={typeof title === 'string' ? title : 'dialog'}
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className={cn(
                'glass-strong glass-hi rounded-3xl w-full max-w-lg max-h-[85dvh] overflow-y-auto pointer-events-auto',
                // bottom-sheet feel on small screens
                'max-sm:place-self-end max-sm:mb-0 max-sm:rounded-b-none',
                className,
              )}
            >
              {title && (
                <div className="flex items-center justify-between gap-3 p-5 pb-0">
                  <h2 className="text-base font-bold text-[var(--color-ink)]">{title}</h2>
                  <button
                    onClick={onClose}
                    aria-label="بستن"
                    className="grid place-items-center size-9 rounded-full hover:bg-[var(--color-glass-secondary)] text-[var(--color-ink-soft)]"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
              <div className="p-5">{children}</div>
              {footer && <div className="px-5 pb-5 pt-0">{footer}</div>}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
