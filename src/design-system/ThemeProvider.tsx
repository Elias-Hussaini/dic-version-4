import { useEffect, type ReactNode } from 'react';
import { useSettings, systemPrefersDark, resolvedTheme, applyDocumentTheme } from '@/hooks/useSettings';

/** Applies theme / dir / lang / a11y classes to <html> reactively. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const settings = useSettings();

  useEffect(() => {
    const apply = () => applyDocumentTheme(resolvedTheme(settings.theme) === 'dark', settings);
    apply();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (settings.theme === 'system') {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [settings]);

  return <>{children}</>;
}
