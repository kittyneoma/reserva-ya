const express = require('express');
const router = express.Router();
const { getAll, getById, getMyRestaurants, create, update, toggleStatus, remove } = require('../controllers/restaurantController');
const auth = require('../middlewares/authMiddleware');

router.get('/', getAll);
router.get('/my/restaurants', auth, getMyRestaurants);
router.get('/:id', getById);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.patch('/:id/status', auth, toggleStatus);
router.delete('/:id', auth, remove);

module.exports = router;