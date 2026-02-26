const departmentService = require('../services/departmentService');

const getDepartments = async (req, res) => {
  const rows = await departmentService.listDepartments();
  res.json(rows);
};

module.exports = { getDepartments };
