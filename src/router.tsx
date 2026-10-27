import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import type { NavItem } from '@/design-system/FloatingNav';
import { AppLayout } from '@/App';
import { useTranslate } from '@/hooks/useTranslate';

/* Lazy-loaded routes — code splitting per feature. */
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const SearchPage = lazy(() => import('@/features/search/SearchPage'));
const LibraryPage = lazy(() => import('@/features/library/LibraryPage'));
const WordPage = lazy(() => import('@/features/word/WordPage'));
const AddWordPage = lazy(() => import('@/features/add-word/AddWordPage'));
const FavoritesPage = lazy(() => import('@/features/favorites/FavoritesPage'));
const LearnHub = lazy(() => import('@/features/learn/LearnHub'));
const SrsPage = lazy(() => import('@/features/srs/SrsPage'));
const PracticePage = lazy(() => import('@/features/practice/PracticePage'));
const VerbsPage = lazy(() => import('@/features/verbs/VerbsPage'));
const PrepositionsPage = lazy(() => import('@/features/prepositions/PrepositionsPage'));
const SpeakingPage = lazy(() => import('@/features/speaking/SpeakingPage'));
const TutorPage = lazy(() => import('@/features/tutor/TutorPage'));
const StudioPage = lazy(() => import('@/features/studio/StudioPage'));
const MusicPage = lazy(() => import('@/features/music/MusicPage'));
const StatsPage = lazy(() => import('@/features/stats/StatsPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const DataPage = lazy(() => import('@/features/settings/DataPage'));
const Onboarding = lazy(() => import('@/features/onboarding/Onboarding'));
const ErrorBoundary = lazy(() => import('@/design-system/ErrorBoundary'));

import { Home, GraduationCap, Library, Settings2 } from 'lucide-react';
import { Skeleton } from '@/design-system/Glass';

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

function PageSkeleton() {
  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-3xl mx-auto w-full" aria-busy>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-32" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}

function RootLayout() {
  const t = useTranslate();
  const navItems: NavItem[] = [
    {
      to: '/',
      label: t('nav.home'),
      labelKey: 'nav.home',
      icon: Home,
      match: (p) => p === '/' || p === '/search',
    },
    {
      to: '/learn',
      label: t('nav.learn'),
      labelKey: 'nav.learn',
      icon: GraduationCap,
      match: (p) => p.startsWith('/learn') || p.startsWith('/tutor') || p.startsWith('/studio') || p.startsWith('/music'),
    },
    {
      to: '/library',
      label: t('nav.library'),
      labelKey: 'nav.library',
      icon: Library,
      match: (p) => p.startsWith('/library') || p.startsWith('/word') || p.startsWith('/favorites') || p.startsWith('/add'),
    },
    {
      to: '/settings',
      label: t('nav.settings'),
      labelKey: 'nav.settings',
      icon: Settings2,
      match: (p) => p.startsWith('/settings') || p.startsWith('/stats'),
    },
  ];

  return (
    <AppLayout navItems={navItems}>
      <LazyPage>
        <Outlet />
      </LazyPage>
    </AppLayout>
  );
}

export const router = createBrowserRouter([
  {
    path: '/onboarding',
    element: (
      <Suspense>
        <Onboarding />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/',
    element: <RootLayout />,
    errorElement: (
      <Suspense>
        <ErrorBoundary />
      </Suspense>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'word/:id', element: <WordPage /> },
      { path: 'add', element: <AddWordPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'learn', element: <LearnHub /> },
      { path: 'learn/srs', element: <SrsPage /> },
      { path: 'learn/practice/:mode', element: <PracticePage /> },
      { path: 'learn/verbs', element: <VerbsPage /> },
      { path: 'learn/prepositions', element: <PrepositionsPage /> },
      { path: 'learn/speaking', element: <SpeakingPage /> },
      { path: 'tutor', element: <TutorPage /> },
      { path: 'studio', element: <StudioPage /> },
      { path: 'music', element: <MusicPage /> },
      { path: 'stats', element: <StatsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'settings/data', element: <DataPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
