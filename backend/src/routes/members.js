const express = require('express');
const { listMembers, getMember, updateMember, deleteMember } = require('../controllers/membersController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Assistants may view members for circulation workflows, but cannot modify
router.get('/members', auth(['Admin', 'Librarian', 'Assistant']), listMembers);
router.get('/members/:id', auth(['Admin', 'Librarian', 'Assistant', 'Member']), getMember);
router.put('/members/:id', auth(['Admin', 'Librarian', 'Member']), updateMember);
router.delete('/members/:id', auth(['Admin', 'Librarian']), deleteMember);

module.exports = router;
