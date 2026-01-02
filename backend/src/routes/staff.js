const express = require('express');
const { listStaff, getStaff, createStaff, updateStaff } = require('../controllers/staffController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/staff', auth(['Admin']), listStaff);
router.post('/staff', auth(['Admin']), createStaff);
router.get('/staff/:id', auth(['Admin']), getStaff);
router.put('/staff/:id', auth(['Admin']), updateStaff);

module.exports = router;
