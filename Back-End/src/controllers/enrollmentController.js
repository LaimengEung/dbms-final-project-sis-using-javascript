const enrollmentService = require('../services/enrollmentService');
const { normalizeRole } = require('../middlewares/auth');

const getRole = (req) => normalizeRole(req?.user?.role);

const listEnrollments = async (req, res) => {
  const role = getRole(req);
  if (role === 'student') {
    if (!req?.user?.student_id) return res.status(403).json({ message: 'Forbidden: missing student profile' });
    req.query.student_id = req.user.student_id;
  }
  if (role === 'teacher') {
    if (!req?.user?.faculty_id) return res.status(403).json({ message: 'Forbidden: missing faculty profile' });
    req.query.faculty_id = req.user.faculty_id;
  }
  res.json(await enrollmentService.listEnrollments(req.query || {}));
};

const getEnrollment = async (req, res) => {
  const row = await enrollmentService.getEnrollmentById(req.params.id);
  if (!row) return res.status(404).json({ message: 'Enrollment not found' });

  const role = getRole(req);
  if (role === 'student' && Number(row.student_id) !== Number(req?.user?.student_id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (role === 'teacher' && Number(row?.section?.faculty_id) !== Number(req?.user?.faculty_id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.json({ data: row });
};

const createEnrollment = async (req, res) => {
  const role = getRole(req);
  if (role === 'teacher') return res.status(403).json({ message: 'Forbidden' });

  const { student_id, section_id } = req.body || {};
  if (role === 'student') {
    if (!req?.user?.student_id) return res.status(403).json({ message: 'Forbidden: missing student profile' });
    if (student_id && Number(student_id) !== Number(req.user.student_id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.body.student_id = req.user.student_id;
  }

  if (!req.body?.student_id || !section_id) return res.status(400).json({ message: 'student_id and section_id are required' });

  const created = await enrollmentService.createEnrollment(req.body || {});
  if (created.error) return res.status(created.error.status).json({ message: created.error.message });

  return res.status(201).json({ data: created.data, message: 'Enrollment created successfully' });
};

const bulkCreate = async (req, res) => {
  const role = getRole(req);
  if (!['admin', 'registrar'].includes(role)) return res.status(403).json({ message: 'Forbidden' });

  const result = await enrollmentService.bulkCreateEnrollments(req.body || {});
  return res.status(201).json(result);
};

const updateEnrollment = async (req, res) => {
  const role = getRole(req);
  if (!['admin', 'registrar'].includes(role)) return res.status(403).json({ message: 'Forbidden' });

  const row = await enrollmentService.updateEnrollment(req.params.id, req.body || {});
  if (row?.error) return res.status(row.error.status).json({ message: row.error.message });
  if (!row) return res.status(404).json({ message: 'Enrollment not found' });
  return res.json({ message: 'Enrollment updated successfully', data: row });
};

const updateStatus = async (req, res) => {
  if (!req.body?.status) return res.status(400).json({ message: 'status is required' });
  const allowed = new Set(['enrolled', 'dropped', 'withdrawn', 'completed']);
  if (!allowed.has(String(req.body.status).toLowerCase())) {
    return res.status(400).json({ message: 'Invalid enrollment status' });
  }

  const role = getRole(req);
  const current = await enrollmentService.getEnrollmentById(req.params.id);
  if (!current) return res.status(404).json({ message: 'Enrollment not found' });

  if (role === 'student') {
    const requested = String(req.body.status).toLowerCase();
    if (!['dropped', 'withdrawn'].includes(requested)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (Number(current.student_id) !== Number(req?.user?.student_id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  } else if (!['admin', 'registrar'].includes(role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const row = await enrollmentService.updateEnrollmentStatus(req.params.id, req.body.status);
  if (!row) return res.status(404).json({ message: 'Enrollment not found' });
  return res.json({ message: 'Status updated successfully', data: row });
};

const deleteEnrollment = async (req, res) => {
  const role = getRole(req);
  if (role === 'student') {
    const current = await enrollmentService.getEnrollmentById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Enrollment not found' });
    if (Number(current.student_id) !== Number(req?.user?.student_id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  } else if (!['admin', 'registrar'].includes(role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const ok = await enrollmentService.deleteEnrollment(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Enrollment not found' });
  return res.json({ message: 'Enrollment dropped successfully' });
};

const getAvailableSections = async (req, res) => {
  const role = getRole(req);
  if (!['admin', 'registrar', 'student'].includes(role)) return res.status(403).json({ message: 'Forbidden' });

  const rows = await require('../services/sectionService').listSections({ semester_id: req.query.semester_id, status: 'open' });
  res.json({ data: rows.filter((r) => Number(r.enrolled_count) < Number(r.max_capacity)) });
};

module.exports = {
  listEnrollments,
  getEnrollment,
  createEnrollment,
  bulkCreate,
  updateEnrollment,
  updateStatus,
  deleteEnrollment,
  getAvailableSections,
};
