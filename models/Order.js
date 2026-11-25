const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  address: { type: String, required: true, trim: true },
  paymentMethod: { type: String, default: 'เงินสด / ชำระที่เคาน์เตอร์' },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, default: 'รอดำเนินการ' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
