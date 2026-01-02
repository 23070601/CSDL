// In-memory notifications store (persisted per session)
let notificationsStore = [
  {
    NotificationID: 'NOT001',
    Message: 'Welcome to the Library Management System',
    Timestamp: new Date().toISOString(),
    Read: false,
  },
  {
    NotificationID: 'NOT002',
    Message: 'You have 2 overdue books',
    Timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    Read: false,
  },
  {
    NotificationID: 'NOT003',
    Message: 'A reserved book is ready for pickup',
    Timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    Read: true,
  },
];

async function getNotifications(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const notifications = notificationsStore.slice(0, limit);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const notification = notificationsStore.find(n => n.NotificationID === id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.Read = true;
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
}

async function notify(req, res) {
  try {
    const { type, target, message } = req.body;
    
    // Create new notification
    const notificationId = `NOT${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
    const newNotification = {
      NotificationID: notificationId,
      Message: message || `New ${type} notification`,
      Timestamp: new Date().toISOString(),
      Read: false,
      Type: type,
      Target: target,
    };
    
    // Add to store
    notificationsStore.unshift(newNotification);
    
    // Keep only last 100 notifications
    if (notificationsStore.length > 100) {
      notificationsStore = notificationsStore.slice(0, 100);
    }
    
    res.status(201).json({ status: 'created', notification: newNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
}

module.exports = { getNotifications, markAsRead, notify };
