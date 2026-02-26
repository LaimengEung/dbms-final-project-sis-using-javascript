const { pool, query } = require('../db');

const mapSemester = (r) => ({
  semester_id: Number(r.semester_id),
  semester_name: r.semester_name,
  semester_year: Number(r.semester_year),
  start_date: r.start_date,
  end_date: r.end_date,
  registration_start: r.registration_start,
  registration_end: r.registration_end,
  is_current: r.is_current,
});

const normalizePayload = (payload = {}) => ({
  semester_name: payload.semester_name ? String(payload.semester_name).trim() : null,
  semester_year: payload.semester_year == null ? null : Number(payload.semester_year),
  start_date: payload.start_date || null,
  end_date: payload.end_date || null,
  registration_start: payload.registration_start || null,
  registration_end: payload.registration_end || null,
  is_current: Boolean(payload.is_current),
});

const validatePayload = (payload, { partial = false } = {}) => {
  const required = ['semester_name', 'semester_year', 'start_date', 'end_date', 'registration_start', 'registration_end'];

  if (!partial) {
    for (const key of required) {
      if (payload[key] == null || payload[key] === '') return `${key} is required`;
    }
  }

  if (payload.semester_year != null && !Number.isFinite(payload.semester_year)) return 'semester_year must be a valid number';

  const start = payload.start_date ? new Date(payload.start_date) : null;
  const end = payload.end_date ? new Date(payload.end_date) : null;
  const regStart = payload.registration_start ? new Date(payload.registration_start) : null;
  const regEnd = payload.registration_end ? new Date(payload.registration_end) : null;

  if (start && Number.isNaN(start.getTime())) return 'start_date is invalid';
  if (end && Number.isNaN(end.getTime())) return 'end_date is invalid';
  if (regStart && Number.isNaN(regStart.getTime())) return 'registration_start is invalid';
  if (regEnd && Number.isNaN(regEnd.getTime())) return 'registration_end is invalid';

  if (start && end && start > end) return 'start_date must be on or before end_date';
  if (regStart && regEnd && regStart > regEnd) return 'registration_start must be on or before registration_end';
  if (regEnd && start && regEnd > start) return 'registration_end must be on or before start_date';

  return null;
};

const listSemesters = async ({ limit }) => {
  const params = [];
  let limitSql = '';
  if (limit) { params.push(Number(limit)); limitSql = `LIMIT $${params.length}`; }

  const result = await query(
    `SELECT semester_id,semester_name,semester_year,start_date,end_date,registration_start,registration_end,is_current
     FROM semesters ORDER BY semester_year DESC, semester_id DESC ${limitSql}`,
    params
  );

  return result.rows.map(mapSemester);
};

const createSemester = async (payload) => {
  const data = normalizePayload(payload);
  const validationError = validatePayload(data);
  if (validationError) return { error: { status: 400, message: validationError } };

  const duplicate = await query(
    'SELECT semester_id FROM semesters WHERE LOWER(semester_name)=LOWER($1) AND semester_year=$2 LIMIT 1',
    [data.semester_name, data.semester_year]
  );
  if (duplicate.rowCount) return { error: { status: 409, message: 'Semester already exists for this year' } };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (data.is_current) await client.query('UPDATE semesters SET is_current=false WHERE is_current=true');

    const inserted = await client.query(
      `INSERT INTO semesters(semester_name,semester_year,start_date,end_date,registration_start,registration_end,is_current)
       VALUES($1,$2,$3,$4,$5,$6,$7)
       RETURNING semester_id,semester_name,semester_year,start_date,end_date,registration_start,registration_end,is_current`,
      [data.semester_name, data.semester_year, data.start_date, data.end_date, data.registration_start, data.registration_end, data.is_current]
    );

    await client.query('COMMIT');
    return { data: mapSemester(inserted.rows[0]) };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateSemester = async (semesterId, payload) => {
  const id = Number(semesterId);
  const existing = await query(
    `SELECT semester_id,semester_name,semester_year,start_date,end_date,registration_start,registration_end,is_current
     FROM semesters WHERE semester_id=$1`,
    [id]
  );
  if (!existing.rowCount) return null;

  const base = existing.rows[0];
  const data = {
    semester_name: payload.semester_name != null ? String(payload.semester_name).trim() : base.semester_name,
    semester_year: payload.semester_year != null ? Number(payload.semester_year) : Number(base.semester_year),
    start_date: payload.start_date ?? base.start_date,
    end_date: payload.end_date ?? base.end_date,
    registration_start: payload.registration_start ?? base.registration_start,
    registration_end: payload.registration_end ?? base.registration_end,
    is_current: payload.is_current != null ? Boolean(payload.is_current) : Boolean(base.is_current),
  };

  const validationError = validatePayload(data, { partial: true });
  if (validationError) return { error: { status: 400, message: validationError } };

  const duplicate = await query(
    `SELECT semester_id FROM semesters
     WHERE LOWER(semester_name)=LOWER($1) AND semester_year=$2 AND semester_id<>$3
     LIMIT 1`,
    [data.semester_name, data.semester_year, id]
  );
  if (duplicate.rowCount) return { error: { status: 409, message: 'Semester already exists for this year' } };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (data.is_current) await client.query('UPDATE semesters SET is_current=false WHERE is_current=true AND semester_id<>$1', [id]);

    const updated = await client.query(
      `UPDATE semesters
       SET semester_name=$1,semester_year=$2,start_date=$3,end_date=$4,registration_start=$5,registration_end=$6,is_current=$7
       WHERE semester_id=$8
       RETURNING semester_id,semester_name,semester_year,start_date,end_date,registration_start,registration_end,is_current`,
      [data.semester_name, data.semester_year, data.start_date, data.end_date, data.registration_start, data.registration_end, data.is_current, id]
    );

    await client.query('COMMIT');
    return { data: mapSemester(updated.rows[0]) };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const setCurrentSemester = async (semesterId) => {
  const id = Number(semesterId);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const target = await client.query('SELECT semester_id FROM semesters WHERE semester_id=$1 LIMIT 1', [id]);
    if (!target.rowCount) {
      await client.query('ROLLBACK');
      return null;
    }
    await client.query('UPDATE semesters SET is_current=false WHERE is_current=true');
    const updated = await client.query(
      `UPDATE semesters SET is_current=true WHERE semester_id=$1
       RETURNING semester_id,semester_name,semester_year,start_date,end_date,registration_start,registration_end,is_current`,
      [id]
    );
    await client.query('COMMIT');
    return { data: mapSemester(updated.rows[0]) };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { listSemesters, createSemester, updateSemester, setCurrentSemester };
