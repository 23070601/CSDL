const express = require('express');
const { listMembers, getMember } = require('../controllers/membersController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/members', auth(['Admin', 'Librarian']), listMembers);
router.get('/members/:id', auth(['Admin', 'Librarian', 'Member']), getMember);

module.exports = router;
