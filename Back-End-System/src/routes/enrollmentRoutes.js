const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/enrollmentController');

const router = express.Router();
router.get('/', asyncHandler(controller.listEnrollments));
router.get('/available-sections', asyncHandler(controller.getAvailableSections));
router.get('/:id', asyncHandler(controller.getEnrollment));
router.post('/', asyncHandler(controller.createEnrollment));
router.post('/bulk', asyncHandler(controller.bulkCreate));
router.put('/:id', asyncHandler(controller.updateEnrollment));
router.patch('/:id/status', asyncHandler(controller.updateStatus));
router.delete('/:id', asyncHandler(controller.deleteEnrollment));

module.exports = router;
