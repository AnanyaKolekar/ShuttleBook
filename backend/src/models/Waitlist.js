const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['waiting', 'notified', 'booked'], default: 'waiting' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Waitlist', waitlistSchema);

