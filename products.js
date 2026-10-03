// قائمة المنتجات والأقسام لـ تاپ مارت (Top Mart) - بدون أسعار وبأقسام محددة

const STORE_CONFIG = {
    storeName: "تاپ مارت - Top Mart",
    whatsappNumber: "9647715051193" // رقم الواتساب المخصص لتلقي الطلبات
};

// الأقسام الـ 5 المطلوبة فقط
const CATEGORIES = [
    { id: "all", name: "الكل", icon: "🛒" },
    { id: "juices", name: "العصائر", icon: "🧃" },
    { id: "detergents", name: "المنظفات", icon: "🧹" },
    { id: "olive_oil", name: "زيت الزيتون", icon: "🫒" },
    { id: "milk", name: "الحليب والمشتقات", icon: "🥛" },
    { id: "meat", name: "اللحوم", icon: "🥩" }
];

const PRODUCTS = [
    // قسم العصائر
    {
        id: 101,
        category: "juices",
        name: "عصير برتقال طبيعي (1 لتر)",
        unit: "عبوة",
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&q=80"
    },
    {
        id: 102,
        category: "juices",
        name: "عصير تفاح (1 لتر)",
        unit: "عبوة",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&q=80"
    },
    {
        id: 103,
        category: "juices",
        name: "عصير مانجو طبيعي (1 لتر)",
        unit: "عبوة",
        image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=300&q=80"
    },
    {
        id: 104,
        category: "juices",
        name: "عصير مشكل كوكتيل (1 لتر)",
        unit: "عبوة",
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&q=80"
    },

    // قسم المنظفات
    {
        id: 201,
        category: "detergents",
        name: "مسحوق غسيل ملابس (3 كغم)",
        unit: "كيس",
        image: "https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=300&q=80"
    },
    {
        id: 202,
        category: "detergents",
        name: "سائل جلي الأواني (1 لتر)",
        unit: "علبة",
        image: "https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=300&q=80"
    },
    {
        id: 203,
        category: "detergents",
        name: "مطهر ومعقم أرضيات (2 لتر)",
        unit: "عبوة",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80"
    },
    {
        id: 204,
        category: "detergents",
        name: "صابون أيدي سائل (500 مل)",
        unit: "عبوة",
        image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=300&q=80"
    },

    // قسم زيت الزيتون
    {
        id: 301,
        category: "olive_oil",
        name: "زيت زيتون بكر ممتاز (1 لتر)",
        unit: "قنينة",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80"
    },
    {
        id: 302,
        category: "olive_oil",
        name: "زيت زيتون ممتاز (5 لتر)",
        unit: "صفيحة",
        image: "https://images.unsplash.com/photo-1541256942802-7b29531f0df8?w=300&q=80"
    },
    {
        id: 303,
        category: "olive_oil",
        name: "زيت زيتون معصور على البارد (750 مل)",
        unit: "قنينة",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80"
    },

    // قسم الحليب والمشتقات
    {
        id: 401,
        category: "milk",
        name: "حليب طازج (1 لتر)",
        unit: "عبوة",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80"
    },
    {
        id: 402,
        category: "milk",
        name: "حليب كامل الدسم طويل الأجل (1 لتر)",
        unit: "علبة",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&q=80"
    },
    {
        id: 403,
        category: "milk",
        name: "جبنة بيضاء بلدي (500 غم)",
        unit: "علبة",
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&q=80"
    },
    {
        id: 404,
        category: "milk",
        name: "لبن رائب طازج (1 كغم)",
        unit: "سطل",
        image: "https://images.unsplash.com/photo-1571217865189-d929be3d9f36?w=300&q=80"
    },

    // قسم اللحوم
    {
        id: 501,
        category: "meat",
        name: "لحم غنم طازج (1 كغم)",
        unit: "كغم",
        image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=300&q=80"
    },
    {
        id: 502,
        category: "meat",
        name: "لحم بقر طازج (1 كغم)",
        unit: "كغم",
        image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=300&q=80"
    },
    {
        id: 503,
        category: "meat",
        name: "لحم مفروم طازج (1 كغم)",
        unit: "كغم",
        image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&q=80"
    },
    {
        id: 504,
        category: "meat",
        name: "صدر دجاج طازج (1 كغم)",
        unit: "كغم",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&q=80"
    }
];
