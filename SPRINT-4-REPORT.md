# LaFemme V1.6.0 — Production Foundation & Luxury Conversion

## موارد انجام‌شده
- SEO فنی: sitemap پویا، robots و Web App Manifest
- امنیت پاسخ‌ها: مجموعه Headerهای امنیتی در Next.js
- Health Check عملیاتی در `/api/health` با بررسی PostgreSQL
- Dockerfile چندمرحله‌ای برای Production
- docker-compose شامل برنامه و PostgreSQL با Health Check
- بهینه‌سازی تصاویر AVIF/WebP و فشرده‌سازی پاسخ‌ها
- ماشین حساب سرمایه‌گذاری روی صفحه محصول
- نمایش تعداد قابل خرید، وزن کل، ارزش سناریویی و تغییر تخمینی
- استایل کاملاً واکنش‌گرا برای ابزار سرمایه‌گذاری

## موارد نیازمند اطلاعات بیرونی
- درگاه واقعی پرداخت نیازمند Merchant/API Key است.
- پیامک و ایمیل واقعی نیازمند حساب سرویس‌دهنده است.
- دامنه و تنظیمات نهایی HTTPS هنگام استقرار تعیین می‌شود.

## مسیرهای جدید
- `/sitemap.xml`
- `/robots.txt`
- `/manifest.webmanifest`
- `/api/health`

## اعتبارسنجی
- `npm install`: موفق
- `npm run typecheck`: موفق
- `npm run build`: کامپایل و TypeScript موفق؛ تولید صفحات استاتیک تا 12 از 24 پیش رفت، اما به‌علت نبود PostgreSQL قابل دسترس در محیط تحویل، فرایند در زمان انتظار داده متوقف شد. برای Build کامل، دیتابیس را اجرا و `DATABASE_URL` را تنظیم کنید.
