const majorService = require('../services/majorService');

const listMajors = async (req, res) => {
  res.json(await majorService.listMajors(req.query || {}));
};

const getMajor = async (req, res) => {
  const row = await majorService.getMajorById(req.params.id);
  if (!row) return res.status(404).json({ message: 'Major not found' });
  return res.json(row);
};

const createMajor = async (req, res) => {
  const { major_code, major_name, required_credits } = req.body || {};
  if (!major_code || !major_name || required_credits == null) return res.status(400).json({ message: 'Missing required fields' });
  return res.status(201).json(await majorService.createMajor(req.body || {}));
};

const updateMajor = async (req, res) => {
  const row = await majorService.updateMajor(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: 'Major not found' });
  return res.json(row);
};

const deleteMajor = async (req, res) => {
  const ok = await majorService.deleteMajor(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Major not found' });
  return res.json({ message: 'Major deleted successfully' });
};

module.exports = { listMajors, getMajor, createMajor, updateMajor, deleteMajor };
