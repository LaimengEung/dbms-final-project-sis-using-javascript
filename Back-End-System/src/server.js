const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { testConnection } = require('./db');

const PORT = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    await testConnection();
    console.log('PostgreSQL connected successfully.');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
