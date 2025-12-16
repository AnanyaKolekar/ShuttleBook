const Joi = require('joi');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Coach = require('../models/Coach');
const Equipment = require('../models/Equipment');
const PricingRule = require('../models/PricingRule');
const Waitlist = require('../models/Waitlist');
const bookingService = require('../services/booking.service');
const pricingService = require('../services/pricing.service');

const bookingSchema = Joi.object({
  courtId: Joi.string().required(),
  coachId: Joi.string().optional().allow(null, ''),
  equipment: Joi.array()
    .items(
      Joi.object({
        equipmentId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .default([]),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().required(),
});

const priceSchema = bookingSchema;

const getMeta = async (req, res) => {
  const [courts, equipment, coaches] = await Promise.all([
    Court.find({ isActive: true }).lean(),
    Equipment.find({ isActive: true }).lean(),
    Coach.find({ isActive: true }).lean(),
  ]);
  res.json({ courts, equipment, coaches });
};

const getAvailability = async (req, res) => {
  const { date, courtId } = req.query;
  if (!date) {
    res.status(400);
    throw new Error('date query param is required (YYYY-MM-DD)');
  }
  const availability = await bookingService.getAvailability(date, courtId);
  res.json(availability);
};

const getPriceQuote = async (req, res) => {
  const { error, value } = priceSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  const { courtId, coachId, equipment, startTime, endTime } = value;
  const [court, coach, pricingRules, equipmentDocs] = await Promise.all([
    Court.findById(courtId),
    coachId ? Coach.findById(coachId) : null,
    PricingRule.find({ isActive: true }),
    Equipment.find({ _id: { $in: equipment.map((e) => e.equipmentId) } }),
  ]);

  if (!court) {
    res.status(404);
    throw new Error('Court not found');
  }
  const equipmentMap = equipmentDocs.reduce((acc, eq) => ({ ...acc, [eq._id.toString()]: eq }), {});
  const payloadEquipment = equipment.map((item) => {
    const eq = equipmentMap[item.equipmentId];
    if (!eq) {
      throw new Error('Equipment not found');
    }
    return { equipment: eq, quantity: item.quantity };
  });

  const pricing = pricingService.calculatePricing({
    court,
    coach,
    equipment: payloadEquipment,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    pricingRules,
  });

  res.json(pricing);
};

const createBooking = async (req, res) => {
  const { error, value } = bookingSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }
  const booking = await bookingService.createBooking({
    ...value,
    userEmail: req.user.email,
    userName: req.user.name,
    userId: req.user.id,
  });
  res.status(201).json(booking);
};

const getHistory = async (req, res) => {
  const email = req.user.role === 'admin' && req.query.email ? req.query.email : req.user.email;
  const filter = req.user.role === 'admin' && !req.query.email ? {} : { userEmail: email };
  const bookings = await Booking.find(filter)
    .populate('court coach equipment.equipment')
    .sort({ startTime: -1 })
    .lean();
  res.json(bookings);
};

const joinWaitlist = async (req, res) => {
  const schema = Joi.object({
    courtId: Joi.string().required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }
  const waitlist = await Waitlist.create({
    userName: req.user.name,
    userEmail: req.user.email,
    court: value.courtId,
    startTime: value.startTime,
    endTime: value.endTime,
  });
  res.status(201).json(waitlist);
};

const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);
  if (!booking || booking.status === 'cancelled') {
    res.status(404);
    throw new Error('Booking not found or already cancelled');
  }
   // only owner or admin can cancel
  if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }
  booking.status = 'cancelled';
  await booking.save();
  await bookingService.notifyWaitlist(booking);
  res.json({ message: 'Booking cancelled' });
};

module.exports = {
  getMeta,
  getAvailability,
  getPriceQuote,
  createBooking,
  getHistory,
  joinWaitlist,
  cancelBooking,
};

