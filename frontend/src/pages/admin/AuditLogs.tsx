import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Input from '@/components/Input';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([
    { id: '1', user: 'admin@library.com', action: 'STAFF_CREATED', timestamp: '2024-01-15 10:30:00', details: 'New staff member: John Doe' },
    { id: '2', user: 'librarian@library.com', action: 'BOOK_UPDATED', timestamp: '2024-01-14 14:15:00', details: 'Updated inventory: The Great Gatsby' },
    { id: '3', user: 'admin@library.com', action: 'LOAN_PROCESSED', timestamp: '2024-01-13 09:45:00', details: 'Book loaned to member: Jane Smith' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filtered = logs.filter(l =>
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="md:ml-64 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">Audit Logs</h1>
            <div className="card mb-6">
              <Input label="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by user or action..." />
            </div>
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-6 py-4 text-left text-p5 font-semibold">User</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Action</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Timestamp</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <tr key={log.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-6 py-4 text-p4">{log.user}</td>
                      <td className="px-6 py-4 text-p4"><span className="inline-flex items-center px-2 py-1 rounded text-tag-sm font-semibold bg-primary-100 text-primary-700">{log.action}</span></td>
                      <td className="px-6 py-4 text-p4 text-neutral-600">{log.timestamp}</td>
                      <td className="px-6 py-4 text-p4 text-neutral-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
  );
}
