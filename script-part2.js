let toastTimeout = null;

function showToast(message) {
    const box = document.getElementById('toastBox');
    const text = document.getElementById('toastText');
    if (!box || !text) {
        alert(message);
        return;
    }
    text.innerText = message;
    box.style.display = 'flex';
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        box.style.display = 'none';
    }, 3500);
}

function toEnglishDigits(str) {
    if (!str) return '';
    return String(str)
        .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
        .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
}

function updateDynamicBar(catKey) {
    const bar = document.getElementById('dynamicSubBar');
    const sideRow = document.getElementById('sideFilterRow');
    if (!bar || !sideRow) return;

    bar.innerHTML = '<span class="filter-label"><i class="fa-solid fa-filter"></i> فیلتر تخصصی:</span>';
    sideRow.style.display = 'none';

    document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
    const activeCatBtn = document.getElementById(`catBtn-${catKey}`);
    if (activeCatBtn) activeCatBtn.classList.add('active');

    let options = [];
    if (catKey === 'پولاسا' || catKey === 'همه') {
        options = ['همه', 'پراید', 'پژو', 'سمند', 'تیبا', 'پیکان', 'نیسان'];
    } else if (catKey === 'کوژ') {
        sideRow.style.display = 'flex';
        options = ['همه', 'پراید', 'پیکان', 'تیبا / ساینا', 'شاهین / اطلس', 'پژو / پارس / 405', 'سال / اس‌ال‌ایکس', '۲۰۶ / ۲۰۷', 'سمند LX', 'رانا / دنا', 'ساندرو / ال‌نود'];
    } else if (catKey === 'TSP') {
        options = ['همه', 'شیلنگ رفت و برگشت بنزین', 'شیلنگ بخار روغن', 'کانکتور بنزین', 'کیت فیوز و جعبه فیوز', 'اورینگ و عایق حرارتی'];
    } else if (catKey === 'جلوبندی') {
        options = ['همه', 'دیسک چرخ', 'سگدست', 'کاسه چرخ', 'کاسه‌نمد'];
    }

    options.forEach((opt) => {
        let btn = document.createElement('button');
        btn.className = 'sub-chip-btn' + (opt === 'همه' ? ' active' : '');
        btn.innerText = opt === 'همه' ? 'همه موارد' : opt;
        btn.onclick = function() {
            document.querySelectorAll('#dynamicSubBar .sub-chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterBySub(opt);
        };
        bar.appendChild(btn);
    });
}

function filterByCat(catKey) {
    currentCat = catKey;
    currentSub = 'همه';
    currentSide = 'همه';
    updateDynamicBar(catKey);
    applyFilters();
}

function filterBySub(subKey) {
    currentSub = subKey;
    applyFilters();
}

function filterBySide(sideKey) {
    currentSide = sideKey;
    document.querySelectorAll('#sideFilterRow .sub-chip-btn').forEach(b => {
        b.classList.remove('active');
        if ((sideKey === 'همه' && b.innerText.includes('همه')) || (sideKey !== 'همه' && b.innerText.includes(sideKey))) {
            b.classList.add('active');
        }
    });
    applyFilters();
}

function applyFilters() {
    let products = loadProducts();
    let filtered = products;

    if (currentCat !== 'همه') {
        filtered = filtered.filter(p => {
            let name = (p.name || '').toLowerCase();
            let brand = (p.brand || '').toLowerCase();
            let code = (p.code || '').toLowerCase();

            if (currentCat === 'پولاسا') {
                let isOther = name.includes('کوژ') || brand.includes('کوژ') || 
                              name.includes('tsp') || brand.includes('tsp') || 
                              name.includes('دیسک') || name.includes('سگدست') || 
                              name.includes('کاسه چرخ') || name.includes('کاسه نمد') || 
                              name.includes('کاسه‌نمد') || name.includes('آینه') || 
                              name.includes('کانکتور') || name.includes('فیوز') || 
                              name.includes('عایق حرارتی') || name.includes('اورینگ');
                
                let isPoolasaFuel = code.startsWith('31') || code.startsWith('37') || name.includes('پولاسا') || brand.includes('پولاسا');
                return !isOther || isPoolasaFuel;
            }

            if (currentCat === 'کوژ') {
                return name.includes('کوژ') || brand.includes('کوژ') || name.includes('آینه') || name.includes('شیشه آینه') || name.includes('قاب آینه') || name.includes('فلاپ') || name.includes('مفصل') || name.includes('کفی') || name.includes('راهنمای آینه') || name.includes('گرمکن');
            }

            if (currentCat === 'TSP') {
                if (name.includes('پولاسا') || brand.includes('پولاسا') || code.startsWith('373') || code.startsWith('313')) {
                    return false;
                }
                return name.includes('tsp') || brand.includes('tsp') || 
                       name.includes('شیلنگ بنزین رفت') || 
                       name.includes('شیلنگ بنزین برگشت') || 
                       name.includes('شیلنگ بخار روغن') || 
                       name.includes('کانکتور') || 
                       name.includes('فیوز') || 
                       name.includes('عایق حرارتی') || 
                       name.includes('اورینگ') || 
                       name.includes('خرطومی پمپ بنزین');
            }

            if (currentCat === 'جلوبندی') {
                return name.includes('دیسک') || name.includes('سگدست') || name.includes('کاسه چرخ') || name.includes('کاسه نمد') || name.includes('کاسه‌نمد');
            }

            return false;
        });
    }

    if (currentSub !== 'همه') {
        filtered = filtered.filter(p => {
            let name = (p.name || '').toLowerCase();
            let model = (p.carModel || '').toLowerCase();
            let combinedText = name + ' ' + model;

            let sub = currentSub.toLowerCase();
            if (sub.includes('پراید')) return combinedText.includes('پراید') || combinedText.includes('111') || combinedText.includes('131');
            if (sub.includes('پژو')) return combinedText.includes('پژو') || combinedText.includes('405') || combinedText.includes('پارس');
            if (sub.includes('سمند')) return combinedText.includes('سمند') || combinedText.includes('سورن');
            if (sub.includes('تیبا')) return combinedText.includes('تیبا') || combinedText.includes('ساینا') || combinedText.includes('شاهین') || combinedText.includes('اطلس');
            if (sub.includes('پیکان')) return combinedText.includes('پیکان') || combinedText.includes('آردی') || combinedText.includes('روا') || combinedText.includes('باردو');
            if (sub.includes('نیسان')) return combinedText.includes('نیسان') || combinedText.includes('آریسان');
            
            if (sub.includes('کانکتور')) return name.includes('کانکتور');
            if (sub.includes('فیوز')) return name.includes('فیوز') || name.includes('کیت');
            if (sub.includes('اورینگ')) return name.includes('اورینگ') || name.includes('عایق');
            
            return combinedText.includes(sub);
        });
    }

    if (currentSide !== 'همه') {
        filtered = filtered.filter(p => {
            let name = (p.name || '').toLowerCase();
            if (currentSide === 'چپ') return name.includes('چپ') || name.includes('راننده');
            if (currentSide === 'راست') return name.includes('راست') || name.includes('شاگرد');
            return true;
        });
    }

    renderProducts(filtered);
}

let searchDebounceTimer = null;

function searchProducts() {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    
    searchDebounceTimer = setTimeout(() => {
        const rawQuery = document.getElementById('searchInput').value.trim().toLowerCase();
        const queryEng = toEnglishDigits(rawQuery);
        
        if (!rawQuery) {
            applyFilters();
            return;
        }

        const productsList = loadProducts();
        const filtered = productsList.filter(p => {
            const searchableText = `${p.name || ''} ${p.carModel || ''} ${p.category || ''} ${p.subCategory || ''} ${p.brand || ''}`.toLowerCase();
            const nameOrMetaMatch = searchableText.includes(rawQuery) || searchableText.includes(queryEng);
            const codeMatch = toEnglishDigits(p.code || '').toLowerCase().includes(queryEng);
            return nameOrMetaMatch || codeMatch;
        });

        renderProducts(filtered);
    }, 180); // اجرای نرم و بدون لگ هنگام تایپ سریع
}

function addToCart(productId) {
    let productsList = loadProducts();
    let product = productsList.find(p => String(p.id) === String(productId));
    if (!product) return;

    let userType = getUserType();
    let maxQty = getMaxAllowedQty();
    let activePrice = userType === 'wholesale' ? product.wholesalePrice : product.price;

    let item = cart.find(i => String(i.id) === String(productId));
    if (item) {
        if (item.qty >= maxQty) {
            notifyLimitReached(userType, maxQty);
            return;
        }
        item.qty += 1;
        item.price = activePrice;
    } else {
        cart.push({ ...product, price: activePrice, qty: 1 });
    }

    saveCart();
    renderProducts(lastRenderedList);
}

function changeCartQty(productId, delta) {
    let index = cart.findIndex(i => String(i.id) === String(productId));
    if (index === -1) return;

    let userType = getUserType();
    let maxQty = getMaxAllowedQty();

    if (delta > 0 && cart[index].qty >= maxQty) {
        notifyLimitReached(userType, maxQty);
        return;
    }

    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    renderProducts(lastRenderedList);
    renderCartItems();
}

function setDirectCartQty(productId, rawVal) {
    let index = cart.findIndex(i => String(i.id) === String(productId));
    if (index === -1) return;

    let userType = getUserType();
    let maxQty = getMaxAllowedQty();
    let val = parseInt(toEnglishDigits(rawVal), 10);

    if (isNaN(val) || val <= 0) {
        cart.splice(index, 1);
    } else if (val > maxQty) {
        cart[index].qty = maxQty;
        notifyLimitReached(userType, maxQty);
    } else {
        cart[index].qty = val;
    }

    saveCart();
    renderProducts(lastRenderedList);
    renderCartItems();
}

function notifyLimitReached(userType, maxQty) {
    if (userType === 'wholesale') {
        showToast(`حداکثر تعداد مجاز خرید عمده برای هر قطعه ${maxQty.toLocaleString('fa-IR')} عدد است.`);
    } else {
        showToast(`سقف خرید تکی برای هر قطعه ${maxQty.toLocaleString('fa-IR')} عدد است. (خرید عمده تا ۱۰۰ عدد با ورود همکاران)`);
    }
}

function saveCart() {
    localStorage.setItem('hajMohammadi_cart', JSON.stringify(cart));
    updateCartUI();
}

function openCart() {
    document.getElementById('cartModalOverlay').style.display = 'flex';
    renderCartItems();
}

function closeCart() {
    document.getElementById('cartModalOverlay').style.display = 'none';
}

function renderCartItems() {
    const list = document.getElementById('cartItemsList');
    const limitBanner = document.getElementById('cartLimitBanner');
    if (!list) return;

    let userType = getUserType();
    let maxQty = getMaxAllowedQty();

    if (limitBanner) {
        if (userType === 'wholesale') {
            limitBanner.style.background = '#eff6ff';
            limitBanner.style.color = '#1d4ed8';
            limitBanner.style.borderColor = '#bfdbfe';
            limitBanner.innerHTML = `<i class="fa-solid fa-handshake"></i> <span>حساب همکار: امکان تایپ مستقیم تعداد (تا سقف ۱۰۰ عدد)</span>`;
        } else {
            limitBanner.style.background = '#f0fdf4';
            limitBanner.style.color = '#166534';
            limitBanner.style.borderColor = '#bbf7d0';
            limitBanner.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>سقف خرید تکی: حداکثر ۷ عدد از هر کالا</span>`;
        }
    }

    list.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        list.innerHTML = '<div style="text-align:center; color:#64748b; padding:40px;">سبد خرید شما خالی است.</div>';
        document.getElementById('cartTotalPrice').innerText = '۰ تومان';
        return;
    }

    cart.forEach(item => {
        if (item.qty > maxQty) item.qty = maxQty;

        let itemTotal = item.price * item.qty;
        total += itemTotal;
        const div = document.createElement('div');
        div.className = 'cart-item-card';

        let centerQtyElement = userType === 'wholesale'
            ? `<input type="number" min="1" max="100" class="wholesale-qty-input" value="${item.qty}" onchange="setDirectCartQty('${item.id}', this.value)" title="تعداد را تایپ کنید">`
            : `<span style="font-size:13px; font-weight:900; min-width:24px; text-align:center; color:var(--primary-green);">${item.qty.toLocaleString('fa-IR')}</span>`;

        let minusBtnIcon = item.qty === 1 ? '<i class="fa-regular fa-trash-can" style="color:#ef4444;"></i>' : '-';

        div.innerHTML = `
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${Number(item.price).toLocaleString('fa-IR')} تومان</div>
            </div>
            <div class="qty-controls">
                <button type="button" class="qty-btn" onclick="changeCartQty('${item.id}', 1)">+</button>
                ${centerQtyElement}
                <button type="button" class="qty-btn" onclick="changeCartQty('${item.id}', -1)">${minusBtnIcon}</button>
            </div>
        `;
        list.appendChild(div);
    });

    document.getElementById('cartTotalPrice').innerText = total.toLocaleString('fa-IR') + ' تومان';
}

// اصلاح قطعی: وقتی سبد خرید خالی است دایره کاملاً مخفی می‌شود
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

function goToCheckout() {
    if (cart.length === 0) {
        showToast('سبد خرید شما خالی است.');
        return;
    }
    window.location.href = 'checkout.html';
}

window.onload = function() {
    checkUserLogin();
    updateDynamicBar('همه');
    renderProducts();
    updateCartUI();
};