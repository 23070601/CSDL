import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function MemberDashboard() {
  const sidebarItems = [
    { label: 'Dashboard', path: '/member/dashboard', icon: '📊' },
    { label: 'Search Books', path: '/member/books', icon: '📚' },
    { label: 'My Profile', path: '/member/profile', icon: '👤' },
    { label: 'My Loans', path: '/member/loans', icon: '📖' },
    { label: 'My Reservations', path: '/member/reservations', icon: '📋' },
    { label: 'My Fines', path: '/member/fines', icon: '💳' },
    { label: 'Notifications', path: '/member/notifications', icon: '🔔' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="p-6 md:ml-64">
        <div className="max-w-6xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">Welcome to Your Library</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Active Loans</p>
                    <p className="text-h4 text-neutral-900 font-bold">3</p>
                  </div>
                  <div className="text-3xl">📖</div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Reservations</p>
                    <p className="text-h4 text-neutral-900 font-bold">2</p>
                  </div>
                  <div className="text-3xl">📋</div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-p5 text-neutral-500 mb-2">Fines Owed</p>
                    <p className="text-h4 text-neutral-900 font-bold">$0</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-h5 text-neutral-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
                  Search Books
                </button>
                <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
                  View My Loans
                </button>
                <button className="p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
                  Pay Fines
                </button>
              </div>
            </div>

            {/* Recent Loans */}
            <div className="card mt-8">
              <h2 className="text-h5 text-neutral-900 mb-6">Recent Loans</h2>
              <p className="text-p4 text-neutral-600">
                You have not borrowed any books yet. <a href="/member/books" className="text-primary-600 font-semibold">Browse our collection</a>.
              </p>
            </div>
          </div>
        </main>
    </div>
  );
}
