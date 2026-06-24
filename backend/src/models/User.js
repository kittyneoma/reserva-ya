const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create({ email, password, firstName, lastName, phone, role = 'customer' }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, email, first_name, last_name, phone, role, created_at`,
      [email, passwordHash, firstName, lastName, phone, role]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1', [id]
    );
    return rows[0];
  }

  static async verifyPassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }
}

module.exports = User;