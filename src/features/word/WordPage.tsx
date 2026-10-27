import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Star,
  StarOff,
  Volume2,
  Pencil,
  Trash2,
  Play,
} from 'lucide-react';
import { GlassCard, GlassButton, Badge, Skeleton, EmptyState } from '@/design-system/Glass';
import { GlassDialog } from '@/design-system/GlassDialog';
import { useWord, useFavorites, useInvalidate, useSrs } from '@/hooks/useData';
import { useTranslate } from '@/hooks/useTranslate';
import { wordsRepo, favoritesRepo, practiceRepo, srsRepo } from '@/db/repositories';
import { speak } from '@/services/tts';
import { useToast } from '@/design-system/Toast';
import { useProgress } from '@/hooks/useProgress';
import type { Gender } from '@/types';

const GENDER_TONE: Record<Gender, 'accent' | 'danger' | 'success'> = {
  der: 'accent',
  die: 'danger',
  das: 'success',
};

export default function WordPage() {
  const { id } = useParams();
  const wordId = Number(id);
  const navigate = useNavigate();
  const t = useTranslate();
  const { data: word, isLoading } = useWord(wordId);
  const { data: favorites, refetch: refetchFavs } = useFavorites();
  const { data: srs, refetch: refetchSrs } = useSrs();
  const invalidate = useInvalidate();
  const { toast } = useToast();
  const progress = useProgress();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!word) {
    return <EmptyState title="لغت یافت نشد" action={<Link to="/library"><GlassButton variant="secondary">{t('library.title')}</GlassButton></Link>} />;
  }

  const isFav = favorites?.includes(wordId) ?? false;
  const srsEntry = srs?.[String(wordId)];

  const toggleFav = async () => {
    await favoritesRepo.toggle(wordId);
    void refetchFavs();
    toast(isFav ? t('word.removeFromFavorites') : t('word.addToFavorites'), 'info');
  };

  const quickPractice = async (correct: boolean) => {
    await practiceRepo.record({
      wordId,
      correct,
      mode: 'quick',
      date: new Date().toISOString(),
    });
    const data = srsRepo.load();
    srsRepo.updateOnAnswer(data, wordId, correct);
    srsRepo.save(data);
    progress.bumpToday();
    void refetchSrs();
    invalidate.practice();
    toast(correct ? t('practice.correct') : t('practice.wrong'), correct ? 'success' : 'info');
  };

  const doDelete = async () => {
    await wordsRepo.remove(wordId);
    invalidate.words();
    toast('لغت حذف شد', 'success');
    navigate('/library');
  };

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      {/* Header card */}
      <GlassCard level="strong">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {word.gender && <Badge tone={GENDER_TONE[word.gender]}>{word.gender}</Badge>}
              {word.type && word.type !== 'other' && (
                <Badge tone="neutral" className="uppercase">
                  {word.type}
                </Badge>
              )}
              {srsEntry && <Badge tone="info">L{wordLevel(srsEntry.level)}</Badge>}
            </div>
            <h1 className="text-3xl font-extrabold font-latin break-words" dir="ltr">
              {word.german}
            </h1>
            <p className="mt-1.5 text-lg text-[var(--color-ink-soft)]">{word.persian}</p>
            {word.pronunciation && (
              <p className="mt-1 text-sm text-[var(--color-ink-faint)] font-latin" dir="ltr">
                [{word.pronunciation}]
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <GlassButton variant="ghost" size="icon" onClick={() => speak(word.german)} aria-label={t('word.speak')}>
              <Volume2 className="size-5" />
            </GlassButton>
            <GlassButton variant="ghost" size="icon" onClick={toggleFav} aria-label={isFav ? t('word.removeFromFavorites') : t('word.addToFavorites')}>
              {isFav ? <Star className="size-5 fill-[var(--color-warning)] text-[var(--color-warning)]" /> : <StarOff className="size-5" />}
            </GlassButton>
            <Link to={`/add?id=${wordId}`} aria-label={t('word.edit')}>
              <GlassButton variant="ghost" size="icon">
                <Pencil className="size-5" />
              </GlassButton>
            </Link>
            <GlassButton variant="ghost" size="icon" onClick={() => setConfirmDelete(true)} aria-label={t('word.delete')}>
              <Trash2 className="size-5 text-[var(--color-danger)]" />
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Details grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {word.plural && (
          <DetailCard label={t('word.plural')} value={word.plural} latin />
        )}
        {word.comparative && <DetailCard label="Komparativ" value={word.comparative} latin />}
        {word.superlative && <DetailCard label="Superlativ" value={word.superlative} latin />}
        {word.antonym && <DetailCard label="Antonym" value={word.antonym} latin />}
        {word.case && <DetailCard label="Kasus" value={word.case} latin />}
        {word.cefr && <DetailCard label="CEFR" value={word.cefr} latin />}
      </div>

      {/* Verb conjugation */}
      {word.verbForms && (
        <GlassCard>
          <h2 className="text-sm font-bold mb-3">{t('word.conjugation')}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ['Präsens', word.verbForms.present],
                ['Präteritum', word.verbForms.past],
                ['Perfekt', word.verbForms.perfect],
                ['Futur', word.verbForms.future],
                ['Konjunktiv', word.verbForms.konjunktiv],
              ] as const
            )
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl glass-subtle">
                  <span className="text-xs text-[var(--color-ink-faint)]">{label}</span>
                  <span className="font-latin font-semibold text-sm" dir="ltr">
                    {value}
                  </span>
                </div>
              ))}
            {word.verbForms.helper && (
              <div className="flex items-center justify-between p-3 rounded-xl glass-subtle">
                <span className="text-xs text-[var(--color-ink-faint)]">Hilfsverb</span>
                <span className="font-latin font-semibold text-sm" dir="ltr">
                  {word.verbForms.helper}
                </span>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Examples */}
      {word.examples?.length ? (
        <GlassCard>
          <h2 className="text-sm font-bold mb-3">{t('word.examples')}</h2>
          <div className="space-y-2">
            {word.examples.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-3.5 rounded-2xl glass-subtle"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-latin text-sm leading-6 text-[var(--color-ink)]" dir="ltr">
                    {ex.german}
                  </p>
                  <button
                    onClick={() => speak(ex.german)}
                    className="shrink-0 grid place-items-center size-8 rounded-full hover:bg-[var(--color-glass-secondary)] text-[var(--color-accent)]"
                    aria-label={t('word.speak')}
                  >
                    <Volume2 className="size-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">{ex.persian}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      {/* Notes */}
      {word.notes && (
        <GlassCard>
          <h2 className="text-sm font-bold mb-2">{t('word.notes')}</h2>
          <p className="text-sm leading-7 text-[var(--color-ink-soft)] whitespace-pre-wrap">{word.notes}</p>
        </GlassCard>
      )}

      {/* Tags */}
      {word.tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {word.tags.map((tag) => (
            <Badge key={tag} tone="accent">
              #{tag}
            </Badge>
          ))}
        </div>
      ) : null}

      {/* Quick practice */}
      <GlassCard>
        <h2 className="text-sm font-bold mb-3">تمرین سریع</h2>
        <div className="flex gap-2">
          <GlassButton variant="primary" className="flex-1" onClick={() => quickPractice(true)}>
            <Play className="size-4" /> {t('practice.correct')}
          </GlassButton>
          <GlassButton variant="secondary" className="flex-1" onClick={() => quickPractice(false)}>
            {t('practice.wrong')}
          </GlassButton>
        </div>
      </GlassCard>

      <GlassDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('word.delete')}
        footer={
          <div className="flex gap-2 justify-end">
            <GlassButton variant="ghost" onClick={() => setConfirmDelete(false)}>
              {t('common.cancel')}
            </GlassButton>
            <GlassButton variant="destructive" onClick={doDelete}>
              <Trash2 className="size-4" /> {t('common.delete')}
            </GlassButton>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-ink-soft)]">
          «{word.german}» و تمام داده‌های مرتبط حذف می‌شود. مطمئن هستید؟
        </p>
      </GlassDialog>
    </div>
  );
}

function wordLevel(level: number): string {
  return `${level}/5`;
}

function DetailCard({ label, value, latin }: { label: string; value: string; latin?: boolean }) {
  return (
    <GlassCard level="subtle" pad="sm">
      <div className="text-[11px] text-[var(--color-ink-faint)] mb-1">{label}</div>
      <div className={`font-bold text-[var(--color-ink)] ${latin ? 'font-latin' : ''}`} dir={latin ? 'ltr' : undefined}>
        {value}
      </div>
    </GlassCard>
  );
}
