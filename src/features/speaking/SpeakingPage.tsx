import { useMemo, useState } from 'react';
import { Mic, MicOff, Volume2, Check, X } from 'lucide-react';
import { GlassCard, GlassButton, Badge, EmptyState, GlassSelect, ProgressRing } from '@/design-system/Glass';
import { PageHero } from '@/design-system/PageHero';
import { useWords } from '@/hooks/useData';
import { useTranslate } from '@/hooks/useTranslate';
import { speak, stopSpeaking } from '@/services/tts';
import { listenOnce, speechSupported, similarity } from '@/services/speech';
import { practiceRepo } from '@/db/repositories';
import { useProgress } from '@/hooks/useProgress';
import { useInvalidate } from '@/hooks/useData';
import type { Word } from '@/types';

/* Speaking / pronunciation practice: TTS reference + recognition scoring. */
export default function SpeakingPage() {
  const t = useTranslate();
  const { data: words } = useWords();
  const invalidate = useInvalidate();
  const progress = useProgress();
  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [result, setResult] = useState<{ transcript: string; score: number } | null>(null);
  const [error, setError] = useState('');

  const pool = useMemo(() => (words ?? []).slice(0, 30), [words]);
  const current = pool[index];

  if (!words) return null;
  if (pool.length === 0 || !current) {
    return <EmptyState title="لغتی برای تمرین تلفظ وجود ندارد" description="ابتدا لغت اضافه کنید." />;
  }
  if (!speechSupported()) {
    return (
      <EmptyState
        icon={<MicOff className="size-8" />}
        title="مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند"
        description="می‌توانید تلفظ مرجع را بشنوید، اما ضبط صدا در این مرورگر در دسترس نیست (Chrome یا Edge را امتحان کنید)."
        action={
          <GlassButton variant="primary" onClick={() => speak(current.german)}>
            <Volume2 className="size-4" /> {t('word.speak')}
          </GlassButton>
        }
      />
    );
  }

  const startListening = async () => {
    if (!current) return;
    setError('');
    setResult(null);
    setListening(true);
    try {
      const r = await listenOnce('de-DE', setInterim);
      const score = similarity(r.transcript, current.german);
      setResult({ transcript: r.transcript, score });
      await practiceRepo.record({
        wordId: current.id,
        correct: score >= 0.7,
        mode: 'speaking',
        date: new Date().toISOString(),
      });
      progress.bumpToday();
      invalidate.practice();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ضبط صدا');
    } finally {
      setListening(false);
      setInterim('');
    }
  };

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <div className="flex items-center justify-between gap-3 pt-1">
        <PageHero icon={<Mic />} title={t('learn.speaking')} subtitle="تمرین تلفظ" />
        <Badge tone="accent">
          {index + 1} / {pool.length}
        </Badge>
      </div>

      <GlassCard level="strong" className="text-center py-10 space-y-4">
        <div className="flex justify-center gap-2">
          {current.type && current.type !== 'other' && <Badge tone="neutral" className="uppercase">{current.type}</Badge>}
        </div>
        <h2 className="text-3xl font-extrabold font-latin" dir="ltr">
          {current.german}
        </h2>
        <p className="text-sm text-[var(--color-ink-soft)]">{current.persian}</p>

        <div className="flex gap-3 justify-center pt-2">
          <GlassButton variant="secondary" onClick={() => speak(current.german)}>
            <Volume2 className="size-4" /> مرجع
          </GlassButton>
          <GlassButton variant="primary" onClick={startListening} loading={listening}>
            <Mic className="size-4" /> {listening ? 'در حال شنیدن…' : 'تلفظ کنید'}
          </GlassButton>
        </div>

        {interim && <p className="text-sm font-latin text-[var(--color-ink-faint)]" dir="ltr">{interim}</p>}

        {result && (
          <div className="space-y-3 animate-[var(--animate-pop-in)]">
            <div className="flex justify-center">
              <ProgressRing
                value={Math.round(result.score * 100)}
                max={100}
                size={80}
                label={<span className="text-sm">{Math.round(result.score * 100)}%</span>}
              />
            </div>
            <p className="font-latin text-sm text-[var(--color-ink-soft)]" dir="ltr">
              «{result.transcript}»
            </p>
            <Badge tone={result.score >= 0.7 ? 'success' : 'warning'}>
              {result.score >= 0.9 ? 'عالی!' : result.score >= 0.7 ? 'خوب' : 'نیاز به تمرین'}
            </Badge>
          </div>
        )}

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      </GlassCard>

      <div className="flex gap-2">
        <GlassButton
          variant="secondary"
          className="flex-1"
          onClick={() => {
            setResult(null);
            setIndex((i) => Math.max(0, i - 1));
          }}
        >
          قبلی
        </GlassButton>
        <GlassButton
          variant="primary"
          className="flex-1"
          onClick={() => {
            setResult(null);
            setIndex((i) => (i + 1) % pool.length);
          }}
        >
          بعدی
        </GlassButton>
      </div>
    </div>
  );
}
