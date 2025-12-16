/* eslint-disable no-console */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');
const PricingRule = require('../models/PricingRule');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const seed = async () => {
  await connectDB();

  await Promise.all([
    Court.deleteMany({}),
    Equipment.deleteMany({}),
    Coach.deleteMany({}),
    PricingRule.deleteMany({}),
    User.deleteMany({}),
  ]);

  const courts = await Court.insertMany([
    { name: 'Indoor Court 1', type: 'indoor', baseRate: 28 },
    { name: 'Indoor Court 2', type: 'indoor', baseRate: 28 },
    { name: 'Outdoor Court 1', type: 'outdoor', baseRate: 22 },
    { name: 'Outdoor Court 2', type: 'outdoor', baseRate: 22 },
  ]);

  await Equipment.insertMany([
    { name: 'Racket', quantity: 20, feePerHour: 3 },
    { name: 'Shoes', quantity: 15, feePerHour: 4 },
  ]);

  await Coach.insertMany([
    {
      name: 'Alice Lee',
      bio: 'Former national player specializing in beginners.',
      ratePerHour: 18,
      availability: [
        { dayOfWeek: 1, startHour: 8, endHour: 12 },
        { dayOfWeek: 3, startHour: 14, endHour: 20 },
        { dayOfWeek: 5, startHour: 10, endHour: 18 },
      ],
    },
    {
      name: 'Brian Chen',
      bio: 'Focus on intermediate footwork and strategy.',
      ratePerHour: 22,
      availability: [
        { dayOfWeek: 2, startHour: 9, endHour: 17 },
        { dayOfWeek: 4, startHour: 9, endHour: 17 },
        { dayOfWeek: 6, startHour: 8, endHour: 12 },
      ],
    },
    {
      name: 'Cathy Gomez',
      bio: 'Advanced drills and tournament prep.',
      ratePerHour: 26,
      availability: [
        { dayOfWeek: 0, startHour: 12, endHour: 18 },
        { dayOfWeek: 2, startHour: 12, endHour: 20 },
        { dayOfWeek: 4, startHour: 12, endHour: 20 },
      ],
    },
  ]);

  await PricingRule.insertMany([
    {
      name: 'Weekend Boost',
      description: 'Higher demand on weekends',
      criteria: { daysOfWeek: [0, 6], appliesTo: 'court' },
      adjustment: { type: 'multiplier', value: 1.2 },
      priority: 1,
    },
    {
      name: 'Peak Hours',
      description: 'Evening peak 6-9PM',
      criteria: { startHour: 18, endHour: 21, appliesTo: 'court' },
      adjustment: { type: 'multiplier', value: 1.25 },
      priority: 2,
    },
    {
      name: 'Indoor Premium',
      description: 'Indoor maintenance premium',
      criteria: { courtType: 'indoor', appliesTo: 'court' },
      adjustment: { type: 'multiplier', value: 1.15 },
      priority: 3,
    },
    {
      name: 'Equipment Handling',
      description: 'Handling and sanitation fee',
      criteria: { appliesTo: 'equipment' },
      adjustment: { type: 'flat', value: 2 },
      priority: 1,
    },
    {
      name: 'Coach Weekend Premium',
      description: 'Coaching on weekends is premium',
      criteria: { daysOfWeek: [0, 6], appliesTo: 'coach' },
      adjustment: { type: 'multiplier', value: 1.1 },
      priority: 1,
    },
  ]);

  const hash = async (pwd) => bcrypt.hash(pwd, 10);
  await User.insertMany([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: await hash('Admin@123'),
      role: 'admin',
    },
    {
      name: 'Regular User',
      email: 'user@example.com',
      password: await hash('User@123'),
      role: 'user',
    },
  ]);

  console.log('Seed data inserted');
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

