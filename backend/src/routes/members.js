const express = require('express');
const { listMembers, getMember, updateMember, deleteMember } = require('../controllers/membersController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/members', auth(['Admin', 'Librarian']), listMembers);
router.get('/members/:id', auth(['Admin', 'Librarian', 'Member']), getMember);
router.put('/members/:id', auth(['Admin', 'Librarian', 'Member']), updateMember);
router.delete('/members/:id', auth(['Admin', 'Librarian']), deleteMember);

module.exports = router;
