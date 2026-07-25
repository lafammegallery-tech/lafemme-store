# اجرای نسخه 1.4

1. فایل `.env.example` را به `.env` کپی کنید.
2. `DATABASE_URL` و `AUTH_SECRET` را تنظیم کنید.
3. دستورات زیر را اجرا کنید:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

برای ورود به پنل مدیریت، نقش کاربر را در دیتابیس به `ADMIN` تغییر دهید و سپس مسیر `/admin` را باز کنید.
