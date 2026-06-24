const pool = require('../config/database');

class Reservation {
  static async create(data) {
    const { userId, restaurantId, tableId, reservationDate, reservationTime, partySize, specialRequests } = data;
    const { rows } = await pool.query(
      `INSERT INTO reservations (user_id, restaurant_id, table_id, reservation_date, reservation_time, party_size, special_requests)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [userId, restaurantId, tableId, reservationDate, reservationTime, partySize, specialRequests]
    );
    return rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let query = `SELECT r.*, res.name as restaurant_name, res.address as restaurant_address,
                 t.table_number FROM reservations r
                 JOIN restaurants res ON r.restaurant_id = res.id
                 LEFT JOIN tables t ON r.table_id = t.id
                 WHERE r.user_id = $1`;
    const params = [userId];
    if (filters.status) { params.push(filters.status); query += ` AND r.status = $${params.length}`; }
    if (filters.upcoming) query += ` AND r.reservation_date >= CURRENT_DATE`;
    if (filters.past) query += ` AND r.reservation_date < CURRENT_DATE`;
    query += ' ORDER BY r.reservation_date DESC, r.reservation_time DESC';
    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async findByRestaurantId(restaurantId, filters = {}) {
    let query = `SELECT r.*, u.first_name, u.last_name, u.email, u.phone,
                 t.table_number FROM reservations r
                 JOIN users u ON r.user_id = u.id
                 LEFT JOIN tables t ON r.table_id = t.id
                 WHERE r.restaurant_id = $1`;
    const params = [restaurantId];
    if (filters.date) { params.push(filters.date); query += ` AND r.reservation_date = $${params.length}`; }
    if (filters.status) { params.push(filters.status); query += ` AND r.status = $${params.length}`; }
    query += ' ORDER BY r.reservation_date ASC, r.reservation_time ASC';
    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT r.*, res.name as restaurant_name, t.table_number
       FROM reservations r
       JOIN restaurants res ON r.restaurant_id = res.id
       LEFT JOIN tables t ON r.table_id = t.id
       WHERE r.id = $1`, [id]
    );
    return rows[0];
  }

  static async checkAvailability(tableId, date, time) {
    const { rows } = await pool.query(
      `SELECT id FROM reservations WHERE table_id=$1 AND reservation_date=$2
       AND reservation_time=$3 AND status NOT IN ('cancelled')`, [tableId, date, time]
    );
    return rows.length === 0;
  }

  static async getAvailableTables(restaurantId, date, time, partySize) {
    const { rows } = await pool.query(
      `SELECT t.* FROM tables t WHERE t.restaurant_id=$1 AND t.is_active=true
       AND t.capacity >= $2
       AND t.id NOT IN (
         SELECT table_id FROM reservations WHERE restaurant_id=$1
         AND reservation_date=$3 AND reservation_time=$4 AND status NOT IN ('cancelled')
       ) ORDER BY t.capacity ASC`, [restaurantId, partySize, date, time]
    );
    return rows;
  }

  static async updateStatus(id, status) {
    const { rows } = await pool.query(
      'UPDATE reservations SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [status, id]
    );
    return rows[0];
  }

  static async cancel(id) {
    const { rows } = await pool.query(
      `UPDATE reservations SET status='cancelled', cancelled_at=NOW(), updated_at=NOW()
       WHERE id=$1 RETURNING *`, [id]
    );
    return rows[0];
  }

  static async canBeCancelled(id) {
    const { rows } = await pool.query(
      `SELECT reservation_date, reservation_time FROM reservations WHERE id=$1`, [id]
    );
    if (!rows[0]) return false;
    const dt = new Date(`${rows[0].reservation_date}T${rows[0].reservation_time}`);
    return (dt - new Date()) > 2 * 60 * 60 * 1000;
  }
}

module.exports = Reservation;