const express = require('express');
const { requestPasswordReset, confirmPasswordReset, changePassword } = require('../controllers/passwordController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/password/reset/request
 * Public endpoint - request password reset
 * Body: { email }
 */
router.post('/reset/request', requestPasswordReset);

/**
 * POST /api/password/reset/confirm
 * Public endpoint - confirm password reset with token
 * Body: { token, newPassword }
 */
router.post('/reset/confirm', confirmPasswordReset);

/**
 * POST /api/password/change
 * Protected endpoint - change password for authenticated user
 * Body: { currentPassword, newPassword }
 * Requires: Authorization header with JWT token
 */
router.post('/change', auth(['Admin', 'Librarian', 'Assistant', 'Member']), changePassword);

module.exports = router;
