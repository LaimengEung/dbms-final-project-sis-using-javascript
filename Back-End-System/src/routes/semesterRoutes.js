const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/semesterController');

const router = express.Router();
router.get('/', asyncHandler(controller.listSemesters));
router.post('/', asyncHandler(controller.createSemester));
router.put('/:id', asyncHandler(controller.updateSemester));
router.patch('/:id/current', asyncHandler(controller.setCurrentSemester));

module.exports = router;
