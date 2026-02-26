const { pool, query } = require('../db');
const ALLOWED_STATUSES = new Set(['enrolled', 'dropped', 'withdrawn', 'completed']);
const MAX_CREDITS_PER_SEMESTER = 21;

const normalizeStatus = (value, fallback = 'enrolled') => {
  const status = String(value || fallback).toLowerCase();
  return ALLOWED_STATUSES.has(status) ? status : null;
};

const ENROLLMENT_FROM = `
FROM enrollments e
JOIN students s ON s.student_id = e.student_id
JOIN users su ON su.user_id = s.user_id
LEFT JOIN majors m ON m.major_id = s.major_id
JOIN class_sections cs ON cs.section_id = e.section_id
LEFT JOIN courses c ON c.course_id = cs.course_id
LEFT JOIN semesters sem ON sem.semester_id = cs.semester_id
LEFT JOIN faculty f ON f.faculty_id = cs.faculty_id
LEFT JOIN users fu ON fu.user_id = f.user_id
LEFT JOIN (
  SELECT section_id, COUNT(*) FILTER (WHERE status='enrolled') AS enrolled_count
  FROM enrollments
  GROUP BY section_id
) ec ON ec.section_id = cs.section_id
`;

const ENROLLMENT_SELECT = `
SELECT e.enrollment_id,e.student_id,e.section_id,e.status,e.enrollment_date,
       s.student_number,s.gpa AS student_gpa,su.first_name AS student_first_name,su.last_name AS student_last_name,su.email AS student_email,
       m.major_name,
       cs.section_number,cs.csn AS section_csn,cs.schedule,cs.max_capacity,
       c.course_id,c.course_code,c.course_name,c.credits AS course_credits,
       sem.semester_id,sem.semester_name,sem.semester_year,
       f.faculty_id,fu.first_name AS faculty_first_name,fu.last_name AS faculty_last_name,
       COALESCE(ec.enrolled_count,0) AS enrolled_count
`;

const mapEnrollment = (r) => ({
  enrollment_id: Number(r.enrollment_id),
  student_id: Number(r.student_id),
  section_id: Number(r.section_id),
  status: r.status,
  enrollment_date: r.enrollment_date,
  student: {
    student_id: Number(r.student_id),
    student_number: r.student_number,
    gpa: Number(r.student_gpa || 0),
    user: { first_name: r.student_first_name, last_name: r.student_last_name, email: r.student_email },
    major: { major_name: r.major_name || 'Undeclared' },
  },
  section: {
    section_id: Number(r.section_id),
    section_number: r.section_number,
    section_csn: r.section_csn,
    schedule: r.schedule,
    max_capacity: Number(r.max_capacity || 0),
    enrolled_count: Number(r.enrolled_count || 0),
    course: { course_id: r.course_id == null ? null : Number(r.course_id), course_code: r.course_code, course_name: r.course_name, credits: Number(r.course_credits || 0) },
    faculty: r.faculty_id ? { faculty_id: Number(r.faculty_id), user: { first_name: r.faculty_first_name, last_name: r.faculty_last_name } } : null,
    semester: r.semester_id ? { semester_id: Number(r.semester_id), semester_name: r.semester_name, semester_year: Number(r.semester_year) } : null,
  },
});

const listEnrollments = async ({ page = 1, limit = 10, status, search, semester_id, section_id, student_id, faculty_id }) => {
  const params = [];
  const where = [];

  if (status) { params.push(String(status).toLowerCase()); where.push(`LOWER(e.status)=$${params.length}`); }
  if (semester_id) { params.push(Number(semester_id)); where.push(`cs.semester_id=$${params.length}`); }
  if (section_id) { params.push(Number(section_id)); where.push(`e.section_id=$${params.length}`); }
  if (student_id) { params.push(Number(student_id)); where.push(`e.student_id=$${params.length}`); }
  if (faculty_id) { params.push(Number(faculty_id)); where.push(`cs.faculty_id=$${params.length}`); }
  if (search) { params.push(`%${String(search).toLowerCase()}%`); where.push(`(LOWER(su.first_name || ' ' || su.last_name) LIKE $${params.length} OR LOWER(s.student_number) LIKE $${params.length})`); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const totalResult = await query(`SELECT COUNT(*)::int AS total ${ENROLLMENT_FROM} ${whereSql}`, params);

  const p = Math.max(Number(page) || 1, 1);
  const l = Math.max(Number(limit) || 10, 1);
  const offset = (p - 1) * l;
  const dataParams = [...params, l, offset];

  const dataResult = await query(
    `${ENROLLMENT_SELECT} ${ENROLLMENT_FROM} ${whereSql} ORDER BY e.enrollment_date DESC, e.enrollment_id DESC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams
  );

  const total = Number(totalResult.rows[0]?.total || 0);

  return {
    data: dataResult.rows.map(mapEnrollment),
    pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
  };
};

const getEnrollmentById = async (enrollmentId) => {
  const result = await query(`${ENROLLMENT_SELECT} ${ENROLLMENT_FROM} WHERE e.enrollment_id=$1`, [Number(enrollmentId)]);
  return result.rowCount ? mapEnrollment(result.rows[0]) : null;
};

const createEnrollment = async (payload) => {
  const studentId = Number(payload.student_id);
  const sectionId = Number(payload.section_id);
  const status = normalizeStatus(payload.status);

  if (!studentId || !sectionId) {
    return { error: { status: 400, message: 'student_id and section_id are required' } };
  }
  if (!status) {
    return { error: { status: 400, message: 'Invalid enrollment status' } };
  }

  const sectionDetail = await query(
    `SELECT cs.section_id,cs.max_capacity,cs.status AS section_status,cs.schedule,cs.semester_id,cs.course_id,
            sem.is_current,sem.registration_start,sem.registration_end,
            c.course_code,COALESCE(c.credits,0) AS target_credits,
            COALESCE(ec.enrolled_count,0) AS enrolled_count
     FROM class_sections cs
     JOIN semesters sem ON sem.semester_id = cs.semester_id
     JOIN courses c ON c.course_id = cs.course_id
     LEFT JOIN (SELECT section_id, COUNT(*) FILTER (WHERE status='enrolled') AS enrolled_count FROM enrollments GROUP BY section_id) ec ON ec.section_id=cs.section_id
     WHERE cs.section_id=$1`,
    [sectionId]
  );
  if (!sectionDetail.rowCount) return { error: { status: 404, message: 'Section not found' } };
  const sectionRow = sectionDetail.rows[0];

  if (String(sectionRow.section_status || '').toLowerCase() !== 'open') {
    return { error: { status: 409, message: 'Section is not open for enrollment' } };
  }
  if (sectionRow.is_current !== true) {
    return { error: { status: 409, message: 'Only current semester sections can be enrolled' } };
  }

  const now = new Date();
  const regStart = sectionRow.registration_start ? new Date(sectionRow.registration_start) : null;
  const regEnd = sectionRow.registration_end ? new Date(sectionRow.registration_end) : null;
  if (!regStart || !regEnd || now < regStart || now > regEnd) {
    return { error: { status: 409, message: 'Registration window is closed for this semester' } };
  }

  const section = await query(
    `SELECT cs.section_id,cs.max_capacity,COALESCE(ec.enrolled_count,0) AS enrolled_count
     FROM class_sections cs
     LEFT JOIN (SELECT section_id, COUNT(*) FILTER (WHERE status='enrolled') AS enrolled_count FROM enrollments GROUP BY section_id) ec ON ec.section_id=cs.section_id
     WHERE cs.section_id=$1`,
    [sectionId]
  );

  if (!section.rowCount) return { error: { status: 404, message: 'Section not found' } };
  if (Number(section.rows[0].enrolled_count) >= Number(section.rows[0].max_capacity)) {
    return { error: { status: 409, message: 'Section is full' } };
  }

  const student = await query('SELECT student_id FROM students WHERE student_id=$1', [studentId]);
  if (!student.rowCount) return { error: { status: 404, message: 'Student not found' } };

  const financeHold = await query(
    `SELECT finance_id FROM finance_records
     WHERE student_id=$1 AND semester_id=$2 AND status='pending'
     LIMIT 1`,
    [studentId, Number(sectionRow.semester_id)]
  );
  if (financeHold.rowCount) {
    return { error: { status: 409, message: 'Student has pending finance records for this semester' } };
  }

  const duplicate = await query(
    `SELECT enrollment_id FROM enrollments WHERE student_id=$1 AND section_id=$2 AND status IN ('enrolled','completed') LIMIT 1`,
    [studentId, sectionId]
  );
  if (duplicate.rowCount) return { error: { status: 409, message: 'Student is already enrolled in this section' } };

  const duplicateCourse = await query(
    `SELECT e.enrollment_id
     FROM enrollments e
     JOIN class_sections cs ON cs.section_id=e.section_id
     WHERE e.student_id=$1
       AND cs.semester_id=$2
       AND cs.course_id=$3
       AND e.status IN ('enrolled','completed')
     LIMIT 1`,
    [studentId, Number(sectionRow.semester_id), Number(sectionRow.course_id)]
  );
  if (duplicateCourse.rowCount) {
    return { error: { status: 409, message: 'Student already has this course in the selected semester' } };
  }

  if (String(sectionRow.schedule || '').trim()) {
    const conflict = await query(
      `SELECT e.enrollment_id
       FROM enrollments e
       JOIN class_sections cs ON cs.section_id=e.section_id
       WHERE e.student_id=$1
         AND cs.semester_id=$2
         AND e.status='enrolled'
         AND LOWER(COALESCE(cs.schedule,''))=LOWER($3)
       LIMIT 1`,
      [studentId, Number(sectionRow.semester_id), String(sectionRow.schedule).trim()]
    );
    if (conflict.rowCount) {
      return { error: { status: 409, message: 'Schedule conflict with another enrolled section' } };
    }
  }

  const currentCredits = await query(
    `SELECT COALESCE(SUM(c.credits),0)::int AS total
     FROM enrollments e
     JOIN class_sections cs ON cs.section_id=e.section_id
     JOIN courses c ON c.course_id=cs.course_id
     WHERE e.student_id=$1 AND cs.semester_id=$2 AND e.status='enrolled'`,
    [studentId, Number(sectionRow.semester_id)]
  );
  const totalCredits = Number(currentCredits.rows[0]?.total || 0) + Number(sectionRow.target_credits || 0);
  if (totalCredits > MAX_CREDITS_PER_SEMESTER) {
    return { error: { status: 409, message: `Credit limit exceeded (max ${MAX_CREDITS_PER_SEMESTER})` } };
  }

  const code = String(sectionRow.course_code || '').toUpperCase();
  const match = code.match(/^([A-Z]+)(\d{3})/);
  if (match) {
    const prefix = match[1];
    const number = Number(match[2]);
    if (number >= 200) {
      const prereqCode = `${prefix}${String(number - 100).padStart(3, '0')}`;
      const prereq = await query(
        `SELECT 1
         FROM enrollments e
         JOIN class_sections cs ON cs.section_id=e.section_id
         JOIN courses c ON c.course_id=cs.course_id
         WHERE e.student_id=$1 AND e.status='completed' AND UPPER(c.course_code)=$2
         LIMIT 1`,
        [studentId, prereqCode]
      );
      if (!prereq.rowCount) {
        return { error: { status: 409, message: `Missing prerequisite course: ${prereqCode}` } };
      }
    }
  }

  const inserted = await query('INSERT INTO enrollments(student_id,section_id,status) VALUES($1,$2,$3) RETURNING enrollment_id', [studentId, sectionId, status]);
  return { data: await getEnrollmentById(inserted.rows[0].enrollment_id) };
};

const updateEnrollment = async (enrollmentId, payload) => {
  const id = Number(enrollmentId);
  const studentId = Number(payload.student_id);
  const sectionId = Number(payload.section_id);
  const status = normalizeStatus(payload.status);

  if (!id || !studentId || !sectionId) return null;
  if (!status) return null;

  const duplicate = await query(
    `SELECT enrollment_id FROM enrollments WHERE student_id=$1 AND section_id=$2 AND enrollment_id<>$3 AND status IN ('enrolled','completed') LIMIT 1`,
    [studentId, sectionId, id]
  );
  if (duplicate.rowCount) return { error: { status: 409, message: 'Student is already enrolled in this section' } };

  const result = await query(
    `UPDATE enrollments SET student_id=$1,section_id=$2,status=$3 WHERE enrollment_id=$4 RETURNING enrollment_id`,
    [studentId, sectionId, status, id]
  );
  return result.rowCount ? getEnrollmentById(id) : null;
};

const updateEnrollmentStatus = async (enrollmentId, status) => {
  const normalized = normalizeStatus(status);
  if (!normalized) return null;
  const result = await query(`UPDATE enrollments SET status=$1 WHERE enrollment_id=$2 RETURNING enrollment_id`, [normalized, Number(enrollmentId)]);
  return result.rowCount ? getEnrollmentById(enrollmentId) : null;
};

const deleteEnrollment = async (enrollmentId) => {
  const result = await query('DELETE FROM enrollments WHERE enrollment_id=$1 RETURNING enrollment_id', [Number(enrollmentId)]);
  return result.rowCount > 0;
};

const bulkCreateEnrollments = async (payload) => {
  const rows = Array.isArray(payload.enrollments) ? payload.enrollments : [];
  const semesterId = payload.semester_id ? Number(payload.semester_id) : null;
  let processed = 0;
  let skipped = 0;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const row of rows) {
      const studentId = Number(row.student_id);
      if (!studentId) { skipped += 1; continue; }

      let sectionId = row.section_id ? Number(row.section_id) : null;
      if (!sectionId && row.section_csn) {
        const sectionLookup = await client.query(
          `SELECT section_id FROM class_sections WHERE csn=$1 ${semesterId ? 'AND semester_id=$2' : ''} LIMIT 1`,
          semesterId ? [String(row.section_csn), semesterId] : [String(row.section_csn)]
        );
        sectionId = sectionLookup.rowCount ? Number(sectionLookup.rows[0].section_id) : null;
      }

      if (!sectionId) { skipped += 1; continue; }
      const status = normalizeStatus(row.status);
      if (!status) { skipped += 1; continue; }

      const existing = await client.query(
        `SELECT enrollment_id FROM enrollments WHERE student_id=$1 AND section_id=$2 AND status IN ('enrolled','completed') LIMIT 1`,
        [studentId, sectionId]
      );
      if (existing.rowCount) { skipped += 1; continue; }

      const sectionCapacity = await client.query(
        `SELECT cs.max_capacity, COALESCE(ec.enrolled_count,0) AS enrolled_count
         FROM class_sections cs
         LEFT JOIN (SELECT section_id, COUNT(*) FILTER (WHERE status='enrolled') AS enrolled_count FROM enrollments GROUP BY section_id) ec ON ec.section_id=cs.section_id
         WHERE cs.section_id=$1`,
        [sectionId]
      );
      if (!sectionCapacity.rowCount) { skipped += 1; continue; }
      if (status === 'enrolled' && Number(sectionCapacity.rows[0].enrolled_count) >= Number(sectionCapacity.rows[0].max_capacity)) {
        skipped += 1;
        continue;
      }

      try {
        await client.query('INSERT INTO enrollments(student_id,section_id,status) VALUES($1,$2,$3)', [studentId, sectionId, status]);
        processed += 1;
      } catch {
        skipped += 1;
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return { message: `${processed} enrollments processed successfully`, count: processed, skipped };
};

module.exports = {
  listEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  updateEnrollmentStatus,
  deleteEnrollment,
  bulkCreateEnrollments,
};
