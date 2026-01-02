const { pool } = require('../config/db');
const { generateLogId, generateLoanId } = require('../utils/id');

async function createLoan(req, res) {
  const { MemberID, BookID, CopyID, StaffID, DueDate } = req.body;
  
  // Support both BookID (auto-find copy) and CopyID (specific copy)
  if (!MemberID || (!BookID && !CopyID)) {
    return res.status(400).json({ message: 'MemberID and either BookID or CopyID are required' });
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

    // Find available copy if BookID provided
    let availableCopyID = CopyID;
    if (BookID && !CopyID) {
      const [copyRows] = await conn.execute(
        'SELECT CopyID FROM BOOKCOPY WHERE BookID = ? AND Status = ? LIMIT 1 FOR UPDATE',
        [BookID, 'Available']
      );
      if (!copyRows.length) {
        await conn.rollback();
        return res.status(400).json({ message: 'No available copies for this book' });
      }
      availableCopyID = copyRows[0].CopyID;
    }

    // Verify copy exists and is available
    const [copyRows] = await conn.execute('SELECT Status FROM BOOKCOPY WHERE CopyID = ? FOR UPDATE', [availableCopyID]);
    if (!copyRows.length || copyRows[0].Status !== 'Available') {
      await conn.rollback();
      return res.status(400).json({ message: 'Copy not available' });
    }

    // Calculate due date (14 days from today if not provided)
    let finalDueDate = DueDate;
    if (!finalDueDate) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      finalDueDate = dueDate.toISOString().split('T')[0];
    }

    // Use provided StaffID or default to system staff
    const staffId = StaffID || 'ST001';

    await conn.execute(
      'INSERT INTO LOAN (LoanID, MemberID, CopyID, StaffID, LoanDate, DueDate, Status) VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?)',
      [loanId, MemberID, availableCopyID, staffId, finalDueDate, 'Borrowed']
    );

    await conn.execute('UPDATE BOOKCOPY SET Status = ? WHERE CopyID = ?', ['Borrowed', availableCopyID]);

    await conn.commit();
    res.status(201).json({ LoanID: loanId, MemberID, CopyID: availableCopyID, StaffID: staffId, DueDate: finalDueDate });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    console.error('createLoan error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
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
    try {
      await conn.rollback();
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    console.error('returnLoan error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
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
      `SELECT L.LoanID, L.CopyID, L.MemberID, L.DueDate, L.Status, BC.BookID
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
      'UPDATE LOAN SET DueDate = DATE_ADD(DueDate, INTERVAL 14 DAY) WHERE LoanID = ?',
      [id]
    );

    await conn.commit();
    res.json({ message: 'Renewed', LoanID: id });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    console.error('renewLoan error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    conn.release();
  }
}

async function getLoans(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT L.LoanID, L.MemberID, L.CopyID, L.StaffID, L.LoanDate, L.DueDate, L.ReturnDate, L.Status,
              M.FullName AS memberName,
              B.Title AS bookTitle, B.ISBN,
              BC.Status AS copyStatus
       FROM LOAN L
       LEFT JOIN MEMBER M ON L.MemberID = M.MemberID
       LEFT JOIN BOOKCOPY BC ON L.CopyID = BC.CopyID
       LEFT JOIN BOOK B ON BC.BookID = B.BookID
       ORDER BY L.LoanDate DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('getLoans error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function getLoan(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT L.LoanID, L.MemberID, L.CopyID, L.StaffID, L.LoanDate, L.DueDate, L.ReturnDate, L.Status,
              M.FullName AS memberName,
              B.Title AS bookTitle, B.ISBN,
              BC.Status AS copyStatus
       FROM LOAN L
       LEFT JOIN MEMBER M ON L.MemberID = M.MemberID
       LEFT JOIN BOOKCOPY BC ON L.CopyID = BC.CopyID
       LEFT JOIN BOOK B ON BC.BookID = B.BookID
       WHERE L.LoanID = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Loan not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getLoan error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { createLoan, returnLoan, renewLoan, getLoans, getLoan };
