/**
 * نظام تجهيز الطلبات - توب مارت
 * Top Mart Order Fulfillment Web Application PRO v2.0
 */

const STORAGE_KEY = 'topmart_orders_v6';
const BACKUP_STORAGE_KEY = 'topmart_orders_backup_v6';
const THEME_KEY = 'topmart_theme_v1';
const SETTINGS_KEY = 'topmart_settings_v1';

// App State
let orders = [];
let activeOrderId = null;
let currentFilter = 'all';
let currentItemFilter = 'all';
let searchQuery = '';
let settings = {
    sound: true,
    haptic: true
};

// Audio Context for offline synthesized sounds
let audioCtx = null;

// DOM Elements - Main View
const ordersListEl = document.getElementById('ordersList');
const emptyStateEl = document.getElementById('emptyState');
const emptyStateTitle = document.getElementById('emptyStateTitle');
const emptyStateDesc = document.getElementById('emptyStateDesc');
const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const backupBtn = document.getElementById('backupBtn');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const autoSaveBadge = document.getElementById('autoSaveBadge');
let autoSaveBadgeTimer = null;

// DOM Elements - Stats & Tab Counts
const statTotalOrders = document.getElementById('statTotalOrders');
const statPreparedItems = document.getElementById('statPreparedItems');
const statMissingItems = document.getElementById('statMissingItems');
const statPendingItems = document.getElementById('statPendingItems');
const statCompletedCount = document.getElementById('statCompletedCount');
const statTotalRevenue = document.getElementById('statTotalRevenue');
const statActiveRevenue = document.getElementById('statActiveRevenue');

const countFilterAll = document.getElementById('countFilterAll');
const countFilterInProgress = document.getElementById('countFilterInProgress');
const countFilterCompleted = document.getElementById('countFilterCompleted');
const countFilterHasMissing = document.getElementById('countFilterHasMissing');

// DOM Elements - Views
const mainView = document.getElementById('mainView');
const orderDetailView = document.getElementById('orderDetailView');

// DOM Elements - Order Detail View
const closeDetailViewBtn = document.getElementById('closeDetailViewBtn');
const detailOrderCode = document.getElementById('detailOrderCode');
const editOrderInfoBtn = document.getElementById('editOrderInfoBtn');
const deleteOrderDetailBtn = document.getElementById('deleteOrderDetailBtn');

const detailCustomerPhone = document.getElementById('detailCustomerPhone');
const detailCustomerName = document.getElementById('detailCustomerName');
const detailAppSource = document.getElementById('detailAppSource');
const detailCreatedAt = document.getElementById('detailCreatedAt');
const detailCustomerAddressWrap = document.getElementById('detailCustomerAddressWrap');
const detailCustomerAddressText = document.getElementById('detailCustomerAddressText');
const detailOrderNotesWrap = document.getElementById('detailOrderNotesWrap');
const detailOrderNotesText = document.getElementById('detailOrderNotesText');

const headerCompleteBtn = document.getElementById('headerCompleteBtn');
const toggleCompleteOrderBtn = document.getElementById('toggleCompleteOrderBtn');
const completeOrderBtnIcon = document.getElementById('completeOrderBtnIcon');
const completeOrderBtnText = document.getElementById('completeOrderBtnText');

const openShareReportBtn = document.getElementById('openShareReportBtn');

// DOM Elements - Add Item in Detail
const addItemForm = document.getElementById('addItemForm');
const newItemInput = document.getElementById('newItemInput');
const newItemQtyInput = document.getElementById('newItemQtyInput');
const qtyMinusBtn = document.getElementById('qtyMinusBtn');
const qtyPlusBtn = document.getElementById('qtyPlusBtn');
const openPasteMultiBtn = document.getElementById('openPasteMultiBtn');

// DOM Elements - Packing Detail Progress & Checklist
const detailPreparedCount = document.getElementById('detailPreparedCount');
const detailMissingCount = document.getElementById('detailMissingCount');
const detailPendingCount = document.getElementById('detailPendingCount');
const detailTotalCount = document.getElementById('detailTotalCount');
const detailFillPrepared = document.getElementById('detailFillPrepared');
const detailFillMissing = document.getElementById('detailFillMissing');

const markAllRemainingReadyBtn = document.getElementById('markAllRemainingReadyBtn');
const detailItemsList = document.getElementById('detailItemsList');

const itemFilterAllCount = document.getElementById('itemFilterAllCount');
const itemFilterPendingCount = document.getElementById('itemFilterPendingCount');
const itemFilterPreparedCount = document.getElementById('itemFilterPreparedCount');
const itemFilterMissingCount = document.getElementById('itemFilterMissingCount');

// DOM Elements - Add / Edit Order Modal
const orderModal = document.getElementById('orderModal');
const orderForm = document.getElementById('orderForm');
const modalTitle = document.getElementById('modalTitle');
const editOrderIdInput = document.getElementById('editOrderId');
const customerPhoneInput = document.getElementById('customerPhone');
const customerNameInput = document.getElementById('customerName');
const customerAddressInput = document.getElementById('customerAddress');
const appSourceInput = document.getElementById('appSource');
const orderNotesInput = document.getElementById('orderNotes');
const orderAmountInput = document.getElementById('orderAmount');
const orderCategoryInput = document.getElementById('orderCategory');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

// DOM Elements - Paste Multi-Line Modal
const pasteMultiModal = document.getElementById('pasteMultiModal');
const multiTextPasteInput = document.getElementById('multiTextPasteInput');
const closePasteMultiBtn = document.getElementById('closePasteMultiBtn');
const cancelPasteMultiBtn = document.getElementById('cancelPasteMultiBtn');
const submitPasteMultiBtn = document.getElementById('submitPasteMultiBtn');

// DOM Elements - WhatsApp Share Report Modal
const shareReportModal = document.getElementById('shareReportModal');
const reportPreviewContent = document.getElementById('reportPreviewContent');
const sendWhatsAppReportBtn = document.getElementById('sendWhatsAppReportBtn');
const copyReportTextBtn = document.getElementById('copyReportTextBtn');
const closeShareReportBtn = document.getElementById('closeShareReportBtn');
const cancelShareReportBtn = document.getElementById('cancelShareReportBtn');

// DOM Elements - Settings & Backup Modal
const backupModal = document.getElementById('backupModal');
const closeBackupModalBtn = document.getElementById('closeBackupModalBtn');
const soundToggleInput = document.getElementById('soundToggleInput');
const hapticToggleInput = document.getElementById('hapticToggleInput');
const exportDataBtn = document.getElementById('exportDataBtn');
const importFileInput = document.getElementById('importFileInput');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// Toast
const toastEl = document.getElementById('toast');
let toastTimer = null;

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadSettings();
    loadOrders();
    setupEventListeners();
    renderMainList();
});

// ================= THEME & SETTINGS =================
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeIcon(newTheme);
    triggerHaptic(15);
    playSynthesizedSound('click');
    showToast(newTheme === 'dark' ? 'تم التبديل للوضع الليلي 🌙' : 'تم التبديل للوضع النهاري ☀️');
}

function updateThemeIcon(theme) {
    const themeIcon = themeToggleBtn.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            settings = Object.assign(settings, JSON.parse(saved));
        }
    } catch (e) {
        console.error('Error loading settings:', e);
    }
    soundToggleInput.checked = settings.sound !== false;
    hapticToggleInput.checked = settings.haptic !== false;
}

function saveSettings() {
    try {
        settings.sound = soundToggleInput.checked;
        settings.haptic = hapticToggleInput.checked;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Error saving settings:', e);
    }
}

// ================= SOUND & HAPTIC SYNTHESIZER =================
function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSynthesizedSound(type) {
    if (!settings.sound) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'check') {
            // High crisp positive chime
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1250, now + 0.08);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'missing') {
            // Soft low warning tone
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.14);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'complete') {
            // Ascending chord
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                const subOsc = ctx.createOscillator();
                const subGain = ctx.createGain();
                subOsc.connect(subGain);
                subGain.connect(ctx.destination);
                subOsc.type = 'sine';
                subOsc.frequency.setValueAtTime(freq, now + i * 0.06);
                subGain.gain.setValueAtTime(0.15, now + i * 0.06);
                subGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.18);
                subOsc.start(now + i * 0.06);
                subOsc.stop(now + i * 0.06 + 0.18);
            });
        } else if (type === 'click') {
            // Gentle click
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        }
    } catch (e) {
        // Silently fail if audio context blocked by browser autoplay policy
    }
}

function triggerHaptic(duration = 20) {
    if (!settings.haptic) return;
    if (window.navigator && typeof window.navigator.vibrate === 'function') {
        try {
            window.navigator.vibrate(duration);
        } catch (e) {
            // ignore
        }
    }
}

// ================= DATA PERSISTENCE & AUTO-SAVE ENGINE =================
function flashAutoSaveIndicator() {
    if (!autoSaveBadge) return;
    autoSaveBadge.style.transform = 'scale(1.08)';
    autoSaveBadge.style.borderColor = 'var(--success-color)';
    autoSaveBadge.innerHTML = '<span class="save-dot" style="background-color:#10b981;box-shadow:0 0 8px #10b981"></span> تم الحفظ الآن';
    
    if (autoSaveBadgeTimer) clearTimeout(autoSaveBadgeTimer);
    autoSaveBadgeTimer = setTimeout(() => {
        if (autoSaveBadge) {
            autoSaveBadge.style.transform = 'scale(1)';
            autoSaveBadge.style.borderColor = 'var(--success-border)';
            autoSaveBadge.innerHTML = '<span class="save-dot"></span> محفوظ تلقائياً';
        }
    }, 1200);
}

function loadOrders() {
    try {
        let data = localStorage.getItem(STORAGE_KEY);
        // Fallback to secondary safety mirror if primary is missing or empty
        if (!data || data === '[]') {
            const backup = localStorage.getItem(BACKUP_STORAGE_KEY);
            if (backup && backup !== '[]') {
                data = backup;
                console.log('Restored Top Mart data from secondary safety mirror');
            }
        }

        orders = data ? JSON.parse(data) : [];

        // Data migration / sanity check
        if (!Array.isArray(orders)) orders = [];
        orders.forEach(order => {
            if (!order.items) order.items = [];
            // Assign code if missing
            if (!order.code) {
                order.code = generateOrderCode(order);
            }
            // Ensure each item has a valid status (prepared | missing | pending)
            order.items.forEach(item => {
                if (item.status !== 'prepared' && item.status !== 'missing') {
                    item.status = 'pending';
                }
                if (!item.qty || isNaN(item.qty) || item.qty < 1) {
                    item.qty = 1;
                }
            });
        });
        saveOrders();
    } catch (e) {
        console.error('Error loading orders:', e);
        orders = [];
    }
}

function saveOrders() {
    try {
        const serialized = JSON.stringify(orders);
        // 1. Primary Local Storage
        localStorage.setItem(STORAGE_KEY, serialized);
        // 2. Instant Secondary Mirror Storage (Prevents data loss under any circumstance)
        localStorage.setItem(BACKUP_STORAGE_KEY, serialized);
        // 3. Trigger live UI feedback
        flashAutoSaveIndicator();
    } catch (e) {
        console.error('Error saving orders:', e);
        showToast('تعذر حفظ البيانات في الذاكرة المحلية!');
    }
}

function generateOrderCode(order) {
    if (order.id) {
        const numPart = order.id.replace(/\D/g, '').slice(-3);
        return '#' + (numPart || Math.floor(100 + Math.random() * 900));
    }
    return '#' + Math.floor(100 + Math.random() * 900);
}

// ================= EVENT LISTENERS SETUP =================
function setupEventListeners() {
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Search Input
    searchInput.addEventListener('input', (e) => {
        // Preserve original casing for Arabic; only lowercase for Latin matching
        const raw = e.target.value.trim();
        searchQuery = raw.toLowerCase();
        clearSearchBtn.classList.toggle('hidden', raw === '');
        renderMainList();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.classList.add('hidden');
        renderMainList();
        searchInput.focus();
    });

    // Main Filter Tabs
    document.querySelectorAll('.filter-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            triggerHaptic(15);
            playSynthesizedSound('click');
            renderMainList();
        });
    });

    // Detail Item Sub-Filter Tabs
    document.querySelectorAll('.item-filter-tabs .item-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.item-filter-tabs .item-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentItemFilter = btn.dataset.itemFilter;
            triggerHaptic(15);
            playSynthesizedSound('click');
            renderDetailItems();
        });
    });

    // Add Order Modals
    openAddModalBtn.addEventListener('click', () => openOrderModal());
    emptyStateAddBtn.addEventListener('click', () => openOrderModal());
    closeModalBtn.addEventListener('click', closeOrderModal);
    cancelModalBtn.addEventListener('click', closeOrderModal);
    orderForm.addEventListener('submit', handleOrderFormSubmit);

    // Detail Screen Navigation & Actions
    closeDetailViewBtn.addEventListener('click', closeOrderDetail);
    editOrderInfoBtn.addEventListener('click', () => {
        if (activeOrderId) openOrderModal(activeOrderId);
    });
    deleteOrderDetailBtn.addEventListener('click', () => {
        if (activeOrderId) deleteOrder(activeOrderId);
    });

    // Complete / Reopen Order Handlers
    if (headerCompleteBtn) {
        headerCompleteBtn.addEventListener('click', () => {
            if (activeOrderId) toggleOrderCompletion(activeOrderId);
        });
    }
    if (toggleCompleteOrderBtn) {
        toggleCompleteOrderBtn.addEventListener('click', () => {
            if (activeOrderId) toggleOrderCompletion(activeOrderId);
        });
    }

    // Add Item Form & Stepper
    addItemForm.addEventListener('submit', handleAddItemSubmit);
    qtyMinusBtn.addEventListener('click', () => {
        let val = parseInt(newItemQtyInput.value, 10) || 1;
        if (val > 1) newItemQtyInput.value = val - 1;
        triggerHaptic(10);
    });
    qtyPlusBtn.addEventListener('click', () => {
        let val = parseInt(newItemQtyInput.value, 10) || 1;
        newItemQtyInput.value = val + 1;
        triggerHaptic(10);
    });

    // Mark All Ready Bulk Button
    markAllRemainingReadyBtn.addEventListener('click', markAllRemainingAsReady);

    // Paste Multi-Line Text Modal
    openPasteMultiBtn.addEventListener('click', () => {
        multiTextPasteInput.value = '';
        pasteMultiModal.classList.remove('hidden');
        multiTextPasteInput.focus();
    });
    closePasteMultiBtn.addEventListener('click', () => pasteMultiModal.classList.add('hidden'));
    cancelPasteMultiBtn.addEventListener('click', () => pasteMultiModal.classList.add('hidden'));
    submitPasteMultiBtn.addEventListener('click', handlePasteMultiSubmit);

    // Share / WhatsApp Report Modal
    openShareReportBtn.addEventListener('click', openWhatsAppReportModal);
    closeShareReportBtn.addEventListener('click', () => shareReportModal.classList.add('hidden'));
    cancelShareReportBtn.addEventListener('click', () => shareReportModal.classList.add('hidden'));
    sendWhatsAppReportBtn.addEventListener('click', sendWhatsAppReport);
    copyReportTextBtn.addEventListener('click', copyReportText);

    // Copy Delivery Info for Driver (phone + address)
    const copyDeliveryInfoBtn = document.getElementById('copyDeliveryInfoBtn');
    if (copyDeliveryInfoBtn) {
        copyDeliveryInfoBtn.addEventListener('click', () => {
            if (activeOrderId) copyDeliveryInfo(activeOrderId);
        });
    }

    // Settings Modal
    backupBtn.addEventListener('click', () => backupModal.classList.remove('hidden'));
    closeBackupModalBtn.addEventListener('click', () => backupModal.classList.add('hidden'));
    soundToggleInput.addEventListener('change', saveSettings);
    hapticToggleInput.addEventListener('change', saveSettings);
    exportDataBtn.addEventListener('click', exportDataJSON);
    importFileInput.addEventListener('change', importDataJSON);
    clearCompletedBtn.addEventListener('click', clearCompletedOrders);
    clearAllBtn.addEventListener('click', clearAllOrders);

    // Backdrop click closures
    [orderModal, backupModal, pasteMultiModal, shareReportModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    });

    // Global Keybindings (ESC to close modals or detail view)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (completeOrderModal && !completeOrderModal.classList.contains('hidden')) closeCompleteOrderModal();
            else if (!shareReportModal.classList.contains('hidden')) shareReportModal.classList.add('hidden');
            else if (!pasteMultiModal.classList.contains('hidden')) pasteMultiModal.classList.add('hidden');
            else if (!orderModal.classList.contains('hidden')) orderModal.classList.add('hidden');
            else if (!backupModal.classList.contains('hidden')) backupModal.classList.add('hidden');
            else if (!orderDetailView.classList.contains('hidden')) closeOrderDetail();
        }
    });

    // Quick Clear Completed Orders button (with confirmation)
    const quickClearBtn = document.getElementById('quickClearBtn');
    if (quickClearBtn) {
        quickClearBtn.addEventListener('click', () => {
            const completed = orders.filter(o => o.isCompleted);
            if (completed.length === 0) {
                showToast('لا توجد طلبات مكتملة لحذفها!');
                return;
            }
            if (confirm(`هل أنت متأكد من مسح ${completed.length} طلب مكتمل\nسيتم حذفها نهائياً ولا يمكن التراجع.`)) {
                orders = orders.filter(o => !o.isCompleted);
                saveOrders();
                renderMainList();
                triggerHaptic(30);
                showToast(`تم مسح ${completed.length} طلب مكتمل 🧹`);
            }
        });
    }

    // Complete Order Modal - Amount Entry
    if (confirmCompleteOrderBtn) {
        confirmCompleteOrderBtn.addEventListener('click', completeOrderWithAmount);
    }
    if (cancelCompleteOrderBtn) {
        cancelCompleteOrderBtn.addEventListener('click', closeCompleteOrderModal);
    }
    if (closeCompleteOrderModalBtn) {
        closeCompleteOrderModalBtn.addEventListener('click', closeCompleteOrderModal);
    }
    if (completeOrderModal) {
        completeOrderModal.addEventListener('click', (e) => {
            if (e.target === completeOrderModal) closeCompleteOrderModal();
        });
        // Allow pressing Enter in amount field to confirm
        if (completeOrderAmountInput) {
            completeOrderAmountInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    completeOrderWithAmount();
                }
            });
        }
    }

    // Auto-Save safety hooks
    window.addEventListener('beforeunload', () => saveOrders());
    window.addEventListener('pagehide', () => saveOrders());
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') saveOrders();
    });
}

// ================= ORDER CREATION & EDITING =================
function openOrderModal(orderId = null) {
    orderForm.reset();
    if (orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        modalTitle.textContent = 'تعديل بيانات الطلب';
        editOrderIdInput.value = order.id;
        customerPhoneInput.value = order.customerPhone || '';
        customerNameInput.value = order.customerName || '';
        if (customerAddressInput) customerAddressInput.value = order.customerAddress || '';
        if (orderCategoryInput) orderCategoryInput.value = order.orderCategory || 'دليفري';
        appSourceInput.value = order.appSource || 'واتساب (WhatsApp)';
        orderNotesInput.value = order.orderNotes || '';
    } else {
        modalTitle.textContent = 'إضافة طلب جديد';
        editOrderIdInput.value = '';
        if (customerAddressInput) customerAddressInput.value = '';
        if (orderCategoryInput) orderCategoryInput.value = 'دليفري';
        appSourceInput.value = 'واتساب (WhatsApp)';
    }
    orderModal.classList.remove('hidden');
    setTimeout(() => customerPhoneInput.focus(), 150);
}

function closeOrderModal() {
    orderModal.classList.add('hidden');
}

function handleOrderFormSubmit(e) {
    e.preventDefault();

    const phone = customerPhoneInput.value.trim();
    const name = customerNameInput.value.trim();
    const address = customerAddressInput ? customerAddressInput.value.trim() : '';
    const amount = orderAmountInput ? parseFloat(orderAmountInput.value) : 0;
    const category = orderCategoryInput ? orderCategoryInput.value.trim() : 'دليفري';
    const source = appSourceInput.value.trim();
    const notes = orderNotesInput.value.trim();

    if (!phone) {
        showToast('يرجى إدخال رقم هاتف الزبون!');
        customerPhoneInput.focus();
        return;
    }

    const editId = editOrderIdInput.value;

    if (editId) {
        // Edit Existing Order
        const order = orders.find(o => o.id === editId);
        if (order) {
            order.customerPhone = phone;
            order.customerName = name;
            order.customerAddress = address;
            order.orderAmount = amount;
            order.orderCategory = category;
            order.appSource = source;
            order.orderNotes = notes;
            saveOrders();
            closeOrderModal();
            triggerHaptic(20);
            playSynthesizedSound('complete');
            showToast('تم تحديث بيانات الطلب بنجاح ✔️');
            if (activeOrderId === editId) renderOrderDetailHeader(order);
            renderMainList();
        }
    } else {
        // Create New Order
        const newId = 'ord_' + Date.now();
        const newOrder = {
            id: newId,
            code: '#' + Math.floor(100 + (orders.length + 1)),
            customerPhone: phone,
            customerName: name || '',
            customerAddress: address || '',
            orderAmount: amount,
            orderCategory: category || 'دليفري',
            appSource: source || 'واتساب (WhatsApp)',
            orderNotes: notes,
            createdAt: new Date().toISOString(),
            items: []
        };

        orders.unshift(newOrder);
        saveOrders();
        closeOrderModal();
        triggerHaptic(25);
        playSynthesizedSound('complete');
        showToast('تم إنشاء الطلب! أضف المواد الآن 🚀');

        // Directly open packing screen for immediate item entry
        openOrderDetail(newOrder.id);
        renderMainList();
    }
}

// ================= ORDER DETAIL & PACKING SCREEN =================
function openOrderDetail(orderId) {
    activeOrderId = orderId;
    currentItemFilter = 'all';

    // Reset subfilter buttons
    document.querySelectorAll('.item-filter-tabs .item-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.itemFilter === 'all');
    });

    const order = orders.find(o => o.id === activeOrderId);
    if (!order) {
        closeOrderDetail();
        return;
    }

    renderOrderDetailHeader(order);
    renderDetailItems();

    orderDetailView.classList.remove('hidden');
    setTimeout(() => {
        newItemInput.focus();
    }, 150);
}

function closeOrderDetail() {
    orderDetailView.classList.add('hidden');
    activeOrderId = null;
    renderMainList();
}

function renderOrderDetailHeader(order) {
    detailOrderCode.textContent = order.code || generateOrderCode(order);
    detailCustomerPhone.textContent = order.customerPhone || 'بدون رقم';
    detailCustomerName.textContent = order.customerName ? `الزبون: ${order.customerName}` : 'الزبون: غير محدد';
    detailAppSource.textContent = order.appSource || 'واتساب (WhatsApp)';
    detailCreatedAt.textContent = formatRelativeTime(order.createdAt);

    // Show Amount Badge prominently
    let amountBadge = document.getElementById('detailAmountBadge');
    if (!amountBadge) {
        amountBadge = document.createElement('span');
        amountBadge.id = 'detailAmountBadge';
        amountBadge.className = 'detail-amount-badge';
        detailCustomerName.parentNode.insertBefore(amountBadge, detailCustomerName.nextSibling);
    }
    if (order.orderAmount && order.orderAmount > 0) {
        amountBadge.textContent = `💰 ${Number(order.orderAmount).toLocaleString('ar-IQ')} د.ع`;
        amountBadge.classList.remove('hidden');
    } else {
        amountBadge.classList.add('hidden');
    }

    // Show Category Badge
    let catBadge = document.getElementById('detailCategoryBadge');
    if (!catBadge) {
        catBadge = document.createElement('span');
        catBadge.id = 'detailCategoryBadge';
        catBadge.className = 'detail-category-badge';
        detailAppSource.parentNode.insertBefore(catBadge, detailAppSource.nextSibling);
    }
    if (order.orderCategory) {
        catBadge.textContent = `📂 ${order.orderCategory}`;
        catBadge.classList.remove('hidden');
    } else {
        catBadge.classList.add('hidden');
    }

    // Customer Delivery Address / Location
    if (order.customerAddress && order.customerAddress.trim() !== '') {
        detailCustomerAddressWrap.classList.remove('hidden');
        detailCustomerAddressText.textContent = order.customerAddress;
    } else {
        detailCustomerAddressWrap.classList.add('hidden');
    }

    // Customer / Order Notes (Prominently shown!)
    if (order.orderNotes && order.orderNotes.trim() !== '') {
        detailOrderNotesWrap.classList.remove('hidden');
        detailOrderNotesText.textContent = order.orderNotes;
    } else {
        detailOrderNotesWrap.classList.add('hidden');
    }

    // Update the Complete / Reopen Button state
    updateDetailCompleteButton(order);
}

function renderDetailItems() {
    const order = orders.find(o => o.id === activeOrderId);
    if (!order) return;

    const totalCount = order.items.length;
    const preparedCount = order.items.filter(i => i.status === 'prepared').length;
    const missingCount = order.items.filter(i => i.status === 'missing').length;
    const pendingCount = order.items.filter(i => i.status === 'pending').length;

    // Update Progress Counters
    detailPreparedCount.textContent = `جاهز: ${preparedCount}`;
    detailMissingCount.textContent = `نواقص: ${missingCount}`;
    detailPendingCount.textContent = `متبقي: ${pendingCount}`;
    detailTotalCount.textContent = `الإجمالي: ${totalCount}`;

    // Update Subfilter Badges
    itemFilterAllCount.textContent = totalCount;
    itemFilterPendingCount.textContent = pendingCount;
    itemFilterPreparedCount.textContent = preparedCount;
    itemFilterMissingCount.textContent = missingCount;

    // Multi-segment progress bar percentages
    const prepPct = totalCount > 0 ? (preparedCount / totalCount) * 100 : 0;
    const missPct = totalCount > 0 ? (missingCount / totalCount) * 100 : 0;
    detailFillPrepared.style.width = `${prepPct}%`;
    detailFillMissing.style.width = `${missPct}%`;

    // Filter Items based on current subfilter
    let itemsToDisplay = order.items;
    if (currentItemFilter === 'pending') {
        itemsToDisplay = order.items.filter(i => i.status === 'pending');
    } else if (currentItemFilter === 'prepared') {
        itemsToDisplay = order.items.filter(i => i.status === 'prepared');
    } else if (currentItemFilter === 'missing') {
        itemsToDisplay = order.items.filter(i => i.status === 'missing');
    }

    if (totalCount === 0) {
        detailItemsList.innerHTML = `
            <div class="empty-state" style="padding: 30px 10px;">
                <span style="font-size: 32px; margin-bottom: 8px;">🛒</span>
                <h4 style="font-size: 15px; margin-bottom: 4px;">قائمة المواد فارغة</h4>
                <p style="font-size: 12px; color: var(--text-muted);">
                    أدخل اسم المادة والعدد أعلاه واضغط <strong>+ إضافة</strong>، أو الصق قائمة الواتساب دفعة واحدة.
                </p>
            </div>
        `;
        return;
    }

    if (itemsToDisplay.length === 0) {
        detailItemsList.innerHTML = `
            <div class="empty-state" style="padding: 24px 10px;">
                <p style="font-size: 13px; color: var(--text-muted);">لا توجد مواد مطابقة لهذا الفلتر.</p>
            </div>
        `;
        return;
    }

    // Render Items Cards
    detailItemsList.innerHTML = itemsToDisplay.map(item => {
        const isPrepared = item.status === 'prepared';
        const isMissing = item.status === 'missing';
        const qty = item.qty || 1;

        let statusClass = '';
        if (isPrepared) statusClass = 'is-prepared';
        else if (isMissing) statusClass = 'is-missing';

        return `
            <div class="packing-item-card ${statusClass}" data-item-id="${item.id}">
                <div class="item-qty-badge-group">
                    <button class="item-micro-step" data-action="qty-minus" title="إنقاص الكمية">-</button>
                    <span class="item-qty-value">${qty}</span>
                    <button class="item-micro-step" data-action="qty-plus" title="زيادة الكمية">+</button>
                </div>

                <span class="packing-item-title">${escapeHTML(item.text)}</span>

                <div class="packing-item-actions">
                    <button class="check-mark-btn btn-prepared ${isPrepared ? 'active' : ''}"
                            data-action="set-prepared" title="تأشير كـ جاهز">
                        ✔️ جاهز
                    </button>
                    <button class="check-mark-btn btn-missing ${isMissing ? 'active' : ''}"
                            data-action="set-missing" title="تأشير كـ غير متوفر / نافد">
                        ❌ نافد
                    </button>
                    <button class="delete-item-btn" data-action="delete" title="حذف المادة">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Attach Event Listeners to item cards
    detailItemsList.querySelectorAll('.packing-item-card').forEach(card => {
        const itemId = card.dataset.itemId;

        // Micro Stepper -
        const minusBtn = card.querySelector('[data-action="qty-minus"]');
        if (minusBtn) {
            minusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                updateItemQty(order.id, itemId, -1);
            });
        }

        // Micro Stepper +
        const plusBtn = card.querySelector('[data-action="qty-plus"]');
        if (plusBtn) {
            plusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                updateItemQty(order.id, itemId, 1);
            });
        }

        // Set Prepared Button
        const prepBtn = card.querySelector('[data-action="set-prepared"]');
        if (prepBtn) {
            prepBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                setItemStatus(order.id, itemId, 'prepared');
            });
        }

        // Set Missing Button
        const missBtn = card.querySelector('[data-action="set-missing"]');
        if (missBtn) {
            missBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                setItemStatus(order.id, itemId, 'missing');
            });
        }

        // Delete Button
        const delBtn = card.querySelector('[data-action="delete"]');
        if (delBtn) {
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteItemFromOrder(order.id, itemId);
            });
        }

        // Tapping card row body toggles Prepared / Pending
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            cycleItemStatus(order.id, itemId);
        });
    });
}

// ================= ITEM INTERACTIONS & LOGIC =================
function handleAddItemSubmit(e) {
    e.preventDefault();
    const itemText = newItemInput.value.trim();
    const itemQty = parseInt(newItemQtyInput.value, 10) || 1;

    if (!itemText || !activeOrderId) return;

    const order = orders.find(o => o.id === activeOrderId);
    if (!order) return;

    order.items.push({
        id: 'itm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        text: itemText,
        qty: itemQty,
        status: 'pending'
    });

    saveOrders();
    triggerHaptic(15);
    playSynthesizedSound('click');

    newItemInput.value = '';
    newItemQtyInput.value = '1';
    newItemInput.focus();
    renderDetailItems();
}

function updateItemQty(orderId, itemId, delta) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const item = order.items.find(i => i.id === itemId);
    if (!item) return;

    const newQty = (item.qty || 1) + delta;
    if (newQty < 1) return;

    item.qty = newQty;
    saveOrders();
    triggerHaptic(12);
    playSynthesizedSound('click');
    renderDetailItems();
}

function setItemStatus(orderId, itemId, targetStatus) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const item = order.items.find(i => i.id === itemId);
    if (!item) return;

    // If already active, return to pending
    if (item.status === targetStatus) {
        item.status = 'pending';
        triggerHaptic(15);
        playSynthesizedSound('click');
    } else {
        item.status = targetStatus;
        if (targetStatus === 'prepared') {
            triggerHaptic(25);
            playSynthesizedSound('check');
        } else if (targetStatus === 'missing') {
            triggerHaptic(30);
            playSynthesizedSound('missing');
        }
    }

    saveOrders();
    checkIfAllItemsChecked(order);
    renderDetailItems();
}

function markAllRemainingAsReady() {
    const order = orders.find(o => o.id === activeOrderId);
    if (!order) return;

    const pendingItems = order.items.filter(i => i.status === 'pending');
    if (pendingItems.length === 0) {
        showToast('لا توجد مواد متبقية لتجهيزها!');
        return;
    }

    pendingItems.forEach(item => {
        item.status = 'prepared';
    });

    saveOrders();
    triggerHaptic(40);
    playSynthesizedSound('complete');
    showToast(`تم تجهيز ${pendingItems.length} مواد بنجاح ✔️`);
    checkIfAllItemsChecked(order);
    renderDetailItems();
}

function cycleItemStatus(orderId, itemId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const item = order.items.find(i => i.id === itemId);
    if (!item) return;

    // Pending -> Prepared -> Pending
    if (item.status === 'pending') {
        item.status = 'prepared';
        triggerHaptic(25);
        playSynthesizedSound('check');
    } else if (item.status === 'prepared') {
        item.status = 'pending';
        triggerHaptic(15);
        playSynthesizedSound('click');
    } else {
        item.status = 'pending';
        triggerHaptic(15);
        playSynthesizedSound('click');
    }

    saveOrders();
    checkIfAllItemsChecked(order);
    renderDetailItems();
}

function checkIfAllItemsChecked(order) {
    if (order.items.length > 0 && order.items.every(i => i.status === 'prepared') && !order.isCompleted) {
        playSynthesizedSound('complete');
        showToast('تم تجهيز كل المواد! اضغط "تم تجهيز الطلب" لترحيله للمكتملة ✅');
    }
}

// ================= ORDER COMPLETION FLOW (with Amount Modal) =================
let pendingCompleteOrderId = null;
const completeOrderModal = document.getElementById('completeOrderModal');
const completeOrderSummary = document.getElementById('completeOrderSummary');
const completeOrderAmountInput = document.getElementById('completeOrderAmount');
const confirmCompleteOrderBtn = document.getElementById('confirmCompleteOrderBtn');
const cancelCompleteOrderBtn = document.getElementById('cancelCompleteOrderBtn');
const closeCompleteOrderModalBtn = document.getElementById('closeCompleteOrderModalBtn');

function toggleOrderCompletion(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (order.isCompleted) {
        // Reopen the order — no amount modal needed
        order.isCompleted = false;
        order.completedAt = null;
        saveOrders();
        triggerHaptic(20);
        playSynthesizedSound('click');
        showToast('تمت إعادة الطلب إلى قائمة قيد التجهيز ⏳');
        if (activeOrderId === orderId) {
            updateDetailCompleteButton(order);
        }
        renderMainList();
    } else {
        // Show the completion modal to collect the amount first
        openCompleteOrderModal(orderId);
    }
}

function openCompleteOrderModal(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    pendingCompleteOrderId = orderId;

    // Build order summary for the modal
    const totalItems = order.items.length;
    const preparedCount = order.items.filter(i => i.status === 'prepared').length;
    const missingCount = order.items.filter(i => i.status === 'missing').length;

    if (completeOrderSummary) {
        completeOrderSummary.innerHTML = `
            <div class="complete-summary-row">
                <span class="csummary-icon">📦</span>
                <div class="csummary-info">
                    <span class="csummary-label">رقم الطلب</span>
                    <span class="csummary-val">${order.code || ''}</span>
                </div>
            </div>
            ${order.customerName ? `
            <div class="complete-summary-row">
                <span class="csummary-icon">👤</span>
                <div class="csummary-info">
                    <span class="csummary-label">الزبون</span>
                    <span class="csummary-val">${order.customerName}</span>
                </div>
            </div>` : ''}
            <div class="complete-summary-row">
                <span class="csummary-icon">📞</span>
                <div class="csummary-info">
                    <span class="csummary-label">الهاتف</span>
                    <span class="csummary-val" dir="ltr">${order.customerPhone}</span>
                </div>
            </div>
            <div class="complete-summary-row">
                <span class="csummary-icon">✅</span>
                <div class="csummary-info">
                    <span class="csummary-label">حالة التجهيز</span>
                    <span class="csummary-val">${preparedCount} جاهز ${missingCount > 0 ? '| <span style="color:var(--danger-color)">' + missingCount + ' نافد</span>' : ''} من ${totalItems}</span>
                </div>
            </div>
        `;
    }

    // Pre-fill amount if already set (e.g. from previous edit)
    if (completeOrderAmountInput) {
        completeOrderAmountInput.value = order.orderAmount && order.orderAmount > 0 ? order.orderAmount : '';
    }

    if (completeOrderModal) {
        completeOrderModal.classList.remove('hidden');
        setTimeout(() => {
            if (completeOrderAmountInput) completeOrderAmountInput.focus();
        }, 200);
    }
}

function closeCompleteOrderModal() {
    if (completeOrderModal) completeOrderModal.classList.add('hidden');
    pendingCompleteOrderId = null;
}

function completeOrderWithAmount() {
    if (!pendingCompleteOrderId) return;

    const amountVal = completeOrderAmountInput ? parseFloat(completeOrderAmountInput.value) : 0;

    if (!amountVal || amountVal <= 0) {
        showToast('يرجى إدخال مبلغ الطلب 💰');
        if (completeOrderAmountInput) completeOrderAmountInput.focus();
        return;
    }

    const order = orders.find(o => o.id === pendingCompleteOrderId);
    if (!order) return;

    order.orderAmount = amountVal;
    order.isCompleted = true;
    order.completedAt = new Date().toISOString();
    saveOrders();
    closeCompleteOrderModal();
    triggerHaptic(40);
    playSynthesizedSound('complete');
    showToast(`تم تجهيز الطلب وتسجيل مبلغ ${Number(amountVal).toLocaleString('ar-IQ')} د.ع ✅`);

    if (activeOrderId === pendingCompleteOrderId) {
        closeOrderDetail();
        return;
    }
    renderMainList();
}


function updateDetailCompleteButton(order) {
    if (!toggleCompleteOrderBtn) return;
    if (order.isCompleted) {
        toggleCompleteOrderBtn.className = 'btn btn-reopen-order';
        if (completeOrderBtnIcon) completeOrderBtnIcon.textContent = '↩️';
        if (completeOrderBtnText) completeOrderBtnText.textContent = 'إعادة فتح الطلب (إرجاع لقيد التجهيز)';
        if (headerCompleteBtn) {
            headerCompleteBtn.className = 'icon-btn-warning';
            headerCompleteBtn.textContent = '↩️ استرجاع';
            headerCompleteBtn.title = 'إعادة فتح الطلب';
        }
    } else {
        toggleCompleteOrderBtn.className = 'btn btn-complete-order';
        if (completeOrderBtnIcon) completeOrderBtnIcon.textContent = '✅';
        if (completeOrderBtnText) completeOrderBtnText.textContent = 'تم تجهيز الطلب (ترحيل للطلبات المكتملة)';
        if (headerCompleteBtn) {
            headerCompleteBtn.className = 'icon-btn-success';
            headerCompleteBtn.textContent = '✅ إنهاء';
            headerCompleteBtn.title = 'تم تجهيز الطلب وتسليمه';
        }
    }
}

function deleteItemFromOrder(orderId, itemId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    order.items = order.items.filter(i => i.id !== itemId);
    saveOrders();
    triggerHaptic(20);
    renderDetailItems();
}

function deleteOrder(orderId) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب بالكامل؟ لا يمكن التراجع عن هذا الإجراء.')) {
        orders = orders.filter(o => o.id !== orderId);
        saveOrders();
        triggerHaptic(30);
        if (activeOrderId === orderId) closeOrderDetail();
        renderMainList();
        showToast('تم حذف الطلب بنجاح 🗑️');
    }
}

// ================= SMART MULTI-LINE PASTE PARSER =================
function handlePasteMultiSubmit() {
    const rawText = multiTextPasteInput.value.trim();
    if (!rawText || !activeOrderId) return;

    const order = orders.find(o => o.id === activeOrderId);
    if (!order) return;

    const lines = rawText.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

    let addedCount = 0;

    lines.forEach((lineText, idx) => {
        const parsed = parseSmartProductLine(lineText);
        if (parsed && parsed.text) {
            order.items.push({
                id: 'itm_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 3),
                text: parsed.text,
                qty: parsed.qty || 1,
                status: 'pending'
            });
            addedCount++;
        }
    });

    saveOrders();
    multiTextPasteInput.value = '';
    pasteMultiModal.classList.add('hidden');
    triggerHaptic(30);
    playSynthesizedSound('complete');
    renderDetailItems();
    showToast(`تمت إضافة ${addedCount} مواد للقائمة بنجاح ✔️`);
}

/**
 * Smartly extracts quantity and product name from varied WhatsApp formats:
 * Examples:
 *  "3 حليب المراعي" -> qty: 3, text: "حليب المراعي"
 *  "طماطم 2 كيلو"   -> qty: 2, text: "طماطم كيلو"
 *  "2x كولا عائلي"  -> qty: 2, text: "كولا عائلي"
 *  "٤ شيبس ليز"     -> qty: 4, text: "شيبس ليز"
 */
function parseSmartProductLine(line) {
    let text = line.trim();
    if (!text) return null;

    // Convert eastern Arabic numerals (١٢٣٤٥٦٧٨٩٠) to western (1234567890)
    text = text.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

    // Pattern 1: Number at start (e.g. "3x حليب", "3 حليب", "2- بيبسي", "4 علب تونة")
    const startMatch = text.match(/^(\d+)\s*(?:x|×|-|\/|\*|\.)?\s*(.+)$/i);
    if (startMatch) {
        const qty = parseInt(startMatch[1], 10);
        let cleanText = startMatch[2].trim();
        // Remove leading common quantity words if redundant (e.g. "عدد 2")
        cleanText = cleanText.replace(/^(?:عدد|حبه|حبة|حبات|قطعة|قطع)\s+/i, '');
        return { qty: qty > 0 ? qty : 1, text: cleanText };
    }

    // Pattern 2: Number at end (e.g. "حليب المراعي 2", "كولا 3")
    const endMatch = text.match(/^(.+?)\s+(\d+)$/);
    if (endMatch) {
        const cleanText = endMatch[1].trim();
        const qty = parseInt(endMatch[2], 10);
        return { qty: qty > 0 ? qty : 1, text: cleanText };
    }

    // Default: 1 unit
    return { qty: 1, text: text };
}

// ================= WHATSAPP REPORT GENERATOR =================
function generateWhatsAppReportText(order) {
    const preparedItems = order.items.filter(i => i.status === 'prepared');
    const missingItems = order.items.filter(i => i.status === 'missing');
    const pendingItems = order.items.filter(i => i.status === 'pending');

    const dateStr = formatDateTime(order.createdAt);
    const orderCode = order.code || generateOrderCode(order);

    let msg = `🛒 *توب مارت | تقرير تجهيز الطلب*\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `📦 *رقم الطلب:* ${orderCode}\n`;
    if (order.customerName) msg += `👤 *الزبون:* ${order.customerName}\n`;
    msg += `📞 *الهاتف:* ${order.customerPhone}\n`;
    if (order.orderAmount && order.orderAmount > 0) {
        msg += `💰 *مبلغ الطلب:* ${Number(order.orderAmount).toLocaleString('ar-IQ')} د.ع\n`;
    }
    if (order.orderCategory) msg += `📂 *القسم:* ${order.orderCategory}\n`;
    if (order.customerAddress && order.customerAddress.trim() !== '') {
        msg += `📍 *العنوان:* ${order.customerAddress}\n`;
    }
    if (order.appSource) msg += `📱 *المصدر:* ${order.appSource}\n`;
    msg += `🕒 *الوقت:* ${dateStr}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n\n`;

    if (preparedItems.length > 0) {
        msg += `✅ *المواد الجاهزة (${preparedItems.length}):*\n`;
        preparedItems.forEach(i => {
            msg += `  ✔️ ${i.qty ? i.qty + '× ' : ''}${i.text}\n`;
        });
        msg += `\n`;
    }

    if (missingItems.length > 0) {
        msg += `❌ *المواد غير المتوفرة (نواقص) (${missingItems.length}):*\n`;
        missingItems.forEach(i => {
            msg += `  ❌ ${i.qty ? i.qty + '× ' : ''}${i.text}\n`;
        });
        msg += `\n`;
    }

    if (pendingItems.length > 0) {
        msg += `⏳ *مواد قيد المتابعة (${pendingItems.length}):*\n`;
        pendingItems.forEach(i => {
            msg += `  • ${i.qty ? i.qty + '× ' : ''}${i.text}\n`;
        });
        msg += `\n`;
    }

    if (order.orderNotes && order.orderNotes.trim() !== '') {
        msg += `📝 *ملاحظات الطلب:* ${order.orderNotes}\n\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `✨ *شكراً لاختياركم توب مارت - بالخدمة دائماً* ✨`;

    return msg;
}

function openWhatsAppReportModal() {
    const order = orders.find(o => o.id === activeOrderId);
    if (!order) return;

    const reportText = generateWhatsAppReportText(order);
    reportPreviewContent.textContent = reportText;
    shareReportModal.classList.remove('hidden');
}

function sendWhatsAppReport() {
    const order = orders.find(o => o.id === activeOrderId);
    if (!order) return;

    const reportText = generateWhatsAppReportText(order);
    const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');

    let waPhone = cleanPhone;
    if (waPhone.startsWith('07')) {
        waPhone = '964' + waPhone.substring(1);
    } else if (waPhone.startsWith('7')) {
        waPhone = '964' + waPhone;
    }

    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(reportText)}`;
    window.open(waUrl, '_blank');
    shareReportModal.classList.add('hidden');
    triggerHaptic(20);
}

function copyReportText() {
    const order = orders.find(o => o.id === activeOrderId);
    if (!order) return;

    const reportText = generateWhatsAppReportText(order);
    navigator.clipboard.writeText(reportText).then(() => {
        triggerHaptic(20);
        showToast('تم نسخ نص التقرير إلى الحافظة بنجاح 📋');
    }).catch(() => {
        showToast('تعذر النسخ التلقائي!');
    });
}

// ================= COPY DELIVERY INFO FOR DRIVER =================
function copyDeliveryInfo(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const phone = (order.customerPhone || '').trim();
    const name = (order.customerName || '').trim();
    const address = (order.customerAddress || '').trim();
    const notes = (order.orderNotes || '').trim();

    if (!phone && !address) {
        showToast('لا يوجد رقم أو عنوان لهذا الطلب!');
        return;
    }

    let text = '';
    if (name) text += `الزبون: ${name}\n`;
    if (phone) text += `الهاتف: ${phone}\n`;
    if (address) text += `العنوان: ${address}\n`;
    if (notes) text += `ملاحظات: ${notes}\n`;
    text = text.trim();

    const btn = document.getElementById('copyDeliveryInfoBtn');

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            triggerHaptic(25);
            playSynthesizedSound('check');
            showToast('تم نسخ بيانات التوصيل للمندوب 📋✔️');
            if (btn) {
                const origHTML = btn.innerHTML;
                btn.innerHTML = '<span>✔️ تم النسخ!</span>';
                btn.style.background = 'linear-gradient(135deg, var(--success-color), var(--success-hover))';
                setTimeout(() => {
                    btn.innerHTML = origHTML;
                    btn.style.background = '';
                }, 2000);
            }
        }).catch(() => {
            fallbackCopyText(text);
        });
    } else {
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        triggerHaptic(20);
        showToast('تم نسخ بيانات التوصيل 📋');
    } catch (e) {
        showToast('تعذر النسخ، يرجى النسخ يدوياً');
    }
}

// ================= MAIN ORDERS LIST & STATS =================
function renderMainList() {
    renderKPIsAndTabCounts();

    const filtered = orders.filter(order => {
        // Search Filter
        if (searchQuery) {
            const matchName = (order.customerName || '').toLowerCase().includes(searchQuery);
            const matchPhone = (order.customerPhone || '').includes(searchQuery);
            const matchAddress = (order.customerAddress || '').toLowerCase().includes(searchQuery);
            const matchSource = (order.appSource || '').toLowerCase().includes(searchQuery);
            const matchCode = (order.code || '').toLowerCase().includes(searchQuery);
            const matchNotes = (order.orderNotes || '').toLowerCase().includes(searchQuery);
            const matchItems = order.items.some(i => i.text.toLowerCase().includes(searchQuery));

            if (!matchName && !matchPhone && !matchAddress && !matchSource && !matchCode && !matchNotes && !matchItems) {
                return false;
            }
        }

        // Tab Filter
        if (currentFilter === 'completed' && !order.isCompleted) return false;
        if (currentFilter === 'in_progress' && order.isCompleted) return false;
        if (currentFilter === 'has_missing' && (order.isCompleted || !order.items.some(i => i.status === 'missing'))) return false;

        return true;
    });

    if (filtered.length === 0) {
        ordersListEl.innerHTML = '';
        emptyStateEl.classList.remove('hidden');

        if (searchQuery) {
            emptyStateTitle.textContent = 'لا توجد نتائج مطابقة للبحث';
            emptyStateDesc.textContent = `لم نجد أي طلب يحتوي على "${searchQuery}". جرب البحث بكلمات أخرى.`;
            emptyStateAddBtn.classList.add('hidden');
        } else if (currentFilter === 'completed') {
            emptyStateTitle.textContent = 'لا توجد طلبات مكتملة حالياً';
            emptyStateDesc.textContent = 'عند تجهيز أي طلب وتسليمه، اضغط زر "تم تجهيز الطلب" ليظهر هنا في الأرشيف.';
            emptyStateAddBtn.classList.add('hidden');
        } else if (currentFilter !== 'all') {
            emptyStateTitle.textContent = 'لا توجد طلبات في هذا القسم';
            emptyStateDesc.textContent = 'يمكنك استعراض تبويب "الكل" أو إضافة طلب جديد.';
            emptyStateAddBtn.classList.remove('hidden');
        } else {
            emptyStateTitle.textContent = 'لا توجد طلبات حالياً';
            emptyStateDesc.textContent = 'اضغط على زر "طلب جديد" بالأسفل لبدء تسجيل وتجهيز طلبات الزبائن بكل سهولة ودقة.';
            emptyStateAddBtn.classList.remove('hidden');
        }
        return;
    }

    emptyStateEl.classList.add('hidden');
    ordersListEl.innerHTML = filtered.map(order => createMainOrderCardHTML(order)).join('');

    // Attach click events on order cards
    ordersListEl.querySelectorAll('.order-card').forEach(card => {
        const orderId = card.dataset.id;

        // Open details on card click
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            triggerHaptic(15);
            openOrderDetail(orderId);
        });

        // Quick complete / reopen button on the card itself
        const completeBtn = card.querySelector('[data-action="toggle-complete"]');
        if (completeBtn) {
            completeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleOrderCompletion(orderId);
            });
        }
    });
}

function getOrderOverallStatus(order) {
    if (order.isCompleted) return 'completed';
    if (order.items && order.items.some(i => i.status === 'missing')) return 'has_missing';
    return 'in_progress';
}

function renderKPIsAndTabCounts() {
    let totalPrepared = 0;
    let totalMissing = 0;
    let totalPending = 0;

    let countAll = orders.length;
    let countInProgress = 0;
    let countCompleted = 0;
    let countHasMissing = 0;
    let totalRevenue = 0;
    let activeRevenue = 0;

    orders.forEach(order => {
        const amt = Number(order.orderAmount) || 0;
        if (order.isCompleted) {
            countCompleted++;
            totalRevenue += amt;
        } else {
            countInProgress++;
            activeRevenue += amt;
            totalRevenue += amt;
            if (order.items && order.items.some(i => i.status === 'missing')) {
                countHasMissing++;
            }
        }

        order.items.forEach(item => {
            if (item.status === 'prepared') totalPrepared++;
            else if (item.status === 'missing') totalMissing++;
            else totalPending++;
        });
    });

    // Update KPI Bar
    statTotalOrders.textContent = countAll;
    statPreparedItems.textContent = totalPrepared;
    statMissingItems.textContent = totalMissing;
    statPendingItems.textContent = totalPending;

    // Update Tab Badges
    countFilterAll.textContent = countAll;
    countFilterInProgress.textContent = countInProgress;
    countFilterCompleted.textContent = countCompleted;
    countFilterHasMissing.textContent = countHasMissing;

    // Update Revenue Strip
    if (statCompletedCount) statCompletedCount.textContent = countCompleted;
    if (statTotalRevenue) statTotalRevenue.textContent = formatMoney(totalRevenue);
    if (statActiveRevenue) statActiveRevenue.textContent = formatMoney(activeRevenue);
}

function createMainOrderCardHTML(order) {
    const overallStatus = getOrderOverallStatus(order);
    const totalItems = order.items.length;
    const preparedCount = order.items.filter(i => i.status === 'prepared').length;
    const missingCount = order.items.filter(i => i.status === 'missing').length;

    const prepPct = totalItems > 0 ? (preparedCount / totalItems) * 100 : 0;
    const missPct = totalItems > 0 ? (missingCount / totalItems) * 100 : 0;

    let cardBorderClass = 'in-progress-card';
    if (overallStatus === 'completed') cardBorderClass = 'completed-card';
    else if (overallStatus === 'has_missing') cardBorderClass = 'has-missing-card';

    // Preview top 3 items with distinct status indicators
    const itemsPreviewText = order.items.length > 0
        ? order.items.slice(0, 3).map(i => {
            let icon = '<span class="preview-tag-pending">•</span>';
            if (i.status === 'prepared') icon = '<span class="preview-tag-done">✔️</span>';
            else if (i.status === 'missing') icon = '<span class="preview-tag-missing">❌</span>';
            return `${icon} ${i.qty ? i.qty + '× ' : ''}${escapeHTML(i.text)}`;
        }).join('  |  ')
        : '<span class="preview-tag-pending">لا توجد مواد مضافة بعد (انقر للبدء بالتجهيز)</span>';

    const orderCode = order.code || generateOrderCode(order);
    const timeAgo = formatRelativeTime(order.createdAt);

    return `
        <article class="order-card ${cardBorderClass}" data-id="${order.id}">
            <div class="order-card-top-row">
                <div class="order-card-phone-wrap">
                    <span class="order-code-badge">${orderCode}</span>
                    <span class="phone-badge">${escapeHTML(order.customerPhone)}</span>
                </div>
                <div class="order-card-badges">
                    ${order.orderCategory ? `<span class="category-badge">${escapeHTML(order.orderCategory)}</span>` : ''}
                    ${order.appSource ? `<span class="source-badge">${escapeHTML(order.appSource)}</span>` : ''}
                    <span class="time-badge">${timeAgo}</span>
                </div>
            </div>

            <div class="order-card-customer-row">
                <span class="customer-name-highlight">
                    👤 ${order.customerName ? escapeHTML(order.customerName) : 'زبون بدون اسم'}
                </span>
                ${order.orderAmount && order.orderAmount > 0
                    ? `<span class="card-amount-badge">💰 ${Number(order.orderAmount).toLocaleString('ar-IQ')} د.ع</span>`
                    : ''}
            </div>

            ${order.customerAddress ? `
                <div class="order-card-address-row">
                    <span class="card-address-icon">📍</span>
                    <span class="card-address-text">${escapeHTML(order.customerAddress)}</span>
                </div>
            ` : ''}

            ${order.orderNotes ? `
                <div class="order-card-notes-box">
                    <span class="notes-box-icon">📝</span>
                    <div class="notes-box-text">
                        <strong>ملاحظة:</strong> ${escapeHTML(order.orderNotes)}
                    </div>
                </div>
            ` : ''}

            <div class="card-items-preview">
                ${itemsPreviewText} ${order.items.length > 3 ? `<strong style="color:var(--primary-color)"> +${order.items.length - 3} مواد إضافية</strong>` : ''}
            </div>

            <div class="progress-section">
                <div class="progress-info">
                    <span>
                        <strong style="color:var(--success-color)">${preparedCount}</strong> جهّزت
                        ${missingCount > 0 ? `| <strong style="color:var(--danger-color)">${missingCount}</strong> نواقص` : ''}
                        من أصل ${totalItems}
                    </span>
                    <span>${Math.round(prepPct)}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill-prepared" style="width: ${prepPct}%"></div>
                    <div class="progress-bar-fill-missing" style="width: ${missPct}%"></div>
                </div>
            </div>

            <div class="order-card-footer">
                <div class="card-status-indicator">
                    ${order.isCompleted 
                        ? '<span class="status-pill completed">✔️ مكتمل ومسلّم</span>' 
                        : (overallStatus === 'has_missing' ? '<span class="status-pill missing">نواقص قيد المتابعة</span>' : '<span class="status-pill in-prep">قيد التجهيز ⏳</span>')}
                </div>
                <div class="card-actions-row">
                    ${order.isCompleted ? `
                        <button class="card-reopen-btn" data-action="toggle-complete" title="إعادة فتح الطلب وإرجاعه لقيد التجهيز">
                            ↩️ استرجاع
                        </button>
                    ` : `
                        <button class="card-complete-btn" data-action="toggle-complete" title="تم تجهيز الطلب بالكامل وتسليمه - إرسال للمكتملة">
                            ✅ تم تجهيز الطلب
                        </button>
                    `}
                </div>
            </div>
        </article>
    `;
}

// ================= BACKUP & DATA MANAGEMENT =================
function exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchor = document.createElement('a');
    const fileName = `TopMart_Orders_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('تم تصدير النسخة الاحتياطية بنجاح 📥');
}

function importDataJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedOrders = JSON.parse(event.target.result);
            if (Array.isArray(importedOrders)) {
                orders = importedOrders;
                saveOrders();
                renderMainList();
                backupModal.classList.add('hidden');
                triggerHaptic(30);
                playSynthesizedSound('complete');
                showToast('تمت استعادة البيانات بنجاح 📤');
            } else {
                alert('ملف النسخة الاحتياطية غير صالح!');
            }
        } catch (err) {
            alert('خطأ في قراءة ملف JSON!');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function clearCompletedOrders() {
    const completedOrders = orders.filter(o => getOrderOverallStatus(o) === 'completed');
    if (completedOrders.length === 0) {
        showToast('لا توجد طلبات مكتملة بالكامل لحذفها');
        return;
    }

    if (confirm(`هل أنت متأكد من حذف ${completedOrders.length} طلب مكتمل؟`)) {
        orders = orders.filter(o => getOrderOverallStatus(o) !== 'completed');
        saveOrders();
        renderMainList();
        backupModal.classList.add('hidden');
        triggerHaptic(20);
        showToast('تم حذف الطلبات المكتملة 🧹');
    }
}

function clearAllOrders() {
    if (confirm('⚠️ تحذير نهائي: هل أنت متأكد من مسح كافة الطلبات والبيانات والبدء من جديد؟')) {
        orders = [];
        saveOrders();
        renderMainList();
        backupModal.classList.add('hidden');
        triggerHaptic(40);
        showToast('تم مسح كافة البيانات!');
    }
}

// ================= HELPERS & FORMATTING =================
function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.remove('hidden');
    toastTimer = setTimeout(() => {
        toastEl.classList.add('hidden');
    }, 2800);
}

function formatRelativeTime(isoString) {
    if (!isoString) return 'منذ قليل';
    try {
        const diffMs = Date.now() - new Date(isoString).getTime();
        const diffMin = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMin / 60);

        if (diffMin < 1) return 'الآن';
        if (diffMin < 60) return `منذ ${diffMin} د`;
        if (diffHours < 24) return `منذ ${diffHours} س`;
        return new Date(isoString).toLocaleDateString('ar-IQ', { month: 'numeric', day: 'numeric' });
    } catch (e) {
        return 'منذ قليل';
    }
}

function formatDateTime(isoString) {
    if (!isoString) return '';
    try {
        const d = new Date(isoString);
        return d.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '';
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatMoney(amount) {
    if (!amount || amount === 0) return '0 د.ع';
    return Number(amount).toLocaleString('ar-IQ') + ' د.ع';
}
