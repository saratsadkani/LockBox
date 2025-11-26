// server.js
require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const vaultRoutes = require('./routes/vault');
const pool = require('./config/db');   // ← להוסיף שורה זו

const app = express();

app.use(express.json());

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);

// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

// בדיקת חיבור ל-MySQL
async function testDBConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ MySQL connected successfully');
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  testDBConnection();
});
