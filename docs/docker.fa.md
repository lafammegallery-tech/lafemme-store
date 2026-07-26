# اجرا با Docker

_نسخه انگلیسی: [docker.md](docker.md)_

## شروع سریع

```bash
cp .env.example .env       # سپس مقادیر واقعی را وارد کنید (آدرس‌های API، رمزهای امنیتی، اطلاعات مدیر)
docker compose up --build
```

این دستور ایمیج برنامه را می‌سازد و دو سرویس را اجرا می‌کند:

- `postgres` — پایگاه‌داده Postgres 16، با داده‌های ذخیره‌شده در volume به نام `lafemme_postgres`.
- `app` — برنامه Next.js. نقطه ورود آن ([docker/entrypoint.sh](../docker/entrypoint.sh)) پیش از اجرای `next start` به‌صورت خودکار `prisma migrate deploy` را اجرا می‌کند، بنابراین یک پایگاه‌داده تازه در همان اولین اجرا کاملاً migrate می‌شود — نیازی به مرحله دستی migration نیست.

وقتی هر دو کانتینر وضعیت `healthy` را نشان دهند (`docker compose ps`)، برنامه در آدرس http://localhost:3000 در دسترس است.

## راه‌اندازی اولیه: ساخت حساب مدیر (seed)

Migrationها به‌صورت خودکار اجرا می‌شوند، اما seed کردن داده‌ها خودکار نیست (seed تقریباً idempotent است اما چیزی نیست که بخواهید در هر ری‌استارت به‌صورت خاموش دوباره اجرا شود). آن را فقط یک‌بار پس از اولین `up` اجرا کنید:

```bash
docker compose exec app npm run db:seed
```

این دستور کاربر مدیر را بر اساس `ADMIN_PHONE`، `ADMIN_EMAIL` و `ADMIN_PASSWORD` موجود در `.env` می‌سازد، به همراه چند محصول نمونه طلا و نقره. برای جزئیات بیشتر درباره حساب مدیر seed‌شده به [docs/admin-account.md](admin-account.md) مراجعه کنید.

## بررسی اینکه برنامه بالا آمده است

```bash
docker compose ps                         # هر دو سرویس باید وضعیت «healthy» را نشان دهند
curl http://localhost:3000/api/health     # {"status":"ok","database":"up",...}
```

## دستورات پرکاربرد

```bash
docker compose up -d --build      # بازسازی و اجرا در پس‌زمینه
docker compose logs -f app        # دنبال کردن لاگ‌های برنامه (migrationها در ابتدای لاگ هنگام بالا آمدن اجرا می‌شوند)
docker compose exec app sh        # ورود به داخل کانتینر در حال اجرا
docker compose down               # توقف کانتینرها، حفظ volume پایگاه‌داده (داده‌ها باقی می‌مانند)
docker compose down -v            # توقف کانتینرها و پاک کردن volume پایگاه‌داده (شروع از صفر)
docker compose restart app        # فقط ری‌استارت برنامه (در هنگام بالا آمدن دوباره migrate deploy اجرا می‌شود)
```

## متغیرهای محیطی

سرویس `app` هر متغیر را از شل/فایل `.env` شما از طریق جایگزینی `${VAR:-default}` در [docker-compose.yml](../docker-compose.yml) می‌خواند — برای فهرست کامل به `.env.example` مراجعه کنید (آدرس‌های API قیمت طلا و نقره، `AUTH_SECRET`، `MARKET_SYNC_SECRET`، تنظیمات درگاه پرداخت، اطلاعات ورود مدیر برای seed). `DATABASE_URL` تنها استثناست: compose همیشه آن را برای اشاره به سرویس داخلی `postgres` بازنویسی می‌کند، صرف‌نظر از آنچه در `.env` نوشته‌اید — نیازی نیست (و نباید) خودتان آن را برای جریان کار Docker تنظیم کنید.

برای تغییر یک مقدار، `.env` را ویرایش کرده و کانتینر برنامه را دوباره بسازید:

```bash
docker compose up -d --force-recreate app
```

## نحوه ساخت ایمیج

[Dockerfile](../Dockerfile) شامل یک ساخت چهار مرحله‌ای (four-stage) است:

1. `deps` — نصب کامل وابستگی‌ها برای فرآیند build.
2. `builder` — اجرای `prisma generate` و `next build`.
3. `prod-deps` — یک نصب تازه با `npm ci --omit=dev`، تا devDependencyها (eslint، typescript، tailwind، prettier) هرگز وارد ایمیج نهایی نشوند.
4. `runner` — ایمیج نهایی را از node_modules مرحله `prod-deps` به‌همراه `.next`، `public`، `prisma/`، `prisma.config.ts` ساخته‌شده، و کلاینت تولیدشده Prisma از مرحله `builder` می‌سازد. با کاربر غیر-روت `nextjs` اجرا می‌شود.

ایمیج در زمان اجرا به `prisma.config.ts` نیاز دارد (نه فقط پوشه `prisma/`)، چون `prisma migrate deploy` آدرس datasource را از همان فایل می‌خواند — این نکته هنگام ویرایش Dockerfile به‌راحتی از قلم می‌افتد، چون این فایل در ریشه پروژه قرار دارد نه داخل `prisma/`.

## عیب‌یابی

- **کانتینر برنامه مدام ری‌استارت می‌شود و لاگ‌ها خطای Prisma/migration نشان می‌دهند**: `docker compose logs app` را بررسی کنید. دلایل رایج آن `DATABASE_URL` نادرست/غایب یا در دسترس نبودن سرویس `postgres` است — ابتدا مطمئن شوید `docker compose ps` وضعیت `postgres` را `healthy` نشان می‌دهد.
- **healthcheck هرگز به healthy نمی‌رسد**: مستقیماً `curl http://localhost:3000/api/health` را اجرا کنید تا خطای واقعی را ببینید؛ پاسخ `503` همراه با `"database":"down"` یعنی برنامه بالا آمده اما نمی‌تواند به Postgres وصل شود.
- **`.env` را تغییر دادید اما برنامه هنوز مقادیر قدیمی را استفاده می‌کند**: متغیرهای محیطی در زمان ساخت کانتینر تنظیم می‌شوند، نه به‌صورت زنده خوانده می‌شوند — کانتینر را دوباره بسازید (`docker compose up -d --force-recreate app`)، یک ری‌استارت ساده کافی نیست.
- **می‌خواهید همه‌چیز را از نو شروع کنید**: `docker compose down -v` علاوه بر توقف، volume پایگاه‌داده Postgres را نیز حذف می‌کند، بنابراین `up` بعدی از یک پایگاه‌داده کاملاً خالی شروع می‌شود (migrationها همچنان خودکار اجرا می‌شوند؛ seed کردن خیر).
