const express = require('express');
const { listSuppliers, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/suppliersController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/suppliers', auth(['Admin', 'Librarian']), listSuppliers);
router.post('/suppliers', auth(['Admin']), createSupplier);
router.put('/suppliers/:id', auth(['Admin']), updateSupplier);
router.delete('/suppliers/:id', auth(['Admin']), deleteSupplier);

module.exports = router;
