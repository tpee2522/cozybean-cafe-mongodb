const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  image: { type: String, default: 'https://placehold.co/400x300/4a2c2a/ffffff?text=Cafe+Menu' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
