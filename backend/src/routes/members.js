const express = require('express');
const { listMembers, getMember, updateMember } = require('../controllers/membersController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/members', auth(['Admin', 'Librarian']), listMembers);
router.get('/members/:id', auth(['Admin', 'Librarian', 'Member']), getMember);
router.put('/members/:id', auth(['Admin', 'Librarian', 'Member']), updateMember);

module.exports = router;
