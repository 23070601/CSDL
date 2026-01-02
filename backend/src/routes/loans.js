const express = require('express');
const { createLoan, returnLoan, renewLoan } = require('../controllers/loansController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/loans', auth(['Admin', 'Librarian', 'Assistant']), createLoan);
router.post('/loans/:id/return', auth(['Admin', 'Librarian', 'Assistant']), returnLoan);
router.post('/loans/:id/renew', auth(['Admin', 'Librarian', 'Assistant', 'Member']), renewLoan);

module.exports = router;
