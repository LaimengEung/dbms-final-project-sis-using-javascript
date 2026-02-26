const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const { setupSwagger } = require('./swagger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandlers');

const app = express();

app.use(cors());
app.use(express.json());
setupSwagger(app);

app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
