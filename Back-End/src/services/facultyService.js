const bcrypt = require('bcrypt');
const { pool, query } = require('../db');
const authSecurityService = require('./authSecurityService');

const mapFaculty = (r) => ({
  faculty_id: Number(r.faculty_id),
  user_id: Number(r.user_id),
  faculty_number: r.faculty_number,
  first_name: r.first_name,
  last_name: r.last_name,
  email: r.email,
  title: r.title,
  department_id: r.department_id == null ? null : Number(r.department_id),
  department_name: r.department_name || '',
  office_location: r.office_location,
  is_active: r.is_active,
});

const baseSql = `
SELECT f.faculty_id,f.user_id,f.faculty_number,f.department_id,f.title,f.office_location,
       u.first_name,u.last_name,u.email,u.is_active,d.department_name
FROM faculty f
JOIN users u ON u.user_id=f.user_id
LEFT JOIN departments d ON d.department_id=f.department_id
`;

const listFaculty = async () => {
  const result = await query(`${baseSql} ORDER BY f.faculty_id DESC`);
  return result.rows.map(mapFaculty);
};

const getFacultyById = async (facultyId) => {
  const result = await query(`${baseSql} WHERE f.faculty_id=$1`, [Number(facultyId)]);
  return result.rowCount ? mapFaculty(result.rows[0]) : null;
};

const createFaculty = async (payload) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(String(payload.password), 10);
    const user = await client.query(
      `INSERT INTO users(email,password_hash,role,first_name,last_name,is_active)
       VALUES($1,$2,'faculty',$3,$4,$5)
       RETURNING user_id,first_name,last_name,email,is_active`,
      [
        String(payload.email).trim().toLowerCase(),
        passwordHash,
        String(payload.first_name).trim(),
        String(payload.last_name).trim(),
        payload.is_active !== false,
      ]
    );

    const faculty = await client.query(
      `INSERT INTO faculty(user_id,faculty_number,department_id,title,office_location)
       VALUES($1,$2,$3,$4,$5)
       RETURNING faculty_id,user_id,faculty_number,department_id,title,office_location`,
      [
        Number(user.rows[0].user_id),
        payload.faculty_number || `FAC${String(user.rows[0].user_id).padStart(6, '0')}`,
        Number(payload.department_id),
        String(payload.title).trim(),
        payload.office_location || null,
      ]
    );

    await client.query('COMMIT');
    await authSecurityService.setMustChangePassword(user.rows[0].user_id, true);

    const dept = await query('SELECT department_name FROM departments WHERE department_id=$1', [Number(faculty.rows[0].department_id)]);

    return {
      faculty_id: Number(faculty.rows[0].faculty_id),
      user_id: Number(faculty.rows[0].user_id),
      faculty_number: faculty.rows[0].faculty_number,
      first_name: user.rows[0].first_name,
      last_name: user.rows[0].last_name,
      email: user.rows[0].email,
      title: faculty.rows[0].title,
      department_id: Number(faculty.rows[0].department_id),
      department_name: dept.rows[0]?.department_name || '',
      office_location: faculty.rows[0].office_location,
      is_active: user.rows[0].is_active,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateFaculty = async (facultyId, payload) => {
  const existing = await query(
    `SELECT f.faculty_id,f.user_id,f.faculty_number,f.department_id,f.title,f.office_location,
            u.first_name,u.last_name,u.email,u.is_active
     FROM faculty f JOIN users u ON u.user_id=f.user_id WHERE f.faculty_id=$1`,
    [Number(facultyId)]
  );
  if (!existing.rowCount) return null;
  const base = existing.rows[0];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE users SET first_name=$1,last_name=$2,email=$3,is_active=$4,updated_at=NOW() WHERE user_id=$5`,
      [
        payload.first_name ?? base.first_name,
        payload.last_name ?? base.last_name,
        payload.email ? String(payload.email).trim().toLowerCase() : base.email,
        payload.is_active ?? base.is_active,
        Number(base.user_id),
      ]
    );

    const fac = await client.query(
      `UPDATE faculty SET faculty_number=$1,department_id=$2,title=$3,office_location=$4
       WHERE faculty_id=$5
       RETURNING faculty_id,user_id,faculty_number,department_id,title,office_location`,
      [
        payload.faculty_number ?? base.faculty_number,
        payload.department_id ? Number(payload.department_id) : base.department_id,
        payload.title ?? base.title,
        payload.office_location ?? base.office_location,
        Number(facultyId),
      ]
    );

    await client.query('COMMIT');

    const dept = await query('SELECT department_name FROM departments WHERE department_id=$1', [Number(fac.rows[0].department_id)]);

    return {
      faculty_id: Number(fac.rows[0].faculty_id),
      user_id: Number(fac.rows[0].user_id),
      faculty_number: fac.rows[0].faculty_number,
      first_name: payload.first_name ?? base.first_name,
      last_name: payload.last_name ?? base.last_name,
      email: payload.email ? String(payload.email).trim().toLowerCase() : base.email,
      title: fac.rows[0].title,
      department_id: Number(fac.rows[0].department_id),
      department_name: dept.rows[0]?.department_name || '',
      office_location: fac.rows[0].office_location,
      is_active: payload.is_active ?? base.is_active,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deleteFaculty = async (facultyId) => {
  const id = Number(facultyId);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const target = await client.query('SELECT user_id FROM faculty WHERE faculty_id=$1 FOR UPDATE', [id]);
    if (!target.rowCount) {
      await client.query('ROLLBACK');
      return false;
    }
    const userId = Number(target.rows[0].user_id);

    await client.query('UPDATE students SET advisor_id=NULL WHERE advisor_id=$1', [id]);
    await client.query('UPDATE class_sections SET faculty_id=NULL WHERE faculty_id=$1', [id]);
    const result = await client.query('DELETE FROM faculty WHERE faculty_id=$1 RETURNING faculty_id', [id]);
    await client.query(
      `DELETE FROM users
       WHERE user_id=$1
         AND LOWER(role)='faculty'
         AND NOT EXISTS (SELECT 1 FROM faculty WHERE user_id=$1)
         AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=$1)`,
      [userId]
    );
    await client.query('COMMIT');
    return result.rowCount > 0;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  listFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
