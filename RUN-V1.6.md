# اجرای LaFemme V1.6.0

## اجرای محلی
1. `.env.example` را به `.env` کپی کنید.
2. `DATABASE_URL` و `AUTH_SECRET` را تنظیم کنید.
3. اجرا:
```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

## اجرای Docker
```bash
cp .env.example .env
docker compose up --build
```
سپس آدرس `http://localhost:3000` و وضعیت سرویس در `http://localhost:3000/api/health` در دسترس است.
