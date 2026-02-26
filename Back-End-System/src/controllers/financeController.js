const financeService = require('../services/financeService');

const listFinanceRecords = async (req, res) => res.json(await financeService.listFinanceRecords(req.query || {}));

const getFinanceRecord = async (req, res) => {
  const row = await financeService.getFinanceById(req.params.id);
  if (!row) return res.status(404).json({ message: 'Finance record not found' });
  return res.json(row);
};

const createFinanceRecord = async (req, res) => {
  const { student_id, semester_id, amount, transaction_type, transaction_date } = req.body || {};
  if (!student_id || !semester_id || amount == null || !transaction_type || !transaction_date) {
    return res.status(400).json({ message: 'student_id, semester_id, amount, transaction_type, transaction_date are required' });
  }

  return res.status(201).json(await financeService.createFinanceRecord(req.body || {}));
};

const updateFinanceRecord = async (req, res) => {
  const row = await financeService.updateFinanceRecord(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ message: 'Finance record not found' });
  return res.json(row);
};

const deleteFinanceRecord = async (req, res) => {
  const ok = await financeService.deleteFinanceRecord(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Finance record not found' });
  return res.json({ message: 'Finance record deleted successfully' });
};

module.exports = {
  listFinanceRecords,
  getFinanceRecord,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
};
