const pool = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT id, email, password FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT id, email FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createUser({ email, password }) {
  const [result] = await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, password]);
  return { id: result.insertId, email };
}

module.exports = {
  findByEmail,
  findById,
  createUser
};
