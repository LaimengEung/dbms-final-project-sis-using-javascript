const { query } = require('../db');

const mapMajor = (r) => ({
  major_id: Number(r.major_id),
  major_code: r.major_code,
  major_name: r.major_name,
  department_id: r.department_id == null ? null : Number(r.department_id),
  department_name: r.department_name || null,
  required_credits: Number(r.required_credits || 0),
  description: r.description,
});

const listMajors = async ({ department_id } = {}) => {
  const params = [];
  const where = [];
  if (department_id) {
    params.push(Number(department_id));
    where.push(`m.department_id = $${params.length}`);
  }

  const result = await query(
    `SELECT m.major_id,m.major_code,m.major_name,m.department_id,m.required_credits,m.description,d.department_name
     FROM majors m
     LEFT JOIN departments d ON d.department_id = m.department_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY m.major_name`,
    params
  );

  return result.rows.map(mapMajor);
};

const getMajorById = async (majorId) => {
  const result = await query(
    `SELECT m.major_id,m.major_code,m.major_name,m.department_id,m.required_credits,m.description,d.department_name
     FROM majors m
     LEFT JOIN departments d ON d.department_id = m.department_id
     WHERE m.major_id = $1`,
    [Number(majorId)]
  );
  return result.rowCount ? mapMajor(result.rows[0]) : null;
};

const createMajor = async (payload) => {
  const result = await query(
    `INSERT INTO majors(major_code,major_name,department_id,required_credits,description)
     VALUES($1,$2,$3,$4,$5)
     RETURNING major_id,major_code,major_name,department_id,required_credits,description`,
    [
      String(payload.major_code).trim(),
      String(payload.major_name).trim(),
      payload.department_id ? Number(payload.department_id) : null,
      Number(payload.required_credits || 0),
      payload.description || null,
    ]
  );
  return mapMajor(result.rows[0]);
};

const updateMajor = async (majorId, payload) => {
  const result = await query(
    `UPDATE majors
     SET major_code=$1,major_name=$2,department_id=$3,required_credits=$4,description=$5
     WHERE major_id=$6
     RETURNING major_id,major_code,major_name,department_id,required_credits,description`,
    [
      String(payload.major_code || '').trim(),
      String(payload.major_name || '').trim(),
      payload.department_id ? Number(payload.department_id) : null,
      Number(payload.required_credits || 0),
      payload.description || null,
      Number(majorId),
    ]
  );
  return result.rowCount ? mapMajor(result.rows[0]) : null;
};

const deleteMajor = async (majorId) => {
  const result = await query('DELETE FROM majors WHERE major_id=$1 RETURNING major_id', [Number(majorId)]);
  return result.rowCount > 0;
};

module.exports = { listMajors, getMajorById, createMajor, updateMajor, deleteMajor };
