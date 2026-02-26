const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post('/login', asyncHandler(controller.login));
router.post('/forgot-password', asyncHandler(controller.forgotPassword));
router.post('/reset-password', asyncHandler(controller.resetPassword));
router.post('/change-password', authenticate, asyncHandler(controller.changePassword));

module.exports = router;
