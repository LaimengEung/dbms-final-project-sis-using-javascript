const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

const errorHandler = (err, req, res, next) => {
  if (err?.statusCode) {
    return res.status(err.statusCode).json({ message: err.message || 'Request failed' });
  }

  if (err?.code === '23505') {
    return res.status(409).json({ message: 'Duplicate value violates a unique constraint' });
  }

  if (err?.code === '23503') {
    return res.status(400).json({ message: 'Foreign key constraint failed' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error', detail: err.message });
};

module.exports = { notFoundHandler, errorHandler };
