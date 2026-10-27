import { useEffect } from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { GlassCard, GlassButton } from './Glass';

export default function ErrorBoundary() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : 'خطای ناشناخته';

  useEffect(() => {
    // non-sensitive diagnostics only
    console.error('[LINGO] route error:', message);
  }, [message]);

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto mt-16">
      <GlassCard level="strong" className="text-center py-10">
        <div className="mx-auto mb-4 grid place-items-center size-14 rounded-2xl bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)]">
          <AlertTriangle className="size-7 text-[var(--color-danger)]" />
        </div>
        <h1 className="text-lg font-bold">مشکلی پیش آمد</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)] font-latin dir-auto text-start" dir="ltr">
          {message}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <GlassButton variant="primary" onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" /> تلاش مجدد
          </GlassButton>
          <Link to="/">
            <GlassButton variant="secondary">بازگشت به خانه</GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
