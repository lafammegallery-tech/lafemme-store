# گزارش دیباگ کامل — LaFemme

این نسخه از گزارش، حاصل یک دیباگ عملی و end-to-end است: یک PostgreSQL واقعی نصب شد، تمام Migrationها واقعاً روی آن اجرا شدند، Prisma Client واقعاً regenerate شد، seed واقعاً اجرا شد و سرور واقعی بالا آمد و صفحات واقعاً تست شدند (نه فقط بررسی استاتیک کد).

## نتیجه نهایی

بعد از اصلاحات زیر، همهٔ این‌ها با موفقیت واقعی تأیید شدند:

```
npm run typecheck        ✅ بدون خطا (real types، بدون هیچ any)
npm run typecheck:prisma ✅ بدون خطا
npm run lint              ✅ بدون خطا
npm run build             ✅ ۲۴ صفحه ساخته شد
npx prisma generate       ✅ (با راه‌حل زیر)
npx tsx prisma/seed.ts     ✅ داده واقعی درج شد
npm start + curl همه صفحات کلیدی → همه HTTP 200
```

مسیرهای تست‌شده و همه ۲۰۰: `/`, `/products`, `/products/gold-bar-18k-1g`, `/cart`, `/login`, `/register`, `/contact`, `/admin`, `/admin/coupons`, `/admin/market-prices`, `/admin/products`, `/api/health`, `/faq`, `/search`.

## علت اصلی «اکثر صفحه‌ها باز نمی‌شن»

سه باگ مستقل و همزمان، که ترکیب‌شان عملاً کل بخش محصول/سفارش را از کار انداخته بود:

### ۱. Migration دوم از یک Enum ناموجود استفاده می‌کرد
فایل `prisma/migrations/20260722013000_dynamic_market_pricing/migration.sql` ستون‌هایی از نوع `"MetalType"` اضافه می‌کرد، بدون اینکه این enum را جایی `CREATE TYPE` کرده باشد. روی دیتابیس واقعی این migration با خطا متوقف می‌شد. **رفع شد:** `CREATE TYPE "MetalType" AS ENUM ('GOLD','SILVER','PLATINUM')` به ابتدای migration اضافه شد.

### ۲. جدول Product ده ستون اصلی را اصلاً نداشت
`metalType`, `brand`, `weight`, `weightValue`, `purity`, `certificate`, `price`, `marketPrice`, `image`, `stock` در `schema.prisma` تعریف شده بودند ولی **هیچ migration ای** آن‌ها را نساخته بود. یعنی جدول واقعی Product از روز اول ناقص بود. هر صفحه‌ای که محصول می‌خواند (خانه، لیست/جزئیات محصول، سبد خرید، چک‌اوت، پنل محصولات) با خطای SQL «ستون وجود ندارد» کرش می‌کرد. **رفع شد:** این ستون‌ها به همان migration اضافه شدند (با backfill امن برای NOT NULLها) و ایندکس‌های متناظر schema هم ساخته شدند.

### ۳. Prisma Client تولیدشده، منجمد و قدیمی بود (از Sprint 2 می‌دانستیم، این‌بار حل شد)
`prisma generate`/`validate`/`migrate` به دانلود schema-engine از `binaries.prisma.sh` نیاز دارند که در شبکهٔ من مسدود است. **راه‌حل پیدا شد:** با تنظیم متغیر محیطی زیر، Prisma CLI از فایل wasm محلی‌ای که خودِ پکیج `prisma` همراه دارد استفاده می‌کند و نیازی به دانلود ندارد:

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
PRISMA_SCHEMA_ENGINE_BINARY="$(pwd)/node_modules/prisma/build/schema_engine_bg.wasm" \
npx prisma generate
```

اجرای واقعی این دستور یک باگ چهارم را هم آشکار کرد:

### ۴. رابطهٔ خراب در Schema
فیلد `Product.couponUsages CouponUsage[]` بدون فیلد متقابل در مدل `CouponUsage` تعریف شده بود — این باعث می‌شد `prisma generate` اصلاً fail شود (تا وقتی این راه‌حل پیدا نشده بود، این خطا هم پنهان بود). **رفع شد:** چون `CouponUsage` منطقاً به سطح سفارش/کاربر مرتبط است نه محصول، این فیلد اضافه از `Product` حذف شد.

با رفع این چهار مورد، Client واقعی regenerate شد و مدل‌های `Coupon`/`CouponUsage`/`OrderStatusHistory` که در Sprint 2 «منجمد» بودند حالا کاملاً کار می‌کنند.

## کست‌های `any` حذف شدند

طبق قول Sprint 2، حالا که Client واقعی و به‌روز است، کست‌های `any` از همهٔ ۷ فایل حذف و با تایپ‌های واقعی جایگزین شدند:
`coupon.service.ts`, `payment.service.ts`, `admin.ts`, `checkout.ts`, `admin/coupons/page.tsx`, `admin/market-prices/page.tsx`, `admin/orders/[id]/page.tsx`.

در همین حذف، یک باگ پنجم هم پیدا شد: در `createCouponAction`، مقادیر `value`/`minimumAmount` با `BigInt(...)` ساخته می‌شدند در حالی که این فیلدها در schema از نوع `Decimal` هستند، نه `BigInt`. با تایپ واقعی این ناسازگاری خودش را نشان داد و به `String(Math.max(0, Number(...)))` (همان الگویی که برای `price`/`stock` در بقیهٔ فایل استفاده شده) اصلاح شد.

## تغییر پالت رنگی

پالت به رنگ سرمه‌ای تیرهٔ لوکس تغییر کرد (طبق درخواست). توکن‌های `--color-background`, `--color-surface`, `--color-surface-raised`, `--color-black`, `--color-white`, `--color-gray*` در سه فایل (`globals.css`, `tailwind.config.ts`, `src/components/ui/tokens/colors.ts`) هم‌زمان به‌روزرسانی شدند تا هر سه منبع رنگ هماهنگ بمانند. طلایی شامپاینی (`#C9A46B`) به‌عنوان accent حفظ شد — ترکیب کلاسیک سرمه‌ای+طلایی.

## نکتهٔ مهم برای محیط شما

من در این sandbox یک PostgreSQL موقت نصب کردم تا واقعاً تست کنم. **این تغییری در پروژهٔ شما نیست** — فقط برای تست در محیط من بود. در محیط خودتان همان `docker-compose up` یا دیتابیس واقعی‌تان کافی است؛ چون migrationها الان درست هستند، دیگر نیازی به هیچ workaround ای ندارید — کافی‌ست:

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npx tsx prisma/seed.ts
npm run build && npm start
```

اگر باز هم به خطای دانلود schema-engine برخوردید (که در محیط با اینترنت آزاد بعید است)، همان workaround بالا (`PRISMA_SCHEMA_ENGINE_BINARY`) را می‌توانید موقتاً استفاده کنید.
