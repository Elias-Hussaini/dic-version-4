import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastCtx = createContext<{ toast: (message: string, tone?: ToastTone) => void }>({
  toast: () => undefined,
});

export function useToast() {
  return useContext(ToastCtx);
}

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = nextId++;
    setItems((prev) => [...prev.slice(-3), { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed top-0 inset-x-0 z-[70] flex flex-col items-center gap-2 pt-[max(env(safe-area-inset-top),14px)] px-4 pointer-events-none">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.97 }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                role="status"
                className="glass-strong glass-hi rounded-2xl px-4 py-3 flex items-center gap-2.5 max-w-md shadow-[var(--shadow-glass-lg)] pointer-events-auto"
              >
                {item.tone === 'success' && <CheckCircle2 className="size-5 text-[var(--color-success)] shrink-0" />}
                {item.tone === 'error' && <AlertCircle className="size-5 text-[var(--color-danger)] shrink-0" />}
                {item.tone === 'info' && <Info className="size-5 text-[var(--color-info)] shrink-0" />}
                <span className="text-sm font-medium text-[var(--color-ink)]">{item.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastCtx.Provider>
  );
}
