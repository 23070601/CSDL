const express = require('express');
const { popularBooks, memberStatus, supplierPerformance } = require('../controllers/reportsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/reports/popular-books', auth(['Admin', 'Librarian']), popularBooks);
router.get('/reports/member-status', auth(['Admin', 'Librarian']), memberStatus);
router.get('/reports/supplier-performance', auth(['Admin', 'Librarian']), supplierPerformance);

module.exports = router;
