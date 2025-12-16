const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Authentication required'));
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    const user = await User.findById(decoded.id).lean();
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }
    req.user = { ...user, id: user._id.toString() };
    return next();
  } catch (err) {
    res.status(401);
    return next(new Error('Invalid or expired token'));
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    res.status(403);
    return next(new Error('Forbidden'));
  }
  return next();
};

module.exports = { authMiddleware, requireRole };

