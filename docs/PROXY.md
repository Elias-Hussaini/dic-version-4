# API Proxy Setup (Cloudflare Worker)

## چرا پراکسی؟

نسخه قدیمی کلیدهای AI را در جاوااسکریپت سمت کلاینت نگه می‌داشت — در یک ریپازیتوری عمومی. آن کلیدها **لو رفته‌اند** و باید توسط مالک rotate شوند. در نسخه ۲:

- کلاینت فقط `VITE_API_BASE_URL` را می‌شناسد
- کلیدها به‌صورت secret در Cloudflare Worker живут
- هیچ secretی در git نیست (`.env` در `.gitignore`)

## راه‌اندازی

```bash
cd worker
npm install -g wrangler   # اگر ندارید
wrangler login

# تنظیم secretها (هر بار مقدار می‌پرسد):
wrangler secret put AI_GATEWAY_URL
wrangler secret put AI_API_KEY
wrangler secret put IMAGE_API_URL
wrangler secret put IMAGE_API_KEY
wrangler secret put EMBED_API_URL
wrangler secret put EMBED_API_KEY

# مقدار ALLOWED_ORIGIN در wrangler.toml را به دامنه خود تغییر دهید
wrangler deploy
```

سپس در ریشه پروژه:

```bash
cp .env.example .env
# VITE_API_BASE_URL=https://<worker-name>.<account>.workers.dev
```

## اندپوینت‌ها

| مسیر | کار |
|---|---|
| `POST /ai/chat` | چت استریمی (SSE passthrough) |
| `POST /ai/complete` | تکمیل متن (JSON) |
| `POST /image` | تولید تصویر |
| `POST /embed` | embedding متنی |

## امنیت اعمال‌شده

- CORS allow-list (`ALLOWED_ORIGIN`)
- Rate limit هر IP: ۳۰ درخواست در دقیقه
- سقف حجم بدنه: ۳۲KB
- allow-list مدل‌ها (داخل worker)
- خطاهای upstream بدون لو رفتن جزئیات provider

## بدون پراکسی چه چیزی کار می‌کند؟

همه چیز: جستجو، کتابخانه، لغت، SRS، تمام تمرین‌ها، حروف اضافه، موسیقی، آمار، تنظیمات، export/import. فقط دستیار AI، پر کردن فرم با AI، تولید تصویر و جستجوی معنایی غیرفعال می‌شوند و برنامه با پیام شفاف اعلام می‌کند.
