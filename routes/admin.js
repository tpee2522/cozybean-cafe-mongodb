const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect('/admin/login');
}

router.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  res.render('admin/login', { error: null });
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email: email.toLowerCase().trim(), role: 'admin' });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.render('admin/login', { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }
    req.session.isAdmin = true;
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render('admin/dashboard', { products, orders });
  } catch (err) {
    next(err);
  }
});

router.post('/products', requireAdmin, async (req, res, next) => {
  try {
    const { name, category, price, stock, image, description } = req.body;
    await Product.create({ name, category, price, stock, image, description });
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/products/update/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, category, price, stock, image } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { name, category, price, stock, image });
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/products/delete/:id', requireAdmin, async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// อัปเดตสถานะคำสั่งซื้อ
router.post('/orders/status/:id', requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/orders/delete/:id', requireAdmin, async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
