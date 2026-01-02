const express = require('express');
const { listPurchaseOrders } = require('../controllers/purchaseOrdersController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/purchase-orders', auth(['Admin', 'Librarian']), listPurchaseOrders);

module.exports = router;
