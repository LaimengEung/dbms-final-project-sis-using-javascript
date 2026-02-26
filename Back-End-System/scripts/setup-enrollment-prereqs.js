require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
});

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO departments (department_code, department_name, description)
       VALUES ('CS','Computer Science','Computer Science Department')
       ON CONFLICT (department_code) DO UPDATE SET department_name=EXCLUDED.department_name`
    );
    const dept = (await client.query(`SELECT department_id FROM departments WHERE department_code='CS' LIMIT 1`)).rows[0].department_id;

    await client.query(
      `INSERT INTO majors (major_code, major_name, department_id, required_credits, description)
       VALUES ('CS','Computer Science',$1,120,'BS in Computer Science')
       ON CONFLICT (major_code) DO UPDATE SET major_name=EXCLUDED.major_name`,
      [dept]
    );
    const major = (await client.query(`SELECT major_id FROM majors WHERE major_code='CS' LIMIT 1`)).rows[0].major_id;

    await client.query(
      `INSERT INTO users (email,password_hash,role,first_name,last_name,is_active)
       VALUES ('faculty.real@school.edu','manual_hash','faculty','Alex','Morgan',true)
       ON CONFLICT (email) DO UPDATE SET first_name=EXCLUDED.first_name`
    );
    const facultyUser = (await client.query(`SELECT user_id FROM users WHERE email='faculty.real@school.edu' LIMIT 1`)).rows[0].user_id;

    await client.query(
      `INSERT INTO faculty (user_id,faculty_number,department_id,title,office_location)
       VALUES ($1,'FAC100',$2,'Lecturer','Building A-210')
       ON CONFLICT (faculty_number) DO UPDATE SET department_id=EXCLUDED.department_id`,
      [facultyUser, dept]
    );
    const faculty = (await client.query(`SELECT faculty_id FROM faculty WHERE faculty_number='FAC100' LIMIT 1`)).rows[0].faculty_id;

    await client.query(
      `INSERT INTO users (email,password_hash,role,first_name,last_name,is_active)
       VALUES ('student.real@school.edu','manual_hash','student','Mia','Carter',true)
       ON CONFLICT (email) DO UPDATE SET first_name=EXCLUDED.first_name`
    );
    const studentUser = (await client.query(`SELECT user_id FROM users WHERE email='student.real@school.edu' LIMIT 1`)).rows[0].user_id;

    await client.query(
      `INSERT INTO students (user_id,student_number,classification,major_id,admission_date,credits_earned,gpa,academic_standing,advisor_id)
       VALUES ($1,'STU100','freshman',$2,CURRENT_DATE,0,0.00,'good',$3)
       ON CONFLICT (student_number) DO UPDATE SET major_id=EXCLUDED.major_id`,
      [studentUser, major, faculty]
    );

    await client.query(
      `INSERT INTO semesters (semester_name,semester_year,start_date,end_date,registration_start,registration_end,is_current)
       VALUES ('Fall',2026,'2026-08-20','2026-12-20','2026-06-15','2026-08-10',true)
       ON CONFLICT DO NOTHING`
    );
    const semester = (await client.query(`SELECT semester_id FROM semesters WHERE semester_name='Fall' AND semester_year=2026 ORDER BY semester_id DESC LIMIT 1`)).rows[0].semester_id;

    await client.query(
      `INSERT INTO courses (course_code,course_name,description,credits,department_id)
       VALUES ('CS101','Introduction to Computing','Foundations of computing',3,$1)
       ON CONFLICT (course_code) DO UPDATE SET course_name=EXCLUDED.course_name`,
      [dept]
    );
    const course = (await client.query(`SELECT course_id FROM courses WHERE course_code='CS101' LIMIT 1`)).rows[0].course_id;

    await client.query(
      `INSERT INTO class_sections (csn,course_id,semester_id,section_number,faculty_id,classroom,schedule,start_date,end_date,max_capacity,enrolled_count,status)
       VALUES ('90001',$1,$2,'001',$3,'A-101','Mon/Wed 09:00-10:15','2026-08-25','2026-12-10',35,0,'open')
       ON CONFLICT (csn) DO UPDATE SET semester_id=EXCLUDED.semester_id,faculty_id=EXCLUDED.faculty_id,status='open'`,
      [course, semester, faculty]
    );

    await client.query('COMMIT');

    const counts = await client.query(
      `SELECT
         (SELECT COUNT(*) FROM semesters) AS semesters,
         (SELECT COUNT(*) FROM students) AS students,
         (SELECT COUNT(*) FROM class_sections) AS sections`
    );
    console.log(counts.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
