const express = require('express');
const { listFines, payFine, createFine } = require('../controllers/finesController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/fines', auth(['Admin', 'Librarian', 'Member']), listFines);
router.post('/fines', auth(['Admin', 'Librarian']), createFine);
router.post('/fines/pay', auth(['Admin', 'Librarian', 'Member']), payFine);

module.exports = router;
