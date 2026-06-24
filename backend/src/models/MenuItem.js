const pool = require('../config/database');

class MenuItem {
  static async findByRestaurant(restaurantId) {
    const { rows } = await pool.query(
      'SELECT * FROM menu_items WHERE restaurant_id=$1 AND is_available=true ORDER BY category, name',
      [restaurantId]
    );
    return rows;
  }

  static async findCategories(restaurantId) {
    const { rows } = await pool.query(
      'SELECT DISTINCT category FROM menu_items WHERE restaurant_id=$1 AND is_available=true ORDER BY category',
      [restaurantId]
    );
    return rows.map(r => r.category);
  }

  static async create({ restaurantId, name, description, category, price, imageUrl }) {
    const { rows } = await pool.query(
      `INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [restaurantId, name, description, category, price, imageUrl]
    );
    return rows[0];
  }

  static async update(id, { name, description, category, price, imageUrl, isAvailable }) {
    const { rows } = await pool.query(
      `UPDATE menu_items SET name=$1, description=$2, category=$3, price=$4, image_url=$5, is_available=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, description, category, price, imageUrl, isAvailable, id]
    );
    return rows[0];
  }

  static async delete(id) {
    await pool.query('UPDATE menu_items SET is_available=false WHERE id=$1', [id]);
  }
}

module.exports = MenuItem;