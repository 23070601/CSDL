const express = require('express');
const { listFines, payFine } = require('../controllers/finesController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/fines', auth(['Admin', 'Librarian', 'Assistant', 'Member']), listFines);
router.post('/fines/pay', auth(['Admin', 'Librarian', 'Assistant', 'Member']), payFine);

module.exports = router;
