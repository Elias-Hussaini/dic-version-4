import { motion, AnimatePresence } from 'motion/react';
import { WifiOff } from 'lucide-react';
import { useUiStore } from '@/hooks/useUi';

export function OfflineIndicator() {
  const online = useUiStore((s) => s.online);
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          role="status"
          className="fixed top-[max(env(safe-area-inset-top),10px)] inset-x-0 z-[60] mx-auto w-fit glass-strong rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-semibold text-[var(--color-warning)]"
        >
          <WifiOff className="size-3.5" />
          آفلاین هستید — لغات و مرور در دسترس است
        </motion.div>
      )}
    </AnimatePresence>
  );
}
