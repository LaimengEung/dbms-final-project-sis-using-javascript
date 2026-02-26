const userService = require('../services/userService');

const listUsers = async (req, res) => {
  const rows = await userService.listUsers(req.query || {});
  res.json(rows);
};

const getUser = async (req, res) => {
  const row = await userService.getUserById(req.params.id);
  if (!row) return res.status(404).json({ message: 'User not found' });
  return res.json(row);
};

const getStats = async (req, res) => {
  const stats = await userService.getUserStats();
  res.json(stats);
};

const createUser = async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body || {};
  if (!first_name || !last_name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const row = await userService.createUser(req.body);
  return res.status(201).json(row);
};

const updateUser = async (req, res) => {
  const { first_name, last_name, email, role } = req.body || {};
  if (!first_name || !last_name || !email || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const row = await userService.updateUser(req.params.id, req.body);
  if (!row) return res.status(404).json({ message: 'User not found' });
  return res.json(row);
};

const patchUser = async (req, res) => {
  const row = await userService.patchUser(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: 'User not found' });
  return res.json(row);
};

const deleteUser = async (req, res) => {
  const ok = await userService.deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ message: 'User not found' });
  return res.json({ message: 'User deleted successfully' });
};

module.exports = {
  listUsers,
  getUser,
  getStats,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
};
