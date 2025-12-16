const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    // criteria can include: daysOfWeek [0-6], startHour/endHour, courtType, appliesTo: 'equipment'|'coach'|'court'
    criteria: {
      daysOfWeek: [{ type: Number, min: 0, max: 6 }],
      startHour: { type: Number, min: 0, max: 23 },
      endHour: { type: Number, min: 1, max: 24 },
      courtType: { type: String, enum: ['indoor', 'outdoor'] },
      appliesTo: { type: String, enum: ['court', 'equipment', 'coach'], default: 'court' },
    },
    adjustment: {
      type: { type: String, enum: ['multiplier', 'flat'], required: true },
      value: { type: Number, required: true },
    },
    priority: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingRule', pricingRuleSchema);

