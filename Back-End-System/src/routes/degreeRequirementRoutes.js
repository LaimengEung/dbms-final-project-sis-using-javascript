const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/degreeRequirementController');

const router = express.Router();
router.get('/', asyncHandler(controller.listDegreeRequirements));
router.get('/:id', asyncHandler(controller.getDegreeRequirement));
router.post('/', asyncHandler(controller.createDegreeRequirement));
router.put('/:id', asyncHandler(controller.updateDegreeRequirement));
router.delete('/:id', asyncHandler(controller.deleteDegreeRequirement));

module.exports = router;
