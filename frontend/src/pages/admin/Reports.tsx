import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function Reports() {
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
            <h1 className="text-h2 text-neutral-900 mb-2">Reports</h1>
            <p className="text-p4 text-neutral-600 mb-8">Access and generate detailed reports about library operations</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Books Statistics',
                  description: 'View total books, available copies, and top categories',
                  icon: '📚',
                  color: 'bg-blue-50 border-blue-200',
                },
                {
                  title: 'Member Activity',
                  description: 'Track member registrations, active members, and loan history',
                  icon: '👥',
                  color: 'bg-green-50 border-green-200',
                },
                {
                  title: 'Financial Report',
                  description: 'Analyze fines collected, pending payments, and revenue trends',
                  icon: '💰',
                  color: 'bg-purple-50 border-purple-200',
                },
                {
                  title: 'Staff Performance',
                  description: 'Monitor staff activities, processed transactions, and efficiency metrics',
                  icon: '📊',
                  color: 'bg-orange-50 border-orange-200',
                },
              ].map((report, idx) => (
                <div
                  key={idx}
                  className={`card border-2 cursor-pointer hover:shadow-md transition-shadow ${report.color}`}
                >
                  <div className="text-4xl mb-4">{report.icon}</div>
                  <h3 className="text-h3 text-neutral-900 mb-2">{report.title}</h3>
                  <p className="text-p4 text-neutral-600 mb-6">{report.description}</p>
                  <button className="text-primary-600 font-semibold hover:underline">Generate Report →</button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
  );
}
