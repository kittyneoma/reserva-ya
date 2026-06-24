const express = require('express');
const router = express.Router();
const { createReservation, getAvailability, getMyReservations, getRestaurantReservations, getById, updateStatus, cancelReservation } = require('../controllers/reservationController');
const auth = require('../middlewares/authMiddleware');

router.get('/availability/:restaurantId', getAvailability);
router.get('/my/reservations', auth, getMyReservations);
router.get('/restaurant/:restaurantId', auth, getRestaurantReservations);
router.post('/', auth, createReservation);
router.get('/:id', auth, getById);
router.put('/:id/status', auth, updateStatus);
router.put('/:id/cancel', auth, cancelReservation);

module.exports = router;