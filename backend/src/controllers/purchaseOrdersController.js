const { pool } = require('../config/db');

async function listPurchaseOrders(req, res) {
  const [rows] = await pool.execute(
    `SELECT PO.POID, PO.SupplierID, S.Name AS SupplierName, PO.StaffID, PO.OrderDate, PO.ExpectedDate, PO.Status
     FROM PURCHASEORDER PO
     LEFT JOIN SUPPLIER S ON PO.SupplierID = S.SupplierID
     ORDER BY PO.OrderDate DESC`
  );
  res.json(rows);
}

module.exports = { listPurchaseOrders };
