import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    pendingOrders: 0,
    activeLoans: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

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
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6 md:ml-64">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">Admin Dashboard</h1>

            {/* Stats Grid */}
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

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-h5 text-neutral-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
                  Add Staff
                </button>
                <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
                  Add Book
                </button>
                <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
                  New Order
                </button>
                <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
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
    </div>
  );
}
