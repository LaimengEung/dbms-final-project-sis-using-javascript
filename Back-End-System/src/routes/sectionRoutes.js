const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/sectionController');

const router = express.Router();
router.get('/class-sections', asyncHandler(controller.listClassSections));
router.get('/sections/available', asyncHandler(controller.getAvailableSections));
router.get('/sections/:id', asyncHandler(controller.getSection));
router.get('/sections/:id/capacity', asyncHandler(controller.getSectionCapacity));

module.exports = router;
