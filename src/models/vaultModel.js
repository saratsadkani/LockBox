const pool = require('../config/db');

async function getItemsByUserId(userId) {
  const [rows] = await pool.query('SELECT id, title, username, password, url, notes, created_at, updated_at FROM vault_items WHERE user_id = ?', [userId]);
  return rows;
}

async function getItemById(userId, id) {
  const [rows] = await pool.query('SELECT id, title, username, password, url, notes, created_at, updated_at FROM vault_items WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0] || null;
}

async function createItem(userId, data) {
  const { title, username, password, url, notes } = data;
  const [result] = await pool.query(
    'INSERT INTO vault_items (user_id, title, username, password, url, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, title || null, username || null, password || null, url || null, notes || null]
  );
  return { id: result.insertId, user_id: userId, ...data };
}

async function updateItem(userId, id, data) {
  const { title, username, password, url, notes } = data;
  await pool.query(
    'UPDATE vault_items SET title = ?, username = ?, password = ?, url = ?, notes = ? WHERE id = ? AND user_id = ?',
    [title || null, username || null, password || null, url || null, notes || null, id, userId]
  );
  return getItemById(userId, id);
}

async function deleteItem(userId, id) {
  const [result] = await pool.query('DELETE FROM vault_items WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
}

module.exports = {
  getItemsByUserId,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
