const mongoose = require('mongoose');

const equipmentSelectionSchema = new mongoose.Schema(
  {
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const priceBreakdownSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' },
    equipment: [equipmentSelectionSchema],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    priceBreakdown: [priceBreakdownSchema],
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

bookingSchema.index(
  { court: 1, startTime: 1, endTime: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' } }
);

module.exports = mongoose.model('Booking', bookingSchema);

