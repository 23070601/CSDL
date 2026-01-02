const { pool } = require('../config/db');

async function getNotifications(req, res) {
  try {
    const memberId = req.user.id; // Get from authenticated user
    const limit = parseInt(req.query.limit) || 50;
    
    const query = `
      SELECT 
        NotificationID,
        Title,
        Message,
        Type,
        CreatedAt,
        IsRead,
        MemberID
      FROM NOTIFICATION
      WHERE MemberID = ?
      ORDER BY CreatedAt DESC
      LIMIT ?
    `;
    
    const [notifications] = await pool.query(query, [memberId, limit]);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const memberId = req.user.id;
    
    const query = `
      UPDATE NOTIFICATION
      SET IsRead = true
      WHERE NotificationID = ? AND MemberID = ?
    `;
    
    await pool.query(query, [id, memberId]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
}

async function notify(req, res) {
  try {
    const { memberId, type, title, message } = req.body;
    
    // Generate notification ID
    const notificationId = `NOT${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const query = `
      INSERT INTO NOTIFICATION (NotificationID, MemberID, Type, Title, Message, IsRead, CreatedAt)
      VALUES (?, ?, ?, ?, ?, false, NOW())
    `;
    
    await pool.query(query, [notificationId, memberId, type, title, message]);
    
    res.status(201).json({ 
      status: 'created', 
      notification: {
        NotificationID: notificationId,
        MemberID: memberId,
        Type: type,
        Title: title,
        Message: message,
        IsRead: false,
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
}

module.exports = { getNotifications, markAsRead, notify };
