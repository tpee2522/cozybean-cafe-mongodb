const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// หน้าแรก: ดึงเมนูจาก MongoDB + ค้นหา + กรองหมวดหมู่
router.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category && category !== 'All') query.category = category;

    const products = await Product.find(query).sort({ createdAt: -1 });
    const categories = await Product.distinct('category');
    res.render('index', { products, categories, search: search || '', selectedCategory: category || 'All' });
  } catch (err) {
    next(err);
  }
});

// ================= ระบบสมาชิกและการเข้าสู่ระบบ =================

// หน้าสมัครสมาชิก
router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('register', { error: null });
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, phone, email, password } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.render('register', { error: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      phone: phone ? phone.trim() : '',
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'customer'
    });

    req.session.user = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone
    };
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// หน้าเข้าสู่ระบบ (รองรับทั้งลูกค้าและผู้ดูแลร้าน)
router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin');
  if (req.session.user) return res.redirect('/');
  res.render('login', { error: null });
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.render('login', { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    if (user.role === 'admin') {
      req.session.isAdmin = true;
      return res.redirect('/admin');
    }

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// ออกจากระบบลูกค้า
router.post('/logout', (req, res) => {
  delete req.session.user;
  res.redirect('/');
});

// หน้าประวัติการสั่งซื้อของลูกค้า
router.get('/my-orders', async (req, res, next) => {
  try {
    if (!req.session.user) return res.redirect('/login');
    const orders = await Order.find({ userId: req.session.user._id }).sort({ createdAt: -1 });
    res.render('my-orders', { orders });
  } catch (err) {
    next(err);
  }
});

// ================= สินค้าและตะกร้า =================

router.get('/product/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).send('ไม่พบสินค้า');
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('ไม่พบสินค้า');
    res.render('product', { product });
  } catch (err) {
    next(err);
  }
});

router.post('/cart/add/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.redirect('/');
    const product = await Product.findById(req.params.id);
    if (!product || product.stock <= 0) return res.redirect('/');
    if (!req.session.cart) req.session.cart = {};
    const currentQty = req.session.cart[product._id] || 0;
    if (currentQty < product.stock) {
      req.session.cart[product._id] = currentQty + 1;
    }
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
});

router.post('/cart/decrease/:id', (req, res) => {
  if (req.session.cart && req.session.cart[req.params.id]) {
    req.session.cart[req.params.id] -= 1;
    if (req.session.cart[req.params.id] <= 0) {
      delete req.session.cart[req.params.id];
    }
  }
  res.redirect('/cart');
});

router.post('/cart/remove/:id', (req, res) => {
  if (req.session.cart) delete req.session.cart[req.params.id];
  res.redirect('/cart');
});

router.get('/cart', async (req, res, next) => {
  try {
    const cart = req.session.cart || {};
    const productIds = Object.keys(cart);
    const products = await Product.find({ _id: { $in: productIds } });

    let totalAmount = 0;
    const cartItems = products.map(p => {
      const qty = cart[p._id.toString()];
      const subtotal = p.price * qty;
      totalAmount += subtotal;
      return { product: p, qty, subtotal };
    });

    res.render('cart', { cartItems, totalAmount });
  } catch (err) {
    next(err);
  }
});

router.post('/checkout', async (req, res, next) => {
  try {
    const { customerName, phone, address, paymentMethod } = req.body;
    const cart = req.session.cart || {};
    const productIds = Object.keys(cart);
    if (productIds.length === 0) return res.redirect('/cart');

    const products = await Product.find({ _id: { $in: productIds } });
    let totalAmount = 0;
    const orderItems = [];

    for (const p of products) {
      const qty = cart[p._id.toString()];
      if (p.stock >= qty) {
        totalAmount += p.price * qty;
        orderItems.push({ productId: p._id, name: p.name, price: p.price, qty });
        await Product.findByIdAndUpdate(p._id, { $inc: { stock: -qty } });
      }
    }

    const newOrder = await Order.create({
      userId: req.session.user ? req.session.user._id : null,
      customerName,
      phone: phone ? phone.trim() : '',
      address,
      paymentMethod: paymentMethod || 'เงินสด / ชำระที่เคาน์เตอร์',
      items: orderItems,
      totalAmount
    });

    req.session.cart = {};
    res.render('order-success', { order: newOrder });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
