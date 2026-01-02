import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Input from '@/components/Input';
import { apiClient } from '@/utils/api';

interface Order {
  id?: string;
  supplier?: string;
  amount?: number;
  date?: string;
  status?: 'pending' | 'approved' | 'received';
  POID?: string;
  SupplierName?: string;
  OrderDate?: string;
  ExpectedDate?: string;
  Status?: string;
}

export default function ManagePurchaseOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPurchaseOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
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

  const filtered = orders.filter(o => (o.supplier || o.SupplierName || '').toLowerCase().includes(searchTerm.toLowerCase()));

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
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                        Loading orders...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((o) => (
                      <tr key={o.id || o.POID} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-6 py-4 text-p4">{o.id || o.POID}</td>
                        <td className="px-6 py-4 text-p4">{o.supplier || o.SupplierName}</td>
                        <td className="px-6 py-4 text-p4 font-semibold">${(o.amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-p4">{o.date ? new Date(o.date).toLocaleDateString() : new Date(o.OrderDate || '').toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-p4"><span className={`inline-flex items-center px-2 py-1 rounded text-tag-sm font-semibold ${
                          (o.status || o.Status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                          (o.status || o.Status || '').toLowerCase() === 'approved' || (o.status || o.Status || '').toLowerCase() === 'processing' ? 'bg-primary-100 text-primary-700' : 
                          'bg-status-success-bg text-status-success'
                        }`}>{o.status || o.Status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
  );
}
