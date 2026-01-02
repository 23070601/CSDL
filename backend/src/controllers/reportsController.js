const { pool } = require('../config/db');

async function popularBooks(req, res) {
  const [rows] = await pool.query(
    `SELECT B.BookID, B.Title, B.Publisher,
            COUNT(L.LoanID) AS TotalLoans,
            COUNT(CASE WHEN L.Status = 'Returned' THEN 1 END) AS ReturnedLoans,
            COUNT(CASE WHEN L.Status = 'Borrowed' THEN 1 END) AS CurrentLoans,
            COUNT(CASE WHEN BC.Status = 'Available' THEN 1 END) AS AvailableCopies,
            COUNT(BC.CopyID) AS TotalCopies
     FROM BOOK B
     INNER JOIN BOOKCOPY BC ON B.BookID = BC.BookID
     INNER JOIN LOAN L ON BC.CopyID = L.CopyID
     GROUP BY B.BookID, B.Title, B.Publisher
     HAVING COUNT(L.LoanID) > 2
     ORDER BY TotalLoans DESC, AvailableCopies ASC`
  );
  res.json(rows);
}

async function memberStatus(req, res) {
  const [rows] = await pool.query(
    `SELECT 
        M.MemberID,
        M.FullName,
        M.Email,
        M.MemberType,
        COUNT(DISTINCT L.LoanID) AS TotalLoans,
        COUNT(DISTINCT CASE WHEN L.Status = 'Borrowed' THEN L.LoanID END) AS ActiveLoans,
        COUNT(DISTINCT FP.PaymentID) AS PaymentCount,
        COALESCE(SUM(FP.Amount), 0) AS TotalAmountPaid,
        CASE 
            WHEN COUNT(DISTINCT CASE WHEN L.Status = 'Borrowed' THEN L.LoanID END) > 2 THEN 'Heavy User'
            WHEN COUNT(DISTINCT CASE WHEN L.Status = 'Borrowed' THEN L.LoanID END) > 0 THEN 'Regular User'
            ELSE 'Inactive'
        END AS UserType
     FROM MEMBER M
     LEFT JOIN LOAN L ON M.MemberID = L.MemberID
     LEFT JOIN FINEPAYMENT FP ON M.MemberID = FP.MemberID
     GROUP BY M.MemberID, M.FullName, M.Email, M.MemberType`
  );
  res.json(rows);
}

async function supplierPerformance(req, res) {
  const [rows] = await pool.query(
    `SELECT 
        S.SupplierID,
        S.Name,
        COUNT(DISTINCT PO.POID) AS TotalOrders,
        COUNT(CASE WHEN PO.Status = 'Received' THEN 1 END) AS ReceivedOrders,
        COUNT(CASE WHEN PO.Status = 'Pending' THEN 1 END) AS PendingOrders,
        COUNT(CASE WHEN PO.Status = 'Cancelled' THEN 1 END) AS CancelledOrders,
        ROUND(COUNT(CASE WHEN PO.Status = 'Received' THEN 1 END) * 100.0 / COUNT(DISTINCT PO.POID), 1) AS DeliveryRate
     FROM SUPPLIER S
     LEFT JOIN PURCHASEORDER PO ON S.SupplierID = PO.SupplierID
     GROUP BY S.SupplierID, S.Name
     HAVING COUNT(DISTINCT PO.POID) > 0
     ORDER BY DeliveryRate DESC`
  );
  res.json(rows);
}

module.exports = { popularBooks, memberStatus, supplierPerformance };
