const { pool } = require('../config/db');
const { generateStaffId } = require('../utils/id');
const { hashPassword } = require('../utils/password');

async function listStaff(req, res) {
  const [rows] = await pool.execute(
    'SELECT StaffID, FullName, Email, Role, ActiveFlag FROM STAFF ORDER BY FullName'
  );
  res.json(rows);
}

async function getStaff(req, res) {
  const { id } = req.params;
  const [rows] = await pool.execute(
    'SELECT StaffID, FullName, Email, Role, ActiveFlag FROM STAFF WHERE StaffID = ? LIMIT 1',
    [id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Staff not found' });
  res.json(rows[0]);
}

async function createStaff(req, res) {
  const { fullName, email, role, status, password } = req.body;
  
  if (!fullName || !email || !role) {
    return res.status(400).json({ message: 'FullName, email, and role are required' });
  }

  try {
    const staffId = generateStaffId();
    // Use provided password or default password
    const passwordToHash = password || 'Password123!';
    const passwordHash = await hashPassword(passwordToHash);
    
    const [result] = await pool.execute(
      `INSERT INTO STAFF (StaffID, FullName, Email, Role, PasswordHash, ActiveFlag) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [staffId, fullName, email, role, passwordHash, status === 'active' ? 1 : 0]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to create staff' });
    }

    res.status(201).json({
      id: staffId,
      name: fullName,
      email: email,
      role: role,
      status: status || 'active',
      joinDate: new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ message: 'Error creating staff', error: error.message });
  }
}

async function updateStaff(req, res) {
  const { id } = req.params;
  const { fullName, email, phoneNumber, address, dateOfBirth, gender, linkedIn, facebook } = req.body;

  try {
    const [result] = await pool.execute(
      `UPDATE STAFF 
       SET FullName = COALESCE(?, FullName),
           Email = COALESCE(?, Email)
       WHERE StaffID = ?`,
      [fullName || null, email || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Return updated staff
    const [rows] = await pool.execute(
      'SELECT StaffID, FullName, Email, Role, ActiveFlag FROM STAFF WHERE StaffID = ? LIMIT 1',
      [id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff', error: error.message });
  }
}

module.exports = { listStaff, getStaff, createStaff, updateStaff };
