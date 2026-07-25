# La Femme

پروژه فروشگاه La Femme با Next.js 15، TypeScript، Prisma و PostgreSQL.

## اجرای استاندارد

1. فایل `.env.example` را با نام `.env` کپی کنید.
2. PostgreSQL را اجرا کنید یا از Docker استفاده کنید.
3. دستورات زیر را اجرا کنید:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run check
npm run build
npm run dev
```

## ورود مدیر

اطلاعات حساب مدیر از متغیرهای `ADMIN_PHONE`، `ADMIN_EMAIL` و `ADMIN_PASSWORD` در `.env` خوانده می‌شود و با `npm run db:seed` ساخته می‌شود.

مسیر پنل مدیریت: `/admin`

## نکته امنیتی

مقادیر `AUTH_SECRET` و `ADMIN_PASSWORD` را پیش از انتشار تغییر دهید و فایل `.env` را منتشر نکنید.
