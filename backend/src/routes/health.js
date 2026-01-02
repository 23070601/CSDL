const express = require('express');
const { testConnection } = require('../config/db');

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    const dbOk = await testConnection();
    return res.json({ status: 'ok', db: dbOk ? 'connected' : 'unreachable' });
  } catch (err) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
});

module.exports = router;
