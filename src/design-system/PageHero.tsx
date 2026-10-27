import type { ReactNode } from 'react';

/* ════════════════════════════════════════════════════════════════
   PageHero — the deep gradient banner that anchors every page.
   Keeps the vibrant identity consistent across the whole app.
   ════════════════════════════════════════════════════════════════ */

export function PageHero({
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="hero-panel p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid place-items-center size-11 shrink-0 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm [&_svg]:size-5.5 [&_svg]:text-white">
            {icon}
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-white truncate">{title}</h1>
            {subtitle && <p className="text-xs text-white/65 truncate">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}
