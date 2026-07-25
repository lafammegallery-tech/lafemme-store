/*
=========================================================
La Femme Website
Main JavaScript File
=========================================================
*/
/*
=========================================================
Application State
=========================================================
*/

const state = {

    search: "",

    filter: "all",

    sort: "default"

};
document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // پیدا کردن بخش نمایش محصولات
    // =====================================================

    const container = document.getElementById("products-container");

    const counter = document.getElementById("products-count");

    const loading = document.getElementById("loading-products");

    const empty = document.getElementById("empty-products");

    // اگر این صفحه products نبود
    if (!container) return;

    // اگر دیتابیس محصولات وجود نداشت
    if (typeof products === "undefined") {

        console.error("products.js پیدا نشد.");

        return;

    }

    // پاک کردن محصولات قبلی

    container.innerHTML = "";

    // ساخت کارت‌ها

    renderProducts(products);

    // تعداد محصولات

    counter.textContent = products.length;

    // مخفی کردن Loading

    loading.style.display = "none";

    // اگر محصولی نبود

    if (products.length === 0) {

        empty.style.display = "block";

    }

    else{

        empty.style.display = "none";

    }

});



/*
=========================================================
ساخت کارت محصول
=========================================================
*/

function createProductCard(product){

    return `

    <article class="product-card">

        <div class="product-image">

            <img
                src="${product.image}"
                alt="${product.name}">

        </div>

        <div class="product-content">

            <h3>

                ${product.name}

            </h3>

            <span class="product-weight">

                ${product.weight} گرم

            </span>

            <div class="product-price">

                قیمت در حال محاسبه...

            </div>

            <a
                href="product.html?id=${product.id}"
                class="btn btn-primary">

                مشاهده محصول

            </a>

        </div>

    </article>

    `;

}
/*
=========================================================
جستجوی محصولات
=========================================================
*/

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const value = this.value.trim().toLowerCase();

        state.search = value;

applyFilters();

    });

}
/*
=========================================================
نمایش محصولات
=========================================================
*/

function renderProducts(list){

    const container = document.getElementById("products-container");

    const counter = document.getElementById("products-count");

    const empty = document.getElementById("empty-products");

    container.innerHTML = "";

    list.forEach(product=>{

        container.innerHTML += createProductCard(product);

    });

    counter.textContent = list.length;

    if(list.length===0){

        empty.style.display="block";

    }else{

        empty.style.display="none";

    }

}
/*
=========================================================
فیلتر محصولات
=========================================================
*/

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // حذف کلاس active از همه دکمه‌ها
        filterButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        // فعال کردن دکمه انتخاب شده
        button.classList.add("active");

        const filter = button.dataset.filter;

        if (filter === "all") {

            renderProducts(products);

            return;

        }

        const filtered = products.filter(product => {

            return product.type === filter;

        });

        state.filter = filter;

applyFilters();

    });

});
/*
=========================================================
اعمال تمام فیلترها
=========================================================
*/

function applyFilters() {

    let result = [...products];

    // ---------- Search ----------

    if (state.search !== "") {

        const keyword = state.search.toLowerCase();

        result = result.filter(product => {

            return (

                product.name.toLowerCase().includes(keyword)

                ||

                String(product.weight).includes(keyword)

            );

        });

    }

    // ---------- Filter ----------

    if (state.filter !== "all") {

        result = result.filter(product => {

            return product.type === state.filter;

        });

    }

    // ---------- Sort ----------

    switch (state.sort) {

    case "weight-low":

        result.sort((a, b) => a.weight - b.weight);

        break;

    case "weight-high":

        result.sort((a, b) => b.weight - a.weight);

        break;

    case "newest":

        result.sort((a, b) => b.id - a.id);

        break;

    default:

        result.sort((a, b) => a.id - b.id);

}

    renderProducts(result);

}
/*
=========================================================
مرتب سازی محصولات
=========================================================
*/

const sortSelect = document.getElementById("sortProducts");

if (sortSelect) {

    sortSelect.addEventListener("change", function () {

        state.sort = this.value;

        applyFilters();

    });

}