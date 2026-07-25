/*
=========================================================
La Femme Products Database
Version: 2.0
=========================================================

توجه:

هیچ قیمتی داخل این فایل ذخیره نمی‌شود.

قیمت تمام محصولات از موتور قیمت
و قیمت لحظه‌ای بازار محاسبه خواهد شد.

=========================================================
*/

const products = [

    // =====================================================
    // GOLD 5G
    // =====================================================

    {

        id: 1,

        sku: "LF-G-005",

        slug: "gold-5g",

        type: "gold",

        name: "شمش طلای ۵ گرم",

        weight: 5,

        purity: 995,

        wagePercent: 4,

        fixedFee: 0,

        status: "active",

        featured: true,

        badge: "جدید",

        stock: {

            available: true,

            quantity: 15

        },

        image: "assets/images/gold-5g.png",

        gallery: [

            "assets/images/gold-5g.png",
            "assets/images/gold-5g-side.png",
            "assets/images/gold-5g-box.png"

        ],

        specifications: {

            metal: "طلا",

            brand: "La Femme",

            country: "ایران",

            packaging: "بسته بندی اختصاصی",

            certificate: true

        },

        description:

        "شمش طلای ۵ گرمی La Femme با خلوص 995 مناسب سرمایه گذاری و هدیه."

    },



    // =====================================================
    // GOLD 10G
    // =====================================================

    {

        id: 2,

        sku: "LF-G-010",

        slug: "gold-10g",

        type: "gold",

        name: "شمش طلای ۱۰ گرم",

        weight: 10,

        purity: 995,

        wagePercent: 4,

        fixedFee: 0,

        status: "active",

        featured: true,

        badge: "",

        stock: {

            available: true,

            quantity: 10

        },

        image: "assets/images/gold-10g.png",

        gallery: [

            "assets/images/gold-10g.png",
            "assets/images/gold-10g-side.png",
            "assets/images/gold-10g-box.png"

        ],

        specifications: {

            metal: "طلا",

            brand: "La Femme",

            country: "ایران",

            packaging: "بسته بندی اختصاصی",

            certificate: true

        },

        description:

        "شمش طلای ۱۰ گرمی La Femme با خلوص 995 مناسب سرمایه گذاری و هدیه."

    },



    // =====================================================
    // GOLD 20G
    // =====================================================

    {

        id: 3,

        sku: "LF-G-020",

        slug: "gold-20g",

        type: "gold",

        name: "شمش طلای ۲۰ گرم",

        weight: 20,

        purity: 995,

        wagePercent: 3.5,

        fixedFee: 0,

        status: "active",

        featured: false,

        badge: "",

        stock: {

            available: true,

            quantity: 6

        },

        image: "assets/images/gold-20g.png",

        gallery: [

            "assets/images/gold-20g.png",
            "assets/images/gold-20g-side.png",
            "assets/images/gold-20g-box.png"

        ],

        specifications: {

            metal: "طلا",

            brand: "La Femme",

            country: "ایران",

            packaging: "بسته بندی اختصاصی",

            certificate: true

        },

        description:

        "شمش طلای ۲۰ گرمی La Femme با خلوص 995 مناسب سرمایه گذاری."

    },



    // =====================================================
    // SILVER 100G
    // =====================================================

    {

        id: 4,

        sku: "LF-S-100",

        slug: "silver-100g",

        type: "silver",

        name: "شمش نقره ۱۰۰ گرم",

        weight: 100,

        purity: 999,

        wagePercent: 8,

        fixedFee: 0,

        status: "active",

        featured: true,

        badge: "پرفروش",

        stock: {

            available: true,

            quantity: 20

        },

        image: "assets/images/silver-100g.png",

        gallery: [

            "assets/images/silver-100g.png",
            "assets/images/silver-100g-side.png",
            "assets/images/silver-100g-box.png"

        ],

        specifications: {

            metal: "نقره",

            brand: "La Femme",

            country: "ایران",

            packaging: "بسته بندی اختصاصی",

            certificate: true

        },

        description:

        "شمش نقره ۱۰۰ گرمی La Femme با خلوص 999 مناسب سرمایه گذاری."

    }

];