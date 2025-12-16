const express = require('express');
const bookingRoutes = require('./booking.routes');
const adminRoutes = require('./admin.routes');
const metaRoutes = require('./meta.routes');
const authRoutes = require('./auth.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/meta', metaRoutes);

module.exports = router;

