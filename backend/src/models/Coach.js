const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0=Sun
    startHour: { type: Number, min: 0, max: 23, required: true },
    endHour: { type: Number, min: 1, max: 24, required: true },
  },
  { _id: false }
);

const coachSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bio: { type: String },
    isActive: { type: Boolean, default: true },
    ratePerHour: { type: Number, required: true, min: 0 },
    availability: [availabilitySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coach', coachSchema);

