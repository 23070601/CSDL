const express = require('express');
const { getConfig, updateConfig } = require('../controllers/configController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/config', auth(['Admin', 'Librarian', 'Assistant', 'Member']), getConfig);
router.put('/config', auth(['Admin']), updateConfig);

module.exports = router;
