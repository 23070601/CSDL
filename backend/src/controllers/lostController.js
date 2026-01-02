const { pool } = require('../config/db');
const { generateLostId, generateLogId } = require('../utils/id');

async function reportLost(req, res) {
  const { LoanID, CopyID, MemberID, CompensationAmount } = req.body;
  if (!LoanID || !CopyID || !MemberID) {
    return res.status(400).json({ message: 'LoanID, CopyID, MemberID are required' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [loanRows] = await conn.execute('SELECT Status FROM LOAN WHERE LoanID = ? FOR UPDATE', [LoanID]);
    if (!loanRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Loan not found' });
    }

    const [copyRows] = await conn.execute('SELECT Status FROM BOOKCOPY WHERE CopyID = ? FOR UPDATE', [CopyID]);
    if (!copyRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Copy not found' });
    }

    const reportId = generateLostId();
    await conn.execute(
      'INSERT INTO LOSTREPORT (ReportID, LoanID, CopyID, MemberID, ReportDate, CompensationAmount, Status) VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?)',
      [reportId, LoanID, CopyID, MemberID, CompensationAmount || 0, 'Reported']
    );

    await conn.execute('UPDATE BOOKCOPY SET Status = ? WHERE CopyID = ?', ['Lost', CopyID]);

    const logId = generateLogId();
    await conn.execute(
      'INSERT INTO AUDITLOG (LogID, StaffID, Action, TableName, RecordID, Timestamp, Details) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)',
      [logId, 'ST001', 'UPDATE', 'LostReport', 0, `Lost report ${reportId} for Loan ${LoanID}`]
    );

    await conn.commit();
    res.status(201).json({ ReportID: reportId, LoanID, CopyID, MemberID });
  } catch (err) {
    await conn.rollback();
    console.error('reportLost error', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
}

module.exports = { reportLost };
