const express = require('express');
const { reportLost } = require('../controllers/lostController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/lost', auth(['Admin', 'Librarian', 'Assistant']), reportLost);

module.exports = router;
