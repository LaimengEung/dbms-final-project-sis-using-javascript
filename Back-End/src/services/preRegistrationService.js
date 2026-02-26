const { query } = require('../db');

const mapPreReg = (r) => ({
  pre_reg_id: Number(r.pre_reg_id),
  student_id: Number(r.student_id),
  section_id: Number(r.section_id),
  semester_id: Number(r.semester_id),
  requested_date: r.requested_date,
  status: r.status,
  approved_by: r.approved_by == null ? null : Number(r.approved_by),
  approved_date: r.approved_date,
  notes: r.notes,
});

const listPreRegs = async ({ student_id, semester_id, status } = {}) => {
  const params = [];
  const where = [];
  if (student_id) {
    params.push(Number(student_id));
    where.push(`student_id = $${params.length}`);
  }
  if (semester_id) {
    params.push(Number(semester_id));
    where.push(`semester_id = $${params.length}`);
  }
  if (status) {
    params.push(String(status).toLowerCase());
    where.push(`LOWER(status) = $${params.length}`);
  }

  const result = await query(
    `SELECT pre_reg_id,student_id,section_id,semester_id,requested_date,status,approved_by,approved_date,notes
     FROM pre_registered_courses
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY pre_reg_id DESC`,
    params
  );

  return result.rows.map(mapPreReg);
};

const getPreRegById = async (id) => {
  const result = await query(
    `SELECT pre_reg_id,student_id,section_id,semester_id,requested_date,status,approved_by,approved_date,notes
     FROM pre_registered_courses
     WHERE pre_reg_id = $1`,
    [Number(id)]
  );
  return result.rowCount ? mapPreReg(result.rows[0]) : null;
};

const createPreReg = async (payload) => {
  const result = await query(
    `INSERT INTO pre_registered_courses(student_id,section_id,semester_id,status,approved_by,approved_date,notes)
     VALUES($1,$2,$3,$4,$5,$6,$7)
     RETURNING pre_reg_id,student_id,section_id,semester_id,requested_date,status,approved_by,approved_date,notes`,
    [
      Number(payload.student_id),
      Number(payload.section_id),
      Number(payload.semester_id),
      payload.status || 'pending',
      payload.approved_by ? Number(payload.approved_by) : null,
      payload.approved_date || null,
      payload.notes || null,
    ]
  );
  return mapPreReg(result.rows[0]);
};

const updatePreReg = async (id, payload) => {
  const result = await query(
    `UPDATE pre_registered_courses
     SET student_id=$1,section_id=$2,semester_id=$3,status=$4,approved_by=$5,approved_date=$6,notes=$7
     WHERE pre_reg_id=$8
     RETURNING pre_reg_id,student_id,section_id,semester_id,requested_date,status,approved_by,approved_date,notes`,
    [
      Number(payload.student_id),
      Number(payload.section_id),
      Number(payload.semester_id),
      payload.status || 'pending',
      payload.approved_by ? Number(payload.approved_by) : null,
      payload.approved_date || null,
      payload.notes || null,
      Number(id),
    ]
  );
  return result.rowCount ? mapPreReg(result.rows[0]) : null;
};

const deletePreReg = async (id) => {
  const result = await query('DELETE FROM pre_registered_courses WHERE pre_reg_id=$1 RETURNING pre_reg_id', [Number(id)]);
  return result.rowCount > 0;
};

module.exports = { listPreRegs, getPreRegById, createPreReg, updatePreReg, deletePreReg };
