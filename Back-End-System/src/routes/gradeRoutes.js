const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/gradeController');

const router = express.Router();
router.get('/', asyncHandler(controller.listGrades));
router.get('/:id', asyncHandler(controller.getGrade));
router.post('/', asyncHandler(controller.createGrade));
router.put('/:id', asyncHandler(controller.updateGrade));
router.delete('/:id', asyncHandler(controller.deleteGrade));

module.exports = router;
