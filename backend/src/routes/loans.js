const express = require('express');
const { createLoan, returnLoan, renewLoan, getLoans, getLoan } = require('../controllers/loansController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/loans', auth(['Admin', 'Librarian', 'Assistant', 'Member']), getLoans);
router.get('/loans/:id', auth(['Admin', 'Librarian', 'Assistant', 'Member']), getLoan);
router.post('/loans', auth(['Admin', 'Librarian', 'Assistant']), createLoan);
router.post('/loans/:id/return', auth(['Admin', 'Librarian', 'Assistant']), returnLoan);
router.post('/loans/:id/renew', auth(['Admin', 'Librarian', 'Assistant', 'Member']), renewLoan);

module.exports = router;
