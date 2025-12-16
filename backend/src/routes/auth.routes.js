const express = require('express');
const authController = require('../controllers/auth.controller');
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware } = require('../utils/auth');

const router = express.Router();

router.post('/signup', asyncHandler(authController.signup));
router.post('/login', asyncHandler(authController.login));
router.get('/me', authMiddleware, asyncHandler(authController.me));

module.exports = router;

