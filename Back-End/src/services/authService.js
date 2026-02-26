const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { toApiRole } = require('../utils/mappers');
const authSecurityService = require('./authSecurityService');

const login = async ({ email, password }) => {
  await authSecurityService.ensureAuthSecuritySchema();

  const normalizedEmail = String(email || '').trim().toLowerCase();
  const plainPassword = String(password || '');

  if (!normalizedEmail || !plainPassword) {
    return { error: { status: 400, message: 'Email and password are required' } };
  }

  const result = await query(
    `SELECT user_id,email,password_hash,role,first_name,last_name,is_active
     FROM users
     WHERE LOWER(email)=LOWER($1)
     LIMIT 1`,
    [normalizedEmail]
  );

  if (!result.rowCount) {
    return { error: { status: 401, message: 'Invalid email or password' } };
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(plainPassword, String(user.password_hash || ''));
  if (!valid) {
    return { error: { status: 401, message: 'Invalid email or password' } };
  }

  if (user.is_active === false) {
    return { error: { status: 403, message: 'User account is inactive' } };
  }

  const security = await authSecurityService.getSecurityByUserId(user.user_id);

  return {
    data: {
      user_id: Number(user.user_id),
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: toApiRole(user.role),
      is_active: user.is_active,
      must_change_password: Boolean(security?.must_change_password),
    },
  };
};

const forgotPassword = async ({ email }) => {
  await authSecurityService.ensureAuthSecuritySchema();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) return { error: { status: 400, message: 'Email is required' } };

  const result = await query('SELECT user_id FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1', [normalizedEmail]);
  if (!result.rowCount) {
    return { data: { message: 'If the email exists, a reset token has been created.' } };
  }

  const tokenData = await authSecurityService.issuePasswordResetToken(result.rows[0].user_id);
  return {
    data: {
      message: 'Password reset token generated.',
      reset_token: tokenData.token,
      expires_at: tokenData.expires_at,
    },
  };
};

const resetPassword = async ({ token, new_password }) => {
  await authSecurityService.ensureAuthSecuritySchema();
  const plain = String(new_password || '');
  if (!token || !plain) return { error: { status: 400, message: 'token and new_password are required' } };
  if (plain.length < 8) return { error: { status: 400, message: 'Password must be at least 8 characters' } };

  const tokenRow = await authSecurityService.consumePasswordResetToken(token);
  if (!tokenRow) return { error: { status: 400, message: 'Invalid or expired reset token' } };

  const passwordHash = await bcrypt.hash(plain, 10);
  await query('UPDATE users SET password_hash=$1,updated_at=NOW() WHERE user_id=$2', [passwordHash, tokenRow.user_id]);
  return { data: { message: 'Password reset successful' } };
};

const changePassword = async ({ user_id, current_password, new_password }) => {
  await authSecurityService.ensureAuthSecuritySchema();
  const current = String(current_password || '');
  const next = String(new_password || '');
  if (!current || !next) return { error: { status: 400, message: 'current_password and new_password are required' } };
  if (next.length < 8) return { error: { status: 400, message: 'Password must be at least 8 characters' } };

  const result = await query('SELECT password_hash FROM users WHERE user_id=$1 LIMIT 1', [Number(user_id)]);
  if (!result.rowCount) return { error: { status: 404, message: 'User not found' } };

  const valid = await bcrypt.compare(current, String(result.rows[0].password_hash || ''));
  if (!valid) return { error: { status: 401, message: 'Current password is incorrect' } };

  const passwordHash = await bcrypt.hash(next, 10);
  await query('UPDATE users SET password_hash=$1,updated_at=NOW() WHERE user_id=$2', [passwordHash, Number(user_id)]);
  await authSecurityService.setMustChangePassword(user_id, false);

  return { data: { message: 'Password changed successfully' } };
};

const issueAccessToken = (user) => {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';

  return jwt.sign(
    {
      user_id: Number(user.user_id),
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

module.exports = { login, issueAccessToken, forgotPassword, resetPassword, changePassword };
