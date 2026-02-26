const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/majorController');

const router = express.Router();
router.get('/', asyncHandler(controller.listMajors));
router.get('/:id', asyncHandler(controller.getMajor));
router.post('/', asyncHandler(controller.createMajor));
router.put('/:id', asyncHandler(controller.updateMajor));
router.delete('/:id', asyncHandler(controller.deleteMajor));

module.exports = router;
