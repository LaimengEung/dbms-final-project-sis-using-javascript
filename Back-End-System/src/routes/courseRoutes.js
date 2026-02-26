const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const controller = require('../controllers/courseController');

const router = express.Router();
router.get('/', asyncHandler(controller.listCourses));
router.get('/:id', asyncHandler(controller.getCourse));
router.post('/', asyncHandler(controller.createCourse));
router.put('/:id', asyncHandler(controller.updateCourse));
router.delete('/:id', asyncHandler(controller.deleteCourse));
router.get('/:id/sections', asyncHandler(controller.getCourseSections));
router.post('/:id/sections', asyncHandler(controller.createCourseSection));
router.get('/:id/prerequisites', asyncHandler(controller.getCoursePrerequisites));

module.exports = router;
