const { query } = require('../db');

const mapCourse = (r) => ({
  course_id: Number(r.course_id),
  course_code: r.course_code,
  course_name: r.course_name,
  description: r.description,
  credits: Number(r.credits || 0),
  department_id: r.department_id == null ? null : Number(r.department_id),
});

const listCourses = async () => {
  const result = await query('SELECT course_id,course_code,course_name,description,credits,department_id FROM courses ORDER BY course_id DESC');
  return result.rows.map(mapCourse);
};

const getCourseById = async (courseId) => {
  const result = await query('SELECT course_id,course_code,course_name,description,credits,department_id FROM courses WHERE course_id=$1', [Number(courseId)]);
  return result.rowCount ? mapCourse(result.rows[0]) : null;
};

const createCourse = async (payload) => {
  const result = await query(
    `INSERT INTO courses(course_code,course_name,description,credits,department_id)
     VALUES($1,$2,$3,$4,$5)
     RETURNING course_id,course_code,course_name,description,credits,department_id`,
    [
      String(payload.course_code).trim(),
      String(payload.course_name).trim(),
      payload.description || null,
      Number(payload.credits || 3),
      payload.department_id ? Number(payload.department_id) : null,
    ]
  );
  return mapCourse(result.rows[0]);
};

const updateCourse = async (courseId, payload) => {
  const result = await query(
    `UPDATE courses
     SET course_code=$1,course_name=$2,description=$3,credits=$4,department_id=$5
     WHERE course_id=$6
     RETURNING course_id,course_code,course_name,description,credits,department_id`,
    [
      String(payload.course_code || '').trim(),
      String(payload.course_name || '').trim(),
      payload.description || null,
      Number(payload.credits || 3),
      payload.department_id ? Number(payload.department_id) : null,
      Number(courseId),
    ]
  );

  return result.rowCount ? mapCourse(result.rows[0]) : null;
};

const deleteCourse = async (courseId) => {
  const result = await query('DELETE FROM courses WHERE course_id=$1 RETURNING course_id', [Number(courseId)]);
  return result.rowCount > 0;
};

module.exports = { listCourses, getCourseById, createCourse, updateCourse, deleteCourse };
