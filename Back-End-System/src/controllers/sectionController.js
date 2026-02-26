const sectionService = require('../services/sectionService');

const listClassSections = async (req, res) => {
  const rows = await sectionService.listSections(req.query || {});
  res.json({ data: rows });
};

const getAvailableSections = async (req, res) => {
  const rows = await sectionService.listSections({ semester_id: req.query.semesterId || req.query.semester_id, status: 'open' });
  const available = rows.filter((r) => Number(r.enrolled_count) < Number(r.max_capacity));
  res.json({ data: available });
};

const getSection = async (req, res) => {
  const row = await sectionService.getSectionById(req.params.id);
  if (!row) return res.status(404).json({ message: 'Section not found' });
  return res.json({ data: row });
};

const getSectionCapacity = async (req, res) => {
  const row = await sectionService.getSectionCapacity(req.params.id);
  if (!row) return res.status(404).json({ message: 'Section not found' });
  return res.json(row);
};

module.exports = {
  listClassSections,
  getAvailableSections,
  getSection,
  getSectionCapacity,
};
