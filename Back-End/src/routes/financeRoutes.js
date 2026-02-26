const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/financeController');

const router = express.Router();
router.get('/', asyncHandler(controller.listFinanceRecords));
router.get('/:id', asyncHandler(controller.getFinanceRecord));
router.post('/', asyncHandler(controller.createFinanceRecord));
router.put('/:id', asyncHandler(controller.updateFinanceRecord));
router.delete('/:id', asyncHandler(controller.deleteFinanceRecord));

module.exports = router;
