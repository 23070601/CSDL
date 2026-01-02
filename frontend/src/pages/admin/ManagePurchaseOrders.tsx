import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Input from '@/components/Input';

interface Order {
  id: string;
  supplier: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'received';
}

export default function ManagePurchaseOrders() {
  const [orders, setOrders] = useState<Order[]>([
    { id: '1', supplier: 'ABC Publisher', amount: 5000, date: '2024-01-10', status: 'approved' },
    { id: '2', supplier: 'XYZ Books', amount: 3000, date: '2024-01-12', status: 'pending' },
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

  const filtered = orders.filter(o => o.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Sidebar items={sidebarItems} />
      <main className="md:ml-64 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-h2 text-neutral-900 mb-8">Manage Purchase Orders</h1>
            <div className="card mb-6">
              <Input label="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search orders..." />
            </div>
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Order ID</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Supplier</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-p5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-6 py-4 text-p4">{o.id}</td>
                      <td className="px-6 py-4 text-p4">{o.supplier}</td>
                      <td className="px-6 py-4 text-p4 font-semibold">${o.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-p4">{new Date(o.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-p4"><span className={`inline-flex items-center px-2 py-1 rounded text-tag-sm font-semibold ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : o.status === 'approved' ? 'bg-primary-100 text-primary-700' : 'bg-status-success-bg text-status-success'}`}>{o.status}</span></td>
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
