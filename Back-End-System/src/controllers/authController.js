const authService = require('../services/authService');

const login = async (req, res) => {
  const result = await authService.login(req.body || {});
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  const access_token = authService.issueAccessToken(result.data);
  return res.json({
    message: 'Login successful',
    data: {
      user: result.data,
      access_token,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES_IN || '8h',
    },
  });
};

const forgotPassword = async (req, res) => {
  const result = await authService.forgotPassword(req.body || {});
  if (result.error) return res.status(result.error.status).json({ message: result.error.message });
  return res.json(result.data);
};

const resetPassword = async (req, res) => {
  const result = await authService.resetPassword(req.body || {});
  if (result.error) return res.status(result.error.status).json({ message: result.error.message });
  return res.json(result.data);
};

const changePassword = async (req, res) => {
  const result = await authService.changePassword({ user_id: req?.user?.user_id, ...(req.body || {}) });
  if (result.error) return res.status(result.error.status).json({ message: result.error.message });
  return res.json(result.data);
};

module.exports = { login, forgotPassword, resetPassword, changePassword };
