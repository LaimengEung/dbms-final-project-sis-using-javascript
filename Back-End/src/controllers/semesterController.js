const semesterService = require('../services/semesterService');

const listSemesters = async (req, res) => {
  const rows = await semesterService.listSemesters(req.query || {});
  res.json({ data: rows });
};

const createSemester = async (req, res) => {
  const created = await semesterService.createSemester(req.body || {});
  if (created?.error) return res.status(created.error.status).json({ message: created.error.message });
  return res.status(201).json({ message: 'Semester created successfully', data: created.data });
};

const updateSemester = async (req, res) => {
  const updated = await semesterService.updateSemester(req.params.id, req.body || {});
  if (updated?.error) return res.status(updated.error.status).json({ message: updated.error.message });
  if (!updated) return res.status(404).json({ message: 'Semester not found' });
  return res.json({ message: 'Semester updated successfully', data: updated.data });
};

const setCurrentSemester = async (req, res) => {
  const updated = await semesterService.setCurrentSemester(req.params.id);
  if (!updated) return res.status(404).json({ message: 'Semester not found' });
  return res.json({ message: 'Current semester updated successfully', data: updated.data });
};

module.exports = { listSemesters, createSemester, updateSemester, setCurrentSemester };
