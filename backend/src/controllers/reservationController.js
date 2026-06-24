const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');

const createReservation = async (req, res) => {
  try {
    const { restaurantId, tableId, reservationDate, reservationTime, partySize, specialRequests } = req.body;
    if (!restaurantId || !reservationDate || !reservationTime || !partySize)
      return res.status(400).json({ error: 'Restaurante, fecha, hora y número de personas son requeridos' });
    if (new Date(`${reservationDate} ${reservationTime}`) < new Date())
      return res.status(400).json({ error: 'No se puede reservar en el pasado' });

    let finalTableId = tableId;
    if (tableId) {
      if (!(await Reservation.checkAvailability(tableId, reservationDate, reservationTime)))
        return res.status(400).json({ error: 'La mesa no está disponible en ese horario' });
      const table = await Table.findById(tableId);
      if (table.capacity < partySize)
        return res.status(400).json({ error: `La mesa solo tiene capacidad para ${table.capacity} personas` });
    } else {
      const available = await Reservation.getAvailableTables(restaurantId, reservationDate, reservationTime, partySize);
      if (!available.length)
        return res.status(400).json({ error: 'No hay mesas disponibles para esa fecha, hora y número de personas' });
      finalTableId = available[0].id;
    }

    const reservation = await Reservation.create({ userId: req.user.id, restaurantId, tableId: finalTableId, reservationDate, reservationTime, partySize, specialRequests });
    res.status(201).json({ message: 'Reserva creada exitosamente', reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
};

const getAvailability = async (req, res) => {
  try {
    const { date, time, partySize } = req.query;
    if (!date || !time || !partySize)
      return res.status(400).json({ error: 'Fecha, hora y número de personas son requeridos' });
    const tables = await Reservation.getAvailableTables(req.params.restaurantId, date, time, parseInt(partySize));
    res.json({ available: tables.length > 0, availableTables: tables });
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar disponibilidad' });
  }
};

const getMyReservations = async (req, res) => {
  try {
    const { status, upcoming, past } = req.query;
    const reservations = await Reservation.findByUserId(req.user.id, { status, upcoming: upcoming === 'true', past: past === 'true' });
    res.json({ count: reservations.length, reservations });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

const getRestaurantReservations = async (req, res) => {
  try {
    if (!(await Restaurant.isOwner(req.params.restaurantId, req.user.id)))
      return res.status(403).json({ error: 'No tienes permiso para ver estas reservas' });
    const reservations = await Reservation.findByRestaurantId(req.params.restaurantId, req.query);
    res.json({ count: reservations.length, reservations });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

const getById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
    const isOwner = await Restaurant.isOwner(reservation.restaurant_id, req.user.id);
    if (!isOwner && reservation.user_id !== req.user.id)
      return res.status(403).json({ error: 'No tienes permiso para ver esta reserva' });
    res.json({ reservation });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reserva' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'cancelled', 'completed'].includes(status))
      return res.status(400).json({ error: 'Estado inválido' });
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (!(await Restaurant.isOwner(reservation.restaurant_id, req.user.id)))
      return res.status(403).json({ error: 'No tienes permiso para modificar esta reserva' });
    const updated = await Reservation.updateStatus(req.params.id, status);
    res.json({ message: 'Estado actualizado', reservation: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (reservation.user_id !== req.user.id)
      return res.status(403).json({ error: 'No tienes permiso para cancelar esta reserva' });
    if (reservation.status === 'cancelled')
      return res.status(400).json({ error: 'Esta reserva ya está cancelada' });
    if (!(await Reservation.canBeCancelled(req.params.id)))
      return res.status(400).json({ error: 'No se puede cancelar con menos de 2 horas de anticipación' });
    const cancelled = await Reservation.cancel(req.params.id);
    res.json({ message: 'Reserva cancelada exitosamente', reservation: cancelled });
  } catch (err) {
    res.status(500).json({ error: 'Error al cancelar reserva' });
  }
};

module.exports = { createReservation, getAvailability, getMyReservations, getRestaurantReservations, getById, updateStatus, cancelReservation };