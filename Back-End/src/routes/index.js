const express = require('express');

const healthRoutes = require('./healthRoutes');
const departmentRoutes = require('./departmentRoutes');
const userRoutes = require('./userRoutes');
const studentRoutes = require('./studentRoutes');
const facultyRoutes = require('./facultyRoutes');
const courseRoutes = require('./courseRoutes');
const sectionRoutes = require('./sectionRoutes');
const semesterRoutes = require('./semesterRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');
const majorRoutes = require('./majorRoutes');
const gradeRoutes = require('./gradeRoutes');
const preRegistrationRoutes = require('./preRegistrationRoutes');
const degreeRequirementRoutes = require('./degreeRequirementRoutes');
const financeRoutes = require('./financeRoutes');
const authRoutes = require('./authRoutes');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.use('/', healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/departments', authenticate, authorizeRoles('admin', 'registrar'), departmentRoutes);
router.use('/api/users', authenticate, authorizeRoles('admin'), userRoutes);
router.use('/api/students', authenticate, authorizeRoles('admin', 'registrar', 'student'), studentRoutes);
router.use('/api/faculty', authenticate, authorizeRoles('admin', 'registrar', 'teacher'), facultyRoutes);
router.use('/api/courses', authenticate, authorizeRoles('admin', 'registrar', 'teacher', 'student'), courseRoutes);
router.use('/api/semesters', authenticate, authorizeRoles('admin', 'registrar', 'teacher', 'student'), semesterRoutes);
router.use('/api/enrollments', authenticate, authorizeRoles('admin', 'registrar', 'teacher', 'student'), enrollmentRoutes);
router.use('/api/majors', authenticate, authorizeRoles('admin', 'registrar'), majorRoutes);
router.use('/api/grades', authenticate, authorizeRoles('admin', 'registrar', 'teacher', 'student'), gradeRoutes);
router.use('/api/pre-registrations', authenticate, authorizeRoles('admin', 'registrar', 'teacher', 'student'), preRegistrationRoutes);
router.use('/api/degree-requirements', authenticate, authorizeRoles('admin', 'registrar'), degreeRequirementRoutes);
router.use('/api/finance-records', authenticate, authorizeRoles('admin', 'registrar'), financeRoutes);
router.use('/api', authenticate, authorizeRoles('admin', 'registrar', 'teacher', 'student'), sectionRoutes);

module.exports = router;
