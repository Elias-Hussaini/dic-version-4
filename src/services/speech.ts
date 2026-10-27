/* ════════════════════════════════════════════════════════════════
   Speech recognition — pronunciation practice (Web Speech API).
   Graceful no-op where unsupported.
   ════════════════════════════════════════════════════════════════ */

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }>;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export interface ListenResult {
  transcript: string;
  score: number; // 0..1 similarity to target
}

/** Levenshtein-based similarity used for pronunciation comparison. */
export function similarity(a: string, b: string): number {
  const s = a.toLowerCase().trim().replace(/[.!?,]/g, '');
  const t = b.toLowerCase().trim().replace(/[.!?,]/g, '');
  if (!s || !t) return 0;
  const dp: number[][] = Array.from({ length: s.length + 1 }, () => new Array(t.length + 1).fill(0));
  for (let i = 0; i <= s.length; i++) dp[i]![0] = i;
  for (let j = 0; j <= t.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost);
    }
  }
  const dist = dp[s.length]![t.length]!;
  return Math.max(0, 1 - dist / Math.max(s.length, t.length));
}

export function listenOnce(
  lang = 'de-DE',
  onInterim?: (text: string) => void,
): Promise<ListenResult> {
  return new Promise((resolve, reject) => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      reject(new Error('unsupported'));
      return;
    }
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    let finalTranscript = '';
    rec.onresult = (e) => {
      let interim = '';
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i]!;
        if (res.isFinal) finalTranscript += res[0]!.transcript;
        else interim += res[0]!.transcript;
      }
      onInterim?.(finalTranscript || interim);
    };
    rec.onerror = (e) => reject(new Error(e.error));
    rec.onend = () => resolve({ transcript: finalTranscript.trim(), score: 0 });
    rec.start();
  });
}
