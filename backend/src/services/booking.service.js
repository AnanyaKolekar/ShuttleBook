const mongoose = require('mongoose');
const dayjs = require('dayjs');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Coach = require('../models/Coach');
const Equipment = require('../models/Equipment');
const PricingRule = require('../models/PricingRule');
const Waitlist = require('../models/Waitlist');
const pricingService = require('./pricing.service');

const SLOT_START_HOUR = 6;
const SLOT_END_HOUR = 22;

const overlapQuery = (startTime, endTime) => ({
  startTime: { $lt: endTime },
  endTime: { $gt: startTime },
  status: 'confirmed',
});

const ensureCoachAvailability = (coach, startTime, endTime) => {
  const startHour = dayjs(startTime).hour();
  const endHour = dayjs(endTime).hour();
  const day = dayjs(startTime).day();
  const window = coach.availability.find(
    (slot) => slot.dayOfWeek === day && slot.startHour <= startHour && slot.endHour >= endHour
  );
  if (!window) {
    throw new Error('Coach not available for selected time');
  }
};

const applySession = (query, session) => (session ? query.session(session) : query);

const checkEquipmentAvailability = async (equipmentSelections, startTime, endTime, session) => {
  for (const item of equipmentSelections) {
    const equipment = await applySession(Equipment.findById(item.equipmentId), session);
    if (!equipment || !equipment.isActive) throw new Error('Equipment not available');

    const agg = Booking.aggregate([
      { $match: { ...overlapQuery(startTime, endTime) } },
      { $unwind: '$equipment' },
      { $match: { 'equipment.equipment': equipment._id } },
      { $group: { _id: null, qty: { $sum: '$equipment.quantity' } } },
    ]);
    if (session) agg.session(session);
    const booked = await agg;

    const reserved = booked[0]?.qty || 0;
    if (reserved + item.quantity > equipment.quantity) {
      throw new Error(`Not enough ${equipment.name} available`);
    }
  }
};

const checkCoachConflict = async (coachId, startTime, endTime, session) => {
  const conflict = await applySession(
    Booking.findOne({
      ...overlapQuery(startTime, endTime),
      coach: coachId,
    }),
    session
  );
  if (conflict) throw new Error('Coach already booked for selected time');
};

const checkCourtConflict = async (courtId, startTime, endTime, session) => {
  const conflict = await applySession(
    Booking.findOne({
      ...overlapQuery(startTime, endTime),
      court: courtId,
    }),
    session
  );
  if (conflict) throw new Error('Court already booked for selected time');
};

const canTransact = () => {
  const topologyType = mongoose.connection?.client?.topology?.description?.type;
  return topologyType === 'ReplicaSetWithPrimary' || topologyType === 'Sharded';
};

const createBooking = async (payload) => {
  let session = null;
  if (canTransact()) {
    try {
      session = await mongoose.startSession();
      await session.startTransaction();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Proceeding without transaction (transaction start failed)', err.message);
      session = null;
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn('Proceeding without transaction (non-replica MongoDB)');
  }
  try {
    const { courtId, coachId, equipment, startTime, endTime, userEmail, userName, userId } = payload;
    const [court, coach] = await Promise.all([
      applySession(Court.findById(courtId), session),
      coachId ? applySession(Coach.findById(coachId), session) : null,
    ]);
    if (!court || !court.isActive) throw new Error('Court not available');
    if (coach && !coach.isActive) throw new Error('Coach not available');

    const equipmentSelections = equipment || [];
    await checkCourtConflict(courtId, startTime, endTime, session);
    if (coach) {
      ensureCoachAvailability(coach, startTime, endTime);
      await checkCoachConflict(coachId, startTime, endTime, session);
    }
    await checkEquipmentAvailability(equipmentSelections, startTime, endTime, session);

    const pricingRules = await applySession(PricingRule.find({ isActive: true }), session);
    const equipmentDocs = await applySession(
      Equipment.find({
        _id: { $in: equipmentSelections.map((e) => e.equipmentId) },
      }),
      session
    );
    const equipmentMap = equipmentDocs.reduce((acc, eq) => ({ ...acc, [eq._id.toString()]: eq }), {});
    const pricedEquipment = equipmentSelections.map((item) => {
      const eq = equipmentMap[item.equipmentId];
      if (!eq) throw new Error('Equipment not found');
      return { equipment: eq, quantity: item.quantity };
    });

    const pricing = pricingService.calculatePricing({
      court,
      coach,
      equipment: pricedEquipment,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      pricingRules,
    });

    const booking = await Booking.create(
      [
        {
          userName,
          userEmail,
          user: userId,
          court: courtId,
          coach: coachId || undefined,
          equipment: equipmentSelections.map((item) => ({
            equipment: item.equipmentId,
            quantity: item.quantity,
          })),
          startTime,
          endTime,
          totalPrice: pricing.totalPrice,
          priceBreakdown: pricing.priceBreakdown,
        },
      ],
      session ? { session } : undefined
    );

    if (session) {
      await session.commitTransaction();
    }
    return booking[0];
  } catch (err) {
    if (session) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

const generateSlots = (date) => {
  const slots = [];
  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour += 1) {
    const start = dayjs(date).hour(hour).minute(0).second(0).millisecond(0);
    const end = start.add(1, 'hour');
    slots.push({ startTime: start.toDate(), endTime: end.toDate() });
  }
  return slots;
};

const getAvailability = async (dateStr, courtId) => {
  const dayStart = dayjs(dateStr).startOf('day');
  const dayEnd = dayStart.endOf('day');
  const courtFilter = { isActive: true, ...(courtId ? { _id: courtId } : {}) };
  const courts = await Court.find(courtFilter).lean();
  const bookings = await Booking.find({
    status: 'confirmed',
    startTime: { $gte: dayStart.toDate(), $lte: dayEnd.toDate() },
  }).lean();

  const availability = courts.map((court) => {
    const courtBookings = bookings.filter((b) => b.court.toString() === court._id.toString());
    const slots = generateSlots(dayStart);
    const availableSlots = slots.filter(
      (slot) =>
        !courtBookings.some(
          (b) => b.startTime < slot.endTime && b.endTime > slot.startTime && b.status === 'confirmed'
        )
    );
    return {
      courtId: court._id,
      courtName: court.name,
      date: dayStart.toDate(),
      availableSlots,
      bookings: courtBookings,
    };
  });

  return { date: dayStart.toDate(), availability };
};

const notifyWaitlist = async (cancelledBooking) => {
  const waiters = await Waitlist.find({
    court: cancelledBooking.court,
    status: 'waiting',
    startTime: { $lte: cancelledBooking.startTime },
    endTime: { $gte: cancelledBooking.endTime },
  }).sort({ createdAt: 1 });

  if (waiters.length) {
    const next = waiters[0];
    next.status = 'notified';
    await next.save();
    // In real system we would email; console log per requirement
    // eslint-disable-next-line no-console
    console.log(`Notify waitlist user ${next.userEmail} for court ${cancelledBooking.court}`);
  }
};

module.exports = {
  createBooking,
  getAvailability,
  notifyWaitlist,
};

