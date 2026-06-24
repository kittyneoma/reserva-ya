const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');

const getByRestaurant = async (req, res) => {
  try {
    const tables = await Table.findByRestaurant(req.params.restaurantId);
    res.json({ count: tables.length, tables });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener mesas' });
  }
};

const create = async (req, res) => {
  try {
    const { restaurantId, tableNumber, capacity } = req.body;
    if (!(await Restaurant.isOwner(restaurantId, req.user.id)))
      return res.status(403).json({ error: 'No tienes permiso' });
    const table = await Table.create({ restaurantId, tableNumber, capacity });
    res.status(201).json({ message: 'Mesa creada', table });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear mesa' });
  }
};

const update = async (req, res) => {
  try {
    const table = await Table.update(req.params.id, req.body);
    res.json({ message: 'Mesa actualizada', table });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar mesa' });
  }
};

const remove = async (req, res) => {
  try {
    await Table.delete(req.params.id);
    res.json({ message: 'Mesa eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar mesa' });
  }
};

module.exports = { getByRestaurant, create, update, remove };