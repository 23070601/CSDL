const express = require('express');
const { getNotifications, markAsRead, notify } = require('../controllers/notificationsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET notifications for current user
router.get('/notifications', auth(['Admin', 'Librarian', 'Assistant', 'Member']), getNotifications);

// Mark notification as read
router.put('/notifications/:id/read', auth(['Admin', 'Librarian', 'Assistant', 'Member']), markAsRead);

// Create/send notification
router.post('/notifications', auth(['Admin', 'Librarian', 'Assistant']), notify);

module.exports = router;
