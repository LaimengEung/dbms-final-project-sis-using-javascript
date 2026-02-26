const jwt = require('jsonwebtoken');
const { query } = require('../db');

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
};

const authenticate = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({ message: 'Missing or invalid authorization token' });
  }

  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';

  try {
    const payload = jwt.verify(token, secret);
    const profile = await query(
      `SELECT u.user_id, s.student_id, f.faculty_id
       FROM users u
       LEFT JOIN students s ON s.user_id = u.user_id
       LEFT JOIN faculty f ON f.user_id = u.user_id
       WHERE u.user_id = $1
       LIMIT 1`,
      [Number(payload.user_id)]
    );

    const row = profile.rows[0] || {};
    req.user = {
      user_id: Number(payload.user_id),
      email: payload.email,
      role: payload.role,
      student_id: row.student_id == null ? null : Number(row.student_id),
      faculty_id: row.faculty_id == null ? null : Number(row.faculty_id),
    };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const normalizeRole = (role) => {
  const value = String(role || '').toLowerCase();
  if (value === 'faculty') return 'teacher';
  return value;
};

const authorizeRoles = (...allowedRoles) => {
  const allowed = new Set(allowedRoles.map(normalizeRole));

  return (req, res, next) => {
    const role = normalizeRole(req?.user?.role);
    if (!role || !allowed.has(role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role privileges' });
    }
    return next();
  };
};

module.exports = { authenticate, authorizeRoles, normalizeRole };
