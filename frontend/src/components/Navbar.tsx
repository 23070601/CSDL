import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/utils/api';
import { FiMenu, FiX, FiLogOut, FiBell, FiUser } from 'react-icons/fi';

interface Notification {
  id?: string;
  NotificationID?: string;
  message?: string;
  Message?: string;
  timestamp?: string;
  Timestamp?: string;
  read?: boolean;
  Read?: boolean;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (isNotificationOpen) {
      fetchNotifications();
    }
  }, [isNotificationOpen]);

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const response = await apiClient.getNotifications({ limit: 10 });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !(n.read || n.Read)).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <nav className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="container-main flex justify-between items-center py-3">
          <Link to="/" className="text-h4 font-bold text-primary-600 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span>LMS</span>
          </Link>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="btn-primary text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-outline text-sm"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  const dashboardLink = {
    admin: '/admin/dashboard',
    librarian: '/librarian/dashboard',
    assistant: '/librarian/dashboard',
    member: '/member/dashboard',
  }[user.role] || '/';

  const profileLink = {
    admin: '/admin/profile',
    librarian: '/librarian/profile',
    assistant: '/librarian/profile',
    member: '/member/profile',
  }[user.role] || '/';

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50">
      <div className="container-main">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link to={dashboardLink} className="text-h4 font-bold text-primary-600 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span>LMS</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <span className="text-p4 text-neutral-600">
              {user.fullName || 'User'} <span className="text-neutral-400">({user.role})</span>
            </span>
            {/* Notification Button with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors relative"
              >
                <FiBell size={20} className="text-neutral-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                  <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
                    <h3 className="text-p5 font-semibold text-neutral-900">Notifications</h3>
                    <button 
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notificationLoading ? (
                      <div className="p-4 text-center text-neutral-500 text-p4">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-neutral-500 text-p4">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id || notif.NotificationID} 
                          className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors ${
                            notif.read || notif.Read ? 'opacity-70' : 'bg-blue-50'
                          }`}
                        >
                          <p className="text-p4 text-neutral-700">{notif.message || notif.Message || 'No message'}</p>
                          <p className="text-p5 text-neutral-500 mt-1">
                            {notif.timestamp || notif.Timestamp 
                              ? new Date(notif.timestamp || notif.Timestamp || '').toLocaleDateString()
                              : 'Unknown time'
                            }
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-neutral-200 text-center">
                    <button 
                      onClick={() => {
                        navigate(user.role === 'member' ? '/member/notifications' : '/admin/dashboard');
                        setIsNotificationOpen(false);
                      }}
                      className="text-primary-600 hover:text-primary-700 text-p4 font-semibold"
                    >
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate(profileLink)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <FiUser size={20} className="text-neutral-600" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
            >
              <FiLogOut size={18} />
              <span className="text-p4">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-neutral-100 rounded-lg"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-neutral-200">
            <div className="flex flex-col gap-4 pt-4">
              <span className="text-p4 text-neutral-600 px-4">
                {user.fullName}
              </span>
              <button 
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-left hover:bg-neutral-50 rounded-lg w-full"
              >
                <FiBell size={18} />
                <span className="text-p4">Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  navigate(profileLink);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-left hover:bg-neutral-50 rounded-lg w-full"
              >
                <FiUser size={18} />
                <span className="text-p4">Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-left text-secondary-600 hover:bg-secondary-50 rounded-lg w-full"
              >
                <FiLogOut size={18} />
                <span className="text-p4">Logout</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Mobile Notification Dropdown */}
        {isNotificationOpen && isOpen && (
          <div className="md:hidden bg-white border-t border-neutral-200 p-4">
            <h3 className="text-p5 font-semibold text-neutral-900 mb-3">Notifications</h3>
            {notificationLoading ? (
              <p className="text-center text-neutral-500 text-p4">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-center text-neutral-500 text-p4">No notifications</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id || notif.NotificationID}
                    className="p-3 bg-neutral-50 rounded-lg"
                  >
                    <p className="text-p4 text-neutral-700">{notif.message || notif.Message}</p>
                    <p className="text-p5 text-neutral-500 mt-1">
                      {notif.timestamp || notif.Timestamp 
                        ? new Date(notif.timestamp || notif.Timestamp || '').toLocaleDateString()
                        : 'Unknown time'
                      }
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
