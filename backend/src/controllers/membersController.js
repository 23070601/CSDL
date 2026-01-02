const { pool } = require('../config/db');

async function listMembers(req, res) {
  const [rows] = await pool.execute(
    `SELECT MemberID, FullName, Email, Phone, Address, MemberType, Status, CardIssueDate
     FROM MEMBER ORDER BY FullName`
  );
  res.json(rows);
}

async function getMember(req, res) {
  const { id } = req.params;
  const [rows] = await pool.execute(
    'SELECT MemberID, FullName, Email, Phone, Address, MemberType, Status, CardIssueDate FROM MEMBER WHERE MemberID = ? LIMIT 1',
    [id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
}

async function updateMember(req, res) {
  const { id } = req.params;
  const { fullName, email, phoneNumber, address, dateOfBirth, gender, linkedIn, facebook } = req.body;

  try {
    const [result] = await pool.execute(
      `UPDATE MEMBER 
       SET FullName = COALESCE(?, FullName),
           Email = COALESCE(?, Email),
           Phone = COALESCE(?, Phone),
           Address = COALESCE(?, Address)
       WHERE MemberID = ?`,
      [fullName || null, email || null, phoneNumber || null, address || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Return updated member
    const [rows] = await pool.execute(
      'SELECT MemberID, FullName, Email, Phone, Address, MemberType, Status, CardIssueDate FROM MEMBER WHERE MemberID = ? LIMIT 1',
      [id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating member', error: error.message });
  }
}

module.exports = { listMembers, getMember, updateMember };
