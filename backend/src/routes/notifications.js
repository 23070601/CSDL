const express = require('express');
const { notify } = require('../controllers/notificationsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/notifications', auth(['Admin', 'Librarian', 'Assistant']), notify);

module.exports = router;
