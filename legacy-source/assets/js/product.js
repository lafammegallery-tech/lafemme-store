/*
=========================================================
Product Page
=========================================================
*/

const params = new URLSearchParams(window.location.search);

const productId = Number(params.get("id"));

const product = products.find(item => item.id === productId);

if (!product) {

    document.body.innerHTML = "<h1>محصول پیدا نشد.</h1>";

} else {

    document.getElementById("product-name").textContent =
        product.name;

    document.getElementById("product-weight").textContent =
        product.weight;

    document.getElementById("product-purity").textContent =
        product.purity;

    document.getElementById("product-badge").textContent =
        product.badge;

    document.getElementById("product-image").src =
        product.image;

    document.getElementById("product-image").alt =
        product.name;

    document.getElementById("product-stock").textContent =
        product.stock.available
            ? "موجود"
            : "ناموجود";

}
// =========================
// Price Engine
// =========================

let marketPrice = 0;

// اگر محصول طلا باشد
if (product.type === "gold") {

    marketPrice = market.gold24;

}

// اگر محصول نقره باشد
if (product.type === "silver") {

    marketPrice = market.silverGram;

}

// قیمت پایه

const basePrice = marketPrice * product.weight;

// اجرت

const wagePrice =
    basePrice * (product.wagePercent / 100);

// قیمت نهایی

const finalPrice =
    basePrice +
    wagePrice +
    product.fixedFee;

// نمایش قیمت

document.getElementById("product-price").textContent =
    finalPrice.toLocaleString("fa-IR") + " تومان";