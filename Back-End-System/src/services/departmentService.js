const { query } = require('../db');

const listDepartments = async () => {
  const result = await query(
    'SELECT department_id, department_code, department_name, description FROM departments ORDER BY department_name'
  );
  return result.rows;
};

module.exports = { listDepartments };
