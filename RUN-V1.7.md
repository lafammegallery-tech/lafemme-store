# اجرای نسخه 1.7

```powershell
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

برای Docker:
```powershell
docker compose up --build
```

پس از ورود ادمین، صفحات جدید در `/admin/products/new`، `/admin/categories` و `/admin/coupons` قرار دارند.
