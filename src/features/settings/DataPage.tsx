import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Upload, History, Trash2, AlertTriangle, FileJson } from 'lucide-react';
import { GlassCard, GlassButton, Badge } from '@/design-system/Glass';
import { GlassDialog } from '@/design-system/GlassDialog';
import { backupRepo } from '@/db/repositories';
import { legacyExportSchema, type LegacyExport } from '@/types';
import { db } from '@/db/schema';
import { useToast } from '@/design-system/Toast';
import { useInvalidate } from '@/hooks/useData';
import { useTranslate } from '@/hooks/useTranslate';

export default function DataPage() {
  const t = useTranslate();
  const { toast } = useToast();
  const invalidate = useInvalidate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [restorePoints, setRestorePoints] = useState<Array<{ id: number; createdAt: string; reason: string; counts: { words: number; practice: number } }>>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [importPreview, setImportPreview] = useState<{ file: File; words: number; practice: number } | null>(null);

  const refresh = async () => {
    const rps = await backupRepo.listRestorePoints();
    setRestorePoints(rps.map((r) => ({ id: r.id!, createdAt: r.createdAt, reason: r.reason, counts: r.counts })));
  };

  useEffect(() => {
    void refresh();
  }, []);

  const doExport = async () => {
    const data = await backupRepo.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LINGO-dictionary-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`خروجی گرفته شد (${data.words.length} لغت)`, 'success');
  };

  const pickImport = () => fileRef.current?.click();

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const raw = JSON.parse(text) as unknown;
      const parsed = legacyExportSchema.parse(raw) as unknown as LegacyExport;
      setImportPreview({ file, words: parsed.words.length, practice: parsed.practiceHistory.length });
    } catch {
      toast('فایل نامعتبر است — فرمت خروجی LINGO را بررسی کنید', 'error');
    }
  };

  const doImport = async (wipe: boolean) => {
    if (!importPreview) return;
    try {
      const text = await importPreview.file.text();
      const parsed = legacyExportSchema.parse(JSON.parse(text) as unknown) as unknown as LegacyExport;
      await backupRepo.import(parsed, { wipe });
      invalidate.all();
      toast(`${parsed.words.length} لغت وارد شد (نقطه بازیابی خودکار ساخته شد)`, 'success');
    } catch {
      toast('خطا در ورود داده', 'error');
    } finally {
      setImportPreview(null);
    }
  };

  const doRestore = async (id: number) => {
    await backupRepo.restore(id);
    invalidate.all();
    toast('بازیابی انجام شد', 'success');
  };

  const doClear = async () => {
    await backupRepo.createRestorePoint('pre-import');
    await db.transaction('rw', db.words, db.favorites, db.examples, db.practiceHistory, async () => {
      await db.words.clear();
      await db.favorites.clear();
      await db.examples.clear();
      await db.practiceHistory.clear();
    });
    localStorage.removeItem('srsData');
    invalidate.all();
    setConfirmClear(false);
    toast('همه داده‌ها پاک شد (نقطه بازیابی ساخته شد)', 'info');
  };

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-xl font-extrabold">{t('settings.data')}</h1>
        <Link to="/settings" className="text-sm text-[var(--color-accent)]">
          {t('settings.title')}
        </Link>
      </div>

      <GlassCard className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <GlassButton variant="primary" onClick={doExport}>
            <Download className="size-4" /> {t('settings.export')}
          </GlassButton>
          <GlassButton variant="secondary" onClick={pickImport}>
            <Upload className="size-4" /> {t('settings.import')}
          </GlassButton>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        <p className="text-xs leading-6 text-[var(--color-ink-faint)]">
          فایل خروجی با نسخه قبلی برنامه سازگار است و شامل لغات، پوشه‌ها، تاریخچه تمرین و داده‌های SRS است. پیش از
          هر ورود داده، به‌طور خودکار نقطه بازیابی ساخته می‌شود.
        </p>
      </GlassCard>

      {/* Restore points */}
      <GlassCard>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <History className="size-4 text-[var(--color-accent)]" /> {t('settings.restorePoints')}
        </h2>
        {restorePoints.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-faint)]">هنوز نقطه بازیابی‌ای وجود ندارد.</p>
        ) : (
          <div className="space-y-2">
            {restorePoints.map((rp) => (
              <div key={rp.id} className="flex items-center justify-between gap-3 p-3 rounded-xl glass-subtle">
                <div>
                  <div className="text-sm font-semibold">
                    {new Date(rp.createdAt).toLocaleString('fa-IR')}
                  </div>
                  <div className="text-xs text-[var(--color-ink-faint)]">
                    {rp.counts.words} لغت · {rp.counts.practice} تمرین
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{rp.reason === 'pre-import' ? 'پیش از ورود' : rp.reason === 'manual' ? 'دستی' : 'خودکار'}</Badge>
                  <GlassButton variant="secondary" size="sm" onClick={() => void doRestore(rp.id)}>
                    بازیابی
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Danger zone */}
      <GlassCard>
        <h2 className="text-sm font-bold mb-3 text-[var(--color-danger)]">منطقه خطر</h2>
        <GlassButton variant="destructive" onClick={() => setConfirmClear(true)}>
          <Trash2 className="size-4" /> {t('settings.clearData')}
        </GlassButton>
      </GlassCard>

      {/* Import preview dialog */}
      <GlassDialog
        open={importPreview !== null}
        onClose={() => setImportPreview(null)}
        title={t('settings.import')}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <GlassButton variant="secondary" onClick={() => void doImport(false)}>
              <FileJson className="size-4" /> افزودن به داده‌های فعلی
            </GlassButton>
            <GlassButton variant="primary" onClick={() => void doImport(true)}>
              جایگزینی کامل
            </GlassButton>
          </div>
        }
      >
        {importPreview && (
          <div className="space-y-3 text-sm">
            <p className="text-[var(--color-ink-soft)]">فایل انتخاب‌شده:</p>
            <div className="p-3 rounded-xl glass-subtle space-y-1">
              <div className="font-semibold">{importPreview.file.name}</div>
              <div className="text-xs text-[var(--color-ink-faint)]">
                {importPreview.words} لغت · {importPreview.practice} رکورد تمرین
              </div>
            </div>
            <p className="text-xs leading-6 text-[var(--color-ink-faint)]">
              پیش از اجرا، یک نقطه بازیابی از داده‌های فعلی ساخته می‌شود تا در صورت پشیمانی قابل بازگشت باشد.
            </p>
          </div>
        )}
      </GlassDialog>

      {/* Clear confirm */}
      <GlassDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title={t('settings.clearData')}
        footer={
          <div className="flex gap-2 justify-end">
            <GlassButton variant="ghost" onClick={() => setConfirmClear(false)}>
              {t('common.cancel')}
            </GlassButton>
            <GlassButton variant="destructive" onClick={doClear}>
              <Trash2 className="size-4" /> {t('common.confirm')}
            </GlassButton>
          </div>
        }
      >
        <div className="flex gap-3">
          <AlertTriangle className="size-6 text-[var(--color-danger)] shrink-0" />
          <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
            همه لغات، علاقه‌مندی‌ها، تاریخچه تمرین و داده‌های مرور حذف می‌شوند. یک نقطه بازیابی نهایی ساخته می‌شود،
            اما پس از بستن مرورگر ممکن است دسترسی به آن سخت باشد. مطمئن هستید؟
          </p>
        </div>
      </GlassDialog>
    </div>
  );
}
