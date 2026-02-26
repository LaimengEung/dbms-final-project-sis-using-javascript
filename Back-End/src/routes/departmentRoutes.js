const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/departmentController');

const router = express.Router();
router.get('/', asyncHandler(controller.getDepartments));

module.exports = router;
