const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true, min: 0 },
    feePerHour: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipment', equipmentSchema);

