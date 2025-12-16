const express = require('express');
const bookingController = require('../controllers/booking.controller');
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware } = require('../utils/auth');

const router = express.Router();

router.get('/availability', asyncHandler(bookingController.getAvailability));
router.post('/price', authMiddleware, asyncHandler(bookingController.getPriceQuote));
router.post('/', authMiddleware, asyncHandler(bookingController.createBooking));
router.get('/history', authMiddleware, asyncHandler(bookingController.getHistory));
router.post('/waitlist', authMiddleware, asyncHandler(bookingController.joinWaitlist));
router.patch('/:id/cancel', authMiddleware, asyncHandler(bookingController.cancelBooking));

module.exports = router;

