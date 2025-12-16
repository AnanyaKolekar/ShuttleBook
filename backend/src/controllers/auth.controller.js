const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin').default('user'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  admin: Joi.boolean().optional(),
});

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'devsecret',
    { expiresIn: '7d' }
  );

const signup = async (req, res) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }
  const existing = await User.findOne({ email: value.email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('Email already registered');
  }
  const user = await User.create(value);
  const token = signToken(user);
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }
  const user = await User.findOne({ email: value.email.toLowerCase() });
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const valid = await user.comparePassword(value.password);
  if (!valid) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  if (value.admin && user.role !== 'admin') {
    res.status(403);
    throw new Error('Admin access denied');
  }
  const token = signToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { signup, login, me };

