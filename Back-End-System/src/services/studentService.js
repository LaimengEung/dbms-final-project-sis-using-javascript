const bcrypt = require('bcrypt');
const { pool, query } = require('../db');
const { toDbClassification, toApiClassification, normalizeStanding } = require('../utils/mappers');
const authSecurityService = require('./authSecurityService');

const mapStudentRow = (r) => ({
  student_id: Number(r.student_id),
  user_id: Number(r.user_id),
  student_number: r.student_number,
  first_name: r.first_name,
  last_name: r.last_name,
  email: r.email,
  classification: toApiClassification(r.classification),
  major_name: r.major_name || 'Undeclared',
  gpa: Number(r.gpa || 0),
  academic_standing: String(r.academic_standing || 'good').replace(/^./, (c) => c.toUpperCase()),
  credits_earned: Number(r.credits_earned || 0),
  admission_date: r.admission_date,
  created_at: r.created_at,
  updated_at: r.updated_at,
  user: { first_name: r.first_name, last_name: r.last_name, email: r.email },
  major: { major_name: r.major_name || 'Undeclared' },
});

const listStudents = async ({ search, limit, student_id }) => {
  const params = [];
  const where = [];
  if (student_id) {
    params.push(Number(student_id));
    where.push(`s.student_id = $${params.length}`);
  }

  if (search) {
    params.push(`%${String(search).toLowerCase()}%`);
    const i = params.length;
    where.push(`(LOWER(u.first_name || ' ' || u.last_name) LIKE $${i} OR LOWER(u.email) LIKE $${i} OR LOWER(s.student_number) LIKE $${i} OR LOWER(COALESCE(m.major_name,'')) LIKE $${i})`);
  }

  let limitSql = '';
  if (limit) {
    params.push(Number(limit));
    limitSql = `LIMIT $${params.length}`;
  }

  const result = await query(
    `SELECT s.student_id,s.user_id,s.student_number,s.classification,s.admission_date,s.credits_earned,s.gpa,s.academic_standing,
            u.first_name,u.last_name,u.email,u.created_at,u.updated_at,m.major_name
     FROM students s
     JOIN users u ON u.user_id=s.user_id
     LEFT JOIN majors m ON m.major_id=s.major_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY s.student_id DESC
     ${limitSql}`,
    params
  );

  return result.rows.map(mapStudentRow);
};

const getStudentById = async (studentId) => {
  const result = await query(
    `SELECT s.student_id,s.user_id,s.student_number,s.classification,s.admission_date,s.credits_earned,s.gpa,s.academic_standing,
            u.first_name,u.last_name,u.email,u.created_at,u.updated_at,m.major_name
     FROM students s
     JOIN users u ON u.user_id=s.user_id
     LEFT JOIN majors m ON m.major_id=s.major_id
     WHERE s.student_id=$1`,
    [Number(studentId)]
  );

  if (!result.rowCount) return null;

  const row = mapStudentRow(result.rows[0]);
  return { ...row, classification_label: result.rows[0].classification };
};

const findMajorIdByPayload = async (client, payload) => {
  if (payload.major_id) return Number(payload.major_id);
  if (!payload.major_name) return null;

  const result = await client.query('SELECT major_id FROM majors WHERE LOWER(major_name)=LOWER($1) LIMIT 1', [
    String(payload.major_name).trim(),
  ]);

  return result.rowCount ? Number(result.rows[0].major_id) : null;
};

const createStudent = async (payload) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const normalizedEmail = String(payload.email || '').trim().toLowerCase();
    const existingUser = await client.query('SELECT user_id FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1', [normalizedEmail]);
    if (existingUser.rowCount) {
      const conflict = new Error('Email already exists');
      conflict.statusCode = 409;
      throw conflict;
    }

    const passwordHash = await bcrypt.hash(String(payload.password), 10);
    const userInsert = await client.query(
      `INSERT INTO users(email,password_hash,role,first_name,last_name,is_active)
       VALUES($1,$2,'student',$3,$4,true)
       RETURNING user_id, first_name, last_name, email`,
      [normalizedEmail, passwordHash, String(payload.first_name).trim(), String(payload.last_name).trim()]
    );

    const majorId = await findMajorIdByPayload(client, payload);
    const studentNumber = payload.student_number || `STU${String(userInsert.rows[0].user_id).padStart(6, '0')}`;

    const studentInsert = await client.query(
      `INSERT INTO students(user_id,student_number,classification,major_id,admission_date,credits_earned,gpa,academic_standing,advisor_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING student_id, student_number, classification, admission_date, credits_earned, gpa, academic_standing`,
      [
        Number(userInsert.rows[0].user_id),
        studentNumber,
        toDbClassification(payload.classification || 1),
        majorId,
        payload.admission_date || null,
        Number(payload.credits_earned || 0),
        Number(payload.gpa || 0),
        normalizeStanding(payload.academic_standing),
        payload.advisor_id ? Number(payload.advisor_id) : null,
      ]
    );

    await client.query('COMMIT');
    await authSecurityService.setMustChangePassword(userInsert.rows[0].user_id, true);

    const student = {
      student_id: Number(studentInsert.rows[0].student_id),
      user_id: Number(userInsert.rows[0].user_id),
      student_number: studentInsert.rows[0].student_number,
      first_name: userInsert.rows[0].first_name,
      last_name: userInsert.rows[0].last_name,
      email: userInsert.rows[0].email,
      classification: toApiClassification(studentInsert.rows[0].classification),
      major_name: payload.major_name || 'Undeclared',
      gpa: Number(studentInsert.rows[0].gpa || 0),
      academic_standing: String(studentInsert.rows[0].academic_standing || 'good').replace(/^./, (c) => c.toUpperCase()),
      credits_earned: Number(studentInsert.rows[0].credits_earned || 0),
      admission_date: studentInsert.rows[0].admission_date,
    };

    return student;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deleteStudent = async (studentId) => {
  const id = Number(studentId);
  if (!id) return false;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT student_id,user_id FROM students WHERE student_id=$1 FOR UPDATE', [id]);
    if (!existing.rowCount) {
      await client.query('ROLLBACK');
      return false;
    }

    const userId = Number(existing.rows[0].user_id);

    await client.query('DELETE FROM grades WHERE enrollment_id IN (SELECT enrollment_id FROM enrollments WHERE student_id=$1)', [id]);
    await client.query('DELETE FROM finance_records WHERE student_id=$1', [id]);
    await client.query('DELETE FROM pre_registered_courses WHERE student_id=$1', [id]);
    await client.query('DELETE FROM enrollments WHERE student_id=$1', [id]);
    await client.query('DELETE FROM students WHERE student_id=$1', [id]);

    // Remove the linked user account when it is still a standalone student user.
    await client.query(
      `DELETE FROM users
       WHERE user_id=$1
         AND LOWER(role)='student'
         AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=$1)
         AND NOT EXISTS (SELECT 1 FROM faculty WHERE user_id=$1)`,
      [userId]
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    if (error?.code === '23503') {
      const conflict = new Error('Cannot delete student because it is linked to other records');
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  } finally {
    client.release();
  }
};

const updateStudent = async (studentId, payload) => {
  const existing = await query(
    `SELECT s.student_id,s.user_id,s.student_number,s.classification,s.major_id,s.admission_date,s.credits_earned,s.gpa,s.academic_standing,s.advisor_id,
            u.first_name,u.last_name,u.email
     FROM students s JOIN users u ON u.user_id=s.user_id WHERE s.student_id=$1`,
    [Number(studentId)]
  );
  if (!existing.rowCount) return null;

  const base = existing.rows[0];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE users SET first_name=$1,last_name=$2,email=$3,updated_at=NOW() WHERE user_id=$4`,
      [
        payload.first_name ?? base.first_name,
        payload.last_name ?? base.last_name,
        payload.email ? String(payload.email).trim().toLowerCase() : base.email,
        Number(base.user_id),
      ]
    );

    let majorId = base.major_id;
    if (payload.major_id) {
      majorId = Number(payload.major_id);
    } else if (payload.major_name) {
      const major = await client.query('SELECT major_id FROM majors WHERE LOWER(major_name)=LOWER($1) LIMIT 1', [
        String(payload.major_name).trim(),
      ]);
      majorId = major.rowCount ? Number(major.rows[0].major_id) : null;
    }

    const updated = await client.query(
      `UPDATE students
       SET student_number=$1,classification=$2,major_id=$3,admission_date=$4,credits_earned=$5,gpa=$6,academic_standing=$7,advisor_id=$8
       WHERE student_id=$9
       RETURNING student_id,user_id,student_number,classification,admission_date,credits_earned,gpa,academic_standing`,
      [
        payload.student_number ?? base.student_number,
        toDbClassification(payload.classification ?? base.classification),
        majorId,
        payload.admission_date ?? base.admission_date,
        Number(payload.credits_earned ?? base.credits_earned ?? 0),
        Number(payload.gpa ?? base.gpa ?? 0),
        normalizeStanding(payload.academic_standing ?? base.academic_standing),
        payload.advisor_id ? Number(payload.advisor_id) : base.advisor_id,
        Number(studentId),
      ]
    );

    await client.query('COMMIT');

    return {
      student_id: Number(updated.rows[0].student_id),
      user_id: Number(updated.rows[0].user_id),
      student_number: updated.rows[0].student_number,
      first_name: payload.first_name ?? base.first_name,
      last_name: payload.last_name ?? base.last_name,
      email: payload.email ? String(payload.email).trim().toLowerCase() : base.email,
      classification: toApiClassification(updated.rows[0].classification),
      major_name: payload.major_name || 'Undeclared',
      gpa: Number(updated.rows[0].gpa || 0),
      academic_standing: String(updated.rows[0].academic_standing || 'good').replace(/^./, (c) => c.toUpperCase()),
      credits_earned: Number(updated.rows[0].credits_earned || 0),
      admission_date: updated.rows[0].admission_date,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getStudentEnrollments = async (studentId) => {
  const result = await query(
    `SELECT e.enrollment_id, e.status, c.course_name, c.credits, sem.semester_name, sem.semester_year, g.letter_grade
     FROM enrollments e
     JOIN class_sections cs ON cs.section_id = e.section_id
     LEFT JOIN courses c ON c.course_id = cs.course_id
     LEFT JOIN semesters sem ON sem.semester_id = cs.semester_id
     LEFT JOIN grades g ON g.enrollment_id = e.enrollment_id
     WHERE e.student_id = $1
     ORDER BY e.enrollment_date DESC`,
    [Number(studentId)]
  );

  return result.rows.map((r) => ({
    id: Number(r.enrollment_id),
    course_name: r.course_name,
    credits: Number(r.credits || 0),
    grade: r.letter_grade,
    semester: `${r.semester_name || ''} ${r.semester_year || ''}`.trim(),
    status: r.status,
  }));
};

module.exports = {
  listStudents,
  getStudentById,
  createStudent,
  deleteStudent,
  updateStudent,
  getStudentEnrollments,
};
