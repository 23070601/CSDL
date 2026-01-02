const express = require('express');
const { 
  listPurchaseOrders, 
  createPurchaseOrder, 
  updatePurchaseOrder, 
  deletePurchaseOrder 
} = require('../controllers/purchaseOrdersController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/purchase-orders', auth(['Admin', 'Librarian']), listPurchaseOrders);
router.post('/purchase-orders', auth(['Admin', 'Librarian']), createPurchaseOrder);
router.put('/purchase-orders/:id', auth(['Admin', 'Librarian']), updatePurchaseOrder);
router.delete('/purchase-orders/:id', auth(['Admin', 'Librarian']), deletePurchaseOrder);

module.exports = router;
