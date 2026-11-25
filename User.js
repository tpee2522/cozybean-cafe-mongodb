const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: 'ผู้ดูแลระบบ' },
  phone: { type: String, trim: true, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);