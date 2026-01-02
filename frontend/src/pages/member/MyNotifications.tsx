import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/utils/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';

interface Notification {
  NotificationID: string;
  Title: string;
  Message: string;
  Type: string;
  CreatedAt: string;
  IsRead: boolean;
}

export default function MyNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const sidebarItems = [
    { label: 'Dashboard', path: '/member/dashboard', icon: '📊' },
    { label: 'Search Books', path: '/member/books', icon: '🔍' },
    { label: 'My Profile', path: '/member/profile', icon: '👤' },
    { label: 'My Loans', path: '/member/loans', icon: '📖' },
    { label: 'My Reservations', path: '/member/reservations', icon: '📋' },
    { label: 'My Fines', path: '/member/fines', icon: '💳' },
    { label: 'Notifications', path: '/member/notifications', icon: '🔔' },
  ];

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getNotifications();
      const memberNotifications = (response.data || []).filter((n: any) => n.MemberID === user?.id);
      setNotifications(memberNotifications.sort((a: any, b: any) => 
        new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
      ));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.NotificationID === notificationId ? { ...n, IsRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.IsRead;
    if (filter === 'read') return n.IsRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.IsRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'loan':
        return '📖';
      case 'reservation':
        return '📋';
      case 'fine':
        return '💳';
      case 'alert':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="p-6 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-h2 text-neutral-900">My Notifications</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-tag-sm font-semibold bg-status-warning-bg text-status-warning">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {(['all', 'unread', 'read'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-primary-600'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="card text-center py-8">
              <p className="text-p4 text-neutral-600">Loading your notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-p4 text-neutral-600">You have no {filter === 'all' ? 'notifications' : filter} notifications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.NotificationID}
                  className={`card transition-opacity ${
                    notification.IsRead ? 'opacity-75' : 'border-l-4 border-primary-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-2xl mt-1">{getNotificationIcon(notification.Type)}</div>
                      <div className="flex-1">
                        <h3 className={`text-h5 ${
                          notification.IsRead ? 'text-neutral-600' : 'text-neutral-900 font-semibold'
                        }`}>
                          {notification.Title}
                        </h3>
                        <p className={`mt-1 ${
                          notification.IsRead ? 'text-neutral-500' : 'text-neutral-700'
                        }`}>
                          {notification.Message}
                        </p>
                        <p className="text-p5 text-neutral-500 mt-2">
                          {new Date(notification.CreatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notification.IsRead && (
                      <Button
                        onClick={() => handleMarkAsRead(notification.NotificationID)}
                        variant="primary"
                        size="sm"
                        className="ml-4 flex-shrink-0"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
