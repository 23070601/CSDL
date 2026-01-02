import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function LibrarianDashboard() {
  const sidebarItems = [
    { label: 'Dashboard', path: '/librarian/dashboard', icon: '📊' },
    { label: 'Manage Circulation', path: '/librarian/circulation', icon: '📖' },
    { label: 'Manage Reservations', path: '/librarian/reservations', icon: '📋' },
    { label: 'Manage Members', path: '/librarian/members', icon: '👥' },
    { label: 'Manage Fines', path: '/librarian/fines', icon: '💳' },
    { label: 'Reports', path: '/librarian/reports', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6 md:ml-64">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">Librarian Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Active Loans</p>
                    <p className="text-h4 text-neutral-900 font-bold">248</p>
                  </div>
                  <div className="text-3xl">📖</div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Pending Reservations</p>
                    <p className="text-h4 text-neutral-900 font-bold">34</p>
                  </div>
                  <div className="text-3xl">📋</div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Overdue Books</p>
                    <p className="text-h4 text-neutral-900 font-bold">12</p>
                  </div>
                  <div className="text-3xl">⚠️</div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Fines Pending</p>
                    <p className="text-h4 text-neutral-900 font-bold">$450</p>
                  </div>
                  <div className="text-3xl">💳</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-h5 text-neutral-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
                  Process Loan
                </button>
                <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
                  Process Return
                </button>
                <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
                  Manage Fines
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
