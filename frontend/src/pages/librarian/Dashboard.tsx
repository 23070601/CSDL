import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/utils/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LibrarianDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeLoans: 0,
    pendingReservations: 0,
    overdueBooks: 0,
    finesPending: 0,
    todayLoans: 0,
    todayReturns: 0,
    totalMembers: 0,
    activeMembers: 0,
  });
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({
    loansByStatus: [],
    reservationsByStatus: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchDashboardData();
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [loansRes, reservationsRes, finesRes, membersRes] = await Promise.all([
        apiClient.getLoans(),
        apiClient.getReservations(),
        apiClient.getFines(),
        apiClient.getMembers(),
      ]);

      const loans = loansRes.data || [];
      const reservations = reservationsRes.data || [];
      const fines = finesRes.data || [];
      const members = membersRes.data || [];

      // Calculate stats
      const activeLoans = loans.filter((l: any) =>
        (l.Status?.toLowerCase() === 'borrowed' || l.status?.toLowerCase() === 'borrowed')
      ).length;

      const pendingReservations = reservations.filter((r: any) =>
        (r.Status?.toLowerCase() === 'active' || r.status?.toLowerCase() === 'active')
      ).length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueBooks = loans.filter((l: any) => {
        const status = (l.Status || l.status || '').toLowerCase();
        const dueDate = l.DueDate || l.dueDate;
        return status === 'borrowed' && dueDate && new Date(dueDate) < new Date();
      }).length;

      const todayLoans = loans.filter((l: any) => {
        const loanDate = new Date(l.LoanDate || l.loanDate);
        loanDate.setHours(0, 0, 0, 0);
        return loanDate.getTime() === today.getTime();
      }).length;

      const todayReturns = loans.filter((l: any) => {
        const returnDate = l.ReturnDate || l.returnDate;
        if (!returnDate) return false;
        const rd = new Date(returnDate);
        rd.setHours(0, 0, 0, 0);
        return rd.getTime() === today.getTime();
      }).length;

      const finesPending = fines
        .filter((f: any) => (f.Status?.toLowerCase() === 'unpaid' || f.status?.toLowerCase() === 'unpaid'))
        .reduce((sum: number, f: any) => sum + parseFloat(f.Amount || f.amount || 0), 0);

      const activeMembers = members.filter((m: any) =>
        (m.Status?.toLowerCase() === 'active' || m.status?.toLowerCase() === 'active')
      ).length;

      setStats({
        activeLoans,
        pendingReservations,
        overdueBooks,
        finesPending,
        todayLoans,
        todayReturns,
        totalMembers: members.length,
        activeMembers,
      });

      // Recent loans (last 5)
      const sortedLoans = [...loans].sort((a: any, b: any) => {
        const dateA = new Date(a.LoanDate || a.loanDate);
        const dateB = new Date(b.LoanDate || b.loanDate);
        return dateB.getTime() - dateA.getTime();
      });
      setRecentLoans(sortedLoans.slice(0, 5));

      // Recent reservations (last 5)
      const sortedReservations = [...reservations].sort((a: any, b: any) => {
        const dateA = new Date(a.ReservationDate || a.reservationDate);
        const dateB = new Date(b.ReservationDate || b.reservationDate);
        return dateB.getTime() - dateA.getTime();
      });
      setRecentReservations(sortedReservations.slice(0, 5));

      // Chart data - Loans by status
      const loanStatusMap: any = {};
      loans.forEach((l: any) => {
        const status = l.Status || l.status || 'Unknown';
        loanStatusMap[status] = (loanStatusMap[status] || 0) + 1;
      });
      const loansByStatus = Object.keys(loanStatusMap).map(status => ({
        name: status,
        value: loanStatusMap[status],
      }));

      // Chart data - Reservations by status
      const reservationStatusMap: any = {};
      reservations.forEach((r: any) => {
        const status = r.Status || r.status || 'Unknown';
        reservationStatusMap[status] = (reservationStatusMap[status] || 0) + 1;
      });
      const reservationsByStatus = Object.keys(reservationStatusMap).map(status => ({
        name: status,
        value: reservationStatusMap[status],
      }));

      setChartData({
        loansByStatus,
        reservationsByStatus,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', path: '/librarian/dashboard', icon: '📊' },
    { label: 'Manage Circulation', path: '/librarian/circulation', icon: '📖' },
    { label: 'Manage Reservations', path: '/librarian/reservations', icon: '📋' },
    { label: 'Manage Members', path: '/librarian/members', icon: '👥' },
    { label: 'Manage Fines', path: '/librarian/fines', icon: '💳' },
    { label: 'Reports', path: '/librarian/reports', icon: '📈' },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="flex">
          <Sidebar items={sidebarItems} />
          <main className="flex-1 p-6 md:ml-64">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-neutral-600">Loading dashboard data...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6 md:ml-64">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-h2 text-neutral-900 mb-2">Librarian Dashboard</h1>
              <p className="text-neutral-600">Welcome back, {user?.fullName || 'Librarian'}!</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Active Loans</p>
                    <p className="text-h4 text-neutral-900 font-bold">{stats.activeLoans}</p>
                    <p className="text-xs text-neutral-400 mt-1">Currently borrowed</p>
                  </div>
                  <div className="text-3xl">📖</div>
                </div>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Pending Reservations</p>
                    <p className="text-h4 text-neutral-900 font-bold">{stats.pendingReservations}</p>
                    <p className="text-xs text-neutral-400 mt-1">Awaiting fulfillment</p>
                  </div>
                  <div className="text-3xl">📋</div>
                </div>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Overdue Books</p>
                    <p className="text-h4 text-neutral-900 font-bold text-red-600">{stats.overdueBooks}</p>
                    <p className="text-xs text-neutral-400 mt-1">Require action</p>
                  </div>
                  <div className="text-3xl">⚠️</div>
                </div>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Fines Pending</p>
                    <p className="text-h4 text-neutral-900 font-bold">${stats.finesPending.toFixed(2)}</p>
                    <p className="text-xs text-neutral-400 mt-1">Unpaid fines</p>
                  </div>
                  <div className="text-3xl">💳</div>
                </div>
              </div>
            </div>

            {/* Today's Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h2 className="text-h5 text-neutral-900 mb-4">Today's Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📚</div>
                      <div>
                        <p className="font-semibold text-neutral-900">New Loans</p>
                        <p className="text-sm text-neutral-600">Books checked out today</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.todayLoans}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">✅</div>
                      <div>
                        <p className="font-semibold text-neutral-900">Returns</p>
                        <p className="text-sm text-neutral-600">Books returned today</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.todayReturns}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-h5 text-neutral-900 mb-4">Member Overview</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">👥</div>
                      <div>
                        <p className="font-semibold text-neutral-900">Total Members</p>
                        <p className="text-sm text-neutral-600">All registered members</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalMembers}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">✨</div>
                      <div>
                        <p className="font-semibold text-neutral-900">Active Members</p>
                        <p className="text-sm text-neutral-600">Currently active</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-teal-600">{stats.activeMembers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h2 className="text-h5 text-neutral-900 mb-6">Loans by Status</h2>
                {chartData.loansByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.loansByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.loansByStatus.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-neutral-500 py-12">No loan data available</p>
                )}
              </div>

              <div className="card">
                <h2 className="text-h5 text-neutral-900 mb-6">Reservations by Status</h2>
                {chartData.reservationsByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.reservationsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-neutral-500 py-12">No reservation data available</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card mb-8">
              <h2 className="text-h5 text-neutral-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/librarian/circulation')}
                  className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <span>📖</span>
                  Process Loan/Return
                </button>
                <button
                  onClick={() => navigate('/librarian/reservations')}
                  className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <span>📋</span>
                  Manage Reservations
                </button>
                <button
                  onClick={() => navigate('/librarian/fines')}
                  className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <span>💳</span>
                  Manage Fines
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="text-h5 text-neutral-900 mb-6">Recent Loans</h2>
                {recentLoans.length > 0 ? (
                  <div className="space-y-3">
                    {recentLoans.map((loan: any) => (
                      <div key={loan.LoanID || loan.loanID} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-neutral-900">
                            {loan.BookTitle || loan.bookTitle || 'Unknown Book'}
                          </p>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            (loan.Status || loan.status)?.toLowerCase() === 'borrowed'
                              ? 'bg-blue-100 text-blue-800'
                              : (loan.Status || loan.status)?.toLowerCase() === 'returned'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {loan.Status || loan.status}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Member: {loan.MemberName || loan.memberName || 'Unknown'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Loan Date: {new Date(loan.LoanDate || loan.loanDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-neutral-500 py-8">No recent loans</p>
                )}
              </div>

              <div className="card">
                <h2 className="text-h5 text-neutral-900 mb-6">Recent Reservations</h2>
                {recentReservations.length > 0 ? (
                  <div className="space-y-3">
                    {recentReservations.map((reservation: any) => (
                      <div key={reservation.ReservationID || reservation.reservationID} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-neutral-900">
                            {reservation.BookTitle || reservation.bookTitle || 'Unknown Book'}
                          </p>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            (reservation.Status || reservation.status)?.toLowerCase() === 'active'
                              ? 'bg-yellow-100 text-yellow-800'
                              : (reservation.Status || reservation.status)?.toLowerCase() === 'fulfilled'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {reservation.Status || reservation.status}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Member: {reservation.MemberName || reservation.memberName || 'Unknown'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Reserved: {new Date(reservation.ReservationDate || reservation.reservationDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-neutral-500 py-8">No recent reservations</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
