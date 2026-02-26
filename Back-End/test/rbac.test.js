const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();
const app = require('../src/app');

const BASE = 'http://127.0.0.1';
let server;
let port;
let pool;

const http = async (path, { method = 'GET', token, body } = {}) => {
  const res = await fetch(`${BASE}:${port}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

const login = async (email, password) => {
  const res = await http('/api/auth/login', { method: 'POST', body: { email, password } });
  assert.equal(res.status, 200);
  return res.data?.data?.access_token;
};

test.before(async () => {
  pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false,
  });

  await pool.query(`
    TRUNCATE TABLE grades, pre_registered_courses, finance_records, enrollments, degree_requirements,
    class_sections, students, faculty, courses, semesters, majors, departments, users
    RESTART IDENTITY CASCADE
  `);

  const studentPass = await bcrypt.hash('Student123!', 10);
  const facultyPass = await bcrypt.hash('Faculty123!', 10);
  const adminPass = await bcrypt.hash('Admin12345!', 10);

  await pool.query(`INSERT INTO departments(department_code,department_name) VALUES ('CS','Computer Science')`);
  await pool.query(`INSERT INTO majors(major_code,major_name,department_id,required_credits) VALUES ('BSCS','Computer Science',1,120)`);
  await pool.query(
    `INSERT INTO users(email,password_hash,role,first_name,last_name,is_active) VALUES
      ('admin@test.edu',$1,'admin','Admin','User',true),
      ('faculty@test.edu',$2,'faculty','Fac','One',true),
      ('student1@test.edu',$3,'student','Stu','One',true),
      ('student2@test.edu',$3,'student','Stu','Two',true)`,
    [adminPass, facultyPass, studentPass]
  );
  await pool.query(`INSERT INTO faculty(user_id,faculty_number,department_id,title) VALUES (2,'FAC001',1,'Lecturer')`);
  await pool.query(`INSERT INTO students(user_id,student_number,classification,major_id,gpa,academic_standing) VALUES
      (3,'STU001','freshman',1,0,'good'),
      (4,'STU002','freshman',1,0,'good')`);
  await pool.query(
    `INSERT INTO semesters(semester_name,semester_year,start_date,end_date,registration_start,registration_end,is_current)
     VALUES ('Spring',2026,'2026-01-01','2026-05-30','2026-01-01','2026-12-31',true)`
  );
  await pool.query(`INSERT INTO courses(course_code,course_name,credits,department_id) VALUES ('CS101','Intro',3,1)`);
  await pool.query(
    `INSERT INTO class_sections(csn,course_id,semester_id,section_number,faculty_id,max_capacity,status,schedule,start_date,end_date)
     VALUES ('10001',1,1,'001',1,40,'open','Mon 09:00','2026-01-15','2026-05-15')`
  );
  await pool.query(`INSERT INTO enrollments(student_id,section_id,status) VALUES (1,1,'enrolled')`);

  server = app.listen(0);
  port = server.address().port;
});

test.after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (pool) await pool.end();
});

test('student cannot read another student profile', async () => {
  const token = await login('student1@test.edu', 'Student123!');
  const res = await http('/api/students/2', { token });
  assert.equal(res.status, 403);
});

test('faculty cannot create enrollment', async () => {
  const token = await login('faculty@test.edu', 'Faculty123!');
  const res = await http('/api/enrollments', {
    method: 'POST',
    token,
    body: { student_id: 1, section_id: 1, status: 'enrolled' },
  });
  assert.equal(res.status, 403);
});

test('faculty can create grade for own section enrollment', async () => {
  const token = await login('faculty@test.edu', 'Faculty123!');
  const res = await http('/api/grades', {
    method: 'POST',
    token,
    body: { enrollment_id: 1, letter_grade: 'A', grade_points: 4.0, semester_id: 1 },
  });
  assert.equal(res.status, 201);
});
