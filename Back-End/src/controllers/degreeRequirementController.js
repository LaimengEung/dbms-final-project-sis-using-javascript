const degreeRequirementService = require('../services/degreeRequirementService');

const listDegreeRequirements = async (req, res) => res.json(await degreeRequirementService.listRequirements(req.query || {}));

const getDegreeRequirement = async (req, res) => {
  const row = await degreeRequirementService.getRequirementById(req.params.id);
  if (!row) return res.status(404).json({ message: 'Degree requirement not found' });
  return res.json(row);
};

const createDegreeRequirement = async (req, res) => {
  return res.status(201).json(await degreeRequirementService.createRequirement(req.body || {}));
};

const updateDegreeRequirement = async (req, res) => {
  const row = await degreeRequirementService.updateRequirement(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: 'Degree requirement not found' });
  return res.json(row);
};

const deleteDegreeRequirement = async (req, res) => {
  const ok = await degreeRequirementService.deleteRequirement(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Degree requirement not found' });
  return res.json({ message: 'Degree requirement deleted successfully' });
};

module.exports = {
  listDegreeRequirements,
  getDegreeRequirement,
  createDegreeRequirement,
  updateDegreeRequirement,
  deleteDegreeRequirement,
};
