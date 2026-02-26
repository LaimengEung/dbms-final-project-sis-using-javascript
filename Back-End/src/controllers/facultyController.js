const facultyService = require('../services/facultyService');
const { normalizeRole } = require('../middlewares/auth');

const listFaculty = async (req, res) => {
  const role = normalizeRole(req?.user?.role);
  if (role === 'teacher') {
    if (!req?.user?.faculty_id) return res.status(403).json({ message: 'Forbidden: missing faculty profile' });
    const self = await facultyService.getFacultyById(req.user.faculty_id);
    return res.json(self ? [self] : []);
  }
  const rows = await facultyService.listFaculty();
  res.json(rows);
};

const getFaculty = async (req, res) => {
  const role = normalizeRole(req?.user?.role);
  if (role === 'teacher' && Number(req.params.id) !== Number(req?.user?.faculty_id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const row = await facultyService.getFacultyById(req.params.id);
  if (!row) return res.status(404).json({ message: 'Faculty not found' });
  return res.json(row);
};

const createFaculty = async (req, res) => {
  const role = normalizeRole(req?.user?.role);
  if (!['admin', 'registrar'].includes(role)) return res.status(403).json({ message: 'Forbidden' });

  const { first_name, last_name, email, title, department_id, password } = req.body || {};
  if (!first_name || !last_name || !email || !title || !department_id || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const row = await facultyService.createFaculty(req.body || {});
  return res.status(201).json(row);
};

const updateFaculty = async (req, res) => {
  const role = normalizeRole(req?.user?.role);
  if (role === 'teacher' && Number(req.params.id) !== Number(req?.user?.faculty_id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (!['admin', 'registrar', 'teacher'].includes(role)) return res.status(403).json({ message: 'Forbidden' });

  const row = await facultyService.updateFaculty(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: 'Faculty not found' });
  return res.json(row);
};

const deleteFaculty = async (req, res) => {
  const role = normalizeRole(req?.user?.role);
  if (!['admin', 'registrar'].includes(role)) return res.status(403).json({ message: 'Forbidden' });

  const ok = await facultyService.deleteFaculty(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Faculty not found' });
  return res.json({ message: 'Faculty deleted successfully' });
};

module.exports = { listFaculty, getFaculty, createFaculty, updateFaculty, deleteFaculty };
