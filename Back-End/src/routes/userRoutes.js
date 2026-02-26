const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/userController');

const router = express.Router();
router.get('/', asyncHandler(controller.listUsers));
router.get('/stats', asyncHandler(controller.getStats));
router.get('/:id', asyncHandler(controller.getUser));
router.post('/', asyncHandler(controller.createUser));
router.put('/:id', asyncHandler(controller.updateUser));
router.patch('/:id', asyncHandler(controller.patchUser));
router.delete('/:id', asyncHandler(controller.deleteUser));

module.exports = router;
