const { pool } = require('../config/db');

async function listStaff(req, res) {
  const [rows] = await pool.execute(
    'SELECT StaffID, FullName, Email, Role, ActiveFlag FROM STAFF ORDER BY FullName'
  );
  res.json(rows);
}

module.exports = { listStaff };
