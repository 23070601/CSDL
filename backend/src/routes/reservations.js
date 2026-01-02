const express = require('express');
const { listActiveReservations, fulfillReservation, cancelReservation } = require('../controllers/reservationsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/reservations', auth(['Admin', 'Librarian', 'Assistant']), listActiveReservations);
router.post('/reservations/:reservationId/fulfill', auth(['Admin', 'Librarian', 'Assistant']), fulfillReservation);
router.post('/reservations/:reservationId/cancel', auth(['Admin', 'Librarian', 'Assistant', 'Member']), cancelReservation);

module.exports = router;
