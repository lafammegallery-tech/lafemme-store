# حساب مدیر La Femme

فایل `prisma/seed.ts` طوری تنظیم شده است که هنگام Seed دیتابیس یک حساب مدیر واقعی بسازد یا به‌روزرسانی کند.

## تنظیم اطلاعات مدیر

فایل `.env.example` را با نام `.env` کپی کنید و مقادیر زیر را در آن قرار دهید:

```env
ADMIN_PHONE="09120000001"
ADMIN_EMAIL="admin@lafemme.ir"
ADMIN_PASSWORD="LaFemme@2026"
```

برای محیط واقعی، رمز پیش‌فرض را تغییر دهید.

## ساخت حساب مدیر

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

سپس پروژه را اجرا کنید:

```bash
npm run dev
```

اطلاعات ورود پیش‌فرض:

- شماره موبایل: `09120000001`
- رمز عبور: `LaFemme@2026`
- نقش: `ADMIN`
