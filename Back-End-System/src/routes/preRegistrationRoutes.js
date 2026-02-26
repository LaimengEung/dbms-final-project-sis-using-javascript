const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/preRegistrationController');

const router = express.Router();
router.get('/', asyncHandler(controller.listPreRegistrations));
router.get('/:id', asyncHandler(controller.getPreRegistration));
router.post('/', asyncHandler(controller.createPreRegistration));
router.put('/:id', asyncHandler(controller.updatePreRegistration));
router.delete('/:id', asyncHandler(controller.deletePreRegistration));

module.exports = router;
