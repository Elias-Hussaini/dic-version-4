import { Link } from 'react-router-dom';
import { Star, BookOpen } from 'lucide-react';
import { GlassCard, GlassButton, EmptyState } from '@/design-system/Glass';
import { PageHero } from '@/design-system/PageHero';
import { WordRow } from '@/features/search/SearchPage';
import { useWords, useFavorites } from '@/hooks/useData';
import { useTranslate } from '@/hooks/useTranslate';

export default function FavoritesPage() {
  const t = useTranslate();
  const { data: words } = useWords();
  const { data: favorites } = useFavorites();

  const favWords = (words ?? []).filter((w) => favorites?.includes(w.id));

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <PageHero icon={<Star />} title={t('favorites.title')} subtitle="لغات نشان‌شده شما" />

      {favWords.length === 0 ? (
        <EmptyState
          icon={<BookOpen />}
          title={t('favorites.empty')}
          description="با زدن آیکون ستاره در صفحه لغت، آن را به علاقه‌مندی‌ها اضافه کنید."
          action={
            <Link to="/library">
              <GlassButton variant="primary">{t('library.title')}</GlassButton>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {favWords.map((w) => (
            <WordRow key={w.id} word={w} />
          ))}
        </div>
      )}
    </div>
  );
}
