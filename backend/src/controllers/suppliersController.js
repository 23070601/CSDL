const { pool } = require('../config/db');

async function listSuppliers(req, res) {
  const [rows] = await pool.execute(
    'SELECT SupplierID, Name, Contact, Email, Phone, Address FROM SUPPLIER ORDER BY Name'
  );
  res.json(rows);
}

async function createSupplier(req, res) {
  const { SupplierID, Name, Contact, Email, Phone, Address } = req.body;
  if (!SupplierID || !Name) return res.status(400).json({ message: 'SupplierID and Name are required' });
  await pool.execute(
    'INSERT INTO SUPPLIER (SupplierID, Name, Contact, Email, Phone, Address) VALUES (?, ?, ?, ?, ?, ?)',
    [SupplierID, Name, Contact || null, Email || null, Phone || null, Address || null]
  );
  res.status(201).json({ SupplierID, Name, Contact, Email, Phone, Address });
}

async function updateSupplier(req, res) {
  const { id } = req.params;
  const { Name, Contact, Email, Phone, Address } = req.body;
  const [result] = await pool.execute(
    'UPDATE SUPPLIER SET Name = COALESCE(?, Name), Contact = COALESCE(?, Contact), Email = COALESCE(?, Email), Phone = COALESCE(?, Phone), Address = COALESCE(?, Address) WHERE SupplierID = ?',
    [Name, Contact, Email, Phone, Address, id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Updated' });
}

async function deleteSupplier(req, res) {
  const { id } = req.params;
  const [result] = await pool.execute('DELETE FROM SUPPLIER WHERE SupplierID = ?', [id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
}

module.exports = { listSuppliers, createSupplier, updateSupplier, deleteSupplier };
