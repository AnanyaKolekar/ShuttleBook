const express = require('express');
const adminController = require('../controllers/admin.controller');
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware } = require('../utils/auth');
const requireAdmin = require('../utils/requireAdmin');

const router = express.Router();

router.use(authMiddleware, requireAdmin);

router.get('/courts', asyncHandler(adminController.listCourts));
router.post('/courts', asyncHandler(adminController.createCourt));
router.patch('/courts/:id', asyncHandler(adminController.updateCourt));

router.get('/equipment', asyncHandler(adminController.listEquipment));
router.post('/equipment', asyncHandler(adminController.createEquipment));
router.patch('/equipment/:id', asyncHandler(adminController.updateEquipment));

router.get('/coaches', asyncHandler(adminController.listCoaches));
router.post('/coaches', asyncHandler(adminController.createCoach));
router.patch('/coaches/:id', asyncHandler(adminController.updateCoach));

router.get('/pricing-rules', asyncHandler(adminController.listPricingRules));
router.post('/pricing-rules', asyncHandler(adminController.createPricingRule));
router.patch('/pricing-rules/:id', asyncHandler(adminController.updatePricingRule));

module.exports = router;

