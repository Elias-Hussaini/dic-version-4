import { useEffect, useRef, useState } from 'react';
import { Music4, Play, Pause, Trash2, Upload, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { GlassCard, GlassButton, EmptyState } from '@/design-system/Glass';
import { useTranslate } from '@/hooks/useTranslate';
import { db } from '@/db/schema';
import type { MusicTrack } from '@/types';

/* Music player — learning songs stored locally in IndexedDB (legacy `music` store). */
export default function MusicPage() {
  const t = useTranslate();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [current, setCurrent] = useState<MusicTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    void db.music.orderBy('uploadDate').reverse().toArray().then(setTracks);
  }, []);

  const play = (track: MusicTrack) => {
    if (!audioRef.current) return;
    if (current?.id === track.id) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        void audioRef.current.play();
        setPlaying(true);
      }
      return;
    }
    setCurrent(track);
    if (track.audioData) {
      audioRef.current.src = track.audioData;
      void audioRef.current.play();
      setPlaying(true);
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });
      await db.music.add({
        name: file.name.replace(/\.[^.]+$/, ''),
        audioData: dataUrl,
        audioType: file.type,
        uploadDate: new Date().toISOString(),
      });
    }
    setTracks(await db.music.orderBy('uploadDate').reverse().toArray());
  };

  const remove = async (id?: number) => {
    if (id === undefined) return;
    await db.music.delete(id);
    if (current?.id === id) {
      audioRef.current?.pause();
      setCurrent(null);
      setPlaying(false);
    }
    setTracks(await db.music.orderBy('uploadDate').reverse().toArray());
  };

  const nextTrack = () => {
    if (!tracks.length || !current) return;
    const i = tracks.findIndex((x) => x.id === current.id);
    play(tracks[(i + 1) % tracks.length]!);
  };

  const prevTrack = () => {
    if (!tracks.length || !current) return;
    const i = tracks.findIndex((x) => x.id === current.id);
    play(tracks[(i - 1 + tracks.length) % tracks.length]!);
  };

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <h1 className="text-xl font-extrabold pt-1 flex items-center gap-2">
        <Music4 className="size-6 text-[var(--color-accent)]" />
        {t('music.title')}
      </h1>

      <audio ref={audioRef} onEnded={nextTrack} />

      <GlassCard level="strong" className="text-center py-8">
        {current ? (
          <>
            <div className="mx-auto mb-4 grid place-items-center size-16 rounded-3xl bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-white">
              <Volume2 className="size-7" />
            </div>
            <h2 className="font-bold text-[var(--color-ink)] truncate">{current.name}</h2>
            <div className="mt-4 flex justify-center gap-2">
              <GlassButton variant="secondary" size="icon" onClick={prevTrack} aria-label="previous">
                <SkipBack className="size-4 flip-rtl" />
              </GlassButton>
              <GlassButton variant="primary" size="icon" onClick={() => play(current)} aria-label={playing ? 'pause' : 'play'}>
                {playing ? <Pause className="size-5" /> : <Play className="size-5 flip-rtl" />}
              </GlassButton>
              <GlassButton variant="secondary" size="icon" onClick={nextTrack} aria-label="next">
                <SkipForward className="size-4 flip-rtl" />
              </GlassButton>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--color-ink-soft)]">یک آهنگ را برای پخش انتخاب کنید</p>
        )}
      </GlassCard>

      <label className="block">
        <input type="file" accept="audio/*" multiple className="sr-only" onChange={(e) => void upload(e.target.files)} />
        <GlassCard level="subtle" className="flex items-center justify-center gap-2 py-4 cursor-pointer hover:brightness-105 transition-[filter]">
          <Upload className="size-4 text-[var(--color-accent)]" />
          <span className="text-sm font-semibold text-[var(--color-ink-soft)]">افزودن آهنگ</span>
        </GlassCard>
      </label>

      {tracks.length === 0 && !current ? (
        <EmptyState icon={<Music4 className="size-8" />} title="لیست پخش خالی است" description="آهنگ‌های آموزشی خود را اضافه کنید تا هنگام یادگیری گوش دهید." />
      ) : (
        <div className="space-y-2">
          {tracks.map((track) => (
            <GlassCard key={track.id} level="subtle" pad="sm" className="flex items-center justify-between gap-3">
              <button onClick={() => play(track)} className="flex-1 min-w-0 text-start">
                <span className="text-sm font-semibold text-[var(--color-ink)] truncate block">{track.name}</span>
              </button>
              <GlassButton variant="ghost" size="icon" onClick={() => play(track)} aria-label="play">
                <Play className="size-4 flip-rtl" />
              </GlassButton>
              <GlassButton variant="ghost" size="icon" onClick={() => void remove(track.id)} aria-label={t('common.delete')}>
                <Trash2 className="size-4 text-[var(--color-danger)]" />
              </GlassButton>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
