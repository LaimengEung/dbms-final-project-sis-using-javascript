const toDbRole = (role) => {
  const normalized = String(role || 'student').toLowerCase();
  return normalized === 'teacher' ? 'faculty' : normalized;
};

const toApiRole = (role) => {
  const normalized = String(role || '').toLowerCase();
  return normalized === 'faculty' ? 'teacher' : normalized;
};

const toDbClassification = (value) => {
  const map = {
    1: 'freshman',
    2: 'sophomore',
    3: 'junior',
    4: 'senior',
    freshman: 'freshman',
    sophomore: 'sophomore',
    junior: 'junior',
    senior: 'senior',
  };
  return map[String(value).toLowerCase()] || 'freshman';
};

const toApiClassification = (value) => {
  const map = { freshman: 1, sophomore: 2, junior: 3, senior: 4 };
  return map[String(value || '').toLowerCase()] || 1;
};

const normalizeStanding = (value) => {
  const normalized = String(value || 'good').toLowerCase();
  return ['good', 'probation', 'suspended', 'dismissed'].includes(normalized) ? normalized : 'good';
};

module.exports = {
  toDbRole,
  toApiRole,
  toDbClassification,
  toApiClassification,
  normalizeStanding,
};
