const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await userModel.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({ email, password: hashed });
    return res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await userModel.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
