# Changelog

## v2.0.0 — بازنویسی کامل (TypeScript + React 19 + Tailwind v4 + Vite)

### بازطراحی — «Premium Glass»
- زبان طراحی جدید با سطوح شیشه‌ای سه‌لایه (subtle / glass / strong)، هایلایت داخلی، سایه‌های نرم
- ناوبری شناور کپسولی پایین صفحه در همه اندازه‌ها (بدون sidebar)، اندیکیتور فعال با انیمیشن layout
- پس‌زمینه aurora ایستا، تم Light / Dark / System با پیروی زنده از سیستم
- فونت Vazirmatn (فارسی) و Inter (لاتین) به‌صورت باندل محلی
- RTL کامل با logical properties و آینه‌سازی آیکون‌های جهت‌دار

### زیرساخت
- مهاجرت از vanilla JS (~۳۹k خط) به TypeScript strict با `noUncheckedIndexedAccess`
- Tailwind CSS v4 (CSS-first tokens)، React Router، Zustand، Dexie، TanStack Query، motion، zod
- PWA با vite-plugin-pwa (precache تولیدشده خودکار — رفع باگ SW نسخه قبل)، StaleWhileRevalidate برای assetها، اعلان «نسخه جدید»
- CI گیت‌هاب: typecheck + lint + test + build + اسکن کلید

### رفع مشکلات نسخه قبل
- ❌ حذف کلیدهای API هاردکدشده → کلاینت فقط `VITE_API_BASE_URL` را می‌خواند؛ کلیدها در Cloudflare Worker
- ❌ حذف SW خراب → precache دقیق و خودکار
- ❌ حذف سطح XSS (۳۰۰ مورد innerHTML) → رندر React به‌صورت متن؛ `dangerouslySetInnerHTML` به‌کلی ممنوع
- ❌ حذف overrideهای تکراری متدها → هر رفتار دقیقاً یک پیاده‌سازی دارد
- ❌ حذف وابستگی به ترتیب اسکریپت‌ها → ES modules و پوشه‌های feature
- ❌ ورود مخرب داده بدون پشتیبان → نقطه بازیابی خودکار + پیش‌نمایش قبل از import
- ❌ حذف ماژول Zilliz (dict-zilliz) طبق درخواست مالک — جستجوی معنایی به پراکسی منتقل شده و اختیاری است

### قابلیت‌های جدید (فراتر از نسخه قبل)
- پالت فرمان (Ctrl/Cmd+K) با جستجوی لغت و پرش به صفحات
- هدف روزانه و streak با حلقه پیشرفت
- پیش‌بینی مرور ۱۴ روزه + نرخ ماندگاری + تشخیص لغات چسبنده (leech)
- نقاط بازیابی خودکار (۵ عدد چرخشی) + بازیابی یک‌ضرب
- آنبوردینگ سه‌مرحله‌ای + empty stateهای راهنما
- تنظیمات دسترس‌پذیری: اندازه متن، کاهش انیمیشن، کاهش شفافیت، کنتراست بالا
- شاخص آفلاین + صف درخواست‌های AI هنگام آفلاین
- i18n کامل رابط (fa/de/en) با کاتالوگ تایپ‌شده
- Error boundary مسیرها + Toast + حالت‌های retry

### سازگاری داده
- IndexedDB `GermanPersianDictionary` همان storeهای قبلی؛ مهاجرت ۶→۷ صرفاً افزایشی
- همان کلیدهای localStorage برای تنظیمات، SRS و تگ‌ها
- فایل خروجی برای نسخه قبل خوانا می‌ماند
- ۱۸ تست واحد شابق بقای رکوردها در import خروجی legacy

## v1.x — نسخه vanilla JS
دیکشنری آلمانی-فارسی تک‌فایلی با ~۳۹ هزار خط جاوااسکریپت، بدون build step.
