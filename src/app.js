const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const routes = require('./routes');
const { sequelize } = require('./config/database');

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN || undefined; // undefined => reflect request origin when appropriate
app.use(cors({ origin: allowedOrigin || true }));
app.use(helmet());
app.disable('x-powered-by');
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Swagger docs (read-only, does not modify existing APIs)
const swaggerDocument = YAML.load(require('path').join(__dirname, '..', 'docs', 'openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

app.use('/api', routes);

module.exports = app;
