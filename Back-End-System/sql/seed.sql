BEGIN;

-- Cleanup-only seed script.
-- This removes demo/sample records so the system starts empty.
-- Real data should be added through Admin UI/API imports.
TRUNCATE TABLE
  grades,
  pre_registered_courses,
  finance_records,
  enrollments,
  degree_requirements,
  class_sections,
  students,
  faculty,
  courses,
  semesters,
  majors,
  departments,
  users
RESTART IDENTITY CASCADE;

COMMIT;
