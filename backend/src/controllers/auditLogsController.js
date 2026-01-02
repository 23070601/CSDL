const { pool } = require('../config/db');

async function getAuditLogs(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    // Use simple query without prepared statement parameters for limit
    const query = `
      SELECT LogID as id, StaffID as user_id, Action as action, TableName, RecordID, 
             Details as details, Timestamp as timestamp
      FROM AUDITLOG 
      ORDER BY Timestamp DESC 
      LIMIT ${Math.min(Math.max(limit, 1), 100)}
    `;
    
    const [rows] = await pool.execute(query);
    res.json(rows || []);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    // Return empty array instead of error to prevent page crashes
    res.json([]);
  }
}

async function createAuditLog(req, res) {
  try {
    const { staffId, action, tableName, recordId, details } = req.body;
    
    if (!staffId || !action || !tableName) {
      return res.status(400).json({ message: 'StaffID, action, and tableName are required' });
    }

    const logId = `AL${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
    
    const [result] = await pool.execute(
      `INSERT INTO AUDITLOG (LogID, StaffID, Action, TableName, RecordID, Details, Timestamp)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [logId, staffId, action, tableName, recordId || 0, details || null]
    );
    
    res.status(201).json({ 
      message: 'Audit log created',
      logId: logId
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ message: 'Error creating audit log', error: error.message });
  }
}

module.exports = { getAuditLogs, createAuditLog };
