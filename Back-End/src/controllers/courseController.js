const courseService = require('../services/courseService');
const sectionService = require('../services/sectionService');

const listCourses = async (req, res) => {
  res.json(await courseService.listCourses());
};

const getCourse = async (req, res) => {
  const row = await courseService.getCourseById(req.params.id);
  if (!row) return res.status(404).json({ message: 'Course not found' });
  return res.json(row);
};

const createCourse = async (req, res) => {
  const { course_code, course_name } = req.body || {};
  if (!course_code || !course_name) return res.status(400).json({ message: 'Missing required fields' });
  return res.status(201).json(await courseService.createCourse(req.body || {}));
};

const updateCourse = async (req, res) => {
  const row = await courseService.updateCourse(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: 'Course not found' });
  return res.json(row);
};

const deleteCourse = async (req, res) => {
  const ok = await courseService.deleteCourse(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Course not found' });
  return res.json({ message: 'Course deleted successfully' });
};

const getCourseSections = async (req, res) => {
  const rows = await sectionService.listSections({ course_id: req.params.id });
  return res.json(rows);
};

const createCourseSection = async (req, res) => {
  const row = await sectionService.createSectionForCourse(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: 'Course not found' });
  return res.status(201).json(row);
};

const getCoursePrerequisites = async (req, res) => {
  return res.json([]);
};

module.exports = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseSections,
  createCourseSection,
  getCoursePrerequisites,
};
