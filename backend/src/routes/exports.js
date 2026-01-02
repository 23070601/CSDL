const express = require('express');
const { exportBooks, exportMembers } = require('../controllers/exportController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/export/books', auth(['Admin']), exportBooks);
router.get('/export/members', auth(['Admin']), exportMembers);

module.exports = router;
