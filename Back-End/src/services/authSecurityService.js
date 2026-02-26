const crypto = require('crypto');
const { query } = require('../db');

let initialized = false;

const ensureAuthSecuritySchema = async () => {
  if (initialized) return;

  await query(`
    CREATE TABLE IF NOT EXISTS user_security (
      user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
      must_change_password BOOLEAN NOT NULL DEFAULT false,
      reset_token_hash VARCHAR(255),
      reset_token_expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(
    `INSERT INTO user_security (user_id, must_change_password)
     SELECT user_id, false FROM users
     ON CONFLICT (user_id) DO NOTHING`
  );

  initialized = true;
};

const getSecurityByUserId = async (userId) => {
  await ensureAuthSecuritySchema();
  const result = await query('SELECT user_id,must_change_password,reset_token_hash,reset_token_expires_at FROM user_security WHERE user_id=$1', [
    Number(userId),
  ]);
  return result.rows[0] || null;
};

const setMustChangePassword = async (userId, mustChange) => {
  await ensureAuthSecuritySchema();
  await query(
    `INSERT INTO user_security (user_id,must_change_password,updated_at)
     VALUES ($1,$2,NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET must_change_password=EXCLUDED.must_change_password,updated_at=NOW()`,
    [Number(userId), Boolean(mustChange)]
  );
};

const issuePasswordResetToken = async (userId) => {
  await ensureAuthSecuritySchema();
  const token = crypto.randomBytes(24).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  await query(
    `INSERT INTO user_security (user_id,reset_token_hash,reset_token_expires_at,updated_at)
     VALUES ($1,$2,$3,NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET reset_token_hash=EXCLUDED.reset_token_hash,reset_token_expires_at=EXCLUDED.reset_token_expires_at,updated_at=NOW()`,
    [Number(userId), hash, expiresAt]
  );

  return { token, expires_at: expiresAt.toISOString() };
};

const consumePasswordResetToken = async (token) => {
  await ensureAuthSecuritySchema();
  const hash = crypto.createHash('sha256').update(String(token || '')).digest('hex');
  const result = await query(
    `SELECT user_id FROM user_security
     WHERE reset_token_hash=$1
       AND reset_token_expires_at IS NOT NULL
       AND reset_token_expires_at > NOW()
     LIMIT 1`,
    [hash]
  );

  if (!result.rowCount) return null;

  const userId = Number(result.rows[0].user_id);
  await query(
    `UPDATE user_security
     SET reset_token_hash=NULL,reset_token_expires_at=NULL,must_change_password=false,updated_at=NOW()
     WHERE user_id=$1`,
    [userId]
  );

  return { user_id: userId };
};

module.exports = {
  ensureAuthSecuritySchema,
  getSecurityByUserId,
  setMustChangePassword,
  issuePasswordResetToken,
  consumePasswordResetToken,
};

