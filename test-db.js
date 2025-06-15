// server/test-db.js
const pool = require('./config/db');

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('📅 Current time from DB:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }
}

testConnection();
