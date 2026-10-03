// تطبيق إدارة الطلبات لـ تاپ مارت (Top Mart) - نظام إرسال الملفات بالصور والتفاصيل

// حالة التطبيق (State)
let currentCategory = "all";
let searchQuery = "";
let cart = []; // [{ product, quantity }]

// تهيئة التطبيق عند التحميل
document.addEventListener("DOMContentLoaded", () => {
    renderCategories();
    renderProducts();
    setupEventListeners();
    updateCartUI();
});

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // مربع البحث
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            renderProducts();
        });
    }

    // فتح وإغلاق السلة
    const cartIconBtn = document.getElementById("cartIconBtn");
    const viewCartBtn = document.getElementById("viewCartBtn");
    const closeCartBtn = document.getElementById("closeCartBtn");
    const modalOverlay = document.getElementById("cartModal");

    if (cartIconBtn) cartIconBtn.addEventListener("click", openCartModal);
    if (viewCartBtn) viewCartBtn.addEventListener("click", openCartModal);
    if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartModal);

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) closeCartModal();
        });
    }

    // زر إرسال ملف الطلب المرئي بالصور عبر الواتساب
    const sendWhatsappBtn = document.getElementById("sendWhatsappBtn");
    if (sendWhatsappBtn) {
        sendWhatsappBtn.addEventListener("click", sendOrderFileViaWhatsApp);
    }

    // زر تحميل ملف الطلب النصي TXT
    const downloadOrderBtn = document.getElementById("downloadOrderBtn");
    if (downloadOrderBtn) {
        downloadOrderBtn.addEventListener("click", downloadOrderFileTxt);
    }
}

// عرض قائمة الأقسام الخمسة
function renderCategories() {
    const wrapper = document.getElementById("categoriesWrapper");
    if (!wrapper) return;

    wrapper.innerHTML = CATEGORIES.map(cat => `
        <button
            class="category-btn ${cat.id === currentCategory ? 'active' : ''}"
            onclick="selectCategory('${cat.id}')">
            <span>${cat.icon}</span>
            <span>${cat.name}</span>
        </button>
    `).join("");
}

// اختيار قسم معين
function selectCategory(categoryId) {
    currentCategory = categoryId;
    renderCategories();
    renderProducts();
}

// عرض المنتجات بناءً على القسم المختار والبحث
function renderProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;

    let filtered = PRODUCTS.filter(p => {
        const matchesCategory = currentCategory === "all" || p.category === currentCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                لا توجد مواد مطابقة للبحث أو القسم المختار.
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const inCart = cart.find(item => item.product.id === p.id);
        const qtyInCart = inCart ? inCart.quantity : 0;

        return `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=Top+Mart';">
                <div class="product-info">
                    <div class="product-title">${p.name}</div>
                    <div class="product-meta">الوحدة: ${p.unit}</div>
                    <div class="product-price-row">
                        ${qtyInCart > 0 ? `
                            <div class="cart-item-controls" style="width: 100%; justify-content: space-between;">
                                <button class="qty-btn" onclick="updateItemQuantity(${p.id}, -1)">-</button>
                                <span class="qty-number">${qtyInCart} ${p.unit}</span>
                                <button class="qty-btn" onclick="updateItemQuantity(${p.id}, 1)">+</button>
                            </div>
                        ` : `
                            <button class="add-btn" style="width: 100%;" onclick="addToCart(${p.id})">+ اختيار المادة</button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// إضافة منتج إلى السلة
function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.product.id === productId);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ product, quantity: 1 });
    }

    renderProducts();
    updateCartUI();
}

// تعديل كمية منتج في السلة
function updateItemQuantity(productId, change) {
    const index = cart.findIndex(item => item.product.id === productId);
    if (index === -1) return;

    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    renderProducts();
    updateCartUI();
    renderCartModalItems();
}

// حذف منتج بالكامل من السلة
function removeFromCart(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    renderProducts();
    updateCartUI();
    renderCartModalItems();
}

// تحديث واجهة السلة (العلامة والشريط السفلي)
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartBadge = document.getElementById("cartBadge");
    const floatingCartBar = document.getElementById("floatingCartBar");
    const summaryCount = document.getElementById("summaryCount");

    if (cartBadge) cartBadge.textContent = totalItems;

    if (floatingCartBar) {
        if (totalItems > 0) {
            floatingCartBar.style.display = "flex";
            if (summaryCount) summaryCount.textContent = `تم اختيار ${totalItems} مواد`;
        } else {
            floatingCartBar.style.display = "none";
        }
    }
}

// فتح نافذة السلة
function openCartModal() {
    const modalOverlay = document.getElementById("cartModal");
    if (modalOverlay) {
        modalOverlay.classList.add("active");
        renderCartModalItems();
    }
}

// إغلاق نافذة السلة
function closeCartModal() {
    const modalOverlay = document.getElementById("cartModal");
    if (modalOverlay) {
        modalOverlay.classList.remove("active");
    }
}

// عرض محتويات السلة داخل النافذة المنبثقة
function renderCartModalItems() {
    const listContainer = document.getElementById("modalCartItems");
    const totalItemsCount = document.getElementById("modalTotalItemsCount");
    if (!listContainer) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItemsCount) totalItemsCount.textContent = `${totalItems} مواد`;

    if (cart.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-cart-msg">
                <span>🛒</span>
                لم تقم باختيار أي مواد حتى الآن.
            </div>
        `;
        return;
    }

    listContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.product.name}</div>
                <div class="cart-item-unit">الكمية: ${item.quantity} (${item.product.unit})</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateItemQuantity(${item.product.id}, -1)">-</button>
                <span class="qty-number">${item.quantity}</span>
                <button class="qty-btn" onclick="updateItemQuantity(${item.product.id}, 1)">+</button>
                <button class="delete-btn" onclick="removeFromCart(${item.product.id})" title="حذف">🗑️</button>
            </div>
        </div>
    `).join("");
}

// التحقق من استمارة بيانات الزبون
function validateForm() {
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();

    if (cart.length === 0) {
        alert("يرجى اختيار بضاعة أولاً قبل إرسال الطلب!");
        return null;
    }

    if (!name || !phone || !address) {
        alert("يرجى ملء جميع الحقول المطلوبة (الاسم، رقم الهاتف، والعنوان).");
        return null;
    }

    const notes = document.getElementById("custNotes") ? document.getElementById("custNotes").value.trim() : "";

    return { name, phone, address, notes };
}

// توليد ملف HTML مرئي تفاعلي يحتوي على صور البضائع واسم الزبون وتفاصيله
function generateVisualOrderHTML(customerInfo) {
    const sanitizedName = customerInfo.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sanitizedPhone = customerInfo.phone.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sanitizedAddress = customerInfo.address.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sanitizedNotes = customerInfo.notes ? customerInfo.notes.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

    let itemsHTML = cart.map((item, index) => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px dashed #e2e8f0; background: #ffffff; border-radius: 10px; margin-bottom: 8px;">
            <img src="${item.product.image}" alt="${item.product.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1;">
            <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 0.95rem; color: #1e293b;">${index + 1}. ${item.product.name}</div>
                <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">الكمية: <span style="font-weight: bold; color: #059669; font-size: 1rem;">${item.quantity}</span> (${item.product.unit})</div>
            </div>
        </div>
    `).join("");

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ملف طلب - ${sanitizedName}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
        body { background-color: #f1f5f9; color: #1e293b; padding: 16px; direction: rtl; max-width: 480px; margin: 0 auto; }
        .header { background: #059669; color: white; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(5,150,105,0.2); }
        .header h1 { font-size: 1.25rem; font-weight: bold; }
        .header p { font-size: 0.85rem; opacity: 0.9; margin-top: 4px; }
        .card { background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .card h2 { font-size: 1rem; color: #059669; margin-bottom: 12px; border-bottom: 2px solid #ecfdf5; padding-bottom: 6px; }
        .info-row { font-size: 0.9rem; margin-bottom: 8px; line-height: 1.4; }
        .info-row strong { color: #0f172a; }
        .footer-note { text-align: center; font-size: 0.8rem; color: #64748b; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛍️ تاپ مارت - Top Mart</h1>
        <p>ملف طلب بضاعة بالصور والكميات</p>
    </div>

    <div class="card">
        <h2>👤 معلومات الزبون</h2>
        <div class="info-row"><strong>الاسم الكامل:</strong> ${sanitizedName}</div>
        <div class="info-row"><strong>رقم الهاتف:</strong> <a href="tel:${sanitizedPhone}" style="color:#059669; text-decoration:none; font-weight:bold;">${sanitizedPhone}</a></div>
        <div class="info-row"><strong>العنوان التفصيلي:</strong> ${sanitizedAddress}</div>
        ${sanitizedNotes ? `<div class="info-row"><strong>ملاحظات الطلب:</strong> ${sanitizedNotes}</div>` : ''}
        <div class="info-row" style="font-size: 0.78rem; color: #94a3b8; margin-top: 10px;">📅 تاريخ الطلب: ${new Date().toLocaleString('ar-EG')}</div>
    </div>

    <div class="card">
        <h2>📦 البضائع المطلوبة بالصور (${cart.reduce((sum, item) => sum + item.quantity, 0)} مادة)</h2>
        ${itemsHTML}
    </div>

    <div class="footer-note">
        تم توليد هذا الملف تلقائياً عبر تطبيق تاپ مارت لطلب البضائع.
    </div>
</body>
</html>`;
}

// تنزيل ملف الطلب المرئي بحجم وخيار HTML وإرسال توجيه عبر الواتساب
function sendOrderFileViaWhatsApp() {
    const customerInfo = validateForm();
    if (!customerInfo) return;

    // 1. إنشاء وتحميل ملف HTML المصور
    const htmlContent = generateVisualOrderHTML(customerInfo);
    const fileName = `طلب_${customerInfo.name.replace(/\s+/g, "_")}.html`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);

    // 2. إعداد رسالة الواتساب المرفقة بملف الطلب
    let message = `🛍️ *طلب بضاعة جديد من ${STORE_CONFIG.storeName}*\n`;
    message += `---------------------------------\n`;
    message += `👤 *الاسم:* ${customerInfo.name}\n`;
    message += `📞 *الهاتف:* ${customerInfo.phone}\n`;
    message += `📍 *العنوان:* ${customerInfo.address}\n`;
    message += `---------------------------------\n`;
    message += `📎 *قمت بتنزيل ملف الطلب المصور (${fileName}) الذي يحتوي على كافة الصور والكميات المختارة.*\n\n`;
    message += `يرجى فتح الملف المرفق لتجهيز الطلب. شكراً لكم!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodedMessage}`;

    // 3. تنبيه الزبون ليرفق الملف في محادثة الواتساب
    setTimeout(() => {
        alert(`تم تنزيل ملف الطلب (${fileName}) على جهازك بنجاح!\n\nيرجى الضغط على زر المرفقات 📎 في الواتساب وإرسال الملف لتظهر صور المنتجات والكميات بوضوح للماركت.`);
        window.open(whatsappUrl, "_blank");
    }, 600);
}

// تحميل ملف الطلب النصي TXT
function downloadOrderFileTxt() {
    const customerInfo = validateForm();
    if (!customerInfo) return;

    let fileContent = `=======================================\n`;
    fileContent += `       طلب بضاعة - ${STORE_CONFIG.storeName}\n`;
    fileContent += `=======================================\n\n`;
    fileContent += `معلومات الزبون:\n`;
    fileContent += `  الاسم الكامل: ${customerInfo.name}\n`;
    fileContent += `  رقم الهاتف:  ${customerInfo.phone}\n`;
    fileContent += `  العنوان:      ${customerInfo.address}\n`;
    if (customerInfo.notes) {
        fileContent += `  ملاحظات:     ${customerInfo.notes}\n`;
    }
    fileContent += `\n---------------------------------------\n`;
    fileContent += `تفاصيل البضائع المطلوبة:\n`;
    fileContent += `---------------------------------------\n`;

    cart.forEach((item, index) => {
        fileContent += `${index + 1}. ${item.product.name}\n`;
        fileContent += `   الكمية المطلوب توصيلها: ${item.quantity} ${item.product.unit}\n\n`;
    });

    fileContent += `---------------------------------------\n`;
    fileContent += `إجمالي عدد البضائع: ${cart.reduce((sum, item) => sum + item.quantity, 0)} مادة\n`;
    fileContent += `تاريخ الطلب: ${new Date().toLocaleString('ar-EG')}\n`;
    fileContent += `=======================================\n`;

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `طلب_${customerInfo.name.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
}
