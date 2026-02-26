const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/studentController');

const router = express.Router();
router.get('/', asyncHandler(controller.listStudents));
router.get('/:id', asyncHandler(controller.getStudent));
router.get('/:id/enrollments', asyncHandler(controller.getStudentEnrollments));
router.post('/', asyncHandler(controller.createStudent));
router.put('/:id', asyncHandler(controller.updateStudent));
router.delete('/:id', asyncHandler(controller.deleteStudent));

module.exports = router;
