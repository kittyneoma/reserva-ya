const express = require('express');
const router = express.Router();
const { getByRestaurant, create, update, remove } = require('../controllers/tableController');
const auth = require('../middlewares/authMiddleware');

router.get('/restaurant/:restaurantId', getByRestaurant);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;