const { pool } = require('../config/db');

async function listFines(req, res) {
  const { memberId } = req.query;
  const sql = `SELECT PaymentID, LoanID, MemberID, Amount, PaymentDate, Method, Status
               FROM FINEPAYMENT
               ${memberId ? 'WHERE MemberID = ?' : ''}
               ORDER BY PaymentDate DESC`;
  const params = memberId ? [memberId] : [];
  const [rows] = await pool.execute(sql, params);
  res.json(rows);
}

async function payFine(req, res) {
  const { LoanID, MemberID, Amount, Method } = req.body;
  if (!LoanID || !MemberID || !Amount || !Method) {
    return res.status(400).json({ message: 'LoanID, MemberID, Amount, Method are required' });
  }
  const paymentId = `FP${Date.now().toString().slice(-6)}`;
  await pool.execute(
    'INSERT INTO FINEPAYMENT (PaymentID, LoanID, MemberID, Amount, PaymentDate, Method, Status) VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?)',
    [paymentId, LoanID, MemberID, Amount, Method, 'Paid']
  );
  res.status(201).json({ PaymentID: paymentId, LoanID, MemberID, Amount, Method, Status: 'Paid' });
}

module.exports = { listFines, payFine };
