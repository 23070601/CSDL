const express = require('express');
const { getConfig } = require('../controllers/configController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/config', auth(['Admin', 'Librarian', 'Assistant', 'Member']), getConfig);

module.exports = router;
