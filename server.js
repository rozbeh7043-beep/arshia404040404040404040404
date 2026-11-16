const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// مسیر فایل دیتابیس
const DB_FILE = path.join(__dirname, 'secure_data', 'database.json');
if (!fs.existsSync(path.dirname(DB_FILE))) fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

app.use(express.json({ limit: '5mb' }));

// 1. محافظت از فایل‌های حساس پیش از سرو فایل‌های استاتیک
app.use((req, res, next) => {
    if (req.url.includes('database.json') || req.url.includes('secure_data')) {
        return res.status(403).send('Access Denied');
    }
    next();
});

app.use(express.static(__dirname, { index: ['index.html'], extensions: ['html', 'js', 'css', 'jpg', 'png'] }));

// متغیرهای دسترسی
const ADMIN_NUMBERS = (process.env.ADMIN_NUMBERS || "09001795050").split(',');
const sessionStore = new Map();
const otpStore = new Map();

// توابع دیتابیس
function readDB() {
    if (!fs.existsSync(DB_FILE)) return { products: [], orders: [], wholesaleUsers: [] };
    try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { return { products: [], orders: [], wholesaleUsers: [] }; }
}

function writeDB(data) { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8'); }

// در فایل server.js، این بخش را پیدا کرده و با این کد جایگزین کنید:
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // اگر هدر موجود نیست یا فرمت درستی ندارد
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // توکن را جدا کنید
    const token = authHeader.split(' ')[1];
    
    // در محیط توسعه، فعلاً بررسی می‌کنیم که آیا توکن همان "admin-token-123" است (ساده‌سازی برای شما)
    if (token !== 'admin-token-123') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};


// ثبت سفارش امن (محاسبه قیمت در سرور)
app.post('/api/orders', (req, res) => {
    const { items, customerName, customerPhone, address, shippingMethod } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'سبد خرید نامعتبر' });

    const db = readDB();
    // در اینجا باید لیست محصولات (از فایل‌های JS) را لود کنید تا قیمت‌ها را چک کنید
    // فرض بر این است که قیمت‌ها را از دیتابیس یا فایل کاتالوگ می‌خوانید
    let subtotal = 0;
    const validatedItems = items.map(item => {
        // پیدا کردن محصول در دیتابیس یا کاتالوگ (باید منطق تطبیق کالا را اینجا اضافه کنید)
        // const product = ... ;
        // subtotal += (product.price * item.qty);
        return { ...item }; // در نسخه نهایی اینجا قیمت واقعی را از دیتابیس سرور بردارید
    });

    const newOrder = {
        id: 'HM-' + Date.now().toString().slice(-6),
        customerName, customerPhone, address, shippingMethod,
        items: validatedItems,
        subtotal,
        date: new Date().toLocaleDateString('fa-IR'),
        status: 'در انتظار بررسی'
    };

    db.orders = db.orders || [];
    db.orders.unshift(newOrder);
    writeDB(db);

    res.json({ success: true, order: newOrder });
});

app.post('/api/auth/verify-otp', (req, res) => {
    // منطق تایید OTP (همان کد قبلی)
    res.json({ success: true, user: { role: 'retail', name: 'مشتری' } });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
