const { query } = require('../db');

const SECTION_SQL = `
SELECT cs.section_id,cs.csn AS section_csn,cs.section_number,cs.course_id,cs.semester_id,cs.faculty_id,cs.schedule,cs.max_capacity,cs.status AS section_status,
       c.course_code,c.course_name,c.credits AS course_credits,sem.semester_name,sem.semester_year,
       uf.first_name AS faculty_first_name,uf.last_name AS faculty_last_name,
       COALESCE(ec.enrolled_count,0) AS enrolled_count
FROM class_sections cs
LEFT JOIN courses c ON c.course_id=cs.course_id
LEFT JOIN semesters sem ON sem.semester_id=cs.semester_id
LEFT JOIN faculty f ON f.faculty_id=cs.faculty_id
LEFT JOIN users uf ON uf.user_id=f.user_id
LEFT JOIN (SELECT section_id, COUNT(*) FILTER (WHERE status='enrolled') AS enrolled_count FROM enrollments GROUP BY section_id) ec ON ec.section_id=cs.section_id`;

const mapSection = (r) => ({
  section_id: Number(r.section_id),
  section_number: r.section_number,
  section_csn: r.section_csn,
  course_id: r.course_id == null ? null : Number(r.course_id),
  faculty_id: r.faculty_id == null ? null : Number(r.faculty_id),
  semester_id: r.semester_id == null ? null : Number(r.semester_id),
  max_capacity: Number(r.max_capacity || 0),
  enrolled_count: Number(r.enrolled_count || 0),
  schedule: r.schedule,
  status: r.section_status,
  course: r.course_id ? { course_id: Number(r.course_id), course_code: r.course_code, course_name: r.course_name, credits: Number(r.course_credits || 0) } : null,
  faculty: r.faculty_id ? { faculty_id: Number(r.faculty_id), user: { first_name: r.faculty_first_name, last_name: r.faculty_last_name } } : null,
  semester: r.semester_id ? { semester_id: Number(r.semester_id), semester_name: r.semester_name, semester_year: Number(r.semester_year) } : null,
});

const listSections = async ({ semester_id, status, limit, course_id }) => {
  const params = [];
  const where = [];
  if (semester_id) { params.push(Number(semester_id)); where.push(`cs.semester_id=$${params.length}`); }
  if (status) { params.push(String(status).toLowerCase()); where.push(`LOWER(cs.status)=$${params.length}`); }
  if (course_id) { params.push(Number(course_id)); where.push(`cs.course_id=$${params.length}`); }
  let limitSql = '';
  if (limit) { params.push(Number(limit)); limitSql = ` LIMIT $${params.length}`; }
  const result = await query(`${SECTION_SQL} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY cs.section_id DESC${limitSql}`, params);
  return result.rows.map(mapSection);
};

const getSectionById = async (sectionId) => {
  const result = await query(`${SECTION_SQL} WHERE cs.section_id=$1`, [Number(sectionId)]);
  return result.rowCount ? mapSection(result.rows[0]) : null;
};

const getSectionCapacity = async (sectionId) => {
  const result = await query(
    `SELECT cs.section_id, cs.max_capacity, COALESCE(ec.enrolled_count,0) AS enrolled_count
     FROM class_sections cs
     LEFT JOIN (SELECT section_id, COUNT(*) FILTER (WHERE status='enrolled') AS enrolled_count FROM enrollments GROUP BY section_id) ec ON ec.section_id=cs.section_id
     WHERE cs.section_id=$1`,
    [Number(sectionId)]
  );
  if (!result.rowCount) return null;
  const r = result.rows[0];
  return {
    section_id: Number(r.section_id),
    enrolled_count: Number(r.enrolled_count || 0),
    max_capacity: Number(r.max_capacity || 0),
    has_capacity: Number(r.enrolled_count || 0) < Number(r.max_capacity || 0),
  };
};

const createSectionForCourse = async (courseId, payload) => {
  const cid = Number(courseId);
  const check = await query('SELECT course_id FROM courses WHERE course_id=$1', [cid]);
  if (!check.rowCount) return null;

  const semesterId = Number(payload.semester_id || 1);
  let sectionNumber = payload.section_number;
  if (!sectionNumber) {
    const next = await query(
      `SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(section_number, '\\D', '', 'g'), '')::int), 0) + 1 AS next_num
       FROM class_sections WHERE course_id=$1 AND semester_id=$2`,
      [cid, semesterId]
    );
    sectionNumber = String(next.rows[0].next_num).padStart(3, '0');
  }

  const csn = payload.section_csn || payload.csn || `CSN${Date.now()}`;
  const inserted = await query(
    `INSERT INTO class_sections(csn,course_id,semester_id,section_number,faculty_id,classroom,schedule,start_date,end_date,max_capacity,status)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING section_id`,
    [
      String(csn),
      cid,
      semesterId,
      String(sectionNumber),
      payload.faculty_id ? Number(payload.faculty_id) : null,
      payload.classroom || null,
      payload.schedule || null,
      payload.start_date || null,
      payload.end_date || null,
      Number(payload.max_capacity || 30),
      payload.status || 'open',
    ]
  );

  return getSectionById(inserted.rows[0].section_id);
};

module.exports = { listSections, getSectionById, getSectionCapacity, createSectionForCourse };
