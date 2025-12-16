const express = require('express');
const bookingController = require('../controllers/booking.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(bookingController.getMeta));

module.exports = router;

