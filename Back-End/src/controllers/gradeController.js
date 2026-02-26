const gradeService = require('../services/gradeService');
const { normalizeRole } = require('../middlewares/auth');

const getRole = (req) => normalizeRole(req?.user?.role);
const toPublicGrade = (grade) => {
  if (!grade) return grade;
  const { student_id, faculty_id, ...rest } = grade;
  return rest;
};

const listGrades = async (req, res) => {
  const role = getRole(req);
  if (role === 'student') {
    if (!req?.user?.student_id) return res.status(403).json({ message: 'Forbidden: missing student profile' });
    req.query.student_id = req.user.student_id;
  }
  if (role === 'teacher') {
    if (!req?.user?.faculty_id) return res.status(403).json({ message: 'Forbidden: missing faculty profile' });
    req.query.faculty_id = req.user.faculty_id;
  }
  return res.json(await gradeService.listGrades(req.query || {}));
};

const getGrade = async (req, res) => {
  const row = await gradeService.getGradeById(req.params.id);
  if (!row) return res.status(404).json({ message: 'Grade not found' });

  const role = getRole(req);
  if (role === 'student' && Number(row.student_id) !== Number(req?.user?.student_id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (role === 'teacher' && Number(row.faculty_id) !== Number(req?.user?.faculty_id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.json(toPublicGrade(row));
};

const createGrade = async (req, res) => {
  if (!req.body?.enrollment_id) return res.status(400).json({ message: 'enrollment_id is required' });

  const role = getRole(req);
  if (role === 'student') return res.status(403).json({ message: 'Forbidden' });

  if (role === 'teacher') {
    const context = await gradeService.getEnrollmentContext(req.body.enrollment_id);
    if (!context || Number(context.faculty_id) !== Number(req?.user?.faculty_id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  } else if (!['admin', 'registrar'].includes(role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.status(201).json(await gradeService.createGrade(req.body || {}));
};

const updateGrade = async (req, res) => {
  const role = getRole(req);
  if (role === 'student') return res.status(403).json({ message: 'Forbidden' });

  const existing = await gradeService.getGradeById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Grade not found' });

  if (role === 'teacher' && Number(existing.faculty_id) !== Number(req?.user?.faculty_id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (!['admin', 'registrar', 'teacher'].includes(role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const row = await gradeService.updateGrade(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: 'Grade not found' });
  return res.json(row);
};

const deleteGrade = async (req, res) => {
  const role = getRole(req);
  if (role === 'student') return res.status(403).json({ message: 'Forbidden' });

  const existing = await gradeService.getGradeById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Grade not found' });

  if (role === 'teacher' && Number(existing.faculty_id) !== Number(req?.user?.faculty_id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (!['admin', 'registrar', 'teacher'].includes(role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const ok = await gradeService.deleteGrade(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Grade not found' });
  return res.json({ message: 'Grade deleted successfully' });
};

module.exports = { listGrades, getGrade, createGrade, updateGrade, deleteGrade };
