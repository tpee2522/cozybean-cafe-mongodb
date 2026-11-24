const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin === true) return next();
  return res.redirect('/admin/login');
}

router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin');
  res.render('admin/login', { error: null });
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
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
    const orders = await Order.find().sort({ createdAt: -1 }).limit(20);
    res.render('admin/dashboard', { products, orders });
  } catch (err) {
    next(err);
  }
});

router.post('/products', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, category, price, stock, image } = req.body;
    await Product.create({
      name,
      description,
      category,
      price: Number(price),
      stock: Number(stock),
      image: image || 'https://placehold.co/400x300/4a2c2a/ffffff?text=New+Menu'
    });
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/products/:id/update', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, category, price, stock, image } = req.body;
    await Product.findByIdAndUpdate(req.params.id, {
      name,
      description,
      category,
      price: Number(price),
      stock: Number(stock),
      image
    });
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/products/:id/delete', requireAdmin, async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
