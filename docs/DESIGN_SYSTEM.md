# Design System — Premium Glass

زبان طراحی LINGO: رابط حس «سیستم‌عامل بومی» — لایه‌های شیشه‌ای نیمه‌شفاف، عمق طبیعی، هندسه گرد و نور بنفش-آبی ملایم.

## توکن‌ها

تنها منبع حقیقت، متغیرهای CSS در `src/styles/index.css` است (Tailwind v4 `@theme`). هیچ کامپوننتی رنگ را هاردکد نمی‌کند.

| توکن | Light | Dark |
|---|---|---|
| `--color-bg` | `#F7F8FC` | `#0D0F1A` |
| `--color-ink` | `#171827` | `#F4F4FC` |
| `--color-accent` | `#635BFF` | `#8B83FF` |
| `--color-accent-2` | `#8B5CF6` | `#A78BFA` |

دکمه اصلی از گرادیان `accent → accent-2` استفاده می‌کند؛ فقط همین‌جا گرادیان رنگی مجاز است.

## سطوح شیشه

| سطح | کاربرد | blur |
|---|---|---|
| `glass-subtle` | کارت‌های داخل صفحه | ~۱۲px |
| `glass` | پنل‌ها، فرم‌ها، جستجو | ~۲۰px + saturate |
| `glass-strong` | نوار ناوبری، دیالوگ، منو | ~۳۲px |

هر سطح = پرکننده نیمه‌شفاف + `backdrop-filter` + حاشیه 1px شفاف + هایلایت داخلی بالایی (`glass-hi`) + سایه نرم + شعاع بزرگ.

محدودیت‌ها:
- fallback جامد با `@supports not (backdrop-filter)`
- حالت `reduce-transparency` (تنظیم کاربر یا `prefers-reduced-transparency`)
- لایه‌های `backdrop-filter` روی هم انباشته نمی‌شوند

## حرکت

- easing iOS-مانند: `cubic-bezier(0.32, 0.72, 0, 1)`
- بازه ۱۵۰–۳۵۰ms؛ فقط transform و opacity
- ورود کارت‌ها stagger کوتاه؛ انتقال صفحات با AnimatePresence
- `prefers-reduced-motion` + تنظیم کاربر → cross-fade / بدون حرکت

## ناوبری

- هیچ sidebar وجود ندارد
- کپسول شیشه‌ای شناور پایین صفحه در موبایل و دسکتاپ
- `env(safe-area-inset-bottom)` رعایت می‌شود
- هنگام باز بودن کیبورد مجازی یا دیالوگ، نوار پایین می‌رود / پنهان می‌شود
- مقاصد ثانویه در sheet ابزارها

## RTL / LTR

- رابط فارسی RTL؛ محتوای آلمانی همیشه LTR با `dir="ltr"` + کلاس `font-latin`
- فقط logical properties: `ms-*`، `me-*`، `ps-*`، `pe-*`، `start-*`، `end-*`
- آیکون‌های جهت‌دار با کلاس `flip-rtl` آینه می‌شوند
- سوییچ زبان رابط نباید هیچ لی‌آوتی را بشکند

## تایپوگرافی

- فارسی: Vazirmatn Variable (باندل محلی)
- لاتین: Inter Variable
- مقیاس: display 2xl / heading xl / body sm-base / caption xs

## دسترس‌پذیری

- کنتراست WCAG AA در هر دو تم
- focus ring مرئی (accent + outline-offset)
- هدف لمسی ≥ ۴۴px
- حالت‌های disabled و loading روی همه دکمه‌ها
- `prefers-reduced-motion` و `prefers-reduced-transparency` + تنظیمات کاربر
