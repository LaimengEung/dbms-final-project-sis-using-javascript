const preRegistrationService = require('../services/preRegistrationService');

const listPreRegistrations = async (req, res) => res.json(await preRegistrationService.listPreRegs(req.query || {}));

const getPreRegistration = async (req, res) => {
  const row = await preRegistrationService.getPreRegById(req.params.id);
  if (!row) return res.status(404).json({ message: 'Pre-registration not found' });
  return res.json(row);
};

const createPreRegistration = async (req, res) => {
  const { student_id, section_id, semester_id } = req.body || {};
  if (!student_id || !section_id || !semester_id) return res.status(400).json({ message: 'student_id, section_id, semester_id are required' });
  return res.status(201).json(await preRegistrationService.createPreReg(req.body || {}));
};

const updatePreRegistration = async (req, res) => {
  const row = await preRegistrationService.updatePreReg(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: 'Pre-registration not found' });
  return res.json(row);
};

const deletePreRegistration = async (req, res) => {
  const ok = await preRegistrationService.deletePreReg(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Pre-registration not found' });
  return res.json({ message: 'Pre-registration deleted successfully' });
};

module.exports = {
  listPreRegistrations,
  getPreRegistration,
  createPreRegistration,
  updatePreRegistration,
  deletePreRegistration,
};
