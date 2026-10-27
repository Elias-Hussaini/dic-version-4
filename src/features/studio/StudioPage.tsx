import { useState } from 'react';
import { motion } from 'motion/react';
import { ImageIcon, Sparkles, Download } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput, EmptyState, Skeleton } from '@/design-system/Glass';
import { PageHero } from '@/design-system/PageHero';
import { useTranslate } from '@/hooks/useTranslate';
import { remoteEnabled, generateImage } from '@/services/apiClient';
import { useToast } from '@/design-system/Toast';

/* Image Studio — generate an illustration for a word, via the proxy. */
export default function StudioPage() {
  const t = useTranslate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    if (!remoteEnabled()) {
      toast('استودیو فعال نیست — VITE_API_BASE_URL را تنظیم کنید', 'error');
      return;
    }
    setLoading(true);
    try {
      const url = await generateImage(
        `Children's book style flat illustration for a German vocabulary word: ${prompt}. Soft pastel colors, clean composition, no text.`,
      );
      setImage(url);
    } catch {
      toast('خطا در تولید تصویر — دوباره تلاش کنید', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <PageHero icon={<ImageIcon />} title={t('studio.title')} subtitle="تصویرسازی لغات با هوش مصنوعی" />

      <GlassCard className="space-y-3">
        <GlassInput
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Wort oder Szene…"
          latin
          dir="ltr"
          aria-label="prompt"
        />
        <GlassButton variant="primary" className="w-full" onClick={generate} loading={loading}>
          <Sparkles className="size-4" /> {loading ? t('studio.generating') : t('studio.generate')}
        </GlassButton>
      </GlassCard>

      {loading ? (
        <Skeleton className="aspect-square w-full max-w-sm mx-auto rounded-3xl" />
      ) : image ? (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard level="strong" className="max-w-sm mx-auto">
            {/* remote image URL returned by our own proxy */}
            <img src={image} alt={prompt} className="w-full rounded-2xl" />
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm font-latin text-[var(--color-ink-soft)]" dir="ltr">
                {prompt}
              </span>
              <a href={image} download="lingo-image.png">
                <GlassButton variant="secondary" size="sm">
                  <Download className="size-4" />
                </GlassButton>
              </a>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <EmptyState
          icon={<ImageIcon className="size-8" />}
          title={t('studio.title')}
          description="برای هر لغت یک تصویر آموزشی تولید کنید تا یادگیری ماندگارتر شود."
        />
      )}
    </div>
  );
}
