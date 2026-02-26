const { query } = require('../db');

const mapRequirement = (r) => ({
  requirement_id: Number(r.requirement_id),
  major_id: r.major_id == null ? null : Number(r.major_id),
  major_name: r.major_name || null,
  course_id: r.course_id == null ? null : Number(r.course_id),
  course_code: r.course_code || null,
  course_name: r.course_name || null,
  requirement_type: r.requirement_type,
  is_required: r.is_required,
  credits: r.credits == null ? null : Number(r.credits),
});

const listRequirements = async ({ major_id, course_id, requirement_type } = {}) => {
  const params = [];
  const where = [];
  if (major_id) {
    params.push(Number(major_id));
    where.push(`dr.major_id = $${params.length}`);
  }
  if (course_id) {
    params.push(Number(course_id));
    where.push(`dr.course_id = $${params.length}`);
  }
  if (requirement_type) {
    params.push(String(requirement_type).toLowerCase());
    where.push(`LOWER(dr.requirement_type) = $${params.length}`);
  }

  const result = await query(
    `SELECT dr.requirement_id,dr.major_id,dr.course_id,dr.requirement_type,dr.is_required,dr.credits,
            m.major_name,c.course_code,c.course_name
     FROM degree_requirements dr
     LEFT JOIN majors m ON m.major_id = dr.major_id
     LEFT JOIN courses c ON c.course_id = dr.course_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY dr.requirement_id DESC`,
    params
  );

  return result.rows.map(mapRequirement);
};

const getRequirementById = async (id) => {
  const result = await query(
    `SELECT dr.requirement_id,dr.major_id,dr.course_id,dr.requirement_type,dr.is_required,dr.credits,
            m.major_name,c.course_code,c.course_name
     FROM degree_requirements dr
     LEFT JOIN majors m ON m.major_id = dr.major_id
     LEFT JOIN courses c ON c.course_id = dr.course_id
     WHERE dr.requirement_id = $1`,
    [Number(id)]
  );
  return result.rowCount ? mapRequirement(result.rows[0]) : null;
};

const createRequirement = async (payload) => {
  const result = await query(
    `INSERT INTO degree_requirements(major_id,course_id,requirement_type,is_required,credits)
     VALUES($1,$2,$3,$4,$5)
     RETURNING requirement_id,major_id,course_id,requirement_type,is_required,credits`,
    [
      payload.major_id ? Number(payload.major_id) : null,
      payload.course_id ? Number(payload.course_id) : null,
      payload.requirement_type || null,
      payload.is_required ?? true,
      payload.credits == null ? null : Number(payload.credits),
    ]
  );
  return getRequirementById(result.rows[0].requirement_id);
};

const updateRequirement = async (id, payload) => {
  const result = await query(
    `UPDATE degree_requirements
     SET major_id=$1,course_id=$2,requirement_type=$3,is_required=$4,credits=$5
     WHERE requirement_id=$6
     RETURNING requirement_id`,
    [
      payload.major_id ? Number(payload.major_id) : null,
      payload.course_id ? Number(payload.course_id) : null,
      payload.requirement_type || null,
      payload.is_required ?? true,
      payload.credits == null ? null : Number(payload.credits),
      Number(id),
    ]
  );
  return result.rowCount ? getRequirementById(id) : null;
};

const deleteRequirement = async (id) => {
  const result = await query('DELETE FROM degree_requirements WHERE requirement_id=$1 RETURNING requirement_id', [Number(id)]);
  return result.rowCount > 0;
};

module.exports = { listRequirements, getRequirementById, createRequirement, updateRequirement, deleteRequirement };
