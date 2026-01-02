const express = require('express');
const { listStaff } = require('../controllers/staffController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/staff', auth(['Admin']), listStaff);

module.exports = router;
