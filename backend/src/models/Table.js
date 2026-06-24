const pool = require('../config/database');

class Table {
  static async findByRestaurant(restaurantId) {
    const { rows } = await pool.query(
      'SELECT * FROM tables WHERE restaurant_id=$1 AND is_active=true ORDER BY table_number', [restaurantId]
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM tables WHERE id=$1', [id]);
    return rows[0];
  }

  static async create({ restaurantId, tableNumber, capacity }) {
    const { rows } = await pool.query(
      'INSERT INTO tables (restaurant_id, table_number, capacity) VALUES ($1,$2,$3) RETURNING *',
      [restaurantId, tableNumber, capacity]
    );
    return rows[0];
  }

  static async update(id, { tableNumber, capacity, isActive }) {
    const { rows } = await pool.query(
      'UPDATE tables SET table_number=$1, capacity=$2, is_active=$3 WHERE id=$4 RETURNING *',
      [tableNumber, capacity, isActive, id]
    );
    return rows[0];
  }

  static async delete(id) {
    await pool.query('UPDATE tables SET is_active=false WHERE id=$1', [id]);
  }
}

module.exports = Table;