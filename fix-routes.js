const fs = require("fs");
const path = require("path");

const appPath = path.join(process.cwd(), "src", "app");

const routes = [
  "",
  "products",
  "products/[id]",
  "cart",
  "checkout",
  "login",
  "register",
  "forgot-password",
  "dashboard",
  "orders",
  "profile",
  "addresses",
  "wishlist",
  "favorites",
  "contact",
  "about",
  "faq",
  "search",
  "privacy",
  "terms",
];


const template = (name) => `
/**
 * صفحه ${name || "Home"}
 * این فایل برای بازسازی Route ایجاد شده است.
 * UI اصلی بعداً با کامپوننت‌های Design System متصل می‌شود.
 */

export default function Page() {
  return (
    <main
      dir="rtl"
      className="container mx-auto px-4 py-10"
    >
      <h1 className="text-3xl font-bold">
        ${name || "خانه"}
      </h1>

      <p className="mt-4 text-gray-600">
        این صفحه آماده اتصال به UI اصلی است.
      </p>
    </main>
  );
}
`;


routes.forEach((route) => {

  const folder = path.join(
    appPath,
    route
  );

  const file = path.join(
    folder,
    "page.tsx"
  );


  if (!fs.existsSync(file)) {

    fs.mkdirSync(folder, {
      recursive: true,
    });


    fs.writeFileSync(
      file,
      template(route)
    );


    console.log(
      "Created:",
      file
    );

  } else {

    console.log(
      "Exists:",
      file
    );

  }

});


console.log(
  "\nAll routes checked successfully."
);
