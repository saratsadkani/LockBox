const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const {
  createWrappedVaultKeyFromPassword,
  deriveVaultKeyFromPassword
} = require('../utils/crypto');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash לכניסה רגילה
    const passwordHash = await bcrypt.hash(password, 10);

    // יצירת salt + vault key מוצפן מה-master password
    const {
      saltB64,
      wrappedKeyB64,
      wrappedKeyIvB64
    } = createWrappedVaultKeyFromPassword(password);

    // שמירת המשתמש במסד הנתונים
    const user = await userModel.createUser({
      email,
      passwordHash,
      kdfSalt: saltB64,
      wrappedKey: wrappedKeyB64,
      wrappedKeyIv: wrappedKeyIvB64
    });

    return res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // בדיקת סיסמה רגילה מול ה-hash
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // הפקת vault key מה-master password ומהשדות שנשמרו ב-DB
    const vaultKey = deriveVaultKeyFromPassword(
      password,
      user.kdf_salt,
      user.wrapped_key,
      user.wrapped_key_iv
    );

    const vaultKeyB64 = vaultKey.toString('base64');

    // שימי לב: מוסיפים גם vaultKey ל-JWT, וגם userId בשם ברור
    const token = jwt.sign(
      { userId: user.id, vaultKey: vaultKeyB64 },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ token });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
