import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RotateCcw, Volume2, Ear, Keyboard } from 'lucide-react';
import { GlassCard, GlassButton, Badge, ProgressRing, EmptyState, GlassInput } from '@/design-system/Glass';
import { useWords, useSrs, useInvalidate } from '@/hooks/useData';
import { practiceRepo, srsRepo } from '@/db/repositories';
import { useTranslate } from '@/hooks/useTranslate';
import { speak, stopSpeaking } from '@/services/tts';
import { useProgress } from '@/hooks/useProgress';
import type { Word } from '@/types';

type Mode = 'gender' | 'writing' | 'listening' | 'flashcard' | 'translation' | 'conjugation';

const SESSION_SIZE = 10;

export default function PracticePage() {
  const { mode } = useParams<{ mode: string }>();
  const t = useTranslate();
  const { data: words } = useWords();
  const { data: srs, refetch: refetchSrs } = useSrs();
  const invalidate = useInvalidate();
  const progress = useProgress();

  const [seed, setSeed] = useState(() => Date.now());
  const [index, setIndex] = useState(0);
  const [session, setSession] = useState({ correct: 0, wrong: 0 });
  const [revealed, setRevealed] = useState(false);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<null | boolean>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pool = useMemo(() => {
    if (!words) return [] as Word[];
    let out = words;
    if (mode === 'gender') out = words.filter((w) => w.type === 'noun' && w.gender);
    if (mode === 'conjugation') out = words.filter((w) => w.type === 'verb' && w.verbForms);
    // prioritize due words
    if (srs) {
      const due = new Set(srsRepo.dueWordIds(srs).map(String));
      out = [...out].sort((a, b) => Number(due.has(String(b.id))) - Number(due.has(String(a.id))));
    }
    // deterministic shuffle per seed, take SESSION_SIZE
    const arr = [...out];
    let s = seed;
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) % 2147483648;
      const j = s % (i + 1);
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
    return arr.slice(0, SESSION_SIZE);
  }, [words, mode, srs, seed]);

  const current = pool[index];

  // focus input for writing modes
  useEffect(() => {
    if ((mode === 'writing' || mode === 'translation') && !revealed) inputRef.current?.focus();
  }, [index, mode, revealed]);

  // auto-play audio for listening
  useEffect(() => {
    if (mode === 'listening' && current) {
      const timer = setTimeout(() => speak(current.german), 400);
      return () => clearTimeout(timer);
    }
    stopSpeaking();
  }, [mode, current]);

  useEffect(() => () => stopSpeaking(), []);

  const record = async (correct: boolean) => {
    if (!current) return;
    await practiceRepo.record({
      wordId: current.id,
      correct,
      mode: mode ?? 'practice',
      date: new Date().toISOString(),
    });
    const data = srsRepo.load();
    srsRepo.updateOnAnswer(data, current.id, correct);
    srsRepo.save(data);
    progress.bumpToday();
    invalidate.practice();
    void refetchSrs();
  };

  const next = (correct: boolean) => {
    setSession((s) => ({ correct: s.correct + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }));
    setFeedback(null);
    setRevealed(false);
    setInput('');
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const submit = () => {
    if (!current || revealed) {
      if (revealed) next(feedback ?? true);
      return;
    }
    let correct = false;
    if (mode === 'writing' || mode === 'listening') {
      correct = normalize(current.german) === normalize(input);
    } else if (mode === 'translation') {
      correct = normalize(current.persian).includes(normalize(input)) && input.trim().length > 0;
    }
    setFeedback(correct);
    setRevealed(true);
    void record(correct);
  };

  if (!words) return null;

  if (pool.length === 0) {
    return (
      <EmptyState
        title="لغت مناسبی برای این تمرین نیست"
        description="ابتدا لغت مرتبط اضافه کنید (مثلاً برای تمرین حرف تعریف، اسم با genus اضافه کنید)."
        action={
          <Link to="/add">
            <GlassButton variant="primary">{t('dashboard.quickAdd')}</GlassButton>
          </Link>
        }
      />
    );
  }

  if (!current) {
    const total = session.correct + session.wrong;
    const acc = total ? Math.round((session.correct / total) * 100) : 0;
    return (
      <GlassCard level="strong" className="text-center py-10 animate-[var(--animate-pop-in)]">
        <ProgressRing value={session.correct} max={total} size={110} stroke={10} label={<span className="text-xl font-extrabold">{acc}%</span>} />
        <h1 className="mt-4 text-lg font-extrabold">{t('practice.result')}</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          {session.correct} درست · {session.wrong} نادرست
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <GlassButton
            variant="primary"
            onClick={() => {
              setSeed(Date.now());
              setIndex(0);
              setSession({ correct: 0, wrong: 0 });
              setRevealed(false);
              setInput('');
            }}
          >
            <RotateCcw className="size-4" /> {t('practice.replay')}
          </GlassButton>
          <Link to="/learn">
            <GlassButton variant="secondary">{t('practice.finish')}</GlassButton>
          </Link>
        </div>
      </GlassCard>
    );
  }

  const modeLabel =
    mode === 'gender'
      ? t('practice.gender')
      : mode === 'writing'
        ? t('practice.writing')
        : mode === 'listening'
          ? t('practice.listening')
          : mode === 'flashcard'
            ? t('practice.flashcard')
            : mode === 'translation'
              ? t('practice.translation')
              : t('practice.conjugation');

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <div className="flex items-center justify-between gap-3 pt-1">
        <h1 className="text-lg font-extrabold">{modeLabel}</h1>
        <Badge tone="accent">
          {index + 1} / {pool.length}
        </Badge>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-glass-secondary)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-accent-2))] transition-[width] duration-300"
          style={{ width: `${((index + 1) / pool.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${current.id}-${index}`}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        >
          <GlassCard level="strong" className="py-8 min-h-56 flex flex-col justify-center text-center">
            {/* Gender mode: pick der/die/das */}
            {mode === 'gender' && (
              <>
                <h2 className="text-3xl font-extrabold font-latin mb-1" dir="ltr">
                  {current.german}
                </h2>
                <p className="text-sm text-[var(--color-ink-soft)] mb-6">{current.persian}</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['der', 'die', 'das'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setPicked(g);
                        const correct = current.gender === g;
                        setFeedback(correct);
                        setRevealed(true);
                        void record(correct);
                      }}
                      disabled={revealed}
                      className={`h-14 rounded-2xl font-latin text-xl font-extrabold transition-all disabled:opacity-100 ${
                        revealed && current.gender === g
                          ? 'bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] text-[var(--color-success)] ring-2 ring-[var(--color-success)]'
                          : revealed && picked === g
                            ? 'ring-2 ring-[var(--color-danger)] text-[var(--color-danger)]'
                            : 'glass-subtle hover:brightness-105 active:scale-[0.97]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Writing / Translation: type the answer */}
            {(mode === 'writing' || mode === 'translation') && (
              <>
                <h2 className="text-2xl font-extrabold mb-2" dir={mode === 'writing' ? 'ltr' : 'rtl'}>
                  <span className={mode === 'writing' ? 'font-latin' : ''}>
                    {mode === 'writing' ? current.german : current.persian}
                  </span>
                </h2>
                {mode === 'writing' && <p className="text-sm text-[var(--color-ink-faint)] mb-4">معنی فارسی را بنویسید</p>}
                {mode === 'translation' && <p className="text-sm text-[var(--color-ink-faint)] mb-4">das deutsche Wort schreiben</p>}
                {revealed ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <Badge tone={feedback ? 'success' : 'danger'} className="text-sm">
                      {feedback ? t('practice.correct') : t('practice.wrong')}
                    </Badge>
                    <p className={`text-xl font-bold ${mode === 'translation' ? 'font-latin' : ''}`} dir={mode === 'translation' ? 'ltr' : 'rtl'}>
                      {mode === 'writing' ? current.persian : current.german}
                    </p>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submit();
                    }}
                    className="mx-auto w-full max-w-xs"
                  >
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      dir={mode === 'writing' ? 'rtl' : 'ltr'}
                      className={`glass-input w-full h-12 px-4 rounded-2xl text-center text-lg ${mode === 'translation' ? 'font-latin' : ''}`}
                      aria-label="answer"
                      autoFocus
                    />
                  </form>
                )}
              </>
            )}

            {/* Listening: audio → type */}
            {mode === 'listening' && (
              <>
                <GlassButton variant="primary" size="icon" className="mx-auto mb-4 size-16 rounded-3xl" onClick={() => speak(current.german)} aria-label={t('word.speak')}>
                  <Ear className="size-7" />
                </GlassButton>
                {revealed ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                    <Badge tone={feedback ? 'success' : 'danger'} className="text-sm">
                      {feedback ? t('practice.correct') : t('practice.wrong')}
                    </Badge>
                    <p className="text-xl font-extrabold font-latin" dir="ltr">
                      {current.german}
                    </p>
                    <p className="text-sm text-[var(--color-ink-soft)]">{current.persian}</p>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submit();
                    }}
                    className="mx-auto w-full max-w-xs"
                  >
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      dir="ltr"
                      className="glass-input w-full h-12 px-4 rounded-2xl text-center text-lg font-latin"
                      placeholder="was hast du gehört?"
                      aria-label="answer"
                      autoFocus
                    />
                  </form>
                )}
              </>
            )}

            {/* Flashcard */}
            {mode === 'flashcard' && (
              <>
                <button onClick={() => speak(current.german)} className="mx-auto mb-3" aria-label={t('word.speak')}>
                  <h2 className="text-3xl font-extrabold font-latin" dir="ltr">
                    {current.german}
                  </h2>
                </button>
                <AnimatePresence>
                  {revealed && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                      <p className="text-xl font-bold text-[var(--color-accent)]">{current.persian}</p>
                      {current.plural && (
                        <p className="text-sm font-latin text-[var(--color-ink-soft)]" dir="ltr">
                          Pl. {current.plural}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {!revealed && (
                  <GlassButton variant="secondary" className="mt-4" onClick={() => setRevealed(true)}>
                    {t('practice.showAnswer')}
                  </GlassButton>
                )}
              </>
            )}

            {/* Conjugation */}
            {mode === 'conjugation' && current.verbForms && (
              <>
                <h2 className="text-2xl font-extrabold font-latin mb-4" dir="ltr">
                  {current.german}
                </h2>
                <div className="grid gap-2 text-start max-w-xs mx-auto w-full">
                  {(
                    [
                      ['Präsens', current.verbForms.present],
                      ['Präteritum', current.verbForms.past],
                      ['Perfekt', current.verbForms.perfect],
                    ] as const
                  ).map(([label, v]) => (
                    <div key={label} className="flex justify-between items-center p-3 rounded-xl glass-subtle">
                      <span className="text-xs text-[var(--color-ink-faint)]">{label}</span>
                      <span className="font-latin font-semibold text-sm" dir="ltr">
                        {v ?? '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {feedback !== null && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`mt-4 mx-auto grid place-items-center size-12 rounded-full ${
                  feedback
                    ? 'bg-[color-mix(in_srgb,var(--color-success)_18%,transparent)] text-[var(--color-success)]'
                    : 'bg-[color-mix(in_srgb,var(--color-danger)_18%,transparent)] text-[var(--color-danger)]'
                }`}
              >
                {feedback ? <Check className="size-6" /> : <X className="size-6" />}
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Action bar */}
      <div className="grid grid-cols-2 gap-3">
        {revealed ? (
          <>
            {feedback ? (
              <GlassButton variant="primary" size="lg" onClick={() => next(true)}>
                <Check className="size-5" /> {t('practice.correct')}
              </GlassButton>
            ) : (
              <GlassButton variant="secondary" size="lg" onClick={() => next(true)}>
                <Check className="size-5" /> درست می‌دانم
              </GlassButton>
            )}
            <GlassButton variant="destructive" size="lg" onClick={() => next(false)}>
              <X className="size-5" /> {t('practice.wrong')}
            </GlassButton>
          </>
        ) : mode === 'flashcard' ? (
          <>
            <GlassButton variant="secondary" size="lg" onClick={() => setRevealed(true)}>
              {t('practice.showAnswer')}
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="lg"
              onClick={() => {
                void record(false);
                next(false);
              }}
            >
              نمی‌دانم
            </GlassButton>
          </>
        ) : mode === 'gender' || mode === 'conjugation' ? (
          <>
            <GlassButton
              variant="secondary"
              size="lg"
              onClick={() => {
                void record(true);
                next(true);
              }}
            >
              <Check className="size-5" /> {t('practice.correct')}
            </GlassButton>
            <GlassButton
              variant="destructive"
              size="lg"
              onClick={() => {
                void record(false);
                next(false);
              }}
            >
              <X className="size-5" /> {t('practice.wrong')}
            </GlassButton>
          </>
        ) : (
          <GlassButton variant="primary" size="lg" className="col-span-2" onClick={submit}>
            <Keyboard className="size-4" /> {t('common.confirm')}
          </GlassButton>
        )}
      </div>
    </div>
  );
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[.!?,]/g, '').replace(/\s+/g, ' ');
}
