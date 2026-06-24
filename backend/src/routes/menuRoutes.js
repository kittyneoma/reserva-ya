const express = require('express');
const router = express.Router();
const { getByRestaurant, getCategories, create, update, remove } = require('../controllers/menuController');
const auth = require('../middlewares/authMiddleware');

router.get('/restaurant/:restaurantId', getByRestaurant);
router.get('/restaurant/:restaurantId/categories', getCategories);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;