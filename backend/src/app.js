const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(helmet());

const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
});
app.use(limiter);

// Increase body size limit to handle large payloads like base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api', routes);

// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

module.exports = app;
