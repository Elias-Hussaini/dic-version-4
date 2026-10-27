import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Save, Sparkles, Plus, Languages } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput, GlassTextarea, GlassSelect, Badge, IconTile } from '@/design-system/Glass';
import { useInvalidate, useWords } from '@/hooks/useData';
import { useTranslate } from '@/hooks/useTranslate';
import { wordsRepo } from '@/db/repositories';
import { completeText, remoteEnabled } from '@/services/apiClient';
import { useToast } from '@/design-system/Toast';
import type { Gender, Word, WordType } from '@/types';
import { wordSchema } from '@/types';
import { z } from 'zod';

const TYPES: Array<{ value: WordType; label: string }> = [
  { value: 'noun', label: 'Nomen — اسم' },
  { value: 'verb', label: 'Verb — فعل' },
  { value: 'adjective', label: 'Adjektiv — صفت' },
  { value: 'adverb', label: 'Adverb — قید' },
  { value: 'preposition', label: 'Präposition — حرف اضافه' },
  { value: 'other', label: 'Andere — سایر' },
];

const EMPTY = {
  german: '',
  persian: '',
  type: 'noun' as WordType,
  gender: undefined as Gender | undefined,
  plural: '',
  example: '',
  exampleTranslation: '',
  notes: '',
  tags: '',
  pronunciation: '',
  comparative: '',
  superlative: '',
  present: '',
  past: '',
  perfect: '',
  helper: 'haben',
};

export default function AddWordPage() {
  const [params] = useSearchParams();
  const editId = params.get('id') ? Number(params.get('id')) : undefined;
  const navigate = useNavigate();
  const t = useTranslate();
  const { toast } = useToast();
  const invalidate = useInvalidate();
  const { data: words } = useWords();
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (editId !== undefined && words) {
      const w = words.find((x) => x.id === editId);
      if (w) {
        setForm({
          german: w.german,
          persian: w.persian,
          type: w.type,
          gender: w.gender,
          plural: w.plural ?? '',
          example: w.examples?.[0]?.german ?? '',
          exampleTranslation: w.examples?.[0]?.persian ?? '',
          notes: w.notes ?? '',
          tags: w.tags?.join(', ') ?? '',
          pronunciation: w.pronunciation ?? '',
          comparative: w.comparative ?? '',
          superlative: w.superlative ?? '',
          present: w.verbForms?.present ?? '',
          past: w.verbForms?.past ?? '',
          perfect: w.verbForms?.perfect ?? '',
          helper: w.verbForms?.helper ?? 'haben',
        });
      }
    }
  }, [editId, words]);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const aiFill = async () => {
    if (!remoteEnabled()) {
      toast('قابلیت هوش مصنوعی فعال نیست — VITE_API_BASE_URL را تنظیم کنید', 'error');
      return;
    }
    if (!form.german.trim()) {
      toast('اول لغت آلمانی را بنویسید', 'info');
      return;
    }
    setAiLoading(true);
    try {
      const sys =
        'You are a German-Persian lexicographer. Reply ONLY with compact JSON with keys: persian, type (noun|verb|adjective|adverb|preposition|other), gender (der|die|das or null), plural, pronunciation (IPA), example (German sentence), exampleTranslation (Persian), tags (array, include CEFR A1-C1), comparative, superlative, present, past, perfect. Use null for non-applicable.';
      const raw = await completeText(`Word: ${form.german}`, sys);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('bad-json');
      const info = JSON.parse(jsonMatch[0]!) as Record<string, unknown>;
      setForm((f) => ({
        ...f,
        persian: str(info['persian']) || f.persian,
        type: (str(info['type']) as WordType) || f.type,
        gender: (str(info['gender']) as Gender) || f.gender,
        plural: str(info['plural']) || f.plural,
        pronunciation: str(info['pronunciation']) || f.pronunciation,
        example: str(info['example']) || f.example,
        exampleTranslation: str(info['exampleTranslation']) || f.exampleTranslation,
        tags: Array.isArray(info['tags']) ? (info['tags'] as string[]).join(', ') : f.tags,
        comparative: str(info['comparative']) || f.comparative,
        superlative: str(info['superlative']) || f.superlative,
        present: str(info['present']) || f.present,
        past: str(info['past']) || f.past,
        perfect: str(info['perfect']) || f.perfect,
      }));
      toast('فرم با هوش مصنوعی پر شد', 'success');
    } catch {
      toast('خطا در پر کردن با هوش مصنوعی — دوباره تلاش کنید', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const save = async () => {
    if (!form.german.trim() || !form.persian.trim()) {
      toast('لغت آلمانی و معنی فارسی الزامی است', 'error');
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const tags = form.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const base = {
        german: form.german.trim(),
        persian: form.persian.trim(),
        type: form.type,
        gender: form.type === 'noun' ? form.gender : undefined,
        plural: form.type === 'noun' && form.plural ? form.plural : undefined,
        pronunciation: form.pronunciation || undefined,
        notes: form.notes || undefined,
        tags: tags.length ? tags : undefined,
        comparative: form.type === 'adjective' && form.comparative ? form.comparative : undefined,
        superlative: form.type === 'adjective' && form.superlative ? form.superlative : undefined,
        verbForms:
          form.type === 'verb'
            ? {
                present: form.present || null,
                past: form.past || null,
                perfect: form.perfect || null,
                helper: form.helper || 'haben',
              }
            : undefined,
        examples:
          form.example || form.exampleTranslation
            ? [{ german: form.example, persian: form.exampleTranslation }]
            : undefined,
        createdAt: now,
        updatedAt: now,
      };
      // validate with zod before touching the DB
      wordSchema.parse(base);

      if (editId !== undefined) {
        const existing = await wordsRepo.get(editId);
        if (existing) {
          await wordsRepo.update({ ...existing, ...base, id: editId });
          toast('لغت ویرایش شد', 'success');
        }
      } else {
        const dupe = await wordsRepo.getByGerman(form.german);
        if (dupe) {
          toast(t('add.duplicate'), 'error');
          setSaving(false);
          return;
        }
        await wordsRepo.add(base);
        toast(t('add.saved'), 'success');
      }
      invalidate.words();
      navigate(editId !== undefined ? `/word/${editId}` : '/library');
    } catch (err) {
      if (err instanceof z.ZodError) toast('داده نامعتبر — فیلدها را بررسی کنید', 'error');
      else toast('خطا در ذخیره', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-[var(--animate-slide-up)]">
      {/* Gradient page header */}
      <div className="hero-panel p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid place-items-center size-11 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
              <Plus className="size-5.5 text-white" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-white">
                {editId !== undefined ? t('common.edit') : t('add.title')}
              </h1>
              <p className="text-xs text-white/65">لغت جدید به دیکشنری خود اضافه کنید</p>
            </div>
          </div>
          {remoteEnabled() && (
            <button
              onClick={aiFill}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm text-xs font-bold text-white hover:bg-white/25 transition-colors disabled:opacity-50"
            >
              <Sparkles className="size-3.5" />
              {aiLoading ? '…' : t('add.aiFill')}
            </button>
          )}
        </div>
      </div>

      <GlassCard className="space-y-4">
        <GlassInput label={t('add.german')} value={form.german} onChange={set('german')} latin dir="ltr" placeholder="z.B. Haus" required />
        <GlassInput label={t('add.persian')} value={form.persian} onChange={set('persian')} dir="rtl" placeholder="مثال: خانه" required />
        <GlassSelect label={t('add.type')} value={form.type} onChange={set('type')}>
          {TYPES.map((ty) => (
            <option key={ty.value} value={ty.value}>
              {ty.label}
            </option>
          ))}
        </GlassSelect>

        {form.type === 'noun' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--color-ink-soft)]">{t('word.gender')}</label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { v: undefined, label: '—', cls: 'glass-subtle text-[var(--color-ink-faint)]' },
                  { v: 'der' as Gender, label: 'der', cls: 'gender-der text-white' },
                  { v: 'die' as Gender, label: 'die', cls: 'gender-die text-white' },
                  { v: 'das' as Gender, label: 'das', cls: 'gender-das text-white' },
                ]
              ).map((g) => (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, gender: g.v }))}
                  className={`h-10 rounded-xl font-latin font-bold text-sm transition-all duration-150 ${g.cls} ${
                    form.gender === g.v || (g.v === undefined && !form.gender)
                      ? 'ring-2 ring-offset-2 ring-[var(--color-accent)] scale-[1.03]'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <GlassInput label={t('word.plural')} value={form.plural} onChange={set('plural')} latin dir="ltr" placeholder="Häuser" />
          </div>
        )}

        {form.type === 'verb' && (
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Präsens" value={form.present} onChange={set('present')} latin dir="ltr" />
            <GlassInput label="Präteritum" value={form.past} onChange={set('past')} latin dir="ltr" />
            <GlassInput label="Perfekt" value={form.perfect} onChange={set('perfect')} latin dir="ltr" />
            <GlassSelect label="Hilfsverb" value={form.helper} onChange={set('helper')}>
              <option value="haben">haben</option>
              <option value="sein">sein</option>
            </GlassSelect>
          </div>
        )}

        {form.type === 'adjective' && (
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Komparativ" value={form.comparative} onChange={set('comparative')} latin dir="ltr" />
            <GlassInput label="Superlativ" value={form.superlative} onChange={set('superlative')} latin dir="ltr" />
          </div>
        )}

        <GlassTextarea label={`${t('word.examples')} (DE)`} value={form.example} onChange={set('example')} latin dir="ltr" />
        <GlassTextarea label={`${t('word.examples')} (FA)`} value={form.exampleTranslation} onChange={set('exampleTranslation')} dir="rtl" />
        <GlassInput label={`${t('word.pronunciation')} (IPA)`} value={form.pronunciation} onChange={set('pronunciation')} latin dir="ltr" placeholder="[haʊs]" />
        <GlassInput label={t('word.tags')} value={form.tags} onChange={set('tags')} placeholder="A1, Haushalt" />
        <GlassTextarea label={t('word.notes')} value={form.notes} onChange={set('notes')} dir="rtl" />
      </GlassCard>

      <div className="flex gap-2">
        <GlassButton variant="primary" className="flex-1" onClick={save} loading={saving}>
          <Save className="size-4" /> {editId !== undefined ? t('common.save') : t('add.save')}
        </GlassButton>
        <Link to={editId !== undefined ? `/word/${editId}` : '/library'}>
          <GlassButton variant="ghost">{t('common.cancel')}</GlassButton>
        </Link>
      </div>
    </div>
  );
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}
