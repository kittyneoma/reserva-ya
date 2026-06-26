const pool = require('../config/database');

class Restaurant {
  static async findAll() {
    const { rows } = await pool.query(
      `SELECT * FROM restaurants WHERE is_active = true ORDER BY created_at DESC`
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM restaurants WHERE id = $1 AND is_active = true', [id]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM restaurants WHERE user_id = $1 ORDER BY created_at DESC', [userId]
    );
    return rows;
  }

  static async create(data) {
    const { userId, name, description, address, city, state, cuisineType, priceRange, phone, email, operatingHours } = data;
    const { rows } = await pool.query(
      `INSERT INTO restaurants (user_id, name, description, address, city, state, cuisine_type, price_range, phone, email, operating_hours)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [userId, name, description, address, city, state, cuisineType, priceRange, phone, email, JSON.stringify(operatingHours || {})]
    );
    return rows[0];
  }

  static async update(id, data) {
    const { name, description, address, city, state, cuisineType, priceRange, phone, email, operatingHours } = data;
    const { rows } = await pool.query(
      `UPDATE restaurants SET name=$1, description=$2, address=$3, city=$4, state=$5,
       cuisine_type=$6, price_range=$7, phone=$8, email=$9, operating_hours=$10, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [name, description, address, city, state, cuisineType, priceRange, phone, email, JSON.stringify(operatingHours || {}), id]
    );
    return rows[0];
  }

  static async toggleStatus(id, isActive) {
  const { rows } = await pool.query(`UPDATE restaurants SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [isActive, id]
  );

  return rows[0];
}

  static async delete(id) {
    await pool.query('UPDATE restaurants SET is_active=false WHERE id=$1', [id]);
  }

  static async isOwner(restaurantId, userId) {
    const { rows } = await pool.query(
      'SELECT id FROM restaurants WHERE id=$1 AND user_id=$2', [restaurantId, userId]
    );
    return rows.length > 0;
  }
}

module.exports = Restaurant;