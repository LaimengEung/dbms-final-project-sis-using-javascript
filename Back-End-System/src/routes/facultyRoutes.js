const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/facultyController');

const router = express.Router();
router.get('/', asyncHandler(controller.listFaculty));
router.get('/:id', asyncHandler(controller.getFaculty));
router.post('/', asyncHandler(controller.createFaculty));
router.put('/:id', asyncHandler(controller.updateFaculty));
router.delete('/:id', asyncHandler(controller.deleteFaculty));

module.exports = router;
