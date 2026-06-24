const Restaurant = require('../models/Restaurant');

const getAll = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.json({ count: restaurants.length, restaurants });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener restaurantes' });
  }
};

const getById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurante no encontrado' });
    res.json({ restaurant });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener restaurante' });
  }
};

const getMyRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findByUserId(req.user.id);
    res.json({ count: restaurants.length, restaurants });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tus restaurantes' });
  }
};

const create = async (req, res) => {
  try {
    const { name, description, address, city, state, cuisineType, priceRange, phone, email, operatingHours } = req.body;
    if (!name || !address || !city || !cuisineType || !phone)
      return res.status(400).json({ error: 'Nombre, dirección, ciudad, tipo de cocina y teléfono son requeridos' });
    const restaurant = await Restaurant.create({ userId: req.user.id, name, description, address, city, state, cuisineType, priceRange, phone, email, operatingHours });
    res.status(201).json({ message: 'Restaurante creado exitosamente', restaurant });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear restaurante' });
  }
};

const update = async (req, res) => {
  try {
    if (!(await Restaurant.isOwner(req.params.id, req.user.id)))
      return res.status(403).json({ error: 'No tienes permiso para modificar este restaurante' });
    const restaurant = await Restaurant.update(req.params.id, req.body);
    res.json({ message: 'Restaurante actualizado', restaurant });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar restaurante' });
  }
};

const remove = async (req, res) => {
  try {
    if (!(await Restaurant.isOwner(req.params.id, req.user.id)))
      return res.status(403).json({ error: 'No tienes permiso para eliminar este restaurante' });
    await Restaurant.delete(req.params.id);
    res.json({ message: 'Restaurante eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar restaurante' });
  }
};

module.exports = { getAll, getById, getMyRestaurants, create, update, remove };