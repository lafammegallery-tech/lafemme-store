const fs = require("fs");
const path = require("path");

const pages = [
  "about",
  "addresses",
  "cart",
  "checkout",
  "contact",
  "dashboard",
  "faq",
  "forgot-password",
  "login",
  "orders",
  "privacy",
  "profile",
  "register",
  "search",
  "terms",
  "wishlist",
];

// ساخت صفحات عمومی
pages.forEach((page) => {
  const folder = path.join("src", "app", page);

  fs.mkdirSync(folder, { recursive: true });

  const file = path.join(folder, "page.tsx");

  if (!fs.existsSync(file)) {
    fs.writeFileSync(
      file,
      `/**
 * صفحه ${page}
 * فعلاً نسخه پایه است.
 * UI اصلی بعداً با Design System تکمیل می‌شود.
 */

export default function Page() {
  return (
    <main className="container mx-auto px-4 py-10" dir="rtl">
      <h1 className="text-3xl font-bold">
        ${page}
      </h1>

      <p className="mt-4 text-gray-600">
        این صفحه در حال تکمیل است.
      </p>
    </main>
  );
}
`
    );

    console.log(`Created: ${file}`);
  }
});


// ساخت صفحه محصول داینامیک
const productFolder = path.join(
  "src",
  "app",
  "products",
  "[id]"
);

fs.mkdirSync(productFolder, { recursive: true });

const productFile = path.join(
  productFolder,
  "page.tsx"
);

if (!fs.existsSync(productFile)) {
  fs.writeFileSync(
    productFile,
    `/**
 * صفحه جزئیات محصول
 */

export default function ProductPage() {
  return (
    <main className="container mx-auto px-4 py-10" dir="rtl">
      <h1 className="text-3xl font-bold">
        جزئیات محصول
      </h1>

      <p className="mt-4 text-gray-600">
        اطلاعات محصول اینجا نمایش داده می‌شود.
      </p>
    </main>
  );
}
`
  );

  console.log(`Created: ${productFile}`);
}

console.log("All pages created successfully.");