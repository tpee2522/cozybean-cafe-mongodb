const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

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

// หน้ารายละเอียดสินค้าทีละชิ้น
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

// เพิ่มสินค้าลงตะกร้า
router.post('/cart/add/:id', async (req, res, next) => {
  try {
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

// ลดจำนวนสินค้าในตะกร้า
router.post('/cart/decrease/:id', (req, res) => {
  if (req.session.cart && req.session.cart[req.params.id]) {
    req.session.cart[req.params.id] -= 1;
    if (req.session.cart[req.params.id] <= 0) {
      delete req.session.cart[req.params.id];
    }
  }
  res.redirect('/cart');
});

// ลบสินค้าออกจากตะกร้า
router.post('/cart/remove/:id', (req, res) => {
  if (req.session.cart) delete req.session.cart[req.params.id];
  res.redirect('/cart');
});

// หน้าตะกร้าสินค้า
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

// ยืนยันการสั่งซื้อ -> บันทึกลง Collection 'orders' และตัดสต็อกใน 'products'
router.post('/checkout', async (req, res, next) => {
  try {
    const { customerName, phone, address } = req.body;
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
      customerName,
      phone,
      address,
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
