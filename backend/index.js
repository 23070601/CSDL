const dotenv = require('dotenv');
const app = require('./src/app');
const { pool } = require('./src/config/db');

dotenv.config();

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await pool.query('SELECT 1');
    
    // Debug: Check MEMBER table structure
    const [columns] = await pool.query('DESCRIBE MEMBER');
    console.log('MEMBER table columns:', columns.map(c => c.Field));
    
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

start();
