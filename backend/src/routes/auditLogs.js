const express = require('express');
const { getAuditLogs, createAuditLog } = require('../controllers/auditLogsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/audit-logs', auth(['Admin', 'Librarian']), getAuditLogs);
router.post('/audit-logs', auth(['Admin', 'Librarian']), createAuditLog);

module.exports = router;
