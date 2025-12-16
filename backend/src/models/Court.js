const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['indoor', 'outdoor'], required: true },
    isActive: { type: Boolean, default: true },
    baseRate: { type: Number, default: 20 }, // base per-hour rate; refined by pricing rules
  },
  { timestamps: true }
);

module.exports = mongoose.model('Court', courtSchema);

