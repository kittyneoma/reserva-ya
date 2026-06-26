const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

const getByRestaurant = async (req, res) => {
    try {
        const items = await MenuItem.findByRestaurant(req.params.restaurantId)
        res.json({ count: items.lenght, menuItems: items });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener menú' });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await MenuItem.findCategories(req.params.restaurantId);
        res.json({ categories });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener categorías '});
    }
};

const create = async (req, res) => {
    try{
        const { restaurantId, name, description, category, price, imageUrl } = req.body;
        if (!(await Restaurant.isOwner(restaurantId, req.user.id)))
            return res.status(403).json({ error: 'No tienes permiso' });
        const item = await MenuItem.create({ restaurantId, name, description, category, price, imageUrl });
        res.status(201).json({ message: 'Platillo creado', MenuItem: item });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear platillo' });
    }
};

const update = async (req, res) => {
    try {
        const item = await MenuItem.update(req.params.id, req.body);
        res.json({ message: 'Platillo actualizado', MenuItem: item });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar platillo' });
    }
};

const remove = async (req, res) => {
    try {
        const item = await MenuItem.delete(req.params.id);
        res.json({ message: 'Platillo eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar platillo' });
    }
};

module.exports = { getByRestaurant, getCategories, create, update, remove };