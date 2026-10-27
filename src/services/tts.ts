/* ════════════════════════════════════════════════════════════════
   Text-to-speech — per-word/example pronunciation with voice &
   speed settings. Web Speech API, fully offline on most platforms.
   ════════════════════════════════════════════════════════════════ */

const LS_VOICE = 'ttsVoice';
const LS_RATE = 'ttsRate';

export function getTtsSettings(): { voiceURI: string | null; rate: number } {
  return {
    voiceURI: localStorage.getItem(LS_VOICE),
    rate: Number(localStorage.getItem(LS_RATE) ?? '1'),
  };
}

export function setTtsSettings(voiceURI: string | null, rate: number): void {
  if (voiceURI) localStorage.setItem(LS_VOICE, voiceURI);
  else localStorage.removeItem(LS_VOICE);
  localStorage.setItem(LS_RATE, String(rate));
}

function pickVoice(voiceURI: string | null): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  if (voiceURI) {
    const found = voices.find((v) => v.voiceURI === voiceURI);
    if (found) return found;
  }
  // German voice preferred for the learning language
  return (
    voices.find((v) => v.lang.startsWith('de')) ??
    voices.find((v) => v.lang.startsWith('en')) ??
    voices[0] ?? null
  );
}

export function speak(text: string, lang = 'de-DE'): void {
  if (!('speechSynthesis' in window) || !text.trim()) return;
  speechSynthesis.cancel();
  const { voiceURI, rate } = getTtsSettings();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = rate;
  const voice = pickVoice(voiceURI);
  if (voice) utter.voice = voice;
  speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

export function listVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  return speechSynthesis.getVoices().filter((v) => v.lang.startsWith('de') || v.lang.startsWith('en') || v.lang.startsWith('fa'));
}
