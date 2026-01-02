const { pool } = require('../config/db');

async function listFines(req, res) {
  try {
    const { memberId } = req.query;
    const sql = `SELECT 
                   FP.PaymentID,
                   FP.LoanID,
                   FP.MemberID,
                   M.FullName AS MemberName,
                   FP.Amount,
                   FP.PaymentDate,
                   FP.Method,
                   FP.Status,
                   B.Title AS BookTitle
                 FROM FINEPAYMENT FP
                 INNER JOIN MEMBER M ON FP.MemberID = M.MemberID
                 LEFT JOIN LOAN L ON FP.LoanID = L.LoanID
                 LEFT JOIN BOOKCOPY BC ON L.CopyID = BC.CopyID
                 LEFT JOIN BOOK B ON BC.BookID = B.BookID
                 ${memberId ? 'WHERE FP.MemberID = ?' : ''}
                 ORDER BY FP.PaymentDate DESC`;
    const params = memberId ? [memberId] : [];
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('listFines error:', err);
    res.status(500).json({ message: 'Failed to retrieve fines', error: err.message });
  }
}

async function payFine(req, res) {
  try {
    const { LoanID, MemberID, Amount, Method } = req.body;
    if (!LoanID || !MemberID || !Amount || !Method) {
      return res.status(400).json({ message: 'LoanID, MemberID, Amount, Method are required' });
    }
    const paymentId = Math.floor(Math.random() * 1000000);
    await pool.execute(
      'INSERT INTO FINEPAYMENT (LoanID, MemberID, Amount, PaymentDate, Method, Status) VALUES (?, ?, ?, CURRENT_DATE, ?, ?)',
      [LoanID, MemberID, Amount, Method, 'Paid']
    );
    res.status(201).json({ PaymentID: paymentId, LoanID, MemberID, Amount, Method, Status: 'Paid' });
  } catch (err) {
    console.error('payFine error:', err);
    res.status(500).json({ message: 'Failed to process fine payment', error: err.message });
  }
}

module.exports = { listFines, payFine };
