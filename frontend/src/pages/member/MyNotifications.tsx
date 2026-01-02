import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function MyNotifications() {
  const sidebarItems = [
    { label: 'Dashboard', path: '/member/dashboard', icon: '📊' },
    { label: 'Search Books', path: '/member/books', icon: '📚' },
    { label: 'My Loans', path: '/member/loans', icon: '📖' },
    { label: 'My Fines', path: '/member/fines', icon: '💳' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6 md:ml-64">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">My Notifications</h1>
            <div className="card">
              <p className="text-p4 text-neutral-600">Notifications interface coming soon...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
