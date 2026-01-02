const { pool } = require('../config/db');

async function listPurchaseOrders(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT PO.POID, PO.SupplierID, S.Name AS SupplierName, PO.StaffID, PO.OrderDate, PO.ExpectedDate, PO.Status,
              COALESCE(SUM(POD.Quantity * POD.UnitPrice), 0) AS Amount
       FROM PURCHASEORDER PO
       LEFT JOIN SUPPLIER S ON PO.SupplierID = S.SupplierID
       LEFT JOIN PURCHASEORDER_DETAILS POD ON PO.POID = POD.POID
       GROUP BY PO.POID, PO.SupplierID, S.Name, PO.StaffID, PO.OrderDate, PO.ExpectedDate, PO.Status
       ORDER BY PO.OrderDate DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error listing purchase orders:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function createPurchaseOrder(req, res) {
  try {
    const { POID, SupplierID, StaffID, OrderDate, ExpectedDate, Status } = req.body;
    if (!POID || !SupplierID) {
      return res.status(400).json({ message: 'POID and SupplierID are required' });
    }
    
    await pool.execute(
      'INSERT INTO PURCHASEORDER (POID, SupplierID, StaffID, OrderDate, ExpectedDate, Status) VALUES (?, ?, ?, ?, ?, ?)',
      [POID, SupplierID, StaffID || null, OrderDate || new Date(), ExpectedDate || null, Status || 'pending']
    );
    
    res.status(201).json({ POID, SupplierID, StaffID, OrderDate, ExpectedDate, Status });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function updatePurchaseOrder(req, res) {
  try {
    const { id } = req.params;
    const { SupplierID, StaffID, OrderDate, ExpectedDate, Status } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE PURCHASEORDER SET SupplierID = COALESCE(?, SupplierID), StaffID = COALESCE(?, StaffID), OrderDate = COALESCE(?, OrderDate), ExpectedDate = COALESCE(?, ExpectedDate), Status = COALESCE(?, Status) WHERE POID = ?',
      [SupplierID, StaffID, OrderDate, ExpectedDate, Status, id]
    );
    
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    res.json({ message: 'Purchase order updated successfully' });
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function deletePurchaseOrder(req, res) {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute('DELETE FROM PURCHASEORDER WHERE POID = ?', [id]);
    
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

module.exports = { 
  listPurchaseOrders, 
  createPurchaseOrder, 
  updatePurchaseOrder, 
  deletePurchaseOrder 
};
