const wholesaleNumbers = ["09110000000", "09111795050", "89501068", "09001795050"]; 
const visitorNumbers = ["09119999999"]; 
let cart = JSON.parse(localStorage.getItem('hajMohammadi_cart')) || [];

// متغیرهای وضعیت فیلترها
let currentCat = 'همه';
let currentSub = 'همه';
let currentSide = 'همه';
let lastRenderedList = null;

function getAllPoolasaProducts() {
    let p1 = typeof poolasaProductsPart1 !== 'undefined' ? poolasaProductsPart1 : [];
    let p2 = typeof poolasaProductsPart2 !== 'undefined' ? poolasaProductsPart2 : [];
    let p3 = typeof poolasaProductsPart3 !== 'undefined' ? poolasaProductsPart3 : [];
    return (typeof poolasaProducts !== 'undefined' && poolasaProducts.length > 0) ? poolasaProducts : [...p1, ...p2, ...p3];
}

function loadProducts() {
    let allProducts = getAllPoolasaProducts();
    let adminProducts = JSON.parse(localStorage.getItem('hajMohammadi_products')) || [];
    let deletedIds = JSON.parse(localStorage.getItem('hajMohammadi_deletedIds')) || [];

    let combined = adminProducts.filter(item => !deletedIds.includes(String(item.id)));

    allProducts.forEach(p => {
        if (deletedIds.includes(String(p.id))) return;
        if (!combined.some(item => String(item.id) === String(p.id))) {
            let rawWholesale = p.wholesalePrice || p.price || 0;
            let wholesaleToman = rawWholesale > 100000 ? Math.round(rawWholesale / 10) : rawWholesale; 
            let retailToman = Math.round(wholesaleToman * 1.10);
            let cleanCode = p.code ? String(p.code) : (p.id ? String(p.id) : '');

            combined.push({
                id: p.id,
                name: p.name,
                code: cleanCode,
                carModel: p.carModel || 'پراید',
                category: p.category || p.cat || 'شیلنگ',
                subCategory: p.subCategory || '',
                brand: p.brand || 'پولاسا',
                wholesalePrice: wholesaleToman,
                price: retailToman,
                img: cleanCode ? `images/${cleanCode}.webp` : (p.img || ''),
                imgAlt: p.imgAlt || `${p.name} پخش حاج محمدی گنبد`,
                seoTitle: p.seoTitle || '',
                seoDesc: p.seoDesc || ''
            });
        }
    });

    return combined;
}

function getUserType() {
    let loggedUser = JSON.parse(localStorage.getItem('hajMohammadi_loggedUser')) || JSON.parse(localStorage.getItem('poolasa_user'));
    if (!loggedUser) return 'retail';

    let phone = String(loggedUser.phone || '').trim();
    let adminWholesaleList = JSON.parse(localStorage.getItem('hajMohammadi_wholesaleUsers')) || [];
    let isSavedWholesale = adminWholesaleList.some(u => String(u.phone).trim() === phone);

    if (
        wholesaleNumbers.includes(phone) ||
        visitorNumbers.includes(phone) ||
        isSavedWholesale ||
        loggedUser.role === 'wholesale' ||
        loggedUser.role === 'visitor' ||
        loggedUser.role === 'admin'
    ) {
        return 'wholesale'; 
    }
    return 'retail';
}

function getMaxAllowedQty() {
    return getUserType() === 'wholesale' ? 100 : 7;
}

function checkUserLogin() {
    let loggedUser = JSON.parse(localStorage.getItem('hajMohammadi_loggedUser')) || JSON.parse(localStorage.getItem('poolasa_user'));
    const authBtn = document.getElementById('mainAuthBtn');
    const authText = document.getElementById('authButtonText');

    if (!authBtn || !authText) return;

    if (loggedUser && (loggedUser.phone || loggedUser.name)) {
        let phone = loggedUser.phone || '';
        let userType = getUserType();
        let isAdmin = (phone === "09001795050" || phone === "89501068" || loggedUser.role === 'admin');

        if (isAdmin) {
            authBtn.href = 'login.html';
            authText.innerHTML = `<span class="wholesale-badge" style="background:#f57c00;">مدیر</span> ${loggedUser.name || 'پنل مدیریت'}`;
        } else if (userType === 'wholesale') {
            authBtn.href = 'login.html';
            authText.innerHTML = `<span class="wholesale-badge">همکار</span> ${loggedUser.name || phone}`;
        } else {
            authBtn.href = 'login.html';
            authText.innerText = loggedUser.name || phone;
        }
    } else {
        authText.innerText = 'ورود / عضویت';
        authBtn.href = 'login.html';
    }
}

function renderProducts(productsToRender = null) {
    let container = document.getElementById('productsContainer');
    if (!container) return;

    let productsList = productsToRender || lastRenderedList || loadProducts();
    lastRenderedList = productsList;
    container.innerHTML = '';

    let userType = getUserType();
    let maxQty = getMaxAllowedQty();
    let loggedUser = JSON.parse(localStorage.getItem('hajMohammadi_loggedUser')) || JSON.parse(localStorage.getItem('poolasa_user'));
    let isAdmin = loggedUser && (loggedUser.phone === "09001795050" || loggedUser.phone === "89501068" || loggedUser.role === 'admin');

    if (productsList.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#64748b; padding:40px; background:#fff; border-radius:12px; border:1px dashed #cbd5e1;">محصولی با این مشخصات یافت نشد.</div>';
        return;
    }

    productsList.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        let activePrice = userType === 'wholesale' ? p.wholesalePrice : p.price;
        let priceLabel = userType === 'wholesale' ? 'قیمت همکار (عمده):' : 'قیمت مصرف‌کننده:';

        let cartItem = cart.find(i => String(i.id) === String(p.id));
        let qtyInCart = cartItem ? cartItem.qty : 0;

        let adminEditBtn = isAdmin ? `
            <a href="admin.html?edit=${p.id}" style="background: #f57c00; color: white; border: none; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: bold; text-decoration: none; display: block; margin-bottom: 10px; text-align: center;">
                <i class="fa-solid fa-pen-to-square"></i> ویرایش در پنل ادمین
            </a>
        ` : '';

        let actionControlHTML = '';
        if (qtyInCart > 0) {
            let isMax = qtyInCart >= maxQty;
            let minusIcon = qtyInCart === 1 ? '<i class="fa-regular fa-trash-can"></i>' : '<i class="fa-solid fa-minus"></i>';
            let subLabel = isMax ? `<span class="dk-qty-sub max-reached">حداکثر مجاز (${maxQty.toLocaleString('fa-IR')})</span>` : `<span class="dk-qty-sub">در سبد شما</span>`;

            actionControlHTML = `
                <div class="dk-qty-box">
                    <button type="button" class="dk-btn dk-btn-plus ${isMax ? 'disabled' : ''}" onclick="changeCartQty('${p.id}', 1)">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    <div class="dk-qty-info">
                        <span class="dk-qty-num">${qtyInCart.toLocaleString('fa-IR')} عدد</span>
                        ${subLabel}
                    </div>
                    <button type="button" class="dk-btn dk-btn-minus" onclick="changeCartQty('${p.id}', -1)">
                        ${minusIcon}
                    </button>
                </div>
            `;
        } else {
            actionControlHTML = `
                <button type="button" class="btn-add-cart" onclick="addToCart('${p.id}')">
                    <i class="fa-solid fa-cart-plus"></i> افزودن به سبد خرید
                </button>
            `;
        }

        // تعریف آدرس تصویر اصلی (webp) و تصویر جایگزین (SVG)
        let primaryImg = (p.img && !p.img.startsWith('data:')) ? p.img : `images/${p.code}.webp`;
        let fallbackImg = (typeof generateSVGImage === 'function') ? generateSVGImage(p.name, p.code) : 'logo.jpg';

        card.innerHTML = `
            <div>
                ${adminEditBtn}
                <a href="product.html?id=${p.id}" class="product-image-box" style="text-decoration:none; cursor:pointer;">
                    <img src="${primaryImg}" alt="${p.imgAlt || p.name}" title="${p.name}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
                </a>
                <div class="product-meta">
                    <span class="code-badge">کد: ${p.code}</span>
                    <span class="car-badge">${p.carModel || p.cat || 'عمومی'}</span>
                </div>
                <a href="product.html?id=${p.id}" style="text-decoration:none; color:inherit;">
                    <h3 class="product-title" style="cursor:pointer;">${p.name}</h3>
                </a>
            </div>
            <div>
                <div class="price-box">
                    <span class="price-label">${priceLabel}</span>
                    <strong class="price-value">${Number(activePrice || 0).toLocaleString('fa-IR')} تومان</strong>
                </div>
                ${actionControlHTML}
            </div>
        `;
        container.appendChild(card);
    });
}

// تابع دقیق مدیریت نمایش بج سبد خرید (اگر تعداد صفر باشد به کلی محو می‌شود)
function updateCartUI() {
    const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
    const badge = document.getElementById('cartCount');
    if (badge) {
        if (totalCount > 0) {
            badge.style.display = 'inline-flex';
            badge.innerText = totalCount.toLocaleString('fa-IR');
        } else {
            badge.style.display = 'none';
            badge.innerText = '';
        }
    }
}