const bcrypt = require('bcrypt');
const prisma = require('../prisma');
const { pool } = require('../db');
const { toDbRole, toApiRole } = require('../utils/mappers');
const authSecurityService = require('./authSecurityService');

const toPublicUser = (row) => ({
  user_id: Number(row.userId),
  first_name: row.firstName,
  last_name: row.lastName,
  email: row.email,
  role: toApiRole(row.role),
  is_active: row.isActive,
  created_at: row.createdAt,
  updated_at: row.updatedAt,
});

const listUsers = async ({ search, page, limit }) => {
  const p = Math.max(Number(page) || 1, 1);
  const l = Math.max(Number(limit) || 10, 1);

  const where = search
    ? {
        OR: [
          { firstName: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
          { role: { contains: String(search), mode: 'insensitive' } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: { userId: 'desc' },
    skip: page || limit ? (p - 1) * l : undefined,
    take: page || limit ? l : undefined,
  });

  return users.map(toPublicUser);
};

const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({ where: { userId: Number(userId) } });
  return user ? toPublicUser(user) : null;
};

const getUserStats = async () => {
  const [totalUsers, byRole] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
  ]);

  const roles = {};
  byRole.forEach((row) => {
    roles[toApiRole(row.role)] = Number(row._count.role || 0);
  });

  return { total_users: Number(totalUsers), roles };
};

const createUser = async (payload) => {
  const hashed = await bcrypt.hash(String(payload.password), 10);
  const role = toDbRole(payload.role);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: String(payload.email).trim().toLowerCase(),
        passwordHash: hashed,
        role,
        firstName: String(payload.first_name).trim(),
        lastName: String(payload.last_name).trim(),
        isActive: true,
      },
    });

    if (role === 'student') {
      const studentNumber = `STU${String(created.userId).padStart(6, '0')}`;
      await tx.$executeRawUnsafe(
        `INSERT INTO students(user_id,student_number,classification,major_id,admission_date,credits_earned,gpa,academic_standing,advisor_id)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        Number(created.userId),
        studentNumber,
        'freshman',
        null,
        null,
        0,
        0,
        'good',
        null
      );
    }

    return created;
  });

  await authSecurityService.setMustChangePassword(user.userId, true);
  return toPublicUser(user);
};

const updateUser = async (userId, payload) => {
  const id = Number(userId);
  const existing = await prisma.user.findUnique({ where: { userId: id } });
  if (!existing) return null;

  const data = {
    email: String(payload.email).trim().toLowerCase(),
    firstName: String(payload.first_name).trim(),
    lastName: String(payload.last_name).trim(),
    role: toDbRole(payload.role),
    updatedAt: new Date(),
  };

  if (payload.password) {
    data.passwordHash = await bcrypt.hash(String(payload.password), 10);
  }

  const updated = await prisma.user.update({
    where: { userId: id },
    data,
  });

  return toPublicUser(updated);
};

const patchUser = async (userId, payload) => {
  const id = Number(userId);
  const existing = await prisma.user.findUnique({ where: { userId: id } });
  if (!existing) return null;

  const data = {
    updatedAt: new Date(),
  };

  if (payload.email) data.email = String(payload.email).trim().toLowerCase();
  if (payload.first_name !== undefined) data.firstName = String(payload.first_name);
  if (payload.last_name !== undefined) data.lastName = String(payload.last_name);
  if (payload.role) data.role = toDbRole(payload.role);
  if (payload.is_active !== undefined) data.isActive = Boolean(payload.is_active);
  if (payload.password) data.passwordHash = await bcrypt.hash(String(payload.password), 10);

  const updated = await prisma.user.update({
    where: { userId: id },
    data,
  });

  return toPublicUser(updated);
};

const deleteUser = async (userId) => {
  const id = Number(userId);
  if (!id) return false;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT user_id FROM users WHERE user_id=$1 FOR UPDATE', [id]);
    if (!existing.rowCount) {
      await client.query('ROLLBACK');
      return false;
    }

    // If this user owns student records, delete dependent academic rows first.
    const students = await client.query('SELECT student_id FROM students WHERE user_id=$1', [id]);
    for (const row of students.rows) {
      const studentId = Number(row.student_id);
      await client.query('DELETE FROM grades WHERE enrollment_id IN (SELECT enrollment_id FROM enrollments WHERE student_id=$1)', [studentId]);
      await client.query('DELETE FROM finance_records WHERE student_id=$1', [studentId]);
      await client.query('DELETE FROM pre_registered_courses WHERE student_id=$1', [studentId]);
      await client.query('DELETE FROM enrollments WHERE student_id=$1', [studentId]);
      await client.query('DELETE FROM students WHERE student_id=$1', [studentId]);
    }

    // If this user owns faculty records, detach sections before deleting faculty.
    const faculty = await client.query('SELECT faculty_id FROM faculty WHERE user_id=$1', [id]);
    for (const row of faculty.rows) {
      const facultyId = Number(row.faculty_id);
      await client.query('UPDATE students SET advisor_id=NULL WHERE advisor_id=$1', [facultyId]);
      await client.query('UPDATE class_sections SET faculty_id=NULL WHERE faculty_id=$1', [facultyId]);
      await client.query('DELETE FROM faculty WHERE faculty_id=$1', [facultyId]);
    }

    // Detach optional audit references to this user.
    await client.query('UPDATE grades SET posted_by=NULL WHERE posted_by=$1', [id]);
    await client.query('UPDATE pre_registered_courses SET approved_by=NULL WHERE approved_by=$1', [id]);

    await client.query('DELETE FROM users WHERE user_id=$1', [id]);
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    if (error?.code === '23503') {
      const conflict = new Error('Cannot delete user because it is linked to other records');
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  listUsers,
  getUserById,
  getUserStats,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
};
