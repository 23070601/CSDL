import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/utils/api';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    pendingOrders: 0,
    activeLoans: 0,
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
      const booksRes = await apiClient.getBooks();
      const membersRes = await apiClient.getMembers();
      const ordersRes = await apiClient.getPurchaseOrders();
      const loansRes = await apiClient.getLoans();

      setStats({
        totalBooks: booksRes.data?.length || 0,
        totalMembers: membersRes.data?.length || 0,
        pendingOrders: ordersRes.data?.filter((o: any) => o.status === 'pending')?.length || 0,
        activeLoans: loansRes.data?.filter((l: any) => l.status === 'active')?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default values if API fails
      setStats({
        totalBooks: 0,
        totalMembers: 0,
        pendingOrders: 0,
        activeLoans: 0,
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="md:ml-64 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">Admin Dashboard</h1>

            {/* Stats Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card h-24 bg-gradient-to-r from-neutral-200 to-neutral-100 animate-pulse"></div>
                ))}
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Total Books</p>
                    <p className="text-h4 text-neutral-900 font-bold">{stats.totalBooks}</p>
                  </div>
                  <div className="text-3xl">📚</div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Total Members</p>
                    <p className="text-h4 text-neutral-900 font-bold">{stats.totalMembers}</p>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Pending Orders</p>
                    <p className="text-h4 text-neutral-900 font-bold">{stats.pendingOrders}</p>
                  </div>
                  <div className="text-3xl">📋</div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Active Loans</p>
                    <p className="text-h4 text-neutral-900 font-bold">{stats.activeLoans}</p>
                  </div>
                  <div className="text-3xl">📖</div>
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
            <div className="card mt-8">
              <h2 className="text-h5 text-neutral-900 mb-6">Recent Activity</h2>
              <p className="text-p4 text-neutral-600">
                Activity feed will be displayed here
              </p>
            </div>
          </div>
        </main>
    </div>
  );
}
