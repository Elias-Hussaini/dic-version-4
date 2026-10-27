/* ════════════════════════════════════════════════════════════════
   LINGO API proxy — Cloudflare Worker.

   The client holds ZERO secrets. This worker holds provider keys as
   secrets (wrangler secret put …) and exposes a narrow API:
     POST /ai/chat    — SSE streaming chat (passthrough)
     POST /ai/complete — single-shot completion
     POST /image      — image generation
     POST /embed      — text embeddings
   Security: CORS allow-list, per-IP rate limiting, request size
   limits, model allow-list. Replaces all the hard-coded keys that
   were exposed in the legacy client code — those keys are
   compromised and must be rotated by the owner.
   ════════════════════════════════════════════════════════════════ */

export interface Env {
  AI_GATEWAY_URL: string; // e.g. https://gateway.ai.cloudflare.com/v1/<account>/<gateway>/openai
  AI_API_KEY: string;
  IMAGE_API_URL: string;
  IMAGE_API_KEY: string;
  EMBED_API_URL: string;
  EMBED_API_KEY: string;
  ALLOWED_ORIGIN: string;
}

const RATE_LIMIT = 30; // requests per minute per IP
const MAX_BODY = 32 * 1024; // 32 KB
const MODEL_ALLOWLIST = new Set(['gpt-4o-mini', 'gpt-4o', 'claude-3-5-haiku', 'llama-3.1-8b-instruct']);

interface RateBucket {
  count: number;
  reset: number;
}
const buckets = new Map<string, RateBucket>();

function cors(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') ?? env.ALLOWED_ORIGIN;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    if (origin !== env.ALLOWED_ORIGIN) {
      return json({ error: 'origin-not-allowed' }, 403);
    }

    // per-IP rate limiting (best-effort, in-worker)
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const now = Date.now();
    const bucket = buckets.get(ip);
    if (!bucket || bucket.reset < now) {
      buckets.set(ip, { count: 1, reset: now + 60_000 });
    } else if (++bucket.count > RATE_LIMIT) {
      return json({ error: 'rate-limited' }, 429);
    }

    if (request.method !== 'POST') {
      return json({ error: 'method-not-allowed' }, 405);
    }

    const bodyText = await request.text();
    if (bodyText.length > MAX_BODY) {
      return json({ error: 'payload-too-large' }, 413);
    }

    let body: { messages?: unknown; model?: string; prompt?: string; texts?: string[] };
    try {
      body = JSON.parse(bodyText) as typeof body;
    } catch {
      return json({ error: 'invalid-json' }, 400);
    }

    const model = typeof body.model === 'string' ? body.model : 'gpt-4o-mini';
    if (!MODEL_ALLOWLIST.has(model)) {
      return json({ error: 'model-not-allowed' }, 400);
    }

    try {
      switch (url.pathname) {
        case '/ai/chat':
          return chat(request, env, body, model, origin);
        case '/ai/complete':
          return complete(env, body, model, origin);
        case '/image':
          return image(env, body, origin);
        case '/embed':
          return embed(env, body, origin);
        default:
          return json({ error: 'not-found' }, 404);
      }
    } catch (err) {
      // never leak provider details
      console.error('proxy error', err instanceof Error ? err.message : 'unknown');
      return json({ error: 'upstream-error' }, 502);
    }
  },
};

async function upstream(env: Env, path: string, payload: unknown, apiKey: string): Promise<Response> {
  const target = `${env.AI_GATEWAY_URL.replace(/\/$/, '')}${path}`;
  return fetch(target, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
}

async function chat(request: Request, env: Env, body: { messages?: unknown }, model: string, origin: string): Promise<Response> {
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages-required' }, 400);
  }

  const upstreamRes = await upstream(
    env,
    '/chat/completions',
    { model, messages, stream: true, max_tokens: 1200 },
    env.AI_API_KEY,
  );

  if (!upstreamRes.ok || !upstreamRes.body) {
    return json({ error: 'upstream-error' }, 502);
  }

  // Transform OpenAI SSE into simple {text} SSE for the client
  const { readable, writable } = new TransformStream();
  void upstreamRes.body.pipeTo(
    new TransformStream<Uint8Array, Uint8Array>({
      async transform(chunk, controller) {
        controller.enqueue(chunk);
      },
    }).pipeTo(writable).catch(() => undefined),
  );

  // Simplify: pass raw SSE through with CORS — client parses `data:` lines
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      ...cors(origin),
    },
  });
}

async function complete(env: Env, body: { messages?: unknown }, model: string, origin: string): Promise<Response> {
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages-required' }, 400);
  }
  const res = await upstream(env, '/chat/completions', { model, messages, max_tokens: 800 }, env.AI_API_KEY);
  if (!res.ok) return json({ error: 'upstream-error' }, 502);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content ?? '';
  return new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  });
}

async function image(env: Env, body: { prompt?: string }, origin: string): Promise<Response> {
  if (typeof body.prompt !== 'string' || body.prompt.length === 0) {
    return json({ error: 'prompt-required' }, 400);
  }
  const res = await fetch(env.IMAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.IMAGE_API_KEY}`,
    },
    body: JSON.stringify({ prompt: body.prompt, size: '1024x1024' }),
  });
  if (!res.ok) return json({ error: 'upstream-error' }, 502);
  const data = (await res.json()) as { data?: Array<{ url?: string; b64_json?: string }> };
  const item = data.data?.[0];
  const image = item?.url ?? (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
  if (!image) return json({ error: 'no-image' }, 502);
  return new Response(JSON.stringify({ image }), {
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  });
}

async function embed(env: Env, body: { texts?: string[] }, origin: string): Promise<Response> {
  if (!Array.isArray(body.texts) || body.texts.length === 0 || body.texts.length > 32) {
    return json({ error: 'texts-required' }, 400);
  }
  const res = await fetch(env.EMBED_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.EMBED_API_KEY}`,
    },
    body: JSON.stringify({ input: body.texts, model: 'text-embedding-3-small' }),
  });
  if (!res.ok) return json({ error: 'upstream-error' }, 502);
  const data = (await res.json()) as { data?: Array<{ embedding: number[] }> };
  const vectors = data.data?.map((d) => d.embedding) ?? [];
  return new Response(JSON.stringify({ vectors }), {
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  });
}
