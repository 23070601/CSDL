const { pool } = require('../config/db');
const { generateLogId, generateLoanId } = require('../utils/id');

async function createLoan(req, res) {
  const { MemberID, CopyID, StaffID, DueDate } = req.body;
  if (!MemberID || !CopyID || !StaffID || !DueDate) {
    return res.status(400).json({ message: 'MemberID, CopyID, StaffID, DueDate are required' });
  }
  const loanId = generateLoanId();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check member status and active loans limit
    const [memberRows] = await conn.execute('SELECT Status FROM MEMBER WHERE MemberID = ? FOR UPDATE', [MemberID]);
    if (!memberRows.length || memberRows[0].Status === 'Locked') {
      await conn.rollback();
      return res.status(400).json({ message: 'Member not eligible' });
    }
    const [activeLoanCount] = await conn.execute(
      "SELECT COUNT(*) AS cnt FROM LOAN WHERE MemberID = ? AND Status IN ('Borrowed','Overdue')",
      [MemberID]
    );
    if (activeLoanCount[0].cnt >= 5) {
      await conn.rollback();
      return res.status(400).json({ message: 'Max active loans reached' });
    }

    const [copyRows] = await conn.execute('SELECT Status FROM BOOKCOPY WHERE CopyID = ? FOR UPDATE', [CopyID]);
    if (!copyRows.length || copyRows[0].Status !== 'Available') {
      await conn.rollback();
      return res.status(400).json({ message: 'Copy not available' });
    }

    await conn.execute(
      'INSERT INTO LOAN (LoanID, MemberID, CopyID, StaffID, LoanDate, DueDate, Status) VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?)',
      [loanId, MemberID, CopyID, StaffID, DueDate, 'Borrowed']
    );

    await conn.execute('UPDATE BOOKCOPY SET Status = ? WHERE CopyID = ?', ['Borrowed', CopyID]);

    await conn.commit();
    res.status(201).json({ LoanID: loanId, MemberID, CopyID, StaffID, DueDate });
  } catch (err) {
    await conn.rollback();
    console.error('createLoan error', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
}

async function returnLoan(req, res) {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [loanRows] = await conn.execute('SELECT CopyID, Status FROM LOAN WHERE LoanID = ? FOR UPDATE', [id]);
    if (!loanRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Loan not found' });
    }
    if (loanRows[0].Status !== 'Borrowed') {
      await conn.rollback();
      return res.status(400).json({ message: 'Loan already processed' });
    }

    await conn.execute('UPDATE LOAN SET ReturnDate = CURRENT_DATE, Status = ? WHERE LoanID = ?', ['Returned', id]);
    await conn.execute('UPDATE BOOKCOPY SET Status = ? WHERE CopyID = ?', ['Available', loanRows[0].CopyID]);

    const logId = generateLogId();
    await conn.execute(
      'INSERT INTO AUDITLOG (LogID, StaffID, Action, TableName, RecordID, Timestamp, Details) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)',
      [logId, 'ST001', 'UPDATE', 'Loan', 4, `Book returned for LoanID=${id}`]
    );

    await conn.commit();
    res.json({ message: 'Returned', LoanID: id });
  } catch (err) {
    await conn.rollback();
    console.error('returnLoan error', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
}

async function renewLoan(req, res) {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [loanRows] = await conn.execute(
      `SELECT L.LoanID, L.CopyID, L.MemberID, L.DueDate, L.Status, L.RenewalCount, BC.BookID
       FROM LOAN L
       INNER JOIN BOOKCOPY BC ON L.CopyID = BC.CopyID
       WHERE L.LoanID = ? FOR UPDATE`,
      [id]
    );
    if (!loanRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Loan not found' });
    }
    const loan = loanRows[0];
    if (loan.Status !== 'Borrowed') {
      await conn.rollback();
      return res.status(400).json({ message: 'Loan not eligible for renewal' });
    }
    if (loan.RenewalCount >= 2) {
      await conn.rollback();
      return res.status(400).json({ message: 'Renewal limit reached' });
    }

    // Check member status
    const [memberRows] = await conn.execute('SELECT Status FROM MEMBER WHERE MemberID = ? FOR UPDATE', [loan.MemberID]);
    if (!memberRows.length || memberRows[0].Status === 'Locked') {
      await conn.rollback();
      return res.status(400).json({ message: 'Member locked or not found' });
    }

    // Ensure no active reservations for this book
    const [reservations] = await conn.execute(
      'SELECT 1 FROM RESERVATION WHERE BookID = ? AND Status = ? LIMIT 1',
      [loan.BookID, 'Active']
    );
    if (reservations.length) {
      await conn.rollback();
      return res.status(400).json({ message: 'Cannot renew due to active reservation' });
    }

    await conn.execute(
      'UPDATE LOAN SET DueDate = DATE_ADD(DueDate, INTERVAL 14 DAY), RenewalCount = RenewalCount + 1 WHERE LoanID = ?',
      [id]
    );

    await conn.commit();
    res.json({ message: 'Renewed', LoanID: id });
  } catch (err) {
    await conn.rollback();
    console.error('renewLoan error', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
}

module.exports = { createLoan, returnLoan, renewLoan };
