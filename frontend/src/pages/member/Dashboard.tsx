import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/utils/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

interface DashboardStats {
  activeLoans: number;
  overdueLoans: number;
  reservations: number;
  totalFines: number;
  unreadNotifications: number;
  recentLoans: any[];
}

export default function MemberDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    activeLoans: 0,
    overdueLoans: 0,
    reservations: 0,
    totalFines: 0,
    unreadNotifications: 0,
    recentLoans: [],
  });
  const [loading, setLoading] = useState(true);

  const sidebarItems = [
    { label: 'Dashboard', path: '/member/dashboard', icon: '📊' },
    { label: 'Search Books', path: '/member/books', icon: '📚' },
    { label: 'My Profile', path: '/member/profile', icon: '👤' },
    { label: 'My Loans', path: '/member/loans', icon: '📖' },
    { label: 'My Reservations', path: '/member/reservations', icon: '📋' },
    { label: 'My Fines', path: '/member/fines', icon: '💳' },
    { label: 'Notifications', path: '/member/notifications', icon: '🔔' },
  ];

  useEffect(() => {
    if (user?.id) {
      fetchDashboardStats();
    }
  }, [user?.id]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [loansRes, reservationsRes, finesRes, notificationsRes] = await Promise.all([
        apiClient.getLoans(),
        apiClient.getReservations(),
        apiClient.getFines(),
        apiClient.getNotifications(),
      ]);

      const memberLoans = (loansRes.data || []).filter((l: any) => l.MemberID === user?.id);
      const memberReservations = (reservationsRes.data || []).filter((r: any) => r.MemberID === user?.id);
      const memberFines = (finesRes.data || []).filter((f: any) => f.MemberID === user?.id);
      const memberNotifications = (notificationsRes.data || []).filter((n: any) => n.MemberID === user?.id);

      const activeLoans = memberLoans.filter((l: any) => !l.ReturnDate);
      const overdueLoans = activeLoans.filter((l: any) => new Date(l.DueDate) < new Date());
      const totalFines = memberFines
        .filter((f: any) => !f.DatePaid)
        .reduce((sum: number, f: any) => sum + (parseFloat(f.Amount) || 0), 0);
      const unreadNotifications = memberNotifications.filter((n: any) => !n.IsRead).length;

      setStats({
        activeLoans: activeLoans.length,
        overdueLoans: overdueLoans.length,
        reservations: memberReservations.length,
        totalFines,
        unreadNotifications,
        recentLoans: memberLoans.slice(0, 3),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="p-6 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-h2 text-neutral-900 mb-2">Welcome, {user?.name}</h1>
          <p className="text-p4 text-neutral-600 mb-8">Here's your library overview</p>

          {loading ? (
            <div className="card text-center py-8">
              <p className="text-p4 text-neutral-600">Loading your dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-p5 text-neutral-500 mb-2">Active Loans</p>
                      <p className="text-h4 text-neutral-900 font-bold">{stats.activeLoans}</p>
                      {stats.overdueLoans > 0 && (
                        <p className="text-tag-sm text-status-error font-semibold mt-1">{stats.overdueLoans} overdue</p>
                      )}
                    </div>
                    <div className="text-3xl">📖</div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-p5 text-neutral-500 mb-2">Reservations</p>
                      <p className="text-h4 text-neutral-900 font-bold">{stats.reservations}</p>
                    </div>
                    <div className="text-3xl">📋</div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-p5 text-neutral-500 mb-2">Fines Owed</p>
                      <p className="text-h4 text-neutral-900 font-bold">${stats.totalFines.toFixed(2)}</p>
                      {stats.totalFines > 0 && (
                        <p className="text-tag-sm text-status-warning font-semibold mt-1">Payment pending</p>
                      )}
                    </div>
                    <div className="text-3xl">{stats.totalFines > 0 ? '⚠️' : '✅'}</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card mb-8">
                <h2 className="text-h5 text-neutral-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/member/books')}
                    className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
                  >
                    Search Books
                  </button>
                  <button
                    onClick={() => navigate('/member/loans')}
                    className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
                  >
                    View My Loans
                  </button>
                  <button
                    onClick={() => navigate('/member/fines')}
                    className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
                  >
                    Pay Fines
                  </button>
                </div>
              </div>

              {/* Notifications Alert */}
              {stats.unreadNotifications > 0 && (
                <div className="card mb-8 bg-status-warning-bg border-l-4 border-status-warning">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-p4 font-semibold text-neutral-900">
                        You have {stats.unreadNotifications} unread notification{stats.unreadNotifications !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/member/notifications')}
                      className="text-primary-600 font-semibold hover:underline"
                    >
                      View →
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Loans */}
              <div className="card">
                <h2 className="text-h5 text-neutral-900 mb-6">Recent Loans</h2>
                {stats.recentLoans.length === 0 ? (
                  <p className="text-p4 text-neutral-600">
                    You have not borrowed any books yet. <a href="/member/books" className="text-primary-600 font-semibold">Browse our collection</a>.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentLoans.map((loan: any) => (
                      <div key={loan.LoanID} className="flex justify-between items-center py-3 border-b border-neutral-200 last:border-0">
                        <div>
                          <p className="text-p4 font-semibold text-neutral-900">{loan.bookTitle}</p>
                          <p className="text-tag-sm text-neutral-500">Borrowed: {new Date(loan.LoanDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-tag-sm font-semibold ${
                          new Date(loan.DueDate) < new Date() && !loan.ReturnDate
                            ? 'bg-status-error-bg text-status-error'
                            : loan.ReturnDate
                            ? 'bg-status-success-bg text-status-success'
                            : 'bg-status-warning-bg text-status-warning'
                        }`}>
                          {loan.ReturnDate ? 'Returned' : new Date(loan.DueDate) < new Date() ? 'Overdue' : 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
