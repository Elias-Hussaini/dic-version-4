import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { FloatingNav, type NavItem } from '@/design-system/FloatingNav';
import { Aurora } from '@/design-system/Aurora';
import { OfflineIndicator } from '@/design-system/OfflineIndicator';
import { CommandPalette } from '@/features/palette/CommandPalette';
import { useSettings } from '@/hooks/useSettings';

/** App shell: aurora background, page container with bottom padding for the nav. */
export function AppLayout({ navItems, children }: { navItems: NavItem[]; children: ReactNode }) {
  const onboardingDone = useSettings((s) => s.onboardingDone);

  if (!onboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <>
      <Aurora />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[80] focus:glass-strong focus:rounded-xl focus:px-4 focus:py-2"
      >
        پرش به محتوا
      </a>
      <OfflineIndicator />
      <CommandPalette />
      <main
        id="main"
        className="mx-auto w-full max-w-3xl px-4 pt-[max(env(safe-area-inset-top),16px)] pb-[calc(env(safe-area-inset-bottom)+120px)] sm:px-6"
      >
        {children}
      </main>
      <FloatingNav items={navItems} moreLabel="ابزارها" />
    </>
  );
}
