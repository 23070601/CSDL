import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import RecentActivity from '@/components/RecentActivity';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/utils/api';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    pendingOrders: 0,
    activeLoans: 0,
    overdueLoans: 0,
    availableBooks: 0,
  });
  const [chartData, setChartData] = useState<any>({
    loansByStatus: [],
    booksByCategory: [],
    membersByType: [],
    monthlyActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchDashboardStats();
    }
  }, [user, navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [booksRes, membersRes, ordersRes, loansRes] = await Promise.all([
        apiClient.getBooks(),
        apiClient.getMembers(),
        apiClient.getPurchaseOrders(),
        apiClient.getLoans(),
      ]);

      const books = booksRes.data || [];
      const members = membersRes.data || [];
      const orders = ordersRes.data || [];
      const loans = loansRes.data || [];

      // Calculate stats
      const totalBooks = books.length;
      const availableBooks = books.filter((b: any) => 
        (b.availableCopies || b.AvailableCopies || 0) > 0
      ).length;

      const pendingOrders = orders.filter((o: any) =>
        (o.Status?.toLowerCase() === 'pending' || o.status?.toLowerCase() === 'pending')
      ).length;

      const activeLoans = loans.filter((l: any) =>
        (l.Status?.toLowerCase() === 'borrowed' || l.status?.toLowerCase() === 'borrowed')
      ).length;

      const overdueLoans = loans.filter((l: any) => {
        const status = (l.Status || l.status || '').toLowerCase();
        const dueDate = l.DueDate || l.dueDate;
        return status === 'borrowed' && dueDate && new Date(dueDate) < new Date();
      }).length;

      setStats({
        totalBooks,
        totalMembers: members.length,
        pendingOrders,
        activeLoans,
        overdueLoans,
        availableBooks,
      });

      // Prepare chart data
      // Loans by status
      const loanStatusMap: any = {};
      loans.forEach((l: any) => {
        const status = l.Status || l.status || 'Unknown';
        loanStatusMap[status] = (loanStatusMap[status] || 0) + 1;
      });
      const loansByStatus = Object.keys(loanStatusMap).map(status => ({
        name: status,
        value: loanStatusMap[status],
      }));

      // Members by type
      const memberTypeMap: any = {};
      members.forEach((m: any) => {
        const type = m.MemberType || m.memberType || 'Standard';
        memberTypeMap[type] = (memberTypeMap[type] || 0) + 1;
      });
      const membersByType = Object.keys(memberTypeMap).map(type => ({
        name: type,
        value: memberTypeMap[type],
      }));

      // Monthly activity (mock data for last 6 months)
      const monthlyActivity = [
        { month: 'Jul', loans: Math.floor(loans.length * 0.7), returns: Math.floor(loans.length * 0.6) },
        { month: 'Aug', loans: Math.floor(loans.length * 0.75), returns: Math.floor(loans.length * 0.65) },
        { month: 'Sep', loans: Math.floor(loans.length * 0.8), returns: Math.floor(loans.length * 0.7) },
        { month: 'Oct', loans: Math.floor(loans.length * 0.85), returns: Math.floor(loans.length * 0.75) },
        { month: 'Nov', loans: Math.floor(loans.length * 0.9), returns: Math.floor(loans.length * 0.8) },
        { month: 'Dec', loans: loans.length, returns: Math.floor(loans.length * 0.85) },
      ];

      setChartData({
        loansByStatus,
        membersByType,
        monthlyActivity,
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({
        totalBooks: 0,
        totalMembers: 0,
        pendingOrders: 0,
        activeLoans: 0,
        overdueLoans: 0,
        availableBooks: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Manage Staff', path: '/admin/staff', icon: '👥' },
    { label: 'Manage Books', path: '/admin/books', icon: '📚' },
    { label: 'Manage Suppliers', path: '/admin/suppliers', icon: '🏢' },
    { label: 'Manage Orders', path: '/admin/purchase-orders', icon: '📋' },
    { label: 'Reports', path: '/admin/reports', icon: '📈' },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: '📝' },
    { label: 'System Config', path: '/admin/config', icon: '⚙️' },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="md:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">Admin Dashboard</h1>

            {/* Stats Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card h-24 bg-gradient-to-r from-neutral-200 to-neutral-100 animate-pulse"></div>
                ))}
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-blue-700 mb-2 font-semibold">Total Books</p>
                    <p className="text-h3 text-blue-900 font-bold">{stats.totalBooks}</p>
                    <p className="text-p6 text-blue-600 mt-1">{stats.availableBooks} available</p>
                  </div>
                  <div className="text-4xl">📚</div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-green-700 mb-2 font-semibold">Total Members</p>
                    <p className="text-h3 text-green-900 font-bold">{stats.totalMembers}</p>
                    <p className="text-p6 text-green-600 mt-1">Active users</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-yellow-700 mb-2 font-semibold">Pending Orders</p>
                    <p className="text-h3 text-yellow-900 font-bold">{stats.pendingOrders}</p>
                    <p className="text-p6 text-yellow-600 mt-1">Awaiting processing</p>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-purple-700 mb-2 font-semibold">Active Loans</p>
                    <p className="text-h3 text-purple-900 font-bold">{stats.activeLoans}</p>
                    <p className="text-p6 text-purple-600 mt-1">Currently borrowed</p>
                  </div>
                  <div className="text-4xl">📖</div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-red-700 mb-2 font-semibold">Overdue Loans</p>
                    <p className="text-h3 text-red-900 font-bold">{stats.overdueLoans}</p>
                    <p className="text-p6 text-red-600 mt-1">Require attention</p>
                  </div>
                  <div className="text-4xl">⚠️</div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 border-l-4 border-indigo-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-indigo-700 mb-2 font-semibold">Collection Rate</p>
                    <p className="text-h3 text-indigo-900 font-bold">
                      {stats.totalBooks > 0 ? Math.round((stats.availableBooks / stats.totalBooks) * 100) : 0}%
                    </p>
                    <p className="text-p6 text-indigo-600 mt-1">Available now</p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>
            </div>
            )}

            {/* Charts Section */}
            {!loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Monthly Activity Chart */}
                <div className="card">
                  <h2 className="text-h5 text-neutral-900 mb-6">Monthly Loan Activity</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.monthlyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="loans" stroke="#3B82F6" strokeWidth={2} name="Loans" />
                      <Line type="monotone" dataKey="returns" stroke="#10B981" strokeWidth={2} name="Returns" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Loans by Status Chart */}
                <div className="card">
                  <h2 className="text-h5 text-neutral-900 mb-6">Loans by Status</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.loansByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.loansByStatus.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Member Distribution Chart */}
                <div className="card">
                  <h2 className="text-h5 text-neutral-900 mb-6">Member Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.membersByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3B82F6" name="Members" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Quick Stats Summary */}
                <div className="card">
                  <h2 className="text-h5 text-neutral-900 mb-6">Quick Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-neutral-50 rounded">
                      <span className="text-p4 text-neutral-700">Books in Circulation</span>
                      <span className="text-p3 font-bold text-neutral-900">{stats.activeLoans}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-neutral-50 rounded">
                      <span className="text-p4 text-neutral-700">Available Inventory</span>
                      <span className="text-p3 font-bold text-neutral-900">{stats.availableBooks}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-neutral-50 rounded">
                      <span className="text-p4 text-neutral-700">Pending Acquisitions</span>
                      <span className="text-p3 font-bold text-neutral-900">{stats.pendingOrders}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span className="text-p4 text-red-700">Overdue Items</span>
                      <span className="text-p3 font-bold text-red-900">{stats.overdueLoans}</span>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <p className="text-p5 text-blue-900 font-semibold mb-1">System Health</p>
                      <p className="text-p6 text-blue-700">
                        {stats.overdueLoans === 0 ? '✅ All loans are on schedule' : `⚠️ ${stats.overdueLoans} item(s) require follow-up`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-h5 text-neutral-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/admin/staff')}
                  className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
                >
                  Add Staff
                </button>
                <button 
                  onClick={() => navigate('/admin/books')}
                  className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
                >
                  Add Book
                </button>
                <button 
                  onClick={() => navigate('/admin/purchase-orders')}
                  className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
                >
                  New Order
                </button>
                <button 
                  onClick={() => navigate('/admin/reports')}
                  className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
                >
                  View Reports
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <RecentActivity />
            </div>
          </div>
        </main>
    </div>
  );
}
