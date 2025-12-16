const Joi = require('joi');
const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');
const PricingRule = require('../models/PricingRule');

const courtSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('indoor', 'outdoor').required(),
  isActive: Joi.boolean().optional(),
  baseRate: Joi.number().min(0).optional(),
});
const courtUpdateSchema = courtSchema.fork(Object.keys(courtSchema.describe().keys), (s) => s.optional());

const equipmentSchema = Joi.object({
  name: Joi.string().required(),
  quantity: Joi.number().integer().min(0).required(),
  feePerHour: Joi.number().min(0).required(),
  isActive: Joi.boolean().optional(),
});
const equipmentUpdateSchema = equipmentSchema.fork(Object.keys(equipmentSchema.describe().keys), (s) => s.optional());

const availabilityItem = Joi.object({
  dayOfWeek: Joi.number().min(0).max(6).required(),
  startHour: Joi.number().min(0).max(23).required(),
  endHour: Joi.number().min(1).max(24).required(),
});

const coachSchema = Joi.object({
  name: Joi.string().required(),
  bio: Joi.string().allow(''),
  isActive: Joi.boolean().optional(),
  ratePerHour: Joi.number().min(0).required(),
  availability: Joi.array().items(availabilityItem).required(),
});
const coachUpdateSchema = coachSchema.fork(Object.keys(coachSchema.describe().keys), (s) => s.optional());

const pricingRuleSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  isActive: Joi.boolean().optional(),
  criteria: Joi.object({
    daysOfWeek: Joi.array().items(Joi.number().min(0).max(6)),
    startHour: Joi.number().min(0).max(23),
    endHour: Joi.number().min(1).max(24),
    courtType: Joi.string().valid('indoor', 'outdoor'),
    appliesTo: Joi.string().valid('court', 'equipment', 'coach').default('court'),
  }),
  adjustment: Joi.object({
    type: Joi.string().valid('multiplier', 'flat').required(),
    value: Joi.number().required(),
  }).required(),
  priority: Joi.number().integer().min(1).default(1),
});
const pricingRuleUpdateSchema = pricingRuleSchema.fork(
  Object.keys(pricingRuleSchema.describe().keys),
  (s) => s.optional()
);

const listCourts = async (req, res) => {
  const courts = await Court.find().lean();
  res.json(courts);
};

const createCourt = async (req, res) => {
  const { error, value } = courtSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }
  const court = await Court.create(value);
  res.status(201).json(court);
};

const updateCourt = async (req, res) => {
  const { error, value } = courtUpdateSchema.min(1).validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }
  const court = await Court.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!court) {
    res.status(404);
    throw new Error('Court not found');
  }
  res.json(court);
};

const listEquipment = async (req, res) => {
  const equipment = await Equipment.find().lean();
  res.json(equipment);
};

const createEquipment = async (req, res) => {
  const { error, value } = equipmentSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }
  const equipment = await Equipment.create(value);
  res.status(201).json(equipment);
};

const updateEquipment = async (req, res) => {
  const { error, value } = equipmentUpdateSchema.min(1).validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }
  const equipment = await Equipment.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!equipment) {
    res.status(404);
    throw new Error('Equipment not found');
  }
  res.json(equipment);
};

const listCoaches = async (req, res) => {
  const coaches = await Coach.find().lean();
  res.json(coaches);
};

const createCoach = async (req, res) => {
  const { error, value } = coachSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }
  const coach = await Coach.create(value);
  res.status(201).json(coach);
};

const updateCoach = async (req, res) => {
  const { error, value } = coachUpdateSchema.min(1).validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }
  const coach = await Coach.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!coach) {
    res.status(404);
    throw new Error('Coach not found');
  }
  res.json(coach);
};

const listPricingRules = async (req, res) => {
  const rules = await PricingRule.find().sort({ priority: 1 }).lean();
  res.json(rules);
};

const createPricingRule = async (req, res) => {
  const { error, value } = pricingRuleSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }
  const rule = await PricingRule.create(value);
  res.status(201).json(rule);
};

const updatePricingRule = async (req, res) => {
  const { error, value } = pricingRuleUpdateSchema.min(1).validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }
  const rule = await PricingRule.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!rule) {
    res.status(404);
    throw new Error('Pricing rule not found');
  }
  res.json(rule);
};

module.exports = {
  listCourts,
  createCourt,
  updateCourt,
  listEquipment,
  createEquipment,
  updateEquipment,
  listCoaches,
  createCoach,
  updateCoach,
  listPricingRules,
  createPricingRule,
  updatePricingRule,
};

