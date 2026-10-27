/* ════════════════════════════════════════════════════════════════
   API client — the ONLY place that calls fetch.
   Zero secrets: everything goes through VITE_API_BASE_URL (proxy).
   Failover + retry with exponential backoff. Offline queueing for
   AI requests.
   ════════════════════════════════════════════════════════════════ */

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
const AI_ENABLED = (import.meta.env.VITE_ENABLE_AI as string | undefined) !== 'false' && !!BASE;

export function remoteEnabled(): boolean {
  return AI_ENABLED;
}

export function baseUrl(): string {
  return BASE;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retriable: boolean,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJson<T>(
  path: string,
  init: RequestInit,
  opts: { retries?: number; timeoutMs?: number } = {},
): Promise<T> {
  const { retries = 2, timeoutMs = 30_000 } = opts;
  if (!AI_ENABLED) throw new ApiError('remote-disabled', 0, false);
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(`${BASE}${path}`, {
        ...init,
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
      });
      clearTimeout(timer);
      if (!res.ok) {
        const retriable = res.status >= 500 || res.status === 429;
        throw new ApiError(`HTTP ${res.status}`, res.status, retriable);
      }
      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      const retriable = err instanceof ApiError ? err.retriable : err instanceof TypeError; // network error
      if (!retriable || attempt === retries) break;
      await sleep(400 * 2 ** attempt + Math.random() * 200);
    }
  }
  throw lastErr instanceof Error ? lastErr : new ApiError('network-error', 0, true);
}

/* ── Offline queue for AI requests ──────────────────────────────── */

interface QueuedRequest {
  id: string;
  path: string;
  body: string;
  createdAt: number;
}

const QUEUE_KEY = 'lingo_offline_ai_queue';

function readQueue(): QueuedRequest[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') as QueuedRequest[];
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedRequest[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-20)));
}

export function queueSize(): number {
  return readQueue().length;
}

export async function flushQueue(): Promise<number> {
  if (!navigator.onLine) return 0;
  const q = readQueue();
  if (!q.length) return 0;
  const remaining: QueuedRequest[] = [];
  let flushed = 0;
  for (const item of q) {
    try {
      await fetchJson(item.path, { method: 'POST', body: item.body }, { retries: 0 });
      flushed++;
    } catch {
      remaining.push(item);
    }
  }
  writeQueue(remaining);
  return flushed;
}

/* ── Public API ─────────────────────────────────────────────────── */

export interface ChatChunk {
  text: string;
  done?: boolean;
}

/** Streaming chat completion via SSE passthrough. */
export async function streamChat(
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!AI_ENABLED) throw new ApiError('remote-disabled', 0, false);
  if (!navigator.onLine) throw new ApiError('offline', 0, false);
  const res = await fetch(`${BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  });
  if (!res.ok || !res.body) throw new ApiError(`HTTP ${res.status}`, res.status, res.status >= 500);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload) as { text?: string };
        if (json.text) onChunk(json.text);
      } catch {
        // partial JSON — ignore
      }
    }
  }
}

export async function completeText(prompt: string, system?: string): Promise<string> {
  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: prompt },
  ];
  const data = await fetchJson<{ text: string }>('/ai/complete', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });
  return data.text;
}

export async function generateImage(prompt: string): Promise<string> {
  const data = await fetchJson<{ image: string }>('/image', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
  return data.image;
}

export async function embed(texts: string[]): Promise<number[][]> {
  const data = await fetchJson<{ vectors: number[][] }>('/embed', {
    method: 'POST',
    body: JSON.stringify({ texts }),
  });
  return data.vectors;
}
