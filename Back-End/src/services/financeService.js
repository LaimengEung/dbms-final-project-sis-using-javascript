const { query } = require('../db');

const mapFinance = (r) => ({
  finance_id: Number(r.finance_id),
  student_id: Number(r.student_id),
  semester_id: Number(r.semester_id),
  amount: Number(r.amount || 0),
  transaction_type: r.transaction_type,
  description: r.description,
  transaction_date: r.transaction_date,
  payment_method: r.payment_method,
  reference_number: r.reference_number,
  status: r.status,
  created_at: r.created_at,
});

const listFinanceRecords = async ({ student_id, semester_id, status, transaction_type } = {}) => {
  const params = [];
  const where = [];

  if (student_id) {
    params.push(Number(student_id));
    where.push(`student_id = $${params.length}`);
  }
  if (semester_id) {
    params.push(Number(semester_id));
    where.push(`semester_id = $${params.length}`);
  }
  if (status) {
    params.push(String(status).toLowerCase());
    where.push(`LOWER(status) = $${params.length}`);
  }
  if (transaction_type) {
    params.push(String(transaction_type).toLowerCase());
    where.push(`LOWER(transaction_type) = $${params.length}`);
  }

  const result = await query(
    `SELECT finance_id,student_id,semester_id,amount,transaction_type,description,transaction_date,payment_method,reference_number,status,created_at
     FROM finance_records
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY finance_id DESC`,
    params
  );

  return result.rows.map(mapFinance);
};

const getFinanceById = async (financeId) => {
  const result = await query(
    `SELECT finance_id,student_id,semester_id,amount,transaction_type,description,transaction_date,payment_method,reference_number,status,created_at
     FROM finance_records
     WHERE finance_id = $1`,
    [Number(financeId)]
  );

  return result.rowCount ? mapFinance(result.rows[0]) : null;
};

const createFinanceRecord = async (payload) => {
  const result = await query(
    `INSERT INTO finance_records(student_id,semester_id,amount,transaction_type,description,transaction_date,payment_method,reference_number,status)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING finance_id,student_id,semester_id,amount,transaction_type,description,transaction_date,payment_method,reference_number,status,created_at`,
    [
      Number(payload.student_id),
      Number(payload.semester_id),
      Number(payload.amount),
      payload.transaction_type,
      payload.description || null,
      payload.transaction_date,
      payload.payment_method || null,
      payload.reference_number || null,
      payload.status || 'pending',
    ]
  );

  return mapFinance(result.rows[0]);
};

const updateFinanceRecord = async (financeId, payload) => {
  const result = await query(
    `UPDATE finance_records
     SET student_id=$1,semester_id=$2,amount=$3,transaction_type=$4,description=$5,transaction_date=$6,payment_method=$7,reference_number=$8,status=$9
     WHERE finance_id=$10
     RETURNING finance_id,student_id,semester_id,amount,transaction_type,description,transaction_date,payment_method,reference_number,status,created_at`,
    [
      Number(payload.student_id),
      Number(payload.semester_id),
      Number(payload.amount),
      payload.transaction_type,
      payload.description || null,
      payload.transaction_date,
      payload.payment_method || null,
      payload.reference_number || null,
      payload.status || 'pending',
      Number(financeId),
    ]
  );

  return result.rowCount ? mapFinance(result.rows[0]) : null;
};

const deleteFinanceRecord = async (financeId) => {
  const result = await query('DELETE FROM finance_records WHERE finance_id=$1 RETURNING finance_id', [Number(financeId)]);
  return result.rowCount > 0;
};

module.exports = {
  listFinanceRecords,
  getFinanceById,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
};
