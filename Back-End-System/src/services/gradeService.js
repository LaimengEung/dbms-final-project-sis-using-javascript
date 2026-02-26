const { query } = require('../db');

const LETTER_POINTS = {
  a: 4.0,
  'a-': 3.7,
  'b+': 3.3,
  b: 3.0,
  'b-': 2.7,
  'c+': 2.3,
  c: 2.0,
  'c-': 1.7,
  'd+': 1.3,
  d: 1.0,
  f: 0.0,
};

const mapGrade = (r) => ({
  grade_id: Number(r.grade_id),
  enrollment_id: Number(r.enrollment_id),
  letter_grade: r.letter_grade,
  numeric_grade: r.numeric_grade == null ? null : Number(r.numeric_grade),
  grade_points: r.grade_points == null ? null : Number(r.grade_points),
  semester_id: r.semester_id == null ? null : Number(r.semester_id),
  posted_date: r.posted_date,
  posted_by: r.posted_by == null ? null : Number(r.posted_by),
});

const listGrades = async ({ student_id, enrollment_id, semester_id, faculty_id } = {}) => {
  const params = [];
  const where = [];
  if (student_id) {
    params.push(Number(student_id));
    where.push(`e.student_id = $${params.length}`);
  }
  if (enrollment_id) {
    params.push(Number(enrollment_id));
    where.push(`g.enrollment_id = $${params.length}`);
  }
  if (semester_id) {
    params.push(Number(semester_id));
    where.push(`g.semester_id = $${params.length}`);
  }
  if (faculty_id) {
    params.push(Number(faculty_id));
    where.push(`cs.faculty_id = $${params.length}`);
  }

  const result = await query(
    `SELECT g.grade_id,g.enrollment_id,g.letter_grade,g.numeric_grade,g.grade_points,g.semester_id,g.posted_date,g.posted_by
     FROM grades g
     JOIN enrollments e ON e.enrollment_id = g.enrollment_id
     JOIN class_sections cs ON cs.section_id = e.section_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY g.grade_id DESC`,
    params
  );

  return result.rows.map(mapGrade);
};

const getGradeById = async (gradeId) => {
  const result = await query(
    `SELECT g.grade_id,g.enrollment_id,g.letter_grade,g.numeric_grade,g.grade_points,g.semester_id,g.posted_date,g.posted_by,
            e.student_id,cs.faculty_id
     FROM grades g
     JOIN enrollments e ON e.enrollment_id = g.enrollment_id
     JOIN class_sections cs ON cs.section_id = e.section_id
     WHERE g.grade_id=$1`,
    [Number(gradeId)]
  );
  if (!result.rowCount) return null;
  const row = result.rows[0];
  return {
    ...mapGrade(row),
    student_id: Number(row.student_id),
    faculty_id: row.faculty_id == null ? null : Number(row.faculty_id),
  };
};

const getEnrollmentContext = async (enrollmentId) => {
  const result = await query(
    `SELECT e.enrollment_id, e.student_id, cs.faculty_id
     FROM enrollments e
     JOIN class_sections cs ON cs.section_id = e.section_id
     WHERE e.enrollment_id = $1
     LIMIT 1`,
    [Number(enrollmentId)]
  );
  if (!result.rowCount) return null;
  return {
    enrollment_id: Number(result.rows[0].enrollment_id),
    student_id: Number(result.rows[0].student_id),
    faculty_id: result.rows[0].faculty_id == null ? null : Number(result.rows[0].faculty_id),
  };
};

const resolvePoints = (gradePoints, letterGrade) => {
  if (gradePoints != null && !Number.isNaN(Number(gradePoints))) return Number(gradePoints);
  const key = String(letterGrade || '').trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(LETTER_POINTS, key) ? LETTER_POINTS[key] : null;
};

const recalculateStudentGpa = async (studentId) => {
  const rows = await query(
    `SELECT g.grade_points,g.letter_grade,c.credits
     FROM grades g
     JOIN enrollments e ON e.enrollment_id = g.enrollment_id
     JOIN class_sections cs ON cs.section_id = e.section_id
     JOIN courses c ON c.course_id = cs.course_id
     WHERE e.student_id = $1`,
    [Number(studentId)]
  );

  let totalPoints = 0;
  let totalCredits = 0;

  for (const row of rows.rows) {
    const credits = Number(row.credits || 0);
    const points = resolvePoints(row.grade_points, row.letter_grade);
    if (credits <= 0 || points == null) continue;
    totalPoints += points * credits;
    totalCredits += credits;
  }

  const gpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
  await query('UPDATE students SET gpa=$1 WHERE student_id=$2', [gpa, Number(studentId)]);
  return gpa;
};

const createGrade = async (payload) => {
  const result = await query(
    `INSERT INTO grades(enrollment_id,letter_grade,numeric_grade,grade_points,semester_id,posted_date,posted_by)
     VALUES($1,$2,$3,$4,$5,$6,$7)
     RETURNING grade_id,enrollment_id,letter_grade,numeric_grade,grade_points,semester_id,posted_date,posted_by`,
    [
      Number(payload.enrollment_id),
      payload.letter_grade || null,
      payload.numeric_grade == null ? null : Number(payload.numeric_grade),
      payload.grade_points == null ? null : Number(payload.grade_points),
      payload.semester_id ? Number(payload.semester_id) : null,
      payload.posted_date || null,
      payload.posted_by ? Number(payload.posted_by) : null,
    ]
  );
  const context = await getEnrollmentContext(payload.enrollment_id);
  if (context?.student_id) await recalculateStudentGpa(context.student_id);
  return mapGrade(result.rows[0]);
};

const updateGrade = async (gradeId, payload) => {
  const existing = await getGradeById(gradeId);
  if (!existing) return null;

  const result = await query(
    `UPDATE grades
     SET enrollment_id=$1,letter_grade=$2,numeric_grade=$3,grade_points=$4,semester_id=$5,posted_date=$6,posted_by=$7
     WHERE grade_id=$8
     RETURNING grade_id,enrollment_id,letter_grade,numeric_grade,grade_points,semester_id,posted_date,posted_by`,
    [
      Number(payload.enrollment_id),
      payload.letter_grade || null,
      payload.numeric_grade == null ? null : Number(payload.numeric_grade),
      payload.grade_points == null ? null : Number(payload.grade_points),
      payload.semester_id ? Number(payload.semester_id) : null,
      payload.posted_date || null,
      payload.posted_by ? Number(payload.posted_by) : null,
      Number(gradeId),
    ]
  );
  if (!result.rowCount) return null;

  const newContext = await getEnrollmentContext(payload.enrollment_id);
  if (existing.student_id) await recalculateStudentGpa(existing.student_id);
  if (newContext?.student_id && Number(newContext.student_id) !== Number(existing.student_id)) {
    await recalculateStudentGpa(newContext.student_id);
  }

  return mapGrade(result.rows[0]);
};

const deleteGrade = async (gradeId) => {
  const existing = await getGradeById(gradeId);
  const result = await query('DELETE FROM grades WHERE grade_id=$1 RETURNING grade_id', [Number(gradeId)]);
  if (result.rowCount && existing?.student_id) {
    await recalculateStudentGpa(existing.student_id);
  }
  return result.rowCount > 0;
};

module.exports = { listGrades, getGradeById, getEnrollmentContext, createGrade, updateGrade, deleteGrade };
