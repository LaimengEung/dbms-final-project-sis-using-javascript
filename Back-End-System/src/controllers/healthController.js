const { query } = require('../db');

let dbConnected = false;

const root = (req, res) => {
  res.json({ message: 'Backend server is running.' });
};

const health = async (req, res) => {
  try {
    await query('SELECT 1');
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  res.json({ status: 'ok', database: dbConnected ? 'connected' : 'disconnected' });
};

module.exports = { root, health };
