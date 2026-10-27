import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { GlassCard, GlassButton, EmptyState } from '@/design-system/Glass';
import { PageHero } from '@/design-system/PageHero';
import { useTranslate } from '@/hooks/useTranslate';
import { remoteEnabled, streamChat } from '@/services/apiClient';
import type { ChatMessage } from '@/types';

const LS_CHAT = 'lingo_tutor_chat';

export default function TutorPage() {
  const t = useTranslate();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_CHAT) ?? '[]') as ChatMessage[];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    localStorage.setItem(LS_CHAT, JSON.stringify(messages.slice(-50)));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    if (!remoteEnabled()) {
      setMessages((m) => [
        ...m,
        { role: 'user', content: text, ts: Date.now() },
        {
          role: 'assistant',
          content:
            'دستیار هوشمند فعال نیست. برای استفاده، VITE_API_BASE_URL را روی آدرس پراکسی (Cloudflare Worker) تنظیم کنید. تا آن زمان، همه قابلیت‌های آفلاین (لغت‌نامه، تمرین، مرور) در دسترس هستند.',
          ts: Date.now(),
        },
      ]);
      return;
    }
    const history = [...messages, { role: 'user' as const, content: text, ts: Date.now() }];
    setMessages([...history, { role: 'assistant', content: '', ts: Date.now() }]);
    setStreaming(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const system = {
        role: 'system',
        content:
          'You are LINGO, a friendly German tutor for a Persian speaker. Answer in Persian, use German words with examples in German. Be concise and encouraging.',
      };
      await streamChat(
        [system, ...history.slice(-12).map((m) => ({ role: m.role, content: m.content }))],
        (chunk) => {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1]!;
            last.content += chunk;
            return copy;
          });
        },
        ctrl.signal,
      );
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1]!;
          last.content = '⚠️ خطا در ارتباط با دستیار. دوباره تلاش کنید.';
          return copy;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <div className="flex items-center justify-between gap-3 pt-1">
        <PageHero icon={<MessageCircle />} title={t('tutor.title')} subtitle="دستیار هوشمند زبان" />
        {messages.length > 0 && (
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => {
              setMessages([]);
              localStorage.removeItem(LS_CHAT);
            }}
          >
            <Trash2 className="size-4" /> پاک کردن
          </GlassButton>
        )}
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="size-8" />}
          title={t('tutor.title')}
          description="از گرامر آلمانی تا ترجمه و مثال — هر سوالی دارید بپرسید."
        />
      ) : (
        <div className="space-y-3">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-7 whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-white rounded-ee-md'
                    : 'glass glass-hi rounded-es-md text-[var(--color-ink)]'
                }`}
                dir="auto"
              >
                {m.content || (streaming && i === messages.length - 1 ? t('tutor.thinking') : '')}
                {streaming && i === messages.length - 1 && m.role === 'assistant' && m.content && (
                  <span className="inline-block w-1.5 h-4 ms-1 bg-[var(--color-accent)] animate-pulse align-middle" />
                )}
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="sticky bottom-24">
        <GlassCard level="strong" pad="sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex gap-2 items-end"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={t('tutor.placeholder')}
              rows={1}
              dir="auto"
              className="glass-input flex-1 min-h-11 max-h-32 px-4 py-3 rounded-2xl resize-none text-sm"
              aria-label={t('tutor.placeholder')}
            />
            <GlassButton type="submit" variant="primary" size="icon" disabled={streaming} loading={streaming && !input}>
              {streaming && input ? null : <Send className="size-4 flip-rtl" />}
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
