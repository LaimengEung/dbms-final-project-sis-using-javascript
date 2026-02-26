const studentService = require('../services/studentService');
const { normalizeRole } = require('../middlewares/auth');

const isStudentSelf = (req, studentId) => {
  const role = normalizeRole(req?.user?.role);
  if (role !== 'student') return true;
  return Number(req?.user?.student_id) === Number(studentId);
};

const listStudents = async (req, res) => {
  if (normalizeRole(req?.user?.role) === 'student') {
    if (!req?.user?.student_id) return res.status(403).json({ message: 'Forbidden: missing student profile' });
    req.query.student_id = req.user.student_id;
  }
  const rows = await studentService.listStudents(req.query || {});
  res.json(rows);
};

const getStudent = async (req, res) => {
  if (!isStudentSelf(req, req.params.id)) return res.status(403).json({ message: 'Forbidden' });
  const row = await studentService.getStudentById(req.params.id);
  if (!row) return res.status(404).json({ message: 'Student not found' });
  return res.json(row);
};

const createStudent = async (req, res) => {
  const role = normalizeRole(req?.user?.role);
  if (!['admin', 'registrar'].includes(role)) return res.status(403).json({ message: 'Forbidden' });

  const { first_name, last_name, email, password } = req.body || {};
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const row = await studentService.createStudent(req.body || {});
  return res.status(201).json({
    message: 'Student created successfully!',
    data: row,
    credentials: null,
  });
};

const updateStudent = async (req, res) => {
  const role = normalizeRole(req?.user?.role);
  if (!['admin', 'registrar', 'student'].includes(role)) return res.status(403).json({ message: 'Forbidden' });
  if (!isStudentSelf(req, req.params.id)) return res.status(403).json({ message: 'Forbidden' });
  const row = await studentService.updateStudent(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: 'Student not found' });
  return res.json({ message: 'Student updated successfully', data: row });
};

const getStudentEnrollments = async (req, res) => {
  if (!isStudentSelf(req, req.params.id)) return res.status(403).json({ message: 'Forbidden' });
  const rows = await studentService.getStudentEnrollments(req.params.id);
  return res.json(rows);
};

const deleteStudent = async (req, res) => {
  if (normalizeRole(req?.user?.role) === 'student') return res.status(403).json({ message: 'Forbidden' });
  const ok = await studentService.deleteStudent(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Student not found' });
  return res.json({ message: 'Student deleted successfully', data: { deletedId: Number(req.params.id) } });
};

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  getStudentEnrollments,
  deleteStudent,
};
