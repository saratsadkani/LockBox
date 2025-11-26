const pool = require('../config/db');

// מוצא משתמש לפי אימייל – כולל כל השדות שנחוצים ל-login ולהצפנה
async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT
       id,
       email,
       password_hash,
       kdf_salt,
       wrapped_key,
       wrapped_key_iv
     FROM users
     WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
}

// מוצא משתמש לפי id – לשימוש עתידי (למשל פרופיל משתמש)
// כאן מספיק להחזיר רק פרטים בסיסיים
async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, email FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

// יוצר משתמש חדש – שם לב לשמות השדות החדשים
async function createUser({ email, passwordHash, kdfSalt, wrappedKey, wrappedKeyIv }) {
  const [result] = await pool.query(
    `INSERT INTO users (email, password_hash, kdf_salt, wrapped_key, wrapped_key_iv)
     VALUES (?, ?, ?, ?, ?)`,
    [email, passwordHash, kdfSalt, wrappedKey, wrappedKeyIv]
  );

  return {
    id: result.insertId,
    email,
    password_hash: passwordHash,
    kdf_salt: kdfSalt,
    wrapped_key: wrappedKey,
    wrapped_key_iv: wrappedKeyIv
  };
}

module.exports = {
  findByEmail,
  findById,
  createUser
};
