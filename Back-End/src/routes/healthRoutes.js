const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/healthController');

const router = express.Router();
router.get('/', controller.root);
router.get('/health', asyncHandler(controller.health));

module.exports = router;
