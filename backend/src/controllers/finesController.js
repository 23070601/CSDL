const { pool } = require('../config/db');

async function listFines(req, res) {
  try {
    const { memberId } = req.query;
    const finePerDay = Number(process.env.FINE_PER_DAY) || 1.5;
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

    // Compute outstanding overdue penalties for loans that are late and do not yet have an unpaid fine
    const [overdueLoans] = await pool.execute(
      `SELECT 
         L.LoanID,
         L.MemberID,
         M.FullName AS MemberName,
         B.Title AS BookTitle,
         L.DueDate,
         DATEDIFF(CURDATE(), L.DueDate) AS DaysOverdue
       FROM LOAN L
       INNER JOIN MEMBER M ON L.MemberID = M.MemberID
       INNER JOIN BOOKCOPY BC ON L.CopyID = BC.CopyID
       INNER JOIN BOOK B ON BC.BookID = B.BookID
       WHERE L.Status IN ('Borrowed','Overdue')
         AND L.DueDate < CURDATE()
         ${memberId ? 'AND L.MemberID = ?' : ''}
         AND NOT EXISTS (
           SELECT 1 FROM FINEPAYMENT FP
           WHERE FP.LoanID = L.LoanID AND FP.Status IN ('Unpaid','Paid')
         )`,
      memberId ? [memberId] : []
    );

    const computedOverdueFines = overdueLoans.map((loan) => ({
      PaymentID: `OVERDUE-${loan.LoanID}`,
      LoanID: loan.LoanID,
      MemberID: loan.MemberID,
      MemberName: loan.MemberName,
      Amount: Number(loan.DaysOverdue) * finePerDay,
      PaymentDate: loan.DueDate,
      Method: 'Overdue',
      Status: 'Unpaid',
      BookTitle: loan.BookTitle,
      _isComputed: true,
    }));

    res.json([...rows, ...computedOverdueFines]);
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

async function createFine(req, res) {
  try {
    const { loanId, memberId, amount, reason } = req.body;
    
    if (!memberId || !amount) {
      return res.status(400).json({ message: 'MemberID and Amount are required' });
    }

    // Verify member exists
    const [members] = await pool.execute(
      'SELECT MemberID FROM MEMBER WHERE MemberID = ?',
      [memberId]
    );
    if (!members.length) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // If loanId is provided, verify it exists
    if (loanId) {
      const [loans] = await pool.execute(
        'SELECT LoanID FROM LOAN WHERE LoanID = ?',
        [loanId]
      );
      if (!loans.length) {
        return res.status(404).json({ message: 'Loan not found' });
      }
    }

    const paymentId = `FP${Date.now()}`;
    
    await pool.execute(
      'INSERT INTO FINEPAYMENT (PaymentID, LoanID, MemberID, Amount, PaymentDate, Method, Status) VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?)',
      [paymentId, loanId || null, memberId, amount, reason || 'Manual', 'Unpaid']
    );
    
    res.status(201).json({ 
      message: 'Fine created successfully',
      PaymentID: paymentId,
      MemberID: memberId,
      Amount: amount,
      Status: 'Unpaid'
    });
  } catch (err) {
    console.error('createFine error:', err);
    res.status(500).json({ message: 'Failed to create fine', error: err.message });
  }
}

module.exports = { listFines, payFine, createFine };
