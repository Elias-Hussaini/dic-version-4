import { type ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/* ════════════════════════════════════════════════════════════════
   Glass primitives — the ONLY surface components in the app.
   glass-subtle < glass < glass-strong, used per design rules.
   ════════════════════════════════════════════════════════════════ */

const radius = 'rounded-3xl';

export const GlassCard = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { level?: 'subtle' | 'default' | 'strong'; pad?: 'sm' | 'md' | 'lg' }>(
  ({ className, level = 'default', pad = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        radius,
        level === 'subtle' && 'glass-subtle',
        level === 'default' && 'glass glass-hi',
        level === 'strong' && 'glass-strong glass-hi',
        pad === 'sm' && 'p-3',
        pad === 'md' && 'p-4 sm:p-5',
        pad === 'lg' && 'p-5 sm:p-7',
        className,
      )}
      {...props}
    />
  ),
);
GlassCard.displayName = 'GlassCard';

export const GlassPanel = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(radius, 'glass glass-hi', className)} {...props} />
  ),
);
GlassPanel.displayName = 'GlassPanel';

/* ── Buttons ────────────────────────────────────────────────────── */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const buttonBase =
  'inline-flex items-center justify-center gap-2 font-semibold select-none transition-[transform,filter,background,border-color,opacity] duration-200 [transition-timing-function:var(--ease-ios)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 min-h-11';

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'btn-grad rounded-2xl',
  secondary: 'glass glass-hi rounded-2xl text-[var(--color-ink)] hover:brightness-105 border border-[var(--color-glass-border)]',
  ghost: 'text-[var(--color-ink-soft)] hover:bg-[var(--color-glass-secondary)]',
  destructive:
    'text-white rounded-2xl bg-[linear-gradient(135deg,var(--color-danger),color-mix(in_srgb,var(--color-danger)_70%,#7f1d1d))] shadow-[0_8px_24px_color-mix(in_srgb,var(--color-danger)_40%,transparent)] hover:brightness-110',
  success: 'btn-grad grad-emerald rounded-2xl',
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-xl',
  md: 'h-11 px-5 text-sm rounded-2xl',
  lg: 'h-13 px-7 text-base rounded-2xl',
  icon: 'h-11 w-11 rounded-2xl',
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'secondary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="inline-block size-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
        />
      )}
      {children}
    </button>
  ),
);
GlassButton.displayName = 'GlassButton';

/* ── Inputs ─────────────────────────────────────────────────────── */

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  latin?: boolean;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, latin, id, ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        id={id}
        className={cn(
          'glass-input w-full h-11 px-4 rounded-2xl text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)]',
          latin && 'font-latin dir-auto text-start',
          className,
        )}
        {...props}
      />
    );
    if (!label) return input;
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-medium text-[var(--color-ink-soft)]">
          {label}
        </label>
        {input}
      </div>
    );
  },
);
GlassInput.displayName = 'GlassInput';

export const GlassTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; latin?: boolean }>(
  ({ className, label, latin, id, ...props }, ref) => {
    const ta = (
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'glass-input w-full min-h-24 px-4 py-3 rounded-2xl resize-y text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)]',
          latin && 'font-latin dir-auto text-start',
          className,
        )}
        {...props}
      />
    );
    if (!label) return ta;
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-medium text-[var(--color-ink-soft)]">
          {label}
        </label>
        {ta}
      </div>
    );
  },
);
GlassTextarea.displayName = 'GlassTextarea';

export const GlassSelect = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }>(
  ({ className, label, id, children, ...props }, ref) => {
    const sel = (
      <select
        ref={ref}
        id={id}
        className={cn(
          'glass-input w-full h-11 px-4 rounded-2xl text-[var(--color-ink)] bg-[var(--color-glass-strong)] cursor-pointer',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
    if (!label) return sel;
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-medium text-[var(--color-ink-soft)]">
          {label}
        </label>
        {sel}
      </div>
    );
  },
);
GlassSelect.displayName = 'GlassSelect';

/* ── Misc ───────────────────────────────────────────────────────── */

export function Badge({
  children,
  tone = 'accent',
  className,
  filled,
}: {
  children: ReactNode;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'violet' | 'pink';
  className?: string;
  filled?: boolean;
}) {
  const tones: Record<string, string> = {
    accent: 'bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)] text-[var(--color-accent)]',
    success: 'bg-[color-mix(in_srgb,var(--color-success)_16%,transparent)] text-[var(--color-success)]',
    warning: 'bg-[color-mix(in_srgb,var(--color-warning)_18%,transparent)] text-[var(--color-warning)]',
    danger: 'bg-[color-mix(in_srgb,var(--color-danger)_16%,transparent)] text-[var(--color-danger)]',
    info: 'bg-[color-mix(in_srgb,var(--color-info)_16%,transparent)] text-[var(--color-info)]',
    violet: 'bg-[color-mix(in_srgb,var(--color-accent-2)_16%,transparent)] text-[var(--color-accent-2)]',
    pink: 'bg-[color-mix(in_srgb,#ec4899_16%,transparent)] text-[#db2777] dark:text-[#f472b6]',
    neutral: 'bg-[var(--color-glass-secondary)] text-[var(--color-ink-soft)]',
  };
  const filledTones: Record<string, string> = {
    accent: 'grad-indigo text-white shadow-[0_4px_12px_rgba(102,126,234,0.4)]',
    success: 'grad-emerald text-white shadow-[0_4px_12px_rgba(16,185,129,0.4)]',
    warning: 'grad-gold text-white shadow-[0_4px_12px_rgba(251,191,36,0.4)]',
    danger: 'grad-rose text-white shadow-[0_4px_12px_rgba(244,63,94,0.4)]',
    info: 'grad-cyan text-white shadow-[0_4px_12px_rgba(6,182,212,0.4)]',
    violet: 'grad-violet text-white shadow-[0_4px_12px_rgba(139,92,246,0.4)]',
    pink: 'grad-pink text-white shadow-[0_4px_12px_rgba(236,72,153,0.4)]',
    neutral: 'bg-[var(--color-glass-secondary)] text-[var(--color-ink-soft)]',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap',
        filled ? filledTones[tone] : tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── Icon tile — jewel-like gradient chip ───────────────────────── */

export type TileTone = 'indigo' | 'blue' | 'violet' | 'pink' | 'sunset' | 'emerald' | 'cyan' | 'rose' | 'gold';

export function IconTile({
  tone = 'indigo',
  size = 'md',
  className,
  children,
}: {
  tone?: TileTone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'icon-tile',
        `icon-tile--${tone}`,
        size === 'sm' && 'size-10 rounded-xl',
        size === 'md' && 'size-12 rounded-2xl',
        size === 'lg' && 'size-14 rounded-[1.25rem]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = 'indigo',
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: TileTone;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center py-16 px-6 text-center animate-[var(--animate-fade-in)]">
      {/* decorative blobs behind the icon */}
      <div aria-hidden className="absolute top-8 inset-x-0 flex justify-center">
        <div className="size-40 rounded-full blur-3xl opacity-30 grad-indigo" />
        <div className="absolute size-24 -translate-x-16 translate-y-10 rounded-full blur-2xl opacity-25 grad-pink" />
        <div className="absolute size-20 translate-x-16 translate-y-14 rounded-full blur-2xl opacity-25 grad-cyan" />
      </div>
      {icon && (
        <div className="relative mb-5 animate-float-soft">
          <span className={cn('icon-tile size-20 rounded-[1.75rem]', `icon-tile--${tone}`)}>
            <span className="scale-[2.1]">{icon}</span>
          </span>
        </div>
      )}
      <h3 className="relative text-lg font-extrabold text-[var(--color-ink)]">{title}</h3>
      {description && (
        <p className="relative mt-2 max-w-sm text-sm leading-7 text-[var(--color-ink-soft)]">{description}</p>
      )}
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  );
}

export function ProgressRing({
  value,
  max = 100,
  size = 64,
  stroke = 6,
  label,
  trackColor,
  bright,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  trackColor?: string;
  bright?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const gid = bright ? 'ringGradBright' : 'ringGrad';
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor ?? 'var(--color-glass-secondary)'}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.6s var(--ease-ios)' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
          <linearGradient id="ringGradBright" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="55%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#f0abfc" />
          </linearGradient>
        </defs>
      </svg>
      {label !== undefined && (
        <div className="absolute inset-0 grid place-items-center text-sm font-bold">{label}</div>
      )}
    </div>
  );
}
