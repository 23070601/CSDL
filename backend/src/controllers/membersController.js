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

module.exports = { listMembers, getMember };
