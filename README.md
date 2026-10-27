# LINGO — دیکشنری هوشمند آلمانی–فارسی

<p dir="rtl">
LINGO یک دیکشنری و ابزار یادگیری زبان <strong>آفلاین و خصوصی</strong> است: لغت‌نامه آلمانی–فارسی، مرور فاصله‌دار (SRS)، حالت‌های تمرین متنوع، تلفظ، و دستیار هوشمند — همه در مرورگر شما، بدون سرور و بدون حساب کاربری.
</p>

نسخه ۲.۰ بازنویسی کامل از صفر با **TypeScript + React 19 + Tailwind CSS v4 + Vite** و زبان طراحی جدید **Premium Glass** است. تمام داده‌های کاربران نسخه قبلی (لغات، پوشه‌ها، تاریخچه تمرین، داده‌های SRS) بدون هیچ تغییری حفظ شده‌اند.

## ⚡️ راه‌اندازی

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL را تنظیم کنید (اختیاری برای قابلیت‌های AI)
npm run dev
```

اسکریپت‌ها:

| دستور | کار |
|---|---|
| `npm run dev` | سرور توسعه |
| `npm run build` | بیلد تولیدی + سرویس‌ورکر PWA |
| `npm run preview` | پیش‌نمایش بیلد |
| `npm run typecheck` | بررسی تایپ (strict) |
| `npm run lint` | ESLint |
| `npm run test` | تست‌های Vitest |

## ✨ قابلیت‌ها

- **جستجو و کتابخانه** — جستجوی آنی دوزبانه، لیست مجازی‌شده (tanstack/virtual)، پوشه‌های هوشمند (جدید / سخت / بر اساس نوع)، انتخاب گروهی و حذف
- **جزئیات لغت** — حرف تعریف، جمع، صرف فعل، مثال‌ها با تلفظ، یادداشت، برچسب
- **یادگیری** — مرور فاصلله‌دار Leitner (سازگار با الگوریتم قبلی)، تمرین حرف تعریف / نوشتن / شنیداری / فلش‌کارت / ترجمه / صرف
- **حروف اضافه آلمانی** — دیتابیس کامل ۶۱ حرف اضافه با حالت (Akkusativ/Dativ/Wechsel/Genitiv)، مثال و سطح CEFR
- **تلفظ و گفتار** — TTS با تنظیم سرعت/صدا + مقایسه تلفظ شما با مرجع (Web Speech API)
- **آمار** — نقشه حرارتی فعالیت، پیش‌بینی مرور ۱۴ روز، نرخ ماندگاری، لغات چسبنده
- **دستیار و استودیو** — چت استریمی و تولید تصویر از طریق پراکسی امن (اختیاری)
- **موسیقی** — پخش‌کننده آهنگ‌های آموزشی ذخیره‌شده در IndexedDB
- **PWA** — نصب‌پذیر، کارکرد آفلاین کامل، اعلان به‌روزرسانی
- **دسترس‌پذیری** — Light/Dark/System، اندازه متن، کاهش انیمیشن/شفافیت، کنتراست بالا، پیمایش کیبورد کامل
- **پالت فرمان** — `Ctrl/Cmd + K` برای پرش به هر صفحه و جستجوی لغت
- **i18n** — رابط فارسی (RTL) / آلمانی / انگلیسی

## 🔐 امنیت و پراکسی

کلاینت **هیچ کلیدی ندارد**. تمام فراخوانی‌های از راه دور از طریق `VITE_API_BASE_URL` به یک Cloudflare Worker (پوشه `worker/`) هدایت می‌شوند که کلیدها را به‌صورت secret نگه می‌دارد و CORS، rate-limit و allow-list مدل را اعمال می‌کند. راهنمای کامل: [docs/PROXY.md](docs/PROXY.md)

> کلیدهای نسخه قدیمی در یک ریپازیتوری عمومی افشا شده بودند و باید توسط مالک rotate شوند.

## 🗄 سازگاری داده‌ها (hard requirement)

- IndexedDB: `GermanPersianDictionary` — همان object storeها با همان keyPathها (نسخه ۶ legacy + مهاجرت افزایشی به ۷)
- localStorage: کلیدهای `srsData`، `dictionary_tags`، `darkMode`، `fontSize`، `learningLang` و… دست‌نخورده مانده‌اند
- فایل خروجی نسخه ۲ قابل خواندن توسط نسخه قدیمی است (فیلد `schemaVersion` به‌صورت افزایشی افزوده شده)
- پیش از هر ورود/پاک‌کردن داده، **نقطه بازیابی خودکار** ساخته می‌شود (۵ عدد آخر نگه داشته می‌شوند)
- تست‌های `src/test/legacyImport.test.ts` بقای تک‌تک رکوردها را تضمین می‌کنند

## 🏗 معماری

```
src/
├─ design-system/   کامپوننت‌های Glass، FloatingNav، Toast، Dialog، Theme
├─ db/              Dexie schema (v6→v7) + repositories (تنها لایه دسترسی به داده)
├─ services/        apiClient (تنها نقطه fetch)، tts، speech
├─ features/        هر قابلیت در پوشه مستقل خود
├─ hooks/           useData (TanStack Query)، useSettings (Zustand)، useProgress
├─ i18n/            کاتالوگ fa/de/en
├─ types/           تایپ‌های دامنه + اسکیمای zod
└─ test/            fixture خروجی legacy + تست‌های سازگاری
```

قوانین: repositoryها تنها کدی هستند که Dexie را لمس می‌کنند؛ serviceها تنها نقطه `fetch` هستند؛ هیچ رنگی خارج از توکن‌ها هاردکد نشده؛ `dangerouslySetInnerHTML` در هیچ‌جای برنامه استفاده نشده است.

## 📚 مستندات

- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — توکن‌ها، سطوح شیشه، قوانین حرکت و RTL
- [docs/DATA_MIGRATION.md](docs/DATA_MIGRATION.md) — سازگاری داده و مهاجرت
- [docs/PROXY.md](docs/PROXY.md) — راه‌اندازی Cloudflare Worker
- [CHANGELOG.md](CHANGELOG.md) — تغییرات

## 📄 مجوز

MIT
