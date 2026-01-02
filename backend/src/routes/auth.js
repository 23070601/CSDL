const express = require('express');
const { login, registerMember } = require('../controllers/authController');

const router = express.Router();

router.post('/auth/login', login);
router.post('/auth/register', registerMember);

module.exports = router;
