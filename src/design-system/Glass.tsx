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

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
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
    'text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--color-accent)_35%,transparent)] bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] hover:brightness-110',
  secondary: 'glass glass-hi rounded-2xl text-[var(--color-ink)] hover:brightness-105 border border-[var(--color-glass-border)]',
  ghost: 'text-[var(--color-ink-soft)] hover:bg-[var(--color-glass-secondary)]',
  destructive:
    'text-white bg-[linear-gradient(135deg,var(--color-danger),color-mix(in_srgb,var(--color-danger)_70%,#7f1d1d))] hover:brightness-110',
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
}: {
  children: ReactNode;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  className?: string;
}) {
  const tones: Record<string, string> = {
    accent: 'bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)]',
    success: 'bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[var(--color-success)]',
    warning: 'bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-[var(--color-warning)]',
    danger: 'bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-[var(--color-danger)]',
    info: 'bg-[color-mix(in_srgb,var(--color-info)_14%,transparent)] text-[var(--color-info)]',
    neutral: 'bg-[var(--color-glass-secondary)] text-[var(--color-ink-soft)]',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap',
        tones[tone],
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
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-[var(--animate-fade-in)]">
      {icon && (
        <div className="mb-4 grid place-items-center size-16 rounded-3xl glass-subtle text-[var(--color-ink-faint)]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-[var(--color-ink)]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-7 text-[var(--color-ink-soft)]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ProgressRing({
  value,
  max = 100,
  size = 64,
  stroke = 6,
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-glass-secondary)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.6s var(--ease-ios)' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-accent-2)" />
          </linearGradient>
        </defs>
      </svg>
      {label !== undefined && (
        <div className="absolute inset-0 grid place-items-center text-sm font-bold">{label}</div>
      )}
    </div>
  );
}
